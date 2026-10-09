'use client';

import { UserIcon } from '@/components/profile-icon';
import { useCallback, useEffect, useRef } from 'react';
import {
  Droplet,
  Flame,
  Key,
  Snowflake,
  WashingMachine,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { snackbar, type Tone } from '@/components/ds';
import type { OrderStatus } from '@/lib/serviciosFilter';
import { MX_TZ } from '@/lib/dates';

// Piezas compartidas por Servicios y Clientes (consola-b).

export const STATUS: Record<OrderStatus, { label: string; tone: Tone }> = {
  requested: { label: 'Esperando técnico', tone: 'warning' },
  accepted: { label: 'Aceptado', tone: 'info' },
  enroute: { label: 'En camino', tone: 'info' },
  onsite: { label: 'En sitio', tone: 'info' },
  quote: { label: 'Cotización', tone: 'warning' },
  working: { label: 'En servicio', tone: 'info' },
  closing: { label: 'Por cerrar', tone: 'info' },
  completed: { label: 'Completado', tone: 'success' },
  paid: { label: 'Pagado', tone: 'success' },
  closed: { label: 'Cerrado', tone: 'neutral' },
  expired: { label: 'Expirado', tone: 'neutral' },
  cancelled: { label: 'Cancelado', tone: 'danger' },
};

export const METHOD_LABEL: Record<string, string> = {
  card: 'Tarjeta',
  cash: 'Efectivo',
  oxxo: 'OXXO',
  wallet: 'Cartera',
};

export const ZONES = [
  'Guadalajara',
  'Zapopan',
  'Tlaquepaque',
  'Tonalá',
  'Tlajomulco',
  'El Salto',
];

/** Centavos → "$1,500" (sin decimales) o con decimales. */
export const money = (cents: number | null | undefined, decimals = false) =>
  cents == null
    ? '—'
    : new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: decimals ? 2 : 0,
        maximumFractionDigits: decimals ? 2 : 0,
      }).format(cents / 100);

export const initials = (name: string | null | undefined) =>
  (name ?? '?')
    .replace(/\(.*?\)/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() || '?';

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return '—';
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'ahora';
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  if (d < 30) return `hace ${d} d`;
  return new Date(iso).toLocaleDateString('es-MX', {
    timeZone: MX_TZ,
    day: '2-digit',
    month: 'short',
  });
}

export const clock = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-MX', {
    timeZone: MX_TZ,
    hour: '2-digit',
    minute: '2-digit',
  });

export function Avatar({
  name,
  size = 36,
  userId,
}: {
  name: string | null | undefined;
  size?: number;
  /** Con `userId` muestra el ícono de perfil en lugar de las iniciales. */
  userId?: string | null;
}) {
  if (userId) return <UserIcon userId={userId} size={size} />;
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-info-soft font-display font-bold text-primary"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

export { downloadCsv } from '@/lib/csv';

/**
 * Acción destructiva con "Deshacer": la escritura real se hace al vencer el
 * snackbar (5 s); si el admin deshace, nunca se escribe. Así el Deshacer es
 * honesto para cambios que el backend no puede revertir (cancelar servicios).
 * Si la pantalla se desmonta antes, se ejecuta de inmediato para no perderla.
 */
export function useDeferredCommit() {
  const pending = useRef<Map<number, () => void>>(new Map());
  const seq = useRef(0);

  useEffect(() => {
    const map = pending.current;
    return () => {
      for (const run of map.values()) run();
      map.clear();
    };
  }, []);

  return useCallback(
    (text: string, commit: () => void | Promise<unknown>, onUndo?: () => void) => {
      const id = ++seq.current;
      let done = false;
      const run = () => {
        if (done) return;
        done = true;
        pending.current.delete(id);
        void commit();
      };
      pending.current.set(id, run);
      const timer = setTimeout(run, 5000);
      snackbar.show(text, {
        duration: 5000,
        undo: () => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          pending.current.delete(id);
          onUndo?.();
        },
      });
    },
    [],
  );
}

const CAT_ICON: Record<string, LucideIcon> = {
  plumbing: Droplet,
  electrical: Zap,
  gas: Flame,
  ac: Snowflake,
  appliances: WashingMachine,
  locks: Key,
};

/** Ícono de la categoría por slug (o por id `cat-<slug>` del demo). */
export function categoryIconFor(slugOrId: string | null | undefined): LucideIcon {
  const slug = (slugOrId ?? '').replace(/^cat-/, '');
  return CAT_ICON[slug] ?? Wrench;
}

/** Tile de ícono de categoría (8px de radio, tint azul). */
export function CategoryTile({
  slug,
  size = 34,
}: {
  slug: string | null | undefined;
  size?: number;
}) {
  const Icon = categoryIconFor(slug);
  return (
    <span
      className="grid shrink-0 place-items-center rounded-[9px] bg-info-soft text-primary"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Icon size={Math.round(size * 0.5)} />
    </span>
  );
}
