// Comprobante de domicilio del cliente: helpers puros (sin Supabase).
import type { Database } from '@/types/supabase';

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

// ── Tipo de comprobante + dirección vinculada (address-proof v2) ────────────
export type AddressProofType = Database['public']['Enums']['address_proof_type'];

type ReviewRow = Database['public']['Views']['client_documents_review']['Row'];
type LinkedAddressKey =
  | 'address_label'
  | 'address_line'
  | 'address_place_name'
  | 'address_neighborhood'
  | 'address_municipality'
  | 'address_state'
  | 'address_postal_code'
  | 'address_lat'
  | 'address_lng';
/** Fila de la vista client_documents_review: el comprobante + la dirección vinculada (o NULLs). */
export type ClientDocumentRow = Database['public']['Tables']['client_documents']['Row'] &
  Pick<ReviewRow, LinkedAddressKey>;

export const PROOF_TYPE_LABEL: Record<AddressProofType, string> = {
  ine: 'INE',
  electricity: 'Recibo de luz',
  phone: 'Recibo de teléfono / internet',
  bank_statement: 'Carátula de estado de cuenta',
};

/** NULL = fila previa al tipo: se trata como recibo. */
export const proofTypeLabel = (t: AddressProofType | null | undefined): string =>
  t ? PROOF_TYPE_LABEL[t] : 'Recibo (sin tipo)';

/** La INE no tiene fecha de emisión (vigencia se revisa a ojo); los recibos sí (≤ 3 meses). */
export const requiresIssueDate = (t: AddressProofType | null | undefined): boolean => t !== 'ine';

/** Motivos rápidos para rechazar un comprobante de domicilio. */
export const CLIENT_DOC_REJECT_REASONS = [
  'La dirección no coincide',
  'Documento ilegible o incompleto',
  'Recibo con más de 3 meses',
  'INE vencida',
] as const;

type LinkedAddress = {
  address_line?: string | null;
  address_neighborhood?: string | null;
  address_municipality?: string | null;
  address_state?: string | null;
  address_postal_code?: string | null;
  address_lat?: number | null;
  address_lng?: number | null;
};

/** Dirección vinculada en una línea (calle, colonia, municipio, estado, CP); null si no hay. */
export function linkedAddressText(d: LinkedAddress): string | null {
  const cp = d.address_postal_code?.trim() ? `C.P. ${d.address_postal_code.trim()}` : null;
  const parts = [d.address_line, d.address_neighborhood, d.address_municipality, d.address_state, cp]
    .map(p => p?.trim())
    .filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

/** [lng, lat] de la dirección vinculada; null si falta alguna coordenada. */
export const linkedAddressPoint = (d: LinkedAddress): [number, number] | null =>
  d.address_lng != null && d.address_lat != null ? [d.address_lng, d.address_lat] : null;
