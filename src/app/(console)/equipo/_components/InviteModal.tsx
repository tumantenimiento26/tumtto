'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';

import { Button, Input, Kicker, Modal, Select, toast } from '@/components/ds';
import { EMAIL_RE } from '@/lib/authForms';
import { inviteStaff, useStaff } from '@/lib/data/staff';

/** Invitación por correo (alternativa al alta directa). */
export function InviteModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const roles = useStaff(s => s.roles);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const invalid = !EMAIL_RE.test(email.trim());

  async function send() {
    if (invalid || !role || sending) return;
    setSending(true);
    const r = await inviteStaff(email.trim(), name.trim(), role);
    setSending(false);
    if (!r.ok) {
      toast.error('No se pudo invitar', r.message);
      return;
    }
    toast.success('Invitación enviada', email.trim());
    setEmail('');
    setName('');
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!sending}
      title="Invitar por correo"
      description="Recibirá un correo para crear su contraseña y entrar a la consola."
      icon={Mail}
      width={460}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={sending}>
            Cancelar
          </Button>
          <Button
            onClick={() => void send()}
            loading={sending}
            disabled={invalid || !role}
          >
            Enviar invitación
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Correo"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="nombre@tumantenimiento.mx"
          error={email && invalid ? 'Correo no válido.' : null}
        />
        <Input
          label="Nombre (opcional)"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nombre y apellido"
        />
        <div>
          <Kicker className="mb-1.5">Rol en la consola</Kicker>
          <Select
            options={roles.map(r => ({
              value: r.slug,
              label: r.name,
              hint: r.description ?? undefined,
            }))}
            value={role}
            onChange={setRole}
            aria-label="Rol"
          />
        </div>
      </div>
    </Modal>
  );
}
