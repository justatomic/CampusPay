'use client';

import { Home, Send, ArrowDownToLine, Users, Settings } from 'lucide-react';
import type { TabId } from '@/lib/types';

const TABS: { id: TabId; icon: typeof Home; label: string }[] = [
  { id: 'dashboard', icon: Home,            label: 'Home'    },
  { id: 'send',      icon: Send,            label: 'Send'    },
  { id: 'receive',   icon: ArrowDownToLine, label: 'Receive' },
  { id: 'split',     icon: Users,           label: 'Split'   },
  { id: 'settings',  icon: Settings,        label: 'Settings'},
];

interface BottomNavProps { active: TabId; onChange: (tab: TabId) => void; }

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      {TABS.map(({ id, icon: Icon, label }) => {
        const on = active === id;
        return (
          <button key={id} className={`bottom-nav-item${on ? ' active' : ''}`} onClick={() => onChange(id)}>
            <Icon size={20} strokeWidth={on ? 2.5 : 2} />
            <span style={{ fontSize: 10, fontWeight: on ? 600 : 400 }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
