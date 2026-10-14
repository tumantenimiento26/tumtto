import { describe, expect, it } from 'vitest';
import { demoWorld } from './demo/world';
import { paymentModelDemo } from './demo/payments';
import { demoTransfers } from './demo/transfers';
import { BASE_STATUS, buildPaymentSummary, parsePaymentSummary } from './payments';
import {
  DEFAULT_TRANSFER_FILTERS,
  activeTransferFilters,
  baseMethodOf,
  canReviewTransfer,
  applyOrder,
  depositArgs,
  depositFormDirty,
  depositFormOf,
  depositTitle,
  hasActiveDeposit,
  movedIds,
  parseDepositAccounts,
  type DepositAccount,
  filterTransfers,
  folioOf,
  groupDigits,
  isAdvanceOwed,
  owedAdvances,
  isTransferRefundPending,
  listArgs,
  pageCount,
  paginate,
  parseTransferDetail,
  proofKind,
  rangeBounds,
  transferStatus,
  validateDepositForm,
  type DepositForm,
} from './transfers';

const VALID_CLABE = '032180000118359719';
const form = (p: Partial<DepositForm> = {}): DepositForm => ({
  bank: 'BBVA México',
  clabe: VALID_CLABE,
  card: '',
  holder: 'Tu Mantenimiento S.A. de C.V.',
  alias: '',
  ...p,
});

describe('cuenta de depósito', () => {
  it('acepta una cuenta válida (tarjeta opcional, espacios y guiones permitidos)', () => {
    expect(validateDepositForm(form())).toEqual({});
    expect(validateDepositForm(form({ clabe: '0321 8000 0118 3597 19', card: '4152-3138-0000-0001' }))).toEqual({});
  });

  it('exige 18 dígitos y dígito verificador correcto en la CLABE', () => {
    expect(validateDepositForm(form({ clabe: '03218000011835971' })).clabe).toMatch(/18 dígitos/);
    expect(validateDepositForm(form({ clabe: '03218000011835971a' })).clabe).toMatch(/18 dígitos/);
    expect(validateDepositForm(form({ clabe: '032180000118359718' })).clabe).toMatch(/dígito verificador/);
  });

  it('tarjeta: vacía o exactamente 16 dígitos', () => {
    expect(validateDepositForm(form({ card: '415231380000000' })).card).toMatch(/16 dígitos/);
    expect(validateDepositForm(form({ card: '41523138000000011' })).card).toMatch(/16 dígitos/);
    expect(validateDepositForm(form({ card: '4152313800000001' })).card).toBeUndefined();
  });

  it('banco y titular obligatorios con sus límites', () => {
    const e = validateDepositForm(form({ bank: '  ', holder: '' }));
    expect(e.bank).toMatch(/banco es obligatorio/);
    expect(e.holder).toMatch(/titular es obligatorio/);
    expect(validateDepositForm(form({ bank: 'x'.repeat(81) })).bank).toBeDefined();
    expect(validateDepositForm(form({ holder: 'x'.repeat(121) })).holder).toBeDefined();
  });

  it('normaliza los args del RPC (vacíos → null, p_id null = crear)', () => {
    expect(depositArgs(form({ bank: ' BBVA ', clabe: '0321-8000-0118-3597-19', alias: ' Principal ' }))).toEqual({
      p_id: null,
      p_bank: 'BBVA',
      p_clabe: VALID_CLABE,
      p_holder: 'Tu Mantenimiento S.A. de C.V.',
      p_card_number: null,
      p_alias: 'Principal',
    });
    expect(depositArgs(form({ card: '4152 3138 0000 0001' }), 'x1')).toMatchObject({ p_id: 'x1', p_card_number: '4152313800000001', p_alias: null });
  });

  it('valida el alias (máx. 60)', () => {
    expect(validateDepositForm(form({ alias: 'x'.repeat(60) })).alias).toBeUndefined();
    expect(validateDepositForm(form({ alias: 'x'.repeat(61) })).alias).toMatch(/60/);
  });

  const acct = (p: Partial<DepositAccount> = {}): DepositAccount => ({
    id: 'a', bank: 'BBVA', clabe: VALID_CLABE, card_number: null, holder: 'TM', alias: null,
    is_active: true, sort_order: 0, created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z', ...p,
  });

  it('lee admin_list_deposit_accounts ordenado y descarta filas inválidas', () => {
    const list = parseDepositAccounts([
      { id: 'b', bank: 'HSBC', clabe: VALID_CLABE, holder: 'TM', is_active: false, sort_order: 1, card_number: null, alias: 'Respaldo' },
      { id: 'a', bank: 'BBVA', clabe: VALID_CLABE, holder: 'TM', is_active: true, sort_order: 0, card_number: '4152313800000001', alias: null },
      { bank: 'sin id' },
    ]);
    expect(list.map(a => a.id)).toEqual(['a', 'b']);
    expect(list[1]).toMatchObject({ is_active: false, alias: 'Respaldo' });
    expect(parseDepositAccounts(null)).toEqual([]);
    expect(parseDepositAccounts({})).toEqual([]);
  });

  it('título, formulario y cambios', () => {
    expect(depositTitle(acct({ alias: ' Principal ' }))).toBe('Principal');
    expect(depositTitle(acct())).toBe('BBVA');
    const a = acct({ card_number: '4152313800000001' });
    expect(depositFormDirty(depositFormOf(a), a)).toBe(false);
    expect(depositFormDirty({ ...depositFormOf(a), clabe: '0321 8000 0118 3597 19' }, a)).toBe(false);
    expect(depositFormDirty({ ...depositFormOf(a), holder: 'Otro' }, a)).toBe(true);
  });

  it('avisa si no hay cuentas activas', () => {
    expect(hasActiveDeposit([])).toBe(false);
    expect(hasActiveDeposit([acct({ is_active: false })])).toBe(false);
    expect(hasActiveDeposit([acct({ is_active: false }), acct({ id: 'b' })])).toBe(true);
  });

  it('reordena: movedIds en los bordes y applyOrder renumera', () => {
    expect(movedIds(['a', 'b', 'c'], 'b', -1)).toEqual(['b', 'a', 'c']);
    expect(movedIds(['a', 'b', 'c'], 'b', 1)).toEqual(['a', 'c', 'b']);
    expect(movedIds(['a', 'b'], 'a', -1)).toBeNull();
    expect(movedIds(['a', 'b'], 'b', 1)).toBeNull();
    expect(movedIds(['a', 'b'], 'z', 1)).toBeNull();
    const out = applyOrder([acct({ id: 'a' }), acct({ id: 'b' }), acct({ id: 'c' })], ['c', 'a']);
    expect(out.map(x => [x.id, x.sort_order])).toEqual([['c', 0], ['a', 1], ['b', 2]]);
  });

  it('agrupa dígitos', () => {
    expect(groupDigits(VALID_CLABE)).toBe('0321 8000 0118 3597 19');
    expect(groupDigits(null)).toBe('—');
  });
});

const row = (p: Partial<{ status: string; created_at: string; folio: number; client_name: string | null; client_phone: string | null; reference: string }>) => ({
  status: 'submitted',
  created_at: '2026-10-10T18:00:00.000Z',
  folio: 100,
  client_name: 'Ana López',
  client_phone: '+523311112222',
  reference: 'SPEI 123',
  ...p,
});

describe('filtros de transferencias', () => {
  it('folio: «SVC-123», «svc123» o «123»', () => {
    expect(folioOf('SVC-123')).toBe(123);
    expect(folioOf('svc123')).toBe(123);
    expect(folioOf(' 123 ')).toBe(123);
    expect(folioOf('Ana')).toBeNull();
  });

  it('el rango de días es inclusivo: hasta = inicio del día siguiente', () => {
    const b = rangeBounds({ from: new Date(2026, 9, 1, 15), to: new Date(2026, 9, 3, 9) })!;
    expect(b.from).toEqual(new Date(2026, 9, 1));
    expect(b.to).toEqual(new Date(2026, 9, 4));
    expect(rangeBounds(null)).toBeNull();
  });

  it('arma los args del RPC (estado «todas» y búsqueda vacía se omiten)', () => {
    expect(listArgs(DEFAULT_TRANSFER_FILTERS, 0)).toEqual({ p_status: 'submitted', p_limit: 20, p_offset: 0 });
    const a = listArgs({ status: 'all', range: { from: new Date(2026, 9, 1), to: new Date(2026, 9, 1) }, search: ' SVC-9 ' }, 2, 10);
    expect(a).toMatchObject({ p_search: 'SVC-9', p_limit: 10, p_offset: 20 });
    expect(a).not.toHaveProperty('p_status');
    expect(new Date(a.p_to!).getTime() - new Date(a.p_from!).getTime()).toBe(864e5);
  });

  it('filtra por estado, fecha y búsqueda (folio, nombre, teléfono, referencia), del más nuevo al más viejo', () => {
    const rows = [
      row({ folio: 1, created_at: '2026-10-01T18:00:00.000Z', reference: 'BBVA 1' }),
      row({ folio: 2, status: 'accepted', client_name: 'Luis', client_phone: '+523399998888' }),
      row({ folio: 3, created_at: '2026-10-11T18:00:00.000Z', client_name: 'Marta' }),
    ];
    const all = { ...DEFAULT_TRANSFER_FILTERS, status: 'all' as const };
    expect(filterTransfers(rows, DEFAULT_TRANSFER_FILTERS).map(r => r.folio)).toEqual([3, 1]);
    expect(filterTransfers(rows, all).map(r => r.folio)).toEqual([3, 2, 1]);
    expect(filterTransfers(rows, { ...all, search: 'SVC-2' }).map(r => r.folio)).toEqual([2]);
    expect(filterTransfers(rows, { ...all, search: 'marta' }).map(r => r.folio)).toEqual([3]);
    expect(filterTransfers(rows, { ...all, search: '9999' }).map(r => r.folio)).toEqual([2]);
    expect(filterTransfers(rows, { ...all, search: 'bbva' }).map(r => r.folio)).toEqual([1]);
    const day = new Date('2026-10-11T18:00:00.000Z');
    expect(filterTransfers(rows, { ...all, range: { from: day, to: day } }).map(r => r.folio)).toEqual([3]);
    expect(activeTransferFilters({ ...all, search: 'x', range: { from: day, to: day } })).toBe(2);
  });

  it('pagina con total_count como el RPC', () => {
    const rows = Array.from({ length: 45 }, (_, i) => ({ i }));
    const p = paginate(rows, 2);
    expect(p.map(r => r.i)).toEqual([40, 41, 42, 43, 44]);
    expect(p[0].total_count).toBe(45);
    expect(pageCount(45)).toBe(3);
    expect(pageCount(0)).toBe(1);
  });
});

describe('detalle y estados', () => {
  it('lee admin_get_payment_transfer', () => {
    const d = parseTransferDetail({
      transfer: { id: 't1', service_order_id: 'o1', client_id: 'c1', amount_cents: 30000, reference: 'SPEI 1', proof_path: 'c1/o1/a.pdf', status: 'submitted', reviewer_name: null, created_at: '2026-10-10T00:00:00Z' },
      proof: { bucket: 'payment-proofs', path: 'c1/o1/a.pdf' },
      order: { id: 'o1', folio: 77, title: 'Fuga', status: 'accepted', category_name: 'Plomería', base_fee_method: 'transfer', base_fee_status: 'in_review', base_total_cents: 30000 },
      client: { id: 'c1', full_name: 'Ana', phone: '+52331' },
      history: [{ id: 't1', status: 'submitted', amount_cents: 30000, reference: 'SPEI 1', created_at: '2026-10-10T00:00:00Z' }, { bogus: true }],
    });
    expect(d?.transfer.id).toBe('t1');
    expect(d?.proofPath).toBe('c1/o1/a.pdf');
    expect(d?.order).toMatchObject({ folio: 77, base_fee_method: 'transfer', base_fee_status: 'in_review' });
    expect(d?.client.full_name).toBe('Ana');
    expect(d?.history).toHaveLength(1);
    expect(parseTransferDetail(null)).toBeNull();
    expect(parseTransferDetail({ transfer: {} })).toBeNull();
  });

  it('etiquetas, vista previa y reglas', () => {
    expect(transferStatus('submitted').label).toBe('En revisión');
    expect(transferStatus('cancelled').label).toMatch(/tarjeta/);
    expect(BASE_STATUS.awaiting_transfer.label).toBe('Pendiente de transferencia');
    expect(BASE_STATUS.in_review.label).toBe('En revisión');
    expect(proofKind('a/b/c.JPG')).toBe('image');
    expect(proofKind('a/b/c.pdf')).toBe('pdf');
    expect(proofKind('a/b/c.heic')).toBe('other');
    expect(canReviewTransfer('submitted')).toBe(true);
    expect(canReviewTransfer('accepted')).toBe(false);
    expect(baseMethodOf('transfer')).toBe('transfer');
    expect(baseMethodOf(undefined)).toBe('card');
    expect(isTransferRefundPending({ base_fee_method: 'transfer', base_fee_status: 'refund_pending' })).toBe(true);
    expect(isTransferRefundPending({ base_fee_method: 'card', base_fee_status: 'refund_pending' })).toBe(false);
  });

  it('get_order_payment_summary trae método y último comprobante del adelanto', () => {
    const s = parsePaymentSummary({
      order_id: 'o1',
      payment_model: 'base_cash',
      base: { status: 'awaiting_transfer', method: 'transfer', total_cents: 30000, transfer: { id: 't1', status: 'rejected', amount_cents: 30000, reference: 'R', reject_reason: 'Monto no coincide', submitted_at: '2026-10-10T00:00:00Z', reviewed_at: null } },
      quote: {},
    });
    expect(s?.base?.method).toBe('transfer');
    expect(s?.base?.transfer).toMatchObject({ id: 't1', status: 'rejected', rejectReason: 'Monto no coincide' });
    const card = parsePaymentSummary({ order_id: 'o2', payment_model: 'base_cash', base: { status: 'paid', transfer: null }, quote: {} });
    expect(card?.base).toMatchObject({ method: 'card', transfer: null });
  });
});

describe('maqueta', () => {
  const base = demoWorld();
  const pm = paymentModelDemo(base, {
    clientIds: base.profiles.filter(p => p.role === 'client').map(p => p.id),
    techIds: base.technicians.map(t => t.id),
    catIds: base.categories.map(c => c.id),
    now: Date.now(),
  });
  const transfers = demoTransfers(pm.orders, Date.now());

  it('cubre todos los estados del comprobante y del adelanto', () => {
    expect(new Set(transfers.map(t => t.status))).toEqual(new Set(['submitted', 'accepted', 'rejected', 'cancelled']));
    const statuses = new Set(pm.orders.filter(o => o.base_fee_method === 'transfer').map(o => o.base_fee_status));
    for (const s of ['awaiting_transfer', 'in_review', 'paid', 'refund_pending']) expect(statuses).toContain(s);
    expect(pm.orders.some(isTransferRefundPending)).toBe(true);
  });

  it('cada comprobante cuelga de su orden con la ruta del bucket y el monto del adelanto', () => {
    for (const t of transfers) {
      const o = pm.orders.find(x => x.id === t.service_order_id)!;
      expect(t.proof_path.startsWith(`${o.client_id}/${o.id}/`)).toBe(true);
      expect(t.amount_cents).toBe(o.base_total_cents);
      if (t.status === 'rejected') expect(t.reject_reason).toBeTruthy();
    }
    // A lo más un comprobante en revisión por orden, y solo en órdenes in_review.
    for (const t of transfers.filter(x => x.status === 'submitted'))
      expect(pm.orders.find(o => o.id === t.service_order_id)?.base_fee_status).toBe('in_review');
  });

  it('el resumen local usa base_fee_method de la orden', () => {
    const o = pm.orders.find(x => x.base_fee_method === 'transfer' && x.base_fee_status === 'paid')!;
    const s = buildPaymentSummary(o, pm.payments.filter(p => p.service_order_id === o.id));
    expect(s.base?.method).toBe('transfer');
    expect(pm.payments.find(p => p.service_order_id === o.id && p.kind === 'base_fee')?.method).toBe('transfer');
  });
});

describe('adelantos pendientes (decisión 7)', () => {
  const o = (p: Partial<Parameters<typeof owedAdvances>[0][number]>) => ({
    id: 'o',
    status: 'completed',
    payment_model: 'base_cash',
    base_fee_status: 'awaiting_transfer',
    base_total_cents: 30000,
    client_id: 'c',
    completed_at: '2026-10-05T00:00:00Z',
    paid_at: null,
    cancelled_at: null,
    updated_at: '2026-10-06T00:00:00Z',
    ...p,
  });

  it('solo servicios terminados con el adelanto sin pagar, el más antiguo primero, con su último comprobante', () => {
    const rows = owedAdvances(
      [
        o({ id: 'a' }),
        o({ id: 'b', status: 'cancelled', base_fee_status: 'in_review', completed_at: null, cancelled_at: '2026-10-01T00:00:00Z' }),
        o({ id: 'c', status: 'working' }),
        o({ id: 'd', base_fee_status: 'paid' }),
        o({ id: 'e', payment_model: 'legacy' }),
      ],
      [
        { id: 'p1', service_order_id: 'a', status: 'rejected', reject_reason: 'x', created_at: '2026-10-02T00:00:00Z' },
        { id: 'p2', service_order_id: 'a', status: 'rejected', reject_reason: 'y', created_at: '2026-10-03T00:00:00Z' },
      ],
    );
    expect(rows.map(r => r.orderId)).toEqual(['b', 'a']);
    expect(rows[1].proof?.id).toBe('p2');
    expect(rows[0].proof).toBeNull();
    expect(rows[0].finishedAt).toBe('2026-10-01T00:00:00Z');
  });

  it('la maqueta trae adelantos adeudados con y sin comprobante', () => {
    const base = demoWorld();
    const pm = paymentModelDemo(base, {
      clientIds: base.profiles.filter(p => p.role === 'client').map(p => p.id),
      techIds: base.technicians.map(t => t.id),
      catIds: base.categories.map(c => c.id),
      now: Date.now(),
    });
    const rows = owedAdvances(pm.orders, demoTransfers(pm.orders, Date.now()));
    expect(rows.length).toBeGreaterThanOrEqual(3);
    expect(rows.some(r => r.proof === null)).toBe(true);
    expect(rows.some(r => r.proof?.status === 'submitted')).toBe(true);
    expect(rows.every(r => isAdvanceOwed({ status: r.status, payment_model: 'base_cash', base_fee_status: r.baseStatus }))).toBe(true);
  });
});
