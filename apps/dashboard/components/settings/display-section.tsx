"use client";

import { useState, useRef } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import { useTheme, type Theme } from "@/components/providers/theme";

const THEMES: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: "light",  label: "Light",  icon: <Sun     size={18} /> },
  { value: "dark",   label: "Dark",   icon: <Moon    size={18} /> },
  { value: "system", label: "System", icon: <Monitor size={18} /> },
];

const THEME_BG: Record<"dark" | "light", string> = {
  dark:  "rgba(0, 0, 0, 0.75)",
  light: "rgba(255, 255, 255, 0.75)",
};

const SELECT =
  "h-9 w-full rounded-lg px-3 text-[13px] bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-active)] transition-colors duration-150 cursor-pointer appearance-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-[var(--text-secondary)]">{label}</label>
      {children}
    </div>
  );
}

export function DisplaySection() {
  const { theme, setTheme } = useTheme();
  const [currency, setCurrency] = useState(() =>
    typeof window !== "undefined"
      ? (localStorage.getItem("display_currency") ?? "USD")
      : "USD",
  );
  const [numFmt, setNumFmt] = useState(() =>
    typeof window !== "undefined"
      ? (localStorage.getItem("display_numFmt") ?? "comma-dot")
      : "comma-dot",
  );
  const buttonRefs = useRef<Map<Theme, HTMLButtonElement>>(new Map());

  function persistCurrency(val: string) {
    setCurrency(val);
    localStorage.setItem("display_currency", val);
  }

  function persistNumFmt(val: string) {
    setNumFmt(val);
    localStorage.setItem("display_numFmt", val);
  }

  function handleThemeChange(next: Theme, btn: HTMLButtonElement | null) {
    if (next === theme) return;

    const oldResolved: "dark" | "light" =
      theme === "system"
        ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : (theme as "dark" | "light");

    const newResolved: "dark" | "light" =
      next === "system"
        ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : (next as "dark" | "light");

    // Compute circle origin — center of clicked button if available, else screen center
    let originX = window.innerWidth / 2;
    let originY = window.innerHeight / 2;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      originX = rect.left + rect.width / 2;
      originY = rect.top + rect.height / 2;
    }

    // Max radius needed to cover the entire viewport from origin
    const maxRadius = Math.ceil(Math.hypot(
      Math.max(originX, window.innerWidth - originX),
      Math.max(originY, window.innerHeight - originY),
    )) + 10;

    // Create overlay painted in OLD theme color — starts full-screen circle
    const overlay = document.createElement("div");
    overlay.style.cssText = [
      "position:fixed", "inset:0", "z-index:99999",
      `background:${THEME_BG[oldResolved]}`,
      "pointer-events:none", "will-change:clip-path",
      `clip-path:circle(${maxRadius}px at ${originX}px ${originY}px)`,
    ].join(";");
    document.body.appendChild(overlay);

    // Apply new theme immediately underneath the overlay
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(newResolved);

    // GSAP: shrink circle from maxRadius → 0, collapsing back into the button
    gsap.to(overlay, {
      clipPath: `circle(0px at ${originX}px ${originY}px)`,
      duration: 1.7,
      ease: "bounce",
      onComplete: () => {
        overlay.remove();
        setTheme(next);
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Theme */}
      <Field label="Theme">
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.value}
              ref={(el) => { if (el) buttonRefs.current.set(t.value, el); }}
              onClick={(e) => handleThemeChange(t.value, e.currentTarget)}
              className={cn(
                "relative flex flex-col items-center gap-2 py-4 rounded-xl border transition-colors duration-150",
                theme === t.value
                  ? "border-purple-500 bg-purple-500/10 text-[var(--text-primary)]"
                  : "border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--border-active)] hover:text-[var(--text-secondary)]",
              )}
            >
              {theme === t.value && (
                <span className="absolute top-2 right-2 h-4 w-4 rounded-full bg-purple-500 flex items-center justify-center">
                  <Check size={9} className="text-white" strokeWidth={3} />
                </span>
              )}
              {t.icon}
              <span className="text-[12px] font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </Field>

      {/* Currency */}
      <Field label="Display currency">
        <div className="relative">
          <select value={currency} onChange={(e) => persistCurrency(e.target.value)} className={SELECT}>
            <option value="USD">USD — US Dollar ($)</option>
            <option value="EUR">EUR — Euro (€)</option>
            <option value="GBP">GBP — British Pound (£)</option>
            <option value="JPY">JPY — Japanese Yen (¥)</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">▾</span>
        </div>
      </Field>

      {/* Number format */}
      <Field label="Number format">
        <div className="relative">
          <select value={numFmt} onChange={(e) => persistNumFmt(e.target.value)} className={SELECT}>
            <option value="comma-dot">1,234,567.89 — US / International</option>
            <option value="dot-comma">1.234.567,89 — European</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">▾</span>
        </div>
      </Field>
    </div>
  );
}
