'use client';
import { TrendingUp, TrendingDown, X, type LucideIcon } from 'lucide-react';
import { motion, AnimatePresence, ProgressBar } from './motion';
import type { RequestStatus } from '@/lib/demo/world';

/**
 * Desktop admin kit — KPI cards, data tables, status pills, simple SVG charts.
 * Mirrors the prototypes' dashboard/table/chart styling. Pair with the base
 * primitives in ui.tsx (Badge, Avatar, Stars, Input, etc.).
 */

export function PageHeading({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">{title}</h1>
        {sub && <p className="mt-1 text-[13.5px] text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, action, children, className = '' }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-line bg-white shadow-card ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          {title && <h2 className="text-[15px] font-bold text-navy">{title}</h2>}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatCard({ label, value, suffix, delta, trend, note, progress, icon: Icon, index = 0 }: {
  label: string; value: string | number; suffix?: string; delta?: string; trend?: 'up' | 'down'; note?: string; progress?: number; icon?: LucideIcon; index?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}
      className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-medium text-muted">{label}</span>
        {Icon && <span className="grid h-8 w-8 place-items-center rounded-lg bg-info-soft text-primary"><Icon size={16} /></span>}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-[28px] font-bold tracking-tight text-navy">{value}</span>
        {suffix && <span className="font-mono text-[12px] text-faint">{suffix}</span>}
      </div>
      {delta && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[12px]">
          <span className={`inline-flex items-center gap-0.5 font-semibold ${trend === 'down' ? 'text-error' : 'text-success'}`}>
            {trend === 'down' ? <TrendingDown size={13} /> : <TrendingUp size={13} />}{delta}
          </span>
          {note && <span className="text-faint">{note}</span>}
        </div>
      )}
      {progress != null && <ProgressBar value={progress} className="mt-3 !h-1.5" />}
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
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-line">
            {columns.map(c => (
              <th key={c.key} className={`px-4 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-faint ${c.className ?? ''}`}>{c.header}</th>
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
export function BarChart({ data, height = 180, color = '#0A6BCF' }: { data: { label: string; value: number }[]; height?: number; color?: string }) {
  const max = Math.max(1, ...data.map(d => d.value));
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d, i) => (
        <div key={d.label} className="flex flex-1 flex-col items-center justify-end gap-1.5">
          <motion.div initial={{ height: 0 }} animate={{ height: `${(d.value / max) * (height - 24)}px` }} transition={{ duration: 0.5, delay: i * 0.03 }}
            className="w-full rounded-t-md" style={{ background: color, minHeight: 2 }} title={`${d.label}: ${d.value}`} />
          <span className="font-mono text-[9.5px] text-faint">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

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
          className="fixed inset-0 z-50 grid place-items-center bg-navy/45 p-6 backdrop-blur-[2px]"
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
            <div className="flex items-start gap-3.5 border-b border-line/70 px-6 pb-4 pt-5">
              {icon && <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-info-soft text-primary">{icon}</span>}
              <div className="min-w-0 flex-1">
                <div className="text-[16px] font-bold text-navy">{title}</div>
                {sub && <div className="mt-0.5 text-[12.5px] text-muted">{sub}</div>}
              </div>
              <button onClick={onClose} aria-label="Cerrar" className="grid place-items-center rounded-lg border border-line p-1.5 text-muted hover:bg-surface">
                <X size={15} />
              </button>
            </div>
            <div className="px-6 py-5">{children}</div>
            {footer && <div className="flex justify-end gap-2.5 border-t border-line/70 px-6 py-4">{footer}</div>}
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
export function BreakdownBars({ data }: { data: { name: string; value: number; color?: string }[] }) {
  const max = Math.max(1, ...data.map(d => d.value));
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={d.name}>
          <div className="mb-1 flex items-center justify-between text-[12.5px]">
            <span className="text-navy">{d.name}</span>
            <span className="font-mono font-semibold text-muted">{d.value}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
            <motion.div initial={{ width: 0 }} animate={{ width: `${(d.value / max) * 100}%` }} transition={{ duration: 0.5, delay: i * 0.04 }}
              className="h-full rounded-full" style={{ background: d.color ?? '#0A6BCF' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
