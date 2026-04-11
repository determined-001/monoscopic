import { Router } from "express";
import { randomBytes } from "crypto";
import { prisma } from "@monoscope/db";

const router: Router = Router();

// GET /api-keys — list all active keys (never returns the key value itself after creation)
router.get("/", async (_req, res) => {
  const keys = await prisma.apiKey.findMany({
    where: { revokedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, label: true, createdAt: true, key: true },
  });
  // Mask key: show only prefix + last 4 chars
  const masked = keys.map((k) => ({
    ...k,
    key: `${k.key.slice(0, 10)}...${k.key.slice(-4)}`,
  }));
  res.json(masked);
});

// POST /api-keys — generate a new key
router.post("/", async (req, res) => {
  const label: string = req.body.label?.trim() || "My App";
  const raw = `mk_live_${randomBytes(24).toString("hex")}`;

  const apiKey = await prisma.apiKey.create({
    data: { key: raw, label },
  });

  // Return the full key ONCE — client must copy it now
  res.status(201).json({ id: apiKey.id, label: apiKey.label, key: raw, createdAt: apiKey.createdAt });
});

// DELETE /api-keys/:id — revoke a key
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.apiKey.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
  res.status(204).send();
});

export default router;
