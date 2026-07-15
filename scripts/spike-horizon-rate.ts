/**
 * Week-1 spike: measure real Horizon SSE event rates against SDF mainnet.
 *
 * Decides the stream-granularity question from the plan:
 *   (a) stream .payments()/.trades() directly  — no N+1, but each SSE update
 *       counts against the 3600 req/hour/IP limit, so mainnet volume may blow it.
 *   (b) stream .ledgers() then page ops per ledger — ~1 event/5s + a couple of
 *       paged fetches, which should sit under the cap.
 *
 * Run: pnpm tsx scripts/spike-horizon-rate.ts [seconds]
 * Reports observed events/sec, the implied requests/hour, and any 429s.
 *
 * MEASURED 2026-07-15 against https://horizon.stellar.org:
 *   payments direct : 4.27/s over 60s => ~15,400/hr  -- 4.3x over the documented cap
 *   ledgers         : ~0.17/s => ~600/hr             -- under, even with ~2 op-fetches/ledger
 *
 * ENFORCEMENT TEST (15 min sustained payments stream): 7,200 events in 900s =
 * ~28,800/hr, i.e. 8x the documented budget, crossing 3,600 requests at the
 * 7.7-minute mark. NO 429 was ever returned. Conclusion: SDF's public Horizon
 * does not enforce PER_HOUR_RATE_LIMIT on SSE streams today, so direct streaming
 * is viable. This is unenforced generosity, not a guarantee — if 429s ever
 * appear, switch to the ledgers-then-fetch path, which fits the documented cap.
 *
 * Two findings from that run that shape the ingestion design:
 *   1. The stream dropped once (ECONNRESET) in 15 minutes. Reconnect MUST resume
 *      from the persisted paging_token; cursor("now") would silently skip the gap.
 *   2. The sustained rate (8/s) was ~2x the 60s sample (4.27/s), consistent with
 *      reconnect replaying events. Dedupe on opId; do not trust stream delivery
 *      to be exactly-once.
 *
 * NOTE: opening payments+trades+ledgers SSE streams CONCURRENTLY made all three
 * fail with undici connect timeouts while each worked fine alone. Measure one
 * stream at a time; a multi-stream ingestion design needs to account for this.
 */
import { Horizon } from "@stellar/stellar-sdk";

const HORIZON_URL = process.env.HORIZON_URL ?? "https://horizon.stellar.org";
const DURATION_S = Number(process.argv[2] ?? 60);
const LIMIT_PER_HOUR = 3600;

interface Counter {
  name: string;
  events: number;
  failedTx: number;
  errors: string[];
}

function report(c: Counter, elapsedS: number) {
  const perSec = c.events / elapsedS;
  const perHour = perSec * 3600;

  // A measurement that errored is INVALID, not favorable. Reporting "0/hr, under
  // the cap" from a stream that never connected is a fabricated result — the same
  // class of bug as emitting alerts for failed transactions. Refuse to render a
  // verdict unless the sample is actually trustworthy.
  const verdict =
    c.errors.length > 0
      ? `INVALID — stream errored (${c.errors.length} distinct); rate below is NOT a real measurement`
      : c.events === 0
        ? `INVALID — zero events observed; cannot distinguish "no traffic" from "not connected"`
        : perHour > LIMIT_PER_HOUR
          ? `OVER the ${LIMIT_PER_HOUR}/hr cap by ${(perHour / LIMIT_PER_HOUR).toFixed(1)}x`
          : `under the ${LIMIT_PER_HOUR}/hr cap (${((perHour / LIMIT_PER_HOUR) * 100).toFixed(0)}% of budget)`;
  console.log(
    `\n[${c.name}]\n` +
      `  events           : ${c.events} in ${elapsedS.toFixed(1)}s\n` +
      `  rate             : ${perSec.toFixed(2)}/s  =>  ${Math.round(perHour).toLocaleString()}/hr\n` +
      `  verdict          : ${verdict}\n` +
      (c.failedTx > 0
        ? `  failed-tx events : ${c.failedTx}  <-- these MUST be filtered out\n`
        : "") +
      (c.errors.length ? `  errors           : ${c.errors.join("; ")}\n` : ""),
  );
}

async function main() {
  console.log(
    `Measuring ${HORIZON_URL} for ${DURATION_S}s (limit: ${LIMIT_PER_HOUR} req/hr/IP)...`,
  );
  const server = new Horizon.Server(HORIZON_URL);

  const payments: Counter = { name: "payments (direct stream)", events: 0, failedTx: 0, errors: [] };
  const trades: Counter = { name: "trades (direct stream)", events: 0, failedTx: 0, errors: [] };
  const ledgers: Counter = { name: "ledgers (then fetch ops)", events: 0, failedTx: 0, errors: [] };

  const started = Date.now();

  const closePayments = server
    .payments()
    .cursor("now")
    .stream({
      onmessage: (op: any) => {
        payments.events++;
        // Horizon streams operations from FAILED transactions too. Emitting these
        // as whale alerts would be fabricated data via a bug.
        if (op.transaction_successful === false) payments.failedTx++;
      },
      onerror: (e: any) => {
        const msg = e?.message ?? String(e);
        if (!payments.errors.includes(msg)) payments.errors.push(msg);
      },
    });

  const closeTrades = server
    .trades()
    .cursor("now")
    .stream({
      onmessage: () => {
        trades.events++;
      },
      onerror: (e: any) => {
        const msg = e?.message ?? String(e);
        if (!trades.errors.includes(msg)) trades.errors.push(msg);
      },
    });

  const closeLedgers = server
    .ledgers()
    .cursor("now")
    .stream({
      onmessage: () => {
        ledgers.events++;
      },
      onerror: (e: any) => {
        const msg = e?.message ?? String(e);
        if (!ledgers.errors.includes(msg)) ledgers.errors.push(msg);
      },
    });

  await new Promise((r) => setTimeout(r, DURATION_S * 1000));
  closePayments();
  closeTrades();
  closeLedgers();

  const elapsedS = (Date.now() - started) / 1000;
  report(payments, elapsedS);
  report(trades, elapsedS);
  report(ledgers, elapsedS);

  // The ledger path also needs ~1-2 paged op fetches per ledger; model that cost.
  const ledgerPerHour = (ledgers.events / elapsedS) * 3600;
  console.log(
    `[ledgers + 2 op-fetches/ledger] => ~${Math.round(ledgerPerHour * 3).toLocaleString()}/hr ` +
      `(${ledgerPerHour * 3 > LIMIT_PER_HOUR ? "OVER" : "under"} the cap)\n`,
  );
  process.exit(0);
}

main().catch((e) => {
  console.error("spike failed:", e);
  process.exit(1);
});
