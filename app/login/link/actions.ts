"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AULTRUM_LINK_COOKIE, openCookie, type AultrumIdentity } from "@/lib/aultrum-id";
import { signInWithAultrum } from "@/lib/aultrum-signin";
import { verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isOfficeRole } from "@/lib/permissions";
import { safeNextPath } from "@/lib/url";

export async function linkAction(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const jar = await cookies();
  const pending = openCookie<AultrumIdentity & { next: string | null }>("aid-link", jar.get(AULTRUM_LINK_COOKIE)?.value);
  if (!pending) redirect("/login?aultrum=expired");
  const user = await prisma.user.findUnique({ where: { email: pending.email } });
  if (!user || user.deactivatedAt || !isOfficeRole(user.role)) return { error: "This account can't be linked." };
  if (!(await verifyPassword(String(formData.get("password") ?? ""), user.passwordHash))) return { error: "Incorrect password" };
  jar.delete({ name: AULTRUM_LINK_COOKIE, path: "/login" });
  const home = await signInWithAultrum(user, pending.sub, "aultrum_link");
  redirect(safeNextPath(pending.next) ?? home);
}
