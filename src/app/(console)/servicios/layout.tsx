import type { Metadata } from 'next';

// Título de pestaña: «Servicios · Tumantenimiento» (plantilla del layout raíz).
export const metadata: Metadata = { title: 'Servicios' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
