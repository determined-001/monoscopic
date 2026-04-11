"use client";

import { Activity, Cpu, Zap, Layers, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { truncateAddress } from "@/lib/utils";
import { useMonoscopeStore } from "@/lib/store/useMonoscope";
import { AlertsSummary } from "@/components/alerts/alerts-summary";
import { QuickActions } from "@/components/dashboard/quick-actions";

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  color = "purple",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color?: "purple" | "green" | "amber";
}) {
  const iconBg = {
    purple: "bg-purple-500/10 text-purple-400",
    green:  "bg-chart-positive/10 text-chart-positive",
    amber:  "bg-amber-400/10 text-amber-400",
  }[color];

  return (
    <div className={cn(
      "flex items-center gap-4 rounded-[14px] p-4",
      "bg-[var(--bg-secondary)] border border-[var(--border-default)] shadow-[var(--shadow-sm)]",
    )}>
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
        {icon}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">{label}</p>
        <p className="font-mono text-[20px] font-bold text-[var(--text-primary)] leading-none">{value}</p>
        <p className="text-[11px] text-[var(--text-muted)]">{sub}</p>
      </div>
    </div>
  );
}

// ─── Live block stats strip ───────────────────────────────────────────────────

function NetworkStrip() {
  const latestBlock = useMonoscopeStore((s) => s.latestBlock);
  const connected   = useMonoscopeStore((s) => s.connected);

  const pct = latestBlock?.gasUsedPercent ?? null;
  const gasLabel = pct === null ? "—" : pct < 30 ? "Low" : pct < 70 ? "Moderate" : "High";
  const gasColor = pct === null ? undefined : pct < 30 ? "green" : pct < 70 ? "amber" : undefined;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <StatCard
        icon={<Layers size={18} />}
        label="Latest Block"
        value={latestBlock ? `#${latestBlock.number.toLocaleString()}` : "—"}
        sub={latestBlock ? `${latestBlock.transactionCount} txns` : connected ? "Syncing…" : "Connecting…"}
        color="purple"
      />
      <StatCard
        icon={<Cpu size={18} />}
        label="TPS"
        value={latestBlock ? String(latestBlock.tps) : "—"}
        sub="transactions / sec"
        color="green"
      />
      <StatCard
        icon={<Zap size={18} />}
        label="Gas Load"
        value={gasLabel}
        sub={pct !== null ? `${pct.toFixed(1)}% used` : "waiting for block"}
        color={gasColor ?? "amber"}
      />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function bigIntToUnits(raw: string, decimals = 18): number {
  const n = BigInt(raw);
  const d = BigInt(10) ** BigInt(decimals);
  return Number(n / d) + Number(n % d) / Number(d);
}

// ─── Live whale feed ──────────────────────────────────────────────────────────

function WhaleFeedRow({ alert }: { alert: { txHash: string; from: string; to: string; amount: string; timestamp: number; tokenType: string } }) {
  const seconds = Math.floor(Date.now() / 1000) - alert.timestamp;
  const age = seconds < 60 ? `${seconds}s` : seconds < 3600 ? `${Math.floor(seconds / 60)}m` : `${Math.floor(seconds / 3600)}h`;
  const mon = bigIntToUnits(alert.amount);
  const formatted = mon >= 1_000_000 ? `${(mon / 1_000_000).toFixed(2)}M` : mon >= 1_000 ? `${(mon / 1_000).toFixed(1)}K` : mon.toFixed(2);

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[var(--border-default)] last:border-0">
      <div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
        <Activity size={14} className="text-purple-400" />
      </div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <p className="font-mono text-[12px] text-[var(--text-primary)] truncate">{truncateAddress(alert.from)}</p>
        <p className="text-[11px] text-[var(--text-muted)] truncate">→ {truncateAddress(alert.to)}</p>
      </div>
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <p className="font-mono text-[13px] font-semibold text-purple-400">{formatted} MON</p>
        <p className="text-[10px] text-[var(--text-muted)]">{age} ago</p>
      </div>
      <a
        href={`https://testnet.monadexplorer.com/tx/${alert.txHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150"
        aria-label="View on explorer"
      >
        <ExternalLink size={13} />
      </a>
    </div>
  );
}

function LiveWhaleFeed() {
  const whaleAlerts = useMonoscopeStore((s) => s.whaleAlerts);
  const connected   = useMonoscopeStore((s) => s.connected);
  const recent = whaleAlerts.slice(0, 20);

  return (
    <div className={cn(
      "rounded-[14px] p-5",
      "bg-[var(--bg-secondary)] border border-[var(--border-default)] shadow-[var(--shadow-sm)]",
    )}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] font-semibold text-[var(--text-primary)]">Live Whale Activity</p>
        <span className={cn("flex items-center gap-1.5 text-[11px] font-medium", connected ? "text-chart-positive" : "text-[var(--text-muted)]")}>
          {connected && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-chart-positive opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-chart-positive" />
            </span>
          )}
          {connected ? "Live" : "Connecting…"}
        </span>
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-[var(--text-muted)]">
          <Activity size={24} className="opacity-30" />
          <p className="text-[13px]">{connected ? "Waiting for whale activity…" : "Connecting to network…"}</p>
        </div>
      ) : (
        <div>
          {recent.map((alert) => (
            <WhaleFeedRow key={alert.txHash} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function DashboardClient() {
  return (
    <div className="flex flex-col gap-5 py-6">
      <NetworkStrip />
      <AlertsSummary />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        <div className="md:col-span-3">
          <LiveWhaleFeed />
        </div>
        <div className="md:col-span-2">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
