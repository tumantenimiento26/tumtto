'use client';

import { useEffect, useState } from 'react';
import { Banknote } from 'lucide-react';
import { Button, Input, Modal, Textarea } from '@/components/ds';
import { useAction } from '@/components/use-action';
import { getOrderPayments, getRequest, resolveCashReview } from '@/lib/data/store';
import { orderCode } from '@/lib/orderCode';
import { OUTCOMES, buildPaymentSummary, reviewReason, validateResolution, type ReviewOutcome } from '@/lib/payments';

const money = (c: number | null | undefined) =>
  c == null ? '—' : (c / 100).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

/**
 * Resolver una revisión de efectivo (admin_resolve_cash_review). Muestra lo
 * esperado vs. lo que reportó el técnico y el cliente; la nota es obligatoria
 * (queda en la bitácora y se avisa a ambas partes).
 */
export function CashReviewModal({
  orderId,
  open,
  onClose,
}: {
  orderId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { busy, run } = useAction();
  const [outcome, setOutcome] = useState<ReviewOutcome | null>(null);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setOutcome(null);
      setAmount('');
      setNotes('');
      setTouched(false);
    }
  }, [open, orderId]);

  const order = orderId ? getRequest(orderId) : null;
  const q = order ? buildPaymentSummary(order, getOrderPayments(order.id)).quote : null;
  const pesos = Number(amount.replace(/[^\d.]/g, ''));
  const cents = amount && Number.isFinite(pesos) ? Math.round(pesos * 100) : null;
  const problem = validateResolution({ outcome, notes, amountCents: cents });

  async function submit() {
    setTouched(true);
    if (problem || !orderId || !outcome) return;
    const ok = await run(
      'resolve',
      () => resolveCashReview(orderId, outcome, notes, cents),
      'Revisión resuelta · se avisó al cliente y al técnico',
    );
    if (ok) onClose();
  }

  return (
    <Modal
      open={open && !!order && !!q}
      onClose={onClose}
      dismissible={busy === null}
      width={520}
      icon={Banknote}
      tone="warning"
      title="Resolver revisión de efectivo"
      description={
        order && q
          ? `${orderCode(order.id)} · ${reviewReason(q.reviewReason)}`
          : undefined
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy !== null}>
            Cancelar
          </Button>
          <Button loading={busy === 'resolve'} onClick={() => void submit()}>
            Resolver
          </Button>
        </>
      }
    >
      {q && (
        <div className="flex flex-col gap-4">
          <dl className="grid grid-cols-3 gap-2 text-center">
            {[
              ['Presupuesto', q.expectedCents],
              ['Reportó el técnico', q.receivedCents],
              ['Reportó el cliente', q.clientReportedCents],
            ].map(([label, v]) => (
              <div key={label as string} className="min-w-0 rounded-btn bg-panel px-2 py-2.5">
                <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{label}</dt>
                <dd className="mt-1 font-display text-[15px] font-extrabold text-navy tabular">
                  {money(v as number | null)}
                </dd>
              </div>
            ))}
          </dl>

          <div role="radiogroup" aria-label="Resultado" className="flex flex-col gap-2">
            {OUTCOMES.map(o => {
              const on = outcome === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setOutcome(o.value)}
                  className={`rounded-btn border px-3.5 py-2.5 text-left transition-colors ${
                    on ? 'border-primary bg-info-soft' : 'border-line hover:bg-panel'
                  }`}
                >
                  <span className="block font-sans text-[13.5px] font-semibold text-navy">{o.label}</span>
                  <span className="block font-sans text-[12.5px] text-muted">{o.hint}</span>
                </button>
              );
            })}
          </div>

          {outcome === 'adjust_amount' && (
            <Input
              label="Monto realmente cobrado"
              prefix="$"
              inputMode="decimal"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              hint={`Presupuesto ${money(q.expectedCents)}`}
              error={touched && !(cents != null && cents > 0) ? 'Indica un monto mayor a cero' : null}
            />
          )}

          <Textarea
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Nota de resolución (obligatoria; queda en la bitácora y se envía a ambas partes)"
            aria-label="Nota de resolución"
          />
          {touched && problem && <p className="-mt-2 font-sans text-[12.5px] text-error">{problem}</p>}
        </div>
      )}
    </Modal>
  );
}
