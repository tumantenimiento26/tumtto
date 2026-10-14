import { describe, expect, it } from 'vitest';
import {
  agoLabel,
  assignmentCounts,
  assignmentNotifHref,
  confirmationLabel,
  confirmationState,
  filterAssignments,
  isAssignmentNotifKind,
  minutesLabel,
  parseAssignments,
  rowWaitTone,
  waitTone,
  waitingMinutes,
  type AssignmentRow,
} from './assignments';

const NOW = Date.parse('2026-10-14T12:00:00Z');
const ago = (min: number) => new Date(NOW - min * 60_000).toISOString();

const row = (p: Partial<AssignmentRow> & { id: string }): AssignmentRow => ({
  folio: 1,
  created_at: ago(10),
  category: { id: 'c', slug: 'plomeria', name: 'Plomería' },
  client: { id: 'u', name: 'Carlos' },
  zone: null,
  scheduled_for: null,
  scheduled_until: null,
  status: 'requested',
  technician: null,
  assigned_by_admin_at: null,
  assignment_ack_at: null,
  waiting_minutes: 0,
  ...p,
});

const pend1 = row({ id: 'p1', created_at: ago(50) });
const pend2 = row({ id: 'p2', created_at: ago(5) });
const asg = row({
  id: 'a1',
  status: 'accepted',
  technician: { id: 't', name: 'Luis' },
  assigned_by_admin_at: ago(20),
  created_at: ago(40),
});
const conf = row({
  id: 'c1',
  status: 'accepted',
  technician: { id: 't', name: 'Luis' },
  assigned_by_admin_at: ago(100),
  assignment_ack_at: ago(90),
  created_at: ago(120),
});
const canc = row({ id: 'x1', status: 'cancelled', created_at: ago(200) });
const all = [conf, asg, pend2, canc, pend1];

describe('filterAssignments', () => {
  it('pendientes: sin técnico y requested, la más antigua primero', () => {
    expect(filterAssignments(all, 'pendientes').map(r => r.id)).toEqual([
      'p1',
      'p2',
    ]);
  });
  it('asignadas: con técnico sin confirmar', () => {
    expect(filterAssignments(all, 'asignadas').map(r => r.id)).toEqual(['a1']);
  });
  it('confirmadas', () => {
    expect(filterAssignments(all, 'confirmadas').map(r => r.id)).toEqual([
      'c1',
    ]);
  });
  it('todas: pendientes primero y luego la más nueva primero', () => {
    expect(filterAssignments(all, 'todas').map(r => r.id)).toEqual([
      'p1',
      'p2',
      'a1',
      'c1',
      'x1',
    ]);
  });
  it('una cancelada sin técnico no es pendiente', () => {
    expect(filterAssignments([canc], 'pendientes')).toEqual([]);
  });
  it('cuenta por pestaña', () => {
    expect(assignmentCounts(all)).toEqual({
      pendientes: 2,
      asignadas: 1,
      confirmadas: 1,
      todas: 5,
    });
  });
  it('no muta la entrada', () => {
    const copy = [...all];
    filterAssignments(all, 'todas');
    expect(all).toEqual(copy);
  });
});

describe('espera', () => {
  it('pendiente: en vivo desde la creación', () => {
    expect(waitingMinutes(pend1, NOW)).toBe(50);
  });
  it('asignada: congelada creación → asignación', () => {
    expect(waitingMinutes(asg, NOW)).toBe(20);
  });
  it('sin fecha de asignación usa waiting_minutes del servidor', () => {
    expect(waitingMinutes(canc, NOW)).toBe(0);
    expect(waitingMinutes({ ...canc, waiting_minutes: 7 }, NOW)).toBe(7);
  });
  it('tonos con umbral 30 min', () => {
    expect(waitTone(14)).toBe('neutral');
    expect(waitTone(15)).toBe('warning');
    expect(waitTone(30)).toBe('warning');
    expect(waitTone(31)).toBe('danger');
    expect(waitTone(70, 120)).toBe('warning');
  });
  it('sólo las pendientes alertan', () => {
    expect(rowWaitTone(pend1, 30, NOW)).toBe('danger');
    expect(rowWaitTone(pend2, 30, NOW)).toBe('neutral');
    expect(rowWaitTone(asg, 30, NOW)).toBe('neutral');
  });
  it('etiquetas de minutos', () => {
    expect(minutesLabel(0)).toBe('ahora');
    expect(minutesLabel(8)).toBe('8 min');
    expect(minutesLabel(125)).toBe('2 h 05 min');
    expect(minutesLabel(120)).toBe('2 h');
    expect(minutesLabel(1620)).toBe('1 d 3 h');
    expect(minutesLabel(1440)).toBe('1 d');
  });
});

describe('confirmación', () => {
  it('estados y copy', () => {
    expect(confirmationState(pend1)).toBe('none');
    expect(confirmationLabel(pend1, NOW)).toBeNull();
    expect(confirmationState(asg)).toBe('waiting');
    expect(confirmationLabel(asg, NOW)).toBe('Esperando confirmación');
    expect(confirmationState(conf)).toBe('confirmed');
    expect(confirmationLabel(conf, NOW)).toBe('Confirmada hace 1 h');
  });
  it('agoLabel', () => {
    expect(agoLabel(ago(0), NOW)).toBe('hace un momento');
    expect(agoLabel(ago(5), NOW)).toBe('hace 5 min');
    expect(agoLabel(ago(180), NOW)).toBe('hace 3 h');
    expect(agoLabel(ago(3000), NOW)).toBe('hace 2 d');
  });
});

describe('parseAssignments', () => {
  it('normaliza el jsonb del RPC', () => {
    const rows = parseAssignments([
      {
        id: 'o1',
        folio: 1234,
        created_at: ago(5),
        category: { id: 'c1', slug: 'plomeria', name: 'Plomería' },
        client: { id: 'u1', name: 'Carlos Pérez' },
        zone: null,
        scheduled_for: null,
        scheduled_until: null,
        status: 'requested',
        technician: null,
        assigned_by_admin_at: null,
        assignment_ack_at: null,
        waiting_minutes: 5,
      },
      { id: null },
      'basura',
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: 'o1',
      folio: 1234,
      zone: null,
      technician: null,
    });
    expect(rows[0].client?.name).toBe('Carlos Pérez');
  });
  it('no-array → []', () => {
    expect(parseAssignments(null)).toEqual([]);
    expect(parseAssignments({})).toEqual([]);
  });
});

describe('notificaciones', () => {
  it('reconoce los dos kinds', () => {
    expect(isAssignmentNotifKind('admin_request_created')).toBe(true);
    expect(isAssignmentNotifKind('assignment_acknowledged')).toBe(true);
    expect(isAssignmentNotifKind('order_assigned')).toBe(false);
  });
  it('rutas', () => {
    expect(assignmentNotifHref('admin_request_created', 'o1')).toBe(
      '/asignaciones',
    );
    expect(assignmentNotifHref('assignment_acknowledged', 'o1')).toBe(
      '/servicios/o1',
    );
    expect(assignmentNotifHref('assignment_acknowledged', null)).toBe(
      '/asignaciones',
    );
  });
});
