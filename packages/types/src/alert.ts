export type AlertType = "whale" | "gas";
export type AlertCondition = "above" | "below" | "crosses" | "drops";

export interface Alert {
  id: string;
  type: AlertType;
  name: string;
  token?: string | null;
  condition: AlertCondition;
  threshold: number;
  enabled: boolean;
  notifyInApp: boolean;
  notifyEmail: boolean;
  notifyTelegram: boolean;
  notifyDiscord: boolean;
  discordWebhook?: string | null;
  createdAt: string;
  triggers?: AlertTrigger[];
}

export interface AlertTrigger {
  id: string;
  alertId: string;
  value: number;
  txHash?: string | null;
  createdAt: string;
}

export interface CreateAlertInput {
  type: AlertType;
  name: string;
  token?: string;
  condition: AlertCondition;
  threshold: number;
  notifyInApp?: boolean;
  notifyEmail?: boolean;
  notifyTelegram?: boolean;
  notifyDiscord?: boolean;
  discordWebhook?: string;
}

export interface UpdateAlertInput {
  enabled?: boolean;
  name?: string;
  threshold?: number;
  notifyInApp?: boolean;
  notifyEmail?: boolean;
  notifyTelegram?: boolean;
  notifyDiscord?: boolean;
  discordWebhook?: string;
}
