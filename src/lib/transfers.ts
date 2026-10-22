// TUM-02/03 · adelanto (tarifa base) pagado por transferencia y revisado en
// «Revisión de pagos». Puro y probado en transfers.test.ts. Espeja los RPC del
// backend (admin_list_payment_transfers, admin_get_payment_transfer,
// admin_set_transfer_deposit_account) para validar en el cliente y para el
// modo maqueta; en producción manda el servidor.

import type { Database, Json } from '@/types/supabase';
import type { NullableCols } from '@/types/rpc';
import type { DateRange } from '@/lib/calendar';
import { isValidClabe } from '@/lib/clabe';
import type { Tone } from '@/lib/payments';

type Fn = Database['public']['Functions'];
export type PaymentTransfer = Database['public']['Tables']['payment_transfers']['Row'];
export type PaymentTransferStatus = 'submitted' | 'accepted' | 'rejected' | 'cancelled';
export type BaseFeeMethod = 'card' | 'transfer' | 'cash';
/** Fila de admin_list_payment_transfers (los LEFT JOIN y la revisión pueden venir null). */
export type TransferRow = NullableCols<
  Fn['admin_list_payment_transfers']['Returns'][number],
  'client_name' | 'client_phone' | 'reject_reason' | 'reviewed_by' | 'reviewer_name' | 'reviewed_at'
>;

// ── Etiquetas ────────────────────────────────────────────────────────────────

export const TRANSFER_STATUS: Record<PaymentTransferStatus, { label: string; tone: Tone }> = {
  submitted: { label: 'En revisión', tone: 'warning' },
  accepted: { label: 'Aceptada', tone: 'success' },
  rejected: { label: 'Rechazada', tone: 'danger' },
  cancelled: { label: 'Cancelada (pagada con tarjeta)', tone: 'neutral' },
};
export const transferStatus = (s: string | null | undefined) =>
  TRANSFER_STATUS[s as PaymentTransferStatus] ?? { label: s ?? '—', tone: 'neutral' as Tone };

export const BASE_METHOD_LABEL: Record<BaseFeeMethod, string> = { card: 'Tarjeta', transfer: 'Transferencia', cash: 'Efectivo' };
export const baseMethodOf = (m: string | null | undefined): BaseFeeMethod =>
  m === 'transfer' ? 'transfer' : m === 'cash' ? 'cash' : 'card';

/** Motivos rápidos de rechazo (el admin puede escribir otro). */
export const QUICK_REJECT_REASONS = [
  'Monto no coincide',
  'Comprobante ilegible',
  'No se encontró el depósito',
  'La referencia no coincide',
] as const;
export const REJECT_REASON_MAX = 500;
export const REFUND_REFERENCE_MAX = 120;

// ── Filtros y paginación ─────────────────────────────────────────────────────

export interface TransferFilters {
  /** 'all' = todos los estados. Por defecto la cola: 'submitted'. */
  status: 'all' | PaymentTransferStatus;
  range: DateRange;
  search: string;
}
export const DEFAULT_TRANSFER_FILTERS: TransferFilters = { status: 'submitted', range: null, search: '' };
export const TRANSFER_PAGE_SIZE = 20;
export const STATUS_OPTIONS: { value: TransferFilters['status']; label: string }[] = [
  { value: 'submitted', label: 'Por revisar' },
  { value: 'accepted', label: 'Aceptadas' },
  { value: 'rejected', label: 'Rechazadas' },
  { value: 'cancelled', label: 'Canceladas' },
  { value: 'all', label: 'Todas' },
];

/** Filtros activos además del estado (para el contador del botón). */
export const activeTransferFilters = (f: TransferFilters) => (f.range ? 1 : 0) + (f.search.trim() ? 1 : 0);

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
/** Rango de días (inclusivo) → [desde, hasta) como el RPC (`to` = inicio del día siguiente). */
export function rangeBounds(r: DateRange): { from: Date; to: Date } | null {
  if (!r) return null;
  const to = startOfDay(r.to);
  to.setDate(to.getDate() + 1);
  return { from: startOfDay(r.from), to };
}

/** Argumentos de admin_list_payment_transfers para una página. */
export function listArgs(f: TransferFilters, page: number, pageSize = TRANSFER_PAGE_SIZE) {
  const b = rangeBounds(f.range);
  const q = f.search.trim();
  return {
    ...(f.status !== 'all' ? { p_status: f.status } : {}),
    ...(b ? { p_from: b.from.toISOString(), p_to: b.to.toISOString() } : {}),
    ...(q ? { p_search: q } : {}),
    p_limit: pageSize,
    p_offset: Math.max(0, page) * pageSize,
  };
}

/** «SVC-123» / «svc123» / «123» → 123 (mismo criterio que el RPC). */
export function folioOf(q: string): number | null {
  const m = /^(?:svc-?)?(\d{1,18})$/i.exec(q.trim());
  return m ? Number(m[1]) : null;
}

type FilterRow = Pick<TransferRow, 'status' | 'created_at' | 'folio' | 'client_name' | 'client_phone' | 'reference'>;
/** Espejo de los filtros del RPC (modo maqueta): estado, [desde, hasta) y búsqueda. */
export function filterTransfers<T extends FilterRow>(rows: T[], f: TransferFilters): T[] {
  const b = rangeBounds(f.range);
  const q = f.search.trim().toLowerCase();
  const folio = q ? folioOf(q) : null;
  return rows
    .filter(r => {
      if (f.status !== 'all' && r.status !== f.status) return false;
      if (b) {
        const t = new Date(r.created_at).getTime();
        if (t < b.from.getTime() || t >= b.to.getTime()) return false;
      }
      if (q) {
        const hit =
          (folio != null && r.folio === folio) ||
          [r.client_name, r.client_phone, r.reference].some(v => v?.toLowerCase().includes(q));
        if (!hit) return false;
      }
      return true;
    })
    .sort((a, b2) => b2.created_at.localeCompare(a.created_at));
}

/** Página `page` (0-based) con total_count en cada fila, como el RPC. */
export function paginate<T>(rows: T[], page: number, pageSize = TRANSFER_PAGE_SIZE): (T & { total_count: number })[] {
  return rows.slice(page * pageSize, page * pageSize + pageSize).map(r => ({ ...r, total_count: rows.length }));
}
export const pageCount = (total: number, pageSize = TRANSFER_PAGE_SIZE) => Math.max(1, Math.ceil(total / pageSize));

// ── Detalle (admin_get_payment_transfer) ─────────────────────────────────────

export interface TransferHistoryItem {
  id: string;
  status: string;
  amount_cents: number;
  reference: string | null;
  proof_path: string | null;
  reject_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
}
export interface TransferDetail {
  transfer: PaymentTransfer & { reviewer_name: string | null };
  proofPath: string;
  order: {
    id: string;
    folio: number | null;
    title: string | null;
    status: string;
    category_name: string | null;
    revenue_model: string | null;
    base_fee_method: BaseFeeMethod;
    base_fee_status: string;
    base_total_cents: number;
    technician_name: string | null;
    created_at: string | null;
  };
  client: { id: string; full_name: string | null; phone: string | null };
  history: TransferHistoryItem[];
}

type Obj = Record<string, Json | undefined>;
const obj = (v: Json | undefined): Obj | null => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : null);
const str = (v: Json | undefined) => (typeof v === 'string' ? v : null);
const num = (v: Json | undefined) => (v == null || v === '' ? null : Number(v));

/** jsonb de admin_get_payment_transfer → TransferDetail (null si falta la transferencia). */
export function parseTransferDetail(json: Json | null): TransferDetail | null {
  const j = obj(json ?? undefined);
  const t = obj(j?.transfer);
  if (!j || !t || !str(t.id)) return null;
  const o = obj(j.order) ?? {};
  const c = obj(j.client) ?? {};
  const history = Array.isArray(j.history) ? j.history : [];
  return {
    transfer: {
      id: str(t.id)!,
      service_order_id: str(t.service_order_id) ?? '',
      client_id: str(t.client_id) ?? '',
      payment_id: str(t.payment_id),
      amount_cents: num(t.amount_cents) ?? 0,
      reference: str(t.reference) ?? '',
      proof_path: str(t.proof_path) ?? '',
      status: str(t.status) ?? 'submitted',
      reject_reason: str(t.reject_reason),
      reviewed_by: str(t.reviewed_by),
      reviewed_at: str(t.reviewed_at),
      reviewer_name: str(t.reviewer_name),
      created_at: str(t.created_at) ?? '',
      updated_at: str(t.updated_at) ?? str(t.created_at) ?? '',
    },
    proofPath: str(obj(j.proof)?.path) ?? str(t.proof_path) ?? '',
    order: {
      id: str(o.id) ?? str(t.service_order_id) ?? '',
      folio: num(o.folio),
      title: str(o.title),
      status: str(o.status) ?? '',
      category_name: str(o.category_name),
      revenue_model: str(o.revenue_model),
      base_fee_method: baseMethodOf(str(o.base_fee_method)),
      base_fee_status: str(o.base_fee_status) ?? '',
      base_total_cents: num(o.base_total_cents) ?? 0,
      technician_name: str(o.technician_name),
      created_at: str(o.created_at),
    },
    client: { id: str(c.id) ?? str(t.client_id) ?? '', full_name: str(c.full_name), phone: str(c.phone) },
    history: history.flatMap(h => {
      const x = obj(h);
      if (!x || !str(x.id)) return [];
      return [
        {
          id: str(x.id)!,
          status: str(x.status) ?? '',
          amount_cents: num(x.amount_cents) ?? 0,
          reference: str(x.reference),
          proof_path: str(x.proof_path),
          reject_reason: str(x.reject_reason),
          reviewed_at: str(x.reviewed_at),
          created_at: str(x.created_at) ?? '',
        },
      ];
    }),
  };
}

/** Tipo de vista previa del comprobante por extensión del archivo. */
export function proofKind(path: string | null | undefined): 'image' | 'pdf' | 'other' {
  const ext = (path ?? '').split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'pdf';
  // heic/heif: los navegadores (salvo Safari) no los pintan; se ofrece el enlace.
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return 'image';
  return 'other';
}

/** ¿Se puede revisar? Solo los comprobantes `submitted`. */
export const canReviewTransfer = (status: string | null | undefined) => status === 'submitted';

/** Orden con transferencia aceptada sobre una solicitud muerta: espera el reembolso manual (finanzas). */
export const isTransferRefundPending = (o: { base_fee_method?: string | null; base_fee_status: string }) =>
  o.base_fee_method === 'transfer' && o.base_fee_status === 'refund_pending';

// ── Adelantos pendientes (decisión 7) ────────────────────────────────────────

/** Estados de orden en que el servicio ya terminó (o murió después de la visita). */
export const FINISHED_ORDER_STATUSES = ['completed', 'paid', 'closed', 'cancelled', 'expired'] as const;
type OwedOrder = {
  id: string;
  status: string;
  payment_model: string;
  base_fee_status: string;
  base_total_cents: number | null;
  client_id: string;
  completed_at: string | null;
  paid_at: string | null;
  cancelled_at: string | null;
  updated_at: string;
};
/** El servicio terminó y el adelanto sigue sin pagar (pendiente de transferencia o en revisión): lo debe el cliente. */
export const isAdvanceOwed = (o: Omit<OwedOrder, 'id' | 'client_id' | 'base_total_cents' | 'completed_at' | 'paid_at' | 'cancelled_at' | 'updated_at'>) =>
  o.payment_model === 'base_cash' &&
  (o.base_fee_status === 'awaiting_transfer' || o.base_fee_status === 'in_review') &&
  (FINISHED_ORDER_STATUSES as readonly string[]).includes(o.status);
export const finishedAt = (o: Pick<OwedOrder, 'completed_at' | 'paid_at' | 'cancelled_at' | 'updated_at'>) =>
  o.completed_at ?? o.cancelled_at ?? o.paid_at ?? o.updated_at;

export interface LatestProof {
  id: string;
  service_order_id: string;
  status: string;
  reject_reason: string | null;
  created_at: string;
}
export interface OwedAdvance {
  orderId: string;
  status: string;
  baseStatus: string;
  clientId: string;
  amountCents: number;
  finishedAt: string;
  proof: LatestProof | null;
}
/** Último comprobante por orden (el más reciente por created_at). */
export function latestProofByOrder(proofs: LatestProof[]): Map<string, LatestProof> {
  const m = new Map<string, LatestProof>();
  for (const p of proofs) {
    const cur = m.get(p.service_order_id);
    if (!cur || p.created_at > cur.created_at) m.set(p.service_order_id, p);
  }
  return m;
}
/** Adelantos adeudados en servicios terminados, el más antiguo primero. */
export function owedAdvances(orders: OwedOrder[], proofs: LatestProof[]): OwedAdvance[] {
  const latest = latestProofByOrder(proofs);
  return orders
    .filter(isAdvanceOwed)
    .map(o => ({
      orderId: o.id,
      status: o.status,
      baseStatus: o.base_fee_status,
      clientId: o.client_id,
      amountCents: o.base_total_cents ?? 0,
      finishedAt: finishedAt(o),
      proof: latest.get(o.id) ?? null,
    }))
    .sort((a, b) => a.finishedAt.localeCompare(b.finishedAt));
}

/** Estado del adelanto en el detalle de la orden: hay algo que el admin debe mirar. */
export const transferNeedsReview = (baseStatus: string | null | undefined) => baseStatus === 'in_review';

// ── Cuentas de depósito (deposit_accounts, N cuentas activables) ────────────

export const ALIAS_MAX = 60;

/** Cuenta tal como la devuelve admin_list_deposit_accounts. */
export interface DepositAccount {
  id: string;
  bank: string;
  clabe: string;
  card_number: string | null;
  holder: string;
  alias: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
export interface DepositForm {
  bank: string;
  clabe: string;
  card: string;
  holder: string;
  alias: string;
}
export const EMPTY_DEPOSIT_FORM: DepositForm = { bank: '', clabe: '', card: '', holder: '', alias: '' };

/** jsonb array de admin_list_deposit_accounts / admin_reorder_deposit_accounts → cuentas ordenadas. */
export function parseDepositAccounts(json: Json | null): DepositAccount[] {
  if (!Array.isArray(json)) return [];
  return json
    .flatMap((v, i) => {
      const j = obj(v);
      if (!j || !str(j.id) || !str(j.clabe)) return [];
      const a: DepositAccount = {
        id: str(j.id)!,
        bank: str(j.bank) ?? '',
        clabe: str(j.clabe)!,
        card_number: str(j.card_number),
        holder: str(j.holder) ?? '',
        alias: str(j.alias),
        is_active: j.is_active !== false,
        sort_order: num(j.sort_order) ?? i,
        created_at: str(j.created_at) ?? '',
        updated_at: str(j.updated_at) ?? str(j.created_at) ?? '',
      };
      return [a];
    })
    .sort((a, b) => a.sort_order - b.sort_order);
}

/** jsonb de admin_upsert_deposit_account / admin_set_deposit_account_active (una cuenta). */
export const parseDepositAccount = (json: Json | null): DepositAccount | null => parseDepositAccounts(json ? [json] : [])[0] ?? null;

export const depositFormOf = (a: DepositAccount): DepositForm => ({
  bank: a.bank,
  clabe: a.clabe,
  card: a.card_number ?? '',
  holder: a.holder,
  alias: a.alias ?? '',
});

/** Título de la fila: el alias si existe, si no el banco. */
export const depositTitle = (a: Pick<DepositAccount, 'alias' | 'bank'>) => a.alias?.trim() || a.bank;

/** Quita espacios y guiones (como el backend). */
export const digitsOnly = (s: string) => s.replace(/[\s-]/g, '');

/** Errores por campo con los mismos textos (y límites) que admin_upsert_deposit_account. */
export function validateDepositForm(f: DepositForm): Partial<Record<keyof DepositForm, string>> {
  const e: Partial<Record<keyof DepositForm, string>> = {};
  const bank = f.bank.trim();
  const holder = f.holder.trim();
  const clabe = digitsOnly(f.clabe);
  const card = digitsOnly(f.card);
  if (!bank || bank.length > 80) e.bank = 'El banco es obligatorio (máximo 80 caracteres).';
  if (!/^\d{18}$/.test(clabe)) e.clabe = 'La CLABE debe tener 18 dígitos.';
  else if (!isValidClabe(clabe)) e.clabe = 'La CLABE no es válida (dígito verificador incorrecto).';
  if (card && !/^\d{16}$/.test(card)) e.card = 'El número de tarjeta debe tener 16 dígitos.';
  if (!holder || holder.length > 120) e.holder = 'El titular es obligatorio (máximo 120 caracteres).';
  if (f.alias.trim().length > ALIAS_MAX) e.alias = `El alias no puede superar ${ALIAS_MAX} caracteres.`;
  return e;
}

/** Args normalizados de admin_upsert_deposit_account (`id` null = crear; vacíos → null). */
export const depositArgs = (f: DepositForm, id: string | null = null) => ({
  p_id: id,
  p_bank: f.bank.trim(),
  p_clabe: digitsOnly(f.clabe),
  p_holder: f.holder.trim(),
  p_card_number: digitsOnly(f.card) || null,
  p_alias: f.alias.trim() || null,
});

/** ¿El formulario cambió respecto a la cuenta (comparando ya normalizado)? */
export const depositFormDirty = (f: DepositForm, a: DepositAccount) => {
  const b = depositFormOf(a);
  return (
    f.bank.trim() !== b.bank ||
    digitsOnly(f.clabe) !== b.clabe ||
    digitsOnly(f.card) !== b.card ||
    f.holder.trim() !== b.holder ||
    f.alias.trim() !== b.alias
  );
};

/** «0321 8000 0118 3597 19» — agrupa de 4 en 4 para leerla. */
export const groupDigits = (s: string | null | undefined) => (s ? digitsOnly(s).replace(/(\d{4})(?=\d)/g, '$1 ') : '—');

/** Los clientes solo ven transferencia si hay al menos una cuenta activa. */
export const hasActiveDeposit = (accts: Pick<DepositAccount, 'is_active'>[]) => accts.some(a => a.is_active);

/** Orden de ids tras mover `id` una posición (-1 arriba, +1 abajo). null si no se puede mover. */
export function movedIds(ids: string[], id: string, dir: -1 | 1): string[] | null {
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return null;
  const next = [...ids];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/** Espejo de admin_reorder_deposit_accounts (modo maqueta): listadas primero, las demás después. */
export function applyOrder(accts: DepositAccount[], ids: string[]): DepositAccount[] {
  const byId = new Map(accts.map(a => [a.id, a]));
  const listed = ids.flatMap(id => (byId.has(id) ? [byId.get(id)!] : []));
  const rest = accts.filter(a => !ids.includes(a.id));
  return [...listed, ...rest].map((a, i) => ({ ...a, sort_order: i }));
}
