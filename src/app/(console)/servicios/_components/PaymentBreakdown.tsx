'use client';

import { useEffect, useState } from 'react';
import { Banknote, CreditCard, Gavel, HandCoins, Receipt, RotateCcw, XCircle } from 'lucide-react';
import { Badge, Button, Card, Input, Kicker, Modal, Textarea } from '@/components/ds';
import { CashReviewModal } from '@/components/cash-review-modal';
import { useAction } from '@/components/use-action';
import {
  fetchOrderPaymentSummary,
  getOrderPayments,
  getOrderQuotes,
  quotePaymentOf,
  retryBaseFeeRefund,
  useTick,
  waiveBaseFee,
} from '@/lib/data/store';
import { fmtDateTime } from '@/lib/dates';
import { useAuth } from '@/lib/auth';
import {
  BASE_STATUS,
  CASH_STATUS,
  CLIENT_RESPONSE_LABEL,
  QUOTE_STATUS,
  OUTCOME_LABEL,
  buildPaymentSummary,
  canWaiveBase,
  cashDiff,
  reviewReason,
  type PayOrder,
  type PaymentSummary,
} from '@/lib/payments';
import { surchargeBadge } from '@/lib/scheduleRules';
import { money } from './shared';

const when = (iso: string | null) =>
  iso ? fmtDateTime(iso, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

function Line({
  label,
  value,
  strong,
  tone,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  strong?: boolean;
  tone?: 'error' | 'success';
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={strong ? 'font-display font-bold text-navy' : 'text-muted'}>{label}</dt>
      <dd
        className={`text-right font-mono tabular ${strong ? 'text-[15px] font-semibold text-navy' : 'text-body'} ${
          tone === 'error' ? '!text-error' : tone === 'success' ? '!text-success' : ''
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

/**
 * «Formas de pago» de un servicio del modelo tarifa base (tarjeta, en app) +
 * presupuesto (efectivo): montos, método y estado de cada parte, y las acciones
 * de soporte (exonerar tarifa base, resolver revisión de efectivo).
 */
export function PaymentBreakdown({ order }: { order: PayOrder }) {
  const tick = useTick();
  const { can } = useAuth();
  const { busy, run } = useAction();
  const [rpc, setRpc] = useState<PaymentSummary | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [waiveOpen, setWaiveOpen] = useState(false);
  const [reason, setReason] = useState('');

  // El servidor manda (get_order_payment_summary); mientras tanto, o si falla,
  // se calcula con la orden y sus pagos del snapshot.
  useEffect(() => {
    let live = true;
    void fetchOrderPaymentSummary(order.id).then(s => live && setRpc(s));
    return () => {
      live = false;
    };
  }, [order.id, order.updated_at, tick]);
  const s =
    rpc && rpc.orderId === order.id
      ? rpc
      : buildPaymentSummary(order, getOrderPayments(order.id), getOrderQuotes(order.id));
  const b = s.base;
  const q = s.quote;
  const quotePay = quotePaymentOf(order.id);
  const canResolve = can('soporte') || can('finanzas');
  const diff = cashDiff(q);
  const cash = q.cashStatus ? (CASH_STATUS[q.cashStatus] ?? { label: q.cashStatus, tone: 'neutral' as const }) : null;
  const base = b ? (BASE_STATUS[b.status] ?? { label: b.status, tone: 'neutral' as const }) : null;
  const commission = quotePay?.commission_cents ?? order.commission_cents ?? 0;
  const c = s.concepts;
  const qs = s.quoteState;
  const qStatus = QUOTE_STATUS[qs.status];
  const ruleBadge =
    order.schedule_surcharge_rule_id && order.schedule_surcharge_bps > 0
      ? surchargeBadge('percent', order.schedule_surcharge_bps)
      : null;

  return (
    <Card padded>
      <Kicker className="mb-3">Formas de pago</Kicker>

      {c && (
        <section aria-label="Desglose del cobro" className="mb-4">
          <h3 className="mb-2 flex items-center gap-1.5 font-display text-[14px] font-bold text-navy">
            <Receipt size={15} className="text-primary" aria-hidden /> Desglose del cobro
          </h3>
          <dl className="flex flex-col gap-1.5 text-[13.5px]">
            <Line label="Visita (tarifa base)" value={money(c.visitCents, true)} />
            {c.scheduleCents > 0 && (
              <Line
                label={
                  <span>
                    Recargo de horario
                    {c.scheduleRuleName && (
                      <span className="ml-1.5 inline-flex flex-wrap items-center gap-1.5 align-middle">
                        <Badge tone="info">{c.scheduleRuleName}</Badge>
                        {ruleBadge && <span className="font-mono text-[11.5px] text-muted">{ruleBadge}</span>}
                      </span>
                    )}
                  </span>
                }
                value={money(c.scheduleCents, true)}
              />
            )}
            {c.emergencyCents > 0 && <Line label="Recargo de emergencia" value={money(c.emergencyCents, true)} />}
            <Line
              label={
                <span>
                  Cotización <span className="text-[12px] text-faint">· efectivo</span>
                </span>
              }
              value={s.closedByQuoteRejection ? '—' : c.quoteCents > 0 ? money(c.quoteCents, true) : '—'}
            />
            <div className="my-0.5 border-t border-divider" />
            <Line label="Total del servicio" value={money(c.totalCents, true)} strong />
          </dl>
          {s.closedByQuoteRejection && (
            <div className="mt-2.5 flex items-start gap-2 rounded-btn bg-warning-soft px-3 py-2 text-[12.5px] text-body">
              <XCircle size={15} className="mt-0.5 shrink-0 text-warning-ink" aria-hidden />
              <p>
                <b className="font-semibold text-navy">Cerrado por cotización rechazada.</b> El cliente rechazó la
                cotización: el servicio se cerró y solo se cobró la visita
                {c.scheduleCents > 0 ? ' con su recargo' : ''}. No hay efectivo pendiente.
              </p>
            </div>
          )}
        </section>
      )}

      {b && base && (
        <section aria-label="Tarifa base" className="mb-4 border-t border-divider pt-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-1.5 font-display text-[14px] font-bold text-navy">
              <CreditCard size={15} className="text-primary" aria-hidden /> Tarifa base · Tarjeta
            </h3>
            <Badge tone={base.tone}>{base.label}</Badge>
          </div>
          <dl className="flex flex-col gap-1.5 text-[13.5px]">
            <Line label="Total base (visita + recargos)" value={money(b.totalCents, true)} strong />
            {b.paidAt && <Line label="Pagada" value={when(b.paidAt)} />}
            {b.refundedCents > 0 && (
              <Line
                label={b.refundedAt ? `Reembolsada · ${when(b.refundedAt)}` : 'Reembolsado'}
                value={`−${money(b.refundedCents, true)}`}
                tone="error"
              />
            )}
          </dl>
          {b.status === 'refund_pending' && (
            <p className="mt-2 rounded-btn bg-warning-soft px-3 py-2 text-[12.5px] text-body">
              No hubo visita: el reembolso a la tarjeta del cliente está en proceso.
            </p>
          )}
          {b.status === 'refund_failed' && (
            <div className="mt-2 rounded-btn bg-error-soft px-3 py-2 text-[12.5px] text-body">
              <p>El reembolso a la tarjeta falló 10 veces y ya no se reintenta solo. Revisa el pago en Stripe y reinténtalo.</p>
              <Button
                className="mt-2"
                size="sm"
                variant="secondary"
                icon={RotateCcw}
                loading={busy === 'retry-refund'}
                disabled={!!busy || !can('finanzas')}
                title={can('finanzas') ? undefined : 'Solo finanzas reintenta reembolsos'}
                onClick={() => void run('retry-refund', () => retryBaseFeeRefund(order.id), 'Reembolso en proceso de nuevo')}
              >
                Reintentar reembolso
              </Button>
            </div>
          )}
          {order.dispatch_status === 'awaiting_payment' && (
            <p className="mt-2 rounded-btn bg-warning-soft px-3 py-2 text-[12.5px] text-body">
              Emergencia en espera de pago: no se despacha a técnicos hasta cobrar la tarifa base.
            </p>
          )}
          {canWaiveBase(order) && (
            <Button
              className="mt-2.5"
              size="sm"
              variant="secondary"
              icon={HandCoins}
              disabled={!can('soporte')}
              title={can('soporte') ? 'La solicitud sale sin cobrar la visita' : 'Solo soporte exonera la tarifa base'}
              onClick={() => {
                setReason('');
                setWaiveOpen(true);
              }}
            >
              Exonerar tarifa base
            </Button>
          )}
        </section>
      )}

      <section aria-label="Cotización" className={b ? 'border-t border-divider pt-4' : ''}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-1.5 font-display text-[14px] font-bold text-navy">
            <Banknote size={15} className="text-success" aria-hidden />
            {s.paymentModel === 'base_cash' ? 'Cotización · Efectivo' : 'Servicio'}
          </h3>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {s.paymentModel === 'base_cash' && qs.status !== 'none' && (
              <Badge tone={qStatus.tone}>{qStatus.label}</Badge>
            )}
            {cash && <Badge tone={cash.tone}>{cash.label}</Badge>}
          </div>
        </div>
        {qs.status === 'rejected' && (
          <div className="mb-2.5 rounded-btn bg-error-soft px-3 py-2 text-[12.5px]">
            <div className="font-sans font-semibold text-navy">
              Rechazada por el cliente{qs.rejectedAt ? ` · ${when(qs.rejectedAt)}` : ''}
            </div>
            <p className="mt-0.5 text-body">
              {qs.rejectReason ? <>Motivo: “{qs.rejectReason}”</> : 'Sin motivo indicado.'}
            </p>
            {qs.totalCents > 0 && (
              <p className="mt-0.5 text-muted">Cotización de {money(qs.totalCents, true)} · no se cobra.</p>
            )}
          </div>
        )}
        {qs.status === 'draft' && (
          <p className="mb-2.5 rounded-btn bg-panel px-3 py-2 text-[12.5px] text-body">
            Borrador del técnico{qs.totalCents > 0 ? ` por ${money(qs.totalCents, true)}` : ''}: el cliente aún no la ve.
            Se envía al adjuntar al menos una imagen o PDF de evidencia.
          </p>
        )}
        {qs.status === 'sent' && (
          <p className="mb-2.5 rounded-btn bg-info-soft px-3 py-2 text-[12.5px] text-body">
            Enviada{qs.sentAt ? ` · ${when(qs.sentAt)}` : ''}: el cliente decide si la acepta o la rechaza.
          </p>
        )}
        {s.closedByQuoteRejection ? (
          <p className="text-[13px] text-muted">Sin cobro en efectivo: el servicio se cerró al rechazarse la cotización.</p>
        ) : q.totalCents > 0 || q.expectedCents != null ? (
          <dl className="flex flex-col gap-1.5 text-[13.5px]">
            <Line label="Total cotización" value={money(q.totalCents, true)} strong />
            {s.paymentModel !== 'base_cash' && (
              <Line label="Método" value={q.method === 'card' ? 'Tarjeta' : q.method === 'cash' ? 'Efectivo' : (q.method ?? '—')} />
            )}
            {s.paymentModel === 'base_cash' && (
              <>
                {q.expectedCents != null && <Line label="Esperado" value={money(q.expectedCents, true)} />}
                {q.expectedCents != null && <Line label="Recibido (técnico)" value={money(q.receivedCents, true)} />}
                {diff != null && diff !== 0 && (
                  <Line
                    label="Diferencia"
                    value={`${diff > 0 ? '+' : '−'}${money(Math.abs(diff), true)}`}
                    tone="error"
                  />
                )}
                {q.reportedAt && <Line label="Reportado" value={when(q.reportedAt)} />}
                {q.clientReportedCents != null && (
                  <Line label="Reportó el cliente" value={money(q.clientReportedCents, true)} />
                )}
                {q.clientResponse && (
                  <Line label="Cliente" value={CLIENT_RESPONSE_LABEL[q.clientResponse] ?? q.clientResponse} />
                )}
              </>
            )}
          </dl>
        ) : qs.status === 'draft' || qs.status === 'sent' ? null : (
          <p className="text-[13px] text-muted">
            {s.paymentModel === 'base_cash'
              ? 'Sin cotización todavía. Se paga en efectivo al técnico al terminar.'
              : 'Sin pago registrado.'}
          </p>
        )}

        {(q.reviewStatus || s.cashReviewOpen) && (
          <div
            className={`mt-3 rounded-btn px-3 py-2.5 text-[12.5px] ${
              s.cashReviewOpen ? 'bg-error-soft' : 'bg-panel'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-sans font-semibold text-navy">
                Revisión de efectivo · {s.cashReviewOpen ? 'abierta' : 'resuelta'}
              </span>
              <Gavel size={14} className={s.cashReviewOpen ? 'text-error' : 'text-muted'} aria-hidden />
            </div>
            <p className="mt-0.5 text-body">{reviewReason(q.reviewReason)}</p>
            {quotePay?.client_dispute_reason && (
              <p className="mt-1 italic text-muted">“{quotePay.client_dispute_reason}”</p>
            )}
            {!s.cashReviewOpen && quotePay?.review_outcome && (
              <p className="mt-1 text-body">
                <b>{OUTCOME_LABEL[quotePay.review_outcome] ?? quotePay.review_outcome}</b>
                {quotePay.review_notes ? ` · ${quotePay.review_notes}` : ''}
              </p>
            )}
          </div>
        )}
        {s.cashReviewOpen && (
          <Button
            className="mt-2.5"
            size="sm"
            icon={Gavel}
            disabled={!canResolve}
            title={canResolve ? undefined : 'Solo soporte o finanzas resuelven la revisión'}
            onClick={() => setReviewOpen(true)}
          >
            Resolver revisión
          </Button>
        )}
      </section>

      {s.paymentModel === 'base_cash' && commission > 0 && (
        <div className="mt-4 flex flex-col gap-1.5 border-t border-divider pt-3 text-[13.5px]">
          <dl className="flex flex-col gap-1.5">
            <Line
              label={`Comisión del efectivo ${((order.commission_bps ?? 1500) / 100).toFixed(0)}%`}
              value={`−${money(commission, true)}`}
            />
          </dl>
          {commission > 0 && (
            <p className="text-[12px] text-muted">
              La comisión del efectivo es deuda del técnico: se descuenta sola de su saldo
              {quotePay && quotePay.cash_debt_recovered_cents > 0
                ? ` (recuperado ${money(quotePay.cash_debt_recovered_cents, true)})`
                : ''}
              .
            </p>
          )}
        </div>
      )}

      <CashReviewModal orderId={order.id} open={reviewOpen} onClose={() => setReviewOpen(false)} />

      <Modal
        open={waiveOpen}
        onClose={() => busy === null && setWaiveOpen(false)}
        dismissible={busy === null}
        icon={HandCoins}
        tone="warning"
        title="Exonerar tarifa base"
        description="La solicitud se abre a técnicos sin cobrar la visita al cliente (si era una emergencia, empieza el despacho). Queda en la bitácora."
        footer={
          <>
            <Button variant="secondary" onClick={() => setWaiveOpen(false)} disabled={busy !== null}>
              Volver
            </Button>
            <Button
              loading={busy === 'waive'}
              disabled={!reason.trim()}
              onClick={async () => {
                const ok = await run('waive', () => waiveBaseFee(order.id, reason), 'Tarifa base exonerada');
                if (ok) setWaiveOpen(false);
              }}
            >
              Exonerar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <Input label="Tarifa base" value={money(order.base_total_cents, true)} readOnly />
          <Textarea
            rows={2}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Motivo (obligatorio)"
            aria-label="Motivo de la exoneración"
          />
        </div>
      </Modal>
    </Card>
  );
}
