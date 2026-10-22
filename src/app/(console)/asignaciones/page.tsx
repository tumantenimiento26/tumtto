'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, Eye, Hourglass, UserCog } from 'lucide-react';
import {
  Badge,
  Card,
  DataTable,
  EmptyState,
  ErrorPage,
  PageHeader,
  ScreenSkeleton,
  Tabs,
  type DataColumn,
} from '@/components/ds';
import { useAuth } from '@/lib/auth';
import {
  getUnassignedAlertMinutes,
  useTick,
  useWorldFailed,
  useWorldReady,
} from '@/lib/data/store';
import { loadAssignments, useAssignments } from '@/lib/data/assignmentsStore';
import {
  ASSIGNMENT_TABS,
  assignmentCounts,
  confirmationLabel,
  confirmationState,
  filterAssignments,
  isPending,
  minutesLabel,
  rowWaitTone,
  waitingMinutes,
  type AssignmentRow,
  type AssignmentTab,
} from '@/lib/assignments';
import { scheduleLabel } from '@/lib/unassigned';
import { orderCode } from '@/lib/orderCode';
import { CategoryTile } from '../servicios/_components/shared';

const EMPTY: Record<AssignmentTab, { title: string; description: string }> = {
  pendientes: {
    title: 'Nada por asignar',
    description:
      'Cuando un cliente pida que Tumtto asigne al técnico, la solicitud aparecerá aquí.',
  },
  asignadas: {
    title: 'Sin asignaciones por confirmar',
    description: 'Todos los técnicos asignados ya confirmaron «Enterado».',
  },
  confirmadas: {
    title: 'Aún no hay confirmaciones',
    description: 'Aquí verás las asignaciones que el técnico ya confirmó.',
  },
  todas: {
    title: 'Aún no hay asignaciones',
    description:
      'Las solicitudes «Que Tumtto asigne al técnico» aparecerán aquí.',
  },
};

export default function AsignacionesPage() {
  useTick();
  const router = useRouter();
  const ready = useWorldReady();
  const failed = useWorldFailed();
  const { canEdit } = useAuth();
  const canAssign = canEdit('servicios');
  const { rows, loaded, failed: listFailed } = useAssignments();
  const [tab, setTab] = useState<AssignmentTab>('pendientes');
  // Reloj para que «tiempo esperando» avance sin recargar (cada minuto).
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    void loadAssignments(true);
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const counts = useMemo(() => assignmentCounts(rows), [rows]);
  const visible = useMemo(() => filterAssignments(rows, tab), [rows, tab]);
  const alertMin = getUnassignedAlertMinutes();

  const columns: DataColumn<AssignmentRow>[] = [
    {
      key: 'folio',
      header: 'Folio',
      sortValue: r => r.created_at,
      render: r => (
        <span className="whitespace-nowrap font-mono text-[12.5px] font-medium text-primary">
          {orderCode(r.id)}
        </span>
      ),
    },
    {
      key: 'tipo',
      header: 'Tipo de servicio',
      sortValue: r => r.category?.name ?? '',
      render: r => (
        <div className="flex min-w-0 items-center gap-2.5">
          <CategoryTile slug={r.category?.slug} size={30} />
          <span className="truncate text-[13.5px] font-semibold text-navy">
            {r.category?.name ?? 'Servicio'}
          </span>
        </div>
      ),
    },
    {
      key: 'cliente',
      header: 'Cliente',
      sortValue: r => r.client?.name ?? '',
      render: r => (
        <span className="block truncate font-display text-[13.5px] font-bold text-navy">
          {r.client?.name ?? 'Cliente'}
        </span>
      ),
    },
    {
      key: 'zona',
      header: 'Zona',
      sortValue: r => r.zone?.name ?? '',
      render: r => (
        <span className="block truncate text-[13.5px] text-muted">
          {r.zone?.name || 'Sin zona'}
        </span>
      ),
    },
    {
      key: 'deseada',
      header: 'Fecha deseada',
      sortValue: r => r.scheduled_for ?? '',
      render: r => {
        const label = scheduleLabel(r.scheduled_for, r.scheduled_until);
        return label ? (
          <span className="text-[12.5px] text-body">{label}</span>
        ) : (
          <span className="text-[12.5px] text-faint">Lo antes posible</span>
        );
      },
    },
    {
      key: 'espera',
      header: 'Tiempo esperando',
      sortValue: r => waitingMinutes(r, now),
      render: r => {
        const tone = rowWaitTone(r, alertMin, now);
        return (
          <span
            className={`inline-flex items-center gap-1 whitespace-nowrap font-mono text-[12.5px] font-semibold ${
              tone === 'danger'
                ? 'text-error'
                : tone === 'warning'
                  ? 'text-warning'
                  : 'text-muted'
            }`}
          >
            <Clock size={13} aria-hidden />
            {minutesLabel(waitingMinutes(r, now))}
          </span>
        );
      },
    },
    {
      key: 'tecnico',
      header: 'Técnico',
      render: r =>
        r.technician ? (
          <span className="text-[13.5px] text-body">{r.technician.name}</span>
        ) : isPending(r) && canAssign ? (
          <Link
            href={`/servicios/${r.id}?asignar=1`}
            onClick={e => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-btn border border-error-line bg-error-soft px-2.5 py-1 text-[12.5px] font-semibold text-error hover:brightness-95"
          >
            <UserCog size={13} aria-hidden />
            Asignar técnico
          </Link>
        ) : (
          <span className="text-[13.5px] text-faint">Sin asignar</span>
        ),
    },
    {
      key: 'confirmacion',
      header: 'Confirmación',
      render: r => {
        const s = confirmationState(r);
        if (s === 'none')
          return <span className="text-[12.5px] text-faint">—</span>;
        return (
          <Badge tone={s === 'confirmed' ? 'success' : 'warning'} dot>
            {s === 'confirmed' ? (
              <CheckCircle2 size={12} aria-hidden />
            ) : (
              <Hourglass size={12} aria-hidden />
            )}
            {confirmationLabel(r, now)}
          </Badge>
        );
      },
    },
  ];

  if (failed || listFailed)
    return (
      <ErrorPage
        kind="500"
        primary={{
          label: 'Reintentar',
          onClick: () => void loadAssignments(true),
        }}
      />
    );
  if (!ready || !loaded) return <ScreenSkeleton kind="list" />;

  return (
    <div>
      <PageHeader
        title="Asignaciones"
        description="Solicitudes donde el cliente pidió que Tumtto asigne al técnico, y su confirmación."
      />
      <Card>
        <div className="px-5 pt-2">
          <Tabs
            tabs={ASSIGNMENT_TABS.map(t => ({ ...t, count: counts[t.value] }))}
            value={tab}
            onChange={setTab}
          />
        </div>
        <DataTable
          rows={visible}
          key={tab}
          // En Pendientes aún no hay técnico que confirme.
          columns={
            tab === 'pendientes'
              ? columns.filter(c => c.key !== 'confirmacion')
              : columns
          }
          rowKey={r => r.id}
          onRowClick={r => router.push(`/servicios/${r.id}`)}
          initialSort={
            tab === 'pendientes' ? { key: 'espera', dir: 'desc' } : undefined
          }
          pageSize={10}
          minWidth={980}
          rowMenu={r => [
            {
              label: 'Ver detalle',
              icon: Eye,
              onSelect: () => router.push(`/servicios/${r.id}`),
            },
            ...(isPending(r) && canAssign
              ? [
                  {
                    label: 'Asignar técnico',
                    icon: UserCog,
                    onSelect: () => router.push(`/servicios/${r.id}?asignar=1`),
                  },
                ]
              : []),
          ]}
          empty={<EmptyState kind="no-results" {...EMPTY[tab]} />}
        />
      </Card>
    </div>
  );
}
