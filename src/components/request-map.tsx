'use client';

import { useEffect, useRef, useState } from 'react';
import { Map as MapIcon, MapPin } from 'lucide-react';
import type { LngLat } from '@/lib/geo';

/**
 * Mapa de una sola solicitud: pin en la ubicación del servicio (Mapbox GL, el
 * mismo token y estilo que CoverageMap). Sin token (o sin coordenadas) muestra
 * un recuadro con la dirección y las coordenadas.
 */
export function RequestMap({
  center,
  label,
  height = 240,
}: {
  center: LngLat | null;
  label?: string;
  height?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [noToken, setNoToken] = useState(false);
  const lng = center?.[0];
  const lat = center?.[1];

  useEffect(() => {
    if (lng == null || lat == null) return;
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
        center: [lng, lat],
        zoom: 14,
        attributionControl: false,
      });
      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: false, showCompass: false }), 'bottom-left');
      map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');
      new mapboxgl.Marker({ color: '#0A6BCF' }).setLngLat([lng, lat]).addTo(map);
      const ro = new ResizeObserver(() => map?.resize());
      ro.observe(host.current);
      map.once('remove', () => ro.disconnect());
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [lng, lat]);

  if (lng == null || lat == null || noToken) {
    return (
      <div
        style={{ height }}
        className="grid w-full place-items-center rounded-box border border-line bg-info-soft px-6 text-center"
      >
        <div className="min-w-0">
          {center ? (
            <MapPin size={30} className="mx-auto text-primary" aria-hidden />
          ) : (
            <MapIcon size={30} className="mx-auto text-primary" aria-hidden />
          )}
          <div className="mt-2 break-words text-[14px] font-semibold text-navy">
            {label || 'Ubicación no disponible'}
          </div>
          {center && (
            <div className="mt-1 font-mono text-[12px] text-muted">
              {center[1].toFixed(5)}, {center[0].toFixed(5)}
            </div>
          )}
          <div className="mt-1 text-[12px] text-faint">
            {center ? 'Mapa no disponible: falta NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN.' : 'La solicitud no trae coordenadas.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height }} className="relative w-full overflow-hidden rounded-box border border-line">
      <div ref={host} className="h-full w-full" role="img" aria-label={label ? `Mapa: ${label}` : 'Mapa de la solicitud'} />
    </div>
  );
}
