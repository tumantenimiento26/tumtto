'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Gavel, SlidersHorizontal } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  Kicker,
  Segmented,
  Skeleton,
  Select,
  Sheet,
} from '@/components/ds';
import { CashReviewModal } from '@/components/cash-review-modal';
import { fetchCashReviews, getRequest, useTick } from '@/lib/data/store';
import { isAdminOwned } from '@/lib/commission';
import { orderCode } from '@/lib/orderCode';
import {
  EMPTY_CASH_REVIEW_FILTERS,
  REVIEW_REASON_LABEL,
  activeCashReviewFilters,
  filterCashReviews,
  reviewReason,
  type CashReviewFilters,
  type CashReviewRow,
} from '@/lib/payments';

const money = (cents: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(cents / 100);

const ago = (iso: string | null) => {
  if (!iso) return '—';
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  return m < 60 ? `hace ${m} min` : m < 1440 ? `hace ${Math.round(m / 60)} h` : `hace ${Math.round(m / 1440)} d`;
};

const REASONS: { value: CashReviewFilters['reason']; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'amount_mismatch', label: 'Técnico reportó otro monto' },
  { value: 'client_amount_mismatch', label: 'Cliente disputó el monto' },
  { value: 'client_not_paid', label: 'No pagado' },
];
const AGES: { value: string; label: string }[] = [
  { value: '0', label: 'Cualquiera' },
  { value: '1', label: '+1 día' },
  { value: '3', label: '+3 días' },
  { value: '7', label: '+7 días' },
];

/**
 * «Revisión de pagos» › Efectivo: la cola de antes (efectivo que no cuadra
 * entre técnico y cliente). RPC admin_list_cash_reviews / resolve; la página
 * ya validó soporte o finanzas.
 */
export function CashReviewPanel() {
  const tick = useTick();
  const [rows, setRows] = useState<CashReviewRow[] | null | undefined>(undefined);
  const [target, setTarget] = useState<string | null>(null);
  const [f, setF] = useState<CashReviewFilters>(EMPTY_CASH_REVIEW_FILTERS);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let live = true;
    void fetchCashReviews().then(r => live && setRows(r));
    return () => {
      live = false;
    };
  }, [tick]);

  const techs = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of rows ?? []) if (r.technician_id) m.set(r.technician_id, r.technician_name ?? 'Técnico');
    return [...m].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label, 'es'));
  }, [rows]);
  const visible = useMemo(() => filterCashReviews(rows ?? [], f), [rows, f]);
  const nFilters = activeCashReviewFilters(f);

  if (rows === undefined) return <Skeleton className="h-40 w-full" />;

  const total = rows?.length ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-sans text-[13px] text-muted">
          {rows === null
            ? 'Efectivo que no cuadra entre el técnico y el cliente.'
            : `${visible.length} de ${total} ${total === 1 ? 'revisión abierta' : 'revisiones abiertas'} · el efectivo no cuadra entre técnico y cliente`}
        </p>
        <Button variant="secondary" icon={SlidersHorizontal} onClick={() => setOpen(true)}>
          Filtros
          {nFilters > 0 && (
            <span className="ml-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 font-mono text-[11px] text-white">
              {nFilters}
            </span>
          )}
        </Button>
      </div>

      {nFilters > 0 && (
        <div className="flex flex-wrap gap-2">
          {f.reason !== 'all' && (
            <Chip active onRemove={() => setF(s => ({ ...s, reason: 'all' }))}>
              {REVIEW_REASON_LABEL[f.reason]}
            </Chip>
          )}
          {f.minDays > 0 && (
            <Chip active onRemove={() => setF(s => ({ ...s, minDays: 0 }))}>
              +{f.minDays} {f.minDays === 1 ? 'día' : 'días'}
            </Chip>
          )}
          {f.technicianId && (
            <Chip active onRemove={() => setF(s => ({ ...s, technicianId: '' }))}>
              {techs.find(t => t.value === f.technicianId)?.label ?? 'Técnico'}
            </Chip>
          )}
        </div>
      )}

      <Card padded={false} className="overflow-hidden">
        <div className="p-5">
          {rows === null ? (
            <EmptyState kind="no-results" compact title="Cola no disponible" description="El servidor no respondió. Reintenta en un momento." />
          ) : total === 0 ? (
            <EmptyState kind="all-clear" compact title="Sin revisiones abiertas" description="Todo el efectivo está conciliado." />
          ) : visible.length === 0 ? (
            <EmptyState
              kind="no-results"
              compact
              title="Sin resultados"
              description="Ninguna revisión coincide con los filtros."
              action={
                <Button variant="secondary" onClick={() => setF(EMPTY_CASH_REVIEW_FILTERS)}>
                  Quitar filtros
                </Button>
              }
            />
          ) : (
            <ul className="flex flex-col divide-y divide-divider" aria-label="Revisiones de efectivo abiertas">
              {visible.map(r => (
                <li key={r.payment_id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3.5">
                  <div className="min-w-[200px] flex-1">
                    <Link
                      href={`/servicios/${r.order_id}`}
                      className="inline-flex items-center gap-1 font-mono text-[12.5px] font-semibold text-primary hover:underline"
                    >
                      {orderCode(r.order_id)} <ExternalLink size={11} aria-hidden />
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 font-sans text-[13.5px] font-semibold text-navy">
                      {reviewReason(r.review_reason)}
                      {isAdminOwned(getRequest(r.order_id)) && <Badge tone="info">Efectivo de Tu Mantenimiento</Badge>}
                    </div>
                    <div className="font-sans text-[12.5px] text-muted">
                      {r.technician_name ?? 'Técnico'} · {r.client_name ?? 'Cliente'} · {ago(r.review_opened_at)}
                    </div>
                    {r.client_dispute_reason && (
                      <div className="mt-0.5 font-sans text-[12.5px] italic text-muted">“{r.client_dispute_reason}”</div>
                    )}
                  </div>
                  <dl className="grid grid-cols-3 gap-3 text-right">
                    {(
                      [
                        ['Presupuesto', r.expected_cents],
                        ['Técnico', r.received_cents],
                        ['Cliente', r.client_reported_cents],
                      ] as const
                    ).map(([label, v]) => (
                      <div key={label}>
                        <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{label}</dt>
                        <dd className="font-mono text-[13px] font-semibold text-navy tabular">
                          {v == null ? '—' : money(Number(v))}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <Button size="sm" icon={Gavel} onClick={() => setTarget(r.order_id)}>
                    Resolver
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        width={400}
        kicker="Revisión de pagos · Efectivo"
        title="Filtros"
        footer={
          <div className="flex w-full gap-2.5">
            <Button variant="secondary" onClick={() => setF(EMPTY_CASH_REVIEW_FILTERS)}>
              Limpiar
            </Button>
            <Button full onClick={() => setOpen(false)}>
              Mostrar {visible.length} {visible.length === 1 ? 'revisión' : 'revisiones'}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          <section>
            <Kicker className="mb-2.5">Motivo</Kicker>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Motivo">
              {REASONS.map(o => (
                <Chip key={o.value} active={f.reason === o.value} onClick={() => setF(s => ({ ...s, reason: o.value }))}>
                  {o.label}
                </Chip>
              ))}
            </div>
          </section>
          <section>
            <Kicker className="mb-2.5">Antigüedad</Kicker>
            <Segmented
              size="sm"
              options={AGES}
              value={String(f.minDays)}
              onChange={v => setF(s => ({ ...s, minDays: Number(v) as CashReviewFilters['minDays'] }))}
            />
          </section>
          <section>
            <Kicker className="mb-2.5">Técnico</Kicker>
            <Select
              aria-label="Técnico"
              options={[{ value: '', label: 'Todos los técnicos' }, ...techs]}
              value={f.technicianId}
              onChange={technicianId => setF(s => ({ ...s, technicianId }))}
            />
          </section>
        </div>
      </Sheet>

      <CashReviewModal orderId={target} open={target !== null} onClose={() => setTarget(null)} />
    </div>
  );
}
