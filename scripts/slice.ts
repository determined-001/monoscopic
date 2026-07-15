/**
 * WEEK-1 VERTICAL SLICE — the whole loop, end to end, ugly but real.
 *
 *   live mainnet Horizon payment
 *     -> ledger processor (drops failed txs, splits path-payment legs)
 *     -> per-asset threshold
 *     -> Soroban record_trigger on testnet
 *     -> public tx hash
 *
 * Deliberately honest about what it is: the FEED is mainnet (real whales, always
 * on), the ATTESTATIONS are testnet. Both are labelled everywhere they surface.
 *
 * Run from the repo root:
 *   ADMIN_SECRET=$(stellar keys show monoscope-deployer) \
 *     pnpm --filter @monoscope/core exec tsx ../../scripts/slice.ts [seconds] [minXLM]
 */
import { PaymentStream } from "../packages/core/src/stellar/paymentStream.js";
import { MemoryCursorStore } from "../packages/core/src/stellar/cursorStore.js";
import { LedgerProcessor } from "../packages/core/src/stellar/ledgerProcessor.js";
import { qualifies, type Threshold } from "../packages/core/src/stellar/whaleFilter.js";
import { RegistryClient } from "../packages/core/src/stellar/soroban/registryClient.js";
import { fromStroops, toStroops } from "../packages/core/src/stellar/amount.js";
import type { AssetKey } from "../packages/core/src/stellar/asset.js";

const DURATION_S = Number(process.argv[2] ?? 90);
const MIN_XLM = process.argv[3] ?? "1000";

async function main() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("ADMIN_SECRET is required");

  const thresholds = new Map<AssetKey, Threshold>([
    ["native", { assetKey: "native", minStroops: toStroops(MIN_XLM) }],
  ]);

  const registry = new RegistryClient({
    rpcUrl: "https://soroban-testnet.stellar.org",
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CDJSRSJXLGOVKQOXPZMQJTOHHACVPTI3SNPNG5UUOX2O3WPM4N4DA72E",
    adminSecret: secret,
  });

  const check = await registry.selfCheck();
  if (!check.ok) throw new Error(`soroban selfCheck failed: ${check.reason}`);
  console.log(
    `contract ${check.contractId} ok, triggerCount=${check.triggerCount}`,
  );
  console.log(
    `feed: Stellar Mainnet | attestations: Stellar Testnet | threshold: ${MIN_XLM} XLM\n`,
  );

  const processor = new LedgerProcessor("public");
  const stream = new PaymentStream({
    horizonUrl: "https://horizon.stellar.org",
    cursors: new MemoryCursorStore(),
  });

  const seen = new Set<string>(); // dedupe on opId: delivery is not exactly-once
  let considered = 0;
  let droppedFailed = 0;
  let fired = 0;
  let writing = false;

  stream.on("error", (e) => console.log(`  [stream error] ${e.message}`));
  stream.on("reconnect", (i) =>
    console.log(`  [reconnect] attempt ${i.attempt} in ${i.delayMs}ms from cursor ${i.cursor}`),
  );

  stream.on("record", (record: any) => {
    considered++;
    if (record.transaction_successful === false) droppedFailed++;

    for (const c of processor.processOperation(record)) {
      if (seen.has(c.opId)) continue;
      seen.add(c.opId);
      if (!qualifies(c, thresholds)) continue;

      fired++;
      console.log(
        `WHALE ${fromStroops(c.amountStroops)} XLM  ${c.from.slice(0, 6)}...->${c.to.slice(0, 6)}...  op=${c.opId}`,
      );

      // One attestation for the slice: prove the write path, don't spam the chain.
      if (!writing && c.txHash) {
        writing = true;
        registry
          .recordTrigger(1n, Buffer.from(c.txHash, "hex"), c.amountStroops)
          .then((hash) => {
            console.log(`\n  ATTESTED on-chain: ${hash}`);
            console.log(`  https://stellar.expert/explorer/testnet/tx/${hash}`);
            console.log(`  (attests mainnet tx ${c.txHash})\n`);
          })
          .catch((e) => console.log(`  [record_trigger failed] ${e.message}`));
      }
    }
  });

  await stream.start();
  await new Promise((r) => setTimeout(r, DURATION_S * 1000));
  stream.stop();

  const after = await registry.triggerCount();
  console.log(
    `\n--- ${DURATION_S}s: ${considered} payments seen, ${droppedFailed} failed-tx dropped, ` +
      `${fired} over ${MIN_XLM} XLM, staleness ${stream.stalenessMs}ms`,
  );
  console.log(`--- on-chain triggerCount now ${after}`);
  process.exit(0);
}

main().catch((e) => {
  console.error("slice failed:", e);
  process.exit(1);
});
