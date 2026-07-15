import { ExternalLink } from "lucide-react";

// Replace these with real URLs when available
const LINKS: { label: string; href: string | null }[] = [
  { label: "Documentation", href: null },
  { label: "Twitter / X",   href: null },
  { label: "Discord",       href: null },
  { label: "GitHub",        href: null },
  { label: "Support",       href: null },
];

export function AboutSection() {
  return (
    <div className="flex flex-col gap-6">
      {/* Version badge */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
          <span className="text-[18px] font-bold text-purple-400">M</span>
        </div>
        <div>
          <p className="text-[15px] font-semibold text-[var(--text-primary)]">
            Monoscope
          </p>
          <p className="text-[12px] text-[var(--text-muted)]">
            Version 1.0.0 · Built on Stellar
          </p>
        </div>
      </div>

      {/* Links */}
      <div className="flex flex-col gap-1">
        {LINKS.map((link) =>
          link.href ? (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors duration-100 group"
            >
              <span className="text-[13px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors duration-100">
                {link.label}
              </span>
              <ExternalLink size={13} className="text-[var(--text-muted)]" aria-hidden="true" />
            </a>
          ) : (
            <div
              key={link.label}
              className="flex items-center justify-between px-4 py-3 rounded-xl opacity-40 cursor-not-allowed"
              title="Coming soon"
            >
              <span className="text-[13px] text-[var(--text-secondary)]">
                {link.label}
              </span>
              <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide">
                Soon
              </span>
            </div>
          ),
        )}
      </div>

      {/* Footer */}
      <p className="text-[12px] text-[var(--text-muted)] text-center pt-2">
        Made with <span className="text-chart-negative">♥</span> on Stellar
      </p>
    </div>
  );
}
