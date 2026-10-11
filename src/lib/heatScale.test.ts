import { describe, expect, it } from 'vitest';
import { HEAT_GRADIENT, heatColor } from './heatScale';

describe('heatColor', () => {
  it('hits the stops and clamps', () => {
    expect(heatColor(0)).toBe('rgba(46,204,113,1)');
    expect(heatColor(0.4)).toBe('rgba(241,196,15,1)');
    expect(heatColor(1)).toBe('rgba(231,76,60,1)');
    expect(heatColor(2)).toBe(heatColor(1));
    expect(heatColor(-1, 0.5)).toBe('rgba(46,204,113,0.5)');
  });
  it('interpolates between stops', () => {
    expect(heatColor(0.85)).toBe('rgba(231,101,47,1)');
  });
  it('legend uses the same stops', () => {
    expect(HEAT_GRADIENT).toContain('#2ECC71 0%');
    expect(HEAT_GRADIENT).toContain('#E74C3C 100%');
  });
});
