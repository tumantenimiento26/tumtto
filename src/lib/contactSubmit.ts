import { MOCK } from '@/lib/mock';
import type { ContactErrors, ContactPayload } from '@/lib/contactForm';

export type SubmitResult =
  | { ok: true }
  | { ok: false; kind: 'invalid'; errors: ContactErrors }
  | { ok: false; kind: 'rate-limit' | 'network' | 'server' };

/** Mensaje para la persona según el resultado fallido. */
export function submitErrorMessage(
  r: Exclude<SubmitResult, { ok: true }>,
): string {
  if (r.kind === 'rate-limit') return 'Demasiados intentos, intenta más tarde.';
  if (r.kind === 'network')
    return 'No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.';
  if (r.kind === 'invalid') return 'Revisa los campos marcados.';
  return 'No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos por otro canal.';
}

/** Interpreta la respuesta de `contact-submit` (pura, probada). */
export function parseSubmitResponse(status: number, body: unknown): SubmitResult {
  const b = (body ?? {}) as { ok?: boolean; errors?: ContactErrors };
  if (status === 429) return { ok: false, kind: 'rate-limit' };
  if (status === 400 && b.errors) return { ok: false, kind: 'invalid', errors: b.errors };
  if (status >= 200 && status < 300 && b.ok !== false) return { ok: true };
  return { ok: false, kind: 'server' };
}

/**
 * POST a la Edge Function pública `contact-submit` (verify_jwt = false).
 * En modo maqueta simula el éxito sin red.
 */
export async function submitContact(p: ContactPayload): Promise<SubmitResult> {
  if (MOCK) {
    await new Promise(r => setTimeout(r, 700));
    return { ok: true };
  }
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return { ok: false, kind: 'server' };
  try {
    const res = await fetch(`${base}/functions/v1/contact-submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    });
    const body: unknown = await res.json().catch(() => null);
    return parseSubmitResponse(res.status, body);
  } catch {
    return { ok: false, kind: 'network' };
  }
}
