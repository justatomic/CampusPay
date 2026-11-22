'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile, UserRole, BusinessProfile } from './types';

const STORAGE_KEY = 'campuspay_profile';

const defaultProfile: UserProfile = {
  role: 'customer',
  business: { name: '', category: '', photoUrl: '' },
};

interface ProfileCtx {
  profile:         UserProfile;
  setRole:         (r: UserRole) => void;
  setBusiness:     (b: Partial<BusinessProfile>) => void;
  isBusinessMode:  boolean;
}

const Ctx = createContext<ProfileCtx | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProfile({ ...defaultProfile, ...JSON.parse(raw) });
    } catch {}
  }, []);

  const save = useCallback((next: UserProfile) => {
    setProfile(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const setRole     = useCallback((role: UserRole) => save({ ...profile, role }), [profile, save]);
  const setBusiness = useCallback((b: Partial<BusinessProfile>) =>
    save({ ...profile, business: { ...profile.business, ...b } }), [profile, save]);

  return (
    <Ctx.Provider value={{ profile, setRole, setBusiness, isBusinessMode: profile.role === 'business' }}>
      {children}
    </Ctx.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProfile must be inside ProfileProvider');
  return ctx;
}
