'use client';

import { useEffect, useState } from 'react';
import { Landmark } from 'lucide-react';
import { Badge, Button, Card, Input, toast } from '@/components/ds';
import { useAuth } from '@/lib/auth';
import { fetchDepositAccount, setDepositAccount } from '@/lib/data/store';
import { fmtDateTime } from '@/lib/dates';
import {
  depositFormOf,
  digitsOnly,
  groupDigits,
  validateDepositForm,
  type DepositAccount,
  type DepositForm,
} from '@/lib/transfers';

/**
 * Configuración › «Cuenta para transferencias» (TUM-02/03): la cuenta que el
 * cliente ve al pagar la visita por transferencia. Se lee con
 * get_transfer_deposit_account y se guarda con admin_set_transfer_deposit_account
 * (solo finanzas; queda en la bitácora). Sin cuenta, la app no ofrece transferencia.
 */
export function TransferAccountSection() {
  const canEdit = useAuth().can('finanzas');
  const [acc, setAcc] = useState<DepositAccount | null | undefined>(undefined);
  const [form, setForm] = useState<DepositForm>({ bank: '', clabe: '', card: '', holder: '' });
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  // Una sola lectura al abrir: una recarga del snapshot no pisa lo que se está editando.
  useEffect(() => {
    let live = true;
    void fetchDepositAccount().then(a => {
      if (!live) return;
      setAcc(a);
      if (a) setForm(depositFormOf(a));
    });
    return () => {
      live = false;
    };
  }, []);

  const errs = validateDepositForm(form);
  const valid = Object.keys(errs).length === 0;
  const base = acc ? depositFormOf(acc) : null;
  const dirty =
    !!base &&
    (form.bank.trim() !== base.bank ||
      digitsOnly(form.clabe) !== base.clabe ||
      digitsOnly(form.card) !== base.card ||
      form.holder.trim() !== base.holder);
  const set = (k: keyof DepositForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));
  const err = (k: keyof DepositForm) => (touched || (form[k] && k !== 'bank' && k !== 'holder') ? (errs[k] ?? null) : null);

  async function save() {
    setTouched(true);
    if (!valid) return;
    setSaving(true);
    const next = await setDepositAccount(form);
    setSaving(false);
    if (!next) return;
    setAcc(next);
    setForm(depositFormOf(next));
    setTouched(false);
    toast.success('Cuenta para transferencias guardada', 'Los clientes verán estos datos al pagar la visita.');
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-divider px-5 py-4">
        <span className="flex items-center gap-2 font-display text-[16px] font-bold text-navy">
          <Landmark size={17} className="text-primary" aria-hidden /> Cuenta para transferencias
        </span>
        {acc && (
          <Badge tone={acc.configured ? 'success' : 'warning'}>
            {acc.configured ? 'Transferencia disponible' : 'Sin configurar'}
          </Badge>
        )}
      </div>
      {acc === undefined ? (
        <p className="px-5 py-4 font-sans text-[13px] text-muted">Cargando cuenta…</p>
      ) : acc === null ? (
        <p className="px-5 py-4 font-sans text-[13px] text-muted">
          La cuenta para transferencias aún no está disponible en este entorno (falta aplicar la migración TUM-02).
        </p>
      ) : (
        <div className="flex flex-col gap-4 px-5 py-4">
          <p className="font-sans text-[12.5px] text-muted">
            El cliente ve estos datos cuando elige pagar la visita por transferencia y sube su comprobante; tú lo cotejas
            en Revisión de pagos. Mientras no haya cuenta, la app solo ofrece tarjeta.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Banco" value={form.bank} onChange={set('bank')} maxLength={80} disabled={!canEdit} error={err('bank')} />
            <Input
              label="Titular"
              value={form.holder}
              onChange={set('holder')}
              maxLength={120}
              disabled={!canEdit}
              error={err('holder')}
            />
            <Input
              label="CLABE"
              value={form.clabe}
              onChange={set('clabe')}
              inputMode="numeric"
              maxLength={24}
              placeholder="18 dígitos"
              className="font-mono"
              disabled={!canEdit}
              error={err('clabe')}
              hint="Se valida el dígito verificador."
            />
            <Input
              label="Número de tarjeta (opcional)"
              value={form.card}
              onChange={set('card')}
              inputMode="numeric"
              maxLength={22}
              placeholder="16 dígitos"
              className="font-mono"
              disabled={!canEdit}
              error={err('card')}
              hint="Para depósitos en OXXO o ventanilla."
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-sans text-[12px] text-muted">
              {acc.configured
                ? `Vigente: ${acc.bank} · CLABE ${groupDigits(acc.clabe)}`
                : 'Aún no hay cuenta: captura los datos para habilitar el pago por transferencia.'}
              {acc.updated_at &&
                ` · Último cambio: ${fmtDateTime(acc.updated_at, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`}
            </p>
            <Button onClick={() => void save()} loading={saving} disabled={!canEdit || (!dirty && acc.configured)}>
              Guardar cuenta
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
