'use client';

import { useState } from 'react';
import { Wrench } from 'lucide-react';
import { Button, Field, Input, Modal, Select } from '@/components/ds';
import { useAction } from '@/components/use-action';
import { getCategories, promoteCustomTool, saveCatalogTool, type ToolCatalogItem } from '@/lib/data/store';

const GENERAL = '__general';

/** Opciones de categoría: «General» (sin categoría) + categorías de servicio. */
function useCategoryOptions() {
  return [
    { value: GENERAL, label: 'General (todas las categorías)' },
    ...getCategories().map(c => ({ value: c.id, label: c.name })),
  ];
}

/** Alta/edición de un ítem del catálogo, o conversión de un texto libre (`promote`). */
export function ToolModal({
  onClose,
  tool,
  promote,
}: {
  onClose: () => void;
  tool?: ToolCatalogItem | null;
  /** Texto libre a convertir: nombre original y categoría sugerida. */
  promote?: { customName: string; categoryId: string | null };
}) {
  const [name, setName] = useState(tool?.name ?? promote?.customName ?? '');
  const [cat, setCat] = useState<string>(tool?.category_id ?? promote?.categoryId ?? GENERAL);
  const { busy, run } = useAction();
  const options = useCategoryOptions();
  const category_id = cat === GENERAL ? null : cat;

  async function save() {
    const ok = await run(
      'save',
      () =>
        promote
          ? promoteCustomTool(promote.customName, name, category_id)
          : saveCatalogTool({ name, category_id }, tool?.id),
      promote ? 'Convertida en catálogo' : tool ? 'Herramienta actualizada' : 'Herramienta creada',
    );
    if (ok) onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      dismissible={!busy}
      title={promote ? 'Convertir en catálogo' : tool ? 'Editar herramienta' : 'Nueva herramienta'}
      description={
        promote
          ? 'Se re-vincula a todos los técnicos que la escribieron con ese texto. Si ya existe en el catálogo, se reutiliza.'
          : 'Los técnicos la eligen desde la app, agrupada por categoría de servicio.'
      }
      icon={Wrench}
      width={460}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={!!busy}>
            Cancelar
          </Button>
          <Button onClick={() => void save()} loading={!!busy} disabled={!name.trim()}>
            {promote ? 'Convertir' : 'Guardar'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label={promote ? 'Nombre final' : 'Nombre'}
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <Field label="Categoría de servicio">
          <Select options={options} value={cat} onChange={setCat} aria-label="Categoría de servicio" />
        </Field>
      </div>
    </Modal>
  );
}
