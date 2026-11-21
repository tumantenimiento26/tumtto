import type { Metadata } from 'next';

// Título de pestaña: «Iniciar sesión · Tumantenimiento» (plantilla del layout raíz).
export const metadata: Metadata = { title: 'Iniciar sesión' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
