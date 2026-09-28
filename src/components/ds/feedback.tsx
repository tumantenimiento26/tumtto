'use client';
import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Construction,
  Inbox,
  Lock,
  MapPin,
  Search,
  ServerCrash,
  WifiOff,
  type LucideIcon,
} from 'lucide-react';

import { Button } from './button';

/** Bloque de skeleton con shimmer 1.2 s (clase `skeleton` de globals.css). */
export function Skeleton({
  className = '',
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className={`skeleton rounded-lg ${className}`}
      style={style}
    />
  );
}

/**
 * Skeleton específico por tipo de pantalla (handoff: al navegar, 480 ms).
 * `kind`: dashboard (banda + KPIs + gráfica), list (tabla), detail (2 columnas).
 */
export function ScreenSkeleton({
  kind,
}: {
  kind: 'dashboard' | 'list' | 'detail';
}) {
  if (kind === 'dashboard')
    return (
      <div className="space-y-4" aria-busy aria-label="Cargando">
        <Skeleton className="h-[260px] rounded-2xl" />
        <div className="grid gap-3.5 lg:grid-cols-3">
          <Skeleton className="h-[300px] rounded-box lg:col-span-2" />
          <Skeleton className="h-[300px] rounded-box" />
        </div>
      </div>
    );
  if (kind === 'detail')
    return (
      <div className="space-y-4" aria-busy aria-label="Cargando">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-16 rounded-box" />
        <div className="grid gap-3.5 lg:grid-cols-3">
          <Skeleton className="h-[360px] rounded-box lg:col-span-2" />
          <Skeleton className="h-[360px] rounded-box" />
        </div>
      </div>
    );
  return (
    <div className="space-y-4" aria-busy aria-label="Cargando">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36 rounded-btn" />
      </div>
      <div className="overflow-hidden rounded-box border border-line bg-card">
        <Skeleton className="h-12 rounded-none" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-t border-divider px-5 py-4"
          >
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Barra indeterminada (carga sin progreso conocido). */
export function IndeterminateBar({ className = '' }: { className?: string }) {
  return (
    <div
      role="progressbar"
      aria-busy
      className={`relative h-[3px] overflow-hidden rounded-full bg-segment ${className}`}
    >
      <span className="absolute inset-y-0 w-2/5 animate-indet rounded-full bg-primary" />
    </div>
  );
}

export type EmptyKind = 'first-use' | 'no-results' | 'all-clear' | 'action';
const EMPTY: Record<EmptyKind, { icon: LucideIcon; tile: string }> = {
  'first-use': { icon: Inbox, tile: 'bg-info-soft text-primary' },
  'no-results': { icon: Search, tile: 'bg-chip text-muted' },
  'all-clear': { icon: CheckCircle2, tile: 'bg-success-soft text-success' },
  action: { icon: Clock, tile: 'bg-warning-soft text-warning-ink' },
};

/** Estado vacío (Primer uso / Sin resultados / Todo al día / Requiere acción). */
export function EmptyState({
  kind = 'first-use',
  title,
  description,
  icon,
  action,
  compact,
}: {
  kind?: EmptyKind;
  title: string;
  description?: React.ReactNode;
  icon?: LucideIcon;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  const e = EMPTY[kind];
  const Icon = icon ?? e.icon;
  return (
    <div
      className={`flex flex-col items-center text-center ${compact ? 'px-4 py-8' : 'px-6 py-14'}`}
    >
      <div
        className={`mb-4 grid h-12 w-12 place-items-center rounded-xl ${e.tile}`}
      >
        <Icon size={22} />
      </div>
      <h3 className="font-display text-[16px] font-bold text-navy">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-[13.5px] text-muted">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export type ErrorKind =
  '404' | '500' | 'offline' | '403' | 'maintenance' | 'session';

const ERRORS: Record<
  ErrorKind,
  {
    code: string;
    title: string;
    description: string;
    steps: string[];
    icon: LucideIcon;
    tone: 'info' | 'danger' | 'warning' | 'neutral';
  }
> = {
  '404': {
    code: '404',
    title: 'No encontramos esta página',
    description:
      'La dirección no existe o el registro fue eliminado. Revisa el ID o búscalo con ⌘K.',
    steps: [
      'Revisa que el ID tenga el formato SVC-0000',
      'Busca el registro con ⌘K',
      'Si llegaste por un enlace, avisa a quien lo compartió',
    ],
    icon: MapPin,
    tone: 'info',
  },
  '500': {
    code: '500',
    title: 'Algo salió mal de nuestro lado',
    description:
      'El servidor no respondió. Ya avisamos al equipo técnico; intenta de nuevo en unos segundos.',
    steps: [
      'Recarga la página',
      'Si persiste, espera un par de minutos',
      'Comparte la referencia con soporte',
    ],
    icon: ServerCrash,
    tone: 'danger',
  },
  offline: {
    code: 'SIN RED',
    title: 'Sin conexión',
    description:
      'No pudimos comunicarnos con el servidor. Los datos que ves pueden estar desactualizados.',
    steps: [
      'Revisa tu conexión a internet',
      'Desactiva VPN o proxy si usas alguno',
      'Reintenta cuando vuelva la señal',
    ],
    icon: WifiOff,
    tone: 'warning',
  },
  '403': {
    code: '403',
    title: 'No tienes acceso a esta sección',
    description:
      'Tu rol no incluye este permiso. Pide acceso a un administrador.',
    steps: [
      'Confirma con qué cuenta entraste',
      'Pide el permiso en Configuración › Equipo',
      'Vuelve al dashboard',
    ],
    icon: Lock,
    tone: 'neutral',
  },
  maintenance: {
    code: 'MANTENIMIENTO',
    title: 'Estamos en mantenimiento',
    description:
      'Volvemos en unos minutos. Las solicitudes en curso no se pierden.',
    steps: [
      'Espera unos minutos',
      'Revisa el estado del servicio',
      'Las órdenes activas siguen su curso',
    ],
    icon: Construction,
    tone: 'warning',
  },
  session: {
    code: 'SESIÓN',
    title: 'Tu sesión expiró',
    description:
      'Por seguridad cerramos tu sesión tras un tiempo sin actividad.',
    steps: [
      'Vuelve a iniciar sesión',
      'Tus cambios guardados siguen ahí',
      'Activa "Mantener sesión" si usas tu equipo',
    ],
    icon: Clock,
    tone: 'info',
  },
};

const ILLU_TONE = {
  info: {
    ring: 'bg-info-soft border-info-ring',
    chip: 'bg-info-soft text-primary',
    badge: 'bg-action text-white',
  },
  danger: {
    ring: 'bg-error-soft border-error-line',
    chip: 'bg-error-soft text-error',
    badge: 'bg-error text-white',
  },
  warning: {
    ring: 'bg-warning-soft border-warning-ring',
    chip: 'bg-warning-soft text-warning-ink',
    badge: 'bg-warning text-white',
  },
  neutral: {
    ring: 'bg-chip border-line-strong',
    chip: 'bg-chip text-muted',
    badge: 'bg-action text-white',
  },
};

/** Ilustración compuesta (formas, sin imágenes): círculo punteado + tarjeta + ícono. */
export function ErrorIllustration({ kind }: { kind: ErrorKind }) {
  const e = ERRORS[kind];
  const t = ILLU_TONE[e.tone];
  return (
    <div
      className="relative grid aspect-[4/3] w-full place-items-center overflow-hidden rounded-2xl border border-line bg-card"
      style={{
        backgroundImage:
          'radial-gradient(var(--color-line) 1px, transparent 1px)',
        backgroundSize: '16px 16px',
      }}
    >
      <span
        className={`absolute left-4 top-4 rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold ${t.chip}`}
      >
        {e.code}
      </span>
      <div
        className={`grid h-[180px] w-[180px] place-items-center rounded-full border border-dashed ${t.ring}`}
      >
        <div className="relative h-[88px] w-[128px] rounded-xl border border-line bg-card shadow-float">
          <div className="space-y-2 p-3">
            <div className="h-2 w-16 rounded-full bg-segment" />
            <div className="h-2 w-24 rounded-full bg-segment" />
            <div className="h-2 w-12 rounded-full bg-segment" />
          </div>
          <span
            className={`absolute -right-3 -top-3 grid h-10 w-10 place-items-center rounded-xl shadow-float ${t.badge}`}
          >
            <e.icon size={18} />
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Página de error completa (404/500/sin conexión/403/mantenimiento/sesión):
 * ilustración, título, "Qué puedes hacer", acciones y referencia.
 */
export function ErrorPage({
  kind,
  primary,
  secondary,
  reference,
}: {
  kind: ErrorKind;
  primary?: { label: string; href?: string; onClick?: () => void };
  secondary?: { label: string; href?: string; onClick?: () => void };
  /** Código para soporte (se genera uno si no se da). */
  reference?: string;
}) {
  const e = ERRORS[kind];
  const [ref] = useState(
    () =>
      reference ??
      `REF-${kind.toUpperCase().slice(0, 4)}-${Date.now().toString(16).slice(-4).toUpperCase()}`,
  );
  return (
    <div className="mx-auto grid max-w-5xl items-center gap-10 py-10 md:grid-cols-2">
      <ErrorIllustration kind={kind} />
      <div>
        <h1 className="font-display text-[30px] font-extrabold leading-tight tracking-[-0.6px] text-navy">
          {e.title}
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          {e.description}
        </p>
        <p className="mb-2 mt-6 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted">
          Qué puedes hacer
        </p>
        <ol className="space-y-2">
          {e.steps.map((s, i) => (
            <li
              key={s}
              className="flex items-center gap-3 text-[14px] text-body"
            >
              <span className="grid h-6 w-6 place-items-center rounded-md border border-line bg-card font-mono text-[11px] text-primary">
                {String(i + 1).padStart(2, '0')}
              </span>
              {s}
            </li>
          ))}
        </ol>
        <div className="mt-7 flex flex-wrap gap-2.5">
          {primary && (
            <Button size="lg" href={primary.href} onClick={primary.onClick}>
              {primary.label}
            </Button>
          )}
          {secondary && (
            <Button
              size="lg"
              variant="secondary"
              href={secondary.href}
              onClick={secondary.onClick}
            >
              {secondary.label}
            </Button>
          )}
        </div>
        <p className="mt-4 font-mono text-[11.5px] text-faint">
          {ref} ·{' '}
          <a
            href="mailto:soporte@tumantenimiento.mx"
            className="font-sans font-semibold text-primary"
          >
            Contactar a soporte
          </a>
        </p>
      </div>
    </div>
  );
}
