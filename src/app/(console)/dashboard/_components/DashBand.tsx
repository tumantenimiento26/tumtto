'use client';

import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { DashRange } from '@/lib/dashboard';
import { clockLabel, greeting, sparkPaths } from '@/lib/dashboard';
import { BAND, useCountUp } from './shared';

export interface BandKpi {
  label: string;
  icon: LucideIcon;
  value: number;
  format: (n: number) => string;
  spark: number[];
  color: keyof Pick<typeof BAND, 'blue' | 'green' | 'cyan' | 'amber'>;
  delta: string | null;
  deltaUp: boolean;
  note: string;
  onClick?: () => void;
}

const RANGES: { value: DashRange; label: string }[] = [
  { value: 'hoy', label: 'Hoy' },
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
];

function Kpi({ k, index }: { k: BandKpi; index: number }) {
  const n = useCountUp(k.value);
  const c = BAND[k.color];
  const s = sparkPaths(k.spark);
  const d = k.deltaUp ? BAND.up : BAND.down;
  return (
    <button
      type="button"
      onClick={k.onClick}
      className="flex min-w-0 animate-up flex-col gap-2.5 overflow-hidden rounded-box border border-white/[0.08] bg-white/[0.04] p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan/45 hover:bg-white/[0.08]"
      style={{ animationDelay: `${60 + index * 60}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#8FA0B8]">
          {k.label}
        </span>
        <span
          className="grid h-[30px] w-[30px] place-items-center rounded-lg"
          style={{ background: c.tile, color: c.ink }}
        >
          <k.icon size={16} />
        </span>
      </div>
      <div className="flex items-end justify-between gap-2.5">
        <span className="tabular whitespace-nowrap font-display text-[28px] font-extrabold tracking-[-0.6px] text-white">
          {k.format(n)}
        </span>
        <svg
          height="32"
          viewBox="0 0 100 32"
          preserveAspectRatio="none"
          className="w-24 min-w-9 shrink overflow-visible"
          aria-hidden
        >
          <path d={s.area} fill={c.tile} />
          <path
            d={s.line}
            fill="none"
            stroke={c.ink}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx="100" cy={s.endY} r="3" fill={c.ink} />
        </svg>
      </div>
      <div className="flex items-center gap-1.5 text-[12.5px] text-[#8FA0B8]">
        {k.delta && (
          <span
            className="rounded-full px-2 py-0.5 font-bold"
            style={{ background: d.bg, color: d.fg }}
          >
            {k.delta}
          </span>
        )}
        <span className="truncate">{k.note}</span>
      </div>
    </button>
  );
}

/**
 * Banda navy del dashboard (siempre oscura, como el sidebar): reloj, saludo
 * según la hora, periodo y 4 KPIs con sparkline y count-up.
 */
export function DashBand({
  name,
  range,
  onRange,
  kpis,
}: {
  name: string;
  range: DashRange;
  onRange: (r: DashRange) => void;
  kpis: BandKpi[];
}) {
  // Reloj vivo; arranca en null para no desincronizar el render del servidor.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative flex animate-up flex-col gap-5 overflow-hidden rounded-[14px] bg-deep p-6 text-white">
      <div
        className="pointer-events-none absolute -right-36 -top-60 h-[620px] w-[620px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(10,107,207,0.38), transparent 64%)',
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-64 left-1/5 h-[520px] w-[520px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(24,193,255,0.12), transparent 64%)',
        }}
      />
      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1.5 min-h-[14px] font-mono text-[10.5px] uppercase tracking-[0.14em] text-cyan">
            {now ? clockLabel(now) : ''}
          </p>
          <h1 className="mb-1.5 font-display text-[28px] font-extrabold tracking-[-0.6px]">
            {now ? greeting(now) : 'Hola'}
            {name ? `, ${name}` : ''}
          </h1>
          <p className="flex items-center gap-2 text-[14px] text-[#B8C4D6]">
            <span className="relative h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-[#5FD39B]" />
              <span className="absolute inset-0 animate-ping rounded-full bg-[#5FD39B] motion-reduce:hidden" />
            </span>
            Operación en vivo · Zona Metropolitana de Guadalajara
          </p>
        </div>
        <div
          role="tablist"
          aria-label="Periodo"
          className="flex gap-1 rounded-btn bg-white/[0.07] p-1"
        >
          {RANGES.map(r => {
            const on = r.value === range;
            return (
              <button
                key={r.value}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => onRange(r.value)}
                className={`h-8 rounded-lg px-3.5 text-[13px] font-semibold transition-colors ${
                  on
                    ? 'bg-white text-[#0E2C56]'
                    : 'text-[#B8C4D6] hover:text-white'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="relative grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-2.5">
        {kpis.map((k, i) => (
          <Kpi key={k.label} k={k} index={i} />
        ))}
      </div>
    </section>
  );
}
