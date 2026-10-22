'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet } from 'lucide-react';
import {
  Badge,
  DataTable,
  EmptyState,
  ErrorPage,
  PageHeader,
  ScreenSkeleton,
  type DataColumn,
} from '@/components/ds';
import { UserIcon } from '@/components/user-avatar';
import { fetchTechnicianBalances } from '@/lib/data/settlementsStore';
import { useWorldFailed, useWorldReady } from '@/lib/data/store';
import { fmtDate } from '@/lib/dates';
import { TECH_TYPE_LABEL, TECH_TYPE_TONE } from '@/lib/techType';
import { balanceTotals, money, sortBalances, type BalanceRow } from '@/lib/settlements';
import { NetValue, Tile } from './_components/parts';

const day = (iso: string | null) => (iso ? fmtDate(iso, { day: '2-digit', month: 'short' }) : '—');

export default function LiquidacionesPage() {
  const ready = useWorldReady();
  const failed = useWorldFailed();
  const router = useRouter();
  const [rows, setRows] = useState<BalanceRow[] | null | undefined>(undefined);

  useEffect(() => {
    if (!ready) return;
    void fetchTechnicianBalances().then(r => setRows(r ? sortBalances(r) : null));
  }, [ready]);

  const totals = useMemo(() => balanceTotals(rows ?? []), [rows]);

  if (failed || rows === null) return <ErrorPage kind="500" primary={{ label: 'Reintentar', onClick: () => location.reload() }} />;
  if (!ready || rows === undefined) return <ScreenSkeleton kind="list" />;

  const cols: DataColumn<BalanceRow>[] = [
    {
      key: 'tech',
      header: 'Técnico',
      sortValue: r => r.technician_name,
      render: r => (
        <span className="flex items-center gap-3">
          <UserIcon userId={r.technician_id} size={36} decorative />
          <span className="font-sans text-[13.5px] font-semibold text-navy">{r.technician_name}</span>
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      hideOnMobile: true,
      sortValue: r => r.technician_type,
      render: r => <Badge tone={TECH_TYPE_TONE[r.technician_type]}>{TECH_TYPE_LABEL[r.technician_type]}</Badge>,
    },
    {
      key: 'owed',
      header: 'Le debemos',
      align: 'right',
      sortValue: r => r.owed_to_technician_cents,
      render: r => <span className="font-mono text-[13px] text-navy tabular">{money(r.owed_to_technician_cents)}</span>,
    },
    {
      key: 'cash',
      header: 'Debe entregar',
      align: 'right',
      sortValue: r => r.owed_to_admin_cents,
      render: r => <span className="font-mono text-[13px] text-navy tabular">{money(r.owed_to_admin_cents)}</span>,
    },
    {
      key: 'net',
      header: 'Neto',
      align: 'right',
      sortValue: r => Math.abs(r.net_cents),
      render: r => <NetValue cents={r.net_cents} />,
    },
    {
      key: 'last',
      header: 'Último movimiento',
      hideOnMobile: true,
      render: r => (
        <span className="font-sans text-[12px] text-muted">
          Pago: {day(r.last_payout_at)} · Efectivo: {day(r.last_delivery_at)}
        </span>
      ),
    },
    {
      key: 'pend',
      header: 'Pendientes',
      hideOnMobile: true,
      sortValue: r => r.pending_commissions_count + r.pending_cash_count,
      render: r => (
        <span className="font-sans text-[12.5px] text-body">
          {r.pending_commissions_count} comisiones · {r.pending_cash_count} efectivo
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Liquidaciones"
        description="Lo que Tu Mantenimiento le debe a cada técnico (comisiones) y el efectivo que cada técnico debe entregar. Solo registra pagos: no mueve dinero."
      />
      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Tile label="Total por pagar a técnicos" value={money(totals.owedToTechnicians)} help="Comisiones de servicios ya terminados" valueClass="text-primary" />
        <Tile label="Total efectivo por recibir" value={money(totals.owedToAdmin)} help="Cobrado en efectivo por los técnicos" valueClass="text-warning-ink" />
        <Tile
          label="Neto"
          value={money(Math.abs(totals.net))}
          help={totals.net > 0 ? 'Tu Mantenimiento debe más de lo que va a recibir' : totals.net < 0 ? 'Los técnicos deben más de lo que se les debe' : 'Todo parejo'}
        />
      </div>
      <DataTable
        rows={rows}
        columns={cols}
        rowKey={r => r.technician_id}
        onRowClick={r => router.push(`/liquidaciones/${r.technician_id}`)}
        pageSize={10}
        minWidth={900}
        mobileSort={false}
        empty={<EmptyState kind="all-clear" icon={Wallet} title="Sin saldos" description="Cuando un técnico termine servicios con comisión o cobre en efectivo aparecerá aquí." compact />}
      />
    </div>
  );
}
