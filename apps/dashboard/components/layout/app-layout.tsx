import { Navbar } from "@/components/layout/navbar";
import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { PageTransition } from "@/components/layout/page-transition";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * AppLayout — shell for all authenticated in-app pages.
 *
 * Desktop (≥768px):
 *   - Fixed top Navbar (h-16)
 *   - Main content starts at pt-16 (below navbar)
 *   - No bottom bar
 *
 * Mobile (<768px):
 *   - Fixed top MobileHeader (h-14 = 56px)
 *   - Fixed bottom MobileTabBar (h-[72px])
 *   - Main content has pt-14 (below header) + pb-[72px] (above tab bar)
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Desktop navbar */}
      <Navbar />

      {/* Mobile top header */}
      <MobileHeader />

      {/* Main content area */}
      <main
        className={cn(
          // Desktop: push content below 64px navbar
          "md:pt-16",
          // Mobile: push content below 56px header + above 72px tab bar
          "pt-14 pb-[72px] md:pb-0",
          // Horizontal padding
          "px-4 md:px-8",
          // Max width container, centered
          "mx-auto max-w-[1440px] w-full",
        )}
      >
        <PageTransition>{children}</PageTransition>
      </main>

      {/* Mobile bottom tab bar */}
      <MobileTabBar />
    </div>
  );
}
