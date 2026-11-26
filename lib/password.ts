// One-time "set your password" links for people an admin adds. The link is
// shown to the admin to send; only its hash is stored, and it expires.
import { createHash, randomBytes } from "node:crypto";

import { prisma } from "./db";

export const PASSWORD_LINK_HOURS = 72;
export const MIN_PASSWORD = 10;

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function issuePasswordLink(userId: string, now = new Date()): Promise<string> {
  const token = randomBytes(24).toString("base64url");
  await prisma.user.update({
    where: { id: userId },
    data: { passwordTokenHash: hash(token), passwordTokenExpAt: new Date(now.getTime() + PASSWORD_LINK_HOURS * 3_600_000) },
  });
  return token;
}

/** The person a live link belongs to, without using it up. */
export async function userForPasswordLink(token: string, now = new Date()) {
  if (!token) return null;
  const user = await prisma.user.findUnique({ where: { passwordTokenHash: hash(token) }, include: { agency: true } });
  if (!user || user.deactivatedAt || !user.passwordTokenExpAt || user.passwordTokenExpAt < now) return null;
  return user;
}

/** Sets the password and uses the link up. Signs out every other session. */
export async function setPasswordWithLink(token: string, passwordHash: string, now = new Date()) {
  const user = await userForPasswordLink(token, now);
  if (!user) return null;
  return prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, passwordTokenHash: null, passwordTokenExpAt: null, sessionVersion: { increment: 1 }, failedLoginCount: 0, lockedUntil: null },
  });
}
