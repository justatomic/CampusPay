'use client';

import { Search, Bell, ChevronDown } from 'lucide-react';
import { useWallet }                 from '@/lib/wallet-context';
import { shortenAddress }            from '@/lib/stellar';
import type { TabId }                from '@/lib/types';

const PAGE_HEADINGS: Record<TabId, { title: string; greeting?: boolean }> = {
  dashboard: { title: 'Dashboard', greeting: true },
  send:      { title: 'Send Payment'   },
  receive:   { title: 'Receive Payment'},
  split:     { title: 'Split Bill'     },
  history:   { title: 'Activity'       },
  settings:  { title: 'Settings'       },
};

interface DesktopHeaderProps { active: TabId; }

export function DesktopHeader({ active }: DesktopHeaderProps) {
  const { wallet } = useWallet();
  const page = PAGE_HEADINGS[active];

  return (
    <header className="desktop-header">
      {/* Page title */}
      <div style={{ flex: 1 }}>
        {page.greeting ? (
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
            Hello, Alex 👋
          </span>
        ) : (
          <span style={{ fontSize: 16, fontWeight: 700 }}>{page.title}</span>
        )}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', flex: '0 0 300px' }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
        <input
          className="input-field"
          style={{ paddingLeft: 36, paddingTop: 8, paddingBottom: 8, fontSize: 13 }}
          placeholder="Search transactions, users or wallets…"
        />
        <kbd style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: 'var(--text-faint)', background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px' }}>
          ⌘K
        </kbd>
      </div>

      {/* Notifications */}
      <button style={{ position: 'relative', width: 36, height: 36, borderRadius: 9, background: 'var(--bg-muted)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <Bell size={16} style={{ color: 'var(--text-muted)' }} />
        <span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: '50%', background: 'var(--danger)', border: '1.5px solid var(--bg-card)' }} />
      </button>

      {/* Wallet pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: 10, padding: '6px 12px', cursor: 'pointer' }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M12 3L20 7V17L12 21L4 17V7L12 3Z" fill="white" fillOpacity="0.9"/>
          </svg>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'monospace', color: 'var(--text)' }}>
          {shortenAddress(wallet.publicKey || '', 6)}
        </span>
        <ChevronDown size={13} style={{ color: 'var(--text-faint)' }} />
      </div>
    </header>
  );
}
