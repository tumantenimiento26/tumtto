import type { Metadata } from 'next';

// Título de pestaña: «Equipo y roles · Tumantenimiento» (plantilla del layout raíz).
export const metadata: Metadata = { title: 'Equipo y roles' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
