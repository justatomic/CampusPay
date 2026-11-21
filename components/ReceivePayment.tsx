'use client';

import { useState, useRef } from 'react';
import { Copy, Download, Check, QrCode } from 'lucide-react';
import { useWallet } from '@/lib/wallet-context';
import QRCode from 'react-qrcode-logo';

export function ReceivePayment() {
  const { wallet } = useWallet();
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const address = wallet.publicKey || '';

  // Build a Stellar payment URI
  const buildQRData = () => {
    let uri = `web+stellar:pay?destination=${address}`;
    if (amount) uri += `&amount=${amount}`;
    if (memo) uri += `&memo=${encodeURIComponent(memo)}`;
    return uri;
  };

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'campuspay-qr.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-5">
      {/* QR Code */}
      <div className="glass-card p-6 flex flex-col items-center gap-4">
        <div
          ref={qrRef}
          className="rounded-2xl overflow-hidden p-3 bg-white"
          style={{ lineHeight: 0 }}
        >
          <QRCode
            value={buildQRData()}
            size={200}
            bgColor="#ffffff"
            fgColor="#0a1628"
            qrStyle="dots"
            eyeRadius={8}
            logoImage="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjMWQ0ZWQ4Ii8+PHBhdGggZD0iTTE2IDhMMjQgMjRIOEwxNiA4WiIgZmlsbD0id2hpdGUiLz48L3N2Zz4="
            logoWidth={36}
            logoHeight={36}
            logoPaddingStyle="circle"
          />
        </div>

        <div className="text-center">
          <p className="text-white font-semibold text-sm">Your Stellar address</p>
          <p className="text-white/40 text-xs mt-1 font-mono break-all leading-relaxed px-2">
            {address}
          </p>
        </div>

        <div className="flex gap-2 w-full">
          <button
            onClick={copyAddress}
            className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3"
          >
            {copied ? (
              <>
                <Check size={15} className="text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={15} />
                Copy address
              </>
            )}
          </button>
          <button
            onClick={downloadQR}
            className="btn-secondary flex items-center justify-center gap-2 px-4 py-3"
          >
            <Download size={15} />
          </button>
        </div>
      </div>

      {/* Request specific amount */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <QrCode size={16} className="text-blue-400" />
          <h3 className="text-white text-sm font-semibold">Request a specific amount</h3>
        </div>
        <p className="text-white/40 text-xs">Set an amount and memo to generate a payment request QR.</p>

        <div>
          <label className="block text-white/50 text-xs font-medium mb-2 uppercase tracking-wider">
            Amount (XLM)
          </label>
          <input
            className="input-field"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-white/50 text-xs font-medium mb-2 uppercase tracking-wider">
            Memo
          </label>
          <input
            className="input-field"
            placeholder="e.g. Lecture notes, Shared dinner…"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            maxLength={28}
          />
        </div>

        <p className="text-white/25 text-xs">
          The QR code above updates as you type.
        </p>
      </div>
    </div>
  );
}
