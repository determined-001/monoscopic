import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── Social icons (inline SVG — no icon library dependency) ──────────────────

function TwitterIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DiscordIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.022.014.043.031.052a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function GitHubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function TelegramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

// ─── Monad icon (simple hexagon shape) ────────────────────────────────────────

function MonadIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <polygon
        points="8,1 14,4.5 14,11.5 8,15 2,11.5 2,4.5"
        fill="none"
        stroke="#836EF9"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="2" fill="#836EF9" />
    </svg>
  );
}

// ─── Column data ──────────────────────────────────────────────────────────────

const SOCIAL_LINKS = [
  { label: "Twitter / X", href: "#", Icon: TwitterIcon },
  { label: "Discord", href: "#", Icon: DiscordIcon },
  { label: "GitHub", href: "#", Icon: GitHubIcon },
  { label: "Telegram", href: "#", Icon: TelegramIcon },
] as const;

const PRODUCT_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/whales", label: "Whale Tracker" },
  { href: "/alerts", label: "Alerts" },
] as const;

const RESOURCE_LINKS = [
  { href: "#", label: "Documentation", badge: undefined },
  { href: "#", label: "API", badge: "coming soon" },
  { href: "#", label: "Blog", badge: undefined },
  { href: "#", label: "Changelog", badge: undefined },
  { href: "#", label: "Status Page", badge: undefined },
] as const;

const LEGAL_LINKS = [
  { href: "#", label: "Terms of Service" },
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Cookie Policy" },
] as const;

// ─── Shared column header ─────────────────────────────────────────────────────

function ColumnHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 text-[11px] font-semibold uppercase tracking-widest text-white/40">
      {children}
    </p>
  );
}

// ─── Shared footer link ───────────────────────────────────────────────────────

function FooterLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const linkClass = cn(
    "text-[14px] text-[#6B6780] hover:text-white",
    "transition-colors duration-150",
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={linkClass}>
      {children}
    </Link>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

/**
 * Landing page footer.
 *
 * Background: #0A0818 — intentionally darker than --bg-primary dark (#0D0B14)
 * to create visual depth at the bottom of the page.
 *
 * Layout: 4-column grid on desktop, single-column on mobile.
 * Columns: Brand | Product | Resources | Legal
 * Bottom bar: copyright left, "Built on Monad" right.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: "#0A0818" }}>
      {/* ── Top border ── */}
      <div className="border-t border-white/[0.08]" />

      {/* ── Main grid ── */}
      <div className="mx-auto max-w-[1280px] px-6 md:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* ── Column 1: Brand ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-4">
              <div
                aria-hidden="true"
                className="relative shrink-0 rounded-full"
                style={{ width: 28, height: 28 }}
              >
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "linear-gradient(135deg, #836EF9 0%, #38BDF8 100%)",
                  }}
                />
                <svg
                  width={28}
                  height={28}
                  viewBox="0 0 32 32"
                  fill="none"
                  className="absolute inset-0"
                >
                  <circle
                    cx="16"
                    cy="16"
                    r="10"
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth="1"
                  />
                  <path
                    d="M8.5 22V11.5L16 17.5L23.5 11.5V22"
                    stroke="white"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="1.5"
                    fill="rgba(255,255,255,0.55)"
                  />
                </svg>
              </div>
              <span className="font-bold text-[16px] tracking-tight text-white leading-none">
                Monoscope
              </span>
            </div>

            {/* One-liner */}
            <p className="text-[14px] text-[#6B6780] leading-relaxed max-w-[220px]">
              On-chain intelligence for the Monad ecosystem.
            </p>

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg",
                    "text-[#5E5A72]",
                    "hover:text-purple-400 hover:bg-purple-400/10",
                    "transition-colors duration-150",
                  )}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* ── Column 2: Product ── */}
          <div>
            <ColumnHeader>Product</ColumnHeader>
            <ul className="flex flex-col gap-3.5">
              {PRODUCT_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <FooterLink href={href}>{label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 3: Resources ── */}
          <div>
            <ColumnHeader>Resources</ColumnHeader>
            <ul className="flex flex-col gap-3.5">
              {RESOURCE_LINKS.map(({ href, label, badge }) => (
                <li key={label} className="flex items-center gap-2">
                  <FooterLink href={href}>{label}</FooterLink>
                  {badge && (
                    <span className="inline-flex items-center rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-medium text-purple-400">
                      {badge}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 4: Legal ── */}
          <div>
            <ColumnHeader>Legal</ColumnHeader>
            <ul className="flex flex-col gap-3.5">
              {LEGAL_LINKS.map(({ href, label }) => (
                <li key={label}>
                  <FooterLink href={href}>{label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-[1280px] px-6 md:px-8 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Copyright */}
          <p className="text-[13px] text-[#5E5A72]">
            &copy; {year} Monoscope. All rights reserved.
          </p>

          {/* Built on Monad */}
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] text-[#5E5A72]">Built on</span>
            <MonadIcon size={16} />
            <span className="text-[13px] font-medium text-white/60">Monad</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
