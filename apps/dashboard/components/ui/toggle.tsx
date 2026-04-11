"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ToggleProps {
  /** Whether the toggle is on. If provided, the component is controlled. */
  checked?: boolean;
  /** Called when the user toggles. Receives the new checked state. */
  onChange?: (checked: boolean) => void;
  /** Disables the toggle — muted appearance, no interaction. */
  disabled?: boolean;
  /** Accessible label rendered to the right of the track. */
  label?: string;
  /** Accessible description rendered below the label in text-muted. */
  description?: string;
  /** Explicit id for the underlying checkbox. Auto-generated if omitted. */
  id?: string;
  className?: string;
}

// ─── Layout constants ────────────────────────────────────────────────────────
//
// Brief spec:
//   Track:  44 × 24 px
//   Thumb:  20 × 20 px circular
//   Thumb inset from track edge: 2 px on each side
//   Travel: 44 - 20 - 2 - 2 = 20 px

const TRACK_W = 44; // px
const TRACK_H = 24; // px
const THUMB = 20; // px
const INSET = 2; // px from each edge
const TRAVEL = TRACK_W - THUMB - INSET * 2; // = 20

// ─── Component ────────────────────────────────────────────────────────────────

export function Toggle({
  checked = false,
  onChange,
  disabled = false,
  label,
  description,
  id: externalId,
  className,
}: ToggleProps) {
  const generatedId = useId();
  const id = externalId ?? generatedId;

  function handleClick() {
    if (!disabled) onChange?.(!checked);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!disabled) onChange?.(!checked);
    }
  }

  return (
    <div className={cn("flex items-start gap-3", className)}>
      {/* ── Track + thumb ── */}
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative shrink-0 cursor-pointer rounded-full",
          "transition-colors duration-200",
          "focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Track background: --bg-tertiary (off) → purple-500 (on)
          checked
            ? "bg-purple-500"
            : "bg-[var(--bg-tertiary)] border border-[var(--border-default)]",
        )}
        style={{ width: TRACK_W, height: TRACK_H }}
      >
        {/*
         * Framer Motion thumb — springs from left (off) to right (on).
         * Initial x positions at INSET px from left edge.
         * When checked, moves TRAVEL px to the right.
         *
         * Spring config: high stiffness (snappy) with moderate damping (no bounce).
         */}
        <motion.span
          className={cn(
            "absolute top-0 left-0 rounded-full",
            "shadow-sm",
            "bg-white",
          )}
          style={{
            width: THUMB,
            height: THUMB,
            top: INSET,
          }}
          initial={false}
          animate={{ x: checked ? INSET + TRAVEL : INSET }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 35,
            mass: 0.6,
          }}
        />
      </button>

      {/* ── Label + description ── */}
      {(label || description) && (
        <label
          htmlFor={id}
          className={cn(
            "flex flex-col gap-0.5 cursor-pointer select-none",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          {label && (
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-[var(--text-muted)]">
              {description}
            </span>
          )}
        </label>
      )}
    </div>
  );
}
