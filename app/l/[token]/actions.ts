"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { findLink } from "@/lib/links";

export interface PublicState {
  error?: string;
  done?: string;
}

async function liveLink(token: string) {
  const link = await findLink(token);
  if (!link || link.revokedAt || link.expiresAt < new Date()) return null;
  return link;
}

const praiseSchema = z.object({
  token: z.string().min(10),
  carerId: z.string().min(1, "Choose who you'd like to thank"),
  fromName: z.string().trim().min(1, "Add your name").max(80),
  message: z.string().trim().min(3, "Write a few words").max(500, "Keep it under 500 characters"),
});

export async function submitPraise(_prev: PublicState, formData: FormData): Promise<PublicState> {
  const parsed = praiseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const link = await liveLink(parsed.data.token);
  if (!link || link.kind !== "PRAISE" || !link.package) return { error: "This link has ended. Ask the agency for a new one." };
  const onTeam = link.package.team.some((m) => m.carerId === parsed.data.carerId);
  if (!onTeam) return { error: "Choose someone from the list." };
  await prisma.$transaction([
    prisma.praise.create({
      data: { agencyId: link.agencyId, carerId: parsed.data.carerId, packageId: link.package.id, from: "KEY_PERSON", fromName: parsed.data.fromName, message: parsed.data.message },
    }),
    prisma.signal.create({ data: { agencyId: link.agencyId, kind: "PRAISE", carerId: parsed.data.carerId, packageId: link.package.id } }),
  ]);
  await recordAudit({ id: null, email: null, agencyId: link.agencyId }, { action: "praise.link", summary: `Praise from ${parsed.data.fromName} via a praise link`, targetType: "Link", targetId: link.id });
  revalidatePath(`/workforce/teams/${link.package.id}`);
  return { done: "Thank you. Your message has been passed on." };
}

const responseSchema = z.object({
  token: z.string().min(10),
  answer: z.enum(["cover", "decline"]),
  agency: z.string().trim().max(80).optional(),
  worker: z.string().trim().max(80).optional(),
  contact: z.string().trim().max(120).optional(),
});

export async function respondToShiftRequest(_prev: PublicState, formData: FormData): Promise<PublicState> {
  const parsed = responseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Choose an answer" };
  const link = await liveLink(parsed.data.token);
  if (!link || link.kind !== "SHIFT_REQUEST" || !link.shift) return { error: "This request has closed." };
  if (link.shift.status !== "OPEN") return { error: "This shift has already been covered. Thank you." };
  const { answer, agency, worker, contact } = parsed.data;
  if (answer === "cover" && !worker) return { error: "Tell us who would cover it" };
  const response =
    answer === "cover" ? `${agency || "An agency"} can cover it with ${worker}${contact ? ` — contact ${contact}` : ""}` : `${agency || "The agency"} can't cover it`;
  await prisma.link.update({ where: { id: link.id }, data: { response, respondedAt: new Date() } });
  await recordAudit({ id: null, email: null, agencyId: link.agencyId }, { action: "link.response", summary: response, targetType: "Link", targetId: link.id });
  revalidatePath("/account/links");
  return { done: answer === "cover" ? "Thank you. The coordinator will confirm with you." : "Thank you for letting us know." };
}
