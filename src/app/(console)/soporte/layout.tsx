import type { Metadata } from 'next';

// Título de pestaña: «Soporte · Tumantenimiento» (plantilla del layout raíz).
export const metadata: Metadata = { title: 'Soporte' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
