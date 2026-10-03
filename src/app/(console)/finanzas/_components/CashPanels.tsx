'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Download, Gavel } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  Kicker,
  Select,
  Toggle,
  toast,
  type DataColumn,
} from '@/components/ds';
import { exportCsv } from '@/components/admin';
import { CashReviewModal } from '@/components/cash-review-modal';
import { fetchCashByTechnician, fetchCashReviews, fetchPaymentsReport, useTick } from '@/lib/data/store';
import { fmtDate } from '@/lib/dates';
import { orderCode } from '@/lib/orderCode';
import {
  BASE_STATUS,
  CASH_STATUS,
  CASH_STATUS_OPTIONS,
  METHOD_FILTER_OPTIONS,
  cashByTechCsvRows,
  cashTotals,
  methodName,
  paymentsReportCsvRows,
  reviewReason,
  type CashReviewRow,
  type CashStatus,
  type CashTechRow,
  type MethodFilter,
  type PaymentsReportRow,
} from '@/lib/payments';
import { money } from './fin-parts';

const ago = (iso: string | null) => {
  if (!iso) return '—';
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  return m < 60 ? `hace ${m} min` : m < 1440 ? `hace ${Math.round(m / 60)} h` : `hace ${Math.round(m / 1440)} d`;
};

/* ── Revisión de efectivo ─────────────────────────────────────────────── */

export function CashReviewQueue({ canResolve }: { canResolve: boolean }) {
  const tick = useTick();
  const router = useRouter();
  const [rows, setRows] = useState<CashReviewRow[] | null | undefined>(undefined);
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    void fetchCashReviews().then(r => live && setRows(r));
    return () => {
      live = false;
    };
  }, [tick]);

  return (
    <div className="p-5">
      <p className="mb-4 font-sans text-[13px] text-muted">
        Servicios donde el efectivo no cuadra (el cliente dice que no pagó o pagó otro monto, o el técnico reportó
        un monto distinto al presupuesto). Al resolver se avisa a ambas partes y queda en la bitácora.
      </p>
      {rows === undefined ? (
        <p className="font-sans text-[13px] text-muted">Cargando…</p>
      ) : rows === null ? (
        <EmptyState kind="no-results" compact title="Cola no disponible" description="El servidor no respondió. Reintenta en un momento." />
      ) : rows.length === 0 ? (
        <EmptyState kind="all-clear" compact title="Sin revisiones abiertas" description="Todo el efectivo está conciliado." />
      ) : (
        <ul className="flex flex-col divide-y divide-divider" aria-label="Revisiones de efectivo abiertas">
          {rows.map(r => (
            <li key={r.payment_id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3.5">
              <div className="min-w-[200px] flex-1">
                <button
                  type="button"
                  onClick={() => router.push(`/servicios/${r.order_id}`)}
                  className="font-mono text-[12.5px] font-semibold text-primary hover:underline"
                >
                  {orderCode(r.order_id)}
                </button>
                <div className="font-sans text-[13.5px] font-semibold text-navy">{reviewReason(r.review_reason)}</div>
                <div className="font-sans text-[12.5px] text-muted">
                  {r.technician_name ?? 'Técnico'} · {r.client_name ?? 'Cliente'} · {ago(r.review_opened_at)}
                </div>
                {r.client_dispute_reason && (
                  <div className="mt-0.5 font-sans text-[12.5px] italic text-muted">“{r.client_dispute_reason}”</div>
                )}
              </div>
              <dl className="grid grid-cols-3 gap-3 text-right">
                {[
                  ['Presupuesto', r.expected_cents],
                  ['Técnico', r.received_cents],
                  ['Cliente', r.client_reported_cents],
                ].map(([label, v]) => (
                  <div key={label as string}>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{label}</dt>
                    <dd className="font-mono text-[13px] font-semibold text-navy tabular">
                      {v == null ? '—' : money(Number(v))}
                    </dd>
                  </div>
                ))}
              </dl>
              <Button
                size="sm"
                icon={Gavel}
                disabled={!canResolve}
                title={canResolve ? undefined : 'Solo soporte o finanzas resuelven la revisión'}
                onClick={() => setTarget(r.order_id)}
              >
                Resolver
              </Button>
            </li>
          ))}
        </ul>
      )}
      <CashReviewModal orderId={target} open={target !== null} onClose={() => setTarget(null)} />
    </div>
  );
}

/* ── Efectivo por técnico ─────────────────────────────────────────────── */

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'error' | 'warning' }) {
  return (
    <div className="min-w-0 rounded-card border border-line bg-white px-3.5 py-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{label}</div>
      <div
        className={`mt-1 font-display text-[18px] font-extrabold tabular ${
          tone === 'error' ? 'text-error' : tone === 'warning' ? 'text-warning-ink' : 'text-navy'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export function CashByTechnician({ from, to, label }: { from: Date; to: Date; label: string }) {
  const tick = useTick();
  const router = useRouter();
  const [rows, setRows] = useState<CashTechRow[] | null | undefined>(undefined);

  useEffect(() => {
    let live = true;
    setRows(undefined);
    void fetchCashByTechnician(from, to).then(r => live && setRows(r));
    return () => {
      live = false;
    };
  }, [from, to, tick]);

  const totals = useMemo(() => cashTotals(rows ?? []), [rows]);
  const num = (c: number | string) => money(Number(c));
  const cols: DataColumn<CashTechRow>[] = [
    {
      key: 'tech',
      header: 'Técnico',
      sortValue: r => r.technician_name ?? '',
      render: r => <span className="font-sans text-[13.5px] font-semibold text-navy">{r.technician_name ?? 'Técnico'}</span>,
    },
    { key: 'n', header: 'Servicios', align: 'right', sortValue: r => Number(r.services_count), render: r => <span className="font-mono text-[12.5px] tabular">{Number(r.services_count)}</span> },
    { key: 'exp', header: 'Esperado', align: 'right', sortValue: r => Number(r.cash_expected_cents), render: r => <span className="font-mono text-[12.5px] tabular">{num(r.cash_expected_cents)}</span> },
    { key: 'rep', header: 'Reportado', align: 'right', sortValue: r => Number(r.cash_reported_cents), render: r => <span className="font-mono text-[12.5px] tabular">{num(r.cash_reported_cents)}</span> },
    { key: 'conf', header: 'Confirmado', align: 'right', sortValue: r => Number(r.cash_client_confirmed_cents), render: r => <span className="font-mono text-[12.5px] tabular text-success">{num(r.cash_client_confirmed_cents)}</span> },
    { key: 'wait', header: 'Por confirmar', align: 'right', sortValue: r => Number(r.cash_awaiting_client_cents), render: r => <span className="font-mono text-[12.5px] tabular">{num(r.cash_awaiting_client_cents)}</span> },
    { key: 'disp', header: 'En disputa', align: 'right', sortValue: r => Number(r.cash_disputed_cents), render: r => <span className={`font-mono text-[12.5px] tabular ${Number(r.cash_disputed_cents) ? 'text-error' : ''}`}>{num(r.cash_disputed_cents)}</span> },
    {
      key: 'rev',
      header: 'Revisiones',
      align: 'right',
      sortValue: r => Number(r.reviews_open),
      render: r => (Number(r.reviews_open) ? <Badge tone="danger">{Number(r.reviews_open)}</Badge> : <span className="text-faint">—</span>),
    },
    { key: 'gen', header: 'Comisión generada', align: 'right', sortValue: r => Number(r.commission_generated_cents), render: r => <span className="font-mono text-[12.5px] tabular">{num(r.commission_generated_cents)}</span> },
    { key: 'rec', header: 'Recuperada', align: 'right', sortValue: r => Number(r.commission_recovered_cents), render: r => <span className="font-mono text-[12.5px] tabular">{num(r.commission_recovered_cents)}</span> },
    { key: 'pen', header: 'Pendiente', align: 'right', sortValue: r => Number(r.commission_pending_cents), render: r => <span className={`font-mono text-[12.5px] font-semibold tabular ${Number(r.commission_pending_cents) ? 'text-warning-ink' : ''}`}>{num(r.commission_pending_cents)}</span> },
  ];

  return (
    <div className="p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[640px] font-sans text-[13px] text-muted">
          Efectivo cobrado por técnico en {label} (por fecha de reporte). La comisión del efectivo es deuda del técnico:
          se descuenta sola de su saldo con los fondos que la plataforma retiene.
        </p>
        <Button
          variant="secondary"
          icon={Download}
          disabled={!rows?.length}
          onClick={() => {
            exportCsv(`efectivo-por-tecnico-${label.replace(/\W+/g, '-')}.csv`, cashByTechCsvRows(rows ?? []));
            toast.success('CSV exportado', `${rows?.length ?? 0} técnicos`);
          }}
        >
          Exportar CSV
        </Button>
      </div>
      {rows === null ? (
        <EmptyState kind="no-results" compact title="Reporte no disponible" description="Requiere permiso de finanzas o el servidor no respondió." />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
            <Stat label="Esperado" value={num(totals.expected)} />
            <Stat label="Reportado" value={num(totals.reported)} />
            <Stat label="Confirmado" value={num(totals.confirmed)} />
            <Stat label="Por confirmar" value={num(totals.awaiting)} />
            <Stat label="En disputa" value={num(totals.disputed)} tone={totals.disputed ? 'error' : undefined} />
            <Stat label="Comisión generada" value={num(totals.generated)} />
            <Stat label="Recuperada" value={num(totals.recovered)} />
            <Stat label="Pendiente" value={num(totals.pending)} tone={totals.pending ? 'warning' : undefined} />
          </div>
          <DataTable
            rows={rows ?? []}
            rowKey={r => r.technician_id}
            columns={cols}
            loading={rows === undefined}
            onRowClick={r => router.push(`/tecnicos/${r.technician_id}`)}
            initialSort={{ key: 'pen', dir: 'desc' }}
            pageSize={8}
            minWidth={1040}
            empty={<EmptyState kind="no-results" compact title="Sin efectivo en el periodo" description="Ningún técnico reportó efectivo en estas fechas." />}
          />
        </>
      )}
    </div>
  );
}

/* ── Pagos por servicio ───────────────────────────────────────────────── */

const PAGE = 100;

export function PaymentsReport({ from, to, label }: { from: Date; to: Date; label: string }) {
  const tick = useTick();
  const router = useRouter();
  const [method, setMethod] = useState<MethodFilter>('all');
  const [cashStatus, setCashStatus] = useState<CashStatus | null>(null);
  const [onlyReview, setOnlyReview] = useState(false);
  const [page, setPage] = useState(0);
  const [data, setData] = useState<{ rows: PaymentsReportRow[]; total: number } | null | undefined>(undefined);

  useEffect(() => setPage(0), [from, to, method, cashStatus, onlyReview]);
  useEffect(() => {
    let live = true;
    void fetchPaymentsReport(from, to, { method, cashStatus, onlyReview }, page, PAGE).then(r => live && setData(r));
    return () => {
      live = false;
    };
  }, [from, to, method, cashStatus, onlyReview, page, tick]);

  const total = data?.total ?? 0;
  const cols: DataColumn<PaymentsReportRow>[] = [
    {
      key: 'svc',
      header: 'Servicio',
      sortValue: r => r.folio,
      render: r => (
        <div>
          <span className="font-mono text-[12.5px] font-semibold text-primary">{orderCode(r.order_id)}</span>
          <div className="font-sans text-[11.5px] text-muted">{fmtDate(r.created_at, { day: '2-digit', month: 'short' })}</div>
        </div>
      ),
    },
    {
      key: 'who',
      header: 'Cliente · Técnico',
      sortValue: r => r.client_name ?? '',
      render: r => (
        <div className="font-sans text-[12.5px]">
          <div className="font-semibold text-navy">{r.client_name ?? 'Cliente'}</div>
          <div className="text-muted">{r.technician_name ?? 'Sin técnico'}</div>
        </div>
      ),
    },
    {
      key: 'base',
      header: 'Tarifa base · Tarjeta',
      align: 'right',
      sortValue: r => Number(r.base_total_cents),
      render: r =>
        r.payment_model === 'base_cash' ? (
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-mono text-[12.5px] font-semibold text-navy tabular">{money(Number(r.base_total_cents))}</span>
            <Badge tone={BASE_STATUS[r.base_fee_status]?.tone ?? 'neutral'}>{BASE_STATUS[r.base_fee_status]?.label ?? r.base_fee_status}</Badge>
          </div>
        ) : (
          <span className="font-sans text-[12px] text-faint">Modelo anterior</span>
        ),
    },
    {
      key: 'quote',
      header: 'Presupuesto',
      align: 'right',
      sortValue: r => Number(r.quote_total_cents ?? 0),
      render: r => (
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-mono text-[12.5px] font-semibold text-navy tabular">
            {r.quote_total_cents == null ? '—' : money(Number(r.quote_total_cents))}
          </span>
          <span className="font-sans text-[11.5px] text-muted">{methodName(r.quote_method)}</span>
        </div>
      ),
    },
    {
      key: 'cash',
      header: 'Efectivo',
      sortValue: r => r.cash_status ?? '',
      render: r =>
        r.cash_status ? (
          <div className="flex flex-col items-start gap-0.5">
            <Badge tone={CASH_STATUS[r.cash_status]?.tone ?? 'neutral'}>{CASH_STATUS[r.cash_status]?.label ?? r.cash_status}</Badge>
            <span className="font-mono text-[11.5px] text-muted tabular">
              {r.cash_received_cents != null ? money(Number(r.cash_received_cents)) : '—'} / {r.cash_expected_cents != null ? money(Number(r.cash_expected_cents)) : '—'}
            </span>
          </div>
        ) : (
          <span className="text-faint">—</span>
        ),
    },
    { key: 'comm', header: 'Comisión', align: 'right', sortValue: r => Number(r.commission_cents), render: r => <span className="font-mono text-[12.5px] text-muted tabular">{money(Number(r.commission_cents))}</span> },
    { key: 'tot', header: 'Total', align: 'right', sortValue: r => Number(r.total_cents), render: r => <span className="font-mono text-[13px] font-semibold text-navy tabular">{money(Number(r.total_cents))}</span> },
    {
      key: 'rev',
      header: 'Revisión',
      render: r => (r.cash_review_open ? <Badge tone="danger">Abierta</Badge> : <span className="text-faint">—</span>),
    },
  ];

  async function onExport() {
    const all = await fetchPaymentsReport(from, to, { method, cashStatus, onlyReview }, 0, 500);
    if (!all) return toast.error('No se pudo exportar el reporte');
    exportCsv(`pagos-por-servicio-${label.replace(/\W+/g, '-')}.csv`, paymentsReportCsvRows(all.rows));
    toast.success('CSV exportado', `${all.rows.length} de ${all.total} servicios`);
  }

  return (
    <div className="p-5">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-[170px]">
          <Kicker className="mb-1.5">Forma de pago</Kicker>
          <Select
            aria-label="Forma de pago"
            options={METHOD_FILTER_OPTIONS.map(o => ({ value: o.value, label: o.value === 'all' ? 'Todas' : o.label }))}
            value={method}
            onChange={setMethod}
          />
        </div>
        <div className="w-[220px]">
          <Kicker className="mb-1.5">Estado del efectivo</Kicker>
          <Select
            aria-label="Estado del efectivo"
            options={[{ value: '' as CashStatus, label: 'Todos' }, ...CASH_STATUS_OPTIONS]}
            value={cashStatus ?? ('' as CashStatus)}
            onChange={v => setCashStatus(v || null)}
          />
        </div>
        <Toggle checked={onlyReview} onChange={setOnlyReview} label="Solo en revisión" />
        <div className="ml-auto">
          <Button variant="secondary" icon={Download} disabled={!total} onClick={() => void onExport()}>
            Exportar CSV
          </Button>
        </div>
      </div>
      {data === null ? (
        <EmptyState kind="no-results" compact title="Reporte no disponible" description="El servidor no respondió. Reintenta en un momento." />
      ) : (
        <Card padded={false} className="overflow-hidden">
          <DataTable
            rows={data?.rows ?? []}
            rowKey={r => r.order_id}
            columns={cols}
            loading={data === undefined}
            onRowClick={r => router.push(`/servicios/${r.order_id}`)}
            pageSize={8}
            minWidth={980}
            empty={<EmptyState kind="no-results" compact title="Sin servicios" description="No hay servicios con esos filtros en el periodo." />}
          />
        </Card>
      )}
      {total > PAGE && (
        <div className="mt-3 flex items-center justify-between font-sans text-[12.5px] text-muted">
          <span>
            Servicios {page * PAGE + 1}–{Math.min((page + 1) * PAGE, total)} de {total}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" icon={ChevronLeft} disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              Anterior
            </Button>
            <Button size="sm" variant="secondary" disabled={(page + 1) * PAGE >= total} onClick={() => setPage(p => p + 1)}>
              Siguiente <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
