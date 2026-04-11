// ─── Monoscope SDK ────────────────────────────────────────────────────────────
//
// Usage:
//   import { monoscope } from "@monoscope/sdk";
//
//   const stop = monoscope("mk_live_...", (event) => {
//     if (event.type === "alert_triggered") {
//       console.log(event.data.alert.name, event.data.trigger.value);
//     }
//   });
//
//   // Later, to disconnect:
//   stop();

// ─── Types ────────────────────────────────────────────────────────────────────

export type { Alert, AlertTrigger, AlertType, AlertCondition } from "@monoscope/types";

import type { Alert, AlertTrigger } from "@monoscope/types";

export interface MonoscopeEvent {
  type: "alert_triggered" | "ready" | "error";
  data: {
    alert?: Alert;
    trigger?: AlertTrigger;
    message?: string;
  };
}

export type EventCallback = (event: MonoscopeEvent) => void;
export type StopFn = () => void;

// ─── Options ─────────────────────────────────────────────────────────────────

export interface MonoscopeOptions {
  /** WebSocket server URL. Defaults to the public Monoscope server. */
  url?: string;
  /** Milliseconds between reconnect attempts. Default: 3000. */
  reconnectInterval?: number;
}

// ─── Client ───────────────────────────────────────────────────────────────────

// Default URL for local development. In production, pass `url` via options:
// monoscope(apiKey, handler, { url: "wss://your-host:3001" })
const DEFAULT_URL = "ws://localhost:3001";

/**
 * Connect to the Monoscope alert stream.
 *
 * @param apiKey  - Your API key from the Monoscope dashboard.
 * @param onEvent - Called for every event received from the server.
 * @param options - Optional configuration.
 * @returns       A `stop()` function that closes the connection.
 */
export function monoscope(
  apiKey: string,
  onEvent: EventCallback,
  options: MonoscopeOptions = {},
): StopFn {
  const { url = DEFAULT_URL, reconnectInterval = 3000 } = options;
  let ws: WebSocket | null = null;
  let stopped = false;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  function connect() {
    if (stopped) return;

    ws = new WebSocket(`${url}?key=${encodeURIComponent(apiKey)}`);

    ws.onopen = () => {
      // Server sends a "ready" event on successful auth
    };

    ws.onmessage = (msg) => {
      try {
        const raw = JSON.parse(msg.data as string) as { event: string; data: unknown };
        onEvent({ type: raw.event as MonoscopeEvent["type"], data: raw.data as MonoscopeEvent["data"] });
      } catch {
        // ignore malformed messages
      }
    };

    ws.onerror = () => {
      // onerror is always followed by onclose, handle retry there
    };

    ws.onclose = () => {
      if (stopped) return;
      retryTimer = setTimeout(connect, reconnectInterval);
    };
  }

  connect();

  return function stop() {
    stopped = true;
    if (retryTimer) clearTimeout(retryTimer);
    if (ws) ws.close();
  };
}
