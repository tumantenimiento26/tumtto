// ponytail: órdenes del modelo «tarifa base en app + presupuesto en efectivo»
// SOLO para el modo maqueta: una por cada estado que la consola debe pintar
// (base pagada/reembolsada/exonerada/fallida, efectivo por confirmar, en
// disputa, resuelto…). Determinista; se anexa al historial sintético.
import type { Database } from '@/types/supabase';
import { commissionOf } from '@/lib/payments';
import { mxInstant, mxParts, ruleCents } from '@/lib/scheduleRules';
import { DEMO_RULES, DEMO_RULE_HOLIDAY, DEMO_RULE_NIGHT, DEMO_RULE_SUNDAY } from './schedule';

type T = Database['public']['Tables'];
type Order = T['service_orders']['Row'];
type Pay = T['payments']['Row'];
type Ev = T['service_order_status_events']['Row'];
type Led = T['ledger_entries']['Row'];
type Quote = T['service_quotes']['Row'];
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
  /** Estado de la cotización (por defecto: aceptada si hay efectivo; enviada en `quote`). */
  qs?: 'draft' | 'sent' | 'rejected';
  rejectReason?: string;
  /** Recargo de horario congelado (id de regla de demo/schedule.ts). */
  sched?: string;
  /** Fecha/hora (México) de la visita: la última ocurrencia antes de hoy; la orden se crea 2 h antes. */
  when?: { weekday?: number; date?: string; time: string };
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
  /** TUM-01: el dinero es de Tu Mantenimiento (revenue_model admin_owned). */
  admin?: boolean;
  /** TUM-02: el cliente eligió pagar la visita por transferencia (base_fee_method). */
  transfer?: boolean;
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
  // Modelo de cobro v2: recargos por horario congelados, cotización con estados y cierre por rechazo.
  { folio: 4014, agoH: 14, cat: 0, tech: 0, status: 'paid', title: 'Fuga en regadera (noche)', base: 35000, sched: DEMO_RULE_NIGHT, when: { time: '22:30' },
    baseStatus: 'paid', basePay: 'paid', quote: 90000, cash: { status: 'client_confirmed', received: 90000, response: 'confirmed', recovered: 13500 },
    path: ['requested', 'accepted', 'enroute', 'onsite', 'quote', 'working', 'completed', 'paid'] },
  { folio: 4015, agoH: 60, cat: 1, tech: 1, status: 'paid', title: 'Cambio de apagadores (domingo)', base: 30000, sched: DEMO_RULE_SUNDAY, when: { weekday: 0, time: '11:00' },
    baseStatus: 'paid', basePay: 'paid', quote: 60000, cash: { status: 'client_confirmed', received: 60000, response: 'confirmed', recovered: 9000 },
    path: ['requested', 'accepted', 'enroute', 'onsite', 'quote', 'working', 'completed', 'paid'] },
  { folio: 4016, agoH: 8, cat: 3, tech: 0, status: 'closed', title: 'Minisplit con ruido (nocturno)', base: 45000, sched: DEMO_RULE_NIGHT, when: { time: '21:45' },
    baseStatus: 'paid', basePay: 'paid', quote: 380000, qs: 'rejected', rejectReason: 'Muy caro; prefiero cotizar con otro proveedor.',
    path: ['requested', 'accepted', 'enroute', 'onsite', 'quote', 'closed'] },
  { folio: 4017, agoH: 5, cat: 2, tech: 0, status: 'quote', title: 'Fuga de gas en boiler (emergencia nocturna)', emergency: true, base: 40000, surcharge: 20000, sched: DEMO_RULE_NIGHT,
    when: { time: '23:15' }, baseStatus: 'paid', basePay: 'paid', quote: 150000, qs: 'sent',
    path: ['requested', 'accepted', 'enroute', 'onsite', 'quote'] },
  { folio: 4018, agoH: 2, cat: 4, tech: 1, status: 'onsite', title: 'Refrigerador no enfría', base: 30000, baseStatus: 'paid', basePay: 'paid', quote: 80000, qs: 'draft',
    path: ['requested', 'accepted', 'enroute', 'onsite'] },
  { folio: 4019, agoH: 26, cat: 4, tech: 1, status: 'closed', title: 'Lavadora con fuga', base: 30000, baseStatus: 'paid', basePay: 'paid', quote: 210000, qs: 'rejected',
    rejectReason: 'Prefiero comprar una lavadora nueva.',
    path: ['requested', 'accepted', 'enroute', 'onsite', 'quote', 'closed'] },
  { folio: 4020, agoH: 20, cat: 0, tech: 1, status: 'paid', title: 'Tubería rota (día festivo)', base: 35000, sched: DEMO_RULE_HOLIDAY, when: { date: '2026-09-16', time: '10:00' },
    baseStatus: 'paid', basePay: 'paid', quote: 70000, cash: { status: 'client_confirmed', received: 70000, response: 'confirmed', recovered: 10500 },
    path: ['requested', 'accepted', 'enroute', 'onsite', 'quote', 'working', 'completed', 'paid'] },
  // Reembolso de la visita que Stripe rechazó 10 veces: espera «Reintentar» en Finanzas.
  { folio: 4021, agoH: 50, cat: 1, tech: null, status: 'cancelled', title: 'Corto en cocina', base: 30000, baseStatus: 'refund_failed', basePay: 'paid',
    path: ['requested', 'cancelled'] },
  // TUM-01 · dinero de Tu Mantenimiento: sin crédito al técnico ni comisión de plataforma;
  // el técnico gana su comisión (technician_commissions).
  { folio: 4022, agoH: 30, cat: 0, tech: 0, status: 'paid', title: 'Cambio de llave de paso', admin: true, base: 35000, baseStatus: 'paid', basePay: 'paid', quote: 160000,
    cash: { status: 'client_confirmed', received: 160000, response: 'confirmed' },
    path: ['requested', 'accepted', 'enroute', 'onsite', 'quote', 'working', 'completed', 'paid'] },
  { folio: 4023, agoH: 10, cat: 1, tech: 1, status: 'completed', title: 'Instalación de lámparas', admin: true, base: 30000, baseStatus: 'paid', basePay: 'paid', quote: 110000,
    cash: { status: 'technician_confirmed', received: 110000 },
    path: ['requested', 'accepted', 'enroute', 'onsite', 'quote', 'working', 'completed'] },
  { folio: 4024, agoH: 22, cat: 3, tech: 1, status: 'completed', title: 'Carga de gas a minisplit', admin: true, base: 45000, baseStatus: 'paid', basePay: 'paid', quote: 120000,
    cash: { status: 'disputed', received: 90000, response: 'disputed', clientReported: 120000, reason: 'amount_mismatch',
      disputeReason: 'Pagué los 1,200 completos; el técnico reportó menos.' },
    path: ['requested', 'accepted', 'enroute', 'onsite', 'quote', 'working', 'completed'] },
  { folio: 4025, agoH: 34, cat: 4, tech: 0, status: 'closed', title: 'Secadora no calienta', admin: true, base: 30000, baseStatus: 'paid', basePay: 'paid', quote: 260000, qs: 'rejected',
    rejectReason: 'Me sale más barato reemplazarla.',
    path: ['requested', 'accepted', 'enroute', 'onsite', 'quote', 'closed'] },
  { folio: 4026, agoH: 16, cat: 2, tech: 0, status: 'cancelled', title: 'Revisión de fuga (cliente ausente)', admin: true, base: 40000, baseStatus: 'paid', basePay: 'paid',
    path: ['requested', 'accepted', 'enroute', 'cancelled'] },
  { folio: 4027, agoH: 1.5, cat: 0, tech: 1, status: 'working', title: 'Calentador sin flama', admin: true, base: 35000, baseStatus: 'paid', basePay: 'paid', quote: 85000,
    cash: { status: 'pending_technician' },
    path: ['requested', 'accepted', 'enroute', 'onsite', 'quote', 'working'] },
  { folio: 4028, agoH: 70, cat: 1, tech: 0, status: 'paid', title: 'Corto en recámara', admin: true, base: 30000, baseStatus: 'paid', basePay: 'paid', quote: 70000,
    cash: { status: 'resolved', received: 0, response: 'disputed', reason: 'client_not_paid', outcome: 'not_collected',
      notes: 'El cliente no pagó la reparación; se cobró solo la visita.', payStatus: 'failed' },
    path: ['requested', 'accepted', 'enroute', 'onsite', 'quote', 'working', 'completed', 'paid'] },
  // TUM-02/03 · adelanto por transferencia (comprobantes en demo/transfers.ts). No bloquea el servicio.
  { folio: 4029, agoH: 1.2, cat: 0, tech: 0, status: 'accepted', title: 'Fuga bajo el fregadero', admin: true, transfer: true, base: 35000,
    baseStatus: 'in_review', basePay: 'pending', path: ['requested', 'accepted'] },
  { folio: 4030, agoH: 4, cat: 1, tech: 1, status: 'enroute', title: 'Apagador quemado', admin: true, transfer: true, base: 30000,
    baseStatus: 'awaiting_transfer', basePay: 'pending', path: ['requested', 'accepted', 'enroute'] },
  { folio: 4031, agoH: 30, cat: 3, tech: 0, status: 'paid', title: 'Limpieza de minisplit', admin: true, transfer: true, base: 45000,
    baseStatus: 'paid', basePay: 'paid', quote: 60000, cash: { status: 'client_confirmed', received: 60000, response: 'confirmed' },
    path: ['requested', 'accepted', 'enroute', 'onsite', 'quote', 'working', 'completed', 'paid'] },
  { folio: 4032, agoH: 0.4, cat: 4, tech: null, status: 'requested', title: 'Refrigerador hace ruido', admin: true, transfer: true, base: 30000,
    baseStatus: 'in_review', basePay: 'pending', path: ['requested'] },
  { folio: 4033, agoH: 9, cat: 2, tech: null, status: 'cancelled', title: 'Revisión de boiler', admin: true, transfer: true, base: 40000,
    baseStatus: 'refund_pending', basePay: 'paid', path: ['requested', 'cancelled'] },
  { folio: 4034, agoH: 3, cat: 5, tech: 1, status: 'working', title: 'Cambio de chapa', admin: true, base: 25000,
    baseStatus: 'paid', basePay: 'paid', path: ['requested', 'accepted', 'enroute', 'onsite', 'working'] },
  // Decisión 7: servicio terminado con el adelanto aún sin pagar (queda adeudado por el cliente).
  { folio: 4036, agoH: 48, cat: 1, tech: 0, status: 'completed', title: 'Cambio de contactos', admin: true, transfer: true, base: 30000,
    baseStatus: 'awaiting_transfer', basePay: 'pending', path: ['requested', 'accepted', 'enroute', 'onsite', 'working', 'completed'] },
  { folio: 4037, agoH: 75, cat: 0, tech: 1, status: 'paid', title: 'Destape de coladera', admin: true, transfer: true, base: 35000,
    baseStatus: 'in_review', basePay: 'pending', path: ['requested', 'accepted', 'enroute', 'onsite', 'working', 'completed', 'paid'] },
  { folio: 4038, agoH: 26, cat: 3, tech: 0, status: 'cancelled', title: 'Revisión de minisplit (cliente canceló en sitio)', admin: true, transfer: true,
    base: 45000, baseStatus: 'awaiting_transfer', basePay: 'pending', path: ['requested', 'accepted', 'enroute', 'onsite', 'cancelled'] },
  { folio: 4035, agoH: 0.1, cat: 0, tech: null, status: 'requested', title: 'Calentador gotea', admin: true, transfer: true, base: 35000,
    baseStatus: 'awaiting_transfer', basePay: 'pending', path: ['requested'] },
];

/** Última ocurrencia (hora de México) de `time` —en `weekday` si se indica— antes de `before`. */
function lastOccurrence(before: number, w: { weekday?: number; date?: string; time: string }): number {
  if (w.date) return Date.parse(mxInstant(w.date, w.time));
  for (let i = 0; i < 15; i++) {
    const p = mxParts(before - i * 864e5);
    if (w.weekday != null && p.weekday !== w.weekday) continue;
    const t = Date.parse(mxInstant(p.date, w.time));
    if (t <= before) return t;
  }
  return before;
}

export function paymentModelDemo(
  base: { orders: Order[]; payments: Pay[]; events: Ev[]; ledger: Led[]; quotes: Quote[] },
  ctx: { clientIds: string[]; techIds: string[]; catIds: string[]; now: number },
): { orders: Order[]; payments: Pay[]; events: Ev[]; ledger: Led[]; quotes: Quote[] } {
  const orderT = base.orders[0];
  const payT = base.payments[0];
  const evT = base.events[0];
  const ledT = base.ledger[0];
  const orders: Order[] = [];
  const payments: Pay[] = [];
  const events: Ev[] = [];
  const ledger: Led[] = [];
  const quotes: Quote[] = [];

  SPECS.forEach((s, i) => {
    const id = `SVC-${s.folio}`;
    const created = s.when
      ? lastOccurrence(ctx.now - s.agoH * HOUR, s.when) - 2 * HOUR
      : ctx.now - s.agoH * HOUR;
    const rule = s.sched ? DEMO_RULES.find(r => r.id === s.sched)! : null;
    const schedCents = rule ? ruleCents(rule, s.base) : 0;
    const techId = s.tech == null ? null : ctx.techIds[s.tech % ctx.techIds.length];
    const clientId = ctx.clientIds[(i * 3 + 1) % ctx.clientIds.length];
    const last = Math.min(ctx.now - MIN, created + s.path.length * 25 * MIN);
    const baseTotal = s.base + (s.surcharge ?? 0) + schedCents;
    const rejected = s.qs === 'rejected';
    // Rechazada: el servidor reinicia el total cotizado de la orden a 0; borrador: aún no existe para el cliente.
    const quoted = s.quote == null || s.qs === 'draft' ? null : rejected ? 0 : s.quote;
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
      commission_cents: !s.admin && s.cash?.received != null ? commissionOf(s.cash.received, 1500) : null,
      accepted_at: at('accepted'),
      completed_at: at('completed'),
      paid_at: at('paid') ?? (rejected ? at('closed') : null),
      cancelled_at: at('cancelled'),
      cancellation_reason: s.status === 'cancelled' ? 'Cancelada por el cliente antes de la visita' : null,
      payment_model: 'base_cash',
      revenue_model: s.admin ? 'admin_owned' : 'technician_owned',
      base_fee_cents: s.base,
      base_surcharge_cents: (s.surcharge ?? 0) + schedCents,
      scheduled_for: s.when ? iso(created + 2 * HOUR) : null,
      schedule_surcharge_rule_id: rule?.id ?? null,
      schedule_surcharge_name: rule?.name ?? null,
      schedule_surcharge_cents: rule ? schedCents : null,
      schedule_surcharge_bps: rule?.surcharge_type === 'percent' ? rule.value : 0,
      base_total_cents: baseTotal,
      base_fee_status: s.baseStatus,
      base_fee_method: s.transfer ? 'transfer' : 'card',
      base_fee_paid_at: ['paid', 'refund_pending', 'refund_failed', 'refunded'].includes(s.baseStatus) ? iso(created + 4 * MIN) : null,
      // admin_owned también marca la tarifa como «conservada» (sin acreditar al técnico).
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
      // Transferencia aceptada: method 'transfer', sin comisión de Stripe.
      const byTransfer = !!s.transfer && paid;
      const fee = byTransfer ? 0 : Math.round(baseTotal * 0.029) + 300;
      payments.push({
        ...payT,
        id: `pay-b-${s.folio}`,
        service_order_id: id,
        client_id: clientId,
        technician_id: s.admin ? null : techId,
        kind: 'base_fee',
        method: byTransfer ? 'transfer' : 'card',
        status: s.basePay,
        amount_cents: baseTotal,
        commission_cents: s.admin ? 0 : commissionOf(baseTotal, 1500),
        platform_fee_cents: s.admin ? 0 : commissionOf(baseTotal, 1500),
        stripe_fee_cents: paid ? fee : 0,
        stripe_payment_intent_id: paid && !byTransfer ? `pi_mock_b${s.folio}` : null,
        refunded_cents: s.refunded ? baseTotal : 0,
        refund_requested_at: ['refund_pending', 'refund_failed'].includes(s.baseStatus) ? iso(created + 10 * MIN) : null,
        tech_credit_cents:
          !s.admin && s.path.includes('enroute') && s.baseStatus === 'paid'
            ? baseTotal - commissionOf(baseTotal, 1500) - fee
            : 0,
        paid_at: paid ? iso(created + 4 * MIN) : null,
        cash_status: null,
        created_at: iso(created + MIN),
        updated_at: iso(created + 4 * MIN),
      });
    }

    if (s.quote != null) {
      const total = s.quote;
      const sent = s.qs ? s.qs !== 'draft' : true;
      const settled = !s.qs && !!s.cash;
      const qAt = (min: number) => iso(Math.min(ctx.now - MIN, created + min * MIN));
      quotes.push({
        id: `q-${s.folio}`,
        service_order_id: id,
        technician_id: techId ?? ctx.techIds[0],
        labor_cents: Math.round(total * 0.6),
        materials_cents: total - Math.round(total * 0.6),
        surcharge_cents: 0,
        total_cents: total,
        notes: rejected ? 'Reparación mayor: incluye refacciones y mano de obra.' : 'Mano de obra y materiales.',
        submitted_at: sent ? qAt(100) : null,
        accepted_at: settled ? qAt(110) : null,
        rejected_at: rejected ? qAt(115) : null,
        reject_reason: rejected ? (s.rejectReason ?? null) : null,
        created_at: qAt(95),
        updated_at: qAt(115),
      });
    }

    if (quoted != null && s.cash) {
      const c = s.cash;
      const got = c.received ?? null;
      const settled = c.status === 'client_confirmed' || (c.status === 'resolved' && c.payStatus !== 'failed');
      const qStatus = c.payStatus ?? (settled ? 'paid' : 'pending');
      // admin_owned: payments.commission_cents = 0 y sin deuda en el ledger.
      const commission = !s.admin && got != null ? commissionOf(got, 1500) : 0;
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
    quotes: [...base.quotes, ...quotes],
  };
}
