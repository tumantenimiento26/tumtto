import { createBrowserClient } from '@supabase/ssr';

import type { Database } from '@/types/supabase';

export type { Database } from '@/types/supabase';

type Client = ReturnType<typeof createBrowserClient<Database>>;

let client: Client | null = null;

/**
 * Cliente de Supabase creado en el primer uso real (no al importar): el build
 * de Next prerenderiza las páginas sin las variables públicas y antes lanzaba.
 */
export function getSupabase(): Client {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY (.env.local / Vercel).',
    );
  }
  // ponytail: browser client only — add a server client + middleware when a
  // server component actually reads the session.
  client = createBrowserClient<Database>(url, anonKey);
  return client;
}

/** Mismo objeto que antes para todos los imports; delega al cliente perezoso. */
export const supabase: Client = new Proxy({} as Client, {
  get(_t, prop) {
    const real = getSupabase() as unknown as Record<PropertyKey, unknown>;
    const v = real[prop];
    return typeof v === 'function' ? (v as (...a: unknown[]) => unknown).bind(real) : v;
  },
});
