import type { User } from "@prisma/client";

import { recordAudit } from "@/lib/audit";
import { reportMembership } from "@/lib/aultrum-id";
import { setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** Signs a linked user in after Aultrum ID, and tells Workspace where they belong. */
export async function signInWithAultrum(user: User, sub: string, how: "aultrum" | "aultrum_link"): Promise<string> {
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date(), failedLoginCount: 0, lockedUntil: null, aultrumSub: sub } });
  await recordAudit(user, {
    action: how === "aultrum_link" ? "auth.aultrum_link" : "auth.login",
    summary: how === "aultrum_link" ? "Linked Aultrum ID and signed in" : "Signed in with Aultrum ID",
    targetType: "User",
    targetId: user.id,
  });
  await setSessionCookie(user);
  const agency = await prisma.agency.findUnique({ where: { id: user.agencyId }, select: { id: true, name: true } });
  if (agency) await reportMembership(sub, agency, user.role);
  return "/watchboard";
}
