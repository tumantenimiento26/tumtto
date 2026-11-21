import type { Metadata } from 'next';

// Título de pestaña: «Panel de control · Tumantenimiento» (plantilla del layout raíz).
export const metadata: Metadata = { title: 'Panel de control' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
