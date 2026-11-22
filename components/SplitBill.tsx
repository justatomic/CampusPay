'use client';

import { useState } from 'react';
import { Plus, Trash2, Users, Send } from 'lucide-react';
import { useWallet } from '@/lib/wallet-context';
import { sendPayment, formatXLM } from '@/lib/stellar';

interface Person {
  id:      string;
  address: string;
  alias:   string;
  amount:  string;
  status:  'idle' | 'sending' | 'sent' | 'error';
  error?:  string;
}

export function SplitBill() {
  const { wallet, refresh } = useWallet();
  const [title, setTitle]   = useState('');
  const [total, setTotal]   = useState('');
  const [people, setPeople] = useState<Person[]>([
    { id: '1', address: '', alias: '', amount: '', status: 'idle' },
  ]);

  const perPerson = total && people.length
    ? (parseFloat(total) / people.length).toFixed(7)
    : '';

  const add    = () => setPeople(p => [...p, { id: Date.now().toString(), address: '', alias: '', amount: perPerson, status: 'idle' }]);
  const remove = (id: string) => setPeople(p => p.filter(x => x.id !== id));
  const update = (id: string, f: Partial<Person>) => setPeople(p => p.map(x => x.id === id ? { ...x, ...f } : x));
  const split  = () => {
    const each = (parseFloat(total) / people.length).toFixed(7);
    setPeople(p => p.map(x => ({ ...x, amount: each })));
  };

  const sendAll = async () => {
    if (!wallet.publicKey) return;
    for (const p of people) {
      if (!p.address || p.status === 'sent') continue;
      update(p.id, { status: 'sending', error: undefined });
      const res = await sendPayment(wallet.publicKey, p.address, p.amount || perPerson, `${title || 'Split'} · CampusPay`);
      update(p.id, { status: res.success ? 'sent' : 'error', error: res.error });
    }
    await refresh();
  };

  const totalToSend = people.reduce((s, p) => s + parseFloat(p.amount || perPerson || '0'), 0);
  const allValid    = people.every(p => p.address.trim().length === 56 && parseFloat(p.amount || perPerson) > 0);

  return (
    <div className="space-y-5">
      {/* Setup card */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Users size={15} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-white">New bill split</h3>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Description</label>
          <input className="field" placeholder="Canteen lunch, Hostel fee, Study materials…" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Total (XLM)</label>
          <div className="flex gap-2.5">
            <input className="field flex-1" type="number" placeholder="0.00" value={total} onChange={e => setTotal(e.target.value)} />
            <button onClick={split} disabled={!total} className="btn-ghost px-4 text-sm disabled:opacity-30">
              Split evenly
            </button>
          </div>
        </div>
        {perPerson && (
          <div className="rounded-xl px-3 py-2.5 flex items-center justify-between"
            style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}>
            <span className="text-xs" style={{ color: 'rgba(165,199,255,0.7)' }}>{people.length} people</span>
            <span className="text-sm font-semibold text-blue-300">{formatXLM(perPerson)} XLM each</span>
          </div>
        )}
      </div>

      {/* People */}
      <div className="space-y-3">
        {people.map((p, i) => (
          <div key={p.id} className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Person {i + 1}{p.alias ? ` · ${p.alias}` : ''}
              </span>
              <div className="flex items-center gap-2">
                {p.status === 'sending' && <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />}
                {p.status === 'sent'    && <span className="text-xs font-medium text-emerald-400">✓ Sent</span>}
                {p.status === 'error'   && <span className="text-xs text-red-400 max-w-[120px] truncate">{p.error}</span>}
                {people.length > 1 && p.status !== 'sent' && (
                  <button onClick={() => remove(p.id)} className="text-red-500/50 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
            <input
              className="field font-mono text-sm"
              placeholder="G… Stellar address"
              value={p.address}
              onChange={e => update(p.id, { address: e.target.value })}
              disabled={p.status === 'sent'}
            />
            <div className="flex gap-2.5">
              <input
                className="field flex-1"
                placeholder="Alias (optional)"
                value={p.alias}
                onChange={e => update(p.id, { alias: e.target.value })}
                disabled={p.status === 'sent'}
              />
              <input
                className="field w-28"
                type="number"
                placeholder={perPerson || '0.00'}
                value={p.amount}
                onChange={e => update(p.id, { amount: e.target.value })}
                disabled={p.status === 'sent'}
              />
            </div>
          </div>
        ))}

        <button onClick={add} className="btn-ghost w-full flex items-center justify-center gap-2 py-3.5">
          <Plus size={15} /> Add participant
        </button>
      </div>

      {/* Send */}
      <div className="card p-5 space-y-4" style={{ background: 'rgba(37,99,235,0.07)', borderColor: 'rgba(37,99,235,0.18)' }}>
        <div className="flex justify-between text-sm">
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>Total to send</span>
          <span className="text-white font-semibold">{formatXLM(totalToSend)} XLM</span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>Your balance</span>
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>{formatXLM(wallet.balance ?? '0')} XLM</span>
        </div>
        <button className="btn-primary w-full flex items-center justify-center gap-2.5 py-4" onClick={sendAll} disabled={!allValid}>
          <Send size={15} /> Send to all ({people.filter(p => p.status !== 'sent').length})
        </button>
      </div>

      <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.22)' }}>
        Your wallet will prompt once per participant
      </p>
    </div>
  );
}
