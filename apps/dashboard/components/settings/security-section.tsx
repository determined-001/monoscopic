"use client";

import { useState, useEffect, useCallback } from "react";
import { Copy, Trash2, Plus, Check, Key } from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface ApiKey {
  id: string;
  label: string;
  key: string; // masked in list, full only on creation
  createdAt: string;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
      {children}
    </p>
  );
}

// ─── One-time key reveal modal ────────────────────────────────────────────────

function NewKeyModal({
  apiKey,
  onClose,
}: {
  apiKey: { label: string; key: string };
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(apiKey.key).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-default)] shadow-[var(--shadow-lg)] p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
            <Key size={16} className="text-purple-400" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[var(--text-primary)]">
              API Key Created
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">{apiKey.label}</p>
          </div>
        </div>

        <div className="rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-default)] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
            Your API Key
          </p>
          <p className="font-mono text-[12px] text-[var(--text-primary)] break-all select-all">
            {apiKey.key}
          </p>
        </div>

        <p className="text-[11px] text-chart-negative/80 font-medium">
          Copy this key now — it will never be shown again.
        </p>

        <div className="flex gap-2">
          <button
            onClick={copy}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 h-9 rounded-lg text-[13px] font-semibold transition-colors duration-150",
              copied
                ? "bg-chart-positive/15 text-chart-positive"
                : "bg-purple-500 text-white hover:bg-purple-600",
            )}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy Key"}
          </button>
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg text-[13px] font-semibold border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-active)] transition-colors duration-150"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Security Section ─────────────────────────────────────────────────────────

export function SecuritySection() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState<{ label: string; key: string } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [labelInput, setLabelInput] = useState("My App");

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api-keys`);
      if (res.ok) setKeys(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  async function generateKey() {
    setGenerating(true);
    try {
      const res = await fetch(`${API_URL}/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: labelInput.trim() || "My App" }),
      });
      if (!res.ok) return;
      const created = await res.json();
      setNewKey({ label: created.label, key: created.key });
      setLabelInput("My App");
      fetchKeys();
    } finally {
      setGenerating(false);
    }
  }

  async function revokeKey(id: string) {
    await fetch(`${API_URL}/api-keys/${id}`, { method: "DELETE" });
    setKeys((prev) => prev.filter((k) => k.id !== id));
  }

  function copyMasked(id: string, masked: string) {
    navigator.clipboard.writeText(masked).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  }

  return (
    <>
      {newKey && (
        <NewKeyModal apiKey={newKey} onClose={() => setNewKey(null)} />
      )}

      <div className="flex flex-col gap-8">
        {/* API Keys */}
        <div>
          <SectionTitle>API Keys</SectionTitle>

          {loading ? (
            <p className="text-[13px] text-[var(--text-muted)] py-3">Loading…</p>
          ) : (
            <div className="flex flex-col gap-2 mb-3">
              {keys.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-tertiary)]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[var(--text-primary)]">
                      {k.label}
                    </p>
                    <p className="font-mono text-[11px] text-[var(--text-muted)] truncate">
                      {k.key}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Created{" "}
                      {new Date(k.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => copyMasked(k.id, k.key)}
                    aria-label="Copy masked key"
                    title="Copy key identifier"
                    className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors duration-150"
                  >
                    {copiedId === k.id ? (
                      <Check size={13} className="text-chart-positive" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                  <button
                    onClick={() => revokeKey(k.id)}
                    aria-label="Revoke key"
                    className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--text-muted)] hover:text-chart-negative hover:bg-chart-negative/10 transition-colors duration-150"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {keys.length === 0 && (
                <p className="text-[13px] text-[var(--text-muted)] py-3">
                  No API keys yet.
                </p>
              )}
            </div>
          )}

          {/* Generate form */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              placeholder="Key label…"
              className={cn(
                "h-9 flex-1 max-w-[200px] rounded-lg px-3 text-[13px]",
                "bg-[var(--bg-tertiary)] border border-[var(--border-default)]",
                "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
                "focus:outline-none focus:border-[var(--border-active)]",
                "transition-colors duration-150",
              )}
            />
            <button
              onClick={generateKey}
              disabled={generating}
              className={cn(
                "flex items-center gap-2 h-9 px-4 rounded-lg",
                "text-[13px] font-semibold text-purple-400",
                "border border-dashed border-purple-500/30",
                "hover:border-purple-500/60 hover:bg-purple-500/5",
                "transition-all duration-150",
                generating && "opacity-60 cursor-not-allowed",
              )}
            >
              <Plus size={14} />
              {generating ? "Generating…" : "Generate API Key"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
