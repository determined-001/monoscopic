"use client";

import { useState } from "react";
import {
  Pencil,
  Trash2,
  Users,
  Fuel,
  Clock,
  Bell,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAlerts, type Alert, type AlertCondition } from "@/lib/hooks/useAlerts";

// ─── Type config ───────────────────────────────────────────────────────────────

type DisplayType = "whale" | "gas";

const TYPE_CONFIG: Record<
  DisplayType,
  { color: string; bg: string; icon: React.ReactNode; label: string }
> = {
  whale: {
    color: "#836EF9",
    bg: "rgba(131,110,249,0.1)",
    icon: <Users size={11} />,
    label: "Whale Alert",
  },
  gas: {
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
    icon: <Fuel size={11} />,
    label: "Gas Alert",
  },
};

const CONDITION_OPTIONS: { value: AlertCondition; label: string }[] = [
  { value: "above", label: "rises above" },
  { value: "below", label: "drops below" },
  { value: "crosses", label: "crosses" },
  { value: "drops", label: "drops" },
];

const INPUT_CLS = [
  "w-full h-9 rounded-lg px-3 text-[13px]",
  "bg-[var(--bg-tertiary)] border border-[var(--border-default)]",
  "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
  "focus:outline-none focus:border-[var(--border-active)]",
  "transition-colors duration-150",
].join(" ");

// ─── Edit Alert Modal ──────────────────────────────────────────────────────────

function EditAlertModal({
  alert,
  onSave,
  onClose,
}: {
  alert: Alert;
  onSave: (patch: { name: string; condition: AlertCondition; threshold: number }) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(alert.name);
  const [condition, setCondition] = useState<AlertCondition>(alert.condition);
  const [threshold, setThreshold] = useState(String(alert.threshold));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    const parsed = parseFloat(threshold);
    if (!name.trim()) { setError("Name is required."); return; }
    if (isNaN(parsed)) { setError("Threshold must be a valid number."); return; }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), condition, threshold: parsed });
      onClose();
    } catch {
      setError("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-default)] shadow-[var(--shadow-lg)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-default)]">
          <p className="text-[14px] font-semibold text-[var(--text-primary)]">Edit Alert</p>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors duration-150"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[var(--text-secondary)]">Alert name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              className={INPUT_CLS}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[var(--text-secondary)]">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as AlertCondition)}
                className={INPUT_CLS + " cursor-pointer appearance-none"}
              >
                {CONDITION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[var(--text-secondary)]">Threshold</label>
              <input
                type="number"
                min="0"
                step="any"
                value={threshold}
                onChange={(e) => { setThreshold(e.target.value); setError(""); }}
                className={INPUT_CLS}
              />
            </div>
          </div>

          {error && (
            <p className="text-[12px] text-chart-negative">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--border-default)]">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg text-[13px] font-semibold border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-active)] transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "h-9 px-5 rounded-lg text-[13px] font-semibold",
              "bg-purple-500 text-white hover:bg-purple-600",
              "transition-colors duration-150",
              saving && "opacity-60 cursor-not-allowed",
            )}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toggle switch ─────────────────────────────────────────────────────────────

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400",
        enabled
          ? "bg-purple-500"
          : "bg-[var(--bg-tertiary)] border border-[var(--border-default)]",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
          enabled ? "translate-x-[18px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

// ─── Alert card ────────────────────────────────────────────────────────────────

function AlertCard({
  alert,
  onToggle,
  onDelete,
  onEdit,
}: {
  alert: Alert;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (alert: Alert) => void;
}) {
  const cfg = TYPE_CONFIG[alert.type as DisplayType] ?? TYPE_CONFIG.whale;
  const lastTrigger = alert.triggers?.[0];

  return (
    <div
      className={cn(
        "rounded-[14px] p-4",
        "bg-[var(--bg-secondary)]",
        "border border-[var(--border-default)]",
        "shadow-[var(--shadow-sm)]",
        "transition-opacity duration-200",
        !alert.enabled && "opacity-60",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-[14px] font-semibold text-[var(--text-primary)] leading-snug">
              {alert.name}
            </p>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ color: cfg.color, backgroundColor: cfg.bg }}
            >
              {cfg.icon}
              {cfg.label}
            </span>
          </div>

          <p className="text-[12px] text-[var(--text-secondary)] font-mono mb-2">
            {alert.token ? `${alert.token} ` : ""}
            {alert.condition} {alert.threshold}
          </p>

          <div className="flex items-center gap-1.5">
            <Clock size={11} className="text-[var(--text-muted)]" aria-hidden="true" />
            <span className="text-[11px] text-[var(--text-muted)]">
              {lastTrigger
                ? `Last triggered: ${new Date(lastTrigger.createdAt).toLocaleString()}`
                : "Never triggered"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 pt-0.5">
          <Toggle enabled={alert.enabled} onChange={(v) => onToggle(alert.id, v)} />

          <button
            aria-label="Edit alert"
            onClick={() => onEdit(alert)}
            className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors duration-150"
          >
            <Pencil size={13} aria-hidden="true" />
          </button>

          <button
            aria-label="Delete alert"
            onClick={() => onDelete(alert.id)}
            className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--text-muted)] hover:text-chart-negative hover:bg-chart-negative/10 transition-colors duration-150"
          >
            <Trash2 size={13} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Alerts List ───────────────────────────────────────────────────────────────

export function AlertsList() {
  const { alerts, loading, error, toggleAlert, updateAlert, deleteAlert } = useAlerts();
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[88px] rounded-[14px] bg-[var(--bg-secondary)] border border-[var(--border-default)] animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[14px] border border-dashed border-[var(--border-default)] p-8 text-center text-[var(--text-muted)]">
        <p className="text-[14px]">Could not load alerts — is the API running?</p>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 py-16",
          "rounded-[14px] border border-dashed border-[var(--border-default)]",
          "text-[var(--text-muted)]",
        )}
      >
        <Bell size={32} className="opacity-40" aria-hidden="true" />
        <p className="text-[14px] font-medium">No alerts yet</p>
        <p className="text-[12px]">Create your first alert using the button above.</p>
      </div>
    );
  }

  return (
    <>
      {editingAlert && (
        <EditAlertModal
          alert={editingAlert}
          onSave={async (patch) => { await updateAlert(editingAlert.id, patch); }}
          onClose={() => setEditingAlert(null)}
        />
      )}
      <div className="flex flex-col gap-3">
        {alerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onToggle={toggleAlert}
            onDelete={deleteAlert}
            onEdit={setEditingAlert}
          />
        ))}
      </div>
    </>
  );
}
