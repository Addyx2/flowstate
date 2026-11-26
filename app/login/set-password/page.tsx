import Link from "next/link";

import { userForPasswordLink } from "@/lib/password";

import { SetPasswordForm } from "./Form";

export const metadata = { title: "Set your password", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function SetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? "";
  const user = await userForPasswordLink(token);
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <p className="mb-10 font-serif text-[28px]">Flowstate</p>
        {user ? (
          <>
            <h1 className="mb-1 font-serif text-[32px] leading-tight">Set your password</h1>
            <p className="mb-6 text-[14px] text-muted">
              For {user.email} at {user.agency.name}. After this, you can also sign in with Aultrum ID: you&rsquo;ll confirm this password once to link it.
            </p>
            <SetPasswordForm token={token} email={user.email} />
          </>
        ) : (
          <>
            <h1 className="mb-2 font-serif text-[32px] leading-tight">This link has ended</h1>
            <p className="mb-6 text-[14px] text-muted">It has expired or already been used. Ask your Flowstate admin for a new one.</p>
            <Link href="/login" className="text-accent hover:underline">
              Go to sign in
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
