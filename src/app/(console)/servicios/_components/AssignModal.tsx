'use client';

import { useEffect, useMemo, useState } from 'react';
import { Ban, MapPin, Star, UserCog, Wrench } from 'lucide-react';
import { Badge, Button, EmptyState, Input, Modal, Textarea } from '@/components/ds';
import {
  getTechToolViews,
  loadExtras,
  suggestTechnicians,
  useExtras,
  type TechSuggestion,
} from '@/lib/data/store';
import { formatDistance } from '@/lib/emergency';
import { toolsForCategory } from '@/lib/tools';
import { TechTypeBadge } from '../../tecnicos/_components/TechTypeParts';
import { Avatar } from './shared';

/** Herramientas del técnico para la categoría del servicio (chips compactos, «+N»). */
export function ToolChips({ techId, categoryId }: { techId: string; categoryId?: string | null }) {
  const tools = toolsForCategory(getTechToolViews(techId), categoryId);
  if (tools.length === 0) return null;
  const MAX = 3;
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1" title={tools.map(t => t.name).join(' · ')}>
      {tools.slice(0, MAX).map(t => (
        <span
          key={t.rowId}
          className="inline-flex max-w-full items-center gap-1 rounded-full bg-tint px-2 py-0.5 font-sans text-[11px] text-body"
        >
          <Wrench size={10} className="flex-shrink-0 text-faint" aria-hidden />
          <span className="truncate">{t.name}</span>
        </span>
      ))}
      {tools.length > MAX && (
        <span className="font-sans text-[11px] font-semibold text-muted">+{tools.length - MAX}</span>
      )}
    </div>
  );
}

/**
 * Asignar / reasignar técnico. Las sugerencias vienen de
 * admin_suggest_technicians (KYC aprobado, cubren la categoría y la zona;
 * disponibles primero, luego cercanía y calificación) y se enriquecen con tipo
 * de técnico y herramientas de la categoría.
 */
export function AssignModal({
  open,
  onClose,
  onSelect,
  orderId,
  categoryId,
  mode,
  busy,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (userId: string, name: string) => void;
  orderId: string;
  categoryId?: string | null;
  mode: 'assign' | 'reassign';
  busy?: boolean;
}) {
  useExtras(s => s.techTools);
  useExtras(s => s.toolCatalog);
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<TechSuggestion[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open) return;
    void loadExtras();
    let alive = true;
    setRows(null);
    setError(false);
    setQ('');
    suggestTechnicians(orderId).then(
      r => alive && setRows(r),
      e => {
        console.error('[assign] sugerencias', e);
        if (alive) setError(true);
      },
    );
    return () => {
      alive = false;
    };
  }, [open, orderId]);

  const list = useMemo(
    () =>
      (rows ?? []).filter(r =>
        r.display_name.toLowerCase().includes(q.trim().toLowerCase()),
      ),
    [rows, q],
  );
  const reassign = mode === 'reassign';

  return (
    <Modal
      open={open}
      onClose={() => !busy && onClose()}
      dismissible={!busy}
      title={reassign ? 'Reasignar técnico' : 'Asignar técnico'}
      description="Aprobados que cubren la categoría y la zona; los disponibles primero, luego los más cercanos."
      icon={UserCog}
      width={560}
    >
      <Input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Buscar técnico"
        aria-label="Buscar técnico"
        wrapperClassName="mb-3"
      />
      {error ? (
        <EmptyState compact kind="no-results" title="No pudimos cargar las sugerencias" description="Cierra y vuelve a abrir para reintentar." />
      ) : rows === null ? (
        <p className="py-8 text-center text-[13px] text-muted">Buscando técnicos…</p>
      ) : list.length === 0 ? (
        <EmptyState
          compact
          kind="no-results"
          title="No hay técnicos que cubran esta solicitud"
          description="Ninguno aprobado cubre la categoría. Revisa Técnicos o Regiones."
        />
      ) : (
        <ul className="flex max-h-[min(380px,55vh)] flex-col gap-2 overflow-y-auto" aria-label="Técnicos sugeridos">
          {list.map(t => (
            <li key={t.technician_id}>
              <button
                type="button"
                disabled={busy}
                onClick={() => onSelect(t.technician_id, t.display_name)}
                className="flex w-full items-start gap-3 rounded-box border border-line bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-tint disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Avatar name={t.display_name} userId={t.technician_id} size={38} />
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-display text-[14px] font-bold text-navy">{t.display_name}</span>
                    <span className="sm:hidden"><TechTypeBadge techId={t.technician_id} short /></span>
                    <span className="hidden sm:inline"><TechTypeBadge techId={t.technician_id} /></span>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Star size={11} className="text-warning" fill="currentColor" />
                      {t.rating_avg > 0 ? t.rating_avg.toFixed(1) : 'nuevo'} · {t.rating_count} trabajos
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={11} aria-hidden />
                      {t.distance_m != null ? formatDistance(t.distance_m) : 'distancia n/d'}
                    </span>
                    <span>
                      {t.active_orders === 0
                        ? 'Sin servicios activos'
                        : `${t.active_orders} activo${t.active_orders === 1 ? '' : 's'}`}
                    </span>
                  </div>
                  <ToolChips techId={t.technician_id} categoryId={categoryId} />
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge tone={t.is_available ? 'success' : 'neutral'} dot>
                    {t.is_available ? 'Disponible' : 'Ocupado'}
                  </Badge>
                  {t.zone_match && <Badge tone="info">Su zona</Badge>}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

/** Rechazar una solicitud sin técnico: el motivo es obligatorio y se le muestra al cliente. */
export function RejectModal({
  open,
  onClose,
  onConfirm,
  busy,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  busy?: boolean;
}) {
  const [reason, setReason] = useState('');
  useEffect(() => {
    if (open) setReason('');
  }, [open]);
  const ok = reason.trim().length >= 3;
  return (
    <Modal
      open={open}
      onClose={() => !busy && onClose()}
      dismissible={!busy}
      title="Rechazar solicitud"
      icon={Ban}
      tone="danger"
      description="La solicitud se cancela y el cliente recibe el motivo. No se puede deshacer."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Volver
          </Button>
          <Button variant="destructive" loading={busy} disabled={!ok} onClick={() => onConfirm(reason.trim())}>
            Rechazar solicitud
          </Button>
        </>
      }
    >
      <label htmlFor="reject-reason" className="mb-1.5 block text-[13px] font-semibold text-navy">
        Motivo (obligatorio)
      </label>
      <Textarea
        id="reject-reason"
        value={reason}
        onChange={e => setReason(e.target.value)}
        rows={3}
        maxLength={300}
        placeholder="Ej. Por ahora no damos servicio en esa zona."
      />
    </Modal>
  );
}
