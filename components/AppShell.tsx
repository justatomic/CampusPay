'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@/lib/wallet-context';
import { ConnectWallet } from './ConnectWallet';
import { Dashboard } from './Dashboard';
import { SendPayment } from './SendPayment';
import { ReceivePayment } from './ReceivePayment';
import { SplitBill } from './SplitBill';
import { TransactionHistory } from './TransactionHistory';
import { BottomNav } from './BottomNav';
import { Toast } from './ui/Toast';
import type { TabId } from '@/lib/types';
import type { ToastMessage } from './ui/Toast';

export function AppShell() {
  const { wallet } = useWallet();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (!wallet.connected) {
    return <ConnectWallet />;
  }

  const tabTitles: Record<TabId, string> = {
    dashboard: 'CampusPay',
    send: 'Send XLM',
    receive: 'Receive XLM',
    split: 'Split Bill',
    history: 'History',
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--navy)' }}>
      {/* Top header */}
      <header
        className="sticky top-0 z-40 px-4 py-4"
        style={{
          background: 'rgba(10, 22, 40, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}
            >
              <span className="text-white text-xs font-bold">⚡</span>
            </div>
            <span className="text-white font-semibold text-base">{tabTitles[activeTab]}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: '#10b981', boxShadow: '0 0 6px #10b981' }}
            />
            <span className="text-xs text-white/40 font-medium">Testnet</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-md mx-auto px-4 pt-5 pb-28">
        {activeTab === 'dashboard' && (
          <Dashboard onTabChange={setActiveTab} />
        )}
        {activeTab === 'send' && (
          <SendPayment onSuccess={() => addToast('success', 'Payment sent successfully!')} />
        )}
        {activeTab === 'receive' && <ReceivePayment />}
        {activeTab === 'split' && <SplitBill />}
        {activeTab === 'history' && <TransactionHistory />}
      </main>

      {/* Bottom navigation */}
      <BottomNav active={activeTab} onChange={setActiveTab} />

      {/* Toast stack */}
      <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2 max-w-xs w-full">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </div>
  );
}
