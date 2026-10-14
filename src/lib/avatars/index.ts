import { AVATAR_ART } from './art';

export type AvatarId = keyof typeof AVATAR_ART;
export type AvatarRole = 'tecnico' | 'general' | 'neutro';
export type AvatarBg = 'tint' | 'bold';

/** Orden del catálogo (README del handoff). */
export const AVATAR_IDS = Object.keys(AVATAR_ART) as AvatarId[];
export const DEFAULT_AVATAR: AvatarId = 'silueta';

export const AVATAR_ROLE_LABEL: Record<AvatarRole, string> = {
  tecnico: 'Técnico',
  general: 'General',
  neutro: 'Neutro',
};

export const isAvatarId = (v: unknown): v is AvatarId =>
  typeof v === 'string' && Object.hasOwn(AVATAR_ART, v);

/** id válido o `silueta` (id desconocido / vacío). */
export const resolveAvatarId = (v: string | null | undefined): AvatarId =>
  isAvatarId(v) ? v : DEFAULT_AVATAR;

export const avatarName = (id: AvatarId) => AVATAR_ART[id].name;

/**
 * Qué se pinta: la foto siempre gana; si no, el avatar ilustrado
 * (id desconocido -> silueta).
 */
export type AvatarSource =
  { kind: 'photo'; url: string } | { kind: 'art'; id: AvatarId };

export function resolveAvatarSource(
  avatarId: string | null | undefined,
  photoUrl?: string | null,
): AvatarSource {
  const url = photoUrl?.trim();
  if (url) return { kind: 'photo', url };
  return { kind: 'art', id: resolveAvatarId(avatarId) };
}

/** Los ojos de estos avatares no parpadean (sin ojos / ojos en arco). */
export const NO_BLINK: ReadonlySet<AvatarId> = new Set(['silueta', 'canas']);

/**
 * SVG interior listo para inyectar con ids de gradiente/patrón únicos
 * (`gx1`/`dx1` se repiten entre instancias del mismo avatar).
 */
export function avatarMarkup(id: AvatarId, bg: AvatarBg, uid: string): string {
  const safe = uid.replace(/[^a-zA-Z0-9_-]/g, '');
  return AVATAR_ART[id][bg].replace(/\b([gd]x\d+)\b/g, `$1-${safe}`);
}

export { AVATAR_ART };
