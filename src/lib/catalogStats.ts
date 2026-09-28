// Métricas por categoría para las tarjetas del Catálogo (puro, probado).
// service_categories no guarda rango de precio: se deriva de las tarifas de
// visita (technician_rates.visita_cents) de los técnicos que la ofrecen.

export type CatStats = {
  technicians: number;
  orders: number;
  minCents: number | null;
  maxCents: number | null;
};

export function categoryStats(
  catId: string,
  data: {
    techCategories: { technician_id: string; category_id: string }[];
    rates: { category_id: string; visita_cents: number }[];
    orders: { category_id: string | null }[];
  },
): CatStats {
  const techs = new Set(
    data.techCategories
      .filter(tc => tc.category_id === catId)
      .map(tc => tc.technician_id),
  );
  const visits = data.rates
    .filter(r => r.category_id === catId && r.visita_cents > 0)
    .map(r => r.visita_cents);
  return {
    technicians: techs.size,
    orders: data.orders.filter(o => o.category_id === catId).length,
    minCents: visits.length ? Math.min(...visits) : null,
    maxCents: visits.length ? Math.max(...visits) : null,
  };
}

const mxn = (cents: number) =>
  `$${Math.round(cents / 100).toLocaleString('es-MX')}`;

/** "$300 – $2,500", "$450" o "Sin tarifas". */
export function rangeLabel(s: Pick<CatStats, 'minCents' | 'maxCents'>) {
  if (s.minCents == null || s.maxCents == null) return 'Sin tarifas';
  return s.minCents === s.maxCents
    ? mxn(s.minCents)
    : `${mxn(s.minCents)} – ${mxn(s.maxCents)}`;
}

/** Normaliza y agrega un servicio incluido (sin duplicados, sin vacíos). */
export function addIncluded(list: string[], raw: string): string[] {
  const v = raw.trim().replace(/\s+/g, ' ');
  if (!v) return list;
  const key = v.toLowerCase();
  return list.some(x => x.toLowerCase() === key) ? list : [...list, v];
}
