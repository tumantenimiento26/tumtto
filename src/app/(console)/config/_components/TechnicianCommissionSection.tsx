'use client';

import { useEffect, useState } from 'react';
import { HandCoins } from 'lucide-react';
import { Badge, Button, Card, Input, Segmented, toast } from '@/components/ds';
import { useAuth } from '@/lib/auth';
import { fetchTechnicianCommissionConfig, setTechnicianCommission } from '@/lib/data/store';
import { fmtDateTime } from '@/lib/dates';
import {
  COMMISSION_TYPE_OPTIONS,
  commissionRateLabel,
  commissionToInput,
  parseCommissionInput,
  type TechnicianCommissionConfig,
  type TechnicianCommissionType,
} from '@/lib/commission';

/**
 * Configuración › Comisiones › «Comisión del técnico» (TUM-01). Es un objeto
 * {type, value}: se lee con get_technician_commission_config y se guarda con
 * admin_set_technician_commission (no con upsert_platform_setting).
 */
export function TechnicianCommissionSection() {
  const canEdit = useAuth().can('finanzas');
  const [cfg, setCfg] = useState<TechnicianCommissionConfig | null | undefined>(undefined);
  const [type, setType] = useState<TechnicianCommissionType>('percent');
  const [raw, setRaw] = useState('');
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  // Una sola lectura al abrir: una recarga del snapshot no pisa lo que se está editando.
  useEffect(() => {
    let live = true;
    void fetchTechnicianCommissionConfig().then(c => {
      if (!live) return;
      setCfg(c);
      if (c) {
        setType(c.type);
        setRaw(commissionToInput(c));
      }
    });
    return () => {
      live = false;
    };
  }, []);

  const parsed = parseCommissionInput(type, raw);
  const dirty = !!cfg && parsed.value != null && (parsed.value !== cfg.value || type !== cfg.type);

  async function save() {
    setTouched(true);
    if (parsed.value == null) return;
    setSaving(true);
    const next = await setTechnicianCommission(type, parsed.value);
    setSaving(false);
    if (!next) return;
    setCfg(next);
    setTouched(false);
    toast.success('Comisión del técnico guardada', commissionRateLabel(next.type, next.value));
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-divider px-5 py-4">
        <span className="flex items-center gap-2 font-display text-[16px] font-bold text-navy">
          <HandCoins size={17} className="text-primary" aria-hidden /> Comisión del técnico
        </span>
        {cfg && <Badge tone="info">Vigente: {commissionRateLabel(cfg.type, cfg.value)}</Badge>}
      </div>
      {cfg === undefined ? (
        <p className="px-5 py-4 font-sans text-[13px] text-muted">Cargando comisión…</p>
      ) : cfg === null ? (
        <p className="px-5 py-4 font-sans text-[13px] text-muted">
          La comisión del técnico aún no está disponible en este entorno (falta aplicar la migración TUM-01).
        </p>
      ) : (
        <div className="flex flex-col gap-4 px-5 py-4">
          <p className="font-sans text-[12.5px] text-muted">
            En los servicios con dinero de Tu Mantenimiento, todo lo que paga el cliente (visita, recargos y
            cotización) es ingreso de Tu Mantenimiento y el técnico gana esta comisión por servicio. Se congela en cada
            servicio al terminarlo; los cambios aplican a los servicios que terminen después.
          </p>
          <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[auto_minmax(0,220px)_auto]">
            <Segmented
              aria-label="Tipo de comisión"
              options={COMMISSION_TYPE_OPTIONS}
              value={type}
              onChange={v => {
                if (!canEdit) return;
                setType(v);
                setTouched(false);
              }}
            />
            <Input
              type="number"
              min={0}
              max={type === 'percent' ? 100 : undefined}
              step="0.01"
              inputMode="decimal"
              prefix={type === 'fixed' ? '$' : undefined}
              suffix={type === 'percent' ? '%' : 'MXN'}
              value={raw}
              disabled={!canEdit}
              onChange={e => setRaw(e.target.value)}
              error={touched ? parsed.error : null}
              aria-label={type === 'fixed' ? 'Monto fijo por servicio' : 'Porcentaje de lo cobrado'}
            />
            <Button onClick={() => void save()} loading={saving} disabled={!canEdit || !dirty}>
              Guardar comisión
            </Button>
          </div>
          <p className="font-sans text-[12px] text-muted">
            {type === 'fixed'
              ? 'Monto fijo: el técnico gana lo mismo en cada servicio, sin importar cuánto se cobró (0 permitido).'
              : 'Porcentaje: sobre el total cobrado al cliente (visita + recargos + cotización), sin descontar Stripe.'}
            {cfg.updatedAt && ` Último cambio: ${fmtDateTime(cfg.updatedAt, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}.`}
          </p>
        </div>
      )}
    </Card>
  );
}
