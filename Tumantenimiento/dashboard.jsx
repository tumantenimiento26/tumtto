/* global React, ReactDOM */
const { useState, useEffect, useRef } = React;

// ============================================================
// MOCK DATA — 100% MX, ZMG
// ============================================================
const MOCK = {
  user: { name: "Sofía Martínez", role: "Admin Soporte", initials: "SM" },
  kpis: [
    { label: "Servicios activos ahora", value: "47", delta: "+12%", note: "vs ayer", trend: "up" },
    { label: "Completados hoy", value: "128", delta: "+8%", note: "vs ayer", trend: "up" },
    { label: "GMV del día", value: "$94,320", suffix: "MXN", delta: "+15%", note: "vs ayer", trend: "up" },
    { label: "Técnicos activos", value: "142", denom: "/150", progress: 0.947 },
  ],
  alerts: [
    { tone: "warn", icon: "alert-triangle", text: "Servicio #SVC-2847 atorado en \"en camino\" hace 45 min", time: "hace 45 min" },
    { tone: "err", icon: "shield-alert", text: "Disputa abierta en #SVC-2812 · Cliente: María Rodríguez", time: "hace 1 h 20 min" },
    { tone: "err", icon: "credit-card", text: "Pago OXXO fallido en #SVC-2799 · Reintentar antes de 18:00", time: "hace 2 h" },
    { tone: "warn", icon: "user-x", text: "Técnico Ramón Hernández · 3 cancelaciones esta semana", time: "hoy" },
    { tone: "warn", icon: "clock", text: "5 KYC pendientes de revisión hace +24 h", time: "hace 1 d" },
  ],
  hourly: [
    { h: "06", v: 3 }, { h: "07", v: 6 }, { h: "08", v: 11 }, { h: "09", v: 14 },
    { h: "10", v: 17 }, { h: "11", v: 19 }, { h: "12", v: 22 }, { h: "13", v: 16 },
    { h: "14", v: 21 }, { h: "15", v: 24 }, { h: "16", v: 18 }, { h: "17", v: 15 },
    { h: "18", v: 12 }, { h: "19", v: 9 }, { h: "20", v: 6 }, { h: "21", v: 4 }, { h: "22", v: 2 },
  ],
  categories: [
    { name: "Plomería", value: 312, color: "#0A6BCF" },
    { name: "Electricidad", value: 248, color: "#0894EA" },
    { name: "Drenaje", value: 184, color: "#18C1FF" },
    { name: "Cristales", value: 126, color: "#5CB7F0" },
    { name: "Pintura", value: 98, color: "#9CD3F2" },
  ],
  services: [
    { id: "SVC-2847", client: "María Rodríguez", tech: "Ramón Hernández", cat: "Plomería", status: "en-ejecucion", zone: "Zapopan · Providencia", time: "14:30", total: "$1,250" },
    { id: "SVC-2846", client: "José Carlos Juárez", tech: "Adriana García", cat: "Electricidad", status: "en-camino", zone: "Guadalajara · Chapalita", time: "14:15", total: "$820" },
    { id: "SVC-2845", client: "Lupita Pérez Solís", tech: "Miguel Ángel Salazar", cat: "Gas", status: "completado", zone: "Tlaquepaque · Centro", time: "13:50", total: "$640" },
    { id: "SVC-2844", client: "Fernando Aguilar Ríos", tech: "Daniela Ortega", cat: "Drenaje", status: "en-ejecucion", zone: "Zapopan · Andares", time: "13:30", total: "$1,890" },
    { id: "SVC-2843", client: "Carlos Iván Velázquez", tech: "—", cat: "Cristales", status: "solicitado", zone: "Guadalajara · Lomas del Valle", time: "13:15", total: "$720" },
    { id: "SVC-2842", client: "Adriana Sandoval R.", tech: "Ricardo Mendoza", cat: "Pintura", status: "aceptado", zone: "Tlajomulco · La Estancia", time: "12:50", total: "$2,400" },
    { id: "SVC-2841", client: "Roberto Villanueva", tech: "Sergio Camarena", cat: "Impermeabilización", status: "completado", zone: "Zapopan · Las Águilas", time: "12:20", total: "$3,150" },
    { id: "SVC-2840", client: "Ana Karen Morales", tech: "Luis Esteban Gómez", cat: "Plomería", status: "cancelado", zone: "Guadalajara · Country Club", time: "11:45", total: "$0" },
  ],
};

const STATUS_META = {
  "solicitado":   { label: "Solicitado",   bg: "#EEF3F8", fg: "#0E2C56" },
  "aceptado":     { label: "Aceptado",     bg: "#E0F6FF", fg: "#0884B0" },
  "en-camino":    { label: "En camino",    bg: "#FEF3DC", fg: "#B45309" },
  "en-ejecucion": { label: "En ejecución", bg: "rgba(10,107,207,0.12)", fg: "#0A6BCF" },
  "completado":   { label: "Completado",   bg: "#E5F7EE", fg: "#18A66A" },
  "cancelado":    { label: "Cancelado",    bg: "#FCE9E9", fg: "#DC2626" },
};

// ============================================================
// ICON helper
// ============================================================
function Ic({ name, size = 16, stroke = 1.75, color = "currentColor", style }) {
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
// SIDEBAR (240px, Deep Navy)
// ============================================================
function Sidebar({ density }) {
  const items = [
    { icon: "layout-dashboard", label: "Dashboard", active: true },
    { icon: "users", label: "Usuarios", sub: ["Clientes", "Técnicos"] },
    { icon: "wrench", label: "Servicios" },
    { icon: "folder-tree", label: "Catálogo" },
    { icon: "map", label: "Regiones y cobertura" },
    { icon: "wallet", label: "Finanzas" },
    { icon: "life-buoy", label: "Soporte y disputas", count: 3 },
    { icon: "bar-chart-3", label: "Reportes" },
    { icon: "settings", label: "Configuración" },
  ];
  const padY = density === "dense" ? 6 : 9;

  return (
    <aside style={sb.wrap}>
      <div style={sb.brand}>
        <img src="assets/brand/isotipo-blanco.svg" alt="" style={{ width: 28, height: 28 }} />
        <div>
          <div style={sb.brandWord}>Tumantenimiento</div>
          <div style={sb.brandSub}>Admin Panel</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "8px 12px", overflow: "hidden" }}>
        {items.map((it) => (
          <div key={it.label}>
            <div style={{ ...sb.item, padding: `${padY}px 12px`, ...(it.active ? sb.itemActive : null) }}>
              {it.active && <span style={sb.indicator} />}
              <Ic name={it.icon} size={18} color={it.active ? "#FFFFFF" : "rgba(255,255,255,0.75)"} />
              <span style={{ ...sb.itemLabel, color: it.active ? "#FFFFFF" : "rgba(255,255,255,0.78)" }}>{it.label}</span>
              {it.count && <span style={sb.count}>{it.count}</span>}
              {it.sub && <Ic name="chevron-down" size={14} color="rgba(255,255,255,0.5)" style={{ marginLeft: "auto" }} />}
            </div>
            {it.sub && it.label === "Usuarios" && (
              <div style={{ paddingLeft: 38, marginTop: 2, marginBottom: 6 }}>
                {it.sub.map((s) => (
                  <div key={s} style={{ ...sb.subItem, padding: `${Math.max(padY - 3, 3)}px 12px` }}>{s}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div style={sb.footer}>
        <div style={sb.avSm}>{MOCK.user.initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={sb.userName}>{MOCK.user.name}</div>
          <div style={sb.userRole}>{MOCK.user.role}</div>
        </div>
        <button style={sb.logout} aria-label="Cerrar sesión">
          <Ic name="log-out" size={16} color="rgba(255,255,255,0.7)" />
        </button>
      </div>
    </aside>
  );
}

// ============================================================
// HEADER (64px)
// ============================================================
function Header({ density }) {
  return (
    <header style={{ ...hd.wrap, height: density === "dense" ? 56 : 64 }}>
      <div style={hd.crumbs}>
        <span style={{ color: "#9CA3AF" }}>Inicio</span>
        <Ic name="chevron-right" size={12} color="#9CA3AF" />
        <span style={{ color: "#0E2C56", fontWeight: 500 }}>Dashboard</span>
      </div>

      <div style={hd.searchWrap}>
        <Ic name="search" size={16} color="#9CA3AF" style={{ marginLeft: 14 }} />
        <input
          placeholder="Buscar por nombre, ID de servicio, email o teléfono…"
          style={hd.search}
        />
        <span style={hd.kbd}>⌘ K</span>
      </div>

      <div style={hd.actions}>
        <button style={hd.iconBtn} aria-label="Ayuda">
          <Ic name="help-circle" size={18} color="#6B7280" />
        </button>
        <button style={hd.iconBtn} aria-label="Notificaciones">
          <Ic name="bell" size={18} color="#6B7280" />
          <span style={hd.notif}>3</span>
        </button>
        <div style={hd.userPill}>
          <div style={hd.av}>{MOCK.user.initials}</div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0E2C56" }}>{MOCK.user.name}</div>
            <div style={{ fontSize: 11, color: "#6B7280" }}>{MOCK.user.role}</div>
          </div>
          <Ic name="chevron-down" size={14} color="#9CA3AF" style={{ marginLeft: 6 }} />
        </div>
      </div>
    </header>
  );
}

// ============================================================
// KPI cards
// ============================================================
function KpiCard({ item, density }) {
  const compact = density === "dense";
  return (
    <div style={{ ...kpi.card, padding: compact ? 18 : 24 }}>
      <div style={kpi.label}>{item.label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: compact ? 8 : 12 }}>
        <span style={{ ...kpi.value, fontSize: compact ? 32 : 38 }}>{item.value}</span>
        {item.denom && <span style={{ ...kpi.denom, fontSize: compact ? 15 : 18 }}>{item.denom}</span>}
        {item.suffix && <span style={kpi.suffix}>{item.suffix}</span>}
      </div>
      {item.progress != null ? (
        <div style={{ marginTop: compact ? 10 : 14 }}>
          <div style={kpi.track}>
            <div style={{ ...kpi.fill, width: `${item.progress * 100}%` }} />
          </div>
          <div style={kpi.progressMeta}>
            <span>{Math.round(item.progress * 100)}% en línea</span>
            <span>8 en pausa</span>
          </div>
        </div>
      ) : (
        <div style={kpi.deltaRow}>
          <span style={kpi.delta}>
            <Ic name="trending-up" size={12} color="#18A66A" />
            <b>{item.delta}</b>
          </span>
          <span style={kpi.note}>{item.note}</span>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAP (stylised SVG of ZMG with pins)
// ============================================================
function MapPanel({ density }) {
  const compact = density === "dense";
  return (
    <div style={{ ...card.wrap, padding: compact ? 18 : 24, flex: "0 0 auto" }}>
      <div style={card.head}>
        <div>
          <div style={card.title}>Mapa operativo en tiempo real</div>
          <div style={card.subtitle}>Servicios y técnicos en la Zona Metropolitana de Guadalajara</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={chip.sel}>Todas las regiones</button>
          <button style={chip.btn}>Hoy</button>
        </div>
      </div>

      <div style={{ position: "relative", marginTop: 16 }}>
        <ZmgMap height={compact ? 280 : 320} />
        <div style={mapStyles.regionTag(80, 110)}>Zapopan</div>
        <div style={mapStyles.regionTag(380, 200)}>Guadalajara</div>
        <div style={mapStyles.regionTag(550, 320)}>Tlaquepaque</div>
        <div style={mapStyles.regionTag(680, 230)}>Tonalá</div>
        <div style={mapStyles.regionTag(240, 360)}>Tlajomulco</div>

        {/* Pins */}
        {PINS.map((p, i) => (
          <Pin key={i} {...p} />
        ))}
      </div>

      <div style={mapStyles.legend}>
        <Legend dot="#0A6BCF" label="En ejecución" n={47} />
        <Legend dot="#F59E0B" label="Técnico en camino" n={18} />
        <Legend dot="#18A66A" label="Completados hoy" n={128} />
        <Legend dot="#DC2626" label="Con disputa" n={3} />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6B7280" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#18A66A", boxShadow: "0 0 0 3px rgba(24,166,106,0.2)" }} />
          Actualizado hace 12 s
        </div>
      </div>
    </div>
  );
}

const PINS = [
  { x: 140, y: 180, tone: "blue" },
  { x: 200, y: 140, tone: "amber" },
  { x: 175, y: 220, tone: "green" },
  { x: 260, y: 195, tone: "blue" },
  { x: 320, y: 165, tone: "green" },
  { x: 340, y: 250, tone: "blue" },
  { x: 410, y: 220, tone: "amber" },
  { x: 470, y: 285, tone: "blue" },
  { x: 460, y: 175, tone: "green" },
  { x: 530, y: 235, tone: "red" },
  { x: 580, y: 310, tone: "blue" },
  { x: 640, y: 260, tone: "green" },
  { x: 690, y: 200, tone: "amber" },
  { x: 720, y: 290, tone: "blue" },
  { x: 290, y: 320, tone: "green" },
  { x: 220, y: 350, tone: "blue" },
  { x: 380, y: 350, tone: "amber" },
  { x: 110, y: 250, tone: "green" },
  { x: 60, y: 170, tone: "blue" },
  { x: 440, y: 130, tone: "green" },
];
const PIN_COLORS = { blue: "#0A6BCF", amber: "#F59E0B", green: "#18A66A", red: "#DC2626" };

function Pin({ x, y, tone }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-100%)", pointerEvents: "none" }}>
      <div style={{ width: 14, height: 14, borderRadius: "50%", background: PIN_COLORS[tone], border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(14,44,86,0.18)" }} />
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: PIN_COLORS[tone], opacity: 0.35, margin: "0 auto", transform: "translateY(-2px)" }} />
    </div>
  );
}
function Legend({ dot, label, n }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#6B7280" }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot }} />
      <span>{label}</span>
      <b style={{ color: "#0E2C56", fontWeight: 600 }}>{n}</b>
    </div>
  );
}

// Stylised abstract map of ZMG: irregular city blobs + roads + grid
function ZmgMap({ height = 320 }) {
  return (
    <svg viewBox="0 0 800 380" width="100%" height={height} style={{ borderRadius: 12, background: "#EEF3F8", display: "block" }}>
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0 L0 0 0 40" fill="none" stroke="#DCE6F1" strokeWidth="0.6" />
        </pattern>
        <linearGradient id="zoneA" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#DAE7F5" /><stop offset="100%" stopColor="#C7D9EC" />
        </linearGradient>
        <linearGradient id="zoneB" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#CFE0F2" /><stop offset="100%" stopColor="#BDD4EB" />
        </linearGradient>
      </defs>
      <rect width="800" height="380" fill="url(#grid)" />
      {/* Zapopan (NW) */}
      <path d="M20 80 Q 80 40 180 60 Q 280 75 320 130 Q 340 200 280 230 Q 200 260 140 240 Q 50 220 20 160 Z" fill="url(#zoneA)" />
      {/* Guadalajara (center) */}
      <path d="M280 130 Q 400 90 510 130 Q 580 175 540 250 Q 480 305 380 290 Q 290 270 280 220 Z" fill="url(#zoneB)" />
      {/* Tonalá (E) */}
      <path d="M580 160 Q 680 145 740 200 Q 760 260 700 285 Q 640 290 600 260 Q 570 220 580 160 Z" fill="url(#zoneA)" />
      {/* Tlaquepaque (SE) */}
      <path d="M460 270 Q 540 260 620 295 Q 650 340 580 360 Q 510 370 460 340 Q 430 310 460 270 Z" fill="url(#zoneB)" />
      {/* Tlajomulco (S) */}
      <path d="M180 320 Q 270 305 360 330 Q 400 360 340 370 Q 250 380 180 365 Q 140 345 180 320 Z" fill="url(#zoneA)" />

      {/* Roads / highways */}
      <path d="M0 200 Q 200 180 400 210 Q 600 240 800 220" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
      <path d="M180 0 Q 220 200 280 380" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
      <path d="M520 0 Q 500 200 600 380" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
      <path d="M0 90 Q 300 110 600 90" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.7" />

      {/* Water dot (Lake Cajititlán-ish) */}
      <ellipse cx="290" cy="345" rx="50" ry="18" fill="#B8D8F4" />
    </svg>
  );
}

const mapStyles = {
  regionTag: (x, y) => ({
    position: "absolute",
    left: x, top: y,
    fontSize: 11,
    fontWeight: 600,
    color: "#0E2C56",
    background: "rgba(255,255,255,0.85)",
    padding: "2px 8px",
    borderRadius: 6,
    pointerEvents: "none",
    letterSpacing: ".01em",
  }),
  legend: {
    display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center",
    marginTop: 16, paddingTop: 16, borderTop: "1px solid #E1E8F0",
  },
};

// ============================================================
// ALERTS panel
// ============================================================
function AlertsPanel({ density }) {
  const compact = density === "dense";
  return (
    <div style={{ ...card.wrap, padding: compact ? 18 : 24, height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={card.head}>
        <div>
          <div style={card.title}>Alertas operativas</div>
          <div style={card.subtitle}>5 requieren tu atención</div>
        </div>
        <span style={badge.warnSolid}>5</span>
      </div>
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {MOCK.alerts.map((a, i) => (
          <div key={i} style={al.row}>
            <div style={{ ...al.icon, ...al.iconTone(a.tone) }}>
              <Ic name={a.icon} size={14} color={al.iconColor(a.tone)} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={al.text}>{a.text}</div>
              <div style={al.time}>{a.time}</div>
            </div>
            <button style={al.btn}>Ver</button>
          </div>
        ))}
      </div>
      <a href="#" style={al.allLink}>
        Ver historial de alertas
        <Ic name="arrow-right" size={13} color="#0A6BCF" />
      </a>
    </div>
  );
}

const al = {
  row: {
    display: "flex", alignItems: "center", gap: 12,
    background: "#FBFDFF", border: "1px solid #E1E8F0",
    borderRadius: 10, padding: "12px 12px",
  },
  icon: { width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0 },
  iconTone: (tone) => ({ background: tone === "err" ? "#FCE9E9" : "#FEF3DC" }),
  iconColor: (tone) => (tone === "err" ? "#DC2626" : "#F59E0B"),
  text: { fontSize: 12.5, color: "#0E2C56", lineHeight: 1.4, fontWeight: 500 },
  time: { fontSize: 11, color: "#9CA3AF", marginTop: 3 },
  btn: {
    background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 8,
    padding: "6px 12px", fontSize: 12, fontWeight: 500, color: "#0A6BCF",
    cursor: "pointer", flexShrink: 0,
  },
  allLink: {
    marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6,
    color: "#0A6BCF", textDecoration: "none", fontSize: 13, fontWeight: 500,
  },
};

// ============================================================
// CHARTS
// ============================================================
function HourlyChart({ density }) {
  const compact = density === "dense";
  const max = Math.max(...MOCK.hourly.map((d) => d.v));
  const chartH = compact ? 130 : 160;
  return (
    <div style={{ ...card.wrap, padding: compact ? 18 : 24 }}>
      <div style={card.head}>
        <div>
          <div style={card.title}>Servicios por hora · hoy</div>
          <div style={card.subtitle}>Total: 219 servicios entre 06:00 y 22:00</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button style={chip.sel}>Hoy</button>
          <button style={chip.btn}>7 días</button>
        </div>
      </div>
      <div style={{ marginTop: 18, display: "flex", alignItems: "flex-end", gap: compact ? 6 : 8, height: chartH }}>
        {MOCK.hourly.map((d, i) => {
          const h = (d.v / max) * chartH;
          const isPeak = d.v === max;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: "100%", height: h,
                background: isPeak ? "linear-gradient(180deg, #0A6BCF, #0894EA)" : "#DCE6F1",
                borderRadius: "6px 6px 2px 2px",
                position: "relative",
              }}>
                {isPeak && (
                  <div style={{
                    position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)",
                    background: "#0E2C56", color: "#FFFFFF",
                    fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}>{d.v}</div>
                )}
              </div>
              <div style={{ fontSize: 10.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>{d.h}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategoriesChart({ density }) {
  const compact = density === "dense";
  const max = Math.max(...MOCK.categories.map((d) => d.value));
  return (
    <div style={{ ...card.wrap, padding: compact ? 18 : 24 }}>
      <div style={card.head}>
        <div>
          <div style={card.title}>Top 5 categorías · esta semana</div>
          <div style={card.subtitle}>968 servicios completados</div>
        </div>
        <button style={chip.btn}>Esta semana</button>
      </div>
      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: compact ? 12 : 16 }}>
        {MOCK.categories.map((c, i) => (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#0E2C56", marginBottom: 6 }}>
              <span style={{ fontWeight: 500 }}>{c.name}</span>
              <span style={{ color: "#6B7280", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{c.value} servicios</span>
            </div>
            <div style={{ height: 10, background: "#EEF3F8", borderRadius: 6, overflow: "hidden" }}>
              <div style={{ width: `${(c.value / max) * 100}%`, height: "100%", background: c.color, borderRadius: 6 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// SERVICES TABLE
// ============================================================
function ServicesTable({ density }) {
  const compact = density === "dense";
  const rowH = compact ? 44 : 56;
  return (
    <div style={{ ...card.wrap, padding: 0, overflow: "hidden" }}>
      <div style={{ ...card.head, padding: compact ? "18px 24px 6px" : "24px 28px 8px" }}>
        <div>
          <div style={card.title}>Servicios recientes</div>
          <div style={card.subtitle}>Últimos 8 servicios en la plataforma</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={chip.btn}><Ic name="filter" size={13} color="#0E2C56" style={{ marginRight: 6 }} />Filtros</button>
          <button style={chip.btn}><Ic name="download" size={13} color="#0E2C56" style={{ marginRight: 6 }} />Exportar</button>
        </div>
      </div>
      <table style={tb.table}>
        <thead>
          <tr style={{ background: "#F8FBFF" }}>
            {["ID", "Cliente", "Técnico", "Categoría", "Estado", "Región", "Inicio", "Total"].map((h) => (
              <th key={h} style={tb.th}>{h}</th>
            ))}
            <th style={tb.th}></th>
          </tr>
        </thead>
        <tbody>
          {MOCK.services.map((s, i) => {
            const st = STATUS_META[s.status];
            return (
              <tr key={i} style={{ ...tb.tr, height: rowH }}>
                <td style={{ ...tb.td, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>#{s.id}</td>
                <td style={tb.td}><span style={{ color: "#0E2C56", fontWeight: 500 }}>{s.client}</span></td>
                <td style={tb.td}>{s.tech === "—" ? <span style={{ color: "#9CA3AF" }}>— sin asignar</span> : s.tech}</td>
                <td style={tb.td}>{s.cat}</td>
                <td style={tb.td}>
                  <span style={{ ...badge.base, background: st.bg, color: st.fg }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: st.fg }} />
                    {st.label}
                  </span>
                </td>
                <td style={tb.td}>{s.zone}</td>
                <td style={{ ...tb.td, fontFamily: "'JetBrains Mono', monospace", color: "#6B7280" }}>{s.time}</td>
                <td style={{ ...tb.td, fontWeight: 600, color: "#0E2C56" }}>{s.total} <span style={{ color: "#9CA3AF", fontWeight: 400, fontSize: 11 }}>MXN</span></td>
                <td style={{ ...tb.td, textAlign: "right" }}>
                  <button style={tb.linkBtn}>Ver</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={tb.foot}>
        <span>Mostrando 8 de 219 servicios hoy</span>
        <a href="#" style={al.allLink}>Ver todos<Ic name="arrow-right" size={13} color="#0A6BCF" /></a>
      </div>
    </div>
  );
}

// ============================================================
// COMPOSITION
// ============================================================
function Dashboard({ density = "spaced" }) {
  const gap = density === "dense" ? 16 : 24;
  const mainPad = density === "dense" ? "20px 24px" : "28px 32px";
  return (
    <div style={{ display: "flex", width: 1440, height: 1700, background: "#F8FBFF", fontFamily: "'Inter', sans-serif", color: "#0E2C56" }}>
      <Sidebar density={density} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Header density={density} />
        <main style={{ padding: mainPad, display: "flex", flexDirection: "column", gap, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div>
              <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: density === "dense" ? 24 : 28, margin: 0, color: "#0E2C56", letterSpacing: "-0.01em" }}>
                Buen día, Sofía
              </h1>
              <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>Martes 19/05/2026 · 14:42 hrs · Guadalajara, Jal.</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={chip.btn}><Ic name="calendar" size={13} color="#0E2C56" style={{ marginRight: 6 }} />Hoy</button>
              <button style={{ ...chip.btn, background: "#0A6BCF", color: "#FFFFFF", borderColor: "#0A6BCF" }}><Ic name="plus" size={13} color="#FFFFFF" style={{ marginRight: 6 }} />Nuevo servicio</button>
            </div>
          </div>

          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap }}>
            {MOCK.kpis.map((k) => <KpiCard key={k.label} item={k} density={density} />)}
          </div>

          {/* Map + Alerts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap }}>
            <MapPanel density={density} />
            <AlertsPanel density={density} />
          </div>

          {/* Charts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap }}>
            <HourlyChart density={density} />
            <CategoriesChart density={density} />
          </div>

          {/* Table */}
          <ServicesTable density={density} />
        </main>
      </div>
    </div>
  );
}

// ============================================================
// CANVAS ROOT
// ============================================================
function App() {
  return (
    <DesignCanvas>
      <DCSection id="dashboard" title="Dashboard operativo · Admin Web" subtitle="2 densidades">
        <DCArtboard id="spaced" label="Estilo Stripe · Espaciado (recomendado)" width={1440} height={1700}>
          <Dashboard density="spaced" />
        </DCArtboard>
        <DCArtboard id="dense" label="Estilo Datadog · Denso" width={1440} height={1700}>
          <Dashboard density="dense" />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// ============================================================
// SHARED STYLES
// ============================================================
const sb = {
  wrap: { width: 240, background: "#0E2C56", color: "#FFFFFF", display: "flex", flexDirection: "column", flexShrink: 0, height: "100%", borderRight: "1px solid rgba(255,255,255,0.04)" },
  brand: { display: "flex", alignItems: "center", gap: 10, padding: "20px 18px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  brandWord: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: "-0.01em", lineHeight: 1.1 },
  brandSub: { fontSize: 10.5, color: "rgba(255,255,255,0.5)", marginTop: 3, letterSpacing: ".08em", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" },
  item: { position: "relative", display: "flex", alignItems: "center", gap: 12, borderRadius: 8, cursor: "pointer", marginBottom: 2, transition: "background .15s" },
  itemActive: { background: "rgba(10,107,207,0.20)" },
  indicator: { position: "absolute", left: -12, top: 6, bottom: 6, width: 3, background: "#18C1FF", borderRadius: 3 },
  itemLabel: { fontSize: 13.5, fontWeight: 500, flex: 1 },
  count: { background: "rgba(220,38,38,0.18)", color: "#FCA5A5", borderRadius: 999, fontSize: 11, padding: "1px 7px", fontWeight: 600 },
  subItem: { fontSize: 12.5, color: "rgba(255,255,255,0.6)", borderRadius: 6, cursor: "pointer" },
  footer: { padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 },
  avSm: { width: 32, height: 32, borderRadius: "50%", background: "rgba(10,107,207,0.3)", display: "grid", placeItems: "center", color: "#FFFFFF", fontSize: 12, fontWeight: 600 },
  userName: { fontSize: 13, fontWeight: 600, color: "#FFFFFF", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  userRole: { fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 2 },
  logout: { background: "transparent", border: "1px solid rgba(255,255,255,0.08)", padding: 6, borderRadius: 8, cursor: "pointer", display: "grid", placeItems: "center" },
};

const hd = {
  wrap: { display: "flex", alignItems: "center", gap: 24, padding: "0 28px", background: "#FFFFFF", borderBottom: "1px solid #E1E8F0", flexShrink: 0 },
  crumbs: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#0E2C56", minWidth: 0 },
  searchWrap: { flex: 1, maxWidth: 540, display: "flex", alignItems: "center", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 10, height: 40 },
  search: { flex: 1, border: "none", outline: "none", background: "transparent", padding: "0 12px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#0E2C56" },
  kbd: { marginRight: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#9CA3AF", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 6, padding: "2px 6px" },
  actions: { display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" },
  iconBtn: { position: "relative", background: "transparent", border: "1px solid #E1E8F0", padding: 8, borderRadius: 10, cursor: "pointer", display: "grid", placeItems: "center" },
  notif: { position: "absolute", top: -4, right: -4, background: "#DC2626", color: "#FFFFFF", fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 999, border: "2px solid #FFFFFF" },
  userPill: { display: "flex", alignItems: "center", gap: 10, padding: "4px 12px 4px 4px", border: "1px solid #E1E8F0", borderRadius: 999, cursor: "pointer", background: "#FFFFFF" },
  av: { width: 32, height: 32, borderRadius: "50%", background: "rgba(10,107,207,0.12)", color: "#0A6BCF", fontSize: 12, fontWeight: 600, display: "grid", placeItems: "center" },
};

const card = {
  wrap: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, boxShadow: "0 1px 2px rgba(14,44,86,0.03)" },
  head: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 },
  title: { fontSize: 15, fontWeight: 600, color: "#0E2C56", letterSpacing: "-0.005em" },
  subtitle: { fontSize: 12.5, color: "#6B7280", marginTop: 4 },
};

const kpi = {
  card: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, boxShadow: "0 1px 2px rgba(14,44,86,0.03)" },
  label: { fontSize: 12.5, color: "#6B7280", fontWeight: 500 },
  value: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, color: "#0E2C56", letterSpacing: "-0.02em", lineHeight: 1 },
  denom: { color: "#9CA3AF", fontFamily: "'Manrope', sans-serif", fontWeight: 600 },
  suffix: { fontSize: 12, color: "#9CA3AF", fontWeight: 500, fontFamily: "'JetBrains Mono', monospace" },
  deltaRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 12 },
  delta: { display: "inline-flex", alignItems: "center", gap: 4, color: "#18A66A", background: "#E5F7EE", padding: "3px 8px", borderRadius: 999, fontWeight: 600 },
  note: { color: "#9CA3AF" },
  track: { height: 6, background: "#EEF3F8", borderRadius: 999, overflow: "hidden" },
  fill: { height: "100%", background: "linear-gradient(90deg, #0A6BCF, #18C1FF)", borderRadius: 999 },
  progressMeta: { display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9CA3AF", marginTop: 6 },
};

const chip = {
  btn: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#0E2C56", fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  sel: { background: "rgba(10,107,207,0.08)", border: "1px solid rgba(10,107,207,0.3)", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#0A6BCF", fontWeight: 600, cursor: "pointer" },
};

const badge = {
  base: { display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 9px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, letterSpacing: ".005em" },
  warnSolid: { background: "#FEF3DC", color: "#B45309", fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 999, alignSelf: "flex-start" },
};

const tb = {
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 16px", fontSize: 11, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", borderBottom: "1px solid #E1E8F0" },
  tr: { borderBottom: "1px solid #F0F4F9" },
  td: { padding: "0 16px", fontSize: 13, color: "#0E2C56", verticalAlign: "middle" },
  linkBtn: { background: "transparent", border: "none", color: "#0A6BCF", fontSize: 13, fontWeight: 500, cursor: "pointer" },
  foot: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px", fontSize: 12.5, color: "#6B7280", borderTop: "1px solid #E1E8F0" },
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
