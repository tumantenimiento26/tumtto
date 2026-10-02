'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  MailCheck,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { Button, Field, Input, Kicker } from '@/components/ds';
import { AsideReview, AuthShell } from '@/components/auth-shell';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { APP_STORE_URL, PLAY_STORE_URL, schemeUrl } from '@/lib/appLinks';
import {
  EMAIL_RE,
  failureMessage,
  firstName,
  lockSecondsLeft,
  registerFailure,
  type LockState,
} from '@/lib/authForms';

// Login unificado (handoff web A2). Staff → verificación en dos pasos (MFA
// TOTP real de Supabase) → consola. Clientes y técnicos → "continúa en la
// app" (la web solo opera la consola).

type Step = 'login' | 'mfa' | 'enroll' | 'app' | 'forgot' | 'sent' | 'redirect';

/** Traduce el error de Supabase Auth; el genérico sólo cubre lo que no reconocemos. */
function authMessage(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes('invalid login credentials'))
    return 'Correo o contraseña incorrectos.';
  if (m.includes('email not confirmed'))
    return 'Tu correo aún no está confirmado. Revisa tu bandeja.';
  if (m.includes('too many requests') || m.includes('rate limit'))
    return 'Demasiados intentos. Espera un minuto e inténtalo de nuevo.';
  if (m.includes('fetch') || m.includes('network'))
    return 'No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.';
  return 'No pudimos iniciar sesión. Inténtalo de nuevo.';
}

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

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signOut } = useAuth();
  const [step, setStep] = useState<Step>('login');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; pass?: string }>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(0);
  const [lock, setLock] = useState<LockState>({ attempts: 0, lockUntil: 0 });
  const [now, setNow] = useState(() => Date.now());
  const [signedOut, setSignedOut] = useState(false);
  const [appUser, setAppUser] = useState<{ name: string; role: string }>({
    name: '',
    role: 'cliente',
  });

  useEffect(() => {
    // Invitaciones de admin y enlaces de recuperación (implicit flow) aterrizan
    // aquí con #access_token…&type=invite|recovery: la contraseña se fija en
    // /restablecer, que toma la sesión del hash. Recarga completa para que el
    // cliente de Supabase procese el hash en esa página.
    const { hash } = window.location;
    if (/type=(invite|recovery|magiclink)/.test(hash)) {
      window.location.replace(`/restablecer${hash}`);
      return;
    }
    const qs = new URLSearchParams(window.location.search);
    setSignedOut(qs.has('out'));
    router.prefetch('/dashboard');
    // La consola manda aquí (?mfa=1) a un admin con verificación en 2 pasos
    // activada que aún no la cumplió en esta sesión: seguimos en el código.
    if (qs.has('mfa'))
      void supabase.auth.getSession().then(({ data }) => {
        if (data.session) void routeAfterSignIn();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Reloj del bloqueo (solo mientras dura).
  const lockLeft = lockSecondsLeft(lock, now);
  useEffect(() => {
    if (!lock.lockUntil || lockLeft === 0) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [lock.lockUntil, lockLeft]);

  const fail = (msg: string | null) => {
    setLoading(false);
    setAuthError(msg);
    setShake(s => s + 1);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (lockSecondsLeft(lock, Date.now()) > 0) return;
    const errs: typeof errors = {};
    if (!EMAIL_RE.test(email)) errs.email = 'Ingresa un correo válido.';
    if (!pass) errs.pass = 'Ingresa tu contraseña.';
    setErrors(errs);
    if (Object.keys(errs).length) return fail(null);

    setLoading(true);
    setAuthError(null);
    setSignedOut(false);
    const { error } = await signIn(email.trim(), pass);
    if (error) {
      if (/invalid login credentials/i.test(error)) {
        const t = Date.now();
        const next = registerFailure(lock, t);
        setLock(next);
        setNow(t);
        return fail(failureMessage(next, t));
      }
      return fail(authMessage(error));
    }
    setLock({ attempts: 0, lockUntil: 0 });
    await routeAfterSignIn();
  }

  /** Staff → MFA/consola; clientes y técnicos → la app. */
  async function routeAfterSignIn() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return fail('No pudimos iniciar sesión. Inténtalo de nuevo.');
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .maybeSingle();
    if (error)
      return fail(
        'No pudimos cargar tu cuenta. Verifica tu conexión e inténtalo de nuevo.',
      );

    if (profile?.role !== 'admin') {
      setAppUser({
        name: firstName(profile?.full_name, email),
        role: profile?.role === 'technician' ? 'técnico' : 'cliente',
      });
      // La web solo opera la consola: no dejamos la sesión abierta aquí.
      await signOut();
      setLoading(false);
      setStep('app');
      return;
    }

    const { data: aal } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel === 'aal2') return enterConsole();
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const verified = factors?.totp?.[0];
    setLoading(false);
    if (verified) {
      setFactorId(verified.id);
      setStep('mfa');
    } else {
      setStep('enroll');
    }
  }

  function enterConsole() {
    setLoading(false);
    setStep('redirect');
    // ponytail: el splash es un puente de marca; el dashboard ya está precargado.
    setTimeout(() => router.replace('/dashboard'), 900);
  }

  // ── Verificación en dos pasos ────────────────────────────────────────────
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [codeErr, setCodeErr] = useState<string | null>(null);
  const [showBackup, setShowBackup] = useState(false);

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      setCodeErr('El código tiene 6 dígitos.');
      setShake(s => s + 1);
      return;
    }
    if (!factorId) return;
    setLoading(true);
    setCodeErr(null);
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code,
    });
    if (error) {
      setLoading(false);
      setCode('');
      setShake(s => s + 1);
      setCodeErr(
        /invalid|expired/i.test(error.message)
          ? 'Código incorrecto. Revisa la hora de tu dispositivo.'
          : 'No pudimos verificar el código. Inténtalo de nuevo.',
      );
      return;
    }
    enterConsole();
  }

  // Alta del autenticador (admins sin factor TOTP todavía).
  const [enroll, setEnroll] = useState<{ qr: string; secret: string } | null>(
    null,
  );
  const [enrollBusy, setEnrollBusy] = useState(false);

  async function startEnroll() {
    setEnrollBusy(true);
    setCodeErr(null);
    // Un intento anterior sin terminar deja un factor "unverified" que choca
    // con el nombre; se limpia antes de enrolar de nuevo.
    const { data: list } = await supabase.auth.mfa.listFactors();
    for (const f of list?.all ?? [])
      if (f.status === 'unverified')
        await supabase.auth.mfa.unenroll({ factorId: f.id });
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Consola Tumantenimiento',
    });
    setEnrollBusy(false);
    if (error || !data) {
      setCodeErr('No pudimos generar el código QR. Inténtalo de nuevo.');
      return;
    }
    setFactorId(data.id);
    setEnroll({ qr: data.totp.qr_code, secret: data.totp.secret });
  }

  // ── Recuperar contraseña ─────────────────────────────────────────────────
  const [resetBusy, setResetBusy] = useState(false);
  const [resent, setResent] = useState(false);

  async function sendReset(e?: React.FormEvent, again = false) {
    e?.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setErrors({ email: 'Ingresa un correo válido.' });
      setShake(s => s + 1);
      return;
    }
    setResetBusy(true);
    setAuthError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/restablecer`,
    });
    setResetBusy(false);
    if (error) {
      setAuthError(authMessage(error.message));
      return;
    }
    if (again) setResent(true);
    setStep('sent');
  }

  const back = (to: Step = 'login') => {
    setStep(to);
    setErrors({});
    setAuthError(null);
    setCodeErr(null);
    setCode('');
    setEnroll(null);
  };
  const switchAccount = async () => {
    await signOut();
    setPass('');
    back('login');
  };

  const shakeCls = shake ? 'animate-shake' : '';

  return (
    <AuthShell aside={{ ...ASIDE, children: <AsideReview /> }}>
      {step === 'login' && (
        <div className="animate-up">
          {signedOut && (
            <p
              role="status"
              className="mb-5 flex items-center gap-2 rounded-box bg-success-soft px-3.5 py-2.5 text-[13px] font-semibold text-success"
            >
              <LogOut size={15} aria-hidden />
              Cerraste sesión. Vuelve cuando quieras.
            </p>
          )}
          <h1 className={H1}>Inicia sesión</h1>
          <p className="mt-1 text-[14.5px] text-muted">
            Clientes, técnicos y equipo de Tumantenimiento.
          </p>

          <form
            onSubmit={submit}
            noValidate
            className="mt-6 flex flex-col gap-4"
          >
            <Input
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              autoFocus
              icon={Mail}
              placeholder="tu@correo.com"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setAuthError(null);
                if (errors.email)
                  setErrors(er => ({ ...er, email: undefined }));
              }}
              error={errors.email}
              wrapperClassName="h-12"
            />

            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <label
                  htmlFor="login-pass"
                  className="text-[12.5px] font-semibold text-navy"
                >
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => back('forgot')}
                  className="text-[13px] font-semibold text-primary hover:underline"
                >
                  ¿La olvidaste?
                </button>
              </div>
              <Input
                id="login-pass"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                icon={Lock}
                placeholder="Tu contraseña"
                value={pass}
                onChange={e => {
                  setPass(e.target.value);
                  setAuthError(null);
                  if (errors.pass)
                    setErrors(er => ({ ...er, pass: undefined }));
                }}
                error={!!errors.pass}
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
              {errors.pass && (
                <p role="alert" className="mt-1.5 text-[12px] text-error">
                  {errors.pass}
                </p>
              )}
            </div>

            {(authError || lockLeft > 0) && (
              <div
                role="alert"
                className="rounded-box border border-error-line bg-error-soft px-3.5 py-2.5 text-[13px] font-medium text-error"
              >
                {lockLeft > 0 ? failureMessage(lock, now) : authError}
              </div>
            )}

            <div key={`s-${shake}`} className={shakeCls}>
              <Button
                type="submit"
                size="lg"
                full
                loading={loading}
                disabled={lockLeft > 0}
              >
                {loading
                  ? 'Verificando…'
                  : lockLeft > 0
                    ? `Bloqueado · ${lockLeft} s`
                    : 'Iniciar sesión'}
              </Button>
            </div>
          </form>

          <div className="my-6 flex items-center gap-3 text-[12.5px] text-faint">
            <span className="h-px flex-1 bg-divider" />
            ¿Eres técnico y no tienes cuenta?
            <span className="h-px flex-1 bg-divider" />
          </div>
          <Button variant="secondary" size="lg" full href="/registro-tecnico">
            Regístrate como técnico
          </Button>
        </div>
      )}

      {step === 'mfa' && (
        <div className="animate-up">
          <BackLink onClick={() => void switchAccount()} />
          <Kicker className="mt-5">Consola de operación</Kicker>
          <h1 className={`mt-2 ${H1}`}>Verificación en dos pasos</h1>
          <p className="mt-1.5 text-[14.5px] text-muted">
            Escribe el código de 6 dígitos de tu app autenticadora para{' '}
            <b className="text-navy">{email.trim()}</b>.
          </p>
          <form onSubmit={verifyCode} noValidate className="mt-6">
            <CodeInput
              value={code}
              onChange={v => {
                setCode(v);
                setCodeErr(null);
              }}
              error={codeErr}
            />
            <div key={`s-${shake}`} className={`mt-4 ${shakeCls}`}>
              <Button type="submit" size="lg" full loading={loading}>
                {loading ? 'Verificando…' : 'Entrar a la consola'}
              </Button>
            </div>
          </form>
          <p className="mt-5 text-center text-[13.5px] text-muted">
            ¿Perdiste tu dispositivo?{' '}
            <button
              type="button"
              onClick={() => setShowBackup(s => !s)}
              className="font-semibold text-primary hover:underline"
            >
              Usa un código de respaldo
            </button>
          </p>
          {showBackup && (
            // ponytail: Supabase no emite códigos de respaldo; la recuperación
            // es que otro admin restablezca el factor desde el dashboard.
            <p className="mt-3 rounded-box bg-info-soft px-3.5 py-2.5 text-[13px] text-body">
              Por ahora no hay códigos de respaldo. Pide a otro administrador
              que restablezca tu verificación en dos pasos y vuelve a
              configurarla.
            </p>
          )}
        </div>
      )}

      {step === 'enroll' && (
        <div className="animate-up">
          <BackLink onClick={() => void switchAccount()} />
          <Kicker className="mt-5">Consola de operación</Kicker>
          <h1 className={`mt-2 ${H1}`}>Activa la verificación en dos pasos</h1>
          {!enroll ? (
            <>
              <p className="mt-1.5 text-[14.5px] text-muted">
                La consola exige verificación en dos pasos. Configura tu app
                autenticadora (Google Authenticator, 1Password, Authy); toma un
                minuto y solo se hace una vez.
              </p>
              {codeErr && <ErrorBox>{codeErr}</ErrorBox>}
              <div className="mt-6 flex flex-col gap-3">
                <Button
                  size="lg"
                  full
                  icon={ShieldCheck}
                  loading={enrollBusy}
                  onClick={() => void startEnroll()}
                >
                  Configurar ahora
                </Button>
              </div>
            </>
          ) : (
            <form onSubmit={verifyCode} noValidate className="mt-5">
              <p className="text-[14.5px] text-muted">
                Escanea el código con tu app y escribe los 6 dígitos que
                aparecen.
              </p>
              <div className="mt-4 flex items-center gap-4 rounded-box border border-line bg-panel p-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- data URI SVG de Supabase */}
                <img
                  src={enroll.qr}
                  alt="Código QR para tu app autenticadora"
                  width={132}
                  height={132}
                  className="rounded-[8px] bg-card p-1.5"
                />
                <div className="min-w-0">
                  <p className="text-[12.5px] text-muted">
                    ¿No puedes escanear? Escribe esta clave:
                  </p>
                  <p className="mt-1 break-all font-mono text-[13px] font-semibold text-navy">
                    {enroll.secret}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <CodeInput
                  value={code}
                  onChange={v => {
                    setCode(v);
                    setCodeErr(null);
                  }}
                  error={codeErr}
                />
              </div>
              <div key={`s-${shake}`} className={`mt-4 ${shakeCls}`}>
                <Button type="submit" size="lg" full loading={loading}>
                  {loading ? 'Verificando…' : 'Activar y entrar'}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {step === 'app' && (
        <div className="animate-up text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-box bg-info-soft text-primary">
            <Smartphone size={28} aria-hidden />
          </span>
          <h1 className={`mt-5 ${H1}`}>
            {appUser.name ? `Hola, ${appUser.name}` : 'Continúa en la app'}
          </h1>
          <p className="mx-auto mt-2 max-w-[360px] text-[14.5px] leading-relaxed text-muted">
            Tu cuenta de {appUser.role} se usa desde la app de Tumantenimiento.{' '}
            {appUser.role === 'técnico'
              ? 'Ahí recibes solicitudes, cotizas y cobras.'
              : 'Ahí solicitas, sigues y pagas tus servicios.'}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <StoreButton href={APP_STORE_URL} label="App Store" />
            <StoreButton href={PLAY_STORE_URL} label="Google Play" />
          </div>
          {/* ponytail: sin librería de QR instalada; el enlace abre la app en
              el celular. Con tiendas publicadas se puede generar el QR. */}
          <a
            href={schemeUrl('')}
            className="mt-3 flex items-center gap-3 rounded-box bg-panel p-4 text-left transition-colors hover:bg-segment"
          >
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[8px] border border-line bg-card font-mono text-[11px] text-faint">
              APP
            </span>
            <span className="text-[13.5px] text-body">
              ¿Estás en tu celular? Toca aquí para abrir la app de
              Tumantenimiento.
            </span>
          </a>
          <button
            type="button"
            onClick={() => void switchAccount()}
            className="mt-5 font-display text-[14.5px] font-bold text-primary hover:underline"
          >
            Usar otra cuenta
          </button>
        </div>
      )}

      {step === 'forgot' && (
        <div className="animate-up">
          <BackLink onClick={() => back('login')} />
          <h1 className={`mt-5 ${H1}`}>Recupera tu contraseña</h1>
          <p className="mt-1.5 text-[14.5px] text-muted">
            Te enviaremos un enlace para crear una nueva.
          </p>
          <form
            onSubmit={e => void sendReset(e)}
            noValidate
            className="mt-6 flex flex-col gap-4"
          >
            <Input
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              autoFocus
              icon={Mail}
              placeholder="tu@correo.com"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setErrors({});
                setAuthError(null);
              }}
              error={errors.email}
              wrapperClassName="h-12"
            />
            {authError && <ErrorBox>{authError}</ErrorBox>}
            <div key={`s-${shake}`} className={shakeCls}>
              <Button type="submit" size="lg" full loading={resetBusy}>
                {resetBusy ? 'Enviando…' : 'Enviar enlace'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {step === 'sent' && (
        <div className="animate-up">
          <span className="flex h-14 w-14 animate-pop items-center justify-center rounded-box bg-success-soft text-success">
            <MailCheck size={26} aria-hidden />
          </span>
          <h1 className={`mt-5 ${H1}`}>Revisa tu correo</h1>
          <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">
            Si <b className="text-navy">{email.trim()}</b> tiene una cuenta, te
            llegará un enlace para crear una contraseña nueva. Caduca pronto y
            sirve una sola vez.
          </p>
          {authError && <ErrorBox>{authError}</ErrorBox>}
          <Button
            size="lg"
            full
            className="mt-6"
            variant="secondary"
            onClick={() => back('login')}
          >
            Volver a iniciar sesión
          </Button>
          <p className="mt-4 text-center text-[13.5px] text-muted">
            ¿No llegó?{' '}
            {resent ? (
              <span className="font-semibold text-success">
                Enlace reenviado
              </span>
            ) : (
              <button
                type="button"
                disabled={resetBusy}
                onClick={() => void sendReset(undefined, true)}
                className="font-semibold text-primary hover:underline disabled:opacity-60"
              >
                {resetBusy ? 'Reenviando…' : 'Reenviar enlace'}
              </button>
            )}
          </p>
        </div>
      )}

      {step === 'redirect' && (
        <div
          className="flex animate-up flex-col items-center py-10 text-center"
          role="status"
        >
          <span className="relative flex h-16 w-16 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/20 motion-reduce:hidden" />
            <KeyRound size={28} className="relative text-primary" aria-hidden />
          </span>
          <h1 className="mt-5 font-display text-[22px] font-extrabold text-navy">
            Entrando a la consola…
          </h1>
          <p className="mt-1 text-[14px] text-muted">
            Cargando operación de la ZMG
          </p>
          <div className="mt-5 h-1 w-44 overflow-hidden rounded-full bg-segment">
            <div className="h-full w-1/3 animate-indet rounded-full bg-primary" />
          </div>
        </div>
      )}
    </AuthShell>
  );
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 font-display text-[14px] font-bold text-primary hover:underline"
    >
      <ChevronLeft size={16} aria-hidden />
      Atrás
    </button>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="mt-4 rounded-box border border-error-line bg-error-soft px-3.5 py-2.5 text-[13px] font-medium text-error"
    >
      {children}
    </p>
  );
}

/** Campo de código TOTP de 6 dígitos (mono 24px, espaciado .3em). */
function CodeInput({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error: string | null;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <Field error={error}>
      <input
        ref={ref}
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-label="Código de verificación"
        placeholder="000 000"
        maxLength={7}
        value={
          value.length > 3 ? `${value.slice(0, 3)} ${value.slice(3)}` : value
        }
        onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        aria-invalid={!!error || undefined}
        className={`h-[60px] w-full rounded-btn border bg-card text-center font-mono text-[24px] tracking-[0.3em] text-navy outline-none transition-[border-color,box-shadow] placeholder:text-faint focus:border-primary focus:shadow-focus ${
          error ? 'border-error' : 'border-line'
        }`}
      />
    </Field>
  );
}

function StoreButton({ href, label }: { href: string; label: string }) {
  if (!href)
    return (
      <span
        className="flex h-12 flex-col items-center justify-center rounded-btn bg-action/60 font-display text-[14px] font-bold text-white"
        title="Muy pronto en tiendas"
      >
        {label}
        <span className="font-sans text-[10.5px] font-medium opacity-80">
          Muy pronto
        </span>
      </span>
    );
  return (
    <Link
      href={href}
      className="flex h-12 items-center justify-center rounded-btn bg-action font-display text-[14px] font-bold text-white transition-colors hover:bg-action-hover"
    >
      {label}
    </Link>
  );
}
