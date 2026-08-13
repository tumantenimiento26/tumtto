'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Phone, Mail, Calendar, MapPin, Check, X, Ban, RotateCcw,
  ContactRound, Map as MapIcon, Landmark, Quote, FileCheck2, MessageSquareText,
  Send, CheckCheck, BadgeCheck, AlertOctagon,
} from 'lucide-react';
import { PageHeading, Panel, Modal } from '@/components/admin';
import { Avatar, Badge, GhostButton, PrimaryButton, Textarea } from '@/components/ui';
import { FadeIn, Stagger, StaggerItem } from '@/components/motion';
import { toast } from '@/components/toast';
import {
  useTick, getTechnician, getProfile, getTechRates,
  getCategories, getKycSessions, getNotes, resolveKyc, rejectKyc,
  suspendTechnician, reactivateTechnician, addNote,
} from '@/lib/data/store';

const initials = (name?: string | null) =>
  (name ?? '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const peso = (n: number) => `$${n.toLocaleString('es-MX')} MXN`;
const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtClabe = (c?: string | null) => (c ? c.replace(/(\d{3})(\d{3})(\d{8})/, '$1 $2 •••• ') + c.slice(-4) : '—');

const DOC_STATUS: Record<string, { label: string; tone: 'success' | 'warning' | 'error' }> = {
  not_started: { label: 'Sin iniciar', tone: 'warning' },
  in_progress: { label: 'En curso', tone: 'warning' },
  pending: { label: 'Pendiente revisión', tone: 'warning' },
  in_review: { label: 'En revisión', tone: 'warning' },
  approved: { label: 'Aprobada', tone: 'success' },
  declined: { label: 'Rechazada', tone: 'error' },
  abandoned: { label: 'Abandonada', tone: 'error' },
  resubmitted: { label: 'Reenviada', tone: 'warning' },
};

const REJECT_REASONS = ['Documentos ilegibles', 'Información inconsistente', 'Documento expirado', 'Otro'];

export default function TecnicoDetailPage() {
  useTick();
  const { id } = useParams<{ id: string }>();
  const [note, setNote] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);

  const tech = getTechnician(id);
  const profile = tech ? getProfile(tech.id) : null;

  if (!tech || !profile) {
    return (
      <FadeIn>
        <PageHeading title="Técnico no encontrado" sub={`No existe un técnico con id ${id}`} />
        <GhostButton href="/tecnicos">Volver a técnicos</GhostButton>
      </FadeIn>
    );
  }

  const name = profile.full_name ?? 'Técnico';
  // ponytail: el email vive en auth.users, no en profiles — sin columna que mostrar.
  const email = '—';
  const suspended = profile.status === 'suspended';
  const kyc = suspended ? 'suspended' : tech.kyc_status;

  const cats = getCategories();
  const rates = getTechRates(tech.id).map(r => {
    const cat = cats.find(c => c.id === r.category_id);
    return { id: r.id, cat: cat?.name ?? '—', sub: 'Tarifa de visita', price: r.visita_cents / 100 };
  });
  const docs = getKycSessions(tech.id);
  const pendingDocs = docs.filter(d => d.status === 'in_review' || d.status === 'in_progress');
  const notes = getNotes(tech.id);

  const KYC_BADGE: Record<string, { label: string; tone: 'success' | 'warning' | 'error' | 'neutral' }> = {
    approved: { label: 'KYC aprobado', tone: 'success' },
    not_started: { label: 'KYC sin iniciar', tone: 'warning' },
    pending: { label: 'Pendiente de KYC', tone: 'warning' },
    in_review: { label: 'Pendiente de KYC', tone: 'warning' },
    declined: { label: 'KYC rechazado', tone: 'error' },
    abandoned: { label: 'KYC abandonado', tone: 'error' },
    resubmitted: { label: 'KYC reenviado', tone: 'warning' },
    suspended: { label: 'Suspendido', tone: 'neutral' },
  };

  function onApprove() {
    resolveKyc(tech!.id, true);
    toast.success(`Técnico aprobado · ${name}`);
  }
  function onSuspend() {
    suspendTechnician(tech!.id);
    toast.success(`Técnico suspendido · ${name}`);
  }
  function onReactivate() {
    reactivateTechnician(tech!.id);
    toast.success(`Técnico reactivado · ${name}`);
  }
  function onSaveNote() {
    if (!note.trim()) return;
    addNote(tech!.id, note.trim());
    setNote('');
    toast.success('Nota guardada');
  }
  function onApproveAllDocs() {
    resolveKyc(tech!.id, true);
    toast.success('Verificación aprobada');
  }

  return (
    <div className="flex flex-col gap-5 text-navy">
      <FadeIn>
        <Link href="/tecnicos" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-primary">
          <ArrowLeft size={15} /> Volver a técnicos
        </Link>
      </FadeIn>

      {/* Header */}
      <FadeIn>
        <div className="flex flex-wrap items-center gap-5 border-b border-line pb-5">
          <Avatar initials={initials(name)} size={84} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-[26px] font-bold tracking-tight">{name}</h1>
              <Badge tone={KYC_BADGE[kyc].tone}>{KYC_BADGE[kyc].label}</Badge>
              {!suspended && (
                <Badge tone={tech.is_available ? 'success' : 'neutral'}>
                  {tech.is_available ? 'Disponible' : 'Inactivo'}
                </Badge>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-muted">
              <span className="inline-flex items-center gap-1.5"><Phone size={13} className="text-faint" />{profile.phone ?? '—'}</span>
              <span className="inline-flex items-center gap-1.5"><Mail size={13} className="text-faint" />{email}</span>
              <span className="inline-flex items-center gap-1.5"><Calendar size={13} className="text-faint" />Registrado {fecha(profile.created_at)}</span>
              <span className="inline-flex items-center gap-1.5"><MapPin size={13} className="text-faint" />ZMG, Jalisco</span>
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2.5">
            {kyc === 'in_review' && (
              <>
                <button onClick={() => setRejectOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-error bg-white px-3.5 py-2.5 text-[13px] font-semibold text-error hover:bg-error-soft">
                  <X size={14} /> Rechazar
                </button>
                <PrimaryButton onClick={onApprove}>
                  <span className="inline-flex items-center gap-2"><Check size={14} /> Aprobar KYC</span>
                </PrimaryButton>
              </>
            )}
            {kyc === 'declined' && (
              <PrimaryButton onClick={onApprove}>
                <span className="inline-flex items-center gap-2"><Check size={14} /> Aprobar KYC</span>
              </PrimaryButton>
            )}
            {kyc === 'approved' && (
              <button onClick={onSuspend} className="inline-flex items-center gap-2 rounded-xl border border-error bg-white px-3.5 py-2.5 text-[13px] font-semibold text-error hover:bg-error-soft">
                <Ban size={14} /> Suspender
              </button>
            )}
            {kyc === 'suspended' && (
              <PrimaryButton onClick={onReactivate}>
                <span className="inline-flex items-center gap-2"><RotateCcw size={14} /> Reactivar</span>
              </PrimaryButton>
            )}
          </div>
        </div>
      </FadeIn>

      {/* Two-column body */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Stagger className="flex flex-col gap-5">
          <StaggerItem>
            <Panel title="Datos personales" action={<ContactRound size={15} className="text-primary" />}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <KV label="Nombre completo" value={name} />
                <KV label="Teléfono" value={profile.phone ?? '—'} mono />
                <KV label="Email" value={email} />
                <KV label="Fecha de registro" value={fecha(profile.created_at)} />
                <KV label="Estado de cuenta" value={suspended ? 'Suspendida' : 'Activa'} />
                <KV label="Trabajos completados" value={String(tech.rating_count)} mono />
              </div>
            </Panel>
          </StaggerItem>

          <StaggerItem>
            <Panel title="Servicios y tarifas" action={<MapIcon size={15} className="text-primary" />}>
              {rates.length === 0 ? (
                <p className="py-3 text-[13px] text-faint">Sin servicios capturados todavía.</p>
              ) : (
                <div className="flex flex-col">
                  {rates.map(r => (
                    <div key={r.id} className="flex items-center justify-between border-b border-line/60 py-2.5 last:border-0">
                      <div className="flex items-center gap-2.5">
                        <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11.5px] font-medium text-navy">{r.cat}</span>
                        <span className="text-[13px]">{r.sub}</span>
                      </div>
                      <span className="font-display text-[13.5px] font-semibold">{peso(r.price)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </StaggerItem>

          <StaggerItem>
            <Panel title="Datos bancarios" action={<Landmark size={15} className="text-primary" />}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <KV label="CLABE interbancaria" value={fmtClabe(tech.clabe)} mono span={2} />
                <KV label="Banco detectado" value="BBVA México" />
                <div>
                  <div className="mb-1 font-mono text-[11px] uppercase tracking-wider text-faint">Estado</div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[11.5px] font-semibold text-success">
                    <BadgeCheck size={11} /> Validada con SPEI prueba
                  </span>
                </div>
              </div>
            </Panel>
          </StaggerItem>

          {tech.bio && (
            <StaggerItem>
              <Panel title="Biografía profesional" action={<Quote size={15} className="text-primary" />}>
                <p className="text-[14px] italic leading-relaxed">“{tech.bio}”</p>
                <div className="mt-3 font-mono text-[11.5px] text-faint">capturada por el técnico al registrarse</div>
              </Panel>
            </StaggerItem>
          )}
        </Stagger>

        <Stagger className="flex flex-col gap-5">
          <StaggerItem>
            <Panel
              title="Documentos KYC"
              action={<FileCheck2 size={15} className="text-primary" />}
            >
              {docs.length === 0 ? (
                <p className="py-3 text-[13px] text-faint">Sin documentos cargados aún.</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {docs.map(d => (
                    <div key={d.id} className="rounded-xl border border-line bg-surface p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold leading-tight">Verificación Didit</span>
                        <Badge tone={DOC_STATUS[d.status].tone}>{DOC_STATUS[d.status].label}</Badge>
                      </div>
                      <div className="my-2 font-mono text-[11px] text-faint">{d.didit_session_id} · iniciada {fecha(d.created_at)}</div>
                      {(d.status === 'in_review' || d.status === 'in_progress') && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => { resolveKyc(tech!.id, true); toast.success('Verificación aprobada'); }}
                            className="inline-flex items-center gap-1 rounded-lg border border-success/30 bg-success-soft px-2.5 py-1 text-[11.5px] font-semibold text-success"
                          >
                            <Check size={12} /> Aprobar verificación
                          </button>
                          <button
                            onClick={() => { resolveKyc(tech!.id, false); toast.error('Verificación rechazada'); }}
                            className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1 text-[11.5px] font-medium text-warning-ink"
                          >
                            <X size={12} /> Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {pendingDocs.length > 0 && (
                <button
                  onClick={onApproveAllDocs}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-primary/40 bg-primary/[0.06] px-3.5 py-2.5 text-[13px] font-semibold text-primary hover:bg-info-soft"
                >
                  <CheckCheck size={13} /> Aprobar los {pendingDocs.length} documentos pendientes
                </button>
              )}
            </Panel>
          </StaggerItem>

          <StaggerItem>
            <Panel title="Notas internas del admin" action={<MessageSquareText size={15} className="text-primary" />}>
              <p className="mb-2.5 text-[12px] text-muted">Solo visibles para el equipo Tumantenimiento. El técnico no las ve.</p>
              <Textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Anota lo que verifiques, dudas, observaciones…"
                rows={3}
              />
              <div className="mt-2 flex justify-end">
                <GhostButton onClick={onSaveNote}>
                  <span className="inline-flex items-center gap-2"><Send size={13} /> Guardar nota</span>
                </GhostButton>
              </div>
              <div className="mb-2 mt-4 font-mono text-[10.5px] uppercase tracking-[0.08em] text-faint">Historial</div>
              {notes.length === 0 ? (
                <p className="py-2 text-[12.5px] text-faint">Sin notas todavía.</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {notes.map(n => (
                    <FadeIn key={n.id} className="rounded-xl border border-line bg-surface-2 p-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[12px] font-semibold">{n.author}</span>
                        <span className="rounded bg-surface px-1.5 py-px text-[10px] text-faint">Admin</span>
                        <span className="ml-auto font-mono text-[10.5px] text-faint">{fecha(n.created_at)}</span>
                      </div>
                      <p className="mt-1.5 text-[12.5px] leading-snug">{n.text}</p>
                    </FadeIn>
                  ))}
                </div>
              )}
            </Panel>
          </StaggerItem>
        </Stagger>
      </div>

      <RejectModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        techName={name}
        email={email}
        onConfirm={(reason, comment) => {
          rejectKyc(tech.id, comment ? `${reason} — ${comment}` : reason);
          setRejectOpen(false);
          toast.success(`KYC rechazado · ${name}`);
        }}
      />
    </div>
  );
}

function RejectModal({ open, onClose, onConfirm, techName, email }: {
  open: boolean; onClose: () => void; onConfirm: (reason: string, comment: string) => void;
  techName: string; email: string;
}) {
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [comment, setComment] = useState('');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Rechazar verificación KYC"
      sub="Esta acción notifica al técnico por email y push. No es reversible automáticamente."
      icon={<AlertOctagon size={17} className="text-error" />}
      width={580}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancelar</GhostButton>
          <button
            onClick={() => onConfirm(reason, comment.trim())}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-error px-4 py-3 font-semibold text-white hover:opacity-90"
          >
            <X size={14} /> Confirmar rechazo
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div>
          <div className="mb-2 text-[13px] font-medium text-navy">Motivo del rechazo</div>
          <div className="flex flex-wrap gap-1.5">
            {REJECT_REASONS.map(r => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  reason === r
                    ? 'border-error/30 bg-error-soft font-semibold text-error'
                    : 'border-line bg-surface text-muted hover:bg-surface-2'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-[13px] font-medium text-navy">Mensaje al técnico</div>
          <Textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={4}
            placeholder={`Explícale a ${techName.split(' ')[0]} qué debe corregir para retomar su solicitud…`}
          />
          <div className="mt-1.5 text-[11.5px] text-muted">Se enviará por email a {email} y push en la app del técnico.</div>
        </div>
      </div>
    </Modal>
  );
}

function KV({ label, value, mono, span = 1 }: { label: string; value: string; mono?: boolean; span?: number }) {
  return (
    <div style={{ gridColumn: `span ${span}` }}>
      <div className="mb-1 font-mono text-[11px] uppercase tracking-wider text-faint">{label}</div>
      <div className={`text-[14px] font-medium text-navy ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  );
}
