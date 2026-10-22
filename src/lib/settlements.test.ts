import { describe, expect, it } from 'vitest';
import {
  balanceSentences,
  balanceTotals,
  canVoid,
  commissionLabel,
  firstName,
  folioLabel,
  mockBalances,
  mockRecordDelivery,
  mockRecordPayout,
  mockSummary,
  mockVoid,
  netTone,
  parseSummary,
  seedMockSettlements,
  sortBalances,
  sumSelected,
  SettlementError,
  type BalanceRow,
  type HistoryItem,
  type TechRef,
} from './settlements';

const NOW = Date.parse('2026-10-14T12:00:00Z');
const TECHS: TechRef[] = [
  { id: 'demo-tecnico', name: 'Ramón Torres', avatar_icon: 'casco', type: 'tumtto' },
  { id: 'u-ag', name: 'Adriana García', avatar_icon: 'gorra', type: 'independent' },
  { id: 'u-sc', name: 'Sergio Cruz', avatar_icon: 'goggles', type: 'third_party' },
  { id: 'u-jose', name: 'José', avatar_icon: null, type: 'independent' },
  { id: 'u-lupita', name: 'Lupita', avatar_icon: null, type: 'independent' },
];
const seed = () => seedMockSettlements(TECHS.map(t => t.id), () => [], NOW);

const row = (id: string, net: number): BalanceRow => ({
  technician_id: id, technician_name: id, avatar_icon: null, technician_type: 'independent',
  owed_to_technician_cents: Math.max(net, 0), owed_to_admin_cents: Math.max(-net, 0), net_cents: net,
  last_payout_at: null, last_delivery_at: null, pending_commissions_count: 0, pending_cash_count: 0,
});

describe('formato', () => {
  it('folio, comisión y nombre', () => {
    expect(folioLabel(123)).toBe('SVC-123');
    expect(commissionLabel('percent', 1000)).toBe('10 %');
    expect(commissionLabel('percent', 850)).toBe('8.5 %');
    expect(commissionLabel('fixed', 15000)).toContain('150.00');
    expect(firstName('  Ramón Torres ')).toBe('Ramón');
    expect(firstName('')).toBe('el técnico');
  });
  it('frases claras del saldo', () => {
    expect(balanceSentences('Ramón Torres', 43000, 135000)).toEqual([
      expect.stringMatching(/^Tu Mantenimiento le debe .*430\.00 a Ramón\.$/),
      expect.stringMatching(/^Ramón debe entregar .*1,350\.00 en efectivo\.$/),
    ]);
    expect(balanceSentences('Ramón', 0, 0)[0]).toMatch(/al corriente/);
    expect(netTone(5)).toBe('owes-tech');
    expect(netTone(-5)).toBe('owes-admin');
    expect(netTone(0)).toBe('even');
  });
});

describe('saldos', () => {
  it('ordena por |neto| y suma totales', () => {
    const rows = sortBalances([row('a', 100), row('b', -500), row('c', 300)]);
    expect(rows.map(r => r.technician_id)).toEqual(['b', 'c', 'a']);
    expect(balanceTotals(rows)).toEqual({ owedToTechnicians: 400, owedToAdmin: 500, net: -100 });
  });
  it('sumSelected ignora ids ausentes', () => {
    const items = [{ id: 'x', c: 5 }, { id: 'y', c: 7 }];
    expect(sumSelected(items, i => i.id, i => i.c, new Set(['y', 'z']))).toBe(7);
  });
});

describe('parseSummary', () => {
  it('normaliza el contrato', () => {
    const s = parseSummary({
      technician_id: 't', owed_to_technician_cents: 43000, owed_to_admin_cents: 135000, net_cents: -92000,
      pending_commissions: [{ order_id: 'o', folio: 123, finished_at: 'x', gross_cents: 130000, commission_type: 'fixed', commission_value: 100, commission_cents: 100 }],
      pending_cash: [{ payment_id: 'p', order_id: 'o', folio: 1, collected_at: 'y', amount_cents: 5 }],
      history: [{ kind: 'cash_delivery', id: 'h', amount_cents: 5, at: 'z', voided: true }],
    })!;
    expect(s.net_cents).toBe(-92000);
    expect(s.pending_commissions[0].commission_type).toBe('fixed');
    expect(s.history[0]).toMatchObject({ kind: 'cash_delivery', voided: true, method: null });
  });
  it('rechaza basura y tolera listas faltantes', () => {
    expect(parseSummary(null)).toBeNull();
    expect(parseSummary({ history: 'no' })!.history).toEqual([]);
  });
});

describe('canVoid', () => {
  const h = (id: string, kind: HistoryItem['kind'], hoursAgo: number, voided = false): HistoryItem => ({
    kind, id, amount_cents: 1, at: new Date(NOW - hoursAgo * 3600e3).toISOString(), method: null,
    reference: null, note: null, items_count: 1, voided, voided_at: null,
  });
  it('solo el último de su tipo y dentro de 24 h', () => {
    const hist = [h('new', 'payout', 2), h('old', 'payout', 5), h('d', 'cash_delivery', 30)];
    expect(canVoid(hist, hist[0], NOW)).toBe(true);
    expect(canVoid(hist, hist[1], NOW)).toBe(false);
    expect(canVoid(hist, hist[2], NOW)).toBe(false);
    expect(canVoid([h('v', 'payout', 1, true)], h('v', 'payout', 1, true), NOW)).toBe(false);
  });
  it('un anulado más reciente no bloquea al anterior', () => {
    const hist = [h('v', 'payout', 1, true), h('a', 'payout', 3)];
    expect(canVoid(hist, hist[1], NOW)).toBe(true);
  });
});

describe('motor maqueta', () => {
  it('semilla: saldos coherentes y mezcla de signos', () => {
    const st = seed();
    const rows = mockBalances(st, TECHS);
    expect(rows.some(r => r.net_cents > 0)).toBe(true);
    expect(rows.some(r => r.net_cents < 0)).toBe(true);
    expect(rows.find(r => r.technician_id === 'u-jose')!.net_cents).toBe(0);
    for (const r of rows) expect(r.net_cents).toBe(r.owed_to_technician_cents - r.owed_to_admin_cents);
    expect(Math.abs(rows[0].net_cents)).toBeGreaterThanOrEqual(Math.abs(rows[rows.length - 1].net_cents));
  });

  it('pagar todo deja en cero las comisiones y crea historial', () => {
    const st = seed();
    const before = mockSummary(st, 'u-ag');
    const res = mockRecordPayout(st, 'u-ag', { ids: null, method: 'transferencia', reference: ' SPEI-1 ' }, NOW);
    expect(res.amount_cents).toBe(before.owed_to_technician_cents);
    const after = mockSummary(st, 'u-ag');
    expect(after.pending_commissions).toHaveLength(0);
    expect(after.history[0]).toMatchObject({ kind: 'payout', reference: 'SPEI-1', items_count: before.pending_commissions.length });
    expect(() => mockRecordPayout(st, 'u-ag', { ids: null, method: 'otro' })).toThrow(SettlementError);
  });

  it('pago parcial por order_id; [] y ids ajenos fallan', () => {
    const st = seed();
    const s = mockSummary(st, 'demo-tecnico');
    const one = s.pending_commissions[0];
    const res = mockRecordPayout(st, 'demo-tecnico', { ids: [one.order_id], method: 'efectivo' }, NOW);
    expect(res).toMatchObject({ amount_cents: one.commission_cents, items_count: 1 });
    expect(mockSummary(st, 'demo-tecnico').pending_commissions).toHaveLength(s.pending_commissions.length - 1);
    expect(() => mockRecordPayout(st, 'demo-tecnico', { ids: [], method: 'otro' })).toThrow(/al menos/);
    expect(() => mockRecordPayout(st, 'demo-tecnico', { ids: [one.order_id], method: 'otro' })).toThrow(/ya fue liquidado/);
  });

  it('efectivo recibido y anulación libera los servicios', () => {
    const st = seed();
    const before = mockSummary(st, 'u-sc');
    expect(before.owed_to_admin_cents).toBeGreaterThan(0);
    const ids = [before.pending_cash[0].payment_id];
    const d = mockRecordDelivery(st, 'u-sc', { ids, method: 'deposito' }, NOW);
    expect(mockSummary(st, 'u-sc').owed_to_admin_cents).toBe(before.owed_to_admin_cents - d.amount_cents);
    const v = mockVoid(st, 'cash_delivery', d.id, NOW + 3600e3);
    expect(v.items_released).toBe(1);
    const after = mockSummary(st, 'u-sc');
    expect(after.owed_to_admin_cents).toBe(before.owed_to_admin_cents);
    expect(after.history.find(x => x.id === d.id)).toMatchObject({ voided: true, items_count: 0 });
    expect(() => mockVoid(st, 'cash_delivery', d.id, NOW)).toThrow(/ya estaba anulado/);
  });

  it('no anula registros viejos ni los que no son el último', () => {
    const st = seed();
    const old = mockSummary(st, 'demo-tecnico').history.find(h => h.kind === 'payout')!;
    expect(() => mockVoid(st, 'payout', old.id, NOW)).toThrow(/24 horas/);
    // el pago reciente de Lupita sí se puede anular y devuelve su comisión
    const rec = mockSummary(st, 'u-lupita').history.find(h => h.kind === 'payout')!;
    const owed = mockSummary(st, 'u-lupita').owed_to_technician_cents;
    mockVoid(st, 'payout', rec.id, NOW);
    expect(mockSummary(st, 'u-lupita').owed_to_technician_cents).toBe(owed + rec.amount_cents);
  });
});
