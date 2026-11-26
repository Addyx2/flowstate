import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { aultrumIdAvailable } from "@/lib/aultrum-id";
import { DEMO_MODE } from "@/lib/constants";
import { isOfficeRole } from "@/lib/permissions";
import { safeNextPath } from "@/lib/url";

import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

const AULTRUM_ERRORS: Record<string, string> = {
  expired: "That sign-in took too long. Try again.",
  cancelled: "Sign-in with Aultrum ID was cancelled.",
  failed: "Aultrum ID couldn't sign you in. Try again, or use your password.",
  "no-account": "That Aultrum ID isn't linked to a Flowstate account yet. Sign in with your password once to link it.",
  "no-access": "This account no longer has access.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const user = await getSessionUser();
  if (user && isOfficeRole(user.role)) redirect("/watchboard");
  const next = safeNextPath(params.next) ?? undefined;
  const aultrum = await aultrumIdAvailable();

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="font-mono text-xs tracking-[0.12em] mb-8">
          AULTRUM<span className="text-[#3a3a3a]">/</span>
          <span className="text-[#4a9eff]">FLOWSTATE</span>
          <span className="ml-2 text-[9px] text-[#ffb800]">PROTOTYPE</span>
        </p>
        <h1 className="text-2xl font-light mb-6">Sign in</h1>
        {params.aultrum && AULTRUM_ERRORS[params.aultrum] ? (
          <p className="mb-4 border border-[#ffb800]/40 bg-[#ffb800]/10 px-3 py-2 text-sm text-[#ffd27a]">{AULTRUM_ERRORS[params.aultrum]}</p>
        ) : null}
        {params.carer ? (
          <p className="mb-4 border border-[#2a2a2a] px-3 py-2 text-sm text-[#a0a0a0]">Carers use the Aultrum carer app. This site is for coordinators.</p>
        ) : null}
        {aultrum ? (
          <>
            <a href={`/api/auth/aultrum/start${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="block w-full border border-[#2a2a2a] px-4 py-2.5 text-center text-sm hover:border-[#4a9eff]">
              Sign in with Aultrum ID
            </a>
            <p className="my-4 text-center font-mono text-[10px] text-[#5a5a5a]">OR</p>
          </>
        ) : null}
        <LoginForm next={next} demo={DEMO_MODE} />
        {DEMO_MODE ? <p className="mt-6 font-mono text-[10px] text-[#5a5a5a]">DEMO: admin@flowstate.demo / flowstate123</p> : null}
      </div>
    </main>
  );
}
