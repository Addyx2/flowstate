"use server";

import { revalidatePath } from "next/cache";

import { executeAction } from "@/lib/assist";
import { recordAudit } from "@/lib/audit";
import { requireOffice } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** The coordinator confirms or declines a change Assist proposed. */
export async function decideProposal(id: string, approve: boolean): Promise<{ ok: boolean; message: string }> {
  const user = await requireOffice();
  // Only the person Assist proposed it to, only once.
  const action = await prisma.assistAction.findFirst({ where: { id, agencyId: user.agencyId, userId: user.id, status: "PROPOSED" } });
  if (!action) return { ok: false, message: "That proposal has already been handled." };
  if (!approve) {
    await prisma.assistAction.update({ where: { id }, data: { status: "DECLINED" } });
    return { ok: true, message: "Declined. Nothing changed." };
  }
  const result = await executeAction(user.agencyId, user.id, action.tool, action.input as Record<string, unknown>);
  await prisma.assistAction.update({ where: { id }, data: { status: result.ok ? "DONE" : "FAILED", result: result.ok ? result.message : result.error } });
  if (result.ok) {
    await recordAudit(user, { action: `assist.${action.tool.replace("propose_", "")}`, summary: `Assist: ${result.message}`, targetType: "AssistAction", targetId: id });
    for (const p of ["/watchboard", "/shifts/open", "/shifts/manage", "/shifts/requests", "/persona/qualifiers"]) revalidatePath(p);
  }
  return { ok: result.ok, message: result.ok ? result.message : result.error };
}
