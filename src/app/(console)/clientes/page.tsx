'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Download, Filter, ShieldAlert, Star, MapPin, UserPlus, Users } from 'lucide-react';
import { PageHeading, Panel, StatCard, DataTable } from '@/components/admin';
import type { Column } from '@/components/admin';
import { GhostButton, Input, Chip, Avatar, Badge, Skeleton } from '@/components/ui';
import { FadeIn } from '@/components/motion';
import { useTick, getClients, getAllRequests } from '@/lib/demo/store';

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

// Extra realistic ZMG mock rows to enrich the table (the prototype is fully mocked).
const MOCK: ClientRow[] = [
  { id: 'c-mock-1', name: 'Laura Fernández Ríos', email: 'laura.fr@gmail.com', phone: '+52 33 2841 9930', city: 'Zapopan', services: 14, gmv: 18420, rating: 4.9, last: 'Hace 2 días', disputes: 0, status: 'active' },
  { id: 'c-mock-2', name: 'Jorge Aceves Luna', email: 'j.aceves@outlook.com', phone: '+52 33 1190 4421', city: 'Guadalajara', services: 8, gmv: 9650, rating: 4.6, last: 'Hace 5 días', disputes: 1, status: 'active' },
  { id: 'c-mock-3', name: 'Patricia Salinas M.', email: 'paty.salinas@gmail.com', phone: '+52 33 3382 1075', city: 'Tlaquepaque', services: 3, gmv: 3120, rating: 4.8, last: 'Hace 1 día', disputes: 0, status: 'new' },
  { id: 'c-mock-4', name: 'Ricardo Beltrán O.', email: 'rbeltran@empresa.mx', phone: '+52 33 2207 6648', city: 'Tonalá', services: 21, gmv: 27890, rating: 4.7, last: 'Hoy', disputes: 0, status: 'active' },
  { id: 'c-mock-5', name: 'Gabriela Mora Téllez', email: 'gaby.mora@gmail.com', phone: '+52 33 4451 2289', city: 'Zapopan', services: 1, gmv: 780, rating: 5.0, last: 'Hace 3 sem', disputes: 0, status: 'new' },
  { id: 'c-mock-6', name: 'Héctor Vázquez Pineda', email: 'hector.vp@hotmail.com', phone: '+52 33 1672 5503', city: 'Guadalajara', services: 6, gmv: 7340, rating: 4.4, last: 'Hace 2 meses', disputes: 2, status: 'inactive' },
  { id: 'c-mock-7', name: 'Mónica Reyes Chávez', email: 'monica.rc@gmail.com', phone: '+52 33 3098 7712', city: 'Tlajomulco', services: 11, gmv: 13560, rating: 4.9, last: 'Hace 4 días', disputes: 0, status: 'active' },
  { id: 'c-mock-8', name: 'Andrés Pérez Gallo', email: 'andres.pg@gmail.com', phone: '+52 33 2519 8834', city: 'Zapopan', services: 0, gmv: 0, rating: 0, last: '—', disputes: 0, status: 'inactive' },
];

const FILTERS = ['Todos', 'Activos', 'Nuevos', 'Inactivos', 'Con disputas'] as const;

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

export default function ClientesPage() {
  useTick();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 450);
    return () => clearTimeout(t);
  }, []);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Todos');

  const rows = useMemo<ClientRow[]>(() => {
    const reqs = getAllRequests();
    const live: ClientRow[] = getClients().map((p, i) => {
      const myReqs = reqs.filter(r => r.client_id === p.id);
      const gmv = myReqs.reduce((s, r) => s + (r.total_price ?? r.base_price ?? 0), 0);
      const name = p.full_name ?? 'Cliente';
      return {
        id: p.id,
        name,
        email: `${name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 8)}@tumtto.mx`,
        phone: p.phone ?? '—',
        city: i === 0 ? 'Zapopan' : 'Guadalajara',
        services: myReqs.length,
        gmv,
        rating: myReqs.length ? 4.8 : 0,
        last: myReqs.length ? 'Hace 1 día' : '—',
        disputes: 0,
        status: (myReqs.length ? 'active' : 'new') as ClientRow['status'],
      };
    });
    return [...live, ...MOCK];
  }, []);

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
            <GhostButton>
              <span className="inline-flex items-center gap-2 text-cyan"><Download size={14} /> Exportar CSV</span>
            </GhostButton>
          </div>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard index={0} label="Total clientes" value={fmt(total)} icon={Users} note="Base registrada en ZMG" />
        <StatCard index={1} label="Nuevos este mes" value={fmt(nuevos)} trend="up" delta="+12%" icon={UserPlus} />
        <StatCard index={2} label="Activos" value={fmt(activos)} note={`${Math.round((activos / total) * 100)}% de la base`} progress={activos / total} />
        <StatCard index={3} label="Con disputas" value={fmt(conDisputas)} trend="down" icon={ShieldAlert} note="Requieren seguimiento" />
      </div>

      <FadeIn>
        <Panel>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative max-w-[320px] flex-1">
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
