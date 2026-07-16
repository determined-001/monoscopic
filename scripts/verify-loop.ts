/**
 * Prove the loop end-to-end against the live testnet contract.
 *
 * This is the band-B gate rehearsed exactly as a reviewer would check it:
 * read the registry, submit a real attestation, confirm the counter moved, and
 * print an explorer link to the resulting transaction.
 *
 * Run from the repo root:
 *   ADMIN_SECRET=$(stellar keys show monoscope-deployer) \
 *     pnpm --filter @monoscope/core exec tsx ../../scripts/verify-loop.ts
 */
import { randomBytes } from "node:crypto";
import { RegistryClient } from "../packages/core/src/stellar/soroban/registryClient.js";

const j = (v: unknown) =>
  JSON.stringify(v, (_, x) => (typeof x === "bigint" ? x.toString() : x), 2);

async function main() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("ADMIN_SECRET is required");

  const client = new RegistryClient({
    rpcUrl: "https://soroban-testnet.stellar.org",
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CDJSRSJXLGOVKQOXPZMQJTOHHACVPTI3SNPNG5UUOX2O3WPM4N4DA72E",
    adminSecret: secret,
  });

  console.log("1. selfCheck (boot-time proof of on-chain wiring)");
  console.log(j(await client.selfCheck()));

  console.log("\n2. listActive (the READ the pipeline depends on)");
  console.log(j(await client.listActive(1n, 10)));

  console.log("\n3. recordTrigger (the WRITE — the public artifact)");
  const before = await client.triggerCount();
  const hash = await client.recordTrigger(1n, randomBytes(32), 250_0000000n);
  const after = await client.triggerCount();

  console.log(`   tx hash      : ${hash}`);
  console.log(`   triggerCount : ${before} -> ${after}`);
  console.log(
    `   explorer     : https://stellar.expert/explorer/testnet/tx/${hash}`,
  );

  if (after !== before + 1n) {
    throw new Error(`triggerCount did not advance: ${before} -> ${after}`);
  }
  console.log("\nLOOP VERIFIED: read + write both real, on-chain.");
}

main().catch((e) => {
  console.error("verify-loop FAILED:", e);
  process.exit(1);
});
