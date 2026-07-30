'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, MapPin, FolderTree, Star, X, Download, Check,
  ShieldCheck, ShieldAlert, UserCheck, Users,
} from 'lucide-react';
import { PageHeading, Panel, StatCard, DataTable, exportCsv, type Column } from '@/components/admin';
import { Avatar, Badge, Chip, Stars, Input, PrimaryButton, Skeleton } from '@/components/ui';
import { FadeIn } from '@/components/motion';
import { toast } from '@/components/toast';
import {
  getTechniciansWithProfile, getTechCategories, getSubcategories, getCategories,
  resolveKyc, rejectKyc, useTick,
} from '@/lib/demo/store';

type Kyc = 'approved' | 'pending_review' | 'rejected' | 'suspended';

interface Row {
  id: string;
  name: string;
  phone: string;
  cats: string[];
  region: string;
  rating: number;
  reviews: number;
  jobs: number;
  available: boolean;
  kyc: Kyc;
}

const REGIONS = ['Todas', 'Guadalajara', 'Zapopan', 'Tlaquepaque', 'Tonalá', 'Tlajomulco', 'El Salto'];

const KYC_META: Record<Kyc, { label: string; tone: 'success' | 'warning' | 'error' | 'neutral' }> = {
  approved: { label: 'Aprobado', tone: 'success' },
  pending_review: { label: 'Pendiente', tone: 'warning' },
  rejected: { label: 'Rechazado', tone: 'error' },
  suspended: { label: 'Suspendido', tone: 'neutral' },
};

// ponytail: la región del técnico no existe en el esquema demo — mapa presentacional.
const TECH_REGION: Record<string, string> = {
  't-ramon': 'Zapopan', 't-ag': 'Tlaquepaque', 't-sc': 'Zapopan', 't-do': 'Tlajomulco',
  't-carla': 'Guadalajara', 't-miguel': 'Tlaquepaque', 't-jose': 'Guadalajara',
  't-lupita': 'Zapopan', 't-fer': 'Tonalá', 't-luis': 'Guadalajara',
  't-ivan': 'El Salto', 't-roberto': 'Guadalajara',
};

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase();
}

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

export default function TecnicosPage() {
  const tick = useTick();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 450);
    return () => clearTimeout(t);
  }, []);
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('Todas');
  const [category, setCategory] = useState('Todas');
  const [tab, setTab] = useState<'all' | Kyc>('all');

  const rows = useMemo<Row[]>(() => {
    const subs = getSubcategories();
    const cats = getCategories();
    return getTechniciansWithProfile().map(({ tech, profile }) => {
      const catNames = [...new Set(
        getTechCategories(tech.id).map(tc => {
          const sub = subs.find(s => s.id === tc.subcategory_id);
          return cats.find(c => c.id === sub?.category_id)?.name ?? '—';
        }),
      )];
      return {
        id: tech.id,
        name: profile?.full_name ?? 'Técnico',
        phone: (profile?.phone ?? '').replace('+52 ', ''),
        cats: catNames.length ? catNames : ['General'],
        region: TECH_REGION[tech.id] ?? 'Guadalajara',
        rating: tech.rating_avg,
        reviews: tech.ratings_count,
        jobs: tech.total_jobs,
        available: tech.is_available,
        kyc: profile?.status === 'suspended' ? 'suspended' : ((tech.kyc_status as Kyc) ?? 'approved'),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const categoryNames = useMemo(() => ['Todas', ...getCategories().map(c => c.name)], []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r => {
      if (tab !== 'all' && r.kyc !== tab) return false;
      if (region !== 'Todas' && r.region !== region) return false;
      if (category !== 'Todas' && !r.cats.includes(category)) return false;
      if (q && !`${r.name} ${r.phone}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, query, region, category, tab]);

  const total = rows.length;
  const activos = rows.filter(r => r.kyc === 'approved' && r.available).length;
  const pendientes = rows.filter(r => r.kyc === 'pending_review').length;

  const tabs: { id: 'all' | Kyc; label: string; count: number }[] = [
    { id: 'all', label: 'Todos', count: total },
    { id: 'pending_review', label: 'Pendientes de KYC', count: pendientes },
    { id: 'approved', label: 'Aprobados', count: rows.filter(r => r.kyc === 'approved').length },
    { id: 'rejected', label: 'Rechazados', count: rows.filter(r => r.kyc === 'rejected').length },
    { id: 'suspended', label: 'Suspendidos', count: rows.filter(r => r.kyc === 'suspended').length },
  ];

  function onExport() {
    exportCsv('tecnicos.csv', filtered.map(r => ({
      ID: r.id, Nombre: r.name, Teléfono: r.phone, Categorías: r.cats.join(' / '),
      Región: r.region, Rating: r.rating || '', Trabajos: r.jobs,
      Disponible: r.available ? 'Sí' : 'No', KYC: KYC_META[r.kyc].label,
    })));
    toast.success(`CSV exportado · ${filtered.length} técnicos`);
  }

  const columns: Column<Row>[] = [
    {
      key: 'tech',
      header: 'Técnico',
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar initials={initials(r.name)} size={36} />
          <div>
            <div className="text-[13.5px] font-semibold text-navy">{r.name}</div>
            <div className="mt-0.5 font-mono text-[11.5px] text-muted">{r.phone}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'kyc',
      header: 'Estado KYC',
      render: (r) => <Badge tone={KYC_META[r.kyc].tone}>{KYC_META[r.kyc].label}</Badge>,
    },
    {
      key: 'cats',
      header: 'Categorías',
      render: (r) => (
        <div className="flex flex-wrap gap-1.5">
          {r.cats.slice(0, 2).map(c => (
            <span key={c} className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11.5px] font-medium text-navy">{c}</span>
          ))}
          {r.cats.length > 2 && (
            <span className="rounded-full border border-line bg-canvas px-2.5 py-0.5 text-[11.5px] font-medium text-muted">+{r.cats.length - 2}</span>
          )}
        </div>
      ),
    },
    { key: 'region', header: 'Región', render: (r) => <span className="text-[13px] text-navy">{r.region}</span> },
    {
      key: 'rating',
      header: 'Rating',
      render: (r) => r.rating > 0 ? (
        <div className="flex items-center gap-2">
          <Stars value={r.rating} />
          <span className="text-[13px] font-semibold text-navy">{r.rating.toFixed(1)}</span>
          <span className="text-[12px] text-faint">({r.reviews})</span>
        </div>
      ) : <span className="text-[12px] italic text-faint">sin reseñas</span>,
    },
    { key: 'jobs', header: 'Trabajos', render: (r) => <span className="font-mono text-[13px] text-navy">{r.jobs}</span> },
    {
      key: 'avail',
      header: 'Disponibilidad',
      render: (r) => <Badge tone={r.available ? 'success' : 'neutral'}>{r.available ? 'Disponible' : 'Inactivo'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          {r.kyc === 'pending_review' && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); resolveKyc(r.id, true); toast.success(`Técnico aprobado · ${r.name}`); }}
                className="inline-flex items-center gap-1 rounded-lg border border-success/30 bg-success/10 px-2.5 py-1 text-[11.5px] font-semibold text-success hover:bg-success/15"
              >
                <Check size={12} /> Aprobar
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); rejectKyc(r.id, 'Rechazo rápido desde el listado'); toast.success(`KYC rechazado · ${r.name}`); }}
                className="inline-flex items-center gap-1 rounded-lg border border-error/30 bg-error/10 px-2.5 py-1 text-[11.5px] font-semibold text-error hover:bg-error/15"
              >
                <X size={12} /> Rechazar
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (!ready) return <SkeletonRows />;

  return (
    <div className="flex flex-col gap-5">
      <PageHeading
        title="Técnicos"
        sub="Gestión y verificación de prestadores de servicio · ZMG"
        actions={
          <PrimaryButton onClick={onExport}>
            <span className="inline-flex items-center gap-2"><Download size={14} /> Exportar CSV</span>
          </PrimaryButton>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Total de técnicos" value={total} icon={Users} note="Roster completo ZMG" />
        <StatCard index={1} label="Activos y disponibles" value={activos} icon={UserCheck} trend="up" delta="+3" note="vs. semana pasada" />
        <StatCard index={2} label="KYC pendiente" value={pendientes} icon={ShieldAlert} note="Requieren revisión" />
        <StatCard index={3} label="Tasa de aprobación" value={94} suffix="%" icon={ShieldCheck} trend="up" delta="+1.2%" />
      </div>

      <FadeIn>
        <Panel>
          {/* Tabs */}
          <div className="-mx-4 flex gap-6 overflow-x-auto border-b border-line px-4 sm:-mx-5 sm:px-5">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex flex-shrink-0 items-center gap-2 whitespace-nowrap pb-3.5 pt-1 text-[13.5px] ${tab === t.id ? 'font-semibold text-cyan' : 'font-medium text-muted'}`}
              >
                <span>{t.label}</span>
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-muted">{t.count.toLocaleString('es-MX')}</span>
                {tab === t.id && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded bg-cyan" />}
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 py-4">
            <div className="relative w-full min-w-[220px] flex-1 sm:w-auto sm:max-w-xs">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre o teléfono"
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-2">
              <MapPin size={14} className="text-cyan" />
              <span className="text-[12px] text-muted">Región:</span>
              <select value={region} onChange={(e) => setRegion(e.target.value)} className="bg-transparent text-[13px] font-medium text-navy outline-none">
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-2">
              <FolderTree size={14} className="text-cyan" />
              <span className="text-[12px] text-muted">Categoría:</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-transparent text-[13px] font-medium text-navy outline-none">
                {categoryNames.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-2 text-[13px] text-muted">
              <Star size={14} className="text-warning" /> Rating ≥ <span className="font-mono font-semibold text-navy">3.8</span>
            </div>
            {(query || region !== 'Todas' || category !== 'Todas' || tab !== 'all') && (
              <Chip onClick={() => { setQuery(''); setRegion('Todas'); setCategory('Todas'); setTab('all'); }}>
                <span className="inline-flex items-center gap-1"><X size={13} /> Limpiar filtros</span>
              </Chip>
            )}
          </div>

          <DataTable
            columns={columns}
            rows={filtered}
            onRowClick={r => router.push(`/tecnicos/${r.id}`)}
            empty="No hay técnicos que coincidan con los filtros."
          />

          <div className="flex items-center justify-between pt-4 text-[12.5px] text-muted">
            <span>Mostrando <b className="font-semibold text-navy">{filtered.length}</b> de <b className="font-semibold text-navy">{total}</b> técnicos</span>
          </div>
        </Panel>
      </FadeIn>
    </div>
  );
}
