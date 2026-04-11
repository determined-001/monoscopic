import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Whale Activity",
  description:
    "Track large wallet movements and institutional trading activity on Monad in real time.",
};

export default function WhalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
