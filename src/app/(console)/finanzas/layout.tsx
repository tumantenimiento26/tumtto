import type { Metadata } from 'next';

// Título de pestaña: «Finanzas · Tumantenimiento» (plantilla del layout raíz).
export const metadata: Metadata = { title: 'Finanzas' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
