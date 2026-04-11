"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "icon";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button */
  variant?: ButtonVariant;
  /** Controls height and padding */
  size?: ButtonSize;
  /** Shows a spinner and disables the button */
  loading?: boolean;
}

// ─── Variant styles ───────────────────────────────────────────────────────────

const variantClasses: Record<ButtonVariant, string> = {
  /**
   * Purple-500 background, white text.
   * Hover → purple-600 · Active → purple-700 · Disabled → 50% opacity
   */
  primary: cn(
    "bg-purple-500 text-white",
    "hover:bg-purple-600",
    "active:bg-purple-700",
    "border border-transparent",
  ),

  /**
   * Transparent background, purple-500 text, 1px purple-300 border.
   * Hover → purple-50 (light) / purple-900 (dark)
   */
  secondary: cn(
    "bg-transparent text-purple-500",
    "border border-purple-300",
    "hover:bg-purple-50 dark:hover:bg-purple-900",
    "active:bg-purple-100 dark:active:bg-purple-800",
  ),

  /**
   * Transparent background, secondary text color, no border.
   * Hover → bg-tertiary background
   */
  ghost: cn(
    "bg-transparent border border-transparent",
    "text-[var(--text-secondary)]",
    "hover:bg-[var(--bg-tertiary)]",
    "active:bg-[var(--bg-tertiary)]",
  ),

  /**
   * chart-negative (red) background, white text.
   * Reserved for destructive actions only.
   */
  danger: cn(
    "bg-chart-negative text-white",
    "border border-transparent",
    "hover:bg-red-600",
    "active:bg-red-700",
  ),

  /**
   * Square icon-only button — same visual style as ghost.
   * Width is set equal to height; no horizontal padding.
   */
  icon: cn(
    "bg-transparent border border-transparent",
    "text-[var(--text-secondary)]",
    "hover:bg-[var(--bg-tertiary)]",
    "active:bg-[var(--bg-tertiary)]",
  ),
};

// ─── Size styles ──────────────────────────────────────────────────────────────

/**
 * Sizes for text-bearing buttons.
 * radius-md (10px) on sm/md, radius-full (pill) on lg (for landing CTAs).
 */
const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-md",
  md: "h-10 px-4 text-sm gap-2 rounded-md",
  lg: "h-[52px] px-8 text-base gap-2 rounded-full",
};

/**
 * Sizes for the icon variant (square, no padding).
 * Brief spec: default icon button is 36×36 (md).
 */
const iconSizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 w-8 rounded-md",
  md: "h-9 w-9 rounded-md",
  lg: "h-11 w-11 rounded-md",
};

// ─── Base classes applied to every button ─────────────────────────────────────

const baseClasses = cn(
  "inline-flex items-center justify-center",
  "font-semibold leading-none whitespace-nowrap",
  "select-none cursor-pointer",
  "transition-all duration-150",
  // focus-visible ring in purple-300 (accessibility requirement)
  "focus-visible:outline-none",
  "focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2",
  // disabled state
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
);

// ─── Component ────────────────────────────────────────────────────────────────

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      children,
      className,
      ...props
    },
    ref,
  ) {
    const isIcon = variant === "icon";
    const sizeClass = isIcon ? iconSizeClasses[size] : sizeClasses[size];
    const spinnerSize = size === "sm" ? 14 : 16;

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClass,
          className,
        )}
        {...props}
      >
        {loading ? (
          <>
            <Loader2
              aria-hidden="true"
              className="shrink-0 animate-spin"
              size={spinnerSize}
            />
            {/* Keep text visible but muted when loading (not for icon buttons) */}
            {!isIcon && children && (
              <span className="opacity-70">{children}</span>
            )}
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
