import data from './categoryIcons.data.json';

/**
 * Íconos de categoría (handoff de diseño «Íconos de categoría Tumtto»).
 * El registro vive en categoryIcons.data.json; para agregar una categoría se
 * añade ahí una entrada y nada más. Este módulo es puro (sin React).
 */
export type CategoryIconDef = {
  id: string;
  name: string;
  aliases: string[];
  durationSec: number;
  /** Trazos SVG internos (viewBox 24×24, stroke currentColor). */
  svgInner: string;
  /** CSS de keyframes del ícono, con selectores sin acotar. */
  css: string;
};

export type IconTokens = {
  light: Record<
    'inactive' | 'active' | 'disabled',
    { bg?: string; fg: string }
  >;
  dark: Record<'inactive' | 'active' | 'disabled', { bg?: string; fg: string }>;
  hoverGlow: { light: string; dark: string };
};

export const CATEGORY_ICONS = data.categories as CategoryIconDef[];
export const ICON_TOKENS = data.tokens as IconTokens;
export const GENERAL_ID = 'general';

/** Minúsculas, sin acentos, separadores → «-». */
export function iconSlug(s: string | null | undefined): string {
  return String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const INDEX = new Map<string, CategoryIconDef>();
for (const c of CATEGORY_ICONS) {
  for (const k of [c.id, c.name, ...c.aliases]) INDEX.set(iconSlug(k), c);
}

/** Ícono que corresponde al valor, o null si no se reconoce. */
export function matchCategoryIcon(
  v: string | null | undefined,
): CategoryIconDef | null {
  return INDEX.get(iconSlug(v)) ?? null;
}

/** Resuelve id / nombre / alias / slug de BD; lo desconocido cae en «general». */
export function resolveCategoryIcon(
  v: string | null | undefined,
): CategoryIconDef {
  return matchCategoryIcon(v) ?? INDEX.get(GENERAL_ID)!;
}

/** Como resolveCategoryIcon pero prueba varios candidatos (slug, ícono guardado, nombre). */
export function resolveCategoryIconFirst(
  ...vs: (string | null | undefined)[]
): CategoryIconDef {
  for (const v of vs) {
    const m = matchCategoryIcon(v);
    if (m) return m;
  }
  return INDEX.get(GENERAL_ID)!;
}

/** Antepone `scope` a cada regla (no a @keyframes) para que el CSS de un ícono no afecte a otro. */
export function scopeIconCss(scope: string, css: string): string {
  let out = '';
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open < 0) break;
    const head = css.slice(i, open).trim();
    let depth = 1;
    let j = open + 1;
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') depth--;
      j++;
    }
    const block = css.slice(open, j);
    out += head.startsWith('@')
      ? `${head}${block}`
      : `${head
          .split(',')
          .map(s => `${scope} ${s.trim()}`)
          .join(',')}${block}`;
    i = j;
  }
  return out;
}

/** Hoja de estilos única de todos los íconos (base + tokens + keyframes por ícono). */
export function categoryIconStylesheet(): string {
  const t = ICON_TOKENS;
  const vars = (m: 'light' | 'dark') =>
    `--tmci-bg:${t[m].inactive.bg};--tmci-fg:${t[m].inactive.fg};` +
    `--tmci-on-bg:${t[m].active.bg};--tmci-on-fg:${t[m].active.fg};` +
    `--tmci-off-fg:${t[m].disabled.fg};--tmci-glow:${t.hoverGlow[m]}`;
  const base = `
.tmci{${vars('light')};display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;line-height:0;vertical-align:middle}
[data-theme='dark'] .tmci:not([data-tm-theme='light']),.tmci[data-tm-theme='dark']{${vars('dark')}}
.tmci svg{display:block;overflow:visible}
.tmci-wrap{display:inline-flex;align-items:center;justify-content:center;transition:transform .4s cubic-bezier(.3,1.6,.5,1)}
.tmci[data-hover] .tmci-wrap{transform:translateY(-2px) scale(1.1)}
.tmci[data-in] .tmci-wrap{animation:tmci-in .6s cubic-bezier(.2,1.5,.4,1) backwards}
@keyframes tmci-in{0%{opacity:0;transform:scale(.4) rotate(-14deg)}100%{opacity:1;transform:none}}
.tmci-tile{position:relative;display:flex;align-items:center;justify-content:center;background:var(--tmci-bg);color:var(--tmci-fg);transition:background .25s,color .25s,box-shadow .3s}
.tmci[data-state='active'] .tmci-tile{background:var(--tmci-on-bg);color:var(--tmci-on-fg)}
.tmci[data-state='disabled'] .tmci-tile{background:transparent;color:var(--tmci-off-fg)}
.tmci-tile::after{content:'';position:absolute;inset:0;border-radius:inherit;border:2px solid var(--tmci-glow);opacity:0;pointer-events:none}
.tmci[data-hover] .tmci-tile{box-shadow:0 10px 22px -10px var(--tmci-glow)}
.tmci[data-hover] .tmci-tile::after{animation:tmci-ring 1.1s ease-out infinite}
@keyframes tmci-ring{0%{opacity:.7;transform:scale(1)}100%{opacity:0;transform:scale(1.45)}}
.tmci-glyph{position:relative;display:inline-flex}
.tmci[data-state='disabled'] .tmci-glyph{color:var(--tmci-off-fg)}
.tmci-glow{position:absolute;inset:-30%;border-radius:50%;background:radial-gradient(circle,var(--tmci-glow),transparent 65%);opacity:0;transition:opacity .3s;pointer-events:none}
.tmci[data-hover] .tmci-glow{opacity:.35}
.tmci .a{animation-duration:var(--tmci-dur);animation-iteration-count:infinite;animation-timing-function:ease-in-out;animation-fill-mode:both;animation-play-state:paused}
.tmci[data-play] .a{animation-play-state:running}
.tmci[data-hover] .a{animation-duration:calc(var(--tmci-dur)*.8)}
@media (prefers-reduced-motion:reduce){.tmci .a,.tmci-wrap,.tmci-tile::after{animation:none!important;transition:none!important}.tmci[data-hover] .tmci-wrap{transform:none}}
`;
  return (
    base +
    CATEGORY_ICONS.map(c =>
      scopeIconCss(`.tmci[data-cat='${c.id}']`, c.css),
    ).join('')
  );
}

/** Lado del tile y radio según el tamaño del glifo (README: ×1.9; 8/10/12 px). */
export function tileMetrics(size: number): { side: number; radius: number } {
  return {
    side: Math.round(size * 1.9),
    radius: size <= 16 ? 8 : size <= 24 ? 10 : 12,
  };
}

/** Pausa aleatoria entre ciclos automáticos: 2.6–6 s. */
export function nextIdleDelayMs(rand: number = Math.random()): number {
  return 2600 + rand * 3400;
}
