'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ban, Download, Eye, Pencil, Plus, RotateCcw, Search, SlidersHorizontal, UserPlus } from 'lucide-react';
import {
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
  toast,
  type DataColumn,
} from '@/components/ds';
import { useAuth } from '@/lib/auth';
import {
  getAssignableTechnicians,
  getCategories,
  loadExtras,
  loadWorld,
  personName,
  useExtras,
  useTick,
  useWorldFailed,
  useWorldReady,
} from '@/lib/data/store';
import {
  EMPTY_INVENTORY_FILTERS,
  GENERAL,
  STATUS_META,
  activeDrawerFilters,
  buildToolRows,
  filterTools,
  heldLabel,
  daysHeld,
  inventoryCsv,
  shortDate,
  toolActions,
  type InventoryFilters,
  type ToolRow,
} from '@/lib/inventory';
import { downloadCsv } from '../servicios/_components/shared';
import { NO_PERMISSION, StatusBadge, ToolThumb } from './_components/shared';
import { ToolFormSheet } from './_components/ToolFormSheet';
import { ToolFiltersSheet } from './_components/ToolFiltersSheet';
import { AssignToolModal, RetireToolModal, ReturnToolModal } from './_components/ToolActionModals';
import { ByTechnicianReport, OutstandingReport } from './_components/InventoryReports';

type Tab = 'herramientas' | 'por_tecnico' | 'pendientes';

export default function InventarioPage() {
  const tick = useTick();
  const router = useRouter();
  const ready = useWorldReady();
  const failed = useWorldFailed();
  const canEdit = useAuth().can('inventario');
  const tools = useExtras(s => s.companyTools);
  const assignments = useExtras(s => s.toolAssignments);
  const loaded = useExtras(s => s.loaded);
  const missing = useExtras(s => s.unavailable.companyTools || s.unavailable.toolAssignments);
  const [tab, setTab] = useState<Tab>('herramientas');
  const [f, setF] = useState<InventoryFilters>(EMPTY_INVENTORY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [form, setForm] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [assignId, setAssignId] = useState<string | null>(null);
  const [returnId, setReturnId] = useState<string | null>(null);
  const [retireId, setRetireId] = useState<string | null>(null);

  useEffect(() => {
    void loadExtras();
  }, []);

  const cats = useMemo(
    () => getCategories(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tick],
  );
  const catName = (id: string | null) => (id ? (cats.find(c => c.id === id)?.name ?? '—') : 'General');
  const rows = useMemo(
    () => buildToolRows(tools, assignments, personName),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tools, assignments, tick],
  );
  const visible = useMemo(() => filterTools(rows, f), [rows, f]);
  const drawerCount = activeDrawerFilters(f);
  const techs = getAssignableTechnicians();
  // Con un técnico filtrado que ya no es asignable (suspendido), igual se ofrece.
  const techOptions = useMemo(() => {
    const extra = rows
      .filter(r => r.techId && !techs.some(t => t.id === r.techId))
      .map(r => ({ id: r.techId!, name: r.techName ?? 'Técnico' }));
    return [...techs, ...extra.filter((e, i, a) => a.findIndex(x => x.id === e.id) === i)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, tick]);
  const lock = canEdit ? undefined : NO_PERMISSION;

  function exportRows(list: ToolRow[]) {
    downloadCsv(
      'inventario.csv',
      inventoryCsv(
        list.map(r => ({
          Herramienta: r.name,
          Marca: r.brand ?? '',
          Modelo: r.model ?? '',
          'Serie/código': r.serial,
          Categoría: catName(r.categoryId),
          Estado: STATUS_META[r.status].label,
          Técnico: r.techName ?? '',
          'Asignada desde': r.since ? r.since.slice(0, 10) : '',
          'Costo (MXN)': r.costCents == null ? '' : r.costCents / 100,
        })),
      ),
    );
    toast.success('CSV exportado', `${list.length} herramientas`);
  }

  const columns: DataColumn<ToolRow>[] = [
    {
      key: 'tool',
      header: 'Herramienta',
      sortValue: r => r.name,
      render: r => (
        <div className="flex min-w-0 items-center gap-3">
          <ToolThumb path={r.photoPath} size={40} />
          <div className="min-w-0">
            <div className="truncate font-display text-[13.5px] font-bold text-navy">{r.name}</div>
            <div className="truncate text-[12px] text-muted">{[r.brand, r.model].filter(Boolean).join(' ') || 'Sin marca'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Código',
      sortValue: r => r.serial,
      render: r => <span className="whitespace-nowrap font-mono text-[12.5px] text-body">{r.serial}</span>,
    },
    { key: 'cat', header: 'Categoría', sortValue: r => catName(r.categoryId), render: r => <span className="text-[13.5px] text-muted">{catName(r.categoryId)}</span> },
    { key: 'status', header: 'Estado', sortValue: r => r.status, render: r => <StatusBadge status={r.status} /> },
    {
      key: 'tech',
      header: 'Técnico',
      sortValue: r => r.techName ?? '',
      render: r => (r.techName ? <span className="block max-w-[170px] truncate text-[13.5px] text-body" title={r.techName}>{r.techName}</span> : <span className="text-[13.5px] text-faint">—</span>),
    },
    {
      key: 'since',
      header: 'Desde',
      sortValue: r => r.since,
      render: r =>
        r.since ? (
          <span className="whitespace-nowrap text-[12.5px] text-muted" title={shortDate(r.since)}>
            {shortDate(r.since)} · {heldLabel(daysHeld(r.since))}
          </span>
        ) : (
          <span className="text-[12.5px] text-faint">—</span>
        ),
    },
  ];

  if (failed) return <ErrorPage kind="500" primary={{ label: 'Reintentar', onClick: () => void loadWorld(true) }} />;
  if (!ready || !loaded) return <ScreenSkeleton kind="list" />;

  const chips: { key: string; label: string; remove: () => void }[] = [
    ...(f.status ? [{ key: 's', label: STATUS_META[f.status].label, remove: () => setF(s => ({ ...s, status: null })) }] : []),
    ...(f.categoryId
      ? [{ key: 'c', label: f.categoryId === GENERAL ? 'General' : catName(f.categoryId), remove: () => setF(s => ({ ...s, categoryId: null })) }]
      : []),
    ...(f.techId ? [{ key: 't', label: personName(f.techId) ?? 'Técnico', remove: () => setF(s => ({ ...s, techId: null })) }] : []),
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Inventario"
        description="Herramienta propia de Tu Mantenimiento: alta, asignación a técnicos, reparación y baja."
        actions={
          <>
            {tab === 'herramientas' && (
              <Button variant="secondary" icon={Download} onClick={() => exportRows(visible)} disabled={!visible.length}>
                Exportar
              </Button>
            )}
            <Button icon={Plus} disabled={!canEdit} title={lock} onClick={() => setForm({ open: true, id: null })}>
              Nueva herramienta
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        <Tabs
          className="px-5"
          tabs={[
            { value: 'herramientas', label: 'Herramientas', count: rows.length },
            { value: 'por_tecnico', label: 'Asignada por técnico' },
            { value: 'pendientes', label: 'Pendiente de devolución' },
          ]}
          value={tab}
          onChange={setTab}
        />

        {missing ? (
          <EmptyState kind="no-results" title="Inventario no disponible" description="Las tablas de inventario aún no existen en este entorno." />
        ) : tab === 'por_tecnico' ? (
          <ByTechnicianReport />
        ) : tab === 'pendientes' ? (
          <OutstandingReport />
        ) : (
          <>
            <div className="flex flex-col gap-3 border-b border-line px-5 py-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <Input
                  icon={Search}
                  value={f.query}
                  onChange={e => setF(s => ({ ...s, query: e.target.value }))}
                  placeholder="Nombre, código o marca"
                  aria-label="Buscar herramientas"
                  wrapperClassName="min-w-[220px] flex-1 sm:max-w-[360px]"
                />
                <Button variant="secondary" icon={SlidersHorizontal} onClick={() => setFiltersOpen(true)}>
                  Filtros
                  {drawerCount > 0 && (
                    <span className="ml-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 font-mono text-[11px] text-white">{drawerCount}</span>
                  )}
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                {chips.map(c => (
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
              columns={columns}
              rowKey={r => r.id}
              onRowClick={r => router.push(`/inventario/${r.id}`)}
              initialSort={{ key: 'tool', dir: 'asc' }}
              pageSize={8}
              minWidth={980}
              rowMenu={r => {
                const a = toolActions(r.status);
                return [
                  { label: 'Ver detalle', icon: Eye, onSelect: () => router.push(`/inventario/${r.id}`) },
                  { label: 'Editar', icon: Pencil, disabled: !canEdit || !a.edit, onSelect: () => setForm({ open: true, id: r.id }) },
                  { label: 'Asignar a técnico', icon: UserPlus, disabled: !canEdit || !a.assign, onSelect: () => setAssignId(r.id) },
                  { label: 'Registrar devolución', icon: RotateCcw, disabled: !canEdit || !a.return, onSelect: () => setReturnId(r.id) },
                  'divider',
                  { label: 'Dar de baja', icon: Ban, destructive: true, disabled: !canEdit || !a.retire, onSelect: () => setRetireId(r.id) },
                ];
              }}
              empty={
                rows.length === 0 ? (
                  <EmptyState
                    kind="first-use"
                    title="Aún no hay herramienta"
                    description="Da de alta la herramienta de la empresa para asignarla a tus técnicos."
                    action={
                      <Button icon={Plus} disabled={!canEdit} title={lock} onClick={() => setForm({ open: true, id: null })}>
                        Nueva herramienta
                      </Button>
                    }
                  />
                ) : (
                  <EmptyState
                    kind="no-results"
                    title="Sin resultados"
                    description="Ninguna herramienta coincide con la búsqueda y los filtros."
                    action={
                      <Button variant="secondary" onClick={() => setF(EMPTY_INVENTORY_FILTERS)}>
                        Quitar filtros
                      </Button>
                    }
                  />
                )
              }
            />
          </>
        )}
      </Card>

      <ToolFiltersSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={f}
        onApply={v => setF(s => ({ ...s, ...v }))}
        onClear={() => {
          setF(s => ({ ...s, categoryId: null, status: null, techId: null }));
          setFiltersOpen(false);
        }}
        resultCount={d => filterTools(rows, { ...f, ...d }).length}
        categories={cats}
        technicians={techOptions}
      />
      <ToolFormSheet
        open={form.open}
        tool={form.id ? (tools.find(t => t.id === form.id) ?? null) : null}
        onClose={() => setForm({ open: false, id: null })}
        onSaved={t => !form.id && router.push(`/inventario/${t.id}`)}
      />
      <AssignToolModal toolId={assignId} onClose={() => setAssignId(null)} />
      <ReturnToolModal toolId={returnId} onClose={() => setReturnId(null)} />
      <RetireToolModal toolId={retireId} onClose={() => setRetireId(null)} />
    </div>
  );
}
