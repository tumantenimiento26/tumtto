'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Star, Users, Wallet } from 'lucide-react';
import { ErrorPage, ScreenSkeleton } from '@/components/ds';
import { useAuth } from '@/lib/auth';
import {
  getAllEvents,
  getAllPayments,
  getAllRequests,
  getCategories,
  fetchReportKpis,
  getMetrics,
  getPendingKyc,
  getAllDisputes,
  getProfile,
  getTechnicians,
  getUnassignedAlertMinutes,
  loadExtras,
  loadWorld,
  useExtras,
  useTick,
  useWorldFailed,
  useWorldReady,
  type ReportKpis,
} from '@/lib/data/store';
import {
  activity,
  buckets,
  categoryCounts,
  deltaPct,
  pipeline,
  rangeMs,
  sameTimeYesterdayDelta,
  series,
  shiftBuckets,
  sum,
  weightedRating,
  type DashMetric,
  type DashRange,
} from '@/lib/dashboard';
import { orderCode } from '@/lib/orderCode';
import { needsManualAssignment } from '@/lib/emergency';
import { awaitingBasePayment, isFailedCharge } from '@/lib/payments';
import { ageLabel, inUnassignedInbox, isUnassignedAlert } from '@/lib/unassigned';
import { DashBand, type BandKpi } from './_components/DashBand';
import { GmvChart } from './_components/GmvChart';
import { PipelineDonut } from './_components/PipelineDonut';
import {
  ATTENTION_ICON,
  AttentionList,
  CategoryBars,
  LiveActivity,
  RecentServices,
  type AttentionItem,
  type RecentRow,
} from './_components/Panels';
import { money } from './_components/shared';

/** Minutos en ruta/en sitio/trabajando sin actualización antes de avisar. */
const STUCK_MIN = 45;
/** Minutos que una solicitud espera técnico antes de avisar. */
const WAITING_MIN = 15;

const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0');
const pctLabel = (d: number | null) =>
  d == null ? null : `${d >= 0 ? '+' : '−'}${Math.abs(d).toFixed(1)}%`;

export default function DashboardPage() {
  const tick = useTick();
  const router = useRouter();
  const ready = useWorldReady();
  const failed = useWorldFailed();
  const { usuario } = useAuth();
  const [range, setRange] = useState<DashRange>('7d');
  const [metric, setMetric] = useState<DashMetric>('gmv');
  // GMV del periodo: misma definición que Reportes y Finanzas (RPC
  // admin_report_kpis); la serie por cubeta sigue saliendo de los pagos.
  const [report, setReport] = useState<ReportKpis | null>(null);
  // order_ratings reales (serie de calificación); el promedio ponderado sale de technicians.
  const orderRatings = useExtras(s => s.ratings);
  useEffect(() => {
    void loadExtras();
  }, []);
  useEffect(() => {
    if (!ready) return;
    let live = true;
    const now = Date.now();
    const from = buckets(range, now)[0].start;
    void fetchReportKpis(new Date(from), new Date(now)).then(k => live && setReport(k));
    return () => {
      live = false;
    };
  }, [range, ready, tick]);

  const data = useMemo(() => {
    const now = Date.now();
    const orders = getAllRequests();
    const payments = getAllPayments();
    const events = getAllEvents();
    const cats = getCategories();
    const techs = getTechnicians();
    const name = (id: string | null) =>
      (id && getProfile(id)?.full_name) || 'Técnico';
    const catOf = (id: string) => cats.find(c => c.id === id);

    const bks = buckets(range, now);
    const prevBks = shiftBuckets(bks, rangeMs(range));
    const from = bks[0].start;
    const inRange = (iso: string) => new Date(iso).getTime() >= from;
    const between = (iso: string, a: number, b: number) => {
      const t = new Date(iso).getTime();
      return t >= a && t < b;
    };

    // KPIs de la banda
    const m = getMetrics();
    const gmvSerie = series('gmv', bks, orders, payments);
    const gmvPrev = series('gmv', prevBks, orders, payments);
    const svcSerie = series('servicios', bks, orders, payments);
    const acceptedSerie = bks.map(
      b =>
        events.filter(
          e =>
            e.to_status === 'accepted' && between(e.created_at, b.start, b.end),
        ).length,
    );
    const rating = weightedRating(techs);
    const ratings = orderRatings.filter(r => !r.is_hidden).map(r => ({ stars: r.score, created_at: r.created_at }));
    const avgStars = (rs: { stars: number }[]) =>
      rs.length ? sum(rs.map(r => r.stars)) / rs.length : null;
    const ratingSerie = bks.map(
      b =>
        avgStars(ratings.filter(r => between(r.created_at, b.start, b.end))) ??
        rating.avg,
    );
    const curStars = avgStars(ratings.filter(r => inRange(r.created_at)));
    const prevStars = avgStars(
      ratings.filter(r => between(r.created_at, prevBks[0].start, from)),
    );
    const vsYesterday = sameTimeYesterdayDelta(orders, now);
    const gmvCur = report ? Number(report.current.gmv_cents) / 100 : sum(gmvSerie);
    const gmvDelta = report
      ? deltaPct(Number(report.current.gmv_cents), Number(report.previous.gmv_cents))
      : deltaPct(sum(gmvSerie), sum(gmvPrev));

    const kpis: BandKpi[] = [
      {
        label: 'Servicios activos',
        icon: Activity,
        value: m.active,
        format: n => String(Math.round(n)),
        spark: svcSerie,
        color: 'blue',
        delta: signed(vsYesterday),
        deltaUp: vsYesterday >= 0,
        note: 'solicitudes vs ayer a esta hora',
        onClick: () => router.push('/servicios'),
      },
      {
        label: 'GMV del periodo',
        icon: Wallet,
        value: gmvCur,
        format: n => money(n),
        spark: gmvSerie,
        color: 'green',
        delta: pctLabel(gmvDelta),
        deltaUp: (gmvDelta ?? 0) >= 0,
        note: gmvDelta == null ? 'sin periodo anterior' : 'vs periodo anterior',
        onClick: () => router.push('/finanzas'),
      },
      {
        label: 'Técnicos en línea',
        icon: Users,
        value: m.activeTechs,
        format: n => `${Math.round(n)} / ${m.totalTechs}`,
        spark: acceptedSerie,
        color: 'cyan',
        delta: m.totalTechs
          ? `${Math.round((m.activeTechs / m.totalTechs) * 100)}%`
          : null,
        deltaUp: true,
        note: 'de la red activa',
        onClick: () => router.push('/tecnicos'),
      },
      {
        label: 'Calificación media',
        icon: Star,
        value: rating.avg,
        format: n => (rating.count ? n.toFixed(1) : '—'),
        spark: ratingSerie,
        color: 'amber',
        delta:
          curStars != null && prevStars != null
            ? `${curStars >= prevStars ? '+' : '−'}${Math.abs(curStars - prevStars).toFixed(1)}`
            : null,
        deltaUp: (curStars ?? 0) >= (prevStars ?? 0),
        note: `${rating.count} reseñas`,
        onClick: () => router.push('/reportes'),
      },
    ];

    // Requiere atención
    const attention: AttentionItem[] = [];
    // Emergencias sin técnico tras el tiempo límite: lo más urgente, siempre arriba.
    for (const o of orders)
      if (needsManualAssignment(o))
        attention.push({
          id: `emg-${o.id}`,
          ...ATTENTION_ICON.emergency,
          title: `Emergencia ${orderCode(o.id)} sin técnico`,
          sub: `${catOf(o.category_id)?.name ?? 'Servicio'} · ${o.municipality ?? 'ZMG'} · nadie aceptó, asígnala`,
          cta: 'Asignar',
          onClick: () => router.push(`/servicios/${o.id}?asignar=1`),
        });
    // Efectivo que no cuadra (técnico vs cliente): una sola tarjeta con el conteo.
    const cashReviews = orders.filter(o => o.cash_review_open);
    if (cashReviews.length)
      attention.push({
        id: 'cash-reviews',
        ...ATTENTION_ICON.cash,
        title: `${cashReviews.length} ${cashReviews.length === 1 ? 'revisión' : 'revisiones'} de efectivo`,
        sub: `${cashReviews.map(o => orderCode(o.id)).slice(0, 3).join(', ')}${cashReviews.length > 3 ? '…' : ''} · el cliente y el técnico no coinciden`,
        cta: 'Revisar',
        onClick: () => router.push('/finanzas?tab=rev'),
      });
    // Solicitudes sin técnico (el cliente pidió que Tumtto asigne) que superan unassigned_alert_minutes.
    const alertMin = getUnassignedAlertMinutes();
    for (const o of [...orders]
      .filter(x => !needsManualAssignment(x) && isUnassignedAlert(x, alertMin, now))
      .sort((a, b) => a.created_at.localeCompare(b.created_at)))
      attention.push({
        id: `unas-${o.id}`,
        ...ATTENTION_ICON.unassigned,
        title: `${orderCode(o.id)} sin técnico · ${ageLabel(o.created_at, now)}`,
        sub: `${catOf(o.category_id)?.name ?? 'Servicio'} · ${o.municipality ?? 'ZMG'} · supera ${alertMin} min, asígnala o recházala`,
        cta: 'Asignar',
        onClick: () => router.push(`/servicios/${o.id}?asignar=1`),
      });
    for (const t of getPendingKyc())
      attention.push({
        id: `kyc-${t.id}`,
        ...ATTENTION_ICON.kyc,
        title: `KYC pendiente · ${name(t.id)}`,
        sub: 'Revisa identidad, antecedentes y datos de cobro',
        cta: 'Revisar',
        onClick: () => router.push(`/tecnicos/${t.id}`),
      });
    for (const d of getAllDisputes())
      if (d.status === 'open' || d.status === 'in_review')
        attention.push({
          id: `disp-${d.id}`,
          ...ATTENTION_ICON.dispute,
          title: `Disputa en ${orderCode(d.service_order_id)}`,
          sub: d.reason,
          cta: 'Resolver',
          onClick: () => router.push('/soporte'),
        });
    for (const o of orders) {
      const mins = (now - new Date(o.updated_at).getTime()) / 60_000;
      if (
        ['enroute', 'onsite', 'working'].includes(o.status) &&
        mins > STUCK_MIN
      )
        attention.push({
          id: `stuck-${o.id}`,
          ...ATTENTION_ICON.stuck,
          title: `${orderCode(o.id)} lleva ${Math.round(mins)} min sin avance`,
          sub: `${catOf(o.category_id)?.name ?? 'Servicio'} · ${name(o.technician_id)}`,
          cta: 'Ver',
          onClick: () => router.push(`/servicios/${o.id}`),
        });
      if (
        o.status === 'requested' &&
        !awaitingBasePayment(o) &&
        !inUnassignedInbox(o) &&
        o.priority !== 'emergency' &&
        (now - new Date(o.created_at).getTime()) / 60_000 > WAITING_MIN
      )
        attention.push({
          id: `wait-${o.id}`,
          ...ATTENTION_ICON.waiting,
          title: `${orderCode(o.id)} sin técnico`,
          sub: `Espera asignación desde las ${new Date(
            o.created_at,
          ).toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
          })}`,
          cta: 'Asignar',
          onClick: () => router.push(`/servicios/${o.id}`),
        });
    }
    for (const p of payments)
      if (isFailedCharge(p))
        attention.push({
          id: `pay-${p.id}`,
          ...ATTENTION_ICON.payment,
          title: `${p.kind === 'base_fee' ? 'Tarifa base rechazada' : 'Pago rechazado'} · ${orderCode(p.service_order_id)}`,
          sub: p.kind === 'base_fee' ? 'El cliente puede reintentar o puedes exonerarla' : 'Revisa el método de pago del cliente',
          cta: 'Ver',
          onClick: () => router.push(`/servicios/${p.service_order_id}`),
        });

    const recent: RecentRow[] = orders.slice(0, 6).map(o => ({
      id: o.id,
      cliente: getProfile(o.client_id)?.full_name ?? 'Cliente',
      categoria: catOf(o.category_id)?.name ?? 'Servicio',
      slug: catOf(o.category_id)?.slug ?? '',
      tecnico: o.technician_id ? name(o.technician_id) : null,
      ts: o.updated_at,
      status: o.status,
      totalPesos:
        o.quoted_total_cents != null ? o.quoted_total_cents / 100 : null,
    }));

    return {
      kpis,
      chart: {
        labels: bks.map(b => b.label),
        values: series(metric, bks, orders, payments),
        prev: series(metric, prevBks, orders, payments),
      },
      pipeline: pipeline(orders),
      attention,
      activity: activity(events, orders, {
        name,
        cat: id => catOf(id)?.name ?? 'servicio',
      }),
      cats: categoryCounts(
        orders.filter(o => inRange(o.created_at)),
        cats,
      ),
      recent,
    };
    // `tick` fuerza el recálculo con cada recarga del snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, range, metric, router, report, orderRatings]);

  if (failed && !ready)
    return (
      <ErrorPage
        kind="500"
        primary={{ label: 'Reintentar', onClick: () => void loadWorld(true) }}
      />
    );
  if (!ready) return <ScreenSkeleton kind="dashboard" />;

  const firstName = usuario?.full_name?.split(' ')[0] ?? '';

  return (
    <div className="mx-auto flex max-w-[1360px] flex-col gap-3.5">
      <DashBand
        name={firstName}
        range={range}
        onRange={setRange}
        kpis={data.kpis}
      />

      <div className="flex flex-wrap gap-3.5">
        <div className="min-w-0 flex-[2_1_580px]">
          <GmvChart
            metric={metric}
            onMetric={setMetric}
            labels={data.chart.labels}
            values={data.chart.values}
            prev={data.chart.prev}
          />
        </div>
        <div className="min-w-0 flex-[1_1_340px]">
          <PipelineDonut
            segs={data.pipeline}
            onOpen={() => router.push('/servicios')}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-stretch gap-3.5">
        <div className="min-w-0 flex-[1_1_340px]">
          <AttentionList items={data.attention} />
        </div>
        <div className="min-w-0 flex-[1_1_340px]">
          <LiveActivity
            items={data.activity}
            onOpen={href => router.push(href)}
          />
        </div>
        <div className="min-w-0 flex-[1_1_340px]">
          <CategoryBars
            rows={data.cats}
            onOpenReports={() => router.push('/reportes')}
            onOpenCategory={() => router.push('/servicios')}
          />
        </div>
      </div>

      <RecentServices
        rows={data.recent}
        onOpen={id => router.push(`/servicios/${id}`)}
        onAll={() => router.push('/servicios')}
      />
    </div>
  );
}
