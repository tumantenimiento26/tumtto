'use client';

import { useEffect, useRef, useState } from 'react';
import { ExternalLink, FileText, Paperclip, Trash2, Upload } from 'lucide-react';
import { Badge, Button, Card, DatePicker, Field, Input, Modal, Select } from '@/components/ds';
import { useAction } from '@/components/use-action';
import { CardHead } from '@/app/(console)/tecnicos/_components/detail-parts';
import {
  addCompanyToolFile,
  getCompanyToolFiles,
  getToolFileUrl,
  loadToolFiles,
  removeToolFile,
  useToolFiles,
} from '@/lib/data/toolFiles';
import { toYmd } from '@/lib/inventory';
import { formatBytes, isPreviewable, mimeLabel } from '@/lib/quoteAttachments';
import {
  TOOL_FILE_KINDS,
  TOOL_FILE_KIND_LABEL,
  TOOL_FILE_TYPES,
  expiryText,
  warrantyState,
  type ToolAttachment,
  type ToolAttachmentKind,
} from '@/lib/toolFiles';

const KIND_OPTIONS = TOOL_FILE_KINDS.map(k => ({ value: k, label: TOOL_FILE_KIND_LABEL[k] }));

/** Miniatura (imagen con URL firmada) o ícono de documento. */
function FileThumb({ file }: { file: ToolAttachment }) {
  const [url, setUrl] = useState<string | null>(null);
  const image = isPreviewable(file.mime_type);
  useEffect(() => {
    let alive = true;
    if (image) void getToolFileUrl(file).then(u => alive && setUrl(u));
    return () => {
      alive = false;
    };
  }, [file, image]);
  return image && url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="h-12 w-12 shrink-0 rounded-[9px] border border-line object-cover" />
  ) : (
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[9px] bg-info-soft text-primary" aria-hidden>
      <FileText size={20} />
    </span>
  );
}

/** Abre el archivo (URL firmada fresca) en una pestaña nueva. */
async function openFile(file: ToolAttachment) {
  const w = window.open('', '_blank');
  const url = await getToolFileUrl(file);
  if (url && w) {
    w.opener = null;
    w.location.href = url;
  } else w?.close();
}

function FileRow({ file, onDelete, ownerLabel }: { file: ToolAttachment; onDelete?: () => void; ownerLabel?: string }) {
  const warranty = warrantyState(file);
  return (
    <li className="flex items-center gap-3 border-t border-divider py-2.5 first:border-t-0 first:pt-0">
      <button type="button" onClick={() => void openFile(file)} aria-label={`Abrir ${file.file_name}`} className="shrink-0">
        <FileThumb file={file} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="break-words font-sans text-[13.5px] font-semibold text-navy">{file.title ?? file.file_name}</span>
          <Badge>{TOOL_FILE_KIND_LABEL[file.kind]}</Badge>
          {warranty?.tone && <Badge tone={warranty.tone}>{warranty.label}</Badge>}
        </div>
        <p className="mt-0.5 font-sans text-[12px] text-muted">
          {[ownerLabel, mimeLabel(file.mime_type), formatBytes(file.size_bytes), file.expires_on && expiryText(file.expires_on)]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
      <button
        type="button"
        onClick={() => void openFile(file)}
        aria-label={`Abrir ${file.file_name} en una pestaña nueva`}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] text-muted transition-colors hover:bg-tint hover:text-primary"
      >
        <ExternalLink size={15} />
      </button>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Eliminar ${file.file_name}`}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] text-muted transition-colors hover:bg-tint hover:text-danger"
        >
          <Trash2 size={15} />
        </button>
      )}
    </li>
  );
}

function DeleteFileModal({
  file,
  busy,
  onClose,
  onConfirm,
}: {
  file: ToolAttachment | null;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={!!file}
      onClose={() => !busy && onClose()}
      dismissible={!busy}
      tone="danger"
      icon={Trash2}
      title="¿Eliminar este archivo?"
      description={file ? `${file.title ?? file.file_name}. No se puede deshacer.` : undefined}
      footer={
        <>
          <Button variant="secondary" disabled={busy} onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="destructive" loading={busy} onClick={onConfirm}>
            Eliminar
          </Button>
        </>
      }
    />
  );
}

/** «Fotos y documentos» de una herramienta de la empresa (inventario). */
export function CompanyToolFilesCard({ toolId, canEdit }: { toolId: string; canEdit: boolean }) {
  useToolFiles(s => s.files);
  const missing = useToolFiles(s => s.unavailable);
  const { busy, run } = useAction();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [kind, setKind] = useState<ToolAttachmentKind>('photo');
  const [title, setTitle] = useState('');
  const [expires, setExpires] = useState<Date | null>(null);
  const [removing, setRemoving] = useState<ToolAttachment | null>(null);
  useEffect(() => {
    void loadToolFiles({ companyToolId: toolId });
  }, [toolId]);
  const files = getCompanyToolFiles(toolId);

  const reset = () => {
    setFile(null);
    setTitle('');
    setExpires(null);
    if (input.current) input.current.value = '';
  };
  const upload = async () => {
    if (!file) return;
    const ok = await run(
      'up',
      () => addCompanyToolFile(toolId, { file, kind, title, expires_on: kind === 'warranty' && expires ? toYmd(expires) : null }),
      'Archivo subido',
    );
    if (ok) reset();
  };

  return (
    <Card padded className="animate-up">
      <CardHead title="Fotos y documentos" action={files.length > 0 && <Badge tone="info">{files.length}</Badge>} />
      {missing && <p className="mb-3 font-sans text-[13px] text-muted">Los archivos aún no están disponibles en este entorno.</p>}
      {canEdit && !missing && (
        <div className="mb-4 rounded-[12px] border border-line bg-tint/40 p-3">
          <div className="grid grid-cols-1 gap-3 min-[641px]:grid-cols-2">
            <Field label="Archivo" hint="Imagen o PDF, máximo 15 MB">
              <input
                ref={input}
                type="file"
                accept={TOOL_FILE_TYPES.join(',')}
                aria-label="Archivo"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
                className="block w-full font-sans text-[13px] text-body file:mr-3 file:cursor-pointer file:rounded-[8px] file:border file:border-line file:bg-card file:px-3 file:py-1.5 file:font-sans file:text-[13px] file:font-semibold file:text-navy"
              />
            </Field>
            <Field label="Tipo">
              <Select options={KIND_OPTIONS} value={kind} onChange={setKind} aria-label="Tipo de archivo" />
            </Field>
            <Field label="Título (opcional)">
              <Input value={title} maxLength={80} placeholder="Garantía Truper 2 años" onChange={e => setTitle(e.target.value)} aria-label="Título" />
            </Field>
            {kind === 'warranty' && (
              <Field label="Vence (opcional)">
                <DatePicker value={expires} onChange={setExpires} disablePast={false} placeholder="Sin fecha" aria-label="Vencimiento de la garantía" />
                {expires && (
                  <button type="button" className="mt-1 text-[12px] font-semibold text-primary hover:underline" onClick={() => setExpires(null)}>
                    Quitar fecha
                  </button>
                )}
              </Field>
            )}
          </div>
          <div className="mt-3 flex justify-end">
            <Button icon={Upload} disabled={!file} loading={busy === 'up'} onClick={() => void upload()}>
              Subir
            </Button>
          </div>
        </div>
      )}
      {files.length === 0 ? (
        <p className="flex items-center gap-2 font-sans text-[13px] text-muted">
          <Paperclip size={14} /> Sin fotos ni documentos.
        </p>
      ) : (
        <ul className="flex flex-col">
          {files.map(f => (
            <FileRow key={f.id} file={f} onDelete={canEdit ? () => setRemoving(f) : undefined} />
          ))}
        </ul>
      )}
      <DeleteFileModal
        file={removing}
        busy={busy === 'del'}
        onClose={() => setRemoving(null)}
        onConfirm={async () => {
          if (!removing) return;
          const ok = await run('del', () => removeToolFile(removing), 'Archivo eliminado');
          if (ok) setRemoving(null);
        }}
      />
    </Card>
  );
}

/** Archivos de las herramientas de un técnico (perfil del técnico); borrar requiere `usuarios`. */
export function TechToolFiles({
  techToolIds,
  names,
  canDelete,
}: {
  techToolIds: string[];
  names: Record<string, string>;
  canDelete: boolean;
}) {
  const all = useToolFiles(s => s.files);
  const { busy, run } = useAction();
  const [removing, setRemoving] = useState<ToolAttachment | null>(null);
  const key = techToolIds.join(',');
  useEffect(() => {
    if (key) void loadToolFiles({ technicianToolIds: key.split(',') });
  }, [key]);
  const files = all
    .filter(f => f.technician_tool_id && techToolIds.includes(f.technician_tool_id))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  if (files.length === 0) return null;
  return (
    <div className="mt-5 border-t border-divider pt-4">
      <div className="mb-2 font-sans text-[12px] font-semibold text-muted">Fotos y documentos</div>
      <ul className="flex flex-col">
        {files.map(f => (
          <FileRow
            key={f.id}
            file={f}
            ownerLabel={names[f.technician_tool_id ?? '']}
            onDelete={canDelete ? () => setRemoving(f) : undefined}
          />
        ))}
      </ul>
      <DeleteFileModal
        file={removing}
        busy={busy === 'del'}
        onClose={() => setRemoving(null)}
        onConfirm={async () => {
          if (!removing) return;
          const ok = await run('del', () => removeToolFile(removing), 'Archivo eliminado');
          if (ok) setRemoving(null);
        }}
      />
    </div>
  );
}
