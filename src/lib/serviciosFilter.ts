// Lógica pura de las listas Servicios y Clientes de la consola (probada en
// serviciosFilter.test.ts): pestañas, filtros, búsqueda y CSV.

import { inRange, type DateRange } from '@/lib/calendar';
import { orderCode } from '@/lib/orderCode';
import { matchesAge, type AgeBucket } from '@/lib/unassigned';

export type OrderStatus =
  | 'requested'
  | 'accepted'
  | 'enroute'
  | 'onsite'
  | 'quote'
  | 'working'
  | 'closing'
  | 'completed'
  | 'paid'
  | 'closed'
  | 'expired'
  | 'cancelled';

// ── Servicios ────────────────────────────────────────────────────────────────

export type ServiceTab =
  | 'todos'
  | 'esperando'
  | 'curso'
  | 'completados'
  | 'cancelados'
  | 'disputa'
  | 'emergencias'
  | 'sin_asignar';

export const SERVICE_TABS: { value: ServiceTab; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'esperando', label: 'Esperando técnico' },
  { value: 'curso', label: 'En curso' },
  { value: 'completados', label: 'Completados' },
  { value: 'cancelados', label: 'Cancelados' },
  { value: 'disputa', label: 'En disputa' },
  { value: 'emergencias', label: 'Emergencias' },
  { value: 'sin_asignar', label: 'Sin asignar' },
];

const IN_PROGRESS: OrderStatus[] = [
  'accepted',
  'enroute',
  'onsite',
  'quote',
  'working',
  'closing',
];
const DONE: OrderStatus[] = ['completed', 'paid', 'closed'];

export function serviceTabOf(
  o: {
    status: OrderStatus;
    is_disputed: boolean;
    is_emergency?: boolean;
    needs_manual?: boolean;
  },
  tab: ServiceTab,
): boolean {
  switch (tab) {
    case 'todos':
      return true;
    case 'esperando':
      return o.status === 'requested';
    case 'curso':
      return IN_PROGRESS.includes(o.status);
    case 'completados':
      return DONE.includes(o.status);
    case 'cancelados':
      return o.status === 'cancelled' || o.status === 'expired';
    case 'disputa':
      return o.is_disputed;
    case 'emergencias':
      return !!o.is_emergency;
    case 'sin_asignar':
      return !!o.needs_manual;
  }
}

/** Fila plana que la tabla y los filtros comparten. */
export interface ServiceRow {
  id: string;
  status: OrderStatus;
  is_disputed: boolean;
  /** priority = 'emergency' (reemplaza al antiguo «urgente»). */
  is_emergency: boolean;
  /** Sin técnico y pide asignación manual (solicitud sin técnico o emergencia vencida). */
  needs_manual: boolean;
  /** Solicitud que el cliente dejó para que Tumtto asigne (assignment_mode = 'admin'). */
  is_admin_request?: boolean;
  /** Fecha/horario deseado (scheduled_for / scheduled_until). */
  desiredAt?: string | null;
  desiredUntil?: string | null;
  /** Recargo por horario congelado, en bps. */
  scheduleBps?: number;
  description?: string | null;
  /** Orden de fijado arriba (0 = primero); null = no se fija. Ver emergencyPinRank. */
  pin: number | null;
  categoryId: string;
  categoryName: string;
  clientName: string;
  techName: string | null;
  zone: string;
  totalCents: number | null;
  method: string | null; // card | cash | …
  /** Todos los métodos de la orden (tarifa base en tarjeta + presupuesto en efectivo). */
  methods?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceFilters {
  tab: ServiceTab;
  query: string;
  categoryId: string | null;
  zones: string[];
  method: string | null; // null = cualquiera
  minPesos: number | null;
  maxPesos: number | null;
  emergencyOnly: boolean;
  disputeOnly: boolean;
  range: DateRange;
  /** Solo «Sin asignar»: antigüedad mínima y fecha deseada. */
  age: AgeBucket;
  desiredRange: DateRange;
}

export const EMPTY_SERVICE_FILTERS: ServiceFilters = {
  tab: 'todos',
  query: '',
  categoryId: null,
  zones: [],
  method: null,
  minPesos: null,
  maxPesos: null,
  emergencyOnly: false,
  disputeOnly: false,
  range: null,
  age: 'all',
  desiredRange: null,
};

export const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

/** Filtros del sheet (sin pestaña, búsqueda, categoría ni fechas). */
export function activeSheetFilters(f: ServiceFilters): number {
  return (
    (f.categoryId ? 1 : 0) +
    (f.range ? 1 : 0) +
    f.zones.length +
    (f.method ? 1 : 0) +
    (f.minPesos != null || f.maxPesos != null ? 1 : 0) +
    (f.emergencyOnly ? 1 : 0) +
    (f.disputeOnly ? 1 : 0) +
    (f.age !== 'all' ? 1 : 0) +
    (f.desiredRange ? 1 : 0)
  );
}

export function filterServices(
  rows: ServiceRow[],
  f: ServiceFilters,
  opts: { ignoreTab?: boolean; now?: number } = {},
): ServiceRow[] {
  const now = opts.now ?? Date.now();
  const q = norm(f.query);
  return rows.filter(r => {
    if (!opts.ignoreTab && !serviceTabOf(r, f.tab)) return false;
    if (f.categoryId && r.categoryId !== f.categoryId) return false;
    if (f.zones.length && !f.zones.includes(r.zone)) return false;
    if (f.method && !(r.methods ?? (r.method ? [r.method] : [])).includes(f.method)) return false;
    const pesos = r.totalCents == null ? null : r.totalCents / 100;
    if (f.minPesos != null && (pesos == null || pesos < f.minPesos))
      return false;
    if (f.maxPesos != null && (pesos == null || pesos > f.maxPesos))
      return false;
    if (f.emergencyOnly && !r.is_emergency) return false;
    if (f.disputeOnly && !r.is_disputed) return false;
    if (f.range && !inRange(new Date(r.createdAt), f.range)) return false;
    if (f.age !== 'all' && !matchesAge(r.createdAt, f.age, now)) return false;
    if (
      f.desiredRange &&
      !(r.desiredAt && inRange(new Date(r.desiredAt), f.desiredRange))
    )
      return false;
    if (!q) return true;
    return [
      orderCode(r.id),
      r.id,
      r.clientName,
      r.techName ?? '',
      r.zone,
      r.categoryName,
    ].some(v => norm(v).includes(q));
  });
}

/** Conteo por pestaña (con los demás filtros aplicados). */
export function tabCounts(
  rows: ServiceRow[],
  f: ServiceFilters,
): Record<ServiceTab, number> {
  const base = filterServices(rows, f, { ignoreTab: true });
  const out = {} as Record<ServiceTab, number>;
  for (const t of SERVICE_TABS)
    out[t.value] = base.filter(r => serviceTabOf(r, t.value)).length;
  return out;
}

// ── Clientes ─────────────────────────────────────────────────────────────────

export type ClientTab = 'todos' | 'activos' | 'recurrentes' | 'suspendidos';

export interface ClientRow {
  id: string;
  name: string;
  phone: string;
  zone: string;
  services: number;
  gmvCents: number;
  lastAt: string | null;
  suspended: boolean;
  disputes: number;
}

export type SpendBucket = 'todos' | 'bajo' | 'medio' | 'alto';
export const SPEND_BUCKETS: { value: SpendBucket; label: string }[] = [
  { value: 'todos', label: 'Cualquiera' },
  { value: 'bajo', label: '< $2,000' },
  { value: 'medio', label: '$2,000–10,000' },
  { value: 'alto', label: '> $10,000' },
];
export type ClientSort = 'reciente' | 'gasto' | 'servicios' | 'nombre';

export interface ClientFilters {
  tab: ClientTab;
  query: string;
  zones: string[];
  spend: SpendBucket;
  sort: ClientSort;
}

export const EMPTY_CLIENT_FILTERS: ClientFilters = {
  tab: 'todos',
  query: '',
  zones: [],
  spend: 'todos',
  sort: 'reciente',
};

const DAY = 24 * 3600 * 1000;

export function clientTabOf(c: ClientRow, tab: ClientTab, now = Date.now()) {
  switch (tab) {
    case 'todos':
      return true;
    case 'activos':
      return (
        !c.suspended &&
        c.lastAt != null &&
        now - new Date(c.lastAt).getTime() < 60 * DAY
      );
    case 'recurrentes':
      return c.services >= 2;
    case 'suspendidos':
      return c.suspended;
  }
}

function inSpend(cents: number, b: SpendBucket) {
  const p = cents / 100;
  if (b === 'bajo') return p < 2000;
  if (b === 'medio') return p >= 2000 && p <= 10000;
  if (b === 'alto') return p > 10000;
  return true;
}

export function filterClients(
  rows: ClientRow[],
  f: ClientFilters,
  now = Date.now(),
): ClientRow[] {
  const q = norm(f.query);
  const out = rows.filter(
    c =>
      clientTabOf(c, f.tab, now) &&
      (!f.zones.length || f.zones.includes(c.zone)) &&
      inSpend(c.gmvCents, f.spend) &&
      (!q ||
        norm(c.name).includes(q) ||
        c.phone.replace(/\D/g, '').includes(q.replace(/\D/g, '') || '§')),
  );
  const by: Record<ClientSort, (a: ClientRow, b: ClientRow) => number> = {
    reciente: (a, b) => (b.lastAt ?? '').localeCompare(a.lastAt ?? ''),
    gasto: (a, b) => b.gmvCents - a.gmvCents,
    servicios: (a, b) => b.services - a.services,
    nombre: (a, b) => a.name.localeCompare(b.name, 'es'),
  };
  return [...out].sort(by[f.sort]);
}

export function clientTabCounts(
  rows: ClientRow[],
  now = Date.now(),
): Record<ClientTab, number> {
  return {
    todos: rows.length,
    activos: rows.filter(c => clientTabOf(c, 'activos', now)).length,
    recurrentes: rows.filter(c => clientTabOf(c, 'recurrentes', now)).length,
    suspendidos: rows.filter(c => c.suspended).length,
  };
}

// ── CSV ──────────────────────────────────────────────────────────────────────

export { toCsv } from './csv';
