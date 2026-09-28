'use client';

import { useEffect, useState } from 'react';
import { MailCheck } from 'lucide-react';
import { OpenInApp } from '@/components/open-in-app';
import { BrandMark, PrimaryButton } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { authLinkError } from '@/lib/appLinks';

// Destino de los correos de Supabase (confirmación de registro) cuando el
// App Link no abrió la app: la manda abrir con los mismos parámetros. Si el
// enlace venció, lo dice y permite reenviarlo (antes rebotaba sin explicar).
export default function AuthCallbackPage() {
  const [linkError, setLinkError] = useState<ReturnType<
    typeof authLinkError
  > | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setLinkError(authLinkError(window.location.search, window.location.hash));
    setChecked(true);
  }, []);

  if (!checked) return null;
  if (linkError) return <ExpiredLink expired={linkError.expired} />;
  return (
    <OpenInApp
      title="Confirma tu cuenta en la app"
      body="Abre este enlace desde tu celular con la app de Tumantenimiento instalada para terminar de iniciar sesión."
      fallbackUrl="/"
      fallbackLabel="Ir al inicio"
    />
  );
}

function ExpiredLink({ expired }: { expired: boolean }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  );

  async function resend(e: React.FormEvent) {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email)) return setState('error');
    setState('sending');
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setState(error ? 'error' : 'sent');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#081A33] p-4">
      <div className="w-full max-w-[420px] rounded-[20px] bg-surface p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <BrandMark size={44} className="mb-5 rounded-xl" />
        <h1 className="mb-2 font-display text-2xl font-semibold text-navy">
          {expired ? 'El enlace expiró' : 'El enlace no es válido'}
        </h1>
        <p className="mb-6 text-sm text-muted">
          {expired
            ? 'Los enlaces de confirmación duran poco y solo sirven una vez.'
            : 'Puede que ya lo hayas usado.'}{' '}
          Escribe tu correo y te mandamos uno nuevo.
        </p>
        {state === 'sent' ? (
          <p className="flex items-start gap-2 rounded-xl bg-success-soft px-3.5 py-2.5 text-xs text-success">
            <MailCheck size={14} className="mt-0.5 shrink-0" />
            Si {email} tiene una cuenta pendiente, te llegará un enlace nuevo en
            unos minutos.
          </p>
        ) : (
          <form onSubmit={resend} noValidate className="flex flex-col gap-3">
            <input
              type="email"
              autoComplete="email"
              aria-label="Correo electrónico"
              placeholder="tu@correo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm text-navy outline-none focus:border-primary"
            />
            {state === 'error' && (
              <p role="alert" className="text-xs text-error">
                No pudimos reenviar el correo. Revisa la dirección e intenta de
                nuevo en un minuto.
              </p>
            )}
            <PrimaryButton type="submit" loading={state === 'sending'}>
              Reenviar enlace
            </PrimaryButton>
          </form>
        )}
      </div>
    </div>
  );
}
