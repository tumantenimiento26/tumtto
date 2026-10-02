'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  FileText,
  Plus,
  Search,
  Send,
  ShieldAlert,
  X,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorPage,
  Field,
  Input,
  Kicker,
  Modal,
  PageHeader,
  ScreenSkeleton,
  Segmented,
  Select,
  Tabs,
  Textarea,
  Chip,
  snackbar,
  type Tone,
} from '@/components/ds';
import { useAction } from '@/components/use-action';
import {
  getAllDisputes,
  getPendingKyc,
  getKycSessions,
  getProfile,
  getRequest,
  getTickets,
  getTicket,
  getAllProfiles,
  getClientRequests,
  getNotes,
  getTechRequests,
  getTicketMessages,
  isTicketOpen,
  resolveDispute,
  escalateDispute,
  resolveKyc,
  rejectKyc,
  createTicket,
  replyTicket,
  resolveTicket,
  reopenTicket,
  ticketRequester,
  useWorldReady,
  useWorldFailed,
  loadWorld,
  useTick,
  type Ticket,
  type TicketStatus,
} from '@/lib/data/store';
import { formatPhone } from '@/lib/phone';
import { orderCode } from '@/lib/orderCode';
import { timeAgo } from '@/lib/data/notifications';
import {
  RESOLUTIONS,
  disputeCode,
  matches,
  resolutionNote,
  type Resolution,
} from '@/lib/supportFormat';

type TabKey = 'disputas' | 'tickets' | 'kyc';

const TICKET_STATUS: Record<TicketStatus, { label: string; tone: Tone }> = {
  open: { label: 'Abierto', tone: 'danger' },
  pending: { label: 'En espera', tone: 'warning' },
  in_progress: { label: 'En proceso', tone: 'info' },
  resolved: { label: 'Resuelto', tone: 'success' },
  closed: { label: 'Cerrado', tone: 'neutral' },
};
/** Rol del usuario del ticket (cliente/técnico) a partir de su perfil. */
const ticketRole = (t: Ticket) =>
  getProfile(ticketRequester(t))?.role === 'technician' ? 'tecnico' : 'cliente';
const ORDER_STATUS: Record<string, string> = {
  requested: 'Solicitado',
  accepted: 'Aceptado',
  enroute: 'En camino',
  onsite: 'En sitio',
  quote: 'Cotizando',
  working: 'En trabajo',
  closing: 'Cobrando',
  completed: 'Completado',
  paid: 'Pagado',
  closed: 'Cerrado',
  expired: 'Expirado',
  cancelled: 'Cancelado',
};

const initials = (name?: string | null) =>
  (name ?? '?')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

function Avatar({ name, size = 36 }: { name?: string | null; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-action font-display text-[12px] font-bold text-white"
      style={{ width: size, height: size }}
    >
      {initials(name)}
    </span>
  );
}

export default function SoportePage() {
  useTick();
  const ready = useWorldReady();
  const failed = useWorldFailed();
  const [tab, setTab] = useState<TabKey>('disputas');
  const [newTicketOpen, setNewTicketOpen] = useState(false);

  const activeDisputes = getAllDisputes().filter(
    d => d.status === 'open' || d.status === 'in_review',
  );
  const openTickets = getTickets().filter(isTicketOpen);
  const pendingKyc = getPendingKyc();

  if (failed)
    return (
      <ErrorPage
        kind="500"
        primary={{ label: 'Reintentar', onClick: () => void loadWorld(true) }}
      />
    );
  if (!ready) return <ScreenSkeleton kind="list" />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Soporte y disputas"
        description="Una disputa no detiene el servicio: la orden sigue su curso mientras se resuelve."
        actions={
          <Button icon={Plus} onClick={() => setNewTicketOpen(true)}>
            Nuevo ticket
          </Button>
        }
      />

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          {
            value: 'disputas',
            label: 'Disputas',
            count: activeDisputes.length,
          },
          { value: 'tickets', label: 'Tickets', count: openTickets.length },
          { value: 'kyc', label: 'Cola KYC', count: pendingKyc.length },
        ]}
      />

      <div key={tab} className="animate-up">
        {tab === 'disputas' ? (
          <DisputesView />
        ) : tab === 'tickets' ? (
          <TicketsView />
        ) : (
          <KycView />
        )}
      </div>

      <NewTicketModal
        open={newTicketOpen}
        onClose={() => setNewTicketOpen(false)}
        onCreated={() => setTab('tickets')}
      />
    </div>
  );
}

// ── Disputas ────────────────────────────────────────────────────────────────
function DisputesView() {
  useTick();
  const disputes = getAllDisputes()
    .filter(d => d.status === 'open' || d.status === 'in_review')
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const [selected, setSelected] = useState<string | null>(null);
  const current = disputes.find(d => d.id === selected) ?? null;

  if (disputes.length === 0)
    return (
      <Card padded>
        <EmptyState
          kind="all-clear"
          title="Sin disputas abiertas"
          description="Cuando un cliente o técnico abra una disputa aparecerá aquí."
        />
      </Card>
    );

  return (
    <div className="grid grid-cols-1 items-start gap-3.5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <div
        className={`flex flex-col gap-2.5 ${current ? 'hidden lg:flex' : ''}`}
      >
        {disputes.map(d => {
          const req = getRequest(d.service_order_id);
          const opener = getProfile(d.opened_by);
          const tech = req?.technician_id
            ? getProfile(req.technician_id)
            : null;
          const active = d.id === selected;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelected(d.id)}
              className={`rounded-box border bg-card p-4 text-left transition-[border-color,box-shadow] hover:shadow-kpi ${
                active ? 'border-primary shadow-focus' : 'border-line'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11.5px] font-medium text-primary">
                  {disputeCode(d.id)} · {orderCode(d.service_order_id)}
                </span>
                <Badge tone={d.status === 'open' ? 'danger' : 'warning'}>
                  {d.status === 'open' ? 'Abierta' : 'En revisión'}
                </Badge>
              </div>
              <div className="mt-2 font-display text-[15px] font-bold text-navy">
                {d.reason}
              </div>
              <div className="mt-1 font-sans text-[12.5px] text-muted">
                {opener?.full_name ?? 'Usuario'}
                {tech ? ` vs ${tech.full_name}` : ''} · {timeAgo(d.created_at)}
              </div>
            </button>
          );
        })}
      </div>

      {current ? (
        <DisputeDetail
          key={current.id}
          dispute={current}
          onBack={() => setSelected(null)}
        />
      ) : (
        <Card padded className="hidden lg:block">
          <EmptyState
            kind="action"
            title="Selecciona una disputa"
            description="Revisa las partes y el servicio, y decide la resolución."
          />
        </Card>
      )}
    </div>
  );
}

function DisputeDetail({
  dispute,
  onBack,
}: {
  dispute: ReturnType<typeof getAllDisputes>[number];
  onBack: () => void;
}) {
  const req = getRequest(dispute.service_order_id);
  const opener = getProfile(dispute.opened_by);
  const tech = req?.technician_id ? getProfile(req.technician_id) : null;
  const escalated = dispute.status === 'in_review';
  const [resolution, setResolution] = useState<Resolution>('favor_cliente');
  const [comment, setComment] = useState('');
  const { busy, run } = useAction();
  const code = disputeCode(dispute.id);
  // Bitácora de la disputa (escalaciones y notas) desde admin_events.
  const log = getNotes(dispute.id);

  return (
    <Card padded className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver a la lista"
          className="-ml-1 grid h-8 w-8 place-items-center rounded-btn text-muted hover:bg-panel lg:hidden"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="grid h-10 w-10 place-items-center rounded-btn bg-error-soft">
          <ShieldAlert size={18} className="text-error" />
        </span>
        <div className="min-w-0 flex-1">
          <Kicker tone="primary">
            {code} · {orderCode(dispute.service_order_id)}
          </Kicker>
          <h2 className="mt-1 font-display text-[19px] font-extrabold text-navy">
            {dispute.reason}
          </h2>
          <p className="mt-0.5 font-sans text-[12.5px] text-muted">
            Abierta {timeAgo(dispute.created_at)}
          </p>
        </div>
        {escalated && (
          <Badge tone="warning">
            <ArrowUpRight size={11} /> Escalada
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Party name={opener?.full_name} role="Abrió la disputa" />
        <Party name={tech?.full_name} role="Técnico del servicio" />
      </div>

      {req && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-box border border-line bg-panel px-4 py-3">
          <div className="min-w-0">
            <div className="font-mono text-[12px] font-medium text-primary">
              {orderCode(req.id)}
            </div>
            <p className="mt-0.5 line-clamp-2 font-sans text-[13px] text-body">
              {req.description ?? 'Sin descripción'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="info">{ORDER_STATUS[req.status] ?? req.status}</Badge>
            <Link
              href={`/servicios/${req.id}`}
              className="inline-flex items-center gap-1 font-sans text-[12.5px] font-semibold text-primary"
            >
              Ver servicio <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      )}

      {log.length > 0 && (
        <div className="rounded-box border border-warning-ring bg-warning-soft px-4 py-3 font-sans text-[12.5px] text-warning-ink">
          {log.slice(0, 3).map(n => (
            <div key={n.id}>
              {n.text} <span className="opacity-70">· {n.author} · {timeAgo(n.created_at)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-divider pt-5">
        <Kicker>Resolución</Kicker>
        <Segmented
          options={RESOLUTIONS.map(r => ({ value: r.value, label: r.label }))}
          value={resolution}
          onChange={setResolution}
        />
        <Textarea
          rows={3}
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Qué se decidió y por qué (lo verán ambas partes)"
        />
        <p className="font-sans text-[12px] text-muted">
          Al resolver se libera el saldo retenido del técnico y se notifica a
          ambas partes.
          {resolution === 'favor_cliente' &&
            ' Si hay reembolso, emítelo desde el detalle del servicio: resolver la disputa no mueve dinero.'}
        </p>
        <div className="flex flex-wrap justify-end gap-2">
          {!escalated && (
            <Button
              variant="secondary"
              icon={ArrowUpRight}
              disabled={!!busy}
              loading={busy === 'escalate'}
              onClick={() =>
                void run(
                  'escalate',
                  () => escalateDispute(dispute.id),
                  `Disputa escalada · ${code}`,
                )
              }
            >
              Escalar
            </Button>
          )}
          <Button
            variant="approve"
            icon={Check}
            disabled={!!busy}
            loading={busy === 'resolve'}
            onClick={() =>
              void run(
                'resolve',
                () =>
                  resolveDispute(
                    dispute.id,
                    resolution,
                    resolutionNote(resolution, comment),
                  ),
                `Disputa resuelta · ${code}`,
              )
            }
          >
            Resolver disputa
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Party({ name, role }: { name?: string | null; role: string }) {
  return (
    <div className="flex items-center gap-3 rounded-box border border-line px-3.5 py-3">
      <Avatar name={name} />
      <div className="min-w-0">
        <div className="truncate font-sans text-[13.5px] font-semibold text-navy">
          {name ?? '—'}
        </div>
        <div className="font-sans text-[12px] text-muted">{role}</div>
      </div>
    </div>
  );
}

// ── Tickets (support_tickets + ticket_messages) ─────────────────────────────
function TicketsView() {
  useTick();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const tickets = getTickets();
  const filtered = useMemo(
    () =>
      tickets.filter(t =>
        matches(query, t.subject, t.id, getProfile(ticketRequester(t))?.full_name),
      ),
    [tickets, query],
  );
  const ticket = selected ? getTicket(selected) : null;

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-box border border-line bg-card xl:h-[640px] xl:grid-cols-[300px_minmax(0,1fr)_280px]">
      <aside
        className={`min-h-0 flex-col border-line xl:flex xl:border-r ${
          ticket ? 'hidden' : 'flex'
        }`}
      >
        <div className="border-b border-divider p-3">
          <Input
            icon={Search}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar tickets…"
            aria-label="Buscar tickets"
          />
        </div>
        <div className="max-h-[60vh] min-h-0 flex-1 overflow-y-auto xl:max-h-none">
          {filtered.length === 0 && (
            <div className="p-4">
              <EmptyState
                compact
                kind={tickets.length ? 'no-results' : 'all-clear'}
                title={tickets.length ? 'Sin coincidencias' : 'Sin tickets'}
              />
            </div>
          )}
          {filtered.map(t => {
            const requester = getProfile(ticketRequester(t));
            const st = TICKET_STATUS[t.status] ?? TICKET_STATUS.open;
            const msgs = getTicketMessages(t.id);
            const last = msgs[msgs.length - 1];
            const active = t.id === selected;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelected(t.id)}
                className={`flex w-full items-start gap-2.5 border-b border-divider px-4 py-3.5 text-left transition-colors ${
                  active ? 'bg-tint' : 'hover:bg-panel'
                }`}
              >
                <Avatar name={requester?.full_name} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-sans text-[13px] font-semibold text-navy">
                      {requester?.full_name ?? 'Usuario'}
                    </span>
                    <span className="shrink-0 font-sans text-[11px] text-faint">
                      {timeAgo(t.created_at)}
                    </span>
                  </div>
                  <div className="my-1 flex flex-wrap items-center gap-1.5">
                    <Badge tone={st.tone}>{st.label}</Badge>
                    {t.service_order_id && (
                      <Badge tone="info">{orderCode(t.service_order_id)}</Badge>
                    )}
                  </div>
                  <div className="line-clamp-2 font-sans text-[12px] text-muted">
                    {t.subject}
                    {last?.body ? ` — ${last.body}` : ''}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {ticket ? (
        <TicketThread
          key={ticket.id}
          ticket={ticket}
          onBack={() => setSelected(null)}
        />
      ) : (
        <div className="hidden place-items-center bg-panel p-6 xl:grid">
          <EmptyState
            kind="action"
            title="Selecciona un ticket"
            description="Elige un ticket para ver la conversación y responder."
          />
        </div>
      )}

      {ticket ? (
        <TicketContext ticket={ticket} />
      ) : (
        <aside className="hidden border-line bg-panel xl:block xl:border-l" />
      )}
    </div>
  );
}

function TicketThread({
  ticket,
  onBack,
}: {
  ticket: Ticket;
  onBack: () => void;
}) {
  const [draft, setDraft] = useState('');
  const { busy, run } = useAction();
  const requester = getProfile(ticketRequester(ticket));
  const st = TICKET_STATUS[ticket.status] ?? TICKET_STATUS.open;
  const messages = getTicketMessages(ticket.id);

  async function send() {
    const text = draft.trim();
    if (!text || busy) return;
    const ok = await run('reply', () => replyTicket(ticket.id, text), 'Respuesta enviada');
    if (ok) setDraft('');
  }

  return (
    <div className="flex min-h-0 flex-col bg-panel">
      <div className="flex items-center gap-3 border-b border-divider bg-card px-4 py-3.5">
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver a la bandeja"
          className="-ml-1 grid h-8 w-8 place-items-center rounded-btn text-muted hover:bg-panel xl:hidden"
        >
          <ArrowLeft size={18} />
        </button>
        <Avatar name={requester?.full_name} size={38} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-[15px] font-bold text-navy">
              {ticket.subject}
            </span>
            <Badge tone={st.tone}>{st.label}</Badge>
          </div>
          <div className="mt-0.5 font-sans text-[12px] capitalize text-muted">
            {requester?.full_name ?? 'Usuario'} · {ticketRole(ticket)} ·{' '}
            {timeAgo(ticket.created_at)}
          </div>
        </div>
      </div>

      <div className="min-h-[260px] flex-1 overflow-y-auto p-4 xl:min-h-0">
        {messages.length === 0 && (
          <p className="py-8 text-center font-sans text-[12.5px] text-faint">
            Sin mensajes todavía.
          </p>
        )}
        {messages.map(m => {
          const mine = getProfile(m.author_id)?.role === 'admin';
          return (
            <div
              key={m.id}
              className={`mb-3 flex ${mine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-[78%] flex-col ${mine ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`rounded-box px-3.5 py-2.5 font-sans text-[13.5px] leading-relaxed ${
                    mine
                      ? 'rounded-tr-sm bg-action text-white'
                      : 'rounded-tl-sm border border-line bg-card text-navy'
                  }`}
                >
                  {m.body}
                </div>
                <span className="mt-1 font-mono text-[10.5px] text-faint">
                  {mine
                    ? (getProfile(m.author_id)?.full_name ?? 'Soporte')
                    : (getProfile(m.author_id)?.full_name ?? 'Usuario')}{' '}
                  · {timeAgo(m.created_at)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-divider bg-card p-3.5">
        <Textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          rows={2}
          maxLength={1000}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void send();
          }}
          placeholder={
            !isTicketOpen(ticket)
              ? 'Ticket resuelto — responder lo reabre.'
              : 'Escribe una respuesta… (⌘↵ para enviar)'
          }
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="font-mono text-[11px] text-faint">
            {draft.length} / 1000
          </span>
          <Button size="sm" icon={Send} onClick={() => void send()} loading={!!busy} disabled={!draft.trim()}>
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
}

function TicketContext({ ticket }: { ticket: Ticket }) {
  useTick();
  const { busy, run } = useAction();
  const requester = getProfile(ticketRequester(ticket));
  const role = ticketRole(ticket);
  const req = ticket.service_order_id ? getRequest(ticket.service_order_id) : null;
  const services = requester
    ? role === 'tecnico'
      ? getTechRequests(requester.id)
      : getClientRequests(requester.id)
    : [];

  async function markResolved() {
    const ok = await run('resolve', () => resolveTicket(ticket.id));
    if (ok)
      snackbar.show('Ticket marcado como resuelto', {
        undo: () => void reopenTicket(ticket.id),
      });
  }

  return (
    <aside className="flex min-h-0 flex-col gap-3.5 overflow-y-auto border-t border-line bg-card p-4 xl:border-l xl:border-t-0">
      <div>
        <Kicker className="mb-2">Usuario</Kicker>
        <div className="flex items-center gap-3">
          <Avatar name={requester?.full_name} size={38} />
          <div className="min-w-0">
            <div className="truncate font-sans text-[13.5px] font-semibold text-navy">
              {requester?.full_name ?? 'Usuario'}
            </div>
            <div className="font-sans text-[12px] capitalize text-muted">
              {role} · {formatPhone(requester?.phone) || '—'}
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Mini label="Servicios" value={String(services.length)} />
          <Mini label="Estado" value={(TICKET_STATUS[ticket.status] ?? TICKET_STATUS.open).label} />
        </div>
        {requester && (
          <Link
            href={
              role === 'tecnico'
                ? `/tecnicos/${requester.id}`
                : `/clientes/${requester.id}`
            }
            className="mt-3 inline-flex items-center gap-1 font-sans text-[12.5px] font-semibold text-primary"
          >
            Ver perfil <ArrowRight size={12} />
          </Link>
        )}
      </div>

      {req && (
        <div className="border-t border-divider pt-3.5">
          <Kicker className="mb-2">Servicio relacionado</Kicker>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[12.5px] font-medium text-primary">
              {orderCode(req.id)}
            </span>
            <Badge tone="info">{ORDER_STATUS[req.status] ?? req.status}</Badge>
          </div>
          <Link
            href={`/servicios/${req.id}`}
            className="mt-2 inline-flex items-center gap-1 font-sans text-[12.5px] font-semibold text-primary"
          >
            Ver servicio <ArrowRight size={12} />
          </Link>
        </div>
      )}

      <div className="mt-auto border-t border-divider pt-3.5">
        {isTicketOpen(ticket) ? (
          <Button variant="approve" icon={Check} full loading={!!busy} onClick={() => void markResolved()}>
            Marcar resuelto
          </Button>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-btn bg-success-soft py-2.5 font-sans text-[13px] font-semibold text-success">
            <CheckCircle2 size={14} /> Resuelto
          </div>
        )}
      </div>
    </aside>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-btn border border-line px-3 py-2">
      <div className="font-display text-[15px] font-bold capitalize text-navy tabular">
        {value}
      </div>
      <div className="font-sans text-[11px] text-faint">{label}</div>
    </div>
  );
}

// ── Cola KYC ────────────────────────────────────────────────────────────────
const REJECT_REASONS = [
  'INE ilegible o incompleta',
  'Selfie no coincide con la INE',
  'Antecedentes no penales vencidos',
  'Datos bancarios no coinciden',
];

function KycView() {
  useTick();
  const pending = getPendingKyc();
  if (pending.length === 0)
    return (
      <Card padded>
        <EmptyState
          kind="all-clear"
          title="Cola KYC al día"
          description="No hay técnicos esperando verificación."
        />
      </Card>
    );
  return (
    <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
      {pending.map(t => (
        <KycCard key={t.id} techId={t.id} />
      ))}
    </div>
  );
}

function KycCard({ techId }: { techId: string }) {
  const profile = getProfile(techId);
  const who = profile?.full_name ?? 'Técnico';
  const sessions = getKycSessions(techId);
  const { busy, run } = useAction();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [other, setOther] = useState('');

  async function reject() {
    const r = reason === 'Otro' ? other.trim() : reason;
    if (!r) return;
    const ok = await run(
      'reject',
      () => rejectKyc(techId, r),
      `KYC rechazado · ${who}`,
    );
    if (ok) setRejecting(false);
  }

  return (
    <Card padded className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Avatar name={profile?.full_name} size={42} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-sans text-[14px] font-semibold text-navy">
            {who}
          </div>
          <div className="font-sans text-[12px] text-muted">
            {formatPhone(profile?.phone) || '—'}
          </div>
        </div>
        <Badge tone="warning">Pendiente</Badge>
      </div>

      <div className="flex flex-col gap-1.5">
        {sessions.length === 0 ? (
          <span className="font-sans text-[12.5px] text-faint">
            Sin verificación Didit iniciada
          </span>
        ) : (
          sessions.slice(0, 2).map(s => (
            <div
              key={s.id}
              className="flex items-center gap-2 rounded-btn border border-line px-3 py-2"
            >
              <FileText size={14} className="text-primary" />
              <span className="flex-1 truncate font-sans text-[12.5px] text-navy">
                Verificación Didit · {s.status}
              </span>
              <span className="font-sans text-[11px] text-faint">
                {timeAgo(s.created_at)}
              </span>
            </div>
          ))
        )}
        <Link
          href={`/tecnicos/${techId}`}
          className="inline-flex items-center gap-1 font-sans text-[12.5px] font-semibold text-primary"
        >
          Revisar expediente <ArrowRight size={12} />
        </Link>
      </div>

      <div className="mt-auto flex gap-2">
        <Button
          variant="approve"
          icon={Check}
          className="flex-1"
          loading={busy === 'approve'}
          disabled={!!busy}
          onClick={() =>
            void run(
              'approve',
              () => resolveKyc(techId, true),
              `Técnico aprobado · ${who}`,
            )
          }
        >
          Aprobar
        </Button>
        <Button
          variant="destructive"
          icon={X}
          className="flex-1"
          disabled={!!busy}
          onClick={() => setRejecting(true)}
        >
          Rechazar
        </Button>
      </div>

      <Modal
        open={rejecting}
        onClose={() => setRejecting(false)}
        dismissible={busy !== 'reject'}
        title={`Rechazar KYC de ${who}`}
        description="El técnico verá el motivo y podrá volver a enviar sus documentos."
        icon={X}
        tone="danger"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setRejecting(false)}
              disabled={busy === 'reject'}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              loading={busy === 'reject'}
              disabled={reason === 'Otro' && !other.trim()}
              onClick={() => void reject()}
            >
              Rechazar
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          {[...REJECT_REASONS, 'Otro'].map(r => (
            <Chip key={r} active={reason === r} onClick={() => setReason(r)}>
              {r}
            </Chip>
          ))}
        </div>
        {reason === 'Otro' && (
          <Textarea
            className="mt-3"
            rows={2}
            value={other}
            onChange={e => setOther(e.target.value)}
            placeholder="Describe el motivo"
          />
        )}
      </Modal>
    </Card>
  );
}

// ── Nuevo ticket ────────────────────────────────────────────────────────────
function NewTicketModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [subject, setSubject] = useState('');
  const [requesterId, setRequesterId] = useState('');
  const [content, setContent] = useState('');
  const { busy, run } = useAction();
  const people = getAllProfiles().filter(
    p => p.role === 'client' || p.role === 'technician',
  );

  async function submit() {
    if (!subject.trim() || !requesterId) return;
    const ok = await run(
      'create',
      () =>
        createTicket({
          subject: subject.trim(),
          requester_id: requesterId,
          content: content.trim() || undefined,
        }),
      'Ticket creado',
    );
    if (!ok) return;
    setSubject('');
    setRequesterId('');
    setContent('');
    onClose();
    onCreated();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo ticket"
      description="Crea un ticket de soporte a nombre de un usuario."
      icon={Plus}
      width={500}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => void submit()} loading={!!busy} disabled={!subject.trim() || !requesterId}>
            Crear ticket
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Asunto"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="Ej. Cobro duplicado en tarjeta"
        />
        <Field label="Usuario">
          <Select
            value={requesterId}
            onChange={setRequesterId}
            placeholder="Selecciona un usuario…"
            options={people.map(p => ({
              value: p.id,
              label: p.full_name ?? 'Usuario',
              hint: p.role === 'technician' ? 'Técnico' : 'Cliente',
            }))}
          />
        </Field>
        <Field label="Primer mensaje (opcional)">
          <Textarea
            rows={3}
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}
