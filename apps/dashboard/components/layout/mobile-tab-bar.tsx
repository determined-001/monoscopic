"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Fish, Bell, Menu, Settings, Wifi, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/whales",    label: "Whales",    icon: Fish },
  { href: "/alerts",    label: "Alerts",    icon: Bell },
  { href: null,         label: "More",      icon: Menu },
] as const;

const MORE_ITEMS = [
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

function MoreSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();

  function navigate(href: string) {
    onClose();
    router.push(href);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[4px]"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            key="sheet"
            role="dialog" aria-modal="true" aria-label="More navigation"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50",
              "bg-[var(--bg-primary)] border-t border-[var(--border-default)] rounded-t-xl",
            )}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-[var(--border-default)]" />
            </div>
            <div className="flex items-center justify-between px-5 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">More</p>
              <button onClick={onClose} aria-label="Close menu" className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] transition-colors duration-150">
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="px-3 pb-2">
              {MORE_ITEMS.map(({ href, label, icon: Icon }) => (
                <button key={href} onClick={() => navigate(href)} className="w-full flex items-center gap-4 px-3 py-3.5 rounded-xl text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors duration-150">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                    <Icon size={20} className="text-purple-500" aria-hidden="true" />
                  </div>
                  <span className="text-[15px] font-medium">{label}</span>
                </button>
              ))}
            </div>
            <div className="mx-5 border-t border-[var(--border-default)]" />
            <div className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-secondary)]">
                  <Wifi size={20} className="text-[var(--text-muted)]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Network</p>
                  <p className="text-xs text-[var(--text-muted)]">Connected</p>
                </div>
              </div>
              <Badge variant="network">Monad Testnet</Badge>
            </div>
            <div className="h-4" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Tab({ href, label, icon: Icon, active, onClick }: { href: string | null; label: string; icon: React.ElementType; active: boolean; onClick?: () => void }) {
  const content = (
    <>
      <div className="relative flex h-8 w-14 items-center justify-center">
        {active && (
          <motion.div layoutId="tab-pill" className="absolute inset-0 rounded-full bg-purple-500/10" transition={{ type: "spring", damping: 30, stiffness: 300 }} />
        )}
        <Icon size={22} aria-hidden="true" className={cn("relative z-10 transition-colors duration-150", active ? "text-purple-500" : "text-[var(--text-muted)]")} />
      </div>
      <span className={cn("text-[11px] font-medium leading-none transition-colors duration-150", active ? "text-purple-500" : "text-[var(--text-muted)]")}>{label}</span>
    </>
  );

  const cls = "flex flex-1 flex-col items-center justify-center gap-1 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-inset";

  if (href) return <Link href={href} className={cls} aria-current={active ? "page" : undefined}>{content}</Link>;
  return <button onClick={onClick} className={cls} aria-label="More options">{content}</button>;
}

export function MobileTabBar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  function isActive(href: string | null) {
    if (!href) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const moreActive = pathname.startsWith("/settings");

  return (
    <>
      <nav role="navigation" aria-label="Mobile tab bar" className={cn("fixed bottom-0 left-0 right-0 z-50 flex md:hidden h-[72px] items-stretch border-t border-[var(--border-default)] backdrop-blur-[12px] backdrop-saturate-150")} style={{ backgroundColor: "var(--bg-nav)" }}>
        <div className="flex w-full items-stretch px-2">
          {TABS.map(({ href, label, icon }) => (
            <Tab key={label} href={href} label={label} icon={icon} active={href ? isActive(href) : moreActive} onClick={href === null ? () => setMoreOpen(true) : undefined} />
          ))}
        </div>
        <div aria-hidden="true" style={{ height: "env(safe-area-inset-bottom)" }} />
      </nav>
      <MoreSheet isOpen={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
