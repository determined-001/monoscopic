/**
 * Environment configuration, parsed once at boot and validated eagerly.
 *
 * Fail-fast is deliberate. The observed failure that held a comparable project
 * a payout band lower was "contract IDs unset" — a product that silently
 * degraded to mock behaviour when its on-chain wiring was missing, and shipped
 * that way without anyone noticing. If Soroban is enabled and misconfigured,
 * this throws at startup rather than quietly running without a chain.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

export type StellarNetwork = "testnet" | "public";

export interface Deployment {
  network: string;
  networkPassphrase: string;
  rpcUrl: string;
  contractId: string;
  admin: string;
  deployedAt: string;
}

export interface CoreConfig {
  /** Horizon instance the whale feed reads from. */
  horizonUrl: string;
  /** Which network the FEED reads. Mainnet by default: testnet is periodically
   *  reset and has thin organic volume, so a testnet-only feed can be empty
   *  exactly when someone looks at it. */
  feedNetwork: StellarNetwork;
  soroban:
    | { enabled: false }
    | {
        enabled: true;
        rpcUrl: string;
        networkPassphrase: string;
        contractId: string;
        adminSecret: string;
      };
}

function required(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    throw new Error(
      `${name} is required when SOROBAN_ENABLED=true. Refusing to start with ` +
        `on-chain writes silently disabled — see deployments/testnet.json.`,
    );
  }
  return v;
}

/**
 * Read the committed deployment record. The contract id lives in the repo, not
 * only in a dashboard env var, precisely so a redeploy cannot lose it.
 */
export function loadDeployment(
  repoRoot: string,
  network = "testnet",
): Deployment {
  const file = join(repoRoot, "deployments", `${network}.json`);
  try {
    return JSON.parse(readFileSync(file, "utf8")) as Deployment;
  } catch (e) {
    throw new Error(
      `could not read ${file}: ${(e as Error).message}. Run scripts/deploy-testnet.sh.`,
    );
  }
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): CoreConfig {
  const feedNetwork: StellarNetwork =
    env.FEED_NETWORK === "testnet" ? "testnet" : "public";

  const horizonUrl =
    env.HORIZON_URL ??
    (feedNetwork === "testnet"
      ? "https://horizon-testnet.stellar.org"
      : "https://horizon.stellar.org");

  if (env.SOROBAN_ENABLED !== "true") {
    return { horizonUrl, feedNetwork, soroban: { enabled: false } };
  }

  return {
    horizonUrl,
    feedNetwork,
    soroban: {
      enabled: true,
      rpcUrl: env.SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org",
      networkPassphrase:
        env.SOROBAN_NETWORK_PASSPHRASE ?? "Test SDF Network ; September 2015",
      contractId: required("ALERT_REGISTRY_CONTRACT_ID"),
      adminSecret: required("SOROBAN_ADMIN_SECRET"),
    },
  };
}
