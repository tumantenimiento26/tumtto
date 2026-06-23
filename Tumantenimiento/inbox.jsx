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

// =====================================================================
// MOCK DATA
// =====================================================================
const TONES = [
  "linear-gradient(135deg,#0A6BCF,#18C1FF)",
  "linear-gradient(135deg,#F59E0B,#FBBF24)",
  "linear-gradient(135deg,#18A66A,#4ED896)",
  "linear-gradient(135deg,#0E2C56,#0894EA)",
  "linear-gradient(135deg,#B45309,#F59E0B)",
  "linear-gradient(135deg,#0884B0,#18C1FF)",
  "linear-gradient(135deg,#7C3AED,#A78BFA)",
  "linear-gradient(135deg,#0F8A56,#4ED896)",
];

const STATUS = {
  enRoute:    { label: "En camino",     icon: "truck",        tone: "amber" },
  accepted:   { label: "Aceptado",      icon: "check",        tone: "blue" },
  completed:  { label: "Completado",    icon: "badge-check",  tone: "green" },
  inProgress: { label: "En ejecución",  icon: "wrench",       tone: "blue" },
  cancelled:  { label: "Cancelado",     icon: "x",            tone: "red" },
};

const CHATS = [
  {
    id: 1,
    name: "Ramón Hernández García",
    initials: "RH",
    online: true,
    verified: true,
    cat: "Plomería",
    catIcon: "wrench",
    svc: "#SVC-2851",
    status: "enRoute",
    msg: "Ya estoy en camino, llego en 15 min con tráfico.",
    fromTech: true,
    time: "14:32",
    unread: 2,
    pinned: true,
    active: true,
    toneIdx: 0,
  },
  {
    id: 2,
    name: "José Carlos Juárez",
    initials: "JC",
    verified: true,
    cat: "Electricidad",
    catIcon: "zap",
    svc: "#SVC-2849",
    status: "accepted",
    msg: "Perfecto, mañana entonces a las 10 AM",
    fromMe: true,
    read: true,
    time: "12:08",
    toneIdx: 1,
  },
  {
    id: 3,
    name: "Lupita Pérez Vázquez",
    initials: "LP",
    online: true,
    verified: true,
    cat: "Pintura",
    catIcon: "paint-roller",
    svc: "#SVC-2840",
    status: "completed",
    msg: "Calificaste a Lupita con ★5",
    system: true,
    time: "Ayer",
    toneIdx: 2,
  },
  {
    id: 4,
    name: "Miguel Ángel López",
    initials: "MA",
    verified: true,
    cat: "Cristales",
    catIcon: "square",
    svc: "#SVC-2832",
    status: "completed",
    msg: "Gracias María, cualquier cosa avísame.",
    fromTech: true,
    time: "Lun",
    toneIdx: 3,
  },
  {
    id: 5,
    name: "Carlos Mendoza Ríos",
    initials: "CM",
    verified: true,
    cat: "Drenaje",
    catIcon: "droplets",
    svc: "#SVC-2828",
    status: "inProgress",
    msg: "Foto",
    photo: true,
    fromTech: true,
    time: "10:45",
    unread: 1,
    active: true,
    toneIdx: 4,
  },
  {
    id: 6,
    name: "Patricia Hernández",
    initials: "PH",
    verified: true,
    cat: "Plomería",
    catIcon: "wrench",
    svc: "#SVC-2815",
    status: "cancelled",
    msg: "Servicio cancelado · reembolso procesado",
    system: true,
    time: "08/05",
    toneIdx: 5,
  },
  {
    id: 7,
    name: "Roberto Sánchez Luna",
    initials: "RS",
    cat: "Herrería",
    catIcon: "hammer",
    svc: "#SVC-2808",
    status: "completed",
    msg: "¡Quedó increíble! Muchas gracias",
    fromMe: true,
    read: true,
    time: "03/05",
    toneIdx: 6,
  },
  {
    id: 8,
    name: "Andrea Gómez Castillo",
    initials: "AG",
    verified: true,
    cat: "Impermeabilización",
    catIcon: "shield",
    svc: "#SVC-2795",
    status: "completed",
    msg: "Cualquier duda con el sellado, me avisas.",
    fromTech: true,
    time: "28/04",
    toneIdx: 7,
  },
];

// =====================================================================
// SHARED PIECES
// =====================================================================
function InboxHeader({ searchOpen, onSearchOpen, onSearchClose, queryValue, dense, onDense }) {
  if (searchOpen) {
    return (
      <div style={i.header}>
        <button style={i.iconBtnGhost} onClick={onSearchClose}>
          <Ic name="arrow-left" size={18} color="#0E2C56" />
        </button>
        <div style={i.searchInputExpanded}>
          <Ic name="search" size={15} color="#9CA3AF" />
          <span style={{ flex: 1, color: queryValue ? "#0E2C56" : "#9CA3AF", fontSize: 14 }}>
            {queryValue || "Buscar en mensajes o técnicos…"}
          </span>
          {queryValue && (
            <button style={i.searchClearBtn}>
              <Ic name="x" size={12} color="#6B7280" />
            </button>
          )}
        </div>
      </div>
    );
  }
  return (
    <div style={i.header}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={i.headerTitle}>Mensajes</div>
        <div style={i.headerSub}>
          <span style={i.unreadDot} />
          <b style={{ color: "#0E2C56", fontWeight: 700 }}>3</b> sin leer · 12 conversaciones
        </div>
      </div>
      <button style={i.iconBtn} onClick={onDense} title="Vista">
        <Ic name={dense ? "rows-3" : "rows-2"} size={17} color="#0E2C56" />
      </button>
      <button style={i.iconBtn} onClick={onSearchOpen}>
        <Ic name="search" size={17} color="#0E2C56" />
      </button>
      <button style={i.iconBtnFilter}>
        <Ic name="sliders-horizontal" size={16} color="#FFFFFF" />
      </button>
    </div>
  );
}

function FilterChips({ active = "all", showActiveDot = true }) {
  const chips = [
    { id: "all",      label: "Todos",     count: 12, dot: null },
    { id: "active",   label: "Activos",   count: 2,  dot: "amber" },
    { id: "unread",   label: "No leídos", count: 3,  dot: "blue" },
    { id: "archived", label: "Archivados",count: 5,  dot: null },
  ];
  return (
    <div style={i.chipsRow}>
      <div style={i.chipsScroll}>
        {chips.map(c => {
          const isActive = c.id === active;
          return (
            <div key={c.id} style={{ ...i.chip, ...(isActive ? i.chipActive : null) }}>
              <span>{c.label}</span>
              <span style={{ ...i.chipCount, ...(isActive ? i.chipCountActive : null) }}>
                {c.count}
              </span>
              {c.dot && showActiveDot && (
                <span style={{
                  ...i.chipDot,
                  background: c.dot === "amber" ? "#F59E0B" : c.dot === "blue" ? "#0A6BCF" : "#DC2626",
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS[status];
  const toneMap = {
    amber: { bg: "rgba(245,158,11,0.14)", color: "#B45309" },
    blue:  { bg: "rgba(10,107,207,0.10)", color: "#0A6BCF" },
    green: { bg: "rgba(24,166,106,0.12)", color: "#0F8A56" },
    red:   { bg: "rgba(220,38,38,0.10)",  color: "#DC2626" },
  };
  const v = toneMap[s.tone];
  return (
    <span style={{ ...i.statusBadge, background: v.bg, color: v.color }}>
      <Ic name={s.icon} size={9} color={v.color} stroke={2.4} />
      <span>{s.label}</span>
    </span>
  );
}

function Avatar({ chat, size = 52 }) {
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: TONES[chat.toneIdx % TONES.length],
        color: "#FFFFFF", display: "grid", placeItems: "center",
        fontFamily: "'Manrope', sans-serif", fontWeight: 700,
        fontSize: size * 0.32, letterSpacing: "-0.01em",
      }}>
        {chat.initials}
      </div>
      {chat.verified && (
        <div style={{ ...i.avVerify, width: size * 0.32, height: size * 0.32, right: -2, top: -2 }}>
          <Ic name="check" size={size * 0.18} color="#FFFFFF" stroke={3.5} />
        </div>
      )}
      {chat.online && (
        <div style={{ ...i.avOnline, width: size * 0.26, height: size * 0.26 }} />
      )}
    </div>
  );
}

function MessagePreview({ chat }) {
  // System message
  if (chat.system) {
    return (
      <div style={i.msgRow}>
        <Ic name="info" size={11} color="#9CA3AF" style={{ marginRight: 4 }} />
        <span style={{ ...i.msgText, fontStyle: "italic", color: "#9CA3AF" }}>{chat.msg}</span>
      </div>
    );
  }
  // From me
  if (chat.fromMe) {
    return (
      <div style={i.msgRow}>
        <span style={i.msgPrefix}>Tú:</span>
        <span style={i.msgText}>{chat.msg}</span>
        {chat.read && (
          <span style={i.readMark}>
            <Ic name="check-check" size={12} color="#18C1FF" />
          </span>
        )}
      </div>
    );
  }
  // Photo
  if (chat.photo) {
    return (
      <div style={i.msgRow}>
        <Ic name="image" size={11} color="#0A6BCF" style={{ marginRight: 4 }} />
        <span style={{ ...i.msgText, color: "#0E2C56", fontWeight: 500 }}>Foto</span>
      </div>
    );
  }
  return (
    <div style={i.msgRow}>
      <span style={i.msgText}>{chat.msg}</span>
    </div>
  );
}

// =====================================================================
// CHAT ITEM
// =====================================================================
function ChatItem({ chat, dense = false }) {
  const isActive = chat.active;
  return (
    <div style={{
      ...i.chatItem,
      ...(isActive ? i.chatItemActive : null),
    }}>
      {isActive && <div style={i.activeBar} />}
      <Avatar chat={chat} size={dense ? 44 : 52} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Line 1 — name + time */}
        <div style={i.lineTop}>
          <span style={{ ...i.chatName, fontWeight: chat.unread ? 700 : 600 }}>{chat.name}</span>
          {chat.pinned && (
            <Ic name="pin" size={11} color="#0A6BCF" style={{ marginLeft: 2, transform: "rotate(45deg)" }} />
          )}
          <span style={i.timeSpacer} />
          <span style={{ ...i.chatTime, color: chat.unread ? "#0A6BCF" : "#9CA3AF", fontWeight: chat.unread ? 700 : 500 }}>
            {chat.time}
          </span>
        </div>

        {/* Line 2 — context (hidden in dense=false-as-clean mode) */}
        {!dense && (
          <div style={i.lineMid}>
            <Ic name={chat.catIcon} size={10} color="#6B7280" />
            <span style={{ color: "#6B7280", fontSize: 11 }}>{chat.cat}</span>
            <span style={i.bullet} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#9CA3AF", fontWeight: 600 }}>
              {chat.svc}
            </span>
            <span style={i.bullet} />
            <StatusBadge status={chat.status} />
          </div>
        )}

        {/* Line 3 — message + unread badge */}
        <div style={i.lineBot}>
          <MessagePreview chat={chat} />
          {chat.unread && (
            <span style={i.unreadBadge}>{chat.unread}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// BOTTOM TAB BAR
// =====================================================================
function BottomTabs({ unread = 3 }) {
  const tabs = [
    { id: "home",      icon: "home",          label: "Inicio" },
    { id: "services",  icon: "clipboard-list",label: "Servicios" },
    { id: "messages",  icon: "message-circle",label: "Mensajes", active: true, badge: unread },
    { id: "favs",      icon: "heart",         label: "Favoritos" },
    { id: "profile",   icon: "user",          label: "Perfil" },
  ];
  return (
    <div style={i.tabbar}>
      {tabs.map(t => (
        <div key={t.id} style={i.tabItem}>
          <div style={{ position: "relative" }}>
            <Ic name={t.icon} size={22} color={t.active ? "#0A6BCF" : "#9CA3AF"} stroke={t.active ? 2.2 : 1.8} />
            {t.badge && (
              <span style={i.tabBadge}>{t.badge}</span>
            )}
          </div>
          <span style={{ ...i.tabLabel, color: t.active ? "#0A6BCF" : "#9CA3AF", fontWeight: t.active ? 700 : 500 }}>
            {t.label}
          </span>
          {t.active && <div style={i.tabActiveDot} />}
        </div>
      ))}
    </div>
  );
}

// =====================================================================
// SCREENS
// =====================================================================
function InboxScreen({ dense = false, initialSearch = false }) {
  const [searchOpen, setSearchOpen] = useState(initialSearch);
  const [denseMode, setDenseMode] = useState(dense);

  return (
    <div style={i.wrap}>
      <InboxHeader
        searchOpen={searchOpen}
        onSearchOpen={() => setSearchOpen(true)}
        onSearchClose={() => setSearchOpen(false)}
        dense={denseMode}
        onDense={() => setDenseMode(d => !d)}
      />
      <FilterChips active="all" />

      <div style={i.body}>
        {CHATS.map(chat => (
          <ChatItem key={chat.id} chat={chat} dense={denseMode} />
        ))}
        <div style={i.endLabel}>
          <span style={i.endLine} />
          <span>Has visto todas tus conversaciones</span>
          <span style={i.endLine} />
        </div>
      </div>

      <BottomTabs />
    </div>
  );
}

// ====== Swipe actions revealed ======
function InboxSwipeRevealed() {
  return (
    <div style={i.wrap}>
      <InboxHeader />
      <FilterChips active="all" />

      <div style={i.body}>
        {CHATS.slice(0, 1).map(chat => (
          <ChatItem key={chat.id} chat={chat} />
        ))}

        {/* Item 2 — swiped open */}
        <div style={i.swipeOuter}>
          <div style={i.swipeActions}>
            <div style={{ ...i.swipeAction, background: "#0A6BCF" }}>
              <Ic name="pin" size={16} color="#FFFFFF" />
              <span style={i.swipeLabel}>Fijar</span>
            </div>
            <div style={{ ...i.swipeAction, background: "#9CA3AF" }}>
              <Ic name="bell-off" size={16} color="#FFFFFF" />
              <span style={i.swipeLabel}>Silenciar</span>
            </div>
            <div style={{ ...i.swipeAction, background: "#F59E0B" }}>
              <Ic name="archive" size={16} color="#FFFFFF" />
              <span style={i.swipeLabel}>Archivar</span>
            </div>
          </div>
          <div style={{ transform: "translateX(-216px)", background: "#FFFFFF", position: "relative", zIndex: 1 }}>
            <ChatItem chat={CHATS[1]} />
          </div>
        </div>

        {CHATS.slice(2, 6).map(chat => (
          <ChatItem key={chat.id} chat={chat} />
        ))}
      </div>

      <BottomTabs />
    </div>
  );
}

// ====== Search no results ======
function InboxSearchNoResults() {
  return (
    <div style={i.wrap}>
      <InboxHeader searchOpen={true} queryValue="plomería urgente" onSearchClose={()=>{}} />

      <div style={i.recentRow}>
        <span style={i.recentLabel}>RECIENTES</span>
        <button style={i.recentClear}>Limpiar</button>
      </div>

      <div style={i.body}>
        <div style={i.emptyResults}>
          <div style={i.emptyResultsIcon}>
            <Ic name="search-x" size={32} color="#9CA3AF" />
          </div>
          <div style={i.emptyResultsTitle}>Sin resultados</div>
          <div style={i.emptyResultsSub}>
            No encontramos nada para <b style={{ color: "#0E2C56", fontWeight: 700 }}>"plomería urgente"</b>
          </div>
          <div style={i.emptyResultsHint}>Intenta con otros términos o revisa la ortografía.</div>

          <div style={i.suggestedRow}>
            <span style={i.suggestedLabel}>SUGERENCIAS</span>
            <div style={i.suggestedChips}>
              <div style={i.suggChip}><Ic name="search" size={11} color="#0A6BCF" /><span>Plomería</span></div>
              <div style={i.suggChip}><Ic name="search" size={11} color="#0A6BCF" /><span>Ramón</span></div>
              <div style={i.suggChip}><Ic name="search" size={11} color="#0A6BCF" /><span>#SVC-2851</span></div>
            </div>
          </div>
        </div>
      </div>

      <BottomTabs />
    </div>
  );
}

// ====== Empty state ======
function InboxEmpty() {
  return (
    <div style={i.wrap}>
      <div style={i.header}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={i.headerTitle}>Mensajes</div>
          <div style={i.headerSub}>0 conversaciones</div>
        </div>
        <button style={i.iconBtn}>
          <Ic name="search" size={17} color="#9CA3AF" />
        </button>
      </div>

      <div style={i.emptyWrap}>
        <EmptyIllu />
        <div style={i.emptyTitle}>Sin mensajes todavía</div>
        <div style={i.emptySub}>
          Cuando solicites un servicio, podrás chatear con tu técnico desde aquí para coordinar detalles.
        </div>

        <div style={i.emptyTipsRow}>
          <div style={i.emptyTip}>
            <div style={{ ...i.emptyTipIcon, background: "rgba(10,107,207,0.10)" }}>
              <Ic name="shield-check" size={14} color="#0A6BCF" />
            </div>
            <span>Chats privados con técnicos verificados</span>
          </div>
          <div style={i.emptyTip}>
            <div style={{ ...i.emptyTipIcon, background: "rgba(24,193,255,0.15)" }}>
              <Ic name="image" size={14} color="#0884B0" />
            </div>
            <span>Comparte fotos del problema en segundos</span>
          </div>
          <div style={i.emptyTip}>
            <div style={{ ...i.emptyTipIcon, background: "rgba(24,166,106,0.12)" }}>
              <Ic name="bell" size={14} color="#0F8A56" />
            </div>
            <span>Recibe actualizaciones del servicio en vivo</span>
          </div>
        </div>

        <button style={i.emptyCta}>
          <Ic name="compass" size={15} color="#FFFFFF" style={{ marginRight: 8 }} />
          Explorar técnicos
        </button>
        <button style={i.emptyCtaGhost}>Ver categorías de servicio</button>
      </div>

      <BottomTabs unread={0} />
    </div>
  );
}

function EmptyIllu() {
  return (
    <svg viewBox="0 0 200 140" width="180" height="126" style={{ display: "block", margin: "0 auto" }}>
      {/* back bubbles */}
      <g opacity="0.55">
        <rect x="20" y="22" width="80" height="44" rx="14" fill="#E0F0FB" />
        <circle cx="36" cy="44" r="3" fill="#0894EA" opacity="0.5" />
        <circle cx="48" cy="44" r="3" fill="#0894EA" opacity="0.5" />
        <circle cx="60" cy="44" r="3" fill="#0894EA" opacity="0.5" />
      </g>
      <g opacity="0.7">
        <rect x="110" y="46" width="72" height="38" rx="12" fill="#CDE6F8" />
        <rect x="120" y="60" width="32" height="3" rx="1.5" fill="#0A6BCF" opacity="0.4" />
        <rect x="120" y="68" width="48" height="3" rx="1.5" fill="#0A6BCF" opacity="0.4" />
      </g>
      {/* main bubble */}
      <g transform="translate(40, 70)">
        <rect width="120" height="58" rx="18" fill="url(#chatGrad)" />
        <path d="M 24 58 L 28 70 L 38 58 Z" fill="#0A6BCF" />
        <circle cx="40" cy="29" r="4" fill="#FFFFFF" />
        <circle cx="60" cy="29" r="4" fill="#FFFFFF" />
        <circle cx="80" cy="29" r="4" fill="#FFFFFF" />
      </g>
      {/* sparkle */}
      <g fill="#F59E0B">
        <path d="M180 30 L182 36 L188 38 L182 40 L180 46 L178 40 L172 38 L178 36 Z" />
      </g>
      <defs>
        <linearGradient id="chatGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0A6BCF" />
          <stop offset="1" stopColor="#18C1FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ====== Bottom sheet filter ======
function InboxFilterSheet() {
  return (
    <div style={{ ...i.wrap, background: "#F8FBFF" }}>
      {/* Dimmed inbox behind */}
      <div style={{ filter: "blur(0px)", opacity: 0.55, pointerEvents: "none" }}>
        <InboxHeader />
        <FilterChips active="all" showActiveDot={false} />
        <div style={{ ...i.body, paddingBottom: 0 }}>
          {CHATS.slice(0, 3).map(chat => (
            <ChatItem key={chat.id} chat={chat} />
          ))}
        </div>
      </div>
      {/* Scrim */}
      <div style={i.scrim} />
      {/* Sheet */}
      <div style={i.sheet}>
        <div style={i.sheetHandle} />
        <div style={i.sheetHead}>
          <div style={i.sheetTitle}>Filtrar conversaciones</div>
          <button style={i.sheetClose}><Ic name="x" size={15} color="#6B7280" /></button>
        </div>

        {/* Estado del servicio */}
        <div style={i.sheetSection}>
          <div style={i.sheetSectionLabel}>ESTADO DEL SERVICIO</div>
          <div style={i.sheetChipRow}>
            <FilterChip color="amber" label="En camino"     icon="truck" selected />
            <FilterChip color="blue"  label="En ejecución"  icon="wrench" selected />
            <FilterChip color="green" label="Completado"    icon="badge-check" />
            <FilterChip color="red"   label="Cancelado"     icon="x" />
          </div>
        </div>

        {/* Categoría */}
        <div style={i.sheetSection}>
          <div style={i.sheetSectionLabel}>CATEGORÍA</div>
          <div style={i.sheetChipRow}>
            <CatChip label="Plomería"          icon="wrench"        selected />
            <CatChip label="Electricidad"      icon="zap" />
            <CatChip label="Cristales"         icon="square" />
            <CatChip label="Gas"               icon="flame" />
            <CatChip label="Pintura"           icon="paint-roller"  selected />
            <CatChip label="Drenaje"           icon="droplets" />
            <CatChip label="Herrería"          icon="hammer" />
            <CatChip label="Impermeabilización" icon="shield" />
          </div>
        </div>

        {/* Periodo */}
        <div style={i.sheetSection}>
          <div style={i.sheetSectionLabel}>PERIODO</div>
          <div style={i.radioRow}>
            <RadioRow label="Última semana" />
            <RadioRow label="Último mes" selected />
            <RadioRow label="Últimos 3 meses" />
            <RadioRow label="Todos" />
          </div>
        </div>

        {/* Footer */}
        <div style={i.sheetFooter}>
          <button style={i.sheetClear}>Limpiar todo</button>
          <button style={i.sheetApply}>
            <span>Aplicar</span>
            <span style={i.sheetApplyCount}>8 resultados</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ color, label, icon, selected }) {
  const map = {
    amber: { bg: "rgba(245,158,11,0.14)",  color: "#B45309", border: "#F59E0B" },
    blue:  { bg: "rgba(10,107,207,0.10)",  color: "#0A6BCF", border: "#0A6BCF" },
    green: { bg: "rgba(24,166,106,0.12)",  color: "#0F8A56", border: "#18A66A" },
    red:   { bg: "rgba(220,38,38,0.10)",   color: "#DC2626", border: "#DC2626" },
  };
  const v = map[color];
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "8px 12px", borderRadius: 999,
      background: selected ? v.bg : "#FFFFFF",
      border: `1.5px solid ${selected ? v.border : "#E1E8F0"}`,
      color: selected ? v.color : "#6B7280",
      fontSize: 12.5, fontWeight: 600, cursor: "pointer",
    }}>
      <Ic name={icon} size={12} color={selected ? v.color : "#9CA3AF"} stroke={2.2} />
      <span>{label}</span>
      {selected && <Ic name="check" size={11} color={v.color} stroke={3} />}
    </div>
  );
}

function CatChip({ label, icon, selected }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "7px 12px", borderRadius: 999,
      background: selected ? "rgba(10,107,207,0.10)" : "#FFFFFF",
      border: `1.5px solid ${selected ? "#0A6BCF" : "#E1E8F0"}`,
      color: selected ? "#0A6BCF" : "#6B7280",
      fontSize: 12, fontWeight: 600, cursor: "pointer",
    }}>
      <Ic name={icon} size={11} color={selected ? "#0A6BCF" : "#9CA3AF"} stroke={2.2} />
      <span>{label}</span>
    </div>
  );
}

function RadioRow({ label, selected }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 4px", borderBottom: "1px solid #F0F4F9",
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: "50%",
        border: `2px solid ${selected ? "#0A6BCF" : "#E1E8F0"}`,
        display: "grid", placeItems: "center", flexShrink: 0,
      }}>
        {selected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0A6BCF" }} />}
      </div>
      <span style={{ flex: 1, fontSize: 14, color: selected ? "#0E2C56" : "#6B7280", fontWeight: selected ? 600 : 500 }}>{label}</span>
    </div>
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
      <DCSection id="primary" title="Bandeja de mensajes" subtitle="Vista principal · cliente · Tumantenimiento">
        <DCArtboard id="default" label="01 · Default — Todos" width={438} height={892}>
          <PhoneFrame><InboxScreen /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="clean" label="02 · Limpio — sin meta línea" width={438} height={892}>
          <PhoneFrame><InboxScreen dense={true} /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="swipe" label="03 · Swipe revelado — acciones" width={438} height={892}>
          <PhoneFrame><InboxSwipeRevealed /></PhoneFrame>
        </DCArtboard>
      </DCSection>

      <DCSection id="search" title="Búsqueda y filtros" subtitle="Estados de búsqueda + bottom sheet">
        <DCArtboard id="searchempty" label="04 · Búsqueda — sin resultados" width={438} height={892}>
          <PhoneFrame><InboxSearchNoResults /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="sheet" label="05 · Filtros — bottom sheet" width={438} height={892}>
          <PhoneFrame><InboxFilterSheet /></PhoneFrame>
        </DCArtboard>
      </DCSection>

      <DCSection id="empty" title="Estado vacío" subtitle="Onboarding sin conversaciones">
        <DCArtboard id="emptyState" label="06 · Sin mensajes todavía" width={438} height={892}>
          <PhoneFrame><InboxEmpty /></PhoneFrame>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// =====================================================================
// STYLES
// =====================================================================
const i = {
  wrap: { width: "100%", height: "100%", background: "#F8FBFF", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" },

  // ===== Header =====
  header: { display: "flex", alignItems: "center", gap: 8, padding: "52px 16px 14px", background: "#FFFFFF", borderBottom: "1px solid #F0F4F9", flexShrink: 0 },
  headerTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 24, color: "#0E2C56", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 },
  headerSub: { display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#6B7280", marginTop: 4 },
  unreadDot: { display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#0A6BCF", boxShadow: "0 0 0 3px rgba(10,107,207,0.18)" },
  iconBtn: { width: 38, height: 38, borderRadius: 11, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  iconBtnGhost: { width: 38, height: 38, borderRadius: 11, background: "transparent", border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  iconBtnFilter: { width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg,#0A6BCF,#0894EA)", border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0, boxShadow: "0 4px 10px rgba(10,107,207,0.30)" },

  // Search expanded
  searchInputExpanded: { flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#F8FBFF", border: "1.5px solid #0A6BCF", borderRadius: 12, boxShadow: "0 0 0 3px rgba(10,107,207,0.12)" },
  searchClearBtn: { width: 20, height: 20, borderRadius: "50%", background: "#E1E8F0", border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },

  // Recents in search empty state
  recentRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px 4px", background: "#FFFFFF" },
  recentLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF", letterSpacing: ".1em", fontWeight: 700 },
  recentClear: { background: "transparent", border: "none", color: "#0A6BCF", fontWeight: 600, fontSize: 12, cursor: "pointer" },

  // ===== Filter chips =====
  chipsRow: { padding: "10px 16px 10px", background: "#FFFFFF", borderBottom: "1px solid #F0F4F9", flexShrink: 0 },
  chipsScroll: { display: "flex", gap: 8, overflowX: "auto" },
  chip: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 999, background: "#F8FBFF", border: "1px solid #E1E8F0", color: "#6B7280", fontSize: 12.5, fontWeight: 600, cursor: "pointer", flexShrink: 0, position: "relative" },
  chipActive: { background: "#0A6BCF", border: "1px solid #0A6BCF", color: "#FFFFFF", boxShadow: "0 4px 10px rgba(10,107,207,0.30)" },
  chipCount: { background: "rgba(14,44,86,0.06)", color: "#6B7280", padding: "1px 7px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  chipCountActive: { background: "rgba(255,255,255,0.22)", color: "#FFFFFF" },
  chipDot: { width: 7, height: 7, borderRadius: "50%", marginLeft: 2 },

  // ===== Body =====
  body: { flex: 1, overflowY: "auto", background: "#FFFFFF", paddingBottom: 86 },

  // ===== Chat item =====
  chatItem: { position: "relative", display: "flex", gap: 12, padding: "14px 16px", borderBottom: "1px solid #F4F7FB", background: "#FFFFFF", cursor: "pointer" },
  chatItemActive: { background: "linear-gradient(90deg, rgba(10,107,207,0.06), rgba(10,107,207,0.02))" },
  activeBar: { position: "absolute", left: 0, top: 8, bottom: 8, width: 3, background: "#0A6BCF", borderRadius: "0 3px 3px 0" },

  avVerify: { position: "absolute", borderRadius: "50%", background: "#18A66A", border: "2px solid #FFFFFF", display: "grid", placeItems: "center" },
  avOnline: { position: "absolute", right: -1, bottom: -1, borderRadius: "50%", background: "#18A66A", border: "2.5px solid #FFFFFF" },

  lineTop: { display: "flex", alignItems: "center", gap: 4, marginBottom: 4 },
  chatName: { color: "#0E2C56", fontSize: 14.5, letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 },
  timeSpacer: { marginLeft: "auto" },
  chatTime: { fontSize: 11.5, flexShrink: 0, fontFamily: "'Inter', sans-serif" },

  lineMid: { display: "flex", alignItems: "center", gap: 4, marginBottom: 4, flexWrap: "nowrap", overflow: "hidden" },
  bullet: { width: 2, height: 2, borderRadius: "50%", background: "#9CA3AF", margin: "0 2px", flexShrink: 0 },
  statusBadge: { display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 6px", borderRadius: 999, fontSize: 9.5, fontWeight: 700, letterSpacing: ".02em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 },

  lineBot: { display: "flex", alignItems: "center", gap: 8 },
  msgRow: { flex: 1, display: "flex", alignItems: "center", gap: 2, fontSize: 13, color: "#6B7280", minWidth: 0 },
  msgText: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0, flex: 1, lineHeight: 1.4 },
  msgPrefix: { color: "#9CA3AF", fontWeight: 600, marginRight: 4, flexShrink: 0 },
  readMark: { display: "inline-flex", marginLeft: 4, flexShrink: 0 },
  unreadBadge: { background: "#0A6BCF", color: "#FFFFFF", borderRadius: 999, minWidth: 20, height: 20, padding: "0 6px", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, fontFamily: "'Manrope', sans-serif", flexShrink: 0, boxShadow: "0 2px 6px rgba(10,107,207,0.30)" },

  endLabel: { display: "flex", alignItems: "center", gap: 10, padding: "20px 24px 8px", color: "#9CA3AF", fontSize: 11 },
  endLine: { flex: 1, height: 1, background: "#E1E8F0" },

  // ===== Swipe =====
  swipeOuter: { position: "relative", overflow: "hidden", borderBottom: "1px solid #F4F7FB" },
  swipeActions: { position: "absolute", right: 0, top: 0, bottom: 0, display: "flex", width: 216 },
  swipeAction: { width: 72, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 },
  swipeLabel: { color: "#FFFFFF", fontSize: 10.5, fontWeight: 700 },

  // ===== Tabs =====
  tabbar: { position: "absolute", left: 0, right: 0, bottom: 0, height: 82, background: "rgba(255,255,255,0.96)", borderTop: "1px solid #E1E8F0", display: "flex", justifyContent: "space-around", alignItems: "flex-start", padding: "10px 4px 24px", backdropFilter: "blur(8px)", zIndex: 5 },
  tabItem: { position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1, padding: "4px 0" },
  tabLabel: { fontSize: 10, marginTop: 1 },
  tabBadge: { position: "absolute", top: -4, right: -10, minWidth: 16, height: 16, padding: "0 4px", background: "#DC2626", color: "#FFFFFF", borderRadius: 999, fontSize: 9.5, fontWeight: 700, fontFamily: "'Manrope', sans-serif", display: "grid", placeItems: "center", border: "1.5px solid #FFFFFF" },
  tabActiveDot: { position: "absolute", bottom: 2, width: 4, height: 4, borderRadius: "50%", background: "#0A6BCF" },

  // ===== Search no results =====
  emptyResults: { padding: "44px 24px 24px", textAlign: "center" },
  emptyResultsIcon: { width: 68, height: 68, borderRadius: "50%", background: "rgba(14,44,86,0.05)", display: "grid", placeItems: "center", margin: "0 auto 16px" },
  emptyResultsTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 700, color: "#0E2C56", letterSpacing: "-0.01em" },
  emptyResultsSub: { fontSize: 13, color: "#6B7280", marginTop: 6, lineHeight: 1.5 },
  emptyResultsHint: { fontSize: 12, color: "#9CA3AF", marginTop: 4 },
  suggestedRow: { marginTop: 26 },
  suggestedLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF", letterSpacing: ".1em", fontWeight: 700, display: "block", marginBottom: 12 },
  suggestedChips: { display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" },
  suggChip: { display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 999, background: "#FFFFFF", border: "1px solid #E1E8F0", color: "#0A6BCF", fontSize: 12, fontWeight: 600, cursor: "pointer" },

  // ===== Empty state =====
  emptyWrap: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "30px 24px 110px", textAlign: "center" },
  emptyTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em", marginTop: 16 },
  emptySub: { fontSize: 13.5, color: "#6B7280", marginTop: 8, maxWidth: 280, lineHeight: 1.5 },
  emptyTipsRow: { display: "flex", flexDirection: "column", gap: 8, marginTop: 22, width: "100%" },
  emptyTip: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12, fontSize: 12, color: "#0E2C56", fontWeight: 500, textAlign: "left" },
  emptyTipIcon: { width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0 },
  emptyCta: { width: "100%", marginTop: 22, padding: "14px", background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(10,107,207,0.30)" },
  emptyCtaGhost: { marginTop: 8, padding: "10px", background: "transparent", color: "#0A6BCF", border: "none", fontWeight: 600, fontSize: 12.5, cursor: "pointer" },

  // ===== Sheet =====
  scrim: { position: "absolute", inset: 0, background: "rgba(14,44,86,0.55)", zIndex: 8 },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, background: "#FFFFFF", borderRadius: "20px 20px 0 0", padding: "10px 18px 30px", boxShadow: "0 -12px 30px rgba(14,44,86,0.20)", zIndex: 10, maxHeight: "78%", overflowY: "auto" },
  sheetHandle: { width: 40, height: 4, background: "#E1E8F0", borderRadius: 999, margin: "0 auto 12px" },
  sheetHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  sheetTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 17, fontWeight: 700, color: "#0E2C56", letterSpacing: "-0.01em" },
  sheetClose: { width: 30, height: 30, borderRadius: 10, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer" },

  sheetSection: { marginTop: 16 },
  sheetSectionLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF", letterSpacing: ".1em", fontWeight: 700, marginBottom: 10 },
  sheetChipRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  radioRow: { display: "flex", flexDirection: "column" },

  sheetFooter: { display: "flex", gap: 10, marginTop: 20, paddingTop: 14, borderTop: "1px solid #F0F4F9" },
  sheetClear: { flex: 1, padding: "12px", background: "transparent", color: "#6B7280", border: "1px solid #E1E8F0", borderRadius: 12, fontWeight: 600, fontSize: 13, cursor: "pointer" },
  sheetApply: { flex: 2, padding: "12px", background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 13.5, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 14px rgba(10,107,207,0.30)" },
  sheetApplyCount: { fontSize: 11, fontWeight: 600, opacity: 0.85, background: "rgba(255,255,255,0.18)", padding: "2px 7px", borderRadius: 999, fontFamily: "'JetBrains Mono', monospace" },
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
