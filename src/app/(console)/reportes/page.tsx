'use client';

import { useMemo, useState } from 'react';
import {
  CalendarRange, ChevronDown, Download, Link2, Star, TrendingUp,
  AlertTriangle, MapPin, HardHat, Snowflake, UserPlus,
} from 'lucide-react';
import { PageHeading, Panel, StatCard, DataTable, BarChart, BreakdownBars, type Column } from '@/components/admin';
import { Avatar, Chip, GhostButton, PrimaryButton } from '@/components/ui';
import { FadeIn, Stagger, StaggerItem } from '@/components/motion';
import { getTechniciansWithProfile, getMetrics, getCategoriesWithCounts, useTick } from '@/lib/demo/store';

const RANGES = ['7 días', '30 días', 'Trimestre', 'Año', 'Personalizado'];

// ── Mock series (prototype is fully mocked) ──────────────────────────────────
const SVC_MONTHLY = [
  { label: 'Dic', value: 312 }, { label: 'Ene', value: 358 }, { label: 'Feb', value: 401 },
  { label: 'Mar', value: 447 }, { label: 'Abr', value: 489 }, { label: 'May', value: 542 },
];
const GMV_MONTHLY = [
  { label: 'Dic', value: 313 }, { label: 'Ene', value: 352 }, { label: 'Feb', value: 398 },
  { label: 'Mar', value: 431 }, { label: 'Abr', value: 468 }, { label: 'May', value: 498 },
];

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
  const [range, setRange] = useState('30 días');

  const metrics = getMetrics();
  const cats = getCategoriesWithCounts();

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

  const breakdown = cats
    .map((c, i) => ({ name: c.name, value: c.services, color: ['#0A6BCF', '#0894EA', '#18C1FF', '#5CB7F0', '#0E2C56'][i % 5] }))
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
              <span className="text-[12.5px] font-medium text-navy">01/12/2025 – 19/05/2026</span>
              <ChevronDown className="text-faint" size={13} />
            </div>
            <GhostButton><Link2 size={14} className="mr-2" />Compartir link</GhostButton>
            <PrimaryButton><Download size={14} className="mr-2" />Exportar PDF</PrimaryButton>
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
        <StaggerItem><StatCard index={0} label="GMV del periodo" value="$498K" delta="+18% MoM" trend="up" note="Crecimiento sostenido" icon={TrendingUp} /></StaggerItem>
        <StaggerItem><StatCard index={1} label="Servicios completados" value={metrics.completedToday} suffix="serv." delta="+11%" trend="up" note="vs. periodo anterior" /></StaggerItem>
        <StaggerItem><StatCard index={2} label="Comisión plataforma" value={fmtMXN(metrics.platformFee)} delta="+18% MoM" trend="up" note="Take rate 12%" /></StaggerItem>
        <StaggerItem><StatCard index={3} label="Técnicos activos" value={metrics.activeTechs} suffix={`/ ${metrics.totalTechs}`} note="Cobertura ZMG 86%" icon={HardHat} /></StaggerItem>
      </Stagger>

      {/* Two charts */}
      <div className="grid grid-cols-2 gap-6">
        <FadeIn>
          <Panel title="Volumen de servicios · últimos 6 meses" action={<span className="inline-flex items-center gap-1 rounded-full bg-info-soft px-2.5 py-1 text-[11.5px] font-semibold text-success"><TrendingUp size={11} />+11% MoM</span>}>
            <div className="pt-2"><BarChart data={SVC_MONTHLY} height={200} /></div>
          </Panel>
        </FadeIn>
        <FadeIn>
          <Panel title="Ingresos (GMV) · últimos 6 meses" action={<span className="inline-flex items-center gap-1 rounded-full bg-info-soft px-2.5 py-1 text-[11.5px] font-semibold text-success"><TrendingUp size={11} />+18% MoM</span>}>
            <div className="pt-2"><BarChart data={GMV_MONTHLY} height={200} color="#0894EA" /></div>
          </Panel>
        </FadeIn>
      </div>

      {/* Category breakdown + top techs */}
      <div className="grid grid-cols-[380px_1fr] gap-6">
        <FadeIn>
          <Panel title="Desempeño por categoría" action={<span className="text-[11.5px] text-muted">servicios</span>}>
            <div className="pt-2"><BreakdownBars data={breakdown} /></div>
          </Panel>
        </FadeIn>
        <FadeIn>
          <Panel title="Top técnicos · este mes" action={<GhostButton><Download size={12} className="mr-1.5" />CSV</GhostButton>}>
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
