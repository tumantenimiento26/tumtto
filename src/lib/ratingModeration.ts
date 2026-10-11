// Moderación de calificaciones de técnicos: catálogo de motivos y helpers puros.
// Las ocultas nunca se borran; se excluyen de promedios y de la vista pública.
import type { Database } from '@/types/supabase';

export type RatingReason = Database['public']['Enums']['rating_moderation_reason'];

export const RATING_REASONS: { value: RatingReason; label: string }[] = [
  { value: 'offensive', label: 'Ofensiva' },
  { value: 'fraudulent', label: 'Fraudulenta' },
  { value: 'duplicate', label: 'Duplicada' },
  { value: 'cancelled_service', label: 'Servicio cancelado' },
  { value: 'client_error', label: 'Error del cliente' },
  { value: 'other', label: 'Otro' },
];

export const ratingReasonLabel = (r: RatingReason | null | undefined) =>
  RATING_REASONS.find(x => x.value === r)?.label ?? '—';

/** «Otro» exige nota; el resto la admite opcional. */
export const ratingNoteRequired = (r: RatingReason | null) => r === 'other';

type Rated = { score: number; is_hidden?: boolean | null };

/** Solo las calificaciones que cuentan (no ocultas). */
export const visibleRatings = <T extends Rated>(rs: T[]): T[] => rs.filter(r => !r.is_hidden);

/** Promedio y conteo excluyendo ocultas (misma regla que el servidor). */
export function ratingSummary(rs: Rated[]): { avg: number; count: number } {
  const v = visibleRatings(rs);
  return {
    avg: v.length ? v.reduce((s, r) => s + r.score, 0) / v.length : 0,
    count: v.length,
  };
}

export type RatingFilter = 'all' | 'visible' | 'hidden';

export const filterRatings = <T extends Rated>(rs: T[], f: RatingFilter): T[] =>
  f === 'all' ? rs : rs.filter(r => (f === 'hidden') === !!r.is_hidden);
