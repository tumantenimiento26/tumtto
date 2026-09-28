'use client';

import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import {
  Button,
  Input,
  Segmented,
  Sheet,
  toast,
} from '@/components/ds';
import {
  getProfile,
  reactivateUser,
  suspendUser,
  updateProfile,
} from '@/lib/data/store';
import { formatPhone } from '@/lib/phone';
import { FormSection } from '../../servicios/_components/ServiceFormSheet';
import { toE164Mx } from './phoneMx';

/**
 * Sheet de cliente. Editar: nombre, celular y estado de la cuenta.
 * Nuevo cliente: la UI existe pero no hay endpoint para crear cuentas de
 * cliente desde la consola (solo `admin-users` invita admins) — el botón
 * queda deshabilitado en vez de fingir el alta.
 */
export function ClientFormSheet({
  open,
  onClose,
  clientId,
}: {
  open: boolean;
  onClose: () => void;
  clientId: string | null;
}) {
  const profile = clientId ? getProfile(clientId) : undefined;
  const editing = !!profile;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'active' | 'suspended'>('active');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [shake, setShake] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(profile?.full_name ?? '');
    setPhone(profile?.phone ? formatPhone(profile.phone) : '');
    setStatus(profile?.status === 'suspended' ? 'suspended' : 'active');
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, clientId]);

  async function save() {
    if (!profile || saving) return;
    const e: typeof errors = {};
    if (name.trim().length < 3) e.name = 'Escribe el nombre completo.';
    const e164 = phone.trim() ? toE164Mx(phone) : null;
    if (phone.trim() && !e164) e.phone = 'Celular de 10 dígitos (MX).';
    setErrors(e);
    if (Object.keys(e).length) {
      setShake(n => n + 1);
      return;
    }
    setSaving(true);
    try {
      const changed =
        name.trim() !== (profile.full_name ?? '') || e164 !== (profile.phone ?? null);
      if (changed) {
        const ok = await updateProfile(profile.id, {
          full_name: name.trim(),
          phone: e164,
        });
        if (ok === null) return;
      }
      const wasSuspended = profile.status === 'suspended';
      if (status === 'suspended' && !wasSuspended) {
        if ((await suspendUser(profile.id)) === null) return;
      } else if (status === 'active' && wasSuspended) {
        if ((await reactivateUser(profile.id)) === null) return;
      }
      toast.success('Cliente actualizado', name.trim());
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet
      open={open}
      onClose={() => !saving && onClose()}
      width={480}
      kicker="Clientes"
      title={editing ? 'Editar cliente' : 'Nuevo cliente'}
      footer={
        <div
          key={shake}
          className={`flex w-full gap-2.5 ${shake ? 'animate-shake' : ''}`}
        >
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            full
            loading={saving}
            disabled={!editing}
            title={editing ? undefined : 'Próximamente'}
            onClick={() => void save()}
          >
            {editing ? 'Guardar cambios' : 'Crear cliente'}
          </Button>
        </div>
      }
    >
      {!editing && (
        <div className="mb-5 flex gap-2.5 rounded-box bg-info-soft p-3 text-[13px] text-body">
          <Info size={16} className="mt-0.5 shrink-0 text-primary" />
          <p>
            <b className="font-display text-navy">Próximamente.</b> Por ahora los
            clientes crean su cuenta desde la app; el alta desde la consola
            necesita un endpoint de invitación de clientes en el backend.
          </p>
        </div>
      )}
      {/* ponytail: sin endpoint para crear clientes (admin-users solo invita
          admins). Agregar acción `invite_client` para habilitar el alta. */}

      <FormSection>Datos</FormSection>
      <div className="flex flex-col gap-4">
        <Input
          label="Nombre completo"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="María Castillo"
          error={errors.name ?? null}
          disabled={!editing}
        />
        <Input
          label="Correo electrónico"
          value=""
          placeholder={editing ? 'Se gestiona en la cuenta del cliente' : 'nombre@correo.com'}
          disabled
          hint={editing ? 'El correo vive en la cuenta de acceso y no se edita aquí.' : undefined}
        />
        <Input
          label="Celular"
          prefix="+52"
          inputMode="tel"
          value={phone.replace(/^\+52\s?/, '')}
          onChange={e => setPhone(e.target.value)}
          placeholder="33 0000 0000"
          hint="10 dígitos"
          error={errors.phone ?? null}
          disabled={!editing}
        />
      </div>

      <FormSection>Cuenta</FormSection>
      <Segmented
        options={[
          { value: 'active', label: 'Activa' },
          { value: 'suspended', label: 'Suspendida' },
        ]}
        value={status}
        onChange={v => setStatus(v)}
      />
      {status === 'suspended' && profile?.status !== 'suspended' && (
        <p className="mt-2 text-[12.5px] text-error">
          El cliente no podrá solicitar servicios mientras esté suspendido.
        </p>
      )}
    </Sheet>
  );
}
