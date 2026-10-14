import { describe, expect, test } from 'vitest';
import {
  LEGACY_SECTION,
  SECTION_SLUGS,
  canAccessPath,
  canLegacy,
  canSection,
  fullAccess,
  legacyPermissions,
  matrixDirty,
  matrixFromRows,
  matrixPayload,
  matrixSummary,
  parseMyPermissions,
  roleNameError,
  setColumn,
  setEdit,
  setView,
  slugFromName,
} from './staffRoles';

const soporte = parseMyPermissions({
  admin_role: 'soporte',
  is_super_admin: false,
  permissions: {
    soporte: { view: true, edit: true },
    servicios: { view: true, edit: true },
    dashboard: { view: true, edit: false },
    finanzas: { view: false, edit: false },
  },
});

describe('permisos', () => {
  test('parseMyPermissions normaliza y rechaza basura', () => {
    expect(parseMyPermissions(null)).toBeNull();
    expect(parseMyPermissions({ admin_role: 'x' })).toBeNull();
    const p = parseMyPermissions({
      admin_role: 'x',
      permissions: { a: { view: false, edit: true } },
    });
    expect(p?.permissions.a).toEqual({ view: true, edit: true }); // editar ⇒ ver
    expect(p?.is_super_admin).toBe(false);
  });

  test('canSection y mapa permiso antiguo → sección', () => {
    expect(canSection(soporte, 'soporte', 'edit')).toBe(true);
    expect(canSection(soporte, 'dashboard', 'view')).toBe(true);
    expect(canSection(soporte, 'dashboard', 'edit')).toBe(false);
    expect(canSection(soporte, 'inexistente', 'view')).toBe(false);
    expect(canSection(null, 'soporte', 'view')).toBe(false);
    expect(canLegacy(soporte, 'soporte')).toBe(true);
    expect(canLegacy(soporte, 'calificaciones')).toBe(true); // → servicios
    expect(canLegacy(soporte, 'finanzas')).toBe(false);
    expect(canLegacy(soporte, 'usuarios')).toBe(false); // → tecnicos
    expect(LEGACY_SECTION.usuarios).toBe('tecnicos');
  });

  test('super admin lo puede todo', () => {
    const p = fullAccess();
    for (const s of SECTION_SLUGS) expect(canSection(p, s, 'edit')).toBe(true);
    expect(canSection({ ...p, permissions: {} }, 'equipo', 'edit')).toBe(true);
  });

  test('respaldo estático = comportamiento anterior', () => {
    const l = legacyPermissions('onboarding');
    expect(canLegacy(l, 'kyc')).toBe(true);
    expect(canLegacy(l, 'inventario')).toBe(true);
    expect(canLegacy(l, 'finanzas')).toBe(false);
    expect(canSection(l, 'clientes', 'view')).toBe(true);
    expect(canSection(l, 'equipo', 'view')).toBe(false);
    expect(canSection(legacyPermissions('super_admin'), 'equipo', 'edit')).toBe(
      true,
    );
    // rol personalizado sin datos: lee pero no edita nada
    expect(canLegacy(legacyPermissions('custom'), 'soporte')).toBe(false);
  });
});

describe('rutas', () => {
  test('oculta lo que el rol no puede ver', () => {
    expect(canAccessPath(soporte, '/dashboard')).toBe(true);
    expect(canAccessPath(soporte, '/finanzas')).toBe(false);
    expect(canAccessPath(soporte, '/servicios/abc')).toBe(true);
    expect(canAccessPath(soporte, '/clientes')).toBe(false);
    expect(canAccessPath(soporte, '/notificaciones')).toBe(true); // sin sección
  });
  test('/equipo exige editar equipo', () => {
    const viewOnly = parseMyPermissions({
      admin_role: 'r',
      permissions: { equipo: { view: true, edit: false } },
    });
    expect(canAccessPath(viewOnly, '/equipo')).toBe(false);
    expect(canAccessPath(fullAccess(), '/equipo')).toBe(true);
  });
  test('revisión de pagos admite soporte/finanzas por compatibilidad', () => {
    expect(canAccessPath(soporte, '/revision-pagos')).toBe(true);
    const none = parseMyPermissions({
      admin_role: 'r',
      permissions: { dashboard: { view: true, edit: false } },
    });
    expect(canAccessPath(none, '/revision-pagos')).toBe(false);
  });
});

describe('matriz', () => {
  const base = matrixFromRows(
    ['a', 'b'],
    [{ section: 'a', can_view: true, can_edit: false }],
  );

  test('construye con todas las secciones', () => {
    expect(base).toEqual({
      a: { view: true, edit: false },
      b: { view: false, edit: false },
    });
  });
  test('editar enciende ver', () => {
    expect(setEdit(base, 'b', true).b).toEqual({ view: true, edit: true });
  });
  test('apagar ver apaga editar', () => {
    const m = setEdit(base, 'a', true);
    expect(setView(m, 'a', false).a).toEqual({ view: false, edit: false });
  });
  test('apagar editar conserva ver; encender ver no enciende editar', () => {
    expect(setEdit(setEdit(base, 'a', true), 'a', false).a).toEqual({
      view: true,
      edit: false,
    });
    expect(setView(base, 'b', true).b).toEqual({ view: true, edit: false });
  });
  test('no muta el original', () => {
    setEdit(base, 'b', true);
    expect(base.b).toEqual({ view: false, edit: false });
  });
  test('columna completa respeta la regla', () => {
    expect(setColumn(base, 'edit', true)).toEqual({
      a: { view: true, edit: true },
      b: { view: true, edit: true },
    });
    expect(matrixSummary(setColumn(base, 'view', false))).toEqual({
      view: 0,
      edit: 0,
    });
  });
  test('dirty y payload', () => {
    expect(matrixDirty(base, { ...base })).toBe(false);
    const m = setEdit(base, 'b', true);
    expect(matrixDirty(base, m)).toBe(true);
    expect(matrixPayload(['a', 'b'], m)).toEqual([
      { section: 'a', can_view: true, can_edit: false },
      { section: 'b', can_view: true, can_edit: true },
    ]);
  });
});

describe('roles', () => {
  test('slug desde el nombre', () => {
    expect(slugFromName('Jefe de Finanzas')).toBe('jefe_de_finanzas');
    expect(slugFromName('  Atención al cliente ')).toBe('atencion_al_cliente');
    expect(slugFromName('!')).toBe('');
    expect(slugFromName('x'.repeat(80)).length).toBeLessThanOrEqual(40);
  });
  test('validación del nombre', () => {
    expect(roleNameError('')).toMatch(/obligatorio/);
    expect(roleNameError('Ok rol')).toBeNull();
    expect(roleNameError('a')).not.toBeNull();
  });
});
