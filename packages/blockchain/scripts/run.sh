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
ANVIL_PORT="${ANVIL_PORT:-8545}"
BUNDLER_PORT="${ALTO_PORT:-4337}"
EXPRESS_PORT="${EXPRESS_PORT:-3001}"
EXPRESS_ENTRY="${EXPRESS_ENTRY:-src/service.ts}"
NODE_CMD="${NODE_CMD:-bun}" 

# Logs
EXPRESS_LOG=".express.out"
: > "$EXPRESS_LOG"

cleanup() {
  echo
  echo "⏹️  Stopping..."
  [[ -n "${EXPRESS_PID:-}" ]] && kill "$EXPRESS_PID" 2>/dev/null || true
  wait 2>/dev/null || true
  rm -f "$EXPRESS_LOG"
  echo "✅ Stopped."
}
trap cleanup EXIT INT TERM

# ========== Check if services are running ==========
check_anvil() {
  curl -s -X POST "http://127.0.0.1:${ANVIL_PORT}" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}' \
    | grep -q '"result"' 2>/dev/null
}

check_bundler() {
  curl -s -X POST "http://127.0.0.1:${BUNDLER_PORT}" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"eth_supportedEntryPoints","params":[]}' \
    | grep -q '"result"' 2>/dev/null
}

# Check services
echo "🔍 Checking services..."

if check_anvil; then
  echo "✅ Anvil is running on port ${ANVIL_PORT}"
else
  echo "❌ Anvil is not running on port ${ANVIL_PORT}"
  echo "   Please start Anvil first"
  exit 1
fi

if check_bundler; then
  echo "✅ Bundler is running on port ${BUNDLER_PORT}"
else
  echo "❌ Bundler is not running on port ${BUNDLER_PORT}"
  echo "   Please start the bundler first"
  exit 1
fi

# ========== Start Express ==========
echo "🌐 Starting Express on :$EXPRESS_PORT -> $EXPRESS_ENTRY"
$NODE_CMD "$EXPRESS_ENTRY" >> "$EXPRESS_LOG" 2>&1 &
EXPRESS_PID=$!

echo
echo "📜 Logs:"
echo "  Express: tail -f $EXPRESS_LOG"
echo
echo "🔗 Dev endpoints:"
echo "  Anvil:    http://127.0.0.1:${ANVIL_PORT}"
echo "  Bundler:  http://127.0.0.1:${BUNDLER_PORT}"
echo "  Express:  http://127.0.0.1:${EXPRESS_PORT}"
echo
echo "🏃 Running. Press Ctrl+C to stop."

# keep script in foreground until children exit
wait