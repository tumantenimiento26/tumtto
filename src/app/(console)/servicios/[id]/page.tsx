'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FolderTree,
  Calendar,
  MapPin,
  MessageSquare,
  UserCog,
  Ban,
  RotateCcw,
  BadgeCheck,
  Star,
  ArrowRight,
  Plus,
  CreditCard,
  Send,
  LifeBuoy,
  GitCommitVertical,
  Wand2,
  Info,
  Smartphone,
  ShieldAlert,
  ChevronDown,
  Check,
} from 'lucide-react';
import { PageHeading, Panel, StatusPill, Modal } from '@/components/admin';
import {
  GhostButton,
  PrimaryButton,
  Avatar,
  Textarea,
  Badge,
} from '@/components/ui';
import { FadeIn, Reveal } from '@/components/motion';
import { toast } from '@/components/toast';
import {
  useTick,
  getRequest,
  getProfile,
  getCategories,
  getQuote,
  getQuoteItems,
  getPayment,
  getTechByUser,
  getTechniciansWithProfile,
  getMessages,
  getNotes,
  setStatus,
  reassignRequest,
  refundPayment,
  sendMessage,
  addNote,
  createTicket,
  ADMIN_ID,
} from '@/lib/data/store';
import type { RequestStatus } from '@/lib/demo/world';
import { useState } from 'react';

const FLOW: RequestStatus[] = [
  'requested',
  'accepted',
  'enroute',
  'onsite',
  'quote',
  'working',
  'closing',
  'completed',
  'paid',
  'closed',
];
const FLOW_LABEL: Record<RequestStatus, string> = {
  requested: 'Solicitud creada',
  accepted: 'Técnico aceptó el servicio',
  enroute: 'Técnico en camino',
  onsite: 'Técnico llegó al sitio',
  quote: 'Cotización enviada al cliente',
  working: 'Trabajo en ejecución',
  closing: 'Cierre del trabajo',
  completed: 'Servicio completado',
  paid: 'Pago confirmado',
  closed: 'Servicio cerrado',
  expired: 'Solicitud expirada',
  cancelled: 'Servicio cancelado',
};
const FLOW_ACTOR: Record<RequestStatus, string> = {
  requested: 'Cliente',
  accepted: 'Técnico',
  enroute: 'Técnico',
  onsite: 'Técnico',
  quote: 'Técnico',
  working: 'Técnico',
  closing: 'Técnico',
  completed: 'Técnico',
  paid: 'Cliente',
  closed: 'Cliente',
  expired: 'Sistema',
  cancelled: 'Sistema',
};

const initials = (name: string | null) =>
  (name ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
/** Formatea centavos como MXN con decimales. */
const money = (cents: number) =>
  `$${(cents / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function ServicioDetailPage() {
  useTick();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const req = getRequest(id);
  const [note, setNote] = useState('');
  const [reassignOpen, setReassignOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [caseTicketId, setCaseTicketId] = useState<string | null>(null);

  if (!req) {
    return (
      <FadeIn>
        <PageHeading
          title="Servicio no encontrado"
          sub={`No existe un servicio con id ${id}`}
        />
        <GhostButton onClick={() => router.push('/servicios')}>
          Volver a servicios
        </GhostButton>
      </FadeIn>
    );
  }

  const cat = getCategories().find(c => c.id === req.category_id);
  const client = getProfile(req.client_id);
  const techUserId = req.technician_id;
  const techProfile = techUserId ? getProfile(techUserId) : null;
  const techRec = techUserId ? getTechByUser(techUserId) : null;
  const quote = getQuote(req.id);
  const quoteItems = quote ? getQuoteItems(quote.id) : [];
  const payment = getPayment(req.id);
  const notes = getNotes(req.id);

  const baseCents = quote?.labor_cents ?? 45000;
  const subtotalCents =
    req.quoted_total_cents ?? quote?.total_cents ?? baseCents;
  const commissionCents =
    payment?.commission_cents ??
    req.commission_cents ??
    Math.round(subtotalCents * 0.15);
  const techNetCents = subtotalCents - commissionCents;

  const addrLine =
    [req.address_line, req.neighborhood].filter(Boolean).join(', ') ||
    'Dirección no disponible';
  const addrCity = [req.municipality, req.state].filter(Boolean).join(', ');

  const currentIndex = FLOW.indexOf(req.status);
  const isTerminal = req.status === 'cancelled' || req.status === 'expired';
  const disputed = req.is_disputed || req.status === 'cancelled';
  const refundable = payment?.status === 'paid';

  const override = (s: RequestStatus) => {
    void setStatus(req.id, s, 'Cambio manual desde la consola').then(r => {
      if (r !== null) toast.success(`Estado actualizado · ${FLOW_LABEL[s]}`);
    });
  };

  function onSaveNote() {
    if (!note.trim()) return;
    addNote(req!.id, note.trim());
    setNote('');
    toast.success('Nota guardada');
  }

  function onOpenCase() {
    if (caseTicketId) return;
    const t = createTicket({
      subject: `Caso de soporte · Servicio #${req!.id}`,
      requester_id: req!.client_id,
      priority: 'alta',
      order_id: req!.id,
    });
    setCaseTicketId(t.id);
    toast.success(`Caso de soporte abierto · #${t.id}`);
  }

  return (
    <div className="flex flex-col gap-5 text-navy">
      {/* Back + header */}
      <FadeIn>
        <Link
          href="/servicios"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-primary"
        >
          <ArrowLeft size={15} /> Volver a servicios
        </Link>
      </FadeIn>

      {disputed && (
        <FadeIn>
          <div
            className="flex items-center gap-4 rounded-2xl p-4 text-white shadow-card"
            style={{
              background: 'linear-gradient(135deg,var(--color-error),#991B1B)',
            }}
          >
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/15">
              <ShieldAlert size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-bold">
                Servicio cancelado · Posible disputa abierta
              </div>
              <div className="mt-0.5 text-[12.5px] text-white/85">
                El cliente reporta inconformidad con el resultado. Revisa la
                evidencia y el chat antes de resolver.
              </div>
            </div>
            {caseTicketId ? (
              <Link
                href="/soporte"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-[13px] font-semibold text-error"
              >
                Ver en soporte <ArrowRight size={13} />
              </Link>
            ) : (
              <button
                onClick={onOpenCase}
                className="inline-flex shrink-0 items-center rounded-lg bg-white px-3.5 py-2 text-[13px] font-semibold text-error"
              >
                Abrir caso de soporte
              </button>
            )}
          </div>
        </FadeIn>
      )}

      <FadeIn>
        <div className="flex items-start gap-4 border-b border-line pb-4">
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
              Servicio
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="font-mono text-[26px] font-semibold tracking-tight">
                #{req.id}
              </h1>
              <StatusPill status={req.status} />
              <MetaTag icon={FolderTree}>
                {cat?.name ?? '—'}
                {req.title ? ` · ${req.title}` : ''}
              </MetaTag>
              <MetaTag icon={Calendar}>
                {fmtTime(req.accepted_at ?? req.created_at)}
              </MetaTag>
              <MetaTag icon={MapPin}>{req.municipality ?? 'ZMG'}</MetaTag>
            </div>
          </div>
          <div className="flex shrink-0 gap-2.5">
            <GhostButton onClick={() => setChatOpen(true)}>
              <span className="inline-flex items-center gap-2">
                <MessageSquare size={14} /> Ver chat
              </span>
            </GhostButton>
            <button
              onClick={() => setChatOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-primary px-3.5 py-2.5 text-[13px] font-semibold text-primary hover:bg-info-soft"
            >
              <UserCog size={14} /> Intervenir
            </button>
            <button
              onClick={() => override('cancelled')}
              className="inline-flex items-center gap-2 rounded-xl border border-error px-3.5 py-2.5 text-[13px] font-semibold text-error hover:bg-error-soft"
            >
              <Ban size={14} /> Cancelar
            </button>
          </div>
        </div>
      </FadeIn>

      {/* 3-col body */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)_minmax(0,320px)]">
        {/* LEFT */}
        <div className="flex flex-col gap-4">
          <FadeIn>
            <Panel title="Cliente">
              <div className="mb-3.5 flex items-center gap-3">
                <Avatar
                  initials={initials(client?.full_name ?? null)}
                  size={48}
                />
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold">
                    {client?.full_name ?? 'Cliente'}
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-muted">
                    {client?.phone ?? '—'}
                  </div>
                </div>
              </div>
              <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.06em] text-faint">
                Dirección del servicio
              </div>
              <div className="flex gap-3">
                <MicroMap />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] leading-relaxed">{addrLine}</div>
                  {addrCity && (
                    <div className="mt-0.5 text-[12px] text-muted">
                      {addrCity}
                    </div>
                  )}
                </div>
              </div>
              <Link
                href={`/clientes/${req.client_id}`}
                className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-primary"
              >
                Ver perfil completo <ArrowRight size={12} />
              </Link>
            </Panel>
          </FadeIn>

          <FadeIn>
            <Panel title="Técnico asignado">
              {techProfile ? (
                <>
                  <div className="flex items-center gap-3">
                    <Avatar
                      initials={initials(techProfile.full_name)}
                      size={48}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[14px] font-semibold">
                          {techProfile.full_name}
                        </span>
                        {techRec?.kyc_status === 'approved' && (
                          <span className="grid size-4 place-items-center rounded-full bg-success-soft">
                            <BadgeCheck size={10} className="text-success" />
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[12px] text-muted">
                        <Star size={11} className="text-warning" />
                        <b className="font-semibold text-navy">
                          {techRec?.rating_avg ?? '—'}
                        </b>
                        <span>({techRec?.rating_count ?? 0})</span>
                        <span>· {techProfile.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-[12.5px] text-muted">
                    {cat?.name} · {techRec?.rating_count ?? 0} trabajos
                  </div>
                  {techRec && (
                    <Link
                      href={`/tecnicos/${techRec.id}`}
                      className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-primary"
                    >
                      Ver perfil <ArrowRight size={12} />
                    </Link>
                  )}
                </>
              ) : (
                <div className="text-[13px] text-muted">
                  Sin técnico asignado todavía.
                </div>
              )}
            </Panel>
          </FadeIn>

          <FadeIn>
            <Panel title="Cobro y comisión">
              <div className="flex justify-between py-1.5 text-[13px]">
                <span>Mano de obra / visita</span>
                <span className="font-mono">{money(baseCents)}</span>
              </div>
              {quoteItems.map(e => (
                <div
                  key={e.id}
                  className="flex justify-between py-1.5 text-[13px] text-muted"
                >
                  <span className="flex items-center gap-1.5">
                    <Plus size={11} className="text-cyan" />
                    {e.description}
                  </span>
                  <span className="font-mono">+{money(e.total_cents)}</span>
                </div>
              ))}
              <div className="mt-1 flex justify-between border-t border-line pt-2.5 text-[13px] font-semibold">
                <span>Subtotal</span>
                <span className="font-mono">{money(subtotalCents)}</span>
              </div>
              <div className="flex justify-between py-1.5 text-[12px] text-muted">
                <span>Comisión plataforma · 15%</span>
                <span className="font-mono">−{money(commissionCents)}</span>
              </div>
              <div className="mt-3 flex items-baseline justify-between rounded-xl bg-info-soft p-3">
                <span className="text-[12px] font-medium text-muted">
                  Neto técnico
                </span>
                <span className="font-mono text-[18px] font-bold">
                  {money(techNetCents)}
                  <span className="ml-1 text-[11px] font-medium text-faint">
                    MXN
                  </span>
                </span>
              </div>
              <div className="mt-3.5 flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3">
                <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/[0.10]">
                  <CreditCard size={16} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-medium capitalize">
                    {payment?.method ?? 'Pago pendiente'}
                  </div>
                  <div className="mt-1">
                    {payment?.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success">
                        <BadgeCheck size={10} /> Pagado
                        {payment.paid_at
                          ? ` · ${fmtTime(payment.paid_at)}`
                          : ''}
                      </span>
                    ) : payment?.status === 'refunded' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-error-soft px-2 py-0.5 text-[11px] font-semibold text-error">
                        <RotateCcw size={10} /> Reembolsado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-semibold text-warning">
                        Pendiente
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Panel>
          </FadeIn>
        </div>

        {/* CENTER — timeline */}
        <div className="flex flex-col gap-4">
          <FadeIn>
            <Panel>
              <div className="mb-4 flex items-center gap-2.5">
                <div className="grid size-[30px] place-items-center rounded-lg bg-primary/[0.10]">
                  <GitCommitVertical size={16} className="text-primary" />
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold">
                    Línea de tiempo del servicio
                  </div>
                  <div className="text-[12px] text-muted">
                    {FLOW.length} etapas · {quoteItems.length} partidas
                    cotizadas
                  </div>
                </div>
              </div>
              <div className="flex flex-col pt-1.5">
                {FLOW.map((s, i) => {
                  const done = i < currentIndex || isTerminal;
                  const current = i === currentIndex && !isTerminal;
                  const future = i > currentIndex && !isTerminal;
                  return (
                    <Reveal key={s}>
                      <div className="flex gap-3.5">
                        <div className="flex shrink-0 flex-col items-center">
                          <div
                            className={`grid size-[30px] place-items-center rounded-full text-[11px] font-bold ${done ? 'bg-success text-white' : current ? 'bg-primary text-white ring-4 ring-primary/15' : 'bg-surface-2 text-faint'}`}
                          >
                            {i + 1}
                          </div>
                          {i < FLOW.length - 1 && (
                            <div
                              className={`min-h-[26px] w-0.5 flex-1 ${done ? 'bg-success' : 'bg-line'}`}
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1 pb-4">
                          <div className="mb-0.5 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${FLOW_ACTOR[s] === 'Cliente' ? 'bg-primary/[0.10] text-primary' : FLOW_ACTOR[s] === 'Técnico' ? 'bg-info-soft text-primary-2' : 'bg-surface-2 text-muted'}`}
                            >
                              {FLOW_ACTOR[s]}
                            </span>
                            {current && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/[0.12] px-2 py-0.5 text-[10.5px] font-bold text-primary">
                                <span className="size-1.5 rounded-full bg-primary ring-2 ring-primary/25" />{' '}
                                Ahora
                              </span>
                            )}
                          </div>
                          <div
                            className={`text-[13.5px] font-semibold leading-snug ${future ? 'text-faint' : 'text-navy'}`}
                          >
                            {FLOW_LABEL[s]}
                          </div>
                          <div
                            className={`mt-0.5 text-[12.5px] ${future ? 'text-faint' : 'text-muted'}`}
                          >
                            Etapa {STATUS_HINT[s]}
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </Panel>
          </FadeIn>

          {req.description && (
            <FadeIn>
              <Panel title="Descripción del problema">
                <p className="text-[13px] leading-relaxed text-navy">
                  {req.description}
                </p>
              </Panel>
            </FadeIn>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4">
          <FadeIn>
            <Panel title="Acciones del admin">
              <div className="mb-2.5">
                <label className="mb-1 block font-mono text-[10.5px] uppercase tracking-[0.06em] text-faint">
                  Override de estado
                </label>
                <div className="relative">
                  <select
                    value={req.status}
                    onChange={e => override(e.target.value as RequestStatus)}
                    className="w-full appearance-none rounded-xl border border-line bg-surface px-3 py-2.5 text-[13px] font-medium text-navy outline-none focus:border-primary"
                  >
                    {[...FLOW, 'cancelled', 'expired'].map(s => (
                      <option key={s} value={s}>
                        {FLOW_LABEL[s as RequestStatus]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint"
                  />
                </div>
              </div>
              <button
                onClick={() => setChatOpen(true)}
                className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-[13px] font-semibold text-white hover:bg-primary-2"
              >
                <MessageSquare size={14} /> Ver chat completo
              </button>
              <button
                onClick={() => setReassignOpen(true)}
                className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[13px] font-medium text-primary hover:bg-info-soft"
              >
                <UserCog size={14} /> Reasignar técnico
              </button>
              <button
                onClick={() => override('cancelled')}
                className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[13px] font-medium text-error hover:bg-error-soft"
              >
                <Ban size={14} /> Cancelar servicio
              </button>
              <button
                onClick={() => refundable && setRefundOpen(true)}
                disabled={!refundable}
                title={
                  refundable
                    ? 'Devuelve el cobro al cliente'
                    : payment?.status === 'refunded'
                      ? 'Este pago ya fue reembolsado'
                      : 'No hay un pago cobrado que reembolsar'
                }
                className={`flex w-full items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-[13px] font-medium ${refundable ? 'border-error bg-error-soft text-error' : 'cursor-not-allowed border-line bg-surface text-faint'}`}
              >
                <RotateCcw size={14} />{' '}
                {payment?.status === 'refunded'
                  ? 'Reembolso emitido'
                  : 'Iniciar reembolso'}
              </button>
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-faint">
                <Info size={11} />{' '}
                <span>Acciones destructivas piden confirmación + motivo.</span>
              </div>
              {!disputed &&
                (caseTicketId ? (
                  <Link
                    href="/soporte"
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[13px] font-medium text-primary hover:bg-info-soft"
                  >
                    <LifeBuoy size={14} /> Ver caso en soporte
                  </Link>
                ) : (
                  <button
                    onClick={onOpenCase}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[13px] font-medium text-navy hover:bg-surface-2"
                  >
                    <LifeBuoy size={14} /> Abrir caso de soporte
                  </button>
                ))}
            </Panel>
          </FadeIn>

          <FadeIn>
            <Panel title="Notas internas">
              <Textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Anota observaciones internas…"
                rows={3}
              />
              <button
                onClick={onSaveNote}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[13px] font-medium text-primary hover:bg-info-soft"
              >
                <Wand2 size={13} /> Guardar nota
              </button>
              <div className="mt-3.5 mb-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-faint">
                Historial
              </div>
              {notes.length === 0 ? (
                <p className="py-1 text-[12.5px] text-faint">
                  Sin notas todavía.
                </p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {notes.map(n => (
                    <FadeIn
                      key={n.id}
                      className="rounded-xl border border-line bg-surface-2 p-3"
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="text-[12px] font-semibold">
                          {n.author}
                        </span>
                        <span className="rounded bg-surface px-1.5 py-px text-[10px] text-faint">
                          Admin
                        </span>
                        <span className="ml-auto font-mono text-[10.5px] text-faint">
                          {fmtTime(n.created_at)}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[12.5px] leading-snug text-navy">
                        {n.text}
                      </p>
                    </FadeIn>
                  ))}
                </div>
              )}
            </Panel>
          </FadeIn>

          <FadeIn>
            <Panel title="Metadata">
              <div className="flex flex-col">
                <MetaRow label="ID">
                  <span className="font-mono text-[12.5px] font-medium">
                    {req.id}
                  </span>
                </MetaRow>
                <MetaRow label="Región">
                  <span className="text-[12.5px]">
                    {req.state ?? 'Jalisco'}
                  </span>
                </MetaRow>
                <MetaRow label="Origen">
                  <span className="flex items-center gap-1.5 text-[12.5px]">
                    <Smartphone size={12} className="text-primary" /> App móvil
                  </span>
                </MetaRow>
                <MetaRow label="Creado">
                  <span className="text-[12.5px]">
                    {fmtTime(req.created_at)}
                  </span>
                </MetaRow>
              </div>
            </Panel>
          </FadeIn>
        </div>
      </div>

      {/* ── Modals ── */}
      <ReassignModal
        open={reassignOpen}
        onClose={() => setReassignOpen(false)}
        currentTechUserId={techUserId}
        onSelect={(userId, name) => {
          reassignRequest(req.id, userId);
          setReassignOpen(false);
          toast.success(`Servicio reasignado a ${name}`);
        }}
      />

      <Modal
        open={refundOpen}
        onClose={() => setRefundOpen(false)}
        title="Iniciar reembolso"
        sub="El monto regresa al método de pago original del cliente. Esta acción no es reversible."
        icon={<RotateCcw size={16} className="text-error" />}
        width={480}
        footer={
          <>
            <GhostButton onClick={() => setRefundOpen(false)}>
              Cancelar
            </GhostButton>
            <button
              onClick={() => {
                refundPayment(req.id);
                setRefundOpen(false);
                toast.success(
                  `Reembolso iniciado · ${money(payment?.amount_cents ?? subtotalCents)}`,
                );
              }}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-error px-4 py-3 font-semibold text-white hover:opacity-90"
            >
              <Check size={14} /> Confirmar reembolso
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between rounded-xl bg-error-soft p-4">
            <span className="text-[13px] font-medium text-error">
              Monto a reembolsar
            </span>
            <span className="font-mono text-[20px] font-bold text-error">
              {money(payment?.amount_cents ?? subtotalCents)}
            </span>
          </div>
          <p className="text-[12.5px] leading-relaxed text-muted">
            El servicio{' '}
            <span className="font-mono font-medium text-navy">#{req.id}</span>{' '}
            pasará a estado <b className="font-semibold text-navy">Cancelado</b>{' '}
            y el pago quedará marcado como{' '}
            <b className="font-semibold text-navy">Reembolsado</b> en Finanzas.
          </p>
        </div>
      </Modal>

      <ChatModal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        requestId={req.id}
        clientName={client?.full_name ?? 'Cliente'}
        techName={techProfile?.full_name ?? 'Técnico'}
      />
    </div>
  );
}

// ── Reasignar técnico ─────────────────────────────────────────────────────────
function ReassignModal({
  open,
  onClose,
  onSelect,
  currentTechUserId,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (userId: string, name: string) => void;
  currentTechUserId: string | null;
}) {
  const candidates = getTechniciansWithProfile().filter(
    ({ tech, profile }) =>
      tech.kyc_status === 'approved' &&
      tech.is_available &&
      profile?.status !== 'suspended' &&
      tech.id !== currentTechUserId,
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reasignar técnico"
      sub="Solo se listan técnicos aprobados y disponibles ahora mismo."
      icon={<UserCog size={16} />}
      width={520}
    >
      {candidates.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-faint">
          No hay técnicos disponibles para reasignar.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {candidates.map(({ tech, profile }) => {
            const name = profile?.full_name ?? 'Técnico';
            return (
              <button
                key={tech.id}
                onClick={() => onSelect(tech.id, name)}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 text-left transition-colors hover:border-primary/40 hover:bg-info-soft"
              >
                <Avatar initials={initials(name)} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-semibold text-navy">
                    {name}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted">
                    <Star size={11} className="text-warning" />
                    {tech.rating_avg > 0
                      ? tech.rating_avg.toFixed(1)
                      : 'nuevo'}{' '}
                    · {tech.rating_count} trabajos
                  </div>
                </div>
                <Badge tone="success">Disponible</Badge>
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

// ── Chat del servicio con intervención del admin ─────────────────────────────
function ChatModal({
  open,
  onClose,
  requestId,
  clientName,
  techName,
}: {
  open: boolean;
  onClose: () => void;
  requestId: string;
  clientName: string;
  techName: string;
}) {
  useTick();
  const [draft, setDraft] = useState('');
  const messages = getMessages(requestId);

  function send() {
    const text = draft.trim();
    if (!text) return;
    sendMessage(requestId, ADMIN_ID, text);
    setDraft('');
    toast.success('Intervención enviada al chat');
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Chat del servicio · ${clientName} y ${techName}`}
      sub="Puedes intervenir: tus mensajes se marcan como admin para ambas partes."
      icon={<MessageSquare size={16} />}
      width={560}
    >
      <div className="flex max-h-[380px] min-h-[200px] flex-col gap-3 overflow-y-auto rounded-xl border border-line bg-surface p-4">
        {messages.length === 0 && (
          <p className="py-8 text-center text-[12.5px] text-faint">
            Sin mensajes en este servicio.
          </p>
        )}
        {messages.map(m => {
          const sender = getProfile(m.sender_id);
          const isAdmin = m.sender_id === ADMIN_ID;
          const isTech = !isAdmin && sender?.role === 'technician';
          return (
            <FadeIn
              key={m.id}
              className={`flex ${isTech || isAdmin ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-[80%] flex-col ${isTech || isAdmin ? 'items-end' : 'items-start'}`}
              >
                {isAdmin && (
                  <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warning-ink">
                    <UserCog size={10} /> Intervención del admin
                  </span>
                )}
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed text-navy ${
                    isAdmin
                      ? 'border border-warning/40 bg-warning-soft'
                      : isTech
                        ? 'rounded-tr-sm border border-primary/[0.22] bg-primary/[0.10]'
                        : 'rounded-tl-sm border border-line bg-white'
                  }`}
                >
                  {m.content}
                </div>
                <span className="mt-1 font-mono text-[10.5px] text-faint">
                  {isAdmin
                    ? 'Sofía M. (admin)'
                    : (sender?.full_name ?? 'Usuario')}{' '}
                  · {fmtTime(m.created_at)}
                </span>
              </div>
            </FadeIn>
          );
        })}
      </div>
      <div className="mt-3">
        <Textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          rows={2}
          placeholder="Escribe como admin — visible para cliente y técnico…"
        />
        <div className="mt-2 flex justify-end">
          <PrimaryButton
            onClick={send}
            disabled={!draft.trim()}
            className="!min-h-[40px] !py-2"
          >
            <span className="inline-flex items-center gap-2">
              <Send size={13} /> Intervenir
            </span>
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}

const STATUS_HINT: Record<RequestStatus, string> = {
  requested: 'inicial del flujo',
  accepted: 'de confirmación',
  enroute: 'de traslado',
  onsite: 'de llegada',
  quote: 'de cotización',
  working: 'de trabajo activo',
  closing: 'de cierre',
  completed: 'de cierre técnico',
  paid: 'de cobro',
  closed: 'de evaluación',
  expired: 'expirada',
  cancelled: 'cancelada',
};

function MetaTag({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-[11.5px] font-medium text-muted">
      <Icon size={12} className="text-muted" /> {children}
    </span>
  );
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-line/60 py-2 last:border-0">
      <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-faint">
        {label}
      </span>
      {children}
    </div>
  );
}

function MicroMap() {
  return (
    <svg
      viewBox="0 0 96 96"
      width="84"
      height="84"
      className="shrink-0 rounded-xl bg-surface-2"
    >
      <path
        d="M0 50 Q 30 40 96 55"
        stroke="#FFFFFF"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <circle
        cx="50"
        cy="50"
        r="22"
        fill="rgba(10,107,207,0.14)"
        stroke="rgba(10,107,207,0.4)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <circle
        cx="50"
        cy="50"
        r="5"
        fill="#0A6BCF"
        stroke="#FFFFFF"
        strokeWidth="2"
      />
    </svg>
  );
}
