'use client';

import { useState } from 'react';
import { Send, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { useWallet } from '@/lib/wallet-context';
import { sendPayment, formatXLM } from '@/lib/stellar';
import { Spinner } from './ui/Spinner';

interface SendPaymentProps {
  onSuccess?: () => void;
  defaultTo?: string;
  defaultAmount?: string;
}

export function SendPayment({ onSuccess, defaultTo = '', defaultAmount = '' }: SendPaymentProps) {
  const { wallet, refresh } = useWallet();
  const [to, setTo] = useState(defaultTo);
  const [amount, setAmount] = useState(defaultAmount);
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; hash?: string; error?: string } | null>(null);

  const isValid =
    to.trim().length === 56 &&
    to.trim().startsWith('G') &&
    parseFloat(amount) > 0 &&
    parseFloat(amount) <= parseFloat(wallet.balance || '0');

  const handleSend = async () => {
    if (!wallet.publicKey || !isValid) return;
    setLoading(true);
    setResult(null);

    const res = await sendPayment(wallet.publicKey, to.trim(), amount, memo);
    setResult(res);
    setLoading(false);

    if (res.success) {
      await refresh();
      setTo('');
      setAmount('');
      setMemo('');
      onSuccess?.();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-white/50 text-xs font-medium mb-2 uppercase tracking-wider">
          Recipient address
        </label>
        <input
          className="input-field font-mono text-sm"
          placeholder="G… (56-character Stellar address)"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          spellCheck={false}
        />
      </div>

      <div>
        <label className="block text-white/50 text-xs font-medium mb-2 uppercase tracking-wider">
          Amount (XLM)
        </label>
        <div className="relative">
          <input
            className="input-field pr-20"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.0000001"
            step="any"
          />
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 text-xs font-semibold hover:text-blue-300 transition-colors"
            onClick={() =>
              setAmount(
                Math.max(0, parseFloat(wallet.balance || '0') - 1).toFixed(4)
              )
            }
          >
            MAX
          </button>
        </div>
        <p className="text-white/30 text-xs mt-1.5 ml-1">
          Available: {formatXLM(wallet.balance || '0')} XLM
        </p>
      </div>

      <div>
        <label className="block text-white/50 text-xs font-medium mb-2 uppercase tracking-wider">
          Memo <span className="text-white/25 normal-case font-normal">(optional)</span>
        </label>
        <input
          className="input-field"
          placeholder="e.g. Canteen split, Lab fee…"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          maxLength={28}
        />
        <p className="text-white/25 text-xs mt-1 ml-1">{memo.length}/28</p>
      </div>

      {result && (
        <div
          className="rounded-xl p-4 flex items-start gap-3"
          style={{
            background: result.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${result.success ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
          }}
        >
          {result.success ? (
            <CheckCircle size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${result.success ? 'text-emerald-300' : 'text-red-300'}`}>
              {result.success ? 'Payment sent!' : 'Payment failed'}
            </p>
            {result.hash && (
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${result.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
              >
                View on explorer <ExternalLink size={10} />
              </a>
            )}
            {result.error && (
              <p className="text-xs text-red-400 mt-1 break-words">{result.error}</p>
            )}
          </div>
        </div>
      )}

      <button
        className="btn-primary w-full flex items-center justify-center gap-2"
        onClick={handleSend}
        disabled={!isValid || loading}
        style={{ opacity: !isValid || loading ? 0.5 : 1 }}
      >
        {loading ? (
          <>
            <Spinner size={16} color="white" />
            Signing in Freighter…
          </>
        ) : (
          <>
            <Send size={15} />
            Send {amount ? `${amount} XLM` : 'XLM'}
          </>
        )}
      </button>

      <p className="text-white/25 text-xs text-center">
        Freighter will prompt you to sign the transaction
      </p>
    </div>
  );
}
