"use client";

import { useState, useEffect } from "react";
import { Check, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { useAlerts, type AlertType, type AlertCondition } from "@/lib/hooks/useAlerts";

// ─── Types ─────────────────────────────────────────────────────────────────────

type TabType = "Whale";

interface FormState {
  tab: TabType;
  name: string;
  // Whale
  whaleAddress: string;
  whaleActions: string[];
  whaleMinValue: string;
  /** "native" | "CODE:GISSUER" — the asset this alert watches. */
  whaleAsset: string;
  // Notifications
  notifyInApp: boolean;
  notifyEmail: boolean;
  notifyTelegram: boolean;
  notifyDiscord: boolean;
  discordWebhook: string;
}

const INITIAL_FORM: FormState = {
  tab: "Whale",
  name: "",
  whaleAddress: "",
  whaleActions: ["Buy"],
  whaleMinValue: "",
  whaleAsset: "native",
  notifyInApp: true,
  notifyEmail: false,
  notifyTelegram: false,
  notifyDiscord: false,
  discordWebhook: "",
};

const TABS: TabType[] = ["Whale"];

// ─── Shared field styles ────────────────────────────────────────────────────────

const INPUT_CLS = [
  "w-full h-9 rounded-lg px-3 text-[13px]",
  "bg-[var(--bg-tertiary)] border border-[var(--border-default)]",
  "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
  "focus:outline-none focus:border-[var(--border-active)]",
  "transition-colors duration-150",
].join(" ");

const SELECT_CLS = INPUT_CLS + " cursor-pointer appearance-none pr-8";

// ─── Sub-components ─────────────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-[var(--text-secondary)]">
        {label}
      </label>
      {children}
    </div>
  );
}

function PrefixInput({
  prefix,
  value,
  onChange,
  placeholder = "0.00",
}: {
  prefix: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex h-9 rounded-lg overflow-hidden border border-[var(--border-default)] bg-[var(--bg-tertiary)] focus-within:border-[var(--border-active)] transition-colors duration-150">
      <span className="flex items-center pl-3 pr-1 text-[13px] text-[var(--text-muted)] shrink-0 select-none">
        {prefix}
      </span>
      <input
        type="number"
        min="0"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-0 bg-transparent px-2 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
      />
    </div>
  );
}

function SuffixInput({
  suffix,
  value,
  onChange,
  placeholder = "0",
}: {
  suffix: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex h-9 rounded-lg overflow-hidden border border-[var(--border-default)] bg-[var(--bg-tertiary)] focus-within:border-[var(--border-active)] transition-colors duration-150">
      <input
        type="number"
        min="0"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-0 bg-transparent px-3 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
      />
      <span className="flex items-center pr-3 pl-1 text-[13px] text-[var(--text-muted)] shrink-0 select-none">
        {suffix}
      </span>
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <div
        aria-hidden="true"
        className={cn(
          "h-4 w-4 shrink-0 rounded flex items-center justify-center border transition-colors duration-150",
          checked
            ? "bg-purple-500 border-purple-500"
            : "border-[var(--border-default)] bg-[var(--bg-tertiary)]",
        )}
      >
        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
      </div>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-[13px] text-[var(--text-secondary)]">{label}</span>
    </label>
  );
}

// ─── Tab form panels ────────────────────────────────────────────────────────────

function WhalePanel({ form, set }: { form: FormState; set: SetFn }) {
  function toggleAction(action: string) {
    const current = form.whaleActions;
    set(
      "whaleActions",
      current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action],
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label="Wallet address or label">
        <input
          type="text"
          value={form.whaleAddress}
          onChange={(e) => set("whaleAddress", e.target.value)}
          placeholder="0x… or Jump Trading"
          className={INPUT_CLS}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Action types">
          <div className="flex flex-col gap-2 pt-1">
            {(["Buy", "Sell", "Transfer"] as const).map((action) => (
              <Checkbox
                key={action}
                label={action}
                checked={form.whaleActions.includes(action)}
                onChange={() => toggleAction(action)}
              />
            ))}
          </div>
        </Field>
        <Field label="Minimum value (USD)">
          <PrefixInput
            prefix="$"
            value={form.whaleMinValue}
            onChange={(v) => set("whaleMinValue", v)}
            placeholder="100,000"
          />
        </Field>
      </div>
    </div>
  );
}

// ─── SetFn type helper ─────────────────────────────────────────────────────────

type SetFn = <K extends keyof FormState>(key: K, val: FormState[K]) => void;

// ─── Create Alert Modal ────────────────────────────────────────────────────────

export function CreateAlertModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { createAlert } = useAlerts();
  const [form, setFormState] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setFormState(INITIAL_FORM);
      setErrors([]);
    }
  }, [isOpen]);

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setFormState((prev) => ({ ...prev, [key]: val }));
    if (errors.length > 0) setErrors([]);
  }

  function validate(): string[] {
    const errs: string[] = [];
    if (!form.name.trim()) errs.push("Alert name is required.");
    const hasNotif =
      form.notifyInApp ||
      form.notifyEmail ||
      form.notifyTelegram ||
      form.notifyDiscord;
    if (!hasNotif) errs.push("Select at least one notification method.");
    if (form.notifyDiscord && !form.discordWebhook.trim())
      errs.push("Discord webhook URL is required when Discord is selected.");
    return errs;
  }

  async function handleSave() {
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      // Map form tab to alert type and extract threshold
      // Threshold travels as a decimal STRING; the API converts it to stroops
      // exactly. parseFloat would reintroduce the precision loss stroop math
      // exists to prevent.
      const threshold = form.whaleMinValue.trim();
      const condition: AlertCondition = "above";
      // An alert must name the asset it watches, including its issuer — a bare
      // code would let a look-alike asset trigger the real one's threshold.
      const assetKey = form.whaleAsset.trim() || "native";

      await createAlert({
        type: "whale",
        name: form.name,
        assetKey,
        condition,
        threshold,
        notifyInApp:    form.notifyInApp,
        notifyEmail:    form.notifyEmail,
        notifyTelegram: form.notifyTelegram,
        notifyDiscord:  form.notifyDiscord,
        discordWebhook: form.notifyDiscord ? form.discordWebhook : undefined,
      });
      onClose();
    } catch {
      setErrors(["Failed to save alert. Is the API running?"]);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-[580px]"
      className="!p-0 overflow-hidden"
    >
      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-4 border-b border-[var(--border-default)]">
        <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
          Create Alert
        </h2>
        <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
          Get notified when your conditions are met.
        </p>
      </div>

      {/* ── Scrollable body ── */}
      <div className="overflow-y-auto max-h-[calc(80vh-130px)] px-6 py-5 flex flex-col gap-6">
        {/* Type tabs */}
        <div>
          <div className="flex border-b border-[var(--border-default)]">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => set("tab", tab)}
                className={cn(
                  "relative px-4 py-2.5 text-[13px] font-medium transition-colors duration-150",
                  form.tab === tab
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
                )}
              >
                {tab}
                {form.tab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-purple-500" />
                )}
              </button>
            ))}
          </div>
          <div className="pt-5">
            {form.tab === "Whale" && <WhalePanel form={form} set={set} />}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border-default)]" />

        {/* Notifications */}
        <div className="flex flex-col gap-3">
          <p className="text-[12px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Notifications
          </p>
          <div className="grid grid-cols-2 gap-y-3 gap-x-6">
            <Checkbox
              label="In-app notification"
              checked={form.notifyInApp}
              onChange={(v) => set("notifyInApp", v)}
            />
            <Checkbox
              label="Email"
              checked={form.notifyEmail}
              onChange={(v) => set("notifyEmail", v)}
            />
            <Checkbox
              label="Telegram"
              checked={form.notifyTelegram}
              onChange={(v) => set("notifyTelegram", v)}
            />
            <Checkbox
              label="Discord webhook"
              checked={form.notifyDiscord}
              onChange={(v) => set("notifyDiscord", v)}
            />
          </div>
          {form.notifyDiscord && (
            <Field label="Discord webhook URL">
              <input
                type="url"
                value={form.discordWebhook}
                onChange={(e) => set("discordWebhook", e.target.value)}
                placeholder="https://discord.com/api/webhooks/…"
                className={INPUT_CLS}
              />
            </Field>
          )}
        </div>

        {/* Alert name */}
        <Field label="Alert name *">
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. MON drops below $5"
            className={INPUT_CLS}
          />
        </Field>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="flex flex-col gap-1.5 rounded-lg bg-chart-negative/10 border border-chart-negative/20 px-3 py-2.5">
            {errors.map((err, i) => (
              <div key={i} className="flex items-center gap-2">
                <AlertCircle
                  size={13}
                  className="text-chart-negative shrink-0"
                  aria-hidden="true"
                />
                <span className="text-[12px] text-chart-negative">{err}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border-default)]">
        <button
          onClick={onClose}
          className={cn(
            "h-9 px-5 rounded-lg text-[13px] font-semibold",
            "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
            "border border-[var(--border-default)] hover:border-[var(--border-active)]",
            "transition-colors duration-150",
          )}
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
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400",
            saving && "opacity-60 cursor-not-allowed",
          )}
        >
          {saving ? "Saving…" : "Save Alert"}
        </button>
      </div>
    </Modal>
  );
}
