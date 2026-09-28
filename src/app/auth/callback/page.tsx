'use client';

import { useEffect, useState } from 'react';
import { Mail, MailCheck, MailX } from 'lucide-react';
import { OpenInApp } from '@/components/open-in-app';
import { Button, Input } from '@/components/ds';
import { AuthShell } from '@/components/auth-shell';
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
    <AuthShell
      aside={{
        kicker: 'Servicios a domicilio · ZMG',
        title: 'Tu casa en buenas manos.',
        lead: 'Confirma tu correo para entrar a la app de Tumantenimiento.',
        bullets: [
          'Técnicos verificados uno por uno',
          'Pago protegido al terminar',
          'Garantía de 30 días por escrito',
        ],
      }}
    >
      <div className="animate-up">
        <span className="flex h-14 w-14 items-center justify-center rounded-box bg-warning-soft text-warning-ink">
          <MailX size={26} aria-hidden />
        </span>
        <h1 className="mt-5 font-display text-[27px] font-extrabold tracking-[-0.6px] text-navy">
          {expired ? 'El enlace expiró' : 'El enlace no es válido'}
        </h1>
        <p className="mt-2 text-[14.5px] text-muted">
          {expired
            ? 'Los enlaces de confirmación duran poco y solo sirven una vez.'
            : 'Puede que ya lo hayas usado.'}{' '}
          Escribe tu correo y te mandamos uno nuevo.
        </p>
        {state === 'sent' ? (
          <p className="mt-6 flex items-start gap-2 rounded-box bg-success-soft px-3.5 py-2.5 text-[13px] text-success">
            <MailCheck size={15} className="mt-0.5 shrink-0" aria-hidden />
            Si {email} tiene una cuenta pendiente, te llegará un enlace nuevo en
            unos minutos.
          </p>
        ) : (
          <form
            onSubmit={resend}
            noValidate
            className="mt-6 flex flex-col gap-4"
          >
            <Input
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              icon={Mail}
              placeholder="tu@correo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={
                state === 'error'
                  ? 'No pudimos reenviar el correo. Revisa la dirección e intenta de nuevo en un minuto.'
                  : null
              }
              wrapperClassName="h-12"
            />
            <Button type="submit" size="lg" full loading={state === 'sending'}>
              Reenviar enlace
            </Button>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
