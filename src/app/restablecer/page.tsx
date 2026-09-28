'use client';

import { useEffect, useState } from 'react';
import { Check, Eye, EyeOff, Link2Off } from 'lucide-react';
import { Button, Input, Skeleton } from '@/components/ds';
import { AuthShell, StrengthMeter } from '@/components/auth-shell';
import { supabase } from '@/lib/supabase';
import { passwordError, passwordScore } from '@/lib/authForms';

// Destino del correo "¿Olvidaste tu contraseña?". El cliente de Supabase
// canjea el `?code=` del enlace al cargar y abre una sesión de recuperación;
// aquí solo se fija la contraseña nueva.

type Stage = 'checking' | 'ready' | 'invalid' | 'done';

const ASIDE = {
  kicker: 'Servicios a domicilio · ZMG',
  title: 'Tu casa en buenas manos.',
  lead: 'Entra para solicitar, seguir y pagar tus servicios, o para operar la plataforma si eres parte del equipo.',
  bullets: [
    'Técnicos verificados uno por uno',
    'Pago protegido al terminar',
    'Garantía de 30 días por escrito',
  ],
};
const H1 =
  'font-display text-[27px] font-extrabold tracking-[-0.6px] text-navy';

export default function RestablecerPage() {
  const [stage, setStage] = useState<Stage>('checking');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [tried, setTried] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [shake, setShake] = useState(0);

  useEffect(() => {
    const { hash, search } = window.location;
    if (/error/.test(hash + search)) {
      setStage('invalid');
      return;
    }
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setStage('ready');
    });
    // Si el canje no produce sesión en unos segundos, el enlace no sirve.
    const t = setTimeout(
      () => setStage(s => (s === 'checking' ? 'invalid' : s)),
      6000,
    );
    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(t);
    };
  }, []);

  const passErr = tried ? passwordError(pass) : null;
  const confirmErr =
    tried && confirm !== pass ? 'Las contraseñas no coinciden.' : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (passwordError(pass) || pass !== confirm) {
      setShake(s => s + 1);
      return;
    }
    setSaving(true);
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ password: pass });
    setSaving(false);
    if (err) {
      setShake(s => s + 1);
      setError(
        /same/i.test(err.message)
          ? 'La contraseña nueva debe ser distinta a la anterior.'
          : 'No se pudo cambiar la contraseña. Pide un enlace nuevo.',
      );
      return;
    }
    // Se cierra la sesión de recuperación (y las demás): que entre con la nueva.
    await supabase.auth.signOut({ scope: 'global' });
    setStage('done');
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
    <AuthShell aside={ASIDE}>
      {stage === 'checking' && (
        <div role="status" aria-label="Verificando el enlace">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="mt-3 h-4 w-1/2" />
          <Skeleton className="mt-8 h-12 w-full" />
          <Skeleton className="mt-4 h-12 w-full" />
        </div>
      )}

      {stage === 'invalid' && (
        <div className="animate-up">
          <span className="flex h-14 w-14 items-center justify-center rounded-box bg-error-soft text-error">
            <Link2Off size={26} aria-hidden />
          </span>
          <h1 className={`mt-5 ${H1}`}>Enlace no válido</h1>
          <p className="mt-2 text-[14.5px] text-muted">
            El enlace ya expiró o ya se usó. Pide uno nuevo desde “¿La
            olvidaste?” en el inicio de sesión.
          </p>
          <Button size="lg" full className="mt-6" href="/login">
            Ir a iniciar sesión
          </Button>
        </div>
      )}

      {stage === 'done' && (
        <div className="animate-up">
          <span className="flex h-14 w-14 animate-pop items-center justify-center rounded-box bg-success-soft text-success">
            <Check size={28} strokeWidth={2.6} aria-hidden />
          </span>
          <h1 className={`mt-5 ${H1}`}>Contraseña actualizada</h1>
          <p className="mt-2 text-[14.5px] text-muted">
            Cerramos las sesiones abiertas en otros dispositivos.
          </p>
          <Button size="lg" full className="mt-6" href="/login">
            Iniciar sesión
          </Button>
        </div>
      )}

      {stage === 'ready' && (
        <div className="animate-up">
          <h1 className={H1}>Crea una nueva contraseña</h1>
          <p className="mt-1 text-[14.5px] text-muted">
            Mínimo 8 caracteres, con letras y números.
          </p>
          <form
            onSubmit={submit}
            noValidate
            className="mt-6 flex flex-col gap-4"
          >
            <div>
              <Input
                label="Nueva contraseña"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                autoFocus
                value={pass}
                onChange={e => setPass(e.target.value)}
                error={passErr}
                wrapperClassName="h-12"
                suffix={eye}
              />
              <StrengthMeter score={passwordScore(pass)} />
            </div>
            <Input
              label="Confirmar contraseña"
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
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
                {saving ? 'Guardando…' : 'Guardar contraseña'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </AuthShell>
  );
}
