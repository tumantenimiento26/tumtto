import type { Metadata } from 'next';

// Título de pestaña: «Estados y errores · Tumantenimiento» (plantilla del layout raíz).
export const metadata: Metadata = { title: 'Estados y errores' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
