import type { Metadata } from 'next';

// Título de pestaña: «Asignaciones · Tumantenimiento» (plantilla del layout raíz).
export const metadata: Metadata = { title: 'Asignaciones' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
