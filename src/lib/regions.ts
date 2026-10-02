// Estadísticas por municipio para Regiones y cobertura (puras), probadas en
// regions.test.ts. La demanda sale de service_orders.municipality y la oferta
// de la base de cada técnico (technician_locations / technicians.zone_id).

import { mxParts } from '@/lib/dates';

const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

const CANON: Record<string, string> = {
  guadalajara: 'Guadalajara',
  zapopan: 'Zapopan',
  tlaquepaque: 'Tlaquepaque',
  'san pedro tlaquepaque': 'Tlaquepaque',
  tonala: 'Tonalá',
  tlajomulco: 'Tlajomulco',
  'tlajomulco de zuniga': 'Tlajomulco',
  'el salto': 'El Salto',
};

/** Nombre canónico de un municipio de la ZMG (o el original con mayúscula). */
export function canonMunicipality(name: string | null | undefined): string | null {
  if (!name?.trim()) return null;
  return CANON[fold(name)] ?? name.trim();
}

export interface OrderLike {
  id: string;
  municipality: string | null;
  neighborhood: string | null;
  technician_id: string | null;
  status: string;
  created_at: string;
  accepted_at: string | null;
}

export interface TechBase {
  id: string;
  name: string;
  municipality: string | null;
  radiusKm: number;
  rating: number;
  cats: string;
  available: boolean;
}

export interface ZoneRow {
  name: string;
  active: boolean;
  zoneId: string | null;
  techs: number;
  demand7: number;
  ratio: number | null;
  served: number; // % de solicitudes de 7 días que tuvieron técnico
  etaMin: number | null;
}

const DAY = 864e5;

/** Semáforo de solicitudes/técnico: ≥3× rojo, ≥2× ámbar. */
export function ratioTone(r: number | null): 'danger' | 'warning' | 'success' | 'neutral' {
  if (r == null) return 'neutral';
  if (r >= 3) return 'danger';
  if (r >= 2) return 'warning';
  return 'success';
}

export function zoneStats(input: {
  orders: OrderLike[];
  techs: TechBase[];
  zones: { id: string; name: string; is_active: boolean }[];
  arrivals: Record<string, number>; // orderId → minutos de aceptada a en sitio
  now?: Date;
}): ZoneRow[] {
  const now = (input.now ?? new Date()).getTime();
  const names = new Set<string>();
  const zoneByName = new Map<string, { id: string; is_active: boolean }>();
  for (const z of input.zones) {
    const n = canonMunicipality(z.name);
    if (!n) continue;
    names.add(n);
    zoneByName.set(n, z);
  }
  for (const o of input.orders) {
    const n = canonMunicipality(o.municipality);
    if (n) names.add(n);
  }
  for (const t of input.techs) {
    const n = canonMunicipality(t.municipality);
    if (n) names.add(n);
  }
  return [...names].map(name => {
    const recent = input.orders.filter(
      o =>
        canonMunicipality(o.municipality) === name &&
        now - new Date(o.created_at).getTime() < 7 * DAY,
    );
    const techs = input.techs.filter(
      t => canonMunicipality(t.municipality) === name,
    ).length;
    const eta = recent
      .map(o => input.arrivals[o.id])
      .filter((m): m is number => m != null);
    const zone = zoneByName.get(name);
    return {
      name,
      active: zone ? zone.is_active : true,
      zoneId: zone?.id ?? null,
      techs,
      demand7: recent.length,
      ratio: techs ? Math.round((recent.length / techs) * 10) / 10 : recent.length ? Infinity : null,
      served: recent.length
        ? Math.round((recent.filter(o => o.technician_id).length / recent.length) * 100)
        : 0,
      etaMin: eta.length ? Math.round(eta.reduce((s, m) => s + m, 0) / eta.length) : null,
    };
  });
}

/** Solicitudes de hoy por hora (06–23, hora de la ZMG) en el municipio. */
export function hourlyDemand(
  orders: OrderLike[],
  name: string,
  now = new Date(),
): number[] {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const out = Array.from({ length: 18 }, () => 0);
  for (const o of orders) {
    if (canonMunicipality(o.municipality) !== name) continue;
    const d = new Date(o.created_at);
    if (d.getTime() < start.getTime() || d.getTime() > now.getTime()) continue;
    const h = mxParts(d).hour;
    if (h >= 6) out[h - 6] += 1;
  }
  return out;
}

/** Colonias con solicitudes sin técnico (expiradas o esperando) en 30 días. */
export function coverageGaps(
  orders: OrderLike[],
  name: string,
  now = new Date(),
): { neighborhood: string; unserved: number }[] {
  const acc: Record<string, number> = {};
  for (const o of orders) {
    if (canonMunicipality(o.municipality) !== name) continue;
    if (now.getTime() - new Date(o.created_at).getTime() > 30 * DAY) continue;
    if (o.technician_id) continue;
    if (!['requested', 'expired'].includes(o.status)) continue;
    const n = o.neighborhood?.trim() || 'Sin colonia';
    acc[n] = (acc[n] ?? 0) + 1;
  }
  return Object.entries(acc)
    .map(([neighborhood, unserved]) => ({ neighborhood, unserved }))
    .sort((a, b) => b.unserved - a.unserved);
}

/** Minutos de aceptada → en sitio por orden, a partir de los eventos de estado. */
export function arrivalMinutes(
  orders: { id: string; accepted_at: string | null }[],
  events: { service_order_id: string; to_status: string; created_at: string }[],
): Record<string, number> {
  const onsite: Record<string, string> = {};
  for (const e of events) {
    if (e.to_status === 'onsite' && !onsite[e.service_order_id])
      onsite[e.service_order_id] = e.created_at;
  }
  const out: Record<string, number> = {};
  for (const o of orders) {
    const at = onsite[o.id];
    if (!o.accepted_at || !at) continue;
    const m = (new Date(at).getTime() - new Date(o.accepted_at).getTime()) / 6e4;
    if (m >= 0) out[o.id] = Math.round(m);
  }
  return out;
}
