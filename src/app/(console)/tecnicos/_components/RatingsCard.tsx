'use client';

import { UserIcon } from '@/components/profile-icon';
import { useState } from 'react';
import Link from 'next/link';
import { EyeOff, Eye, Star } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Field, Modal, Tabs, Textarea } from '@/components/ds';
import { useAction } from '@/components/use-action';
import { useAuth } from '@/lib/auth';
import {
  getModeratorName,
  getProfile,
  getTechRatings,
  hideRating,
  restoreRating,
  useExtras,
  type OrderRating,
} from '@/lib/data/store';
import { orderCode } from '@/lib/orderCode';
import {
  RATING_REASONS,
  filterRatings,
  ratingNoteRequired,
  ratingReasonLabel,
  type RatingFilter,
  type RatingReason,
} from '@/lib/ratingModeration';
import { CardHead, fecha } from './detail-parts';

const Stars = ({ score }: { score: number }) => (
  <span className="inline-flex items-center gap-0.5 text-warning" aria-label={`${score} de 5`}>
    {Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={12} className={i < score ? 'fill-current' : 'opacity-30'} />
    ))}
  </span>
);

/** Todas las calificaciones del técnico (incluidas ocultas) con moderación. */
export function RatingsCard({ techId }: { techId: string }) {
  useExtras(s => s.ratings);
  const unavailable = useExtras(s => s.unavailable.ratings);
  const { can } = useAuth();
  const canModerate = can('calificaciones');
  const { busy, run } = useAction();
  const [filter, setFilter] = useState<RatingFilter>('all');
  const [hiding, setHiding] = useState<OrderRating | null>(null);
  const [restoring, setRestoring] = useState<OrderRating | null>(null);
  const [reason, setReason] = useState<RatingReason>('offensive');
  const [note, setNote] = useState('');
  const [touched, setTouched] = useState(false);

  const all = getTechRatings(techId);
  const rows = filterRatings(all, filter);
  const hiddenCount = filterRatings(all, 'hidden').length;
  const noteMissing = ratingNoteRequired(reason) && !note.trim();

  const openHide = (r: OrderRating) => {
    setReason('offensive');
    setNote('');
    setTouched(false);
    setHiding(r);
  };

  return (
    <Card padded>
      <CardHead title="Calificaciones" />
      {unavailable ? (
        <p className="font-sans text-[13px] text-muted">
          Las calificaciones por servicio aún no están disponibles en este entorno.
        </p>
      ) : all.length === 0 ? (
        <EmptyState kind="first-use" title="Sin calificaciones" description="Aparecerán cuando los clientes califiquen sus servicios." compact />
      ) : (
        <>
          <Tabs<RatingFilter>
            className="mb-1"
            value={filter}
            onChange={setFilter}
            tabs={[
              { value: 'all', label: 'Todas', count: all.length },
              { value: 'visible', label: 'Visibles', count: all.length - hiddenCount },
              { value: 'hidden', label: 'Ocultas', count: hiddenCount },
            ]}
          />
          <div className="max-h-[560px] overflow-y-auto">
            {rows.length === 0 && (
              <p className="py-4 font-sans text-[13px] text-muted">No hay calificaciones en este filtro.</p>
            )}
            {rows.map(r => {
              const hidden = !!r.is_hidden;
              return (
                <div key={r.id} className="border-t border-divider py-3 first:border-t-0">
                  <div className={`flex flex-wrap items-start justify-between gap-x-3 gap-y-2 ${hidden ? 'opacity-60' : ''}`}>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <Stars score={r.score} />
                        <span className="inline-flex items-center gap-1.5 font-sans text-[13px] font-semibold text-navy">
                          <UserIcon userId={r.reviewer_id} size={20} />
                          {getProfile(r.reviewer_id)?.full_name ?? 'Cliente'}
                        </span>
                      </div>
                      {r.comment ? (
                        <p className="mt-1 font-sans text-[13px] text-body">{r.comment}</p>
                      ) : (
                        <p className="mt-1 font-sans text-[13px] italic text-faint">Sin comentario</p>
                      )}
                      <p className="mt-0.5 font-mono text-[11px] text-faint">
                        <Link href={`/servicios/${r.service_order_id}`} className="text-primary hover:underline">
                          {orderCode(r.service_order_id)}
                        </Link>{' '}
                        · {fecha(r.created_at)}
                      </p>
                    </div>
                  </div>
                  {hidden && (
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <Badge tone="warning">
                        <EyeOff size={11} className="mr-1" />
                        Oculta · {ratingReasonLabel(r.hidden_reason)}
                      </Badge>
                      <span className="font-mono text-[11px] text-faint">
                        {getModeratorName(r.hidden_by)}
                        {r.hidden_at ? ` · ${fecha(r.hidden_at)}` : ''}
                      </span>
                      {r.hidden_note && (
                        <p className="w-full font-sans text-[12.5px] text-muted">{r.hidden_note}</p>
                      )}
                    </div>
                  )}
                  {canModerate && (
                    <div className="mt-2">
                      {hidden ? (
                        <Button size="sm" variant="secondary" icon={Eye} disabled={!!busy} onClick={() => setRestoring(r)}>
                          Restaurar
                        </Button>
                      ) : (
                        <Button size="sm" variant="secondary" icon={EyeOff} disabled={!!busy} onClick={() => openHide(r)}>
                          Ocultar
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <Modal
        open={!!hiding}
        onClose={() => !busy && setHiding(null)}
        dismissible={!busy}
        width={520}
        tone="danger"
        icon={EyeOff}
        title="Ocultar calificación"
        description="Dejará de contar en el promedio y de mostrarse a clientes. No se borra: puedes restaurarla."
        footer={
          <>
            <Button variant="secondary" disabled={!!busy} onClick={() => setHiding(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              loading={busy === 'hide'}
              onClick={async () => {
                if (!hiding) return;
                if (noteMissing) return setTouched(true);
                const ok = await run('hide', () => hideRating(hiding.id, reason, note), 'Calificación ocultada');
                if (ok) setHiding(null);
              }}
            >
              Ocultar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {hiding && (
            <div className="rounded-md border border-line bg-panel p-3">
              <Stars score={hiding.score} />
              <p className="mt-1 font-sans text-[13px] text-body">{hiding.comment ?? 'Sin comentario'}</p>
            </div>
          )}
          <div>
            <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">Motivo</div>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Motivo">
              {RATING_REASONS.map(r => (
                <button
                  key={r.value}
                  type="button"
                  role="radio"
                  aria-checked={reason === r.value}
                  onClick={() => setReason(r.value)}
                  className={`rounded-full border px-3 py-1.5 font-sans text-[12.5px] font-semibold transition-colors ${
                    reason === r.value
                      ? 'border-error-line bg-error-soft text-error'
                      : 'border-line bg-card text-muted hover:bg-panel'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <Field
            label={ratingNoteRequired(reason) ? 'Nota (obligatoria)' : 'Nota (opcional)'}
            hint="Queda en la bitácora del técnico."
            error={touched && noteMissing ? 'Explica el motivo para «Otro».' : null}
            required={ratingNoteRequired(reason)}
          >
            <Textarea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Contexto para el equipo…" />
          </Field>
        </div>
      </Modal>

      <Modal
        open={!!restoring}
        onClose={() => !busy && setRestoring(null)}
        dismissible={!busy}
        icon={Eye}
        title="¿Restaurar calificación?"
        description="Volverá a contar en el promedio del técnico y a mostrarse a los clientes."
        footer={
          <>
            <Button variant="secondary" disabled={!!busy} onClick={() => setRestoring(null)}>
              Cancelar
            </Button>
            <Button
              loading={busy === 'restore'}
              onClick={async () => {
                if (!restoring) return;
                const ok = await run('restore', () => restoreRating(restoring.id), 'Calificación restaurada');
                if (ok) setRestoring(null);
              }}
            >
              Restaurar
            </Button>
          </>
        }
      />
    </Card>
  );
}
