'use client';

import { useEffect, useState } from 'react';
import { Banknote, CreditCard, Gavel, HandCoins } from 'lucide-react';
import { Badge, Button, Card, Input, Kicker, Modal, Textarea } from '@/components/ds';
import { CashReviewModal } from '@/components/cash-review-modal';
import { useAction } from '@/components/use-action';
import {
  fetchOrderPaymentSummary,
  getOrderPayments,
  quotePaymentOf,
  useTick,
  waiveBaseFee,
} from '@/lib/data/store';
import { fmtDateTime } from '@/lib/dates';
import { useAuth } from '@/lib/auth';
import {
  BASE_STATUS,
  CASH_STATUS,
  CLIENT_RESPONSE_LABEL,
  OUTCOME_LABEL,
  buildPaymentSummary,
  canWaiveBase,
  cashDiff,
  reviewReason,
  type PayOrder,
  type PaymentSummary,
} from '@/lib/payments';
import { money } from './shared';

const when = (iso: string | null) =>
  iso ? fmtDateTime(iso, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

function Line({
  label,
  value,
  strong,
  tone,
}: {
  label: string;
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
  const s = rpc && rpc.orderId === order.id ? rpc : buildPaymentSummary(order, getOrderPayments(order.id));
  const b = s.base;
  const q = s.quote;
  const quotePay = quotePaymentOf(order.id);
  const canResolve = can('soporte') || can('finanzas');
  const diff = cashDiff(q);
  const cash = q.cashStatus ? (CASH_STATUS[q.cashStatus] ?? { label: q.cashStatus, tone: 'neutral' as const }) : null;
  const base = b ? (BASE_STATUS[b.status] ?? { label: b.status, tone: 'neutral' as const }) : null;
  const commission = quotePay?.commission_cents ?? order.commission_cents ?? 0;

  return (
    <Card padded>
      <Kicker className="mb-3">Formas de pago</Kicker>

      {b && base && (
        <section aria-label="Tarifa base" className="mb-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-1.5 font-display text-[14px] font-bold text-navy">
              <CreditCard size={15} className="text-primary" aria-hidden /> Tarifa base · Tarjeta
            </h3>
            <Badge tone={base.tone}>{base.label}</Badge>
          </div>
          <dl className="flex flex-col gap-1.5 text-[13.5px]">
            <Line label="Tarifa de visita" value={money(b.feeCents, true)} />
            {b.surchargeCents > 0 && <Line label="Recargos" value={money(b.surchargeCents, true)} />}
            <Line label="Total base" value={money(b.totalCents, true)} strong />
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

      <section aria-label="Presupuesto" className={b ? 'border-t border-divider pt-4' : ''}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-1.5 font-display text-[14px] font-bold text-navy">
            <Banknote size={15} className="text-success" aria-hidden />
            {s.paymentModel === 'base_cash' ? 'Presupuesto · Efectivo' : 'Servicio'}
          </h3>
          {cash && <Badge tone={cash.tone}>{cash.label}</Badge>}
        </div>
        {q.totalCents > 0 || q.expectedCents != null ? (
          <dl className="flex flex-col gap-1.5 text-[13.5px]">
            <Line label="Total presupuesto" value={money(q.totalCents, true)} strong />
            {s.paymentModel !== 'base_cash' && (
              <Line label="Método" value={q.method === 'card' ? 'Tarjeta' : q.method === 'cash' ? 'Efectivo' : (q.method ?? '—')} />
            )}
            {s.paymentModel === 'base_cash' && (
              <>
                <Line label="Esperado" value={money(q.expectedCents, true)} />
                <Line label="Recibido (técnico)" value={money(q.receivedCents, true)} />
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
        ) : (
          <p className="text-[13px] text-muted">
            {s.paymentModel === 'base_cash'
              ? 'Sin presupuesto todavía. Se paga en efectivo al técnico al terminar.'
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

      {s.paymentModel === 'base_cash' && (
        <div className="mt-4 flex flex-col gap-1.5 border-t border-divider pt-3 text-[13.5px]">
          <dl className="flex flex-col gap-1.5">
            <Line label="Total del servicio" value={money(s.totalCents, true)} strong />
            {commission > 0 && (
              <Line
                label={`Comisión del efectivo ${((order.commission_bps ?? 1500) / 100).toFixed(0)}%`}
                value={`−${money(commission, true)}`}
              />
            )}
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
