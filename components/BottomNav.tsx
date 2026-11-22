'use client';

import { LayoutDashboard, Send, QrCode, Users, Clock, Settings } from 'lucide-react';
import type { TabId } from '@/lib/types';

const TABS: { id: TabId; icon: typeof LayoutDashboard; label: string }[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Home'    },
  { id: 'send',      icon: Send,            label: 'Send'    },
  { id: 'receive',   icon: QrCode,          label: 'Receive' },
  { id: 'split',     icon: Users,           label: 'Split'   },
  { id: 'history',   icon: Clock,           label: 'History' },
  { id: 'settings',  icon: Settings,        label: 'Settings'},
];

export function BottomNav({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex"
      style={{
        background:    'rgba(8,15,30,0.96)',
        backdropFilter: 'blur(20px)',
        borderTop:     '1px solid rgba(255,255,255,0.07)',
        maxWidth: '480px',
        margin: '0 auto',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
      }}>
      {TABS.map(({ id, icon: Icon, label }) => {
        const active_ = active === id;
        return (
          <button key={id} onClick={() => onChange(id)}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-all">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center transition-all"
              style={{ background: active_ ? 'rgba(37,99,235,0.18)' : 'transparent' }}>
              <Icon size={16} style={{ color: active_ ? '#60a5fa' : 'rgba(255,255,255,0.3)', strokeWidth: active_ ? 2.5 : 2 }} />
            </div>
            <span className="text-[10px] font-medium" style={{ color: active_ ? '#60a5fa' : 'rgba(255,255,255,0.3)' }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
