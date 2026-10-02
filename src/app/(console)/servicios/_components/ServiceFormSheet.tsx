'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  DatePicker,
  Field,
  Kicker,
  Select,
  Sheet,
  Textarea,
  Toggle,
  Input,
  toast,
} from '@/components/ds';
import {
  createRequest,
  getAddresses,
  getCategories,
  getClients,
  getProfile,
  getTechniciansWithProfile,
  updateOrder,
} from '@/lib/data/store';
import type { ServiceRequest } from '@/lib/demo/world';
import { orderCode } from '@/lib/orderCode';
import { formatPhone } from '@/lib/phone';

const SLOTS = [
  '08:00 – 10:00',
  '10:00 – 12:00',
  '12:00 – 14:00',
  '14:00 – 16:00',
  '16:00 – 18:00',
  '18:00 – 20:00',
];

/** "10:00 – 12:00" + fecha → [inicio, fin] ISO en hora de la ZMG (sin horario de verano). */
function slotRange(date: Date | null, slot: string | null): [string | null, string | null] {
  if (!date || !slot) return [null, null];
  const hs = [...slot.matchAll(/(\d{1,2}):(\d{2})/g)];
  if (hs.length < 2) return [null, null];
  const ymd = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const at = (m: RegExpMatchArray) => `${ymd}T${m[1].padStart(2, '0')}:${m[2]}:00-06:00`;
  return [new Date(at(hs[0])).toISOString(), new Date(at(hs[1])).toISOString()];
}

type Values = {
  clientId: string | null;
  categoryId: string | null;
  techId: string; // '' = asignar después
  addressId: string | null;
  date: Date | null;
  slot: string | null;
  urgent: boolean;
  title: string;
  description: string;
};

export function FormSection({ children }: { children: string }) {
  return (
    <Kicker tone="primary" className="mb-3 mt-6 first:mt-0">
      {children}
    </Kicker>
  );
}

/**
 * Formulario lateral de servicio: crear (soporte telefónico) o editar.
 * Crear escribe con createRequest (admin) y, si se eligió técnico, reasigna
 * con admin_reassign_order. Editar solo toca título/descripción/urgencia/
 * categoría (cliente y técnico no se cambian aquí: técnico = Reasignar).
 */
export function ServiceFormSheet({
  open,
  onClose,
  order,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  order?: ServiceRequest | null;
  onCreated?: (id: string) => void;
}) {
  const editing = !!order;
  const initial = (): Values => ({
    clientId: order?.client_id ?? null,
    categoryId: order?.category_id ?? null,
    techId: '',
    addressId: order?.client_address_id ?? null,
    date: null,
    slot: null,
    urgent: order?.is_urgent ?? false,
    title: order?.title ?? '',
    description: order?.description ?? '',
  });
  const [v, setV] = useState<Values>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>(
    {},
  );
  const [shake, setShake] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setV(initial());
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, order?.id]);

  const set = <K extends keyof Values>(k: K, val: Values[K]) => {
    setV(s => ({ ...s, [k]: val }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }));
  };

  const clientOpts = useMemo(
    () =>
      getClients()
        .filter(c => c.status !== 'suspended')
        .map(c => ({
          value: c.id,
          label: c.full_name ?? 'Cliente',
          hint: formatPhone(c.phone) || undefined,
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open],
  );
  const catOpts = useMemo(
    () =>
      getCategories()
        .filter(c => c.is_active !== false)
        .map(c => ({ value: c.id, label: c.name })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open],
  );
  const techOpts = useMemo(
    () => [
      {
        value: '',
        label: 'Asignar después',
        hint: 'Se notifica a técnicos cercanos',
      },
      ...getTechniciansWithProfile()
        .filter(
          ({ tech, profile }) =>
            tech.kyc_status === 'approved' && profile?.status !== 'suspended',
        )
        .map(({ tech, profile }) => ({
          value: tech.id,
          label: profile?.full_name ?? 'Técnico',
          hint: `${tech.rating_avg > 0 ? `${tech.rating_avg.toFixed(1)} ★ · ` : ''}${tech.is_available ? 'Disponible' : 'No disponible'}`,
        })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open],
  );
  const addrOpts = v.clientId
    ? getAddresses(v.clientId).map(a => ({
        value: a.id,
        label: a.label ?? 'Dirección',
        hint: [a.address_line, a.municipality].filter(Boolean).join(' · '),
      }))
    : [];

  function validate() {
    const e: Partial<Record<keyof Values, string>> = {};
    if (!v.clientId) e.clientId = 'Elige el cliente.';
    if (!v.categoryId) e.categoryId = 'Elige la categoría.';
    if (!editing && v.clientId && addrOpts.length && !v.addressId)
      e.addressId = 'Elige la dirección del servicio.';
    if (v.description.trim().length < 5)
      e.description = 'Describe el problema (mínimo 5 caracteres).';
    if (v.date && !v.slot) e.slot = 'Elige una franja para esa fecha.';
    setErrors(e);
    if (Object.keys(e).length) setShake(n => n + 1);
    return !Object.keys(e).length;
  }

  async function submit() {
    if (!validate() || saving) return;
    setSaving(true);
    try {
      if (editing && order) {
        const ok = await updateOrder(order.id, {
          title: v.title.trim() || null,
          description: v.description.trim(),
          is_urgent: v.urgent,
          category_id: v.categoryId!,
        });
        if (ok !== null) {
          toast.success('Servicio actualizado', orderCode(order.id));
          onClose();
        }
        return;
      }
      // Agenda: la franja viaja como scheduled_for/until (hora ZMG, UTC-6 fijo).
      const [from, until] = slotRange(v.date, v.slot);
      const created = await createRequest({
        client_id: v.clientId!,
        category_id: v.categoryId!,
        client_address_id: v.addressId,
        title: v.title.trim() || null,
        description: v.description.trim(),
        is_urgent: v.urgent,
        // Técnico elegido: la solicitud queda dirigida a él (requested_technician_id).
        technician_id: v.techId || null,
        scheduled_for: from,
        scheduled_until: until,
      });
      if (!created) return; // el store ya mostró el error
      toast.success(
        'Servicio creado',
        `${orderCode(created.id)} · ${getProfile(v.clientId!)?.full_name ?? ''}`,
      );
      onClose();
      onCreated?.(created.id);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet
      open={open}
      onClose={() => !saving && onClose()}
      width={480}
      kicker={editing ? 'Servicios' : 'Nuevo'}
      title={editing ? `Editar ${orderCode(order!.id)}` : 'Crear servicio'}
      footer={
        <div
          key={shake}
          className={`flex w-full gap-2.5 ${shake ? 'animate-shake' : ''}`}
        >
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button full loading={saving} onClick={() => void submit()}>
            {editing ? 'Guardar cambios' : 'Crear servicio'}
          </Button>
        </div>
      }
    >
      <p className="mb-5 text-[13px] text-muted">
        {editing
          ? 'Los cambios se registran en la bitácora del servicio.'
          : 'Para clientes que llaman a soporte. Se notifica a técnicos cercanos.'}
      </p>

      <FormSection>Cliente y servicio</FormSection>
      <div className="flex flex-col gap-4">
        <Field label="Cliente" required error={errors.clientId}>
          <Select
            aria-label="Cliente"
            options={clientOpts}
            value={v.clientId}
            placeholder="Buscar cliente"
            error={!!errors.clientId}
            disabled={editing}
            onChange={id => {
              set('clientId', id);
              set('addressId', null);
            }}
          />
        </Field>
        <Field label="Categoría" required error={errors.categoryId}>
          <Select
            aria-label="Categoría"
            options={catOpts}
            value={v.categoryId}
            placeholder="Elige categoría"
            error={!!errors.categoryId}
            onChange={id => set('categoryId', id)}
          />
        </Field>
        {!editing && (
          <>
            <Field label="Dirección" error={errors.addressId}>
              <Select
                aria-label="Dirección"
                options={addrOpts}
                value={v.addressId}
                disabled={!v.clientId || addrOpts.length === 0}
                placeholder={
                  !v.clientId
                    ? 'Primero elige el cliente'
                    : addrOpts.length
                      ? 'Elige dirección'
                      : 'El cliente no tiene direcciones guardadas'
                }
                error={!!errors.addressId}
                onChange={id => set('addressId', id)}
              />
            </Field>
            <Field
              label="Técnico"
              hint="Solo técnicos aprobados. Si no eliges, se ofrece a los cercanos."
            >
              <Select
                aria-label="Técnico"
                options={techOpts}
                value={v.techId}
                onChange={id => set('techId', id)}
              />
            </Field>
          </>
        )}
      </div>

      {!editing && (
        <>
          <FormSection>Agenda</FormSection>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Fecha de visita">
              <DatePicker
                aria-label="Fecha de visita"
                value={v.date}
                onChange={d => set('date', d)}
                placeholder="Lo antes posible"
              />
            </Field>
            <Field label="Franja horaria" error={errors.slot}>
              <Select
                aria-label="Franja horaria"
                options={SLOTS.map(s => ({ value: s, label: s }))}
                value={v.slot}
                placeholder="Elige franja"
                error={!!errors.slot}
                onChange={s => set('slot', s)}
              />
            </Field>
          </div>
        </>
      )}

      <FormSection>Detalle</FormSection>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-box border border-line bg-panel px-4 py-3">
          <div>
            <div className="font-display text-[14px] font-bold text-navy">
              Urgente
            </div>
            <div className="text-[12.5px] text-muted">
              Aplica recargo de 20% al cotizar
            </div>
          </div>
          <Toggle
            checked={v.urgent}
            onChange={x => set('urgent', x)}
            aria-label="Urgente"
          />
        </div>
        <Input
          label="Título (opcional)"
          value={v.title}
          onChange={e => set('title', e.target.value)}
          placeholder="Ej. Fuga en el baño"
          maxLength={80}
        />
        <Field label="Descripción del problema" required error={errors.description}>
          <Textarea
            rows={4}
            value={v.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Ej. Fuga debajo del lavabo del baño, gotea constante."
            error={!!errors.description}
          />
        </Field>
      </div>
    </Sheet>
  );
}
