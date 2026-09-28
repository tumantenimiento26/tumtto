'use client';
import { useState } from 'react';
import { create } from 'zustand';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  WifiOff,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

/**
 * Toasts de la consola (handoff web): pila arriba a la derecha bajo el header
 * (top 76px), máximo 4, barra de progreso (4.2 s; error 6 s) que se pausa con
 * el cursor encima, cerrar ✕, acción opcional y "Cerrar todas" con 2 o más.
 *
 *   toast.success('Técnico aprobado')                     // API previa, igual
 *   toast.error('No se pudo guardar', 'Revisa tu conexión')
 *   toast.show({ kind: 'info', title, sub, action: { label, onClick } })
 *   snackbar.show('Filtros limpiados', { undo: () => restore() })
 */
export type ToastKind =
  'success' | 'error' | 'warning' | 'info' | 'offline' | 'local';

export interface ToastInput {
  kind: ToastKind;
  title: string;
  sub?: string;
  action?: { label: string; onClick: () => void };
  /** ms; por defecto 4200 (error 6000). */
  duration?: number;
}
interface ToastItem extends ToastInput {
  id: number;
}

interface ToastState {
  toasts: ToastItem[];
  push: (t: ToastInput) => void;
  dismiss: (id: number) => void;
  clear: () => void;
}

let toastSeq = 0;
const MAX = 4;

const useToasts = create<ToastState>(set => ({
  toasts: [],
  push: t =>
    set(s => ({ toasts: [...s.toasts, { ...t, id: ++toastSeq }].slice(-MAX) })),
  dismiss: id => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

const push = (t: ToastInput) => useToasts.getState().push(t);

export const toast = {
  show: push,
  success: (title: string, sub?: string) =>
    push({ kind: 'success', title, sub }),
  error: (title: string, sub?: string, action?: ToastInput['action']) =>
    push({ kind: 'error', title, sub, action }),
  warning: (title: string, sub?: string) =>
    push({ kind: 'warning', title, sub }),
  info: (title: string, sub?: string, action?: ToastInput['action']) =>
    push({ kind: 'info', title, sub, action }),
  offline: (title = 'Sin conexión', sub?: string) =>
    push({ kind: 'offline', title, sub }),
  /**
   * Para dominios que todavía no tienen tabla en el backend (notas, tickets,
   * mensajes): la escritura vive sólo en esta pestaña y se pierde al recargar.
   * Un toast verde aquí haría creer al admin que el dato quedó guardado.
   */
  local: (title: string) =>
    push({
      kind: 'local',
      title,
      sub: 'Solo en esta sesión: aún no se guarda en el servidor.',
    }),
  dismissAll: () => useToasts.getState().clear(),
};

const KIND: Record<ToastKind, { icon: LucideIcon; tile: string; bar: string }> =
  {
    success: {
      icon: CheckCircle2,
      tile: 'bg-success-soft text-success',
      bar: 'bg-success',
    },
    error: { icon: XCircle, tile: 'bg-error-soft text-error', bar: 'bg-error' },
    warning: {
      icon: AlertTriangle,
      tile: 'bg-warning-soft text-warning-ink',
      bar: 'bg-warning',
    },
    info: { icon: Info, tile: 'bg-info-soft text-primary', bar: 'bg-primary' },
    offline: { icon: WifiOff, tile: 'bg-chip text-muted', bar: 'bg-muted' },
    local: {
      icon: AlertTriangle,
      tile: 'bg-warning-soft text-warning-ink',
      bar: 'bg-warning',
    },
  };

function ToastCard({ t }: { t: ToastItem }) {
  const dismiss = useToasts(s => s.dismiss);
  const [paused, setPaused] = useState(false);
  const k = KIND[t.kind];
  const duration = t.duration ?? (t.kind === 'error' ? 6000 : 4200);
  return (
    <div
      role={t.kind === 'error' ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="anim-toast pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-box border border-line bg-card p-3.5 pr-3 shadow-float"
    >
      <span
        className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg ${k.tile}`}
      >
        <k.icon size={16} />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="font-display text-[14px] font-bold text-navy">
          {t.title}
        </p>
        {t.sub && <p className="mt-0.5 text-[12.5px] text-muted">{t.sub}</p>}
        {t.action && (
          <button
            type="button"
            onClick={() => {
              t.action!.onClick();
              dismiss(t.id);
            }}
            className="mt-2 rounded-lg border border-line-strong px-2.5 py-1 text-[12.5px] font-semibold text-navy hover:bg-panel"
          >
            {t.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => dismiss(t.id)}
        aria-label="Cerrar aviso"
        className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-md text-faint hover:bg-panel hover:text-navy"
      >
        <X size={15} />
      </button>
      {/* Barra que se vacía; al terminar la animación se cierra el toast. */}
      <span
        aria-hidden
        onAnimationEnd={() => dismiss(t.id)}
        className={`absolute bottom-0 left-0 h-[3px] opacity-70 ${k.bar}`}
        style={{
          animation: `tbar ${duration}ms linear forwards`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
      />
    </div>
  );
}

export function Toasts() {
  const { toasts, clear } = useToasts();
  return (
    <>
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 top-[76px] z-[100] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2.5"
      >
        {toasts.length >= 2 && (
          <button
            type="button"
            onClick={clear}
            className="pointer-events-auto self-end rounded-full border border-line bg-card px-3 py-1 text-[12px] font-semibold text-muted shadow-float hover:text-navy"
          >
            Cerrar todas
          </button>
        )}
        {toasts.map(t => (
          <ToastCard key={t.id} t={t} />
        ))}
      </div>
      <SnackbarHost />
    </>
  );
}

/* ── Snackbar: abajo al centro, navy, 5 s, con "Deshacer" ── */
interface SnackState {
  current: {
    id: number;
    text: string;
    undo?: () => void;
    duration: number;
  } | null;
  show: (text: string, opts?: { undo?: () => void; duration?: number }) => void;
  hide: () => void;
}
let snackSeq = 0;
const useSnack = create<SnackState>(set => ({
  current: null,
  show: (text, opts) =>
    set({
      current: {
        id: ++snackSeq,
        text,
        undo: opts?.undo,
        duration: opts?.duration ?? 5000,
      },
    }),
  hide: () => set({ current: null }),
}));

export const snackbar = {
  show: (text: string, opts?: { undo?: () => void; duration?: number }) =>
    useSnack.getState().show(text, opts),
  hide: () => useSnack.getState().hide(),
};

function SnackbarHost() {
  const { current, hide } = useSnack();
  if (!current) return null;
  return (
    <div
      key={current.id}
      role="status"
      className="anim-snack fixed bottom-6 left-1/2 z-[100] flex min-w-[320px] max-w-[calc(100vw-2rem)] items-center gap-4 overflow-hidden rounded-box bg-tooltip px-4 py-3 text-white shadow-float"
      style={{ transform: 'translateX(-50%)' }}
    >
      <span className="flex-1 text-[13.5px] font-medium">{current.text}</span>
      {current.undo && (
        <button
          type="button"
          onClick={() => {
            current.undo!();
            hide();
          }}
          className="font-display text-[13.5px] font-bold text-cyan hover:underline"
        >
          Deshacer
        </button>
      )}
      <button
        type="button"
        onClick={hide}
        aria-label="Cerrar"
        className="text-white/60 hover:text-white"
      >
        <X size={15} />
      </button>
      <span
        aria-hidden
        onAnimationEnd={hide}
        className="absolute bottom-0 left-0 h-[2px] bg-cyan/70"
        style={{ animation: `tbar ${current.duration}ms linear forwards` }}
      />
    </div>
  );
}
