"use client";

import { useActionState } from "react";

import { linkAction } from "./actions";

export function LinkForm() {
  const [state, action, pending] = useActionState(linkAction, {} as { error?: string });
  return (
    <form action={action} className="space-y-4">
      <label className="block text-[13px] text-muted">
        Flowstate password
        <input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full border border-line bg-field px-3 py-2 text-sm outline-none focus:border-accent" />
      </label>
      {state.error ? <p className="text-sm text-bad">{state.error}</p> : null}
      <button disabled={pending} className="w-full bg-ink px-4 py-2.5 text-sm text-white disabled:opacity-60">{pending ? "Linking…" : "Link and sign in"}</button>
    </form>
  );
}
