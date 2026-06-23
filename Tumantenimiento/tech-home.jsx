/* global React, ReactDOM, IOSDevice, DesignCanvas, DCSection, DCArtboard */
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

const CLIENT_TONES = [
  "linear-gradient(135deg,#F59E0B,#FBBF24)",
  "linear-gradient(135deg,#0894EA,#18C1FF)",
  "linear-gradient(135deg,#7C3AED,#A78BFA)",
  "linear-gradient(135deg,#18A66A,#4ED896)",
];

// =====================================================================
// HEADER — Greeting + Stats + Availability toggle
// =====================================================================
function TechHeader({ available = true }) {
  return (
    <div style={{ ...h.header, ...(available ? null : h.headerOff) }}>
      <div style={h.headerOverlay} />
      <div style={h.headerGlow} />

      {/* Top row: greeting + avail toggle */}
      <div style={h.greetRow}>
        <div style={h.greetAv}>
          <span>RH</span>
          <div style={h.greetVerify}><Ic name="check" size={9} color="#FFFFFF" stroke={3.5} /></div>
        </div>
        <div style={{ flex: 1, minWidth: 0, marginLeft: 12 }}>
          <div style={h.greetSmall}>Buenos días</div>
          <div style={h.greetName}>Hola, Ramón <span style={{ fontFamily: "system-ui, sans-serif" }}>👋</span></div>
        </div>
        <div style={{ ...h.availPill, ...(available ? h.availOn : h.availOff) }}>
          <span style={{ ...h.availDot, background: available ? "#4ED896" : "#9CA3AF" }} />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={h.availLabel}>{available ? "Disponible" : "No disponible"}</span>
            <span style={h.availSub}>{available ? "Recibiendo solicitudes" : "Pausado"}</span>
          </div>
          <div style={{ ...h.toggleTrack, background: available ? "rgba(78,216,150,0.40)" : "rgba(255,255,255,0.20)" }}>
            <div style={{ ...h.toggleKnob, left: available ? 16 : 2 }} />
          </div>
        </div>
      </div>

      {/* Subtitle */}
      <div style={h.greetSub}>
        {available
          ? "Listo para hoy. Te avisamos cuando llegue una nueva solicitud."
          : "Pausaste tus solicitudes. Reactiva cuando estés listo."
        }
      </div>

      {/* Stats */}
      <div style={h.statsRow}>
        <div style={h.statBlock}>
          <div style={h.statIconWrap}><Ic name="briefcase" size={11} color="#FFFFFF" /></div>
          <div style={h.statVal}>12</div>
          <div style={h.statLabel}>servicios hoy</div>
        </div>
        <div style={h.statDiv} />
        <div style={h.statBlock}>
          <div style={{ ...h.statIconWrap, background: "rgba(78,216,150,0.30)" }}><Ic name="wallet" size={11} color="#FFFFFF" /></div>
          <div style={h.statVal}>$5,840</div>
          <div style={h.statLabel}>ganado · MXN</div>
        </div>
        <div style={h.statDiv} />
        <div style={h.statBlock}>
          <div style={{ ...h.statIconWrap, background: "rgba(245,158,11,0.40)" }}>
            <svg width="11" height="11" viewBox="0 0 24 24"><path d="M12 2.5l2.95 6.42 7.05.78-5.28 4.78 1.52 6.92L12 18.27l-6.24 3.13 1.52-6.92L2 9.7l7.05-.78L12 2.5z" fill="#FFFFFF"/></svg>
          </div>
          <div style={h.statVal}>4.8</div>
          <div style={h.statLabel}>rating · 214</div>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// REQUEST CARD
// =====================================================================
function RequestCard({ req }) {
  const isUrgent = req.expireMin < 15;
  return (
    <div style={h.reqCard}>
      {/* Timer banner */}
      <div style={{ ...h.timerBanner, ...(isUrgent ? h.timerBannerUrgent : null) }}>
        <Ic name="timer" size={12} color="#FFFFFF" />
        <span style={h.timerLabel}>EXPIRA EN</span>
        <span style={h.timerVal}>{req.timer}</span>
        <div style={h.timerTrack}>
          <div style={{ ...h.timerFill, width: `${(req.expireMin / 30) * 100}%`, background: isUrgent ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.80)" }} />
        </div>
      </div>

      <div style={h.reqBody}>
        {/* Top: client + amount */}
        <div style={h.reqTopRow}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ ...h.reqAv, background: CLIENT_TONES[req.toneIdx] }}>
              {req.initials}
            </div>
            {req.verified && (
              <div style={h.reqVerify}><Ic name="check" size={8} color="#FFFFFF" stroke={3.5} /></div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={h.reqName}>{req.name}</div>
            <div style={h.reqMeta}>
              <Ic name={req.catIcon} size={10} color="#0A6BCF" />
              <span style={h.reqCat}>{req.cat}</span>
              <span style={h.reqBullet} />
              <span style={h.reqSub}>{req.subCat}</span>
            </div>
          </div>
          <div style={h.reqAmountWrap}>
            <div style={h.reqAmountLabel}>TARIFA</div>
            <div style={h.reqAmount}>${req.price}<span style={h.reqAmountCurr}>MXN</span></div>
          </div>
        </div>

        {/* Distance + time row */}
        <div style={h.reqInfoRow}>
          <div style={h.reqInfo}>
            <Ic name="map-pin" size={12} color="#0A6BCF" />
            <div>
              <div style={h.reqInfoVal}>{req.distance} km</div>
              <div style={h.reqInfoLabel}>{req.colonia}</div>
            </div>
          </div>
          <div style={h.reqInfoDiv} />
          <div style={h.reqInfo}>
            <Ic name="calendar-clock" size={12} color="#0A6BCF" />
            <div>
              <div style={h.reqInfoVal}>{req.day}</div>
              <div style={h.reqInfoLabel}>{req.time}</div>
            </div>
          </div>
          <div style={h.reqInfoDiv} />
          <div style={h.reqInfo}>
            <Ic name="route" size={12} color="#0A6BCF" />
            <div>
              <div style={h.reqInfoVal}>{req.travelMin} min</div>
              <div style={h.reqInfoLabel}>al sitio</div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={h.reqDesc}>
          <span style={h.reqDescIcon}>"</span>
          <span style={h.reqDescText}>{req.desc}</span>
        </div>

        {/* Photo previews */}
        {req.photos && (
          <div style={h.reqPhotos}>
            {req.photos.map((tone, idx) => (
              <div key={idx} style={{ ...h.reqPhoto, background: tone }}>
                <Ic name="image" size={11} color="rgba(255,255,255,0.85)" />
              </div>
            ))}
            <div style={h.reqPhotosCount}>+{req.morePhotos || 0}</div>
          </div>
        )}

        {/* Actions */}
        <div style={h.reqActions}>
          <button style={h.reqDetailBtn}>
            <Ic name="eye" size={13} color="#0A6BCF" style={{ marginRight: 5 }} />
            Ver detalle
          </button>
          <button style={h.reqAcceptBtn}>
            <Ic name="check" size={14} color="#FFFFFF" stroke={2.8} style={{ marginRight: 6 }} />
            <span>Aceptar rápido</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// AGENDA TIMELINE
// =====================================================================
function AgendaTimeline() {
  const items = [
    { time: "10:00", state: "done",    name: "María R.",         cat: "Plomería",      amount: 850,  toneIdx: 0 },
    { time: "13:00", state: "done",    name: "José Luis G.",     cat: "Electricidad",  amount: 1200, toneIdx: 1 },
    { time: "15:00", state: "next",    name: "María Rodríguez",  cat: "Plomería",      amount: 450,  toneIdx: 0, eta: "Próximo · en 1h 12m" },
    { time: "18:00", state: "pending", name: "Pendiente",        cat: "Confirmación cliente", amount: null },
  ];
  return (
    <div style={h.agendaCard}>
      {items.map((it, idx) => {
        const isLast = idx === items.length - 1;
        const stateMap = {
          done:    { color: "#18A66A", bg: "rgba(24,166,106,0.12)", icon: "check",        label: "Completado" },
          next:    { color: "#0A6BCF", bg: "rgba(10,107,207,0.10)", icon: "play",         label: "Próximo" },
          pending: { color: "#9CA3AF", bg: "rgba(14,44,86,0.05)",   icon: "clock",        label: "Esperando" },
        };
        const s = stateMap[it.state];
        return (
          <div key={idx} style={h.agendaItem}>
            <div style={h.agendaTime}>
              <div style={h.agendaTimeText}>{it.time}</div>
              <div style={{ ...h.agendaDot, background: s.color, ...(it.state === "next" ? { boxShadow: "0 0 0 4px rgba(10,107,207,0.20)" } : null) }}>
                {it.state === "done" && <Ic name="check" size={9} color="#FFFFFF" stroke={3.5} />}
                {it.state === "next" && <div style={h.agendaDotInner} />}
              </div>
              {!isLast && <div style={h.agendaLine} />}
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingBottom: 14 }}>
              <div style={h.agendaCardRow}>
                {it.toneIdx !== undefined && it.state !== "pending" && (
                  <div style={{ ...h.agendaAv, background: CLIENT_TONES[it.toneIdx] }}>
                    {it.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={h.agendaName}>{it.name}</div>
                  <div style={h.agendaSub}>
                    <span>{it.cat}</span>
                    {it.amount && (
                      <>
                        <span style={h.reqBullet} />
                        <b style={{ color: "#0E2C56", fontWeight: 700 }}>${it.amount}</b>
                      </>
                    )}
                  </div>
                </div>
                <span style={{ ...h.agendaState, background: s.bg, color: s.color }}>
                  {s.label}
                </span>
              </div>
              {it.eta && (
                <div style={h.agendaEta}>
                  <Ic name="bell" size={10} color="#0A6BCF" />
                  <span>{it.eta}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =====================================================================
// EARNINGS CARD
// =====================================================================
function EarningsCard() {
  const days = [22, 38, 28, 60, 45, 78, 52]; // visual percentages
  const labels = ["L", "M", "M", "J", "V", "S", "D"];
  return (
    <div style={h.earnCard}>
      <div style={h.earnHead}>
        <div>
          <div style={h.earnLabel}>TUS GANANCIAS</div>
          <div style={h.earnSubLabel}>Resumen del mes</div>
        </div>
        <a href="#" style={h.earnLink}>
          Ver Cartera
          <Ic name="arrow-right" size={11} color="#0A6BCF" style={{ marginLeft: 3 }} />
        </a>
      </div>
      <div style={h.earnKpiRow}>
        <div style={h.earnKpiNow}>
          <div style={h.earnKpiNowLabel}>HOY</div>
          <div style={h.earnKpiNowVal}>$5,840</div>
          <div style={h.earnKpiNowDelta}>
            <Ic name="trending-up" size={10} color="#0F8A56" />
            <span>+12% vs ayer</span>
          </div>
        </div>
        <div style={h.earnKpiSide}>
          <div style={h.earnKpiRow2}>
            <span style={h.earnKpiSideLabel}>Semana</span>
            <span style={h.earnKpiSideVal}>$24,320</span>
          </div>
          <div style={h.earnKpiRow2}>
            <span style={h.earnKpiSideLabel}>Mes</span>
            <span style={h.earnKpiSideVal}>$87,450</span>
          </div>
          <div style={h.earnKpiRow2}>
            <span style={h.earnKpiSideLabel}>Por cobrar</span>
            <span style={{ ...h.earnKpiSideVal, color: "#B45309" }}>$2,050</span>
          </div>
        </div>
      </div>
      {/* Mini chart */}
      <div style={h.earnChart}>
        {days.map((d, idx) => (
          <div key={idx} style={h.earnChartCol}>
            <div style={{
              ...h.earnChartBar,
              height: `${d}%`,
              background: idx === days.length - 1 ? "linear-gradient(180deg,#0A6BCF,#18C1FF)" : "rgba(10,107,207,0.18)",
            }} />
            <div style={{ ...h.earnChartLabel, color: idx === days.length - 1 ? "#0A6BCF" : "#9CA3AF", fontWeight: idx === days.length - 1 ? 700 : 500 }}>
              {labels[idx]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================================
// TIP OF THE DAY
// =====================================================================
function TipCard() {
  return (
    <div style={h.tipCard}>
      <div style={h.tipIconWrap}>
        <Ic name="lightbulb" size={18} color="#FFFFFF" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={h.tipLabel}>TIP DEL DÍA</div>
        <div style={h.tipText}>
          Responder en menos de <b style={{ color: "#0E2C56", fontWeight: 800 }}>5 minutos</b> aumenta tu tasa de aceptación en un{" "}
          <span style={h.tipHighlight}>+40%</span>.
        </div>
      </div>
      <Ic name="chevron-right" size={15} color="#B45309" />
    </div>
  );
}

// =====================================================================
// BOTTOM TAB BAR — Técnico
// =====================================================================
function TechTabs({ inboxBadge = 3 }) {
  const tabs = [
    { id: "inbox",    icon: "inbox",         label: "Inbox",    active: true, badge: inboxBadge },
    { id: "agenda",   icon: "calendar-days", label: "Agenda" },
    { id: "wallet",   icon: "wallet",        label: "Cartera" },
    { id: "messages", icon: "message-circle",label: "Mensajes" },
    { id: "profile",  icon: "user",          label: "Perfil" },
  ];
  return (
    <div style={h.tabbar}>
      {tabs.map(t => (
        <div key={t.id} style={h.tabItem}>
          <div style={{ position: "relative" }}>
            <Ic name={t.icon} size={22} color={t.active ? "#0A6BCF" : "#9CA3AF"} stroke={t.active ? 2.2 : 1.8} />
            {t.badge && (
              <span style={h.tabBadge}>{t.badge}</span>
            )}
          </div>
          <span style={{ ...h.tabLabel, color: t.active ? "#0A6BCF" : "#9CA3AF", fontWeight: t.active ? 700 : 500 }}>
            {t.label}
          </span>
          {t.active && <div style={h.tabActiveDot} />}
        </div>
      ))}
    </div>
  );
}

// =====================================================================
// SCREENS
// =====================================================================
function HomeScreen() {
  const requests = [
    {
      id: 1, name: "María Rodríguez", initials: "MR", verified: true, toneIdx: 0,
      cat: "Plomería", catIcon: "wrench", subCat: "Fugas",
      distance: "2.3", colonia: "Providencia, Zapopan",
      day: "Hoy", time: "3:00 - 7:00 PM",
      travelMin: 8, price: 450,
      desc: "Tengo una fuga debajo del lavabo del baño desde ayer. El agua escurre lento pero ya está mojando todo el mueble.",
      photos: ["linear-gradient(135deg,#0A6BCF,#0894EA)", "linear-gradient(135deg,#B45309,#F59E0B)"], morePhotos: 1,
      timer: "28:42", expireMin: 28,
    },
    {
      id: 2, name: "Carlos Mendoza", initials: "CM", verified: true, toneIdx: 1,
      cat: "Electricidad", catIcon: "zap", subCat: "Instalación de lámparas",
      distance: "1.8", colonia: "Lafayette, Guadalajara",
      day: "Mañana", time: "10:00 AM",
      travelMin: 6, price: 350,
      desc: "Necesito instalar 3 lámparas LED tipo plafón en la sala. Ya tengo las lámparas, solo falta el cableado y montaje.",
      timer: "12:03", expireMin: 12,
    },
    {
      id: 3, name: "Lupita Pérez", initials: "LP", verified: true, toneIdx: 2,
      cat: "Plomería", catIcon: "wrench", subCat: "Calentadores",
      distance: "3.1", colonia: "Chapalita, Guadalajara",
      day: "Hoy", time: "6:00 PM",
      travelMin: 11, price: 550,
      desc: "Mi calentador de paso no enciende. Hace ruido pero no calienta el agua. Marca Calorex de hace 5 años.",
      timer: "26:15", expireMin: 26,
    },
  ];

  return (
    <div style={h.wrap}>
      <TechHeader available={true} />

      <div style={h.body}>
        {/* Requests */}
        <div style={h.sectionHeadRow}>
          <div style={h.sectionTitleWrap}>
            <h2 style={h.sectionTitle}>Solicitudes nuevas</h2>
            <span style={h.sectionBadge}>3</span>
          </div>
          <a href="#" style={h.sectionLink}>
            Filtrar
            <Ic name="sliders-horizontal" size={11} color="#0A6BCF" style={{ marginLeft: 3 }} />
          </a>
        </div>

        <div style={h.reqStack}>
          {requests.map(r => <RequestCard key={r.id} req={r} />)}
        </div>

        {/* Agenda */}
        <div style={h.sectionHeadRow}>
          <div style={h.sectionTitleWrap}>
            <h2 style={h.sectionTitle}>Tu agenda de hoy</h2>
            <span style={h.sectionBadgeNeutral}>4</span>
          </div>
          <a href="#" style={h.sectionLink}>
            Ver completa
            <Ic name="arrow-right" size={11} color="#0A6BCF" style={{ marginLeft: 3 }} />
          </a>
        </div>

        <AgendaTimeline />

        {/* Earnings */}
        <EarningsCard />

        {/* Tip */}
        <TipCard />

        {/* Footer note */}
        <div style={h.footerNote}>
          <Ic name="shield-check" size={11} color="#0F8A56" />
          <span>Cuenta verificada · KYC aprobado · Comisión 12% por servicio</span>
        </div>
      </div>

      <TechTabs />
    </div>
  );
}

function HomeEmptyScreen() {
  return (
    <div style={h.wrap}>
      <TechHeader available={true} />

      <div style={h.body}>
        {/* Empty requests */}
        <div style={h.sectionHeadRow}>
          <div style={h.sectionTitleWrap}>
            <h2 style={h.sectionTitle}>Solicitudes nuevas</h2>
            <span style={h.sectionBadgeNeutral}>0</span>
          </div>
        </div>

        <div style={h.emptyCard}>
          <RadarIllu />
          <div style={h.emptyTitle}>Sin solicitudes nuevas por ahora</div>
          <div style={h.emptySub}>
            Estás <b style={{ color: "#0E2C56", fontWeight: 700 }}>visible</b> en Providencia, Lafayette y Chapalita. Te notificamos en cuanto llegue una.
          </div>

          <div style={h.emptyTipsRow}>
            <div style={h.emptyTipChip}>
              <Ic name="sparkles" size={11} color="#0A6BCF" />
              <span>Tips para destacar</span>
            </div>
            <div style={h.emptyTipChip}>
              <Ic name="map-pin" size={11} color="#0A6BCF" />
              <span>Ampliar zona</span>
            </div>
            <div style={h.emptyTipChip}>
              <Ic name="tag" size={11} color="#0A6BCF" />
              <span>Revisar tarifas</span>
            </div>
          </div>

          <div style={h.lastRequestRow}>
            <Ic name="clock" size={11} color="#9CA3AF" />
            <span>Tu última solicitud llegó hace <b style={{ color: "#0E2C56", fontWeight: 700 }}>1 h 12 min</b></span>
          </div>
        </div>

        {/* Agenda still shows */}
        <div style={h.sectionHeadRow}>
          <div style={h.sectionTitleWrap}>
            <h2 style={h.sectionTitle}>Tu agenda de hoy</h2>
            <span style={h.sectionBadgeNeutral}>4</span>
          </div>
          <a href="#" style={h.sectionLink}>
            Ver completa
            <Ic name="arrow-right" size={11} color="#0A6BCF" style={{ marginLeft: 3 }} />
          </a>
        </div>

        <AgendaTimeline />

        <EarningsCard />
        <TipCard />
      </div>

      <TechTabs inboxBadge={0} />
    </div>
  );
}

function RadarIllu() {
  return (
    <svg viewBox="0 0 200 130" width="170" height="111" style={{ display: "block", margin: "0 auto" }}>
      <defs>
        <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="rgba(10,107,207,0.30)" />
          <stop offset="1" stopColor="rgba(10,107,207,0.04)" />
        </radialGradient>
      </defs>
      {/* Radar rings */}
      <circle cx="100" cy="75" r="60" fill="url(#radarGrad)" />
      <circle cx="100" cy="75" r="55" fill="none" stroke="rgba(10,107,207,0.30)" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="100" cy="75" r="38" fill="none" stroke="rgba(10,107,207,0.25)" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="100" cy="75" r="20" fill="none" stroke="rgba(10,107,207,0.20)" strokeWidth="1" strokeDasharray="3 3" />
      {/* Sweep wedge */}
      <path d="M 100 75 L 152 35 A 60 60 0 0 1 152 75 Z" fill="rgba(24,193,255,0.30)" />
      {/* Tech pin (center) */}
      <g transform="translate(100, 75)">
        <circle r="14" fill="#FFFFFF" stroke="#0A6BCF" strokeWidth="3" />
        <path d="M -4 1 L -4 -2 L 0 -5 L 4 -2 L 4 1 Z" fill="#0A6BCF" />
      </g>
      {/* Sparkles around */}
      <g fill="#F59E0B" opacity="0.85">
        <circle cx="20"  cy="20"  r="3" />
        <circle cx="180" cy="30"  r="2.5" />
        <circle cx="170" cy="110" r="2.5" />
        <circle cx="30"  cy="115" r="3" />
      </g>
    </svg>
  );
}

function HomeOffScreen() {
  return (
    <div style={h.wrap}>
      <TechHeader available={false} />

      <div style={h.body}>
        {/* Off banner */}
        <div style={h.offBanner}>
          <div style={h.offIconWrap}>
            <Ic name="moon" size={20} color="#FFFFFF" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={h.offTitle}>Estás en pausa</div>
            <div style={h.offSub}>
              No estás recibiendo nuevas solicitudes. Reactiva con el toggle del header cuando estés listo.
            </div>
          </div>
          <button style={h.offCta}>Reactivar</button>
        </div>

        {/* Auto-resume scheduler */}
        <div style={h.schedCard}>
          <div style={h.schedHead}>
            <Ic name="alarm-clock" size={14} color="#0A6BCF" />
            <span style={h.schedLabel}>REACTIVAR AUTOMÁTICAMENTE</span>
          </div>
          <div style={h.schedOptionsRow}>
            <div style={h.schedOpt}>
              <span>En 1 h</span>
            </div>
            <div style={{ ...h.schedOpt, ...h.schedOptSel }}>
              <span>Mañana 8 AM</span>
              <Ic name="check" size={11} color="#FFFFFF" stroke={3} />
            </div>
            <div style={h.schedOpt}>
              <span>Lunes</span>
            </div>
            <div style={h.schedOpt}>
              <span>Manual</span>
            </div>
          </div>
        </div>

        {/* Still see today */}
        <div style={h.sectionHeadRow}>
          <div style={h.sectionTitleWrap}>
            <h2 style={h.sectionTitle}>Servicios ya agendados</h2>
            <span style={h.sectionBadgeNeutral}>2</span>
          </div>
        </div>
        <div style={h.acceptedNote}>
          <Ic name="info" size={11} color="#0A6BCF" />
          <span>Los servicios que ya aceptaste <b style={{ color: "#0E2C56", fontWeight: 700 }}>se mantienen</b>. Solo pausamos las nuevas solicitudes.</span>
        </div>
        <AgendaTimeline />

        <EarningsCard />
      </div>

      <TechTabs inboxBadge={0} />
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
      <DCSection id="home" title="Home del Técnico · Inbox" subtitle="3 estados · cuenta PRO · Tumantenimiento">
        <DCArtboard id="default" label="01 · Default · 3 solicitudes" width={438} height={892}>
          <PhoneFrame><HomeScreen /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="empty" label="02 · Sin solicitudes" width={438} height={892}>
          <PhoneFrame><HomeEmptyScreen /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="off" label="03 · No disponible (pausa)" width={438} height={892}>
          <PhoneFrame><HomeOffScreen /></PhoneFrame>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// =====================================================================
// STYLES
// =====================================================================
const h = {
  wrap: { width: "100%", height: "100%", background: "#F8FBFF", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" },
  body: { flex: 1, overflowY: "auto", padding: "16px 16px 110px" },

  // ===== Header =====
  header: { position: "relative", padding: "50px 18px 18px", background: "linear-gradient(165deg, #0E2C56 0%, #0A6BCF 60%, #0894EA 110%)", color: "#FFFFFF", overflow: "hidden" },
  headerOff: { background: "linear-gradient(165deg, #2A3242 0%, #4B5563 100%)" },
  headerOverlay: { position: "absolute", inset: 0, background: "radial-gradient(circle at 85% 0%, rgba(24,193,255,0.40), transparent 55%)", pointerEvents: "none" },
  headerGlow: { position: "absolute", left: -60, bottom: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,158,11,0.20), transparent 70%)", pointerEvents: "none" },

  greetRow: { position: "relative", display: "flex", alignItems: "center" },
  greetAv: { position: "relative", width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #F59E0B, #FBBF24)", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em", border: "2px solid rgba(255,255,255,0.25)", flexShrink: 0 },
  greetVerify: { position: "absolute", right: -2, bottom: -2, width: 16, height: 16, borderRadius: "50%", background: "#18A66A", border: "2px solid #0A6BCF", display: "grid", placeItems: "center" },
  greetSmall: { fontSize: 11, color: "rgba(255,255,255,0.75)", letterSpacing: ".04em", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
  greetName: { fontFamily: "'Manrope', sans-serif", fontSize: 21, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 1 },
  greetSub: { position: "relative", fontSize: 12, color: "rgba(255,255,255,0.78)", marginTop: 10, lineHeight: 1.5 },

  availPill: { position: "relative", display: "flex", alignItems: "center", gap: 8, padding: "6px 8px 6px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, backdropFilter: "blur(6px)", cursor: "pointer", flexShrink: 0 },
  availOn: { background: "rgba(24,166,106,0.20)", border: "1px solid rgba(78,216,150,0.50)" },
  availOff: { background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)" },
  availDot: { width: 8, height: 8, borderRadius: "50%", boxShadow: "0 0 0 3px rgba(78,216,150,0.30)" },
  availLabel: { fontSize: 11.5, fontWeight: 700, color: "#FFFFFF" },
  availSub: { fontSize: 9, color: "rgba(255,255,255,0.65)", fontWeight: 500 },
  toggleTrack: { position: "relative", width: 32, height: 18, borderRadius: 999, flexShrink: 0 },
  toggleKnob: { position: "absolute", top: 2, width: 14, height: 14, borderRadius: "50%", background: "#FFFFFF", transition: "left 0.15s" },

  // ===== Stats =====
  statsRow: { position: "relative", display: "flex", marginTop: 14, padding: "10px", background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, backdropFilter: "blur(6px)" },
  statBlock: { flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start" },
  statIconWrap: { width: 22, height: 22, borderRadius: 6, background: "rgba(24,193,255,0.30)", display: "grid", placeItems: "center", marginBottom: 6 },
  statVal: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: "-0.01em", lineHeight: 1 },
  statLabel: { fontSize: 9, color: "rgba(255,255,255,0.70)", marginTop: 3, textTransform: "uppercase", letterSpacing: ".06em", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
  statDiv: { width: 1, background: "rgba(255,255,255,0.15)", margin: "0 12px" },

  // ===== Section header =====
  sectionHeadRow: { display: "flex", alignItems: "center", justifyContent: "space-between", margin: "18px 0 10px", padding: "0 2px" },
  sectionTitleWrap: { display: "flex", alignItems: "center", gap: 8 },
  sectionTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 17, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em", margin: 0 },
  sectionBadge: { padding: "2px 8px", background: "#DC2626", color: "#FFFFFF", borderRadius: 999, fontSize: 10.5, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", boxShadow: "0 4px 10px rgba(220,38,38,0.30)" },
  sectionBadgeNeutral: { padding: "2px 8px", background: "rgba(14,44,86,0.06)", color: "#6B7280", borderRadius: 999, fontSize: 10.5, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  sectionLink: { color: "#0A6BCF", textDecoration: "none", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center" },

  // ===== Request card =====
  reqStack: { display: "flex", flexDirection: "column", gap: 12 },
  reqCard: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 14px rgba(14,44,86,0.06)" },

  timerBanner: { display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "linear-gradient(135deg,#F59E0B,#FBBF24)", color: "#FFFFFF" },
  timerBannerUrgent: { background: "linear-gradient(135deg,#DC2626,#EA580C)", animation: "h-pulse 1.8s infinite" },
  timerLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".08em", fontWeight: 700, opacity: 0.9 },
  timerVal: { fontFamily: "'Manrope', sans-serif", fontSize: 14, fontWeight: 800, letterSpacing: ".02em" },
  timerTrack: { flex: 1, marginLeft: 8, height: 4, background: "rgba(255,255,255,0.25)", borderRadius: 999, overflow: "hidden" },
  timerFill: { height: "100%", borderRadius: 999 },

  reqBody: { padding: "14px 14px 12px" },
  reqTopRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
  reqAv: { width: 44, height: 44, borderRadius: "50%", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em" },
  reqVerify: { position: "absolute", right: -2, bottom: -2, width: 14, height: 14, borderRadius: "50%", background: "#18A66A", border: "2px solid #FFFFFF", display: "grid", placeItems: "center" },
  reqName: { fontSize: 14, fontWeight: 700, color: "#0E2C56" },
  reqMeta: { display: "flex", alignItems: "center", gap: 5, marginTop: 3, fontSize: 11.5, color: "#6B7280" },
  reqCat: { color: "#0A6BCF", fontWeight: 700 },
  reqBullet: { width: 2, height: 2, borderRadius: "50%", background: "#9CA3AF", margin: "0 2px" },
  reqSub: { color: "#6B7280", fontWeight: 500 },

  reqAmountWrap: { textAlign: "right" },
  reqAmountLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#9CA3AF", letterSpacing: ".08em", fontWeight: 700 },
  reqAmount: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 19, color: "#0E2C56", letterSpacing: "-0.02em", lineHeight: 1, marginTop: 2 },
  reqAmountCurr: { fontSize: 9, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, marginLeft: 3 },

  reqInfoRow: { display: "flex", alignItems: "stretch", padding: "10px 0", background: "#F8FBFF", borderRadius: 10, marginBottom: 10 },
  reqInfo: { flex: 1, display: "flex", alignItems: "center", gap: 6, padding: "0 8px" },
  reqInfoVal: { fontSize: 11.5, fontWeight: 700, color: "#0E2C56", lineHeight: 1.2 },
  reqInfoLabel: { fontSize: 9.5, color: "#9CA3AF", marginTop: 1 },
  reqInfoDiv: { width: 1, background: "#E1E8F0" },

  reqDesc: { display: "flex", gap: 6, padding: "10px 12px", background: "rgba(10,107,207,0.04)", border: "1px solid rgba(10,107,207,0.15)", borderRadius: 10, marginBottom: 10 },
  reqDescIcon: { fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: "#0A6BCF", lineHeight: 0.5, flexShrink: 0 },
  reqDescText: { fontSize: 12, color: "#0E2C56", lineHeight: 1.45, fontStyle: "italic", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },

  reqPhotos: { display: "flex", gap: 5, marginBottom: 10 },
  reqPhoto: { width: 44, height: 44, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0 },
  reqPhotosCount: { width: 44, height: 44, borderRadius: 8, background: "#EEF3F8", border: "1px dashed #E1E8F0", display: "grid", placeItems: "center", color: "#6B7280", fontSize: 11.5, fontWeight: 700, flexShrink: 0 },

  reqActions: { display: "flex", gap: 8 },
  reqDetailBtn: { flex: 1, padding: "11px", background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #0A6BCF", borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  reqAcceptBtn: { flex: 2, padding: "11px", background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(10,107,207,0.30)" },

  // ===== Agenda =====
  agendaCard: { padding: "14px 14px 4px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16 },
  agendaItem: { display: "flex", gap: 12 },
  agendaTime: { display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 50 },
  agendaTimeText: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: "#0E2C56", letterSpacing: ".02em" },
  agendaDot: { width: 18, height: 18, borderRadius: "50%", display: "grid", placeItems: "center", marginTop: 4 },
  agendaDotInner: { width: 6, height: 6, borderRadius: "50%", background: "#FFFFFF" },
  agendaLine: { flex: 1, width: 2, background: "#E1E8F0", borderRadius: 1, marginTop: 4 },
  agendaCardRow: { display: "flex", alignItems: "center", gap: 10 },
  agendaAv: { width: 30, height: 30, borderRadius: "50%", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 10.5, flexShrink: 0 },
  agendaName: { fontSize: 12.5, fontWeight: 700, color: "#0E2C56" },
  agendaSub: { display: "flex", alignItems: "center", gap: 4, marginTop: 2, fontSize: 11, color: "#6B7280" },
  agendaState: { padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: ".04em", flexShrink: 0 },
  agendaEta: { display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, padding: "4px 9px", background: "rgba(10,107,207,0.08)", color: "#0A6BCF", borderRadius: 999, fontSize: 10.5, fontWeight: 700 },

  // ===== Earnings =====
  earnCard: { padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, marginTop: 16 },
  earnHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  earnLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF", letterSpacing: ".1em", fontWeight: 700 },
  earnSubLabel: { fontSize: 13, color: "#0E2C56", fontWeight: 700, marginTop: 2 },
  earnLink: { color: "#0A6BCF", textDecoration: "none", fontSize: 11.5, fontWeight: 700, display: "inline-flex", alignItems: "center" },

  earnKpiRow: { display: "flex", gap: 14, alignItems: "stretch" },
  earnKpiNow: { padding: "12px 14px", background: "linear-gradient(135deg, rgba(10,107,207,0.06), rgba(24,193,255,0.04))", border: "1px solid rgba(10,107,207,0.20)", borderRadius: 12, flex: 1 },
  earnKpiNowLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#0A6BCF", letterSpacing: ".1em", fontWeight: 700 },
  earnKpiNowVal: { fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: "#0A6BCF", letterSpacing: "-0.02em", marginTop: 4 },
  earnKpiNowDelta: { display: "flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 10.5, color: "#0F8A56", fontWeight: 700 },

  earnKpiSide: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 6 },
  earnKpiRow2: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 8 },
  earnKpiSideLabel: { fontSize: 10.5, color: "#6B7280", fontWeight: 500 },
  earnKpiSideVal: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 12.5, color: "#0E2C56" },

  earnChart: { display: "flex", alignItems: "flex-end", gap: 8, height: 70, marginTop: 14, paddingTop: 6, borderTop: "1px solid #F0F4F9" },
  earnChartCol: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", gap: 4 },
  earnChartBar: { width: "100%", borderRadius: "4px 4px 1px 1px", minHeight: 4 },
  earnChartLabel: { fontSize: 9.5, fontFamily: "'JetBrains Mono', monospace" },

  // ===== Tip =====
  tipCard: { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "linear-gradient(135deg, rgba(245,158,11,0.10), rgba(251,191,36,0.05))", border: "1.5px solid rgba(245,158,11,0.30)", borderRadius: 16, marginTop: 14 },
  tipIconWrap: { width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#F59E0B,#FBBF24)", display: "grid", placeItems: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(245,158,11,0.30)" },
  tipLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#B45309", letterSpacing: ".1em", fontWeight: 700 },
  tipText: { fontSize: 12, color: "#0E2C56", marginTop: 3, lineHeight: 1.5 },
  tipHighlight: { padding: "1px 7px", background: "#18A66A", color: "#FFFFFF", borderRadius: 999, fontSize: 11, fontWeight: 800, fontFamily: "'Manrope', sans-serif" },

  footerNote: { display: "flex", alignItems: "center", gap: 6, marginTop: 16, padding: "10px 12px", background: "rgba(24,166,106,0.06)", border: "1px dashed rgba(24,166,106,0.30)", borderRadius: 10, fontSize: 11, color: "#6B7280", lineHeight: 1.4 },

  // ===== Empty state =====
  emptyCard: { padding: "22px 18px", background: "#FFFFFF", border: "1px dashed #C8D4E0", borderRadius: 16, textAlign: "center" },
  emptyTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em", marginTop: 14 },
  emptySub: { fontSize: 12.5, color: "#6B7280", marginTop: 6, lineHeight: 1.5, maxWidth: 300, marginLeft: "auto", marginRight: "auto" },
  emptyTipsRow: { display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 6, marginTop: 16 },
  emptyTipChip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 11px", background: "rgba(10,107,207,0.08)", color: "#0A6BCF", borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: "pointer" },
  lastRequestRow: { display: "inline-flex", alignItems: "center", gap: 5, marginTop: 14, padding: "5px 11px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 999, fontSize: 11, color: "#6B7280" },

  // ===== Off state =====
  offBanner: { display: "flex", alignItems: "center", gap: 12, padding: "14px", background: "linear-gradient(135deg, #4B5563 0%, #6B7280 100%)", borderRadius: 16, color: "#FFFFFF", marginBottom: 12, boxShadow: "0 6px 16px rgba(75,85,99,0.30)" },
  offIconWrap: { width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.18)", display: "grid", placeItems: "center", flexShrink: 0 },
  offTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em" },
  offSub: { fontSize: 11.5, color: "rgba(255,255,255,0.85)", marginTop: 3, lineHeight: 1.4 },
  offCta: { padding: "8px 14px", background: "#FFFFFF", color: "#0E2C56", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 },

  schedCard: { padding: "12px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, marginBottom: 4 },
  schedHead: { display: "flex", alignItems: "center", gap: 6, marginBottom: 10 },
  schedLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#0A6BCF", letterSpacing: ".08em", fontWeight: 700 },
  schedOptionsRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  schedOpt: { display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 999, background: "#F8FBFF", border: "1.5px solid #E1E8F0", color: "#6B7280", fontSize: 12, fontWeight: 600, cursor: "pointer" },
  schedOptSel: { background: "#0A6BCF", borderColor: "#0A6BCF", color: "#FFFFFF", boxShadow: "0 4px 10px rgba(10,107,207,0.30)" },

  acceptedNote: { display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "rgba(10,107,207,0.05)", border: "1px solid rgba(10,107,207,0.20)", borderRadius: 10, fontSize: 11, color: "#6B7280", lineHeight: 1.5, marginBottom: 10 },

  // ===== Tabbar =====
  tabbar: { position: "absolute", left: 0, right: 0, bottom: 0, height: 82, background: "rgba(255,255,255,0.96)", borderTop: "1px solid #E1E8F0", display: "flex", justifyContent: "space-around", alignItems: "flex-start", padding: "10px 4px 24px", backdropFilter: "blur(8px)", zIndex: 5 },
  tabItem: { position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1, padding: "4px 0" },
  tabLabel: { fontSize: 10, marginTop: 1 },
  tabBadge: { position: "absolute", top: -4, right: -10, minWidth: 16, height: 16, padding: "0 4px", background: "#DC2626", color: "#FFFFFF", borderRadius: 999, fontSize: 9.5, fontWeight: 700, fontFamily: "'Manrope', sans-serif", display: "grid", placeItems: "center", border: "1.5px solid #FFFFFF" },
  tabActiveDot: { position: "absolute", bottom: 2, width: 4, height: 4, borderRadius: "50%", background: "#0A6BCF" },
};

const kf = document.createElement("style");
kf.textContent = `
  @keyframes h-pulse { 50% { opacity: 0.85; } }
`;
document.head.appendChild(kf);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
