'use client';

import { useEffect, useRef, useState } from 'react';
import { Layers, HardHat, Flame, Hexagon, Map as MapIcon } from 'lucide-react';
import { coverageRing, geometryCenter, type LngLat } from '@/lib/geo';
import { HEAT_GRADIENT, HEAT_STOPS, heatColor } from '@/lib/heatScale';

/**
 * Mapa de cobertura ZMG (Mapbox GL) con datos reales: zonas de
 * `coverage_zones` (GeoJSON de la RPC admin_list_coverage_zones), capa de
 * calor con las solicitudes recientes y anillos de cobertura de los técnicos
 * con base registrada. Hover/selección por feature-state, sincronizada con la
 * lista. La geometría se edita importando GeoJSON (ver Regiones), no a mano.
 *
 * Token: NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN (.env.local, compartido con la app
 * móvil). Sin token renderiza un placeholder utilizable.
 */

export interface MapZone {
  id: string;
  name: string;
  status: 'ok' | 'warn';
  techs: number;
  active: boolean;
  geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: unknown };
}

export interface MapTechBase {
  name: string;
  center: LngLat;
  km: number;
}

const ZMG_CENTER: LngLat = [-103.38, 20.63];

// Rampa de calor estándar verde → amarillo → rojo (lib/heatScale, fuera del kit
// de marca). Densidad baja transparente para no tapar el mapa base.
const HEAT_PAINT = {
  'heatmap-weight': 1,
  'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 9, 0.7, 15, 2.4],
  'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 9, 18, 15, 46],
  'heatmap-color': [
    'interpolate',
    ['linear'],
    ['heatmap-density'],
    0,
    heatColor(0, 0),
    0.15,
    heatColor(0.15, 0.55),
    ...HEAT_STOPS.slice(1).flat(),
  ],
  'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0.8, 16, 0.3],
} as const;

const LAYER_DEFS = [
  { key: 'zonas', icon: Hexagon, tint: 'text-success', label: 'Zonas de cobertura' },
  { key: 'demanda', icon: Flame, tint: 'text-warning', label: 'Demanda (30 días)' },
  { key: 'tecnicos', icon: HardHat, tint: 'text-primary', label: 'Cobertura de técnicos' },
] as const;
type LayerKey = (typeof LAYER_DEFS)[number]['key'];

const zonesGeojson = (zones: MapZone[]) => ({
  type: 'FeatureCollection' as const,
  features: zones.map(z => ({
    type: 'Feature' as const,
    id: z.id,
    properties: { name: z.name, status: z.status, techs: z.techs, active: z.active },
    geometry: z.geometry,
  })),
});
const demandGeojson = (points: LngLat[]) => ({
  type: 'FeatureCollection' as const,
  features: points.map(p => ({
    type: 'Feature' as const,
    properties: {},
    geometry: { type: 'Point' as const, coordinates: p },
  })),
});
const techsGeojson = (bases: MapTechBase[]) => ({
  type: 'FeatureCollection' as const,
  features: bases.map(t => ({
    type: 'Feature' as const,
    properties: { name: t.name, km: t.km },
    geometry: { type: 'Polygon' as const, coordinates: [coverageRing(t.center, t.km)] },
  })),
});

export function CoverageMap({
  zones,
  demand,
  techs,
  selected,
  onSelect,
  height = 520,
}: {
  zones: MapZone[];
  /** Puntos (lng, lat) de solicitudes recientes para la capa de calor. */
  demand: LngLat[];
  techs: MapTechBase[];
  selected: string;
  onSelect: (id: string) => void;
  height?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const selectedRef = useRef(selected);
  const zonesRef = useRef(zones);
  zonesRef.current = zones;
  const [ready, setReady] = useState(false);
  const [noToken, setNoToken] = useState(false);
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    zonas: true,
    demanda: true,
    tecnicos: false,
  });
  const [panelOpen, setPanelOpen] = useState(false);

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

      map = new mapboxgl.Map({
        container: host.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: ZMG_CENTER,
        zoom: 9.9,
        pitch: 0,
        attributionControl: false,
      });
      mapRef.current = map;
      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: false }), 'bottom-left');
      map.addControl(new mapboxgl.ScaleControl({ unit: 'metric' }), 'bottom-right');
      map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'top-left');

      const hoverPopup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 10,
        className: 'zmg-pop',
      });

      map.on('load', () => {
        map.addSource('zonas', {
          type: 'geojson',
          data: zonesGeojson(zonesRef.current),
          promoteId: 'id',
        });
        map.addLayer({
          id: 'zonas-fill',
          type: 'fill',
          source: 'zonas',
          paint: {
            'fill-color': ['case', ['==', ['get', 'status'], 'warn'], '#F59E0B', '#0A6BCF'],
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              0.3,
              ['boolean', ['feature-state', 'hover'], false],
              0.2,
              ['==', ['get', 'active'], false],
              0.04,
              0.1,
            ],
          },
        });
        map.addLayer({
          id: 'zonas-line',
          type: 'line',
          source: 'zonas',
          paint: {
            'line-color': ['case', ['==', ['get', 'status'], 'warn'], '#B45309', '#0A6BCF'],
            'line-width': ['case', ['boolean', ['feature-state', 'selected'], false], 3, 1.6],
            'line-dasharray': ['case', ['==', ['get', 'active'], false], ['literal', [2, 2]], ['literal', [1, 0]]],
          },
        });
        map.addLayer({
          id: 'zonas-label',
          type: 'symbol',
          source: 'zonas',
          layout: {
            'text-field': [
              'format',
              ['get', 'name'],
              { 'font-scale': 1 },
              '\n',
              {},
              ['concat', ['to-string', ['get', 'techs']], ' téc'],
              { 'font-scale': 0.78 },
            ],
            'text-size': 13,
            'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
          },
          paint: {
            'text-color': '#0E2C56',
            'text-halo-color': 'rgba(255,255,255,.92)',
            'text-halo-width': 1.6,
          },
        });

        /* demanda: heatmap + crossfade a puntos */
        map.addSource('demanda', { type: 'geojson', data: demandGeojson([]) });
        map.addLayer(
          { id: 'demanda-heat', type: 'heatmap', source: 'demanda', maxzoom: 16, paint: HEAT_PAINT as never },
          'zonas-label',
        );
        map.addLayer(
          {
            id: 'demanda-pts',
            type: 'circle',
            source: 'demanda',
            minzoom: 12.5,
            paint: {
              'circle-radius': 5,
              'circle-color': '#0A6BCF',
              'circle-stroke-color': '#fff',
              'circle-stroke-width': 1.5,
              'circle-opacity': ['interpolate', ['linear'], ['zoom'], 12.5, 0, 14, 0.85],
              'circle-stroke-opacity': ['interpolate', ['linear'], ['zoom'], 12.5, 0, 14, 1],
            },
          },
          'zonas-label',
        );

        /* cobertura de técnicos */
        map.addSource('tecnicos', { type: 'geojson', data: techsGeojson([]) });
        map.addLayer(
          {
            id: 'tecnicos-fill',
            type: 'fill',
            source: 'tecnicos',
            layout: { visibility: 'none' },
            paint: { 'fill-color': '#18A66A', 'fill-opacity': 0.1 },
          },
          'zonas-label',
        );
        map.addLayer(
          {
            id: 'tecnicos-line',
            type: 'line',
            source: 'tecnicos',
            layout: { visibility: 'none' },
            paint: { 'line-color': '#18A66A', 'line-width': 1.8, 'line-dasharray': [2.2, 1.6] },
          },
          'zonas-label',
        );

        /* interacción zonas */
        let hovered: string | null = null;
        map.on(
          'mousemove',
          'zonas-fill',
          (e: {
            features?: Array<{ id?: string | number; properties?: Record<string, unknown> }>;
            lngLat: unknown;
          }) => {
            const f = e.features?.[0];
            if (!f?.id) return;
            map.getCanvas().style.cursor = 'pointer';
            if (hovered && hovered !== f.id)
              map.setFeatureState({ source: 'zonas', id: hovered }, { hover: false });
            hovered = String(f.id);
            map.setFeatureState({ source: 'zonas', id: hovered }, { hover: true });
            const p = f.properties as { name?: string; techs?: number; active?: boolean };
            hoverPopup
              .setLngLat(e.lngLat as never)
              .setHTML(
                `<div class="zmg-pop-title">${p.name}</div>` +
                  `<div class="zmg-pop-row"><b>${p.techs}</b> técnicos con base · ${p.active === false ? 'pausada' : 'activa'}</div>`,
              )
              .addTo(map);
          },
        );
        map.on('mouseleave', 'zonas-fill', () => {
          map.getCanvas().style.cursor = '';
          if (hovered) map.setFeatureState({ source: 'zonas', id: hovered }, { hover: false });
          hovered = null;
          hoverPopup.remove();
        });
        map.on('click', 'zonas-fill', (e: { features?: Array<{ id?: string | number }> }) => {
          const id = e.features?.[0]?.id;
          if (id) onSelect(String(id));
        });

        if (selectedRef.current)
          map.setFeatureState({ source: 'zonas', id: selectedRef.current }, { selected: true });
        map.resize(); // el contenedor puede medirse tarde (entrada animada del panel)
        setReady(true);
      });

      // Mantén el canvas al tamaño real del panel.
      const ro = new ResizeObserver(() => map?.resize());
      ro.observe(host.current);
      map.once('remove', () => ro.disconnect());
    })();

    return () => {
      cancelled = true;
      mapRef.current = null;
      map?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* datos → fuentes (zonas/demanda/técnicos cambian con el snapshot) */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.getSource('zonas')?.setData(zonesGeojson(zones));
    if (selectedRef.current)
      map.setFeatureState({ source: 'zonas', id: selectedRef.current }, { selected: true });
  }, [zones, ready]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.getSource('demanda')?.setData(demandGeojson(demand));
  }, [demand, ready]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.getSource('tecnicos')?.setData(techsGeojson(techs));
  }, [techs, ready]);

  /* selección externa → feature-state + flyTo (no en el primer render: la vista
     inicial muestra toda la ZMG) */
  const flownOnce = useRef(false);
  useEffect(() => {
    const map = mapRef.current;
    const prev = selectedRef.current;
    selectedRef.current = selected;
    if (!map || !ready) return;
    if (prev && prev !== selected)
      map.setFeatureState({ source: 'zonas', id: prev }, { selected: false });
    if (selected) map.setFeatureState({ source: 'zonas', id: selected }, { selected: true });
    if (!flownOnce.current) {
      flownOnce.current = true;
      return;
    }
    const z = zonesRef.current.find(x => x.id === selected);
    const c = z && geometryCenter(z.geometry);
    if (c) map.flyTo({ center: c, zoom: 11.2, duration: 900, essential: false });
  }, [selected, ready]);

  /* toggles de capas */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const vis = (on: boolean) => (on ? 'visible' : 'none');
    for (const id of ['zonas-fill', 'zonas-line', 'zonas-label'])
      map.setLayoutProperty(id, 'visibility', vis(layers.zonas));
    for (const id of ['demanda-heat', 'demanda-pts'])
      map.setLayoutProperty(id, 'visibility', vis(layers.demanda));
    for (const id of ['tecnicos-fill', 'tecnicos-line'])
      map.setLayoutProperty(id, 'visibility', vis(layers.tecnicos));
  }, [layers, ready]);

  if (noToken) {
    return (
      <div
        style={{ height }}
        className="grid w-full place-items-center rounded-xl border border-line bg-info-soft px-8 text-center"
      >
        <div>
          <MapIcon size={34} className="mx-auto text-primary" />
          <div className="mt-2 text-[14px] font-semibold text-navy">Mapa no disponible</div>
          <div className="mt-1 text-[12.5px] text-muted">
            Define <code className="font-mono">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> en{' '}
            <code className="font-mono">.env.local</code> para ver el mapa real.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height }} className="relative w-full overflow-hidden rounded-xl border border-line">
      {/* Mapbox impone position:relative en el contenedor — dimensiona con h-full, no con inset. */}
      <div ref={host} className="h-full w-full" />

      {/* capas: pill que abre/cierra el panel */}
      <div className="absolute right-3 top-3 flex flex-col items-end">
        <button
          onClick={() => setPanelOpen(o => !o)}
          aria-expanded={panelOpen}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white/95 px-3.5 py-2 text-[12.5px] font-semibold text-navy shadow-hover backdrop-blur transition-colors hover:bg-surface"
        >
          <Layers size={14} className="text-primary" /> Capas
          <span className="rounded-full bg-info-soft px-1.5 py-px font-mono text-[10px] text-primary">
            {Object.values(layers).filter(Boolean).length}
          </span>
        </button>

        {panelOpen && (
          <div className="mt-2 w-60 origin-top-right animate-[capas-in_.18s_cubic-bezier(.2,.7,.3,1)] rounded-xl border border-line bg-white/95 p-3 shadow-hover backdrop-blur">
            {LAYER_DEFS.map(l => {
              const on = layers[l.key];
              return (
                <button
                  key={l.key}
                  role="switch"
                  aria-checked={on}
                  onClick={() => setLayers(s => ({ ...s, [l.key]: !s[l.key] }))}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-1 py-2 text-left hover:bg-surface"
                >
                  <span className={`grid h-7 w-7 place-items-center rounded-lg bg-info-soft ${l.tint}`}>
                    <l.icon size={13} />
                  </span>
                  <span className={`min-w-0 flex-1 text-[12px] font-semibold ${on ? 'text-navy' : 'text-faint'}`}>
                    {l.label}
                  </span>
                  <span
                    className={`relative h-[22px] w-9 flex-shrink-0 rounded-full transition-colors ${on ? 'bg-primary' : 'bg-surface-3'}`}
                  >
                    <span
                      className={`absolute left-[3px] top-[3px] h-4 w-4 rounded-full bg-white shadow-card transition-transform duration-200 ${on ? 'translate-x-[14px]' : ''}`}
                    />
                  </span>
                </button>
              );
            })}
            <div className="mt-1 border-t border-line pt-2">
              <div
                className="h-2 rounded-full"
                style={{
                  background: HEAT_GRADIENT,
                }}
              />
              <div className="mt-1 flex justify-between font-mono text-[8.5px] uppercase tracking-wider text-faint">
                <span>Baja</span>
                <span>Demanda</span>
                <span>Alta</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {!ready && (
        <div className="absolute inset-0 grid place-items-center bg-surface">
          <div className="text-[12.5px] text-muted">Cargando mapa…</div>
        </div>
      )}

      <style>{`
        @keyframes capas-in { from { opacity: 0; transform: translateY(-6px) scale(.97); } }
        .zmg-pop .mapboxgl-popup-content { background: #0E2C56; color: #fff; border-radius: 10px; padding: 10px 13px; box-shadow: 0 18px 40px rgba(14,44,86,.25); font-family: inherit; }
        .zmg-pop .mapboxgl-popup-tip { border-top-color: #0E2C56; border-bottom-color: #0E2C56; }
        .zmg-pop-title { font-weight: 700; font-size: 13px; margin-bottom: 2px; }
        .zmg-pop-row { font-size: 11.5px; opacity: .85; font-variant-numeric: tabular-nums; }
      `}</style>
    </div>
  );
}
