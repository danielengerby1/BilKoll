import { CAR_MODEL_GUIDES } from "@/lib/car-models";
import type { FuelType, Transmission } from "@/lib/domain";
import type { VehicleRecord } from "./types";

/**
 * Pure mapping from a Biluppgifter API vehicle response to our VehicleRecord.
 * Docs: https://apidocs.biluppgifter.se – several technical field names are
 * not documented, so parsing is deliberately tolerant. Owner data is never read.
 */

type Json = Record<string, unknown>;

const obj = (v: unknown): Json => (v && typeof v === "object" && !Array.isArray(v) ? (v as Json) : {});
const str = (v: unknown): string | null => (typeof v === "string" && v.trim() !== "" ? v.trim() : null);
const num = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
};

const MAKE_ALIASES: Record<string, string> = {
  vw: "Volkswagen",
  volkswagen: "Volkswagen",
  mercedes: "Mercedes-Benz",
  "mercedes-benz": "Mercedes-Benz",
  bmw: "BMW",
  kia: "Kia",
  skoda: "Skoda",
  škoda: "Skoda",
};

export function normalizeMake(raw: string): string {
  const key = raw.trim().toLowerCase();
  if (MAKE_ALIASES[key]) return MAKE_ALIASES[key];
  return key.replace(/(^|[\s-])\p{L}/gu, (c) => c.toUpperCase());
}

/** "XC60 B4 AWD" → { model: "XC60", variant: "B4 AWD" }; uses our guides for two-word models like "Model Y". */
export function splitModel(make: string, rawModel: string): { model: string; variant: string | null } {
  const lower = rawModel.toLowerCase();
  const guide = CAR_MODEL_GUIDES.filter((g) => g.make.toLowerCase() === make.toLowerCase())
    .sort((a, b) => b.model.length - a.model.length)
    .find((g) => lower === g.model.toLowerCase() || lower.startsWith(`${g.model.toLowerCase()} `));
  if (guide) {
    const rest = rawModel.slice(guide.model.length).trim();
    return { model: guide.model, variant: rest || null };
  }
  const [first, ...rest] = rawModel.trim().split(/\s+/);
  return { model: first ?? rawModel, variant: rest.length ? rest.join(" ") : null };
}

/** Collect string/number values whose key mentions one of the hints. */
function valuesForKeys(source: Json, hints: readonly string[]): unknown[] {
  return Object.entries(source)
    .filter(([k]) => hints.some((h) => k.toLowerCase().includes(h)))
    .map(([, v]) => v);
}

export function detectFuel(technical: Json, make: string, fullModel: string): FuelType {
  const texts = valuesForKeys(technical, ["fuel", "drivmedel", "bransle"])
    .map((v) => (typeof v === "string" ? v.toLowerCase() : typeof v === "number" ? String(v) : ""))
    .join(" ");
  if (/laddhybrid|plug-?in|phev/.test(texts)) return "LADDHYBRID";
  if (/elhybrid|hybrid/.test(texts)) return "HYBRID";
  if (/\bel\b|electric|elektri/.test(texts)) return "EL";
  if (/diesel|\b2\b/.test(texts)) return "DIESEL"; // code 2 = Diesel per Biluppgifter docs
  if (/etanol|e85/.test(texts)) return "ETANOL";
  if (/gas|cng|biogas/.test(texts)) return "GAS";
  if (/bensin|petrol|gasoline/.test(texts)) return "BENSIN";

  // Fall back on unmistakable model names.
  const m = `${make} ${fullModel}`.toLowerCase();
  if (/^(tesla|polestar)\b/.test(m) || /\b(id\.\d|e-tron|ioniq 5|ev\d|ex\d0)\b/.test(m)) return "EL";
  if (/recharge|plug-in|phev|\bt8\b|\bt6\b.*recharge|gte\b/.test(m)) return "LADDHYBRID";
  if (/hybrid/.test(m)) return "HYBRID";
  if (/\b(tdi|cdi|crdi|d\d)\b/.test(m)) return "DIESEL";
  return "OKAND";
}

export function detectTransmission(technical: Json): Transmission | null {
  const texts = valuesForKeys(technical, ["gear", "transmission", "vaxellada"])
    .map((v) => (typeof v === "string" ? v.toLowerCase() : typeof v === "number" ? String(v) : ""))
    .join(" ");
  if (/automat|automatic|\b2\b/.test(texts)) return "AUTOMAT"; // code 2 = Automat per docs
  if (/manuell|manual/.test(texts)) return "MANUELL";
  return null;
}

function parseDate(v: unknown): Date | null {
  const s = str(v);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Returns null when the response has no usable vehicle. */
export function parseBiluppgifterVehicle(regnr: string, body: unknown): VehicleRecord | null {
  const data = obj(obj(body).data);
  const basic = obj(obj(data.basic).data);
  const technical = obj(obj(data.technical).data);
  const inspection = obj(obj(data.inspection).data);
  const status = obj(obj(data.status).data);

  const rawMake = str(basic.make);
  const rawModel = str(basic.model);
  if (!rawMake || !rawModel) return null;

  const make = normalizeMake(rawMake);
  const { model, variant } = splitModel(make, rawModel);
  const firstRegistered = parseDate(status.first_registered);
  const year = num(basic.model_year) ?? num(basic.vehicle_year) ?? firstRegistered?.getUTCFullYear() ?? null;
  if (!year) return null;

  return {
    regnr,
    make,
    model,
    variant,
    year,
    fuelType: detectFuel(technical, make, rawModel),
    transmission: detectTransmission(technical),
    engineCode: str(technical.engine_code) ?? null,
    nextInspection: parseDate(inspection.inspection_valid_until),
  };
}
