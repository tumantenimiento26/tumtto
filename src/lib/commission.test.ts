import { describe, expect, it } from 'vitest';
import { demoWorld } from './demo/world';
import { paymentModelDemo } from './demo/payments';
import {
  commissionFromSetting,
  commissionRateLabel,
  commissionReport,
  commissionReportCsvRows,
  commissionToInput,
  commissionTotals,
  computeTechnicianCommission,
  isAdminOwned,
  orderCollected,
  parseCommissionConfig,
  parseCommissionInput,
  revenueModelOf,
  snapshotCommission,
  snapshotDue,
  techAdminOwnedSummary,
  techIncome,
  type TechnicianCommission,
  type TechnicianCommissionType,
} from './commission';
import {
  applyCashResolution,
  buildPaymentSummary,
  cashByTechnician,
  outcomesFor,
  OUTCOMES,
  OUTCOMES_ADMIN_OWNED,
  rejectedCloseIds,
} from './payments';

const w = demoWorld();
const NOW = Date.parse('2026-10-11T18:00:00Z');
const demo = paymentModelDemo(
  { orders: w.orders, payments: w.payments, events: w.events, ledger: w.ledger, quotes: w.quotes },
  { clientIds: ['c1', 'c2', 'c3'], techIds: ['t1', 't2'], catIds: ['cat-plumbing', 'cat-electrical'], now: NOW },
);
const ord = (folio: number) => demo.orders.find(o => o.folio === folio)!;
const pays = (folio: number) => demo.payments.filter(p => p.service_order_id === `SVC-${folio}`);
const hints = (o: { hint: string }[]) => o.map(x => x.hint).join(' ');
const PCT85: { type: TechnicianCommissionType; value: number } = { type: 'percent', value: 8500 };
const AT = '2026-10-11T12:00:00.000Z';
const snap = (folio: number, cfg = PCT85, prev: TechnicianCommission | null = null, at = AT) =>
  snapshotCommission(ord(folio), pays(folio), cfg, prev, at)!;

describe('computeTechnicianCommission (espejo de app.compute_technician_commission)', () => {
  it('porcentaje en bps redondeado; fijo sin tope; 0 permitido', () => {
    expect(computeTechnicianCommission('percent', 8500, 195000)).toBe(165750);
    expect(computeTechnicianCommission('percent', 3333, 101)).toBe(34); // 33.66 → 34
    expect(computeTechnicianCommission('percent', 0, 195000)).toBe(0);
    expect(computeTechnicianCommission('fixed', 15000, 0)).toBe(15000);
    expect(computeTechnicianCommission('fixed', 50000, 30000)).toBe(50000); // no se topa al bruto
    expect(computeTechnicianCommission('fixed', 0, 99999)).toBe(0);
    expect(computeTechnicianCommission('percent', -5, 1000)).toBe(0);
    expect(computeTechnicianCommission('percent', 10000, null)).toBe(0);
  });
});

describe('revenue_model', () => {
  it('admin_owned solo con el valor exacto; lo demás es technician_owned', () => {
    expect(revenueModelOf({ revenue_model: 'admin_owned' })).toBe('admin_owned');
    expect(revenueModelOf({ revenue_model: 'technician_owned' })).toBe('technician_owned');
    expect(revenueModelOf(null)).toBe('technician_owned');
    expect(revenueModelOf({})).toBe('technician_owned');
    expect(isAdminOwned(ord(4022))).toBe(true);
    expect(isAdminOwned(ord(4001))).toBe(false);
  });

  it('demo admin_owned: sin crédito al técnico ni comisión de plataforma', () => {
    const p = pays(4022);
    const base = p.find(x => x.kind === 'base_fee')!;
    expect(base).toMatchObject({ technician_id: null, tech_credit_cents: 0, commission_cents: 0 });
    expect(p.find(x => x.kind === 'quote')!.commission_cents).toBe(0);
    expect(demo.ledger.some(l => l.service_order_id === 'SVC-4022')).toBe(false);
    expect(ord(4022).base_fee_credited_at).not.toBeNull(); // la tarifa se «conserva»
    expect(buildPaymentSummary(ord(4022), p).revenueModel).toBe('admin_owned');
    expect(buildPaymentSummary(ord(4001), pays(4001)).revenueModel).toBe('technician_owned');
  });
});

describe('orderCollected (espejo de app.order_collected_cents)', () => {
  it('base pagada + efectivo reportado; neto de reembolsos; sin efectivo pendiente o fallido', () => {
    expect(orderCollected(pays(4022))).toEqual({ baseCents: 35000, quoteCents: 160000 });
    // efectivo por confirmar sí cuenta (el técnico ya lo reportó)
    expect(orderCollected(pays(4023))).toEqual({ baseCents: 30000, quoteCents: 110000 });
    // en disputa: cuenta lo que reportó el técnico
    expect(orderCollected(pays(4024)).quoteCents).toBe(90000);
    // pendiente del técnico: no cuenta
    expect(orderCollected(pays(4027)).quoteCents).toBe(0);
    // «no se cobró» (failed): 0
    expect(orderCollected(pays(4028))).toEqual({ baseCents: 30000, quoteCents: 0 });
    // base reembolsada
    expect(orderCollected(pays(4003)).baseCents).toBe(0);
  });
});

describe('snapshotCommission (espejo de app.snapshot_technician_commission)', () => {
  it('cuándo hay snapshot', () => {
    expect(snapshotDue(ord(4022))).toBe(true); // paid
    expect(snapshotDue(ord(4023))).toBe(true); // completed
    expect(snapshotDue(ord(4025))).toBe(true); // closed por rechazo
    expect(snapshotDue(ord(4026))).toBe(true); // cancelada tras iniciar la visita
    expect(snapshotDue(ord(4027))).toBe(false); // working
    expect(snapshotDue(ord(4001))).toBe(false); // modelo anterior
    expect(snapshotDue({ ...ord(4026), base_fee_credited_at: null })).toBe(false);
  });

  it('congela la tarifa vigente y calcula sobre el bruto', () => {
    const s = snap(4022);
    expect(s).toMatchObject({
      service_order_id: 'SVC-4022',
      technician_id: 't1',
      commission_type: 'percent',
      commission_value: 8500,
      base_collected_cents: 35000,
      quote_collected_cents: 160000,
      gross_collected_cents: 195000,
      commission_cents: 165750,
      order_status: 'paid',
      snapshot_at: AT,
    });
    // cerrada por rechazo: comisión sobre la visita conservada
    expect(snap(4025, { type: 'fixed', value: 20000 })).toMatchObject({ gross_collected_cents: 30000, commission_cents: 20000 });
    // modelo anterior: sin snapshot
    expect(snapshotCommission(ord(4001), pays(4001), PCT85, null, AT)).toBeNull();
  });

  it('recalcula con la tarifa congelada aunque la config cambie', () => {
    const first = snap(4024);
    expect(first.commission_cents).toBe(computeTechnicianCommission('percent', 8500, 45000 + 90000));
    // la revisión ajusta el efectivo; la config ya es otra
    const resolved = applyCashResolution(ord(4024), pays(4024).find(p => p.kind === 'quote')!, 'adjust_amount', 'ok', 120000, AT);
    const later = '2026-10-12T00:00:00.000Z';
    const again = snapshotCommission(resolved.order, [...pays(4024).filter(p => p.kind !== 'quote'), resolved.payment], { type: 'fixed', value: 1 }, first, later)!;
    expect(again).toMatchObject({
      commission_type: 'percent',
      commission_value: 8500,
      quote_collected_cents: 120000,
      commission_cents: computeTechnicianCommission('percent', 8500, 165000),
      order_status: 'paid',
      snapshot_at: AT,
      computed_at: later,
    });
  });
});

describe('orderCollected: el efectivo único en persona', () => {
  const quote = {
    kind: 'quote' as const,
    status: 'paid' as const,
    amount_cents: 130000,
    refunded_cents: 0,
    cash_received_cents: 130000,
    cash_status: 'client_confirmed',
    base_included_cents: 30000,
  };
  it('la visita incluida se reporta como tarifa base y el resto como cotización', () => {
    expect(orderCollected([quote])).toEqual({ baseCents: 30000, quoteCents: 100000 });
  });
  it('cotización rechazada: todo lo cobrado es tarifa base', () => {
    expect(
      orderCollected([{ ...quote, amount_cents: 30000, cash_received_cents: 30000 }]),
    ).toEqual({ baseCents: 30000, quoteCents: 0 });
  });
  it('si se recibió menos que la visita, la base no excede lo cobrado', () => {
    expect(orderCollected([{ ...quote, cash_received_cents: 20000 }])).toEqual({ baseCents: 20000, quoteCents: 0 });
  });
  it('sin base incluida todo es cotización (como antes)', () => {
    expect(orderCollected([{ ...quote, base_included_cents: 0 }])).toEqual({ baseCents: 0, quoteCents: 130000 });
  });
});

describe('revisión de efectivo en admin_owned', () => {
  it('la comisión de plataforma sigue lo recibido (informativa, ya no se pone en 0)', () => {
    const pay = pays(4024).find(p => p.kind === 'quote')!;
    for (const outcome of ['confirm_technician', 'adjust_amount', 'not_collected'] as const) {
      const r = applyCashResolution(ord(4024), pay, outcome, 'nota', 100000, AT);
      const expected =
        outcome === 'confirm_technician' ? pay.commission_cents : outcome === 'adjust_amount' ? 15000 : 0;
      expect(r.payment.commission_cents).toBe(expected);
      expect(r.payment.platform_fee_cents).toBe(expected);
      expect(r.order.commission_cents).toBe(expected);
    }
    // el modelo anterior sigue recalculando la comisión
    const legacy = applyCashResolution(ord(4006), pays(4006).find(p => p.kind === 'quote')!, 'adjust_amount', 'n', 200000, AT);
    expect(legacy.payment.commission_cents).toBe(30000);
  });

  it('las pistas de cada resultado hablan del efectivo de Tu Mantenimiento', () => {
    expect(outcomesFor('technician_owned')).toBe(OUTCOMES);
    expect(outcomesFor('admin_owned')).toBe(OUTCOMES_ADMIN_OWNED);
    expect(OUTCOMES_ADMIN_OWNED.map(o => o.value)).toEqual(OUTCOMES.map(o => o.value));
    expect(hints(OUTCOMES_ADMIN_OWNED)).not.toMatch(/comisi/i);
    expect(hints(OUTCOMES_ADMIN_OWNED)).toMatch(/Tu Mantenimiento/);
  });

  it('efectivo por técnico: admin_owned sin tarifa acreditada ni comisión generada', () => {
    const rej = rejectedCloseIds(demo.orders, demo.quotes);
    const only = (folios: number[]) => folios.map(ord);
    const onlyPays = (folios: number[]) => folios.flatMap(pays);
    const rows = cashByTechnician(onlyPays([4022, 4025]), 0, NOW + 864e5, String, null, { orders: only([4022, 4025]), rejected: rej });
    const t1 = rows.find(r => r.technician_id === 't1')!;
    expect(t1).toMatchObject({ base_fee_credited_cents: 0, schedule_surcharge_credited_cents: 0, commission_generated_cents: 0, quotes_rejected: 1 });
    expect(t1.cash_reported_cents).toBe(160000);
  });
});

describe('config de la comisión', () => {
  it('parsea el jsonb del RPC y el setting', () => {
    expect(parseCommissionConfig({ type: 'fixed', value: 15000, updated_at: 'x', admin_owned_enabled: true })).toEqual({
      type: 'fixed',
      value: 15000,
      updatedAt: 'x',
      adminOwnedEnabled: true,
    });
    expect(parseCommissionConfig({ type: 'raro', value: -3 })).toMatchObject({ type: 'percent', value: 0, adminOwnedEnabled: false });
    expect(parseCommissionConfig(null)).toBeNull();
    expect(parseCommissionConfig([1])).toBeNull();
    expect(commissionFromSetting(undefined)).toEqual({ type: 'percent', value: 8500 });
    expect(commissionFromSetting({ type: 'fixed', value: 0 })).toEqual({ type: 'fixed', value: 0 });
  });

  it('input ↔ valor del RPC (pesos → centavos, % → bps)', () => {
    expect(parseCommissionInput('fixed', '150')).toEqual({ value: 15000, error: null });
    expect(parseCommissionInput('fixed', '0')).toEqual({ value: 0, error: null });
    expect(parseCommissionInput('fixed', '12,5')).toEqual({ value: 1250, error: null });
    expect(parseCommissionInput('percent', '85')).toEqual({ value: 8500, error: null });
    expect(parseCommissionInput('percent', '12.34')).toEqual({ value: 1234, error: null });
    expect(parseCommissionInput('percent', '100.5').error).toMatch(/100/);
    expect(parseCommissionInput('fixed', '-1').value).toBeNull();
    expect(parseCommissionInput('percent', '').value).toBeNull();
    expect(parseCommissionInput('fixed', 'abc').value).toBeNull();
    expect(commissionToInput({ value: 8500 })).toBe('85');
    expect(commissionToInput({ value: 15050 })).toBe('150.5');
  });

  it('etiquetas', () => {
    expect(commissionRateLabel('percent', 8500)).toBe('85 % de lo cobrado');
    expect(commissionRateLabel('fixed', 15000)).toMatch(/^\$150\.00 por servicio$/);
  });
});

describe('reporte de comisiones (espejo de admin_report_technician_commissions)', () => {
  const rows = [4022, 4023, 4024, 4025, 4026, 4028].map(f => snap(f));

  it('agrupa por técnico en la ventana de snapshot_at y calcula el neto de TM', () => {
    const r = commissionReport(rows, Date.parse(AT), Date.parse(AT) + 1, id => `T-${id}`);
    const t1 = r.find(x => x.technician_id === 't1')!;
    const t1Rows = rows.filter(x => x.technician_id === 't1');
    expect(t1.services_count).toBe(t1Rows.length);
    expect(t1.gross_collected_cents).toBe(t1Rows.reduce((s, x) => s + (x.gross_collected_cents ?? 0), 0));
    expect(t1.admin_net_cents).toBe(t1.gross_collected_cents - t1.commission_cents);
    expect(t1.technician_name).toBe('T-t1');
    for (let i = 1; i < r.length; i++) expect(r[i - 1].commission_cents).toBeGreaterThanOrEqual(r[i].commission_cents);
    // ventana [from, to)
    expect(commissionReport(rows, Date.parse(AT) + 1, NOW, String)).toEqual([]);
    expect(commissionReport(rows, 0, NOW, String, 't2').every(x => x.technician_id === 't2')).toBe(true);
  });

  it('totales y CSV en pesos', () => {
    const r = commissionReport(rows, 0, NOW, String);
    const z = commissionTotals(r);
    expect(z.services).toBe(rows.length);
    expect(z.net).toBe(z.gross - z.commission);
    expect(z.gross).toBe(z.base + z.quote);
    const csv = commissionReportCsvRows(r);
    expect(csv[0]['Ingreso neto Tu Mantenimiento']).toBe(Number(r[0].admin_net_cents) / 100);
    expect(csv[0]).toHaveProperty('Comisión técnico');
  });
});

describe('técnico: comisiones y efectivo de Tu Mantenimiento', () => {
  const snaps = [4022, 4025, 4026, 4028].map(f => snap(f));

  it('resumen admin_owned (espejo de get_technician_cash_summary.admin_owned)', () => {
    const s = techAdminOwnedSummary('t1', demo.orders, demo.payments, snaps);
    const mine = snaps.filter(x => x.technician_id === 't1');
    expect(s.servicesCount).toBe(mine.length);
    expect(s.commissionEarnedCents).toBe(mine.reduce((a, x) => a + x.commission_cents, 0));
    // efectivo reportado en órdenes admin_owned de t1, sin el fallido de 4028
    const held = demo.orders
      .filter(o => o.technician_id === 't1' && isAdminOwned(o))
      .flatMap(o => demo.payments.filter(p => p.service_order_id === o.id && p.kind === 'quote' && p.status !== 'failed' && p.cash_status !== 'pending_technician'))
      .reduce((a, p) => a + (p.cash_received_cents ?? 0), 0);
    expect(s.cashHeldForAdminCents).toBe(held);
    expect(held).toBeGreaterThan(0);
  });

  it('ingreso: modelo anterior neto de comisión + comisiones de TM', () => {
    const legacyOnly = techIncome('t1', [ord(4001)], pays(4001), [], 0);
    const paid = pays(4001).filter(p => p.status === 'paid');
    expect(legacyOnly).toBe(paid.reduce((a, p) => a + p.amount_cents - p.commission_cents, 0));
    // en admin_owned los pagos no cuentan como ingreso del técnico; su comisión sí
    const withAdmin = techIncome('t1', [ord(4001), ord(4022)], [...pays(4001), ...pays(4022)], [snap(4022)], 0);
    expect(withAdmin).toBe(legacyOnly + snap(4022).commission_cents);
    // ventana
    expect(techIncome('t1', [ord(4022)], pays(4022), [snap(4022)], Date.parse(AT) + 1)).toBe(0);
  });
});
