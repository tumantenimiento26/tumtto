'use client';

import { useState } from 'react';
import {
  MapPin, Map as MapIcon, Layers, HardHat, Flame, Hexagon, Plus, Minus,
  LocateFixed, Users, AlertTriangle, CheckCircle2, Globe, Pencil,
} from 'lucide-react';
import { PageHeading, Panel, StatCard, DataTable, type Column } from '@/components/admin';
import { Chip, Badge, GhostButton, PrimaryButton } from '@/components/ui';
import { FadeIn, Stagger, StaggerItem, motion } from '@/components/motion';
import { useTick, getCoverage, getTechniciansWithProfile } from '@/lib/demo/store';

type Zone = {
  id: string;
  name: string;
  status: 'ok' | 'warn';
  colonias: number;
  covered: number;
  techs: number;
  jobs: number;
  gaps: string[];
  pin: { x: number; y: number };
};

const ZONES: Zone[] = [
  { id: 'zap', name: 'Zapopan', status: 'ok', colonias: 198, covered: 194, techs: 318, jobs: 1084, gaps: ['Loma Bonita Ejidal', 'Real de la Loma'], pin: { x: 230, y: 180 } },
  { id: 'gdl', name: 'Guadalajara', status: 'ok', colonias: 245, covered: 240, techs: 412, jobs: 1462, gaps: ['Oblatos', 'San Andrés'], pin: { x: 470, y: 250 } },
  { id: 'tlaq', name: 'Tlaquepaque', status: 'ok', colonias: 124, covered: 118, techs: 142, jobs: 612, gaps: ['Las Juntas', 'El Órgano'], pin: { x: 560, y: 360 } },
  { id: 'tlaj', name: 'Tlajomulco de Zúñiga', status: 'warn', colonias: 64, covered: 41, techs: 48, jobs: 188, gaps: ['Santa Fe', 'Chulavista', 'Hacienda Sta. Fe', 'El Zapote'], pin: { x: 360, y: 460 } },
];

const ZONE_STATUS: Record<Zone['status'], 'success' | 'warning'> = { ok: 'success', warn: 'warning' };

export default function RegionesPage() {
  useTick();
  const coverage = getCoverage();
  const techs = getTechniciansWithProfile();
  const [selected, setSelected] = useState<string>('zap');

  const totalColonias = ZONES.reduce((s, z) => s + z.colonias, 0);
  const totalCovered = ZONES.reduce((s, z) => s + z.covered, 0);
  const totalTechs = ZONES.reduce((s, z) => s + z.techs, 0);
  const totalGaps = ZONES.reduce((s, z) => s + (z.colonias - z.covered), 0);
  const covPct = Math.round((totalCovered / totalColonias) * 100);
  const active = ZONES.find((z) => z.id === selected) ?? ZONES[0];

  // technicians whose live coverage touches the selected region
  const zoneTechs = techs.filter((t) =>
    coverage.some((c) => c.technician_id === t.tech.user_id),
  );

  const techCols: Column<(typeof techs)[number]>[] = [
    {
      key: 'tech',
      header: 'Técnico',
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-info-soft text-primary">
            <HardHat size={14} />
          </span>
          <span className="font-medium text-navy">{r.profile?.full_name ?? r.tech.user_id}</span>
        </div>
      ),
    },
    { key: 'radius', header: 'Radio', render: () => <span className="font-mono text-[12px] text-muted">10 km</span> },
    {
      key: 'avail',
      header: 'Estado',
      render: (r) => (
        <Badge tone={r.tech.is_available ? 'success' : 'neutral'}>
          {r.tech.is_available ? 'Disponible' : 'Inactivo'}
        </Badge>
      ),
    },
    { key: 'zone', header: 'Zona base', render: () => <span className="text-muted">ZMG · Zapopan</span> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Regiones y cobertura"
        sub="Zona Metropolitana de Guadalajara · técnicos asignados, cobertura y zonas con brechas."
        actions={
          <div className="flex gap-2">
            <GhostButton>Importar GeoJSON</GhostButton>
            <PrimaryButton>Nueva zona</PrimaryButton>
          </div>
        }
      />

      {/* Stat cards */}
      <Stagger className="grid grid-cols-4 gap-4">
        <StaggerItem><StatCard index={0} label="Cobertura ZMG" value={`${covPct}%`} progress={covPct / 100} note={`${totalCovered}/${totalColonias} colonias`} icon={Hexagon} /></StaggerItem>
        <StaggerItem><StatCard index={1} label="Técnicos en operación" value={totalTechs.toLocaleString('es-MX')} delta="+24" trend="up" note="vs. mes anterior" icon={Users} /></StaggerItem>
        <StaggerItem><StatCard index={2} label="Zonas activas" value={`${ZONES.filter((z) => z.status === 'ok').length}/${ZONES.length}`} note="1 zona parcial" icon={MapPin} /></StaggerItem>
        <StaggerItem><StatCard index={3} label="Colonias con brecha" value={totalGaps} note="sin cobertura suficiente" icon={AlertTriangle} /></StaggerItem>
      </Stagger>

      {/* Map + zone list */}
      <div className="grid grid-cols-[1fr_380px] gap-6">
        {/* Map placeholder */}
        <FadeIn>
          <Panel
            title="Mapa de cobertura · ZMG"
            action={
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[12.5px] font-semibold text-white shadow-card hover:bg-primary-2">
                <Pencil size={13} /> Editar polígonos
              </button>
            }
          >
            <div className="relative h-[520px] w-full overflow-hidden rounded-xl border border-line bg-grad-brand">
              {/* grid overlay */}
              <div
                className="absolute inset-0 opacity-[0.18]"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />
              <svg viewBox="0 0 760 520" className="absolute inset-0 h-full w-full">
                {/* ZMG blob */}
                <path
                  d="M120 120 Q 260 70 420 110 Q 560 140 600 260 Q 620 380 480 440 Q 320 480 200 420 Q 90 360 90 240 Z"
                  fill="rgba(255,255,255,0.22)"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="2"
                />
                {ZONES.map((z) => {
                  const sel = z.id === selected;
                  return (
                    <g
                      key={z.id}
                      transform={`translate(${z.pin.x},${z.pin.y})`}
                      onClick={() => setSelected(z.id)}
                      className="cursor-pointer"
                    >
                      <circle r={sel ? 30 : 22} fill={z.status === 'warn' ? 'rgba(245,158,11,.28)' : 'rgba(255,255,255,.30)'} />
                      <motion.circle
                        r={sel ? 12 : 9}
                        fill="#fff"
                        stroke={z.status === 'warn' ? '#F59E0B' : '#0A6BCF'}
                        strokeWidth="3"
                        animate={{ scale: sel ? [1, 1.12, 1] : 1 }}
                        transition={{ repeat: sel ? Infinity : 0, duration: 1.8 }}
                      />
                      <text x="0" y={-(sel ? 30 : 24)} textAnchor="middle" className="font-display" fontSize="13" fontWeight="700" fill="#fff">
                        {z.name}
                      </text>
                      <text x="0" y={-(sel ? 16 : 10)} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,.85)">
                        {z.techs} téc · {Math.round((z.covered / z.colonias) * 100)}%
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* layers panel */}
              <div className="absolute right-4 top-4 w-56 rounded-xl border border-line bg-white/95 p-3 shadow-hover backdrop-blur">
                <div className="flex items-center gap-2 border-b border-line pb-2 text-[12px] font-semibold text-navy">
                  <Layers size={14} /> Capas
                </div>
                {[
                  { icon: HardHat, color: 'text-primary', label: 'Técnicos activos', sub: `${totalTechs} técnicos` },
                  { icon: Flame, color: 'text-warning', label: 'Demanda semanal', sub: '3,346 servicios' },
                  { icon: Hexagon, color: 'text-success', label: 'Polígonos de colonia', sub: `${ZONES.length} zonas` },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-2.5 py-2">
                    <span className={`grid h-7 w-7 place-items-center rounded-lg bg-info-soft ${l.color}`}>
                      <l.icon size={13} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-semibold text-navy">{l.label}</div>
                      <div className="text-[10.5px] text-faint">{l.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* zoom controls */}
              <div className="absolute bottom-4 left-4 flex flex-col overflow-hidden rounded-lg border border-line bg-white shadow-card">
                <button className="grid h-9 w-9 place-items-center border-b border-line text-navy hover:bg-surface"><Plus size={15} /></button>
                <button className="grid h-9 w-9 place-items-center border-b border-line text-navy hover:bg-surface"><Minus size={15} /></button>
                <button className="grid h-9 w-9 place-items-center text-primary hover:bg-surface"><LocateFixed size={15} /></button>
              </div>

              <div className="absolute bottom-4 right-4 rounded-md bg-white/85 px-3 py-1.5 font-mono text-[11px] text-navy">
                20.7° N · 103.4° W · 2 km
              </div>
            </div>
          </Panel>
        </FadeIn>

        {/* Zone list */}
        <FadeIn delay={0.05}>
          <Panel title="Zonas ZMG" action={<Chip>{ZONES.length} zonas</Chip>}>
            <div className="flex flex-col gap-2.5">
              {ZONES.map((z) => {
                const pct = Math.round((z.covered / z.colonias) * 100);
                const sel = z.id === selected;
                return (
                  <button
                    key={z.id}
                    onClick={() => setSelected(z.id)}
                    className={`rounded-xl border p-3.5 text-left transition ${
                      sel ? 'border-primary bg-info-soft' : 'border-line bg-white hover:bg-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin size={15} className={z.status === 'warn' ? 'text-warning' : 'text-primary'} />
                        <span className="font-semibold text-navy">{z.name}</span>
                      </div>
                      <Badge tone={ZONE_STATUS[z.status]}>{z.status === 'ok' ? 'Activa' : 'Parcial'}</Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[12px] text-muted">
                      <span><span className="font-mono text-navy">{z.techs}</span> técnicos</span>
                      <span><span className="font-mono text-navy">{z.colonias}</span> colonias</span>
                      <span className={pct < 80 ? 'text-warning' : 'text-success'}>{pct}% cobertura</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                      <div className={`h-full rounded-full ${pct < 80 ? 'bg-warning' : 'bg-grad-progress'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </Panel>
        </FadeIn>
      </div>

      {/* Detail row: gaps + assigned techs */}
      <div className="grid grid-cols-[380px_1fr] gap-6">
        <FadeIn>
          <Panel title={`Brechas de cobertura · ${active.name}`}>
            <p className="mb-3 text-[12.5px] text-muted">
              Colonias sin técnicos suficientes para la demanda registrada.
            </p>
            <div className="flex flex-col gap-2">
              {active.gaps.map((g) => (
                <div key={g} className="flex items-center justify-between rounded-lg border border-line bg-surface px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-warning" />
                    <span className="text-[13px] text-navy">{g}</span>
                  </div>
                  <Badge tone="warning">Sin cobertura</Badge>
                </div>
              ))}
              {active.gaps.length === 0 && (
                <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 text-[13px] text-success">
                  <CheckCircle2 size={14} /> Cobertura completa
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-info-soft px-3 py-2.5 text-[12px] text-primary">
              <Globe size={14} /> {active.covered}/{active.colonias} colonias cubiertas · {active.jobs.toLocaleString('es-MX')} servicios/sem
            </div>
          </Panel>
        </FadeIn>

        <FadeIn delay={0.05}>
          <Panel title={`Técnicos asignados · ${active.name}`} action={<Chip>{zoneTechs.length} en zona</Chip>}>
            <DataTable
              columns={techCols}
              rows={zoneTechs}
              empty="Sin técnicos con cobertura en esta zona"
            />
          </Panel>
        </FadeIn>
      </div>
    </div>
  );
}
