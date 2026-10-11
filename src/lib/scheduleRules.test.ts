import { describe, expect, it } from 'vitest';
import {
  emptyRuleForm,
  evaluateSurcharge,
  mxInstant,
  mxParts,
  parsePreview,
  parseRuleValue,
  ruleRpcArgs,
  ruleToForm,
  validateRuleForm,
  valueLabel,
  whenLabel,
  type Holiday,
  type ScheduleRule,
} from './scheduleRules';

const rule = (o: Partial<ScheduleRule>): ScheduleRule => ({
  id: 'r',
  name: 'Regla',
  kind: 'time_band',
  start_time: null,
  end_time: null,
  weekdays: null,
  surcharge_type: 'percent',
  value: 1000,
  is_active: true,
  sort_order: 10,
  created_at: '',
  updated_at: '',
  ...o,
});
const night = rule({ id: 'n', name: 'Nocturno', start_time: '21:00:00', end_time: '07:00:00', value: 1500 });
const sunday = rule({ id: 'd', name: 'Domingo', kind: 'weekday', weekdays: [0], value: 1000 });
const holidayRule = rule({ id: 'h', name: 'Festivo', kind: 'holiday', value: 2000 });
const hol: Holiday[] = [{ date: '2026-11-16', name: 'Revolución', created_at: '', updated_at: '' }];

describe('mxParts / mxInstant', () => {
  it('lee la hora local de México (UTC−6)', () => {
    const p = mxParts('2026-10-04T03:30:00Z');
    expect(p.date).toBe('2026-10-03');
    expect(p.minutes).toBe(21 * 60 + 30);
    expect(p.weekday).toBe(6);
  });
  it('mxInstant es inverso de mxParts', () => {
    expect(mxParts(mxInstant('2026-10-04', '21:30')).label).toBe('2026-10-04 21:30');
  });
});

describe('evaluateSurcharge', () => {
  const base = 40000;
  it('franja que cruza la medianoche: 23:00 y 03:00 sí; 12:00 no; 07:00 (fin exclusivo) no', () => {
    const at = (t: string) => evaluateSurcharge([night], [], base, mxInstant('2026-10-07', t)).cents;
    expect(at('23:00')).toBe(6000);
    expect(at('03:00')).toBe(6000);
    expect(at('12:00')).toBe(0);
    expect(at('07:00')).toBe(0);
    expect(at('21:00')).toBe(6000);
  });
  it('domingo por día de semana', () => {
    expect(evaluateSurcharge([sunday], [], base, mxInstant('2026-10-04', '12:00')).rule?.name).toBe('Domingo');
    expect(evaluateSurcharge([sunday], [], base, mxInstant('2026-10-05', '12:00')).rule).toBeNull();
  });
  it('festivo solo si la fecha está en el calendario', () => {
    expect(evaluateSurcharge([holidayRule], hol, base, mxInstant('2026-11-16', '10:00')).cents).toBe(8000);
    expect(evaluateSurcharge([holidayRule], hol, base, mxInstant('2026-11-17', '10:00')).cents).toBe(0);
  });
  it('gana la de mayor monto (no se suman) y el fijo compite en centavos', () => {
    const fixed = rule({ id: 'f', name: 'Fijo', kind: 'weekday', weekdays: [0], surcharge_type: 'fixed', value: 9000 });
    const r = evaluateSurcharge([night, sunday, fixed], [], base, mxInstant('2026-10-04', '23:00'));
    expect(r.rule?.name).toBe('Fijo');
    expect(r.cents).toBe(9000);
  });
  it('una regla inactiva no aplica', () => {
    expect(evaluateSurcharge([{ ...night, is_active: false }], [], base, mxInstant('2026-10-07', '23:00')).cents).toBe(0);
  });
  it('la hora se evalúa en México, no en UTC', () => {
    // 02:00Z = 20:00 en México: fuera de la franja nocturna aunque en UTC sería «de noche».
    expect(evaluateSurcharge([night], [], base, '2026-10-07T02:00:00Z').cents).toBe(0);
    expect(evaluateSurcharge([night], [], base, '2026-10-07T04:00:00Z').cents).toBe(6000);
  });
});

describe('formato', () => {
  it('describe las reglas', () => {
    expect(whenLabel(night)).toBe('21:00–07:00 (cruza la medianoche)');
    expect(whenLabel(sunday)).toBe('Cada domingo');
    expect(whenLabel({ ...sunday, weekdays: [6, 0] })).toBe('Los días: Sáb, Dom');
    expect(whenLabel(holidayRule)).toMatch(/festivos/);
    expect(valueLabel('percent', 1550)).toBe('15.5%');
    expect(valueLabel('fixed', 5000)).toBe('$50');
  });
});

describe('formulario', () => {
  it('valida por tipo', () => {
    expect(validateRuleForm(emptyRuleForm()).name).toBeTruthy();
    const ok = { ...emptyRuleForm(), name: 'Nocturno', value: '15' };
    expect(validateRuleForm(ok)).toEqual({});
    expect(validateRuleForm({ ...ok, start: '08:00', end: '08:00' }).end).toBeTruthy();
    expect(validateRuleForm({ ...ok, kind: 'weekday', weekdays: [] }).weekdays).toBeTruthy();
    expect(validateRuleForm({ ...ok, kind: 'weekday', weekdays: [0] })).toEqual({});
    expect(validateRuleForm({ ...ok, value: '150' }).value).toBeTruthy();
    expect(validateRuleForm({ ...ok, type: 'fixed', value: '150' })).toEqual({});
    expect(validateRuleForm({ ...ok, value: '0' }).value).toBeTruthy();
  });
  it('convierte % y pesos a bps y centavos', () => {
    expect(parseRuleValue('percent', '12.5')).toBe(1250);
    expect(parseRuleValue('fixed', '75,50')).toBe(7550);
    expect(parseRuleValue('fixed', '')).toBeNaN();
  });
  it('ida y vuelta con la fila', () => {
    const f = ruleToForm(night);
    expect(f).toMatchObject({ start: '21:00', end: '07:00', type: 'percent', value: '15', active: true });
    const a = ruleRpcArgs(f);
    expect(a).toMatchObject({ p_id: 'n', p_kind: 'time_band', p_start_time: '21:00', p_value: 1500 });
    expect(ruleRpcArgs({ ...f, kind: 'holiday' })).toMatchObject({ p_start_time: undefined, p_weekdays: undefined });
  });
});

describe('parsePreview', () => {
  it('tolera faltantes', () => {
    expect(parsePreview(null)).toBeNull();
    expect(parsePreview({ rule_name: 'Nocturno', surcharge_cents: 6000, total_cents: 46000 })).toMatchObject({
      rule_name: 'Nocturno',
      surcharge_cents: 6000,
      total_cents: 46000,
      is_holiday: false,
    });
  });
});
