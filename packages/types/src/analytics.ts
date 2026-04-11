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

