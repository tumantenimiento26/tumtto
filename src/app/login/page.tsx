'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { FadeIn, Stagger, StaggerItem } from '@/components/motion';
import { PrimaryButton } from '@/components/ui';

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
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push('/');
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

        {/* Login form */}
        <div className="bg-surface p-8 sm:p-10 flex flex-col justify-center">
          <FadeIn delay={0.1}>
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
                  <a href="#" className="text-xs text-primary hover:text-primary-2">¿Olvidaste tu contraseña?</a>
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
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-surface py-2.5 text-sm font-medium text-navy hover:bg-surface-2 transition-colors"
            >
              <GoogleG size={18} />
              <span>Continuar con Google Workspace</span>
            </button>

            <p className="text-[11px] text-faint leading-relaxed mt-6">
              Acceso restringido a personal autorizado. Todas las sesiones son auditadas y registradas conforme a la
              política de seguridad de Tumantenimiento.
            </p>
          </FadeIn>
        </div>
      </FadeIn>
    </div>
  );
}
