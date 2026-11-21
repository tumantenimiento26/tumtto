import type { Metadata } from 'next';

// Respaldo mientras carga; la página lo cambia por el folio o el nombre
// (useDocumentTitle), p. ej. «SVC-9002 · Técnicos · Tumantenimiento».
export const metadata: Metadata = {
  title: { absolute: 'Detalle de técnico · Técnicos · Tumantenimiento' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
