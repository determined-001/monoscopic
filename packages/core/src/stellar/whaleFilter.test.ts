import { describe, it, expect } from "vitest";
import { qualifies, type Threshold } from "./whaleFilter.js";
import type { AssetKey } from "./asset.js";

const ISSUER_A = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
const ISSUER_B = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const USDC_A = `USDC:${ISSUER_A}` as AssetKey;
const USDC_B = `USDC:${ISSUER_B}` as AssetKey;

function thresholds(...ts: Threshold[]): Map<AssetKey, Threshold> {
  return new Map(ts.map((t) => [t.assetKey, t]));
}

describe("qualifies", () => {
  const t = thresholds(
    { assetKey: "native", minStroops: 10_000_0000000n }, // 10,000 XLM
    { assetKey: USDC_A, minStroops: 5_000_0000000n }, // 5,000 USDC (issuer A)
  );

  it("fires above the threshold", () => {
    expect(
      qualifies({ assetKey: "native", amountStroops: 20_000_0000000n }, t),
    ).toBe(true);
  });

  it("fires at EXACTLY the threshold (boundary is inclusive)", () => {
    // Pins the old >= vs > disagreement: whaleTracker.ts used >=, server.ts used >.
    expect(
      qualifies({ assetKey: "native", amountStroops: 10_000_0000000n }, t),
    ).toBe(true);
  });

  it("does not fire one stroop below the threshold", () => {
    expect(
      qualifies({ assetKey: "native", amountStroops: 10_000_0000000n - 1n }, t),
    ).toBe(false);
  });

  it("isolates thresholds per asset", () => {
    // 6,000 USDC clears USDC's 5,000 threshold but not XLM's 10,000 one.
    expect(qualifies({ assetKey: USDC_A, amountStroops: 6_000_0000000n }, t)).toBe(
      true,
    );
    expect(
      qualifies({ assetKey: "native", amountStroops: 6_000_0000000n }, t),
    ).toBe(false);
  });

  it("does NOT fire for an asset with no configured threshold", () => {
    // The EVM bug was a single global constant applied to every token regardless
    // of decimals. No global fallback: an unconfigured asset never fires, no
    // matter how large the amount.
    expect(
      qualifies({ assetKey: "DOGE:GXYZ" as AssetKey, amountStroops: MAXISH }, t),
    ).toBe(false);
  });

  it("treats same-code different-issuer assets as distinct", () => {
    // USDC from issuer B has no threshold configured; only issuer A does.
    expect(qualifies({ assetKey: USDC_B, amountStroops: 9_999_0000000n }, t)).toBe(
      false,
    );
  });

  it("never fires against an empty threshold map", () => {
    expect(
      qualifies({ assetKey: "native", amountStroops: MAXISH }, new Map()),
    ).toBe(false);
  });
});

const MAXISH = 9223372036854775807n;
