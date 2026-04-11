"use client";

import { ArrowLeftRight, Link2, ArrowUpRight, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMonoscopeStore } from "@/lib/store/useMonoscope";

// ─── Action data ──────────────────────────────────────────────────────────────

// Set href to a real URL when integrations are ready; null = coming soon
const ACTIONS: { label: string; Icon: React.FC<{ size?: number; className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>; href: string | null }[] = [
  { label: "Swap",   Icon: ArrowLeftRight, href: null },
  { label: "Bridge", Icon: Link2,          href: null },
  { label: "Send",   Icon: ArrowUpRight,   href: null },
  { label: "Stake",  Icon: Layers,         href: null },
];

// ─── Gas tracker (live) ───────────────────────────────────────────────────────

function GasTracker() {
  const latestBlock = useMonoscopeStore((s) => s.latestBlock);

  const pct    = latestBlock?.gasUsedPercent ?? null;
  const tps    = latestBlock?.tps            ?? null;

  const loadLabel = pct === null ? "—"
    : pct < 30 ? "Low"
    : pct < 70 ? "Moderate"
    : "High";

  const loadColor = pct === null ? "text-[var(--text-muted)]"
    : pct < 30 ? "text-chart-positive"
    : pct < 70 ? "text-amber-400"
    : "text-chart-negative";

  return (
    <div className={cn(
      "rounded-[14px] p-5",
      "bg-[var(--bg-secondary)] border border-[var(--border-default)] shadow-[var(--shadow-sm)]",
    )}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] font-semibold text-[var(--text-primary)]">Network</p>
        {latestBlock ? (
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-chart-positive">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-chart-positive opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-chart-positive" />
            </span>
            Live
          </span>
        ) : (
          <span className="text-[11px] text-[var(--text-muted)]">Connecting…</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col items-center rounded-[10px] bg-[var(--bg-tertiary)] px-3 py-3 gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Gas Load</p>
          <p className={cn("font-mono text-[15px] font-bold leading-none", loadColor)}>
            {loadLabel}
          </p>
          {pct !== null && (
            <p className="text-[10px] text-[var(--text-muted)]">{pct.toFixed(1)}% used</p>
          )}
        </div>

        <div className="flex flex-col items-center rounded-[10px] bg-[var(--bg-tertiary)] px-3 py-3 gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">TPS</p>
          <p className="font-mono text-[15px] font-bold leading-none text-[var(--text-primary)]">
            {tps !== null ? tps : "—"}
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">tx/sec</p>
        </div>
      </div>

      {latestBlock && (
        <p className="mt-3 text-center text-[10px] text-[var(--text-muted)]">
          Block #{latestBlock.number.toLocaleString()} · Monad Mainnet
        </p>
      )}
    </div>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────

export function QuickActions() {
  return (
    <div className="flex flex-col gap-4">
      {/* Action buttons */}
      <div className={cn(
        "rounded-[14px] p-5",
        "bg-[var(--bg-secondary)] border border-[var(--border-default)] shadow-[var(--shadow-sm)]",
      )}>
        <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-4">Quick Actions</p>
        <div className="grid grid-cols-2 gap-2.5">
          {ACTIONS.map(({ label, Icon, href }) =>
            href ? (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group flex items-center gap-3 h-14 px-4 rounded-[10px]",
                  "bg-[var(--bg-tertiary)] border border-transparent",
                  "hover:border-[var(--border-active)] hover:shadow-[var(--shadow-glow)]",
                  "transition-all duration-150",
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                  <Icon size={16} className="text-purple-500" aria-hidden={true} strokeWidth={2} />
                </div>
                <span className="text-[13px] font-medium text-[var(--text-primary)]">{label}</span>
              </a>
            ) : (
              <div
                key={label}
                title="Coming soon"
                className={cn(
                  "flex items-center gap-3 h-14 px-4 rounded-[10px]",
                  "bg-[var(--bg-tertiary)] border border-transparent",
                  "opacity-40 cursor-not-allowed",
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                  <Icon size={16} className="text-purple-500" aria-hidden={true} strokeWidth={2} />
                </div>
                <span className="text-[13px] font-medium text-[var(--text-primary)]">{label}</span>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Live network stats */}
      <GasTracker />
    </div>
  );
}
