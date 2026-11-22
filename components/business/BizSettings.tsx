'use client';

import { useState } from 'react';
import { Check, Store, Tag, Image, Users, Zap } from 'lucide-react';
import { useProfile } from '@/lib/profile-context';

const CATEGORIES = ['Food & Drinks','Stationery','Clothing','Electronics','Pharmacy','Printing','Transport','Services','Other'];

export function BizSettings() {
  const { profile, setBusiness, setRole } = useProfile();
  const biz = profile.business;
  const [name, setName]       = useState(biz.name);
  const [cat, setCat]         = useState(biz.category);
  const [photo, setPhoto]     = useState(biz.photoUrl);
  const [saved, setSaved]     = useState(false);

  const save = () => {
    setBusiness({ name: name.trim(), category: cat, photoUrl: photo.trim() });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white">Business settings</h2>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Customise your storefront and CampusPay profile.</p>
      </div>

      <div className="card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Store size={15} className="text-blue-400" /> Business profile</h3>

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
                  background:   cat === c ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.055)',
                  border:       `1px solid ${cat === c ? 'rgba(37,99,235,0.45)' : 'rgba(255,255,255,0.09)'}`,
                  color:        cat === c ? '#60a5fa' : 'rgba(255,255,255,0.5)',
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Logo / photo URL <span className="normal-case font-normal" style={{ color: 'rgba(255,255,255,0.22)' }}>(optional)</span></label>
          <input className="field" placeholder="https://…" value={photo} onChange={e => setPhoto(e.target.value)} />
          {photo && (
            <div className="mt-2 flex items-center gap-3">
              <img src={photo} alt="" className="w-12 h-12 rounded-xl object-cover" onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3'; }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Preview</span>
            </div>
          )}
        </div>

        <button onClick={save} className="btn-primary flex items-center justify-center gap-2 px-6 py-3">
          {saved ? <><Check size={15} /> Saved!</> : 'Save profile'}
        </button>
      </div>

      {/* Switch to customer */}
      <div className="card p-5 space-y-3" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Users size={15} className="text-blue-400" /> Switch mode</h3>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Switch to Student mode to send payments, split bills, and view your personal history.</p>
        <button onClick={() => setRole('customer')} className="btn-ghost flex items-center gap-2 px-4 py-3 text-sm">
          <Zap size={14} /> Switch to Student mode
        </button>
      </div>
    </div>
  );
}
