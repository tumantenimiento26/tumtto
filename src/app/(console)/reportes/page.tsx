'use client';

import { useMemo, useState } from 'react';
import {
  CalendarRange, ChevronDown, Download, Link2, Star, TrendingUp,
  AlertTriangle, MapPin, HardHat, Snowflake, UserPlus,
} from 'lucide-react';
import { PageHeading, Panel, StatCard, DataTable, exportCsv, type Column } from '@/components/admin';
import { LineChart, VBars, HBars, HeatCalendar } from '@/components/charts';
import { Avatar, Chip, GhostButton, PrimaryButton } from '@/components/ui';
import { FadeIn, Stagger, StaggerItem } from '@/components/motion';
import { toast } from '@/components/toast';
import { getTechniciansWithProfile, getMetrics, getCategoriesWithCounts, useTick } from '@/lib/demo/store';

const RANGES = ['7 días', '30 días', 'Trimestre', 'Año'] as const;
type Range = (typeof RANGES)[number];

// ── Series por rango (mock, valores en servicios y $K MXN) ──────────────────
const pts = (labels: string[], values: number[]) => labels.map((label, i) => ({ label, value: values[i] }));
const RANGE_DATA: Record<Range, {
  svc: { label: string; value: number }[];
  gmv: { label: string; value: number }[];
  svcDelta: string; gmvDelta: string; periodo: string;
}> = {
  '7 días': {
    svc: pts(['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'], [64, 71, 58, 82, 96, 118, 87]),
    gmv: pts(['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'], [61, 68, 52, 79, 92, 121, 83]),
    svcDelta: '+6% WoW', gmvDelta: '+9% WoW', periodo: '25 jun – 01 jul 2026',
  },
  '30 días': {
    svc: pts(['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'], [498, 531, 507, 576]),
    gmv: pts(['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'], [471, 502, 489, 548]),
    svcDelta: '+11% MoM', gmvDelta: '+18% MoM', periodo: '02 jun – 01 jul 2026',
  },
  Trimestre: {
    svc: pts(['Abr', 'May', 'Jun'], [489, 542, 601]),
    gmv: pts(['Abr', 'May', 'Jun'], [468, 498, 553]),
    svcDelta: '+23% QoQ', gmvDelta: '+27% QoQ', periodo: 'Abr – Jun 2026',
  },
  Año: {
    svc: pts(
      ['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      [201, 224, 248, 271, 296, 312, 358, 401, 447, 489, 542, 601],
    ),
    gmv: pts(
      ['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      [188, 212, 239, 260, 288, 313, 352, 398, 431, 468, 498, 553],
    ),
    svcDelta: '+112% YoY', gmvDelta: '+124% YoY', periodo: 'Jul 2025 – Jun 2026',
  },
};

// ── Demanda por día y hora (demo determinista) ───────────────────────────────
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const HORAS = Array.from({ length: 12 }, (_, i) => `${8 + i}h`);
// demo: patrón determinista — picos matutinos (10–12 h) y fin de semana,
// mismo shape que el artefacto del Design System.
function demanda(r: number, c: number) {
  const h = 8 + c;
  const matutino = Math.exp(-((h - 11) ** 2) / 8);
  const vespertino = 0.5 * Math.exp(-((h - 17) ** 2) / 10);
  const finde = r >= 5 ? 1.45 : 1;
  return Math.round((14 + 46 * Math.max(matutino, vespertino)) * finde * (1 + 0.06 * ((r * 7 + c * 3) % 5)));
}

// demo: cancelaciones concentradas en tarde-noche y zonas frías del finde.
function cancelaciones(r: number, c: number) {
  const h = 8 + c;
  const tarde = Math.exp(-((h - 18) ** 2) / 6);
  const finde = r >= 5 ? 1.6 : 1;
  return Math.round((1 + 5 * tarde) * finde * (1 + 0.12 * ((r * 5 + c * 2) % 4)));
}

const COLD_ZONES = [
  { name: 'Tlajomulco Centro', city: 'Tlajomulco', ratio: '8.4 : 1', demand: 142, techs: 17, note: 'Alta demanda de plomería y electricidad con cobertura insuficiente en horario pico.' },
  { name: 'El Salto Industrial', city: 'El Salto', ratio: '6.1 : 1', demand: 98, techs: 16, note: 'Servicios de refrigeración con tiempos de respuesta por encima del SLA objetivo.' },
  { name: 'Tonalá Oriente', city: 'Tonalá', ratio: '5.7 : 1', demand: 87, techs: 15, note: 'Demanda creciente de cerrajería sin técnicos disponibles los fines de semana.' },
];

const CITY_TINTS: Record<string, string> = {
  Guadalajara: '#0A6BCF', Zapopan: '#0894EA', Tlaquepaque: '#5CB7F0',
  Tonalá: '#18C1FF', Tlajomulco: '#0E2C56', 'El Salto': '#B2CCE3',
};

interface TechRow {
  rank: number;
  id: string;
  name: string;
  initials: string;
  region: string;
  rating: number;
  jobs: number;
  gmv: number;
}

export default function ReportesPage() {
  useTick();
  const [range, setRange] = useState<Range>('30 días');

  const metrics = getMetrics();
  const cats = getCategoriesWithCounts();
  const serie = RANGE_DATA[range];
  // ponytail: periodo anterior demo — factores fijos sobre la serie actual.
  const svcPrev = serie.svc.map((d, i) => Math.round(d.value * [0.86, 0.92, 0.83, 0.9][i % 4]));
  const gmvTotal = serie.gmv.reduce((s, d) => s + d.value, 0);
  const svcTotal = serie.svc.reduce((s, d) => s + d.value, 0);

  const techRows: TechRow[] = useMemo(() => {
    const regions = ['Guadalajara', 'Zapopan', 'Tlaquepaque', 'Tonalá', 'Tlajomulco'];
    return getTechniciansWithProfile()
      .map(({ tech, profile }, i) => {
        const name = profile?.full_name ?? `Técnico ${i + 1}`;
        const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
        return {
          id: tech.id,
          name,
          initials,
          region: regions[i % regions.length],
          rating: tech.rating_avg,
          jobs: tech.total_jobs,
          gmv: Math.round(tech.total_jobs * 1180),
        };
      })
      .sort((a, b) => b.rating - a.rating || b.jobs - a.jobs)
      .map((t, i) => ({ ...t, rank: i + 1 }));
  }, []);

  // ponytail: sin ticket promedio por categoría — los pagos del demo son muy
  // escasos para derivarlo; solo conteo de servicios vivo.
  const catRows = cats
    .filter(c => c.services > 0)
    .map(c => ({ label: c.name, value: c.services }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const fmtMXN = (n: number) => `$${(n / 1000).toFixed(0)}K`;

  const columns: Column<TechRow>[] = [
    { key: 'rank', header: '#', className: 'w-10', render: r => (
      <span className={`inline-grid h-6 w-6 place-items-center rounded-md font-mono text-[11px] font-bold ${r.rank <= 3 ? 'bg-grad-brand text-white' : 'bg-surface-2 text-muted'}`}>{r.rank}</span>
    ) },
    { key: 'name', header: 'Técnico', render: r => (
      <div className="flex items-center gap-2.5">
        <Avatar initials={r.initials} size={32} />
        <span className="text-[13px] font-semibold text-navy">{r.name}</span>
      </div>
    ) },
    { key: 'region', header: 'Región', render: r => <span className="text-[12.5px] text-muted">{r.region}</span> },
    { key: 'rating', header: 'Rating', className: 'text-right', render: r => (
      <span className="inline-flex items-center gap-1">
        <Star className="text-warning" size={12} fill="currentColor" />
        <b className="text-[12.5px] font-semibold text-navy">{r.rating.toFixed(2)}</b>
      </span>
    ) },
    { key: 'jobs', header: 'Servicios', className: 'text-right', render: r => <span className="font-mono text-[12.5px] text-navy">{r.jobs}</span> },
    { key: 'gmv', header: 'GMV', className: 'text-right', render: r => <span className="font-mono text-[13px] font-semibold text-navy">{fmtMXN(r.gmv)}</span> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Reportes y analítica"
        sub="Insights de negocio, adquisición, desempeño y cobertura geográfica."
        actions={
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2">
              <CalendarRange className="text-cyan" size={14} />
              <span className="text-[12.5px] font-medium text-navy">{serie.periodo}</span>
              <ChevronDown className="text-faint" size={13} />
            </div>
            <GhostButton
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copiado al portapapeles');
              }}
            >
              <Link2 size={14} className="mr-2" />Compartir link
            </GhostButton>
            <PrimaryButton onClick={() => window.print()}><Download size={14} className="mr-2" />Exportar PDF</PrimaryButton>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        {RANGES.map(r => (
          <Chip key={r} active={r === range} onClick={() => setRange(r)}>{r}</Chip>
        ))}
      </div>

      {/* Summary StatCards */}
      <Stagger className="grid grid-cols-4 gap-4">
        <StaggerItem><StatCard index={0} label="GMV del periodo" value={`$${gmvTotal.toLocaleString('es-MX')}K`} delta={serie.gmvDelta} trend="up" note="Crecimiento sostenido" icon={TrendingUp} /></StaggerItem>
        <StaggerItem><StatCard index={1} label="Servicios completados" value={svcTotal.toLocaleString('es-MX')} suffix="serv." delta={serie.svcDelta} trend="up" note="vs. periodo anterior" /></StaggerItem>
        <StaggerItem><StatCard index={2} label="Comisión plataforma" value={`$${Math.round(gmvTotal * 0.12).toLocaleString('es-MX')}K`} delta={serie.gmvDelta} trend="up" note="Take rate 12%" /></StaggerItem>
        <StaggerItem><StatCard index={3} label="Técnicos activos" value={metrics.activeTechs} suffix={`/ ${metrics.totalTechs}`} note="Cobertura ZMG 86%" icon={HardHat} /></StaggerItem>
      </Stagger>

      {/* Two charts */}
      <div className="grid grid-cols-2 gap-6">
        <FadeIn>
          <Panel title={`Volumen de servicios · ${range.toLowerCase()}`} action={<span className="inline-flex items-center gap-1 rounded-full bg-info-soft px-2.5 py-1 text-[11.5px] font-semibold text-success"><TrendingUp size={11} />{serie.svcDelta}</span>}>
            <div className="pt-2">
              <VBars
                key={`svc-${range}`} data={serie.svc} height={200}
                format={v => `${v.toLocaleString('es-MX')} serv.`}
                controls={{ avg: true, compare: { label: 'Periodo anterior', values: svcPrev } }}
              />
            </div>
          </Panel>
        </FadeIn>
        <FadeIn>
          <Panel title={`Ingresos (GMV) · ${range.toLowerCase()}`} action={<span className="inline-flex items-center gap-1 rounded-full bg-info-soft px-2.5 py-1 text-[11.5px] font-semibold text-success"><TrendingUp size={11} />{serie.gmvDelta}</span>}>
            {/* key por rango: al cambiar de serie se repite el draw-in */}
            <div className="pt-2"><LineChart key={`gmv-${range}`} data={serie.gmv} height={200} format={v => `$${v.toLocaleString('es-MX')}K`} controls={{ avg: true }} /></div>
          </Panel>
        </FadeIn>
      </div>

      {/* Category breakdown + top techs */}
      <div className="grid grid-cols-[380px_1fr] gap-6">
        <FadeIn>
          <Panel title="Desempeño por categoría" action={<span className="text-[11.5px] text-muted">servicios</span>}>
            <div className="pt-2"><HBars rows={catRows} controls showPct /></div>
          </Panel>
        </FadeIn>
        <FadeIn>
          <Panel
            title="Top técnicos · este mes"
            action={
              <GhostButton
                onClick={() => {
                  exportCsv('top-tecnicos.csv', techRows.map(t => ({
                    Rank: t.rank, Técnico: t.name, Región: t.region,
                    Rating: t.rating.toFixed(2), Servicios: t.jobs, GMV: t.gmv,
                  })));
                  toast.success(`CSV exportado · ${techRows.length} técnicos`);
                }}
              >
                <Download size={12} className="mr-1.5" />CSV
              </GhostButton>
            }
          >
            <DataTable columns={columns} rows={techRows} empty="Sin técnicos" />
          </Panel>
        </FadeIn>
      </div>

      {/* Geo stats */}
      <Stagger className="grid grid-cols-4 gap-4">
        <StaggerItem><StatCard index={0} label="Colonias activas" value="758" delta="+24 este mes" trend="up" icon={MapPin} /></StaggerItem>
        <StaggerItem><StatCard index={1} label="Cobertura técnica" value="86%" note="al menos 1 técnico" icon={HardHat} /></StaggerItem>
        <StaggerItem><StatCard index={2} label="Demanda total · mes" value="2,847" delta="+18%" trend="up" /></StaggerItem>
        <StaggerItem><StatCard index={3} label="Zonas frías detectadas" value="3" note="alta demanda · poca oferta" icon={AlertTriangle} /></StaggerItem>
      </Stagger>

      {/* Heatmap */}
      <FadeIn>
        <Panel title="Mapa de calor · demanda por zona" action={<span className="text-[11.5px] text-muted">ZMG · últimos 30 días</span>}>
          <HeatMap />
          <div className="mt-3 flex items-center gap-3">
            <span className="text-[11.5px] text-muted">Demanda baja</span>
            <div className="h-2.5 flex-1 rounded-md" style={{ background: 'linear-gradient(90deg,#DDE7F1,#5CB7F0,#0A6BCF,#0E2C56)' }} />
            <span className="text-[11.5px] text-muted">Demanda alta</span>
          </div>
        </Panel>
      </FadeIn>

      {/* Demanda por día y hora */}
      <FadeIn>
        <Panel title="Demanda por día y hora" action={<span className="text-[11.5px] text-muted">solicitudes · promedio 30 días · 8–20 h</span>}>
          <HeatCalendar
            rows={7} cols={12} rowLabels={DIAS} colLabels={HORAS}
            metrics={[
              { label: 'Solicitudes', value: demanda, format: v => `${v} solicitudes` },
              { label: 'Cancelaciones', value: cancelaciones, format: v => `${v} cancelaciones` },
            ]}
          />
        </Panel>
      </FadeIn>

      {/* Cold zones */}
      <FadeIn>
        <Panel title="Zonas frías · alta demanda con baja oferta" action={<span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1 text-[11.5px] font-semibold text-warning"><Snowflake size={11} />Expandir red</span>}>
          <div className="grid grid-cols-3 gap-4">
            {COLD_ZONES.map(z => (
              <div key={z.name} className="rounded-xl border border-warning/30 bg-warning/[0.06] p-4">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="text-warning" size={16} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-semibold text-navy">{z.name}</div>
                    <div className="text-[11px] text-muted">{z.city}</div>
                  </div>
                  <span className="rounded-full bg-error/10 px-2.5 py-1 font-mono text-[11px] font-bold text-error">{z.ratio}</span>
                </div>
                <p className="my-2.5 text-[12px] leading-relaxed text-muted">{z.note}</p>
                <div className="flex justify-between border-t border-warning/20 pt-2.5">
                  <div>
                    <div className="font-display text-lg font-bold leading-none text-navy">{z.demand}</div>
                    <div className="mt-1 text-[10px] text-faint">servicios solicitados</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg font-bold leading-none text-error">{z.techs}</div>
                    <div className="mt-1 text-[10px] text-faint">técnicos activos</div>
                  </div>
                </div>
                <GhostButton className="mt-3.5 w-full justify-center"><UserPlus size={12} className="mr-1.5" />Lanzar reclutamiento</GhostButton>
              </div>
            ))}
          </div>
        </Panel>
      </FadeIn>
    </div>
  );
}

// Colored grid heatmap of ZMG colonias (stable pseudo-random density)
function HeatMap() {
  const rows = 8, cols = 18;
  const cities = Object.keys(CITY_TINTS);
  const cells = [] as { v: number; city: string }[];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const peakA = 1 - Math.sqrt((col - 8) ** 2 + (row - 3) ** 2) / 9;
      const peakB = 1 - Math.sqrt((col - 4) ** 2 + (row - 2) ** 2) / 8;
      const cold = Math.sqrt((col - 15) ** 2 + (row - 6) ** 2) / 16;
      const v = Math.min(1, Math.max(0, Math.max(peakA, peakB) * 0.85 - cold * 0.4));
      cells.push({ v, city: cities[(row + col) % cities.length] });
    }
  }
  const colorFor = (v: number) =>
    v < 0.15 ? '#DDE7F1' : v < 0.35 ? '#B2CCE3' : v < 0.55 ? '#5CB7F0' : v < 0.75 ? '#0A6BCF' : '#0E2C56';

  return (
    <div className="rounded-xl border border-line bg-surface-2 p-3">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {cells.map((c, i) => (
          <div key={i} className="aspect-square rounded-[3px] transition-transform hover:scale-110" style={{ background: colorFor(c.v) }} title={`${c.city} · demanda ${(c.v * 100).toFixed(0)}%`} />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        {Object.entries(CITY_TINTS).map(([city, color]) => (
          <span key={city} className="inline-flex items-center gap-1.5 text-[11px] text-muted">
            <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: color }} />{city}
          </span>
        ))}
      </div>
    </div>
  );
}
