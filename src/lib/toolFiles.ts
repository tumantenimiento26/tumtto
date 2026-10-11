// Fotos y documentos de herramienta (bucket privado `tool-files`): helpers puros.
import type { Database } from '@/types/supabase';
import { fromYmd } from '@/lib/inventory';

export type ToolAttachment = Database['public']['Tables']['tool_attachments']['Row'];
export type ToolAttachmentKind = Database['public']['Enums']['tool_attachment_kind'];

export const TOOL_FILE_KINDS: ToolAttachmentKind[] = ['photo', 'warranty', 'manual', 'invoice', 'other'];
export const TOOL_FILE_KIND_LABEL: Record<ToolAttachmentKind, string> = {
  photo: 'Foto',
  warranty: 'Garantía',
  manual: 'Manual',
  invoice: 'Factura',
  other: 'Otro',
};
export const TOOL_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];
export const MAX_TOOL_FILE = 15 * 1024 * 1024;
export const MAX_TOOL_FILES = 20;

/** Valida tipo/tamaño/tope antes de subir; devuelve el mensaje de error o null. */
export function validateToolFile(file: { type: string; size: number }, existing: number): string | null {
  if (existing >= MAX_TOOL_FILES) return `Máximo ${MAX_TOOL_FILES} archivos por herramienta.`;
  if (!TOOL_FILE_TYPES.includes(file.type)) return 'El archivo debe ser imagen (JPG, PNG, WEBP, HEIC) o PDF.';
  if (file.size <= 0 || file.size > MAX_TOOL_FILE) return 'El archivo debe pesar máximo 15 MB.';
  return null;
}

const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'application/pdf': 'pdf',
};
/** Ruta en el bucket: `company/<tool>/<uuid>.<ext>` o `tech/<tech>/<tool>/<uuid>.<ext>`. */
export const toolFilePath = (
  owner: { companyToolId: string } | { technicianId: string; technicianToolId: string },
  uuid: string,
  mime: string,
) => {
  const ext = EXT[mime] ?? 'bin';
  return 'companyToolId' in owner
    ? `company/${owner.companyToolId}/${uuid}.${ext}`
    : `tech/${owner.technicianId}/${owner.technicianToolId}/${uuid}.${ext}`;
};

export type WarrantyState = { tone: 'danger' | 'warning' | null; label: string };

/** «Vence 12 mar 2027» + insignia: vencida o por vencer (< 30 días). Solo aplica a garantías. */
export function warrantyState(a: Pick<ToolAttachment, 'kind' | 'expires_on'>, now = new Date()): WarrantyState | null {
  if (a.kind !== 'warranty' || !a.expires_on) return null;
  const d = fromYmd(a.expires_on);
  if (!d) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((d.getTime() - today.getTime()) / 864e5);
  if (days < 0) return { tone: 'danger', label: 'Vencida' };
  if (days < 30) return { tone: 'warning', label: days === 0 ? 'Vence hoy' : `Vence en ${days} d` };
  return { tone: null, label: '' };
}

export const expiryText = (ymd: string) =>
  `Vence ${(fromYmd(ymd) ?? new Date(NaN)).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/\./g, '')}`;

/** Fotos primero, luego por fecha descendente. */
export const sortToolFiles = (list: ToolAttachment[]) =>
  [...list].sort(
    (a, b) =>
      Number(b.kind === 'photo') - Number(a.kind === 'photo') || b.created_at.localeCompare(a.created_at),
  );
