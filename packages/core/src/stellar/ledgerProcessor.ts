import { EventEmitter } from "node:events";
import { toStroops } from "./amount.js";
import { assetKeyOf, type AssetKey } from "./asset.js";

export type StellarNetwork = "testnet" | "public";

export type CandidateKind =
  | "payment"
  | "path_payment"
  | "trade"
  | "create_account";

/** One balance movement worth considering as a whale event. */
export interface WhaleCandidate {
  kind: CandidateKind;
  /**
   * Natural key. A Stellar transaction can carry up to 100 operations, and a
   * single operation can move value on two legs, so the transaction hash is NOT
   * unique — the Horizon operation id is. Multi-leg operations suffix the leg.
   */
  opId: string;
  /** Opaque Horizon cursor. Never parse it: trade tokens look like "12345-0". */
  pagingToken: string;
  /** Null for trades — Horizon trade records do not carry a transaction hash. */
  txHash: string | null;
  /** Derived from the operation id; see ledgerFromToid. */
  ledger: number;
  closedAt: Date;
  from: string;
  to: string;
  assetKey: AssetKey;
  amountStroops: bigint;
  network: StellarNetwork;
}

/** Minimal shape of the Horizon operation records we consume. */
interface OperationRecord {
  id: string;
  paging_token: string;
  type: string;
  transaction_hash?: string;
  transaction_successful?: boolean;
  created_at: string;
  // payment
  amount?: string;
  asset_type?: string;
  asset_code?: string;
  asset_issuer?: string;
  from?: string;
  to?: string;
  // path payment
  source_amount?: string;
  source_asset_type?: string;
  source_asset_code?: string;
  source_asset_issuer?: string;
  // create_account
  funder?: string;
  account?: string;
  starting_balance?: string;
}

interface TradeRecord {
  id: string;
  paging_token: string;
  ledger_close_time: string;
  base_account?: string;
  base_liquidity_pool_id?: string;
  base_amount: string;
  base_asset_type: string;
  base_asset_code?: string;
  base_asset_issuer?: string;
  counter_account?: string;
  counter_liquidity_pool_id?: string;
  counter_amount: string;
  counter_asset_type: string;
  counter_asset_code?: string;
  counter_asset_issuer?: string;
  base_is_seller?: boolean;
}

/**
 * Recover the ledger sequence from a Horizon operation or trade id.
 *
 * Horizon operation records do NOT carry a ledger field. The id is a TOID
 * (Total Order ID): `ledger_sequence << 32 | tx_order << 12 | op_order`, so the
 * sequence is the high 32 bits. Trade ids are the operation TOID with a leg
 * suffix ("...961-0"), so the suffix is dropped first.
 *
 * Verified against live Horizon: op 272658250666172417 >> 32 = 63483196, and
 * Horizon independently reports that transaction in ledger 63483196.
 */
export function ledgerFromToid(id: string): number {
  const head = id.split("-")[0]!;
  if (!/^\d+$/.test(head)) {
    throw new Error(`not a TOID: ${JSON.stringify(id)}`);
  }
  return Number(BigInt(head) >> 32n);
}

export class LedgerProcessor extends EventEmitter {
  constructor(private readonly network: StellarNetwork) {
    super();
  }

  /**
   * Map a Horizon operation to zero or more whale candidates.
   *
   * Returns [] for operations that did not actually move value. The critical
   * case is `transaction_successful === false`: Horizon streams operations from
   * FAILED transactions, and they look completely ordinary — a real captured
   * fixture is a failed 800.0000000 payment. Emitting one as a whale alert would
   * be fabricated data reaching a live UI through a bug rather than through copy.
   */
  processOperation(op: OperationRecord): WhaleCandidate[] {
    if (op.transaction_successful === false) return [];

    switch (op.type) {
      case "payment":
        return this.payment(op);
      case "path_payment_strict_send":
      case "path_payment_strict_receive":
        return this.pathPayment(op);
      case "create_account":
        return this.createAccount(op);
      default:
        return [];
    }
  }

  private base(op: OperationRecord) {
    return {
      opId: op.id,
      pagingToken: op.paging_token,
      txHash: op.transaction_hash ?? null,
      ledger: ledgerFromToid(op.id),
      closedAt: new Date(op.created_at),
      network: this.network,
    };
  }

  private payment(op: OperationRecord): WhaleCandidate[] {
    if (!op.amount || !op.from || !op.to || !op.asset_type) return [];
    return [
      {
        ...this.base(op),
        kind: "payment",
        from: op.from,
        to: op.to,
        assetKey: assetKeyOf({
          asset_type: op.asset_type,
          asset_code: op.asset_code,
          asset_issuer: op.asset_issuer,
        }),
        amountStroops: toStroops(op.amount),
      },
    ];
  }

  /**
   * A path payment has DISTINCT source and destination assets and amounts: the
   * sender spends `source_amount` of `source_asset`, the receiver gets `amount`
   * of `asset`. A real captured fixture sends 0.0003681 XLM and delivers
   * 29,169,828.0998436 NABU — pairing the source asset with the destination
   * amount would report a 29-million-XLM movement, off by eight orders of
   * magnitude. Both legs are emitted separately, each with its own asset.
   */
  private pathPayment(op: OperationRecord): WhaleCandidate[] {
    if (!op.from || !op.to) return [];
    const out: WhaleCandidate[] = [];
    const b = this.base(op);

    if (op.source_amount && op.source_asset_type) {
      out.push({
        ...b,
        opId: `${op.id}:send`,
        kind: "path_payment",
        from: op.from,
        to: op.to,
        assetKey: assetKeyOf({
          asset_type: op.source_asset_type,
          asset_code: op.source_asset_code,
          asset_issuer: op.source_asset_issuer,
        }),
        amountStroops: toStroops(op.source_amount),
      });
    }
    if (op.amount && op.asset_type) {
      out.push({
        ...b,
        opId: `${op.id}:recv`,
        kind: "path_payment",
        from: op.from,
        to: op.to,
        assetKey: assetKeyOf({
          asset_type: op.asset_type,
          asset_code: op.asset_code,
          asset_issuer: op.asset_issuer,
        }),
        amountStroops: toStroops(op.amount),
      });
    }
    return out;
  }

  private createAccount(op: OperationRecord): WhaleCandidate[] {
    if (!op.starting_balance || !op.funder || !op.account) return [];
    return [
      {
        ...this.base(op),
        kind: "create_account",
        from: op.funder,
        to: op.account,
        assetKey: "native",
        amountStroops: toStroops(op.starting_balance),
      },
    ];
  }

  /**
   * Map a Horizon trade to its two legs.
   *
   * Trades carry no `transaction_hash` and no `transaction_successful` (Horizon
   * only records trades from successful transactions). For liquidity-pool trades
   * there is no counterparty ACCOUNT at all — only a pool id — so the party is
   * reported as `pool:<id>`.
   */
  processTrade(t: TradeRecord): WhaleCandidate[] {
    const closedAt = new Date(t.ledger_close_time);
    const baseParty = t.base_account ?? `pool:${t.base_liquidity_pool_id ?? "?"}`;
    const counterParty =
      t.counter_account ?? `pool:${t.counter_liquidity_pool_id ?? "?"}`;
    const baseIsSeller = t.base_is_seller !== false;

    const legs: WhaleCandidate[] = [];

    legs.push({
      kind: "trade",
      opId: `${t.id}:base`,
      pagingToken: t.paging_token,
      txHash: null,
      ledger: ledgerFromToid(t.id),
      closedAt,
      from: baseIsSeller ? baseParty : counterParty,
      to: baseIsSeller ? counterParty : baseParty,
      assetKey: assetKeyOf({
        asset_type: t.base_asset_type,
        asset_code: t.base_asset_code,
        asset_issuer: t.base_asset_issuer,
      }),
      amountStroops: toStroops(t.base_amount),
      network: this.network,
    });

    legs.push({
      kind: "trade",
      opId: `${t.id}:counter`,
      pagingToken: t.paging_token,
      txHash: null,
      ledger: ledgerFromToid(t.id),
      closedAt,
      from: baseIsSeller ? counterParty : baseParty,
      to: baseIsSeller ? baseParty : counterParty,
      assetKey: assetKeyOf({
        asset_type: t.counter_asset_type,
        asset_code: t.counter_asset_code,
        asset_issuer: t.counter_asset_issuer,
      }),
      amountStroops: toStroops(t.counter_amount),
      network: this.network,
    });

    return legs;
  }
}
