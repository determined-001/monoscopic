import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import { parse } from "url";
import {
  createBlockListener,
  blockProcessor,
  whaleTracker,
} from "@monoscope/core";
import { prisma } from "@monoscope/db";
import alertsRouter from "./routes/alerts";
import apiKeysRouter from "./routes/api-keys";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.options("/{*path}", (_, res) => res.sendStatus(204));

// ─── Authenticated socket registry ───────────────────────────────────────────
// Tracks which open sockets have a valid API key. Only these receive
// alert_triggered events — the dashboard uses the same WS but without a key.

const sdkSockets = new Set<WebSocket>();

// ─── Broadcast ────────────────────────────────────────────────────────────────

function broadcast(event: string, data: unknown) {
  const message = JSON.stringify({ event, data });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function broadcastToSdk(event: string, data: unknown) {
  const message = JSON.stringify({ event, data });
  sdkSockets.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// ─── REST endpoints ───────────────────────────────────────────────────────────

app.get("/health", (_, res) => {
  res.json({ status: "ok", clients: wss.clients.size, uptime: process.uptime() });
});

app.get("/whales", async (_, res) => {
  const whales = await prisma.whaleAlert.findMany({
    orderBy: { timestamp: "desc" },
    take: 100,
  });
  res.json(whales);
});

app.use("/alerts", alertsRouter);
app.use("/api-keys", apiKeysRouter);

// ─── WebSocket ────────────────────────────────────────────────────────────────

wss.on("connection", async (ws, req) => {
  // Check for API key in query string: ws://host?key=mk_live_...
  const { query } = parse(req.url ?? "", true);
  const apiKey = query.key as string | undefined;

  if (apiKey) {
    const record = await prisma.apiKey.findUnique({
      where: { key: apiKey },
    });

    if (!record || record.revokedAt) {
      ws.send(JSON.stringify({ event: "error", data: { message: "Invalid or revoked API key." } }));
      ws.close();
      return;
    }

    // Authenticated SDK connection
    sdkSockets.add(ws);
    ws.send(JSON.stringify({ event: "ready", data: { message: "Connected to Monoscope. Listening for alerts." } }));
    console.log(`🔑 SDK client connected (key: ${apiKey.slice(0, 14)}…) | sdk clients: ${sdkSockets.size}`);

    ws.on("close", () => {
      sdkSockets.delete(ws);
      console.log(`🔑 SDK client disconnected | sdk clients: ${sdkSockets.size}`);
    });
    return;
  }

  // Dashboard connection (no key) — full data stream
  console.log(`🔌 Dashboard connected | total: ${wss.clients.size}`);

  const history = await prisma.whaleAlert.findMany({
    orderBy: { timestamp: "desc" },
    take: 100,
  });
  ws.send(JSON.stringify({ event: "whale_history", data: history }));

  ws.on("close", () => {
    console.log(`🔌 Dashboard disconnected | total: ${wss.clients.size}`);
  });
});

// ─── Alert trigger check ──────────────────────────────────────────────────────

// Convert a raw BigInt string amount (in wei / base units) to a human-readable
// float. Splits integer and fractional parts to avoid Number() precision loss
// on values exceeding Number.MAX_SAFE_INTEGER.
function bigIntToUnits(amount: string, decimals = 18): number {
  const bn = BigInt(amount);
  const divisor = BigInt(10) ** BigInt(decimals);
  const intPart = bn / divisor;
  const fracPart = bn % divisor;
  return Number(intPart) + Number(fracPart) / Number(divisor);
}

async function checkWhaleAlerts(txHash: string, tokenAddress: string | null, amountInUnits: number) {
  const alerts = await prisma.alert.findMany({
    where: { type: "whale", enabled: true, ...(tokenAddress ? { token: tokenAddress } : {}) },
  });

  for (const alert of alerts) {
    const fired =
      ((alert.condition === "above" || alert.condition === "crosses") && amountInUnits > alert.threshold)
      || ((alert.condition === "below" || alert.condition === "drops") && amountInUnits < alert.threshold);

    if (fired) {
      try {
        const trigger = await prisma.alertTrigger.create({
          data: { alertId: alert.id, value: amountInUnits, txHash },
        });

        const payload = { alert, trigger };
        broadcast("alert_triggered", payload);
        broadcastToSdk("alert_triggered", payload);

        console.log(`🔔 Alert triggered: ${alert.name} (${amountInUnits} ${alert.condition} ${alert.threshold})`);
      } catch (err: any) {
        // Unique constraint violation = already fired for this tx+alert pair. Skip silently.
        if (err?.code === "P2002") continue;
        console.error(`[checkWhaleAlerts] Failed to create trigger for alert ${alert.id}:`, err);
      }
    }
  }
}

async function checkGasAlerts(gasUsedPercent: number, blockNumber: number) {
  const alerts = await prisma.alert.findMany({
    where: { type: "gas", enabled: true },
  });

  for (const alert of alerts) {
    const fired =
      ((alert.condition === "above" || alert.condition === "crosses") && gasUsedPercent > alert.threshold)
      || ((alert.condition === "below" || alert.condition === "drops") && gasUsedPercent < alert.threshold);

    if (fired) {
      try {
        const trigger = await prisma.alertTrigger.create({
          data: { alertId: alert.id, value: gasUsedPercent },
        });

        const payload = { alert, trigger };
        broadcast("alert_triggered", payload);
        broadcastToSdk("alert_triggered", payload);

        console.log(`🔔 Gas alert triggered: ${alert.name} (${gasUsedPercent}% ${alert.condition} ${alert.threshold}%) at block #${blockNumber}`);
      } catch (err: any) {
        console.error(`[checkGasAlerts] Failed to create trigger for alert ${alert.id}:`, err);
      }
    }
  }
}

// ─── Block pipeline ───────────────────────────────────────────────────────────

blockProcessor.on("block", (block) => {
  console.log(
    `📦 #${block.number.toLocaleString()} | ${block.transactionCount} txns | ${block.tps} TPS | gas ${block.gasUsedPercent}% | wallets ${block.uniqueWallets}`,
  );
  broadcast("block", block);
  whaleTracker.track(block);
  checkGasAlerts(block.gasUsedPercent, block.number).catch((err) =>
    console.error(`[checkGasAlerts] Unhandled error at block #${block.number}:`, err),
  );

  prisma.block.upsert({
    where: { number: block.number },
    create: {
      number: block.number,
      hash: block.hash,
      timestamp: block.timestamp,
      txCount: block.transactionCount,
      gasUsed: block.gasUsed,
      gasLimit: block.gasLimit,
      gasUsedPct: block.gasUsedPercent,
      tps: block.tps,
      uniqueWallets: block.uniqueWallets,
      totalFees: block.totalFees,
    },
    update: {},
  }).catch((err) => console.error(`[block upsert] Failed for block #${block.number}:`, err));
});

whaleTracker.on("whale", async (alert) => {
  broadcast("whale_alert", alert);

  await prisma.whaleAlert.upsert({
    where: { txHash: alert.txHash },
    create: {
      txHash: alert.txHash,
      blockNumber: alert.blockNumber,
      timestamp: alert.timestamp,
      from: alert.from,
      to: alert.to,
      amount: alert.amount,
      tokenType: alert.tokenType,
      tokenAddress: alert.tokenAddress ?? null,
    },
    update: {},
  }).catch((err) => console.error(`[whale upsert] Failed for tx ${alert.txHash}:`, err));

  const amountInUnits = bigIntToUnits(alert.amount);
  await checkWhaleAlerts(alert.txHash, alert.tokenAddress ?? null, amountInUnits);
});

createBlockListener((raw, logs) => {
  blockProcessor.process(raw, logs);
});

// ─── Start ────────────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`🚀 Monoscope API running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket ready on ws://localhost:${PORT}`);
});
