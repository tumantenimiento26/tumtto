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

const TECH_TONE = "linear-gradient(135deg, #0A6BCF, #18C1FF)";

// ============================================================
// SHARED HEADER
// ============================================================
function TrackHeader() {
  return (
    <div style={t.header}>
      <button style={t.iconBtn}><Ic name="arrow-left" size={18} color="#0E2C56" /></button>
      <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
        <div style={t.headerLabel}>SERVICIO</div>
        <div style={t.headerId}>#SVC-2851</div>
      </div>
      <button style={t.iconBtn}><Ic name="more-vertical" size={18} color="#0E2C56" /></button>
    </div>
  );
}

// ============================================================
// TIMELINE
// ============================================================
const STATES = ["Solicitado", "Aceptado", "En camino", "En sitio", "Cotización", "Completado"];
function Timeline({ current }) {
  return (
    <div style={t.timeline}>
      {STATES.map((label, i) => {
        const isDone = i < current;
        const isNow  = i === current;
        const tone = isDone ? { bg: "#18A66A", fg: "#FFFFFF", txt: "#0E2C56" } :
                    isNow  ? { bg: "#0A6BCF", fg: "#FFFFFF", txt: "#0A6BCF" } :
                    { bg: "#E1E8F0", fg: "#9CA3AF", txt: "#9CA3AF" };
        return (
          <div key={i} style={t.tlItem}>
            <div style={{ ...t.tlDot, background: tone.bg, ...(isNow ? { boxShadow: "0 0 0 4px rgba(10,107,207,0.20)" } : null) }}>
              {isDone ? <Ic name="check" size={9} color={tone.fg} stroke={3.5} /> : <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 9, color: tone.fg }}>{i + 1}</span>}
            </div>
            {i < STATES.length - 1 && <div style={{ ...t.tlLine, background: i < current ? "#18A66A" : "#E1E8F0" }} />}
            <div style={{ ...t.tlLabel, color: tone.txt, fontWeight: isNow ? 700 : isDone ? 600 : 500 }}>{label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// TECH CARD
// ============================================================
function TechCard({ chatEnabled, callEnabled }) {
  return (
    <div style={t.techCard}>
      <div style={{ ...t.techAv, background: TECH_TONE }}>
        <span>RH</span>
        <div style={t.techVerify}><Ic name="check" size={9} color="#FFFFFF" stroke={3.5} /></div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0E2C56" }}>Ramón Hernández García</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2, fontSize: 11.5, color: "#6B7280" }}>
          <Ic name="star" size={11} color="#F59E0B" />
          <b style={{ color: "#0E2C56", fontWeight: 700 }}>4.8</b>
          <span>(124)</span>
          <span style={t.bullet} />
          <span>Plomería</span>
        </div>
      </div>
      {chatEnabled ? (
        <button style={t.commBtn}>
          <Ic name="message-circle" size={14} color="#0A6BCF" />
        </button>
      ) : (
        <button style={t.commBtnDisabled} title="Chat se habilita al aceptar">
          <Ic name="lock" size={13} color="#9CA3AF" />
        </button>
      )}
      {callEnabled && (
        <button style={t.commBtn}>
          <Ic name="phone" size={14} color="#0A6BCF" />
        </button>
      )}
    </div>
  );
}

// ============================================================
// STATE CARDS (1-6)
// ============================================================

// STATE 1 — REQUESTED
function State1() {
  return (
    <div style={t.wrap}>
      <TrackHeader />
      <div style={t.body}>
        <Timeline current={0} />

        <div style={t.stateCardAmber}>
          <div style={t.bigIconAmber}>
            <Ic name="clock-3" size={30} color="#FFFFFF" />
            <div style={t.iconPulse} />
          </div>
          <div style={t.stateTitle}>Esperando respuesta de Ramón</div>
          <p style={t.stateDesc}>El técnico tiene <b style={{ color: "#0E2C56", fontWeight: 700 }}>30 minutos</b> para aceptar. Te avisaremos cuando responda.</p>

          <div style={t.countdownBox}>
            <div style={t.countdownLabel}>
              <Ic name="timer" size={11} color="#B45309" />
              <span>RESPUESTA EN</span>
            </div>
            <div style={t.countdownTime}>27:42</div>
            <div style={t.countdownTrack}>
              <div style={{ ...t.countdownFill, width: "92%" }} />
            </div>
          </div>
        </div>

        <TechCard chatEnabled={false} />

        <div style={t.detailRow}>
          <Ic name="info" size={11} color="#9CA3AF" />
          <span>El chat se habilita cuando Ramón acepte la solicitud.</span>
        </div>
      </div>

      <div style={t.footer}>
        <button style={t.btnDangerGhost}>
          <Ic name="x" size={14} color="#DC2626" style={{ marginRight: 6 }} />
          Cancelar solicitud
        </button>
        <span style={t.feeNote}>
          <Ic name="badge-check" size={11} color="#18A66A" style={{ marginRight: 4 }} />
          Sin penalización
        </span>
      </div>
    </div>
  );
}

// STATE 2 — ACCEPTED
function State2() {
  return (
    <div style={t.wrap}>
      <TrackHeader />
      <div style={t.body}>
        <Timeline current={1} />

        <div style={t.stateCardGreen}>
          <div style={t.bigIconGreen}>
            <Ic name="check" size={36} color="#FFFFFF" stroke={3} />
          </div>
          <div style={t.stateTitle}>Ramón aceptó tu solicitud</div>
          <p style={t.stateDesc}>Tu servicio está <b style={{ color: "#0E2C56", fontWeight: 700 }}>agendado para hoy a las 3:00 PM</b>.</p>
        </div>

        <TechCard chatEnabled={true} />

        {/* Reminder */}
        <div style={t.reminderCard}>
          <div style={t.reminderIcon}><Ic name="calendar-clock" size={18} color="#0A6BCF" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={t.reminderLabel}>RECORDATORIO</div>
            <div style={t.reminderTitle}>Tu cita es en <b style={{ color: "#0E2C56", fontWeight: 700 }}>4 h 32 min</b></div>
            <p style={t.reminderDesc}>Te avisamos cuando Ramón salga hacia tu dirección.</p>
          </div>
        </div>

        {/* Address summary */}
        <div style={t.miniRow}>
          <div style={t.miniIcon}><Ic name="map-pin" size={13} color="#0A6BCF" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={t.miniLabel}>DIRECCIÓN</div>
            <div style={t.miniVal}>Casa · Av. Patria 1234, Providencia</div>
          </div>
          <a href="#" style={t.miniLink}>Ver</a>
        </div>
        <div style={t.miniRow}>
          <div style={t.miniIcon}><Ic name="wallet" size={13} color="#0A6BCF" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={t.miniLabel}>ESTIMADO</div>
            <div style={t.miniVal}>$450 MXN · Tarjeta •••• 1234</div>
          </div>
        </div>
      </div>

      <div style={t.footer}>
        <button style={t.btnGhostHalf}><Ic name="calendar" size={13} color="#0E2C56" style={{ marginRight: 6 }} />Reagendar</button>
        <button style={t.btnDangerHalf}><Ic name="x" size={13} color="#DC2626" style={{ marginRight: 6 }} />Cancelar (sin costo)</button>
      </div>
    </div>
  );
}

// STATE 3 — EN ROUTE
function State3() {
  return (
    <div style={t.wrap}>
      <TrackHeader />
      <div style={{ ...t.body, paddingBottom: 0, overflow: "hidden", display: "flex", flexDirection: "column", flex: 1 }}>
        <Timeline current={2} />

        {/* ETA banner */}
        <div style={t.etaBanner}>
          <div style={t.etaIcon}>
            <Ic name="truck" size={20} color="#FFFFFF" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontWeight: 600, letterSpacing: ".04em" }}>RAMÓN VIENE EN CAMINO</div>
            <div style={{ fontSize: 14, color: "#FFFFFF", fontWeight: 600, marginTop: 2 }}>Llegará en aproximadamente</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 30, color: "#FFFFFF", lineHeight: 1, letterSpacing: "-0.02em" }}>18</div>
            <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.85)", fontWeight: 600, marginTop: 2 }}>min</div>
          </div>
        </div>

        {/* MAP */}
        <div style={t.mapWrap}>
          <LiveMap />
          <div style={t.mapFloatBubble}>
            <Ic name="route" size={12} color="#0A6BCF" />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <span style={{ fontSize: 10.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>DISTANCIA</span>
              <span style={{ fontSize: 13, color: "#0E2C56", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>3.2 km</span>
            </div>
            <span style={t.bullet} />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <span style={{ fontSize: 10.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>VELOCIDAD</span>
              <span style={{ fontSize: 13, color: "#0E2C56", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>32 km/h</span>
            </div>
          </div>

          {/* Tech bottom card */}
          <div style={t.mapTechCard}>
            <div style={{ ...t.techAv, background: TECH_TONE, width: 46, height: 46, fontSize: 14 }}>
              <span>RH</span>
              <div style={t.techVerify}><Ic name="check" size={9} color="#FFFFFF" stroke={3.5} /></div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0E2C56" }}>Ramón Hernández</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2, fontSize: 11, color: "#6B7280" }}>
                <span style={t.liveDot} />
                <span>En movimiento · Av. Patria</span>
              </div>
            </div>
            <button style={t.commBtnSolid}>
              <Ic name="message-circle" size={14} color="#FFFFFF" />
            </button>
            <button style={{ ...t.commBtnSolid, background: "#18A66A" }}>
              <Ic name="phone" size={14} color="#FFFFFF" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveMap() {
  return (
    <svg viewBox="0 0 390 500" width="100%" height="100%" style={{ display: "block", background: "#DDE7F1" }}>
      <defs>
        <pattern id="liveMapGrid" width="26" height="26" patternUnits="userSpaceOnUse">
          <path d="M26 0 L0 0 0 26" fill="none" stroke="#CCD7E5" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="390" height="500" fill="url(#liveMapGrid)" />

      {/* Zone blob */}
      <path d="M0 80 Q 100 60 220 90 Q 290 130 270 220 Q 200 290 100 280 Q 30 230 0 170 Z" fill="rgba(255,255,255,0.6)" />
      <path d="M210 230 Q 320 220 380 260 Q 380 350 320 380 Q 230 380 200 340 Z" fill="rgba(255,255,255,0.5)" />

      {/* Roads */}
      <path d="M0 240 Q 200 230 390 260" stroke="#FFFFFF" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M180 0 Q 175 250 200 500" stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* Route trace (tech → destination) */}
      <path d="M70 110 Q 130 200 195 240 Q 240 280 220 340"
        stroke="#0A6BCF" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0" />
      <path d="M70 110 Q 130 200 195 240 Q 240 280 220 340"
        stroke="rgba(10,107,207,0.25)" strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Past route (already traveled) */}
      <path d="M30 200 Q 50 150 70 110"
        stroke="rgba(10,107,207,0.3)" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="4 4" />

      {/* Tech pin (moving) */}
      <g transform="translate(70, 110)">
        <circle r="26" fill="rgba(10,107,207,0.20)" />
        <circle r="18" fill="rgba(10,107,207,0.30)" />
        <g>
          <circle r="14" fill="#FFFFFF" stroke="#0A6BCF" strokeWidth="3" />
          <text y="4" textAnchor="middle" fontFamily="Manrope" fontWeight="700" fontSize="10" fill="#0A6BCF">RH</text>
        </g>
        {/* Direction arrow */}
        <path d="M 14,-6 L 22,-4 L 16,2 Z" fill="#0A6BCF" />
      </g>

      {/* Destination pin */}
      <g transform="translate(220, 340)">
        <circle r="22" fill="rgba(220,38,38,0.18)" />
        <path d="M0,-16 a10,12 0 1 1 0.01,0 Z M0,0 L-4,-8 L4,-8 Z" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />
        <circle cy="-8" r="4" fill="#FFFFFF" />
      </g>
      <g transform="translate(220, 360)">
        <rect x="-32" y="0" width="64" height="20" rx="4" fill="rgba(14,44,86,0.85)" />
        <text y="14" textAnchor="middle" fontFamily="Inter" fontWeight="600" fontSize="10" fill="#FFFFFF">Tu casa</text>
      </g>

      {/* Labels */}
      <text x="50" y="50" fontFamily="Inter" fontWeight="600" fontSize="11" fill="#0E2C56" opacity="0.7">Zapopan</text>
      <text x="290" y="320" fontFamily="Inter" fontWeight="600" fontSize="10" fill="#0E2C56" opacity="0.6">Guadalajara</text>
    </svg>
  );
}

// STATE 4 — ON SITE / DIAGNOSING
function State4() {
  return (
    <div style={t.wrap}>
      <TrackHeader />
      <div style={t.body}>
        <Timeline current={3} />

        <div style={t.stateCardBlue}>
          <div style={t.bigIconBlue}>
            <Ic name="map-pin" size={32} color="#FFFFFF" />
          </div>
          <div style={t.stateTitle}>Ramón llegó a tu domicilio</div>
          <p style={t.stateDesc}>Hizo check-in en <b style={{ color: "#0E2C56", fontWeight: 700 }}>Av. Patria 1234</b> hace 4 min.</p>
        </div>

        <TechCard chatEnabled={true} callEnabled />

        {/* Diagnosis card */}
        <div style={t.diagCard}>
          <div style={t.diagHead}>
            <div style={t.diagIcon}>
              <Ic name="stethoscope" size={16} color="#0A6BCF" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0E2C56" }}>Diagnóstico en proceso</div>
              <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 2 }}>Iniciado hace <b style={{ color: "#0E2C56", fontWeight: 700 }}>4 min</b> · típicamente toma 10-15 min</div>
            </div>
          </div>
          <div style={t.diagProgress}>
            <div style={t.diagProgressShimmer} />
          </div>
          <p style={t.diagText}>
            Te <b style={{ color: "#0E2C56", fontWeight: 700 }}>avisaremos por notificación</b> cuando Ramón termine el diagnóstico y haya una cotización para aprobar.
          </p>
          <div style={t.diagCheckpoints}>
            {[
              { label: "Check-in en sitio", done: true, time: "14:58" },
              { label: "Revisión del problema", current: true, time: "ahora" },
              { label: "Cotización para aprobar", done: false },
            ].map((c, i) => (
              <div key={i} style={t.diagCheckRow}>
                <div style={{ ...t.diagCheckDot, background: c.done ? "#18A66A" : c.current ? "#0A6BCF" : "#E1E8F0" }}>
                  {c.done && <Ic name="check" size={8} color="#FFFFFF" stroke={3.5} />}
                </div>
                <span style={{ fontSize: 12, color: c.done ? "#6B7280" : c.current ? "#0E2C56" : "#9CA3AF", fontWeight: c.current ? 600 : 500 }}>{c.label}</span>
                <span style={{ marginLeft: "auto", fontSize: 10.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>{c.time || ""}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={t.footer}>
        <button style={{ ...t.btnGhostHalf, flex: 1 }}><Ic name="message-circle" size={14} color="#0E2C56" style={{ marginRight: 6 }} />Mensajear</button>
      </div>
    </div>
  );
}

// STATE 5 — QUOTE UPDATE (ACTION REQUIRED)
function State5() {
  return (
    <div style={t.wrap}>
      <TrackHeader />
      {/* Sticky action-required banner */}
      <div style={t.actionBanner}>
        <Ic name="alert-triangle" size={16} color="#FFFFFF" />
        <span><b style={{ fontWeight: 700 }}>Acción requerida:</b> aprueba la cotización para que Ramón continúe.</span>
      </div>

      <div style={{ ...t.body, paddingTop: 14 }}>
        <Timeline current={4} />

        {/* Quote card */}
        <div style={t.quoteCard}>
          <div style={t.quoteHead}>
            <div style={t.quoteIcon}><Ic name="receipt-text" size={16} color="#0A6BCF" /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={t.quoteLabel}>COTIZACIÓN ACTUALIZADA</div>
              <div style={t.quoteSub}>Después del diagnóstico de Ramón</div>
            </div>
          </div>

          <div style={t.quoteList}>
            <div style={t.quoteRowBase}>
              <span>Tarifa base · Plomería · Fugas</span>
              <span style={t.quoteAmount}>$450</span>
            </div>
            <div style={t.extrasDivider}>
              <Ic name="plus" size={10} color="#0884B0" />
              <span style={t.extrasLabel}>EXTRAS · 2</span>
              <span style={t.extrasLine} />
            </div>
            <div style={t.quoteExtra}>
              <div style={t.extraThumb}>
                <Ic name="image" size={12} color="#FFFFFF" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0E2C56" }}>Cambio de llave de paso</div>
                <div style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 2 }}>Llave dañada · refacción incluida</div>
              </div>
              <span style={t.quoteAmount}>+$250</span>
            </div>
            <div style={t.quoteExtra}>
              <div style={{ ...t.extraThumb, background: "linear-gradient(135deg,#B45309,#F59E0B)" }}>
                <Ic name="image" size={12} color="#FFFFFF" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0E2C56" }}>Sellado de tubería</div>
                <div style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 2 }}>Para evitar otra fuga · 30 min</div>
              </div>
              <span style={t.quoteAmount}>+$150</span>
            </div>
          </div>

          <div style={t.totalRow}>
            <div>
              <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500 }}>TOTAL A PAGAR</div>
              <div style={{ fontSize: 10, color: "#6B7280", marginTop: 1 }}>al finalizar el servicio</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={t.totalAmount}>$850<span style={t.totalCurr}> MXN</span></div>
              <div style={t.deltaPill}>
                <Ic name="trending-up" size={9} color="#B45309" />
                <span>+$400 vs estimado inicial</span>
              </div>
            </div>
          </div>

          <div style={t.quoteExplain}>
            <div style={{ ...t.techAv, width: 28, height: 28, background: TECH_TONE, fontSize: 10, flexShrink: 0 }}>
              <span>RH</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, color: "#0E2C56", lineHeight: 1.5, margin: 0 }}>
                <b style={{ fontWeight: 700 }}>"</b>La fuga es por una llave dañada. La tubería necesita sellado para evitar otra fuga.<b style={{ fontWeight: 700 }}>"</b>
              </p>
              <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>Ramón · hace 1 min</div>
            </div>
          </div>
        </div>

        <button style={t.approveBtn}>
          <Ic name="check" size={16} color="#FFFFFF" stroke={3} style={{ marginRight: 8 }} />
          Aprobar cotización · $850 MXN
        </button>
        <div style={t.altActions}>
          <button style={t.btnGhostFull}><Ic name="message-circle" size={14} color="#0A6BCF" style={{ marginRight: 6 }} />Hablar con Ramón antes</button>
          <button style={t.btnRejectFull}>
            <Ic name="x" size={13} color="#DC2626" style={{ marginRight: 6 }} />
            <span style={{ flex: 1 }}>Rechazar y cancelar</span>
            <span style={{ fontSize: 9.5, color: "#9CA3AF", fontWeight: 500 }}>aplica cargo</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// STATE 6a — IN PROGRESS
function State6a() {
  return (
    <div style={t.wrap}>
      <TrackHeader />
      <div style={t.body}>
        <Timeline current={5} />

        <div style={t.stateCardBlue}>
          <div style={t.bigIconBlue}>
            <Ic name="wrench" size={30} color="#FFFFFF" />
            <div style={t.iconPulseBlue} />
          </div>
          <div style={t.stateTitle}>Ramón está trabajando</div>
          <p style={t.stateDesc}>Está realizando el trabajo. Te avisamos cuando termine.</p>
        </div>

        <TechCard chatEnabled callEnabled />

        {/* Timer & evidence */}
        <div style={t.workCard}>
          <div style={t.workHead}>
            <div style={t.workIcon}><Ic name="timer" size={16} color="#0A6BCF" /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={t.workLabel}>TIEMPO TRABAJADO</div>
              <div style={t.workTime}>1 h 12 m</div>
            </div>
            <span style={t.workLive}>
              <span style={t.liveDot} />
              en curso
            </span>
          </div>
          <div style={t.workEvidence}>
            <div style={{ fontSize: 10.5, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8, fontWeight: 600 }}>EVIDENCIA DEL INICIO</div>
            <div style={t.evidenceGrid}>
              <div style={{ ...t.evidenceTile, background: "linear-gradient(135deg,#0A6BCF,#0E2C56)" }}>
                <Ic name="image" size={16} color="#FFFFFF" />
                <span style={t.evidenceTag}>Antes</span>
              </div>
              <div style={{ ...t.evidenceTile, background: "linear-gradient(135deg,#B45309,#F59E0B)" }}>
                <Ic name="image" size={16} color="#FFFFFF" />
                <span style={t.evidenceTag}>Llave dañada</span>
              </div>
              <div style={{ ...t.evidenceTile, background: "#F8FBFF", border: "1px dashed #E1E8F0" }}>
                <Ic name="plus" size={14} color="#9CA3AF" />
                <span style={{ fontSize: 9.5, color: "#9CA3AF", marginTop: 4 }}>Final</span>
              </div>
            </div>
          </div>
        </div>

        <div style={t.detailRow}>
          <Ic name="shield-check" size={11} color="#18A66A" />
          <span>Tu pago de $850 MXN está protegido — solo se libera cuando confirmes que el trabajo terminó bien.</span>
        </div>
      </div>
    </div>
  );
}

// STATE 6b — COMPLETED, AWAITING PAYMENT
function State6b() {
  return (
    <div style={t.wrap}>
      <TrackHeader />
      <div style={t.body}>
        <Timeline current={6} />

        <div style={t.stateCardGreen}>
          <div style={t.bigIconGreen}>
            <Ic name="check" size={42} color="#FFFFFF" stroke={3} />
          </div>
          <div style={t.stateTitle}>¡Trabajo completado!</div>
          <p style={t.stateDesc}>Ramón terminó el servicio. Revisa la evidencia y procede al pago.</p>
        </div>

        {/* Evidence gallery */}
        <div style={t.evidenceCard}>
          <div style={t.cardHeadRow}>
            <Ic name="image" size={13} color="#0A6BCF" />
            <span style={t.cardHeadLabel}>EVIDENCIA FINAL · 4 fotos</span>
            <a href="#" style={t.miniLink}>Ampliar</a>
          </div>
          <div style={t.evidenceGrid4}>
            <div style={{ ...t.evidenceTile, background: "linear-gradient(135deg,#0A6BCF,#18C1FF)" }}>
              <Ic name="image" size={16} color="#FFFFFF" />
              <span style={t.evidenceTag}>Antes</span>
            </div>
            <div style={{ ...t.evidenceTile, background: "linear-gradient(135deg,#18A66A,#4ED896)" }}>
              <Ic name="image" size={16} color="#FFFFFF" />
              <span style={t.evidenceTag}>Después</span>
            </div>
            <div style={{ ...t.evidenceTile, background: "linear-gradient(135deg,#0E2C56,#0894EA)" }}>
              <Ic name="image" size={16} color="#FFFFFF" />
              <span style={t.evidenceTag}>Llave nueva</span>
            </div>
            <div style={{ ...t.evidenceTile, background: "linear-gradient(135deg,#0884B0,#18C1FF)" }}>
              <Ic name="image" size={16} color="#FFFFFF" />
              <span style={t.evidenceTag}>Sellado</span>
            </div>
          </div>
        </div>

        {/* Payment summary */}
        <div style={t.payCard}>
          <div style={t.payHeadRow}>
            <span style={{ fontSize: 12, color: "#6B7280" }}>Total a pagar</span>
            <span style={t.payAmount}>$850<span style={t.totalCurr}> MXN</span></span>
          </div>
          <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 14 }}>Tarifa base $450 + Cambio de llave $250 + Sellado $150</div>

          <div style={{ fontSize: 10.5, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, marginBottom: 8 }}>MÉTODO DE PAGO</div>
          <div style={t.payMethods}>
            <div style={{ ...t.payMethod, ...t.payMethodSel }}>
              <Ic name="credit-card" size={15} color="#FFFFFF" />
              <span>Visa •••• 1234</span>
              <Ic name="check" size={11} color="#FFFFFF" style={{ marginLeft: "auto" }} stroke={3.5} />
            </div>
            <div style={t.payMethodAlt}>
              <div style={{ ...t.payMethodAltIcon, background: "rgba(180,83,9,0.10)", color: "#B45309" }}>
                <Ic name="store" size={14} color="#B45309" />
              </div>
              <span>OXXO Pay</span>
            </div>
            <div style={t.payMethodAlt}>
              <div style={{ ...t.payMethodAltIcon, background: "rgba(24,193,255,0.18)", color: "#0884B0" }}>
                <Ic name="wallet" size={14} color="#0884B0" />
              </div>
              <span>Mercado Pago</span>
            </div>
            <div style={t.payMethodAlt}>
              <div style={{ ...t.payMethodAltIcon, background: "rgba(24,166,106,0.18)", color: "#18A66A" }}>
                <Ic name="banknote" size={14} color="#18A66A" />
              </div>
              <span>Efectivo · al técnico</span>
            </div>
          </div>
        </div>
      </div>
      <div style={t.footer}>
        <button style={{ ...t.approveBtn, width: "100%", marginTop: 0 }}>
          <Ic name="lock" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />
          Proceder al pago · $850 MXN
        </button>
      </div>
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
        <div style={{ width: 390, height: 844, position: "relative", overflow: "hidden", background: "#F8FBFF" }}>{children}</div>
      </IOSDevice>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="track" title="Seguimiento del servicio" subtitle="6 estados clave">
        <DCArtboard id="s1" label="01 · Solicitado · esperando" width={438} height={892}>
          <PhoneFrame><State1 /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="s2" label="02 · Aceptado · agendado" width={438} height={892}>
          <PhoneFrame><State2 /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="s3" label="03 · En camino · mapa en vivo" width={438} height={892}>
          <PhoneFrame><State3 /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="s4" label="04 · En sitio · diagnóstico" width={438} height={892}>
          <PhoneFrame><State4 /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="s5" label="05 · Cotización · aprobación" width={438} height={892}>
          <PhoneFrame><State5 /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="s6a" label="06a · En ejecución" width={438} height={892}>
          <PhoneFrame><State6a /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="s6b" label="06b · Completado · pago" width={438} height={892}>
          <PhoneFrame><State6b /></PhoneFrame>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// ============================================================
// STYLES
// ============================================================
const t = {
  wrap: { width: "100%", height: "100%", background: "#F8FBFF", display: "flex", flexDirection: "column", position: "relative" },

  // Header
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "50px 16px 12px", background: "#FFFFFF", borderBottom: "1px solid #F0F4F9", flexShrink: 0 },
  iconBtn: { width: 38, height: 38, borderRadius: 12, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  headerLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#9CA3AF", letterSpacing: ".1em", fontWeight: 700, textTransform: "uppercase" },
  headerId: { fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#0E2C56", fontWeight: 700, marginTop: 2 },

  // Body
  body: { flex: 1, overflowY: "auto", padding: "16px 18px 100px" },

  // Timeline (horizontal)
  timeline: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "8px 4px 18px", position: "relative" },
  tlItem: { display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative" },
  tlDot: { width: 20, height: 20, borderRadius: "50%", display: "grid", placeItems: "center", zIndex: 1 },
  tlLine: { position: "absolute", top: 9, left: "50%", width: "100%", height: 2, zIndex: 0 },
  tlLabel: { marginTop: 8, fontSize: 9.5, textAlign: "center", lineHeight: 1.2, maxWidth: 60 },

  // State cards
  stateCardAmber: { padding: 20, background: "linear-gradient(160deg, rgba(245,158,11,0.10), rgba(245,158,11,0.05))", border: "1.5px solid rgba(245,158,11,0.35)", borderRadius: 16, textAlign: "center", marginBottom: 16 },
  stateCardGreen: { padding: 20, background: "linear-gradient(160deg, rgba(24,166,106,0.10), rgba(78,216,150,0.05))", border: "1.5px solid rgba(24,166,106,0.35)", borderRadius: 16, textAlign: "center", marginBottom: 16 },
  stateCardBlue:  { padding: 20, background: "linear-gradient(160deg, rgba(10,107,207,0.08), rgba(24,193,255,0.05))", border: "1.5px solid rgba(10,107,207,0.30)", borderRadius: 16, textAlign: "center", marginBottom: 16 },
  bigIconAmber: { position: "relative", width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg, #F59E0B, #FBBF24)", display: "grid", placeItems: "center", margin: "0 auto 14px", boxShadow: "0 8px 18px rgba(245,158,11,0.30)" },
  bigIconGreen: { width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg, #18A66A, #4ED896)", display: "grid", placeItems: "center", margin: "0 auto 14px", boxShadow: "0 8px 18px rgba(24,166,106,0.30)" },
  bigIconBlue:  { position: "relative", width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg, #0A6BCF, #18C1FF)", display: "grid", placeItems: "center", margin: "0 auto 14px", boxShadow: "0 8px 18px rgba(10,107,207,0.30)" },
  iconPulse: { position: "absolute", inset: -10, borderRadius: "50%", border: "2px solid rgba(245,158,11,0.5)", animation: "tk-pulse 1.6s infinite" },
  iconPulseBlue: { position: "absolute", inset: -10, borderRadius: "50%", border: "2px solid rgba(10,107,207,0.5)", animation: "tk-pulse 1.6s infinite" },
  stateTitle: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 20, color: "#0E2C56", margin: 0, letterSpacing: "-0.01em" },
  stateDesc: { fontSize: 13, color: "#6B7280", margin: "8px 0 0", lineHeight: 1.5 },

  // Countdown
  countdownBox: { marginTop: 18, padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12 },
  countdownLabel: { display: "flex", alignItems: "center", gap: 5, justifyContent: "center", fontSize: 9.5, color: "#B45309", letterSpacing: ".08em", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  countdownTime: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 40, color: "#B45309", letterSpacing: "-0.02em", lineHeight: 1, marginTop: 4 },
  countdownTrack: { height: 4, background: "rgba(245,158,11,0.18)", borderRadius: 999, overflow: "hidden", marginTop: 12 },
  countdownFill: { height: "100%", background: "linear-gradient(90deg, #F59E0B, #FBBF24)", borderRadius: 999 },

  // Tech card
  techCard: { display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, marginBottom: 12 },
  techAv: { position: "relative", width: 42, height: 42, borderRadius: "50%", display: "grid", placeItems: "center", color: "#FFFFFF", fontWeight: 600, fontFamily: "'Manrope', sans-serif", fontSize: 12, flexShrink: 0 },
  techVerify: { position: "absolute", right: -2, bottom: -2, width: 15, height: 15, borderRadius: "50%", background: "#18A66A", display: "grid", placeItems: "center", border: "2px solid #FFFFFF" },
  commBtn: { width: 38, height: 38, borderRadius: 10, background: "rgba(10,107,207,0.08)", border: "1px solid rgba(10,107,207,0.18)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  commBtnDisabled: { width: 38, height: 38, borderRadius: 10, background: "#EEF3F8", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", flexShrink: 0, cursor: "not-allowed" },
  commBtnSolid: { width: 36, height: 36, borderRadius: 10, background: "#0A6BCF", border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0, boxShadow: "0 2px 6px rgba(10,107,207,0.25)" },
  bullet: { width: 2, height: 2, borderRadius: "50%", background: "#9CA3AF", margin: "0 4px" },

  detailRow: { display: "flex", alignItems: "center", gap: 6, padding: "10px 12px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 10, fontSize: 11.5, color: "#6B7280", lineHeight: 1.4 },

  // Footer
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, background: "#FFFFFF", borderTop: "1px solid #E1E8F0", padding: "14px 16px 30px", display: "flex", gap: 10, alignItems: "center", boxShadow: "0 -4px 12px rgba(14,44,86,0.06)", zIndex: 5 },
  btnDangerGhost: { background: "#FFFFFF", color: "#DC2626", border: "1px solid #DC2626", borderRadius: 12, padding: "12px 16px", fontWeight: 600, fontSize: 13.5, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  feeNote: { display: "flex", alignItems: "center", marginLeft: "auto", fontSize: 11.5, color: "#6B7280" },
  btnGhostHalf: { flex: 1, background: "#FFFFFF", color: "#0E2C56", border: "1px solid #E1E8F0", borderRadius: 12, padding: "12px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  btnDangerHalf: { flex: 1, background: "#FFFFFF", color: "#DC2626", border: "1px solid #DC2626", borderRadius: 12, padding: "12px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },

  // Reminder
  reminderCard: { display: "flex", gap: 12, padding: 14, background: "linear-gradient(135deg, rgba(10,107,207,0.06), rgba(24,193,255,0.06))", border: "1px solid rgba(10,107,207,0.22)", borderRadius: 14, marginBottom: 12 },
  reminderIcon: { width: 36, height: 36, borderRadius: 10, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  reminderLabel: { fontSize: 9.5, color: "#0A6BCF", letterSpacing: ".08em", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  reminderTitle: { fontSize: 14, color: "#0E2C56", marginTop: 2 },
  reminderDesc: { fontSize: 11.5, color: "#6B7280", margin: "4px 0 0", lineHeight: 1.4 },

  miniRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10, marginBottom: 6 },
  miniIcon: { width: 28, height: 28, borderRadius: 7, background: "rgba(10,107,207,0.08)", display: "grid", placeItems: "center", flexShrink: 0 },
  miniLabel: { fontSize: 9.5, color: "#9CA3AF", letterSpacing: ".06em", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  miniVal: { fontSize: 12.5, color: "#0E2C56", fontWeight: 500, marginTop: 1 },
  miniLink: { color: "#0A6BCF", textDecoration: "none", fontSize: 11.5, fontWeight: 600 },

  // ETA banner
  etaBanner: { display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "linear-gradient(135deg, #F59E0B, #FBBF24)", borderRadius: 16, color: "#FFFFFF", boxShadow: "0 6px 16px rgba(245,158,11,0.30)", marginBottom: 14 },
  etaIcon: { width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.18)", display: "grid", placeItems: "center" },

  // Map
  mapWrap: { position: "relative", flex: 1, minHeight: 360, borderRadius: 16, overflow: "hidden", border: "1px solid #E1E8F0", boxShadow: "0 4px 14px rgba(14,44,86,0.08)", marginBottom: 18 },
  mapFloatBubble: { position: "absolute", top: 12, left: 12, right: 12, display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(255,255,255,0.96)", border: "1px solid #E1E8F0", borderRadius: 10, backdropFilter: "blur(6px)", boxShadow: "0 4px 12px rgba(14,44,86,0.12)" },
  mapTechCard: { position: "absolute", left: 12, right: 12, bottom: 12, display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#FFFFFF", borderRadius: 14, boxShadow: "0 -4px 16px rgba(14,44,86,0.10), 0 0 0 1px rgba(14,44,86,0.05)" },
  liveDot: { display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#18A66A", boxShadow: "0 0 0 3px rgba(24,166,106,0.18)" },

  // Diagnosis (state 4)
  diagCard: { padding: 16, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, marginTop: 4 },
  diagHead: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
  diagIcon: { width: 34, height: 34, borderRadius: 10, background: "rgba(10,107,207,0.08)", display: "grid", placeItems: "center", flexShrink: 0 },
  diagProgress: { height: 4, background: "#EEF3F8", borderRadius: 999, overflow: "hidden", position: "relative" },
  diagProgressShimmer: { position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, #0A6BCF, transparent)", animation: "tk-shimmer 1.8s infinite", width: "50%" },
  diagText: { fontSize: 12, color: "#6B7280", lineHeight: 1.5, margin: "10px 0 14px" },
  diagCheckpoints: { paddingTop: 12, borderTop: "1px solid #F0F4F9", display: "flex", flexDirection: "column", gap: 8 },
  diagCheckRow: { display: "flex", alignItems: "center", gap: 10 },
  diagCheckDot: { width: 16, height: 16, borderRadius: "50%", display: "grid", placeItems: "center", flexShrink: 0 },

  // Action banner (state 5)
  actionBanner: { display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "linear-gradient(135deg, #F59E0B, #B45309)", color: "#FFFFFF", fontSize: 12, lineHeight: 1.4, flexShrink: 0 },

  // Quote (state 5)
  quoteCard: { padding: 16, background: "#FFFFFF", border: "1.5px solid #0A6BCF", borderRadius: 16, marginBottom: 12, boxShadow: "0 4px 14px rgba(10,107,207,0.10)" },
  quoteHead: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
  quoteIcon: { width: 32, height: 32, borderRadius: 9, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  quoteLabel: { fontSize: 9.5, color: "#0A6BCF", letterSpacing: ".08em", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  quoteSub: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  quoteList: { display: "flex", flexDirection: "column", gap: 0 },
  quoteRowBase: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F0F4F9", fontSize: 13, color: "#0E2C56", fontWeight: 500 },
  quoteAmount: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 14, color: "#0E2C56" },
  extrasDivider: { display: "flex", alignItems: "center", gap: 6, padding: "10px 0 6px" },
  extrasLabel: { fontSize: 9.5, color: "#0884B0", letterSpacing: ".08em", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  extrasLine: { flex: 1, height: 1, background: "#E1E8F0" },
  quoteExtra: { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #F0F4F9" },
  extraThumb: { width: 32, height: 32, borderRadius: 7, background: "linear-gradient(135deg, #0A6BCF, #18C1FF)", display: "grid", placeItems: "center", flexShrink: 0 },
  totalRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 14px", background: "linear-gradient(135deg, rgba(10,107,207,0.06), rgba(24,193,255,0.06))", borderRadius: 10, marginTop: 12 },
  totalAmount: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 28, color: "#0A6BCF", letterSpacing: "-0.02em", lineHeight: 1 },
  totalCurr: { fontSize: 12, color: "#9CA3AF", fontWeight: 500, fontFamily: "'JetBrains Mono', monospace" },
  deltaPill: { display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 8px", background: "#FEF3DC", color: "#B45309", borderRadius: 999, fontSize: 9.5, fontWeight: 600, marginTop: 6 },
  quoteExplain: { display: "flex", gap: 10, padding: "12px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 10, marginTop: 14 },

  approveBtn: { width: "100%", height: 56, background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(10,107,207,0.30)", marginTop: 6, marginBottom: 10 },
  altActions: { display: "flex", flexDirection: "column", gap: 6 },
  btnGhostFull: { width: "100%", padding: "12px", background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #0A6BCF", borderRadius: 12, fontWeight: 600, fontSize: 13.5, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  btnRejectFull: { width: "100%", padding: "10px 12px", background: "#FFFFFF", color: "#DC2626", border: "1px solid #E1E8F0", borderRadius: 12, fontSize: 12.5, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center" },

  // Work (state 6a)
  workCard: { padding: 16, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, marginBottom: 12 },
  workHead: { display: "flex", alignItems: "center", gap: 10, paddingBottom: 12, borderBottom: "1px solid #F0F4F9", marginBottom: 12 },
  workIcon: { width: 32, height: 32, borderRadius: 9, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  workLabel: { fontSize: 9.5, color: "#9CA3AF", letterSpacing: ".08em", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  workTime: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 22, color: "#0E2C56", letterSpacing: "-0.01em", lineHeight: 1, marginTop: 3 },
  workLive: { display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", background: "#E5F7EE", color: "#18A66A", borderRadius: 999, fontSize: 10, fontWeight: 700 },
  workEvidence: {},
  evidenceGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 },
  evidenceGrid4: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 },
  evidenceTile: { position: "relative", aspectRatio: "1.1", borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  evidenceTag: { position: "absolute", left: 6, bottom: 6, padding: "1px 6px", background: "rgba(14,44,86,0.65)", color: "#FFFFFF", fontSize: 9, fontWeight: 600, borderRadius: 4 },

  // State 6b evidence card + pay
  evidenceCard: { padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, marginBottom: 12 },
  cardHeadRow: { display: "flex", alignItems: "center", gap: 6, marginBottom: 10 },
  cardHeadLabel: { fontSize: 10.5, color: "#9CA3AF", letterSpacing: ".06em", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", flex: 1 },
  payCard: { padding: 16, background: "#FFFFFF", border: "1.5px solid #0A6BCF", borderRadius: 16, boxShadow: "0 4px 14px rgba(10,107,207,0.08)" },
  payHeadRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 },
  payAmount: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 28, color: "#0A6BCF", letterSpacing: "-0.02em" },
  payMethods: { display: "flex", flexDirection: "column", gap: 6 },
  payMethod: { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#0A6BCF", color: "#FFFFFF", borderRadius: 12, fontSize: 13, fontWeight: 600 },
  payMethodSel: {},
  payMethodAlt: { display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12, fontSize: 13, color: "#0E2C56", fontWeight: 500 },
  payMethodAltIcon: { width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0 },
};

const kf = document.createElement("style");
kf.textContent = `
  @keyframes tk-pulse { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.08); opacity: 0; } }
  @keyframes tk-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
`;
document.head.appendChild(kf);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
