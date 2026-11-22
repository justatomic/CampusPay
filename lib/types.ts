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

export interface TxRecord {
  id:           string;
  type:         'send' | 'receive';
  amount:       string;
  asset:        string;
  counterparty: string;
  memo:         string;
  createdAt:    string;
}

export type TabId = 'dashboard' | 'send' | 'receive' | 'split' | 'history' | 'settings';
export type BizTabId = 'pos' | 'history' | 'settings';

export interface ToastMsg {
  id:      string;
  type:    'success' | 'error' | 'info';
  message: string;
}
