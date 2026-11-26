"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { FormState } from "@/components/ActionForm";
import { recordAudit } from "@/lib/audit";
import { requireOffice } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { startOfWeek } from "@/lib/format";
import { bookShift, cancelShift, createShift, decideRequest, generateFromRota, unassignShift, type Result } from "@/lib/shifts";

function refresh() {
  for (const p of ["/shifts/rotas", "/shifts/open", "/shifts/manage", "/shifts/requests", "/watchboard", "/persona/qualifiers", "/workforce/teams"]) revalidatePath(p, "layout");
}

async function done(user: Awaited<ReturnType<typeof requireOffice>>, action: string, result: Result, targetId?: string): Promise<FormState> {
  if (!result.ok) return { error: result.error };
  await recordAudit(user, { action, summary: result.message, targetType: "Shift", targetId });
  refresh();
  return { ok: result.message };
}

export async function bookAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireOffice();
  const shiftId = String(formData.get("shiftId") ?? "");
  return done(user, "shift.book", await bookShift(user.agencyId, shiftId, String(formData.get("carerId") ?? "")), shiftId);
}

export async function unassignAction(formData: FormData): Promise<void> {
  const user = await requireOffice();
  const shiftId = String(formData.get("shiftId") ?? "");
  await done(user, "shift.unassign", await unassignShift(user.agencyId, shiftId), shiftId);
}

export async function cancelAction(formData: FormData): Promise<void> {
  const user = await requireOffice();
  const shiftId = String(formData.get("shiftId") ?? "");
  const by = z.enum(["AGENCY", "CLIENT", "CARER"]).catch("AGENCY").parse(formData.get("by"));
  await done(user, "shift.cancel", await cancelShift(user.agencyId, shiftId, by), shiftId);
}

const newShift = z.object({
  packageId: z.string().min(1, "Choose a Package"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date"),
  start: z.string().regex(/^\d{2}:\d{2}$/, "Enter a start time"),
  end: z.string().regex(/^\d{2}:\d{2}$/, "Enter an end time"),
  jobRoleId: z.string().optional(),
  carerId: z.string().optional(),
});

export async function createShiftAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireOffice();
  const parsed = newShift.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { date, start, end, packageId, jobRoleId, carerId } = parsed.data;
  const startAt = new Date(`${date}T${start}:00`);
  let endAt = new Date(`${date}T${end}:00`);
  if (endAt <= startAt) endAt = new Date(endAt.getTime() + 86_400_000);
  const result = await createShift(user.agencyId, { packageId, startAt, endAt, jobRoleId: jobRoleId || null, carerId: carerId || null });
  return done(user, "shift.create", result, result.shiftId);
}

export async function generateAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireOffice();
  const rotaId = String(formData.get("rotaId") ?? "");
  const weeks = Number(formData.get("week") ?? 1);
  const monday = startOfWeek(new Date());
  monday.setDate(monday.getDate() + 7 * (Number.isFinite(weeks) ? weeks : 1));
  const rotas = rotaId === "all" ? await prisma.rota.findMany({ where: { agencyId: user.agencyId, active: true } }) : [{ id: rotaId }];
  const messages: string[] = [];
  for (const r of rotas) {
    const res = await generateFromRota(user.agencyId, r.id, monday);
    if (!res.ok) return { error: res.error };
    messages.push(res.message);
  }
  return done(user, "rota.generate", { ok: true, message: messages.join(". ") });
}

const rotaSchema = z.object({ packageId: z.string().min(1), name: z.string().trim().min(1, "Name the rota").max(60) });

export async function createRotaAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireOffice();
  const parsed = rotaSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const pkg = await prisma.package.findFirst({ where: { id: parsed.data.packageId, agencyId: user.agencyId } });
  if (!pkg) return { error: "Package not found" };
  await prisma.rota.create({ data: { ...parsed.data, agencyId: user.agencyId } });
  return done(user, "rota.create", { ok: true, message: `Rota "${parsed.data.name}" created for ${pkg.name}` });
}

const lineSchema = z.object({
  rotaId: z.string().min(1),
  weekday: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  jobRoleId: z.string().optional(),
  carerId: z.string().optional(),
});

export async function addRotaLineAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireOffice();
  const parsed = lineSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Check the day and times" };
  const rota = await prisma.rota.findFirst({ where: { id: parsed.data.rotaId, agencyId: user.agencyId } });
  if (!rota) return { error: "Rota not found" };
  await prisma.rotaLine.create({ data: { ...parsed.data, jobRoleId: parsed.data.jobRoleId || null, carerId: parsed.data.carerId || null } });
  return done(user, "rota.line", { ok: true, message: "Added to the rota" });
}

export async function removeRotaLineAction(formData: FormData): Promise<void> {
  const user = await requireOffice();
  const id = String(formData.get("lineId") ?? "");
  const line = await prisma.rotaLine.findFirst({ where: { id, rota: { agencyId: user.agencyId } } });
  if (!line) return;
  await prisma.rotaLine.delete({ where: { id } });
  refresh();
}

export async function decideAction(formData: FormData): Promise<void> {
  const user = await requireOffice();
  const id = String(formData.get("requestId") ?? "");
  await done(user, "request.decide", await decideRequest(user.agencyId, id, formData.get("approve") === "yes", user.id), id);
}
