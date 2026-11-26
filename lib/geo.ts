/** Straight-line distance in miles between two points (haversine). */
export function milesBetween(a: { lat: number | null; lng: number | null }, b: { lat: number | null; lng: number | null }): number | null {
  if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) return null;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.sqrt(h));
}

/**
 * Looks up a UK postcode's coordinates (postcodes.io, a free public service).
 * Only the postcode is sent. Returns null when it can't be found or reached,
 * and distance-based checks then say "distance unknown".
 */
export async function geocodePostcode(postcode: string | null | undefined): Promise<{ lat: number; lng: number } | null> {
  const clean = postcode?.replace(/\s+/g, "").toUpperCase();
  if (!clean || !/^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(clean)) return null;
  try {
    const res = await fetch(`https://api.postcodes.io/postcodes/${clean}`, { signal: AbortSignal.timeout(3_000) });
    if (!res.ok) return null;
    const json = (await res.json()) as { result?: { latitude?: number; longitude?: number } };
    const { latitude, longitude } = json.result ?? {};
    return typeof latitude === "number" && typeof longitude === "number" ? { lat: latitude, lng: longitude } : null;
  } catch {
    return null;
  }
}
