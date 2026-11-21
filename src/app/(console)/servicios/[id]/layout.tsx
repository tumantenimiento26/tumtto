import type { Metadata } from 'next';

// Respaldo mientras carga; la página lo cambia por el folio o el nombre
// (useDocumentTitle), p. ej. «SVC-9002 · Servicios · Tumantenimiento».
export const metadata: Metadata = {
  title: { absolute: 'Detalle de servicio · Servicios · Tumantenimiento' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
