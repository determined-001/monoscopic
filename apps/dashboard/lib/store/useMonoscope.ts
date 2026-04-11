import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LiveBlock {
  number: number;
  hash: string;
  timestamp: number;
  transactionCount: number;
  gasUsed: string;
  gasLimit: string;
  gasUsedPercent: number;
  tps: number;
  uniqueWallets: number;
  totalFees: string;
  txTypeBreakdown: {
    transfers: number;
    contractCalls: number;
    deployments: number;
  };
}

export interface WhaleAlert {
  txHash: string;
  blockNumber: number;
  timestamp: number;
  from: string;
  to: string;
  amount: string;
  tokenType: "native" | "erc20";
  tokenAddress?: string;
}

interface MonoscopeState {
  // Connection
  connected: boolean;

  // Live data
  latestBlock: LiveBlock | null;
  recentBlocks: LiveBlock[];
  whaleAlerts: WhaleAlert[];

  // Actions
  setConnected: (connected: boolean) => void;
  setLatestBlock: (block: LiveBlock) => void;
  addWhaleAlert: (alert: WhaleAlert) => void;
  setWhaleHistory: (alerts: WhaleAlert[]) => void;
}

export const useMonoscopeStore = create<MonoscopeState>((set) => ({
  connected: false,
  latestBlock: null,
  recentBlocks: [],
  whaleAlerts: [],

  setConnected: (connected) => set({ connected }),

  setLatestBlock: (block) =>
    set((state) => ({
      latestBlock: block,
      recentBlocks: [block, ...state.recentBlocks].slice(0, 50),
    })),

  addWhaleAlert: (alert) =>
    set((state) => ({
      whaleAlerts: [alert, ...state.whaleAlerts].slice(0, 100),
    })),

  setWhaleHistory: (alerts) => set({ whaleAlerts: alerts }),
}));
