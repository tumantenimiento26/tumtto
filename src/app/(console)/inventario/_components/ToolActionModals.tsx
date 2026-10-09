'use client';

import { useEffect, useState } from 'react';
import { Ban, RotateCcw, UserPlus } from 'lucide-react';
import { Button, DatePicker, Field, Modal, Select, Segmented, Textarea, Checkbox } from '@/components/ds';
import { useAction } from '@/components/use-action';
import {
  assignCompanyTool,
  getAssignableTechnicians,
  getCompanyTool,
  retireCompanyTool,
  returnCompanyTool,
} from '@/lib/data/store';
import {
  CONDITIONS,
  CONDITION_LABEL,
  RETIRE_REASONS,
  RETIRE_REASON_LABEL,
  dayToIso,
  isFutureDay,
  type InventoryCondition,
  type RetireReason,
} from '@/lib/inventory';

const CONDITION_OPTIONS = CONDITIONS.map(c => ({ value: c, label: CONDITION_LABEL[c] }));

/** Asignar una herramienta disponible: técnico + fecha + condición + nota. */
export function AssignToolModal({
  toolId,
  fixedTechId,
  onClose,
}: {
  /** null cierra. */
  toolId: string | null;
  /** Desde el perfil del técnico el técnico ya viene elegido. */
  fixedTechId?: string;
  onClose: () => void;
}) {
  const { busy, run } = useAction();
  const [tech, setTech] = useState<string | null>(fixedTechId ?? null);
  const [date, setDate] = useState<Date | null>(new Date());
  const [cond, setCond] = useState<InventoryCondition>('good');
  const [note, setNote] = useState('');
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (toolId) {
      setTech(fixedTechId ?? null);
      setDate(new Date());
      setCond('good');
      setNote('');
      setTouched(false);
    }
  }, [toolId, fixedTechId]);
  const tool = getCompanyTool(toolId);
  const techs = getAssignableTechnicians();
  const errTech = !tech ? 'Elige un técnico' : null;
  const errDate = !date ? 'Elige la fecha de entrega' : isFutureDay(date) ? 'No puede ser futura' : null;

  async function submit() {
    setTouched(true);
    if (errTech || errDate || !toolId || !tech || !date) return;
    const ok = await run(
      'assign',
      () => assignCompanyTool(toolId, { technicianId: tech, assignedAt: dayToIso(date), condition: cond, note }),
      'Herramienta asignada',
    );
    if (ok) onClose();
  }

  return (
    <Modal
      open={!!toolId}
      onClose={() => !busy && onClose()}
      dismissible={!busy}
      icon={UserPlus}
      title="Asignar herramienta"
      description={tool ? `${tool.name} · ${tool.serial_or_code}` : undefined}
      width={480}
      footer={
        <>
          <Button variant="secondary" disabled={!!busy} onClick={onClose}>
            Cancelar
          </Button>
          <Button loading={busy === 'assign'} onClick={() => void submit()}>
            Asignar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Técnico" required error={touched ? errTech : null}>
          <Select
            options={techs.map(t => ({ value: t.id, label: t.name }))}
            value={tech}
            onChange={setTech}
            disabled={!!fixedTechId}
            placeholder="Elige un técnico"
            error={touched && !!errTech}
            aria-label="Técnico"
          />
        </Field>
        <Field label="Fecha de entrega" required error={touched ? errDate : null}>
          <DatePicker value={date} onChange={setDate} disablePast={false} error={touched && !!errDate} aria-label="Fecha de entrega" />
        </Field>
        <Field label="Condición al entregar">
          <Segmented options={CONDITION_OPTIONS} value={cond} onChange={setCond} aria-label="Condición" />
        </Field>
        <Field label="Nota">
          <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Accesorios entregados, observaciones…" maxLength={500} />
        </Field>
      </div>
    </Modal>
  );
}

/** Registrar devolución: fecha + condición + nota + «enviar a reparación». */
export function ReturnToolModal({ toolId, onClose }: { toolId: string | null; onClose: () => void }) {
  const { busy, run } = useAction();
  const [date, setDate] = useState<Date | null>(new Date());
  const [cond, setCond] = useState<InventoryCondition>('good');
  const [note, setNote] = useState('');
  const [repair, setRepair] = useState(false);
  useEffect(() => {
    if (toolId) {
      setDate(new Date());
      setCond('good');
      setNote('');
      setRepair(false);
    }
  }, [toolId]);
  const tool = getCompanyTool(toolId);
  const damaged = cond === 'damaged';
  const errDate = !date ? 'Elige la fecha' : isFutureDay(date) ? 'No puede ser futura' : null;

  async function submit() {
    if (errDate || !toolId || !date) return;
    const ok = await run(
      'return',
      () => returnCompanyTool(toolId, { returnedAt: dayToIso(date), condition: cond, note, toRepair: repair || damaged }),
      'Devolución registrada',
    );
    if (ok) onClose();
  }

  return (
    <Modal
      open={!!toolId}
      onClose={() => !busy && onClose()}
      dismissible={!busy}
      icon={RotateCcw}
      title="Registrar devolución"
      description={tool ? `${tool.name} · ${tool.serial_or_code}` : undefined}
      width={480}
      footer={
        <>
          <Button variant="secondary" disabled={!!busy} onClick={onClose}>
            Cancelar
          </Button>
          <Button loading={busy === 'return'} disabled={!!errDate} onClick={() => void submit()}>
            Registrar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Fecha de devolución" required error={errDate}>
          <DatePicker value={date} onChange={setDate} disablePast={false} error={!!errDate} aria-label="Fecha de devolución" />
        </Field>
        <Field label="Condición al devolver">
          <Segmented options={CONDITION_OPTIONS} value={cond} onChange={setCond} aria-label="Condición" />
        </Field>
        <Checkbox
          checked={repair || damaged}
          disabled={damaged}
          onChange={setRepair}
          label={damaged ? 'Enviar a reparación (siempre si llega dañada)' : 'Enviar a reparación'}
        />
        <Field label="Nota">
          <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Estado, faltantes, observaciones…" maxLength={500} />
        </Field>
      </div>
    </Modal>
  );
}

/** Baja con motivo + nota y confirmación explícita (no se borra, queda en historial). */
export function RetireToolModal({ toolId, onClose }: { toolId: string | null; onClose: () => void }) {
  const { busy, run } = useAction();
  const [reason, setReason] = useState<RetireReason | null>(null);
  const [note, setNote] = useState('');
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    if (toolId) {
      setReason(null);
      setNote('');
      setConfirm(false);
    }
  }, [toolId]);
  const tool = getCompanyTool(toolId);
  const open = tool?.status === 'assigned';

  async function submit() {
    if (!reason || !confirm || !toolId) return;
    const ok = await run('retire', () => retireCompanyTool(toolId, reason, note), 'Herramienta dada de baja');
    if (ok) onClose();
  }

  return (
    <Modal
      open={!!toolId}
      onClose={() => !busy && onClose()}
      dismissible={!busy}
      tone="danger"
      icon={Ban}
      title="¿Dar de baja esta herramienta?"
      description={
        tool
          ? `${tool.name} · ${tool.serial_or_code}. No se borra: queda en el historial con el motivo.${
              open ? ' Tiene un técnico asignado; su asignación se cerrará.' : ''
            }`
          : undefined
      }
      width={480}
      footer={
        <>
          <Button variant="secondary" disabled={!!busy} onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="destructive" loading={busy === 'retire'} disabled={!reason || !confirm} onClick={() => void submit()}>
            Dar de baja
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Motivo" required>
          <Select
            options={RETIRE_REASONS.map(r => ({ value: r, label: RETIRE_REASON_LABEL[r] }))}
            value={reason}
            onChange={setReason}
            placeholder="Elige un motivo"
            aria-label="Motivo de baja"
          />
        </Field>
        <Field label="Nota">
          <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Detalle de lo ocurrido" maxLength={500} />
        </Field>
        <Checkbox checked={confirm} onChange={setConfirm} label="Entiendo que la baja no se puede deshacer" />
      </div>
    </Modal>
  );
}
