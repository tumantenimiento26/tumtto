import type { Metadata } from 'next';

// Título de pestaña: «Liquidaciones · Tumantenimiento» (plantilla del layout raíz).
export const metadata: Metadata = { title: 'Liquidaciones' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
