// RBAC mínimo de la consola (contrato §3). El claim vive en
// `app_metadata.admin_role`; si falta (admins anteriores) se trata como
// super_admin. El backend aplica el mismo mapa en app.has_permission().
export type AdminRole = 'super_admin' | 'soporte' | 'onboarding' | 'legal';
export type Permission = 'finanzas' | 'kyc' | 'soporte' | 'usuarios';

export const ADMIN_ROLES: { value: AdminRole; label: string; desc: string }[] = [
  { value: 'super_admin', label: 'Super admin', desc: 'Acceso total: finanzas, configuración y equipo.' },
  { value: 'soporte', label: 'Soporte', desc: 'Disputas, tickets, notas, reasignar y suspender.' },
  { value: 'onboarding', label: 'Onboarding', desc: 'Revisión KYC y documentos de técnicos.' },
  { value: 'legal', label: 'Legal', desc: 'Disputas y expedientes de soporte.' },
];

export const PERMISSIONS: Record<Permission, { label: string; desc: string; roles: AdminRole[] }> = {
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
};

const ROLE_SET = new Set<string>(ADMIN_ROLES.map(r => r.value));

/** Rol desde `session.user.app_metadata` (fallback super_admin). */
export function roleFromMetadata(meta: unknown): AdminRole {
  const raw = (meta as { admin_role?: unknown } | null | undefined)?.admin_role;
  return typeof raw === 'string' && ROLE_SET.has(raw) ? (raw as AdminRole) : 'super_admin';
}

export const can = (role: AdminRole, perm: Permission) =>
  PERMISSIONS[perm].roles.includes(role);
