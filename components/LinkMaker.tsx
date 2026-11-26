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
}: {
  action: (prev: LinkState, formData: FormData) => Promise<LinkState>;
  submit: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [copied, setCopied] = useState(false);
  return (
    <form action={formAction} className={cn("space-y-2", className)}>
      {children}
      <button type="submit" disabled={pending} className={children ? buttonClass : ghostButtonClass}>
        {pending ? "Making…" : submit}
      </button>
      {state.error ? <p className="text-sm text-[#ff9b9b]">{state.error}</p> : null}
      {state.url ? (
        <div className="flex flex-wrap items-center gap-2 border border-[#4a9eff]/40 bg-[#4a9eff]/5 p-2">
          <code className="min-w-0 flex-1 break-all text-xs text-[#e2e2e2]">{state.url}</code>
          {state.ok ? <span className="font-mono text-[10px] text-[#a0a0a0]">{state.ok}</span> : null}
          <button
            type="button"
            className="font-mono text-[10px] tracking-wider text-[#4a9eff]"
            onClick={() => {
              navigator.clipboard?.writeText(state.url!).then(() => setCopied(true), () => setCopied(false));
            }}
          >
            {copied ? "COPIED" : "COPY"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
