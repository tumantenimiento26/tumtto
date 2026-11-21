import type { Metadata } from 'next';

// Título de pestaña: «Técnicos · Tumantenimiento» (plantilla del layout raíz).
export const metadata: Metadata = { title: 'Técnicos' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
