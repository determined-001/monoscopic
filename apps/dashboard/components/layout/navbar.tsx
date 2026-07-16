"use client";

import { useState, useRef, useCallback, useEffect, useMemo, type KeyboardEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowUpRight, Bell } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { truncateAddress } from "@/lib/utils";
import { useMonoscopeStore } from "@/lib/store/useMonoscope";
import { useAlerts } from "@/lib/hooks/useAlerts";

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/whales", label: "Whale Activity" },
  { href: "/alerts", label: "Alerts" },
  { href: "/settings", label: "Settings" },
] as const;

// ─── Search result types ──────────────────────────────────────────────────────

interface SearchResult {
  id: string;
  label: string;
  sub: string;
  href: string;
  icon: "whale" | "alert";
}

// ─── Search section ───────────────────────────────────────────────────────────

function SearchSection() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const whaleAlerts = useMonoscopeStore((s) => s.whaleAlerts);
  const { alerts } = useAlerts();

  function openSearch() {
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function closeSearch() {
    setOpen(false);
    setValue("");
  }

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") closeSearch();
  }, []);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    function handler(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) closeSearch();
    }
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open]);

  const results = useMemo<SearchResult[]>(() => {
    const q = value.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    const out: SearchResult[] = [];

    // Search whale activity — match address or tx hash. txHash is nullable:
    // Horizon trade records carry no transaction hash, so it cannot be searched
    // or used as a key for those.
    for (const w of whaleAlerts) {
      if (
        w.from.toLowerCase().includes(q) ||
        w.to.toLowerCase().includes(q) ||
        (w.txHash?.toLowerCase().includes(q) ?? false)
      ) {
        out.push({
          id: w.opId,
          label: truncateAddress(w.from),
          sub: w.txHash
            ? `Tx ${truncateAddress(w.txHash)} · ledger #${w.ledger}`
            : `${w.kind} · ledger #${w.ledger}`,
          href: "/whales",
          icon: "whale",
        });
        if (out.length >= 5) break;
      }
    }

    // Search alerts — match name or token
    for (const a of alerts) {
      if (
        a.name.toLowerCase().includes(q) ||
        (a.assetKey ?? "").toLowerCase().includes(q)
      ) {
        out.push({
          id: a.id,
          label: a.name,
          sub: `${a.type} · ${a.condition} ${a.thresholdStroops} stroops`,
          href: "/alerts",
          icon: "alert",
        });
        if (out.length >= 8) break;
      }
    }

    return out;
  }, [value, whaleAlerts, alerts]);

  function navigate(href: string) {
    router.push(href);
    closeSearch();
  }

  return (
    <div ref={containerRef} className="relative flex items-center" onKeyDown={handleKeyDown}>
      <AnimatePresence initial={false} mode="wait">
        {open ? (
          <motion.div
            key="search-input"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <Input
              ref={inputRef}
              variant="search"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onClear={closeSearch}
              onBlur={() => { if (!value) closeSearch(); }}
              placeholder="Search addresses, alerts…"
              className="w-[220px]"
            />
          </motion.div>
        ) : (
          <motion.button
            key="search-icon"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={openSearch}
            aria-label="Open search"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md",
              "text-[var(--text-secondary)]",
              "hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300",
            )}
          >
            <Search size={18} aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Results dropdown */}
      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute top-full right-0 mt-2 z-50",
              "w-[280px] rounded-xl py-1.5",
              "bg-[var(--bg-primary)] border border-[var(--border-default)]",
              "shadow-[var(--shadow-lg)]",
            )}
          >
            {results.map((r) => (
              <button
                key={r.id}
                onPointerDown={(e) => { e.preventDefault(); navigate(r.href); }}
                className="flex items-center gap-3 w-full px-3 py-2 hover:bg-[var(--bg-tertiary)] transition-colors duration-100 text-left"
              >
                <div className={cn(
                  "h-7 w-7 rounded-lg flex items-center justify-center shrink-0",
                  r.icon === "whale" ? "bg-purple-500/15" : "bg-amber-500/15",
                )}>
                  {r.icon === "whale"
                    ? <ArrowUpRight size={13} className="text-purple-400" />
                    : <Bell size={13} className="text-amber-400" />
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">{r.label}</p>
                  <p className="text-[11px] text-[var(--text-muted)] truncate">{r.sub}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export function Navbar() {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "hidden md:flex",
        "h-16 items-center",
        "border-b border-[var(--border-default)]",
        "backdrop-blur-[12px] backdrop-saturate-150",
      )}
      style={{ backgroundColor: "var(--bg-nav)" }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] items-center px-8">
        {/* Left: Logo */}
        <div className="flex items-center w-[200px]">
          <Logo href="/dashboard" />
        </div>

        {/* Center: Nav links */}
        <nav role="navigation" aria-label="Main navigation" className="flex flex-1 items-center justify-center gap-1">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center px-3 h-16",
                  "text-[14px] font-medium",
                  "transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-inset",
                  !active && "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                  active && "text-purple-500",
                )}
                aria-current={active ? "page" : undefined}
              >
                {label}
                {active && (
                  <span aria-hidden="true" className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-purple-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Search + Network */}
        <div className="flex items-center justify-end gap-3 w-[200px] md:w-auto">
          <SearchSection />
          <Badge variant="network">Stellar Mainnet</Badge>
        </div>
      </div>
    </header>
  );
}
