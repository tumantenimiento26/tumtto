'use client';

import { useEffect, useState } from 'react';

import { ErrorPage, PageHeader, ScreenSkeleton, Tabs } from '@/components/ds';
import { useAuth } from '@/lib/auth';
import { loadStaff, useStaff } from '@/lib/data/staff';
import { MembersPanel } from './_components/MembersPanel';
import { RolesPanel } from './_components/RolesPanel';

type Tab = 'miembros' | 'roles';

/**
 * «Equipo y roles»: miembros de la consola (alta directa con contraseña
 * temporal) y roles con su matriz de permisos Ver / Editar por sección.
 * Sólo con permiso de edición de equipo.
 */
export default function EquipoPage() {
  const { canEdit, permissionsStatus } = useAuth();
  const allowed = canEdit('equipo');
  const { status, error, roles, staff } = useStaff();
  const [tab, setTab] = useState<Tab>('miembros');
  // Enlaces profundos: ?tab=roles&rol=<slug> · ?agregar=1 abre el alta.
  const [deep, setDeep] = useState<{ role: string | null; add: boolean }>({
    role: null,
    add: false,
  });
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get('tab') === 'roles') setTab('roles');
    setDeep({ role: q.get('rol'), add: q.has('agregar') });
  }, []);

  useEffect(() => {
    if (allowed) void loadStaff();
  }, [allowed]);

  if (permissionsStatus === 'ready' && !allowed)
    return (
      <ErrorPage
        kind="403"
        primary={{ label: 'Ir al panel', href: '/dashboard' }}
      />
    );
  if (status === 'error')
    return (
      <ErrorPage
        kind="500"
        primary={{ label: 'Reintentar', onClick: () => void loadStaff() }}
        reference={error ?? undefined}
      />
    );
  if (status !== 'ready') return <ScreenSkeleton kind="list" />;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        kicker="Sistema"
        title="Equipo y roles"
        description="Agrega a tu equipo con una contraseña temporal y define qué secciones puede ver y editar cada rol."
      />
      <Tabs
        tabs={[
          { value: 'miembros', label: 'Miembros', count: staff.length },
          { value: 'roles', label: 'Roles y permisos', count: roles.length },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'miembros' ? (
        <MembersPanel openAdd={deep.add} />
      ) : (
        <RolesPanel initialRole={deep.role} />
      )}
    </div>
  );
}
