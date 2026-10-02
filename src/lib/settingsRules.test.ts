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
