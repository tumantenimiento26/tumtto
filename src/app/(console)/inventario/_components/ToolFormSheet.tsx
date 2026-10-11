'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { Button, DatePicker, Field, Input, Select, Sheet } from '@/components/ds';
import { useAction } from '@/components/use-action';
import { FormSection } from '../../servicios/_components/ServiceFormSheet';
import {
  PHOTO_TYPES,
  getCategories,
  getToolCatalog,
  saveCompanyTool,
  type CompanyTool,
} from '@/lib/data/store';
import { fromYmd, isFutureDay, parsePesos, pesosInput, toYmd } from '@/lib/inventory';
import { ToolThumb } from './shared';

const NONE = '__none__';

/** Alta/edición de una herramienta de la empresa (Sheet 480). */
export function ToolFormSheet({
  open,
  tool,
  onClose,
  onSaved,
}: {
  open: boolean;
  tool: CompanyTool | null;
  onClose: () => void;
  onSaved?: (t: CompanyTool) => void;
}) {
  const { busy, run } = useAction();
  const [name, setName] = useState('');
  const [cat, setCat] = useState<string>(NONE);
  const [catalog, setCatalog] = useState<string>(NONE);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [acquired, setAcquired] = useState<Date | null>(null);
  const [cost, setCost] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [keepPhoto, setKeepPhoto] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [photoErr, setPhotoErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setName(tool?.name ?? '');
    setCat(tool?.category_id ?? NONE);
    setCatalog(tool?.catalog_id ?? NONE);
    setBrand(tool?.brand ?? '');
    setModel(tool?.model ?? '');
    setSerial(tool?.serial_or_code ?? '');
    setAcquired(fromYmd(tool?.acquired_on));
    setCost(pesosInput(tool?.acquisition_cost_cents));
    setPhoto(null);
    setKeepPhoto(tool?.photo_path ?? null);
    setTouched(false);
    setPhotoErr(null);
  }, [open, tool]);
  useEffect(() => {
    if (!photo) return setPreview(null);
    const u = URL.createObjectURL(photo);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [photo]);

  const cats = getCategories();
  const catalogItems = useMemo(() => getToolCatalog().filter(t => t.is_active || t.id === tool?.catalog_id), [tool]);
  const cents = parsePesos(cost);
  const errs = {
    name: !name.trim() ? 'Obligatorio' : null,
    serial: !serial.trim() ? 'Obligatorio' : null,
    cost: Number.isNaN(cents) ? 'Monto inválido (ej. 1250.50)' : null,
    acquired: acquired && isFutureDay(acquired) ? 'No puede ser futura' : null,
  };
  const show = (k: keyof typeof errs) => (touched ? errs[k] : null);

  function pick(f: File | undefined) {
    if (!f) return;
    if (!PHOTO_TYPES.includes(f.type) || f.size > 5 * 1024 * 1024) {
      setPhotoErr('JPG, PNG, WEBP o HEIC de máximo 5 MB.');
      return;
    }
    setPhotoErr(null);
    setPhoto(f);
  }

  async function save() {
    setTouched(true);
    if (Object.values(errs).some(Boolean)) return;
    let saved: CompanyTool | null = null;
    const ok = await run(
      'save',
      async () => {
        saved = await saveCompanyTool(
          {
            name,
            category_id: cat === NONE ? null : cat,
            catalog_id: catalog === NONE ? null : catalog,
            brand,
            model,
            serial_or_code: serial,
            acquired_on: acquired ? toYmd(acquired) : null,
            acquisition_cost_cents: cents === null || Number.isNaN(cents) ? null : cents,
          },
          { id: tool?.id, photo, keepPhoto },
        );
        return saved;
      },
      tool ? 'Herramienta actualizada' : 'Herramienta agregada',
    );
    if (ok && saved) {
      onSaved?.(saved);
      onClose();
    }
  }

  return (
    <Sheet
      open={open}
      onClose={() => !busy && onClose()}
      kicker="Inventario"
      title={tool ? 'Editar herramienta' : 'Nueva herramienta'}
      width={480}
      footer={
        <div className="flex w-full gap-2">
          <Button variant="secondary" full disabled={!!busy} onClick={onClose}>
            Cancelar
          </Button>
          <Button full loading={!!busy} onClick={() => void save()}>
            Guardar
          </Button>
        </div>
      }
    >
      <FormSection>Identificación</FormSection>
      <div className="flex flex-col gap-4">
        <Field label="Nombre" error={show('name')} required>
          <Input value={name} onChange={e => setName(e.target.value)} error={!!show('name')} placeholder="Ej. Multímetro de gancho" aria-label="Nombre" />
        </Field>
        <div className="grid grid-cols-1 gap-4 min-[641px]:grid-cols-2">
          <Field label="Marca">
            <Input value={brand} onChange={e => setBrand(e.target.value)} aria-label="Marca" />
          </Field>
          <Field label="Modelo">
            <Input value={model} onChange={e => setModel(e.target.value)} aria-label="Modelo" />
          </Field>
        </div>
        <Field label="Número de serie o código interno" error={show('serial')} hint="Único; se guarda en mayúsculas." required>
          <Input
            value={serial}
            onChange={e => setSerial(e.target.value.toUpperCase())}
            error={!!show('serial')}
            className="font-mono"
            aria-label="Número de serie o código interno"
          />
        </Field>
      </div>

      <FormSection>Clasificación</FormSection>
      <div className="flex flex-col gap-4">
        <Field label="Categoría">
          <Select
            options={[{ value: NONE, label: 'General (sin categoría)' }, ...cats.map(c => ({ value: c.id, label: c.name }))]}
            value={cat}
            onChange={setCat}
            aria-label="Categoría"
          />
        </Field>
        <Field label="Ligar al catálogo de herramienta" hint="Opcional: el filtro «Herramienta» de técnicos también la considerará.">
          <Select
            options={[{ value: NONE, label: 'Sin liga' }, ...catalogItems.map(t => ({ value: t.id, label: t.name }))]}
            value={catalog}
            onChange={setCatalog}
            aria-label="Catálogo"
          />
        </Field>
      </div>

      <FormSection>Adquisición</FormSection>
      <div className="grid grid-cols-1 gap-4 min-[641px]:grid-cols-2">
        <Field label="Fecha de adquisición" error={show('acquired')}>
          <DatePicker value={acquired} onChange={setAcquired} disablePast={false} error={!!show('acquired')} placeholder="Sin fecha" aria-label="Fecha de adquisición" />
          {acquired && (
            <button type="button" className="mt-1 text-[12px] font-semibold text-primary hover:underline" onClick={() => setAcquired(null)}>
              Quitar fecha
            </button>
          )}
        </Field>
        <Field label="Costo (MXN)" error={show('cost')}>
          <Input prefix="$" inputMode="decimal" value={cost} onChange={e => setCost(e.target.value)} error={!!show('cost')} placeholder="0.00" aria-label="Costo en pesos" />
        </Field>
      </div>

      <FormSection>Foto</FormSection>
      <div className="flex items-center gap-3">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Vista previa" className="h-16 w-16 shrink-0 rounded-[10px] border border-line object-cover" />
        ) : (
          <ToolThumb path={keepPhoto} size={64} />
        )}
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept={PHOTO_TYPES.join(',')}
            className="sr-only"
            aria-label="Subir foto"
            onChange={e => {
              pick(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <Button variant="secondary" size="sm" icon={ImagePlus} onClick={() => fileRef.current?.click()}>
            {preview || keepPhoto ? 'Cambiar foto' : 'Subir foto'}
          </Button>
          {(preview || keepPhoto) && (
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={() => {
                setPhoto(null);
                setKeepPhoto(null);
              }}
            >
              Quitar
            </Button>
          )}
        </div>
      </div>
      <p className="mt-2 text-[12px] text-muted">{photoErr ? <span className="text-error">{photoErr}</span> : 'JPG, PNG, WEBP o HEIC, máximo 5 MB. Se guarda en un bucket privado.'}</p>
    </Sheet>
  );
}
