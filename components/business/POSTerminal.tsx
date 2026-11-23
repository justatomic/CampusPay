'use client';

import { useState, useRef, useEffect } from 'react';
import { Copy, Check, Wifi, RefreshCw, ArrowDownLeft } from 'lucide-react';
import { useWallet }  from '@/lib/wallet-context';
import { useProfile } from '@/lib/profile-context';
import { formatXLM, getTransactions } from '@/lib/stellar';
import type { Transaction } from '@/lib/types';
import QRCode from 'react-qrcode-logo';

const APP_BASE = typeof window !== 'undefined' ? window.location.origin : 'https://campus-pay-umber.vercel.app';

export function POSTerminal() {
  const { wallet, refresh }  = useWallet();
  const { profile }          = useProfile();
  const biz                  = profile.business;
  const addr                 = wallet.publicKey ?? '';

  const [reqAmt,  setReqAmt]  = useState('');
  const [reqMemo, setReqMemo] = useState('');
  const [copiedQr,  setCopiedQr]  = useState(false);
  const [copiedNfc, setCopiedNfc] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [incoming, setIncoming]   = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [todayRev, setTodayRev]   = useState(0);
  const qrRef = useRef<HTMLDivElement>(null);

  const payUrl = (() => {
    let u = `${APP_BASE}/pay?to=${addr}`;
    if (biz.name) u += `&biz=${encodeURIComponent(biz.name)}`;
    if (reqAmt)   u += `&amount=${reqAmt}`;
    if (reqMemo)  u += `&memo=${encodeURIComponent(reqMemo)}`;
    return u;
  })();

  const nfcUrl = `${APP_BASE}/pay?to=${addr}${biz.name ? `&biz=${encodeURIComponent(biz.name)}` : ''}`;

  const load = async () => {
    if (!addr) return;
    setRefreshing(true);
    await refresh();
    const txs = await getTransactions(addr);
    const inc  = txs.filter(t => t.type === 'receive');
    setIncoming(inc.slice(0, 25));
    const today = new Date().toDateString();
    setTodayRev(inc.filter(t => new Date(t.createdAt).toDateString() === today).reduce((s, t) => s + parseFloat(t.amount), 0));
    setRefreshing(false);
  };

  useEffect(() => { load(); }, [addr]);

  const copy = async (text: string, which: 'qr' | 'nfc' | 'addr') => {
    await navigator.clipboard.writeText(text);
    if (which === 'qr')   { setCopiedQr(true);   setTimeout(() => setCopiedQr(false),   2000); }
    if (which === 'nfc')  { setCopiedNfc(true);   setTimeout(() => setCopiedNfc(false),  2000); }
    if (which === 'addr') { setCopiedAddr(true);  setTimeout(() => setCopiedAddr(false), 2000); }
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `${biz.name || 'campuspay'}-qr.png`;
    a.href = canvas.toDataURL('image/png'); a.click();
  };

  return (
    <div className="biz-content-grid">

      {/* ── LEFT ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="stat-card">
            <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Today's revenue</p>
            <p className="text-white font-bold" style={{ fontSize: '24px' }}>{formatXLM(todayRev)}</p>
            <p className="text-xs text-blue-400 mt-0.5">XLM</p>
          </div>
          <div className="stat-card">
            <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Wallet balance</p>
            <p className="text-white font-bold" style={{ fontSize: '24px' }}>{formatXLM(wallet.balance ?? '0')}</p>
            <p className="text-xs text-blue-400 mt-0.5">XLM</p>
          </div>
        </div>

        {/* QR generator */}
        <div className="glass-card p-5" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 className="text-white text-sm font-semibold">Payment request QR</h3>
            <button onClick={load} className="p-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <RefreshCw size={13} className={`text-white/40 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Amount (XLM)</label>
            <input className="input-field" type="number" placeholder="Leave blank — customer enters amount" value={reqAmt} onChange={e => setReqAmt(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Item description</label>
            <input className="input-field" placeholder="e.g. Jollof rice + drink" value={reqMemo} onChange={e => setReqMemo(e.target.value)} maxLength={28} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div ref={qrRef} className="rounded-2xl bg-white p-3" style={{ lineHeight: 0 }}>
              <QRCode value={payUrl} size={188} bgColor="#ffffff" fgColor="#0a1628" qrStyle="dots" eyeRadius={8} />
            </div>
            <p className="text-xs text-center px-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Student scans with any camera to pay instantly
            </p>
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button onClick={() => copy(payUrl, 'qr')} className="btn-secondary flex-1 flex items-center justify-center gap-2" style={{ padding: '10px' }}>
                {copiedQr ? <><Check size={13} className="text-emerald-400" /><span className="text-emerald-400 text-sm">Copied!</span></> : <><Copy size={13} /><span className="text-sm">Copy link</span></>}
              </button>
              <button onClick={downloadQR} className="btn-secondary text-sm" style={{ padding: '10px 16px' }}>Save QR</button>
            </div>
          </div>
        </div>

        {/* NFC section */}
        <div className="glass-card p-5" style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(109,40,217,0.07)', borderColor: 'rgba(109,40,217,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wifi size={20} className="text-purple-400 nfc-ring" />
            <div>
              <h3 className="text-white text-sm font-semibold">NFC Tap-to-Pay</h3>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Write this URL to any NFC tag</p>
            </div>
          </div>
          <div className="rounded-xl p-3 font-mono text-xs break-all leading-relaxed" style={{ background: 'rgba(255,255,255,0.055)', color: 'rgba(165,165,255,0.85)' }}>
            {nfcUrl}
          </div>
          <button onClick={() => copy(nfcUrl, 'nfc')} className="btn-secondary flex items-center justify-center gap-2" style={{ padding: '10px' }}>
            {copiedNfc ? <><Check size={13} className="text-emerald-400" /><span className="text-emerald-400 text-sm">Copied!</span></> : <><Copy size={13} /><span className="text-sm">Copy tag URL</span></>}
          </button>
          <div className="rounded-xl p-3 text-xs leading-relaxed space-y-1.5" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)' }}>
            <p className="font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>How it works:</p>
            <p>1. Copy URL above → write to any NFC tag (≈₦500/tag, app: NFC Tools)</p>
            <p>2. Student taps phone → CampusPay opens with your address pre-filled</p>
            <p>3. Student enters amount → approves in Varial Wallet → done ✅</p>
          </div>
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Live feed */}
        <div className="glass-card p-5" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-glow" style={{ display: 'inline-block' }} />
              <h3 className="text-white text-sm font-semibold">Incoming payments</h3>
            </div>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{incoming.length} total</span>
          </div>

          {incoming.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', gap: '8px' }}>
              <ArrowDownLeft size={28} style={{ color: 'rgba(255,255,255,0.1)' }} />
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No payments yet</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>Share your QR or NFC link to start receiving</p>
            </div>
          ) : (
            <div className="no-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '360px', overflowY: 'auto' }}>
              {incoming.map(tx => (
                <div key={tx.id} className="live-row">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(16,185,129,0.14)' }}>
                    <ArrowDownLeft size={15} className="text-emerald-400" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="text-white text-sm font-semibold">{formatXLM(tx.amount)} XLM</p>
                    {tx.memo && <p className="text-xs truncate italic" style={{ color: 'rgba(255,255,255,0.35)' }}>"{tx.memo}"</p>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {new Date(tx.createdAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>
                      {new Date(tx.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Address card */}
        <div className="glass-card p-5" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 className="text-white text-sm font-semibold">Your Stellar address</h3>
          <p className="text-xs font-mono break-all leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{addr}</p>
          <button onClick={() => copy(addr, 'addr')} className="btn-secondary flex items-center justify-center gap-2" style={{ padding: '10px' }}>
            {copiedAddr ? <><Check size={13} className="text-emerald-400" /><span className="text-emerald-400 text-sm">Copied!</span></> : <><Copy size={13} /><span className="text-sm">Copy address</span></>}
          </button>
        </div>
      </div>
    </div>
  );
}
