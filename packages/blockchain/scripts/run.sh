#!/usr/bin/env bash
set -euo pipefail

# --- load .env if present ---
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

# --- defaults ---
MAINNET_RPC="${MAINNET_RPC:-}"
ANVIL_PORT="${ANVIL_PORT:-8545}"
ANVIL_CHAIN_ID="${ANVIL_CHAIN_ID:-1}"
ANVIL_BLOCK_TIME="${ANVIL_BLOCK_TIME:-1}"
ANVIL_FORK_BLOCK="${ANVIL_FORK_BLOCK:-}"
ANVIL_BASE_FEE_ZERO="${ANVIL_BASE_FEE_ZERO:-true}"
ANVIL_AUTO_IMPERSONATE="${ANVIL_AUTO_IMPERSONATE:-true}"
ANVIL_DEFAULT_BALANCE_ETH="${ANVIL_DEFAULT_BALANCE_ETH:-100}"

EXPRESS_PORT="${EXPRESS_PORT:-3001}"
EXPRESS_ENTRY="${EXPRESS_ENTRY:-src/service.ts}"
NODE_CMD="${NODE_CMD:-bun}"                 

if [ -z "${MAINNET_RPC}" ]; then
  echo "❌ MAINNET_RPC is required (set it in .env)"
  exit 1
fi

ANVIL_LOG=.anvil.out
EXPRESS_LOG=.express.out
: > "$ANVIL_LOG"
: > "$EXPRESS_LOG"

cleanup() {
  echo
  echo "⏹️  Stopping..."
  [[ -n "${ANVIL_PID:-}" ]] && kill "$ANVIL_PID" 2>/dev/null || true
  [[ -n "${EXPRESS_PID:-}" ]] && kill "$EXPRESS_PID" 2>/dev/null || true
  wait 2>/dev/null || true
  
  # Clean up log files
  rm -f "$ANVIL_LOG" "$EXPRESS_LOG"
  
  echo "✅ Stopped."
}
trap cleanup EXIT INT TERM

# --- build anvil args ---
ANVIL_ARGS=(
  --fork-url "$MAINNET_RPC"
  --port "$ANVIL_PORT"
  --chain-id "$ANVIL_CHAIN_ID"
  --block-time "$ANVIL_BLOCK_TIME"
  --balance "$ANVIL_DEFAULT_BALANCE_ETH"  # value is in ETH
)
[[ -n "$ANVIL_FORK_BLOCK" ]] && ANVIL_ARGS+=( --fork-block-number "$ANVIL_FORK_BLOCK" )
[[ "$ANVIL_BASE_FEE_ZERO" == "true" ]] && ANVIL_ARGS+=( --block-base-fee-per-gas 0 )
[[ "$ANVIL_AUTO_IMPERSONATE" == "true" ]] && ANVIL_ARGS+=( --auto-impersonate )

echo "🚀 Starting Anvil: anvil ${ANVIL_ARGS[*]}"
anvil "${ANVIL_ARGS[@]}" >> "$ANVIL_LOG" 2>&1 &
ANVIL_PID=$!

# --- wait for RPC health ---
echo -n "⌛ Waiting for Anvil RPC on :$ANVIL_PORT"
for i in {1..60}; do
  if curl -s -X POST "http://127.0.0.1:${ANVIL_PORT}" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]} ' \
    | grep -q '"result"'; then
    echo
    echo "✅ Anvil ready at http://127.0.0.1:${ANVIL_PORT}"
    break
  fi
  echo -n "."
  sleep 0.5
done

# --- start express ---
echo "🌐 Starting Express on :$EXPRESS_PORT -> $EXPRESS_ENTRY"
$NODE_CMD "$EXPRESS_ENTRY" >> "$EXPRESS_LOG" 2>&1 &
EXPRESS_PID=$!

echo
echo "📜 Logs:"
echo "  Anvil:   tail -f $ANVIL_LOG"
echo "  Express: tail -f $EXPRESS_LOG"
echo
echo "🏃 Running. Press Ctrl+C to stop."

# keep script in foreground until children exit
wait