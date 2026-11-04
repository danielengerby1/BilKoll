import { describe, expect, it } from "vitest";
import {
  detectFuel,
  normalizeMake,
  parseBiluppgifterVehicle,
  splitModel,
} from "@/server/vehicle-data/biluppgifter-parse";

// Shape from https://apidocs.biluppgifter.se (trimmed).
const sample = {
  data: {
    type: "vehicle",
    attributes: { regno: "EYS061", vin: "WDD2462001N016340" },
    basic: { data: { make: "Mercedes", model: "B 180 CDI", color: "Vit", type: "PB", model_year: 2012 } },
    inspection: { data: { inspection_valid_until: "2019-03-31T00:00:00+01:00" } },
    status: { data: { first_registered: "2012-08-29" } },
    technical: { data: { power_hp_1: 109, fuel_1: "Diesel", gearbox: "Automat" } },
    owner: { data: { name: "should never be read" } },
  },
};

describe("parseBiluppgifterVehicle", () => {
  it("maps the documented response", () => {
    const v = parseBiluppgifterVehicle("EYS061", sample);
    expect(v).toMatchObject({
      regnr: "EYS061",
      make: "Mercedes-Benz",
      model: "B",
      variant: "180 CDI",
      year: 2012,
      fuelType: "DIESEL",
      transmission: "AUTOMAT",
    });
    expect(v?.nextInspection?.toISOString()).toBe("2019-03-30T23:00:00.000Z");
    expect(JSON.stringify(v)).not.toContain("should never be read");
  });

  it("falls back to first registration year", () => {
    const body = { data: { basic: { data: { make: "Volvo", model: "XC60 B4 AWD" } }, status: { data: { first_registered: "2020-05-01" } } } };
    expect(parseBiluppgifterVehicle("ABC123", body)?.year).toBe(2020);
  });

  it("returns null when the vehicle is missing", () => {
    expect(parseBiluppgifterVehicle("ABC123", { data: {} })).toBeNull();
    expect(parseBiluppgifterVehicle("ABC123", null)).toBeNull();
  });
});

describe("helpers", () => {
  it("normalises makes", () => {
    expect(normalizeMake("VW")).toBe("Volkswagen");
    expect(normalizeMake("VOLVO")).toBe("Volvo");
    expect(normalizeMake("land rover")).toBe("Land Rover");
  });

  it("splits models using our guides", () => {
    expect(splitModel("Tesla", "Model Y Long Range")).toEqual({ model: "Model Y", variant: "Long Range" });
    expect(splitModel("Volvo", "XC60 B4 AWD")).toEqual({ model: "XC60", variant: "B4 AWD" });
    expect(splitModel("Saab", "9-5 Aero")).toEqual({ model: "9-5", variant: "Aero" });
  });

  it("detects fuel from text or model name", () => {
    expect(detectFuel({ fuel: "Bensin" }, "Volvo", "XC40")).toBe("BENSIN");
    expect(detectFuel({}, "Tesla", "Model 3")).toBe("EL");
    expect(detectFuel({}, "Volvo", "V60 T6 Recharge")).toBe("LADDHYBRID");
    expect(detectFuel({}, "Toyota", "Corolla Hybrid")).toBe("HYBRID");
    expect(detectFuel({}, "Volkswagen", "Golf")).toBe("OKAND");
  });
});
