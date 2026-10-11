import { describe, expect, it } from 'vitest';
import {
  EMPTY_CLIENT_FILTERS,
  EMPTY_SERVICE_FILTERS,
  activeSheetFilters,
  clientTabCounts,
  filterClients,
  filterServices,
  tabCounts,
  toCsv,
  type ClientRow,
  type ServiceRow,
} from './serviciosFilter';
import { orderCode } from './orderCode';
import { toE164Mx } from '@/app/(console)/clientes/_components/phoneMx';

const svc = (p: Partial<ServiceRow> & { id: string }): ServiceRow => ({
  status: 'requested',
  is_disputed: false,
  is_emergency: false,
  needs_manual: false,
  pin: null,
  categoryId: 'cat-plumbing',
  categoryName: 'Plomería',
  clientName: 'María Castillo',
  techName: null,
  zone: 'Zapopan',
  totalCents: null,
  method: null,
  createdAt: '2026-09-20T10:00:00Z',
  updatedAt: '2026-09-20T10:00:00Z',
  ...p,
});

const rows = [
  svc({ id: 'a1b2c3d4-0000', status: 'enroute', techName: 'Ramón Hernández', totalCents: 150000, method: 'card', is_emergency: true }),
  svc({ id: 'b0000000-0001', zone: 'Guadalajara', categoryId: 'cat-electrical', categoryName: 'Electricidad', clientName: 'Jorge Salas' }),
  svc({ id: 'c0000000-0002', status: 'paid', totalCents: 80000, method: 'cash' }),
  svc({ id: 'd0000000-0003', status: 'cancelled', is_disputed: true, totalCents: 300000 }),
];

describe('servicios', () => {
  it('pestañas y conteos', () => {
    const c = tabCounts(rows, EMPTY_SERVICE_FILTERS);
    expect(c).toEqual({ todos: 4, esperando: 1, curso: 1, completados: 1, cancelados: 1, disputa: 1, emergencias: 1, sin_asignar: 0 });
  });

  it('búsqueda sin acentos por cliente, técnico y código SVC', () => {
    const f = { ...EMPTY_SERVICE_FILTERS };
    expect(filterServices(rows, { ...f, query: 'ramon' }).map(r => r.id)).toEqual(['a1b2c3d4-0000']);
    expect(filterServices(rows, { ...f, query: 'electricidad' })).toHaveLength(1);
    expect(filterServices(rows, { ...f, query: orderCode('c0000000-0002') }).map(r => r.id)).toContain('c0000000-0002');
  });

  it('filtros del sheet: zona, método, monto, emergencias, disputa', () => {
    const f = { ...EMPTY_SERVICE_FILTERS };
    expect(filterServices(rows, { ...f, zones: ['Guadalajara'] })).toHaveLength(1);
    expect(filterServices(rows, { ...f, method: 'cash' }).map(r => r.id)).toEqual(['c0000000-0002']);
    expect(filterServices(rows, { ...f, minPesos: 1000, maxPesos: 2000 }).map(r => r.id)).toEqual(['a1b2c3d4-0000']);
    expect(filterServices(rows, { ...f, emergencyOnly: true })).toHaveLength(1);
    expect(filterServices(rows, { ...f, disputeOnly: true })).toHaveLength(1);
    expect(activeSheetFilters({ ...f, zones: ['A', 'B'], emergencyOnly: true, minPesos: 1 })).toBe(4);
  });

  it('rango de fechas', () => {
    const range = { from: new Date('2026-09-21T00:00:00'), to: new Date('2026-09-30T00:00:00') };
    expect(filterServices(rows, { ...EMPTY_SERVICE_FILTERS, range })).toHaveLength(0);
  });
});

const cli = (p: Partial<ClientRow> & { id: string }): ClientRow => ({
  name: 'Cliente',
  phone: '+52 33 1234 5678',
  zone: 'Zapopan',
  services: 1,
  gmvCents: 100000,
  lastAt: '2026-09-25T00:00:00Z',
  suspended: false,
  disputes: 0,
  ...p,
});

describe('clientes', () => {
  const now = new Date('2026-09-28T00:00:00Z').getTime();
  const list = [
    cli({ id: '1', name: 'Ána Ruiz', services: 3, gmvCents: 1_500_000 }),
    cli({ id: '2', name: 'Beto', lastAt: '2026-01-01T00:00:00Z', zone: 'Tlaquepaque', phone: '+52 33 9999 0000' }),
    cli({ id: '3', name: 'Carla', suspended: true, gmvCents: 50_000 }),
  ];

  it('pestañas', () => {
    expect(clientTabCounts(list, now)).toEqual({ todos: 3, activos: 1, recurrentes: 1, suspendidos: 1 });
  });

  it('búsqueda por nombre sin acentos y por teléfono; gasto y orden', () => {
    const f = EMPTY_CLIENT_FILTERS;
    expect(filterClients(list, { ...f, query: 'ana' }, now).map(c => c.id)).toEqual(['1']);
    expect(filterClients(list, { ...f, query: '9999' }, now).map(c => c.id)).toEqual(['2']);
    expect(filterClients(list, { ...f, spend: 'alto' }, now).map(c => c.id)).toEqual(['1']);
    expect(filterClients(list, { ...f, sort: 'gasto' }, now)[0].id).toBe('1');
    expect(filterClients(list, { ...f, zones: ['Tlaquepaque'] }, now).map(c => c.id)).toEqual(['2']);
  });
});

describe('csv', () => {
  it('escapa comillas y comas, con BOM', () => {
    const out = toCsv([{ A: 'x, y', B: 'di "hola"', C: 3 }]);
    expect(out.startsWith('﻿')).toBe(true);
    expect(out).toContain('A,B,C');
    expect(out).toContain('"x, y","di ""hola""",3');
  });
});

describe('celular MX', () => {
  it('normaliza a E.164 y rechaza inválidos', () => {
    expect(toE164Mx('33 1234 5678')).toBe('+523312345678');
    expect(toE164Mx('+52 33 1234 5678')).toBe('+523312345678');
    expect(toE164Mx('1234')).toBeNull();
  });
});

describe('servicios · Sin asignar', () => {
  const NOW = new Date('2026-10-03T12:00:00Z').getTime();
  const ago = (min: number) => new Date(NOW - min * 60_000).toISOString();
  const inbox = [
    svc({ id: 'u1', needs_manual: true, is_admin_request: true, createdAt: ago(10), desiredAt: '2026-10-05T16:00:00Z' }),
    svc({ id: 'u2', needs_manual: true, is_admin_request: true, createdAt: ago(40), categoryId: 'cat-gas', zone: 'Tonalá' }),
    svc({ id: 'u3', needs_manual: true, is_emergency: true, createdAt: ago(100) }),
    svc({ id: 'u4', needs_manual: true, is_admin_request: true, createdAt: ago(30 * 60) }),
    svc({ id: 'x1', status: 'enroute' }),
  ];
  const f = { ...EMPTY_SERVICE_FILTERS, tab: 'sin_asignar' as const };

  it('la pestaña junta solicitudes sin técnico y emergencias vencidas', () => {
    expect(filterServices(inbox, f, { now: NOW }).map(r => r.id)).toEqual(['u1', 'u2', 'u3', 'u4']);
    expect(tabCounts(inbox, f).sin_asignar).toBe(4);
  });

  it('filtra por antigüedad (> 15 min, > 1 h, > 24 h)', () => {
    const ids = (age: typeof f.age) => filterServices(inbox, { ...f, age }, { now: NOW }).map(r => r.id);
    expect(ids('15m')).toEqual(['u2', 'u3', 'u4']);
    expect(ids('30m')).toEqual(['u2', 'u3', 'u4']);
    expect(ids('1h')).toEqual(['u3', 'u4']);
    expect(ids('24h')).toEqual(['u4']);
  });

  it('filtra por categoría, zona y fecha deseada', () => {
    expect(filterServices(inbox, { ...f, categoryId: 'cat-gas' }, { now: NOW }).map(r => r.id)).toEqual(['u2']);
    expect(filterServices(inbox, { ...f, zones: ['Tonalá'] }, { now: NOW }).map(r => r.id)).toEqual(['u2']);
    const day = new Date('2026-10-05T12:00:00');
    const desiredRange = { from: day, to: day };
    expect(filterServices(inbox, { ...f, desiredRange }, { now: NOW }).map(r => r.id)).toEqual(['u1']);
  });

  it('cuenta antigüedad y fecha deseada como filtros del sheet', () => {
    expect(activeSheetFilters({ ...EMPTY_SERVICE_FILTERS, age: '1h' })).toBe(1);
    expect(activeSheetFilters({ ...EMPTY_SERVICE_FILTERS, age: '1h', desiredRange: { from: new Date(), to: new Date() } })).toBe(2);
  });
});
