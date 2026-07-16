# MAINTAINER — Stellar Port TODO

Goal: port Monoscope (Monad/EVM trading analytics) to Stellar and enter the Drips Wave program.
Strategy: enter early and honest — real Horizon streaming with few commits beats a polished mock.
Never ship fabricated demo data; that causes rejection plus a permanent credibility penalty.

Target progression: first wave band C ($45) → close the loop (live contract + live surface) → band B ($200).

---

## Phase 0 — Decisions (before writing code)

- [ ] Name the one-sentence novel wedge. Draft: *"Real-time whale/flow analytics and alerting for the Stellar DEX and Soroban, with a public SDK."* Verify nothing in the Stellar ecosystem already does this; adjust the wedge if it does.
- [ ] Keep ONE repo. Port inside this repo (or a clean fork), do not spawn a second "stellar-monoscope" repo.
- [ ] Decide testnet-first: all demo data must be real testnet/mainnet data, labeled as such.
- [ ] Check the next wave entry date. If the first Horizon-streaming capability is <2 weeks from done, finish it BEFORE the wave starts — entering one band higher compounds every wave after.

## Phase 1 — Core ingestion: replace EVM pipeline with Stellar (`packages/core`)

This is the "Real" acceptance gate. Nothing else matters until this works.

- [ ] Replace `packages/core/src/chain/blockListener.ts` (JSON-RPC `eth_getBlockByNumber` / `eth_getLogs` polling against `MONAD_RPC_URL`) with Horizon streaming:
  - [ ] Add `@stellar/stellar-sdk` dependency; remove `viem`.
  - [ ] Stream ledgers via Horizon SSE (`/ledgers?cursor=now`) or `stellar-sdk` `.stream()`.
  - [ ] Stream operations/effects for payments, path payments, and DEX trades (`/trades`, `/operations`).
  - [ ] Env var: `HORIZON_URL` (default `https://horizon-testnet.stellar.org`), plus `SOROBAN_RPC_URL` for later phases.
- [ ] Rewrite `blockProcessor.ts` → ledger processor:
  - [ ] Map EVM block/tx/log model to Stellar ledger/transaction/operation model.
  - [ ] Extract transfers from `payment`, `path_payment_strict_send/receive`, and DEX trade effects (native XLM + issued assets replace native/ERC-20 split).
- [ ] Rewrite `whaleTracker.ts` thresholds for Stellar:
  - [ ] Native threshold in stroops (7 decimals, not 18-decimal wei).
  - [ ] Per-asset thresholds keyed by `asset_code:issuer` instead of ERC-20 contract address.
- [ ] Update `packages/types` (`trade.ts`, `wallet.ts`, `alert.ts`): tx hash formats, `G...` account addresses, asset code+issuer pairs, ledger sequence instead of block number.
- [ ] Update `packages/db/prisma/schema.prisma`: `Block` → `Ledger` (sequence, hash, closedAt, txCount, opCount), `WhaleAlert` fields for asset code/issuer; migrate.
- [ ] Verify end-to-end: run listener against testnet Horizon, see real whale alerts logged from live data.

## Phase 2 — API + dashboard on real Stellar data (`apps/api`, `apps/dashboard`)

- [ ] Point `apps/api/src/server.ts` (Express + WebSocket) at the new Stellar pipeline; keep the alerts/api-keys routes.
- [ ] Purge every mock in the dashboard: `components/landing/hero.tsx` and `components/landing/how-it-works.tsx` contain mock/fake data references — replace with real testnet data or label clearly as testnet. **This is the fatal anti-pattern; audit before anything goes public.**
- [ ] Update all Monad branding/copy ("Professional trading infrastructure for Monad") to Stellar.
- [ ] Deploy the dashboard to a public URL (Vercel/Render) fed by live testnet data. A URL a stranger can use today = the "surface" half of the loop gate.

## Phase 3 — Soroban depth (the other half of the loop gate — this is what moves $45 → $200)

- [ ] Write and deploy a Soroban contract the product ACTUALLY CALLS (testnet is fine). Candidate: on-chain alert-subscription registry — users register whale-alert subscriptions (threshold, asset) on-chain; the pipeline reads the registry and pushes alerts. Alternative: an on-chain reputation/score record for tracked whale accounts.
- [ ] Wire the dashboard/API to invoke the contract for real (no mocks, no unset contract IDs — a repo was held at $45 for exactly "contract IDs unset").
- [ ] Add contract tests (`cargo test`) and deployment scripts.
- [ ] Rule of thumb: contracts that exist but aren't called by the product don't count; markdown specs count for exactly zero.

## Phase 4 — SDK + hardening (band B → A material, only after loop is closed)

- [ ] Rewrite `packages/sdk` for the Stellar API; publish to npm (public, installable — a published SDK is a valid live surface).
- [ ] Add real tests to core (ledger processor, whale thresholds) — CI workflows without tests are worthless for scoring.
- [ ] Consider SEP integrations for protocol depth (e.g., SEP-10 auth for the API's user accounts instead of raw API keys). SEPs are one path to depth, not mandatory.
- [ ] Grant framing docs: proposal with budget buckets + milestones. Write these in the SAME wave you ship capability — never as a wave's only deliverable.

---

## Timing rules (do not violate)

1. Judged at wave ENTRY. Capability finished one day late is invisible for ~a month. Ship categorical features BEFORE entry, docs after.
2. Band changes lag ≥1 wave even when timed right. Budget two waves before concluding failure.
3. One categorical action per wave beats five polish tasks.

## Explicitly NOT worth doing early

- Docs/README blitzes, CI workflow theater, UI polish beyond honesty, multi-repo splits, growing contributor count for its own sake. None of these have ever moved a payout band.
