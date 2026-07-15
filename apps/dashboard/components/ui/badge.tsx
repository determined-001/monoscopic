import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BadgeVariant =
  | "positive" // green — price up, profit, buy
  | "negative" // red — price down, loss, sell
  | "neutral" // purple — default, volume, transfer
  | "warning" // amber — gas alerts, caution states
  | "network" // green pulsing dot + text — network indicator
  | "tag"; // bg-tertiary bg — whale labels, token categories

export interface BadgeProps {
  variant?: BadgeVariant;
  /** Label text. For 'network' variant this is the network name (e.g. "Stellar Mainnet"). */
  children: ReactNode;
  className?: string;
}

// ─── Variant configuration ────────────────────────────────────────────────────

/**
 * Status variants (positive/negative/neutral/warning/network):
 *   - rounded-full pill shape
 *   - 10% opacity tinted background
 *   - fully saturated text color
 *   - 11px uppercase tracking-widest (Overline / Label style from brief)
 *
 * Tag variant:
 *   - rounded-sm
 *   - bg-tertiary background
 *   - text-secondary
 *   - 12px normal case (Caption style)
 */

type VariantConfig = {
  container: string;
  dot?: string;
};

const variantConfig: Record<BadgeVariant, VariantConfig> = {
  positive: {
    container: cn(
      "rounded-full px-2.5 py-1",
      "bg-chart-positive/10 text-chart-positive",
      "text-[11px] font-semibold tracking-widest uppercase",
    ),
  },
  negative: {
    container: cn(
      "rounded-full px-2.5 py-1",
      "bg-chart-negative/10 text-chart-negative",
      "text-[11px] font-semibold tracking-widest uppercase",
    ),
  },
  neutral: {
    container: cn(
      "rounded-full px-2.5 py-1",
      "bg-purple-500/10 text-purple-500",
      "text-[11px] font-semibold tracking-widest uppercase",
    ),
  },
  warning: {
    container: cn(
      "rounded-full px-2.5 py-1",
      "bg-amber-400/10 text-amber-500",
      "text-[11px] font-semibold tracking-widest uppercase",
    ),
  },
  network: {
    container: cn(
      "rounded-full px-2.5 py-1",
      "bg-chart-positive/10 text-chart-positive",
      "text-[11px] font-medium",
    ),
    dot: "h-2 w-2 rounded-full bg-chart-positive",
  },
  tag: {
    container: cn(
      "rounded-sm px-2 py-0.5",
      "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
      "text-xs font-medium",
    ),
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Badge({
  variant = "neutral",
  children,
  className,
}: BadgeProps) {
  const config = variantConfig[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        config.container,
        className,
      )}
    >
      {variant === "network" && config.dot && (
        /**
         * Pulsing network status dot.
         * Uses Tailwind's animate-ping on the outer ring and a solid inner dot,
         * matching the brief's "green dot 8×8px pulsing animation" spec.
         */
        <span className="relative flex h-2 w-2 shrink-0">
          <span
            aria-hidden="true"
            className="absolute inline-flex h-full w-full animate-ping rounded-full bg-chart-positive opacity-60"
          />
          <span className={cn("relative inline-flex shrink-0", config.dot)} />
        </span>
      )}
      {children}
    </span>
  );
}
