// TUM-01 · Dinero de Tu Mantenimiento + comisión del técnico (puro, probado en
// commission.test.ts). Espeja app.compute_technician_commission,
// app.order_collected_cents, app.snapshot_technician_commission y
// admin_report_technician_commissions para el modo maqueta; en producción
// manda el servidor.

import type { Database, Json } from '@/types/supabase';
import type { NullableCols } from '@/types/rpc';

type T = Database['public']['Tables'];
type Fn = Database['public']['Functions'];
type Order = T['service_orders']['Row'];
type Pay = T['payments']['Row'];

export type RevenueModel = 'technician_owned' | 'admin_owned';
export type TechnicianCommissionType = 'fixed' | 'percent';
export type TechnicianCommission = T['technician_commissions']['Row'];
export type TechCommissionReportRow = NullableCols<
  Fn['admin_report_technician_commissions']['Returns'][number],
  'technician_name'
>;

export interface TechnicianCommissionConfig {
  type: TechnicianCommissionType;
  /** fixed: centavos por servicio · percent: puntos base (0–10000) sobre lo cobrado. */
  value: number;
  updatedAt: string | null;
  adminOwnedEnabled: boolean;
}

export const COMMISSION_SETTING_KEY = 'technician_commission';
export const ADMIN_OWNED_FLAG_KEY = 'payment_model_admin_owned_enabled';
/** Seed del backend: 85 % de lo cobrado para el técnico. */
export const DEFAULT_COMMISSION: Pick<TechnicianCommissionConfig, 'type' | 'value'> = {
  type: 'percent',
  value: 8500,
};

export const COMMISSION_TYPE_OPTIONS: { value: TechnicianCommissionType; label: string }[] = [
  { value: 'fixed', label: 'Monto fijo' },
  { value: 'percent', label: 'Porcentaje' },
];

export const revenueModelOf = (o: { revenue_model?: string | null } | null | undefined): RevenueModel =>
  o?.revenue_model === 'admin_owned' ? 'admin_owned' : 'technician_owned';
export const isAdminOwned = (o: { revenue_model?: string | null } | null | undefined) =>
  revenueModelOf(o) === 'admin_owned';

/** fixed: el valor tal cual (sin tope); percent: round(bruto × bps / 10000). */
export function computeTechnicianCommission(
  type: string,
  value: number | null | undefined,
  grossCents: number | null | undefined,
): number {
  const v = Math.max(Number(value ?? 0) || 0, 0);
  if (type === 'fixed') return v;
  return Math.round((Math.max(Number(grossCents ?? 0) || 0, 0) * v) / 10_000);
}

/** Dinero cobrado al cliente en una orden (neto de reembolsos, sin comisión Stripe). */
export function orderCollected(payments: Pick<Pay, 'kind' | 'status' | 'amount_cents' | 'refunded_cents' | 'cash_received_cents' | 'cash_status'>[]) {
  let base = 0;
  let quote = 0;
  for (const p of payments) {
    if (p.kind === 'base_fee' && (p.status === 'paid' || p.status === 'refunded'))
      base += Math.max(p.amount_cents - p.refunded_cents, 0);
    if (
      p.kind === 'quote' &&
      ['pending', 'authorized', 'paid', 'refunded'].includes(p.status) &&
      p.cash_status != null &&
      p.cash_status !== 'pending_technician'
    )
      quote += Math.max((p.cash_received_cents ?? p.amount_cents) - p.refunded_cents, 0);
  }
  return { baseCents: base, quoteCents: quote };
}

/** ¿La orden lleva snapshot de comisión en su estado actual? */
export const snapshotDue = (o: Pick<Order, 'revenue_model' | 'technician_id' | 'status' | 'base_fee_credited_at'>) =>
  isAdminOwned(o) &&
  !!o.technician_id &&
  (['completed', 'paid', 'closed'].includes(o.status) || (o.status === 'cancelled' && !!o.base_fee_credited_at));

/**
 * Crea (congela la tarifa vigente) o recalcula (tarifa congelada, montos
 * actuales) el snapshot de comisión de una orden admin_owned.
 */
export function snapshotCommission(
  order: Order,
  payments: Pay[],
  config: Pick<TechnicianCommissionConfig, 'type' | 'value'>,
  prev: TechnicianCommission | null,
  now: string,
): TechnicianCommission | null {
  if (!isAdminOwned(order) || !order.technician_id) return null;
  const { baseCents, quoteCents } = orderCollected(payments.filter(p => p.service_order_id === order.id));
  const type = prev?.commission_type ?? config.type;
  const value = prev?.commission_value ?? config.value;
  const gross = baseCents + quoteCents;
  return {
    service_order_id: order.id,
    technician_id: order.technician_id,
    commission_type: type,
    commission_value: value,
    base_collected_cents: baseCents,
    quote_collected_cents: quoteCents,
    gross_collected_cents: gross,
    commission_cents: computeTechnicianCommission(type, value, gross),
    payout_id: prev?.payout_id ?? null,
    order_status: order.status,
    snapshot_at: prev?.snapshot_at ?? now,
    computed_at: now,
    created_at: prev?.created_at ?? now,
    updated_at: now,
  };
}

/** jsonb de get_technician_commission_config / admin_set_technician_commission. */
export function parseCommissionConfig(json: Json | null | undefined): TechnicianCommissionConfig | null {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return null;
  const j = json as Record<string, Json | undefined>;
  const value = Number(j.value);
  return {
    type: j.type === 'fixed' ? 'fixed' : 'percent',
    value: Number.isFinite(value) && value >= 0 ? value : 0,
    updatedAt: typeof j.updated_at === 'string' ? j.updated_at : null,
    adminOwnedEnabled: j.admin_owned_enabled === true,
  };
}

/** Valor de platform_settings.technician_commission ({type, value}) o el seed. */
export function commissionFromSetting(v: Json | null | undefined): Pick<TechnicianCommissionConfig, 'type' | 'value'> {
  const c = parseCommissionConfig(v ?? null);
  return c ? { type: c.type, value: c.value } : { ...DEFAULT_COMMISSION };
}

/** Lo que se ve en el input: pesos (centavos / 100) o porcentaje (bps / 100). */
export const commissionToInput = (c: Pick<TechnicianCommissionConfig, 'value'>) => String(c.value / 100);

/** Input del formulario → valor del RPC (pesos → centavos, % → bps) o el error a mostrar. */
export function parseCommissionInput(
  type: TechnicianCommissionType,
  raw: string,
): { value: number; error: null } | { value: null; error: string } {
  const t = raw.trim().replace(',', '.');
  const n = Number(t);
  if (t === '' || !Number.isFinite(n) || n < 0)
    return { value: null, error: type === 'fixed' ? 'Escribe un monto en pesos (0 o más).' : 'Escribe un porcentaje entre 0 y 100.' };
  if (type === 'percent' && n > 100) return { value: null, error: 'El porcentaje no puede pasar de 100.' };
  // Pesos → centavos y % → puntos base: ambos ×100.
  return { value: Math.round(n * 100), error: null };
}

const mxn = (c: number) =>
  (c / 100).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });
const pct = (bps: number) => `${(bps / 100).toLocaleString('es-MX', { maximumFractionDigits: 2 })} %`;

/** «85 % de lo cobrado» / «$150.00 por servicio». */
export function commissionRateLabel(type: string, value: number): string {
  return type === 'fixed' ? `${mxn(value)} por servicio` : `${pct(value)} de lo cobrado`;
}

// ── Reporte por técnico (espejo de admin_report_technician_commissions) ─────

export function commissionReport(
  rows: TechnicianCommission[],
  from: number,
  to: number,
  nameOf: (id: string) => string | null,
  technicianId: string | null = null,
): TechCommissionReportRow[] {
  const acc = new Map<string, TechCommissionReportRow>();
  for (const r of rows) {
    const t = Date.parse(r.snapshot_at);
    if (!(t >= from && t < to)) continue;
    if (technicianId && r.technician_id !== technicianId) continue;
    const a = acc.get(r.technician_id) ?? {
      technician_id: r.technician_id,
      technician_name: nameOf(r.technician_id),
      services_count: 0,
      base_collected_cents: 0,
      quote_collected_cents: 0,
      gross_collected_cents: 0,
      commission_cents: 0,
      admin_net_cents: 0,
    };
    a.services_count += 1;
    a.base_collected_cents += r.base_collected_cents;
    a.quote_collected_cents += r.quote_collected_cents;
    a.gross_collected_cents += r.gross_collected_cents ?? 0;
    a.commission_cents += r.commission_cents;
    a.admin_net_cents = a.gross_collected_cents - a.commission_cents;
    acc.set(r.technician_id, a);
  }
  return [...acc.values()].sort(
    (a, b) =>
      b.commission_cents - a.commission_cents ||
      (a.technician_name ?? '').localeCompare(b.technician_name ?? '', 'es'),
  );
}

export function commissionTotals(rows: TechCommissionReportRow[]) {
  const z = { services: 0, base: 0, quote: 0, gross: 0, commission: 0, net: 0 };
  for (const r of rows) {
    z.services += Number(r.services_count);
    z.base += Number(r.base_collected_cents);
    z.quote += Number(r.quote_collected_cents);
    z.gross += Number(r.gross_collected_cents);
    z.commission += Number(r.commission_cents);
    z.net += Number(r.admin_net_cents);
  }
  return z;
}

const pesos = (c: number | string) => Number(c) / 100;

export function commissionReportCsvRows(rows: TechCommissionReportRow[]): Record<string, string | number>[] {
  return rows.map(r => ({
    Técnico: r.technician_name ?? r.technician_id,
    Servicios: Number(r.services_count),
    'Tarifa base cobrada': pesos(r.base_collected_cents),
    'Efectivo cobrado': pesos(r.quote_collected_cents),
    'Ingreso bruto': pesos(r.gross_collected_cents),
    'Comisión técnico': pesos(r.commission_cents),
    'Ingreso neto Tu Mantenimiento': pesos(r.admin_net_cents),
  }));
}

// ── Técnico (espejo de get_technician_cash_summary.admin_owned) ─────────────

export interface TechAdminOwnedSummary {
  commissionEarnedCents: number;
  servicesCount: number;
  grossCollectedCents: number;
  /** Efectivo reportado en órdenes admin_owned (no fallido): es de Tu Mantenimiento. */
  cashHeldForAdminCents: number;
}

export function techAdminOwnedSummary(
  techId: string,
  orders: Pick<Order, 'id' | 'technician_id' | 'revenue_model'>[],
  payments: Pick<Pay, 'service_order_id' | 'kind' | 'method' | 'cash_status' | 'status' | 'cash_received_cents'>[],
  commissions: Pick<TechnicianCommission, 'technician_id' | 'commission_cents' | 'gross_collected_cents'>[],
): TechAdminOwnedSummary {
  const mine = commissions.filter(c => c.technician_id === techId);
  const adminOrders = new Set(orders.filter(o => o.technician_id === techId && isAdminOwned(o)).map(o => o.id));
  return {
    commissionEarnedCents: mine.reduce((s, c) => s + c.commission_cents, 0),
    servicesCount: mine.length,
    grossCollectedCents: mine.reduce((s, c) => s + (c.gross_collected_cents ?? 0), 0),
    cashHeldForAdminCents: payments
      .filter(
        p =>
          adminOrders.has(p.service_order_id) &&
          p.kind === 'quote' &&
          p.method === 'cash' &&
          p.cash_status != null &&
          p.cash_status !== 'pending_technician' &&
          p.status !== 'failed',
      )
      .reduce((s, p) => s + (p.cash_received_cents ?? 0), 0),
  };
}

/**
 * Ingreso del técnico en una ventana: en órdenes del modelo anterior, lo
 * cobrado menos la comisión de plataforma; en admin_owned, su comisión.
 */
export function techIncome(
  techId: string,
  orders: Pick<Order, 'id' | 'technician_id' | 'revenue_model'>[],
  payments: Pick<Pay, 'service_order_id' | 'status' | 'amount_cents' | 'commission_cents' | 'paid_at' | 'created_at'>[],
  commissions: Pick<TechnicianCommission, 'technician_id' | 'commission_cents' | 'snapshot_at'>[],
  since: number,
): number {
  const legacy = new Set(orders.filter(o => o.technician_id === techId && !isAdminOwned(o)).map(o => o.id));
  const fromLegacy = payments
    .filter(p => p.status === 'paid' && legacy.has(p.service_order_id) && Date.parse(p.paid_at ?? p.created_at) >= since)
    .reduce((s, p) => s + p.amount_cents - p.commission_cents, 0);
  const fromCommissions = commissions
    .filter(c => c.technician_id === techId && Date.parse(c.snapshot_at) >= since)
    .reduce((s, c) => s + c.commission_cents, 0);
  return fromLegacy + fromCommissions;
}
