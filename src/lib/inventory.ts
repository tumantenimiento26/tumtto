// Inventario de herramienta de la empresa: lógica pura (etiquetas, filtros,
// reportes, bitácora, parseo de costo y fechas). Sin Supabase ni store.
import type { Database } from '@/types/supabase';
import { fmtDate } from '@/lib/dates';

type Enums = Database['public']['Enums'];
type Tables = Database['public']['Tables'];
export type InventoryStatus = Enums['inventory_status'];
export type InventoryCondition = Enums['inventory_condition'];
export type RetireReason = Enums['inventory_retire_reason'];
export type CompanyTool = Tables['company_tools']['Row'];
export type ToolAssignment = Tables['company_tool_assignments']['Row'];

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'navy';

export const STATUS_ORDER: InventoryStatus[] = ['available', 'assigned', 'in_repair', 'retired'];
export const STATUS_META: Record<InventoryStatus, { label: string; tone: Tone }> = {
  available: { label: 'Disponible', tone: 'success' },
  assigned: { label: 'Asignada', tone: 'info' },
  in_repair: { label: 'En reparación', tone: 'warning' },
  retired: { label: 'Dada de baja', tone: 'neutral' },
};

export const CONDITIONS: InventoryCondition[] = ['new', 'good', 'fair', 'damaged'];
export const CONDITION_LABEL: Record<InventoryCondition, string> = {
  new: 'Nueva',
  good: 'Buena',
  fair: 'Regular',
  damaged: 'Dañada',
};

export const RETIRE_REASONS: RetireReason[] = ['damage', 'loss', 'theft', 'end_of_life'];
export const RETIRE_REASON_LABEL: Record<RetireReason, string> = {
  damage: 'Daño',
  loss: 'Pérdida',
  theft: 'Robo',
  end_of_life: 'Fin de vida útil',
};

/** Acciones disponibles según el estado (el backend valida lo mismo). */
export function toolActions(status: InventoryStatus) {
  return {
    edit: status !== 'retired',
    assign: status === 'available',
    return: status === 'assigned',
    repairStart: status === 'available',
    repairFinish: status === 'in_repair',
    retire: status !== 'retired',
  };
}

export const normalizeSerial = (s: string) => s.trim().replace(/\s+/g, ' ').toUpperCase();

// ── Costo (MXN ⇄ centavos) y fechas ──────────────────────────────────────────

/** «1,250.50» → 125050; vacío → null; inválido/negativo → NaN. */
export function parsePesos(text: string): number | null {
  const t = text.replace(/[$,\s]/g, '');
  if (t === '') return null;
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return NaN;
  return Math.round(Number(t) * 100);
}

export const pesosInput = (cents: number | null | undefined) =>
  cents == null ? '' : (cents / 100).toFixed(2).replace(/\.00$/, '');

export const formatMxn = (cents: number | null | undefined) =>
  cents == null
    ? '—'
    : new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(cents / 100);

/** `YYYY-MM-DD` local de un Date (acquired_on es una fecha sin hora). */
export const toYmd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const fromYmd = (ymd: string | null | undefined): Date | null => {
  if (!ymd) return null;
  const [y, m, d] = ymd.split('-').map(Number);
  return y && m && d ? new Date(y, m - 1, d) : null;
};

/** Fecha elegida → timestamptz: hoy usa la hora actual; otro día, mediodía local. */
export function dayToIso(d: Date, now = new Date()): string {
  if (toYmd(d) === toYmd(now)) return now.toISOString();
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x.toISOString();
}

export const isFutureDay = (d: Date, now = new Date()) => toYmd(d) > toYmd(now);

export const shortDate = (iso: string | null | undefined) =>
  iso ? fmtDate(iso, { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

/** Días completos transcurridos desde `iso`. */
export const daysHeld = (iso: string, now = Date.now()) =>
  Math.max(0, Math.floor((now - new Date(iso).getTime()) / 864e5));

export const heldLabel = (days: number) =>
  days === 0 ? 'Hoy' : days === 1 ? '1 día' : days < 60 ? `${days} días` : `${Math.round(days / 30)} meses`;

// ── Vista plana y filtros del listado ────────────────────────────────────────

export interface ToolRow {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  serial: string;
  categoryId: string | null;
  status: InventoryStatus;
  photoPath: string | null;
  costCents: number | null;
  techId: string | null;
  techName: string | null;
  since: string | null;
  createdAt: string;
}

export interface InventoryFilters {
  query: string;
  /** null = todas; 'general' = sin categoría. */
  categoryId: string | null;
  status: InventoryStatus | null;
  techId: string | null;
}
export const EMPTY_INVENTORY_FILTERS: InventoryFilters = {
  query: '',
  categoryId: null,
  status: null,
  techId: null,
};
export const GENERAL = 'general';

const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function filterTools(rows: ToolRow[], f: InventoryFilters): ToolRow[] {
  const q = norm(f.query.trim());
  return rows.filter(r => {
    if (f.status && r.status !== f.status) return false;
    if (f.categoryId === GENERAL ? r.categoryId !== null : f.categoryId && r.categoryId !== f.categoryId)
      return false;
    if (f.techId && r.techId !== f.techId) return false;
    if (!q) return true;
    return norm(`${r.name} ${r.serial} ${r.brand ?? ''} ${r.model ?? ''}`).includes(q);
  });
}

export const activeDrawerFilters = (f: InventoryFilters) =>
  (f.categoryId ? 1 : 0) + (f.status ? 1 : 0) + (f.techId ? 1 : 0);

export const openAssignment = (list: ToolAssignment[], toolId: string) =>
  list.find(a => a.tool_id === toolId && a.returned_at === null) ?? null;

export function buildToolRows(
  tools: CompanyTool[],
  assignments: ToolAssignment[],
  techName: (id: string) => string | null,
): ToolRow[] {
  const open = new Map(assignments.filter(a => a.returned_at === null).map(a => [a.tool_id, a]));
  return tools.map(t => {
    const a = open.get(t.id) ?? null;
    return {
      id: t.id,
      name: t.name,
      brand: t.brand,
      model: t.model,
      serial: t.serial_or_code,
      categoryId: t.category_id,
      status: t.status,
      photoPath: t.photo_path,
      costCents: t.acquisition_cost_cents,
      techId: a?.technician_id ?? null,
      techName: a ? techName(a.technician_id) : null,
      since: a?.assigned_at ?? null,
      createdAt: t.created_at,
    };
  });
}

export const statusCounts = (rows: ToolRow[]) =>
  STATUS_ORDER.reduce(
    (acc, s) => ({ ...acc, [s]: rows.filter(r => r.status === s).length }),
    {} as Record<InventoryStatus, number>,
  );

// ── Reportes ─────────────────────────────────────────────────────────────────

export interface ByTechnicianRow {
  technician_id: string;
  technician_name: string;
  tools_count: number;
  total_value_cents: number;
  tools: { tool_id: string; name: string; serial_or_code: string; assigned_at: string }[];
}

/** Mismo agrupado que admin_company_tools_by_technician (modo demo / respaldo). */
export function byTechnician(
  tools: CompanyTool[],
  assignments: ToolAssignment[],
  techName: (id: string) => string | null,
): ByTechnicianRow[] {
  const byId = new Map(tools.map(t => [t.id, t]));
  const map = new Map<string, ByTechnicianRow>();
  for (const a of assignments) {
    const t = byId.get(a.tool_id);
    if (a.returned_at !== null || !t) continue;
    const row = map.get(a.technician_id) ?? {
      technician_id: a.technician_id,
      technician_name: techName(a.technician_id) ?? 'Técnico',
      tools_count: 0,
      total_value_cents: 0,
      tools: [],
    };
    row.tools_count += 1;
    row.total_value_cents += t.acquisition_cost_cents ?? 0;
    row.tools.push({ tool_id: t.id, name: t.name, serial_or_code: t.serial_or_code, assigned_at: a.assigned_at });
    map.set(a.technician_id, row);
  }
  return [...map.values()]
    .map(r => ({ ...r, tools: r.tools.sort((x, y) => x.assigned_at.localeCompare(y.assigned_at)) }))
    .sort((x, y) => x.technician_name.localeCompare(y.technician_name, 'es'));
}

export interface OutstandingRow {
  assignment_id: string;
  tool_id: string;
  tool_name: string;
  serial_or_code: string;
  technician_id: string;
  technician_name: string;
  assigned_at: string;
  assigned_condition: InventoryCondition;
  days_held: number;
  acquisition_cost_cents: number | null;
}

/** Mismo criterio que admin_company_tools_outstanding (más antiguas primero). */
export function outstanding(
  tools: CompanyTool[],
  assignments: ToolAssignment[],
  techName: (id: string) => string | null,
  olderThanDays = 0,
  now = Date.now(),
): OutstandingRow[] {
  const byId = new Map(tools.map(t => [t.id, t]));
  const out: OutstandingRow[] = [];
  for (const a of assignments) {
    const t = byId.get(a.tool_id);
    if (a.returned_at !== null || !t) continue;
    const days = daysHeld(a.assigned_at, now);
    if (days < olderThanDays) continue;
    out.push({
      assignment_id: a.id,
      tool_id: t.id,
      tool_name: t.name,
      serial_or_code: t.serial_or_code,
      technician_id: a.technician_id,
      technician_name: techName(a.technician_id) ?? 'Técnico',
      assigned_at: a.assigned_at,
      assigned_condition: a.assigned_condition,
      days_held: days,
      acquisition_cost_cents: t.acquisition_cost_cents,
    });
  }
  return out.sort((x, y) => x.assigned_at.localeCompare(y.assigned_at));
}

export const AGE_FILTERS = [
  { value: 0, label: 'Todas' },
  { value: 30, label: '+30 días' },
  { value: 60, label: '+60 días' },
  { value: 90, label: '+90 días' },
  { value: 180, label: '+180 días' },
] as const;

export function ageTone(days: number): Tone {
  return days >= 90 ? 'danger' : days >= 30 ? 'warning' : 'neutral';
}

/** CSV con BOM (Excel) y escape de comillas/comas/saltos. */
export { toCsv as inventoryCsv } from './csv';

// ── Bitácora ─────────────────────────────────────────────────────────────────

export const INVENTORY_EVENT_LABEL: Record<string, string> = {
  tool_created: 'Herramienta dada de alta',
  tool_edited: 'Herramienta editada',
  tool_assigned: 'Herramienta asignada',
  tool_returned: 'Herramienta devuelta',
  tool_repair_started: 'Enviada a reparación',
  tool_repair_finished: 'Reparación terminada',
  tool_retired: 'Herramienta dada de baja',
  company_tool_assigned: 'Herramienta de la empresa asignada',
  company_tool_returned: 'Herramienta de la empresa devuelta',
};

/** ¿Es un evento de inventario (herramienta de la empresa)? */
export const isInventoryEvent = (entityType: string, eventType: string) =>
  entityType === 'company_tool' || eventType.startsWith('company_tool_');

interface P {
  technician_name?: string;
  tool_name?: string;
  condition?: string;
  reason?: string;
  note?: string | null;
  new_status?: string;
}

const cond = (c: unknown) => CONDITION_LABEL[c as InventoryCondition] ?? null;

/** Texto de bitácora: «Herramienta asignada a Ana — condición Buena — nota». */
export function inventoryEventText(eventType: string, payload: unknown): string {
  const p = (payload ?? {}) as P;
  const label = INVENTORY_EVENT_LABEL[eventType] ?? eventType;
  const parts: string[] = [];
  if (eventType === 'tool_assigned' && p.technician_name) parts.push(`${label} a ${p.technician_name}`);
  else if (eventType.startsWith('company_tool_') && p.tool_name) parts.push(`${label}: ${p.tool_name}`);
  else parts.push(label);
  const c = cond(p.condition);
  if (c) parts.push(`condición ${c.toLowerCase()}`);
  if (eventType === 'tool_returned' && p.new_status === 'in_repair') parts.push('a reparación');
  if (eventType === 'tool_retired' && p.reason)
    parts.push(`motivo ${(RETIRE_REASON_LABEL[p.reason as RetireReason] ?? p.reason).toLowerCase()}`);
  if (typeof p.note === 'string' && p.note.trim()) parts.push(p.note.trim());
  return parts.join(' — ');
}
