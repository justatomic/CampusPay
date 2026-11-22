'use client';

import { useState } from 'react';
import { Send, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { useWallet } from '@/lib/wallet-context';
import { sendPayment, formatXLM } from '@/lib/stellar';

export function SendPayment({ onSuccess }: { onSuccess?: () => void }) {
  const { wallet, refresh } = useWallet();
  const [to, setTo]         = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo]     = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<{ success: boolean; hash?: string; error?: string } | null>(null);

  const bal     = parseFloat(wallet.balance ?? '0');
  const amtNum  = parseFloat(amount);
  const toValid = to.trim().length === 56 && to.trim().startsWith('G');
  const isValid = toValid && amtNum > 0 && amtNum <= bal - 1; // keep 1 XLM for reserve

  const handleSend = async () => {
    if (!wallet.publicKey || !isValid) return;
    setLoading(true); setResult(null);
    const res = await sendPayment(wallet.publicKey, to.trim(), amount, memo);
    setResult(res); setLoading(false);
    if (res.success) { await refresh(); setTo(''); setAmount(''); setMemo(''); onSuccess?.(); }
  };

  return (
    <div className="space-y-5">

      {/* Amount hero */}
      <div className="card p-6 flex flex-col items-center gap-1">
        <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Amount to send</p>
        <div className="flex items-baseline gap-2">
          <input
            type="number"
            className="bg-transparent text-white text-5xl font-bold tracking-tight text-center outline-none w-48 placeholder-white/20"
            placeholder="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min="0.0000001"
          />
          <span className="text-2xl font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>XLM</span>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Balance: {formatXLM(bal)} XLM
          </span>
          <button
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            onClick={() => setAmount(Math.max(0, bal - 1).toFixed(4))}
          >
            MAX
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Recipient
          </label>
          <input
            className="field font-mono text-sm"
            placeholder="G… (56-character Stellar address)"
            value={to}
            onChange={e => setTo(e.target.value)}
            spellCheck={false}
          />
          {to && !toValid && (
            <p className="text-xs mt-1.5 ml-1" style={{ color: '#fca5a5' }}>
              Enter a valid Stellar address (starts with G, 56 chars)
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Memo <span className="normal-case font-normal" style={{ color: 'rgba(255,255,255,0.22)' }}>(optional)</span>
          </label>
          <input
            className="field"
            placeholder="e.g. Canteen split, Lab fee…"
            value={memo}
            onChange={e => setMemo(e.target.value)}
            maxLength={28}
          />
          <p className="text-xs mt-1 ml-1 text-right" style={{ color: 'rgba(255,255,255,0.22)' }}>{memo.length}/28</p>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{
            background:   result.success ? 'rgba(16,185,129,0.09)' : 'rgba(239,68,68,0.09)',
            border: `1px solid ${result.success ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
          }}
        >
          {result.success
            ? <CheckCircle size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            : <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
          }
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${result.success ? 'text-emerald-300' : 'text-red-300'}`}>
              {result.success ? 'Payment sent!' : 'Payment failed'}
            </p>
            {result.hash && (
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${result.hash}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors mt-1"
              >
                View on Stellar Expert <ExternalLink size={10} />
              </a>
            )}
            {result.error && <p className="text-xs text-red-300 mt-1 break-words">{result.error}</p>}
          </div>
        </div>
      )}

      <button
        className="btn-primary w-full flex items-center justify-center gap-2.5 py-4"
        onClick={handleSend}
        disabled={!isValid || loading}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Signing in wallet…
          </>
        ) : (
          <>
            <Send size={15} />
            Send {amount ? `${amount} XLM` : 'XLM'}
          </>
        )}
      </button>

      <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.22)' }}>
        Your wallet will prompt you to approve the transaction
      </p>
    </div>
  );
}
