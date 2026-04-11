"use client";

import { useState } from "react";
import {
  User,
  Bell,
  Monitor,
  Shield,
  Info,
  Code2,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence, type Easing } from "framer-motion";
import { ProfileSection } from "./profile-section";
import { NotificationsSection } from "./notifications-section";
import { DisplaySection } from "./display-section";
import { SecuritySection } from "./security-section";
import { AboutSection } from "./about-section";
import { DeveloperSection } from "./developer-section";
import { cn } from "@/lib/utils";

// ─── Nav items ─────────────────────────────────────────────────────────────────

type SectionId =
  | "profile"
  | "notifications"
  | "display"
  | "security"
  | "developer"
  | "about";

const NAV: { id: SectionId; label: string; icon: React.ReactNode }[] = [
  { id: "profile",       label: "Profile",       icon: <User    size={15} /> },
  { id: "notifications", label: "Notifications", icon: <Bell    size={15} /> },
  { id: "display",       label: "Display",       icon: <Monitor size={15} /> },
  { id: "security",      label: "Security",      icon: <Shield  size={15} /> },
  { id: "developer",     label: "Developer",     icon: <Code2   size={15} /> },
  { id: "about",         label: "About",         icon: <Info    size={15} /> },
];

const PANELS: Record<SectionId, React.ReactNode> = {
  profile:       <ProfileSection />,
  notifications: <NotificationsSection />,
  display:       <DisplaySection />,
  security:      <SecuritySection />,
  developer:     <DeveloperSection />,
  about:         <AboutSection />,
};

const SECTION_TITLES: Record<SectionId, string> = {
  profile:       "Profile",
  notifications: "Notifications",
  display:       "Display",
  security:      "Security",
  developer:     "Developer",
  about:         "About",
};

const EASE_OUT: Easing = [0.21, 0.47, 0.32, 0.98];

// ─── Desktop sidebar nav item ──────────────────────────────────────────────────

function NavItem({
  item,
  active,
  onClick,
}: {
  item: (typeof NAV)[number];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium",
        "transition-colors duration-150 text-left",
        active
          ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/60",
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-purple-500 rounded-full" />
      )}
      <span className={active ? "text-purple-400" : "text-[var(--text-muted)]"}>
        {item.icon}
      </span>
      {item.label}
    </button>
  );
}

// ─── Mobile collapsible section ────────────────────────────────────────────────

function MobileSection({
  item,
  open,
  onToggle,
}: {
  item: (typeof NAV)[number];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-[var(--border-default)] rounded-[14px] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors duration-150"
      >
        <div className="flex items-center gap-2.5">
          <span
            className={open ? "text-purple-400" : "text-[var(--text-muted)]"}
          >
            {item.icon}
          </span>
          <span className="text-[13px] font-semibold text-[var(--text-primary)]">
            {item.label}
          </span>
        </div>
        <ChevronDown
          size={15}
          className={cn(
            "text-[var(--text-muted)] transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-4 py-5 border-t border-[var(--border-default)] bg-[var(--bg-secondary)]">
              {PANELS[item.id]}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Settings Layout ───────────────────────────────────────────────────────────

export function SettingsLayout() {
  const [active, setActive] = useState<SectionId>("profile");
  const [mobileOpen, setMobileOpen] = useState<SectionId | null>("profile");

  function toggleMobile(id: SectionId) {
    setMobileOpen((prev) => (prev === id ? null : id));
  }

  return (
    <>
      {/* ── Desktop: sidebar + content ── */}
      <div className="hidden md:flex gap-8 items-start">
        {/* Sidebar */}
        <nav
          className="w-[200px] shrink-0 flex flex-col gap-1 sticky top-24"
          aria-label="Settings navigation"
        >
          {NAV.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              active={active === item.id}
              onClick={() => setActive(item.id)}
            />
          ))}
        </nav>

        {/* Content panel */}
        <div
          className={cn(
            "flex-1 min-w-0 rounded-[14px] p-6",
            "bg-[var(--bg-secondary)] border border-[var(--border-default)]",
            "shadow-[var(--shadow-sm)]",
          )}
        >
          <p className="text-[15px] font-semibold text-[var(--text-primary)] mb-5">
            {SECTION_TITLES[active]}
          </p>
          {PANELS[active]}
        </div>
      </div>

      {/* ── Mobile: collapsible sections ── */}
      <div className="flex flex-col gap-3 md:hidden">
        {NAV.map((item) => (
          <MobileSection
            key={item.id}
            item={item}
            open={mobileOpen === item.id}
            onToggle={() => toggleMobile(item.id)}
          />
        ))}
      </div>
    </>
  );
}
