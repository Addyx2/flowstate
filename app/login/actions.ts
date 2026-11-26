"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { recordAudit } from "@/lib/audit";
import { SESSION_COOKIE, setSessionCookie, verifyPassword } from "@/lib/auth";
import { LOCKOUT_MINUTES, MAX_FAILED_LOGINS } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { isOfficeRole } from "@/lib/permissions";
import { safeNextPath } from "@/lib/url";

export interface LoginState {
  error?: string;
  email?: string;
}

const loginSchema = z.object({
  email: z.string().trim().email("Enter your work email"),
  password: z.string().min(1, "Enter your password"),
});

// Compared against for unknown emails so timing doesn't reveal which exist.
const DUMMY_HASH = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8.wjv1yUuRcIKAv8nh9Z3jO0Hn0V3K";

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const typedEmail = String(formData.get("email") ?? "");
  const fail = (error: string): LoginState => ({ error, email: typedEmail });
  const parsed = loginSchema.safeParse({ email: typedEmail, password: formData.get("password") });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check your details and try again");

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user) {
    await verifyPassword(parsed.data.password, DUMMY_HASH);
    return fail("Incorrect email or password");
  }
  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000);
    return fail(`Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`);
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid || user.deactivatedAt) {
    if (!valid) {
      const failed = user.failedLoginCount + 1;
      const lock = failed >= MAX_FAILED_LOGINS;
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginCount: lock ? 0 : failed, lockedUntil: lock ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000) : null },
      });
      if (lock) {
        await recordAudit(user, { action: "auth.locked", summary: `Sign-in locked for ${LOCKOUT_MINUTES} minutes`, targetType: "User", targetId: user.id });
      }
    }
    return fail("Incorrect email or password");
  }
  if (!isOfficeRole(user.role)) return fail("Carers use the Aultrum carer app, not this site.");

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date(), failedLoginCount: 0, lockedUntil: null } });
  await recordAudit(user, { action: "auth.login", summary: "Signed in", targetType: "User", targetId: user.id });
  await setSessionCookie(user);
  redirect(safeNextPath(String(formData.get("next") ?? "")) ?? "/watchboard");
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
