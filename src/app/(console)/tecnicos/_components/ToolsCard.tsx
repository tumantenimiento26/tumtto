'use client';

import { useEffect, useState } from 'react';
import { Wrench, X, Trash2 } from 'lucide-react';
import { Badge, Button, Card, Modal } from '@/components/ds';
import { useAction } from '@/components/use-action';
import { useAuth } from '@/lib/auth';
import {
  getCategories,
  getTechToolViews,
  loadExtras,
  removeTechTool,
  useExtras,
  useTick,
} from '@/lib/data/store';
import { groupByCategory, type ToolView } from '@/lib/tools';
import { CardHead } from './detail-parts';

/** Bloque «Herramienta» del perfil del técnico: agrupado por categoría; quitar con permiso usuarios. */
export function ToolsCard({ techId }: { techId: string }) {
  useTick();
  useExtras(s => s.techTools);
  useExtras(s => s.toolCatalog);
  const missing = useExtras(s => s.unavailable.techTools || s.unavailable.toolCatalog);
  const canEdit = useAuth().can('usuarios');
  const { busy, run } = useAction();
  const [removing, setRemoving] = useState<ToolView | null>(null);
  useEffect(() => {
    void loadExtras();
  }, []);
  const tools = getTechToolViews(techId);
  const groups = groupByCategory(tools, getCategories());

  return (
    <Card padded className="animate-up">
      <CardHead title="Herramienta" action={!missing && tools.length > 0 && <Badge tone="info">{tools.length}</Badge>} />
      {missing ? (
        <p className="font-sans text-[13px] text-muted">
          La herramienta del técnico aún no está disponible en este entorno.
        </p>
      ) : groups.length === 0 ? (
        <p className="font-sans text-[13px] text-muted">El técnico no ha registrado herramienta.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map(g => (
            <div key={g.key}>
              <div className="mb-1.5 font-sans text-[12px] font-semibold text-muted">{g.label}</div>
              <ul className="flex flex-wrap gap-2">
                {g.items.map(t => (
                  <li
                    key={t.rowId}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-card py-1 pl-3 pr-1.5 font-sans text-[13px] text-navy"
                  >
                    <Wrench size={12} className="flex-shrink-0 text-primary" />
                    <span className="min-w-0 break-words">{t.name}</span>
                    {t.custom && <Badge tone="warning">No listada</Badge>}
                    <button
                      type="button"
                      disabled={!canEdit}
                      title={canEdit ? undefined : 'Tu rol no edita herramienta'}
                      aria-label={`Quitar ${t.name}`}
                      onClick={() => setRemoving(t)}
                      className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-tint hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <X size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      <Modal
        open={!!removing}
        onClose={() => !busy && setRemoving(null)}
        dismissible={!busy}
        tone="danger"
        icon={Trash2}
        title="¿Quitar esta herramienta?"
        description={removing ? `${removing.name}. Queda en la bitácora del técnico.` : undefined}
        footer={
          <>
            <Button variant="secondary" disabled={!!busy} onClick={() => setRemoving(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              loading={busy === 'del'}
              onClick={async () => {
                if (!removing) return;
                const ok = await run('del', () => removeTechTool(removing.rowId), 'Herramienta quitada');
                if (ok) setRemoving(null);
              }}
            >
              Quitar
            </Button>
          </>
        }
      />
    </Card>
  );
}
