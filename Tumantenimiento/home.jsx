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
// MOCK DATA
// ============================================================
const CATEGORIES = [
  { id: "plomeria",     name: "Plomería",      icon: "wrench",        color: "#0A6BCF" },
  { id: "electricidad", name: "Electricidad",  icon: "zap",           color: "#0884B0" },
  { id: "cristales",    name: "Cristales",     icon: "square",        color: "#0A6BCF" },
  { id: "gas",          name: "Gas",           icon: "flame",         color: "#B45309" },
  { id: "herreria",     name: "Herrería",      icon: "hammer",        color: "#0E2C56" },
  { id: "drenaje",      name: "Drenaje",       icon: "droplets",      color: "#0884B0" },
  { id: "pintura",      name: "Pintura",       icon: "paint-roller",  color: "#0A6BCF" },
  { id: "all",          name: "Ver todas",     icon: "ellipsis",      color: "#6B7280" },
];

const TECHS = [
  { name: "Ramón Hernández",    cat: "Plomería · Drenaje",        rating: 4.8, reviews: 124, dist: "2.3", price: "450",  initials: "RH", tone: 0 },
  { name: "José Carlos Juárez", cat: "Electricidad",              rating: 4.9, reviews: 87,  dist: "1.8", price: "400",  initials: "JC", tone: 1 },
  { name: "Lupita Pérez",       cat: "Pintura · Impermeab.",      rating: 4.7, reviews: 45,  dist: "3.1", price: "350",  initials: "LP", tone: 2 },
  { name: "Miguel Ángel López", cat: "Cristales · Herrería",      rating: 4.6, reviews: 32,  dist: "4.2", price: "500",  initials: "ML", tone: 3 },
  { name: "Adriana García",     cat: "Electricidad · Tableros",   rating: 4.8, reviews: 167, dist: "2.7", price: "420",  initials: "AG", tone: 1 },
];

const AV_TONES = [
  { bg: "linear-gradient(135deg, #0A6BCF, #18C1FF)", initialsBg: "rgba(255,255,255,0.25)" },
  { bg: "linear-gradient(135deg, #B45309, #F59E0B)", initialsBg: "rgba(255,255,255,0.25)" },
  { bg: "linear-gradient(135deg, #18A66A, #4ED896)", initialsBg: "rgba(255,255,255,0.25)" },
  { bg: "linear-gradient(135deg, #0E2C56, #0894EA)", initialsBg: "rgba(255,255,255,0.25)" },
];

// ============================================================
// HOME
// ============================================================
function Home({ headerStyle = "gradient" }) {
  const dark = headerStyle === "gradient";
  return (
    <div style={h.wrap}>
      {/* Header */}
      <div style={dark ? h.headerDark : h.headerLight}>
        {dark && (
          <>
            <div style={h.halo} />
            <div style={h.halo2} />
          </>
        )}
        <div style={h.headerTop}>
          <div style={{ paddingTop: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <h1 style={{ ...h.greeting, color: dark ? "#FFFFFF" : "#0E2C56" }}>Hola, María</h1>
              <span style={{ fontSize: 24 }}>👋</span>
            </div>
            <p style={{ ...h.subgreet, color: dark ? "rgba(255,255,255,0.78)" : "#6B7280" }}>¿Qué necesitas hoy?</p>
          </div>
          <div style={{ paddingTop: 50, display: "flex", gap: 10 }}>
            <button style={{ ...h.iconBtn, ...(dark ? h.iconBtnDark : null) }}>
              <Ic name="search" size={18} color={dark ? "#FFFFFF" : "#0E2C56"} />
            </button>
            <button style={{ ...h.iconBtn, ...(dark ? h.iconBtnDark : null), position: "relative" }}>
              <Ic name="bell" size={18} color={dark ? "#FFFFFF" : "#0E2C56"} />
              <span style={h.notifDot}>2</span>
            </button>
          </div>
        </div>

        {/* Address selector */}
        <div style={{ ...h.addrPill, ...(dark ? h.addrPillDark : h.addrPillLight) }}>
          <div style={{ ...h.addrIcon, background: dark ? "rgba(255,255,255,0.18)" : "rgba(10,107,207,0.10)" }}>
            <Ic name="map-pin" size={13} color={dark ? "#FFFFFF" : "#0A6BCF"} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10.5, color: dark ? "rgba(255,255,255,0.6)" : "#9CA3AF", letterSpacing: ".06em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>Dirección activa</div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: dark ? "#FFFFFF" : "#0E2C56", marginTop: 1, display: "flex", alignItems: "center", gap: 6 }}>
              <span><b style={{ fontWeight: 700 }}>Casa</b> · Providencia, Zapopan</span>
            </div>
          </div>
          <Ic name="chevron-down" size={15} color={dark ? "rgba(255,255,255,0.7)" : "#6B7280"} />
        </div>
      </div>

      {/* Body scroll */}
      <div style={h.body}>
        {/* Search */}
        <div style={h.searchBar}>
          <Ic name="search" size={18} color="#0A6BCF" />
          <input style={h.searchInput} placeholder="¿Qué servicio necesitas?" readOnly />
          <div style={h.searchVoice}>
            <Ic name="mic" size={15} color="#0A6BCF" />
          </div>
        </div>

        {/* Promo banner */}
        <div style={h.promoCarousel}>
          <div style={h.promoCard}>
            <div style={h.promoIllu}>
              <div style={h.promoBlob} />
              <Ic name="gift" size={32} color="#FFFFFF" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={h.promoTag}>BIENVENIDA</div>
              <div style={h.promoTitle}>Tu primer servicio sin comisión</div>
              <div style={h.promoDesc}>Ahorra hasta <b style={{ color: "#FFFFFF", fontWeight: 700 }}>$120 MXN</b> en tu primera visita técnica.</div>
              <div style={h.promoCta}>
                Ver más
                <Ic name="arrow-right" size={12} color="#FFFFFF" style={{ marginLeft: 4 }} />
              </div>
            </div>
          </div>
          <div style={h.promoDots}>
            <span style={{ ...h.promoDot, ...h.promoDotActive }} />
            <span style={h.promoDot} />
            <span style={h.promoDot} />
          </div>
        </div>

        {/* Categorías */}
        <Section title="Categorías" linkLabel="Ver todas">
          <div style={h.catGrid}>
            {CATEGORIES.map((c) => (
              <div key={c.id} style={h.catTile}>
                <div style={{ ...h.catIcon, background: `${c.color}14` }}>
                  <Ic name={c.icon} size={22} color={c.color} stroke={1.75} />
                </div>
                <span style={h.catName}>{c.name}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Técnicos destacados */}
        <Section title="Técnicos destacados cerca de ti" sub="Verificados, calificación 4.5+ y a menos de 5 km" linkLabel="Ver más">
          <div style={h.techCarousel}>
            {TECHS.map((t, i) => <TechCard key={i} t={t} />)}
          </div>
        </Section>

        {/* Último servicio */}
        <Section title="Tu último servicio">
          <LastService />
        </Section>

        {/* Tip */}
        <div style={h.tipBox}>
          <div style={h.tipIcon}>
            <Ic name="lightbulb" size={16} color="#B45309" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, color: "#0E2C56", fontWeight: 600 }}>¿Sabías qué?</div>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 3, lineHeight: 1.45 }}>
              Calificar a tu técnico ayuda a otros clientes a elegir mejor — y los buenos técnicos suben en ranking.
            </div>
          </div>
        </div>

        <div style={{ height: 100 }} />
      </div>

      {/* Bottom tab bar */}
      <BottomTabs />
    </div>
  );
}

// ============================================================
// COMPONENTS
// ============================================================
function Section({ title, sub, linkLabel, children }) {
  return (
    <section style={h.section}>
      <div style={h.sectionHead}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={h.sectionTitle}>{title}</h2>
          {sub && <div style={h.sectionSub}>{sub}</div>}
        </div>
        {linkLabel && (
          <a href="#" style={h.sectionLink}>
            {linkLabel}
            <Ic name="arrow-right" size={12} color="#0A6BCF" style={{ marginLeft: 3 }} />
          </a>
        )}
      </div>
      {children}
    </section>
  );
}

function TechCard({ t }) {
  const tone = AV_TONES[t.tone];
  return (
    <div style={h.techCard}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <div style={{ position: "relative" }}>
          <div style={{ ...h.techAv, background: tone.bg }}>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, color: "#FFFFFF" }}>{t.initials}</span>
            <div style={h.techVerifyDot}><Ic name="check" size={10} color="#FFFFFF" stroke={3.5} /></div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#0E2C56", marginBottom: 2 }}>{t.name}</div>
          <span style={h.verifBadge}>
            <Ic name="badge-check" size={10} color="#18A66A" />Verificado
          </span>
        </div>
      </div>

      <div style={h.techMeta}>
        <Ic name="star" size={12} color="#F59E0B" />
        <b style={{ fontSize: 12.5, color: "#0E2C56", fontWeight: 700, marginLeft: 3 }}>{t.rating}</b>
        <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 4 }}>({t.reviews})</span>
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", fontSize: 11.5, color: "#6B7280" }}>
          <Ic name="map-pin" size={11} color="#9CA3AF" style={{ marginRight: 3 }} />
          {t.dist} km
        </span>
      </div>

      <div style={h.techCatRow}>{t.cat}</div>

      <div style={h.techFoot}>
        <div>
          <div style={{ fontSize: 10, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".04em" }}>DESDE</div>
          <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 16, color: "#0E2C56" }}>
            ${t.price} <span style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>MXN</span>
          </div>
        </div>
        <button style={h.techBtn}>
          Ver perfil
          <Ic name="arrow-right" size={12} color="#FFFFFF" style={{ marginLeft: 4 }} />
        </button>
      </div>
    </div>
  );
}

function LastService() {
  return (
    <div style={h.lastSvc}>
      <div style={h.lastSvcIcon}><Ic name="wrench" size={20} color="#0A6BCF" /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={h.lastSvcStatus}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#18A66A" }} />
            Completado
          </span>
          <span style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>#SVC-2835</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#0E2C56", marginTop: 4 }}>Plomería · Calentador</div>
        <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 2 }}>
          Ramón Hernández · 17/05/2026 · <b style={{ color: "#0E2C56", fontWeight: 600, fontFamily: "'Manrope', sans-serif" }}>$1,640 MXN</b>
        </div>
      </div>
      <button style={h.lastSvcBtn}>
        <Ic name="rotate-cw" size={11} color="#0A6BCF" style={{ marginRight: 4 }} />
        Repetir
      </button>
    </div>
  );
}

function BottomTabs() {
  const tabs = [
    { id: "home",     icon: "home",          label: "Inicio",    active: true },
    { id: "services", icon: "list-checks",   label: "Servicios" },
    { id: "chat",     icon: "message-circle",label: "Mensajes",  badge: 2 },
    { id: "fav",      icon: "heart",         label: "Favoritos" },
    { id: "profile",  icon: "user-round",    label: "Perfil" },
  ];
  return (
    <nav style={h.bottomBar}>
      {tabs.map((t) => (
        <div key={t.id} style={{ ...h.tabItem, ...(t.active ? h.tabItemActive : null) }}>
          <div style={{ position: "relative" }}>
            {t.active && <span style={h.tabIndicator} />}
            <Ic name={t.icon} size={20} color={t.active ? "#0A6BCF" : "#9CA3AF"} stroke={t.active ? 2.2 : 1.75} />
            {t.badge && <span style={h.tabBadge}>{t.badge}</span>}
          </div>
          <span style={{ ...h.tabLabel, color: t.active ? "#0A6BCF" : "#9CA3AF", fontWeight: t.active ? 600 : 500 }}>{t.label}</span>
        </div>
      ))}
    </nav>
  );
}

// ============================================================
// CANVAS
// ============================================================
function PhoneFrame({ children }) {
  return (
    <div style={{ padding: 24, background: "transparent" }}>
      <IOSDevice width={390} height={844}>
        <div style={{ width: 390, height: 844, position: "relative" }}>{children}</div>
      </IOSDevice>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="home" title="Home cliente" subtitle="Header gradient">
        <DCArtboard id="home" label="Home cliente · Default" width={438} height={892}>
          <PhoneFrame><Home headerStyle="gradient" /></PhoneFrame>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// ============================================================
// STYLES
// ============================================================
const h = {
  wrap: { width: "100%", height: "100%", background: "#F8FBFF", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" },

  // Header
  headerDark: {
    background: "linear-gradient(160deg, #061B3A 0%, #0E2C56 45%, #0A6BCF 100%)",
    padding: "0 22px 14px",
    color: "#FFFFFF",
    position: "relative",
    overflow: "hidden",
  },
  headerLight: {
    background: "#FFFFFF",
    padding: "0 22px 14px",
    borderBottom: "1px solid #E1E8F0",
  },
  halo: { position: "absolute", right: -60, top: -40, width: 220, height: 220, background: "radial-gradient(circle, rgba(24,193,255,0.25), transparent 65%)", pointerEvents: "none" },
  halo2: { position: "absolute", left: -80, bottom: -60, width: 200, height: 200, background: "radial-gradient(circle, rgba(10,107,207,0.35), transparent 65%)", pointerEvents: "none" },
  headerTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 },
  greeting: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 24, letterSpacing: "-0.02em", margin: 0 },
  subgreet: { fontSize: 14, margin: "4px 0 0" },
  iconBtn: { width: 40, height: 40, borderRadius: 12, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer", position: "relative" },
  iconBtnDark: { background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" },
  notifDot: { position: "absolute", top: -3, right: -3, width: 17, height: 17, borderRadius: "50%", background: "#DC2626", color: "#FFFFFF", fontSize: 9, fontWeight: 700, display: "grid", placeItems: "center", border: "2px solid #FFFFFF" },

  addrPill: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, marginTop: 14, position: "relative", zIndex: 1, cursor: "pointer" },
  addrPillDark: { background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" },
  addrPillLight: { background: "#F8FBFF", border: "1px solid #E1E8F0" },
  addrIcon: { width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0 },

  // Body
  body: { flex: 1, overflowY: "auto", paddingBottom: 24 },

  // Search
  searchBar: { display: "flex", alignItems: "center", gap: 10, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, padding: "0 14px", height: 50, margin: "16px 22px 0", boxShadow: "0 4px 14px rgba(14,44,86,0.06)" },
  searchInput: { flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14.5, color: "#6B7280", fontFamily: "'Inter', sans-serif" },
  searchVoice: { width: 32, height: 32, borderRadius: 8, background: "rgba(10,107,207,0.08)", display: "grid", placeItems: "center" },

  // Promo
  promoCarousel: { padding: "20px 22px 8px" },
  promoCard: { display: "flex", gap: 14, padding: 16, borderRadius: 16, background: "linear-gradient(135deg, #0A6BCF 0%, #0894EA 45%, #18C1FF 100%)", color: "#FFFFFF", boxShadow: "0 8px 20px rgba(10,107,207,0.22)", position: "relative", overflow: "hidden" },
  promoIllu: { width: 80, height: 80, borderRadius: 14, background: "rgba(255,255,255,0.15)", display: "grid", placeItems: "center", flexShrink: 0, position: "relative", overflow: "hidden" },
  promoBlob: { position: "absolute", top: -20, right: -20, width: 80, height: 80, background: "radial-gradient(circle, rgba(255,255,255,0.4), transparent 70%)" },
  promoTag: { fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", color: "rgba(255,255,255,0.85)", textTransform: "uppercase" },
  promoTitle: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em", margin: "4px 0 4px", lineHeight: 1.2 },
  promoDesc: { fontSize: 11.5, color: "rgba(255,255,255,0.85)", lineHeight: 1.4, marginBottom: 8 },
  promoCta: { display: "inline-flex", alignItems: "center", padding: "5px 10px", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 999, fontSize: 11, fontWeight: 600, color: "#FFFFFF" },
  promoDots: { display: "flex", justifyContent: "center", gap: 6, marginTop: 12 },
  promoDot: { width: 6, height: 6, borderRadius: "50%", background: "#E1E8F0" },
  promoDotActive: { background: "#0A6BCF", width: 20, borderRadius: 999 },

  // Section
  section: { padding: "20px 22px 4px" },
  sectionHead: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, gap: 10 },
  sectionTitle: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 17, color: "#0E2C56", letterSpacing: "-0.01em", margin: 0 },
  sectionSub: { fontSize: 11.5, color: "#9CA3AF", marginTop: 2 },
  sectionLink: { display: "inline-flex", alignItems: "center", color: "#0A6BCF", textDecoration: "none", fontSize: 12.5, fontWeight: 600, flexShrink: 0, paddingTop: 2 },

  // Categories grid
  catGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, rowGap: 16 },
  catTile: { display: "flex", flexDirection: "column", alignItems: "center", gap: 7, cursor: "pointer" },
  catIcon: { width: 58, height: 58, borderRadius: 16, display: "grid", placeItems: "center", boxShadow: "0 1px 3px rgba(14,44,86,0.06)" },
  catName: { fontSize: 11.5, color: "#0E2C56", fontWeight: 500, textAlign: "center" },

  // Tech carousel
  techCarousel: { display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6, marginRight: -22, paddingRight: 22 },
  techCard: { flex: "0 0 264px", width: 264, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, padding: 14, boxShadow: "0 2px 6px rgba(14,44,86,0.04)" },
  techAv: { position: "relative", width: 52, height: 52, borderRadius: "50%", display: "grid", placeItems: "center", flexShrink: 0, boxShadow: "0 2px 6px rgba(14,44,86,0.12)" },
  techVerifyDot: { position: "absolute", right: -2, bottom: -2, width: 18, height: 18, borderRadius: "50%", background: "#18A66A", display: "grid", placeItems: "center", border: "2px solid #FFFFFF" },
  verifBadge: { display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 6px", borderRadius: 999, background: "#E5F7EE", color: "#18A66A", fontSize: 9.5, fontWeight: 700 },
  techMeta: { display: "flex", alignItems: "center", padding: "8px 10px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 8, marginBottom: 8 },
  techCatRow: { fontSize: 11.5, color: "#6B7280", marginBottom: 12, padding: "0 2px" },
  techFoot: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid #F0F4F9" },
  techBtn: { background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", boxShadow: "0 2px 5px rgba(10,107,207,0.25)" },

  // Last service
  lastSvc: { display: "flex", alignItems: "center", gap: 12, padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14 },
  lastSvcIcon: { width: 40, height: 40, borderRadius: 10, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  lastSvcStatus: { display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", background: "#E5F7EE", color: "#18A66A", borderRadius: 999, fontSize: 10.5, fontWeight: 700 },
  lastSvcBtn: { background: "#FFFFFF", border: "1px solid #E1E8F0", color: "#0A6BCF", borderRadius: 8, padding: "6px 10px", fontSize: 11.5, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", flexShrink: 0 },

  // Tip
  tipBox: { display: "flex", gap: 12, padding: 14, background: "#FFFBED", border: "1px dashed rgba(245,158,11,0.45)", borderRadius: 12, margin: "16px 22px 4px" },
  tipIcon: { width: 30, height: 30, borderRadius: 8, background: "rgba(245,158,11,0.18)", display: "grid", placeItems: "center", flexShrink: 0 },

  // Bottom tabs
  bottomBar: { position: "absolute", left: 0, right: 0, bottom: 0, height: 78, background: "#FFFFFF", borderTop: "1px solid #E1E8F0", display: "flex", justifyContent: "space-around", alignItems: "flex-start", padding: "10px 6px 24px", boxShadow: "0 -4px 12px rgba(14,44,86,0.05)" },
  tabItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1, padding: "4px 0" },
  tabIndicator: { position: "absolute", left: "50%", top: -8, transform: "translateX(-50%)", width: 22, height: 3, background: "#0A6BCF", borderRadius: 999 },
  tabLabel: { fontSize: 10.5 },
  tabBadge: { position: "absolute", top: -4, right: -8, background: "#DC2626", color: "#FFFFFF", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 999, border: "2px solid #FFFFFF" },
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
