// Formatos de Soporte (puro, probado).

/** Código corto de disputa "DSP-0142", estable por uuid (solo etiqueta). */
export function disputeCode(id: string): string {
  const hex = id.replace(/[^0-9a-f]/gi, '').slice(-6) || '0';
  return `DSP-${String(parseInt(hex, 16) % 10000).padStart(4, '0')}`;
}

export const RESOLUTIONS = [
  { value: 'cliente', label: 'A favor del cliente' },
  { value: 'tecnico', label: 'A favor del técnico' },
  { value: 'parcial', label: 'Parcial' },
] as const;
export type Resolution = (typeof RESOLUTIONS)[number]['value'];

/** Nota guardada en disputes.resolution_notes: decisión + comentario. */
export function resolutionNote(r: Resolution, comment: string): string {
  const label = RESOLUTIONS.find(x => x.value === r)!.label;
  const c = comment.trim();
  return c ? `${label}: ${c}` : label;
}

/** Búsqueda sin acentos sobre varios campos. */
export function matches(q: string, ...fields: (string | null | undefined)[]) {
  const norm = (s: string) =>
    s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const needle = norm(q.trim());
  return !needle || fields.some(f => f && norm(f).includes(needle));
}
