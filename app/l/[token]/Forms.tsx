"use client";

import { useActionState } from "react";

import { buttonClass, Field, inputClass } from "@/components/ui";

import { respondToShiftRequest, submitPraise, type PublicState } from "./actions";

export function PraiseForm({ token, team, defaultName }: { token: string; team: { id: string; name: string }[]; defaultName: string }) {
  const [state, action, pending] = useActionState(submitPraise, {} as PublicState);
  if (state.done) return <p className="font-serif text-[21px] text-ok">{state.done}</p>;
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <Field label="Who would you like to thank?">
        <select name="carerId" className={inputClass}>
          {team.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Your name">
        <input name="fromName" defaultValue={defaultName} required className={inputClass} />
      </Field>
      <Field label="Your message">
        <textarea name="message" required rows={4} maxLength={500} className={inputClass} placeholder="What did they do that made a difference?" />
      </Field>
      <p className="text-xs text-muted">Please keep it about the carer. Don&apos;t include health or medical details.</p>
      {state.error ? <p className="text-sm text-bad">{state.error}</p> : null}
      <button disabled={pending} className={buttonClass}>
        {pending ? "Sending…" : "Send thanks"}
      </button>
    </form>
  );
}

export function ShiftResponseForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(respondToShiftRequest, {} as PublicState);
  if (state.done) return <p className="font-serif text-[21px] text-ok">{state.done}</p>;
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <Field label="Your agency">
        <input name="agency" className={inputClass} />
      </Field>
      <Field label="Who would cover it">
        <input name="worker" className={inputClass} placeholder="Worker's name" />
      </Field>
      <Field label="Contact for the coordinator">
        <input name="contact" className={inputClass} placeholder="Phone or email" />
      </Field>
      {state.error ? <p className="text-sm text-bad">{state.error}</p> : null}
      <div className="flex gap-2">
        <button name="answer" value="cover" disabled={pending} className={buttonClass}>
          We can cover it
        </button>
        <button name="answer" value="decline" disabled={pending} className="border border-line px-3 py-2 text-sm">
          We can&apos;t
        </button>
      </div>
    </form>
  );
}
