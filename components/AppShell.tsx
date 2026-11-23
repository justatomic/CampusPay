'use client';

import { useState, useCallback }   from 'react';
import { useWallet }               from '@/lib/wallet-context';
import { useProfile }              from '@/lib/profile-context';
import { ConnectWallet }           from './ConnectWallet';
import { Dashboard }               from './Dashboard';
import { SendPayment }             from './SendPayment';
import { ReceivePayment }          from './ReceivePayment';
import { SplitBill }               from './SplitBill';
import { TransactionHistory }      from './TransactionHistory';
import { CustomerSettings }        from './customer/CustomerSettings';
import { BottomNav }               from './BottomNav';
import { BizShell }                from './business/BizShell';
import { Toast }                   from './ui/Toast';
import { Sidebar }                 from './Sidebar';
import { DesktopHeader }           from './DesktopHeader';
import type { TabId }              from '@/lib/types';
import type { ToastMessage }       from './ui/Toast';

const PAGE_TITLES: Record<TabId, { title: string; sub: string }> = {
  dashboard: { title: 'Home',               sub: 'Welcome back'               },
  send:      { title: 'Send Payment',       sub: 'Send XLM to anyone on Stellar' },
  receive:   { title: 'Receive Payment',    sub: 'Share your wallet address or show QR code' },
  split:     { title: 'Split Bill',         sub: 'Split expenses with friends'    },
  history:   { title: 'Activity',           sub: 'Your transaction history'       },
  settings:  { title: 'Settings',          sub: 'Manage your account and preferences' },
};

export function AppShell() {
  const { wallet }         = useWallet();
  const { isBusinessMode } = useProfile();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [toasts, setToasts]       = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  if (!wallet.connected) return <ConnectWallet />;
  if (isBusinessMode) return <BizShell />;

  const pageContent = (
    <>
      {activeTab === 'dashboard' && <Dashboard onTabChange={setActiveTab} />}
      {activeTab === 'send'      && <SendPayment onSuccess={() => addToast('success', 'Payment sent successfully!')} />}
      {activeTab === 'receive'   && <ReceivePayment />}
      {activeTab === 'split'     && <SplitBill />}
      {activeTab === 'history'   && <TransactionHistory />}
      {activeTab === 'settings'  && <CustomerSettings />}
    </>
  );

  return (
    <>
      {/* ── MOBILE layout ───────────────────────────────────── */}
      <div className="app-mobile-shell">
        {/* Mobile header */}
        <header className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L20 7V17L12 21L4 17V7L12 3Z" fill="white" fillOpacity="0.9"/>
                <path d="M12 7L16 9V15L12 17L8 15V9L12 7Z" fill="#7CC744"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15 }}>CampusPay</span>
          </div>
          <div className="testnet-pill">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--lime)', display: 'inline-block' }} />
            Testnet
          </div>
        </header>

        {/* Page content */}
        <div className="mobile-page fade-in">
          {/* Page heading */}
          {activeTab !== 'dashboard' && (
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>
                {PAGE_TITLES[activeTab].title}
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                {PAGE_TITLES[activeTab].sub}
              </p>
            </div>
          )}
          {pageContent}
        </div>

        <BottomNav active={activeTab} onChange={setActiveTab} />

        {/* Toast stack */}
        <div style={{ position: 'fixed', bottom: 80, right: 16, zIndex: 60, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 300 }}>
          {toasts.map(toast => <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />)}
        </div>
      </div>

      {/* ── DESKTOP layout ──────────────────────────────────── */}
      <div className="app-desktop-shell">
        <Sidebar active={activeTab} onChange={setActiveTab} />

        <div className="desktop-main">
          <DesktopHeader active={activeTab} />

          <div className="desktop-content fade-in">
            {/* Two-column grid for dashboard; single-column for others */}
            {activeTab === 'dashboard' ? (
              <DesktopDashboardLayout onTabChange={setActiveTab} />
            ) : (
              <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 0 }}>
                {pageContent}
              </div>
            )}
          </div>
        </div>

        {/* Toast */}
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 60, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320 }}>
          {toasts.map(toast => <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />)}
        </div>
      </div>
    </>
  );
}

/* ── Desktop dashboard: two-column grid ──────────────────────────── */
import { useWallet as useW } from '@/lib/wallet-context';
import { formatXLM, shortenAddress } from '@/lib/stellar';
import { RefreshCw, Send, ArrowDownToLine, QrCode, Users, ArrowUpRight, ArrowDownLeft, TrendingUp, Wifi, ShoppingCart } from 'lucide-react';

function DesktopDashboardLayout({ onTabChange }: { onTabChange: (t: TabId) => void }) {
  const { wallet, transactions, refresh } = useW();

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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24, alignItems: 'start' }}>
      {/* Left column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Wallet balance hero */}
        <div className="balance-card" style={{ borderRadius: 20, padding: 28 }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 4 }}>Wallet Balance</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 44, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {formatXLM(wallet.balance || '0')}
                  </span>
                  <span style={{ fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>XLM</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4, fontFamily: 'monospace' }}>
                  {shortenAddress(wallet.publicKey || '', 10)}
                </p>
              </div>
              <button onClick={refresh} style={{ padding: 10, borderRadius: 10, background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: 'white' }}>
                <RefreshCw size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Total Sent', val: totalSent, icon: ArrowUpRight, iconColor: 'rgba(255,255,255,0.5)' },
                { label: 'Total Received', val: totalReceived, icon: ArrowDownLeft, iconColor: 'var(--lime)' },
              ].map(({ label, val, icon: Icon, iconColor }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.09)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <Icon size={13} style={{ color: iconColor }} />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{formatXLM(val)} XLM</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { icon: Send, label: 'Send Payment', sub: 'Transfer XLM', tab: 'send' as TabId },
              { icon: ArrowDownToLine, label: 'Receive Payment', sub: 'Get paid easily', tab: 'receive' as TabId },
              { icon: Users, label: 'Split Bills', sub: 'Share costs', tab: 'split' as TabId },
              { icon: ShoppingCart, label: 'Group Expense', sub: 'Track together', tab: 'split' as TabId },
            ].map(({ icon: Icon, label, sub, tab }) => (
              <button key={label} onClick={() => onTabChange(tab)}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14,
                  padding: '16px 12px', cursor: 'pointer', textAlign: 'center',
                  transition: 'background 0.15s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 11, background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} style={{ color: 'var(--green)' }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{label}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>{sub}</p>
                </div>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowUpRight size={12} style={{ color: 'var(--text-faint)' }} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CampusPay Tap banner */}
        <div
          style={{
            background: 'var(--green)', borderRadius: 16, padding: '20px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Tap to pay instantly</p>
            <p style={{ color: 'white', fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', margin: '4px 0' }}>
              CampusPay <span style={{ color: 'var(--lime)' }}>Tap</span>
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Tap with your phone for instant payments.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 60, height: 60, borderRadius: 14, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wifi size={28} style={{ color: 'var(--lime)' }} />
            </div>
            <button style={{ background: 'white', color: 'var(--green)', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Learn more →
            </button>
          </div>
        </div>
      </div>

      {/* Right column — activity */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="card card-p">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Activity</h3>
            <button onClick={() => onTabChange('history')} style={{ fontSize: 13, fontWeight: 500, color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer' }}>
              See all →
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="empty-state" style={{ padding: '28px 16px' }}>
              <div style={{ width: 44, height: 44, borderRadius: 11, background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <TrendingUp size={18} style={{ color: 'var(--text-faint)' }} />
              </div>
              <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>No transactions yet</p>
              <p style={{ fontSize: 12 }}>Fund your account to get started</p>
            </div>
          ) : (
            <div>
              {transactions.slice(0, 8).map((tx, i) => (
                <div key={tx.id} className="tx-row" style={{ paddingTop: i === 0 ? 0 : 12 }}>
                  <div className="tx-icon" style={{ background: tx.type === 'send' ? 'var(--danger-bg)' : 'var(--success-bg)' }}>
                    {tx.type === 'send'
                      ? <ArrowUpRight size={16} style={{ color: 'var(--danger)' }} />
                      : <ArrowDownLeft size={16} style={{ color: 'var(--success)' }} />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>
                      {tx.type === 'send' ? 'Sent to' : 'Received from'}{' '}
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{shortenAddress(tx.counterparty)}</span>
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 1 }}>{relTime(tx.createdAt)}</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: tx.type === 'send' ? 'var(--danger)' : '#16A34A' }}>
                    {tx.type === 'send' ? '−' : '+'}{formatXLM(tx.amount)} XLM
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
