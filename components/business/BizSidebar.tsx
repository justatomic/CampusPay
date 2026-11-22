'use client';

import { Zap, LayoutDashboard, Clock, Settings, LogOut, TrendingUp } from 'lucide-react';
import { useWallet } from '@/lib/wallet-context';
import { useProfile } from '@/lib/profile-context';
import { formatXLM, shortenAddress } from '@/lib/stellar';
import type { BizTabId } from '@/lib/types';

const NAV: { id: BizTabId; icon: typeof LayoutDashboard; label: string }[] = [
  { id: 'pos',      icon: LayoutDashboard, label: 'POS Terminal' },
  { id: 'history',  icon: Clock,           label: 'Sales History' },
  { id: 'settings', icon: Settings,        label: 'Settings'      },
];

export function BizSidebar({ active, onTab }: { active: BizTabId; onTab: (t: BizTabId) => void }) {
  const { wallet, disconnect } = useWallet();
  const { profile } = useProfile();
  const biz = profile.business;

  return (
    <aside className="biz-sidebar flex flex-col p-5 gap-6">
      {/* Logo */}
      <div className="flex items-center gap-3 pt-2 pb-1">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(145deg,#1d4ed8,#2563eb)' }}>
          <Zap size={18} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none">CampusPay</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Business</p>
        </div>
      </div>

      {/* Business profile card */}
      <div className="card p-4 flex flex-col gap-2">
        {biz.photoUrl ? (
          <img src={biz.photoUrl} alt="" className="w-12 h-12 rounded-2xl object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
            style={{ background: 'rgba(37,99,235,0.18)' }}>
            🏪
          </div>
        )}
        <div>
          <p className="text-white font-semibold text-sm leading-tight">
            {biz.name || 'Your Business'}
          </p>
          {biz.category && (
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{biz.category}</p>
          )}
        </div>
        <div className="mt-1 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Balance</p>
          <p className="text-white font-bold text-lg">{formatXLM(wallet.balance ?? '0')} <span className="text-sm font-normal" style={{ color: 'rgba(255,255,255,0.4)' }}>XLM</span></p>
          <p className="text-xs font-mono mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{shortenAddress(wallet.publicKey ?? '', 7)}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(({ id, icon: Icon, label }) => {
          const isActive = active === id;
          return (
            <button key={id} onClick={() => onTab(id)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all"
              style={{
                background:  isActive ? 'rgba(37,99,235,0.15)' : 'transparent',
                color:       isActive ? '#60a5fa' : 'rgba(255,255,255,0.5)',
                borderLeft:  isActive ? '2px solid #2563eb' : '2px solid transparent',
                fontWeight:  isActive ? '600' : '400',
                fontSize: '14px',
              }}>
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </nav>

      <button onClick={disconnect}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors"
        style={{ color: 'rgba(255,255,255,0.3)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
        <LogOut size={14} /> Disconnect
      </button>
    </aside>
  );
}
