'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { create } from 'zustand';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Textarea,
  toast,
  type Tone,
} from '@/components/ds';
import { supabase } from '@/lib/supabase';
import { MOCK } from '@/lib/mock';
import { getProfile } from '@/lib/data/store';
import { timeAgo } from '@/lib/data/notifications';

// Soporte › Reportes: mensajes, reseñas o usuarios reportados desde la app
// (App Store 1.2 / Play UGC). Para retirar una reseña se usa la moderación de
// calificaciones del técnico; aquí solo se triagea el reporte.

type Report = {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  service_order_id: string | null;
  reason: string;
  details: string | null;
  status: 'open' | 'resolved' | 'dismissed';
  admin_note: string | null;
  created_at: string;
  message: { body: string } | null;
  rating: { score: number; comment: string | null } | null;
};

export const REPORT_REASON_LABEL: Record<string, string> = {
  offensive: 'Contenido ofensivo',
  harassment: 'Acoso',
  spam: 'Spam',
  fraud: 'Fraude',
  other: 'Otro',
};
const STATUS: Record<Report['status'], [string, Tone]> = {
  open: ['Abierto', 'danger'],
  resolved: ['Resuelto', 'success'],
  dismissed: ['Descartado', 'neutral'],
};

export const useReports = create<{
  reports: Report[];
  loaded: boolean;
  failed: boolean;
}>(() => ({
  reports: [],
  loaded: false,
  failed: false,
}));

export async function loadReports() {
  if (MOCK) return void useReports.setState({ loaded: true });
  const { data, error } = await supabase
    .from('content_reports')
    .select('*, message:messages(body), rating:order_ratings(score, comment)')
    .order('created_at', { ascending: false })
    .limit(300);
  if (error) {
    console.warn('[data] content_reports no disponible', error);
    return void useReports.setState({ failed: true, loaded: true });
  }
  useReports.setState({
    reports: (data ?? []) as Report[],
    loaded: true,
    failed: false,
  });
}

const name = (id: string) => getProfile(id)?.full_name || 'Usuario';

export function ReportsView() {
  const { reports, loaded, failed } = useReports();
  useEffect(() => {
    void loadReports();
  }, []);

  if (failed || !loaded || reports.length === 0)
    return (
      <Card padded>
        {!loaded ? (
          <p className="font-sans text-[13px] text-muted">Cargando reportes…</p>
        ) : (
          <EmptyState
            kind={failed ? 'no-results' : 'all-clear'}
            title={
              failed ? 'No se pudieron cargar los reportes' : 'Sin reportes'
            }
            description={
              failed
                ? 'Revisa tu permiso de Soporte o reintenta en un momento.'
                : 'Los reportes de mensajes, reseñas y usuarios hechos desde la app aparecerán aquí.'
            }
          />
        )}
      </Card>
    );

  return (
    <div className="flex flex-col gap-3">
      {reports.map(r => (
        <ReportCard key={r.id} report={r} />
      ))}
    </div>
  );
}

function ReportCard({ report: r }: { report: Report }) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const role = getProfile(r.reported_user_id)?.role;
  const [label, tone] = STATUS[r.status];

  const close = async (status: 'resolved' | 'dismissed') => {
    setBusy(true);
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('content_reports')
      .update({
        status,
        admin_note: note.trim() || null,
        resolved_by: auth.user?.id ?? null,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', r.id);
    setBusy(false);
    if (error)
      return void toast.error(
        'No se pudo actualizar el reporte',
        error.message,
      );
    toast.success(
      status === 'resolved' ? 'Reporte resuelto' : 'Reporte descartado',
    );
    void loadReports();
  };

  return (
    <Card padded>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-primary">
          {REPORT_REASON_LABEL[r.reason] ?? r.reason}
          {r.message ? ' · mensaje' : r.rating ? ' · reseña' : ' · usuario'}
        </span>
        <Badge tone={tone}>{label}</Badge>
      </div>
      <p className="mt-1.5 font-sans text-[13.5px] text-body">
        <strong className="text-navy">{name(r.reporter_id)}</strong> reportó a{' '}
        <Link
          href={`/${role === 'technician' ? 'tecnicos' : 'clientes'}/${r.reported_user_id}`}
          className="font-semibold text-primary hover:underline"
        >
          {name(r.reported_user_id)}
        </Link>
        {r.service_order_id && (
          <>
            {' '}
            en{' '}
            <Link
              href={`/servicios/${r.service_order_id}`}
              className="font-semibold text-primary hover:underline"
            >
              este servicio
            </Link>
          </>
        )}{' '}
        · <span className="text-faint">{timeAgo(r.created_at)}</span>
      </p>
      {(r.message || r.rating) && (
        <blockquote className="mt-2 border-l-2 border-line pl-3 font-sans text-[13px] text-muted">
          {r.message?.body ?? `${r.rating?.score}★ ${r.rating?.comment ?? ''}`}
        </blockquote>
      )}
      {r.details && (
        <p className="mt-2 font-sans text-[13px] text-body">{r.details}</p>
      )}
      {r.status === 'open' ? (
        <div className="mt-3 flex flex-col gap-2">
          <Textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Nota interna (acción tomada)…"
            aria-label="Nota interna"
            rows={2}
          />
          <div className="flex gap-2">
            <Button loading={busy} onClick={() => void close('resolved')}>
              Resolver
            </Button>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => void close('dismissed')}
            >
              Descartar
            </Button>
          </div>
        </div>
      ) : (
        r.admin_note && (
          <p className="mt-2 font-sans text-[12.5px] text-faint">
            Nota: {r.admin_note}
          </p>
        )
      )}
    </Card>
  );
}
