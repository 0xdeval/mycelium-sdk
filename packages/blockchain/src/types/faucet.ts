export interface FaucetRequestBody {
  to: string;
  amountEth?: string;
  amountUsdc?: string;
}

export interface FaucetResponse {
  ok: boolean;
  address: string;
  balance: string;
  usdcContractAddress?: string;
  transactionHash?: string;
  impersonatedAddress?: string;
}

export interface DropFundsResponse {
  ok: boolean;
  address: string;
  balanceEth: string;
  balanceUsdc: string;
}
