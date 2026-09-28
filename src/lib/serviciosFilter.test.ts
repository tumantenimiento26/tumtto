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
  is_urgent: false,
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
  svc({ id: 'a1b2c3d4-0000', status: 'enroute', techName: 'Ramón Hernández', totalCents: 150000, method: 'card', is_urgent: true }),
  svc({ id: 'b0000000-0001', zone: 'Guadalajara', categoryId: 'cat-electrical', categoryName: 'Electricidad', clientName: 'Jorge Salas' }),
  svc({ id: 'c0000000-0002', status: 'paid', totalCents: 80000, method: 'cash' }),
  svc({ id: 'd0000000-0003', status: 'cancelled', is_disputed: true, totalCents: 300000 }),
];

describe('servicios', () => {
  it('pestañas y conteos', () => {
    const c = tabCounts(rows, EMPTY_SERVICE_FILTERS);
    expect(c).toEqual({ todos: 4, esperando: 1, curso: 1, completados: 1, cancelados: 1, disputa: 1 });
  });

  it('búsqueda sin acentos por cliente, técnico y código SVC', () => {
    const f = { ...EMPTY_SERVICE_FILTERS };
    expect(filterServices(rows, { ...f, query: 'ramon' }).map(r => r.id)).toEqual(['a1b2c3d4-0000']);
    expect(filterServices(rows, { ...f, query: 'electricidad' })).toHaveLength(1);
    expect(filterServices(rows, { ...f, query: orderCode('c0000000-0002') }).map(r => r.id)).toContain('c0000000-0002');
  });

  it('filtros del sheet: zona, método, monto, urgentes, disputa', () => {
    const f = { ...EMPTY_SERVICE_FILTERS };
    expect(filterServices(rows, { ...f, zones: ['Guadalajara'] })).toHaveLength(1);
    expect(filterServices(rows, { ...f, method: 'cash' }).map(r => r.id)).toEqual(['c0000000-0002']);
    expect(filterServices(rows, { ...f, minPesos: 1000, maxPesos: 2000 }).map(r => r.id)).toEqual(['a1b2c3d4-0000']);
    expect(filterServices(rows, { ...f, urgentOnly: true })).toHaveLength(1);
    expect(filterServices(rows, { ...f, disputeOnly: true })).toHaveLength(1);
    expect(activeSheetFilters({ ...f, zones: ['A', 'B'], urgentOnly: true, minPesos: 1 })).toBe(4);
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
