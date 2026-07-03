'use client';

import { useEffect, useRef, useState } from 'react';
import { Layers, HardHat, Flame, Hexagon, Map as MapIcon } from 'lucide-react';

/**
 * Mapa real de cobertura ZMG (Mapbox GL). Polígonos municipales aproximados
 * con hover/selección por feature-state, capa de calor de demanda (misma
 * config de producción que la lámina del design system: rampa de marca +
 * crossfade a puntos al acercar), anillos de cobertura de técnicos y toggles
 * de capas funcionales. Sincroniza selección en ambos sentidos con la lista.
 *
 * Token: NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN (.env.local, compartido con la app
 * móvil). Sin token renderiza un placeholder utilizable.
 */

export interface MapZone {
  id: string;
  name: string;
  status: 'ok' | 'warn';
  techs: number;
  covered: number;
  colonias: number;
}

// ponytail: polígonos aproximados dibujados a mano sobre la mancha urbana —
// suficientes para operación visual; sustituir por GeoJSON municipal (INEGI)
// vía "Importar GeoJSON" cuando exista el flujo.
const ZONE_POLYGONS: Record<string, [number, number][]> = {
  zap: [
    [-103.52, 20.79], [-103.45, 20.82], [-103.38, 20.80], [-103.36, 20.75],
    [-103.38, 20.70], [-103.44, 20.67], [-103.50, 20.68], [-103.54, 20.73],
  ],
  gdl: [
    [-103.38, 20.70], [-103.36, 20.75], [-103.30, 20.74], [-103.26, 20.70],
    [-103.28, 20.65], [-103.33, 20.63], [-103.38, 20.65],
  ],
  tlaq: [
    [-103.33, 20.63], [-103.28, 20.65], [-103.24, 20.62], [-103.26, 20.56],
    [-103.32, 20.55], [-103.36, 20.58],
  ],
  tlaj: [
    [-103.50, 20.55], [-103.42, 20.57], [-103.36, 20.55], [-103.34, 20.48],
    [-103.40, 20.42], [-103.48, 20.44], [-103.52, 20.50],
  ],
};

const ZMG_CENTER: [number, number] = [-103.38, 20.63];

// Rampa de calor de marca — misma config de producción de la Lám. 08.
const HEAT_PAINT = {
  'heatmap-weight': ['interpolate', ['linear'], ['get', 'w'], 0, 0.4, 1, 1],
  'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 9, 0.7, 15, 2.4],
  'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 9, 18, 15, 46],
  'heatmap-color': [
    'interpolate', ['linear'], ['heatmap-density'],
    0, 'rgba(10,107,207,0)', 0.25, '#0A6BCF', 0.5, '#18C1FF', 0.75, '#F59E0B', 1, '#DC2626',
  ],
  'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0.8, 16, 0.3],
} as const;

/** Puntos de demanda demo, deterministas, agrupados por hubs reales. */
function demandPoints() {
  let seed = 20260703;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const hubs: [number, number, number, number][] = [
    [-103.39, 20.71, 0.030, 90],  // Providencia / Zapopan oriente
    [-103.35, 20.67, 0.025, 70],  // GDL centro
    [-103.43, 20.73, 0.035, 60],  // Zapopan norte
    [-103.30, 20.59, 0.030, 40],  // Tlaquepaque
    [-103.42, 20.50, 0.040, 25],  // Tlajomulco
  ];
  const feats = [];
  for (const [cx, cy, spread, count] of hubs) {
    for (let i = 0; i < count; i++) {
      const a = rnd() * Math.PI * 2;
      const r = Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * spread;
      feats.push({
        type: 'Feature' as const,
        properties: { w: 0.4 + rnd() * 0.6 },
        geometry: { type: 'Point' as const, coordinates: [cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.8] },
      });
    }
  }
  return { type: 'FeatureCollection' as const, features: feats };
}

/** Anillo de cobertura (círculo geodésico aproximado) alrededor de una base. */
function coverageRing(center: [number, number], km: number) {
  const pts: [number, number][] = [];
  const kmLat = km / 110.574;
  const kmLng = km / (111.32 * Math.cos((center[1] * Math.PI) / 180));
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    pts.push([center[0] + Math.cos(a) * kmLng, center[1] + Math.sin(a) * kmLat]);
  }
  return pts;
}

const TECH_BASES: { name: string; center: [number, number]; km: number }[] = [
  { name: 'Ramón Hernández', center: [-103.40, 20.71], km: 10 },
  { name: 'Adriana García', center: [-103.34, 20.66], km: 8 },
  { name: 'Sergio Camarena', center: [-103.30, 20.60], km: 7 },
];

const LAYER_DEFS = [
  { key: 'zonas', icon: Hexagon, tint: 'text-success', label: 'Polígonos de zona' },
  { key: 'demanda', icon: Flame, tint: 'text-warning', label: 'Demanda (heatmap)' },
  { key: 'tecnicos', icon: HardHat, tint: 'text-primary', label: 'Cobertura de técnicos' },
] as const;
type LayerKey = (typeof LAYER_DEFS)[number]['key'];

export function CoverageMap({
  zones,
  selected,
  onSelect,
  height = 520,
}: {
  zones: MapZone[];
  selected: string;
  onSelect: (id: string) => void;
  height?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const selectedRef = useRef(selected);
  const [ready, setReady] = useState(false);
  const [noToken, setNoToken] = useState(false);
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({ zonas: true, demanda: true, tecnicos: false });
  const [panelOpen, setPanelOpen] = useState(false);

  /* init */
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) { setNoToken(true); return; }
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

      const hoverPopup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, offset: 10, className: 'zmg-pop' });

      map.on('load', () => {
        /* ── zonas ── */
        map.addSource('zonas', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: zones.map(z => ({
              type: 'Feature',
              id: z.id,
              properties: { ...z, pct: Math.round((z.covered / z.colonias) * 100) },
              geometry: { type: 'Polygon', coordinates: [[...ZONE_POLYGONS[z.id], ZONE_POLYGONS[z.id][0]]] },
            })),
          },
          promoteId: 'id',
        });
        map.addLayer({
          id: 'zonas-fill', type: 'fill', source: 'zonas',
          paint: {
            'fill-color': ['case', ['==', ['get', 'status'], 'warn'], '#F59E0B', '#0A6BCF'],
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'selected'], false], 0.30,
              ['boolean', ['feature-state', 'hover'], false], 0.20,
              0.10,
            ],
          },
        });
        map.addLayer({
          id: 'zonas-line', type: 'line', source: 'zonas',
          paint: {
            'line-color': ['case', ['==', ['get', 'status'], 'warn'], '#B45309', '#0A6BCF'],
            'line-width': ['case', ['boolean', ['feature-state', 'selected'], false], 3, 1.6],
          },
        });
        map.addLayer({
          id: 'zonas-label', type: 'symbol', source: 'zonas',
          layout: {
            'text-field': ['format',
              ['get', 'name'], { 'font-scale': 1 },
              '\n', {},
              ['concat', ['to-string', ['get', 'techs']], ' téc · ', ['to-string', ['get', 'pct']], '%'], { 'font-scale': 0.78 },
            ],
            'text-size': 13,
            'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
          },
          paint: { 'text-color': '#0E2C56', 'text-halo-color': 'rgba(255,255,255,.92)', 'text-halo-width': 1.6 },
        });

        /* ── demanda: heatmap + crossfade a puntos ── */
        map.addSource('demanda', { type: 'geojson', data: demandPoints() });
        map.addLayer({ id: 'demanda-heat', type: 'heatmap', source: 'demanda', maxzoom: 16, paint: HEAT_PAINT as never }, 'zonas-label');
        map.addLayer({
          id: 'demanda-pts', type: 'circle', source: 'demanda', minzoom: 12.5,
          paint: {
            'circle-radius': 5,
            'circle-color': '#0A6BCF',
            'circle-stroke-color': '#fff',
            'circle-stroke-width': 1.5,
            'circle-opacity': ['interpolate', ['linear'], ['zoom'], 12.5, 0, 14, 0.85],
            'circle-stroke-opacity': ['interpolate', ['linear'], ['zoom'], 12.5, 0, 14, 1],
          },
        }, 'zonas-label');

        /* ── cobertura de técnicos ── */
        map.addSource('tecnicos', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: TECH_BASES.map(t => ({
              type: 'Feature',
              properties: { name: t.name, km: t.km },
              geometry: { type: 'Polygon', coordinates: [coverageRing(t.center, t.km)] },
            })),
          },
        });
        map.addLayer({
          id: 'tecnicos-fill', type: 'fill', source: 'tecnicos',
          layout: { visibility: 'none' },
          paint: { 'fill-color': '#18A66A', 'fill-opacity': 0.10 },
        }, 'zonas-label');
        map.addLayer({
          id: 'tecnicos-line', type: 'line', source: 'tecnicos',
          layout: { visibility: 'none' },
          paint: { 'line-color': '#18A66A', 'line-width': 1.8, 'line-dasharray': [2.2, 1.6] },
        }, 'zonas-label');

        /* ── interacción zonas ── */
        let hovered: string | null = null;
        map.on('mousemove', 'zonas-fill', (e: { features?: Array<{ id?: string | number; properties?: Record<string, unknown> }>; lngLat: unknown }) => {
          const f = e.features?.[0];
          if (!f?.id) return;
          map.getCanvas().style.cursor = 'pointer';
          if (hovered && hovered !== f.id) map.setFeatureState({ source: 'zonas', id: hovered }, { hover: false });
          hovered = String(f.id);
          map.setFeatureState({ source: 'zonas', id: hovered }, { hover: true });
          const p = f.properties as { name?: string; techs?: number; covered?: number; colonias?: number; pct?: number };
          hoverPopup
            .setLngLat(e.lngLat as never)
            .setHTML(
              `<div class="zmg-pop-title">${p.name}</div>` +
              `<div class="zmg-pop-row"><b>${p.techs}</b> técnicos · <b>${p.pct}%</b> cobertura</div>` +
              `<div class="zmg-pop-row">${p.covered}/${p.colonias} colonias</div>`,
            )
            .addTo(map);
        });
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

        map.setFeatureState({ source: 'zonas', id: selectedRef.current }, { selected: true });
        map.resize(); // el contenedor puede medirse tarde (entrada animada del panel)
        setReady(true);
      });

      // Mantén el canvas al tamaño real del panel.
      const ro = new ResizeObserver(() => map?.resize());
      ro.observe(host.current);
      map.once('remove', () => ro.disconnect());
    })();

    return () => { cancelled = true; mapRef.current = null; map?.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* selección externa → feature-state + flyTo (no en el primer render: la vista
     inicial muestra toda la ZMG) */
  const flownOnce = useRef(false);
  useEffect(() => {
    const map = mapRef.current;
    const prev = selectedRef.current;
    selectedRef.current = selected;
    if (!map || !ready) return;
    if (prev !== selected) map.setFeatureState({ source: 'zonas', id: prev }, { selected: false });
    map.setFeatureState({ source: 'zonas', id: selected }, { selected: true });
    if (!flownOnce.current) { flownOnce.current = true; return; }
    const poly = ZONE_POLYGONS[selected];
    if (poly) {
      const lng = poly.reduce((s, p) => s + p[0], 0) / poly.length;
      const lat = poly.reduce((s, p) => s + p[1], 0) / poly.length;
      map.flyTo({ center: [lng, lat], zoom: 11.2, duration: 900, essential: false });
    }
  }, [selected, ready]);

  /* toggles de capas */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const vis = (on: boolean) => (on ? 'visible' : 'none');
    for (const id of ['zonas-fill', 'zonas-line', 'zonas-label']) map.setLayoutProperty(id, 'visibility', vis(layers.zonas));
    for (const id of ['demanda-heat', 'demanda-pts']) map.setLayoutProperty(id, 'visibility', vis(layers.demanda));
    for (const id of ['tecnicos-fill', 'tecnicos-line']) map.setLayoutProperty(id, 'visibility', vis(layers.tecnicos));
  }, [layers, ready]);

  if (noToken) {
    return (
      <div style={{ height }} className="grid w-full place-items-center rounded-xl border border-line bg-info-soft px-8 text-center">
        <div>
          <MapIcon size={34} className="mx-auto text-primary" />
          <div className="mt-2 text-[14px] font-semibold text-navy">Mapa no disponible</div>
          <div className="mt-1 text-[12.5px] text-muted">
            Define <code className="font-mono">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> en <code className="font-mono">.env.local</code> para ver el mapa real.
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
                  <span className={`min-w-0 flex-1 text-[12px] font-semibold ${on ? 'text-navy' : 'text-faint'}`}>{l.label}</span>
                  <span className={`relative h-[22px] w-9 flex-shrink-0 rounded-full transition-colors ${on ? 'bg-primary' : 'bg-surface-3'}`}>
                    <span className={`absolute left-[3px] top-[3px] h-4 w-4 rounded-full bg-white shadow-card transition-transform duration-200 ${on ? 'translate-x-[14px]' : ''}`} />
                  </span>
                </button>
              );
            })}
            <div className="mt-1 border-t border-line pt-2">
              <div className="h-2 rounded-full" style={{ background: 'linear-gradient(90deg, rgba(10,107,207,0), #0A6BCF, #18C1FF, #F59E0B, #DC2626)' }} />
              <div className="mt-1 flex justify-between font-mono text-[8.5px] uppercase tracking-wider text-faint">
                <span>Baja</span><span>Demanda</span><span>Alta</span>
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
