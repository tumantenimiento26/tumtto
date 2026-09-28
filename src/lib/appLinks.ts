// Enlaces que deben abrir la app móvil (invitaciones, correos de Supabase).
// Si la app no está instalada o el App Link no se verificó, estas páginas web
// son el respaldo: intentan abrir la app y, si no, mandan a un destino útil.

export const APP_SCHEME = 'tumtto';
export const ANDROID_PACKAGE =
  process.env.NEXT_PUBLIC_ANDROID_PACKAGE || 'com.tumttomobile';
/** Vacíos hasta publicar en las tiendas. */
export const PLAY_STORE_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL || '';
export const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL || '';

/**
 * "ruta?query#hash" → "ruta?query&hash". En un `intent://` el `#` separa los
 * extras, así que el fragmento (tokens de Supabase) viaja como query; la app
 * lee ambos.
 */
export function appPath(pathname: string, search = '', hash = ''): string {
  const path = pathname.replace(/^\/+/, '');
  const params = [search.replace(/^\?/, ''), hash.replace(/^#/, '')]
    .filter(Boolean)
    .join('&');
  return params ? `${path}?${params}` : path;
}

export const schemeUrl = (path: string) => `${APP_SCHEME}://${path}`;

/**
 * Android: abre la app si está instalada; si no, Chrome va a `fallbackUrl`
 * (tienda o registro web) en vez de mostrar un error.
 */
export function intentUrl(path: string, fallbackUrl: string): string {
  return (
    `intent://${path}#Intent;scheme=${APP_SCHEME};package=${ANDROID_PACKAGE};` +
    `S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end`
  );
}

/**
 * Error que Supabase manda en el enlace de correo (`?error=` o `#error=`),
 * p. ej. otp_expired. null si el enlace viene bien.
 */
export function authLinkError(
  search: string,
  hash: string,
): { code: string; expired: boolean } | null {
  const params = new URLSearchParams(
    `${search.replace(/^\?/, '')}&${hash.replace(/^#/, '')}`,
  );
  const code = params.get('error_code') ?? params.get('error');
  if (!code) return null;
  return { code, expired: code === 'otp_expired' || /expired/i.test(code) };
}
