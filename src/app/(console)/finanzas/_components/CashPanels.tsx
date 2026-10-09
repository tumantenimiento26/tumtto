'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
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
import { fetchCashByTechnician, fetchPaymentsReport, useTick } from '@/lib/data/store';
import { fmtDate } from '@/lib/dates';
import { orderCode } from '@/lib/orderCode';
import {
  BASE_STATUS,
  CASH_STATUS,
  CASH_STATUS_OPTIONS,
  METHOD_FILTER_OPTIONS,
  QUOTE_STATUS,
  quoteStatusLabel,
  cashByTechCsvRows,
  cashTotals,
  methodName,
  paymentsReportCsvRows,
  type CashStatus,
  type CashTechRow,
  type MethodFilter,
  type PaymentsReportRow,
  type QuoteStatus,
} from '@/lib/payments';
import { money } from './fin-parts';

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
    { key: 'bcr', header: 'Tarifa base acreditada', align: 'right', sortValue: r => Number(r.base_fee_credited_cents), render: r => <span className="font-mono text-[12.5px] tabular">{num(r.base_fee_credited_cents)}</span> },
    { key: 'scr', header: 'Recargo de horario acreditado', align: 'right', sortValue: r => Number(r.schedule_surcharge_credited_cents), render: r => <span className="font-mono text-[12.5px] tabular">{num(r.schedule_surcharge_credited_cents)}</span> },
    { key: 'qrj', header: 'Cotizaciones rechazadas', align: 'right', sortValue: r => Number(r.quotes_rejected), render: r => (Number(r.quotes_rejected) ? <Badge tone="warning">{Number(r.quotes_rejected)}</Badge> : <span className="text-faint">—</span>) },
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
          <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-4 xl:grid-cols-6">
            <Stat label="Esperado" value={num(totals.expected)} />
            <Stat label="Reportado" value={num(totals.reported)} />
            <Stat label="Confirmado" value={num(totals.confirmed)} />
            <Stat label="Por confirmar" value={num(totals.awaiting)} />
            <Stat label="En disputa" value={num(totals.disputed)} tone={totals.disputed ? 'error' : undefined} />
            <Stat label="Comisión generada" value={num(totals.generated)} />
            <Stat label="Recuperada" value={num(totals.recovered)} />
            <Stat label="Pendiente" value={num(totals.pending)} tone={totals.pending ? 'warning' : undefined} />
            <Stat label="Tarifa base acreditada" value={num(totals.baseCredited)} />
            <Stat label="Recargo de horario acreditado" value={num(totals.scheduleCredited)} />
            <Stat label="Cotizaciones rechazadas" value={String(totals.rejected)} tone={totals.rejected ? 'warning' : undefined} />
          </div>
          <DataTable
            rows={rows ?? []}
            rowKey={r => r.technician_id}
            columns={cols}
            loading={rows === undefined}
            onRowClick={r => router.push(`/tecnicos/${r.technician_id}`)}
            initialSort={{ key: 'pen', dir: 'desc' }}
            pageSize={8}
            minWidth={1380}
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
    { key: 'visit', header: 'Visita', align: 'right', sortValue: r => Number(r.base_fee_cents), render: r => <span className="font-mono text-[12.5px] tabular">{r.payment_model === 'base_cash' ? money(Number(r.base_fee_cents)) : '—'}</span> },
    {
      key: 'sched',
      header: 'Recargo de horario',
      align: 'right',
      sortValue: r => Number(r.schedule_surcharge_cents),
      render: r =>
        Number(r.schedule_surcharge_cents) > 0 ? (
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-mono text-[12.5px] tabular">{money(Number(r.schedule_surcharge_cents))}</span>
            {r.schedule_rule_name && <Badge tone="info">{r.schedule_rule_name}</Badge>}
          </div>
        ) : (
          <span className="text-faint">—</span>
        ),
    },
    { key: 'emer', header: 'Emergencia', align: 'right', sortValue: r => Number(r.emergency_surcharge_cents), render: r => (Number(r.emergency_surcharge_cents) > 0 ? <span className="font-mono text-[12.5px] tabular">{money(Number(r.emergency_surcharge_cents))}</span> : <span className="text-faint">—</span>) },
    {
      key: 'base',
      header: 'Total base · Tarjeta',
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
      header: 'Cotización',
      align: 'right',
      sortValue: r => Number(r.quote_total_cents ?? 0),
      render: r => (
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-mono text-[12.5px] font-semibold text-navy tabular">
            {r.quote_total_cents == null || Number(r.quote_total_cents) === 0 ? '—' : money(Number(r.quote_total_cents))}
          </span>
          {r.quote_status !== 'none' ? (
            <Badge tone={QUOTE_STATUS[r.quote_status as QuoteStatus]?.tone ?? 'neutral'}>{quoteStatusLabel(r.quote_status)}</Badge>
          ) : (
            <span className="font-sans text-[11.5px] text-muted">{methodName(r.quote_method)}</span>
          )}
          {r.closed_by_quote_rejection && <Badge tone="warning">Cerrado por rechazo</Badge>}
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
            minWidth={1320}
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
