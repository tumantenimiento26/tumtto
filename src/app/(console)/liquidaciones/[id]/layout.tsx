import type { Metadata } from 'next';

// Respaldo mientras carga; la página lo cambia por el folio o el nombre
// (useDocumentTitle), p. ej. «SVC-9002 · Liquidaciones · Tumantenimiento».
export const metadata: Metadata = {
  title: { absolute: 'Liquidación del técnico · Liquidaciones · Tumantenimiento' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
