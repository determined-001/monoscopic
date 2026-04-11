import type { Metadata } from "next";
import { SettingsLayout } from "@/components/settings/settings-layout";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Manage your Monoscope profile, connected wallets, notifications, and display preferences.",
};

export default function SettingsPage() {
  return (
    <div className="py-6">
      <div className="mb-6">
        <p className="text-[15px] font-semibold text-[var(--text-primary)]">
          Settings
        </p>
        <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
          Manage your profile, wallets, and preferences
        </p>
      </div>
      <SettingsLayout />
    </div>
  );
}
