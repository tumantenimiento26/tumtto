import { describe, expect, it } from 'vitest';
import {
  attachmentsTitle,
  formatBytes,
  isImageMime,
  isPreviewable,
  mimeLabel,
  splitByQuote,
  type QuoteAttachment,
} from './quoteAttachments';

describe('quoteAttachments', () => {
  it('formatea tamaños', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2 KB');
    expect(formatBytes(10 * 1024 * 1024)).toBe('10 MB');
    expect(formatBytes(1536 * 1024)).toBe('1.5 MB');
  });
  it('etiqueta el tipo', () => {
    expect(mimeLabel('application/pdf')).toBe('PDF');
    expect(mimeLabel('image/jpeg')).toBe('JPG');
    expect(mimeLabel('image/heic')).toBe('HEIC');
    expect(mimeLabel('image/webp')).toBe('WEBP');
  });
  it('imágenes con vista previa; HEIC no', () => {
    expect(isImageMime('image/png')).toBe(true);
    expect(isImageMime('application/pdf')).toBe(false);
    expect(isPreviewable('image/png')).toBe(true);
    expect(isPreviewable('image/heic')).toBe(false);
    expect(isPreviewable('application/pdf')).toBe(false);
  });
  it('título con conteo', () => {
    expect(attachmentsTitle(0)).toBe('Anexos (0)');
    expect(attachmentsTitle(3)).toBe('Anexos (3)');
  });
  it('separa anexos de la cotización vigente y las anteriores', () => {
    const f = (id: string, quote_id: string) => ({ id, quote_id }) as QuoteAttachment;
    const r = splitByQuote([f('a', 'q2'), f('b', 'q1'), f('c', 'q2'), f('d', 'q0')], 'q2');
    expect(r.current.map(x => x.id)).toEqual(['a', 'c']);
    expect(r.older.map(o => o.quoteId)).toEqual(['q1', 'q0']);
    expect(splitByQuote([], null)).toEqual({ current: [], older: [] });
  });
});
