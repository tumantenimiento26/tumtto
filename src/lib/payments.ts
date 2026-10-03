// Modelo de pago «tarifa base en app + cotización en efectivo» (puro, probado en
// payments.test.ts). Espeja los RPC del backend (get_order_payment_summary,
// admin_report_*, admin_resolve_cash_review) para el modo maqueta y para
// recalcular localmente; en producción manda el servidor.

import type { Database, Json } from '@/types/supabase';
import type { NullableCols } from '@/types/rpc';

type T = Database['public']['Tables'];
type Fn = Database['public']['Functions'];
export type PayOrder = T['service_orders']['Row'];
export type PayRow = T['payments']['Row'];

// ── Etiquetas ────────────────────────────────────────────────────────────────

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export type BaseFeeStatus =
  | 'not_required'
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refund_pending'
  | 'refunded'
  | 'waived'
  | 'void';
export type CashStatus =
  | 'pending_technician'
  | 'technician_confirmed'
  | 'client_confirmed'
  | 'disputed'
  | 'resolved';
export type ReviewOutcome = 'confirm_technician' | 'adjust_amount' | 'not_collected';

export const BASE_STATUS: Record<string, { label: string; tone: Tone }> = {
  not_required: { label: 'No aplica', tone: 'neutral' },
  pending: { label: 'Pendiente de pago', tone: 'warning' },
  paid: { label: 'Pagada', tone: 'success' },
  failed: { label: 'Cobro fallido', tone: 'danger' },
  refund_pending: { label: 'Reembolso en proceso', tone: 'warning' },
  refunded: { label: 'Reembolsada', tone: 'danger' },
  waived: { label: 'Exonerada', tone: 'info' },
  void: { label: 'Anulada', tone: 'neutral' },
};

export const CASH_STATUS: Record<string, { label: string; tone: Tone }> = {
  pending_technician: { label: 'Espera al técnico', tone: 'neutral' },
  technician_confirmed: { label: 'Por confirmar el cliente', tone: 'warning' },
  client_confirmed: { label: 'Confirmado', tone: 'success' },
  disputed: { label: 'En disputa', tone: 'danger' },
  resolved: { label: 'Resuelto por admin', tone: 'info' },
};

export const CASH_STATUS_OPTIONS = (Object.keys(CASH_STATUS) as CashStatus[]).map(value => ({
  value,
  label: CASH_STATUS[value].label,
}));

export const CLIENT_RESPONSE_LABEL: Record<string, string> = {
  confirmed: 'Confirmó el pago',
  disputed: 'Disputó el pago',
  auto: 'Confirmación automática',
};

export const OUTCOMES: { value: ReviewOutcome; label: string; hint: string }[] = [
  {
    value: 'confirm_technician',
    label: 'Confirmar lo del técnico',
    hint: 'Se acepta el monto que reportó el técnico; la comisión se mantiene.',
  },
  {
    value: 'adjust_amount',
    label: 'Ajustar monto',
    hint: 'Se fija el monto realmente cobrado y se recalcula la comisión.',
  },
  {
    value: 'not_collected',
    label: 'No se cobró',
    hint: 'El técnico asume el faltante: se revierte la comisión de ese efectivo y no se cobra al cliente.',
  },
];
export const OUTCOME_LABEL: Record<string, string> = Object.fromEntries(
  OUTCOMES.map(o => [o.value, o.label]),
);

export const REVIEW_REASON_LABEL: Record<string, string> = {
  amount_mismatch: 'El técnico reportó un monto distinto al presupuesto',
  client_not_paid: 'El cliente dice que no pagó',
  client_amount_mismatch: 'El cliente dice haber pagado otro monto',
};
export const reviewReason = (r: string | null | undefined) =>
  r ? (REVIEW_REASON_LABEL[r] ?? r) : '—';

/** Filtros de la cola «Revisión de efectivo». */
export interface CashReviewFilters {
  reason: 'all' | 'amount_mismatch' | 'client_amount_mismatch' | 'client_not_paid';
  /** Antigüedad mínima en días (0 = todas). */
  minDays: 0 | 1 | 3 | 7;
  /** '' = todos los técnicos. */
  technicianId: string;
}
export const EMPTY_CASH_REVIEW_FILTERS: CashReviewFilters = { reason: 'all', minDays: 0, technicianId: '' };
export const activeCashReviewFilters = (f: CashReviewFilters) =>
  (f.reason !== 'all' ? 1 : 0) + (f.minDays ? 1 : 0) + (f.technicianId ? 1 : 0);

type ReviewFilterRow = Pick<CashReviewRow, 'review_reason' | 'review_opened_at' | 'technician_id'>;
export function filterCashReviews<T extends ReviewFilterRow>(rows: T[], f: CashReviewFilters, now = Date.now()): T[] {
  return rows.filter(r => {
    if (f.reason !== 'all' && r.review_reason !== f.reason) return false;
    if (f.technicianId && r.technician_id !== f.technicianId) return false;
    if (f.minDays) {
      const t = r.review_opened_at ? new Date(r.review_opened_at).getTime() : now;
      if (now - t < f.minDays * 864e5) return false;
    }
    return true;
  });
}

/** Etiqueta corta del concepto de un pago. */
export const KIND_LABEL: Record<string, string> = {
  base_fee: 'Tarifa base',
  quote: 'Presupuesto',
  legacy: 'Servicio',
};
export const kindLabel = (k: string | null | undefined) => KIND_LABEL[k ?? 'legacy'] ?? 'Servicio';

// ── Resumen por orden (espejo de get_order_payment_summary) ──────────────────

export interface BaseSummary {
  feeCents: number;
  surchargeCents: number;
  totalCents: number;
  method: 'card';
  status: string;
  paidAt: string | null;
  refundedCents: number;
  refundedAt: string | null;
  paymentId: string | null;
}
export interface QuoteSummary {
  totalCents: number;
  method: string | null;
  paymentStatus: string | null;
  cashStatus: string | null;
  expectedCents: number | null;
  receivedCents: number | null;
  reportedAt: string | null;
  clientResponse: string | null;
  clientReportedCents: number | null;
  reviewStatus: string | null;
  reviewReason: string | null;
  paymentId: string | null;
}
export interface PaymentSummary {
  orderId: string;
  paymentModel: 'legacy' | 'base_cash';
  base: BaseSummary | null;
  quote: QuoteSummary;
  cashReviewOpen: boolean;
  totalCents: number;
}

const num = (v: unknown) => (v == null || v === '' ? null : Number(v));
const num0 = (v: unknown) => Number(v ?? 0) || 0;
const str = (v: unknown) => (typeof v === 'string' ? v : null);

/** Pago de la tarifa base que cuenta: el cobrado primero, si no el más reciente. */
function pick(payments: PayRow[], kinds: string[]): PayRow | null {
  return (
    payments
      .filter(p => kinds.includes(p.kind))
      .sort(
        (a, b) =>
          Number(b.status === 'paid') - Number(a.status === 'paid') ||
          b.created_at.localeCompare(a.created_at),
      )[0] ?? null
  );
}
export const basePayment = (payments: PayRow[]) => pick(payments, ['base_fee']);
export const quotePayment = (payments: PayRow[]) => pick(payments, ['quote', 'legacy']);

/** Calcula el resumen desde la orden y sus pagos (mismas reglas que el RPC). */
export function buildPaymentSummary(order: PayOrder, payments: PayRow[]): PaymentSummary {
  const base = basePayment(payments);
  const quote = quotePayment(payments);
  const isBaseCash = order.payment_model === 'base_cash';
  const quoted = order.quoted_total_cents ?? 0;
  return {
    orderId: order.id,
    paymentModel: isBaseCash ? 'base_cash' : 'legacy',
    base: isBaseCash
      ? {
          feeCents: order.base_fee_cents,
          surchargeCents: order.base_surcharge_cents,
          totalCents: order.base_total_cents ?? 0,
          method: 'card',
          status: order.base_fee_status,
          paidAt: order.base_fee_paid_at,
          refundedCents: base?.refunded_cents ?? 0,
          refundedAt: order.base_fee_refunded_at,
          paymentId: base?.id ?? null,
        }
      : null,
    quote: {
      totalCents: quoted,
      method: isBaseCash ? 'cash' : (quote?.method ?? null),
      paymentStatus: quote?.status ?? null,
      cashStatus: quote?.cash_status ?? null,
      expectedCents: quote?.amount_cents ?? null,
      receivedCents: quote?.cash_received_cents ?? null,
      reportedAt: quote?.cash_reported_at ?? null,
      clientResponse: quote?.client_cash_response ?? null,
      clientReportedCents: quote?.client_reported_cents ?? null,
      reviewStatus: quote?.review_status ?? null,
      reviewReason: quote?.review_reason ?? null,
      paymentId: quote?.id ?? null,
    },
    cashReviewOpen: order.cash_review_open,
    totalCents: (isBaseCash ? (order.base_total_cents ?? 0) : 0) + quoted,
  };
}

/** jsonb de get_order_payment_summary → PaymentSummary (tolerante a faltantes). */
export function parsePaymentSummary(json: Json | null): PaymentSummary | null {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return null;
  const j = json as Record<string, Json | undefined>;
  const b = j.base && typeof j.base === 'object' && !Array.isArray(j.base) ? (j.base as Record<string, Json>) : null;
  const q = (j.quote && typeof j.quote === 'object' && !Array.isArray(j.quote) ? j.quote : {}) as Record<string, Json>;
  return {
    orderId: str(j.order_id) ?? '',
    paymentModel: j.payment_model === 'base_cash' ? 'base_cash' : 'legacy',
    base: b
      ? {
          feeCents: num0(b.fee_cents),
          surchargeCents: num0(b.surcharge_cents),
          totalCents: num0(b.total_cents),
          method: 'card',
          status: str(b.status) ?? 'not_required',
          paidAt: str(b.paid_at),
          refundedCents: num0(b.refunded_cents),
          refundedAt: str(b.refunded_at),
          paymentId: str(b.payment_id),
        }
      : null,
    quote: {
      totalCents: num0(q.total_cents),
      method: str(q.method),
      paymentStatus: str(q.payment_status),
      cashStatus: str(q.cash_status),
      expectedCents: num(q.expected_cents),
      receivedCents: num(q.received_cents),
      reportedAt: str(q.reported_at),
      clientResponse: str(q.client_response),
      clientReportedCents: num(q.client_reported_cents),
      reviewStatus: str(q.review_status),
      reviewReason: str(q.review_reason),
      paymentId: str(q.payment_id),
    },
    cashReviewOpen: j.cash_review_open === true,
    totalCents: num0(j.total_cents),
  };
}

/** Diferencia entre lo recibido y lo esperado (null = aún sin reporte). */
export function cashDiff(q: Pick<QuoteSummary, 'expectedCents' | 'receivedCents'>): number | null {
  return q.expectedCents == null || q.receivedCents == null ? null : q.receivedCents - q.expectedCents;
}

/** Tarifa base: ¿se puede exonerar? (solo pendiente/fallida en solicitud abierta). */
export const canWaiveBase = (o: Pick<PayOrder, 'status' | 'base_fee_status' | 'payment_model'>) =>
  o.payment_model === 'base_cash' &&
  o.status === 'requested' &&
  (o.base_fee_status === 'pending' || o.base_fee_status === 'failed');

/** Solicitud que aún no se despacha porque la tarifa base no está cobrada. */
export const awaitingBasePayment = (o: Pick<PayOrder, 'payment_model' | 'base_fee_status'>) =>
  o.payment_model === 'base_cash' && (o.base_fee_status === 'pending' || o.base_fee_status === 'failed');

/** Pagos reembolsables de una orden (cobrados con saldo por devolver). */
export const refundablePayments = (payments: PayRow[]) =>
  payments
    .filter(p => p.status === 'paid' && p.amount_cents - p.refunded_cents > 0)
    .sort((a, b) => Number(a.kind !== 'base_fee') - Number(b.kind !== 'base_fee'));

/** «Tarifa base · Tarjeta», «Presupuesto · Efectivo»… */
export function paymentLabel(p: Pick<PayRow, 'kind' | 'method'>): string {
  const method = { card: 'Tarjeta', cash: 'Efectivo', oxxo: 'OXXO', wallet: 'Mercado Pago' }[p.method] ?? p.method;
  return `${kindLabel(p.kind)} · ${method}`;
}

/**
 * ¿Cobro fallido de verdad? Un presupuesto en efectivo «no cobrado» tras la
 * revisión también queda `failed`, pero no es un cobro rechazado.
 */
export const isFailedCharge = (p: Pick<PayRow, 'status' | 'kind' | 'cash_status'>) =>
  p.status === 'failed' && !(p.kind === 'quote' && p.cash_status === 'resolved');

// ── Resolución de revisión de efectivo ───────────────────────────────────────

export function validateResolution(i: {
  outcome: ReviewOutcome | null;
  notes: string;
  amountCents: number | null;
}): string | null {
  if (!i.outcome) return 'Elige cómo se resuelve la revisión.';
  if (!i.notes.trim()) return 'Escribe una nota: queda en la bitácora y se avisa a ambas partes.';
  if (i.outcome === 'adjust_amount' && !(i.amountCents != null && i.amountCents > 0))
    return 'Indica el monto realmente cobrado (mayor a cero).';
  return null;
}

/** Comisión de plataforma sobre un monto (centavos, bps). */
export const commissionOf = (cents: number, bps: number) => Math.round((cents * bps) / 10_000);

/** Aplica la resolución a orden y pago (misma lógica que admin_resolve_cash_review). */
export function applyCashResolution(
  order: PayOrder,
  pay: PayRow,
  outcome: ReviewOutcome,
  notes: string,
  receivedCents: number | null,
  now: string,
  adminId: string | null = null,
): { order: PayOrder; payment: PayRow } {
  const received =
    outcome === 'adjust_amount'
      ? (receivedCents ?? 0)
      : outcome === 'not_collected'
        ? 0
        : (pay.cash_received_cents ?? pay.amount_cents);
  const commission =
    outcome === 'confirm_technician'
      ? pay.commission_cents
      : commissionOf(received, order.commission_bps ?? 1500);
  const payment: PayRow = {
    ...pay,
    review_status: 'resolved',
    review_outcome: outcome,
    review_notes: notes.trim() || null,
    review_resolved_at: now,
    review_resolved_by: adminId,
    cash_status: 'resolved',
    cash_received_cents: received,
    commission_cents: commission,
    platform_fee_cents: commission,
    status: outcome === 'not_collected' ? 'failed' : 'paid',
    paid_at: outcome === 'not_collected' ? pay.paid_at : (pay.paid_at ?? now),
    updated_at: now,
  };
  const settled = order.status === 'completed';
  return {
    payment,
    order: {
      ...order,
      cash_review_open: false,
      status: settled ? 'paid' : order.status,
      paid_at: settled ? now : order.paid_at,
      commission_cents: commission,
      updated_at: now,
    },
  };
}

// ── Reportes (espejo local) ──────────────────────────────────────────────────

export type MethodFilter = 'all' | 'card' | 'cash';
export const METHOD_FILTER_OPTIONS: { value: MethodFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'cash', label: 'Efectivo' },
];

const LIVE_PAY = (p: PayRow) => p.status !== 'failed' && p.status !== 'cancelled';

export function groupByOrder(payments: PayRow[]): Map<string, PayRow[]> {
  const m = new Map<string, PayRow[]>();
  for (const p of payments) {
    const a = m.get(p.service_order_id);
    if (a) a.push(p);
    else m.set(p.service_order_id, [p]);
  }
  return m;
}

/** ¿La orden tiene algún pago vigente con ese método? ('all' = siempre). */
export function orderHasMethod(pays: PayRow[] | undefined, method: MethodFilter): boolean {
  if (method === 'all') return true;
  return (pays ?? []).some(p => p.method === method && LIVE_PAY(p));
}

/** GMV de una orden: sin filtro = tarifa base conservada + presupuesto; con filtro = cobrado neto de ese método. */
export function orderGmv(order: PayOrder, pays: PayRow[] | undefined, method: MethodFilter): number {
  if (method === 'all') {
    const base =
      order.payment_model === 'base_cash' &&
      (order.base_fee_status === 'paid' || order.base_fee_status === 'refund_pending')
        ? (order.base_total_cents ?? 0)
        : 0;
    return base + (order.quoted_total_cents ?? 0);
  }
  return (pays ?? [])
    .filter(p => p.method === method && p.status === 'paid')
    .reduce((s, p) => s + p.amount_cents - p.refunded_cents, 0);
}

const PAID_STATUS = ['paid', 'closed'];

export interface KpiWindow {
  orders: number;
  paid_orders: number;
  gmv_cents: number;
}

export function kpiWindow(
  orders: PayOrder[],
  byOrder: Map<string, PayRow[]>,
  from: number,
  to: number,
  method: MethodFilter,
): KpiWindow {
  const inWin = (iso: string | null) => {
    const t = iso ? Date.parse(iso) : NaN;
    return t >= from && t < to;
  };
  const os = orders.filter(o => orderHasMethod(byOrder.get(o.id), method));
  const paid = os.filter(o => PAID_STATUS.includes(o.status) && inWin(o.paid_at));
  return {
    orders: os.filter(o => inWin(o.created_at)).length,
    paid_orders: paid.length,
    gmv_cents: paid.reduce((s, o) => s + orderGmv(o, byOrder.get(o.id), method), 0),
  };
}

/** Ticket medio por categoría (órdenes pagadas del periodo, con el método elegido). */
export function ticketByCategory(
  orders: PayOrder[],
  byOrder: Map<string, PayRow[]>,
  categories: { id: string; name: string }[],
  from: number,
  to: number,
  method: MethodFilter,
): Fn['admin_report_ticket_by_category']['Returns'] {
  return categories.map(c => {
    const paid = orders.filter(o => {
      const t = o.paid_at ? Date.parse(o.paid_at) : NaN;
      return (
        o.category_id === c.id &&
        PAID_STATUS.includes(o.status) &&
        t >= from &&
        t < to &&
        orderHasMethod(byOrder.get(o.id), method)
      );
    });
    const total = paid.reduce((s, o) => s + orderGmv(o, byOrder.get(o.id), method), 0);
    return {
      category_id: c.id,
      category_name: c.name,
      paid_orders: paid.length,
      avg_ticket_cents: paid.length ? Math.round(total / paid.length) : 0,
    };
  });
}

// ── Efectivo por técnico ─────────────────────────────────────────────────────

export type CashTechRow = NullableCols<
  Fn['admin_report_cash_by_technician']['Returns'][number],
  'technician_name'
>;

export function cashByTechnician(
  payments: PayRow[],
  from: number,
  to: number,
  nameOf: (id: string) => string | null,
  technicianId: string | null = null,
): CashTechRow[] {
  const acc = new Map<string, CashTechRow>();
  for (const p of payments) {
    if (p.kind !== 'quote' || !p.technician_id || !p.cash_reported_at) continue;
    const t = Date.parse(p.cash_reported_at);
    if (t < from || t >= to) continue;
    if (technicianId && p.technician_id !== technicianId) continue;
    const r =
      acc.get(p.technician_id) ??
      ({
        technician_id: p.technician_id,
        technician_name: nameOf(p.technician_id),
        services_count: 0,
        cash_expected_cents: 0,
        cash_reported_cents: 0,
        cash_client_confirmed_cents: 0,
        cash_awaiting_client_cents: 0,
        cash_disputed_cents: 0,
        reviews_open: 0,
        commission_generated_cents: 0,
        commission_recovered_cents: 0,
        commission_pending_cents: 0,
      } satisfies CashTechRow);
    const got = p.cash_received_cents ?? 0;
    r.services_count += 1;
    r.cash_expected_cents += p.amount_cents;
    r.cash_reported_cents += got;
    if ((p.cash_status === 'client_confirmed' || p.cash_status === 'resolved') && p.status === 'paid')
      r.cash_client_confirmed_cents += got;
    if (p.cash_status === 'technician_confirmed') r.cash_awaiting_client_cents += got;
    if (p.review_status === 'open') {
      r.cash_disputed_cents += got;
      r.reviews_open += 1;
    }
    r.commission_generated_cents += p.commission_cents;
    r.commission_recovered_cents += p.cash_debt_recovered_cents;
    acc.set(p.technician_id, r);
  }
  const rows = [...acc.values()].map(r => ({
    ...r,
    commission_pending_cents: Math.max(r.commission_generated_cents - r.commission_recovered_cents, 0),
  }));
  return rows.sort(
    (a, b) =>
      b.commission_pending_cents - a.commission_pending_cents ||
      (a.technician_name ?? '').localeCompare(b.technician_name ?? '', 'es'),
  );
}

/** Totales del reporte «Efectivo por técnico». */
export function cashTotals(rows: CashTechRow[]) {
  const z = {
    services: 0,
    expected: 0,
    reported: 0,
    confirmed: 0,
    awaiting: 0,
    disputed: 0,
    reviews: 0,
    generated: 0,
    recovered: 0,
    pending: 0,
  };
  for (const r of rows) {
    z.services += Number(r.services_count);
    z.expected += Number(r.cash_expected_cents);
    z.reported += Number(r.cash_reported_cents);
    z.confirmed += Number(r.cash_client_confirmed_cents);
    z.awaiting += Number(r.cash_awaiting_client_cents);
    z.disputed += Number(r.cash_disputed_cents);
    z.reviews += Number(r.reviews_open);
    z.generated += Number(r.commission_generated_cents);
    z.recovered += Number(r.commission_recovered_cents);
    z.pending += Number(r.commission_pending_cents);
  }
  return z;
}

const pesos = (c: number | null | undefined) => (c == null ? '' : Number(c) / 100);

export function cashByTechCsvRows(rows: CashTechRow[]): Record<string, string | number>[] {
  return rows.map(r => ({
    Técnico: r.technician_name ?? r.technician_id,
    Servicios: Number(r.services_count),
    'Efectivo esperado': pesos(r.cash_expected_cents),
    'Efectivo reportado': pesos(r.cash_reported_cents),
    'Confirmado por cliente': pesos(r.cash_client_confirmed_cents),
    'Por confirmar': pesos(r.cash_awaiting_client_cents),
    'En disputa': pesos(r.cash_disputed_cents),
    'Revisiones abiertas': Number(r.reviews_open),
    'Comisión generada': pesos(r.commission_generated_cents),
    'Comisión recuperada': pesos(r.commission_recovered_cents),
    'Comisión pendiente': pesos(r.commission_pending_cents),
  }));
}

// ── Reporte de pagos por servicio ────────────────────────────────────────────

export type PaymentsReportRow = NullableCols<
  Fn['admin_report_payments']['Returns'][number],
  | 'technician_id'
  | 'technician_name'
  | 'client_name'
  | 'base_total_cents'
  | 'base_method'
  | 'quote_total_cents'
  | 'quote_method'
  | 'cash_status'
  | 'cash_expected_cents'
  | 'cash_received_cents'
  | 'cash_reported_at'
  | 'client_response'
>;
export interface PaymentsReportFilters {
  method: MethodFilter;
  cashStatus: CashStatus | null;
  onlyReview: boolean;
}

export function paymentsReport(
  orders: PayOrder[],
  byOrder: Map<string, PayRow[]>,
  names: {
    category: (id: string) => string;
    person: (id: string | null) => string | null;
  },
  from: number,
  to: number,
  f: PaymentsReportFilters,
  limit = 100,
  offset = 0,
): PaymentsReportRow[] {
  const rows = orders
    .filter(o => {
      const t = Date.parse(o.created_at);
      if (!(t >= from && t < to)) return false;
      const pays = byOrder.get(o.id);
      if (!orderHasMethod(pays, f.method)) return false;
      if (f.cashStatus && quotePayment(pays ?? [])?.cash_status !== f.cashStatus) return false;
      if (f.onlyReview && !o.cash_review_open) return false;
      return true;
    })
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const total = rows.length;
  return rows.slice(offset, offset + limit).map(o => {
    const pays = byOrder.get(o.id) ?? [];
    const s = buildPaymentSummary(o, pays);
    const baseKept = ['paid', 'refund_pending', 'refunded'].includes(o.base_fee_status) ? (o.base_total_cents ?? 0) : 0;
    const isBC = o.payment_model === 'base_cash';
    return {
      order_id: o.id,
      folio: o.folio,
      created_at: o.created_at,
      status: o.status,
      category_name: names.category(o.category_id),
      client_id: o.client_id,
      client_name: names.person(o.client_id),
      technician_id: o.technician_id,
      technician_name: names.person(o.technician_id),
      payment_model: o.payment_model,
      base_fee_cents: o.base_fee_cents,
      base_surcharge_cents: o.base_surcharge_cents,
      base_total_cents: o.base_total_cents,
      base_fee_status: o.base_fee_status,
      base_method: isBC && (o.base_total_cents ?? 0) > 0 ? 'card' : null,
      base_refunded_cents: s.base?.refundedCents ?? 0,
      quote_total_cents: o.quoted_total_cents,
      quote_method: isBC ? ((o.quoted_total_cents ?? 0) > 0 ? 'cash' : null) : s.quote.method,
      cash_status: s.quote.cashStatus,
      cash_expected_cents: s.quote.expectedCents,
      cash_received_cents: s.quote.receivedCents,
      cash_reported_at: s.quote.reportedAt,
      client_response: s.quote.clientResponse,
      cash_review_open: o.cash_review_open,
      commission_cents: quotePayment(pays)?.commission_cents ?? o.commission_cents ?? 0,
      total_cents: (isBC ? baseKept : 0) + (o.quoted_total_cents ?? 0),
      total_count: total,
    };
  });
}

const METHOD_NAME: Record<string, string> = { card: 'Tarjeta', cash: 'Efectivo', oxxo: 'OXXO', wallet: 'Mercado Pago' };
export const methodName = (m: string | null | undefined) => (m ? (METHOD_NAME[m] ?? m) : '—');

export function paymentsReportCsvRows(rows: PaymentsReportRow[]): Record<string, string | number>[] {
  return rows.map(r => ({
    Servicio: `SVC-${r.folio}`,
    Fecha: r.created_at,
    Estado: r.status,
    Categoría: r.category_name,
    Cliente: r.client_name ?? '',
    Técnico: r.technician_name ?? '',
    Modelo: r.payment_model === 'base_cash' ? 'Base + efectivo' : 'Anterior',
    'Tarifa base': pesos(r.base_fee_cents),
    Recargos: pesos(r.base_surcharge_cents),
    'Total base': pesos(r.base_total_cents),
    'Método base': methodName(r.base_method),
    'Estado base': BASE_STATUS[r.base_fee_status]?.label ?? r.base_fee_status,
    'Base reembolsada': pesos(r.base_refunded_cents),
    Presupuesto: pesos(r.quote_total_cents),
    'Método presupuesto': methodName(r.quote_method),
    'Estado efectivo': r.cash_status ? (CASH_STATUS[r.cash_status]?.label ?? r.cash_status) : '',
    'Efectivo esperado': pesos(r.cash_expected_cents),
    'Efectivo recibido': pesos(r.cash_received_cents),
    'En revisión': r.cash_review_open ? 'Sí' : 'No',
    Comisión: pesos(r.commission_cents),
    Total: pesos(r.total_cents),
  }));
}

// ── Cola de revisiones ───────────────────────────────────────────────────────

export type CashReviewRow = NullableCols<
  Fn['admin_list_cash_reviews']['Returns'][number],
  | 'technician_id'
  | 'technician_name'
  | 'client_name'
  | 'review_reason'
  | 'review_opened_at'
  | 'received_cents'
  | 'client_reported_cents'
  | 'client_dispute_reason'
>;

export function cashReviews(
  orders: PayOrder[],
  byOrder: Map<string, PayRow[]>,
  person: (id: string | null) => string | null,
): CashReviewRow[] {
  const out: CashReviewRow[] = [];
  for (const o of orders) {
    const p = (byOrder.get(o.id) ?? []).find(x => x.kind === 'quote' && x.review_status === 'open');
    if (!p) continue;
    out.push({
      order_id: o.id,
      folio: o.folio,
      status: o.status,
      technician_id: o.technician_id,
      technician_name: person(o.technician_id),
      client_id: o.client_id,
      client_name: person(o.client_id),
      review_reason: p.review_reason,
      review_opened_at: p.review_opened_at,
      expected_cents: p.amount_cents,
      received_cents: p.cash_received_cents,
      client_reported_cents: p.client_reported_cents,
      client_dispute_reason: p.client_dispute_reason,
      payment_id: p.id,
    });
  }
  return out.sort((a, b) => (a.review_opened_at ?? '').localeCompare(b.review_opened_at ?? ''));
}
