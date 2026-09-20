// Selectors + session-local domains of the live data store, exercised over an
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

  it('support badge counts unresolved disputes + tickets', () => {
    // seed: 2 open disputes + 3 unresolved tickets
    expect(store.getOpenSupportCount()).toBe(5);
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

describe('session-local domains (sin tabla backend todavía)', () => {
  it('notes attach to an entity, newest first', () => {
    store.addNote('SVC-2851', 'Segunda nota');
    const notes = store.getNotes('SVC-2851');
    expect(notes[0].text).toBe('Segunda nota');
    expect(notes.length).toBeGreaterThan(1);
  });

  it('ticket lifecycle: create → reply (admin) → resolve', () => {
    const t = store.createTicket({
      subject: 'Prueba',
      requester_id: 'demo-cliente',
      content: 'hola',
    });
    store.replyTicket(t.id, store.ADMIN_ID, 'respuesta');
    expect(store.getTicket(t.id)?.status).toBe('pending');
    store.resolveTicket(t.id);
    expect(store.getTicket(t.id)?.status).toBe('resolved');
  });

  it('order chat is scoped and chronological', () => {
    store.sendMessage('SVC-2851', store.ADMIN_ID, 'mensaje admin');
    const msgs = store.getMessages('SVC-2851');
    expect(msgs.at(-1)?.content).toBe('mensaje admin');
    expect(store.getMessages('SVC-2835')).toHaveLength(0);
  });
});
