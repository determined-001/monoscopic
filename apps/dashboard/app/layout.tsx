import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { MonoscopeProviders } from "@/components/providers";

// ─── Fonts ────────────────────────────────────────────────────────────────────

/**
 * Inter — all body text, UI labels, navigation.
 * Loaded as a variable font; weight range 100–900 is available.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * JetBrains Mono — numbers, wallet addresses, financial data.
 * Variable font; weights 100–800 available.
 */
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: "Monoscope — Real-time whale alerts for Stellar",
    template: "%s | Monoscope",
  },
  description:
    "Real-time whale and flow analytics for the Stellar DEX and Soroban.",
};

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans antialiased">
        <MonoscopeProviders>{children}</MonoscopeProviders>
      </body>
    </html>
  );
}
