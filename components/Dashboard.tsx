'use client';

import { RefreshCw, Send, QrCode, ArrowDownToLine, Users, ArrowUpRight, ArrowDownLeft, TrendingUp, Wifi } from 'lucide-react';
import { useWallet }                              from '@/lib/wallet-context';
import { formatXLM, shortenAddress }              from '@/lib/stellar';
import type { TabId }                             from '@/lib/types';

interface DashboardProps { onTabChange: (tab: TabId) => void; }

export function Dashboard({ onTabChange }: DashboardProps) {
  const { wallet, transactions, refresh } = useWallet();

  const totalSent     = transactions.filter(t => t.type === 'send').reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalReceived = transactions.filter(t => t.type === 'receive').reduce((s, t) => s + parseFloat(t.amount), 0);

  const relTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1)  return `${Math.floor(diff / 60000)}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Balance card */}
      <div className="balance-card">
        {/* Decorative circle */}
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 160, height: 160,
          borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 500, marginBottom: 2 }}>
                XLM Wallet Balance
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 34, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {formatXLM(wallet.balance || '0')}
                </span>
                <span style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>XLM</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 4, fontFamily: 'monospace' }}>
                {shortenAddress(wallet.publicKey || '', 8)}
              </p>
            </div>
            <button
              onClick={refresh}
              style={{ padding: 8, borderRadius: 10, background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', color: 'white' }}
            >
              <RefreshCw size={15} />
            </button>
          </div>

          {/* Sent / Received sub-stats */}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            {[
              { label: 'Sent', val: totalSent, icon: ArrowUpRight, color: 'rgba(255,255,255,0.5)' },
              { label: 'Received', val: totalReceived, icon: ArrowDownLeft, color: 'var(--lime)' },
            ].map(({ label, val, icon: Icon, color }) => (
              <div key={label} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                  <Icon size={12} style={{ color }} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{label}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{formatXLM(val)} XLM</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { icon: Send, label: 'Send', tab: 'send' as TabId },
          { icon: ArrowDownToLine, label: 'Receive', tab: 'receive' as TabId },
          { icon: QrCode, label: 'Scan', tab: 'receive' as TabId },
          { icon: Users, label: 'Split', tab: 'split' as TabId },
        ].map(({ icon: Icon, label, tab }) => (
          <button key={label} onClick={() => onTabChange(tab)} className="quick-action">
            <div className="quick-action-icon">
              <Icon size={18} style={{ color: 'var(--green)' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 500 }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Recent activity */}
      <div className="card card-p">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent activity</h3>
          <button
            onClick={() => onTabChange('history')}
            style={{ fontSize: 13, fontWeight: 500, color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            See all →
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 16px' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <TrendingUp size={20} style={{ color: 'var(--text-faint)' }} />
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>No transactions yet</p>
            <p style={{ fontSize: 13 }}>Fund your account to get started</p>
          </div>
        ) : (
          <div>
            {transactions.slice(0, 5).map((tx, i) => (
              <div key={tx.id} className="tx-row" style={{ paddingTop: i === 0 ? 0 : 12 }}>
                <div
                  className="tx-icon"
                  style={{ background: tx.type === 'send' ? 'var(--danger-bg)' : 'var(--success-bg)' }}
                >
                  {tx.type === 'send'
                    ? <ArrowUpRight size={17} style={{ color: 'var(--danger)' }} />
                    : <ArrowDownLeft size={17} style={{ color: 'var(--success)' }} />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                    {tx.type === 'send' ? 'Sent to' : 'Received from'}{' '}
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {shortenAddress(tx.counterparty)}
                    </span>
                  </p>
                  {tx.memo && (
                    <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      "{tx.memo}"
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: tx.type === 'send' ? 'var(--danger)' : '#16A34A' }}>
                    {tx.type === 'send' ? '−' : '+'}{formatXLM(tx.amount)} XLM
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 1 }}>
                    {relTime(tx.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CampusPay Tap banner */}
      <div
        className="card"
        style={{ background: 'var(--green)', border: 'none', padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 500 }}>Tap to pay</p>
          <p style={{ color: 'white', fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 2 }}>
            CampusPay <span style={{ color: 'var(--lime)' }}>Tap</span>
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 }}>
            Tap with your phone for instant payments.
          </p>
        </div>
        <div
          style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <Wifi size={22} style={{ color: 'var(--lime)' }} />
        </div>
      </div>
    </div>
  );
}
