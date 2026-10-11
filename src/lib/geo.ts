// Geometría mínima para la consola (puro, probado en geo.test.ts).

export type LngLat = [number, number];

/**
 * PostGIS devuelve geography/geometry por REST como EWKB hex
 * ("0101000020E6100000…"). Extrae el punto (lng, lat); null si no es un POINT.
 */
export function wkbPoint(hex: unknown): LngLat | null {
  if (typeof hex !== 'string' || hex.length < 42) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const b = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    if (Number.isNaN(b)) return null;
    bytes[i] = b;
  }
  const view = new DataView(bytes.buffer);
  const little = bytes[0] === 1;
  const type = view.getUint32(1, little);
  if ((type & 0xff) !== 1) return null; // 1 = Point
  const offset = 5 + (type & 0x20000000 ? 4 : 0); // SRID flag
  if (bytes.length < offset + 16) return null;
  return [view.getFloat64(offset, little), view.getFloat64(offset + 8, little)];
}

/** Distancia en metros entre dos puntos (haversine). */
export function distanceM(a: LngLat, b: LngLat): number {
  const R = 6_371_000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b[1] - a[1]);
  const dLng = rad(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.min(1, Math.sqrt(h))));
}

/** Centroide (promedio de vértices) de un Polygon/MultiPolygon GeoJSON. */
export function geometryCenter(geometry: {
  type: string;
  coordinates: unknown;
}): LngLat | null {
  const pts: LngLat[] = [];
  const walk = (c: unknown) => {
    if (!Array.isArray(c)) return;
    if (typeof c[0] === 'number') pts.push([c[0] as number, c[1] as number]);
    else c.forEach(walk);
  };
  walk(geometry.coordinates);
  if (!pts.length) return null;
  return [
    pts.reduce((s, p) => s + p[0], 0) / pts.length,
    pts.reduce((s, p) => s + p[1], 0) / pts.length,
  ];
}

/** Anillo de cobertura (círculo geodésico aproximado) alrededor de una base. */
export function coverageRing(center: LngLat, km: number): LngLat[] {
  const pts: LngLat[] = [];
  const kmLat = km / 110.574;
  const kmLng = km / (111.32 * Math.cos((center[1] * Math.PI) / 180));
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    pts.push([center[0] + Math.cos(a) * kmLng, center[1] + Math.sin(a) * kmLat]);
  }
  return pts;
}

/** Valida el GeoJSON pegado por el admin: Polygon/MultiPolygon (o Feature con uno). */
export function parseZoneGeoJson(
  text: string,
): { geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: unknown }; error: null } | { geometry: null; error: string } {
  let v: unknown;
  try {
    v = JSON.parse(text);
  } catch {
    return { geometry: null, error: 'No es JSON válido.' };
  }
  let g = v as { type?: string; geometry?: unknown; features?: unknown[]; coordinates?: unknown };
  if (g?.type === 'FeatureCollection' && Array.isArray(g.features) && g.features.length)
    g = (g.features[0] as { geometry: typeof g }).geometry;
  if (g?.type === 'Feature') g = g.geometry as typeof g;
  if (g?.type !== 'Polygon' && g?.type !== 'MultiPolygon')
    return { geometry: null, error: 'Se espera un Polygon o MultiPolygon (o un Feature con uno).' };
  if (!Array.isArray(g.coordinates) || !g.coordinates.length)
    return { geometry: null, error: 'El polígono no tiene coordenadas.' };
  return { geometry: { type: g.type, coordinates: g.coordinates }, error: null };
}
