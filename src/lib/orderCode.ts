/**
 * Código corto y estable de una orden para la UI (handoff: "SVC-2851").
 * ponytail: derivado del uuid (no hay columna de folio); puede chocar entre
 * órdenes (1 en 9,000) — sólo es una etiqueta, la navegación usa el uuid.
 * Si se necesita folio único, columna `folio` con secuencia en el backend.
 */
export function orderCode(id: string): string {
  const hex = id.replace(/[^0-9a-f]/gi, '').slice(0, 8) || '0';
  const n = (parseInt(hex, 16) % 9000) + 1000;
  return `SVC-${n}`;
}

/** ¿El texto parece un código SVC? (para buscar por código). */
export const isOrderCode = (q: string) => /^svc-?\d{1,4}$/i.test(q.trim());
