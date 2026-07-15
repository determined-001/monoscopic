"use client";
import { useEffect, useState } from "react";

const API_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  "http://localhost:3001";

/** Shape of GET /health. Mirrors the API's loop-proof payload. */
export interface Health {
  status: string;
  feed: {
    network: string;
    horizon: string;
    /** Server-side liveness: false when the Horizon stream has gone quiet. */
    live: boolean;
    stalenessMs: number | null;
    lastRecordAgo: string | null;
  };
  soroban: {
    status: "up" | "down" | "disabled";
    contractId?: string;
    triggerCount?: string;
    lastOnchainTxHash?: string | null;
    /** stellar.expert link to the most recent attestation, if any. */
    explorer?: string | null;
    /** stellar.expert link to the contract itself. */
    contract?: string | null;
  };
}

/**
 * Poll /health so the UI can show what is actually true — which network the feed
 * reads, whether it is still live, and the on-chain contract the pipeline writes
 * to. Every number the landing page renders traces back to this or the socket.
 */
export function useHealth(intervalMs = 15_000): Health | null {
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as Health;
        if (!cancelled) setHealth(json);
      } catch {
        // Unreachable API must read as unknown, not as healthy.
        if (!cancelled) setHealth(null);
      }
    }

    void poll();
    const t = setInterval(() => void poll(), intervalMs);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [intervalMs]);

  return health;
}
