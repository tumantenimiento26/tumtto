'use client';

import { useId, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Card, Segmented } from '@/components/ds';
import {
  average,
  deltaPct,
  linePaths,
  niceMax,
  peakIndex,
  sum,
  type DashMetric,
} from '@/lib/dashboard';
import { money } from './shared';

const METRICS: { value: DashMetric; label: string }[] = [
  { value: 'gmv', label: 'GMV' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'ticket', label: 'Ticket medio' },
];

const W = 600;
const H = 200;

const pct = (v: number | null) =>
  v == null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;

/**
 * Gráfica de línea del dashboard: métrica seleccionable, área con degradado,
 * periodo anterior (toggle), promedio punteado cian, marcador del máximo y
 * tooltip navy siguiendo la columna bajo el cursor.
 */
export function GmvChart({
  metric,
  onMetric,
  labels,
  values,
  prev,
}: {
  metric: DashMetric;
  onMetric: (m: DashMetric) => void;
  labels: string[];
  values: number[];
  prev: number[];
}) {
  const gid = useId().replace(/:/g, '');
  const reduced = useReducedMotion();
  const [showPrev, setShowPrev] = useState(true);
  const [hover, setHover] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);

  const fmt = (v: number) =>
    metric === 'servicios' ? v.toLocaleString('es-MX') : money(v);
  const n = values.length;

  const { max, cur, old, avg, peak, total, delta } = useMemo(() => {
    // Piso del eje: sin ventas, un tope de 1 daba ticks "$1 $1 $1 $0".
    const floor = metric === 'servicios' ? 4 : 1000;
    const max = niceMax(Math.max(floor, ...values, ...(showPrev ? prev : [])));
    const cur = linePaths(values, max, W, H);
    const old = linePaths(prev, max, W, H);
    const avg = average(values);
    // Ticket medio: promedio de las cubetas con ventas, no la suma.
    const withSales = values.filter(v => v > 0);
    const total =
      metric === 'ticket'
        ? withSales.length
          ? average(withSales)
          : 0
        : sum(values);
    const prevWith = prev.filter(v => v > 0);
    const prevTotal =
      metric === 'ticket'
        ? prevWith.length
          ? average(prevWith)
          : 0
        : sum(prev);
    return {
      max,
      cur,
      old,
      avg,
      peak: peakIndex(values),
      total,
      delta: deltaPct(total, prevTotal),
    };
  }, [values, prev, showPrev, metric]);

  const xPct = (i: number) => (n > 1 ? (i / (n - 1)) * 100 : 50);
  const yPx = (v: number) => H - (Math.min(v, max) / max) * H;
  const labelEvery = n > 14 ? 5 : 1;

  const onMove = (e: React.MouseEvent) => {
    const r = box.current?.getBoundingClientRect();
    if (!r || n === 0) return;
    const rel = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    setHover(Math.round(rel * (n - 1)));
  };

  const tip =
    hover != null
      ? (() => {
          const v = values[hover];
          const p = prev[hover] ?? 0;
          const rows: { l: string; v: string; c?: string }[] = [];
          if (showPrev) {
            const d = deltaPct(v, p);
            rows.push({ l: 'Periodo anterior', v: fmt(p), c: '#B8C4D6' });
            rows.push({
              l: 'Variación',
              v: pct(d),
              c: d == null ? '#B8C4D6' : d >= 0 ? '#5FD39B' : '#F87171',
            });
          }
          const va = deltaPct(v, avg);
          rows.push({
            l: 'Vs. promedio',
            v: pct(va),
            c: va == null ? '#B8C4D6' : va >= 0 ? '#5FD39B' : '#F87171',
          });
          const y = yPx(v);
          return { v, rows, x: xPct(hover), y, below: y < 110 };
        })()
      : null;

  return (
    <Card padded className="min-w-0 animate-up">
      <div className="mb-[18px] flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2.5">
          <Segmented
            size="sm"
            options={METRICS}
            value={metric}
            onChange={onMetric}
            aria-label="Métrica"
          />
          <div className="flex flex-wrap items-baseline gap-2.5">
            <span className="tabular font-display text-[28px] font-extrabold tracking-[-0.6px] text-navy">
              {fmt(total)}
            </span>
            {delta != null && (
              <span
                className={`rounded-full px-2 py-0.5 text-[12.5px] font-semibold ${
                  delta >= 0
                    ? 'bg-success-soft text-success'
                    : 'bg-error-soft text-error'
                }`}
              >
                {pct(delta)} vs periodo anterior
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3.5 text-[12.5px] text-body">
          <span className="flex items-center gap-1.5">
            <span className="h-[3px] w-3.5 rounded-sm bg-primary" />
            Actual
          </span>
          <button
            type="button"
            onClick={() => setShowPrev(s => !s)}
            aria-pressed={showPrev}
            className={`flex h-7 items-center gap-1.5 rounded-full border border-line px-2.5 font-semibold hover:bg-panel ${
              showPrev ? 'text-body' : 'text-faint'
            }`}
          >
            <span
              className={`w-3.5 border-t-2 border-dashed ${
                showPrev ? 'border-faint' : 'border-line-strong'
              }`}
            />
            Periodo anterior
          </button>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 border-t-2 border-dotted border-cyan" />
            Promedio
          </span>
        </div>
      </div>

      <div className="ml-12">
        <div
          ref={box}
          className="relative h-[240px] cursor-crosshair"
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        >
          {[1, 0.75, 0.5, 0.25].map(f => (
            <div
              key={f}
              className="absolute inset-x-0 border-t border-dashed border-divider"
              style={{ top: H - f * H }}
            >
              <span className="absolute right-[calc(100%+8px)] top-[-8px] whitespace-nowrap font-mono text-[10.5px] text-faint">
                {metric === 'servicios'
                  ? Math.round(max * f)
                  : max * f >= 1000
                    ? `$${Math.round((max * f) / 1000)}k`
                    : money(max * f)}
              </span>
            </div>
          ))}
          <div
            className="absolute inset-x-0 border-t border-line"
            style={{ top: H }}
          />

          {tip && n > 1 && (
            <div
              className="pointer-events-none absolute top-0 rounded-lg bg-primary/[0.06] transition-[left] duration-100"
              style={{
                left: `calc(${tip.x}% - ${50 / (n - 1)}%)`,
                width: `${100 / (n - 1)}%`,
                height: H,
              }}
            />
          )}

          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="absolute left-0 top-0 w-full overflow-visible"
            style={{ height: H }}
            aria-hidden
          >
            <defs>
              <linearGradient id={`gA${gid}`} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0"
                  style={{
                    stopColor: 'var(--color-primary)',
                    stopOpacity: 0.22,
                  }}
                />
                <stop
                  offset="1"
                  style={{ stopColor: 'var(--color-primary)', stopOpacity: 0 }}
                />
              </linearGradient>
              {/* Revelado izquierda→derecha (pathLength no funciona con
                  non-scaling-stroke en un SVG estirado). */}
              <clipPath id={`gC${gid}`}>
                <rect
                  key={`c-${metric}-${n}`}
                  x="0"
                  y="-20"
                  width={reduced ? W : 0}
                  height={H + 40}
                >
                  {!reduced && (
                    <animate
                      attributeName="width"
                      from="0"
                      to={W}
                      dur="1.2s"
                      fill="freeze"
                      calcMode="spline"
                      keySplines="0.3 0.8 0.3 1"
                      keyTimes="0;1"
                    />
                  )}
                </rect>
              </clipPath>
            </defs>
            <g clipPath={`url(#gC${gid})`}>
              <path d={cur.area} fill={`url(#gA${gid})`} />
            </g>
            {showPrev && prev.length > 0 && (
              <path
                d={old.line}
                fill="none"
                style={{ stroke: 'var(--color-faint)' }}
                strokeWidth="1.5"
                strokeDasharray="5 5"
                vectorEffect="non-scaling-stroke"
              />
            )}
            <g clipPath={`url(#gC${gid})`}>
              <path
                d={cur.line}
                fill="none"
                style={{ stroke: 'var(--color-primary)' }}
                strokeWidth="2.75"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          </svg>

          {/* Promedio */}
          <div
            className="pointer-events-none absolute inset-x-0 border-t-[1.5px] border-dotted border-cyan transition-[top] duration-300"
            style={{ top: yPx(avg) }}
          >
            <span className="absolute right-0 top-[-11px] rounded-full bg-info-soft px-2 py-0.5 font-mono text-[10.5px] font-semibold text-primary">
              Prom. {fmt(avg)}
            </span>
          </div>

          {/* Máximo */}
          {peak >= 0 && (
            <>
              <div
                className="pointer-events-none absolute -ml-1.5 -mt-1.5 h-[11px] w-[11px] animate-pop rounded-full border-[2.5px] border-primary bg-card"
                style={{ left: `${xPct(peak)}%`, top: yPx(values[peak]) }}
              />
              <div
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-[34px] animate-pop whitespace-nowrap rounded-full bg-action px-2.5 py-0.5 font-mono text-[10.5px] font-semibold text-white"
                style={{ left: `${xPct(peak)}%`, top: yPx(values[peak]) }}
              >
                Máx. {fmt(values[peak])}
              </div>
            </>
          )}

          {tip && (
            <>
              {showPrev && prev[hover!] != null && (
                <div
                  className="pointer-events-none absolute -ml-[5px] -mt-[5px] h-[9px] w-[9px] rounded-full border-2 border-faint bg-card"
                  style={{ left: `${tip.x}%`, top: yPx(prev[hover!]) }}
                />
              )}
              <div
                className="pointer-events-none absolute -ml-[7px] -mt-[7px] h-3.5 w-3.5 rounded-full border-[3px] border-card bg-primary shadow-[0_0_0_4px_rgba(10,107,207,0.18)] transition-[left,top] duration-100"
                style={{ left: `${tip.x}%`, top: tip.y }}
              />
              <div
                className="pointer-events-none absolute z-10 w-[200px] rounded-box bg-tooltip px-3.5 py-3 text-white shadow-float transition-[left,top] duration-100"
                style={{
                  left: `clamp(100px, ${tip.x}%, calc(100% - 100px))`,
                  top: tip.below ? tip.y + 16 : tip.y - 16,
                  transform: `translate(-50%, ${tip.below ? '0' : '-100%'})`,
                }}
              >
                <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[#8FA0B8]">
                  {labels[hover!]}
                </div>
                <div className="mb-2 mt-0.5 font-display text-[19px] font-extrabold">
                  {fmt(tip.v)}
                </div>
                {tip.rows.map(r => (
                  <div
                    key={r.l}
                    className="flex justify-between gap-2.5 border-t border-white/[0.08] py-1 text-[12px] text-[#B8C4D6]"
                  >
                    <span>{r.l}</span>
                    <b
                      className="font-mono font-semibold"
                      style={{ color: r.c }}
                    >
                      {r.v}
                    </b>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Eje X */}
          {labels.map((l, i) =>
            i % labelEvery === 0 || i === n - 1 ? (
              <span
                key={i}
                className={`absolute bottom-1.5 -translate-x-1/2 font-mono text-[10.5px] transition-colors ${
                  hover === i ? 'font-bold text-primary' : 'text-faint'
                }`}
                style={{ left: `${xPct(i)}%` }}
              >
                {l}
              </span>
            ) : null,
          )}
        </div>
      </div>
    </Card>
  );
}
