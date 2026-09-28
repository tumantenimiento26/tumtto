'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ban, Download, Eye, Pencil, RotateCcw, Search, UserPlus } from 'lucide-react';
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
  Segmented,
  Select,
  Tabs,
  snackbar,
  toast,
  type DataColumn,
} from '@/components/ds';
import {
  getAddresses,
  getAllDisputes,
  getAllRequests,
  getClients,
  loadWorld,
  reactivateUser,
  suspendUser,
  useTick,
  useWorldFailed,
  useWorldReady,
} from '@/lib/data/store';
import { formatPhone } from '@/lib/phone';
import {
  EMPTY_CLIENT_FILTERS,
  SPEND_BUCKETS,
  clientTabCounts,
  filterClients,
  toCsv,
  type ClientFilters,
  type ClientRow,
  type ClientSort,
  type ClientTab,
} from '@/lib/serviciosFilter';
import {
  Avatar,
  ZONES,
  downloadCsv,
  money,
  timeAgo,
} from '../servicios/_components/shared';
import { ClientFormSheet } from './_components/ClientFormSheet';

const TABS: { value: ClientTab; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'activos', label: 'Activos' },
  { value: 'recurrentes', label: 'Recurrentes' },
  { value: 'suspendidos', label: 'Suspendidos' },
];

const SORTS: { value: ClientSort; label: string }[] = [
  { value: 'reciente', label: 'Más recientes' },
  { value: 'gasto', label: 'Mayor gasto' },
  { value: 'servicios', label: 'Más servicios' },
  { value: 'nombre', label: 'Nombre A–Z' },
];

export default function ClientesPage() {
  const tick = useTick();
  const router = useRouter();
  const ready = useWorldReady();
  const failed = useWorldFailed();
  const [f, setF] = useState<ClientFilters>(EMPTY_CLIENT_FILTERS);
  const [form, setForm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const rows = useMemo<ClientRow[]>(() => {
    const reqs = getAllRequests(); // ya viene del más reciente al más viejo
    const disputes = getAllDisputes();
    return getClients().map(p => {
      const mine = reqs.filter(r => r.client_id === p.id);
      const addr = getAddresses(p.id);
      return {
        id: p.id,
        name: p.full_name ?? 'Cliente',
        phone: formatPhone(p.phone) || '—',
        zone:
          addr.find(a => a.is_default)?.municipality ??
          mine[0]?.municipality ??
          addr[0]?.municipality ??
          '—',
        services: mine.length,
        gmvCents: mine.reduce((s, r) => s + (r.quoted_total_cents ?? 0), 0),
        lastAt: mine[0]?.created_at ?? null,
        suspended: p.status === 'suspended',
        disputes: disputes.filter(d => d.opened_by === p.id).length,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const visible = useMemo(() => filterClients(rows, f), [rows, f]);
  const counts = useMemo(() => clientTabCounts(rows), [rows]);
  const recurrentPct = rows.length
    ? Math.round((counts.recurrentes / rows.length) * 100)
    : 0;

  async function toggleSuspend(r: ClientRow) {
    if (r.suspended) {
      const ok = await reactivateUser(r.id);
      if (ok !== null) toast.success('Cuenta reactivada', r.name);
      return;
    }
    const ok = await suspendUser(r.id);
    if (ok === null) return;
    // Suspender es reversible: "Deshacer" reactiva de verdad.
    snackbar.show(`${r.name} suspendido`, {
      undo: () => {
        void reactivateUser(r.id).then(x => {
          if (x !== null) toast.success('Suspensión revertida', r.name);
        });
      },
    });
  }

  function exportRows(list: ClientRow[]) {
    downloadCsv(
      'clientes.csv',
      toCsv(
        list.map(r => ({
          ID: r.id,
          Nombre: r.name,
          Teléfono: r.phone,
          Zona: r.zone,
          Servicios: r.services,
          'Gasto total': r.gmvCents / 100,
          'Último servicio': r.lastAt ?? '',
          Estado: r.suspended ? 'Suspendido' : 'Activo',
          Disputas: r.disputes,
        })),
      ),
    );
    toast.success('CSV exportado', `${list.length} clientes`);
  }

  const columns: DataColumn<ClientRow>[] = [
    {
      key: 'cliente',
      header: 'Cliente',
      sortValue: r => r.name,
      render: r => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={r.name} size={36} />
          <div className="min-w-0">
            <div className="truncate font-display text-[14px] font-bold text-navy">
              {r.name}
            </div>
            {r.disputes > 0 && (
              <span className="text-[11.5px] font-semibold text-error">
                {r.disputes} disputa{r.disputes === 1 ? '' : 's'}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'telefono',
      header: 'Teléfono',
      render: r => (
        <span className="whitespace-nowrap font-mono text-[12.5px] text-body">
          {r.phone}
        </span>
      ),
    },
    {
      key: 'zona',
      header: 'Zona',
      sortValue: r => r.zone,
      render: r => <span className="text-[13.5px] text-muted">{r.zone}</span>,
    },
    {
      key: 'servicios',
      header: 'Servicios',
      align: 'right',
      sortValue: r => r.services,
      render: r => (
        <span className="font-mono text-[13px] text-navy tabular">
          {r.services}
        </span>
      ),
    },
    {
      key: 'gasto',
      header: 'Gasto total',
      align: 'right',
      sortValue: r => r.gmvCents,
      render: r => (
        <span className="font-mono text-[13px] font-semibold text-navy tabular">
          {money(r.gmvCents)}
        </span>
      ),
    },
    {
      key: 'ultimo',
      header: 'Último',
      sortValue: r => r.lastAt,
      render: r => (
        <span className="whitespace-nowrap text-[12.5px] text-muted">
          {timeAgo(r.lastAt)}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: r =>
        r.suspended ? (
          <Badge tone="danger" dot>
            Suspendido
          </Badge>
        ) : (
          <Badge tone="success" dot>
            Activo
          </Badge>
        ),
    },
  ];

  if (failed)
    return (
      <ErrorPage
        kind="500"
        primary={{ label: 'Reintentar', onClick: () => void loadWorld(true) }}
      />
    );
  if (!ready) return <ScreenSkeleton kind="list" />;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Clientes"
        description={`${rows.length.toLocaleString('es-MX')} cuentas registradas · ${recurrentPct}% recurrentes`}
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
            <Button icon={UserPlus} onClick={() => setForm({ open: true, id: null })}>
              Nuevo cliente
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line px-5">
          <Tabs
            className="border-b-0"
            tabs={TABS.map(t => ({ ...t, count: counts[t.value] }))}
            value={f.tab}
            onChange={tab => setF(s => ({ ...s, tab }))}
          />
          <Input
            icon={Search}
            value={f.query}
            onChange={e => setF(s => ({ ...s, query: e.target.value }))}
            placeholder="Nombre o teléfono"
            aria-label="Buscar clientes"
            wrapperClassName="mb-2.5 w-full sm:w-[300px]"
          />
        </div>

        <div className="flex flex-col gap-3 border-b border-line px-5 py-4">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Zona">
            {ZONES.map(z => (
              <Chip
                key={z}
                active={f.zones.includes(z)}
                onClick={() =>
                  setF(s => ({
                    ...s,
                    zones: s.zones.includes(z)
                      ? s.zones.filter(x => x !== z)
                      : [...s.zones, z],
                  }))
                }
              >
                {z}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              Gasto
            </span>
            <Segmented
              size="sm"
              options={SPEND_BUCKETS}
              value={f.spend}
              onChange={spend => setF(s => ({ ...s, spend }))}
            />
            <div className="ml-auto flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                Orden
              </span>
              <div className="w-[190px]">
                <Select
                  aria-label="Ordenar clientes"
                  options={SORTS}
                  value={f.sort}
                  onChange={sort => setF(s => ({ ...s, sort }))}
                  searchable={false}
                />
              </div>
            </div>
          </div>
        </div>

        <DataTable
          rows={visible}
          columns={columns}
          rowKey={r => r.id}
          onRowClick={r => router.push(`/clientes/${r.id}`)}
          selectable
          pageSize={8}
          minWidth={900}
          bulkActions={selected => (
            <Button
              size="sm"
              variant="secondary"
              icon={Download}
              onClick={() => exportRows(selected)}
            >
              Exportar
            </Button>
          )}
          rowMenu={r => [
            {
              label: 'Ver perfil',
              icon: Eye,
              onSelect: () => router.push(`/clientes/${r.id}`),
            },
            {
              label: 'Editar',
              icon: Pencil,
              onSelect: () => setForm({ open: true, id: r.id }),
            },
            'divider',
            r.suspended
              ? {
                  label: 'Reactivar cuenta',
                  icon: RotateCcw,
                  onSelect: () => void toggleSuspend(r),
                }
              : {
                  label: 'Suspender cuenta',
                  icon: Ban,
                  destructive: true,
                  onSelect: () => void toggleSuspend(r),
                },
          ]}
          empty={
            rows.length === 0 ? (
              <EmptyState
                kind="first-use"
                title="Aún no hay clientes"
                description="Los clientes aparecen aquí al crear su cuenta en la app."
              />
            ) : (
              <EmptyState
                kind="no-results"
                title="Sin resultados"
                description="Ningún cliente coincide con la búsqueda y los filtros."
                action={
                  <Button variant="secondary" onClick={() => setF(EMPTY_CLIENT_FILTERS)}>
                    Quitar filtros
                  </Button>
                }
              />
            )
          }
        />
      </Card>

      <ClientFormSheet
        open={form.open}
        clientId={form.id}
        onClose={() => setForm({ open: false, id: null })}
      />
    </div>
  );
}
