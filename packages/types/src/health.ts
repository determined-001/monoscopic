export interface HealthCheck {
  status: "ok" | "degraded" | "down";
  clients: number;
  uptime: number;
  timestamp: string;
}
