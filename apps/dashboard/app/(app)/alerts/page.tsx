"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AlertsSummary } from "@/components/alerts/alerts-summary";
import { AlertsList } from "@/components/alerts/alerts-list";
import { CreateAlertModal } from "@/components/alerts/create-alert-modal";
import { cn } from "@/lib/utils";

export default function AlertsPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-5 py-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[15px] font-semibold text-[var(--text-primary)]">
            Alerts
          </p>
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
            Get notified when whale or gas conditions are met
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className={cn(
            "shrink-0 flex items-center gap-2 h-9 px-4 rounded-lg",
            "text-[13px] font-semibold text-white",
            "bg-purple-500 hover:bg-purple-600",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400",
          )}
        >
          <Plus size={15} aria-hidden="true" />
          Create Alert
        </button>
      </div>

      {/* Stat cards */}
      <AlertsSummary />

      {/* Alert list */}
      <div>
        <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">
          Your Alerts
        </p>
        <AlertsList />
      </div>

      {/* Modal */}
      <CreateAlertModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
