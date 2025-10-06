# Mycelium SDK

A comprehensive TypeScript-based monorepo providing seamless access to ILD (Intelligent Liquidity Distribution) yield opportunities through Web3 protocols. This project includes the core SDK, a demo frontend application, and blockchain services for local development and testing.

## Project structure

This monorepo is organized into three main packages:

- **[packages/sdk](https://github.com/0xdeval/mycelium-sdk/blob/main/packages/sdk)** - TypeScript Mycelium SDK
- **[packages/frontend](https://github.com/0xdeval/mycelium-sdk/blob/main/packages/frontend)** - Mycelium app - Next.js demo application showcasing SDK capabilities
- **[packages/blockchain](https://github.com/0xdeval/mycelium-sdk/blob/main/packages/blockchain)** - Local blockchain service with faucet functionality and an ability to access fork RPC and Bundler (Alto)

## Prerequisites

- **pnpm** >= 10.9.0
- **node** >= 22.11.0
- **TypeScript** >= 5.0.0
- **Anvil** >= 1.2.3 (for blockchain package)

## Installation

Install all dependencies across the monorepo:

```bash
pnpm install
```

## Development with Turbo

This project uses [Turbo](https://turbo.build/) for efficient monorepo management and build orchestration

### Available commands

**Build all packages:**

```bash
pnpm run build
```

**Run development servers:**

```bash
pnpm run dev
```

**Run tests across all packages:**

```bash
pnpm run test
```

**Clean build artifacts:**

```bash
pnpm run clean
```

### Packages

For each separate installation guide, please check each package separately:

- [packages/sdk](https://github.com/0xdeval/mycelium-sdk/blob/main/packages/sdk/README.md)
- [packages/frontend](https://github.com/0xdeval/mycelium-sdk/blob/main/packages/frontend/README.md)
- [packages/blockchain](https://github.com/0xdeval/mycelium-sdk/blob/main/packages/blockchain/README.md)

## Development tools

### Code quality

**ESLint:**

- TypeScript-specific rules
- React/Next.js best practices
- Consistent import patterns
- Strict type checking

**Run linting:**

```bash
pnpm run lint
```

**Prettier formatting:**

```bash
pnpm run format        # Check formatting
pnpm run format:fix    # Fix formatting issues
```

**Spell checking:**

```bash
pnpm run spell
```

### Testing

**Run all tests:**

```bash
pnpm run test
```

**SDK-specific testing:**

```bash
cd packages/sdk
pnpm run test:watch    # Watch mode
```

## Documentation

Generate comprehensive documentation:

```bash
cd packages/sdk
pnpm run docs:public   # Public API documentation
pnpm run docs:dev      # Development documentation
```

## Environment variables

### Frontend

```bash
# Required
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
NEXT_PUBLIC_PRIVY_APP_SECRET=your-privy-app-secret

# Optional
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=your-rpc-url
NEXT_PUBLIC_BUNDLER_URL=your-bundler-url
```

### Blockchain service

```bash
# Required
FORK_RPC_URL="<your-fork-rpc-url>"
BUNDLER_URL="<your-bundler-url>"

# Optional
MAINNET_RPC=https://eth.llamarpc.com
EXPRESS_PORT=3001
NODE_CMD=bun
EXPRESS_ENTRY=src/service.ts
```

## Contributing

Check the [CONTRIBUTION.md](https://github.com/0xdeval/mycelium-sdk/blob/main/CONTRIBUTION.md)

## License

This project is licensed under the dual license - Apache 2.0 + Commercial - see the [LICENSE](https://github.com/0xdeval/mycelium-sdk/blob/main/LICENSE.md)
