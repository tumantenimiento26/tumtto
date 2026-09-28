'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Lock,
  Mail,
  MailCheck,
  Smartphone,
  User,
} from 'lucide-react';
import { FadeIn } from '@/components/motion';
import { PrimaryButton, BrandMark } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  formatNational,
  isValidPhone,
  toE164,
} from '@/lib/phone';

// Registro público de técnicos: crea la cuenta (mismo `requested_role` que la
// app) y manda a la app a completar el alta (INE, antecedentes, domicilio).

const EMAIL_RE = /\S+@\S+\.\S+/;

type Errors = Partial<
  Record<'name' | 'email' | 'phone' | 'pass' | 'terms', string>
>;

function signUpMessage(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes('already registered') || m.includes('already exists'))
    return 'Ese correo ya tiene una cuenta. Inicia sesión desde la app.';
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Demasiados intentos. Espera un minuto e inténtalo de nuevo.';
  if (m.includes('fetch') || m.includes('network'))
    return 'No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.';
  return 'No pudimos crear tu cuenta. Inténtalo de nuevo.';
}

export default function RegistroTecnicoPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countryIso, setCountryIso] = useState(DEFAULT_COUNTRY.iso);
  const [national, setNational] = useState('');
  const [pass, setPass] = useState('');
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  // Código del enlace de invitación (/invitacion/CODIGO sin la app instalada).
  const [invite, setInvite] = useState<string | null>(null);
  useEffect(() => {
    setInvite(new URLSearchParams(window.location.search).get('invite'));
  }, []);

  const country = COUNTRIES.find(c => c.iso === countryIso) ?? DEFAULT_COUNTRY;
  const phone = toE164(national, country);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Errors = {};
    if (name.trim().length < 3) errs.name = 'Ingresa tu nombre completo.';
    if (!EMAIL_RE.test(email)) errs.email = 'Ingresa un correo válido.';
    if (!isValidPhone(phone)) errs.phone = 'Ingresa un celular válido.';
    if (pass.length < 8) errs.pass = 'Mínimo 8 caracteres.';
    if (!terms) errs.terms = 'Debes aceptar los términos para continuar.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: pass,
      options: {
        data: {
          full_name: name.trim(),
          phone,
          requested_role: 'tecnico',
          ...(invite ? { invite_code: invite } : {}),
        },
        // El correo de confirmación abre la app (App Link) o su respaldo web.
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) return setAuthError(signUpMessage(error.message));
    // Con confirmación de correo, Supabase no devuelve error para un correo ya
    // registrado (evita enumerar cuentas): llega un usuario sin identidades.
    if (data.user && data.user.identities?.length === 0)
      return setAuthError(
        'Ese correo ya tiene una cuenta. Inicia sesión desde la app o recupera tu contraseña.',
      );
    // El alta sigue en la app; no dejamos una sesión de técnico en la consola.
    if (data.session) await supabase.auth.signOut();
    setSentTo(email.trim());
  }

  const field = (invalid: boolean) =>
    `flex items-center rounded-xl border bg-surface-2 transition-all focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(10,107,207,0.15)] ${
      invalid ? 'border-error' : 'border-line'
    }`;
  const input =
    'flex-1 min-w-0 bg-transparent px-3 py-2.5 text-sm text-navy outline-none placeholder:text-faint';
  const label = 'block text-xs font-medium text-navy mb-1.5';
  const err = (id: string, msg?: string) =>
    msg && (
      <p id={id} className="mt-1.5 text-xs text-error">
        {msg}
      </p>
    );

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#081A33] p-4 sm:p-6">
      <div className="pointer-events-none absolute -left-[140px] -top-[200px] h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(10,107,207,0.5),transparent_65%)] blur-[70px]" />
      <div className="pointer-events-none absolute -bottom-[240px] -right-[160px] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(24,193,255,0.28),transparent_65%)] blur-[80px]" />

      <FadeIn className="relative w-full max-w-[480px] rounded-[20px] bg-surface p-7 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:p-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandMark size={28} className="rounded-lg" />
            <span className="font-display text-[15px] font-bold text-navy">
              Tumantenimiento
            </span>
          </div>
          <Link
            href="/#unete"
            className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-navy"
          >
            <ArrowLeft size={13} />
            Volver al sitio
          </Link>
        </div>

        {sentTo ? (
          <div className="flex flex-col items-center py-4 text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-soft">
              <MailCheck size={26} className="text-success" />
            </span>
            <h1 className="mb-2 font-display text-2xl font-semibold text-navy">
              ¡Cuenta creada!
            </h1>
            <p className="mb-6 text-sm text-muted">
              Te enviamos un correo a <b className="text-navy">{sentTo}</b> para
              confirmar tu cuenta. Después descarga la app de Tumantenimiento,
              inicia sesión y completa tu alta: INE, carta de antecedentes no
              penales y comprobante de domicilio.
            </p>
            <PrimaryButton href="/">Volver al inicio</PrimaryButton>
          </div>
        ) : (
          <>
            <h1 className="mb-1 font-display text-2xl font-semibold text-navy">
              Regístrate como técnico
            </h1>
            <p className="mb-7 text-sm text-muted">
              Crea tu cuenta y termina tu alta desde la app.
            </p>
            {invite && (
              <p className="-mt-4 mb-6 rounded-xl bg-success-soft px-3.5 py-2.5 text-xs text-success">
                Registro con invitación · código <b>{invite}</b>
              </p>
            )}

            <form onSubmit={submit} noValidate className="flex flex-col gap-5">
              <div>
                <label htmlFor="rt-name" className={label}>
                  Nombre completo
                </label>
                <div className={field(!!errors.name)}>
                  <User size={16} className="ml-3 shrink-0 text-faint" />
                  <input
                    id="rt-name"
                    autoComplete="name"
                    placeholder="Ramón Hernández García"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'rt-name-error' : undefined}
                    className={input}
                  />
                </div>
                {err('rt-name-error', errors.name)}
              </div>

              <div>
                <label htmlFor="rt-email" className={label}>
                  Correo electrónico
                </label>
                <div className={field(!!errors.email)}>
                  <Mail size={16} className="ml-3 shrink-0 text-faint" />
                  <input
                    id="rt-email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    aria-invalid={!!errors.email}
                    aria-describedby={
                      errors.email ? 'rt-email-error' : undefined
                    }
                    className={input}
                  />
                </div>
                {err('rt-email-error', errors.email)}
              </div>

              <div>
                <label htmlFor="rt-phone" className={label}>
                  Número de celular
                </label>
                <div className={field(!!errors.phone)}>
                  <Smartphone size={16} className="ml-3 shrink-0 text-faint" />
                  <select
                    aria-label="Lada del país"
                    value={countryIso}
                    onChange={e => setCountryIso(e.target.value)}
                    className="ml-2 cursor-pointer border-r border-line bg-transparent py-2.5 pr-2 text-sm text-navy outline-none"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.iso} value={c.iso}>
                        {c.flag} {c.iso} +{c.dial}
                      </option>
                    ))}
                  </select>
                  <input
                    id="rt-phone"
                    type="tel"
                    autoComplete="tel-national"
                    placeholder={country.mask.replace(/#/g, '0')}
                    value={formatNational(national, country)}
                    onChange={e => setNational(e.target.value)}
                    aria-invalid={!!errors.phone}
                    aria-describedby={
                      errors.phone ? 'rt-phone-error' : undefined
                    }
                    className={input}
                  />
                </div>
                {err('rt-phone-error', errors.phone)}
              </div>

              <div>
                <label htmlFor="rt-pass" className={label}>
                  Contraseña
                </label>
                <div className={field(!!errors.pass)}>
                  <Lock size={16} className="ml-3 shrink-0 text-faint" />
                  <input
                    id="rt-pass"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Mínimo 8 caracteres"
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    aria-invalid={!!errors.pass}
                    aria-describedby={errors.pass ? 'rt-pass-error' : undefined}
                    className={input}
                  />
                </div>
                {err('rt-pass-error', errors.pass)}
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-2.5 text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={terms}
                    onChange={e => setTerms(e.target.checked)}
                    aria-describedby={
                      errors.terms ? 'rt-terms-error' : undefined
                    }
                    className="mt-0.5 h-4 w-4 accent-[#0A6BCF]"
                  />
                  Acepto los Términos y el Aviso de Privacidad de
                  Tumantenimiento.
                </label>
                {err('rt-terms-error', errors.terms)}
              </div>

              {authError && (
                <p
                  role="alert"
                  className="rounded-xl bg-error-soft px-3.5 py-2.5 text-xs text-error"
                >
                  {authError}
                </p>
              )}

              <PrimaryButton type="submit" loading={loading}>
                Crear cuenta de técnico
              </PrimaryButton>
            </form>
          </>
        )}
      </FadeIn>
    </div>
  );
}
