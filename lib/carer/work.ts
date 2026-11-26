// What a carer does in the Aultrum carer app, applied with Flowstate's rules.
import { prisma } from "@/lib/db";
import { checkIn, checkOut, requestOpenShift, type Result } from "@/lib/shifts";

import type { CarerRef } from "./api";

type Out = { ok: true; message?: string } | { ok: false; error: string };
const fromResult = (r: Result): Out => (r.ok ? { ok: true, message: r.message } : { ok: false, error: r.error });

async function ownShift(c: CarerRef, id: string) {
  return prisma.shift.findFirst({ where: { id, agencyId: c.agencyId, carerId: c.carerId } });
}

export async function doAction(c: CarerRef, body: Record<string, unknown>, now = new Date()): Promise<Out> {
  const str = (k: string) => (typeof body[k] === "string" ? (body[k] as string) : "");
  switch (body.action) {
    case "clock_in":
      return fromResult(await checkIn(c.agencyId, c.carerId, str("shiftId"), now));
    case "clock_out":
      return fromResult(await checkOut(c.agencyId, c.carerId, str("timesheetId"), now));
    case "start_break": {
      const s = await ownShift(c, str("timesheetId"));
      if (!s?.checkInAt || s.checkOutAt) return { ok: false, error: "You're not on this shift" };
      if (s.breakStartedAt) return { ok: false, error: "You're already on a break" };
      await prisma.shift.update({ where: { id: s.id }, data: { breakStartedAt: now } });
      return { ok: true, message: "Break started" };
    }
    case "end_break": {
      const s = await ownShift(c, str("timesheetId"));
      if (!s?.breakStartedAt) return { ok: false, error: "You're not on a break" };
      const mins = Math.round((now.getTime() - s.breakStartedAt.getTime()) / 60_000);
      await prisma.shift.update({ where: { id: s.id }, data: { breakStartedAt: null, breakMins: s.breakMins + mins } });
      return { ok: true, message: `Break ended (${mins} min)` };
    }
    case "sign_carer": {
      const s = await ownShift(c, str("timesheetId"));
      if (!s?.checkOutAt) return { ok: false, error: "Check out first" };
      if (s.carerSignedAt) return { ok: true, message: "Already signed" };
      await prisma.shift.update({ where: { id: s.id }, data: { carerSignedAt: now } });
      return { ok: true, message: "Signed. Thank you." };
    }
    case "sign_client":
      return { ok: false, error: "Flowstate visits don't need a client signature." };
    case "request_shift": {
      const outcome = await requestOpenShift(c.agencyId, c.carerId, str("shiftId"), str("message"));
      return {
        requested: { ok: true as const, message: "Requested. Your coordinator will confirm." },
        overlap: { ok: false as const, error: "You already have a shift that clashes with this one." },
        gone: { ok: false as const, error: "That shift has just been filled." },
      }[outcome];
    }
    case "respond_offer":
      return { ok: false, error: "This offer has closed." };
    case "add_unavailability": {
      const startsOn = str("startsOn");
      const endsOn = str("endsOn") || startsOn;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(startsOn) || !/^\d{4}-\d{2}-\d{2}$/.test(endsOn) || endsOn < startsOn) return { ok: false, error: "Choose the days" };
      await prisma.shiftRequest.create({
        data: { agencyId: c.agencyId, carerId: c.carerId, kind: "TIME_OFF", startAt: new Date(`${startsOn}T00:00:00`), endAt: new Date(`${endsOn}T23:59:00`), note: str("reason").slice(0, 120) || null },
      });
      return { ok: true, message: "Sent to your coordinator." };
    }
    case "remove_unavailability": {
      const r = await prisma.shiftRequest.findFirst({ where: { id: str("id"), carerId: c.carerId, kind: "TIME_OFF", status: "PENDING" } });
      if (!r) return { ok: false, error: "Only a request that's still waiting can be withdrawn" };
      await prisma.shiftRequest.delete({ where: { id: r.id } });
      return { ok: true, message: "Withdrawn" };
    }
    default:
      return { ok: false, error: "Unknown action" };
  }
}
