/* global React, ReactDOM, IOSDevice, DesignCanvas, DCSection, DCArtboard */
const { useEffect, useRef, useState } = React;

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

const TONES = [
  "linear-gradient(135deg,#0A6BCF,#18C1FF)",
  "linear-gradient(135deg,#F59E0B,#FBBF24)",
  "linear-gradient(135deg,#18A66A,#4ED896)",
  "linear-gradient(135deg,#0E2C56,#0894EA)",
  "linear-gradient(135deg,#B45309,#F59E0B)",
  "linear-gradient(135deg,#0884B0,#18C1FF)",
  "linear-gradient(135deg,#7C3AED,#A78BFA)",
];

// =====================================================================
// MOCK DATA
// =====================================================================
const SERVICES = [
  {
    id: "SVC-2851", status: "enRoute", cat: "Plomería", catIcon: "wrench", date: "HOY · 14:30",
    tech: { name: "Ramón Hernández", initials: "RH", rating: 4.8, reviews: 214, tone: 0, verified: true, online: true },
    desc: "Reparación de fuga en lavabo del baño principal",
    total: 850, pay: "card", payLabel: "Visa •••• 1234",
    eta: "Llega en 18 min", activeProgress: 60,
  },
  {
    id: "SVC-2849", status: "accepted", cat: "Electricidad", catIcon: "zap", date: "MAÑANA · 10:00",
    tech: { name: "José Carlos Juárez", initials: "JC", rating: 4.9, reviews: 87, tone: 1, verified: true },
    desc: "Instalación de 4 lámparas LED en sala-comedor",
    total: 1200, pay: "oxxo", payLabel: "OXXO Pay",
    sched: "En 19 horas",
  },
  {
    id: "SVC-2840", status: "completed", cat: "Plomería", catIcon: "wrench", date: "12/05/2026",
    tech: { name: "Ramón Hernández", initials: "RH", rating: 4.8, tone: 0, verified: true },
    desc: "Cambio de WC completo y sellado de juntas",
    total: 1450, pay: "card", payLabel: "Visa •••• 1234",
    rated: 5,
  },
  {
    id: "SVC-2832", status: "completed", cat: "Cristales", catIcon: "square", date: "28/04/2026",
    tech: { name: "Miguel Ángel López", initials: "MA", rating: 4.6, tone: 3, verified: true },
    desc: "Cambio de cristal templado · ventana recámara",
    total: 980, pay: "cash", payLabel: "Efectivo",
    needsRating: true,
  },
  {
    id: "SVC-2828", status: "completed", cat: "Pintura", catIcon: "paint-roller", date: "15/04/2026",
    tech: { name: "Lupita Pérez Vázquez", initials: "LP", rating: 4.7, tone: 2, verified: true },
    desc: "Pintura completa de recámara principal",
    total: 2800, pay: "mp", payLabel: "Mercado Pago",
    rated: 5,
  },
  {
    id: "SVC-2815", status: "completed", cat: "Drenaje", catIcon: "droplets", date: "02/04/2026",
    tech: { name: "Carlos Mendoza Ríos", initials: "CM", rating: 4.5, tone: 4, verified: true },
    desc: "Desazolve de drenaje principal",
    total: 1650, pay: "card", payLabel: "Visa •••• 1234",
    rated: 4,
  },
  {
    id: "SVC-2808", status: "completed", cat: "Herrería", catIcon: "hammer", date: "18/03/2026",
    tech: { name: "Roberto Sánchez Luna", initials: "RS", rating: 4.4, tone: 5 },
    desc: "Soldadura de portón + cambio de bisagras",
    total: 1900, pay: "cash", payLabel: "Efectivo",
    rated: 5,
  },
  {
    id: "SVC-2795", status: "cancelled", cat: "Plomería", catIcon: "wrench", date: "08/05/2026",
    tech: { name: "Patricia Hernández", initials: "PH", rating: 4.2, tone: 5, verified: true },
    desc: "Reparación de calentador (cancelado)",
    total: 1200, refund: 1200, pay: "card", payLabel: "Visa •••• 1234",
    cancelledBy: "client", reason: "Cliente reagendó",
  },
  {
    id: "SVC-2780", status: "cancelled", cat: "Gas", catIcon: "flame", date: "21/03/2026",
    tech: { name: "Adrián Vargas", initials: "AV", rating: 4.3, tone: 4 },
    desc: "Revisión de instalación de gas",
    total: 600, penalty: 60, pay: "card", payLabel: "Visa •••• 1234",
    cancelledBy: "tech", reason: "Técnico no disponible",
  },
];

const STATUS_META = {
  enRoute:   { label: "En camino",     bg: "rgba(245,158,11,0.14)",  color: "#B45309", icon: "truck",        ring: "rgba(245,158,11,0.35)" },
  accepted:  { label: "Aceptado",      bg: "rgba(24,193,255,0.14)",  color: "#0884B0", icon: "calendar-check",ring: "rgba(24,193,255,0.35)" },
  inSite:    { label: "En sitio",      bg: "rgba(10,107,207,0.10)",  color: "#0A6BCF", icon: "map-pin",       ring: "rgba(10,107,207,0.30)" },
  completed: { label: "Completado",    bg: "rgba(24,166,106,0.12)",  color: "#0F8A56", icon: "badge-check",   ring: "rgba(24,166,106,0.30)" },
  cancelled: { label: "Cancelado",     bg: "rgba(220,38,38,0.10)",   color: "#DC2626", icon: "x-circle",      ring: "rgba(220,38,38,0.30)" },
};

// =====================================================================
// HEADER + TABS
// =====================================================================
function HistoryHeader() {
  return (
    <div style={s.header}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={s.headerTitle}>Mis servicios</div>
        <div style={s.headerSub}>
          <span style={s.unreadDot} />
          <b style={{ color: "#0E2C56", fontWeight: 700 }}>2 activos</b>
          <span style={s.bullet} />
          <span>26 en total · este año</span>
        </div>
      </div>
      <button style={s.iconBtn}>
        <Ic name="search" size={17} color="#0E2C56" />
      </button>
      <button style={s.iconBtnFilter}>
        <Ic name="sliders-horizontal" size={16} color="#FFFFFF" />
        <span style={s.iconBtnFilterDot} />
      </button>
    </div>
  );
}

function StatusTabs({ active = "active" }) {
  const tabs = [
    { id: "active",    label: "Activos",     count: 2,  color: "#F59E0B" },
    { id: "completed", label: "Completados", count: 21, color: "#18A66A" },
    { id: "cancelled", label: "Cancelados",  count: 3,  color: "#DC2626" },
  ];
  return (
    <div style={s.tabsRow}>
      {tabs.map(t => {
        const isActive = t.id === active;
        return (
          <div key={t.id} style={{ ...s.tab, ...(isActive ? s.tabActive : null) }}>
            <span style={{ color: isActive ? "#0E2C56" : "#6B7280", fontWeight: isActive ? 700 : 500 }}>{t.label}</span>
            <span style={{
              ...s.tabCount,
              background: isActive ? t.color : "rgba(14,44,86,0.06)",
              color: isActive ? "#FFFFFF" : "#6B7280",
            }}>
              {t.count}
            </span>
            {isActive && <div style={{ ...s.tabBar, background: t.color }} />}
          </div>
        );
      })}
    </div>
  );
}

function SubFilterChips({ active = "Todos" }) {
  const cats = [
    { label: "Todos", icon: "layers" },
    { label: "Plomería", icon: "wrench" },
    { label: "Electricidad", icon: "zap" },
    { label: "Cristales", icon: "square" },
    { label: "Pintura", icon: "paint-roller" },
    { label: "Drenaje", icon: "droplets" },
    { label: "Herrería", icon: "hammer" },
    { label: "Gas", icon: "flame" },
  ];
  return (
    <div style={s.subFilterRow}>
      <div style={s.subFilterScroll}>
        {cats.map(c => {
          const isActive = c.label === active;
          return (
            <div key={c.label} style={{ ...s.subChip, ...(isActive ? s.subChipActive : null) }}>
              <Ic name={c.icon} size={11} color={isActive ? "#FFFFFF" : "#6B7280"} stroke={2.2} />
              <span>{c.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =====================================================================
// PAY METHOD MARK
// =====================================================================
function PayMark({ kind, label }) {
  const marks = {
    card: { mark: <div style={s.payCardMark}>VISA</div> },
    oxxo: { mark: <div style={s.payOxxoMark}>OXXO</div> },
    mp:   { mark: <div style={s.payMpMark}><Ic name="wallet" size={11} color="#FFFFFF" /></div> },
    cash: { mark: <div style={s.payCashMark}><Ic name="banknote" size={11} color="#0F8A56" /></div> },
  };
  return (
    <div style={s.payRow}>
      {marks[kind].mark}
      <span style={s.payLabel}>{label}</span>
    </div>
  );
}

// =====================================================================
// SMALL STARS
// =====================================================================
function SmallStars({ value, total = 5, size = 10 }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[...Array(total)].map((_, n) => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24">
          <path d="M12 2.5l2.95 6.42 7.05.78-5.28 4.78 1.52 6.92L12 18.27l-6.24 3.13 1.52-6.92L2 9.7l7.05-.78L12 2.5z" fill={n < value ? "#F59E0B" : "#E1E8F0"} />
        </svg>
      ))}
    </span>
  );
}

// =====================================================================
// SERVICE CARD
// =====================================================================
function ServiceCard({ svc }) {
  const meta = STATUS_META[svc.status];
  const isActive = svc.status === "enRoute" || svc.status === "accepted" || svc.status === "inSite";
  const isCancelled = svc.status === "cancelled";

  return (
    <div style={{
      ...s.card,
      ...(isActive ? s.cardActive : null),
      ...(isCancelled ? s.cardCancelled : null),
    }}>
      {isActive && <div style={{ ...s.cardLeftBar, background: meta.color }} />}

      {/* Row 1 — status + category + date */}
      <div style={s.row1}>
        <div style={{ ...s.statusBadge, background: meta.bg, color: meta.color }}>
          <Ic name={meta.icon} size={11} color={meta.color} stroke={2.3} />
          <span>{meta.label}</span>
        </div>
        <div style={s.catChip}>
          <Ic name={svc.catIcon} size={11} color="#0A6BCF" />
          <span>{svc.cat}</span>
        </div>
        <span style={s.row1Spacer} />
        <span style={s.dateText}>
          {svc.date}
        </span>
      </div>

      {/* Row 2 — tech */}
      <div style={s.row2}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ ...s.techAv, background: TONES[svc.tech.tone % TONES.length] }}>
            {svc.tech.initials}
          </div>
          {svc.tech.verified && (
            <div style={s.techVerify}>
              <Ic name="check" size={9} color="#FFFFFF" stroke={3.5} />
            </div>
          )}
          {svc.tech.online && <div style={s.techOnline} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={s.techName}>{svc.tech.name}</div>
          <div style={s.techRatingRow}>
            <SmallStars value={Math.round(svc.tech.rating)} size={10} />
            <b style={{ color: "#0E2C56", fontWeight: 700, fontSize: 11.5 }}>{svc.tech.rating}</b>
            {svc.tech.reviews && (
              <span style={{ color: "#9CA3AF", fontSize: 10.5 }}>({svc.tech.reviews})</span>
            )}
            {svc.rated && (
              <>
                <span style={s.bullet} />
                <span style={s.ratedNote}>
                  <Ic name="check" size={9} color="#0F8A56" stroke={3} />
                  Calificaste ★{svc.rated}
                </span>
              </>
            )}
          </div>
        </div>
        {svc.eta && (
          <div style={s.etaPill}>
            <span style={s.liveDot} />
            <span>{svc.eta}</span>
          </div>
        )}
        {svc.sched && (
          <div style={s.schedPill}>
            <Ic name="clock" size={10} color="#0A6BCF" />
            <span>{svc.sched}</span>
          </div>
        )}
      </div>

      {/* Row 3 — description (active also shows live progress) */}
      <div style={s.row3}>
        <div style={s.descText}>{svc.desc}</div>
        {svc.status === "enRoute" && (
          <div style={s.progressTrack}>
            <div style={{ ...s.progressFill, width: `${svc.activeProgress}%`, background: "linear-gradient(90deg,#F59E0B,#FBBF24)" }} />
          </div>
        )}
        {svc.cancelledBy && (
          <div style={s.cancelReason}>
            <Ic name="info" size={10} color="#DC2626" />
            <span>{svc.reason}</span>
            {svc.cancelledBy === "tech" && <span style={s.cancelByChip}>técnico</span>}
            {svc.cancelledBy === "client" && <span style={s.cancelByChip}>tú</span>}
          </div>
        )}
      </div>

      {/* Row 4 — total + pay + action */}
      <div style={s.row4}>
        <div style={s.amountWrap}>
          <div style={s.amountLabel}>{isCancelled && svc.refund ? "REEMBOLSADO" : isCancelled && svc.penalty ? "PENALIZACIÓN" : "TOTAL"}</div>
          <div style={{ ...s.amountVal, color: isCancelled ? "#DC2626" : "#0E2C56" }}>
            ${isCancelled && svc.refund ? svc.refund.toLocaleString() : isCancelled && svc.penalty ? svc.penalty.toLocaleString() : svc.total.toLocaleString()}
            <span style={s.amountCurr}>MXN</span>
          </div>
        </div>
        <PayMark kind={svc.pay} label={svc.payLabel} />
        <span style={s.row4Spacer} />
        {/* Action button */}
        {isActive && (
          <button style={s.actionPrimary}>
            <span>Ver</span>
            <Ic name="arrow-right" size={12} color="#FFFFFF" stroke={2.5} style={{ marginLeft: 4 }} />
          </button>
        )}
        {svc.needsRating && (
          <button style={s.actionRate}>
            <Ic name="star" size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
            <span>Calificar</span>
          </button>
        )}
        {svc.rated && (
          <button style={s.actionRepeat}>
            <Ic name="rotate-cw" size={11} color="#0A6BCF" stroke={2.5} style={{ marginRight: 4 }} />
            <span>Repetir</span>
          </button>
        )}
        {isCancelled && (
          <button style={s.actionGhost}>
            <Ic name="rotate-cw" size={11} color="#6B7280" style={{ marginRight: 4 }} />
            <span>Reagendar</span>
          </button>
        )}
      </div>
    </div>
  );
}

// =====================================================================
// FAB + TABBAR
// =====================================================================
function FAB() {
  return (
    <button style={s.fab}>
      <Ic name="plus" size={18} color="#FFFFFF" stroke={2.6} />
      <span>Nuevo servicio</span>
    </button>
  );
}

function BottomTabs({ activeId = "services" }) {
  const tabs = [
    { id: "home",     icon: "home",          label: "Inicio" },
    { id: "services", icon: "clipboard-list",label: "Servicios", badge: 2 },
    { id: "messages", icon: "message-circle",label: "Mensajes" },
    { id: "favs",     icon: "heart",         label: "Favoritos" },
    { id: "profile",  icon: "user",          label: "Perfil" },
  ];
  return (
    <div style={s.tabbar}>
      {tabs.map(t => {
        const isActive = t.id === activeId;
        return (
          <div key={t.id} style={s.tabItem}>
            <div style={{ position: "relative" }}>
              <Ic name={t.icon} size={22} color={isActive ? "#0A6BCF" : "#9CA3AF"} stroke={isActive ? 2.2 : 1.8} />
              {t.badge && (
                <span style={{ ...s.tabBadge, background: isActive ? "#F59E0B" : "#DC2626" }}>{t.badge}</span>
              )}
            </div>
            <span style={{ ...s.tabLabel, color: isActive ? "#0A6BCF" : "#9CA3AF", fontWeight: isActive ? 700 : 500 }}>
              {t.label}
            </span>
            {isActive && <div style={s.tabActiveDot} />}
          </div>
        );
      })}
    </div>
  );
}

// =====================================================================
// SCREENS
// =====================================================================
function ActiveScreen() {
  const list = SERVICES.filter(x => x.status === "enRoute" || x.status === "accepted");
  return (
    <div style={s.wrap}>
      <HistoryHeader />
      <StatusTabs active="active" />
      <SubFilterChips active="Todos" />

      <div style={s.body}>
        {/* Quick stats */}
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <div style={s.statIcon}><Ic name="truck" size={14} color="#B45309" /></div>
            <div>
              <div style={s.statVal}>1</div>
              <div style={s.statLabel}>En camino</div>
            </div>
          </div>
          <div style={s.statCard}>
            <div style={{ ...s.statIcon, background: "rgba(24,193,255,0.18)" }}><Ic name="calendar-check" size={14} color="#0884B0" /></div>
            <div>
              <div style={s.statVal}>1</div>
              <div style={s.statLabel}>Agendado</div>
            </div>
          </div>
          <div style={s.statCard}>
            <div style={{ ...s.statIcon, background: "rgba(10,107,207,0.10)" }}><Ic name="wallet" size={14} color="#0A6BCF" /></div>
            <div>
              <div style={s.statVal}>$2,050</div>
              <div style={s.statLabel}>Por cobrar</div>
            </div>
          </div>
        </div>

        {list.map(svc => <ServiceCard key={svc.id} svc={svc} />)}

        {/* Inline upsell */}
        <div style={s.upsellCard}>
          <div style={s.upsellIcon}>
            <Ic name="sparkles" size={16} color="#FFFFFF" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={s.upsellTitle}>¿Necesitas algo más?</div>
            <div style={s.upsellSub}>Agenda tu próximo servicio en menos de 1 minuto.</div>
          </div>
          <button style={s.upsellBtn}>Explorar</button>
        </div>
      </div>

      <FAB />
      <BottomTabs />
    </div>
  );
}

function CompletedScreen() {
  const list = SERVICES.filter(x => x.status === "completed");
  return (
    <div style={s.wrap}>
      <HistoryHeader />
      <StatusTabs active="completed" />
      <SubFilterChips active="Todos" />

      <div style={s.body}>
        {/* Summary banner */}
        <div style={s.summaryBanner}>
          <div style={s.summaryBlock}>
            <div style={s.summaryVal}>$7,180</div>
            <div style={s.summaryLabel}>gastado en 2026</div>
          </div>
          <div style={s.summaryDivider} />
          <div style={s.summaryBlock}>
            <div style={s.summaryVal}>5</div>
            <div style={s.summaryLabel}>servicios</div>
          </div>
          <div style={s.summaryDivider} />
          <div style={s.summaryBlock}>
            <div style={{ ...s.summaryVal, color: "#B45309" }}>1</div>
            <div style={s.summaryLabel}>sin calificar</div>
          </div>
        </div>

        {list.map(svc => <ServiceCard key={svc.id} svc={svc} />)}

        <div style={s.endLabel}>
          <span style={s.endLine} />
          <span>Estás al día con tu historial</span>
          <span style={s.endLine} />
        </div>
      </div>

      <FAB />
      <BottomTabs />
    </div>
  );
}

function CancelledScreen() {
  const list = SERVICES.filter(x => x.status === "cancelled");
  return (
    <div style={s.wrap}>
      <HistoryHeader />
      <StatusTabs active="cancelled" />
      <SubFilterChips active="Todos" />

      <div style={s.body}>
        <div style={{ ...s.summaryBanner, background: "linear-gradient(135deg, rgba(220,38,38,0.06), rgba(220,38,38,0.02))", borderColor: "rgba(220,38,38,0.25)" }}>
          <div style={s.summaryBlock}>
            <div style={{ ...s.summaryVal, color: "#0F8A56" }}>$1,200</div>
            <div style={s.summaryLabel}>reembolsado</div>
          </div>
          <div style={s.summaryDivider} />
          <div style={s.summaryBlock}>
            <div style={{ ...s.summaryVal, color: "#DC2626" }}>$60</div>
            <div style={s.summaryLabel}>penalizaciones</div>
          </div>
          <div style={s.summaryDivider} />
          <div style={s.summaryBlock}>
            <div style={s.summaryVal}>2</div>
            <div style={s.summaryLabel}>cancelados</div>
          </div>
        </div>

        {list.map(svc => <ServiceCard key={svc.id} svc={svc} />)}

        <div style={s.policyCard}>
          <Ic name="shield-alert" size={14} color="#6B7280" />
          <div style={{ flex: 1 }}>
            <b style={{ color: "#0E2C56", fontWeight: 700 }}>Política de cancelación.</b>{" "}
            Sin penalización si cancelas <b style={{ color: "#0E2C56", fontWeight: 700 }}>antes</b> de que el técnico salga. Después aplica 10%.
          </div>
        </div>
      </div>

      <FAB />
      <BottomTabs />
    </div>
  );
}

// =====================================================================
// EMPTY STATE
// =====================================================================
function EmptyScreen() {
  return (
    <div style={s.wrap}>
      <HistoryHeader />
      <StatusTabs active="active" />

      <div style={s.emptyWrap}>
        <EmptyIllu />
        <div style={s.emptyTitle}>Aún no has solicitado servicios</div>
        <div style={s.emptySub}>
          Cuando solicites tu primer servicio, lo verás aquí con su estado en vivo.
        </div>

        {/* Suggested categories */}
        <div style={s.emptyCatLabel}>POPULARES EN TU ZONA</div>
        <div style={s.emptyCatGrid}>
          <SuggestedCat icon="wrench" label="Plomería" price="desde $350" tone={0} />
          <SuggestedCat icon="zap" label="Electricidad" price="desde $420" tone={1} />
          <SuggestedCat icon="paint-roller" label="Pintura" price="desde $1,200" tone={2} />
          <SuggestedCat icon="flame" label="Gas" price="desde $480" tone={4} />
        </div>

        <button style={s.emptyCta}>
          <Ic name="compass" size={15} color="#FFFFFF" style={{ marginRight: 8 }} />
          Explorar técnicos
        </button>
      </div>

      <BottomTabs />
    </div>
  );
}

function SuggestedCat({ icon, label, price, tone }) {
  return (
    <div style={s.emptyCatCard}>
      <div style={{ ...s.emptyCatIcon, background: TONES[tone] }}>
        <Ic name={icon} size={16} color="#FFFFFF" />
      </div>
      <div style={s.emptyCatLabel2}>{label}</div>
      <div style={s.emptyCatPrice}>{price}</div>
    </div>
  );
}

function EmptyIllu() {
  return (
    <svg viewBox="0 0 200 130" width="180" height="117" style={{ display: "block", margin: "0 auto" }}>
      <defs>
        <linearGradient id="folderGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0A6BCF" />
          <stop offset="1" stopColor="#0894EA" />
        </linearGradient>
      </defs>
      {/* Folder back */}
      <path d="M40 38 L78 38 L88 50 L160 50 L160 110 L40 110 Z" fill="url(#folderGrad)" opacity="0.85" />
      {/* Paper sheets */}
      <rect x="56" y="60" width="86" height="42" rx="4" fill="#FFFFFF" stroke="#E1E8F0" strokeWidth="1" />
      <rect x="64" y="68" width="40" height="3" rx="1.5" fill="#0A6BCF" opacity="0.4" />
      <rect x="64" y="76" width="60" height="3" rx="1.5" fill="#9CA3AF" opacity="0.4" />
      <rect x="64" y="84" width="48" height="3" rx="1.5" fill="#9CA3AF" opacity="0.4" />
      <rect x="64" y="92" width="36" height="3" rx="1.5" fill="#18A66A" opacity="0.5" />
      {/* Folder front lip */}
      <path d="M40 70 L160 70 L160 110 L40 110 Z" fill="url(#folderGrad)" />
      {/* Sparkle */}
      <g fill="#F59E0B">
        <path d="M158 32 L161 38 L167 41 L161 44 L158 50 L155 44 L149 41 L155 38 Z" />
        <circle cx="36" cy="58" r="2.5" />
      </g>
    </svg>
  );
}

// =====================================================================
// CANVAS
// =====================================================================
function PhoneFrame({ children }) {
  return (
    <div style={{ padding: 24 }}>
      <IOSDevice width={390} height={844}>
        <div style={{ width: 390, height: 844, position: "relative", overflow: "hidden", background: "#F8FBFF" }}>{children}</div>
      </IOSDevice>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="primary" title="Mis servicios" subtitle="Histórico del cliente · 3 tabs · Tumantenimiento">
        <DCArtboard id="active" label="01 · Activos (default)" width={438} height={892}>
          <PhoneFrame><ActiveScreen /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="completed" label="02 · Completados" width={438} height={892}>
          <PhoneFrame><CompletedScreen /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="cancelled" label="03 · Cancelados" width={438} height={892}>
          <PhoneFrame><CancelledScreen /></PhoneFrame>
        </DCArtboard>
      </DCSection>

      <DCSection id="empty" title="Estado vacío" subtitle="Sin servicios todavía">
        <DCArtboard id="empty1" label="04 · Sin servicios" width={438} height={892}>
          <PhoneFrame><EmptyScreen /></PhoneFrame>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// =====================================================================
// STYLES
// =====================================================================
const s = {
  wrap: { width: "100%", height: "100%", background: "#F8FBFF", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" },

  // Header
  header: { display: "flex", alignItems: "center", gap: 8, padding: "52px 16px 14px", background: "#FFFFFF", borderBottom: "1px solid #F0F4F9", flexShrink: 0 },
  headerTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 24, color: "#0E2C56", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 },
  headerSub: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6B7280", marginTop: 4 },
  unreadDot: { display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#F59E0B", boxShadow: "0 0 0 3px rgba(245,158,11,0.20)" },
  iconBtn: { width: 38, height: 38, borderRadius: 11, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  iconBtnFilter: { position: "relative", width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg,#0A6BCF,#0894EA)", border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0, boxShadow: "0 4px 10px rgba(10,107,207,0.30)" },
  iconBtnFilterDot: { position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: "#F59E0B", border: "1.5px solid #FFFFFF" },
  bullet: { width: 2, height: 2, borderRadius: "50%", background: "#9CA3AF", margin: "0 2px" },

  // Tabs
  tabsRow: { display: "flex", padding: "0 16px", background: "#FFFFFF", borderBottom: "1px solid #F0F4F9", gap: 4, flexShrink: 0 },
  tab: { position: "relative", display: "flex", alignItems: "center", gap: 6, padding: "12px 4px", fontSize: 13.5, cursor: "pointer", flex: 1, justifyContent: "center" },
  tabActive: {},
  tabCount: { padding: "2px 8px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  tabBar: { position: "absolute", left: 16, right: 16, bottom: 0, height: 2, borderRadius: "2px 2px 0 0" },

  // Sub filter
  subFilterRow: { padding: "10px 0 12px", background: "#FFFFFF", borderBottom: "1px solid #F0F4F9", flexShrink: 0 },
  subFilterScroll: { display: "flex", gap: 6, padding: "0 16px", overflowX: "auto" },
  subChip: { display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 999, background: "#F8FBFF", border: "1px solid #E1E8F0", color: "#6B7280", fontSize: 11.5, fontWeight: 600, cursor: "pointer", flexShrink: 0 },
  subChipActive: { background: "#0E2C56", border: "1px solid #0E2C56", color: "#FFFFFF" },

  // Body
  body: { flex: 1, overflowY: "auto", padding: "14px 16px 110px", display: "flex", flexDirection: "column", gap: 10 },

  // Stats
  statsRow: { display: "flex", gap: 8, marginBottom: 4 },
  statCard: { flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12 },
  statIcon: { width: 30, height: 30, borderRadius: 8, background: "rgba(245,158,11,0.14)", display: "grid", placeItems: "center", flexShrink: 0 },
  statVal: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 15, color: "#0E2C56", letterSpacing: "-0.01em", lineHeight: 1 },
  statLabel: { fontSize: 10, color: "#6B7280", marginTop: 2 },

  // Summary banner
  summaryBanner: { display: "flex", alignItems: "stretch", justifyContent: "space-between", padding: "14px 16px", background: "linear-gradient(135deg, rgba(10,107,207,0.06), rgba(24,193,255,0.04))", border: "1.5px solid rgba(10,107,207,0.20)", borderRadius: 14, marginBottom: 4 },
  summaryBlock: { display: "flex", flexDirection: "column", alignItems: "flex-start", flex: 1 },
  summaryVal: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 18, color: "#0E2C56", letterSpacing: "-0.02em", lineHeight: 1 },
  summaryLabel: { fontSize: 10, color: "#6B7280", marginTop: 4, textTransform: "uppercase", letterSpacing: ".04em", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
  summaryDivider: { width: 1, background: "#E1E8F0", margin: "0 12px" },

  // ===== Card =====
  card: { position: "relative", padding: "14px 16px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, display: "flex", flexDirection: "column", gap: 10, transition: "transform 0.12s", cursor: "pointer", boxShadow: "0 1px 2px rgba(14,44,86,0.03)" },
  cardActive: { borderColor: "rgba(245,158,11,0.30)", boxShadow: "0 4px 14px rgba(245,158,11,0.08)" },
  cardCancelled: { background: "linear-gradient(180deg, #FFFFFF, #FCF6F6)", borderColor: "#F4D9D9", opacity: 0.94 },
  cardLeftBar: { position: "absolute", left: 0, top: 12, bottom: 12, width: 3, borderRadius: "0 3px 3px 0" },

  // Row 1
  row1: { display: "flex", alignItems: "center", gap: 6 },
  statusBadge: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, letterSpacing: ".02em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 },
  catChip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 999, background: "rgba(10,107,207,0.08)", color: "#0A6BCF", fontSize: 11, fontWeight: 600 },
  row1Spacer: { flex: 1 },
  dateText: { fontSize: 11, color: "#6B7280", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" },

  // Row 2
  row2: { display: "flex", alignItems: "center", gap: 10 },
  techAv: { position: "relative", width: 38, height: 38, borderRadius: "50%", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 12 },
  techVerify: { position: "absolute", right: -2, top: -2, width: 14, height: 14, borderRadius: "50%", background: "#18A66A", display: "grid", placeItems: "center", border: "2px solid #FFFFFF" },
  techOnline: { position: "absolute", right: -1, bottom: -1, width: 10, height: 10, borderRadius: "50%", background: "#18A66A", border: "2px solid #FFFFFF" },
  techName: { fontSize: 13.5, fontWeight: 700, color: "#0E2C56" },
  techRatingRow: { display: "flex", alignItems: "center", gap: 4, marginTop: 2, fontSize: 11, color: "#6B7280" },
  ratedNote: { display: "inline-flex", alignItems: "center", gap: 3, color: "#0F8A56", fontWeight: 600, fontSize: 10.5 },
  etaPill: { display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 999, background: "rgba(245,158,11,0.14)", color: "#B45309", fontSize: 10.5, fontWeight: 700 },
  liveDot: { display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#F59E0B", boxShadow: "0 0 0 3px rgba(245,158,11,0.25)" },
  schedPill: { display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 999, background: "rgba(24,193,255,0.14)", color: "#0884B0", fontSize: 10.5, fontWeight: 700 },

  // Row 3
  row3: {},
  descText: { fontSize: 12.5, color: "#0E2C56", lineHeight: 1.45, fontWeight: 500 },
  progressTrack: { marginTop: 8, height: 4, background: "#F0F4F9", borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999 },
  cancelReason: { marginTop: 8, display: "flex", alignItems: "center", gap: 5, padding: "6px 9px", background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.18)", borderRadius: 8, fontSize: 11, color: "#DC2626" },
  cancelByChip: { marginLeft: "auto", padding: "1px 7px", background: "#FFFFFF", border: "1px solid rgba(220,38,38,0.30)", color: "#DC2626", borderRadius: 999, fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", fontFamily: "'JetBrains Mono', monospace" },

  // Row 4
  row4: { display: "flex", alignItems: "center", gap: 10, paddingTop: 10, borderTop: "1px solid #F0F4F9" },
  amountWrap: { display: "flex", flexDirection: "column" },
  amountLabel: { fontSize: 9, color: "#9CA3AF", letterSpacing: ".08em", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  amountVal: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 16, color: "#0E2C56", letterSpacing: "-0.02em", lineHeight: 1, marginTop: 2 },
  amountCurr: { fontSize: 9, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, marginLeft: 3 },
  row4Spacer: { flex: 1 },

  // Pay marks
  payRow: { display: "inline-flex", alignItems: "center", gap: 5 },
  payCardMark: { background: "linear-gradient(135deg,#1A1F71,#2942AC)", color: "#FFFFFF", padding: "2px 6px", borderRadius: 4, fontFamily: "'Manrope', sans-serif", fontSize: 8.5, fontWeight: 800, fontStyle: "italic", letterSpacing: ".06em" },
  payOxxoMark: { background: "#D40511", color: "#FFFFFF", padding: "2px 6px", borderRadius: 4, fontFamily: "'Manrope', sans-serif", fontSize: 8.5, fontWeight: 800, letterSpacing: ".02em" },
  payMpMark: { background: "linear-gradient(135deg,#00B1EA,#009EE3)", padding: 3, borderRadius: 4, display: "grid", placeItems: "center", width: 18, height: 16 },
  payCashMark: { background: "rgba(24,166,106,0.14)", border: "1px solid rgba(24,166,106,0.30)", padding: 2, borderRadius: 4, display: "grid", placeItems: "center", width: 18, height: 16 },
  payLabel: { fontSize: 11, color: "#6B7280", fontWeight: 500 },

  // Action buttons
  actionPrimary: { display: "inline-flex", alignItems: "center", padding: "8px 12px", background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(10,107,207,0.25)" },
  actionRate: { display: "inline-flex", alignItems: "center", padding: "8px 14px", background: "linear-gradient(135deg,#F59E0B,#FBBF24)", color: "#FFFFFF", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(245,158,11,0.35)" },
  actionRepeat: { display: "inline-flex", alignItems: "center", padding: "8px 12px", background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #0A6BCF", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" },
  actionGhost: { display: "inline-flex", alignItems: "center", padding: "8px 12px", background: "#FFFFFF", color: "#6B7280", border: "1px solid #E1E8F0", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer" },

  // End label
  endLabel: { display: "flex", alignItems: "center", gap: 10, padding: "20px 24px 8px", color: "#9CA3AF", fontSize: 11 },
  endLine: { flex: 1, height: 1, background: "#E1E8F0" },

  // Upsell
  upsellCard: { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "linear-gradient(135deg, rgba(10,107,207,0.08), rgba(24,193,255,0.06))", border: "1.5px dashed rgba(10,107,207,0.30)", borderRadius: 14, marginTop: 4 },
  upsellIcon: { width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#0A6BCF,#0894EA)", display: "grid", placeItems: "center", flexShrink: 0 },
  upsellTitle: { fontSize: 13, color: "#0E2C56", fontWeight: 700 },
  upsellSub: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  upsellBtn: { padding: "8px 14px", background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #0A6BCF", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" },

  // Policy card (cancelled tab)
  policyCard: { display: "flex", alignItems: "flex-start", gap: 8, padding: "12px 14px", background: "#F8FBFF", border: "1px dashed #E1E8F0", borderRadius: 12, fontSize: 11.5, color: "#6B7280", lineHeight: 1.5, marginTop: 4 },

  // FAB
  fab: { position: "absolute", right: 16, bottom: 96, display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 18px", background: "linear-gradient(135deg,#0A6BCF,#0894EA)", color: "#FFFFFF", border: "none", borderRadius: 999, fontSize: 13.5, fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 24px rgba(10,107,207,0.40)", zIndex: 4 },

  // Tabbar
  tabbar: { position: "absolute", left: 0, right: 0, bottom: 0, height: 82, background: "rgba(255,255,255,0.96)", borderTop: "1px solid #E1E8F0", display: "flex", justifyContent: "space-around", alignItems: "flex-start", padding: "10px 4px 24px", backdropFilter: "blur(8px)", zIndex: 5 },
  tabItem: { position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1, padding: "4px 0" },
  tabLabel: { fontSize: 10, marginTop: 1 },
  tabBadge: { position: "absolute", top: -4, right: -10, minWidth: 16, height: 16, padding: "0 4px", color: "#FFFFFF", borderRadius: 999, fontSize: 9.5, fontWeight: 700, fontFamily: "'Manrope', sans-serif", display: "grid", placeItems: "center", border: "1.5px solid #FFFFFF" },
  tabActiveDot: { position: "absolute", bottom: 2, width: 4, height: 4, borderRadius: "50%", background: "#0A6BCF" },

  // ===== Empty =====
  emptyWrap: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "30px 24px 110px", textAlign: "center", overflowY: "auto" },
  emptyTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em", marginTop: 16 },
  emptySub: { fontSize: 13.5, color: "#6B7280", marginTop: 8, maxWidth: 280, lineHeight: 1.5 },
  emptyCatLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF", letterSpacing: ".1em", fontWeight: 700, marginTop: 30, marginBottom: 12 },
  emptyCatGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%" },
  emptyCatCard: { padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, textAlign: "left" },
  emptyCatIcon: { width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center", marginBottom: 8 },
  emptyCatLabel2: { fontSize: 13, color: "#0E2C56", fontWeight: 700 },
  emptyCatPrice: { fontSize: 11, color: "#6B7280", marginTop: 2, fontFamily: "'JetBrains Mono', monospace" },
  emptyCta: { width: "100%", marginTop: 22, padding: "14px", background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(10,107,207,0.30)" },
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
