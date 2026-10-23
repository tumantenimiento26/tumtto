import type { RequestStatus } from '@/lib/demo/world';

// Stepper de 8 estados del handoff (closing cuenta como "En servicio";
// closed como "Pagado"). Cancelado/expirado = nodo terminal rojo.
export const STEPS: { label: string; statuses: RequestStatus[] }[] = [
  { label: 'Solicitado', statuses: ['requested'] },
  { label: 'Aceptado', statuses: ['accepted'] },
  { label: 'En camino', statuses: ['enroute'] },
  { label: 'En sitio', statuses: ['onsite'] },
  { label: 'Cotización', statuses: ['quote'] },
  { label: 'En servicio', statuses: ['working', 'closing'] },
  { label: 'Completado', statuses: ['completed'] },
  { label: 'Pagado', statuses: ['paid', 'closed'] },
];

export const stepIndex = (s: RequestStatus) => STEPS.findIndex(st => st.statuses.includes(s));

const QUOTE_STEP = stepIndex('quote');

export interface StepperInput {
  status: RequestStatus;
  /** La última cotización fue rechazada (orden closed / completed / paid). */
  rejectedClose: boolean;
  events: { from_status?: string | null; to_status?: string | null }[];
}

/**
 * Paso actual del stepper y si el flujo ya terminó.
 * - Cancelada/expirada: último paso alcanzado antes de cancelar.
 * - Rechazo de cotización con cobro en línea: la orden pasa directo a `closed`
 *   desde «Cotización» y se queda ahí (sin eventos posteriores).
 * - Rechazo con efectivo en persona: la orden sigue closing → completed → paid
 *   como cualquier otra; el stepper sigue el estado real.
 */
export function stepperProgress({ status, rejectedClose, events }: StepperInput): {
  current: number;
  finished: boolean;
} {
  if (status === 'cancelled' || status === 'expired') {
    return {
      current: Math.max(0, ...events.map(e => stepIndex(e.from_status as RequestStatus)).filter(i => i >= 0)),
      finished: false,
    };
  }
  // El propio cierre quote → closed no cuenta como avance; working/closing/completed/paid sí.
  const passedQuote = events.some(
    e => e.to_status !== 'closed' && stepIndex(e.to_status as RequestStatus) > QUOTE_STEP,
  );
  if (rejectedClose && status === 'closed' && !passedQuote) {
    return { current: QUOTE_STEP, finished: true };
  }
  return { current: stepIndex(status), finished: status === 'paid' || status === 'closed' };
}
