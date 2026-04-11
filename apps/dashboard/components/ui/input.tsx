"use client";

import { forwardRef, useId, useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type InputVariant = "default" | "search";

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  /** Visual/functional variant. 'search' adds icon + clear button. */
  variant?: InputVariant;
  /**
   * Called when the user clicks the clear (×) button in search variant.
   * The parent is responsible for resetting the value.
   */
  onClear?: () => void;
  /** Optional label rendered above the input. */
  label?: string;
  /** Optional error message rendered below the input. */
  error?: string;
  /** Passes an explicit id. Auto-generated if omitted (for label association). */
  id?: string;
}

// ─── Shared style constants ───────────────────────────────────────────────────

/**
 * Core input field appearance.
 * Background: --bg-tertiary · Border: --border-default → --border-active on focus
 * Height: 40px (h-10) · Radius: radius-md (10px)
 */
const fieldBase = cn(
  "w-full h-10 rounded-md",
  "bg-[var(--bg-tertiary)]",
  "border border-[var(--border-default)]",
  "text-sm text-[var(--text-primary)]",
  "placeholder:text-[var(--text-muted)]",
  "transition-colors duration-150",
  // Focus state: border switches to --border-active + glow shadow
  "focus:outline-none",
  "focus:border-[var(--border-active)]",
  "focus:[box-shadow:var(--shadow-glow)]",
  // Disabled
  "disabled:opacity-50 disabled:cursor-not-allowed",
);

// ─── Component ────────────────────────────────────────────────────────────────

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    variant = "default",
    onClear,
    label,
    error,
    id: externalId,
    className,
    value,
    defaultValue,
    onChange,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = externalId ?? generatedId;

  /**
   * Internal tracking of whether the search input has content.
   * Works for both controlled (value prop) and uncontrolled (defaultValue) usage.
   */
  const [hasValue, setHasValue] = useState(() =>
    Boolean(value ?? defaultValue),
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      onChange?.(e);
    },
    [onChange],
  );

  /**
   * Keep hasValue in sync when the `value` prop changes externally
   * (controlled input where parent clears the value programmatically).
   */
  const controlledHasValue = value !== undefined ? Boolean(value) : hasValue;
  const showClear = variant === "search" && controlledHasValue;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {/* ── Label ── */}
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]"
        >
          {label}
        </label>
      )}

      {/* ── Input wrapper (relative for icon positioning) ── */}
      <div className="relative flex items-center">
        {/* Search icon — left side */}
        {variant === "search" && (
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 shrink-0 text-[var(--text-muted)]"
            size={16}
          />
        )}

        <input
          ref={ref}
          id={inputId}
          type="text"
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            fieldBase,
            // Horizontal padding accounts for icons
            variant === "search"
              ? cn("pl-9", showClear ? "pr-9" : "pr-3")
              : "px-3",
            // Error state overrides border color
            error && "border-chart-negative focus:border-chart-negative",
          )}
          {...props}
        />

        {/* Clear button — right side, only in search variant when populated */}
        {variant === "search" && showClear && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={onClear}
            className={cn(
              "absolute right-3",
              "flex h-5 w-5 items-center justify-center rounded-full",
              "text-[var(--text-muted)]",
              "hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)]",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300",
            )}
          >
            <X size={12} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* ── Error message ── */}
      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="text-xs text-chart-negative"
        >
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";
