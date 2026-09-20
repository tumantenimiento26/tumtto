'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  FolderTree,
  Download,
  Plus,
  Activity,
  TrendingUp,
} from 'lucide-react';
import {
  PageHeading,
  Panel,
  StatCard,
  StatusPill,
  DataTable,
  Modal,
  exportCsv,
  LoadFailed,
  type Column,
} from '@/components/admin';
import {
  PrimaryButton,
  GhostButton,
  Chip,
  Avatar,
  Input,
  Skeleton,
  Field,
  Textarea,
} from '@/components/ui';
import { FadeIn } from '@/components/motion';
import { toast } from '@/components/toast';
import {
  useTick,
  useWorldReady,
  useWorldFailed,
  loadWorld,
  getMetrics,
  getAllRequests,
  getProfile,
  getCategories,
  getAddresses,
  getClients,
  createRequest,
} from '@/lib/data/store';
import type { ServiceRequest } from '@/lib/demo/world';

const STATUS_LABELS: Record<string, string> = {
  requested: 'Solicitados',
  accepted: 'Aceptados',
  enroute: 'En camino',
  onsite: 'En sitio',
  quote: 'Cotización',
  working: 'En ejecución',
  closing: 'Por cerrar',
  completed: 'Completados',
  paid: 'Pagados',
  closed: 'Cerrados',
  expired: 'Expirados',
  cancelled: 'Cancelados',
};

const fmtMoney = (n: number | null) =>
  n == null
    ? '—'
    : new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        maximumFractionDigits: 0,
      }).format(n);

const fmtDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString('es-MX', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0])
    .join('')
    .toUpperCase();

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

export default function ServiciosPage() {
  const tick = useTick();
  const router = useRouter();
  const ready = useWorldReady();
  const failed = useWorldFailed();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [createOpen, setCreateOpen] = useState(false);

  const metrics = getMetrics();
  const byStatus = metrics.byStatus;

  const subToCategory = useMemo(() => {
    const map: Record<string, string> = {};
    for (const cat of getCategories()) map[cat.id] = cat.name;
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const rows: Row[] = useMemo(() => {
    return getAllRequests().map(req => ({
      req,
      clientName: getProfile(req.client_id)?.full_name ?? 'Cliente',
      techName: req.technician_id
        ? (getProfile(req.technician_id)?.full_name ?? null)
        : null,
      categoryName: subToCategory[req.category_id] ?? '—',
    }));
  }, [subToCategory]);

  const categoryNames = useMemo(
    () => ['Todas', ...getCategories().map(c => c.name)],
    // `tick` es el disparador deliberado: getCategories() lee el snapshot del
    // módulo, así que la lista se recalcula cuando el mundo se recarga.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tick],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r => {
      if (statusFilter && r.req.status !== statusFilter) return false;
      if (categoryFilter !== 'Todas' && r.categoryName !== categoryFilter)
        return false;
      if (!q) return true;
      return (
        r.req.id.toLowerCase().includes(q) ||
        r.clientName.toLowerCase().includes(q) ||
        (r.techName ?? '').toLowerCase().includes(q) ||
        r.categoryName.toLowerCase().includes(q)
      );
    });
  }, [rows, query, statusFilter, categoryFilter]);

  function onExport() {
    exportCsv(
      'servicios.csv',
      filtered.map(r => ({
        ID: r.req.id,
        Cliente: r.clientName,
        Técnico: r.techName ?? '',
        Categoría: r.categoryName,
        Estado: STATUS_LABELS[r.req.status] ?? r.req.status,
        Programado: r.req.accepted_at ?? r.req.created_at,
        Total:
          r.req.quoted_total_cents != null
            ? r.req.quoted_total_cents / 100
            : '',
      })),
    );
    toast.success(`CSV exportado · ${filtered.length} servicios`);
  }

  const statusOrder = Object.keys(STATUS_LABELS).filter(s => byStatus[s] > 0);
  const topStatuses = statusOrder.slice(0, 4);

  const columns: Column<Row>[] = [
    {
      key: 'id',
      header: 'ID',
      render: r => (
        <span className="font-mono text-[12.5px] font-medium text-primary">
          #{r.req.id}
        </span>
      ),
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
      render: r => (
        <span className="text-[12.5px] text-navy">{r.categoryName}</span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: r => <StatusPill status={r.req.status} />,
    },
    {
      key: 'fecha',
      header: 'Programado',
      render: r => (
        <span className="font-mono text-[12px] text-muted">
          {fmtDate(r.req.accepted_at ?? r.req.created_at)}
        </span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      className: 'text-right',
      render: r => (
        <span className="font-mono text-[13px] font-semibold text-navy">
          {fmtMoney(
            r.req.quoted_total_cents != null
              ? r.req.quoted_total_cents / 100
              : null,
          )}
        </span>
      ),
    },
  ];

  if (failed) return <LoadFailed onRetry={() => void loadWorld(true)} />;
  if (!ready) return <SkeletonRows />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Servicios"
        sub="Operación en tiempo real y histórico completo · ZMG"
        actions={
          <div className="flex gap-2.5">
            <GhostButton onClick={onExport}>
              <Download size={14} className="mr-2" />
              Exportar
            </GhostButton>
            <PrimaryButton onClick={() => setCreateOpen(true)}>
              <Plus size={14} className="mr-2" />
              Crear servicio
            </PrimaryButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            <div className="flex h-9 w-full min-w-[220px] flex-1 items-center rounded-lg border border-line bg-surface px-3 sm:w-auto sm:max-w-[300px]">
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
              <Chip
                key={s}
                active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
              >
                {STATUS_LABELS[s]} · {byStatus[s]}
              </Chip>
            ))}
            <span className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-navy sm:ml-auto">
              <FolderTree size={14} className="text-primary" />
              <span className="text-muted">Categoría:</span>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="bg-transparent text-[12.5px] font-medium text-navy outline-none"
              >
                {categoryNames.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </span>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 rounded-xl border border-primary/20 bg-info-soft px-4 py-2.5">
            <Activity size={14} className="text-success" />
            <span className="text-[13px] text-navy">
              <b className="font-bold">{metrics.active}</b> servicios en curso
              ahora mismo
            </span>
            <span className="flex items-center gap-1 text-[12.5px] text-muted">
              <TrendingUp size={12} className="text-success" />
              +18% vs ayer
            </span>
            <span className="font-mono text-[11.5px] text-faint sm:ml-auto">
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

      <CreateServiceModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={id => router.push(`/servicios/${id}`)}
      />
    </div>
  );
}

function CreateServiceModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const cats = getCategories();
  const clients = getClients();
  const [clientId, setClientId] = useState('');
  const addresses = getAddresses(clientId);
  const [subId, setSubId] = useState('');
  const [description, setDescription] = useState('');
  const [addressId, setAddressId] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!subId || !clientId) return;
    setSaving(true);
    const req = await createRequest({
      client_id: clientId,
      category_id: subId,
      description: description.trim() || null,
      client_address_id: addresses.find(a => a.id === addressId)?.id ?? null,
    });
    setSaving(false);
    if (!req) return;
    toast.success(`Servicio creado · #${req.id.slice(0, 8)}`);
    setSubId('');
    setDescription('');
    onClose();
    onCreated(req.id);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Crear servicio"
      sub="Alta manual a nombre de un cliente (soporte telefónico)."
      icon={<Plus size={16} />}
      width={480}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancelar</GhostButton>
          <PrimaryButton
            onClick={submit}
            disabled={!subId || !clientId || saving}
          >
            {saving ? 'Creando…' : 'Crear servicio'}
          </PrimaryButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Cliente">
          <select
            value={clientId}
            onChange={e => {
              setClientId(e.target.value);
              setAddressId('');
            }}
            className="min-h-[48px] w-full rounded-xl border border-line bg-white px-3.5 text-[15px] text-navy outline-none focus:border-primary"
          >
            <option value="">Selecciona un cliente…</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.full_name ?? c.id}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Categoría">
          <select
            value={subId}
            onChange={e => setSubId(e.target.value)}
            className="min-h-[48px] w-full rounded-xl border border-line bg-white px-3.5 text-[15px] text-navy outline-none focus:border-primary"
          >
            <option value="">Selecciona un servicio…</option>
            {cats.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Descripción del problema">
          <Textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="¿Qué reporta el cliente?"
          />
        </Field>
        <Field label="Dirección">
          <select
            value={addressId}
            onChange={e => setAddressId(e.target.value)}
            className="min-h-[48px] w-full rounded-xl border border-line bg-white px-3.5 text-[15px] text-navy outline-none focus:border-primary"
          >
            <option value="">
              {addresses.length
                ? 'Selecciona una dirección…'
                : 'El cliente no tiene direcciones guardadas'}
            </option>
            {addresses.map(a => (
              <option key={a.id} value={a.id}>
                {a.label} · {a.address_line}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </Modal>
  );
}
