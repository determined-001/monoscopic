"use client";

import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/whales": "Whale Activity",
  "/alerts": "Alerts",
  "/settings": "Settings",
};

function usePageTitle(): string {
  const pathname = usePathname();
  const segment = "/" + pathname.split("/").filter(Boolean)[0];
  return PAGE_TITLES[segment] ?? "Monoscope";
}

export function MobileHeader() {
  const pageTitle = usePageTitle();

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "flex md:hidden",
        "h-14 items-center",
        "border-b border-[var(--border-default)]",
        "backdrop-blur-[12px] backdrop-saturate-150",
        "px-4",
      )}
      style={{ backgroundColor: "var(--bg-nav)" }}
    >
      <div className="flex w-10 items-center">
        <Logo iconSize={28} showWordmark={false} href="/dashboard" />
      </div>
      <div className="flex flex-1 items-center justify-center">
        <h1 className="text-[15px] font-semibold text-[var(--text-primary)] leading-none">
          {pageTitle}
        </h1>
      </div>
      <div className="w-10" />
    </header>
  );
}
