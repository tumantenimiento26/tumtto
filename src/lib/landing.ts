// Lógica pura de la landing (estimador de precio y calculadora de ingresos),
// con los rangos y fórmulas exactos del handoff (docs/design-handoff-web).

/** [servicio, mínimo, máximo] en MXN. */
export const PRICE_RANGES: readonly [string, number, number][] = [
  ['Fugas de agua', 300, 1500],
  ['Contactos y apagadores', 200, 1200],
  ['Calentadores', 400, 2500],
  ['Regulador de gas', 300, 1500],
  ['Pintura interior', 500, 4000],
  ['Puertas y portones', 600, 5000],
];

/** Recargo por servicio urgente (×1.2 sobre el rango). */
export const URGENT_FACTOR = 1.2;

export type Estimate = {
  name: string;
  min: number;
  max: number;
  /** Precio típico: mínimo + 32% del rango, redondeado a $10. */
  typical: number;
  /** Posición del típico dentro del rango, 0–100. */
  pos: number;
};

export function estimate(index: number, urgent: boolean): Estimate {
  const [name, lo, hi] = PRICE_RANGES[index] ?? PRICE_RANGES[0];
  const k = urgent ? URGENT_FACTOR : 1;
  const min = lo * k;
  const max = hi * k;
  const typical = Math.round((min + (max - min) * 0.32) / 10) * 10;
  const pos = ((typical - min) / (max - min)) * 100;
  return { name, min, max, typical, pos };
}

/** Ticket medio por categoría para la calculadora de técnicos. */
export const TICKETS: readonly [string, number][] = [
  ['Plomería', 1180],
  ['Electricidad', 860],
  ['Aire acondicionado', 1620],
];

export const COMMISSION = 0.15;
export const WEEKS_PER_MONTH = 4.33;

/** Ingreso mensual estimado: servicios/semana × 4.33 × ticket × (1 − 15%). */
export const monthlyIncome = (jobsPerWeek: number, ticket: number) =>
  jobsPerWeek * WEEKS_PER_MONTH * ticket * (1 - COMMISSION);

export const money = (v: number) =>
  '$' + Math.round(v).toLocaleString('es-MX');

/** Curva ease-out cúbica del count-up de estadísticas. */
export const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);
