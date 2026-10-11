// Reglas de recargo por horario y festivos del modo maqueta (modelo de cobro v2).
// Coherentes con las órdenes de demo/payments.ts, que congelan estas reglas.
import type { Holiday, ScheduleRule } from '@/lib/scheduleRules';

const at = '2026-09-28T16:00:00.000Z';
const rule = (o: Partial<ScheduleRule> & Pick<ScheduleRule, 'id' | 'name' | 'kind' | 'value' | 'sort_order'>): ScheduleRule => ({
  start_time: null,
  end_time: null,
  weekdays: null,
  surcharge_type: 'percent',
  is_active: true,
  created_at: at,
  updated_at: at,
  ...o,
});

export const DEMO_RULE_NIGHT = 'mock-rule-night';
export const DEMO_RULE_SUNDAY = 'mock-rule-sunday';
export const DEMO_RULE_HOLIDAY = 'mock-rule-holiday';

export const DEMO_RULES: ScheduleRule[] = [
  rule({ id: DEMO_RULE_NIGHT, name: 'Nocturno', kind: 'time_band', start_time: '21:00:00', end_time: '07:00:00', value: 1500, sort_order: 10 }),
  rule({ id: DEMO_RULE_SUNDAY, name: 'Domingo', kind: 'weekday', weekdays: [0], value: 1000, sort_order: 20 }),
  rule({ id: DEMO_RULE_HOLIDAY, name: 'Festivo', kind: 'holiday', value: 2000, sort_order: 30 }),
  rule({
    id: 'mock-rule-dawn',
    name: 'Madrugada (monto fijo)',
    kind: 'time_band',
    start_time: '00:00:00',
    end_time: '05:00:00',
    surcharge_type: 'fixed',
    value: 7500,
    is_active: false,
    sort_order: 40,
  }),
];

const h = (date: string, name: string): Holiday => ({ date, name, created_at: at, updated_at: at });
/** Festivos obligatorios de la LFT, 2026-2027. */
export const DEMO_HOLIDAYS: Holiday[] = [
  h('2026-01-01', 'Año Nuevo'),
  h('2026-02-02', 'Día de la Constitución'),
  h('2026-03-16', 'Natalicio de Benito Juárez'),
  h('2026-05-01', 'Día del Trabajo'),
  h('2026-09-16', 'Día de la Independencia'),
  h('2026-11-16', 'Día de la Revolución'),
  h('2026-12-25', 'Navidad'),
  h('2027-01-01', 'Año Nuevo'),
  h('2027-02-01', 'Día de la Constitución'),
  h('2027-03-15', 'Natalicio de Benito Juárez'),
  h('2027-05-01', 'Día del Trabajo'),
  h('2027-09-16', 'Día de la Independencia'),
  h('2027-11-15', 'Día de la Revolución'),
  h('2027-12-25', 'Navidad'),
];
