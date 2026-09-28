'use client';

import { useState } from 'react';
import { HEAT_DAYS, HEAT_SLOTS } from '@/lib/reportMetrics';

// Escala de la leyenda (vacío → intenso), solo tokens para que cambie en
// oscuro. Los niveles se calculan relativos al máximo del periodo.
const LEVELS = [
  'var(--color-segment)',
  'var(--color-bar-idle)',
  'color-mix(in srgb, var(--color-primary) 60%, var(--color-bar-idle))',
  'var(--color-primary)',
  'var(--color-action)',
];

const level = (v: number, max: number) =>
  v === 0 || max === 0 ? 0 : Math.min(4, 1 + Math.floor((v / max) * 3.999));

/**
 * Demanda día × franja: la celda en hover escala 1.12 y resalta su fila y
 * columna; tooltip con el conteo.
 */
export function Heatmap({ grid }: { grid: number[][] }) {
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null);
  const max = Math.max(0, ...grid.flat());

  return (
    <div className="flex flex-col gap-3">
      <div
        className="grid items-center gap-1.5"
        style={{
          gridTemplateColumns: `44px repeat(${HEAT_SLOTS.length}, minmax(0,1fr))`,
        }}
        onMouseLeave={() => setHover(null)}
      >
        <span />
        {HEAT_SLOTS.map((s, c) => (
          <span
            key={s}
            className={`text-center font-mono text-[10.5px] transition-colors ${
              hover?.c === c ? 'font-semibold text-navy' : 'text-muted'
            }`}
          >
            {s}
          </span>
        ))}
        {grid.map((row, r) => (
          <Row
            key={r}
            label={HEAT_DAYS[r]}
            row={row}
            r={r}
            max={max}
            hover={hover}
            setHover={setHover}
          />
        ))}
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="font-sans text-[12px] text-muted">
          {hover
            ? `${HEAT_DAYS[hover.r]} ${HEAT_SLOTS[hover.c]} h · ${grid[hover.r][hover.c]} solicitudes`
            : 'Pasa el cursor sobre una celda'}
        </span>
        <span className="flex items-center gap-1.5 font-sans text-[11.5px] text-muted">
          Menos
          {LEVELS.map(bg => (
            <span
              key={bg}
              className="h-3 w-3 rounded-[3px]"
              style={{ background: bg }}
            />
          ))}
          Más
        </span>
      </div>
    </div>
  );
}

function Row({
  label,
  row,
  r,
  max,
  hover,
  setHover,
}: {
  label: string;
  row: number[];
  r: number;
  max: number;
  hover: { r: number; c: number } | null;
  setHover: (h: { r: number; c: number }) => void;
}) {
  return (
    <>
      <span
        className={`font-mono text-[10.5px] transition-colors ${
          hover?.r === r ? 'font-semibold text-navy' : 'text-muted'
        }`}
      >
        {label}
      </span>
      {row.map((v, c) => {
        const active = hover?.r === r && hover?.c === c;
        const lit = hover && (hover.r === r || hover.c === c);
        return (
          <button
            key={c}
            type="button"
            onMouseEnter={() => setHover({ r, c })}
            onFocus={() => setHover({ r, c })}
            aria-label={`${label} ${HEAT_SLOTS[c]} h: ${v} solicitudes`}
            className="h-8 rounded-[5px] outline-none transition-[transform,opacity] duration-150 focus-visible:ring-2 focus-visible:ring-primary"
            style={{
              background: LEVELS[level(v, max)],
              transform: active ? 'scale(1.12)' : undefined,
              opacity: hover && !lit ? 0.45 : 1,
              zIndex: active ? 1 : undefined,
            }}
          />
        );
      })}
    </>
  );
}
