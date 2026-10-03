'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  Ban,
  BadgeCheck,
  Check,
  ChevronLeft,
  Copy,
  LifeBuoy,
  MessageSquare,
  Pencil,
  RotateCcw,
  Send,
  ShieldAlert,
  Siren,
  Star,
  UserCog,
  Wrench,
  Undo2,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorPage,
  Input,
  Kicker,
  Modal,
  ScreenSkeleton,
  Select,
  Textarea,
  toast,
} from '@/components/ds';
import { useAction } from '@/components/use-action';
import { TechTypeBadge } from '../../tecnicos/_components/TechTypeParts';
import {
  addNote,
  createTicket,
  fetchOrderMessages,
  getCategories,
  loadExtras,
  getNotes,
  getOrderEvents,
  getPayment,
  getProfile,
  getQuote,
  getQuoteItems,
  getEmergencyConfig,
  getRequest,
  getTickets,
  getTechByUser,
  getTechniciansWithProfile,
  getTechToolViews,
  useExtras,
  listOrderEvidence,
  loadWorld,
  reassignRequest,
  refundPayment,
  refundableCents,
  sendMessage,
  setStatus,
  useTick,
  useWorldFailed,
  useWorldReady,
  type OrderEvidence,
  type OrderMessage,
} from '@/lib/data/store';
import type { RequestStatus } from '@/lib/demo/world';
import { orderCode } from '@/lib/orderCode';
import { fmtDateTime } from '@/lib/dates';
import { useAuth } from '@/lib/auth';
import { formatPhone } from '@/lib/phone';
import { toolsForCategory } from '@/lib/tools';
import {
  Avatar,
  CategoryTile,
  METHOD_LABEL,
  STATUS,
  clock,
  money,
  timeAgo,
} from '../_components/shared';
import { ServiceFormSheet } from '../_components/ServiceFormSheet';
import { EmergencyDispatchCard } from '../_components/EmergencyDispatch';
import {
  includedSurchargeCents,
  isEmergency,
  needsManualAssignment,
  surchargeLabel,
} from '@/lib/emergency';

// Stepper de 8 estados del handoff (closing cuenta como "En servicio";
// closed como "Pagado"). Cancelado/expirado = nodo terminal rojo.
const STEPS: { label: string; statuses: RequestStatus[] }[] = [
  { label: 'Solicitado', statuses: ['requested'] },
  { label: 'Aceptado', statuses: ['accepted'] },
  { label: 'En camino', statuses: ['enroute'] },
  { label: 'En sitio', statuses: ['onsite'] },
  { label: 'Cotización', statuses: ['quote'] },
  { label: 'En servicio', statuses: ['working', 'closing'] },
  { label: 'Completado', statuses: ['completed'] },
  { label: 'Pagado', statuses: ['paid', 'closed'] },
];
const stepIndex = (s: RequestStatus) =>
  STEPS.findIndex(st => st.statuses.includes(s));

// Estados que el admin puede forzar con transition_service_order. `completed`
// y `paid` los fijan el flujo de cierre y el pago (close_service_order /
// webhook): forzarlos dejaba órdenes sin cobro ni evidencia.
const FORCE_TARGETS: RequestStatus[] = [
  'requested',
  'accepted',
  'enroute',
  'onsite',
  'quote',
  'working',
  'closing',
  'closed',
  'cancelled',
];

const EVIDENCE_SLOTS: { kind: string; label: string }[] = [
  { kind: 'request', label: 'Foto del cliente' },
  { kind: 'arrival', label: 'Llegada' },
  { kind: 'work', label: 'Trabajo' },
  { kind: 'final', label: 'Evidencia final' },
];

const ACTOR_LABEL = (actorId: string | null) => {
  if (!actorId) return 'Sistema';
  const p = getProfile(actorId);
  if (!p) return 'Sistema';
  const role =
    p.role === 'admin' ? 'Admin' : p.role === 'technician' ? 'Técnico' : 'Cliente';
  return `${p.full_name ?? role} · ${role}`;
};

export default function ServicioDetailPage() {
  useTick();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const ready = useWorldReady();
  const failed = useWorldFailed();
  const { busy, run } = useAction();
  const { can } = useAuth();
  const canFinance = can('finanzas');
  const canSupport = can('soporte');
  const [editOpen, setEditOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [forceTo, setForceTo] = useState<RequestStatus | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [note, setNote] = useState('');
  const [caseTicketId, setCaseTicketId] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<OrderEvidence[] | null>(null);
  const [evidenceError, setEvidenceError] = useState(false);

  useEffect(() => {
    if (!ready || !id) return;
    let alive = true;
    listOrderEvidence(id).then(
      e => alive && setEvidence(e),
      () => alive && setEvidenceError(true),
    );
    return () => {
      alive = false;
    };
  }, [ready, id]);

  const req = ready ? getRequest(id) : undefined;

  const events = useMemo(
    () => (req ? getOrderEvents(req.id) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [req?.id, req?.updated_at],
  );

  // Desde la lista / dashboard / notificaciones: /servicios/:id?reasignar=1 abre el modal.
  const wantsReassign = req ? needsManualAssignment(req) : false;
  useEffect(() => {
    if (wantsReassign && new URLSearchParams(window.location.search).get('reasignar') === '1')
      setReassignOpen(true);
  }, [wantsReassign]);

  if (failed)
    return (
      <ErrorPage
        kind="500"
        primary={{ label: 'Reintentar', onClick: () => void loadWorld(true) }}
      />
    );
  if (!ready) return <ScreenSkeleton kind="detail" />;
  if (!req)
    return (
      <ErrorPage
        kind="404"
        primary={{ label: 'Volver a servicios', href: '/servicios' }}
      />
    );

  const cat = getCategories().find(c => c.id === req.category_id);
  const client = getProfile(req.client_id);
  const techProfile = req.technician_id ? getProfile(req.technician_id) : null;
  const techRec = req.technician_id ? getTechByUser(req.technician_id) : null;
  const quote = getQuote(req.id);
  const items = quote ? getQuoteItems(quote.id) : [];
  const payment = getPayment(req.id);
  const notes = getNotes(req.id);

  const terminal = req.status === 'cancelled' || req.status === 'expired';
  const current = terminal
    ? // Último paso alcanzado antes de cancelar/expirar.
      Math.max(
        0,
        ...events
          .map(e => stepIndex(e.from_status as RequestStatus))
          .filter(i => i >= 0),
      )
    : stepIndex(req.status);
  const reachedAt = (step: number) => {
    const ev = events.find(e =>
      STEPS[step].statuses.includes(e.to_status as RequestStatus),
    );
    if (ev) return clock(ev.created_at);
    if (step === 0) return clock(req.created_at);
    return null;
  };

  // Cobro y comisión.
  const laborCents = quote?.labor_cents ?? 0;
  const materialsCents = items.reduce((s, i) => s + i.total_cents, 0);
  const totalCents = req.quoted_total_cents ?? quote?.total_cents ?? null;
  const emergency = isEmergency(req);
  const emCfg = getEmergencyConfig();
  const surchargeCents = emergency
    ? includedSurchargeCents({
        emergency_surcharge_cents: req.emergency_surcharge_cents,
        total_cents: totalCents,
        fallback_bps: req.urgent_surcharge_bps || emCfg.surchargeBps,
      })
    : 0;
  const commissionCents =
    payment?.commission_cents ??
    req.commission_cents ??
    (totalCents != null
      ? Math.round(totalCents * ((req.commission_bps ?? 1500) / 10000))
      : null);
  const netCents =
    totalCents != null && commissionCents != null
      ? totalCents - commissionCents
      : null;
  const refundable = payment?.status === 'paid' && refundableCents(payment) > 0;
  const refundMax = payment ? refundableCents(payment) : 0;
  const cancellable = !terminal && !['completed', 'paid', 'closed'].includes(req.status);

  function copyId() {
    void navigator.clipboard.writeText(req!.id).then(
      () => toast.success('ID copiado', orderCode(req!.id)),
      () => toast.error('No se pudo copiar el ID'),
    );
  }

  async function saveNote() {
    const text = note.trim();
    if (!text) return;
    const ok = await run('note', () => addNote('service_orders', req!.id, text), 'Nota agregada');
    if (ok) setNote('');
  }

  async function openCase() {
    if (caseTicketId) return router.push('/soporte');
    const id = await run('case', () =>
      createTicket({
        subject: `Caso de soporte · ${orderCode(req!.id)}`,
        requester_id: req!.client_id,
        order_id: req!.id,
      }),
    );
    if (!id) return;
    const t = getTickets().find(x => x.service_order_id === req!.id);
    setCaseTicketId(t?.id ?? 'nuevo');
    toast.success('Caso de soporte abierto', 'Síguelo en Soporte › Tickets.');
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/servicios"
        className="inline-flex w-fit items-center gap-1 font-display text-[14px] font-bold text-primary hover:underline"
      >
        <ChevronLeft size={16} /> Servicios
      </Link>

      {wantsReassign && (
        <div
          role="alert"
          className="flex flex-col items-start gap-3 rounded-box border border-error-line bg-error-soft p-4 sm:flex-row sm:items-center"
        >
          <Siren size={20} className="text-error" />
          <div className="min-w-0 flex-1">
            <div className="font-display text-[14px] font-bold text-error">
              Emergencia sin técnico — asignar
            </div>
            <div className="text-[13px] text-body">
              Nadie aceptó dentro del tiempo límite. La solicitud sigue activa: asigna un técnico a mano.
            </div>
          </div>
          <Button size="sm" icon={UserCog} onClick={() => setReassignOpen(true)} disabled={!canSupport}>
            Asignar técnico
          </Button>
        </div>
      )}

      {req.is_disputed && (
        <div className="flex flex-col items-start gap-3 rounded-box border border-error-line bg-error-soft p-4 sm:flex-row sm:items-center">
          <ShieldAlert size={20} className="text-error" />
          <div className="min-w-0 flex-1">
            <div className="font-display text-[14px] font-bold text-error">
              Servicio en disputa
            </div>
            <div className="text-[13px] text-body">
              Revisa la evidencia, la bitácora y el chat antes de resolver en
              Soporte.
            </div>
          </div>
          <Button size="sm" variant="secondary" icon={LifeBuoy} loading={busy === 'case'} onClick={() => void openCase()}>
            {caseTicketId ? 'Ver en soporte' : 'Abrir caso'}
          </Button>
        </div>
      )}

      {/* Encabezado + stepper */}
      <Card padded className="animate-up">
        <div className="flex flex-wrap items-start gap-4">
          <CategoryTile slug={cat?.slug} size={52} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11.5px] tracking-[0.06em] text-muted">
              <span>{orderCode(req.id)}</span>
              <span>·</span>
              <span>{req.municipality ?? 'ZMG'}</span>
              <span>·</span>
              <span>{timeAgo(req.created_at)}</span>
              <button
                type="button"
                onClick={copyId}
                aria-label="Copiar ID del servicio"
                className="ml-1 rounded p-0.5 text-muted hover:text-primary"
              >
                <Copy size={13} />
              </button>
            </div>
            <h1 className="mt-1 font-display text-[24px] font-extrabold tracking-[-0.5px] text-navy">
              {cat?.name ?? 'Servicio'}
              {req.title ? (
                <span className="font-bold text-muted"> · {req.title}</span>
              ) : null}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={STATUS[req.status].tone} dot>
              {STATUS[req.status].label}
            </Badge>
            {emergency && (
              <Badge tone="danger">
                Emergencia
                {req.emergency_surcharge_cents != null
                  ? ` · ${surchargeLabel('fixed', 0, req.emergency_surcharge_cents)}`
                  : req.urgent_surcharge_bps
                    ? ` · ${surchargeLabel('percent', req.urgent_surcharge_bps, 0)}`
                    : ''}
              </Badge>
            )}
            <Button variant="secondary" icon={Pencil} onClick={() => setEditOpen(true)}>
              Editar
            </Button>
          </div>
        </div>

        {/* Stepper */}
        <ol className="mt-6 grid grid-cols-4 gap-y-5 sm:grid-cols-8" aria-label="Progreso del servicio">
          {STEPS.map((st, i) => {
            const done = i < current || (!terminal && i === current && ['paid', 'closed'].includes(req.status));
            const now = !terminal && i === current && !done;
            const lastReached = terminal && i === current;
            const t = i <= current ? reachedAt(i) : null;
            return (
              <li key={st.label} className="relative flex flex-col items-start">
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className={`absolute left-[26px] right-0 top-[12px] h-[2px] ${i < current ? 'bg-primary' : 'bg-line'}`}
                  />
                )}
                <span
                  className={`relative z-[1] grid h-6 w-6 place-items-center rounded-full border-2 ${
                    done
                      ? 'border-primary bg-primary text-white'
                      : now
                        ? 'border-primary bg-card'
                        : lastReached
                          ? 'border-error bg-error text-white'
                          : 'border-line-strong bg-card'
                  }`}
                >
                  {done ? (
                    <Check size={13} strokeWidth={3} />
                  ) : now ? (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  ) : lastReached ? (
                    <Ban size={12} />
                  ) : null}
                </span>
                <span
                  className={`mt-2 pr-1 font-display text-[11px] font-bold leading-tight sm:text-[13px] ${
                    now ? 'text-primary' : i <= current ? 'text-navy' : 'text-faint'
                  }`}
                >
                  {st.label}
                </span>
                <span className="font-mono text-[10px] text-muted sm:text-[11px]">{t ?? '—'}</span>
              </li>
            );
          })}
        </ol>
        {terminal && (
          <div className="mt-4 flex items-center gap-2 rounded-btn bg-error-soft px-3 py-2 text-[13px] text-error">
            <Ban size={14} />
            <span className="font-display font-bold">
              {req.status === 'cancelled' ? 'Cancelado' : 'Expirado'}
            </span>
            {req.cancellation_reason && (
              <span className="text-body">· {req.cancellation_reason}</span>
            )}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        {/* Columna principal */}
        <div className="flex min-w-0 flex-col gap-4">
          {emergency && canSupport && (
            <EmergencyDispatchCard orderId={req.id} dispatchStatus={req.dispatch_status} />
          )}
          <Card padded>
            <Kicker className="mb-3">Descripción del problema</Kicker>
            <p className="text-[15px] leading-relaxed text-navy">
              {req.description ? `“${req.description}”` : 'Sin descripción.'}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {EVIDENCE_SLOTS.map(slot => {
                const ev = evidence?.find(e =>
                  slot.kind === 'final' ? e.is_final || e.kind === 'final' : e.kind === slot.kind,
                );
                return (
                  <figure
                    key={slot.kind}
                    className="relative aspect-[4/3] overflow-hidden rounded-box border border-line bg-panel"
                  >
                    {ev?.url ? (
                      <a href={ev.url} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={ev.url} alt={slot.label} className="h-full w-full object-cover" />
                      </a>
                    ) : (
                      <div
                        className="h-full w-full"
                        style={{
                          backgroundImage:
                            'repeating-linear-gradient(135deg, transparent 0 10px, color-mix(in srgb, var(--color-line) 70%, transparent) 10px 11px)',
                        }}
                      />
                    )}
                    <figcaption className="absolute inset-x-0 bottom-2 text-center font-mono text-[11px] text-muted">
                      {evidence === null && !evidenceError
                        ? 'cargando…'
                        : ev
                          ? slot.label.toLowerCase()
                          : `${slot.label.toLowerCase()} · sin foto`}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
            {evidenceError && (
              <p className="mt-2 text-[12.5px] text-error">
                No pudimos cargar las fotos de evidencia.
              </p>
            )}
          </Card>

          <Card padded>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-[16px] font-bold text-navy">Bitácora</h2>
              <Button size="sm" variant="ghost" icon={MessageSquare} onClick={() => setChatOpen(true)}>
                Ver chat
              </Button>
            </div>
            {events.length === 0 ? (
              <EmptyState compact kind="first-use" title="Sin movimientos todavía" />
            ) : (
              <ol className="flex flex-col">
                {events.map((e, i) => {
                  const label = (st: string | null) =>
                    STATUS[st as RequestStatus]?.label ?? st ?? '—';
                  return (
                    <li key={e.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        {e.is_revert ? (
                          <span className="mt-0.5 grid h-4 w-4 place-items-center rounded-full bg-warning-soft text-warning">
                            <Undo2 size={10} />
                          </span>
                        ) : (
                          <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                        )}
                        {i < events.length - 1 && <span className="w-[2px] flex-1 bg-line" />}
                      </div>
                      <div className="min-w-0 flex-1 pb-4">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span
                            className={`font-display text-[13.5px] font-bold ${e.is_revert ? 'text-warning' : 'text-navy'}`}
                          >
                            {e.is_revert
                              ? `Estado revertido: ${label(e.from_status)} → ${label(e.to_status)}`
                              : label(e.to_status)}
                          </span>
                          <span className="font-mono text-[11px] text-muted">
                            {fmtDateTime(e.created_at, {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="text-[12.5px] text-muted">
                          {ACTOR_LABEL(e.actor_id)}
                          {e.note ? ` · ${e.note}` : ''}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </Card>

          <Card padded>
            <h2 className="mb-3 font-display text-[16px] font-bold text-navy">Notas internas</h2>
            <Textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder="Solo visible para el equipo admin…"
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void saveNote();
              }}
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[12px] text-faint">⌘↵ para guardar · queda en la bitácora admin</span>
              <Button size="sm" onClick={() => void saveNote()} loading={busy === 'note'} disabled={!note.trim()}>
                Guardar nota
              </Button>
            </div>
            {notes.length > 0 && (
              <ul className="mt-4 flex flex-col gap-2.5">
                {notes.map(n => (
                  <li key={n.id} className="rounded-box border border-line bg-panel p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-[13px] font-bold text-navy">{n.author}</span>
                      <span className="font-mono text-[11px] text-muted">{timeAgo(n.created_at)}</span>
                    </div>
                    <p className="mt-1 text-[13.5px] text-body">{n.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Columna lateral */}
        <div className="flex min-w-0 flex-col gap-4">
          <Card padded>
            <Kicker className="mb-3">Cliente</Kicker>
            <div className="flex items-center gap-3">
              <Avatar name={client?.full_name} size={42} />
              <div className="min-w-0">
                <div className="truncate font-display text-[15px] font-bold text-navy">
                  {client?.full_name ?? 'Cliente'}
                </div>
                <div className="font-mono text-[12px] text-muted">
                  {formatPhone(client?.phone) || '—'}
                </div>
              </div>
            </div>
            <p className="mt-3 text-[13px] text-body">
              {[req.address_line, req.neighborhood, req.municipality].filter(Boolean).join(', ') ||
                'Dirección no disponible'}
            </p>
            <Link
              href={`/clientes/${req.client_id}`}
              className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline"
            >
              Ver cliente <ArrowRight size={13} />
            </Link>
          </Card>

          <Card padded>
            <div className="mb-3 flex items-center justify-between">
              <Kicker>Técnico</Kicker>
              <Button size="sm" variant="ghost" icon={UserCog} onClick={() => setReassignOpen(true)} disabled={terminal || !canSupport}>
                Reasignar
              </Button>
            </div>
            {techProfile ? (
              <div className="flex items-center gap-3">
                <Avatar name={techProfile.full_name} size={42} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-display text-[15px] font-bold text-navy">
                      {techProfile.full_name}
                    </span>
                    {techRec?.kyc_status === 'approved' && (
                      <BadgeCheck size={15} className="text-success" aria-label="Verificado" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[12.5px] text-muted">
                    <Star size={12} className="text-warning" fill="currentColor" />
                    {techRec && techRec.rating_avg > 0 ? techRec.rating_avg.toFixed(1) : 'nuevo'}
                    <span>· {techRec?.rating_count ?? 0} trabajos</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[13.5px] text-muted">Sin técnico asignado todavía.</p>
            )}
            {techRec && (
              <Link
                href={`/tecnicos/${techRec.id}`}
                className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline"
              >
                Ver técnico <ArrowRight size={13} />
              </Link>
            )}
          </Card>

          <Card padded>
            <Kicker className="mb-3">Cobro y comisión</Kicker>
            <dl className="flex flex-col gap-2 text-[13.5px]">
              <Row label="Mano de obra" value={money(laborCents || null, true)} />
              <Row label="Materiales" value={money(materialsCents || null, true)} />
              {emergency && <Row label="Recargo de emergencia" value={money(surchargeCents || null, true)} />}
              <div className="my-1 border-t border-divider" />
              <Row label="Total" value={money(totalCents, true)} strong />
              <Row
                label={`Comisión ${((req.commission_bps ?? 1500) / 100).toFixed(0)}%`}
                value={commissionCents != null ? `−${money(commissionCents, true)}` : '—'}
              />
              <Row label="Neto técnico" value={money(netCents, true)} strong />
            </dl>
            <div className="mt-3 flex items-center justify-between rounded-btn bg-panel px-3 py-2 text-[12.5px]">
              <span className="text-muted">
                {payment ? (METHOD_LABEL[payment.method] ?? payment.method) : 'Sin pago'}
              </span>
              {payment ? (
                <Badge
                  tone={payment.status === 'paid' ? 'success' : payment.status === 'refunded' ? 'danger' : 'warning'}
                >
                  {payment.status === 'paid' ? 'Pagado' : payment.status === 'refunded' ? 'Reembolsado' : 'Pendiente'}
                </Badge>
              ) : (
                <Badge>Pendiente</Badge>
              )}
            </div>
          </Card>

          <Card padded>
            <Kicker className="mb-3">Acciones del admin</Kicker>
            <div className="flex flex-col gap-2.5">
              <Select
                aria-label="Forzar estado"
                placeholder="Forzar estado…"
                options={FORCE_TARGETS.filter(s => s !== req.status).map(s => ({
                  value: s,
                  label: STATUS[s].label,
                }))}
                value={null}
                onChange={s => setForceTo(s)}
                disabled={busy !== null || !canSupport}
              />
              <Button
                variant="secondary"
                icon={RotateCcw}
                disabled={!refundable || !canFinance}
                title={
                  !canFinance
                    ? 'Solo finanzas emite reembolsos'
                    : refundable
                      ? 'Devuelve el cobro al cliente'
                      : payment?.status === 'refunded'
                        ? 'Este pago ya fue reembolsado'
                        : 'No hay un pago cobrado que reembolsar'
                }
                onClick={() => setRefundOpen(true)}
              >
                {payment?.status === 'refunded' ? 'Reembolso emitido' : 'Reembolsar'}
              </Button>
              <Button
                variant="destructive"
                icon={Ban}
                disabled={!cancellable || !canSupport}
                onClick={() => setCancelOpen(true)}
              >
                Cancelar servicio
              </Button>
              {!req.is_disputed && (
                <Button variant="ghost" icon={LifeBuoy} loading={busy === 'case'} onClick={() => void openCase()}>
                  {caseTicketId ? 'Ver caso en soporte' : 'Abrir caso de soporte'}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Modales y sheets ── */}
      <ServiceFormSheet open={editOpen} order={req} onClose={() => setEditOpen(false)} />

      <ReassignModal
        open={reassignOpen}
        onClose={() => setReassignOpen(false)}
        currentTechUserId={req.technician_id}
        categoryId={req.category_id}
        busy={busy === 'reassign'}
        onSelect={async (userId, name) => {
          const ok = await run('reassign', () => reassignRequest(req.id, userId), `Servicio reasignado a ${name}`);
          if (ok) setReassignOpen(false);
        }}
      />

      <Modal
        open={forceTo !== null}
        onClose={() => busy === null && setForceTo(null)}
        dismissible={busy === null}
        title="Forzar estado"
        icon={UserCog}
        tone="warning"
        description={
          forceTo
            ? `El servicio pasará de “${STATUS[req.status].label}” a “${STATUS[forceTo].label}”. Queda en la bitácora como cambio manual.`
            : undefined
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setForceTo(null)} disabled={busy !== null}>
              Cancelar
            </Button>
            <Button
              loading={busy === 'force'}
              onClick={async () => {
                if (!forceTo) return;
                const ok = await run(
                  'force',
                  () => setStatus(req.id, forceTo, 'Cambio manual desde la consola'),
                  `Estado actualizado · ${STATUS[forceTo].label}`,
                );
                if (ok) setForceTo(null);
              }}
            >
              Confirmar
            </Button>
          </>
        }
      />

      <Modal
        open={cancelOpen}
        onClose={() => busy === null && setCancelOpen(false)}
        dismissible={busy === null}
        title="Cancelar servicio"
        icon={Ban}
        tone="danger"
        description="El cliente y el técnico verán el servicio como cancelado. Esta acción no se puede deshacer."
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelOpen(false)} disabled={busy !== null}>
              Volver
            </Button>
            <Button
              variant="destructive"
              loading={busy === 'cancel'}
              onClick={async () => {
                const ok = await run(
                  'cancel',
                  () => setStatus(req.id, 'cancelled', 'Cancelado por admin desde la consola'),
                  `${orderCode(req.id)} cancelado`,
                );
                if (ok) setCancelOpen(false);
              }}
            >
              Cancelar servicio
            </Button>
          </>
        }
      />

      <RefundModal
        open={refundOpen}
        onClose={() => setRefundOpen(false)}
        maxCents={refundMax}
        busy={busy === 'refund'}
        onConfirm={async (reason, amountCents) => {
          const ok = await run(
            'refund',
            () => refundPayment(req.id, reason || undefined, amountCents),
            `Reembolso emitido · ${money(amountCents, true)}`,
          );
          if (ok) setRefundOpen(false);
        }}
      />

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

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={strong ? 'font-display font-bold text-navy' : 'text-muted'}>{label}</dt>
      <dd className={`font-mono tabular ${strong ? 'text-[15px] font-semibold text-navy' : 'text-body'}`}>
        {value}
      </dd>
    </div>
  );
}

function ReassignModal({
  open,
  onClose,
  onSelect,
  currentTechUserId,
  categoryId,
  busy,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (userId: string, name: string) => void;
  currentTechUserId: string | null;
  /** Categoría del servicio: se muestran las herramientas del técnico para ella. */
  categoryId?: string | null;
  busy?: boolean;
}) {
  useExtras(s => s.techTools);
  useExtras(s => s.toolCatalog);
  const [q, setQ] = useState('');
  useEffect(() => {
    if (open) void loadExtras();
  }, [open]);
  const candidates = getTechniciansWithProfile()
    .filter(
      ({ tech, profile }) =>
        tech.kyc_status === 'approved' &&
        profile?.status !== 'suspended' &&
        tech.id !== currentTechUserId,
    )
    .filter(({ profile }) =>
      (profile?.full_name ?? '').toLowerCase().includes(q.trim().toLowerCase()),
    )
    .sort((a, b) => Number(b.tech.is_available) - Number(a.tech.is_available));

  return (
    <Modal
      open={open}
      onClose={() => !busy && onClose()}
      dismissible={!busy}
      title="Reasignar técnico"
      description="Técnicos aprobados; los disponibles primero."
      icon={UserCog}
      width={520}
    >
      <Input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Buscar técnico"
        aria-label="Buscar técnico"
        wrapperClassName="mb-3"
      />
      {candidates.length === 0 ? (
        <EmptyState compact kind="no-results" title="No hay técnicos para reasignar" />
      ) : (
        <ul className="flex max-h-[360px] flex-col gap-2 overflow-y-auto">
          {candidates.map(({ tech, profile }) => {
            const name = profile?.full_name ?? 'Técnico';
            return (
              <li key={tech.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onSelect(tech.id, name)}
                  className="flex w-full items-center gap-3 rounded-box border border-line bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-tint disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Avatar name={name} size={38} />
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-display text-[14px] font-bold text-navy">{name}</span>
                      <span className="sm:hidden"><TechTypeBadge techId={tech.id} short /></span>
                      <span className="hidden sm:inline"><TechTypeBadge techId={tech.id} /></span>
                    </div>
                    <div className="flex items-center gap-1 text-[12px] text-muted">
                      <Star size={11} className="text-warning" fill="currentColor" />
                      {tech.rating_avg > 0 ? tech.rating_avg.toFixed(1) : 'nuevo'} · {tech.rating_count} trabajos
                    </div>
                    <ToolChips techId={tech.id} categoryId={categoryId} />
                  </div>
                  <Badge tone={tech.is_available ? 'success' : 'neutral'} dot>
                    {tech.is_available ? 'Disponible' : 'Ocupado'}
                  </Badge>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}

/** Herramientas del técnico para la categoría del servicio (chips compactos, «+N»). */
function ToolChips({ techId, categoryId }: { techId: string; categoryId?: string | null }) {
  const tools = toolsForCategory(getTechToolViews(techId), categoryId);
  if (tools.length === 0) return null;
  const MAX = 3;
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1" title={tools.map(t => t.name).join(' · ')}>
      {tools.slice(0, MAX).map(t => (
        <span
          key={t.rowId}
          className="inline-flex max-w-full items-center gap-1 rounded-full bg-tint px-2 py-0.5 font-sans text-[11px] text-body"
        >
          <Wrench size={10} className="flex-shrink-0 text-faint" aria-hidden />
          <span className="truncate">{t.name}</span>
        </span>
      ))}
      {tools.length > MAX && (
        <span className="font-sans text-[11px] font-semibold text-muted">+{tools.length - MAX}</span>
      )}
    </div>
  );
}

function RefundModal({
  open,
  onClose,
  maxCents,
  busy,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  maxCents: number;
  busy: boolean;
  onConfirm: (reason: string, amountCents: number) => void;
}) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  useEffect(() => {
    if (open) {
      setAmount(String(maxCents / 100));
      setReason('');
    }
  }, [open, maxCents]);
  const pesos = Number(amount.replace(/[^\d.]/g, ''));
  const cents = Number.isFinite(pesos) ? Math.round(pesos * 100) : 0;
  const invalid = cents < 1 || cents > maxCents;
  const partial = !invalid && cents < maxCents;

  return (
    <Modal
      open={open}
      onClose={() => !busy && onClose()}
      dismissible={!busy}
      title="Reembolsar"
      icon={RotateCcw}
      tone="danger"
      description="El dinero regresa al método de pago original. El reembolso total cancela el servicio; uno parcial lo deja como está. No es reversible."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Volver
          </Button>
          <Button
            variant="destructive"
            loading={busy}
            disabled={invalid}
            onClick={() => onConfirm(reason.trim(), cents)}
          >
            Reembolsar {invalid ? '' : money(cents, true)}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Input
          label="Monto"
          prefix="$"
          inputMode="decimal"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          hint={`Queda por reembolsar ${money(maxCents, true)}`}
          error={invalid && amount !== '' ? `Entre $0.01 y ${money(maxCents, true)}` : null}
        />
        {partial && (
          <p className="rounded-btn bg-info-soft px-3 py-2 text-[12.5px] text-body">
            Reembolso parcial: el resto sigue cobrado y el servicio no se cancela.
          </p>
        )}
        <Textarea
          rows={2}
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Motivo (queda en la bitácora)"
          aria-label="Motivo del reembolso"
        />
      </div>
    </Modal>
  );
}

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
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<OrderMessage[] | null>(null);
  const [sending, setSending] = useState(false);
  const load = () =>
    fetchOrderMessages(requestId).then(setMessages, () => {
      setMessages([]);
      toast.error('No se pudo cargar el chat.');
    });
  useEffect(() => {
    if (open) void load();
    else setMessages(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, requestId]);

  async function send() {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    const ok = await sendMessage(requestId, text);
    setSending(false);
    if (!ok) return;
    setDraft('');
    await load();
    toast.success('Intervención enviada al chat');
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chat del servicio"
      description={`${clientName} y ${techName}. Tus mensajes se marcan como admin.`}
      icon={MessageSquare}
      width={560}
    >
      <div className="flex max-h-[360px] min-h-[180px] flex-col gap-3 overflow-y-auto rounded-box border border-line bg-panel p-4">
        {messages === null && (
          <p className="py-8 text-center text-[13px] text-faint">Cargando chat…</p>
        )}
        {messages?.length === 0 && (
          <p className="py-8 text-center text-[13px] text-faint">Sin mensajes en este servicio.</p>
        )}
        {(messages ?? []).map(m => {
          const sender = getProfile(m.sender_id);
          const isAdmin = sender?.role === 'admin';
          const mine = isAdmin || sender?.role === 'technician';
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] flex-col ${mine ? 'items-end' : 'items-start'}`}>
                {isAdmin && (
                  <Badge tone="warning" mono className="mb-1">
                    Admin
                  </Badge>
                )}
                <div
                  className={`rounded-box px-3.5 py-2.5 text-[13.5px] text-navy ${
                    isAdmin ? 'bg-warning-soft' : mine ? 'bg-info-soft' : 'border border-line bg-card'
                  }`}
                >
                  {m.body}
                </div>
                <span className="mt-1 font-mono text-[10.5px] text-faint">
                  {isAdmin ? 'Admin' : (sender?.full_name ?? 'Usuario')} · {clock(m.created_at)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-2">
        <Textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          rows={2}
          placeholder="Escribe como admin…"
          aria-label="Mensaje"
          className="min-h-[64px]"
        />
        <Button icon={Send} onClick={() => void send()} loading={sending} disabled={!draft.trim()} className="self-end">
          Enviar
        </Button>
      </div>
    </Modal>
  );
}
