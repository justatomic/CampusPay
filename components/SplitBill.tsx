'use client';

import { useState } from 'react';
import { Plus, Trash2, Users, Send, ChevronRight } from 'lucide-react';
import { useWallet } from '@/lib/wallet-context';
import { shortenAddress, sendPayment, formatXLM } from '@/lib/stellar';
import { Spinner } from './ui/Spinner';
import type { Participant } from '@/lib/types';

interface SplitEntry extends Participant {
  tempId: string;
  sending?: boolean;
  sent?: boolean;
  error?: string;
}

export function SplitBill() {
  const { wallet, refresh } = useWallet();
  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [participants, setParticipants] = useState<SplitEntry[]>([
    { tempId: '1', address: '', alias: '', amount: '', paid: false },
  ]);

  const perPerson =
    totalAmount && participants.length
      ? (parseFloat(totalAmount) / participants.length).toFixed(7)
      : '';

  const addParticipant = () => {
    setParticipants((prev) => [
      ...prev,
      { tempId: Date.now().toString(), address: '', alias: '', amount: perPerson, paid: false },
    ]);
  };

  const removeParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.tempId !== id));
  };

  const updateParticipant = (id: string, field: keyof SplitEntry, value: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.tempId === id ? { ...p, [field]: value } : p))
    );
  };

  const splitEvenly = () => {
    if (!totalAmount || !participants.length) return;
    const each = (parseFloat(totalAmount) / participants.length).toFixed(7);
    setParticipants((prev) => prev.map((p) => ({ ...p, amount: each })));
  };

  const sendToAll = async () => {
    if (!wallet.publicKey) return;
    for (const p of participants) {
      if (!p.address || p.sent) continue;
      setParticipants((prev) =>
        prev.map((x) => (x.tempId === p.tempId ? { ...x, sending: true, error: undefined } : x))
      );
      const res = await sendPayment(
        wallet.publicKey,
        p.address,
        p.amount || perPerson,
        `${title || 'Bill split'} - CampusPay`
      );
      setParticipants((prev) =>
        prev.map((x) =>
          x.tempId === p.tempId
            ? { ...x, sending: false, sent: res.success, paid: res.success, error: res.error }
            : x
        )
      );
    }
    await refresh();
  };

  const isReady =
    participants.length > 0 &&
    participants.every((p) => p.address.trim().length === 56 && parseFloat(p.amount || perPerson) > 0);

  const totalToSend = participants.reduce(
    (sum, p) => sum + parseFloat(p.amount || perPerson || '0'),
    0
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-blue-400" />
          <h3 className="text-white text-sm font-semibold">New bill split</h3>
        </div>

        <div>
          <label className="block text-white/50 text-xs font-medium mb-2 uppercase tracking-wider">
            What's this for?
          </label>
          <input
            className="input-field"
            placeholder="Canteen lunch, Study materials, Hostel fee…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-white/50 text-xs font-medium mb-2 uppercase tracking-wider">
            Total amount (XLM)
          </label>
          <div className="flex gap-2">
            <input
              className="input-field flex-1"
              type="number"
              placeholder="0.00"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
            />
            <button
              onClick={splitEvenly}
              disabled={!totalAmount}
              className="btn-secondary px-4 text-xs whitespace-nowrap"
              style={{ opacity: !totalAmount ? 0.4 : 1 }}
            >
              Split evenly
            </button>
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white/70 text-xs font-semibold uppercase tracking-wider">
            Participants ({participants.length})
          </h3>
          {perPerson && (
            <span className="text-blue-400 text-xs font-medium">
              {formatXLM(perPerson)} XLM each
            </span>
          )}
        </div>

        {participants.map((p, i) => (
          <div key={p.tempId} className="glass-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-xs font-medium">
                Person {i + 1}
                {p.alias && ` — ${p.alias}`}
              </span>
              <div className="flex items-center gap-2">
                {p.sent && (
                  <span className="text-emerald-400 text-xs font-medium">✓ Sent</span>
                )}
                {p.error && (
                  <span className="text-red-400 text-xs">{p.error}</span>
                )}
                {participants.length > 1 && !p.sent && (
                  <button
                    onClick={() => removeParticipant(p.tempId)}
                    className="text-white/20 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            <input
              className="input-field font-mono text-sm"
              placeholder="G… Stellar address"
              value={p.address}
              onChange={(e) => updateParticipant(p.tempId, 'address', e.target.value)}
              disabled={p.sent}
            />

            <div className="flex gap-2">
              <input
                className="input-field flex-1"
                placeholder="Alias (optional)"
                value={p.alias}
                onChange={(e) => updateParticipant(p.tempId, 'alias', e.target.value)}
                disabled={p.sent}
              />
              <input
                className="input-field w-28"
                type="number"
                placeholder={perPerson || '0.00'}
                value={p.amount}
                onChange={(e) => updateParticipant(p.tempId, 'amount', e.target.value)}
                disabled={p.sent}
              />
            </div>
          </div>
        ))}

        <button
          onClick={addParticipant}
          className="btn-secondary w-full flex items-center justify-center gap-2 py-3"
        >
          <Plus size={15} />
          Add participant
        </button>
      </div>

      {/* Summary + send */}
      {participants.length > 0 && (
        <div className="glass-card p-5 space-y-4"
          style={{ background: 'rgba(59,130,246,0.06)', borderColor: 'rgba(59,130,246,0.15)' }}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Total to send</span>
            <span className="text-white font-semibold">{formatXLM(totalToSend)} XLM</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Your balance</span>
            <span className="text-white/60">{formatXLM(wallet.balance || '0')} XLM</span>
          </div>

          <button
            className="btn-primary w-full flex items-center justify-center gap-2"
            onClick={sendToAll}
            disabled={!isReady}
            style={{ opacity: !isReady ? 0.4 : 1 }}
          >
            <Send size={15} />
            Send to all participants
            <ChevronRight size={15} className="ml-auto" />
          </button>
        </div>
      )}

      <p className="text-white/25 text-xs text-center">
        Each participant will be prompted individually in Freighter
      </p>
    </div>
  );
}
