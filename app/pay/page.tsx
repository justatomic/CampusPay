'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Zap, Store, Send, AlertCircle, CheckCircle, ExternalLink, ArrowLeft } from 'lucide-react';
import {
  detectWallet, requestPublicKey, getBalance,
  sendPayment, formatXLM, shortenAddress,
  NETWORK_PASSPHRASE,
} from '@/lib/stellar';

function PayPage() {
  const params  = useSearchParams();
  const to      = params.get('to')     ?? '';
  const bizName = params.get('biz')    ?? '';
  const preset  = params.get('amount') ?? '';
  const memo0   = params.get('memo')   ?? '';

  const [amount, setAmount]   = useState(preset);
  const [memo,   setMemo]     = useState(memo0);
  const [pubKey, setPubKey]   = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const [step,   setStep]     = useState<'connect' | 'pay' | 'done' | 'error'>('connect');
  const [loading, setLoading] = useState(false);
  const [txHash,  setTxHash]  = useState('');
  const [errMsg,  setErrMsg]  = useState('');
  const [walletDetected, setWalletDetected] = useState(false);

  useEffect(() => {
    setTimeout(() => setWalletDetected(!!detectWallet()), 400);
  }, []);

  const connect = async () => {
    setLoading(true);
    try {
      const key = await requestPublicKey();
      const bal = await getBalance(key);
      setPubKey(key); setBalance(bal); setStep('pay');
    } catch (e: any) {
      setErrMsg(e?.message ?? 'Connection failed'); setStep('error');
    }
    setLoading(false);
  };

  const pay = async () => {
    if (!pubKey || !to || !amount) return;
    setLoading(true);
    const res = await sendPayment(pubKey, to, amount, memo);
    if (res.success) { setTxHash(res.hash ?? ''); setStep('done'); }
    else             { setErrMsg(res.error ?? 'Payment failed'); setStep('error'); }
    setLoading(false);
  };

  // Try native Stellar URI first
  const tryNativeWallet = () => {
    let uri = `web+stellar:pay?destination=${to}`;
    if (amount) uri += `&amount=${amount}`;
    if (memo)   uri += `&memo=${encodeURIComponent(memo)}`;
    window.location.href = uri;
    // Fall back to in-app after 1.5s if no wallet opens
    setTimeout(() => setWalletDetected(false), 1500);
  };

  if (!to || to.length !== 56) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--navy)' }}>
        <div className="card p-8 max-w-sm w-full text-center space-y-3">
          <AlertCircle size={40} className="text-red-400 mx-auto" />
          <h2 className="text-white font-semibold text-lg">Invalid payment link</h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>This link is missing or has an invalid Stellar address.</p>
          <a href="/" className="btn-primary flex items-center justify-center gap-2 py-3 mt-2">
            <ArrowLeft size={14} /> Go to CampusPay
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ background: 'radial-gradient(ellipse 100% 55% at 50% 0%, rgba(37,99,235,0.14) 0%, transparent 68%), var(--navy)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(145deg,#1d4ed8,#2563eb)' }}>
          <Zap size={22} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-lg leading-none">CampusPay</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Stellar Testnet</p>
        </div>
      </div>

      <div className="card w-full max-w-sm p-6 space-y-5">

        {/* Vendor info */}
        <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: 'rgba(37,99,235,0.14)' }}>
            {bizName ? '🏪' : '💫'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">{bizName || 'Pay via Stellar'}</p>
            <p className="text-xs font-mono truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{shortenAddress(to, 10)}</p>
          </div>
        </div>

        {/* Step: Connect */}
        {step === 'connect' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Amount (XLM){preset && ' — pre-set by vendor'}
              </label>
              <input className="field text-2xl font-bold py-4 text-center" type="number"
                placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} readOnly={!!preset} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Memo</label>
              <input className="field" placeholder="What's this for?" value={memo} onChange={e => setMemo(e.target.value)} maxLength={28} />
            </div>

            {walletDetected ? (
              <div className="space-y-2">
                <button onClick={connect} disabled={!amount || loading}
                  className="btn-primary w-full flex items-center justify-center gap-2.5 py-4">
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Connecting…</>
                    : <><Zap size={16} /> Connect wallet & pay</>}
                </button>
                <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>Lobstr / Freighter detected</p>
              </div>
            ) : (
              <div className="space-y-3">
                <button onClick={tryNativeWallet} disabled={!amount}
                  className="btn-primary w-full flex items-center justify-center gap-2.5 py-4">
                  <Send size={16} /> Open in Stellar wallet app
                </button>
                <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Opens your Stellar wallet app directly. Or{' '}
                  <a href="https://lobstr.co" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">install Lobstr</a>.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step: Pay */}
        {step === 'pay' && (
          <div className="space-y-4">
            <div className="rounded-xl p-4 space-y-2.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'rgba(255,255,255,0.45)' }}>Sending</span>
                <span className="text-white font-bold">{amount} XLM</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'rgba(255,255,255,0.45)' }}>To</span>
                <span className="text-white font-mono">{shortenAddress(to, 8)}</span>
              </div>
              {memo && <div className="flex justify-between text-sm">
                <span style={{ color: 'rgba(255,255,255,0.45)' }}>Memo</span>
                <span className="text-white italic">"{memo}"</span>
              </div>}
              <div className="flex justify-between text-sm pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ color: 'rgba(255,255,255,0.45)' }}>Your balance</span>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>{formatXLM(balance)} XLM</span>
              </div>
            </div>

            <button onClick={pay} disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2.5 py-4">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing…</>
                : <><Send size={16} /> Confirm & pay {amount} XLM</>}
            </button>
            <button onClick={() => setStep('connect')} className="btn-ghost w-full py-2.5 text-sm flex items-center justify-center gap-2">
              <ArrowLeft size={13} /> Back
            </button>
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
              style={{ background: 'rgba(16,185,129,0.14)', border: '2px solid rgba(16,185,129,0.3)' }}>
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl">Payment sent!</h3>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{amount} XLM{bizName ? ` to ${bizName}` : ''}</p>
            </div>
            {txHash && (
              <a href={`https://stellar.expert/explorer/testnet/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-blue-400 text-sm hover:text-blue-300 transition-colors">
                View transaction <ExternalLink size={13} />
              </a>
            )}
            <a href="/" className="btn-ghost w-full flex items-center justify-center gap-2 py-3 mt-2">
              Back to CampusPay
            </a>
          </div>
        )}

        {/* Step: Error */}
        {step === 'error' && (
          <div className="text-center space-y-4 py-2">
            <AlertCircle size={36} className="text-red-400 mx-auto" />
            <div>
              <h3 className="text-white font-semibold">Something went wrong</h3>
              <p className="text-xs mt-1 break-words" style={{ color: 'rgba(255,255,255,0.4)' }}>{errMsg}</p>
            </div>
            <button onClick={() => setStep('connect')} className="btn-primary w-full py-3">Try again</button>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>
        Powered by CampusPay · Stellar Testnet
      </p>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <PayPage />
    </Suspense>
  );
}
