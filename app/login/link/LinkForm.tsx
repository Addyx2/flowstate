"use client";

import { useActionState } from "react";

import { linkAction } from "./actions";

export function LinkForm() {
  const [state, action, pending] = useActionState(linkAction, {} as { error?: string });
  return (
    <form action={action} className="space-y-4">
      <label className="block font-mono text-[10px] tracking-widest text-[#a0a0a0]">
        FLOWSTATE PASSWORD
        <input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full border border-[#2a2a2a] bg-[#0a0a0b] px-3 py-2 text-sm outline-none focus:border-[#4a9eff]" />
      </label>
      {state.error ? <p className="text-sm text-[#ff9b9b]">{state.error}</p> : null}
      <button disabled={pending} className="w-full bg-[#4a9eff] px-4 py-2.5 text-sm text-[#070708] disabled:opacity-60">{pending ? "Linking…" : "Link and sign in"}</button>
    </form>
  );
}
