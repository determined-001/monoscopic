import { describe, it, expect } from "vitest";
import { assetKeyOf, parseAssetKey } from "./asset.js";

const ISSUER_A = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
const ISSUER_B = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

describe("assetKeyOf", () => {
  it("maps native to 'native'", () => {
    expect(assetKeyOf({ asset_type: "native" })).toBe("native");
  });

  it("maps credit_alphanum4 to CODE:ISSUER", () => {
    expect(
      assetKeyOf({
        asset_type: "credit_alphanum4",
        asset_code: "USDC",
        asset_issuer: ISSUER_A,
      }),
    ).toBe(`USDC:${ISSUER_A}`);
  });

  it("maps credit_alphanum12 to CODE:ISSUER", () => {
    expect(
      assetKeyOf({
        asset_type: "credit_alphanum12",
        asset_code: "LONGASSETNAM",
        asset_issuer: ISSUER_A,
      }),
    ).toBe(`LONGASSETNAM:${ISSUER_A}`);
  });

  it("gives two issuers of the same code DIFFERENT keys", () => {
    // Anyone can issue an asset called "USDC". If identity were the code alone,
    // a worthless look-alike would trigger alerts configured for the real asset.
    const a = assetKeyOf({
      asset_type: "credit_alphanum4",
      asset_code: "USDC",
      asset_issuer: ISSUER_A,
    });
    const b = assetKeyOf({
      asset_type: "credit_alphanum4",
      asset_code: "USDC",
      asset_issuer: ISSUER_B,
    });
    expect(a).not.toBe(b);
  });

  it("throws when an issued asset is missing code or issuer", () => {
    expect(() =>
      assetKeyOf({ asset_type: "credit_alphanum4", asset_code: "USDC" }),
    ).toThrow(/missing code\/issuer/);
    expect(() =>
      assetKeyOf({ asset_type: "credit_alphanum4", asset_issuer: ISSUER_A }),
    ).toThrow(/missing code\/issuer/);
  });
});

describe("parseAssetKey", () => {
  it("round-trips native", () => {
    expect(parseAssetKey("native")).toEqual({ native: true });
  });

  it("round-trips an issued asset", () => {
    expect(parseAssetKey(`USDC:${ISSUER_A}`)).toEqual({
      native: false,
      code: "USDC",
      issuer: ISSUER_A,
    });
  });

  it("rejects malformed keys", () => {
    expect(() => parseAssetKey(":ISSUER" as never)).toThrow(/invalid asset key/);
    expect(() => parseAssetKey("USDC:" as never)).toThrow(/invalid asset key/);
  });
});
