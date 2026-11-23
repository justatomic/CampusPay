'use client';

import { useState } from 'react';
import { Check, Store, Users, Zap } from 'lucide-react';
import { useProfile } from '@/lib/profile-context';

const CATS = ['Food & Drinks','Stationery','Clothing','Electronics','Pharmacy','Printing','Transport','Services','Other'];

export function BizSettings() {
  const { profile, setBusiness, setRole } = useProfile();
  const biz = profile.business;
  const [name,  setName]  = useState(biz.name);
  const [cat,   setCat]   = useState(biz.category);
  const [photo, setPhoto] = useState(biz.photoUrl);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setBusiness({ name: name.trim(), category: cat, photoUrl: photo.trim() });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 className="text-white font-bold" style={{ fontSize: '20px' }}>Business settings</h2>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Update your storefront profile shown to customers.</p>
      </div>

      <div className="glass-card p-5" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 className="text-white text-sm font-semibold flex items-center gap-2"><Store size={15} className="text-blue-400" /> Business profile</h3>

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
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: cat === c ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.055)',
                  border:     `1px solid ${cat === c ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  color:      cat === c ? '#60a5fa' : 'rgba(255,255,255,0.5)',
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
          {photo && (
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={photo} alt="" style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }}
                onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3'; }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Preview</span>
            </div>
          )}
        </div>

        <button onClick={save} className="btn-primary flex items-center justify-center gap-2" style={{ padding: '12px 24px', width: 'fit-content' }}>
          {saved ? <><Check size={15} /> Saved!</> : 'Save profile'}
        </button>
      </div>

      {/* Switch to customer */}
      <div className="glass-card p-5" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 className="text-white text-sm font-semibold flex items-center gap-2"><Users size={15} className="text-blue-400" /> Switch mode</h3>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Switch to Student mode to send payments, split bills, and view personal history. You can switch back anytime.
        </p>
        <button onClick={() => setRole('customer')} className="btn-secondary flex items-center gap-2" style={{ padding: '10px 20px', width: 'fit-content' }}>
          <Zap size={14} /> Switch to Student mode
        </button>
      </div>
    </div>
  );
}
