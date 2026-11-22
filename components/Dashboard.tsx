'use client';

import { RefreshCw, Send, QrCode, Users, Clock, ArrowUpRight, ArrowDownLeft, LogOut, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useWallet } from '@/lib/wallet-context';
import { formatXLM, shortenAddress } from '@/lib/stellar';
import type { TabId } from '@/lib/types';

export function Dashboard({ onTab }: { onTab: (t: TabId) => void }) {
  const { wallet, transactions, refresh, disconnect, walletLabel } = useWallet();
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied]         = useState(false);

  const handleRefresh = async () => { setRefreshing(true); await refresh(); setRefreshing(false); };
  const copyAddr = async () => {
    await navigator.clipboard.writeText(wallet.publicKey ?? '');
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };

  const sent     = transactions.filter(t => t.type === 'send').reduce((s, t) => s + parseFloat(t.amount), 0);
  const received = transactions.filter(t => t.type === 'receive').reduce((s, t) => s + parseFloat(t.amount), 0);

  return (
    <div className="space-y-5">

      {/* ── Balance card ── */}
      <div
        className="rounded-3xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0f2756 0%, #1a3fa8 55%, #1d4ed8 100%)' }}
      >
        {/* BG blobs */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-[0.14]" style={{ background: 'white' }} />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full opacity-[0.07]"  style={{ background: 'white' }} />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'rgba(165,199,255,0.7)' }}>Total balance</p>
              <div className="flex items-baseline gap-2.5">
                <span className="text-[46px] font-bold text-white tracking-tight leading-none">
                  {formatXLM(wallet.balance ?? '0')}
                </span>
                <span className="text-xl font-semibold" style={{ color: 'rgba(165,199,255,0.85)' }}>XLM</span>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="p-2.5 rounded-xl transition-colors"
              style={{ background: 'rgba(255,255,255,0.14)' }}
            >
              <RefreshCw size={15} className={`text-white ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Address pill */}
          <button
            onClick={copyAddr}
            className="flex items-center gap-2 rounded-xl px-3 py-1.5 mb-4 transition-colors"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.14)' }}
          >
            <span className="text-xs font-mono" style={{ color: 'rgba(165,199,255,0.8)' }}>
              {shortenAddress(wallet.publicKey ?? '', 8)}
            </span>
            {copied
              ? <Check size={12} className="text-green-300" />
              : <Copy size={12} style={{ color: 'rgba(165,199,255,0.6)' }} />
            }
          </button>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Sent', value: sent,     icon: ArrowUpRight,   color: '#fca5a5' },
              { label: 'Received', value: received, icon: ArrowDownLeft, color: '#86efac' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={12} style={{ color }} />
                  <span className="text-xs" style={{ color: 'rgba(165,199,255,0.7)' }}>{label}</span>
                </div>
                <span className="text-sm font-semibold text-white">{formatXLM(value)} XLM</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: Send,  label: 'Send',    tab: 'send'    as TabId, accent: '#2563eb' },
          { icon: QrCode, label: 'Receive', tab: 'receive' as TabId, accent: '#7c3aed' },
          { icon: Users, label: 'Split',   tab: 'split'   as TabId, accent: '#0891b2' },
          { icon: Clock, label: 'History', tab: 'history' as TabId, accent: '#059669' },
        ].map(({ icon: Icon, label, tab, accent }) => (
          <button
            key={tab}
            onClick={() => onTab(tab)}
            className="card card-hover flex flex-col items-center gap-2.5 py-4"
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: `${accent}1a`, border: `1px solid ${accent}33` }}>
              <Icon size={18} style={{ color: accent }} />
            </div>
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>{label}</span>
          </button>
        ))}
      </div>

      {/* ── Recent transactions ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Recent activity</h3>
          <button onClick={() => onTab('history')} className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
            See all
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="card flex flex-col items-center py-12 gap-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1"
              style={{ background: 'rgba(255,255,255,0.045)' }}>
              <Clock size={20} style={{ color: 'rgba(255,255,255,0.18)' }} />
            </div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>No transactions yet</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>Send XLM to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 6).map(tx => (
              <div key={tx.id} className="card card-hover flex items-center gap-3.5 p-3.5">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: tx.type === 'send' ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)' }}>
                  {tx.type === 'send'
                    ? <ArrowUpRight  size={16} className="text-red-400" />
                    : <ArrowDownLeft size={16} className="text-emerald-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {tx.type === 'send' ? 'Sent to ' : 'From '}
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>{shortenAddress(tx.counterparty)}</span>
                  </p>
                  {tx.memo && <p className="text-xs truncate mt-0.5 italic" style={{ color: 'rgba(255,255,255,0.3)' }}>"{tx.memo}"</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold" style={{ color: tx.type === 'send' ? '#f87171' : '#34d399' }}>
                    {tx.type === 'send' ? '−' : '+'}{formatXLM(tx.amount)}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {new Date(tx.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wallet info + disconnect */}
      <div className="card flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Connected via</p>
          <p className="text-sm font-medium text-white">{walletLabel}</p>
        </div>
        <button
          onClick={disconnect}
          className="btn-ghost flex items-center gap-2 px-3 py-2 text-xs"
        >
          <LogOut size={13} /> Disconnect
        </button>
      </div>
    </div>
  );
}
