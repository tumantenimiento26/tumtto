/**
 * Código corto de una orden para la UI: `SVC-<folio>` con el folio real de
 * `service_orders.folio` (secuencia del backend). Las órdenes sin folio
 * registrado (snapshot viejo, ids de prueba) caen al hash del uuid de antes,
 * que es solo una etiqueta (puede chocar 1 en 9,000); la navegación usa el uuid.
 *
 * El store registra los folios al cargar el snapshot (`registerFolios`) para
 * que todas las pantallas sigan llamando `orderCode(id)` sin pasar la fila.
 */
const folios = new Map<string, number>();

export function registerFolios(
  rows: Iterable<{ id: string; folio?: number | null }>,
) {
  folios.clear();
  for (const r of rows) if (r.folio != null) folios.set(r.id, Number(r.folio));
}

export function orderCode(id: string): string {
  const folio = folios.get(id);
  if (folio != null) return `SVC-${folio}`;
  // Hash FNV-1a de todo el uuid: los ids del seed (y de prod) comparten
  // prefijo, así que tomar los primeros dígitos daba el mismo código a todas.
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `SVC-${(h % 9000) + 1000}`;
}

/** ¿El texto parece un código SVC? (para buscar por código). */
export const isOrderCode = (q: string) => /^svc-?\d{1,8}$/i.test(q.trim());
