import { expect, test } from 'vitest';
import { geometryCenter, parseZoneGeoJson, wkbPoint } from './geo';

test('wkbPoint decodifica EWKB hex de PostGIS (SRID 4326)', () => {
  // POINT(-103.3773 20.7062) little-endian con SRID
  const hex = '0101000020E6100000' + le(-103.3773) + le(20.7062);
  const p = wkbPoint(hex);
  expect(p?.[0]).toBeCloseTo(-103.3773, 6);
  expect(p?.[1]).toBeCloseTo(20.7062, 6);
  expect(wkbPoint('zz')).toBeNull();
  expect(wkbPoint({ type: 'Point' })).toBeNull();
});

test('centroide y validación de GeoJSON de zona', () => {
  const poly = { type: 'Polygon', coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]] };
  expect(geometryCenter(poly)).toEqual([0.8, 0.8]);
  expect(parseZoneGeoJson(JSON.stringify(poly)).geometry?.type).toBe('Polygon');
  expect(
    parseZoneGeoJson(JSON.stringify({ type: 'Feature', geometry: poly, properties: {} })).geometry?.type,
  ).toBe('Polygon');
  expect(parseZoneGeoJson('{"type":"Point","coordinates":[1,2]}').error).toMatch(/Polygon/);
  expect(parseZoneGeoJson('nope').error).toMatch(/JSON/);
});

function le(n: number) {
  const b = new ArrayBuffer(8);
  new DataView(b).setFloat64(0, n, true);
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}
