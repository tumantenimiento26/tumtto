'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Banknote, ChevronLeft, HandCoins, Undo2, User } from 'lucide-react';
import { Badge, Button, Card, EmptyState, ErrorPage, ScreenSkeleton } from '@/components/ds';
import { UserIcon } from '@/components/user-avatar';
import { useAuth } from '@/lib/auth';
import { fmtDate, fmtDateTime } from '@/lib/dates';
import { getProfile, getTechType, useWorldReady } from '@/lib/data/store';
import { TECH_TYPE_LABEL, TECH_TYPE_TONE } from '@/lib/techType';
import {
  balanceSentences,
  canVoid,
  commissionLabel,
  folioLabel,
  historyTitle,
  money,
  type HistoryItem,
} from '@/lib/settlements';
import { RecordDialog, VoidDialog } from '../_components/SettleDialogs';
import { NetValue, Tile } from '../_components/parts';
import { useSettlement } from '../_components/useSettlement';

const short = (iso: string) => fmtDate(iso, { day: '2-digit', month: 'short', year: 'numeric' });

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={`px-4 py-2.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted ${right ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  );
}
const Folio = ({ id, folio }: { id: string; folio: number }) => (
  <Link href={`/servicios/${id}`} className="font-mono text-[12.5px] font-semibold text-primary hover:underline">
    {folioLabel(folio)}
  </Link>
);

export default function LiquidacionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const ready = useWorldReady();
  const { canEdit } = useAuth();
  const edit = canEdit('finanzas');
  const { summary, state, reload } = useSettlement(id);
  const [dialog, setDialog] = useState<'payout' | 'cash' | null>(null);
  const [voiding, setVoiding] = useState<HistoryItem | null>(null);

  if (state === 'failed') return <ErrorPage kind="500" primary={{ label: 'Reintentar', onClick: () => void reload() }} />;
  if (!ready || !summary) return <ScreenSkeleton kind="detail" />;

  const name = getProfile(id)?.full_name ?? 'Técnico';
  const type = getTechType(id).type;
  const now = Date.now();
  const sentences = balanceSentences(name, summary.owed_to_technician_cents, summary.owed_to_admin_cents);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/liquidaciones" className="inline-flex w-fit items-center gap-1 font-sans text-[13px] font-medium text-muted hover:text-navy">
        <ChevronLeft size={16} /> Liquidaciones
      </Link>

      <Card padded className="animate-up">
        <div className="flex flex-wrap items-center gap-4">
          <UserIcon userId={id} size={56} decorative />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-[24px] font-extrabold tracking-[-0.5px] text-navy">{name}</h1>
              <Badge tone={TECH_TYPE_TONE[type]}>{TECH_TYPE_LABEL[type]}</Badge>
            </div>
            <div className="mt-1 flex flex-col gap-0.5">
              {sentences.map(s => (
                <p key={s} className="font-sans text-[14px] text-body">{s}</p>
              ))}
            </div>
          </div>
          <Button variant="secondary" size="sm" icon={User} href={`/tecnicos/${id}`}>
            Ver perfil
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Tile label="Le debemos" value={money(summary.owed_to_technician_cents)} help="Comisiones pendientes de pagar" valueClass="text-primary" />
        <Tile label="Debe entregar" value={money(summary.owed_to_admin_cents)} help="Efectivo cobrado sin entregar" valueClass="text-warning-ink" />
        <Card padded className="animate-up">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">Neto</div>
          <div className="mt-2 font-display text-[27px] font-extrabold tracking-[-0.5px]">
            <NetValue cents={summary.net_cents} long />
          </div>
          <div className="mt-1 font-sans text-[12px] text-muted">Comisiones menos efectivo</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <Card padded={false} className="animate-up overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3.5">
            <div>
              <h2 className="font-display text-[16px] font-bold text-navy">Comisiones por pagar</h2>
              <p className="font-sans text-[12px] text-muted">Lo que Tu Mantenimiento le debe por servicios terminados.</p>
            </div>
            {edit && (
              <Button variant="approve" size="sm" icon={Banknote} disabled={summary.pending_commissions.length === 0} onClick={() => setDialog('payout')}>
                Registrar pago
              </Button>
            )}
          </div>
          {summary.pending_commissions.length === 0 ? (
            <EmptyState kind="all-clear" title="Nada por pagar" description="Todas las comisiones están pagadas." compact />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[460px] border-collapse">
                <thead>
                  <tr className="bg-panel"><Th>Servicio</Th><Th>Fecha</Th><Th right>Cobrado</Th><Th right>Comisión</Th></tr>
                </thead>
                <tbody>
                  {summary.pending_commissions.map(c => (
                    <tr key={c.order_id} className="border-t border-divider">
                      <td className="px-4 py-2.5"><Folio id={c.order_id} folio={c.folio} /></td>
                      <td className="px-4 py-2.5 font-sans text-[12.5px] text-body">{short(c.finished_at)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-[12.5px] text-body tabular">{money(c.gross_cents)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="font-mono text-[13px] font-semibold text-navy tabular">{money(c.commission_cents)}</div>
                        <div className="font-sans text-[11px] text-muted">{commissionLabel(c.commission_type, c.commission_value)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card padded={false} className="animate-up overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3.5">
            <div>
              <h2 className="font-display text-[16px] font-bold text-navy">Efectivo por entregar</h2>
              <p className="font-sans text-[12px] text-muted">Dinero de Tu Mantenimiento que el técnico cobró en efectivo.</p>
            </div>
            {edit && (
              <Button variant="approve" size="sm" icon={HandCoins} disabled={summary.pending_cash.length === 0} onClick={() => setDialog('cash')}>
                Efectivo recibido
              </Button>
            )}
          </div>
          {summary.pending_cash.length === 0 ? (
            <EmptyState kind="all-clear" title="Sin efectivo pendiente" description="No tiene efectivo por entregar." compact />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[360px] border-collapse">
                <thead>
                  <tr className="bg-panel"><Th>Servicio</Th><Th>Cobrado el</Th><Th right>Efectivo</Th></tr>
                </thead>
                <tbody>
                  {summary.pending_cash.map(c => (
                    <tr key={c.payment_id} className="border-t border-divider">
                      <td className="px-4 py-2.5"><Folio id={c.order_id} folio={c.folio} /></td>
                      <td className="px-4 py-2.5 font-sans text-[12.5px] text-body">{short(c.collected_at)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-[13px] font-semibold text-navy tabular">{money(c.amount_cents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Card padded className="animate-up">
        <h2 className="font-display text-[16px] font-bold text-navy">Historial</h2>
        <p className="mb-2 font-sans text-[12px] text-muted">Pagos y entregas registrados, del más reciente al más antiguo.</p>
        {summary.history.length === 0 ? (
          <EmptyState kind="first-use" title="Sin movimientos" description="Aún no se ha registrado ningún pago ni entrega." compact />
        ) : (
          summary.history.map(h => {
            const isPay = h.kind === 'payout';
            return (
              <div key={h.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-divider py-3 first:border-t-0">
                <div className="min-w-0">
                  <div className={`font-sans text-[13.5px] font-semibold ${h.voided ? 'text-muted line-through' : 'text-navy'}`}>
                    {historyTitle(h)}
                  </div>
                  <div className="font-sans text-[12px] text-muted">
                    {fmtDateTime(h.at, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    {h.method ? ` · ${h.method}` : ''}
                    {h.reference ? ` · ${h.reference}` : ''}
                    {h.note ? ` · ${h.note}` : ''}
                    {h.voided && h.voided_at ? ` · anulado ${short(h.voided_at)}` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={h.voided ? 'neutral' : isPay ? 'info' : 'warning'}>{isPay ? 'Pago' : 'Efectivo'}</Badge>
                  <span className={`font-mono text-[13.5px] font-semibold tabular ${h.voided ? 'text-faint line-through' : isPay ? 'text-primary' : 'text-warning-ink'}`}>
                    {isPay ? '−' : '+'}{money(h.amount_cents)}
                  </span>
                  {edit && canVoid(summary.history, h, now) && (
                    <Button variant="ghost" size="sm" icon={Undo2} onClick={() => setVoiding(h)}>
                      Anular
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </Card>

      {dialog && (
        <RecordDialog
          kind={dialog}
          techId={id}
          techName={name}
          commissions={summary.pending_commissions}
          cash={summary.pending_cash}
          onClose={() => setDialog(null)}
          onDone={() => void reload()}
        />
      )}
      {voiding && <VoidDialog item={voiding} onClose={() => setVoiding(null)} onDone={() => void reload()} />}
    </div>
  );
}
