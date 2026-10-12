'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ExternalLink, FileText, Phone, XCircle } from 'lucide-react';
import { Badge, Button, Chip, EmptyState, Kicker, Modal, Sheet, Skeleton, Textarea } from '@/components/ds';
import { useAction } from '@/components/use-action';
import { acceptPaymentTransfer, fetchPaymentTransfer, rejectPaymentTransfer, transferProofUrl, useTick } from '@/lib/data/store';
import { fmtDateTime } from '@/lib/dates';
import { BASE_STATUS } from '@/lib/payments';
import {
  BASE_METHOD_LABEL,
  QUICK_REJECT_REASONS,
  REJECT_REASON_MAX,
  canReviewTransfer,
  proofKind,
  transferStatus,
  type TransferDetail,
} from '@/lib/transfers';
import { STATUS, money } from '../../servicios/_components/shared';

const when = (iso: string | null | undefined) =>
  iso ? fmtDateTime(iso, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
      <dt className="text-muted">{label}</dt>
      <dd className="min-w-0 text-right text-body">{children}</dd>
    </div>
  );
}

/** Vista previa del comprobante: imagen en línea o enlace al PDF (URL firmada de 10 min). */
function Proof({ path, reference }: { path: string; reference: string }) {
  const [url, setUrl] = useState<string | null | undefined>(undefined);
  const kind = proofKind(path);
  useEffect(() => {
    let live = true;
    setUrl(undefined);
    void transferProofUrl(path).then(u => live && setUrl(u));
    return () => {
      live = false;
    };
  }, [path]);

  if (url === undefined) return <Skeleton className="h-64 w-full" />;
  if (url === null)
    return (
      <EmptyState
        kind="no-results"
        compact
        title="Comprobante no disponible"
        description="No se pudo generar el enlace al archivo. Reintenta en un momento."
      />
    );
  if (kind === 'image')
    return (
      <a href={url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-line bg-panel">
        {/* eslint-disable-next-line @next/next/no-img-element -- URL firmada de Storage, no optimizable por next/image */}
        <img src={url} alt={`Comprobante de transferencia, referencia ${reference}`} className="mx-auto max-h-[420px] w-auto object-contain" />
      </a>
    );
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-xl border border-line bg-panel px-4 py-3 hover:border-primary"
    >
      <FileText size={22} className="text-primary" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block font-sans text-[13.5px] font-semibold text-navy">
          {kind === 'pdf' ? 'Abrir comprobante (PDF)' : 'Abrir comprobante'}
        </span>
        <span className="block truncate font-mono text-[11.5px] text-muted">{path.split('/').pop()}</span>
      </span>
      <ExternalLink size={15} className="text-muted" aria-hidden />
    </a>
  );
}

/**
 * Detalle de un comprobante (admin_get_payment_transfer): archivo, monto,
 * referencia, servicio, cliente e historial; Aceptar / Rechazar con motivo.
 * El backend notifica al cliente en ambos casos.
 */
export function TransferSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const tick = useTick();
  const { busy, run } = useAction();
  const [d, setD] = useState<TransferDetail | null | undefined>(undefined);
  const [confirmAccept, setConfirmAccept] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!id) return;
    let live = true;
    void fetchPaymentTransfer(id).then(r => live && setD(r));
    return () => {
      live = false;
    };
  }, [id, tick]);
  useEffect(() => {
    if (!id) {
      setD(undefined);
      setConfirmAccept(false);
      setRejectOpen(false);
    }
  }, [id]);

  const t = d?.transfer;
  const st = transferStatus(t?.status);
  const reviewable = !!t && canReviewTransfer(t.status);
  const orderSt = d ? (STATUS[d.order.status as keyof typeof STATUS] ?? { label: d.order.status, tone: 'neutral' as const }) : null;
  const baseSt = d ? (BASE_STATUS[d.order.base_fee_status] ?? { label: d.order.base_fee_status, tone: 'neutral' as const }) : null;
  const folio = d?.order.folio ? `SVC-${d.order.folio}` : 'Servicio';

  return (
    <Sheet
      open={!!id}
      onClose={() => busy === null && onClose()}
      width={520}
      kicker="Revisión de pagos · Transferencia"
      title={d ? `${folio} · ${money(t?.amount_cents ?? 0, true)}` : 'Transferencia'}
      footer={
        reviewable ? (
          <div className="flex w-full gap-2.5">
            <Button
              variant="secondary"
              icon={XCircle}
              disabled={busy !== null}
              onClick={() => {
                setReason('');
                setRejectOpen(true);
              }}
            >
              Rechazar
            </Button>
            <Button full variant="approve" icon={CheckCircle2} disabled={busy !== null} onClick={() => setConfirmAccept(true)}>
              Aceptar
            </Button>
          </div>
        ) : undefined
      }
    >
      {d === undefined ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : d === null || !t ? (
        <EmptyState
          kind="no-results"
          compact
          title="Transferencia no disponible"
          description="No existe o el servidor no respondió. Reintenta en un momento."
        />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={st.tone}>{st.label}</Badge>
            <span className="font-sans text-[12.5px] text-muted">Enviada {when(t.created_at)}</span>
          </div>

          {t.status === 'rejected' && (
            <div className="rounded-btn bg-error-soft px-3 py-2 text-[12.5px] text-body">
              <b className="font-semibold text-navy">Rechazada{t.reviewer_name ? ` por ${t.reviewer_name}` : ''}</b> ·{' '}
              {when(t.reviewed_at)}
              <p className="mt-0.5">Motivo: “{t.reject_reason}”</p>
            </div>
          )}
          {t.status === 'accepted' && (
            <p className="rounded-btn bg-success-soft px-3 py-2 text-[12.5px] text-body">
              <b className="font-semibold text-navy">Aceptada{t.reviewer_name ? ` por ${t.reviewer_name}` : ''}</b> ·{' '}
              {when(t.reviewed_at)}. El adelanto de la visita quedó pagado.
            </p>
          )}
          {t.status === 'cancelled' && (
            <p className="rounded-btn bg-panel px-3 py-2 text-[12.5px] text-body">
              El cliente terminó pagando la visita con tarjeta; este comprobante ya no se revisa.
            </p>
          )}

          <section aria-label="Comprobante">
            <Kicker className="mb-2">Comprobante</Kicker>
            <Proof path={d.proofPath || t.proof_path} reference={t.reference} />
          </section>

          <section aria-label="Pago">
            <Kicker className="mb-2">Pago</Kicker>
            <dl className="flex flex-col gap-1.5">
              <Row label="Monto">
                <span className="font-mono font-semibold text-navy tabular">{money(t.amount_cents, true)}</span>
              </Row>
              <Row label="Referencia">
                <span className="break-all font-mono">{t.reference}</span>
              </Row>
              <Row label="Adelanto de la visita">
                {baseSt && <Badge tone={baseSt.tone}>{baseSt.label}</Badge>}
              </Row>
              <Row label="Método">{BASE_METHOD_LABEL[d.order.base_fee_method]}</Row>
            </dl>
          </section>

          <section aria-label="Servicio">
            <Kicker className="mb-2">Servicio</Kicker>
            <dl className="flex flex-col gap-1.5">
              <Row label="Folio">
                <Link
                  href={`/servicios/${d.order.id}`}
                  className="inline-flex items-center gap-1 font-mono font-semibold text-primary hover:underline"
                >
                  {folio} <ExternalLink size={11} aria-hidden />
                </Link>
              </Row>
              {d.order.title && <Row label="Trabajo">{d.order.title}</Row>}
              <Row label="Categoría">{d.order.category_name ?? '—'}</Row>
              <Row label="Estado">{orderSt && <Badge tone={orderSt.tone}>{orderSt.label}</Badge>}</Row>
              {d.order.technician_name && <Row label="Técnico">{d.order.technician_name}</Row>}
            </dl>
          </section>

          <section aria-label="Cliente">
            <Kicker className="mb-2">Cliente</Kicker>
            <dl className="flex flex-col gap-1.5">
              <Row label="Nombre">{d.client.full_name ?? '—'}</Row>
              <Row label="Teléfono">
                {d.client.phone ? (
                  <a href={`tel:${d.client.phone}`} className="inline-flex items-center gap-1 font-mono text-primary hover:underline">
                    <Phone size={12} aria-hidden /> {d.client.phone}
                  </a>
                ) : (
                  '—'
                )}
              </Row>
            </dl>
          </section>

          {d.history.length > 1 && (
            <section aria-label="Historial de comprobantes">
              <Kicker className="mb-2">Historial de comprobantes</Kicker>
              <ol className="flex flex-col divide-y divide-divider rounded-xl border border-line">
                {d.history.map(h => {
                  const hs = transferStatus(h.status);
                  return (
                    <li key={h.id} className={`px-3.5 py-2.5 text-[12.5px] ${h.id === t.id ? 'bg-tint' : ''}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-body">
                          {when(h.created_at)} · ref. {h.reference ?? '—'}
                        </span>
                        <Badge tone={hs.tone}>{hs.label}</Badge>
                      </div>
                      {h.reject_reason && <p className="mt-0.5 italic text-muted">“{h.reject_reason}”</p>}
                    </li>
                  );
                })}
              </ol>
            </section>
          )}
        </div>
      )}

      <Modal
        open={confirmAccept && !!t}
        onClose={() => busy === null && setConfirmAccept(false)}
        dismissible={busy === null}
        icon={CheckCircle2}
        tone="success"
        title="Aceptar transferencia"
        description={`Confirma que recibiste ${money(t?.amount_cents ?? 0, true)} con la referencia «${t?.reference ?? ''}». El adelanto de la visita queda pagado y se avisa al cliente.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmAccept(false)} disabled={busy !== null}>
              Volver
            </Button>
            <Button
              variant="approve"
              loading={busy === 'accept'}
              onClick={async () => {
                if (!t) return;
                const ok = await run('accept', () => acceptPaymentTransfer(t.id), 'Transferencia aceptada · se notificó al cliente');
                if (ok) setConfirmAccept(false);
              }}
            >
              Aceptar
            </Button>
          </>
        }
      />

      <Modal
        open={rejectOpen && !!t}
        onClose={() => busy === null && setRejectOpen(false)}
        dismissible={busy === null}
        icon={XCircle}
        tone="danger"
        title="Rechazar transferencia"
        description="El cliente verá el motivo y podrá subir otro comprobante o pagar con tarjeta. El servicio sigue su curso."
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectOpen(false)} disabled={busy !== null}>
              Volver
            </Button>
            <Button
              variant="destructive"
              loading={busy === 'reject'}
              disabled={!reason.trim()}
              onClick={async () => {
                if (!t) return;
                const ok = await run('reject', () => rejectPaymentTransfer(t.id, reason), 'Transferencia rechazada · se notificó al cliente');
                if (ok) setRejectOpen(false);
              }}
            >
              Rechazar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Motivos rápidos">
            {QUICK_REJECT_REASONS.map(r => (
              <Chip key={r} active={reason === r} onClick={() => setReason(r)}>
                {r}
              </Chip>
            ))}
          </div>
          <Textarea
            rows={3}
            value={reason}
            maxLength={REJECT_REASON_MAX}
            onChange={e => setReason(e.target.value)}
            placeholder="Motivo del rechazo (obligatorio)"
            aria-label="Motivo del rechazo"
          />
        </div>
      </Modal>
    </Sheet>
  );
}
