// Lógica pura de la página de Notificaciones: filtros, conteos y grupos.

export type NotifTab = 'todas' | 'no-leidas';

interface Item {
  id: string;
  type: string;
  ts: string;
  read: boolean;
}

/** Aplica pestaña (todas / no leídas) y tipo. */
export function filterNotifs<T extends Item>(
  items: T[],
  tab: NotifTab,
  type: string | null,
): T[] {
  return items.filter(
    n => (tab === 'todas' || !n.read) && (!type || n.type === type),
  );
}

/** No leídas por tipo (para la lista lateral). */
export function unreadByType(items: Item[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const n of items) if (!n.read) out[n.type] = (out[n.type] ?? 0) + 1;
  return out;
}

/** Agrupa en Hoy / Anteriores conservando el orden. */
export function groupByDay<T extends Item>(
  items: T[],
  now = Date.now(),
): { label: 'Hoy' | 'Anteriores'; items: T[] }[] {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const today = items.filter(n => new Date(n.ts).getTime() >= start.getTime());
  const older = items.filter(n => new Date(n.ts).getTime() < start.getTime());
  return [
    { label: 'Hoy' as const, items: today },
    { label: 'Anteriores' as const, items: older },
  ].filter(g => g.items.length > 0);
}

/** Estado del "seleccionar todo" respecto a los visibles. */
export function selectionState(
  visible: { id: string }[],
  selected: ReadonlySet<string>,
): 'none' | 'some' | 'all' {
  const n = visible.filter(v => selected.has(v.id)).length;
  return n === 0 ? 'none' : n === visible.length ? 'all' : 'some';
}
