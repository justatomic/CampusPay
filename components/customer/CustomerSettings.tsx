'use client';

import { useState } from 'react';
import { Store, User, Check, Copy, LogOut, ExternalLink, ChevronRight } from 'lucide-react';
import { useProfile } from '@/lib/profile-context';
import { useWallet }  from '@/lib/wallet-context';
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
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const activateBusiness = () => {
    setBusiness({ name: name.trim(), category: cat, photoUrl: photo.trim() });
    setRole('business');
  };

  return (
    <div className="space-y-5">

      {/* Wallet card */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="text-white text-sm font-semibold flex items-center gap-2">
          <User size={15} className="text-blue-400" /> Your wallet
        </h3>
        <div>
          <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Stellar address</p>
          <p className="text-xs font-mono break-all leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{wallet.publicKey}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={copyAddr} className="btn-secondary flex-1 flex items-center justify-center gap-2" style={{ padding: '10px' }}>
            {copied
              ? <><Check size={13} className="text-emerald-400" /><span className="text-emerald-400 text-sm">Copied!</span></>
              : <><Copy size={13} /><span className="text-sm">Copy address</span></>
            }
          </button>
          <a href={`https://stellar.expert/explorer/testnet/account/${wallet.publicKey}`}
            target="_blank" rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-1.5 text-sm" style={{ padding: '10px 16px' }}>
            Explorer <ExternalLink size={12} />
          </a>
        </div>
        <div className="flex justify-between items-center pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Balance</span>
          <span className="text-sm font-semibold text-white">{formatXLM(wallet.balance ?? '0')} XLM</span>
        </div>
      </div>

      {/* Switch to business */}
      <div className="glass-card p-5 space-y-4" style={{ background: 'rgba(37,99,235,0.05)', borderColor: 'rgba(37,99,235,0.2)' }}>
        <div className="flex items-center gap-2">
          <Store size={15} className="text-blue-400" />
          <h3 className="text-white text-sm font-semibold">Switch to Business mode</h3>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Accept payments via QR code and NFC tap. Set up your store and generate your payment link. You can switch back anytime.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Business name</label>
            <input className="input-field" placeholder="e.g. Mama Nkechi's Kitchen" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Category</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {CATS.map(c => (
                <button key={c} onClick={() => setCat(c)}
                  style={{
                    padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                    background: cat === c ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.055)',
                    border: `1px solid ${cat === c ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    color: cat === c ? '#60a5fa' : 'rgba(255,255,255,0.5)',
                  }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Logo URL <span className="normal-case font-normal" style={{ color: 'rgba(255,255,255,0.22)' }}>(optional)</span>
            </label>
            <input className="input-field" placeholder="https://…" value={photo} onChange={e => setPhoto(e.target.value)} />
          </div>
        </div>

        <button
          onClick={activateBusiness}
          disabled={!name.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2.5"
          style={{ padding: '13px', opacity: !name.trim() ? 0.4 : 1 }}
        >
          <Store size={15} />
          Activate Business mode
          <ChevronRight size={15} style={{ marginLeft: 'auto' }} />
        </button>
        {!name.trim() && (
          <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>Enter a business name to continue</p>
        )}
      </div>

      {/* Network */}
      <div className="glass-card p-4">
        <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Network</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px #10b981' }} />
            <span className="text-sm text-white">Stellar Testnet</span>
          </div>
          <a href="https://laboratory.stellar.org/#account-creator?network=test" target="_blank" rel="noopener noreferrer"
            className="text-xs text-blue-400 flex items-center gap-1 hover:text-blue-300 transition-colors">
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
