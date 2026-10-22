'use client';

import { useEffect, useMemo, useState } from 'react';
import { Lock } from 'lucide-react';

import { Button, Card, Checkbox, toast } from '@/components/ds';
import { saveRolePermissions, type RoleRow } from '@/lib/data/staff';
import {
  matrixDirty,
  matrixFromRows,
  matrixSummary,
  setColumn,
  setEdit,
  setView,
  type SectionDef,
} from '@/lib/staffRoles';

/** Matriz del rol: filas = secciones de la consola, columnas = Ver / Editar. */
export function MatrixEditor({
  role,
  sections,
}: {
  role: RoleRow;
  sections: SectionDef[];
}) {
  const slugs = useMemo(() => sections.map(s => s.slug), [sections]);
  const readOnly = !role.is_editable;
  const baseline = useMemo(
    () =>
      readOnly
        ? matrixFromRows(
            slugs,
            slugs.map(section => ({ section, can_view: true, can_edit: true })),
          )
        : matrixFromRows(slugs, role.permissions),
    [readOnly, slugs, role.permissions],
  );
  // Reinicia el borrador sólo si el servidor cambió el contenido (no por una recarga igual).
  const baselineKey = JSON.stringify(baseline);
  const [draft, setDraft] = useState(baseline);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setDraft(baseline);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baselineKey]);

  const dirty = !readOnly && matrixDirty(draft, baseline);
  const sum = matrixSummary(draft);

  async function save() {
    if (!dirty || saving) return;
    setSaving(true);
    setError(null);
    const r = await saveRolePermissions(role.slug, draft);
    setSaving(false);
    if (!r.ok) return setError(r.message);
    toast.success('Permisos guardados', role.name);
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-divider px-5 py-4">
        <div>
          <div className="font-display text-[16px] font-bold text-navy">
            Permisos de {role.name}
          </div>
          <p className="mt-0.5 font-sans text-[12.5px] text-muted">
            {readOnly
              ? 'Super admin siempre tiene acceso total y no se puede editar.'
              : `${sum.view} secciones visibles · ${sum.edit} editables. Editar incluye ver.`}
          </p>
        </div>
        {readOnly && (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted">
            <Lock size={14} aria-hidden /> Solo lectura
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse">
          <thead>
            <tr className="bg-panel">
              <th className="px-5 py-2.5 text-left font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">
                Sección
              </th>
              {(['view', 'edit'] as const).map(col => {
                const all =
                  slugs.length > 0 && slugs.every(s => draft[s]?.[col]);
                return (
                  <th
                    key={col}
                    className="w-32 px-3 py-2.5 text-center font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted"
                  >
                    <div className="flex flex-col items-center gap-1">
                      {col === 'view' ? 'Ver' : 'Editar'}
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => setDraft(d => setColumn(d, col, !all))}
                          className="font-sans text-[11px] font-semibold normal-case tracking-normal text-primary hover:underline"
                        >
                          {all ? 'Quitar todo' : 'Marcar todo'}
                        </button>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sections.map(s => {
              const p = draft[s.slug] ?? { view: false, edit: false };
              return (
                <tr key={s.slug} className="border-t border-divider">
                  <td className="px-5 py-3 font-sans text-[13.5px] font-semibold text-navy">
                    {s.label}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Checkbox
                      className="justify-center"
                      checked={p.view}
                      disabled={readOnly}
                      onChange={v => setDraft(d => setView(d, s.slug, v))}
                      label={<span className="sr-only">Ver {s.label}</span>}
                    />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Checkbox
                      className="justify-center"
                      checked={p.edit}
                      disabled={readOnly}
                      onChange={v => setDraft(d => setEdit(d, s.slug, v))}
                      label={<span className="sr-only">Editar {s.label}</span>}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-divider px-5 py-3.5">
          <p
            role={error ? 'alert' : 'status'}
            className={`text-[12.5px] ${error ? 'font-medium text-error' : dirty ? 'font-semibold text-warning-ink' : 'text-muted'}`}
          >
            {error ?? (dirty ? 'Cambios sin guardar' : 'Sin cambios')}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={!dirty || saving}
              onClick={() => {
                setDraft(baseline);
                setError(null);
              }}
            >
              Descartar
            </Button>
            <Button
              disabled={!dirty}
              loading={saving}
              onClick={() => void save()}
            >
              Guardar permisos
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
