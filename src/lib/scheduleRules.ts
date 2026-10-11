// Recargos por horario configurables (modelo de cobro v2). Lógica pura, probada
// en scheduleRules.test.ts. Espeja el backend: tablas schedule_surcharge_rules /
// holidays, RPC admin_upsert_schedule_rule y admin_preview_schedule_surcharge.
// Reglas: se evalúa en hora de México (America/Mexico_City); una franja cruza la
// medianoche cuando inicio > fin (fin exclusivo); si varias reglas aplican gana
// la de mayor monto (no se suman).

import type { Database, Json } from '@/types/supabase';

type T = Database['public']['Tables'];
export type ScheduleRule = T['schedule_surcharge_rules']['Row'];
export type Holiday = T['holidays']['Row'];

export type RuleKind = 'time_band' | 'weekday' | 'holiday';
export type SurchargeType = 'percent' | 'fixed';

export const RULE_KIND_LABEL: Record<RuleKind, string> = {
  time_band: 'Franja horaria',
  weekday: 'Día de la semana',
  holiday: 'Día festivo',
};
export const RULE_KIND_OPTIONS = (Object.keys(RULE_KIND_LABEL) as RuleKind[]).map(value => ({
  value,
  label: RULE_KIND_LABEL[value],
}));

/** 0 = domingo … 6 = sábado (igual que el backend). */
export const WEEKDAYS: { value: number; short: string; label: string }[] = [
  { value: 1, short: 'Lun', label: 'Lunes' },
  { value: 2, short: 'Mar', label: 'Martes' },
  { value: 3, short: 'Mié', label: 'Miércoles' },
  { value: 4, short: 'Jue', label: 'Jueves' },
  { value: 5, short: 'Vie', label: 'Viernes' },
  { value: 6, short: 'Sáb', label: 'Sábado' },
  { value: 0, short: 'Dom', label: 'Domingo' },
];

const MX_TZ = 'America/Mexico_City';

// ── Formato ──────────────────────────────────────────────────────────────────

/** "21:00:00" → "21:00"; null si no hay hora. */
export const hhmm = (t: string | null | undefined): string | null => (t ? t.slice(0, 5) : null);

/** "21:00" → minutos desde la medianoche; NaN si no es una hora válida. */
export function minutesOf(t: string | null | undefined): number {
  const m = /^(\d{1,2}):(\d{2})/.exec(t ?? '');
  if (!m) return NaN;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return h <= 23 && min <= 59 ? h * 60 + min : NaN;
}

const pctText = (bps: number) => {
  const pct = bps / 100;
  return `${Number.isInteger(pct) ? pct : pct.toFixed(2).replace(/0$/, '')}%`;
};
const mxn = (cents: number) =>
  `$${(cents / 100).toLocaleString('es-MX', { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;

/** «15%» o «$50». */
export const valueLabel = (type: string, value: number) => (type === 'fixed' ? mxn(value) : pctText(value));

/** «+15%» / «+$50» para el desglose. */
export const surchargeBadge = (type: string, value: number) => `+${valueLabel(type, value)}`;

/** «Entre 21:00 y 07:00 (cruza la medianoche)», «Domingos», «Días festivos»… */
export function whenLabel(r: Pick<ScheduleRule, 'kind' | 'start_time' | 'end_time' | 'weekdays'>): string {
  const days = (r.weekdays ?? []).slice().sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  const dayText = days.length
    ? days.length === 7
      ? 'todos los días'
      : days.map(d => WEEKDAYS.find(w => w.value === d)?.short ?? d).join(', ')
    : null;
  const s = hhmm(r.start_time);
  const e = hhmm(r.end_time);
  if (r.kind === 'holiday') return 'Días festivos del calendario';
  if (r.kind === 'weekday') {
    if (days.length === 1) return `Cada ${WEEKDAYS.find(w => w.value === days[0])?.label.toLowerCase()}`;
    return dayText ? `Los días: ${dayText}` : 'Sin días elegidos';
  }
  if (!s || !e) return 'Sin horario';
  const crosses = minutesOf(s) > minutesOf(e);
  return `${s}–${e}${crosses ? ' (cruza la medianoche)' : ''}${dayText ? ` · ${dayText}` : ''}`;
}

// ── Formulario ───────────────────────────────────────────────────────────────

export interface RuleForm {
  id: string | null;
  name: string;
  kind: RuleKind;
  start: string;
  end: string;
  weekdays: number[];
  type: SurchargeType;
  /** Texto tal cual lo teclea el admin: % o pesos según el tipo. */
  value: string;
  active: boolean;
}

export const emptyRuleForm = (): RuleForm => ({
  id: null,
  name: '',
  kind: 'time_band',
  start: '21:00',
  end: '07:00',
  weekdays: [],
  type: 'percent',
  value: '',
  active: true,
});

export function ruleToForm(r: ScheduleRule): RuleForm {
  return {
    id: r.id,
    name: r.name,
    kind: (['time_band', 'weekday', 'holiday'].includes(r.kind) ? r.kind : 'time_band') as RuleKind,
    start: hhmm(r.start_time) ?? '',
    end: hhmm(r.end_time) ?? '',
    weekdays: r.weekdays ?? [],
    type: r.surcharge_type === 'fixed' ? 'fixed' : 'percent',
    // bps → % y centavos → pesos: en ambos casos se divide entre 100.
    value: String(r.value / 100),
    active: r.is_active,
  };
}

/** Valor tecleado → bps (porcentaje) o centavos (fijo); NaN si no es válido. */
export function parseRuleValue(type: SurchargeType, text: string): number {
  const n = Number(text.trim().replace(',', '.'));
  if (!text.trim() || !Number.isFinite(n)) return NaN;
  return Math.round(n * 100);
}

export type RuleErrors = Partial<Record<'name' | 'start' | 'end' | 'weekdays' | 'value', string>>;

export function validateRuleForm(f: RuleForm): RuleErrors {
  const e: RuleErrors = {};
  if (!f.name.trim()) e.name = 'Ponle un nombre a la regla.';
  if (f.kind === 'time_band') {
    if (Number.isNaN(minutesOf(f.start))) e.start = 'Indica la hora de inicio.';
    if (Number.isNaN(minutesOf(f.end))) e.end = 'Indica la hora de fin.';
    if (!e.start && !e.end && minutesOf(f.start) === minutesOf(f.end))
      e.end = 'El fin debe ser distinto del inicio (si es menor, la franja cruza la medianoche).';
  }
  if (f.kind === 'weekday' && f.weekdays.length === 0) e.weekdays = 'Elige al menos un día.';
  const v = parseRuleValue(f.type, f.value);
  if (Number.isNaN(v) || v <= 0) e.value = 'Indica un valor mayor a cero.';
  else if (f.type === 'percent' && v > 10000) e.value = 'El porcentaje no puede pasar de 100%.';
  return e;
}

/** Argumentos de admin_upsert_schedule_rule (sin p_sort_order). */
export function ruleRpcArgs(f: RuleForm) {
  return {
    p_id: f.id as string,
    p_name: f.name.trim(),
    p_kind: f.kind,
    p_start_time: f.kind === 'time_band' ? f.start : undefined,
    p_end_time: f.kind === 'time_band' ? f.end : undefined,
    p_weekdays: f.kind === 'holiday' ? undefined : f.weekdays.length ? f.weekdays : undefined,
    p_surcharge_type: f.type,
    p_value: parseRuleValue(f.type, f.value),
    p_is_active: f.active,
  };
}

// ── Evaluación local (modo maqueta / pruebas) ────────────────────────────────

export interface Preview {
  timestamp: string;
  local_time: string;
  is_holiday: boolean;
  base_fee_cents: number;
  source: string | null;
  rule_id: string | null;
  rule_name: string | null;
  surcharge_type: string | null;
  surcharge_value: number | null;
  surcharge_cents: number;
  total_cents: number;
}

/** «2026-10-04» + «21:30» (hora de México, UTC−6 fija desde 2022) → instante ISO. */
export const mxInstant = (date: string, time: string) => new Date(`${date}T${time || '00:00'}:00-06:00`).toISOString();

interface LocalParts {
  date: string;
  minutes: number;
  weekday: number;
  label: string;
}
export function mxParts(ts: string | number | Date): LocalParts {
  const d = new Date(ts);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: MX_TZ,
      hourCycle: 'h23',
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
      .formatToParts(d)
      .map(p => [p.type, p.value]),
  ) as Record<string, string>;
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  const hh = Number(parts.hour);
  const mm = Number(parts.minute);
  return { date, minutes: hh * 60 + mm, weekday: wd, label: `${date} ${parts.hour}:${parts.minute}` };
}

/** ¿La regla aplica en ese instante? Todas sus condiciones definidas deben cumplirse. */
export function ruleMatches(r: ScheduleRule, p: Pick<LocalParts, 'date' | 'minutes' | 'weekday'>, holidays: Set<string>): boolean {
  if (!r.is_active) return false;
  if (r.kind === 'holiday' && !holidays.has(p.date)) return false;
  if (r.weekdays?.length && !r.weekdays.includes(p.weekday)) return false;
  if (r.kind === 'weekday' && !r.weekdays?.length) return false;
  if (r.kind === 'time_band') {
    const s = minutesOf(r.start_time);
    const e = minutesOf(r.end_time);
    if (Number.isNaN(s) || Number.isNaN(e)) return false;
    if (!(s <= e ? p.minutes >= s && p.minutes < e : p.minutes >= s || p.minutes < e)) return false;
  }
  return true;
}

export const ruleCents = (r: Pick<ScheduleRule, 'surcharge_type' | 'value'>, baseCents: number) =>
  r.surcharge_type === 'fixed' ? r.value : Math.round((baseCents * r.value) / 10_000);

/** Regla ganadora (mayor monto; empate → menor sort_order) y su recargo. */
export function evaluateSurcharge(
  rules: ScheduleRule[],
  holidays: Holiday[],
  baseCents: number,
  ts: string | number | Date,
): { rule: ScheduleRule | null; cents: number; isHoliday: boolean; local: string } {
  const p = mxParts(ts);
  const hs = new Set(holidays.map(h => h.date));
  let best: ScheduleRule | null = null;
  let bestCents = 0;
  for (const r of rules) {
    if (!ruleMatches(r, p, hs)) continue;
    const c = ruleCents(r, baseCents);
    if (best == null || c > bestCents || (c === bestCents && r.sort_order < best.sort_order)) {
      best = r;
      bestCents = c;
    }
  }
  return { rule: best, cents: best ? bestCents : 0, isHoliday: hs.has(p.date), local: p.label };
}

/** jsonb de admin_preview_schedule_surcharge → Preview (tolerante a faltantes). */
export function parsePreview(json: Json | null): Preview | null {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return null;
  const j = json as Record<string, Json | undefined>;
  const s = (v: Json | undefined) => (typeof v === 'string' ? v : null);
  const n = (v: Json | undefined) => (v == null || v === '' ? null : Number(v));
  return {
    timestamp: s(j.timestamp) ?? '',
    local_time: s(j.local_time) ?? '',
    is_holiday: j.is_holiday === true,
    base_fee_cents: n(j.base_fee_cents) ?? 0,
    source: s(j.source),
    rule_id: s(j.rule_id),
    rule_name: s(j.rule_name),
    surcharge_type: s(j.surcharge_type),
    surcharge_value: n(j.surcharge_value),
    surcharge_cents: n(j.surcharge_cents) ?? 0,
    total_cents: n(j.total_cents) ?? 0,
  };
}

/** Orden estable de la lista: activas primero, luego sort_order y nombre. */
export const sortRules = (rules: ScheduleRule[]) =>
  [...rules].sort(
    (a, b) =>
      Number(b.is_active) - Number(a.is_active) ||
      a.sort_order - b.sort_order ||
      a.name.localeCompare(b.name, 'es'),
  );

/** Festivos de un año (o todos) por fecha. */
export const sortHolidays = (hs: Holiday[]) => [...hs].sort((a, b) => a.date.localeCompare(b.date));

/** «jue 1 oct 2026» desde 'YYYY-MM-DD' (sin corrimiento de zona). */
export function holidayDateLabel(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('es-MX', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export const isValidDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
