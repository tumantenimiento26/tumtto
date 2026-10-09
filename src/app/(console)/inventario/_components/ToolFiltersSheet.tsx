'use client';

import { useEffect, useState } from 'react';
import { Button, Chip, Select, Sheet } from '@/components/ds';
import { FormSection } from '../../servicios/_components/ServiceFormSheet';
import { GENERAL, STATUS_META, STATUS_ORDER, type InventoryFilters } from '@/lib/inventory';

type V = Pick<InventoryFilters, 'categoryId' | 'status' | 'techId'>;

/** Drawer de filtros del inventario: categoría, estado y técnico asignado. */
export function ToolFiltersSheet({
  open,
  onClose,
  value,
  onApply,
  onClear,
  resultCount,
  categories,
  technicians,
}: {
  open: boolean;
  onClose: () => void;
  value: V;
  onApply: (v: V) => void;
  onClear: () => void;
  resultCount: (d: V) => number;
  categories: { id: string; name: string }[];
  technicians: { id: string; name: string }[];
}) {
  const [d, setD] = useState<V>(value);
  useEffect(() => {
    if (open) setD(value);
  }, [open, value]);
  const ANY = '__any__';
  return (
    <Sheet
      open={open}
      onClose={onClose}
      width={400}
      kicker="Inventario"
      title="Filtros"
      footer={
        <div className="flex w-full gap-2.5">
          <Button variant="secondary" onClick={onClear}>
            Limpiar
          </Button>
          <Button
            full
            onClick={() => {
              onApply(d);
              onClose();
            }}
          >
            Mostrar {resultCount(d)} herramientas
          </Button>
        </div>
      }
    >
      <FormSection>Estado</FormSection>
      <div className="flex flex-wrap gap-2">
        <Chip active={!d.status} onClick={() => setD(s => ({ ...s, status: null }))}>
          Todos
        </Chip>
        {STATUS_ORDER.map(s => (
          <Chip key={s} active={d.status === s} onClick={() => setD(x => ({ ...x, status: x.status === s ? null : s }))}>
            {STATUS_META[s].label}
          </Chip>
        ))}
      </div>

      <FormSection>Categoría</FormSection>
      <div className="flex flex-wrap gap-2">
        <Chip active={!d.categoryId} onClick={() => setD(s => ({ ...s, categoryId: null }))}>
          Todas
        </Chip>
        <Chip active={d.categoryId === GENERAL} onClick={() => setD(s => ({ ...s, categoryId: s.categoryId === GENERAL ? null : GENERAL }))}>
          General
        </Chip>
        {categories.map(c => (
          <Chip key={c.id} active={d.categoryId === c.id} onClick={() => setD(s => ({ ...s, categoryId: s.categoryId === c.id ? null : c.id }))}>
            {c.name}
          </Chip>
        ))}
      </div>

      <FormSection>Técnico asignado</FormSection>
      <Select
        options={[{ value: ANY, label: 'Cualquiera' }, ...technicians.map(t => ({ value: t.id, label: t.name }))]}
        value={d.techId ?? ANY}
        onChange={v => setD(s => ({ ...s, techId: v === ANY ? null : v }))}
        aria-label="Técnico asignado"
      />
    </Sheet>
  );
}
