/**
 * Stroop math.
 *
 * Stellar amounts are 7-decimal fixed point. Horizon serializes them as DECIMAL
 * STRINGS ("1234.5678900"), not integers — so `BigInt("1234.5678900")` throws,
 * and `parseFloat` silently loses precision: the max Stellar amount
 * (922337203685.4775807 XLM = 9223372036854775807 stroops) is far beyond the
 * 2^53 integer range a double can represent exactly.
 *
 * Everything downstream compares and stores stroops as bigint. Convert once, here.
 */

export const STROOP_DECIMALS = 7;
const STROOPS_PER_UNIT = 10n ** BigInt(STROOP_DECIMALS);

/** Max representable Stellar amount, in stroops (i64::MAX). */
export const MAX_STROOPS = 9223372036854775807n;

const AMOUNT_RE = /^(-?)(\d+)(?:\.(\d{1,7}))?$/;

/**
 * Parse a Horizon decimal amount string into stroops.
 *
 * @throws if the input is not a valid Stellar amount (non-numeric, more than 7
 *         decimal places, or out of i64 range). Rejecting >7 decimals is
 *         deliberate: Stellar cannot represent that precision, so silently
 *         truncating would misreport the amount.
 */
export function toStroops(decimal: string): bigint {
  const m = AMOUNT_RE.exec(decimal.trim());
  if (!m) {
    throw new Error(`invalid Stellar amount: ${JSON.stringify(decimal)}`);
  }
  const [, sign, whole, frac = ""] = m;
  const padded = frac.padEnd(STROOP_DECIMALS, "0");
  const stroops = BigInt(`${sign}${whole}${padded}`);
  if (stroops > MAX_STROOPS || stroops < -MAX_STROOPS - 1n) {
    throw new Error(`Stellar amount out of range: ${decimal}`);
  }
  return stroops;
}

/**
 * Render stroops back to the canonical Horizon decimal string (7 dp, trailing
 * zeros preserved) so that `fromStroops(toStroops(x)) === x` for canonical input.
 */
export function fromStroops(stroops: bigint): string {
  const neg = stroops < 0n;
  const abs = neg ? -stroops : stroops;
  const whole = abs / STROOPS_PER_UNIT;
  const frac = abs % STROOPS_PER_UNIT;
  return `${neg ? "-" : ""}${whole}.${frac.toString().padStart(STROOP_DECIMALS, "0")}`;
}
