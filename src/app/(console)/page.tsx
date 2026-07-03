'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ShieldAlert, CreditCard, UserX, Clock, Activity, CheckCircle2, DollarSign, Wrench } from 'lucide-react';
import { PageHeading, Panel, StatCard, StatusPill, DataTable, BreakdownBars } from '@/components/admin';
import { CountUp, Donut, LineChart, STATUS_DONUT } from '@/components/charts';
import { FadeIn, Stagger, StaggerItem } from '@/components/motion';
import { Avatar, Skeleton } from '@/components/ui';
import { useTick, getMetrics, getAllRequests, getAllPayments, getProfile, getSubcategories } from '@/lib/demo/store';
import type { Column } from '@/components/admin';

const CAT_COLORS = ['#0A6BCF', '#0894EA', '#18C1FF', '#5CB7F0', '#9AD3F5'];

// ponytail: serie histórica demo — 11 semanas sembradas; la 12.ª es el GMV vivo.
const GMV_SEMANAS = [
  { label: '13 abr', value: 980 }, { label: '20 abr', value: 1120 }, { label: '27 abr', value: 1050 },
  { label: '04 may', value: 1290 }, { label: '11 may', value: 1180 }, { label: '18 may', value: 1420 },
  { label: '25 may', value: 1360 }, { label: '01 jun', value: 1510 }, { label: '08 jun', value: 1465 },
  { label: '15 jun', value: 1580 }, { label: '22 jun', value: 1540 },
];

// ponytail: sparklines de demo — 8 puntos estáticos por KPI.
const SPARKS = {
  activos: [3, 4, 4, 6, 5, 7, 6, 8],
  completados: [2, 3, 5, 4, 6, 6, 7, 9],
  gmv: [820, 940, 880, 1120, 1050, 1310, 1280, 1640],
  tecnicos: [4, 4, 5, 5, 6, 6, 6, 7],
};

const ALERTS = [
  { tone: 'warn', icon: AlertTriangle, text: 'Servicio #SVC-2847 atorado en "en camino" hace 45 min', time: 'hace 45 min' },
  { tone: 'err', icon: ShieldAlert, text: 'Disputa abierta en #SVC-2812 · Cliente: María Rodríguez', time: 'hace 1 h 20 min' },
  { tone: 'err', icon: CreditCard, text: 'Pago OXXO fallido en #SVC-2799 · Reintentar antes de 18:00', time: 'hace 2 h' },
  { tone: 'warn', icon: UserX, text: 'Técnico Ramón Hernández · 3 cancelaciones esta semana', time: 'hoy' },
  { tone: 'warn', icon: Clock, text: '5 KYC pendientes de revisión hace +24 h', time: 'hace 1 d' },
] as const;

const ZONAS = ['Zapopan', 'Guadalajara', 'Tlaquepaque', 'Tonalá', 'Zapopan'];
const TECNICOS = ['Ramón Hernández', 'Diana Ortega', 'Alberto García', 'Sergio Castro', 'Ramón Hernández'];

type Row = {
  id: string;
  cliente: string;
  tecnico: string;
  categoria: string;
  status: string;
  zona: string;
  total: number | null;
};

function SkeletonRows({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-10 w-72" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  useTick();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 450);
    return () => clearTimeout(t);
  }, []);
  const m = getMetrics();
  const subs = getSubcategories();
  const subName = (id: string) => subs.find(s => s.id === id)?.name ?? '—';

  const rows: Row[] = getAllRequests().slice(0, 8).map((r, i) => ({
    id: r.id,
    cliente: getProfile(r.client_id)?.full_name ?? 'Cliente',
    tecnico: TECNICOS[i % TECNICOS.length],
    categoria: subName(r.subcategory_id),
    status: r.status,
    zona: ZONAS[i % ZONAS.length],
    total: r.total_price,
  }));

  // Enrich the table so it reads like the prototype.
  const filler: Row[] = [
    { id: 'SVC-2847', cliente: 'Laura Méndez', tecnico: 'Diana Ortega', categoria: 'Fuga de agua', status: 'en_camino', zona: 'Guadalajara', total: 720 },
    { id: 'SVC-2812', cliente: 'María Rodríguez', tecnico: 'Alberto García', categoria: 'Contactos y apagadores', status: 'cancelado', zona: 'Zapopan', total: 540 },
    { id: 'SVC-2799', cliente: 'Jorge Salas', tecnico: 'Sergio Castro', categoria: 'Reparación de drenaje', status: 'completado', zona: 'Tlaquepaque', total: 980 },
    { id: 'SVC-2788', cliente: 'Paola Reyes', tecnico: 'Ramón Hernández', categoria: 'Calentadores', status: 'en_ejecucion', zona: 'Tonalá', total: 1640 },
  ];
  const allRows = [...rows, ...filler].slice(0, 9);

  const columns: Column<Row>[] = [
    { key: 'id', header: 'Servicio', render: r => <span className="font-mono text-[12.5px] text-primary">{r.id}</span> },
    {
      key: 'cliente', header: 'Cliente', render: r => (
        <div className="flex items-center gap-2">
          <Avatar initials={r.cliente.split(' ').map(w => w[0]).slice(0, 2).join('')} size={26} />
          <span>{r.cliente}</span>
        </div>
      ),
    },
    { key: 'tecnico', header: 'Técnico', render: r => r.tecnico },
    { key: 'categoria', header: 'Categoría', render: r => <span className="text-muted">{r.categoria}</span> },
    { key: 'status', header: 'Estado', render: r => <StatusPill status={r.status} /> },
    { key: 'zona', header: 'Zona', render: r => <span className="text-muted">{r.zona}</span> },
    { key: 'total', header: 'Total', className: 'text-right', render: r => <span className="font-mono">{r.total != null ? `$${r.total.toLocaleString('es-MX')}` : '—'}</span> },
  ];

  const breakdown = m.byCategory.map((c, i) => ({ name: c.name, value: c.services, color: CAT_COLORS[i % CAT_COLORS.length] }));

  // GMV semanal: 11 semanas sembradas + semana en curso viva (gmv actual).
  const paidCount = getAllPayments().filter(p => p.status === 'paid').length;
  const gmvSerie = [
    ...GMV_SEMANAS.map(s => ({ ...s, meta: `${Math.max(1, Math.round(s.value / 820))} servicios pagados` })),
    { label: 'Esta sem.', value: m.gmv, meta: `${paidCount} servicio${paidCount === 1 ? '' : 's'} pagado${paidCount === 1 ? '' : 's'}` },
  ];

  // Pipeline vivo: byStatus agrupado en 4 estados (se actualiza con useTick).
  const bs = m.byStatus;
  const sum = (...keys: string[]) => keys.reduce((s, k) => s + (bs[k] ?? 0), 0);
  const pipeline = [
    { key: 'done', label: 'Completados', value: sum('completado', 'pagado', 'calificado'), color: STATUS_DONUT.success },
    { key: 'active', label: 'En curso', value: sum('aceptado', 'en_camino', 'en_sitio', 'en_ejecucion'), color: STATUS_DONUT.primary },
    { key: 'pending', label: 'Pendientes', value: sum('solicitado'), color: STATUS_DONUT.warning },
    { key: 'cancelled', label: 'Cancelados', value: sum('cancelado', 'rechazado'), color: STATUS_DONUT.error },
  ];

  if (!ready) return <SkeletonRows />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="Panel de control" sub="Resumen operativo en tiempo real · Zona Metropolitana de Guadalajara" />

      <Stagger className="grid grid-cols-4 gap-4">
        <StaggerItem>
          <StatCard index={0} icon={Activity} label="Servicios activos ahora" value={<CountUp value={m.active} />} spark={SPARKS.activos} delta="+12%" trend="up" note="vs ayer" />
        </StaggerItem>
        <StaggerItem>
          <StatCard index={1} icon={CheckCircle2} label="Completados hoy" value={<CountUp value={m.completedToday} />} spark={SPARKS.completados} delta="+8%" trend="up" note="vs ayer" />
        </StaggerItem>
        <StaggerItem>
          <StatCard index={2} icon={DollarSign} label="GMV del día" value={<CountUp value={m.gmv} prefix="$" />} suffix="MXN" spark={SPARKS.gmv} delta="+15%" trend="up" note="vs ayer" />
        </StaggerItem>
        <StaggerItem>
          <StatCard index={3} icon={Wrench} label="Técnicos activos" value={<CountUp value={m.activeTechs} suffix={`/${m.totalTechs}`} />} spark={SPARKS.tecnicos} progress={m.totalTechs ? m.activeTechs / m.totalTechs : 0} note={`${Math.round((m.activeTechs / Math.max(m.totalTechs, 1)) * 100)}% disponibles`} />
        </StaggerItem>
      </Stagger>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <FadeIn className="min-w-0 lg:col-span-7">
          <Panel title="GMV semanal · 12 semanas" action={<span className="text-[12px] text-faint">Semana en curso en vivo</span>}>
            <LineChart data={gmvSerie} height={230} format={v => `$${v.toLocaleString('es-MX')}`} />
          </Panel>
        </FadeIn>

        <FadeIn className="min-w-0 lg:col-span-5">
          <Panel title="Pipeline por estado" action={<span className="text-[12px] text-faint">{m.totalRequests} servicios</span>}>
            <Donut parts={pipeline} centerLabel="servicios" />
          </Panel>
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <FadeIn className="min-w-0">
          <Panel title="Servicios recientes" action={<a href="/servicios" className="text-[12px] font-semibold text-primary hover:text-primary-2">Ver todos</a>}>
            <DataTable columns={columns} rows={allRows} onRowClick={r => router.push(`/servicios/${r.id}`)} />
          </Panel>
        </FadeIn>

        <div className="flex min-w-0 flex-col gap-6">
          <FadeIn>
            <Panel title="Alertas operativas" action={<span className="text-[12px] font-semibold text-error">{ALERTS.length} activas</span>}>
              <div className="flex flex-col gap-2.5">
                {ALERTS.map((a, i) => {
                  const Icon = a.icon;
                  const isErr = a.tone === 'err';
                  return (
                    <div key={i} className={`flex gap-3 rounded-xl border p-3 ${isErr ? 'border-error/25 bg-error-soft/50' : 'border-warning/25 bg-warning-soft/50'}`}>
                      <Icon size={18} className={isErr ? 'text-error' : 'text-warning'} />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[12.5px] leading-snug text-navy">{a.text}</span>
                        <span className="text-[11px] text-faint">{a.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </FadeIn>

          <FadeIn>
            <Panel title="Servicios por categoría" action={<span className="text-[12px] text-faint">{m.totalRequests} en total</span>}>
              <BreakdownBars data={breakdown} />
            </Panel>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
