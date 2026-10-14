'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronLeft } from 'lucide-react';
import { BrandMark } from '@/components/ui';
import { BUILD, envLabel } from '@/lib/buildInfo';

// Marco de las páginas públicas de acceso (login, registro de técnico,
// contraseña nueva, callback de correo, invitación) — handoff web A2/B:
// panel de marca navy con aura y rejilla a la izquierda, formulario blanco a
// la derecha. Bajo 760px el panel queda arriba y más bajo.

export type AuthAsideProps = {
  kicker: string;
  title: React.ReactNode;
  lead: string;
  bullets: string[];
  /** Contenido bajo los bullets (reseña, pasos del alta). */
  children?: React.ReactNode;
};

export function AuthShell({
  aside,
  children,
  footer = true,
}: {
  aside: AuthAsideProps;
  children: React.ReactNode;
  /** Pie mono "Conexión cifrada · MFA para administradores · Ayuda". */
  footer?: boolean;
}) {
  // Estas páginas son siempre claras: si se llega desde la consola en modo
  // oscuro (navegación de cliente), quitamos el tema mientras estén montadas.
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.dataset.theme;
    delete html.dataset.theme;
    return () => {
      if (prev) html.dataset.theme = prev;
    };
  }, []);

  return (
    <div className="grid min-h-screen w-full grid-cols-1 bg-card min-[760px]:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <AuthAside {...aside} />
      <main className="relative flex flex-col px-5 pb-8 pt-5 sm:px-10">
        <div className="flex justify-end">
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-1.5 rounded-btn border border-line-strong bg-card px-3.5 font-display text-[14px] font-bold text-navy transition-colors hover:bg-panel"
          >
            <ChevronLeft size={16} aria-hidden />
            Volver al sitio
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-8">
          {children}
        </div>
        {footer && (
          <p className="text-center font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">
            Conexión cifrada · MFA para administradores ·{' '}
            <a
              href="mailto:soporte@tumantenimiento.mx"
              className="hover:text-navy"
            >
              Ayuda
            </a>
          </p>
        )}
      </main>
    </div>
  );
}

function AuthAside({ kicker, title, lead, bullets, children }: AuthAsideProps) {
  return (
    <aside className="relative min-h-[260px] overflow-hidden bg-lp-page px-6 py-8 text-lp-text sm:px-10 min-[760px]:sticky min-[760px]:top-0 min-[760px]:h-screen min-[760px]:py-10">
      {/* Aura + rejilla doble enmascarada (mismo lenguaje que la landing) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-48 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(10,107,207,0.45),transparent_65%)] blur-[60px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-52 -right-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(24,193,255,0.22),transparent_65%)] blur-[70px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_30%_30%,black,transparent_75%)]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(90,176,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(90,176,255,0.07) 1px, transparent 1px), linear-gradient(rgba(90,176,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(90,176,255,0.035) 1px, transparent 1px)',
          backgroundSize: '120px 120px, 120px 120px, 24px 24px, 24px 24px',
        }}
      />

      <div className="relative flex h-full flex-col">
        <Link href="/" className="flex flex-col items-center gap-3 self-center">
          <BrandMark
            size={110}
            animated
            className="rounded-[26px] shadow-[0_0_56px_rgba(24,193,255,0.5)]"
          />
          <span className="font-display text-[36px] font-extrabold tracking-[-0.8px]">
            Tumantenimiento
          </span>
        </Link>

        <div className="mt-10 text-center min-[760px]:mt-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan">
            {kicker}
          </p>
          <h2 className="mt-3 font-display text-[clamp(28px,3.4vw,40px)] font-extrabold leading-[1.08] tracking-[-1px]">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-[440px] text-[15px] leading-[1.65] text-lp-body">
            {lead}
          </p>
          <ul className="mx-auto mt-6 hidden w-fit flex-col gap-3 text-left min-[760px]:flex">
            {bullets.map(b => (
              <li key={b} className="flex items-center gap-3 text-[14.5px]">
                <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-primary/25 text-cyan">
                  <Check size={14} strokeWidth={2.6} aria-hidden />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        {children && (
          <div className="mt-auto hidden pt-10 min-[760px]:block">
            {children}
          </div>
        )}
      </div>
    </aside>
  );
}

/**
 * Panel de la consola en el login: logo animado, fecha y hora de la ZMG, y la
 * versión/entorno de esta compilación (para saber a qué despliegue entras).
 */
export function AsideConsole() {
  // Reloj solo en cliente: evita desajuste de hidratación con el HTML del server.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const tz = { timeZone: 'America/Mexico_City' } as const;
  const env = envLabel(BUILD.env);
  const built = BUILD.builtAt
    ? new Date(BUILD.builtAt).toLocaleString('es-MX', {
        ...tz,
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—';

  return (
    <div className="rounded-box border border-lp-line bg-lp-card p-5 backdrop-blur-md">
      <div>
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan">
            {now
              ? now.toLocaleDateString('es-MX', { ...tz, weekday: 'long' })
              : '\u00a0'}
          </p>
          <p className="mt-0.5 font-display text-[19px] font-bold leading-tight">
            {now
              ? now.toLocaleDateString('es-MX', {
                  ...tz,
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : '\u00a0'}
          </p>
          <p className="tabular mt-1 font-mono text-[26px] font-semibold leading-none">
            {now
              ? now.toLocaleTimeString('es-MX', { ...tz, hour12: false })
              : '--:--:--'}
            <span className="ml-2 text-[11px] font-medium text-lp-muted">
              CDMX
            </span>
          </p>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-lp-line pt-4 text-[12.5px]">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-lp-muted">
            Versión
          </dt>
          <dd className="mt-1 font-mono font-semibold">
            v{BUILD.version}
            {BUILD.sha && (
              <span className="ml-1.5 text-lp-muted">· {BUILD.sha}</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-lp-muted">
            Entorno
          </dt>
          <dd className="mt-1 inline-flex items-center gap-1.5 font-semibold">
            <span
              aria-hidden
              className={`h-2 w-2 rounded-full ${
                env.tone === 'ok'
                  ? 'bg-success'
                  : env.tone === 'warn'
                  ? 'bg-warning'
                  : 'bg-cyan'
              }`}
            />
            {env.label}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-lp-muted">
            Compilado
          </dt>
          <dd className="mt-1 font-semibold">{built}</dd>
        </div>
      </dl>
    </div>
  );
}

/** Pasos del alta de técnico en el panel (registro, handoff B). */
export function AsideSteps({ done }: { done: number }) {
  const steps = [
    ['Crea tu cuenta', 'Nombre, correo, celular y contraseña. Toma un minuto.'],
    [
      'Completa tu alta en la app',
      'INE, carta de antecedentes no penales y comprobante de domicilio.',
    ],
    [
      'Recibe solicitudes',
      'Al aprobarte, configuras tarifas y zona y empiezas a trabajar.',
    ],
  ];
  return (
    <div className="grid grid-cols-3 gap-3 border-t border-lp-line pt-8">
      {steps.map(([t, b], i) => (
        <div key={t}>
          <div
            className={`h-[3px] rounded-full ${
              i <= done ? 'bg-cyan' : 'bg-white/10'
            }`}
          />
          <p className="mt-3 font-mono text-[11px] text-cyan">
            {i < done ? '✓' : `0${i + 1}`}
          </p>
          <p className="mt-1 font-display text-[14px] font-bold leading-tight">
            {t}
          </p>
          <p className="mt-1.5 text-[12.5px] leading-snug text-lp-muted">{b}</p>
        </div>
      ))}
    </div>
  );
}

/** Medidor de 4 segmentos para contraseñas. */
export function StrengthMeter({ score }: { score: number }) {
  const color = ['', 'bg-error', 'bg-warning', 'bg-primary', 'bg-approve'][
    score
  ];
  return (
    <div className="mt-2 flex gap-1.5" aria-hidden>
      {[1, 2, 3, 4].map(i => (
        <span
          key={i}
          className={`h-[4px] flex-1 rounded-full transition-colors ${
            i <= score ? color : 'bg-line'
          }`}
        />
      ))}
    </div>
  );
}
