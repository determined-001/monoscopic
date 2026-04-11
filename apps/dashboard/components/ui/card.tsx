import { forwardRef, type ReactNode, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CardVariant = "default" | "interactive" | "highlighted" | "stat";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * default     — bg-secondary, 1px border-default, shadow-sm. Plain container.
   * interactive — same + hover: shadow-md, border-active, translateY(-2px), 200ms.
   * highlighted — default + shadow-glow, 3px left border in purple-500.
   * stat        — same visual as default but signals intended stat-card usage.
   *               Use StatCard for the full label/value layout.
   */
  variant?: CardVariant;
  children?: ReactNode;
}

export interface StatCardProps {
  /** Overline label — rendered in Caption / Overline style above the value */
  label: string;
  /** Primary numeric or string value — rendered in JetBrains Mono, 18px */
  value: ReactNode;
  /**
   * Secondary value displayed beneath the primary value.
   * e.g. a percentage change "+3.45%" or a description label.
   */
  subValue?: ReactNode;
  /**
   * Optional sparkline or chart slot rendered below the values.
   * Pass a <Sparkline /> component or any ReactNode.
   */
  sparkline?: ReactNode;
  className?: string;
}

// ─── Variant class maps ───────────────────────────────────────────────────────

/**
 * Base visual layers shared by every variant:
 *   - bg-secondary background
 *   - 1px border-default border
 *   - radius-lg (14px)
 *   - space-lg padding (24px)
 */
const base =
  "bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg p-6";

const variantClasses: Record<CardVariant, string> = {
  /** Resting state — shadow-sm (barely visible elevation) */
  default: "shadow-sm",

  /**
   * Hover animations: shadow elevates, border turns purple, card lifts 2px.
   * transition-all captures box-shadow, border-color, and transform together.
   */
  interactive: cn(
    "shadow-sm",
    "cursor-pointer transition-all duration-200",
    "hover:shadow-md",
    "hover:border-[var(--border-active)]",
    "hover:-translate-y-0.5",
  ),

  /**
   * Draws the eye — purple glow shadow + 3px purple left-border accent.
   * Other three sides remain the standard 1px border-default.
   * Border widths: top/right/bottom = 1px · left = 3px
   */
  highlighted: cn(
    "shadow-glow",
    // Override just the left border — width and color
    "border-l-[3px] border-l-purple-500",
  ),

  /** Visually identical to default; signals stat-card semantics to readers. */
  stat: "shadow-sm",
};

// ─── Card ─────────────────────────────────────────────────────────────────────

/**
 * Polymorphic card container.
 *
 * ```tsx
 * <Card variant="interactive" onClick={handleClick}>...</Card>
 * <Card variant="highlighted" className="col-span-2">...</Card>
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = "default", children, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(base, variantClasses[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

// ─── StatCard ─────────────────────────────────────────────────────────────────

/**
 * Stat card — centered layout for a single KPI with optional sparkline.
 *
 * Brief spec: 120px min-width, centered, Label/Caption above · Value below.
 * Used in the Portfolio Summary Bar and stat grid rows.
 *
 * ```tsx
 * <StatCard
 *   label="24h Volume"
 *   value="$4.2M"
 *   subValue="+12.4%"
 *   sparkline={<Sparkline data={data} />}
 * />
 * ```
 */
export function StatCard({
  label,
  value,
  subValue,
  sparkline,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "min-w-[120px]",
        "bg-[var(--bg-secondary)]",
        "border border-[var(--border-default)]",
        "rounded-lg shadow-sm",
        "px-4 py-3",
        "flex flex-col items-center gap-1",
        className,
      )}
    >
      {/* ── Overline label ── */}
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] whitespace-nowrap">
        {label}
      </p>

      {/* ── Primary value — JetBrains Mono 18px Medium ── */}
      <div className="font-mono text-lg font-medium leading-snug text-[var(--text-primary)]">
        {value}
      </div>

      {/* ── Optional sub-value (e.g. change percentage) ── */}
      {subValue !== undefined && (
        <div className="text-xs text-[var(--text-muted)]">{subValue}</div>
      )}

      {/* ── Optional sparkline slot ── */}
      {sparkline !== undefined && (
        <div className="mt-1 w-full">{sparkline}</div>
      )}
    </div>
  );
}

// ─── CardHeader / CardContent / CardFooter helpers ────────────────────────────

/**
 * Semantic sub-sections for structuring card content.
 * All are optional — use freely or ignore in favour of direct children.
 */

export function CardHeader({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mb-4 flex items-start justify-between gap-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-[15px] font-semibold leading-tight text-[var(--text-primary)]",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-4 flex items-center justify-between gap-3",
        "border-t border-[var(--border-default)] pt-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
