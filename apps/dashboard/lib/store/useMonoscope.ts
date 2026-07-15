import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────

/** A whale event as broadcast by the API. Mirrors WhaleCandidate on the server. */
export interface WhaleAlert {
  /** Horizon operation id — the natural key. A transaction can carry up to 100
   *  operations, so txHash does not identify an event. */
  opId: string;
  /** Null for trades: Horizon trade records carry no transaction hash. */
  txHash: string | null;
  kind: "payment" | "path_payment" | "trade" | "create_account";
  from: string;
  to: string;
  /** "native" | "CODE:GISSUER" — the issuer is part of the asset's identity. */
  assetKey: string;
  /** Exact stroops as a decimal string; the source of truth for comparisons. */
  amountStroops: string;
  /** Pre-formatted decimal amount from the API, e.g. "25000.0000000". Rendering
   *  this avoids re-deriving it (and re-introducing float error) in the client. */
  amount: string;
  /** Ledger sequence, derived server-side from the operation id (a TOID). */
  ledger: number;
  closedAt: string;
  network: "testnet" | "public";
}

interface MonoscopeState {
  // Connection
  connected: boolean;

  // Live data
  whaleAlerts: WhaleAlert[];

  // Actions
  setConnected: (connected: boolean) => void;
  addWhaleAlert: (alert: WhaleAlert) => void;
  setWhaleHistory: (alerts: WhaleAlert[]) => void;
}

export const useMonoscopeStore = create<MonoscopeState>((set) => ({
  connected: false,
  whaleAlerts: [],

  setConnected: (connected) => set({ connected }),

  addWhaleAlert: (alert) =>
    set((state) => {
      // The API dedupes on opId, but a reconnect replays whale_history, so guard
      // here too rather than rendering the same event twice.
      if (state.whaleAlerts.some((w) => w.opId === alert.opId)) return state;
      return { whaleAlerts: [alert, ...state.whaleAlerts].slice(0, 100) };
    }),

  setWhaleHistory: (alerts) => set({ whaleAlerts: alerts }),
}));
