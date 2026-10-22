'use client';
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';
import { MOCK } from '@/lib/mock';
import {
  ASSIGNMENT_NOTIF_KINDS,
  isAssignmentNotifKind,
  parseAssignments,
  type AssignmentNotifKind,
  type AssignmentRow,
} from '@/lib/assignments';
import { getAllRequests, getCategories, getProfile } from './store';

/**
 * «Asignaciones»: solicitudes donde el cliente pidió que Tumtto asigne al
 * técnico. Real: RPC admin_list_assignments('all') (trae zona y espera) y las
 * notificaciones propias de las dos clases nuevas. Maqueta: se derivan del
 * mundo demo, así «Asignar técnico» se refleja en la página.
 */
export interface ServerNotif {
  id: string;
  kind: AssignmentNotifKind;
  title: string;
  body: string | null;
  entity_id: string | null;
  read_at: string | null;
  created_at: string;
}

interface AssignmentsState {
  rows: AssignmentRow[];
  notifs: ServerNotif[];
  loaded: boolean;
  failed: boolean;
}

export const useAssignments = create<AssignmentsState>(() => ({
  rows: [],
  notifs: [],
  loaded: false,
  failed: false,
}));

export const getServerNotifs = () => useAssignments.getState().notifs;

/** Pendientes de asignar (insignia del menú). */
export const usePendingAssignments = () =>
  useAssignments(
    s => s.rows.filter(r => !r.technician && r.status === 'requested').length,
  );

function mockRows(): AssignmentRow[] {
  const cats = getCategories();
  const out: AssignmentRow[] = [];
  for (const o of getAllRequests()) {
    if (o.assignment_mode !== 'admin') continue;
    const cat = cats.find(c => c.id === o.category_id);
    const tech = o.technician_id ? getProfile(o.technician_id) : null;
    const created = new Date(o.created_at).getTime();
    const frozen = o.assigned_by_admin_at
      ? Math.floor(
          (new Date(o.assigned_by_admin_at).getTime() - created) / 60_000,
        )
      : Math.floor((Date.now() - created) / 60_000);
    out.push({
      id: o.id,
      folio: o.folio,
      created_at: o.created_at,
      category: {
        id: o.category_id,
        slug: cat?.slug ?? o.category_id,
        name: cat?.name ?? 'Servicio',
      },
      client: {
        id: o.client_id,
        name: getProfile(o.client_id)?.full_name ?? 'Cliente',
      },
      zone: o.municipality
        ? {
            id: `z-${o.municipality}`,
            slug: o.municipality.toLowerCase(),
            name: o.municipality,
          }
        : null,
      scheduled_for: o.scheduled_for,
      scheduled_until: o.scheduled_until,
      status: o.status,
      technician: tech
        ? { id: tech.id, name: tech.full_name ?? 'Técnico' }
        : null,
      assigned_by_admin_at: o.assigned_by_admin_at,
      assignment_ack_at: o.assignment_ack_at,
      waiting_minutes: Math.max(0, frozen),
    });
  }
  return out;
}

function mockNotifs(): ServerNotif[] {
  const m = (min: number) => new Date(Date.now() - min * 60_000).toISOString();
  return [
    {
      id: 'mock-an-1',
      kind: 'admin_request_created',
      title: 'Nueva solicitud para asignar',
      body: 'Solicitud SVC-9107 · Plomería · Guadalajara',
      entity_id: 'SVC-9107',
      read_at: null,
      created_at: m(12),
    },
    {
      id: 'mock-an-2',
      kind: 'assignment_acknowledged',
      title: 'Asignación confirmada',
      body: 'Agustín Gómez confirmó el servicio SVC-9202.',
      entity_id: 'SVC-9202',
      read_at: null,
      created_at: m(160),
    },
  ];
}

let rowsInflight: Promise<void> | null = null;

export function loadAssignments(force = false): Promise<void> {
  if (MOCK) {
    useAssignments.setState({ rows: mockRows(), loaded: true, failed: false });
    return Promise.resolve();
  }
  if (rowsInflight) return rowsInflight;
  if (!force && useAssignments.getState().loaded) return Promise.resolve();
  rowsInflight = (async () => {
    const { data, error } = await supabase.rpc('admin_list_assignments', {
      p_status: 'all',
    });
    if (error) {
      console.warn('[data] admin_list_assignments no disponible', error);
      useAssignments.setState({ failed: true, loaded: true });
      return;
    }
    useAssignments.setState({
      rows: parseAssignments(data),
      loaded: true,
      failed: false,
    });
  })().finally(() => {
    rowsInflight = null;
  });
  return rowsInflight;
}

export async function loadServerNotifs(): Promise<void> {
  if (MOCK) {
    if (!useAssignments.getState().notifs.length)
      useAssignments.setState({ notifs: mockNotifs() });
    return;
  }
  const { data, error } = await supabase
    .from('notifications')
    .select('id, kind, title, body, entity_id, read_at, created_at')
    .in('kind', [...ASSIGNMENT_NOTIF_KINDS])
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) {
    console.warn('[data] notifications no disponibles', error);
    return;
  }
  useAssignments.setState({
    notifs: (data ?? []).flatMap(n =>
      isAssignmentNotifKind(n.kind) ? [{ ...n, kind: n.kind }] : [],
    ),
  });
}

/**
 * Realtime: órdenes (nuevas solicitudes, asignaciones, «Enterado») y
 * notificaciones nuevas. Con `onNew` avisa de cada notificación entrante
 * (toast). RLS limita `notifications` a las filas del propio admin.
 */
export function subscribeAssignmentsLive(
  onNew?: (n: ServerNotif) => void,
): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const reload = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      void loadAssignments(true);
    }, 1200);
  };
  const channel = supabase
    .channel('assignments-live')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'service_orders' },
      reload,
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications' },
      payload => {
        const r = payload.new as Partial<ServerNotif>;
        if (!r.id || !r.kind || !isAssignmentNotifKind(r.kind)) return;
        const n: ServerNotif = {
          id: r.id,
          kind: r.kind,
          title: r.title ?? '',
          body: r.body ?? null,
          entity_id: r.entity_id ?? null,
          read_at: r.read_at ?? null,
          created_at: r.created_at ?? new Date().toISOString(),
        };
        useAssignments.setState(s => ({
          notifs: s.notifs.some(x => x.id === n.id)
            ? s.notifs
            : [n, ...s.notifs],
        }));
        reload();
        onNew?.(n);
      },
    )
    .subscribe();
  return () => {
    if (timer) clearTimeout(timer);
    void supabase.removeChannel(channel);
  };
}
