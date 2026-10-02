'use client';

import { useEffect, useRef, useState } from 'react';
import { Map as MapIcon } from 'lucide-react';
import { coverageRing } from '@/lib/geo';

// ponytail: la landing es marketing — polígonos aproximados, hubs de demanda
// deterministas y bases de ejemplo (antes vivían en coverage-map.tsx; la
// consola ya pinta zonas/demanda reales del backend).
const ZONE_POLYGONS: Record<string, [number, number][]> = {
  zap: [
    [-103.52, 20.79],
    [-103.45, 20.82],
    [-103.38, 20.8],
    [-103.36, 20.75],
    [-103.38, 20.7],
    [-103.44, 20.67],
    [-103.5, 20.68],
    [-103.54, 20.73],
  ],
  gdl: [
    [-103.38, 20.7],
    [-103.36, 20.75],
    [-103.3, 20.74],
    [-103.26, 20.7],
    [-103.28, 20.65],
    [-103.33, 20.63],
    [-103.38, 20.65],
  ],
  tlaq: [
    [-103.33, 20.63],
    [-103.28, 20.65],
    [-103.24, 20.62],
    [-103.26, 20.56],
    [-103.32, 20.55],
    [-103.36, 20.58],
  ],
  tlaj: [
    [-103.5, 20.55],
    [-103.42, 20.57],
    [-103.36, 20.55],
    [-103.34, 20.48],
    [-103.4, 20.42],
    [-103.48, 20.44],
    [-103.52, 20.5],
  ],
};

/** Puntos de demanda demo, deterministas, agrupados por hubs reales. */
function demandPoints() {
  let seed = 20260703;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const hubs: [number, number, number, number][] = [
    [-103.39, 20.71, 0.03, 90], // Providencia / Zapopan oriente
    [-103.35, 20.67, 0.025, 70], // GDL centro
    [-103.43, 20.73, 0.035, 60], // Zapopan norte
    [-103.3, 20.59, 0.03, 40], // Tlaquepaque
    [-103.42, 20.5, 0.04, 25], // Tlajomulco
  ];
  const feats = [];
  for (const [cx, cy, spread, count] of hubs) {
    for (let i = 0; i < count; i++) {
      const a = rnd() * Math.PI * 2;
      const r = Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * spread;
      feats.push({
        type: 'Feature' as const,
        properties: { w: 0.4 + rnd() * 0.6 },
        geometry: {
          type: 'Point' as const,
          coordinates: [cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.8],
        },
      });
    }
  }
  return { type: 'FeatureCollection' as const, features: feats };
}

const TECH_BASES: { name: string; center: [number, number]; km: number }[] = [
  { name: 'Ramón Hernández', center: [-103.4, 20.71], km: 10 },
  { name: 'Adriana García', center: [-103.34, 20.66], km: 8 },
  { name: 'Sergio Camarena', center: [-103.3, 20.6], km: 7 },
];

/**
 * Mapa de cobertura para la landing pública (Mapbox GL, tiles oscuros).
 * Reusa los polígonos de zona, hubs de demanda y anillos de técnicos de
 * coverage-map.tsx; aquí la demanda son puntos cian pequeños (no heatmap) y
 * los anillos van punteados en cian, como en el prototipo del handoff.
 * Presentacional: sin selección de zonas ni toggles de capas — solo popups.
 */

const ZONES = [
  {
    id: 'zap',
    name: 'Zapopan',
    ok: true,
    covered: 194,
    colonias: 198,
    techs: 318,
  },
  {
    id: 'gdl',
    name: 'Guadalajara',
    ok: true,
    covered: 240,
    colonias: 245,
    techs: 412,
  },
  {
    id: 'tlaq',
    name: 'Tlaquepaque',
    ok: true,
    covered: 118,
    colonias: 124,
    techs: 142,
  },
  {
    id: 'tlaj',
    name: 'Tlajomulco de Zúñiga',
    ok: false,
    covered: 41,
    colonias: 64,
    techs: 48,
  },
];

function popupHtml(z: (typeof ZONES)[number]) {
  const chip = z.ok
    ? '<span style="display:inline-block;padding:3px 9px;border-radius:999px;font-size:10px;font-weight:700;background:rgba(24,193,255,0.16);color:#18C1FF">Cobertura total</span>'
    : '<span style="display:inline-block;padding:3px 9px;border-radius:999px;font-size:10px;font-weight:700;background:rgba(245,158,11,0.18);color:#F59E0B">Cobertura parcial</span>';
  return (
    '<div style="min-width:170px">' +
    `<div style="font-weight:700;font-size:14px">${z.name}</div>` +
    `<div style="font-size:11.5px;color:rgba(255,255,255,0.6);margin:3px 0 7px">${z.covered} de ${z.colonias} colonias · ${z.techs} técnicos</div>` +
    chip +
    '</div>'
  );
}

export function LandingMap() {
  const host = useRef<HTMLDivElement>(null);
  const [noToken, setNoToken] = useState(false);

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

      // Encuadre: bounds de los polígonos +10%, como el fitBounds del prototipo.
      const all = Object.values(ZONE_POLYGONS).flat();
      const lngs = all.map(p => p[0]);
      const lats = all.map(p => p[1]);
      const padX = (Math.max(...lngs) - Math.min(...lngs)) * 0.1;
      const padY = (Math.max(...lats) - Math.min(...lats)) * 0.1;

      map = new mapboxgl.Map({
        container: host.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        bounds: [
          [Math.min(...lngs) - padX, Math.min(...lats) - padY],
          [Math.max(...lngs) + padX, Math.max(...lats) + padY],
        ],
        scrollZoom: false,
        attributionControl: false,
      });
      map.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
        'top-left',
      );
      map.addControl(
        new mapboxgl.AttributionControl({ compact: true }),
        'bottom-right',
      );

      map.on('load', () => {
        /* demanda: puntos cian pequeños, opacidad por peso */
        map.addSource('demanda', { type: 'geojson', data: demandPoints() });
        map.addLayer({
          id: 'demanda-pts',
          type: 'circle',
          source: 'demanda',
          paint: {
            'circle-radius': 2.2,
            'circle-color': '#18C1FF',
            'circle-opacity': ['+', 0.22, ['*', 0.4, ['get', 'w']]],
          },
        });

        /* anillos de técnicos: punteado cian + punto base */
        map.addSource('tecnicos', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: TECH_BASES.map(t => ({
              type: 'Feature',
              properties: { name: t.name, km: t.km },
              geometry: {
                type: 'Polygon',
                coordinates: [coverageRing(t.center, t.km)],
              },
            })),
          },
        });
        map.addLayer({
          id: 'tecnicos-fill',
          type: 'fill',
          source: 'tecnicos',
          paint: { 'fill-color': '#18C1FF', 'fill-opacity': 0.045 },
        });
        map.addLayer({
          id: 'tecnicos-line',
          type: 'line',
          source: 'tecnicos',
          paint: {
            'line-color': '#18C1FF',
            'line-width': 1.2,
            'line-dasharray': [2, 3],
          },
        });
        map.addSource('tecnicos-base', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: TECH_BASES.map(t => ({
              type: 'Feature',
              properties: {},
              geometry: { type: 'Point', coordinates: t.center },
            })),
          },
        });
        map.addLayer({
          id: 'tecnicos-base',
          type: 'circle',
          source: 'tecnicos-base',
          paint: {
            'circle-radius': 4.5,
            'circle-color': '#0A6BCF',
            'circle-stroke-color': '#fff',
            'circle-stroke-width': 1.5,
          },
        });

        /* polígonos de zona: cian (cobertura) / ámbar (parcial), hover 0.13→0.3 */
        map.addSource('zonas', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: ZONES.map(z => ({
              type: 'Feature',
              id: z.id,
              properties: z,
              geometry: {
                type: 'Polygon',
                coordinates: [[...ZONE_POLYGONS[z.id], ZONE_POLYGONS[z.id][0]]],
              },
            })),
          },
          promoteId: 'id',
        });
        map.addLayer({
          id: 'zonas-fill',
          type: 'fill',
          source: 'zonas',
          paint: {
            'fill-color': ['case', ['get', 'ok'], '#18C1FF', '#F59E0B'],
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.3,
              0.13,
            ],
          },
        });
        map.addLayer({
          id: 'zonas-line',
          type: 'line',
          source: 'zonas',
          paint: {
            'line-color': ['case', ['get', 'ok'], '#18C1FF', '#F59E0B'],
            'line-width': 1.6,
          },
        });

        const popup = new mapboxgl.Popup({
          closeButton: false,
          offset: 10,
          className: 'landing-pop',
        });
        let hovered: string | null = null;
        map.on(
          'mousemove',
          'zonas-fill',
          (e: { features?: Array<{ id?: string | number }> }) => {
            const id = e.features?.[0]?.id;
            if (!id) return;
            map.getCanvas().style.cursor = 'pointer';
            if (hovered && hovered !== id)
              map.setFeatureState(
                { source: 'zonas', id: hovered },
                { hover: false },
              );
            hovered = String(id);
            map.setFeatureState(
              { source: 'zonas', id: hovered },
              { hover: true },
            );
          },
        );
        map.on('mouseleave', 'zonas-fill', () => {
          map.getCanvas().style.cursor = '';
          if (hovered)
            map.setFeatureState(
              { source: 'zonas', id: hovered },
              { hover: false },
            );
          hovered = null;
        });
        map.on(
          'click',
          'zonas-fill',
          (e: {
            features?: Array<{ id?: string | number }>;
            lngLat: unknown;
          }) => {
            const z = ZONES.find(x => x.id === e.features?.[0]?.id);
            if (z)
              popup
                .setLngLat(e.lngLat as never)
                .setHTML(popupHtml(z))
                .addTo(map);
          },
        );
      });

      const ro = new ResizeObserver(() => map?.resize());
      ro.observe(host.current);
      map.once('remove', () => ro.disconnect());
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  if (noToken) {
    return (
      <div className="grid h-full w-full place-items-center bg-[#0A1E3C] px-8 text-center">
        <div>
          <MapIcon size={34} className="mx-auto text-cyan" />
          <div className="mt-2 text-[14px] font-semibold text-white">
            Mapa no disponible
          </div>
          <div className="mt-1 text-[12.5px] text-white/55">
            Define{' '}
            <code className="font-mono">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code>{' '}
            en <code className="font-mono">.env.local</code>.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={host} className="h-full w-full bg-[#0A1E3C]" />
      <style>{`
        .landing-pop .mapboxgl-popup-content { background: #0E2C56; color: #fff; border-radius: 12px; padding: 12px 16px; box-shadow: 0 12px 32px rgba(0,0,0,0.45); font-family: inherit; }
        .landing-pop .mapboxgl-popup-tip { border-top-color: #0E2C56; border-bottom-color: #0E2C56; }
      `}</style>
    </>
  );
}
