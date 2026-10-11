'use client';

import { useRef, useState } from 'react';
import { Download, FileUp, Upload } from 'lucide-react';
import { Badge, Button, Sheet, toast } from '@/components/ds';
import { useAuth } from '@/lib/auth';
import { downloadCsv } from '@/lib/csv';
import {
  IMPORT_ENTITIES,
  parseImport,
  resultsCsv,
  templateCsv,
  type ImportEntity,
  type ParsedRow,
} from '@/lib/bulkImport';
import { getImportContext, importRow, loadExtras, reloadAfterImport } from '@/lib/data/store';

type Row = ParsedRow & { result?: string; ok?: boolean };

/** Botón "Importar" + hoja con plantilla, vista previa validada y resultado por fila. */
export function ImportButton({ entity }: { entity: ImportEntity }) {
  const [open, setOpen] = useState(false);
  if (!useAuth().can(IMPORT_ENTITIES[entity].permission)) return null;
  return (
    <>
      <Button variant="secondary" icon={Upload} onClick={() => setOpen(true)}>
        Importar
      </Button>
      {open && <ImportSheet entity={entity} onClose={() => setOpen(false)} />}
    </>
  );
}

function ImportSheet({ entity, onClose }: { entity: ImportEntity; onClose: () => void }) {
  const def = IMPORT_ENTITIES[entity];
  const input = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const valid = rows?.filter(r => r.value) ?? [];
  const invalid = (rows?.length ?? 0) - valid.length;

  async function onFile(file: File | undefined) {
    if (!file) return;
    setDone(false);
    if (!/\.csv$/i.test(file.name)) {
      toast.error('Sube un archivo .csv', 'En Excel: Archivo › Guardar como › CSV UTF-8.');
      return;
    }
    await loadExtras(); // catálogos/empresas para validar
    const parsed = parseImport(entity, await file.text(), getImportContext());
    if ('error' in parsed) {
      toast.error('No se pudo leer el archivo', parsed.error);
      setRows(null);
      return;
    }
    setFileName(file.name);
    setRows(parsed);
  }

  async function run() {
    if (!rows) return;
    setRunning(true);
    const next = [...rows];
    for (let i = 0; i < next.length; i++) {
      const r = next[i];
      if (!r.value) continue;
      try {
        await importRow(entity, r.value);
        next[i] = { ...r, ok: true, result: 'Importado' };
      } catch (e) {
        next[i] = { ...r, ok: false, result: `Error: ${e instanceof Error ? e.message : 'desconocido'}` };
      }
      setRows([...next]);
    }
    await reloadAfterImport();
    setRunning(false);
    setDone(true);
    const ok = next.filter(r => r.ok).length;
    const failed = next.length - ok;
    if (failed) toast.error(`${ok} importadas, ${failed} con error`, 'Descarga el reporte para corregirlas.');
    else toast.success(`${ok} filas importadas`);
  }

  return (
    <Sheet
      open
      onClose={running ? () => {} : onClose}
      kicker="Importar CSV"
      title={def.label}
      width={720}
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          {rows ? (
            <Button
              variant="ghost"
              icon={Download}
              onClick={() => downloadCsv(`resultado-${def.filename.replace('plantilla-', '')}`, resultsCsv(entity, rows))}
            >
              Reporte
            </Button>
          ) : (
            <span />
          )}
          {done ? (
            <Button onClick={onClose}>Listo</Button>
          ) : (
            <Button icon={Upload} disabled={!valid.length || running} loading={running} onClick={run}>
              Importar {valid.length} fila{valid.length === 1 ? '' : 's'} válida{valid.length === 1 ? '' : 's'}
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-4 text-[14px]">
        <ol className="flex list-decimal flex-col gap-1 pl-5 text-muted">
          <li>Descarga la plantilla y llénala (una fila por registro, sin cambiar los encabezados).</li>
          <li>En Excel: Archivo › Guardar como › <b>CSV UTF-8 (delimitado por comas)</b>.</li>
          <li>Sube el archivo, revisa la vista previa e importa las filas válidas.</li>
        </ol>
        <p className="rounded-lg bg-panel p-3 text-[13px] text-muted">{def.notes}</p>
        <p className="text-[13px] text-muted">
          Columnas: {def.headers.map(h => (def.required.includes(h) ? `${h}*` : h)).join(', ')} (* obligatorias)
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={Download} onClick={() => downloadCsv(def.filename, templateCsv(entity))}>
            Descargar plantilla
          </Button>
          <Button variant="secondary" icon={FileUp} disabled={running} onClick={() => input.current?.click()}>
            {fileName ? 'Cambiar archivo' : 'Subir CSV'}
          </Button>
          <input
            ref={input}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            data-testid="import-file"
            onChange={e => {
              void onFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>

        {rows && (
          <>
            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              <span className="font-semibold text-navy">{fileName}</span>
              <Badge tone="success">{valid.length} válidas</Badge>
              {invalid > 0 && <Badge tone="danger">{invalid} con error</Badge>}
            </div>
            <div className="max-h-[50vh] overflow-auto rounded-lg border border-line">
              <table className="w-full text-left text-[12px]">
                <thead className="sticky top-0 bg-panel">
                  <tr>
                    <th className="px-2 py-1.5">Fila</th>
                    {def.headers.map(h => (
                      <th key={h} className="px-2 py-1.5">{h}</th>
                    ))}
                    <th className="px-2 py-1.5">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.line} className="border-t border-line align-top" data-testid="import-row">
                      <td className="px-2 py-1.5 font-mono">{r.line}</td>
                      {def.headers.map(h => (
                        <td key={h} className="max-w-[160px] truncate px-2 py-1.5" title={r.raw[h]}>
                          {r.raw[h]}
                        </td>
                      ))}
                      <td className="px-2 py-1.5">
                        {r.result ? (
                          <span className={r.ok ? 'text-success' : 'text-error'}>{r.result}</span>
                        ) : r.errors.length ? (
                          <span className="text-error">{r.errors.join('; ')}</span>
                        ) : (
                          <span className="text-muted">Lista</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Sheet>
  );
}
