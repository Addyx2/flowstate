// Needs a database (DATABASE_URL) with the demo seed: `npm run db:seed`.
import assert from "node:assert/strict";
import { after, test } from "node:test";

import { prisma } from "@/lib/db";

import { calendarScreen, homeScreen, passportScreen, peakScreen, poolScreen, timesheetsScreen } from "./screens";
import { doAction } from "./work";

const skip = !process.env.DATABASE_URL;
after(() => prisma.$disconnect());

test("every screen matches the shared Aultrum v1 contract", { skip }, async () => {
  for (const carer of await prisma.carer.findMany({ where: { status: "ACTIVE" }, take: 4 })) {
    const ref = { agencyId: carer.agencyId, carerId: carer.id };
    // .parse inside each screen throws if the shape drifts from the contract.
    await homeScreen(ref);
    await poolScreen(ref);
    await calendarScreen(ref, null);
    await passportScreen(ref);
    await peakScreen(ref);
    await timesheetsScreen(ref);
  }
});

test("a carer's day: check in, break, check out, sign; request a shift; ask for time off", { skip }, async () => {
  const carer = await prisma.carer.findFirstOrThrow({ where: { firstName: "Sarah" } });
  const ref = { agencyId: carer.agencyId, carerId: carer.id };
  const start = new Date(Date.now() + 5 * 60_000);
  const pkg = await prisma.package.findFirstOrThrow({ where: { agencyId: carer.agencyId, name: "Mrs A." } });
  const shift = await prisma.shift.create({ data: { agencyId: carer.agencyId, packageId: pkg.id, carerId: carer.id, startAt: start, endAt: new Date(start.getTime() + 3_600_000), status: "BOOKED" } });
  try {
    assert.equal((await doAction(ref, { action: "clock_in", shiftId: shift.id })).ok, true);
    assert.equal((await doAction(ref, { action: "start_break", timesheetId: shift.id })).ok, true);
    assert.equal((await doAction(ref, { action: "end_break", timesheetId: shift.id })).ok, true);
    assert.equal((await doAction(ref, { action: "clock_out", timesheetId: shift.id })).ok, true);
    assert.equal((await doAction(ref, { action: "sign_carer", timesheetId: shift.id })).ok, true);
    const done = await prisma.shift.findUniqueOrThrow({ where: { id: shift.id } });
    assert.equal(done.status, "COMPLETED");
    assert.ok(done.carerSignedAt);
    const onTime = await prisma.signal.count({ where: { carerId: carer.id, packageId: pkg.id, kind: "ON_TIME", at: { gte: new Date(Date.now() - 60_000) } } });
    assert.ok(onTime >= 1, "check-in records a punctuality signal");

    // Someone else's shift can't be touched.
    const other = await prisma.shift.findFirstOrThrow({ where: { carerId: { not: carer.id }, status: "BOOKED" } });
    assert.equal((await doAction(ref, { action: "clock_in", shiftId: other.id })).ok, false);

    const open = await prisma.shift.findFirst({ where: { agencyId: carer.agencyId, status: "OPEN", startAt: { gt: new Date() } } });
    if (open) assert.ok(["Requested. Your coordinator will confirm.", "You already have a shift that clashes with this one."].includes(((await doAction(ref, { action: "request_shift", shiftId: open.id })) as { message?: string; error?: string }).message ?? ((await doAction(ref, { action: "request_shift", shiftId: open.id })) as { error: string }).error));

    const off = await doAction(ref, { action: "add_unavailability", startsOn: "2027-01-04", endsOn: "2027-01-05", reason: "Holiday" });
    assert.equal(off.ok, true);
    const pending = await prisma.shiftRequest.findFirstOrThrow({ where: { carerId: carer.id, kind: "TIME_OFF", note: "Holiday" } });
    assert.equal((await doAction(ref, { action: "remove_unavailability", id: pending.id })).ok, true);
  } finally {
    await prisma.signal.deleteMany({ where: { carerId: carer.id, at: { gte: new Date(Date.now() - 120_000) } } });
    await prisma.shiftRequest.deleteMany({ where: { carerId: carer.id, createdAt: { gte: new Date(Date.now() - 120_000) } } });
    await prisma.shift.delete({ where: { id: shift.id } });
  }
});
