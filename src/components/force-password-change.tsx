'use client';

import { useState } from 'react';
import { Eye, EyeOff, KeyRound, Lock } from 'lucide-react';

import { Button, Input } from '@/components/ds';
import { StrengthMeter } from '@/components/auth-shell';
import { passwordError, passwordScore, SCORE_LABEL } from '@/lib/authForms';
import { passwordChangeMessage } from '@/lib/tempPassword';
import { completeForcedPasswordChange } from '@/lib/data/staff';

/**
 * «Crea tu contraseña»: primer acceso con contraseña temporal. Orden fijo:
 * updateUser → complete_password_change → refreshSession; después sigue el
 * flujo normal (2FA). `onDone` se llama con el token ya renovado.
 */
export function ForcePasswordChange({
  onDone,
  onCancel,
}: {
  onDone: () => void;
  onCancel?: () => void;
}) {
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [tried, setTried] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [shake, setShake] = useState(0);

  const passErr = tried ? passwordError(pass) : null;
  const confirmErr =
    tried && !passErr && confirm !== pass
      ? 'Las contraseñas no coinciden.'
      : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    setError(null);
    if (passwordError(pass) || confirm !== pass) {
      setShake(s => s + 1);
      return;
    }
    setSaving(true);
    const r = await completeForcedPasswordChange(pass, passwordChangeMessage);
    setSaving(false);
    if (!r.ok) {
      setError(r.message);
      setShake(s => s + 1);
      return;
    }
    onDone();
  }

  const eye = (
    <button
      type="button"
      onClick={() => setShow(s => !s)}
      className="flex items-center text-muted hover:text-navy"
      aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
    >
      {show ? <EyeOff size={17} /> : <Eye size={17} />}
    </button>
  );

  return (
    <div className="animate-up">
      <span className="flex h-14 w-14 items-center justify-center rounded-box bg-info-soft text-primary">
        <KeyRound size={26} aria-hidden />
      </span>
      <h1 className="mt-5 font-display text-[27px] font-extrabold tracking-[-0.6px] text-navy">
        Crea tu contraseña
      </h1>
      <p className="mt-1.5 text-[14.5px] text-muted">
        Entraste con una contraseña temporal. Elige una propia para continuar;
        después configurarás la verificación en dos pasos.
      </p>
      <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-4">
        <div>
          <Input
            label="Nueva contraseña"
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            autoFocus
            icon={Lock}
            value={pass}
            onChange={e => setPass(e.target.value)}
            error={passErr}
            wrapperClassName="h-12"
            suffix={eye}
          />
          <StrengthMeter score={passwordScore(pass)} />
          <p className="mt-1.5 text-[12px] text-muted">
            {pass
              ? `Seguridad: ${SCORE_LABEL[passwordScore(pass)]}`
              : 'Mínimo 8 caracteres, con letras y números.'}
          </p>
        </div>
        <Input
          label="Confirmar contraseña"
          type={show ? 'text' : 'password'}
          autoComplete="new-password"
          icon={Lock}
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          error={confirmErr}
          wrapperClassName="h-12"
        />
        {error && (
          <p
            role="alert"
            className="rounded-box border border-error-line bg-error-soft px-3.5 py-2.5 text-[13px] font-medium text-error"
          >
            {error}
          </p>
        )}
        <div key={`s-${shake}`} className={shake ? 'animate-shake' : ''}>
          <Button type="submit" size="lg" full loading={saving}>
            {saving ? 'Guardando…' : 'Guardar y continuar'}
          </Button>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-center text-[13.5px] font-semibold text-primary hover:underline"
          >
            Cerrar sesión
          </button>
        )}
      </form>
    </div>
  );
}
