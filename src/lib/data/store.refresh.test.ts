// loadWorld/refresh con Supabase simulado: una escritura que termina mientras
// otra carga va en vuelo debe provocar UNA recarga más (antes se unía a la
// carga vieja y el snapshot no traía el cambio), y una recarga fallida no debe
// tirar el snapshot que ya estaba cargado.
import { beforeEach, expect, it, vi } from 'vitest';

const calls = { selects: 0, fail: false };
let release: (() => void) | null = null;

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => {
        calls.selects++;
        if (calls.fail)
          return Promise.resolve({ data: null, error: { message: 'x' } });
        // Solo la primera tabla de cada carga espera a `release`.
        return new Promise(res => {
          const done = () => res({ data: [], error: null });
          if (!release) release = done;
          else done();
        });
      },
    }),
  },
}));

const store = await import('./store');
const TABLES = 15; // tablas que lee loadWorld

beforeEach(() => {
  calls.selects = 0;
  calls.fail = false;
  release = null;
});

it('una carga forzada durante otra en vuelo encadena una recarga', async () => {
  const first = store.loadWorld(true);
  const second = store.loadWorld(true); // escritura terminó durante `first`
  const third = store.loadWorld(true); // otra escritura: comparte la recarga
  expect(third).toBe(second);
  release!();
  release = null;
  await first;
  // La recarga encadenada arranca al terminar la primera.
  await vi.waitFor(() => expect(calls.selects).toBe(TABLES * 2));
  (release as (() => void) | null)?.();
  await second;
  expect(store.useData.getState().status).toBe('ready');
});

it('una recarga fallida conserva el snapshot listo', async () => {
  expect(store.useData.getState().status).toBe('ready');
  calls.fail = true;
  await store.loadWorld(true);
  expect(store.useData.getState().status).toBe('ready');
});
