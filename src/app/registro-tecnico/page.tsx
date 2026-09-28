'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Eye, EyeOff, Mail, User } from 'lucide-react';
import { Button, Checkbox, Field, Input } from '@/components/ds';
import { AsideSteps, AuthShell, StrengthMeter } from '@/components/auth-shell';
import { supabase } from '@/lib/supabase';
import { DEFAULT_COUNTRY, isValidPhone, toE164 } from '@/lib/phone';
import { APP_STORE_URL, PLAY_STORE_URL } from '@/lib/appLinks';
import {
  EMAIL_RE,
  SCORE_LABEL,
  formatMxPhone,
  passwordError,
  passwordScore,
} from '@/lib/authForms';

// Registro público de técnicos (handoff web B): 3 pasos (datos · oficio ·
// seguridad). Crea la cuenta con el mismo `requested_role` que la app y manda
// a la app a completar el alta (INE, antecedentes, domicilio).

type Errors = Partial<
  Record<'name' | 'email' | 'phone' | 'cats' | 'pass' | 'terms', string>
>;

/** Oficios del paso 2 → slug del catálogo (service_categories.slug). */
const OFICIOS: { label: string; slug: string }[] = [
  { label: 'Plomería', slug: 'plumbing' },
  { label: 'Electricidad', slug: 'electrical' },
  { label: 'Gas', slug: 'gas' },
  { label: 'Aire acondicionado', slug: 'ac' },
  { label: 'Línea blanca', slug: 'appliances' },
  { label: 'Cerrajería', slug: 'locks' },
  { label: 'Herrería', slug: 'ironwork' },
  { label: 'Pintura', slug: 'painting' },
];
const ZONAS = ['Guadalajara', 'Zapopan', 'Tlaquepaque', 'Tonalá', 'Tlajomulco'];
const WIZ = ['01 · Tus datos', '02 · Tu oficio', '03 · Seguridad'];
const DOCS = [
  'INE vigente por ambos lados',
  'Carta de antecedentes no penales',
  'Comprobante de domicilio',
  'CLABE para tus cobros',
];

function signUpMessage(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes('already registered') || m.includes('already exists'))
    return 'Ese correo ya tiene una cuenta. Inicia sesión desde la app o recupera tu contraseña.';
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Demasiados intentos. Espera un minuto e inténtalo de nuevo.';
  if (m.includes('fetch') || m.includes('network'))
    return 'No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.';
  return 'No pudimos crear tu cuenta. Inténtalo de nuevo.';
}

export default function RegistroTecnicoPage() {
  const [wstep, setWstep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState('');
  const [cats, setCats] = useState<string[]>([]);
  const [zona, setZona] = useState('Guadalajara');
  const [exp, setExp] = useState(5);
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [tried, setTried] = useState(false);
  const [shake, setShake] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resend, setResend] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  );
  // Código del enlace de invitación (/invitacion/CODIGO sin la app instalada).
  const [invite, setInvite] = useState<string | null>(null);
  useEffect(() => {
    setInvite(new URLSearchParams(window.location.search).get('invite'));
  }, []);

  // ponytail: lada fija MX (+52) como el diseño; la app sí ofrece otras.
  const phone = toE164(digits, DEFAULT_COUNTRY);

  function validate(): Errors {
    const e: Errors = {};
    if (name.trim().length < 3) e.name = 'Ingresa tu nombre completo.';
    if (!EMAIL_RE.test(email)) e.email = 'Ingresa un correo válido.';
    if (!isValidPhone(phone)) e.phone = 'Ingresa un celular de 10 dígitos.';
    if (cats.length === 0) e.cats = 'Elige al menos un servicio.';
    const pe = passwordError(pass);
    if (pe) e.pass = pe;
    if (!terms) e.terms = 'Debes aceptar los términos para continuar.';
    return e;
  }
  const STEP_KEYS: Record<1 | 2 | 3, (keyof Errors)[]> = {
    1: ['name', 'email', 'phone'],
    2: ['cats'],
    3: ['pass', 'terms'],
  };
  // Tras el primer intento, validación en vivo del paso actual.
  const live = tried ? validate() : {};
  const shown: Errors = tried
    ? Object.fromEntries(
        STEP_KEYS[wstep].filter(k => live[k]).map(k => [k, live[k]]),
      )
    : errors;

  async function next(e: React.FormEvent) {
    e.preventDefault();
    const all = validate();
    const stepErrs = Object.fromEntries(
      STEP_KEYS[wstep].filter(k => all[k]).map(k => [k, all[k]]),
    ) as Errors;
    if (Object.keys(stepErrs).length) {
      setErrors(stepErrs);
      setTried(true);
      setShake(s => s + 1);
      return;
    }
    setErrors({});
    setTried(false);
    if (wstep < 3) {
      setWstep((wstep + 1) as 2 | 3);
      return;
    }

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
          // ponytail: el backend aún no las consume; quedan en user_metadata
          // para precargar el alta en la app / revisión del admin.
          requested_categories: cats,
          municipality: zona,
          years_experience: exp,
          ...(invite ? { invite_code: invite } : {}),
        },
        // El correo de confirmación abre la app (App Link) o su respaldo web.
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      setShake(s => s + 1);
      return setAuthError(signUpMessage(error.message));
    }
    // Con confirmación de correo, Supabase no devuelve error para un correo ya
    // registrado (evita enumerar cuentas): llega un usuario sin identidades.
    if (data.user && data.user.identities?.length === 0) {
      setShake(s => s + 1);
      return setAuthError(
        'Ese correo ya tiene una cuenta. Inicia sesión desde la app o recupera tu contraseña.',
      );
    }
    // El alta sigue en la app; no dejamos una sesión de técnico en la consola.
    if (data.session) await supabase.auth.signOut();
    setSentTo(email.trim());
  }

  async function resendEmail() {
    if (!sentTo) return;
    setResend('sending');
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: sentTo,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setResend(error ? 'error' : 'sent');
  }

  const score = passwordScore(pass);
  const storeUrl = PLAY_STORE_URL || APP_STORE_URL;

  return (
    <AuthShell
      aside={{
        kicker: 'Para técnicos · ZMG',
        title: (
          <>
            Tu oficio. Tu agenda.
            <br />
            Tus ingresos.
          </>
        ),
        lead: 'Crea tu cuenta aquí y termina tu alta desde la app. Revisamos tu perfil en menos de 24 h hábiles.',
        bullets: [
          'Sin cuota de inscripción',
          'Cobras directo a tu CLABE',
          'Tú eliges zona, horario y servicios',
        ],
        children: <AsideSteps done={sentTo ? 1 : 0} />,
      }}
    >
      {sentTo ? (
        <div className="animate-up">
          <span className="flex h-14 w-14 animate-pop items-center justify-center rounded-box bg-success-soft text-success">
            <Check size={28} strokeWidth={2.6} aria-hidden />
          </span>
          <h1 className="mt-5 font-display text-[27px] font-extrabold tracking-[-0.6px] text-navy">
            ¡Cuenta creada!
          </h1>
          <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
            Te enviamos un correo a <b className="text-navy">{sentTo}</b> para
            confirmar tu cuenta. Después descarga la app, inicia sesión y
            completa tu alta.
          </p>
          <div className="mt-5 overflow-hidden rounded-box border border-line">
            <p className="border-b border-divider px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">
              Ten a la mano en la app
            </p>
            {DOCS.map((d, i) => (
              <div
                key={d}
                className="flex items-center gap-3 border-b border-divider px-4 py-3 last:border-0"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-info-soft font-mono text-[12px] font-semibold text-primary">
                  0{i + 1}
                </span>
                <span className="text-[14.5px] text-navy">{d}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {storeUrl ? (
              <Button size="lg" href={storeUrl}>
                Descargar la app
              </Button>
            ) : (
              <Button size="lg" disabled title="Muy pronto en tiendas">
                App muy pronto
              </Button>
            )}
            <Button size="lg" variant="secondary" href="/">
              Volver al inicio
            </Button>
          </div>
          <p className="mt-4 text-center text-[13.5px] text-muted">
            ¿No llegó el correo? Revisa spam o{' '}
            {resend === 'sent' ? (
              <span className="font-semibold text-success">
                correo reenviado
              </span>
            ) : (
              <button
                type="button"
                onClick={() => void resendEmail()}
                disabled={resend === 'sending'}
                className="font-semibold text-primary hover:underline disabled:opacity-60"
              >
                {resend === 'sending' ? 'reenviando…' : 'reenvíalo'}
              </button>
            )}
            .
          </p>
          {resend === 'error' && (
            <p
              role="alert"
              className="mt-2 text-center text-[12.5px] text-error"
            >
              No pudimos reenviarlo. Espera un minuto e inténtalo de nuevo.
            </p>
          )}
        </div>
      ) : (
        <div className="animate-up">
          <h1 className="font-display text-[27px] font-extrabold tracking-[-0.6px] text-navy">
            Regístrate como técnico
          </h1>
          <p className="mt-1 text-[14.5px] text-muted">
            Crea tu cuenta y termina tu alta desde la app.
          </p>

          {/* Pasos del formulario */}
          <div className="mt-5 grid grid-cols-3 gap-2" aria-label="Pasos">
            {WIZ.map((t, i) => (
              <div key={t}>
                <div
                  className={`h-[3px] rounded-full ${
                    i < wstep ? 'bg-primary' : 'bg-segment'
                  }`}
                />
                <p
                  className={`mt-1.5 font-mono text-[10.5px] ${
                    i + 1 === wstep ? 'text-primary' : 'text-faint'
                  }`}
                  aria-current={i + 1 === wstep ? 'step' : undefined}
                >
                  {t}
                </p>
              </div>
            ))}
          </div>

          {invite && (
            <p className="mt-4 rounded-box bg-success-soft px-3.5 py-2.5 text-[13px] text-success">
              Registro con invitación · código <b>{invite}</b>
            </p>
          )}

          <form onSubmit={next} noValidate className="mt-5 flex flex-col gap-4">
            {wstep === 1 && (
              <>
                <Input
                  label="Nombre completo"
                  autoComplete="name"
                  icon={User}
                  placeholder="Ramón Hernández García"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  error={shown.name}
                  wrapperClassName="h-12"
                />
                <Input
                  label="Correo electrónico"
                  type="email"
                  autoComplete="email"
                  icon={Mail}
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setAuthError(null);
                  }}
                  error={shown.email}
                  wrapperClassName="h-12"
                />
                <Input
                  label="Número de celular"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  prefix="MX +52"
                  placeholder="33 0000 0000"
                  value={formatMxPhone(digits)}
                  onChange={e =>
                    setDigits(e.target.value.replace(/\D/g, '').slice(0, 10))
                  }
                  error={shown.phone}
                  wrapperClassName="h-12"
                />
              </>
            )}

            {wstep === 2 && (
              <>
                <Field label="¿Qué servicios realizas?" error={shown.cats}>
                  <div className="flex flex-wrap gap-2" role="group">
                    {OFICIOS.map(o => {
                      const on = cats.includes(o.slug);
                      return (
                        <button
                          key={o.slug}
                          type="button"
                          aria-pressed={on}
                          onClick={() =>
                            setCats(c =>
                              on ? c.filter(x => x !== o.slug) : [...c, o.slug],
                            )
                          }
                          className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13.5px] font-semibold transition-colors ${
                            on
                              ? 'border-action bg-action text-white'
                              : 'border-line bg-card text-body hover:border-line-strong'
                          }`}
                        >
                          {on && <Check size={14} aria-hidden />}
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </Field>
                <Field label="Municipio donde trabajas">
                  <div className="flex flex-wrap gap-2" role="radiogroup">
                    {ZONAS.map(z => {
                      const on = zona === z;
                      return (
                        <button
                          key={z}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => setZona(z)}
                          className={`h-9 rounded-full border px-3.5 text-[13.5px] font-semibold transition-colors ${
                            on
                              ? 'border-primary bg-tint text-primary'
                              : 'border-line bg-card text-body hover:border-line-strong'
                          }`}
                        >
                          {z}
                        </button>
                      );
                    })}
                  </div>
                </Field>
                <Field
                  label="Años de experiencia"
                  htmlFor="rt-exp"
                  hint={`${exp} ${exp === 1 ? 'año' : 'años'}`}
                >
                  <input
                    id="rt-exp"
                    type="range"
                    min={0}
                    max={30}
                    value={exp}
                    onChange={e => setExp(+e.target.value)}
                    className="w-full accent-[var(--color-primary)]"
                  />
                </Field>
              </>
            )}

            {wstep === 3 && (
              <>
                <div>
                  <Input
                    label="Contraseña"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Mínimo 8 caracteres"
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    error={shown.pass}
                    hint="Al menos 8 caracteres, con una letra y un número."
                    wrapperClassName="h-12"
                    suffix={
                      <button
                        type="button"
                        onClick={() => setShowPass(s => !s)}
                        className="flex items-center text-muted hover:text-navy"
                        aria-label={
                          showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'
                        }
                      >
                        {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    }
                  />
                  <StrengthMeter score={score} />
                  {score > 0 && (
                    <p className="mt-1 text-right text-[11.5px] text-muted">
                      {SCORE_LABEL[score]}
                    </p>
                  )}
                </div>
                <div>
                  <Checkbox
                    checked={terms}
                    onChange={setTerms}
                    label={
                      <span className="text-[13.5px] text-body">
                        Acepto los{' '}
                        {/* ponytail: /terminos y /privacidad aún no existen */}
                        <b className="font-semibold text-navy">Términos</b> y el{' '}
                        <b className="font-semibold text-navy">
                          Aviso de Privacidad
                        </b>{' '}
                        de Tumantenimiento.
                      </span>
                    }
                  />
                  {shown.terms && (
                    <p role="alert" className="mt-1.5 text-[12px] text-error">
                      {shown.terms}
                    </p>
                  )}
                </div>
              </>
            )}

            {authError && (
              <p
                role="alert"
                className="rounded-box border border-error-line bg-error-soft px-3.5 py-2.5 text-[13px] font-medium text-error"
              >
                {authError}
              </p>
            )}

            <div
              key={`s-${shake}`}
              className={`flex gap-3 ${shake ? 'animate-shake' : ''}`}
            >
              {wstep > 1 && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    setWstep((wstep - 1) as 1 | 2);
                    setErrors({});
                    setTried(false);
                  }}
                >
                  Atrás
                </Button>
              )}
              <Button type="submit" size="lg" full loading={loading}>
                {loading
                  ? 'Creando tu cuenta…'
                  : wstep < 3
                    ? 'Continuar'
                    : 'Crear cuenta'}
              </Button>
            </div>
          </form>

          <p className="mt-5 text-center text-[13.5px] text-muted">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      )}
    </AuthShell>
  );
}
