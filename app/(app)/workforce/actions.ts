"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { recordAudit } from "@/lib/audit";
import { requireOffice } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { geocodePostcode } from "@/lib/geo";

export interface FormState {
  error?: string;
  ok?: string;
}

const text = (max = 120) => z.string().trim().max(max);
const optional = (max = 120) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

function refresh() {
  for (const p of ["/workforce/directory", "/workforce/onboarding", "/workforce/teams", "/watchboard", "/persona/qualifiers"]) revalidatePath(p);
}

const carerSchema = z.object({
  firstName: text(60).min(1, "Enter a first name"),
  lastName: text(60).min(1, "Enter a last name"),
  email: optional(120).refine((v) => !v || z.string().email().safeParse(v).success, "Enter a valid email"),
  phone: optional(30),
  jobTitle: optional(60),
  postcode: optional(10),
});

export async function createCarer(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireOffice();
  const parsed = carerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const coords = await geocodePostcode(parsed.data.postcode);
  const carer = await prisma.carer.create({ data: { ...parsed.data, agencyId: user.agencyId, status: "ONBOARDING", lat: coords?.lat, lng: coords?.lng } });
  await recordAudit(user, { action: "carer.create", summary: `Added ${carer.firstName} ${carer.lastName} to onboarding`, targetType: "Carer", targetId: carer.id });
  refresh();
  return { ok: `${carer.firstName} added to onboarding.` };
}

const checkSchema = z.object({
  carerId: z.string().min(1),
  kind: z.enum(["DBS", "RIGHT_TO_WORK", "TRAINING", "REFERENCE"]),
  name: text(80).min(1, "Name the check"),
  reference: optional(60),
  expiresAt: optional(10).transform((v) => (v ? new Date(`${v}T00:00:00`) : null)),
});

export async function addCheck(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireOffice();
  const parsed = checkSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const carer = await prisma.carer.findFirst({ where: { id: parsed.data.carerId, agencyId: user.agencyId } });
  if (!carer) return { error: "Carer not found" };
  const { carerId, ...data } = parsed.data;
  await prisma.check.create({ data: { ...data, carerId, verifiedAt: new Date() } });
  await recordAudit(user, { action: "check.add", summary: `Recorded ${data.name} for ${carer.firstName} ${carer.lastName}`, targetType: "Carer", targetId: carer.id });
  refresh();
  return { ok: "Check recorded." };
}

export async function setCarerStatus(formData: FormData): Promise<void> {
  const user = await requireOffice();
  const id = String(formData.get("carerId") ?? "");
  const status = z.enum(["ONBOARDING", "ACTIVE", "INACTIVE"]).parse(formData.get("status"));
  const carer = await prisma.carer.findFirst({ where: { id, agencyId: user.agencyId } });
  if (!carer) return;
  await prisma.carer.update({ where: { id }, data: { status } });
  await recordAudit(user, { action: "carer.status", summary: `${carer.firstName} ${carer.lastName} is now ${status.toLowerCase()}`, targetType: "Carer", targetId: id });
  refresh();
}

const packageSchema = z.object({
  kind: z.enum(["CARE_RECEIVER", "CARE_HOME"]),
  name: text(60).min(1, "Give the Package a short name"),
  address: optional(200),
  postcode: optional(10),
  accessInstructions: optional(300),
  fundingBody: optional(80),
  hourlyRate: optional(10).transform((v) => (v ? Number(v) : null)).refine((v) => v === null || (Number.isFinite(v) && v >= 0), "Enter a rate in pounds"),
});

export async function createPackage(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireOffice();
  const parsed = packageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const coords = await geocodePostcode(parsed.data.postcode);
  const pkg = await prisma.package.create({ data: { ...parsed.data, agencyId: user.agencyId, lat: coords?.lat, lng: coords?.lng } });
  await recordAudit(user, { action: "package.create", summary: `Created Package ${pkg.name}`, targetType: "Package", targetId: pkg.id });
  refresh();
  redirect(`/workforce/teams/${pkg.id}`);
}

async function ownPackage(agencyId: string, id: string) {
  return prisma.package.findFirst({ where: { id, agencyId } });
}

export async function addTeamMember(formData: FormData): Promise<void> {
  const user = await requireOffice();
  const packageId = String(formData.get("packageId") ?? "");
  const carerId = String(formData.get("carerId") ?? "");
  const pkg = await ownPackage(user.agencyId, packageId);
  const carer = await prisma.carer.findFirst({ where: { id: carerId, agencyId: user.agencyId } });
  if (!pkg || !carer) return;
  await prisma.teamMember.upsert({ where: { packageId_carerId: { packageId, carerId } }, create: { packageId, carerId }, update: {} });
  await recordAudit(user, { action: "team.add", summary: `Added ${carer.firstName} ${carer.lastName} to ${pkg.name}'s team`, targetType: "Package", targetId: pkg.id });
  refresh();
  revalidatePath(`/workforce/teams/${packageId}`);
}

export async function removeTeamMember(formData: FormData): Promise<void> {
  const user = await requireOffice();
  const id = String(formData.get("memberId") ?? "");
  const member = await prisma.teamMember.findFirst({ where: { id, package: { agencyId: user.agencyId } }, include: { carer: true, package: true } });
  if (!member) return;
  await prisma.teamMember.delete({ where: { id } });
  await recordAudit(user, { action: "team.remove", summary: `Removed ${member.carer.firstName} ${member.carer.lastName} from ${member.package.name}'s team`, targetType: "Package", targetId: member.packageId });
  refresh();
  revalidatePath(`/workforce/teams/${member.packageId}`);
}

export async function setPrimary(formData: FormData): Promise<void> {
  const user = await requireOffice();
  const id = String(formData.get("memberId") ?? "");
  const member = await prisma.teamMember.findFirst({ where: { id, package: { agencyId: user.agencyId } } });
  if (!member) return;
  await prisma.$transaction([
    prisma.teamMember.updateMany({ where: { packageId: member.packageId }, data: { primary: false } }),
    prisma.teamMember.update({ where: { id }, data: { primary: true } }),
  ]);
  revalidatePath(`/workforce/teams/${member.packageId}`);
}

const keyPersonSchema = z.object({
  packageId: z.string().min(1),
  name: text(80).min(1, "Enter a name"),
  relationship: optional(40),
  email: optional(120),
  phone: optional(30),
});

export async function addKeyPerson(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireOffice();
  const parsed = keyPersonSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const pkg = await ownPackage(user.agencyId, parsed.data.packageId);
  if (!pkg) return { error: "Package not found" };
  const kp = await prisma.keyPerson.create({ data: parsed.data });
  await recordAudit(user, { action: "keyperson.add", summary: `Added ${kp.name} as a key person for ${pkg.name}`, targetType: "Package", targetId: pkg.id });
  revalidatePath(`/workforce/teams/${pkg.id}`);
  return { ok: `${kp.name} added.` };
}

const feedbackSchema = z.object({
  packageId: z.string().min(1),
  carerId: z.string().min(1),
  kind: z.enum(["COORDINATOR_FEEDBACK", "COMPLAINT", "CHANGE_CARER_ASKED"]),
  positive: z.enum(["yes", "no"]).optional(),
  note: optional(200),
});

/** A coordinator records feedback on a pairing: a Rapport signal (D17). */
export async function recordFeedback(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireOffice();
  const parsed = feedbackSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const pkg = await ownPackage(user.agencyId, parsed.data.packageId);
  const carer = await prisma.carer.findFirst({ where: { id: parsed.data.carerId, agencyId: user.agencyId } });
  if (!pkg || !carer) return { error: "Not found" };
  await prisma.signal.create({
    data: {
      agencyId: user.agencyId,
      kind: parsed.data.kind,
      carerId: carer.id,
      packageId: pkg.id,
      value: parsed.data.kind === "COORDINATOR_FEEDBACK" ? (parsed.data.positive === "no" ? -1 : 1) : null,
      note: parsed.data.note,
    },
  });
  await recordAudit(user, { action: "signal.feedback", summary: `Recorded ${parsed.data.kind.toLowerCase().replaceAll("_", " ")} for ${carer.firstName} on ${pkg.name}`, targetType: "Package", targetId: pkg.id });
  refresh();
  revalidatePath(`/workforce/teams/${pkg.id}`);
  return { ok: "Recorded." };
}
