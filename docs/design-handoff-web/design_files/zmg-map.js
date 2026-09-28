// zmg-map.js — <zmg-map> web component: real ZMG coverage map (Leaflet + OSM).
// Ported from tumtto-web/src/components/coverage-map.tsx: zone polygons, demand
// point hubs (same deterministic PRNG), and technician coverage rings.
(function () {
  const CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  const CSS_SRI = 'sha384-sHL9NAb7lN7rfvG5lfHpm643Xkcjzp4jFvuavGOndn6pjVqS6ny56CAt3nsEVT4H';
  const JS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  const JS_SRI = 'sha384-cxOPjt7s7Iz04uaHJceBmS+qpjv2JkIHNVcuOrM+YHwZOmJGBXI00mdUXEq65HTH';

  let leafletPromise = null;
  function ensureLeaflet() {
    if (window.L) return Promise.resolve();
    if (leafletPromise) return leafletPromise;
    leafletPromise = new Promise((resolve, reject) => {
      if (!document.querySelector('link[data-zmgm-css]')) {
        const l = document.createElement('link');
        l.rel = 'stylesheet'; l.href = CSS_URL; l.integrity = CSS_SRI; l.crossOrigin = 'anonymous';
        l.setAttribute('data-zmgm-css', '');
        document.head.appendChild(l);
      }
      const s = document.createElement('script');
      s.src = JS_URL; s.integrity = JS_SRI; s.crossOrigin = 'anonymous';
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
    return leafletPromise;
  }

  function injectStyle() {
    if (document.getElementById('zmgm-style')) return;
    const st = document.createElement('style');
    st.id = 'zmgm-style';
    st.textContent = `
      zmg-map .leaflet-container { background: #0A1E3C; font-family: Inter, ui-sans-serif, sans-serif; }
      zmg-map.zmgm-dark .leaflet-tile-pane { filter: invert(1) hue-rotate(195deg) brightness(0.9) contrast(0.92) saturate(0.5); }
      zmg-map .leaflet-control-attribution { background: rgba(8,26,51,0.78); color: rgba(255,255,255,0.55); font-size: 9.5px; }
      zmg-map .leaflet-control-attribution a { color: rgba(255,255,255,0.78); }
      zmg-map:not(.zmgm-dark) .leaflet-container { background: #EEF3F9; }
      zmg-map:not(.zmgm-dark) .leaflet-bar a { background: #fff; color: #0E2C56; border-color: #E1E8F0; }
      zmg-map:not(.zmgm-dark) .leaflet-control-attribution { background: rgba(255,255,255,0.8); color: #6b7280; }
      zmg-map:not(.zmgm-dark) .leaflet-control-attribution a { color: #0a6bcf; }
      zmg-map .leaflet-bar a { background: #0E2C56; color: #fff; border-color: rgba(255,255,255,0.15); }
      zmg-map .leaflet-bar a:hover { background: #133c74; }
      zmg-map .leaflet-popup-content-wrapper { background: #0E2C56; color: #fff; border-radius: 12px; box-shadow: 0 12px 32px rgba(0,0,0,0.45); }
      zmg-map .leaflet-popup-tip { background: #0E2C56; }
      zmg-map .leaflet-popup-content { margin: 12px 16px; }
      zmg-map .leaflet-tooltip { background: #0E2C56; color: #fff; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; font-family: Inter, sans-serif; font-size: 11px; box-shadow: 0 6px 16px rgba(0,0,0,0.35); }
      zmg-map .leaflet-tooltip:before { display: none; }
    `;
    document.head.appendChild(st);
  }

  // Polígonos aproximados de la mancha urbana — coords [lng, lat] como en el repo.
  const ZONES = [
    { id: 'zap', name: 'Zapopan', ok: true, covered: 194, colonias: 198, techs: 318,
      poly: [[-103.52, 20.79], [-103.45, 20.82], [-103.38, 20.80], [-103.36, 20.75], [-103.38, 20.70], [-103.44, 20.67], [-103.50, 20.68], [-103.54, 20.73]] },
    { id: 'gdl', name: 'Guadalajara', ok: true, covered: 240, colonias: 245, techs: 412,
      poly: [[-103.38, 20.70], [-103.36, 20.75], [-103.30, 20.74], [-103.26, 20.70], [-103.28, 20.65], [-103.33, 20.63], [-103.38, 20.65]] },
    { id: 'tlaq', name: 'Tlaquepaque', ok: true, covered: 118, colonias: 124, techs: 142,
      poly: [[-103.33, 20.63], [-103.28, 20.65], [-103.24, 20.62], [-103.26, 20.56], [-103.32, 20.55], [-103.36, 20.58]] },
    { id: 'tlaj', name: 'Tlajomulco de Zúñiga', ok: false, covered: 41, colonias: 64, techs: 48,
      poly: [[-103.50, 20.55], [-103.42, 20.57], [-103.36, 20.55], [-103.34, 20.48], [-103.40, 20.42], [-103.48, 20.44], [-103.52, 20.50]] },
  ];

  const TECH_BASES = [
    { name: 'Ramón Hernández', center: [-103.40, 20.71], km: 10 },
    { name: 'Adriana García', center: [-103.34, 20.66], km: 8 },
    { name: 'Sergio Camarena', center: [-103.30, 20.60], km: 7 },
  ];

  // Puntos de demanda demo — mismo PRNG determinista y hubs que el repo.
  function demandPoints() {
    let seed = 20260703;
    const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
    const hubs = [
      [-103.39, 20.71, 0.030, 90],
      [-103.35, 20.67, 0.025, 70],
      [-103.43, 20.73, 0.035, 60],
      [-103.30, 20.59, 0.030, 40],
      [-103.42, 20.50, 0.040, 25],
    ];
    const pts = [];
    for (const [cx, cy, spread, count] of hubs) {
      for (let i = 0; i < count; i++) {
        const a = rnd() * Math.PI * 2;
        const r = Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * spread;
        pts.push({ lng: cx + Math.cos(a) * r, lat: cy + Math.sin(a) * r * 0.8, w: 0.4 + rnd() * 0.6 });
      }
    }
    return pts;
  }

  function popupHtml(z) {
    const chip = z.ok
      ? '<span style="display:inline-block;padding:3px 9px;border-radius:999px;font-size:10px;font-weight:700;background:rgba(24,193,255,0.16);color:#18C1FF">Cobertura total</span>'
      : '<span style="display:inline-block;padding:3px 9px;border-radius:999px;font-size:10px;font-weight:700;background:rgba(245,158,11,0.18);color:#F59E0B">Cobertura parcial</span>';
    return '<div style="font-family:Inter,sans-serif;min-width:170px">'
      + '<div style="font-weight:700;font-size:14px">' + z.name + '</div>'
      + '<div style="font-size:11.5px;color:rgba(255,255,255,0.6);margin:3px 0 7px">' + z.covered + ' de ' + z.colonias + ' colonias · ' + z.techs + ' técnicos</div>'
      + chip + '</div>';
  }

  class ZmgMap extends HTMLElement {
    static get observedAttributes() { return ['dark']; }
    connectedCallback() {
      if (this._init) return;
      this._init = true;
      this.style.display = 'block';
      this.style.position = 'relative';
      if (!this.style.height && !this.style.minHeight) this.style.minHeight = '420px';
      const div = document.createElement('div');
      div.style.cssText = 'position:absolute;inset:0;';
      this.appendChild(div);
      this._div = div;
      injectStyle();
      this._applyDark();
      ensureLeaflet().then(() => this._build()).catch(() => {
        div.innerHTML = '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#0A1E3C;color:rgba(255,255,255,0.55);font:500 13px Inter,sans-serif">No se pudo cargar el mapa</div>';
      });
    }
    attributeChangedCallback() { this._applyDark(); }
    set dark(v) { this._darkProp = String(v); this._applyDark(); }
    get dark() { return this._darkProp; }
    _applyDark() { const v = this.getAttribute('dark') ?? this._darkProp; this.classList.toggle('zmgm-dark', v !== '0' && v !== 'false'); }
    _build() {
      const L = window.L;
      if (!this.isConnected || this._map) return;
      const map = L.map(this._div, { scrollWheelZoom: false, zoomControl: true });
      this._map = map;
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors', maxZoom: 19,
      }).addTo(map);

      const canvas = L.canvas({ padding: 0.3 });
      // demanda
      for (const p of demandPoints()) {
        L.circleMarker([p.lat, p.lng], {
          renderer: canvas, radius: 2.2, stroke: false, fillColor: '#18C1FF', fillOpacity: 0.22 + p.w * 0.4,
        }).addTo(map);
      }
      // anillos de cobertura de técnicos
      for (const t of TECH_BASES) {
        L.circle([t.center[1], t.center[0]], {
          radius: t.km * 1000, color: '#18C1FF', weight: 1.2, dashArray: '4 6', fillColor: '#18C1FF', fillOpacity: 0.045,
        }).addTo(map).bindTooltip(t.name + ' · radio ' + t.km + ' km', { direction: 'top', sticky: true });
        L.circleMarker([t.center[1], t.center[0]], {
          radius: 4.5, color: '#fff', weight: 1.5, fillColor: '#0A6BCF', fillOpacity: 1,
        }).addTo(map);
      }
      // polígonos de zona
      const polys = [];
      for (const z of ZONES) {
        const color = z.ok ? '#18C1FF' : '#F59E0B';
        const latlngs = z.poly.map((c) => [c[1], c[0]]);
        const poly = L.polygon(latlngs, { color, weight: 1.6, fillColor: color, fillOpacity: 0.13 })
          .addTo(map).bindPopup(popupHtml(z));
        poly.on('mouseover', () => poly.setStyle({ fillOpacity: 0.3 }));
        poly.on('mouseout', () => poly.setStyle({ fillOpacity: 0.13 }));
        polys.push(poly);
      }
      map.fitBounds(L.featureGroup(polys).getBounds().pad(0.1));
      setTimeout(() => map.invalidateSize(), 250);
      if (window.ResizeObserver) {
        this._ro = new ResizeObserver(() => map.invalidateSize());
        this._ro.observe(this);
      }
    }
    disconnectedCallback() {
      if (this._ro) this._ro.disconnect();
      if (this._map) { this._map.remove(); this._map = null; }
    }
  }
  if (!customElements.get('zmg-map')) customElements.define('zmg-map', ZmgMap);
})();
