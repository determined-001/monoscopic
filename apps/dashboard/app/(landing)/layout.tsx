import { LandingNavbar } from "@/components/landing/landing-navbar";
import { Footer } from "@/components/landing/footer";

/**
 * Layout for the public landing route group.
 *
 * Uses the landing-specific navbar (transparent→solid on scroll) and footer.
 * No app navbar, no mobile tab bar — this is the marketing shell.
 *
 * The main content area has no top padding so hero sections can bleed
 * behind the transparent navbar. Each section is responsible for its own
 * spacing (typically pt-[72px] or a full-bleed hero with its own top padding).
 */
export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LandingNavbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
