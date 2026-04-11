"use client";

import { Bell, Zap, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAlerts } from "@/lib/hooks/useAlerts";
import type { AlertTrigger } from "@monoscope/types";

// ─── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  iconBg,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className={cn(
      "flex flex-col gap-3 rounded-[14px] p-4",
      "bg-[var(--bg-secondary)] border border-[var(--border-default)] shadow-[var(--shadow-sm)]",
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] truncate">
            {label}
          </p>
          <p className="font-mono text-[22px] font-bold text-[var(--text-primary)] leading-none truncate">
            {value}
          </p>
        </div>
        <div
          className="shrink-0 h-9 w-9 rounded-xl flex items-center justify-center"
          style={{ background: iconBg }}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>
      <p className="text-[12px] text-[var(--text-muted)]">{sub}</p>
    </div>
  );
}

// ─── Alerts Summary ────────────────────────────────────────────────────────────

export function AlertsSummary() {
  const { alerts, loading } = useAlerts();

  const totalActive  = alerts.filter((a) => a.enabled).length;

  const todayStart   = new Date(); todayStart.setHours(0, 0, 0, 0);
  const triggeredToday = alerts.reduce((sum, a) => {
    const todayTriggers = (a.triggers ?? []).filter(
      (t: AlertTrigger) => new Date(t.createdAt) >= todayStart,
    ).length;
    return sum + todayTriggers;
  }, 0);

  // Most triggered alert by total trigger count
  const mostTriggered = alerts.reduce<{ name: string; count: number } | null>(
    (best, a) => {
      const count = a.triggers?.length ?? 0;
      if (!best || count > best.count) return { name: a.name, count };
      return best;
    },
    null,
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[96px] rounded-[14px] bg-[var(--bg-secondary)] border border-[var(--border-default)] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
      <StatCard
        icon={<Bell size={16} className="text-purple-400" />}
        iconBg="rgba(131,110,249,0.12)"
        label="Total Active"
        value={String(totalActive)}
        sub={totalActive === 1 ? "1 alert enabled" : `${totalActive} alerts enabled`}
      />
      <StatCard
        icon={<Zap size={16} className="text-amber-400" />}
        iconBg="rgba(245,158,11,0.12)"
        label="Triggered Today"
        value={String(triggeredToday)}
        sub={triggeredToday === 0 ? "No triggers today" : "Since midnight"}
      />
      <StatCard
        icon={<Star size={16} className="text-sky-400" />}
        iconBg="rgba(56,189,248,0.12)"
        label="Most Triggered"
        value={mostTriggered?.name ?? "—"}
        sub={mostTriggered ? `${mostTriggered.count} times total` : "No alerts yet"}
      />
    </div>
  );
}
