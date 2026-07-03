'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Download, Settings, DollarSign, Percent, Wallet, Hourglass,
  CreditCard, Store, Banknote, ArrowRight, TrendingUp, Zap, Check,
  BadgeCheck, AlertTriangle, ExternalLink, ArrowDownLeft, ArrowUpRight,
} from 'lucide-react';
import { PageHeading, Panel, StatCard, BarChart, BreakdownBars, DataTable, Modal, exportCsv, type Column } from '@/components/admin';
import { LineChart } from '@/components/charts';
import { Avatar, PrimaryButton, GhostButton, Skeleton } from '@/components/ui';
import { FadeIn, Stagger, StaggerItem } from '@/components/motion';
import { toast } from '@/components/toast';
import {
  getMetrics, getAllPayments, getAllPayouts, getWallet, getWalletTxns,
  getTechnician, getProfile, getRequest, processPayoutBatch, useTick,
} from '@/lib/demo/store';

interface PayRow {
  id: string; request_id: string; method: string; status: string;
  gross_amount: number; platform_fee: number; technician_net: number; client: string;
}
interface PayoutRow {
  id: string; amount: number; status: string; clabe_snapshot: string | null;
  name: string; initials: string; bank: string; kyc: 'ok' | 'review';
}

const mx = (n: number) => '$' + n.toLocaleString('es-MX');

const METHOD_META: Record<string, { label: string; icon: typeof CreditCard; color: string }> = {
  tarjeta: { label: 'Tarjeta', icon: CreditCard, color: '#0A6BCF' },
  oxxo: { label: 'OXXO Pay', icon: Store, color: '#B45309' },
  mp: { label: 'MP wallet', icon: Wallet, color: '#0894EA' },
  mercadopago: { label: 'MP wallet', icon: Wallet, color: '#0894EA' },
  efectivo: { label: 'Efectivo', icon: Banknote, color: '#18A66A' },
};

// Mock daily GMV (últimos 14 días) para enriquecer la gráfica como el prototipo.
const DAILY_GMV = [
  72, 88, 61, 95, 110, 74, 49, 102, 118, 86, 93, 124, 79, 134,
].map((v, i) => ({
  label: `${14 + i} jun`,
  value: v * 1000,
  meta: `comisión plataforma ~15% · $${Math.round(v * 1000 * 0.15).toLocaleString('es-MX')}`,
}));

// Filas extra realistas (ZMG) además del pago vivo del demo.
const MOCK_PAYMENTS: PayRow[] = [
  { id: 'pay-2848', request_id: 'SVC-2848', method: 'mp', status: 'paid', gross_amount: 2150, platform_fee: 322, technician_net: 1828, client: 'Carlos Méndez' },
  { id: 'pay-2844', request_id: 'SVC-2844', method: 'efectivo', status: 'paid', gross_amount: 640, platform_fee: 96, technician_net: 544, client: 'Ana Rivera' },
  { id: 'pay-2840', request_id: 'SVC-2840', method: 'tarjeta', status: 'refunded', gross_amount: 1320, platform_fee: 198, technician_net: 1122, client: 'Jorge Salas' },
];

// ponytail: banco detectado por prefijo de CLABE — solo presentacional.
const BANK_BY_PREFIX: Record<string, string> = { '012': 'BBVA', '044': 'Santander', '014': 'Banorte' };

const PAY_STATUS: Record<string, { label: string; cls: string }> = {
  paid: { label: 'Pagado', cls: 'bg-success-soft text-success' },
  pending: { label: 'Pendiente', cls: 'bg-warning-soft text-warning-ink' },
  refunded: { label: 'Reembolsado', cls: 'bg-error-soft text-error' },
  failed: { label: 'Fallido', cls: 'bg-error-soft text-error' },
};

const PAYOUT_STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pendiente', cls: 'bg-warning-soft text-warning-ink' },
  processing: { label: 'En proceso', cls: 'bg-info-soft text-primary-2' },
  processed: { label: 'Procesado', cls: 'bg-success-soft text-success' },
  rejected: { label: 'Rechazado', cls: 'bg-error-soft text-error' },
};

function SkeletonRows({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-10 w-72" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    </div>
  );
}

export default function FinanzasPage() {
  const tick = useTick();
  const [ready, setReady] = useState(false);
  const [loteOpen, setLoteOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 450);
    return () => clearTimeout(t);
  }, []);
  const m = getMetrics();

  const payments = useMemo<PayRow[]>(() => {
    const live: PayRow[] = getAllPayments().map((p) => {
      const req = getRequest(p.request_id);
      const client = req ? getProfile(req.client_id)?.full_name ?? 'Cliente' : 'Cliente';
      return {
        id: p.id, request_id: p.request_id, method: p.method, status: p.status,
        gross_amount: p.gross_amount, platform_fee: p.platform_fee,
        technician_net: p.technician_net, client,
      };
    });
    return [...live, ...MOCK_PAYMENTS];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const payouts = useMemo<PayoutRow[]>(() => {
    return getAllPayouts().map((p) => {
      const tech = getTechnician(p.technician_id);
      const name = (tech && getProfile(tech.user_id)?.full_name) ?? 'Técnico';
      return {
        id: p.id, amount: p.amount, status: p.status, clabe_snapshot: p.clabe_snapshot,
        name,
        initials: name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase(),
        bank: BANK_BY_PREFIX[p.clabe_snapshot?.slice(0, 3) ?? ''] ?? 'BBVA',
        kyc: tech?.kyc_status === 'approved' ? 'ok' : 'review',
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const wallet = getWallet('t-ramon');
  const walletTxns = getWalletTxns('t-ramon');
  const ramonName = getProfile('demo-tecnico')?.full_name ?? 'Ramón Hernández';

  const pendingTotal = payouts.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const pendingCount = payouts.filter((p) => p.status === 'pending').length;

  function onExport() {
    exportCsv('transacciones.csv', payments.map(p => ({
      ID: p.id, Servicio: p.request_id, Cliente: p.client, Método: METHOD_META[p.method]?.label ?? p.method,
      Bruto: p.gross_amount, Comisión: p.platform_fee, 'Neto técnico': p.technician_net,
      Estado: PAY_STATUS[p.status]?.label ?? p.status,
    })));
    toast.success(`CSV exportado · ${payments.length} transacciones`);
  }

  function onProcessBatch() {
    const { count, total } = processPayoutBatch();
    setLoteOpen(false);
    toast.success(`Lote procesado · ${count} retiros por ${mx(total)}`);
  }

  // Desglose por método (a partir de los pagos cobrados + pendientes).
  const byMethod = useMemo(() => {
    const acc: Record<string, number> = {};
    payments.forEach((p) => { acc[p.method] = (acc[p.method] ?? 0) + p.gross_amount; });
    return Object.entries(acc).map(([k, v]) => ({
      name: METHOD_META[k]?.label ?? k, value: v, color: METHOD_META[k]?.color,
    }));
  }, [payments]);

  const payColumns: Column<PayRow>[] = [
    { key: 'id', header: 'ID', className: 'font-mono text-[12px]', render: (r) => <span className="text-primary">#{r.request_id}</span> },
    { key: 'client', header: 'Cliente', render: (r) => <span className="font-medium text-navy">{r.client}</span> },
    {
      key: 'method', header: 'Método', render: (r) => {
        const meta = METHOD_META[r.method] ?? { label: r.method, icon: CreditCard, color: '#6B7280' };
        const Icon = meta.icon;
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11.5px] font-semibold" style={{ background: `${meta.color}14`, color: meta.color }}>
            <Icon size={12} />{meta.label}
          </span>
        );
      },
    },
    { key: 'gross', header: 'Bruto', className: 'text-right', render: (r) => <span className="font-mono font-semibold text-navy">{mx(r.gross_amount)}</span> },
    { key: 'fee', header: 'Comisión', className: 'text-right', render: (r) => <span className="font-mono text-muted">{mx(r.platform_fee)}</span> },
    { key: 'net', header: 'Neto técnico', className: 'text-right', render: (r) => <span className="font-mono font-semibold text-navy">{mx(r.technician_net)}</span> },
    {
      key: 'status', header: 'Estado', render: (r) => {
        const s = PAY_STATUS[r.status] ?? { label: r.status, cls: 'bg-surface-2 text-navy' };
        return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.cls}`}>{s.label}</span>;
      },
    },
  ];

  if (!ready) return <SkeletonRows />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Finanzas"
        sub="Conciliación de pagos, comisiones y retiros a técnicos."
        actions={
          <div className="flex gap-2.5">
            <GhostButton onClick={onExport}><span className="inline-flex items-center gap-2"><Download size={14} />Exportar</span></GhostButton>
            <GhostButton><span className="inline-flex items-center gap-2"><Settings size={14} />Configurar reglas</span></GhostButton>
          </div>
        }
      />

      {/* KPIs */}
      <Stagger className="grid grid-cols-4 gap-4">
        <StaggerItem><StatCard index={0} label="GMV del periodo" value={mx(m.gmv)} suffix="MXN" delta="+12.4%" trend="up" note="vs. mes anterior" icon={DollarSign} /></StaggerItem>
        <StaggerItem><StatCard index={1} label="Comisión plataforma" value={mx(m.platformFee)} suffix="MXN" delta="+9.1%" trend="up" note="15% promedio" icon={Percent} /></StaggerItem>
        <StaggerItem><StatCard index={2} label="Neto a técnicos" value={mx(m.techNet)} suffix="MXN" note="después de comisión" icon={Wallet} /></StaggerItem>
        <StaggerItem><StatCard index={3} label="Pagos pendientes" value={mx(pendingTotal)} suffix="MXN" delta={`${pendingCount} retiros`} trend="down" note="por procesar" icon={Hourglass} /></StaggerItem>
      </Stagger>

      {/* Gráfica de ingresos + desglose por método */}
      <div className="grid grid-cols-[1fr_380px] gap-6">
        <FadeIn>
          <Panel title="Ingresos diarios · últimos 14 días" action={<span className="text-[12.5px] text-muted">Total {mx(DAILY_GMV.reduce((s, d) => s + d.value, 0))} MXN</span>}>
            <LineChart data={DAILY_GMV} height={220} format={mx} controls={{ avg: true }} />
          </Panel>
        </FadeIn>
        <FadeIn>
          <Panel title="Desglose por método · este periodo">
            <BreakdownBars data={byMethod} />
          </Panel>
        </FadeIn>
      </div>

      {/* Tabla de transacciones */}
      <FadeIn>
        <Panel title="Transacciones / pagos" action={<a className="inline-flex items-center gap-1 text-[12.5px] font-medium text-primary" href="#">Ver todo <ArrowRight size={12} /></a>}>
          <DataTable columns={payColumns} rows={payments} empty="Sin transacciones" />
        </Panel>
      </FadeIn>

      {/* Payouts + wallet */}
      <div className="grid grid-cols-[1fr_380px] gap-6">
        <FadeIn>
          <Panel
            title="Solicitudes de retiro (payouts)"
            action={
              <PrimaryButton onClick={() => setLoteOpen(true)} disabled={pendingCount === 0}>
                <span className="inline-flex items-center gap-2"><Zap size={14} />Procesar lote</span>
              </PrimaryButton>
            }
          >
            <DataTable
              columns={[
                {
                  key: 'tech', header: 'Técnico · CLABE', render: (r) => (
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={r.initials} size={32} />
                      <div>
                        <div className="text-[13px] font-semibold text-navy">{r.name}</div>
                        <div className="font-mono text-[11px] text-muted">{r.clabe_snapshot}</div>
                      </div>
                    </div>
                  ),
                },
                { key: 'bank', header: 'Banco', render: (r) => <span className="text-[12.5px] text-navy">{r.bank}</span> },
                { key: 'amount', header: 'Monto', className: 'text-right', render: (r) => <span className="font-mono font-bold text-navy">{mx(r.amount)}</span> },
                {
                  key: 'kyc', header: 'KYC', render: (r) => r.kyc === 'ok'
                    ? <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success"><BadgeCheck size={11} />Verde</span>
                    : <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-semibold text-warning-ink"><AlertTriangle size={11} />Revisión</span>,
                },
                {
                  key: 'status', header: 'Estado', render: (r) => {
                    const s = PAYOUT_STATUS[r.status] ?? { label: r.status, cls: 'bg-surface-2 text-navy' };
                    return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.cls}`}>{s.label}</span>;
                  },
                },
              ] as Column<PayoutRow>[]}
              rows={payouts}
              empty="Sin solicitudes de retiro"
            />
          </Panel>
        </FadeIn>

        <FadeIn>
          <Panel title="Wallet del técnico">
            <div className="flex flex-col gap-4">
              <div className="rounded-xl bg-grad-brand p-5 text-white">
                <div className="flex items-center gap-2.5">
                  <Avatar initials="RH" size={36} />
                  <div>
                    <div className="text-[13px] font-semibold">{ramonName}</div>
                    <div className="text-[11px] text-white/80">Plomería · Zapopan</div>
                  </div>
                </div>
                <div className="mt-4 text-[11px] text-white/80">Saldo disponible</div>
                <div className="font-display text-[30px] font-bold leading-tight">
                  {mx(wallet?.balance ?? 0)}<span className="ml-1 font-mono text-[12px] font-medium text-white/70">MXN</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between rounded-lg border border-line bg-surface px-3.5 py-3">
                  <span className="text-[12.5px] text-muted">Retirado (30 d)</span>
                  <span className="font-mono font-semibold text-navy">{mx(3000)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-line bg-surface px-3.5 py-3">
                  <span className="text-[12.5px] text-muted">En camino</span>
                  <span className="font-mono font-semibold text-navy">{mx(0)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-line bg-surface px-3.5 py-3">
                  <span className="text-[12.5px] text-muted">Comisión retenida</span>
                  <span className="font-mono font-semibold text-navy">{mx(246)}</span>
                </div>
              </div>

              <GhostButton onClick={() => setWalletOpen(true)}><span className="inline-flex items-center gap-2"><ExternalLink size={14} />Ver historial de wallet</span></GhostButton>
            </div>
          </Panel>
        </FadeIn>
      </div>

      <FadeIn>
        <Panel title="Resumen mensual" action={<span className="inline-flex items-center gap-1 text-[12.5px] text-success"><TrendingUp size={13} />Tendencia positiva</span>}>
          <BarChart data={[
            { label: 'Ene', value: 1840000 }, { label: 'Feb', value: 2010000 },
            { label: 'Mar', value: 2230000 }, { label: 'Abr', value: 2480000 },
            { label: 'May', value: 2640000 }, { label: 'Jun', value: m.gmv || 2847000 },
          ]} height={180} color="#18C1FF" />
        </Panel>
      </FadeIn>

      {/* ── Modal: procesar lote (prototipo finanzas.jsx · ConfirmLoteModal) ── */}
      <Modal
        open={loteOpen}
        onClose={() => setLoteOpen(false)}
        title="Procesar lote de retiros"
        sub="Revisa el resumen antes de confirmar. Esta acción genera SPEI inmediato a cada técnico."
        icon={<Zap size={18} />}
        width={620}
        footer={
          <>
            <GhostButton onClick={() => setLoteOpen(false)}>Cancelar</GhostButton>
            <PrimaryButton onClick={onProcessBatch}>
              <span className="inline-flex items-center gap-2"><Check size={14} />Confirmar y procesar lote</span>
            </PrimaryButton>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <SummaryTile label="Retiros a procesar" value={String(pendingCount)} sub="Solo estatus pendiente" />
            <SummaryTile label="Monto total" value={mx(pendingTotal)} suffix="MXN" sub="Sin contar en proceso" />
            <SummaryTile label="Comisión bancaria" value={mx(pendingCount * 10)} suffix="MXN" sub="$10 MXN por SPEI" />
            <SummaryTile label="Cargo a Tumantenimiento" value={mx(pendingTotal + pendingCount * 10)} suffix="MXN" sub="Saldo cuenta operativa: $4.2M" primary />
          </div>
          <div className="flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning-soft p-3.5 text-[12.5px]">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" />
            <div>
              <b className="font-semibold text-warning-ink">Los retiros en proceso quedarán fuera</b>
              <span className="text-muted"> hasta que el banco confirme la transferencia anterior.</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-xl border border-line bg-surface p-3.5">
            <input type="checkbox" defaultChecked className="mt-0.5 h-4 w-4 accent-primary" />
            <div>
              <div className="text-[13.5px] font-medium text-navy">Entiendo que esto genera {pendingCount} transferencia(s) SPEI no reversibles.</div>
              <div className="mt-1 text-[12px] text-muted">Quedará registro en la bitácora de auditoría a nombre de Sofía Martínez (Admin Soporte).</div>
            </div>
          </div>
        </div>
      </Modal>

      {/* ── Modal: historial de wallet ── */}
      <Modal
        open={walletOpen}
        onClose={() => setWalletOpen(false)}
        title={`Historial de wallet · ${ramonName}`}
        sub={`Saldo disponible ${mx(wallet?.balance ?? 0)} MXN`}
        icon={<Wallet size={16} />}
        width={480}
      >
        {walletTxns.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-faint">Sin movimientos registrados.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {walletTxns.map(t => {
              const credit = t.type === 'credit';
              return (
                <div key={t.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${credit ? 'bg-success-soft text-success' : 'bg-error-soft text-error'}`}>
                    {credit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold capitalize text-navy">{credit ? 'Abono' : t.type === 'payout' ? 'Retiro' : t.type}</div>
                    <div className="mt-0.5 font-mono text-[11.5px] text-muted">{t.reference ?? '—'} · {new Date(t.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</div>
                  </div>
                  <span className={`font-mono text-[13.5px] font-bold ${credit ? 'text-success' : 'text-error'}`}>
                    {credit ? '+' : '−'}{mx(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
}

function SummaryTile({ label, value, suffix, sub, primary }: {
  label: string; value: string; suffix?: string; sub?: string; primary?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-3.5 ${primary ? 'border-primary/25 bg-info-soft' : 'border-line bg-surface'}`}>
      <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-faint">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className={`font-display text-[22px] font-bold tracking-tight ${primary ? 'text-primary' : 'text-navy'}`}>{value}</span>
        {suffix && <span className="font-mono text-[11px] text-faint">{suffix}</span>}
      </div>
      {sub && <div className="mt-1 text-[11.5px] text-muted">{sub}</div>}
    </div>
  );
}
