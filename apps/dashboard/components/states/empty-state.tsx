import { Bell, ArrowLeftRight, Fish, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Base component ────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16 px-6 text-center",
        className,
      )}
    >
      <div className="h-16 w-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center shrink-0">
        <Icon size={24} className="text-purple-500" aria-hidden="true" />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[18px] font-semibold text-[var(--text-primary)] leading-snug">
          {title}
        </p>
        <p className="text-[14px] text-[var(--text-secondary)] max-w-[360px] leading-relaxed">
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-1 h-10 px-6 rounded-lg text-[14px] font-semibold text-white bg-purple-500 hover:bg-purple-600 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ─── Presets ───────────────────────────────────────────────────────────────────

export function EmptyAlerts({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={Bell}
      title="No alerts yet"
      description="Set up alerts to get notified about price changes, whale activity, and more."
      actionLabel="Create Your First Alert"
      onAction={onAction}
    />
  );
}

export function EmptyTransactions({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={ArrowLeftRight}
      title="No transactions yet"
      description="Whale activity will appear here as large payments cross the Stellar network."
      actionLabel="Explore Tokens"
      onAction={onAction}
    />
  );
}

export function EmptyWhales({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={Fish}
      title="No whales followed"
      description="Start following whale wallets to track their activity and get alerts."
      actionLabel="Find Whales"
      onAction={onAction}
    />
  );
}
