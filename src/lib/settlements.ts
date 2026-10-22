// Liquidaciones con el técnico (comisiones y efectivo), lógica pura probada en
// settlements.test.ts. Contrato: tumtto-backend/docs/settlements.md. Todo es
// manual y simulado: solo registra que el pago/entrega ocurrió.
// Incluye el motor en memoria del modo maqueta (espeja las 5 RPC).

export type TechKind = 'tumtto' | 'third_party' | 'independent';
export type PayoutMethod = 'transferencia' | 'efectivo' | 'otro';
export type DeliveryMethod = 'deposito' | 'efectivo' | 'transferencia';
export type SettlementKind = 'payout' | 'cash_delivery';

export interface BalanceRow {
  technician_id: string;
  technician_name: string;
  avatar_icon: string | null;
  technician_type: TechKind;
  owed_to_technician_cents: number;
  owed_to_admin_cents: number;
  net_cents: number;
  last_payout_at: string | null;
  last_delivery_at: string | null;
  pending_commissions_count: number;
  pending_cash_count: number;
}

export interface PendingCommission {
  order_id: string;
  folio: number;
  finished_at: string;
  gross_cents: number;
  commission_type: 'percent' | 'fixed';
  /** fixed: centavos · percent: puntos base (1000 = 10 %). */
  commission_value: number;
  commission_cents: number;
}

export interface PendingCash {
  payment_id: string;
  order_id: string;
  folio: number;
  collected_at: string;
  amount_cents: number;
}

export interface HistoryItem {
  kind: SettlementKind;
  id: string;
  amount_cents: number;
  at: string;
  method: string | null;
  reference: string | null;
  note: string | null;
  items_count: number;
  voided: boolean;
  voided_at: string | null;
}

export interface SettlementSummary {
  technician_id: string;
  owed_to_technician_cents: number;
  owed_to_admin_cents: number;
  net_cents: number;
  pending_commissions: PendingCommission[];
  pending_cash: PendingCash[];
  history: HistoryItem[];
}

export const VOID_WINDOW_MS = 24 * 3600 * 1000;

export const PAYOUT_METHODS: { value: PayoutMethod; label: string }[] = [
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'otro', label: 'Otro' },
];
export const DELIVERY_METHODS: { value: DeliveryMethod; label: string }[] = [
  { value: 'deposito', label: 'Depósito' },
  { value: 'efectivo', label: 'Efectivo en mano' },
  { value: 'transferencia', label: 'Transferencia' },
];

// ── Formato ─────────────────────────────────────────────────────────────────
export const money = (cents: number) =>
  (cents / 100).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

/** `SVC-123`. */
export const folioLabel = (folio: number) => `SVC-${folio}`;

/** «10 %» · «8.5 %» · «$150.00 fijo». */
export function commissionLabel(type: 'percent' | 'fixed', value: number): string {
  if (type === 'fixed') return `${money(value)} fijo`;
  const pct = value / 100;
  return `${Number.isInteger(pct) ? pct : pct.toFixed(2).replace(/0$/, '')} %`;
}

export const firstName = (full: string) => full.trim().split(/\s+/)[0] || 'el técnico';

/** Tono del saldo: positivo = Tumtto debe (azul); negativo = el técnico debe (ámbar). */
export const netTone = (net: number): 'owes-tech' | 'owes-admin' | 'even' =>
  net > 0 ? 'owes-tech' : net < 0 ? 'owes-admin' : 'even';

/** Frase simple del saldo en el detalle. */
export function balanceSentences(name: string, owedToTech: number, owedToAdmin: number): string[] {
  const n = firstName(name);
  const out: string[] = [];
  if (owedToTech > 0) out.push(`Tu Mantenimiento le debe ${money(owedToTech)} a ${n}.`);
  if (owedToAdmin > 0) out.push(`${n} debe entregar ${money(owedToAdmin)} en efectivo.`);
  if (out.length === 0) out.push(`${n} está al corriente: no hay nada pendiente.`);
  return out;
}

/** Mayor |neto| primero (como el backend). */
export const sortBalances = (rows: BalanceRow[]): BalanceRow[] =>
  [...rows].sort(
    (a, b) =>
      Math.abs(b.net_cents) - Math.abs(a.net_cents) ||
      a.technician_name.localeCompare(b.technician_name, 'es'),
  );

export function balanceTotals(rows: BalanceRow[]) {
  const owedToTechnicians = rows.reduce((s, r) => s + r.owed_to_technician_cents, 0);
  const owedToAdmin = rows.reduce((s, r) => s + r.owed_to_admin_cents, 0);
  return { owedToTechnicians, owedToAdmin, net: owedToTechnicians - owedToAdmin };
}

/** Suma de los elementos elegidos (ids ausentes se ignoran). */
export function sumSelected<T>(items: T[], idOf: (t: T) => string, cents: (t: T) => number, ids: ReadonlySet<string>) {
  return items.reduce((s, t) => (ids.has(idOf(t)) ? s + cents(t) : s), 0);
}

/**
 * ¿Se puede anular? Solo el último registro no anulado de su tipo, con menos de
 * 24 h (igual que admin_void_settlement).
 */
export function canVoid(history: HistoryItem[], item: HistoryItem, now: number): boolean {
  if (item.voided) return false;
  if (now - Date.parse(item.at) >= VOID_WINDOW_MS) return false;
  const latest = history
    .filter(h => h.kind === item.kind && !h.voided)
    .reduce<HistoryItem | null>((m, h) => (!m || Date.parse(h.at) > Date.parse(m.at) ? h : m), null);
  return latest?.id === item.id;
}

export function historyTitle(h: HistoryItem): string {
  const n = h.items_count;
  if (h.kind === 'payout') return h.voided ? 'Pago anulado' : `Pagado · ${n} ${n === 1 ? 'servicio' : 'servicios'}`;
  return h.voided ? 'Entrega anulada' : `Efectivo recibido · ${n} ${n === 1 ? 'servicio' : 'servicios'}`;
}

// ── Parseo defensivo de las RPC ─────────────────────────────────────────────
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : Number(v) || 0);
const str = (v: unknown) => (typeof v === 'string' ? v : '');
const strOrNull = (v: unknown) => (typeof v === 'string' ? v : null);
const arr = (v: unknown): Record<string, unknown>[] =>
  Array.isArray(v) ? (v.filter(x => x && typeof x === 'object') as Record<string, unknown>[]) : [];

/** technician_settlement_summary → forma tipada; null si no es un objeto. */
export function parseSummary(raw: unknown): SettlementSummary | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  return {
    technician_id: str(r.technician_id),
    owed_to_technician_cents: num(r.owed_to_technician_cents),
    owed_to_admin_cents: num(r.owed_to_admin_cents),
    net_cents: num(r.net_cents),
    pending_commissions: arr(r.pending_commissions).map(c => ({
      order_id: str(c.order_id),
      folio: num(c.folio),
      finished_at: str(c.finished_at),
      gross_cents: num(c.gross_cents),
      commission_type: c.commission_type === 'fixed' ? 'fixed' : 'percent',
      commission_value: num(c.commission_value),
      commission_cents: num(c.commission_cents),
    })),
    pending_cash: arr(r.pending_cash).map(c => ({
      payment_id: str(c.payment_id),
      order_id: str(c.order_id),
      folio: num(c.folio),
      collected_at: str(c.collected_at),
      amount_cents: num(c.amount_cents),
    })),
    history: arr(r.history).map(h => ({
      kind: h.kind === 'cash_delivery' ? 'cash_delivery' : 'payout',
      id: str(h.id),
      amount_cents: num(h.amount_cents),
      at: str(h.at),
      method: strOrNull(h.method),
      reference: strOrNull(h.reference),
      note: strOrNull(h.note),
      items_count: num(h.items_count),
      voided: h.voided === true,
      voided_at: strOrNull(h.voided_at),
    })),
  };
}

// ── Motor en memoria (modo maqueta) ─────────────────────────────────────────
export class SettlementError extends Error {}

type StoredCommission = PendingCommission & { technician_id: string; payout_id: string | null };
type StoredCash = PendingCash & { technician_id: string; delivery_id: string | null };
type StoredRecord = HistoryItem & { technician_id: string };

export interface MockSettlements {
  commissions: StoredCommission[];
  cash: StoredCash[];
  records: StoredRecord[];
  seq: number;
}

export interface TechRef {
  id: string;
  name: string;
  avatar_icon: string | null;
  type: TechKind;
}

const pendingCommissions = (st: MockSettlements, techId: string) =>
  st.commissions.filter(c => c.technician_id === techId && c.payout_id === null);
const pendingCash = (st: MockSettlements, techId: string) =>
  st.cash.filter(c => c.technician_id === techId && c.delivery_id === null);

export function mockSummary(st: MockSettlements, techId: string): SettlementSummary {
  const pc = pendingCommissions(st, techId).map(c => ({
    order_id: c.order_id, folio: c.folio, finished_at: c.finished_at, gross_cents: c.gross_cents,
    commission_type: c.commission_type, commission_value: c.commission_value, commission_cents: c.commission_cents,
  }));
  const cash = pendingCash(st, techId).map(c => ({
    payment_id: c.payment_id, order_id: c.order_id, folio: c.folio, collected_at: c.collected_at, amount_cents: c.amount_cents,
  }));
  const owedTech = pc.reduce((s, c) => s + c.commission_cents, 0);
  const owedAdmin = cash.reduce((s, c) => s + c.amount_cents, 0);
  return {
    technician_id: techId,
    owed_to_technician_cents: owedTech,
    owed_to_admin_cents: owedAdmin,
    net_cents: owedTech - owedAdmin,
    pending_commissions: pc.sort((a, b) => Date.parse(b.finished_at) - Date.parse(a.finished_at)),
    pending_cash: cash.sort((a, b) => Date.parse(b.collected_at) - Date.parse(a.collected_at)),
    history: st.records
      .filter(r => r.technician_id === techId)
      .map(h => ({
        kind: h.kind, id: h.id, amount_cents: h.amount_cents, at: h.at, method: h.method,
        reference: h.reference, note: h.note, items_count: h.items_count, voided: h.voided, voided_at: h.voided_at,
      }))
      .sort((a, b) => Date.parse(b.at) - Date.parse(a.at)),
  };
}

export function mockBalances(st: MockSettlements, techs: TechRef[]): BalanceRow[] {
  const rows = techs.map(t => {
    const s = mockSummary(st, t.id);
    const last = (kind: SettlementKind) =>
      s.history.find(h => h.kind === kind && !h.voided)?.at ?? null;
    return {
      technician_id: t.id,
      technician_name: t.name,
      avatar_icon: t.avatar_icon,
      technician_type: t.type,
      owed_to_technician_cents: s.owed_to_technician_cents,
      owed_to_admin_cents: s.owed_to_admin_cents,
      net_cents: s.net_cents,
      last_payout_at: last('payout'),
      last_delivery_at: last('cash_delivery'),
      pending_commissions_count: s.pending_commissions.length,
      pending_cash_count: s.pending_cash.length,
    };
  });
  return sortBalances(rows);
}

function pick<T>(all: T[], ids: string[] | null, idOf: (t: T) => string, empty: string): T[] {
  if (ids !== null && ids.length === 0) throw new SettlementError('Elige al menos un servicio.');
  const chosen = ids === null ? all : all.filter(t => ids.includes(idOf(t)));
  if (ids !== null && chosen.length !== new Set(ids).size)
    throw new SettlementError('Alguno de los servicios ya fue liquidado o no existe.');
  if (chosen.length === 0) throw new SettlementError(empty);
  return chosen;
}

export interface RecordInput {
  ids: string[] | null;
  method: string;
  reference?: string | null;
  note?: string | null;
  at?: string;
}

/** admin_record_technician_payout (ids = order_id). */
export function mockRecordPayout(st: MockSettlements, techId: string, input: RecordInput, now = Date.now()) {
  const chosen = pick(pendingCommissions(st, techId), input.ids, c => c.order_id, 'No hay comisiones pendientes por pagar.');
  const id = `mock-payout-${++st.seq}`;
  const amount = chosen.reduce((s, c) => s + c.commission_cents, 0);
  chosen.forEach(c => (c.payout_id = id));
  st.records.push({
    kind: 'payout', id, technician_id: techId, amount_cents: amount,
    at: input.at ?? new Date(now).toISOString(), method: input.method,
    reference: input.reference?.trim() || null, note: input.note?.trim() || null,
    items_count: chosen.length, voided: false, voided_at: null,
  });
  return { id, amount_cents: amount, items_count: chosen.length };
}

/** admin_record_cash_delivery (ids = payment_id). */
export function mockRecordDelivery(st: MockSettlements, techId: string, input: RecordInput, now = Date.now()) {
  const chosen = pick(pendingCash(st, techId), input.ids, c => c.payment_id, 'No hay efectivo pendiente por entregar.');
  const id = `mock-delivery-${++st.seq}`;
  const amount = chosen.reduce((s, c) => s + c.amount_cents, 0);
  chosen.forEach(c => (c.delivery_id = id));
  st.records.push({
    kind: 'cash_delivery', id, technician_id: techId, amount_cents: amount,
    at: input.at ?? new Date(now).toISOString(), method: input.method,
    reference: input.reference?.trim() || null, note: input.note?.trim() || null,
    items_count: chosen.length, voided: false, voided_at: null,
  });
  return { id, amount_cents: amount, items_count: chosen.length };
}

/** admin_void_settlement: libera los servicios para que vuelvan a pendientes. */
export function mockVoid(st: MockSettlements, kind: SettlementKind, id: string, now = Date.now()) {
  const rec = st.records.find(r => r.kind === kind && r.id === id);
  if (!rec) throw new SettlementError('No se encontró el registro.');
  if (rec.voided) throw new SettlementError('Este registro ya estaba anulado.');
  const mine = st.records.filter(r => r.technician_id === rec.technician_id);
  if (!canVoid(mine, rec, now))
    throw new SettlementError('Solo se puede anular el último registro, dentro de las primeras 24 horas.');
  let released = 0;
  if (kind === 'payout')
    st.commissions.forEach(c => { if (c.payout_id === id) { c.payout_id = null; released++; } });
  else st.cash.forEach(c => { if (c.delivery_id === id) { c.delivery_id = null; released++; } });
  rec.voided = true;
  rec.voided_at = new Date(now).toISOString();
  rec.items_count = 0;
  return { kind, id, amount_cents: rec.amount_cents, items_released: released };
}

// ── Datos demo ──────────────────────────────────────────────────────────────
export interface OrderRef { id: string; folio: number }

interface DemoPlan {
  /** Comisiones pendientes: [bruto en centavos] (porcentaje 85 %, o fijo si fixed). */
  commissions: number[];
  cash: number[];
  /** Días atrás de un pago y una entrega ya hechos (horas si < 1). */
  paidDaysAgo?: number;
  deliveredDaysAgo?: number;
  /** Registro de pago reciente (anulable) en horas. */
  recentPayoutHoursAgo?: number;
  fixed?: boolean;
}

const DAY = 24 * 3600 * 1000;

/** Saldos de ejemplo para técnicos del mundo demo (los que no están en el plan quedan en cero). */
export function seedMockSettlements(
  techIds: string[],
  ordersFor: (techId: string) => OrderRef[],
  now: number,
): MockSettlements {
  const plans: Record<string, DemoPlan> = {
    'demo-tecnico': { commissions: [195000, 130000, 88000], cash: [100000, 65000], paidDaysAgo: 6, deliveredDaysAgo: 13 },
    'u-ag': { commissions: [240000, 150000, 175000, 92000], cash: [], paidDaysAgo: 9 },
    'u-sc': { commissions: [98000], cash: [180000, 120000, 75000], deliveredDaysAgo: 20 },
    'u-jose': { commissions: [], cash: [], paidDaysAgo: 3, deliveredDaysAgo: 3 },
    'u-lupita': { commissions: [110000, 64000], cash: [90000], recentPayoutHoursAgo: 2, deliveredDaysAgo: 8, fixed: true },
    'u-do': { commissions: [], cash: [210000, 85000] },
  };
  const st: MockSettlements = { commissions: [], cash: [], records: [], seq: 0 };
  let synth = 9000;
  for (const techId of techIds) {
    const plan = plans[techId];
    if (!plan) continue;
    const refs = [...ordersFor(techId)];
    const next = (): OrderRef => refs.shift() ?? { id: `mock-order-${synth}`, folio: synth++ };
    const commission = (gross: number, daysAgo: number, paidBy: string | null) => {
      const o = next();
      const type = plan.fixed ? 'fixed' : 'percent';
      const value = plan.fixed ? 25000 : 8500;
      st.commissions.push({
        technician_id: techId, payout_id: paidBy, order_id: o.id, folio: o.folio,
        finished_at: new Date(now - daysAgo * DAY).toISOString(), gross_cents: gross,
        commission_type: type, commission_value: value,
        commission_cents: type === 'fixed' ? value : Math.round((gross * value) / 10000),
      });
    };
    const cashItem = (amount: number, daysAgo: number, doneBy: string | null) => {
      const o = next();
      st.cash.push({
        technician_id: techId, delivery_id: doneBy, payment_id: `mock-pay-${o.id}`, order_id: o.id,
        folio: o.folio, collected_at: new Date(now - daysAgo * DAY).toISOString(), amount_cents: amount,
      });
    };
    plan.commissions.forEach((g, i) => commission(g, 1 + i * 2, null));
    plan.cash.forEach((a, i) => cashItem(a, 1 + i * 3, null));
    const addRecord = (kind: SettlementKind, ago: number, items: number, method: string, reference: string | null) => {
      const id = `mock-${kind}-${++st.seq}`;
      const before = st.commissions.length;
      const beforeCash = st.cash.length;
      for (let i = 0; i < items; i++) {
        if (kind === 'payout') commission(120000 + i * 30000, ago / DAY + 2, id);
        else cashItem(90000 + i * 25000, ago / DAY + 2, id);
      }
      const amount =
        kind === 'payout'
          ? st.commissions.slice(before).reduce((s, c) => s + c.commission_cents, 0)
          : st.cash.slice(beforeCash).reduce((s, c) => s + c.amount_cents, 0);
      st.records.push({
        kind, id, technician_id: techId, amount_cents: amount, at: new Date(now - ago).toISOString(),
        method, reference, note: null, items_count: items, voided: false, voided_at: null,
      });
    };
    if (plan.paidDaysAgo) addRecord('payout', plan.paidDaysAgo * DAY, 2, 'transferencia', `SPEI-${techId.length}${plan.paidDaysAgo}041`);
    if (plan.recentPayoutHoursAgo) addRecord('payout', plan.recentPayoutHoursAgo * 3600 * 1000, 1, 'transferencia', 'SPEI-88214');
    if (plan.deliveredDaysAgo) addRecord('cash_delivery', plan.deliveredDaysAgo * DAY, 2, 'deposito', `DEP-${plan.deliveredDaysAgo}2290`);
  }
  return st;
}
