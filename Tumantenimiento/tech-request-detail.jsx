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

// =====================================================================
// HEADER + TIMER BANNER
// =====================================================================
function DetailHeader({ id = "#SVC-2851" }) {
  return (
    <div style={d.header}>
      <button style={d.iconBtn}><Ic name="arrow-left" size={17} color="#0E2C56" /></button>
      <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
        <div style={d.headerLabel}>SOLICITUD</div>
        <div style={d.headerId}>{id}</div>
      </div>
      <button style={d.iconBtn}><Ic name="more-vertical" size={17} color="#0E2C56" /></button>
    </div>
  );
}

function TimerBanner({ minutes = 27, seconds = 42 }) {
  const totalSec = minutes * 60 + seconds;
  const pct = (totalSec / (30 * 60)) * 100;
  return (
    <div style={d.timerBanner}>
      <div style={d.timerLeft}>
        <Ic name="timer" size={13} color="#FFFFFF" />
        <span style={d.timerLabel}>RESPONDE EN</span>
      </div>
      <span style={d.timerVal}>{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</span>
      <div style={d.timerTrack}>
        <div style={{ ...d.timerFill, width: `${pct}%` }} />
      </div>
    </div>
  );
}

// =====================================================================
// SECTION HEADER
// =====================================================================
function Section({ n, label, sub, right, children, style }) {
  return (
    <div style={{ ...d.section, ...style }}>
      <div style={d.sectionHead}>
        <div style={d.sectionNum}>{n}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={d.sectionLabel}>{label}</div>
          {sub && <div style={d.sectionSub}>{sub}</div>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

// =====================================================================
// SCREEN 01 — DETAIL
// =====================================================================
function DetailScreen() {
  return (
    <div style={d.wrap}>
      <DetailHeader />
      <TimerBanner minutes={27} seconds={42} />

      <div style={d.body}>
        {/* Section 1 — Client */}
        <Section n="1" label="CLIENTE">
          <div style={d.clientCard}>
            <div style={d.clientTopRow}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={d.clientAv}>
                  <span>MR</span>
                </div>
                <div style={d.clientVerify}>
                  <Ic name="check" size={10} color="#FFFFFF" stroke={3.5} />
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={d.clientName}>María Rodríguez Gómez</div>
                <div style={d.clientMeta}>
                  <SmallStars value={5} />
                  <b style={{ color: "#0E2C56", fontWeight: 700, fontSize: 11.5 }}>4.9</b>
                  <span style={{ color: "#6B7280", fontSize: 11 }}>como cliente</span>
                </div>
              </div>
              <span style={d.verifChip}>
                <Ic name="badge-check" size={10} color="#0F8A56" />
                <span>Verificado</span>
              </span>
            </div>

            <div style={d.clientStatsRow}>
              <div style={d.clientStat}>
                <div style={d.clientStatVal}>8</div>
                <div style={d.clientStatLabel}>servicios</div>
              </div>
              <div style={d.clientStatDiv} />
              <div style={d.clientStat}>
                <div style={{ ...d.clientStatVal, color: "#0F8A56" }}>0%</div>
                <div style={d.clientStatLabel}>cancelaciones</div>
              </div>
              <div style={d.clientStatDiv} />
              <div style={d.clientStat}>
                <div style={d.clientStatVal}>2 años</div>
                <div style={d.clientStatLabel}>en la plataforma</div>
              </div>
            </div>

            <div style={d.clientTagsRow}>
              <span style={d.clientTagRecurrent}>
                <Ic name="repeat-2" size={10} color="#0884B0" />
                <span>Cliente recurrente</span>
              </span>
              <span style={d.clientTagFast}>
                <Ic name="zap" size={10} color="#B45309" />
                <span>Paga rápido</span>
              </span>
            </div>
          </div>
        </Section>

        {/* Section 2 — Service */}
        <Section n="2" label="SERVICIO SOLICITADO"
          right={
            <span style={d.urgencyChip}>
              <Ic name="alert-circle" size={10} color="#B45309" />
              <span>URGENTE</span>
            </span>
          }
        >
          <div style={d.catRow}>
            <div style={d.catIcon}>
              <Ic name="wrench" size={16} color="#0A6BCF" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={d.catName}>Plomería</div>
              <div style={d.catSub}>Subcategoría · <b style={{ color: "#0E2C56", fontWeight: 700 }}>Fugas</b></div>
            </div>
          </div>

          {/* Description */}
          <div style={d.descCard}>
            <div style={d.descHead}>
              <Ic name="quote" size={12} color="#0A6BCF" />
              <span style={d.descLabel}>DESCRIPCIÓN DEL PROBLEMA</span>
            </div>
            <p style={d.descText}>
              "Tengo una fuga debajo del lavabo del baño desde ayer. El agua gotea constantemente y mojó el piso. La llave del lavabo se afloja sola cuando la abro."
            </p>
          </div>

          {/* Photo gallery */}
          <div style={d.galleryLabel}>FOTOS DEL PROBLEMA · 5</div>
          <div style={d.galleryRow}>
            {[
              { tone: "linear-gradient(135deg,#0A6BCF,#0894EA)" },
              { tone: "linear-gradient(135deg,#B45309,#F59E0B)" },
              { tone: "linear-gradient(135deg,#0E2C56,#0894EA)" },
              { tone: "linear-gradient(135deg,#7C3AED,#A78BFA)" },
              { tone: "linear-gradient(135deg,#0884B0,#18C1FF)" },
            ].map((g, idx) => (
              <div key={idx} style={{ ...d.galleryTile, background: g.tone }}>
                <Ic name="image" size={16} color="rgba(255,255,255,0.85)" />
                <div style={d.galleryIdx}>{idx + 1}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Section 3 — Location */}
        <Section n="3" label="UBICACIÓN">
          <div style={d.mapCard}>
            <MiniMap />
            <div style={d.mapFloatBubble}>
              <Ic name="route" size={11} color="#0A6BCF" />
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                <span style={{ fontSize: 9.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>DISTANCIA</span>
                <span style={{ fontSize: 12, color: "#0E2C56", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>2.3 km</span>
              </div>
              <span style={d.mapBullet} />
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                <span style={{ fontSize: 9.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>TIEMPO</span>
                <span style={{ fontSize: 12, color: "#0E2C56", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>12 min</span>
              </div>
            </div>
          </div>

          <div style={d.addrCard}>
            <div style={d.addrRow}>
              <Ic name="map-pin" size={13} color="#0A6BCF" />
              <span style={d.addrText}>Av. Patria 1234, Int. 5B · Providencia, Zapopan, Jal. <b style={{ color: "#0E2C56", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>45160</b></span>
            </div>
            <div style={d.refRow}>
              <Ic name="navigation" size={12} color="#B45309" />
              <div style={{ flex: 1 }}>
                <div style={d.refLabel}>REFERENCIA</div>
                <div style={d.refText}>Casa color blanco, frente al parque. Portón eléctrico descompuesto, María abre manualmente.</div>
              </div>
            </div>
          </div>
        </Section>

        {/* Section 4 — Date/Time */}
        <Section n="4" label="FECHA Y HORA">
          <div style={d.dateCard}>
            <div style={d.dateCal}>
              <div style={d.dateCalMonth}>MAY</div>
              <div style={d.dateCalDay}>19</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={d.dateTitle}>Hoy · Lunes</div>
              <div style={d.dateRange}>
                <Ic name="clock" size={12} color="#0A6BCF" />
                <span>3:00 PM <span style={{ color: "#9CA3AF" }}>—</span> 7:00 PM</span>
                <span style={d.dateWindow}>4h ventana</span>
              </div>
            </div>
            <div style={d.dateInPill}>
              <span style={d.dateInLabel}>EN</span>
              <span style={d.dateInVal}>4h 23m</span>
            </div>
          </div>
        </Section>

        {/* Section 5 — Quote (HIGHLIGHT) */}
        <div style={d.quoteSection}>
          <div style={d.quoteSectionHead}>
            <div style={{ ...d.sectionNum, background: "#FFFFFF", color: "#0A6BCF" }}>5</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...d.sectionLabel, color: "#FFFFFF" }}>COTIZACIÓN INICIAL</div>
              <div style={{ ...d.sectionSub, color: "rgba(255,255,255,0.78)" }}>Tarifa base + tu ganancia neta</div>
            </div>
            <Ic name="receipt-text" size={16} color="rgba(255,255,255,0.85)" />
          </div>

          <div style={d.quoteRows}>
            <div style={d.quoteRow}>
              <span style={d.quoteRowLabel}>Tarifa base</span>
              <span style={d.quoteRowVal}>$450.00</span>
            </div>
            <div style={d.quoteRow}>
              <span style={d.quoteRowLabel}>
                Comisión plataforma <span style={d.quoteCommission}>15%</span>
              </span>
              <span style={{ ...d.quoteRowVal, color: "rgba(255,255,255,0.78)" }}>−$67.50</span>
            </div>
          </div>

          <div style={d.quoteEarnRow}>
            <div>
              <div style={d.quoteEarnLabel}>TU GANANCIA NETA</div>
              <div style={d.quoteEarnSubLabel}>Se libera al completar</div>
            </div>
            <div style={d.quoteEarnVal}>$382<span style={d.quoteEarnDecimal}>.50</span><span style={d.quoteEarnCurr}>MXN</span></div>
          </div>

          <div style={d.quoteExtraNote}>
            <Ic name="plus" size={11} color="#FFFFFF" />
            <span>Podrás agregar <b style={{ fontWeight: 800 }}>extras</b> después del diagnóstico in situ.</span>
          </div>
        </div>

        {/* Section 6 — Additional info */}
        <Section n="6" label="INFORMACIÓN ADICIONAL">
          <div style={d.infoRow}>
            <div style={d.infoIcon}>
              <Ic name="credit-card" size={13} color="#0A6BCF" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={d.infoLabel}>Método de pago</div>
              <div style={d.infoVal}>
                <div style={d.payCardMark}>VISA</div>
                <span>•••• 1234</span>
              </div>
            </div>
            <span style={d.protectChip}>
              <Ic name="shield-check" size={10} color="#0F8A56" />
              <span>Pre-autorizado</span>
            </span>
          </div>
          <div style={d.infoRow}>
            <div style={{ ...d.infoIcon, background: "rgba(24,166,106,0.12)" }}>
              <Ic name="lock" size={13} color="#0F8A56" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={d.infoLabel}>Liberación de pago</div>
              <div style={d.infoVal}>Al completar el servicio · transferencia 24-48 h</div>
            </div>
          </div>
        </Section>
      </div>

      {/* Footer buttons */}
      <div style={d.footer}>
        <button style={d.rejectBtn}>
          <Ic name="x" size={14} color="#DC2626" style={{ marginRight: 5 }} />
          Rechazar
        </button>
        <button style={d.acceptBtn}>
          <Ic name="check" size={16} color="#FFFFFF" stroke={2.8} style={{ marginRight: 8 }} />
          <span>Aceptar solicitud</span>
          <span style={d.acceptEarn}>+$382.50</span>
        </button>
      </div>
    </div>
  );
}

function MiniMap() {
  return (
    <svg viewBox="0 0 360 160" width="100%" height="100%" style={{ display: "block", background: "#DDE7F1" }}>
      <defs>
        <pattern id="rmGrid" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M22 0 L0 0 0 22" fill="none" stroke="#CCD7E5" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="360" height="160" fill="url(#rmGrid)" />
      {/* Zones */}
      <path d="M 20 30 Q 150 20 220 50 Q 250 90 200 130 Q 80 140 30 110 Q 0 70 20 30 Z" fill="rgba(180,210,180,0.30)" />
      {/* Roads */}
      <path d="M0 80 Q 180 70 360 90" stroke="#FFFFFF" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M180 0 Q 178 80 200 160" stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M0 40 Q 180 35 360 50" stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity="0.7" strokeLinecap="round" />
      {/* Route */}
      <path d="M 60 130 Q 130 90 200 70 Q 250 60 280 50"
        stroke="#0A6BCF" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeDasharray="0" />
      <path d="M 60 130 Q 130 90 200 70 Q 250 60 280 50"
        stroke="rgba(10,107,207,0.25)" strokeWidth="11" fill="none" strokeLinecap="round" />
      {/* Tech pin (start) */}
      <g transform="translate(60, 130)">
        <circle r="11" fill="#FFFFFF" stroke="#0A6BCF" strokeWidth="2.5" />
        <text y="3.5" textAnchor="middle" fontFamily="Manrope" fontWeight="800" fontSize="9" fill="#0A6BCF">RH</text>
      </g>
      <g transform="translate(60, 144)">
        <rect x="-18" y="0" width="36" height="14" rx="3" fill="rgba(14,44,86,0.85)" />
        <text y="10" textAnchor="middle" fontFamily="Inter" fontWeight="600" fontSize="8" fill="#FFFFFF">TÚ</text>
      </g>
      {/* Destination */}
      <g transform="translate(280, 50)">
        <circle r="16" fill="rgba(220,38,38,0.18)" />
        <path d="M0,-12 a8,9 0 1 1 0.01,0 Z M0,0 L-3,-6 L3,-6 Z" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />
        <circle cy="-6" r="3" fill="#FFFFFF" />
      </g>
      <g transform="translate(280, 70)">
        <rect x="-26" y="0" width="52" height="14" rx="3" fill="rgba(14,44,86,0.85)" />
        <text y="10" textAnchor="middle" fontFamily="Inter" fontWeight="600" fontSize="8" fill="#FFFFFF">María R.</text>
      </g>
      {/* Labels */}
      <text x="30" y="20" fontFamily="Inter" fontWeight="600" fontSize="9" fill="#0E2C56" opacity="0.55">Zapopan</text>
      <text x="300" y="20" fontFamily="Inter" fontWeight="600" fontSize="9" fill="#0E2C56" opacity="0.55">Providencia</text>
    </svg>
  );
}

function SmallStars({ value, total = 5, size = 11 }) {
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
// SCREEN 02 — REJECT BOTTOM SHEET (over detail)
// =====================================================================
function RejectScreen() {
  return (
    <div style={d.wrap}>
      {/* Dimmed detail behind */}
      <div style={{ filter: "blur(2px)", opacity: 0.5, pointerEvents: "none", position: "absolute", inset: 0 }}>
        <DetailHeader />
        <TimerBanner minutes={27} seconds={11} />
        <div style={{ padding: "16px 18px" }}>
          <div style={d.clientCardSmall}>
            <div style={d.clientAv}>MR</div>
            <div>
              <div style={d.clientName}>María Rodríguez</div>
              <div style={{ fontSize: 11, color: "#6B7280" }}>Plomería · Fugas · $450</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrim */}
      <div style={d.scrim} />

      {/* Bottom sheet */}
      <div style={d.sheet}>
        <div style={d.sheetHandle} />

        <div style={d.sheetHeadCol}>
          <div style={d.sheetIconBig}>
            <Ic name="x" size={20} color="#DC2626" stroke={2.5} />
          </div>
          <div style={d.sheetTitle}>¿Por qué rechazas?</div>
          <div style={d.sheetSub}>
            Tu respuesta nos ayuda a mejorar y a no enviarte solicitudes que no te interesen.
          </div>
        </div>

        {/* Reasons */}
        <div style={d.reasonList}>
          <ReasonRow icon="clock"     label="No estoy disponible ese horario" />
          <ReasonRow icon="map-pin"   label="Está fuera de mi zona de cobertura" />
          <ReasonRow icon="wrench"    label="No atiendo ese tipo de servicio" />
          <ReasonRow icon="tag"       label="El precio es muy bajo" selected />
          <ReasonRow icon="more-horizontal" label="Otro motivo" expanded />
        </div>

        {/* Optional textarea (when "Otro motivo" expanded — visual stub) */}
        <div style={d.reasonOther}>
          <textarea
            placeholder="Cuéntanos brevemente (opcional)"
            style={d.reasonTextarea}
            rows={2}
          />
          <div style={d.reasonOtherFoot}>
            <span style={d.reasonOtherHint}>El cliente no verá tu motivo.</span>
            <span style={d.reasonOtherCount}>0/200</span>
          </div>
        </div>

        {/* Warning */}
        <div style={d.warnRow}>
          <div style={d.warnIcon}>
            <Ic name="alert-triangle" size={13} color="#B45309" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={d.warnTitle}>Cuida tu tasa de aceptación</div>
            <div style={d.warnText}>
              Has rechazado <b style={{ color: "#7B3F00", fontWeight: 700 }}>2 de tus últimas 10</b> solicitudes. Tasa actual: <b style={{ color: "#7B3F00", fontWeight: 700 }}>80%</b>. Por debajo del 70% reducimos tu visibilidad.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={d.sheetFooter}>
          <button style={d.sheetCancel}>Volver</button>
          <button style={d.sheetConfirm}>
            <Ic name="x" size={14} color="#FFFFFF" stroke={2.6} style={{ marginRight: 6 }} />
            Confirmar rechazo
          </button>
        </div>
      </div>
    </div>
  );
}

function ReasonRow({ icon, label, selected, expanded }) {
  return (
    <div style={{ ...d.reasonRow, ...(selected ? d.reasonRowSel : null) }}>
      <div style={{ ...d.reasonIconBox, ...(selected ? d.reasonIconBoxSel : null) }}>
        <Ic name={icon} size={13} color={selected ? "#FFFFFF" : "#6B7280"} stroke={2.2} />
      </div>
      <span style={{ ...d.reasonLabel, color: selected ? "#0E2C56" : "#6B7280", fontWeight: selected ? 700 : 500 }}>
        {label}
      </span>
      <div style={{ ...d.radio, ...(selected ? d.radioSel : null) }}>
        {selected && <div style={d.radioDot} />}
      </div>
    </div>
  );
}

// =====================================================================
// SCREEN 03 — ACCEPT CONFIRMATION
// =====================================================================
function AcceptScreen() {
  return (
    <div style={d.wrap}>
      <div style={d.acceptBg}>
        {/* Confetti */}
        {[
          { top: 80, left: 30, c: "#F59E0B" }, { top: 130, left: 320, c: "#0A6BCF" },
          { top: 180, left: 50,  c: "#18C1FF" }, { top: 160, left: 280, c: "#18A66A" },
          { top: 240, left: 350, c: "#FBBF24" }, { top: 220, left: 20,  c: "#0894EA" },
          { top: 290, left: 360, c: "#4ED896" }, { top: 320, left: 10,  c: "#F59E0B" },
        ].map((c, idx) => (
          <div key={idx} style={{ position: "absolute", width: 7, height: 7, borderRadius: 1.5, background: c.c, top: c.top, left: c.left, transform: `rotate(${idx * 23}deg)`, opacity: 0.85, zIndex: 1 }} />
        ))}
      </div>

      <div style={d.acceptBody}>
        {/* Check ring */}
        <div style={d.acceptIconWrap}>
          <div style={d.acceptRing1} />
          <div style={d.acceptRing2} />
          <div style={d.acceptCircle}>
            <Ic name="check" size={56} color="#FFFFFF" stroke={3.5} />
          </div>
        </div>

        <div style={d.acceptTitle}>¡Solicitud aceptada!</div>
        <div style={d.acceptSub}>
          El chat con <b style={{ color: "#0E2C56", fontWeight: 700 }}>María</b> ya está habilitado. Te recordaremos antes de la cita.
        </div>

        {/* Mini summary */}
        <div style={d.acceptCard}>
          <div style={d.acceptCardTop}>
            <div style={d.acceptCardAv}>MR</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={d.acceptCardName}>María Rodríguez</div>
              <div style={d.acceptCardMeta}>
                <Ic name="wrench" size={10} color="#0A6BCF" />
                <span>Plomería · Fugas</span>
                <span style={d.mapBullet} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>#SVC-2851</span>
              </div>
            </div>
          </div>
          <div style={d.acceptCardDivider} />
          <div style={d.acceptCardRows}>
            <div style={d.acceptCardRow}>
              <div style={d.acceptRowIcon}>
                <Ic name="calendar" size={13} color="#0A6BCF" />
              </div>
              <span style={d.acceptRowLabel}>Hoy</span>
              <span style={d.acceptRowVal}>3:00 — 7:00 PM</span>
            </div>
            <div style={d.acceptCardRow}>
              <div style={d.acceptRowIcon}>
                <Ic name="map-pin" size={13} color="#0A6BCF" />
              </div>
              <span style={d.acceptRowLabel}>Distancia</span>
              <span style={d.acceptRowVal}>2.3 km · 12 min</span>
            </div>
            <div style={d.acceptCardRow}>
              <div style={{ ...d.acceptRowIcon, background: "rgba(24,166,106,0.12)" }}>
                <Ic name="wallet" size={13} color="#0F8A56" />
              </div>
              <span style={d.acceptRowLabel}>Tu ganancia</span>
              <span style={{ ...d.acceptRowVal, color: "#0F8A56", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 14 }}>$382.50 MXN</span>
            </div>
          </div>
        </div>

        {/* Next steps */}
        <div style={d.acceptNextSteps}>
          <div style={d.acceptNextLabel}>SIGUIENTES PASOS</div>
          <div style={d.nextStepRow}>
            <div style={d.nextStepDotNow}>1</div>
            <div style={{ flex: 1 }}>
              <div style={d.nextStepTitle}>Coordina detalles por chat</div>
              <div style={d.nextStepSub}>Pregunta lo que necesites antes de salir</div>
            </div>
          </div>
          <div style={d.nextStepLine} />
          <div style={d.nextStepRow}>
            <div style={d.nextStepDot}>2</div>
            <div style={{ flex: 1 }}>
              <div style={d.nextStepTitle}>Confirma 30 min antes</div>
              <div style={d.nextStepSub}>Te enviaremos recordatorio</div>
            </div>
          </div>
          <div style={d.nextStepLine} />
          <div style={d.nextStepRow}>
            <div style={d.nextStepDot}>3</div>
            <div style={{ flex: 1 }}>
              <div style={d.nextStepTitle}>Marca "En camino" desde la app</div>
              <div style={d.nextStepSub}>María verá tu ETA en vivo</div>
            </div>
          </div>
        </div>
      </div>

      <div style={d.acceptFooter}>
        <button style={d.acceptPrimaryBtn}>
          <Ic name="message-circle" size={15} color="#FFFFFF" style={{ marginRight: 8 }} />
          Abrir chat con María
        </button>
        <button style={d.acceptGhostBtn}>
          <Ic name="calendar" size={13} color="#0A6BCF" style={{ marginRight: 6 }} />
          Ver en mi agenda
        </button>
      </div>
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
      <DCSection id="req" title="C5 · Detalle de solicitud" subtitle="3 pantallas · Técnico evalúa una solicitud entrante">
        <DCArtboard id="detail" label="01 · Detalle de solicitud" width={438} height={892}>
          <PhoneFrame><DetailScreen /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="reject" label="02 · Modal de rechazo (bottom sheet)" width={438} height={892}>
          <PhoneFrame><RejectScreen /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="accept" label="03 · Confirmación de aceptación" width={438} height={892}>
          <PhoneFrame><AcceptScreen /></PhoneFrame>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// =====================================================================
// STYLES
// =====================================================================
const d = {
  wrap: { width: "100%", height: "100%", background: "#F8FBFF", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" },

  // ===== Header =====
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "50px 16px 12px", background: "#FFFFFF", borderBottom: "1px solid #F0F4F9", flexShrink: 0, gap: 10 },
  iconBtn: { width: 38, height: 38, borderRadius: 11, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  headerLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#9CA3AF", letterSpacing: ".1em", fontWeight: 700, textTransform: "uppercase" },
  headerId: { fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#0E2C56", fontWeight: 700, marginTop: 2 },

  // ===== Timer banner =====
  timerBanner: { display: "flex", alignItems: "center", gap: 8, padding: "10px 16px 12px", background: "linear-gradient(135deg, #F59E0B, #FBBF24)", color: "#FFFFFF", flexShrink: 0, position: "relative" },
  timerLeft: { display: "flex", alignItems: "center", gap: 5 },
  timerLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".08em", fontWeight: 700, opacity: 0.92 },
  timerVal: { marginLeft: 6, fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: ".02em" },
  timerTrack: { flex: 1, marginLeft: 12, height: 4, background: "rgba(255,255,255,0.25)", borderRadius: 999, overflow: "hidden" },
  timerFill: { height: "100%", borderRadius: 999, background: "rgba(255,255,255,0.95)" },

  body: { flex: 1, overflowY: "auto", padding: "0 0 110px" },

  // ===== Section =====
  section: { padding: "18px 16px 6px" },
  sectionHead: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  sectionNum: { width: 22, height: 22, borderRadius: "50%", background: "#0A6BCF", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 11, flexShrink: 0 },
  sectionLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#0A6BCF", letterSpacing: ".1em", fontWeight: 700 },
  sectionSub: { fontSize: 10.5, color: "#9CA3AF", marginTop: 1 },

  urgencyChip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", background: "rgba(245,158,11,0.14)", color: "#B45309", borderRadius: 999, fontSize: 9.5, fontWeight: 800, letterSpacing: ".06em", fontFamily: "'JetBrains Mono', monospace" },

  // ===== Client card =====
  clientCard: { padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14 },
  clientCardSmall: { display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12 },
  clientTopRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
  clientAv: { position: "relative", width: 50, height: 50, borderRadius: "50%", background: "linear-gradient(135deg,#F59E0B,#FBBF24)", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em", flexShrink: 0 },
  clientVerify: { position: "absolute", right: -2, bottom: -2, width: 18, height: 18, borderRadius: "50%", background: "#18A66A", border: "2.5px solid #FFFFFF", display: "grid", placeItems: "center" },
  clientName: { fontSize: 15, fontWeight: 700, color: "#0E2C56" },
  clientMeta: { display: "flex", alignItems: "center", gap: 5, marginTop: 3 },
  verifChip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", background: "rgba(24,166,106,0.12)", color: "#0F8A56", borderRadius: 999, fontSize: 10, fontWeight: 700, flexShrink: 0 },

  clientStatsRow: { display: "flex", alignItems: "stretch", padding: "10px 0", background: "#F8FBFF", borderRadius: 10, marginBottom: 10 },
  clientStat: { flex: 1, textAlign: "center" },
  clientStatVal: { fontFamily: "'Manrope', sans-serif", fontSize: 14, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.01em", lineHeight: 1 },
  clientStatLabel: { fontSize: 9.5, color: "#9CA3AF", marginTop: 3, textTransform: "uppercase", letterSpacing: ".04em", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
  clientStatDiv: { width: 1, background: "#E1E8F0", margin: "0 6px" },

  clientTagsRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  clientTagRecurrent: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", background: "rgba(24,193,255,0.14)", color: "#0884B0", borderRadius: 999, fontSize: 10.5, fontWeight: 700 },
  clientTagFast: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", background: "rgba(245,158,11,0.14)", color: "#B45309", borderRadius: 999, fontSize: 10.5, fontWeight: 700 },

  // ===== Service =====
  catRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12, marginBottom: 10 },
  catIcon: { width: 36, height: 36, borderRadius: 10, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  catName: { fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.01em" },
  catSub: { fontSize: 11.5, color: "#6B7280", marginTop: 1 },

  descCard: { padding: "12px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12, marginBottom: 12 },
  descHead: { display: "flex", alignItems: "center", gap: 5, marginBottom: 8 },
  descLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#0A6BCF", letterSpacing: ".08em", fontWeight: 700 },
  descText: { fontSize: 13, color: "#0E2C56", lineHeight: 1.5, margin: 0, fontStyle: "italic" },

  galleryLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#9CA3AF", letterSpacing: ".08em", fontWeight: 700, marginBottom: 6 },
  galleryRow: { display: "flex", gap: 6, overflowX: "auto" },
  galleryTile: { position: "relative", width: 70, height: 70, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0 },
  galleryIdx: { position: "absolute", top: 4, right: 4, padding: "1px 5px", background: "rgba(14,44,86,0.65)", color: "#FFFFFF", borderRadius: 4, fontSize: 9, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },

  // ===== Map =====
  mapCard: { position: "relative", height: 160, borderRadius: 12, overflow: "hidden", border: "1px solid #E1E8F0", marginBottom: 10 },
  mapFloatBubble: { position: "absolute", top: 8, left: 8, display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "rgba(255,255,255,0.96)", border: "1px solid #E1E8F0", borderRadius: 10, boxShadow: "0 4px 10px rgba(14,44,86,0.12)", backdropFilter: "blur(6px)" },
  mapBullet: { width: 2, height: 2, borderRadius: "50%", background: "#9CA3AF", margin: "0 2px" },

  addrCard: { padding: "12px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12 },
  addrRow: { display: "flex", gap: 8, alignItems: "flex-start" },
  addrText: { fontSize: 12.5, color: "#0E2C56", lineHeight: 1.5, fontWeight: 500 },
  refRow: { display: "flex", gap: 8, alignItems: "flex-start", marginTop: 10, paddingTop: 10, borderTop: "1px solid #F0F4F9" },
  refLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#B45309", letterSpacing: ".08em", fontWeight: 700 },
  refText: { fontSize: 11.5, color: "#6B7280", marginTop: 3, lineHeight: 1.5 },

  // ===== Date =====
  dateCard: { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12 },
  dateCal: { width: 52, height: 56, borderRadius: 10, background: "linear-gradient(135deg, #0A6BCF, #0894EA)", color: "#FFFFFF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 10px rgba(10,107,207,0.30)" },
  dateCalMonth: { fontSize: 9, fontWeight: 700, letterSpacing: ".08em", fontFamily: "'JetBrains Mono', monospace", opacity: 0.85 },
  dateCalDay: { fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 },
  dateTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 15, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.01em" },
  dateRange: { display: "inline-flex", alignItems: "center", gap: 5, marginTop: 4, fontSize: 12, color: "#0E2C56", fontWeight: 500 },
  dateWindow: { marginLeft: 4, padding: "1px 6px", background: "rgba(10,107,207,0.10)", color: "#0A6BCF", borderRadius: 4, fontSize: 9.5, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  dateInPill: { display: "flex", flexDirection: "column", alignItems: "center", padding: "5px 10px", background: "rgba(245,158,11,0.14)", borderRadius: 10, flexShrink: 0 },
  dateInLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "#B45309", letterSpacing: ".08em", fontWeight: 700 },
  dateInVal: { fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 800, color: "#B45309", letterSpacing: "-0.01em", marginTop: 1 },

  // ===== Quote (highlight) =====
  quoteSection: { margin: "18px 16px 12px", padding: 16, background: "linear-gradient(135deg, #0A6BCF 0%, #0894EA 70%, #18C1FF 100%)", borderRadius: 18, color: "#FFFFFF", boxShadow: "0 12px 28px rgba(10,107,207,0.30)", position: "relative", overflow: "hidden" },
  quoteSectionHead: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },

  quoteRows: { display: "flex", flexDirection: "column", gap: 0 },
  quoteRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.15)", fontSize: 13 },
  quoteRowLabel: { color: "rgba(255,255,255,0.90)", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6 },
  quoteCommission: { padding: "1px 6px", background: "rgba(255,255,255,0.18)", borderRadius: 4, fontSize: 9.5, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" },
  quoteRowVal: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 14, color: "#FFFFFF" },

  quoteEarnRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 14px", background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 12, marginTop: 12 },
  quoteEarnLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.85)", letterSpacing: ".1em", fontWeight: 700 },
  quoteEarnSubLabel: { fontSize: 11, color: "rgba(255,255,255,0.70)", marginTop: 2 },
  quoteEarnVal: { fontFamily: "'Manrope', sans-serif", fontSize: 28, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em", lineHeight: 1 },
  quoteEarnDecimal: { fontSize: 18, opacity: 0.85 },
  quoteEarnCurr: { fontSize: 11, opacity: 0.65, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, marginLeft: 4 },

  quoteExtraNote: { display: "flex", alignItems: "center", gap: 6, marginTop: 12, padding: "8px 11px", background: "rgba(255,255,255,0.10)", border: "1px dashed rgba(255,255,255,0.30)", borderRadius: 10, fontSize: 11.5, color: "rgba(255,255,255,0.90)", lineHeight: 1.4 },

  // ===== Info rows =====
  infoRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12, marginBottom: 6 },
  infoIcon: { width: 30, height: 30, borderRadius: 8, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  infoLabel: { fontSize: 10.5, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
  infoVal: { display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#0E2C56", fontWeight: 600, marginTop: 2 },
  payCardMark: { background: "linear-gradient(135deg,#1A1F71,#2942AC)", color: "#FFFFFF", padding: "2px 6px", borderRadius: 4, fontFamily: "'Manrope', sans-serif", fontSize: 9, fontWeight: 800, fontStyle: "italic", letterSpacing: ".06em" },
  protectChip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", background: "rgba(24,166,106,0.12)", color: "#0F8A56", borderRadius: 999, fontSize: 9.5, fontWeight: 700, flexShrink: 0 },

  // ===== Footer =====
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, background: "#FFFFFF", borderTop: "1px solid #E1E8F0", padding: "14px 16px 30px", display: "flex", gap: 10, alignItems: "center", boxShadow: "0 -4px 12px rgba(14,44,86,0.06)", zIndex: 5 },
  rejectBtn: { flex: "0 0 38%", padding: "13px", background: "#FFFFFF", color: "#DC2626", border: "1.5px solid #DC2626", borderRadius: 14, fontWeight: 700, fontSize: 13.5, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  acceptBtn: { flex: 1, padding: "13px", background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(10,107,207,0.35)" },
  acceptEarn: { marginLeft: 8, padding: "2px 7px", background: "rgba(255,255,255,0.20)", borderRadius: 999, fontSize: 10.5, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },

  // ===== Reject sheet =====
  scrim: { position: "absolute", inset: 0, background: "rgba(14,44,86,0.55)", zIndex: 8 },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, background: "#FFFFFF", borderRadius: "20px 20px 0 0", padding: "10px 18px 30px", boxShadow: "0 -12px 30px rgba(14,44,86,0.20)", zIndex: 10, maxHeight: "85%", overflowY: "auto" },
  sheetHandle: { width: 40, height: 4, background: "#E1E8F0", borderRadius: 999, margin: "0 auto 14px" },

  sheetHeadCol: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 16 },
  sheetIconBig: { width: 48, height: 48, borderRadius: "50%", background: "rgba(220,38,38,0.10)", border: "1.5px solid rgba(220,38,38,0.30)", display: "grid", placeItems: "center", marginBottom: 10 },
  sheetTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 19, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em" },
  sheetSub: { fontSize: 12.5, color: "#6B7280", marginTop: 6, lineHeight: 1.5, maxWidth: 300 },

  reasonList: { display: "flex", flexDirection: "column", gap: 6 },
  reasonRow: { display: "flex", alignItems: "center", gap: 10, padding: "12px 12px", background: "#FFFFFF", border: "1.5px solid #E1E8F0", borderRadius: 12, cursor: "pointer" },
  reasonRowSel: { borderColor: "#0A6BCF", background: "rgba(10,107,207,0.04)" },
  reasonIconBox: { width: 30, height: 30, borderRadius: 8, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", flexShrink: 0 },
  reasonIconBoxSel: { background: "#0A6BCF", borderColor: "#0A6BCF" },
  reasonLabel: { flex: 1, fontSize: 13 },
  radio: { width: 20, height: 20, borderRadius: "50%", border: "2px solid #E1E8F0", display: "grid", placeItems: "center", flexShrink: 0 },
  radioSel: { borderColor: "#0A6BCF" },
  radioDot: { width: 9, height: 9, borderRadius: "50%", background: "#0A6BCF" },

  reasonOther: { marginTop: 8, padding: "10px 12px", background: "#F8FBFF", border: "1px dashed #C8D4E0", borderRadius: 10 },
  reasonTextarea: { width: "100%", minHeight: 50, border: "none", outline: "none", resize: "none", background: "transparent", fontSize: 12.5, color: "#0E2C56", fontFamily: "'Inter', sans-serif", lineHeight: 1.5 },
  reasonOtherFoot: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 6, marginTop: 6, borderTop: "1px solid #E1E8F0" },
  reasonOtherHint: { fontSize: 10.5, color: "#9CA3AF" },
  reasonOtherCount: { fontSize: 10.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },

  warnRow: { display: "flex", gap: 10, padding: "12px 14px", background: "rgba(245,158,11,0.08)", border: "1.5px solid rgba(245,158,11,0.30)", borderRadius: 12, marginTop: 14 },
  warnIcon: { width: 28, height: 28, borderRadius: 8, background: "rgba(245,158,11,0.15)", display: "grid", placeItems: "center", flexShrink: 0 },
  warnTitle: { fontSize: 12, fontWeight: 700, color: "#7B3F00" },
  warnText: { fontSize: 11, color: "#7B3F00", marginTop: 4, lineHeight: 1.5 },

  sheetFooter: { display: "flex", gap: 10, marginTop: 18 },
  sheetCancel: { flex: 1, padding: "13px", background: "transparent", color: "#6B7280", border: "1px solid #E1E8F0", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer" },
  sheetConfirm: { flex: 2, padding: "13px", background: "#DC2626", color: "#FFFFFF", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 13.5, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(220,38,38,0.30)" },

  // ===== Accept screen =====
  acceptBg: { position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 18%, #E5F7EE 0%, #F8FBFF 60%)", pointerEvents: "none" },
  acceptBody: { position: "relative", flex: 1, padding: "60px 22px 230px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", overflowY: "auto", zIndex: 2 },

  acceptIconWrap: { position: "relative", width: 150, height: 150, display: "grid", placeItems: "center", marginBottom: 10 },
  acceptRing1: { position: "absolute", inset: -16, borderRadius: "50%", border: "2px solid rgba(24,166,106,0.20)" },
  acceptRing2: { position: "absolute", inset: -32, borderRadius: "50%", border: "2px solid rgba(24,166,106,0.10)" },
  acceptCircle: { width: 120, height: 120, borderRadius: "50%", background: "linear-gradient(135deg,#18A66A,#4ED896)", display: "grid", placeItems: "center", boxShadow: "0 16px 36px rgba(24,166,106,0.40)" },

  acceptTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 26, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em", marginTop: 18 },
  acceptSub: { fontSize: 13.5, color: "#6B7280", marginTop: 8, lineHeight: 1.5, maxWidth: 300 },

  acceptCard: { width: "100%", marginTop: 18, padding: 14, background: "#FFFFFF", border: "1.5px solid rgba(24,166,106,0.30)", borderRadius: 16, textAlign: "left", boxShadow: "0 6px 16px rgba(24,166,106,0.10)" },
  acceptCardTop: { display: "flex", alignItems: "center", gap: 12 },
  acceptCardAv: { width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#F59E0B,#FBBF24)", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 14, flexShrink: 0 },
  acceptCardName: { fontSize: 14, fontWeight: 700, color: "#0E2C56" },
  acceptCardMeta: { display: "inline-flex", alignItems: "center", gap: 4, marginTop: 3, fontSize: 11, color: "#6B7280" },
  acceptCardDivider: { height: 1, background: "#F0F4F9", margin: "12px 0" },
  acceptCardRows: { display: "flex", flexDirection: "column", gap: 8 },
  acceptCardRow: { display: "flex", alignItems: "center", gap: 10 },
  acceptRowIcon: { width: 26, height: 26, borderRadius: 7, background: "rgba(10,107,207,0.08)", display: "grid", placeItems: "center", flexShrink: 0 },
  acceptRowLabel: { fontSize: 12, color: "#6B7280", fontWeight: 500, flex: 1 },
  acceptRowVal: { fontSize: 12.5, color: "#0E2C56", fontWeight: 700 },

  acceptNextSteps: { width: "100%", marginTop: 14, padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, textAlign: "left" },
  acceptNextLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF", letterSpacing: ".1em", fontWeight: 700, marginBottom: 10 },
  nextStepRow: { display: "flex", alignItems: "flex-start", gap: 10 },
  nextStepDotNow: { width: 22, height: 22, borderRadius: "50%", background: "#0A6BCF", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 11, flexShrink: 0, boxShadow: "0 0 0 4px rgba(10,107,207,0.20)" },
  nextStepDot: { width: 22, height: 22, borderRadius: "50%", background: "#EEF3F8", color: "#9CA3AF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 11, flexShrink: 0 },
  nextStepLine: { width: 2, height: 12, background: "#E1E8F0", marginLeft: 10, borderRadius: 1 },
  nextStepTitle: { fontSize: 12.5, fontWeight: 700, color: "#0E2C56" },
  nextStepSub: { fontSize: 11, color: "#6B7280", marginTop: 2, lineHeight: 1.4 },

  acceptFooter: { position: "absolute", left: 0, right: 0, bottom: 0, background: "#FFFFFF", borderTop: "1px solid #E1E8F0", padding: "14px 16px 30px", display: "flex", flexDirection: "column", gap: 8, boxShadow: "0 -4px 12px rgba(14,44,86,0.06)", zIndex: 5 },
  acceptPrimaryBtn: { width: "100%", height: 54, background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(10,107,207,0.30)" },
  acceptGhostBtn: { width: "100%", padding: "12px", background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #E1E8F0", borderRadius: 12, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
