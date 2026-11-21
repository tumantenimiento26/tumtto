import type { Metadata } from 'next';

// Título de pestaña: «Revisión de pagos · Tumantenimiento» (plantilla del layout raíz).
export const metadata: Metadata = { title: 'Revisión de pagos' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
