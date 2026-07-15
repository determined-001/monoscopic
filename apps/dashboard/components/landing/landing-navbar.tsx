"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { gsap } from "gsap";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

// ─── Nav links ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Roadmap", href: "#roadmap" },
] as const;

// ─── Smooth scroll helper ─────────────────────────────────────────────────────

function scrollToSection(href: string) {
  const id = href.replace("#", "");
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// ─── Mobile menu overlay ──────────────────────────────────────────────────────

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function handleLinkClick(href: string) {
    onClose();
    // Small delay to let the overlay animate out first
    setTimeout(() => scrollToSection(href), 200);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mobile-menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed inset-0 z-40",
            "flex flex-col",
            "bg-[#0A0818]", // same deep dark as footer
          )}
        >
          {/* Header row — matches navbar height */}
          <div className="flex h-[72px] items-center justify-between px-5">
            <Logo iconSize={28} showWordmark href="/" />
            <button
              onClick={onClose}
              aria-label="Close menu"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                "text-white/70 hover:text-white hover:bg-white/10",
                "transition-colors duration-150",
              )}
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>

          {/* Nav links — stagger in */}
          <nav className="flex flex-col gap-1 px-5 py-8">
            {NAV_LINKS.map(({ label, href }, i) => (
              <motion.button
                key={href}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.2 }}
                onClick={() => handleLinkClick(href)}
                className={cn(
                  "w-full text-left px-4 py-4 rounded-xl",
                  "text-[18px] font-medium text-white/80",
                  "hover:text-white hover:bg-white/10",
                  "transition-colors duration-150",
                )}
              >
                {label}
              </motion.button>
            ))}
          </nav>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: NAV_LINKS.length * 0.06 + 0.05,
              duration: 0.2,
            }}
            className="px-5 pb-12 mt-auto"
          >
            <Link
              href="/dashboard"
              onClick={onClose}
              className={cn(
                "flex h-14 items-center justify-center rounded-full",
                "bg-purple-500 text-white text-[17px] font-semibold",
                "hover:bg-purple-600 active:bg-purple-700",
                "transition-colors duration-150",
              )}
            >
              Launch App
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Landing Navbar ───────────────────────────────────────────────────────────

/**
 * Fixed top navbar for the landing page.
 *
 * Scroll behavior:
 *   - At y=0: transparent background, white logo + white links
 *   - After 80px scroll: bg-primary + backdrop-blur + bottom border, standard logo colors
 * The transition is 300ms ease on all properties.
 */
export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ticking = useRef(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.1 });
  }, []);

  const handleScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      setScrolled(window.scrollY > 80);
      ticking.current = false;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          "flex h-[72px] items-center",
          // Transition all visual properties smoothly
          "transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          scrolled && "border-b border-[var(--border-default)]",
          scrolled && "backdrop-blur-[12px] backdrop-saturate-150",
        )}
        style={{
          backgroundColor: scrolled ? "var(--bg-nav)" : "transparent",
        }}
      >
        <div className="mx-auto flex w-full max-w-[1280px] items-center px-6 md:px-8">
          {/* ── Left: Logo ── */}
          {/*
           * Logo wordmark color is handled by the component's CSS var (--text-primary).
           * On the transparent state the page background is dark, so we force white
           * by overriding the text color of the wordmark span.
           */}
          <div className="flex items-center w-[160px]">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2.5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 rounded-md",
                "transition-colors duration-300",
              )}
            >
              {/* MonoscopeIcon is always the gradient circle — looks good on both backgrounds */}
              <div
                aria-hidden="true"
                className="relative shrink-0 rounded-full"
                style={{ width: 32, height: 32 }}
              >
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "linear-gradient(135deg, #836EF9 0%, #38BDF8 100%)",
                  }}
                />
                <svg
                  width={32}
                  height={32}
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
              <span
                className={cn(
                  "font-bold tracking-tight leading-none text-[17px]",
                  "transition-colors duration-300",
                  scrolled ? "text-[var(--text-primary)]" : "text-white",
                )}
              >
                Monoscope
              </span>
            </Link>
          </div>

          {/* ── Center: Anchor nav ── (desktop only) */}
          <nav
            role="navigation"
            aria-label="Landing page navigation"
            className="hidden md:flex flex-1 items-center justify-center gap-1"
          >
            {NAV_LINKS.map(({ label, href }) => (
              <button
                key={href}
                onClick={() => scrollToSection(href)}
                className={cn(
                  "px-4 py-2 rounded-md",
                  "text-[14px] font-medium",
                  "transition-colors duration-150",
                  scrolled
                    ? "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    : "text-white/70 hover:text-white",
                )}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* ── Right: CTA + hamburger ── */}
          <div className="flex items-center justify-end gap-3 w-[160px]">
            {/* "Launch App" — desktop */}
            <Link
              href="/dashboard"
              className={cn(
                "hidden md:flex items-center h-10 px-5 rounded-full",
                "bg-purple-500 text-white text-[14px] font-semibold",
                "hover:bg-purple-600 active:bg-purple-700",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300",
              )}
            >
              Launch App
            </Link>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className={cn(
                "flex md:hidden h-10 w-10 items-center justify-center rounded-lg",
                "transition-colors duration-150",
                scrolled
                  ? "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                  : "text-white/70 hover:text-white hover:bg-white/10",
              )}
            >
              <Menu size={22} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile full-screen overlay */}
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
