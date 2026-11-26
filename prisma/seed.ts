// Demo data: a fictional home-care agency. Names, places and people are made up.
import { PrismaClient, type SignalKind } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Deterministic "random" so every seed looks the same.
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)]!;

const DAY = 86_400_000;
const at = (base: Date, days: number, hhmm: string) => {
  const d = new Date(base.getTime() + days * DAY);
  const [h, m] = hhmm.split(":").map(Number);
  d.setHours(h!, m!, 0, 0);
  return d;
};

async function main() {
  await prisma.agency.deleteMany();
  const agency = await prisma.agency.create({ data: { name: "Northfield Home Care" } });
  const hash = await bcrypt.hash("flowstate123", 10);
  await prisma.user.createMany({
    data: [
      { agencyId: agency.id, email: "admin@flowstate.demo", name: "Ada Okafor", role: "ADMIN", passwordHash: hash },
      { agencyId: agency.id, email: "coordinator@flowstate.demo", name: "Tom Bright", role: "COORDINATOR", passwordHash: hash },
    ],
  });

  const assistant = await prisma.jobRole.create({ data: { agencyId: agency.id, name: "Care assistant", requiredTraining: ["Care Certificate", "Moving and handling"] } });
  const senior = await prisma.jobRole.create({ data: { agencyId: agency.id, name: "Senior carer", requiredTraining: ["Care Certificate", "Moving and handling", "Medication awareness"] } });

  // Carers around a fictional town centre (lat/lng roughly 53.38, -1.47).
  const people = [
    ["Sarah", "Mensah", "S10 2AA", 53.381, -1.501],
    ["Mark", "Ellis", "S11 8BB", 53.365, -1.495],
    ["Priya", "Nair", "S2 4CC", 53.368, -1.457],
    ["Daniel", "Reid", "S6 3DD", 53.398, -1.497],
    ["Grace", "Owusu", "S8 0EE", 53.344, -1.476],
    ["Liam", "Carter", "S5 6FF", 53.414, -1.454],
    ["Joy", "Adeleke", "S12 2GG", 53.343, -1.402],
    ["Ben", "Walsh", "S35 1HH", 53.457, -1.469],
  ] as const;
  const carers = [];
  for (const [i, [firstName, lastName, postcode, lat, lng]] of people.entries()) {
    carers.push(
      await prisma.carer.create({
        data: {
          agencyId: agency.id,
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}@northfield.example`,
          postcode,
          lat,
          lng,
          jobTitle: i < 3 ? "Senior carer" : "Care assistant",
          status: i === 7 ? "ONBOARDING" : "ACTIVE",
        },
      }),
    );
  }

  const now = new Date();
  const year = (n: number) => new Date(now.getTime() + n * 365 * DAY);
  for (const [i, c] of carers.entries()) {
    const checks = [
      // Grace's DBS expired; Liam's right to work is due soon; Ben has no DBS yet.
      i !== 7 ? { kind: "DBS" as const, name: "Enhanced DBS", expiresAt: i === 4 ? new Date(now.getTime() - 5 * DAY) : year(2) } : null,
      { kind: "RIGHT_TO_WORK" as const, name: "Right to work", expiresAt: i === 5 ? new Date(now.getTime() + 20 * DAY) : null },
      { kind: "TRAINING" as const, name: "Care Certificate", expiresAt: null },
      i !== 6 ? { kind: "TRAINING" as const, name: "Moving and handling", expiresAt: i === 3 ? new Date(now.getTime() + 30 * DAY) : year(1) } : null,
      i < 3 ? { kind: "TRAINING" as const, name: "Medication awareness", expiresAt: year(1) } : null,
    ].filter(Boolean) as { kind: "DBS" | "RIGHT_TO_WORK" | "TRAINING"; name: string; expiresAt: Date | null }[];
    await prisma.check.createMany({ data: checks.map((k) => ({ ...k, carerId: c.id, verifiedAt: now })) });
  }

  const packagesData = [
    { kind: "CARE_RECEIVER" as const, name: "Mrs A.", postcode: "S10 3JJ", lat: 53.378, lng: -1.52, fundingBody: "City council" },
    { kind: "CARE_RECEIVER" as const, name: "Mr B.", postcode: "S11 9KK", lat: 53.36, lng: -1.51, fundingBody: "Self-funded" },
    { kind: "CARE_RECEIVER" as const, name: "Mrs C.", postcode: "S2 5LL", lat: 53.366, lng: -1.45, fundingBody: "City council" },
    { kind: "CARE_RECEIVER" as const, name: "Mr D.", postcode: "S6 4MM", lat: 53.402, lng: -1.51, fundingBody: "NHS continuing care" },
    { kind: "CARE_RECEIVER" as const, name: "Mrs E.", postcode: "S5 7NN", lat: 53.42, lng: -1.45, fundingBody: "City council" },
    { kind: "CARE_HOME" as const, name: "Oakwood House", postcode: "S8 1PP", lat: 53.35, lng: -1.48, fundingBody: "Oakwood House Ltd" },
  ];
  const packages = [];
  for (const p of packagesData) {
    packages.push(await prisma.package.create({ data: { ...p, agencyId: agency.id, address: `${p.postcode} (demo address)`, accessInstructions: "Key safe by the front door — code held by coordinator", hourlyRate: 24.5 } }));
  }

  // Teams: each Package has a small regular team.
  const teams: number[][] = [[0, 1], [1, 3], [2, 4], [3, 0], [5, 6], [2, 4, 6]];
  for (const [p, members] of teams.entries()) {
    for (const [j, c] of members.entries()) {
      await prisma.teamMember.create({ data: { packageId: packages[p]!.id, carerId: carers[c]!.id, primary: j === 0 } });
    }
  }
  await prisma.keyPerson.createMany({
    data: [
      { packageId: packages[0]!.id, name: "Helen A.", relationship: "Daughter", email: "helen@example.com" },
      { packageId: packages[1]!.id, name: "Peter B.", relationship: "Son" },
      { packageId: packages[2]!.id, name: "Ruth C.", relationship: "Niece" },
      { packageId: packages[5]!.id, name: "Oakwood House manager", relationship: "Home manager" },
    ],
  });

  // Rotas: morning and evening visits.
  for (const [p, pkg] of packages.entries()) {
    const rota = await prisma.rota.create({ data: { agencyId: agency.id, packageId: pkg.id, name: pkg.kind === "CARE_HOME" ? "Day shifts" : "Morning and evening visits" } });
    for (let weekday = 0; weekday < 7; weekday++) {
      if (pkg.kind === "CARE_HOME") {
        await prisma.rotaLine.create({ data: { rotaId: rota.id, weekday, startTime: "08:00", endTime: "20:00", jobRoleId: senior.id, carerId: carers[teams[p]![weekday % teams[p]!.length]!]!.id } });
      } else {
        await prisma.rotaLine.create({ data: { rotaId: rota.id, weekday, startTime: "08:00", endTime: "09:00", jobRoleId: assistant.id, carerId: carers[teams[p]![0]!]!.id } });
        await prisma.rotaLine.create({ data: { rotaId: rota.id, weekday, startTime: "18:00", endTime: "19:00", jobRoleId: assistant.id, carerId: carers[teams[p]![1]!]!.id } });
      }
    }
  }

  // Three weeks of past visits, with check-ins, and the signals they produce.
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const signals: { kind: SignalKind; carerId: string; packageId: string; at: Date; value?: number }[] = [];
  for (let d = -21; d <= 7; d++) {
    for (const [p, pkg] of packages.entries()) {
      const slots = pkg.kind === "CARE_HOME" ? [["08:00", "20:00"]] : [["08:00", "09:00"], ["18:00", "19:00"]];
      for (const [s, [start, end]] of slots.entries()) {
        const team = teams[p]!;
        // Mrs C. (package 2) sees whoever is free: poor continuity.
        let carerIdx = p === 2 ? pick([0, 1, 2, 3, 4, 5, 6]) : team[(s + Math.max(0, d)) % team.length]!;
        // Mark keeps getting moved off Mr B.'s visits.
        if (p === 1 && rand() < 0.3) carerIdx = 5;
        const startAt = at(today, d, start!);
        const endAt = at(today, d, end!);
        const past = endAt < now;
        const open = !past && d >= 2 && rand() < 0.15;
        const late = past && (carerIdx === 3 ? rand() < 0.5 : rand() < 0.08);
        const lateMins = late ? 12 + Math.floor(rand() * 25) : Math.floor(rand() * 4);
        const noShow = past && carerIdx === 5 && rand() < 0.1;
        const shift = await prisma.shift.create({
          data: {
            agencyId: agency.id,
            packageId: pkg.id,
            carerId: open ? null : carers[carerIdx]!.id,
            jobRoleId: pkg.kind === "CARE_HOME" ? senior.id : assistant.id,
            startAt,
            endAt,
            status: open ? "OPEN" : past ? (noShow ? "CANCELLED" : "COMPLETED") : "BOOKED",
            cancelledBy: noShow ? "CARER" : null,
            checkInAt: past && !noShow ? new Date(startAt.getTime() + lateMins * 60_000) : null,
            checkOutAt: past && !noShow ? endAt : null,
            carerSignedAt: past && !noShow ? endAt : null,
          },
        });
        if (past && !open) {
          const carerId = carers[carerIdx]!.id;
          if (noShow) signals.push({ kind: "NO_SHOW", carerId, packageId: pkg.id, at: startAt });
          else {
            signals.push({ kind: "SHIFT_COMPLETED", carerId, packageId: pkg.id, at: endAt });
            signals.push({ kind: late ? "LATE" : "ON_TIME", carerId, packageId: pkg.id, at: shift.checkInAt!, value: lateMins });
          }
        }
      }
    }
  }

  // A long day for Priya tomorrow: Shift Readiness should flag it.
  await prisma.shift.create({
    data: { agencyId: agency.id, packageId: packages[5]!.id, carerId: carers[2]!.id, jobRoleId: senior.id, startAt: at(today, 1, "06:00"), endAt: at(today, 1, "19:30"), status: "BOOKED" },
  });
  // Grace (expired DBS) is booked next week: Compliance should block it.
  await prisma.shift.create({
    data: { agencyId: agency.id, packageId: packages[2]!.id, carerId: carers[4]!.id, jobRoleId: assistant.id, startAt: at(today, 3, "12:00"), endAt: at(today, 3, "13:00"), status: "BOOKED" },
  });
  // Joy (no moving and handling) booked as a senior at Oakwood: Competence should flag it.
  await prisma.shift.create({
    data: { agencyId: agency.id, packageId: packages[5]!.id, carerId: carers[6]!.id, jobRoleId: senior.id, startAt: at(today, 2, "20:00"), endAt: at(today, 2, "23:00"), status: "BOOKED" },
  });

  // Praise from families, teammates and coordinators.
  const praise = [
    [0, 0, "KEY_PERSON", "Helen A.", "Sarah always makes Mum laugh. Thank you."],
    [0, 0, "KEY_PERSON", "Helen A.", "Thank you for staying a few minutes longer on Sunday."],
    [0, 0, "COORDINATOR", "Tom Bright", "Brilliant handover notes on timings this week."],
    [4, 5, "KEY_PERSON", "Oakwood House manager", "Grace was a great help on the busy Saturday."],
    [1, 0, "KEY_PERSON", "Helen A.", "Mark was lovely on the evening visit."],
    [6, 5, "TEAMMATE", "Priya Nair", "Joy covered my break without being asked."],
    [2, 2, "KEY_PERSON", "Ruth C.", "Thank you Priya, she was so pleased to see you again."],
  ] as const;
  for (const [i, [c, p, from, fromName, message]] of praise.entries()) {
    const when = new Date(now.getTime() - (i + 1) * 2 * DAY);
    await prisma.praise.create({ data: { agencyId: agency.id, carerId: carers[c]!.id, packageId: packages[p]!.id, from, fromName, message, createdAt: when } });
    signals.push({ kind: "PRAISE", carerId: carers[c]!.id, packageId: packages[p]!.id, at: when });
  }

  // Requests from carers, and the signals some of them carry.
  const markShift = await prisma.shift.findFirst({ where: { packageId: packages[1]!.id, carerId: carers[1]!.id, startAt: { gt: now } }, orderBy: { startAt: "asc" } });
  await prisma.shiftRequest.createMany({
    data: [
      { agencyId: agency.id, carerId: carers[1]!.id, kind: "SWAP", shiftId: markShift?.id, note: "Can someone swap this one with me?" },
      { agencyId: agency.id, carerId: carers[3]!.id, kind: "TIME_OFF", startAt: at(today, 10, "00:00"), endAt: at(today, 12, "23:59"), note: "Family wedding" },
      { agencyId: agency.id, carerId: carers[0]!.id, kind: "SHIFT", note: "Happy to pick up extra evenings this week" },
    ],
  });
  for (let i = 0; i < 3; i++) signals.push({ kind: "SWAP_OFF", carerId: carers[1]!.id, packageId: packages[1]!.id, at: new Date(now.getTime() - (i * 5 + 1) * DAY) });
  signals.push({ kind: "CHANGE_CARER_ASKED", carerId: carers[3]!.id, packageId: packages[3]!.id, at: new Date(now.getTime() - 4 * DAY) });
  for (const c of [0, 2, 4]) signals.push({ kind: "OFFER_ACCEPTED", carerId: carers[c]!.id, packageId: packages[2]!.id, at: new Date(now.getTime() - 3 * DAY) });
  signals.push({ kind: "OFFER_DECLINED", carerId: carers[5]!.id, packageId: packages[1]!.id, at: new Date(now.getTime() - 2 * DAY) });

  await prisma.signal.createMany({ data: signals.map((s) => ({ ...s, agencyId: agency.id })) });
  console.log(`Seeded ${agency.name}: ${carers.length} carers, ${packages.length} packages, ${signals.length} signals.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
