'use client';
import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';

/**
 * Botón del rediseño (handoff web): plano, radio 10, Manrope 700.
 *   primary     navy (claro) / azul (oscuro)
 *   approve     verde de aprobar
 *   secondary   borde, fondo tarjeta
 *   destructive texto rojo, fondo tarjeta
 *   ghost       sin borde
 */
export type ButtonVariant =
  'primary' | 'approve' | 'secondary' | 'destructive' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-action text-white hover:bg-action-hover active:bg-action-pressed',
  approve:
    'bg-approve text-white hover:bg-approve-hover active:bg-approve-pressed',
  secondary:
    'border border-line-strong bg-card text-navy hover:bg-panel active:bg-segment',
  destructive:
    'border border-line bg-card text-error hover:border-error-line hover:bg-error-soft',
  ghost: 'text-muted hover:bg-panel hover:text-navy',
};
const SIZE: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-[13px]',
  md: 'h-10 gap-2 px-4 text-[14px]',
  lg: 'h-12 gap-2 px-5 text-[15px]',
};
const ICON: Record<ButtonSize, number> = { sm: 14, md: 16, lg: 18 };

export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-block animate-spin rounded-full border-2 border-current border-t-transparent opacity-80"
      style={{ width: size, height: size }}
    />
  );
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading,
  disabled,
  href,
  onClick,
  type = 'button',
  className = '',
  full,
  title,
  'aria-label': ariaLabel,
}: {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  type?: 'button' | 'submit';
  className?: string;
  /** Ancho completo. */
  full?: boolean;
  title?: string;
  'aria-label'?: string;
}) {
  const off = disabled || loading;
  const cls = `inline-flex select-none items-center justify-center whitespace-nowrap rounded-btn font-display font-bold transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.985] focus-visible:outline-none focus-visible:shadow-focus ${VARIANT[variant]} ${SIZE[size]} ${full ? 'w-full' : ''} ${off ? 'pointer-events-none opacity-55' : ''} ${className}`;
  const content = (
    <>
      {loading ? (
        <Spinner size={ICON[size]} />
      ) : (
        Icon && <Icon size={ICON[size]} strokeWidth={2.2} />
      )}
      {children}
      {IconRight && !loading && (
        <IconRight size={ICON[size]} strokeWidth={2.2} />
      )}
    </>
  );
  if (href && !off)
    return (
      <Link href={href} className={cls} aria-label={ariaLabel} title={title}>
        {content}
      </Link>
    );
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={off}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      title={title}
      className={cls}
    >
      {content}
    </button>
  );
}

/** Botón cuadrado solo-ícono (header, toolbars). */
export function IconButton({
  icon: Icon,
  label,
  onClick,
  active,
  size = 40,
  className = '',
  badge,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  active?: boolean;
  size?: number;
  className?: string;
  /** Número (contador rojo) o true (punto cian). */
  badge?: number | boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`relative grid flex-shrink-0 place-items-center rounded-btn border border-line bg-card text-muted transition-colors hover:bg-panel hover:text-navy focus-visible:outline-none focus-visible:shadow-focus ${active ? 'bg-panel text-navy' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      <Icon size={18} strokeWidth={2} />
      {typeof badge === 'number' && badge > 0 && (
        <span className="absolute -right-1.5 -top-1.5 min-w-[18px] rounded-full border-2 border-card bg-error px-1 text-center font-sans text-[10px] font-bold leading-[14px] text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
      {badge === true && (
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-cyan" />
      )}
    </button>
  );
}
