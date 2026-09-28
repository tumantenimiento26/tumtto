'use client';

import { useEffect } from 'react';
import { ErrorPage } from '@/components/ds';

/**
 * Error de una pantalla de la consola: el shell (sidebar/header) sigue vivo y
 * solo el contenido muestra la página 500 con Reintentar.
 */
export default function ConsoleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <ErrorPage
      kind="500"
      reference={
        error.digest
          ? `REF-${error.digest.slice(0, 8).toUpperCase()}`
          : undefined
      }
      primary={{ label: 'Reintentar', onClick: reset }}
      secondary={{ label: 'Ir al dashboard', href: '/dashboard' }}
    />
  );
}
