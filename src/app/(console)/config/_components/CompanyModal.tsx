'use client';

import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { Button, Input, Modal } from '@/components/ds';
import { useAction } from '@/components/use-action';
import { saveCompany, type TechnicianCompany } from '@/lib/data/store';

/** Alta/edición de una empresa de técnicos (se remonta con `key` por empresa). */
export function CompanyModal({
  open,
  onClose,
  company,
  initialName = '',
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  company?: TechnicianCompany | null;
  initialName?: string;
  onSaved?: (c: TechnicianCompany) => void;
}) {
  const [name, setName] = useState(company?.name ?? initialName);
  const [rfc, setRfc] = useState(company?.rfc ?? '');
  const [contact, setContact] = useState(company?.contact_name ?? '');
  const [phone, setPhone] = useState(company?.contact_phone ?? '');
  const [email, setEmail] = useState(company?.contact_email ?? '');
  const { busy, run } = useAction();
  const emailBad = !!email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim());

  async function save() {
    let saved: TechnicianCompany | null = null;
    const ok = await run(
      'save',
      async () => {
        saved = await saveCompany(
          { name, rfc, contact_name: contact, contact_phone: phone, contact_email: email },
          company?.id,
        );
        return saved;
      },
      company ? 'Empresa actualizada' : 'Empresa creada',
    );
    if (ok && saved) {
      onSaved?.(saved);
      onClose();
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!busy}
      title={company ? 'Editar empresa' : 'Nueva empresa'}
      description="Empresa a la que pertenecen los técnicos de tipo Tercero."
      icon={Building2}
      width={460}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={!!busy}>
            Cancelar
          </Button>
          <Button
            onClick={() => void save()}
            loading={!!busy}
            disabled={!name.trim() || emailBad}
          >
            Guardar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Nombre" value={name} onChange={e => setName(e.target.value)} required />
        <Input label="RFC (opcional)" value={rfc} onChange={e => setRfc(e.target.value.toUpperCase())} />
        <Input label="Contacto (opcional)" value={contact} onChange={e => setContact(e.target.value)} />
        <Input label="Teléfono (opcional)" value={phone} onChange={e => setPhone(e.target.value)} />
        <Input
          label="Correo (opcional)"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          error={emailBad ? 'Correo no válido.' : null}
        />
      </div>
    </Modal>
  );
}
