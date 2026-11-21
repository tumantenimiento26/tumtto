/**
 * Mapbox sin WebGL, sin red o con el estilo caído: el lienzo queda vacío y
 * sin aviso. Un `error` antes del primer `load` es fatal (el mapa nunca
 * pinta); después, un mosaico que falla no lo es y se ignora.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function onMapFailure(map: any, fail: () => void) {
  let loaded = false;
  map.once('load', () => {
    loaded = true;
  });
  map.on('error', () => {
    if (!loaded) fail();
  });
}
