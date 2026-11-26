import type { Prisma } from "@prisma/client";
import { headers } from "next/headers";

import { prisma } from "@/lib/db";

export interface AuditActor {
  id: string;
  email: string;
  agencyId: string;
}

export interface AuditInput {
  action: string;
  summary: string;
  targetType?: string;
  targetId?: string;
  metadata?: Prisma.InputJsonValue;
}

async function clientIp(): Promise<string | null> {
  try {
    const h = await headers();
    return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip");
  } catch {
    return null;
  }
}

/** Append to the agency's audit trail. Never breaks the action being audited. */
export async function recordAudit(actor: AuditActor | { id: null; email: string | null; agencyId: string }, input: AuditInput): Promise<void> {
  try {
    await prisma.auditEvent.create({
      data: { agencyId: actor.agencyId, actorId: actor.id, actorEmail: actor.email, ...input, ip: await clientIp() },
    });
  } catch (error) {
    console.error("audit: failed to record", input.action, error);
  }
}
