import type { Metadata } from 'next';

// Título de pestaña: «Catálogo · Tumantenimiento» (plantilla del layout raíz).
export const metadata: Metadata = { title: 'Catálogo' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
