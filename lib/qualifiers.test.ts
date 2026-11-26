import assert from "node:assert/strict";
import { test } from "node:test";

import { emptyStats, readinessIssues, scoreRapport } from "./qualifiers";

test("rapport v0 rewards continuity and praise, explains itself", () => {
  const good = scoreRapport({ ...emptyStats(), visits: 12, onTime: 12, praise: 3, miles: 1.2 });
  assert.ok(good.score >= 90, `got ${good.score}`);
  assert.ok(good.reasons.some((r) => r.includes("3 praises")));

  const poor = scoreRapport({ ...emptyStats(), visits: 4, onTime: 2, late: 2, swapOffs: 3, miles: 12 });
  assert.ok(poor.score < 40, `got ${poor.score}`);
  assert.ok(poor.reasons[0]!.startsWith("−"));
});

test("rapport stays within 0..100", () => {
  assert.equal(scoreRapport({ ...emptyStats(), complaints: 9 }).score, 0);
  assert.equal(scoreRapport({ ...emptyStats(), visits: 99, praise: 99 }).score, 100);
});

test("readiness flags long days, overlaps, short rest and travel", () => {
  const d = (h: number, m = 0) => new Date(2026, 10, 30, h, m);
  const issues = readinessIssues(
    [
      { id: "long", startAt: d(6), endAt: d(19, 30), lat: 53.38, lng: -1.47, label: "long" },
      { id: "overlap", startAt: d(19), endAt: d(20), lat: 53.38, lng: -1.47, label: "overlap" },
      { id: "far", startAt: d(20, 10), endAt: d(21), lat: 53.48, lng: -2.24, label: "far" },
    ],
    48,
  );
  const ids = issues.map((i) => i.shiftId);
  assert.ok(ids.includes("long"));
  assert.ok(ids.includes("overlap"));
  assert.ok(ids.includes("far"));
});
