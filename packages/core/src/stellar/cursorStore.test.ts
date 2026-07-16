import { describe, it, expect } from "vitest";
import { MemoryCursorStore } from "./cursorStore.js";
import trade from "./__fixtures__/trade.json";
import paymentNative from "./__fixtures__/payment-native.json";

describe("MemoryCursorStore", () => {
  it("returns null for an unknown stream (cold start)", async () => {
    const s = new MemoryCursorStore();
    expect(await s.get("payments")).toBeNull();
  });

  it("stores and restores a paging token verbatim", async () => {
    const s = new MemoryCursorStore();
    await s.set("payments", paymentNative.paging_token);
    expect(await s.get("payments")).toBe(paymentNative.paging_token);
  });

  it("preserves a composite trade token exactly", async () => {
    // Real trade tokens look like "272658250666237961-0". Anything that round-trips
    // them through Number() or a numeric column corrupts them into NaN.
    const s = new MemoryCursorStore();
    expect(trade.paging_token).toContain("-");
    expect(Number(trade.paging_token)).toBeNaN();

    await s.set("trades", trade.paging_token);
    const got = await s.get("trades");
    expect(got).toBe(trade.paging_token);
    expect(got).toBe("272658250666237961-0");
  });

  it("keeps streams independent", async () => {
    const s = new MemoryCursorStore();
    await s.set("payments", "111");
    await s.set("trades", "222-0");
    expect(await s.get("payments")).toBe("111");
    expect(await s.get("trades")).toBe("222-0");
  });

  it("overwrites on advance", async () => {
    const s = new MemoryCursorStore();
    await s.set("payments", "111");
    await s.set("payments", "112");
    expect(await s.get("payments")).toBe("112");
  });
});
