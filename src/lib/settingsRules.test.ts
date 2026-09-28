import { describe, expect, it } from 'vitest';
import { changedSettings, pctToBps, validateSettings } from './settingsRules';

describe('validateSettings', () => {
  it('acepta valores sanos', () => {
    expect(
      validateSettings({
        commission_bps: 1500,
        request_ttl_minutes: 30,
        cancel_free_window_hours: 0,
        support_email: 'soporte@tumtto.mx',
        platform_name: 'Tumtto',
      }),
    ).toEqual({});
  });

  it('rechaza decimales, vacíos, negativos y > 100 %', () => {
    const e = validateSettings({
      request_ttl_minutes: 2.5,
      noshow_wait_minutes: NaN,
      commission_bps: -500,
      cancel_penalty_bps: 12000,
      sla_dispute_hours: 0,
      support_email: 'nope',
      platform_name: '  ',
    });
    expect(Object.keys(e).sort()).toEqual(
      [
        'cancel_penalty_bps',
        'commission_bps',
        'noshow_wait_minutes',
        'platform_name',
        'request_ttl_minutes',
        'sla_dispute_hours',
        'support_email',
      ].sort(),
    );
  });
});

it('changedSettings solo devuelve lo modificado', () => {
  expect(
    changedSettings(
      { commission_bps: 1600, notif_sms: false, request_ttl_minutes: 30 },
      { commission_bps: 1500, notif_sms: false, request_ttl_minutes: 30 },
    ),
  ).toEqual({ commission_bps: 1600 });
});

it('pctToBps redondea y conserva NaN', () => {
  expect(pctToBps(15.5)).toBe(1550);
  expect(pctToBps(NaN)).toBeNaN();
});
