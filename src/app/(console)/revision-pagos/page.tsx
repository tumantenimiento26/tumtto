'use client';

import { useEffect, useState } from 'react';
import { ErrorPage, PageHeader, ScreenSkeleton, Tabs } from '@/components/ds';
import { useAuth } from '@/lib/auth';
import {
  getCashReviewOrders,
  getTransferReviewOrders,
  loadWorld,
  useTick,
  useWorldFailed,
  useWorldReady,
} from '@/lib/data/store';
import { CashReviewPanel } from './_components/CashReviewPanel';
import { TransfersPanel } from './_components/TransfersPanel';

type Tab = 'transferencias' | 'efectivo';

/**
 * «Revisión de pagos» (TUM-03; antes «Revisión de efectivo»): transferencias
 * del adelanto por cotejar y el efectivo que no cuadra. Backend: los RPC de
 * ambas colas aceptan soporte o finanzas.
 * ?tab=efectivo · ?transfer=<id> abre el detalle de un comprobante.
 */
export default function RevisionPagosPage() {
  useTick();
  const ready = useWorldReady();
  const failed = useWorldFailed();
  const { can } = useAuth();
  const allowed = can('soporte') || can('finanzas');
  const [tab, setTab] = useState<Tab>('transferencias');
  const [initialTransfer, setInitialTransfer] = useState<string | null>(null);

  // Sin useSearchParams para no exigir Suspense en esta página.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get('tab') === 'efectivo') setTab('efectivo');
    setInitialTransfer(q.get('transfer'));
  }, []);

  function changeTab(t: Tab) {
    setTab(t);
    const url = new URL(window.location.href);
    url.search = t === 'efectivo' ? '?tab=efectivo' : '';
    window.history.replaceState(null, '', url);
  }

  if (!allowed) return <ErrorPage kind="403" primary={{ label: 'Ir al panel', href: '/dashboard' }} />;
  if (failed) return <ErrorPage kind="500" primary={{ label: 'Reintentar', onClick: () => void loadWorld(true) }} />;
  if (!ready) return <ScreenSkeleton kind="list" />;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Revisión de pagos"
        description="Coteja las transferencias del adelanto de la visita y resuelve el efectivo que no cuadra."
      />
      <Tabs
        tabs={[
          { value: 'transferencias', label: 'Transferencias', count: getTransferReviewOrders().length },
          { value: 'efectivo', label: 'Efectivo', count: getCashReviewOrders().length },
        ]}
        value={tab}
        onChange={changeTab}
      />
      {tab === 'transferencias' ? <TransfersPanel initialTransfer={initialTransfer} /> : <CashReviewPanel />}
    </div>
  );
}
