import type { Metadata } from 'next';

// Título de pestaña: «Reportes · Tumantenimiento» (plantilla del layout raíz).
export const metadata: Metadata = { title: 'Reportes' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
