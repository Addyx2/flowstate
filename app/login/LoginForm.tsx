"use client";

import { useActionState } from "react";

import { loginAction, type LoginState } from "./actions";

const field =
  "mt-1 w-full rounded-lg border border-line bg-field px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/10";

export function LoginForm({ next, demo = false }: { next?: string; demo?: boolean }) {
  const [state, formAction, pending] = useActionState(loginAction, {} as LoginState);
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <label className="block text-[13px] text-muted">
        Work email
        <input name="email" type="email" autoComplete="username" required defaultValue={state.email ?? (demo ? "admin@flowstate.demo" : undefined)} className={field} />
      </label>
      <label className="block text-[13px] text-muted">
        Password
        <input name="password" type="password" autoComplete="current-password" required defaultValue={demo ? "flowstate123" : undefined} className={field} />
      </label>
      {state.error ? <p className="rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="w-full rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white hover:bg-black disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
