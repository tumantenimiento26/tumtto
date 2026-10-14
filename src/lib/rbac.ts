// RBAC mínimo de la consola (contrato §3). El claim vive en
// `app_metadata.admin_role`; si falta (admins anteriores) se trata como
// super_admin. El backend aplica el mismo mapa en app.has_permission().
// Slug de admin_roles: los 4 del sistema más los roles personalizados.
export type AdminRole = string;
type SystemRole = 'super_admin' | 'soporte' | 'onboarding' | 'legal';
export type Permission = 'finanzas' | 'kyc' | 'soporte' | 'usuarios' | 'calificaciones' | 'inventario';

export const ADMIN_ROLES: { value: SystemRole; label: string; desc: string }[] = [
  { value: 'super_admin', label: 'Super admin', desc: 'Acceso total: finanzas, configuración y equipo.' },
  { value: 'soporte', label: 'Soporte', desc: 'Disputas, tickets, notas, reasignar y suspender.' },
  { value: 'onboarding', label: 'Onboarding', desc: 'Revisión KYC y documentos de técnicos.' },
  { value: 'legal', label: 'Legal', desc: 'Disputas y expedientes de soporte.' },
];

export const PERMISSIONS: Record<Permission, { label: string; desc: string; roles: SystemRole[] }> = {
  finanzas: {
    label: 'Finanzas',
    desc: 'Retiros, reembolsos, configuración y comisión.',
    roles: ['super_admin'],
  },
  kyc: {
    label: 'KYC',
    desc: 'Aprobar/rechazar técnicos y revisar documentos.',
    roles: ['super_admin', 'onboarding'],
  },
  soporte: {
    label: 'Soporte',
    desc: 'Disputas, tickets, notas, reasignar y suspender usuarios.',
    roles: ['super_admin', 'soporte', 'legal'],
  },
  usuarios: {
    label: 'Usuarios',
    desc: 'Invitar administradores y cambiar roles.',
    roles: ['super_admin'],
  },
  calificaciones: {
    label: 'Moderar calificaciones',
    desc: 'Ocultar y restaurar calificaciones de técnicos.',
    roles: ['super_admin', 'soporte'],
  },
  inventario: {
    label: 'Inventario de herramientas',
    desc: 'Alta, asignación y baja de la herramienta de la empresa.',
    roles: ['super_admin', 'onboarding'],
  },
};

/** Rol desde `session.user.app_metadata` (sin claim = super_admin; acepta roles personalizados). */
export function roleFromMetadata(meta: unknown): AdminRole {
  const raw = (meta as { admin_role?: unknown } | null | undefined)?.admin_role;
  return typeof raw === 'string' && raw.trim() ? raw : 'super_admin';
}

/** Mapa estático de los roles del sistema: respaldo si my_permissions() falla. */
export const can = (role: AdminRole, perm: Permission) =>
  (PERMISSIONS[perm].roles as string[]).includes(role);
