'use client';

import { useState } from 'react';
import { HEAT_DAYS, HEAT_SLOTS } from '@/lib/reportMetrics';
import { HEAT_GRADIENT, HEAT_STOPS, heatColor } from '@/lib/heatScale';

type Cell = { r: number; c: number };

/**
 * Color de celda: 0 = neutro (sin demanda no es «bueno»); el resto usa la
 * escala estándar verde → amarillo → naranja → rojo (lib/heatScale, fuera del
 * kit de marca) normalizada entre el mínimo y el máximo del periodo para que
 * el contraste no se pierda cuando los valores están cerca.
 */
type Range = { lo: number; hi: number };
const cellT = (v: number, { lo, hi }: Range) => (hi > lo ? (v - lo) / (hi - lo) : 1);
const cellColor = (v: number, rg: Range) =>
  v === 0 || rg.hi === 0 ? 'var(--color-segment)' : heatColor(cellT(v, rg));

/**
 * Demanda día × franja. Celdas limpias (el detalle va en el tooltip), resumen
 * arriba, totales discretos por día y franja, pico marcado.
 */
export function Heatmap({ grid }: { grid: number[][] }) {
  const [hover, setHover] = useState<Cell | null>(null);
  const flat = grid.flat();
  const max = Math.max(0, ...flat);
  const total = flat.reduce((s, v) => s + v, 0);
  const rg: Range = { lo: Math.min(...flat.filter(v => v > 0), max), hi: max };
  const dayTotals = grid.map(row => row.reduce((s, v) => s + v, 0));
  const slotTotals = HEAT_SLOTS.map((_, c) => grid.reduce((s, row) => s + (row[c] ?? 0), 0));
  const maxDay = Math.max(1, ...dayTotals);
  const maxSlot = Math.max(1, ...slotTotals);
  const peakIdx = flat.indexOf(max);
  const peak: Cell | null =
    max > 0 ? { r: Math.floor(peakIdx / HEAT_SLOTS.length), c: peakIdx % HEAT_SLOTS.length } : null;
  const busyDay = dayTotals.indexOf(Math.max(...dayTotals));
  const busySlot = slotTotals.indexOf(Math.max(...slotTotals));

  if (!total)
    return <p className="py-10 text-center font-sans text-[13px] text-muted">Sin solicitudes en el periodo.</p>;

  return (
    <div className="flex flex-col gap-4">
      {/* Resumen */}
      <div className="grid grid-cols-1 gap-2 min-[641px]:grid-cols-3">
        {[
          ['Pico', `${HEAT_DAYS[peak!.r]} ${HEAT_SLOTS[peak!.c]} h`, `${max} solicitudes`],
          ['Día más activo', HEAT_DAYS[busyDay], `${dayTotals[busyDay]} · ${Math.round((dayTotals[busyDay] / total) * 100)}%`],
          ['Franja más activa', `${HEAT_SLOTS[busySlot]} h`, `${slotTotals[busySlot]} · ${Math.round((slotTotals[busySlot] / total) * 100)}%`],
        ].map(([k, v, m]) => (
          <div
            key={k}
            className="flex min-w-0 items-baseline justify-between gap-3 rounded-[10px] bg-panel px-3 py-2 min-[641px]:block"
          >
            <div className="truncate font-mono text-[9.5px] uppercase tracking-[0.12em] text-faint">{k}</div>
            <div className="truncate font-display text-[15px] font-extrabold text-navy max-[640px]:ml-auto">{v}</div>
            <div className="truncate font-mono text-[10.5px] text-muted tabular">{m}</div>
          </div>
        ))}
      </div>

      <div className="relative" onMouseLeave={() => setHover(null)}>
        <div className="grid items-center gap-x-[5px] gap-y-[5px] [grid-template-columns:28px_repeat(6,minmax(0,1fr))] min-[641px]:[grid-template-columns:40px_repeat(6,minmax(0,1fr))_56px]">
          {/* Encabezado de franjas */}
          <span />
          {HEAT_SLOTS.map((s, c) => (
            <span
              key={s}
              className={`whitespace-nowrap pb-0.5 text-center font-mono text-[9px] transition-colors min-[641px]:text-[10.5px] ${
                hover?.c === c ? 'font-semibold text-navy' : 'text-faint'
              }`}
            >
              {s}
            </span>
          ))}
          <span className="hidden text-right font-mono text-[9.5px] uppercase tracking-[0.1em] text-faint min-[641px]:block">
            Total
          </span>

          {grid.map((row, r) => (
            <Row
              key={r}
              r={r}
              row={row}
              rg={rg}
              hover={hover}
              setHover={setHover}
              peak={peak}
              dayTotal={dayTotals[r]}
              maxDay={maxDay}
            />
          ))}

          {/* Totales por franja: barras finas bajo cada columna */}
          <span />
          {slotTotals.map((t, c) => (
            <div key={c} className="flex flex-col items-center gap-1 pt-1.5">
              <div className="h-1 w-full overflow-hidden rounded-full bg-segment">
                <div
                  className={`h-full rounded-full transition-[width,background-color] duration-500 ${hover?.c === c ? 'bg-navy' : 'bg-line-strong'}`}
                  style={{ width: `${(t / maxSlot) * 100}%` }}
                />
              </div>
              <span className={`font-mono text-[10px] tabular ${hover?.c === c ? 'text-navy' : 'text-faint'}`}>{t}</span>
            </div>
          ))}
          <span className="hidden pt-1.5 text-right font-mono text-[11px] font-semibold tabular text-navy min-[641px]:block">
            {total}
          </span>
        </div>

        {hover && (
          <HeatTip grid={grid} cell={hover} rg={rg} total={total} slotTotals={slotTotals} dayTotals={dayTotals} peak={peak} />
        )}
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-sans text-[12px] text-muted">
          <span className="pointer-coarse:hidden">Pasa el cursor sobre una celda para ver el detalle</span>
          <span className="hidden pointer-coarse:inline">Toca una celda para ver el detalle</span>
        </span>
        <span className="flex items-center gap-2 font-mono text-[10.5px] text-muted">
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-[3px] bg-segment" /> 0
          </span>
          <span>{rg.lo}</span>
          <span className="h-2 w-28 rounded-full" style={{ background: HEAT_GRADIENT }} />
          <span>{rg.hi}</span>
          <span className="sr-only">Escala: {HEAT_STOPS.length} colores de baja a alta</span>
        </span>
      </div>
    </div>
  );
}

function Row({
  r,
  row,
  rg,
  hover,
  setHover,
  peak,
  dayTotal,
  maxDay,
}: {
  r: number;
  row: number[];
  rg: Range;
  hover: Cell | null;
  setHover: (h: Cell) => void;
  peak: Cell | null;
  dayTotal: number;
  maxDay: number;
}) {
  const label = HEAT_DAYS[r];
  return (
    <>
      <span
        className={`font-mono text-[10.5px] transition-colors ${hover?.r === r ? 'font-semibold text-navy' : 'text-muted'}`}
      >
        {label}
      </span>
      {row.map((v, c) => {
        const active = hover?.r === r && hover?.c === c;
        const isPeak = peak?.r === r && peak?.c === c;
        return (
          <button
            key={c}
            type="button"
            onMouseEnter={() => setHover({ r, c })}
            onFocus={() => setHover({ r, c })}
            onClick={() => setHover({ r, c })}
            aria-label={`${label} ${HEAT_SLOTS[c]} h: ${v} solicitudes${isPeak ? ' (pico)' : ''}`}
            className="relative h-8 rounded-[6px] outline-none transition-[transform,opacity,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-primary min-[641px]:h-9"
            style={{
              background: cellColor(v, rg),
              transform: active ? 'scale(1.08)' : undefined,
              zIndex: active ? 2 : undefined,
              boxShadow: active
                ? `0 0 0 2px var(--color-card), 0 0 0 4px ${v ? heatColor(cellT(v, rg)) : 'var(--color-line-strong)'}`
                : undefined,
            }}
          >
            {isPeak && (
              <span className="absolute inset-0 grid place-items-center font-mono text-[10px] font-bold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">
                {v}
              </span>
            )}
          </button>
        );
      })}
      <div className="hidden items-center justify-end gap-1.5 min-[641px]:flex">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-segment">
          <div
            className={`h-full rounded-full transition-[width,background-color] duration-500 ${hover?.r === r ? 'bg-navy' : 'bg-line-strong'}`}
            style={{ width: `${(dayTotal / maxDay) * 100}%` }}
          />
        </div>
        <span className={`w-6 text-right font-mono text-[10.5px] tabular ${hover?.r === r ? 'text-navy' : 'text-faint'}`}>
          {dayTotal}
        </span>
      </div>
    </>
  );
}

function HeatTip({
  grid,
  cell,
  rg,
  total,
  slotTotals,
  dayTotals,
  peak,
}: {
  grid: number[][];
  cell: Cell;
  rg: Range;
  total: number;
  slotTotals: number[];
  dayTotals: number[];
  peak: Cell | null;
}) {
  const v = grid[cell.r][cell.c];
  const slotAvg = slotTotals[cell.c] / Math.max(1, grid.length);
  const vsAvg = slotAvg ? Math.round(((v - slotAvg) / slotAvg) * 100) : null;
  const rank = 1 + grid.flat().filter(x => x > v).length;
  const ofDay = dayTotals[cell.r] ? Math.round((v / dayTotals[cell.r]) * 100) : 0;
  const n = HEAT_SLOTS.length;
  // Ancla horizontal sobre la columna; se acota para no salirse de la tarjeta.
  const left = `clamp(100px, calc(28px + (100% - 28px) * ${(cell.c + 0.5) / n}), calc(100% - 100px))`;
  return (
    <div
      className="pointer-events-none absolute z-20 w-[200px] -translate-x-1/2 -translate-y-full rounded-[12px] border border-white/10 bg-[rgba(6,27,58,0.95)] px-3.5 py-2.5 text-xs text-white shadow-[0_18px_40px_-12px_rgba(6,27,58,0.6)] backdrop-blur-md"
      style={{ left, top: `calc(18px + ${cell.r} * 41px)` }}
    >
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: cellColor(v, rg) }} />
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/60">
          {HEAT_DAYS[cell.r]} · {HEAT_SLOTS[cell.c]} h
        </span>
        {peak?.r === cell.r && peak?.c === cell.c && (
          <span className="ml-auto rounded-full bg-[#E74C3C] px-1.5 py-px text-[9px] font-bold tracking-wide">PICO</span>
        )}
      </div>
      <div className="mt-1 font-display text-[19px] font-extrabold tabular-nums">
        {v} <span className="text-[12px] font-semibold text-white/55">solicitudes</span>
      </div>
      <div className="my-1.5 h-px bg-white/10" />
      {[
        ['Del total del periodo', `${total ? Math.round((v / total) * 100) : 0}%`],
        [`Del ${HEAT_DAYS[cell.r].toLowerCase()}`, `${ofDay}%`],
        ['vs promedio de la franja', vsAvg == null ? '—' : `${vsAvg >= 0 ? '+' : '−'}${Math.abs(vsAvg)}%`],
        ['Ranking', `#${rank} de ${grid.flat().length}`],
      ].map(([l, val]) => (
        <div key={l} className="mt-0.5 flex justify-between gap-4 text-[11px] text-white/60">
          <span>{l}</span>
          <span className="font-mono tabular-nums text-white/90">{val}</span>
        </div>
      ))}
      <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 border-b border-r border-white/10 bg-[rgba(6,27,58,0.95)]" />
    </div>
  );
}
