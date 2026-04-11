"use client";

import {
  useState,
  useRef,
  useEffect,
  useId,
  useCallback,
  type KeyboardEvent,
} from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  /** Options to render in the dropdown. */
  options: SelectOption[];
  /** Currently selected value (controlled). */
  value?: string;
  /** Called when the user picks an option. */
  onChange?: (value: string) => void;
  /** Placeholder text when no value is selected. */
  placeholder?: string;
  /** Disables the select entirely. */
  disabled?: boolean;
  /** Optional label rendered above the trigger. */
  label?: string;
  /** Optional error message. */
  error?: string;
  className?: string;
  /** Explicit id for the trigger button. Auto-generated if omitted. */
  id?: string;
}

// ─── Shared style constants ───────────────────────────────────────────────────

/**
 * Trigger button appearance — mirrors the text input styling from the brief:
 * height 40px · --bg-tertiary bg · --border-default border · radius-md
 */
const triggerBase = cn(
  "relative w-full flex items-center justify-between",
  "h-10 px-3 rounded-md",
  "bg-[var(--bg-tertiary)]",
  "border border-[var(--border-default)]",
  "text-sm text-left cursor-pointer",
  "transition-colors duration-150",
  "focus:outline-none",
  "focus:border-[var(--border-active)]",
  "focus:[box-shadow:var(--shadow-glow)]",
  "disabled:opacity-50 disabled:cursor-not-allowed",
);

// ─── Component ────────────────────────────────────────────────────────────────

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select…",
  disabled = false,
  label,
  error,
  className,
  id: externalId,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const generatedId = useId();
  const id = externalId ?? generatedId;
  const listboxId = `${id}-listbox`;

  const selectedOption = options.find((o) => o.value === value);
  const enabledOptions = options.filter((o) => !o.disabled);

  // ── Close on outside click ───────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);

  // ── Scroll focused option into view ─────────────────────────────────────

  useEffect(() => {
    if (!isOpen || focusedIndex < 0) return;
    const list = listRef.current;
    if (!list) return;
    const item = list.children[focusedIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [focusedIndex, isOpen]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const openAndFocusCurrent = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    const currentIndex = options.findIndex((o) => o.value === value);
    setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
  }, [disabled, options, value]);

  const selectOption = useCallback(
    (option: SelectOption) => {
      if (option.disabled) return;
      onChange?.(option.value);
      setIsOpen(false);
      setFocusedIndex(-1);
    },
    [onChange],
  );

  const handleTriggerKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      switch (e.key) {
        case "Enter":
        case " ":
        case "ArrowDown":
          e.preventDefault();
          openAndFocusCurrent();
          break;
        case "ArrowUp":
          e.preventDefault();
          openAndFocusCurrent();
          break;
        case "Escape":
          setIsOpen(false);
          break;
      }
    },
    [openAndFocusCurrent],
  );

  const handleListKeyDown = useCallback(
    (e: KeyboardEvent<HTMLUListElement>) => {
      const total = options.length;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          setFocusedIndex((prev) => {
            let next = prev + 1;
            while (next < total && options[next]?.disabled) next++;
            return next < total ? next : prev;
          });
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          setFocusedIndex((prev) => {
            let next = prev - 1;
            while (next >= 0 && options[next]?.disabled) next--;
            return next >= 0 ? next : prev;
          });
          break;
        }
        case "Enter":
        case " ": {
          e.preventDefault();
          if (focusedIndex >= 0) {
            const focused = options[focusedIndex];
            if (focused) selectOption(focused);
          }
          break;
        }
        case "Escape":
        case "Tab": {
          setIsOpen(false);
          setFocusedIndex(-1);
          break;
        }
        case "Home": {
          e.preventDefault();
          const firstEnabled = options.findIndex((o) => !o.disabled);
          if (firstEnabled >= 0) setFocusedIndex(firstEnabled);
          break;
        }
        case "End": {
          e.preventDefault();
          const lastEnabled = [...options]
            .reverse()
            .findIndex((o) => !o.disabled);
          if (lastEnabled >= 0)
            setFocusedIndex(options.length - 1 - lastEnabled);
          break;
        }
      }
    },
    [focusedIndex, options, selectOption],
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative flex flex-col gap-1.5", className)}
    >
      {/* ── Label ── */}
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]"
        >
          {label}
        </label>
      )}

      {/* ── Trigger ── */}
      <button
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-invalid={Boolean(error)}
        aria-label={label}
        disabled={disabled}
        onClick={() => (isOpen ? setIsOpen(false) : openAndFocusCurrent())}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          triggerBase,
          isOpen &&
            "border-[var(--border-active)] [box-shadow:var(--shadow-glow)]",
          error && "border-chart-negative",
        )}
      >
        {/* Selected label or placeholder */}
        <span
          className={cn(
            "truncate",
            selectedOption
              ? "text-[var(--text-primary)]"
              : "text-[var(--text-muted)]",
          )}
        >
          {selectedOption?.label ?? placeholder}
        </span>

        {/* Chevron — rotates when open */}
        <ChevronDown
          aria-hidden="true"
          size={16}
          className={cn(
            "ml-2 shrink-0 text-[var(--text-muted)]",
            "transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* ── Dropdown panel ── */}
      {isOpen && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={label}
          aria-activedescendant={
            focusedIndex >= 0 ? `${id}-option-${focusedIndex}` : undefined
          }
          tabIndex={-1}
          onKeyDown={handleListKeyDown}
          className={cn(
            // Position — rendered below the trigger; z-index above navbar
            "absolute top-full left-0 right-0 mt-1.5 z-50",
            // Appearance: bg-primary, shadow-lg, radius-md, 1px border
            "bg-[var(--bg-primary)]",
            "border border-[var(--border-default)]",
            "rounded-md",
            "shadow-[var(--shadow-lg)]",
            // Scroll
            "max-h-60 overflow-y-auto",
            // Subtle entrance
            "animate-in fade-in-0 zoom-in-95 duration-100",
            "py-1",
          )}
        >
          {options.length === 0 ? (
            <li className="px-3 py-2 text-sm text-[var(--text-muted)] select-none">
              No options
            </li>
          ) : (
            options.map((option, index) => {
              const isSelected = option.value === value;
              const isFocused = index === focusedIndex;

              return (
                <li
                  key={option.value}
                  id={`${id}-option-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled}
                  onClick={() => selectOption(option)}
                  onMouseEnter={() =>
                    !option.disabled && setFocusedIndex(index)
                  }
                  className={cn(
                    "relative flex items-center justify-between",
                    "px-3 py-2",
                    "text-sm cursor-pointer select-none",
                    "transition-colors duration-100",
                    // Default text
                    option.disabled
                      ? "text-[var(--text-muted)] cursor-not-allowed opacity-50"
                      : "text-[var(--text-primary)]",
                    // Hover / keyboard focus highlight
                    isFocused && !option.disabled && "bg-[var(--bg-tertiary)]",
                    // Selected option gets a subtle purple tint
                    isSelected &&
                      !option.disabled &&
                      "text-purple-500 bg-purple-500/5",
                    isSelected &&
                      !option.disabled &&
                      isFocused &&
                      "bg-purple-500/10",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {/* Checkmark for the currently selected option */}
                  {isSelected && (
                    <Check
                      aria-hidden="true"
                      size={14}
                      className="ml-2 shrink-0 text-purple-500"
                    />
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}

      {/* ── Error message ── */}
      {error && (
        <p role="alert" className="text-xs text-chart-negative">
          {error}
        </p>
      )}
    </div>
  );
}
