import { EventEmitter } from "events";
import { ProcessedBlock, TokenTransfer } from "./blockProcessor";

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

// Threshold: 1000 MON (in wei) or 10,000 units for ERC-20
const NATIVE_THRESHOLD = BigInt("100000000000000000000"); // 100 MON
const ERC20_THRESHOLD = BigInt("100000000000000000000"); // 100 units

class WhaleTracker extends EventEmitter {
  private history: WhaleAlert[] = [];

  track(block: ProcessedBlock) {
    for (const transfer of block.tokenTransfers) {
      const amount = BigInt(transfer.amount);
      const threshold =
        transfer.type === "native" ? NATIVE_THRESHOLD : ERC20_THRESHOLD;

      if (amount >= threshold) {
        const alert: WhaleAlert = {
          txHash:      transfer.txHash,
          blockNumber: block.number,
          timestamp:   block.timestamp,
          from:        transfer.from,
          to:          transfer.to,
          amount:      transfer.amount,
          tokenType:   transfer.type,
          ...(transfer.tokenAddress !== undefined && {
            tokenAddress: transfer.tokenAddress,
          }),
        };

          this.history.unshift(alert);
          this.emit("whale", alert);

          console.log(
            `🐋 Whale | ${transfer.type === "native" ? "MON" : `ERC20 ${transfer.tokenAddress}`} | ${transfer.from.slice(0, 8)}... → ${transfer.to.slice(0, 8)}... | amount: ${amount.toString()}`,
          );
        }
      }
  }

  getHistory(): WhaleAlert[] {
    return this.history;
  }
}

export const whaleTracker = new WhaleTracker();
