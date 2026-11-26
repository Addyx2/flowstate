"use client";

import { useActionState, useState } from "react";

import { buttonClass, cn, ghostButtonClass } from "./ui";

export interface LinkState {
  error?: string;
  url?: string;
  ok?: string;
}

/** Makes a link with a server action, then shows it ready to copy and send. */
export function LinkMaker({
  action,
  submit,
  children,
  className,
  quiet = false,
}: {
  action: (prev: LinkState, formData: FormData) => Promise<LinkState>;
  submit: string;
  children?: React.ReactNode;
  className?: string;
  /** A small text button, for use inside tables. */
  quiet?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [copied, setCopied] = useState(false);
  return (
    <form action={formAction} className={cn("space-y-2", className)}>
      {children}
      <button type="submit" disabled={pending} className={quiet ? "text-[12px] text-accent hover:underline disabled:opacity-50" : children ? buttonClass : ghostButtonClass}>
        {pending ? "Making…" : submit}
      </button>
      {state.error ? <p className="text-sm text-bad">{state.error}</p> : null}
      {state.url ? (
        <div className="flex flex-wrap items-center gap-2 border border-accent/30 bg-accent-soft p-2">
          <code className="min-w-0 flex-1 break-all text-xs text-ink">{state.url}</code>
          {state.ok ? <span className="text-[13px] text-muted">{state.ok}</span> : null}
          <button
            type="button"
            className="label-title text-[13px] text-accent"
            onClick={() => {
              navigator.clipboard?.writeText(state.url!).then(() => setCopied(true), () => setCopied(false));
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
