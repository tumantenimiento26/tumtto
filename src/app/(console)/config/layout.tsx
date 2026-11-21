import type { Metadata } from 'next';

// Título de pestaña: «Configuración · Tumantenimiento» (plantilla del layout raíz).
export const metadata: Metadata = { title: 'Configuración' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
