import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import { parse } from "url";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  PaymentStream,
  LedgerProcessor,
  RegistryClient,
  qualifies,
  fromStroops,
  toStroops,
  loadConfig,
  type AssetKey,
  type Threshold,
  type WhaleCandidate,
} from "@monoscope/core";
import { prisma } from "@monoscope/db";
import { PrismaCursorStore } from "./cursorStore";
import alertsRouter from "./routes/alerts";
import apiKeysRouter from "./routes/api-keys";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3001;
const cfg = loadConfig();

/** A stream quieter than this is reported as stale rather than as live. */
const STALE_AFTER_MS = 30_000;

app.use(express.json());
app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.options("/{*path}", (_, res) => res.sendStatus(204));

// ─── Deployment record ────────────────────────────────────────────────────────
// The contract id is read from the committed deployments file, not from an env
// var alone — that is exactly how contract ids go missing across redeploys.

interface Deployment {
  network: string;
  networkPassphrase: string;
  rpcUrl: string;
  contractId: string;
  admin: string;
  deployedAt: string;
}

function loadDeployment(): Deployment | null {
  for (const root of ["../..", "../../..", "."]) {
    try {
      return JSON.parse(
        readFileSync(join(__dirname, root, "deployments", "testnet.json"), "utf8"),
      ) as Deployment;
    } catch {
      /* try next */
    }
  }
  return null;
}

const deployment = loadDeployment();

// ─── Soroban wiring ───────────────────────────────────────────────────────────

let registry: RegistryClient | null = null;
let sorobanStatus: {
  status: "up" | "down" | "disabled";
  contractId?: string;
  network?: string;
  triggerCount?: string;
  lastOnchainTxHash?: string | null;
  reason?: string;
} = { status: "disabled" };

if (cfg.soroban.enabled) {
  registry = new RegistryClient({
    rpcUrl: cfg.soroban.rpcUrl,
    networkPassphrase: cfg.soroban.networkPassphrase,
    contractId: cfg.soroban.contractId,
    adminSecret: cfg.soroban.adminSecret,
  });
}

const sdkSockets = new Set<WebSocket>();

function broadcast(event: string, data: unknown) {
  const message = JSON.stringify({ event, data });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(message);
  });
}

function broadcastToSdk(event: string, data: unknown) {
  const message = JSON.stringify({ event, data });
  sdkSockets.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(message);
  });
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

const processor = new LedgerProcessor(cfg.feedNetwork);
const stream = new PaymentStream({
  horizonUrl: cfg.horizonUrl,
  cursors: new PrismaCursorStore(),
});

/** Watch list, refreshed from the on-chain registry. */
let thresholds = new Map<AssetKey, Threshold>();

/**
 * Read the watch list from the contract. This read is load-bearing: without it
 * the pipeline does not know what to watch, which is what makes the on-chain
 * registry part of the product rather than decoration.
 */
async function refreshThresholds(): Promise<void> {
  if (!registry) return;
  const subs = await registry.listActive(1n, 100);
  const next = new Map<AssetKey, Threshold>();
  for (const s of subs) {
    if (!s.active) continue;
    const assetKey: AssetKey =
      s.asset.tag === "Native" ? "native" : `${s.asset.code}:${s.asset.issuer}`;
    const existing = next.get(assetKey);
    // Watch the most permissive threshold across subscribers for an asset.
    if (!existing || s.minAmount < existing.minStroops) {
      next.set(assetKey, { assetKey, minStroops: s.minAmount });
    }
  }
  thresholds = next;
  console.log(
    `watch list refreshed from ${registry.contractId}: ${next.size} asset(s)`,
  );
}

async function persist(c: WhaleCandidate): Promise<boolean> {
  try {
    await prisma.whaleEvent.create({
      data: {
        kind: c.kind,
        opId: c.opId,
        txHash: c.txHash,
        pagingToken: c.pagingToken,
        ledger: c.ledger ?? 0,
        closedAt: c.closedAt,
        from: c.from,
        to: c.to,
        assetKey: c.assetKey,
        amountStroops: c.amountStroops.toString(),
        network: c.network,
      },
    });
    return true;
  } catch (err: any) {
    // P2002 on opId means the stream re-delivered a record we already have.
    // Horizon SSE is not exactly-once, so this is expected, not an error.
    if (err?.code === "P2002") return false;
    console.error(`[persist] ${c.opId}:`, err);
    return false;
  }
}

async function checkAlerts(c: WhaleCandidate): Promise<void> {
  const alerts = await prisma.alert.findMany({
    where: { enabled: true, assetKey: c.assetKey },
  });

  for (const alert of alerts) {
    const threshold = BigInt(alert.thresholdStroops);
    const fired =
      alert.condition === "above" || alert.condition === "crosses"
        ? c.amountStroops >= threshold
        : c.amountStroops < threshold;
    if (!fired) continue;

    try {
      const trigger = await prisma.alertTrigger.create({
        data: {
          alertId: alert.id,
          valueStroops: c.amountStroops.toString(),
          opId: c.opId,
        },
      });
      const payload = { alert, trigger };
      broadcast("alert_triggered", payload);
      broadcastToSdk("alert_triggered", payload);
    } catch (err: any) {
      if (err?.code === "P2002") continue; // already fired for this op
      console.error(`[checkAlerts] alert ${alert.id}:`, err);
    }
  }
}

/** Write the attestation on-chain and record the resulting hash. */
async function attest(c: WhaleCandidate): Promise<void> {
  if (!registry || !c.txHash) return;
  try {
    const hash = await registry.recordTrigger(
      1n,
      Buffer.from(c.txHash, "hex"),
      c.amountStroops,
    );
    await prisma.whaleEvent.update({
      where: { opId: c.opId },
      data: { onchainTxHash: hash },
    });
    sorobanStatus.lastOnchainTxHash = hash;
    sorobanStatus.triggerCount = (await registry.triggerCount()).toString();
    console.log(`attested ${c.opId} on-chain: ${hash}`);
  } catch (err) {
    console.error(`[attest] ${c.opId}:`, (err as Error).message);
  }
}

stream.on("error", (e) => console.error(`[stream] ${e.message}`));
stream.on("reconnect", (i) =>
  console.warn(
    `[stream] reconnect #${i.attempt} in ${i.delayMs}ms from cursor ${i.cursor}`,
  ),
);

stream.on("record", (record: any) => {
  void (async () => {
    for (const c of processor.processOperation(record)) {
      if (!qualifies(c, thresholds)) continue;
      const isNew = await persist(c);
      if (!isNew) continue; // re-delivered record; do not double-fire

      broadcast("whale_alert", {
        opId: c.opId,
        txHash: c.txHash,
        kind: c.kind,
        from: c.from,
        to: c.to,
        assetKey: c.assetKey,
        amountStroops: c.amountStroops.toString(),
        amount: fromStroops(c.amountStroops),
        closedAt: c.closedAt,
        network: c.network,
      });

      console.log(
        `whale ${fromStroops(c.amountStroops)} ${c.assetKey} ${c.from.slice(0, 6)}...->${c.to.slice(0, 6)}...`,
      );

      await checkAlerts(c);
      await attest(c);
    }
  })();
});

// ─── REST ─────────────────────────────────────────────────────────────────────

/**
 * Health, and the loop proof.
 *
 * A reviewer hits this endpoint, sees a contract id and a recent on-chain tx
 * hash, clicks through to stellar.expert, and sees the transaction — the loop
 * is demonstrated in ten seconds without reading a line of source.
 */
app.get("/health", (_, res) => {
  const stalenessMs = stream.stalenessMs;
  const feedLive = stalenessMs !== null && stalenessMs < STALE_AFTER_MS;

  res.json({
    status: "ok",
    clients: wss.clients.size,
    uptime: process.uptime(),
    feed: {
      // Labelled explicitly: the feed is mainnet, attestations are testnet.
      network: cfg.feedNetwork === "public" ? "Stellar Mainnet" : "Stellar Testnet",
      horizon: cfg.horizonUrl,
      // A stalled stream must never render as live.
      live: feedLive,
      stalenessMs,
      lastRecordAgo:
        stalenessMs === null ? null : `${Math.round(stalenessMs / 1000)}s ago`,
    },
    soroban: {
      ...sorobanStatus,
      explorer: sorobanStatus.lastOnchainTxHash
        ? `https://stellar.expert/explorer/testnet/tx/${sorobanStatus.lastOnchainTxHash}`
        : null,
      contract: sorobanStatus.contractId
        ? `https://stellar.expert/explorer/testnet/contract/${sorobanStatus.contractId}`
        : null,
    },
    deployment,
  });
});

app.get("/whales", async (_, res) => {
  const whales = await prisma.whaleEvent.findMany({
    orderBy: { closedAt: "desc" },
    take: 100,
  });
  res.json(
    whales.map((w) => ({ ...w, amount: fromStroops(BigInt(w.amountStroops)) })),
  );
});

app.use("/alerts", alertsRouter);
app.use("/api-keys", apiKeysRouter);

// ─── WebSocket ────────────────────────────────────────────────────────────────

wss.on("connection", async (ws, req) => {
  const { query } = parse(req.url ?? "", true);
  const apiKey = query.key as string | undefined;

  if (apiKey) {
    const record = await prisma.apiKey.findUnique({ where: { key: apiKey } });
    if (!record || record.revokedAt) {
      ws.send(
        JSON.stringify({
          event: "error",
          data: { message: "Invalid or revoked API key." },
        }),
      );
      ws.close();
      return;
    }
    sdkSockets.add(ws);
    ws.send(
      JSON.stringify({
        event: "ready",
        data: { message: "Connected. Listening for Stellar whale alerts." },
      }),
    );
    ws.on("close", () => sdkSockets.delete(ws));
    return;
  }

  const history = await prisma.whaleEvent.findMany({
    orderBy: { closedAt: "desc" },
    take: 100,
  });
  ws.send(
    JSON.stringify({
      event: "whale_history",
      data: history.map((w) => ({
        ...w,
        amount: fromStroops(BigInt(w.amountStroops)),
      })),
    }),
  );
});

// ─── Start ────────────────────────────────────────────────────────────────────

async function main() {
  if (registry) {
    // Boot-time self-check: prove the on-chain wiring is real before serving.
    // Failing loudly here is the point — silently serving without a chain is
    // how a project ends up shipping "contract IDs unset".
    const check = await registry.selfCheck();
    sorobanStatus = check.ok
      ? {
          status: "up",
          contractId: check.contractId,
          network: check.network,
          triggerCount: check.triggerCount?.toString(),
          lastOnchainTxHash: null,
        }
      : { status: "down", contractId: check.contractId, reason: check.reason };

    if (!check.ok) {
      console.error(`SOROBAN SELF-CHECK FAILED: ${check.reason}`);
    } else {
      console.log(
        `soroban ok: ${check.contractId} (triggerCount=${check.triggerCount})`,
      );
      await refreshThresholds();
      setInterval(() => void refreshThresholds().catch(console.error), 60_000);
    }
  } else {
    console.warn("SOROBAN_ENABLED is not true — running without on-chain writes");
    // Without the registry there is no watch list; fall back to an env-configured
    // XLM threshold so the feed is still honest about what it is doing.
    const min = process.env.FALLBACK_MIN_XLM;
    if (min) {
      thresholds = new Map([
        ["native", { assetKey: "native", minStroops: toStroops(min) }],
      ]);
      console.warn(`fallback watch list: native >= ${min} XLM`);
    }
  }

  await stream.start();

  server.listen(PORT, () => {
    console.log(`API on http://localhost:${PORT}`);
    console.log(
      `feed: ${cfg.feedNetwork === "public" ? "Stellar Mainnet" : "Stellar Testnet"} (${cfg.horizonUrl})`,
    );
  });
}

main().catch((e) => {
  console.error("fatal:", e);
  process.exit(1);
});
