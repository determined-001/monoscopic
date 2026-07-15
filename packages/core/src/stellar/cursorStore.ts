/**
 * Cursor persistence for Horizon streams.
 *
 * Horizon `paging_token`s are OPAQUE. Trade tokens are composite ("12345-0"),
 * so `Number(token)` is NaN and numeric comparison is meaningless. Store and
 * return them verbatim; never parse, never order arithmetically.
 *
 * Why this exists at all: a 15-minute measured run of the mainnet payments
 * stream dropped once with ECONNRESET. A supervisor that reconnects with
 * cursor("now") silently loses every event between the drop and the reopen —
 * an invisible hole in a feed that still claims to be live. Resuming from the
 * last persisted token is the difference between a gap and a gap you never see.
 */

export interface CursorStore {
  get(stream: string): Promise<string | null>;
  set(stream: string, pagingToken: string): Promise<void>;
}

/** In-memory store — for tests and the local spike only; loses the cursor on restart. */
export class MemoryCursorStore implements CursorStore {
  private readonly cursors = new Map<string, string>();

  async get(stream: string): Promise<string | null> {
    return this.cursors.get(stream) ?? null;
  }

  async set(stream: string, pagingToken: string): Promise<void> {
    this.cursors.set(stream, pagingToken);
  }
}
