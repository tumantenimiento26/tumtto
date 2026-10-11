import { describe, expect, it } from 'vitest';
import {
  AGE_BUCKETS,
  ageLabel,
  ageMinutes,
  ageTone,
  assignmentHeadline,
  canReassignStatus,
  inUnassignedInbox,
  isAdminRequest,
  isUnassignedAlert,
  matchesAge,
  rejectNote,
  scheduleLabel,
  scheduleSurchargeLabel,
} from './unassigned';

const NOW = new Date('2026-10-03T18:00:00Z').getTime();
const ago = (min: number) => new Date(NOW - min * 60_000).toISOString();
const order = (p: Partial<Parameters<typeof inUnassignedInbox>[0]> = {}) => ({
  status: 'requested',
  needs_manual_assignment: true,
  technician_id: null,
  assignment_mode: 'admin',
  created_at: ago(10),
  ...p,
});

describe('bandeja', () => {
  it('entra solo con asignación manual, requested y sin técnico', () => {
    expect(inUnassignedInbox(order())).toBe(true);
    expect(inUnassignedInbox(order({ needs_manual_assignment: false }))).toBe(false);
    expect(inUnassignedInbox(order({ status: 'accepted' }))).toBe(false);
    expect(inUnassignedInbox(order({ technician_id: 't1' }))).toBe(false);
  });
  it('distingue solicitudes que Tumtto asigna', () => {
    expect(isAdminRequest({ assignment_mode: 'admin' })).toBe(true);
    expect(isAdminRequest({ assignment_mode: 'emergency' })).toBe(false);
  });
  it('reasignar solo en requested/accepted', () => {
    expect(canReassignStatus('requested')).toBe(true);
    expect(canReassignStatus('accepted')).toBe(true);
    for (const s of ['enroute', 'onsite', 'quote', 'working', 'paid', 'cancelled'])
      expect(canReassignStatus(s)).toBe(false);
  });
});

describe('antigüedad', () => {
  it('etiqueta minutos, horas y días', () => {
    expect(ageLabel(ago(0), NOW)).toBe('ahora');
    expect(ageLabel(ago(8), NOW)).toBe('8 min');
    expect(ageLabel(ago(125), NOW)).toBe('2 h 05 min');
    expect(ageLabel(ago(180), NOW)).toBe('3 h');
    expect(ageLabel(ago(26 * 60), NOW)).toBe('1 d 2 h');
    expect(ageMinutes(ago(-5), NOW)).toBe(0);
  });
  it('buckets son estrictos (>)', () => {
    expect(matchesAge(ago(15), '15m', NOW)).toBe(false);
    expect(matchesAge(ago(16), '15m', NOW)).toBe(true);
    expect(matchesAge(ago(61), '1h', NOW)).toBe(true);
    expect(matchesAge(ago(1440), '24h', NOW)).toBe(false);
    expect(matchesAge(ago(1), 'all', NOW)).toBe(true);
    expect(AGE_BUCKETS.map(b => b.minutes)).toEqual([0, 15, 30, 60, 1440]);
  });
  it('tono según el umbral de alerta', () => {
    expect(ageTone(ago(5), 30, NOW)).toBe('neutral');
    expect(ageTone(ago(20), 30, NOW)).toBe('warning');
    expect(ageTone(ago(31), 30, NOW)).toBe('danger');
  });
  it('alerta solo en la bandeja y pasado el umbral', () => {
    expect(isUnassignedAlert(order({ created_at: ago(31) }), 30, NOW)).toBe(true);
    expect(isUnassignedAlert(order({ created_at: ago(30) }), 30, NOW)).toBe(false);
    expect(isUnassignedAlert(order({ created_at: ago(90), status: 'accepted' }), 30, NOW)).toBe(false);
  });
});

describe('fecha deseada y recargo', () => {
  it('formatea el horario en hora de Guadalajara', () => {
    expect(scheduleLabel(null, null)).toBeNull();
    const l = scheduleLabel('2026-10-07T16:00:00Z', '2026-10-07T18:00:00Z');
    expect(l).toContain('10:00–12:00');
  });
  it('etiqueta el recargo congelado', () => {
    expect(scheduleSurchargeLabel(0)).toBeNull();
    expect(scheduleSurchargeLabel(null)).toBeNull();
    expect(scheduleSurchargeLabel(1500)).toBe('+15%');
    expect(scheduleSurchargeLabel(1250)).toBe('+12.5%');
  });
});

describe('historial', () => {
  it('titulares de asignación, reasignación y rechazo', () => {
    expect(assignmentHeadline({ to_status: 'accepted', note: 'Asignado a Ramón por Ana' })).toBe('Asignado a Ramón por Ana');
    expect(assignmentHeadline({ to_status: 'accepted', note: 'Reasignado a Luis por admin' })).toBe('Reasignado a Luis por admin');
    expect(assignmentHeadline({ to_status: 'cancelled', note: rejectNote(' Sin cobertura ') })).toBe('Rechazado: Sin cobertura');
    expect(assignmentHeadline({ to_status: 'cancelled', note: 'Cancelado por admin' })).toBeNull();
    expect(assignmentHeadline({ to_status: 'accepted', note: null })).toBeNull();
  });
});
