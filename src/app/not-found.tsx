import type { Metadata } from 'next';

import { ErrorPage } from '@/components/ds';

export const metadata: Metadata = { title: 'Página no encontrada' };

/**
 * 404 global: lo ven sobre todo visitantes del sitio público (las pantallas
 * de la consola tienen su propio 404 de registro), así que no habla de IDs
 * ni de la consola.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-4 py-12">
      <div className="w-full max-w-[760px]">
        <ErrorPage
          kind="404"
          copy={{
            description:
              'La dirección no existe o cambió. Revisa el enlace o vuelve al inicio.',
            steps: [
              'Revisa que la dirección esté bien escrita',
              'Vuelve al inicio y navega desde ahí',
              'Si llegaste por un enlace, avisa a quien lo compartió',
            ],
          }}
          primary={{ label: 'Ir al inicio', href: '/' }}
          secondary={{ label: 'Contáctanos', href: '/#contacto' }}
        />
      </div>
    </main>
  );
}
