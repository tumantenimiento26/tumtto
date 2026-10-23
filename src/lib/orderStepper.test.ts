import { describe, expect, it } from 'vitest';
import { STEPS, stepIndex, stepperProgress } from './orderStepper';

const ev = (from: string, to: string) => ({ from_status: from, to_status: to });
const QUOTE = stepIndex('quote');
const PAID = STEPS.length - 1;

describe('stepperProgress', () => {
  it('orden normal: sigue el estado real', () => {
    expect(stepperProgress({ status: 'working', rejectedClose: false, events: [] })).toEqual({
      current: stepIndex('working'),
      finished: false,
    });
    expect(stepperProgress({ status: 'paid', rejectedClose: false, events: [] })).toEqual({
      current: PAID,
      finished: true,
    });
  });

  it('cotización rechazada en persona (closing → completed → paid): llega hasta Pagado', () => {
    const events = [ev('onsite', 'quote'), ev('quote', 'closing'), ev('closing', 'completed'), ev('completed', 'paid')];
    expect(stepperProgress({ status: 'paid', rejectedClose: true, events })).toEqual({ current: PAID, finished: true });
    expect(stepperProgress({ status: 'completed', rejectedClose: true, events })).toEqual({
      current: stepIndex('completed'),
      finished: false,
    });
    expect(stepperProgress({ status: 'closing', rejectedClose: false, events }).current).toBe(stepIndex('working'));
  });

  it('rechazo con cobro en línea (quote → closed directo): se queda en Cotización', () => {
    const events = [ev('onsite', 'quote'), ev('quote', 'closed')];
    expect(stepperProgress({ status: 'closed', rejectedClose: true, events })).toEqual({ current: QUOTE, finished: true });
  });

  it('cancelada: último paso alcanzado', () => {
    const events = [ev('requested', 'accepted'), ev('accepted', 'enroute'), ev('enroute', 'cancelled')];
    expect(stepperProgress({ status: 'cancelled', rejectedClose: false, events })).toEqual({
      current: stepIndex('enroute'),
      finished: false,
    });
  });
});
