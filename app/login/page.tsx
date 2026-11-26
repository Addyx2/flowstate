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
    <main className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <section className="hidden flex-col justify-between bg-side p-12 text-side-ink lg:flex">
        <p className="font-serif text-[30px] leading-none">Flowstate</p>
        <div className="max-w-md">
          <p className="font-serif text-[40px] leading-[1.1] tracking-[-0.01em]">Run your carers and your rotas.</p>
          <p className="mt-4 text-[15px] text-side-muted">Keep your care-records system for care notes. Flowstate looks after who goes where, and how well it&rsquo;s going.</p>
        </div>
        <p className="text-[12px] text-side-muted">A prototype by Aultrum</p>
      </section>
      <section className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <p className="mb-10 font-serif text-[28px] lg:hidden">Flowstate</p>
          <h1 className="mb-1 font-serif text-[32px] leading-tight">Sign in</h1>
          <p className="mb-6 text-[14px] text-muted">For coordinators. Carers use the Aultrum carer app.</p>
          {params.aultrum && AULTRUM_ERRORS[params.aultrum] ? (
            <p className="mb-4 rounded-lg bg-warn-soft px-3 py-2 text-sm text-warn">{AULTRUM_ERRORS[params.aultrum]}</p>
          ) : null}
          {params.carer ? <p className="mb-4 rounded-lg bg-subtle px-3 py-2 text-sm text-muted">Carers use the Aultrum carer app. This site is for coordinators.</p> : null}
          {aultrum ? (
            <>
              <a
                href={`/api/auth/aultrum/start${next ? `?next=${encodeURIComponent(next)}` : ""}`}
                className="block w-full rounded-lg border border-line bg-card px-4 py-2.5 text-center text-sm hover:border-faint"
              >
                Sign in with Aultrum ID
              </a>
              <p className="my-4 text-center text-[13px] text-faint">or</p>
            </>
          ) : null}
          <LoginForm next={next} demo={DEMO_MODE} />
          {DEMO_MODE ? <p className="mt-6 rounded-lg bg-subtle px-3 py-2 text-[13px] text-muted">Demo: admin@flowstate.demo / flowstate123</p> : null}
        </div>
      </section>
    </main>
  );
}
