// Herramienta del técnico: helpers puros (agrupado, filtro, revisión de texto libre, bitácora).

export interface CatalogToolLike {
  id: string;
  name: string;
  category_id: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface TechToolLike {
  id: string;
  technician_id: string;
  catalog_id: string | null;
  custom_name: string | null;
  custom_category_id: string | null;
  created_at?: string;
}

/** Herramienta de un técnico ya resuelta (catálogo o texto libre). */
export interface ToolView {
  /** id de la fila technician_tools. */
  rowId: string;
  /** Nombre a mostrar. */
  name: string;
  catalogId: string | null;
  /** Categoría del catálogo o, en texto libre, la sugerida por el técnico. */
  categoryId: string | null;
  /** true = texto libre («No listada»). */
  custom: boolean;
}

export const GENERAL_GROUP = '__general';
export const OTHER_GROUP = '__other';

/** Compara nombres como el backend: lower(btrim()) y espacios colapsados. */
export const normalizeToolName = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase();

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, 'es');

/** Herramientas del técnico, resueltas contra el catálogo (filas huérfanas se omiten). */
export function resolveTechTools(
  rows: TechToolLike[],
  catalog: CatalogToolLike[],
  techId: string,
): ToolView[] {
  const out: ToolView[] = [];
  for (const r of rows) {
    if (r.technician_id !== techId) continue;
    if (r.catalog_id) {
      const c = catalog.find(x => x.id === r.catalog_id);
      if (c) out.push({ rowId: r.id, name: c.name, catalogId: c.id, categoryId: c.category_id, custom: false });
    } else if (r.custom_name?.trim()) {
      out.push({
        rowId: r.id,
        name: r.custom_name.trim(),
        catalogId: null,
        categoryId: r.custom_category_id,
        custom: true,
      });
    }
  }
  return out.sort(byName);
}

export interface ToolGroup<T> {
  key: string;
  label: string;
  items: T[];
}

/**
 * Agrupa por categoría de servicio (en el orden dado), luego «Generales» y,
 * al final, «Otras» (texto libre sin categoría sugerida).
 */
export function groupByCategory<T extends { categoryId: string | null; custom?: boolean }>(
  items: T[],
  categories: { id: string; name: string }[],
): ToolGroup<T>[] {
  const groups: ToolGroup<T>[] = [];
  for (const c of categories) {
    const list = items.filter(i => i.categoryId === c.id);
    if (list.length) groups.push({ key: c.id, label: c.name, items: list });
  }
  const known = new Set(categories.map(c => c.id));
  const general = items.filter(i => !i.custom && (!i.categoryId || !known.has(i.categoryId)));
  if (general.length) groups.push({ key: GENERAL_GROUP, label: 'Generales', items: general });
  const other = items.filter(i => i.custom && (!i.categoryId || !known.has(i.categoryId)));
  if (other.length) groups.push({ key: OTHER_GROUP, label: 'Otras (texto libre)', items: other });
  return groups;
}

/** El técnico debe tener TODAS las herramientas de catálogo seleccionadas (vacío = sin filtro). */
export const hasAllTools = (techToolIds: string[], selected: string[]) =>
  selected.every(id => techToolIds.includes(id));

/** Herramientas del técnico propias de una categoría de servicio (catálogo o sugerida). */
export const toolsForCategory = (tools: ToolView[], categoryId: string | null | undefined) =>
  categoryId ? tools.filter(t => t.categoryId === categoryId) : [];

/** Cuántos técnicos distintos tienen cada ítem de catálogo. */
export function countCatalogTechs(rows: TechToolLike[], catalogId: string): number {
  return new Set(rows.filter(r => r.catalog_id === catalogId).map(r => r.technician_id)).size;
}

export interface CustomToolSummary {
  name: string;
  technicians_count: number;
  category_ids: string[];
  first_seen: string;
}

/** Mismo agrupado que admin_custom_tools (modo demo): texto libre por nombre normalizado. */
export function summarizeCustomTools(rows: TechToolLike[]): CustomToolSummary[] {
  const map = new Map<string, { name: string; techs: Set<string>; cats: Set<string>; first: string }>();
  for (const r of rows) {
    if (r.catalog_id || !r.custom_name?.trim()) continue;
    const key = normalizeToolName(r.custom_name);
    const e = map.get(key) ?? { name: r.custom_name.trim(), techs: new Set(), cats: new Set(), first: r.created_at ?? '' };
    e.techs.add(r.technician_id);
    if (r.custom_category_id) e.cats.add(r.custom_category_id);
    if (r.created_at && (!e.first || r.created_at < e.first)) e.first = r.created_at;
    map.set(key, e);
  }
  return [...map.values()]
    .map(e => ({
      name: e.name,
      technicians_count: e.techs.size,
      category_ids: [...e.cats],
      first_seen: e.first,
    }))
    .sort((a, b) => b.technicians_count - a.technicians_count || a.name.localeCompare(b.name, 'es'));
}

export const TOOL_EVENT_LABEL: Record<string, string> = {
  tool_added: 'Herramienta agregada',
  tool_updated: 'Herramienta actualizada',
  tool_removed: 'Herramienta eliminada',
};

interface ToolSnap {
  catalog_id?: string | null;
  custom_name?: string | null;
  name?: string | null;
}
interface ToolPayload {
  before?: ToolSnap | null;
  after?: ToolSnap | null;
}

/** Texto de bitácora: «Herramienta agregada: Multímetro». */
export function toolEventText(
  eventType: string,
  payload: unknown,
  catalogName: (id: string) => string | null = () => null,
): string {
  const label = TOOL_EVENT_LABEL[eventType] ?? eventType;
  const p = (payload ?? {}) as ToolPayload;
  const snap = eventType === 'tool_removed' ? (p.before ?? p.after) : (p.after ?? p.before);
  const name =
    snap?.custom_name?.trim() || snap?.name?.trim() || (snap?.catalog_id ? catalogName(snap.catalog_id) : null);
  return name ? `${label}: ${name}` : label;
}
