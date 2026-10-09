// Anexos de cotización (bucket privado quote-attachments): helpers puros.
export type QuoteAttachment = {
  id: string;
  quote_id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
  uploaded_by: string | null;
  storage_path: string;
  /** URL firmada (10 min) para imágenes; los PDF la piden al abrir. */
  url: string | null;
};

export const isImageMime = (mime: string) => mime.startsWith('image/');
// El navegador no renderiza HEIC/HEIF: se tratan como archivo descargable.
export const isPreviewable = (mime: string) =>
  isImageMime(mime) && !/heic|heif/i.test(mime);

export function mimeLabel(mime: string): string {
  if (mime === 'application/pdf') return 'PDF';
  if (/heic|heif/i.test(mime)) return 'HEIC';
  if (mime === 'image/jpeg') return 'JPG';
  if (mime === 'image/png') return 'PNG';
  if (mime === 'image/webp') return 'WEBP';
  return mime.split('/')[1]?.toUpperCase() ?? 'Archivo';
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1).replace(/\.0$/, '')} MB`;
}

/** Título de la sección: «Anexos (N)». */
/** Separa los anexos de la cotización vigente de los de cotizaciones anteriores (por quote_id). */
export function splitByQuote(items: QuoteAttachment[], latestQuoteId: string | null) {
  const older = new Map<string, QuoteAttachment[]>();
  const current: QuoteAttachment[] = [];
  for (const a of items) {
    if (a.quote_id === latestQuoteId) current.push(a);
    else older.set(a.quote_id, [...(older.get(a.quote_id) ?? []), a]);
  }
  return { current, older: [...older.entries()].map(([quoteId, files]) => ({ quoteId, files })) };
}

export const attachmentsTitle = (n: number) => `Anexos (${n})`;
