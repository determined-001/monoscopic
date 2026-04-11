"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

function MockupFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div aria-hidden="true" className="absolute inset-0 -z-10 scale-90 rounded-[24px]" style={{ background: "radial-gradient(ellipse, rgba(131,110,249,0.20) 0%, transparent 70%)", filter: "blur(32px)", transform: "scale(1.1) translateY(8px)" }} />
      <div className={cn("relative w-full overflow-hidden rounded-[16px]", "border border-white/[0.10] bg-[#13102B]", "shadow-[0_24px_64px_rgba(0,0,0,0.5)]")}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.07] bg-[#0F0D22]">
          <div className="flex gap-1.5">
            <div className="h-[9px] w-[9px] rounded-full bg-[#FF5F57]" />
            <div className="h-[9px] w-[9px] rounded-full bg-[#FFBD2E]" />
            <div className="h-[9px] w-[9px] rounded-full bg-[#28C840]" />
          </div>
          <div className="mx-auto flex h-5 w-[180px] items-center justify-center rounded-md bg-white/5">
            <span className="text-[10px] text-white/25 font-mono">app.monoscope.xyz</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function WhaleMockup() {
  return (
    <MockupFrame>
      <div className="p-4" style={{ minHeight: "300px" }}>
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-[12px] font-semibold text-white/70">Whale Activity</p>
          <span className="flex items-center gap-1.5 text-[10px] text-[#22C55E] font-medium">
            <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22C55E]" /></span>
            Live
          </span>
        </div>
        <div className="flex flex-col gap-1">
          {[
            { addr: "0x4a2b…f7c3", amount: "+2.1M MON", ago: "2m ago", color: "#22C55E" },
            { addr: "0x91c7…2e8d", amount: "-890K MON", ago: "4m ago", color: "#EF4444" },
            { addr: "0xf3d1…9b4c", amount: "+1.4M MON", ago: "7m ago", color: "#22C55E" },
            { addr: "0x22ae…3f71", amount: "+540K MON",  ago: "12m ago", color: "#22C55E" },
            { addr: "0xc81a…5d3e", amount: "-3.4M MON",  ago: "18m ago", color: "#EF4444" },
          ].map(({ addr, amount, ago, color }, i) => (
            <div key={i} className={cn("flex items-center gap-3 px-2 py-2.5 rounded-lg", i === 0 ? "bg-white/[0.05]" : "")}>
              <div><p className="font-mono text-[11px] text-white/60">{addr}</p><p className="text-[9px] text-white/25">{ago}</p></div>
              <span className="ml-auto text-[12px] font-bold font-mono" style={{ color }}>{amount}</span>
            </div>
          ))}
        </div>
      </div>
    </MockupFrame>
  );
}

function AlertMockup() {
  return (
    <MockupFrame>
      <div className="p-5" style={{ minHeight: "300px" }}>
        <div className="w-full rounded-xl border border-white/[0.10] bg-[#0F0D22] p-4 mb-3">
          <p className="text-[12px] font-semibold text-white mb-4">Create Alert</p>
          <div className="mb-3">
            <p className="text-[10px] text-white/40 mb-1.5">Type</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-center rounded-lg border border-purple-500/40 bg-purple-500/10 px-3 py-2"><span className="text-[11px] font-medium text-purple-400">Whale Move</span></div>
              <div className="flex items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2"><span className="text-[11px] text-white/40">Gas Spike</span></div>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-[10px] text-white/40 mb-1.5">Threshold</p>
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.04] px-3 py-2">
              <span className="text-[13px] font-mono font-medium text-white/80">&gt; 1,000,000 MON</span>
            </div>
          </div>
          <div className="h-9 w-full rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #836EF9 0%, #38BDF8 100%)" }}>
            <span className="text-[12px] font-semibold text-white">Create Alert</span>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[#22C55E]/25 bg-[#22C55E]/8 px-4 py-3">
          <div className="h-6 w-6 rounded-full bg-[#22C55E]/20 flex items-center justify-center shrink-0"><span className="text-[#22C55E] text-[12px] font-bold">✓</span></div>
          <div><p className="text-[11px] font-semibold text-[#22C55E]">Alert triggered!</p><p className="text-[10px] text-white/40">0x4a2b… moved 2.1M MON — 2s ago</p></div>
        </div>
      </div>
    </MockupFrame>
  );
}

function SdkMockup() {
  return (
    <MockupFrame>
      <div className="p-5" style={{ minHeight: "300px" }}>
        <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-3">Your application</p>
        <pre className="rounded-xl bg-[#0F0D22] border border-white/[0.08] p-4 text-[11px] leading-relaxed overflow-x-auto">
          <code>
            <span className="text-purple-400">import</span>
            <span className="text-white/80"> {"{ monoscope }"} </span>
            <span className="text-purple-400">from</span>
            <span className="text-[#22C55E]"> "@monoscope/sdk"</span>
            {"\n\n"}
            <span className="text-white/80">monoscope(</span>
            <span className="text-[#22C55E]">apiKey</span>
            <span className="text-white/80">, (event) ={">"} {"{"}</span>
            {"\n  "}
            <span className="text-purple-400">if</span>
            <span className="text-white/80"> (event.type === </span>
            <span className="text-[#22C55E]">"alert_triggered"</span>
            <span className="text-white/80">)</span>
            {"\n    "}
            <span className="text-white/50">// react instantly</span>
            {"\n"}
            <span className="text-white/80">{"}"});</span>
          </code>
        </pre>
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-purple-500/20 bg-purple-500/8 px-3 py-2.5">
          <span className="relative flex h-1.5 w-1.5 shrink-0"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-purple-400" /></span>
          <p className="text-[11px] text-purple-300 font-medium">Connected — receiving live alerts</p>
        </div>
      </div>
    </MockupFrame>
  );
}

const STEPS = [
  {
    number: "01",
    title: "Track the smart money",
    description: "Our indexer processes every Monad block in real time, tagging known whale wallets and labeled addresses. Watch their moves as they happen — transfers and contract interactions — updated every second.",
    imageLeft: true,
    mockup: <WhaleMockup />,
  },
  {
    number: "02",
    title: "Set alerts, never miss a move",
    description: "Configure custom alerts for large transfers, whale wallet activity, and gas events. Get notified the moment a condition is met — in-app or via webhook — so you act on information before the market prices it in.",
    imageLeft: false,
    mockup: <AlertMockup />,
  },
  {
    number: "03",
    title: "Build on top with the SDK",
    description: "Pipe alerts directly into your own applications. Our WebSocket SDK lets you build trading bots, Telegram bots, Discord notifications, or anything else — with an API key from your settings.",
    imageLeft: true,
    mockup: <SdkMockup />,
  },
];

function Step({ number, title, description, imageLeft, mockup }: typeof STEPS[number]) {
  const rowRef  = useRef<HTMLDivElement>(null);
  const imgRef  = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const tl = gsap.timeline({
      scrollTrigger: { trigger: row, start: "top 82%", toggleActions: "play none none none" },
    });
    tl.fromTo(imgRef.current,  { opacity: 0, x: imageLeft ? -50 : 50 }, { opacity: 1, x: 0, duration: 0.7, ease: "power3.out" })
      .fromTo(textRef.current, { opacity: 0, y: 24 },                    { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.45");
  }, [imageLeft]);

  const imgCol  = <div ref={imgRef}  className="w-full opacity-0">{mockup}</div>;
  const textCol = (
    <div ref={textRef} className="flex flex-col justify-center w-full opacity-0">
      <div className="relative mb-6">
        <span className="absolute -top-6 -left-1 select-none font-mono font-bold leading-none text-purple-500" style={{ fontSize: "80px", opacity: 0.08 }} aria-hidden="true">{number}</span>
        <h3 className={cn("relative font-bold text-[var(--text-primary)] leading-snug tracking-[-0.02em]", "text-[22px] md:text-[26px]")}>{title}</h3>
      </div>
      <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-relaxed max-w-[400px]">{description}</p>
    </div>
  );

  return (
    <div ref={rowRef} className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
      {imageLeft ? <>{imgCol}{textCol}</> : (
        <>
          <div className="md:hidden">{imgCol}</div>
          <div className="md:hidden">{textCol}</div>
          <div className="hidden md:block">{textCol}</div>
          <div className="hidden md:block">{imgCol}</div>
        </>
      )}
    </div>
  );
}

export function HowItWorks() {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    gsap.fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" } });
  }, []);

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-[1280px] px-6 md:px-8">
        <div ref={headerRef} className="flex flex-col items-center text-center mb-20 md:mb-24 opacity-0">
          <div className={cn("inline-flex items-center rounded-full px-4 py-1.5 mb-5", "bg-purple-500/10 border border-purple-500/20", "text-purple-400 text-[12px] font-semibold uppercase tracking-widest")}>
            How It Works
          </div>
          <h2 className={cn("font-bold text-[var(--text-primary)] leading-[1.12] tracking-[-0.02em]", "text-[28px] md:text-[38px]")}>
            From signal to action in seconds
          </h2>
        </div>
        <div className="flex flex-col gap-24 md:gap-32">
          {STEPS.map((step) => <Step key={step.number} {...step} />)}
        </div>
      </div>
    </section>
  );
}
