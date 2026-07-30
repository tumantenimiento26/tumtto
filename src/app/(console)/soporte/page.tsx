'use client';

import { useMemo, useState } from 'react';
import {
  ShieldAlert, Inbox, FileBadge, Users, ArrowLeftRight, Check, X, Plus,
  FileText, Clock, MessageSquare, CheckCircle2, ArrowUpRight, Camera,
  Search, Send, Wrench, UserRound, ArrowLeft, ArrowRight, LifeBuoy,
} from 'lucide-react';
import Link from 'next/link';
import { PageHeading, Panel, StatCard, StatusPill, Modal } from '@/components/admin';
import { Avatar, Badge, Chip, GhostButton, PrimaryButton, EmptyState, Input, Textarea, Field } from '@/components/ui';
import { FadeIn, Stagger, StaggerItem, AnimatePresence, motion } from '@/components/motion';
import { toast } from '@/components/toast';
import {
  getAllDisputes, getDisputes, getPendingKyc, getDocuments, getProfile, getRequest,
  getTickets, getTicket, getAllProfiles, getClientRequests, getTechRequests,
  resolveDispute, escalateDispute, resolveKyc, rejectKyc, createTicket, replyTicket,
  resolveTicket, useTick, ADMIN_ID,
} from '@/lib/demo/store';
import type { Ticket } from '@/lib/demo/world';

const TYPE_LABEL: Record<string, string> = {
  cobro: 'Cobro indebido',
  'cancelación': 'Cancelación',
  cancelacion: 'Cancelación',
  calidad: 'Calidad del servicio',
  'no-show': 'No se presentó',
};

const TICKET_STATUS: Record<Ticket['status'], { label: string; tone: 'error' | 'warning' | 'success' }> = {
  open: { label: 'Abierto', tone: 'error' },
  pending: { label: 'En espera', tone: 'warning' },
  resolved: { label: 'Resuelto', tone: 'success' },
};
const PRIORITY_TONE: Record<Ticket['priority'], 'error' | 'warning' | 'neutral'> = {
  alta: 'error', media: 'warning', baja: 'neutral',
};

const initials = (name?: string | null) =>
  (name ?? '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
const hora = (iso: string) =>
  new Date(iso).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function SoportePage() {
  useTick();
  const [tab, setTab] = useState<'disputas' | 'kyc' | 'tickets'>('disputas');
  const [newTicketOpen, setNewTicketOpen] = useState(false);

  // ── Live data ──────────────────────────────────────────────────────────────
  const allDisputes = getAllDisputes();
  const activeDisputes = allDisputes.filter(d => d.status === 'open' || d.status === 'in_review');
  const pendingKyc = getPendingKyc();
  const tickets = getTickets();
  const openTickets = tickets.filter(t => t.status !== 'resolved');

  const openCount = activeDisputes.length;
  const kycCount = pendingKyc.length;

  return (
    <div className="space-y-6">
      <PageHeading
        title="Soporte y disputas"
        sub="Bandeja de tickets, disputas activas y cola de verificación KYC."
        actions={
          <div className="flex items-center gap-2">
            <GhostButton>Plantillas</GhostButton>
            <PrimaryButton onClick={() => setNewTicketOpen(true)}>
              <span className="inline-flex items-center gap-2"><Plus size={14} /> Nuevo ticket</span>
            </PrimaryButton>
          </div>
        }
      />

      {/* Stat cards */}
      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <StatCard label="Tickets abiertos" value={openTickets.length} icon={Inbox} index={0}
            note="Bandeja general · SLA 98%" />
        </StaggerItem>
        <StaggerItem>
          <StatCard label="Disputas activas" value={openCount} icon={ShieldAlert} index={1}
            trend={openCount > 1 ? 'up' : 'down'} delta={`${allDisputes.length} total`} />
        </StaggerItem>
        <StaggerItem>
          <StatCard label="KYC pendientes" value={kycCount} icon={FileBadge} index={2}
            note="Esperando revisión" />
        </StaggerItem>
        <StaggerItem>
          <StatCard label="Resueltos hoy" value={18} suffix="" icon={CheckCircle2} index={3}
            trend="up" delta="+4 vs ayer" note="Tiempo prom. 4h 12m" />
        </StaggerItem>
      </Stagger>

      {/* Segmented tabs */}
      <div className="flex items-center gap-2">
        <Chip active={tab === 'disputas'} onClick={() => setTab('disputas')}>
          Disputas · {openCount}
        </Chip>
        <Chip active={tab === 'kyc'} onClick={() => setTab('kyc')}>
          Cola KYC · {kycCount}
        </Chip>
        <Chip active={tab === 'tickets'} onClick={() => setTab('tickets')}>
          Tickets · {openTickets.length}
        </Chip>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: [0.2, 0.7, 0.3, 1] }}
        >
          {tab === 'disputas' ? <DisputesPanel /> : tab === 'kyc' ? <KycPanel /> : <TicketsPanel />}
        </motion.div>
      </AnimatePresence>

      <NewTicketModal open={newTicketOpen} onClose={() => setNewTicketOpen(false)} onCreated={() => setTab('tickets')} />
    </div>
  );
}

// ============================================================================
// DISPUTAS
// ============================================================================
function DisputesPanel() {
  useTick();
  const disputes = getAllDisputes().filter(d => d.status === 'open' || d.status === 'in_review');

  return (
    <FadeIn>
      <Panel
        title="Disputas activas"
        action={<span className="text-xs text-muted">Resolver acredita y notifica a ambas partes.</span>}
      >
        {disputes.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="Sin disputas abiertas"
            body="Todas las disputas han sido resueltas. ¡Buen trabajo!"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {disputes.map((d) => (
                <DisputeCard key={d.id} dispute={d} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </Panel>
    </FadeIn>
  );
}

function DisputeCard({ dispute }: { dispute: ReturnType<typeof getDisputes>[number] }) {
  const req = dispute.request_id ? getRequest(dispute.request_id) : null;
  const opener = dispute.opened_by ? getProfile(dispute.opened_by) : null;
  const counterparty = req?.technician_id ? getProfile(req.technician_id) : null;
  const typeLabel = (dispute.type && TYPE_LABEL[dispute.type]) || dispute.type || 'Disputa';
  const escalated = dispute.status === 'in_review';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-line bg-surface shadow-card overflow-hidden"
    >
      {/* Red banner */}
      <div className="flex items-center gap-3 bg-grad-brand px-5 py-3"
        style={{ background: 'linear-gradient(135deg, var(--color-error), #991B1B)' }}>
        <div className="grid place-items-center w-8 h-8 rounded-lg bg-white/15">
          <ShieldAlert size={16} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-white">
            Disputa · {typeLabel}
          </div>
          <div className="text-xs text-white/80 mt-0.5">
            {opener?.full_name ?? 'Usuario'}
            {counterparty ? ` vs. ${counterparty.full_name}` : ''}
            {req ? ` · Servicio #${req.id}` : ''}
          </div>
        </div>
        {escalated && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold text-white">
            <ArrowUpRight size={11} /> Escalada · Nivel 2
          </span>
        )}
        <span className="font-mono text-xs text-white/90 bg-white/15 rounded-full px-2.5 py-1">
          #{dispute.id}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* Left: parties + evidence */}
        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-info-soft p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users size={14} className="text-error" />
              <span className="text-sm font-semibold text-navy">Partes involucradas</span>
              <Badge tone="error">2 partes</Badge>
            </div>
            <div className="space-y-3">
              <PartyRow name={opener?.full_name} role="Cliente" />
              {counterparty && (
                <>
                  <div className="flex items-center justify-center">
                    <span className="font-mono text-[10px] uppercase tracking-wide text-error bg-surface border border-line rounded-full px-2 py-0.5">vs</span>
                  </div>
                  <PartyRow name={counterparty.full_name} role="Técnico" verified />
                </>
              )}
            </div>
          </div>

          {/* Evidence thumbs */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Camera size={13} className="text-cyan" />
              <span className="text-xs font-medium text-muted">Evidencia adjunta · 4 fotos</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="aspect-square rounded-lg bg-grad-progress grid place-items-center">
                  <Camera size={14} className="text-white/90" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: service + actions */}
        <div className="space-y-4">
          {req && (
            <div className="rounded-xl border border-line bg-canvas p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-cyan font-medium">#{req.id}</span>
                <StatusPill status={req.status} />
              </div>
              <KVBlock label="Cliente" value={opener?.full_name ?? '—'} />
              <KVBlock label="Tipo" value={typeLabel} />
            </div>
          )}

          {escalated && (
            <div className="rounded-xl border border-warning/30 bg-warning-soft p-3 text-[12px] text-warning-ink">
              {dispute.resolution ?? 'Escalada a nivel 2.'}
            </div>
          )}

          <div className="space-y-2">
            <PrimaryButton className="w-full" onClick={() => { resolveDispute(dispute.id, 'resuelto'); toast.success(`Disputa resuelta · #${dispute.id}`); }}>
              <span className="inline-flex items-center justify-center gap-2">
                <Check size={14} /> Resolver
              </span>
            </PrimaryButton>
            {!escalated && (
              <GhostButton className="w-full" onClick={() => { escalateDispute(dispute.id); toast.success(`Disputa escalada a nivel 2 · #${dispute.id}`); }}>
                <span className="inline-flex items-center justify-center gap-2">
                  <ArrowUpRight size={14} /> Escalar
                </span>
              </GhostButton>
            )}
            <button
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface py-2 text-sm text-muted hover:bg-surface-2"
            >
              <ArrowLeftRight size={14} /> Ver ambas versiones
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PartyRow({ name, role, verified }: { name?: string | null; role: string; verified?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2">
      <Avatar initials={initials(name)} size={36} />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-navy truncate">{name ?? 'Usuario'}</span>
          {verified && <CheckCircle2 size={12} className="text-success" />}
        </div>
        <div className="text-xs text-muted">{role}</div>
      </div>
    </div>
  );
}

function KVBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wide text-faint mb-0.5">{label}</div>
      <div className="text-sm font-medium text-navy">{value}</div>
    </div>
  );
}

// ============================================================================
// COLA KYC
// ============================================================================
function KycPanel() {
  useTick();
  const pending = getPendingKyc();

  return (
    <FadeIn>
      <Panel
        title="Cola de verificación KYC"
        action={<span className="text-xs text-muted">{pending.length} técnico(s) esperando revisión.</span>}
      >
        {pending.length === 0 ? (
          <EmptyState
            icon={FileBadge}
            title="Cola KYC al día"
            body="No hay técnicos pendientes de verificación."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {pending.map((t) => (
                <KycCard key={t.id} techId={t.id} userId={t.user_id} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </Panel>
    </FadeIn>
  );
}

function KycCard({ techId, userId }: { techId: string; userId: string }) {
  const profile = getProfile(userId);
  const docs = getDocuments(techId);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, height: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-line bg-surface shadow-card p-5 space-y-4"
    >
      <div className="flex items-center gap-3">
        <Avatar initials={initials(profile?.full_name)} size={44} />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-navy truncate">{profile?.full_name ?? 'Técnico'}</div>
          <div className="text-xs text-muted">{profile?.phone ?? '—'}</div>
        </div>
        <Badge tone="warning">Pendiente</Badge>
      </div>

      {/* Documents */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FileText size={13} className="text-cyan" />
          <span className="text-xs font-medium text-muted">Documentos ({docs.length})</span>
        </div>
        {docs.length === 0 ? (
          <div className="text-xs text-faint italic flex items-center gap-1.5">
            <Clock size={12} /> Sin documentos cargados aún
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-1.5">
            {docs.map((d) => (
              <div key={d.id} className="flex items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-2">
                <div className="grid place-items-center w-8 h-8 rounded-md bg-grad-progress">
                  <FileText size={14} className="text-white" />
                </div>
                <span className="text-sm text-navy flex-1 truncate">{d.doc_type}</span>
                <Link href={`/tecnicos/${techId}`} className="text-xs text-cyan font-medium inline-flex items-center gap-1">
                  Ver <MessageSquare size={11} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <PrimaryButton className="flex-1" onClick={() => { resolveKyc(techId, true); toast.success(`Técnico aprobado · ${profile?.full_name ?? techId}`); }}>
          <span className="inline-flex items-center justify-center gap-2">
            <Check size={14} /> Aprobar
          </span>
        </PrimaryButton>
        <button
          onClick={() => { rejectKyc(techId, 'Rechazo desde cola KYC'); toast.success(`KYC rechazado · ${profile?.full_name ?? techId}`); }}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface py-2 text-sm font-medium text-error hover:bg-surface-2"
        >
          <X size={14} /> Rechazar
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// TICKETS — bandeja 3 columnas (prototipo soporte.jsx)
// ============================================================================
function TicketsPanel() {
  useTick();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const tickets = getTickets();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tickets;
    return tickets.filter(t => {
      const requester = getProfile(t.requester_id)?.full_name ?? '';
      return `${t.subject} ${requester} ${t.id}`.toLowerCase().includes(q);
    });
  }, [tickets, query]);

  const ticket = selectedId ? getTicket(selectedId) : null;

  return (
    <FadeIn>
      {/* Bajo xl es master-detail: la bandeja ocupa la columna hasta que se
          elige un ticket, y entonces cede el lugar a la conversación (con
          «volver»). Desde xl las tres columnas conviven. */}
      <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-line bg-white shadow-card xl:h-[680px] xl:grid-cols-[300px_minmax(0,1fr)_300px]">
        {/* LEFT — bandeja */}
        <aside className={`max-h-[70vh] min-h-0 flex-col border-line xl:flex xl:max-h-none xl:border-r ${ticket ? 'hidden' : 'flex'}`}>
          <div className="border-b border-line/70 p-4">
            <h2 className="mb-3 font-display text-[17px] font-bold text-navy">Bandeja</h2>
            <div className="relative">
              <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar tickets…"
                className="h-9 w-full rounded-lg border border-line bg-surface pl-8 pr-3 text-[12.5px] text-navy outline-none placeholder:text-faint focus:border-primary"
              />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="px-4 py-8 text-center text-[12.5px] text-faint">Sin tickets que coincidan.</p>
            )}
            {filtered.map(t => {
              const requester = getProfile(t.requester_id);
              const active = t.id === selectedId;
              const st = TICKET_STATUS[t.status];
              const last = t.messages[t.messages.length - 1];
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`relative flex w-full items-start gap-2.5 border-b border-line/60 px-4 py-3.5 text-left transition-colors ${active ? 'bg-primary/[0.06]' : 'hover:bg-surface'}`}
                >
                  {active && <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded bg-primary" />}
                  <Avatar initials={initials(requester?.full_name)} size={34} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[12.5px] font-semibold text-navy">{requester?.full_name ?? 'Usuario'}</span>
                      <span className="shrink-0 text-[10.5px] text-faint">{hora(t.created_at)}</span>
                    </div>
                    <div className="my-1 flex items-center gap-1.5">
                      <Badge tone={st.tone}>{st.label}</Badge>
                      <Badge tone={PRIORITY_TONE[t.priority]}>{t.priority}</Badge>
                      <span className="font-mono text-[10px] text-faint">#{t.id}</span>
                    </div>
                    <div className="line-clamp-2 text-[11.5px] leading-snug text-muted">{t.subject}{last?.content ? ` — ${last.content}` : ''}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* CENTER — conversación */}
        {ticket ? (
          <TicketConversation key={ticket.id} ticket={ticket} onBack={() => setSelectedId(null)} />
        ) : (
          <div className="hidden place-items-center bg-surface xl:grid">
            <EmptyState
              icon={LifeBuoy}
              title="Selecciona un ticket"
              body="Elige un ticket de la bandeja para ver la conversación y responder."
            />
          </div>
        )}

        {/* RIGHT — contexto */}
        {ticket ? (
          <TicketContext ticket={ticket} />
        ) : (
          <aside className="hidden border-line xl:block xl:border-l bg-surface" />
        )}
      </div>
    </FadeIn>
  );
}

function TicketConversation({ ticket, onBack }: { ticket: Ticket; onBack: () => void }) {
  const [draft, setDraft] = useState('');
  const requester = getProfile(ticket.requester_id);
  const st = TICKET_STATUS[ticket.status];

  function send() {
    const text = draft.trim();
    if (!text) return;
    replyTicket(ticket.id, ADMIN_ID, text);
    setDraft('');
    toast.success('Respuesta enviada');
  }

  return (
    <div className="flex min-h-0 flex-col bg-surface">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-4 sm:px-5">
        <button
          onClick={onBack}
          aria-label="Volver a la bandeja"
          className="-ml-1.5 grid shrink-0 place-items-center rounded-lg p-1.5 text-muted hover:bg-surface xl:hidden"
        >
          <ArrowLeft size={18} />
        </button>
        <Avatar initials={initials(requester?.full_name)} size={42} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-bold text-navy">{requester?.full_name ?? 'Usuario'}</span>
            <Badge tone={st.tone}>{st.label}</Badge>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[12px] text-muted">
            <span className="font-mono">#{ticket.id}</span>
            <span>·</span>
            <span>Abierto {hora(ticket.created_at)}</span>
            <span>·</span>
            <span className="capitalize">{ticket.role}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="min-h-[280px] flex-1 overflow-y-auto p-4 sm:p-5 xl:min-h-0">
        {ticket.messages.map(m => {
          const isAdmin = m.sender_id === ADMIN_ID;
          const sender = getProfile(m.sender_id);
          return (
            <FadeIn key={m.id} className={`mb-3.5 flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[78%] flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed text-navy ${
                  isAdmin
                    ? 'rounded-tr-sm border border-primary/[0.22] bg-primary/[0.10]'
                    : 'rounded-tl-sm border border-line bg-white'
                }`}>
                  {m.content}
                </div>
                <span className="mt-1 font-mono text-[10.5px] text-faint">
                  {isAdmin ? 'Sofía M. (admin)' : sender?.full_name ?? 'Usuario'} · {hora(m.created_at)}
                </span>
              </div>
            </FadeIn>
          );
        })}
        {ticket.messages.length === 0 && (
          <p className="py-8 text-center text-[12.5px] text-faint">Sin mensajes en este ticket.</p>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-line bg-white p-4">
        <Textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          rows={3}
          placeholder={ticket.status === 'resolved' ? 'Ticket resuelto — puedes reabrir la conversación respondiendo.' : 'Escribe una respuesta pública…'}
        />
        <div className="mt-2.5 flex items-center justify-between">
          <span className="font-mono text-[11px] text-faint">{draft.length} / 1000</span>
          <PrimaryButton onClick={send} disabled={!draft.trim()} className="!min-h-[40px] !py-2">
            <span className="inline-flex items-center gap-2"><Send size={13} /> Enviar respuesta</span>
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function TicketContext({ ticket }: { ticket: Ticket }) {
  const requester = getProfile(ticket.requester_id);
  const req = ticket.request_id ? getRequest(ticket.request_id) : null;
  const services = requester
    ? (ticket.role === 'tecnico' ? getTechRequests(requester.id) : getClientRequests(requester.id))
    : [];

  return (
    <aside className="flex min-h-0 flex-col gap-3.5 overflow-y-auto border-t border-line xl:border-l xl:border-t-0 bg-white p-4">
      {/* Requester */}
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-3 flex items-center gap-2 text-[12.5px] font-semibold text-navy">
          <UserRound size={13} className="text-primary" /> Información del usuario
        </div>
        <div className="flex items-center gap-3">
          <Avatar initials={initials(requester?.full_name)} size={38} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13.5px] font-semibold text-navy">{requester?.full_name ?? 'Usuario'}</div>
            <div className="text-[11.5px] capitalize text-muted">{ticket.role} · {requester?.phone ?? '—'}</div>
          </div>
        </div>
        <div className="mt-3 flex gap-4 rounded-lg border border-line bg-white px-3 py-2.5">
          <div>
            <div className="font-display text-[15px] font-bold text-navy">{services.length}</div>
            <div className="text-[10.5px] text-faint">Servicios</div>
          </div>
          <div>
            <div className="font-display text-[15px] font-bold capitalize text-navy">{ticket.priority}</div>
            <div className="text-[10.5px] text-faint">Prioridad</div>
          </div>
        </div>
        {requester && ticket.role === 'cliente' && (
          <Link href={`/clientes/${requester.id}`} className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-primary">
            Ver perfil completo <ArrowRight size={11} />
          </Link>
        )}
      </div>

      {/* Related service */}
      {req && (
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-3 flex items-center gap-2 text-[12.5px] font-semibold text-navy">
            <Wrench size={13} className="text-primary" /> Servicio relacionado
          </div>
          <div className="mb-2.5 flex items-center justify-between">
            <span className="font-mono text-[12.5px] font-medium text-primary">#{req.id}</span>
            <StatusPill status={req.status} />
          </div>
          <p className="line-clamp-2 text-[12px] text-muted">{req.problem_description ?? '—'}</p>
          <Link href={`/servicios/${req.id}`} className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-primary">
            Ver servicio completo <ArrowRight size={11} />
          </Link>
        </div>
      )}

      {/* Actions */}
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-3 flex items-center gap-2 text-[12.5px] font-semibold text-navy">
          <CheckCircle2 size={13} className="text-primary" /> Acciones
        </div>
        {ticket.status !== 'resolved' ? (
          <PrimaryButton
            className="w-full !min-h-[40px] !py-2"
            onClick={() => { resolveTicket(ticket.id); toast.success(`Ticket resuelto · #${ticket.id}`); }}
          >
            <span className="inline-flex items-center gap-2"><Check size={13} /> Resolver ticket</span>
          </PrimaryButton>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-success-soft py-2.5 text-[12.5px] font-semibold text-success">
            <CheckCircle2 size={14} /> Resuelto
          </div>
        )}
        <div className="mt-2 text-center text-[11px] text-faint">Resolver notifica al usuario por email y push.</div>
      </div>
    </aside>
  );
}

function NewTicketModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [subject, setSubject] = useState('');
  const [requesterId, setRequesterId] = useState('');
  const [priority, setPriority] = useState<Ticket['priority']>('media');
  const people = getAllProfiles().filter(p => p.role === 'cliente' || p.role === 'tecnico');

  function submit() {
    if (!subject.trim() || !requesterId) return;
    createTicket({ subject: subject.trim(), requester_id: requesterId, priority });
    toast.success('Ticket creado');
    setSubject('');
    setRequesterId('');
    setPriority('media');
    onClose();
    onCreated();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo ticket"
      sub="Crea un ticket de soporte a nombre de un usuario."
      icon={<Plus size={16} />}
      width={480}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancelar</GhostButton>
          <PrimaryButton onClick={submit} disabled={!subject.trim() || !requesterId}>Crear ticket</PrimaryButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Asunto">
          <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Ej. Cobro duplicado en tarjeta" />
        </Field>
        <Field label="Usuario">
          <select
            value={requesterId}
            onChange={e => setRequesterId(e.target.value)}
            className="min-h-[48px] w-full rounded-xl border border-line bg-white px-3.5 text-[15px] text-navy outline-none focus:border-primary"
          >
            <option value="">Selecciona un usuario…</option>
            {people.map(p => (
              <option key={p.id} value={p.id}>{p.full_name} · {p.role}</option>
            ))}
          </select>
        </Field>
        <Field label="Prioridad">
          <div className="flex gap-2">
            {(['alta', 'media', 'baja'] as const).map(p => (
              <Chip key={p} active={priority === p} onClick={() => setPriority(p)}>
                <span className="capitalize">{p}</span>
              </Chip>
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  );
}
