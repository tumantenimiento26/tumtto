'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, Snowflake, Star } from 'lucide-react';
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
  toast,
  Chip,
  Select,
  PeriodFilters,
  periodLabel,
  toPeriod,
} from '@/components/ds';
import { LineChart, HBars } from '@/components/charts';
import {
  getCategoriesWithCounts,
  getReportData,
  getCompanies,
  loadExtras,
  useExtras,
  getTechniciansWithProfile,
  fetchReportKpis,
  fetchTicketByCategory,
  fetchColdZones,
  type ReportKpis,
  useTick,
  useWorldReady,
  useWorldFailed,
  loadWorld,
} from '@/lib/data/store';
import {
  completedSeries,
  demandHeatmap,
  funnel,
  prdKpis,
  toCsv,
  type Kpi,
} from '@/lib/reportMetrics';
import { TECH_TYPES, TECH_TYPE_LABEL, type TechType } from '@/lib/techType';
import { Heatmap } from './_components/Heatmap';
import { rangePreset, type DateRange } from '@/lib/calendar';


const mxn = (cents: number) =>
  `$${Math.round(cents / 100).toLocaleString('es-MX')}`;

type TicketRow = {
  category_id: string;
  paid_orders: number;
  avg_ticket_cents: number;
};
type ColdRow = { zone_id: string; zone_name: string; order_count: number };

export default function ReportesPage() {
  useTick();
  const ready = useWorldReady();
  const failed = useWorldFailed();
  const [range, setRange] = useState<NonNullable<DateRange>>(() => rangePreset('30d')!);
  const period = useMemo(() => toPeriod(range), [range]);
  const days = Math.max(1, Math.round((period.to.getTime() - period.from.getTime()) / 864e5));
  const label = periodLabel(range);

  // Filtros por tipo/empresa de técnico (solo afectan lo calculado en local).
  const [typeF, setTypeF] = useState<TechType | null>(null);
  const [companyF, setCompanyF] = useState<string | null>(null);
  useExtras(s => s.companies);
  useEffect(() => {
    void loadExtras();
  }, []);
  const filtered = !!typeF;

  const [rpc, setRpc] = useState<{
    kpis: ReportKpis | null;
    tickets: TicketRow[] | null;
    cold: ColdRow[] | null;
    loading: boolean;
  }>({ kpis: null, tickets: null, cold: null, loading: true });

  useEffect(() => {
    let live = true;
    setRpc(r => ({ ...r, loading: true }));
    void Promise.all([
      fetchReportKpis(period.from, period.to),
      fetchTicketByCategory(period.from, period.to),
      fetchColdZones(period.from, period.to),
    ]).then(([kpis, tickets, cold]) => {
      if (live) setRpc({ kpis, tickets, cold, loading: false });
    });
    return () => {
      live = false;
    };
  }, [period]);

  const all = getReportData();
  const technicians = all.technicians.filter(
    t => !typeF || (t.technician_type === typeF && (!companyF || t.company_id === companyF)),
  );
  const techIds = new Set(technicians.map(t => t.id));
  const orders = filtered
    ? all.orders.filter(o => !!o.technician_id && techIds.has(o.technician_id))
    : all.orders;
  const orderIds = new Set(orders.map(o => o.id));
  const events = filtered ? all.events.filter(e => orderIds.has(e.service_order_id)) : all.events;
  const kpis = prdKpis(orders, events, technicians, period);
  const series = completedSeries(orders, Math.min(days, 30), range.to);
  const steps = funnel(orders, events, period);
  const grid = demandHeatmap(orders, period);
  const cats = getCategoriesWithCounts();
  const ticketBy = new Map((rpc.tickets ?? []).map(t => [t.category_id, t]));
  const catRows = cats
    .filter(c => c.services > 0)
    .map(c => {
      const t = ticketBy.get(c.id);
      return {
        label: c.name,
        value: c.services,
        meta: t ? `ticket medio ${mxn(Number(t.avg_ticket_cents))}` : undefined,
      };
    })
    .sort((a, b) => b.value - a.value);

  const doneByTech = new Map<string, number>();
  for (const o of orders)
    if (o.technician_id && ['completed', 'paid', 'closed'].includes(o.status))
      doneByTech.set(
        o.technician_id,
        (doneByTech.get(o.technician_id) ?? 0) + 1,
      );
  const techRows = getTechniciansWithProfile()
    .filter(({ tech }) => !typeF || techIds.has(tech.id))
    .map(({ tech, profile }) => ({
      id: tech.id,
      name: profile?.full_name ?? 'Técnico',
      rating: tech.rating_avg,
      reviews: tech.rating_count,
      done: doneByTech.get(tech.id) ?? 0,
    }))
    .sort((a, b) => b.done - a.done || b.rating - a.rating)
    .slice(0, 10)
    .map((t, i) => ({ ...t, rank: i + 1 }));

  function exportCsv() {
    const rows = [
      ...kpis.map(k => ({
        Sección: 'KPI',
        Métrica: k.label,
        Valor: k.display,
        Meta: k.goal,
      })),
      ...steps.map(s => ({
        Sección: 'Embudo',
        Métrica: s.label,
        Valor: s.value,
        Meta: '',
      })),
      ...catRows.map(c => ({
        Sección: 'Categoría',
        Métrica: c.label,
        Valor: c.value,
        Meta: c.meta ?? '',
      })),
      ...techRows.map(t => ({
        Sección: 'Top técnicos',
        Métrica: t.name,
        Valor: t.done,
        Meta: `${t.rating.toFixed(2)} ★`,
      })),
    ];
    try {
      const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-${days}d-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exportado', `${rows.length} filas · ${label}`);
    } catch {
      toast.error('No se pudo exportar el CSV');
    }
  }

  if (failed)
    return (
      <ErrorPage
        kind="500"
        primary={{ label: 'Reintentar', onClick: () => void loadWorld(true) }}
      />
    );
  if (!ready) return <ScreenSkeleton kind="dashboard" />;

  const cur = rpc.kpis?.current;
  const prev = rpc.kpis?.previous;
  const delta = (a?: number, b?: number) =>
    a == null ||
    b == null ||
    !Number.isFinite(a) ||
    !Number.isFinite(b) ||
    b === 0
      ? null
      : Math.round(((a - b) / b) * 100);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reportes y analítica"
        description="Metas del PRD a 6 meses frente a la operación actual."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <PeriodFilters value={range} onChange={setRange} kicker="Reportes">
              <section>
                <Kicker className="mb-2.5">Tipo de técnico</Kicker>
                <div className="flex flex-wrap gap-2">
                  <Chip
                    active={!typeF}
                    onClick={() => {
                      setTypeF(null);
                      setCompanyF(null);
                    }}
                  >
                    Todos
                  </Chip>
                  {TECH_TYPES.map(t => (
                    <Chip
                      key={t}
                      active={typeF === t}
                      onClick={() => {
                        setTypeF(typeF === t ? null : t);
                        setCompanyF(null);
                      }}
                    >
                      {TECH_TYPE_LABEL[t]}
                    </Chip>
                  ))}
                </div>
                {typeF === 'third_party' && (
                  <div className="mt-3">
                    <Select
                      options={getCompanies().map(c => ({ value: c.id, label: c.name }))}
                      value={companyF}
                      onChange={setCompanyF}
                      placeholder="Todas las empresas"
                      aria-label="Empresa"
                    />
                  </div>
                )}
              </section>
            </PeriodFilters>
            <Button variant="secondary" icon={Download} onClick={exportCsv}>
              Exportar CSV
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <KpiGoal key={k.key} k={k} index={i} />
        ))}
      </div>

      {/* Números del periodo (RPC admin_report_kpis) */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <PeriodStat
          label="GMV cobrado"
          value={cur ? mxn(Number(cur.gmv_cents)) : '—'}
          delta={delta(Number(cur?.gmv_cents), Number(prev?.gmv_cents))}
          loading={rpc.loading}
        />
        <PeriodStat
          label="Servicios pagados"
          value={cur ? String(cur.paid_orders) : '—'}
          delta={delta(Number(cur?.paid_orders), Number(prev?.paid_orders))}
          loading={rpc.loading}
        />
        <PeriodStat
          label="Llegada promedio"
          value={
            cur && Number(cur.avg_arrival_seconds) > 0
              ? `${Math.round(Number(cur.avg_arrival_seconds) / 60)} min`
              : '—'
          }
          delta={delta(
            Number(cur?.avg_arrival_seconds),
            Number(prev?.avg_arrival_seconds),
          )}
          invert
          loading={rpc.loading}
        />
      </div>
      {filtered && (
        <p className="-mt-3 font-sans text-[12px] text-muted">
          Filtrado por{' '}
          {typeF === 'third_party' && companyF
            ? `Tercero · ${getCompanies().find(c => c.id === companyF)?.name ?? 'empresa'}`
            : TECH_TYPE_LABEL[typeF as TechType]}
          : las metas, el embudo, la demanda, las series y el ranking se filtran. El resumen del
          periodo (GMV, servicios pagados, llegada), el ticket por categoría y las zonas frías
          vienen del servidor y no se filtran por tipo.
        </p>
      )}
      {!rpc.loading && !rpc.kpis && (
        <p className="-mt-3 font-sans text-[12px] text-muted">
          El resumen del periodo viene del reporte del servidor y no respondió;
          el resto de la página se calcula con los datos cargados.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card padded>
          <Kicker className="mb-4">Servicios completados</Kicker>
          {series.every(p => p.value === 0 && p.prev === 0) ? (
            <EmptyState
              compact
              kind="first-use"
              title="Sin servicios completados"
              description="En este periodo no hay servicios terminados."
            />
          ) : (
            <LineChart
              key={label}
              data={series.map(p => ({ label: p.label, value: p.value }))}
              height={220}
              format={v => `${v} servicios`}
              controls={{
                avg: true,
                compare: {
                  label: 'Periodo anterior',
                  values: series.map(p => p.prev),
                },
              }}
            />
          )}
        </Card>
        <Card padded>
          <Kicker className="mb-4">Embudo de conversión</Kicker>
          <Funnel steps={steps} />
        </Card>
      </div>

      <Card padded>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <Kicker>Demanda por día y franja</Kicker>
          <span className="font-sans text-[12px] text-muted">
            Solicitudes creadas · {label} · 8–20 h
          </span>
        </div>
        <Heatmap grid={grid} />
      </Card>

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        <Card padded>
          <Kicker className="mb-4">Desempeño por categoría</Kicker>
          {catRows.length ? (
            <HBars rows={catRows} controls showPct />
          ) : (
            <EmptyState compact kind="first-use" title="Sin servicios aún" />
          )}
        </Card>
        <Card padded>
          <div className="mb-4 flex items-center justify-between">
            <Kicker>Zonas frías</Kicker>
            <Badge tone="warning" dot>
              <Snowflake size={11} /> Demanda sin cobertura
            </Badge>
          </div>
          {rpc.loading ? (
            <p className="font-sans text-[13px] text-muted">Cargando…</p>
          ) : rpc.cold && rpc.cold.length ? (
            <ul className="flex flex-col divide-y divide-divider">
              {rpc.cold.slice(0, 6).map(z => (
                <li
                  key={z.zone_id}
                  className="flex items-center justify-between py-2.5"
                >
                  <span className="font-sans text-[13.5px] font-semibold text-navy">
                    {z.zone_name}
                  </span>
                  <span className="font-mono text-[12.5px] text-muted tabular">
                    {z.order_count} solicitudes
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              compact
              kind={rpc.cold ? 'all-clear' : 'no-results'}
              title={rpc.cold ? 'Sin zonas frías' : 'Reporte no disponible'}
              description={
                rpc.cold
                  ? 'Toda la demanda del periodo tuvo técnicos en su zona.'
                  : 'El reporte de zonas del servidor no respondió.'
              }
            />
          )}
        </Card>
      </div>

      <Card padded>
        <Kicker className="mb-4">Top técnicos</Kicker>
        <DataTable
          rows={techRows}
          rowKey={r => r.id}
          pageSize={10}
          columns={[
            {
              key: 'rank',
              header: '#',
              render: r => (
                <span
                  className={`inline-grid h-6 w-6 place-items-center rounded-md font-mono text-[11px] font-bold ${
                    r.rank <= 3 ? 'bg-action text-white' : 'bg-chip text-muted'
                  }`}
                >
                  {r.rank}
                </span>
              ),
              sortValue: r => r.rank,
            },
            {
              key: 'name',
              header: 'Técnico',
              render: r => (
                <span className="font-sans text-[13.5px] font-semibold text-navy">
                  {r.name}
                </span>
              ),
              sortValue: r => r.name,
            },
            {
              key: 'rating',
              header: 'Calificación',
              align: 'right',
              render: r => (
                <span className="inline-flex items-center gap-1 font-mono text-[12.5px] text-navy">
                  <Star size={12} className="fill-current text-warning" />
                  {r.reviews ? r.rating.toFixed(2) : '—'}
                </span>
              ),
              sortValue: r => r.rating,
            },
            {
              key: 'done',
              header: 'Servicios',
              align: 'right',
              render: r => (
                <span className="font-mono text-[12.5px] text-navy tabular">
                  {r.done}
                </span>
              ),
              sortValue: r => r.done,
            },
          ]}
          empty={
            <EmptyState compact kind="first-use" title="Aún no hay técnicos" />
          }
        />
      </Card>
    </div>
  );
}

function KpiGoal({ k, index }: { k: Kpi; index: number }) {
  const tone = k.ok == null ? 'neutral' : k.ok ? 'success' : 'warning';
  return (
    <Card padded hover className="animate-up">
      <div
        className="flex items-start justify-between gap-2"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        <Kicker>{k.label}</Kicker>
        <Badge tone={tone}>
          {k.ok == null ? 'Sin datos' : k.ok ? 'En meta' : 'Por debajo'}
        </Badge>
      </div>
      <div className="mt-3 font-display text-[30px] font-extrabold leading-none text-navy tabular">
        {k.display}
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-segment">
        <div
          className={`h-full rounded-full transition-[width] duration-700 ${
            k.ok ? 'bg-approve' : 'bg-warning'
          }`}
          style={{ width: `${Math.round(k.bar * 100)}%` }}
        />
      </div>
      <div className="mt-2 font-sans text-[12.5px] text-muted">{k.goal}</div>
    </Card>
  );
}

function PeriodStat({
  label,
  value,
  delta,
  invert,
  loading,
}: {
  label: string;
  value: string;
  delta: number | null;
  /** true: bajar es bueno (tiempo de llegada). */
  invert?: boolean;
  loading: boolean;
}) {
  const good = delta == null ? null : invert ? delta <= 0 : delta >= 0;
  return (
    <Card padded>
      <Kicker>{label}</Kicker>
      <div className="mt-2 flex items-end gap-2">
        <span className="font-display text-[24px] font-extrabold text-navy tabular">
          {loading ? '…' : value}
        </span>
        {!loading && delta != null && (
          <span
            className={`mb-1 font-mono text-[12px] font-semibold ${
              good ? 'text-success' : 'text-error'
            }`}
          >
            {delta > 0 ? '+' : ''}
            {delta}% vs anterior
          </span>
        )}
      </div>
    </Card>
  );
}

function Funnel({
  steps,
}: {
  steps: { label: string; value: number; ofTotal: number; ofPrev: number }[];
}) {
  const [hover, setHover] = useState<number | null>(null);
  if (!steps[0]?.value)
    return (
      <EmptyState
        compact
        kind="first-use"
        title="Sin solicitudes"
        description="No hubo solicitudes en el periodo."
      />
    );
  // Embudo real: cada etapa es un trapecio centrado cuyo borde superior mide lo
  // que la etapa y el inferior lo que la siguiente (mínimo 22 % para el texto).
  // Ancho útil 50 % del centro para dejar las etiquetas a los lados.
  const w = steps.map(s => Math.max(12, s.ofTotal * 50));
  return (
    <div className="flex flex-col gap-[3px]" onMouseLeave={() => setHover(null)}>
      {steps.map((s, i) => {
        const top = w[i];
        const bottom = i < steps.length - 1 ? w[i + 1] : top * 0.82;
        const pts = `${50 - top / 2},0 ${50 + top / 2},0 ${50 + bottom / 2},100 ${50 - bottom / 2},100`;
        return (
          <button
            key={s.label}
            type="button"
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            aria-label={`${s.label}: ${s.value}${i > 0 ? `, ${Math.round(s.ofPrev * 100)}% del paso anterior` : ''}`}
            className={`relative block h-[52px] w-full text-left outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-primary ${
              hover != null && hover !== i ? 'opacity-45' : ''
            }`}
          >
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
              <polygon
                points={pts}
                className="fill-primary transition-all duration-700"
                style={{ fillOpacity: 1 - i * 0.14 }}
              />
            </svg>
            <span className="absolute left-0 top-1/2 -translate-y-1/2 font-sans text-[12.5px] font-semibold text-navy">
              {s.label}
            </span>
            <span className="relative flex h-full items-center justify-center font-mono text-[13px] font-bold text-white tabular">
              {s.value}
            </span>
            {i > 0 && (
              <span className="absolute right-0 top-1/2 -translate-y-1/2 font-mono text-[11px] text-muted tabular">
                {Math.round(s.ofPrev * 100)}%
              </span>
            )}
          </button>
        );
      })}
      <p className="mt-1.5 text-right font-mono text-[10.5px] text-faint">% = conversión desde el paso anterior</p>
    </div>
  );
}
