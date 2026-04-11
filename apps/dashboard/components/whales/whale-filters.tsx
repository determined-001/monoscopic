"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WhaleFilterState {
  tokens: string[];
  minValue: number;
  actions: string[];
  timeRange: string;
  address: string;
}

export const DEFAULT_FILTERS: WhaleFilterState = {
  tokens: [],
  minValue: 0,
  actions: [],
  timeRange: "24H",
  address: "",
};

// ─── Token options ────────────────────────────────────────────────────────────

const TOKEN_OPTIONS = [
  { symbol: "MON", color: "#836EF9" },
  { symbol: "USDC", color: "#38BDF8" },
  { symbol: "wETH", color: "#FBBF24" },
  { symbol: "KURU", color: "#A78BFA" },
  { symbol: "sMON", color: "#22C55E" },
  { symbol: "USDT", color: "#26A17B" },
  { symbol: "wBTC", color: "#F7931A" },
] as const;

const MIN_VALUE_OPTIONS = [
  { label: "$10K", value: 10_000 },
  { label: "$50K", value: 50_000 },
  { label: "$100K", value: 100_000 },
  { label: "$500K", value: 500_000 },
  { label: "$1M+", value: 1_000_000 },
];

const ACTION_OPTIONS = ["Buy", "Sell", "Transfer", "Bridge"] as const;

const TIME_RANGE_OPTIONS = ["1H", "6H", "24H", "7D"] as const;

// ─── Token multi-select dropdown ──────────────────────────────────────────────

function TokenDropdown({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (tokens: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open]);

  function toggle(symbol: string) {
    onChange(
      selected.includes(symbol)
        ? selected.filter((s) => s !== symbol)
        : [...selected, symbol],
    );
  }

  const label =
    selected.length === 0
      ? "All Tokens"
      : selected.length === 1
        ? selected[0]
        : `${selected.length} Tokens`;

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 h-8 px-3 rounded-lg",
          "text-[12px] font-medium",
          "border transition-colors duration-150",
          open || selected.length > 0
            ? "border-[var(--border-active)] text-[var(--text-primary)] bg-purple-500/5"
            : "border-[var(--border-default)] text-[var(--text-secondary)] bg-[var(--bg-tertiary)]",
          "hover:border-[var(--border-active)]",
        )}
      >
        {label}
        {selected.length > 0 ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange([]);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                onChange([]);
              }
            }}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            aria-label="Clear token filter"
          >
            <X size={11} />
          </span>
        ) : (
          <ChevronDown
            size={12}
            className={cn(
              "text-[var(--text-muted)] transition-transform",
              open && "rotate-180",
            )}
          />
        )}
      </button>

      {open && (
        <div
          className={cn(
            "absolute top-full left-0 mt-1.5 z-30",
            "w-[180px] rounded-xl py-1.5",
            "bg-[var(--bg-primary)] border border-[var(--border-default)]",
            "shadow-[var(--shadow-lg)]",
          )}
        >
          {TOKEN_OPTIONS.map(({ symbol, color }) => {
            const checked = selected.includes(symbol);
            return (
              <button
                key={symbol}
                onClick={() => toggle(symbol)}
                className={cn(
                  "flex items-center gap-2.5 w-full px-3 py-2",
                  "text-[13px] text-[var(--text-primary)]",
                  "hover:bg-[var(--bg-tertiary)] transition-colors duration-100",
                  checked && "bg-purple-500/5",
                )}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ background: color }}
                />
                <span className="flex-1 text-left">{symbol}</span>
                {checked && (
                  <Check size={12} className="text-purple-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Pill toggle group ────────────────────────────────────────────────────────

function PillGroup<T extends string>({
  options,
  active,
  onToggle,
  single = false,
}: {
  options: readonly T[];
  active: T | T[];
  onToggle: (val: T) => void;
  single?: boolean;
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {options.map((opt) => {
        const isActive = Array.isArray(active)
          ? active.includes(opt)
          : active === opt;
        return (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={cn(
              "h-8 px-3 rounded-full text-[12px] font-semibold transition-colors duration-150",
              isActive
                ? "bg-purple-500 text-white"
                : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── Whale Filters ────────────────────────────────────────────────────────────

interface WhaleFiltersProps {
  filters: WhaleFilterState;
  onChange: (f: WhaleFilterState) => void;
}

export function WhaleFilters({ filters, onChange }: WhaleFiltersProps) {
  function set<K extends keyof WhaleFilterState>(
    key: K,
    value: WhaleFilterState[K],
  ) {
    onChange({ ...filters, [key]: value });
  }

  function toggleMinValue(val: number) {
    set("minValue", filters.minValue === val ? 0 : val);
  }

  function toggleAction(action: string) {
    set(
      "actions",
      filters.actions.includes(action)
        ? filters.actions.filter((a) => a !== action)
        : [...filters.actions, action],
    );
  }

  const hasActiveFilters =
    filters.tokens.length > 0 ||
    filters.minValue > 0 ||
    filters.actions.length > 0 ||
    filters.timeRange !== "24H" ||
    filters.address !== "";

  return (
    <div
      className={cn(
        "rounded-[14px] px-4 py-3",
        "bg-[var(--bg-secondary)]",
        "border border-[var(--border-default)]",
        "shadow-[var(--shadow-sm)]",
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        {/* Token multi-select */}
        <TokenDropdown
          selected={filters.tokens}
          onChange={(t) => set("tokens", t)}
        />

        <div className="h-5 w-px bg-[var(--border-default)] hidden sm:block shrink-0" />

        {/* Min value pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-[var(--text-muted)] font-medium shrink-0">
            Min:
          </span>
          {MIN_VALUE_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => toggleMinValue(value)}
              className={cn(
                "h-7 px-2.5 rounded-full text-[11px] font-semibold transition-colors duration-150",
                filters.minValue === value
                  ? "bg-purple-500 text-white"
                  : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-[var(--border-default)] hidden sm:block shrink-0" />

        {/* Action toggles */}
        <div className="flex items-center gap-1 flex-wrap">
          {ACTION_OPTIONS.map((action) => {
            const isActive = filters.actions.includes(action);
            const colors: Record<string, string> = {
              Buy: "bg-chart-positive text-white",
              Sell: "bg-chart-negative text-white",
              Transfer: "bg-purple-500 text-white",
              Bridge: "bg-[#FBBF24] text-[#0D0B14]",
            };
            return (
              <button
                key={action}
                onClick={() => toggleAction(action)}
                className={cn(
                  "h-7 px-2.5 rounded-full text-[11px] font-semibold transition-all duration-150",
                  isActive
                    ? colors[action]
                    : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                )}
              >
                {action}
              </button>
            );
          })}
        </div>

        <div className="h-5 w-px bg-[var(--border-default)] hidden sm:block shrink-0" />

        {/* Time range pills */}
        <PillGroup
          options={TIME_RANGE_OPTIONS}
          active={filters.timeRange as (typeof TIME_RANGE_OPTIONS)[number]}
          onToggle={(t) => set("timeRange", t)}
          single
        />

        {/* Spacer */}
        <div className="flex-1 hidden sm:block" />

        {/* Address search */}
        <div className="relative shrink-0 w-full sm:w-auto">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            aria-hidden="true"
          />
          <input
            type="text"
            value={filters.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="Search address…"
            className={cn(
              "h-8 w-full sm:w-[200px] pl-7 pr-3 rounded-lg",
              "text-[12px] text-[var(--text-primary)]",
              "bg-[var(--bg-tertiary)] border border-[var(--border-default)]",
              "placeholder:text-[var(--text-muted)]",
              "focus:outline-none focus:border-[var(--border-active)] focus:[box-shadow:var(--shadow-glow)]",
              "transition-colors duration-150",
            )}
          />
        </div>

        {/* Clear all */}
        {hasActiveFilters && (
          <button
            onClick={() => onChange({ ...DEFAULT_FILTERS, timeRange: "24H" })}
            className="text-[11px] font-medium text-[var(--text-muted)] hover:text-chart-negative transition-colors duration-150 shrink-0"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
