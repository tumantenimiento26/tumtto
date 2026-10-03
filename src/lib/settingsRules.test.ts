import { describe, expect, it } from 'vitest';
import { changedSettings, pctToBps, validateSettings } from './settingsRules';

describe('validateSettings', () => {
  it('acepta valores sanos', () => {
    expect(
      validateSettings({
        commission_bps: 1500,
        urgent_surcharge_bps: 2000,
        request_ttl_minutes: 30,
        default_match_radius_m: 15000,
        account_deletion_grace_days: 30,
        enabled_payment_methods: ['card', 'cash'],
        admin_require_aal2: true,
      }),
    ).toEqual({});
  });

  it('rechaza decimales, vacíos, negativos, > 100 % y sin métodos de pago', () => {
    const e = validateSettings({
      request_ttl_minutes: 2.5,
      default_match_radius_m: NaN,
      commission_bps: -500,
      urgent_surcharge_bps: 12000,
      account_deletion_grace_days: 0,
      enabled_payment_methods: [],
    });
    expect(Object.keys(e).sort()).toEqual(
      [
        'account_deletion_grace_days',
        'commission_bps',
        'default_match_radius_m',
        'enabled_payment_methods',
        'request_ttl_minutes',
        'urgent_surcharge_bps',
      ].sort(),
    );
  });
});

describe('validateSettings · emergencias', () => {
  const ok = {
    emergency_initial_radius_m: 3000,
    emergency_radius_step_m: 2000,
    emergency_max_radius_m: 15000,
    emergency_round_seconds: 60,
    emergency_timeout_minutes: 10,
    emergency_surcharge_mode: 'percent',
    emergency_surcharge_bps: 3000,
    emergency_surcharge_fixed_cents: 15000,
  };
  it('acepta los defaults', () => {
    expect(validateSettings(ok)).toEqual({});
  });
  it('rechaza rangos, modo inválido y máximo < inicial', () => {
    const e = validateSettings({
      ...ok,
      emergency_radius_step_m: 0,
      emergency_round_seconds: 0,
      emergency_surcharge_mode: 'otro',
      emergency_surcharge_bps: 20000,
      emergency_surcharge_fixed_cents: -1,
      emergency_max_radius_m: 2000,
    });
    expect(Object.keys(e).sort()).toEqual(
      [
        'emergency_max_radius_m',
        'emergency_radius_step_m',
        'emergency_round_seconds',
        'emergency_surcharge_bps',
        'emergency_surcharge_fixed_cents',
        'emergency_surcharge_mode',
      ].sort(),
    );
  });
});

it('changedSettings solo devuelve lo modificado (arreglos por valor)', () => {
  expect(
    changedSettings(
      { commission_bps: 1600, admin_require_aal2: false, enabled_payment_methods: ['card'] },
      { commission_bps: 1500, admin_require_aal2: false, enabled_payment_methods: ['card'] },
    ),
  ).toEqual({ commission_bps: 1600 });
});

it('pctToBps redondea y conserva NaN', () => {
  expect(pctToBps(15.5)).toBe(1550);
  expect(pctToBps(NaN)).toBeNaN();
});

describe('validateSettings · alerta de solicitudes sin técnico', () => {
  // Los recargos por horario ya no son settings: viven en schedule_surcharge_rules (scheduleRules.ts).
  it('acepta el default', () => {
    expect(validateSettings({ unassigned_alert_minutes: 30 })).toEqual({});
  });
  it('rechaza un umbral fuera de rango', () => {
    expect(Object.keys(validateSettings({ unassigned_alert_minutes: 0 }))).toEqual(['unassigned_alert_minutes']);
  });
});
