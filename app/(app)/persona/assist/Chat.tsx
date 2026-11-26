"use client";

import { useState } from "react";

import { buttonClass, ghostButtonClass, inputClass } from "@/components/ui";

import { decideProposal } from "./actions";

interface Turn {
  role: "user" | "assistant";
  text: string;
  proposals?: { id: string; summary: string; state?: "pending" | "done" | "declined" | "failed"; note?: string }[];
}

const STARTERS = ["What needs me today?", "Fill the open shifts for this weekend", "Who has low rapport, and why?", "Any requests waiting?"];

export function Chat() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    const next: Turn[] = [...turns, { role: "user", text: clean }];
    setTurns(next);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: next.map((t) => ({ role: t.role, text: t.text })) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Assist couldn't answer");
      setTurns([...next, { role: "assistant", text: json.text, proposals: json.proposals.map((p: { id: string; summary: string }) => ({ ...p, state: "pending" })) }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Assist couldn't answer");
    } finally {
      setBusy(false);
    }
  }

  async function decide(turn: number, id: string, approve: boolean) {
    const result = await decideProposal(id, approve);
    setTurns((ts) =>
      ts.map((t, i) =>
        i !== turn ? t : { ...t, proposals: t.proposals?.map((p) => (p.id !== id ? p : { ...p, state: !approve ? "declined" : result.ok ? "done" : "failed", note: result.message })) },
      ),
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col">
      <div className="flex-1 space-y-4">
        {turns.length === 0 ? (
          <div className="flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <button key={s} onClick={() => send(s)} className={ghostButtonClass}>
                {s}
              </button>
            ))}
          </div>
        ) : null}
        {turns.map((t, i) => (
          <div key={i} className={t.role === "user" ? "ml-auto max-w-[80%] border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3" : "max-w-[90%] px-1"}>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{t.text}</p>
            {t.proposals?.map((p) => (
              <div key={p.id} className="mt-3 border border-[#4a9eff]/40 bg-[#4a9eff]/5 p-3">
                <p className="font-mono text-[10px] tracking-widest text-[#4a9eff]">PROPOSED CHANGE</p>
                <p className="my-1 text-sm">{p.summary}</p>
                {p.state === "pending" ? (
                  <div className="mt-2 flex gap-2">
                    <button className={buttonClass} onClick={() => decide(i, p.id, true)}>
                      Confirm
                    </button>
                    <button className={ghostButtonClass} onClick={() => decide(i, p.id, false)}>
                      Decline
                    </button>
                  </div>
                ) : (
                  <p className={`text-xs ${p.state === "done" ? "text-[#00e676]" : p.state === "failed" ? "text-[#ff9b9b]" : "text-[#8a8a8a]"}`}>{p.note}</p>
                )}
              </div>
            ))}
          </div>
        ))}
        {busy ? <p className="font-mono text-[10px] tracking-widest text-[#8a8a8a]">ASSIST IS LOOKING…</p> : null}
        {error ? <p className="text-sm text-[#ff9b9b]">{error}</p> : null}
      </div>
      <form
        className="sticky bottom-0 mt-6 flex gap-2 bg-[#070708] py-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={4000} placeholder="Ask Assist, or tell it what to do…" className={inputClass} />
        <button disabled={busy || !input.trim()} className={buttonClass}>
          Send
        </button>
      </form>
    </div>
  );
}
