'use client';
import { X, type LucideIcon } from 'lucide-react';

/** Kicker mono en mayúsculas (10.5–11px, tracking .14em). */
export function Kicker({
  children,
  className = '',
  tone = 'muted',
}: {
  children: React.ReactNode;
  className?: string;
  tone?: 'muted' | 'primary' | 'cyan';
}) {
  const color = {
    muted: 'text-muted',
    primary: 'text-primary',
    cyan: 'text-cyan',
  }[tone];
  return (
    <p
      className={`font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] ${color} ${className}`}
    >
      {children}
    </p>
  );
}

/** Título de página de consola: H1 27/800 + descripción + acciones. */
export function PageHeader({
  title,
  description,
  actions,
  kicker,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  kicker?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {kicker && <Kicker className="mb-1.5">{kicker}</Kicker>}
        <h1 className="font-display text-[27px] font-extrabold leading-tight tracking-[-0.6px] text-navy">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-[14px] text-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
    </div>
  );
}

/** Tarjeta base (radio 12, borde, fondo card). `hover` = elevación de KPI. */
export function Card({
  children,
  className = '',
  padded = true,
  hover,
  as: As = 'div',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
  hover?: boolean;
  as?: 'div' | 'section' | 'article';
  onClick?: () => void;
}) {
  return (
    <As
      onClick={onClick}
      className={`card-modern rounded-box border border-line bg-card shadow-card-soft transition-[box-shadow,transform,border-color] duration-200 hover:border-line-strong ${padded ? 'p-5' : ''} ${
        hover
          ? 'hover:-translate-y-0.5 hover:shadow-card-lift'
          : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </As>
  );
}

/** Segmentado (radio 10, interior 8). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className = '',
  'aria-label': ariaLabel,
}: {
  options: readonly (T | { value: T; label: React.ReactNode })[];
  value: T;
  onChange: (v: T) => void;
  size?: 'sm' | 'md';
  className?: string;
  'aria-label'?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`inline-flex rounded-btn bg-segment p-1 ${className}`}
    >
      {options.map(o => {
        const v = typeof o === 'string' ? o : o.value;
        const label = typeof o === 'string' ? o : o.label;
        const on = v === value;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(v)}
            className={`rounded-lg font-semibold transition-colors ${
              size === 'sm'
                ? 'px-2.5 py-1 text-[12.5px]'
                : 'px-3.5 py-1.5 text-[13.5px]'
            } ${
              on
                ? 'bg-card text-navy shadow-[0_1px_3px_rgba(6,27,58,0.12)]'
                : 'text-muted hover:text-navy'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** Toggle 44×24 (knob 250 ms cubic-bezier(.3,1.4,.5,1)). */
export function Toggle({
  checked,
  onChange,
  label,
  disabled,
  'aria-label': ariaLabel,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  'aria-label'?: string;
}) {
  const sw = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-50 ${
        checked ? 'bg-primary' : 'bg-line-strong'
      }`}
    >
      <span
        className="absolute left-[3px] top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(6,27,58,0.3)]"
        style={{
          transform: checked ? 'translateX(20px)' : 'none',
          transition: 'transform 250ms cubic-bezier(.3,1.4,.5,1)',
        }}
      />
    </button>
  );
  if (!label) return sw;
  return (
    <label className="inline-flex cursor-pointer items-center gap-3 text-[13.5px] text-body">
      {sw}
      {label}
    </label>
  );
}

/** Chip de filtro (pill 999px). `onRemove` muestra ✕ (chips activos). */
export function Chip({
  children,
  active,
  onClick,
  onRemove,
  icon: Icon,
  count,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  icon?: LucideIcon;
  count?: number;
}) {
  return (
    <span
      className={`inline-flex h-8 items-center gap-1.5 rounded-full border text-[13px] font-semibold transition-colors ${
        active
          ? 'border-action bg-action text-white'
          : 'border-line bg-card text-navy hover:border-line-strong'
      } ${onRemove ? 'pl-3 pr-1.5' : 'px-3'}`}
    >
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className="inline-flex items-center gap-1.5"
      >
        {Icon && <Icon size={14} />}
        {children}
        {count != null && (
          <span
            className={`font-mono text-[11px] ${active ? 'text-white/75' : 'text-muted'}`}
          >
            {count}
          </span>
        )}
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Quitar ${typeof children === 'string' ? children : 'filtro'}`}
          className={`grid h-5 w-5 place-items-center rounded-full ${active ? 'hover:bg-white/15' : 'hover:bg-panel'}`}
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}

export type Tone =
  'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'navy';
const TONE: Record<Tone, string> = {
  neutral: 'bg-chip text-muted',
  info: 'bg-info-soft text-primary',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning-ink',
  danger: 'bg-error-soft text-error',
  navy: 'bg-action text-white',
};

/** Pill de estado (con punto opcional). */
export function Badge({
  children,
  tone = 'neutral',
  dot,
  mono,
  className = '',
}: {
  children: React.ReactNode;
  tone?: Tone;
  dot?: boolean;
  /** Mono en mayúsculas (URGENTE, KYC…). */
  mono?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 ${
        mono
          ? 'rounded-md px-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em]'
          : 'text-[12.5px] font-semibold'
      } ${TONE[tone]} ${className}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/** Tabs subrayadas con contador (listas de consola). */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className = '',
}: {
  tabs: readonly { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={`flex gap-1 overflow-x-auto overflow-y-hidden border-b border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {tabs.map(t => {
        const on = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(t.value)}
            className={`relative -mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-3.5 pb-3 pt-3.5 text-[14px] font-semibold transition-colors ${
              on
                ? 'border-primary text-navy'
                : 'border-transparent text-muted hover:text-navy'
            }`}
          >
            {t.label}
            {t.count != null && (
              <span
                className={`min-w-[22px] rounded-full px-1.5 py-px text-center font-mono text-[11px] ${
                  on ? 'bg-info-soft text-primary' : 'bg-chip text-muted'
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

