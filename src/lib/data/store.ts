'use client';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
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
/** True once the first snapshot loaded — replaces the demo's fake skeleton timers. */
export const useWorldReady = () => useData(s => s.status === 'ready' || s.status === 'error');

// In-memory-only domains survive snapshot reloads (same array refs).
const mem = emptyWorld();
let world: World = mem;
let settings: PlatformSetting[] = [];
let lastFetched = 0;

// Error surface: la consola registra toast.error aqui (admin-shell) — el store
// no importa componentes para poder correr en tests de node.
let notifyError: (msg: string) => void = msg => console.error('[data]', msg);
export function setErrorNotifier(fn: (msg: string) => void) { notifyError = fn; }

const w = () => world;
const bump = () => useData.getState().bump();
const now = () => new Date().toISOString();

async function fetchAll<K extends keyof Database['public']['Tables']>(table: K) {
  const { data, error } = await supabase.from(table).select('*');
  if (error) throw error;
  return (data ?? []) as unknown as Database['public']['Tables'][K]['Row'][];
}

let inflight: Promise<void> | null = null;

/** Load (or reload) the world snapshot. Call once from the console shell. */
export function loadWorld(force = false): Promise<void> {
  if (inflight) return inflight;
  if (!force && Date.now() - lastFetched < 15_000) return Promise.resolve();
  useData.setState(s => (s.status === 'ready' ? s : { ...s, status: 'loading' }));
  inflight = (async () => {
    try {
      const [
        profiles, categories, technicians, technicianCategories, rates, addresses,
        orders, quotes, quoteItems, events, payments, ledger, kycSessions, disputes, platformSettings,
      ] = await Promise.all([
        fetchAll('profiles'), fetchAll('service_categories'), fetchAll('technicians'),
        fetchAll('technician_categories'), fetchAll('technician_rates'), fetchAll('client_addresses'),
        fetchAll('service_orders'), fetchAll('service_quotes'), fetchAll('service_quote_items'),
        fetchAll('service_order_status_events'), fetchAll('payments'), fetchAll('ledger_entries'),
        fetchAll('kyc_sessions'), fetchAll('disputes'), fetchAll('platform_settings'),
      ]);
      world = {
        profiles, categories, technicians, technicianCategories, rates, addresses,
        orders, quotes, quoteItems, events, payments, ledger, kycSessions, disputes,
        // session-local domains keep their refs across reloads
        messages: mem.messages, ratings: mem.ratings, payouts: mem.payouts,
        notes: mem.notes, tickets: mem.tickets,
      };
      settings = platformSettings;
      lastFetched = Date.now();
      useData.setState({ status: 'ready' });
    } catch (e) {
      useData.setState({ status: 'error' });
      console.error('[data] loadWorld failed', e);
      notifyError('No se pudieron cargar los datos. Reintenta.');
    } finally {
      inflight = null;
      bump();
    }
  })();
  return inflight;
}

/** Reload after a write so every view reflects the backend. */
const refresh = () => loadWorld(true);

/** Wrap a backend write: on error toast + null, on success reload the snapshot. */
async function mutate<R>(fn: () => Promise<R>, errMsg: string): Promise<R | null> {
  try {
    const r = await fn();
    await refresh();
    return r;
  } catch (e) {
    console.error('[data]', errMsg, e);
    notifyError(errMsg);
    return null;
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
export async function saveSettings(entries: Record<string, number | string | boolean>) {
  return mutate(async () => {
    const rows = Object.entries(entries).map(([key, value]) => ({ key, value }));
    const { error } = await supabase.from('platform_settings').upsert(rows, { onConflict: 'key' });
    if (error) throw error;
    return true;
  }, 'No se pudo guardar la configuración.');
}
export const saveSettingInt = (key: string, value: number) => saveSettings({ [key]: value });

// ── Read selectors (unchanged API — they read the live snapshot) ─────────────
export const getCategories = () => w().categories;
export const getTechnicians = () => w().technicians;
export const getProfile = (userId: string) => w().profiles.find(p => p.id === userId) ?? null;
export const getTechByUser = (userId: string) => w().technicians.find(t => t.id === userId) ?? null;
export const getAddresses = (userId = CLIENT_ID) => w().addresses.filter(a => a.client_id === userId);

export const getClientRequests = (clientId = CLIENT_ID) =>
  w().orders.filter(r => r.client_id === clientId).sort(byNewest);
export const getTechRequests = (techUserId = TECH_USER_ID) =>
  w().orders.filter(r => r.technician_id === techUserId).sort(byNewest);
export const getRequest = (id: string) => w().orders.find(r => r.id === id) ?? null;
export const getQuote = (orderId: string) =>
  w().quotes.find(q => q.service_order_id === orderId) ?? null;
export const getQuoteItems = (quoteId: string) => w().quoteItems.filter(i => i.quote_id === quoteId);
export const getMessages = (orderId: string) =>
  w().messages.filter(m => m.order_id === orderId).sort((a, b) => a.created_at.localeCompare(b.created_at));
export const getPayment = (orderId: string) => w().payments.find(p => p.service_order_id === orderId) ?? null;
export const getRating = (orderId: string) => w().ratings.find(r => r.order_id === orderId) ?? null;

export const getPendingKyc = () =>
  w().technicians.filter(t => t.kyc_status === 'in_review' || t.kyc_status === 'pending');
export const getDisputes = (status?: string) =>
  status ? w().disputes.filter(d => d.status === status) : w().disputes;
export const getKycSessions = (techId: string) => w().kycSessions.filter(s => s.technician_id === techId);
export const getPayouts = (techId: string) => w().payouts.filter(p => p.technician_id === techId);
export const getAllPayouts = () => w().payouts;
export const getLedger = (techId: string) => w().ledger.filter(e => e.technician_id === techId);
export const getAllLedger = () => w().ledger;
export const getWalletBalanceCents = (techId: string) =>
  getLedger(techId).reduce((s, e) => s + e.amount_cents, 0);
export const getTechnician = (techId: string) => w().technicians.find(t => t.id === techId) ?? null;
export const getTechCategories = (techId: string) =>
  w().technicianCategories.filter(tc => tc.technician_id === techId);
export const getTechRates = (techId: string) => w().rates.filter(r => r.technician_id === techId);
export const getNotes = (entityId: string) =>
  w().notes.filter(n => n.entity_id === entityId).sort(byNewest);
export const getTickets = () => [...w().tickets].sort(byNewest);
export const getTicket = (id: string) => w().tickets.find(t => t.id === id) ?? null;
/** Badge del sidebar: disputas no resueltas + tickets sin resolver. */
export const getOpenSupportCount = () =>
  w().disputes.filter(d => d.status === 'open' || d.status === 'in_review').length +
  w().tickets.filter(t => t.status !== 'resolved').length;

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
  w().events.filter(e => e.service_order_id === orderId).sort((a, b) => a.created_at.localeCompare(b.created_at));
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
  const ACTIVE: OrderStatus[] = ['accepted', 'enroute', 'onsite', 'quote', 'working', 'closing'];
  const DONE: OrderStatus[] = ['completed', 'paid', 'closed'];
  const active = reqs.filter(r => ACTIVE.includes(r.status)).length;
  const completedToday = reqs.filter(r => DONE.includes(r.status)).length;
  const gmv = pays.reduce((s, p) => s + p.amount_cents, 0);
  const platformFee = pays.reduce((s, p) => s + p.commission_cents, 0);
  const techNet = pays.reduce((s, p) => s + (p.amount_cents - p.commission_cents), 0);
  const activeTechs = w().technicians.filter(t => t.is_available).length;
  const totalTechs = w().technicians.length;
  const byCategory = getCategoriesWithCounts().filter(c => c.services > 0);
  const byStatus = reqs.reduce<Record<string, number>>((m, r) => ((m[r.status] = (m[r.status] ?? 0) + 1), m), {});
  return { active, completedToday, gmv, platformFee, techNet, activeTechs, totalTechs, byCategory, byStatus, totalRequests: reqs.length };
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
      urgent_surcharge_bps: input.is_urgent ? getSettingInt('urgent_surcharge_bps', 2000) : 0,
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
    const { data, error } = await supabase.from('service_orders').insert(insert).select().single();
    if (error) throw error;
    await supabase.from('service_order_status_events').insert({
      service_order_id: data.id, from_status: null, to_status: 'requested',
      actor_id: input.client_id, note: 'Creado por admin desde la consola',
    });
    return data;
  }, 'No se pudo crear el servicio.');
}

export async function setStatus(orderId: string, status: OrderStatus, note: string | null = null) {
  return mutate(async () => {
    const { error } = await supabase.rpc('transition_service_order', {
      p_order_id: orderId, p_to_status: status, p_note: note ?? undefined,
    });
    if (error) throw error;
  }, 'No se pudo cambiar el estado.');
}

export async function reassignRequest(orderId: string, techUserId: string) {
  return mutate(async () => {
    const req = getRequest(orderId);
    const { error } = await supabase.from('service_orders')
      .update({ technician_id: techUserId }).eq('id', orderId);
    if (error) throw error;
    const name = getProfile(techUserId)?.full_name ?? techUserId;
    if (req) {
      await supabase.from('service_order_status_events').insert({
        service_order_id: orderId, from_status: req.status, to_status: req.status,
        actor_id: techUserId, note: `Reasignado a ${name} por admin`,
      });
    }
  }, 'No se pudo reasignar el servicio.');
}

// ponytail: no hay estado 'reembolsado' en service_order_status — el reembolso
// marca el pago 'refunded' y cancela el servicio con nota en el evento.
export async function refundPayment(orderId: string) {
  const pay = getPayment(orderId);
  if (!pay || pay.status !== 'paid') return null;
  return mutate(async () => {
    const { error } = await supabase.from('payments')
      .update({ status: 'refunded' }).eq('id', pay.id);
    if (error) throw error;
    const { error: e2 } = await supabase.rpc('transition_service_order', {
      p_order_id: orderId, p_to_status: 'cancelled', p_note: 'Reembolso emitido al cliente',
    });
    if (e2) throw e2;
    return pay;
  }, 'No se pudo emitir el reembolso.');
}

export async function resolveKyc(techId: string, approve: boolean) {
  return mutate(async () => {
    const status = approve ? 'approved' : 'declined';
    const { error } = await supabase.from('technicians')
      .update({ kyc_status: status }).eq('id', techId);
    if (error) throw error;
    // Keep the latest KYC session in sync when one exists.
    const s = getKycSessions(techId).sort(byNewest)[0];
    if (s) await supabase.from('kyc_sessions').update({ status }).eq('id', s.id);
  }, 'No se pudo actualizar el KYC.');
}

/** Rechaza el KYC guardando el motivo como nota interna del técnico. */
export async function rejectKyc(techId: string, reason: string) {
  addNote(techId, `KYC rechazado — ${reason}`);
  return resolveKyc(techId, false);
}

// La suspensión de técnicos vive en profiles.status del usuario dueño
// (technicians.id === profiles.id).
export async function suspendTechnician(techId: string) {
  return mutate(async () => {
    const { error } = await supabase.from('technicians')
      .update({ is_available: false }).eq('id', techId);
    if (error) throw error;
    const { error: e2 } = await supabase.from('profiles')
      .update({ status: 'suspended' }).eq('id', techId);
    if (e2) throw e2;
  }, 'No se pudo suspender al técnico.');
}
export async function reactivateTechnician(techId: string) {
  return mutate(async () => {
    const { error } = await supabase.from('technicians')
      .update({ is_available: true }).eq('id', techId);
    if (error) throw error;
    const { error: e2 } = await supabase.from('profiles')
      .update({ status: 'active' }).eq('id', techId);
    if (e2) throw e2;
  }, 'No se pudo reactivar al técnico.');
}

export async function suspendUser(userId: string) {
  return mutate(async () => {
    const { error } = await supabase.from('profiles')
      .update({ status: 'suspended' }).eq('id', userId);
    if (error) throw error;
  }, 'No se pudo suspender al usuario.');
}
export async function reactivateUser(userId: string) {
  return mutate(async () => {
    const { error } = await supabase.from('profiles')
      .update({ status: 'active' }).eq('id', userId);
    if (error) throw error;
  }, 'No se pudo reactivar al usuario.');
}

export async function upsertTechRate(
  techId: string,
  categoryId: string,
  cents: { visita_cents: number; hora_cents: number; minimo_cents: number },
) {
  return mutate(async () => {
    const { error } = await supabase.from('technician_rates')
      .upsert({ technician_id: techId, category_id: categoryId, ...cents }, { onConflict: 'technician_id,category_id' });
    if (error) throw error;
    return true;
  }, 'No se pudo guardar la tarifa.');
}

export async function updateTechnicianBank(techId: string, bank_name: string | null, clabe: string | null) {
  return mutate(async () => {
    const { error } = await supabase.from('technicians').update({ bank_name, clabe }).eq('id', techId);
    if (error) throw error;
    return true;
  }, 'No se pudieron guardar los datos bancarios.');
}

// ── Direcciones del cliente ──────────────────────────────────────────────────
type AddressFields = Pick<
  Database['public']['Tables']['client_addresses']['Insert'],
  'label' | 'address_line' | 'neighborhood' | 'municipality' | 'state' | 'postal_code' | 'is_default'
>;

/** Crea (sin addressId) o actualiza una dirección; si es principal, desmarca las demás. */
export async function saveAddress(clientId: string, fields: AddressFields, addressId?: string) {
  return mutate(async () => {
    if (fields.is_default) {
      const { error } = await supabase.from('client_addresses')
        .update({ is_default: false }).eq('client_id', clientId).eq('is_default', true);
      if (error) throw error;
    }
    const q = addressId
      ? await supabase.from('client_addresses').update(fields).eq('id', addressId)
      : await supabase.from('client_addresses').insert({ ...fields, client_id: clientId, location: toGeography(null) });
    if (q.error) throw q.error;
    return true;
  }, 'No se pudo guardar la dirección.');
}

export async function deleteAddress(addressId: string) {
  return mutate(async () => {
    const { error } = await supabase.from('client_addresses').delete().eq('id', addressId);
    if (error) throw error;
    return true;
  }, 'No se pudo eliminar la dirección (puede estar ligada a un servicio).');
}

// ── Catálogo (una sola capa: service_categories) ─────────────────────────────
export async function toggleCategory(catId: string) {
  const c = w().categories.find(x => x.id === catId);
  if (!c) return;
  return mutate(async () => {
    const { error } = await supabase.from('service_categories')
      .update({ is_active: !c.is_active }).eq('id', catId);
    if (error) throw error;
  }, 'No se pudo actualizar la categoría.');
}

export async function createCategory(name: string, icon = 'wrench'): Promise<ServiceCategory | null> {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return mutate(async () => {
    const { data, error } = await supabase.from('service_categories')
      .insert({ slug, name, icon, sort_order: (w().categories.length + 1) * 10 })
      .select().single();
    if (error) throw error;
    return data;
  }, 'No se pudo crear la categoría.');
}

export async function updateCategory(catId: string, input: Partial<ServiceCategory>) {
  return mutate(async () => {
    const { error } = await supabase.from('service_categories').update(input).eq('id', catId);
    if (error) throw error;
  }, 'No se pudo actualizar la categoría.');
}

/** Elimina la categoría; falla (false) si aún tiene servicios (FK). */
export async function deleteCategory(catId: string): Promise<boolean> {
  if (w().orders.some(r => r.category_id === catId)) return false;
  try {
    const { error } = await supabase.from('service_categories').delete().eq('id', catId);
    if (error) return false;
    await refresh();
    return true;
  } catch {
    return false;
  }
}

// ── Soporte ──────────────────────────────────────────────────────────────────
export async function resolveDispute(disputeId: string, resolution: string) {
  return mutate(async () => {
    const { data: session } = await supabase.auth.getSession();
    const { error } = await supabase.from('disputes').update({
      status: 'resolved', resolution_notes: resolution,
      resolved_by: session?.session?.user.id ?? null, resolved_at: now(),
    }).eq('id', disputeId);
    if (error) throw error;
  }, 'No se pudo resolver la disputa.');
}

/** Escala la disputa a nivel 2: sigue abierta (in_review), con nota. */
export async function escalateDispute(disputeId: string) {
  return mutate(async () => {
    const { error } = await supabase.from('disputes').update({
      status: 'in_review', resolution_notes: 'Escalado a nivel 2 — pendiente de revisión',
    }).eq('id', disputeId);
    if (error) throw error;
  }, 'No se pudo escalar la disputa.');
}

// ── Session-local domains (sin tabla en el backend todavía) ──────────────────
// ponytail: messages/ratings/payouts/notes/tickets no tienen tabla desplegada —
// viven en memoria de la sesión de la consola. Migraciones pendientes en
// tumtto-backend; al existir, estos mutators pasan a supabase.from(...).

export function sendMessage(orderId: string, senderId: string, content: string) {
  w().messages.push({ id: nextId('m'), order_id: orderId, sender_id: senderId, content, created_at: now() });
  bump();
}

export function addNote(entityId: string, text: string, author = 'Admin'): Note {
  const note: Note = { id: nextId('n'), entity_id: entityId, author, text, created_at: now() };
  w().notes.unshift(note);
  bump();
  return note;
}

/** Marca los payouts pendientes como procesados. Devuelve conteo y total (cents). */
export function processPayoutBatch() {
  const pending = w().payouts.filter(p => p.status === 'pending');
  const batch = `B-${new Date().toISOString().slice(0, 7)}`;
  for (const p of pending) {
    p.status = 'processed';
    p.processed_at = now();
    p.batch_id = batch;
    p.updated_at = now();
  }
  bump();
  return { count: pending.length, total: pending.reduce((s, p) => s + p.amount_cents, 0) };
}

export function createTicket(input: {
  subject: string;
  requester_id: string;
  role?: Ticket['role'];
  priority?: Ticket['priority'];
  order_id?: string | null;
  content?: string;
}): Ticket {
  const role = input.role ?? (getProfile(input.requester_id)?.role === 'technician' ? 'tecnico' : 'cliente');
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
    ticket.messages.push({ id: nextId('tm'), ticket_id: ticket.id, sender_id: ADMIN_ID, content: input.content, created_at: now() });
  }
  w().tickets.unshift(ticket);
  bump();
  return ticket;
}

export function replyTicket(ticketId: string, senderId: string, content: string) {
  const t = getTicket(ticketId);
  if (!t) return;
  t.messages.push({ id: nextId('tm'), ticket_id: ticketId, sender_id: senderId, content, created_at: now() });
  if (senderId === ADMIN_ID && t.status === 'open') t.status = 'pending';
  bump();
}

export function resolveTicket(ticketId: string) {
  const t = getTicket(ticketId);
  if (t) { t.status = 'resolved'; bump(); }
}

/** Test hook: inject a world snapshot (see store.test.ts). */
export function __setWorldForTests(next: World) {
  world = next;
  useData.setState({ status: 'ready' });
}

export { CLIENT_ID, TECH_USER_ID, ADMIN_ID };
