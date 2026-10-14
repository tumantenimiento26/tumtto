// Equipo, roles y matriz de permisos (admin-users + RPC de roles). Es el único
// lugar de la consola que toca estas tablas; en maqueta (MOCK) todo es en memoria.
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';
import { MOCK } from '@/lib/mock';
import {
  SECTION_SLUGS,
  fullAccess,
  matrixPayload,
  parseMyPermissions,
  slugFromName,
  type Matrix,
  type MatrixRow,
  type MyPermissions,
  type SectionDef,
} from '@/lib/staffRoles';
import { getAdmins } from '@/lib/data/store';

export type RoleRow = {
  slug: string;
  name: string;
  description: string | null;
  is_system: boolean;
  is_editable: boolean;
  is_deletable: boolean;
  member_count: number;
  permissions: MatrixRow[];
};
export type StaffRow = {
  user_id: string;
  email: string;
  full_name: string | null;
  admin_role: string;
  must_change_password: boolean;
  status: 'active' | 'suspended';
};
export type Result<T = true> =
  { ok: true; data: T } | { ok: false; message: string };

type StaffState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  sections: SectionDef[];
  roles: RoleRow[];
  staff: StaffRow[];
  error: string | null;
};
export const useStaff = create<StaffState>(() => ({
  status: 'idle',
  sections: [],
  roles: [],
  staff: [],
  error: null,
}));
const patch = (p: Partial<StaffState>) => useStaff.setState(p);

const ok = <T>(data: T): Result<T> => ({ ok: true, data });
const fail = (message: string): Result<never> => ({ ok: false, message });

/** Mensaje en español de un error de RPC (el backend ya escribe los textos). */
const rpcMessage = (e: unknown, fallback: string) =>
  e &&
  typeof e === 'object' &&
  'message' in e &&
  typeof e.message === 'string' &&
  e.message
    ? e.message
    : fallback;

/** Cuerpo `{ error }` de un fallo HTTP de la Edge Function, traducido. */
async function edgeMessage(e: unknown, fallback: string): Promise<string> {
  const ctx = (e as { context?: unknown } | null)?.context;
  if (ctx instanceof Response) {
    try {
      const body = (await ctx.clone().json()) as { error?: unknown };
      if (typeof body.error === 'string') {
        if (/^permission required/i.test(body.error))
          return 'No tienes permiso para administrar el equipo.';
        return body.error;
      }
    } catch {
      /* cuerpo no JSON */
    }
  }
  return fallback;
}

// ── Maqueta ──────────────────────────────────────────────────────────────────
const MOCK_SECTIONS: SectionDef[] = [
  ['dashboard', 'Dashboard'],
  ['servicios', 'Servicios'],
  ['tecnicos', 'Técnicos'],
  ['clientes', 'Clientes'],
  ['inventario', 'Inventario'],
  ['regiones', 'Regiones'],
  ['finanzas', 'Finanzas'],
  ['revision_pagos', 'Revisión de pagos'],
  ['soporte', 'Soporte'],
  ['kyc', 'Verificación KYC'],
  ['reportes', 'Reportes'],
  ['configuracion', 'Configuración'],
  ['equipo', 'Equipo'],
].map(([slug, label], i) => ({ slug, label, sort_order: (i + 1) * 10 }));

const rows = (spec: Record<string, 'V' | 'E'>): MatrixRow[] =>
  SECTION_SLUGS.map(section => ({
    section,
    can_view: !!spec[section],
    can_edit: spec[section] === 'E',
  }));

const allEdit = Object.fromEntries(SECTION_SLUGS.map(s => [s, 'E' as const]));

function mockRoles(): RoleRow[] {
  const sys = (
    slug: string,
    name: string,
    description: string,
    spec: Record<string, 'V' | 'E'>,
  ): RoleRow => ({
    slug,
    name,
    description,
    is_system: true,
    is_editable: slug !== 'super_admin',
    is_deletable: false,
    member_count: 0,
    permissions: rows(spec),
  });
  return [
    sys(
      'super_admin',
      'Super admin',
      'Acceso total: finanzas, configuración y equipo.',
      allEdit,
    ),
    sys(
      'soporte',
      'Soporte',
      'Disputas, tickets, notas, reasignar y suspender.',
      {
        dashboard: 'V',
        servicios: 'E',
        soporte: 'E',
      },
    ),
    sys('onboarding', 'Onboarding', 'Revisión KYC y documentos de técnicos.', {
      dashboard: 'V',
      kyc: 'E',
      inventario: 'E',
    }),
    sys('legal', 'Legal', 'Disputas y expedientes de soporte.', {
      dashboard: 'V',
      soporte: 'E',
    }),
    {
      slug: 'finanzas',
      name: 'Finanzas',
      description: 'Pagos, retiros y reportes.',
      is_system: false,
      is_editable: true,
      is_deletable: true,
      member_count: 0,
      permissions: rows({
        dashboard: 'V',
        servicios: 'V',
        finanzas: 'E',
        revision_pagos: 'E',
        reportes: 'V',
      }),
    },
  ];
}

const mock = {
  roles: mockRoles(),
  staff: [
    {
      user_id: 'demo-admin',
      email: 'demo@tumtto.local',
      full_name: 'Admin (maqueta)',
      admin_role: 'super_admin',
      must_change_password: false,
      status: 'active',
    },
    {
      user_id: 'mock-s1',
      email: 'lucia@tumantenimiento.mx',
      full_name: 'Lucía Ramos',
      admin_role: 'soporte',
      must_change_password: false,
      status: 'active',
    },
    {
      user_id: 'mock-s2',
      email: 'diego@tumantenimiento.mx',
      full_name: 'Diego Torres',
      admin_role: 'onboarding',
      must_change_password: true,
      status: 'active',
    },
    {
      user_id: 'mock-s3',
      email: 'ana@tumantenimiento.mx',
      full_name: 'Ana Villaseñor',
      admin_role: 'finanzas',
      must_change_password: false,
      status: 'active',
    },
  ] as StaffRow[],
};

const withCounts = (roles: RoleRow[], staff: StaffRow[]) =>
  roles.map(r => ({
    ...r,
    member_count: staff.filter(s => s.admin_role === r.slug).length,
  }));

function publishMock() {
  patch({
    status: 'ready',
    error: null,
    sections: MOCK_SECTIONS,
    roles: withCounts(mock.roles, mock.staff),
    staff: [...mock.staff],
  });
}

// ── Lectura ──────────────────────────────────────────────────────────────────
export async function fetchMyPermissions(): Promise<MyPermissions | null> {
  if (MOCK) return fullAccess();
  const { data, error } = await supabase.rpc('my_permissions');
  if (error) {
    console.warn('[staff] my_permissions', error);
    return null;
  }
  return parseMyPermissions(data);
}

/** Carga secciones, roles y miembros. Sin permiso de equipo deja las listas vacías. */
export async function loadStaff(): Promise<void> {
  if (MOCK) return publishMock();
  // Solo la primera carga muestra el esqueleto; las recargas tras guardar van en
  // segundo plano para no desmontar hojas abiertas (resumen del alta, matriz).
  if (useStaff.getState().status !== 'ready') patch({ status: 'loading', error: null });
  const [sec, rol, adm] = await Promise.all([
    supabase.rpc('admin_list_sections'),
    supabase.rpc('admin_list_roles'),
    supabase.rpc('admin_list_admin_roles'),
  ]);
  const err = sec.error ?? rol.error ?? adm.error;
  if (err) {
    console.warn('[staff] load', err);
    patch({
      status: 'error',
      error: rpcMessage(err, 'No pudimos cargar el equipo.'),
    });
    return;
  }
  const status = new Map(getAdmins().map(a => [a.id, a.status]));
  patch({
    status: 'ready',
    sections: ((sec.data as SectionDef[] | null) ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order),
    roles: (rol.data as RoleRow[] | null) ?? [],
    staff: (adm.data ?? []).map(r => ({
      ...r,
      status: status.get(r.user_id) === 'suspended' ? 'suspended' : 'active',
    })),
  });
}

// ── Roles ────────────────────────────────────────────────────────────────────
export async function createRole(
  name: string,
  description: string,
): Promise<Result<{ slug: string }>> {
  const slug = slugFromName(name);
  if (!slug) return fail('Usa al menos 2 letras o números en el nombre.');
  if (useStaff.getState().roles.some(r => r.slug === slug))
    return fail('Ya existe un rol con ese nombre.');
  if (MOCK) {
    mock.roles.push({
      slug,
      name: name.trim(),
      description: description.trim() || null,
      is_system: false,
      is_editable: true,
      is_deletable: true,
      member_count: 0,
      permissions: rows({}),
    });
    publishMock();
    return ok({ slug });
  }
  const { error } = await supabase.rpc('admin_upsert_role', {
    p_slug: slug,
    p_name: name.trim(),
    p_description: description.trim() || undefined,
  });
  if (error) return fail(rpcMessage(error, 'No pudimos crear el rol.'));
  await loadStaff();
  return ok({ slug });
}

export async function renameRole(
  slug: string,
  name: string,
  description: string,
): Promise<Result> {
  if (!name.trim()) return fail('El nombre del rol es obligatorio.');
  if (MOCK) {
    const r = mock.roles.find(x => x.slug === slug);
    if (r) {
      r.name = name.trim();
      r.description = description.trim() || null;
    }
    publishMock();
    return ok(true);
  }
  const { error } = await supabase.rpc('admin_upsert_role', {
    p_slug: slug,
    p_name: name.trim(),
    p_description: description.trim() || undefined,
  });
  if (error) return fail(rpcMessage(error, 'No pudimos renombrar el rol.'));
  await loadStaff();
  return ok(true);
}

export async function saveRolePermissions(
  slug: string,
  matrix: Matrix,
): Promise<Result> {
  const payload = matrixPayload(
    useStaff.getState().sections.map(s => s.slug),
    matrix,
  );
  if (MOCK) {
    const r = mock.roles.find(x => x.slug === slug);
    if (r) r.permissions = payload;
    publishMock();
    return ok(true);
  }
  const { error } = await supabase.rpc('admin_set_role_permissions', {
    p_slug: slug,
    p_matrix: payload,
  });
  if (error) return fail(rpcMessage(error, 'No pudimos guardar los permisos.'));
  await loadStaff();
  return ok(true);
}

export async function deleteRole(slug: string): Promise<Result> {
  if (MOCK) {
    const n = mock.staff.filter(s => s.admin_role === slug).length;
    if (n)
      return fail(
        `el rol tiene ${n} administrador(es) asignado(s): reasígnalos antes de eliminarlo`,
      );
    mock.roles = mock.roles.filter(r => r.slug !== slug);
    publishMock();
    return ok(true);
  }
  const { error } = await supabase.rpc('admin_delete_role', { p_slug: slug });
  if (error) return fail(rpcMessage(error, 'No pudimos eliminar el rol.'));
  await loadStaff();
  return ok(true);
}

// ── Miembros ─────────────────────────────────────────────────────────────────
export type NewStaff = {
  email: string;
  full_name: string;
  phone: string | null;
  admin_role: string;
  temp_password: string;
};

/** Alta directa (sin invitación): create_staff. 409 = correo repetido. */
export async function createStaff(
  input: NewStaff,
): Promise<Result<{ user_id: string }>> {
  if (MOCK) {
    if (
      mock.staff.some(s => s.email.toLowerCase() === input.email.toLowerCase())
    )
      return fail('Ya existe un usuario con ese correo');
    const user_id = `mock-${Date.now()}`;
    mock.staff.push({
      user_id,
      email: input.email,
      full_name: input.full_name,
      admin_role: input.admin_role,
      must_change_password: true,
      status: 'active',
    });
    publishMock();
    return ok({ user_id });
  }
  const { data, error } = await supabase.functions.invoke('admin-users', {
    body: { action: 'create_staff', ...input, phone: input.phone ?? undefined },
  });
  if (error)
    return fail(
      await edgeMessage(
        error,
        'No pudimos crear al miembro. Inténtalo de nuevo.',
      ),
    );
  await loadStaff();
  return ok({ user_id: (data as { user_id?: string } | null)?.user_id ?? '' });
}

export async function changeStaffRole(
  userId: string,
  adminRole: string,
): Promise<Result> {
  if (MOCK) {
    const s = mock.staff.find(x => x.user_id === userId);
    if (s) s.admin_role = adminRole;
    publishMock();
    return ok(true);
  }
  const { error } = await supabase.functions.invoke('admin-users', {
    body: { action: 'set_admin_role', user_id: userId, admin_role: adminRole },
  });
  if (error)
    return fail(await edgeMessage(error, 'No pudimos cambiar el rol.'));
  await loadStaff();
  return ok(true);
}

/** Invitación por correo (flujo anterior; el alta directa es el camino principal). */
export async function inviteStaff(
  email: string,
  fullName: string,
  adminRole: string,
): Promise<Result> {
  if (MOCK) return ok(true);
  const { error } = await supabase.functions.invoke('admin-users', {
    body: {
      action: 'invite',
      email,
      full_name: fullName || undefined,
      admin_role: adminRole,
    },
  });
  if (error)
    return fail(
      await edgeMessage(
        error,
        'No se pudo enviar la invitación. Revisa el correo o si ya tiene cuenta.',
      ),
    );
  return ok(true);
}

// ── Cambio de contraseña obligatorio ─────────────────────────────────────────
/**
 * updateUser → complete_password_change → refreshSession (en ese orden: la
 * bandera sólo se baja cuando la contraseña ya cambió y el token se renueva).
 */
let passwordUpdated = false;
export async function completeForcedPasswordChange(
  password: string,
  translate: (raw: string) => string,
): Promise<Result> {
  const up = await supabase.auth.updateUser({ password });
  // Reintento tras un fallo posterior: la contraseña ya se cambió, Auth rechaza
  // repetirla («distinta de la anterior») y eso no es un error aquí.
  const repeated =
    passwordUpdated &&
    /different from the old|same password/i.test(up.error?.message ?? '');
  if (up.error && !repeated) return fail(translate(up.error.message));
  passwordUpdated = true;
  const { error } = await supabase.functions.invoke('admin-users', {
    body: { action: 'complete_password_change' },
  });
  if (error)
    return fail(
      await edgeMessage(
        error,
        'Tu contraseña cambió, pero no pudimos terminar el proceso. Inténtalo de nuevo.',
      ),
    );
  const refreshed = await supabase.auth.refreshSession();
  if (refreshed.error) return fail(translate(refreshed.error.message));
  passwordUpdated = false;
  return ok(true);
}
