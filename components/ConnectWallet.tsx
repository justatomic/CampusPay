'use client';

import { ExternalLink, Wallet, Zap, Shield, ArrowRight } from 'lucide-react';
import { useWallet } from '@/lib/wallet-context';
import { Spinner } from './ui/Spinner';

export function ConnectWallet() {
  const { connect, wallet, freighterAvailable } = useWallet();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 70%)' }}
    >
      {/* Logo mark */}
      <div className="mb-10 flex flex-col items-center">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 pulse-glow"
          style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}
        >
          <Zap size={36} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white">CampusPay</h1>
        <p className="text-white/40 mt-2 text-base">Student payments on the Stellar network</p>
      </div>

      {/* Main card */}
      <div className="glass-card p-8 w-full max-w-sm">
        <h2 className="text-xl font-semibold text-white mb-1">Connect your wallet</h2>
        <p className="text-white/40 text-sm mb-6 leading-relaxed">
          Link your Freighter wallet to send, receive, and split XLM with other students.
        </p>

        {!freighterAvailable ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <span className="text-red-400 text-xs mt-0.5 leading-relaxed">
                Freighter wallet is not installed. Install it to continue.
              </span>
            </div>
            <a
              href="https://freighter.app"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Install Freighter
              <ExternalLink size={15} />
            </a>
          </div>
        ) : (
          <button
            onClick={connect}
            disabled={wallet.loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {wallet.loading ? (
              <>
                <Spinner size={16} color="white" />
                Connecting…
              </>
            ) : (
              <>
                <Wallet size={16} />
                Connect Freighter
                <ArrowRight size={15} className="ml-auto" />
              </>
            )}
          </button>
        )}

        {wallet.error && (
          <p className="mt-3 text-xs text-red-400 text-center">{wallet.error}</p>
        )}
      </div>

      {/* Features */}
      <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-sm">
        {[
          { icon: Zap, label: 'Instant', desc: 'Near-instant transfers' },
          { icon: Shield, label: 'Secure', desc: 'Non-custodial wallet' },
          { icon: Wallet, label: 'Free', desc: 'Minimal fees on Stellar' },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex flex-col items-center text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <Icon size={18} className="text-blue-400 mb-1.5" />
            <span className="text-white text-xs font-semibold">{label}</span>
            <span className="text-white/35 text-xs mt-0.5">{desc}</span>
          </div>
        ))}
      </div>

      <p className="mt-8 text-white/20 text-xs">Running on Stellar Testnet</p>
    </div>
  );
}
