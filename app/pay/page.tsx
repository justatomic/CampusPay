'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Zap, Send, AlertCircle, CheckCircle, ExternalLink, ArrowLeft } from 'lucide-react';
import {
  isFreighterInstalled,
  getFreighterPublicKey,
  getBalance,
  sendPayment,
  formatXLM,
  shortenAddress,
  NETWORK_PASSPHRASE,
} from '@/lib/stellar';

type Step = 'connect' | 'pay' | 'done' | 'error';

function PayPage() {
  const params  = useSearchParams();
  const to      = params.get('to')     ?? '';
  const bizName = params.get('biz')    ?? '';
  const preset  = params.get('amount') ?? '';
  const memo0   = params.get('memo')   ?? '';

  const [amount,    setAmount]    = useState(preset);
  const [memo,      setMemo]      = useState(memo0);
  const [pubKey,    setPubKey]    = useState<string | null>(null);
  const [balance,   setBalance]   = useState('0');
  const [step,      setStep]      = useState<Step>('connect');
  const [loading,   setLoading]   = useState(false);
  const [txHash,    setTxHash]    = useState('');
  const [errMsg,    setErrMsg]    = useState('');
  const [varialOk,  setVarialOk]  = useState<boolean | null>(null);

  useEffect(() => {
    // Give wallet extension 600ms to inject into the page
    const t = setTimeout(async () => {
      const ok = await isFreighterInstalled();
      setVarialOk(ok);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  // Invalid link guard
  const isValidAddr = to.length === 56 && to.startsWith('G');

  const connectAndPay = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    try {
      const key = await getFreighterPublicKey();
      if (!key) throw new Error('Could not get address from Varial Wallet');
      const bal = await getBalance(key);
      setPubKey(key); setBalance(bal); setStep('pay');
    } catch (e: any) {
      setErrMsg(e?.message ?? 'Connection failed');
      setStep('error');
    }
    setLoading(false);
  };

  const confirmPay = async () => {
    if (!pubKey || !to || !amount) return;
    setLoading(true);
    const res = await sendPayment(pubKey, to, amount, memo);
    if (res.success) { setTxHash(res.hash ?? ''); setStep('done'); }
    else             { setErrMsg(res.error ?? 'Payment failed'); setStep('error'); }
    setLoading(false);
  };

  // Try native stellar: URI (opens Lobstr/Varial app on mobile)
  const openNativeWallet = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    let uri = `web+stellar:pay?destination=${to}`;
    if (amount) uri += `&amount=${amount}`;
    if (memo)   uri += `&memo=${encodeURIComponent(memo)}`;
    window.location.href = uri;
  };

  if (!isValidAddr) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--navy)' }}>
        <div className="glass-card p-8 max-w-sm w-full text-center space-y-4">
          <AlertCircle size={40} className="text-red-400 mx-auto" />
          <h2 className="text-white font-semibold text-lg">Invalid payment link</h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            This link is missing or has an invalid Stellar address. Ask the vendor to share their correct link.
          </p>
          <a href="/" className="btn-primary w-full flex items-center justify-center gap-2" style={{ padding: '12px' }}>
            <ArrowLeft size={14} /> Go to CampusPay
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ background: 'radial-gradient(ellipse 100% 55% at 50% 0%, rgba(37,99,235,0.14) 0%, transparent 68%), var(--navy)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center pulse-glow"
          style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}>
          <Zap size={22} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-lg leading-none">CampusPay</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Stellar Testnet</p>
        </div>
      </div>

      <div className="glass-card w-full max-w-sm p-6 space-y-5">

        {/* Vendor info */}
        <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: 'rgba(37,99,235,0.14)' }}>
            {bizName ? '🏪' : '💫'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">{bizName || 'Pay via Stellar'}</p>
            <p className="text-xs font-mono truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {shortenAddress(to, 10)}
            </p>
          </div>
        </div>

        {/* ── STEP: connect ── */}
        {step === 'connect' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Amount (XLM){preset ? ' — set by vendor' : ''}
              </label>
              <input
                className="input-field text-center font-bold"
                style={{ fontSize: '28px', padding: '14px' }}
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                readOnly={!!preset}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Memo <span className="normal-case font-normal" style={{ color: 'rgba(255,255,255,0.22)' }}>(optional)</span>
              </label>
              <input className="input-field" placeholder="What's this for?" value={memo} onChange={e => setMemo(e.target.value)} maxLength={28} />
            </div>

            {/* Wallet not yet detected — show both options */}
            {varialOk === null && (
              <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>Detecting wallet…</p>
            )}

            {varialOk === true && (
              <div className="space-y-2">
                <button
                  onClick={connectAndPay}
                  disabled={!amount || loading}
                  className="btn-primary w-full flex items-center justify-center gap-2.5"
                  style={{ padding: '14px', opacity: !amount ? 0.4 : 1 }}
                >
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} /> Connecting…</>
                    : <><Zap size={16} /> Connect Varial &amp; pay</>
                  }
                </button>
                <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>Varial Wallet detected</p>
              </div>
            )}

            {varialOk === false && (
              <div className="space-y-2">
                <button
                  onClick={openNativeWallet}
                  disabled={!amount}
                  className="btn-primary w-full flex items-center justify-center gap-2.5"
                  style={{ padding: '14px', opacity: !amount ? 0.4 : 1 }}
                >
                  <Send size={16} /> Open in Stellar wallet app
                </button>
                <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Or{' '}
                  <a href="https://varialwallet.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                    install Varial Wallet
                  </a>
                  {' '}to pay in-browser.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── STEP: confirm pay ── */}
        {step === 'pay' && (
          <div className="space-y-4">
            <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.055)' }}>
              {[
                { label: 'Sending',  value: `${amount} XLM` },
                { label: 'To',       value: shortenAddress(to, 10) },
                { label: 'Memo',     value: memo || '—' },
                { label: 'Balance',  value: `${formatXLM(balance)} XLM` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</span>
                  <span className="text-white font-medium font-mono">{value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={confirmPay}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2.5"
              style={{ padding: '14px' }}
            >
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} /> Signing…</>
                : <><Send size={15} /> Confirm &amp; pay {amount} XLM</>
              }
            </button>
            <button onClick={() => setStep('connect')} className="btn-secondary w-full flex items-center justify-center gap-2" style={{ padding: '11px' }}>
              <ArrowLeft size={13} /> Back
            </button>
          </div>
        )}

        {/* ── STEP: done ── */}
        {step === 'done' && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
              style={{ background: 'rgba(16,185,129,0.14)', border: '2px solid rgba(16,185,129,0.3)' }}>
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl">Payment sent!</h3>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {amount} XLM{bizName ? ` to ${bizName}` : ''}
              </p>
            </div>
            {txHash && (
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                View on Stellar Expert <ExternalLink size={13} />
              </a>
            )}
            <a href="/" className="btn-secondary w-full flex items-center justify-center gap-2" style={{ padding: '12px', marginTop: '8px', display: 'flex' }}>
              Back to CampusPay
            </a>
          </div>
        )}

        {/* ── STEP: error ── */}
        {step === 'error' && (
          <div className="text-center space-y-4 py-2">
            <AlertCircle size={36} className="text-red-400 mx-auto" />
            <div>
              <h3 className="text-white font-semibold">Something went wrong</h3>
              <p className="text-xs mt-1 break-words" style={{ color: 'rgba(255,255,255,0.4)' }}>{errMsg}</p>
            </div>
            <button onClick={() => setStep('connect')} className="btn-primary w-full" style={{ padding: '13px' }}>
              Try again
            </button>
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--navy)' }}>
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
      </div>
    }>
      <PayPage />
    </Suspense>
  );
}
