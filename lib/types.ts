// ── Wallet ──────────────────────────────────────────────
export interface WalletState {
  publicKey:  string | null;
  balance:    string | null;
  connected:  boolean;
  loading:    boolean;
  error:      string | null;
}

// ── Transactions ─────────────────────────────────────────
export interface Transaction {
  id:           string;
  type:         'send' | 'receive';
  amount:       string;
  asset:        string;
  counterparty: string;
  memo:         string;
  createdAt:    string;
  successful:   boolean;
}

// ── Split bill ───────────────────────────────────────────
export interface SplitBill {
  id:           string;
  title:        string;
  totalAmount:  string;
  participants: Participant[];
  createdAt:    string;
  status:       'pending' | 'settled';
}

export interface Participant {
  address: string;
  alias:   string;
  amount:  string;
  paid:    boolean;
}

// ── QR ───────────────────────────────────────────────────
export interface QRPaymentData {
  address:  string;
  amount?:  string;
  memo?:    string;
  asset?:   string;
}

// ── Routing ──────────────────────────────────────────────
// customer tabs (now includes settings)
export type TabId    = 'dashboard' | 'send' | 'receive' | 'split' | 'history' | 'settings';
// business tabs
export type BizTabId = 'pos' | 'history' | 'settings';

// ── Toast ────────────────────────────────────────────────
export interface ToastMessage {
  id:      string;
  type:    'success' | 'error';
  message: string;
}

// ── User profile ─────────────────────────────────────────
export type UserRole = 'customer' | 'business';

export interface BusinessProfile {
  name:     string;
  category: string;
  photoUrl: string;
}

export interface UserProfile {
  role:     UserRole;
  business: BusinessProfile;
}
