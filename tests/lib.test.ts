import { describe, expect, it } from "vitest";
import { formatSek, median, parseSekInput, laborCostSek } from "@/lib/money";
import { formatRegnr, isValidRegnr, normalizeRegnr } from "@/lib/regnr";
import { distanceKm, formatPostalCode, isValidPostalCode, postalCodeToLatLng } from "@/lib/geo";
import { STOCKHOLM_CENTRAL } from "@/lib/domain";
import { findCarModelGuide, servicesNotApplicable } from "@/lib/car-models";

describe("money", () => {
  it("formats whole SEK with Swedish spacing", () => {
    expect(formatSek(1990)).toBe("1 990 kr");
    expect(formatSek(12345.6)).toBe("12 346 kr");
  });

  it("computes median for odd and even lists", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(3);
    expect(median([])).toBeNull();
  });

  it("parses Swedish amount input", () => {
    expect(parseSekInput("1 990 kr")).toBe(1990);
    expect(parseSekInput("1.990")).toBe(1990);
    expect(parseSekInput("1990,50")).toBe(1991);
    expect(parseSekInput("abc")).toBeNull();
    expect(parseSekInput("")).toBeNull();
  });

  it("rounds labour cost to whole kronor", () => {
    expect(laborCostSek(1.3, 1650)).toBe(2145);
  });
});

describe("regnr", () => {
  it("normalises spaces, dashes and case", () => {
    expect(normalizeRegnr(" abc 123 ")).toBe("ABC123");
    expect(normalizeRegnr("abc-12d")).toBe("ABC12D");
  });

  it("accepts old and new formats", () => {
    expect(isValidRegnr("ABC 123")).toBe(true);
    expect(isValidRegnr("ABC 12D")).toBe(true);
  });

  it("rejects invalid plates", () => {
    expect(isValidRegnr("AB123")).toBe(false);
    expect(isValidRegnr("ABC12O")).toBe(false); // O not allowed last
    expect(isValidRegnr("AQC123")).toBe(false); // Q not used
  });

  it("formats with a space", () => {
    expect(formatRegnr("abc123")).toBe("ABC 123");
  });
});

describe("geo", () => {
  it("computes haversine distance", () => {
    // Stockholm central → Kungens Kurva is roughly 11–13 km
    const d = distanceKm(STOCKHOLM_CENTRAL, { lat: 59.2700, lng: 17.9150 });
    expect(d).toBeGreaterThan(10);
    expect(d).toBeLessThan(14);
    expect(distanceKm(STOCKHOLM_CENTRAL, STOCKHOLM_CENTRAL)).toBe(0);
  });

  it("resolves known postal areas and falls back to central", () => {
    expect(postalCodeToLatLng("171 48").resolved).toBe(true);
    const unknown = postalCodeToLatLng("99999");
    expect(unknown.resolved).toBe(false);
    expect(unknown.point).toEqual(STOCKHOLM_CENTRAL);
    expect(postalCodeToLatLng(null).resolved).toBe(false);
  });

  it("validates and formats postal codes", () => {
    expect(isValidPostalCode("141 75")).toBe(true);
    expect(isValidPostalCode("1417")).toBe(false);
    expect(formatPostalCode("14175")).toBe("141 75");
  });
});

describe("car guides", () => {
  it("finds common models case-insensitively", () => {
    expect(findCarModelGuide("volvo", "xc60")?.slug).toBe("volvo-xc60");
    expect(findCarModelGuide("VW", "Golf")?.slug).toBe("vw-golf");
    expect(findCarModelGuide("Saab", "9-5")).toBeUndefined();
  });

  it("marks oil change as not applicable for EVs", () => {
    expect(servicesNotApplicable("EL")).toContain("oljebyte");
    expect(servicesNotApplicable("BENSIN")).toEqual([]);
  });
});
