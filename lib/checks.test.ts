import assert from "node:assert/strict";
import { test } from "node:test";

import { expiryState } from "./checks";
import { milesBetween } from "./geo";

const now = new Date("2026-11-26T10:00:00Z");
const inDays = (n: number) => new Date(now.getTime() + n * 86_400_000);

test("expiry states", () => {
  assert.equal(expiryState(null, now), "MISSING");
  assert.equal(expiryState({ expiresAt: null }, now), "OK");
  assert.equal(expiryState({ expiresAt: inDays(-1) }, now), "EXPIRED");
  assert.equal(expiryState({ expiresAt: inDays(30) }, now), "DUE_SOON");
  assert.equal(expiryState({ expiresAt: inDays(200) }, now), "OK");
});

test("distance", () => {
  assert.equal(milesBetween({ lat: null, lng: 1 }, { lat: 1, lng: 1 }), null);
  const d = milesBetween({ lat: 53.38, lng: -1.47 }, { lat: 53.48, lng: -2.24 })!; // ~ Sheffield to Manchester
  assert.ok(d > 30 && d < 36, `got ${d}`);
});
