'use client';

import { ExternalLink, Wallet, ArrowRight, CheckCircle, Zap, Shield } from 'lucide-react';
import { useWallet } from '@/lib/wallet-context';
import { Spinner }   from './ui/Spinner';

export function ConnectWallet() {
  const { connect, wallet, varialAvailable } = useWallet();

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row"
      style={{ background: 'var(--bg)' }}
    >
      {/* Left panel — branding (desktop only) */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 lg:w-[480px] xl:w-[520px]"
        style={{ background: 'var(--green)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L20 7V17L12 21L4 17V7L12 3Z" fill="white" fillOpacity="0.9"/>
              <path d="M12 7L16 9V15L12 17L8 15V9L12 7Z" fill="var(--lime)"/>
            </svg>
          </div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>CampusPay</span>
        </div>

        <div>
          <div className="testnet-pill mb-8" style={{ background: 'rgba(124,199,68,0.2)', borderColor: 'rgba(124,199,68,0.4)', color: 'var(--lime)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--lime)' }} />
            Stellar Testnet
          </div>
          <h1 style={{ color: 'white', fontSize: 42, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
            Pay, Split, and<br />Manage Your<br />Campus Expenses
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 16, fontSize: 16 }}>
            Fast. Secure. Powered by Stellar.
          </p>

          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              'Send and receive payments instantly',
              'Split bills with friends',
              'Pay with CampusPay Tap',
            ].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                <CheckCircle size={16} style={{ color: 'var(--lime)', flexShrink: 0 }} />
                {f}
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
          © 2026 CampusPay · Built on Stellar Network
        </p>
      </div>

      {/* Right panel — connection */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        {/* Mobile logo */}
        <div className="lg:hidden flex flex-col items-center mb-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'var(--green)' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L20 7V17L12 21L4 17V7L12 3Z" fill="white" fillOpacity="0.9"/>
              <path d="M12 7L16 9V15L12 17L8 15V9L12 7Z" fill="var(--lime)"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', textAlign: 'center' }}>
            CampusPay
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            Student payments on Stellar
          </p>
        </div>

        {/* Connection card */}
        <div className="card card-p w-full" style={{ maxWidth: 420 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Connect your wallet
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
            Link your Varial wallet to send, receive and split XLM with other students.
          </p>

          {!varialAvailable ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div
                className="card card-p"
                style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}
              >
                <p style={{ fontSize: 13, color: '#DC2626', lineHeight: 1.5 }}>
                  Varial wallet is not installed. Install it from the Chrome Web Store to continue.
                </p>
              </div>
              <a
                href="https://varialwallet.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full"
                style={{ width: '100%', textDecoration: 'none' }}
              >
                Install Varial Wallet
                <ExternalLink size={14} />
              </a>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={wallet.loading}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              {wallet.loading ? (
                <><Spinner size={16} color="white" />Connecting…</>
              ) : (
                <><Wallet size={16} />Connect with Varial<ArrowRight size={15} style={{ marginLeft: 'auto' }} /></>
              )}
            </button>
          )}

          {wallet.error && (
            <p style={{ marginTop: 12, fontSize: 13, color: '#DC2626', textAlign: 'center' }}>
              {wallet.error}
            </p>
          )}

          <button
            style={{
              width: '100%', marginTop: 12, padding: '11px', borderRadius: 10,
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer',
            }}
          >
            Explore demo
          </button>
        </div>

        {/* Features */}
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 20, width: '100%', maxWidth: 420 }}
        >
          {[
            { icon: Zap, label: 'Instant', desc: 'Near-instant transfers' },
            { icon: Shield, label: 'Non-custodial', desc: 'You hold your keys' },
            { icon: Wallet, label: 'Low fees', desc: '~0.00001 XLM' },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="card"
              style={{ padding: '14px 10px', textAlign: 'center' }}
            >
              <div
                style={{
                  width: 32, height: 32, borderRadius: 8, background: 'var(--bg-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 8px',
                }}
              >
                <Icon size={15} style={{ color: 'var(--green)' }} />
              </div>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{label}</p>
              <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>{desc}</p>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 20, fontSize: 12, color: 'var(--text-faint)' }}>
          Running on Stellar Testnet · Not real funds
        </p>
      </div>
    </div>
  );
}
