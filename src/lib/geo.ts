import { STOCKHOLM_CENTRAL } from "./domain";

export type LatLng = { lat: number; lng: number };

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance (haversine) in km, rounded to 0.1 km. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  const km = 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
  return Math.round(km * 10) / 10;
}

/**
 * Approximate centre points for 3-digit postal code areas in Stockholms län.
 * Good enough for "how far away is the workshop"; replace with a proper
 * postnummer dataset when we leave the prototype.
 */
const POSTAL_PREFIX_CENTRES: Record<string, LatLng> = {
  "100": { lat: 59.3326, lng: 18.0649 },
  "111": { lat: 59.3326, lng: 18.0649 },
  "112": { lat: 59.3326, lng: 18.0313 },
  "113": { lat: 59.3434, lng: 18.0583 },
  "114": { lat: 59.3405, lng: 18.0806 },
  "115": { lat: 59.3376, lng: 18.0959 },
  "116": { lat: 59.3126, lng: 18.0846 },
  "117": { lat: 59.3171, lng: 18.0391 },
  "118": { lat: 59.3176, lng: 18.0636 },
  "120": { lat: 59.2953, lng: 18.0851 },
  "121": { lat: 59.2933, lng: 18.0806 },
  "122": { lat: 59.2846, lng: 18.0697 },
  "123": { lat: 59.2441, lng: 18.0926 },
  "124": { lat: 59.2705, lng: 18.0498 },
  "125": { lat: 59.2832, lng: 18.0093 },
  "126": { lat: 59.3002, lng: 17.9788 },
  "127": { lat: 59.2774, lng: 17.9068 },
  "128": { lat: 59.2667, lng: 18.1336 },
  "129": { lat: 59.2905, lng: 17.9576 },
  "131": { lat: 59.3109, lng: 18.1636 },
  "132": { lat: 59.3155, lng: 18.2405 },
  "133": { lat: 59.2793, lng: 18.3008 },
  "134": { lat: 59.3223, lng: 18.3916 },
  "135": { lat: 59.2443, lng: 18.2286 },
  "136": { lat: 59.1676, lng: 18.1446 },
  "137": { lat: 59.1441, lng: 18.1166 },
  "141": { lat: 59.2368, lng: 17.9818 },
  "142": { lat: 59.2195, lng: 18.0544 },
  "143": { lat: 59.2591, lng: 17.8826 },
  "144": { lat: 59.1898, lng: 17.8285 },
  "145": { lat: 59.2421, lng: 17.8296 },
  "146": { lat: 59.2139, lng: 17.9056 },
  "147": { lat: 59.1997, lng: 17.8333 },
  "151": { lat: 59.1955, lng: 17.6253 },
  "152": { lat: 59.1955, lng: 17.6253 },
  "161": { lat: 59.3484, lng: 17.9299 },
  "162": { lat: 59.3618, lng: 17.8697 },
  "163": { lat: 59.3925, lng: 17.8948 },
  "164": { lat: 59.4003, lng: 17.9449 },
  "165": { lat: 59.3667, lng: 17.8296 },
  "167": { lat: 59.3363, lng: 17.9675 },
  "168": { lat: 59.3363, lng: 17.9389 },
  "169": { lat: 59.3605, lng: 18.0006 },
  "170": { lat: 59.3605, lng: 18.0006 },
  "171": { lat: 59.3600, lng: 18.0150 },
  "172": { lat: 59.3613, lng: 17.9715 },
  "174": { lat: 59.3613, lng: 17.9715 },
  "175": { lat: 59.4239, lng: 17.8355 },
  "176": { lat: 59.4239, lng: 17.8355 },
  "177": { lat: 59.4239, lng: 17.8355 },
  "178": { lat: 59.3333, lng: 17.7833 },
  "181": { lat: 59.3667, lng: 18.1333 },
  "182": { lat: 59.4061, lng: 18.0406 },
  "183": { lat: 59.4439, lng: 18.0687 },
  "184": { lat: 59.4794, lng: 18.2999 },
  "185": { lat: 59.4025, lng: 18.3519 },
  "186": { lat: 59.5344, lng: 18.0776 },
  "187": { lat: 59.4439, lng: 18.0687 },
  "191": { lat: 59.4281, lng: 17.9507 },
  "192": { lat: 59.4281, lng: 17.9507 },
  "193": { lat: 59.6186, lng: 17.8558 },
  "194": { lat: 59.5184, lng: 17.9116 },
  "195": { lat: 59.6186, lng: 17.8558 },
  "196": { lat: 59.4807, lng: 17.7461 },
  "197": { lat: 59.5139, lng: 17.6348 },
};

export function isValidPostalCode(input: string): boolean {
  return /^\d{5}$/.test(normalizePostalCode(input));
}

export function normalizePostalCode(input: string): string {
  return input.replace(/\s/g, "");
}

/** "14175" → "141 75". */
export function formatPostalCode(postalCode: string): string {
  const n = normalizePostalCode(postalCode);
  return n.length === 5 ? `${n.slice(0, 3)} ${n.slice(3)}` : n;
}

/** Resolve a postal code to coordinates, falling back to STOCKHOLM_CENTRAL. */
export function postalCodeToLatLng(postalCode: string | null | undefined): { point: LatLng; resolved: boolean } {
  if (!postalCode) return { point: STOCKHOLM_CENTRAL, resolved: false };
  const centre = POSTAL_PREFIX_CENTRES[normalizePostalCode(postalCode).slice(0, 3)];
  return centre ? { point: centre, resolved: true } : { point: STOCKHOLM_CENTRAL, resolved: false };
}
