// Escala de intensidad de los mapas de calor: verde (baja) → amarillo → rojo (alta).
// Excepción deliberada al kit de marca: la convención de heatmap se lee sin
// explicación, así que NO usa tokens de marca ni se define en globals.css.
export const HEAT_STOPS: readonly [number, string][] = [
  [0, '#2ECC71'],
  [0.4, '#F1C40F'],
  [0.7, '#E67E22'],
  [1, '#E74C3C'],
];

const rgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));

/** Color para una intensidad t ∈ [0, 1], interpolado entre las paradas. */
export function heatColor(t: number, alpha = 1): string {
  const x = Math.min(1, Math.max(0, t));
  const i = Math.max(1, HEAT_STOPS.findIndex(([s]) => s >= x));
  const [s0, c0] = HEAT_STOPS[i - 1];
  const [s1, c1] = HEAT_STOPS[i];
  const k = s1 === s0 ? 0 : (x - s0) / (s1 - s0);
  const [r, g, b] = rgb(c0).map((v, j) => Math.round(v + (rgb(c1)[j] - v) * k));
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Gradiente CSS de la leyenda (mismas paradas). */
export const HEAT_GRADIENT = `linear-gradient(90deg, ${HEAT_STOPS.map(([s, c]) => `${c} ${s * 100}%`).join(', ')})`;
