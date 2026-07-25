'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Star, type LucideIcon } from 'lucide-react';
import { motion, pressable } from './motion';

/**
 * House UI kit for Tumantenimiento (web). Tailwind primitives reading the brand
 * tokens from globals.css. Mirrors the mobile `UI.tsx` kit and the HTML
 * prototypes' Design System: navy headers, blue CTA, 4/8px rhythm, soft cards.
 */

export function AppBar({ title, subtitle, back = true, right }: { title: string; subtitle?: string; back?: boolean; right?: React.ReactNode }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-line bg-white/90 px-4 py-3 backdrop-blur">
      {back && (
        <button onClick={() => router.back()} aria-label="Atrás" className="-ml-1.5 flex h-10 w-10 items-center justify-center rounded-xl text-navy transition-colors hover:bg-surface">
          <ChevronLeft size={22} />
        </button>
      )}
      <div className="flex-1">
        {subtitle && <p className="font-mono text-[11px] uppercase tracking-widest text-faint">{subtitle}</p>}
        <h1 className="text-[17px] font-bold text-navy">{title}</h1>
      </div>
      {right}
    </header>
  );
}

export function PrimaryButton({ children, onClick, href, disabled, loading, className = '', type = 'button' }: {
  children: React.ReactNode; onClick?: () => void; href?: string; disabled?: boolean; loading?: boolean; className?: string; type?: 'button' | 'submit';
}) {
  const off = disabled || loading;
  const cls = `inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white transition-all ${off ? 'cursor-not-allowed bg-faint opacity-60' : 'bg-primary hover:bg-primary-2'} ${className}`;
  const content = <>{loading && <Spinner className="text-white" />}{children}</>;
  if (href && !off) return <Link href={href} className={cls}>{content}</Link>;
  return <motion.button whileTap={off ? undefined : { scale: 0.98 }} type={type} onClick={onClick} disabled={off} className={cls}>{content}</motion.button>;
}

export function GhostButton({ children, onClick, href, className = '' }: { children: React.ReactNode; onClick?: () => void; href?: string; className?: string }) {
  const cls = `inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-3 font-semibold text-primary transition-colors hover:bg-surface ${className}`;
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button onClick={onClick} className={cls}>{children}</button>;
}

export function Card({ children, className = '', interactive = false, onClick }: { children: React.ReactNode; className?: string; interactive?: boolean; onClick?: () => void }) {
  const base = `rounded-2xl border border-line bg-white p-4 shadow-card ${className}`;
  if (interactive) return <motion.div {...pressable} onClick={onClick} className={`${base} cursor-pointer`}>{children}</motion.div>;
  return <div className={base}>{children}</div>;
}

export function Chip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors ${active ? 'border-primary bg-primary text-white' : 'border-line bg-white text-muted hover:bg-surface'}`}>
      {children}
    </button>
  );
}

type Tone = 'success' | 'warning' | 'error' | 'info' | 'neutral';
const TONE: Record<Tone, string> = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  error: 'bg-error-soft text-error',
  info: 'bg-info-soft text-primary',
  neutral: 'bg-surface-2 text-muted',
};
export function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: Tone }) {
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[10.5px] font-bold ${TONE[tone]}`}>{children}</span>;
}

export function Avatar({ initials, size = 52, className = '' }: { initials: string; size?: number; className?: string }) {
  return (
    <div className={`bg-grad-brand flex items-center justify-center rounded-full font-bold text-white ${className}`} style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials}
    </div>
  );
}

export function SectionTitle({ title, sub, link, href }: { title: string; sub?: string; link?: string; href?: string }) {
  return (
    <div className="mb-3 flex items-start justify-between px-1">
      <div className="pr-2">
        <h2 className="text-[17px] font-bold text-navy">{title}</h2>
        {sub && <p className="mt-0.5 text-[11.5px] text-faint">{sub}</p>}
      </div>
      {link && (href ? <Link href={href} className="pt-1 text-[12.5px] font-semibold text-primary">{link}</Link> : <span className="pt-1 text-[12.5px] font-semibold text-primary">{link}</span>)}
    </div>
  );
}

export function Field({ label, error, children }: { label?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-[13px] font-medium text-navy">{label}</span>}
      {children}
      {error && <span className="mt-1 block text-[12px] text-error">{error}</span>}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`min-h-[48px] w-full rounded-xl border border-line bg-white px-3.5 text-[15px] text-navy outline-none transition-shadow placeholder:text-faint focus:border-primary focus:shadow-[0_0_0_3px_rgba(10,107,207,0.15)] ${props.className ?? ''}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full rounded-xl border border-line bg-white p-3.5 text-[15px] text-navy outline-none transition-shadow placeholder:text-faint focus:border-primary focus:shadow-[0_0_0_3px_rgba(10,107,207,0.15)] ${props.className ?? ''}`} />;
}

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} role="switch" aria-checked={on} className={`relative h-6 w-10 rounded-full transition-colors ${on ? 'bg-primary' : 'bg-surface-2'}`}>
      <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow ${on ? 'left-[19px]' : 'left-[3px]'}`} />
    </button>
  );
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-warning">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} fill={i < Math.round(value) ? 'currentColor' : 'none'} strokeWidth={1.5} />
      ))}
    </span>
  );
}

export function EmptyState({ title, body, icon: Icon }: { title: string; body?: string; icon?: LucideIcon }) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      {Icon && <Icon className="mb-3 text-faint" size={40} />}
      <p className="text-base font-bold text-navy">{title}</p>
      {body && <p className="mt-2 text-[13px] text-muted">{body}</p>}
    </div>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return <span className={`inline-block h-4 w-4 animate-[spin_0.9s_linear_infinite] rounded-full border-2 border-current border-t-transparent ${className}`} />;
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-surface-2 ${className}`}>
      <div className="absolute inset-0 animate-[shimmer_1.4s_linear_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

/** Pulse-ring overlay for processing states (payment, verifying). */
export function PulseRings({ className = '' }: { className?: string }) {
  return (
    <span className={`pointer-events-none absolute inset-0 ${className}`}>
      <span className="absolute inset-0 rounded-full bg-primary/30 animate-[pulse-ring_2.4s_ease-in-out_infinite]" />
      <span className="absolute inset-0 rounded-full bg-primary/30 animate-[pulse-ring_2.4s_ease-in-out_infinite] [animation-delay:0.6s]" />
    </span>
  );
}

/** Geometría de marca: casa + llave española calada. Ver Tumantenimiento-Logo/README. */
const HOUSE = 'M256 118 L398 246 L398 402 L114 402 L114 246 Z';
const WRENCH =
  'M-44 -118 Q-62 -112 -62 -80 L-60 -30 Q-58 -4 -38 6 Q-22 14 -22 32 L-22 176 Q-22 198 0 198 Q22 198 22 176 L22 32 Q22 14 38 6 Q58 -4 60 -30 L62 -80 Q62 -112 44 -118 L30 -74 Q26 -60 16 -52 Q0 -44 -16 -52 Q-26 -60 -30 -74 Z';
const WRENCH_AT = 'translate(258 300) rotate(-36) scale(0.72) translate(0 -40)';
/** Las esquinas redondeadas salen del trazo de 44 con uniones round, no de math a mano. */
const HOUSE_STROKE = { strokeWidth: 44, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;

/**
 * Marca Tumantenimiento — mismo glifo que el app icon móvil y el favicon.
 * tile=true monta el glifo blanco sobre el tile de gradiente de marca (mini app icon);
 * tile=false devuelve el isotipo suelto (casa en gradiente, llave blanca).
 */
export function BrandMark({ size = 32, tile = true, className = '' }: { size?: number; tile?: boolean; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="bmw-tg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0E2C56" /><stop offset=".55" stopColor="#0A6BCF" /><stop offset="1" stopColor="#18C1FF" />
        </linearGradient>
        {tile && (
          <mask id="bmw-cut">
            <rect width="512" height="512" fill="#000" />
            <path d={HOUSE} fill="#fff" stroke="#fff" {...HOUSE_STROKE} />
            <g transform={WRENCH_AT}><path d={WRENCH} fill="#000" /></g>
          </mask>
        )}
      </defs>
      {tile ? (
        <>
          <rect width="512" height="512" rx="112" fill="url(#bmw-tg)" />
          <rect width="512" height="512" rx="112" fill="#fff" mask="url(#bmw-cut)" />
        </>
      ) : (
        <>
          <path d={HOUSE} fill="url(#bmw-tg)" stroke="url(#bmw-tg)" {...HOUSE_STROKE} />
          <g transform={WRENCH_AT}><path d={WRENCH} fill="#FFFFFF" /></g>
        </>
      )}
    </svg>
  );
}
