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
