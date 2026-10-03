import { describe, expect, it } from 'vitest';
import { demoWorld } from './demo/world';
import { paymentModelDemo } from './demo/payments';
import {
  CASH_STATUS,
  OUTCOMES,
  applyCashResolution,
  awaitingBasePayment,
  buildPaymentSummary,
  canWaiveBase,
  cashByTechCsvRows,
  cashByTechnician,
  cashDiff,
  cashReviews,
  cashTotals,
  EMPTY_CASH_REVIEW_FILTERS,
  activeCashReviewFilters,
  filterCashReviews,
  groupByOrder,
  isFailedCharge,
  kpiWindow,
  orderGmv,
  parsePaymentSummary,
  paymentLabel,
  paymentsReport,
  paymentsReportCsvRows,
  refundablePayments,
  reviewReason,
  ticketByCategory,
  validateResolution,
  type PayOrder,
  type PayRow,
  type PaymentsReportFilters,
} from './payments';

const w = demoWorld();
const NOW = Date.parse('2026-10-03T18:00:00Z');
const demo = paymentModelDemo(
  { orders: w.orders, payments: w.payments, events: w.events, ledger: w.ledger },
  { clientIds: ['c1', 'c2', 'c3'], techIds: ['t1', 't2'], catIds: ['cat-plumbing', 'cat-electrical'], now: NOW },
);
const ord = (folio: number) => demo.orders.find(o => o.folio === folio)!;
const pays = (folio: number) => demo.payments.filter(p => p.service_order_id === `SVC-${folio}`);
const byOrder = groupByOrder(demo.payments);
const names = {
  category: (id: string) => id,
  person: (id: string | null) => (id ? `P-${id}` : null),
};
const ALL: PaymentsReportFilters = { method: 'all', cashStatus: null, onlyReview: false };
const WIDE: [number, number] = [NOW - 30 * 864e5, NOW + 864e5];

describe('demo del modelo base + efectivo', () => {
  it('cubre cada estado de la tarifa base y del efectivo', () => {
    const base = new Set(demo.orders.filter(o => o.payment_model === 'base_cash').map(o => o.base_fee_status));
    for (const st of ['paid', 'refunded', 'waived', 'pending', 'failed', 'refund_pending'])
      expect(base.has(st)).toBe(true);
    const cash = new Set(demo.payments.filter(p => p.kind === 'quote').map(p => p.cash_status));
    for (const st of Object.keys(CASH_STATUS)) expect(cash.has(st as never)).toBe(true);
    expect(demo.orders.some(o => o.dispatch_status === 'awaiting_payment')).toBe(true);
    expect(ord(4006).cash_review_open).toBe(true);
    // la comisión del efectivo queda como deuda (commission_owed) del técnico
    const owed = demo.ledger.filter(l => l.service_order_id === 'SVC-4006' && l.entry_type === 'commission_owed');
    expect(owed.map(l => l.amount_cents)).toEqual([-36000]);
  });
});

describe('buildPaymentSummary / parsePaymentSummary', () => {
  it('pagado: base con tarjeta + efectivo confirmado', () => {
    const s = buildPaymentSummary(ord(4001), pays(4001));
    expect(s.paymentModel).toBe('base_cash');
    expect(s.base).toMatchObject({ feeCents: 35000, totalCents: 35000, status: 'paid', method: 'card' });
    expect(s.quote).toMatchObject({ method: 'cash', cashStatus: 'client_confirmed', expectedCents: 180000, receivedCents: 180000 });
    expect(s.totalCents).toBe(215000);
    expect(cashDiff(s.quote)).toBe(0);
  });

  it('disputado: diferencia y lo que dijo el cliente', () => {
    const s = buildPaymentSummary(ord(4006), pays(4006));
    expect(s.cashReviewOpen).toBe(true);
    expect(s.quote.clientReportedCents).toBe(180000);
    expect(s.quote.reviewStatus).toBe('open');
    expect(reviewReason(s.quote.reviewReason)).toMatch(/otro monto/);
  });

  it('reembolsada: refunded_cents y fecha', () => {
    const s = buildPaymentSummary(ord(4003), pays(4003));
    expect(s.base?.status).toBe('refunded');
    expect(s.base?.refundedCents).toBe(32000);
    expect(s.quote.cashStatus).toBeNull();
  });

  it('el recargo de emergencia vive en la tarifa base', () => {
    const s = buildPaymentSummary(ord(4011), pays(4011));
    expect(s.base).toMatchObject({ feeCents: 40000, surchargeCents: 20000, totalCents: 60000 });
  });

  it('parsea el jsonb del RPC y tolera faltantes', () => {
    const s = parsePaymentSummary({
      order_id: 'x',
      payment_model: 'base_cash',
      base: { fee_cents: 100, surcharge_cents: 20, total_cents: 120, method: 'card', status: 'paid', paid_at: '2026-10-01T00:00:00Z', refunded_cents: 0, payment_id: 'p1' },
      quote: { total_cents: 5000, method: 'cash', cash_status: 'disputed', expected_cents: 5000, received_cents: 5000, client_reported_cents: 0, review_status: 'open' },
      cash_review_open: true,
      total_cents: 5120,
    });
    expect(s?.base?.totalCents).toBe(120);
    expect(s?.quote.cashStatus).toBe('disputed');
    expect(s?.quote.clientReportedCents).toBe(0);
    expect(s?.cashReviewOpen).toBe(true);
    expect(parsePaymentSummary(null)).toBeNull();
    expect(parsePaymentSummary({ payment_model: 'legacy', quote: {} })?.base).toBeNull();
  });
});

describe('acciones', () => {
  it('canWaiveBase solo con visita sin pagar en solicitud abierta', () => {
    expect(canWaiveBase(ord(4009))).toBe(true);
    expect(canWaiveBase(ord(4010))).toBe(true);
    expect(canWaiveBase(ord(4001))).toBe(false);
    expect(awaitingBasePayment(ord(4009))).toBe(true);
    expect(awaitingBasePayment(ord(4004))).toBe(false);
  });

  it('refundablePayments: lo cobrado con saldo, tarifa base primero', () => {
    const r = refundablePayments(pays(4001));
    expect(r.map(p => p.kind)).toEqual(['base_fee', 'quote']);
    expect(refundablePayments(pays(4003))).toHaveLength(0);
    expect(paymentLabel(r[0])).toBe('Tarifa base · Tarjeta');
    expect(paymentLabel(r[1])).toBe('Presupuesto · Efectivo');
  });

  it('un presupuesto «no cobrado» no cuenta como cobro rechazado', () => {
    const notCollected = pays(4012).find(p => p.kind === 'quote')!;
    expect(notCollected.status).toBe('failed');
    expect(isFailedCharge(notCollected)).toBe(false);
    expect(isFailedCharge(pays(4010)[0])).toBe(true);
  });
});

describe('validateResolution', () => {
  it('exige resultado, nota y monto al ajustar', () => {
    expect(validateResolution({ outcome: null, notes: 'x', amountCents: null })).toMatch(/Elige/);
    expect(validateResolution({ outcome: 'confirm_technician', notes: '  ', amountCents: null })).toMatch(/nota/);
    expect(validateResolution({ outcome: 'adjust_amount', notes: 'ok', amountCents: 0 })).toMatch(/monto/);
    expect(validateResolution({ outcome: 'adjust_amount', notes: 'ok', amountCents: 100 })).toBeNull();
    expect(validateResolution({ outcome: 'not_collected', notes: 'ok', amountCents: null })).toBeNull();
    expect(OUTCOMES.map(o => o.value)).toEqual(['confirm_technician', 'adjust_amount', 'not_collected']);
  });
});

describe('applyCashResolution', () => {
  const run = (folio: number, outcome: 'confirm_technician' | 'adjust_amount' | 'not_collected', amt: number | null = null) => {
    const o = ord(folio);
    const p = pays(folio).find(x => x.kind === 'quote')!;
    return applyCashResolution(o, p, outcome, ' nota ', amt, '2026-10-03T19:00:00Z', 'admin');
  };

  it('confirmar lo del técnico: paga, mantiene la comisión y paga la orden completada', () => {
    const before = pays(4006).find(p => p.kind === 'quote')!;
    const r = run(4006, 'confirm_technician');
    expect(r.payment).toMatchObject({ status: 'paid', cash_status: 'resolved', review_status: 'resolved', cash_received_cents: 240000, review_notes: 'nota' });
    expect(r.payment.commission_cents).toBe(before.commission_cents);
    expect(r.order).toMatchObject({ cash_review_open: false, status: 'paid' });
  });

  it('ajustar monto: recalcula la comisión con el monto cobrado', () => {
    const r = run(4006, 'adjust_amount', 180000);
    expect(r.payment.cash_received_cents).toBe(180000);
    expect(r.payment.commission_cents).toBe(27000);
    expect(r.payment.status).toBe('paid');
  });

  it('no cobrado: el técnico asume (comisión 0, pago fallido, orden cerrada)', () => {
    const r = run(4007, 'not_collected');
    expect(r.payment).toMatchObject({ status: 'failed', cash_received_cents: 0, commission_cents: 0, review_outcome: 'not_collected' });
    expect(r.order.cash_review_open).toBe(false);
    expect(r.order.status).toBe('paid');
  });

  it('no cambia la orden si aún no está completada', () => {
    const o: PayOrder = { ...ord(4006), status: 'working' };
    const r = applyCashResolution(o, pays(4006).find(p => p.kind === 'quote')!, 'confirm_technician', 'n', null, 'now');
    expect(r.order.status).toBe('working');
  });
});

describe('forma de pago en reportes', () => {
  it('GMV sin filtro = base conservada + presupuesto; con filtro = cobrado neto del método', () => {
    expect(orderGmv(ord(4001), byOrder.get('SVC-4001'), 'all')).toBe(215000);
    expect(orderGmv(ord(4001), byOrder.get('SVC-4001'), 'card')).toBe(35000);
    expect(orderGmv(ord(4001), byOrder.get('SVC-4001'), 'cash')).toBe(180000);
    // reembolsada: la base ya no cuenta; refund_pending sí hasta que se reembolse.
    expect(orderGmv(ord(4003), byOrder.get('SVC-4003'), 'all')).toBe(0);
    expect(orderGmv(ord(4013), byOrder.get('SVC-4013'), 'all')).toBe(35000);
  });

  it('kpiWindow filtra órdenes por método y suma el GMV de ese método', () => {
    const [a, b] = WIDE;
    const all = kpiWindow(demo.orders, byOrder, a, b, 'all');
    const card = kpiWindow(demo.orders, byOrder, a, b, 'card');
    const cash = kpiWindow(demo.orders, byOrder, a, b, 'cash');
    expect(all.gmv_cents).toBeGreaterThanOrEqual(card.gmv_cents);
    expect(cash.orders).toBeGreaterThan(0);
    expect(cash.paid_orders).toBeLessThanOrEqual(all.paid_orders);
    // 4001 (pagado, base + efectivo) cuenta en ambos filtros
    const only = (m: 'card' | 'cash') =>
      kpiWindow([ord(4001)], groupByOrder(pays(4001)), a, b, m).gmv_cents;
    expect(only('card')).toBe(35000);
    expect(only('cash')).toBe(180000);
  });

  it('ticketByCategory respeta el método', () => {
    const [a, b] = WIDE;
    const rows = ticketByCategory([ord(4001)], groupByOrder(pays(4001)), [{ id: ord(4001).category_id, name: 'Plomería' }], a, b, 'cash');
    expect(rows[0]).toMatchObject({ paid_orders: 1, avg_ticket_cents: 180000 });
  });
});

describe('efectivo por técnico', () => {
  const [a, b] = WIDE;
  const rows = cashByTechnician(demo.payments, a, b, id => `T-${id}`);

  it('agrega esperado / reportado / confirmado / por confirmar / disputa y comisión', () => {
    expect(rows.length).toBeGreaterThan(0);
    const t = cashTotals(rows);
    expect(t.expected).toBeGreaterThan(0);
    expect(t.confirmed).toBeGreaterThan(0); // 4001 y 4008
    expect(t.awaiting).toBe(150000); // 4005
    expect(t.disputed).toBe(240000 + 95000); // 4006 + 4007
    expect(t.reviews).toBe(2);
    expect(t.pending).toBe(t.generated - t.recovered);
  });

  it('ordena por comisión pendiente y filtra por técnico y por periodo', () => {
    for (let i = 1; i < rows.length; i++)
      expect(rows[i - 1].commission_pending_cents).toBeGreaterThanOrEqual(rows[i].commission_pending_cents);
    expect(cashByTechnician(demo.payments, a, b, String, 'no-existe')).toEqual([]);
    expect(cashByTechnician(demo.payments, 0, 1, String)).toEqual([]);
  });

  it('CSV en pesos', () => {
    const csv = cashByTechCsvRows(rows);
    expect(csv[0]).toHaveProperty('Comisión pendiente');
    expect(Number(csv[0]['Efectivo esperado'])).toBe(Number(rows[0].cash_expected_cents) / 100);
  });
});

describe('reporte de pagos por servicio', () => {
  const [a, b] = WIDE;
  const run = (f: Partial<PaymentsReportFilters>, limit = 100, offset = 0) =>
    paymentsReport(demo.orders, byOrder, names, a, b, { ...ALL, ...f }, limit, offset);

  it('lista el desglose por servicio con total_count', () => {
    const rows = run({});
    const r = rows.find(x => x.folio === 4001)!;
    expect(r).toMatchObject({ base_method: 'card', quote_method: 'cash', base_total_cents: 35000, total_cents: 215000, cash_status: 'client_confirmed' });
    expect(rows[0].total_count).toBe(rows.length);
  });

  it('filtra por método, estado del efectivo y solo revisión', () => {
    expect(run({ onlyReview: true }).map(r => r.folio).sort()).toEqual([4006, 4007]);
    expect(run({ cashStatus: 'disputed' }).map(r => r.folio).sort()).toEqual([4006, 4007]);
    const cash = run({ method: 'cash' });
    expect(cash.every(r => r.quote_method === 'cash')).toBe(true);
    expect(run({ method: 'card' }).some(r => r.folio === 4001)).toBe(true);
    // la base exonerada no se cobró con tarjeta
    expect(run({ method: 'card' }).some(r => r.folio === 4004)).toBe(false);
  });

  it('pagina y conserva el total', () => {
    const p1 = run({}, 5, 0);
    const p2 = run({}, 5, 5);
    expect(p1).toHaveLength(5);
    expect(p2[0].order_id).not.toBe(p1[0].order_id);
    expect(p1[0].total_count).toBe(p2[0].total_count);
  });

  it('CSV con etiquetas legibles', () => {
    const csv = paymentsReportCsvRows(run({ onlyReview: true }));
    expect(csv[0]['Estado efectivo']).toBe('En disputa');
    expect(csv[0]['En revisión']).toBe('Sí');
    expect(csv[0]['Método presupuesto']).toBe('Efectivo');
  });
});

describe('cola de revisiones', () => {
  it('lista las órdenes con revisión abierta, la más antigua primero', () => {
    const q = cashReviews(demo.orders, byOrder, names.person);
    expect(q.map(r => r.folio).sort()).toEqual([4006, 4007]);
    expect(q[0].review_opened_at! <= q[1].review_opened_at!).toBe(true);
    expect(q.find(r => r.folio === 4007)).toMatchObject({ expected_cents: 95000, received_cents: 95000, client_reported_cents: 0 });
  });
});

// sanidad de tipos: PayRow exportado
const _row: PayRow | undefined = demo.payments[0];
void _row;

describe('filtros de la cola de revisión de efectivo', () => {
  const rows = [
    { review_reason: 'amount_mismatch', review_opened_at: new Date(NOW - 2 * 864e5).toISOString(), technician_id: 't1' },
    { review_reason: 'client_not_paid', review_opened_at: new Date(NOW - 3600e3).toISOString(), technician_id: 't2' },
    { review_reason: 'client_amount_mismatch', review_opened_at: new Date(NOW - 8 * 864e5).toISOString(), technician_id: 't1' },
  ];
  const f = EMPTY_CASH_REVIEW_FILTERS;
  it('sin filtros devuelve todo y cuenta 0', () => {
    expect(filterCashReviews(rows, f, NOW)).toHaveLength(3);
    expect(activeCashReviewFilters(f)).toBe(0);
  });
  it('filtra por motivo, antigüedad y técnico', () => {
    expect(filterCashReviews(rows, { ...f, reason: 'client_not_paid' }, NOW)).toHaveLength(1);
    expect(filterCashReviews(rows, { ...f, minDays: 7 }, NOW)).toHaveLength(1);
    expect(filterCashReviews(rows, { ...f, minDays: 1, technicianId: 't1' }, NOW)).toHaveLength(2);
    expect(activeCashReviewFilters({ reason: 'amount_mismatch', minDays: 3, technicianId: 't1' })).toBe(3);
  });
});
