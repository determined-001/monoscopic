/**
 * Whale threshold logic. Pure — no I/O — so it is fully testable.
 *
 * Two rules inherited as bugs from the EVM implementation, fixed here:
 *
 *  1. NO GLOBAL FALLBACK THRESHOLD. The old code applied one constant
 *     (100 * 10^18) to every ERC-20 regardless of its decimals, so 6-decimal
 *     tokens like USDC could never fire. A threshold is meaningless across
 *     assets: 100 XLM is not comparable to 100 units of an arbitrary token.
 *     An asset with no configured threshold does not fire. Ever.
 *
 *  2. THE BOUNDARY IS INCLUSIVE. The old code disagreed with itself —
 *     whaleTracker.ts used `>=` while server.ts used `>`. We pin `>=`:
 *     a subscription for "at least 1000 XLM" fires on exactly 1000 XLM.
 */
import type { AssetKey } from "./asset.js";

export interface Threshold {
  assetKey: AssetKey;
  /** Inclusive minimum, in stroops. */
  minStroops: bigint;
}

export interface WhaleCandidateLike {
  assetKey: AssetKey;
  amountStroops: bigint;
}

/**
 * True when `candidate` meets or exceeds the configured threshold for its asset.
 * Returns false when the asset has no configured threshold.
 */
export function qualifies(
  candidate: WhaleCandidateLike,
  thresholds: ReadonlyMap<AssetKey, Threshold>,
): boolean {
  const t = thresholds.get(candidate.assetKey);
  if (!t) return false; // no threshold configured for this asset -> never fires
  return candidate.amountStroops >= t.minStroops;
}
