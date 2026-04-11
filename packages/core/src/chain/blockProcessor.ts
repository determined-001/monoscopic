import { EventEmitter } from "events";

export type TransactionType =
  | "transfer"
  | "contract_call"
  | "contract_deployment";

export interface TokenTransfer {
  txHash: string;
  type: "native" | "erc20";
  tokenAddress?: string; // ERC-20 contract address (lowercase)
  from: string;
  to: string;
  amount: string; // raw integer string
}

export interface ProcessedTransaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  gasPrice: string;
  gasUsed: string;
  fee: string;
  type: TransactionType;
}

export interface ProcessedBlock {
  number: number;
  hash: string;
  timestamp: number;
  transactionCount: number;
  gasUsed: string;
  gasLimit: string;
  gasUsedPercent: number;
  tps: number;
  uniqueWallets: number;
  totalValueTransferred: string;
  averageGasPrice: string;
  totalFees: string;
  txTypeBreakdown: {
    transfers: number;
    contractCalls: number;
    deployments: number;
  };
  transactions: ProcessedTransaction[];
  /** Flat list of ALL token movements for this block (native + ERC-20 from logs) */
  tokenTransfers: TokenTransfer[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function classifyTransaction(tx: any): TransactionType {
  if (!tx.to) return "contract_deployment";
  if (tx.input && tx.input !== "0x") return "contract_call";
  return "transfer";
}

function processTransaction(tx: any): ProcessedTransaction {
  const gasPrice = BigInt(tx.gasPrice ?? tx.maxFeePerGas ?? 0);
  const gasUsed  = BigInt(tx.gas ?? 0);
  const fee      = gasPrice * gasUsed;

  return {
    hash:     tx.hash,
    from:     tx.from,
    to:       tx.to ?? null,
    value:    BigInt(tx.value ?? 0).toString(),
    gasPrice: gasPrice.toString(),
    gasUsed:  gasUsed.toString(),
    fee:      fee.toString(),
    type:     classifyTransaction(tx),
  };
}

/**
 * Decode a raw eth_getLogs entry into a TokenTransfer.
 * Returns null if the log is not a well-formed ERC-20 Transfer event.
 */
function decodeTransferLog(log: any): TokenTransfer | null {
  // Need exactly 3 topics: event sig + indexed from + indexed to
  if (!log.topics || log.topics.length < 3) return null;

  try {
    const from   = ("0x" + log.topics[1].slice(26)).toLowerCase();
    const to     = ("0x" + log.topics[2].slice(26)).toLowerCase();
    const amount = BigInt(log.data).toString();
    const tokenAddress = (log.address as string).toLowerCase();

    return {
      txHash:       log.transactionHash,
      type:         "erc20",
      tokenAddress,
      from,
      to,
      amount,
    };
  } catch {
    return null;
  }
}

// ─── Block Processor ──────────────────────────────────────────────────────────

class BlockProcessor extends EventEmitter {
  private lastBlock: { number: number; timestamp: number } | null = null;

  process(raw: any, logs: any[] = []): ProcessedBlock {
    const number    = parseInt(raw.number, 16);
    const timestamp = parseInt(raw.timestamp, 16);
    const gasUsed   = BigInt(raw.gasUsed);
    const gasLimit  = BigInt(raw.gasLimit);

    const transactions = (raw.transactions ?? []).map(processTransaction);

    let tps = 0;
    if (this.lastBlock) {
      const elapsed = timestamp - this.lastBlock.timestamp;
      if (elapsed > 0) tps = transactions.length / elapsed;
    }
    this.lastBlock = { number, timestamp };

    const wallets = new Set<string>();
    let totalValue   = 0n;
    let totalFees    = 0n;
    let totalGasPrice = 0n;
    const txTypeBreakdown = { transfers: 0, contractCalls: 0, deployments: 0 };

    // Build tx lookup for native transfer detection
    const txByHash = new Map<string, any>();
    for (const rawTx of (raw.transactions ?? [])) {
      txByHash.set(rawTx.hash, rawTx);
    }

    for (const tx of transactions) {
      wallets.add(tx.from);
      if (tx.to) wallets.add(tx.to);
      totalValue    += BigInt(tx.value);
      totalFees     += BigInt(tx.fee);
      totalGasPrice += BigInt(tx.gasPrice);

      if (tx.type === "transfer")            txTypeBreakdown.transfers++;
      else if (tx.type === "contract_call")  txTypeBreakdown.contractCalls++;
      else                                   txTypeBreakdown.deployments++;
    }

    const avgGasPrice =
      transactions.length > 0
        ? totalGasPrice / BigInt(transactions.length)
        : 0n;

    // ── Token transfers ──────────────────────────────────────────────────────

    const tokenTransfers: TokenTransfer[] = [];

    // 1. Native MON — from transactions with value > 0
    for (const rawTx of (raw.transactions ?? [])) {
      const value = BigInt(rawTx.value ?? 0);
      if (value > 0n && rawTx.to) {
        tokenTransfers.push({
          txHash: rawTx.hash,
          type:   "native",
          from:   rawTx.from.toLowerCase(),
          to:     rawTx.to.toLowerCase(),
          amount: value.toString(),
        });
      }
    }

    // 2. ERC-20 — from Transfer event logs (ground truth for all token movements)
    for (const log of logs) {
      const transfer = decodeTransferLog(log);
      if (transfer) tokenTransfers.push(transfer);
    }

    const processed: ProcessedBlock = {
      number,
      hash:                 raw.hash,
      timestamp,
      transactionCount:     transactions.length,
      gasUsed:              gasUsed.toString(),
      gasLimit:             gasLimit.toString(),
      gasUsedPercent:       Number((gasUsed * 100n) / gasLimit),
      tps:                  Math.round(tps),
      uniqueWallets:        wallets.size,
      totalValueTransferred: totalValue.toString(),
      averageGasPrice:      avgGasPrice.toString(),
      totalFees:            totalFees.toString(),
      txTypeBreakdown,
      transactions,
      tokenTransfers,
    };

    this.emit("block", processed);
    return processed;
  }
}

export const blockProcessor = new BlockProcessor();
