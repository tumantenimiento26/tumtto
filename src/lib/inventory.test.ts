import { describe, expect, test } from 'vitest';
import {
  EMPTY_INVENTORY_FILTERS,
  buildToolRows,
  byTechnician,
  dayToIso,
  filterTools,
  inventoryCsv,
  inventoryEventText,
  isInventoryEvent,
  outstanding,
  parsePesos,
  pesosInput,
  toolActions,
  type CompanyTool,
  type ToolAssignment,
} from './inventory';
import { demoInventory } from './demo/inventory';

const NOW = Date.parse('2026-10-03T18:00:00Z');
const tool = (id: string, over: Partial<CompanyTool> = {}): CompanyTool => ({
  id,
  name: `Tool ${id}`,
  category_id: null,
  catalog_id: null,
  brand: 'Bosch',
  model: null,
  serial_or_code: `S-${id}`,
  photo_path: null,
  acquired_on: null,
  acquisition_cost_cents: 10000,
  status: 'available',
  retired_reason: null,
  retired_note: null,
  retired_at: null,
  retired_by: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...over,
});
const asg = (id: string, toolId: string, tech: string, daysAgo: number, returned = false): ToolAssignment => ({
  id,
  tool_id: toolId,
  technician_id: tech,
  assigned_at: new Date(NOW - daysAgo * 864e5).toISOString(),
  assigned_condition: 'good',
  assigned_by: null,
  assign_note: null,
  returned_at: returned ? new Date(NOW).toISOString() : null,
  returned_condition: returned ? 'good' : null,
  returned_by: null,
  return_note: null,
  created_at: '',
  updated_at: '',
});
const name = (id: string) => ({ a: 'Ana', b: 'Beto' })[id] ?? null;

describe('costo', () => {
  test('parsePesos', () => {
    expect(parsePesos('1,250.50')).toBe(125050);
    expect(parsePesos('$99')).toBe(9900);
    expect(parsePesos('')).toBeNull();
    expect(parsePesos('-5')).toBeNaN();
    expect(parsePesos('1.234')).toBeNaN();
  });
  test('pesosInput', () => {
    expect(pesosInput(125050)).toBe('1250.50');
    expect(pesosInput(9900)).toBe('99');
    expect(pesosInput(null)).toBe('');
  });
});

test('acciones por estado', () => {
  expect(toolActions('available')).toMatchObject({ assign: true, return: false, repairStart: true, retire: true });
  expect(toolActions('assigned')).toMatchObject({ assign: false, return: true, repairStart: false });
  expect(toolActions('in_repair')).toMatchObject({ repairFinish: true, assign: false });
  expect(toolActions('retired')).toMatchObject({ edit: false, retire: false, assign: false });
});

test('dayToIso: hoy usa la hora actual, otro día mediodía local', () => {
  const now = new Date(2026, 9, 3, 15, 30);
  expect(dayToIso(new Date(2026, 9, 3), now)).toBe(now.toISOString());
  expect(new Date(dayToIso(new Date(2026, 8, 1), now)).getHours()).toBe(12);
});

describe('listado y filtros', () => {
  const tools = [
    tool('1', { status: 'assigned', category_id: 'c1' }),
    tool('2', { name: 'Taladro', brand: 'DeWalt' }),
    tool('3', { status: 'retired', category_id: 'c1' }),
  ];
  const rows = buildToolRows(tools, [asg('x', '1', 'a', 10), asg('y', '2', 'b', 20, true)], name);
  test('técnico y desde solo con asignación abierta', () => {
    expect(rows[0]).toMatchObject({ techId: 'a', techName: 'Ana' });
    expect(rows[1].techId).toBeNull();
  });
  test('búsqueda sin acentos por nombre/código/marca', () => {
    expect(filterTools(rows, { ...EMPTY_INVENTORY_FILTERS, query: 'dewalt' })).toHaveLength(1);
    expect(filterTools(rows, { ...EMPTY_INVENTORY_FILTERS, query: 's-3' })).toHaveLength(1);
  });
  test('categoría, estado y técnico', () => {
    expect(filterTools(rows, { ...EMPTY_INVENTORY_FILTERS, categoryId: 'c1' })).toHaveLength(2);
    expect(filterTools(rows, { ...EMPTY_INVENTORY_FILTERS, categoryId: 'general' })).toHaveLength(1);
    expect(filterTools(rows, { ...EMPTY_INVENTORY_FILTERS, status: 'retired' })).toHaveLength(1);
    expect(filterTools(rows, { ...EMPTY_INVENTORY_FILTERS, techId: 'a' })).toHaveLength(1);
  });
});

describe('reportes', () => {
  const tools = [tool('1'), tool('2'), tool('3')];
  const list = [asg('a1', '1', 'a', 100), asg('a2', '2', 'a', 5), asg('b1', '3', 'b', 40), asg('old', '1', 'b', 300, true)];
  test('por técnico agrega abiertas y valor', () => {
    const r = byTechnician(tools, list, name);
    expect(r.map(x => [x.technician_name, x.tools_count, x.total_value_cents])).toEqual([
      ['Ana', 2, 20000],
      ['Beto', 1, 10000],
    ]);
  });
  test('pendientes: filtro de antigüedad, más antiguas primero', () => {
    expect(outstanding(tools, list, name, 0, NOW).map(r => r.assignment_id)).toEqual(['a1', 'b1', 'a2']);
    expect(outstanding(tools, list, name, 30, NOW).map(r => r.assignment_id)).toEqual(['a1', 'b1']);
    expect(outstanding(tools, list, name, 30, NOW)[0].days_held).toBe(100);
  });
  test('CSV con BOM y escape', () => {
    const csv = inventoryCsv([{ A: 'x,y', B: 'c"d' }]);
    expect(csv.startsWith('﻿A,B')).toBe(true);
    expect(csv).toContain('"x,y","c""d"');
  });
});

test('bitácora', () => {
  expect(isInventoryEvent('company_tool', 'tool_created')).toBe(true);
  expect(isInventoryEvent('technician', 'company_tool_assigned')).toBe(true);
  expect(isInventoryEvent('technician', 'tool_added')).toBe(false);
  expect(inventoryEventText('tool_assigned', { technician_name: 'Ana', condition: 'good', note: 'Con estuche' })).toBe(
    'Herramienta asignada a Ana — condición buena — Con estuche',
  );
  expect(inventoryEventText('tool_returned', { condition: 'damaged', new_status: 'in_repair' })).toContain('a reparación');
  expect(inventoryEventText('tool_retired', { reason: 'theft' })).toBe('Herramienta dada de baja — motivo robo');
});

test('maqueta: ~25 herramientas en todos los estados, consistentes', () => {
  const { tools, assignments } = demoInventory(NOW, id => id, () => null);
  expect(tools.length).toBeGreaterThanOrEqual(25);
  for (const s of ['available', 'assigned', 'in_repair', 'retired'])
    expect(tools.some(t => t.status === s)).toBe(true);
  const open = assignments.filter(a => a.returned_at === null);
  expect(new Set(open.map(a => a.tool_id)).size).toBe(open.length);
  for (const t of tools) expect(open.some(a => a.tool_id === t.id)).toBe(t.status === 'assigned');
  expect(new Set(tools.map(t => t.serial_or_code)).size).toBe(tools.length);
  expect(tools.filter(t => t.status === 'retired').every(t => t.retired_reason)).toBe(true);
});
