'use client';
import { create } from 'zustand';
import {
  demoWorld,
  resetDemoWorld,
  nextId,
  CLIENT_ID,
  TECH_USER_ID,
  ADMIN_ID,
  type RequestStatus,
  type ServiceRequest,
  type Rating,
  type Payment,
  type Subcategory,
  type Category,
  type Note,
  type Ticket,
} from './world';

/**
 * Demo control store. The dataset lives in `world.ts` (a shared in-memory
 * world); this store only holds the active role and a `tick` that components
 * subscribe to so a mutation anywhere re-renders every view. ponytail: no
 * service/store-per-domain layering on web — it's demo-only, selectors read the
 * world directly.
 */
export type Role = 'cliente' | 'tecnico' | 'admin';

interface DemoState {
  role: Role;
  tick: number;
  setRole: (r: Role) => void;
  reset: () => void;
  bump: () => void;
}

export const useDemo = create<DemoState>(set => ({
  role: 'cliente',
  tick: 0,
  setRole: role => set({ role }),
  reset: () => {
    resetDemoWorld();
    set(s => ({ tick: s.tick + 1 }));
  },
  bump: () => set(s => ({ tick: s.tick + 1 })),
}));

/** Subscribe to mutations: read `useTick()` in any component that shows world data. */
export const useTick = () => useDemo(s => s.tick);

const w = demoWorld;
const bump = () => useDemo.getState().bump();
const now = () => new Date().toISOString();

// ── Read selectors ───────────────────────────────────────────────────────────
export const getCategories = () => w().categories;
export const getSubcategories = (categoryId?: string) =>
  categoryId ? w().subcategories.filter(s => s.category_id === categoryId) : w().subcategories;
export const getTechnicians = () => w().technicians;
export const getProfile = (userId: string) => w().profiles.find(p => p.id === userId) ?? null;
export const getTechByUser = (userId: string) => w().technicians.find(t => t.user_id === userId) ?? null;
export const getAddresses = (userId = CLIENT_ID) => w().addresses.filter(a => a.user_id === userId);

export const getClientRequests = (clientId = CLIENT_ID) =>
  w().requests.filter(r => r.client_id === clientId).sort(byNewest);
export const getTechRequests = (techUserId = TECH_USER_ID) =>
  w().requests.filter(r => r.technician_id === techUserId).sort(byNewest);
export const getRequest = (id: string) => w().requests.find(r => r.id === id) ?? null;
export const getExtras = (requestId: string) => w().extras.filter(e => e.request_id === requestId);
export const getMessages = (requestId: string) =>
  w().messages.filter(m => m.request_id === requestId).sort((a, b) => a.created_at.localeCompare(b.created_at));
export const getPayment = (requestId: string) => w().payments.find(p => p.request_id === requestId) ?? null;
export const getRating = (requestId: string) => w().ratings.find(r => r.request_id === requestId) ?? null;

export const getPendingKyc = () => w().technicians.filter(t => t.kyc_status === 'pending_review');
export const getDisputes = (status?: string) =>
  status ? w().disputes.filter(d => d.status === status) : w().disputes;
export const getDocuments = (techId: string) => w().documents.filter(d => d.technician_id === techId);
export const getWallet = (techId: string) => w().wallets.find(x => x.technician_id === techId) ?? null;
export const getPayouts = (techId: string) => w().payouts.filter(p => p.technician_id === techId);
export const getAllPayouts = () => w().payouts;
export const getWalletTxns = (techId: string) => {
  const wallet = getWallet(techId);
  return wallet ? w().walletTxns.filter(t => t.wallet_id === wallet.id) : [];
};
export const getTechnician = (techId: string) => w().technicians.find(t => t.id === techId) ?? null;
export const getTechCategories = (techId: string) =>
  w().technicianCategories.filter(tc => tc.technician_id === techId);
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
export const getAllRequests = () => [...w().requests].sort(byNewest);
export const getAllPayments = () => w().payments;
export const getAllProfiles = () => w().profiles;
export const getClients = () => w().profiles.filter(p => p.role === 'cliente');
export const getAllDisputes = () => w().disputes;
export const getCategoriesWithCounts = () =>
  w().categories.map(c => {
    const subs = w().subcategories.filter(s => s.category_id === c.id).map(s => s.id);
    const count = w().requests.filter(r => subs.includes(r.subcategory_id)).length;
    return { ...c, services: count };
  });
export const getTechniciansWithProfile = () =>
  w().technicians.map(t => ({ tech: t, profile: getProfile(t.user_id) }));
export const getCoverage = () => w().coverage;
export const getAvailability = (techId: string) => w().availability.filter(a => a.technician_id === techId);

/** Dashboard / finance aggregates derived from the live world. */
export function getMetrics() {
  const reqs = w().requests;
  const pays = w().payments.filter(p => p.status === 'paid');
  const active = reqs.filter(r => ['aceptado', 'en_camino', 'en_sitio', 'en_ejecucion'].includes(r.status)).length;
  const completedToday = reqs.filter(r => ['completado', 'pagado', 'calificado'].includes(r.status)).length;
  const gmv = pays.reduce((s, p) => s + p.gross_amount, 0);
  const platformFee = pays.reduce((s, p) => s + p.platform_fee, 0);
  const techNet = pays.reduce((s, p) => s + p.technician_net, 0);
  const activeTechs = w().technicians.filter(t => t.is_available).length;
  const totalTechs = w().technicians.length;
  const byCategory = getCategoriesWithCounts().filter(c => c.services > 0);
  const byStatus = reqs.reduce<Record<string, number>>((m, r) => ((m[r.status] = (m[r.status] ?? 0) + 1), m), {});
  return { active, completedToday, gmv, platformFee, techNet, activeTechs, totalTechs, byCategory, byStatus, totalRequests: reqs.length };
}

// ── Mutators ─────────────────────────────────────────────────────────────────
export function createRequest(input: Partial<ServiceRequest> & { subcategory_id: string }): ServiceRequest {
  const req: ServiceRequest = {
    id: nextId('SVC'),
    client_id: CLIENT_ID,
    technician_id: TECH_USER_ID,
    subcategory_id: input.subcategory_id,
    region_id: null,
    status: 'solicitado',
    problem_description: input.problem_description ?? null,
    photos: input.photos ?? [],
    address_snapshot: input.address_snapshot ?? null,
    scheduled_at: input.scheduled_at ?? now(),
    base_price: input.base_price ?? null,
    total_price: null,
    created_at: now(),
    updated_at: now(),
  };
  w().requests.unshift(req);
  w().events.push({ id: nextId('ev'), request_id: req.id, status: 'solicitado', actor_id: CLIENT_ID, geo: null, note: null, created_at: now() });
  bump();
  return req;
}

export function setStatus(requestId: string, status: RequestStatus, actorId = TECH_USER_ID) {
  const req = getRequest(requestId);
  if (!req) return;
  req.status = status;
  req.updated_at = now();
  w().events.push({ id: nextId('ev'), request_id: requestId, status, actor_id: actorId, geo: null, note: null, created_at: now() });
  bump();
}

/** Advance a request to the next status in the happy-path lifecycle. */
const FLOW: RequestStatus[] = ['solicitado', 'aceptado', 'en_camino', 'en_sitio', 'en_ejecucion', 'completado', 'pagado', 'calificado'];
export function advance(requestId: string) {
  const req = getRequest(requestId);
  if (!req) return;
  const i = FLOW.indexOf(req.status);
  if (i >= 0 && i < FLOW.length - 1) setStatus(requestId, FLOW[i + 1]);
}

export function sendMessage(requestId: string, senderId: string, content: string) {
  w().messages.push({ id: nextId('m'), request_id: requestId, sender_id: senderId, content, attachments: [], is_flagged: false, created_at: now() });
  bump();
}

export function payRequest(requestId: string, method: Payment['method'], gross: number): Payment {
  const fee = Math.round(gross * 0.15);
  const pay: Payment = {
    id: nextId('pay'),
    request_id: requestId,
    method,
    provider: 'demo',
    provider_payment_id: nextId('pi'),
    status: 'paid',
    gross_amount: gross,
    platform_fee: fee,
    technician_net: gross - fee,
    paid_at: now(),
    created_at: now(),
    updated_at: now(),
  };
  w().payments.push(pay);
  const req = getRequest(requestId);
  if (req) req.total_price = gross;
  setStatus(requestId, 'pagado', CLIENT_ID);
  return pay;
}

export function submitRating(requestId: string, stars: number, comment: string, tags: string[]): Rating {
  const rating: Rating = { id: nextId('rt'), request_id: requestId, from_user_id: CLIENT_ID, to_user_id: TECH_USER_ID, stars, comment, tags, created_at: now() };
  w().ratings.push(rating);
  setStatus(requestId, 'calificado', CLIENT_ID);
  return rating;
}

export function resolveKyc(techId: string, approve: boolean) {
  const t = w().technicians.find(x => x.id === techId);
  if (!t) return;
  t.kyc_status = approve ? 'approved' : 'rejected';
  t.kyc_reviewed_by = ADMIN_ID;
  t.kyc_reviewed_at = now();
  bump();
}

/** Rechaza el KYC guardando el motivo como nota interna del técnico. */
export function rejectKyc(techId: string, reason: string) {
  addNote(techId, `KYC rechazado — ${reason}`, 'Sofía Admin');
  resolveKyc(techId, false);
}

/** Aprueba/rechaza un documento KYC individual. */
export function resolveDocument(docId: string, approve: boolean) {
  const d = w().documents.find(x => x.id === docId);
  if (!d) return;
  d.status = approve ? 'approved' : 'rejected';
  d.reviewed_by = ADMIN_ID;
  d.reviewed_at = now();
  bump();
}

// La suspensión de técnicos vive en profiles.status del usuario dueño.
export function suspendTechnician(techId: string) {
  const t = getTechnician(techId);
  if (!t) return;
  t.is_available = false;
  suspendUser(t.user_id);
}
export function reactivateTechnician(techId: string) {
  const t = getTechnician(techId);
  if (!t) return;
  t.is_available = true;
  reactivateUser(t.user_id);
}

export function suspendUser(userId: string) {
  const p = getProfile(userId);
  if (p) { p.status = 'suspended'; p.updated_at = now(); bump(); }
}
export function reactivateUser(userId: string) {
  const p = getProfile(userId);
  if (p) { p.status = 'active'; p.updated_at = now(); bump(); }
}

export function reassignRequest(requestId: string, techUserId: string) {
  const req = getRequest(requestId);
  if (!req) return;
  req.technician_id = techUserId;
  req.updated_at = now();
  const name = getProfile(techUserId)?.full_name ?? techUserId;
  w().events.push({ id: nextId('ev'), request_id: requestId, status: req.status, actor_id: ADMIN_ID, geo: null, note: `Reasignado a ${name} por admin`, created_at: now() });
  bump();
}

// ponytail: no hay estado 'reembolsado' en request_status — el reembolso marca
// el pago 'refunded' y cancela el servicio con nota en el evento.
export function refundPayment(requestId: string) {
  const pay = getPayment(requestId);
  if (!pay || pay.status !== 'paid') return null;
  pay.status = 'refunded';
  pay.updated_at = now();
  const req = getRequest(requestId);
  if (req) { req.status = 'cancelado'; req.updated_at = now(); }
  w().events.push({ id: nextId('ev'), request_id: requestId, status: 'cancelado', actor_id: ADMIN_ID, geo: null, note: 'Reembolso emitido al cliente', created_at: now() });
  bump();
  return pay;
}

/** Marca los payouts pendientes como procesados. Devuelve conteo y total. */
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
  return { count: pending.length, total: pending.reduce((s, p) => s + p.amount, 0) };
}

export function addNote(entityId: string, text: string, author = 'Sofía Admin'): Note {
  const note: Note = { id: nextId('n'), entity_id: entityId, author, text, created_at: now() };
  w().notes.unshift(note);
  bump();
  return note;
}

// ── Catálogo ─────────────────────────────────────────────────────────────────
export function upsertSubcategory(input: Partial<Subcategory> & { category_id: string; name: string }): Subcategory {
  const existing = input.id ? w().subcategories.find(s => s.id === input.id) : null;
  if (existing) {
    Object.assign(existing, input, { updated_at: now() });
    bump();
    return existing;
  }
  const sub: Subcategory = {
    id: nextId('sub'),
    category_id: input.category_id,
    name: input.name,
    description: input.description ?? null,
    price_min: input.price_min ?? 0,
    price_max: input.price_max ?? 0,
    base_price_suggested: input.base_price_suggested ?? 0,
    is_active: input.is_active ?? true,
    created_at: now(),
    updated_at: now(),
  };
  w().subcategories.push(sub);
  bump();
  return sub;
}

export function deleteSubcategory(subId: string) {
  const ws = w();
  ws.subcategories = ws.subcategories.filter(s => s.id !== subId);
  bump();
}

export function toggleCategory(catId: string) {
  const c = w().categories.find(x => x.id === catId);
  if (c) { c.is_active = !c.is_active; c.updated_at = now(); bump(); }
}

export function createCategory(name: string, icon = 'wrench'): Category {
  const cat: Category = { id: nextId('cat'), name, icon, description: null, is_active: true, created_at: now(), updated_at: now() };
  w().categories.push(cat);
  bump();
  return cat;
}

/** Elimina la categoría; falla (false) si aún tiene subcategorías. */
export function deleteCategory(catId: string): boolean {
  const ws = w();
  if (ws.subcategories.some(s => s.category_id === catId)) return false;
  ws.categories = ws.categories.filter(c => c.id !== catId);
  bump();
  return true;
}

// ── Soporte ──────────────────────────────────────────────────────────────────
export function resolveDispute(disputeId: string, resolution: string) {
  const d = w().disputes.find(x => x.id === disputeId);
  if (d) { d.status = 'resolved'; d.resolution = resolution; bump(); }
}

/** Escala la disputa a nivel 2: sigue abierta (in_review), con nota. */
export function escalateDispute(disputeId: string) {
  const d = w().disputes.find(x => x.id === disputeId);
  if (d) { d.status = 'in_review'; d.resolution = 'Escalado a nivel 2 — pendiente de revisión'; bump(); }
}

export function createTicket(input: {
  subject: string;
  requester_id: string;
  role?: Ticket['role'];
  priority?: Ticket['priority'];
  request_id?: string | null;
  content?: string;
}): Ticket {
  const role = input.role ?? (getProfile(input.requester_id)?.role === 'tecnico' ? 'tecnico' : 'cliente');
  const ticket: Ticket = {
    id: nextId('TK'),
    subject: input.subject,
    requester_id: input.requester_id,
    role,
    status: 'open',
    priority: input.priority ?? 'media',
    request_id: input.request_id ?? null,
    created_at: now(),
    messages: [],
  };
  if (input.content) {
    ticket.messages.push({ id: nextId('tm'), ticket_id: ticket.id, sender_id: ADMIN_ID, content: input.content, attachments: [], is_flagged: false, created_at: now() });
  }
  w().tickets.unshift(ticket);
  bump();
  return ticket;
}

export function replyTicket(ticketId: string, senderId: string, content: string) {
  const t = getTicket(ticketId);
  if (!t) return;
  t.messages.push({ id: nextId('tm'), ticket_id: ticketId, sender_id: senderId, content, attachments: [], is_flagged: false, created_at: now() });
  if (senderId === ADMIN_ID && t.status === 'open') t.status = 'pending';
  bump();
}

export function resolveTicket(ticketId: string) {
  const t = getTicket(ticketId);
  if (t) { t.status = 'resolved'; bump(); }
}

export { CLIENT_ID, TECH_USER_ID, ADMIN_ID };
