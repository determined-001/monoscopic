import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SkeletonVariant =
  | "text" // single line — for headings or body text
  | "paragraph" // 3 staggered lines — for body copy blocks
  | "circle" // avatar / profile picture
  | "chart" // rectangular block with left-to-right shimmer sweep
  | "card"; // full card: title + subtitle + content area

export interface SkeletonProps {
  variant?: SkeletonVariant;
  /** Override width (any Tailwind w-* class or arbitrary value). */
  width?: string;
  /** Override height (any Tailwind h-* class or arbitrary value). */
  height?: string;
  /** Override diameter for circle variant (any Tailwind size class, e.g. "h-10 w-10"). */
  size?: string;
  className?: string;
}

// ─── Base pulse element ───────────────────────────────────────────────────────

/**
 * The atomic skeleton block: bg-tertiary background, animate-pulse.
 * `animate-pulse` is Tailwind's built-in opacity 0.5↔1 loop (1.5s ease-in-out).
 */
function Pulse({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-md bg-[var(--bg-tertiary)]",
        className,
      )}
    />
  );
}

// ─── Chart shimmer overlay ────────────────────────────────────────────────────

/**
 * The chart variant gets an additional animated shimmer sweep on top of the
 * pulsing base — a gradient that travels left-to-right.
 *
 * The `animate-shimmer` utility is defined in globals.css via:
 *   @keyframes shimmer { from { transform: translateX(-100%) } to { ... 250% } }
 *   --animate-shimmer: shimmer 1.8s ease-in-out infinite;
 */
function ChartSkeleton({
  height = "h-[320px]",
  width = "w-full",
  className,
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-md bg-[var(--bg-tertiary)]",
        height,
        width,
        className,
      )}
    >
      {/* Shimmer sweep */}
      <div
        className="absolute inset-0 animate-shimmer"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
        }}
      />
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

/**
 * Content placeholder shown while data is loading.
 *
 * ```tsx
 * // While fetching portfolio data:
 * <Skeleton variant="card" />
 *
 * // Custom chart loader:
 * <Skeleton variant="chart" height="h-[240px]" />
 *
 * // Avatar:
 * <Skeleton variant="circle" size="h-10 w-10" />
 * ```
 */
export function Skeleton({
  variant = "text",
  width,
  height,
  size,
  className,
}: SkeletonProps) {
  switch (variant) {
    // ── Single line of text ──────────────────────────────────────────────────
    case "text":
      return (
        <Pulse
          className={cn(
            height ?? "h-4",
            width ?? "w-full",
            "rounded-sm",
            className,
          )}
        />
      );

    // ── Block of body copy: 3 lines with staggered widths ───────────────────
    case "paragraph":
      return (
        <div
          aria-hidden="true"
          className={cn("flex flex-col gap-2", className)}
        >
          <Pulse className="h-4 w-full rounded-sm" />
          <Pulse className="h-4 w-[80%] rounded-sm" />
          <Pulse className="h-4 w-[60%] rounded-sm" />
        </div>
      );

    // ── Circular avatar / icon ───────────────────────────────────────────────
    case "circle":
      return (
        <div
          aria-hidden="true"
          className={cn(
            "animate-pulse rounded-full bg-[var(--bg-tertiary)]",
            size ?? "h-10 w-10",
            className,
          )}
        />
      );

    // ── Chart area with shimmer sweep ────────────────────────────────────────
    case "chart":
      return (
        <ChartSkeleton
          height={height ?? "h-[320px]"}
          width={width ?? "w-full"}
          className={className}
        />
      );

    // ── Full card: heading + subheading + content block ──────────────────────
    case "card":
      return (
        <div
          aria-hidden="true"
          className={cn(
            "rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6",
            className,
          )}
        >
          {/* Card header row: avatar + title/subtitle */}
          <div className="mb-5 flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-full bg-[var(--bg-tertiary)]" />
            <div className="flex flex-1 flex-col gap-2">
              <Pulse className="h-4 w-2/5 rounded-sm" />
              <Pulse className="h-3 w-1/3 rounded-sm" />
            </div>
          </div>

          {/* Main content area */}
          <div className="flex flex-col gap-2">
            <Pulse className="h-4 w-full rounded-sm" />
            <Pulse className="h-4 w-[85%] rounded-sm" />
            <Pulse className="h-4 w-[70%] rounded-sm" />
          </div>

          {/* Footer strip */}
          <div className="mt-5 flex items-center justify-between gap-4 border-t border-[var(--border-default)] pt-4">
            <Pulse className="h-3 w-1/4 rounded-sm" />
            <Pulse className="h-8 w-20 rounded-md" />
          </div>
        </div>
      );
  }
}

// ─── Composed skeleton layouts ─────────────────────────────────────────────────

/**
 * Row of stat cards — mirrors the Portfolio Summary Bar.
 *
 * ```tsx
 * <StatCardRowSkeleton count={4} />
 * ```
 */
export function StatCardRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="flex gap-4">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex min-w-[120px] flex-1 flex-col items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4"
        >
          <Pulse className="h-3 w-16 rounded-sm" />
          <Pulse className="h-6 w-24 rounded-sm" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton row for a data table — mimics a single row.
 *
 * ```tsx
 * {Array.from({ length: 8 }, (_, i) => <TableRowSkeleton key={i} columns={6} />)}
 * ```
 */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-4 border-b border-[var(--border-default)] px-4 py-3"
    >
      {Array.from({ length: columns }, (_, i) => (
        <Pulse
          key={i}
          className={cn(
            "h-4 rounded-sm",
            // First column wider (token name), rest equal
            i === 0 ? "w-32" : "flex-1",
          )}
        />
      ))}
    </div>
  );
}
