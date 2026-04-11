const HTTP_RPC = process.env.MONAD_RPC_URL ?? "https://monad-mainnet.drpc.org";

// ERC-20 Transfer(address indexed from, address indexed to, uint256 value)
const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

async function rpc(id: number, method: string, params: unknown[]) {
  const res = await fetch(HTTP_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
    signal: AbortSignal.timeout(8000),
  });
  const data = (await res.json()) as { result: unknown };
  return data.result;
}

export function createBlockListener(
  onBlock: (block: any, logs: any[]) => void,
) {
  let lastBlockNumber: string | null = null;
  let stopped = false;

  async function poll() {
    if (stopped) return;
    try {
      const block = (await rpc(1, "eth_getBlockByNumber", [
        "latest",
        true,
      ])) as any;

      if (block && block.number !== lastBlockNumber) {
        lastBlockNumber = block.number;

        // Fetch all ERC-20 Transfer logs for this block in parallel
        const logs = (await rpc(2, "eth_getLogs", [
          {
            fromBlock: block.number,
            toBlock: block.number,
            topics: [TRANSFER_TOPIC],
          },
        ])) as any[];

        onBlock(block, logs ?? []);
      }
    } catch (err) {
      console.error("[BlockListener] Poll error:", err);
    }
    setTimeout(poll, 500);
  }

  console.log("[BlockListener] Starting HTTP polling for Monad blocks...");
  poll();

  return { unwatch: () => { stopped = true; } };
}
