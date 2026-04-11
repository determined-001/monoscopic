"use client";

import { useState, useEffect } from "react";
import { Toggle } from "@/components/ui/toggle";

const STORAGE_KEY = "notification_prefs";

const CHANNELS = [
  { key: "inApp", label: "In-App", desc: "Notifications inside the dashboard" },
  {
    key: "email",
    label: "Email",
    desc: "Sent to your registered email address",
  },
  { key: "telegram", label: "Telegram", desc: "Via Monoscope Telegram bot" },
  {
    key: "discord",
    label: "Discord",
    desc: "Via webhook to your Discord channel",
  },
] as const;

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, "0");
  return { value: h, label: `${h}:00` };
});

const DEFAULT_PREFS = {
  channels: { inApp: true, email: false, telegram: false, discord: false },
  quietFrom: "22",
  quietTo: "08",
};

function loadPrefs() {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function NotificationsSection() {
  const [channels, setChannels] = useState<Record<string, boolean>>(
    () => loadPrefs().channels,
  );
  const [quietFrom, setQuietFrom] = useState(() => loadPrefs().quietFrom);
  const [quietTo, setQuietTo] = useState(() => loadPrefs().quietTo);

  // Persist whenever prefs change
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ channels, quietFrom, quietTo }),
    );
  }, [channels, quietFrom, quietTo]);

  const SELECT =
    "h-8 rounded-lg px-2.5 text-[12px] bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-active)] transition-colors duration-150 cursor-pointer";

  return (
    <div className="flex flex-col gap-6">
      {/* Channel toggles */}
      <div className="flex flex-col gap-1">
        {CHANNELS.map((ch) => (
          <div
            key={ch.key}
            className="flex items-center justify-between gap-4 py-3 border-b border-[var(--border-default)] last:border-0"
          >
            <div>
              <p className="text-[13px] font-medium text-[var(--text-primary)]">
                {ch.label}
              </p>
              <p className="text-[12px] text-[var(--text-muted)]">{ch.desc}</p>
            </div>
            <Toggle
              checked={channels[ch.key]}
              onChange={(v) => setChannels((p) => ({ ...p, [ch.key]: v }))}
            />
          </div>
        ))}
      </div>

      {/* Quiet hours */}
      <div className="rounded-xl border border-[var(--border-default)] p-4 flex flex-col gap-3">
        <div>
          <p className="text-[13px] font-semibold text-[var(--text-primary)]">
            Quiet Hours
          </p>
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
            Suppress notifications during these hours.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[var(--text-muted)]">From</span>
            <select
              value={quietFrom}
              onChange={(e) => setQuietFrom(e.target.value)}
              className={SELECT}
            >
              {HOURS.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[var(--text-muted)]">To</span>
            <select
              value={quietTo}
              onChange={(e) => setQuietTo(e.target.value)}
              className={SELECT}
            >
              {HOURS.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
