'use client';
import { useId } from 'react';

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-[spin_0.9s_linear_infinite] rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}

/**
 * Geometría de marca (logo TM 2026-10, vectorizado del render): casa en
 * contorno azul, rayo + llave + gota (electricidad, herrería, plomería), "TM"
 * en cinta blanca→azul y ventana 2×2. viewBox 512, tile navy redondeado.
 */
const TM = {
  house: 'M146 377H93V190L256 75L419 190V377H380',
  bolt: 'M203 156L166 199H187L174 226L211 184H190Z',
  wrenchHead: { cx: 255, cy: 148, r: 31 },
  wrenchShank: 'M242 160H268V234L242 224Z',
  drop: 'M325 160C325 160 300 188 300 207A25 25 0 0 0 350 207C350 188 325 160 325 160Z',
  dropShine: 'M310 206A15 15 0 0 0 322 222',
  ribbon: 'M115 238H238L310 286L361 238H390V387H361V281L310 327L231 270H192V387H161V270H115Z',
  leg: 'M227 292L255 306V387H227Z',
  windows: [
    [274, 339],
    [300.5, 339],
    [274, 365.5],
    [300.5, 365.5],
  ],
} as const;

/**
 * Marca Tumantenimiento — mismo dibujo que el app icon móvil y el favicon.
 * tile=true: logo sobre su tile navy (mini app icon). tile=false: solo el
 * dibujo, para fondos oscuros. animated: la casa se traza, luego aparecen
 * rayo/llave/gota y al final el "TM" (respeta prefers-reduced-motion).
 */
export function BrandMark({
  size = 32,
  tile = true,
  animated = false,
  className = '',
}: {
  size?: number;
  tile?: boolean;
  animated?: boolean;
  className?: string;
}) {
  // ids únicos: varias marcas en la misma página no comparten gradientes.
  const id = useId().replace(/:/g, '');
  const u = (n: string) => `url(#${n}-${id})`;
  const a = (cls: string) => (animated ? cls : undefined);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0E2347" />
          <stop offset="1" stopColor="#081631" />
        </linearGradient>
        <linearGradient id={`blue-${id}`} x1="0" y1="75" x2="0" y2="387" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2D8BF5" />
          <stop offset="1" stopColor="#1360DA" />
        </linearGradient>
        <linearGradient id={`rib-${id}`} x1="115" y1="0" x2="390" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F4F7FC" />
          <stop offset=".42" stopColor="#EEF3FB" />
          <stop offset=".7" stopColor="#4C97F2" />
          <stop offset="1" stopColor="#1A68DE" />
        </linearGradient>
        <linearGradient id={`gold-${id}`} x1="0" y1="117" x2="0" y2="234" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFC93A" />
          <stop offset="1" stopColor="#F2A50C" />
        </linearGradient>
        <mask id={`jaw-${id}`}>
          <rect width="512" height="512" fill="#fff" />
          <rect x="243" y="100" width="24" height="52" rx="12" fill="#000" />
        </mask>
      </defs>
      {tile && <rect width="512" height="512" rx="112" fill={u('bg')} />}
      <path
        d={TM.house}
        fill="none"
        stroke={u('blue')}
        strokeWidth="22"
        strokeLinejoin="round"
        className={a('tm-house')}
      />
      <path d={TM.bolt} fill="#F4F7FC" className={a('tm-pop tm-d1')} />
      <g mask={u('jaw')} fill={u('gold')} className={a('tm-pop tm-d2')}>
        <circle {...TM.wrenchHead} />
        <path d={TM.wrenchShank} />
      </g>
      <g className={a('tm-pop tm-d3')}>
        <path d={TM.drop} fill={u('blue')} />
        <path d={TM.dropShine} fill="none" stroke="#BFE0FF" strokeWidth="4" strokeLinecap="round" opacity=".85" />
      </g>
      <g className={a('tm-rise')}>
        <path d={TM.ribbon} fill={u('rib')} />
        <path d={TM.leg} fill={u('blue')} />
        {TM.windows.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="21.5" height="21.5" rx="2" fill="#F4F7FC" />
        ))}
      </g>
      {animated && (
        <style>{`
          .tm-house { stroke-dasharray: 860; stroke-dashoffset: 860; animation: tm-draw .9s cubic-bezier(.6,0,.3,1) .1s forwards; }
          .tm-pop { transform-box: fill-box; transform-origin: center; opacity: 0; animation: tm-pop .45s cubic-bezier(.3,1.6,.5,1) forwards; }
          .tm-d1 { animation-delay: .75s; } .tm-d2 { animation-delay: .87s; } .tm-d3 { animation-delay: .99s; }
          .tm-rise { opacity: 0; animation: tm-rise .55s cubic-bezier(.2,.8,.2,1) 1.1s forwards; }
          @keyframes tm-draw { to { stroke-dashoffset: 0; } }
          @keyframes tm-pop { from { opacity: 0; transform: scale(0) rotate(-25deg); } to { opacity: 1; transform: none; } }
          @keyframes tm-rise { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
          @media (prefers-reduced-motion: reduce) {
            .tm-house, .tm-pop, .tm-rise { animation: none; opacity: 1; stroke-dashoffset: 0; }
          }
        `}</style>
      )}
    </svg>
  );
}
