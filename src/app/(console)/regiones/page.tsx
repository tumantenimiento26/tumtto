'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, MapPin, Pencil, Star } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  ErrorPage,
  Kicker,
  PageHeader,
  ScreenSkeleton,
  Toggle,
  snackbar,
  toast,
  type DataColumn,
} from '@/components/ds';
import { exportCsv } from '@/components/admin';
import { CoverageMap } from '@/components/coverage-map';
import {
  getAllEvents,
  getAllRequests,
  getCategories,
  getTechCategories,
  getTechMunicipality,
  getTechRadiusKm,
  getTechniciansWithProfile,
  loadExtras,
  loadWorld,
  setZoneActive,
  useExtras,
  useTick,
  useWorldFailed,
  useWorldReady,
} from '@/lib/data/store';
import {
  MAP_ZONE_ID,
  arrivalMinutes,
  canonMunicipality,
  coverageGaps,
  hourlyDemand,
  ratioTone,
  zoneStats,
  type TechBase,
  type ZoneRow,
} from '@/lib/regions';
import { initials } from '@/lib/techConsole';
import { pctDelta, deltaLabel } from '@/lib/finance';

const DAY = 864e5;
const ratioText = (r: number | null) =>
  r == null ? '—' : r === Infinity ? 'sin técnicos' : `${r}×`;

function Kpi({ label, value, sub, index }: { label: string; value: string; sub: string; index: number }) {
  return (
    <Card padded className="animate-up">
      <div style={{ animationDelay: `${index * 50}ms` }}>
        <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">{label}</div>
        <div className="mt-2 font-display text-[27px] font-extrabold tracking-[-0.5px] text-navy tabular">{value}</div>
        <div className="mt-1 font-sans text-[12px] text-muted">{sub}</div>
      </div>
    </Card>
  );
}

/** Anillo de cobertura animado (stroke-dashoffset). */
function Ring({ pct }: { pct: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);
  return (
    <div className="relative h-[84px] w-[84px] shrink-0">
      <svg viewBox="0 0 84 84" className="-rotate-90">
        <circle cx="42" cy="42" r={r} fill="none" strokeWidth="8" className="stroke-segment" />
        <circle
          cx="42"
          cy="42"
          r={r}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          stroke={pct >= 80 ? 'var(--color-success)' : pct >= 50 ? 'var(--color-warning)' : 'var(--color-error)'}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown / 100)}
          className="transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-display text-[18px] font-extrabold text-navy tabular">
        {pct}%
      </span>
    </div>
  );
}

export default function RegionesPage() {
  const tick = useTick();
  const extras = useExtras();
  const ready = useWorldReady();
  const failed = useWorldFailed();
  const [selected, setSelected] = useState<string | null>(null);
  const [editingPolys, setEditingPolys] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    void loadExtras();
  }, []);

  const data = useMemo(() => {
    const now = new Date();
    const orders = getAllRequests();
    const catName = new Map(getCategories().map(c => [c.id, c.name]));
    const techs: TechBase[] = getTechniciansWithProfile()
      .filter(({ tech }) => tech.kyc_status === 'approved')
      .map(({ tech, profile }) => ({
        id: tech.id,
        name: profile?.full_name ?? tech.display_name ?? 'Técnico',
        municipality: getTechMunicipality(tech.id),
        radiusKm: getTechRadiusKm(tech.id),
        rating: tech.rating_avg,
        cats: getTechCategories(tech.id)
          .map(tc => catName.get(tc.category_id))
          .filter(Boolean)
          .join(', '),
        available: tech.is_available,
      }));
    const arrivals = arrivalMinutes(orders, getAllEvents());
    const rows = zoneStats({ orders, techs, zones: extras.zones, arrivals, now });
    const t = now.getTime();
    const inWin = (iso: string, a: number, b: number) => {
      const x = new Date(iso).getTime();
      return x >= t - a * DAY && x < t - b * DAY;
    };
    const eta = Object.values(arrivals);
    return {
      orders,
      techs,
      rows,
      demand: [orders.filter(o => inWin(o.created_at, 7, 0)).length, orders.filter(o => inWin(o.created_at, 14, 7)).length],
      eta: eta.length ? Math.round(eta.reduce((s, m) => s + m, 0) / eta.length) : null,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, extras]);

  const sel = data.rows.find(r => r.name === selected) ?? [...data.rows].sort((a, b) => b.demand7 - a.demand7)[0] ?? null;
  const selTechs = sel ? data.techs.filter(t => canonMunicipality(t.municipality) === sel.name) : [];
  const hours = sel ? hourlyDemand(data.orders, sel.name) : [];
  const gaps = sel ? coverageGaps(data.orders, sel.name).slice(0, 5) : [];
  const maxH = Math.max(...hours, 1);

  if (failed)
    return <ErrorPage kind="500" primary={{ label: 'Reintentar', onClick: () => void loadWorld(true) }} />;
  if (!ready) return <ScreenSkeleton kind="dashboard" />;

  async function toggle(row: ZoneRow, next: boolean) {
    const id = row.zoneId;
    if (!id) return;
    setPending(id);
    const ok = await setZoneActive(id, next);
    setPending(null);
    if (ok === null) return; // mutate ya notificó el error
    snackbar.show(`${row.name} ${next ? 'activada' : 'pausada'}`, {
      undo: () => void setZoneActive(id, !next),
    });
  }

  const mapZones = data.rows
    .filter(r => MAP_ZONE_ID[r.name])
    .map(r => ({
      id: MAP_ZONE_ID[r.name],
      name: r.name,
      status: (ratioTone(r.ratio) === 'danger' || !r.active ? 'warn' : 'ok') as 'ok' | 'warn',
      techs: r.techs,
      covered: r.served,
      colonias: 100,
    }));
  const idToName = Object.fromEntries(Object.entries(MAP_ZONE_ID).map(([n, id]) => [id, n]));

  const cols: DataColumn<ZoneRow>[] = [
    {
      key: 'name',
      header: 'Municipio',
      sortValue: r => r.name,
      render: r => (
        <span className="inline-flex items-center gap-2 font-sans text-[13.5px] font-semibold text-navy">
          <MapPin size={14} className="text-faint" /> {r.name}
        </span>
      ),
    },
    {
      key: 'served',
      header: 'Atendidas',
      sortValue: r => r.served,
      render: r => (
        <div className="flex min-w-[110px] items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-segment">
            <div className="h-full rounded-full bg-primary" style={{ width: `${r.served}%` }} />
          </div>
          <span className="w-9 text-right font-mono text-[12px] text-muted tabular">{r.served}%</span>
        </div>
      ),
    },
    { key: 'techs', header: 'Técnicos', align: 'right', sortValue: r => r.techs, render: r => <span className="font-mono text-[13px] text-navy tabular">{r.techs}</span> },
    { key: 'demand', header: 'Solicitudes 7 d', align: 'right', sortValue: r => r.demand7, render: r => <span className="font-mono text-[13px] text-navy tabular">{r.demand7}</span> },
    {
      key: 'ratio',
      header: 'Solicitudes / técnico',
      sortValue: r => (r.ratio === Infinity ? 1e9 : (r.ratio ?? -1)),
      render: r => <Badge tone={ratioTone(r.ratio)} dot>{ratioText(r.ratio)}</Badge>,
    },
    { key: 'eta', header: 'Llegada media', align: 'right', sortValue: r => r.etaMin ?? 1e9, render: r => <span className="font-mono text-[12.5px] text-muted">{r.etaMin != null ? `${r.etaMin} min` : '—'}</span> },
    {
      key: 'active',
      header: 'Activa',
      sortValue: r => (r.active ? 1 : 0),
      render: r => (
        <span onClick={e => e.stopPropagation()} title={r.zoneId ? undefined : 'Sin zona registrada en coverage_zones'}>
          <Toggle
            checked={r.active}
            disabled={!r.zoneId || extras.unavailable.zones || pending === r.zoneId}
            onChange={next => void toggle(r, next)}
            aria-label={`Activar ${r.name}`}
          />
        </span>
      ),
    },
  ];

  const active = data.rows.filter(r => r.active).length;
  const withBase = data.techs.filter(t => t.municipality).length;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Regiones y cobertura"
        description="Oferta y demanda por municipio de la ZMG · activa o pausa zonas de servicio."
        actions={
          <Button
            variant="secondary"
            icon={Download}
            onClick={() => {
              exportCsv(
                'cobertura.csv',
                data.rows.map(r => ({
                  Municipio: r.name,
                  Activa: r.active ? 'Sí' : 'No',
                  Técnicos: r.techs,
                  'Solicitudes 7 d': r.demand7,
                  'Solicitudes/técnico': ratioText(r.ratio),
                  'Atendidas %': r.served,
                  'Llegada media (min)': r.etaMin ?? '',
                })),
              );
              toast.success('CSV exportado', `${data.rows.length} municipios`);
            }}
          >
            Exportar cobertura
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi index={0} label="Zonas activas" value={`${active}/${data.rows.length}`} sub={extras.unavailable.zones ? 'Tabla de zonas no disponible' : 'municipios con servicio'} />
        <Kpi index={1} label="Técnicos con base" value={String(withBase)} sub={`de ${data.techs.length} aprobados`} />
        <Kpi index={2} label="Solicitudes 7 d" value={String(data.demand[0])} sub={`${deltaLabel(pctDelta(data.demand[0], data.demand[1]))} vs semana anterior`} />
        <Kpi index={3} label="Llegada media" value={data.eta != null ? `${data.eta} min` : '—'} sub="de aceptada a en sitio" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card padded={false} className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <Kicker>Mapa de cobertura</Kicker>
              <Button size="sm" variant="ghost" icon={Pencil} onClick={() => setEditingPolys(v => !v)}>
                {editingPolys ? 'Editando…' : 'Editar polígonos'}
              </Button>
            </div>
            {/* ponytail: el mapa solo tiene polígonos para zap/gdl/tlaq/tlaj; otros municipios aparecen solo en la tabla. */}
            <CoverageMap
              zones={mapZones}
              selected={sel ? (MAP_ZONE_ID[sel.name] ?? '') : ''}
              onSelect={id => idToName[id] && setSelected(idToName[id])}
              height={420}
              editing={editingPolys}
              onEditingChange={setEditingPolys}
            />
          </Card>

          <Card padded={false} className="overflow-hidden">
            <div className="border-b border-line px-5 py-3">
              <Kicker>Municipios</Kicker>
            </div>
            <DataTable
              rows={data.rows}
              rowKey={r => r.name}
              columns={cols}
              onRowClick={r => setSelected(r.name)}
              initialSort={{ key: 'demand', dir: 'desc' }}
              pageSize={10}
              empty={<EmptyState kind="first-use" title="Sin municipios" description="Aparecen cuando hay zonas, técnicos con base o solicitudes." compact />}
            />
            {extras.unavailable.zones && (
              <p className="border-t border-divider px-5 py-3 font-sans text-[12px] text-muted">
                No se pudo leer <span className="font-mono">coverage_zones</span>: los interruptores están deshabilitados.
              </p>
            )}
          </Card>
        </div>

        <Card padded className="h-fit xl:sticky xl:top-4">
          {!sel ? (
            <EmptyState kind="first-use" title="Selecciona un municipio" compact />
          ) : (
            <div className="flex flex-col gap-5" key={sel.name}>
              <div className="flex items-center gap-4">
                <Ring pct={sel.served} />
                <div className="min-w-0">
                  <Kicker>Zona seleccionada</Kicker>
                  <div className="font-display text-[20px] font-extrabold text-navy">{sel.name}</div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge tone={sel.active ? 'success' : 'neutral'} dot>{sel.active ? 'Activa' : 'Pausada'}</Badge>
                    <Badge tone={ratioTone(sel.ratio)}>{ratioText(sel.ratio)} sol./téc.</Badge>
                  </div>
                </div>
              </div>

              <div>
                <Kicker className="mb-2">Demanda por hora · hoy</Kicker>
                <div className="flex h-[80px] items-end gap-[3px]">
                  {hours.map((h, i) => (
                    <div
                      key={i}
                      title={`${i + 6}:00 · ${h} solicitudes`}
                      className="flex-1 origin-bottom rounded-t-[3px] bg-primary transition-[height] duration-500"
                      style={{ height: `${Math.max((h / maxH) * 100, 3)}%`, opacity: h ? 1 : 0.25 }}
                    />
                  ))}
                </div>
                <div className="mt-1 flex justify-between font-mono text-[10px] text-faint">
                  <span>06</span>
                  <span>12</span>
                  <span>18</span>
                  <span>23</span>
                </div>
              </div>

              <div>
                <Kicker className="mb-2">Brechas · 30 días</Kicker>
                {gaps.length === 0 ? (
                  <p className="font-sans text-[13px] text-muted">Todas las solicitudes recibieron técnico.</p>
                ) : (
                  <div className="flex flex-col">
                    {gaps.map(g => (
                      <div key={g.neighborhood} className="flex items-center justify-between border-t border-divider py-2 first:border-t-0">
                        <span className="font-sans text-[13px] text-navy">{g.neighborhood}</span>
                        <Badge tone="warning">{g.unserved} sin técnico</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Kicker className="mb-2">Técnicos con base · {selTechs.length}</Kicker>
                {selTechs.length === 0 ? (
                  <p className="font-sans text-[13px] text-muted">Ningún técnico aprobado tiene base aquí.</p>
                ) : (
                  <div className="flex flex-col">
                    {selTechs.slice(0, 6).map(t => (
                      <a key={t.id} href={`/tecnicos/${t.id}`} className="flex items-center gap-2.5 rounded-[8px] px-1 py-2 transition-colors hover:bg-panel">
                        <span className="relative grid h-8 w-8 place-items-center rounded-full bg-action font-display text-[11.5px] font-bold text-white">
                          {initials(t.name)}
                          <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${t.available ? 'bg-success' : 'bg-muted'}`} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-sans text-[13px] font-semibold text-navy">{t.name}</div>
                          <div className="truncate font-sans text-[11.5px] text-muted">{t.cats || 'Sin especialidades'}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-[11.5px] text-navy">{t.radiusKm} km</div>
                          {t.rating > 0 && (
                            <div className="inline-flex items-center gap-0.5 font-mono text-[11px] text-muted">
                              <Star size={10} className="fill-warning text-warning" /> {t.rating.toFixed(1)}
                            </div>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
