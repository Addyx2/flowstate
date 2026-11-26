// Needs the demo database (DATABASE_URL). No API call: a stand-in replays model turns.
import assert from "node:assert/strict";
import { after, test } from "node:test";

import { prisma } from "@/lib/db";

import { executeAction, runAssist, toolDefinitions, type AssistClient } from "./assist";

const skip = !process.env.DATABASE_URL;
after(() => prisma.$disconnect());

function fakeClient(turns: ((req: { messages: { role: string; content: unknown }[] }) => object)[]) {
  const seen: { messages: { role: string; content: unknown }[]; model: string }[] = [];
  let i = 0;
  const client = {
    beta: {
      messages: {
        stream: (req: { messages: { role: string; content: unknown }[]; model: string }) => {
          seen.push(JSON.parse(JSON.stringify(req)));
          const out = turns[i++]!(req);
          return { finalMessage: async () => out };
        },
      },
    },
  } as unknown as AssistClient;
  return { client, seen };
}

const toolUse = (id: string, name: string, input: object) => ({ type: "tool_use", id, name, input });

test("tool definitions are strict-ready", () => {
  for (const t of toolDefinitions) assert.equal((t.input_schema as { additionalProperties?: boolean }).additionalProperties, false, t.name);
});

test("Assist looks up, proposes, and changes nothing until confirmed", { skip }, async () => {
  const user = await prisma.user.findFirstOrThrow({ where: { email: "admin@flowstate.demo" } });
  const open = await prisma.shift.findFirstOrThrow({ where: { agencyId: user.agencyId, status: "OPEN", startAt: { gt: new Date() } }, orderBy: { startAt: "asc" } });
  const { client, seen } = fakeClient([
    () => ({ stop_reason: "tool_use", content: [{ type: "text", text: "Let me look." }, toolUse("t1", "list_open_shifts", {}), toolUse("t2", "suggest_carers", { shiftId: open.id })] }),
    (req) => {
      const results = req.messages.at(-1)!.content as { content: string }[];
      const suggestions = JSON.parse(results[1]!.content) as { carerId: string; blockers: string[] }[];
      const pick = suggestions.find((s) => !s.blockers.length)!;
      return { stop_reason: "tool_use", content: [toolUse("t3", "propose_book_shift", { shiftId: open.id, carerId: pick.carerId }), toolUse("t4", "propose_book_shift", { shiftId: "nope" })] };
    },
    () => ({ stop_reason: "end_turn", content: [{ type: "text", text: "I've proposed a booking. Confirm it to go ahead." }] }),
  ]);

  const reply = await runAssist(user.agencyId, user.id, [{ role: "user", text: "Fill the next open shift" }], client);
  assert.equal(reply.proposals.length, 1);
  assert.match(reply.proposals[0]!.summary, /^Book .+ on /);
  assert.equal(seen[0]!.model, "claude-opus-5-5");
  // The bad call came back as an error result, not a proposal.
  const third = seen[2]!.messages.at(-1)!.content as { is_error?: boolean }[];
  assert.equal(third[1]!.is_error, true);
  // Nothing booked yet.
  assert.equal((await prisma.shift.findUniqueOrThrow({ where: { id: open.id } })).status, "OPEN");

  const action = await prisma.assistAction.findUniqueOrThrow({ where: { id: reply.proposals[0]!.id } });
  const result = await executeAction(user.agencyId, user.id, action.tool, action.input as Record<string, unknown>);
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal((await prisma.shift.findUniqueOrThrow({ where: { id: open.id } })).status, "BOOKED");

  await prisma.shift.update({ where: { id: open.id }, data: { status: "OPEN", carerId: null } });
  await prisma.assistAction.deleteMany({ where: { userId: user.id } });
});

test("a refusal ends the turn politely", { skip }, async () => {
  const user = await prisma.user.findFirstOrThrow({ where: { email: "admin@flowstate.demo" } });
  const { client } = fakeClient([() => ({ stop_reason: "refusal", content: [] })]);
  const reply = await runAssist(user.agencyId, user.id, [{ role: "user", text: "hello" }], client);
  assert.match(reply.text, /can't help/);
});
