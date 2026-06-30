'use client';

import { useMemo, useState } from 'react';
import {
  ShieldAlert, Inbox, FileBadge, Users, ArrowLeftRight, Check, X,
  FileText, Clock, MessageSquare, CheckCircle2, ArrowUpRight, Camera,
} from 'lucide-react';
import { PageHeading, Panel, StatCard, StatusPill } from '@/components/admin';
import { Avatar, Badge, Chip, GhostButton, PrimaryButton, EmptyState } from '@/components/ui';
import { FadeIn, Stagger, StaggerItem, AnimatePresence, motion } from '@/components/motion';
import {
  getAllDisputes, getDisputes, getPendingKyc, getDocuments, getProfile, getRequest,
  resolveDispute, resolveKyc, useTick,
} from '@/lib/demo/store';

const TYPE_LABEL: Record<string, string> = {
  cobro: 'Cobro indebido',
  'cancelación': 'Cancelación',
  cancelacion: 'Cancelación',
  calidad: 'Calidad del servicio',
  'no-show': 'No se presentó',
};

const initials = (name?: string | null) =>
  (name ?? '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

export default function SoportePage() {
  useTick();
  const [tab, setTab] = useState<'disputas' | 'kyc'>('disputas');

  // ── Live data ──────────────────────────────────────────────────────────────
  const allDisputes = getAllDisputes();
  const openDisputes = getDisputes('open');
  const pendingKyc = getPendingKyc();

  const openCount = openDisputes.length;
  const kycCount = pendingKyc.length;
  const ticketsOpen = openCount + kycCount + 11; // + bandeja de soporte general (prototipo)

  return (
    <div className="space-y-6">
      <PageHeading
        title="Soporte y disputas"
        sub="Bandeja de tickets, disputas activas y cola de verificación KYC."
        actions={
          <div className="flex items-center gap-2">
            <GhostButton>Plantillas</GhostButton>
            <PrimaryButton>Nuevo ticket</PrimaryButton>
          </div>
        }
      />

      {/* Stat cards */}
      <Stagger className="grid grid-cols-4 gap-4">
        <StaggerItem>
          <StatCard label="Tickets abiertos" value={ticketsOpen} icon={Inbox} index={0}
            note="Bandeja general · SLA 98%" />
        </StaggerItem>
        <StaggerItem>
          <StatCard label="Disputas abiertas" value={openCount} icon={ShieldAlert} index={1}
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
      </div>

      {tab === 'disputas' ? <DisputesPanel /> : <KycPanel />}
    </div>
  );
}

// ============================================================================
// DISPUTAS
// ============================================================================
function DisputesPanel() {
  useTick();
  const disputes = getDisputes('open');

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

  const onResolve = (text: string) => resolveDispute(dispute.id, text);

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
        style={{ background: 'linear-gradient(135deg, var(--color-error, #DC2626), #991B1B)' }}>
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
        <span className="font-mono text-xs text-white/90 bg-white/15 rounded-full px-2.5 py-1">
          #{dispute.id}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-6 p-5">
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
              <KV label="Cliente" value={opener?.full_name ?? '—'} />
              <KV label="Tipo" value={typeLabel} />
            </div>
          )}

          <div className="space-y-2">
            <PrimaryButton className="w-full" onClick={() => onResolve('resuelto')}>
              <span className="inline-flex items-center justify-center gap-2">
                <Check size={14} /> Resolver
              </span>
            </PrimaryButton>
            <GhostButton className="w-full" onClick={() => onResolve('escalado a nivel 2')}>
              <span className="inline-flex items-center justify-center gap-2">
                <ArrowUpRight size={14} /> Escalar
              </span>
            </GhostButton>
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

function KV({ label, value }: { label: string; value: string }) {
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
          <div className="grid grid-cols-2 gap-4">
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
                <button className="text-xs text-cyan font-medium inline-flex items-center gap-1">
                  Ver <MessageSquare size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <PrimaryButton className="flex-1" onClick={() => resolveKyc(techId, true)}>
          <span className="inline-flex items-center justify-center gap-2">
            <Check size={14} /> Aprobar
          </span>
        </PrimaryButton>
        <button
          onClick={() => resolveKyc(techId, false)}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface py-2 text-sm font-medium text-error hover:bg-surface-2"
        >
          <X size={14} /> Rechazar
        </button>
      </div>
    </motion.div>
  );
}
