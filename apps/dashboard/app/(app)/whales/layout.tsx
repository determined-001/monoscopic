import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Whale Activity",
  description:
    "Track large wallet movements and DEX activity on Stellar in real time.",
};

export default function WhalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
