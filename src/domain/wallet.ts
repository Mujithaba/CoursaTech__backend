interface IWalletHistory {
  type?: string;
  amount?: number;
  reason?: string;
  date: Date;
}

export interface IWallet {
  userId: string;
  balance: number;
  history: IWalletHistory[];
}
