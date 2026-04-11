export type TransactionType = "transfer" | "contract_call" | "contract_deployment";

export interface TokenTransfer {
  type: "native" | "erc20";
  tokenAddress?: string;
  from: string;
  to: string;
  amount: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  gasPrice: string;
  gasUsed: string;
  fee: string;
  type: TransactionType;
  tokenTransfers: TokenTransfer[];
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
