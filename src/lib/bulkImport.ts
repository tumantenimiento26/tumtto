// Importación masiva desde CSV: plantillas y validación por fila (puro, sin red).
// La escritura de cada fila vive en el store (importRow).
import { parseCsvObjects, toCsv } from './csv';
import { isValidPhone, parsePhone, toE164 } from './phone';
import { TECH_TYPES, type TechType } from './techType';
import { normalizeSerial } from './inventory';
import { normalizeToolName } from './tools';
import type { Permission } from './rbac';

export type ImportEntity = 'clientes' | 'tecnicos' | 'herramientas' | 'inventario';

/** Catálogos para resolver nombres/slugs del CSV a ids. */
export interface ImportContext {
  categories: { id: string; slug: string; name: string }[];
  companies: { id: string; name: string; is_active: boolean }[];
  tools: { id: string; name: string }[];
  /** Llaves que ya existen (correos, nombres de herramienta, series) en minúsculas. */
  existing: Set<string>;
}

export type ClientRowValue = { email: string; full_name: string; phone: string | null };
export type TechRowValue = ClientRowValue & {
  category_slugs: string[];
  technician_type: TechType | null;
  company_id: string | null;
};
export type ToolRowValue = { name: string; category_id: string | null };
export type CompanyToolRowValue = {
  name: string;
  serial_or_code: string;
  category_id: string | null;
  catalog_id: string | null;
  brand: string | null;
  model: string | null;
  acquired_on: string | null;
  acquisition_cost_cents: number | null;
};
export type ImportValue = ClientRowValue | TechRowValue | ToolRowValue | CompanyToolRowValue;

export interface ParsedRow {
  line: number;
  raw: Record<string, string>;
  /** Llave de duplicados dentro del archivo (correo, nombre o serie). */
  key: string;
  value: ImportValue | null;
  errors: string[];
}

interface EntityDef {
  label: string;
  permission: Permission;
  filename: string;
  headers: string[];
  required: string[];
  examples: Record<string, string>[];
  notes: string;
  validate: (r: Record<string, string>, ctx: ImportContext) => { key: string; value: ImportValue | null; errors: string[] };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function phoneOf(raw: string, errors: string[]): string | null {
  if (!raw) return null;
  const { country, national } = parsePhone(raw.trim().startsWith('+') ? raw : `+52${raw}`);
  const e164 = toE164(national, country);
  if (!isValidPhone(e164)) {
    errors.push('telefono inválido (10 dígitos o +52…)');
    return null;
  }
  return e164;
}

const fold = (s: string) =>
  s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function categoryOf(raw: string, ctx: ImportContext, errors: string[]): string | null {
  if (!raw) return null;
  const c = ctx.categories.find(c => fold(c.slug) === fold(raw) || fold(c.name) === fold(raw));
  if (!c) errors.push(`categoría "${raw}" no existe`);
  return c?.id ?? null;
}

function person(r: Record<string, string>, ctx: ImportContext, errors: string[]): ClientRowValue {
  const email = r.email.toLowerCase();
  if (!EMAIL.test(email)) errors.push('email inválido');
  else if (ctx.existing.has(email)) errors.push('ya existe una cuenta con ese email');
  if (r.nombre.length < 2) errors.push('nombre es obligatorio');
  return { email, full_name: r.nombre.replace(/\s+/g, ' '), phone: phoneOf(r.telefono, errors) };
}

/** DD/MM/AAAA (Excel en español) o AAAA-MM-DD → AAAA-MM-DD. */
export function parseDate(raw: string): string | null {
  const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const iso = m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : raw;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso ? iso : null;
}

/** "$1,250.50" / "1250,5" → centavos. */
export function parseMoneyCents(raw: string): number | null {
  const s = raw.replace(/[$\s]/g, '');
  const norm = /,\d{1,2}$/.test(s) ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  const n = Number(norm);
  return norm !== '' && Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
}

export const IMPORT_ENTITIES: Record<ImportEntity, EntityDef> = {
  clientes: {
    label: 'Clientes',
    permission: 'soporte',
    filename: 'plantilla-clientes.csv',
    headers: ['email', 'nombre', 'telefono'],
    required: ['email', 'nombre'],
    examples: [
      { email: 'ana.lopez@ejemplo.com', nombre: 'Ana López', telefono: '3312345678' },
      { email: 'jorge.ruiz@ejemplo.com', nombre: 'Jorge Ruiz', telefono: '+523398765432' },
    ],
    notes: 'Cada cliente recibe un correo de invitación para crear su contraseña. El teléfono es opcional (10 dígitos de México o +52…).',
    validate: (r, ctx) => {
      const errors: string[] = [];
      const v = person(r, ctx, errors);
      return { key: v.email, value: v, errors };
    },
  },
  tecnicos: {
    label: 'Técnicos',
    permission: 'kyc',
    filename: 'plantilla-tecnicos.csv',
    headers: ['email', 'nombre', 'telefono', 'categorias', 'tipo', 'empresa'],
    required: ['email', 'nombre'],
    examples: [
      { email: 'luis.perez@ejemplo.com', nombre: 'Luis Pérez', telefono: '3311122233', categorias: 'plumbing|electrical', tipo: 'independent', empresa: '' },
      { email: 'marta.gil@ejemplo.com', nombre: 'Marta Gil', telefono: '', categorias: 'Gas', tipo: '', empresa: '' },
    ],
    notes:
      'Recibe un correo de invitación y completa su KYC en la app. categorias: slugs o nombres separados por "|". tipo: tumtto, third_party o independent (solo super admin); empresa obligatoria si es third_party.',
    validate: (r, ctx) => {
      const errors: string[] = [];
      const base = person(r, ctx, errors);
      const category_slugs = r.categorias
        .split(/[|,]/)
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => {
          const c = ctx.categories.find(c => fold(c.slug) === fold(s) || fold(c.name) === fold(s));
          if (!c) errors.push(`categoría "${s}" no existe`);
          return c?.slug ?? '';
        })
        .filter(Boolean);
      const tipo = fold(r.tipo);
      const technician_type = tipo ? ((TECH_TYPES as string[]).includes(tipo) ? (tipo as TechType) : null) : null;
      if (tipo && !technician_type) errors.push('tipo debe ser tumtto, third_party o independent');
      let company_id: string | null = null;
      if (r.empresa) {
        const co = ctx.companies.find(c => c.is_active && fold(c.name) === fold(r.empresa));
        if (!co) errors.push(`empresa "${r.empresa}" no existe o está inactiva`);
        company_id = co?.id ?? null;
      }
      if (technician_type === 'third_party' && !r.empresa) errors.push('third_party requiere empresa');
      if (technician_type !== 'third_party' && r.empresa) errors.push('empresa solo aplica a tipo third_party');
      return { key: base.email, value: { ...base, category_slugs, technician_type, company_id }, errors };
    },
  },
  herramientas: {
    label: 'Catálogo de herramientas',
    permission: 'usuarios',
    filename: 'plantilla-catalogo-herramientas.csv',
    headers: ['nombre', 'categoria'],
    required: ['nombre'],
    examples: [
      { nombre: 'Sonda para drenaje 15 m', categoria: 'plumbing' },
      { nombre: 'Detector de tensión sin contacto', categoria: 'Electricidad' },
    ],
    notes: 'Herramientas que los técnicos pueden marcar en su perfil. categoria es opcional (slug o nombre).',
    validate: (r, ctx) => {
      const errors: string[] = [];
      const name = r.nombre.trim().replace(/\s+/g, ' ');
      if (!name) errors.push('nombre es obligatorio');
      else if (ctx.existing.has(`tool:${normalizeToolName(name)}`)) errors.push('ya existe en el catálogo');
      const category_id = categoryOf(r.categoria, ctx, errors);
      return { key: `tool:${normalizeToolName(name)}`, value: { name, category_id }, errors };
    },
  },
  inventario: {
    label: 'Inventario de herramienta',
    permission: 'inventario',
    filename: 'plantilla-inventario.csv',
    headers: ['nombre', 'serie', 'categoria', 'herramienta_catalogo', 'marca', 'modelo', 'fecha_adquisicion', 'costo_mxn'],
    required: ['nombre', 'serie'],
    examples: [
      { nombre: 'Taladro percutor', serie: 'TP-0101', categoria: 'electrical', herramienta_catalogo: '', marca: 'Bosch', modelo: 'GSB 13 RE', fecha_adquisicion: '15/01/2026', costo_mxn: '1899.00' },
      { nombre: 'Escalera de tijera 6 escalones', serie: 'ESC-0102', categoria: '', herramienta_catalogo: '', marca: 'Truper', modelo: '', fecha_adquisicion: '2026-02-01', costo_mxn: '' },
    ],
    notes: 'Herramienta propia de la empresa. serie debe ser única. fecha_adquisicion: DD/MM/AAAA o AAAA-MM-DD. costo_mxn en pesos.',
    validate: (r, ctx) => {
      const errors: string[] = [];
      const name = r.nombre.trim().replace(/\s+/g, ' ');
      if (!name) errors.push('nombre es obligatorio');
      const serial_or_code = normalizeSerial(r.serie);
      if (!serial_or_code) errors.push('serie es obligatoria');
      else if (ctx.existing.has(`serial:${serial_or_code.toLowerCase()}`)) errors.push('esa serie ya existe');
      const category_id = categoryOf(r.categoria, ctx, errors);
      let catalog_id: string | null = null;
      if (r.herramienta_catalogo) {
        const t = ctx.tools.find(t => normalizeToolName(t.name) === normalizeToolName(r.herramienta_catalogo));
        if (!t) errors.push(`herramienta_catalogo "${r.herramienta_catalogo}" no existe`);
        catalog_id = t?.id ?? null;
      }
      const acquired_on = r.fecha_adquisicion ? parseDate(r.fecha_adquisicion) : null;
      if (r.fecha_adquisicion && !acquired_on) errors.push('fecha_adquisicion inválida');
      const acquisition_cost_cents = r.costo_mxn ? parseMoneyCents(r.costo_mxn) : null;
      if (r.costo_mxn && acquisition_cost_cents == null) errors.push('costo_mxn inválido');
      return {
        key: `serial:${serial_or_code.toLowerCase()}`,
        value: {
          name,
          serial_or_code,
          category_id,
          catalog_id,
          brand: r.marca || null,
          model: r.modelo || null,
          acquired_on,
          acquisition_cost_cents,
        },
        errors,
      };
    },
  },
};

/** Plantilla: encabezados + ejemplos (Excel abre el CSV con BOM en UTF-8). */
export const templateCsv = (entity: ImportEntity) =>
  toCsv(IMPORT_ENTITIES[entity].examples, IMPORT_ENTITIES[entity].headers);

/** Parsea y valida todo el archivo; marca duplicados dentro del mismo archivo. */
export function parseImport(entity: ImportEntity, text: string, ctx: ImportContext): ParsedRow[] | { error: string } {
  const def = IMPORT_ENTITIES[entity];
  const objects = parseCsvObjects(text);
  if (!objects.length) return { error: 'El archivo no tiene filas de datos.' };
  const missing = def.required.filter(h => !(h in objects[0]));
  if (missing.length) return { error: `Faltan columnas: ${missing.join(', ')}. Descarga la plantilla.` };
  if (objects.length > 500) return { error: 'Máximo 500 filas por archivo.' };
  const seen = new Set<string>();
  return objects.map((o, i) => {
    const raw = Object.fromEntries(def.headers.map(h => [h, o[h] ?? '']));
    const { key, value, errors } = def.validate(raw, ctx);
    if (key && seen.has(key)) errors.push('duplicado dentro del archivo');
    seen.add(key);
    return { line: i + 2, raw, key, value: errors.length ? null : value, errors };
  });
}

/** Reporte de resultados/errores para descargar. */
export const resultsCsv = (entity: ImportEntity, rows: (ParsedRow & { result?: string })[]) =>
  toCsv(
    rows.map(r => ({ fila: r.line, ...r.raw, resultado: r.result ?? (r.errors.length ? `Error: ${r.errors.join('; ')}` : 'Pendiente') })),
    ['fila', ...IMPORT_ENTITIES[entity].headers, 'resultado'],
  );
