"use server";

import { revalidatePath } from "next/cache";

import { recordAudit } from "@/lib/audit";
import { createAultrumLink } from "@/lib/aultrum-id";
import { requireAdmin, requireOffice } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createLink } from "@/lib/links";
import { absoluteUrl } from "@/lib/url";

export interface LinkState {
  error?: string;
  url?: string;
  ok?: string;
}

/** A praise link for one key person of a Package. */
export async function createPraiseLink(_prev: LinkState, formData: FormData): Promise<LinkState> {
  const user = await requireOffice();
  const keyPersonId = String(formData.get("keyPersonId") ?? "");
  const kp = await prisma.keyPerson.findFirst({ where: { id: keyPersonId, package: { agencyId: user.agencyId } }, include: { package: true } });
  if (!kp) return { error: "Key person not found" };
  const { token, id } = await createLink({
    agencyId: user.agencyId,
    kind: "PRAISE",
    purpose: `Praise from ${kp.name} for ${kp.package.name}'s team`,
    createdById: user.id,
    packageId: kp.packageId,
    keyPersonId: kp.id,
  });
  await recordAudit(user, { action: "link.create", summary: `Praise link for ${kp.name} (${kp.package.name})`, targetType: "Link", targetId: id });
  revalidatePath("/account/links");
  return { url: await absoluteUrl(`/l/${token}`) };
}

/** A shift-request link to send to an agency for one open shift. */
export async function createShiftRequestLink(_prev: LinkState, formData: FormData): Promise<LinkState> {
  const user = await requireOffice();
  const shiftId = String(formData.get("shiftId") ?? "");
  const to = String(formData.get("to") ?? "").trim().slice(0, 80);
  const shift = await prisma.shift.findFirst({ where: { id: shiftId, agencyId: user.agencyId, status: "OPEN" }, include: { package: true } });
  if (!shift) return { error: "That shift isn't open any more." };
  const { token, id } = await createLink({
    agencyId: user.agencyId,
    kind: "SHIFT_REQUEST",
    purpose: `Cover request${to ? ` to ${to}` : ""} for a shift at ${shift.package.name}`,
    createdById: user.id,
    shiftId: shift.id,
  });
  await recordAudit(user, { action: "link.create", summary: `Shift-request link${to ? ` for ${to}` : ""}`, targetType: "Link", targetId: id });
  revalidatePath("/account/links");
  return { url: await absoluteUrl(`/l/${token}`) };
}

/** An Aultrum Link inviting a carer to join the agency in the Aultrum carer app. */
export async function createCarerInvite(_prev: LinkState, formData: FormData): Promise<LinkState> {
  const user = await requireOffice();
  const carerId = String(formData.get("carerId") ?? "");
  const carer = await prisma.carer.findFirst({ where: { id: carerId, agencyId: user.agencyId } });
  if (!carer) return { error: "Carer not found" };
  try {
    const link = await createAultrumLink({ id: user.agencyId, name: user.agency.name }, carer);
    const { id } = await createLink({
      agencyId: user.agencyId,
      kind: "CARER_INVITE",
      purpose: `Invite ${carer.firstName} ${carer.lastName} to the Aultrum carer app (code ${link.code})`,
      createdById: user.id,
      carerId: carer.id,
      token: link.code,
      days: Math.max(1, Math.round((new Date(link.expiresAt).getTime() - Date.now()) / 86_400_000)),
    });
    await recordAudit(user, { action: "link.create", summary: `Carer-app invite for ${carer.firstName} ${carer.lastName}`, targetType: "Link", targetId: id });
    revalidatePath("/account/links");
    return { url: link.url, ok: `Code ${link.code}` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Couldn't make the invite." };
  }
}

export async function revokeLink(formData: FormData): Promise<void> {
  const user = await requireAdmin();
  const id = String(formData.get("linkId") ?? "");
  const link = await prisma.link.findFirst({ where: { id, agencyId: user.agencyId, revokedAt: null } });
  if (!link) return;
  await prisma.link.update({ where: { id }, data: { revokedAt: new Date() } });
  await recordAudit(user, { action: "link.revoke", summary: `Revoked: ${link.purpose}`, targetType: "Link", targetId: id });
  revalidatePath("/account/links");
}

