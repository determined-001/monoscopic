"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, type Easing } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Data ─────────────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote:
      "The whale alert dashboard completely changed how I trade on Monad. I used to find out about big moves an hour late — now I'm watching $4M buys happen in real time and positioning before the retail crowd reacts. Nothing else gives me this edge.",
    name: "Alex Mercer",
    handle: "@alexmercer_eth",
    color: { h1: 264, h2: 220, h3: 300 },
  },
  {
    quote:
      "The alert system is unreal. I set a threshold for any wallet moving over 500 MON and within the first hour I had three alerts. By the time I checked Twitter, the news was already old. Monoscope had it first.",
    name: "Sarah Chen",
    handle: "@sarahc_defi",
    color: { h1: 168, h2: 200, h3: 150 },
  },
  {
    quote:
      "I was skeptical of another dashboard but the sub-second data speed sold me. Monad moves fast and every other tool felt like it was showing me yesterday's news. Monoscope keeps up. The token explorer depth is also genuinely impressive.",
    name: "Marcus Webb",
    handle: "@marcuswebb",
    color: { h1: 30, h2: 50, h3: 20 },
  },
  {
    quote:
      "Set up a custom alert for when any wallet over 10 MON enters a new token I'm watching. Got pinged at 3am, woke up, and caught a 40% move before London open. The webhook integration with my Telegram made it seamless.",
    name: "Priya Nair",
    handle: "@priyanair_on",
    color: { h1: 320, h2: 280, h3: 350 },
  },
  {
    quote:
      "Integrated the SDK in about ten minutes. My bot now reacts to whale alerts in real time — no polling, no lag. The API key setup was painless and the WebSocket events are clean. Exactly what I needed.",
    name: "Jordan Park",
    handle: "@jordan_onchain",
    color: { h1: 195, h2: 220, h3: 175 },
  },
] as const;

// ─── Animation ────────────────────────────────────────────────────────────────

const EASE_OUT: Easing = [0.21, 0.47, 0.32, 0.98];

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  color,
  name,
}: {
  color: { h1: number; h2: number; h3: number };
  name: string;
}) {
  return (
    <div
      aria-hidden="true"
      className="h-10 w-10 shrink-0 rounded-full ring-2 ring-[var(--border-default)]"
      style={{
        background: `conic-gradient(from 0deg,
          hsl(${color.h1},70%,58%),
          hsl(${color.h2},65%,52%),
          hsl(${color.h3},70%,56%),
          hsl(${color.h1},70%,58%))`,
      }}
      title={name}
    />
  );
}

// ─── Single card ──────────────────────────────────────────────────────────────

interface CardProps {
  quote: string;
  name: string;
  handle: string;
  color: { h1: number; h2: number; h3: number };
}

function TestimonialCard({ quote, name, handle, color }: CardProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-full p-6 rounded-[14px]",
        "bg-[var(--bg-primary)]",
        "border border-[var(--border-default)]",
      )}
    >
      {/* Decorative open-quote */}
      <p
        className="font-mono font-bold leading-none text-purple-300 select-none mb-2"
        style={{ fontSize: "48px", lineHeight: "1" }}
        aria-hidden="true"
      >
        &ldquo;
      </p>

      {/* Quote */}
      <p className="flex-1 text-[15px] italic leading-relaxed text-[var(--text-secondary)] mb-6">
        {quote}
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <Avatar color={color} name={name} />
        <div>
          <p className="text-[14px] font-semibold text-[var(--text-primary)] leading-snug">
            {name}
          </p>
          <p className="text-[13px] text-[var(--text-muted)]">{handle}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Nav arrow ────────────────────────────────────────────────────────────────

function NavArrow({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={
        direction === "left" ? "Previous testimonials" : "Next testimonials"
      }
      className={cn(
        "hidden lg:flex items-center justify-center h-10 w-10 rounded-full shrink-0",
        "border border-[var(--border-default)]",
        "bg-[var(--bg-primary)]",
        "text-[var(--text-muted)]",
        "hover:border-[var(--border-active)] hover:text-purple-500",
        "transition-colors duration-150",
      )}
    >
      {direction === "left" ? (
        <ChevronLeft size={18} aria-hidden="true" />
      ) : (
        <ChevronRight size={18} aria-hidden="true" />
      )}
    </button>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TOTAL = TESTIMONIALS.length; // 5
const DESKTOP_VISIBLE = 3;

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState<1 | -1>(1); // animation direction
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback((delta: 1 | -1) => {
    setDir(delta);
    setCurrent((prev) => (prev + delta + TOTAL) % TOTAL);
  }, []);

  // Auto-advance every 5s
  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(() => advance(1), 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, advance]);

  // Desktop indices — 3 cards starting at `current`, wrapping
  const desktopIndices = [
    current % TOTAL,
    (current + 1) % TOTAL,
    (current + 2) % TOTAL,
  ];

  // Desktop can only start at indices 0,1,2 meaningfully (5-3=2 extra)
  const canGoLeft = true; // always wrap
  const canGoRight = true;

  return (
    <section className="py-20 md:py-28 border-y border-[var(--border-default)] bg-[var(--bg-secondary)]">
      <div className="mx-auto max-w-[1280px] px-6 md:px-8">
        {/* Header */}
        <motion.div
          className="flex flex-col items-center text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        >
          <div
            className={cn(
              "inline-flex items-center rounded-full px-4 py-1.5 mb-5",
              "bg-purple-500/10 border border-purple-500/20",
              "text-purple-400 text-[12px] font-semibold uppercase tracking-widest",
            )}
          >
            Community
          </div>
          <h2
            className={cn(
              "font-bold text-[var(--text-primary)] leading-[1.12] tracking-[-0.02em]",
              "text-[28px] md:text-[36px]",
            )}
          >
            What traders are saying
          </h2>
        </motion.div>

        {/* Carousel + arrows */}
        <div
          className="flex items-center gap-4"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <NavArrow direction="left" onClick={() => advance(-1)} />

          {/* ── Desktop: 3 cards ── */}
          <div className="hidden md:grid flex-1 grid-cols-3 gap-5 min-h-[280px]">
            <AnimatePresence mode="popLayout" initial={false}>
              {desktopIndices.map((idx, slot) => (
                <motion.div
                  key={`${idx}-${slot}`}
                  initial={{ opacity: 0, x: dir * 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -30 }}
                  transition={{
                    duration: 0.35,
                    ease: EASE_OUT,
                    delay: slot * 0.05,
                  }}
                  className="h-full"
                >
                  <TestimonialCard {...TESTIMONIALS[idx]} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ── Mobile: 1 card ── */}
          <div className="md:hidden flex-1 min-h-[260px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current}
                initial={{ opacity: 0, x: dir * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -40 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
                className="h-full"
              >
                <TestimonialCard {...TESTIMONIALS[current]} />
              </motion.div>
            </AnimatePresence>
          </div>

          <NavArrow direction="right" onClick={() => advance(1)} />
        </div>

        {/* Dot navigation */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {TESTIMONIALS.map((_, i) => {
            // On desktop: dot is "active" if i is one of the 3 visible indices
            const desktopActive = desktopIndices.includes(i);
            // On mobile: dot is active if i === current
            return (
              <button
                key={i}
                onClick={() => {
                  setDir(i > current ? 1 : -1);
                  setCurrent(i);
                }}
                aria-label={`Go to testimonial ${i + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  // Mobile active
                  "md:hidden",
                  i === current
                    ? "w-5 bg-purple-500"
                    : "w-2 bg-[var(--bg-tertiary)]",
                )}
              />
            );
          })}
          {/* Desktop dots — separate so we can use desktopActive */}
          {TESTIMONIALS.map((_, i) => (
            <button
              key={`d-${i}`}
              onClick={() => {
                setDir(i > current ? 1 : -1);
                setCurrent(i);
              }}
              aria-label={`Go to testimonial set ${i + 1}`}
              className={cn(
                "hidden md:block h-2 rounded-full transition-all duration-300",
                desktopIndices.includes(i)
                  ? "w-5 bg-purple-500"
                  : "w-2 bg-[var(--bg-tertiary)]",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
