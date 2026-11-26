import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AULTRUM_LINK_COOKIE, openCookie, type AultrumIdentity } from "@/lib/aultrum-id";

import { LinkForm } from "./LinkForm";

export const metadata = { title: "Link Aultrum ID" };

export default async function LinkPage() {
  const pending = openCookie<AultrumIdentity>("aid-link", (await cookies()).get(AULTRUM_LINK_COOKIE)?.value);
  if (!pending) redirect("/login?aultrum=expired");
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-[28px] mb-2">Link your Aultrum ID</h1>
        <p className="text-sm text-muted mb-6">
          Confirm your Flowstate password for {pending.email} once. After that, Aultrum ID signs you straight in.
        </p>
        <LinkForm />
      </div>
    </main>
  );
}
