'use client';

import { useEffect, useState } from 'react';
import { Clock, Siren, UserCheck } from 'lucide-react';
import { Badge, Card, EmptyState, Kicker } from '@/components/ds';
import { fetchEmergencyHistory, useTick } from '@/lib/data/store';
import {
  DISPATCH_LABEL,
  formatDistance,
  formatDuration,
  summarizeRounds,
  type EmergencyHistory,
} from '@/lib/emergency';
import { fmtDateTime } from '@/lib/dates';

const time = (iso: string) =>
  fmtDateTime(iso, { hour: '2-digit', minute: '2-digit', second: '2-digit' });

/**
 * «Despacho de emergencia» del detalle: hora de solicitud, rondas (radio),
 * técnicos notificados (nombre, distancia, hora), quién aceptó y el tiempo de
 * respuesta. Lee admin_emergency_history (maqueta: lo calcula del log demo).
 */
export function EmergencyDispatchCard({
  orderId,
  dispatchStatus,
}: {
  orderId: string;
  dispatchStatus: string | null;
}) {
  const tick = useTick();
  const [h, setH] = useState<EmergencyHistory | null | undefined>(undefined);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchEmergencyHistory(orderId).then(
      r => {
        if (alive) {
          setH(r);
          setError(false);
        }
      },
      () => alive && setError(true),
    );
    return () => {
      alive = false;
    };
    // `tick`: tras reasignar cambia quién aceptó.
  }, [orderId, tick]);

  return (
    <Card padded className="border-error-line">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-[16px] font-bold text-navy">
          <Siren size={17} className="text-error" aria-hidden />
          Despacho de emergencia
        </h2>
        {dispatchStatus && (
          <Badge tone={dispatchStatus === 'timed_out' ? 'danger' : dispatchStatus === 'assigned' ? 'success' : 'warning'} dot>
            {DISPATCH_LABEL[dispatchStatus] ?? dispatchStatus}
          </Badge>
        )}
      </div>

      {error ? (
        <p className="text-[13px] text-error">No pudimos cargar el historial del despacho.</p>
      ) : h === undefined ? (
        <p className="text-[13px] text-muted">Cargando historial…</p>
      ) : h === null ? (
        <EmptyState compact kind="first-use" title="Sin historial de despacho" />
      ) : (
        <>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Kicker className="mb-1">Solicitada</Kicker>
              <dd className="flex items-center gap-1.5 font-mono text-[13px] text-navy">
                <Clock size={13} className="text-muted" aria-hidden />
                {fmtDateTime(h.requested_at, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </dd>
            </div>
            <div>
              <Kicker className="mb-1">Aceptó</Kicker>
              <dd className="flex items-center gap-1.5 text-[13.5px] font-semibold text-navy">
                {h.accepted_by_name ? (
                  <>
                    <UserCheck size={14} className="text-success" aria-hidden />
                    {h.accepted_by_name}
                  </>
                ) : (
                  <span className="font-normal text-muted">Nadie todavía</span>
                )}
              </dd>
            </div>
            <div>
              <Kicker className="mb-1">Tiempo de respuesta</Kicker>
              <dd className="font-mono text-[13px] font-semibold text-navy">
                {h.response_seconds != null ? formatDuration(h.response_seconds) : '—'}
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-[12.5px] text-muted">{summarizeRounds(h.rounds)}</p>
          {h.rounds.length > 0 && (
            <ol className="mt-2 flex flex-col gap-2.5">
              {h.rounds.map(r => (
                <li key={r.round} className="rounded-box border border-line bg-panel p-3">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="font-display text-[13px] font-bold text-navy">
                      Ronda {r.round}
                    </span>
                    <span className="font-mono text-[11.5px] text-muted">
                      radio {formatDistance(r.radius_m)}
                    </span>
                  </div>
                  <ul className="flex flex-col divide-y divide-divider">
                    {r.notified.map(n => {
                      const won = n.technician_id === h.accepted_by_id;
                      return (
                        <li
                          key={n.technician_id}
                          className="flex flex-wrap items-center gap-x-3 gap-y-0.5 py-1.5 text-[13px]"
                        >
                          <span className="min-w-0 flex-1 truncate font-semibold text-navy">
                            {n.name}
                          </span>
                          {won && <Badge tone="success">Aceptó</Badge>}
                          <span className="font-mono text-[12px] text-muted">
                            {formatDistance(n.distance_m)}
                          </span>
                          <span className="font-mono text-[12px] text-muted">
                            {time(n.notified_at)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </Card>
  );
}
