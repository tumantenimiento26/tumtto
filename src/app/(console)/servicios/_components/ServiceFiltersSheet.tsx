'use client';

import { useEffect, useState } from 'react';
import { Button, Chip, Input, Segmented, Sheet, Toggle } from '@/components/ds';
import type { ServiceFilters } from '@/lib/serviciosFilter';
import { FormSection } from './ServiceFormSheet';
import { METHOD_LABEL, ZONES } from './shared';

type SheetValues = Pick<
  ServiceFilters,
  'zones' | 'method' | 'minPesos' | 'maxPesos' | 'urgentOnly' | 'disputeOnly'
>;

const METHODS = ['todos', 'card', 'cash'] as const;

/**
 * Sheet de filtros (400px): zona múltiple, método, monto, urgentes y
 * disputa. Trabaja sobre un borrador y aplica al confirmar.
 */
export function ServiceFiltersSheet({
  open,
  onClose,
  value,
  onApply,
  onClear,
  resultCount,
}: {
  open: boolean;
  onClose: () => void;
  value: SheetValues;
  onApply: (v: SheetValues) => void;
  onClear: () => void;
  /** Resultados con el borrador aplicado (para el botón "Mostrar N"). */
  resultCount: (draft: SheetValues) => number;
}) {
  const [d, setD] = useState<SheetValues>(value);
  useEffect(() => {
    if (open) setD(value);
  }, [open, value]);

  const toggleZone = (z: string) =>
    setD(s => ({
      ...s,
      zones: s.zones.includes(z)
        ? s.zones.filter(x => x !== z)
        : [...s.zones, z],
    }));
  const num = (t: string) => {
    const n = Number(t.replace(/[^\d]/g, ''));
    return t.trim() === '' || !Number.isFinite(n) ? null : n;
  };
  const badRange =
    d.minPesos != null && d.maxPesos != null && d.minPesos > d.maxPesos;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      width={400}
      kicker="Servicios"
      title="Filtros"
      footer={
        <div className="flex w-full gap-2.5">
          <Button variant="secondary" onClick={onClear}>
            Limpiar
          </Button>
          <Button
            full
            disabled={badRange}
            onClick={() => {
              onApply(d);
              onClose();
            }}
          >
            Mostrar {resultCount(d)} servicios
          </Button>
        </div>
      }
    >
      <FormSection>Zona</FormSection>
      <div className="flex flex-wrap gap-2">
        {ZONES.map(z => (
          <Chip key={z} active={d.zones.includes(z)} onClick={() => toggleZone(z)}>
            {z}
          </Chip>
        ))}
      </div>

      <FormSection>Método de pago</FormSection>
      <Segmented
        options={METHODS.map(m => ({
          value: m,
          label: m === 'todos' ? 'Todos' : METHOD_LABEL[m],
        }))}
        value={d.method ?? 'todos'}
        onChange={m => setD(s => ({ ...s, method: m === 'todos' ? null : m }))}
      />

      <FormSection>Monto (MXN)</FormSection>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Mínimo"
          prefix="$"
          inputMode="numeric"
          value={d.minPesos ?? ''}
          onChange={e => setD(s => ({ ...s, minPesos: num(e.target.value) }))}
          placeholder="0"
        />
        <Input
          label="Máximo"
          prefix="$"
          inputMode="numeric"
          value={d.maxPesos ?? ''}
          onChange={e => setD(s => ({ ...s, maxPesos: num(e.target.value) }))}
          placeholder="Sin límite"
          error={badRange ? 'Debe ser mayor que el mínimo.' : null}
        />
      </div>

      <FormSection>Más</FormSection>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[14px] text-navy">Solo urgentes</span>
          <Toggle
            checked={d.urgentOnly}
            onChange={x => setD(s => ({ ...s, urgentOnly: x }))}
            aria-label="Solo urgentes"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[14px] text-navy">Solo con disputa</span>
          <Toggle
            checked={d.disputeOnly}
            onChange={x => setD(s => ({ ...s, disputeOnly: x }))}
            aria-label="Solo con disputa"
          />
        </div>
      </div>
    </Sheet>
  );
}
