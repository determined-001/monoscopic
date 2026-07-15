import { Router } from "express";
import { prisma } from "@monoscope/db";
import { toStroops } from "@monoscope/core";
import type { AlertCondition } from "@monoscope/types";

const VALID_CONDITIONS: AlertCondition[] = ["above", "below", "crosses", "drops"];

const router: Router = Router();

/**
 * Parse a human decimal threshold ("1000", "1000.5") into stroops.
 *
 * Deliberately NOT parseFloat, which the EVM version used: thresholds are
 * compared against amounts up to 9223372036854775807 stroops, well past the
 * exact-integer range of a double. toStroops also rejects more than 7 decimal
 * places rather than silently truncating precision Stellar cannot represent.
 */
function parseThreshold(
  v: unknown,
): { ok: true; stroops: string } | { ok: false; error: string } {
  try {
    const stroops = toStroops(String(v));
    if (stroops <= 0n) return { ok: false, error: "threshold must be positive" };
    return { ok: true, stroops: stroops.toString() };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// GET /alerts
router.get("/", async (_req, res) => {
  const alerts = await prisma.alert.findMany({
    orderBy: { createdAt: "desc" },
    include: { triggers: { orderBy: { createdAt: "desc" }, take: 5 } },
  });
  res.json(alerts);
});

// POST /alerts
router.post("/", async (req, res) => {
  const { name, assetKey, condition, threshold } = req.body;

  if (!name || !assetKey || !condition || threshold === undefined) {
    res
      .status(400)
      .json({ error: "name, assetKey, condition, threshold are required" });
    return;
  }
  if (!VALID_CONDITIONS.includes(condition)) {
    res
      .status(400)
      .json({ error: `condition must be one of: ${VALID_CONDITIONS.join(", ")}` });
    return;
  }

  // Must be "native" or "CODE:ISSUER". Accepting a bare code would let a
  // look-alike asset from any issuer match a threshold meant for the real one.
  if (assetKey !== "native" && !/^[A-Za-z0-9]{1,12}:G[A-Z2-7]{55}$/.test(assetKey)) {
    res.status(400).json({
      error: 'assetKey must be "native" or "CODE:GISSUER" (issuer required)',
    });
    return;
  }

  const parsed = parseThreshold(threshold);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const sanitizedName = String(name).trim().slice(0, 100);
  if (!sanitizedName) {
    res.status(400).json({ error: "name must not be empty" });
    return;
  }

  const {
    notifyInApp,
    notifyEmail,
    notifyTelegram,
    notifyDiscord,
    discordWebhook,
  } = req.body;

  if (notifyDiscord && !String(discordWebhook ?? "").trim()) {
    res
      .status(400)
      .json({ error: "discordWebhook is required when notifyDiscord is true" });
    return;
  }

  const alert = await prisma.alert.create({
    data: {
      type: "whale",
      name: sanitizedName,
      assetKey,
      condition,
      thresholdStroops: parsed.stroops,
      notifyInApp: notifyInApp !== undefined ? Boolean(notifyInApp) : true,
      notifyEmail: notifyEmail !== undefined ? Boolean(notifyEmail) : false,
      notifyTelegram:
        notifyTelegram !== undefined ? Boolean(notifyTelegram) : false,
      notifyDiscord: notifyDiscord !== undefined ? Boolean(notifyDiscord) : false,
      discordWebhook: notifyDiscord ? String(discordWebhook).trim() : null,
    },
  });
  res.status(201).json(alert);
});

// PATCH /alerts/:id
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    enabled,
    name,
    threshold,
    notifyInApp,
    notifyEmail,
    notifyTelegram,
    notifyDiscord,
    discordWebhook,
  } = req.body;
  const update: Record<string, unknown> = {};

  if (enabled !== undefined) update.enabled = Boolean(enabled);
  if (name !== undefined) {
    const sanitizedName = String(name).trim().slice(0, 100);
    if (!sanitizedName) {
      res.status(400).json({ error: "name must not be empty" });
      return;
    }
    update.name = sanitizedName;
  }
  if (threshold !== undefined) {
    const parsed = parseThreshold(threshold);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    update.thresholdStroops = parsed.stroops;
  }
  if (notifyInApp !== undefined) update.notifyInApp = Boolean(notifyInApp);
  if (notifyEmail !== undefined) update.notifyEmail = Boolean(notifyEmail);
  if (notifyTelegram !== undefined) update.notifyTelegram = Boolean(notifyTelegram);
  if (notifyDiscord !== undefined) {
    update.notifyDiscord = Boolean(notifyDiscord);
    update.discordWebhook = notifyDiscord
      ? String(discordWebhook ?? "").trim() || null
      : null;
  }

  const alert = await prisma.alert.update({ where: { id }, data: update });
  res.json(alert);
});

// DELETE /alerts/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.alert.delete({ where: { id } });
  res.status(204).send();
});

export default router;
