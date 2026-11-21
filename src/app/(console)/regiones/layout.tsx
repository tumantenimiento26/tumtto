import type { Metadata } from 'next';

// Título de pestaña: «Regiones y cobertura · Tumantenimiento» (plantilla del layout raíz).
export const metadata: Metadata = { title: 'Regiones y cobertura' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
