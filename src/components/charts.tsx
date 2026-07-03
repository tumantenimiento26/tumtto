'use client';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { motion, EASE } from './motion';

/**
 * Gráficas interactivas del admin (SVG puro, sin dependencias de chart libs).
 * Método dataviz: marca delgada, grid recesivo, tooltip compartido, hover layer
 * por defecto, controles de configuración en una fila sobre la gráfica,
 * animaciones que respetan prefers-reduced-motion.
 *
 * ÚNICO módulo con hex crudos de la capa de gráficas — SVG necesita valores
 * literales. Espejan los tokens @theme de globals.css:
 */
const PRIMARY = '#0A6BCF'; // --color-primary
const CYAN = '#18C1FF'; //   --color-cyan
const INK = '#0E2C56'; //    --color-navy
const GRID = '#E1E8F0'; //   --color-line
const FAINT = '#9CA3AF'; //  --color-faint
const MUTED = '#6B7280'; //  --color-muted
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
  /** Ancla en coordenadas del contenedor (celdas / focus / teclado). */
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

function TipBody({ title, value, meta, delta, deltaTone, rows }: {
  title: string; value: string; meta?: string;
  /** Cambio vs punto/periodo anterior, ej. "▲ +8.2% vs sem. anterior". */
  delta?: string; deltaTone?: 'up' | 'down';
  /** Renglones extra (comparativa, métricas secundarias). */
  rows?: { label: string; value: string }[];
}) {
  return (
    <>
      <div className="text-white/70">{title}</div>
      <div className="font-mono text-[13px] font-semibold tabular-nums">{value}</div>
      {delta && (
        <div className={`mt-0.5 text-[11px] font-semibold ${deltaTone === 'down' ? 'text-[#FCA5A5]' : 'text-[#6EE7B7]'}`}>{delta}</div>
      )}
      {rows?.map(r => (
        <div key={r.label} className="mt-0.5 flex items-baseline justify-between gap-3 text-[11px] text-white/60">
          <span>{r.label}</span>
          <span className="font-mono tabular-nums text-white/85">{r.value}</span>
        </div>
      ))}
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

// ── Controles de gráfica (fila única sobre la gráfica) ───────────────────────
function CChip({ on, onClick, children, title }: { on: boolean; onClick: () => void; children: React.ReactNode; title?: string }) {
  return (
    <button
      onClick={onClick} aria-pressed={on} title={title}
      className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider transition-colors ${
        on ? 'border-primary bg-primary text-white' : 'border-line bg-white text-muted hover:border-primary/40 hover:text-primary'
      }`}
    >
      {children}
    </button>
  );
}

// ── LineChart (área + línea, configurable) ───────────────────────────────────
export function LineChart({ data, format = num, height = 220, controls }: {
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
  const [rangeN, setRangeN] = useState<number>(controls?.ranges?.at(-1)?.n ?? data.length);
  const [showAvg, setShowAvg] = useState(false);
  const [showCmp, setShowCmp] = useState(false);
  const gradId = useId();

  const view = useMemo(() => data.slice(-rangeN), [data, rangeN]);
  const cmpView = useMemo(
    () => (controls?.compare ? controls.compare.values.slice(-rangeN) : null),
    [controls?.compare, rangeN],
  );
  const n = view.length;

  const max = Math.max(1, ...view.map(d => d.value), ...(showCmp && cmpView ? cmpView : [0]));
  const avg = useMemo(() => (n ? view.reduce((s, d) => s + d.value, 0) / n : 0), [view, n]);
  const ticks = [0.25, 0.5, 0.75, 1].map(t => ({ t, label: format(Math.round(max * t)) }));
  const padLeft = 14 + Math.max(...ticks.map(x => x.label.length)) * 6.2; // mono 10px ≈ 6.2px/char
  const PAD = { top: 10, right: 12, bottom: 22, left: padLeft };
  const iw = Math.max(10, w - PAD.left - PAD.right);
  const ih = height - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (n > 1 ? (i / (n - 1)) * iw : iw / 2);
  const y = (v: number) => PAD.top + ih - (v / max) * ih;

  const path = (vals: number[]) => vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const linePath = path(view.map(d => d.value));
  const areaPath = `${linePath} L${x(n - 1).toFixed(1)},${(PAD.top + ih).toFixed(1)} L${x(0).toFixed(1)},${(PAD.top + ih).toFixed(1)} Z`;

  // ~5 etiquetas x equidistantes
  const xIdx = useMemo(
    () => (n <= 5 ? view.map((_, i) => i) : [...new Set(Array.from({ length: 5 }, (_, k) => Math.round((k * (n - 1)) / 4)))]),
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
        delta={deltaPct != null ? `${deltaPct >= 0 ? '▲ +' : '▼ '}${deltaPct.toFixed(1)}% vs punto anterior` : undefined}
        deltaTone={deltaPct != null && deltaPct < 0 ? 'down' : 'up'}
        rows={[
          ...(showCmp && cmpView?.[i] != null ? [{ label: controls!.compare!.label, value: format(cmpView[i]) }] : []),
          ...(showAvg ? [{ label: 'Promedio del rango', value: format(Math.round(avg)) }] : []),
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
    const i = Math.min(n - 1, Math.max(0, Math.round(((e.clientX - r.left - PAD.left) / iw) * (n - 1))));
    setHover(i);
    moveTip(e, tipFor(i));
  }
  function onKey(e: React.KeyboardEvent) {
    if (!n) return;
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const next = hover == null ? n - 1 : Math.min(n - 1, Math.max(0, hover + (e.key === 'ArrowRight' ? 1 : -1)));
    focusIdx(next);
  }
  const leave = () => { setHover(null); hide(); };

  const hasControls = controls && (controls.ranges || controls.avg || controls.compare);

  return (
    <div>
      {hasControls && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {controls.ranges?.map(rg => (
            <CChip key={rg.label} on={rangeN === rg.n} onClick={() => { setRangeN(rg.n); setHover(null); hide(); }}>{rg.label}</CChip>
          ))}
          {(controls.avg || controls.compare) && controls.ranges && <span className="mx-1 h-4 w-px bg-line" />}
          {controls.avg && <CChip on={showAvg} onClick={() => setShowAvg(v => !v)} title="Línea de promedio del rango">Promedio</CChip>}
          {controls.compare && <CChip on={showCmp} onClick={() => setShowCmp(v => !v)} title="Serie del periodo anterior">{controls.compare.label}</CChip>}
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
          <line x1={PAD.left} x2={PAD.left + iw} y1={PAD.top + ih} y2={PAD.top + ih} stroke={GRID} />
          {ticks.map(({ t, label }) => (
            <g key={t}>
              <line x1={PAD.left} x2={PAD.left + iw} y1={y(max * t)} y2={y(max * t)} stroke={GRID} />
              <text x={PAD.left - 8} y={y(max * t) + 3} textAnchor="end" fontSize={10} fill={FAINT} className="font-mono tabular-nums">{label}</text>
            </g>
          ))}
          {xIdx.map(i => (
            <text key={i} x={x(i)} y={height - 6} textAnchor="middle" fontSize={10} fill={FAINT} className="font-mono">{view[i].label}</text>
          ))}

          {/* comparativa fantasma (periodo anterior) */}
          {showCmp && cmpView && (
            <path d={path(cmpView)} fill="none" stroke={FAINT} strokeWidth={1.6} strokeDasharray="5 4" strokeLinejoin="round" strokeLinecap="round" />
          )}

          <motion.path
            key={`a-${rangeN}`}
            d={areaPath} fill={`url(#${gradId})`}
            initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: EASE, delay: reduced ? 0 : 0.35 }}
          />
          <motion.path
            key={`l-${rangeN}`}
            d={linePath} fill="none" stroke={PRIMARY} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"
            initial={{ pathLength: reduced ? 1 : 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: EASE }}
          />

          {/* promedio del rango */}
          {showAvg && (
            <g>
              <line x1={PAD.left} x2={PAD.left + iw} y1={y(avg)} y2={y(avg)} stroke={MUTED} strokeWidth={1.4} strokeDasharray="6 4" />
              <text x={PAD.left + iw - 4} y={y(avg) - 5} textAnchor="end" fontSize={9.5} fill={MUTED} className="font-mono tabular-nums">
                prom {format(Math.round(avg))}
              </text>
            </g>
          )}

          {/* punto final siempre enfatizado */}
          {n > 0 && <circle cx={x(n - 1)} cy={y(view[n - 1].value)} r={3.5} fill={CYAN} stroke="#fff" strokeWidth={1.5} />}

          {hover != null && (
            <g pointerEvents="none">
              <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + ih} stroke={FAINT} strokeDasharray="3 3" />
              <line x1={PAD.left} x2={x(hover)} y1={y(view[hover].value)} y2={y(view[hover].value)} stroke={FAINT} strokeDasharray="3 3" opacity={0.7} />
              {showCmp && cmpView?.[hover] != null && (
                <circle cx={x(hover)} cy={y(cmpView[hover])} r={3.5} fill="#fff" stroke={FAINT} strokeWidth={1.6} />
              )}
              <circle cx={x(hover)} cy={y(view[hover].value)} r={4.5} fill={PRIMARY} stroke="#fff" strokeWidth={2} />
              <circle cx={x(hover)} cy={y(view[hover].value)} r={9} fill="none" stroke={PRIMARY} strokeOpacity={0.25} strokeWidth={2} />
            </g>
          )}

          <rect
            x={0} y={0} width={w} height={height} fill="transparent" tabIndex={0} style={{ outline: 'none' }}
            role="application"
            aria-label={n ? `Serie de ${n} puntos. Flechas ← → para recorrer. Último: ${view[n - 1].label}, ${format(view[n - 1].value)}` : undefined}
            onMouseMove={onMove} onMouseLeave={leave}
            onKeyDown={onKey}
            onFocus={() => { if (n) focusIdx(n - 1); }}
            onBlur={leave}
          />
        </svg>
        <Tip tip={tip} />
      </div>

      {showCmp && controls?.compare && (
        <div className="mt-2 flex items-center gap-4 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1.5"><span className="h-[2px] w-4 rounded bg-primary" /> Actual</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-[2px] w-4 rounded" style={{ background: `repeating-linear-gradient(90deg, ${FAINT} 0 4px, transparent 4px 7px)` }} />
            {controls.compare.label}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Donut de estatus (leyenda interactiva: click = incluir/excluir) ──────────
export function Donut({ parts, centerLabel = 'total' }: {
  parts: { key: string; label: string; value: number; color: string }[];
  centerLabel?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const { tip, moveTip, focusTip, hide } = useTip(boxRef);
  const [hovered, setHovered] = useState<string | null>(null);
  const [off, setOff] = useState<Set<string>>(new Set());

  const shown = parts.filter(p => !off.has(p.key));
  const total = shown.reduce((s, p) => s + p.value, 0);
  const R = 74;
  const GAP = 0.035; // rad entre segmentos (deja respirar la superficie)
  const TAU = Math.PI * 2;

  const segs = useMemo(() => {
    let a = -Math.PI / 2;
    return shown.filter(p => p.value > 0).map(p => {
      const sweep = (p.value / Math.max(1, total)) * TAU;
      const seg = { ...p, start: a + GAP / 2, end: Math.max(a + GAP / 2 + 0.01, a + sweep - GAP / 2) };
      a += sweep;
      return seg;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parts, off, total]);

  const pt = (ang: number) => [100 + R * Math.cos(ang), 100 + R * Math.sin(ang)] as const;
  const arc = (s: number, e: number) => {
    const [x1, y1] = pt(s);
    const [x2, y2] = pt(e);
    return `M${x1.toFixed(2)},${y1.toFixed(2)} A${R},${R} 0 ${e - s > Math.PI ? 1 : 0} 1 ${x2.toFixed(2)},${y2.toFixed(2)}`;
  };

  const active = hovered ? shown.find(p => p.key === hovered) : null;
  const pct = (v: number) => (total ? Math.round((v / total) * 100) : 0);
  const tipFor = (p: { label: string; value: number }) => (
    <TipBody title={p.label} value={num(p.value)} meta={`${pct(p.value)}% de lo visible`} />
  );
  const toggle = (key: string) =>
    setOff(prev => {
      const nx = new Set(prev);
      if (nx.has(key)) nx.delete(key);
      else if (shown.length > 1) nx.add(key); // nunca dejar la dona vacía
      return nx;
    });

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
                opacity: hovered && hovered !== s.key ? 0.45 : 1,
                transition: 'transform 0.18s cubic-bezier(0.2,0.7,0.3,1), opacity 0.18s',
              }}
              onMouseMove={e => { setHovered(s.key); moveTip(e, tipFor(s)); }}
              onMouseLeave={() => { setHovered(null); hide(); }}
              onFocus={e => { setHovered(s.key); focusTip(e, tipFor(s)); }}
              onBlur={() => { setHovered(null); hide(); }}
            />
          ))}
        </svg>
        {/* centro: total visible ↔ parte hovereada */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="font-display text-[26px] font-bold leading-none tabular-nums text-navy">
              {num(active ? active.value : total)}
            </div>
            <div className="mt-1 text-[11.5px] text-muted">{active ? active.label : centerLabel}</div>
          </div>
        </div>
      </div>
      {/* leyenda interactiva: hover resalta, click excluye/incluye */}
      <div className="mt-4 flex flex-wrap justify-center gap-x-2 gap-y-1.5">
        {parts.map(p => {
          const isOff = off.has(p.key);
          return (
            <button
              key={p.key}
              onClick={() => toggle(p.key)}
              onMouseEnter={() => !isOff && setHovered(p.key)}
              onMouseLeave={() => setHovered(null)}
              aria-pressed={!isOff}
              title={isOff ? 'Incluir en la dona' : 'Excluir de la dona'}
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11.5px] transition-colors hover:bg-surface ${isOff ? 'text-faint' : 'text-muted'}`}
            >
              <span className={`h-[9px] w-[9px] rounded-[3px] transition-opacity ${isOff ? 'opacity-30' : ''}`} style={{ background: p.color }} />
              <span className={isOff ? 'line-through' : ''}>{p.label}</span>
              <span className={`font-mono font-semibold tabular-nums ${isOff ? 'text-faint' : 'text-navy'}`}>{num(p.value)}</span>
            </button>
          );
        })}
      </div>
      <Tip tip={tip} />
    </div>
  );
}

// ── Barras horizontales (orden configurable, % de participación, ranking) ────
export function HBars({ rows, format = num, controls = false, showPct = false }: {
  rows: { label: string; value: number; meta?: string }[];
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
          <span className="mr-1 font-mono text-[9.5px] uppercase tracking-wider text-faint">Ordenar</span>
          <CChip on={sort === 'valor'} onClick={() => setSort('valor')}>Mayor</CChip>
          <CChip on={sort === 'az'} onClick={() => setSort('az')}>A–Z</CChip>
        </div>
      )}
      <div ref={boxRef} className="relative flex flex-col gap-1">
        {view.map((r, i) => {
          const share = total ? Math.round((r.value / total) * 100) : 0;
          const body = (
            <TipBody
              title={r.label}
              value={format(r.value)}
              rows={[{ label: 'Participación', value: `${share}%` }]}
              meta={r.meta}
            />
          );
          return (
            <motion.div
              key={r.label} layout={!reduced} transition={{ duration: 0.35, ease: EASE }}
              tabIndex={0}
              className="group -mx-2 grid grid-cols-[18px_minmax(84px,auto)_1fr_auto] items-center gap-x-3 rounded-lg px-2 py-1.5 outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-primary/40"
              onMouseMove={e => moveTip(e, body)} onMouseLeave={hide}
              onFocus={e => focusTip(e, body)} onBlur={hide}
              aria-label={`${r.label}: ${format(r.value)} (${share}%)`}
            >
              <span className="font-mono text-[10px] tabular-nums text-faint">{i + 1}</span>
              <span className="truncate text-right text-[12.5px] text-navy group-hover:font-semibold">{r.label}</span>
              <div className="h-3.5 rounded-full bg-surface-2">
                <motion.div
                  className="h-full origin-left rounded-full bg-primary transition-colors group-hover:bg-primary-2"
                  style={{ width: `${(r.value / max) * 100}%` }}
                  initial={{ scaleX: reduced ? 1 : 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, ease: EASE, delay: reduced ? 0 : i * 0.06 }}
                />
              </div>
              <span className="text-right font-mono text-[12px] font-semibold tabular-nums text-navy">
                {format(r.value)}
                {showPct && <span className="ml-1.5 font-normal text-faint">{share}%</span>}
              </span>
            </motion.div>
          );
        })}
        <Tip tip={tip} />
      </div>
    </div>
  );
}

// ── Calendario de calor (métricas conmutables, guías de fila/columna) ────────
export function HeatCalendar({ rows, cols, rowLabels, colLabels, metrics }: {
  rows: number; cols: number;
  rowLabels: string[]; colLabels: string[];
  /** Una o más métricas conmutables por chips (la primera es la default). */
  metrics: { label: string; value: (r: number, c: number) => number; format?: (v: number) => string }[];
}) {
  const { ref, w } = useWidth();
  const { tip, showAt, focusTip, hide } = useTip(ref);
  const [hover, setHover] = useState<[number, number] | null>(null);
  const [mIdx, setMIdx] = useState(0);
  const metric = metrics[mIdx];
  const fmt = metric.format ?? num;

  const LABEL_W = 44, GAP = 2, CELL_H = 26, BOTTOM = 20;
  const cellW = Math.max(8, (w - LABEL_W - GAP * (cols - 1)) / cols);
  const height = rows * (CELL_H + GAP) - GAP + BOTTOM;
  const max = useMemo(() => {
    let m = 1;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) m = Math.max(m, metric.value(r, c));
    return m;
  }, [rows, cols, metric]);
  const colorFor = (v: number) => RAMP[Math.min(RAMP.length - 1, Math.floor((v / (max + 1e-9)) * RAMP.length))];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        {metrics.length > 1 ? (
          <div className="flex items-center gap-1.5">
            {metrics.map((m, i) => (
              <CChip key={m.label} on={mIdx === i} onClick={() => setMIdx(i)}>{m.label}</CChip>
            ))}
          </div>
        ) : <span />}
        {/* leyenda de escala con extremos reales */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9.5px] tabular-nums text-faint">0</span>
          <span className="h-2 w-24 rounded-full" style={{ background: `linear-gradient(90deg, ${RAMP.join(',')})` }} />
          <span className="font-mono text-[9.5px] tabular-nums text-faint">{fmt(max)}</span>
        </div>
      </div>

      <div ref={ref} className="relative">
        <svg width={w} height={height} role="img" aria-label={`Calendario: ${metric.label}`}>
          {rowLabels.slice(0, rows).map((l, r) => (
            <text
              key={l} x={LABEL_W - 10} y={r * (CELL_H + GAP) + CELL_H / 2 + 3.5} textAnchor="end" fontSize={10}
              fill={hover?.[0] === r ? INK : FAINT} fontWeight={hover?.[0] === r ? 700 : 400} className="font-mono"
            >{l}</text>
          ))}
          {colLabels.slice(0, cols).map((l, c) => (
            <text
              key={l} x={LABEL_W + c * (cellW + GAP) + cellW / 2} y={height - 5} textAnchor="middle" fontSize={10}
              fill={hover?.[1] === c ? INK : FAINT} fontWeight={hover?.[1] === c ? 700 : 400} className="font-mono"
            >{l}</text>
          ))}
          {Array.from({ length: rows }).flatMap((_, r) =>
            Array.from({ length: cols }).map((_, c) => {
              const v = metric.value(r, c);
              const cx = LABEL_W + c * (cellW + GAP);
              const cy = r * (CELL_H + GAP);
              const dim = hover && hover[0] !== r && hover[1] !== c;
              const body = (
                <TipBody
                  title={`${rowLabels[r]} · ${colLabels[c]}`}
                  value={fmt(v)}
                  rows={[{ label: '% del pico', value: `${Math.round((v / max) * 100)}%` }]}
                  meta={metric.label}
                />
              );
              return (
                <rect
                  key={`${r}-${c}`} x={cx} y={cy} width={cellW} height={CELL_H} rx={5} fill={colorFor(v)} tabIndex={0}
                  stroke={hover?.[0] === r && hover?.[1] === c ? INK : 'none'} strokeWidth={1.5}
                  opacity={dim ? 0.35 : 1}
                  style={{ outline: 'none', transition: 'opacity 0.15s' }}
                  aria-label={`${rowLabels[r]} ${colLabels[c]}: ${fmt(v)}`}
                  onMouseEnter={() => { setHover([r, c]); showAt(cx + cellW / 2, cy, body); }}
                  onMouseLeave={() => { setHover(null); hide(); }}
                  onFocus={e => { setHover([r, c]); focusTip(e, body); }}
                  onBlur={() => { setHover(null); hide(); }}
                />
              );
            }),
          )}
        </svg>
        <Tip tip={tip} />
      </div>
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
