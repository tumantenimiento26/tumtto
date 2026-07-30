'use client';
import Link from 'next/link';
import { TrendingUp, TrendingDown, ArrowUpRight, X, type LucideIcon } from 'lucide-react';
import { motion, AnimatePresence, ProgressBar } from './motion';
import { Sparkline } from './charts';
import type { RequestStatus } from '@/lib/demo/world';

/**
 * Desktop admin kit — KPI cards, data tables, status pills, simple SVG charts.
 * Mirrors the prototypes' dashboard/table/chart styling. Pair with the base
 * primitives in ui.tsx (Badge, Avatar, Stars, Input, etc.).
 */

export function PageHeading({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-navy sm:text-2xl">{title}</h1>
        {sub && <p className="mt-1 text-[13.5px] text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, action, children, className = '' }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-line bg-white shadow-card ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-line px-4 py-3.5 sm:px-5">
          {title && <h2 className="text-[15px] font-bold text-navy">{title}</h2>}
          {action}
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function StatCard({ label, value, suffix, delta, trend, note, progress, spark, icon: Icon, index = 0, href, live }: {
  label: string; value: React.ReactNode; suffix?: string; delta?: string; trend?: 'up' | 'down'; note?: string; progress?: number; spark?: number[]; icon?: LucideIcon; index?: number;
  /** Convierte la tarjeta en enlace (hover: elevación + flecha en el tile del icono). */
  href?: string;
  /** Punto cyan pulsante junto a la etiqueta — métricas "ahora / en vivo". */
  live?: boolean;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">
          {live && (
            <span className="relative flex h-2 w-2" aria-label="en vivo">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
            </span>
          )}
          {label}
        </span>
        {Icon && (
          <span className="relative grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-info-soft text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
            <Icon size={16} className={href ? 'transition-opacity duration-200 group-hover:opacity-0' : undefined} />
            {href && <ArrowUpRight size={16} className="absolute opacity-0 transition-opacity duration-200 group-hover:opacity-100" />}
          </span>
        )}
      </div>

      <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-display text-[30px] font-extrabold leading-none tracking-tight text-navy [font-variant-numeric:tabular-nums]">{value}</span>
        {suffix && <span className="font-mono text-[12px] text-faint">{suffix}</span>}
        {delta && (
          <span className={`ml-auto inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[11px] font-bold ${trend === 'down' ? 'bg-error-soft text-error' : 'bg-success-soft text-success'}`}>
            {trend === 'down' ? <TrendingDown size={12} /> : <TrendingUp size={12} />}{delta}
          </span>
        )}
      </div>
      {note && <div className="mt-1.5 text-[11.5px] text-faint">{note}</div>}
      {progress != null && <ProgressBar value={progress} className="mt-3 !h-1.5" />}

      {spark && (
        <div className="-mx-5 -mb-5 mt-3 h-[42px] overflow-hidden rounded-b-2xl opacity-80 transition-opacity duration-200 group-hover:opacity-100">
          <Sparkline values={spark} area fluid />
        </div>
      )}
    </>
  );

  const cls =
    'group block h-full rounded-2xl border border-line bg-white p-5 shadow-card transition-[transform,box-shadow,border-color] duration-200 ' +
    (href
      ? 'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-hover focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-primary/35'
      : 'hover:shadow-hover');

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }} className="h-full">
      {href ? <Link href={href} className={cls}>{body}</Link> : <div className={cls}>{body}</div>}
    </motion.div>
  );
}

const STATUS: Record<string, { label: string; cls: string }> = {
  solicitado: { label: 'Solicitado', cls: 'bg-surface-2 text-navy' },
  aceptado: { label: 'Aceptado', cls: 'bg-info-soft text-primary-2' },
  en_camino: { label: 'En camino', cls: 'bg-warning-soft text-warning-ink' },
  en_sitio: { label: 'En sitio', cls: 'bg-warning-soft text-warning-ink' },
  en_ejecucion: { label: 'En ejecución', cls: 'bg-primary/[0.12] text-primary' },
  completado: { label: 'Completado', cls: 'bg-success-soft text-success' },
  pagado: { label: 'Pagado', cls: 'bg-success-soft text-success' },
  calificado: { label: 'Calificado', cls: 'bg-success-soft text-success' },
  cancelado: { label: 'Cancelado', cls: 'bg-error-soft text-error' },
  rechazado: { label: 'Rechazado', cls: 'bg-error-soft text-error' },
};
export function StatusPill({ status }: { status: RequestStatus | string }) {
  const s = STATUS[status] ?? { label: status, cls: 'bg-surface-2 text-navy' };
  return <span className={`inline-block rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${s.cls}`}>{s.label}</span>;
}

// ── Data table ───────────────────────────────────────────────────────────────
export interface Column<T> { key: string; header: string; render: (row: T) => React.ReactNode; className?: string }
export function DataTable<T>({ columns, rows, onRowClick, empty = 'Sin resultados' }: {
  columns: Column<T>[]; rows: T[]; onRowClick?: (row: T) => void; empty?: string;
}) {
  return (
    // ponytail: en móvil la tabla scrollea en horizontal (min-w) en vez de
    // convertirse en tarjetas — mismo markup, cero componente extra.
    <div className="-mx-4 overflow-x-auto px-4 sm:-mx-5 sm:px-5">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-line">
            {columns.map(c => (
              <th key={c.key} className={`whitespace-nowrap px-4 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-faint ${c.className ?? ''}`}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-[13px] text-faint">{empty}</td></tr>
          ) : rows.map((row, i) => (
            <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}
              onClick={() => onRowClick?.(row)}
              whileTap={onRowClick ? { scale: 0.995 } : undefined}
              className={`border-b border-line/70 text-[13.5px] text-navy ${onRowClick ? 'cursor-pointer hover:bg-surface' : ''}`}>
              {columns.map(c => <td key={c.key} className={`px-4 py-3.5 ${c.className ?? ''}`}>{c.render(row)}</td>)}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Charts (dependency-free SVG, animated) ───────────────────────────────────

// ── Modal (scrim + scale/slide, AnimatePresence) ─────────────────────────────
export function Modal({ open, onClose, title, sub, icon, children, footer, width = 560 }: {
  open: boolean; onClose: () => void; title: string; sub?: string;
  icon?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode; width?: number;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 grid place-items-center bg-navy/45 p-4 backdrop-blur-[2px] sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.2, 0.7, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
            style={{ width, maxWidth: '100%' }}
            className="max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-overlay"
          >
            <div className="flex items-start gap-3.5 border-b border-line/70 px-4 pb-4 pt-5 sm:px-6">
              {icon && <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-info-soft text-primary">{icon}</span>}
              <div className="min-w-0 flex-1">
                <div className="text-[16px] font-bold text-navy">{title}</div>
                {sub && <div className="mt-0.5 text-[12.5px] text-muted">{sub}</div>}
              </div>
              <button onClick={onClose} aria-label="Cerrar" className="grid place-items-center rounded-lg border border-line p-1.5 text-muted hover:bg-surface">
                <X size={15} />
              </button>
            </div>
            <div className="px-4 py-5 sm:px-6">{children}</div>
            {footer && <div className="flex flex-wrap justify-end gap-2.5 border-t border-line/70 px-4 py-4 sm:px-6">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── CSV export (client-side blob download) ───────────────────────────────────
export function exportCsv(filename: string, rows: Record<string, string | number | null | undefined>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const esc = (v: string | number | null | undefined) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => esc(r[h])).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Horizontal category breakdown bars with values. */
