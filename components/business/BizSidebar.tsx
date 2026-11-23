'use client';

import { LayoutDashboard, Clock, Settings, Zap } from 'lucide-react';
import type { BizTabId } from '@/lib/types';
import { useProfile }   from '@/lib/profile-context';
import { useWallet }    from '@/lib/wallet-context';
import { formatXLM, shortenAddress } from '@/lib/stellar';

const NAV: { id: BizTabId; icon: typeof LayoutDashboard; label: string }[] = [
  { id: 'pos',      icon: LayoutDashboard, label: 'POS Terminal' },
  { id: 'history',  icon: Clock,           label: 'Sales'        },
  { id: 'settings', icon: Settings,        label: 'Settings'     },
];

interface BizSidebarProps { active: BizTabId; onTab: (t: BizTabId) => void; }

export function BizSidebar({ active, onTab }: BizSidebarProps) {
  const { profile } = useProfile();
  const { wallet }  = useWallet();
  const biz = profile.business;

  return (
    <aside className="biz-sidebar-wrap">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 3L20 7V17L12 21L4 17V7L12 3Z" fill="white" fillOpacity="0.9"/>
            <path d="M12 7L16 9V15L12 17L8 15V9L12 7Z" fill="#7CC744"/>
          </svg>
        </div>
        <div>
          <span style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>CampusPay</span>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 1 }}>Business</p>
        </div>
      </div>

      {/* Biz info */}
      <div style={{ padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', marginBottom: 8 }}>
        <p style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{biz.name || 'My Business'}</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>{biz.category || 'Business'}</p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 6, fontFamily: 'monospace' }}>
          {shortenAddress(wallet.publicKey || '', 8)}
        </p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 'auto' }}>
        {NAV.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTab(id)}
            className={`sidebar-nav-item${active === id ? ' active' : ''}`}
          >
            <Icon size={17} strokeWidth={active === id ? 2.5 : 2} />{label}
          </button>
        ))}
      </nav>

      <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(124,199,68,0.12)', border: '1px solid rgba(124,199,68,0.2)', marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7CC744', display: 'inline-block' }} />
          <span style={{ color: '#7CC744', fontSize: 11, fontWeight: 700 }}>Testnet · Live</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>Stellar Test Network</p>
      </div>
    </aside>
  );
}
