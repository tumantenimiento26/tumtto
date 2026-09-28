'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Clock,
  Pencil,
  Wallet,
  Ban,
  RotateCcw,
  Check,
  Star,
  Briefcase,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorPage,
  Modal,
  ScreenSkeleton,
  toast,
} from '@/components/ds';
import { useAction } from '@/components/use-action';
import {
  getAllPayments,
  getAllRequests,
  getCategories,
  getKycSessions,
  getLedger,
  getNotes,
  getProfile,
  getTechCategories,
  getTechDocuments,
  getTechMunicipality,
  getTechRadiusKm,
  getTechRates,
  getTechRatings,
  getTechnician,
  getWallet,
  loadExtras,
  loadWorld,
  reactivateTechnician,
  rejectKyc,
  resolveKyc,
  suspendTechnician,
  useExtras,
  useTick,
  useWorldFailed,
  useWorldReady,
} from '@/lib/data/store';
import { formatPhone } from '@/lib/phone';
import { orderCode } from '@/lib/orderCode';
import {
  KYC_GROUP_META,
  ORDER_STATUS,
  ago,
  diditChecks,
  initials,
  kycGroup,
  slaLabel,
  slaRemainingHours,
} from '@/lib/techConsole';
import {
  BankCard,
  CardHead,
  CheckRow,
  DocTile,
  EditProfileSheet,
  IneTile,
  KV,
  NotesCard,
  RatesCard,
  RejectModal,
  fecha,
} from '../_components/detail-parts';

const DONE = new Set(['completed', 'paid', 'closed']);
const money = (c: number) => `$${Math.round(c / 100).toLocaleString('es-MX')}`;

export default function TecnicoDetailPage() {
  useTick();
  const extras = useExtras();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const ready = useWorldReady();
  const failed = useWorldFailed();
  const { busy, run } = useAction();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);

  useEffect(() => {
    void loadExtras();
  }, []);

  const tech = getTechnician(id);
  const profile = tech ? getProfile(tech.id) : null;

  const data = useMemo(() => {
    if (!tech) return null;
    const cats = getCategories();
    const orders = getAllRequests().filter(o => o.technician_id === tech.id);
    const done = orders.filter(o => DONE.has(o.status));
    const since30 = Date.now() - 30 * 864e5;
    const pays = getAllPayments().filter(
      p =>
        p.status === 'paid' &&
        orders.some(o => o.id === p.service_order_id) &&
        new Date(p.paid_at ?? p.created_at).getTime() >= since30,
    );
    const wallet = getWallet(tech.id);
    return {
      catNames: getTechCategories(tech.id)
        .map(tc => cats.find(c => c.id === tc.category_id)?.name)
        .filter((n): n is string => !!n),
      rates: getTechRates(tech.id).map(r => ({
        category_id: r.category_id,
        cat: cats.find(c => c.id === r.category_id)?.name ?? '—',
        visita_cents: r.visita_cents,
        hora_cents: r.hora_cents,
        minimo_cents: r.minimo_cents,
      })),
      recent: orders.slice(0, 5),
      jobs: done.length,
      income30: pays.reduce((s, p) => s + p.amount_cents - p.commission_cents, 0),
      balance:
        wallet?.available_cents ??
        getLedger(tech.id).reduce((s, e) => s + e.amount_cents, 0),
      sessions: getKycSessions(tech.id).sort((a, b) =>
        b.created_at.localeCompare(a.created_at),
      ),
      docs: getTechDocuments(tech.id),
      ratings: getTechRatings(tech.id).slice(0, 4),
      zone: getTechMunicipality(tech.id),
      radius: getTechRadiusKm(tech.id),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tech, extras]);

  if (failed)
    return (
      <ErrorPage kind="500" primary={{ label: 'Reintentar', onClick: () => void loadWorld(true) }} />
    );
  if (!ready) return <ScreenSkeleton kind="detail" />;
  if (!tech || !profile || !data)
    return (
      <ErrorPage
        kind="404"
        primary={{ label: 'Volver a técnicos', href: '/tecnicos' }}
      />
    );

  const name = profile.full_name ?? tech.display_name ?? 'Técnico';
  const group = kycGroup(tech.kyc_status, profile.status);
  const meta = KYC_GROUP_META[group];
  const reviewing = group === 'in_review' || group === 'declined';
  const latest = data.sessions[0] ?? null;
  const submittedAt = data.docs[0]?.created_at ?? latest?.created_at ?? null;
  const sla = slaLabel(slaRemainingHours(submittedAt));
  const rejectNote =
    group === 'declined'
      ? getNotes(tech.id).find(n => n.text.startsWith('KYC rechazado'))?.text.replace('KYC rechazado — ', '')
      : null;
  const docsMissing = extras.unavailable.docs;

  const approve = () =>
    void run('approve', () => resolveKyc(tech.id, true), `Técnico aprobado · ${name}`);

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/tecnicos"
        className="inline-flex w-fit items-center gap-1 font-sans text-[13.5px] font-semibold text-primary hover:underline"
      >
        <ChevronLeft size={16} /> Técnicos
      </Link>

      {/* Encabezado */}
      <Card padded className="animate-up">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-full bg-action font-display text-[18px] font-bold text-white">
            {initials(name)}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[24px] font-extrabold tracking-[-0.5px] text-navy">
              {name}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Badge tone={meta.tone}>{meta.label}</Badge>
              {data.catNames.length > 0 && <Badge>{data.catNames.join(' · ')}</Badge>}
              {data.zone && <Badge>{data.zone}</Badge>}
              {group === 'approved' && (
                <Badge tone={tech.is_available ? 'success' : 'neutral'} dot>
                  {tech.is_available ? 'Disponible' : 'No disponible'}
                </Badge>
              )}
            </div>
            {group === 'in_review' && (
              <div className="mt-2">
                <Badge tone={sla.tone}>
                  <Clock size={12} className="mr-1" />
                  {sla.text}
                </Badge>
              </div>
            )}
            {rejectNote && (
              <p className="mt-2 font-sans text-[13px] text-error">
                <b>Motivo:</b> {rejectNote}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {group === 'in_review' && (
              <>
                <Button variant="destructive" disabled={!!busy} onClick={() => setRejectOpen(true)}>
                  Rechazar
                </Button>
                <Button variant="approve" loading={busy === 'approve'} disabled={!!busy} onClick={approve}>
                  Aprobar técnico
                </Button>
              </>
            )}
            {group === 'declined' && (
              <Button variant="approve" icon={Check} loading={busy === 'approve'} disabled={!!busy} onClick={approve}>
                Aprobar técnico
              </Button>
            )}
            {group === 'approved' && (
              <>
                <Button variant="secondary" icon={Pencil} onClick={() => setEditOpen(true)}>
                  Editar perfil
                </Button>
                {/* ponytail: no hay RPC de ajuste de cartera (ledger_entries es de
                    solo lectura por API); habilitar cuando exista admin_adjust_wallet. */}
                <Button
                  variant="secondary"
                  icon={Wallet}
                  disabled
                  title="Próximamente: el backend aún no permite ajustes manuales de cartera"
                >
                  Ajustar cartera
                </Button>
                <Button variant="destructive" icon={Ban} disabled={!!busy} onClick={() => setSuspendOpen(true)}>
                  Suspender
                </Button>
              </>
            )}
            {group === 'suspended' && (
              <Button
                icon={RotateCcw}
                loading={busy === 'reactivate'}
                disabled={!!busy}
                onClick={() =>
                  void run('reactivate', () => reactivateTechnician(tech.id), `Técnico reactivado · ${name}`)
                }
              >
                Reactivar técnico
              </Button>
            )}
          </div>
        </div>
      </Card>

      {reviewing ? (
        <>
          {/* Documentos */}
          <Card padded className="animate-up">
            <CardHead title={`Documentos · enviado ${ago(submittedAt)}`} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <IneTile status={latest?.status ?? null} />
              {data.docs.map(d => (
                <DocTile key={d.id} doc={d} />
              ))}
            </div>
            {docsMissing ? (
              <p className="mt-3 font-sans text-[12.5px] text-muted">
                Los documentos adicionales (antecedentes, domicilio) aún no están disponibles en
                este entorno.
              </p>
            ) : (
              data.docs.length === 0 && (
                <p className="mt-3 font-sans text-[12.5px] text-muted">
                  El técnico no ha subido antecedentes no penales ni comprobante de domicilio.
                </p>
              )
            )}
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card padded className="animate-up">
              <CardHead title="Datos personales" />
              <KV label="Teléfono" value={formatPhone(profile.phone) || '—'} mono />
              <KV label="CURP" value={tech.curp ?? '—'} mono />
              <KV label="RFC" value={tech.rfc ?? '—'} mono />
              <KV label="Domicilio" value={tech.home_address ?? '—'} />
              <KV label="Registro" value={fecha(profile.created_at)} />
            </Card>
            <Card padded className="animate-up">
              <CardHead title="Verificaciones automáticas · Didit" />
              {latest ? (
                <>
                  {diditChecks(latest.raw_decision).map(c => (
                    <CheckRow key={c.label} label={c.label} ok={c.ok} />
                  ))}
                  <KV label="Sesión" value={latest.didit_session_id.slice(0, 12)} mono />
                  <KV
                    label="Estado"
                    value={
                      <Badge tone={latest.status === 'approved' ? 'success' : latest.status === 'declined' ? 'danger' : 'warning'}>
                        {latest.status}
                      </Badge>
                    }
                  />
                  <KV label="Iniciada" value={fecha(latest.created_at)} />
                </>
              ) : (
                <p className="font-sans text-[13px] text-muted">
                  El técnico todavía no inicia la verificación de identidad.
                </p>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card padded className="animate-up">
              <CardHead title="Servicios que realiza" />
              {data.catNames.length ? (
                <div className="flex flex-wrap gap-2">
                  {data.catNames.map(c => (
                    <Badge key={c} tone="info">
                      {c}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="font-sans text-[13px] text-muted">Sin categorías capturadas.</p>
              )}
              <p className="mt-3 inline-flex items-center gap-1.5 font-sans text-[12.5px] text-muted">
                <MapPin size={13} /> Radio de servicio: {data.radius} km
              </p>
            </Card>
            <BankCard tech={tech} />
          </div>
          <NotesCard techId={tech.id} />
        </>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              { l: 'Trabajos completados', v: String(data.jobs), i: Briefcase },
              {
                l: 'Rating',
                v: tech.rating_avg > 0 ? tech.rating_avg.toFixed(1) : '—',
                sub: `${tech.rating_count} reseñas`,
                i: Star,
              },
              { l: 'Ingresos netos · 30 d', v: money(data.income30), i: TrendingUp },
              { l: 'Saldo en cartera', v: money(data.balance), i: Wallet },
            ].map(k => (
              <Card key={k.l} padded hover className="animate-up">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">
                    {k.l}
                  </span>
                  <k.i size={16} className="text-primary" />
                </div>
                <div className="mt-2 font-display text-[24px] font-extrabold text-navy tabular">
                  {k.v}
                </div>
                {k.sub && <div className="font-sans text-[12px] text-muted">{k.sub}</div>}
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1.4fr_1fr]">
            <div className="flex flex-col gap-4">
              <RatesCard techId={tech.id} rates={data.rates} />
              <Card padded>
                <CardHead title="Servicios recientes" />
                {data.recent.length === 0 ? (
                  <p className="font-sans text-[13px] text-muted">Aún no tiene servicios.</p>
                ) : (
                  data.recent.map(o => {
                    const st = ORDER_STATUS[o.status] ?? { label: o.status, tone: 'neutral' as const };
                    const client = getProfile(o.client_id)?.full_name ?? 'Cliente';
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => router.push(`/servicios/${o.id}`)}
                        className="flex w-full items-center justify-between gap-3 border-t border-divider py-2.5 text-left first:border-t-0 hover:bg-panel"
                      >
                        <div className="min-w-0">
                          <div className="font-mono text-[12px] font-semibold text-primary">{orderCode(o.id)}</div>
                          <div className="truncate font-sans text-[13px] text-body">
                            {client}
                            {o.municipality ? ` · ${o.municipality}` : ''}
                          </div>
                        </div>
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </button>
                    );
                  })
                )}
              </Card>
            </div>
            <div className="flex flex-col gap-4">
              <Card padded>
                <CardHead title="Reseñas recientes" />
                {extras.unavailable.ratings ? (
                  <p className="font-sans text-[13px] text-muted">
                    Las reseñas por servicio aún no están disponibles en este entorno.
                  </p>
                ) : data.ratings.length === 0 ? (
                  <EmptyState kind="first-use" title="Sin reseñas" description="Aparecerán cuando los clientes califiquen sus servicios." compact />
                ) : (
                  data.ratings.map(r => (
                    <div key={r.id} className="border-t border-divider py-2.5 first:border-t-0">
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-[13px] font-semibold text-navy">
                          {getProfile(r.reviewer_id)?.full_name ?? 'Cliente'}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-warning" aria-label={`${r.score} de 5`}>
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star key={i} size={12} className={i < r.score ? 'fill-current' : 'opacity-30'} />
                          ))}
                        </span>
                      </div>
                      {r.comment && <p className="mt-1 font-sans text-[13px] text-body">{r.comment}</p>}
                      <p className="mt-0.5 font-mono text-[11px] text-faint">{fecha(r.created_at)}</p>
                    </div>
                  ))
                )}
              </Card>
              <BankCard tech={tech} />
              <NotesCard techId={tech.id} />
            </div>
          </div>
        </>
      )}

      <RejectModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        techName={name}
        busy={busy === 'reject'}
        onConfirm={async (reason, comment) => {
          const ok = await run(
            'reject',
            () => rejectKyc(tech.id, comment ? `${reason} — ${comment}` : reason),
            `KYC rechazado · ${name}`,
          );
          if (ok) setRejectOpen(false);
        }}
      />
      {editOpen && (
        <EditProfileSheet open={editOpen} onClose={() => setEditOpen(false)} tech={tech} fullName={name} />
      )}
      <Modal
        open={suspendOpen}
        onClose={() => !busy && setSuspendOpen(false)}
        dismissible={!busy}
        tone="danger"
        icon={Ban}
        title={`¿Suspender a ${name.split(' ')[0]}?`}
        description="Dejará de recibir solicitudes y no podrá iniciar sesión hasta que lo reactives."
        footer={
          <>
            <Button variant="secondary" disabled={!!busy} onClick={() => setSuspendOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              loading={busy === 'suspend'}
              onClick={async () => {
                const ok = await run('suspend', () => suspendTechnician(tech.id), `Técnico suspendido · ${name}`);
                if (ok) {
                  setSuspendOpen(false);
                  toast.info('Puedes reactivarlo desde este mismo perfil.');
                }
              }}
            >
              Suspender
            </Button>
          </>
        }
      />
    </div>
  );
}
