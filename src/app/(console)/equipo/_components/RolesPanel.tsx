'use client';

import { useState } from 'react';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';

import { Badge, Button, Modal, toast } from '@/components/ds';
import { deleteRole, useStaff } from '@/lib/data/staff';
import { MatrixEditor } from './MatrixEditor';
import { RoleFormModal } from './RoleFormModal';

export function RolesPanel({
  initialRole = null,
}: {
  initialRole?: string | null;
}) {
  const { roles, sections } = useStaff();
  const [sel, setSel] = useState<string | null>(initialRole);
  const role = roles.find(r => r.slug === sel) ?? roles[0] ?? null;
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [delBusy, setDelBusy] = useState(false);
  const [delError, setDelError] = useState<string | null>(null);

  async function confirmDelete() {
    if (!role || delBusy) return;
    setDelBusy(true);
    setDelError(null);
    const r = await deleteRole(role.slug);
    setDelBusy(false);
    if (!r.ok) return setDelError(r.message);
    toast.success('Rol eliminado', role.name);
    setSel(null);
    setDelOpen(false);
  }

  const blocked = !!role && (!role.is_deletable || role.member_count > 0);

  return (
    <>
      <div className="grid items-start gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="flex flex-col gap-2">
          <Button
            icon={Plus}
            full
            onClick={() => {
              setEditing(false);
              setFormOpen(true);
            }}
          >
            Nuevo rol
          </Button>
          <ul className="flex flex-col gap-2" aria-label="Roles">
            {roles.map(r => {
              const on = r.slug === role?.slug;
              return (
                <li key={r.slug}>
                  <button
                    type="button"
                    onClick={() => setSel(r.slug)}
                    aria-current={on || undefined}
                    className={`w-full rounded-box border p-3.5 text-left transition-colors ${
                      on
                        ? 'border-primary bg-info-soft'
                        : 'border-line bg-card hover:bg-panel'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="truncate font-display text-[14.5px] font-bold text-navy">
                        {r.name}
                      </span>
                      {r.is_system && <Badge tone="navy">Sistema</Badge>}
                    </div>
                    {r.description && (
                      <p className="mt-0.5 line-clamp-2 text-[12.5px] text-muted">
                        {r.description}
                      </p>
                    )}
                    <p className="mt-1.5 inline-flex items-center gap-1 text-[12px] text-muted">
                      <Users size={13} aria-hidden /> {r.member_count}{' '}
                      {r.member_count === 1 ? 'miembro' : 'miembros'}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {role && (
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate font-display text-[20px] font-extrabold text-navy">
                    {role.name}
                  </h2>
                  {role.is_system && <Badge tone="navy">Sistema</Badge>}
                </div>
                <p className="font-mono text-[11.5px] text-faint">
                  {role.slug}
                </p>
              </div>
              <div className="flex gap-2">
                {!role.is_system && (
                  <Button
                    variant="secondary"
                    icon={Pencil}
                    onClick={() => {
                      setEditing(true);
                      setFormOpen(true);
                    }}
                  >
                    Renombrar
                  </Button>
                )}
                {!role.is_system && (
                  <Button
                    variant="destructive"
                    icon={Trash2}
                    disabled={blocked}
                    title={
                      role.member_count > 0
                        ? 'Reasigna a sus miembros antes de eliminarlo'
                        : undefined
                    }
                    onClick={() => {
                      setDelError(null);
                      setDelOpen(true);
                    }}
                  >
                    Eliminar
                  </Button>
                )}
              </div>
            </div>
            <MatrixEditor key={role.slug} role={role} sections={sections} />
          </div>
        )}
      </div>

      <RoleFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        role={editing ? role : null}
        onSaved={slug => setSel(slug)}
      />

      <Modal
        open={delOpen}
        onClose={() => setDelOpen(false)}
        dismissible={!delBusy}
        tone="danger"
        icon={Trash2}
        title={`Eliminar «${role?.name ?? ''}»`}
        description="Se borra el rol y su matriz de permisos. No se puede deshacer."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDelOpen(false)}
              disabled={delBusy}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              loading={delBusy}
              onClick={() => void confirmDelete()}
            >
              Eliminar rol
            </Button>
          </>
        }
      >
        {delError && (
          <p
            role="alert"
            className="rounded-box border border-error-line bg-error-soft px-3.5 py-2.5 text-[13px] font-medium text-error"
          >
            {delError}
          </p>
        )}
      </Modal>
    </>
  );
}
