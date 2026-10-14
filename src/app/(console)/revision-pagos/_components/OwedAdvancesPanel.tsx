'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Eye } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Skeleton } from '@/components/ds';
import { fetchOwedAdvances, getProfile, useTick } from '@/lib/data/store';
import { fmtDateTime } from '@/lib/dates';
import { orderCode } from '@/lib/orderCode';
import { BASE_STATUS } from '@/lib/payments';
import { transferStatus, type OwedAdvance } from '@/lib/transfers';
import { STATUS, money } from '../../servicios/_components/shared';
import { TransferSheet } from './TransferSheet';

const when = (iso: string) => fmtDateTime(iso, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

/**
 * «Revisión de pagos» › Adelantos pendientes (decisión 7 del backend): el
 * servicio terminó (o se canceló tras la visita) y el cliente aún debe la
 * visita. No hay cobro automático: el cliente puede pagar después por
 * transferencia o tarjeta; aquí soporte da seguimiento.
 */
export function OwedAdvancesPanel() {
  const tick = useTick();
  const [rows, setRows] = useState<OwedAdvance[] | null | undefined>(undefined);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    void fetchOwedAdvances().then(r => live && setRows(r));
    return () => {
      live = false;
    };
  }, [tick]);

  if (rows === undefined) return <Skeleton className="h-40 w-full" />;
  const total = (rows ?? []).reduce((s, r) => s + r.amountCents, 0);

  return (
    <div className="flex flex-col gap-4">
      <p className="font-sans text-[13px] text-muted">
        {rows?.length
          ? `${rows.length} ${rows.length === 1 ? 'servicio terminado' : 'servicios terminados'} con la visita sin pagar · ${money(total, true)} adeudados por clientes`
          : 'Servicios terminados cuyo adelanto de la visita sigue sin pagar.'}
      </p>
      <Card padded={false} className="overflow-hidden">
        <div className="p-5">
          {rows === null ? (
            <EmptyState kind="no-results" compact title="Lista no disponible" description="El servidor no respondió. Reintenta en un momento." />
          ) : rows.length === 0 ? (
            <EmptyState kind="all-clear" compact title="Sin adelantos pendientes" description="Todos los servicios terminados tienen la visita pagada." />
          ) : (
            <ul className="flex flex-col divide-y divide-divider" aria-label="Adelantos pendientes">
              {rows.map(r => {
                const c = getProfile(r.clientId);
                const os = STATUS[r.status as keyof typeof STATUS] ?? { label: r.status, tone: 'neutral' as const };
                const bs = BASE_STATUS[r.baseStatus] ?? { label: r.baseStatus, tone: 'neutral' as const };
                const ps = r.proof ? transferStatus(r.proof.status) : null;
                return (
                  <li key={r.orderId} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3.5">
                    <div className="min-w-[220px] flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/servicios/${r.orderId}`}
                          className="inline-flex items-center gap-1 font-mono text-[12.5px] font-semibold text-primary hover:underline"
                        >
                          {orderCode(r.orderId)} <ExternalLink size={11} aria-hidden />
                        </Link>
                        <Badge tone={os.tone}>{os.label}</Badge>
                        <Badge tone={bs.tone}>{bs.label}</Badge>
                      </div>
                      <div className="font-sans text-[13.5px] font-semibold text-navy">
                        {c?.full_name ?? 'Cliente'}
                        {c?.phone && <span className="ml-2 font-mono text-[12px] font-normal text-muted">{c.phone}</span>}
                      </div>
                      <div className="font-sans text-[12.5px] text-muted">
                        Terminó {when(r.finishedAt)} · último comprobante:{' '}
                        {ps ? <span className="font-semibold text-body">{ps.label}</span> : 'sin comprobante'}
                      </div>
                      {r.proof?.status === 'rejected' && r.proof.reject_reason && (
                        <div className="mt-0.5 font-sans text-[12.5px] italic text-muted">“{r.proof.reject_reason}”</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">Adeudado</div>
                      <div className="font-mono text-[14px] font-semibold text-navy tabular">{money(r.amountCents, true)}</div>
                    </div>
                    {r.proof && (
                      <Button
                        size="sm"
                        variant={r.proof.status === 'submitted' ? 'primary' : 'secondary'}
                        icon={Eye}
                        onClick={() => setOpenId(r.proof!.id)}
                      >
                        {r.proof.status === 'submitted' ? 'Revisar' : 'Ver comprobante'}
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Card>
      <TransferSheet id={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
