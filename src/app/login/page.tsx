'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  MapPin,
  TrendingUp,
  Clock,
  Wrench,
  UserRound,
  Timer,
  RefreshCw,
  LifeBuoy,
  MailCheck,
} from 'lucide-react';
import { FadeIn, Stagger, StaggerItem, AnimatePresence, motion } from '@/components/motion';
import { PrimaryButton } from '@/components/ui';
import { Toasts, toast } from '@/components/toast';

function GoogleG({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2c-2 1.5-4.6 2.4-7.3 2.4-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.7 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.2 5.2C40.7 36 44 30.6 44 24c0-1.2-.1-2.4-.4-3.5z" />
    </svg>
  );
}

const STATS = [
  { num: '147', label: 'Órdenes en curso', delta: '+18% vs ayer', icon: TrendingUp, tone: 'text-cyan' },
  { num: '89', label: 'Técnicos en línea', delta: 'en vivo', icon: null, tone: 'text-cyan' },
  { num: '4', label: 'Verificaciones por revisar', delta: 'pendiente', icon: Clock, tone: 'text-warning' },
];

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setStep('mfa');
  }

  return (
    <div className="min-h-screen w-full bg-canvas flex items-center justify-center p-6">
      <FadeIn className="w-full max-w-[1080px] grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] rounded-2xl overflow-hidden shadow-hover border border-line bg-surface">
        {/* Brand panel */}
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
              <div className="h-9 w-9 rounded-xl bg-white/15 grid place-items-center">
                <Wrench size={18} />
              </div>
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

        {/* Right column — credentials / MFA */}
        <div className="bg-surface p-8 sm:p-10 flex flex-col justify-center overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {step === 'credentials' ? (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.28, ease: [0.2, 0.7, 0.3, 1] }}
              >
                <h1 className="font-display text-2xl font-semibold text-navy mb-1">Iniciar sesión</h1>
                <p className="text-sm text-muted mb-7">Accede con tu cuenta corporativa.</p>

                <form onSubmit={submit} className="flex flex-col gap-5">
                  <div>
                    <label className="block text-xs font-medium text-navy mb-1.5">Correo electrónico</label>
                    <div className="flex items-center rounded-xl border border-line bg-surface-2 focus-within:border-primary transition-colors">
                      <Mail size={16} className="text-faint ml-3" />
                      <input
                        type="email"
                        placeholder="admin@tumantenimiento.mx"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 bg-transparent px-3 py-2.5 text-sm text-navy outline-none placeholder:text-faint"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <label className="text-xs font-medium text-navy">Contraseña</label>
                      <button
                        type="button"
                        onClick={() => setForgotSent(true)}
                        className="text-xs text-primary hover:text-primary-2"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <div className="flex items-center rounded-xl border border-line bg-surface-2 focus-within:border-primary transition-colors">
                      <Lock size={16} className="text-faint ml-3" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        placeholder="Mínimo 10 caracteres"
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                        className="flex-1 bg-transparent px-3 py-2.5 text-sm text-navy outline-none placeholder:text-faint"
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

                  <PrimaryButton type="submit" className="w-full">Iniciar sesión</PrimaryButton>
                </form>

                <div className="flex items-start gap-2 mt-4 rounded-xl bg-info-soft px-3.5 py-2.5 text-xs text-muted">
                  <ShieldCheck size={14} className="text-primary mt-0.5 shrink-0" />
                  <span>
                    Después de iniciar sesión, se te solicitará tu <b className="text-navy font-semibold">código MFA</b>.
                  </span>
                </div>

                <div className="flex items-center gap-3 my-5">
                  <span className="h-px flex-1 bg-line" />
                  <span className="text-xs text-faint">o continúa con</span>
                  <span className="h-px flex-1 bg-line" />
                </div>

                <button
                  type="button"
                  onClick={() => toast.error('Demo: SSO con Google Workspace no disponible')}
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-surface py-2.5 text-sm font-medium text-navy hover:bg-surface-2 transition-colors"
                >
                  <GoogleG size={18} />
                  <span>Continuar con Google Workspace</span>
                </button>

                <p className="text-[11px] text-faint leading-relaxed mt-6">
                  Acceso restringido a personal autorizado. Todas las sesiones son auditadas y registradas conforme a la
                  política de seguridad de Tumantenimiento.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="mfa"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.28, ease: [0.2, 0.7, 0.3, 1] }}
              >
                <MfaForm email={email} onVerified={() => router.push('/')} onBack={() => setStep('credentials')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </FadeIn>
      <Toasts />
    </div>
  );
}

// ── MFA (prototipo login.jsx · MfaForm) ──────────────────────────────────────
function MfaForm({ email, onVerified, onBack }: { email: string; onVerified: () => void; onBack: () => void }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  function setDigit(idx: number, val: string) {
    const v = val.replace(/[^0-9]/g, '').slice(0, 1);
    setDigits(d => {
      const nd = [...d];
      nd[idx] = v;
      return nd;
    });
    if (v && idx < 5) refs.current[idx + 1]?.focus();
  }
  function handleKey(idx: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) refs.current[idx - 1]?.focus();
  }

  const complete = digits.every(d => d !== '');
  const pct = (seconds / 30) * 100;
  const warning = seconds <= 10;

  return (
    <div>
      <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-info-soft">
        <ShieldCheck size={22} className="text-primary" />
      </div>
      <h1 className="font-display text-2xl font-semibold text-navy mb-1">Verificación en dos pasos</h1>
      <p className="text-sm text-muted mb-6">
        Ingresa el código de 6 dígitos de tu app autenticadora (Google Authenticator, Authy, etc.).
      </p>

      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-3.5 py-1.5 text-[12.5px] text-navy">
        <UserRound size={14} className="text-navy" />
        <span>{email || 'operaciones@tumantenimiento.mx'}</span>
      </div>

      <div className="mb-6 flex gap-2.5">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => { refs.current[i] = el; }}
            value={d}
            onChange={e => setDigit(i, e.target.value)}
            onKeyDown={e => handleKey(i, e)}
            inputMode="numeric"
            maxLength={1}
            aria-label={`Dígito ${i + 1}`}
            className={`h-14 w-12 rounded-xl border text-center font-mono text-xl text-navy outline-none transition-colors ${
              d ? 'border-primary bg-info-soft font-semibold' : 'border-line bg-white'
            } focus:border-primary focus:shadow-[0_0_0_3px_rgba(10,107,207,0.15)]`}
          />
        ))}
      </div>

      {/* Cualquier código de 6 dígitos pasa (demo). */}
      <PrimaryButton className="w-full" disabled={!complete} onClick={onVerified}>Verificar</PrimaryButton>

      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <Timer size={13} className={warning ? 'text-warning' : 'text-primary'} />
            {seconds === 0 ? 'Código expirado — reenvíalo' : 'El código expira en'}
          </span>
          <b className={`font-mono font-medium ${warning ? 'text-warning' : 'text-primary'}`}>
            00:{String(seconds).padStart(2, '0')}
          </b>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${warning ? 'bg-warning' : 'bg-primary'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="my-5 h-px bg-line" />

      <div className="flex flex-col gap-2.5 text-[12.5px]">
        <button
          type="button"
          disabled={seconds > 0}
          onClick={() => { setSeconds(30); toast.success('Código reenviado por SMS'); }}
          className={`inline-flex items-center gap-1.5 ${seconds > 0 ? 'cursor-not-allowed text-faint' : 'text-primary hover:text-primary-2'}`}
        >
          <RefreshCw size={13} />
          Reenviar código por SMS{seconds > 0 ? ` (en ${seconds}s)` : ''}
        </button>
        <button type="button" className="inline-flex items-center gap-1.5 text-primary hover:text-primary-2">
          <LifeBuoy size={13} />
          ¿Problemas? Contactar soporte interno
        </button>
        <button type="button" onClick={onBack} className="mt-1 self-start text-muted hover:text-navy">
          ← Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
}
