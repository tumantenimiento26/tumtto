import { describe, expect, it } from 'vitest';
import {
  PRICE_RANGES,
  easeOutCubic,
  estimate,
  money,
  monthlyIncome,
} from './landing';

describe('estimador de precio', () => {
  it('precio típico = mínimo + 32% del rango, redondeado a $10', () => {
    // Fugas 300–1500 → 300 + 384 = 684 → 680
    const e = estimate(0, false);
    expect(e).toMatchObject({ name: 'Fugas de agua', min: 300, max: 1500 });
    expect(e.typical).toBe(680);
    expect(e.pos).toBeCloseTo(((680 - 300) / 1200) * 100);
  });

  it('urgente multiplica el rango ×1.2', () => {
    const e = estimate(5, true); // Portones 600–5000
    expect(e.min).toBe(720);
    expect(e.max).toBe(6000);
    expect(e.typical).toBe(Math.round((720 + 5280 * 0.32) / 10) * 10);
  });

  it('índice fuera de rango cae al primer servicio', () => {
    expect(estimate(99, false).name).toBe(PRICE_RANGES[0][0]);
  });
});

describe('calculadora de técnicos', () => {
  it('jobs × 4.33 × ticket × 0.85', () => {
    expect(monthlyIncome(12, 1180)).toBeCloseTo(12 * 4.33 * 1180 * 0.85);
    expect(money(monthlyIncome(12, 1180))).toBe('$52,116');
  });
});

describe('utilidades', () => {
  it('money formatea en es-MX sin decimales', () => {
    expect(money(1500)).toBe('$1,500');
  });
  it('easeOutCubic va de 0 a 1', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875);
  });
});
