export interface WalletState {
  publicKey: string | null;
  balance: string | null;
  connected: boolean;
  loading: boolean;
  error: string | null;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: string;
  asset: string;
  counterparty: string;
  memo: string;
  createdAt: string;
  successful: boolean;
}

export interface SplitBill {
  id: string;
  title: string;
  totalAmount: string;
  participants: Participant[];
  createdAt: string;
  status: 'pending' | 'settled';
}

export interface Participant {
  address: string;
  alias: string;
  amount: string;
  paid: boolean;
}

export interface QRPaymentData {
  address: string;
  amount?: string;
  memo?: string;
  asset?: string;
}

export type TabId = 'dashboard' | 'send' | 'receive' | 'split' | 'history';
