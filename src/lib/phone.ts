// Ladas + formato de celular. El valor canónico es E.164 sin espacios
// ("+523312345678"); el formato solo existe para capturar y mostrar.
// ponytail: lista fija de países — agregar filas aquí si se abre otro mercado.

export type Country = {
  iso: string;
  name: string;
  flag: string;
  dial: string;
  /** "#" = dígito. La cantidad de "#" es la longitud del número nacional. */
  mask: string;
};

export const COUNTRIES: Country[] = [
  { iso: 'MX', name: 'México', flag: '🇲🇽', dial: '52', mask: '## #### ####' },
  {
    iso: 'US',
    name: 'Estados Unidos',
    flag: '🇺🇸',
    dial: '1',
    mask: '(###) ###-####',
  },
  { iso: 'CA', name: 'Canadá', flag: '🇨🇦', dial: '1', mask: '(###) ###-####' },
  { iso: 'GT', name: 'Guatemala', flag: '🇬🇹', dial: '502', mask: '#### ####' },
  { iso: 'CO', name: 'Colombia', flag: '🇨🇴', dial: '57', mask: '### ### ####' },
  {
    iso: 'AR',
    name: 'Argentina',
    flag: '🇦🇷',
    dial: '54',
    mask: '## #### ####',
  },
  { iso: 'CL', name: 'Chile', flag: '🇨🇱', dial: '56', mask: '# #### ####' },
  { iso: 'PE', name: 'Perú', flag: '🇵🇪', dial: '51', mask: '### ### ###' },
  { iso: 'ES', name: 'España', flag: '🇪🇸', dial: '34', mask: '### ## ## ##' },
];

export const DEFAULT_COUNTRY = COUNTRIES[0];

const digitsOf = (s: string) => s.replace(/\D/g, '');
const lengthOf = (c: Country) => c.mask.split('#').length - 1;

/** Aplica la máscara conforme se teclea; no agrega separadores colgantes. */
export function formatNational(digits: string, country: Country): string {
  const d = digitsOf(digits).slice(0, lengthOf(country));
  let out = '';
  let i = 0;
  for (const ch of country.mask) {
    if (i >= d.length) break;
    out += ch === '#' ? d[i++] : ch;
  }
  return out;
}

/** "+523312345678" (o "+52 33 1234 5678") → país + dígitos nacionales. */
export function parsePhone(value: string | null | undefined): {
  country: Country;
  national: string;
} {
  const raw = value ?? '';
  const d = digitsOf(raw);
  if (!raw.trim().startsWith('+'))
    return { country: DEFAULT_COUNTRY, national: d };
  // Lada más larga primero para que "502" gane sobre "50…"; "+1" cae en US.
  const country =
    [...COUNTRIES]
      .sort((a, b) => b.dial.length - a.dial.length)
      .find(c => d.startsWith(c.dial)) ?? DEFAULT_COUNTRY;
  return { country, national: d.slice(country.dial.length) };
}

export const toE164 = (national: string, country: Country) =>
  `+${country.dial}${digitsOf(national)}`;

export function isValidPhone(value: string): boolean {
  const { country, national } = parsePhone(value);
  return value.startsWith('+') && national.length === lengthOf(country);
}

/** Para mostrar: "+52 33 1234 5678". Si no se reconoce, se devuelve tal cual. */
export function formatPhone(value: string | null | undefined): string {
  if (!value) return '';
  const { country, national } = parsePhone(value);
  if (!national) return value;
  return `+${country.dial} ${formatNational(national, country)}`;
}
