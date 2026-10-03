// Copia de tumtto-mobile/src/components/avatar/avatarArt.ts (fuente de verdad del arte).
// Mantener idéntico: mismos paths, colores y hash para que ambas apps rendericen igual.
/**
 * Arte de los 6 íconos de perfil (viewBox 48×48). Datos puros (sin React) para
 * poder renderizarlos en RN y exportarlos a SVG con un script. Misma gramática
 * en todos: círculo de fondo tintado, figura plana con contorno navy de 2 u y
 * la misma carita (dos puntos + sonrisa).
 */
export const AVATAR_KEYS = [
  'llave',
  'casco',
  'foco',
  'gota',
  'casa',
  'martillo',
] as const;
export type AvatarKey = (typeof AVATAR_KEYS)[number];

export const AVATAR_LABEL: Record<AvatarKey, string> = {
  llave: 'Llave',
  casco: 'Casco',
  foco: 'Foco',
  gota: 'Gota',
  casa: 'Casa',
  martillo: 'Martillo',
};

export const OUTLINE = '#0E2C56';
export const STROKE = 2;
const WHITE = '#FFFFFF';

export type Shape =
  | { k: 'path'; d: string; fill: string; stroke?: boolean; sw?: number }
  | { k: 'circle'; cx: number; cy: number; r: number; fill: string; stroke?: boolean }
  | { k: 'line'; d: string; sw?: number; color?: string };

export type AvatarArt = { base: string; tint: string; shapes: Shape[] };

/** Mezcla `hex` con blanco (t = peso del color). */
function mix(hex: string, t: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (s: number) =>
    Math.round(255 - (255 - ((n >> s) & 255)) * t)
      .toString(16)
      .padStart(2, '0');
  return `#${ch(16)}${ch(8)}${ch(0)}`.toUpperCase();
}

/** Carita común: ojos + sonrisa. `cx`,`ey` = centro y línea de ojos. */
function face(cx: number, ey: number, color = OUTLINE, spread = 4.2): Shape[] {
  return [
    { k: 'circle', cx: cx - spread, cy: ey, r: 1.7, fill: color },
    { k: 'circle', cx: cx + spread, cy: ey, r: 1.7, fill: color },
    {
      k: 'line',
      d: `M${cx - 2.6} ${ey + 3.4} Q${cx} ${ey + 6} ${cx + 2.6} ${ey + 3.4}`,
      sw: 1.8,
      color,
    },
  ];
}

const BASE: Record<AvatarKey, string> = {
  llave: '#0A6BCF',
  casco: '#F5B94A',
  foco: '#F1C40F',
  gota: '#18C1FF',
  casa: '#18A66A',
  martillo: '#E46B4F',
};

const P = (d: string, fill: string): Shape => ({ k: 'path', d, fill });

const SHAPES: Record<AvatarKey, Shape[]> = {
  // Llave de dos bocas: mandíbula abierta arriba (con carita) y anillo abajo.
  llave: [
    P(
      'M13.5 12 Q13.5 7.5 18 7.5 H20 L20.5 14.5 H27.5 L28 7.5 H30 Q34.5 7.5 34.5 12 V20 Q34.5 26 28 27.5 V31.5 A6.5 6.5 0 1 1 20 31.5 V27.5 Q13.5 26 13.5 20 Z',
      BASE.llave,
    ),
    { k: 'circle', cx: 24, cy: 36.6, r: 2.4, fill: WHITE, stroke: true },
    ...face(24, 19.5, WHITE),
  ],
  // Casco de obra sobre una carita: cúpula con cresta y ala.
  casco: [
    { k: 'circle', cx: 24, cy: 32, r: 10, fill: mix(BASE.casco, 0.4) },
    P('M10 26 Q10 8.5 24 8.5 Q38 8.5 38 26 Z', BASE.casco),
    P('M21 9 Q24 8.2 27 9 V26 H21 Z', mix(BASE.casco, 0.45)),
    P('M6.5 26 H41.5 Q42 30.5 38 30.5 H10 Q6 30.5 6.5 26 Z', BASE.casco),
    ...face(24, 34.5),
  ],
  // Foco: bulbo con carita, casquillo y brillo.
  foco: [
    P(
      'M24 6 C32.5 6 38 12.5 38 20 C38 25 35 28 33 30.5 V32 H15 V30.5 C13 28 10 25 10 20 C10 12.5 15.5 6 24 6 Z',
      BASE.foco,
    ),
    P('M17 32 H31 V38 Q31 42 27 42 H21 Q17 42 17 38 Z', '#E6ECF5'),
    { k: 'line', d: 'M17.5 37 H30.5', sw: 1.6 },
    { k: 'line', d: 'M16 15 Q17.5 11.5 21 10', sw: 1.8, color: WHITE },
    ...face(24, 19.5),
  ],
  // Gota de agua.
  gota: [
    P(
      'M24 5 C24 5 11 19.5 11 28.5 C11 35.5 16.8 41.5 24 41.5 C31.2 41.5 37 35.5 37 28.5 C37 19.5 24 5 24 5 Z',
      BASE.gota,
    ),
    { k: 'line', d: 'M16.5 28 Q16.5 23.5 19.5 19.5', sw: 1.8, color: WHITE },
    ...face(24, 28.5),
  ],
  // Casita: tejado de marca, chimenea y pared clara con carita.
  casa: [
    P('M30 15 V9.5 H36 V20 Z', BASE.casa),
    P('M11 23 H37 V38.5 Q37 41 34.5 41 H13.5 Q11 41 11 38.5 Z', mix(BASE.casa, 0.18)),
    P('M5 25 L22.5 9 Q24 7.8 25.5 9 L43 25 Z', BASE.casa),
    ...face(24, 31),
  ],
  // Martillo: cabeza con carita, bandas de acero y mango.
  martillo: [
    P('M20.5 20 H27.5 V39 Q27.5 42 24 42 Q20.5 42 20.5 39 Z', mix(BASE.martillo, 0.35)),
    P('M7 13 Q7 7.5 12.5 7.5 H35.5 Q41 7.5 41 13 V15.5 Q41 21 35.5 21 H12.5 Q7 21 7 15.5 Z', BASE.martillo),
    { k: 'line', d: 'M13 7.7 V20.8 M35 7.7 V20.8', sw: 1.6 },
    ...face(24, 12.2),
  ],
};

export const AVATAR_ART: Record<AvatarKey, AvatarArt> = Object.fromEntries(
  AVATAR_KEYS.map(k => [k, { base: BASE[k], tint: mix(BASE[k], 0.22), shapes: SHAPES[k] }]),
) as Record<AvatarKey, AvatarArt>;

export const isAvatarKey = (v: unknown): v is AvatarKey =>
  typeof v === 'string' && (AVATAR_KEYS as readonly string[]).includes(v);

/**
 * Ícono por defecto de un usuario: suma de char codes del uuid sin guiones
 * módulo 6, en el orden de AVATAR_KEYS. Mismo hash que `app.default_avatar_icon`.
 */
export function defaultAvatarFor(userId: string | null | undefined): AvatarKey {
  const s = (userId ?? '').replace(/-/g, '');
  let sum = 0;
  for (let i = 0; i < s.length; i++) sum += s.charCodeAt(i);
  return AVATAR_KEYS[sum % AVATAR_KEYS.length];
}

/** Clave válida o, si no hay/no es válida, el default del usuario. */
export const resolveAvatar = (
  icon: string | null | undefined,
  userId?: string | null,
): AvatarKey => (isAvatarKey(icon) ? icon : defaultAvatarFor(userId));
