'use client';

import { LayoutDashboard, Send, QrCode, Users, Clock } from 'lucide-react';
import type { TabId } from '@/lib/types';

interface BottomNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const tabs: Array<{ id: TabId; icon: typeof LayoutDashboard; label: string }> = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
  { id: 'send', icon: Send, label: 'Send' },
  { id: 'receive', icon: QrCode, label: 'Receive' },
  { id: 'split', icon: Users, label: 'Split' },
  { id: 'history', icon: Clock, label: 'History' },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(10, 22, 40, 0.92)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="max-w-md mx-auto flex">
        {tabs.map(({ id, icon: Icon, label }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-all"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                <Icon
                  size={18}
                  style={{
                    color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.3)',
                    strokeWidth: isActive ? 2.5 : 2,
                  }}
                />
              </div>
              <span
                className="text-xs font-medium transition-colors"
                style={{ color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.3)' }}
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
