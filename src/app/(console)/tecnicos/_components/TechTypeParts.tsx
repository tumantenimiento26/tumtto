'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Badge, Button, Card, Field, Segmented, Select, Sheet, Textarea } from '@/components/ds';
import { useAction } from '@/components/use-action';
import { useAuth } from '@/lib/auth';
import {
  getTechType,
  loadExtras,
  setTechnicianType,
  useExtras,
  useTick,
} from '@/lib/data/store';
import {
  TECH_TYPES,
  TECH_TYPE_LABEL,
  TECH_TYPE_TONE,
  techTypeLabel,
  typeCompanyValid,
  type TechType,
} from '@/lib/techType';
import { CompanyModal } from '../../config/_components/CompanyModal';
import { CardHead, KV } from './detail-parts';

/** Badge del tipo (Tercero muestra la empresa). Solo consola admin. */
export function TechTypeBadge({ techId, short }: { techId: string; short?: boolean }) {
  useExtras(s => s.companies);
  const { type, company } = getTechType(techId);
  return (
    <Badge tone={TECH_TYPE_TONE[type]}>
      {short ? TECH_TYPE_LABEL[type] : techTypeLabel(type, company?.name)}
    </Badge>
  );
}

/** Bloque «Tipo de técnico» del perfil + acción «Cambiar tipo». */
export function TechTypeCard({ techId }: { techId: string }) {
  useTick();
  useExtras(s => s.companies);
  const canEdit = useAuth().can('usuarios');
  const [open, setOpen] = useState(false);
  const { type, company } = getTechType(techId);
  useEffect(() => {
    void loadExtras();
  }, []);
  return (
    <Card padded className="animate-up">
      <CardHead
        title="Tipo de técnico"
        action={
          <Button
            size="sm"
            variant="secondary"
            disabled={!canEdit}
            title={canEdit ? undefined : 'Tu rol no cambia el tipo de técnico'}
            onClick={() => setOpen(true)}
          >
            Cambiar tipo
          </Button>
        }
      />
      <KV label="Tipo" value={<Badge tone={TECH_TYPE_TONE[type]}>{TECH_TYPE_LABEL[type]}</Badge>} />
      {type === 'third_party' && <KV label="Empresa" value={company?.name ?? '—'} />}
      <p className="mt-2 font-sans text-[12px] text-muted">
        Clasificación interna: no se muestra a los clientes.
      </p>
      {open && <ChangeTypeSheet techId={techId} onClose={() => setOpen(false)} />}
    </Card>
  );
}

function ChangeTypeSheet({ techId, onClose }: { techId: string; onClose: () => void }) {
  const current = getTechType(techId);
  const [type, setType] = useState<TechType>(current.type);
  const [companyId, setCompanyId] = useState<string | null>(current.company?.id ?? null);
  const [note, setNote] = useState('');
  const [newCo, setNewCo] = useState(false);
  const companies = useExtras(s => s.companies);
  const { busy, run } = useAction();
  const effectiveCompany = type === 'third_party' ? companyId : null;
  const valid = typeCompanyValid(type, effectiveCompany);
  const unchanged = type === current.type && effectiveCompany === (current.company?.id ?? null);
  const options = companies
    .filter(c => c.is_active || c.id === companyId)
    .map(c => ({ value: c.id, label: c.name + (c.is_active ? '' : ' (inactiva)') }));

  async function save() {
    const ok = await run(
      'type',
      () => setTechnicianType(techId, type, effectiveCompany, note),
      'Tipo de técnico actualizado',
    );
    if (ok) onClose();
  }

  return (
    <>
      <Sheet
        open
        onClose={() => !busy && onClose()}
        title="Cambiar tipo de técnico"
        kicker="Técnico"
        width={480}
        footer={
          <div className="flex w-full gap-2">
            <Button variant="secondary" full disabled={!!busy} onClick={onClose}>
              Cancelar
            </Button>
            <Button full loading={!!busy} disabled={!valid || unchanged} onClick={() => void save()}>
              Guardar
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <Field label="Tipo">
            <Segmented
              aria-label="Tipo de técnico"
              options={TECH_TYPES.map(t => ({ value: t, label: TECH_TYPE_LABEL[t] }))}
              value={type}
              onChange={setType}
            />
          </Field>
          {type === 'third_party' && (
            <Field label="Empresa" hint="Obligatoria para técnicos Tercero.">
              <Select
                options={options}
                value={companyId}
                onChange={setCompanyId}
                placeholder="Selecciona una empresa"
                searchable
                aria-label="Empresa"
              />
              <button
                type="button"
                onClick={() => setNewCo(true)}
                className="mt-2 inline-flex items-center gap-1 font-sans text-[13px] font-semibold text-primary"
              >
                <Plus size={13} /> Nueva empresa
              </button>
            </Field>
          )}
          <Field label="Nota (opcional)" hint="Queda en la bitácora del técnico.">
            <Textarea rows={3} value={note} onChange={e => setNote(e.target.value)} />
          </Field>
        </div>
      </Sheet>
      {newCo && (
        <CompanyModal
          open
          onClose={() => setNewCo(false)}
          onSaved={c => setCompanyId(c.id)}
        />
      )}
    </>
  );
}

