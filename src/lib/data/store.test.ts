// Selectors of the live data store, exercised over an
// injected demo world (no Supabase in tests — backend writes are RLS/RPC
// pass-throughs verified by typecheck + advisors).
process.env.NEXT_PUBLIC_SUPABASE_URL ||= 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= 'test-anon-key';

import { beforeEach, describe, expect, it } from 'vitest';
import { demoWorld, resetDemoWorld } from '@/lib/demo/world';

const store = await import('./store');

beforeEach(() => {
  resetDemoWorld();
  store.__setWorldForTests(demoWorld());
});

describe('selectors over the world snapshot', () => {
  it('computes metrics in centavos from paid payments', () => {
    const m = store.getMetrics();
    expect(m.gmv).toBe(164000);
    expect(m.platformFee).toBe(24600);
    expect(m.techNet).toBe(164000 - 24600);
    expect(m.totalRequests).toBe(2);
    expect(m.byStatus.closed).toBe(1);
  });

  it('counts services per category', () => {
    const plumbing = store
      .getCategoriesWithCounts()
      .find(c => c.slug === 'plumbing');
    expect(plumbing?.services).toBe(2);
  });

  it('wallet balance is the signed sum of ledger entries', () => {
    expect(store.getWalletBalanceCents('demo-tecnico')).toBe(139400 - 24600);
  });

  it('support badge counts unresolved disputes (+ tickets del backend)', () => {
    // seed: 2 open disputes; los tickets viven en support_tickets (vacío aquí)
    expect(store.getOpenSupportCount()).toBe(2);
  });
});

describe('retiros derivados del ledger', () => {
  // El bug: getAllPayouts leía un arreglo en memoria que en producción SIEMPRE
  // estaba vacío, así que el panel de retiros nunca mostraba nada aunque el
  // ledger tuviera entradas `payout` reales escritas por la app del técnico.
  it('convierte las entradas payout del ledger en retiros, en positivo', () => {
    const world = demoWorld();
    world.ledger.push({
      ...world.ledger[0],
      id: 'led-payout-1',
      technician_id: 'demo-tecnico',
      entry_type: 'payout',
      amount_cents: -80000,
      description: 'Retiro a CLABE',
    });
    store.__setWorldForTests(world);

    const payouts = store.getAllPayouts();
    expect(payouts).toHaveLength(1);
    expect(payouts[0].amount_cents).toBe(80000);
    expect(payouts[0].technician_id).toBe('demo-tecnico');
    expect(store.getPayouts('demo-tecnico')).toHaveLength(1);
    expect(store.getPayouts('u-ag')).toHaveLength(0);
  });

  it('sin entradas payout el panel queda vacío (no inventa filas)', () => {
    expect(store.getAllPayouts()).toHaveLength(0);
  });
});

describe('slugify', () => {
  it('quita acentos y ñ en vez de romper el slug', () => {
    expect(store.slugify('Plomería')).toBe('plomeria');
    expect(store.slugify('  Cerrajería y Señalización ')).toBe(
      'cerrajeria-y-senalizacion',
    );
    expect(store.slugify('¡¡!!')).toBe('');
  });
});
