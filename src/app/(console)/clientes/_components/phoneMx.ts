/** "+52 33 1234 5678" / "3312345678" → E.164 MX o null si no es válido. */
export function toE164Mx(input: string): string | null {
  const d = input.replace(/\D/g, '');
  const national = d.length === 12 && d.startsWith('52') ? d.slice(2) : d;
  return /^\d{10}$/.test(national) ? `+52${national}` : null;
}
