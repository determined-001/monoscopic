import type { Metadata } from "next";
import { DashboardClient } from "./_dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Live whale activity and network stats on Monad.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
