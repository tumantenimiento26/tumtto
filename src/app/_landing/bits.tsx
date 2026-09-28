'use client';

import type { ReactNode } from 'react';
import { Star, Play } from 'lucide-react';
import { APP_STORE_URL, PLAY_STORE_URL } from '@/lib/appLinks';

/** Contenedor 1200px + 24px lateral. */
export function Container({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-[1200px] px-6 ${className}`}>{children}</div>
  );
}

export function Kicker({
  children,
  reveal = '0',
}: {
  children: ReactNode;
  reveal?: string | null;
}) {
  return (
    <p
      data-reveal={reveal ?? undefined}
      className="mb-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--lp-cyan)]"
    >
      {children}
    </p>
  );
}

export function H2({
  children,
  reveal = '0.05',
  className = '',
}: {
  children: ReactNode;
  reveal?: string | null;
  className?: string;
}) {
  return (
    <h2
      data-reveal={reveal ?? undefined}
      className={`mb-3.5 font-display text-[clamp(32px,4vw,46px)] font-extrabold leading-[1.06] tracking-[-1.2px] text-lp-text [text-wrap:pretty] ${className}`}
    >
      {children}
    </h2>
  );
}

export function Lead({
  children,
  reveal = '0.1',
  className = '',
}: {
  children: ReactNode;
  reveal?: string | null;
  className?: string;
}) {
  return (
    <p
      data-reveal={reveal ?? undefined}
      className={`text-[17px] leading-[1.65] text-lp-body [text-wrap:pretty] ${className}`}
    >
      {children}
    </p>
  );
}

export function Stars({ size = 13 }: { size?: number }) {
  return (
    <span
      className="inline-flex gap-0.5 text-[var(--lp-gold)]"
      aria-label="5 estrellas"
    >
      {[0, 1, 2, 3, 4].map(i => (
        <Star key={i} size={size} fill="currentColor" strokeWidth={0} />
      ))}
    </span>
  );
}

function AppleGlyph() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 4.5c-1.8 0-2.5 1.06-4 1.06s-2.5-1.06-4-1.06a4.9 4.9 0 0 0-5 4.78C4 13.5 7 22 10 22c1.25 0 2-1.06 4-1.06Z" />
      <path d="M10 2c1 .5 2 2 2 5" />
    </svg>
  );
}

const STORE_CLS =
  'flex h-14 items-center gap-2.5 rounded-btn bg-white pl-4 pr-5 text-navy transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_rgba(24,193,255,0.55)] active:scale-[0.985]';

function StoreBadge({
  href,
  small,
  big,
  icon,
}: {
  href: string;
  small: string;
  big: string;
  icon: ReactNode;
}) {
  const body = (
    <>
      {icon}
      <span className="text-left">
        <span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
          {small}
        </span>
        <span className="block font-display text-[16px] font-extrabold leading-[1.15]">
          {big}
        </span>
      </span>
    </>
  );
  // ponytail: sin URL de tienda configurada (app aún no publicada) el badge
  // queda deshabilitado con "Próximamente"; se activa con NEXT_PUBLIC_*_STORE_URL.
  return href ? (
    <a href={href} className={STORE_CLS} target="_blank" rel="noreferrer">
      {body}
    </a>
  ) : (
    <span
      className={`${STORE_CLS} cursor-default opacity-90 hover:translate-y-0 hover:shadow-none`}
      title="Próximamente"
      aria-disabled="true"
    >
      {body}
    </span>
  );
}

export function StoreButtons({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-2.5 ${className}`}>
      <StoreBadge
        href={APP_STORE_URL}
        small="Descárgala en el"
        big="App Store"
        icon={<AppleGlyph />}
      />
      <StoreBadge
        href={PLAY_STORE_URL}
        small="Disponible en"
        big="Google Play"
        icon={<Play size={19} fill="currentColor" strokeWidth={0} />}
      />
    </div>
  );
}

/** Avatar circular con iniciales (reseñas, técnicos). */
export function Initials({
  text,
  color,
  size = 34,
  ring,
}: {
  text: string;
  color: string;
  size?: number;
  ring?: boolean;
}) {
  return (
    <span
      className={`flex flex-shrink-0 items-center justify-center rounded-full font-display font-extrabold text-white ${
        ring ? 'border-2 border-deep' : ''
      }`}
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.34,
      }}
    >
      {text}
    </span>
  );
}
