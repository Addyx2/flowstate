"use client";

import { useActionState } from "react";

import { loginAction, type LoginState } from "./actions";

const field =
  "mt-1 w-full border border-[#2a2a2a] bg-[#0a0a0b] px-3 py-2 text-sm text-[#e2e2e2] outline-none focus:border-[#4a9eff]";

export function LoginForm({ next, demo = false }: { next?: string; demo?: boolean }) {
  const [state, formAction, pending] = useActionState(loginAction, {} as LoginState);
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <label className="block font-mono text-[10px] tracking-widest text-[#a0a0a0]">
        WORK EMAIL
        <input name="email" type="email" autoComplete="username" required defaultValue={state.email ?? (demo ? "admin@flowstate.demo" : undefined)} className={field} />
      </label>
      <label className="block font-mono text-[10px] tracking-widest text-[#a0a0a0]">
        PASSWORD
        <input name="password" type="password" autoComplete="current-password" required defaultValue={demo ? "flowstate123" : undefined} className={field} />
      </label>
      {state.error ? <p className="border border-[#ff5c5c]/40 bg-[#ff5c5c]/10 px-3 py-2 text-sm text-[#ff9b9b]">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="w-full bg-[#4a9eff] px-4 py-2.5 text-sm font-medium text-[#070708] hover:bg-[#6bb0ff] disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
