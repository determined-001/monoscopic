"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: 12000,  suffix: "+", label: "Active traders",           display: "12,000+" },
  { value: 45,     suffix: "M+",label: "On-chain events indexed",  display: "45M+" },
  { value: 890000, suffix: "+", label: "Alerts delivered",         display: "890K+" },
  { value: 200,    suffix: "ms",label: "Block ingestion latency",  display: "200ms" },
] as const;

function StatItem({ value, suffix, label, display }: typeof STATS[number]) {
  const spanRef    = useRef<HTMLSpanElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el    = spanRef.current;
    const wrap  = wrapperRef.current;
    if (!el || !wrap) return;

    // Animate the number from 0 to value when scrolled into view
    const isMs = suffix === "ms";
    const isM  = suffix === "M+";

    const counter = { n: 0 };
    gsap.fromTo(counter, { n: 0 }, {
      n: value,
      duration: 1.4,
      ease: "power2.out",
      scrollTrigger: { trigger: wrap, start: "top 85%", toggleActions: "play none none none" },
      onUpdate() {
        const v = Math.round(counter.n);
        if (isMs)       el.textContent = `${v}ms`;
        else if (isM)   el.textContent = `${v.toFixed(0)}M+`;
        else if (v >= 1000) el.textContent = `${v.toLocaleString("en-US")}+`;
        else            el.textContent = `${v}${suffix}`;
      },
    });

    gsap.fromTo(wrap, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", scrollTrigger: { trigger: wrap, start: "top 85%", toggleActions: "play none none none" } });
  }, [value, suffix]);

  return (
    <div ref={wrapperRef} className="flex flex-col items-center text-center opacity-0">
      <p className={cn("font-mono font-bold text-white leading-none mb-2.5", "text-[32px] sm:text-[40px]")}>
        <span ref={spanRef}>{display}</span>
      </p>
      <p className="text-[14px] font-medium text-white/70 leading-snug max-w-[140px]">{label}</p>
    </div>
  );
}

export function StatsBand() {
  return (
    <section className="py-16 md:py-20" style={{ background: "linear-gradient(135deg, #836EF9 0%, #38BDF8 100%)" }}>
      <div className="mx-auto max-w-[1280px] px-6 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {STATS.map((s) => <StatItem key={s.label} {...s} />)}
        </div>
      </div>
    </section>
  );
}
