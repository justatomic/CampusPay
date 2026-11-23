'use client';

import { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Search, RefreshCw, Users } from 'lucide-react';
import { useWallet }             from '@/lib/wallet-context';
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

  const relTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1)  return `${Math.floor(diff / 60000)}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const groups: Record<string, typeof transactions> = {};
  filtered.forEach(tx => {
    const date = new Date(tx.createdAt).toLocaleDateString('en-NG', { weekday: 'short', month: 'short', day: 'numeric' });
    if (!groups[date]) groups[date] = [];
    groups[date].push(tx);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Search + refresh */}
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
          <input
            className="input-field"
            style={{ paddingLeft: 36 }}
            placeholder="Search transactions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          className="btn-secondary"
          style={{ padding: '0 14px' }}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
        </button>
      </div>

      {/* Filter tabs */}
      {!incomingOnly && (
        <div className="filter-tabs">
          {(['all', 'receive', 'send'] as Filter[]).map(f => (
            <button key={f} className={`filter-tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f === 'receive' ? 'Received' : 'Sent'}
            </button>
          ))}
          <button className="filter-tab">Splits</button>
        </div>
      )}

      {/* Transaction list */}
      {Object.keys(groups).length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowDownLeft size={20} style={{ color: 'var(--text-faint)' }} />
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
              {search ? 'No matching transactions' : 'No transactions yet'}
            </p>
            <p style={{ fontSize: 13 }}>
              {search ? 'Try a different search' : 'Make your first payment to get started'}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Object.entries(groups).map(([date, txs]) => (
            <div key={date}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, paddingLeft: 4 }}>{date}</p>
              <div className="card card-p">
                {txs.map((tx, i) => (
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>
                          {tx.type === 'send' ? 'Sent' : 'Received'}
                        </p>
                        <span className={`badge ${tx.type === 'send' ? 'badge-danger' : 'badge-success'}`}>
                          {tx.type}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 1, fontFamily: 'monospace' }}>
                        {tx.type === 'send' ? '→' : '←'} {shortenAddress(tx.counterparty, 8)}
                      </p>
                      {tx.memo && (
                        <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 1, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          "{tx.memo}"
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: tx.type === 'send' ? 'var(--danger)' : '#16A34A' }}>
                        {tx.type === 'send' ? '−' : '+'}{formatXLM(tx.amount)} {tx.asset}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 1 }}>{relTime(tx.createdAt)}</p>
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${tx.id}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-faint)', textDecoration: 'none', marginTop: 2 }}
                      >
                        <ExternalLink size={10} />Explorer
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
