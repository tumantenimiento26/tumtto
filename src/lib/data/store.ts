'use client';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import { mxDay } from '@/lib/dates';
import {
  emptyWorld,
  nextId,
  CLIENT_ID,
  TECH_USER_ID,
  ADMIN_ID,
  type World,
  type OrderStatus,
  type ServiceOrder,
  type ServiceCategory,
  type Note,
  type DemoPayout,
  type Ticket,
} from '@/lib/demo/world';

/**
 * Live data store for the admin console. Same selector/mutator API the pages
 * used against the demo world, but the world underneath is a snapshot loaded
 * from Supabase (admin RLS) and mutations write through to the backend.
 *
 * ponytail: fetch-all snapshot + full reload after each mutation — MVP volumes
 * are tiny; paginate per-domain when a table outgrows one request.
 *
 * Domains WITHOUT backend tables (messages, ratings, payouts, notes, tickets)
 * stay session-local in memory, exactly as the demo world had them — pending
 * backend migrations.
 */
type PlatformSetting = Database['public']['Tables']['platform_settings']['Row'];
type OrderInsert = Database['public']['Tables']['service_orders']['Insert'];

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

// In-memory-only domains survive snapshot reloads (same array refs).
const mem = emptyWorld();
let world: World = mem;
let settings: PlatformSetting[] = [];
let lastFetched = 0;

// Error surface: la consola registra toast.error aqui (admin-shell) — el store
// no importa componentes para poder correr en tests de node.
let notifyError: (msg: string) => void = msg => console.error('[data]', msg);
export function setErrorNotifier(fn: (msg: string) => void) {
  notifyError = fn;
}

const w = () => world;
const bump = () => useData.getState().bump();
const now = () => new Date().toISOString();

// Consultas sin tipar (tablas/RPC que `supabase.ts` aún no conoce o select
// dinámico). ponytail: regenerar los tipos (gen:types) y quitar los casts.
type RawResult = { data: unknown; error: unknown };
interface RawQuery extends PromiseLike<RawResult> {
  select(columns?: string): RawQuery;
  eq(column: string, value: unknown): RawQuery;
  gte(column: string, value: unknown): RawQuery;
  in(column: string, values: unknown[]): RawQuery;
  order(column: string, opts?: { ascending?: boolean }): RawQuery;
  range(from: number, to: number): RawQuery;
  insert(values: Record<string, unknown>): RawQuery;
  update(values: Record<string, unknown>): RawQuery;
  single(): RawQuery;
}
const rawFrom = (table: string) =>
  (supabase as unknown as { from: (t: string) => RawQuery }).from(table);
type LooseRpc = (
  fn: string,
  args?: Record<string, unknown>,
) => Promise<RawResult>;
// Función (no alias) para no tocar el cliente perezoso al importar el módulo.
const rawRpc: LooseRpc = (fn, args) =>
  (supabase.rpc as unknown as LooseRpc)(fn, args);

/** Tamaño de página de PostgREST (`max-rows`): una sola consulta nunca trae más. */
export const PAGE_SIZE = 1000;

/**
 * Pagina con `.range()` hasta recibir menos de PAGE_SIZE filas. Sin esto el
 * snapshot quedaba truncado en 1,000 filas por tabla sin avisar.
 */
export async function fetchAllRows<T>(
  page: (from: number, to: number) => PromiseLike<RawResult>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const chunk = (data ?? []) as T[];
    rows.push(...chunk);
    if (chunk.length < PAGE_SIZE) return rows;
  }
}

const DAY_MS = 864e5;
/** ISO de hace `days` días (límite de las tablas de bitácora). */
const sinceIso = (days: number) =>
  new Date(Date.now() - days * DAY_MS).toISOString();

/**
 * Tabla completa (paginada, orden estable por `id`). `since` acota por fecha
 * las tablas que crecen sin límite (eventos de estado, bitácora admin): la
 * consola solo necesita los últimos 90 días.
 */
export function fetchAll<K extends keyof Database['public']['Tables']>(
  table: K,
  select = '*',
  opts: { since?: [column: string, iso: string] } = {},
) {
  return fetchAllRows<Database['public']['Tables'][K]['Row']>((from, to) => {
    let q = rawFrom(table).select(select).order('id').range(from, to);
    if (opts.since) q = q.gte(opts.since[0], opts.since[1]);
    return q;
  });
}

let inflight: Promise<void> | null = null;
let rerun: Promise<void> | null = null;

/** Load (or reload) the world snapshot. Call once from the console shell. */
export function loadWorld(force = false): Promise<void> {
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
        fetchAll('service_order_status_events', '*', {
          since: ['created_at', sinceIso(90)],
        }),
        fetchAll('payments'),
        fetchAll('ledger_entries'),
        fetchAll('kyc_sessions'),
        fetchAll('disputes'),
        fetchAll('platform_settings'),
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
        // session-local domains keep their refs across reloads
        messages: mem.messages,
        ratings: mem.ratings,
        payouts: mem.payouts,
        notes: mem.notes,
        tickets: mem.tickets,
      };
      settings = platformSettings;
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

/**
 * Escritura secundaria (bitácora de eventos): si falla no se revierte la
 * principal, pero se avisa en vez de tragarse el error.
 */
async function sideWrite(
  p: PromiseLike<{ error: unknown }>,
  what: string,
): Promise<void> {
  const { error } = await p;
  if (error) {
    console.error('[data]', what, error);
    notifyError(`Se guardó, pero no se registró ${what}.`);
  }
}

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
/** Guarda un lote de settings en una sola llamada (upsert: crea la key si no existe). */
export async function saveSettings(
  entries: Record<string, number | string | boolean>,
) {
  return mutate(
    async () => {
      const rows = Object.entries(entries).map(([key, value]) => ({
        key,
        value,
      }));
      const { error } = await supabase
        .from('platform_settings')
        .upsert(rows, { onConflict: 'key' });
      if (error) throw error;
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
export const getQuote = (orderId: string) =>
  w().quotes.find(q => q.service_order_id === orderId) ?? null;
export const getQuoteItems = (quoteId: string) =>
  w().quoteItems.filter(i => i.quote_id === quoteId);
export const getMessages = (orderId: string) =>
  w()
    .messages.filter(m => m.order_id === orderId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
export const getPayment = (orderId: string) =>
  w().payments.find(p => p.service_order_id === orderId) ?? null;
export const getRating = (orderId: string) =>
  w().ratings.find(r => r.order_id === orderId) ?? null;

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
export const getNotes = (entityId: string) =>
  w()
    .notes.filter(n => n.entity_id === entityId)
    .sort(byNewest);
export const getTickets = () => [...w().tickets].sort(byNewest);
export const getTicket = (id: string) =>
  w().tickets.find(t => t.id === id) ?? null;
/** Badge del sidebar: disputas no resueltas + tickets sin resolver. */
export const getOpenSupportCount = () =>
  w().disputes.filter(d => d.status === 'open' || d.status === 'in_review')
    .length + w().tickets.filter(t => t.status !== 'resolved').length;

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
/** Todas las calificaciones (demo-only hasta leer order_ratings). */
export const getAllRatings = () => w().ratings;
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

export async function createRequest(
  input: Partial<OrderInsert> & { client_id: string; category_id: string },
): Promise<ServiceOrder | null> {
  return mutate(async () => {
    const addr = w().addresses.find(a => a.id === input.client_address_id);
    const ttlMin = getSettingInt('request_ttl_minutes', 30);
    const insert: OrderInsert = {
      client_id: input.client_id,
      category_id: input.category_id,
      client_address_id: input.client_address_id ?? null,
      status: 'requested',
      title: input.title ?? null,
      description: input.description ?? null,
      is_urgent: input.is_urgent ?? false,
      urgent_surcharge_bps: input.is_urgent
        ? getSettingInt('urgent_surcharge_bps', 2000)
        : 0,
      commission_bps: getSettingInt('commission_bps', 1500),
      location: toGeography(addr?.location ?? input.location),
      place_name: addr?.place_name ?? null,
      address_line: addr?.address_line ?? input.address_line ?? null,
      neighborhood: addr?.neighborhood ?? null,
      municipality: addr?.municipality ?? 'Guadalajara',
      state: addr?.state ?? 'Jalisco',
      postal_code: addr?.postal_code ?? null,
      expires_at: new Date(Date.now() + ttlMin * 60_000).toISOString(),
    };
    const { data, error } = await supabase
      .from('service_orders')
      .insert(insert)
      .select()
      .single();
    if (error) throw error;
    await sideWrite(
      supabase.from('service_order_status_events').insert({
        service_order_id: data.id,
        from_status: null,
        to_status: 'requested',
        actor_id: input.client_id,
        note: 'Creado por admin desde la consola',
      }),
      'el evento de creación',
    );
    return data;
  }, 'No se pudo crear el servicio.');
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
  }, 'No se pudo cambiar el estado.');
}

export async function reassignRequest(orderId: string, techUserId: string) {
  // Reasignación + evento de estado en una sola transacción (antes el evento
  // podía fallar en silencio).
  return mutate(
    async () => {
      const name = getProfile(techUserId)?.full_name ?? techUserId;
      const { error } = await supabase.rpc('admin_reassign_order', {
        p_order_id: orderId,
        p_technician_id: techUserId,
        p_note: `Reasignado a ${name} por admin`,
      });
      if (error) throw error;
      return true;
    },
    e => pgMessage(e, 'No se pudo reasignar el servicio.'),
  );
}

/**
 * Reembolso real: la Edge Function reembolsa en Stripe (tarjeta) y luego, en
 * una transacción, marca el pago `refunded`, revierte el ledger y cancela la
 * orden. En efectivo solo aplica el ajuste contable. Antes solo cambiaba el
 * estado del pago en dos escrituras sueltas y no devolvía dinero.
 */
export async function refundPayment(orderId: string, reason?: string) {
  const pay = getPayment(orderId);
  if (!pay || pay.status !== 'paid') return null;
  return mutate(async () => {
    const { data, error } = await supabase.functions.invoke(
      'stripe-refund-order',
      { body: { service_order_id: orderId, reason } },
    );
    if (error) throw error;
    return data ?? pay;
  }, 'No se pudo emitir el reembolso. Nada se cobró ni se canceló; reintenta.');
}

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

/** Rechaza el KYC guardando el motivo como nota interna del técnico. */
export async function rejectKyc(techId: string, reason: string) {
  const r = await resolveKyc(techId, false, reason);
  // La nota solo si el rechazo sí quedó guardado.
  if (r !== null) addNote(techId, `KYC rechazado — ${reason}`);
  return r;
}

// Suspensión: profiles.status (+ technicians.is_available al suspender a un
// técnico) en una sola transacción vía admin_set_user_status.
const setUserStatus = (
  userId: string,
  status: 'active' | 'suspended',
  errMsg: string,
) =>
  mutate(
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
export async function inviteAdmin(email: string, fullName: string) {
  return mutate(async () => {
    const { data, error } = await supabase.functions.invoke('admin-users', {
      body: { action: 'invite', email, full_name: fullName || undefined },
    });
    if (error) throw error;
    return data ?? true;
  }, 'No se pudo enviar la invitación. Revisa el correo o si ya tiene cuenta.');
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
export async function resolveDispute(disputeId: string, resolution: string) {
  return mutate(async () => {
    const { data: session } = await supabase.auth.getSession();
    const { error } = await supabase
      .from('disputes')
      .update({
        status: 'resolved',
        resolution_notes: resolution,
        resolved_by: session?.session?.user.id ?? null,
        resolved_at: now(),
      })
      .eq('id', disputeId);
    if (error) throw error;
    return true;
  }, 'No se pudo resolver la disputa.');
}

/** Escala la disputa a nivel 2: sigue abierta (in_review), con nota. */
export async function escalateDispute(disputeId: string) {
  return mutate(async () => {
    const { error } = await supabase
      .from('disputes')
      .update({
        status: 'in_review',
        resolution_notes: 'Escalado a nivel 2 — pendiente de revisión',
      })
      .eq('id', disputeId);
    if (error) throw error;
    return true;
  }, 'No se pudo escalar la disputa.');
}

// ── Session-local domains (sin tabla en el backend todavía) ──────────────────
// ponytail: messages/ratings/payouts/notes/tickets no tienen tabla desplegada —
// viven en memoria de la sesión de la consola. Migraciones pendientes en
// tumtto-backend; al existir, estos mutators pasan a supabase.from(...).

export function sendMessage(
  orderId: string,
  senderId: string,
  content: string,
) {
  w().messages.push({
    id: nextId('m'),
    order_id: orderId,
    sender_id: senderId,
    content,
    created_at: now(),
  });
  bump();
}

export function addNote(
  entityId: string,
  text: string,
  author = 'Admin',
): Note {
  const note: Note = {
    id: nextId('n'),
    entity_id: entityId,
    author,
    text,
    created_at: now(),
  };
  w().notes.unshift(note);
  bump();
  return note;
}

export function createTicket(input: {
  subject: string;
  requester_id: string;
  role?: Ticket['role'];
  priority?: Ticket['priority'];
  order_id?: string | null;
  content?: string;
}): Ticket {
  const role =
    input.role ??
    (getProfile(input.requester_id)?.role === 'technician'
      ? 'tecnico'
      : 'cliente');
  const ticket: Ticket = {
    id: nextId('TK'),
    subject: input.subject,
    requester_id: input.requester_id,
    role,
    status: 'open',
    priority: input.priority ?? 'media',
    order_id: input.order_id ?? null,
    created_at: now(),
    messages: [],
  };
  if (input.content) {
    ticket.messages.push({
      id: nextId('tm'),
      ticket_id: ticket.id,
      sender_id: ADMIN_ID,
      content: input.content,
      created_at: now(),
    });
  }
  w().tickets.unshift(ticket);
  bump();
  return ticket;
}

export function replyTicket(
  ticketId: string,
  senderId: string,
  content: string,
) {
  const t = getTicket(ticketId);
  if (!t) return;
  t.messages.push({
    id: nextId('tm'),
    ticket_id: ticketId,
    sender_id: senderId,
    content,
    created_at: now(),
  });
  if (senderId === ADMIN_ID && t.status === 'open') t.status = 'pending';
  bump();
}

export function resolveTicket(ticketId: string) {
  const t = getTicket(ticketId);
  if (t) {
    t.status = 'resolved';
    bump();
  }
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
  events: w().events,
  technicians: w().technicians,
});

// Las RPC admin_report_* no están en los tipos generados de este repo todavía
// (regenerar con gen:types tras el deploy); llamada sin tipar y null si falla,
// para que la pantalla caiga al cálculo desde el snapshot sin mentir.
async function reportRpc<T>(
  fn: string,
  from: Date,
  to: Date,
): Promise<T | null> {
  try {
    const { data, error } = await rawRpc(fn, {
      p_from: from.toISOString(),
      p_to: to.toISOString(),
    });
    if (error) {
      console.warn('[data]', fn, error);
      return null;
    }
    return data as T;
  } catch (e) {
    console.warn('[data]', fn, e);
    return null;
  }
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
export const fetchReportKpis = (from: Date, to: Date) =>
  reportRpc<ReportKpis>('admin_report_kpis', from, to);
export const fetchTicketByCategory = (from: Date, to: Date) =>
  reportRpc<
    {
      category_id: string;
      category_name: string;
      paid_orders: number;
      avg_ticket_cents: number;
    }[]
  >('admin_report_ticket_by_category', from, to);
export const fetchColdZones = (from: Date, to: Date) =>
  reportRpc<{ zone_id: string; zone_name: string; order_count: number }[]>(
    'admin_report_cold_zones',
    from,
    to,
  );

/** Reabre un ticket (Deshacer de "Marcar resuelto"). Tickets: solo sesión. */
export function reopenTicket(ticketId: string) {
  const t = getTicket(ticketId);
  if (t && t.status === 'resolved') {
    t.status = 'pending';
    bump();
  }
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

export { CLIENT_ID, TECH_USER_ID, ADMIN_ID };

// ── consola-b: Servicios y Clientes (ediciones, notas con Deshacer, evidencia)
// Bloque aditivo del rediseño; no cambia los mutators de arriba.

/** Edición de un servicio desde la consola (admin; RLS/guard lo permiten). */
export async function updateOrder(
  orderId: string,
  fields: {
    title?: string | null;
    description?: string | null;
    is_urgent?: boolean;
    category_id?: string;
  },
) {
  return mutate(
    async () => {
      const patch: Database['public']['Tables']['service_orders']['Update'] = {
        ...fields,
      };
      if (fields.is_urgent !== undefined)
        patch.urgent_surcharge_bps = fields.is_urgent
          ? getSettingInt('urgent_surcharge_bps', 2000)
          : 0;
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

/** Quita una nota (sesión) y la regresa para poder deshacer. */
export function removeNote(noteId: string): Note | null {
  const i = w().notes.findIndex(n => n.id === noteId);
  if (i < 0) return null;
  const [n] = w().notes.splice(i, 1);
  bump();
  return n;
}

export function restoreNote(note: Note) {
  if (!w().notes.some(n => n.id === note.id)) w().notes.unshift(note);
  bump();
}

export type OrderEvidence = {
  id: string;
  kind: string;
  is_final: boolean;
  created_at: string;
  url: string | null;
};

/**
 * Evidencia de un servicio con URLs firmadas (bucket privado job-evidence).
 * Fuera del snapshot: se pide al abrir el detalle.
 */
export async function listOrderEvidence(
  orderId: string,
): Promise<OrderEvidence[]> {
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
// ── fin consola-b ────────────────────────────────────────────────────────────

// ══ consola-c · extras (técnicos / regiones / finanzas) ═════════════════════
// Tablas que el snapshot principal no carga y que el tipado generado aún no
// incluye (technician_documents, payout_requests, coverage_zones,
// order_ratings, technician_wallet_summaries, technician_locations). Cada
// dominio carga por separado: si una tabla no existe en el entorno (p. ej.
// producción sin las migraciones del PR #4) solo ese bloque queda
// "no disponible" y el resto de la consola sigue funcionando.
// ponytail: tablas sin tipos generados → consulta sin tipar y cast a la fila
// local; regenerar supabase.ts (gen:types) al desplegar y quitar RawQuery.

export interface TechDocument {
  id: string;
  technician_id: string;
  kind: 'criminal_record' | 'proof_of_address' | 'bank_statement';
  bucket_id: string;
  storage_path: string;
  issued_on: string | null;
  review_status: 'pending' | 'approved' | 'rejected';
  review_notes: string | null;
  created_at: string;
}
export interface PayoutRequest {
  id: string;
  technician_id: string;
  amount_cents: number;
  status:
    | 'pending'
    | 'approved'
    | 'processing'
    | 'paid'
    | 'failed'
    | 'cancelled'
    | 'held';
  stripe_account_id: string | null;
  failure_reason: string | null;
  approved_at: string | null;
  created_at: string;
}
export interface CoverageZone {
  id: string;
  slug: string;
  name: string;
  is_active: boolean;
}
export interface OrderRating {
  id: string;
  service_order_id: string;
  reviewer_id: string;
  reviewee_id: string;
  score: number;
  comment: string | null;
  created_at: string;
}
export interface WalletSummary {
  technician_id: string;
  balance_cents: number;
  held_cents: number;
  paid_out_cents: number;
  available_cents: number;
}
export type TechLocation = Database['public']['Tables']['technician_locations']['Row'];

type ExtraKey = 'docs' | 'payouts' | 'zones' | 'ratings' | 'wallets' | 'locations';
interface ExtrasState {
  docs: TechDocument[];
  payouts: PayoutRequest[];
  zones: CoverageZone[];
  ratings: OrderRating[];
  wallets: WalletSummary[];
  locations: TechLocation[];
  /** Dominios que no se pudieron leer (tabla ausente o sin permiso). */
  unavailable: Partial<Record<ExtraKey, boolean>>;
  loaded: boolean;
}

export const useExtras = create<ExtrasState>(() => ({
  docs: [],
  payouts: [],
  zones: [],
  ratings: [],
  wallets: [],
  locations: [],
  unavailable: {},
  loaded: false,
}));

// Cada dominio es una página `(from, to)`; fetchAllRows encadena las páginas.
const EXTRA_QUERIES: Record<ExtraKey, (from: number, to: number) => PromiseLike<RawResult>> = {
  docs: (a, b) =>
    rawFrom('technician_documents')
      .select(
        'id,technician_id,kind,bucket_id,storage_path,issued_on,review_status,review_notes,created_at',
      )
      .order('created_at', { ascending: false })
      .range(a, b),
  payouts: (a, b) =>
    rawFrom('payout_requests')
      .select(
        'id,technician_id,amount_cents,status,stripe_account_id,failure_reason,approved_at,created_at',
      )
      .order('created_at', { ascending: false })
      .range(a, b),
  // geom (PostGIS) no se pide: solo lo que la consola muestra.
  zones: (a, b) => rawFrom('coverage_zones').select('id,slug,name,is_active').range(a, b),
  ratings: (a, b) =>
    rawFrom('order_ratings')
      .select('id,service_order_id,reviewer_id,reviewee_id,score,comment,created_at')
      .order('created_at', { ascending: false })
      .range(a, b),
  wallets: (a, b) => rawFrom('technician_wallet_summaries').select('*').range(a, b),
  locations: (a, b) => rawFrom('technician_locations').select('*').range(a, b),
};

let extrasInflight: Promise<void> | null = null;

/** Carga (o recarga) las tablas extra; cada una falla por separado. */
export function loadExtras(force = false): Promise<void> {
  if (extrasInflight) return extrasInflight;
  if (!force && useExtras.getState().loaded) return Promise.resolve();
  extrasInflight = (async () => {
    const keys = Object.keys(EXTRA_QUERIES) as ExtraKey[];
    const results = await Promise.all(
      keys.map(async k => {
        try {
          const rows = await fetchAllRows<unknown>(EXTRA_QUERIES[k]);
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
export const getTechLocation = (techId: string) =>
  useExtras.getState().locations.find(l => l.technician_id === techId) ?? null;
export const getTechRatings = (techId: string) =>
  useExtras.getState().ratings.filter(r => r.reviewee_id === techId);
export const getWallet = (techId: string) =>
  useExtras.getState().wallets.find(x => x.technician_id === techId) ?? null;

/** Radio de servicio del técnico en km (columna del PR #4; default del setting). */
export function getTechRadiusKm(techId: string): number {
  const t = getTechnician(techId) as
    | (ReturnType<typeof getTechnician> & { service_radius_m?: number | null })
    | null;
  const m =
    t?.service_radius_m ?? getSettingInt('default_match_radius_m', 15000);
  return Math.round(m / 100) / 10;
}

/** Municipio base: zona asignada (technicians.zone_id) o ubicación registrada. */
export function getTechMunicipality(techId: string): string | null {
  const t = getTechnician(techId) as
    | (ReturnType<typeof getTechnician> & { zone_id?: string | null })
    | null;
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

/** Tras escribir: recarga snapshot + extras. */
async function mutateExtras<R>(
  fn: () => Promise<R>,
  errMsg: string | ((e: unknown) => string),
): Promise<R | null> {
  const r = await mutate(fn, errMsg);
  if (r !== null) await loadExtras(true);
  return r;
}

/** Aprueba un retiro pendiente (admin; RLS payout_requests_admin_update). */
export const approvePayout = (id: string) =>
  mutateExtras(
    async () => {
      const { data: auth } = await supabase.auth.getSession();
      const { error } = await rawFrom('payout_requests')
        .update({
          status: 'approved',
          approved_by: auth.session?.user.id ?? null,
          approved_at: now(),
        })
        .eq('id', id)
        .eq('status', 'pending');
      if (error) throw error;
      return true;
    },
    e => pgMessage(e, 'No se pudo aprobar el retiro.'),
  );

/** Envía un retiro aprobado por Stripe (edge function stripe-create-payout). */
export const sendPayout = (id: string) =>
  mutateExtras(
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

/** Activa/desactiva una zona de cobertura (admin; coverage_zones_admin). */
export const setZoneActive = (id: string, active: boolean) =>
  mutateExtras(
    async () => {
      const { error } = await rawFrom('coverage_zones')
        .update({ is_active: active })
        .eq('id', id);
      if (error) throw error;
      return true;
    },
    e => pgMessage(e, 'No se pudo actualizar la zona.'),
  );

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

// ══ fin consola-c · extras ══════════════════════════════════════════════════
