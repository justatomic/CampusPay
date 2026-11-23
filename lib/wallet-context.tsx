'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { WalletState, Transaction } from './types';
import {
  getBalance,
  getTransactions,
  getFreighterPublicKey,
  isFreighterInstalled,
} from './stellar';

interface WalletContextValue {
  wallet: WalletState;
  transactions: Transaction[];
  connect: () => Promise<void>;
  disconnect: () => void;
  refresh: () => Promise<void>;
  varialAvailable: boolean;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    publicKey: null,
    balance: null,
    connected: false,
    loading: false,
    error: null,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [varialAvailable, setVarialAvailable] = useState(false);

  // Check Varial Wallet on mount
  useEffect(() => {
    isFreighterInstalled().then(setVarialAvailable);
  }, []);

  const connect = useCallback(async () => {
    setWallet((w) => ({ ...w, loading: true, error: null }));
    try {
      const pubKey = await getFreighterPublicKey();
      if (!pubKey) throw new Error('Could not get public key from Varial Wallet');

      const balance = await getBalance(pubKey);
      const txs = await getTransactions(pubKey);

      setWallet({
        publicKey: pubKey,
        balance,
        connected: true,
        loading: false,
        error: null,
      });
      setTransactions(txs);
    } catch (err: any) {
      setWallet((w) => ({
        ...w,
        loading: false,
        error: err.message || 'Connection failed',
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({
      publicKey: null,
      balance: null,
      connected: false,
      loading: false,
      error: null,
    });
    setTransactions([]);
  }, []);

  const refresh = useCallback(async () => {
    if (!wallet.publicKey) return;
    const balance = await getBalance(wallet.publicKey);
    const txs = await getTransactions(wallet.publicKey);
    setWallet((w) => ({ ...w, balance }));
    setTransactions(txs);
  }, [wallet.publicKey]);

  return (
    <WalletContext.Provider
      value={{ wallet, transactions, connect, disconnect, refresh, varialAvailable }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
