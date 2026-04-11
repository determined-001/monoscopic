"use client";

import { motion, type Easing } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Animation ────────────────────────────────────────────────────────────────

const EASE_OUT: Easing = [0.21, 0.47, 0.32, 0.98];

// ─── Milestone data ───────────────────────────────────────────────────────────

type Status = "live" | "in-progress" | "planned";

interface Milestone {
  phase: string;
  label: string;
  title: string;
  status: Status;
  when: string;
  items: readonly string[];
}

const MILESTONES: Milestone[] = [
  {
    phase: "Phase 1",
    label: "Live",
    title: "Core Platform",
    status: "live",
    when: "Launched",
    items: [
      "Real-time whale transaction tracking",
      "Custom whale & gas alerts",
      "SDK for programmatic alert access",
      "API key management",
    ],
  },
  {
    phase: "Phase 2",
    label: "In Progress",
    title: "Intelligence Layer",
    status: "in-progress",
    when: "Now",
    items: [
      "Telegram & Discord notifications",
      "Advanced whale wallet tagging & labeling",
      "Whale address watchlists",
      "Alert history & analytics",
    ],
  },
  {
    phase: "Phase 3",
    label: "Q3 2026",
    title: "Power Tools",
    status: "planned",
    when: "Q3 2026",
    items: [
      "Public REST API access",
      "Webhook delivery for alerts",
      "Multi-chain support",
      "iOS & Android mobile app",
    ],
  },
  {
    phase: "Phase 4",
    label: "Q4 2026",
    title: "Social & Governance",
    status: "planned",
    when: "Q4 2026",
    items: [
      "Community leaderboards & performance rankings",
      "On-chain reputation scores",
      "DAO voting integration",
      "Social trading — follow & copy top wallets",
    ],
  },
];

// ─── Status dot ──────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: Status }) {
  if (status === "live") {
    return (
      <span className="relative flex h-3 w-3">
        <span className="relative inline-flex h-3 w-3 rounded-full bg-[#22C55E]" />
      </span>
    );
  }

  if (status === "in-progress") {
    return (
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-60" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-purple-500" />
      </span>
    );
  }

  // planned
  return (
    <span className="relative flex h-3 w-3">
      <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--border-default)]" />
    </span>
  );
}

// ─── Status color for overline ────────────────────────────────────────────────

const STATUS_COLOR: Record<Status, string> = {
  live: "text-[#22C55E]",
  "in-progress": "text-purple-400",
  planned: "text-[var(--text-muted)]",
};

// ─── Timeline connector dot (center line) ────────────────────────────────────

function ConnectorDot({ status }: { status: Status }) {
  const bg: Record<Status, string> = {
    live: "bg-[#22C55E] shadow-[0_0_12px_rgba(34,197,94,0.6)]",
    "in-progress": "bg-purple-500 shadow-[0_0_12px_rgba(131,110,249,0.6)]",
    planned: "bg-[var(--bg-tertiary)] border border-[var(--border-default)]",
  };

  return (
    <div className="relative flex items-center justify-center">
      {status === "in-progress" && (
        <span className="absolute h-6 w-6 animate-ping rounded-full bg-purple-400 opacity-25" />
      )}
      <div
        className={cn(
          "relative h-4 w-4 rounded-full shrink-0 z-10",
          bg[status],
        )}
      />
    </div>
  );
}

// ─── Milestone card ───────────────────────────────────────────────────────────

function MilestoneCard({ milestone }: { milestone: Milestone }) {
  const { phase, label, title, status, items } = milestone;

  return (
    <div
      className={cn(
        "p-5 rounded-[14px]",
        "bg-[var(--bg-secondary)]",
        "border border-[var(--border-default)]",
        status === "in-progress" && "border-purple-500/30",
        status === "live" && "border-[#22C55E]/20",
      )}
    >
      {/* Overline row */}
      <div className="flex items-center gap-2 mb-3">
        <StatusDot status={status} />
        <p
          className={cn(
            "text-[11px] font-semibold uppercase tracking-widest",
            STATUS_COLOR[status],
          )}
        >
          {phase} · {label}
        </p>
      </div>

      {/* Title */}
      <h3 className="text-[18px] font-semibold text-[var(--text-primary)] mb-3 leading-snug">
        {title}
      </h3>

      {/* Items */}
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <span
              className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full"
              style={{
                backgroundColor:
                  status === "live"
                    ? "#22C55E"
                    : status === "in-progress"
                      ? "#836EF9"
                      : "var(--text-muted)",
              }}
              aria-hidden="true"
            />
            <span className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Roadmap ──────────────────────────────────────────────────────────────────

export function Roadmap() {
  return (
    <section id="roadmap" className="py-24 md:py-32 bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-[1280px] px-6 md:px-8">
        {/* Header */}
        <motion.div
          className="flex flex-col items-center text-center mb-16 md:mb-20"
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
            Roadmap
          </div>
          <h2
            className={cn(
              "font-bold text-[var(--text-primary)] leading-[1.12] tracking-[-0.02em]",
              "text-[28px] md:text-[36px] mb-4",
            )}
          >
            What&apos;s next for Monoscope
          </h2>
          <p className="text-[16px] text-[var(--text-secondary)]">
            We ship fast. Here&apos;s what&apos;s on deck.
          </p>
        </motion.div>

        {/* ── Mobile: left-aligned list ── */}
        <div className="flex flex-col gap-6 md:hidden">
          {MILESTONES.map((milestone, i) => (
            <motion.div
              key={milestone.phase}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: EASE_OUT }}
            >
              <MilestoneCard milestone={milestone} />
            </motion.div>
          ))}
        </div>

        {/* ── Desktop: centered timeline ── */}
        <div className="hidden md:block relative">
          {/* Center vertical line */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-[var(--border-default)]"
          />

          <div className="flex flex-col gap-16">
            {MILESTONES.map((milestone, i) => {
              const isLeft = i % 2 === 0; // even → card LEFT, connector right
              const fromX = isLeft ? -40 : 40;

              return (
                <div
                  key={milestone.phase}
                  className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-8"
                >
                  {/* Left slot */}
                  {isLeft ? (
                    <motion.div
                      initial={{ opacity: 0, x: fromX }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.55, ease: EASE_OUT }}
                    >
                      <MilestoneCard milestone={milestone} />
                    </motion.div>
                  ) : (
                    /* When card is on right, show "when" label on the left */
                    <motion.div
                      className="flex justify-end"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.4,
                        delay: 0.15,
                        ease: EASE_OUT,
                      }}
                    >
                      <span className="text-[13px] font-medium text-[var(--text-muted)]">
                        {milestone.when}
                      </span>
                    </motion.div>
                  )}

                  {/* Center connector dot */}
                  <ConnectorDot status={milestone.status} />

                  {/* Right slot */}
                  {!isLeft ? (
                    <motion.div
                      initial={{ opacity: 0, x: fromX }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.55, ease: EASE_OUT }}
                    >
                      <MilestoneCard milestone={milestone} />
                    </motion.div>
                  ) : (
                    /* When card is on left, show "when" label on the right */
                    <motion.div
                      className="flex justify-start"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.4,
                        delay: 0.15,
                        ease: EASE_OUT,
                      }}
                    >
                      <span className="text-[13px] font-medium text-[var(--text-muted)]">
                        {milestone.when}
                      </span>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
