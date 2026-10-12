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
  depositArgs,
  filterTransfers,
  folioOf,
  groupDigits,
  isTransferRefundPending,
  listArgs,
  pageCount,
  paginate,
  parseDepositAccount,
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

  it('normaliza los args del RPC (tarjeta vacía → sin p_card_number)', () => {
    expect(depositArgs(form({ bank: ' BBVA ', clabe: '0321-8000-0118-3597-19' }))).toEqual({
      p_bank: 'BBVA',
      p_clabe: VALID_CLABE,
      p_holder: 'Tu Mantenimiento S.A. de C.V.',
      p_card_number: undefined,
    });
    expect(depositArgs(form({ card: '4152 3138 0000 0001' })).p_card_number).toBe('4152313800000001');
  });

  it('lee get_transfer_deposit_account (configurada o no)', () => {
    expect(parseDepositAccount({ configured: false, bank: null, clabe: null, card_number: null, holder: null, updated_at: null }).configured).toBe(false);
    const a = parseDepositAccount({ configured: true, bank: 'BBVA', clabe: VALID_CLABE, card_number: null, holder: 'TM', updated_at: '2026-10-01T00:00:00Z' });
    expect(a).toMatchObject({ configured: true, bank: 'BBVA', clabe: VALID_CLABE });
    expect(parseDepositAccount(null).configured).toBe(false);
    expect(groupDigits(VALID_CLABE)).toBe('0321 8000 0118 3597 19');
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
