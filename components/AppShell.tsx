'use client';

import { useState } from 'react';
import { Zap } from 'lucide-react';
import { useWallet }   from '@/lib/wallet-context';
import { useProfile }  from '@/lib/profile-context';
import { ConnectWallet }      from './ConnectWallet';
import { Dashboard }          from './Dashboard';
import { SendPayment }        from './SendPayment';
import { ReceivePayment }     from './ReceivePayment';
import { SplitBill }          from './SplitBill';
import { TransactionHistory } from './TransactionHistory';
import { CustomerSettings }   from './customer/CustomerSettings';
import { BottomNav }          from './BottomNav';
import { BizShell }           from './business/BizShell';
import type { TabId } from '@/lib/types';

const TITLES: Record<TabId, string> = {
  dashboard: 'CampusPay',
  send:      'Send XLM',
  receive:   'Receive XLM',
  split:     'Split Bill',
  history:   'History',
  settings:  'Settings',
};

export function AppShell() {
  const { wallet }              = useWallet();
  const { isBusinessMode }      = useProfile();
  const [tab, setTab]           = useState<TabId>('dashboard');

  if (!wallet.connected) return <ConnectWallet />;
  if (isBusinessMode)    return <BizShell />;

  return (
    <div className="desktop-bg">
      <div className="app-mobile">
        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3.5"
          style={{ background: 'rgba(8,15,30,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(145deg,#1d4ed8,#2563eb)' }}>
              <Zap size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-white font-semibold text-[15px]">{TITLES[tab]}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 5px #10b981' }} />
            <span className="text-xs text-emerald-400 font-medium">Testnet</span>
          </div>
        </header>

        {/* Content */}
        <main className="px-4 pt-5 pb-28">
          {tab === 'dashboard' && <Dashboard onTab={setTab} />}
          {tab === 'send'      && <SendPayment />}
          {tab === 'receive'   && <ReceivePayment />}
          {tab === 'split'     && <SplitBill />}
          {tab === 'history'   && <TransactionHistory />}
          {tab === 'settings'  && <CustomerSettings />}
        </main>

        <BottomNav active={tab} onChange={setTab} />
      </div>
    </div>
  );
}
