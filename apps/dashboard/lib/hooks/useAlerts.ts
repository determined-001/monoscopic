"use client";

import { useEffect, useState, useCallback } from "react";

import type {
  Alert,
  AlertType,
  AlertCondition,
  CreateAlertInput,
} from "@monoscope/types";

export type { Alert, AlertType, AlertCondition, CreateAlertInput };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/alerts`);
      if (!res.ok) throw new Error("Failed to fetch alerts");
      const data = await res.json();
      setAlerts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const createAlert = useCallback(async (input: CreateAlertInput) => {
    const res = await fetch(`${API_URL}/alerts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("Failed to create alert");
    const created: Alert = await res.json();
    setAlerts((prev) => [created, ...prev]);
    return created;
  }, []);

  const toggleAlert = useCallback(async (id: string, enabled: boolean) => {
    const res = await fetch(`${API_URL}/alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    if (!res.ok) throw new Error("Failed to update alert");
    const updated: Alert = await res.json();
    setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
  }, []);

  const updateAlert = useCallback(
    async (id: string, patch: Partial<CreateAlertInput & { enabled: boolean }>) => {
      const res = await fetch(`${API_URL}/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed to update alert");
      const updated: Alert = await res.json();
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    },
    [],
  );

  const deleteAlert = useCallback(async (id: string) => {
    const res = await fetch(`${API_URL}/alerts/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete alert");
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { alerts, loading, error, createAlert, toggleAlert, updateAlert, deleteAlert, refetch: fetchAlerts };
}
