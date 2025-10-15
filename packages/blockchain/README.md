## Blockchain service

A local blockchain Express service fro a local development. Created to work with an Anvil Fork and Pimlico bundler. Shouldn't be used for a production app.
A helper service for Mycelium demo app in `packages/frontend`

## Quick start

### Prerequisites

- [Anvil](https://book.getfoundry.sh/anvil/): 1.2.3+
- pnpm: 8.15.4+
- node: v24.7.0+
- You have a URL for your Fork blockchain
- You have a URL for your local bundler
- Environment variables configured

### Local chain fork

To run your own fork,just install [Anvil](https://book.getfoundry.sh/anvil/): 1.2.3+ and run the command:
`anvil`

This will automatically run a fork of a mainnet and provides you test addresses to use. The default Fork RPC URL: `http://localhost:8545`
You can use this URL for Blockchain service as well as in Mycelium demo app in `packages/frontend`

### Local bundler

To run a local bundler for smart account, simply use [Pimlico Alto open source bundler](https://github.com/pimlicolabs/alto).
Check its [README.md](https://github.com/pimlicolabs/alto/blob/main/README.md) file to get started

> You can also run Anvil Fork along with Alto bundler by using the script from Alto repo.
> To get in fo about this, check a different [README.md](https://github.com/pimlicolabs/alto/blob/main/scripts/README.md) file from the Alto repo

### Envs

Create a `.env` file in the `packages/blockchain` directory:

```bash
# Required
FORK_RPC_URL="<your mainnet fork url>"
BUNDLER_URL="<your bundler url for fork>"

# Optional
EXPRESS_PORT=3001
NODE_CMD=bun
EXPRESS_ENTRY=src/service.ts
```

### Launch

```bash
# Navigate to blockchain package
cd packages/blockchain

# Add all mandatory variables to .env
cp .env.example .env

# Launch faucets for your fork and a bundler
bash ./scripts/run.sh
```

This will start the express service on port 3001

### Vercel deployment

If you want to use service publicly with `packages/frontend` you need to deploy it on Vercel. You can use the following steps to make this:

- Go to `packages/blockchain`
- Make sure that vercel install: `vercel -v`
- Deploy the service: `pnpm run deploy`

## 🎯 API endpoints

### ETH Faucet

Fund an address with ETH for testing.

```bash
curl -X POST http://localhost:3001/faucet \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0xc6fA9CFFe212E8a64ee9DEF670d85B7105DB13BB",
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

### USDC faucet

Fund an address with USDC using Anvil impersonation.

```bash
curl -X POST http://localhost:3001/faucet-usdc \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0xc6fA9CFFe212E8a64ee9DEF670d85B7105DB13BB",
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

## 📋 Request parameters

### ETH faucet

| Parameter   | Type   | Required | Default | Description              |
| ----------- | ------ | -------- | ------- | ------------------------ |
| `to`        | string | ✅       | -       | Ethereum address to fund |
| `amountEth` | string | ❌       | "0.1"   | Amount of ETH to send    |

### USDC faucet

| Parameter    | Type   | Required | Default | Description              |
| ------------ | ------ | -------- | ------- | ------------------------ |
| `to`         | string | ✅       | -       | Ethereum address to fund |
| `amountUsdc` | string | ❌       | "100"   | Amount of USDC to send   |

## Configuration

### Environment variables

| Variable                    | Default | Description                      |
| --------------------------- | ------- | -------------------------------- |
| `ANVIL_PORT`                | 8545    | Anvil RPC port                   |
| `ANVIL_CHAIN_ID`            | 1       | Chain ID for Anvil               |
| `ANVIL_BLOCK_TIME`          | 1       | Block time in seconds            |
| `ANVIL_DEFAULT_BALANCE_ETH` | 100     | Default ETH balance for accounts |
| `EXPRESS_PORT`              | 3001    | Express API port                 |

## 📝 Logs

Monitor logs in real-time:

```bash
# Anvil logs
tail -f .anvil.out

# Express logs
tail -f .express.out
```
