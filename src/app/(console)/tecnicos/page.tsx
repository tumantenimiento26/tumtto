'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  Download,
  Eye,
  Check,
  X,
  Copy,
  Star,
} from 'lucide-react';
import {
  Badge,
  Button,
  Chip,
  DataTable,
  EmptyState,
  ErrorPage,
  Input,
  Modal,
  PageHeader,
  ScreenSkeleton,
  Segmented,
  Select,
  Sheet,
  Tabs,
  Card,
  Kicker,
  toast,
  type DataColumn,
} from '@/components/ds';
import { exportCsv } from '@/components/admin';
import { useAction } from '@/components/use-action';
import {
  getTechniciansWithProfile,
  getTechCategories,
  getCategories,
  getAllRequests,
  getCompanies,
  getCompany,
  getAllVehicles,
  getAllTechTools,
  getCatalogTool,
  getTechMunicipality,
  loadExtras,
  resolveKyc,
  rejectKyc,
  useExtras,
  useTick,
  useWorldReady,
  useWorldFailed,
  loadWorld,
} from '@/lib/data/store';
import { formatPhone } from '@/lib/phone';
import { TECH_TYPES, TECH_TYPE_LABEL, techTypeLabel, type TechType } from '@/lib/techType';
import { formatPlate, matchingPlates } from '@/lib/vehicles';
import { TechTypeBadge } from './_components/TechTypeParts';
import { ToolFilter } from './_components/ToolFilter';
import {
  KYC_GROUP_META,
  activeFilterCount,
  filterTechs,
  initials,
  kycGroup,
  type KycGroup,
  type TechListFilters,
} from '@/lib/techConsole';

interface Row {
  id: string;
  name: string;
  phone: string;
  cats: string[];
  zone: string;
  rating: number;
  reviews: number;
  jobs: number;
  available: boolean;
  kyc: KycGroup;
  type: TechType;
  companyId: string | null;
  plates: string[];
  toolIds: string[];
}

const DONE = new Set(['completed', 'paid', 'closed']);
const ORDER_OPTIONS = [
  { value: 'rating', label: 'Mejor rating' },
  { value: 'jobs', label: 'Más trabajos' },
  { value: 'name', label: 'Nombre A–Z' },
] as const;
type OrderKey = (typeof ORDER_OPTIONS)[number]['value'];

const EMPTY_FILTERS: TechListFilters = {
  tab: 'all',
  q: '',
  category: null,
  zones: [],
  minRating: 0,
  availability: 'all',
  type: null,
  companyId: null,
  tools: [],
};

export default function TecnicosPage() {
  const tick = useTick();
  const extras = useExtras();
  const router = useRouter();
  const ready = useWorldReady();
  const failed = useWorldFailed();
  const { busy, run } = useAction();
  const [f, setF] = useState<TechListFilters>(EMPTY_FILTERS);
  const [order, setOrder] = useState<OrderKey>('rating');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<TechListFilters>(EMPTY_FILTERS);
  const [rejecting, setRejecting] = useState<Row | null>(null);

  useEffect(() => {
    void loadExtras();
  }, []);

  const rows = useMemo<Row[]>(() => {
    const cats = getCategories();
    const orders = getAllRequests();
    const vehicles = getAllVehicles();
    const techTools = getAllTechTools();
    return getTechniciansWithProfile().map(({ tech, profile }) => {
      const names = [
        ...new Set(
          getTechCategories(tech.id)
            .map(tc => cats.find(c => c.id === tc.category_id)?.name)
            .filter((n): n is string => !!n),
        ),
      ];
      return {
        id: tech.id,
        name: profile?.full_name ?? tech.display_name ?? 'Técnico',
        phone: formatPhone(profile?.phone) || '—',
        cats: names,
        zone: getTechMunicipality(tech.id) ?? '—',
        rating: tech.rating_avg,
        reviews: tech.rating_count,
        jobs: orders.filter(
          o => o.technician_id === tech.id && DONE.has(o.status),
        ).length,
        available: tech.is_available,
        kyc: kycGroup(tech.kyc_status, profile?.status),
        type: tech.technician_type,
        companyId: tech.company_id,
        plates: vehicles.filter(v => v.technician_id === tech.id).map(v => v.plate),
        toolIds: techTools
          .filter(t => t.technician_id === tech.id && t.catalog_id)
          .map(t => t.catalog_id as string),
      };
    });
    // `tick`/extras: el snapshot vive en el módulo del store.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, extras]);

  const categoryNames = useMemo(
    () => getCategories().map(c => c.name),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tick],
  );
  const zoneNames = useMemo(
    () => [...new Set(rows.map(r => r.zone).filter(z => z !== '—'))].sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const list = filterTechs(rows, f);
    const by: Record<OrderKey, (a: Row, b: Row) => number> = {
      rating: (a, b) => b.rating - a.rating,
      jobs: (a, b) => b.jobs - a.jobs,
      name: (a, b) => a.name.localeCompare(b.name, 'es'),
    };
    return [...list].sort(by[order]);
  }, [rows, f, order]);

  const count = (k: KycGroup) => rows.filter(r => r.kyc === k).length;
  const tabs = [
    { value: 'all' as const, label: 'Todos', count: rows.length },
    { value: 'in_review' as const, label: 'Pendientes KYC', count: count('in_review') },
    { value: 'approved' as const, label: 'Aprobados', count: count('approved') },
    { value: 'declined' as const, label: 'Rechazados', count: count('declined') },
    { value: 'suspended' as const, label: 'Suspendidos', count: count('suspended') },
  ];
  const nFilters = activeFilterCount(f);

  const approve = (r: Row) =>
    void run(`approve-${r.id}`, () => resolveKyc(r.id, true), `Técnico aprobado · ${r.name}`);

  function onExport(list: Row[]) {
    exportCsv(
      'tecnicos.csv',
      list.map(r => ({
        ID: r.id,
        Nombre: r.name,
        Teléfono: r.phone,
        Especialidades: r.cats.join(' / '),
        Zona: r.zone,
        Rating: r.rating || '',
        Trabajos: r.jobs,
        Disponible: r.available ? 'Sí' : 'No',
        KYC: KYC_GROUP_META[r.kyc].label,
        Tipo: techTypeLabel(r.type, getCompany(r.companyId)?.name),
      })),
    );
    toast.success('CSV exportado', `${list.length} técnicos`);
  }

  const allVehicles = getAllVehicles();
  const plateHits = (techId: string) => matchingPlates(allVehicles, techId, f.q);

  const columns: DataColumn<Row>[] = [
    {
      key: 'name',
      header: 'Técnico',
      sortValue: r => r.name,
      render: r => (
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-action font-display text-[12.5px] font-bold text-white">
            {initials(r.name)}
          </span>
          <div className="min-w-0">
            <div className="truncate font-sans text-[13.5px] font-semibold text-navy">
              {r.name}
            </div>
            <div className="font-mono text-[11.5px] text-muted">{r.phone}</div>
            {plateHits(r.id).map(pl => (
              <div key={pl} className="font-mono text-[11.5px] font-semibold text-primary">
                Placas {formatPlate(pl)}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      sortValue: r => r.type,
      render: r => <TechTypeBadge techId={r.id} />,
    },
    {
      key: 'cats',
      header: 'Especialidades',
      render: r => (
        <span className="font-sans text-[13px] text-body">
          {r.cats.length ? r.cats.slice(0, 2).join(' · ') : '—'}
          {r.cats.length > 2 && (
            <span className="text-muted"> +{r.cats.length - 2}</span>
          )}
        </span>
      ),
    },
    {
      key: 'zone',
      header: 'Zona',
      sortValue: r => r.zone,
      render: r => <span className="font-sans text-[13px] text-muted">{r.zone}</span>,
    },
    {
      key: 'rating',
      header: 'Rating',
      sortValue: r => r.rating,
      render: r =>
        r.rating > 0 ? (
          <span className="inline-flex items-center gap-1 font-display text-[13.5px] font-bold text-navy tabular">
            <Star size={13} className="fill-navy text-navy" />
            {r.rating.toFixed(1)}
          </span>
        ) : (
          <span className="font-sans text-[12px] text-faint">Sin reseñas</span>
        ),
    },
    {
      key: 'jobs',
      header: 'Trabajos',
      align: 'right',
      sortValue: r => r.jobs,
      render: r => (
        <span className="font-display text-[13.5px] font-bold text-navy tabular">
          {r.jobs}
        </span>
      ),
    },
    {
      key: 'avail',
      header: 'Disponibilidad',
      sortValue: r => (r.available ? 1 : 0),
      render: r => (
        <span className="inline-flex items-center gap-2 font-sans text-[13px] text-body">
          <span
            className={`h-2 w-2 rounded-full ${r.available ? 'bg-success' : 'bg-faint'}`}
          />
          {r.available ? 'Disponible' : 'No disponible'}
        </span>
      ),
    },
    {
      key: 'kyc',
      header: 'Estado',
      sortValue: r => r.kyc,
      render: r => (
        <Badge tone={KYC_GROUP_META[r.kyc].tone}>{KYC_GROUP_META[r.kyc].label}</Badge>
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
        title="Técnicos"
        description="Red PRO y cola de verificación. Meta: resolver cada KYC en menos de 24 h hábiles."
        actions={
          <Button variant="secondary" icon={Download} onClick={() => onExport(filtered)}>
            Exportar
          </Button>
        }
      />

      <Card padded={false} className="overflow-hidden">
        <div className="border-b border-line px-5 pt-3">
          <Tabs
            tabs={tabs}
            value={f.tab}
            onChange={tab => setF(p => ({ ...p, tab }))}
          />
        </div>

        <div className="flex flex-col gap-3 p-5 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              icon={Search}
              value={f.q}
              onChange={e => setF(p => ({ ...p, q: e.target.value }))}
              placeholder="Nombre, teléfono, zona o placas"
              wrapperClassName="w-full max-w-sm"
              aria-label="Buscar técnicos"
            />
            <Button
              variant="secondary"
              icon={SlidersHorizontal}
              onClick={() => {
                setDraft(f);
                setSheetOpen(true);
              }}
            >
              Filtros
              {nFilters > 0 && (
                <span className="ml-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] text-white">
                  {nFilters}
                </span>
              )}
            </Button>
            {(nFilters > 0 || f.q) && (
              <Button variant="ghost" size="sm" onClick={() => setF(p => ({ ...EMPTY_FILTERS, tab: p.tab }))}>
                Limpiar
              </Button>
            )}
          </div>

          {/* Chips de filtros activos */}
          {nFilters > 0 && (
            <div className="flex flex-wrap gap-2">
              {f.category && (
                <Chip onRemove={() => setF(p => ({ ...p, category: null }))}>{f.category}</Chip>
              )}
              {f.zones.map(z => (
                <Chip key={z} onRemove={() => setF(p => ({ ...p, zones: p.zones.filter(x => x !== z) }))}>
                  {z}
                </Chip>
              ))}
              {f.minRating > 0 && (
                <Chip onRemove={() => setF(p => ({ ...p, minRating: 0 }))}>
                  Rating ≥ {f.minRating.toFixed(1)}
                </Chip>
              )}
              {f.type && (
                <Chip onRemove={() => setF(p => ({ ...p, type: null, companyId: null }))}>
                  {TECH_TYPE_LABEL[f.type as TechType]}
                </Chip>
              )}
              {f.companyId && (
                <Chip onRemove={() => setF(p => ({ ...p, companyId: null }))}>
                  {getCompany(f.companyId)?.name ?? 'Empresa'}
                </Chip>
              )}
              {(f.tools ?? []).map(id => (
                <Chip key={id} onRemove={() => setF(p => ({ ...p, tools: (p.tools ?? []).filter(x => x !== id) }))}>
                  {getCatalogTool(id)?.name ?? 'Herramienta'}
                </Chip>
              ))}
              {f.availability !== 'all' && (
                <Chip onRemove={() => setF(p => ({ ...p, availability: 'all' }))}>
                  {f.availability === 'available' ? 'Disponibles' : 'No disponibles'}
                </Chip>
              )}
            </div>
          )}

        </div>

        <DataTable
          rows={filtered}
          rowKey={r => r.id}
          columns={columns}
          onRowClick={r => router.push(`/tecnicos/${r.id}`)}
          selectable
          bulkActions={(selected, clear) => (
            <Button
              size="sm"
              variant="secondary"
              icon={Download}
              onClick={() => {
                onExport(selected);
                clear();
              }}
            >
              Exportar {selected.length}
            </Button>
          )}
          rowMenu={r => [
            { label: 'Ver perfil', icon: Eye, onSelect: () => router.push(`/tecnicos/${r.id}`) },
            {
              label: 'Copiar teléfono',
              icon: Copy,
              onSelect: () => {
                void navigator.clipboard?.writeText(r.phone).then(
                  () => toast.success('Teléfono copiado'),
                  () => toast.error('No se pudo copiar'),
                );
              },
            },
            ...(r.kyc === 'in_review'
              ? ([
                  'divider',
                  { label: 'Aprobar KYC', icon: Check, disabled: !!busy, onSelect: () => approve(r) },
                  { label: 'Rechazar KYC', icon: X, destructive: true, disabled: !!busy, onSelect: () => setRejecting(r) },
                ] as const)
              : []),
          ]}
          pageSize={8}
          empty={
            <EmptyState
              kind="no-results"
              title="Sin técnicos con estos filtros"
              description="Prueba con otra zona, categoría o quita el rating mínimo."
              action={
                <Button variant="secondary" size="sm" onClick={() => setF(EMPTY_FILTERS)}>
                  Limpiar filtros
                </Button>
              }
              compact
            />
          }
        />
      </Card>

      {/* Filtros */}
      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filtros"
        kicker="Técnicos"
        width={400}
        footer={
          <div className="flex w-full gap-2">
            <Button
              variant="secondary"
              full
              onClick={() => setDraft(d => ({ ...d, category: null, zones: [], minRating: 0, availability: 'all', type: null, companyId: null, tools: [] }))}
            >
              Limpiar
            </Button>
            <Button
              full
              onClick={() => {
                setF(draft);
                setSheetOpen(false);
              }}
            >
              Aplicar
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          <section>
            <Kicker className="mb-2.5">Categoría</Kicker>
            <div className="flex flex-wrap gap-2">
              <Chip active={!draft.category} onClick={() => setDraft(d => ({ ...d, category: null }))}>
                Todas
              </Chip>
              {categoryNames.map(c => (
                <Chip
                  key={c}
                  active={draft.category === c}
                  onClick={() => setDraft(d => ({ ...d, category: d.category === c ? null : c }))}
                >
                  {c}
                </Chip>
              ))}
            </div>
          </section>
          <section>
            <Kicker className="mb-2.5">Zona</Kicker>
            {zoneNames.length ? (
              <div className="flex flex-wrap gap-2">
                {zoneNames.map(z => (
                  <Chip
                    key={z}
                    active={draft.zones.includes(z)}
                    onClick={() =>
                      setDraft(d => ({
                        ...d,
                        zones: d.zones.includes(z) ? d.zones.filter(x => x !== z) : [...d.zones, z],
                      }))
                    }
                  >
                    {z}
                  </Chip>
                ))}
              </div>
            ) : (
              <p className="font-sans text-[13px] text-muted">
                Ningún técnico tiene base registrada todavía.
              </p>
            )}
          </section>
          <section>
            <Kicker className="mb-2.5">Rating mínimo</Kicker>
            <Segmented
              options={[
                { value: '0', label: 'Todos' },
                { value: '4', label: '4.0+' },
                { value: '4.5', label: '4.5+' },
                { value: '4.8', label: '4.8+' },
              ]}
              value={String(draft.minRating)}
              onChange={v => setDraft(d => ({ ...d, minRating: Number(v) }))}
            />
          </section>
          <section>
            <Kicker className="mb-2.5">Disponibilidad</Kicker>
            <Segmented
              options={[
                { value: 'all', label: 'Todas' },
                { value: 'available', label: 'Disponibles' },
                { value: 'unavailable', label: 'No disponibles' },
              ]}
              value={draft.availability}
              onChange={v => setDraft(d => ({ ...d, availability: v }))}
            />
          </section>
          <section>
            <Kicker className="mb-2.5">Tipo de técnico</Kicker>
            <div className="flex flex-wrap gap-2">
              <Chip active={!draft.type} onClick={() => setDraft(d => ({ ...d, type: null, companyId: null }))}>
                Todos
              </Chip>
              {TECH_TYPES.map(t => (
                <Chip
                  key={t}
                  active={draft.type === t}
                  onClick={() =>
                    setDraft(d => ({ ...d, type: d.type === t ? null : t, companyId: t === 'third_party' && d.type !== t ? d.companyId : null }))
                  }
                >
                  {TECH_TYPE_LABEL[t]}
                </Chip>
              ))}
            </div>
            {draft.type === 'third_party' && (
              <div className="mt-3">
                <Select
                  options={getCompanies().map(c => ({ value: c.id, label: c.name }))}
                  value={draft.companyId ?? null}
                  onChange={v => setDraft(d => ({ ...d, companyId: v }))}
                  placeholder="Todas las empresas"
                  aria-label="Empresa"
                />
                {draft.companyId && (
                  <button
                    type="button"
                    onClick={() => setDraft(d => ({ ...d, companyId: null }))}
                    className="mt-1.5 font-sans text-[12.5px] font-semibold text-primary"
                  >
                    Quitar empresa
                  </button>
                )}
              </div>
            )}
          </section>
          <section>
            <Kicker className="mb-2.5">Herramienta</Kicker>
            <ToolFilter
              selected={draft.tools ?? []}
              onChange={tools => setDraft(d => ({ ...d, tools }))}
            />
          </section>
          <section>
            <Kicker className="mb-2.5">Ordenar por</Kicker>
            <Segmented
              options={ORDER_OPTIONS}
              value={order}
              onChange={v => setOrder(v)}
            />
          </section>
        </div>
      </Sheet>

      <Modal
        open={!!rejecting}
        onClose={() => !busy && setRejecting(null)}
        dismissible={!busy}
        title="Rechazar KYC"
        description={
          rejecting
            ? `Se le avisará a ${rejecting.name.split(' ')[0]} para que corrija sus documentos. Para dar un motivo detallado abre su perfil.`
            : undefined
        }
        icon={X}
        tone="danger"
        footer={
          <>
            <Button variant="secondary" disabled={!!busy} onClick={() => setRejecting(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              loading={!!busy}
              onClick={async () => {
                if (!rejecting) return;
                const ok = await run(
                  `reject-${rejecting.id}`,
                  () => rejectKyc(rejecting.id, 'Documentos incompletos (rechazo desde el listado)'),
                  `KYC rechazado · ${rejecting.name}`,
                );
                if (ok) setRejecting(null);
              }}
            >
              Rechazar
            </Button>
          </>
        }
      />
    </div>
  );
}
