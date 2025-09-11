# Blockchain Service

A local blockchain service with Express API for testing and development

## 🚀 Quick Start

### Prerequisites

- [Anvil](https://book.getfoundry.sh/anvil/): 1.2.3+
- pnpm: 8.15.4+
- node: v24.7.0+
- Environment variables configured

### Environment Setup

Create a `.env` file in the `packages/blockchain` directory:

```bash
# Required
MAINNET_RPC="<public or private rpc>"
FORK_RPC_URL="<your mainnet fork url>"
BUNDLER_URL="<your bundler url for fork>"

# Optional
EXPRESS_PORT=3001
NODE_CMD=bun
EXPRESS_ENTRY=src/service.ts
```

### Launch Service

```bash
# Navigate to blockchain package
cd packages/blockchain

# Add all mandatory variables to .env
cp .env.example .env

# Launch faucets for your fork and a bundler
bash ./scripts/run.sh
```

This will start:

- **Express API**: Faucet service on port 3001

## 🎯 API Endpoints

### ETH Faucet

Fund an address with ETH for testing.

```bash
curl -X POST http://localhost:3001/faucet \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x1234567890123456789012345678901234567890",
    "amountEth": "0.5"
  }'
```

**Response:**

```json
{
  "ok": true,
  "address": "0x1234567890123456789012345678901234567890",
  "balance": "0.5 ETH"
}
```

### USDC Faucet

Fund an address with USDC using Anvil impersonation.

```bash
curl -X POST http://localhost:3001/faucet-usdc \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x1234567890123456789012345678901234567890",
    "amountUsdc": "1000"
  }'
```

**Response:**

```json
{
  "ok": true,
  "address": "0x1234567890123456789012345678901234567890",
  "balance": "1000 USDC",
  "transactionHash": "0xabc...",
  "impersonatedAddress": "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8"
}
```

## 📋 Request Parameters

### ETH Faucet

| Parameter   | Type   | Required | Default | Description              |
| ----------- | ------ | -------- | ------- | ------------------------ |
| `to`        | string | ✅       | -       | Ethereum address to fund |
| `amountEth` | string | ❌       | "0.1"   | Amount of ETH to send    |

### USDC Faucet

| Parameter    | Type   | Required | Default | Description              |
| ------------ | ------ | -------- | ------- | ------------------------ |
| `to`         | string | ✅       | -       | Ethereum address to fund |
| `amountUsdc` | string | ❌       | "100"   | Amount of USDC to send   |

## 🔧 Configuration

### Environment Variables

| Variable                    | Default | Description                      |
| --------------------------- | ------- | -------------------------------- |
| `MAINNET_RPC`               | -       | Mainnet RPC URL (required)       |
| `ANVIL_PORT`                | 8545    | Anvil RPC port                   |
| `ANVIL_CHAIN_ID`            | 1       | Chain ID for Anvil               |
| `ANVIL_BLOCK_TIME`          | 1       | Block time in seconds            |
| `ANVIL_DEFAULT_BALANCE_ETH` | 100     | Default ETH balance for accounts |
| `EXPRESS_PORT`              | 3001    | Express API port                 |

### Anvil Features

- **Forking**: Uses mainnet fork for real contract interactions
- **Auto-impersonation**: Automatically impersonates accounts
- **Free gas**: Zero gas prices for testing
- **Fast blocks**: 1-second block time

## 🛑 Stopping the Service

Press `Ctrl+C` in the terminal to stop both Anvil and Express services. The script will automatically:

- Kill all processes
- Clean up log files (`.anvil.out`, `.express.out`)

## 📝 Logs

Monitor logs in real-time:

```bash
# Anvil logs
tail -f .anvil.out

# Express logs
tail -f .express.out
```

## 🔗 Useful URLs

- **Anvil RPC**: `http://localhost:8545`
- **Express API**: `http://localhost:3001`
- **Anvil Explorer**: `http://localhost:8545` (if available)
