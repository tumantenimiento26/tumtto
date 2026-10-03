'use client';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Database, Json } from '@/types/supabase';
import type { NullableCols } from '@/types/rpc';
import { mxDay } from '@/lib/dates';
import { registerFolios } from '@/lib/orderCode';
import { distanceM, wkbPoint } from '@/lib/geo';
import { ALERT_MINUTES_DEFAULT, ALERT_MINUTES_KEY, canReassignStatus, rejectNote } from '@/lib/unassigned';
import type { AdminRole } from '@/lib/rbac';
import { MOCK } from '@/lib/mock';
import { isImageMime, type QuoteAttachment } from '@/lib/quoteAttachments';
import {
  applyCashResolution,
  buildPaymentSummary,
  cashByTechnician,
  cashReviews,
  groupByOrder,
  kpiWindow,
  parsePaymentSummary,
  paymentsReport,
  quotePayment,
  ticketByCategory,
  validateResolution,
  type CashReviewRow,
  type CashTechRow,
  type MethodFilter,
  type PaymentSummary,
  type PaymentsReportFilters,
  type PaymentsReportRow,
  type ReviewOutcome,
} from '@/lib/payments';
import { rejectionNotes } from '@/lib/clientDocs';
import { typeChangeText, typeCompanyValid, type TechType } from '@/lib/techType';
import { ratingNoteRequired, ratingReasonLabel, type RatingReason } from '@/lib/ratingModeration';
import { isValidPlate, normalizePlate, vehicleEventText } from '@/lib/vehicles';
import {
  countCatalogTechs,
  normalizeToolName,
  resolveTechTools,
  summarizeCustomTools,
  toolEventText,
  type CustomToolSummary,
} from '@/lib/tools';
import { withHistory } from '@/lib/demo/history';
import {
  byTechnician,
  inventoryEventText,
  isInventoryEvent,
  normalizeSerial,
  outstanding,
  openAssignment,
  type ByTechnicianRow,
  type CompanyTool,
  type InventoryCondition,
  type OutstandingRow,
  type RetireReason,
  type ToolAssignment,
} from '@/lib/inventory';
import {
  EMERGENCY_DEFAULTS,
  EMERGENCY_KEYS,
  buildHistory,
  parseHistory,
  type EmergencyConfig,
  type EmergencyHistory,
  type SurchargeMode,
} from '@/lib/emergency';
import {
  emptyWorld,
  demoWorld,
  CLIENT_ID,
  TECH_USER_ID,
  type World,
  type OrderStatus,
  type ServiceOrder,
  type ServiceCategory,
  type ServiceStatusEvent,
  type DemoPayout,
} from '@/lib/demo/world';

/**
 * Live data store for the admin console. Same selector/mutator API the pages
 * used against the demo world, but the world underneath is a snapshot loaded
 * from Supabase (admin RLS) and mutations write through to the backend.
 *
 * ponytail: snapshot paginado + recarga completa tras cada escritura. Soporte
 * (support_tickets/ticket_messages) y la bitácora admin (admin_events) viajan
 * en el mismo snapshot; el chat de una orden (messages) se pide al abrirlo.
 */
type Tables = Database['public']['Tables'];
type Row<K extends keyof Tables> = Tables[K]['Row'];
type Fn = Database['public']['Functions'];
type PlatformSetting = Row<'platform_settings'>;
type OrderInsert = Tables['service_orders']['Insert'];

interface DataState {
  tick: number;
  status: 'idle' | 'loading' | 'ready' | 'error';
  bump: () => void;
}

export const useData = create<DataState>(set => ({
  tick: 0,
  status: 'idle',
  bump: () => set(s => ({ tick: s.tick + 1 })),
}));

/** Subscribe to mutations: read `useTick()` in any component that shows world data. */
export const useTick = () => useData(s => s.tick);
/**
 * True sólo cuando el snapshot cargó de verdad. Antes incluía 'error', así que
 * un fallo de red pintaba la consola entera como una plataforma vacía y sana
 * ($0 de GMV, 0 servicios) en vez de decir que no pudo cargar.
 */
export const useWorldReady = () => useData(s => s.status === 'ready');
/** El snapshot falló: la página debe ofrecer reintentar, no tablas vacías. */
export const useWorldFailed = () => useData(s => s.status === 'error');

let world: World = emptyWorld();
let settings: PlatformSetting[] = [];
let tickets: Ticket[] = [];
let ticketMessages: TicketMessage[] = [];
let adminEvents: AdminEvent[] = [];
let lastFetched = 0;

// ── Soporte y bitácora ───────────────────────────────────────────────────────
export type TicketStatus = Database['public']['Enums']['ticket_status'];
export type Ticket = Row<'support_tickets'>;
export type TicketMessage = Row<'ticket_messages'>;
export type OrderMessage = Row<'messages'>;
export type AdminEvent = Row<'admin_events'>;
/** Entrada de bitácora lista para pintar (nota de admin o evento del sistema). */
export interface Note {
  id: string;
  entity_id: string;
  author: string;
  event_type: string;
  /** Texto libre de la nota (payload.note), si lo hay. */
  note: string | null;
  /** Lo que se muestra: la nota o la etiqueta del evento. */
  text: string;
  created_at: string;
}
const EVENT_LABEL: Record<string, string> = {
  note: 'Nota',
  user_suspended: 'Usuario suspendido',
  user_restored: 'Usuario reactivado',
  kyc_approved: 'KYC aprobado',
  kyc_declined: 'KYC rechazado',
  kyc_in_review: 'KYC en revisión',
  dispute_resolved: 'Disputa resuelta',
  order_reassigned: 'Servicio reasignado',
  order_assigned: 'Servicio asignado',
  request_rejected: 'Solicitud rechazada',
  order_refunded: 'Reembolso emitido',
  setting_updated: 'Ajuste actualizado',
  zone_upserted: 'Zona guardada',
  technician_type_changed: 'Tipo de técnico cambiado',
  vehicle_added: 'Vehículo agregado',
  vehicle_updated: 'Vehículo actualizado',
  vehicle_removed: 'Vehículo eliminado',
  tool_added: 'Herramienta agregada',
  tool_updated: 'Herramienta actualizada',
  tool_removed: 'Herramienta eliminada',
  rating_hidden: 'Calificación oculta',
  rating_restored: 'Calificación restaurada',
};
/** Tablas secundarias del snapshot: si fallan (RLS, migración pendiente) no tiran la consola. */
const optional = <T,>(p: Promise<T[]>, what: string) =>
  p.catch((e: unknown) => {
    console.warn(`[data] ${what} no disponible`, e);
    return [] as T[];
  });

// Error surface: la consola registra toast.error aqui (admin-shell) — el store
// no importa componentes para poder correr en tests de node.
let notifyError: (msg: string) => void = msg => console.error('[data]', msg);
export function setErrorNotifier(fn: (msg: string) => void) {
  notifyError = fn;
}

const w = () => world;
const bump = () => useData.getState().bump();

/** Tamaño de página de PostgREST (`max-rows`): una sola consulta nunca trae más. */
export const PAGE_SIZE = 1000;

/**
 * Pagina con `.range()` hasta recibir menos de PAGE_SIZE filas. Sin esto el
 * snapshot quedaba truncado en 1,000 filas por tabla sin avisar. El tipo de
 * fila se infiere del builder tipado que devuelve `page`.
 */
export async function fetchAllRows<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const chunk = data ?? [];
    rows.push(...chunk);
    if (chunk.length < PAGE_SIZE) return rows;
  }
}

const DAY_MS = 864e5;
/** ISO de hace `days` días (límite de las tablas de bitácora). */
const sinceIso = (days: number) =>
  new Date(Date.now() - days * DAY_MS).toISOString();

/**
 * Tabla completa (paginada, orden estable por `id`). Las tablas que crecen sin
 * límite (eventos de estado, bitácora admin) se cargan aparte acotadas a 90 días.
 */
export function fetchAll<K extends keyof Tables & string>(table: K) {
  return fetchAllRows<Row<K>>(
    (from, to) =>
      supabase.from(table).select('*').order('id').range(from, to) as unknown as PromiseLike<{
        data: Row<K>[] | null;
        error: unknown;
      }>,
  );
}

let inflight: Promise<void> | null = null;
let mockHistory: ReturnType<typeof withHistory> | null = null;
let rerun: Promise<void> | null = null;

/** Load (or reload) the world snapshot. Call once from the console shell. */
export function loadWorld(force = false): Promise<void> {
  if (MOCK) {
    // Una sola vez: bump() mueve `tick` y hay pantallas que recargan con él.
    if (mockHistory && world === mockHistory.world) return Promise.resolve();
    mockHistory ??= withHistory(demoWorld());
    world = mockHistory.world;
    adminEvents = [...mockHistory.inventoryEvents, ...mockHistory.vehicles.map(v => ({
      id: `mock-ae-${v.id}`,
      actor_id: v.technician_id,
      entity_type: 'technician',
      entity_id: v.technician_id,
      event_type: 'vehicle_added',
      payload: { before: null, after: { make: v.make, model: v.model, year: v.year, color: v.color, plate: v.plate } },
      created_at: v.created_at,
      updated_at: v.created_at,
    }))];
    registerFolios(world.orders);
    useData.setState({ status: 'ready' });
    bump();
    return Promise.resolve();
  }
  if (inflight) {
    if (!force) return inflight;
    // Una escritura terminó mientras otra carga iba en vuelo: esa carga salió
    // antes de la escritura y no la trae. Encadena UNA recarga más (las
    // escrituras concurrentes comparten esa misma recarga).
    rerun ??= inflight.then(() => {
      rerun = null;
      return loadWorld(true);
    });
    return rerun;
  }
  if (!force && Date.now() - lastFetched < 15_000) return Promise.resolve();
  useData.setState(s =>
    s.status === 'ready' ? s : { ...s, status: 'loading' },
  );
  inflight = (async () => {
    try {
      const [
        profiles,
        categories,
        technicians,
        technicianCategories,
        rates,
        addresses,
        orders,
        quotes,
        quoteItems,
        events,
        payments,
        ledger,
        kycSessions,
        disputes,
        platformSettings,
        ticketRows,
        ticketMessageRows,
        adminEventRows,
      ] = await Promise.all([
        fetchAll('profiles'),
        fetchAll('service_categories'),
        fetchAll('technicians'),
        fetchAll('technician_categories'),
        fetchAll('technician_rates'),
        fetchAll('client_addresses'),
        fetchAll('service_orders'),
        fetchAll('service_quotes'),
        fetchAll('service_quote_items'),
        // Bitácora de estados: últimos 90 días (reportes y dashboard no
        // miran más atrás; la tabla crece con cada transición).
        fetchAllRows((a, b) =>
          supabase
            .from('service_order_status_events')
            .select('*')
            .gte('created_at', sinceIso(90))
            .order('id')
            .range(a, b),
        ),
        fetchAll('payments'),
        fetchAll('ledger_entries'),
        fetchAll('kyc_sessions'),
        fetchAll('disputes'),
        fetchAll('platform_settings'),
        optional(fetchAll('support_tickets'), 'support_tickets'),
        optional(fetchAll('ticket_messages'), 'ticket_messages'),
        // Bitácora admin: últimos 90 días (notas, KYC, suspensiones, ajustes).
        optional(
          fetchAllRows((a, b) =>
            supabase
              .from('admin_events')
              .select('*')
              .gte('created_at', sinceIso(90))
              .order('id')
              .range(a, b),
          ),
          'admin_events',
        ),
      ]);
      world = {
        profiles,
        categories,
        technicians,
        technicianCategories,
        rates,
        addresses,
        orders,
        quotes,
        quoteItems,
        events,
        payments,
        ledger,
        kycSessions,
        disputes,
      };
      settings = platformSettings;
      tickets = ticketRows;
      ticketMessages = ticketMessageRows;
      adminEvents = adminEventRows;
      // service_orders.folio alimenta orderCode() → SVC-<folio>.
      registerFolios(orders);
      lastFetched = Date.now();
      useData.setState({ status: 'ready' });
    } catch (e) {
      console.error('[data] loadWorld failed', e);
      // Con un snapshot ya cargado, una recarga fallida conserva el anterior
      // (la escritura sí se hizo); solo la primera carga deja la consola en error.
      if (useData.getState().status === 'ready') {
        notifyError('No se pudieron actualizar los datos. Recarga la página.');
      } else {
        useData.setState({ status: 'error' });
        notifyError('No se pudieron cargar los datos. Reintenta.');
      }
    } finally {
      inflight = null;
      bump();
    }
  })();
  return inflight;
}

/** Reload after a write so every view reflects the backend. */
const refresh = () => loadWorld(true);

// ── Realtime ────────────────────────────────────────────────────────────────
const LIVE_TABLES = ['service_orders', 'disputes', 'support_tickets', 'payout_requests'];
let liveTimer: ReturnType<typeof setTimeout> | null = null;
/** Varios cambios seguidos (un lote de retiros) → una sola recarga. */
function scheduleLiveReload() {
  if (liveTimer) clearTimeout(liveTimer);
  liveTimer = setTimeout(() => {
    liveTimer = null;
    void loadWorld(true);
    if (useExtras.getState().loaded) void loadExtras(true);
  }, 1500);
}
/**
 * Un canal postgres_changes sobre las tablas que mueven la operación y una
 * recarga (respetando la caché de 15 s) al volver el foco a la pestaña.
 * Devuelve la función para desuscribirse.
 */
export function subscribeRealtime(): () => void {
  let channel = supabase.channel('console-live');
  for (const table of LIVE_TABLES)
    channel = channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      scheduleLiveReload,
    );
  channel.subscribe();
  const onFocus = () => {
    if (document.visibilityState === 'visible') void loadWorld();
  };
  window.addEventListener('focus', onFocus);
  document.addEventListener('visibilitychange', onFocus);
  return () => {
    void supabase.removeChannel(channel);
    window.removeEventListener('focus', onFocus);
    document.removeEventListener('visibilitychange', onFocus);
  };
}

/**
 * Wrap a backend write: on error toast + null, on success reload the snapshot.
 * `errMsg` puede leer el error para dar la causa (p. ej. duplicado 23505).
 */
async function mutate<R>(
  fn: () => Promise<R>,
  errMsg: string | ((e: unknown) => string),
): Promise<R | null> {
  try {
    const r = await fn();
    await refresh();
    return r;
  } catch (e) {
    const msg = typeof errMsg === 'string' ? errMsg : errMsg(e);
    console.error('[data]', msg, e);
    notifyError(msg);
    return null;
  }
}

/**
 * Mensaje de validación del backend (SQLSTATE 22023: textos en español
 * pensados para mostrarse, p. ej. "El valor de request_ttl_minutes debe ser…").
 */
const pgMessage = (e: unknown, fallback: string) =>
  pgCode(e) === '22023' && typeof e === 'object' && e && 'message' in e
    ? String(e.message)
    : fallback;

/** Código de error de Postgres/PostgREST (p. ej. '23505' = único duplicado). */
export const pgCode = (e: unknown) =>
  typeof e === 'object' && e && 'code' in e ? String(e.code) : null;

// ── Platform settings ────────────────────────────────────────────────────────
export const getSettings = () => settings;
export function getSettingInt(key: string, fallback: number): number {
  const v = settings.find(s => s.key === key)?.value;
  return typeof v === 'number' ? v : fallback;
}
export function getSettingBool(key: string, fallback: boolean): boolean {
  const v = settings.find(s => s.key === key)?.value;
  return typeof v === 'boolean' ? v : fallback;
}
export function getSettingStr(key: string, fallback: string): string {
  const v = settings.find(s => s.key === key)?.value;
  return typeof v === 'string' ? v : fallback;
}
export function getSettingList(key: string, fallback: string[]): string[] {
  const v = settings.find(s => s.key === key)?.value;
  return Array.isArray(v) ? (v as unknown[]).map(String) : fallback;
}
/** Minutos tras los que una solicitud sin técnico dispara alerta. */
export const getUnassignedAlertMinutes = () =>
  getSettingInt(ALERT_MINUTES_KEY, ALERT_MINUTES_DEFAULT);
/** Configuración de emergencias (platform_settings) con los defaults del backend. */
export function getEmergencyConfig(): EmergencyConfig {
  const d = EMERGENCY_DEFAULTS;
  const k = EMERGENCY_KEYS;
  const mode = getSettingStr(k.surchargeMode, d.surchargeMode);
  return {
    initialRadiusM: getSettingInt(k.initialRadiusM, d.initialRadiusM),
    stepM: getSettingInt(k.stepM, d.stepM),
    maxRadiusM: getSettingInt(k.maxRadiusM, d.maxRadiusM),
    roundSeconds: getSettingInt(k.roundSeconds, d.roundSeconds),
    timeoutMinutes: getSettingInt(k.timeoutMinutes, d.timeoutMinutes),
    surchargeMode: (mode === 'fixed' ? 'fixed' : 'percent') as SurchargeMode,
    surchargeBps: getSettingInt(k.surchargeBps, d.surchargeBps),
    surchargeFixedCents: getSettingInt(k.surchargeFixedCents, d.surchargeFixedCents),
  };
}

/**
 * Guarda settings vía upsert_platform_setting (RPC: valida, registra
 * admin_events y crea la key si no existe). Una llamada por key; si una falla
 * se detiene ahí y se avisa cuál.
 */
export async function saveSettings(
  entries: Record<string, number | string | boolean | string[]>,
) {
  if (MOCK) {
    // Maqueta: se guarda solo en memoria (sin Supabase ni sesión).
    const now = new Date().toISOString();
    for (const [key, value] of Object.entries(entries)) {
      const i = settings.findIndex(x => x.key === key);
      if (i >= 0) settings[i] = { ...settings[i], value, updated_at: now };
      else
        settings = [
          ...settings,
          { id: `mock-set-${key}`, key, value, description: null, created_at: now, updated_at: now },
        ];
    }
    bump();
    return Promise.resolve(true as const);
  }
  return mutate(
    async () => {
      for (const [key, value] of Object.entries(entries)) {
        const { error } = await supabase.rpc('upsert_platform_setting', {
          p_key: key,
          p_value: value,
        });
        if (error) throw error;
      }
      return true;
    },
    e => pgMessage(e, 'No se pudo guardar la configuración.'),
  );
}
export const saveSettingInt = (key: string, value: number) =>
  saveSettings({ [key]: value });

// ── Read selectors (unchanged API — they read the live snapshot) ─────────────
export const getCategories = () => w().categories;
export const getTechnicians = () => w().technicians;
export const getProfile = (userId: string) =>
  w().profiles.find(p => p.id === userId) ?? null;
export const getTechByUser = (userId: string) =>
  w().technicians.find(t => t.id === userId) ?? null;
export const getAddresses = (userId = CLIENT_ID) =>
  w().addresses.filter(a => a.client_id === userId);

export const getClientRequests = (clientId = CLIENT_ID) =>
  w()
    .orders.filter(r => r.client_id === clientId)
    .sort(byNewest);
export const getTechRequests = (techUserId = TECH_USER_ID) =>
  w()
    .orders.filter(r => r.technician_id === techUserId)
    .sort(byNewest);
export const getRequest = (id: string) =>
  w().orders.find(r => r.id === id) ?? null;
/** Cotizaciones de una orden, de la más reciente a la más antigua (cada reenvío crea una nueva). */
export const getOrderQuotes = (orderId: string) =>
  w()
    .quotes.filter(q => q.service_order_id === orderId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
export const getQuote = (orderId: string) => getOrderQuotes(orderId)[0] ?? null;
export const getQuoteItems = (quoteId: string) =>
  w().quoteItems.filter(i => i.quote_id === quoteId);
/** Todos los pagos de una orden (tarifa base, presupuesto en efectivo o legado). */
export const getOrderPayments = (orderId: string) =>
  w().payments.filter(p => p.service_order_id === orderId);
/** Pago principal: el del presupuesto/legado; si aún no existe, el de la tarifa base. */
export const getPayment = (orderId: string) => {
  const all = getOrderPayments(orderId);
  return quotePayment(all) ?? all[0] ?? null;
};
/** Pago del presupuesto (efectivo) o legado de una orden. */
export const quotePaymentOf = (orderId: string) => quotePayment(getOrderPayments(orderId));
/** Órdenes con una revisión de efectivo abierta (cola de soporte/finanzas). */
export const getCashReviewOrders = () => w().orders.filter(o => o.cash_review_open);

export const getPendingKyc = () =>
  w().technicians.filter(
    t => t.kyc_status === 'in_review' || t.kyc_status === 'pending',
  );
export const getDisputes = (status?: string) =>
  status ? w().disputes.filter(d => d.status === status) : w().disputes;
export const getKycSessions = (techId: string) =>
  w().kycSessions.filter(s => s.technician_id === techId);
export const getPayouts = (techId: string) =>
  getAllPayouts().filter(p => p.technician_id === techId);

/**
 * Retiros reales. No hay tabla `payouts` desplegada: un retiro ES la entrada
 * `payout` del ledger (negativa, a cargo del técnico) que escribe la app del
 * técnico. Antes esto leía `w().payouts`, un arreglo en memoria que nunca se
 * llenaba — el panel de retiros salía vacío para siempre.
 * ponytail: sin cola de "pendientes" en el backend, toda entrada ya ocurrió.
 */
export const getAllPayouts = (): DemoPayout[] =>
  w()
    .ledger.filter(e => e.entry_type === 'payout')
    .map(e => ({
      id: e.id,
      technician_id: e.technician_id,
      amount_cents: Math.abs(e.amount_cents),
      status: 'processed' as const,
      clabe_snapshot: getTechnician(e.technician_id)?.clabe ?? null,
      batch_id: null,
      processed_at: e.created_at,
      created_at: e.created_at,
      updated_at: e.updated_at,
    }))
    .sort(byNewest);
export const getLedger = (techId: string) =>
  w().ledger.filter(e => e.technician_id === techId);
export const getAllLedger = () => w().ledger;
export const getWalletBalanceCents = (techId: string) =>
  getLedger(techId).reduce((s, e) => s + e.amount_cents, 0);
export const getTechnician = (techId: string) =>
  w().technicians.find(t => t.id === techId) ?? null;
export const getTechCategories = (techId: string) =>
  w().technicianCategories.filter(tc => tc.technician_id === techId);
export const getTechRates = (techId: string) =>
  w().rates.filter(r => r.technician_id === techId);
function ratingEventText(type: string, payload: Json): string {
  const p = (payload ?? {}) as { score?: unknown; reason?: unknown; note?: unknown };
  const stars = typeof p.score === 'number' ? ` de ${p.score}★` : '';
  const note = typeof p.note === 'string' && p.note ? ` — ${p.note}` : '';
  if (type === 'rating_restored') return `Calificación${stars} restaurada${note}`;
  const reason = typeof p.reason === 'string' ? ` · ${ratingReasonLabel(p.reason as RatingReason)}` : '';
  return `Calificación${stars} oculta${reason}${note}`;
}
/** Bitácora de una entidad (orden, técnico, cliente, disputa) desde admin_events. */
export const getNotes = (entityId: string): Note[] =>
  adminEvents
    .filter(e => e.entity_id === entityId)
    .map(e => {
      const raw = (e.payload as { note?: unknown } | null)?.note;
      const note = typeof raw === 'string' ? raw : null;
      const label = EVENT_LABEL[e.event_type] ?? e.event_type;
      if (isInventoryEvent(e.entity_type, e.event_type))
        return {
          id: e.id,
          entity_id: entityId,
          author: (e.actor_id && getProfile(e.actor_id)?.full_name) || 'Sistema',
          event_type: e.event_type,
          note,
          text: inventoryEventText(e.event_type, e.payload),
          created_at: e.created_at,
        };
      if (e.event_type.startsWith('vehicle_'))
        return {
          id: e.id,
          entity_id: entityId,
          author: (e.actor_id && getProfile(e.actor_id)?.full_name) || 'Sistema',
          event_type: e.event_type,
          note,
          text: vehicleEventText(e.event_type, e.payload),
          created_at: e.created_at,
        };
      if (e.event_type.startsWith('tool_'))
        return {
          id: e.id,
          entity_id: entityId,
          author: (e.actor_id && getProfile(e.actor_id)?.full_name) || 'Sistema',
          event_type: e.event_type,
          note,
          text: toolEventText(e.event_type, e.payload, id => getCatalogTool(id)?.name ?? null),
          created_at: e.created_at,
        };
      if (e.event_type === 'rating_hidden' || e.event_type === 'rating_restored')
        return {
          id: e.id,
          entity_id: entityId,
          author: (e.actor_id && getProfile(e.actor_id)?.full_name) || 'Admin',
          event_type: e.event_type,
          note,
          text: ratingEventText(e.event_type, e.payload),
          created_at: e.created_at,
        };
      if (e.event_type === 'technician_type_changed')
        return {
          id: e.id,
          entity_id: entityId,
          author: (e.actor_id && getProfile(e.actor_id)?.full_name) || 'Sistema',
          event_type: e.event_type,
          note,
          text: typeChangeText(e.payload, id => getCompany(id)?.name ?? null),
          created_at: e.created_at,
        };
      return {
        id: e.id,
        entity_id: entityId,
        author: (e.actor_id && getProfile(e.actor_id)?.full_name) || 'Sistema',
        event_type: e.event_type,
        note,
        text: e.event_type === 'note' && note ? note : note ? `${label} — ${note}` : label,
        created_at: e.created_at,
      };
    })
    .sort(byNewest);
export const isTicketOpen = (t: Ticket) => t.status !== 'resolved' && t.status !== 'closed';
export const getTickets = () => [...tickets].sort(byNewest);
export const getTicket = (id: string) => tickets.find(t => t.id === id) ?? null;
/** Quién pidió el ticket: el usuario (client_id) o quien lo abrió. */
export const ticketRequester = (t: Ticket) => t.client_id ?? t.opened_by;
export const getTicketMessages = (ticketId: string) =>
  ticketMessages
    .filter(m => m.ticket_id === ticketId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
/** Badge del sidebar: disputas no resueltas + tickets sin resolver. */
export const getOpenSupportCount = () =>
  w().disputes.filter(d => d.status === 'open' || d.status === 'in_review')
    .length + tickets.filter(isTicketOpen).length;

function byNewest(a: { created_at: string }, b: { created_at: string }) {
  return b.created_at.localeCompare(a.created_at);
}

// ── Admin-wide selectors (desktop console) ───────────────────────────────────
export const getAllRequests = () => [...w().orders].sort(byNewest);
export const getAllPayments = () => w().payments;
export const getAllProfiles = () => w().profiles;
export const getClients = () => w().profiles.filter(p => p.role === 'client');
export const getAllDisputes = () => w().disputes;
export const getOrderEvents = (orderId: string) =>
  w()
    .events.filter(e => e.service_order_id === orderId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
// ── consola-a (dashboard) ─────────────────────────────────────────────────
/** Todos los eventos de estado (actividad en vivo del dashboard). */
export const getAllEvents = () => w().events;
// ── /consola-a ────────────────────────────────────────────────────────────
export const getCategoriesWithCounts = () =>
  w().categories.map(c => ({
    ...c,
    services: w().orders.filter(r => r.category_id === c.id).length,
  }));
export const getTechniciansWithProfile = () =>
  w().technicians.map(t => ({ tech: t, profile: getProfile(t.id) }));

/** Dashboard / finance aggregates derived from the live world (centavos). */
export function getMetrics() {
  const reqs = w().orders;
  const pays = w().payments.filter(p => p.status === 'paid');
  const ACTIVE: OrderStatus[] = [
    'accepted',
    'enroute',
    'onsite',
    'quote',
    'working',
    'closing',
  ];
  const DONE: OrderStatus[] = ['completed', 'paid', 'closed'];
  const active = reqs.filter(r => ACTIVE.includes(r.status)).length;
  const today = mxDay(new Date());
  const completedToday = reqs.filter(
    r =>
      DONE.includes(r.status) && r.completed_at && mxDay(r.completed_at) === today,
  ).length;
  const gmv = pays.reduce((s, p) => s + p.amount_cents, 0);
  const platformFee = pays.reduce((s, p) => s + p.commission_cents, 0);
  const techNet = pays.reduce(
    (s, p) => s + (p.amount_cents - p.commission_cents),
    0,
  );
  const activeTechs = w().technicians.filter(t => t.is_available).length;
  const totalTechs = w().technicians.length;
  const byCategory = getCategoriesWithCounts().filter(c => c.services > 0);
  const byStatus = reqs.reduce<Record<string, number>>(
    (m, r) => ((m[r.status] = (m[r.status] ?? 0) + 1), m),
    {},
  );
  return {
    active,
    completedToday,
    gmv,
    platformFee,
    techNet,
    activeTechs,
    totalTechs,
    byCategory,
    byStatus,
    totalRequests: reqs.length,
  };
}

// ── Mutators (write through to Supabase, then reload the snapshot) ───────────

// PostGIS geography: los SELECT devuelven WKB hex (string, pasa tal cual al
// insertar); un literal GeoJSON NO es aceptado — se convierte a EWKT.
function toGeography(loc: unknown): string {
  if (typeof loc === 'string') return loc;
  const c = (loc as { coordinates?: [number, number] } | null)?.coordinates;
  return `SRID=4326;POINT(${c?.[0] ?? -103.3773} ${c?.[1] ?? 20.7062})`;
}

/**
 * Alta desde la consola con la misma RPC que la app (create_service_request:
 * TTL, comisión, recargo urgente y evento inicial los pone el backend; el
 * INSERT directo de eventos ya no está permitido). `p_technician_id` deja la
 * solicitud dirigida a ese técnico (routing tech-first); `p_client_id` indica
 * a nombre de quién se crea (solo admin).
 */
export async function createRequest(
  input: Partial<OrderInsert> & {
    client_id: string;
    category_id: string;
    technician_id?: string | null;
    scheduled_for?: string | null;
    scheduled_until?: string | null;
  },
): Promise<ServiceOrder | null> {
  return mutate(
    async () => {
      const addr = w().addresses.find(a => a.id === input.client_address_id);
      const [lng, lat] = wkbPoint(addr?.location) ?? [-103.3773, 20.7062];
      const { data, error } = await supabase.rpc('create_service_request', {
        p_category_id: input.category_id,
        p_lng: lng,
        p_lat: lat,
        p_place_name: addr?.place_name ?? undefined,
        p_neighborhood: addr?.neighborhood ?? undefined,
        p_municipality: addr?.municipality ?? 'Guadalajara',
        p_postal_code: addr?.postal_code ?? undefined,
        p_state: addr?.state ?? 'Jalisco',
        p_address_line: addr?.address_line ?? input.address_line ?? undefined,
        p_client_address_id: input.client_address_id ?? undefined,
        p_title: input.title ?? undefined,
        p_description: input.description ?? undefined,
        p_is_urgent: input.is_urgent ?? false,
        p_scheduled_for: input.scheduled_for ?? undefined,
        p_scheduled_until: input.scheduled_until ?? undefined,
        p_technician_id: input.technician_id ?? undefined,
        p_client_id: input.client_id,
      });
      if (error) throw error;
      return data;
    },
    e => pgMessage(e, 'No se pudo crear el servicio.'),
  );
}

/**
 * Alta de una emergencia desde la consola (soporte telefónico) con
 * create_emergency_request: nace sin técnico y arranca el despacho por rondas;
 * el recargo y los tiempos los fija el backend con la config de emergencias.
 */
export async function createEmergencyRequest(input: {
  client_id: string;
  category_id: string;
  client_address_id?: string | null;
  description?: string | null;
}): Promise<ServiceOrder | null> {
  return mutate(
    async () => {
      const addr = w().addresses.find(a => a.id === input.client_address_id);
      const [lng, lat] = wkbPoint(addr?.location) ?? [-103.3773, 20.7062];
      const { data, error } = await supabase.rpc('create_emergency_request', {
        p_category_id: input.category_id,
        p_lng: lng,
        p_lat: lat,
        p_place_name: addr?.place_name ?? undefined,
        p_neighborhood: addr?.neighborhood ?? undefined,
        p_municipality: addr?.municipality ?? 'Guadalajara',
        p_postal_code: addr?.postal_code ?? undefined,
        p_state: addr?.state ?? 'Jalisco',
        p_address_line: addr?.address_line ?? undefined,
        p_client_address_id: input.client_address_id ?? undefined,
        p_description: input.description ?? undefined,
        p_client_id: input.client_id,
      });
      if (error) throw error;
      return data;
    },
    e => pgMessage(e, 'No se pudo crear la emergencia.'),
  );
}

/**
 * Historial del despacho de una emergencia (admin_emergency_history): rondas
 * con radio, técnicos notificados, quién aceptó y tiempo de respuesta.
 */
export async function fetchEmergencyHistory(
  orderId: string,
): Promise<EmergencyHistory | null> {
  if (MOCK) {
    const o = getRequest(orderId);
    if (!o) return null;
    const rows = (mockHistory?.dispatchLog ?? []).filter(r => r.order_id === orderId);
    return buildHistory(
      o,
      rows,
      id => getProfile(id)?.full_name ?? 'Técnico',
    );
  }
  const { data, error } = await supabase.rpc('admin_emergency_history', {
    p_order_id: orderId,
  });
  if (error) throw error;
  return parseHistory(data);
}

export async function setStatus(
  orderId: string,
  status: OrderStatus,
  note: string | null = null,
) {
  return mutate(async () => {
    const { error } = await supabase.rpc('transition_service_order', {
      p_order_id: orderId,
      p_to_status: status,
      p_note: note ?? undefined,
    });
    if (error) throw error;
    return true;
  }, e => pgMessage(e, 'No se pudo cambiar el estado.'));
}

/** Técnico sugerido para una solicitud (admin_suggest_technicians). */
export type TechSuggestion = NullableCols<
  Fn['admin_suggest_technicians']['Returns'][number],
  'distance_m'
>;

/**
 * Técnicos candidatos para asignar/reasignar: KYC aprobado, cubren la
 * categoría, disponibles primero, por zona/cercanía y calificación. En
 * maqueta se calcula del snapshot demo.
 */
export async function suggestTechnicians(orderId: string): Promise<TechSuggestion[]> {
  if (MOCK) {
    const o = getRequest(orderId);
    if (!o) return [];
    const at = wkbPoint(o.location);
    const locs = mockHistory?.locations ?? [];
    const rows = w()
      .technicians.filter(
        t =>
          t.kyc_status === 'approved' &&
          getProfile(t.id)?.status !== 'suspended' &&
          t.id !== o.technician_id &&
          w().technicianCategories.some(
            c => c.technician_id === t.id && c.category_id === o.category_id,
          ),
      )
      .map(t => {
        const loc = locs.find(l => l.technician_id === t.id);
        const from = loc ? wkbPoint(loc.location) : null;
        return {
          technician_id: t.id,
          display_name: getProfile(t.id)?.full_name ?? 'Técnico',
          rating_avg: t.rating_avg,
          rating_count: t.rating_count,
          distance_m: at && from ? distanceM(from, at) : null,
          zone_match: !!loc && loc.municipality === o.municipality,
          is_available: t.is_available,
          active_orders: w().orders.filter(
            x =>
              x.technician_id === t.id &&
              ['accepted', 'enroute', 'onsite', 'quote', 'working', 'closing'].includes(x.status),
          ).length,
        } satisfies TechSuggestion;
      });
    return rows.sort(
      (a, b) =>
        Number(b.is_available) - Number(a.is_available) ||
        Number(b.zone_match) - Number(a.zone_match) ||
        (a.distance_m ?? Infinity) - (b.distance_m ?? Infinity) ||
        b.rating_avg - a.rating_avg,
    );
  }
  const { data, error } = await supabase.rpc('admin_suggest_technicians', {
    p_order_id: orderId,
  });
  if (error) throw error;
  return data ?? [];
}

const MOCK_ADMIN_ID = 'mock-admin';

function mockEvent(orderId: string, from: OrderStatus, to: OrderStatus, note: string, at: string) {
  w().events.push({
    ...(w().events[0] ?? ({} as ServiceStatusEvent)),
    id: `mock-ev-${Date.now()}-${Math.round(Math.random() * 1e4)}`,
    service_order_id: orderId,
    from_status: from,
    to_status: to,
    actor_id: MOCK_ADMIN_ID,
    note,
    is_revert: false,
    created_at: at,
    updated_at: at,
  });
}

/**
 * Asigna (requested → accepted) o reasigna (accepted) con admin_assign_order.
 * El backend rechaza `enroute` o posterior y notifica a técnico y cliente;
 * deja «Asignado a X por Y» en la bitácora. Sirve a la bandeja y a Reasignar.
 */
export async function assignOrder(
  orderId: string,
  techUserId: string,
  note: string | null = null,
) {
  if (MOCK) {
    // Maqueta: en memoria, con las mismas reglas.
    const arr = w().orders;
    const i = arr.findIndex(o => o.id === orderId);
    if (i < 0) return null;
    const prev = arr[i];
    if (!canReassignStatus(prev.status)) {
      notifyError('Ya va en camino: no se puede reasignar.');
      return null;
    }
    const now = new Date().toISOString();
    const name = getProfile(techUserId)?.full_name ?? techUserId;
    const wasRequested = prev.status === 'requested';
    arr[i] = {
      ...prev,
      technician_id: techUserId,
      status: 'accepted',
      accepted_at: wasRequested ? now : (prev.accepted_at ?? now),
      needs_manual_assignment: false,
      dispatch_status: prev.priority === 'emergency' ? 'assigned' : prev.dispatch_status,
      updated_at: now,
    };
    const by = getProfile(MOCK_ADMIN_ID)?.full_name ?? 'admin';
    mockEvent(
      orderId,
      prev.status,
      'accepted',
      `${wasRequested ? 'Asignado' : 'Reasignado'} a ${name} por ${by}${note ? ` · ${note}` : ''}`,
      now,
    );
    bump();
    return true as const;
  }
  return mutate(
    async () => {
      const { error } = await supabase.rpc('admin_assign_order', {
        p_order_id: orderId,
        p_technician_id: techUserId,
        p_note: note ?? undefined,
      });
      if (error) throw error;
      return true;
    },
    e => pgMessage(e, 'No se pudo asignar el servicio.'),
  );
}

/** Reasignar = el mismo RPC (válido solo en requested/accepted). */
export const reassignRequest = (orderId: string, techUserId: string) =>
  assignOrder(orderId, techUserId);

/** Rechaza una solicitud sin técnico (admin_reject_request): cancelada con motivo. */
export async function rejectRequest(orderId: string, reason: string) {
  const text = reason.trim();
  if (!text) {
    notifyError('Escribe el motivo del rechazo.');
    return null;
  }
  if (MOCK) {
    const arr = w().orders;
    const i = arr.findIndex(o => o.id === orderId);
    if (i < 0) return null;
    const prev = arr[i];
    if (prev.status !== 'requested') {
      notifyError('Solo se puede rechazar una solicitud sin aceptar.');
      return null;
    }
    const now = new Date().toISOString();
    arr[i] = {
      ...prev,
      status: 'cancelled',
      cancelled_at: now,
      cancellation_reason: text,
      needs_manual_assignment: false,
      updated_at: now,
    };
    mockEvent(orderId, 'requested', 'cancelled', rejectNote(text), now);
    bump();
    return true as const;
  }
  return mutate(
    async () => {
      const { error } = await supabase.rpc('admin_reject_request', {
        p_order_id: orderId,
        p_reason: text,
      });
      if (error) throw error;
      return true;
    },
    e => pgMessage(e, 'No se pudo rechazar la solicitud.'),
  );
}

/**
 * Reembolso real: la Edge Function reembolsa en Stripe (tarjeta) y luego, en
 * una transacción, marca el pago `refunded`, revierte el ledger y cancela la
 * orden. En efectivo solo aplica el ajuste contable. Antes solo cambiaba el
 * estado del pago en dos escrituras sueltas y no devolvía dinero.
 */
export async function refundPayment(
  orderId: string,
  reason?: string,
  amountCents?: number,
  paymentId?: string,
) {
  // Con varios pagos (tarifa base + efectivo) el admin elige cuál; por omisión
  // el principal. El backend usa el mismo `payment_id`.
  const pay = paymentId ? w().payments.find(p => p.id === paymentId) : getPayment(orderId);
  if (!pay || pay.service_order_id !== orderId || pay.status !== 'paid') return null;
  const max = refundableCents(pay);
  if (amountCents != null && (amountCents < 1 || amountCents > max)) {
    notifyError('El monto a reembolsar excede lo que queda por reembolsar.');
    return null;
  }
  if (MOCK) {
    const now = new Date().toISOString();
    const cents = amountCents ?? max;
    const total = pay.refunded_cents + cents >= pay.amount_cents;
    const k = w().payments.findIndex(p => p.id === pay.id);
    w().payments[k] = {
      ...pay,
      refunded_cents: pay.refunded_cents + cents,
      status: total ? 'refunded' : pay.status,
      updated_at: now,
    };
    const i = w().orders.findIndex(o => o.id === orderId);
    const o = w().orders[i];
    if (o && total) {
      // La tarifa base reembolsada no cancela el servicio; el resto sí (como el backend).
      w().orders[i] =
        pay.kind === 'base_fee'
          ? { ...o, base_fee_status: 'refunded', base_fee_refunded_at: now, updated_at: now }
          : { ...o, status: 'cancelled', cancelled_at: now, cancellation_reason: reason ?? 'Reembolso total', updated_at: now };
    }
    bump();
    return w().payments[k];
  }
  return mutate(async () => {
    const { data, error } = await supabase.functions.invoke(
      'stripe-refund-order',
      {
        body: {
          service_order_id: orderId,
          reason,
          payment_id: pay.id,
          // Omitido = todo lo que queda; parcial = acumula en refunded_cents.
          ...(amountCents != null && amountCents < max ? { amount_cents: amountCents } : {}),
        },
      },
    );
    if (error) throw error;
    return data ?? pay;
  }, 'No se pudo emitir el reembolso. Nada se cobró ni se canceló; reintenta.');
}

/** Lo que aún se puede reembolsar: amount - refunded_cents (acumulado de parciales). */
export const refundableCents = (pay: { amount_cents: number; refunded_cents: number }) =>
  pay.amount_cents - pay.refunded_cents;

export async function resolveKyc(
  techId: string,
  approve: boolean,
  note?: string,
) {
  // technicians.kyc_status + última kyc_sessions en una transacción.
  return mutate(
    async () => {
      const { error } = await supabase.rpc('admin_resolve_kyc', {
        p_technician_id: techId,
        p_status: approve ? 'approved' : 'declined',
        p_note: note,
      });
      if (error) throw error;
      return true;
    },
    e => pgMessage(e, 'No se pudo actualizar el KYC.'),
  );
}

/** Rechaza el KYC; admin_resolve_kyc guarda el motivo en admin_events (kyc_declined). */
export const rejectKyc = (techId: string, reason: string) =>
  resolveKyc(techId, false, reason);

// Suspensión en dos pasos: admin_set_user_status (profiles.status +
// technicians.is_available + admin_events, una transacción) y luego la Edge
// Function admin-users, que banea/desbanea la cuenta en Auth para que de
// verdad no pueda iniciar sesión. Si el segundo paso falla se avisa (el
// estado ya quedó guardado) en vez de fingir que todo salió bien.
const setUserStatus = async (
  userId: string,
  status: 'active' | 'suspended',
  errMsg: string,
) => {
  const r = await mutate(
    async () => {
      const { error } = await supabase.rpc('admin_set_user_status', {
        p_user_id: userId,
        p_status: status,
      });
      if (error) throw error;
      return true;
    },
    e => pgMessage(e, errMsg),
  );
  if (r === null) return null;
  const { error } = await supabase.functions.invoke('admin-users', {
    body: { action: status === 'suspended' ? 'suspend' : 'restore', user_id: userId },
  });
  if (error) {
    console.error('[data] admin-users', error);
    notifyError(
      status === 'suspended'
        ? 'Quedó suspendido en la plataforma, pero no se pudo bloquear su inicio de sesión. Reintenta.'
        : 'Quedó activo, pero no se pudo desbloquear su inicio de sesión. Reintenta.',
    );
  }
  return true;
};

export const suspendTechnician = (techId: string) =>
  setUserStatus(techId, 'suspended', 'No se pudo suspender al técnico.');
export const reactivateTechnician = (techId: string) =>
  setUserStatus(techId, 'active', 'No se pudo reactivar al técnico.');
export const suspendUser = (userId: string) =>
  setUserStatus(userId, 'suspended', 'No se pudo suspender al usuario.');
export const reactivateUser = (userId: string) =>
  setUserStatus(userId, 'active', 'No se pudo reactivar al usuario.');

export async function upsertTechRate(
  techId: string,
  categoryId: string,
  cents: { visita_cents: number; hora_cents: number; minimo_cents: number },
) {
  return mutate(async () => {
    const { error } = await supabase
      .from('technician_rates')
      .upsert(
        { technician_id: techId, category_id: categoryId, ...cents },
        { onConflict: 'technician_id,category_id' },
      );
    if (error) throw error;
    return true;
  }, 'No se pudo guardar la tarifa.');
}

export async function updateTechnicianBank(
  techId: string,
  bank_name: string | null,
  clabe: string | null,
) {
  return mutate(async () => {
    const { error } = await supabase
      .from('technicians')
      .update({ bank_name, clabe })
      .eq('id', techId);
    if (error) throw error;
    return true;
  }, 'No se pudieron guardar los datos bancarios.');
}

// ── Equipo (admins) ──────────────────────────────────────────────────────────
export const getAdmins = () => w().profiles.filter(p => p.role === 'admin');

/** Invita a un admin por correo vía la Edge Function admin-users (service role). */
export async function inviteAdmin(email: string, fullName: string, adminRole?: AdminRole) {
  return mutate(async () => {
    const { data, error } = await supabase.functions.invoke('admin-users', {
      body: {
        action: 'invite',
        email,
        full_name: fullName || undefined,
        admin_role: adminRole,
      },
    });
    if (error) throw error;
    return data ?? true;
  }, 'No se pudo enviar la invitación. Revisa el correo o si ya tiene cuenta.');
}

/** Roles de consola de todos los admins (RPC admin_list_admin_roles; solo super_admin). */
export async function fetchAdminRoles(): Promise<Record<string, string>> {
  const { data, error } = await supabase.rpc('admin_list_admin_roles');
  if (error) {
    console.warn('[data] admin_list_admin_roles', error);
    return {};
  }
  return Object.fromEntries((data ?? []).map(r => [r.user_id, r.admin_role]));
}

/** Cambia el rol de consola de otro admin (admin-users set_admin_role; solo super_admin). */
export async function setAdminRole(userId: string, adminRole: AdminRole) {
  return mutate(async () => {
    const { data, error } = await supabase.functions.invoke('admin-users', {
      body: { action: 'set_admin_role', user_id: userId, admin_role: adminRole },
    });
    if (error) throw error;
    return data ?? true;
  }, 'No se pudo cambiar el rol.');
}

/** Invita a un cliente (admin-users invite_client): recibe correo para crear su cuenta. */
export async function inviteClient(email: string, fullName: string, phone: string | null) {
  return mutate(async () => {
    const { data, error } = await supabase.functions.invoke('admin-users', {
      body: { action: 'invite_client', email, full_name: fullName, phone: phone ?? undefined },
    });
    if (error) throw error;
    return data ?? true;
  }, 'No se pudo enviar la invitación. Revisa el correo (¿ya tiene cuenta?).');
}

// ── Direcciones del cliente ──────────────────────────────────────────────────
type AddressFields = Pick<
  Database['public']['Tables']['client_addresses']['Insert'],
  | 'label'
  | 'address_line'
  | 'neighborhood'
  | 'municipality'
  | 'state'
  | 'postal_code'
  | 'is_default'
>;

/** Crea (sin addressId) o actualiza una dirección. */
export async function saveAddress(
  clientId: string,
  fields: AddressFields,
  addressId?: string,
) {
  // Al guardar con is_default el backend desmarca las demás en la misma
  // sentencia (antes eran dos escrituras y un fallo dejaba al cliente sin
  // dirección principal).
  return mutate(async () => {
    const q = addressId
      ? await supabase
          .from('client_addresses')
          .update(fields)
          .eq('id', addressId)
      : await supabase.from('client_addresses').insert({
          ...fields,
          client_id: clientId,
          location: toGeography(null),
        });
    if (q.error) throw q.error;
    return true;
  }, 'No se pudo guardar la dirección.');
}

export async function deleteAddress(addressId: string) {
  return mutate(async () => {
    const { error } = await supabase
      .from('client_addresses')
      .delete()
      .eq('id', addressId);
    if (error) throw error;
    return true;
  }, 'No se pudo eliminar la dirección (puede estar ligada a un servicio).');
}

// ── Catálogo (una sola capa: service_categories) ─────────────────────────────
export async function toggleCategory(catId: string) {
  const c = w().categories.find(x => x.id === catId);
  if (!c) return;
  return mutate(async () => {
    const { error } = await supabase
      .from('service_categories')
      .update({ is_active: !c.is_active })
      .eq('id', catId);
    if (error) throw error;
    return true;
  }, 'No se pudo actualizar la categoría.');
}

export async function createCategory(
  name: string,
  icon = 'wrench',
): Promise<ServiceCategory | null> {
  const slug = slugify(name);
  if (!slug) {
    notifyError('Escribe un nombre para la categoría.');
    return null;
  }
  return mutate(
    async () => {
      const { data, error } = await supabase
        .from('service_categories')
        .insert({
          slug,
          name,
          icon,
          sort_order: (w().categories.length + 1) * 10,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    e =>
      pgCode(e) === '23505'
        ? 'Ya existe una categoría con ese nombre.'
        : 'No se pudo crear la categoría.',
  );
}

export async function updateCategory(
  catId: string,
  input: Partial<ServiceCategory>,
) {
  if (input.name !== undefined && !input.name.trim()) {
    notifyError('La categoría necesita un nombre.');
    return null;
  }
  return mutate(
    async () => {
      const { error } = await supabase
        .from('service_categories')
        .update(input)
        .eq('id', catId);
      if (error) throw error;
      return true;
    },
    e =>
      pgCode(e) === '23505'
        ? 'Ya existe una categoría con ese nombre.'
        : 'No se pudo actualizar la categoría.',
  );
}

/** "Plomería y Gas" → "plomeria-y-gas" (sin acentos, ñ → n). */
export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export type DeleteCategoryResult = 'ok' | 'has-services' | 'failed';

/**
 * Elimina la categoría. Distingue los dos fallos: antes ambos devolvían `false`
 * y la página culpaba siempre a los servicios ligados, incluso cuando lo que
 * había fallado era RLS o la red.
 */
export async function deleteCategory(
  catId: string,
): Promise<DeleteCategoryResult> {
  if (w().orders.some(r => r.category_id === catId)) return 'has-services';
  try {
    const { error } = await supabase
      .from('service_categories')
      .delete()
      .eq('id', catId);
    if (error) throw error;
    await refresh();
    return 'ok';
  } catch (e) {
    console.error('[data] deleteCategory failed', e);
    return 'failed';
  }
}

// ── Soporte ──────────────────────────────────────────────────────────────────
export type DisputeOutcome = 'favor_cliente' | 'favor_tecnico' | 'desestimada';

/** Id del usuario con sesión (autor de notas, mensajes y tickets). */
async function myId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error('Sesión expirada. Vuelve a iniciar sesión.');
  return id;
}

/**
 * Resuelve una disputa (RPC admin_resolve_dispute): estado, outcome, notas,
 * libera el hold interno, baja is_disputed de la orden y notifica a ambas
 * partes en una sola transacción.
 */
export async function resolveDispute(
  disputeId: string,
  outcome: DisputeOutcome,
  notes: string,
) {
  return mutate(
    async () => {
      const { error } = await supabase.rpc('admin_resolve_dispute', {
        p_dispute_id: disputeId,
        p_outcome: outcome,
        p_notes: notes.trim() || undefined,
      });
      if (error) throw error;
      return true;
    },
    e => pgMessage(e, 'No se pudo resolver la disputa.'),
  );
}

/** Escala la disputa a nivel 2: sigue abierta (in_review) y queda en la bitácora. */
export async function escalateDispute(disputeId: string) {
  return mutate(async () => {
    const { error } = await supabase
      .from('disputes')
      .update({ status: 'in_review' })
      .eq('id', disputeId);
    if (error) throw error;
    const { error: ne } = await supabase.rpc('add_admin_note', {
      p_entity_type: 'disputes',
      p_entity_id: disputeId,
      p_note: 'Escalada a nivel 2 — pendiente de revisión',
    });
    if (ne) throw ne;
    return true;
  }, 'No se pudo escalar la disputa.');
}

// ── Chat de una orden (tabla messages; se pide al abrir el chat) ────────────
export async function fetchOrderMessages(orderId: string): Promise<OrderMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('service_order_id', orderId)
    .order('created_at');
  if (error) throw error;
  return data ?? [];
}

/** Mensaje del admin en el chat de la orden (RLS: sender_id = auth.uid()). */
export async function sendMessage(orderId: string, body: string) {
  const text = body.trim();
  if (!text) return null;
  try {
    const { error } = await supabase.from('messages').insert({
      service_order_id: orderId,
      sender_id: await myId(),
      body: text,
    });
    if (error) throw error;
    return true;
  } catch (e) {
    console.error('[data] sendMessage', e);
    notifyError('No se pudo enviar el mensaje.');
    return null;
  }
}

// ── Notas internas (add_admin_note → admin_events; bitácora append-only) ────
export type NoteEntity = 'service_orders' | 'technicians' | 'profiles' | 'disputes';

export async function addNote(entityType: NoteEntity, entityId: string, text: string) {
  if (!text.trim()) return null;
  return mutate(
    async () => {
      const { error } = await supabase.rpc('add_admin_note', {
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_note: text.trim(),
      });
      if (error) throw error;
      return true;
    },
    e => pgMessage(e, 'No se pudo guardar la nota.'),
  );
}

// ── Tickets (support_tickets + ticket_messages) ─────────────────────────────
export async function createTicket(input: {
  subject: string;
  requester_id: string;
  order_id?: string | null;
  content?: string;
}): Promise<string | null> {
  return mutate(
    async () => {
      const me = await myId();
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          opened_by: me,
          client_id: input.requester_id,
          service_order_id: input.order_id ?? null,
          subject: input.subject.trim(),
        })
        .select('id')
        .single();
      if (error) throw error;
      const id = data.id;
      if (input.content?.trim()) {
        const { error: me2 } = await supabase.from('ticket_messages').insert({
          ticket_id: id,
          author_id: me,
          body: input.content.trim(),
        });
        if (me2) throw me2;
      }
      return id;
    },
    e => pgMessage(e, 'No se pudo crear el ticket.'),
  );
}

export async function setTicketStatus(ticketId: string, status: TicketStatus) {
  return mutate(
    async () => {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', ticketId);
      if (error) throw error;
      return true;
    },
    e => pgMessage(e, 'No se pudo actualizar el ticket.'),
  );
}
export const resolveTicket = (ticketId: string) => setTicketStatus(ticketId, 'resolved');
/** Reabre un ticket (Deshacer de "Marcar resuelto"). */
export const reopenTicket = (ticketId: string) => setTicketStatus(ticketId, 'pending');

/** Respuesta del admin: abierto → en espera; resuelto → se reabre. */
export async function replyTicket(ticketId: string, body: string) {
  const text = body.trim();
  if (!text) return null;
  const t = getTicket(ticketId);
  return mutate(
    async () => {
      const { error } = await supabase.from('ticket_messages').insert({
        ticket_id: ticketId,
        author_id: await myId(),
        body: text,
      });
      if (error) throw error;
      const next: TicketStatus | null =
        t?.status === 'open' || t?.status === 'resolved' || t?.status === 'closed'
          ? 'pending'
          : null;
      if (next) {
        const { error: se } = await supabase
          .from('support_tickets')
          .update({ status: next })
          .eq('id', ticketId);
        if (se) throw se;
      }
      return true;
    },
    e => pgMessage(e, 'No se pudo enviar la respuesta.'),
  );
}

// ── consola-d (catálogo / reportes / soporte / config) — bloque aditivo ─────
/** Tablas que el Catálogo necesita para derivar técnicos y rango por categoría. */
export const getCatalogData = () => ({
  techCategories: w().technicianCategories,
  rates: w().rates,
  orders: w().orders,
});

/** Órdenes, eventos y técnicos para Reportes (se filtran por periodo en lib). */
export const getReportData = () => ({
  orders: w().orders,
  payments: w().payments,
  events: w().events,
  technicians: w().technicians,
});

// RPC de reportes: null si falla, para que la pantalla caiga al cálculo desde
// el snapshot sin mentir.
type ReportFn =
  | 'admin_report_kpis'
  | 'admin_report_ticket_by_category'
  | 'admin_report_cold_zones'
  | 'admin_report_demand_heatmap';
async function reportRpc<F extends ReportFn>(
  fn: F,
  from: Date,
  to: Date,
  method: MethodFilter = 'all',
): Promise<Fn[F]['Returns'] | null> {
  if (MOCK) {
    await loadWorld(); // el reporte puede pedirse antes de que cargue el snapshot
    return mockReport(fn, from, to, method) as Fn[F]['Returns'] | null;
  }
  try {
    // p_method solo existe en kpis / ticket por categoría (null = todas).
    const withMethod =
      method !== 'all' && (fn === 'admin_report_kpis' || fn === 'admin_report_ticket_by_category');
    const { data, error } = await supabase.rpc(fn, {
      p_from: from.toISOString(),
      p_to: to.toISOString(),
      ...(withMethod ? { p_method: method } : {}),
    });
    if (error) {
      console.warn('[data]', fn, error);
      return null;
    }
    return data as Fn[F]['Returns'];
  } catch (e) {
    console.warn('[data]', fn, e);
    return null;
  }
}
/** Modo maqueta: los RPC de reportes calculados sobre el snapshot local. */
function mockReport(fn: ReportFn, from: Date, to: Date, method: MethodFilter) {
  const span = to.getTime() - from.getTime();
  const byOrder = groupByOrder(w().payments);
  const kpis = (a: number, b: number) => {
    const k = kpiWindow(w().orders, byOrder, a, b, method);
    const arrivals = w()
      .orders.filter(
        o =>
          ['paid', 'closed'].includes(o.status) &&
          o.paid_at &&
          Date.parse(o.paid_at) >= a &&
          Date.parse(o.paid_at) < b &&
          kpiWindow([o], byOrder, a, b, method).paid_orders > 0,
      )
      .flatMap(o => {
        const ev = (st: string) => w().events.find(e => e.service_order_id === o.id && e.to_status === st);
        const acc = ev('accepted');
        const ons = ev('onsite');
        return acc && ons ? [(Date.parse(ons.created_at) - Date.parse(acc.created_at)) / 1000] : [];
      });
    return {
      ...k,
      avg_arrival_seconds: arrivals.length ? arrivals.reduce((s, x) => s + x, 0) / arrivals.length : 0,
    };
  };
  if (fn === 'admin_report_kpis')
    return {
      current: kpis(from.getTime(), to.getTime()),
      previous: kpis(from.getTime() - span, from.getTime()),
    };
  if (fn === 'admin_report_ticket_by_category')
    return ticketByCategory(w().orders, byOrder, w().categories, from.getTime(), to.getTime(), method);
  if (fn === 'admin_report_cold_zones') return [];
  return null; // heatmap: la pantalla cae al cálculo desde el snapshot.
}
export type ReportKpis = {
  current: {
    orders: number;
    paid_orders: number;
    gmv_cents: number;
    avg_arrival_seconds: number;
  };
  previous: {
    orders: number;
    paid_orders: number;
    gmv_cents: number;
    avg_arrival_seconds: number;
  };
};
/** admin_report_kpis devuelve jsonb: su forma es la de ReportKpis. */
export const fetchReportKpis = async (from: Date, to: Date, method: MethodFilter = 'all') =>
  (await reportRpc('admin_report_kpis', from, to, method)) as ReportKpis | null;
export const fetchTicketByCategory = (from: Date, to: Date, method: MethodFilter = 'all') =>
  reportRpc('admin_report_ticket_by_category', from, to, method);
export const fetchColdZones = (from: Date, to: Date) =>
  reportRpc('admin_report_cold_zones', from, to);

// ── Pagos: tarifa base + efectivo ────────────────────────────────────────────
const personOrNull = (id: string | null) =>
  (id && (getProfile(id)?.full_name ?? getTechByUser(id)?.display_name)) || null;

/**
 * «Formas de pago» de una orden (RPC get_order_payment_summary). Si el RPC
 * falla (o en maqueta) se calcula con la orden y sus pagos del snapshot.
 */
export async function fetchOrderPaymentSummary(orderId: string): Promise<PaymentSummary | null> {
  const local = () => {
    const o = getRequest(orderId);
    return o ? buildPaymentSummary(o, getOrderPayments(orderId)) : null;
  };
  if (MOCK) return local();
  try {
    const { data, error } = await supabase.rpc('get_order_payment_summary', { p_order_id: orderId });
    if (error) throw error;
    return parsePaymentSummary(data) ?? local();
  } catch (e) {
    console.warn('[data] get_order_payment_summary', e);
    return local();
  }
}

/** Cola «Revisión de efectivo» (RPC admin_list_cash_reviews). null = no disponible. */
export async function fetchCashReviews(): Promise<CashReviewRow[] | null> {
  if (MOCK) {
    await loadWorld();
    return cashReviews(w().orders, groupByOrder(w().payments), personOrNull);
  }
  try {
    const { data, error } = await supabase.rpc('admin_list_cash_reviews');
    if (error) throw error;
    return data ?? [];
  } catch (e) {
    console.warn('[data] admin_list_cash_reviews', e);
    return null;
  }
}

/** Reporte «Efectivo por técnico» (finanzas). null = no disponible. */
export async function fetchCashByTechnician(from: Date, to: Date): Promise<CashTechRow[] | null> {
  if (MOCK) {
    await loadWorld();
    return cashByTechnician(w().payments, from.getTime(), to.getTime(), personOrNull);
  }
  try {
    const { data, error } = await supabase.rpc('admin_report_cash_by_technician', {
      p_from: from.toISOString(),
      p_to: to.toISOString(),
    });
    if (error) throw error;
    return data ?? [];
  } catch (e) {
    console.warn('[data] admin_report_cash_by_technician', e);
    return null;
  }
}

/** Reporte de pagos por servicio, paginado (`total` = total_count del servidor). */
export async function fetchPaymentsReport(
  from: Date,
  to: Date,
  f: PaymentsReportFilters,
  page: number,
  pageSize: number,
): Promise<{ rows: PaymentsReportRow[]; total: number } | null> {
  if (MOCK) {
    await loadWorld();
    const all = paymentsReport(
      w().orders,
      groupByOrder(w().payments),
      { category: id => w().categories.find(c => c.id === id)?.name ?? 'Servicio', person: personOrNull },
      from.getTime(),
      to.getTime(),
      f,
      pageSize,
      page * pageSize,
    );
    return { rows: all, total: all[0]?.total_count ?? 0 };
  }
  try {
    const { data, error } = await supabase.rpc('admin_report_payments', {
      p_from: from.toISOString(),
      p_to: to.toISOString(),
      p_only_review: f.onlyReview,
      p_limit: pageSize,
      p_offset: page * pageSize,
      ...(f.method !== 'all' ? { p_method: f.method } : {}),
      ...(f.cashStatus ? { p_cash_status: f.cashStatus } : {}),
    });
    if (error) throw error;
    const rows = data ?? [];
    return { rows, total: Number(rows[0]?.total_count ?? 0) };
  } catch (e) {
    console.warn('[data] admin_report_payments', e);
    return null;
  }
}

/** Exonera la tarifa base de una solicitud sin pagar (soporte; abre el despacho). */
export async function waiveBaseFee(orderId: string, reason: string) {
  const text = reason.trim();
  if (!text) {
    notifyError('Escribe el motivo de la exoneración.');
    return null;
  }
  if (MOCK) {
    const i = w().orders.findIndex(o => o.id === orderId);
    const o = w().orders[i];
    if (!o || o.status !== 'requested' || !['pending', 'failed'].includes(o.base_fee_status)) {
      notifyError('La orden no tiene una visita pendiente de pago.');
      return null;
    }
    const now = new Date().toISOString();
    w().orders[i] = {
      ...o,
      base_fee_status: 'waived',
      dispatch_status: o.dispatch_status === 'awaiting_payment' ? 'searching' : o.dispatch_status,
      updated_at: now,
    };
    w().payments.forEach((p, k) => {
      if (p.service_order_id === orderId && p.kind === 'base_fee' && ['pending', 'failed'].includes(p.status))
        w().payments[k] = { ...p, status: 'cancelled', updated_at: now };
    });
    bump();
    return true as const;
  }
  return mutate(
    async () => {
      const { error } = await supabase.rpc('admin_waive_base_fee', { p_order_id: orderId, p_reason: text });
      if (error) throw error;
      return true;
    },
    e => pgMessage(e, 'No se pudo exonerar la tarifa base.'),
  );
}

/**
 * Resuelve una revisión de efectivo (soporte o finanzas): confirmar lo del
 * técnico, ajustar el monto o «no se cobró» (el técnico asume el faltante).
 */
export async function resolveCashReview(
  orderId: string,
  outcome: ReviewOutcome,
  notes: string,
  receivedCents: number | null = null,
) {
  const problem = validateResolution({ outcome, notes, amountCents: receivedCents });
  if (problem) {
    notifyError(problem);
    return null;
  }
  if (MOCK) {
    const i = w().orders.findIndex(o => o.id === orderId);
    const pi = w().payments.findIndex(
      p => p.service_order_id === orderId && p.kind === 'quote' && p.review_status === 'open',
    );
    if (i < 0 || pi < 0) {
      notifyError('La orden no tiene una revisión de efectivo abierta.');
      return null;
    }
    const r = applyCashResolution(
      w().orders[i],
      w().payments[pi],
      outcome,
      notes,
      receivedCents,
      new Date().toISOString(),
      MOCK_ADMIN_ID,
    );
    w().orders[i] = r.order;
    w().payments[pi] = r.payment;
    bump();
    return r.payment;
  }
  return mutate(
    async () => {
      const { data, error } = await supabase.rpc('admin_resolve_cash_review', {
        p_order_id: orderId,
        p_outcome: outcome,
        p_notes: notes.trim(),
        ...(outcome === 'adjust_amount' && receivedCents != null ? { p_received_cents: receivedCents } : {}),
      });
      if (error) throw error;
      return data;
    },
    e => pgMessage(e, 'No se pudo resolver la revisión de efectivo.'),
  );
}

/**
 * ¿La sesión actual tiene un factor TOTP verificado? Supabase solo expone los
 * factores propios (listFactors), no los de otros admins. null = no se pudo leer.
 */
export async function getMyMfaVerified(): Promise<boolean | null> {
  try {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) return null;
    return (data?.totp ?? []).some(f => f.status === 'verified');
  } catch {
    return null;
  }
}
/** Id del usuario con sesión (para marcar "Tú" en Equipo). */
export async function getSessionUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}
// ── fin consola-d ────────────────────────────────────────────────────────────

/** Test hook: inject a world snapshot (see store.test.ts). */
export function __setWorldForTests(next: World) {
  world = next;
  useData.setState({ status: 'ready' });
}

export { CLIENT_ID, TECH_USER_ID };

// ── consola-b: Servicios y Clientes (ediciones, notas con Deshacer, evidencia)
// Bloque aditivo del rediseño; no cambia los mutators de arriba.

/** Edición de un servicio desde la consola (admin; RLS/guard lo permiten). */
export async function updateOrder(
  orderId: string,
  fields: {
    title?: string | null;
    description?: string | null;
    category_id?: string;
  },
) {
  return mutate(
    async () => {
      const patch: Database['public']['Tables']['service_orders']['Update'] = {
        ...fields,
      };
      const { error } = await supabase
        .from('service_orders')
        .update(patch)
        .eq('id', orderId);
      if (error) throw error;
      return true;
    },
    e => pgMessage(e, 'No se pudo guardar el servicio.'),
  );
}

/** Nombre y celular (E.164) de un perfil; el correo vive en auth.users. */
export async function updateProfile(
  userId: string,
  fields: { full_name?: string; phone?: string | null },
) {
  return mutate(
    async () => {
      const { error } = await supabase
        .from('profiles')
        .update(fields)
        .eq('id', userId);
      if (error) throw error;
      return true;
    },
    e =>
      pgCode(e) === '23514'
        ? 'El celular no tiene un formato válido (+52 y 10 dígitos).'
        : pgMessage(e, 'No se pudo guardar el perfil.'),
  );
}

export type OrderEvidence = {
  id: string;
  kind: string;
  is_final: boolean;
  created_at: string;
  url: string | null;
};

/** Fotos de relleno (SVG) para las solicitudes de la maqueta. */
function mockRequestPhotos(createdAt: string): OrderEvidence[] {
  const svg = (label: string, c1: string, c2: string) =>
    `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="640" height="480" fill="url(#g)"/><text x="320" y="250" font-family="sans-serif" font-size="30" fill="#ffffff" text-anchor="middle">${label}</text></svg>`,
    )}`;
  return [
    { id: 'mock-ph-1', kind: 'request', is_final: false, created_at: createdAt, url: svg('Foto 1 del cliente', '#3b82c4', '#0e2c56') },
    { id: 'mock-ph-2', kind: 'request', is_final: false, created_at: createdAt, url: svg('Foto 2 del cliente', '#18a66a', '#0e2c56') },
  ];
}

/**
 * Evidencia de un servicio con URLs firmadas (bucket privado job-evidence).
 * Fuera del snapshot: se pide al abrir el detalle.
 */
export async function listOrderEvidence(
  orderId: string,
): Promise<OrderEvidence[]> {
  if (MOCK) {
    // ponytail: la maqueta no tiene fotos salvo en solicitudes sin técnico (placeholders SVG).
    const o = getRequest(orderId);
    return o?.assignment_mode === 'admin' ? mockRequestPhotos(o.created_at) : [];
  }
  const { data, error } = await supabase
    .from('service_evidence')
    .select('id, kind, is_final, created_at, storage_path')
    .eq('service_order_id', orderId)
    .order('created_at');
  if (error) throw error;
  return Promise.all(
    (data ?? []).map(async e => {
      const { data: s } = await supabase.storage
        .from('job-evidence')
        .createSignedUrl(e.storage_path, 600);
      return {
        id: e.id,
        kind: e.kind,
        is_final: e.is_final,
        created_at: e.created_at,
        url: s?.signedUrl ?? null,
      };
    }),
  );
}
/** PDF mínimo (1 página en blanco) para los anexos de la maqueta. */
const MOCK_PDF_URL =
  'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgMjk1IDQyMF0+PmVuZG9iagp0cmFpbGVyPDwvUm9vdCAxIDAgUj4+CiUlRU9GCg==';

function mockQuoteAttachments(orderId: string): QuoteAttachment[] {
  const q = getQuote(orderId);
  if (!q) return [];
  const prev = getOrderQuotes(orderId)[1];
  const mk = (
    n: number,
    file_name: string,
    mime_type: string,
    size_bytes: number,
    url: string,
    mins: number,
    quoteId = q.id,
  ): QuoteAttachment => ({
    id: `mock-qa-${orderId}-${n}`,
    quote_id: quoteId,
    file_name,
    mime_type,
    size_bytes,
    created_at: new Date(Date.now() - mins * 60_000).toISOString(),
    uploaded_by: q.technician_id,
    storage_path: url,
    url: mime_type === 'application/pdf' ? null : url,
  });
  if (orderId === 'SVC-2851')
    return [
      ...(prev ? [mk(9, 'cotizacion-v1.pdf', 'application/pdf', 120_832, MOCK_PDF_URL, 95, prev.id)] : []),
      mk(1, 'presupuesto-materiales.pdf', 'application/pdf', 184_320, MOCK_PDF_URL, 40),
      mk(2, 'llave-angular-danada.jpg', 'image/jpeg', 912_384, '/landing/categorias/plomeria.jpg', 38),
      mk(3, 'cespol-fuga.jpg', 'image/jpeg', 1_258_291, '/landing/categorias/gas.jpg', 37),
    ];
  if (orderId === 'SVC-2835')
    return [mk(1, 'cotizacion-calentador.pdf', 'application/pdf', 96_256, MOCK_PDF_URL, 60 * 24 * 9)];
  return [];
}

/**
 * Anexos de la cotización de una orden (bucket privado quote-attachments).
 * Fuera del snapshot; las imágenes llevan URL firmada (10 min), los PDF la
 * piden al abrir (getQuoteAttachmentUrl). Solo lectura.
 */
export async function listQuoteAttachments(orderId: string): Promise<QuoteAttachment[]> {
  if (MOCK) return mockQuoteAttachments(orderId);
  const { data, error } = await supabase
    .from('service_quote_attachments')
    .select('id, quote_id, file_name, mime_type, size_bytes, created_at, uploaded_by, storage_path')
    .eq('service_order_id', orderId)
    .order('created_at');
  if (error) throw error;
  return Promise.all(
    (data ?? []).map(async a => ({
      ...a,
      url: isImageMime(a.mime_type)
        ? ((await supabase.storage.from('quote-attachments').createSignedUrl(a.storage_path, 600))
            .data?.signedUrl ?? null)
        : null,
    })),
  );
}

/** URL firmada (10 min) de un anexo para abrir/descargar en otra pestaña. */
export async function getQuoteAttachmentUrl(a: QuoteAttachment): Promise<string | null> {
  if (MOCK) {
    if (!a.storage_path.startsWith('data:')) return a.storage_path;
    // fetch(data:) lo bloquea la CSP (connect-src); se decodifica a mano.
    const bin = atob(a.storage_path.split(',')[1] ?? '');
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    return URL.createObjectURL(new Blob([bytes], { type: a.mime_type }));
  }
  const { data, error } = await supabase.storage
    .from('quote-attachments')
    .createSignedUrl(a.storage_path, 600);
  if (error || !data?.signedUrl) {
    notifyError('No se pudo abrir el anexo.');
    return null;
  }
  return data.signedUrl;
}
// ── fin consola-b ────────────────────────────────────────────────────────────

// ══ consola-c · extras (técnicos / regiones / finanzas) ═════════════════════
// Tablas que el snapshot principal no carga. Cada dominio carga por separado:
// si una falla (RLS, migración pendiente) solo ese bloque queda "no disponible"
// y el resto de la consola sigue funcionando.

export type TechDocument = Row<'technician_documents'>;
export type ClientDocument = Row<'client_documents'>;
export type TechnicianCompany = Row<'technician_companies'>;
export type PayoutRequest = Row<'payout_requests'>;
export type OrderRating = Row<'order_ratings'>;
export type WalletSummary = Database['public']['Views']['technician_wallet_summaries']['Row'];
export type TechLocation = Row<'technician_locations'>;
export type TechVehicle = Row<'technician_vehicles'>;
export type ToolCatalogItem = Row<'tool_catalog'>;
export type TechToolRow = Row<'technician_tools'>;
export type ZoneGeometry = { type: 'Polygon' | 'MultiPolygon'; coordinates: unknown };
/** Fila de admin_list_coverage_zones con el geojson (jsonb) ya acotado a su forma. */
export type CoverageZone = Omit<Fn['admin_list_coverage_zones']['Returns'][number], 'geojson'> & {
  /** ST_AsGeoJSON(geom): Polygon/MultiPolygon. */
  geojson: ZoneGeometry | null;
};

type ExtraKey = 'docs' | 'clientDocs' | 'companies' | 'payouts' | 'zones' | 'ratings' | 'wallets' | 'locations' | 'vehicles' | 'toolCatalog' | 'techTools' | 'companyTools' | 'toolAssignments';
interface ExtrasState {
  docs: TechDocument[];
  clientDocs: ClientDocument[];
  companies: TechnicianCompany[];
  payouts: PayoutRequest[];
  zones: CoverageZone[];
  ratings: OrderRating[];
  wallets: WalletSummary[];
  locations: TechLocation[];
  vehicles: TechVehicle[];
  toolCatalog: ToolCatalogItem[];
  techTools: TechToolRow[];
  companyTools: CompanyTool[];
  toolAssignments: ToolAssignment[];
  /** Dominios que no se pudieron leer (tabla ausente o sin permiso). */
  unavailable: Partial<Record<ExtraKey, boolean>>;
  loaded: boolean;
}

export const useExtras = create<ExtrasState>(() => ({
  docs: [],
  clientDocs: [],
  companies: [],
  payouts: [],
  zones: [],
  ratings: [],
  wallets: [],
  locations: [],
  vehicles: [],
  toolCatalog: [],
  techTools: [],
  companyTools: [],
  toolAssignments: [],
  unavailable: {},
  loaded: false,
}));

// Cada dominio es un cargador completo; las tablas pasan por fetchAllRows
// (páginas `(from, to)`) y las zonas por su RPC (geojson real).
const EXTRA_QUERIES: { [K in ExtraKey]: () => Promise<ExtrasState[K]> } = {
  docs: () =>
    fetchAllRows((a, b) =>
      supabase
        .from('technician_documents')
        .select('*')
        .order('created_at', { ascending: false })
        .range(a, b),
    ),
  clientDocs: () =>
    fetchAllRows((a, b) =>
      supabase
        .from('client_documents')
        .select('*')
        .order('created_at', { ascending: false })
        .range(a, b),
    ),
  companies: () =>
    fetchAllRows((a, b) =>
      supabase.from('technician_companies').select('*').order('name').range(a, b),
    ),
  payouts: () =>
    fetchAllRows((a, b) =>
      supabase
        .from('payout_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .range(a, b),
    ),
  zones: async () => {
    const { data, error } = await supabase.rpc('admin_list_coverage_zones');
    if (error) throw error;
    // geojson llega como jsonb: la RPC garantiza Polygon/MultiPolygon (o null).
    return (data ?? []).map(z => ({ ...z, geojson: z.geojson as ZoneGeometry | null }));
  },
  ratings: () =>
    fetchAllRows((a, b) =>
      supabase
        .from('order_ratings')
        .select('*')
        .order('created_at', { ascending: false })
        .range(a, b),
    ),
  wallets: () =>
    fetchAllRows((a, b) => supabase.from('technician_wallet_summaries').select('*').range(a, b)),
  locations: () =>
    fetchAllRows((a, b) => supabase.from('technician_locations').select('*').range(a, b)),
  vehicles: () =>
    fetchAllRows((a, b) =>
      supabase.from('technician_vehicles').select('*').order('created_at').range(a, b),
    ),
  toolCatalog: () =>
    fetchAllRows((a, b) =>
      supabase.from('tool_catalog').select('*').order('sort_order').order('name').range(a, b),
    ),
  techTools: () =>
    fetchAllRows((a, b) =>
      supabase.from('technician_tools').select('*').order('created_at').range(a, b),
    ),
  companyTools: () =>
    fetchAllRows((a, b) =>
      supabase.from('company_tools').select('*').order('created_at', { ascending: false }).range(a, b),
    ),
  toolAssignments: () =>
    fetchAllRows((a, b) =>
      supabase.from('company_tool_assignments').select('*').order('assigned_at', { ascending: false }).range(a, b),
    ),
};

let extrasInflight: Promise<void> | null = null;

/** Carga (o recarga) las tablas extra; cada una falla por separado. */
export function loadExtras(force = false): Promise<void> {
  if (MOCK) {
    if (useExtras.getState().loaded) return Promise.resolve();
    mockHistory ??= withHistory(demoWorld());
    useExtras.setState({
      loaded: true,
      ratings: mockHistory.ratings,
      clientDocs: mockHistory.clientDocuments,
      companies: mockHistory.companies,
      payouts: mockHistory.payouts,
      zones: mockHistory.zones,
      locations: mockHistory.locations,
      vehicles: mockHistory.vehicles,
      toolCatalog: mockHistory.toolCatalog,
      techTools: mockHistory.techTools,
      companyTools: mockHistory.companyTools,
      toolAssignments: mockHistory.toolAssignments,
    });
    return Promise.resolve();
  }
  if (extrasInflight) return extrasInflight;
  if (!force && useExtras.getState().loaded) return Promise.resolve();
  extrasInflight = (async () => {
    const keys = Object.keys(EXTRA_QUERIES) as ExtraKey[];
    const results = await Promise.all(
      keys.map(async k => {
        try {
          const rows: unknown[] = await EXTRA_QUERIES[k]();
          return [k, rows, false] as const;
        } catch (e) {
          console.warn(`[data] extras.${k} no disponible`, e);
          return [k, [] as unknown[], true] as const;
        }
      }),
    );
    const next: Partial<ExtrasState> = { unavailable: {}, loaded: true };
    for (const [k, rows, missing] of results) {
      (next as Record<string, unknown>)[k] = rows;
      if (missing) next.unavailable![k] = true;
    }
    useExtras.setState(next);
  })().finally(() => {
    extrasInflight = null;
  });
  return extrasInflight;
}

export const getTechDocuments = (techId: string) =>
  useExtras.getState().docs.filter(d => d.technician_id === techId);
export const getClientDocument = (clientId: string) =>
  useExtras.getState().clientDocs.find(d => d.client_id === clientId) ?? null;
/** Comprobantes de domicilio por revisar (los más antiguos primero). */
export const getPendingClientDocuments = () =>
  useExtras
    .getState()
    .clientDocs.filter(d => d.review_status === 'pending')
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
export const isAddressVerified = (clientId: string) =>
  getClientDocument(clientId)?.review_status === 'approved';
/** Vehículos del técnico: el principal primero. */
export const getTechVehicles = (techId: string) =>
  useExtras
    .getState()
    .vehicles.filter(v => v.technician_id === techId)
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.created_at.localeCompare(b.created_at));
export const getAllVehicles = () => useExtras.getState().vehicles;
export const getToolCatalog = () => useExtras.getState().toolCatalog;
export const getCatalogTool = (id: string | null | undefined) =>
  id ? (useExtras.getState().toolCatalog.find(t => t.id === id) ?? null) : null;
export const getAllTechTools = () => useExtras.getState().techTools;
/** Herramientas de un técnico ya resueltas contra el catálogo. */
export const getTechToolViews = (techId: string) => {
  const x = useExtras.getState();
  return resolveTechTools(x.techTools, x.toolCatalog, techId);
};
/** Técnicos distintos que tienen un ítem del catálogo. */
export const countToolTechs = (catalogId: string) => countCatalogTechs(useExtras.getState().techTools, catalogId);
export const getCompanies = () => useExtras.getState().companies;
export const getCompany = (id: string | null | undefined) =>
  id ? (useExtras.getState().companies.find(c => c.id === id) ?? null) : null;
/** Tipo del técnico y su empresa (solo admin; nunca llega a la app del cliente). */
export function getTechType(techId: string): { type: TechType; company: TechnicianCompany | null } {
  const t = getTechnician(techId);
  return { type: t?.technician_type ?? 'independent', company: getCompany(t?.company_id) };
}
/** Técnicos asignados a cada empresa. */
export const countCompanyTechs = (companyId: string) =>
  w().technicians.filter(t => t.company_id === companyId).length;
export const getTechLocation = (techId: string) =>
  useExtras.getState().locations.find(l => l.technician_id === techId) ?? null;
export const getTechRatings = (techId: string) =>
  useExtras.getState().ratings.filter(r => r.reviewee_id === techId);
export const getWallet = (techId: string) =>
  useExtras.getState().wallets.find(x => x.technician_id === techId) ?? null;

/** Radio de servicio del técnico en km (service_radius_m o el setting por defecto). */
export function getTechRadiusKm(techId: string): number {
  const m =
    getTechnician(techId)?.service_radius_m ?? getSettingInt('default_match_radius_m', 15000);
  return Math.round(m / 100) / 10;
}

/** Municipio base: zona asignada (technicians.zone_id) o ubicación registrada. */
export function getTechMunicipality(techId: string): string | null {
  const t = getTechnician(techId);
  const zone = t?.zone_id
    ? useExtras.getState().zones.find(z => z.id === t.zone_id)
    : null;
  return zone?.name ?? getTechLocation(techId)?.municipality ?? null;
}

/** URL firmada (10 min) de un documento KYC para abrirlo en otra pestaña. */
export async function getDocumentUrl(doc: TechDocument): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(doc.bucket_id)
    .createSignedUrl(doc.storage_path, 600);
  if (error || !data?.signedUrl) {
    notifyError('No se pudo abrir el documento.');
    return null;
  }
  return data.signedUrl;
}

/** URL firmada (10 min) del comprobante de domicilio de un cliente. */
export async function getClientDocumentUrl(doc: ClientDocument): Promise<string | null> {
  if (MOCK) {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300"><rect width="100%" height="100%" fill="#f4f6fa"/><text x="50%" y="50%" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#334">Comprobante de ejemplo (maqueta)</text></svg>';
    return URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  }
  const { data, error } = await supabase.storage
    .from(doc.bucket_id)
    .createSignedUrl(doc.storage_path, 600);
  if (error || !data?.signedUrl) {
    notifyError('No se pudo abrir el comprobante.');
    return null;
  }
  return data.signedUrl;
}

/**
 * Aprueba o rechaza el comprobante de domicilio (UPDATE sobre client_documents;
 * la RLS exige permiso kyc). Rechazar requiere un motivo no vacío.
 */
export async function reviewClientDocument(
  id: string,
  approve: boolean,
  notes?: string,
): Promise<true | null> {
  const reason = rejectionNotes(notes);
  if (!approve && !reason) {
    notifyError('Indica el motivo del rechazo.');
    return null;
  }
  const patch = {
    review_status: approve ? ('approved' as const) : ('rejected' as const),
    review_notes: approve ? null : reason,
    reviewed_at: new Date().toISOString(),
  };
  if (MOCK) {
    useExtras.setState(s => ({
      clientDocs: s.clientDocs.map(d =>
        d.id === id ? { ...d, ...patch, reviewed_by: 'mock-admin', updated_at: patch.reviewed_at } : d,
      ),
    }));
    return true;
  }
  return mutateExtras(
    async () => {
      const { data: auth } = await supabase.auth.getSession();
      const { error } = await supabase
        .from('client_documents')
        .update({ ...patch, reviewed_by: auth.session?.user.id ?? null })
        .eq('id', id);
      if (error) throw error;
      return true as const;
    },
    e => pgMessage(e, 'No se pudo guardar la revisión del comprobante.'),
  );
}

/** Cambia el tipo del técnico (RPC admin_set_technician_type; queda en la bitácora). */
export async function setTechnicianType(
  techId: string,
  type: TechType,
  companyId: string | null,
  note?: string,
): Promise<true | null> {
  if (!typeCompanyValid(type, companyId)) {
    notifyError('Un técnico Tercero requiere empresa; los demás no.');
    return null;
  }
  const cleanNote = note?.trim() || undefined;
  if (MOCK) {
    const arr = w().technicians;
    const i = arr.findIndex(t => t.id === techId);
    if (i < 0) return null;
    const prev = arr[i];
    arr[i] = { ...prev, technician_type: type, company_id: companyId };
    adminEvents = [
      ...adminEvents,
      {
        id: `mock-ae-${Date.now()}`,
        actor_id: 'mock-admin',
        entity_type: 'technician',
        entity_id: techId,
        event_type: 'technician_type_changed',
        payload: {
          from_type: prev.technician_type,
          to_type: type,
          from_company_id: prev.company_id,
          to_company_id: companyId,
          note: cleanNote ?? null,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    bump();
    return true;
  }
  return mutate(
    async () => {
      const { error } = await supabase.rpc('admin_set_technician_type', {
        p_technician_id: techId,
        p_type: type,
        p_company_id: companyId ?? undefined,
        p_note: cleanNote,
      });
      if (error) throw error;
      return true as const;
    },
    e => pgMessage(e, 'No se pudo cambiar el tipo de técnico.'),
  );
}

export interface CompanyInput {
  name: string;
  rfc?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
}

/** Alta o edición de una empresa de técnicos (RLS: permiso usuarios). */
export async function saveCompany(
  input: CompanyInput,
  id?: string | null,
): Promise<TechnicianCompany | null> {
  const row = {
    name: input.name.trim(),
    rfc: input.rfc?.trim() || null,
    contact_name: input.contact_name?.trim() || null,
    contact_phone: input.contact_phone?.trim() || null,
    contact_email: input.contact_email?.trim() || null,
  };
  if (!row.name) {
    notifyError('El nombre de la empresa es obligatorio.');
    return null;
  }
  const dup = (e: unknown) =>
    pgCode(e) === '23505' ? 'Ya existe una empresa con ese nombre.' : 'No se pudo guardar la empresa.';
  if (MOCK) {
    const list = useExtras.getState().companies;
    const key = row.name.toLowerCase();
    if (list.some(c => c.id !== id && c.name.trim().toLowerCase() === key)) {
      notifyError('Ya existe una empresa con ese nombre.');
      return null;
    }
    const now = new Date().toISOString();
    const prev = id ? list.find(c => c.id === id) : null;
    const next: TechnicianCompany = prev
      ? { ...prev, ...row, updated_at: now }
      : { id: `mock-co-${Date.now()}`, ...row, is_active: true, created_at: now, updated_at: now };
    useExtras.setState({
      companies: prev ? list.map(c => (c.id === id ? next : c)) : [...list, next],
    });
    return next;
  }
  try {
    const q = id
      ? supabase.from('technician_companies').update(row).eq('id', id)
      : supabase.from('technician_companies').insert(row);
    const { data, error } = await q.select().single();
    if (error) throw error;
    await loadExtras(true);
    return data;
  } catch (e) {
    console.error('[data] saveCompany', e);
    notifyError(dup(e));
    return null;
  }
}

/** Activa/desactiva una empresa (no se borran). */
export async function setCompanyActive(id: string, active: boolean): Promise<true | null> {
  if (MOCK) {
    useExtras.setState(s => ({
      companies: s.companies.map(c => (c.id === id ? { ...c, is_active: active } : c)),
    }));
    return true;
  }
  return mutateExtras(
    async () => {
      const { error } = await supabase
        .from('technician_companies')
        .update({ is_active: active })
        .eq('id', id);
      if (error) throw error;
      return true as const;
    },
    'No se pudo actualizar la empresa.',
  );
}

export interface VehicleInput {
  make: string;
  model: string;
  year: number;
  color: string;
  plate: string;
}

const vehicleSnap = (v: TechVehicle) => ({
  make: v.make,
  model: v.model,
  year: v.year,
  color: v.color,
  plate: v.plate,
  is_primary: v.is_primary,
});

function mockVehicleEvent(techId: string, type: string, before: TechVehicle | null, after: TechVehicle | null) {
  const now = new Date().toISOString();
  adminEvents = [
    ...adminEvents,
    {
      id: `mock-ae-${Date.now()}-${adminEvents.length}`,
      actor_id: 'mock-admin',
      entity_type: 'technician',
      entity_id: techId,
      event_type: type,
      payload: {
        before: before ? vehicleSnap(before) : null,
        after: after ? vehicleSnap(after) : null,
      },
      created_at: now,
      updated_at: now,
    },
  ];
}

/** Alta o edición de un vehículo del técnico (RLS: permiso usuarios). La placa se guarda normalizada. */
export async function saveVehicle(
  techId: string,
  input: VehicleInput,
  id?: string | null,
): Promise<true | null> {
  const row = {
    make: input.make.trim(),
    model: input.model.trim(),
    year: Math.trunc(input.year),
    color: input.color.trim(),
    plate: normalizePlate(input.plate),
  };
  if (!row.make || !row.model || !row.color || !isValidPlate(row.plate)) {
    notifyError('Revisa marca, modelo, color y placas (5 a 8 letras o números).');
    return null;
  }
  const dup = (e: unknown) =>
    pgCode(e) === '23505' ? 'Esas placas ya están registradas.' : pgMessage(e, 'No se pudo guardar el vehículo.');
  if (MOCK) {
    const list = useExtras.getState().vehicles;
    if (list.some(v => v.id !== id && normalizePlate(v.plate) === row.plate)) {
      notifyError('Esas placas ya están registradas.');
      return null;
    }
    const now = new Date().toISOString();
    const prev = id ? list.find(v => v.id === id) : null;
    const next: TechVehicle = prev
      ? { ...prev, ...row, updated_at: now }
      : {
          id: `mock-veh-${Date.now()}`,
          technician_id: techId,
          ...row,
          is_primary: !list.some(v => v.technician_id === techId),
          created_at: now,
          updated_at: now,
        };
    useExtras.setState({ vehicles: prev ? list.map(v => (v.id === id ? next : v)) : [...list, next] });
    mockVehicleEvent(techId, prev ? 'vehicle_updated' : 'vehicle_added', prev ?? null, next);
    bump();
    return true;
  }
  return mutateExtras(async () => {
    const q = id
      ? supabase.from('technician_vehicles').update(row).eq('id', id)
      : supabase.from('technician_vehicles').insert({ ...row, technician_id: techId });
    const { error } = await q;
    if (error) throw error;
    return true as const;
  }, dup);
}

/** Elimina un vehículo; si era el principal, el backend promueve el más reciente. */
export async function deleteVehicle(id: string): Promise<true | null> {
  if (MOCK) {
    const list = useExtras.getState().vehicles;
    const v = list.find(x => x.id === id);
    if (!v) return null;
    let rest = list.filter(x => x.id !== id);
    if (v.is_primary) {
      const heir = rest
        .filter(x => x.technician_id === v.technician_id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
      if (heir) rest = rest.map(x => (x.id === heir.id ? { ...x, is_primary: true } : x));
    }
    useExtras.setState({ vehicles: rest });
    mockVehicleEvent(v.technician_id, 'vehicle_removed', v, null);
    bump();
    return true;
  }
  return mutateExtras(async () => {
    const { error } = await supabase.from('technician_vehicles').delete().eq('id', id);
    if (error) throw error;
    return true as const;
  }, e => pgMessage(e, 'No se pudo eliminar el vehículo.'));
}

/** Marca un vehículo como principal (el backend desmarca los demás del técnico). */
export async function setPrimaryVehicle(id: string): Promise<true | null> {
  if (MOCK) {
    const list = useExtras.getState().vehicles;
    const v = list.find(x => x.id === id);
    if (!v) return null;
    const next = { ...v, is_primary: true, updated_at: new Date().toISOString() };
    useExtras.setState({
      vehicles: list.map(x =>
        x.id === id ? next : x.technician_id === v.technician_id ? { ...x, is_primary: false } : x,
      ),
    });
    mockVehicleEvent(v.technician_id, 'vehicle_updated', v, next);
    bump();
    return true;
  }
  return mutateExtras(async () => {
    const { error } = await supabase.from('technician_vehicles').update({ is_primary: true }).eq('id', id);
    if (error) throw error;
    return true as const;
  }, e => pgMessage(e, 'No se pudo marcar el vehículo como principal.'));
}

// ── Herramienta del técnico (catálogo + lo que tiene cada técnico) ───────────
let mockToolSeq = 0;
const mockToolId = (p: string) => `mock-${p}-${Date.now()}-${++mockToolSeq}`;

function mockToolEvent(techId: string, type: string, before: TechToolRow | null, after: TechToolRow | null) {
  const now = new Date().toISOString();
  const snap = (r: TechToolRow) => ({ catalog_id: r.catalog_id, custom_name: r.custom_name });
  adminEvents = [
    ...adminEvents,
    {
      id: mockToolId('ae'),
      actor_id: 'mock-admin',
      entity_type: 'technician',
      entity_id: techId,
      event_type: type,
      payload: { tool_id: (after ?? before)?.id ?? null, before: before ? snap(before) : null, after: after ? snap(after) : null },
      created_at: now,
      updated_at: now,
    },
  ];
}

export interface ToolInput {
  name: string;
  category_id: string | null;
}

/** Alta o edición (nombre/categoría) de un ítem del catálogo (RLS: permiso usuarios). */
export async function saveCatalogTool(input: ToolInput, id?: string | null): Promise<ToolCatalogItem | null> {
  const row = { name: input.name.trim().replace(/\s+/g, ' '), category_id: input.category_id || null };
  if (!row.name) {
    notifyError('El nombre de la herramienta es obligatorio.');
    return null;
  }
  const dup = (e: unknown) =>
    pgCode(e) === '23505' ? 'Ya existe una herramienta con ese nombre.' : 'No se pudo guardar la herramienta.';
  const list = useExtras.getState().toolCatalog;
  if (MOCK) {
    if (list.some(t => t.id !== id && normalizeToolName(t.name) === normalizeToolName(row.name))) {
      notifyError('Ya existe una herramienta con ese nombre.');
      return null;
    }
    const now = new Date().toISOString();
    const prev = id ? list.find(t => t.id === id) : null;
    const next: ToolCatalogItem = prev
      ? { ...prev, ...row, updated_at: now }
      : {
          id: mockToolId('tool'),
          ...row,
          is_active: true,
          sort_order: Math.max(0, ...list.map(t => t.sort_order)) + 10,
          created_at: now,
          updated_at: now,
        };
    useExtras.setState({ toolCatalog: prev ? list.map(t => (t.id === id ? next : t)) : [...list, next] });
    return next;
  }
  try {
    const q = id
      ? supabase.from('tool_catalog').update(row).eq('id', id)
      : supabase.from('tool_catalog').insert({ ...row, sort_order: Math.max(0, ...list.map(t => t.sort_order)) + 10 });
    const { data, error } = await q.select().single();
    if (error) throw error;
    await loadExtras(true);
    return data;
  } catch (e) {
    console.error('[data] saveCatalogTool', e);
    notifyError(dup(e));
    return null;
  }
}

/** Activa/desactiva un ítem del catálogo (no se borran). */
export async function setCatalogToolActive(id: string, active: boolean): Promise<true | null> {
  if (MOCK) {
    useExtras.setState(s => ({
      toolCatalog: s.toolCatalog.map(t => (t.id === id ? { ...t, is_active: active } : t)),
    }));
    return true;
  }
  return mutateExtras(async () => {
    const { error } = await supabase.from('tool_catalog').update({ is_active: active }).eq('id', id);
    if (error) throw error;
    return true as const;
  }, 'No se pudo actualizar la herramienta.');
}

/** Quita una herramienta del técnico (queda en su bitácora como tool_removed). */
export async function removeTechTool(id: string): Promise<true | null> {
  if (MOCK) {
    const list = useExtras.getState().techTools;
    const r = list.find(x => x.id === id);
    if (!r) return null;
    useExtras.setState({ techTools: list.filter(x => x.id !== id) });
    mockToolEvent(r.technician_id, 'tool_removed', r, null);
    bump();
    return true;
  }
  return mutateExtras(async () => {
    const { error } = await supabase.from('technician_tools').delete().eq('id', id);
    if (error) throw error;
    return true as const;
  }, e => pgMessage(e, 'No se pudo quitar la herramienta.'));
}

/** Herramientas en texto libre por revisar (RPC admin_custom_tools); null = no disponible. */
export async function fetchCustomTools(): Promise<CustomToolSummary[] | null> {
  if (MOCK) return summarizeCustomTools(useExtras.getState().techTools);
  try {
    const { data, error } = await supabase.rpc('admin_custom_tools');
    if (error) throw error;
    return (data ?? []).map(d => ({
      name: d.name,
      technicians_count: Number(d.technicians_count),
      category_ids: d.category_ids ?? [],
      first_seen: d.first_seen,
    }));
  } catch (e) {
    console.warn('[data] admin_custom_tools no disponible', e);
    return null;
  }
}

/**
 * Convierte un texto libre en ítem del catálogo (RPC admin_promote_custom_tool):
 * crea o reutiliza el ítem y re-vincula a todos los técnicos que lo escribieron.
 */
export async function promoteCustomTool(
  customName: string,
  name: string,
  categoryId: string | null,
): Promise<ToolCatalogItem | null> {
  const finalName = name.trim().replace(/\s+/g, ' ');
  if (!finalName) {
    notifyError('El nombre final es obligatorio.');
    return null;
  }
  if (MOCK) {
    const x = useExtras.getState();
    const now = new Date().toISOString();
    let item = x.toolCatalog.find(t => normalizeToolName(t.name) === normalizeToolName(finalName));
    let catalog = x.toolCatalog;
    if (!item) {
      item = {
        id: mockToolId('tool'),
        name: finalName,
        category_id: categoryId,
        is_active: true,
        sort_order: Math.max(0, ...catalog.map(t => t.sort_order)) + 10,
        created_at: now,
        updated_at: now,
      };
      catalog = [...catalog, item];
    }
    const key = normalizeToolName(customName);
    const have = new Set(x.techTools.filter(r => r.catalog_id === item!.id).map(r => r.technician_id));
    const next: TechToolRow[] = [];
    for (const r of x.techTools) {
      if (r.catalog_id || !r.custom_name || normalizeToolName(r.custom_name) !== key) {
        next.push(r);
        continue;
      }
      if (have.has(r.technician_id)) {
        mockToolEvent(r.technician_id, 'tool_removed', r, null);
        continue; // el técnico ya tenía el ítem: se descarta el duplicado
      }
      have.add(r.technician_id);
      const linked = { ...r, catalog_id: item.id, custom_name: null, custom_category_id: null, updated_at: now };
      next.push(linked);
      mockToolEvent(r.technician_id, 'tool_updated', r, linked);
    }
    useExtras.setState({ toolCatalog: catalog, techTools: next });
    bump();
    return item;
  }
  return mutateExtras(
    async () => {
      const { data, error } = await supabase.rpc('admin_promote_custom_tool', {
        p_custom_name: customName,
        p_name: finalName,
        p_category_id: categoryId ?? undefined,
      });
      if (error) throw error;
      return data;
    },
    e => pgMessage(e, 'No se pudo convertir en catálogo.'),
  );
}

/** Tras escribir: recarga snapshot + extras. */
async function mutateExtras<R>(
  fn: () => Promise<R>,
  errMsg: string | ((e: unknown) => string),
): Promise<R | null> {
  const r = await mutate(fn, errMsg);
  if (r !== null) await loadExtras(true);
  return r;
}

export type PayoutBatch = Row<'payout_batches'>;

/**
 * Aprueba retiros pendientes en un lote (RPC approve_payout_requests). Los técnicos con fondos en disputa quedan `held` dentro del mismo
 * lote en vez de aprobarse: por eso el envío por Stripe se decide después,
 * leyendo el estado real de cada solicitud.
 */
export const approvePayouts = (ids: string[], note?: string) =>
  mutateExtras(
    async () => {
      const { data, error } = await supabase.rpc('approve_payout_requests', {
        p_request_ids: ids,
        p_note: note,
      });
      if (error) throw error;
      return data;
    },
    e => pgMessage(e, 'No se pudo aprobar el retiro.'),
  );

/** Rechaza (cancela) una solicitud pendiente o retenida. */
export const rejectPayout = (id: string) =>
  mutateExtras(
    async () => {
      const { error } = await supabase.rpc('cancel_payout_request', { p_request_id: id });
      if (error) throw error;
      return true;
    },
    e => pgMessage(e, 'No se pudo rechazar el retiro.'),
  );

/** Envía por Stripe un retiro ya `approved` (edge function stripe-create-payout). */
export const sendPayout = (id: string) => {
  const req = useExtras.getState().payouts.find(p => p.id === id);
  if (req && req.status !== 'approved') {
    notifyError('Solo se envían retiros aprobados (los retenidos esperan a la disputa).');
    return Promise.resolve(null);
  }
  return mutateExtras(
    async () => {
      const { data, error } = await supabase.functions.invoke(
        'stripe-create-payout',
        { body: { payout_request_id: id } },
      );
      if (error) throw error;
      return data ?? true;
    },
    'No se pudo enviar el retiro por Stripe. Revisa la cuenta conectada del técnico.',
  );
};

/**
 * Revisión por documento (antecedentes, domicilio, carátula): escribe
 * review_status/review_notes/reviewed_by/reviewed_at en technician_documents
 * antes de resolver el KYC del técnico.
 */
export const reviewDocument = (
  docId: string,
  status: 'approved' | 'rejected',
  notes?: string,
) =>
  mutateExtras(
    async () => {
      const { data: auth } = await supabase.auth.getSession();
      const { error } = await supabase
        .from('technician_documents')
        .update({
          review_status: status,
          review_notes: notes?.trim() || null,
          reviewed_by: auth.session?.user.id ?? null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', docId);
      if (error) throw error;
      return true;
    },
    e => pgMessage(e, 'No se pudo guardar la revisión del documento.'),
  );

/** Crea o edita una zona (RPC upsert_coverage_zone: GeoJSON Polygon/MultiPolygon). */
export const saveZone = (z: {
  id?: string | null;
  slug: string;
  name: string;
  geojson: ZoneGeometry;
  is_active: boolean;
}) =>
  mutateExtras(
    async () => {
      const { error } = await supabase.rpc('upsert_coverage_zone', {
        p_slug: z.slug,
        p_name: z.name,
        // GeoJSON es Json válido; el tipo generado solo conoce `Json`.
        p_geojson: z.geojson as unknown as Json,
        p_is_active: z.is_active,
        p_id: z.id ?? undefined,
      });
      if (error) throw error;
      return true;
    },
    e =>
      pgCode(e) === '23505'
        ? 'Ya existe una zona con ese slug.'
        : pgMessage(e, 'No se pudo guardar la zona (¿GeoJSON válido?).'),
  );

/** Activa/pausa una zona: mismo upsert con su geometría actual. */
export const setZoneActive = (id: string, active: boolean) => {
  const z = useExtras.getState().zones.find(x => x.id === id);
  if (!z?.geojson) {
    notifyError('La zona no tiene geometría; edítala e importa su GeoJSON.');
    return Promise.resolve(null);
  }
  return saveZone({ id, slug: z.slug, name: z.name, geojson: z.geojson, is_active: active });
};

/** Asigna la zona base de un técnico (RPC assign_technician_zone). */
export const assignTechZone = (techId: string, zoneId: string) =>
  mutateExtras(
    async () => {
      const { error } = await supabase.rpc('assign_technician_zone', {
        p_technician_id: techId,
        p_zone_id: zoneId,
      });
      if (error) throw error;
      return true;
    },
    e => pgMessage(e, 'No se pudo asignar la zona al técnico.'),
  );

export type DemandCell = Fn['admin_report_demand_heatmap']['Returns'][number];
/** Demanda por día de la semana × hora (RPC admin_report_demand_heatmap, hora ZMG). */
export const fetchDemandHeatmap = (from: Date, to: Date) =>
  reportRpc('admin_report_demand_heatmap', from, to);

/** Edita el perfil público del técnico (nombre visible y bio) y su nombre. */
export async function updateTechnicianProfile(
  techId: string,
  input: { full_name: string; display_name: string; bio: string | null },
) {
  return mutate(
    async () => {
      const { error: pe } = await supabase
        .from('profiles')
        .update({ full_name: input.full_name })
        .eq('id', techId);
      if (pe) throw pe;
      const { error } = await supabase
        .from('technicians')
        .update({ display_name: input.display_name, bio: input.bio })
        .eq('id', techId);
      if (error) throw error;
      return true;
    },
    e => pgMessage(e, 'No se pudo guardar el perfil.'),
  );
}

/** Nombre de quien moderó (fallback si el perfil no está en el snapshot). */
export const getModeratorName = (id: string | null) =>
  (id && getProfile(id)?.full_name) || 'Admin';

/** Mock: ajusta rating_avg/count del técnico sin tocar el resto (sale/entra una calificación). */
function mockAdjustTechRating(techId: string, score: number, delta: 1 | -1) {
  world.technicians = world.technicians.map(t => {
    if (t.id !== techId) return t;
    const count = t.rating_count + delta;
    const sum = t.rating_avg * t.rating_count + score * delta;
    return { ...t, rating_count: Math.max(count, 0), rating_avg: count > 0 ? sum / count : 0 };
  });
}

function mockModerateRating(id: string, hide: { reason: RatingReason; note: string | null } | null): true | null {
  const list = useExtras.getState().ratings;
  const prev = list.find(r => r.id === id);
  if (!prev || !!prev.is_hidden === !!hide) return null;
  const now = new Date().toISOString();
  const next: OrderRating = hide
    ? { ...prev, is_hidden: true, hidden_reason: hide.reason, hidden_note: hide.note, hidden_by: 'demo-admin', hidden_at: now, updated_at: now }
    : { ...prev, is_hidden: false, hidden_reason: null, hidden_note: null, hidden_by: null, hidden_at: null, updated_at: now };
  useExtras.setState({ ratings: list.map(r => (r.id === id ? next : r)) });
  mockAdjustTechRating(prev.reviewee_id, prev.score, hide ? -1 : 1);
  adminEvents = [
    ...adminEvents,
    {
      id: `mock-ae-${Date.now()}-${adminEvents.length}`,
      actor_id: 'demo-admin',
      entity_type: 'technician',
      entity_id: prev.reviewee_id,
      event_type: hide ? 'rating_hidden' : 'rating_restored',
      payload: {
        rating_id: id,
        service_order_id: prev.service_order_id,
        score: prev.score,
        reason: hide?.reason ?? null,
        note: hide?.note ?? null,
        actor_id: 'demo-admin',
      },
      created_at: now,
      updated_at: now,
    },
  ];
  bump();
  return true;
}

/** Oculta una calificación (admin_hide_rating, permiso calificaciones). Nunca se borra. «Otro» exige nota. */
export async function hideRating(id: string, reason: RatingReason, note?: string): Promise<true | null> {
  const n = note?.trim() || null;
  if (ratingNoteRequired(reason) && !n) {
    notifyError('Escribe una nota para el motivo «Otro».');
    return null;
  }
  if (MOCK) return mockModerateRating(id, { reason, note: n });
  return mutateExtras(async () => {
    const { error } = await supabase.rpc('admin_hide_rating', {
      p_rating_id: id,
      p_reason: reason,
      ...(n ? { p_note: n } : {}),
    });
    if (error) throw error;
    return true as const;
  }, e => pgMessage(e, 'No se pudo ocultar la calificación.'));
}

/** Restaura una calificación oculta (admin_restore_rating). */
export async function restoreRating(id: string, note?: string): Promise<true | null> {
  const n = note?.trim() || null;
  if (MOCK) return mockModerateRating(id, null);
  return mutateExtras(async () => {
    const { error } = await supabase.rpc('admin_restore_rating', {
      p_rating_id: id,
      ...(n ? { p_note: n } : {}),
    });
    if (error) throw error;
    return true as const;
  }, e => pgMessage(e, 'No se pudo restaurar la calificación.'));
}
// ══ fin consola-c · extras ══════════════════════════════════════════════════

// ── Inventario de herramienta de la empresa ──────────────────────────────────
export type { CompanyTool, ToolAssignment, ByTechnicianRow, OutstandingRow } from '@/lib/inventory';

export const getCompanyTools = () => useExtras.getState().companyTools;
export const getCompanyTool = (id: string | null | undefined) =>
  id ? (useExtras.getState().companyTools.find(t => t.id === id) ?? null) : null;
const byAssigned = (a: ToolAssignment, b: ToolAssignment) => b.assigned_at.localeCompare(a.assigned_at);
export const getAllToolAssignments = () => useExtras.getState().toolAssignments;
/** Historial de una herramienta (más reciente primero). */
export const getToolAssignments = (toolId: string) =>
  useExtras.getState().toolAssignments.filter(a => a.tool_id === toolId).sort(byAssigned);
/** Lo que un técnico tiene (o tuvo) de la empresa (más reciente primero). */
export const getTechToolAssignments = (techId: string) =>
  useExtras.getState().toolAssignments.filter(a => a.technician_id === techId).sort(byAssigned);
export const getOpenToolAssignment = (toolId: string) =>
  openAssignment(useExtras.getState().toolAssignments, toolId);
export const personName = (id: string | null | undefined) =>
  (id && (getProfile(id)?.full_name ?? getTechByUser(id)?.display_name)) || null;
/** Técnicos a los que se puede asignar herramienta (no suspendidos). */
export const getAssignableTechnicians = () =>
  getTechniciansWithProfile()
    .filter(x => x.profile && x.profile.status !== 'suspended')
    .map(x => ({ id: x.tech.id, name: x.profile!.full_name ?? x.tech.display_name ?? 'Técnico' }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));

// Fotos de la maqueta: ruta → URL (las subidas de la sesión usan object URL).
const mockPhotos = new Map<string, string>();
const mockPhotoSvg = (name: string) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="100%" height="100%" fill="#e8eefb"/><text x="50%" y="54%" text-anchor="middle" font-family="sans-serif" font-size="56" font-weight="700" fill="#2b4fb4">${name
      .trim()
      .charAt(0)
      .toUpperCase()}</text></svg>`,
  );

/** URL firmada (10 min) de la foto en el bucket privado `company-tools`. */
export async function getToolPhotoUrl(path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  if (MOCK) {
    const t = useExtras.getState().companyTools.find(x => x.photo_path === path);
    return mockPhotos.get(path) ?? mockPhotoSvg(t?.name ?? '?');
  }
  const { data, error } = await supabase.storage.from('company-tools').createSignedUrl(path, 600);
  return error || !data?.signedUrl ? null : data.signedUrl;
}

export interface CompanyToolInput {
  name: string;
  category_id: string | null;
  catalog_id: string | null;
  brand: string;
  model: string;
  serial_or_code: string;
  /** YYYY-MM-DD */
  acquired_on: string | null;
  acquisition_cost_cents: number | null;
}

const MAX_PHOTO = 5 * 1024 * 1024;
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const invErr = (fallback: string) => (e: unknown) => {
  const code = pgCode(e);
  if (code === '23505') return 'Ese número de serie/código ya existe.';
  if (code === '42501') return 'Tu rol no puede operar el inventario.';
  if ((code === '22023' || code === '55000' || code === 'P0002') && typeof e === 'object' && e && 'message' in e)
    return String(e.message);
  return fallback;
};

function mockInvEvent(
  entity: 'company_tool' | 'technician',
  entityId: string,
  type: string,
  payload: Record<string, unknown>,
) {
  const now = new Date().toISOString();
  adminEvents = [
    ...adminEvents,
    {
      id: mockToolId('ae'),
      actor_id: MOCK_ADMIN_ID,
      entity_type: entity,
      entity_id: entityId,
      event_type: type,
      payload: payload as Json,
      created_at: now,
      updated_at: now,
    },
  ];
}

const patchTool = (id: string, patch: Partial<CompanyTool>) =>
  useExtras.setState(s => ({
    companyTools: s.companyTools.map(t => (t.id === id ? { ...t, ...patch, updated_at: new Date().toISOString() } : t)),
  }));

/**
 * Alta o edición. En un alta con foto el id se genera aquí para subir primero a
 * `company-tools/<id>/<archivo>` y luego llamar al RPC con ese `p_id`.
 */
export async function saveCompanyTool(
  input: CompanyToolInput,
  opts: { id?: string | null; photo?: File | null; keepPhoto?: string | null } = {},
): Promise<CompanyTool | null> {
  const row = {
    name: input.name.trim().replace(/\s+/g, ' '),
    serial_or_code: normalizeSerial(input.serial_or_code),
  };
  if (!row.name || !row.serial_or_code) {
    notifyError('Nombre y número de serie o código son obligatorios.');
    return null;
  }
  if (input.acquisition_cost_cents != null && !(input.acquisition_cost_cents >= 0)) {
    notifyError('El costo no es válido.');
    return null;
  }
  if (opts.photo && (opts.photo.size > MAX_PHOTO || !PHOTO_TYPES.includes(opts.photo.type))) {
    notifyError('La foto debe ser JPG, PNG, WEBP o HEIC de máximo 5 MB.');
    return null;
  }
  const id = opts.id ?? crypto.randomUUID();
  const prev = opts.id ? getCompanyTool(opts.id) : null;
  if (prev?.status === 'retired') {
    notifyError('Una herramienta dada de baja no se puede editar.');
    return null;
  }
  const clean = (t: string) => t.trim() || null;
  const fileName = opts.photo ? opts.photo.name.replace(/[^\w.-]+/g, '_').slice(-60) : null;
  const photoPath = opts.photo ? `${id}/${Date.now()}-${fileName}` : (opts.keepPhoto ?? null);
  const list = getCompanyTools();
  if (MOCK) {
    if (list.some(t => t.id !== id && normalizeSerial(t.serial_or_code) === row.serial_or_code)) {
      notifyError('Ese número de serie/código ya existe.');
      return null;
    }
    if (opts.photo && photoPath) mockPhotos.set(photoPath, URL.createObjectURL(opts.photo));
    const now = new Date().toISOString();
    const fields = {
      ...row,
      category_id: input.category_id,
      catalog_id: input.catalog_id,
      brand: clean(input.brand),
      model: clean(input.model),
      acquired_on: input.acquired_on,
      acquisition_cost_cents: input.acquisition_cost_cents,
      photo_path: photoPath,
    };
    const next: CompanyTool = prev
      ? { ...prev, ...fields, updated_at: now }
      : {
          id,
          ...fields,
          status: 'available',
          retired_reason: null,
          retired_note: null,
          retired_at: null,
          retired_by: null,
          created_at: now,
          updated_at: now,
        };
    useExtras.setState({ companyTools: prev ? list.map(t => (t.id === id ? next : t)) : [next, ...list] });
    mockInvEvent(
      'company_tool',
      id,
      prev ? 'tool_edited' : 'tool_created',
      prev ? { before: prev, after: next } : { name: next.name, serial_or_code: next.serial_or_code, category_id: next.category_id },
    );
    bump();
    return next;
  }
  const r = await mutateExtras(async () => {
    if (opts.photo && photoPath) {
      const up = await supabase.storage.from('company-tools').upload(photoPath, opts.photo, {
        contentType: opts.photo.type,
        upsert: false,
      });
      if (up.error) throw up.error;
    }
    const { data, error } = await supabase.rpc('admin_upsert_company_tool', {
      p_id: id,
      p_name: row.name,
      p_serial_or_code: row.serial_or_code,
      p_category_id: input.category_id ?? undefined,
      p_catalog_id: input.catalog_id ?? undefined,
      p_brand: clean(input.brand) ?? undefined,
      p_model: clean(input.model) ?? undefined,
      p_acquired_on: input.acquired_on ?? undefined,
      p_acquisition_cost_cents: input.acquisition_cost_cents ?? undefined,
      p_photo_path: photoPath ?? undefined,
    });
    if (error) throw error;
    return data;
  }, invErr('No se pudo guardar la herramienta.'));
  return r;
}

/** Asigna una herramienta disponible a un técnico (fecha, condición, nota). */
export async function assignCompanyTool(
  toolId: string,
  input: { technicianId: string; assignedAt: string; condition: InventoryCondition; note: string },
): Promise<true | null> {
  const tool = getCompanyTool(toolId);
  if (!tool || tool.status !== 'available') {
    notifyError('Solo se puede asignar una herramienta disponible.');
    return null;
  }
  const note = input.note.trim() || null;
  if (MOCK) {
    if (!getAssignableTechnicians().some(t => t.id === input.technicianId)) {
      notifyError('El técnico no existe o está suspendido.');
      return null;
    }
    const now = new Date().toISOString();
    const a: ToolAssignment = {
      id: mockToolId('cta'),
      tool_id: toolId,
      technician_id: input.technicianId,
      assigned_at: input.assignedAt,
      assigned_condition: input.condition,
      assigned_by: MOCK_ADMIN_ID,
      assign_note: note,
      returned_at: null,
      returned_condition: null,
      returned_by: null,
      return_note: null,
      created_at: now,
      updated_at: now,
    };
    useExtras.setState(s => ({ toolAssignments: [a, ...s.toolAssignments] }));
    patchTool(toolId, { status: 'assigned' });
    const tn = personName(input.technicianId);
    mockInvEvent('company_tool', toolId, 'tool_assigned', {
      assignment_id: a.id, technician_id: input.technicianId, technician_name: tn, condition: input.condition, assigned_at: input.assignedAt, note,
    });
    mockInvEvent('technician', input.technicianId, 'company_tool_assigned', {
      assignment_id: a.id, tool_id: toolId, tool_name: tool.name, serial_or_code: tool.serial_or_code, condition: input.condition,
    });
    bump();
    return true;
  }
  return mutateExtras(async () => {
    const { error } = await supabase.rpc('admin_assign_company_tool', {
      p_tool_id: toolId,
      p_technician_id: input.technicianId,
      p_assigned_at: input.assignedAt,
      p_condition: input.condition,
      p_note: note ?? undefined,
    });
    if (error) throw error;
    return true as const;
  }, invErr('No se pudo asignar la herramienta.'));
}

/** Registra la devolución; `toRepair` (o condición dañada) la deja en reparación. */
export async function returnCompanyTool(
  toolId: string,
  input: { returnedAt: string; condition: InventoryCondition; note: string; toRepair: boolean },
): Promise<true | null> {
  const open = getOpenToolAssignment(toolId);
  const tool = getCompanyTool(toolId);
  if (!open || !tool) {
    notifyError('La herramienta no está asignada.');
    return null;
  }
  const note = input.note.trim() || null;
  const toRepair = input.toRepair || input.condition === 'damaged';
  if (MOCK) {
    const now = new Date().toISOString();
    useExtras.setState(s => ({
      toolAssignments: s.toolAssignments.map(a =>
        a.id === open.id
          ? { ...a, returned_at: input.returnedAt, returned_condition: input.condition, returned_by: MOCK_ADMIN_ID, return_note: note, updated_at: now }
          : a,
      ),
    }));
    patchTool(toolId, { status: toRepair ? 'in_repair' : 'available' });
    const status = toRepair ? 'in_repair' : 'available';
    mockInvEvent('company_tool', toolId, 'tool_returned', {
      assignment_id: open.id, technician_id: open.technician_id, condition: input.condition, returned_at: input.returnedAt, new_status: status, note,
    });
    mockInvEvent('technician', open.technician_id, 'company_tool_returned', {
      assignment_id: open.id, tool_id: toolId, tool_name: tool.name, condition: input.condition, new_status: status,
    });
    bump();
    return true;
  }
  return mutateExtras(async () => {
    const { error } = await supabase.rpc('admin_return_company_tool', {
      p_tool_id: toolId,
      p_returned_at: input.returnedAt,
      p_condition: input.condition,
      p_note: note ?? undefined,
      p_to_repair: input.toRepair,
    });
    if (error) throw error;
    return true as const;
  }, invErr('No se pudo registrar la devolución.'));
}

/** Disponible ⇄ en reparación (no aplica si está asignada o dada de baja). */
export async function setCompanyToolRepair(toolId: string, inRepair: boolean, note = ''): Promise<true | null> {
  const tool = getCompanyTool(toolId);
  if (!tool || tool.status !== (inRepair ? 'available' : 'in_repair')) {
    notifyError('Transición de estado no válida.');
    return null;
  }
  const n = note.trim() || null;
  if (MOCK) {
    patchTool(toolId, { status: inRepair ? 'in_repair' : 'available' });
    mockInvEvent('company_tool', toolId, inRepair ? 'tool_repair_started' : 'tool_repair_finished', { note: n });
    bump();
    return true;
  }
  return mutateExtras(async () => {
    const { error } = await supabase.rpc('admin_set_company_tool_repair', {
      p_tool_id: toolId,
      p_in_repair: inRepair,
      p_note: n ?? undefined,
    });
    if (error) throw error;
    return true as const;
  }, invErr('No se pudo cambiar el estado de reparación.'));
}

/** Baja lógica con motivo (cierra la asignación abierta si la hay). Nunca borra. */
export async function retireCompanyTool(toolId: string, reason: RetireReason, note: string): Promise<true | null> {
  const tool = getCompanyTool(toolId);
  if (!tool || tool.status === 'retired') {
    notifyError('La herramienta ya está dada de baja.');
    return null;
  }
  const n = note.trim() || null;
  if (MOCK) {
    const open = getOpenToolAssignment(toolId);
    const now = new Date().toISOString();
    if (open) {
      const why = { damage: 'Baja por daño', loss: 'No devuelta: pérdida', theft: 'No devuelta: robo', end_of_life: 'Baja por fin de vida útil' }[reason];
      useExtras.setState(s => ({
        toolAssignments: s.toolAssignments.map(a =>
          a.id === open.id
            ? {
                ...a,
                returned_at: now,
                returned_condition: reason === 'damage' ? 'damaged' : a.assigned_condition,
                returned_by: MOCK_ADMIN_ID,
                return_note: [why, n].filter(Boolean).join(' — '),
                updated_at: now,
              }
            : a,
        ),
      }));
      mockInvEvent('technician', open.technician_id, 'company_tool_returned', {
        assignment_id: open.id, tool_id: toolId, tool_name: tool.name, new_status: 'retired', reason,
      });
    }
    patchTool(toolId, { status: 'retired', retired_reason: reason, retired_note: n, retired_at: now, retired_by: MOCK_ADMIN_ID });
    mockInvEvent('company_tool', toolId, 'tool_retired', { reason, note: n, assignment_id: open?.id ?? null, technician_id: open?.technician_id ?? null });
    bump();
    return true;
  }
  return mutateExtras(async () => {
    const { error } = await supabase.rpc('admin_retire_company_tool', {
      p_tool_id: toolId,
      p_reason: reason,
      p_note: n ?? undefined,
    });
    if (error) throw error;
    return true as const;
  }, invErr('No se pudo dar de baja la herramienta.'));
}

/** Reporte «Asignada por técnico» (RPC; en maqueta o si falla, calculado local). */
export async function fetchToolsByTechnician(): Promise<ByTechnicianRow[]> {
  const local = () => byTechnician(getCompanyTools(), getAllToolAssignments(), personName);
  if (MOCK) return local();
  const { data, error } = await supabase.rpc('admin_company_tools_by_technician');
  if (error) {
    console.warn('[data] admin_company_tools_by_technician', error);
    return local();
  }
  return (data ?? []).map(r => ({
    technician_id: r.technician_id,
    technician_name: r.technician_name,
    tools_count: Number(r.tools_count),
    total_value_cents: Number(r.total_value_cents),
    tools: ((r.tools ?? []) as ByTechnicianRow['tools']) ?? [],
  }));
}

/** Reporte «Pendiente de devolución» con filtro de antigüedad (días). */
export async function fetchToolsOutstanding(olderThanDays: number): Promise<OutstandingRow[]> {
  const local = () => outstanding(getCompanyTools(), getAllToolAssignments(), personName, olderThanDays);
  if (MOCK) return local();
  const { data, error } = await supabase.rpc('admin_company_tools_outstanding', { p_older_than_days: olderThanDays });
  if (error) {
    console.warn('[data] admin_company_tools_outstanding', error);
    return local();
  }
  return (data ?? []).map(r => ({ ...r, days_held: Number(r.days_held) }));
}
