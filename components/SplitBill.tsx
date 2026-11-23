'use client';

import { useState } from 'react';
import { Plus, Trash2, Users, Send, ChevronRight, Utensils } from 'lucide-react';
import { useWallet }                    from '@/lib/wallet-context';
import { shortenAddress, sendPayment, formatXLM } from '@/lib/stellar';
import { Spinner }                      from './ui/Spinner';
import type { Participant }             from '@/lib/types';

interface SplitEntry extends Participant { tempId: string; sending?: boolean; sent?: boolean; error?: string; }

type SplitMode = 'equal' | 'custom';

export function SplitBill() {
  const { wallet, refresh } = useWallet();
  const [title, setTitle]   = useState('');
  const [totalAmount, setTotal] = useState('');
  const [mode, setMode]     = useState<SplitMode>('equal');
  const [participants, setParticipants] = useState<SplitEntry[]>([
    { tempId: '1', address: '', alias: '', amount: '', paid: false },
  ]);

  const perPerson = totalAmount && participants.length
    ? (parseFloat(totalAmount) / participants.length).toFixed(7)
    : '';

  const addParticipant = () =>
    setParticipants(p => [...p, { tempId: Date.now().toString(), address: '', alias: '', amount: perPerson, paid: false }]);

  const removeParticipant = (id: string) =>
    setParticipants(p => p.filter(x => x.tempId !== id));

  const updateParticipant = (id: string, field: keyof SplitEntry, value: string) =>
    setParticipants(p => p.map(x => x.tempId === id ? { ...x, [field]: value } : x));

  const splitEvenly = () => {
    if (!totalAmount || !participants.length) return;
    const each = (parseFloat(totalAmount) / participants.length).toFixed(7);
    setParticipants(p => p.map(x => ({ ...x, amount: each })));
  };

  const sendToAll = async () => {
    if (!wallet.publicKey) return;
    for (const p of participants) {
      if (!p.address || p.sent) continue;
      setParticipants(prev => prev.map(x => x.tempId === p.tempId ? { ...x, sending: true, error: undefined } : x));
      const res = await sendPayment(wallet.publicKey!, p.address, p.amount || perPerson, `${title || 'Bill split'} - CampusPay`);
      setParticipants(prev => prev.map(x => x.tempId === p.tempId
        ? { ...x, sending: false, sent: res.success, paid: res.success, error: res.error }
        : x));
    }
    await refresh();
  };

  const isReady = participants.length > 0 &&
    participants.every(p => p.address.trim().length === 56 && parseFloat(p.amount || perPerson) > 0);

  const totalToSend = participants.reduce((s, p) => s + parseFloat(p.amount || perPerson || '0'), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Bill details */}
      <div className="card card-p">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--lime-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Utensils size={18} style={{ color: 'var(--green)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <input
              className="input-field"
              placeholder="Bill title (e.g. Dinner at Campus Café)"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ fontWeight: 600 }}
            />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            Total amount (XLM)
          </label>
          <input
            className="input-field"
            type="number"
            placeholder="0.00"
            value={totalAmount}
            onChange={e => setTotal(e.target.value)}
            style={{ fontSize: 20, fontWeight: 700 }}
          />
        </div>
      </div>

      {/* Members */}
      <div className="card card-p">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={15} style={{ color: 'var(--text-muted)' }} />
            Participants ({participants.length})
          </h3>
          {perPerson && (
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {formatXLM(perPerson)} XLM each
            </span>
          )}
        </div>

        {/* Split mode */}
        <div className="filter-tabs" style={{ marginBottom: 16 }}>
          <button className={`filter-tab${mode === 'equal' ? ' active' : ''}`} onClick={() => { setMode('equal'); splitEvenly(); }}>
            Equal Split
          </button>
          <button className={`filter-tab${mode === 'custom' ? ' active' : ''}`} onClick={() => setMode('custom')}>
            Custom Split
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {participants.map((p, i) => (
            <div key={p.tempId} style={{ background: 'var(--bg-muted)', borderRadius: 10, padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>
                    {p.alias || `Person ${i + 1}`}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {p.sent && <span className="badge badge-success">Sent ✓</span>}
                  {p.sending && <Spinner size={12} color="var(--green)" />}
                  {p.error && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{p.error}</span>}
                  {participants.length > 1 && !p.sent && (
                    <button onClick={() => removeParticipant(p.tempId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input-field"
                  style={{ flex: 1, fontSize: 12, fontFamily: 'monospace' }}
                  placeholder="G… Stellar address"
                  value={p.address}
                  onChange={e => updateParticipant(p.tempId, 'address', e.target.value)}
                  disabled={p.sent}
                />
                <input
                  className="input-field"
                  style={{ width: 90, fontWeight: 600 }}
                  type="number"
                  placeholder={perPerson || '0.00'}
                  value={p.amount}
                  onChange={e => updateParticipant(p.tempId, 'amount', e.target.value)}
                  disabled={mode === 'equal' || p.sent}
                />
              </div>
              <input
                className="input-field"
                style={{ marginTop: 8, fontSize: 12 }}
                placeholder="Name / alias (optional)"
                value={p.alias}
                onChange={e => updateParticipant(p.tempId, 'alias', e.target.value)}
                disabled={p.sent}
              />
            </div>
          ))}
        </div>

        <button className="btn-secondary" style={{ width: '100%', marginTop: 12 }} onClick={addParticipant}>
          <Plus size={15} />Add participant
        </button>
      </div>

      {/* Summary */}
      <div className="card card-p" style={{ background: 'var(--lime-bg)', borderColor: 'var(--lime-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total</span>
          <span style={{ fontSize: 14, fontWeight: 700 }}>{formatXLM(totalToSend)} XLM</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Your balance</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{formatXLM(wallet.balance || '0')} XLM</span>
        </div>
        <button className="btn-primary" style={{ width: '100%' }} onClick={sendToAll} disabled={!isReady}>
          <Send size={15} />Create Split <ChevronRight size={15} style={{ marginLeft: 'auto' }} />
        </button>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-faint)', textAlign: 'center' }}>
        Each participant is approved individually through Varial
      </p>
    </div>
  );
}
