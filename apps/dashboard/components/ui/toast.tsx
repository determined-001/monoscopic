"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  type: ToastType;
  title: string;
  description?: string;
  /** Duration in ms. Pass 0 to persist until manually dismissed. Default: 5000 */
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: string;
  /** Resolved duration — defaults to 5000 if ToastOptions.duration was undefined */
  duration: number;
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

type Action =
  | { type: "ADD"; toast: ToastItem }
  | { type: "REMOVE"; id: string };

function reducer(state: ToastItem[], action: Action): ToastItem[] {
  switch (action.type) {
    case "ADD":
      // Newest at the START so it appears at the bottom of the stack
      return [action.toast, ...state];
    case "REMOVE":
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface ToastContextValue {
  toasts: ToastItem[];
  dispatch: React.Dispatch<Action>;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── useToast hook ────────────────────────────────────────────────────────────

/**
 * Returns a `toast` function with convenience `.success()`, `.error()`,
 * `.info()`, and `.warning()` methods, plus a `dismiss(id)` utility.
 *
 * Must be used inside `<ToastProvider>`.
 *
 * ```tsx
 * const { toast } = useToast()
 * toast.success('Wallet connected', 'You are now signed in.')
 * toast({ type: 'error', title: 'Transaction failed', duration: 0 })
 * ```
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");

  const { dispatch } = ctx;

  const add = useCallback(
    (options: ToastOptions) => {
      const id = crypto.randomUUID();
      dispatch({
        type: "ADD",
        toast: { ...options, id, duration: options.duration ?? 5000 },
      });
      return id;
    },
    [dispatch],
  );

  const dismiss = useCallback(
    (id: string) => dispatch({ type: "REMOVE", id }),
    [dispatch],
  );

  // Attach convenience methods to the `add` function itself
  const toast = add as typeof add & {
    success: (title: string, description?: string, duration?: number) => string;
    error: (title: string, description?: string, duration?: number) => string;
    info: (title: string, description?: string, duration?: number) => string;
    warning: (title: string, description?: string, duration?: number) => string;
  };

  toast.success = (title, description?, duration?) =>
    add({ type: "success", title, description, duration });
  toast.error = (title, description?, duration?) =>
    add({ type: "error", title, description, duration });
  toast.info = (title, description?, duration?) =>
    add({ type: "info", title, description, duration });
  toast.warning = (title, description?, duration?) =>
    add({ type: "warning", title, description, duration });

  return { toast, dismiss, toasts: ctx.toasts };
}

// ─── Visual config per type ───────────────────────────────────────────────────

const typeConfig: Record<
  ToastType,
  { icon: React.ElementType; borderColor: string; iconClass: string }
> = {
  success: {
    icon: CheckCircle,
    borderColor: "#22C55E", // --chart-positive
    iconClass: "text-chart-positive",
  },
  error: {
    icon: XCircle,
    borderColor: "#EF4444", // --chart-negative
    iconClass: "text-chart-negative",
  },
  info: {
    icon: Info,
    borderColor: "#836EF9", // --purple-500
    iconClass: "text-purple-500",
  },
  warning: {
    icon: AlertTriangle,
    borderColor: "#FBBF24", // --chart-series-3 (amber)
    iconClass: "text-amber-400",
  },
};

// ─── Individual Toast card ────────────────────────────────────────────────────

interface ToastCardProps {
  item: ToastItem;
  onDismiss: () => void;
}

function ToastCard({ item, onDismiss }: ToastCardProps) {
  const { icon: Icon, borderColor, iconClass } = typeConfig[item.type];
  const hasDuration = item.duration > 0;

  /**
   * When the progress bar's scaleX animation completes (reaches 0),
   * it means the full duration has elapsed — auto-dismiss the toast.
   */
  function handleProgressComplete() {
    onDismiss();
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={cn(
        "relative overflow-hidden",
        // Visual: bg-primary, shadow-lg, radius-lg
        "bg-[var(--bg-primary)]",
        "shadow-[var(--shadow-lg)]",
        "rounded-lg",
        // Left accent border (4px) + standard border on other sides
        "border border-[var(--border-default)]",
        "border-l-4",
        // Min / max width
        "w-[360px] max-w-[calc(100vw-2rem)]",
        // Inner padding
        "p-4 pr-10",
      )}
      style={{ borderLeftColor: borderColor }}
    >
      {/* ── Content row ── */}
      <div className="flex gap-3">
        {/* Type icon */}
        <Icon
          aria-hidden="true"
          size={18}
          className={cn("mt-0.5 shrink-0", iconClass)}
        />

        {/* Text */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
            {item.title}
          </p>
          {item.description && (
            <p className="text-xs text-[var(--text-secondary)] leading-snug">
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* ── Dismiss button ── */}
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={onDismiss}
        className={cn(
          "absolute right-2 top-2",
          "flex h-6 w-6 items-center justify-center rounded",
          "text-[var(--text-muted)]",
          "hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)]",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300",
        )}
      >
        <X size={14} aria-hidden="true" />
      </button>

      {/* ── Progress bar ── */}
      {hasDuration && (
        /**
         * Scales from 1→0 on the X axis over `duration` ms.
         * origin-left ensures it shrinks left-to-right (progress bar effect).
         * onAnimationComplete fires auto-dismiss when it reaches 0.
         */
        <motion.div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-[3px] origin-left rounded-bl-lg"
          style={{ backgroundColor: borderColor }}
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: item.duration / 1000, ease: "linear" }}
          onAnimationComplete={handleProgressComplete}
        />
      )}
    </div>
  );
}

// ─── Toast container (renders the stack) ─────────────────────────────────────

function ToastContainer() {
  const ctx = useContext(ToastContext);
  if (!ctx) return null;

  const { toasts, dispatch } = ctx;

  return (
    /**
     * Desktop: fixed bottom-right stack.
     * Mobile: fixed bottom-center (sm: breakpoint resets to right alignment).
     * The flex-col-reverse makes the newest toast appear at the bottom,
     * visually closest to the corner, consistent with macOS notification style.
     */
    <div
      aria-label="Notifications"
      className={cn(
        "fixed bottom-4 z-[60]",
        // Desktop: right-aligned stack
        "right-4",
        // Mobile: centred (override right, set left/right equal)
        "max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:right-auto",
        // Stack direction
        "flex flex-col-reverse gap-2",
        // Prevent pointer events on the gap between toasts
        "pointer-events-none",
      )}
    >
      <AnimatePresence initial={false}>
        {toasts.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, x: 48, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{
              opacity: 0,
              scale: 0.94,
              transition: { duration: 0.15, ease: "easeIn" },
            }}
            transition={{
              // Brief spec: spring damping 20
              type: "spring",
              damping: 20,
              stiffness: 300,
            }}
            className="pointer-events-auto"
          >
            <ToastCard
              item={item}
              onDismiss={() => dispatch({ type: "REMOVE", id: item.id })}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── ToastProvider ────────────────────────────────────────────────────────────

/**
 * Wrap your application (or a subtree) with `<ToastProvider>` to enable toasts.
 * Place it near the root so that all child components can call `useToast()`.
 *
 * ```tsx
 * // app/layout.tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <ToastProvider>{children}</ToastProvider>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, dispatch] = useReducer(reducer, []);

  return (
    <ToastContext.Provider value={{ toasts, dispatch }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}
