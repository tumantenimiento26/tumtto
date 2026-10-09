'use client';

import { useEffect, useState } from 'react';
import { Download, Pencil, Plus, Wrench } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Toggle } from '@/components/ds';
import { useAuth } from '@/lib/auth';
import {
  countToolTechs,
  fetchCustomTools,
  getCategories,
  loadExtras,
  setCatalogToolActive,
  useExtras,
  useTick,
  type ToolCatalogItem,
} from '@/lib/data/store';
import { groupByCategory, type CustomToolSummary } from '@/lib/tools';
import { ToolModal } from './ToolModal';
import { ImportButton } from '@/components/import-dialog';
import { exportCsv } from '@/components/admin';

type ModalState =
  | { kind: 'edit'; tool: ToolCatalogItem | null }
  | { kind: 'promote'; customName: string; categoryId: string | null }
  | null;

/** Catálogo «Herramientas» (por categoría de servicio) + «Por revisar (texto libre)». Uso interno. */
export function ToolCatalogSection() {
  useTick();
  const catalog = useExtras(s => s.toolCatalog);
  const techTools = useExtras(s => s.techTools);
  const unavailable = useExtras(s => s.unavailable.toolCatalog || s.unavailable.techTools);
  const canEdit = useAuth().can('usuarios');
  const [modal, setModal] = useState<ModalState>(null);
  const [review, setReview] = useState<CustomToolSummary[] | null | undefined>(undefined);
  useEffect(() => {
    void loadExtras();
  }, []);
  // La revisión se recalcula al cambiar lo que tienen los técnicos (p. ej. tras convertir).
  useEffect(() => {
    let live = true;
    if (!unavailable) void fetchCustomTools().then(r => live && setReview(r));
    return () => {
      live = false;
    };
  }, [techTools, unavailable]);

  const cats = getCategories();
  const groups = groupByCategory(
    [...catalog]
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, 'es'))
      .map(t => ({ ...t, categoryId: t.category_id })),
    cats,
  );
  const catName = (id: string) => cats.find(c => c.id === id)?.name ?? null;
  const lock = canEdit ? undefined : 'Tu rol no administra herramientas';

  return (
    <div className="flex flex-col gap-5">
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-divider px-5 py-4">
          <div className="min-w-0">
            <div className="font-display text-[16px] font-bold text-navy">Catálogo de herramientas</div>
            <div className="font-sans text-[12px] text-muted">
              Por categoría de servicio. Uso interno.
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              icon={Download}
              disabled={unavailable}
              onClick={() =>
                exportCsv(
                  'catalogo-herramientas.csv',
                  catalog.map(t => ({
                    Herramienta: t.name,
                    Categoría: (t.category_id && catName(t.category_id)) || '',
                    Activa: t.is_active ? 'Sí' : 'No',
                    Técnicos: countToolTechs(t.id),
                  })),
                )
              }
            >
              Exportar
            </Button>
            {!unavailable && <ImportButton entity="herramientas" />}
            <Button
              icon={Plus}
              disabled={!canEdit || unavailable}
              title={lock}
              onClick={() => setModal({ kind: 'edit', tool: null })}
            >
              Nueva herramienta
            </Button>
          </div>
        </div>
        {unavailable ? (
          <p className="px-5 py-6 text-[13px] text-muted">
            El catálogo de herramientas aún no está disponible en este entorno.
          </p>
        ) : catalog.length === 0 ? (
          <EmptyState compact kind="first-use" title="Sin herramientas todavía" />
        ) : (
          groups.map(g => (
            <section key={g.key}>
              <div className="border-b border-divider bg-tint px-5 py-2 font-sans text-[12px] font-semibold text-muted">
                {g.label}
              </div>
              <ul className="divide-y divide-divider">
                {g.items.map(t => {
                  const n = countToolTechs(t.id);
                  return (
                    <li key={t.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-5 py-3">
                      <div className="flex min-w-0 flex-1 basis-40 items-start gap-2">
                        <Wrench size={14} className="mt-[3px] flex-shrink-0 text-primary" aria-hidden />
                        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="min-w-0 break-words font-sans text-[14px] font-semibold text-navy">
                            {t.name}
                          </span>
                          {!t.is_active && <Badge tone="neutral">Inactiva</Badge>}
                        </div>
                      </div>
                      <Badge tone="info">
                        {n} técnico{n === 1 ? '' : 's'}
                      </Badge>
                      <Toggle
                        checked={t.is_active}
                        disabled={!canEdit}
                        onChange={v => void setCatalogToolActive(t.id, v)}
                        aria-label={`Activar ${t.name}`}
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Pencil}
                        disabled={!canEdit}
                        title={lock}
                        aria-label={`Editar ${t.name}`}
                        onClick={() => setModal({ kind: 'edit', tool: t })}
                      >
                        Editar
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </Card>

      {!unavailable && (
        <Card className="overflow-hidden">
          <div className="border-b border-divider px-5 py-4">
            <div className="font-display text-[16px] font-bold text-navy">Por revisar (texto libre)</div>
            <div className="font-sans text-[12px] text-muted">
              Herramientas que los técnicos escribieron fuera del catálogo. Conviértelas para que todos puedan elegirlas.
            </div>
          </div>
          {review === undefined ? (
            <p className="px-5 py-6 text-[13px] text-muted">Cargando…</p>
          ) : review === null ? (
            <p className="px-5 py-6 text-[13px] text-muted">La revisión aún no está disponible en este entorno.</p>
          ) : review.length === 0 ? (
            <EmptyState compact kind="first-use" title="Nada por revisar" description="Ningún técnico tiene herramientas en texto libre." />
          ) : (
            <ul className="divide-y divide-divider">
              {review.map(r => {
                const suggested = r.category_ids.map(catName).filter((x): x is string => !!x);
                return (
                  <li key={r.name} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-5 py-3.5">
                    <div className="min-w-0 flex-1 basis-40">
                      <div className="break-words font-sans text-[14px] font-semibold text-navy">{r.name}</div>
                      <div className="font-sans text-[12px] text-muted">
                        {suggested.length ? `Sugerida en: ${suggested.join(', ')}` : 'Sin categoría sugerida'}
                      </div>
                    </div>
                    <Badge tone="warning">
                      {r.technicians_count} técnico{r.technicians_count === 1 ? '' : 's'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={!canEdit}
                      title={lock}
                      aria-label={`Convertir ${r.name} en catálogo`}
                      onClick={() =>
                        setModal({ kind: 'promote', customName: r.name, categoryId: r.category_ids[0] ?? null })
                      }
                    >
                      Convertir en catálogo
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}

      {modal?.kind === 'edit' && (
        <ToolModal key={modal.tool?.id ?? 'new'} tool={modal.tool} onClose={() => setModal(null)} />
      )}
      {modal?.kind === 'promote' && (
        <ToolModal
          key={`p-${modal.customName}`}
          promote={{ customName: modal.customName, categoryId: modal.categoryId }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
