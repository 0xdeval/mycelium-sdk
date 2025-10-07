export interface WalletInfoProps {
  walletId: string;
  walletAddress: string;
  error: string;
}

export interface WalletData {
  balances: {
    symbol: string;
    balance: bigint;
    formattedBalance: string;
  }[];
}
