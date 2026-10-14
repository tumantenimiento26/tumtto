import { describe, expect, it } from 'vitest';
import { pointsToPolygon, polygonToPoints } from './geo';

describe('zone drawing helpers', () => {
  const pts: [number, number][] = [
    [-103.4, 20.6],
    [-103.3, 20.6],
    [-103.3, 20.7],
  ];

  it('needs 3 points and closes the ring', () => {
    expect(pointsToPolygon(pts.slice(0, 2))).toBeNull();
    expect(pointsToPolygon(pts)).toEqual({
      type: 'Polygon',
      coordinates: [[...pts, pts[0]]],
    });
  });

  it('round-trips a single-ring polygon back to its vertices', () => {
    expect(polygonToPoints(pointsToPolygon(pts))).toEqual(pts);
  });

  it('does not offer point editing for multipolygons or holes', () => {
    expect(
      polygonToPoints({
        type: 'MultiPolygon',
        coordinates: [[[...pts, pts[0]]]],
      }),
    ).toEqual([]);
    expect(
      polygonToPoints({
        type: 'Polygon',
        coordinates: [
          [...pts, pts[0]],
          [...pts, pts[0]],
        ],
      }),
    ).toEqual([]);
  });
});
