import type { Metadata } from "next";
import { DashboardClient } from "./_dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Live whale activity on the Stellar network.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
