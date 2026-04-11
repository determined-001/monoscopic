"use client";

import {
  useEffect,
  useRef,
  useCallback,
  useState,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  motion,
  AnimatePresence,
  type Variants,
  type Easing,
} from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModalProps {
  /** Controls visibility. AnimatePresence handles the exit animation. */
  isOpen: boolean;
  /** Called when the user closes the modal (Escape, backdrop click, ✕ button). */
  onClose: () => void;
  /** Optional modal heading rendered in a standard header row. */
  title?: string;
  /** Optional description beneath the title. */
  description?: string;
  children?: ReactNode;
  /**
   * Override the default max-width (560px from brief).
   * Pass a Tailwind class or a pixel value as a string.
   */
  maxWidth?: string;
  /** Extra classes applied to the modal card itself. */
  className?: string;
}

// ─── Focus trap helpers ───────────────────────────────────────────────────────

const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[contenteditable]",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS),
  );
}

// ─── Animation variants ───────────────────────────────────────────────────────

const easeOut: Easing = [0, 0, 0.2, 1];
const easeIn: Easing = [0.4, 0, 1, 1];

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: easeOut } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: easeIn } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    // Brief spec: spring damping 25
    transition: { type: "spring", damping: 25, stiffness: 350 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15, ease: easeIn },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Modal — full-featured dialog with portal, focus trap, and Framer Motion transitions.
 *
 * The parent controls `isOpen` and `onClose`. The modal itself is always rendered
 * in the tree (portal to document.body), letting AnimatePresence run exit animations.
 *
 * ```tsx
 * <Modal isOpen={show} onClose={() => setShow(false)} title="Confirm action">
 *   <p>Are you sure?</p>
 *   <div className="mt-6 flex gap-3 justify-end">
 *     <Button variant="ghost" onClick={() => setShow(false)}>Cancel</Button>
 *     <Button variant="danger">Delete</Button>
 *   </div>
 * </Modal>
 * ```
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "max-w-[560px]",
  className,
}: ModalProps) {
  // ── SSR guard — only render portal client-side ───────────────────────────
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const modalRef = useRef<HTMLDivElement>(null);
  // Track the element that was focused before the modal opened
  const previousFocusRef = useRef<Element | null>(null);

  // ── Lock body scroll while open ──────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // ── Save / restore focus ─────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      // Defer so the modal has rendered before we try to focus it
      requestAnimationFrame(() => {
        const first = getFocusable(modalRef.current!)[0];
        first ? first.focus() : modalRef.current?.focus();
      });
    } else {
      // Restore focus to the element that opened the modal
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  // ── Escape key handler ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // ── Focus trap — cycle Tab through modal's focusable elements ───────────
  const handleTabKey = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !modalRef.current) return;
    const focusable = getFocusable(modalRef.current);
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      // Shift+Tab: if focus is on first element, wrap to last
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab: if focus is on last element, wrap to first
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  // ── Backdrop click: only close if the click is on the backdrop itself ────
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="modal-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[4px]"
          />

          {/* ── Centering shell (also the click-outside zone) ── */}
          <motion.div
            key="modal-shell"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
          >
            {/* ── Modal card ── */}
            <motion.div
              ref={modalRef}
              key="modal-card"
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? "modal-title" : undefined}
              aria-describedby={description ? "modal-description" : undefined}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              tabIndex={-1}
              onKeyDown={handleTabKey}
              className={cn(
                // Layout: full-width up to max-width, centered
                "relative w-full",
                maxWidth,
                // Visual: bg-primary, radius-xl (20px), shadow-lg
                "bg-[var(--bg-primary)]",
                "rounded-xl",
                "shadow-[var(--shadow-lg)]",
                "border border-[var(--border-default)]",
                // Spacing
                "p-6",
                // Prevent the centering shell's click handler from firing here
                "focus:outline-none",
                className,
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Close button — top-right ── */}
              <button
                type="button"
                aria-label="Close modal"
                onClick={onClose}
                className={cn(
                  "absolute right-4 top-4",
                  "flex h-8 w-8 items-center justify-center rounded-md",
                  "text-[var(--text-muted)]",
                  "hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)]",
                  "transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300",
                )}
              >
                <X size={18} aria-hidden="true" />
              </button>

              {/* ── Optional header ── */}
              {(title || description) && (
                <div className="mb-5 pr-8">
                  {title && (
                    <h2
                      id="modal-title"
                      className="text-lg font-semibold leading-tight text-[var(--text-primary)]"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p
                      id="modal-description"
                      className="mt-1 text-sm text-[var(--text-secondary)]"
                    >
                      {description}
                    </p>
                  )}
                </div>
              )}

              {/* ── Content ── */}
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
