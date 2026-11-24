'use client';

import { useState } from 'react';
import { Send, AlertCircle, CheckCircle, ExternalLink, QrCode, ChevronRight } from 'lucide-react';
import { useWallet }                                from '@/lib/wallet-context';
import { sendPayment, sendPaymentLocal, formatXLM } from '@/lib/stellar';
import { Spinner }                                  from './ui/Spinner';

interface SendPaymentProps {
  onSuccess?: () => void;
  defaultTo?: string;
  defaultAmount?: string;
}

type Step = 'form' | 'review';

export function SendPayment({ onSuccess, defaultTo = '', defaultAmount = '' }: SendPaymentProps) {
  const { wallet, refresh, localKeypair, authMethod } = useWallet();
  const [to, setTo]         = useState(defaultTo);
  const [amount, setAmount] = useState(defaultAmount);
  const [memo, setMemo]     = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep]     = useState<Step>('form');
  const [result, setResult] = useState<{ success: boolean; hash?: string; error?: string } | null>(null);

  const isValidAddr = to.trim().length === 56 && to.trim().startsWith('G');
  const isValidAmt  = parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(wallet.balance || '0');
  const isValid     = isValidAddr && isValidAmt;

  const handleSend = async () => {
    if (!wallet.publicKey || !isValid) return;
    setLoading(true);
    setResult(null);

    let res: { success: boolean; hash?: string; error?: string };

    if (authMethod === 'google' && localKeypair) {
      // Google auth — sign locally, no extension popup
      res = await sendPaymentLocal(localKeypair, to.trim(), amount, memo);
    } else {
      // Varial extension — opens wallet popup
      res = await sendPayment(wallet.publicKey, to.trim(), amount, memo);
    }

    setResult(res);
    setLoading(false);
    if (res.success) {
      await refresh();
      setTo(''); setAmount(''); setMemo('');
      setStep('form');
      onSuccess?.();
    }
  };

  if (step === 'review') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card card-p">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Review payment</h3>

        {/* Auth method indicator */}
        <div style={{ marginBottom: 16, padding: '8px 12px', borderRadius: 8, background: authMethod === 'google' ? 'var(--lime-bg)' : 'var(--bg-muted)', border: `1px solid ${authMethod === 'google' ? 'var(--lime-border)' : 'var(--border)'}` }}>
          <p style={{ fontSize: 12, color: authMethod === 'google' ? '#3A6B10' : 'var(--text-muted)' }}>
            {authMethod === 'google'
              ? '✓ Signed automatically with your Google-linked wallet'
              : '⬡ You\'ll approve this in your Varial wallet extension'}
          </p>
        </div>

        {[
          { label: 'To',       val: to,     mono: true },
          { label: 'Amount',   val: `${amount} XLM` },
          { label: 'Network fee', val: '~0.00001 XLM' },
          { label: 'Total',    val: `~${(parseFloat(amount) + 0.00001).toFixed(5)} XLM`, bold: true },
        ].map(r => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{r.label}</span>
            <span style={{ fontSize: 13, fontWeight: r.bold ? 700 : 500, maxWidth: '55%', textAlign: 'right', wordBreak: 'break-all', fontFamily: r.mono ? 'monospace' : undefined }}>
              {r.val}
            </span>
          </div>
        ))}
        {memo && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Note</span>
            <span style={{ fontSize: 13 }}>{memo}</span>
          </div>
        )}
      </div>

      {result && (
        <div className="card card-p" style={{ background: result.success ? 'var(--success-bg)' : 'var(--danger-bg)', borderColor: result.success ? '#BBF7D0' : '#FECACA' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            {result.success
              ? <CheckCircle size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
              : <AlertCircle size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />
            }
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: result.success ? '#15803D' : '#DC2626' }}>
                {result.success ? 'Payment sent!' : 'Payment failed'}
              </p>
              {result.hash && (
                <a href={`https://stellar.expert/explorer/testnet/tx/${result.hash}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, textDecoration: 'none' }}>
                  View on Stellar Explorer <ExternalLink size={11} />
                </a>
              )}
              {result.error && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{result.error}</p>}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep('form')}>Back</button>
        <button className="btn-primary" style={{ flex: 2 }} onClick={handleSend} disabled={loading}>
          {loading
            ? <><Spinner size={15} color="white" />{authMethod === 'google' ? 'Sending…' : 'Approving in Varial…'}</>
            : <><Send size={15} />Confirm & Send</>
          }
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Recipient */}
      <div className="card card-p">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Recipient</h3>
        <div style={{ position: 'relative' }}>
          <input className="input-field" style={{ paddingRight: 44, fontFamily: 'monospace', fontSize: 13 }}
            placeholder="Search by username or wallet address…"
            value={to} onChange={e => setTo(e.target.value)} spellCheck={false}
          />
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
            <QrCode size={16} style={{ color: 'var(--text-faint)' }} />
          </div>
        </div>
        {to && !isValidAddr && (
          <p style={{ marginTop: 6, fontSize: 12, color: 'var(--danger)' }}>
            Enter a valid 56-character Stellar address (starts with G)
          </p>
        )}
      </div>

      {/* Amount */}
      <div className="card card-p">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Amount (XLM)</h3>
        <div style={{ position: 'relative' }}>
          <input className="input-field" style={{ fontSize: 24, fontWeight: 700, paddingRight: 60 }}
            type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} min="0.0000001" step="any"
          />
          <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>XLM</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Available: {formatXLM(wallet.balance || '0')} XLM</span>
          <button onClick={() => setAmount(Math.max(0, parseFloat(wallet.balance || '0') - 1).toFixed(4))}
            style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer' }}>
            MAX
          </button>
        </div>
      </div>

      {/* Note */}
      <div className="card card-p">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
          Note <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-faint)' }}>(optional)</span>
        </h3>
        <input className="input-field" placeholder="Add a note…" value={memo} onChange={e => setMemo(e.target.value)} maxLength={28} />
        <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4, textAlign: 'right' }}>{memo.length}/28</p>
      </div>

      {/* Fee summary */}
      <div style={{ padding: '0 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Network Fee</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>~0.00001 XLM</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 4px' }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Total</span>
          <span style={{ fontSize: 14, fontWeight: 700 }}>
            {amount ? (parseFloat(amount) + 0.00001).toFixed(5) : '0.00'} XLM
          </span>
        </div>
      </div>

      <button className="btn-primary" style={{ width: '100%' }} onClick={() => setStep('review')} disabled={!isValid}>
        Review Payment <ChevronRight size={15} style={{ marginLeft: 'auto' }} />
      </button>
    </div>
  );
}
