"use server";

import { redirect } from "next/navigation";

import { recordAudit } from "@/lib/audit";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { MIN_PASSWORD, setPasswordWithLink, userForPasswordLink } from "@/lib/password";

export async function setPasswordAction(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < MIN_PASSWORD) return { error: `Use at least ${MIN_PASSWORD} characters.` };
  if (password !== String(formData.get("confirm") ?? "")) return { error: "The two passwords don't match." };
  if (!(await userForPasswordLink(token))) return { error: "This link has expired or been used. Ask your admin for a new one." };
  const user = await setPasswordWithLink(token, await hashPassword(password));
  if (!user) return { error: "This link has expired or been used. Ask your admin for a new one." };
  await recordAudit(user, { action: "auth.password_set", summary: "Set a password with a link", targetType: "User", targetId: user.id });
  await setSessionCookie(user);
  redirect("/watchboard");
}
