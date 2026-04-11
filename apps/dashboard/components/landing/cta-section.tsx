"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export function CTASection() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    gsap.fromTo(el, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" } });
  }, []);

  return (
    <section className="relative overflow-hidden py-24 md:py-32" style={{ backgroundColor: "#0D0B14" }}>
      {/* Orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute rounded-full" style={{ width: "700px", height: "700px", bottom: "-200px", left: "50%", marginLeft: "-350px", background: "radial-gradient(circle, #836EF9 0%, transparent 70%)", animation: "orb-drift 8s ease-in-out infinite", opacity: 0.09 }} />
        <div className="absolute rounded-full" style={{ width: "400px", height: "400px", top: "-80px", right: "15%", background: "radial-gradient(circle, #38BDF8 0%, transparent 70%)", animation: "orb-drift 11s ease-in-out infinite reverse", opacity: 0.05 }} />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity: 0.025, backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />

      <div ref={contentRef} className="relative z-10 mx-auto max-w-[760px] px-6 text-center opacity-0">
        <h2 className={cn("font-bold text-white leading-[1.1] tracking-[-0.03em] mb-5", "text-[28px] md:text-[42px]")}>
          Stop watching from the sidelines.
        </h2>
        <p className={cn("leading-relaxed mb-10 mx-auto max-w-[480px]", "text-[16px] md:text-[18px]", "text-[var(--text-secondary)]")}>
          Open Monoscope and see what the whales are doing right now.
        </p>
        <div className="flex flex-col items-center gap-4">
          <Link href="/dashboard" className={cn("inline-flex items-center h-[52px] px-9 rounded-full", "text-white font-semibold text-[16px]", "transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.99]", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0B14]")} style={{ background: "linear-gradient(135deg, #836EF9 0%, #38BDF8 100%)", boxShadow: "0 0 40px rgba(131,110,249,0.45), 0 4px 20px rgba(0,0,0,0.4)" }}>
            Launch Monoscope
          </Link>
          <p className="text-[13px] text-[var(--text-muted)]">No sign-up required.</p>
        </div>
      </div>
    </section>
  );
}
