import type { Metadata } from 'next';

// Título de pestaña: «Registro de técnicos · Tumantenimiento» (plantilla del layout raíz).
export const metadata: Metadata = { title: 'Registro de técnicos' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
