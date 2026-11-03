import { describe, expect, it, vi } from 'vitest';
import {
  cancelDeletion,
  deletionBlockedReason,
  formatDeletionDate,
  getPendingDeletion,
  isDeleteConfirmed,
  requestDeletion,
} from './accountDeletion';

const ROW = {
  id: 'r1',
  status: 'pending',
  requested_at: '2026-11-03T18:00:00Z',
  execute_after: '2026-12-03T18:00:00Z',
};

/** Cliente mínimo: solo lo que usan las funciones. */
function fakeClient(opts: {
  rpc?: { data: unknown; error: unknown };
  select?: { data: unknown; error: unknown };
}) {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    maybeSingle: vi.fn(async () => opts.select),
  };
  const client = {
    rpc: vi.fn(async () => opts.rpc),
    from: vi.fn(() => query),
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { client: client as any, query, raw: client };
}

describe('isDeleteConfirmed', () => {
  it('pide ELIMINAR exacto', () => {
    expect(isDeleteConfirmed('ELIMINAR')).toBe(true);
    expect(isDeleteConfirmed('  ELIMINAR ')).toBe(true);
    expect(isDeleteConfirmed('eliminar')).toBe(false);
    expect(isDeleteConfirmed('')).toBe(false);
  });
});

describe('deletionBlockedReason', () => {
  it('muestra tal cual los bloqueos del backend', () => {
    const msg =
      'Tienes servicios en curso. Termínalos o cancélalos antes de eliminar tu cuenta.';
    expect(deletionBlockedReason({ message: msg })).toBe(msg);
  });
  it('null para otros errores', () => {
    expect(deletionBlockedReason({ message: 'not authenticated' })).toBeNull();
    expect(deletionBlockedReason(null)).toBeNull();
    expect(deletionBlockedReason('x')).toBeNull();
  });
});

describe('formatDeletionDate', () => {
  it('fecha larga en hora de la ZMG', () => {
    expect(formatDeletionDate('2026-12-03T18:00:00Z')).toBe('3 de diciembre de 2026');
    // 03:00 UTC aún es el día anterior en Guadalajara.
    expect(formatDeletionDate('2026-12-04T03:00:00Z')).toBe('3 de diciembre de 2026');
  });
});

describe('requestDeletion', () => {
  it('llama la misma RPC que la app y devuelve la solicitud', async () => {
    const { client, raw } = fakeClient({ rpc: { data: ROW, error: null } });
    await expect(requestDeletion(client)).resolves.toEqual(ROW);
    expect(raw.rpc).toHaveBeenCalledWith('request_account_deletion');
  });
  it('propaga el error (p. ej. bloqueo por saldo)', async () => {
    const err = { message: 'Tienes saldo pendiente en tu billetera.' };
    const { client } = fakeClient({ rpc: { data: null, error: err } });
    await expect(requestDeletion(client)).rejects.toBe(err);
  });
});

describe('getPendingDeletion', () => {
  it('lee solo la solicitud pendiente', async () => {
    const { client, raw, query } = fakeClient({ select: { data: ROW, error: null } });
    await expect(getPendingDeletion(client)).resolves.toEqual(ROW);
    expect(raw.from).toHaveBeenCalledWith('account_deletion_requests');
    expect(query.eq).toHaveBeenCalledWith('status', 'pending');
  });
  it('null si no hay', async () => {
    const { client } = fakeClient({ select: { data: null, error: null } });
    await expect(getPendingDeletion(client)).resolves.toBeNull();
  });
});

describe('cancelDeletion', () => {
  it('llama cancel_account_deletion', async () => {
    const { client, raw } = fakeClient({ rpc: { data: ROW, error: null } });
    await cancelDeletion(client);
    expect(raw.rpc).toHaveBeenCalledWith('cancel_account_deletion');
  });
  it('propaga el error', async () => {
    const err = { message: 'no pending deletion request' };
    const { client } = fakeClient({ rpc: { data: null, error: err } });
    await expect(cancelDeletion(client)).rejects.toBe(err);
  });
});
