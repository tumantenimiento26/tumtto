'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Guardia demo de la consola: sin el flag del login dummy redirige a /login.
 * ponytail: gate con localStorage, sin sesión real — sustituir por Supabase
 * Auth (cookies + middleware) cuando exista backend de auth.
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('tumtto-admin') === '1') setOk(true);
    else router.replace('/login');
  }, [router]);

  if (!ok) return null;
  return <>{children}</>;
}
