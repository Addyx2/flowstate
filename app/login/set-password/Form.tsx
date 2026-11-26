"use client";

import { useActionState } from "react";

import { setPasswordAction } from "./actions";

const field = "mt-1 w-full rounded-lg border border-line bg-field px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10";

export function SetPasswordForm({ token, email }: { token: string; email: string }) {
  const [state, action, pending] = useActionState(setPasswordAction, {} as { error?: string });
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <input type="email" name="username" value={email} autoComplete="username" readOnly hidden />
      <label className="block text-[13px] text-muted">
        New password
        <input name="password" type="password" autoComplete="new-password" required minLength={10} className={field} />
      </label>
      <label className="block text-[13px] text-muted">
        Type it again
        <input name="confirm" type="password" autoComplete="new-password" required className={field} />
      </label>
      {state.error ? <p className="rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad">{state.error}</p> : null}
      <button disabled={pending} className="w-full rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white hover:bg-black disabled:opacity-60">
        {pending ? "Saving…" : "Set password and sign in"}
      </button>
    </form>
  );
}
