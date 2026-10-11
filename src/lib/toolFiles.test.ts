import { describe, expect, test } from 'vitest';
import { toolFilePath, validateToolFile, warrantyState, MAX_TOOL_FILES } from './toolFiles';

const now = new Date(2026, 9, 10, 15);

describe('warrantyState', () => {
  test('solo garantías con fecha', () => {
    expect(warrantyState({ kind: 'manual', expires_on: '2026-10-01' }, now)).toBeNull();
    expect(warrantyState({ kind: 'warranty', expires_on: null }, now)).toBeNull();
  });
  test('vencida, por vencer y vigente', () => {
    expect(warrantyState({ kind: 'warranty', expires_on: '2026-10-09' }, now)?.tone).toBe('danger');
    expect(warrantyState({ kind: 'warranty', expires_on: '2026-10-10' }, now)?.label).toBe('Vence hoy');
    expect(warrantyState({ kind: 'warranty', expires_on: '2026-11-08' }, now)?.tone).toBe('warning');
    expect(warrantyState({ kind: 'warranty', expires_on: '2026-11-09' }, now)?.tone).toBeNull();
  });
});

test('validateToolFile', () => {
  expect(validateToolFile({ type: 'application/pdf', size: 1000 }, 0)).toBeNull();
  expect(validateToolFile({ type: 'text/plain', size: 10 }, 0)).toMatch(/imagen/);
  expect(validateToolFile({ type: 'image/png', size: 16 * 1024 * 1024 }, 0)).toMatch(/15 MB/);
  expect(validateToolFile({ type: 'image/png', size: 10 }, MAX_TOOL_FILES)).toMatch(/Máximo/);
});

test('toolFilePath', () => {
  expect(toolFilePath({ companyToolId: 'c1' }, 'u', 'application/pdf')).toBe('company/c1/u.pdf');
  expect(toolFilePath({ technicianId: 't', technicianToolId: 'x' }, 'u', 'image/jpeg')).toBe('tech/t/x/u.jpg');
});
