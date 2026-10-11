import { describe, expect, it } from 'vitest';
import {
  groupByCategory,
  hasAllTools,
  normalizeToolName,
  resolveTechTools,
  summarizeCustomTools,
  toolEventText,
  toolsForCategory,
  type CatalogToolLike,
  type TechToolLike,
} from './tools';

const catalog: CatalogToolLike[] = [
  { id: 'c1', name: 'Multímetro', category_id: 'cat-electrical', is_active: true, sort_order: 1 },
  { id: 'c2', name: 'Taladro', category_id: null, is_active: true, sort_order: 2 },
];
const rows: TechToolLike[] = [
  { id: 'r1', technician_id: 't1', catalog_id: 'c1', custom_name: null, custom_category_id: null },
  { id: 'r2', technician_id: 't1', catalog_id: null, custom_name: ' Pistola de calor ', custom_category_id: null, created_at: '2026-09-02' },
  { id: 'r3', technician_id: 't2', catalog_id: null, custom_name: 'pistola  de CALOR', custom_category_id: 'cat-ac', created_at: '2026-09-01' },
  { id: 'r4', technician_id: 't1', catalog_id: 'c2', custom_name: null, custom_category_id: null },
];
const cats = [{ id: 'cat-electrical', name: 'Electricidad' }, { id: 'cat-ac', name: 'Aire' }];

describe('tools', () => {
  it('normaliza nombres', () => {
    expect(normalizeToolName('  Pistola   de CALOR ')).toBe('pistola de calor');
  });
  it('resuelve y agrupa por categoría, generales y otras', () => {
    const t = resolveTechTools(rows, catalog, 't1');
    expect(t).toHaveLength(3);
    const g = groupByCategory(t, cats);
    expect(g.map(x => x.label)).toEqual(['Electricidad', 'Generales', 'Otras (texto libre)']);
    expect(toolsForCategory(t, 'cat-electrical').map(x => x.name)).toEqual(['Multímetro']);
    expect(toolsForCategory(t, null)).toEqual([]);
  });
  it('filtro: debe tener todas', () => {
    expect(hasAllTools(['c1', 'c2'], ['c1', 'c2'])).toBe(true);
    expect(hasAllTools(['c1'], ['c1', 'c2'])).toBe(false);
    expect(hasAllTools([], [])).toBe(true);
  });
  it('resume el texto libre por nombre normalizado', () => {
    const s = summarizeCustomTools(rows);
    expect(s).toHaveLength(1);
    expect(s[0]).toMatchObject({ technicians_count: 2, category_ids: ['cat-ac'], first_seen: '2026-09-01' });
  });
  it('texto de bitácora', () => {
    expect(toolEventText('tool_added', { after: { catalog_id: 'c1' } }, id => (id === 'c1' ? 'Multímetro' : null))).toBe(
      'Herramienta agregada: Multímetro',
    );
    expect(toolEventText('tool_removed', { before: { custom_name: 'Lima' }, after: null })).toBe('Herramienta eliminada: Lima');
    expect(toolEventText('tool_updated', null)).toBe('Herramienta actualizada');
  });
});
