# MyceliumSDK

> Check documentation: https://docs.mycelium.sh

A TypeScript-based SDK that implements access to yield opportunities in web3 using a Mycelium SDK. The SDK allows integrators to easily onboard users, manage wallets, and interact with DeFi protocols via a unified interface basic knowledge of web3

## Core features

The Mycelium SDK simplifies on-chain interactions by creating and managing embedded wallets based on user information (e.g., email). Each wallet is used as a smart account to sign blockchain transactions and perform operations across supported protocols.

The SDK includes a Router Protocol, which selects the optimal farming protocol and vault based on parameters provided by the integrator (e.g., risk level, preferences, etc.). Once selected, the protocol is used internally by the SDK for subsequent user operations.

### Key capabilities

- **Create wallet** — Initializes an embedded wallet tied to user data (like email)
- **Fund wallet via Coinbase (soon)** — Generates a top-up link for the user to deposit funds
- **Earn command** — Allocates deposited assets into a protocol or vault recommended by the SDK
- **Withdraw** — Allows withdrawing part or all of the user's funds from the protocol
- **Get balance** — Retrieves the balance and performance of assets held within protocols
- **Router protocol** — Determines the best protocol and vault to use based on the integrator's strategy and risk preferences

## Requirements & installation

### Prerequisites

1. pnpm >= 10.9.0
2. node >= 22.11.0
3. TypeScript >= 5.0.0

### Installation

Install dependencies:

```bash
pnpm install
```

Build the SDK:

```bash
pnpm run build
```

The built SDK can then be used in your application or imported as a local library

## Initialization Example

```typescript
this.sdk = new MyceliumSDK({
  walletsConfig: {
    embeddedWalletConfig: {
      provider: {
        type: 'privy',
        providerConfig: {
          appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
          appSecret: process.env.NEXT_PUBLIC_PRIVY_APP_SECRET!,
        },
      },
    },
    smartWalletConfig: {
      provider: {
        type: 'default',
      },
    },
  },
  chain: {
    chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID!) as any,
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
    bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL!,
  },
  protocolsRouterConfig: {
    riskLevel: 'medium',
  },
});
```

> To get more information about what protocols and chains are available for SDK, refer to the `Protocol router` section below

## Local development

Install dependencies:

```bash
pnpm install
```

Build the SDK in watch mode:

```bash
pnpm run watch
```

Run tests:

```bash
pnpm run test
```

Run tests in watch mode:

```bash
pnpm run test:watch
```

## Documentation

The SDK should be documented and described with [TypeDoc rules](https://typedoc.org/). To get more context, check [CONTRIBUTION.md](https://github.com/0xdeval/mycelium-sdk/blob/main/CONTRIBUTION.md)

To generate documentation:

```bash
# Generate public documentation
pnpm run docs:public

# Generate development documentation
pnpm run docs:dev
```

## Chain management

The chain configuration provided during SDK initialization defines where on-chain activities will take place. Currently, only one chain is supported for the `earn` functionality, with multi-chain support coming soon
The example configuration above uses Base chain (chain ID: 8453), meaning all protocol operations and vault deposits will occur on the Base network

## Protocol router

Protocol router is the key component of the SDK that helps an integrator (app/web2 product) to select the best protocol and vault to deposit user's funds.
The only requirement from an integrator is to define a high-level settings for protocols, e.g. min APY, protocol risk level, etc

The SDK will use settings and find the best protocol and vault under the hood. No one, including integrator, will need to care about this part

The full list of protocol and chains along with they can be used is the following:

| Protocol                   | Chain | ChainId |
| -------------------------- | ----- | ------- |
| [Spark](https://spark.fi/) | Base  | 8453    |

More protocol and chains will be added soon

## Contribution

Check the [CONTRIBUTION.md](https://github.com/0xdeval/mycelium-sdk/blob/main/CONTRIBUTION.md)

## License

This project is licensed under the dual license - Apache 2.0 + Commercial - see the [LICENSE](https://github.com/0xdeval/mycelium-sdk/blob/main/LICENSE)
