'use client';

import { useState, useRef } from 'react';
import { Copy, Download, Check, Share2 } from 'lucide-react';
import { useWallet } from '@/lib/wallet-context';
import QRCode       from 'react-qrcode-logo';

export function ReceivePayment() {
  const { wallet }   = useWallet();
  const [amount, setAmount] = useState('');
  const [memo, setMemo]     = useState('');
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const address = wallet.publicKey || '';

  const buildQRData = () => {
    let uri = `web+stellar:pay?destination=${address}`;
    if (amount) uri += `&amount=${amount}`;
    if (memo)   uri += `&memo=${encodeURIComponent(memo)}`;
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

  const shareLink = async () => {
    const url = `web+stellar:pay?destination=${address}${amount ? `&amount=${amount}` : ''}`;
    if (navigator.share) {
      await navigator.share({ title: 'Pay me on CampusPay', url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* QR card */}
      <div className="card card-p" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Receive Payment</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Share your wallet address or show QR code
          </p>
        </div>

        <div ref={qrRef} className="qr-container">
          <QRCode
            value={buildQRData()}
            size={180}
            bgColor="#ffffff"
            fgColor="#1A3D2B"
            qrStyle="dots"
            eyeRadius={6}
          />
        </div>

        {/* Address pill */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            background: 'var(--bg-muted)', borderRadius: 10, padding: '10px 14px',
          }}
        >
          <span style={{ flex: 1, fontSize: 13, fontFamily: 'monospace', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {address}
          </span>
          <button onClick={copyAddress} style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
            {copied
              ? <Check size={15} style={{ color: 'var(--success)' }} />
              : <Copy size={15} style={{ color: 'var(--text-muted)' }} />
            }
          </button>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
          <button className="btn-primary" onClick={shareLink}>
            <Share2 size={15} />Share Payment Link
          </button>
          <button className="btn-secondary" onClick={downloadQR}>
            <Download size={15} />Save QR
          </button>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-faint)', textAlign: 'center' }}>
          Anyone can send you XLM using this QR code or link.
        </p>
      </div>

      {/* Request specific amount */}
      <div className="card card-p">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Request a specific amount</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          Set an amount and note — the QR updates automatically.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Amount (XLM)
            </label>
            <input
              className="input-field"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Note
            </label>
            <input
              className="input-field"
              placeholder="e.g. Lecture notes, Shared dinner…"
              value={memo}
              onChange={e => setMemo(e.target.value)}
              maxLength={28}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
