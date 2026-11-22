'use client';

import { useState, useRef, useEffect } from 'react';
import { Copy, Check, Wifi, QrCode, ExternalLink, RefreshCw, TrendingUp, ArrowDownLeft } from 'lucide-react';
import { useWallet } from '@/lib/wallet-context';
import { useProfile } from '@/lib/profile-context';
import { formatXLM, getTransactions, type TxRecord } from '@/lib/stellar';
import QRCode from 'react-qrcode-logo';

const CATEGORIES = ['Food & Drinks','Stationery','Clothing','Electronics','Services','Transport','Other'];
const APP_BASE   = typeof window !== 'undefined' ? window.location.origin : 'https://campus-pay-umber.vercel.app';

export function POSTerminal() {
  const { wallet, refresh }  = useWallet();
  const { profile }          = useProfile();
  const biz                  = profile.business;
  const addr                 = wallet.publicKey ?? '';

  const [requestAmt, setRequestAmt]   = useState('');
  const [requestMemo, setRequestMemo] = useState('');
  const [copiedUrl, setCopiedUrl]     = useState(false);
  const [copiedAddr, setCopiedAddr]   = useState(false);
  const [recentTxs, setRecentTxs]     = useState<TxRecord[]>([]);
  const [refreshing, setRefreshing]   = useState(false);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const qrRef = useRef<HTMLDivElement>(null);

  // Build payment URL
  const payUrl = (() => {
    let url = `${APP_BASE}/pay?to=${addr}`;
    if (biz.name)     url += `&biz=${encodeURIComponent(biz.name)}`;
    if (requestAmt)   url += `&amount=${requestAmt}`;
    if (requestMemo)  url += `&memo=${encodeURIComponent(requestMemo)}`;
    return url;
  })();

  // NFC tag URL (no pre-set amount — customer or vendor sets it at time of purchase)
  const nfcTagUrl = `${APP_BASE}/pay?to=${addr}${biz.name ? `&biz=${encodeURIComponent(biz.name)}` : ''}`;

  const loadTxs = async () => {
    if (!addr) return;
    setRefreshing(true);
    await refresh();
    const txs = await getTransactions(addr);
    const incoming = txs.filter(t => t.type === 'receive');
    setRecentTxs(incoming.slice(0, 20));
    // Today's revenue
    const today = new Date().toDateString();
    const rev = incoming
      .filter(t => new Date(t.createdAt).toDateString() === today)
      .reduce((s, t) => s + parseFloat(t.amount), 0);
    setTodayRevenue(rev);
    setRefreshing(false);
  };

  useEffect(() => { loadTxs(); }, [addr]);

  const copy = async (text: string, which: 'url' | 'addr') => {
    await navigator.clipboard.writeText(text);
    if (which === 'url')  { setCopiedUrl(true);  setTimeout(() => setCopiedUrl(false), 2000); }
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
    <div className="biz-grid">

      {/* ── LEFT COL ── */}
      <div className="flex flex-col gap-5">

        {/* Revenue stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="stat-card">
            <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Today's revenue</p>
            <p className="text-2xl font-bold text-white">{formatXLM(todayRevenue)}</p>
            <p className="text-xs mt-0.5 text-blue-400">XLM</p>
          </div>
          <div className="stat-card">
            <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Total received</p>
            <p className="text-2xl font-bold text-white">{formatXLM(wallet.balance ?? '0')}</p>
            <p className="text-xs mt-0.5 text-blue-400">XLM balance</p>
          </div>
        </div>

        {/* Payment request generator */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Generate payment request</h3>
            <button onClick={loadTxs} className="p-1.5 rounded-lg transition-colors" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <RefreshCw size={13} className={`text-white/50 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Amount (XLM)</label>
            <input className="field" type="number" placeholder="Leave blank for customer to enter" value={requestAmt} onChange={e => setRequestAmt(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Item / description</label>
            <input className="field" placeholder="e.g. Jollof rice + drink" value={requestMemo} onChange={e => setRequestMemo(e.target.value)} maxLength={28} />
          </div>

          {/* QR */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <div ref={qrRef} className="rounded-2xl bg-white p-3" style={{ lineHeight: 0 }}>
              <QRCode
                value={payUrl}
                size={180}
                bgColor="#ffffff"
                fgColor="#080f1e"
                qrStyle="dots"
                eyeRadius={10}
              />
            </div>
            <p className="text-xs text-center px-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Student scans this QR with any camera to pay
            </p>

            <div className="flex gap-2 w-full">
              <button onClick={() => copy(payUrl, 'url')} className="btn-ghost flex-1 flex items-center justify-center gap-2 py-2.5 text-sm">
                {copiedUrl ? <><Check size={13} className="text-emerald-400" /><span className="text-emerald-400">Copied!</span></> : <><Copy size={13} />Copy link</>}
              </button>
              <button onClick={downloadQR} className="btn-ghost px-4 py-2.5 text-sm">Save QR</button>
            </div>
          </div>
        </div>

        {/* NFC tag section */}
        <div className="card p-5 space-y-4" style={{ background: 'rgba(109,40,217,0.07)', borderColor: 'rgba(109,40,217,0.2)' }}>
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <Wifi size={18} className="text-purple-400 nfc-ring" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">NFC Tap-to-Pay tag</h3>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Program this URL onto any NFC tag</p>
            </div>
          </div>

          <div className="rounded-xl p-3 font-mono text-xs break-all leading-relaxed" style={{ background: 'rgba(255,255,255,0.055)', color: 'rgba(165,165,255,0.8)' }}>
            {nfcTagUrl}
          </div>

          <div className="flex gap-2">
            <button onClick={() => copy(nfcTagUrl, 'addr')} className="btn-ghost flex-1 flex items-center justify-center gap-2 py-2.5 text-sm">
              {copiedAddr ? <><Check size={13} className="text-emerald-400" /><span className="text-emerald-400">Copied!</span></> : <><Copy size={13} />Copy tag URL</>}
            </button>
            <a href={`https://www.nfc-tools.app`} target="_blank" rel="noopener noreferrer" className="btn-ghost flex items-center gap-1.5 px-3 py-2.5 text-xs">
              Write tag <ExternalLink size={11} />
            </a>
          </div>

          <div className="rounded-xl p-3 text-xs leading-relaxed space-y-1" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)' }}>
            <p className="font-semibold text-white/60">How it works:</p>
            <p>1. Copy the URL above and write it to any NFC tag (≈₦500/tag)</p>
            <p>2. Student taps phone on tag → CampusPay opens pre-filled with your address</p>
            <p>3. Student enters amount → approves in their Stellar wallet → done ✅</p>
          </div>
        </div>
      </div>

      {/* ── RIGHT COL ── */}
      <div className="flex flex-col gap-5">

        {/* Live incoming payments */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="relative w-2 h-2">
                <span className="block w-2 h-2 rounded-full bg-emerald-400 dot-ping" style={{ position: 'relative' }} />
              </div>
              <h3 className="text-sm font-semibold text-white">Incoming payments</h3>
            </div>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{recentTxs.length} total</span>
          </div>

          {recentTxs.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-2">
              <ArrowDownLeft size={24} style={{ color: 'rgba(255,255,255,0.12)' }} />
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No payments yet today</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>Share your QR or tap link to start receiving</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto no-scrollbar">
              {recentTxs.map(tx => (
                <div key={tx.id} className="live-row">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(16,185,129,0.14)' }}>
                    <ArrowDownLeft size={15} className="text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{formatXLM(tx.amount)} XLM</p>
                    {tx.memo && <p className="text-xs truncate italic" style={{ color: 'rgba(255,255,255,0.35)' }}>"{tx.memo}"</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
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

        {/* Wallet address card */}
        <div className="card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white">Your Stellar address</h3>
          <p className="text-xs font-mono break-all leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{addr}</p>
          <button onClick={() => copy(addr, 'addr')} className="btn-ghost w-full flex items-center justify-center gap-2 py-2.5 text-sm">
            {copiedAddr ? <><Check size={13} className="text-emerald-400" /><span className="text-emerald-400">Copied!</span></> : <><Copy size={13} />Copy address</>}
          </button>
        </div>
      </div>
    </div>
  );
}
