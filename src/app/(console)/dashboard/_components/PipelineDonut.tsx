'use client';

import { useState } from 'react';
import { Card } from '@/components/ds';
import { donutArcs, sum, type PipelineKey } from '@/lib/dashboard';
import { CardHead } from './shared';

const R = 70;

/**
 * Pipeline por estado: al pasar sobre un segmento (o su fila) crece de 18 a
 * 24 px, el resto baja a .3 y el centro muestra su detalle.
 */
export function PipelineDonut({
  segs,
  onOpen,
}: {
  segs: { key: PipelineKey; label: string; value: number; color: string }[];
  onOpen: () => void;
}) {
  const [hover, setHover] = useState<PipelineKey | null>(null);
  const total = sum(segs.map(s => s.value));
  const arcs = donutArcs(
    segs.map(s => s.value),
    R,
  );
  const h = segs.find(s => s.key === hover);
  const center = h
    ? {
        value: h.value,
        label: h.label,
        color: h.color,
        pct: total ? `${Math.round((h.value / total) * 100)}%` : '0%',
      }
    : {
        value: total,
        label: 'Servicios en el pipeline',
        color: undefined,
        pct: '',
      };

  return (
    <Card padded className="min-w-0 animate-up">
      <CardHead
        kicker="Pipeline por estado"
        link="Ver servicios"
        onLink={onOpen}
      />
      <div
        className="mt-3.5 flex flex-col items-center gap-3.5"
        onMouseLeave={() => setHover(null)}
      >
        <div className="relative h-[200px] w-[200px]">
          <svg
            width="200"
            height="200"
            viewBox="0 0 190 190"
            className="-rotate-90 overflow-visible"
            aria-hidden
          >
            <circle
              cx="95"
              cy="95"
              r={R}
              fill="none"
              style={{ stroke: 'var(--color-divider)' }}
              strokeWidth="18"
            />
            {segs.map((s, i) =>
              s.value ? (
                <circle
                  key={s.key}
                  cx="95"
                  cy="95"
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={hover === s.key ? 24 : 18}
                  strokeDasharray={arcs[i].dash}
                  strokeDashoffset={arcs[i].offset}
                  onMouseEnter={() => setHover(s.key)}
                  className="cursor-pointer transition-[stroke-width,opacity] duration-200"
                  style={{ opacity: hover && hover !== s.key ? 0.3 : 1 }}
                />
              ) : null,
            )}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              className="tabular font-display text-[32px] font-extrabold tracking-[-0.6px] text-navy transition-colors"
              style={center.color ? { color: center.color } : undefined}
            >
              {center.value}
            </span>
            <span className="max-w-[110px] text-[12.5px] font-semibold text-body">
              {center.label}
            </span>
            {center.pct && (
              <span className="font-mono text-[11px] text-faint">
                {center.pct}
              </span>
            )}
          </div>
        </div>
        <div className="grid w-full grid-cols-2 gap-1.5">
          {segs.map(s => (
            <div
              key={s.key}
              onMouseEnter={() => setHover(s.key)}
              className={`flex cursor-pointer flex-col gap-1 rounded-btn border border-divider p-2.5 transition-colors ${
                hover === s.key ? 'bg-panel' : ''
              }`}
            >
              <span className="flex items-center gap-1.5 text-[12px] text-body">
                <span
                  className="h-2 w-2 rounded-[2px]"
                  style={{ background: s.color }}
                />
                {s.label}
              </span>
              <span className="flex items-baseline justify-between">
                <b className="tabular font-display text-[17px] font-extrabold text-navy">
                  {s.value}
                </b>
                <span className="font-mono text-[11px] text-faint">
                  {total ? Math.round((s.value / total) * 100) : 0}%
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
