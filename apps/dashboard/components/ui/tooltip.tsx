"use client";

import {
  useState,
  useRef,
  useEffect,
  useId,
  type ReactNode,
  type HTMLAttributes,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TooltipPosition = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  /** The tooltip content — string or any ReactNode */
  content: ReactNode;
  /** Where the tooltip appears relative to the trigger. Default: 'top' */
  position?: TooltipPosition;
  /** The element that triggers the tooltip on hover / focus */
  children: ReactNode;
  /** Hover delay in ms before the tooltip appears. Default: 300 */
  delay?: number;
  /** Disable the tooltip without removing it from the tree */
  disabled?: boolean;
  className?: string;
}

// ─── Position styles ──────────────────────────────────────────────────────────

/**
 * Tailwind classes that position the tooltip box relative to the wrapper.
 * All positions use translate to centre-align on the relevant axis.
 */
const positionClasses: Record<TooltipPosition, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

/**
 * Framer Motion initial/exit offset per position.
 * The tooltip slides in from the direction it points from.
 */
const motionOffset: Record<TooltipPosition, { x: number; y: number }> = {
  top: { x: 0, y: 4 },
  bottom: { x: 0, y: -4 },
  left: { x: 4, y: 0 },
  right: { x: -4, y: 0 },
};

// ─── CSS-triangle arrow ───────────────────────────────────────────────────────

/**
 * Each arrow is a zero-size div whose borders form a CSS triangle.
 * The "visible" border uses `var(--bg-secondary)` to match the tooltip card.
 * The other two borders are transparent to create the triangle silhouette.
 *
 * Arrow sits flush against the edge it points toward, centred on that edge.
 */
const arrowClasses: Record<TooltipPosition, string> = {
  /**
   * Top tooltip → arrow points DOWN, sits at the bottom of the card.
   * Visible: border-top (bg-secondary). Transparent: left & right.
   */
  top: cn(
    "absolute top-full left-1/2 -translate-x-1/2",
    "w-0 h-0",
    "border-l-[6px] border-l-transparent",
    "border-r-[6px] border-r-transparent",
    "border-t-[6px]",
    // inline style needed for CSS var on the single coloured border
  ),

  /**
   * Bottom tooltip → arrow points UP, sits at the top of the card.
   * Visible: border-bottom (bg-secondary).
   */
  bottom: cn(
    "absolute bottom-full left-1/2 -translate-x-1/2",
    "w-0 h-0",
    "border-l-[6px] border-l-transparent",
    "border-r-[6px] border-r-transparent",
    "border-b-[6px]",
  ),

  /**
   * Left tooltip → arrow points RIGHT, sits at the right edge.
   * Visible: border-left (bg-secondary).
   */
  left: cn(
    "absolute left-full top-1/2 -translate-y-1/2",
    "w-0 h-0",
    "border-t-[6px] border-t-transparent",
    "border-b-[6px] border-b-transparent",
    "border-l-[6px]",
  ),

  /**
   * Right tooltip → arrow points LEFT, sits at the left edge.
   * Visible: border-right (bg-secondary).
   */
  right: cn(
    "absolute right-full top-1/2 -translate-y-1/2",
    "w-0 h-0",
    "border-t-[6px] border-t-transparent",
    "border-b-[6px] border-b-transparent",
    "border-r-[6px]",
  ),
};

/**
 * Returns the inline style for the arrow's visible border.
 * CSS triangles need the colour on the border-side that faces the trigger.
 */
function arrowStyle(position: TooltipPosition): React.CSSProperties {
  const color = "var(--bg-secondary)";
  switch (position) {
    case "top":
      return { borderTopColor: color };
    case "bottom":
      return { borderBottomColor: color };
    case "left":
      return { borderLeftColor: color };
    case "right":
      return { borderRightColor: color };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Tooltip — wraps any single child and shows a floating label on hover/focus.
 *
 * ```tsx
 * <Tooltip content="Copy to clipboard" position="top">
 *   <Button variant="icon"><Copy size={16} /></Button>
 * </Tooltip>
 * ```
 */
export function Tooltip({
  content,
  position = "top",
  children,
  delay = 300,
  disabled = false,
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();

  // ── Show/hide with delay ─────────────────────────────────────────────────

  function show() {
    if (disabled) return;
    timerRef.current = setTimeout(() => setVisible(true), delay);
  }

  function hide() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
  }

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const { x, y } = motionOffset[position];

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {/* ── Trigger ── */}
      <div aria-describedby={visible ? tooltipId : undefined}>{children}</div>

      {/* ── Tooltip card ── */}
      <AnimatePresence>
        {visible && (
          <motion.div
            id={tooltipId}
            role="tooltip"
            initial={{ opacity: 0, x, y }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x, y }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              // Positioning
              "pointer-events-none absolute z-50",
              positionClasses[position],
              // Visual: bg-secondary in both modes gives natural contrast
              "bg-[var(--bg-secondary)]",
              "border border-[var(--border-default)]",
              "rounded-md shadow-md",
              // Typography: Inter Regular 13px, max-width 240px, 8px padding
              "max-w-[240px] px-2.5 py-2",
              "text-[13px] leading-snug text-[var(--text-primary)]",
              "whitespace-normal break-words",
              className,
            )}
          >
            {content}

            {/* CSS-triangle arrow */}
            <div
              aria-hidden="true"
              className={arrowClasses[position]}
              style={arrowStyle(position)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── TooltipProvider (no-op — tooltips are self-contained) ───────────────────

/**
 * Thin wrapper for parity with Radix-style APIs. Optional.
 */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
