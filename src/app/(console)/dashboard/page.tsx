'use client';

import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ShieldAlert,
  Clock,
  Activity,
  CheckCircle2,
  DollarSign,
  Wrench,
} from 'lucide-react';
import {
  PageHeading,
  Panel,
  StatCard,
  StatusPill,
  DataTable,
} from '@/components/admin';
import {
  CountUp,
  Donut,
  LineChart,
  HBars,
  STATUS_DONUT,
} from '@/components/charts';
import { FadeIn, Stagger, StaggerItem } from '@/components/motion';
import { Avatar, Skeleton } from '@/components/ui';
import {
  useTick,
  useWorldReady,
  getMetrics,
  getAllRequests,
  getAllPayments,
  getAllDisputes,
  getPendingKyc,
  getProfile,
  getCategories,
} from '@/lib/data/store';
import type { Column } from '@/components/admin';

const CAT_COLORS = ['#0A6BCF', '#0894EA', '#18C1FF', '#5CB7F0', '#9AD3F5'];

type Row = {
  id: string;
  cliente: string;
  tecnico: string;
  categoria: string;
  status: string;
  zona: string;
  total: number | null;
};

const WEEK_MS = 7 * 24 * 3600 * 1000;

/** Lunes 00:00 de la semana de `d`. */
function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

/** GMV pagado por semana (pesos) para `n` semanas terminando en la actual, con offset en semanas. */
function weeklyGmv(
  payments: { status: string; paid_at: string | null; amount_cents: number }[],
  n: number,
  offsetWeeks = 0,
) {
  const thisWeek = startOfWeek(new Date()).getTime() - offsetWeeks * WEEK_MS;
  return Array.from({ length: n }, (_, i) => {
    const from = thisWeek - (n - 1 - i) * WEEK_MS;
    const inWeek = payments.filter(p => {
      if (p.status !== 'paid' || !p.paid_at) return false;
      const t = new Date(p.paid_at).getTime();
      return t >= from && t < from + WEEK_MS;
    });
    return {
      label: new Date(from).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
      }),
      value: Math.round(inWeek.reduce((s, p) => s + p.amount_cents, 0) / 100),
      count: inWeek.length,
    };
  });
}

const relTime = (iso: string) => {
  const min = Math.max(
    0,
    Math.round((Date.now() - new Date(iso).getTime()) / 60000),
  );
  if (min < 60) return `hace ${min} min`;
  if (min < 60 * 24) return `hace ${Math.round(min / 60)} h`;
  return `hace ${Math.round(min / 1440)} d`;
};

function SkeletonRows({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-10 w-72" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  useTick();
  const router = useRouter();
  const ready = useWorldReady();
  const m = getMetrics();
  const cats = getCategories();
  const catName = (id: string) => cats.find(c => c.id === id)?.name ?? '—';

  const rows: Row[] = getAllRequests()
    .slice(0, 9)
    .map(r => ({
      id: r.id,
      cliente: getProfile(r.client_id)?.full_name ?? 'Cliente',
      tecnico: r.technician_id
        ? (getProfile(r.technician_id)?.full_name ?? '—')
        : '— sin asignar',
      categoria: catName(r.category_id),
      status: r.status,
      zona: r.municipality ?? '—',
      total: r.quoted_total_cents != null ? r.quoted_total_cents / 100 : null,
    }));

  const columns: Column<Row>[] = [
    {
      key: 'id',
      header: 'Servicio',
      render: r => (
        <span className="font-mono text-[12.5px] text-primary">
          #{r.id.slice(0, 8)}
        </span>
      ),
    },
    {
      key: 'cliente',
      header: 'Cliente',
      render: r => (
        <div className="flex items-center gap-2">
          <Avatar
            initials={r.cliente
              .split(' ')
              .map(w => w[0])
              .slice(0, 2)
              .join('')}
            size={26}
          />
          <span>{r.cliente}</span>
        </div>
      ),
    },
    { key: 'tecnico', header: 'Técnico', render: r => r.tecnico },
    {
      key: 'categoria',
      header: 'Categoría',
      render: r => <span className="text-muted">{r.categoria}</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      render: r => <StatusPill status={r.status} />,
    },
    {
      key: 'zona',
      header: 'Zona',
      render: r => <span className="text-muted">{r.zona}</span>,
    },
    {
      key: 'total',
      header: 'Total',
      className: 'text-right',
      render: r => (
        <span className="font-mono">
          {r.total != null ? `$${r.total.toLocaleString('es-MX')}` : '—'}
        </span>
      ),
    },
  ];

  const breakdown = m.byCategory.map((c, i) => ({
    name: c.name,
    value: c.services,
    color: CAT_COLORS[i % CAT_COLORS.length],
  }));

  // GMV semanal real: 12 semanas desde payments.paid_at, + comparativa del periodo anterior.
  const payments = getAllPayments();
  const gmvSerie = weeklyGmv(payments, 12).map(s => ({
    label: s.label,
    value: s.value,
    meta: `${s.count} servicio${s.count === 1 ? '' : 's'} pagado${s.count === 1 ? '' : 's'}`,
  }));
  const gmvPrev = weeklyGmv(payments, 12, 12).map(s => s.value);
  const gmvPesos = Math.round(m.gmv / 100);

  // Alertas operativas derivadas del mundo vivo.
  const STUCK_MIN = 45;
  const stuck = getAllRequests().filter(
    r =>
      ['enroute', 'onsite', 'working'].includes(r.status) &&
      Date.now() - new Date(r.updated_at).getTime() > STUCK_MIN * 60000,
  );
  const openDisputes = getAllDisputes().filter(
    d => d.status === 'open' || d.status === 'in_review',
  );
  const pendingKyc = getPendingKyc();
  const alerts = [
    ...stuck.slice(0, 3).map(r => ({
      tone: 'warn' as const,
      icon: AlertTriangle,
      text: `Servicio #${r.id.slice(0, 8)} atorado en "${r.status}"`,
      time: relTime(r.updated_at),
    })),
    ...openDisputes.slice(0, 3).map(d => ({
      tone: 'err' as const,
      icon: ShieldAlert,
      text: `Disputa abierta en #${d.service_order_id.slice(0, 8)} · ${getProfile(d.opened_by)?.full_name ?? 'Usuario'}`,
      time: relTime(d.created_at),
    })),
    ...(pendingKyc.length
      ? [
          {
            tone: 'warn' as const,
            icon: Clock,
            text: `${pendingKyc.length} KYC pendiente${pendingKyc.length === 1 ? '' : 's'} de revisión`,
            time: 'ahora',
          },
        ]
      : []),
  ];

  // Pipeline vivo: byStatus agrupado en 4 estados (se actualiza con useTick).
  const bs = m.byStatus;
  const sum = (...keys: string[]) => keys.reduce((s, k) => s + (bs[k] ?? 0), 0);
  const pipeline = [
    {
      key: 'done',
      label: 'Completados',
      value: sum('completed', 'paid', 'closed'),
      color: STATUS_DONUT.success,
    },
    {
      key: 'active',
      label: 'En curso',
      value: sum(
        'accepted',
        'enroute',
        'onsite',
        'quote',
        'working',
        'closing',
      ),
      color: STATUS_DONUT.primary,
    },
    {
      key: 'pending',
      label: 'Pendientes',
      value: sum('requested'),
      color: STATUS_DONUT.warning,
    },
    {
      key: 'cancelled',
      label: 'Cancelados',
      value: sum('cancelled', 'expired'),
      color: STATUS_DONUT.error,
    },
  ];

  if (!ready) return <SkeletonRows />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Panel de control"
        sub="Resumen operativo en tiempo real · Zona Metropolitana de Guadalajara"
      />

      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <StatCard
            index={0}
            icon={Activity}
            live
            href="/servicios"
            label="Servicios activos ahora"
            value={<CountUp value={m.active} />}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            index={1}
            icon={CheckCircle2}
            href="/servicios"
            label="Completados"
            value={<CountUp value={m.completedToday} />}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            index={2}
            icon={DollarSign}
            href="/finanzas"
            label="GMV acumulado"
            value={<CountUp value={gmvPesos} prefix="$" />}
            suffix="MXN"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            index={3}
            icon={Wrench}
            href="/tecnicos"
            label="Técnicos activos"
            value={
              <CountUp value={m.activeTechs} suffix={`/${m.totalTechs}`} />
            }
            progress={m.totalTechs ? m.activeTechs / m.totalTechs : 0}
            note={`${Math.round((m.activeTechs / Math.max(m.totalTechs, 1)) * 100)}% disponibles`}
          />
        </StaggerItem>
      </Stagger>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <FadeIn className="min-w-0 lg:col-span-7">
          <Panel
            title="GMV semanal · 12 semanas"
            action={
              <span className="text-[12px] text-faint">
                Semana en curso en vivo
              </span>
            }
          >
            <LineChart
              data={gmvSerie}
              height={230}
              format={v => `$${v.toLocaleString('es-MX')}`}
              controls={{
                ranges: [
                  { label: '4 sem', n: 4 },
                  { label: '8 sem', n: 8 },
                  { label: '12 sem', n: 12 },
                ],
                avg: true,
                compare: { label: 'Periodo anterior', values: gmvPrev },
              }}
            />
          </Panel>
        </FadeIn>

        <FadeIn className="min-w-0 lg:col-span-5">
          <Panel
            title="Pipeline por estado"
            action={
              <span className="text-[12px] text-faint">
                {m.totalRequests} servicios
              </span>
            }
          >
            <Donut parts={pipeline} centerLabel="servicios" />
          </Panel>
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <FadeIn className="min-w-0">
          <Panel
            title="Servicios recientes"
            action={
              <a
                href="/servicios"
                className="text-[12px] font-semibold text-primary hover:text-primary-2"
              >
                Ver todos
              </a>
            }
          >
            {rows.length ? (
              <DataTable
                columns={columns}
                rows={rows}
                onRowClick={r => router.push(`/servicios/${r.id}`)}
              />
            ) : (
              <p className="py-8 text-center text-[13px] text-muted">
                Aún no hay servicios registrados.
              </p>
            )}
          </Panel>
        </FadeIn>

        <div className="flex min-w-0 flex-col gap-6">
          <FadeIn>
            <Panel
              title="Alertas operativas"
              action={
                <span
                  className={`text-[12px] font-semibold ${alerts.length ? 'text-error' : 'text-faint'}`}
                >
                  {alerts.length ? `${alerts.length} activas` : 'sin alertas'}
                </span>
              }
            >
              <div className="flex flex-col gap-2.5">
                {alerts.length === 0 && (
                  <p className="py-4 text-center text-[13px] text-muted">
                    Todo en orden por ahora.
                  </p>
                )}
                {alerts.map((a, i) => {
                  const Icon = a.icon;
                  const isErr = a.tone === 'err';
                  return (
                    <div
                      key={i}
                      className={`flex gap-3 rounded-xl border p-3 ${isErr ? 'border-error/25 bg-error-soft/50' : 'border-warning/25 bg-warning-soft/50'}`}
                    >
                      <Icon
                        size={18}
                        className={isErr ? 'text-error' : 'text-warning'}
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[12.5px] leading-snug text-navy">
                          {a.text}
                        </span>
                        <span className="text-[11px] text-faint">{a.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </FadeIn>

          <FadeIn>
            <Panel
              title="Servicios por categoría"
              action={
                <span className="text-[12px] text-faint">
                  {m.totalRequests} en total
                </span>
              }
            >
              {breakdown.length ? (
                <HBars
                  rows={breakdown.map(b => ({ label: b.name, value: b.value }))}
                  showPct
                />
              ) : (
                <p className="py-4 text-center text-[13px] text-muted">
                  Sin servicios por categoría aún.
                </p>
              )}
            </Panel>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
