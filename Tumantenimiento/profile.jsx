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
// DATA
// ============================================================
const TECH = {
  name: "Ramón Hernández García",
  initials: "RH",
  rating: 4.8,
  reviews: 124,
  cats: ["Plomería", "Drenaje", "Calentadores"],
  distance: "2.3 km",
  bio: "Plomero con 20 años de experiencia atendiendo casas y comercios en la ZMG. Especialista en fugas, calentadores y drenajes. Trabajo limpio y garantizado. Cuento con todas mis herramientas y materiales básicos.",
  stats: [
    { label: "Servicios completados", value: "124" },
    { label: "Tasa de aceptación", value: "98%" },
    { label: "En la plataforma", value: "5 años" },
  ],
  certs: [
    { label: "Identidad verificada", sub: "INE validada", icon: "user-round-check" },
    { label: "Comprobante de domicilio", sub: "CFE 05/2026", icon: "home" },
    { label: "Certificación gas LP", sub: "Vence ene 2027", icon: "flame" },
    { label: "3 cartas de recomendación", sub: "Cristalería del Sur · Plomería Patria · Servicios Z.", icon: "scroll-text" },
  ],
  services: [
    { label: "Reparación de fugas",         price: 450, time: "1-2 h" },
    { label: "Instalación de WC",           price: 650, time: "2-3 h" },
    { label: "Calentador a gas · servicio", price: 550, time: "1-2 h" },
    { label: "Destape de drenaje",          price: 400, time: "1 h" },
  ],
  week: [
    { d: "Lun", n: 19, slots: 4, full: false, today: true },
    { d: "Mar", n: 20, slots: 5, full: false },
    { d: "Mié", n: 21, slots: 0, full: true  },
    { d: "Jue", n: 22, slots: 3, full: false },
    { d: "Vie", n: 23, slots: 2, full: false, lateOnly: true },
    { d: "Sáb", n: 24, slots: 6, full: false },
    { d: "Dom", n: 25, off: true },
  ],
  ratingDist: [
    { stars: 5, pct: 88 },
    { stars: 4, pct: 9 },
    { stars: 3, pct: 2 },
    { stars: 2, pct: 1 },
    { stars: 1, pct: 0 },
  ],
  tags: [
    { label: "Puntual",      n: 98  },
    { label: "Limpio",       n: 89  },
    { label: "Conocedor",    n: 110 },
    { label: "Amable",       n: 115 },
    { label: "Buen precio",  n: 76  },
  ],
  testimonials: [
    { name: "María R.",  initials: "MR", date: "12 mayo 2026", stars: 5, text: "Llegó puntual, identificó la fuga en 5 minutos y dejó todo impecable. Súper recomendado.", tone: 0 },
    { name: "Carlos M.", initials: "CM", date: "28 abril 2026", stars: 5, text: "Excelente trabajo en el calentador. Precio justo y honesto. Vino a tiempo y me explicó qué iba a hacer antes de empezar.", tone: 1 },
    { name: "Lupita P.", initials: "LP", date: "15 abril 2026", stars: 4, text: "Buen servicio, sólo tardó un poco más de lo previsto pero el trabajo quedó perfecto. Volvería a contratarlo.", tone: 2 },
  ],
  coverage: ["Providencia", "Country Club", "Chapalita", "Vallarta Univ.", "Las Águilas", "Andares"],
};

const AV_TONES = [
  "linear-gradient(135deg, #0A6BCF, #18C1FF)",
  "linear-gradient(135deg, #B45309, #F59E0B)",
  "linear-gradient(135deg, #18A66A, #4ED896)",
  "linear-gradient(135deg, #0E2C56, #0894EA)",
];

const GALLERY_BGS = [
  "linear-gradient(135deg,#0A6BCF,#18C1FF)",
  "linear-gradient(135deg,#0E2C56,#0A6BCF)",
  "linear-gradient(135deg,#B45309,#F59E0B)",
  "linear-gradient(135deg,#18A66A,#4ED896)",
  "linear-gradient(135deg,#0884B0,#18C1FF)",
  "linear-gradient(135deg,#0E2C56,#0894EA)",
  "linear-gradient(135deg,#5CB7F0,#9CD3F2)",
  "linear-gradient(135deg,#0A6BCF,#0E2C56)",
];

// ============================================================
// PROFILE
// ============================================================
function Profile() {
  return (
    <div style={s.wrap}>
      {/* HERO */}
      <Hero />

      {/* Sticky action row */}
      <div style={s.actionBar}>
        <button style={s.btnChatDisabled}>
          <Ic name="message-circle" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
          Chatear
          <Ic name="lock" size={11} color="#9CA3AF" style={{ marginLeft: 6 }} />
        </button>
        <button style={s.btnRequest}>
          <Ic name="zap" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
          Solicitar servicio
        </button>
      </div>

      {/* Stats */}
      <div style={s.statsRow}>
        {TECH.stats.map((st, i) => (
          <div key={i} style={s.statTile}>
            <div style={s.statVal}>{st.value}</div>
            <div style={s.statLabel}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* About */}
      <Section title="Acerca de mí" icon="user-round">
        <p style={s.bio}>{TECH.bio}</p>
        <div style={s.bioMeta}>
          <span><Ic name="languages" size={11} color="#0A6BCF" style={{ marginRight: 4 }} />Español</span>
          <span style={s.dot} />
          <span><Ic name="map-pin" size={11} color="#0A6BCF" style={{ marginRight: 4 }} />Vive en Zapopan</span>
          <span style={s.dot} />
          <span><Ic name="clock" size={11} color="#0A6BCF" style={{ marginRight: 4 }} />Responde en ~12 min</span>
        </div>
      </Section>

      {/* Certifications */}
      <Section title="Verificaciones" icon="shield-check"
        sub="Estos checks son realizados por Tumantenimiento.">
        <div style={s.certGrid}>
          {TECH.certs.map((c, i) => (
            <div key={i} style={s.certRow}>
              <div style={s.certCheck}><Ic name="check" size={11} color="#FFFFFF" stroke={3.5} /></div>
              <div style={s.certIcon}><Ic name={c.icon} size={14} color="#18A66A" /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.certLabel}>{c.label}</div>
                <div style={s.certSub}>{c.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Services */}
      <Section title="Servicios y tarifas base" icon="tag"
        sub="Los precios pueden variar según diagnóstico. Verás la cotización antes de aceptar.">
        {TECH.services.map((sv, i) => (
          <div key={i} style={s.svcRow}>
            <div style={s.svcIcon}><Ic name="wrench" size={15} color="#0A6BCF" /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={s.svcName}>{sv.label}</div>
              <div style={s.svcTime}>
                <Ic name="clock" size={10} color="#9CA3AF" />
                <span>{sv.time}</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={s.svcMeta}>DESDE</div>
              <div style={s.svcPrice}>${sv.price} <span style={s.svcCurr}>MXN</span></div>
            </div>
          </div>
        ))}
      </Section>

      {/* Gallery */}
      <Section title="Trabajos realizados" icon="image" linkLabel="Ver todos">
        <div style={s.galleryRow}>
          {GALLERY_BGS.map((bg, i) => (
            <div key={i} style={{ ...s.galleryTile, background: bg }}>
              {i === 7 && (
                <div style={s.galleryMore}>
                  <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 18, color: "#FFFFFF" }}>+47</div>
                  <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.85)", letterSpacing: ".04em" }}>FOTOS MÁS</div>
                </div>
              )}
              {i < 4 && (
                <div style={s.galleryTag}>
                  {i === 0 && "Fuga · cocina"}
                  {i === 1 && "WC instalación"}
                  {i === 2 && "Calentador"}
                  {i === 3 && "Drenaje"}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Availability */}
      <Section title="Disponibilidad esta semana" icon="calendar" linkLabel="Ver calendario">
        <div style={s.availRow}>
          {TECH.week.map((d, i) => {
            const tone =
              d.off  ? { bg: "#FBFDFF", border: "#E1E8F0", color: "#9CA3AF" } :
              d.full ? { bg: "#FCE9E9", border: "rgba(220,38,38,0.3)", color: "#DC2626" } :
              d.lateOnly ? { bg: "#FEF3DC", border: "rgba(245,158,11,0.3)", color: "#B45309" } :
              d.today ? { bg: "#0A6BCF", border: "#0A6BCF", color: "#FFFFFF" } :
              { bg: "#FFFFFF", border: "#E1E8F0", color: "#0E2C56" };
            return (
              <div key={i} style={{ ...s.dayTile, background: tone.bg, borderColor: tone.border, color: tone.color }}>
                <div style={{ fontSize: 10, fontWeight: 600, opacity: d.today ? 0.85 : 0.6, textTransform: "uppercase", letterSpacing: ".04em" }}>{d.d}</div>
                <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 16, marginTop: 4 }}>{d.n}</div>
                <div style={{ fontSize: 9, opacity: 0.85, marginTop: 4 }}>
                  {d.off ? "—" : d.full ? "Lleno" : d.lateOnly ? "PM" : `${d.slots} libres`}
                </div>
              </div>
            );
          })}
        </div>
        <div style={s.nextSlot}>
          <Ic name="zap" size={13} color="#18A66A" />
          <span>Próximo horario disponible: <b style={{ color: "#0E2C56", fontWeight: 700 }}>Hoy 3:00 PM</b></span>
        </div>
      </Section>

      {/* Reviews */}
      <Section title={`Reseñas (${TECH.reviews})`} icon="messages-square" linkLabel="Ver todas">
        <div style={s.reviewHead}>
          <div style={s.reviewRatingBig}>
            <span style={s.reviewRatingNum}>{TECH.rating}</span>
            <div style={{ display: "flex", gap: 1, marginTop: 6 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ic key={i} name="star" size={12} color="#F59E0B" />
              ))}
            </div>
            <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>{TECH.reviews} reseñas</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {TECH.ratingDist.map((r) => (
              <div key={r.stars} style={s.distRow}>
                <span style={{ fontSize: 10, color: "#6B7280", width: 16 }}>{r.stars}★</span>
                <div style={s.distTrack}>
                  <div style={{ ...s.distFill, width: `${r.pct}%`, background: r.stars >= 4 ? "#F59E0B" : r.stars === 3 ? "#9CA3AF" : "#DC2626" }} />
                </div>
                <span style={{ fontSize: 10, color: "#6B7280", width: 30, textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>{r.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div style={s.tagsRow}>
          {TECH.tags.map((t, i) => (
            <span key={i} style={s.tag}>
              {t.label}
              <span style={s.tagCount}>{t.n}</span>
            </span>
          ))}
        </div>

        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          {TECH.testimonials.map((rev, i) => (
            <div key={i} style={s.review}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ ...s.revAv, background: AV_TONES[rev.tone] }}>{rev.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0E2C56" }}>{rev.name}</div>
                  <div style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{rev.date}</div>
                </div>
                <div style={{ display: "flex", gap: 1 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Ic key={i} name="star" size={11} color={i <= rev.stars ? "#F59E0B" : "#E1E8F0"} />
                  ))}
                </div>
              </div>
              <p style={s.reviewText}>"{rev.text}"</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Coverage */}
      <Section title="Zona de cobertura" icon="map">
        <div style={s.coverageMap}>
          <CoverageMap />
        </div>
        <div style={s.coverageList}>
          <div style={s.coverageLabel}>Colonias principales</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {TECH.coverage.map((c, i) => (
              <span key={i} style={s.coverageChip}>
                <Ic name="map-pin" size={9} color="#0A6BCF" style={{ marginRight: 4 }} />
                {c}
              </span>
            ))}
          </div>
        </div>
      </Section>

      {/* spacer for sticky CTA */}
      <div style={{ height: 100 }} />

      {/* STICKY CTA */}
      <div style={s.stickyCta}>
        <div style={s.stickyMeta}>
          <div style={{ fontSize: 10, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>DESDE</div>
          <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 18, color: "#0E2C56", lineHeight: 1 }}>$450 <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>MXN</span></div>
        </div>
        <button style={s.stickyBtn}>
          <Ic name="zap" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
          Solicitar con Ramón
        </button>
      </div>
    </div>
  );
}

// ============================================================
// HERO
// ============================================================
function Hero() {
  return (
    <div style={s.hero}>
      <CoverPattern />
      <div style={s.heroOverlay} />

      {/* Top bar */}
      <div style={s.heroTopBar}>
        <button style={s.heroIcon}><Ic name="arrow-left" size={18} color="#FFFFFF" /></button>
        <div style={{ flex: 1 }} />
        <button style={s.heroIcon}><Ic name="share-2" size={16} color="#FFFFFF" /></button>
        <button style={s.heroIcon}><Ic name="heart" size={16} color="#FFFFFF" /></button>
      </div>

      {/* Profile content */}
      <div style={s.heroContent}>
        <div style={s.heroAvOuter}>
          <div style={{ ...s.heroAv, background: AV_TONES[0] }}>
            <span>{TECH.initials}</span>
            <div style={s.heroVerify}><Ic name="check" size={14} color="#FFFFFF" stroke={3.5} /></div>
          </div>
        </div>
        <h1 style={s.heroName}>{TECH.name}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <span style={s.heroVerifyBadge}>
            <Ic name="badge-check" size={11} color="#FFFFFF" />Verificado
          </span>
          <span style={s.heroStarRow}>
            <Ic name="star" size={12} color="#F59E0B" />
            <b style={{ fontSize: 13, color: "#FFFFFF", fontWeight: 700, marginLeft: 4 }}>{TECH.rating}</b>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginLeft: 4 }}>({TECH.reviews} reseñas)</span>
          </span>
        </div>
        <div style={s.heroCats}>
          {TECH.cats.map((c, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span style={{ color: "rgba(255,255,255,0.4)", margin: "0 6px" }}>·</span>}
              <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.95)" }}>{c}</span>
            </React.Fragment>
          ))}
        </div>
        <div style={s.heroDist}>
          <Ic name="map-pin" size={11} color="rgba(255,255,255,0.85)" />
          <span>A <b style={{ color: "#FFFFFF" }}>{TECH.distance}</b> de tu dirección · Zapopan</span>
        </div>
      </div>
    </div>
  );
}

function CoverPattern() {
  return (
    <svg viewBox="0 0 390 280" width="100%" height="280" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, display: "block" }}>
      <defs>
        <linearGradient id="coverGrad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%"  stopColor="#0E2C56" />
          <stop offset="55%" stopColor="#0A6BCF" />
          <stop offset="100%" stopColor="#0894EA" />
        </linearGradient>
        <pattern id="coverDots" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.8" fill="rgba(255,255,255,0.08)" />
        </pattern>
      </defs>
      <rect width="390" height="280" fill="url(#coverGrad)" />
      <rect width="390" height="280" fill="url(#coverDots)" />
      {/* Big abstract tool silhouette */}
      <g transform="translate(290, 60) rotate(20)" opacity="0.10">
        <path d="M0 0 L 60 0 L 60 80 Q 50 110 30 110 Q 10 110 0 80 Z" fill="#FFFFFF" />
        <circle cx="30" cy="40" r="14" fill="rgba(0,0,0,0.2)" />
      </g>
      <g transform="translate(0, 200) rotate(-12)" opacity="0.08">
        <rect x="-20" y="0" width="220" height="14" rx="6" fill="#FFFFFF" />
      </g>
      {/* Halo */}
      <circle cx="120" cy="40" r="80" fill="rgba(24,193,255,0.18)" />
    </svg>
  );
}

function CoverageMap() {
  return (
    <svg viewBox="0 0 350 160" width="100%" height={160} style={{ display: "block", background: "#DDE7F1", borderRadius: 12 }}>
      <defs>
        <pattern id="covGrid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0 L0 0 0 24" fill="none" stroke="#CCD7E5" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="350" height="160" fill="url(#covGrid)" />
      <path d="M0 90 Q 100 70 350 100" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.95" />
      <path d="M180 0 Q 175 80 195 160" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />

      {/* Coverage polygon */}
      <path d="M50 50 Q 130 30 220 50 Q 290 80 270 130 Q 180 145 90 130 Q 30 100 50 50 Z"
            fill="rgba(10,107,207,0.18)" stroke="#0A6BCF" strokeWidth="2" strokeLinejoin="round" />

      {/* Sample colonia pins */}
      <g fill="#0A6BCF" stroke="#FFFFFF" strokeWidth="1.5">
        <circle cx="100" cy="80" r="5" />
        <circle cx="160" cy="65" r="5" />
        <circle cx="200" cy="110" r="5" />
        <circle cx="230" cy="80" r="5" />
        <circle cx="140" cy="120" r="5" />
        <circle cx="80" cy="100" r="5" />
      </g>

      {/* Tech home base */}
      <g transform="translate(175, 88)">
        <circle r="14" fill="rgba(245,158,11,0.25)" />
        <path d="M0,-12 a8,9 0 1 1 0.01,0 Z M0,0 L-3,-7 L3,-7 Z" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
      </g>

      <text x="320" y="20" textAnchor="end" fontSize="9" fontFamily="JetBrains Mono" fill="#0E2C56" opacity="0.55">cobertura · 12 km</text>
    </svg>
  );
}

// ============================================================
// SECTION
// ============================================================
function Section({ title, sub, icon, linkLabel, children }) {
  return (
    <section style={s.section}>
      <div style={s.sectionHead}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {icon && <Ic name={icon} size={14} color="#0A6BCF" />}
            <h2 style={s.sectionTitle}>{title}</h2>
          </div>
          {sub && <div style={s.sectionSub}>{sub}</div>}
        </div>
        {linkLabel && (
          <a href="#" style={s.sectionLink}>
            {linkLabel}
            <Ic name="arrow-right" size={11} color="#0A6BCF" style={{ marginLeft: 3 }} />
          </a>
        )}
      </div>
      {children}
    </section>
  );
}

// ============================================================
// CANVAS
// ============================================================
function PhoneFrame({ children }) {
  return (
    <div style={{ padding: 24 }}>
      <IOSDevice width={390} height={1900}>
        <div style={{ width: 390, height: 1900, position: "relative", overflow: "hidden" }}>{children}</div>
      </IOSDevice>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="profile" title="Perfil público del técnico" subtitle="Ramón Hernández · pantalla decisiva">
        <DCArtboard id="profile" label="Perfil completo · scroll" width={438} height={1948}>
          <PhoneFrame><Profile /></PhoneFrame>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// ============================================================
// STYLES
// ============================================================
const s = {
  wrap: { width: "100%", height: "100%", background: "#F8FBFF", position: "relative" },

  // HERO
  hero: { position: "relative", height: 280, overflow: "hidden", flexShrink: 0 },
  heroOverlay: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(14,44,86,0.15) 0%, rgba(14,44,86,0.35) 100%)" },
  heroTopBar: { position: "relative", display: "flex", alignItems: "center", gap: 8, padding: "50px 16px 0", zIndex: 2 },
  heroIcon: { width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)", display: "grid", placeItems: "center", cursor: "pointer", backdropFilter: "blur(8px)" },
  heroContent: { position: "relative", padding: "20px 22px 16px", color: "#FFFFFF", zIndex: 2 },
  heroAvOuter: { display: "inline-block", padding: 3, background: "#FFFFFF", borderRadius: "50%", boxShadow: "0 6px 16px rgba(14,44,86,0.25)" },
  heroAv: { position: "relative", width: 80, height: 80, borderRadius: "50%", display: "grid", placeItems: "center", color: "#FFFFFF", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 28 },
  heroVerify: { position: "absolute", right: -4, bottom: -4, width: 28, height: 28, borderRadius: "50%", background: "#18A66A", display: "grid", placeItems: "center", border: "3px solid #FFFFFF" },
  heroName: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: "-0.01em", margin: "12px 0 0", color: "#FFFFFF" },
  heroVerifyBadge: { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 9px", background: "rgba(24,166,106,0.95)", color: "#FFFFFF", borderRadius: 999, fontSize: 11, fontWeight: 700 },
  heroStarRow: { display: "inline-flex", alignItems: "center", padding: "2px 9px", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 999 },
  heroCats: { marginTop: 6, fontSize: 12.5 },
  heroDist: { display: "flex", alignItems: "center", gap: 5, marginTop: 8, fontSize: 11.5, color: "rgba(255,255,255,0.85)" },

  // ACTIONS
  actionBar: { display: "flex", gap: 10, padding: "16px 22px 4px", marginTop: -4, position: "relative", zIndex: 3, background: "#F8FBFF" },
  btnChatDisabled: { flex: 1, height: 50, borderRadius: 14, background: "#FFFFFF", color: "#9CA3AF", border: "1.5px solid #E1E8F0", fontWeight: 600, fontSize: 14, cursor: "not-allowed", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  btnRequest: { flex: 1.4, height: 50, borderRadius: 14, background: "#0A6BCF", color: "#FFFFFF", border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(10,107,207,0.28)" },

  // STATS
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, padding: "16px 22px 0" },
  statTile: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, padding: "14px 10px", textAlign: "center" },
  statVal: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 22, color: "#0E2C56", letterSpacing: "-0.01em", lineHeight: 1 },
  statLabel: { fontSize: 10.5, color: "#6B7280", marginTop: 6, fontWeight: 500 },

  // SECTION
  section: { padding: "22px 22px 4px" },
  sectionHead: { display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 },
  sectionTitle: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 17, color: "#0E2C56", letterSpacing: "-0.01em", margin: 0 },
  sectionSub: { fontSize: 11.5, color: "#9CA3AF", marginTop: 4, lineHeight: 1.4 },
  sectionLink: { display: "inline-flex", alignItems: "center", color: "#0A6BCF", textDecoration: "none", fontSize: 12, fontWeight: 600, flexShrink: 0, paddingTop: 2 },

  bio: { fontSize: 14, color: "#0E2C56", lineHeight: 1.55, margin: 0 },
  bioMeta: { display: "flex", alignItems: "center", flexWrap: "wrap", marginTop: 12, fontSize: 11.5, color: "#6B7280" },
  dot: { width: 2, height: 2, borderRadius: "50%", background: "#9CA3AF", margin: "0 8px" },

  // CERTS
  certGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  certRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#E5F7EE", border: "1px solid rgba(24,166,106,0.25)", borderRadius: 12, position: "relative" },
  certCheck: { width: 18, height: 18, borderRadius: "50%", background: "#18A66A", display: "grid", placeItems: "center", flexShrink: 0 },
  certIcon: { width: 24, height: 24, borderRadius: 6, background: "rgba(24,166,106,0.18)", display: "grid", placeItems: "center", flexShrink: 0 },
  certLabel: { fontSize: 12, fontWeight: 600, color: "#0E2C56", lineHeight: 1.3 },
  certSub: { fontSize: 10, color: "#6B7280", marginTop: 2, lineHeight: 1.3 },

  // SERVICES
  svcRow: { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12, marginBottom: 8 },
  svcIcon: { width: 36, height: 36, borderRadius: 10, background: "rgba(10,107,207,0.08)", display: "grid", placeItems: "center", flexShrink: 0 },
  svcName: { fontSize: 13.5, fontWeight: 600, color: "#0E2C56" },
  svcTime: { display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#9CA3AF", marginTop: 3 },
  svcMeta: { fontSize: 9, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".04em" },
  svcPrice: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 16, color: "#0E2C56", lineHeight: 1 },
  svcCurr: { fontSize: 10, color: "#9CA3AF", fontWeight: 500, fontFamily: "'Inter', sans-serif" },

  // GALLERY
  galleryRow: { display: "flex", gap: 6, overflowX: "auto", marginRight: -22, paddingRight: 22 },
  galleryTile: { position: "relative", flex: "0 0 120px", width: 120, height: 120, borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 6px rgba(14,44,86,0.10)" },
  galleryMore: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(14,44,86,0.55)" },
  galleryTag: { position: "absolute", left: 6, bottom: 6, padding: "2px 7px", background: "rgba(14,44,86,0.75)", color: "#FFFFFF", fontSize: 9.5, fontWeight: 600, borderRadius: 4, backdropFilter: "blur(4px)" },

  // AVAILABILITY
  availRow: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 },
  dayTile: { textAlign: "center", padding: "9px 4px", border: "1.5px solid", borderRadius: 10 },
  nextSlot: { display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#E5F7EE", border: "1px solid rgba(24,166,106,0.25)", borderRadius: 10, marginTop: 12, fontSize: 12, color: "#6B7280" },

  // REVIEWS
  reviewHead: { display: "flex", gap: 16, padding: "12px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, alignItems: "center" },
  reviewRatingBig: { textAlign: "center", paddingRight: 14, borderRight: "1px solid #F0F4F9", flexShrink: 0 },
  reviewRatingNum: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 34, color: "#0E2C56", lineHeight: 1, letterSpacing: "-0.02em" },
  distRow: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 },
  distTrack: { flex: 1, height: 5, background: "#EEF3F8", borderRadius: 999, overflow: "hidden" },
  distFill: { height: "100%", borderRadius: 999 },

  tagsRow: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 },
  tag: { display: "inline-flex", alignItems: "center", padding: "4px 10px", background: "#E0F6FF", color: "#0884B0", borderRadius: 999, fontSize: 11.5, fontWeight: 600 },
  tagCount: { marginLeft: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, opacity: 0.7, fontWeight: 500 },

  review: { padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12 },
  revAv: { width: 32, height: 32, borderRadius: "50%", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 11, color: "#FFFFFF", flexShrink: 0 },
  reviewText: { fontSize: 13, color: "#0E2C56", lineHeight: 1.5, margin: 0 },

  // COVERAGE
  coverageMap: { borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(14,44,86,0.06)" },
  coverageList: { padding: "12px 0 0" },
  coverageLabel: { fontSize: 10.5, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".08em", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8, fontWeight: 600 },
  coverageChip: { display: "inline-flex", alignItems: "center", padding: "4px 10px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 999, fontSize: 11.5, color: "#0E2C56", fontWeight: 500 },

  // STICKY CTA
  stickyCta: { position: "absolute", left: 0, right: 0, bottom: 0, background: "#FFFFFF", borderTop: "1px solid #E1E8F0", padding: "14px 18px 28px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 -8px 24px rgba(14,44,86,0.08)" },
  stickyMeta: { flexShrink: 0 },
  stickyBtn: { flex: 1, height: 52, borderRadius: 14, background: "#0A6BCF", color: "#FFFFFF", border: "none", fontWeight: 600, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(10,107,207,0.3)" },
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
