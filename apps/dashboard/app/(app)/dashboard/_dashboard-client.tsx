"use client";

import { Activity, Cpu, Zap, Layers, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { truncateAddress } from "@/lib/utils";
import { useMonoscopeStore } from "@/lib/store/useMonoscope";
import type { WhaleAlert } from "@/lib/store/useMonoscope";
import { useHealth } from "@/lib/hooks/useHealth";
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
  const health = useHealth();
  const whaleAlerts = useMonoscopeStore((s) => s.whaleAlerts);

  // No gas and no TPS card: Stellar has no gas, and ledgers close on a ~5s
  // protocol cadence rather than a throughput the network is straining against.
  // These three are things that are actually true of this chain and this
  // pipeline, and each traces to /health or the socket.
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <StatCard
        icon={<Layers size={18} />}
        label="Feed"
        value={health ? (health.feed.live ? "Live" : "Stalled") : "—"}
        sub={health ? `${health.feed.network} · ${health.feed.lastRecordAgo ?? "no data yet"}` : "Connecting…"}
        color={health?.feed.live ? "green" : "amber"}
      />
      <StatCard
        icon={<Cpu size={18} />}
        label="Whale events"
        value={whaleAlerts.length ? String(whaleAlerts.length) : "—"}
        sub="this session"
        color="purple"
      />
      <StatCard
        icon={<Zap size={18} />}
        label="On-chain attestations"
        value={health?.soroban.triggerCount ?? "—"}
        sub={health?.soroban.status === "up" ? "Soroban testnet" : "registry unavailable"}
        color="amber"
      />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Stroops are 7-decimal fixed point. The old default of 18 decimals here made
 *  every amount wrong by 11 orders of magnitude on any non-18-decimal asset. */
function stroopsToUnits(amountStroops: string): number {
  return Number(BigInt(amountStroops)) / 10 ** 7;
}

/** "native" -> "XLM"; "USDC:GA..." -> "USDC". */
function assetLabel(assetKey: string): string {
  return assetKey === "native" ? "XLM" : (assetKey.split(":")[0] ?? assetKey);
}

// ─── Live whale feed ──────────────────────────────────────────────────────────

function WhaleFeedRow({ alert }: { alert: WhaleAlert }) {
  const seconds = Math.floor((Date.now() - new Date(alert.closedAt).getTime()) / 1000);
  const age = seconds < 60 ? `${seconds}s` : seconds < 3600 ? `${Math.floor(seconds / 60)}m` : `${Math.floor(seconds / 3600)}h`;
  const units = stroopsToUnits(alert.amountStroops);
  const formatted = units >= 1_000_000 ? `${(units / 1_000_000).toFixed(2)}M` : units >= 1_000 ? `${(units / 1_000).toFixed(1)}K` : units.toFixed(2);

  // The feed reads mainnet, so explorer links must point at mainnet. The old
  // code linked whale rows to a testnet explorer while the listener ran against
  // mainnet — every link 404'd.
  const explorer =
    alert.network === "public"
      ? "https://stellar.expert/explorer/public"
      : "https://stellar.expert/explorer/testnet";

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
        <p className="font-mono text-[13px] font-semibold text-purple-400">{formatted} {assetLabel(alert.assetKey)}</p>
        <p className="text-[10px] text-[var(--text-muted)]">{age} ago</p>
      </div>
      {/* Trades carry no transaction hash, so there is nothing to link to. */}
      {alert.txHash ? (
        <a
          href={`${explorer}/tx/${alert.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150"
          aria-label="View on stellar.expert"
        >
          <ExternalLink size={13} />
        </a>
      ) : (
        <span className="w-[13px]" aria-hidden="true" />
      )}
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
            <WhaleFeedRow key={alert.opId} alert={alert} />
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
