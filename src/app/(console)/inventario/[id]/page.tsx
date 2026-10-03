'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Ban, CheckCircle2, ChevronLeft, Pencil, RotateCcw, UserPlus, Wrench } from 'lucide-react';
import { Badge, Button, Card, ErrorPage, ScreenSkeleton } from '@/components/ds';
import { useAction } from '@/components/use-action';
import { useAuth } from '@/lib/auth';
import {
  getCategories,
  getCatalogTool,
  getCompanyTool,
  getNotes,
  getToolAssignments,
  loadExtras,
  loadWorld,
  personName,
  setCompanyToolRepair,
  useExtras,
  useTick,
  useWorldFailed,
  useWorldReady,
} from '@/lib/data/store';
import {
  RETIRE_REASON_LABEL,
  daysHeld,
  formatMxn,
  heldLabel,
  shortDate,
  toolActions,
} from '@/lib/inventory';
import { CardHead, KV, fecha } from '../../tecnicos/_components/detail-parts';
import { NO_PERMISSION, StatusBadge, ToolThumb, conditionLabel } from '../_components/shared';
import { ToolFormSheet } from '../_components/ToolFormSheet';
import { AssignToolModal, RetireToolModal, ReturnToolModal } from '../_components/ToolActionModals';

export default function ToolDetailPage() {
  useTick();
  const { id } = useParams<{ id: string }>();
  const ready = useWorldReady();
  const failed = useWorldFailed();
  const loaded = useExtras(s => s.loaded);
  useExtras(s => s.companyTools);
  useExtras(s => s.toolAssignments);
  const canEdit = useAuth().can('inventario');
  const { busy, run } = useAction();
  const [edit, setEdit] = useState(false);
  const [assign, setAssign] = useState(false);
  const [ret, setRet] = useState(false);
  const [retire, setRetire] = useState(false);

  useEffect(() => {
    void loadExtras();
  }, []);

  if (failed) return <ErrorPage kind="500" primary={{ label: 'Reintentar', onClick: () => void loadWorld(true) }} />;
  if (!ready || !loaded) return <ScreenSkeleton kind="detail" />;
  const tool = getCompanyTool(id);
  if (!tool) return <ErrorPage kind="404" primary={{ label: 'Volver a inventario', href: '/inventario' }} />;

  const a = toolActions(tool.status);
  const history = getToolAssignments(tool.id);
  const current = history.find(h => h.returned_at === null) ?? null;
  const cat = tool.category_id ? (getCategories().find(c => c.id === tool.category_id)?.name ?? '—') : 'General';
  const log = getNotes(tool.id);
  const lock = canEdit ? undefined : NO_PERMISSION;

  return (
    <div className="flex flex-col gap-4">
      <Link href="/inventario" className="inline-flex w-fit items-center gap-1 font-sans text-[13.5px] font-semibold text-primary hover:underline">
        <ChevronLeft size={16} /> Inventario
      </Link>

      <Card padded className="animate-up">
        <div className="flex flex-wrap items-center gap-4">
          <ToolThumb path={tool.photo_path} size={72} />
          <div className="min-w-0 flex-1 basis-56">
            <h1 className="font-display text-[24px] font-extrabold tracking-[-0.5px] text-navy">{tool.name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <StatusBadge status={tool.status} />
              <Badge>{cat}</Badge>
              <span className="font-mono text-[12.5px] text-muted">{tool.serial_or_code}</span>
            </div>
            {current && (
              <p className="mt-2 font-sans text-[13px] text-body">
                Con{' '}
                <Link href={`/tecnicos/${current.technician_id}`} className="font-semibold text-primary hover:underline">
                  {personName(current.technician_id) ?? 'Técnico'}
                </Link>{' '}
                desde {shortDate(current.assigned_at)} ({heldLabel(daysHeld(current.assigned_at))})
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {a.assign && (
              <Button icon={UserPlus} disabled={!canEdit} title={lock} onClick={() => setAssign(true)}>
                Asignar
              </Button>
            )}
            {a.return && (
              <Button icon={RotateCcw} disabled={!canEdit} title={lock} onClick={() => setRet(true)}>
                Registrar devolución
              </Button>
            )}
            {a.repairStart && (
              <Button
                variant="secondary"
                icon={Wrench}
                disabled={!canEdit || !!busy}
                title={lock}
                loading={busy === 'rep'}
                onClick={() => void run('rep', () => setCompanyToolRepair(tool.id, true), 'Enviada a reparación')}
              >
                Enviar a reparación
              </Button>
            )}
            {a.repairFinish && (
              <Button
                variant="approve"
                icon={CheckCircle2}
                disabled={!canEdit || !!busy}
                title={lock}
                loading={busy === 'rep'}
                onClick={() => void run('rep', () => setCompanyToolRepair(tool.id, false), 'Marcada como reparada')}
              >
                Marcar reparada
              </Button>
            )}
            {a.edit && (
              <Button variant="secondary" icon={Pencil} disabled={!canEdit} title={lock} onClick={() => setEdit(true)}>
                Editar
              </Button>
            )}
            {a.retire && (
              <Button variant="destructive" icon={Ban} disabled={!canEdit} title={lock} onClick={() => setRetire(true)}>
                Dar de baja
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card padded className="animate-up">
          <CardHead title="Datos" />
          <KV label="Marca" value={tool.brand ?? '—'} />
          <KV label="Modelo" value={tool.model ?? '—'} />
          <KV label="Serie / código" value={tool.serial_or_code} mono />
          <KV label="Categoría" value={cat} />
          <KV label="Catálogo ligado" value={getCatalogTool(tool.catalog_id)?.name ?? '—'} />
          <KV label="Adquirida" value={tool.acquired_on ? shortDate(`${tool.acquired_on}T12:00:00Z`) : '—'} />
          <KV label="Costo" value={formatMxn(tool.acquisition_cost_cents)} mono />
          {tool.status === 'retired' && (
            <>
              <KV label="Baja" value={`${tool.retired_reason ? RETIRE_REASON_LABEL[tool.retired_reason] : '—'} · ${shortDate(tool.retired_at)}`} />
              {tool.retired_note && <KV label="Nota de baja" value={tool.retired_note} />}
            </>
          )}
        </Card>

        <Card padded className="animate-up">
          <CardHead title="Historial de asignaciones" action={history.length > 0 && <Badge tone="info">{history.length}</Badge>} />
          {history.length === 0 ? (
            <p className="font-sans text-[13px] text-muted">Nunca ha sido asignada.</p>
          ) : (
            <ul className="flex flex-col">
              {history.map(h => (
                <li key={h.id} className="border-t border-divider py-3 first:border-t-0 first:pt-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/tecnicos/${h.technician_id}`} className="font-sans text-[13.5px] font-semibold text-navy hover:text-primary">
                      {personName(h.technician_id) ?? 'Técnico'}
                    </Link>
                    {!h.returned_at && <Badge tone="info">Vigente</Badge>}
                  </div>
                  <p className="mt-0.5 font-sans text-[12.5px] text-muted">
                    Entrega {shortDate(h.assigned_at)} · {conditionLabel(h.assigned_condition)}
                    {' → '}
                    {h.returned_at ? `Devolución ${shortDate(h.returned_at)} · ${conditionLabel(h.returned_condition)}` : 'sin devolver'}
                  </p>
                  {h.assign_note && <p className="mt-0.5 font-sans text-[12.5px] text-body">Entrega: {h.assign_note}</p>}
                  {h.return_note && <p className="mt-0.5 font-sans text-[12.5px] text-body">Devolución: {h.return_note}</p>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card padded className="animate-up">
        <CardHead title="Bitácora" />
        {log.length === 0 ? (
          <p className="font-sans text-[13px] text-muted">Sin eventos registrados.</p>
        ) : (
          <div className="flex flex-col">
            {log.map(n => (
              <div key={n.id} className="border-t border-divider py-2.5 first:border-t-0 first:pt-0">
                <p className="font-sans text-[13px] text-body">{n.text}</p>
                <p className="mt-0.5 font-mono text-[11px] text-faint">
                  {n.author} · {fecha(n.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ToolFormSheet open={edit} tool={tool} onClose={() => setEdit(false)} />
      <AssignToolModal toolId={assign ? tool.id : null} onClose={() => setAssign(false)} />
      <ReturnToolModal toolId={ret ? tool.id : null} onClose={() => setRet(false)} />
      <RetireToolModal toolId={retire ? tool.id : null} onClose={() => setRetire(false)} />
    </div>
  );
}
