'use client';
import { create } from 'zustand';
import { CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from './motion';

/**
 * Toast mínimo del console: store zustand + lista fija con AnimatePresence.
 * Uso: toast.success('Técnico aprobado') / toast.error('No se pudo eliminar').
 */
interface ToastItem {
  id: number;
  message: string;
  variant: 'success' | 'error';
}

interface ToastState {
  toasts: ToastItem[];
  push: (message: string, variant: ToastItem['variant']) => void;
  dismiss: (id: number) => void;
}

let toastSeq = 0;

const useToasts = create<ToastState>(set => ({
  toasts: [],
  push: (message, variant) => {
    const id = ++toastSeq;
    set(s => ({ toasts: [...s.toasts, { id, message, variant }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 2500);
  },
  dismiss: id => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));

export const toast = {
  success: (message: string) => useToasts.getState().push(message, 'success'),
  error: (message: string) => useToasts.getState().push(message, 'error'),
};

export function Toasts() {
  const { toasts, dismiss } = useToasts();
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-80 flex-col gap-2">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.button
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.25, ease: [0.2, 0.7, 0.3, 1] }}
            onClick={() => dismiss(t.id)}
            className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-line bg-white px-4 py-3 text-left shadow-hover"
          >
            {t.variant === 'success'
              ? <CheckCircle2 size={16} className="shrink-0 text-success" />
              : <XCircle size={16} className="shrink-0 text-error" />}
            <span className="text-[13px] font-medium text-navy">{t.message}</span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
