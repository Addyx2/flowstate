// Roles. Free of server imports so client components share the same rules
// as the server guards in lib/auth.ts.

export type AppRole = "ADMIN" | "COORDINATOR" | "CARER";

export const ROLE_LABELS: Record<AppRole, string> = {
  ADMIN: "Admin",
  COORDINATOR: "Coordinator",
  CARER: "Carer",
};

export function isOfficeRole(role: string): boolean {
  return role === "ADMIN" || role === "COORDINATOR";
}

/** Areas only admins open (docs/spec/navigation.md). */
export const ADMIN_ONLY_PREFIXES = ["/office", "/account"] as const;

export function canAccess(role: string, href: string): boolean {
  if (!isOfficeRole(role)) return false;
  if (role === "ADMIN") return true;
  return !ADMIN_ONLY_PREFIXES.some((p) => href === p || href.startsWith(`${p}/`));
}
