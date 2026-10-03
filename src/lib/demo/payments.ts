// ponytail: órdenes del modelo «tarifa base en app + presupuesto en efectivo»
// SOLO para el modo maqueta: una por cada estado que la consola debe pintar
// (base pagada/reembolsada/exonerada/fallida, efectivo por confirmar, en
// disputa, resuelto…). Determinista; se anexa al historial sintético.
import type { Database } from '@/types/supabase';
import { commissionOf } from '@/lib/payments';

type T = Database['public']['Tables'];
type Order = T['service_orders']['Row'];
type Pay = T['payments']['Row'];
type Ev = T['service_order_status_events']['Row'];
type Led = T['ledger_entries']['Row'];
type Status = Order['status'];

const MIN = 60_000;
const HOUR = 60 * MIN;
const iso = (ms: number) => new Date(ms).toISOString();

interface Spec {
  folio: number;
  agoH: number; // creada hace N horas
  cat: number;
  tech: number | null;
  status: Status;
  title: string;
  emergency?: boolean;
  base: number;
  surcharge?: number;
  baseStatus: Order['base_fee_status'];
  basePay?: Pay['status'] | null;
  refunded?: boolean;
  quote?: number;
  /** estado del efectivo (kind=quote) */
  cash?: {
    status: NonNullable<Pay['cash_status']>;
    received?: number;
    clientReported?: number | null;
    response?: Pay['client_cash_response'];
    reason?: string;
    disputeReason?: string;
    outcome?: string;
    notes?: string;
    recovered?: number;
    payStatus?: Pay['status'];
  };
  dispatch?: string;
  path: Status[];
}

const SPECS: Spec[] = [
  { folio: 4001, agoH: 52, cat: 0, tech: 0, status: 'paid', title: 'Fuga en cocina', base: 35000, baseStatus: 'paid', basePay: 'paid', quote: 180000,
    cash: { status: 'client_confirmed', received: 180000, response: 'confirmed', recovered: 27000 },
    path: ['requested', 'accepted', 'enroute', 'onsite', 'quote', 'working', 'completed', 'paid'] },
  { folio: 4002, agoH: 3, cat: 1, tech: 1, status: 'enroute', title: 'Contacto sin corriente', base: 30000, baseStatus: 'paid', basePay: 'paid',
    path: ['requested', 'accepted', 'enroute'] },
  { folio: 4003, agoH: 30, cat: 2, tech: null, status: 'cancelled', title: 'Revisión de instalación', base: 32000, baseStatus: 'refunded', basePay: 'refunded', refunded: true,
    path: ['requested', 'cancelled'] },
  { folio: 4004, agoH: 6, cat: 3, tech: 0, status: 'accepted', title: 'Minisplit no enfría', base: 45000, baseStatus: 'waived', basePay: 'cancelled',
    path: ['requested', 'accepted'] },
  { folio: 4005, agoH: 20, cat: 0, tech: 0, status: 'completed', title: 'Cambio de WC', base: 35000, baseStatus: 'paid', basePay: 'paid', quote: 150000,
    cash: { status: 'technician_confirmed', received: 150000 },
    path: ['requested', 'accepted', 'enroute', 'onsite', 'quote', 'working', 'completed'] },
  { folio: 4006, agoH: 28, cat: 1, tech: 1, status: 'completed', title: 'Tablero se bota', base: 30000, baseStatus: 'paid', basePay: 'paid', quote: 240000,
    cash: { status: 'disputed', received: 240000, clientReported: 180000, response: 'disputed', reason: 'client_amount_mismatch',
      disputeReason: 'Pagué 1,800; el técnico anotó 2,400 y no me dio recibo.' },
    path: ['requested', 'accepted', 'enroute', 'onsite', 'quote', 'working', 'completed'] },
  { folio: 4007, agoH: 40, cat: 3, tech: 0, status: 'completed', title: 'Mantenimiento AA', base: 45000, baseStatus: 'paid', basePay: 'paid', quote: 95000,
    cash: { status: 'disputed', received: 95000, clientReported: 0, response: 'disputed', reason: 'client_not_paid',
      disputeReason: 'El técnico se fue sin cobrar; no pagué nada todavía.' },
    path: ['requested', 'accepted', 'enroute', 'onsite', 'quote', 'working', 'completed'] },
  { folio: 4008, agoH: 96, cat: 4, tech: 1, status: 'paid', title: 'Lavadora no centrifuga', base: 30000, baseStatus: 'paid', basePay: 'paid', quote: 200000,
    cash: { status: 'resolved', received: 180000, response: 'disputed', reason: 'amount_mismatch', outcome: 'adjust_amount',
      notes: 'Cliente y técnico acordaron 1,800 por descuento en refacción.', recovered: 20000 },
    path: ['requested', 'accepted', 'enroute', 'onsite', 'quote', 'working', 'completed', 'paid'] },
  { folio: 4009, agoH: 0.2, cat: 2, tech: null, status: 'requested', title: 'Olor a gas', emergency: true, base: 40000, surcharge: 20000, baseStatus: 'pending', basePay: 'pending', dispatch: 'awaiting_payment',
    path: ['requested'] },
  { folio: 4010, agoH: 0.5, cat: 5, tech: null, status: 'requested', title: 'Apertura de puerta', base: 25000, baseStatus: 'failed', basePay: 'failed',
    path: ['requested'] },
  { folio: 4011, agoH: 2, cat: 2, tech: 0, status: 'working', title: 'Fuga de gas en estufa', emergency: true, base: 40000, surcharge: 20000, baseStatus: 'paid', basePay: 'paid', quote: 120000,
    cash: { status: 'pending_technician' },
    path: ['requested', 'accepted', 'enroute', 'onsite', 'quote', 'working'] },
  { folio: 4012, agoH: 120, cat: 3, tech: 0, status: 'paid', title: 'Instalación de minisplit', base: 45000, baseStatus: 'paid', basePay: 'paid', quote: 260000,
    cash: { status: 'resolved', received: 0, response: 'disputed', reason: 'client_not_paid', outcome: 'not_collected',
      notes: 'El cliente no respondió y el técnico no presentó evidencia del cobro.', payStatus: 'failed' },
    path: ['requested', 'accepted', 'enroute', 'onsite', 'quote', 'working', 'completed', 'paid'] },
  { folio: 4013, agoH: 1, cat: 0, tech: null, status: 'cancelled', title: 'Drenaje tapado', base: 35000, baseStatus: 'refund_pending', basePay: 'paid',
    path: ['requested', 'cancelled'] },
];

export function paymentModelDemo(
  base: { orders: Order[]; payments: Pay[]; events: Ev[]; ledger: Led[] },
  ctx: { clientIds: string[]; techIds: string[]; catIds: string[]; now: number },
): { orders: Order[]; payments: Pay[]; events: Ev[]; ledger: Led[] } {
  const orderT = base.orders[0];
  const payT = base.payments[0];
  const evT = base.events[0];
  const ledT = base.ledger[0];
  const orders: Order[] = [];
  const payments: Pay[] = [];
  const events: Ev[] = [];
  const ledger: Led[] = [];

  SPECS.forEach((s, i) => {
    const id = `SVC-${s.folio}`;
    const created = ctx.now - s.agoH * HOUR;
    const techId = s.tech == null ? null : ctx.techIds[s.tech % ctx.techIds.length];
    const clientId = ctx.clientIds[(i * 3 + 1) % ctx.clientIds.length];
    const last = Math.min(ctx.now - MIN, created + s.path.length * 25 * MIN);
    const baseTotal = s.base + (s.surcharge ?? 0);
    const quoted = s.quote ?? null;
    const done = s.path.includes('completed');
    const at = (st: Status) => {
      const k = s.path.indexOf(st);
      return k < 0 ? null : iso(Math.min(ctx.now - MIN, created + k * 25 * MIN));
    };

    const ord: Order = {
      ...orderT,
      id,
      folio: s.folio,
      client_id: clientId,
      technician_id: techId,
      category_id: ctx.catIds[s.cat % ctx.catIds.length],
      status: s.status,
      title: s.title,
      description: null,
      priority: s.emergency ? 'emergency' : 'normal',
      is_urgent: !!s.emergency,
      emergency_surcharge_cents: s.emergency ? (s.surcharge ?? 0) : null,
      dispatch_status: s.dispatch ?? (s.emergency ? 'assigned' : null),
      needs_manual_assignment: false,
      is_disputed: false,
      quoted_subtotal_cents: quoted,
      quoted_total_cents: quoted,
      commission_bps: 1500,
      commission_cents: s.cash?.received != null ? commissionOf(s.cash.received, 1500) : null,
      accepted_at: at('accepted'),
      completed_at: at('completed'),
      paid_at: at('paid'),
      cancelled_at: at('cancelled'),
      cancellation_reason: s.status === 'cancelled' ? 'Cancelada por el cliente antes de la visita' : null,
      payment_model: 'base_cash',
      base_fee_cents: s.base,
      base_surcharge_cents: s.surcharge ?? 0,
      base_total_cents: baseTotal,
      base_fee_status: s.baseStatus,
      base_fee_paid_at: ['paid', 'refund_pending', 'refunded'].includes(s.baseStatus) ? iso(created + 4 * MIN) : null,
      base_fee_credited_at: s.path.includes('enroute') && s.baseStatus === 'paid' ? iso(created + 50 * MIN) : null,
      base_fee_refunded_at: s.baseStatus === 'refunded' ? iso(created + 40 * MIN) : null,
      cash_review_open: s.cash?.status === 'disputed',
      created_at: iso(created),
      updated_at: iso(last),
    };
    orders.push(ord);

    s.path.forEach((st, k) => {
      if (k === 0) return;
      const t = iso(Math.min(ctx.now - MIN, created + k * 25 * MIN));
      events.push({
        ...evT,
        id: `mev-${id}-${k}`,
        service_order_id: id,
        from_status: s.path[k - 1],
        to_status: st,
        actor_id: st === 'cancelled' ? clientId : (techId ?? clientId),
        note: null,
        is_revert: false,
        created_at: t,
        updated_at: t,
      });
    });

    if (s.basePay) {
      const paid = ['paid', 'refunded'].includes(s.basePay);
      const fee = Math.round(baseTotal * 0.029) + 300;
      payments.push({
        ...payT,
        id: `pay-b-${s.folio}`,
        service_order_id: id,
        client_id: clientId,
        technician_id: techId,
        kind: 'base_fee',
        method: 'card',
        status: s.basePay,
        amount_cents: baseTotal,
        commission_cents: commissionOf(baseTotal, 1500),
        platform_fee_cents: commissionOf(baseTotal, 1500),
        stripe_fee_cents: paid ? fee : 0,
        stripe_payment_intent_id: paid ? `pi_mock_b${s.folio}` : null,
        refunded_cents: s.refunded ? baseTotal : 0,
        refund_requested_at: s.baseStatus === 'refund_pending' ? iso(created + 10 * MIN) : null,
        tech_credit_cents:
          s.path.includes('enroute') && s.baseStatus === 'paid'
            ? baseTotal - commissionOf(baseTotal, 1500) - fee
            : 0,
        paid_at: paid ? iso(created + 4 * MIN) : null,
        cash_status: null,
        created_at: iso(created + MIN),
        updated_at: iso(created + 4 * MIN),
      });
    }

    if (quoted != null && s.cash) {
      const c = s.cash;
      const got = c.received ?? null;
      const settled = c.status === 'client_confirmed' || (c.status === 'resolved' && c.payStatus !== 'failed');
      const qStatus = c.payStatus ?? (settled ? 'paid' : 'pending');
      const commission = got != null ? commissionOf(got, 1500) : 0;
      const reviewOpen = c.status === 'disputed';
      payments.push({
        ...payT,
        id: `pay-q-${s.folio}`,
        service_order_id: id,
        client_id: clientId,
        technician_id: techId,
        kind: 'quote',
        method: 'cash',
        status: qStatus,
        amount_cents: quoted,
        commission_cents: commission,
        platform_fee_cents: commission,
        stripe_payment_intent_id: null,
        stripe_fee_cents: 0,
        refunded_cents: 0,
        tech_credit_cents: 0,
        cash_status: c.status,
        cash_received_cents: got,
        cash_reported_at: got != null ? iso(created + (done ? 150 : 120) * MIN) : null,
        cash_reported_by: got != null ? techId : null,
        cash_confirmed_at: settled ? iso(created + 200 * MIN) : null,
        cash_debt_recovered_cents: c.recovered ?? 0,
        client_cash_response: c.response ?? null,
        client_cash_responded_at: c.response ? iso(created + 180 * MIN) : null,
        client_reported_cents: c.clientReported ?? null,
        client_dispute_reason: c.disputeReason ?? null,
        review_status: reviewOpen ? 'open' : c.outcome ? 'resolved' : null,
        review_reason: c.reason ?? null,
        review_opened_at: c.reason ? iso(created + 185 * MIN) : null,
        review_resolved_at: c.outcome ? iso(created + 260 * MIN) : null,
        review_resolved_by: c.outcome ? 'u-admin' : null,
        review_outcome: c.outcome ?? null,
        review_notes: c.notes ?? null,
        paid_at: settled ? iso(created + 200 * MIN) : null,
        created_at: iso(created + 60 * MIN),
        updated_at: iso(last),
      });
      // Comisión del efectivo = deuda del técnico (commission_owed), recuperada
      // sola con fondos retenidos de la plataforma (balance neutro).
      if (techId && commission > 0 && c.status !== 'pending_technician') {
        const L = (suffix: string, type: Led['entry_type'], cents: number, description: string): Led => ({
          ...ledT,
          id: `mled-${s.folio}-${suffix}`,
          technician_id: techId,
          service_order_id: id,
          payment_id: `pay-q-${s.folio}`,
          entry_type: type,
          amount_cents: cents,
          description,
          created_at: iso(created + 160 * MIN),
        });
        ledger.push(L('owed', 'commission_owed', -commission, 'Comisión del efectivo'));
        if ((c.recovered ?? 0) > 0) {
          ledger.push(L('rec', 'commission_owed', c.recovered!, 'Comisión recuperada de fondos retenidos'));
          ledger.push(L('col', 'commission_collected', -c.recovered!, 'Comisión cobrada de fondos retenidos'));
        }
      }
    }
  });

  return {
    orders: [...base.orders, ...orders],
    payments: [...base.payments, ...payments],
    events: [...base.events, ...events],
    ledger: [...base.ledger, ...ledger],
  };
}
