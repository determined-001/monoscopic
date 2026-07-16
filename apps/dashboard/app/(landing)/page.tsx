import type { Metadata } from "next";
import { Hero } from "@/components/landing/hero";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Roadmap } from "@/components/landing/roadmap";
import { CTASection } from "@/components/landing/cta-section";

export const metadata: Metadata = {
  title: "Monoscope — Real-time whale alerts for Stellar",
  description:
    "Live whale and flow analytics for the Stellar DEX and Soroban, streamed from Horizon.",
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <FeaturesGrid />
      <HowItWorks />
      <Roadmap />
      <CTASection />
    </>
  );
}
