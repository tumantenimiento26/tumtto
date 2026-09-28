'use client';

import { useCallback, useRef, useState } from 'react';
import { toast } from '@/components/toast';

/**
 * Ejecuta un mutator del store y solo avisa éxito cuando la escritura terminó
 * bien (los mutators devuelven `null` al fallar y ya muestran su toast de
 * error). `busy` = clave de la acción en curso, para deshabilitar botones y
 * evitar doble envío.
 */
export function useAction() {
  const [busy, setBusy] = useState<string | null>(null);
  const running = useRef(false);

  const run = useCallback(
    async (
      key: string,
      fn: () => Promise<unknown>,
      success?: string,
    ): Promise<boolean> => {
      if (running.current) return false;
      running.current = true;
      setBusy(key);
      try {
        const r = await fn();
        const ok = r !== null && r !== undefined && r !== false;
        if (ok && success) toast.success(success);
        return ok;
      } finally {
        running.current = false;
        setBusy(null);
      }
    },
    [],
  );

  return { busy, run };
}
