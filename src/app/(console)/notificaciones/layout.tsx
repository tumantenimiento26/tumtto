import type { Metadata } from 'next';

// Título de pestaña: «Notificaciones · Tumantenimiento» (plantilla del layout raíz).
export const metadata: Metadata = { title: 'Notificaciones' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
