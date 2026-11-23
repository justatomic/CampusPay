'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export interface ToastMessage { id: string; type: 'success' | 'error'; message: string; }
interface ToastProps { toast: ToastMessage; onDismiss: (id: string) => void; }

export function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isSuccess = toast.type === 'success';

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px', borderRadius: 12,
        background: 'var(--bg-card)', border: `1px solid ${isSuccess ? '#BBF7D0' : '#FECACA'}`,
        boxShadow: 'var(--shadow-lg)',
        animation: 'fade-in 0.2s ease',
      }}
    >
      {isSuccess
        ? <CheckCircle size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
        : <XCircle size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />
      }
      <p style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', flexShrink: 0 }}>
        <X size={14} />
      </button>
    </div>
  );
}
