'use client';

import { Home, Send, ArrowDownToLine, Users, Settings, HelpCircle, Wifi } from 'lucide-react';
import type { TabId } from '@/lib/types';
import { useWallet }  from '@/lib/wallet-context';
import { formatXLM }  from '@/lib/stellar';

const NAV_ITEMS: { id: TabId; icon: typeof Home; label: string }[] = [
  { id: 'dashboard', icon: Home,            label: 'Home'    },
  { id: 'send',      icon: Send,            label: 'Send'    },
  { id: 'receive',   icon: ArrowDownToLine, label: 'Receive' },
  { id: 'split',     icon: Users,           label: 'Split'   },
  { id: 'settings',  icon: Settings,        label: 'Settings'},
];

interface SidebarProps { active: TabId; onChange: (tab: TabId) => void; }

export function Sidebar({ active, onChange }: SidebarProps) {
  const { wallet } = useWallet();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 4px 24px' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 3L20 7V17L12 21L4 17V7L12 3Z" fill="white" fillOpacity="0.9"/>
            <path d="M12 7L16 9V15L12 17L8 15V9L12 7Z" fill="#7CC744"/>
          </svg>
        </div>
        <span style={{ color: 'white', fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em' }}>CampusPay</span>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
          <button key={id} className={`sidebar-nav-item${active === id ? ' active' : ''}`} onClick={() => onChange(id)}>
            <Icon size={17} strokeWidth={active === id ? 2.5 : 2} />
            {label}
          </button>
        ))}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Testnet indicator */}
      <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(124,199,68,0.12)', border: '1px solid rgba(124,199,68,0.2)', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7CC744', display: 'inline-block' }} />
          <span style={{ color: '#7CC744', fontSize: 12, fontWeight: 700 }}>Testnet</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Stellar Test Network</p>
      </div>

      {/* CampusPay Tap promo */}
      <div style={{ padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Wifi size={15} style={{ color: '#7CC744' }} />
          <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>CampusPay Tap</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, lineHeight: 1.4 }}>
          Tap. Pay. Repeat. with CampusPay Tap
        </p>
        <button onClick={() => onChange('settings')} style={{ marginTop: 8, background: '#7CC744', color: '#1A3D2B', border: 'none', borderRadius: 7, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
          Learn more →
        </button>
      </div>

      {/* Help */}
      <button className="sidebar-nav-item" style={{ fontSize: 12 }}>
        <HelpCircle size={15} />Need help? Contact support
      </button>
    </aside>
  );
}
