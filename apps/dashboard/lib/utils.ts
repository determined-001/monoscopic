/**
 * Merges class names, filtering out falsy values.
 * Lightweight alternative to clsx/classnames — no extra dependency.
 */
export function cn(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Formats a number as a currency string, respecting the user's display
 * preferences saved in localStorage (`display_currency`, `display_numFmt`).
 * Falls back to USD / en-US when running server-side or when no preference exists.
 */
export function formatCurrency(
  value: number,
  options?: { compact?: boolean; decimals?: number },
): string {
  const { compact = false, decimals = 2 } = options ?? {};

  const currency =
    typeof window !== "undefined"
      ? (localStorage.getItem("display_currency") ?? "USD")
      : "USD";
  const numFmt =
    typeof window !== "undefined"
      ? (localStorage.getItem("display_numFmt") ?? "comma-dot")
      : "comma-dot";
  const locale = numFmt === "dot-comma" ? "de-DE" : "en-US";

  if (compact) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formats a number as a percentage string with sign.
 * e.g. +3.45% or -1.20%
 */
export function formatPercent(value: number, decimals = 2): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Truncates a hex wallet address to the standard display format.
 * e.g. 0x7a3B4c2d...8F91E
 */
export function truncateAddress(
  address: string,
  leading = 6,
  trailing = 4,
): string {
  if (address.length <= leading + trailing) return address;
  return `${address.slice(0, leading)}...${address.slice(-trailing)}`;
}

/**
 * Formats a large number with compact notation.
 * e.g. 1200000 → "1.2M"
 */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Returns a relative time string from a Date or timestamp.
 * e.g. "2 min ago", "3 hours ago"
 */
export function timeAgo(date: Date | number): string {
  const seconds = Math.floor((Date.now() - Number(date)) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
