'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { WalletState, Transaction, GoogleUser, AuthMethod } from './types';
import {
  getBalance,
  getTransactions,
  getFreighterPublicKey,
  isFreighterInstalled,
  fundTestnetAccount,
} from './stellar';
import { deriveKeypairFromGoogle, decodeGoogleCredential } from './google-auth';
import { Keypair } from '@stellar/stellar-sdk';

interface WalletContextValue {
  wallet:           WalletState;
  transactions:     Transaction[];
  googleUser:       GoogleUser | null;
  authMethod:       AuthMethod | null;
  // local keypair (Google auth only — for signing)
  localKeypair:     Keypair | null;
  connect:          () => Promise<void>;
  connectWithGoogle:(credential: string) => Promise<void>;
  disconnect:       () => void;
  refresh:          () => Promise<void>;
  varialAvailable:  boolean;
  isMobile:         boolean;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet]           = useState<WalletState>({ publicKey: null, balance: null, connected: false, loading: false, error: null });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [googleUser, setGoogleUser]   = useState<GoogleUser | null>(null);
  const [authMethod, setAuthMethod]   = useState<AuthMethod | null>(null);
  const [varialAvailable, setVarialAvailable] = useState(false);
  const [isMobile, setIsMobile]       = useState(false);
  const localKeypairRef               = useRef<Keypair | null>(null);

  useEffect(() => {
    isFreighterInstalled().then(setVarialAvailable);
    // Detect mobile (no extension environment)
    setIsMobile(/iPhone|iPad|Android/i.test(navigator.userAgent));
  }, []);

  /* ── Varial (Freighter extension) connect ─────────────── */
  const connect = useCallback(async () => {
    setWallet(w => ({ ...w, loading: true, error: null }));
    try {
      const pubKey = await getFreighterPublicKey();
      if (!pubKey) throw new Error('Could not get public key from Varial Wallet');
      const [balance, txs] = await Promise.all([getBalance(pubKey), getTransactions(pubKey)]);
      setWallet({ publicKey: pubKey, balance, connected: true, loading: false, error: null });
      setTransactions(txs);
      setAuthMethod('varial');
    } catch (err: any) {
      setWallet(w => ({ ...w, loading: false, error: err.message || 'Connection failed' }));
    }
  }, []);

  /* ── Google OAuth connect ─────────────────────────────── */
  const connectWithGoogle = useCallback(async (credential: string) => {
    setWallet(w => ({ ...w, loading: true, error: null }));
    try {
      const user = decodeGoogleCredential(credential);
      setGoogleUser(user);

      // Derive deterministic Stellar keypair from Google sub
      const keypair = await deriveKeypairFromGoogle(user.sub);
      localKeypairRef.current = keypair;
      const pubKey = keypair.publicKey();

      // Fund via Friendbot on first use (testnet only — harmless if already funded)
      await fundTestnetAccount(pubKey);

      const [balance, txs] = await Promise.all([getBalance(pubKey), getTransactions(pubKey)]);
      setWallet({ publicKey: pubKey, balance, connected: true, loading: false, error: null });
      setTransactions(txs);
      setAuthMethod('google');
    } catch (err: any) {
      setWallet(w => ({ ...w, loading: false, error: err.message || 'Google sign-in failed' }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({ publicKey: null, balance: null, connected: false, loading: false, error: null });
    setTransactions([]);
    setGoogleUser(null);
    setAuthMethod(null);
    localKeypairRef.current = null;
  }, []);

  const refresh = useCallback(async () => {
    if (!wallet.publicKey) return;
    const [balance, txs] = await Promise.all([getBalance(wallet.publicKey), getTransactions(wallet.publicKey)]);
    setWallet(w => ({ ...w, balance }));
    setTransactions(txs);
  }, [wallet.publicKey]);

  return (
    <WalletContext.Provider value={{
      wallet, transactions, googleUser, authMethod,
      localKeypair: localKeypairRef.current,
      connect, connectWithGoogle, disconnect, refresh,
      varialAvailable, isMobile,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
