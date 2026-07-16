import { EventEmitter } from "node:events";
import { Horizon } from "@stellar/stellar-sdk";
import type { CursorStore } from "./cursorStore.js";

/**
 * Supervised Horizon payments SSE stream.
 *
 * Owns its own reconnect rather than trusting the SDK's, because the reconnect
 * policy is the correctness-critical part:
 *
 *  - Resume from the PERSISTED paging_token, not cursor("now"). A measured
 *    15-minute run dropped once (ECONNRESET); reopening at "now" would silently
 *    skip everything in the gap while the UI still says "live".
 *  - cursor("now") is used only on a genuine cold start with no stored cursor.
 *  - Exponential backoff with jitter, so a Horizon blip doesn't turn into a
 *    reconnect storm from every instance at once.
 *  - Delivery is NOT exactly-once: the same run delivered ~2x the short-sample
 *    rate, consistent with replay after reconnect. Consumers must dedupe on the
 *    operation id; this class does not pretend otherwise.
 */

export interface PaymentStreamOptions {
  horizonUrl: string;
  cursors: CursorStore;
  streamName?: string;
  baseBackoffMs?: number;
  maxBackoffMs?: number;
}

export declare interface PaymentStream {
  on(event: "record", listener: (record: any) => void): this;
  on(event: "error", listener: (err: Error) => void): this;
  on(event: "reconnect", listener: (info: { attempt: number; delayMs: number; cursor: string }) => void): this;
  on(event: string, listener: (...args: any[]) => void): this;
}

export class PaymentStream extends EventEmitter {
  private readonly server: Horizon.Server;
  private readonly name: string;
  private readonly baseBackoffMs: number;
  private readonly maxBackoffMs: number;

  private close: (() => void) | null = null;
  private stopped = false;
  private attempt = 0;
  /** Timestamp of the most recent record, for freshness reporting. */
  private lastRecordAt: Date | null = null;

  constructor(private readonly opts: PaymentStreamOptions) {
    super();
    this.server = new Horizon.Server(opts.horizonUrl);
    this.name = opts.streamName ?? "payments";
    this.baseBackoffMs = opts.baseBackoffMs ?? 500;
    this.maxBackoffMs = opts.maxBackoffMs ?? 30_000;
  }

  /** Age of the newest record in ms, or null if nothing has arrived yet.
   *  A stalled stream that still renders as "live" is fabrication by omission. */
  get stalenessMs(): number | null {
    return this.lastRecordAt ? Date.now() - this.lastRecordAt.getTime() : null;
  }

  async start(): Promise<void> {
    this.stopped = false;
    await this.open();
  }

  stop(): void {
    this.stopped = true;
    this.close?.();
    this.close = null;
  }

  private async open(): Promise<void> {
    if (this.stopped) return;

    const stored = await this.opts.cursors.get(this.name);
    const cursor = stored ?? "now";

    this.close = this.server
      .payments()
      .cursor(cursor)
      .stream({
        onmessage: (record: any) => {
          this.attempt = 0; // a delivered record proves the connection is healthy
          this.lastRecordAt = new Date();
          void this.opts.cursors
            .set(this.name, record.paging_token)
            .catch((e) => this.emit("error", e as Error));
          this.emit("record", record);
        },
        onerror: (err: any) => {
          this.emit(
            "error",
            err instanceof Error ? err : new Error(String(err?.message ?? err)),
          );
          void this.reconnect(cursor);
        },
      });
  }

  private async reconnect(cursor: string): Promise<void> {
    if (this.stopped) return;
    this.close?.();
    this.close = null;

    this.attempt += 1;
    const backoff = Math.min(
      this.baseBackoffMs * 2 ** (this.attempt - 1),
      this.maxBackoffMs,
    );
    // Full jitter: without it, every instance retries in lockstep after an outage.
    const delayMs = Math.floor(Math.random() * backoff);
    this.emit("reconnect", { attempt: this.attempt, delayMs, cursor });

    await new Promise((r) => setTimeout(r, delayMs));
    await this.open();
  }
}
