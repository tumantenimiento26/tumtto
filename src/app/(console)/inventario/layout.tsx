import type { Metadata } from 'next';

// Título de pestaña: «Inventario · Tumantenimiento» (plantilla del layout raíz).
export const metadata: Metadata = { title: 'Inventario' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
