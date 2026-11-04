import { describe, expect, it } from "vitest";
import { collectMakes, isAuthorizedFor, shouldShowWorkshop } from "@/features/comparison/filter";

const chain = { isAuthorized: false, authorizedMakes: null };
const volvo = { isAuthorized: true, authorizedMakes: "Volvo,Polestar" };
const kia = { isAuthorized: true, authorizedMakes: "Kia" };

describe("shouldShowWorkshop", () => {
  it("ALLA shows chains plus dealers for the user's make only", () => {
    expect(shouldShowWorkshop(chain, "ALLA", "Volvo")).toBe(true);
    expect(shouldShowWorkshop(volvo, "ALLA", "Volvo")).toBe(true);
    expect(shouldShowWorkshop(kia, "ALLA", "Volvo")).toBe(false);
  });

  it("ALLA without a make hides dealers", () => {
    expect(shouldShowWorkshop(chain, "ALLA", null)).toBe(true);
    expect(shouldShowWorkshop(volvo, "ALLA", null)).toBe(false);
  });

  it("OBEROENDE hides every dealer", () => {
    expect(shouldShowWorkshop(volvo, "OBEROENDE", "Volvo")).toBe(false);
    expect(shouldShowWorkshop(chain, "OBEROENDE", "Volvo")).toBe(true);
  });

  it("MARKE shows only dealers, filtered by make when given", () => {
    expect(shouldShowWorkshop(chain, "MARKE", null)).toBe(false);
    expect(shouldShowWorkshop(kia, "MARKE", null)).toBe(true);
    expect(shouldShowWorkshop(kia, "MARKE", "Volvo")).toBe(false);
    expect(shouldShowWorkshop(volvo, "MARKE", "polestar")).toBe(true);
  });
});

describe("makes", () => {
  it("matches case-insensitively and collects distinct makes", () => {
    expect(isAuthorizedFor("Volvo,Polestar", "POLESTAR")).toBe(true);
    expect(isAuthorizedFor(null, "Volvo")).toBe(false);
    expect(collectMakes([chain, volvo, kia, { isAuthorized: true, authorizedMakes: "Volvo" }])).toEqual(["Kia", "Polestar", "Volvo"]);
  });
});
