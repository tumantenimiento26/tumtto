'use client';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { motion, EASE } from './motion';
import { CategoryIcon } from './category-icon';

/**
 * Gráficas interactivas del admin (SVG puro, sin dependencias de chart libs).
 * Método dataviz: marca delgada, grid recesivo, tooltip compartido, hover layer
 * por defecto, controles de configuración en una fila sobre la gráfica,
 * animaciones que respetan prefers-reduced-motion.
 *
 * Colores por variable CSS (`var(--color-*)`): siguen el tema claro/oscuro
 * igual que el resto de la consola (SVG acepta var() en fill/stroke).
 */
const PRIMARY = 'var(--color-primary)';
const CYAN = 'var(--color-cyan)';
const GRID = 'var(--color-line)';
const FAINT = 'var(--color-faint)';
const MUTED = 'var(--color-muted)';

// ── Tooltip compartido (un div absoluto por contenedor de gráfica) ───────────
type TipState = { x: number; y: number; body: React.ReactNode } | null;

function useTip(boxRef: React.RefObject<HTMLDivElement | null>) {
  const [tip, setTip] = useState<TipState>(null);
  /** Sigue al mouse dentro del contenedor. */
  const moveTip = (e: React.MouseEvent, body: React.ReactNode) => {
    const r = boxRef.current?.getBoundingClientRect();
    if (r) setTip({ x: e.clientX - r.left, y: e.clientY - r.top, body });
  };
  /** Ancla en coordenadas del contenedor (celdas / focus / teclado). */
  const showAt = (x: number, y: number, body: React.ReactNode) =>
    setTip({ x, y, body });
  /** a11y: ancla el tooltip sobre el elemento enfocado (teclado). */
  const focusTip = (e: React.FocusEvent<Element>, body: React.ReactNode) => {
    const r = boxRef.current?.getBoundingClientRect();
    if (!r) return;
    const b = e.currentTarget.getBoundingClientRect();
    setTip({ x: b.left + b.width / 2 - r.left, y: b.top - r.top, body });
  };
  const hide = () => setTip(null);
  return { tip, moveTip, showAt, focusTip, hide };
}

function Tip({ tip }: { tip: TipState }) {
  // Conserva el último contenido para que el fade-out (120ms) no parpadee.
  const last = useRef<TipState>(null);
  if (tip) last.current = tip;
  const t = tip ?? last.current;
  if (!t) return null;
  return (
    <div
      className={`pointer-events-none absolute z-20 min-w-[168px] whitespace-nowrap rounded-[12px] border border-white/10 bg-[rgba(6,27,58,0.92)] px-3.5 py-2.5 text-xs text-white shadow-[0_18px_40px_-12px_rgba(6,27,58,0.6)] backdrop-blur-md transition-[opacity,transform] duration-150 ${tip ? 'opacity-100' : 'opacity-0'}`}
      style={{
        left: t.x,
        top: t.y,
        transform: `translate(-50%, calc(-100% - ${tip ? 12 : 6}px))`,
      }}
    >
      {t.body}
      {/* flecha */}
      <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 border-b border-r border-white/10 bg-[rgba(6,27,58,0.92)]" />
    </div>
  );
}

function TipBody({
  title,
  value,
  meta,
  delta,
  deltaTone,
  rows,
}: {
  title: string;
  value: string;
  meta?: string;
  /** Cambio vs punto/periodo anterior, ej. "▲ +8.2% vs sem. anterior". */
  delta?: string;
  deltaTone?: 'up' | 'down';
  /** Renglones extra (comparativa, métricas secundarias). */
  rows?: { label: string; value: string }[];
}) {
  return (
    <>
      <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/60">{title}</div>
      <div className="mt-0.5 font-display text-[17px] font-extrabold tabular-nums tracking-[-0.3px]">
        {value}
      </div>
      {delta && (
        <div
          className={`mt-0.5 text-[11px] font-semibold ${deltaTone === 'down' ? 'text-[#FCA5A5]' : 'text-[#6EE7B7]'}`}
        >
          {delta}
        </div>
      )}
      {rows && rows.length > 0 && <div className="my-1.5 h-px bg-white/10" />}
      {rows?.map(r => (
        <div
          key={r.label}
          className="mt-0.5 flex items-baseline justify-between gap-4 text-[11px] text-white/60"
        >
          <span>{r.label}</span>
          <span className="font-mono tabular-nums text-white/85">
            {r.value}
          </span>
        </div>
      ))}
      {meta && <div className="mt-0.5 text-[11px] text-white/60">{meta}</div>}
    </>
  );
}

/** «+12%» / «−8%» de a contra b (null si no hay base). */
const vs = (a: number, b: number | null | undefined) =>
  b ? `${a >= b ? '+' : '−'}${Math.abs(((a - b) / b) * 100).toFixed(0)}%` : null;
/** Posición de `v` en la serie (1 = más alto). */
const rankOf = (v: number, all: number[]) => 1 + all.filter(x => x > v).length;

/** Mide el ancho del contenedor para que el SVG sea fluido sin distorsión. */
function useWidth(fallback = 600) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(entries =>
      setW(entries[0].contentRect.width),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, w };
}

const num = (v: number) => v.toLocaleString('es-MX');

// ── Controles de gráfica (fila única sobre la gráfica) ───────────────────────
function CChip({
  on,
  onClick,
  children,
  title,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      title={title}
      className={`rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors ${
        on
          ? 'border-primary-fill bg-primary-fill text-white'
          : 'border-line bg-card text-muted hover:border-primary/40 hover:text-primary'
      }`}
    >
      {children}
    </button>
  );
}

// ── LineChart (área + línea, configurable) ───────────────────────────────────
export function LineChart({
  data,
  format = num,
  height = 220,
  controls,
}: {
  data: { label: string; value: number; meta?: string }[];
  format?: (v: number) => string;
  height?: number;
  /** Controles opcionales en una fila sobre la gráfica. */
  controls?: {
    /** Selector de rango: recorta a los últimos n puntos. */
    ranges?: { label: string; n: number }[];
    /** Toggle de línea de promedio (referencia punteada). */
    avg?: boolean;
    /** Serie fantasma del periodo anterior (misma longitud que data). */
    compare?: { label: string; values: number[] };
  };
}) {
  const { ref, w } = useWidth();
  const { tip, moveTip, showAt, hide } = useTip(ref);
  const reduced = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const [rangeN, setRangeN] = useState<number>(
    controls?.ranges?.at(-1)?.n ?? data.length,
  );
  const [showAvg, setShowAvg] = useState(false);
  const [showCmp, setShowCmp] = useState(false);
  const gradId = useId();

  const view = useMemo(() => data.slice(-rangeN), [data, rangeN]);
  const cmpView = useMemo(
    () => (controls?.compare ? controls.compare.values.slice(-rangeN) : null),
    [controls?.compare, rangeN],
  );
  const n = view.length;

  const max = Math.max(
    1,
    ...view.map(d => d.value),
    ...(showCmp && cmpView ? cmpView : [0]),
  );
  const avg = useMemo(
    () => (n ? view.reduce((s, d) => s + d.value, 0) / n : 0),
    [view, n],
  );
  const ticks = [0.25, 0.5, 0.75, 1].map(t => ({
    t,
    label: format(Math.round(max * t)),
  }));
  const padLeft = 14 + Math.max(...ticks.map(x => x.label.length)) * 6.2; // mono 10px ≈ 6.2px/char
  const PAD = { top: 10, right: 12, bottom: 22, left: padLeft };
  const iw = Math.max(10, w - PAD.left - PAD.right);
  const ih = height - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (n > 1 ? (i / (n - 1)) * iw : iw / 2);
  const y = (v: number) => PAD.top + ih - (v / max) * ih;

  const path = (vals: number[]) =>
    vals
      .map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
      .join(' ');
  const linePath = path(view.map(d => d.value));
  const areaPath = `${linePath} L${x(n - 1).toFixed(1)},${(PAD.top + ih).toFixed(1)} L${x(0).toFixed(1)},${(PAD.top + ih).toFixed(1)} Z`;

  // ~5 etiquetas x equidistantes
  const xIdx = useMemo(
    () =>
      n <= 5
        ? view.map((_, i) => i)
        : [
            ...new Set(
              Array.from({ length: 5 }, (_, k) =>
                Math.round((k * (n - 1)) / 4),
              ),
            ),
          ],
    [view, n],
  );

  const tipFor = (i: number) => {
    const d = view[i];
    const prev = i > 0 ? view[i - 1].value : null;
    const deltaPct = prev ? ((d.value - prev) / prev) * 100 : null;
    return (
      <TipBody
        title={d.label}
        value={format(d.value)}
        delta={
          deltaPct != null
            ? `${deltaPct >= 0 ? '▲ +' : '▼ '}${deltaPct.toFixed(1)}% vs punto anterior`
            : undefined
        }
        deltaTone={deltaPct != null && deltaPct < 0 ? 'down' : 'up'}
        rows={[
          ...(cmpView?.[i] != null
            ? [
                {
                  label: controls?.compare?.label ?? 'Periodo anterior',
                  value: `${format(cmpView[i]!)}${vs(d.value, cmpView[i]) ? ` · ${vs(d.value, cmpView[i])}` : ''}`,
                },
              ]
            : []),
          {
            label: 'vs promedio',
            value: `${vs(d.value, avg) ?? '—'} (${format(Math.round(avg))})`,
          },
          {
            label: 'Ranking',
            value: `#${rankOf(d.value, view.map(v => v.value))} de ${view.length}`,
          },
        ]}
        meta={d.meta}
      />
    );
  };

  const focusIdx = (i: number) => {
    setHover(i);
    showAt(x(i), y(view[i].value) - 6, tipFor(i));
  };
  function onMove(e: React.MouseEvent) {
    const r = ref.current?.getBoundingClientRect();
    if (!r || n === 0) return;
    const i = Math.min(
      n - 1,
      Math.max(0, Math.round(((e.clientX - r.left - PAD.left) / iw) * (n - 1))),
    );
    setHover(i);
    moveTip(e, tipFor(i));
  }
  function onKey(e: React.KeyboardEvent) {
    if (!n) return;
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const next =
      hover == null
        ? n - 1
        : Math.min(
            n - 1,
            Math.max(0, hover + (e.key === 'ArrowRight' ? 1 : -1)),
          );
    focusIdx(next);
  }
  const leave = () => {
    setHover(null);
    hide();
  };

  const hasControls =
    controls && (controls.ranges || controls.avg || controls.compare);

  return (
    <div>
      {hasControls && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {controls.ranges?.map(rg => (
            <CChip
              key={rg.label}
              on={rangeN === rg.n}
              onClick={() => {
                setRangeN(rg.n);
                setHover(null);
                hide();
              }}
            >
              {rg.label}
            </CChip>
          ))}
          {(controls.avg || controls.compare) && controls.ranges && (
            <span className="mx-1 h-4 w-px bg-line" />
          )}
          {controls.avg && (
            <CChip
              on={showAvg}
              onClick={() => setShowAvg(v => !v)}
              title="Línea de promedio del rango"
            >
              Promedio
            </CChip>
          )}
          {controls.compare && (
            <CChip
              on={showCmp}
              onClick={() => setShowCmp(v => !v)}
              title="Serie del periodo anterior"
            >
              {controls.compare.label}
            </CChip>
          )}
        </div>
      )}

      <div ref={ref} className="relative">
        <svg width={w} height={height} role="img" aria-label="Gráfica de línea">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.22} />
              <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
            </linearGradient>
          </defs>
          {/* grid recesivo: baseline + 4 líneas con etiqueta mono */}
          <line
            x1={PAD.left}
            x2={PAD.left + iw}
            y1={PAD.top + ih}
            y2={PAD.top + ih}
            stroke={GRID}
          />
          {ticks.map(({ t, label }) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={PAD.left + iw}
                y1={y(max * t)}
                y2={y(max * t)}
                stroke={GRID}
              />
              <text
                x={PAD.left - 8}
                y={y(max * t) + 3}
                textAnchor="end"
                fontSize={11}
                fill={FAINT}
                className="font-mono tabular-nums"
              >
                {label}
              </text>
            </g>
          ))}
          {xIdx.map(i => (
            <text
              key={i}
              x={x(i)}
              y={height - 6}
              // Extremos alineados hacia dentro: centrados se cortaban («20-no»).
              textAnchor={i === 0 ? 'start' : i === view.length - 1 ? 'end' : 'middle'}
              fontSize={11}
              fill={FAINT}
              className="font-mono"
            >
              {view[i].label}
            </text>
          ))}

          {/* comparativa fantasma (periodo anterior) */}
          {showCmp && cmpView && (
            <path
              d={path(cmpView)}
              fill="none"
              stroke={FAINT}
              strokeWidth={1.6}
              strokeDasharray="5 4"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          <motion.path
            key={`a-${rangeN}`}
            d={areaPath}
            fill={`url(#${gradId})`}
            initial={{ opacity: reduced ? 1 : 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.6,
              ease: EASE,
              delay: reduced ? 0 : 0.35,
            }}
          />
          <motion.path
            key={`l-${rangeN}`}
            d={linePath}
            fill="none"
            stroke={PRIMARY}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={{ pathLength: reduced ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: EASE }}
          />

          {/* promedio del rango */}
          {showAvg && (
            <g>
              <line
                x1={PAD.left}
                x2={PAD.left + iw}
                y1={y(avg)}
                y2={y(avg)}
                stroke={MUTED}
                strokeWidth={1.4}
                strokeDasharray="6 4"
              />
              <text
                x={PAD.left + iw - 4}
                y={y(avg) - 5}
                textAnchor="end"
                fontSize={10.5}
                fill={MUTED}
                className="font-mono tabular-nums"
              >
                prom {format(Math.round(avg))}
              </text>
            </g>
          )}

          {/* punto final siempre enfatizado */}
          {n > 0 && (
            <circle
              cx={x(n - 1)}
              cy={y(view[n - 1].value)}
              r={3.5}
              fill={CYAN}
              stroke="#fff"
              strokeWidth={1.5}
            />
          )}

          {hover != null && (
            <g pointerEvents="none">
              <line
                x1={x(hover)}
                x2={x(hover)}
                y1={PAD.top}
                y2={PAD.top + ih}
                stroke={FAINT}
                strokeDasharray="3 3"
              />
              <line
                x1={PAD.left}
                x2={x(hover)}
                y1={y(view[hover].value)}
                y2={y(view[hover].value)}
                stroke={FAINT}
                strokeDasharray="3 3"
                opacity={0.7}
              />
              {showCmp && cmpView?.[hover] != null && (
                <circle
                  cx={x(hover)}
                  cy={y(cmpView[hover])}
                  r={3.5}
                  fill="#fff"
                  stroke={FAINT}
                  strokeWidth={1.6}
                />
              )}
              <circle
                cx={x(hover)}
                cy={y(view[hover].value)}
                r={4.5}
                fill={PRIMARY}
                stroke="#fff"
                strokeWidth={2}
              />
              <circle
                cx={x(hover)}
                cy={y(view[hover].value)}
                r={9}
                fill="none"
                stroke={PRIMARY}
                strokeOpacity={0.25}
                strokeWidth={2}
              />
            </g>
          )}

          <rect
            x={0}
            y={0}
            width={w}
            height={height}
            fill="transparent"
            tabIndex={0}
            style={{ outline: 'none' }}
            role="application"
            aria-label={
              n
                ? `Serie de ${n} puntos. Flechas ← → para recorrer. Último: ${view[n - 1].label}, ${format(view[n - 1].value)}`
                : undefined
            }
            onMouseMove={onMove}
            onMouseLeave={leave}
            onKeyDown={onKey}
            onFocus={() => {
              if (n) focusIdx(n - 1);
            }}
            onBlur={leave}
          />
        </svg>
        <Tip tip={tip} />
      </div>

      {showCmp && controls?.compare && (
        <div className="mt-2 flex items-center gap-4 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-[2px] w-4 rounded bg-primary" /> Actual
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-[2px] w-4 rounded"
              style={{
                background: `repeating-linear-gradient(90deg, ${FAINT} 0 4px, transparent 4px 7px)`,
              }}
            />
            {controls.compare.label}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Barras horizontales (orden configurable, % de participación, ranking) ────
export function HBars({
  rows,
  format = num,
  controls = false,
  showPct = false,
}: {
  rows: { label: string; value: number; meta?: string; catIcon?: string }[];
  format?: (v: number) => string;
  /** Fila de controles: ordenar por valor / alfabético. */
  controls?: boolean;
  /** Muestra % de participación del total junto al valor. */
  showPct?: boolean;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const { tip, moveTip, focusTip, hide } = useTip(boxRef);
  const reduced = useReducedMotion();
  const [sort, setSort] = useState<'valor' | 'az'>('valor');

  const view = useMemo(() => {
    const c = [...rows];
    if (sort === 'valor') c.sort((a, b) => b.value - a.value);
    else c.sort((a, b) => a.label.localeCompare(b.label, 'es'));
    return c;
  }, [rows, sort]);
  const max = Math.max(1, ...rows.map(r => r.value));
  const total = rows.reduce((s, r) => s + r.value, 0);

  return (
    <div>
      {controls && (
        <div className="mb-3 flex items-center gap-1.5">
          <span className="mr-1 font-mono text-[11px] uppercase tracking-wider text-faint">
            Ordenar
          </span>
          <CChip on={sort === 'valor'} onClick={() => setSort('valor')}>
            Mayor
          </CChip>
          <CChip on={sort === 'az'} onClick={() => setSort('az')}>
            A–Z
          </CChip>
        </div>
      )}
      {/* Una sola rejilla para todas las filas (subgrid): etiqueta y valor miden
          lo mismo en cada fila, así todas las barras parten de la misma base y
          su largo es comparable. */}
      <div
        ref={boxRef}
        className="relative grid grid-cols-[18px_minmax(84px,auto)_1fr_auto] gap-y-1"
      >
        {view.map((r, i) => {
          const share = total ? Math.round((r.value / total) * 100) : 0;
          const body = (
            <TipBody
              title={r.label}
              value={format(r.value)}
              rows={[
                { label: 'Participación', value: `${share}%` },
                { label: 'Ranking', value: `#${rankOf(r.value, view.map(v => v.value))} de ${view.length}` },
                { label: 'vs promedio', value: vs(r.value, total / Math.max(1, view.length)) ?? '—' },
              ]}
              meta={r.meta}
            />
          );
          return (
            <motion.div
              key={r.label}
              layout={!reduced}
              transition={{ duration: 0.35, ease: EASE }}
              tabIndex={0}
              data-cat-hover
              className="group -mx-2 col-span-full grid grid-cols-subgrid items-center gap-x-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface focus-visible:-outline-offset-2"
              onMouseMove={e => moveTip(e, body)}
              onMouseLeave={hide}
              onFocus={e => focusTip(e, body)}
              onBlur={hide}
              aria-label={`${r.label}: ${format(r.value)} (${share}%)`}
            >
              <span className="font-mono text-[11px] tabular-nums text-faint">
                {i + 1}
              </span>
              <span className="flex min-w-0 items-center justify-end gap-1.5 text-[12.5px] text-navy group-hover:font-semibold">
                {r.catIcon && (
                  <span className="text-primary">
                    <CategoryIcon cat={r.catIcon} fallback={[r.label]} size={14} decorative />
                  </span>
                )}
                <span className="truncate">{r.label}</span>
              </span>
              <div className="h-3.5 rounded-full bg-segment">
                <motion.div
                  className="h-full origin-left rounded-full bg-primary transition-colors group-hover:bg-primary-2"
                  style={{ width: `${(r.value / max) * 100}%` }}
                  initial={{ scaleX: reduced ? 1 : 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{
                    duration: 0.6,
                    ease: EASE,
                    delay: reduced ? 0 : i * 0.06,
                  }}
                />
              </div>
              <span className="text-right font-mono text-[12px] font-semibold tabular-nums text-navy">
                {format(r.value)}
                {showPct && (
                  <span className="ml-1.5 font-normal text-faint">
                    {share}%
                  </span>
                )}
              </span>
            </motion.div>
          );
        })}
        <Tip tip={tip} />
      </div>
    </div>
  );
}
