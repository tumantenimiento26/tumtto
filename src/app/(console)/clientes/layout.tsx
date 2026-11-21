import type { Metadata } from 'next';

// Título de pestaña: «Clientes · Tumantenimiento» (plantilla del layout raíz).
export const metadata: Metadata = { title: 'Clientes' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
