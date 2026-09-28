import { expect, test } from 'vitest';
import {
  NOTIF_CHANNELS,
  inQuietHours,
  mutedTypes,
  notifKey,
  readMatrix,
} from './notifPrefs';

const types = ['kyc', 'pagos'] as const;

test('matriz con defaults y lectura de settings', () => {
  const m = readMatrix(types, (k, fb) =>
    k === 'notif_pagos_push' ? false : fb,
  );
  expect(m[notifKey('kyc', 'sms')]).toBe(true);
  expect(m[notifKey('pagos', 'sms')]).toBe(false);
  expect(m[notifKey('pagos', 'push')]).toBe(false);
});

test('tipo silenciado solo si todos sus canales están apagados', () => {
  const m = readMatrix(types, () => true);
  expect(mutedTypes(types, m)).toEqual([]);
  for (const c of NOTIF_CHANNELS) m[notifKey('pagos', c.key)] = false;
  expect(mutedTypes(types, m)).toEqual(['pagos']);
});

test('horario silencioso cruzando medianoche', () => {
  expect(inQuietHours(23, 22, 7)).toBe(true);
  expect(inQuietHours(6, 22, 7)).toBe(true);
  expect(inQuietHours(12, 22, 7)).toBe(false);
  expect(inQuietHours(10, 9, 18)).toBe(true);
  expect(inQuietHours(10, 8, 8)).toBe(false);
});
