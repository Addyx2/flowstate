"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { recordAudit } from "@/lib/audit";
import { removeMembership, reportMembership } from "@/lib/aultrum-id";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { issuePasswordLink } from "@/lib/password";
import { absoluteUrl } from "@/lib/url";

export interface OrgState {
  error?: string;
  ok?: string;
  url?: string;
}

const PATH = "/account/organisation";
const roleSchema = z.enum(["ADMIN", "COORDINATOR"]);

async function activeAdmins(agencyId: string) {
  return prisma.user.count({ where: { agencyId, role: "ADMIN", deactivatedAt: null } });
}

export async function renameOrganisation(_prev: OrgState, formData: FormData): Promise<OrgState> {
  const user = await requireAdmin();
  const name = z.string().trim().min(2, "Enter the organisation's name").max(80).safeParse(formData.get("name"));
  if (!name.success) return { error: name.error.issues[0]?.message };
  await prisma.agency.update({ where: { id: user.agencyId }, data: { name: name.data } });
  await recordAudit(user, { action: "agency.rename", summary: `Renamed the organisation to ${name.data}`, targetType: "Agency", targetId: user.agencyId });
  revalidatePath("/", "layout");
  return { ok: "Saved." };
}

const memberSchema = z.object({
  name: z.string().trim().min(2, "Enter their name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  role: roleSchema,
});

/** Adds a coordinator or admin, and returns a one-time link for them to set a password. */
export async function addMember(_prev: OrgState, formData: FormData): Promise<OrgState> {
  const admin = await requireAdmin();
  const parsed = memberSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: existing.agencyId === admin.agencyId ? "They're already in your organisation." : "That email already has a Flowstate account." };
  const user = await prisma.user.create({ data: { ...parsed.data, agencyId: admin.agencyId } });
  const token = await issuePasswordLink(user.id);
  await recordAudit(admin, { action: "user.add", summary: `Added ${user.name} (${user.email}) as ${user.role.toLowerCase()}`, targetType: "User", targetId: user.id });
  revalidatePath(PATH);
  return { ok: `${user.name} added. Send them this link to set a password:`, url: await absoluteUrl(`/login/set-password?token=${token}`) };
}

/** A fresh set-password link, e.g. if the first one expired or was lost. */
export async function passwordLinkFor(_prev: OrgState, formData: FormData): Promise<OrgState> {
  const admin = await requireAdmin();
  const user = await prisma.user.findFirst({ where: { id: String(formData.get("userId") ?? ""), agencyId: admin.agencyId, deactivatedAt: null } });
  if (!user) return { error: "Not found" };
  const token = await issuePasswordLink(user.id);
  await recordAudit(admin, { action: "user.password_link", summary: `Made a set-password link for ${user.name}`, targetType: "User", targetId: user.id });
  return { ok: "Valid for 72 hours, once.", url: await absoluteUrl(`/login/set-password?token=${token}`) };
}

export async function changeRole(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const role = roleSchema.safeParse(formData.get("role"));
  const user = await prisma.user.findFirst({ where: { id: String(formData.get("userId") ?? ""), agencyId: admin.agencyId } });
  if (!role.success || !user || user.role === role.data) return;
  // Never leave the organisation without an admin.
  if (user.role === "ADMIN" && !user.deactivatedAt && (await activeAdmins(admin.agencyId)) <= 1) return;
  await prisma.user.update({ where: { id: user.id }, data: { role: role.data, sessionVersion: { increment: 1 } } });
  if (user.aultrumSub) await reportMembership(user.aultrumSub, { id: admin.agencyId, name: admin.agency.name }, role.data);
  await recordAudit(admin, { action: "user.role", summary: `${user.name} is now ${role.data.toLowerCase()}`, targetType: "User", targetId: user.id });
  revalidatePath(PATH);
}

export async function setActive(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const active = formData.get("active") === "yes";
  const user = await prisma.user.findFirst({ where: { id: String(formData.get("userId") ?? ""), agencyId: admin.agencyId, role: { not: "CARER" } } });
  if (!user || user.id === admin.id) return;
  if (!active) {
    if (user.deactivatedAt) return;
    if (user.role === "ADMIN" && (await activeAdmins(admin.agencyId)) <= 1) return;
    await prisma.user.update({ where: { id: user.id }, data: { deactivatedAt: new Date(), sessionVersion: { increment: 1 }, passwordTokenHash: null, passwordTokenExpAt: null } });
    if (user.aultrumSub) await removeMembership(user.aultrumSub, admin.agencyId);
    await recordAudit(admin, { action: "user.deactivate", summary: `Removed ${user.name}'s access`, targetType: "User", targetId: user.id });
  } else {
    if (!user.deactivatedAt) return;
    await prisma.user.update({ where: { id: user.id }, data: { deactivatedAt: null } });
    if (user.aultrumSub) await reportMembership(user.aultrumSub, { id: admin.agencyId, name: admin.agency.name }, user.role);
    await recordAudit(admin, { action: "user.reactivate", summary: `Restored ${user.name}'s access`, targetType: "User", targetId: user.id });
  }
  revalidatePath(PATH);
}
