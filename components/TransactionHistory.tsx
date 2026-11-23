'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown, ExternalLink, Search, RefreshCw } from 'lucide-react';
import { useWallet }  from '@/lib/wallet-context';
import { formatXLM, shortenAddress } from '@/lib/stellar';
import { Badge }      from './ui/Badge';

type Filter = 'all' | 'send' | 'receive';

export function TransactionHistory({ incomingOnly = false }: { incomingOnly?: boolean }) {
  const { transactions, refresh } = useWallet();
  const [filter, setFilter]       = useState<Filter>(incomingOnly ? 'receive' : 'all');
  const [search, setSearch]       = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => { setRefreshing(true); await refresh(); setRefreshing(false); };

  const filtered = transactions.filter(tx => {
    if (incomingOnly && tx.type !== 'receive') return false;
    if (!incomingOnly && filter !== 'all' && tx.type !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return tx.counterparty.toLowerCase().includes(q) || tx.memo.toLowerCase().includes(q) || tx.amount.includes(q);
    }
    return true;
  });

  const groups: Record<string, typeof transactions> = {};
  filtered.forEach(tx => {
    const date = new Date(tx.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });
    if (!groups[date]) groups[date] = [];
    groups[date].push(tx);
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input className="input-field pl-9 text-sm py-2.5" placeholder="Search address or memo…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={handleRefresh} className="btn-secondary px-3 py-2.5 flex items-center gap-1.5" disabled={refreshing}>
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : '' }} />
        </button>
      </div>

      {/* Filter tabs — hidden in incomingOnly mode */}
      {!incomingOnly && (
        <div className="flex rounded-xl overflow-hidden border border-white/8" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {(['all', 'receive', 'send'] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="flex-1 py-2.5 text-sm font-medium transition-all capitalize"
              style={{
                color:        filter === f ? '#60a5fa' : 'rgba(255,255,255,0.4)',
                background:   filter === f ? 'rgba(59,130,246,0.1)' : 'transparent',
                borderBottom: filter === f ? '2px solid #3b82f6' : '2px solid transparent',
              }}>
              {f === 'all' ? 'All' : f === 'receive' ? 'Received' : 'Sent'}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {Object.keys(groups).length === 0 ? (
        <div className="glass-card py-14 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <ArrowDown size={22} className="text-white/20" />
          </div>
          <p className="text-white/40 text-sm font-medium">
            {search ? 'No matching transactions' : incomingOnly ? 'No payments received yet' : 'No transactions yet'}
          </p>
          <p className="text-white/25 text-xs">
            {search ? 'Try a different search' : 'Make your first payment to get started'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groups).map(([date, txs]) => (
            <div key={date}>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-white/30 text-xs font-medium ml-1">{date}</p>
                {incomingOnly && (
                  <p className="text-xs font-semibold text-blue-400">
                    +{formatXLM(txs.reduce((s, t) => s + parseFloat(t.amount), 0))} XLM
                  </p>
                )}
              </div>
              <div className="space-y-2">
                {txs.map(tx => (
                  <div key={tx.id} className="glass-card glass-card-hover p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: tx.type === 'send' ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)' }}>
                        {tx.type === 'send'
                          ? <ArrowUp size={16} className="text-red-400" />
                          : <ArrowDown size={16} className="text-emerald-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-sm font-medium">{tx.type === 'send' ? 'Sent' : 'Received'}</p>
                          <Badge variant={tx.type === 'send' ? 'danger' : 'success'}>{tx.type}</Badge>
                        </div>
                        <p className="text-white/40 text-xs mt-0.5 font-mono truncate">
                          {tx.type === 'send' ? '→' : '←'} {shortenAddress(tx.counterparty, 8)}
                        </p>
                        {tx.memo && <p className="text-white/30 text-xs mt-0.5 italic truncate">"{tx.memo}"</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold" style={{ color: tx.type === 'send' ? '#f87171' : '#34d399' }}>
                          {tx.type === 'send' ? '−' : '+'}{formatXLM(tx.amount)} {tx.asset}
                        </p>
                        <p className="text-white/25 text-xs mt-0.5">
                          {new Date(tx.createdAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <a href={`https://stellar.expert/explorer/testnet/tx/${tx.id}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-blue-500/60 hover:text-blue-400 transition-colors mt-1">
                          <ExternalLink size={10} /><span className="text-xs">Explorer</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
