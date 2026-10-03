'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Send, Check, Wallet, ExternalLink, X } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  ErrorPage,
  Kicker,
  Modal,
  PageHeader,
  ScreenSkeleton,
  Segmented,
  Tabs,
  toast,
  type DataColumn,
  PeriodFilters,
  periodLabel,
  Chip,
} from '@/components/ds';
import { exportCsv } from '@/components/admin';
import { useAction } from '@/components/use-action';
import {
  approvePayouts,
  fetchReportKpis,
  getAllLedger,
  getAllPayments,
  getProfile,
  getRequest,
  getSettingInt,
  getTechnician,
  loadExtras,
  loadWorld,
  rejectPayout,
  sendPayout,
  useExtras,
  useTick,
  useWorldFailed,
  useWorldReady,
  type PayoutRequest,
  type ReportKpis,
} from '@/lib/data/store';
import { orderCode } from '@/lib/orderCode';
import { fmtDate } from '@/lib/dates';
import { useAuth } from '@/lib/auth';
import { initials } from '@/lib/techConsole';
import { rangePreset, type DateRange } from '@/lib/calendar';
import {
  aggregate,
  bucketGoal,
  deltaLabel,
  methodSplit,
  monthlySummary,
  pctDelta,
  periodTotals,
  rangeBuckets,
  isWeekly,
} from '@/lib/finance';
import {
  KpiCard,
  MethodBreakdown,
  StackedBars,
  methodMeta,
  money,
  shortMoney,
} from './_components/fin-parts';

type Tab = 'tx' | 'po' | 'wal' | 'mes';
type MethodFilter = 'all' | 'card' | 'wallet' | 'oxxo' | 'cash';
const METHOD_OPTIONS: { value: MethodFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'wallet', label: 'Mercado Pago' },
  { value: 'oxxo', label: 'OXXO' },
  { value: 'cash', label: 'Efectivo' },
];

const PAY_STATUS: Record<string, { label: string; tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  paid: { label: 'Pagado', tone: 'success' },
  pending: { label: 'Pendiente', tone: 'warning' },
  authorized: { label: 'Autorizado', tone: 'info' },
  refunded: { label: 'Reembolsado', tone: 'danger' },
  failed: { label: 'Fallido', tone: 'danger' },
  cancelled: { label: 'Cancelado', tone: 'neutral' },
};
const PO_STATUS: Record<PayoutRequest['status'], { label: string; tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  pending: { label: 'Pendiente', tone: 'warning' },
  approved: { label: 'Aprobado', tone: 'info' },
  processing: { label: 'En proceso', tone: 'info' },
  paid: { label: 'Pagado', tone: 'success' },
  failed: { label: 'Falló', tone: 'danger' },
  cancelled: { label: 'Cancelado', tone: 'neutral' },
  held: { label: 'Retenido', tone: 'warning' },
};
const fechaCorta = (iso: string) => fmtDate(iso, { day: '2-digit', month: 'short' });
const techName = (id: string) =>
  getProfile(id)?.full_name ?? getTechnician(id)?.display_name ?? 'Técnico';

interface TxRow {
  id: string;
  orderId: string;
  client: string;
  method: string;
  amount: number;
  commission: number;
  status: string;
  at: string;
}

export default function FinanzasPage() {
  const tick = useTick();
  const extras = useExtras();
  const router = useRouter();
  const ready = useWorldReady();
  const failed = useWorldFailed();
  const { busy, run } = useAction();
  const canFinance = useAuth().can('finanzas');
  const [range, setRange] = useState<NonNullable<DateRange>>(() => rangePreset('30d')!);
  const [tab, setTab] = useState<Tab>('tx');
  const [method, setMethod] = useState<MethodFilter>('all');
  const [batchOpen, setBatchOpen] = useState(false);
  // GMV del periodo: una sola definición (RPC admin_report_kpis, la misma de
  // Reportes); los pagos del snapshot solo alimentan la gráfica por día.
  const [kpis, setKpis] = useState<ReportKpis | null>(null);

  useEffect(() => {
    void loadExtras();
  }, []);
  useEffect(() => {
    let live = true;
    const b = rangeBuckets(range, new Date());
    void fetchReportKpis(new Date(b[0].from), new Date(b[b.length - 1].to)).then(
      k => live && setKpis(k),
    );
    return () => {
      live = false;
    };
  }, [range, tick]);

  const m = useMemo(() => {
    const now = new Date();
    const pays = getAllPayments();
    const buckets = rangeBuckets(range, now);
    const from = buckets[0].from;
    const to = buckets[buckets.length - 1].to;
    const len = to - from;
    const { cur, prev } = periodTotals(pays, range, now);
    const inWin = (iso: string, a: number, b: number) => {
      const t = new Date(iso).getTime();
      return t >= a && t < b;
    };
    const ledger = getAllLedger();
    // Pagado a técnicos: retiros pagados (payout_requests) o, si la tabla no
    // existe en el entorno, las entradas `payout` del ledger.
    const paidOut = (a: number, b: number) =>
      extras.unavailable.payouts || !extras.loaded
        ? ledger
            .filter(e => e.entry_type === 'payout' && inWin(e.created_at, a, b))
            .reduce((s, e) => s + Math.abs(e.amount_cents), 0)
        : extras.payouts
            .filter(p => p.status === 'paid' && inWin(p.created_at, a, b))
            .reduce((s, p) => s + p.amount_cents, 0);
    // Por cobrar · efectivo: comisión que los técnicos deben por cobros en efectivo.
    const owed = (a: number, b: number) =>
      ledger
        .filter(e => e.entry_type === 'commission_owed' && inWin(e.created_at, a, b))
        .reduce((s, e) => s + Math.abs(e.amount_cents), 0);
    const goalMonthly = getSettingInt('gmv_monthly_goal_cents', 50_000_000);
    return {
      buckets,
      bars: aggregate(pays, buckets),
      cur,
      prev,
      paid: [paidOut(from, to), paidOut(from - len, from)] as const,
      owed: [owed(from, to), owed(from - len, from)] as const,
      methods: methodSplit(pays, from, to),
      goal: bucketGoal(goalMonthly, range),
      goalMonthly,
      monthly: monthlySummary(pays, goalMonthly, now),
      tx: pays
        .filter(p => inWin(p.paid_at ?? p.created_at, from, to))
        .sort((a, b) => (b.paid_at ?? b.created_at).localeCompare(a.paid_at ?? a.created_at))
        .map<TxRow>(p => {
          const o = getRequest(p.service_order_id);
          return {
            id: p.id,
            orderId: p.service_order_id,
            client: o ? getProfile(o.client_id)?.full_name ?? 'Cliente' : 'Cliente',
            method: p.method,
            amount: p.amount_cents,
            commission: p.commission_cents,
            status: p.status,
            at: p.paid_at ?? p.created_at,
          };
        }),
      wallets: (() => {
        const ids = new Set<string>([
          ...extras.wallets.flatMap(w => (w.technician_id ? [w.technician_id] : [])),
          ...ledger.map(e => e.technician_id),
        ]);
        return [...ids].map(id => {
          const w = extras.wallets.find(x => x.technician_id === id);
          const own = ledger.filter(e => e.technician_id === id);
          return {
            id,
            name: techName(id),
            balance: w?.available_cents ?? own.reduce((s, e) => s + e.amount_cents, 0),
            held: w?.held_cents ?? 0,
            owed: own
              .filter(e => e.entry_type === 'commission_owed')
              .reduce((s, e) => s + Math.abs(e.amount_cents), 0),
          };
        });
      })(),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, extras, range]);

  const txRows = m.tx.filter(t => method === 'all' || t.method === method);
  const payouts = extras.payouts;
  const pendingPO = payouts.filter(p => p.status === 'pending');
  const heldPO = payouts.filter(p => p.status === 'held');
  const gmv = kpis ? Number(kpis.current.gmv_cents) : m.cur.gross;
  const gmvPrev = kpis ? Number(kpis.previous.gmv_cents) : m.prev.gross;
  const payoutsReal = extras.loaded && !extras.unavailable.payouts;
  const labels = m.buckets.map(b => b.label);

  if (!canFinance)
    return <ErrorPage kind="403" primary={{ label: 'Ir al panel', href: '/dashboard' }} />;
  if (failed)
    return <ErrorPage kind="500" primary={{ label: 'Reintentar', onClick: () => void loadWorld(true) }} />;
  if (!ready) return <ScreenSkeleton kind="dashboard" />;

  const txCols: DataColumn<TxRow>[] = [
    { key: 'id', header: 'Pago', render: r => <span className="font-mono text-[12px] text-muted">PAY-{orderCode(r.orderId).slice(4)}</span> },
    {
      key: 'svc',
      header: 'Servicio',
      sortValue: r => orderCode(r.orderId),
      render: r => <span className="font-mono text-[12.5px] font-semibold text-primary">{orderCode(r.orderId)}</span>,
    },
    { key: 'client', header: 'Cliente', sortValue: r => r.client, render: r => <span className="font-sans text-[13px] text-navy">{r.client}</span> },
    {
      key: 'method',
      header: 'Método',
      sortValue: r => r.method,
      render: r => {
        const mm = methodMeta(r.method);
        return (
          <span className="inline-flex items-center gap-1.5 font-sans text-[12.5px] font-semibold" style={{ color: mm.color }}>
            <mm.icon size={13} /> {mm.label}
          </span>
        );
      },
    },
    { key: 'amount', header: 'Monto', align: 'right', sortValue: r => r.amount, render: r => <span className="font-mono text-[13px] font-semibold text-navy tabular">{money(r.amount)}</span> },
    { key: 'comm', header: 'Comisión', align: 'right', sortValue: r => r.commission, render: r => <span className="font-mono text-[12.5px] text-muted tabular">{money(r.commission)}</span> },
    {
      key: 'status',
      header: 'Estado',
      sortValue: r => r.status,
      render: r => {
        const s = PAY_STATUS[r.status] ?? { label: r.status, tone: 'neutral' as const };
        return <Badge tone={s.tone}>{s.label}</Badge>;
      },
    },
    { key: 'at', header: 'Fecha', sortValue: r => r.at, render: r => <span className="font-mono text-[12px] text-muted">{fechaCorta(r.at)}</span> },
  ];

  const onExport = () => {
    exportCsv(
      `transacciones-${periodLabel(range).replace(/\W+/g, '-')}.csv`,
      txRows.map(t => ({
        Pago: t.id,
        Servicio: orderCode(t.orderId),
        Cliente: t.client,
        Método: methodMeta(t.method).label,
        Monto: t.amount / 100,
        Comisión: t.commission / 100,
        Estado: PAY_STATUS[t.status]?.label ?? t.status,
        Fecha: t.at,
      })),
    );
    toast.success('CSV exportado', `${txRows.length} transacciones`);
  };

  async function processPending() {
    const ok = await run('batch', async () => {
      // Un solo lote: el backend aprueba o retiene (held) cada solicitud según
      // tenga fondos en disputa; solo las aprobadas se envían por Stripe.
      const batch = await approvePayouts(
        pendingPO.map(p => p.id),
        'Lote desde la consola',
      );
      if (!batch) return false;
      const inBatch = useExtras.getState().payouts.filter(p => p.batch_id === batch.id);
      const approved = inBatch.filter(p => p.status === 'approved');
      const held = inBatch.length - approved.length;
      let sent = 0;
      for (const p of approved) {
        // El mutator ya mostró el error; se detiene el lote sin tocar el resto.
        if ((await sendPayout(p.id)) === null) break;
        sent++;
      }
      toast.success(
        `${sent} de ${approved.length} retiros enviados`,
        held ? `${held} retenidos por disputa abierta (lote ${batch.id.slice(0, 6).toUpperCase()})` : undefined,
      );
      return sent === approved.length;
    });
    if (ok) setBatchOpen(false);
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Finanzas"
        description="Cobros con tarjeta (Stripe) y efectivo, comisión de plataforma y retiros a técnicos."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PeriodFilters value={range} onChange={setRange} kicker="Finanzas">
              <section>
                <Kicker className="mb-2.5">Método de pago · transacciones</Kicker>
                <Segmented size="sm" options={METHOD_OPTIONS} value={method} onChange={setMethod} />
              </section>
            </PeriodFilters>
            <Button variant="secondary" icon={Download} onClick={onExport}>
              Exportar
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard index={0} label="GMV" value={money(gmv)} delta={deltaLabel(pctDelta(gmv, gmvPrev))} />
        <KpiCard index={1} label="Comisión plataforma" value={money(m.cur.commission)} delta={deltaLabel(pctDelta(m.cur.commission, m.prev.commission))} />
        <KpiCard index={2} label="Pagado a técnicos" value={money(m.paid[0])} delta={deltaLabel(pctDelta(m.paid[0], m.paid[1]))} />
        <KpiCard index={3} label="Por cobrar · efectivo" value={money(m.owed[0])} delta={deltaLabel(pctDelta(m.owed[0], m.owed[1]))} negative />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card padded>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <Kicker>Ingresos por {isWeekly(range) ? 'semana' : 'día'}</Kicker>
              <div className="mt-1 font-display text-[20px] font-extrabold text-navy tabular">
                {money(m.bars.reduce((s, b) => s + b.gross, 0))}
              </div>
            </div>
            <div className="flex items-center gap-4 font-sans text-[12.5px] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Neto al técnico
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-navy" /> Comisión
              </span>
            </div>
          </div>
          <StackedBars
            data={m.bars}
            labels={labels}
            goal={m.goal}
            goalLabel={`Meta ${isWeekly(range) ? 'semanal' : 'diaria'} ${shortMoney(m.goal)}`}
          />
        </Card>
        <Card padded>
          <Kicker className="mb-3">Desglose por método</Kicker>
          <MethodBreakdown rows={m.methods} />
        </Card>
      </div>

      <Card padded={false} className="overflow-hidden">
        <div className="border-b border-line px-5 pt-3">
          <Tabs
            tabs={[
              { value: 'tx', label: 'Transacciones', count: m.tx.length },
              { value: 'po', label: 'Retiros', count: pendingPO.length + heldPO.length },
              { value: 'wal', label: 'Carteras' },
              { value: 'mes', label: 'Resumen mensual' },
            ]}
            value={tab}
            onChange={setTab}
          />
        </div>

        {tab === 'tx' && (
          <>
            {method !== 'all' && (
              <div className="p-5 pb-3">
                <Chip active onRemove={() => setMethod('all')}>
                  {METHOD_OPTIONS.find(o => o.value === method)?.label}
                </Chip>
              </div>
            )}
            <DataTable
              rows={txRows}
              rowKey={r => r.id}
              columns={txCols}
              onRowClick={r => router.push(`/servicios/${r.orderId}`)}
              initialSort={{ key: 'at', dir: 'desc' }}
              pageSize={8}
              empty={<EmptyState kind="no-results" title="Sin transacciones" description="No hay cobros en este periodo con ese método." compact />}
            />
          </>
        )}

        {tab === 'po' && (
          <div className="p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="font-sans text-[13px] text-muted">
                Los técnicos solicitan retiros desde su app · se aprueban aquí (en lote) y se envían por Stripe Connect.
                Los técnicos con una disputa abierta quedan <b>retenidos</b> hasta resolverla.
              </p>
              {payoutsReal && pendingPO.length > 0 && (
                <Button icon={Send} onClick={() => setBatchOpen(true)} disabled={!!busy}>
                  Procesar pendientes ({pendingPO.length})
                </Button>
              )}
            </div>
            {!payoutsReal ? (
              <EmptyState
                kind="action"
                title="Retiros no disponibles en este entorno"
                description="La tabla de solicitudes de retiro llega con la migración de pagos a técnicos. Mientras tanto, los retiros ya realizados aparecen en Carteras."
                compact
              />
            ) : payouts.length === 0 ? (
              <EmptyState kind="all-clear" title="Sin solicitudes de retiro" description="Cuando un técnico pida retirar su saldo aparecerá aquí." compact />
            ) : (
              <div className="flex flex-col">
                {payouts.map(p => {
                  const st = PO_STATUS[p.status];
                  const tech = getTechnician(p.technician_id);
                  return (
                    <div key={p.id} className="flex flex-wrap items-center gap-3 border-t border-divider py-3 first:border-t-0">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-action font-display text-[12px] font-bold text-white">
                        {initials(techName(p.technician_id))}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-sans text-[13.5px] font-semibold text-navy">{techName(p.technician_id)}</div>
                        <div className="font-mono text-[11.5px] text-muted">
                          RET-{p.id.slice(0, 6).toUpperCase()}
                          {p.batch_id ? ` · lote ${p.batch_id.slice(0, 6).toUpperCase()}` : ''} · CLABE{' '}
                          {tech?.clabe ? `•••• ${tech.clabe.slice(-4)}` : 'sin registrar'} · {fechaCorta(p.created_at)}
                        </div>
                        {p.failure_reason && <div className="font-sans text-[12px] text-error">{p.failure_reason}</div>}
                      </div>
                      <span className="font-display text-[15px] font-extrabold text-navy tabular">{money(p.amount_cents)}</span>
                      <Badge tone={st.tone}>{st.label}</Badge>
                      {(p.status === 'pending' || p.status === 'held') && (
                        <Button size="sm" variant="ghost" icon={X} loading={busy === `rj-${p.id}`} disabled={!!busy} onClick={() => void run(`rj-${p.id}`, () => rejectPayout(p.id), 'Retiro rechazado')}>
                          Rechazar
                        </Button>
                      )}
                      {p.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="approve"
                          icon={Check}
                          loading={busy === `ap-${p.id}`}
                          disabled={!!busy}
                          onClick={() =>
                            void run(`ap-${p.id}`, async () => {
                              const batch = await approvePayouts([p.id]);
                              if (!batch) return null;
                              const after = useExtras.getState().payouts.find(x => x.id === p.id);
                              if (after?.status === 'held')
                                toast.warning('Retiro retenido', 'El técnico tiene una disputa abierta; se libera al resolverla.');
                              return true;
                            }, 'Retiro procesado')
                          }
                        >
                          Aprobar
                        </Button>
                      )}
                      {p.status === 'approved' && (
                        <Button size="sm" icon={Send} loading={busy === `send-${p.id}`} disabled={!!busy} onClick={() => void run(`send-${p.id}`, () => sendPayout(p.id), 'Retiro enviado por Stripe')}>
                          Enviar
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'wal' && (
          <div className="p-5">
            {m.wallets.length === 0 ? (
              <EmptyState kind="first-use" title="Sin carteras con movimiento" description="Aparecen cuando un técnico cobra su primer servicio." compact />
            ) : (
              <table className="w-full min-w-[560px]">
                <thead>
                  <tr className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">
                    <th className="pb-2 text-left font-medium">Técnico</th>
                    <th className="pb-2 text-right font-medium">Saldo</th>
                    <th className="pb-2 text-right font-medium">Retenido</th>
                    <th className="pb-2 text-right font-medium">Comisión adeudada · efectivo</th>
                    <th className="pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {m.wallets.map(w => (
                    <tr key={w.id} className="border-t border-divider">
                      <td className="py-2.5">
                        <button type="button" onClick={() => router.push(`/tecnicos/${w.id}`)} className="inline-flex items-center gap-2.5 font-sans text-[13.5px] font-semibold text-navy hover:text-primary">
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-action font-display text-[11.5px] font-bold text-white">{initials(w.name)}</span>
                          {w.name}
                          <ExternalLink size={12} className="text-faint" />
                        </button>
                      </td>
                      <td className={`py-2.5 text-right font-mono text-[13px] font-semibold tabular ${w.balance < 0 ? 'text-error' : 'text-navy'}`}>{money(w.balance)}</td>
                      <td className="py-2.5 text-right font-mono text-[13px] text-muted tabular">{w.held ? money(w.held) : '—'}</td>
                      <td className="py-2.5 text-right font-mono text-[13px] text-muted tabular">{w.owed ? money(w.owed) : '—'}</td>
                      <td className="py-2.5 text-right">
                        {/* ponytail: sin RPC de ajuste manual (ledger de solo lectura por API). */}
                        <Button size="sm" variant="ghost" icon={Wallet} disabled title="Próximamente: el backend aún no permite ajustes manuales">
                          Ajustar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'mes' && (
          <div className="p-5">
            <div className="flex flex-col gap-3">
              {m.monthly.map(r => (
                <div key={r.label} className="grid grid-cols-[64px_1fr_auto] items-center gap-4">
                  <span className="font-mono text-[12px] uppercase text-muted">{r.label}</span>
                  <div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-segment">
                      <div className="h-full rounded-full bg-primary transition-[width] duration-700" style={{ width: `${Math.min(r.goalPct, 100)}%` }} />
                    </div>
                    <div className="mt-1 font-sans text-[12px] text-muted">
                      {r.count} servicios · comisión {money(r.commission)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-[15px] font-extrabold text-navy tabular">{money(r.gross)}</div>
                    <div className="font-mono text-[11.5px] text-muted">{r.goalPct}% de meta</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 font-sans text-[12px] text-muted">
              GMV · comisión · % de la meta mensual de {money(m.goalMonthly)} MXN (setting <span className="font-mono">gmv_monthly_goal_cents</span>).
            </p>
          </div>
        )}
      </Card>

      <Modal
        open={batchOpen}
        onClose={() => !busy && setBatchOpen(false)}
        dismissible={!busy}
        icon={Send}
        title={`Procesar ${pendingPO.length} retiros`}
        description={`Se aprobarán y enviarán por Stripe ${money(pendingPO.reduce((s, p) => s + p.amount_cents, 0))} MXN. Si alguno falla, el proceso se detiene y los demás quedan como están.`}
        footer={
          <>
            <Button variant="secondary" disabled={!!busy} onClick={() => setBatchOpen(false)}>
              Cancelar
            </Button>
            <Button loading={busy === 'batch'} onClick={() => void processPending()}>
              Procesar
            </Button>
          </>
        }
      />
    </div>
  );
}
