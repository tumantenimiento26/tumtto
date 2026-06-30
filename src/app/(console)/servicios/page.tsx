'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, FolderTree, Download, Plus, Activity, TrendingUp } from 'lucide-react';
import {
  PageHeading,
  Panel,
  StatCard,
  StatusPill,
  DataTable,
  type Column,
} from '@/components/admin';
import { PrimaryButton, GhostButton, Chip, Avatar, Input, Skeleton } from '@/components/ui';
import { FadeIn } from '@/components/motion';
import {
  useTick,
  getMetrics,
  getAllRequests,
  getProfile,
  getCategories,
  getSubcategories,
} from '@/lib/demo/store';
import type { ServiceRequest } from '@/lib/demo/world';

const STATUS_LABELS: Record<string, string> = {
  solicitado: 'Solicitados',
  aceptado: 'Aceptados',
  en_camino: 'En camino',
  en_sitio: 'En sitio',
  en_ejecucion: 'En ejecución',
  completado: 'Completados',
  pagado: 'Pagados',
  calificado: 'Calificados',
  cancelado: 'Cancelados',
  rechazado: 'Rechazados',
};

const fmtMoney = (n: number | null) =>
  n == null
    ? '—'
    : new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);

const fmtDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '—';

const initials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase();

interface Row {
  req: ServiceRequest;
  clientName: string;
  techName: string | null;
  categoryName: string;
}

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

export default function ServiciosPage() {
  useTick();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 450);
    return () => clearTimeout(t);
  }, []);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const metrics = getMetrics();
  const byStatus = metrics.byStatus;

  const subToCategory = useMemo(() => {
    const cats = getCategories();
    const map: Record<string, string> = {};
    for (const sub of getSubcategories()) {
      map[sub.id] = cats.find(c => c.id === sub.category_id)?.name ?? '—';
    }
    return map;
  }, []);

  const rows: Row[] = useMemo(() => {
    return getAllRequests().map(req => ({
      req,
      clientName: getProfile(req.client_id)?.full_name ?? 'Cliente',
      techName: req.technician_id ? getProfile(req.technician_id)?.full_name ?? null : null,
      categoryName: subToCategory[req.subcategory_id] ?? '—',
    }));
  }, [subToCategory]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r => {
      if (statusFilter && r.req.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.req.id.toLowerCase().includes(q) ||
        r.clientName.toLowerCase().includes(q) ||
        (r.techName ?? '').toLowerCase().includes(q) ||
        r.categoryName.toLowerCase().includes(q)
      );
    });
  }, [rows, query, statusFilter]);

  const statusOrder = Object.keys(STATUS_LABELS).filter(s => byStatus[s] > 0);
  const topStatuses = statusOrder.slice(0, 4);

  const columns: Column<Row>[] = [
    {
      key: 'id',
      header: 'ID',
      render: r => <span className="font-mono text-[12.5px] font-medium text-primary">#{r.req.id}</span>,
    },
    {
      key: 'cliente',
      header: 'Cliente',
      render: r => (
        <div className="flex items-center gap-2.5">
          <Avatar initials={initials(r.clientName)} size={28} />
          <span className="font-medium text-navy">{r.clientName}</span>
        </div>
      ),
    },
    {
      key: 'tecnico',
      header: 'Técnico',
      render: r =>
        r.techName ? (
          <div className="flex items-center gap-2.5">
            <Avatar initials={initials(r.techName)} size={28} />
            <span className="font-medium text-navy">{r.techName}</span>
          </div>
        ) : (
          <span className="text-[12.5px] italic text-faint">— sin asignar</span>
        ),
    },
    {
      key: 'categoria',
      header: 'Categoría',
      render: r => <span className="text-[12.5px] text-navy">{r.categoryName}</span>,
    },
    {
      key: 'estado',
      header: 'Estado',
      render: r => <StatusPill status={r.req.status} />,
    },
    {
      key: 'fecha',
      header: 'Programado',
      render: r => <span className="font-mono text-[12px] text-muted">{fmtDate(r.req.scheduled_at)}</span>,
    },
    {
      key: 'total',
      header: 'Total',
      className: 'text-right',
      render: r => (
        <span className="font-mono text-[13px] font-semibold text-navy">
          {fmtMoney(r.req.total_price ?? r.req.base_price)}
        </span>
      ),
    },
  ];

  if (!ready) return <SkeletonRows />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Servicios"
        sub="Operación en tiempo real y histórico completo · ZMG"
        actions={
          <div className="flex gap-2.5">
            <GhostButton>
              <Download size={14} className="mr-2" />
              Exportar
            </GhostButton>
            <PrimaryButton>
              <Plus size={14} className="mr-2" />
              Crear servicio
            </PrimaryButton>
          </div>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        {topStatuses.map((s, i) => (
          <StatCard
            key={s}
            index={i}
            label={STATUS_LABELS[s]}
            value={byStatus[s].toLocaleString('es-MX')}
            note={`${((byStatus[s] / metrics.totalRequests) * 100).toFixed(0)}% del total`}
          />
        ))}
      </div>

      <FadeIn>
        <Panel>
          <div className="mb-4 flex flex-wrap items-center gap-2.5">
            <div className="flex h-9 max-w-[300px] flex-1 items-center rounded-lg border border-line bg-surface px-3">
              <Search size={14} className="text-faint" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="ID servicio, cliente o técnico"
                className="h-full flex-1 border-none bg-transparent px-2.5 text-[13px] shadow-none focus:ring-0"
              />
            </div>
            <Chip active={!statusFilter} onClick={() => setStatusFilter(null)}>
              Todos · {metrics.totalRequests}
            </Chip>
            {statusOrder.map(s => (
              <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
                {STATUS_LABELS[s]} · {byStatus[s]}
              </Chip>
            ))}
            <span className="ml-auto flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-navy">
              <Calendar size={14} className="text-primary" />
              Hoy · 27/06
            </span>
            <span className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-navy">
              <FolderTree size={14} className="text-primary" />
              Categoría: todas
            </span>
          </div>

          <div className="mb-4 flex items-center gap-3.5 rounded-xl border border-primary/20 bg-info-soft px-4 py-2.5">
            <Activity size={14} className="text-success" />
            <span className="text-[13px] text-navy">
              <b className="font-bold">{metrics.active}</b> servicios en curso ahora mismo
            </span>
            <span className="flex items-center gap-1 text-[12.5px] text-muted">
              <TrendingUp size={12} className="text-success" />
              +18% vs ayer
            </span>
            <span className="ml-auto font-mono text-[11.5px] text-faint">
              Mostrando {filtered.length} de {metrics.totalRequests}
            </span>
          </div>

          <DataTable
            columns={columns}
            rows={filtered}
            onRowClick={r => router.push(`/servicios/${r.req.id}`)}
            empty="Sin servicios para los filtros seleccionados"
          />
        </Panel>
      </FadeIn>
    </div>
  );
}
