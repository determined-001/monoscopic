"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Theme = "dark" | "light" | "system";

interface ThemeContextValue {
  theme: Theme;
  /** The actual applied theme — never 'system' */
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(resolved: "dark" | "light") {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(resolved);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * ThemeProvider — manages the light/dark/system theme preference.
 *
 * Dark mode is the default (per design brief). The `dark` class is applied
 * to `<html>` and the `@custom-variant dark` in globals.css makes all
 * `dark:` Tailwind utilities respond to it.
 *
 * Persistence: localStorage key `monoscope-theme`.
 *
 * Place this in `app/layout.tsx` wrapping the entire app.
 */
export function ThemeProvider({
  children,
  defaultTheme = "dark",
}: {
  children: ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  const resolvedTheme: "dark" | "light" =
    theme === "system" ? getSystemTheme() : theme;

  // ── Read persisted preference on first mount ─────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem("monoscope-theme") as Theme | null;
    if (stored) setThemeState(stored);
  }, []);

  // ── Apply class to <html> and persist whenever theme changes ────────────
  useEffect(() => {
    applyTheme(resolvedTheme);
    localStorage.setItem("monoscope-theme", theme);
  }, [resolvedTheme, theme]);

  // ── Follow system preference when theme === 'system' ────────────────────
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) =>
      applyTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  function setTheme(next: Theme) {
    setThemeState(next);
  }

  function toggleTheme() {
    setThemeState((t) => (t === "dark" ? "light" : "dark"));
  }

  return (
    <ThemeContext.Provider
      value={{ theme, resolvedTheme, setTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
