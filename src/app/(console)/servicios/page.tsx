'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Ban,
  Copy,
  Download,
  Clock,
  Eye,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  UserCog,
  XCircle,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  Chip,
  DataTable,
  EmptyState,
  ErrorPage,
  Input,
  PageHeader,
  ScreenSkeleton,
  Tabs,
  snackbar,
  toast,
  type DataColumn,
  rangeLabel,
  QuickRange,
  isPreset,
} from '@/components/ds';
import {
  useTick,
  useWorldReady,
  useWorldFailed,
  loadWorld,
  getAllRequests,
  getAllPayments,
  getCategories,
  getProfile,
  getRequest,
  getUnassignedAlertMinutes,
  setStatus,
} from '@/lib/data/store';
import { orderCode } from '@/lib/orderCode';
import { emergencyPinRank, isEmergency } from '@/lib/emergency';
import {
  AGE_BUCKETS,
  ageLabel,
  ageTone,
  inUnassignedInbox,
  isAdminRequest,
  scheduleLabel,
  scheduleSurchargeLabel,
} from '@/lib/unassigned';

import {
  EMPTY_SERVICE_FILTERS,
  SERVICE_TABS,
  activeSheetFilters,
  filterServices,
  tabCounts,
  toCsv,
  type ServiceFilters,
  type ServiceRow,
} from '@/lib/serviciosFilter';
import {
  CategoryTile,
  METHOD_LABEL,
  STATUS,
  downloadCsv,
  money,
  timeAgo,
  useDeferredCommit,
} from './_components/shared';
import { ServiceFormSheet } from './_components/ServiceFormSheet';
import { ServiceFiltersSheet } from './_components/ServiceFiltersSheet';

const CANCELLABLE = new Set([
  'requested',
  'accepted',
  'enroute',
  'onsite',
  'quote',
  'working',
]);

export default function ServiciosPage() {
  const tick = useTick();
  const router = useRouter();
  const ready = useWorldReady();
  const failed = useWorldFailed();
  const [f, setF] = useState<ServiceFilters>(EMPTY_SERVICE_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [form, setForm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  // Servicios con cancelación pendiente (en espera de "Deshacer").
  const [pendingCancel, setPendingCancel] = useState<Set<string>>(new Set());
  const deferred = useDeferredCommit();

  const cats = useMemo(
    () => getCategories(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tick],
  );
  const rows: ServiceRow[] = useMemo(() => {
    const payByOrder = new Map(
      getAllPayments().map(p => [p.service_order_id, p]),
    );
    const catName = new Map(cats.map(c => [c.id, c.name]));
    return getAllRequests().map(r => ({
      id: r.id,
      status: r.status,
      is_disputed: r.is_disputed,
      is_emergency: isEmergency(r),
      needs_manual: inUnassignedInbox(r),
      is_admin_request: isAdminRequest(r),
      desiredAt: r.scheduled_for,
      desiredUntil: r.scheduled_until,
      scheduleBps: r.schedule_surcharge_bps,
      description: r.description,
      pin: emergencyPinRank(r),
      categoryId: r.category_id,
      categoryName: catName.get(r.category_id) ?? 'Servicio',
      clientName: getProfile(r.client_id)?.full_name ?? 'Cliente',
      techName: r.technician_id
        ? (getProfile(r.technician_id)?.full_name ?? null)
        : null,
      zone: r.municipality ?? '—',
      totalCents: r.quoted_total_cents,
      method: payByOrder.get(r.id)?.method ?? null,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, cats]);

  const visible = useMemo(
    () =>
      filterServices(rows, f).map(r =>
        pendingCancel.has(r.id) ? { ...r, status: 'cancelled' as const } : r,
      ),
    [rows, f, pendingCancel],
  );
  const counts = useMemo(() => tabCounts(rows, f), [rows, f]);
  const sheetCount = activeSheetFilters(f);
  const slugOf = (catId: string) =>
    cats.find(c => c.id === catId)?.slug ?? catId;

  function exportRows(list: ServiceRow[], name = 'servicios.csv') {
    downloadCsv(
      name,
      toCsv(
        list.map(r => ({
          Servicio: orderCode(r.id),
          ID: r.id,
          Cliente: r.clientName,
          Técnico: r.techName ?? '',
          Categoría: r.categoryName,
          Zona: r.zone,
          Estado: STATUS[r.status].label,
          Emergencia: r.is_emergency ? 'Sí' : 'No',
          Disputa: r.is_disputed ? 'Sí' : 'No',
          Método: r.method ? (METHOD_LABEL[r.method] ?? r.method) : '',
          Total: r.totalCents != null ? r.totalCents / 100 : '',
          Creado: r.createdAt,
          Actualizado: r.updatedAt,
        })),
      ),
    );
    toast.success('CSV exportado', `${list.length} servicios`);
  }

  /** Cancela con "Deshacer": la escritura ocurre al vencer el snackbar. */
  function cancelWithUndo(ids: string[]) {
    const target = ids.filter(id => {
      const o = getRequest(id);
      return o && CANCELLABLE.has(o.status);
    });
    if (!target.length) {
      toast.info('Nada que cancelar', 'Los servicios elegidos ya terminaron.');
      return;
    }
    setPendingCancel(s => new Set([...s, ...target]));
    const release = () =>
      setPendingCancel(s => {
        const n = new Set(s);
        target.forEach(id => n.delete(id));
        return n;
      });
    deferred(
      target.length === 1
        ? `${orderCode(target[0])} cancelado`
        : `${target.length} servicios cancelados`,
      async () => {
        let failedN = 0;
        for (const id of target) {
          const r = await setStatus(
            id,
            'cancelled',
            'Cancelado por admin desde la consola',
          );
          if (r === null) failedN++;
        }
        release();
        if (failedN)
          toast.error(
            `No se cancelaron ${failedN} de ${target.length}`,
            'Revisa su estado en el detalle.',
          );
      },
      release,
    );
  }

  function clearSheetFilters() {
    const prev = f;
    setF(s => ({
      ...s,
      categoryId: null,
      range: null,
      zones: [],
      method: null,
      minPesos: null,
      maxPesos: null,
      emergencyOnly: false,
      disputeOnly: false,
      age: 'all',
      desiredRange: null,
    }));
    setFiltersOpen(false);
    if (activeSheetFilters(prev))
      snackbar.show('Filtros limpiados', { undo: () => setF(prev) });
  }

  const inbox = f.tab === 'sin_asignar';
  const alertMin = getUnassignedAlertMinutes();

  const columns: DataColumn<ServiceRow>[] = [
    {
      key: 'servicio',
      header: 'Servicio',
      sortValue: r => r.createdAt,
      render: r => (
        <div className="flex flex-col items-start gap-1">
          <span className="font-mono text-[12.5px] font-medium text-primary">
            {orderCode(r.id)}
          </span>
          {r.is_emergency && (
            <Badge tone="danger" mono>
              Emergencia
            </Badge>
          )}
          {r.is_admin_request && (
            <Badge tone="info" mono>
              Tumtto asigna
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'cliente',
      header: 'Cliente',
      sortValue: r => r.clientName,
      render: r => (
        <div className="flex min-w-0 items-center gap-2.5">
          <CategoryTile slug={slugOf(r.categoryId)} size={30} />
          <div className="min-w-0">
            <div className="truncate font-display text-[13.5px] font-bold text-navy">
              {r.clientName}
            </div>
            <div className="truncate text-[12px] text-muted">
              {r.categoryName}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'tecnico',
      header: 'Técnico',
      render: r =>
        r.techName ? (
          <span className="text-[13.5px] text-body">{r.techName}</span>
        ) : r.needs_manual ? (
          <Link
            href={`/servicios/${r.id}?asignar=1`}
            onClick={e => e.stopPropagation()}
            className="inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-btn border border-error-line bg-error-soft px-2.5 py-1 text-[12.5px] font-semibold text-error hover:brightness-95 max-[640px]:whitespace-normal max-[640px]:text-left"
          >
            <AlertTriangle size={13} aria-hidden />
            {inbox ? 'Asignar' : 'Sin técnico — asignar'}
          </Link>
        ) : (
          <span className="text-[13.5px] text-faint">Sin asignar</span>
        ),
    },
    {
      key: 'zona',
      header: 'Zona',
      render: r => <span className="text-[13.5px] text-muted">{r.zone}</span>,
    },
    {
      key: 'estado',
      header: 'Estado',
      render: r => (
        <span className="flex flex-wrap items-center gap-1.5">
          <Badge tone={STATUS[r.status].tone} dot>
            {STATUS[r.status].label}
          </Badge>
          {r.is_disputed && <Badge tone="danger">Disputa</Badge>}
        </span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      sortValue: r => r.totalCents,
      render: r => (
        <span className="font-mono text-[13px] font-semibold text-navy tabular">
          {money(r.totalCents)}
        </span>
      ),
    },
    {
      key: 'actualizado',
      header: 'Actualizado',
      sortValue: r => r.updatedAt,
      render: r => (
        <span className="whitespace-nowrap text-[12.5px] text-muted">
          {timeAgo(r.updatedAt)}
        </span>
      ),
    },
  ];

  const inboxColumns: DataColumn<ServiceRow>[] = [
    {
      key: 'antiguedad',
      header: 'Antigüedad',
      sortValue: r => r.createdAt,
      render: r => {
        const tone = ageTone(r.createdAt, alertMin);
        return (
          <span
            className={`inline-flex items-center gap-1 whitespace-nowrap font-mono text-[12.5px] font-semibold ${
              tone === 'danger' ? 'text-error' : tone === 'warning' ? 'text-warning' : 'text-muted'
            }`}
          >
            <Clock size={13} aria-hidden />
            {ageLabel(r.createdAt)}
          </span>
        );
      },
    },
    {
      key: 'deseada',
      header: 'Fecha deseada',
      sortValue: r => r.desiredAt ?? '',
      render: r => {
        const label = scheduleLabel(r.desiredAt, r.desiredUntil);
        const sur = scheduleSurchargeLabel(r.scheduleBps);
        return label ? (
          <span className="flex flex-col items-start gap-0.5 text-[12.5px] text-body">
            <span>{label}</span>
            {sur && <Badge tone="warning" mono>{`Horario ${sur}`}</Badge>}
          </span>
        ) : (
          <span className="text-[12.5px] text-faint">Lo antes posible</span>
        );
      },
    },
  ];
  const shownColumns = inbox
    ? [
        ...columns.filter(c => ['servicio', 'cliente', 'zona'].includes(c.key)),
        ...inboxColumns,
        columns.find(c => c.key === 'tecnico')!,
      ]
    : columns;

  if (failed)
    return (
      <ErrorPage
        kind="500"
        primary={{ label: 'Reintentar', onClick: () => void loadWorld(true) }}
      />
    );
  if (!ready) return <ScreenSkeleton kind="list" />;

  const activeChips: { key: string; label: string; remove: () => void }[] = [
    ...(f.categoryId
      ? [
          {
            key: 'cat',
            label: cats.find(c => c.id === f.categoryId)?.name ?? 'Categoría',
            remove: () => setF(s => ({ ...s, categoryId: null })),
          },
        ]
      : []),
    // Los rápidos (7/30/90) ya se ven activos en la barra; el chip es para rangos libres.
    ...(f.range && !(['7d', '30d', '90d'] as const).some(k => isPreset(f.range, k))
      ? [
          {
            key: 'range',
            label: rangeLabel(f.range),
            remove: () => setF(s => ({ ...s, range: null })),
          },
        ]
      : []),
    ...f.zones.map(z => ({
      key: `z-${z}`,
      label: z,
      remove: () => setF(s => ({ ...s, zones: s.zones.filter(x => x !== z) })),
    })),
    ...(f.method
      ? [
          {
            key: 'm',
            label: METHOD_LABEL[f.method] ?? f.method,
            remove: () => setF(s => ({ ...s, method: null })),
          },
        ]
      : []),
    ...(f.minPesos != null || f.maxPesos != null
      ? [
          {
            key: 'amt',
            label: `${f.minPesos != null ? `$${f.minPesos.toLocaleString('es-MX')}` : '$0'} – ${f.maxPesos != null ? `$${f.maxPesos.toLocaleString('es-MX')}` : 'sin límite'}`,
            remove: () => setF(s => ({ ...s, minPesos: null, maxPesos: null })),
          },
        ]
      : []),
    ...(f.age !== 'all'
      ? [
          {
            key: 'age',
            label: `Antigüedad ${AGE_BUCKETS.find(b => b.value === f.age)?.label ?? ''}`,
            remove: () => setF(s => ({ ...s, age: 'all' as const })),
          },
        ]
      : []),
    ...(f.desiredRange
      ? [
          {
            key: 'desired',
            label: `Cita ${rangeLabel(f.desiredRange)}`,
            remove: () => setF(s => ({ ...s, desiredRange: null })),
          },
        ]
      : []),
    ...(f.emergencyOnly
      ? [
          {
            key: 'u',
            label: 'Emergencias',
            remove: () => setF(s => ({ ...s, emergencyOnly: false })),
          },
        ]
      : []),
    ...(f.disputeOnly
      ? [
          {
            key: 'd',
            label: 'Con disputa',
            remove: () => setF(s => ({ ...s, disputeOnly: false })),
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Servicios"
        description="Cada orden, de la solicitud al pago. Toca una fila para ver su detalle."
        actions={
          <>
            <Button
              variant="secondary"
              icon={Download}
              onClick={() => exportRows(visible)}
              disabled={!visible.length}
            >
              Exportar
            </Button>
            <Button icon={Plus} onClick={() => setForm({ open: true, id: null })}>
              Crear servicio
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        <Tabs
          className="px-5"
          tabs={SERVICE_TABS.map(t => ({ ...t, count: counts[t.value] }))}
          value={f.tab}
          onChange={tab => setF(s => ({ ...s, tab }))}
        />

        <div className="flex flex-col gap-3 border-b border-line px-5 py-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <Input
              icon={Search}
              value={f.query}
              onChange={e => setF(s => ({ ...s, query: e.target.value }))}
              placeholder="ID, cliente, técnico o zona"
              aria-label="Buscar servicios"
              wrapperClassName="min-w-[220px] flex-1 sm:max-w-[360px]"
            />
            <QuickRange value={f.range} onChange={range => setF(s => ({ ...s, range }))} />
            <Button
              variant="secondary"
              icon={SlidersHorizontal}
              onClick={() => setFiltersOpen(true)}
            >
              Filtros
              {sheetCount > 0 && (
                <span className="ml-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 font-mono text-[11px] text-white">
                  {sheetCount}
                </span>
              )}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {activeChips.map(c => (
              <Chip key={c.key} active onRemove={c.remove}>
                {c.label}
              </Chip>
            ))}
            <span className="ml-auto font-mono text-[12px] text-muted">
              {visible.length} resultado{visible.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        <DataTable
          rows={visible}
          key={inbox ? 'inbox' : 'all'}
          columns={shownColumns}
          rowKey={r => r.id}
          onRowClick={r => router.push(`/servicios/${r.id}`)}
          selectable
          initialSort={inbox ? { key: 'antiguedad', dir: 'asc' } : { key: 'actualizado', dir: 'desc' }}
          pinRank={r => r.pin}
          pageSize={8}
          minWidth={inbox ? 800 : 980}
          bulkActions={(selected, clear) => (
            <>
              <Button
                size="sm"
                variant="secondary"
                icon={Download}
                onClick={() => exportRows(selected, 'servicios-seleccion.csv')}
              >
                Exportar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                icon={Ban}
                onClick={() => {
                  cancelWithUndo(selected.map(r => r.id));
                  clear();
                }}
              >
                Cancelar
              </Button>
            </>
          )}
          rowMenu={r => [
            {
              label: 'Ver detalle',
              icon: Eye,
              onSelect: () => router.push(`/servicios/${r.id}`),
            },
            ...(r.needs_manual
              ? [
                  {
                    label: 'Asignar técnico',
                    icon: UserCog,
                    onSelect: () => router.push(`/servicios/${r.id}?asignar=1`),
                  },
                  ...(r.is_admin_request
                    ? [
                        {
                          label: 'Rechazar solicitud',
                          icon: XCircle,
                          destructive: true,
                          onSelect: () => router.push(`/servicios/${r.id}?rechazar=1`),
                        },
                      ]
                    : []),
                ]
              : []),
            {
              label: 'Editar',
              icon: Pencil,
              onSelect: () => setForm({ open: true, id: r.id }),
            },
            {
              label: 'Copiar ID',
              icon: Copy,
              onSelect: () => {
                void navigator.clipboard.writeText(r.id).then(
                  () => toast.success('ID copiado', orderCode(r.id)),
                  () => toast.error('No se pudo copiar el ID'),
                );
              },
            },
            'divider',
            {
              label: 'Cancelar servicio',
              icon: Ban,
              destructive: true,
              disabled: !CANCELLABLE.has(r.status),
              onSelect: () => cancelWithUndo([r.id]),
            },
          ]}
          empty={
            rows.length === 0 ? (
              <EmptyState
                kind="first-use"
                title="Aún no hay servicios"
                description="Cuando los clientes soliciten servicios aparecerán aquí."
                action={
                  <Button icon={Plus} onClick={() => setForm({ open: true, id: null })}>
                    Crear servicio
                  </Button>
                }
              />
            ) : inbox && counts.sin_asignar === 0 ? (
              <EmptyState
                kind="no-results"
                title="Nada por asignar"
                description="Todas las solicitudes tienen técnico o ya fueron atendidas."
              />
            ) : (
              <EmptyState
                kind="no-results"
                title="Sin resultados"
                description="Ningún servicio coincide con la búsqueda y los filtros."
                action={
                  <Button
                    variant="secondary"
                    onClick={() => setF(EMPTY_SERVICE_FILTERS)}
                  >
                    Quitar filtros
                  </Button>
                }
              />
            )
          }
        />
      </Card>

      <ServiceFiltersSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={f}
        onApply={v => setF(s => ({ ...s, ...v }))}
        onClear={clearSheetFilters}
        resultCount={d => filterServices(rows, { ...f, ...d }).length}
        categories={cats}
        inbox={inbox}
      />

      <ServiceFormSheet
        open={form.open}
        order={form.id ? getRequest(form.id) : null}
        onClose={() => setForm({ open: false, id: null })}
        onCreated={id => router.push(`/servicios/${id}`)}
      />
    </div>
  );
}
