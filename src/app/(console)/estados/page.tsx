'use client';
import { PageHeader, ErrorPage } from '@/components/ds';

// ponytail: stub del shell; el catálogo completo (errores, vacíos, avisos,
// carga) lo construye el agente de pantallas.
export default function EstadosPage() {
  return (
    <>
      <PageHeader
        title="Estados y errores"
        description="Catálogo de lo que ve el equipo cuando algo falla, está vacío, cargando o necesita un aviso."
      />
      <ErrorPage
        kind="404"
        primary={{ label: 'Ir al dashboard', href: '/dashboard' }}
      />
    </>
  );
}
