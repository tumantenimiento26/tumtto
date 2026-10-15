'use client';
import { useMemo, useState } from 'react';
import { Check, Undo2 } from 'lucide-react';
import { Button, Checkbox, DatePicker, Field, Input, Modal, Select, Textarea } from '@/components/ds';
import { useAction } from '@/components/use-action';
import {
  recordCashDelivery,
  recordTechnicianPayout,
  voidSettlement,
} from '@/lib/data/settlementsStore';
import {
  DELIVERY_METHODS,
  PAYOUT_METHODS,
  firstName,
  folioLabel,
  money,
  type HistoryItem,
  type PendingCash,
  type PendingCommission,
} from '@/lib/settlements';

type Row = { id: string; folio: number; cents: number; detail: string };

/**
 * Modal de «Registrar pago» (comisiones) o «Registrar efectivo recibido»:
 * elige qué servicios cubre (todos por defecto), método, referencia, nota y fecha.
 */
export function RecordDialog({
  kind,
  techId,
  techName,
  commissions,
  cash,
  onClose,
  onDone,
}: {
  kind: 'payout' | 'cash';
  techId: string;
  techName: string;
  commissions: PendingCommission[];
  cash: PendingCash[];
  onClose: () => void;
  onDone: () => void;
}) {
  const isPayout = kind === 'payout';
  const rows: Row[] = useMemo(
    () =>
      isPayout
        ? commissions.map(c => ({ id: c.order_id, folio: c.folio, cents: c.commission_cents, detail: 'Comisión' }))
        : cash.map(c => ({ id: c.payment_id, folio: c.folio, cents: c.amount_cents, detail: 'Efectivo cobrado' })),
    [isPayout, commissions, cash],
  );
  const [picked, setPicked] = useState<Set<string>>(() => new Set(rows.map(r => r.id)));
  const [method, setMethod] = useState<string>(isPayout ? 'transferencia' : 'deposito');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState<Date>(() => new Date());
  const { busy, run } = useAction();
  const total = rows.reduce((s, r) => (picked.has(r.id) ? s + r.cents : s), 0);
  const all = picked.size === rows.length;
  const name = firstName(techName);

  const toggle = (id: string, on: boolean) =>
    setPicked(prev => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const submit = async () => {
    const f = { ids: [...picked], method, reference, note, at: date.toISOString() };
    const ok = await run(
      'record',
      () => (isPayout ? recordTechnicianPayout(techId, f) : recordCashDelivery(techId, f)),
      isPayout ? `Pago de ${money(total)} registrado` : `Efectivo de ${money(total)} registrado`,
    );
    if (ok) {
      onDone();
      onClose();
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      dismissible={!busy}
      width={560}
      icon={Check}
      tone="success"
      title={isPayout ? `Registrar pago a ${name}` : `Registrar efectivo recibido de ${name}`}
      description={
        isPayout
          ? 'Marca que ya le pagaste estas comisiones. Esto solo deja constancia: no mueve dinero.'
          : 'Marca que ya recibiste este efectivo (depósito o en mano). Esto solo deja constancia.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={!!busy}>
            Cancelar
          </Button>
          <Button
            variant="approve"
            icon={Check}
            onClick={submit}
            loading={busy === 'record'}
            disabled={picked.size === 0 || !!busy}
          >
            {isPayout ? `Marcar como pagado · ${money(total)}` : `Marcar como recibido · ${money(total)}`}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[12.5px] font-semibold text-navy">Servicios que cubre</span>
            <Checkbox
              checked={all}
              indeterminate={!all && picked.size > 0}
              onChange={on => setPicked(on ? new Set(rows.map(r => r.id)) : new Set())}
              label="Todos"
            />
          </div>
          <div className="max-h-[210px] overflow-y-auto rounded-btn border border-line">
            {rows.map(r => (
              <div key={r.id} className="flex items-center justify-between gap-3 border-t border-divider px-3 py-2 first:border-t-0">
                <Checkbox
                  checked={picked.has(r.id)}
                  onChange={on => toggle(r.id, on)}
                  label={
                    <span className="font-mono text-[12.5px] font-semibold text-primary">{folioLabel(r.folio)}</span>
                  }
                />
                <span className="font-mono text-[13px] font-semibold text-navy tabular">{money(r.cents)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Método">
            <Select
              options={isPayout ? PAYOUT_METHODS : DELIVERY_METHODS}
              value={method}
              onChange={setMethod}
              aria-label="Método"
            />
          </Field>
          <Field label="Fecha">
            <DatePicker value={date} onChange={setDate} disablePast={false} aria-label="Fecha" />
          </Field>
        </div>
        <Input label="Referencia (opcional)" placeholder="Folio SPEI, ficha de depósito…" value={reference} onChange={e => setReference(e.target.value)} />
        <Field label="Nota (opcional)">
          <Textarea value={note} onChange={e => setNote(e.target.value)} className="min-h-[64px]" />
        </Field>
      </div>
    </Modal>
  );
}

/** Anular el último registro (dentro de 24 h), con motivo. */
export function VoidDialog({
  item,
  onClose,
  onDone,
}: {
  item: HistoryItem;
  onClose: () => void;
  onDone: () => void;
}) {
  const [reason, setReason] = useState('');
  const { busy, run } = useAction();
  const what = item.kind === 'payout' ? 'pago' : 'registro de efectivo';
  return (
    <Modal
      open
      onClose={onClose}
      dismissible={!busy}
      icon={Undo2}
      tone="warning"
      title={`Anular ${what} de ${money(item.amount_cents)}`}
      description="Los servicios vuelven a quedar pendientes. Solo se puede anular el último registro, dentro de las primeras 24 horas."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={!!busy}>
            Volver
          </Button>
          <Button
            variant="destructive"
            icon={Undo2}
            loading={busy === 'void'}
            disabled={!!busy || reason.trim().length < 3}
            onClick={async () => {
              const ok = await run('void', () => voidSettlement(item.kind, item.id, reason), 'Registro anulado');
              if (ok) {
                onDone();
                onClose();
              }
            }}
          >
            Anular
          </Button>
        </>
      }
    >
      <Field label="Motivo" required>
        <Textarea value={reason} onChange={e => setReason(e.target.value)} className="min-h-[72px]" placeholder="Ej. Me equivoqué de técnico" />
      </Field>
    </Modal>
  );
}
