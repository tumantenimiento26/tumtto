import { describe, expect, it } from 'vitest';
import {
  arrivalMinutes,
  canonMunicipality,
  coverageGaps,
  hourlyDemand,
  ratioTone,
  zoneStats,
  type OrderLike,
} from './regions';

const now = new Date(2026, 8, 28, 20, 0, 0);
const o = (p: Partial<OrderLike> & { id: string }): OrderLike => ({
  municipality: 'Zapopan',
  neighborhood: 'Providencia',
  technician_id: 't1',
  status: 'closed',
  created_at: new Date(2026, 8, 28, 10).toISOString(),
  accepted_at: null,
  ...p,
});

describe('canonMunicipality', () => {
  it('normaliza variantes del geocoder', () => {
    expect(canonMunicipality('San Pedro Tlaquepaque')).toBe('Tlaquepaque');
    expect(canonMunicipality('TONALA')).toBe('Tonalá');
    expect(canonMunicipality('Tlajomulco de Zúñiga')).toBe('Tlajomulco');
    expect(canonMunicipality('  ')).toBeNull();
  });
});

describe('zoneStats', () => {
  it('demanda 7 d, técnicos con base, razón, % atendidas y ETA', () => {
    const rows = zoneStats({
      now,
      orders: [
        o({ id: 'a' }),
        o({ id: 'b', technician_id: null, status: 'expired' }),
        o({ id: 'c', created_at: new Date(2026, 8, 1).toISOString() }), // fuera de 7 d
        o({ id: 'd', municipality: 'Tonalá' }),
      ],
      techs: [{ id: 't1', name: 'R', municipality: 'Zapopan', radiusKm: 10, rating: 5, cats: '', available: true }],
      zones: [{ id: 'z-ton', name: 'Tonalá', is_active: false }],
      arrivals: { a: 20 },
    });
    const zap = rows.find(r => r.name === 'Zapopan')!;
    expect(zap).toMatchObject({ techs: 1, demand7: 2, ratio: 2, served: 50, etaMin: 20, active: true, zoneId: null });
    const ton = rows.find(r => r.name === 'Tonalá')!;
    expect(ton).toMatchObject({ techs: 0, demand7: 1, ratio: Infinity, active: false, zoneId: 'z-ton' });
  });
  it('semáforo', () => {
    expect(ratioTone(3.1)).toBe('danger');
    expect(ratioTone(2)).toBe('warning');
    expect(ratioTone(1)).toBe('success');
    expect(ratioTone(null)).toBe('neutral');
  });
});

describe('hourlyDemand / coverageGaps / arrivalMinutes', () => {
  it('por hora desde las 06', () => {
    const h = hourlyDemand([o({ id: 'a' }), o({ id: 'b', created_at: new Date(2026, 8, 28, 5).toISOString() })], 'Zapopan', now);
    expect(h).toHaveLength(18);
    expect(h[4]).toBe(1); // 10h
    expect(h.reduce((s, v) => s + v, 0)).toBe(1);
  });
  it('colonias sin técnico', () => {
    const g = coverageGaps(
      [o({ id: 'a', technician_id: null, status: 'expired', neighborhood: 'Loma Bonita' }), o({ id: 'b', technician_id: null, status: 'requested', neighborhood: 'Loma Bonita' }), o({ id: 'c' })],
      'Zapopan',
      now,
    );
    expect(g).toEqual([{ neighborhood: 'Loma Bonita', unserved: 2 }]);
  });
  it('minutos aceptada → en sitio', () => {
    const m = arrivalMinutes(
      [{ id: 'a', accepted_at: '2026-09-28T10:00:00Z' }],
      [{ service_order_id: 'a', to_status: 'onsite', created_at: '2026-09-28T10:25:00Z' }],
    );
    expect(m).toEqual({ a: 25 });
  });
});
