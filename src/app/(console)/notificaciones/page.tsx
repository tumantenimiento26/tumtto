'use client';
import { EmptyState, PageHeader } from '@/components/ds';

// ponytail: stub del shell; la pantalla completa (filtros, selección,
// acciones masivas) la construye el agente de pantallas.
export default function NotificacionesPage() {
  return (
    <>
      <PageHeader
        title="Notificaciones"
        description="Cada aviso te lleva a su pantalla."
      />
      <EmptyState
        kind="all-clear"
        title="En construcción"
        description="Mientras tanto usa la campana del header."
      />
    </>
  );
}
