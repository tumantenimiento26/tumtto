'use client';
import { Fragment, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { motion, EASE } from './motion';

/**
 * Gráficas interactivas del admin (SVG puro, sin dependencias de chart libs).
 * Método dataviz: marca delgada, grid recesivo, tooltip compartido, hover layer
 * por defecto, animaciones que respetan prefers-reduced-motion.
 *
 * ÚNICO módulo con hex crudos de la capa de gráficas — SVG necesita valores
 * literales. Espejan los tokens @theme de globals.css:
 */
const PRIMARY = '#0A6BCF'; // --color-primary
const CYAN = '#18C1FF'; //   --color-cyan
const INK = '#0E2C56'; //    --color-navy
const GRID = '#E1E8F0'; //   --color-line
const FAINT = '#9CA3AF'; //  --color-faint
const TRACK = '#EEF3F8'; //  --color-surface-2

/** Paleta de estatus validada CVD≥12 (dataviz): éxito / en curso / pendiente / cancelado. */
export const STATUS_DONUT = {
  success: '#18A66A',
  primary: '#0A6BCF',
  warning: '#F59E0B',
  error: '#DC2626',
} as const;

/** Rampa secuencial: un matiz, monotónico claro → oscuro (magnitud, nunca identidad). */
export const RAMP = ['#E0F6FF', '#A9DBF7', '#5FB2EA', '#0A6BCF', '#0B3DAD'] as const;

// ── Tooltip compartido (un div absoluto por contenedor de gráfica) ───────────
type TipState = { x: number; y: number; body: React.ReactNode } | null;

function useTip(boxRef: React.RefObject<HTMLDivElement | null>) {
  const [tip, setTip] = useState<TipState>(null);
  /** Sigue al mouse dentro del contenedor. */
  const moveTip = (e: React.MouseEvent, body: React.ReactNode) => {
    const r = boxRef.current?.getBoundingClientRect();
    if (r) setTip({ x: e.clientX - r.left, y: e.clientY - r.top, body });
  };
  /** Ancla en coordenadas del contenedor (celdas / focus). */
  const showAt = (x: number, y: number, body: React.ReactNode) => setTip({ x, y, body });
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
      className={`pointer-events-none absolute z-10 whitespace-nowrap rounded-[10px] bg-navy px-3 py-2 text-xs text-white shadow-overlay transition-opacity duration-[120ms] ${tip ? 'opacity-100' : 'opacity-0'}`}
      style={{ left: t.x, top: t.y, transform: 'translate(-50%, calc(-100% - 10px))' }}
    >
      {t.body}
    </div>
  );
}

function TipBody({ title, value, meta }: { title: string; value: string; meta?: string }) {
  return (
    <>
      <div className="text-white/70">{title}</div>
      <div className="font-mono text-[13px] font-semibold tabular-nums">{value}</div>
      {meta && <div className="mt-0.5 text-[11px] text-white/60">{meta}</div>}
    </>
  );
}

/** Mide el ancho del contenedor para que el SVG sea fluido sin distorsión. */
function useWidth(fallback = 600) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => setW(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, w };
}

const num = (v: number) => v.toLocaleString('es-MX');

// ── LineChart (área + línea) ─────────────────────────────────────────────────
export function LineChart({ data, format = num, height = 220 }: {
  data: { label: string; value: number; meta?: string }[];
  format?: (v: number) => string;
  height?: number;
}) {
  const { ref, w } = useWidth();
  const { tip, moveTip, showAt, hide } = useTip(ref);
  const reduced = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const gradId = useId();

  const max = Math.max(1, ...data.map(d => d.value));
  const ticks = [0.25, 0.5, 0.75, 1].map(t => ({ t, label: format(Math.round(max * t)) }));
  const padLeft = 14 + Math.max(...ticks.map(x => x.label.length)) * 6.2; // mono 10px ≈ 6.2px/char
  const PAD = { top: 10, right: 12, bottom: 22, left: padLeft };
  const iw = Math.max(10, w - PAD.left - PAD.right);
  const ih = height - PAD.top - PAD.bottom;
  const n = data.length;
  const x = (i: number) => PAD.left + (n > 1 ? (i / (n - 1)) * iw : iw / 2);
  const y = (v: number) => PAD.top + ih - (v / max) * ih;

  const linePath = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${x(n - 1).toFixed(1)},${(PAD.top + ih).toFixed(1)} L${x(0).toFixed(1)},${(PAD.top + ih).toFixed(1)} Z`;

  // ~5 etiquetas x equidistantes
  const xIdx = useMemo(
    () => (n <= 5 ? data.map((_, i) => i) : [...new Set(Array.from({ length: 5 }, (_, k) => Math.round((k * (n - 1)) / 4)))]),
    [data, n],
  );

  const tipFor = (i: number) => <TipBody title={data[i].label} value={format(data[i].value)} meta={data[i].meta} />;

  function onMove(e: React.MouseEvent) {
    const r = ref.current?.getBoundingClientRect();
    if (!r || n === 0) return;
    const i = Math.min(n - 1, Math.max(0, Math.round(((e.clientX - r.left - PAD.left) / iw) * (n - 1))));
    setHover(i);
    moveTip(e, tipFor(i));
  }
  const leave = () => { setHover(null); hide(); };

  return (
    <div ref={ref} className="relative">
      <svg width={w} height={height} role="img" aria-label="Gráfica de línea">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.22} />
            <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* grid recesivo: baseline + 4 líneas con etiqueta mono */}
        <line x1={PAD.left} x2={PAD.left + iw} y1={PAD.top + ih} y2={PAD.top + ih} stroke={GRID} />
        {ticks.map(({ t, label }) => (
          <g key={t}>
            <line x1={PAD.left} x2={PAD.left + iw} y1={y(max * t)} y2={y(max * t)} stroke={GRID} />
            <text x={PAD.left - 8} y={y(max * t) + 3} textAnchor="end" fontSize={10} fill={FAINT} className="font-mono tabular-nums">{label}</text>
          </g>
        ))}
        {xIdx.map(i => (
          <text key={i} x={x(i)} y={height - 6} textAnchor="middle" fontSize={10} fill={FAINT} className="font-mono">{data[i].label}</text>
        ))}
        <motion.path
          d={areaPath} fill={`url(#${gradId})`}
          initial={{ opacity: reduced ? 1 : 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE, delay: reduced ? 0 : 0.45 }}
        />
        <motion.path
          d={linePath} fill="none" stroke={PRIMARY} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"
          initial={{ pathLength: reduced ? 1 : 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.1, ease: EASE }}
        />
        {hover != null && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + ih} stroke={FAINT} strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(data[hover].value)} r={4.5} fill={PRIMARY} stroke="#fff" strokeWidth={2} />
          </g>
        )}
        {/* ponytail: focus muestra el último punto (sin navegación por flechas). */}
        <rect
          x={0} y={0} width={w} height={height} fill="transparent" tabIndex={0} style={{ outline: 'none' }}
          aria-label={n ? `Último punto: ${data[n - 1].label}, ${format(data[n - 1].value)}` : undefined}
          onMouseMove={onMove} onMouseLeave={leave}
          onFocus={() => { if (!n) return; setHover(n - 1); showAt(x(n - 1), y(data[n - 1].value) - 6, tipFor(n - 1)); }}
          onBlur={leave}
        />
      </svg>
      <Tip tip={tip} />
    </div>
  );
}

// ── Donut de estatus (arcos con gap, centro vivo, leyenda) ───────────────────
export function Donut({ parts, centerLabel = 'total' }: {
  parts: { key: string; label: string; value: number; color: string }[];
  centerLabel?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const { tip, moveTip, focusTip, hide } = useTip(boxRef);
  const [hovered, setHovered] = useState<string | null>(null);

  const total = parts.reduce((s, p) => s + p.value, 0);
  const R = 74;
  const GAP = 0.035; // rad entre segmentos (deja respirar la superficie)
  const TAU = Math.PI * 2;

  const segs = useMemo(() => {
    let a = -Math.PI / 2;
    return parts.filter(p => p.value > 0).map(p => {
      const sweep = (p.value / Math.max(1, total)) * TAU;
      const seg = { ...p, start: a + GAP / 2, end: Math.max(a + GAP / 2 + 0.01, a + sweep - GAP / 2) };
      a += sweep;
      return seg;
    });
  }, [parts, total, TAU]);

  const pt = (ang: number) => [100 + R * Math.cos(ang), 100 + R * Math.sin(ang)] as const;
  const arc = (s: number, e: number) => {
    const [x1, y1] = pt(s);
    const [x2, y2] = pt(e);
    return `M${x1.toFixed(2)},${y1.toFixed(2)} A${R},${R} 0 ${e - s > Math.PI ? 1 : 0} 1 ${x2.toFixed(2)},${y2.toFixed(2)}`;
  };

  const active = hovered ? parts.find(p => p.key === hovered) : null;
  const pct = (v: number) => (total ? Math.round((v / total) * 100) : 0);
  const tipFor = (p: { label: string; value: number }) => (
    <TipBody title={p.label} value={num(p.value)} meta={`${pct(p.value)}% del total`} />
  );

  return (
    <div ref={boxRef} className="relative">
      <div className="relative mx-auto h-[200px] w-[200px]">
        <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label={`Dona: ${num(total)} ${centerLabel}`}>
          {segs.length === 0 && <circle cx={100} cy={100} r={R} fill="none" stroke={TRACK} strokeWidth={24} />}
          {segs.map(s => (
            <path
              key={s.key} d={arc(s.start, s.end)} fill="none" stroke={s.color} strokeWidth={24} tabIndex={0}
              aria-label={`${s.label}: ${num(s.value)} (${pct(s.value)}%)`}
              style={{
                outline: 'none', cursor: 'default', transformBox: 'view-box', transformOrigin: 'center',
                transform: hovered === s.key ? 'scale(1.045)' : 'scale(1)',
                transition: 'transform 0.18s cubic-bezier(0.2, 0.7, 0.3, 1)',
              }}
              onMouseMove={e => { setHovered(s.key); moveTip(e, tipFor(s)); }}
              onMouseLeave={() => { setHovered(null); hide(); }}
              onFocus={e => { setHovered(s.key); focusTip(e, tipFor(s)); }}
              onBlur={() => { setHovered(null); hide(); }}
            />
          ))}
        </svg>
        {/* centro: total ↔ parte hovereada */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="font-display text-[26px] font-bold leading-none tabular-nums text-navy">
              {num(active ? active.value : total)}
            </div>
            <div className="mt-1 text-[11.5px] text-muted">{active ? active.label : centerLabel}</div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {parts.map(p => (
          <span key={p.key} className="inline-flex items-center gap-1.5 text-[11.5px] text-muted">
            <span className="h-[9px] w-[9px] rounded-[3px]" style={{ background: p.color }} />
            {p.label} · <span className="font-mono font-semibold tabular-nums text-navy">{num(p.value)}</span>
          </span>
        ))}
      </div>
      <Tip tip={tip} />
    </div>
  );
}

// ── Barras horizontales ──────────────────────────────────────────────────────
export function HBars({ rows, format = num }: {
  rows: { label: string; value: number; meta?: string }[];
  format?: (v: number) => string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const { tip, moveTip, focusTip, hide } = useTip(boxRef);
  const reduced = useReducedMotion();
  const max = Math.max(1, ...rows.map(r => r.value));

  return (
    <div ref={boxRef} className="relative">
      <div className="grid grid-cols-[minmax(88px,auto)_1fr_auto] items-center gap-x-3 gap-y-3">
        {rows.map((r, i) => {
          const body = <TipBody title={r.label} value={format(r.value)} meta={r.meta} />;
          return (
            <Fragment key={r.label}>
              <span className="truncate text-right text-[12.5px] text-navy">{r.label}</span>
              <div
                tabIndex={0}
                className="h-3.5 rounded-full bg-surface-2 outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                onMouseMove={e => moveTip(e, body)} onMouseLeave={hide}
                onFocus={e => focusTip(e, body)} onBlur={hide}
                aria-label={`${r.label}: ${format(r.value)}`}
              >
                <motion.div
                  className="h-full origin-left rounded-full bg-primary"
                  style={{ width: `${(r.value / max) * 100}%` }}
                  initial={{ scaleX: reduced ? 1 : 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, ease: EASE, delay: reduced ? 0 : i * 0.06 }}
                />
              </div>
              <span className="font-mono text-[12px] font-semibold tabular-nums text-navy">{format(r.value)}</span>
            </Fragment>
          );
        })}
      </div>
      <Tip tip={tip} />
    </div>
  );
}

// ── Calendario de calor (filas × columnas, rampa secuencial) ─────────────────
export function HeatCalendar({ rows, cols, value, rowLabels, colLabels, format = num }: {
  rows: number; cols: number;
  value: (r: number, c: number) => number;
  rowLabels: string[]; colLabels: string[];
  format?: (v: number) => string;
}) {
  const { ref, w } = useWidth();
  const { tip, showAt, focusTip, hide } = useTip(ref);
  const [hover, setHover] = useState<string | null>(null);

  const LABEL_W = 44, GAP = 2, CELL_H = 26, BOTTOM = 20;
  const cellW = Math.max(8, (w - LABEL_W - GAP * (cols - 1)) / cols);
  const height = rows * (CELL_H + GAP) - GAP + BOTTOM;
  const max = useMemo(() => {
    let m = 1;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) m = Math.max(m, value(r, c));
    return m;
  }, [rows, cols, value]);
  const colorFor = (v: number) => RAMP[Math.min(RAMP.length - 1, Math.floor((v / (max + 1e-9)) * RAMP.length))];

  return (
    <div ref={ref} className="relative">
      <svg width={w} height={height} role="img" aria-label="Calendario de demanda">
        {rowLabels.slice(0, rows).map((l, r) => (
          <text key={l} x={LABEL_W - 10} y={r * (CELL_H + GAP) + CELL_H / 2 + 3.5} textAnchor="end" fontSize={10} fill={FAINT} className="font-mono">{l}</text>
        ))}
        {colLabels.slice(0, cols).map((l, c) => (
          <text key={l} x={LABEL_W + c * (cellW + GAP) + cellW / 2} y={height - 5} textAnchor="middle" fontSize={10} fill={FAINT} className="font-mono">{l}</text>
        ))}
        {Array.from({ length: rows }).flatMap((_, r) =>
          Array.from({ length: cols }).map((_, c) => {
            const v = value(r, c);
            const key = `${r}-${c}`;
            const cx = LABEL_W + c * (cellW + GAP);
            const cy = r * (CELL_H + GAP);
            const body = <TipBody title={`${rowLabels[r]} · ${colLabels[c]}`} value={format(v)} />;
            return (
              <rect
                key={key} x={cx} y={cy} width={cellW} height={CELL_H} rx={5} fill={colorFor(v)} tabIndex={0}
                stroke={hover === key ? INK : 'none'} strokeWidth={1.5}
                style={{ outline: 'none' }}
                aria-label={`${rowLabels[r]} ${colLabels[c]}: ${format(v)}`}
                onMouseEnter={() => { setHover(key); showAt(cx + cellW / 2, cy, body); }}
                onMouseLeave={() => { setHover(null); hide(); }}
                onFocus={e => { setHover(key); focusTip(e, body); }}
                onBlur={() => { setHover(null); hide(); }}
              />
            );
          }),
        )}
      </svg>
      <Tip tip={tip} />
    </div>
  );
}

// ── Sparkline (mini tendencia para StatCards) ────────────────────────────────
export function Sparkline({ values, width = 86, height = 26, area = false, fluid = false }: {
  values: number[]; width?: number; height?: number;
  /** Relleno degradado bajo la línea (para sparklines full-bleed de tarjeta). */
  area?: boolean;
  /** Ocupa el 100% del contenedor (preserveAspectRatio none + trazo no escalado). */
  fluid?: boolean;
}) {
  const gid = useId();
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const span = Math.max(1e-9, Math.max(...values) - min);
  const P = 3;
  const px = (i: number) => P + (i / (values.length - 1)) * (width - 2 * P);
  const py = (v: number) => P + (1 - (v - min) / span) * (height - 2 * P);
  const pts = values.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
  return (
    <svg
      aria-hidden="true"
      {...(fluid
        ? { className: 'h-full w-full', viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: 'none' }
        : { width, height })}
    >
      {area && (
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={PRIMARY} stopOpacity={0.18} />
            <stop offset="1" stopColor={PRIMARY} stopOpacity={0} />
          </linearGradient>
        </defs>
      )}
      {area && <polygon points={`${px(0).toFixed(1)},${height} ${pts} ${px(values.length - 1).toFixed(1)},${height}`} fill={`url(#${gid})`} />}
      <polyline
        points={pts} fill="none" stroke={PRIMARY} strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round"
        {...(fluid ? { vectorEffect: 'non-scaling-stroke' } : {})}
      />
      {!fluid && <circle cx={px(values.length - 1)} cy={py(values[values.length - 1])} r={2.5} fill={CYAN} />}
    </svg>
  );
}

// ── CountUp (cifras grandes de KPI) ──────────────────────────────────────────
export function CountUp({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const played = useRef(false);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced || played.current) { setN(value); return; } // actualizaciones vivas: sin re-animar
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 900);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3)))); // cubic-out
      if (p < 1) raf = requestAnimationFrame(step);
      else played.current = true;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, reduced]);

  return <span ref={ref} className="tabular-nums">{prefix}{n.toLocaleString('es-MX')}{suffix}</span>;
}
