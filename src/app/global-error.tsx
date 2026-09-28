'use client';

import './globals.css';
import { ErrorPage } from '@/components/ds';

/** Último recurso: falla el layout raíz. Reemplaza <html>, por eso lo incluye. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="bg-page">
        <main className="flex min-h-screen items-center justify-center px-4 py-12">
          <div className="w-full max-w-[760px]">
            <ErrorPage
              kind="500"
              reference={
                error.digest
                  ? `REF-${error.digest.slice(0, 8).toUpperCase()}`
                  : undefined
              }
              primary={{ label: 'Reintentar', onClick: reset }}
              secondary={{ label: 'Ir al inicio', href: '/' }}
            />
          </div>
        </main>
      </body>
    </html>
  );
}
