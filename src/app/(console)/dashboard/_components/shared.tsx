'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  Droplet,
  Flame,
  KeyRound,
  Snowflake,
  WashingMachine,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { Tone } from '@/components/ds';

/** Estado de la orden → etiqueta + tono de Badge (misma semántica que la consola). */
export const STATUS_BADGE: Record<string, { label: string; tone: Tone }> = {
  requested: { label: 'Solicitado', tone: 'neutral' },
  accepted: { label: 'Aceptado', tone: 'info' },
  enroute: { label: 'En camino', tone: 'warning' },
  onsite: { label: 'En sitio', tone: 'warning' },
  quote: { label: 'Cotización', tone: 'warning' },
  working: { label: 'En ejecución', tone: 'info' },
  closing: { label: 'Por cobrar', tone: 'info' },
  completed: { label: 'Completado', tone: 'success' },
  paid: { label: 'Pagado', tone: 'success' },
  closed: { label: 'Cerrado', tone: 'success' },
  expired: { label: 'Expirado', tone: 'danger' },
  cancelled: { label: 'Cancelado', tone: 'danger' },
};

/** Ícono por slug de categoría (catálogo del seed). */
const CAT_ICON: Record<string, LucideIcon> = {
  plumbing: Droplet,
  electrical: Zap,
  gas: Flame,
  ac: Snowflake,
  appliances: WashingMachine,
  locks: KeyRound,
};
export const catIcon = (slug?: string | null): LucideIcon =>
  (slug && CAT_ICON[slug]) || Wrench;

/** Colores de la banda del dashboard: siempre oscura (como el sidebar). */
export const BAND = {
  blue: { tile: 'rgba(10,107,207,0.22)', ink: '#5AB0FF' },
  green: { tile: 'rgba(95,211,155,0.16)', ink: '#5FD39B' },
  cyan: { tile: 'rgba(24,193,255,0.16)', ink: '#18C1FF' },
  amber: { tile: 'rgba(245,185,74,0.18)', ink: '#F5B94A' },
  up: { bg: 'rgba(95,211,155,0.16)', fg: '#5FD39B' },
  down: { bg: 'rgba(248,113,113,0.16)', fg: '#F87171' },
} as const;

/** Número animado de 0 al valor en `ms` (sin animación con reduce-motion). */
export function useCountUp(value: number, ms = 900): number {
  const reduced = useReducedMotion();
  const [n, setN] = useState(reduced ? value : 0);
  const from = useRef(0);
  useEffect(() => {
    if (reduced) {
      setN(value);
      return;
    }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      const eased = 1 - (1 - p) ** 3;
      setN(a + (value - a) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, ms, reduced]);
  return n;
}

export const money = (pesos: number) =>
  `$${Math.round(pesos).toLocaleString('es-MX')}`;

/** Encabezado de tarjeta: título + link opcional. */
export function CardHead({
  title,
  kicker,
  link,
  onLink,
  right,
}: {
  title?: string;
  kicker?: string;
  link?: string;
  onLink?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      {kicker ? (
        <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">
          {kicker}
        </span>
      ) : (
        <h2 className="font-display text-[16px] font-bold text-navy">
          {title}
        </h2>
      )}
      {right}
      {link && (
        <button
          type="button"
          onClick={onLink}
          className="text-[13px] font-semibold text-primary hover:underline"
        >
          {link}
        </button>
      )}
    </div>
  );
}
