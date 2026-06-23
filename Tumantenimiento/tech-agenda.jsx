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
  "linear-gradient(135deg,#0884B0,#18C1FF)",
  "linear-gradient(135deg,#B45309,#F59E0B)",
];

// =====================================================================
// HEADER + TABS
// =====================================================================
function AgendaHeader() {
  return (
    <div style={a.header}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={a.headerTitle}>Mi agenda</div>
        <div style={a.headerSub}>
          <span style={a.headerLiveDot} />
          <b style={{ color: "#0E2C56", fontWeight: 700 }}>4 servicios</b>
          <span style={a.bullet} />
          <span>hoy, 19 mayo</span>
        </div>
      </div>
      <button style={a.iconBtn}>
        <Ic name="filter" size={16} color="#0E2C56" />
      </button>
      <button style={a.iconBtnPrimary}>
        <Ic name="settings-2" size={16} color="#FFFFFF" />
      </button>
    </div>
  );
}

function Tabs({ active = "upcoming" }) {
  const tabs = [
    { id: "upcoming", label: "Próximos", icon: "list-todo", count: 5 },
    { id: "calendar", label: "Calendario", icon: "calendar-days" },
    { id: "history",  label: "Historial",  icon: "clock", count: 26 },
  ];
  return (
    <div style={a.tabs}>
      {tabs.map(t => {
        const isActive = t.id === active;
        return (
          <div key={t.id} style={{ ...a.tab, ...(isActive ? a.tabActive : null) }}>
            <Ic name={t.icon} size={13} color={isActive ? "#0A6BCF" : "#9CA3AF"} stroke={2.2} />
            <span>{t.label}</span>
            {t.count && (
              <span style={{
                ...a.tabCount,
                background: isActive ? "#0A6BCF" : "rgba(14,44,86,0.06)",
                color: isActive ? "#FFFFFF" : "#6B7280",
              }}>{t.count}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// =====================================================================
// AVAILABILITY TOGGLE CARD
// =====================================================================
function AvailabilityCard({ available = true }) {
  return (
    <div style={{ ...a.availCard, ...(available ? a.availCardOn : a.availCardOff) }}>
      <div style={a.availLeftIcon}>
        <Ic name={available ? "zap" : "moon"} size={18} color="#FFFFFF" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={a.availTitle}>
          {available ? "Disponible" : "No disponible"}
          <span style={{ ...a.availStatusChip, background: available ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.10)" }}>
            <span style={{ ...a.availStatusDot, background: available ? "#4ED896" : "rgba(255,255,255,0.5)" }} />
            <span>{available ? "Recibes solicitudes" : "Pausado"}</span>
          </span>
        </div>
        <div style={a.availSub}>
          {available
            ? <>Activo desde las <b style={{ color: "#FFFFFF", fontWeight: 800 }}>7:00 AM</b> · 6h 14m corridas</>
            : <>Reactivas automáticamente <b style={{ color: "#FFFFFF", fontWeight: 800 }}>mañana 8 AM</b></>
          }
        </div>
      </div>
      <div style={{ ...a.availToggle, background: available ? "rgba(78,216,150,0.40)" : "rgba(255,255,255,0.20)" }}>
        <div style={{ ...a.availToggleKnob, left: available ? 22 : 2 }} />
      </div>
    </div>
  );
}

// =====================================================================
// SERVICE ROW
// =====================================================================
function ServiceRow({ svc, isNext }) {
  const stateMap = {
    completed: { color: "#0F8A56", bg: "rgba(24,166,106,0.12)", icon: "check",          label: "Completado" },
    accepted:  { color: "#0A6BCF", bg: "rgba(10,107,207,0.10)", icon: "calendar-check", label: "Aceptado" },
    enroute:   { color: "#B45309", bg: "rgba(245,158,11,0.14)", icon: "truck",          label: "En camino" },
    onsite:    { color: "#0A6BCF", bg: "rgba(10,107,207,0.10)", icon: "map-pin",        label: "En sitio" },
  };
  const s = stateMap[svc.status];
  return (
    <div style={{
      ...a.svcRow,
      ...(isNext ? a.svcRowNext : null),
    }}>
      <div style={a.svcTime}>
        <div style={a.svcTimeBig}>{svc.time}</div>
        <div style={a.svcTimeMeridian}>{svc.meridian}</div>
        {svc.duration && (
          <div style={a.svcDuration}>
            <div style={a.svcDurationLine} />
            <span>{svc.duration}</span>
          </div>
        )}
      </div>

      <div style={a.svcCard}>
        {isNext && <div style={a.svcNextRibbon}>PRÓXIMO</div>}
        <div style={a.svcTopRow}>
          <div style={{ ...a.svcAv, background: CLIENT_TONES[svc.tone] }}>
            {svc.initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={a.svcName}>{svc.name}</div>
            <div style={a.svcMeta}>
              <Ic name={svc.catIcon} size={10} color="#0A6BCF" />
              <span style={a.svcCat}>{svc.cat}</span>
              <span style={a.bullet} />
              <span style={a.svcId}>{svc.id}</span>
            </div>
          </div>
          <span style={{ ...a.svcStateChip, background: s.bg, color: s.color }}>
            <Ic name={s.icon} size={9} color={s.color} stroke={2.4} />
            <span>{s.label}</span>
          </span>
        </div>

        <div style={a.svcBottomRow}>
          <div style={a.svcInfoChip}>
            <Ic name="map-pin" size={10} color="#6B7280" />
            <span>{svc.distance} km</span>
          </div>
          <span style={a.bullet} />
          <span style={a.svcAddr}>{svc.colonia}</span>
          <span style={a.svcSpacer} />
          <span style={a.svcAmount}>${svc.amount.toLocaleString()}</span>
          <Ic name="chevron-right" size={13} color="#9CA3AF" style={{ marginLeft: 4 }} />
        </div>

        {isNext && svc.eta && (
          <div style={a.svcEtaRow}>
            <Ic name="bell" size={10} color="#0A6BCF" />
            <span><b style={{ color: "#0E2C56", fontWeight: 700 }}>{svc.eta}</b> · Te avisaremos cuando debas salir</span>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================================
// SECTION HEAD
// =====================================================================
function DaySectionHead({ label, dateLabel, count, money }) {
  return (
    <div style={a.daySection}>
      <div style={a.dayLeft}>
        <div style={a.dayLabel}>{label}</div>
        <div style={a.dayDate}>{dateLabel}</div>
      </div>
      <div style={a.dayRight}>
        <span style={a.dayCount}>{count} {count === 1 ? "servicio" : "servicios"}</span>
        {money && <span style={a.dayMoney}>${money.toLocaleString()}</span>}
      </div>
    </div>
  );
}

// =====================================================================
// SCREEN 01 — UPCOMING (DEFAULT)
// =====================================================================
function UpcomingScreen() {
  const today = [
    { time: "10:00", meridian: "AM", duration: "1h 25m", initials: "MR", tone: 0, name: "María Ramírez",     cat: "Plomería",     catIcon: "wrench",        id: "#SVC-2840", distance: "2.8", colonia: "Providencia", amount: 850,  status: "completed" },
    { time: "1:00",  meridian: "PM", duration: "1h 50m", initials: "JL", tone: 1, name: "José Luis G.",       cat: "Electricidad", catIcon: "zap",           id: "#SVC-2846", distance: "3.4", colonia: "Lafayette",   amount: 1200, status: "completed" },
    { time: "3:00",  meridian: "PM", duration: "~2h",    initials: "MR", tone: 0, name: "María Rodríguez",    cat: "Plomería",     catIcon: "wrench",        id: "#SVC-2851", distance: "2.3", colonia: "Providencia", amount: 450,  status: "accepted", eta: "Sales en 1h 12m" },
    { time: "6:00",  meridian: "PM", duration: "~1h",    initials: "CS", tone: 2, name: "Carmen Solís",       cat: "Cristales",    catIcon: "square",        id: "#SVC-2855", distance: "4.1", colonia: "Chapalita",   amount: 980,  status: "accepted" },
  ];
  const tomorrow = [
    { time: "9:00",  meridian: "AM", duration: "~1h 30m", initials: "CM", tone: 4, name: "Carlos Mendoza",  cat: "Electricidad", catIcon: "zap",  id: "#SVC-2862", distance: "1.8", colonia: "Lafayette",   amount: 350,  status: "accepted" },
    { time: "12:00", meridian: "PM", duration: "~2h",     initials: "LP", tone: 3, name: "Lupita Pérez",    cat: "Plomería",     catIcon: "wrench", id: "#SVC-2863", distance: "3.1", colonia: "Chapalita",   amount: 550,  status: "accepted" },
  ];

  return (
    <div style={a.wrap}>
      <AgendaHeader />
      <Tabs active="upcoming" />

      <div style={a.body}>
        <AvailabilityCard available={true} />

        {/* Day stats */}
        <div style={a.dayKpiRow}>
          <div style={a.dayKpiCard}>
            <div style={a.dayKpiIcon}>
              <Ic name="check" size={11} color="#0F8A56" stroke={2.6} />
            </div>
            <div>
              <div style={a.dayKpiVal}>2</div>
              <div style={a.dayKpiLabel}>completados</div>
            </div>
          </div>
          <div style={a.dayKpiCard}>
            <div style={{ ...a.dayKpiIcon, background: "rgba(10,107,207,0.10)" }}>
              <Ic name="calendar-check" size={11} color="#0A6BCF" stroke={2.6} />
            </div>
            <div>
              <div style={a.dayKpiVal}>2</div>
              <div style={a.dayKpiLabel}>por hacer</div>
            </div>
          </div>
          <div style={a.dayKpiCard}>
            <div style={{ ...a.dayKpiIcon, background: "rgba(245,158,11,0.14)" }}>
              <Ic name="wallet" size={11} color="#B45309" stroke={2.4} />
            </div>
            <div>
              <div style={a.dayKpiVal}>$2,050</div>
              <div style={a.dayKpiLabel}>pendiente</div>
            </div>
          </div>
        </div>

        <DaySectionHead label="Hoy" dateLabel="Lunes 19 mayo" count={4} money={3480} />
        <div style={a.svcList}>
          {today.map((svc, idx) => (
            <ServiceRow key={idx} svc={svc} isNext={svc.id === "#SVC-2851"} />
          ))}
        </div>

        <DaySectionHead label="Mañana" dateLabel="Martes 20 mayo" count={2} money={900} />
        <div style={a.svcList}>
          {tomorrow.map((svc, idx) => (
            <ServiceRow key={idx} svc={svc} />
          ))}
        </div>

        {/* Week summary */}
        <DaySectionHead label="Esta semana" dateLabel="Mié 21 — Dom 25" count={5} money={4150} />
        <div style={a.weekList}>
          <WeekRow date="MIÉ 21" name="Adrián Vargas"  cat="Gas"       amount={600}  time="11 AM" />
          <WeekRow date="JUE 22" name="Paola Núñez"    cat="Pintura"   amount={2800} time="9 AM" />
          <WeekRow date="VIE 23" name="—"              blocked />
          <WeekRow date="SÁB 24" name="Roberto S."     cat="Herrería"  amount={750}  time="10 AM" />
        </div>

        {/* Tip */}
        <div style={a.tipRow}>
          <Ic name="lightbulb" size={12} color="#B45309" />
          <span>Te quedan <b style={{ color: "#0E2C56", fontWeight: 700 }}>2 horas libres entre 5 y 7 PM</b>. Podrías recibir 1 servicio más hoy.</span>
        </div>
      </div>

      <BottomTabs />
    </div>
  );
}

function WeekRow({ date, name, cat, amount, time, blocked }) {
  if (blocked) {
    return (
      <div style={{ ...a.weekRow, ...a.weekRowBlocked }}>
        <div style={a.weekDate}>{date}</div>
        <div style={{ flex: 1 }}>
          <div style={a.weekBlockedText}>Día bloqueado · Descanso</div>
        </div>
        <Ic name="moon" size={13} color="#9CA3AF" />
      </div>
    );
  }
  return (
    <div style={a.weekRow}>
      <div style={a.weekDate}>{date}</div>
      <div style={a.weekTime}>{time}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={a.weekName}>{name}</div>
        <div style={a.weekCat}>{cat}</div>
      </div>
      <div style={a.weekAmount}>${amount.toLocaleString()}</div>
      <Ic name="chevron-right" size={12} color="#9CA3AF" />
    </div>
  );
}

// =====================================================================
// SCREEN 02 — CALENDAR
// =====================================================================
function CalendarScreen() {
  // Mock month: May 2026, starts on Friday
  // 0=Sun, 1=Mon, etc. May 1 2026 is Friday → starts on col 5
  const startOffset = 5;
  const daysInMonth = 31;
  // Annotations for days (1-indexed)
  const ann = {
    1: { blue: 2 },
    5: { blue: 1, green: 1 },
    8: { green: 2 },
    12: { green: 3 },
    14: { blocked: true },
    15: { blue: 1 },
    18: { green: 2, blue: 1 },
    19: { green: 2, blue: 2, today: true },
    20: { blue: 2 },
    21: { blue: 1 },
    22: { blue: 1 },
    23: { blocked: true },
    24: { blue: 1 },
    28: { blue: 2 },
  };
  const selectedDay = 19;

  return (
    <div style={a.wrap}>
      <AgendaHeader />
      <Tabs active="calendar" />

      <div style={a.body}>
        {/* Month nav */}
        <div style={a.monthNav}>
          <button style={a.monthNavBtn}><Ic name="chevron-left" size={15} color="#0E2C56" /></button>
          <div style={a.monthNavCenter}>
            <div style={a.monthNavLabel}>MAYO</div>
            <div style={a.monthNavTitle}>2026</div>
          </div>
          <button style={a.monthNavBtn}><Ic name="chevron-right" size={15} color="#0E2C56" /></button>

          <div style={a.monthViewToggle}>
            <div style={{ ...a.monthViewBtn, ...a.monthViewBtnSel }}>Mes</div>
            <div style={a.monthViewBtn}>Semana</div>
          </div>
        </div>

        {/* Calendar grid */}
        <div style={a.calCard}>
          <div style={a.calWeekdays}>
            {["D", "L", "M", "M", "J", "V", "S"].map((w, idx) => (
              <div key={idx} style={{ ...a.calWeekday, color: idx === 0 || idx === 6 ? "#DC2626" : "#9CA3AF" }}>{w}</div>
            ))}
          </div>
          <div style={a.calGrid}>
            {/* Padding */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`pad${i}`} style={a.calDayPad} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const meta = ann[day] || {};
              const sel = day === selectedDay;
              const isToday = meta.today;
              return (
                <div key={day} style={{
                  ...a.calDay,
                  ...(meta.blocked ? a.calDayBlocked : null),
                  ...(sel ? a.calDaySel : null),
                  ...(isToday && !sel ? a.calDayToday : null),
                }}>
                  <div style={a.calDayNum}>{day}</div>
                  {(meta.blue || meta.green) && !meta.blocked && (
                    <div style={a.calDots}>
                      {meta.green && <span style={{ ...a.calDot, background: "#18A66A" }} />}
                      {meta.blue && <span style={{ ...a.calDot, background: "#0A6BCF" }} />}
                    </div>
                  )}
                  {meta.blocked && <div style={a.calDayBlockedIcon}><Ic name="moon" size={9} color="#9CA3AF" /></div>}
                </div>
              );
            })}
          </div>
          <div style={a.calLegend}>
            <div style={a.calLegendItem}><span style={{ ...a.calDot, background: "#18A66A" }} /> Completado</div>
            <div style={a.calLegendItem}><span style={{ ...a.calDot, background: "#0A6BCF" }} /> Programado</div>
            <div style={a.calLegendItem}><span style={{ ...a.calDayBlockedDot }} /> Bloqueado</div>
          </div>
        </div>

        {/* Selected day expansion */}
        <div style={a.selDayCard}>
          <div style={a.selDayHead}>
            <div style={a.selDayDate}>
              <div style={a.selDayMonth}>MAY</div>
              <div style={a.selDayNum}>19</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={a.selDayTitle}>Hoy · Lunes</div>
              <div style={a.selDaySub}>
                <span style={{ color: "#0F8A56", fontWeight: 700 }}>2 completados</span>
                <span style={a.bullet} />
                <span style={{ color: "#0A6BCF", fontWeight: 700 }}>2 programados</span>
                <span style={a.bullet} />
                <span><b style={{ color: "#0E2C56", fontWeight: 700 }}>$3,480 MXN</b></span>
              </div>
            </div>
            <button style={a.selDayAddBtn}>
              <Ic name="plus" size={14} color="#FFFFFF" stroke={2.6} />
            </button>
          </div>

          <div style={a.miniTimeline}>
            <MiniTimelineRow time="10:00" name="María Ramírez"   cat="Plomería"       amount={850}  state="completed" />
            <MiniTimelineRow time="13:00" name="José Luis G."     cat="Electricidad"   amount={1200} state="completed" />
            <MiniTimelineRow time="15:00" name="María Rodríguez"  cat="Plomería"       amount={450}  state="next" />
            <MiniTimelineRow time="18:00" name="Carmen Solís"     cat="Cristales"      amount={980}  state="accepted" />
          </div>
        </div>

        {/* Free slots suggestion */}
        <div style={a.freeSlotsCard}>
          <div style={a.freeSlotsHead}>
            <Ic name="sparkles" size={13} color="#B45309" />
            <span style={a.freeSlotsLabel}>HUECOS LIBRES HOY · 2</span>
          </div>
          <div style={a.freeSlotsRow}>
            <div style={a.freeSlot}>
              <span style={a.freeSlotTime}>11:30 — 13:00</span>
              <span style={a.freeSlotDur}>1h 30m</span>
            </div>
            <div style={a.freeSlot}>
              <span style={a.freeSlotTime}>16:30 — 18:00</span>
              <span style={a.freeSlotDur}>1h 30m</span>
            </div>
          </div>
        </div>
      </div>

      <BottomTabs />
    </div>
  );
}

function MiniTimelineRow({ time, name, cat, amount, state }) {
  const stateMap = {
    completed: { color: "#18A66A", icon: "check"          },
    accepted:  { color: "#0A6BCF", icon: "calendar-check" },
    next:      { color: "#0A6BCF", icon: "play"           },
  };
  const s = stateMap[state];
  return (
    <div style={a.mtlRow}>
      <div style={a.mtlTimeCol}>
        <div style={a.mtlTime}>{time}</div>
        <div style={{ ...a.mtlDot, background: s.color, ...(state === "next" ? { boxShadow: "0 0 0 3px rgba(10,107,207,0.20)" } : null) }}>
          {state !== "next" && <Ic name={s.icon} size={9} color="#FFFFFF" stroke={3} />}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={a.mtlName}>{name}</div>
        <div style={a.mtlMeta}>
          <span>{cat}</span>
          <span style={a.bullet} />
          <b style={{ color: "#0E2C56", fontWeight: 700 }}>${amount}</b>
        </div>
      </div>
      {state === "next" && (
        <span style={a.mtlNextChip}>
          <span style={a.mtlNextDot} />
          <span>próximo</span>
        </span>
      )}
    </div>
  );
}

// =====================================================================
// SCREEN 03 — HISTORY
// =====================================================================
function HistoryScreen() {
  const items = [
    { date: "18 MAY", time: "16:00", initials: "AA", tone: 0, name: "Ana Aguirre",         cat: "Plomería · Calentadores",     amount: 1200, rating: 5 },
    { date: "17 MAY", time: "11:30", initials: "RG", tone: 1, name: "Roberto Galván",      cat: "Electricidad · Cortos",       amount: 750,  rating: 5 },
    { date: "17 MAY", time: "9:00",  initials: "PN", tone: 2, name: "Paola Núñez",         cat: "Plomería · Drenaje",          amount: 600,  rating: 4 },
    { date: "16 MAY", time: "15:00", initials: "MS", tone: 3, name: "Manuel Solórzano",    cat: "Gas · Calentador",            amount: 850,  rating: 5 },
    { date: "15 MAY", time: "10:00", initials: "TG", tone: 4, name: "Teresa Galindo",      cat: "Plomería · Fugas",            amount: 450,  rating: 5 },
    { date: "12 MAY", time: "14:00", initials: "JC", tone: 5, name: "Juan Carlos M.",      cat: "Plomería · WC",                amount: 1650, rating: 4 },
  ];
  return (
    <div style={a.wrap}>
      <AgendaHeader />
      <Tabs active="history" />

      <div style={a.body}>
        {/* History KPIs */}
        <div style={a.histStatsCard}>
          <div style={a.histStatsBlock}>
            <div style={a.histStatsVal}>26</div>
            <div style={a.histStatsLabel}>servicios</div>
          </div>
          <div style={a.histStatsDiv} />
          <div style={a.histStatsBlock}>
            <div style={a.histStatsVal}>$24,320</div>
            <div style={a.histStatsLabel}>cobrado</div>
          </div>
          <div style={a.histStatsDiv} />
          <div style={a.histStatsBlock}>
            <div style={{ ...a.histStatsVal, color: "#F59E0B", display: "inline-flex", alignItems: "center", gap: 4 }}>
              <svg width="14" height="14" viewBox="0 0 24 24"><path d="M12 2.5l2.95 6.42 7.05.78-5.28 4.78 1.52 6.92L12 18.27l-6.24 3.13 1.52-6.92L2 9.7l7.05-.78L12 2.5z" fill="#F59E0B"/></svg>
              4.8
            </div>
            <div style={a.histStatsLabel}>rating</div>
          </div>
        </div>

        {/* Period filter */}
        <div style={a.periodRow}>
          <div style={a.periodLabel}>PERIODO</div>
          <div style={a.periodChips}>
            <div style={{ ...a.periodChip, ...a.periodChipSel }}>Esta semana</div>
            <div style={a.periodChip}>Este mes</div>
            <div style={a.periodChip}>3 meses</div>
            <div style={a.periodChip}>Todo</div>
          </div>
        </div>

        <DaySectionHead label="Esta semana" dateLabel="6 servicios · ★4.8 prom." count={6} money={5500} />
        <div style={a.histList}>
          {items.map((it, idx) => (
            <HistoryRow key={idx} item={it} />
          ))}
        </div>

        <button style={a.loadMoreBtn}>
          <Ic name="rotate-cw" size={13} color="#0A6BCF" style={{ marginRight: 6 }} />
          Cargar más servicios
        </button>
      </div>

      <BottomTabs />
    </div>
  );
}

function HistoryRow({ item }) {
  return (
    <div style={a.histRow}>
      <div style={a.histDateCol}>
        <div style={a.histDateText}>{item.date}</div>
        <div style={a.histTimeText}>{item.time}</div>
      </div>
      <div style={{ ...a.svcAv, background: CLIENT_TONES[item.tone] }}>{item.initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={a.histName}>{item.name}</div>
        <div style={a.histCat}>{item.cat}</div>
        <div style={a.histRating}>
          {[1,2,3,4,5].map(n => (
            <svg key={n} width="9" height="9" viewBox="0 0 24 24">
              <path d="M12 2.5l2.95 6.42 7.05.78-5.28 4.78 1.52 6.92L12 18.27l-6.24 3.13 1.52-6.92L2 9.7l7.05-.78L12 2.5z" fill={n <= item.rating ? "#F59E0B" : "#E1E8F0"} />
            </svg>
          ))}
        </div>
      </div>
      <div style={a.histAmount}>${item.amount.toLocaleString()}</div>
      <Ic name="chevron-right" size={13} color="#9CA3AF" />
    </div>
  );
}

// =====================================================================
// SCREEN 04 — AVAILABILITY SETTINGS
// =====================================================================
function AvailabilitySettings() {
  const days = [
    { label: "Lunes",     short: "L",   on: true,  start: "8:00 AM", end: "7:00 PM" },
    { label: "Martes",    short: "M",   on: true,  start: "8:00 AM", end: "7:00 PM" },
    { label: "Miércoles", short: "M",   on: true,  start: "8:00 AM", end: "7:00 PM" },
    { label: "Jueves",    short: "J",   on: true,  start: "8:00 AM", end: "7:00 PM" },
    { label: "Viernes",   short: "V",   on: true,  start: "8:00 AM", end: "7:00 PM" },
    { label: "Sábado",    short: "S",   on: true,  start: "9:00 AM", end: "3:00 PM" },
    { label: "Domingo",   short: "D",   on: false                                    },
  ];

  return (
    <div style={a.wrap}>
      <div style={a.subHeader}>
        <button style={a.iconBtn}><Ic name="arrow-left" size={17} color="#0E2C56" /></button>
        <div style={a.subHeaderCenter}>
          <div style={a.subHeaderLabel}>CONFIGURACIÓN</div>
          <div style={a.subHeaderTitle}>Mi disponibilidad</div>
        </div>
        <button style={a.subHeaderSave}>Guardar</button>
      </div>

      <div style={a.body}>
        {/* Live preview */}
        <div style={a.availPreviewCard}>
          <div style={a.availPreviewLabel}>
            <Ic name="zap" size={11} color="#0A6BCF" />
            <span>RESUMEN ACTUAL</span>
          </div>
          <div style={a.availPreviewRow}>
            <span style={a.availPreviewVal}><b style={{ color: "#0E2C56", fontWeight: 800 }}>54 horas</b> a la semana</span>
            <span style={a.availPreviewBullet} />
            <span style={a.availPreviewVal}><b style={{ color: "#0E2C56", fontWeight: 800 }}>4</b> servicios/día máx</span>
          </div>
        </div>

        {/* Weekly schedule */}
        <SectionLabel n="A" label="HORARIO SEMANAL" sub="Tus horarios de atención por día" />
        <div style={a.scheduleCard}>
          {days.map((d, idx) => (
            <DayRow key={d.label} day={d} last={idx === days.length - 1} />
          ))}
        </div>

        {/* Quick presets */}
        <div style={a.presetsRow}>
          <span style={a.presetsLabel}>PLANTILLAS RÁPIDAS</span>
          <div style={a.presetsChips}>
            <div style={a.presetChip}>L–V 8–19h</div>
            <div style={a.presetChip}>L–S 7–20h</div>
            <div style={a.presetChip}>Solo fines</div>
          </div>
        </div>

        {/* Daily limit slider */}
        <SectionLabel n="B" label="LÍMITE DIARIO" sub="Máximo de servicios que aceptas al día" />
        <div style={a.limitCard}>
          <div style={a.limitTopRow}>
            <div style={a.limitIconWrap}>
              <Ic name="briefcase" size={15} color="#0A6BCF" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={a.limitVal}>4 <span style={a.limitValLabel}>servicios/día</span></div>
              <div style={a.limitEarn}>Potencial · <b style={{ color: "#0F8A56", fontWeight: 700 }}>~$3,200 MXN</b> diarios</div>
            </div>
          </div>
          <div style={a.limitSliderTrack}>
            <div style={a.limitSliderFill} />
            <div style={a.limitSliderThumb}>
              <div style={a.limitSliderThumbInner} />
            </div>
          </div>
          <div style={a.limitSliderLabels}>
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        {/* Blocks */}
        <SectionLabel n="C" label="BLOQUEOS PUNTUALES" sub="Días o franjas en las que no atiendes"
          right={
            <button style={a.addBlockBtn}>
              <Ic name="plus" size={11} color="#FFFFFF" stroke={2.6} />
              <span>Agregar</span>
            </button>
          }
        />
        <div style={a.blocksList}>
          <BlockRow date="23/05/2026" label="Día familiar" range="Todo el día" />
          <BlockRow date="15/06/2026" label="Vacaciones · ida" range="Todo el día" />
          <BlockRow date="20/06/2026" label="Curso de capacitación" range="9 AM — 1 PM" partial />
        </div>

        {/* Auto pause */}
        <SectionLabel n="D" label="PAUSA AUTOMÁTICA" sub="Reglas para pausarte sin que lo decidas manualmente" />
        <div style={a.autoPauseList}>
          <AutoPauseRow icon="briefcase" title="Al llegar a tu límite del día" desc="Pausa solicitudes nuevas al aceptar tu 4to servicio" on />
          <AutoPauseRow icon="moon"      title="Fuera de horario"            desc="Pausa fuera de tu horario semanal" on />
          <AutoPauseRow icon="cloud-rain" title="Por clima extremo"          desc="Recibe sugerencia para pausar en lluvias fuertes" />
        </div>
      </div>
    </div>
  );
}

function DayRow({ day, last }) {
  return (
    <div style={{ ...a.dayRow, ...(last ? null : { borderBottom: "1px solid #F0F4F9" }), ...(day.on ? null : a.dayRowOff) }}>
      <div style={a.dayRowLeft}>
        <div style={{ ...a.dayLetter, background: day.on ? "#0A6BCF" : "#EEF3F8", color: day.on ? "#FFFFFF" : "#9CA3AF" }}>{day.short}</div>
        <div>
          <div style={{ ...a.dayRowLabel, color: day.on ? "#0E2C56" : "#9CA3AF" }}>{day.label}</div>
          {day.on && <div style={a.dayRowDuration}>{day.start.replace(" AM", "").replace(" PM", "")} – {day.end.replace(" AM", "").replace(" PM", "")}</div>}
        </div>
      </div>
      {day.on ? (
        <div style={a.timeChipsRow}>
          <div style={a.timeChip}>{day.start}</div>
          <span style={a.timeDash}>—</span>
          <div style={a.timeChip}>{day.end}</div>
        </div>
      ) : (
        <span style={a.offChip}>Descanso</span>
      )}
      <div style={{ ...a.toggleSm, background: day.on ? "#18A66A" : "#E1E8F0", marginLeft: 8 }}>
        <div style={{ ...a.toggleSmKnob, left: day.on ? 18 : 2 }} />
      </div>
    </div>
  );
}

function BlockRow({ date, label, range, partial }) {
  return (
    <div style={a.blockRow}>
      <div style={a.blockIconWrap}>
        <Ic name={partial ? "clock" : "calendar-x"} size={14} color="#B45309" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={a.blockTitle}>{label}</div>
        <div style={a.blockMeta}>
          <span style={a.blockDate}>{date}</span>
          <span style={a.bullet} />
          <span>{range}</span>
        </div>
      </div>
      <button style={a.blockEditBtn}>
        <Ic name="pencil" size={11} color="#0A6BCF" />
      </button>
      <button style={a.blockRemoveBtn}>
        <Ic name="x" size={11} color="#DC2626" />
      </button>
    </div>
  );
}

function AutoPauseRow({ icon, title, desc, on }) {
  return (
    <div style={a.autoPauseRow}>
      <div style={a.autoPauseIcon}>
        <Ic name={icon} size={14} color="#0A6BCF" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={a.autoPauseTitle}>{title}</div>
        <div style={a.autoPauseDesc}>{desc}</div>
      </div>
      <div style={{ ...a.toggleSm, background: on ? "#18A66A" : "#E1E8F0" }}>
        <div style={{ ...a.toggleSmKnob, left: on ? 18 : 2 }} />
      </div>
    </div>
  );
}

// =====================================================================
// SCREEN 05 — EMPTY UPCOMING
// =====================================================================
function EmptyUpcomingScreen() {
  return (
    <div style={a.wrap}>
      <AgendaHeader />
      <Tabs active="upcoming" />

      <div style={a.body}>
        <AvailabilityCard available={true} />

        <div style={a.emptyCard}>
          <CalendarIllu />
          <div style={a.emptyTitle}>No tienes servicios programados</div>
          <div style={a.emptySub}>
            Cuando aceptes solicitudes, aparecerán aquí ordenadas por fecha y hora.
          </div>

          <div style={a.emptyKpiRow}>
            <div style={a.emptyKpi}>
              <Ic name="zap" size={13} color="#0A6BCF" />
              <span><b style={{ color: "#0E2C56", fontWeight: 700 }}>2</b> solicitudes pendientes</span>
            </div>
            <div style={a.emptyKpi}>
              <Ic name="map-pin" size={13} color="#0A6BCF" />
              <span><b style={{ color: "#0E2C56", fontWeight: 700 }}>4 zonas</b> activas</span>
            </div>
          </div>

          <button style={a.emptyCta}>
            <Ic name="inbox" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
            Ver solicitudes nuevas
          </button>
          <button style={a.emptyGhost}>Tips para conseguir más clientes</button>
        </div>

        <div style={a.proTipCard}>
          <div style={a.proTipIcon}>
            <Ic name="sparkles" size={16} color="#FFFFFF" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={a.proTipLabel}>ESTE FIN DE SEMANA</div>
            <div style={a.proTipText}>
              <b style={{ color: "#0E2C56", fontWeight: 800 }}>+18% de demanda</b> de plomería en Providencia. Considera ampliar tu disponibilidad sábado.
            </div>
          </div>
        </div>
      </div>

      <BottomTabs />
    </div>
  );
}

function CalendarIllu() {
  return (
    <svg viewBox="0 0 200 140" width="180" height="126" style={{ display: "block", margin: "0 auto" }}>
      <defs>
        <linearGradient id="calBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0A6BCF" />
          <stop offset="1" stopColor="#0894EA" />
        </linearGradient>
      </defs>
      {/* Calendar back */}
      <rect x="30" y="30" width="140" height="100" rx="10" fill="#FFFFFF" stroke="#E1E8F0" strokeWidth="2" />
      {/* Header band */}
      <rect x="30" y="30" width="140" height="22" rx="10" fill="url(#calBody)" />
      <rect x="30" y="42" width="140" height="10" fill="url(#calBody)" />
      <rect x="48" y="22" width="8" height="14" rx="1.5" fill="#0E2C56" />
      <rect x="144" y="22" width="8" height="14" rx="1.5" fill="#0E2C56" />
      {/* Grid lines */}
      <g stroke="#E1E8F0" strokeWidth="1">
        <line x1="30" y1="68" x2="170" y2="68" />
        <line x1="30" y1="86" x2="170" y2="86" />
        <line x1="30" y1="104" x2="170" y2="104" />
        <line x1="50" y1="52" x2="50" y2="130" />
        <line x1="70" y1="52" x2="70" y2="130" />
        <line x1="90" y1="52" x2="90" y2="130" />
        <line x1="110" y1="52" x2="110" y2="130" />
        <line x1="130" y1="52" x2="130" y2="130" />
        <line x1="150" y1="52" x2="150" y2="130" />
      </g>
      {/* Day numbers (faint) */}
      <g fontFamily="Inter" fontWeight="600" fontSize="6" fill="#9CA3AF">
        <text x="40" y="62">1</text>
        <text x="60" y="62">2</text>
        <text x="80" y="62">3</text>
        <text x="100" y="62">4</text>
        <text x="120" y="62">5</text>
        <text x="40" y="80">8</text>
        <text x="60" y="80">9</text>
        <text x="40" y="98">15</text>
      </g>
      {/* Highlight selected day */}
      <rect x="92" y="74" width="16" height="14" rx="3" fill="rgba(10,107,207,0.18)" stroke="#0A6BCF" strokeWidth="1" />
      <text x="98" y="84" fontFamily="Manrope" fontWeight="800" fontSize="9" fill="#0A6BCF">19</text>
      {/* Sparkles */}
      <g fill="#F59E0B">
        <path d="M178 42 L180 48 L186 50 L180 52 L178 58 L176 52 L170 50 L176 48 Z" />
        <circle cx="22" cy="32" r="2.5" />
        <circle cx="178" cy="108" r="2" />
      </g>
    </svg>
  );
}

// =====================================================================
// SHARED — section label / bottom tabs
// =====================================================================
function SectionLabel({ n, label, sub, right }) {
  return (
    <div style={a.sectionLabelRow}>
      <div style={a.sectionLabelNum}>{n}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={a.sectionLabelLabel}>{label}</div>
        {sub && <div style={a.sectionLabelSub}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function BottomTabs() {
  const tabs = [
    { id: "inbox",    icon: "inbox",         label: "Inbox" },
    { id: "agenda",   icon: "calendar-days", label: "Agenda", active: true },
    { id: "wallet",   icon: "wallet",        label: "Cartera" },
    { id: "messages", icon: "message-circle",label: "Mensajes" },
    { id: "profile",  icon: "user",          label: "Perfil" },
  ];
  return (
    <div style={a.tabbar}>
      {tabs.map(t => (
        <div key={t.id} style={a.tabItem}>
          <Ic name={t.icon} size={22} color={t.active ? "#0A6BCF" : "#9CA3AF"} stroke={t.active ? 2.2 : 1.8} />
          <span style={{ ...a.tabbarLabel, color: t.active ? "#0A6BCF" : "#9CA3AF", fontWeight: t.active ? 700 : 500 }}>
            {t.label}
          </span>
          {t.active && <div style={a.tabActiveDot} />}
        </div>
      ))}
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
      <DCSection id="primary" title="Mi agenda · 3 tabs" subtitle="Próximos · calendario · historial">
        <DCArtboard id="upcoming" label="01 · Próximos (default)" width={438} height={892}>
          <PhoneFrame><UpcomingScreen /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="calendar" label="02 · Calendario mensual" width={438} height={892}>
          <PhoneFrame><CalendarScreen /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="history" label="03 · Historial" width={438} height={892}>
          <PhoneFrame><HistoryScreen /></PhoneFrame>
        </DCArtboard>
      </DCSection>

      <DCSection id="settings" title="Configuración de disponibilidad" subtitle="Sub-pantalla · settings">
        <DCArtboard id="avail" label="04 · Mi disponibilidad" width={438} height={892}>
          <PhoneFrame><AvailabilitySettings /></PhoneFrame>
        </DCArtboard>
      </DCSection>

      <DCSection id="empty" title="Estado vacío" subtitle="Sin servicios programados">
        <DCArtboard id="empty1" label="05 · Sin servicios programados" width={438} height={892}>
          <PhoneFrame><EmptyUpcomingScreen /></PhoneFrame>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// =====================================================================
// STYLES
// =====================================================================
const a = {
  wrap: { width: "100%", height: "100%", background: "#F8FBFF", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" },

  // ===== Header =====
  header: { display: "flex", alignItems: "center", gap: 8, padding: "50px 16px 14px", background: "#FFFFFF", borderBottom: "1px solid #F0F4F9", flexShrink: 0 },
  headerTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 24, color: "#0E2C56", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 },
  headerSub: { display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#6B7280", marginTop: 4 },
  headerLiveDot: { display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#0A6BCF", boxShadow: "0 0 0 3px rgba(10,107,207,0.18)" },
  bullet: { width: 2, height: 2, borderRadius: "50%", background: "#9CA3AF", margin: "0 3px" },
  iconBtn: { width: 38, height: 38, borderRadius: 11, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  iconBtnPrimary: { width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg,#0A6BCF,#0894EA)", border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0, boxShadow: "0 4px 10px rgba(10,107,207,0.30)" },

  // ===== Sub header (settings) =====
  subHeader: { display: "flex", alignItems: "center", gap: 10, padding: "50px 16px 12px", background: "#FFFFFF", borderBottom: "1px solid #F0F4F9", flexShrink: 0 },
  subHeaderCenter: { flex: 1, textAlign: "center", minWidth: 0 },
  subHeaderLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#9CA3AF", letterSpacing: ".1em", fontWeight: 700 },
  subHeaderTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 17, fontWeight: 700, color: "#0E2C56", marginTop: 2, letterSpacing: "-0.01em" },
  subHeaderSave: { padding: "8px 14px", background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(10,107,207,0.30)", flexShrink: 0 },

  // ===== Tabs =====
  tabs: { display: "flex", padding: "0 12px", background: "#FFFFFF", borderBottom: "1px solid #F0F4F9", gap: 4, flexShrink: 0 },
  tab: { position: "relative", display: "flex", alignItems: "center", gap: 5, padding: "12px 8px", fontSize: 12.5, fontWeight: 600, color: "#6B7280", flex: 1, justifyContent: "center", cursor: "pointer" },
  tabActive: { color: "#0E2C56" },
  tabCount: { padding: "2px 7px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },

  body: { flex: 1, overflowY: "auto", padding: "14px 16px 100px" },

  // ===== Availability card =====
  availCard: { position: "relative", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 16, marginBottom: 12, overflow: "hidden", color: "#FFFFFF" },
  availCardOn: { background: "linear-gradient(135deg, #18A66A 0%, #4ED896 100%)", boxShadow: "0 8px 20px rgba(24,166,106,0.30)" },
  availCardOff: { background: "linear-gradient(135deg, #4B5563 0%, #6B7280 100%)", boxShadow: "0 6px 16px rgba(75,85,99,0.30)" },
  availLeftIcon: { width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,0.18)", display: "grid", placeItems: "center", flexShrink: 0 },
  availTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800, letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  availStatusChip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.95)" },
  availStatusDot: { width: 6, height: 6, borderRadius: "50%" },
  availSub: { fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 4, lineHeight: 1.4 },
  availToggle: { position: "relative", width: 44, height: 24, borderRadius: 999, flexShrink: 0 },
  availToggleKnob: { position: "absolute", top: 2, width: 20, height: 20, borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 2px 6px rgba(14,44,86,0.15)", transition: "left 0.15s" },

  // ===== Day KPI row =====
  dayKpiRow: { display: "flex", gap: 8, marginBottom: 14 },
  dayKpiCard: { flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12 },
  dayKpiIcon: { width: 26, height: 26, borderRadius: 8, background: "rgba(24,166,106,0.12)", display: "grid", placeItems: "center", flexShrink: 0 },
  dayKpiVal: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 14, color: "#0E2C56", letterSpacing: "-0.01em", lineHeight: 1 },
  dayKpiLabel: { fontSize: 10, color: "#6B7280", marginTop: 2 },

  // ===== Day section head =====
  daySection: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 4px 8px" },
  dayLeft: {},
  dayLabel: { fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em" },
  dayDate: { fontSize: 11, color: "#6B7280", marginTop: 1 },
  dayRight: { display: "flex", alignItems: "center", gap: 8 },
  dayCount: { padding: "2px 8px", background: "rgba(10,107,207,0.08)", color: "#0A6BCF", borderRadius: 999, fontSize: 10.5, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  dayMoney: { fontFamily: "'Manrope', sans-serif", fontSize: 12, fontWeight: 800, color: "#0F8A56" },

  // ===== Service row =====
  svcList: { display: "flex", flexDirection: "column", gap: 8 },
  svcRow: { display: "flex", gap: 10 },
  svcRowNext: {},
  svcTime: { width: 54, textAlign: "right", flexShrink: 0, paddingTop: 4 },
  svcTimeBig: { fontFamily: "'Manrope', sans-serif", fontSize: 15, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.01em", lineHeight: 1 },
  svcTimeMeridian: { fontSize: 10, color: "#9CA3AF", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", marginTop: 2 },
  svcDuration: { display: "flex", flexDirection: "column", alignItems: "flex-end", marginTop: 6, gap: 4, fontSize: 9.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" },
  svcDurationLine: { width: 1, height: 16, background: "#E1E8F0" },

  svcCard: { position: "relative", flex: 1, padding: "10px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12, cursor: "pointer", minWidth: 0 },
  svcNextRibbon: { position: "absolute", top: -6, right: 10, padding: "2px 8px", background: "linear-gradient(135deg,#0A6BCF,#0894EA)", color: "#FFFFFF", borderRadius: 999, fontSize: 9, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".08em", boxShadow: "0 4px 10px rgba(10,107,207,0.30)" },
  svcTopRow: { display: "flex", alignItems: "center", gap: 10 },
  svcAv: { width: 34, height: 34, borderRadius: "50%", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 11.5, flexShrink: 0 },
  svcName: { fontSize: 13, fontWeight: 700, color: "#0E2C56", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  svcMeta: { display: "flex", alignItems: "center", gap: 4, marginTop: 2, fontSize: 11, color: "#6B7280" },
  svcCat: { color: "#0A6BCF", fontWeight: 600 },
  svcId: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF", fontWeight: 600 },
  svcStateChip: { display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: 999, fontSize: 9.5, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".04em", textTransform: "uppercase", flexShrink: 0 },

  svcBottomRow: { display: "flex", alignItems: "center", gap: 4, marginTop: 8, paddingTop: 8, borderTop: "1px solid #F0F4F9" },
  svcInfoChip: { display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 6, fontSize: 10.5, color: "#6B7280", fontWeight: 600 },
  svcAddr: { fontSize: 11, color: "#6B7280" },
  svcSpacer: { flex: 1 },
  svcAmount: { fontFamily: "'Manrope', sans-serif", fontSize: 14, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.01em" },
  svcEtaRow: { display: "flex", alignItems: "center", gap: 5, marginTop: 8, padding: "6px 10px", background: "rgba(10,107,207,0.08)", borderRadius: 8, fontSize: 11, color: "#6B7280", lineHeight: 1.4 },

  // ===== Week list =====
  weekList: { display: "flex", flexDirection: "column", gap: 6 },
  weekRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10, cursor: "pointer" },
  weekRowBlocked: { background: "#F8FBFF", border: "1px dashed #E1E8F0" },
  weekDate: { width: 50, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#0A6BCF", fontWeight: 700, letterSpacing: ".04em", flexShrink: 0 },
  weekTime: { fontSize: 11, color: "#6B7280", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", width: 38, flexShrink: 0 },
  weekName: { fontSize: 12.5, fontWeight: 700, color: "#0E2C56" },
  weekCat: { fontSize: 11, color: "#6B7280", marginTop: 1 },
  weekAmount: { fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 800, color: "#0E2C56" },
  weekBlockedText: { fontSize: 12, color: "#9CA3AF", fontStyle: "italic" },

  tipRow: { display: "flex", alignItems: "flex-start", gap: 6, marginTop: 16, padding: "10px 12px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 10, fontSize: 11.5, color: "#6B7280", lineHeight: 1.5 },

  // ===== Calendar =====
  monthNav: { display: "flex", alignItems: "center", gap: 8, padding: "0 4px 14px" },
  monthNavBtn: { width: 32, height: 32, borderRadius: 9, background: "#FFFFFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer" },
  monthNavCenter: { textAlign: "center", flex: 1 },
  monthNavLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF", letterSpacing: ".1em", fontWeight: 700 },
  monthNavTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 17, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.01em", marginTop: 1 },
  monthViewToggle: { display: "flex", gap: 2, padding: 2, background: "#EEF3F8", borderRadius: 8 },
  monthViewBtn: { padding: "5px 11px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: "#6B7280", cursor: "pointer" },
  monthViewBtnSel: { background: "#FFFFFF", color: "#0E2C56", boxShadow: "0 2px 4px rgba(14,44,86,0.08)" },

  calCard: { padding: "14px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, marginBottom: 14 },
  calWeekdays: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 },
  calWeekday: { textAlign: "center", fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".04em" },
  calGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 },
  calDay: { position: "relative", aspectRatio: "1", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, cursor: "pointer" },
  calDayPad: { aspectRatio: "1" },
  calDayBlocked: { background: "repeating-linear-gradient(45deg, #F4F7FB 0 6px, transparent 6px 12px)" },
  calDayBlockedIcon: { position: "absolute", top: 4, right: 4 },
  calDayBlockedDot: { display: "inline-block", width: 8, height: 8, background: "repeating-linear-gradient(45deg, #9CA3AF 0 3px, transparent 3px 6px)", borderRadius: 2 },
  calDayToday: { background: "rgba(10,107,207,0.08)", border: "1px dashed rgba(10,107,207,0.50)" },
  calDaySel: { background: "linear-gradient(135deg,#0A6BCF,#0894EA)", color: "#FFFFFF", boxShadow: "0 4px 10px rgba(10,107,207,0.30)" },
  calDayNum: { fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 600, color: "#0E2C56" },
  calDots: { display: "flex", gap: 3 },
  calDot: { display: "inline-block", width: 5, height: 5, borderRadius: "50%" },
  calLegend: { display: "flex", justifyContent: "center", gap: 12, marginTop: 14, paddingTop: 10, borderTop: "1px solid #F0F4F9", flexWrap: "wrap" },
  calLegendItem: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, color: "#6B7280" },

  // Calendar selected day
  selDayCard: { padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, marginBottom: 12 },
  selDayHead: { display: "flex", alignItems: "center", gap: 12, marginBottom: 10 },
  selDayDate: { display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0", width: 50, background: "linear-gradient(135deg,#0A6BCF,#0894EA)", color: "#FFFFFF", borderRadius: 10, flexShrink: 0 },
  selDayMonth: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 700, letterSpacing: ".06em", opacity: 0.85 },
  selDayNum: { fontFamily: "'Manrope', sans-serif", fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1, marginTop: 2 },
  selDayTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 15, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.01em" },
  selDaySub: { display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontSize: 11, color: "#6B7280", flexWrap: "wrap" },
  selDayAddBtn: { width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#0A6BCF,#0894EA)", border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0, boxShadow: "0 4px 10px rgba(10,107,207,0.30)" },

  miniTimeline: {},
  mtlRow: { display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #F4F7FB" },
  mtlTimeCol: { display: "flex", flexDirection: "column", alignItems: "center", width: 44, flexShrink: 0 },
  mtlTime: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, fontWeight: 700, color: "#0E2C56" },
  mtlDot: { width: 14, height: 14, borderRadius: "50%", marginTop: 4, display: "grid", placeItems: "center" },
  mtlName: { fontSize: 12.5, fontWeight: 700, color: "#0E2C56" },
  mtlMeta: { display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, color: "#6B7280", marginTop: 2 },
  mtlNextChip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", background: "rgba(10,107,207,0.10)", color: "#0A6BCF", borderRadius: 999, fontSize: 10, fontWeight: 700 },
  mtlNextDot: { display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "#0A6BCF", boxShadow: "0 0 0 2px rgba(10,107,207,0.30)" },

  freeSlotsCard: { padding: 12, background: "rgba(245,158,11,0.06)", border: "1px dashed rgba(245,158,11,0.35)", borderRadius: 12 },
  freeSlotsHead: { display: "flex", alignItems: "center", gap: 5, marginBottom: 8 },
  freeSlotsLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#B45309", letterSpacing: ".1em", fontWeight: 700 },
  freeSlotsRow: { display: "flex", gap: 6 },
  freeSlot: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "7px 8px", background: "#FFFFFF", border: "1px solid rgba(245,158,11,0.30)", borderRadius: 8 },
  freeSlotTime: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: "#0E2C56" },
  freeSlotDur: { fontSize: 9.5, color: "#B45309", marginTop: 2, fontWeight: 600 },

  // ===== History =====
  histStatsCard: { display: "flex", alignItems: "stretch", padding: "12px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, marginBottom: 12 },
  histStatsBlock: { flex: 1, textAlign: "center" },
  histStatsVal: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 16, color: "#0E2C56", letterSpacing: "-0.01em", lineHeight: 1 },
  histStatsLabel: { fontSize: 10, color: "#9CA3AF", marginTop: 4, textTransform: "uppercase", letterSpacing: ".04em", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
  histStatsDiv: { width: 1, background: "#E1E8F0", margin: "0 8px" },

  periodRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 },
  periodLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#9CA3AF", letterSpacing: ".08em", fontWeight: 700, flexShrink: 0 },
  periodChips: { display: "flex", gap: 5, overflowX: "auto" },
  periodChip: { padding: "5px 11px", background: "#FFFFFF", border: "1px solid #E1E8F0", color: "#6B7280", borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: "pointer", flexShrink: 0 },
  periodChipSel: { background: "#0A6BCF", borderColor: "#0A6BCF", color: "#FFFFFF" },

  histList: { display: "flex", flexDirection: "column", gap: 6 },
  histRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12, cursor: "pointer" },
  histDateCol: { width: 38, flexShrink: 0, textAlign: "center" },
  histDateText: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#9CA3AF", fontWeight: 700, letterSpacing: ".04em" },
  histTimeText: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#0E2C56", fontWeight: 700, marginTop: 2 },
  histName: { fontSize: 12.5, fontWeight: 700, color: "#0E2C56" },
  histCat: { fontSize: 10.5, color: "#6B7280", marginTop: 2 },
  histRating: { display: "inline-flex", gap: 1, marginTop: 4 },
  histAmount: { fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 800, color: "#0E2C56" },

  loadMoreBtn: { width: "100%", marginTop: 12, padding: "11px", background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #E1E8F0", borderRadius: 12, fontWeight: 700, fontSize: 12.5, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },

  // ===== Tabbar =====
  tabbar: { position: "absolute", left: 0, right: 0, bottom: 0, height: 82, background: "rgba(255,255,255,0.96)", borderTop: "1px solid #E1E8F0", display: "flex", justifyContent: "space-around", alignItems: "flex-start", padding: "10px 4px 24px", backdropFilter: "blur(8px)", zIndex: 5 },
  tabItem: { position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1, padding: "4px 0" },
  tabbarLabel: { fontSize: 10, marginTop: 1 },
  tabActiveDot: { position: "absolute", bottom: 2, width: 4, height: 4, borderRadius: "50%", background: "#0A6BCF" },

  // ===== Section label =====
  sectionLabelRow: { display: "flex", alignItems: "center", gap: 10, margin: "18px 0 10px" },
  sectionLabelNum: { width: 22, height: 22, borderRadius: "50%", background: "#0A6BCF", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 11, flexShrink: 0 },
  sectionLabelLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#0A6BCF", letterSpacing: ".1em", fontWeight: 700 },
  sectionLabelSub: { fontSize: 10.5, color: "#9CA3AF", marginTop: 1 },

  // ===== Settings — availability =====
  availPreviewCard: { padding: "10px 14px", background: "linear-gradient(135deg, rgba(10,107,207,0.06), rgba(24,193,255,0.04))", border: "1px solid rgba(10,107,207,0.25)", borderRadius: 12, marginBottom: 4 },
  availPreviewLabel: { display: "flex", alignItems: "center", gap: 5, fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#0A6BCF", letterSpacing: ".1em", fontWeight: 700, marginBottom: 6 },
  availPreviewRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6B7280", flexWrap: "wrap" },
  availPreviewVal: {},
  availPreviewBullet: { width: 2, height: 2, borderRadius: "50%", background: "#9CA3AF" },

  scheduleCard: { padding: "4px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14 },
  dayRow: { display: "flex", alignItems: "center", gap: 10, padding: "11px 0" },
  dayRowOff: { opacity: 0.7 },
  dayRowLeft: { display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 },
  dayLetter: { width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 12, flexShrink: 0 },
  dayRowLabel: { fontSize: 12.5, fontWeight: 700 },
  dayRowDuration: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#9CA3AF", marginTop: 2, fontWeight: 600 },
  timeChipsRow: { display: "flex", alignItems: "center", gap: 4 },
  timeChip: { padding: "4px 8px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 6, fontSize: 10.5, color: "#0E2C56", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  timeDash: { fontSize: 10, color: "#9CA3AF" },
  offChip: { padding: "3px 8px", background: "rgba(14,44,86,0.05)", color: "#6B7280", borderRadius: 999, fontSize: 10, fontWeight: 600 },
  toggleSm: { position: "relative", width: 36, height: 20, borderRadius: 999, transition: "background 0.15s", flexShrink: 0 },
  toggleSmKnob: { position: "absolute", top: 2, width: 16, height: 16, borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 1px 3px rgba(14,44,86,0.20)", transition: "left 0.15s" },

  presetsRow: { marginTop: 10 },
  presetsLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#9CA3AF", letterSpacing: ".08em", fontWeight: 700, display: "block", marginBottom: 6 },
  presetsChips: { display: "flex", gap: 6, flexWrap: "wrap" },
  presetChip: { padding: "6px 11px", background: "#FFFFFF", border: "1px solid #E1E8F0", color: "#0A6BCF", borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: "pointer" },

  limitCard: { padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14 },
  limitTopRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
  limitIconWrap: { width: 36, height: 36, borderRadius: 10, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  limitVal: { fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em", lineHeight: 1 },
  limitValLabel: { fontSize: 11, color: "#6B7280", fontWeight: 600, fontFamily: "'Inter', sans-serif", marginLeft: 4 },
  limitEarn: { fontSize: 11, color: "#6B7280", marginTop: 4 },
  limitSliderTrack: { position: "relative", height: 6, background: "#EEF3F8", borderRadius: 999 },
  limitSliderFill: { height: "100%", width: "40%", background: "linear-gradient(90deg,#0A6BCF,#18C1FF)", borderRadius: 999 },
  limitSliderThumb: { position: "absolute", left: "40%", top: "50%", transform: "translate(-50%,-50%)", width: 20, height: 20, borderRadius: "50%", background: "#FFFFFF", border: "3px solid #0A6BCF", display: "grid", placeItems: "center", boxShadow: "0 4px 10px rgba(10,107,207,0.30)" },
  limitSliderThumbInner: { width: 6, height: 6, borderRadius: "50%", background: "#0A6BCF" },
  limitSliderLabels: { display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },

  addBlockBtn: { display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", background: "linear-gradient(135deg,#0A6BCF,#0894EA)", color: "#FFFFFF", border: "none", borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(10,107,207,0.30)" },
  blocksList: { display: "flex", flexDirection: "column", gap: 6 },
  blockRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12 },
  blockIconWrap: { width: 32, height: 32, borderRadius: 9, background: "rgba(245,158,11,0.14)", display: "grid", placeItems: "center", flexShrink: 0 },
  blockTitle: { fontSize: 12.5, fontWeight: 700, color: "#0E2C56" },
  blockMeta: { display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: "#6B7280", marginTop: 2 },
  blockDate: { fontFamily: "'JetBrains Mono', monospace", color: "#B45309", fontWeight: 700 },
  blockEditBtn: { width: 28, height: 28, borderRadius: 8, background: "rgba(10,107,207,0.08)", border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  blockRemoveBtn: { width: 28, height: 28, borderRadius: 8, background: "rgba(220,38,38,0.08)", border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },

  autoPauseList: { display: "flex", flexDirection: "column", gap: 6 },
  autoPauseRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12 },
  autoPauseIcon: { width: 32, height: 32, borderRadius: 9, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  autoPauseTitle: { fontSize: 12.5, fontWeight: 700, color: "#0E2C56" },
  autoPauseDesc: { fontSize: 10.5, color: "#6B7280", marginTop: 2, lineHeight: 1.4 },

  // ===== Empty =====
  emptyCard: { padding: "20px 18px", background: "#FFFFFF", border: "1px dashed #C8D4E0", borderRadius: 16, textAlign: "center", marginTop: 14 },
  emptyTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em", marginTop: 12 },
  emptySub: { fontSize: 12.5, color: "#6B7280", marginTop: 6, lineHeight: 1.5, maxWidth: 300, marginLeft: "auto", marginRight: "auto" },
  emptyKpiRow: { display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap", marginTop: 14 },
  emptyKpi: { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 999, fontSize: 11, color: "#6B7280" },
  emptyCta: { width: "100%", marginTop: 18, padding: "13px", background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 13.5, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(10,107,207,0.30)" },
  emptyGhost: { width: "100%", marginTop: 8, padding: "10px", background: "transparent", color: "#0A6BCF", border: "none", fontWeight: 600, fontSize: 12, cursor: "pointer" },

  proTipCard: { display: "flex", gap: 10, padding: "12px 14px", background: "linear-gradient(135deg, rgba(245,158,11,0.10), rgba(251,191,36,0.05))", border: "1.5px solid rgba(245,158,11,0.30)", borderRadius: 14, marginTop: 12 },
  proTipIcon: { width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#F59E0B,#FBBF24)", display: "grid", placeItems: "center", flexShrink: 0, boxShadow: "0 4px 10px rgba(245,158,11,0.30)" },
  proTipLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#B45309", letterSpacing: ".1em", fontWeight: 700 },
  proTipText: { fontSize: 12, color: "#0E2C56", marginTop: 3, lineHeight: 1.5 },
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
