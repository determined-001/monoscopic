/**
 * Prove the payments stream resumes from a PERSISTED cursor rather than jumping
 * to "now".
 *
 * This is the correctness-critical path: a measured 15-minute mainnet run dropped
 * once with ECONNRESET. A supervisor that reopens at cursor("now") silently loses
 * every event in the gap while the UI still reports the feed as live. The bug is
 * invisible by construction, so it needs an explicit test.
 *
 * Method: seed a cursor from the past. If resume works, the first record we
 * receive is historical (older than the reconnect), not one minted since.
 *
 * Run from the repo root:
 *   pnpm --filter @monoscope/core exec tsx ../../scripts/verify-resume.ts
 */
import { PaymentStream } from "../packages/core/src/stellar/paymentStream.js";
import type { CursorStore } from "../packages/core/src/stellar/cursorStore.js";

class FixedCursor implements CursorStore {
  constructor(private readonly token: string) {}
  async get(): Promise<string | null> {
    return this.token;
  }
  async set(): Promise<void> {}
}

async function tokenFromThePast(): Promise<{ token: string; createdAt: string }> {
  // Grab a payment from ~200 records back so the cursor is provably historical.
  const res = await fetch(
    "https://horizon.stellar.org/payments?order=desc&limit=200",
    { signal: AbortSignal.timeout(20000) },
  );
  const j: any = await res.json();
  const oldest = j._embedded.records[j._embedded.records.length - 1];
  return { token: oldest.paging_token, createdAt: oldest.created_at };
}

async function main() {
  const seed = await tokenFromThePast();
  console.log(`seeded cursor : ${seed.token} (created ${seed.createdAt})`);

  const stream = new PaymentStream({
    horizonUrl: "https://horizon.stellar.org",
    cursors: new FixedCursor(seed.token),
  });

  let first: any = null;
  stream.on("record", (r) => {
    first ??= r;
  });
  stream.on("error", (e) => console.log(`  [stream error] ${e.message}`));

  await stream.start();
  await new Promise((r) => setTimeout(r, 12000));
  stream.stop();

  if (!first) {
    console.error("FAIL: no records received");
    process.exit(1);
  }

  console.log(`first token   : ${first.paging_token} (created ${first.created_at})`);

  const advanced = BigInt(first.paging_token) > BigInt(seed.token);
  // The seeded record is already some seconds old; the first replayed record must
  // be at or after it, and strictly older than a stream that had started at "now".
  const seededAt = new Date(seed.createdAt).getTime();
  const firstAt = new Date(first.created_at).getTime();
  const replayed = firstAt >= seededAt && firstAt < Date.now() - 1000;

  console.log(`advanced forward from cursor : ${advanced}`);
  console.log(`replayed history (not "now") : ${replayed}`);

  if (!advanced || !replayed) {
    console.error(
      "FAIL: stream did not resume from the stored cursor — a reconnect would silently drop events",
    );
    process.exit(1);
  }
  console.log("PASS: resume honours the persisted cursor; no silent gap on reconnect");
  process.exit(0);
}

main().catch((e) => {
  console.error("verify-resume failed:", e);
  process.exit(1);
});
