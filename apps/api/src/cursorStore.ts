import type { CursorStore } from "@monoscope/core";
import { prisma } from "@monoscope/db";

/**
 * Durable cursor storage.
 *
 * The in-memory store loses its position on restart, which on Render's free tier
 * (which spins down on idle) means resuming at cursor("now") and silently
 * skipping every event during the downtime — while the UI still says "live".
 */
export class PrismaCursorStore implements CursorStore {
  async get(stream: string): Promise<string | null> {
    const row = await prisma.streamCursor.findUnique({ where: { stream } });
    return row?.pagingToken ?? null;
  }

  async set(stream: string, pagingToken: string): Promise<void> {
    await prisma.streamCursor.upsert({
      where: { stream },
      create: { stream, pagingToken },
      update: { pagingToken },
    });
  }
}
