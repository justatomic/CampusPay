'use client';

import { useState } from 'react';
import { LayoutDashboard, Clock, Settings, Menu, X, Zap } from 'lucide-react';
import { BizSidebar }  from './BizSidebar';
import { POSTerminal } from './POSTerminal';
import { BizSettings } from './BizSettings';
import { TransactionHistory } from '../TransactionHistory';
import { useProfile }  from '@/lib/profile-context';
import { useWallet }   from '@/lib/wallet-context';
import { formatXLM, shortenAddress } from '@/lib/stellar';
import type { BizTabId } from '@/lib/types';

const MOB_NAV: { id: BizTabId; icon: typeof LayoutDashboard; label: string }[] = [
  { id: 'pos',      icon: LayoutDashboard, label: 'POS'      },
  { id: 'history',  icon: Clock,           label: 'History'  },
  { id: 'settings', icon: Settings,        label: 'Settings' },
];

export function BizShell() {
  const [tab, setTab]           = useState<BizTabId>('pos');
  const { profile }             = useProfile();
  const { wallet }              = useWallet();
  const biz                     = profile.business;

  const titles: Record<BizTabId, string> = {
    pos:      'POS Terminal',
    history:  'Sales History',
    settings: 'Settings',
  };

  return (
    <div className="biz-shell" style={{ background: 'var(--navy)' }}>
      {/* Desktop sidebar */}
      <BizSidebar active={tab} onTab={setTab} />

      {/* Main area */}
      <div className="biz-main flex-1">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3.5 mb-4"
          style={{ background: 'rgba(8,15,30,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(145deg,#1d4ed8,#2563eb)' }}>
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-none">{biz.name || 'My Business'}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{titles[tab]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{formatXLM(wallet.balance ?? '0')} XLM</span>
          </div>
        </div>

        {/* Desktop page title */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{titles[tab]}</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {tab === 'pos' ? 'Accept payments and manage your NFC tap link' :
               tab === 'history' ? 'All incoming payments from customers' :
               'Profile and account settings'}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">Testnet · Live</span>
          </div>
        </div>

        {/* Content */}
        {tab === 'pos'      && <POSTerminal />}
        {tab === 'history'  && <TransactionHistory incomingOnly />}
        {tab === 'settings' && <BizSettings />}
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex"
        style={{ background: 'rgba(8,15,30,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        {MOB_NAV.map(({ id, icon: Icon, label }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-all">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{ background: active ? 'rgba(37,99,235,0.15)' : 'transparent' }}>
                <Icon size={17} style={{ color: active ? '#60a5fa' : 'rgba(255,255,255,0.3)', strokeWidth: active ? 2.5 : 2 }} />
              </div>
              <span className="text-xs font-medium" style={{ color: active ? '#60a5fa' : 'rgba(255,255,255,0.3)' }}>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
