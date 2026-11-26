// Publishable links (docs/spec/links.md): owner, purpose, expiry, revocable,
// logged, and showing only what their purpose needs.
import { createHash, randomBytes } from "node:crypto";

import type { LinkKind } from "@prisma/client";

import { prisma } from "./db";

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export const DEFAULT_EXPIRY_DAYS: Record<LinkKind, number> = { PRAISE: 90, SHIFT_REQUEST: 3, CARER_INVITE: 7 };

export const LINK_LABEL: Record<LinkKind, string> = { PRAISE: "Praise", SHIFT_REQUEST: "Shift request", CARER_INVITE: "Carer invite" };

export async function createLink(input: {
  agencyId: string;
  kind: LinkKind;
  purpose: string;
  createdById: string;
  packageId?: string;
  keyPersonId?: string;
  shiftId?: string;
  carerId?: string;
  days?: number;
  token?: string;
}): Promise<{ token: string; id: string }> {
  const token = input.token ?? randomBytes(24).toString("base64url");
  const { days, token: _t, ...data } = input;
  const link = await prisma.link.create({
    data: { ...data, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + (days ?? DEFAULT_EXPIRY_DAYS[input.kind]) * 86_400_000) },
  });
  return { token, id: link.id };
}

export type OpenedLink = NonNullable<Awaited<ReturnType<typeof findLink>>>;

/** The link behind a token, if it's still live. Counts the open. */
export async function openLink(token: string) {
  const link = await findLink(token);
  if (!link || link.revokedAt || link.expiresAt < new Date()) return { link, live: false as const };
  await prisma.link.update({ where: { id: link.id }, data: { lastOpenedAt: new Date(), uses: { increment: 1 } } });
  return { link, live: true as const };
}

export function findLink(token: string) {
  return prisma.link.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      agency: { select: { name: true } },
      package: { select: { id: true, name: true, postcode: true, team: { include: { carer: { select: { id: true, firstName: true, lastName: true } } } } } },
      keyPerson: { select: { name: true } },
      shift: { include: { jobRole: true, package: { select: { postcode: true, kind: true } } } },
    },
  });
}

/** "S10 3JJ" → "S10": the area, never the address. */
export const postcodeArea = (pc: string | null | undefined) => (pc ? pc.trim().split(/\s+/)[0]!.toUpperCase() : "—");
