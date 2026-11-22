'use client';

import { useState } from 'react';
import { Store, User, Check, Copy, LogOut, ExternalLink, ChevronRight } from 'lucide-react';
import { useProfile } from '@/lib/profile-context';
import { useWallet }  from '@/lib/wallet-context';
import { shortenAddress, formatXLM } from '@/lib/stellar';

export function CustomerSettings() {
  const { profile, setRole, setBusiness } = useProfile();
  const { wallet, disconnect }            = useWallet();
  const biz                               = profile.business;

  const [name,  setName]  = useState(biz.name);
  const [cat,   setCat]   = useState(biz.category);
  const [photo, setPhoto] = useState(biz.photoUrl);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const saveAndSwitch = () => {
    setBusiness({ name: name.trim(), category: cat, photoUrl: photo.trim() });
    setRole('business');
  };

  const copyAddr = async () => {
    await navigator.clipboard.writeText(wallet.publicKey ?? '');
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const CATEGORIES = ['Food & Drinks','Stationery','Clothing','Electronics','Pharmacy','Printing','Transport','Services','Other'];

  return (
    <div className="space-y-5">
      {/* Wallet info */}
      <div className="card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <User size={15} className="text-blue-400" /> Your wallet
        </h3>
        <div>
          <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Stellar address</p>
          <p className="text-xs font-mono break-all leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{wallet.publicKey}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={copyAddr} className="btn-ghost flex-1 flex items-center justify-center gap-2 py-2.5 text-sm">
            {copied ? <><Check size={13} className="text-emerald-400" /><span className="text-emerald-400">Copied!</span></> : <><Copy size={13} />Copy address</>}
          </button>
          <a href={`https://stellar.expert/explorer/testnet/account/${wallet.publicKey}`} target="_blank" rel="noopener noreferrer"
            className="btn-ghost flex items-center gap-1.5 px-4 py-2.5 text-sm">
            Explorer <ExternalLink size={12} />
          </a>
        </div>
        <div className="flex justify-between items-center pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Balance</span>
          <span className="text-sm font-semibold text-white">{formatXLM(wallet.balance ?? '0')} XLM</span>
        </div>
      </div>

      {/* Switch to business */}
      <div className="card p-5 space-y-4" style={{ borderColor: 'rgba(37,99,235,0.2)', background: 'rgba(37,99,235,0.05)' }}>
        <div className="flex items-center gap-2">
          <Store size={15} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Switch to Business mode</h3>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Set up your store to accept payments via QR code or NFC tap. You can switch back anytime.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Business name</label>
            <input className="field" placeholder="e.g. Mama Nkechi's Kitchen" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCat(c)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: cat === c ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.055)',
                    border:     `1px solid ${cat === c ? 'rgba(37,99,235,0.45)' : 'rgba(255,255,255,0.09)'}`,
                    color:      cat === c ? '#60a5fa' : 'rgba(255,255,255,0.5)',
                  }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Logo URL <span className="normal-case font-normal" style={{ color: 'rgba(255,255,255,0.22)' }}>(optional)</span></label>
            <input className="field" placeholder="https://…" value={photo} onChange={e => setPhoto(e.target.value)} />
          </div>
        </div>

        <button
          onClick={saveAndSwitch}
          disabled={!name.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2.5 py-3.5"
        >
          <Store size={15} />
          Activate Business mode
          <ChevronRight size={15} className="ml-auto" />
        </button>
        {!name.trim() && <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>Enter a business name to continue</p>}
      </div>

      {/* Testnet info */}
      <div className="card p-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <p className="text-xs font-semibold text-white/50 mb-2">Network</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px #10b981' }} />
            <span className="text-sm text-white">Stellar Testnet</span>
          </div>
          <a href="https://laboratory.stellar.org/#account-creator?network=test" target="_blank" rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
            Fund account <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* Disconnect */}
      <button onClick={disconnect}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm transition-colors"
        style={{ color: 'rgba(255,255,255,0.3)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.7)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
        <LogOut size={14} /> Disconnect wallet
      </button>
    </div>
  );
}
