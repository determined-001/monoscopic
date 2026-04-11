"use client";

import { useState, useEffect } from "react";
import { Heart, Plus, X, Users } from "lucide-react";
import { motion, AnimatePresence, type Easing } from "framer-motion";
import { truncateAddress } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ─── Types + data ─────────────────────────────────────────────────────────────

interface FollowedWhale {
  id: string;
  address: string;
  tag?: string;
  txns24h: number;
  color: { h1: number; h2: number; h3: number };
}


// ─── Blockie avatar ───────────────────────────────────────────────────────────

function WhaleAvatar({
  color,
  size = 32,
}: {
  color: { h1: number; h2: number; h3: number };
  size?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className="shrink-0 rounded-full ring-1 ring-[var(--border-default)]"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(from 0deg,
          hsl(${color.h1},70%,58%), hsl(${color.h2},65%,52%), hsl(${color.h3},70%,56%), hsl(${color.h1},70%,58%))`,
      }}
    />
  );
}

// ─── Whale row ────────────────────────────────────────────────────────────────

function WhaleRow({
  whale,
  followed,
  onToggle,
}: {
  whale: FollowedWhale;
  followed: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors duration-100">
      <WhaleAvatar color={whale.color} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[var(--text-primary)] leading-snug truncate">
          {whale.tag ?? truncateAddress(whale.address)}
        </p>
        <p className="text-[11px] text-[var(--text-muted)]">
          24h: {whale.txns24h} txn{whale.txns24h !== 1 ? "s" : ""}
        </p>
      </div>
      <button
        onClick={() => onToggle(whale.id)}
        aria-label={followed ? "Unfollow" : "Follow"}
        className={cn(
          "shrink-0 flex h-7 w-7 items-center justify-center rounded-md",
          "transition-colors duration-150",
          followed
            ? "text-red-400 hover:text-red-300"
            : "text-[var(--text-muted)] hover:text-red-400",
        )}
      >
        <Heart
          size={14}
          fill={followed ? "currentColor" : "none"}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

// ─── Add wallet form ──────────────────────────────────────────────────────────

function AddWalletForm({ onAdd }: { onAdd: (address: string) => void }) {
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState("");

  function submit() {
    const trimmed = address.trim();
    if (trimmed.length < 10) return;
    onAdd(trimmed);
    setAddress("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2 w-full px-3 py-2 rounded-xl",
          "text-[12px] font-medium text-purple-500",
          "border border-dashed border-purple-500/30",
          "hover:border-purple-500/60 hover:bg-purple-500/5",
          "transition-all duration-150",
        )}
      >
        <Plus size={14} aria-hidden="true" />
        Add Wallet
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-2 rounded-xl border border-[var(--border-active)] bg-purple-500/5">
      <input
        autoFocus
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Paste address or ENS…"
        className={cn(
          "w-full rounded-lg px-3 py-2 text-[12px]",
          "bg-[var(--bg-tertiary)] border border-[var(--border-default)]",
          "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
          "focus:outline-none focus:border-[var(--border-active)]",
          "transition-colors duration-150",
        )}
      />
      <div className="flex gap-2">
        <button
          onClick={submit}
          className="flex-1 h-7 rounded-lg bg-purple-500 text-[11px] font-semibold text-white hover:bg-purple-600 transition-colors duration-150"
        >
          Add
        </button>
        <button
          onClick={() => {
            setOpen(false);
            setAddress("");
          }}
          className="h-7 w-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors duration-150"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Panel content ────────────────────────────────────────────────────────────

function PanelContent({
  whales,
  followed,
  onToggle,
  onAdd,
}: {
  whales: FollowedWhale[];
  followed: Set<string>;
  onToggle: (id: string) => void;
  onAdd: (address: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <AddWalletForm onAdd={onAdd} />
      <div className="flex flex-col gap-0.5 mt-1">
        {whales.map((whale) => (
          <WhaleRow
            key={whale.id}
            whale={whale}
            followed={followed.has(whale.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Mobile bottom sheet ──────────────────────────────────────────────────────

const EASE_OUT: Easing = [0.21, 0.47, 0.32, 0.98];

function MobileSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[4px]"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label="My Whales"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50",
              "bg-[var(--bg-primary)] border-t border-[var(--border-default)]",
              "rounded-t-xl pb-safe max-h-[80vh] overflow-y-auto",
            )}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-[var(--border-default)]" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                My Whales
              </p>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] transition-colors duration-150"
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>
            {/* Content */}
            <div className="px-4 pb-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Followed Whales ──────────────────────────────────────────────────────────

const WHALES_KEY = "followed_whales";
const FOLLOWED_KEY = "followed_whale_ids";

function loadWhales(): FollowedWhale[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WHALES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function loadFollowed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(FOLLOWED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

export function FollowedWhales() {
  const [whales, setWhales] = useState<FollowedWhale[]>(loadWhales);
  const [followed, setFollowed] = useState<Set<string>>(loadFollowed);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Persist whales list whenever it changes
  useEffect(() => {
    localStorage.setItem(WHALES_KEY, JSON.stringify(whales));
  }, [whales]);

  // Persist followed set whenever it changes
  useEffect(() => {
    localStorage.setItem(FOLLOWED_KEY, JSON.stringify([...followed]));
  }, [followed]);

  function toggleFollow(id: string) {
    setFollowed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function addWallet(address: string) {
    const id = `custom-${Date.now()}`;
    const hex = address.toLowerCase().replace("0x", "").padEnd(32, "0");
    setWhales((prev) => [
      ...prev,
      {
        id,
        address,
        txns24h: 0,
        color: {
          h1: Math.round((parseInt(hex.slice(0, 4), 16) / 0xffff) * 360),
          h2: Math.round((parseInt(hex.slice(4, 8), 16) / 0xffff) * 360),
          h3: Math.round((parseInt(hex.slice(8, 12), 16) / 0xffff) * 360),
        },
      },
    ]);
    setFollowed((prev) => new Set([...prev, id]));
  }

  const panelContent = (
    <PanelContent
      whales={whales}
      followed={followed}
      onToggle={toggleFollow}
      onAdd={addWallet}
    />
  );

  return (
    <>
      {/* ── Desktop: sidebar panel ── */}
      <div
        className={cn(
          "hidden xl:flex flex-col w-[280px] shrink-0",
          "rounded-[14px] p-4",
          "bg-[var(--bg-secondary)]",
          "border border-[var(--border-default)]",
          "shadow-[var(--shadow-sm)]",
          "self-start sticky top-24",
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-semibold text-[var(--text-primary)]">
            My Whales
          </p>
          <span className="text-[11px] text-[var(--text-muted)]">
            {followed.size} following
          </span>
        </div>
        {panelContent}
      </div>

      {/* ── Mobile: FAB ── */}
      <button
        onClick={() => setSheetOpen(true)}
        className={cn(
          "xl:hidden fixed bottom-[88px] right-4 z-30",
          "flex items-center gap-2 h-12 px-4 rounded-full",
          "bg-purple-500 text-white",
          "shadow-[0_4px_20px_rgba(131,110,249,0.4)]",
          "hover:bg-purple-600 active:bg-purple-700",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300",
        )}
        aria-label="Open My Whales"
      >
        <Users size={16} aria-hidden="true" />
        <span className="text-[13px] font-semibold">My Whales</span>
        {followed.size > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
            {followed.size}
          </span>
        )}
      </button>

      {/* Mobile bottom sheet */}
      <MobileSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        {panelContent}
      </MobileSheet>
    </>
  );
}
