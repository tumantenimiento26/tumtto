import { describe, expect, it } from 'vitest';
import {
  buildHistory,
  emergencyPinRank,
  formatDistance,
  formatDuration,
  groupRounds,
  includedSurchargeCents,
  isActiveEmergency,
  needsManualAssignment,
  parseHistory,
  responseSeconds,
  summarizeRounds,
  surchargeCents,
  surchargeLabel,
} from './emergency';

const log = [
  { round: 2, radius_m: 5000, technician_id: 't3', distance_m: 4200, notified_at: '2026-10-03T10:01:05Z' },
  { round: 1, radius_m: 3000, technician_id: 't2', distance_m: 2100, notified_at: '2026-10-03T10:00:03Z' },
  { round: 1, radius_m: 3000, technician_id: 't1', distance_m: 850, notified_at: '2026-10-03T10:00:01Z' },
];
const nameOf = (id: string) => `Tec ${id}`;

describe('recargo', () => {
  it('formatea % y monto fijo', () => {
    expect(surchargeLabel('percent', 3000, 15000)).toBe('+30%');
    expect(surchargeLabel('percent', 1250, 0)).toBe('+12.5%');
    expect(surchargeLabel('fixed', 3000, 15000)).toContain('150.00');
  });
  it('calcula el recargo por modo', () => {
    expect(surchargeCents('percent', 3000, 15000, 100000)).toBe(30000);
    expect(surchargeCents('fixed', 3000, 15000, 100000)).toBe(15000);
  });
  it('recargo incluido: snapshot o deducido del %', () => {
    expect(includedSurchargeCents({ emergency_surcharge_cents: 15000, total_cents: 1, fallback_bps: 3000 })).toBe(15000);
    expect(includedSurchargeCents({ emergency_surcharge_cents: null, total_cents: 130000, fallback_bps: 3000 })).toBe(30000);
    expect(includedSurchargeCents({ emergency_surcharge_cents: null, total_cents: null, fallback_bps: 3000 })).toBe(0);
  });
});

describe('formatos', () => {
  it('distancia', () => {
    expect(formatDistance(850)).toBe('850 m');
    expect(formatDistance(2400)).toBe('2.4 km');
    expect(formatDistance(3000)).toBe('3 km');
  });
  it('duración', () => {
    expect(formatDuration(45)).toBe('45 s');
    expect(formatDuration(150)).toBe('2 min 30 s');
    expect(formatDuration(120)).toBe('2 min');
    expect(formatDuration(3900)).toBe('1 h 05 min');
  });
});

describe('tiempo de respuesta', () => {
  it('accepted_at − created_at', () => {
    expect(responseSeconds('2026-10-03T10:00:00Z', '2026-10-03T10:02:30Z')).toBe(150);
    expect(responseSeconds('2026-10-03T10:00:00Z', null)).toBeNull();
    expect(responseSeconds('2026-10-03T10:00:00Z', '2026-10-03T09:00:00Z')).toBeNull();
  });
});

describe('rondas', () => {
  it('agrupa y ordena por ronda y hora', () => {
    const r = groupRounds(log, nameOf);
    expect(r.map(x => x.round)).toEqual([1, 2]);
    expect(r[0].notified.map(n => n.technician_id)).toEqual(['t1', 't2']);
    expect(r[0].notified[0].name).toBe('Tec t1');
  });
  it('resumen', () => {
    expect(summarizeRounds(groupRounds(log, nameOf))).toBe(
      '2 rondas · radio 3 → 5 km · 3 técnicos notificados',
    );
    expect(summarizeRounds(groupRounds(log.slice(0, 2), nameOf))).toBe(
      '2 rondas · radio 3 → 5 km · 2 técnicos notificados',
    );
    expect(summarizeRounds(groupRounds([log[1]], nameOf))).toBe(
      '1 ronda · radio 3 km · 1 técnico notificado',
    );
    expect(summarizeRounds([])).toBe('Sin técnicos notificados');
  });
  it('historial calculado', () => {
    const h = buildHistory(
      { created_at: '2026-10-03T10:00:00Z', accepted_at: '2026-10-03T10:01:30Z', technician_id: 't3' },
      log,
      nameOf,
    );
    expect(h.response_seconds).toBe(90);
    expect(h.accepted_by_name).toBe('Tec t3');
    const none = buildHistory({ created_at: '2026-10-03T10:00:00Z', accepted_at: null, technician_id: null }, [], nameOf);
    expect(none.accepted_by_id).toBeNull();
    expect(none.response_seconds).toBeNull();
  });
  it('parsea el jsonb plano del backend (accepted_by + notified con round)', () => {
    const h = parseHistory({
      requested_at: '2026-10-03T10:00:00Z',
      accepted_at: '2026-10-03T10:01:00Z',
      response_seconds: 60,
      accepted_by: { technician_id: 't2', name: 'Beto' },
      rounds: [{ round: 1, radius_m: 3000, notified_count: 1 }, { round: 2, radius_m: 5000, notified_count: 1 }],
      notified: [
        { technician_id: 't1', name: 'Ana', round: 1, radius_m: 3000, distance_m: 500, notified_at: '2026-10-03T10:00:01Z', accepted: false },
        { technician_id: 't2', name: 'Beto', round: 2, radius_m: 5000, distance_m: 4000, notified_at: '2026-10-03T10:01:00Z', accepted: true },
      ],
    });
    expect(h?.rounds.map(r => [r.round, r.radius_m, r.notified.length])).toEqual([[1, 3000, 1], [2, 5000, 1]]);
    expect(h?.accepted_by_name).toBe('Beto');
    expect(h?.accepted_by_id).toBe('t2');
  });
  it('parsea el jsonb de la RPC y tolera basura', () => {
    expect(parseHistory(null)).toBeNull();
    expect(parseHistory({})).toBeNull();
    const h = parseHistory({
      requested_at: '2026-10-03T10:00:00Z',
      accepted_at: '2026-10-03T10:01:00Z',
      accepted_by_name: 'Ana',
      rounds: [{ round: 1, radius_m: 3000, notified: [{ technician_id: 't1', name: 'Ana', distance_m: 500, notified_at: '2026-10-03T10:00:01Z' }] }, 'x'],
    });
    expect(h?.response_seconds).toBe(60);
    expect(h?.rounds).toHaveLength(1);
    expect(h?.rounds[0].notified[0].name).toBe('Ana');
  });
});

describe('estado', () => {
  it('activa y manual', () => {
    const base = { priority: 'emergency', status: 'requested', needs_manual_assignment: true };
    expect(isActiveEmergency(base)).toBe(true);
    expect(needsManualAssignment(base)).toBe(true);
    expect(needsManualAssignment({ ...base, status: 'accepted' })).toBe(false);
    expect(isActiveEmergency({ ...base, status: 'closed' })).toBe(false);
    expect(isActiveEmergency({ priority: 'normal', status: 'requested' })).toBe(false);
  });
  it('rango de fijado: manual < buscando < en curso < no fijada', () => {
    const e = { priority: 'emergency' };
    expect(emergencyPinRank({ ...e, status: 'requested', needs_manual_assignment: true })).toBe(0);
    expect(emergencyPinRank({ ...e, status: 'requested', dispatch_status: 'searching' })).toBe(1);
    expect(emergencyPinRank({ ...e, status: 'enroute', dispatch_status: 'assigned' })).toBe(2);
    expect(emergencyPinRank({ ...e, status: 'closed' })).toBeNull();
    expect(emergencyPinRank({ priority: 'normal', status: 'requested' })).toBeNull();
  });
});
