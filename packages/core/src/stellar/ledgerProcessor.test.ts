import { describe, it, expect } from "vitest";
import { LedgerProcessor } from "./ledgerProcessor.js";
import { toStroops } from "./amount.js";

// Real Horizon records, captured from https://horizon.stellar.org on 2026-07-15
// by scripts/capture-fixtures.ts. Hand-written approximations would not exercise
// the details these tests exist to pin (decimal strings, path payment
// source-vs-dest, failed transactions, liquidity-pool trades).
import paymentNative from "./__fixtures__/payment-native.json" with { type: "json" };
import paymentIssued from "./__fixtures__/payment-issued.json" with { type: "json" };
import pathPayment from "./__fixtures__/path-payment.json" with { type: "json" };
import operationFailed from "./__fixtures__/operation-failed.json" with { type: "json" };
import trade from "./__fixtures__/trade.json" with { type: "json" };

const proc = new LedgerProcessor("public");

describe("processOperation — failed transactions", () => {
  it("IGNORES an operation from a failed transaction", () => {
    // The fixture is a real, entirely ordinary-looking 800.0000000 payment whose
    // transaction FAILED. Horizon streams it anyway. Emitting it would put money
    // that never moved onto a live 'whale alert' feed — fabricated data via a bug.
    expect(operationFailed.transaction_successful).toBe(false);
    expect(operationFailed.type).toBe("payment");
    expect(operationFailed.amount).toBe("800.0000000");

    expect(proc.processOperation(operationFailed as never)).toEqual([]);
  });

  it("emits the same record once its transaction is marked successful", () => {
    // Proves the rejection above is due to transaction_successful and nothing else.
    const succeeded = { ...operationFailed, transaction_successful: true };
    const out = proc.processOperation(succeeded as never);
    expect(out).toHaveLength(1);
    expect(out[0]!.amountStroops).toBe(toStroops("800.0000000"));
  });
});

describe("processOperation — payments", () => {
  it("maps a native payment", () => {
    const out = proc.processOperation(paymentNative as never);
    expect(out).toHaveLength(1);
    const c = out[0]!;
    expect(c.kind).toBe("payment");
    expect(c.assetKey).toBe("native");
    expect(c.amountStroops).toBe(toStroops(paymentNative.amount));
    expect(c.from).toBe(paymentNative.from);
    expect(c.to).toBe(paymentNative.to);
    expect(c.txHash).toBe(paymentNative.transaction_hash);
    expect(c.opId).toBe(paymentNative.id);
    expect(c.network).toBe("public");
  });

  it("maps an issued payment to CODE:ISSUER", () => {
    const out = proc.processOperation(paymentIssued as never);
    expect(out).toHaveLength(1);
    expect(out[0]!.assetKey).toBe(
      `${paymentIssued.asset_code}:${paymentIssued.asset_issuer}`,
    );
  });

  it("uses the operation id, not the transaction hash, as the natural key", () => {
    // One Stellar transaction can carry up to 100 operations. Keying on txHash
    // (as the old schema's `txHash @unique` did) silently drops all but one.
    const a = { ...paymentNative, id: "1", paging_token: "1" };
    const b = { ...paymentNative, id: "2", paging_token: "2" };
    const ids = [
      ...proc.processOperation(a as never),
      ...proc.processOperation(b as never),
    ].map((c) => c.opId);
    expect(new Set(ids).size).toBe(2);
    expect(a.transaction_hash).toBe(b.transaction_hash); // same tx, two ops
  });
});

describe("processOperation — path payments", () => {
  it("keeps source and destination assets/amounts on their own legs", () => {
    // The real fixture sends 0.0003681 XLM and delivers 29,169,828.0998436 NABU.
    // Pairing the source ASSET with the destination AMOUNT would report a
    // ~29-million-XLM movement: wrong by eight orders of magnitude.
    expect(pathPayment.source_asset_type).toBe("native");
    expect(pathPayment.source_amount).toBe("0.0003681");
    expect(pathPayment.asset_code).toBe("NABU");
    expect(pathPayment.amount).toBe("29169828.0998436");

    const out = proc.processOperation(pathPayment as never);
    expect(out).toHaveLength(2);

    const send = out.find((c) => c.opId.endsWith(":send"))!;
    const recv = out.find((c) => c.opId.endsWith(":recv"))!;

    expect(send.assetKey).toBe("native");
    expect(send.amountStroops).toBe(toStroops("0.0003681"));

    expect(recv.assetKey).toBe(
      `NABU:${pathPayment.asset_issuer}`,
    );
    expect(recv.amountStroops).toBe(toStroops("29169828.0998436"));

    // The decisive assertion: the tiny XLM leg must never carry the huge amount.
    // 0.0003681 XLM is 3,681 stroops; the NABU leg is ~291.7 trillion stroops —
    // about eight orders of magnitude apart. Swapping them is the classic bug.
    expect(send.amountStroops).toBe(3681n);
    expect(recv.amountStroops).toBe(291698280998436n);
    expect(recv.amountStroops / send.amountStroops).toBeGreaterThan(10n ** 10n);
  });

  it("gives each leg a distinct natural key", () => {
    const out = proc.processOperation(pathPayment as never);
    expect(new Set(out.map((c) => c.opId)).size).toBe(2);
  });
});

describe("processTrade", () => {
  it("maps both legs of a liquidity-pool trade", () => {
    const out = proc.processTrade(trade as never);
    expect(out).toHaveLength(2);

    const base = out.find((c) => c.opId.endsWith(":base"))!;
    const counter = out.find((c) => c.opId.endsWith(":counter"))!;

    expect(base.assetKey).toBe(`NABU:${trade.base_asset_issuer}`);
    expect(base.amountStroops).toBe(toStroops(trade.base_amount));
    expect(counter.assetKey).toBe("native");
    expect(counter.amountStroops).toBe(toStroops(trade.counter_amount));
  });

  it("represents a liquidity pool counterparty as pool:<id>", () => {
    // trade_type "liquidity_pool" has NO base_account — only a pool id. Assuming
    // an account field exists would produce undefined parties.
    expect(trade.base_account).toBeUndefined();
    const out = proc.processTrade(trade as never);
    const party = trade.base_is_seller ? out[0]!.from : out[0]!.to;
    expect(party).toBe(`pool:${trade.base_liquidity_pool_id}`);
    for (const c of out) {
      expect(c.from).toBeDefined();
      expect(c.to).toBeDefined();
    }
  });

  it("preserves the composite paging token verbatim", () => {
    // Trade tokens look like "272658250666237961-0"; Number(...) is NaN.
    expect(trade.paging_token).toContain("-");
    const out = proc.processTrade(trade as never);
    expect(out[0]!.pagingToken).toBe(trade.paging_token);
    expect(Number(trade.paging_token)).toBeNaN();
  });

  it("reports no transaction hash for trades", () => {
    // Horizon trade records genuinely do not carry one; claiming otherwise
    // would mean inventing it.
    const out = proc.processTrade(trade as never);
    expect(out.every((c) => c.txHash === null)).toBe(true);
  });
});

describe("processOperation — robustness", () => {
  it("ignores operation types that move no value", () => {
    expect(
      proc.processOperation({
        id: "1",
        paging_token: "1",
        type: "manage_data",
        created_at: "2026-07-15T05:02:03Z",
      } as never),
    ).toEqual([]);
  });

  it("does not throw on a malformed record missing its fields", () => {
    expect(() =>
      proc.processOperation({
        id: "1",
        paging_token: "1",
        type: "payment",
        created_at: "2026-07-15T05:02:03Z",
      } as never),
    ).not.toThrow();
    expect(
      proc.processOperation({
        id: "1",
        paging_token: "1",
        type: "payment",
        created_at: "2026-07-15T05:02:03Z",
      } as never),
    ).toEqual([]);
  });
});
