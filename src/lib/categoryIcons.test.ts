import { describe, expect, it } from 'vitest';
import {
  CATEGORY_ICONS,
  categoryIconStylesheet,
  iconSlug,
  matchCategoryIcon,
  nextIdleDelayMs,
  resolveCategoryIcon,
  resolveCategoryIconFirst,
  scopeIconCss,
  tileMetrics,
} from './categoryIcons';

describe('categoryIcons · resolver', () => {
  it('tiene los 14 íconos del handoff', () => {
    expect(CATEGORY_ICONS).toHaveLength(14);
  });

  it('resuelve id, nombre y alias sin importar acentos ni mayúsculas', () => {
    expect(resolveCategoryIcon('plomeria').id).toBe('plomeria');
    expect(resolveCategoryIcon('Plomería').id).toBe('plomeria');
    expect(resolveCategoryIcon('  ELECTRICIDAD ').id).toBe('electricidad');
    expect(resolveCategoryIcon('Aire acondicionado').id).toBe('aire');
    expect(resolveCategoryIcon('Línea blanca').id).toBe('linea-blanca');
    expect(resolveCategoryIcon('Fugas').id).toBe('plomeria');
  });

  it('mapea los slugs de la BD (seed en inglés) y los ids demo cat-<slug>', () => {
    const pairs: [string, string][] = [
      ['plumbing', 'plomeria'],
      ['electrical', 'electricidad'],
      ['gas', 'gas'],
      ['ac', 'aire'],
      ['appliances', 'linea-blanca'],
      ['locks', 'cerrajeria'],
    ];
    for (const [slug, id] of pairs) {
      expect(resolveCategoryIcon(slug).id).toBe(id);
      expect(resolveCategoryIcon(`cat-${slug}`).id).toBe(id);
    }
  });

  it('ids de sprite legados siguen resolviendo', () => {
    expect(resolveCategoryIcon('i-drop').id).toBe('plomeria');
    expect(resolveCategoryIcon('i-snow').id).toBe('aire');
  });

  it('desconocido, vacío o nulo → general', () => {
    expect(resolveCategoryIcon('xyz').id).toBe('general');
    expect(resolveCategoryIcon('').id).toBe('general');
    expect(resolveCategoryIcon(null).id).toBe('general');
    expect(matchCategoryIcon('xyz')).toBeNull();
  });

  it('resolveCategoryIconFirst usa el primer candidato conocido', () => {
    expect(resolveCategoryIconFirst(undefined, 'zzz', 'Gas').id).toBe('gas');
    expect(resolveCategoryIconFirst('zzz').id).toBe('general');
  });

  it('cada alias es único entre íconos', () => {
    const seen = new Map<string, string>();
    for (const c of CATEGORY_ICONS) {
      for (const k of [c.id, c.name, ...c.aliases]) {
        const s = iconSlug(k);
        expect(seen.get(s) ?? c.id, s).toBe(c.id);
        seen.set(s, c.id);
      }
    }
  });
});

describe('categoryIcons · css y métricas', () => {
  it('acota las reglas por ícono y deja @keyframes intactos', () => {
    const out = scopeIconCss('.s', '.a,.b{x:1}@keyframes k{0%{y:1}100%{y:2}}');
    expect(out).toBe('.s .a,.s .b{x:1}@keyframes k{0%{y:1}100%{y:2}}');
  });

  it('la hoja incluye todos los íconos y tokens claro/oscuro', () => {
    const css = categoryIconStylesheet();
    for (const c of CATEGORY_ICONS)
      expect(css).toContain(`.tmci[data-cat='${c.id}']`);
    expect(css).toContain('#0A6BCF');
    expect(css).toContain('#18C1FF');
    expect(css).toContain('prefers-reduced-motion');
  });

  it('tile = tamaño × 1.9 con radio 8/10/12', () => {
    expect(tileMetrics(16)).toEqual({ side: 30, radius: 8 });
    expect(tileMetrics(20)).toEqual({ side: 38, radius: 10 });
    expect(tileMetrics(30)).toEqual({ side: 57, radius: 12 });
  });

  it('pausa automática entre 2.6 y 6 s', () => {
    expect(nextIdleDelayMs(0)).toBe(2600);
    expect(nextIdleDelayMs(1)).toBe(6000);
  });
});
