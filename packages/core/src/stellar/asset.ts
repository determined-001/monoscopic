/**
 * Asset identity.
 *
 * An asset code is NOT unique on Stellar — anyone can issue an asset called
 * "USDC". Identity is (code, issuer). Keying thresholds or alerts on the code
 * alone would let a worthless look-alike asset trigger alerts configured for the
 * real one, so the issuer is always part of the key.
 */

/** `"native"` for XLM, otherwise `"CODE:GISSUER..."`. */
export type AssetKey = "native" | `${string}:${string}`;

export interface HorizonAsset {
  asset_type: "native" | "credit_alphanum4" | "credit_alphanum12" | string;
  asset_code?: string | undefined;
  asset_issuer?: string | undefined;
}

export function assetKeyOf(a: HorizonAsset): AssetKey {
  if (a.asset_type === "native") return "native";
  if (!a.asset_code || !a.asset_issuer) {
    throw new Error(
      `issued asset missing code/issuer: ${JSON.stringify({
        asset_type: a.asset_type,
        asset_code: a.asset_code,
        asset_issuer: a.asset_issuer,
      })}`,
    );
  }
  return `${a.asset_code}:${a.asset_issuer}`;
}

/** Split an AssetKey back into its parts. */
export function parseAssetKey(
  key: AssetKey,
): { native: true } | { native: false; code: string; issuer: string } {
  if (key === "native") return { native: true };
  const idx = key.indexOf(":");
  if (idx <= 0 || idx === key.length - 1) {
    throw new Error(`invalid asset key: ${JSON.stringify(key)}`);
  }
  return {
    native: false,
    code: key.slice(0, idx),
    issuer: key.slice(idx + 1),
  };
}
