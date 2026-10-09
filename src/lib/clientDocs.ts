// Comprobante de domicilio del cliente: helpers puros (sin Supabase).
export type ClientDocStatus = 'none' | 'pending' | 'approved' | 'rejected';
type Tone = 'neutral' | 'warning' | 'success' | 'danger';

/** Sin fila = «Pendiente» (por subir); pending = «En revisión». */
export const CLIENT_DOC_STATUS: Record<ClientDocStatus, { label: string; tone: Tone }> = {
  none: { label: 'Pendiente', tone: 'neutral' },
  pending: { label: 'En revisión', tone: 'warning' },
  approved: { label: 'Aprobado', tone: 'success' },
  rejected: { label: 'Rechazado', tone: 'danger' },
};

export const clientDocStatus = (
  doc: { review_status: 'pending' | 'approved' | 'rejected' } | null | undefined,
): ClientDocStatus => (doc ? doc.review_status : 'none');

export const CLIENT_DOC_LABEL = 'Comprobante de domicilio';
export const ADDRESS_VERIFIED_LABEL = 'Domicilio verificado';

/** Motivo de rechazo válido (obligatorio, sin solo espacios). */
export const rejectionNotes = (notes: string | null | undefined): string | null => {
  const n = (notes ?? '').trim();
  return n ? n : null;
};
