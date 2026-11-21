'use client';
import { useEffect } from 'react';

/**
 * Título de pestaña con el dato real en las pantallas de detalle (la consola
 * carga en el cliente, así que el folio o el nombre no existen en el servidor):
 * «SVC-9002 · Servicios · Tumantenimiento». El layout del segmento pone el
 * respaldo y Next lo vuelve a poner al salir de la pantalla.
 */
export function useDocumentTitle(...parts: (string | null | undefined)[]) {
  const title = parts.every(Boolean) ? [...parts, 'Tumantenimiento'].join(' · ') : null;
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);
}
