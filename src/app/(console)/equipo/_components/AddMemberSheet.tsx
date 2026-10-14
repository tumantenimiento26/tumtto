'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, Dices, Info, ShieldCheck } from 'lucide-react';

import { Button, Input, Kicker, Select, Sheet, toast } from '@/components/ds';
import { StrengthMeter } from '@/components/auth-shell';
import { EMAIL_RE, passwordScore, SCORE_LABEL } from '@/lib/authForms';
import { createStaff, useStaff } from '@/lib/data/staff';
import {
  generateTempPassword,
  phoneToE164,
  tempPasswordError,
} from '@/lib/tempPassword';

type Errors = {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  pass?: string;
};

async function copy(text: string, ok: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(ok);
  } catch {
    toast.error('No se pudo copiar', 'Selecciónalo y cópialo a mano.');
  }
}

/**
 * Alta directa de un miembro (create_staff): sin invitación; el creador fija
 * una contraseña temporal que la persona debe cambiar en su primer acceso.
 */
export function AddMemberSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const roles = useStaff(s => s.roles);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [pass, setPass] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [shake, setShake] = useState(0);
  const [created, setCreated] = useState<{
    email: string;
    pass: string;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    setName('');
    setEmail('');
    setPhone('');
    setRole(null);
    setPass(generateTempPassword());
    setErrors({});
    setFormError(null);
    setCreated(null);
  }, [open]);

  async function save() {
    if (saving) return;
    const e: Errors = {};
    if (name.trim().length < 3) e.name = 'Escribe el nombre completo.';
    if (!EMAIL_RE.test(email.trim())) e.email = 'Correo no válido.';
    const e164 = phone.trim() ? phoneToE164(phone) : null;
    if (phone.trim() && !e164) e.phone = 'Celular de 10 dígitos (MX).';
    if (!role) e.role = 'Elige un rol.';
    const pe = tempPasswordError(pass);
    if (pe) e.pass = pe;
    setErrors(e);
    setFormError(null);
    if (Object.keys(e).length || !role) {
      setShake(n => n + 1);
      return;
    }
    setSaving(true);
    const r = await createStaff({
      email: email.trim(),
      full_name: name.trim(),
      phone: e164,
      admin_role: role,
      temp_password: pass,
    });
    setSaving(false);
    if (!r.ok) {
      setFormError(r.message);
      setShake(n => n + 1);
      return;
    }
    toast.success('Miembro agregado', name.trim());
    setCreated({ email: email.trim(), pass });
  }

  if (created)
    return (
      <Sheet
        open={open}
        onClose={onClose}
        width={480}
        kicker="Equipo"
        title="Miembro agregado"
        footer={
          <Button full onClick={onClose}>
            Listo
          </Button>
        }
      >
        <div className="flex flex-col items-start gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-box bg-success-soft text-success">
            <Check size={24} aria-hidden />
          </span>
          <p className="text-[14px] text-body">
            Comparte estos datos por un canal seguro. Al entrar por primera vez
            tendrá que crear su propia contraseña y activar la verificación en
            dos pasos. Esta contraseña no se volverá a mostrar.
          </p>
          <div className="w-full rounded-box border border-line bg-panel p-4">
            <p className="text-[12px] text-muted">Correo</p>
            <p className="font-mono text-[13.5px] font-semibold text-navy">
              {created.email}
            </p>
            <p className="mt-3 text-[12px] text-muted">Contraseña temporal</p>
            <p className="break-all font-mono text-[15px] font-semibold text-navy">
              {created.pass}
            </p>
          </div>
          <Button
            variant="secondary"
            icon={Copy}
            onClick={() =>
              void copy(
                `Correo: ${created.email}\nContraseña temporal: ${created.pass}`,
                'Acceso copiado',
              )
            }
          >
            Copiar acceso
          </Button>
        </div>
      </Sheet>
    );

  const score = passwordScore(pass);

  return (
    <Sheet
      open={open}
      onClose={() => !saving && onClose()}
      width={480}
      kicker="Equipo"
      title="Agregar miembro"
      footerClassName={shake ? 'animate-shake' : ''}
      footer={
        <div key={shake} className="flex w-full gap-2.5">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            full
            icon={ShieldCheck}
            loading={saving}
            onClick={() => void save()}
          >
            Crear miembro
          </Button>
        </div>
      }
    >
      <div className="mb-5 flex gap-2.5 rounded-box bg-info-soft p-3 text-[13px] text-body">
        <Info size={16} className="mt-0.5 shrink-0 text-primary" />
        <p>
          La cuenta se crea al instante, sin correo de invitación. En su primer
          acceso la persona deberá cambiar la contraseña temporal.
        </p>
      </div>

      {formError && (
        <p
          role="alert"
          className="mb-4 rounded-box border border-error-line bg-error-soft px-3.5 py-2.5 text-[13px] font-medium text-error"
        >
          {formError}
        </p>
      )}

      <div className="flex flex-col gap-4">
        <Input
          label="Nombre completo"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Lucía Ramos"
          error={errors.name ?? null}
        />
        <Input
          label="Correo electrónico"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="nombre@tumantenimiento.mx"
          error={errors.email ?? null}
        />
        <Input
          label="Celular (opcional)"
          prefix="+52"
          inputMode="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="33 0000 0000"
          hint="10 dígitos"
          error={errors.phone ?? null}
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
            onChange={r => {
              setRole(r);
              setErrors(x => ({ ...x, role: undefined }));
            }}
            error={!!errors.role}
            aria-label="Rol"
          />
          {errors.role && (
            <p role="alert" className="mt-1.5 text-[12px] text-error">
              {errors.role}
            </p>
          )}
        </div>
        <div>
          <Input
            label="Contraseña temporal"
            required
            value={pass}
            onChange={e => setPass(e.target.value)}
            error={errors.pass ?? null}
            hint="Mínimo 10 caracteres, con letras y números."
            className="font-mono"
            suffix={
              <span className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPass(generateTempPassword())}
                  className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[12px] font-semibold text-primary hover:bg-info-soft"
                  aria-label="Generar contraseña"
                >
                  <Dices size={14} /> Generar
                </button>
                <button
                  type="button"
                  onClick={() => void copy(pass, 'Contraseña copiada')}
                  disabled={!pass}
                  className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[12px] font-semibold text-primary hover:bg-info-soft disabled:opacity-50"
                  aria-label="Copiar contraseña"
                >
                  <Copy size={14} /> Copiar
                </button>
              </span>
            }
          />
          <StrengthMeter score={score} />
          <p className="mt-1.5 text-[12px] text-muted">
            {pass ? `Seguridad: ${SCORE_LABEL[score]}` : ''}
          </p>
        </div>
      </div>
    </Sheet>
  );
}
