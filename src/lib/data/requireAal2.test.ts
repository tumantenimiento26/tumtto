import { beforeEach, describe, expect, it, vi } from 'vitest';

const result = vi.hoisted(() => ({ value: { data: null, error: null } as unknown }));
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => result.value }) }),
    }),
  },
}));

import { fetchRequireAal2 } from './store';

describe('fetchRequireAal2', () => {
  beforeEach(() => vi.spyOn(console, 'warn').mockImplementation(() => {}));

  it('false cuando la key falta o es false (no se fuerza 2FA)', async () => {
    result.value = { data: null, error: null };
    expect(await fetchRequireAal2()).toBe(false);
    result.value = { data: { value: false }, error: null };
    expect(await fetchRequireAal2()).toBe(false);
  });

  it('true cuando está activada', async () => {
    result.value = { data: { value: true }, error: null };
    expect(await fetchRequireAal2()).toBe(true);
    result.value = { data: { value: 'true' }, error: null };
    expect(await fetchRequireAal2()).toBe(true);
  });

  it('true si no se puede leer', async () => {
    result.value = { data: null, error: new Error('x') };
    expect(await fetchRequireAal2()).toBe(true);
  });
});
