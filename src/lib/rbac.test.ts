import { expect, test } from 'vitest';
import { can, roleFromMetadata } from './rbac';

test('mapa de permisos del contrato §3', () => {
  expect(can('super_admin', 'finanzas')).toBe(true);
  expect(can('soporte', 'finanzas')).toBe(false);
  expect(can('onboarding', 'kyc')).toBe(true);
  expect(can('legal', 'kyc')).toBe(false);
  expect(can('legal', 'soporte')).toBe(true);
  expect(can('soporte', 'usuarios')).toBe(false);
  expect(can('super_admin', 'usuarios')).toBe(true);
});

test('calificaciones: solo super_admin y soporte', () => {
  expect(can('super_admin', 'calificaciones')).toBe(true);
  expect(can('soporte', 'calificaciones')).toBe(true);
  expect(can('onboarding', 'calificaciones')).toBe(false);
  expect(can('legal', 'calificaciones')).toBe(false);
});

test('rol desde app_metadata con fallback super_admin', () => {
  expect(roleFromMetadata({ admin_role: 'legal' })).toBe('legal');
  expect(roleFromMetadata({ role: 'admin' })).toBe('super_admin');
  expect(roleFromMetadata({ admin_role: 'otra-cosa' })).toBe('super_admin');
  expect(roleFromMetadata(undefined)).toBe('super_admin');
});

test('inventario: solo super_admin y onboarding', () => {
  expect(can('super_admin', 'inventario')).toBe(true);
  expect(can('onboarding', 'inventario')).toBe(true);
  expect(can('soporte', 'inventario')).toBe(false);
  expect(can('legal', 'inventario')).toBe(false);
});
