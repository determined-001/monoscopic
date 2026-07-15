#!/usr/bin/env bash
# Build, deploy, and initialize the alert_registry contract on Stellar testnet.
# Writes the resulting contract id to deployments/testnet.json so it is committed
# to the repo, not left as a dashboard-only env var (which is how ids go missing).
#
# Usage: scripts/deploy-testnet.sh [deployer-identity]
#   deployer-identity defaults to "monoscope-deployer"
set -euo pipefail

DEPLOYER="${1:-monoscope-deployer}"
NETWORK="testnet"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTRACT_DIR="$ROOT/contracts/alert_registry"
OUT="$ROOT/deployments/testnet.json"
WASM="$ROOT/target/wasm32v1-none/release/alert_registry.wasm"

echo "==> Building contract (wasm32v1-none)"
stellar contract build --package alert-registry

echo "==> Optimizing wasm"
stellar contract optimize --wasm "$WASM" || true
OPTIMIZED="${WASM%.wasm}.optimized.wasm"
[ -f "$OPTIMIZED" ] && WASM="$OPTIMIZED"

ADMIN_ADDR="$(stellar keys address "$DEPLOYER")"
echo "==> Deployer/admin: $ADMIN_ADDR"

echo "==> Deploying"
CONTRACT_ID="$(stellar contract deploy \
  --wasm "$WASM" \
  --source "$DEPLOYER" \
  --network "$NETWORK")"
echo "==> Contract id: $CONTRACT_ID"

echo "==> Initializing (admin = deployer)"
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source "$DEPLOYER" \
  --network "$NETWORK" \
  -- init --admin "$ADMIN_ADDR"

mkdir -p "$(dirname "$OUT")"
cat > "$OUT" <<JSON
{
  "network": "testnet",
  "networkPassphrase": "Test SDF Network ; September 2015",
  "rpcUrl": "https://soroban-testnet.stellar.org",
  "contractId": "$CONTRACT_ID",
  "admin": "$ADMIN_ADDR",
  "deployedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
JSON

echo "==> Wrote $OUT"
echo "==> View: https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID"
