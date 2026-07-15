"use client";

import { TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMonoscopeStore } from "@/lib/store/useMonoscope";

// ─── Sparkline (pure SVG, no recharts) ────────────────────────────────────────

function MiniSparkline({
  data = [{ v: 0 }],
  color = "#836EF9",
}: {
  data?: { v: number }[];
  color?: string;
}) {
  const W = 64;
  const H = 28;
  const values = data.map((d) => d.v);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const pts = values.map((v, i) => {
    const x = (i / Math.max(values.length - 1, 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${x},${y}`;
  });

  const linePath = `M ${pts.join(" L ")}`;
  const areaPath = `M 0,${H} L ${pts.join(" L ")} L ${W},${H} Z`;

  const id = `spark-${color.replace("#", "")}`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="shrink-0 overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${id})`} />
      <path d={linePath} stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  subPositive?: boolean;
  subNegative?: boolean;
  subNeutral?: boolean;
  right?: React.ReactNode;
}

function StatCard({
  label,
  value,
  sub,
  subPositive,
  subNegative,
  right,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-[14px] p-4",
        "bg-[var(--bg-secondary)]",
        "border border-[var(--border-default)]",
        "shadow-[var(--shadow-sm)]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] truncate">
            {label}
          </p>
          <p className="font-mono text-[22px] font-bold text-[var(--text-primary)] leading-none">
            {value}
          </p>
        </div>
        {right}
      </div>

      {sub && (
        <div
          className={cn(
            "flex items-center gap-1 text-[12px] font-medium",
            subPositive
              ? "text-chart-positive"
              : subNegative
                ? "text-chart-negative"
                : "text-[var(--text-muted)]",
          )}
        >
          {subPositive && <TrendingUp size={11} aria-hidden="true" />}
          {!subPositive && !subNegative && (
            <Minus size={11} aria-hidden="true" />
          )}
          <span>{sub}</span>
        </div>
      )}
    </div>
  );
}

// ─── Whale Stats ──────────────────────────────────────────────────────────────

/** Stroops are 7-decimal fixed point, not 18. Display only — comparisons use
 *  the exact stroop bigint. */
function toUnits(amountStroops: string): number {
  return Number(BigInt(amountStroops)) / 10 ** 7;
}

export function WhaleStats() {
  const whaleAlerts = useMonoscopeStore((s) => s.whaleAlerts);

  const now = Date.now();
  const last24h = whaleAlerts.filter(
    (a) => now - new Date(a.closedAt).getTime() < 86_400_000,
  );

  const uniqueWallets = new Set(whaleAlerts.map((a) => a.from)).size;

  const totalXlm = last24h
    .filter((a) => a.assetKey === "native")
    .reduce((acc, a) => acc + toUnits(a.amountStroops), 0);

  const topAlert = [...last24h].sort(
    (a, b) => toUnits(b.amountStroops) - toUnits(a.amountStroops),
  )[0];

  const topAmount = topAlert
    ? (() => {
        const raw = toUnits(topAlert.amountStroops);
        return raw >= 1_000_000
          ? `${(raw / 1_000_000).toFixed(1)}M`
          : raw >= 1_000
            ? `${(raw / 1_000).toFixed(0)}K`
            : raw.toFixed(0);
      })()
    : "—";

  const topSymbol =
    topAlert?.assetKey === "native"
      ? "XLM"
      : (topAlert?.assetKey.split(":")[0] ?? "—");

  // Use actual transfer amounts (in units) for the sparkline — last 7 events
  const sparkData = last24h
    .slice(-7)
    .map((a) => ({ v: toUnits(a.amountStroops) }));

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
      <StatCard
        label="Whales Tracked"
        value={uniqueWallets.toLocaleString()}
        sub="unique wallets"
        subNeutral
        right={
          <MiniSparkline data={sparkData.length ? sparkData : [{ v: 0 }]} />
        }
      />
      <StatCard
        label="24h Large Txns"
        value={last24h.length.toLocaleString()}
        sub="above threshold"
        subNeutral
        right={
          <MiniSparkline
            color="#38BDF8"
            data={sparkData.length ? sparkData : [{ v: 0 }]}
          />
        }
      />
      <StatCard
        label="Net XLM Flow"
        value={
          totalXlm >= 1_000_000
            ? `${(totalXlm / 1_000_000).toFixed(2)}M`
            : totalXlm >= 1_000
              ? `${(totalXlm / 1_000).toFixed(0)}K`
              : totalXlm.toFixed(0)
        }
        sub="native transfers 24h"
        subPositive={totalXlm > 0}
        right={
          <MiniSparkline
            color="#22C55E"
            data={sparkData.length ? sparkData : [{ v: 0 }]}
          />
        }
      />
      <StatCard
        label="Top Move"
        value={topAmount}
        sub={`Largest ${topSymbol} transfer`}
        subNeutral
      />
    </div>
  );
}
