import type { Metadata } from 'next';

// Título de pestaña: «Restablecer contraseña · Tumantenimiento» (plantilla del layout raíz).
export const metadata: Metadata = { title: 'Restablecer contraseña' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
