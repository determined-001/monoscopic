"use client";

import { useState } from "react";
import { ExternalLink, ChevronDown } from "lucide-react";
import { motion, AnimatePresence, type Easing } from "framer-motion";
import { cn } from "@/lib/utils";
import { truncateAddress } from "@/lib/utils";
import { useMonoscopeStore } from "@/lib/store/useMonoscope";
import type { WhaleAlert } from "@/lib/store/useMonoscope";
import type { WhaleFilterState } from "./whale-filters";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionType = "TRANSFER" | "CONTRACT";

interface WhaleTx {
  id: string;
  time: string;
  hoursAgo: number;
  whale: { address: string; tag?: string; tagColor?: string };
  action: ActionType;
  token: { symbol: string; color: string; amount: string };
  value: string;
  rawUnits: number;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  blockNumber: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(timestamp: number): { label: string; hoursAgo: number } {
  const seconds = Math.floor(Date.now() / 1000) - timestamp;
  const hoursAgo = seconds / 3600;
  if (seconds < 60) return { label: `${seconds}s ago`, hoursAgo };
  if (seconds < 3600)
    return { label: `${Math.floor(seconds / 60)}m ago`, hoursAgo };
  return { label: `${hoursAgo.toFixed(1)}h ago`, hoursAgo };
}

const VALID_TOKEN_TYPES = ["native", "erc20"] as const;
type ValidTokenType = (typeof VALID_TOKEN_TYPES)[number];

function isValidTokenType(t: string): t is ValidTokenType {
  return (VALID_TOKEN_TYPES as readonly string[]).includes(t);
}

function bigIntToUnits(amount: string): number {
  const bn = BigInt(amount);
  const divisor = BigInt(10) ** 18n;
  return Number(bn / divisor) + Number(bn % divisor) / 1e18;
}

function formatAmount(amount: string): string {
  const raw = bigIntToUnits(amount);
  if (raw >= 1_000_000) return `${(raw / 1_000_000).toFixed(2)}M`;
  if (raw >= 1_000) return `${(raw / 1_000).toFixed(0)}K`;
  return raw.toFixed(2);
}

function alertToTx(alert: WhaleAlert): WhaleTx {
  const { label, hoursAgo } = timeAgo(alert.timestamp);
  const tokenType: ValidTokenType = isValidTokenType(alert.tokenType)
    ? alert.tokenType
    : "erc20";
  const isNative = tokenType === "native";

  return {
    id: alert.txHash,
    time: label,
    hoursAgo,
    whale: { address: alert.from },
    action: isNative ? "TRANSFER" : "CONTRACT",
    token: {
      symbol: isNative ? "MON" : (alert.tokenAddress?.slice(0, 6) ?? "ERC20"),
      color: isNative ? "#836EF9" : "#38BDF8",
      amount: formatAmount(alert.amount),
    },
    value: formatAmount(alert.amount),
    // Store raw units for filter comparisons
    rawUnits: bigIntToUnits(alert.amount),
    txHash: alert.txHash,
    fromAddress: alert.from,
    toAddress: alert.to,
    blockNumber: alert.blockNumber,
  };
}

// ─── Action pill ──────────────────────────────────────────────────────────────

const ACTION_STYLES: Record<
  ActionType,
  { bg: string; text: string; label: string }
> = {
  TRANSFER: {
    bg: "bg-purple-500/15",
    text: "text-purple-400",
    label: "TRANSFER",
  },
  CONTRACT: {
    bg: "bg-[#38BDF8]/15",
    text: "text-[#38BDF8]",
    label: "CONTRACT",
  },
};

function ActionPill({ action }: { action: ActionType }) {
  const s = ACTION_STYLES[action];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 shrink-0",
        "text-[10px] font-bold tracking-wide",
        s.bg,
        s.text,
      )}
    >
      {s.label}
    </span>
  );
}

// ─── Whale badge ──────────────────────────────────────────────────────────────

function WhaleBadge({ whale }: { whale: WhaleTx["whale"] }) {
  const hex = whale.address.toLowerCase().replace("0x", "").padEnd(32, "0");
  const h1 = Math.round((parseInt(hex.slice(0, 4), 16) / 0xffff) * 360);
  const h2 = Math.round((parseInt(hex.slice(4, 8), 16) / 0xffff) * 360);
  const h3 = Math.round((parseInt(hex.slice(8, 12), 16) / 0xffff) * 360);

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div
        className="h-7 w-7 shrink-0 rounded-full ring-1 ring-[var(--border-default)]"
        style={{
          background: `conic-gradient(from 0deg,
            hsl(${h1},70%,58%), hsl(${h2},65%,52%), hsl(${h3},70%,56%), hsl(${h1},70%,58%))`,
        }}
        aria-hidden="true"
      />
      {whale.tag ? (
        <span
          className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide"
          style={{
            backgroundColor: `${whale.tagColor ?? "#836EF9"}22`,
            color: whale.tagColor ?? "#836EF9",
          }}
        >
          {whale.tag}
        </span>
      ) : (
        <span className="font-mono text-[11px] text-[var(--text-muted)] truncate">
          {truncateAddress(whale.address)}
        </span>
      )}
    </div>
  );
}

// ─── Expand panel ─────────────────────────────────────────────────────────────

const EASE_OUT: Easing = [0.21, 0.47, 0.32, 0.98];

function ExpandPanel({ tx }: { tx: WhaleTx }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
      style={{ overflow: "hidden" }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4 pb-4 pt-1">
        {[
          { label: "Tx Hash", value: tx.txHash, mono: true, truncate: true },
          {
            label: "Block",
            value: `#${tx.blockNumber.toLocaleString()}`,
            mono: true,
          },
          { label: "From", value: tx.fromAddress, mono: true, truncate: true },
          { label: "To", value: tx.toAddress, mono: true, truncate: true },
          {
            label: "Amount",
            value: `${tx.value} ${tx.token.symbol}`,
            mono: true,
          },
          { label: "Token Type", value: tx.token.symbol, mono: true },
        ].map(({ label, value, mono, truncate }) => (
          <div key={label}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-0.5">
              {label}
            </p>
            <p
              className={cn(
                "text-[12px] text-[var(--text-secondary)]",
                mono && "font-mono",
                truncate && "truncate",
              )}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Desktop table row ────────────────────────────────────────────────────────

function TableRow({
  tx,
  expanded,
  onToggle,
}: {
  tx: WhaleTx;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        className={cn(
          "h-14 cursor-pointer select-none",
          "transition-colors duration-100",
          expanded
            ? "bg-[var(--bg-tertiary)]"
            : "hover:bg-[var(--bg-tertiary)]",
          "border-b border-[var(--border-default)] last:border-0",
        )}
      >
        {/* Time */}
        <td className="px-4 py-0 whitespace-nowrap">
          <span className="text-[12px] text-[var(--text-muted)]">
            {tx.time}
          </span>
        </td>
        {/* Whale */}
        <td className="px-4 py-0 max-w-[200px]">
          <WhaleBadge whale={tx.whale} />
        </td>
        {/* Action */}
        <td className="px-4 py-0">
          <ActionPill action={tx.action} />
        </td>
        {/* Token */}
        <td className="px-4 py-0">
          <div className="flex items-center gap-2">
            <div
              className="h-5 w-5 shrink-0 rounded-full flex items-center justify-center"
              style={{ background: `${tx.token.color}22` }}
              aria-hidden="true"
            >
              <span
                className="text-[7px] font-bold"
                style={{ color: tx.token.color }}
              >
                {tx.token.symbol.slice(0, 2)}
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-[12px] font-semibold text-[var(--text-primary)]">
                {tx.token.symbol}
              </span>
              <span className="ml-1.5 font-mono text-[11px] text-[var(--text-muted)]">
                {tx.token.amount}
              </span>
            </div>
          </div>
        </td>
        {/* Value */}
        <td className="px-4 py-0 text-right">
          <span className="font-mono text-[13px] font-bold text-[var(--text-primary)]">
            {tx.value} {tx.token.symbol}
          </span>
        </td>
        {/* Expand + link */}
        <td className="px-4 py-0">
          <div className="flex items-center justify-end gap-2">
            <a
              href={`https://monadexplorer.com/tx/${tx.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[var(--text-muted)] hover:text-purple-500 transition-colors duration-150"
              aria-label="View on explorer"
            >
              <ExternalLink size={13} />
            </a>
            <ChevronDown
              size={13}
              className={cn(
                "text-[var(--text-muted)] transition-transform duration-200",
                expanded && "rotate-180",
              )}
            />
          </div>
        </td>
      </tr>
      <AnimatePresence initial={false}>
        {expanded && (
          <tr
            key="expand"
            className="bg-[var(--bg-tertiary)] border-b border-[var(--border-default)]"
          >
            <td colSpan={6} className="px-0 py-0">
              <ExpandPanel tx={tx} />
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Mobile card ──────────────────────────────────────────────────────────────

function MobileCard({
  tx,
  expanded,
  onToggle,
}: {
  tx: WhaleTx;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "border-b border-[var(--border-default)] last:border-0",
        expanded && "bg-[var(--bg-tertiary)]",
      )}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[var(--bg-tertiary)] transition-colors duration-100"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <WhaleBadge whale={tx.whale} />
            <ActionPill action={tx.action} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-[var(--text-muted)]">
              {tx.token.amount} {tx.token.symbol}
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">·</span>
            <span className="text-[11px] text-[var(--text-muted)]">
              {tx.time}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[14px] font-bold text-[var(--text-primary)]">
            {tx.value} {tx.token.symbol}
          </span>
          <ChevronDown
            size={13}
            className={cn(
              "text-[var(--text-muted)] transition-transform duration-200",
              expanded && "rotate-180",
            )}
          />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            style={{ overflow: "hidden" }}
          >
            <ExpandPanel tx={tx} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Whale Feed ───────────────────────────────────────────────────────────────

const TIME_RANGE_HOURS: Record<string, number> = {
  "1H": 1,
  "6H": 6,
  "24H": 24,
  "7D": 168,
};

export function WhaleFeed({ filters }: { filters: WhaleFilterState }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const whaleAlerts = useMonoscopeStore((s) => s.whaleAlerts);

  function toggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  const txs = whaleAlerts.map(alertToTx);

  const filtered = txs.filter((tx) => {
    // Time range
    const maxHours = TIME_RANGE_HOURS[filters.timeRange] ?? 24;
    if (tx.hoursAgo > maxHours) return false;

    // Address search
    if (filters.address) {
      const q = filters.address.toLowerCase();
      if (!tx.whale.address.toLowerCase().includes(q)) return false;
    }

    // Token filter — "MON" matches native; other symbols match ERC20 address prefix or symbol
    if (filters.tokens.length > 0) {
      const sym = tx.token.symbol.toUpperCase();
      const matches = filters.tokens.some((t) => t.toUpperCase() === sym);
      if (!matches) return false;
    }

    // Minimum value filter — compared against raw token units (no price feed available)
    if (filters.minValue > 0 && tx.rawUnits < filters.minValue) return false;

    // Action filter — "Transfer" = native TRANSFER, Buy/Sell/Bridge = ERC20 CONTRACT
    if (filters.actions.length > 0) {
      const wantsTransfer = filters.actions.includes("Transfer");
      const wantsContract =
        filters.actions.includes("Buy") ||
        filters.actions.includes("Sell") ||
        filters.actions.includes("Bridge");

      if (tx.action === "TRANSFER" && !wantsTransfer) return false;
      if (tx.action === "CONTRACT" && !wantsContract) return false;
    }

    return true;
  });

  return (
    <div
      className={cn(
        "rounded-[14px] overflow-hidden",
        "bg-[var(--bg-secondary)]",
        "border border-[var(--border-default)]",
        "shadow-[var(--shadow-sm)]",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-default)]">
        <p className="text-[13px] font-semibold text-[var(--text-primary)]">
          Whale Activity
        </p>
        <span className="text-[12px] text-[var(--text-muted)]">
          {filtered.length} transactions
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <p className="text-[13px] text-[var(--text-muted)]">
            Watching for whale transactions…
          </p>
          <p className="text-[11px] text-[var(--text-muted)] opacity-60">
            Alerts appear when transfers exceed the threshold
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[var(--bg-secondary)]">
                  {["Time", "Whale", "Action", "Token", "Amount", ""].map(
                    (h, i) => (
                      <th
                        key={i}
                        className={cn(
                          "px-4 py-2.5",
                          "text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]",
                          i >= 4 ? "text-right" : "text-left",
                        )}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx,i) => (
                  <TableRow
                    key={i}
                    tx={tx}
                    expanded={expandedId === tx.id}
                    onToggle={() => toggle(tx.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-[var(--border-default)]">
            {filtered.map((tx, i) => (
              <MobileCard
                key={i}
                tx={tx}
                expanded={expandedId === tx.id}
                onToggle={() => toggle(tx.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
