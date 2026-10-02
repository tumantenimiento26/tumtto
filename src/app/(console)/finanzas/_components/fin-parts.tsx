'use client';

import { useState } from 'react';
import { CreditCard, Store, Wallet, Banknote } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ds';
import type { BucketTotals } from '@/lib/finance';

/** Centavos → "$1,234.50" (los montos de finanzas se muestran exactos). */
export const money = (c: number) =>
  (c / 100).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
export const shortMoney = (c: number) => {
  const p = c / 100;
  return p >= 1000 ? `$${(p / 1000).toFixed(p >= 10000 ? 0 : 1)}k` : `$${Math.round(p)}`;
};

export const METHOD: Record<string, { label: string; icon: LucideIcon; color: string }> = {
  card: { label: 'Tarjeta', icon: CreditCard, color: 'var(--color-primary)' },
  wallet: { label: 'Mercado Pago', icon: Wallet, color: 'var(--color-cyan)' },
  oxxo: { label: 'OXXO', icon: Store, color: 'var(--color-warning)' },
  cash: { label: 'Efectivo', icon: Banknote, color: 'var(--color-success)' },
};
export const methodMeta = (m: string) =>
  METHOD[m] ?? { label: m, icon: CreditCard, color: 'var(--color-muted)' };

export function KpiCard({
  label,
  value,
  delta,
  negative,
  index = 0,
}: {
  label: string;
  value: string;
  delta: string;
  /** El delta es "malo" (p. ej. crece lo que se debe). */
  negative?: boolean;
  index?: number;
}) {
  const bad = negative ? !delta.startsWith('−') : delta.startsWith('−');
  return (
    <Card padded hover className="animate-up" >
      <div style={{ animationDelay: `${index * 50}ms` }}>
        <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">{label}</div>
        <div className="mt-2 font-display text-[27px] font-extrabold tracking-[-0.5px] text-navy tabular">
          {value}
        </div>
        <span
          className={`mt-2 inline-block rounded-full px-2 py-0.5 font-mono text-[11.5px] font-semibold ${
            delta === 'nuevo'
              ? 'bg-info-soft text-primary'
              : delta === '0.0%'
                ? 'bg-segment text-muted'
              : bad
                ? 'bg-error-soft text-error'
                : 'bg-success-soft text-success'
          }`}
        >
          {delta}
        </span>
        <span className="ml-2 font-sans text-[12px] text-muted">vs periodo anterior</span>
      </div>
    </Card>
  );
}

/** Barras apiladas (neto técnico abajo, comisión arriba) con meta, banda y tooltip. */
export function StackedBars({
  data,
  labels,
  goal,
  goalLabel,
}: {
  data: BucketTotals[];
  labels: string[];
  goal: number;
  goalLabel: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(goal, ...data.map(d => d.gross), 1) * 1.1;
  const goalTop = 100 - (goal / max) * 100;
  const dense = data.length > 14;
  const tip = hover != null ? data[hover] : null;
  const tipLeft = hover != null ? Math.min(Math.max(((hover + 0.5) / data.length) * 100, 12), 88) : 0;

  return (
    <div className="relative select-none">
      <div className="relative h-[220px]" onMouseLeave={() => setHover(null)}>
        {/* Líneas guía */}
        {[0.25, 0.5, 0.75].map(p => (
          <div key={p} className="absolute inset-x-0 border-t border-dashed border-divider" style={{ top: `${p * 100}%` }} />
        ))}
        {/* Meta */}
        {goal > 0 && (
          <div className="pointer-events-none absolute inset-x-0 z-10" style={{ top: `${goalTop}%` }}>
            <div className="border-t-2 border-dashed border-cyan" />
            <span className="absolute right-0 -top-5 rounded bg-card px-1.5 font-mono text-[10.5px] font-semibold text-cyan">
              {goalLabel}
            </span>
          </div>
        )}
        <div className="absolute inset-0 flex items-end gap-[3px]">
          {data.map((d, i) => {
            const active = hover == null || hover === i;
            return (
              <div
                key={i}
                className={`relative flex h-full flex-1 flex-col justify-end rounded-t-[4px] transition-colors ${hover === i ? 'bg-primary/[0.07]' : ''}`}
                onMouseEnter={() => setHover(i)}
                role="img"
                aria-label={`${labels[i]}: ${money(d.gross)}`}
              >
                <div
                  className="w-full origin-bottom rounded-t-[4px] transition-[height,opacity] duration-500"
                  style={{
                    height: `${(d.commission / max) * 100}%`,
                    background: 'var(--color-navy)',
                    opacity: active ? 1 : 0.35,
                    animation: `bar-grow .6s ${i * 30}ms both`,
                  }}
                />
                <div
                  className="w-full origin-bottom transition-[height,opacity] duration-500"
                  style={{
                    height: `${(d.net / max) * 100}%`,
                    background: 'var(--color-primary)',
                    opacity: active ? 1 : 0.35,
                    animation: `bar-grow .6s ${i * 30}ms both`,
                  }}
                />
              </div>
            );
          })}
        </div>
        {tip && hover != null && (
          <div
            className="pointer-events-none absolute top-2 z-20 min-w-[170px] -translate-x-1/2 rounded-[10px] bg-tooltip px-3 py-2.5 text-white shadow-float transition-[left] duration-100"
            style={{ left: `${tipLeft}%` }}
          >
            <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-white/60">
              {labels[hover]} · {tip.count} servicios
            </div>
            <div className="mt-0.5 font-display text-[18px] font-extrabold tabular">{money(tip.gross)}</div>
            <div className="mt-1 flex justify-between gap-4 font-sans text-[12px] text-white/80">
              <span>Comisión</span>
              <span className="tabular">{money(tip.commission)}</span>
            </div>
            <div className="flex justify-between gap-4 font-sans text-[12px] text-white/80">
              <span>Neto técnico</span>
              <span className="tabular">{money(tip.net)}</span>
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 flex gap-[3px]">
        {labels.map((l, i) => (
          <span
            key={i}
            className={`flex-1 text-center font-mono text-[10px] ${hover === i ? 'font-semibold text-navy' : 'text-faint'}`}
          >
            {dense && i % 3 !== 0 && i !== labels.length - 1 ? '' : l}
          </span>
        ))}
      </div>
      <style>{`@keyframes bar-grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}@media (prefers-reduced-motion: reduce){[style*="bar-grow"]{animation:none!important}}`}</style>
    </div>
  );
}

/** Barra segmentada por método + filas con hover. */
export function MethodBreakdown({
  rows,
}: {
  rows: { method: string; amount: number; pct: number }[];
}) {
  const [hover, setHover] = useState<number | null>(null);
  if (!rows.length)
    return <p className="font-sans text-[13px] text-muted">Sin cobros en este periodo.</p>;
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-segment">
        {rows.map((r, i) => (
          <div
            key={r.method}
            className="h-full transition-opacity"
            style={{
              width: `${r.pct}%`,
              background: methodMeta(r.method).color,
              opacity: hover == null || hover === i ? 1 : 0.35,
            }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-col">
        {rows.map((r, i) => {
          const m = methodMeta(r.method);
          return (
            <div
              key={r.method}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className={`flex items-center gap-3 rounded-[8px] px-2 py-2.5 transition-colors ${hover === i ? 'bg-panel' : ''}`}
            >
              <span className="grid h-8 w-8 place-items-center rounded-[8px]" style={{ background: `color-mix(in srgb, ${m.color} 14%, transparent)`, color: m.color }}>
                <m.icon size={15} />
              </span>
              <span className="flex-1 font-sans text-[13.5px] font-semibold text-navy">{m.label}</span>
              <span className="font-mono text-[13px] text-navy tabular">{money(r.amount)}</span>
              <span className="w-10 text-right font-mono text-[12px] text-muted">{r.pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
