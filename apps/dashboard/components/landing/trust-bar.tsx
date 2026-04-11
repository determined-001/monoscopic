"use client";
import { cn } from "@/lib/utils";

// ─── Partner logo definitions ─────────────────────────────────────────────────

/**
 * Each logo is a minimal inline SVG wordmark / symbol.
 * Rendered at exactly 32px tall; width is unconstrained (set by viewBox).
 * All paths use currentColor so opacity + grayscale filter are handled in CSS.
 */

function MonadLogo() {
  return (
    <svg viewBox="0 0 72 28" height="28" fill="none" aria-label="Monad">
      {/* Hexagon mark */}
      <polygon
        points="12,2 20,6.5 20,15.5 12,20 4,15.5 4,6.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.5" fill="currentColor" />
      {/* Wordmark */}
      <text
        x="26"
        y="16"
        fontFamily="system-ui, sans-serif"
        fontWeight="700"
        fontSize="13"
        fill="currentColor"
        letterSpacing="0.5"
      >
        MONAD
      </text>
    </svg>
  );
}

function KuruLogo() {
  return (
    <svg viewBox="0 0 58 28" height="28" fill="none" aria-label="Kuru">
      {/* K letterform */}
      <line
        x1="6"
        y1="6"
        x2="6"
        y2="22"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="6"
        y1="14"
        x2="14"
        y2="6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="6"
        y1="14"
        x2="14"
        y2="22"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <text
        x="20"
        y="17"
        fontFamily="system-ui, sans-serif"
        fontWeight="700"
        fontSize="13"
        fill="currentColor"
        letterSpacing="0.5"
      >
        KURU
      </text>
    </svg>
  );
}

function GTELogo() {
  return (
    <svg viewBox="0 0 50 28" height="28" fill="none" aria-label="GTE">
      {/* Bold G shape */}
      <path
        d="M14,8 A6,6 0 1,0 14,20 L14,14 L10,14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="22"
        y="17"
        fontFamily="system-ui, sans-serif"
        fontWeight="700"
        fontSize="13"
        fill="currentColor"
        letterSpacing="0.5"
      >
        GTE
      </text>
    </svg>
  );
}

function AaveLogo() {
  return (
    <svg viewBox="0 0 60 28" height="28" fill="none" aria-label="Aave">
      {/* Ghost / A shape */}
      <path
        d="M10,20 L14,8 L18,20"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="11.5"
        y1="15"
        x2="16.5"
        y2="15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <text
        x="22"
        y="17"
        fontFamily="system-ui, sans-serif"
        fontWeight="700"
        fontSize="13"
        fill="currentColor"
        letterSpacing="0.5"
      >
        AAVE
      </text>
    </svg>
  );
}

function ChainlinkLogo() {
  return (
    <svg viewBox="0 0 96 28" height="28" fill="none" aria-label="Chainlink">
      {/* Hexagon link */}
      <polygon
        points="12,4 18,7.5 18,14.5 12,18 6,14.5 6,7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <text
        x="24"
        y="17"
        fontFamily="system-ui, sans-serif"
        fontWeight="700"
        fontSize="13"
        fill="currentColor"
        letterSpacing="0.5"
      >
        CHAINLINK
      </text>
    </svg>
  );
}

function RainbowKitLogo() {
  return (
    <svg viewBox="0 0 106 28" height="28" fill="none" aria-label="RainbowKit">
      {/* Rainbow arc */}
      <path
        d="M4,20 A9,9 0 0,1 22,20"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M7,20 A6,6 0 0,1 19,20"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <text
        x="28"
        y="17"
        fontFamily="system-ui, sans-serif"
        fontWeight="700"
        fontSize="13"
        fill="currentColor"
        letterSpacing="0.5"
      >
        RAINBOWKIT
      </text>
    </svg>
  );
}

function WalletConnectLogo() {
  return (
    <svg
      viewBox="0 0 118 28"
      height="28"
      fill="none"
      aria-label="WalletConnect"
    >
      {/* W shape */}
      <path
        d="M4,8 L8,20 L12,12 L16,20 L20,8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="26"
        y="17"
        fontFamily="system-ui, sans-serif"
        fontWeight="700"
        fontSize="13"
        fill="currentColor"
        letterSpacing="0.5"
      >
        WALLETCONNECT
      </text>
    </svg>
  );
}

const LOGOS = [
  { id: "monad", Logo: MonadLogo },
  { id: "kuru", Logo: KuruLogo },
  { id: "gte", Logo: GTELogo },
  { id: "aave", Logo: AaveLogo },
  { id: "chainlink", Logo: ChainlinkLogo },
  { id: "rainbowkit", Logo: RainbowKitLogo },
  { id: "walletconnect", Logo: WalletConnectLogo },
] as const;

// ─── Logo item ─────────────────────────────────────────────────────────────────

function LogoItem({ Logo, id }: { Logo: React.ComponentType; id: string }) {
  return (
    <div
      key={id}
      className={cn(
        "flex items-center justify-center shrink-0",
        "text-[var(--text-primary)]",
        // 40% opacity base, full on hover
        "opacity-40 grayscale",
        "hover:opacity-100 hover:grayscale-0",
        "transition-all duration-300",
      )}
    >
      <Logo />
    </div>
  );
}

// ─── Trust Bar ─────────────────────────────────────────────────────────────────

/**
 * Trust / partners bar — Section 2 of the landing page.
 *
 * Desktop: single centered row with gap-12 between logos.
 * Mobile: CSS marquee — cloned logo list scrolls infinitely at 30s/loop,
 * pauses on hover via [animation-play-state:paused].
 */
export function TrustBar() {
  return (
    <section className="py-8 border-y border-[var(--border-default)] bg-[var(--bg-primary)] overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-6 md:px-8">
        {/* Overline */}
        <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-7">
          Integrated With
        </p>

        {/* Desktop: centered flex row */}
        <div className="hidden md:flex items-center justify-center gap-12 flex-wrap">
          {LOGOS.map(({ id, Logo }) => (
            <LogoItem key={id} id={id} Logo={Logo} />
          ))}
        </div>

        {/* Mobile: marquee */}
        <div
          className="md:hidden flex"
          style={
            {
              // Pause on hover via group trick — use inline style since we can't
              // use group-hover on the animation-play-state of a child easily.
              // Instead the wrapper itself is the hover target.
            }
          }
        >
          {/*
           * Two identical lists side by side — when the first scrolls fully off
           * screen left, the second seamlessly replaces it.
           * translateX(-50%) shifts by exactly one list width.
           */}
          <div
            className="flex items-center gap-10 shrink-0"
            style={{
              animation: "marquee 30s linear infinite",
              willChange: "transform",
            }}
            // Pause on hover by toggling style via CSS on the parent
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.animationPlayState = "paused";
              const sibling = el.nextElementSibling as HTMLDivElement | null;
              if (sibling) sibling.style.animationPlayState = "paused";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.animationPlayState = "running";
              const sibling = el.nextElementSibling as HTMLDivElement | null;
              if (sibling) sibling.style.animationPlayState = "running";
            }}
          >
            {LOGOS.map(({ id, Logo }) => (
              <LogoItem key={id} id={id} Logo={Logo} />
            ))}
          </div>
          {/* Clone for seamless loop */}
          <div
            className="flex items-center gap-10 shrink-0"
            aria-hidden="true"
            style={{
              animation: "marquee 30s linear infinite",
              willChange: "transform",
            }}
          >
            {LOGOS.map(({ id, Logo }) => (
              <LogoItem key={`${id}-clone`} id={`${id}-clone`} Logo={Logo} />
            ))}
          </div>
        </div>
      </div>

      {/* Marquee keyframe — scoped inline to avoid globals.css pollution */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-100%); }
        }
      `}</style>
    </section>
  );
}
