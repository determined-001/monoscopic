/** Stellar has no gas, so "gas" is gone as an alert type. */
export type AlertType = "whale";
export type AlertCondition = "above" | "below" | "crosses" | "drops";

/**
 * `"native"` for XLM, otherwise `"CODE:GISSUER"`. The issuer is part of the
 * identity because asset codes are not unique — anyone can issue a "USDC".
 */
export type AssetKey = string;

export interface Alert {
  id: string;
  type: AlertType;
  name: string;
  assetKey?: AssetKey | null;
  condition: AlertCondition;
  /**
   * Threshold in stroops (7-decimal fixed point) as a decimal string, never a
   * number: the max Stellar amount is 9223372036854775807 stroops, far beyond
   * what a double represents exactly.
   */
  thresholdStroops: string;
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
  /** Stroops as a decimal string. */
  valueStroops: string;
  /** The Horizon operation that fired this trigger — the natural key. */
  opId: string;
  /** The attestation transaction recorded on-chain, if any. */
  onchainTxHash?: string | null;
  createdAt: string;
}

export interface CreateAlertInput {
  type?: AlertType;
  name: string;
  assetKey: AssetKey;
  condition: AlertCondition;
  /** Human decimal amount, e.g. "1000" or "1000.5000000". Converted to stroops. */
  threshold: string;
  notifyInApp?: boolean;
  notifyEmail?: boolean;
  notifyTelegram?: boolean;
  notifyDiscord?: boolean;
  discordWebhook?: string;
}

export interface UpdateAlertInput {
  enabled?: boolean;
  name?: string;
  /** Human decimal amount; converted to stroops. */
  threshold?: string;
  notifyInApp?: boolean;
  notifyEmail?: boolean;
  notifyTelegram?: boolean;
  notifyDiscord?: boolean;
  discordWebhook?: string;
}
