import type { Metadata } from "next";
import { Hero } from "@/components/landing/hero";
import { TrustBar } from "@/components/landing/trust-bar";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { HowItWorks } from "@/components/landing/how-it-works";
import { StatsBand } from "@/components/landing/stats-band";
import { Testimonials } from "@/components/landing/testimonials";
import { Roadmap } from "@/components/landing/roadmap";
import { CTASection } from "@/components/landing/cta-section";

export const metadata: Metadata = {
  title: "Monoscope — On-chain Intelligence for Monad",
  description:
    "Real-time whale tracking and custom alerts for the Monad ecosystem.",
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <div id="ecosystem">
        <TrustBar />
      </div>
      <FeaturesGrid />
      <HowItWorks />
      <StatsBand />
      <Testimonials />
      <Roadmap />
      <CTASection />
    </>
  );
}
