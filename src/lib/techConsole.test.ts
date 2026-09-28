import { describe, expect, it } from 'vitest';
import {
  activeFilterCount,
  diditChecks,
  filterTechs,
  kycGroup,
  rateError,
  slaLabel,
  slaRemainingHours,
  type TechListFilters,
} from './techConsole';

describe('kycGroup', () => {
  it('agrupa los 7 estados del backend', () => {
    expect(kycGroup('approved')).toBe('approved');
    expect(kycGroup('resubmitted')).toBe('in_review');
    expect(kycGroup('not_started')).toBe('in_review');
    expect(kycGroup('abandoned')).toBe('declined');
    expect(kycGroup('approved', 'suspended')).toBe('suspended');
  });
});

describe('SLA', () => {
  const now = new Date('2026-09-28T12:00:00Z');
  it('horas restantes y vencido', () => {
    expect(slaRemainingHours('2026-09-28T09:00:00Z', now)).toBe(21);
    expect(slaRemainingHours('2026-09-27T06:00:00Z', now)).toBe(-6);
    expect(slaRemainingHours(null, now)).toBeNull();
  });
  it('etiqueta y tono', () => {
    expect(slaLabel(21)).toEqual({ text: 'SLA 21 h restantes', tone: 'success' });
    expect(slaLabel(3.5).tone).toBe('warning');
    expect(slaLabel(-6)).toEqual({ text: 'SLA vencido hace 6 h', tone: 'danger' });
  });
});

describe('rateError', () => {
  it('rango $150–$5,000', () => {
    expect(rateError('')).toBe('Requerido');
    expect(rateError('abc')).toBe('Número inválido');
    expect(rateError('100')).toMatch(/Entre/);
    expect(rateError('5001')).toMatch(/Entre/);
    expect(rateError('450')).toBeNull();
  });
});

describe('filterTechs', () => {
  const rows = [
    { name: 'Ramón Hernández', phone: '33 1452 8870', cats: ['Plomería', 'Gas'], zone: 'Zapopan', rating: 4.9, available: true, kyc: 'approved' as const },
    { name: 'Luis Ramírez', phone: '33 1111 2222', cats: ['Gas'], zone: 'Tlaquepaque', rating: 0, available: false, kyc: 'in_review' as const },
  ];
  const base: TechListFilters = { tab: 'all', q: '', category: null, zones: [], minRating: 0, availability: 'all' };
  it('pestaña, búsqueda sin acentos, zona, rating y disponibilidad', () => {
    expect(filterTechs(rows, { ...base, tab: 'in_review' })).toHaveLength(1);
    expect(filterTechs(rows, { ...base, q: 'ramirez' })[0].name).toBe('Luis Ramírez');
    expect(filterTechs(rows, { ...base, zones: ['Zapopan'] })).toHaveLength(1);
    expect(filterTechs(rows, { ...base, minRating: 4.5 })).toHaveLength(1);
    expect(filterTechs(rows, { ...base, availability: 'unavailable' })[0].kyc).toBe('in_review');
    expect(filterTechs(rows, { ...base, category: 'Plomería' })).toHaveLength(1);
  });
  it('cuenta filtros activos del sheet', () => {
    expect(activeFilterCount(base)).toBe(0);
    expect(activeFilterCount({ ...base, zones: ['Zapopan'], minRating: 4 })).toBe(2);
  });
});


describe('diditChecks', () => {
  it('lee estados de raw_decision sin romperse con formas raras', () => {
    expect(
      diditChecks({ id_verification: { status: 'Approved' }, liveness: { status: 'Declined' }, face_match: 'pending' }),
    ).toEqual([
      { label: 'Identificación (INE)', ok: true },
      { label: 'Prueba de vida', ok: false },
      { label: 'Coincidencia facial', ok: null },
    ]);
    expect(diditChecks(null)).toEqual([]);
    expect(diditChecks('x')).toEqual([]);
  });
});
