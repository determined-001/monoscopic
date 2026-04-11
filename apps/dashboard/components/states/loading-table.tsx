import { cn } from "@/lib/utils";

// ─── Single skeleton row ───────────────────────────────────────────────────────

// Column widths cycle through these to avoid a uniform look
const COL_WIDTHS = ["w-32", "w-20", "w-16", "w-24", "w-14", "w-20", "w-12"];

function SkeletonRow({ columns, index }: { columns: number; index: number }) {
  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-4 border-b border-[var(--border-default)] px-4 py-3"
    >
      {Array.from({ length: columns }, (_, col) => (
        <div
          key={col}
          className={cn(
            "h-4 animate-pulse rounded-sm bg-[var(--bg-tertiary)]",
            col === 0
              ? "w-36" // first col wider (token/name)
              : col === columns - 1
                ? "w-14" // last col narrower (action)
                : COL_WIDTHS[(col + index) % COL_WIDTHS.length], // others vary
          )}
        />
      ))}
    </div>
  );
}

// ─── Loading Table ─────────────────────────────────────────────────────────────

interface LoadingTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function LoadingTable({
  rows = 8,
  columns = 6,
  className,
}: LoadingTableProps) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading data…"
      className={cn(
        "rounded-[14px] overflow-hidden",
        "bg-[var(--bg-secondary)] border border-[var(--border-default)]",
        "shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      {/* Header row */}
      <div
        aria-hidden="true"
        className="flex items-center gap-4 px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-tertiary)]/50"
      >
        {Array.from({ length: columns }, (_, col) => (
          <div
            key={col}
            className={cn(
              "h-3 animate-pulse rounded-sm bg-[var(--bg-tertiary)]",
              col === 0 ? "w-20" : col === columns - 1 ? "w-12" : "flex-1",
            )}
          />
        ))}
      </div>

      {/* Data rows */}
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonRow key={i} columns={columns} index={i} />
      ))}
    </div>
  );
}
