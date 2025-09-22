# Mycelium SDK

The current SDK scope cover the following features:

1. Create embedded / smart wallets
2. Top up a wallet with test tokens
3. Earn yield using tokens (TBD)

Current SDK is an NPM library, but it already could be used as a local library in `package/frontend`

## Requirements

1. bun >= 1.2.17
2. node >= 22.11.0

## Installation

Build dependencies:

```bash

bun i

```

To build:

```bash

bun run build

```

When an SDK is built, then it could be used in package/frontend

## Chain management

The chains config that is provided on the SDK initialitzation is used to define where the onchain activity will take place. For now, only one chain should be provided as only one chain can be used for `earn` functionality (more chains support is coming soon). For example on the following init we defined a chain id => 8453:

```javascript
this.sdk = new MyceliumSDK({
        walletsConfig: {
          embeddedWalletConfig: {
            provider: {
              type: "privy",
              providerConfig: {
                appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
                appSecret: process.env.NEXT_PUBLIC_PRIVY_APP_SECRET!,
              },
            },
          },
          smartWalletConfig: {
            provider: {
              type: "default",
            },
          },
        },
        chain:
          {
            chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID!) as any,
            rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
            bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL!,
          },
        protocolsRouterConfig: {
          riskLevel: "medium",
        },
      });
```

It means that the protocol `earn` functionality will work on the `Base` network only. All vaults to deposit will be also fetched from the `Base` network
