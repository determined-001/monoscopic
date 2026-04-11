import { Skeleton, StatCardRowSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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

function Card({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[14px] bg-[var(--bg-secondary)] border border-[var(--border-default)] shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─── Loading Dashboard ─────────────────────────────────────────────────────────

export function LoadingDashboard() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading dashboard…"
      className="flex flex-col gap-5 py-6"
    >
      {/* Summary bar */}
      <Card className="p-4">
        <StatCardRowSkeleton count={4} />
      </Card>

      {/* Whale feed */}
      <Card className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col gap-2">
            <Pulse className="h-4 w-32" />
            <Pulse className="h-7 w-40" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Pulse key={i} className="h-7 w-10 rounded-full" />
            ))}
          </div>
        </div>
        {/* Chart area with shimmer */}
        <Skeleton variant="chart" height="h-[280px]" />
      </Card>

      {/* Allocation + Holdings row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        {/* Donut */}
        <Card className="md:col-span-2 p-5">
          <Pulse className="h-4 w-28 mb-4" />
          <div className="flex items-center justify-center py-4">
            <div className="relative h-[176px] w-[176px]">
              <div className="h-full w-full animate-pulse rounded-full bg-[var(--bg-tertiary)]" />
              <div className="absolute inset-[32px] rounded-full bg-[var(--bg-secondary)]" />
            </div>
          </div>
          {/* Legend */}
          <div className="flex flex-col gap-2 mt-2">
            {(["w-24", "w-20", "w-16"] as const).map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <Pulse className="h-3 w-3 rounded-full" />
                <Pulse className={`h-3 ${w}`} />
              </div>
            ))}
          </div>
        </Card>

        {/* Holdings table */}
        <Card className="md:col-span-3 overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-default)]">
            <Pulse className="h-4 w-28" />
          </div>
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-3 border-b border-[var(--border-default)] last:border-0"
            >
              <Pulse className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <Pulse className="h-3.5 w-16" />
                <Pulse className="h-3 w-24" />
              </div>
              <Pulse className="h-4 w-20" />
              <Pulse className="h-4 w-14" />
            </div>
          ))}
        </Card>
      </div>

      {/* Activity + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        <Card className="md:col-span-3 overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-default)]">
            <Pulse className="h-4 w-24" />
          </div>
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-default)] last:border-0"
            >
              <Pulse className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <Pulse className="h-3.5 w-32" />
                <Pulse className="h-3 w-20" />
              </div>
              <Pulse className="h-4 w-16" />
            </div>
          ))}
        </Card>

        <Card className="md:col-span-2 p-5">
          <Pulse className="h-4 w-24 mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-[var(--border-default)] p-3 flex flex-col gap-2"
              >
                <Pulse className="h-8 w-8 rounded-lg" />
                <Pulse className="h-3.5 w-16" />
                <Pulse className="h-3 w-20" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
