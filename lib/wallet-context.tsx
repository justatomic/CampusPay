'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  requestPublicKey, getBalance, getTransactions,
  detectWallet, walletName, type TxRecord,
} from './stellar';

interface WalletState {
  publicKey:  string | null;
  balance:    string | null;
  connected:  boolean;
  loading:    boolean;
  error:      string | null;
  walletType: ReturnType<typeof detectWallet>;
}

interface WalletCtx {
  wallet:       WalletState;
  transactions: TxRecord[];
  connect:      () => Promise<void>;
  disconnect:   () => void;
  refresh:      () => Promise<void>;
  walletLabel:  string;
}

const Ctx = createContext<WalletCtx | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    publicKey: null, balance: null, connected: false,
    loading: false, error: null, walletType: null,
  });
  const [transactions, setTransactions] = useState<TxRecord[]>([]);

  const connect = useCallback(async () => {
    setWallet(w => ({ ...w, loading: true, error: null }));
    try {
      const pubKey = await requestPublicKey();
      const [balance, txs] = await Promise.all([
        getBalance(pubKey),
        getTransactions(pubKey),
      ]);
      setWallet({ publicKey: pubKey, balance, connected: true, loading: false, error: null, walletType: detectWallet() });
      setTransactions(txs);
    } catch (e: any) {
      setWallet(w => ({ ...w, loading: false, error: e?.message ?? 'Connection failed' }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({ publicKey: null, balance: null, connected: false, loading: false, error: null, walletType: null });
    setTransactions([]);
  }, []);

  const refresh = useCallback(async () => {
    if (!wallet.publicKey) return;
    const [balance, txs] = await Promise.all([
      getBalance(wallet.publicKey),
      getTransactions(wallet.publicKey),
    ]);
    setWallet(w => ({ ...w, balance }));
    setTransactions(txs);
  }, [wallet.publicKey]);

  return (
    <Ctx.Provider value={{
      wallet, transactions, connect, disconnect, refresh,
      walletLabel: walletName(wallet.walletType),
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useWallet must be inside WalletProvider');
  return ctx;
}
