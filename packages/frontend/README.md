## Mycelium app

The frontend package demonstrates SDK integration with a Next.js application featuring:

- Wallet creation and management
- Balance checking and vault operations
- Interactive UI built with Chakra UI
- Real-time blockchain interactions

## Requirements

1. pnpm >= 10.9.0
2. node >= 22.11.0

## Installation

1. To install dependencies:

```bash
pnpm install
```

2. Copy `.env.example` to `.env` and set necessary variables

3. Make sure that Mycelium SDK is built in **[packages/sdk](https://github.com/0xdeval/mycelium-sdk/blob/main/packages/sdk)**

4. To run:

```bash
pnpm run dev
```

5. Open `localhost:3000`

## Envs

Configure environment variables for the frontend:

```bash
# Required
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
NEXT_PUBLIC_PRIVY_APP_SECRET=your-privy-app-secret

# Optional
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=your-rpc-url
NEXT_PUBLIC_BUNDLER_URL=your-bundler-url
```
