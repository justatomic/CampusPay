'use client';

import { useState, useRef } from 'react';
import { Copy, Download, Check, QrCode } from 'lucide-react';
import { useWallet } from '@/lib/wallet-context';
import QRCode from 'react-qrcode-logo';

export function ReceivePayment() {
  const { wallet } = useWallet();
  const [amount, setAmount] = useState('');
  const [memo, setMemo]     = useState('');
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const address = wallet.publicKey ?? '';
  const qrValue = (() => {
    let uri = `web+stellar:pay?destination=${address}`;
    if (amount) uri += `&amount=${amount}`;
    if (memo)   uri += `&memo=${encodeURIComponent(memo)}`;
    return uri;
  })();

  const copyAddr = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = 'campuspay-address.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  return (
    <div className="space-y-5">

      {/* QR card */}
      <div className="card p-6 flex flex-col items-center gap-5">
        <div ref={qrRef} className="rounded-2xl overflow-hidden bg-white p-3" style={{ lineHeight: 0 }}>
          <QRCode
            value={qrValue || address}
            size={200}
            bgColor="#ffffff"
            fgColor="#080f1e"
            qrStyle="dots"
            eyeRadius={10}
          />
        </div>

        <div className="text-center w-full">
          <p className="text-sm font-semibold text-white mb-1.5">Your Stellar address</p>
          <p className="text-xs font-mono break-all leading-relaxed px-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {address}
          </p>
        </div>

        <div className="flex gap-2.5 w-full">
          <button
            onClick={copyAddr}
            className="btn-ghost flex-1 flex items-center justify-center gap-2 py-3"
          >
            {copied
              ? <><Check size={14} className="text-emerald-400" /><span className="text-emerald-400 text-sm">Copied!</span></>
              : <><Copy size={14} /><span className="text-sm">Copy address</span></>
            }
          </button>
          <button onClick={download} className="btn-ghost px-4 py-3 flex items-center justify-center">
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Request amount */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <QrCode size={15} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Request specific amount</h3>
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Set a fixed amount — the QR code updates automatically.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Amount</label>
            <input className="field" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Memo</label>
            <input className="field" placeholder="Canteen…" value={memo} onChange={e => setMemo(e.target.value)} maxLength={28} />
          </div>
        </div>
        {(amount || memo) && (
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            QR encodes: {amount && `${amount} XLM`}{memo && ` · "${memo}"`}
          </p>
        )}
      </div>
    </div>
  );
}
