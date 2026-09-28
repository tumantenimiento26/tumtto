// <tumtto-map theme="light|dark" variant="tracking|coverage|pick" height="360"> — Mapbox GL con estilo Tumtto
(function () {
  const TOKEN = '<MAPBOX_PUBLIC_TOKEN>';
  const V = '3.7.0';
  let loader;
  function loadGL() {
    if (window.mapboxgl) return Promise.resolve(window.mapboxgl);
    if (loader) return loader;
    loader = new Promise((res, rej) => {
      const l = document.createElement('link');
      l.rel = 'stylesheet'; l.href = `https://api.mapbox.com/mapbox-gl-js/v${V}/mapbox-gl.css`;
      document.head.appendChild(l);
      const s = document.createElement('script');
      s.src = `https://api.mapbox.com/mapbox-gl-js/v${V}/mapbox-gl.js`;
      s.onload = () => res(window.mapboxgl); s.onerror = rej;
      document.head.appendChild(s);
    });
    return loader;
  }
  if (!document.getElementById('tumtto-map-css')) {
    const st = document.createElement('style'); st.id = 'tumtto-map-css';
    st.textContent = `@keyframes tmPing{0%{transform:scale(.6);opacity:.7}100%{transform:scale(2.2);opacity:0}}
.tm-pin{position:relative;width:40px;height:40px}
.tm-pin .ring{position:absolute;inset:0;border-radius:50%;animation:tmPing 2s ease-out infinite}
.tm-pin .core{position:absolute;inset:4px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:700 11px Manrope,sans-serif;color:#fff;border:2.5px solid #fff;box-shadow:0 6px 14px -4px rgba(6,27,58,.55)}
.tm-dest{width:34px;height:42px;filter:drop-shadow(0 6px 8px rgba(6,27,58,.35))}
.tm-self{width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 6px rgba(10,107,207,.2),0 4px 10px rgba(6,27,58,.4)}
tumtto-map .mapboxgl-ctrl-bottom-left,tumtto-map .mapboxgl-ctrl-bottom-right{top:0;bottom:auto}tumtto-map .mapboxgl-ctrl-bottom-left{top:auto;bottom:0}tumtto-map[variant=tracking] .mapboxgl-ctrl-bottom-left,tumtto-map[variant=pick] .mapboxgl-ctrl-bottom-left{bottom:74px}tumtto-map[variant=tracking] .mapboxgl-ctrl-bottom-right,tumtto-map[variant=pick] .mapboxgl-ctrl-bottom-right{top:auto;bottom:74px}tumtto-map[variant=coverage] .mapboxgl-ctrl-bottom-right{top:auto;bottom:0}tumtto-map .mapboxgl-ctrl-logo{opacity:.55}tumtto-map .mapboxgl-ctrl-attrib{font-size:9px;opacity:.7}`;
    document.head.appendChild(st);
  }
  const PAL = {
    light: { bg: '#EEF3F9', water: '#CFE3F8', park: '#E2EEE6', build: '#E1E8F0', road: '#FFFFFF', roadMaj: '#FFFFFF', casing: '#D6DEE8', text: '#6B7280', halo: '#FFFFFF', route: '#0A6BCF', routeCase: '#FFFFFF', done: '#9FB3C8', cover: '#0A6BCF', tech: '#0E2C56', dest: '#0A6BCF', self: '#0A6BCF' },
    dark: { bg: '#07111F', water: '#0B2340', park: '#0B1B26', build: '#0F1D33', road: '#16263F', roadMaj: '#22406B', casing: '#07111F', text: '#8FA0B8', halo: '#07111F', route: '#5AB0FF', routeCase: '#07111F', done: '#34486A', cover: '#18C1FF', tech: '#0A6BCF', dest: '#18C1FF', self: '#5AB0FF' },
  };
  const CLIENT = [-103.3496, 20.6597];
  const ROUTE = [[-103.3712, 20.6752], [-103.3688, 20.6731], [-103.3651, 20.6718], [-103.3622, 20.6690], [-103.3590, 20.6668], [-103.3561, 20.6651], [-103.3530, 20.6629], [-103.3509, 20.6610], CLIENT];
  function circle(c, km, n = 64) {
    const out = [], [lng, lat] = c.map(v => v * Math.PI / 180), d = km / 6371;
    for (let i = 0; i <= n; i++) { const b = i / n * 2 * Math.PI, la = Math.asin(Math.sin(lat) * Math.cos(d) + Math.cos(lat) * Math.sin(d) * Math.cos(b)), lo = lng + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(lat), Math.cos(d) - Math.sin(lat) * Math.sin(la)); out.push([lo * 180 / Math.PI, la * 180 / Math.PI]); }
    return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [out] } };
  }
  const line = c => ({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: c } });
  function along(pts, t) {
    const seg = []; let tot = 0;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
    let k = t * tot;
    for (let i = 0; i < seg.length; i++) { if (k <= seg[i]) { const f = k / seg[i]; const p = [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]; return { p, done: pts.slice(0, i + 1).concat([p]), rest: [p].concat(pts.slice(i + 1)) }; } k -= seg[i]; }
    return { p: pts[pts.length - 1], done: pts, rest: [pts[pts.length - 1]] };
  }
  function restyle(map, P) {
    for (const l of map.getStyle().layers) {
      const id = l.id, t = l.type, set = (k, v) => { try { map.setPaintProperty(id, k, v); } catch (e) {} };
      if (/poi|transit|airport|ferry|rail/.test(id) && t === 'symbol') { map.setLayoutProperty(id, 'visibility', 'none'); continue; }
      if (t === 'background') set('background-color', P.bg);
      else if (/water/.test(id) && t === 'fill') set('fill-color', P.water);
      else if (/water/.test(id) && t === 'line') set('line-color', P.water);
      else if (/park|landuse|national|pitch|golf|grass|wood/.test(id) && t === 'fill') { set('fill-color', P.park); set('fill-opacity', 1); }
      else if (/land/.test(id) && t === 'fill') set('fill-color', P.bg);
      else if (/building/.test(id) && t === 'fill') { set('fill-color', P.build); set('fill-outline-color', P.build); }
      else if (/building/.test(id) && t === 'fill-extrusion') set('fill-extrusion-color', P.build);
      else if (/case|casing/.test(id) && t === 'line') set('line-color', P.casing);
      else if (/motorway|trunk|primary|secondary/.test(id) && t === 'line') set('line-color', P.roadMaj);
      else if (/road|street|bridge|tunnel|path|pedestrian/.test(id) && t === 'line') set('line-color', P.road);
      else if (/admin|boundary/.test(id) && t === 'line') set('line-opacity', 0.25);
      else if (t === 'symbol') { set('text-color', P.text); set('text-halo-color', P.halo); set('text-halo-width', 1.4); set('icon-opacity', 0); }
    }
  }
  function pin(bg, label, ring) {
    const el = document.createElement('div'); el.className = 'tm-pin';
    el.innerHTML = `<span class="ring" style="background:${ring}"></span><span class="core" style="background:${bg}">${label}</span>`;
    return el;
  }
  function dest(color, dark) {
    const el = document.createElement('div'); el.className = 'tm-dest';
    el.innerHTML = `<svg viewBox="0 0 34 42" width="34" height="42"><path d="M17 41s15-13.2 15-24A15 15 0 0 0 2 17c0 10.8 15 24 15 24z" fill="${color}" stroke="${dark ? '#07111F' : '#fff'}" stroke-width="2.5"/><path d="M11 18.5 17 13l6 5.5V25h-4v-4h-4v4h-4z" fill="#fff"/></svg>`;
    return el;
  }
  class TumttoMap extends HTMLElement {
    static get observedAttributes() { return ['theme', 'variant']; }
    connectedCallback() {
      this.style.display = 'block'; this.style.position = 'relative';
      if (!this.style.height) this.style.height = this.getAttribute('height') ? this.getAttribute('height') + 'px' : '100%';
      this.box = document.createElement('div'); this.box.style.cssText = 'position:absolute;inset:0;';
      this.appendChild(this.box);
      loadGL().then(gl => { if (this.isConnected) this.build(gl); }).catch(() => this.fail());
    }
    disconnectedCallback() { cancelAnimationFrame(this.raf); if (this.map) this.map.remove(); this.map = null; }
    attributeChangedCallback() { if (this.map) { this.disconnectedCallback(); this.box.innerHTML = ''; this.build(window.mapboxgl); } }
    fail() { this.box.innerHTML = '<div style="height:100%;display:flex;align-items:center;justify-content:center;font:600 13px Inter,sans-serif;color:#6B7280;background:#EEF3F9">Mapa no disponible</div>'; }
    build(gl) {
      const theme = this.getAttribute('theme') === 'dark' ? 'dark' : 'light', P = PAL[theme], variant = this.getAttribute('variant') || 'tracking';
      gl.accessToken = TOKEN;
      const center = variant === 'tracking' ? [-103.3600, 20.6672] : CLIENT;
      const map = this.map = new gl.Map({ container: this.box, style: `mapbox://styles/mapbox/${theme}-v11`, center, zoom: variant === 'coverage' ? 11.2 : variant === 'pick' ? 15.2 : 13.6, attributionControl: false, interactive: true, cooperativeGestures: false, dragRotate: false, pitchWithRotate: false });
      map.addControl(new gl.AttributionControl({ compact: true }), 'bottom-right');
      map.on('style.load', () => {
        restyle(map, P);
        if (variant === 'coverage') {
          map.addSource('cov', { type: 'geojson', data: circle(CLIENT, 6) });
          map.addLayer({ id: 'cov-fill', type: 'fill', source: 'cov', paint: { 'fill-color': P.cover, 'fill-opacity': theme === 'dark' ? 0.16 : 0.1 } });
          map.addLayer({ id: 'cov-line', type: 'line', source: 'cov', paint: { 'line-color': P.cover, 'line-width': 2, 'line-dasharray': [2, 1.5] } });
          new gl.Marker({ element: pin(P.tech, 'RH', P.cover + '55') }).setLngLat(CLIENT).addTo(map);
        }
        if (variant === 'pick') {
          const el = dest(P.dest, theme === 'dark'); new gl.Marker({ element: el, anchor: 'bottom' }).setLngLat(CLIENT).addTo(map);
        }
        if (variant === 'tracking') {
          map.addSource('done', { type: 'geojson', data: line(ROUTE.slice(0, 1)) });
          map.addSource('rest', { type: 'geojson', data: line(ROUTE) });
          map.addLayer({ id: 'rest-case', type: 'line', source: 'rest', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': P.routeCase, 'line-width': 9 } });
          map.addLayer({ id: 'rest', type: 'line', source: 'rest', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': P.route, 'line-width': 5 } });
          map.addLayer({ id: 'done', type: 'line', source: 'done', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': P.done, 'line-width': 4, 'line-dasharray': [1, 1.6] } });
          new gl.Marker({ element: dest(P.dest, theme === 'dark'), anchor: 'bottom' }).setLngLat(CLIENT).addTo(map);
          const tech = new gl.Marker({ element: pin(P.tech, 'RH', P.route + '55') }).setLngLat(ROUTE[0]).addTo(map);
          const t0 = performance.now(), D = 22000;
          const tick = now => {
            const t = ((now - t0) % (D + 2500)) / D, a = along(ROUTE, Math.min(t, 1));
            tech.setLngLat(a.p);
            map.getSource('done') && map.getSource('done').setData(line(a.done));
            map.getSource('rest') && map.getSource('rest').setData(line(a.rest));
            this.raf = requestAnimationFrame(tick);
          };
          this.raf = requestAnimationFrame(tick);
        }
      });
      map.on('error', e => { if (e && e.error && /401|403|token/i.test(String(e.error.message || e.error.status))) this.fail(); });
      this.zoomIn = () => map.zoomIn(); this.zoomOut = () => map.zoomOut();
      this.recenter = () => map.flyTo({ center, zoom: map.getZoom(), speed: 1.2 });
    }
  }
  if (!customElements.get('tumtto-map')) customElements.define('tumtto-map', TumttoMap);
})();
