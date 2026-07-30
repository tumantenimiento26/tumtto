'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  MapPin,
  TrendingUp,
  Clock,
  MailCheck,
  ArrowLeft,
} from 'lucide-react';
import { FadeIn, Stagger, StaggerItem, AnimatePresence, motion, EASE } from '@/components/motion';
import { PrimaryButton, BrandMark } from '@/components/ui';

/** Splash de entrada al panel: puente de marca entre el login y la consola. */
function Splash() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 overflow-hidden bg-[#081A33]"
    >
      <div className="pointer-events-none absolute -left-[140px] -top-[200px] h-[620px] w-[620px] animate-[aur-a_22s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(10,107,207,0.5),transparent_65%)] blur-[70px] motion-reduce:animate-none" />
      <div className="pointer-events-none absolute -bottom-[240px] -right-[160px] h-[560px] w-[560px] animate-[aur-b_26s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(24,193,255,0.28),transparent_65%)] blur-[80px] motion-reduce:animate-none" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.75)_1px,transparent_1px)] opacity-[0.06] [background-size:26px_26px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
        className="relative flex flex-col items-center gap-5"
      >
        <BrandMark size={76} className="rounded-[18px] shadow-[0_16px_48px_rgba(24,193,255,0.35)]" />
        <span className="font-display text-[26px] font-extrabold tracking-[-0.4px] text-white">Tumantenimiento</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="relative flex flex-col items-center gap-3.5"
      >
        <div className="h-1 w-44 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="bg-grad-progress h-full rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.1, ease: 'easeInOut', delay: 0.35 }}
          />
        </div>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/45">Entrando al panel…</span>
      </motion.div>
    </motion.div>
  );
}

const STATS = [
  { num: '147', label: 'Órdenes en curso', delta: '+18% vs ayer', icon: TrendingUp, tone: 'text-cyan' },
  { num: '89', label: 'Técnicos en línea', delta: 'en vivo', icon: null, tone: 'text-cyan' },
  { num: '4', label: 'Verificaciones por revisar', delta: 'pendiente', icon: Clock, tone: 'text-warning' },
];

const EMAIL_RE = /\S+@\S+\.\S+/;

// ponytail: credencial dummy hardcodeada — sustituir por Supabase Auth cuando
// haya backend. El flag en localStorage es lo que AdminGate revisa.
const DEMO_EMAIL = 'admin@tumantenimiento.mx';
const DEMO_PASS = 'tumtto2026';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; pass?: string }>({});
  const [authError, setAuthError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Con el dashboard precargado, el splash aterriza sin pantalla en blanco.
  useEffect(() => { router.prefetch('/dashboard'); }, [router]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!EMAIL_RE.test(email)) errs.email = 'Ingresa un correo válido.';
    if (!pass) errs.pass = 'Ingresa tu contraseña.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (email.trim().toLowerCase() !== DEMO_EMAIL || pass !== DEMO_PASS) {
      setAuthError(true);
      return;
    }
    setLoading(true);
    localStorage.setItem('tumtto-admin', '1');
    // ponytail: el splash es puramente presentacional — 1.6s y adentro
    setTimeout(() => router.push('/dashboard'), 1600);
  }

  const field = (invalid: boolean) =>
    `flex items-center rounded-xl border bg-surface-2 transition-all focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(10,107,207,0.15)] ${
      invalid ? 'border-error' : 'border-line'
    }`;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#081A33] flex flex-col items-center justify-center gap-5 p-4 sm:p-6">
      {/* Fondo de marca — mismas auroras y retícula que la landing */}
      <div className="pointer-events-none absolute -left-[140px] -top-[200px] h-[620px] w-[620px] animate-[aur-a_22s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(10,107,207,0.5),transparent_65%)] blur-[70px] motion-reduce:animate-none" />
      <div className="pointer-events-none absolute -bottom-[240px] -right-[160px] h-[560px] w-[560px] animate-[aur-b_26s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(24,193,255,0.28),transparent_65%)] blur-[80px] motion-reduce:animate-none" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.75)_1px,transparent_1px)] opacity-[0.06] [background-size:26px_26px]" />

      <FadeIn className="relative w-full max-w-[1080px] grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] rounded-[20px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        {/* Panel de marca */}
        <div className="relative hidden lg:flex flex-col justify-between bg-grad-brand p-10 text-white overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.15] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-cyan/20 blur-3xl pointer-events-none" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <BrandMark size={36} className="rounded-xl shadow-card" />
              <span className="font-display text-lg font-semibold tracking-tight">Tumantenimiento</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono bg-white/10 rounded-full px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              PROD · MX
            </div>
          </div>

          <div className="relative">
            <div className="text-xs font-mono tracking-[0.18em] text-cyan/90 mb-3">PLATAFORMA INTERNA</div>
            <h2 className="font-display text-3xl font-semibold leading-tight mb-3">Panel de administración</h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm mb-8">
              Operación, soporte y configuración de la plataforma. Mantén la red de técnicos verificados moviéndose.
            </p>

            <Stagger className="grid grid-cols-3 gap-3" gap={0.08}>
              {STATS.map((s) => (
                <StaggerItem key={s.label}>
                  <div className="rounded-xl bg-white/10 border border-white/10 p-3.5">
                    <div className={`font-display text-2xl font-semibold ${s.num === '4' ? 'text-warning' : ''}`}>{s.num}</div>
                    <div className="text-[11px] text-white/60 leading-tight mt-1 mb-2">{s.label}</div>
                    <div className={`flex items-center gap-1 text-[10px] ${s.tone}`}>
                      {s.icon ? <s.icon size={11} /> : <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse" />}
                      <span>{s.delta}</span>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <div className="relative flex flex-col gap-2 text-xs text-white/60">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-cyan" />
              <span>Sesión cifrada · TLS 1.3</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-cyan" />
              <span>Operando en la ZMG · Guadalajara, Jal.</span>
            </div>
          </div>
        </div>

        {/* Panel de acceso */}
        <div className="bg-surface p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6 flex items-center justify-between">
            {/* En móvil el panel de marca no existe: el logo vive aquí */}
            <div className="flex items-center gap-2 lg:hidden">
              <BrandMark size={28} className="rounded-lg" />
              <span className="font-display text-[15px] font-bold text-navy">Tumantenimiento</span>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-navy transition-colors"
            >
              <ArrowLeft size={13} />
              Volver al sitio
            </Link>
          </div>

          <h1 className="font-display text-2xl font-semibold text-navy mb-1">Iniciar sesión</h1>
          <p className="text-sm text-muted mb-7">Acceso exclusivo para el equipo administrador.</p>

          <form onSubmit={submit} noValidate className="flex flex-col gap-5">
            <div>
              <label htmlFor="login-email" className="block text-xs font-medium text-navy mb-1.5">
                Correo electrónico
              </label>
              <div className={field(!!errors.email)}>
                <Mail size={16} className="text-faint ml-3 shrink-0" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="admin@tumantenimiento.mx"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setAuthError(false);
                    if (errors.email) setErrors((er) => ({ ...er, email: undefined }));
                  }}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'login-email-error' : undefined}
                  className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-sm text-navy outline-none placeholder:text-faint"
                />
              </div>
              {errors.email && (
                <p id="login-email-error" className="mt-1.5 text-xs text-error">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <label htmlFor="login-pass" className="text-xs font-medium text-navy">Contraseña</label>
                <button
                  type="button"
                  onClick={() => setForgotSent(true)}
                  className="text-xs text-primary hover:text-primary-2"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className={field(!!errors.pass)}>
                <Lock size={16} className="text-faint ml-3 shrink-0" />
                <input
                  id="login-pass"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Tu contraseña"
                  value={pass}
                  onChange={(e) => {
                    setPass(e.target.value);
                    setAuthError(false);
                    if (errors.pass) setErrors((er) => ({ ...er, pass: undefined }));
                  }}
                  aria-invalid={!!errors.pass}
                  aria-describedby={errors.pass ? 'login-pass-error' : undefined}
                  className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-sm text-navy outline-none placeholder:text-faint"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="px-3 text-muted hover:text-navy"
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.pass && (
                <p id="login-pass-error" className="mt-1.5 text-xs text-error">{errors.pass}</p>
              )}
            </div>

            <AnimatePresence>
              {forgotSent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-2 rounded-xl bg-success-soft px-3.5 py-2.5 text-xs text-muted">
                    <MailCheck size={14} className="text-success mt-0.5 shrink-0" />
                    <span>
                      Enviado. Si <b className="text-navy font-semibold">{email || 'tu correo'}</b> está registrado como cuenta admin,
                      recibirás un enlace de recuperación en los próximos minutos. Caduca a los 30 minutos.
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {authError && (
              <div role="alert" className="rounded-xl bg-error-soft px-3.5 py-2.5 text-xs font-medium text-error">
                Correo o contraseña incorrectos.
              </div>
            )}

            <PrimaryButton type="submit" loading={loading} className="w-full">
              {loading ? 'Entrando…' : 'Entrar al panel'}
            </PrimaryButton>
          </form>

          <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-dashed border-line bg-surface-2/60 px-3.5 py-2.5 text-xs text-muted">
            <span>
              Demo: <b className="font-semibold text-navy">{DEMO_EMAIL}</b> · <b className="font-semibold text-navy">{DEMO_PASS}</b>
            </span>
            <button
              type="button"
              onClick={() => { setEmail(DEMO_EMAIL); setPass(DEMO_PASS); setErrors({}); setAuthError(false); }}
              className="shrink-0 font-medium text-primary hover:text-primary-2"
            >
              Rellenar
            </button>
          </div>

          <p className="text-[11px] text-faint leading-relaxed mt-6">
            Acceso restringido a personal autorizado. Todas las sesiones son auditadas y registradas conforme a la
            política de seguridad de Tumantenimiento.
          </p>
        </div>
      </FadeIn>

      <p className="relative font-mono text-[10.5px] tracking-[0.1em] text-white/30">
        © 2026 TUMANTENIMIENTO · HECHO EN LA ZMG
      </p>

      <AnimatePresence>{loading && <Splash />}</AnimatePresence>
    </div>
  );
}
