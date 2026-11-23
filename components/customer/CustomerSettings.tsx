'use client';

import { useState } from 'react';
import { Store, User, Check, Copy, LogOut, ExternalLink, ChevronRight, Wifi, HelpCircle, Info } from 'lucide-react';
import { useProfile }              from '@/lib/profile-context';
import { useWallet }               from '@/lib/wallet-context';
import { shortenAddress, formatXLM } from '@/lib/stellar';

const CATS = ['Food & Drinks','Stationery','Clothing','Electronics','Pharmacy','Printing','Transport','Services','Other'];

export function CustomerSettings() {
  const { profile, setRole, setBusiness } = useProfile();
  const { wallet, disconnect }            = useWallet();
  const biz = profile.business;

  const [name,   setName]   = useState(biz.name);
  const [cat,    setCat]    = useState(biz.category);
  const [photo,  setPhoto]  = useState(biz.photoUrl);
  const [copied, setCopied] = useState(false);

  const copyAddr = async () => {
    await navigator.clipboard.writeText(wallet.publicKey ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activateBusiness = () => {
    setBusiness({ name: name.trim(), category: cat, photoUrl: photo.trim() });
    setRole('business');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>Settings</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Manage your account and preferences</p>
      </div>

      {/* Connected wallet */}
      <div className="card card-p">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <User size={14} style={{ color: 'var(--text-muted)' }} /> Connected Wallet
          </span>
          <span className="badge badge-success">Connected</span>
        </div>

        <p style={{ fontSize: 13, fontFamily: 'monospace', color: 'var(--text-muted)', wordBreak: 'break-all', marginBottom: 12 }}>
          {wallet.publicKey}
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={copyAddr}>
            {copied ? <><Check size={13} style={{ color: 'var(--success)' }} />Copied!</> : <><Copy size={13} />Copy address</>}
          </button>
          <a
            href={`https://stellar.expert/explorer/testnet/account/${wallet.publicKey}`}
            target="_blank" rel="noopener noreferrer"
            className="btn-secondary"
            style={{ textDecoration: 'none' }}
          >
            Explorer <ExternalLink size={12} />
          </a>
        </div>

        <div style={{ background: 'var(--bg-muted)', borderRadius: 8, padding: '10px 12px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Balance</span>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{formatXLM(wallet.balance ?? '0')} XLM</span>
        </div>
      </div>

      {/* Settings rows */}
      {[
        { icon: Wifi, label: 'Network', val: 'Stellar Testnet' },
        { icon: HelpCircle, label: 'Help & Support', val: 'Get help', href: '#' },
        { icon: Info, label: 'About CampusPay', val: 'v1.0.0' },
      ].map(({ icon: Icon, label, val }) => (
        <div key={label} className="card card-p">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{val}</span>
              <ChevronRight size={14} style={{ color: 'var(--text-faint)' }} />
            </div>
          </div>
        </div>
      ))}

      {/* Switch to Business */}
      <div className="card card-p" style={{ background: 'rgba(26,61,43,0.04)', borderColor: 'rgba(26,61,43,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Store size={15} style={{ color: 'var(--green)' }} />
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>Switch to Business mode</h3>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
          Accept payments via QR code and NFC tap. Set up your store profile.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input className="input-field" placeholder="Business name" value={name} onChange={e => setName(e.target.value)} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)} style={{
                padding: '5px 11px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                background: cat === c ? 'var(--green)' : 'var(--bg-muted)',
                border: `1px solid ${cat === c ? 'var(--green)' : 'var(--border)'}`,
                color: cat === c ? 'white' : 'var(--text-muted)',
              }}>
                {c}
              </button>
            ))}
          </div>
          <input className="input-field" placeholder="Logo URL (optional)" value={photo} onChange={e => setPhoto(e.target.value)} />
          <button className="btn-primary" style={{ width: '100%' }} onClick={activateBusiness} disabled={!name.trim()}>
            <Store size={15} />Activate Business mode
          </button>
        </div>
      </div>

      {/* Disconnect */}
      <button
        onClick={disconnect}
        style={{
          width: '100%', padding: '12px', borderRadius: 10, background: 'transparent',
          border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', fontSize: 14,
          fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        <LogOut size={15} />Disconnect wallet
      </button>
    </div>
  );
}
