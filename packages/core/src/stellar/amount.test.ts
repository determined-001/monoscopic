import { describe, it, expect } from "vitest";
import { toStroops, fromStroops, MAX_STROOPS } from "./amount.js";

describe("toStroops", () => {
  it("parses a canonical Horizon amount", () => {
    expect(toStroops("1234.5678900")).toBe(12345678900n);
  });

  it("parses an integer amount with no decimal point", () => {
    expect(toStroops("100")).toBe(1000000000n);
  });

  it("parses the smallest unit", () => {
    expect(toStroops("0.0000001")).toBe(1n);
  });

  it("parses zero", () => {
    expect(toStroops("0")).toBe(0n);
    expect(toStroops("0.0000000")).toBe(0n);
  });

  it("pads short fractions correctly", () => {
    expect(toStroops("1.5")).toBe(15000000n);
    expect(toStroops("0.01")).toBe(100000n);
  });

  it("parses the maximum Stellar amount exactly", () => {
    // The float trap: parseFloat("922337203685.4775807") * 1e7 loses precision.
    // This assertion is the reason toStroops does string math.
    expect(toStroops("922337203685.4775807")).toBe(MAX_STROOPS);
    expect(toStroops("922337203685.4775807")).toBe(9223372036854775807n);
  });

  it("handles negative amounts", () => {
    expect(toStroops("-1.5")).toBe(-15000000n);
  });

  it("rejects more precision than Stellar can represent", () => {
    // 8 decimal places — truncating silently would misreport the amount.
    expect(() => toStroops("1.23456789")).toThrow(/invalid Stellar amount/);
  });

  it("rejects non-numeric and empty input", () => {
    expect(() => toStroops("abc")).toThrow(/invalid Stellar amount/);
    expect(() => toStroops("")).toThrow(/invalid Stellar amount/);
    expect(() => toStroops("1.2.3")).toThrow(/invalid Stellar amount/);
    expect(() => toStroops("1e10")).toThrow(/invalid Stellar amount/);
  });

  it("rejects amounts beyond i64 range", () => {
    expect(() => toStroops("922337203685.4775808")).toThrow(/out of range/);
  });
});

describe("fromStroops", () => {
  it("renders the canonical 7-decimal form", () => {
    expect(fromStroops(12345678900n)).toBe("1234.5678900");
    expect(fromStroops(1n)).toBe("0.0000001");
    expect(fromStroops(0n)).toBe("0.0000000");
    expect(fromStroops(1000000000n)).toBe("100.0000000");
  });

  it("renders the maximum exactly", () => {
    expect(fromStroops(MAX_STROOPS)).toBe("922337203685.4775807");
  });

  it("renders negatives", () => {
    expect(fromStroops(-15000000n)).toBe("-1.5000000");
  });
});

describe("round trip", () => {
  it("fromStroops(toStroops(x)) === x for canonical input", () => {
    const canonical = [
      "0.0000000",
      "0.0000001",
      "1.0000000",
      "1234.5678900",
      "922337203685.4775807",
      "-1.5000000",
    ];
    for (const x of canonical) {
      expect(fromStroops(toStroops(x))).toBe(x);
    }
  });

  it("toStroops(fromStroops(x)) === x for arbitrary stroops", () => {
    const values = [0n, 1n, 7n, 10000000n, 12345678900n, MAX_STROOPS];
    for (const x of values) {
      expect(toStroops(fromStroops(x))).toBe(x);
    }
  });
});
