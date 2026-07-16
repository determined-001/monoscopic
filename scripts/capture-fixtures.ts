/**
 * Capture real Horizon records once and commit them as test fixtures.
 *
 * Tests must run against real Horizon shapes, not hand-written approximations —
 * the whole class of bugs we care about (decimal strings, path payment
 * source-vs-dest, failed transactions) lives in the details of the real payload.
 *
 * Run from the repo root:
 *   pnpm --filter @monoscope/core exec tsx ../../scripts/capture-fixtures.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const HORIZON = process.env.HORIZON_URL ?? "https://horizon.stellar.org";

// tsx may load this as CJS, where import.meta.dirname is undefined. Resolve the
// output directory from the repo root instead, located by walking up from cwd.
function repoRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 5; i++) {
    try {
      // pnpm-workspace.yaml only exists at the monorepo root.
      require("node:fs").accessSync(join(dir, "pnpm-workspace.yaml"));
      return dir;
    } catch {
      dir = resolve(dir, "..");
    }
  }
  throw new Error(`could not locate repo root from ${process.cwd()}`);
}

const OUT_DIR = join(
  repoRoot(),
  "packages",
  "core",
  "src",
  "stellar",
  "__fixtures__",
);

async function get(path: string): Promise<any> {
  const res = await fetch(`${HORIZON}${path}`, {
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

function save(name: string, data: unknown) {
  const file = join(OUT_DIR, `${name}.json`);
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  console.log(`saved ${name}.json`);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  // Native XLM payments.
  const payments = await get("/payments?order=desc&limit=200");
  const records: any[] = payments._embedded.records;

  const nativePayment = records.find(
    (r) => r.type === "payment" && r.asset_type === "native",
  );
  if (nativePayment) save("payment-native", nativePayment);

  const issuedPayment = records.find(
    (r) => r.type === "payment" && r.asset_type !== "native",
  );
  if (issuedPayment) save("payment-issued", issuedPayment);

  const pathPayment = records.find((r) =>
    r.type.startsWith("path_payment_strict"),
  );
  if (pathPayment) save("path-payment", pathPayment);

  const createAccount = records.find((r) => r.type === "create_account");
  if (createAccount) save("create-account", createAccount);

  // A FAILED transaction's operation. Horizon streams these too; emitting them
  // as whale alerts would be fabricated data via a bug rather than via copy.
  const failed = await get(
    "/operations?order=desc&limit=200&include_failed=true",
  );
  const failedOp = failed._embedded.records.find(
    (r: any) => r.transaction_successful === false,
  );
  if (failedOp) save("operation-failed", failedOp);
  else console.warn("!! no failed operation found in the last 200 — retry later");

  // DEX trades.
  const trades = await get("/trades?order=desc&limit=50");
  const trade = trades._embedded.records[0];
  if (trade) save("trade", trade);

  console.log(`\nfixtures written to ${OUT_DIR}`);
}

main().catch((e) => {
  console.error("capture failed:", e);
  process.exit(1);
});
