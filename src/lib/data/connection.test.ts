// Integration smoke: los endpoints reales de Supabase de los que depende la
// consola. Corre contra el proyecto TUMTTO con las credenciales de .env.local;
// se salta (skip) si faltan env o las credenciales de admin de prueba.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

function loadEnvLocal(): Record<string, string> {
  try {
    const txt = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
    return Object.fromEntries(
      txt
        .split('\n')
        .filter(l => l.includes('=') && !l.trimStart().startsWith('#'))
        .map(l => [
          l.slice(0, l.indexOf('=')).trim(),
          l.slice(l.indexOf('=') + 1).trim(),
        ]),
    );
  } catch {
    return {};
  }
}

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const adminEmail = env.TEST_ADMIN_EMAIL;
const adminPass = env.TEST_ADMIN_PASSWORD;

const NET_TIMEOUT = 20_000;

// Las 15 tablas que loadWorld() lee para armar el snapshot de la consola.
const CONSOLE_TABLES = [
  'profiles',
  'service_categories',
  'technicians',
  'technician_categories',
  'technician_rates',
  'client_addresses',
  'service_orders',
  'service_quotes',
  'service_quote_items',
  'service_order_status_events',
  'payments',
  'ledger_entries',
  'kyc_sessions',
  'disputes',
  'platform_settings',
] as const;

describe.skipIf(!url || !anon)('conexión Supabase · anon', () => {
  const supabase = createClient<Database>(url!, anon!, {
    auth: { persistSession: false },
  });

  it(
    'lee el catálogo público (seed aplicado)',
    { timeout: NET_TIMEOUT },
    async () => {
      const { data, error } = await supabase
        .from('service_categories')
        .select('slug');
      expect(error).toBeNull();
      expect(data!.length).toBeGreaterThan(0);
    },
  );

  it(
    'el servicio de auth responde (login inválido → credenciales inválidas)',
    { timeout: NET_TIMEOUT },
    async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'no-existe@tumtto.mx',
        password: 'incorrecta',
      });
      expect(error?.message).toMatch(/invalid/i);
    },
  );
});

describe.skipIf(!url || !anon || !adminEmail || !adminPass)(
  'conexión Supabase · sesión admin',
  () => {
    const supabase = createClient<Database>(url!, anon!, {
      auth: { persistSession: false },
    });

    beforeAll(async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email: adminEmail!,
        password: adminPass!,
      });
      if (error) throw new Error(`login admin falló: ${error.message}`);
    });
    afterAll(async () => {
      await supabase.auth.signOut();
    });

    it(
      'el perfil del admin tiene role=admin (lo que exige AdminGate)',
      { timeout: NET_TIMEOUT },
      async () => {
        const { data: session } = await supabase.auth.getSession();
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.session!.user.id)
          .single();
        expect(error).toBeNull();
        expect(data!.role).toBe('admin');
      },
    );

    it(
      'RLS admin: ve más perfiles que el propio',
      { timeout: NET_TIMEOUT },
      async () => {
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        expect(error).toBeNull();
        expect(count!).toBeGreaterThan(1);
      },
    );

    it(
      'las 15 tablas del snapshot de la consola son legibles',
      { timeout: NET_TIMEOUT * 2 },
      async () => {
        const results = await Promise.all(
          CONSOLE_TABLES.map(async t => {
            const { error } = await supabase
              .from(t)
              .select('*', { count: 'exact', head: true });
            return { table: t, error };
          }),
        );
        const failed = results.filter(r => r.error);
        expect(
          failed,
          failed.map(f => `${f.table}: ${f.error?.message}`).join(' | '),
        ).toHaveLength(0);
      },
    );

    it(
      'transition_service_order existe (error de dominio, no de función inexistente)',
      { timeout: NET_TIMEOUT },
      async () => {
        const { error } = await supabase.rpc('transition_service_order', {
          p_order_id: crypto.randomUUID(),
          p_to_status: 'accepted',
        });
        expect(error).not.toBeNull(); // orden inexistente → error de dominio
        expect(error!.code).not.toBe('42883'); // undefined_function = RPC no desplegado
      },
    );
  },
);
