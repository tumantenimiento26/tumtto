'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Chip, Input } from '@/components/ds';
import { getCategories, useExtras } from '@/lib/data/store';
import { groupByCategory } from '@/lib/tools';

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Multi-select de herramientas del catálogo (con buscador) para el drawer de Filtros: el técnico debe tener todas. */
export function ToolFilter({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const catalog = useExtras(s => s.toolCatalog);
  const missing = useExtras(s => s.unavailable.toolCatalog);
  const [q, setQ] = useState('');
  const groups = useMemo(() => {
    const needle = fold(q.trim());
    const items = catalog
      .filter(t => t.is_active || selected.includes(t.id))
      .filter(t => !needle || fold(t.name).includes(needle))
      .map(t => ({ id: t.id, name: t.name, categoryId: t.category_id }));
    return groupByCategory(items, getCategories());
  }, [catalog, q, selected]);

  if (missing || !catalog.length)
    return (
      <p className="font-sans text-[13px] text-muted">
        El catálogo de herramientas aún no está disponible en este entorno.
      </p>
    );

  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);

  return (
    <div className="flex flex-col gap-3">
      <Input
        icon={Search}
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Buscar herramienta"
        aria-label="Buscar herramienta"
      />
      <p className="font-sans text-[12px] text-muted">
        {selected.length
          ? `El técnico debe tener las ${selected.length} seleccionadas.`
          : 'Selecciona una o varias: el técnico debe tener todas.'}
      </p>
      <div className="flex max-h-72 flex-col gap-3 overflow-y-auto pr-1">
        {groups.length === 0 && (
          <p className="font-sans text-[13px] text-muted">Sin resultados.</p>
        )}
        {groups.map(g => (
          <div key={g.key}>
            <div className="mb-1.5 font-sans text-[12px] font-semibold text-muted">{g.label}</div>
            <div className="flex flex-wrap gap-2">
              {g.items.map(t => (
                <Chip key={t.id} active={selected.includes(t.id)} onClick={() => toggle(t.id)}>
                  {t.name}
                </Chip>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
