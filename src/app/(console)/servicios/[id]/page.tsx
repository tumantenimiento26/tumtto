'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, FolderTree, Calendar, MapPin, MessageSquare, UserCog, Ban, RotateCcw,
  UserRound, HardHat, BadgeCheck, Star, ArrowRight, ReceiptText, Plus, CreditCard,
  GitCommitVertical, Wand2, Info, Smartphone, ShieldAlert, ChevronDown,
} from 'lucide-react';
import { PageHeading, Panel, StatusPill } from '@/components/admin';
import { GhostButton, Avatar, Textarea } from '@/components/ui';
import { FadeIn, Stagger, StaggerItem } from '@/components/motion';
import {
  useTick, getRequest, getProfile, getSubcategories, getCategories,
  getExtras, getPayment, getTechByUser, setStatus,
} from '@/lib/demo/store';
import type { RequestStatus } from '@/lib/demo/world';
import { useState } from 'react';

const FLOW: RequestStatus[] = ['solicitado', 'aceptado', 'en_camino', 'en_sitio', 'en_ejecucion', 'completado', 'pagado', 'calificado'];
const FLOW_LABEL: Record<RequestStatus, string> = {
  solicitado: 'Solicitud creada',
  aceptado: 'Técnico aceptó el servicio',
  en_camino: 'Técnico en camino',
  en_sitio: 'Técnico llegó al sitio',
  en_ejecucion: 'Trabajo en ejecución',
  completado: 'Servicio completado',
  pagado: 'Pago confirmado',
  calificado: 'Cliente calificó el servicio',
  cancelado: 'Servicio cancelado',
  rechazado: 'Servicio rechazado',
};
const FLOW_ACTOR: Record<RequestStatus, string> = {
  solicitado: 'Cliente', aceptado: 'Técnico', en_camino: 'Técnico', en_sitio: 'Técnico',
  en_ejecucion: 'Técnico', completado: 'Técnico', pagado: 'Cliente', calificado: 'Cliente',
  cancelado: 'Sistema', rechazado: 'Sistema',
};

const initials = (name: string | null) =>
  (name ?? '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const money = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function ServicioDetailPage() {
  useTick();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const req = getRequest(id);
  const [note, setNote] = useState('');

  if (!req) {
    return (
      <FadeIn>
        <PageHeading title="Servicio no encontrado" sub={`No existe un servicio con id ${id}`} />
        <GhostButton onClick={() => router.push('/servicios')}>Volver a servicios</GhostButton>
      </FadeIn>
    );
  }

  const sub = getSubcategories().find(s => s.id === req.subcategory_id);
  const cat = getCategories().find(c => c.id === sub?.category_id);
  const client = getProfile(req.client_id);
  const techUserId = req.technician_id;
  const techProfile = techUserId ? getProfile(techUserId) : null;
  const techRec = techUserId ? getTechByUser(techUserId) : null;
  const extras = getExtras(req.id);
  const payment = getPayment(req.id);

  const base = req.base_price ?? sub?.base_price_suggested ?? 0;
  const extrasTotal = extras.reduce((a, e) => a + e.amount, 0);
  const subtotal = req.total_price ?? base + extrasTotal;
  const commission = payment?.platform_fee ?? Math.round(subtotal * 0.15);
  const techNet = payment?.technician_net ?? subtotal - commission;

  const addr = req.address_snapshot as Record<string, string> | null;
  const addrLine = addr ? [addr.line1, addr.neighborhood].filter(Boolean).join(', ') : 'Dirección no disponible';
  const addrCity = addr ? [addr.city, addr.state].filter(Boolean).join(', ') : '';

  const currentIndex = FLOW.indexOf(req.status);
  const isTerminal = req.status === 'cancelado' || req.status === 'rechazado';
  const disputed = req.status === 'cancelado';

  const override = (s: RequestStatus) => setStatus(req.id, s);

  return (
    <div className="flex flex-col gap-5 text-navy">
      {/* Back + header */}
      <FadeIn>
        <Link href="/servicios" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-primary">
          <ArrowLeft size={15} /> Volver a servicios
        </Link>
      </FadeIn>

      {disputed && (
        <FadeIn>
          <div className="flex items-center gap-4 rounded-2xl bg-grad-brand p-4 text-white shadow-card" style={{ background: 'linear-gradient(135deg,#DC2626,#991B1B)' }}>
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/15">
              <ShieldAlert size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-bold">Servicio cancelado · Posible disputa abierta</div>
              <div className="mt-0.5 text-[12.5px] text-white/85">El cliente reporta inconformidad con el resultado. Revisa la evidencia y el chat antes de resolver.</div>
            </div>
            <button className="inline-flex shrink-0 items-center rounded-lg bg-white px-3.5 py-2 text-[13px] font-semibold text-error">
              Abrir caso de soporte
            </button>
          </div>
        </FadeIn>
      )}

      <FadeIn>
        <div className="flex items-start gap-4 border-b border-line pb-4">
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">Servicio</div>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="font-mono text-[26px] font-semibold tracking-tight">#{req.id}</h1>
              <StatusPill status={req.status} />
              <MetaTag icon={FolderTree}>{cat?.name ?? '—'} · {sub?.name ?? '—'}</MetaTag>
              <MetaTag icon={Calendar}>{req.scheduled_at ? fmtTime(req.scheduled_at) : fmtTime(req.created_at)}</MetaTag>
              <MetaTag icon={MapPin}>{addr?.city ?? 'ZMG'}</MetaTag>
            </div>
          </div>
          <div className="flex shrink-0 gap-2.5">
            <GhostButton onClick={() => {}}>
              <span className="inline-flex items-center gap-2"><MessageSquare size={14} /> Ver chat</span>
            </GhostButton>
            <button className="inline-flex items-center gap-2 rounded-xl border border-primary px-3.5 py-2.5 text-[13px] font-semibold text-primary hover:bg-info-soft">
              <UserCog size={14} /> Intervenir
            </button>
            <button onClick={() => override('cancelado')} className="inline-flex items-center gap-2 rounded-xl border border-error px-3.5 py-2.5 text-[13px] font-semibold text-error hover:bg-error-soft">
              <Ban size={14} /> Cancelar
            </button>
          </div>
        </div>
      </FadeIn>

      {/* 3-col body */}
      <div className="grid grid-cols-[minmax(0,360px)_minmax(0,1fr)_minmax(0,320px)] gap-5">
        {/* LEFT */}
        <div className="flex flex-col gap-4">
          <FadeIn>
            <Panel title="Cliente">
              <div className="mb-3.5 flex items-center gap-3">
                <Avatar initials={initials(client?.full_name ?? null)} size={48} />
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold">{client?.full_name ?? 'Cliente'}</div>
                  <div className="mt-0.5 text-[11.5px] text-muted">{client?.phone ?? '—'}</div>
                </div>
              </div>
              <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.06em] text-faint">Dirección del servicio</div>
              <div className="flex gap-3">
                <MicroMap />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] leading-relaxed">{addrLine}</div>
                  {addrCity && <div className="mt-0.5 text-[12px] text-muted">{addrCity}</div>}
                </div>
              </div>
              <Link href={`/clientes/${req.client_id}`} className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-primary">
                Ver perfil completo <ArrowRight size={12} />
              </Link>
            </Panel>
          </FadeIn>

          <FadeIn>
            <Panel title="Técnico asignado">
              {techProfile ? (
                <>
                  <div className="flex items-center gap-3">
                    <Avatar initials={initials(techProfile.full_name)} size={48} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[14px] font-semibold">{techProfile.full_name}</span>
                        {techRec?.kyc_status === 'approved' && (
                          <span className="grid size-4 place-items-center rounded-full bg-success-soft"><BadgeCheck size={10} className="text-success" /></span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[12px] text-muted">
                        <Star size={11} className="text-warning" />
                        <b className="font-semibold text-navy">{techRec?.rating_avg ?? '—'}</b>
                        <span>({techRec?.ratings_count ?? 0})</span>
                        <span>· {techProfile.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-[12.5px] text-muted">{cat?.name} · {techRec?.total_jobs ?? 0} trabajos</div>
                  <Link href={`/tecnicos/${req.technician_id}`} className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-primary">
                    Ver perfil <ArrowRight size={12} />
                  </Link>
                </>
              ) : (
                <div className="text-[13px] text-muted">Sin técnico asignado todavía.</div>
              )}
            </Panel>
          </FadeIn>

          <FadeIn>
            <Panel title="Cobro y comisión">
              <div className="flex justify-between py-1.5 text-[13px]"><span>Tarifa base</span><span className="font-mono">{money(base)}</span></div>
              {extras.map(e => (
                <div key={e.id} className="flex justify-between py-1.5 text-[13px] text-muted">
                  <span className="flex items-center gap-1.5"><Plus size={11} className="text-cyan" />{e.description}</span>
                  <span className="font-mono">+{money(e.amount)}</span>
                </div>
              ))}
              <div className="mt-1 flex justify-between border-t border-line pt-2.5 text-[13px] font-semibold">
                <span>Subtotal</span><span className="font-mono">{money(subtotal)}</span>
              </div>
              <div className="flex justify-between py-1.5 text-[12px] text-muted">
                <span>Comisión plataforma · 15%</span><span className="font-mono">−{money(commission)}</span>
              </div>
              <div className="mt-3 flex items-baseline justify-between rounded-xl bg-info-soft p-3">
                <span className="text-[12px] font-medium text-muted">Neto técnico</span>
                <span className="font-mono text-[18px] font-bold">{money(techNet)}<span className="ml-1 text-[11px] font-medium text-faint">MXN</span></span>
              </div>
              <div className="mt-3.5 flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3">
                <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/[0.10]"><CreditCard size={16} className="text-primary" /></div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-medium capitalize">{payment?.method ?? 'Pago pendiente'}</div>
                  <div className="mt-1">
                    {payment?.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success">
                        <BadgeCheck size={10} /> Pagado{payment.paid_at ? ` · ${fmtTime(payment.paid_at)}` : ''}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-semibold text-warning">Pendiente</span>
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
                <div className="grid size-[30px] place-items-center rounded-lg bg-primary/[0.10]"><GitCommitVertical size={16} className="text-primary" /></div>
                <div>
                  <div className="text-[13.5px] font-semibold">Línea de tiempo del servicio</div>
                  <div className="text-[12px] text-muted">{FLOW.length} etapas · {extras.length} extras adjuntos</div>
                </div>
              </div>
              <Stagger className="flex flex-col pt-1.5">
                {FLOW.map((s, i) => {
                  const done = i < currentIndex || isTerminal;
                  const current = i === currentIndex && !isTerminal;
                  const future = i > currentIndex && !isTerminal;
                  return (
                    <StaggerItem key={s}>
                      <div className="flex gap-3.5">
                        <div className="flex shrink-0 flex-col items-center">
                          <div className={`grid size-[30px] place-items-center rounded-full text-[11px] font-bold ${done ? 'bg-success text-white' : current ? 'bg-primary text-white ring-4 ring-primary/15' : 'bg-surface-2 text-faint'}`}>
                            {i + 1}
                          </div>
                          {i < FLOW.length - 1 && <div className={`min-h-[26px] w-0.5 flex-1 ${done ? 'bg-success' : 'bg-line'}`} />}
                        </div>
                        <div className="min-w-0 flex-1 pb-4">
                          <div className="mb-0.5 flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${FLOW_ACTOR[s] === 'Cliente' ? 'bg-primary/[0.10] text-primary' : FLOW_ACTOR[s] === 'Técnico' ? 'bg-info-soft text-primary-2' : 'bg-surface-2 text-muted'}`}>{FLOW_ACTOR[s]}</span>
                            {current && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/[0.12] px-2 py-0.5 text-[10.5px] font-bold text-primary">
                                <span className="size-1.5 rounded-full bg-primary ring-2 ring-primary/25" /> Ahora
                              </span>
                            )}
                          </div>
                          <div className={`text-[13.5px] font-semibold leading-snug ${future ? 'text-faint' : 'text-navy'}`}>{FLOW_LABEL[s]}</div>
                          <div className={`mt-0.5 text-[12.5px] ${future ? 'text-faint' : 'text-muted'}`}>Etapa {STATUS_HINT[s]}</div>
                        </div>
                      </div>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </Panel>
          </FadeIn>

          {req.problem_description && (
            <FadeIn>
              <Panel title="Descripción del problema">
                <p className="text-[13px] leading-relaxed text-navy">{req.problem_description}</p>
                {req.photos?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {req.photos.map((_, i) => (
                      <div key={i} className="grid size-16 place-items-center rounded-xl bg-grad-brand text-white shadow-card">Foto {i + 1}</div>
                    ))}
                  </div>
                )}
              </Panel>
            </FadeIn>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4">
          <FadeIn>
            <Panel title="Acciones del admin">
              <div className="mb-2.5">
                <label className="mb-1 block font-mono text-[10.5px] uppercase tracking-[0.06em] text-faint">Override de estado</label>
                <div className="relative">
                  <select
                    value={req.status}
                    onChange={e => override(e.target.value as RequestStatus)}
                    className="w-full appearance-none rounded-xl border border-line bg-surface px-3 py-2.5 text-[13px] font-medium text-navy outline-none focus:border-primary"
                  >
                    {[...FLOW, 'cancelado', 'rechazado'].map(s => (
                      <option key={s} value={s}>{FLOW_LABEL[s as RequestStatus]}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint" />
                </div>
              </div>
              <button className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-[13px] font-semibold text-white hover:bg-primary-2">
                <MessageSquare size={14} /> Ver chat completo
              </button>
              <button className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[13px] font-medium text-primary hover:bg-info-soft">
                <UserCog size={14} /> Reasignar técnico
              </button>
              <button onClick={() => override('cancelado')} className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[13px] font-medium text-error hover:bg-error-soft">
                <Ban size={14} /> Cancelar servicio
              </button>
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-error bg-error-soft px-3.5 py-2.5 text-[13px] font-medium text-error">
                <RotateCcw size={14} /> Iniciar reembolso
              </button>
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-faint">
                <Info size={11} /> <span>Acciones destructivas piden confirmación + motivo.</span>
              </div>
            </Panel>
          </FadeIn>

          <FadeIn>
            <Panel title="Notas internas">
              <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Anota observaciones internas…" rows={3} />
              <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[13px] font-medium text-primary hover:bg-info-soft">
                <Wand2 size={13} /> Guardar nota
              </button>
              <div className="mt-3.5 mb-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-faint">Historial</div>
              <div className="rounded-xl border border-line bg-surface-2 p-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-[12px] font-semibold">Sofía Admin</span>
                  <span className="rounded bg-surface px-1.5 py-px text-[10px] text-faint">Admin</span>
                  <span className="ml-auto font-mono text-[10.5px] text-faint">{fmtTime(req.created_at)}</span>
                </div>
                <p className="mt-1.5 text-[12.5px] leading-snug text-navy">Servicio monitoreado. Sin incidencias reportadas hasta el momento.</p>
              </div>
            </Panel>
          </FadeIn>

          <FadeIn>
            <Panel title="Metadata">
              <div className="flex flex-col">
                <MetaRow label="ID"><span className="font-mono text-[12.5px] font-medium">{req.id}</span></MetaRow>
                <MetaRow label="Región"><span className="text-[12.5px]">{addr?.state ?? 'Jalisco'}</span></MetaRow>
                <MetaRow label="Origen"><span className="flex items-center gap-1.5 text-[12.5px]"><Smartphone size={12} className="text-primary" /> App móvil</span></MetaRow>
                <MetaRow label="Creado"><span className="text-[12.5px]">{fmtTime(req.created_at)}</span></MetaRow>
              </div>
            </Panel>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}

const STATUS_HINT: Record<RequestStatus, string> = {
  solicitado: 'inicial del flujo', aceptado: 'de confirmación', en_camino: 'de traslado',
  en_sitio: 'de llegada', en_ejecucion: 'de trabajo activo', completado: 'de cierre técnico',
  pagado: 'de cobro', calificado: 'de evaluación', cancelado: 'cancelada', rechazado: 'rechazada',
};

function MetaTag({ icon: Icon, children }: { icon: React.ComponentType<{ size?: number; className?: string }>; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-[11.5px] font-medium text-muted">
      <Icon size={12} className="text-muted" /> {children}
    </span>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-line/60 py-2 last:border-0">
      <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-faint">{label}</span>
      {children}
    </div>
  );
}

function MicroMap() {
  return (
    <svg viewBox="0 0 96 96" width="84" height="84" className="shrink-0 rounded-xl bg-surface-2">
      <path d="M0 50 Q 30 40 96 55" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="50" cy="50" r="22" fill="rgba(10,107,207,0.14)" stroke="rgba(10,107,207,0.4)" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="50" cy="50" r="5" fill="#0A6BCF" stroke="#FFFFFF" strokeWidth="2" />
    </svg>
  );
}
