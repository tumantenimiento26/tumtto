'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Download, Filter, ShieldAlert, Star, MapPin, UserPlus, Users } from 'lucide-react';
import { PageHeading, Panel, StatCard, DataTable, exportCsv } from '@/components/admin';
import type { Column } from '@/components/admin';
import { GhostButton, Input, Chip, Avatar, Badge, Skeleton } from '@/components/ui';
import { FadeIn } from '@/components/motion';
import { toast } from '@/components/toast';
import { useTick, useWorldReady, getClients, getAllRequests, getAllDisputes } from '@/lib/data/store';

type Tone = 'success' | 'warning' | 'error' | 'info' | 'neutral';

type ClientRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  services: number;
  gmv: number;
  rating: number;
  last: string;
  disputes: number;
  status: 'active' | 'new' | 'inactive';
};

const STATUS: Record<ClientRow['status'], { label: string; tone: Tone }> = {
  active: { label: 'Activo', tone: 'success' },
  new: { label: 'Nuevo', tone: 'info' },
  inactive: { label: 'Inactivo', tone: 'neutral' },
};

const initials = (n: string) =>
  n.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase();

const fmt = (n: number) => n.toLocaleString('es-MX');

const FILTERS = ['Todos', 'Activos', 'Nuevos', 'Inactivos', 'Con disputas'] as const;

const DAY_MS = 24 * 3600 * 1000;
const relDays = (iso: string | null) => {
  if (!iso) return '—';
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / DAY_MS);
  if (d === 0) return 'Hoy';
  if (d < 7) return `Hace ${d} día${d === 1 ? '' : 's'}`;
  if (d < 60) return `Hace ${Math.floor(d / 7)} sem`;
  return `Hace ${Math.floor(d / 30)} meses`;
};

function SkeletonRows({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-10 w-72" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    </div>
  );
}

export default function ClientesPage() {
  const tick = useTick();
  const router = useRouter();
  const ready = useWorldReady();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Todos');

  const rows = useMemo<ClientRow[]>(() => {
    const reqs = getAllRequests();
    const disputes = getAllDisputes();
    return getClients().map(p => {
      const myReqs = reqs.filter(r => r.client_id === p.id);
      const gmv = myReqs.reduce((s, r) => s + (r.quoted_total_cents ?? 0), 0) / 100;
      const lastReq = myReqs[0] ?? null; // getAllRequests ya viene ordenado por fecha
      const recent = lastReq && Date.now() - new Date(lastReq.created_at).getTime() < 60 * DAY_MS;
      return {
        id: p.id,
        name: p.full_name ?? 'Cliente',
        email: '—', // profiles no guarda email (vive en auth.users)
        phone: p.phone ?? '—',
        city: lastReq?.municipality ?? '—',
        services: myReqs.length,
        gmv,
        rating: 0, // sin tabla de ratings por servicio todavía
        last: relDays(lastReq?.created_at ?? null),
        disputes: disputes.filter(d => d.opened_by === p.id).length,
        status: (myReqs.length === 0 ? 'new' : recent ? 'active' : 'inactive') as ClientRow['status'],
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r => {
      const matchesQ =
        !q || r.name.toLowerCase().includes(q) || r.phone.includes(q) || r.email.toLowerCase().includes(q);
      const matchesF =
        filter === 'Todos' ||
        (filter === 'Activos' && r.status === 'active') ||
        (filter === 'Nuevos' && r.status === 'new') ||
        (filter === 'Inactivos' && r.status === 'inactive') ||
        (filter === 'Con disputas' && r.disputes > 0);
      return matchesQ && matchesF;
    });
  }, [rows, query, filter]);

  const total = rows.length;
  const nuevos = rows.filter(r => r.status === 'new').length;
  const activos = rows.filter(r => r.status === 'active').length;
  const conDisputas = rows.filter(r => r.disputes > 0).length;

  function onExport() {
    exportCsv('clientes.csv', filtered.map(r => ({
      ID: r.id, Nombre: r.name, Email: r.email, Teléfono: r.phone, Ciudad: r.city,
      Servicios: r.services, GMV: r.gmv, Rating: r.rating || '', Estado: STATUS[r.status].label,
    })));
    toast.success(`CSV exportado · ${filtered.length} clientes`);
  }

  const columns: Column<ClientRow>[] = [
    {
      key: 'name',
      header: 'Cliente',
      render: r => (
        <div className="flex items-center gap-3">
          <Avatar initials={initials(r.name)} size={36} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13.5px] font-semibold text-navy">{r.name}</span>
              {r.disputes > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-info-soft px-1.5 py-0.5 text-[10px] font-bold text-error">
                  <ShieldAlert size={10} /> {r.disputes}
                </span>
              )}
            </div>
            <div className="mt-0.5 text-[11.5px] text-muted">{r.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'phone', header: 'Teléfono', render: r => <span className="font-mono text-[12.5px] text-muted">{r.phone}</span> },
    {
      key: 'city',
      header: 'Ciudad',
      render: r => (
        <span className="inline-flex items-center gap-1.5 text-[13px] text-navy">
          <MapPin size={13} className="text-cyan" /> {r.city}
        </span>
      ),
    },
    { key: 'services', header: 'Servicios', render: r => <span className="font-mono text-[13px] text-navy">{r.services}</span> },
    {
      key: 'gmv',
      header: 'GMV total',
      render: r => (
        <span className="font-display text-[13px] font-semibold text-navy">
          ${fmt(r.gmv)}
          <span className="ml-1 text-[11px] font-normal text-faint">MXN</span>
        </span>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: r =>
        r.rating > 0 ? (
          <span className="inline-flex items-center gap-1.5">
            <Star size={13} className="text-warning" fill="currentColor" />
            <span className="text-[13px] font-semibold text-navy">{r.rating.toFixed(1)}</span>
          </span>
        ) : (
          <span className="text-[13px] text-faint">—</span>
        ),
    },
    { key: 'last', header: 'Último servicio', render: r => <span className="text-[12.5px] text-muted">{r.last}</span> },
    { key: 'status', header: 'Estado', render: r => <Badge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Badge> },
  ];

  if (!ready) return <SkeletonRows />;

  return (
    <div className="space-y-6">
      <PageHeading
        title="Clientes"
        sub="Base de usuarios finales de la plataforma · ZMG"
        actions={
          <div className="flex gap-2.5">
            <GhostButton>
              <span className="inline-flex items-center gap-2"><Filter size={14} /> Vistas guardadas</span>
            </GhostButton>
            <GhostButton onClick={onExport}>
              <span className="inline-flex items-center gap-2 text-cyan"><Download size={14} /> Exportar CSV</span>
            </GhostButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Total clientes" value={fmt(total)} icon={Users} note="Base registrada en ZMG" />
        <StatCard index={1} label="Nuevos este mes" value={fmt(nuevos)} trend="up" delta="+12%" icon={UserPlus} />
        <StatCard index={2} label="Activos" value={fmt(activos)} note={`${Math.round((activos / total) * 100)}% de la base`} progress={activos / total} />
        <StatCard index={3} label="Con disputas" value={fmt(conDisputas)} trend="down" icon={ShieldAlert} note="Requieren seguimiento" />
      </div>

      <FadeIn>
        <Panel>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative w-full min-w-[220px] flex-1 sm:w-auto sm:max-w-[320px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Nombre, teléfono o email"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map(f => (
                <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
                  {f}
                </Chip>
              ))}
            </div>
          </div>

          <DataTable
            columns={columns}
            rows={filtered}
            onRowClick={r => router.push(`/clientes/${r.id}`)}
            empty="No se encontraron clientes"
          />

          <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-[12.5px] text-muted">
            <span>
              Mostrando <b className="font-semibold text-navy">{filtered.length}</b> de{' '}
              <b className="font-semibold text-navy">{fmt(total)}</b> clientes
            </span>
          </div>
        </Panel>
      </FadeIn>
    </div>
  );
}
