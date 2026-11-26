"use client";

import { useActionState } from "react";

import { buttonClass, cn } from "./ui";

export interface FormState {
  error?: string;
  ok?: string;
}

/** A form bound to a server action that returns { error } or { ok }. */
export function ActionForm({
  action,
  submit,
  children,
  className,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  submit: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className={cn("space-y-3", className)}>
      {children}
      {state.error ? <p className="text-sm text-[#ff9b9b]">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-[#00e676]">{state.ok}</p> : null}
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Saving…" : submit}
      </button>
    </form>
  );
}
