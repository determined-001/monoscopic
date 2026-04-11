import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Monoscope Docs",
    template: "%s — Monoscope Docs",
  },
  description: "Monoscope SDK & API documentation",
};

// ─── Nav links ────────────────────────────────────────────────────────────────

const NAV = [
  { label: "Introduction", href: "/" },
  { label: "Quickstart", href: "/quickstart" },
  { label: "Authentication", href: "/authentication" },
  { label: "SDK", href: "/sdk" },
];

// ─── Sidebar sections ─────────────────────────────────────────────────────────

const SIDEBAR = [
  {
    title: "Getting Started",
    links: [
      { label: "Introduction", href: "/" },
      { label: "Quickstart", href: "/quickstart" },
      { label: "Authentication", href: "/authentication" },
    ],
  },
  {
    title: "SDK",
    links: [
      { label: "Overview", href: "/sdk" },
      { label: "Function Reference", href: "/sdk/reference" },
      { label: "Events Reference", href: "/sdk/events" },
      { label: "Examples", href: "/sdk/examples" },
    ],
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="layout">
          {/* Top nav */}
          <header className="topnav">
            <a href="/" className="logo">Monoscope Docs</a>
            <nav className="topnav-links">
              {NAV.map((n) => (
                <a key={n.href} href={n.href} className="topnav-link">{n.label}</a>
              ))}
            </nav>
          </header>

          <div className="content-area">
            {/* Sidebar */}
            <aside className="sidebar">
              {SIDEBAR.map((section) => (
                <div key={section.title} className="sidebar-section">
                  <p className="sidebar-title">{section.title}</p>
                  {section.links.map((link) => (
                    <a key={link.href} href={link.href} className="sidebar-link">{link.label}</a>
                  ))}
                </div>
              ))}
            </aside>

            {/* Main content */}
            <main className="main">
              <article className="prose">{children}</article>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
