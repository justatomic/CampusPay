'use client';

import { useEffect, useCallback }                     from 'react';
import { ExternalLink, Wallet, ArrowRight, CheckCircle, Zap, Shield, Smartphone } from 'lucide-react';
import { useWallet }                                   from '@/lib/wallet-context';
import { Spinner }                                     from './ui/Spinner';

/* Google One-Tap / sign-in button — loaded from Google's CDN */
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: object) => void;
          renderButton: (el: HTMLElement, cfg: object) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

export function ConnectWallet() {
  const { connect, connectWithGoogle, wallet, varialAvailable, isMobile } = useWallet();

  /* Load Google Identity Services and render the sign-in button */
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (res: { credential: string }) => {
          connectWithGoogle(res.credential);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      const btn = document.getElementById('google-signin-btn');
      if (btn) {
        window.google?.accounts.id.renderButton(btn, {
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          width: btn.offsetWidth || 380,
          text: 'continue_with',
        });
      }
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [connectWithGoogle]);

  const isGoogleConfigured = !!GOOGLE_CLIENT_ID;

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg)',
      }}
    >
      {/* ── Desktop: side-by-side ─────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, minHeight: '100dvh' }}>

        {/* Left green panel — desktop only */}
        <div
          className="hidden lg:flex"
          style={{
            width: 480, flexShrink: 0,
            background: 'var(--green)',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '48px 44px',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LogoMark size={36} />
            <span style={{ color: 'white', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>CampusPay</span>
          </div>

          {/* Hero copy */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(124,199,68,0.2)', border: '1px solid rgba(124,199,68,0.35)', borderRadius: 20, padding: '4px 12px', marginBottom: 28 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7CC744', display: 'inline-block' }} />
              <span style={{ color: '#7CC744', fontSize: 12, fontWeight: 700 }}>Stellar Testnet</span>
            </div>
            <h1 style={{ color: 'white', fontSize: 44, fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: 16 }}>
              Pay, Split, and<br />Manage Your<br />Campus Expenses
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15 }}>
              Fast. Secure. Powered by Stellar.
            </p>
            <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 13 }}>
              {['Send and receive payments instantly', 'Split bills with friends', 'Pay with CampusPay Tap'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                  <CheckCircle size={16} style={{ color: '#7CC744', flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>© 2026 CampusPay · Built on Stellar Network</p>
        </div>

        {/* Right panel — auth forms */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            /* Fixed padding — this was the bug. Use safe insets + explicit padding */
            padding: 'max(env(safe-area-inset-top, 0px), 32px) 20px max(env(safe-area-inset-bottom, 0px), 32px)',
            overflowY: 'auto',
          }}
        >
          {/* Mobile logo — only shown on small screens */}
          <div
            className="lg:hidden"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}
          >
            <LogoMark size={56} />
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 14, color: 'var(--text)' }}>
              CampusPay
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
              Student payments on Stellar
            </p>
          </div>

          {/* Auth card */}
          <div
            className="card card-p"
            style={{ width: '100%', maxWidth: 420 }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
              Get started
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              Sign in with Google or connect your Varial wallet to continue.
            </p>

            {/* Error */}
            {wallet.error && (
              <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: 'var(--danger-bg)', border: '1px solid #FECACA' }}>
                <p style={{ fontSize: 13, color: '#DC2626' }}>{wallet.error}</p>
              </div>
            )}

            {/* ── Google Sign-In ────────────────────────────── */}
            {isGoogleConfigured ? (
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                  Recommended — no extension needed
                </p>

                {wallet.loading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, background: 'var(--bg-muted)', marginBottom: 16 }}>
                    <Spinner size={16} color="var(--green)" />
                    <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Setting up your wallet…</span>
                  </div>
                )}

                {/* Google renders its own button here */}
                <div
                  id="google-signin-btn"
                  style={{
                    width: '100%',
                    minHeight: 44,
                    borderRadius: 10,
                    overflow: 'hidden',
                    marginBottom: 8,
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderRadius: 10, background: 'var(--lime-bg)', border: '1px solid var(--lime-border)' }}>
                  <Smartphone size={14} style={{ color: 'var(--green)', flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: '#3A6B10', lineHeight: 1.4 }}>
                    Works on mobile — no extension required. A Stellar wallet is created from your Google account.
                  </p>
                </div>
              </div>
            ) : (
              /* Show placeholder when GOOGLE_CLIENT_ID not set */
              <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-muted)', border: '1px dashed var(--border-mid)', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Add <code style={{ fontSize: 11, background: 'var(--border)', borderRadius: 4, padding: '1px 5px' }}>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to <code style={{ fontSize: 11, background: 'var(--border)', borderRadius: 4, padding: '1px 5px' }}>.env.local</code> to enable Google sign-in.
                </p>
              </div>
            )}

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-faint)', fontWeight: 500 }}>or use browser extension</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {/* ── Varial (Freighter) ─────────────────────────── */}
            {!varialAvailable ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {!isMobile && (
                  <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <p style={{ fontSize: 13, color: '#DC2626', lineHeight: 1.5 }}>
                      Varial extension not detected. Install it in Chrome to use this method.
                    </p>
                  </div>
                )}
                {isMobile && (
                  <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Varial is a browser extension — not available on mobile. Use Google sign-in above instead.
                    </p>
                  </div>
                )}
                {!isMobile && (
                  <a href="https://chromewebstore.google.com/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk" target="_blank" rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ textDecoration: 'none', justifyContent: 'center' }}
                  >
                    Install Varial Wallet <ExternalLink size={13} />
                  </a>
                )}
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={wallet.loading}
                className="btn-primary"
                style={{ width: '100%' }}
              >
                {wallet.loading
                  ? <><Spinner size={15} color="white" />Connecting…</>
                  : <><Wallet size={15} />Connect with Varial<ArrowRight size={14} style={{ marginLeft: 'auto' }} /></>
                }
              </button>
            )}

            {/* Explore demo */}
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

          {/* Feature pills */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 20, width: '100%', maxWidth: 420 }}>
            {[
              { icon: Zap,    label: 'Instant',        desc: 'Near-instant transfers' },
              { icon: Shield, label: 'Non-custodial',  desc: 'You hold your keys'    },
              { icon: Wallet, label: 'Low fees',       desc: '~0.00001 XLM'          },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="card" style={{ padding: '14px 10px', textAlign: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
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
    </div>
  );
}

function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: size * 0.28,
        background: 'var(--green)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none">
        <path d="M12 3L20 7V17L12 21L4 17V7L12 3Z" fill="white" fillOpacity="0.9" />
        <path d="M12 7L16 9V15L12 17L8 15V9L12 7Z" fill="#7CC744" />
      </svg>
    </div>
  );
}
