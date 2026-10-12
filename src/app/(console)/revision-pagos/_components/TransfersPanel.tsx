'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Eye, Landmark, Search, Undo2 } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  Chip,
  DateRangePicker,
  EmptyState,
  Input,
  Modal,
  Skeleton,
} from '@/components/ds';
import { useAction } from '@/components/use-action';
import { useAuth } from '@/lib/auth';
import { confirmTransferRefund, fetchPaymentTransfers, getProfile, getTransferRefundOrders, useTick } from '@/lib/data/store';
import { orderCode } from '@/lib/orderCode';
import {
  DEFAULT_TRANSFER_FILTERS,
  REFUND_REFERENCE_MAX,
  STATUS_OPTIONS,
  TRANSFER_PAGE_SIZE,
  activeTransferFilters,
  pageCount,
  transferStatus,
  type TransferFilters,
  type TransferRow,
} from '@/lib/transfers';
import { money, timeAgo } from '../../servicios/_components/shared';
import { TransferSheet } from './TransferSheet';

/**
 * «Revisión de pagos» › Transferencias: comprobantes del adelanto de la visita
 * (admin_list_payment_transfers) con filtros de estado, fechas y búsqueda,
 * paginados en el servidor. Arriba, los reembolsos manuales pendientes.
 */
export function TransfersPanel({ initialTransfer }: { initialTransfer: string | null }) {
  const tick = useTick();
  const [f, setF] = useState<TransferFilters>(DEFAULT_TRANSFER_FILTERS);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<{ rows: TransferRow[]; total: number } | null | undefined>(undefined);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (initialTransfer) setOpenId(initialTransfer);
  }, [initialTransfer]);

  // La búsqueda va al servidor: espera a que se deje de escribir.
  useEffect(() => {
    const t = setTimeout(() => {
      setF(s => (s.search === search ? s : { ...s, search }));
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let live = true;
    void fetchPaymentTransfers(f, page).then(r => live && setData(r));
    return () => {
      live = false;
    };
  }, [f, page, tick]);

  const set = (patch: Partial<TransferFilters>) => {
    setF(s => ({ ...s, ...patch }));
    setPage(0);
  };
  const clear = () => {
    setSearch('');
    setF(DEFAULT_TRANSFER_FILTERS);
    setPage(0);
  };
  const total = data?.total ?? 0;
  const pages = pageCount(total);
  const from = total ? page * TRANSFER_PAGE_SIZE + 1 : 0;
  const to = Math.min(total, (page + 1) * TRANSFER_PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      <RefundsPending />

      <Card padded className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Estado">
          {STATUS_OPTIONS.map(o => (
            <Chip key={o.value} active={f.status === o.value} onClick={() => set({ status: o.value })}>
              {o.label}
            </Chip>
          ))}
        </div>
        <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-[minmax(0,1fr)_300px]">
          <Input
            icon={Search}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Folio, cliente, teléfono o referencia"
            aria-label="Buscar transferencias"
          />
          <DateRangePicker value={f.range} onChange={range => set({ range })} label="Fecha de envío" />
        </div>
      </Card>

      <Card padded={false} className="overflow-hidden">
        <div className="p-5">
          {data === undefined ? (
            <Skeleton className="h-40 w-full" />
          ) : data === null ? (
            <EmptyState
              kind="no-results"
              compact
              title="Transferencias no disponibles"
              description="El servidor no respondió. Reintenta en un momento."
            />
          ) : data.rows.length === 0 ? (
            f.status === 'submitted' && !activeTransferFilters(f) ? (
              <EmptyState
                kind="all-clear"
                compact
                title="Sin transferencias por revisar"
                description="Todos los comprobantes del adelanto están revisados."
              />
            ) : (
              <EmptyState
                kind="no-results"
                compact
                title="Sin resultados"
                description="Ninguna transferencia coincide con los filtros."
                action={
                  <Button variant="secondary" onClick={clear}>
                    Quitar filtros
                  </Button>
                }
              />
            )
          ) : (
            <ul className="flex flex-col divide-y divide-divider" aria-label="Transferencias">
              {data.rows.map(r => {
                const st = transferStatus(r.status);
                return (
                  <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3.5">
                    <div className="min-w-[200px] flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/servicios/${r.service_order_id}`}
                          className="font-mono text-[12.5px] font-semibold text-primary hover:underline"
                        >
                          {r.folio ? `SVC-${r.folio}` : orderCode(r.service_order_id)}
                        </Link>
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </div>
                      <div className="font-sans text-[13.5px] font-semibold text-navy">
                        {r.client_name ?? 'Cliente'}
                        {r.client_phone && <span className="ml-2 font-mono text-[12px] font-normal text-muted">{r.client_phone}</span>}
                      </div>
                      <div className="font-sans text-[12.5px] text-muted">
                        Ref. <span className="font-mono text-body">{r.reference ?? '—'}</span> · enviada {timeAgo(r.created_at)}
                        {r.reviewer_name && r.reviewed_at && ` · revisó ${r.reviewer_name}`}
                      </div>
                      {r.status === 'rejected' && r.reject_reason && (
                        <div className="mt-0.5 font-sans text-[12.5px] italic text-muted">“{r.reject_reason}”</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">Monto</div>
                      <div className="font-mono text-[14px] font-semibold text-navy tabular">{money(r.amount_cents, true)}</div>
                    </div>
                    <Button
                      size="sm"
                      variant={r.status === 'submitted' ? 'primary' : 'secondary'}
                      icon={Eye}
                      onClick={() => setOpenId(r.id)}
                    >
                      {r.status === 'submitted' ? 'Revisar' : 'Ver'}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {data && total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-divider px-5 py-3">
            <span className="font-mono text-[12px] text-muted tabular">
              {from}–{to} de {total}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                icon={ChevronLeft}
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                aria-label="Página anterior"
              >
                Anterior
              </Button>
              <span className="font-mono text-[12px] text-muted tabular">
                {page + 1} / {pages}
              </span>
              <Button
                size="sm"
                variant="secondary"
                disabled={page + 1 >= pages}
                onClick={() => setPage(p => p + 1)}
                aria-label="Página siguiente"
              >
                Siguiente <ChevronRight size={14} aria-hidden />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <TransferSheet id={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}

/**
 * Transferencias aceptadas sobre solicitudes que murieron antes de la visita
 * (base_fee_status refund_pending): finanzas devuelve el dinero fuera de la app
 * y lo registra aquí (admin_confirm_transfer_refund).
 */
export function RefundsPending() {
  useTick();
  const canFinance = useAuth().can('finanzas');
  const { busy, run } = useAction();
  const [target, setTarget] = useState<string | null>(null);
  const [ref, setRef] = useState('');
  const orders = getTransferRefundOrders();
  if (!orders.length) return null;
  const order = orders.find(o => o.id === target) ?? null;

  return (
    <Card padded>
      <div className="mb-2 flex items-start gap-2">
        <Undo2 size={16} className="mt-0.5 text-warning-ink" aria-hidden />
        <h2 className="flex-1 font-sans text-[13.5px] font-semibold text-navy">
          Reembolsos por transferencia ({orders.length})
          <span className="ml-2 font-normal text-muted">
            Se aceptó el comprobante de una solicitud ya cancelada: devuelve el dinero por transferencia y regístralo.
          </span>
        </h2>
      </div>
      <div className="flex flex-col">
        {orders.map(o => (
          <div key={o.id} className="flex flex-wrap items-center gap-3 border-t border-divider py-2.5 first:border-t-0">
            <Link href={`/servicios/${o.id}`} className="font-mono text-[12.5px] font-semibold text-primary hover:underline">
              {orderCode(o.id)}
            </Link>
            <span className="min-w-0 flex-1 truncate font-sans text-[13px] text-body">
              {getProfile(o.client_id)?.full_name ?? 'Cliente'} · {timeAgo(o.updated_at)}
            </span>
            <span className="font-mono text-[13px] font-semibold text-navy tabular">{money(o.base_total_cents ?? 0, true)}</span>
            <Button
              size="sm"
              variant="secondary"
              icon={Landmark}
              disabled={!canFinance || !!busy}
              title={canFinance ? undefined : 'Solo finanzas registra reembolsos'}
              onClick={() => {
                setRef('');
                setTarget(o.id);
              }}
            >
              Registrar reembolso
            </Button>
          </div>
        ))}
      </div>

      <Modal
        open={!!order}
        onClose={() => busy === null && setTarget(null)}
        dismissible={busy === null}
        icon={Landmark}
        tone="warning"
        title="Registrar reembolso por transferencia"
        description="Confirma que ya devolviste el adelanto a la cuenta del cliente. La visita queda reembolsada y se avisa al cliente con la referencia."
        footer={
          <>
            <Button variant="secondary" onClick={() => setTarget(null)} disabled={busy !== null}>
              Volver
            </Button>
            <Button
              loading={busy === 'refund'}
              disabled={!ref.trim()}
              onClick={async () => {
                if (!order) return;
                const ok = await run(
                  'refund',
                  () => confirmTransferRefund(order.id, ref),
                  'Reembolso registrado · se notificó al cliente',
                );
                if (ok) setTarget(null);
              }}
            >
              Registrar
            </Button>
          </>
        }
      >
        {order && (
          <div className="flex flex-col gap-3">
            <Input label="Monto a devolver" value={money(order.base_total_cents ?? 0, true)} readOnly />
            <Input
              label="Referencia de la transferencia de devolución"
              value={ref}
              maxLength={REFUND_REFERENCE_MAX}
              onChange={e => setRef(e.target.value)}
              placeholder="Ej. SPEI 0012345"
            />
          </div>
        )}
      </Modal>
    </Card>
  );
}
