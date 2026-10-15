'use client';
import { supabase } from '@/lib/supabase';
import { MOCK } from '@/lib/mock';
import { toast } from '@/components/toast';
import {
  SettlementError,
  mockBalances,
  mockRecordDelivery,
  mockRecordPayout,
  mockSummary,
  mockVoid,
  parseSummary,
  seedMockSettlements,
  type BalanceRow,
  type MockSettlements,
  type SettlementKind,
  type SettlementSummary,
  type TechRef,
} from '@/lib/settlements';
import { getAllRequests, getProfile, getTechType, getTechnicians, loadWorld, pgCode } from './store';

/**
 * Liquidaciones con el técnico (docs/settlements.md del backend). Real: las 5
 * RPC; maqueta: motor en memoria (lib/settlements.ts) sembrado con saldos de
 * ejemplo, así «Pagado» y «Efectivo recibido» se reflejan al instante.
 */

let mock: MockSettlements | null = null;
const mockState = (): MockSettlements => {
  if (!mock) {
    mock = seedMockSettlements(
      getTechnicians().map(t => t.id),
      techId =>
        getAllRequests()
          .filter(o => o.technician_id === techId && o.folio != null)
          .map(o => ({ id: o.id, folio: Number(o.folio) })),
      Date.now(),
    );
  }
  return mock;
};

const techRef = (id: string): TechRef => ({
  id,
  name: getProfile(id)?.full_name ?? 'Técnico',
  avatar_icon: getProfile(id)?.avatar_icon ?? null,
  type: getTechType(id).type,
});

/** Mensaje en español del backend (42501 / 22023 / 23505 / P0002) o el de respaldo. */
const message = (e: unknown, fallback: string) => {
  if (e instanceof SettlementError) return e.message;
  const code = pgCode(e);
  const m = typeof e === 'object' && e && 'message' in e ? String(e.message) : '';
  if (m && code && ['42501', '22023', '23505', 'P0002'].includes(code)) return m;
  return fallback;
};

async function write<R>(fn: () => R | Promise<R>, fallback: string): Promise<R | null> {
  try {
    return await fn();
  } catch (e) {
    console.error('[settlements]', e);
    toast.error(message(e, fallback));
    return null;
  }
}

/** Saldo de cada técnico (admin_list_technician_balances). null = no disponible. */
export async function fetchTechnicianBalances(): Promise<BalanceRow[] | null> {
  if (MOCK) {
    await loadWorld();
    const st = mockState();
    const ids = new Set([...st.commissions, ...st.cash, ...st.records].map(x => x.technician_id));
    return mockBalances(st, [...ids].map(techRef));
  }
  try {
    const { data, error } = await supabase.rpc('admin_list_technician_balances');
    if (error) throw error;
    return (data ?? []).map(r => ({
      ...r,
      owed_to_technician_cents: Number(r.owed_to_technician_cents),
      owed_to_admin_cents: Number(r.owed_to_admin_cents),
      net_cents: Number(r.net_cents),
    }));
  } catch (e) {
    console.warn('[data] admin_list_technician_balances', e);
    return null;
  }
}

/** Detalle de un técnico (technician_settlement_summary). null = no disponible. */
export async function fetchSettlementSummary(techId: string): Promise<SettlementSummary | null> {
  if (MOCK) {
    await loadWorld();
    return mockSummary(mockState(), techId);
  }
  try {
    const { data, error } = await supabase.rpc('technician_settlement_summary', { p_technician_id: techId });
    if (error) throw error;
    return parseSummary(data);
  } catch (e) {
    console.warn('[data] technician_settlement_summary', e);
    return null;
  }
}

export interface SettlementForm {
  /** null = todos los pendientes. */
  ids: string[] | null;
  method: string;
  reference: string;
  note: string;
  /** ISO. */
  at: string;
}
const opt = (s: string) => s.trim() || null;

/** «Registrar pago»: comisiones pagadas (ids = order_id). */
export const recordTechnicianPayout = (techId: string, f: SettlementForm) =>
  write(async () => {
    if (MOCK) return mockRecordPayout(mockState(), techId, { ...f });
    const { data, error } = await supabase.rpc('admin_record_technician_payout', {
      p_technician_id: techId,
      p_commission_order_ids: f.ids,
      p_method: f.method,
      p_reference: opt(f.reference),
      p_note: opt(f.note),
      p_paid_at: f.at,
    });
    if (error) throw error;
    return data;
  }, 'No se pudo registrar el pago.');

/** «Registrar efectivo recibido» (ids = payment_id). */
export const recordCashDelivery = (techId: string, f: SettlementForm) =>
  write(async () => {
    if (MOCK) return mockRecordDelivery(mockState(), techId, { ...f });
    const { data, error } = await supabase.rpc('admin_record_cash_delivery', {
      p_technician_id: techId,
      p_payment_ids: f.ids,
      p_method: f.method,
      p_reference: opt(f.reference),
      p_note: opt(f.note),
      p_received_at: f.at,
    });
    if (error) throw error;
    return data;
  }, 'No se pudo registrar el efectivo recibido.');

/** «Anular» el último registro (dentro de 24 h). */
export const voidSettlement = (kind: SettlementKind, id: string, reason: string) =>
  write(async () => {
    if (MOCK) return mockVoid(mockState(), kind, id);
    const { data, error } = await supabase.rpc('admin_void_settlement', {
      p_kind: kind,
      p_id: id,
      p_reason: opt(reason),
    });
    if (error) throw error;
    return data;
  }, 'No se pudo anular el registro.');
