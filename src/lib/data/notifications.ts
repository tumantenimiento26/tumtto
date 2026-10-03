'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { needsManualAssignment } from '@/lib/emergency';
import { ageLabel, inUnassignedInbox, isAdminRequest } from '@/lib/unassigned';
import {
  getAllPayments,
  getAllRequests,
  getDisputes,
  getPendingKyc,
  getProfile,
  getTickets,
  getUnassignedAlertMinutes,
  isTicketOpen,
  ticketRequester,
  useTick,
} from './store';
import { getContactMessages, loadContactMessages, useContact } from './contactStore';
import { CONTACT_TYPE_LABEL } from '@/lib/contactAdmin';
import { useEffect } from 'react';

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
  | 'contacto'
  | 'retiros'
  | 'emergencias'
  | 'servicios'
  | 'pagos'
  | 'sistema';

export const NOTIF_TYPES: { type: NotifType; label: string }[] = [
  { type: 'kyc', label: 'KYC' },
  { type: 'disputas', label: 'Disputas' },
  { type: 'tickets', label: 'Tickets' },
  { type: 'contacto', label: 'Contacto' },
  { type: 'retiros', label: 'Retiros' },
  { type: 'emergencias', label: 'Emergencias' },
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
    if (isTicketOpen(t))
      out.push({
        id: `tk-${t.id}`,
        type: 'tickets',
        title: t.subject,
        body: `${name(ticketRequester(t))} · ${t.status === 'open' ? 'sin responder' : 'en seguimiento'}`,
        ts: t.created_at,
        href: '/soporte',
      });
  // Mensajes nuevos del formulario del landing (kind `contact_message`).
  for (const c of getContactMessages())
    if (c.status === 'new')
      out.push({
        id: `contact-${c.id}`,
        type: 'contacto',
        title: `Nuevo contacto (${CONTACT_TYPE_LABEL[c.contact_type]}): ${c.name}`,
        body: c.message.length > 90 ? `${c.message.slice(0, 89)}…` : c.message,
        ts: c.created_at,
        href: '/soporte?tab=contacto',
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
    if (needsManualAssignment(o))
      out.push({
        id: `emg-${o.id}`,
        type: 'emergencias',
        title: 'Emergencia sin técnico — asignar',
        body: `Nadie aceptó a tiempo; sigue activa para asignación manual (${name(o.client_id)}).`,
        ts: o.updated_at ?? o.created_at,
        href: `/servicios/${o.id}?asignar=1`,
      });
  // Solicitudes sin técnico (Tumtto asigna) que superan unassigned_alert_minutes.
  const alertMin = getUnassignedAlertMinutes();
  for (const o of getAllRequests())
    if (
      inUnassignedInbox(o) &&
      isAdminRequest(o) &&
      now - new Date(o.created_at).getTime() > alertMin * 60_000
    )
      out.push({
        id: `unas-${o.id}`,
        type: 'servicios',
        title: 'Solicitud sin técnico — asignar o rechazar',
        body: `${name(o.client_id)} espera desde hace ${ageLabel(o.created_at, now)} (umbral ${alertMin} min).`,
        ts: o.created_at,
        href: `/servicios/${o.id}?asignar=1`,
      });
  for (const o of getAllRequests())
    if (
      o.status === 'requested' &&
      o.priority !== 'emergency' &&
      !inUnassignedInbox(o) &&
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
  useContact(s => s.messages);
  useEffect(() => {
    void loadContactMessages();
  }, []);
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
