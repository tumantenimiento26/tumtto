'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Landmark,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  IconButton,
  Input,
  Modal,
  Sheet,
  Toggle,
  toast,
} from '@/components/ds';
import { useAuth } from '@/lib/auth';
import {
  deleteDepositAccount,
  fetchDepositAccounts,
  reorderDepositAccounts,
  saveDepositAccount,
  setDepositAccountActive,
} from '@/lib/data/store';
import {
  EMPTY_DEPOSIT_FORM,
  ALIAS_MAX,
  depositFormDirty,
  depositFormOf,
  depositTitle,
  groupDigits,
  hasActiveDeposit,
  movedIds,
  validateDepositForm,
  type DepositAccount,
  type DepositForm,
} from '@/lib/transfers';

/**
 * Configuración › «Cuentas para transferencias» (TUM-02/03): las cuentas
 * bancarias que el cliente ve al pagar la visita por transferencia (todas las
 * activas). Lista con activar/desactivar, orden, edición y baja; todo por RPC
 * de finanzas (queda en la bitácora). Sin cuentas activas la app solo ofrece tarjeta.
 */
export function TransferAccountSection() {
  const canEdit = useAuth().can('finanzas');
  // undefined = cargando · null = no disponible en este entorno
  const [accts, setAccts] = useState<DepositAccount[] | null | undefined>(
    undefined,
  );
  const [editing, setEditing] = useState<DepositAccount | 'new' | null>(null);
  const [deleting, setDeleting] = useState<DepositAccount | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    void fetchDepositAccounts().then(a => live && setAccts(a));
    return () => {
      live = false;
    };
  }, []);

  /** Corre una mutación; si devuelve la lista nueva, la pinta. */
  async function run(
    key: string,
    fn: () => Promise<DepositAccount[] | null>,
    ok?: string,
  ) {
    setBusy(key);
    const next = await fn();
    setBusy(null);
    if (!next) return false;
    setAccts(next);
    if (ok) toast.success(ok);
    return true;
  }

  const list = accts ?? [];
  const noneActive = !!accts && !hasActiveDeposit(accts);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-divider px-5 py-4">
        <span className="flex items-center gap-2 font-display text-[16px] font-bold text-navy">
          <Landmark size={17} className="text-primary" aria-hidden /> Cuentas
          para transferencias
        </span>
        <div className="flex items-center gap-3">
          {accts && (
            <Badge tone={noneActive || !accts.length ? 'warning' : 'success'}>
              {noneActive || !accts.length
                ? 'Sin cuentas activas'
                : `${accts.filter(a => a.is_active).length} activa${accts.filter(a => a.is_active).length === 1 ? '' : 's'}`}
            </Badge>
          )}
          {canEdit && accts && (
            <Button size="sm" icon={Plus} onClick={() => setEditing('new')}>
              Agregar cuenta
            </Button>
          )}
        </div>
      </div>
      {accts === undefined ? (
        <p className="px-5 py-4 font-sans text-[13px] text-muted">
          Cargando cuentas…
        </p>
      ) : accts === null ? (
        <p className="px-5 py-4 font-sans text-[13px] text-muted">
          Las cuentas para transferencias aún no están disponibles en este
          entorno (falta aplicar la migración de cuentas de depósito).
        </p>
      ) : (
        <div className="flex flex-col">
          <p className="px-5 pt-4 font-sans text-[12.5px] text-muted">
            El cliente ve todas las cuentas activas, en este orden, cuando elige
            pagar la visita por transferencia y sube su comprobante; tú lo
            cotejas en Revisión de pagos.
          </p>
          {noneActive && list.length > 0 && (
            <div
              role="alert"
              className="mx-5 mt-3 flex items-start gap-2 rounded-card border border-warning/40 bg-warning-soft px-3.5 py-3 font-sans text-[13px] text-warning-ink"
            >
              <AlertTriangle
                size={16}
                className="mt-0.5 flex-shrink-0"
                aria-hidden
              />
              <span>
                <b>Ninguna cuenta está activa:</b> los clientes no podrán pagar
                por transferencia (solo con tarjeta). Activa al menos una.
              </span>
            </div>
          )}
          {list.length === 0 ? (
            <EmptyState
              compact
              icon={Landmark}
              title="Aún no hay cuentas"
              description="Agrega una cuenta para habilitar el pago por transferencia. Mientras no haya cuentas activas, la app solo ofrece tarjeta."
              action={
                canEdit ? (
                  <Button icon={Plus} onClick={() => setEditing('new')}>
                    Agregar cuenta
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <ul className="mt-3 divide-y divide-divider border-t border-divider">
              {list.map((a, i) => (
                <li
                  key={a.id}
                  className={`flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4 ${a.is_active ? '' : 'opacity-70'}`}
                >
                  <div className="min-w-[220px] flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-[15px] font-bold text-navy">
                        {depositTitle(a)}
                      </span>
                      {a.alias?.trim() && (
                        <span className="font-sans text-[12.5px] text-muted">
                          {a.bank}
                        </span>
                      )}
                      {!a.is_active && <Badge tone="neutral">Inactiva</Badge>}
                    </div>
                    <p className="mt-1 font-mono text-[13px] text-navy">
                      CLABE {groupDigits(a.clabe)}
                    </p>
                    {a.card_number && (
                      <p className="font-mono text-[12.5px] text-muted">
                        Tarjeta {groupDigits(a.card_number)}
                      </p>
                    )}
                    <p className="font-sans text-[12.5px] text-muted">
                      Titular: {a.holder}
                    </p>
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-2">
                      <Toggle
                        checked={a.is_active}
                        disabled={busy !== null}
                        aria-label={`${a.is_active ? 'Desactivar' : 'Activar'} ${depositTitle(a)}`}
                        onChange={next =>
                          void run(a.id, () =>
                            setDepositAccountActive(a.id, next),
                          )
                        }
                      />
                      <IconButton
                        icon={ArrowUp}
                        label="Subir"
                        size={36}
                        className={
                          i === 0 || busy !== null
                            ? 'pointer-events-none opacity-40'
                            : ''
                        }
                        onClick={() => {
                          const ids = movedIds(
                            list.map(x => x.id),
                            a.id,
                            -1,
                          );
                          if (ids)
                            void run(a.id, () => reorderDepositAccounts(ids));
                        }}
                      />
                      <IconButton
                        icon={ArrowDown}
                        label="Bajar"
                        size={36}
                        className={
                          i === list.length - 1 || busy !== null
                            ? 'pointer-events-none opacity-40'
                            : ''
                        }
                        onClick={() => {
                          const ids = movedIds(
                            list.map(x => x.id),
                            a.id,
                            1,
                          );
                          if (ids)
                            void run(a.id, () => reorderDepositAccounts(ids));
                        }}
                      />
                      <IconButton
                        icon={Pencil}
                        label="Editar"
                        size={36}
                        onClick={() => setEditing(a)}
                      />
                      <IconButton
                        icon={Trash2}
                        label="Eliminar"
                        size={36}
                        onClick={() => setDeleting(a)}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          {!canEdit && (
            <p className="px-5 py-3 font-sans text-[12px] text-muted">
              Solo finanzas puede cambiar las cuentas.
            </p>
          )}
        </div>
      )}

      <DepositSheet
        key={editing === 'new' ? 'new' : (editing?.id ?? 'none')}
        account={editing}
        onClose={() => setEditing(null)}
        onSave={async (id, f) => {
          const ok = await run(
            'save',
            () => saveDepositAccount(id, f),
            id ? 'Cuenta actualizada' : 'Cuenta agregada',
          );
          if (ok) setEditing(null);
        }}
        saving={busy === 'save'}
      />

      <Modal
        open={!!deleting}
        onClose={() => busy !== 'delete' && setDeleting(null)}
        dismissible={busy !== 'delete'}
        tone="danger"
        icon={Trash2}
        title="¿Eliminar esta cuenta?"
        description={
          deleting
            ? `${depositTitle(deleting)} · CLABE ${groupDigits(deleting.clabe)}. Los clientes dejarán de verla; el historial de pagos no se modifica.`
            : undefined
        }
        footer={
          <>
            <Button
              variant="secondary"
              disabled={busy === 'delete'}
              onClick={() => setDeleting(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              loading={busy === 'delete'}
              onClick={async () => {
                if (!deleting) return;
                if (
                  await run(
                    'delete',
                    () => deleteDepositAccount(deleting.id),
                    'Cuenta eliminada',
                  )
                )
                  setDeleting(null);
              }}
            >
              Eliminar
            </Button>
          </>
        }
      />
    </Card>
  );
}

function DepositSheet({
  account,
  onClose,
  onSave,
  saving,
}: {
  account: DepositAccount | 'new' | null;
  onClose: () => void;
  onSave: (id: string | null, f: DepositForm) => Promise<void>;
  saving: boolean;
}) {
  const existing = account && account !== 'new' ? account : null;
  const [form, setForm] = useState<DepositForm>(
    existing ? depositFormOf(existing) : EMPTY_DEPOSIT_FORM,
  );
  const [touched, setTouched] = useState(false);
  const errs = validateDepositForm(form);
  const set =
    (k: keyof DepositForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));
  const err = (k: keyof DepositForm) =>
    touched || (form[k] && k !== 'bank' && k !== 'holder')
      ? (errs[k] ?? null)
      : null;

  async function submit() {
    setTouched(true);
    if (Object.keys(errs).length) return;
    await onSave(existing?.id ?? null, form);
  }

  return (
    <Sheet
      open={!!account}
      onClose={() => !saving && onClose()}
      kicker="Transferencias"
      title={existing ? 'Editar cuenta' : 'Agregar cuenta'}
      footer={
        <>
          <Button variant="secondary" disabled={saving} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            loading={saving}
            disabled={!!existing && !depositFormDirty(form, existing)}
            onClick={() => void submit()}
          >
            {existing ? 'Guardar cambios' : 'Agregar cuenta'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Alias (opcional)"
          value={form.alias}
          onChange={set('alias')}
          maxLength={ALIAS_MAX}
          placeholder="Ej. Principal"
          error={err('alias')}
          hint="Se muestra como título de la cuenta."
        />
        <Input
          label="Banco"
          value={form.bank}
          onChange={set('bank')}
          maxLength={80}
          error={err('bank')}
        />
        <Input
          label="Titular"
          value={form.holder}
          onChange={set('holder')}
          maxLength={120}
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
          error={err('card')}
          hint="Para depósitos en OXXO o ventanilla."
        />
        {!existing && (
          <p className="font-sans text-[12px] text-muted">
            La cuenta nueva queda activa y al final de la lista.
          </p>
        )}
      </div>
    </Sheet>
  );
}
