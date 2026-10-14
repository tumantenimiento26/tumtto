'use client';

import { useEffect, useRef, useState } from 'react';
import { Trash2, Undo2 } from 'lucide-react';
import {
  geometryCenter,
  pointsToPolygon,
  polygonToPoints,
  type LngLat,
  type ZoneShape,
} from '@/lib/geo';

export type { ZoneShape };
import { useTheme } from '@/lib/theme';

const ZMG_CENTER: LngLat = [-103.38, 20.63];
const EMPTY = { type: 'FeatureCollection', features: [] } as const;

const feature = (geometry: unknown) => ({
  type: 'Feature',
  properties: {},
  geometry,
});

/**
 * Dibujo de una zona de cobertura sobre Mapbox: cada clic agrega un vértice;
 * con 3 o más se cierra el polígono. Una geometría que no se puede editar
 * punto a punto (MultiPolygon o importada con huecos) se muestra de fondo y
 * el primer clic empieza un dibujo nuevo que la reemplaza. Las otras zonas se
 * ven tenues como referencia.
 * ponytail: sin arrastrar vértices; «Deshacer punto» y «Borrar» bastan.
 */
export function ZoneDrawMap({
  value,
  onChange,
  others = [],
  height = 320,
}: {
  value: ZoneShape | null;
  onChange: (g: ZoneShape | null) => void;
  others?: ZoneShape[];
  height?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const [points, setPoints] = useState<LngLat[]>(() => polygonToPoints(value));
  // Geometría original no editable punto a punto (se conserva hasta que se dibuje encima).
  const [base, setBase] = useState<ZoneShape | null>(() =>
    value && !polygonToPoints(value).length ? value : null,
  );
  const [ready, setReady] = useState(false);
  const [noToken, setNoToken] = useState(false);
  const dark = useTheme(s => s.theme) === 'dark';

  const pointsRef = useRef(points);
  pointsRef.current = points;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const update = (next: LngLat[]) => {
    setPoints(next);
    if (next.length) setBase(null);
    onChangeRef.current(pointsToPolygon(next) ?? (next.length ? null : base));
  };
  const updateRef = useRef(update);
  updateRef.current = update;

  /* init */
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      setNoToken(true);
      return;
    }
    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any;
    (async () => {
      const mapboxgl = (await import('mapbox-gl')).default;
      if (cancelled || !host.current) return;
      mapboxgl.accessToken = token;
      const start = value ? geometryCenter(value) : null;
      map = new mapboxgl.Map({
        container: host.current,
        style: dark
          ? 'mapbox://styles/mapbox/dark-v11'
          : 'mapbox://styles/mapbox/light-v11',
        center: start ?? ZMG_CENTER,
        zoom: start ? 11 : 9.9,
        attributionControl: false,
      });
      mapRef.current = map;
      map.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
        'bottom-right',
      );
      map.getCanvas().style.cursor = 'crosshair';
      map.doubleClickZoom.disable();
      map.on('load', () => {
        map.addSource('otras', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: others.map(feature) },
        });
        map.addLayer({
          id: 'otras-fill',
          type: 'fill',
          source: 'otras',
          paint: { 'fill-color': '#8FA0B8', 'fill-opacity': 0.12 },
        });
        map.addLayer({
          id: 'otras-line',
          type: 'line',
          source: 'otras',
          paint: {
            'line-color': '#8FA0B8',
            'line-width': 1,
            'line-dasharray': [2, 2],
          },
        });
        map.addSource('zona', { type: 'geojson', data: EMPTY });
        map.addLayer({
          id: 'zona-fill',
          type: 'fill',
          source: 'zona',
          filter: ['==', ['geometry-type'], 'Polygon'],
          paint: { 'fill-color': '#0A6BCF', 'fill-opacity': 0.22 },
        });
        map.addLayer({
          id: 'zona-line',
          type: 'line',
          source: 'zona',
          filter: ['!=', ['geometry-type'], 'Point'],
          paint: { 'line-color': '#0A6BCF', 'line-width': 2.4 },
        });
        map.addLayer({
          id: 'zona-pts',
          type: 'circle',
          source: 'zona',
          filter: ['==', ['geometry-type'], 'Point'],
          paint: {
            'circle-radius': 5,
            'circle-color': '#FFFFFF',
            'circle-stroke-color': '#0A6BCF',
            'circle-stroke-width': 2.5,
          },
        });
        setReady(true);
      });
      map.on('click', (e: { lngLat: { lng: number; lat: number } }) =>
        updateRef.current([
          ...pointsRef.current,
          [+e.lngLat.lng.toFixed(6), +e.lngLat.lat.toFixed(6)],
        ]),
      );
    })();
    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
      setReady(false);
    };
    // El mapa se crea una vez por tema; puntos y zonas se pintan en el efecto de abajo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark]);

  /* pintar */
  useEffect(() => {
    const src = mapRef.current?.getSource?.('zona');
    if (!ready || !src) return;
    const poly = pointsToPolygon(points);
    const features = [
      ...(base ? [feature(base)] : []),
      ...(poly
        ? [feature(poly)]
        : points.length > 1
          ? [feature({ type: 'LineString', coordinates: points })]
          : []),
      ...points.map(p => feature({ type: 'Point', coordinates: p })),
    ];
    src.setData({ type: 'FeatureCollection', features });
  }, [ready, points, base]);

  if (noToken)
    return (
      <div
        className="grid place-items-center rounded-box border border-dashed border-line bg-panel p-6 text-center text-[13px] text-muted"
        style={{ height }}
      >
        Define NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN para dibujar en el mapa, o
        importa un archivo .geojson.
      </div>
    );

  const hint = base
    ? 'Toca el mapa para dibujar una forma nueva (reemplaza la actual).'
    : points.length === 0
      ? 'Toca el mapa para marcar el primer punto del contorno.'
      : points.length < 3
        ? `Faltan ${3 - points.length} punto(s) para cerrar la zona.`
        : `Zona cerrada · ${points.length} puntos. Sigue tocando para afinar el contorno.`;

  return (
    <div>
      <div
        ref={host}
        className="overflow-hidden rounded-box border border-line"
        style={{ height }}
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12.5px] text-muted" aria-live="polite">
          {hint}
        </p>
        <div className="flex gap-1.5">
          <button
            type="button"
            disabled={!points.length}
            onClick={() => update(points.slice(0, -1))}
            className="inline-flex h-8 items-center gap-1.5 rounded-btn border border-line px-2.5 text-[12.5px] font-semibold text-navy hover:bg-panel disabled:opacity-40"
          >
            <Undo2 size={14} /> Deshacer punto
          </button>
          <button
            type="button"
            disabled={!points.length && !base}
            onClick={() => {
              setBase(null);
              setPoints([]);
              onChangeRef.current(null);
            }}
            className="inline-flex h-8 items-center gap-1.5 rounded-btn border border-line px-2.5 text-[12.5px] font-semibold text-error hover:bg-error-soft disabled:opacity-40"
          >
            <Trash2 size={14} /> Borrar
          </button>
        </div>
      </div>
    </div>
  );
}
