/**
 * TypeScript client for the alert_registry Soroban contract.
 *
 * This is the half of the system that makes the product actually invoke the
 * chain rather than merely ship alongside one:
 *
 *   - `listActive()` is a SIMULATION (read). It is load-bearing — the pipeline
 *     cannot know what to watch without it — but it submits nothing, so it
 *     leaves no public artifact.
 *   - `recordTrigger()` SUBMITS a transaction. That is the evidence: a real tx
 *     hash, against a committed contract id, timestamped, visible on
 *     stellar.expert without reading a line of source.
 *
 * Hand-written rather than generated via `stellar contract bindings typescript`:
 * generated clients checked into a monorepo drift against the contract and are a
 * liability on a deadline.
 */
import {
  Address,
  BASE_FEE,
  Contract,
  Keypair,
  nativeToScVal,
  rpc,
  scValToNative,
  TransactionBuilder,
  xdr,
} from "@stellar/stellar-sdk";

export interface RegistryConfig {
  rpcUrl: string;
  networkPassphrase: string;
  contractId: string;
  adminSecret: string;
}

export type AssetKeySc =
  | { tag: "Native" }
  | { tag: "Issued"; code: string; issuer: string };

export interface Subscription {
  id: bigint;
  owner: string;
  asset: AssetKeySc;
  minAmount: bigint;
  active: boolean;
  createdLedger: number;
}

export interface SelfCheck {
  ok: boolean;
  contractId: string;
  network: string;
  triggerCount?: bigint;
  reason?: string;
}

const TX_TIMEOUT_S = 30;
const POLL_INTERVAL_MS = 1000;
const POLL_TIMEOUT_MS = 45_000;

export class RegistryClient {
  private readonly server: rpc.Server;
  private readonly contract: Contract;
  private readonly admin: Keypair;

  constructor(private readonly cfg: RegistryConfig) {
    this.server = new rpc.Server(cfg.rpcUrl);
    this.contract = new Contract(cfg.contractId);
    this.admin = Keypair.fromSecret(cfg.adminSecret);
  }

  get contractId(): string {
    return this.cfg.contractId;
  }

  get adminPublicKey(): string {
    return this.admin.publicKey();
  }

  /**
   * Boot-time proof that the on-chain wiring is real. Called at startup and
   * surfaced on /health so a misconfigured deploy is loud instead of silent.
   */
  async selfCheck(): Promise<SelfCheck> {
    try {
      const triggerCount = await this.triggerCount();
      return {
        ok: true,
        contractId: this.cfg.contractId,
        network: this.cfg.networkPassphrase,
        triggerCount,
      };
    } catch (e) {
      return {
        ok: false,
        contractId: this.cfg.contractId,
        network: this.cfg.networkPassphrase,
        reason: (e as Error).message,
      };
    }
  }

  /** Read-only: cumulative attestations recorded on-chain. */
  async triggerCount(): Promise<bigint> {
    const v = await this.simulate(this.contract.call("trigger_count"));
    return BigInt(scValToNative(v) as string | number | bigint);
  }

  /** Read-only: the subscriptions the pipeline should watch. */
  async listActive(start = 1n, limit = 100): Promise<Subscription[]> {
    const v = await this.simulate(
      this.contract.call(
        "list_active",
        nativeToScVal(start, { type: "u64" }),
        nativeToScVal(limit, { type: "u32" }),
      ),
    );
    const raw = scValToNative(v) as any[];
    return raw.map((s) => ({
      id: BigInt(s.id),
      owner: s.owner,
      asset: decodeAssetKey(s.asset),
      minAmount: BigInt(s.min_amount),
      active: Boolean(s.active),
      createdLedger: Number(s.created_ledger),
    }));
  }

  /**
   * Submit the on-chain attestation for a fired alert. Returns the transaction
   * hash — the artifact. Admin-authed; the contract rejects any other signer.
   */
  async recordTrigger(
    subId: bigint,
    txHash: Buffer,
    amountStroops: bigint,
  ): Promise<string> {
    if (txHash.length !== 32) {
      throw new Error(`tx_hash must be 32 bytes, got ${txHash.length}`);
    }
    const op = this.contract.call(
      "record_trigger",
      nativeToScVal(subId, { type: "u64" }),
      xdr.ScVal.scvBytes(txHash),
      nativeToScVal(amountStroops, { type: "i128" }),
    );

    const account = await this.server.getAccount(this.admin.publicKey());
    const built = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.cfg.networkPassphrase,
    })
      .addOperation(op)
      .setTimeout(TX_TIMEOUT_S)
      .build();

    // prepareTransaction simulates and assembles (footprint + resource fees)
    // in one call.
    const prepared = await this.server.prepareTransaction(built);
    prepared.sign(this.admin);

    const sent = await this.server.sendTransaction(prepared);
    if (sent.status === "ERROR") {
      throw new Error(`sendTransaction failed: ${JSON.stringify(sent.errorResult)}`);
    }
    return this.awaitTx(sent.hash);
  }

  private async awaitTx(hash: string): Promise<string> {
    const deadline = Date.now() + POLL_TIMEOUT_MS;
    for (;;) {
      const got = await this.server.getTransaction(hash);
      if (got.status === rpc.Api.GetTransactionStatus.SUCCESS) return hash;
      if (got.status === rpc.Api.GetTransactionStatus.FAILED) {
        throw new Error(`transaction ${hash} failed on-chain`);
      }
      if (Date.now() > deadline) {
        throw new Error(`timed out awaiting transaction ${hash}`);
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
  }

  private async simulate(op: xdr.Operation): Promise<xdr.ScVal> {
    const account = await this.server.getAccount(this.admin.publicKey());
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.cfg.networkPassphrase,
    })
      .addOperation(op)
      .setTimeout(TX_TIMEOUT_S)
      .build();

    const sim = await this.server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim)) {
      throw new Error(`simulation failed: ${sim.error}`);
    }
    if (!sim.result?.retval) {
      throw new Error("simulation returned no value");
    }
    return sim.result.retval;
  }
}

/**
 * Decode a contract AssetKey enum.
 *
 * Verified against the live testnet contract: scValToNative renders Soroban enum
 * variants as an ARRAY whose head is the variant name — `["Native"]` for the
 * unit variant and `["Issued", code, issuer]` for the tuple variant. It does not
 * produce a bare string or a {tag} object; the object forms below are defensive
 * only, in case a future SDK changes the representation.
 */
function decodeAssetKey(v: any): AssetKeySc {
  if (Array.isArray(v)) {
    if (v[0] === "Native") return { tag: "Native" };
    if (v[0] === "Issued") {
      return { tag: "Issued", code: String(v[1]), issuer: addrToString(v[2]) };
    }
  }
  if (v === "Native" || v?.tag === "Native") return { tag: "Native" };
  if (v?.tag === "Issued") {
    return {
      tag: "Issued",
      code: String(v.values?.[0]),
      issuer: addrToString(v.values?.[1]),
    };
  }
  throw new Error(`unrecognized AssetKey: ${JSON.stringify(v)}`);
}

function addrToString(v: unknown): string {
  if (typeof v === "string") return v;
  if (v instanceof Address) return v.toString();
  return String(v);
}
