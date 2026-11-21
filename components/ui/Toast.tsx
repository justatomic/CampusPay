'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <div
      className="slide-up flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl"
      style={{
        background: toast.type === 'success'
          ? 'rgba(16, 185, 129, 0.12)'
          : 'rgba(239, 68, 68, 0.12)',
        borderColor: toast.type === 'success'
          ? 'rgba(16, 185, 129, 0.25)'
          : 'rgba(239, 68, 68, 0.25)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {toast.type === 'success' ? (
        <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
      ) : (
        <XCircle size={18} className="text-red-400 flex-shrink-0" />
      )}
      <span className="text-sm text-white/90 flex-1">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-white/40 hover:text-white/70 transition-colors ml-1"
      >
        <X size={14} />
      </button>
    </div>
  );
}
