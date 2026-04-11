import { Router } from "express";
import { prisma } from "@monoscope/db";
import type { AlertType, AlertCondition } from "@monoscope/types";

const VALID_TYPES: AlertType[] = ["whale", "gas"];
const VALID_CONDITIONS: AlertCondition[] = ["above", "below", "crosses", "drops"];

const router: Router = Router();

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
  const { type, name, token, condition, threshold } = req.body;

  if (!type || !name || !condition || threshold === undefined) {
    res.status(400).json({ error: "type, name, condition, threshold are required" });
    return;
  }
  if (!VALID_TYPES.includes(type)) {
    res.status(400).json({ error: `type must be one of: ${VALID_TYPES.join(", ")}` });
    return;
  }
  if (!VALID_CONDITIONS.includes(condition)) {
    res.status(400).json({ error: `condition must be one of: ${VALID_CONDITIONS.join(", ")}` });
    return;
  }

  const parsedThreshold = parseFloat(threshold);
  if (isNaN(parsedThreshold)) {
    res.status(400).json({ error: "threshold must be a valid number" });
    return;
  }

  const sanitizedName = String(name).trim().slice(0, 100);
  if (!sanitizedName) {
    res.status(400).json({ error: "name must not be empty" });
    return;
  }

  const { notifyInApp, notifyEmail, notifyTelegram, notifyDiscord, discordWebhook } = req.body;

  if (notifyDiscord && !String(discordWebhook ?? "").trim()) {
    res.status(400).json({ error: "discordWebhook is required when notifyDiscord is true" });
    return;
  }

  const alert = await prisma.alert.create({
    data: {
      type,
      name: sanitizedName,
      token: token ?? null,
      condition,
      threshold: parsedThreshold,
      notifyInApp:    notifyInApp    !== undefined ? Boolean(notifyInApp)    : true,
      notifyEmail:    notifyEmail    !== undefined ? Boolean(notifyEmail)    : false,
      notifyTelegram: notifyTelegram !== undefined ? Boolean(notifyTelegram) : false,
      notifyDiscord:  notifyDiscord  !== undefined ? Boolean(notifyDiscord)  : false,
      discordWebhook: notifyDiscord ? String(discordWebhook).trim() : null,
    },
  });
  res.status(201).json(alert);
});

// PATCH /alerts/:id
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { enabled, name, threshold, notifyInApp, notifyEmail, notifyTelegram, notifyDiscord, discordWebhook } = req.body;
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
    const parsedThreshold = parseFloat(threshold);
    if (isNaN(parsedThreshold)) {
      res.status(400).json({ error: "threshold must be a valid number" });
      return;
    }
    update.threshold = parsedThreshold;
  }
  if (notifyInApp    !== undefined) update.notifyInApp    = Boolean(notifyInApp);
  if (notifyEmail    !== undefined) update.notifyEmail    = Boolean(notifyEmail);
  if (notifyTelegram !== undefined) update.notifyTelegram = Boolean(notifyTelegram);
  if (notifyDiscord  !== undefined) {
    update.notifyDiscord = Boolean(notifyDiscord);
    update.discordWebhook = notifyDiscord ? String(discordWebhook ?? "").trim() || null : null;
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
