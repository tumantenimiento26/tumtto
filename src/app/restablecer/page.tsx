'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { BrandMark, PrimaryButton } from '@/components/ui';
import { supabase } from '@/lib/supabase';

// Destino del correo "¿Olvidaste tu contraseña?". El cliente de Supabase
// canjea el `?code=` del enlace al cargar y abre una sesión de recuperación;
// aquí solo se fija la contraseña nueva.

type Stage = 'checking' | 'ready' | 'invalid' | 'done';

export default function RestablecerPage() {
  const [stage, setStage] = useState<Stage>('checking');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pass.length < 8) return setError('Mínimo 8 caracteres.');
    if (pass !== confirm) return setError('Las contraseñas no coinciden.');
    setSaving(true);
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ password: pass });
    setSaving(false);
    if (err) {
      setError(
        /same/i.test(err.message)
          ? 'La contraseña nueva debe ser distinta a la anterior.'
          : 'No se pudo cambiar la contraseña. Pide un enlace nuevo.',
      );
      return;
    }
    // Se cierra la sesión de recuperación: que entre con la contraseña nueva.
    await supabase.auth.signOut();
    setStage('done');
  }

  const input =
    'w-full min-w-0 rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm text-navy outline-none focus:border-primary';

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#081A33] p-4">
      <div className="w-full max-w-[420px] rounded-[20px] bg-surface p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <div className="mb-6 flex items-center gap-2">
          <BrandMark size={28} className="rounded-lg" />
          <span className="font-display text-[15px] font-bold text-navy">
            Tumantenimiento
          </span>
        </div>

        {stage === 'checking' && (
          <p className="text-sm text-muted" role="status">
            Verificando el enlace…
          </p>
        )}

        {stage === 'invalid' && (
          <>
            <h1 className="mb-2 font-display text-2xl font-semibold text-navy">
              Enlace no válido
            </h1>
            <p className="mb-6 text-sm text-muted">
              El enlace ya expiró o ya se usó. Pide uno nuevo desde “¿Olvidaste
              tu contraseña?”.
            </p>
            <PrimaryButton href="/login">Ir a iniciar sesión</PrimaryButton>
          </>
        )}

        {stage === 'done' && (
          <div className="text-center">
            <CheckCircle2 size={40} className="mx-auto mb-3 text-success" />
            <h1 className="mb-2 font-display text-2xl font-semibold text-navy">
              Contraseña actualizada
            </h1>
            <p className="mb-6 text-sm text-muted">
              Ya puedes iniciar sesión con tu contraseña nueva.
            </p>
            <PrimaryButton href="/login">Iniciar sesión</PrimaryButton>
          </div>
        )}

        {stage === 'ready' && (
          <>
            <h1 className="mb-1 font-display text-2xl font-semibold text-navy">
              Nueva contraseña
            </h1>
            <p className="mb-6 text-sm text-muted">
              Elige una contraseña de al menos 8 caracteres.
            </p>
            <form onSubmit={submit} noValidate className="flex flex-col gap-4">
              <label className="text-xs font-medium text-navy">
                Contraseña nueva
                <div className="mt-1.5 flex items-center gap-2">
                  <Lock size={15} className="text-faint" />
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    className={input}
                  />
                </div>
              </label>
              <label className="text-xs font-medium text-navy">
                Confirmar contraseña
                <div className="mt-1.5 flex items-center gap-2">
                  <Lock size={15} className="text-faint" />
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className={input}
                  />
                </div>
              </label>
              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-error-soft px-3.5 py-2.5 text-xs text-error"
                >
                  {error}
                </p>
              )}
              <PrimaryButton type="submit" loading={saving}>
                Guardar contraseña
              </PrimaryButton>
            </form>
          </>
        )}

        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted hover:text-navy"
        >
          <ArrowLeft size={13} /> Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
}
