import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alerts",
  description:
    "Set up whale and gas alerts and get notified the moment conditions are met.",
};

export default function AlertsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
