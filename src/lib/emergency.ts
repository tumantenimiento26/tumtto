// Lógica pura de las solicitudes de emergencia (despacho automático al primer
// técnico cercano). Reemplaza al antiguo «urgente»: sin React ni store para
// poder probarla con vitest (emergency.test.ts).

export type SurchargeMode = 'percent' | 'fixed';

/** Config de platform_settings (claves en EMERGENCY_KEYS). */
export interface EmergencyConfig {
  initialRadiusM: number;
  stepM: number;
  maxRadiusM: number;
  roundSeconds: number;
  timeoutMinutes: number;
  surchargeMode: SurchargeMode;
  surchargeBps: number;
  surchargeFixedCents: number;
}

export const EMERGENCY_KEYS = {
  initialRadiusM: 'emergency_initial_radius_m',
  stepM: 'emergency_radius_step_m',
  maxRadiusM: 'emergency_max_radius_m',
  roundSeconds: 'emergency_round_seconds',
  timeoutMinutes: 'emergency_timeout_minutes',
  surchargeMode: 'emergency_surcharge_mode',
  surchargeBps: 'emergency_surcharge_bps',
  surchargeFixedCents: 'emergency_surcharge_fixed_cents',
} as const;

/** Mismos defaults que el backend (migración emergency_dispatch). */
export const EMERGENCY_DEFAULTS: EmergencyConfig = {
  initialRadiusM: 3000,
  stepM: 2000,
  maxRadiusM: 15000,
  roundSeconds: 60,
  timeoutMinutes: 10,
  surchargeMode: 'percent',
  surchargeBps: 3000,
  surchargeFixedCents: 15000,
};

const MXN = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

/** «+30%» (porcentaje) o «+$150.00» (monto fijo). */
export function surchargeLabel(
  mode: SurchargeMode,
  bps: number,
  fixedCents: number,
): string {
  if (mode === 'fixed') return `+${MXN.format(fixedCents / 100)}`;
  const pct = bps / 100;
  return `+${Number.isInteger(pct) ? pct : pct.toFixed(2).replace(/0$/, '')}%`;
}

/** Recargo en centavos sobre una base (el % usa el subtotal sin recargo). */
export function surchargeCents(
  mode: SurchargeMode,
  bps: number,
  fixedCents: number,
  baseCents: number,
): number {
  return mode === 'fixed' ? fixedCents : Math.round((baseCents * bps) / 10000);
}

/** Recargo ya incluido en un total (el snapshot manda; si no, se deduce del %). */
export function includedSurchargeCents(o: {
  emergency_surcharge_cents: number | null;
  total_cents: number | null;
  fallback_bps: number;
}): number {
  if (o.emergency_surcharge_cents != null) return o.emergency_surcharge_cents;
  if (o.total_cents == null) return 0;
  return Math.round(o.total_cents - o.total_cents / (1 + o.fallback_bps / 10000));
}

/** «850 m» / «2.4 km». */
export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  const km = m / 1000;
  return `${Number.isInteger(km) ? km : km.toFixed(1)} km`;
}

/** Segundos → «45 s» / «2 min 30 s» / «1 h 05 min». */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return s % 60 ? `${m} min ${s % 60} s` : `${m} min`;
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min`;
}

/** Tiempo de respuesta = accepted_at − created_at (null si aún no se acepta). */
export function responseSeconds(
  requestedAt: string,
  acceptedAt: string | null | undefined,
): number | null {
  if (!acceptedAt) return null;
  const d = (new Date(acceptedAt).getTime() - new Date(requestedAt).getTime()) / 1000;
  return Number.isFinite(d) && d >= 0 ? Math.round(d) : null;
}

// ── Prioridad / estado de despacho ───────────────────────────────────────────

export interface EmergencyOrderLike {
  priority?: string | null;
  status: string;
  dispatch_status?: string | null;
  needs_manual_assignment?: boolean | null;
}

const LIVE = ['requested', 'accepted', 'enroute', 'onsite', 'quote', 'working', 'closing'];

export const isEmergency = (o: Pick<EmergencyOrderLike, 'priority'>) =>
  o.priority === 'emergency';

/** Emergencia sin terminar (se fija arriba en la lista de Servicios). */
export const isActiveEmergency = (o: EmergencyOrderLike) =>
  isEmergency(o) && LIVE.includes(o.status);

/** Emergencia viva que nadie aceptó y espera asignación manual. */
export const needsManualAssignment = (o: EmergencyOrderLike) =>
  isEmergency(o) && !!o.needs_manual_assignment && o.status === 'requested';

/**
 * Prioridad de fijado en Servicios (menor = más arriba): primero las que piden
 * asignación manual, luego las buscando técnico, luego el resto de emergencias
 * vivas; null = no se fija.
 */
export function emergencyPinRank(o: EmergencyOrderLike): number | null {
  if (!isActiveEmergency(o)) return null;
  if (needsManualAssignment(o)) return 0;
  return o.dispatch_status === 'searching' ? 1 : 2;
}

export const DISPATCH_LABEL: Record<string, string> = {
  awaiting_payment: 'Esperando pago de tarifa base',
  searching: 'Buscando técnico',
  assigned: 'Asignada',
  timed_out: 'Sin técnico · asignación manual',
};

// ── Historial de despacho ────────────────────────────────────────────────────

export interface EmergencyNotified {
  technician_id: string;
  name: string;
  distance_m: number;
  notified_at: string;
}
export interface EmergencyRound {
  round: number;
  radius_m: number;
  notified: EmergencyNotified[];
}
export interface EmergencyHistory {
  requested_at: string;
  rounds: EmergencyRound[];
  accepted_by_id: string | null;
  accepted_by_name: string | null;
  accepted_at: string | null;
  response_seconds: number | null;
}

export interface DispatchLogRow {
  round: number;
  radius_m: number;
  technician_id: string;
  distance_m: number;
  notified_at: string;
}

/** Agrupa las filas de emergency_dispatch_log por ronda (orden de ronda y hora). */
export function groupRounds(
  rows: DispatchLogRow[],
  nameOf: (technicianId: string) => string,
): EmergencyRound[] {
  const by = new Map<number, EmergencyRound>();
  for (const r of rows) {
    const g = by.get(r.round) ?? { round: r.round, radius_m: r.radius_m, notified: [] };
    g.radius_m = Math.max(g.radius_m, r.radius_m);
    g.notified.push({
      technician_id: r.technician_id,
      name: nameOf(r.technician_id),
      distance_m: r.distance_m,
      notified_at: r.notified_at,
    });
    by.set(r.round, g);
  }
  return [...by.values()]
    .sort((a, b) => a.round - b.round)
    .map(g => ({
      ...g,
      notified: g.notified.sort((a, b) => a.notified_at.localeCompare(b.notified_at)),
    }));
}

/** Historial calculado desde el log (modo maqueta o fallback sin la RPC). */
export function buildHistory(
  order: { created_at: string; accepted_at: string | null; technician_id: string | null },
  rows: DispatchLogRow[],
  nameOf: (technicianId: string) => string,
): EmergencyHistory {
  const accepted = !!order.accepted_at && !!order.technician_id;
  return {
    requested_at: order.created_at,
    rounds: groupRounds(rows, nameOf),
    accepted_by_id: accepted ? order.technician_id : null,
    accepted_by_name: accepted ? nameOf(order.technician_id!) : null,
    accepted_at: order.accepted_at,
    response_seconds: responseSeconds(order.created_at, order.accepted_at),
  };
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown) => (typeof v === 'string' ? v : null);
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/** Normaliza el jsonb de admin_emergency_history (tolerante a campos faltantes). */
export function parseHistory(json: unknown): EmergencyHistory | null {
  if (!isObj(json)) return null;
  const requested = str(json.requested_at);
  if (!requested) return null;
  const rawRounds = (Array.isArray(json.rounds) ? json.rounds : []).filter(isObj);
  const flat = (Array.isArray(json.notified) ? json.notified : []).filter(isObj);
  const toNotified = (n: Record<string, unknown>): EmergencyNotified => ({
    technician_id: str(n.technician_id) ?? '',
    name: str(n.name) ?? 'Técnico',
    distance_m: num(n.distance_m) ?? 0,
    notified_at: str(n.notified_at) ?? requested,
  });
  // Backend: rounds[{round,radius_m}] + notified[{round,...}] planos; también acepta notified anidado.
  const byRound = new Map<number, EmergencyRound>();
  for (const r of rawRounds) {
    const k = num(r.round) ?? 0;
    byRound.set(k, {
      round: k,
      radius_m: num(r.radius_m) ?? 0,
      notified: (Array.isArray(r.notified) ? r.notified : []).filter(isObj).map(toNotified),
    });
  }
  for (const n of flat) {
    const k = num(n.round) ?? 0;
    const g = byRound.get(k) ?? { round: k, radius_m: num(n.radius_m) ?? 0, notified: [] };
    g.notified.push(toNotified(n));
    byRound.set(k, g);
  }
  const rounds = [...byRound.values()].sort((a, b) => a.round - b.round);
  const by = isObj(json.accepted_by) ? json.accepted_by : null;
  const acceptedAt = str(json.accepted_at);
  return {
    requested_at: requested,
    rounds,
    accepted_by_id: (by && str(by.technician_id)) || str(json.accepted_by_id),
    accepted_by_name: (by && str(by.name)) || str(json.accepted_by_name),
    accepted_at: acceptedAt,
    response_seconds: num(json.response_seconds) ?? responseSeconds(requested, acceptedAt),
  };
}

/** «3 rondas · radio 3 → 7 km · 6 técnicos notificados». */
export function summarizeRounds(rounds: EmergencyRound[]): string {
  if (!rounds.length) return 'Sin técnicos notificados';
  const techs = new Set(rounds.flatMap(r => r.notified.map(n => n.technician_id))).size;
  const first = rounds[0].radius_m;
  const last = rounds[rounds.length - 1].radius_m;
  const km = (m: number) => formatDistance(m).replace(/ km$/, '').replace(/ m$/, ' m');
  const radius =
    first === last ? `radio ${formatDistance(first)}` : `radio ${km(first)} → ${formatDistance(last)}`;
  return `${rounds.length} ${rounds.length === 1 ? 'ronda' : 'rondas'} · ${radius} · ${techs} ${
    techs === 1 ? 'técnico notificado' : 'técnicos notificados'
  }`;
}
