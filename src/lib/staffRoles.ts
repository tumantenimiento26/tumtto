// Lógica pura de roles y permisos del equipo (sin React ni Supabase): mapa
// permiso-antiguo → sección, reglas de la matriz Ver/Editar y acceso por ruta.
import { can as staticCan, type AdminRole, type Permission } from './rbac';

export type SectionDef = { slug: string; label: string; sort_order: number };
export type SectionPerm = { view: boolean; edit: boolean };
export type MyPermissions = {
  admin_role: string;
  is_super_admin: boolean;
  permissions: Record<string, SectionPerm>;
};
/** Fila del backend (admin_list_roles / admin_set_role_permissions). */
export type MatrixRow = {
  section: string;
  can_view: boolean;
  can_edit: boolean;
};
/** Matriz editable: sección → Ver/Editar. */
export type Matrix = Record<string, SectionPerm>;

export const SECTION_SLUGS = [
  'dashboard',
  'servicios',
  'tecnicos',
  'clientes',
  'inventario',
  'regiones',
  'finanzas',
  'revision_pagos',
  'soporte',
  'kyc',
  'reportes',
  'configuracion',
  'equipo',
] as const;

/** Permiso antiguo → sección (se evalúa como «editar»). Contrato del backend. */
export const LEGACY_SECTION: Record<Permission, string> = {
  finanzas: 'finanzas',
  kyc: 'kyc',
  soporte: 'soporte',
  usuarios: 'tecnicos',
  calificaciones: 'servicios',
  inventario: 'inventario',
};

export const canSection = (
  p: MyPermissions | null,
  section: string,
  action: 'view' | 'edit',
): boolean => {
  if (!p) return false;
  if (p.is_super_admin) return true;
  const s = p.permissions[section];
  return !!s && (action === 'view' ? s.view : s.edit);
};

/** `can('finanzas')`-style: ¿puede editar la sección ligada al permiso antiguo? */
export const canLegacy = (p: MyPermissions | null, perm: Permission): boolean =>
  canSection(p, LEGACY_SECTION[perm], 'edit');

const emptyPerm = (): SectionPerm => ({ view: false, edit: false });

/** Normaliza la respuesta de my_permissions(); null si no tiene la forma esperada. */
export function parseMyPermissions(raw: unknown): MyPermissions | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (
    typeof r.admin_role !== 'string' ||
    !r.permissions ||
    typeof r.permissions !== 'object'
  )
    return null;
  const permissions: Record<string, SectionPerm> = {};
  for (const [k, v] of Object.entries(
    r.permissions as Record<string, unknown>,
  )) {
    const o = (v ?? {}) as { view?: unknown; edit?: unknown };
    const edit = o.edit === true;
    permissions[k] = { view: o.view === true || edit, edit };
  }
  return {
    admin_role: r.admin_role,
    is_super_admin: r.is_super_admin === true,
    permissions,
  };
}

/** Todo permitido (super_admin y modo maqueta). */
export function fullAccess(
  adminRole = 'super_admin',
  slugs: readonly string[] = SECTION_SLUGS,
): MyPermissions {
  return {
    admin_role: adminRole,
    is_super_admin: true,
    permissions: Object.fromEntries(
      slugs.map(s => [s, { view: true, edit: true }]),
    ),
  };
}

/**
 * Respaldo cuando my_permissions() no responde (p. ej. migración pendiente):
 * el mapa estático de los 4 roles del sistema. Todo admin lee la consola; sólo
 * la gestión del equipo se limita a quien tenía «usuarios».
 */
export function legacyPermissions(adminRole: AdminRole): MyPermissions {
  if (adminRole === 'super_admin') return fullAccess(adminRole);
  const permissions: Record<string, SectionPerm> = {};
  for (const s of SECTION_SLUGS) permissions[s] = { view: true, edit: false };
  for (const [perm, section] of Object.entries(LEGACY_SECTION) as [
    Permission,
    string,
  ][])
    permissions[section].edit = staticCan(adminRole, perm);
  permissions.equipo = { view: false, edit: false };
  return { admin_role: adminRole, is_super_admin: false, permissions };
}

// ── Acceso por ruta ──────────────────────────────────────────────────────────
type RouteRule = {
  prefix: string;
  section: string;
  action: 'view' | 'edit';
  /** Secciones que también dan paso (edición) por compatibilidad con el backend. */
  alsoEdit?: string[];
};
const ROUTES: RouteRule[] = [
  { prefix: '/dashboard', section: 'dashboard', action: 'view' },
  { prefix: '/servicios', section: 'servicios', action: 'view' },
  { prefix: '/tecnicos', section: 'tecnicos', action: 'view' },
  { prefix: '/clientes', section: 'clientes', action: 'view' },
  { prefix: '/inventario', section: 'inventario', action: 'view' },
  { prefix: '/regiones', section: 'regiones', action: 'view' },
  { prefix: '/finanzas', section: 'finanzas', action: 'view' },
  // Los RPC de ambas colas siguen aceptando soporte o finanzas.
  {
    prefix: '/revision-pagos',
    section: 'revision_pagos',
    action: 'view',
    alsoEdit: ['soporte', 'finanzas'],
  },
  { prefix: '/soporte', section: 'soporte', action: 'view' },
  { prefix: '/reportes', section: 'reportes', action: 'view' },
  { prefix: '/config', section: 'configuracion', action: 'view' },
  { prefix: '/equipo', section: 'equipo', action: 'edit' },
];

const ruleFor = (pathname: string) =>
  ROUTES.find(
    r => pathname === r.prefix || pathname.startsWith(r.prefix + '/'),
  );

/** ¿Puede abrir la ruta? Las rutas sin sección (notificaciones, catálogo…) son libres. */
export function canAccessPath(
  p: MyPermissions | null,
  pathname: string,
): boolean {
  const r = ruleFor(pathname);
  if (!r) return true;
  return (
    canSection(p, r.section, r.action) ||
    (r.alsoEdit ?? []).some(s => canSection(p, s, 'edit'))
  );
}

// ── Matriz Ver / Editar ──────────────────────────────────────────────────────
export function matrixFromRows(
  sections: readonly string[],
  rows: readonly MatrixRow[],
): Matrix {
  const m: Matrix = Object.fromEntries(sections.map(s => [s, emptyPerm()]));
  for (const r of rows)
    m[r.section] = { view: r.can_view || r.can_edit, edit: r.can_edit };
  return m;
}

/** Ver: al apagarlo se apaga Editar (editar exige ver). */
export function setView(m: Matrix, section: string, value: boolean): Matrix {
  return {
    ...m,
    [section]: {
      view: value,
      edit: value ? (m[section]?.edit ?? false) : false,
    },
  };
}

/** Editar: al encenderlo se enciende Ver. */
export function setEdit(m: Matrix, section: string, value: boolean): Matrix {
  return {
    ...m,
    [section]: {
      view: value ? true : (m[section]?.view ?? false),
      edit: value,
    },
  };
}

/** Enciende/apaga una columna entera respetando la regla Editar ⇒ Ver. */
export function setColumn(
  m: Matrix,
  column: 'view' | 'edit',
  value: boolean,
): Matrix {
  let out = m;
  for (const s of Object.keys(m))
    out = column === 'view' ? setView(out, s, value) : setEdit(out, s, value);
  return out;
}

export function matrixDirty(a: Matrix, b: Matrix): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    const x = a[k] ?? emptyPerm();
    const y = b[k] ?? emptyPerm();
    if (x.view !== y.view || x.edit !== y.edit) return true;
  }
  return false;
}

/** Cuerpo de admin_set_role_permissions, en el orden de las secciones. */
export function matrixPayload(
  sections: readonly string[],
  m: Matrix,
): MatrixRow[] {
  return sections.map(s => {
    const p = m[s] ?? emptyPerm();
    return { section: s, can_view: p.view || p.edit, can_edit: p.edit };
  });
}

export function matrixSummary(m: Matrix): { view: number; edit: number } {
  const v = Object.values(m);
  return {
    view: v.filter(p => p.view).length,
    edit: v.filter(p => p.edit).length,
  };
}

// ── Roles ────────────────────────────────────────────────────────────────────
export const ROLE_SLUG_RE = /^[a-z0-9][a-z0-9_-]{1,39}$/;

/** «Jefe de Finanzas» → «jefe_de_finanzas» (cumple ROLE_SLUG_RE o ''). */
export function slugFromName(name: string): string {
  const s = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40)
    .replace(/_+$/, '');
  return ROLE_SLUG_RE.test(s) ? s : '';
}

export function roleNameError(name: string): string | null {
  const n = name.trim();
  if (!n) return 'El nombre del rol es obligatorio.';
  if (n.length > 60) return 'Máximo 60 caracteres.';
  if (!slugFromName(n)) return 'Usa al menos 2 letras o números.';
  return null;
}
