import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LogoProps {
  /** Icon diameter in pixels. Default: 32 */
  iconSize?: number;
  /** Show the "Monoscope" wordmark next to the icon. Default: true */
  showWordmark?: boolean;
  /** Navigation target. Default: '/' */
  href?: string;
  className?: string;
}

// ─── Monoscope Icon ───────────────────────────────────────────────────────────

/**
 * The Monoscope logomark — a stylized "M" inside a circular lens/eye motif.
 *
 * Implementation uses a CSS gradient `<div>` for the background circle
 * (avoids SVG linearGradient id conflicts when rendered in multiple places)
 * and an SVG overlay for the M path and lens details.
 */
function MonoscopeIcon({ size }: { size: number }) {
  return (
    <div
      aria-hidden="true"
      className="relative shrink-0 rounded-full"
      style={{ width: size, height: size }}
    >
      {/* Gradient background circle */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "linear-gradient(135deg, #836EF9 0%, #38BDF8 100%)",
        }}
      />

      {/* SVG overlay — lens rings + M letterform */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        className="absolute inset-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer lens ring */}
        <circle
          cx="16"
          cy="16"
          r="10"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
        />

        {/*
         * Stylised M letterform.
         * Two diagonal strokes meet at the centre-top, then drop straight to
         * the baseline — giving a clean geometric "M" that reads at small sizes.
         */}
        <path
          d="M8.5 22V11.5L16 17.5L23.5 11.5V22"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Lens pupil dot — the "eye" reference point */}
        <circle cx="16" cy="16" r="1.5" fill="rgba(255,255,255,0.55)" />
      </svg>
    </div>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

/**
 * Logo — icon + optional wordmark, wrapped in a Next.js Link.
 *
 * ```tsx
 * // Full logo in navbar:
 * <Logo />
 *
 * // Icon only for mobile header:
 * <Logo showWordmark={false} iconSize={28} href="/dashboard" />
 * ```
 */
export function Logo({
  iconSize = 32,
  showWordmark = true,
  href = "/",
  className,
}: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 rounded-md",
        className,
      )}
    >
      <MonoscopeIcon size={iconSize} />

      {showWordmark && (
        <span
          className={cn(
            "font-bold text-[var(--text-primary)] tracking-tight leading-none",
            // Scale wordmark with icon size
            iconSize >= 32 ? "text-[17px]" : "text-[15px]",
          )}
        >
          Monoscope
        </span>
      )}
    </Link>
  );
}
