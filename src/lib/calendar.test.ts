import { expect, test } from 'vitest';
import {
  inRange,
  monthGrid,
  nextMonday,
  orderRange,
  rangePreset,
  sameDay,
} from './calendar';

test('cuadrícula de 42 días que empieza en lunes', () => {
  const g = monthGrid(2026, 8); // septiembre 2026 (1 = martes)
  expect(g).toHaveLength(42);
  expect(g[0].getDay()).toBe(1);
  expect(sameDay(g[1], new Date(2026, 8, 1))).toBe(true);
});

test('próximo lunes', () => {
  expect(sameDay(nextMonday(new Date(2026, 8, 28)), new Date(2026, 9, 5))).toBe(
    true,
  ); // lunes → siguiente lunes
  expect(sameDay(nextMonday(new Date(2026, 8, 30)), new Date(2026, 9, 5))).toBe(
    true,
  ); // miércoles
});

test('presets y pertenencia a rango', () => {
  const now = new Date(2026, 8, 28, 15);
  const r7 = rangePreset('7d', now)!;
  expect(sameDay(r7.from, new Date(2026, 8, 22))).toBe(true);
  expect(inRange(new Date(2026, 8, 22, 23), r7)).toBe(true);
  expect(inRange(new Date(2026, 8, 21), r7)).toBe(false);
  expect(rangePreset('all', now)).toBeNull();
  const lm = rangePreset('lastMonth', now)!;
  expect(sameDay(lm.to, new Date(2026, 7, 31))).toBe(true);
  expect(
    orderRange(new Date(2026, 1, 5), new Date(2026, 1, 1)).from.getDate(),
  ).toBe(1);
});
