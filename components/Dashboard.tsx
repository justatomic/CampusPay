'use client';

import { RefreshCw, Send, QrCode, ArrowDown, ArrowUp, Users, LogOut } from 'lucide-react';
import { useWallet } from '@/lib/wallet-context';
import { formatXLM, shortenAddress } from '@/lib/stellar';
import { Badge } from './ui/Badge';
import type { TabId } from '@/lib/types';

interface DashboardProps {
  onTabChange: (tab: TabId) => void;
}

export function Dashboard({ onTabChange }: DashboardProps) {
  const { wallet, transactions, refresh, disconnect } = useWallet();

  const totalSent = transactions
    .filter((t) => t.type === 'send')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalReceived = transactions
    .filter((t) => t.type === 'receive')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  return (
    <div className="space-y-5">
      {/* Balance card */}
      <div
        className="rounded-3xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20"
          style={{ background: 'rgba(255,255,255,0.3)' }} />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full opacity-10"
          style={{ background: 'rgba(255,255,255,0.4)' }} />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-blue-200 text-sm font-medium mb-0.5">Total balance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white tracking-tight">
                  {formatXLM(wallet.balance || '0')}
                </span>
                <span className="text-blue-200 text-lg font-semibold">XLM</span>
              </div>
              <p className="text-blue-300 text-xs mt-1.5">{shortenAddress(wallet.publicKey || '', 8)}</p>
            </div>
            <button
              onClick={refresh}
              className="p-2 rounded-xl transition-colors"
              style={{ background: 'rgba(255,255,255,0.15)' }}
              title="Refresh balance"
            >
              <RefreshCw size={16} className="text-white" />
            </button>
          </div>

          <div className="flex gap-2 mt-4">
            <div className="flex-1 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <ArrowUp size={12} className="text-emerald-300" />
                <span className="text-blue-200 text-xs">Sent</span>
              </div>
              <span className="text-white text-sm font-semibold">{formatXLM(totalSent)} XLM</span>
            </div>
            <div className="flex-1 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <ArrowDown size={12} className="text-blue-300" />
                <span className="text-blue-200 text-xs">Received</span>
              </div>
              <span className="text-white text-sm font-semibold">{formatXLM(totalReceived)} XLM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: Send, label: 'Send', tab: 'send' as TabId, color: '#3b82f6' },
          { icon: QrCode, label: 'Receive', tab: 'receive' as TabId, color: '#8b5cf6' },
          { icon: Users, label: 'Split', tab: 'split' as TabId, color: '#06b6d4' },
          { icon: ArrowDown, label: 'History', tab: 'history' as TabId, color: '#10b981' },
        ].map(({ icon: Icon, label, tab, color }) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className="glass-card glass-card-hover flex flex-col items-center gap-2 py-4 px-2"
          >
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: `${color}20`, border: `1px solid ${color}30` }}
            >
              <Icon size={18} style={{ color }} />
            </div>
            <span className="text-white/70 text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Recent transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm">Recent activity</h3>
          <button
            onClick={() => onTabChange('history')}
            className="text-blue-400 text-xs font-medium hover:text-blue-300 transition-colors"
          >
            See all
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="glass-card py-10 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <ArrowDown size={20} className="text-white/20" />
            </div>
            <p className="text-white/40 text-sm">No transactions yet</p>
            <p className="text-white/25 text-xs">Fund your account to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="glass-card glass-card-hover flex items-center gap-3 p-3.5">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: tx.type === 'send' ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
                  }}
                >
                  {tx.type === 'send' ? (
                    <ArrowUp size={16} className="text-red-400" />
                  ) : (
                    <ArrowDown size={16} className="text-emerald-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {tx.type === 'send' ? 'Sent to' : 'Received from'}{' '}
                    <span className="text-white/60">{shortenAddress(tx.counterparty)}</span>
                  </p>
                  {tx.memo && (
                    <p className="text-white/40 text-xs truncate mt-0.5">"{tx.memo}"</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: tx.type === 'send' ? '#f87171' : '#34d399' }}
                  >
                    {tx.type === 'send' ? '−' : '+'}{formatXLM(tx.amount)} XLM
                  </p>
                  <p className="text-white/30 text-xs mt-0.5">
                    {new Date(tx.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Disconnect */}
      <button
        onClick={disconnect}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white/30 text-sm hover:text-white/50 transition-colors"
      >
        <LogOut size={14} />
        Disconnect wallet
      </button>
    </div>
  );
}
