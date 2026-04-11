"use client";

import { useEffect, useRef } from "react";
import { Fish, Bell, Zap, Code2, Activity, Eye } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: Fish,
    title: "Whale Tracking",
    description: "Monitor every significant transaction on Monad the moment it lands. Know what the biggest wallets are doing before the crowd reacts.",
  },
  {
    icon: Bell,
    title: "Custom Alerts",
    description: "Set whale movement triggers and gas threshold events. Get notified instantly — in-app or via webhook to your own server.",
  },
  {
    icon: Zap,
    title: "Sub-Second Data",
    description: "Powered by Monad's parallel EVM, our pipeline ingests every block in under 200ms. Real-time means real-time.",
  },
  {
    icon: Activity,
    title: "Live Network Feed",
    description: "Block-by-block network stats — TPS, gas load, transaction counts, and unique wallets — updated every second.",
  },
  {
    icon: Eye,
    title: "Follow Any Wallet",
    description: "Add any Monad address to your watchlist. Get a dedicated alert stream for every move they make on-chain.",
  },
  {
    icon: Code2,
    title: "Developer SDK",
    description: "Pipe alerts into your own applications. Our WebSocket SDK lets you build trading bots, notification systems, and dashboards on top of Monoscope.",
  },
] as const;

function SectionHeader() {
  return (
    <div className="flex flex-col items-center text-center mb-16">
      <div className={cn("inline-flex items-center rounded-full px-4 py-1.5 mb-5", "bg-purple-500/10 border border-purple-500/20", "text-purple-400 text-[12px] font-semibold uppercase tracking-widest")}>
        Features
      </div>
      <h2 className={cn("font-bold text-[var(--text-primary)] leading-[1.12] tracking-[-0.02em]", "text-[28px] md:text-[36px]", "max-w-[600px] mb-4")}>
        Intelligence that actually moves the needle
      </h2>
      <p className="text-[16px] text-[var(--text-secondary)] max-w-[480px] leading-relaxed">
        Monoscope surfaces what matters — whale intent, network conditions, and your own alerts — so you react faster than the market.
      </p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, index }: { icon: React.ElementType; title: string; description: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        duration: 0.6,
        ease: "power3.out",
        delay: (index % 3) * 0.08,
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      }
    );
  }, [index]);

  return (
    <div ref={ref} className={cn("group flex flex-col gap-5 p-6 md:p-7", "bg-[var(--bg-primary)]", "border border-[var(--border-default)]", "rounded-[14px] shadow-[var(--shadow-sm)]", "hover:border-[var(--border-active)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5", "transition-all duration-200 ease-out cursor-default opacity-0")}>
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl shrink-0", "bg-purple-50 dark:bg-purple-900/40", "border border-purple-100 dark:border-purple-800/50", "group-hover:bg-purple-100 dark:group-hover:bg-purple-900/60", "transition-colors duration-200")}>
        <Icon size={22} className="text-purple-500" aria-hidden="true" strokeWidth={1.75} />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-[16px] font-semibold text-[var(--text-primary)] leading-snug">{title}</h3>
        <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function FeaturesGrid() {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" } }
    );
  }, []);

  return (
    <section id="features" className={cn("border-y border-[var(--border-default)]", "bg-[var(--bg-secondary)]", "py-20 md:py-28")}>
      <div className="mx-auto max-w-[1280px] px-6 md:px-8">
        <div ref={headerRef} className="opacity-0"><SectionHeader /></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {FEATURES.map(({ icon, title, description }, i) => (
            <FeatureCard key={title} icon={icon} title={title} description={description} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
