import { describe, expect, it } from 'vitest';
import { parseCsv, parseCsvObjects, toCsv } from './csv';
import { parseDate, parseImport, parseMoneyCents, templateCsv, type ImportContext } from './bulkImport';

const ctx: ImportContext = {
  categories: [
    { id: 'c1', slug: 'plumbing', name: 'Plomería' },
    { id: 'c2', slug: 'electrical', name: 'Electricidad' },
    { id: 'c3', slug: 'gas', name: 'Gas' },
  ],
  companies: [
    { id: 'co1', name: 'Servicios Norte', is_active: true },
    { id: 'co2', name: 'Vieja SA', is_active: false },
  ],
  tools: [{ id: 't1', name: 'Multímetro digital' }],
  existing: new Set(['tool:multímetro digital', 'serial:tp-0001']),
};

describe('csv', () => {
  it('parses comma and semicolon files with quotes, CRLF and BOM', () => {
    expect(parseCsv('﻿a,b\r\n"x, y","di ""hola"""\r\n')).toEqual([
      ['a', 'b'],
      ['x, y', 'di "hola"'],
    ]);
    expect(parseCsv('a;b\n1,5;"multi\nlínea"\n;\n')).toEqual([
      ['a', 'b'],
      ['1,5', 'multi\nlínea'],
    ]);
  });

  it('normalizes headers', () => {
    expect(parseCsvObjects('Email; Teléfono \nA@B.MX;33')).toEqual([{ email: 'A@B.MX', telefono: '33' }]);
  });

  it('round-trips and neutralizes formulas on export', () => {
    const csv = toCsv([{ a: '=HYPERLINK("x")', b: -5, c: 'x;y' }]);
    expect(csv).toBe('﻿a,b,c\n"\'=HYPERLINK(""x"")",-5,"x;y"');
    expect(parseCsv(csv)[1]).toEqual(['\'=HYPERLINK("x")', '-5', 'x;y']);
    expect(parseCsvObjects(toCsv([{ tel: '+523312345678' }]))).toEqual([{ tel: '+523312345678' }]);
  });
});

describe('bulk import', () => {
  it('the templates parse back without errors', () => {
    for (const e of ['clientes', 'tecnicos', 'herramientas', 'inventario'] as const) {
      const rows = parseImport(e, templateCsv(e), ctx);
      if (!Array.isArray(rows)) throw new Error(rows.error);
      expect(rows.flatMap(r => r.errors), e).toEqual([]);
    }
  });

  it('validates clients and flags duplicates within the file', () => {
    const rows = parseImport(
      'clientes',
      'email,nombre,telefono\nana@x.mx,Ana,3312345678\nmal,B,\nANA@x.mx,Ana 2,123',
      ctx,
    );
    if (!Array.isArray(rows)) throw new Error(rows.error);
    expect(rows[0]).toMatchObject({ line: 2, errors: [], value: { email: 'ana@x.mx', phone: '+523312345678' } });
    expect(rows[1].errors).toEqual(['email inválido', 'nombre es obligatorio']);
    expect(rows[2].errors).toEqual(['telefono inválido (10 dígitos o +52…)', 'duplicado dentro del archivo']);
    expect(rows[2].value).toBeNull();
  });

  it('rejects files without required columns', () => {
    expect(parseImport('clientes', 'correo,nombre\na@b.mx,A', ctx)).toEqual({
      error: 'Faltan columnas: email. Descarga la plantilla.',
    });
  });

  it('validates technicians: categories, type and company', () => {
    const rows = parseImport(
      'tecnicos',
      'email,nombre,categorias,tipo,empresa\n' +
        'a@x.mx,Ana,Plomería|electrical,third_party,servicios norte\n' +
        'b@x.mx,Beto,carpinteria,third_party,\n' +
        'c@x.mx,Caro,,tumtto,Vieja SA',
      ctx,
    );
    if (!Array.isArray(rows)) throw new Error(rows.error);
    expect(rows[0].value).toMatchObject({ category_slugs: ['plumbing', 'electrical'], technician_type: 'third_party', company_id: 'co1' });
    expect(rows[1].errors).toEqual(['categoría "carpinteria" no existe', 'third_party requiere empresa']);
    expect(rows[2].errors).toEqual(['empresa "Vieja SA" no existe o está inactiva', 'empresa solo aplica a tipo third_party']);
  });

  it('validates catalog tools and inventory', () => {
    const tools = parseImport('herramientas', 'nombre,categoria\nMULTÍMETRO  digital,\nNivel,plumbing', ctx);
    if (!Array.isArray(tools)) throw new Error(tools.error);
    expect(tools[0].errors).toEqual(['ya existe en el catálogo']);
    expect(tools[1].value).toEqual({ name: 'Nivel', category_id: 'c1' });

    const inv = parseImport(
      'inventario',
      'nombre,serie,herramienta_catalogo,fecha_adquisicion,costo_mxn\n' +
        'Taladro,tp-0001,,,\n' +
        'Multímetro,mm 01,multímetro digital,15/01/2026,"$1,899.50"\n' +
        'X,Y,,31/02/2026,abc',
      ctx,
    );
    if (!Array.isArray(inv)) throw new Error(inv.error);
    expect(inv[0].errors).toEqual(['esa serie ya existe']);
    expect(inv[1].value).toMatchObject({ serial_or_code: 'MM 01', catalog_id: 't1', acquired_on: '2026-01-15', acquisition_cost_cents: 189950 });
    expect(inv[2].errors).toEqual(['fecha_adquisicion inválida', 'costo_mxn inválido']);
  });

  it('parses dates and money', () => {
    expect(parseDate('1/2/2026')).toBe('2026-02-01');
    expect(parseDate('2026-13-01')).toBeNull();
    expect(parseMoneyCents('1250,5')).toBe(125050);
    expect(parseMoneyCents('-3')).toBeNull();
  });
});
