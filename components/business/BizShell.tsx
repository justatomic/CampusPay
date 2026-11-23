'use client';

import { useState } from 'react';
import { LayoutDashboard, Clock, Settings, Zap } from 'lucide-react';
import { BizSidebar }         from './BizSidebar';
import { POSTerminal }        from './POSTerminal';
import { BizSettings }        from './BizSettings';
import { TransactionHistory } from '../TransactionHistory';
import { useProfile }         from '@/lib/profile-context';
import { useWallet }          from '@/lib/wallet-context';
import { formatXLM }          from '@/lib/stellar';
import type { BizTabId }      from '@/lib/types';

const MOB_NAV: { id: BizTabId; icon: typeof LayoutDashboard; label: string }[] = [
  { id: 'pos',      icon: LayoutDashboard, label: 'POS'      },
  { id: 'history',  icon: Clock,           label: 'Sales'    },
  { id: 'settings', icon: Settings,        label: 'Settings' },
];

const TITLES: Record<BizTabId, { title: string; sub: string }> = {
  pos:      { title: 'POS Terminal',   sub: 'Accept payments · NFC tap · QR codes'  },
  history:  { title: 'Sales History',  sub: 'All incoming payments from customers'  },
  settings: { title: 'Settings',       sub: 'Business profile and account options'  },
};

export function BizShell() {
  const [tab, setTab]  = useState<BizTabId>('pos');
  const { profile }    = useProfile();
  const { wallet }     = useWallet();
  const biz            = profile.business;

  return (
    <div className="biz-shell">
      {/* Desktop sidebar — hidden on mobile via CSS */}
      <BizSidebar active={tab} onTab={setTab} />

      {/* Main content area */}
      <div className="biz-main-wrap flex-1">

        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3.5 mb-4"
          style={{ background: 'rgba(8,15,30,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}>
              <Zap size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-none">{biz.name || 'My Business'}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{TITLES[tab].title}</p>
            </div>
          </div>
          <span className="text-sm font-bold text-white">{formatXLM(wallet.balance ?? '0')} XLM</span>
        </div>

        {/* Desktop page header */}
        <div className="hidden lg:flex items-center justify-between mb-7">
          <div>
            <h1 className="text-white font-bold" style={{ fontSize: '26px', letterSpacing: '-0.02em' }}>{TITLES[tab].title}</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{TITLES[tab].sub}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-glow" />
            <span className="text-xs text-emerald-400 font-medium">Testnet · Live</span>
          </div>
        </div>

        {/* Tab content */}
        {tab === 'pos'      && <POSTerminal />}
        {tab === 'history'  && <TransactionHistory incomingOnly />}
        {tab === 'settings' && <BizSettings />}
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex"
        style={{ background: 'rgba(8,15,30,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        {MOB_NAV.map(({ id, icon: Icon, label }) => {
          const on = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-all">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{ background: on ? 'rgba(37,99,235,0.15)' : 'transparent' }}>
                <Icon size={17} style={{ color: on ? '#60a5fa' : 'rgba(255,255,255,0.3)', strokeWidth: on ? 2.5 : 2 }} />
              </div>
              <span className="text-xs font-medium transition-colors"
                style={{ color: on ? '#60a5fa' : 'rgba(255,255,255,0.3)' }}>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
