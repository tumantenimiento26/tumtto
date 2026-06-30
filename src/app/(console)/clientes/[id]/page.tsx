'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Phone, Mail, Calendar, Activity, MapPin, MessageSquare, Ban,
  MoreVertical, Award, ContactRound, BarChart3, CreditCard, Store,
  Wallet, Home, Briefcase, Heart, BadgeCheck, ThumbsUp, ShieldAlert,
  LayoutDashboard, Wrench,
} from 'lucide-react';
import {
  Panel, StatCard, StatusPill, DataTable, type Column,
} from '@/components/admin';
import { Avatar, Stars } from '@/components/ui';
import { FadeIn, Stagger, StaggerItem } from '@/components/motion';
import {
  useTick, getProfile, getClientRequests, getAddresses, getCategories,
  getSubcategories, getRating,
} from '@/lib/demo/store';
import type { ServiceRequest } from '@/lib/demo/world';

const peso = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
const initialsOf = (name: string) =>
  name.replace(/\(.*?\)/g, '').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const fechaCorta = (iso: string) =>
  new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

const PAYMENT_METHODS = [
  { kind: 'card', brand: 'Visa •••• 4821', detail: 'Tarjeta de crédito', exp: 'Exp. 09/27', primary: true, verified: true },
  { kind: 'card', brand: 'Mastercard •••• 1130', detail: 'Tarjeta de débito', exp: 'Exp. 02/26', primary: false, verified: true },
  { kind: 'oxxo', brand: 'OXXO Pay', detail: 'Pago en efectivo', exp: '', primary: false, verified: false },
];

const REPUTATION = {
  rating: 4.8,
  reviews: 12,
  breakdown: [{ stars: 5, n: 10 }, { stars: 4, n: 1 }, { stars: 3, n: 1 }, { stars: 2, n: 0 }, { stars: 1, n: 0 }],
  tags: [
    { label: 'Buena comunicación', n: 8 },
    { label: 'Acceso fácil', n: 6 },
    { label: 'Pago puntual', n: 5 },
    { label: 'Amable', n: 4 },
  ],
};

const TABS = [
  { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
  { id: 'services', label: 'Servicios', icon: Wrench },
  { id: 'payments', label: 'Pagos', icon: CreditCard },
  { id: 'addresses', label: 'Direcciones', icon: MapPin },
  { id: 'disputes', label: 'Disputas y soporte', icon: ShieldAlert },
  { id: 'notes', label: 'Notas internas', icon: MessageSquare },
] as const;

export default function ClientDetailPage() {
  useTick();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<string>('resumen');

  const profile = getProfile(id);
  const phone = profile?.phone ?? '+52 33 1234 5678';
  const name = profile?.full_name ?? 'Cliente';
  const requests = useMemo(() => getClientRequests(id), [id]);
  const addresses = useMemo(() => getAddresses(id), [id]);

  const subName = useMemo(() => {
    const subs = getSubcategories();
    const cats = getCategories();
    return (subId: string) => {
      const sub = subs.find(s => s.id === subId);
      const cat = cats.find(c => c.id === sub?.category_id);
      return { sub: sub?.name ?? '—', cat: cat?.name ?? '—' };
    };
  }, []);

  if (!profile) {
    return (
      <div>
        <Link href="/clientes" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:text-primary-2">
          <ArrowLeft size={15} /> Clientes
        </Link>
        <Panel><p className="py-8 text-center text-[14px] text-muted">Cliente no encontrado.</p></Panel>
      </div>
    );
  }

  const totalGasto = requests.reduce((s, r) => s + (r.total_price ?? 0), 0);
  const completados = requests.filter(r => ['completado', 'pagado', 'calificado'].includes(r.status)).length;

  const tableRows = [...requests].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  const columns: Column<ServiceRequest>[] = [
    { key: 'id', header: 'Folio', render: r => <span className="font-mono text-[12px] text-muted">#{r.id}</span> },
    {
      key: 'cat', header: 'Servicio', render: r => {
        const m = subName(r.subcategory_id);
        return (
          <div>
            <div className="font-semibold text-navy">{m.cat}</div>
            <div className="text-[12px] text-muted">{m.sub}</div>
          </div>
        );
      },
    },
    { key: 'date', header: 'Fecha', render: r => <span className="text-[13px] text-muted">{fechaCorta(r.created_at)}</span> },
    { key: 'status', header: 'Estado', render: r => <StatusPill status={r.status} /> },
    {
      key: 'rating', header: 'Calificación', render: r => {
        const rt = getRating(r.id);
        return rt ? <Stars value={rt.stars} /> : <span className="text-[12px] text-faint">—</span>;
      },
    },
    {
      key: 'total', header: 'Total', className: 'text-right',
      render: r => <span className="font-mono font-semibold text-navy">{r.total_price != null ? peso(r.total_price) : '—'}</span>,
    },
  ];

  return (
    <div>
      <Link href="/clientes" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:text-primary-2">
        <ArrowLeft size={15} /> Clientes
      </Link>

      {/* Profile header */}
      <FadeIn>
        <div className="mb-6 flex items-center gap-5">
          <Avatar initials={initialsOf(name)} size={84} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-[26px] font-bold tracking-tight text-navy">{name}</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[12px] font-semibold text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> Cliente activo
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-info-soft px-2.5 py-1 text-[12px] font-semibold text-cyan">
                <Award size={11} /> Recurrente · top 10%
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-muted">
              <span className="inline-flex items-center gap-1.5"><Phone size={13} className="text-faint" />{phone}</span>
              <span className="inline-flex items-center gap-1.5"><Mail size={13} className="text-faint" />maria.cliente@correo.mx</span>
              <span className="inline-flex items-center gap-1.5"><Calendar size={13} className="text-faint" />Registrada {fechaCorta(profile.created_at)}</span>
              <span className="inline-flex items-center gap-1.5"><Activity size={13} className="text-faint" />Activa hace 2 días</span>
              <span className="inline-flex items-center gap-1.5"><MapPin size={13} className="text-faint" />Zapopan, Jalisco</span>
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2.5">
            <button className="inline-flex items-center gap-2 rounded-xl border border-primary bg-white px-3.5 py-2.5 text-[13px] font-semibold text-primary hover:bg-info-soft">
              <MessageSquare size={14} /> Enviar mensaje
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-error bg-white px-3.5 py-2.5 text-[13px] font-semibold text-error hover:bg-error-soft">
              <Ban size={14} /> Suspender
            </button>
            <button aria-label="Más acciones" className="grid place-items-center rounded-xl border border-line bg-white px-3 py-2.5 text-navy hover:bg-surface">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>
      </FadeIn>

      {/* Stat cards */}
      <Stagger className="mb-6 grid grid-cols-4 gap-4">
        <StaggerItem><StatCard index={0} label="Servicios totales" value={requests.length} icon={Wrench} note={`${completados} completados`} delta={`${completados}`} trend="up" /></StaggerItem>
        <StaggerItem><StatCard index={1} label="Gasto total" value={peso(totalGasto)} icon={CreditCard} note="histórico" /></StaggerItem>
        <StaggerItem><StatCard index={2} label="Ticket promedio" value={peso(requests.length ? Math.round(totalGasto / requests.length) : 0)} icon={BarChart3} /></StaggerItem>
        <StaggerItem><StatCard index={3} label="Reputación" value={REPUTATION.rating.toFixed(1)} suffix="/ 5" icon={ThumbsUp} note={`${REPUTATION.reviews} reseñas`} /></StaggerItem>
      </Stagger>

      {/* Tabs */}
      <div className="mb-6 flex gap-6 border-b border-line">
        {TABS.map(t => {
          const active = t.id === tab;
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 pb-3.5 pt-3 text-[13.5px] ${active ? 'font-semibold text-primary' : 'font-medium text-muted hover:text-navy'}`}>
              <Icon size={14} /> {t.label}
              {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded bg-primary" />}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="grid grid-cols-[1.5fr_1fr] gap-5">
        <div className="flex flex-col gap-5">
          <FadeIn>
            <Panel title="Información personal">
              <div className="grid grid-cols-2 gap-4">
                <KV label="Nombre completo" value={name} />
                <KV label="Email" value="maria.cliente@correo.mx" />
                <KV label="Teléfono" value={phone} mono />
                <KV label="Región principal" value="Zapopan, Jalisco" />
                <KV label="Fecha de registro" value={fechaCorta(profile.created_at)} />
                <KV label="Método preferido de pago" value="Visa •••• 4821" />
              </div>
            </Panel>
          </FadeIn>

          <FadeIn>
            <Panel title="Historial de servicios" action={<span className="text-[12px] text-faint">{requests.length} servicios</span>}>
              <DataTable columns={columns} rows={tableRows} onRowClick={r => router.push(`/solicitudes/${r.id}`)} empty="Sin servicios registrados" />
            </Panel>
          </FadeIn>

          <FadeIn>
            <Panel title="Direcciones guardadas" action={<span className="text-[12px] text-faint">{addresses.length} direcciones</span>}>
              <div className="flex flex-col gap-2.5">
                {addresses.map(a => {
                  const PinIcon = a.alias === 'Casa' ? Home : a.alias === 'Oficina' ? Briefcase : Heart;
                  return (
                    <div key={a.id} className={`flex gap-3 rounded-xl border p-3 ${a.is_primary ? 'border-primary/30 bg-info-soft/40' : 'border-line bg-surface'}`}>
                      <div className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg text-white ${a.is_primary ? 'bg-primary' : 'bg-faint'}`}>
                        <PinIcon size={13} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13.5px] font-semibold text-navy">{a.alias}</span>
                          {a.is_primary && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10.5px] font-semibold text-primary">Principal</span>}
                        </div>
                        <div className="mt-0.5 text-[12.5px] text-navy">{a.line1}{a.line2 ? `, ${a.line2}` : ''}</div>
                        <div className="text-[12px] text-muted">{a.neighborhood}, {a.city}, {a.state} · {a.zip}</div>
                      </div>
                    </div>
                  );
                })}
                {addresses.length === 0 && <p className="py-4 text-center text-[13px] text-faint">Sin direcciones guardadas.</p>}
              </div>
            </Panel>
          </FadeIn>
        </div>

        <div className="flex flex-col gap-5">
          <FadeIn>
            <Panel title="Métodos de pago">
              <div className="flex flex-col gap-2.5">
                {PAYMENT_METHODS.map((pm, i) => {
                  const Icon = pm.kind === 'card' ? CreditCard : pm.kind === 'oxxo' ? Store : Wallet;
                  return (
                    <div key={i} className="flex gap-3 rounded-xl border border-line bg-surface p-3">
                      <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-info-soft text-primary"><Icon size={16} /></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[13.5px] font-semibold text-navy">{pm.brand}</span>
                          {pm.primary && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10.5px] font-semibold text-primary">Principal</span>}
                          {pm.verified && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[10.5px] font-semibold text-success">
                              <BadgeCheck size={10} /> Verificado
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 text-[12px] text-muted">{pm.detail}{pm.exp ? ` · ${pm.exp}` : ''}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </FadeIn>

          <FadeIn>
            <Panel title="Reputación del cliente">
              <div className="flex items-center gap-5">
                <div>
                  <div className="font-display text-[36px] font-bold leading-none tracking-tight text-navy">{REPUTATION.rating.toFixed(1)}</div>
                  <div className="mt-1.5"><Stars value={Math.round(REPUTATION.rating)} /></div>
                  <div className="mt-1 text-[11.5px] text-faint">{REPUTATION.reviews} reseñas</div>
                </div>
                <div className="flex-1">
                  {REPUTATION.breakdown.map(b => (
                    <div key={b.stars} className="mb-1 flex items-center gap-2">
                      <span className="w-5 text-[11px] text-muted">{b.stars}★</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                        <div className="h-full rounded-full bg-warning" style={{ width: `${(b.n / REPUTATION.reviews) * 100}%` }} />
                      </div>
                      <span className="w-5 text-right text-[11px] text-muted">{b.n}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-2.5 mt-4 font-mono text-[11px] uppercase tracking-wider text-faint">Etiquetas frecuentes</div>
              <div className="flex flex-wrap gap-1.5">
                {REPUTATION.tags.map(t => (
                  <span key={t.label} className="inline-flex items-center rounded-full bg-info-soft px-2.5 py-1 text-[12px] font-medium text-cyan">
                    {t.label}<span className="ml-1.5 font-mono text-[11px] text-cyan/70">×{t.n}</span>
                  </span>
                ))}
              </div>
            </Panel>
          </FadeIn>

          <FadeIn>
            <Panel title="Notas internas">
              <div className="space-y-3">
                <div className="rounded-xl border border-line bg-surface p-3">
                  <div className="flex items-center gap-2 text-[12px] text-muted">
                    <ContactRound size={13} className="text-primary" /> Sofía Admin · {fechaCorta(new Date().toISOString())}
                  </div>
                  <p className="mt-1.5 text-[13px] text-navy">Cliente recurrente y puntual con los pagos. Prefiere visitas por la mañana.</p>
                </div>
                <textarea
                  placeholder="Agregar una nota interna sobre este cliente…"
                  className="min-h-[80px] w-full resize-y rounded-xl border border-line bg-white p-3 text-[13px] text-navy outline-none placeholder:text-faint focus:border-primary"
                />
                <button className="rounded-xl bg-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-primary-2">Guardar nota</button>
              </div>
            </Panel>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="mb-1 font-mono text-[11px] uppercase tracking-wider text-faint">{label}</div>
      <div className={`text-[14px] font-medium text-navy ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  );
}
