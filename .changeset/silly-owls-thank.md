---
'@mycelium-sdk/core': major
---

1. Removed redundant methods for a WalletNamespace
2. Moved `getTopUpConfig()` and `getCashOutConfig()` methods to a separate `FundingNamespace`
3. Change public methods for creating a smart wallet with an embedded signer under the hood in `WalletNamespace`:

- Was: `createWalletWithEmbeddedSigner()` and `getSmartWalletWithEmbeddedSigner()`
- Become: `createAccount()` and `getAccount()`

4. Edited all related tests
5. Updated all related docs
6. Rename a public type `RampConfigResponse` to `FundingOptionsResponse`
