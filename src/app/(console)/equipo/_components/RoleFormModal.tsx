'use client';

import { useEffect, useState } from 'react';
import { ShieldPlus } from 'lucide-react';

import { Button, Field, Input, Modal, Textarea, toast } from '@/components/ds';
import { createRole, renameRole, type RoleRow } from '@/lib/data/staff';
import { roleNameError, slugFromName } from '@/lib/staffRoles';

/** Crear un rol personalizado o renombrar uno existente (el slug no cambia). */
export function RoleFormModal({
  open,
  onClose,
  role,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  role: RoleRow | null;
  onSaved: (slug: string) => void;
}) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(role?.name ?? '');
    setDesc(role?.description ?? '');
    setError(null);
  }, [open, role]);

  async function save() {
    if (saving) return;
    const e = roleNameError(name);
    if (e) return setError(e);
    setSaving(true);
    const r = role
      ? await renameRole(role.slug, name, desc)
      : await createRole(name, desc);
    setSaving(false);
    if (!r.ok) return setError(r.message);
    toast.success(role ? 'Rol actualizado' : 'Rol creado', name.trim());
    onSaved(role ? role.slug : slugFromName(name));
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!saving}
      title={role ? 'Editar rol' : 'Nuevo rol'}
      description={
        role
          ? undefined
          : 'Empieza sin permisos; luego marca qué secciones puede ver y editar.'
      }
      icon={ShieldPlus}
      width={460}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={() => void save()} loading={saving}>
            {role ? 'Guardar' : 'Crear rol'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Nombre del rol"
          required
          autoFocus
          value={name}
          onChange={e => {
            setName(e.target.value);
            setError(null);
          }}
          placeholder="Finanzas"
          error={error}
          hint={role ? `Identificador: ${role.slug}` : undefined}
        />
        <Field label="Descripción (opcional)">
          <Textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Para qué sirve este rol"
            rows={3}
          />
        </Field>
      </div>
    </Modal>
  );
}
