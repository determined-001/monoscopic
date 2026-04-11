"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function MonadHexIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <polygon points="8,1.5 13.5,4.75 13.5,11.25 8,14.5 2.5,11.25 2.5,4.75" fill="none" stroke="#9370FF" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="2" fill="#9370FF" />
    </svg>
  );
}

const AVATAR_COLORS = [
  { h1: 264, h2: 220, h3: 300 },
  { h1: 180, h2: 210, h3: 160 },
  { h1: 30,  h2: 50,  h3: 20  },
  { h1: 320, h2: 280, h3: 350 },
  { h1: 120, h2: 150, h3: 100 },
];

export function Hero() {
  const sectionRef  = useRef<HTMLElement>(null);
  const badgeRef    = useRef<HTMLDivElement>(null);
  const line1Ref    = useRef<HTMLSpanElement>(null);
  const line2Ref    = useRef<HTMLSpanElement>(null);
  const subRef      = useRef<HTMLParagraphElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);
  const socialRef   = useRef<HTMLDivElement>(null);
  const mockupRef   = useRef<HTMLDivElement>(null);
  const scrollRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(badgeRef.current,  { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 })
        .fromTo(line1Ref.current,  { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.3")
        .fromTo(line2Ref.current,  { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
        .fromTo(subRef.current,    { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
        .fromTo(ctaRef.current,    { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
        .fromTo(socialRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.3")
        .fromTo(mockupRef.current, { opacity: 0, y: 60, rotateX: 8 }, { opacity: 1, y: 0, rotateX: 4, duration: 1.0, ease: "power2.out" }, "-=0.3")
        .fromTo(scrollRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 }, "-=0.2");
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  function scrollDown() {
    window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
  }

  return (
    <section ref={sectionRef} className="relative flex min-h-screen flex-col items-center overflow-hidden" style={{ backgroundColor: "#0D0B14" }}>
      {/* Background orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute rounded-full" style={{ width: "900px", height: "900px", top: "-200px", left: "50%", marginLeft: "-450px", background: "radial-gradient(circle, #836EF9 0%, transparent 70%)", animation: "orb-drift 8s ease-in-out infinite", opacity: 0.08 }} />
        <div className="absolute rounded-full" style={{ width: "600px", height: "600px", top: "30%", left: "65%", background: "radial-gradient(circle, #38BDF8 0%, transparent 70%)", animation: "orb-drift 11s ease-in-out infinite reverse", opacity: 0.05 }} />
      </div>

      {/* Grid */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity: 0.03, backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pt-[72px] pb-20 w-full max-w-[1280px] mx-auto">
        {/* Badge */}
        <div ref={badgeRef} className="mb-8 opacity-0">
          <div className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2", "bg-[#16132A] border border-[#2A2545]", "text-purple-400 text-[13px] font-medium")}>
            <MonadHexIcon />
            Built for Monad
          </div>
        </div>

        {/* Headline */}
        <div className="mb-6 text-center">
          <h1 className="font-bold leading-[1.08] tracking-[-0.03em]">
            <span ref={line1Ref} className="block text-white text-[36px] sm:text-[48px] md:text-[60px] lg:text-[72px] opacity-0">
              See everything.
            </span>
            <span ref={line2Ref} className={cn("block opacity-0", "text-[36px] sm:text-[48px] md:text-[60px] lg:text-[72px]", "bg-clip-text text-transparent", "bg-gradient-to-r from-purple-400 via-purple-300 to-sky-300")}>
              Miss nothing.
            </span>
          </h1>
        </div>

        {/* Sub */}
        <p ref={subRef} className={cn("text-center max-w-[560px] opacity-0", "text-[16px] md:text-[18px] leading-relaxed", "text-[#9490A8]", "mb-10")}>
          Whale intelligence, real-time alerts, and on-chain signals — all in one place for the Monad ecosystem.
        </p>

        {/* CTA */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center gap-3 mb-10 opacity-0">
          <Link href="/dashboard" className={cn("flex items-center gap-2.5 h-[52px] px-7 rounded-full", "text-white font-semibold text-[15px]", "transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.99]", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300")} style={{ background: "linear-gradient(135deg, #836EF9 0%, #38BDF8 100%)", boxShadow: "0 0 32px rgba(131,110,249,0.40), 0 4px 16px rgba(0,0,0,0.3)" }}>
            Open Dashboard
          </Link>
          <Link href="/whales" className={cn("flex items-center gap-2.5 h-[52px] px-7 rounded-full", "text-white font-semibold text-[15px]", "border border-white/25 bg-white/5", "hover:bg-white/10 hover:border-white/40 transition-all duration-200")}>
            Track Whales
          </Link>
        </div>

        {/* Social proof */}
        <div ref={socialRef} className="mb-20 md:mb-24 opacity-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              {AVATAR_COLORS.map(({ h1, h2, h3 }, i) => (
                <div key={i} aria-hidden="true" className="h-7 w-7 rounded-full ring-2 ring-[#0D0B14] shrink-0" style={{ marginLeft: i === 0 ? 0 : "-8px", zIndex: AVATAR_COLORS.length - i, background: `conic-gradient(from 0deg, hsl(${h1},70%,58%), hsl(${h2},65%,52%), hsl(${h3},70%,56%), hsl(${h1},70%,58%))` }} />
              ))}
            </div>
            <p className="text-[13px] font-medium text-[#5E5A72]">
              Trusted by <span className="text-[#9490A8] font-semibold">12,000+</span> traders on Monad
            </p>
          </div>
        </div>

        {/* Browser mockup */}
        <div ref={mockupRef} className="relative w-full max-w-[1100px] mx-auto opacity-0" style={{ transformStyle: "preserve-3d" }}>
          <div aria-hidden="true" className="absolute inset-0 -z-10 mx-auto w-[60%] rounded-full" style={{ height: "200px", top: "30%", background: "radial-gradient(ellipse, rgba(131,110,249,0.25) 0%, transparent 70%)", filter: "blur(40px)" }} />
          <div className={cn("relative w-full overflow-hidden rounded-[16px]", "border border-white/10", "shadow-[0_32px_80px_rgba(0,0,0,0.6)]", "bg-[#13102B]")} style={{ transform: "perspective(1200px) rotateX(4deg)", transformOrigin: "center bottom" }}>
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.07] bg-[#0F0D22]">
              <div className="flex items-center gap-1.5">
                <div className="h-[10px] w-[10px] rounded-full bg-[#FF5F57]" />
                <div className="h-[10px] w-[10px] rounded-full bg-[#FFBD2E]" />
                <div className="h-[10px] w-[10px] rounded-full bg-[#28C840]" />
              </div>
              <div className="mx-auto flex h-6 w-[240px] items-center justify-center rounded-md bg-white/5 px-3">
                <span className="text-[11px] text-white/30 font-mono">app.monoscope.xyz/dashboard</span>
              </div>
            </div>
            {/* Dashboard preview */}
            <div className="relative p-4 md:p-6" style={{ minHeight: "420px" }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                  { label: "Latest Block", value: "#7,284,193", sub: "42 txns", color: "#836EF9" },
                  { label: "TPS",          value: "4,218",      sub: "tx/sec",  color: "#22C55E" },
                  { label: "Gas Load",     value: "Moderate",   sub: "58% used",color: "#FBBF24" },
                  { label: "Whale Moves",  value: "1,284",      sub: "today",   color: "#38BDF8" },
                ].map(({ label, value, sub, color }) => (
                  <div key={label} className="rounded-xl bg-[#16132A] border border-white/[0.06] p-3 md:p-4">
                    <p className="text-[10px] md:text-[11px] text-[#5E5A72] font-medium mb-1.5">{label}</p>
                    <p className="text-[15px] md:text-[18px] font-bold leading-none" style={{ color }}>{value}</p>
                    <p className="text-[10px] md:text-[11px] mt-1.5 font-medium text-white/30">{sub}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 md:gap-4">
                <div className="flex-1 rounded-xl bg-[#16132A] border border-white/[0.06] p-4" style={{ minHeight: "220px" }}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[12px] font-semibold text-white/70">Live Whale Activity</p>
                    <span className="flex items-center gap-1.5 text-[10px] text-[#22C55E] font-medium">
                      <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22C55E]" /></span>
                      Live
                    </span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {[
                      { addr: "0x4a2b…f7c3", amount: "2.1M MON", ago: "2m ago", color: "#22C55E" },
                      { addr: "0x91c7…2e8d", amount: "890K MON", ago: "5m ago", color: "#EF4444" },
                      { addr: "0xf3d1…9b4c", amount: "1.4M MON", ago: "9m ago", color: "#22C55E" },
                    ].map(({ addr, amount, ago, color }, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-white/[0.05] last:border-0">
                        <div className="h-7 w-7 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0"><span className="text-[10px] text-purple-400">⬡</span></div>
                        <div className="flex-1 min-w-0"><p className="font-mono text-[11px] text-white/60">{addr}</p><p className="text-[9px] text-white/25">{ago}</p></div>
                        <span className="text-[12px] font-bold font-mono" style={{ color }}>{amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="hidden md:flex flex-col w-[200px] shrink-0 rounded-xl bg-[#16132A] border border-white/[0.06] p-4">
                  <p className="text-[12px] font-semibold text-white/70 mb-3">Active Alerts</p>
                  {[
                    { name: "Whale >1M MON", status: "Active", color: "#22C55E" },
                    { name: "Gas > 80%",     status: "Triggered", color: "#FBBF24" },
                    { name: "0x4a2b wallet", status: "Active", color: "#22C55E" },
                  ].map(({ name, status, color }, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0">
                      <p className="text-[11px] text-white/60 truncate flex-1 mr-2">{name}</p>
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ color, backgroundColor: `${color}18` }}>{status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div ref={scrollRef} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 cursor-pointer opacity-0" onClick={scrollDown} role="button" aria-label="Scroll down" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") scrollDown(); }}>
        <span className="text-[11px] font-medium uppercase tracking-widest text-[#5E5A72]">Scroll</span>
        <ChevronDown size={18} className="text-[#5E5A72]" aria-hidden="true" style={{ animation: "bounce-y 2s ease-in-out infinite" }} />
      </div>
    </section>
  );
}
