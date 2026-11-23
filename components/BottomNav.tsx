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

interface BottomNavProps {
  active:   TabId;
  onChange: (tab: TabId) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background:     'rgba(10, 22, 40, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop:      '1px solid rgba(255,255,255,0.08)',
        maxWidth:       '480px',
        margin:         '0 auto',
        left:           '50%',
        transform:      'translateX(-50%)',
        width:          '100%',
      }}
    >
      <div className="flex">
        {TABS.map(({ id, icon: Icon, label }) => {
          const on = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-all"
            >
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: on ? 'rgba(59,130,246,0.15)' : 'transparent',
                  transform:  on ? 'scale(1.08)' : 'scale(1)',
                }}
              >
                <Icon
                  size={16}
                  style={{
                    color:       on ? '#60a5fa' : 'rgba(255,255,255,0.3)',
                    strokeWidth: on ? 2.5 : 2,
                  }}
                />
              </div>
              <span
                className="font-medium transition-colors"
                style={{ fontSize: '10px', color: on ? '#60a5fa' : 'rgba(255,255,255,0.3)' }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
