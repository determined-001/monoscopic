"use client";
import { useEffect, useRef } from "react";
import { useMonoscopeStore } from "@/lib/store/useMonoscope";
import { useToast } from "@/components/ui/toast";

const WS_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_WS_URL) ||
  "ws://localhost:3001";

const MIN_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 30_000;

export function useMonoscopeSocket() {
  const {
    setConnected,
    setLatestBlock,
    addWhaleAlert,
    setWhaleHistory,
  } = useMonoscopeStore();
  const { toast } = useToast();

  // Keep a ref so the cleanup callback always sees the current WebSocket
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backoffRef = useRef(MIN_BACKOFF_MS);
  const destroyedRef = useRef(false);

  useEffect(() => {
    destroyedRef.current = false;

    function connect() {
      if (destroyedRef.current) return;

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[WS] Connected to Monoscope API");
        backoffRef.current = MIN_BACKOFF_MS; // reset backoff on success
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const { event: type, data } = JSON.parse(event.data);
          if (type === "block") setLatestBlock(data);
          if (type === "whale_alert") addWhaleAlert(data);
          if (type === "whale_history") setWhaleHistory(data);
          if (type === "alert_triggered") {
            const { alert, trigger } = data;
            toast.warning(
              `Alert: ${alert.name}`,
              `${alert.condition} ${trigger.value}`,
            );
          }
        } catch (err) {
          console.error("[WS] Failed to parse message", err);
        }
      };

      ws.onclose = () => {
        console.log("[WS] Disconnected");
        setConnected(false);
        if (destroyedRef.current) return;
        const delay = backoffRef.current;
        console.log(`[WS] Reconnecting in ${delay}ms…`);
        retryRef.current = setTimeout(connect, delay);
        backoffRef.current = Math.min(delay * 2, MAX_BACKOFF_MS);
      };

      ws.onerror = (err) => {
        console.error("[WS] Error", err);
        // onclose fires after onerror — reconnect is handled there
      };
    }

    connect();

    return () => {
      destroyedRef.current = true;
      if (retryRef.current) clearTimeout(retryRef.current);
      wsRef.current?.close();
    };
  }, []);
}
