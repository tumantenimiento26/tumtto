'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import {
  getAllPayments,
  getAllRequests,
  getDisputes,
  getPendingKyc,
  getProfile,
  getTickets,
  useTick,
} from './store';

/**
 * Notificaciones de la consola admin. ponytail: el backend tiene
 * `public.notifications` (por usuario, pensada para push de la app), pero nada
 * genera filas para admins; aquí se DERIVAN del snapshot (KYC pendientes,
 * disputas abiertas, tickets, pagos fallidos, órdenes atoradas) y solo el
 * estado leído/eliminado/silenciado vive en este navegador. Cuando el backend
 * inserte notificaciones de admin, leerlas de esa tabla en `derive()`.
 */
export type NotifType =
  | 'kyc'
  | 'disputas'
  | 'tickets'
  | 'retiros'
  | 'servicios'
  | 'pagos'
  | 'sistema';

export const NOTIF_TYPES: { type: NotifType; label: string }[] = [
  { type: 'kyc', label: 'KYC' },
  { type: 'disputas', label: 'Disputas' },
  { type: 'tickets', label: 'Tickets' },
  { type: 'retiros', label: 'Retiros' },
  { type: 'servicios', label: 'Servicios' },
  { type: 'pagos', label: 'Pagos' },
  { type: 'sistema', label: 'Sistema' },
];

export interface AdminNotification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  /** ISO. */
  ts: string;
  /** Ruta a la que lleva al hacer clic. */
  href: string;
}

const name = (id: string | null | undefined) =>
  (id && getProfile(id)?.full_name) || 'Usuario';

/** Minutos que una solicitud puede esperar técnico antes de avisar. */
const STALE_REQUEST_MIN = 15;

/** Deriva las notificaciones del snapshot actual (más nuevas primero). */
export function derive(now = Date.now()): AdminNotification[] {
  const out: AdminNotification[] = [];
  for (const t of getPendingKyc())
    out.push({
      id: `kyc-${t.id}-${t.kyc_status}`,
      type: 'kyc',
      title: `${name(t.id)} envió documentos KYC`,
      body: 'Revisa identidad, antecedentes y datos de cobro.',
      ts: t.updated_at ?? t.created_at,
      href: `/tecnicos/${t.id}`,
    });
  for (const d of getDisputes())
    if (d.status === 'open' || d.status === 'in_review')
      out.push({
        id: `disp-${d.id}`,
        type: 'disputas',
        title: 'Nueva disputa',
        body: d.reason,
        ts: d.created_at,
        href: `/servicios/${d.service_order_id}`,
      });
  for (const t of getTickets())
    if (t.status !== 'resolved')
      out.push({
        id: `tk-${t.id}`,
        type: 'tickets',
        title: t.subject,
        body: `${name(t.requester_id)} · prioridad ${t.priority}`,
        ts: t.created_at,
        href: '/soporte',
      });
  for (const p of getAllPayments())
    if (p.status === 'failed')
      out.push({
        id: `pay-${p.id}`,
        type: 'pagos',
        title: 'Pago rechazado',
        body: 'El cobro de una orden falló; revisa el método del cliente.',
        ts: p.updated_at ?? p.created_at,
        href: `/servicios/${p.service_order_id}`,
      });
  for (const o of getAllRequests())
    if (
      o.status === 'requested' &&
      now - new Date(o.created_at).getTime() > STALE_REQUEST_MIN * 60_000
    )
      out.push({
        id: `svc-${o.id}`,
        type: 'servicios',
        title: 'Solicitud sin técnico',
        body: `Lleva más de ${STALE_REQUEST_MIN} min esperando asignación.`,
        ts: o.created_at,
        href: `/servicios/${o.id}`,
      });
  return out.sort((a, b) => b.ts.localeCompare(a.ts));
}

interface NotifState {
  read: string[];
  deleted: string[];
  muted: NotifType[];
  markRead: (ids: string[]) => void;
  markUnread: (ids: string[]) => void;
  remove: (ids: string[]) => void;
  restore: (ids: string[]) => void;
  setMuted: (types: NotifType[]) => void;
}

export const useNotifState = create<NotifState>()(
  persist(
    set => ({
      read: [],
      deleted: [],
      muted: [],
      markRead: ids => set(s => ({ read: [...new Set([...s.read, ...ids])] })),
      markUnread: ids =>
        set(s => ({ read: s.read.filter(r => !ids.includes(r)) })),
      remove: ids =>
        set(s => ({ deleted: [...new Set([...s.deleted, ...ids])] })),
      restore: ids =>
        set(s => ({ deleted: s.deleted.filter(d => !ids.includes(d)) })),
      setMuted: muted => set({ muted }),
    }),
    {
      name: 'tumtto-admin-notifs',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export type NotificationView = AdminNotification & { read: boolean };

/** Notificaciones visibles (sin eliminadas ni tipos silenciados) + no leídas. */
export function useNotifications(): {
  items: NotificationView[];
  unread: number;
} {
  useTick();
  const { read, deleted, muted } = useNotifState();
  const items = derive()
    .filter(n => !deleted.includes(n.id) && !muted.includes(n.type))
    .map(n => ({ ...n, read: read.includes(n.id) }));
  return { items, unread: items.filter(n => !n.read).length };
}

/** "hace 6 min" / "hace 2 h" / fecha corta. */
export function timeAgo(iso: string, now = Date.now()): string {
  const m = Math.round((now - new Date(iso).getTime()) / 60_000);
  if (m < 1) return 'ahora';
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `hace ${h} h`;
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
  });
}
