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
check_service_with_retry() {
  local service_name="$1"
  local port="$2"
  local method="$3"
  local check_function="$4"
  
  echo "🔍 Checking $service_name on port $port..."
  
  for attempt in $(seq 1 $MAX_RETRIES); do
    if $check_function; then
      echo "✅ $service_name is running on port $port"
      return 0
    else
      if [ $attempt -lt $MAX_RETRIES ]; then
        echo "❌ $service_name not available (attempt $attempt/$MAX_RETRIES)"
        echo "   Retrying in ${RETRY_DELAY} seconds..."
        sleep $RETRY_DELAY
      else
        echo "❌ $service_name failed to start after $MAX_RETRIES attempts"
        echo "   Please start $service_name first"
        return 1
      fi
    fi
  done
}


check_anvil() {
  curl -s -X POST "${FORK_RPC_URL}" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}' \
    | grep -q '"result"' 2>/dev/null
}

check_bundler() {
  curl -s -X POST "${BUNDLER_URL}" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"eth_supportedEntryPoints","params":[]}' \
    | grep -q '"result"' 2>/dev/null
}

# Check services with retry
check_service_with_retry "Anvil" "$FORK_RPC_URL" "eth_chainId" "check_anvil" || exit 1
check_service_with_retry "Bundler" "$BUNDLER_URL" "eth_supportedEntryPoints" "check_bundler" || exit 1

# ========== Start Express ==========
echo "🌐 Starting Express on :$EXPRESS_PORT -> $EXPRESS_ENTRY"
$NODE_CMD "$EXPRESS_ENTRY" >> "$EXPRESS_LOG" 2>&1 &
EXPRESS_PID=$!

echo
echo "📜 Logs:"
echo "  Express: tail -f $EXPRESS_LOG"
echo
echo "🔗 Dev endpoints:"
echo "  Anvil fork:    ${FORK_RPC_URL}"
echo "  Bundler:  ${BUNDLER_URL}"
echo "  Express:  http://127.0.0.1:${EXPRESS_PORT}"
echo
echo "🏃 Running. Press Ctrl+C to stop."

# keep script in foreground until children exit
wait