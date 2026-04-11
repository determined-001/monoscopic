"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const WS_URL  = API_URL.replace(/^http/, "ws");

interface ApiKey {
  id: string;
  label: string;
  key: string; // masked after creation
  createdAt: string;
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy"
      className={cn(
        "flex items-center justify-center h-7 w-7 rounded-md",
        "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]",
        "transition-colors duration-150",
        className,
      )}
    >
      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
    </button>
  );
}

// ─── Code block ───────────────────────────────────────────────────────────────

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative rounded-lg bg-[var(--bg-primary)] border border-[var(--border-default)] overflow-hidden">
      <CopyButton text={code} className="absolute top-2 right-2" />
      <pre className="px-4 py-3 text-[12px] font-mono text-[var(--text-secondary)] overflow-x-auto whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

// ─── Developer Section ────────────────────────────────────────────────────────

export function DeveloperSection() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showNewKey, setShowNewKey] = useState(true);

  useEffect(() => {
    fetchKeys();
  }, []);

  async function fetchKeys() {
    try {
      const res = await fetch(`${API_URL}/api-keys`);
      const data = await res.json();
      setKeys(data);
    } catch {
      // API not running
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label.trim() || "My App" }),
      });
      const created = await res.json();
      setNewKey(created.key);
      setShowNewKey(true);
      setLabel("");
      await fetchKeys();
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    await fetch(`${API_URL}/api-keys/${id}`, { method: "DELETE" });
    setKeys((prev) => prev.filter((k) => k.id !== id));
  }

  const snippet = `import { monoscope } from "@monoscope/sdk";

const stop = monoscope("${newKey ?? "YOUR_API_KEY"}", (event) => {
  if (event.type === "alert_triggered") {
    const { alert, trigger } = event.data;
    console.log(\`[\${alert.type}] \${alert.name} — value: \${trigger.value}\`);
  }
});

// Call stop() to disconnect`;

  return (
    <div className="flex flex-col gap-6">

      {/* ── New key banner ── */}
      {newKey && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 flex flex-col gap-2">
          <p className="text-[12px] font-semibold text-green-400">
            API key generated — copy it now, it won't be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-[12px] text-[var(--text-primary)] bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-lg px-3 py-2 truncate">
              {showNewKey ? newKey : "mk_live_" + "•".repeat(40)}
            </code>
            <button
              onClick={() => setShowNewKey((v) => !v)}
              aria-label="Toggle visibility"
              className="h-8 w-8 flex items-center justify-center rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors duration-150"
            >
              {showNewKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <CopyButton text={newKey} />
          </div>
        </div>
      )}

      {/* ── Create key ── */}
      <div className="flex flex-col gap-3">
        <p className="text-[12px] font-medium text-[var(--text-secondary)]">Generate a new key</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (e.g. My Discord Bot)"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="flex-1 h-9 rounded-lg px-3 text-[13px] bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-active)] transition-colors duration-150"
          />
          <button
            onClick={handleCreate}
            disabled={creating}
            className={cn(
              "h-9 px-4 rounded-lg text-[13px] font-semibold flex items-center gap-1.5",
              "bg-purple-500 text-white hover:bg-purple-600",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400",
              creating && "opacity-60 cursor-not-allowed",
            )}
          >
            <Plus size={14} />
            {creating ? "Generating…" : "Generate"}
          </button>
        </div>
      </div>

      {/* ── Existing keys ── */}
      <div className="flex flex-col gap-2">
        <p className="text-[12px] font-medium text-[var(--text-secondary)]">Active keys</p>
        {loading ? (
          <div className="h-12 rounded-lg bg-[var(--bg-tertiary)] animate-pulse" />
        ) : keys.length === 0 ? (
          <p className="text-[12px] text-[var(--text-muted)] py-3">No keys yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-[var(--border-default)] border border-[var(--border-default)] rounded-xl overflow-hidden">
            {keys.map((k) => (
              <div key={k.id} className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-secondary)]">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[var(--text-primary)]">{k.label}</p>
                  <p className="font-mono text-[11px] text-[var(--text-muted)] truncate">{k.key}</p>
                </div>
                <span className="text-[11px] text-[var(--text-muted)] shrink-0">
                  {new Date(k.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleRevoke(k.id)}
                  aria-label="Revoke key"
                  className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-colors duration-150"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Quickstart ── */}
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-[12px] font-medium text-[var(--text-secondary)]">Quickstart</p>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            Install the SDK and connect in seconds.
          </p>
        </div>
        <CodeBlock code={`npm install @monoscope/sdk`} />
        <CodeBlock code={snippet} />
        <p className="text-[11px] text-[var(--text-muted)]">
          WebSocket endpoint: <code className="font-mono text-[var(--text-secondary)]">{WS_URL}?key=YOUR_KEY</code>
        </p>
      </div>

    </div>
  );
}
