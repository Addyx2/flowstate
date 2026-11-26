// Needs the demo database (DATABASE_URL).
import assert from "node:assert/strict";
import { after, test } from "node:test";

import { prisma } from "@/lib/db";

import { issuePasswordLink, setPasswordWithLink, userForPasswordLink } from "./password";

const skip = !process.env.DATABASE_URL;
after(() => prisma.$disconnect());

test("a set-password link works once, expires, and signs out old sessions", { skip }, async () => {
  const agency = await prisma.agency.findFirstOrThrow();
  const user = await prisma.user.create({ data: { agencyId: agency.id, email: `link-test-${Date.now()}@example.test`, name: "Link Test", role: "COORDINATOR" } });
  try {
    const token = await issuePasswordLink(user.id);
    assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).passwordTokenHash?.includes(token), false, "only the hash is stored");
    assert.ok(await userForPasswordLink(token));
    const done = await setPasswordWithLink(token, "hash-placeholder");
    assert.equal(done?.sessionVersion, user.sessionVersion + 1);
    assert.equal(await userForPasswordLink(token), null, "used up");

    const later = await issuePasswordLink(user.id, new Date(Date.now() - 100 * 3_600_000));
    assert.equal(await userForPasswordLink(later), null, "expired");
    assert.equal(await userForPasswordLink("not-a-token"), null);
  } finally {
    await prisma.user.delete({ where: { id: user.id } });
  }
});
