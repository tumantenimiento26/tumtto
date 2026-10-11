'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Plus, RotateCcw } from 'lucide-react';
import { Badge, Button, Card, Modal, Select } from '@/components/ds';
import { useAuth } from '@/lib/auth';
import { getCompanyTool, getTechToolAssignments, loadExtras, useExtras } from '@/lib/data/store';
import { daysHeld, heldLabel, shortDate } from '@/lib/inventory';
import { AssignToolModal, ReturnToolModal } from '../../inventario/_components/ToolActionModals';
import { NO_PERMISSION, ToolThumb, conditionLabel } from '../../inventario/_components/shared';
import { CardHead } from './detail-parts';

/** «Herramienta de la empresa» del técnico: lo que tiene ahora + historial, con asignar/devolver. */
export function CompanyToolsCard({ techId }: { techId: string }) {
  useExtras(s => s.companyTools);
  useExtras(s => s.toolAssignments);
  const missing = useExtras(s => s.unavailable.companyTools || s.unavailable.toolAssignments);
  const tools = useExtras(s => s.companyTools);
  const canEdit = useAuth().can('inventario');
  const [pick, setPick] = useState(false);
  const [pickId, setPickId] = useState<string | null>(null);
  const [assignId, setAssignId] = useState<string | null>(null);
  const [returnId, setReturnId] = useState<string | null>(null);
  useEffect(() => {
    void loadExtras();
  }, []);
  const all = getTechToolAssignments(techId);
  const current = all.filter(a => a.returned_at === null);
  const past = all.filter(a => a.returned_at !== null);
  const available = tools.filter(t => t.status === 'available');
  const lock = canEdit ? undefined : NO_PERMISSION;

  return (
    <Card padded className="animate-up">
      <CardHead
        title="Herramienta de la empresa"
        action={
          !missing && (
            <Button size="sm" variant="secondary" icon={Plus} disabled={!canEdit} title={lock} onClick={() => { setPickId(null); setPick(true); }}>
              Asignar
            </Button>
          )
        }
      />
      {missing ? (
        <p className="font-sans text-[13px] text-muted">El inventario aún no está disponible en este entorno.</p>
      ) : all.length === 0 ? (
        <p className="font-sans text-[13px] text-muted">No tiene herramienta de la empresa asignada.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {current.length > 0 && (
            <ul className="flex flex-col">
              {current.map(a => {
                const t = getCompanyTool(a.tool_id);
                if (!t) return null;
                return (
                  <li key={a.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-divider py-3 first:border-t-0 first:pt-0">
                    <ToolThumb path={t.photo_path} size={40} />
                    <div className="min-w-0 flex-1 basis-40">
                      <Link href={`/inventario/${t.id}`} className="font-sans text-[13.5px] font-semibold text-navy hover:text-primary">
                        {t.name}
                      </Link>
                      <div className="font-sans text-[12.5px] text-muted">
                        <span className="font-mono text-[12px] text-body">{t.serial_or_code}</span> · desde {shortDate(a.assigned_at)} ({heldLabel(daysHeld(a.assigned_at))}) · {conditionLabel(a.assigned_condition)}
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" icon={RotateCcw} disabled={!canEdit} title={lock} onClick={() => setReturnId(t.id)}>
                      Devolver
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
          {past.length > 0 && (
            <div>
              <div className="mb-1.5 flex items-center gap-2 font-sans text-[12px] font-semibold text-muted">
                Historial <Badge>{past.length}</Badge>
              </div>
              <ul className="flex flex-col">
                {past.map(a => (
                  <li key={a.id} className="border-t border-divider py-2 font-sans text-[12.5px] text-muted first:border-t-0">
                    <Link href={`/inventario/${a.tool_id}`} className="font-semibold text-navy hover:text-primary">
                      {getCompanyTool(a.tool_id)?.name ?? 'Herramienta'}
                    </Link>{' '}
                    · {shortDate(a.assigned_at)} → {shortDate(a.returned_at)} · {conditionLabel(a.returned_condition)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <Modal
        open={pick}
        onClose={() => setPick(false)}
        icon={Building2}
        title="Asignar herramienta"
        description="Elige una herramienta disponible del inventario."
        footer={
          <>
            <Button variant="secondary" onClick={() => setPick(false)}>
              Cancelar
            </Button>
            <Button
              disabled={!pickId}
              onClick={() => {
                setAssignId(pickId);
                setPick(false);
              }}
            >
              Continuar
            </Button>
          </>
        }
      >
        {available.length === 0 ? (
          <p className="font-sans text-[13px] text-muted">No hay herramienta disponible en el inventario.</p>
        ) : (
          <Select
            options={available.map(t => ({ value: t.id, label: t.name, hint: t.serial_or_code }))}
            value={pickId}
            onChange={setPickId}
            placeholder="Elige una herramienta"
            aria-label="Herramienta disponible"
          />
        )}
      </Modal>
      <AssignToolModal toolId={assignId} fixedTechId={techId} onClose={() => setAssignId(null)} />
      <ReturnToolModal toolId={returnId} onClose={() => setReturnId(null)} />
    </Card>
  );
}
