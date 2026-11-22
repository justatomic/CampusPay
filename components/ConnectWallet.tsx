'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, ArrowRight, Zap, Shield, Layers } from 'lucide-react';
import { useWallet } from '@/lib/wallet-context';
import { detectWallet, walletName } from '@/lib/stellar';

export function ConnectWallet() {
  const { connect, wallet } = useWallet();
  const [detected, setDetected] = useState<ReturnType<typeof detectWallet>>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Give wallet extensions 500ms to inject
    const t = setTimeout(() => {
      setDetected(detectWallet());
      setChecked(true);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  const label = walletName(detected);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-12"
      style={{ background: 'radial-gradient(ellipse 100% 55% at 50% 0%, rgba(37,99,235,0.14) 0%, transparent 68%), var(--navy)' }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 animate-glow"
          style={{ background: 'linear-gradient(145deg, #1d4ed8 0%, #2563eb 60%, #3b82f6 100%)' }}
        >
          <Zap size={34} strokeWidth={2.5} className="text-white" />
        </div>
        <h1 className="text-[38px] font-bold tracking-tight text-white leading-none">CampusPay</h1>
        <p className="text-sm mt-2.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
          Student payments on the Stellar network
        </p>
      </div>

      {/* Card */}
      <div className="card w-full max-w-sm p-7">
        <h2 className="text-[22px] font-semibold text-white mb-1.5 tracking-tight">Connect your wallet</h2>
        <p className="text-sm leading-relaxed mb-7" style={{ color: 'rgba(255,255,255,0.42)' }}>
          Link your Stellar wallet to send, receive, and split XLM with other students.
        </p>

        {!checked ? (
          <div className="flex items-center justify-center py-4 gap-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Detecting wallet…</span>
          </div>
        ) : !detected ? (
          <div className="space-y-3">
            <div
              className="text-sm rounded-xl px-4 py-3 leading-relaxed"
              style={{ background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.22)', color: 'rgba(255,180,180,0.9)' }}
            >
              No Stellar wallet found. Install one of these:
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { name: 'Lobstr / Varial', url: 'https://lobstr.co/wallet' },
                { name: 'Freighter', url: 'https://freighter.app' },
              ].map(w => (
                <a
                  key={w.name}
                  href={w.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost flex items-center justify-center gap-1.5 px-3 py-3 text-sm"
                >
                  {w.name} <ExternalLink size={12} />
                </a>
              ))}
            </div>
          </div>
        ) : (
          <button
            onClick={connect}
            disabled={wallet.loading}
            className="btn-primary w-full flex items-center justify-center gap-2.5 px-5 py-4"
          >
            {wallet.loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Connecting…</span>
              </>
            ) : (
              <>
                <Zap size={16} />
                <span>Connect {label}</span>
                <ArrowRight size={15} className="ml-auto" />
              </>
            )}
          </button>
        )}

        {wallet.error && (
          <p className="mt-3 text-xs text-center" style={{ color: '#fca5a5' }}>
            {wallet.error}
          </p>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-sm mt-6">
        {[
          { icon: Zap,    label: 'Instant',  sub: 'Near-instant transfers' },
          { icon: Shield, label: 'Secure',   sub: 'Your keys, your funds' },
          { icon: Layers, label: 'Low fees', sub: 'Fractions of a cent' },
        ].map(({ icon: Icon, label, sub }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 py-4 px-2 rounded-2xl text-center"
            style={{ background: 'rgba(255,255,255,0.045)' }}
          >
            <Icon size={18} className="text-blue-400" />
            <span className="text-white text-xs font-semibold">{label}</span>
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.32)' }}>{sub}</span>
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>Stellar Testnet</p>
    </div>
  );
}
