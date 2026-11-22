'use client';

import { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Search, RefreshCw } from 'lucide-react';
import { useWallet } from '@/lib/wallet-context';
import { formatXLM, shortenAddress } from '@/lib/stellar';

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

  // Group by date
  const groups: Record<string, typeof filtered> = {};
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
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <input className="field pl-9 text-sm py-2.5" placeholder="Search address, memo, amount…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={handleRefresh} className="btn-ghost px-3 py-2.5">
          <RefreshCw size={14} className={refreshing ? 'animate-spin text-blue-400' : 'text-white/40'} />
        </button>
      </div>

      {/* Filter tabs — hidden in incomingOnly mode */}
      {!incomingOnly && (
        <div className="flex rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {(['all', 'receive', 'send'] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="flex-1 py-2.5 text-sm font-medium transition-all capitalize"
              style={{
                color:        filter === f ? '#60a5fa' : 'rgba(255,255,255,0.4)',
                background:   filter === f ? 'rgba(37,99,235,0.1)' : 'transparent',
                borderBottom: filter === f ? '2px solid #2563eb' : '2px solid transparent',
              }}>
              {f === 'all' ? 'All' : f === 'receive' ? 'Received' : 'Sent'}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {Object.keys(groups).length === 0 ? (
        <div className="card flex flex-col items-center py-14 gap-3">
          <ArrowDownLeft size={28} style={{ color: 'rgba(255,255,255,0.1)' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {search ? 'No matching transactions' : incomingOnly ? 'No payments received yet' : 'No transactions yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groups).map(([date, txs]) => (
            <div key={date}>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs font-medium ml-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{date}</p>
                {incomingOnly && (
                  <p className="text-xs font-semibold text-blue-400">
                    +{formatXLM(txs.reduce((s, t) => s + parseFloat(t.amount), 0))} XLM
                  </p>
                )}
              </div>
              <div className="space-y-2">
                {txs.map(tx => (
                  <div key={tx.id} className="card card-hover flex items-center gap-3.5 p-4">
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
                        <span style={{ color: 'rgba(255,255,255,0.45)' }} className="font-mono">{shortenAddress(tx.counterparty, 7)}</span>
                      </p>
                      {tx.memo && <p className="text-xs truncate italic mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>"{tx.memo}"</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold" style={{ color: tx.type === 'send' ? '#f87171' : '#34d399' }}>
                        {tx.type === 'send' ? '−' : '+'}{formatXLM(tx.amount)} {tx.asset}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        {new Date(tx.createdAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <a href={`https://stellar.expert/explorer/testnet/tx/${tx.id}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 mt-1 text-blue-500/50 hover:text-blue-400 transition-colors">
                        <ExternalLink size={10} /><span className="text-xs">Tx</span>
                      </a>
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
