import type {
  CreateSmartWalletOptions,
  CreateWalletWithEmbeddedSignerOptions,
  GetEmbeddedWalletOptions,
  GetSmartWalletOptions,
  GetSmartWalletWithEmbeddedSignerOptions,
} from '@/types/wallet';
import type { EmbeddedWallet } from '@/wallet/base/wallets/EmbeddedWallet';
import type { SmartWallet } from '@/wallet/base/wallets/SmartWallet';
import type { WalletProvider } from '@/wallet/WalletProvider';

/**
 * Public wallet namespace that exposes unified wallet operations
 *
 * @public
 * @category Wallets creation and retrieval
 * @remarks
 * This class is returned by {@link MyceliumSDK} and provides a simplified
 * interface for wallet creation and retrieval. Advanced functionality can be accessed through
 * the underlying providers via the getters {@link embeddedWalletProvider} and
 * {@link smartWalletProvider}
 *
 * Typical flows:
 * - Create embedded wallet only: {@link createEmbeddedWallet}
 * - Create smart wallet only (you provide signer/owners): {@link createSmartWallet}
 * - Create smart wallet with embedded as signer: {@link createWalletWithEmbeddedSigner}
 * - Get smart wallet using embedded as signer: {@link getSmartWalletWithEmbeddedSigner}
 * - Get smart wallet using a provided signer: {@link getSmartWallet}
 */
export class WalletNamespace {
  /**
   * Internal provider facade that implements the actual logic
   * @internal
   */
  private provider: WalletProvider;

  /**
   * Creates a wallet namespace to manage embedded and smart wallets
   * @param provider Unified provider that composes embedded & smart providers
   */
  constructor(provider: WalletProvider) {
    this.provider = provider;
  }

  /**
   * Creates an embedded wallet
   *
   * @public
   * @category Creation
   * @remarks
   * Thin wrapper around the embedded wallet provider’s `createWallet`
   *
   * @returns Promise that resolves to the newly created {@link EmbeddedWallet}
   */
  async createEmbeddedWallet(): Promise<EmbeddedWallet> {
    return this.provider.createEmbeddedWallet();
  }

  /**
   * Creates a smart wallet (you provide signer and owners)
   *
   * @public
   * @category Creation
   * @remarks
   * Use this when you already control a signer (e.g., `LocalAccount`) and want to
   * create a smart wallet without creating an embedded wallet
   *
   * @param params Smart wallet creation parameters
   * @param params.owners Owners for the smart wallet (addresses or WebAuthn public keys)
   * @param params.signer Local account used for signing transactions
   * @param params.nonce Optional nonce/salt for deterministic address generation (defaults to 0)
   * @returns Promise that resolves to the created {@link SmartWallet}
   */
  async createSmartWallet(params: CreateSmartWalletOptions): Promise<SmartWallet> {
    return this.provider.createSmartWallet(params);
  }

  /**
   * Creates a smart wallet with an embedded wallet as signer
   *
   * @public
   * @category Creation
   * @remarks
   * Creates an embedded wallet first, inserts its address into the owners array,
   * and uses its account as the signer for the smart wallet
   *
   * @param params Optional creation parameters
   * @param params.owners Optional additional owners. The embedded wallet address is inserted at the specified index
   * @param params.embeddedWalletIndex Optional index at which to insert the embedded wallet address (defaults to end)
   * @param params.nonce Optional nonce/salt for deterministic address generation (defaults to 0)
   * @returns Promise that resolves to the created {@link SmartWallet}
   */
  async createWalletWithEmbeddedSigner(
    params?: CreateWalletWithEmbeddedSignerOptions,
  ): Promise<SmartWallet> {
    return this.provider.createWalletWithEmbeddedSigner(params);
  }

  /**
   * Gets a smart wallet using an embedded wallet as the signer
   *
   * @public
   * @category Retrieval
   * @remarks
   * Looks up an embedded wallet by `walletId` and uses it as signer
   * If neither `walletAddress` nor `deploymentOwners` is provided, defaults to using
   * the embedded wallet as the single owner for deterministic address calculation
   *
   * @param params Retrieval parameters
   * @param params.walletId Embedded wallet ID used to locate the signer wallet
   * @param params.deploymentOwners Optional original deployment owners used for address calculation
   * @param params.signerOwnerIndex Index of the signer within the **current** owners set (defaults to 0)
   * @param params.walletAddress Optional explicit smart wallet address (skips calculation)
   * @param params.nonce Optional nonce used during original creation
   * @returns Promise that resolves to the {@link SmartWallet}
   * @throws Error if the embedded wallet cannot be found
   */
  async getSmartWalletWithEmbeddedSigner(params: GetSmartWalletWithEmbeddedSignerOptions) {
    return this.provider.getSmartWalletWithEmbeddedSigner(params);
  }

  /**
   * Gets an existing embedded wallet by ID
   *
   * @public
   * @category Retrieval
   * @param params Retrieval parameters
   * @param params.walletId Embedded wallet ID to retrieve
   * @returns Promise that resolves to the {@link EmbeddedWallet} (or `null/undefined` per provider contract)
   */
  async getEmbeddedWallet(params: GetEmbeddedWalletOptions) {
    return this.provider.getEmbeddedWallet(params);
  }

  /**
   * Gets a smart wallet using a provided signer
   *
   * @public
   * @category Retrieval
   * @remarks
   * Use when you already control a signer. Requires either:
   * - `walletAddress`, or
   * - `deploymentOwners` (+ optional `nonce`) to derive the address
   *
   * @param params Retrieval parameters
   * @param params.signer Signer (local account)
   * @param params.deploymentOwners Original deployment owners (required if `walletAddress` is not provided)
   * @param params.signerOwnerIndex Index of the signer within the **current** owners set (defaults to 0)
   * @param params.walletAddress Explicit smart wallet address (skips calculation)
   * @param params.nonce Optional nonce used during original creation
   * @returns Promise that resolves to the {@link SmartWallet}
   * @throws Error if neither `walletAddress` nor `deploymentOwners` is provided
   */
  async getSmartWallet(params: GetSmartWalletOptions) {
    return this.provider.getSmartWallet(params);
  }
}
