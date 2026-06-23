/* global React, ReactDOM, IOSDevice */
const { useEffect, useRef } = React;

function Ic({ name, size = 18, stroke = 2, color = "currentColor", style }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && window.lucide) {
      ref.current.innerHTML = "";
      const i = document.createElement("i");
      i.setAttribute("data-lucide", name);
      ref.current.appendChild(i);
      window.lucide.createIcons({
        attrs: { "stroke-width": stroke, width: size, height: size, color },
        nameAttr: "data-lucide",
      });
    }
  }, [name, size, stroke, color]);
  return <span ref={ref} style={{ display: "inline-flex", alignItems: "center", ...style }} />;
}

// ============================================================
// MOCK
// ============================================================
const RECENT = ["Plomería", "Fuga de agua", "Calentador"];
const POPULAR = [
  { label: "Plomero urgente",        icon: "wrench" },
  { label: "Electricista certificado", icon: "zap" },
  { label: "Pintor para sala",       icon: "paint-roller" },
  { label: "Cambio de WC",           icon: "droplets" },
  { label: "Mantenimiento de gas",   icon: "flame" },
];

const SUGGESTIONS = [
  { cat: "Plomería", sub: "Fugas",              icon: "wrench" },
  { cat: "Plomería", sub: "Calentadores",       icon: "wrench" },
  { cat: "Plomería", sub: "Drenaje de cocina",  icon: "wrench" },
  { cat: "Plomería", sub: "Instalación de WC",  icon: "wrench" },
];

const TECH_QUICK = [
  { name: "Ramón Hernández",    cat: "Plomería",      rating: 4.8, initials: "RH", tone: 0 },
  { name: "Lupita Pérez",       cat: "Plomería",      rating: 4.7, initials: "LP", tone: 1 },
];

const TECHS = [
  { name: "Ramón Hernández García",    cat: "Plomería · Fugas · Drenaje",       rating: 4.9, reviews: 214, dist: "1.8", price: 450, avail: "Hoy 3:00 PM", urgent: true,  initials: "RH", tone: 0, jobs: 214 },
  { name: "Adriana García Soto",       cat: "Plomería · Calentadores",          rating: 4.8, reviews: 167, dist: "2.3", price: 480, avail: "Hoy 4:30 PM", urgent: false, initials: "AG", tone: 1, jobs: 167 },
  { name: "Sergio Camarena R.",        cat: "Plomería · Cisternas",             rating: 4.7, reviews: 92,  dist: "2.7", price: 380, avail: "Hoy 6:00 PM", urgent: false, initials: "SC", tone: 2, jobs: 92  },
  { name: "Daniela Ortega Camacho",    cat: "Plomería · Drenaje",               rating: 4.5, reviews: 38,  dist: "3.1", price: 350, avail: "Mañana 9:00 AM", urgent: false, late: true, initials: "DO", tone: 3, jobs: 38 },
  { name: "Miguel Ángel López R.",     cat: "Plomería · Fugas",                 rating: 4.6, reviews: 56,  dist: "3.4", price: 420, avail: "Hoy 7:30 PM", urgent: false, initials: "ML", tone: 0, jobs: 56  },
  { name: "Fernanda Olivares R.",      cat: "Plomería · Drenaje · Gas",         rating: 4.4, reviews: 41,  dist: "3.8", price: 400, avail: "Mañana 11:00 AM", late: true, initials: "FO", tone: 1, jobs: 41 },
  { name: "Ricardo Mendoza Aguilar",   cat: "Plomería · Cisternas · Calent.",   rating: 4.9, reviews: 84,  dist: "4.1", price: 520, avail: "Hoy 5:15 PM", urgent: false, initials: "RM", tone: 2, jobs: 84 },
];

const AV_TONES = [
  "linear-gradient(135deg, #0A6BCF, #18C1FF)",
  "linear-gradient(135deg, #B45309, #F59E0B)",
  "linear-gradient(135deg, #18A66A, #4ED896)",
  "linear-gradient(135deg, #0E2C56, #0894EA)",
];

// ============================================================
// SCREEN 1 — SEARCH
// ============================================================
function Search() {
  return (
    <div style={s.wrap}>
      {/* Header */}
      <div style={s.searchHeader}>
        <button style={s.backBtn}><Ic name="arrow-left" size={20} color="#0E2C56" /></button>
        <div style={s.searchInputFocused}>
          <Ic name="search" size={16} color="#0A6BCF" />
          <input style={s.searchInput} defaultValue="Plomería" readOnly />
          <span style={s.searchCaret} />
          <button style={s.searchClear}><Ic name="x" size={12} color="#FFFFFF" stroke={3} /></button>
        </div>
      </div>

      <div style={s.searchBody}>
        {/* Suggestions while typing */}
        <SearchSection title="Sugerencias" icon="sparkles">
          {SUGGESTIONS.map((sg, i) => (
            <div key={i} style={s.suggestRow}>
              <div style={s.suggestIcon}><Ic name={sg.icon} size={14} color="#0A6BCF" /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 13.5, color: "#0E2C56" }}>{sg.cat}</span>
                <span style={{ fontSize: 13, color: "#9CA3AF", margin: "0 6px" }}>›</span>
                <b style={{ fontSize: 13.5, color: "#0A6BCF", fontWeight: 600 }}>{sg.sub}</b>
              </div>
              <Ic name="arrow-up-left" size={14} color="#9CA3AF" />
            </div>
          ))}
        </SearchSection>

        {/* Tech matches */}
        <SearchSection title="Técnicos por nombre" icon="hard-hat">
          {TECH_QUICK.map((t, i) => (
            <div key={i} style={s.techMiniRow}>
              <div style={{ ...s.miniAv, background: AV_TONES[t.tone] }}>
                <span>{t.initials}</span>
                <div style={s.miniVerifyDot}><Ic name="check" size={9} color="#FFFFFF" stroke={3.5} /></div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0E2C56" }}>{t.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                  <span style={{ fontSize: 11.5, color: "#6B7280" }}>{t.cat}</span>
                  <span style={{ width: 2, height: 2, borderRadius: "50%", background: "#9CA3AF" }} />
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                    <Ic name="star" size={11} color="#F59E0B" />
                    <span style={{ fontSize: 11.5, color: "#0E2C56", fontWeight: 600 }}>{t.rating}</span>
                  </span>
                </div>
              </div>
              <Ic name="chevron-right" size={14} color="#9CA3AF" />
            </div>
          ))}
        </SearchSection>

        {/* Recent */}
        <SearchSection title="Búsquedas recientes" icon="history" action="Borrar">
          <div style={s.chipsRow}>
            {RECENT.map((r, i) => (
              <div key={i} style={s.recentChip}>
                <Ic name="history" size={11} color="#9CA3AF" style={{ marginRight: 6 }} />
                {r}
                <button style={s.chipClose}><Ic name="x" size={10} color="#9CA3AF" stroke={2.5} /></button>
              </div>
            ))}
          </div>
        </SearchSection>

        {/* Popular */}
        <SearchSection title="Populares en Zapopan" icon="trending-up">
          <div style={s.chipsRow}>
            {POPULAR.map((p, i) => (
              <div key={i} style={s.popularChip}>
                <Ic name={p.icon} size={11} color="#0A6BCF" style={{ marginRight: 6 }} />
                {p.label}
              </div>
            ))}
          </div>
        </SearchSection>
      </div>
    </div>
  );
}

function SearchSection({ title, icon, action, children }) {
  return (
    <div style={s.section}>
      <div style={s.sectionHead}>
        <Ic name={icon} size={12} color="#9CA3AF" />
        <span style={s.sectionLabel}>{title}</span>
        {action && <a href="#" style={s.sectionAction}>{action}</a>}
      </div>
      {children}
    </div>
  );
}

// ============================================================
// SCREEN 2 — LIST
// ============================================================
function TechList({ view = "list" }) {
  return (
    <div style={s.wrap}>
      {/* Header */}
      <div style={s.listHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <button style={s.backBtn}><Ic name="arrow-left" size={18} color="#0E2C56" /></button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={s.listTitle}>
              <span style={{ color: "#9CA3AF", fontWeight: 600 }}>Plomería</span>
              <span style={{ color: "#9CA3AF", fontWeight: 400, margin: "0 6px" }}>›</span>
              Fugas
            </h1>
            <div style={s.listSub}>
              <span style={s.liveDot} />
              <b style={{ color: "#0E2C56", fontWeight: 700 }}>32 técnicos</b>
              <span>disponibles cerca de ti · Zapopan</span>
            </div>
          </div>
          <div style={s.viewToggle}>
            <button style={{ ...s.viewBtn, ...(view === "list" ? s.viewBtnActive : null) }}>
              <Ic name="list" size={14} color={view === "list" ? "#FFFFFF" : "#6B7280"} />
            </button>
            <button style={{ ...s.viewBtn, ...(view === "map" ? s.viewBtnActive : null) }}>
              <Ic name="map" size={14} color={view === "map" ? "#FFFFFF" : "#6B7280"} />
            </button>
          </div>
        </div>

        {/* Sticky filter chips */}
        <div style={s.chipsScroller}>
          <div style={{ ...s.filterChip, ...s.filterChipSel }}>
            <Ic name="calendar" size={11} color="#FFFFFF" style={{ marginRight: 5 }} />Disponibles hoy
          </div>
          <div style={s.filterChip}>
            <Ic name="star" size={11} color="#F59E0B" style={{ marginRight: 5 }} />Rating 4.5+
          </div>
          <div style={s.filterChip}>
            <Ic name="map-pin" size={11} color="#0A6BCF" style={{ marginRight: 5 }} />&lt; 3 km
          </div>
          <div style={s.filterChip}>
            <Ic name="tag" size={11} color="#0A6BCF" style={{ marginRight: 5 }} />Precio bajo
          </div>
          <div style={{ ...s.filterChip, background: "#E5F7EE", color: "#18A66A", borderColor: "rgba(24,166,106,0.3)" }}>
            <Ic name="badge-check" size={11} color="#18A66A" style={{ marginRight: 5 }} />Verificados
          </div>
          <button style={s.advFilters}>
            <Ic name="sliders-horizontal" size={13} color="#0A6BCF" />
            <span style={s.advFiltersBadge}>3</span>
          </button>
        </div>
      </div>

      {/* Body */}
      {view === "list" ? <ListView /> : <MapView />}
    </div>
  );
}

function ListView() {
  return (
    <div style={s.listBody}>
      {TECHS.map((t, i) => (
        <div key={i} style={s.techRow}>
          <div style={{ ...s.techAv, background: AV_TONES[t.tone] }}>
            <span>{t.initials}</span>
            <div style={s.techVerifyDot}><Ic name="check" size={10} color="#FFFFFF" stroke={3.5} /></div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#0E2C56" }}>{t.name}</span>
              {t.urgent && <span style={s.fastPill}><Ic name="zap" size={9} color="#FFFFFF" />Ahora</span>}
            </div>
            <div style={s.techMetaRow}>
              <Ic name="star" size={11} color="#F59E0B" />
              <b style={{ fontSize: 12, color: "#0E2C56", fontWeight: 700, marginLeft: 3 }}>{t.rating}</b>
              <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 3 }}>({t.reviews})</span>
              <span style={s.dot} />
              <Ic name="map-pin" size={10} color="#9CA3AF" />
              <span style={{ fontSize: 11, color: "#6B7280", marginLeft: 3 }}>{t.dist} km</span>
              <span style={s.dot} />
              <span style={s.verifBadge}>
                <Ic name="badge-check" size={9} color="#18A66A" />Verif.
              </span>
            </div>
            <div style={s.techCatLine}>{t.cat}</div>
            <div style={{ ...s.availPill, ...(t.late ? s.availPillLate : null) }}>
              <Ic name={t.late ? "clock" : "calendar-clock"} size={10} color={t.late ? "#B45309" : "#18A66A"} />
              <span>Próx. disponible: <b style={{ fontWeight: 700 }}>{t.avail}</b></span>
            </div>
          </div>

          <div style={s.techRight}>
            <div style={{ fontSize: 10, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", textAlign: "right" }}>DESDE</div>
            <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 18, color: "#0E2C56", textAlign: "right", lineHeight: 1 }}>${t.price}</div>
            <div style={{ fontSize: 10, color: "#9CA3AF", textAlign: "right", marginBottom: 8 }}>MXN</div>
            <button style={s.techRowBtn}>Ver perfil</button>
          </div>
        </div>
      ))}

      <div style={{ height: 24 }} />
    </div>
  );
}

function MapView() {
  return (
    <div style={s.mapWrap}>
      <ZmgMiniMap />

      {/* Map controls */}
      <div style={s.mapControls}>
        <button style={s.mapCtlBtn}><Ic name="plus" size={14} color="#0E2C56" /></button>
        <button style={s.mapCtlBtn}><Ic name="minus" size={14} color="#0E2C56" /></button>
        <button style={s.mapCtlBtn}><Ic name="locate-fixed" size={14} color="#0A6BCF" /></button>
      </div>

      {/* Selected tech bottom card */}
      <div style={s.mapTechCard}>
        <div style={s.cardHandle} />
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ ...s.techAv, width: 56, height: 56, background: AV_TONES[0] }}>
            <span style={{ fontSize: 16 }}>RH</span>
            <div style={s.techVerifyDot}><Ic name="check" size={10} color="#FFFFFF" stroke={3.5} /></div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0E2C56" }}>Ramón Hernández</span>
              <span style={s.fastPill}><Ic name="zap" size={9} color="#FFFFFF" />Ahora</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <Ic name="star" size={11} color="#F59E0B" />
              <b style={{ fontSize: 12, color: "#0E2C56" }}>4.9</b>
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>(214)</span>
              <span style={s.dot} />
              <span style={{ fontSize: 11, color: "#6B7280" }}>1.8 km · Providencia</span>
            </div>
            <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 3 }}>Plomería · Fugas · Drenaje</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>DESDE</div>
            <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 18, color: "#0E2C56" }}>$450 <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>MXN</span></div>
          </div>
          <button style={s.mapTechBtn}>
            Ver perfil
            <Ic name="arrow-right" size={13} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 12 }}>
          {[0, 1, 2, 3].map((i) => <span key={i} style={{ ...s.swipeDot, ...(i === 0 ? s.swipeDotActive : null) }} />)}
        </div>
      </div>
    </div>
  );
}

function ZmgMiniMap() {
  const pins = [
    { x: 100, y: 220, rating: 4.9, urgent: true },
    { x: 160, y: 180, rating: 4.8 },
    { x: 220, y: 240, rating: 4.7 },
    { x: 130, y: 320, rating: 4.5 },
    { x: 250, y: 160, rating: 4.6 },
    { x: 280, y: 290, rating: 4.4 },
    { x: 70,  y: 290, rating: 4.9, urgent: true },
    { x: 200, y: 380, rating: 4.7 },
  ];
  return (
    <svg viewBox="0 0 390 500" width="100%" height="100%" style={{ display: "block" }}>
      <defs>
        <pattern id="mapGrid2" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M30 0 L0 0 0 30" fill="none" stroke="#DCE6F1" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="390" height="500" fill="#DDE7F1" />
      <rect width="390" height="500" fill="url(#mapGrid2)" />

      {/* Zone blobs */}
      <path d="M0 100 Q 100 70 220 110 Q 290 150 250 250 Q 180 320 80 310 Q 10 280 0 200 Z" fill="rgba(255,255,255,0.6)" />
      <path d="M220 240 Q 320 230 380 280 Q 380 360 320 380 Q 230 380 200 340 Z" fill="rgba(255,255,255,0.5)" />

      {/* Roads */}
      <path d="M0 250 Q 200 240 390 270" stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.95" />
      <path d="M180 0 Q 170 250 200 500" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85" />

      {/* Labels */}
      <text x="100" y="160" fontFamily="Inter" fontWeight="600" fontSize="12" fill="#0E2C56" opacity="0.7">Zapopan</text>
      <text x="280" y="320" fontFamily="Inter" fontWeight="600" fontSize="11" fill="#0E2C56" opacity="0.6">Guadalajara</text>

      {/* You */}
      <g transform="translate(190, 280)">
        <circle r="22" fill="rgba(10,107,207,0.18)" />
        <circle r="9" fill="#0A6BCF" stroke="#FFFFFF" strokeWidth="3" />
      </g>

      {/* Pins */}
      {pins.map((p, i) => (
        <g key={i} transform={`translate(${p.x},${p.y})`}>
          {p.urgent && <circle r="20" fill="rgba(245,158,11,0.25)" />}
          <g>
            <path d="M0,-26 a14,16 0 1 1 0.01,0 Z M0,2 L-6,-14 L6,-14 Z" fill={i === 0 ? "#0E2C56" : "#0A6BCF"} stroke="#FFFFFF" strokeWidth="2" />
            <circle cy="-16" r="9" fill="#FFFFFF" />
            <text y="-13" textAnchor="middle" fontFamily="Manrope" fontWeight="700" fontSize="10" fill="#0A6BCF">{p.rating}</text>
          </g>
        </g>
      ))}
    </svg>
  );
}

// ============================================================
// SCREEN 4 — FILTERS BOTTOM SHEET
// ============================================================
function FiltersSheet() {
  return (
    <div style={s.wrap}>
      {/* Background (list dimmed) */}
      <div style={{ ...s.wrap, position: "absolute", filter: "blur(2px) brightness(0.95)" }}>
        <TechList view="list" />
      </div>
      <div style={s.scrim} />

      {/* Sheet */}
      <div style={s.sheet}>
        <div style={s.handle} />
        <div style={s.sheetHead}>
          <h2 style={s.sheetTitle}>Filtros</h2>
          <span style={s.sheetSub}>32 técnicos disponibles · ajusta los criterios</span>
          <button style={s.sheetClose}><Ic name="x" size={16} color="#0E2C56" /></button>
        </div>

        <div style={s.sheetBody}>
          {/* Rating */}
          <FilterBlock label="Rating mínimo">
            <div style={{ display: "flex", gap: 8 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} style={{ ...s.ratingChip, ...(n === 4 ? s.ratingChipSel : null) }}>
                  <Ic name="star" size={11} color={n === 4 ? "#FFFFFF" : "#F59E0B"} />
                  <span style={{ marginLeft: 3, fontSize: 12.5, fontWeight: 600, color: n === 4 ? "#FFFFFF" : "#0E2C56" }}>{n}+</span>
                </div>
              ))}
            </div>
          </FilterBlock>

          {/* Distance */}
          <FilterBlock label="Distancia máxima">
            <div style={s.sliderWrap}>
              <div style={s.sliderTrack}>
                <div style={{ ...s.sliderFill, width: "30%" }} />
                <div style={{ ...s.sliderHandle, left: "calc(30% - 9px)" }} />
              </div>
              <div style={s.sliderLabels}>
                <span>1 km</span>
                <b style={{ color: "#0A6BCF", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>5 km</b>
                <span>20 km</span>
              </div>
            </div>
          </FilterBlock>

          {/* Price */}
          <FilterBlock label="Precio · rango">
            <div style={s.sliderWrap}>
              <div style={s.sliderTrack}>
                <div style={{ ...s.sliderFill, left: "12%", width: "44%" }} />
                <div style={{ ...s.sliderHandle, left: "calc(12% - 9px)" }} />
                <div style={{ ...s.sliderHandle, left: "calc(56% - 9px)" }} />
              </div>
              <div style={s.sliderLabels}>
                <span>$200</span>
                <b style={{ color: "#0A6BCF", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>$350 – $1,500</b>
                <span>$3,000</span>
              </div>
            </div>
          </FilterBlock>

          {/* Availability */}
          <FilterBlock label="Disponibilidad">
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["Hoy", "Mañana", "Esta semana", "Cualquier fecha"].map((d, i) => (
                <div key={i} style={{ ...s.dayChip, ...(i === 0 ? s.dayChipSel : null) }}>{d}</div>
              ))}
            </div>
          </FilterBlock>

          {/* Verified */}
          <div style={s.toggleRow}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0E2C56" }}>Solo técnicos verificados</div>
              <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 2 }}>KYC completo, identidad y dirección validadas.</div>
            </div>
            <div style={{ ...s.toggle, ...s.toggleOn }}>
              <span style={{ ...s.toggleKnob, ...s.toggleKnobOn }} />
            </div>
          </div>

          {/* Sort */}
          <FilterBlock label="Ordenar por">
            <div style={s.sortSelect}>
              <Ic name="arrow-down-up" size={13} color="#0A6BCF" />
              <span style={{ fontSize: 13, color: "#0E2C56", fontWeight: 500 }}>Mejor calificación</span>
              <Ic name="chevron-down" size={13} color="#9CA3AF" style={{ marginLeft: "auto" }} />
            </div>
          </FilterBlock>
        </div>

        <div style={s.sheetFoot}>
          <button style={s.sheetClear}>Limpiar</button>
          <button style={s.sheetApply}>
            <Ic name="check" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />
            Aplicar · 12 resultados
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterBlock({ label, children }) {
  return (
    <div style={s.filterBlock}>
      <label style={s.filterBlockLabel}>{label}</label>
      <div style={{ marginTop: 8 }}>{children}</div>
    </div>
  );
}

// ============================================================
// CANVAS
// ============================================================
function PhoneFrame({ children }) {
  return (
    <div style={{ padding: 24 }}>
      <IOSDevice width={390} height={844}>
        <div style={{ width: 390, height: 844, position: "relative", overflow: "hidden" }}>{children}</div>
      </IOSDevice>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="discovery" title="Descubrimiento de técnicos" subtitle="Búsqueda · Lista · Mapa · Filtros">
        <DCArtboard id="search" label="01 · Búsqueda activa" width={438} height={892}>
          <PhoneFrame><Search /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="list" label="02 · Lista · Plomería › Fugas" width={438} height={892}>
          <PhoneFrame><TechList view="list" /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="map" label="03 · Vista mapa con técnico seleccionado" width={438} height={892}>
          <PhoneFrame><TechList view="map" /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="filters" label="04 · Bottom sheet de filtros avanzados" width={438} height={892}>
          <PhoneFrame><FiltersSheet /></PhoneFrame>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// ============================================================
// STYLES
// ============================================================
const s = {
  wrap: { width: "100%", height: "100%", background: "#F8FBFF", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" },

  // SEARCH
  searchHeader: { display: "flex", alignItems: "center", gap: 10, padding: "50px 16px 14px", background: "#FFFFFF", borderBottom: "1px solid #E1E8F0" },
  backBtn: { width: 38, height: 38, borderRadius: 12, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  searchInputFocused: { flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "0 14px", height: 46, background: "#FFFFFF", border: "1.5px solid #0A6BCF", borderRadius: 12, boxShadow: "0 0 0 3px rgba(10,107,207,0.10)", position: "relative" },
  searchInput: { flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14.5, color: "#0E2C56", fontWeight: 600 },
  searchCaret: { width: 2, height: 18, background: "#0A6BCF", animation: "b4-caret 1s infinite" },
  searchClear: { width: 18, height: 18, borderRadius: "50%", background: "#9CA3AF", border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },

  searchBody: { flex: 1, overflowY: "auto", padding: "8px 0 20px", background: "#F8FBFF" },
  section: { padding: "12px 16px" },
  sectionHead: { display: "flex", alignItems: "center", gap: 6, marginBottom: 10 },
  sectionLabel: { fontSize: 10.5, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".08em", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
  sectionAction: { marginLeft: "auto", fontSize: 11, color: "#0A6BCF", textDecoration: "none", fontWeight: 500 },

  suggestRow: { display: "flex", alignItems: "center", gap: 12, padding: "10px 4px", borderBottom: "1px solid #F0F4F9" },
  suggestIcon: { width: 28, height: 28, borderRadius: 8, background: "rgba(10,107,207,0.08)", display: "grid", placeItems: "center", flexShrink: 0 },

  techMiniRow: { display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12, marginBottom: 6 },
  miniAv: { position: "relative", width: 38, height: 38, borderRadius: "50%", display: "grid", placeItems: "center", color: "#FFFFFF", fontWeight: 600, fontSize: 12, fontFamily: "'Manrope', sans-serif" },
  miniVerifyDot: { position: "absolute", right: -2, bottom: -2, width: 14, height: 14, borderRadius: "50%", background: "#18A66A", display: "grid", placeItems: "center", border: "2px solid #FFFFFF" },

  chipsRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  recentChip: { display: "inline-flex", alignItems: "center", padding: "6px 10px 6px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 999, fontSize: 12.5, color: "#0E2C56", fontWeight: 500 },
  chipClose: { marginLeft: 8, width: 16, height: 16, borderRadius: "50%", background: "transparent", border: "none", display: "grid", placeItems: "center", cursor: "pointer" },
  popularChip: { display: "inline-flex", alignItems: "center", padding: "6px 12px", background: "rgba(10,107,207,0.06)", border: "1px solid rgba(10,107,207,0.18)", borderRadius: 999, fontSize: 12.5, color: "#0A6BCF", fontWeight: 600 },

  // LIST
  listHeader: { background: "#FFFFFF", padding: "48px 14px 12px", borderBottom: "1px solid #E1E8F0", position: "relative", zIndex: 2 },
  listTitle: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 18, color: "#0E2C56", margin: 0, letterSpacing: "-0.01em" },
  listSub: { display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "#6B7280", marginTop: 4 },
  liveDot: { width: 6, height: 6, borderRadius: "50%", background: "#18A66A", boxShadow: "0 0 0 3px rgba(24,166,106,0.18)" },
  viewToggle: { display: "flex", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 9, padding: 2, gap: 2 },
  viewBtn: { width: 30, height: 30, border: "none", background: "transparent", borderRadius: 7, display: "grid", placeItems: "center", cursor: "pointer" },
  viewBtnActive: { background: "#0A6BCF" },
  chipsScroller: { display: "flex", gap: 6, overflowX: "auto", marginRight: -14, paddingRight: 14, alignItems: "center" },
  filterChip: { display: "inline-flex", alignItems: "center", flexShrink: 0, padding: "6px 10px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 999, fontSize: 11.5, color: "#0E2C56", fontWeight: 500 },
  filterChipSel: { background: "#0A6BCF", color: "#FFFFFF", borderColor: "#0A6BCF" },
  advFilters: { position: "relative", flexShrink: 0, width: 34, height: 30, background: "#FFFFFF", border: "1px solid #0A6BCF", borderRadius: 9, display: "grid", placeItems: "center", cursor: "pointer", marginLeft: 4 },
  advFiltersBadge: { position: "absolute", top: -4, right: -4, background: "#DC2626", color: "#FFFFFF", fontSize: 9, fontWeight: 700, padding: "1px 4px", borderRadius: 999, border: "2px solid #FFFFFF" },

  listBody: { flex: 1, overflowY: "auto", padding: "12px 14px", background: "#F8FBFF" },
  techRow: { display: "flex", gap: 12, padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, marginBottom: 10, boxShadow: "0 1px 3px rgba(14,44,86,0.04)" },
  techAv: { position: "relative", width: 64, height: 64, borderRadius: "50%", display: "grid", placeItems: "center", color: "#FFFFFF", fontWeight: 700, fontFamily: "'Manrope', sans-serif", fontSize: 18, flexShrink: 0 },
  techVerifyDot: { position: "absolute", right: -2, bottom: -2, width: 20, height: 20, borderRadius: "50%", background: "#18A66A", display: "grid", placeItems: "center", border: "2.5px solid #FFFFFF" },
  fastPill: { display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 6px", background: "#F59E0B", color: "#FFFFFF", borderRadius: 999, fontSize: 9.5, fontWeight: 700 },
  techMetaRow: { display: "flex", alignItems: "center", marginTop: 4, flexWrap: "wrap" },
  verifBadge: { display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 6px", background: "#E5F7EE", color: "#18A66A", borderRadius: 999, fontSize: 9.5, fontWeight: 700 },
  dot: { width: 2, height: 2, borderRadius: "50%", background: "#9CA3AF", margin: "0 6px" },
  techCatLine: { fontSize: 11.5, color: "#6B7280", marginTop: 5 },
  availPill: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", background: "#E5F7EE", color: "#18A66A", borderRadius: 6, fontSize: 11, fontWeight: 500, marginTop: 7 },
  availPillLate: { background: "#FEF3DC", color: "#B45309" },
  techRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", flexShrink: 0 },
  techRowBtn: { background: "#FFFFFF", color: "#0A6BCF", border: "1.5px solid #0A6BCF", borderRadius: 8, padding: "6px 10px", fontSize: 11.5, fontWeight: 600, cursor: "pointer" },

  // MAP
  mapWrap: { flex: 1, position: "relative", overflow: "hidden", background: "#DDE7F1" },
  mapControls: { position: "absolute", right: 12, top: 16, display: "flex", flexDirection: "column", gap: 0, background: "#FFFFFF", borderRadius: 10, overflow: "hidden", border: "1px solid #E1E8F0", boxShadow: "0 4px 12px rgba(14,44,86,0.10)" },
  mapCtlBtn: { background: "#FFFFFF", border: "none", borderBottom: "1px solid #E1E8F0", padding: 9, cursor: "pointer", display: "grid", placeItems: "center" },
  mapTechCard: { position: "absolute", left: 14, right: 14, bottom: 14, background: "#FFFFFF", borderRadius: 16, padding: "10px 18px 18px", boxShadow: "0 -8px 24px rgba(14,44,86,0.15), 0 0 0 1px rgba(14,44,86,0.05)" },
  cardHandle: { width: 36, height: 4, background: "#E1E8F0", borderRadius: 2, margin: "0 auto 14px" },
  mapTechBtn: { background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 12, padding: "12px 16px", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", boxShadow: "0 4px 10px rgba(10,107,207,0.25)" },
  swipeDot: { width: 6, height: 6, borderRadius: "50%", background: "#E1E8F0" },
  swipeDotActive: { background: "#0A6BCF", width: 16, borderRadius: 999 },

  // SHEET
  scrim: { position: "absolute", inset: 0, background: "rgba(14,44,86,0.42)", zIndex: 10 },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, background: "#FFFFFF", borderRadius: "20px 20px 0 0", boxShadow: "0 -20px 40px rgba(14,44,86,0.2)", zIndex: 20, maxHeight: "85%", display: "flex", flexDirection: "column" },
  handle: { width: 38, height: 4, background: "#E1E8F0", borderRadius: 2, margin: "8px auto 4px" },
  sheetHead: { position: "relative", padding: "10px 20px 14px", borderBottom: "1px solid #F0F4F9" },
  sheetTitle: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 20, color: "#0E2C56", margin: 0, letterSpacing: "-0.01em" },
  sheetSub: { fontSize: 12, color: "#6B7280", marginTop: 3 },
  sheetClose: { position: "absolute", right: 16, top: 12, width: 30, height: 30, borderRadius: "50%", background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer" },
  sheetBody: { flex: 1, overflowY: "auto", padding: "12px 20px 8px" },
  sheetFoot: { display: "flex", gap: 10, padding: "12px 20px 28px", borderTop: "1px solid #F0F4F9" },
  sheetClear: { background: "#FFFFFF", color: "#6B7280", border: "1px solid #E1E8F0", borderRadius: 12, padding: "12px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer", flexShrink: 0 },
  sheetApply: { flex: 1, background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 12, padding: "12px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(10,107,207,0.25)" },

  filterBlock: { padding: "10px 0", borderBottom: "1px solid #F0F4F9" },
  filterBlockLabel: { fontSize: 12, fontWeight: 600, color: "#0E2C56" },
  ratingChip: { display: "inline-flex", alignItems: "center", padding: "6px 10px", background: "#FFFFFF", border: "1.5px solid #E1E8F0", borderRadius: 999, cursor: "pointer" },
  ratingChipSel: { background: "#F59E0B", borderColor: "#F59E0B", color: "#FFFFFF" },
  sliderWrap: { padding: "8px 4px" },
  sliderTrack: { position: "relative", height: 4, background: "#E1E8F0", borderRadius: 999 },
  sliderFill: { position: "absolute", left: 0, top: 0, height: "100%", background: "#0A6BCF", borderRadius: 999 },
  sliderHandle: { position: "absolute", top: -7, width: 18, height: 18, borderRadius: "50%", background: "#FFFFFF", border: "2.5px solid #0A6BCF", boxShadow: "0 1px 3px rgba(14,44,86,0.18)" },
  sliderLabels: { display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 11, color: "#9CA3AF" },
  dayChip: { display: "inline-flex", alignItems: "center", padding: "8px 14px", background: "#FFFFFF", border: "1.5px solid #E1E8F0", borderRadius: 999, fontSize: 12.5, fontWeight: 500, color: "#0E2C56", cursor: "pointer" },
  dayChipSel: { background: "#0A6BCF", borderColor: "#0A6BCF", color: "#FFFFFF" },
  toggleRow: { display: "flex", alignItems: "center", gap: 12, padding: "14px 14px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 12, margin: "10px 0" },
  toggle: { position: "relative", width: 44, height: 26, borderRadius: 999, background: "#E1E8F0", flexShrink: 0 },
  toggleOn: { background: "#18A66A" },
  toggleKnob: { position: "absolute", left: 3, top: 3, width: 20, height: 20, borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 1px 3px rgba(14,44,86,0.18)" },
  toggleKnobOn: { transform: "translateX(18px)" },
  sortSelect: { display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10, cursor: "pointer" },
};

const kf = document.createElement("style");
kf.textContent = `@keyframes b4-caret { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }`;
document.head.appendChild(kf);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
