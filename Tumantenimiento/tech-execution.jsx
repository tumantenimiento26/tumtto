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

const CLIENT_TONE = "linear-gradient(135deg,#F59E0B,#FBBF24)";

// =====================================================================
// SHARED — Header + Progress strip + Status banner
// =====================================================================
const STATES = [
  { id: "accepted", label: "Aceptado", icon: "check"        },
  { id: "enroute",  label: "En camino", icon: "truck"        },
  { id: "onsite",   label: "En sitio",  icon: "map-pin"      },
  { id: "diag",     label: "Cotización",icon: "receipt-text" },
  { id: "working",  label: "Trabajo",   icon: "wrench"       },
  { id: "closing",  label: "Cierre",    icon: "camera"       },
  { id: "done",     label: "Cobro",     icon: "wallet"       },
];

function ServiceHeader({ id = "#SVC-2851", current = 0 }) {
  return (
    <div style={ex.header}>
      <button style={ex.iconBtn}><Ic name="arrow-left" size={17} color="#0E2C56" /></button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={ex.headerLabel}>SERVICIO ACTIVO</div>
        <div style={ex.headerId}>{id}</div>
      </div>
      <button style={ex.iconBtn}><Ic name="more-vertical" size={17} color="#0E2C56" /></button>
    </div>
  );
}

function ProgressStrip({ current }) {
  return (
    <div style={ex.progress}>
      {STATES.map((s, idx) => {
        const done = idx < current;
        const now = idx === current;
        const tone = done ? { bg: "#18A66A", fg: "#FFFFFF", line: "#18A66A" }
                   : now  ? { bg: "#0A6BCF", fg: "#FFFFFF", line: "#E1E8F0" }
                          : { bg: "#FFFFFF", fg: "#9CA3AF", line: "#E1E8F0" };
        return (
          <div key={s.id} style={ex.progressItem}>
            <div style={{
              ...ex.progressDot,
              background: tone.bg,
              color: tone.fg,
              border: !done && !now ? "1.5px solid #E1E8F0" : "none",
              ...(now ? { boxShadow: "0 0 0 4px rgba(10,107,207,0.18)" } : null),
            }}>
              {done ? <Ic name="check" size={9} color="#FFFFFF" stroke={3.5} /> : <Ic name={s.icon} size={9} color={tone.fg} stroke={2.4} />}
            </div>
            {idx < STATES.length - 1 && (
              <div style={{ ...ex.progressLine, background: idx < current ? "#18A66A" : "#E1E8F0" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ClientStrip({ chatEnabled = true, callEnabled = false, compact = false }) {
  return (
    <div style={{ ...ex.clientStrip, ...(compact ? ex.clientStripCompact : null) }}>
      <div style={ex.clientAvWrap}>
        <div style={ex.clientAv}>MR</div>
        <div style={ex.clientVerify}>
          <Ic name="check" size={8} color="#FFFFFF" stroke={3.5} />
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={ex.clientName}>María Rodríguez</div>
        <div style={ex.clientMeta}>
          <Ic name="star" size={9} color="#F59E0B" />
          <b style={{ color: "#0E2C56", fontWeight: 700 }}>4.9</b>
          <span style={ex.bullet} />
          <span>8 servicios contigo</span>
        </div>
      </div>
      {chatEnabled && (
        <button style={ex.commBtn}>
          <Ic name="message-circle" size={14} color="#0A6BCF" />
        </button>
      )}
      {callEnabled && (
        <button style={{ ...ex.commBtn, background: "#18A66A", borderColor: "#18A66A" }}>
          <Ic name="phone" size={14} color="#FFFFFF" />
        </button>
      )}
    </div>
  );
}

// =====================================================================
// SCREEN 01 — ACEPTADO · PRE-CITA
// =====================================================================
function S1Pre() {
  return (
    <div style={ex.wrap}>
      <ServiceHeader current={0} />
      <ProgressStrip current={0} />

      <div style={ex.body}>
        {/* Countdown to appt */}
        <div style={ex.bigCountdownCard}>
          <div style={ex.countdownIconRing}>
            <Ic name="calendar-clock" size={26} color="#FFFFFF" />
          </div>
          <div style={ex.countdownLabel}>FALTAN PARA TU CITA</div>
          <div style={ex.countdownTime}>
            <span style={ex.countdownUnit}>4<span style={ex.countdownUnitLabel}>h</span></span>
            <span style={ex.countdownColon}>:</span>
            <span style={ex.countdownUnit}>23<span style={ex.countdownUnitLabel}>m</span></span>
          </div>
          <div style={ex.countdownSub}>
            Hoy, lunes <b style={{ color: "#0E2C56", fontWeight: 700 }}>3:00 — 7:00 PM</b>
          </div>
          <div style={ex.countdownTrack}>
            <div style={ex.countdownFill} />
          </div>
        </div>

        <ClientStrip chatEnabled={true} />

        {/* Service summary */}
        <SectionLabel n="A" label="RESUMEN DEL SERVICIO" />
        <div style={ex.svcCard}>
          <div style={ex.svcTopRow}>
            <div style={ex.svcIcon}>
              <Ic name="wrench" size={15} color="#0A6BCF" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={ex.svcCat}>Plomería · Fugas</div>
              <div style={ex.svcCatSub}>Solicitud aceptada hace 6h</div>
            </div>
            <span style={ex.svcUrgentChip}>
              <Ic name="alert-circle" size={9} color="#B45309" />
              <span>URGENTE</span>
            </span>
          </div>
          <p style={ex.svcDesc}>
            "Tengo una fuga debajo del lavabo del baño desde ayer. El agua gotea y mojó el piso. La llave se afloja sola."
          </p>
          <div style={ex.svcPhotosRow}>
            {[
              "linear-gradient(135deg,#0A6BCF,#0894EA)",
              "linear-gradient(135deg,#B45309,#F59E0B)",
              "linear-gradient(135deg,#0E2C56,#0894EA)",
              "linear-gradient(135deg,#7C3AED,#A78BFA)",
            ].map((t, i) => (
              <div key={i} style={{ ...ex.svcPhoto, background: t }}>
                <Ic name="image" size={13} color="rgba(255,255,255,0.85)" />
              </div>
            ))}
            <div style={ex.svcPhotosMore}>+1</div>
          </div>
        </div>

        {/* Address */}
        <SectionLabel n="B" label="UBICACIÓN" right={<a href="#" style={ex.miniLink}>Ver mapa</a>} />
        <div style={ex.addrCard}>
          <div style={ex.addrIconNav}>
            <Ic name="navigation" size={15} color="#FFFFFF" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={ex.addrLine}>Av. Patria 1234, Int. 5B</div>
            <div style={ex.addrLine2}>Providencia, Zapopan · 45160</div>
            <div style={ex.addrRefRow}>
              <Ic name="info" size={10} color="#B45309" />
              <span>Casa blanca frente al parque. Portón eléctrico descompuesto — María abre manualmente.</span>
            </div>
          </div>
          <div style={ex.addrDistPill}>
            <div style={ex.addrDist}>2.3<span style={ex.addrDistUnit}>km</span></div>
            <div style={ex.addrDistTime}>~12 min</div>
          </div>
        </div>

        {/* Earnings preview */}
        <SectionLabel n="C" label="TU GANANCIA" />
        <div style={ex.earnCard}>
          <div style={ex.earnRow}>
            <span style={ex.earnLabel}>Tarifa base</span>
            <span style={ex.earnVal}>$450</span>
          </div>
          <div style={ex.earnRow}>
            <span style={ex.earnLabel}>Comisión plataforma (15%)</span>
            <span style={{ ...ex.earnVal, color: "#9CA3AF" }}>−$67.50</span>
          </div>
          <div style={ex.earnRowFinal}>
            <div>
              <div style={ex.earnFinalLabel}>GANANCIA NETA</div>
              <div style={ex.earnFinalSub}>Se libera al completar</div>
            </div>
            <div style={ex.earnFinalVal}>$382<span style={ex.earnFinalDec}>.50</span></div>
          </div>
          <div style={ex.earnExtraNote}>
            <Ic name="plus" size={11} color="#0A6BCF" />
            <span>Podrás añadir <b style={{ color: "#0E2C56", fontWeight: 700 }}>extras</b> tras el diagnóstico in situ.</span>
          </div>
        </div>

        {/* Cancel warning */}
        <button style={ex.cancelLink}>
          <Ic name="x" size={13} color="#DC2626" />
          <div style={{ textAlign: "left", flex: 1 }}>
            <div style={ex.cancelTitle}>Cancelar servicio</div>
            <div style={ex.cancelSub}>Cancelar afecta tu reputación y tasa de aceptación</div>
          </div>
          <Ic name="chevron-right" size={13} color="#DC2626" />
        </button>
      </div>

      <div style={ex.footer}>
        <button style={{ ...ex.primaryBtn, ...ex.primaryBtnDisabled }}>
          <Ic name="lock" size={14} color="#9CA3AF" style={{ marginRight: 8 }} />
          <span>Marcar "En camino"</span>
          <span style={ex.disabledHint}>2h antes</span>
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// SCREEN 02 — EN CAMINO
// =====================================================================
function S2EnRoute() {
  return (
    <div style={ex.wrap}>
      <ServiceHeader current={1} />
      <ProgressStrip current={1} />

      <div style={ex.bodyMap}>
        {/* ETA banner */}
        <div style={ex.etaBanner}>
          <div style={ex.etaIconWrap}>
            <Ic name="truck" size={20} color="#FFFFFF" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={ex.etaLabel}>EN CAMINO · ETA</div>
            <div style={ex.etaTitle}>14:48 <span style={ex.etaIn}>· en 18 min</span></div>
          </div>
          <div style={ex.etaSpeedBox}>
            <div style={ex.etaSpeedVal}>32</div>
            <div style={ex.etaSpeedLabel}>km/h</div>
          </div>
        </div>

        {/* MAP */}
        <div style={ex.mapWrap}>
          <BigMap />
          {/* Top metrics bubble */}
          <div style={ex.mapMetricsBar}>
            <div style={ex.mapMetric}>
              <Ic name="route" size={11} color="#0A6BCF" />
              <div>
                <div style={ex.mapMetricLabel}>DISTANCIA</div>
                <div style={ex.mapMetricVal}>3.2 km</div>
              </div>
            </div>
            <div style={ex.mapMetricDiv} />
            <div style={ex.mapMetric}>
              <Ic name="clock" size={11} color="#0A6BCF" />
              <div>
                <div style={ex.mapMetricLabel}>RESTANTE</div>
                <div style={ex.mapMetricVal}>18 min</div>
              </div>
            </div>
            <div style={ex.mapMetricDiv} />
            <div style={ex.mapMetric}>
              <Ic name="navigation" size={11} color="#0A6BCF" />
              <div>
                <div style={ex.mapMetricLabel}>SIGUIENTE</div>
                <div style={ex.mapMetricVal}>Patria</div>
              </div>
            </div>
          </div>

          {/* Live visibility chip */}
          <div style={ex.liveChip}>
            <span style={ex.liveDot} />
            <span><b style={{ fontWeight: 700 }}>María ve tu ubicación</b> en vivo</span>
          </div>

          {/* Bottom client card */}
          <div style={ex.mapClientCard}>
            <div style={ex.clientAvSmall}>MR</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={ex.clientName}>María Rodríguez</div>
              <div style={ex.clientMetaInline}>
                <Ic name="map-pin" size={10} color="#6B7280" />
                <span>Av. Patria 1234</span>
              </div>
            </div>
            <button style={ex.commBtnSolid}>
              <Ic name="message-circle" size={14} color="#FFFFFF" />
            </button>
            <button style={{ ...ex.commBtnSolid, background: "#18A66A" }}>
              <Ic name="phone" size={14} color="#FFFFFF" />
            </button>
          </div>
        </div>
      </div>

      <div style={ex.footer}>
        <button style={ex.primaryBtn}>
          <Ic name="map-pin" size={15} color="#FFFFFF" style={{ marginRight: 8 }} />
          <span>Marcar "Llegué al sitio"</span>
        </button>
      </div>
    </div>
  );
}

function BigMap() {
  return (
    <svg viewBox="0 0 390 500" width="100%" height="100%" style={{ display: "block", background: "#DDE7F1" }}>
      <defs>
        <pattern id="exMapGrid" width="26" height="26" patternUnits="userSpaceOnUse">
          <path d="M26 0 L0 0 0 26" fill="none" stroke="#CCD7E5" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="390" height="500" fill="url(#exMapGrid)" />
      {/* Zone blobs */}
      <path d="M0 80 Q 100 60 220 90 Q 290 130 270 220 Q 200 290 100 280 Q 30 230 0 170 Z" fill="rgba(255,255,255,0.55)" />
      <path d="M210 230 Q 320 220 380 260 Q 380 350 320 380 Q 230 380 200 340 Z" fill="rgba(255,255,255,0.45)" />
      {/* Buildings */}
      <g fill="rgba(180,210,180,0.40)">
        <rect x="100" y="180" width="16" height="22" rx="1.5" />
        <rect x="130" y="170" width="20" height="32" rx="1.5" />
        <rect x="280" y="280" width="18" height="28" rx="1.5" />
      </g>
      {/* Roads */}
      <path d="M0 240 Q 200 230 390 260" stroke="#FFFFFF" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M180 0 Q 175 250 200 500" stroke="#FFFFFF" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M0 130 Q 200 120 390 140" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.7" />
      {/* Route */}
      <path d="M70 110 Q 130 200 195 240 Q 240 280 220 340"
        stroke="rgba(10,107,207,0.25)" strokeWidth="16" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M70 110 Q 130 200 195 240 Q 240 280 220 340"
        stroke="#0A6BCF" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 200 Q 50 150 70 110"
        stroke="rgba(10,107,207,0.30)" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="4 4" />
      {/* Tech pin */}
      <g transform="translate(70, 110)">
        <circle r="26" fill="rgba(10,107,207,0.20)" />
        <circle r="18" fill="rgba(10,107,207,0.30)" />
        <circle r="14" fill="#FFFFFF" stroke="#0A6BCF" strokeWidth="3" />
        <text y="4" textAnchor="middle" fontFamily="Manrope" fontWeight="700" fontSize="10" fill="#0A6BCF">RH</text>
        <path d="M 14,-6 L 22,-4 L 16,2 Z" fill="#0A6BCF" />
      </g>
      {/* Destination */}
      <g transform="translate(220, 340)">
        <circle r="22" fill="rgba(220,38,38,0.18)" />
        <path d="M0,-16 a10,12 0 1 1 0.01,0 Z M0,0 L-4,-8 L4,-8 Z" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />
        <circle cy="-8" r="4" fill="#FFFFFF" />
      </g>
      <g transform="translate(220, 360)">
        <rect x="-32" y="0" width="64" height="20" rx="4" fill="rgba(14,44,86,0.85)" />
        <text y="14" textAnchor="middle" fontFamily="Inter" fontWeight="600" fontSize="10" fill="#FFFFFF">María R.</text>
      </g>
      <text x="50" y="50" fontFamily="Inter" fontWeight="600" fontSize="11" fill="#0E2C56" opacity="0.6">Zapopan</text>
      <text x="290" y="320" fontFamily="Inter" fontWeight="600" fontSize="10" fill="#0E2C56" opacity="0.55">Providencia</text>
    </svg>
  );
}

// =====================================================================
// SCREEN 03 — EN SITIO · INICIAR DIAGNÓSTICO
// =====================================================================
function S3OnSite() {
  return (
    <div style={ex.wrap}>
      <ServiceHeader current={2} />
      <ProgressStrip current={2} />

      <div style={ex.body}>
        {/* Arrival banner */}
        <div style={ex.arrivalBanner}>
          <div style={ex.arrivalIconWrap}>
            <Ic name="map-pin" size={22} color="#FFFFFF" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={ex.arrivalLabel}>EN SITIO · CHECK-IN 14:58</div>
            <div style={ex.arrivalTitle}>Llegaste a casa de María</div>
            <div style={ex.arrivalSub}>Tiempo desde llegada · <b style={{ color: "#0E2C56", fontWeight: 700 }}>4 min</b></div>
          </div>
        </div>

        {/* Big CTA */}
        <div style={ex.diagPrompt}>
          <div style={ex.diagPromptIcon}>
            <Ic name="stethoscope" size={20} color="#0A6BCF" />
          </div>
          <div style={ex.diagPromptTitle}>Realiza el diagnóstico</div>
          <div style={ex.diagPromptSub}>
            Revisa el problema y captura los <b style={{ color: "#0E2C56", fontWeight: 700 }}>extras</b> que necesitas cobrar.
          </div>
        </div>

        <ClientStrip chatEnabled={true} callEnabled={true} compact />

        {/* Evidence photo (optional) */}
        <SectionLabel n="1" label="EVIDENCIA INICIAL · OPCIONAL" sub="Te recomendamos capturar antes de iniciar" />
        <button style={ex.evidenceBtn}>
          <div style={ex.evidenceIconWrap}>
            <Ic name="camera" size={18} color="#0A6BCF" />
          </div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={ex.evidenceTitle}>Tomar foto del estado inicial</div>
            <div style={ex.evidenceSub}>Te protege en caso de disputa con el cliente</div>
          </div>
          <Ic name="chevron-right" size={14} color="#0A6BCF" />
        </button>

        {/* Diagnosis checklist (suggested) */}
        <SectionLabel n="2" label="ANTES DE COTIZAR" sub="Verifica los puntos clave" />
        <div style={ex.checklistCard}>
          <div style={ex.checklistRow}>
            <div style={ex.checkboxDone}><Ic name="check" size={10} color="#FFFFFF" stroke={3.5} /></div>
            <span style={ex.checklistLabelDone}>Confirmé el problema visualmente</span>
          </div>
          <div style={ex.checklistRow}>
            <div style={ex.checkboxDone}><Ic name="check" size={10} color="#FFFFFF" stroke={3.5} /></div>
            <span style={ex.checklistLabelDone}>Revisé acceso al área</span>
          </div>
          <div style={ex.checklistRow}>
            <div style={ex.checkboxNow}></div>
            <span style={ex.checklistLabelNow}>Identifiqué materiales / refacciones necesarias</span>
          </div>
          <div style={ex.checklistRow}>
            <div style={ex.checkboxOff}></div>
            <span style={ex.checklistLabelOff}>Coticé con el cliente cualquier extra</span>
          </div>
        </div>
      </div>

      <div style={ex.footerStack}>
        <button style={ex.primaryBtn}>
          <Ic name="plus" size={15} color="#FFFFFF" stroke={2.6} style={{ marginRight: 8 }} />
          <span>Agregar extras a la cotización</span>
        </button>
        <button style={ex.outlineBtn}>
          <Ic name="check" size={14} color="#0A6BCF" stroke={2.6} style={{ marginRight: 6 }} />
          <span>El precio base es suficiente · comenzar trabajo</span>
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// SCREEN 04 — AGREGAR EXTRAS
// =====================================================================
function S4Extras() {
  return (
    <div style={ex.wrap}>
      {/* Sub header */}
      <div style={ex.subHeader}>
        <button style={ex.iconBtn}><Ic name="arrow-left" size={17} color="#0E2C56" /></button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={ex.subHeaderLabel}>EXTRA 1 DE 2</div>
          <div style={ex.subHeaderTitle}>Agregar extra</div>
        </div>
        <button style={ex.iconBtn}><Ic name="help-circle" size={15} color="#6B7280" /></button>
      </div>

      <div style={ex.body}>
        {/* Type selector */}
        <SectionLabel n="A" label="TIPO DE EXTRA" />
        <div style={ex.typeChipsWrap}>
          {[
            { id: "llave",     label: "Cambio de llave",      icon: "wrench",    sel: true },
            { id: "sellado",   label: "Sellado de tubería",   icon: "droplets" },
            { id: "drenaje",   label: "Limpieza de drenaje",  icon: "trash-2" },
            { id: "material",  label: "Material adicional",   icon: "package" },
            { id: "regadera",  label: "Regadera",             icon: "shower-head" },
            { id: "other",     label: "Otro",                 icon: "plus" },
          ].map(t => (
            <div key={t.id} style={{ ...ex.typeChip, ...(t.sel ? ex.typeChipSel : null) }}>
              <Ic name={t.icon} size={12} color={t.sel ? "#FFFFFF" : "#0A6BCF"} stroke={2.2} />
              <span>{t.label}</span>
              {t.sel && <Ic name="check" size={11} color="#FFFFFF" stroke={3} />}
            </div>
          ))}
        </div>

        {/* Description */}
        <SectionLabel n="B" label="DESCRIPCIÓN" sub="Explícale al cliente por qué necesitas este extra" />
        <div style={ex.descInputWrap}>
          <textarea
            style={ex.descTextarea}
            rows={3}
            defaultValue="La llave del lavabo está desgastada y se afloja sola. Necesito reemplazarla por una nueva tipo monomando para evitar más fugas. Incluye refacción y mano de obra."
          />
          <div style={ex.descFoot}>
            <span style={ex.descMicChip}>
              <Ic name="mic" size={11} color="#0A6BCF" />
              <span>Dictar</span>
            </span>
            <span style={ex.descCount}>189/300</span>
          </div>
        </div>

        {/* Amount */}
        <SectionLabel n="C" label="MONTO" sub="Cuánto se sumará a la cuenta" />
        <div style={ex.amountCard}>
          <div style={ex.amountInputWrap}>
            <span style={ex.amountCurr}>$</span>
            <span style={ex.amountVal}>250</span>
            <span style={ex.amountCurrSuffix}>MXN</span>
          </div>
          {/* Range visualizer */}
          <div style={ex.amountRangeWrap}>
            <div style={ex.amountRangeTrack}>
              <div style={ex.amountRangeSuggested} />
              <div style={ex.amountRangeThumb}>
                <div style={ex.amountRangeThumbInner} />
              </div>
            </div>
            <div style={ex.amountRangeLabels}>
              <span>$0</span>
              <span style={{ position: "absolute", left: "30%", transform: "translateX(-50%)" }}>$200</span>
              <span style={{ position: "absolute", left: "55%", transform: "translateX(-50%)" }}>$350</span>
              <span style={{ marginLeft: "auto" }}>$600</span>
            </div>
          </div>
          <div style={ex.amountSuggestion}>
            <Ic name="check-circle-2" size={12} color="#0F8A56" />
            <span><b style={{ color: "#0E2C56", fontWeight: 700 }}>Dentro del rango sugerido</b> · $200–$350 para cambio de llave</span>
          </div>
        </div>

        {/* Photo */}
        <SectionLabel n="D" label="FOTO JUSTIFICATIVA" sub="Recomendado · refuerza la confianza del cliente" right={<span style={ex.recommendedBadge}>RECOMENDADO</span>} />
        <div style={ex.photoGridRow}>
          <div style={ex.photoFilled}>
            <div style={{ ...ex.photoFilledInner, background: "linear-gradient(135deg,#B45309,#F59E0B)" }}>
              <Ic name="image" size={18} color="rgba(255,255,255,0.85)" />
              <span style={ex.photoTag}>Llave dañada</span>
              <button style={ex.photoRemoveBtn}>
                <Ic name="x" size={10} color="#FFFFFF" stroke={3} />
              </button>
            </div>
          </div>
          <button style={ex.photoAddSlot}>
            <Ic name="camera" size={22} color="#0A6BCF" />
            <span style={ex.photoAddText}>Agregar</span>
          </button>
        </div>
      </div>

      <div style={ex.footer}>
        <button style={ex.primaryBtn}>
          <Ic name="check" size={15} color="#FFFFFF" stroke={2.6} style={{ marginRight: 8 }} />
          <span>Agregar este extra · +$250</span>
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// SCREEN 04b — LISTA DE EXTRAS (antes de enviar al cliente)
// =====================================================================
function S4List() {
  return (
    <div style={ex.wrap}>
      <ServiceHeader current={3} />
      <ProgressStrip current={3} />

      <div style={ex.body}>
        <div style={ex.titleBlock}>
          <div style={ex.bigTitle}>Tu cotización para María</div>
          <div style={ex.bigSub}>Revisa antes de enviar. María podrá aprobarla o pedir aclaración.</div>
        </div>

        {/* Base fare */}
        <SectionLabel n="1" label="TARIFA BASE" />
        <div style={ex.lineItem}>
          <div style={ex.lineItemIcon}>
            <Ic name="wrench" size={13} color="#0A6BCF" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={ex.lineItemTitle}>Plomería · Fugas</div>
            <div style={ex.lineItemSub}>Tarifa estándar del servicio</div>
          </div>
          <div style={ex.lineItemAmt}>$450</div>
        </div>

        {/* Extras */}
        <SectionLabel n="2" label="EXTRAS · 2 AGREGADOS"
          right={
            <button style={ex.addMoreBtn}>
              <Ic name="plus" size={11} color="#0A6BCF" stroke={2.4} />
              <span>Otro</span>
            </button>
          }
        />

        <div style={ex.extraCard}>
          <div style={{ ...ex.extraPhoto, background: "linear-gradient(135deg,#B45309,#F59E0B)" }}>
            <Ic name="image" size={14} color="rgba(255,255,255,0.85)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={ex.extraTitle}>Cambio de llave</div>
            <div style={ex.extraDesc}>Llave desgastada se afloja sola · refacción + mano de obra</div>
            <div style={ex.extraMetaRow}>
              <span style={ex.extraValidChip}>
                <Ic name="check" size={9} color="#0F8A56" stroke={3} />
                <span>Dentro del rango</span>
              </span>
              <span style={ex.extraEditMini}>
                <Ic name="pencil" size={10} color="#6B7280" />
                <span>Editar</span>
              </span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <div style={ex.extraAmt}>+$250</div>
            <button style={ex.extraDelete}>
              <Ic name="trash-2" size={11} color="#DC2626" />
            </button>
          </div>
        </div>

        <div style={ex.extraCard}>
          <div style={{ ...ex.extraPhoto, background: "linear-gradient(135deg,#0884B0,#18C1FF)" }}>
            <Ic name="image" size={14} color="rgba(255,255,255,0.85)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={ex.extraTitle}>Sellado de tubería</div>
            <div style={ex.extraDesc}>Para evitar otra fuga · 30 min adicionales</div>
            <div style={ex.extraMetaRow}>
              <span style={ex.extraValidChip}>
                <Ic name="check" size={9} color="#0F8A56" stroke={3} />
                <span>Dentro del rango</span>
              </span>
              <span style={ex.extraEditMini}>
                <Ic name="pencil" size={10} color="#6B7280" />
                <span>Editar</span>
              </span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <div style={ex.extraAmt}>+$150</div>
            <button style={ex.extraDelete}>
              <Ic name="trash-2" size={11} color="#DC2626" />
            </button>
          </div>
        </div>

        {/* Total + earnings highlight */}
        <div style={ex.totalCard}>
          <div style={ex.totalRow}>
            <span style={ex.totalLabel}>Tarifa base</span>
            <span style={ex.totalVal}>$450</span>
          </div>
          <div style={ex.totalRow}>
            <span style={ex.totalLabel}>Extras (2)</span>
            <span style={{ ...ex.totalVal, color: "#0A6BCF" }}>+$400</span>
          </div>
          <div style={ex.totalDivider} />
          <div style={ex.totalSubtotal}>
            <span style={ex.totalSubtotalLabel}>SUBTOTAL · CLIENTE PAGA</span>
            <span style={ex.totalSubtotalVal}>$850 <span style={ex.totalCurr}>MXN</span></span>
          </div>
          <div style={ex.totalDelta}>
            <Ic name="trending-up" size={11} color="#B45309" />
            <span>+$400 vs cotización inicial</span>
          </div>
          {/* Earnings preview */}
          <div style={ex.earnPreview}>
            <div>
              <div style={ex.earnPreviewLabel}>TU GANANCIA NETA</div>
              <div style={ex.earnPreviewSub}>Tras comisión 15% de $850</div>
            </div>
            <div style={ex.earnPreviewVal}>$722.50</div>
          </div>
        </div>

        {/* Tip */}
        <div style={ex.tipRow}>
          <Ic name="info" size={12} color="#0A6BCF" />
          <span>María tiene que aprobar la nueva cotización antes de que continúes. Te avisamos cuando responda.</span>
        </div>
      </div>

      <div style={ex.footer}>
        <button style={ex.primaryBtn}>
          <Ic name="send" size={15} color="#FFFFFF" style={{ marginRight: 8 }} />
          <span>Enviar a María</span>
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// SCREEN 05 — ESPERANDO APROBACIÓN
// =====================================================================
function S5Waiting() {
  return (
    <div style={ex.wrap}>
      <ServiceHeader current={3} />
      <ProgressStrip current={3} />

      <div style={ex.body}>
        <div style={ex.waitHero}>
          <div style={ex.waitIconWrap}>
            <div style={ex.waitRing1} />
            <div style={ex.waitRing2} />
            <div style={ex.waitCircle}>
              <Ic name="timer" size={32} color="#FFFFFF" />
            </div>
          </div>
          <div style={ex.waitTitle}>Esperando aprobación de María</div>
          <div style={ex.waitSub}>
            Le enviamos la cotización actualizada hace <b style={{ color: "#0E2C56", fontWeight: 700 }}>1 min 24s</b>. María suele responder en <b style={{ color: "#0E2C56", fontWeight: 700 }}>~3 min</b>.
          </div>

          {/* Spinner progress */}
          <div style={ex.waitProgress}>
            <div style={ex.waitProgressShimmer} />
          </div>
        </div>

        {/* Sent quote summary */}
        <SectionLabel n="A" label="COTIZACIÓN ENVIADA" sub="A revisión de María" />
        <div style={ex.totalCard}>
          <div style={ex.totalRow}>
            <span style={ex.totalLabel}>Tarifa base</span>
            <span style={ex.totalVal}>$450</span>
          </div>
          <div style={ex.totalRow}>
            <span style={ex.totalLabel}>Cambio de llave</span>
            <span style={ex.totalVal}>+$250</span>
          </div>
          <div style={ex.totalRow}>
            <span style={ex.totalLabel}>Sellado de tubería</span>
            <span style={ex.totalVal}>+$150</span>
          </div>
          <div style={ex.totalDivider} />
          <div style={ex.totalSubtotal}>
            <span style={ex.totalSubtotalLabel}>TOTAL</span>
            <span style={ex.totalSubtotalVal}>$850 <span style={ex.totalCurr}>MXN</span></span>
          </div>
        </div>

        <ClientStrip chatEnabled={true} callEnabled={true} compact />

        {/* Status timeline */}
        <SectionLabel n="B" label="ESTADO DE LA APROBACIÓN" />
        <div style={ex.statusTimeline}>
          <div style={ex.statusRow}>
            <div style={ex.statusDotDone}><Ic name="check" size={9} color="#FFFFFF" stroke={3.5} /></div>
            <div style={{ flex: 1 }}>
              <div style={ex.statusTitle}>Cotización enviada</div>
              <div style={ex.statusSub}>15:04 · 1 min 24s atrás</div>
            </div>
          </div>
          <div style={ex.statusLine} />
          <div style={ex.statusRow}>
            <div style={ex.statusDotNow}>
              <div style={ex.statusDotNowInner} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ ...ex.statusTitle, color: "#0A6BCF" }}>María revisando…</div>
              <div style={ex.statusSub}>Abrió la notificación hace 32s</div>
            </div>
          </div>
          <div style={ex.statusLine} />
          <div style={ex.statusRow}>
            <div style={ex.statusDotOff}></div>
            <div style={{ flex: 1 }}>
              <div style={{ ...ex.statusTitle, color: "#9CA3AF" }}>Aprobación recibida</div>
              <div style={ex.statusSub}>Te avisamos por notificación</div>
            </div>
          </div>
        </div>
      </div>

      <div style={ex.footerStack}>
        <button style={ex.outlineBtn}>
          <Ic name="message-circle" size={14} color="#0A6BCF" style={{ marginRight: 6 }} />
          <span>Aclarar dudas con María por chat</span>
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// SCREEN 06 — TRABAJO EN EJECUCIÓN
// =====================================================================
function S6Working() {
  return (
    <div style={ex.wrap}>
      <ServiceHeader current={4} />
      <ProgressStrip current={4} />

      <div style={ex.body}>
        {/* Live work status */}
        <div style={ex.workHero}>
          <div style={ex.workIconWrap}>
            <div style={ex.workRing} />
            <div style={ex.workCircle}>
              <Ic name="wrench" size={30} color="#FFFFFF" />
            </div>
          </div>
          <div style={ex.workLabel}>
            <span style={ex.liveDotBig} />
            <span>EN EJECUCIÓN</span>
          </div>
          <div style={ex.workTitle}>Trabajando en casa de María</div>
        </div>

        {/* Timer */}
        <div style={ex.timerCard}>
          <div style={ex.timerCardHead}>
            <Ic name="timer" size={13} color="#0A6BCF" />
            <span style={ex.timerCardLabel}>TIEMPO TRABAJADO</span>
            <span style={ex.timerEstimate}>Estimado 1h 30m</span>
          </div>
          <div style={ex.timerCardVal}>
            <span>01:12<span style={ex.timerCardSec}>:34</span></span>
          </div>
          <div style={ex.timerCardBar}>
            <div style={{ ...ex.timerCardFill, width: "80%" }} />
          </div>
        </div>

        <ClientStrip chatEnabled={true} callEnabled={true} compact />

        {/* Approved chip note */}
        <div style={ex.approvedNote}>
          <Ic name="badge-check" size={12} color="#0F8A56" />
          <span>Cotización <b style={{ color: "#0E2C56", fontWeight: 700 }}>$850 MXN</b> aprobada por María a las 15:08</span>
        </div>

        {/* Evidence during work */}
        <SectionLabel n="A" label="EVIDENCIA EN PROGRESO" sub="Opcional · varias fotos durante el trabajo" right={<span style={ex.recommendedBadge}>RECOMENDADO</span>} />
        <div style={ex.photoGridRow}>
          <div style={ex.photoFilled}>
            <div style={{ ...ex.photoFilledInner, background: "linear-gradient(135deg,#0A6BCF,#0894EA)" }}>
              <Ic name="image" size={18} color="rgba(255,255,255,0.85)" />
              <span style={ex.photoTag}>Antes</span>
            </div>
          </div>
          <div style={ex.photoFilled}>
            <div style={{ ...ex.photoFilledInner, background: "linear-gradient(135deg,#B45309,#F59E0B)" }}>
              <Ic name="image" size={18} color="rgba(255,255,255,0.85)" />
              <span style={ex.photoTag}>Llave nueva</span>
            </div>
          </div>
          <button style={ex.photoAddSlot}>
            <Ic name="camera" size={22} color="#0A6BCF" />
            <span style={ex.photoAddText}>Capturar</span>
          </button>
        </div>

        {/* Active task list */}
        <SectionLabel n="B" label="LO QUE ESTOY HACIENDO" />
        <div style={ex.checklistCard}>
          <div style={ex.checklistRow}>
            <div style={ex.checkboxDone}><Ic name="check" size={10} color="#FFFFFF" stroke={3.5} /></div>
            <span style={ex.checklistLabelDone}>Cierre llaves de paso</span>
            <span style={ex.checklistTimeMini}>15:10</span>
          </div>
          <div style={ex.checklistRow}>
            <div style={ex.checkboxDone}><Ic name="check" size={10} color="#FFFFFF" stroke={3.5} /></div>
            <span style={ex.checklistLabelDone}>Retiré llave dañada</span>
            <span style={ex.checklistTimeMini}>15:28</span>
          </div>
          <div style={ex.checklistRow}>
            <div style={ex.checkboxNow}></div>
            <span style={ex.checklistLabelNow}>Instalando llave nueva</span>
            <span style={ex.checklistTimeMini}>ahora</span>
          </div>
          <div style={ex.checklistRow}>
            <div style={ex.checkboxOff}></div>
            <span style={ex.checklistLabelOff}>Sellado de tubería</span>
          </div>
          <div style={ex.checklistRow}>
            <div style={ex.checkboxOff}></div>
            <span style={ex.checklistLabelOff}>Prueba de presión</span>
          </div>
        </div>
      </div>

      <div style={ex.footer}>
        <button style={ex.primaryBtn}>
          <Ic name="check" size={15} color="#FFFFFF" stroke={2.6} style={{ marginRight: 8 }} />
          <span>Marcar trabajo completado</span>
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// SCREEN 07 — CIERRE DEL SERVICIO (evidencia obligatoria)
// =====================================================================
function S7Close() {
  return (
    <div style={ex.wrap}>
      <ServiceHeader current={5} />
      <ProgressStrip current={5} />

      <div style={ex.body}>
        <div style={ex.titleBlock}>
          <div style={ex.bigTitle}>Cierre del servicio</div>
          <div style={ex.bigSub}>
            Sube al menos <b style={{ color: "#0E2C56", fontWeight: 700 }}>1 foto</b> de evidencia del trabajo terminado.
          </div>
        </div>

        {/* Evidence grid (mandatory) */}
        <SectionLabel n="A" label="EVIDENCIA FINAL · OBLIGATORIA"
          right={<span style={ex.requiredBadge}>1/5 mín · 2 subidas ✓</span>}
        />
        <div style={ex.evidenceGrid}>
          <div style={ex.photoFilled}>
            <div style={{ ...ex.photoFilledInner, background: "linear-gradient(135deg,#18A66A,#4ED896)" }}>
              <Ic name="image" size={18} color="rgba(255,255,255,0.85)" />
              <span style={ex.photoTag}>Después · llave</span>
              <button style={ex.photoRemoveBtn}>
                <Ic name="x" size={10} color="#FFFFFF" stroke={3} />
              </button>
            </div>
          </div>
          <div style={ex.photoFilled}>
            <div style={{ ...ex.photoFilledInner, background: "linear-gradient(135deg,#0884B0,#18C1FF)" }}>
              <Ic name="image" size={18} color="rgba(255,255,255,0.85)" />
              <span style={ex.photoTag}>Sellado</span>
              <button style={ex.photoRemoveBtn}>
                <Ic name="x" size={10} color="#FFFFFF" stroke={3} />
              </button>
            </div>
          </div>
          <button style={ex.photoAddSlot}>
            <Ic name="camera" size={20} color="#0A6BCF" />
            <span style={ex.photoAddText}>Agregar</span>
          </button>
          <div style={ex.photoEmpty} />
          <div style={ex.photoEmpty} />
        </div>

        {/* Notes */}
        <SectionLabel n="B" label="NOTAS FINALES" sub="Opcional · información que el cliente debería saber" />
        <div style={ex.notesWrap}>
          <textarea
            style={ex.descTextarea}
            rows={3}
            defaultValue="Cambié la llave por una monomando marca Helvex con garantía de 2 años. El sellado de la tubería se hizo con teflón industrial. Recomiendo no abrir la llave a máxima fuerza durante las primeras 48 horas."
          />
          <div style={ex.descFoot}>
            <span style={ex.descMicChip}>
              <Ic name="info" size={11} color="#0A6BCF" />
              <span>Visible para el cliente</span>
            </span>
            <span style={ex.descCount}>198/500</span>
          </div>
        </div>

        {/* Final summary */}
        <SectionLabel n="C" label="RESUMEN DEL COBRO" />
        <div style={ex.closeSummary}>
          <div style={ex.closeRow}>
            <span style={ex.closeLabel}>Total a cobrar</span>
            <span style={ex.closeAmt}>$850 <span style={ex.totalCurr}>MXN</span></span>
          </div>
          <div style={ex.closeMethodRow}>
            <span style={ex.closeMethodLabel}>Método elegido por María</span>
            <div style={ex.closeMethodVal}>
              <div style={ex.payCardMark}>VISA</div>
              <span>•••• 1234</span>
              <span style={ex.preauthChip}>
                <Ic name="check" size={9} color="#0F8A56" stroke={3} />
                <span>Pre-autorizado</span>
              </span>
            </div>
          </div>
          <div style={ex.closeEarn}>
            <span style={ex.closeEarnLabel}>Tu ganancia neta · tras 15% comisión</span>
            <span style={ex.closeEarnVal}>$722.50</span>
          </div>
        </div>
      </div>

      <div style={ex.footer}>
        <button style={ex.primaryBtn}>
          <Ic name="check" size={15} color="#FFFFFF" stroke={2.8} style={{ marginRight: 8 }} />
          <span>Confirmar trabajo completado</span>
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// SCREEN 08a — CONFIRMACIÓN DE PAGO DIGITAL
// =====================================================================
function S8Digital() {
  return (
    <div style={ex.wrap}>
      <ServiceHeader current={6} />
      <ProgressStrip current={6} />

      <div style={ex.bodyCentered}>
        <div style={ex.successHero}>
          <div style={ex.successIconWrap}>
            <div style={ex.successRing1} />
            <div style={ex.successRing2} />
            <div style={ex.successCircle}>
              <Ic name="check" size={48} color="#FFFFFF" stroke={3.5} />
            </div>
          </div>
          <div style={ex.successTitle}>Trabajo completado</div>
          <div style={ex.successSub}>
            El cobro se procesará automáticamente desde la tarjeta de María. <b style={{ color: "#0E2C56", fontWeight: 700 }}>Sin intervención adicional</b>.
          </div>
        </div>

        {/* Earnings card */}
        <div style={ex.successEarnCard}>
          <div style={ex.successEarnTop}>
            <span style={ex.successEarnLabel}>TU GANANCIA NETA</span>
            <span style={ex.successPreAuthChip}>
              <Ic name="zap" size={9} color="#FFFFFF" />
              <span>EN CAMINO</span>
            </span>
          </div>
          <div style={ex.successEarnVal}>$722<span style={ex.successEarnDec}>.50</span><span style={ex.successEarnCurr}>MXN</span></div>

          <div style={ex.successEarnRows}>
            <div style={ex.successEarnRow}>
              <span style={ex.successEarnRowLabel}>Cliente paga</span>
              <span style={ex.successEarnRowVal}>$850.00</span>
            </div>
            <div style={ex.successEarnRow}>
              <span style={ex.successEarnRowLabel}>Comisión plataforma (15%)</span>
              <span style={{ ...ex.successEarnRowVal, color: "#9CA3AF" }}>−$127.50</span>
            </div>
            <div style={ex.successEarnRowFinal}>
              <span style={ex.successEarnRowLabel}>Método de pago</span>
              <span style={ex.successEarnMethod}>
                <div style={ex.payCardMark}>VISA</div>
                <span>•••• 1234</span>
              </span>
            </div>
          </div>

          <div style={ex.successDepRow}>
            <Ic name="banknote" size={12} color="#FFFFFF" />
            <span>Depósito a tu cuenta · <b style={{ fontWeight: 800 }}>24–48 h hábiles</b></span>
          </div>
        </div>
      </div>

      <div style={ex.footerStack}>
        <button style={ex.primaryBtn}>
          <Ic name="star" size={15} color="#FFFFFF" style={{ marginRight: 8 }} />
          <span>Calificar a María</span>
        </button>
        <button style={ex.outlineBtn}>
          <Ic name="home" size={13} color="#0A6BCF" style={{ marginRight: 6 }} />
          <span>Volver al inbox</span>
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// SCREEN 08b — COBRO EN EFECTIVO
// =====================================================================
function S8Cash() {
  return (
    <div style={ex.wrap}>
      <ServiceHeader current={6} />
      <ProgressStrip current={6} />

      <div style={ex.body}>
        <div style={ex.titleBlock}>
          <div style={ex.bigTitle}>Cobra a María en efectivo</div>
          <div style={ex.bigSub}>
            Confirma cuando recibas el pago. María también debe confirmar desde su app.
          </div>
        </div>

        {/* Big amount */}
        <div style={ex.cashHero}>
          <div style={ex.cashIcon}>
            <Ic name="banknote" size={30} color="#FFFFFF" />
          </div>
          <div style={ex.cashLabel}>COBRA EN EFECTIVO</div>
          <div style={ex.cashAmount}>$850<span style={ex.cashAmountCurr}> MXN</span></div>
          <div style={ex.cashSub}>Por <b style={{ color: "#0E2C56", fontWeight: 700 }}>servicio #SVC-2851</b> · Plomería</div>

          {/* Bill helper */}
          <div style={ex.cashHelper}>
            <span style={ex.cashHelperLabel}>EQUIVALE A</span>
            <div style={ex.cashHelperRow}>
              <span style={ex.cashHelperChip}>1× $500</span>
              <span style={ex.cashHelperPlus}>+</span>
              <span style={ex.cashHelperChip}>1× $200</span>
              <span style={ex.cashHelperPlus}>+</span>
              <span style={ex.cashHelperChip}>1× $100</span>
              <span style={ex.cashHelperPlus}>+</span>
              <span style={ex.cashHelperChip}>1× $50</span>
            </div>
          </div>
        </div>

        {/* Bilateral confirmation */}
        <SectionLabel n="A" label="CONFIRMACIÓN BILATERAL" sub="Ambos confirman para cerrar el servicio" />
        <div style={ex.bilateralCard}>
          <div style={ex.bilateralStep}>
            <div style={ex.bilateralAvBlue}>RH</div>
            <div style={{ flex: 1 }}>
              <div style={ex.bilateralStepTitle}>Tú confirmas que recibiste</div>
              <div style={ex.bilateralStepSub}>Aquí · ahora mismo</div>
            </div>
            <div style={ex.bilateralPending}>Pendiente</div>
          </div>
          <div style={ex.bilateralLine} />
          <div style={ex.bilateralStep}>
            <div style={ex.bilateralAvClient}>MR</div>
            <div style={{ flex: 1 }}>
              <div style={ex.bilateralStepTitle}>María confirma que pagó</div>
              <div style={ex.bilateralStepSub}>Desde su app cliente</div>
            </div>
            <div style={ex.bilateralPending}>Pendiente</div>
          </div>
        </div>

        {/* Warning */}
        <div style={ex.warnCard}>
          <div style={ex.warnIcon}>
            <Ic name="triangle-alert" size={14} color="#B45309" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={ex.warnTitle}>Solo confirma DESPUÉS de recibir el dinero</div>
            <div style={ex.warnText}>
              Si María no confirma en 24h, el servicio queda en disputa y se notifica a soporte. <a href="#" style={ex.warnLink}>Más información</a>
            </div>
          </div>
        </div>
      </div>

      <div style={ex.footerStack}>
        <button style={ex.primaryBtn}>
          <Ic name="check" size={15} color="#FFFFFF" stroke={2.8} style={{ marginRight: 8 }} />
          <span>Confirmar que recibí $850 MXN</span>
        </button>
        <button style={ex.outlineBtn}>
          <Ic name="message-circle" size={14} color="#0A6BCF" style={{ marginRight: 6 }} />
          <span>Hablar con María</span>
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// SHARED Section Label
// =====================================================================
function SectionLabel({ n, label, sub, right }) {
  return (
    <div style={ex.sectionLabelRow}>
      <div style={ex.sectionLabelNum}>{n}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={ex.sectionLabelLabel}>{label}</div>
        {sub && <div style={ex.sectionLabelSub}>{sub}</div>}
      </div>
      {right}
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
      <DCSection id="pre" title="Antes del servicio" subtitle="Aceptado · en camino · check-in">
        <DCArtboard id="s1" label="01 · Aceptado · pre-cita" width={438} height={892}>
          <PhoneFrame><S1Pre /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="s2" label="02 · En camino · mapa" width={438} height={892}>
          <PhoneFrame><S2EnRoute /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="s3" label="03 · En sitio · diagnóstico" width={438} height={892}>
          <PhoneFrame><S3OnSite /></PhoneFrame>
        </DCArtboard>
      </DCSection>

      <DCSection id="extras" title="Cotización con extras" subtitle="Captura · revisión · aprobación">
        <DCArtboard id="s4a" label="04a · Agregar un extra (form)" width={438} height={892}>
          <PhoneFrame><S4Extras /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="s4b" label="04b · Lista de extras antes de enviar" width={438} height={892}>
          <PhoneFrame><S4List /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="s5" label="05 · Esperando aprobación" width={438} height={892}>
          <PhoneFrame><S5Waiting /></PhoneFrame>
        </DCArtboard>
      </DCSection>

      <DCSection id="exec" title="Ejecución y cierre" subtitle="Trabajo · evidencia · cobro">
        <DCArtboard id="s6" label="06 · Trabajando con timer" width={438} height={892}>
          <PhoneFrame><S6Working /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="s7" label="07 · Cierre · evidencia obligatoria" width={438} height={892}>
          <PhoneFrame><S7Close /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="s8a" label="08a · Cobro digital automático" width={438} height={892}>
          <PhoneFrame><S8Digital /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="s8b" label="08b · Cobro en efectivo bilateral" width={438} height={892}>
          <PhoneFrame><S8Cash /></PhoneFrame>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// =====================================================================
// STYLES
// =====================================================================
const ex = {
  wrap: { width: "100%", height: "100%", background: "#F8FBFF", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" },

  // ===== Header =====
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "50px 16px 12px", background: "#FFFFFF", borderBottom: "1px solid #F0F4F9", flexShrink: 0, gap: 10 },
  iconBtn: { width: 38, height: 38, borderRadius: 11, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  headerLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#9CA3AF", letterSpacing: ".1em", fontWeight: 700, textTransform: "uppercase" },
  headerId: { fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#0E2C56", fontWeight: 700, marginTop: 2 },

  // Sub header (extras form)
  subHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "50px 16px 12px", background: "#FFFFFF", borderBottom: "1px solid #F0F4F9", flexShrink: 0, gap: 10 },
  subHeaderLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#0A6BCF", letterSpacing: ".1em", fontWeight: 700 },
  subHeaderTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 17, fontWeight: 700, color: "#0E2C56", marginTop: 2, letterSpacing: "-0.01em" },

  // ===== Progress strip =====
  progress: { display: "flex", padding: "10px 18px 12px", background: "#FFFFFF", borderBottom: "1px solid #F0F4F9", alignItems: "center", flexShrink: 0 },
  progressItem: { position: "relative", display: "flex", alignItems: "center", flex: 1 },
  progressDot: { width: 18, height: 18, borderRadius: "50%", display: "grid", placeItems: "center", zIndex: 1, flexShrink: 0 },
  progressLine: { flex: 1, height: 2, marginLeft: -2, marginRight: -2 },

  body: { flex: 1, overflowY: "auto", padding: "16px 16px 110px" },
  bodyMap: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "12px 16px 100px" },
  bodyCentered: { flex: 1, overflowY: "auto", padding: "20px 16px 130px", display: "flex", flexDirection: "column", alignItems: "center" },

  // ===== Footer =====
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, background: "#FFFFFF", borderTop: "1px solid #E1E8F0", padding: "14px 16px 30px", display: "flex", gap: 10, alignItems: "center", boxShadow: "0 -4px 12px rgba(14,44,86,0.06)", zIndex: 5 },
  footerStack: { position: "absolute", left: 0, right: 0, bottom: 0, background: "#FFFFFF", borderTop: "1px solid #E1E8F0", padding: "14px 16px 30px", display: "flex", flexDirection: "column", gap: 8, boxShadow: "0 -4px 12px rgba(14,44,86,0.06)", zIndex: 5 },
  primaryBtn: { width: "100%", height: 54, background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 14, fontWeight: 700, fontSize: 14.5, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(10,107,207,0.30)" },
  primaryBtnDisabled: { background: "#EEF3F8", color: "#9CA3AF", boxShadow: "none", cursor: "not-allowed" },
  disabledHint: { marginLeft: 8, padding: "2px 7px", background: "rgba(245,158,11,0.14)", color: "#B45309", borderRadius: 999, fontSize: 9.5, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".04em" },
  outlineBtn: { width: "100%", padding: "13px", background: "#FFFFFF", color: "#0A6BCF", border: "1.5px solid #0A6BCF", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },

  // ===== Title block =====
  titleBlock: { marginBottom: 16, padding: "0 2px" },
  bigTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em" },
  bigSub: { fontSize: 13.5, color: "#6B7280", marginTop: 6, lineHeight: 1.5 },

  // ===== Big countdown card =====
  bigCountdownCard: { position: "relative", padding: 18, background: "linear-gradient(135deg, rgba(245,158,11,0.10), rgba(251,191,36,0.05))", border: "1.5px solid rgba(245,158,11,0.30)", borderRadius: 18, marginBottom: 14, textAlign: "center", overflow: "hidden" },
  countdownIconRing: { width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #F59E0B, #FBBF24)", display: "grid", placeItems: "center", margin: "0 auto 8px", boxShadow: "0 8px 18px rgba(245,158,11,0.30)" },
  countdownLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#B45309", letterSpacing: ".12em", fontWeight: 700 },
  countdownTime: { display: "inline-flex", alignItems: "baseline", justifyContent: "center", gap: 4, fontFamily: "'Manrope', sans-serif", fontWeight: 800, color: "#0E2C56", marginTop: 4, letterSpacing: "-0.02em", lineHeight: 1 },
  countdownUnit: { fontSize: 36 },
  countdownUnitLabel: { fontSize: 16, color: "#B45309", marginLeft: 1 },
  countdownColon: { fontSize: 28, color: "#9CA3AF", margin: "0 2px" },
  countdownSub: { fontSize: 12, color: "#6B7280", marginTop: 8 },
  countdownTrack: { height: 4, background: "rgba(245,158,11,0.18)", borderRadius: 999, overflow: "hidden", marginTop: 14 },
  countdownFill: { height: "100%", width: "82%", background: "linear-gradient(90deg,#F59E0B,#FBBF24)" },

  // ===== Client strip =====
  clientStrip: { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, marginBottom: 10 },
  clientStripCompact: { padding: "10px 12px" },
  clientAvWrap: { position: "relative", flexShrink: 0 },
  clientAv: { width: 42, height: 42, borderRadius: "50%", background: CLIENT_TONE, color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 13 },
  clientAvSmall: { width: 38, height: 38, borderRadius: "50%", background: CLIENT_TONE, color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 12, flexShrink: 0 },
  clientVerify: { position: "absolute", right: -2, bottom: -2, width: 16, height: 16, borderRadius: "50%", background: "#18A66A", border: "2px solid #FFFFFF", display: "grid", placeItems: "center" },
  clientName: { fontSize: 13.5, fontWeight: 700, color: "#0E2C56" },
  clientMeta: { display: "flex", alignItems: "center", gap: 4, marginTop: 2, fontSize: 11, color: "#6B7280" },
  clientMetaInline: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6B7280", marginTop: 2 },
  bullet: { width: 2, height: 2, borderRadius: "50%", background: "#9CA3AF", margin: "0 3px" },
  commBtn: { width: 38, height: 38, borderRadius: 10, background: "rgba(10,107,207,0.08)", border: "1px solid rgba(10,107,207,0.18)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  commBtnSolid: { width: 36, height: 36, borderRadius: 10, background: "#0A6BCF", border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0, boxShadow: "0 2px 6px rgba(10,107,207,0.25)" },

  // ===== Section label =====
  sectionLabelRow: { display: "flex", alignItems: "center", gap: 10, margin: "18px 0 10px" },
  sectionLabelNum: { width: 20, height: 20, borderRadius: "50%", background: "#0A6BCF", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 10, flexShrink: 0 },
  sectionLabelLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#0A6BCF", letterSpacing: ".1em", fontWeight: 700 },
  sectionLabelSub: { fontSize: 10.5, color: "#9CA3AF", marginTop: 1 },

  miniLink: { color: "#0A6BCF", textDecoration: "none", fontSize: 11.5, fontWeight: 700 },

  // ===== Svc card =====
  svcCard: { padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14 },
  svcTopRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  svcIcon: { width: 36, height: 36, borderRadius: 10, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  svcCat: { fontFamily: "'Manrope', sans-serif", fontSize: 15, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.01em" },
  svcCatSub: { fontSize: 11, color: "#6B7280", marginTop: 1 },
  svcUrgentChip: { display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", background: "rgba(245,158,11,0.14)", color: "#B45309", borderRadius: 999, fontSize: 9, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".06em" },
  svcDesc: { fontSize: 12, color: "#0E2C56", lineHeight: 1.5, margin: 0, fontStyle: "italic", padding: "10px 12px", background: "#F8FBFF", borderRadius: 10 },
  svcPhotosRow: { display: "flex", gap: 4, marginTop: 10 },
  svcPhoto: { width: 50, height: 50, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0 },
  svcPhotosMore: { width: 50, height: 50, borderRadius: 8, background: "#EEF3F8", border: "1px dashed #C8D4E0", display: "grid", placeItems: "center", color: "#6B7280", fontSize: 12, fontWeight: 700 },

  // ===== Address =====
  addrCard: { display: "flex", alignItems: "center", gap: 12, padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14 },
  addrIconNav: { width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #0A6BCF, #18C1FF)", display: "grid", placeItems: "center", flexShrink: 0, boxShadow: "0 4px 10px rgba(10,107,207,0.30)" },
  addrLine: { fontSize: 13, fontWeight: 700, color: "#0E2C56" },
  addrLine2: { fontSize: 11.5, color: "#6B7280", marginTop: 2 },
  addrRefRow: { display: "flex", gap: 5, marginTop: 8, padding: "5px 9px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 8, fontSize: 10.5, color: "#6B7280", lineHeight: 1.4 },
  addrDistPill: { display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 10px", background: "#F8FBFF", borderRadius: 10, flexShrink: 0 },
  addrDist: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 16, color: "#0A6BCF", lineHeight: 1, letterSpacing: "-0.01em" },
  addrDistUnit: { fontSize: 9, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", marginLeft: 1, fontWeight: 600 },
  addrDistTime: { fontSize: 9.5, color: "#6B7280", marginTop: 4, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },

  // ===== Earnings (pre-service) =====
  earnCard: { padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14 },
  earnRow: { display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 12.5 },
  earnLabel: { color: "#6B7280" },
  earnVal: { color: "#0E2C56", fontWeight: 700, fontFamily: "'Manrope', sans-serif" },
  earnRowFinal: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "linear-gradient(135deg, rgba(24,166,106,0.08), rgba(78,216,150,0.04))", border: "1px solid rgba(24,166,106,0.30)", borderRadius: 12, marginTop: 8 },
  earnFinalLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#0F8A56", letterSpacing: ".1em", fontWeight: 700 },
  earnFinalSub: { fontSize: 10.5, color: "#6B7280", marginTop: 2 },
  earnFinalVal: { fontFamily: "'Manrope', sans-serif", fontSize: 24, fontWeight: 800, color: "#0F8A56", letterSpacing: "-0.02em", lineHeight: 1 },
  earnFinalDec: { fontSize: 14, opacity: 0.85 },
  earnExtraNote: { display: "flex", alignItems: "center", gap: 5, marginTop: 10, padding: "8px 10px", background: "rgba(10,107,207,0.05)", border: "1px dashed rgba(10,107,207,0.25)", borderRadius: 8, fontSize: 10.5, color: "#6B7280" },

  // ===== Cancel link =====
  cancelLink: { width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#FFFFFF", border: "1px solid rgba(220,38,38,0.25)", borderRadius: 12, marginTop: 14, cursor: "pointer" },
  cancelTitle: { fontSize: 13, fontWeight: 700, color: "#DC2626" },
  cancelSub: { fontSize: 10.5, color: "#9CA3AF", marginTop: 2 },

  // ===== ETA banner =====
  etaBanner: { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "linear-gradient(135deg, #0A6BCF, #0894EA)", borderRadius: 16, color: "#FFFFFF", boxShadow: "0 6px 16px rgba(10,107,207,0.30)", marginBottom: 12 },
  etaIconWrap: { width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,0.18)", display: "grid", placeItems: "center", flexShrink: 0 },
  etaLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.85)", letterSpacing: ".1em", fontWeight: 700 },
  etaTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, marginTop: 1, letterSpacing: "-0.01em", lineHeight: 1 },
  etaIn: { fontSize: 13, opacity: 0.85, fontFamily: "'Inter', sans-serif", fontWeight: 600 },
  etaSpeedBox: { padding: "6px 11px", background: "rgba(255,255,255,0.15)", borderRadius: 10, textAlign: "center", flexShrink: 0 },
  etaSpeedVal: { fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1 },
  etaSpeedLabel: { fontSize: 9, color: "rgba(255,255,255,0.85)", marginTop: 2, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },

  // ===== Map =====
  mapWrap: { position: "relative", flex: 1, minHeight: 400, borderRadius: 16, overflow: "hidden", border: "1px solid #E1E8F0", boxShadow: "0 4px 14px rgba(14,44,86,0.08)" },
  mapMetricsBar: { position: "absolute", top: 12, left: 12, right: 12, display: "flex", alignItems: "stretch", gap: 0, padding: "8px 10px", background: "rgba(255,255,255,0.96)", borderRadius: 10, backdropFilter: "blur(6px)", boxShadow: "0 4px 12px rgba(14,44,86,0.12)" },
  mapMetric: { flex: 1, display: "flex", alignItems: "center", gap: 6, padding: "0 4px" },
  mapMetricLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 8.5, color: "#9CA3AF", letterSpacing: ".06em", fontWeight: 700 },
  mapMetricVal: { fontSize: 11.5, color: "#0E2C56", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginTop: 1 },
  mapMetricDiv: { width: 1, background: "#E1E8F0" },

  liveChip: { position: "absolute", top: 64, left: "50%", transform: "translateX(-50%)", display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", background: "rgba(14,44,86,0.85)", color: "#FFFFFF", borderRadius: 999, fontSize: 10.5, boxShadow: "0 4px 10px rgba(14,44,86,0.30)", backdropFilter: "blur(6px)" },
  liveDot: { display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#18A66A", boxShadow: "0 0 0 3px rgba(24,166,106,0.40)" },

  mapClientCard: { position: "absolute", left: 12, right: 12, bottom: 12, display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#FFFFFF", borderRadius: 14, boxShadow: "0 -4px 16px rgba(14,44,86,0.10), 0 0 0 1px rgba(14,44,86,0.05)" },

  // ===== Arrival banner =====
  arrivalBanner: { display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "linear-gradient(135deg, rgba(24,166,106,0.10), rgba(78,216,150,0.04))", border: "1.5px solid rgba(24,166,106,0.35)", borderRadius: 16, marginBottom: 14 },
  arrivalIconWrap: { width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#18A66A,#4ED896)", display: "grid", placeItems: "center", flexShrink: 0, boxShadow: "0 6px 14px rgba(24,166,106,0.30)" },
  arrivalLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#0F8A56", letterSpacing: ".1em", fontWeight: 700 },
  arrivalTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 15, fontWeight: 800, color: "#0E2C56", marginTop: 1, letterSpacing: "-0.01em" },
  arrivalSub: { fontSize: 11.5, color: "#6B7280", marginTop: 3 },

  diagPrompt: { padding: "14px 16px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, textAlign: "center", marginBottom: 14 },
  diagPromptIcon: { width: 44, height: 44, borderRadius: 12, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", margin: "0 auto 8px" },
  diagPromptTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.01em" },
  diagPromptSub: { fontSize: 12, color: "#6B7280", marginTop: 6, lineHeight: 1.5 },

  evidenceBtn: { width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#FFFFFF", border: "1.5px dashed rgba(10,107,207,0.30)", borderRadius: 14, cursor: "pointer" },
  evidenceIconWrap: { width: 38, height: 38, borderRadius: 10, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  evidenceTitle: { fontSize: 13, fontWeight: 700, color: "#0A6BCF" },
  evidenceSub: { fontSize: 11, color: "#6B7280", marginTop: 2 },

  // ===== Checklist =====
  checklistCard: { padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14 },
  checklistRow: { display: "flex", alignItems: "center", gap: 10, padding: "7px 0" },
  checkboxDone: { width: 18, height: 18, borderRadius: 6, background: "#18A66A", display: "grid", placeItems: "center", flexShrink: 0 },
  checkboxNow: { width: 18, height: 18, borderRadius: 6, background: "#FFFFFF", border: "2px solid #0A6BCF", boxShadow: "0 0 0 3px rgba(10,107,207,0.15)", flexShrink: 0 },
  checkboxOff: { width: 18, height: 18, borderRadius: 6, background: "#FFFFFF", border: "1.5px solid #E1E8F0", flexShrink: 0 },
  checklistLabelDone: { fontSize: 12.5, color: "#6B7280", textDecoration: "line-through", flex: 1 },
  checklistLabelNow: { fontSize: 12.5, color: "#0E2C56", fontWeight: 700, flex: 1 },
  checklistLabelOff: { fontSize: 12.5, color: "#9CA3AF", flex: 1 },
  checklistTimeMini: { fontSize: 10, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },

  // ===== Extras form =====
  typeChipsWrap: { display: "flex", flexWrap: "wrap", gap: 6 },
  typeChip: { display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 12px", background: "#FFFFFF", border: "1.5px solid #E1E8F0", color: "#0E2C56", borderRadius: 999, fontSize: 11.5, fontWeight: 600, cursor: "pointer" },
  typeChipSel: { background: "#0A6BCF", borderColor: "#0A6BCF", color: "#FFFFFF", boxShadow: "0 4px 10px rgba(10,107,207,0.30)" },

  descInputWrap: { padding: "12px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12 },
  descTextarea: { width: "100%", border: "none", outline: "none", resize: "none", background: "transparent", fontSize: 13, color: "#0E2C56", fontFamily: "'Inter', sans-serif", lineHeight: 1.5 },
  descFoot: { display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, marginTop: 4, borderTop: "1px solid #F0F4F9" },
  descMicChip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", background: "rgba(10,107,207,0.08)", color: "#0A6BCF", borderRadius: 999, fontSize: 10.5, fontWeight: 600 },
  descCount: { fontSize: 10.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },

  // ===== Amount card =====
  amountCard: { padding: 14, background: "#FFFFFF", border: "1.5px solid #18A66A", borderRadius: 14, boxShadow: "0 4px 12px rgba(24,166,106,0.10)" },
  amountInputWrap: { display: "flex", alignItems: "baseline", gap: 4, padding: "10px 0" },
  amountCurr: { fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: "#9CA3AF", fontWeight: 600 },
  amountVal: { fontFamily: "'Manrope', sans-serif", fontSize: 40, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em", lineHeight: 1 },
  amountCurrSuffix: { marginLeft: 6, fontSize: 11, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
  amountRangeWrap: { marginTop: 8 },
  amountRangeTrack: { position: "relative", height: 6, background: "#EEF3F8", borderRadius: 999 },
  amountRangeSuggested: { position: "absolute", top: 0, left: "30%", width: "25%", height: 6, background: "linear-gradient(90deg,#A7E5C7,#4ED896)", borderRadius: 999 },
  amountRangeThumb: { position: "absolute", top: "50%", left: "40%", transform: "translate(-50%,-50%)", width: 18, height: 18, borderRadius: "50%", background: "#FFFFFF", border: "3px solid #18A66A", display: "grid", placeItems: "center", boxShadow: "0 2px 6px rgba(24,166,106,0.30)" },
  amountRangeThumbInner: { width: 6, height: 6, borderRadius: "50%", background: "#18A66A" },
  amountRangeLabels: { position: "relative", height: 14, marginTop: 6, fontSize: 9.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, display: "flex", justifyContent: "space-between" },
  amountSuggestion: { display: "inline-flex", alignItems: "center", gap: 5, marginTop: 12, padding: "5px 9px", background: "rgba(24,166,106,0.10)", border: "1px solid rgba(24,166,106,0.25)", borderRadius: 8, fontSize: 11, color: "#0F8A56" },

  recommendedBadge: { padding: "2px 7px", background: "rgba(245,158,11,0.14)", color: "#B45309", borderRadius: 999, fontSize: 9, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".04em" },

  // ===== Photo grid =====
  photoGridRow: { display: "flex", gap: 6 },
  photoFilled: { width: 86, height: 86, position: "relative", borderRadius: 10 },
  photoFilledInner: { position: "relative", width: "100%", height: "100%", borderRadius: 10, display: "grid", placeItems: "center" },
  photoTag: { position: "absolute", left: 4, bottom: 4, padding: "1px 6px", background: "rgba(14,44,86,0.65)", color: "#FFFFFF", fontSize: 9, fontWeight: 600, borderRadius: 4 },
  photoRemoveBtn: { position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: "50%", background: "rgba(14,44,86,0.65)", border: "none", display: "grid", placeItems: "center", cursor: "pointer" },
  photoAddSlot: { width: 86, height: 86, borderRadius: 10, background: "rgba(10,107,207,0.06)", border: "1.5px dashed rgba(10,107,207,0.40)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer" },
  photoAddText: { fontSize: 10, color: "#0A6BCF", fontWeight: 700 },
  photoEmpty: { aspectRatio: "1", borderRadius: 10, background: "#F4F7FB", border: "1px dashed #E1E8F0" },

  // ===== Line items (S4 list) =====
  lineItem: { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12, marginBottom: 6 },
  lineItemIcon: { width: 32, height: 32, borderRadius: 9, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  lineItemTitle: { fontSize: 13, fontWeight: 700, color: "#0E2C56" },
  lineItemSub: { fontSize: 11, color: "#6B7280", marginTop: 1 },
  lineItemAmt: { fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.01em" },

  addMoreBtn: { display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 11px", background: "rgba(10,107,207,0.08)", border: "1px solid rgba(10,107,207,0.20)", color: "#0A6BCF", borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: "pointer" },

  extraCard: { display: "flex", gap: 12, padding: "12px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12, marginBottom: 6 },
  extraPhoto: { width: 50, height: 50, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0 },
  extraTitle: { fontSize: 13, fontWeight: 700, color: "#0E2C56" },
  extraDesc: { fontSize: 11, color: "#6B7280", marginTop: 2, lineHeight: 1.4 },
  extraMetaRow: { display: "flex", alignItems: "center", gap: 6, marginTop: 6 },
  extraValidChip: { display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", background: "rgba(24,166,106,0.12)", color: "#0F8A56", borderRadius: 999, fontSize: 9.5, fontWeight: 700 },
  extraEditMini: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, color: "#6B7280", cursor: "pointer" },
  extraAmt: { fontFamily: "'Manrope', sans-serif", fontSize: 14, fontWeight: 800, color: "#0A6BCF" },
  extraDelete: { width: 24, height: 24, borderRadius: 6, background: "rgba(220,38,38,0.08)", border: "none", display: "grid", placeItems: "center", cursor: "pointer" },

  // ===== Total card =====
  totalCard: { padding: "14px 16px", background: "#FFFFFF", border: "1.5px solid #0A6BCF", borderRadius: 16, boxShadow: "0 4px 14px rgba(10,107,207,0.08)", marginTop: 10 },
  totalRow: { display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12.5 },
  totalLabel: { color: "#6B7280" },
  totalVal: { color: "#0E2C56", fontWeight: 700, fontFamily: "'Manrope', sans-serif" },
  totalDivider: { height: 1, background: "#F0F4F9", margin: "10px 0" },
  totalSubtotal: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  totalSubtotalLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF", letterSpacing: ".1em", fontWeight: 700 },
  totalSubtotalVal: { fontFamily: "'Manrope', sans-serif", fontSize: 24, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em", lineHeight: 1 },
  totalCurr: { fontSize: 11, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
  totalDelta: { display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, padding: "2px 8px", background: "rgba(245,158,11,0.14)", color: "#B45309", borderRadius: 999, fontSize: 10, fontWeight: 700 },

  earnPreview: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "linear-gradient(135deg, rgba(24,166,106,0.08), rgba(78,216,150,0.04))", border: "1px solid rgba(24,166,106,0.30)", borderRadius: 12, marginTop: 12 },
  earnPreviewLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#0F8A56", letterSpacing: ".1em", fontWeight: 700 },
  earnPreviewSub: { fontSize: 10.5, color: "#6B7280", marginTop: 2 },
  earnPreviewVal: { fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: "#0F8A56", letterSpacing: "-0.02em", lineHeight: 1 },

  tipRow: { display: "flex", alignItems: "flex-start", gap: 6, marginTop: 14, padding: "10px 12px", background: "rgba(10,107,207,0.05)", border: "1px solid rgba(10,107,207,0.20)", borderRadius: 10, fontSize: 11.5, color: "#6B7280", lineHeight: 1.5 },

  // ===== Waiting =====
  waitHero: { padding: "22px 18px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 18, textAlign: "center", marginBottom: 4 },
  waitIconWrap: { position: "relative", width: 96, height: 96, display: "grid", placeItems: "center", margin: "0 auto 12px" },
  waitRing1: { position: "absolute", inset: -10, borderRadius: "50%", border: "2px solid rgba(10,107,207,0.18)", animation: "ex-pulse 2.4s infinite" },
  waitRing2: { position: "absolute", inset: 4, borderRadius: "50%", border: "2px solid rgba(10,107,207,0.30)", animation: "ex-pulse 2.4s infinite 0.5s" },
  waitCircle: { width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#0A6BCF,#0894EA)", display: "grid", placeItems: "center", boxShadow: "0 10px 24px rgba(10,107,207,0.30)" },
  waitTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 19, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em" },
  waitSub: { fontSize: 12.5, color: "#6B7280", marginTop: 6, lineHeight: 1.5 },
  waitProgress: { height: 4, background: "#EEF3F8", borderRadius: 999, overflow: "hidden", position: "relative", marginTop: 14 },
  waitProgressShimmer: { position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, #0A6BCF, transparent)", width: "50%", animation: "ex-shimmer 1.8s infinite" },

  statusTimeline: { padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14 },
  statusRow: { display: "flex", alignItems: "center", gap: 10 },
  statusDotDone: { width: 22, height: 22, borderRadius: "50%", background: "#18A66A", display: "grid", placeItems: "center", flexShrink: 0 },
  statusDotNow: { width: 22, height: 22, borderRadius: "50%", background: "#0A6BCF", boxShadow: "0 0 0 4px rgba(10,107,207,0.20)", display: "grid", placeItems: "center", flexShrink: 0 },
  statusDotNowInner: { width: 8, height: 8, borderRadius: "50%", background: "#FFFFFF" },
  statusDotOff: { width: 22, height: 22, borderRadius: "50%", background: "#EEF3F8", border: "1.5px solid #E1E8F0", flexShrink: 0 },
  statusLine: { width: 2, height: 14, background: "#E1E8F0", marginLeft: 10, borderRadius: 1 },
  statusTitle: { fontSize: 12.5, fontWeight: 700, color: "#0E2C56" },
  statusSub: { fontSize: 11, color: "#6B7280", marginTop: 2 },

  // ===== Working =====
  workHero: { padding: 18, background: "#FFFFFF", border: "1.5px solid rgba(10,107,207,0.25)", borderRadius: 18, textAlign: "center", marginBottom: 10, boxShadow: "0 4px 14px rgba(10,107,207,0.08)" },
  workIconWrap: { position: "relative", width: 80, height: 80, display: "grid", placeItems: "center", margin: "0 auto 10px" },
  workRing: { position: "absolute", inset: -10, borderRadius: "50%", border: "2px solid rgba(10,107,207,0.30)", animation: "ex-pulse 1.6s infinite" },
  workCircle: { width: 70, height: 70, borderRadius: "50%", background: "linear-gradient(135deg,#0A6BCF,#0894EA)", display: "grid", placeItems: "center", boxShadow: "0 8px 18px rgba(10,107,207,0.30)" },
  workLabel: { display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", background: "rgba(10,107,207,0.10)", color: "#0A6BCF", borderRadius: 999, fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".08em" },
  liveDotBig: { display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#0A6BCF", boxShadow: "0 0 0 3px rgba(10,107,207,0.30)" },
  workTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800, color: "#0E2C56", marginTop: 6, letterSpacing: "-0.01em" },

  timerCard: { padding: "14px 16px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, marginBottom: 10 },
  timerCardHead: { display: "flex", alignItems: "center", gap: 5, marginBottom: 6 },
  timerCardLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#0A6BCF", letterSpacing: ".1em", fontWeight: 700 },
  timerEstimate: { marginLeft: "auto", padding: "1px 7px", background: "rgba(14,44,86,0.05)", color: "#6B7280", borderRadius: 999, fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  timerCardVal: { fontFamily: "'Manrope', sans-serif", fontSize: 32, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em", lineHeight: 1, fontVariantNumeric: "tabular-nums" },
  timerCardSec: { fontSize: 20, color: "#9CA3AF" },
  timerCardBar: { marginTop: 10, height: 4, background: "#EEF3F8", borderRadius: 999, overflow: "hidden" },
  timerCardFill: { height: "100%", background: "linear-gradient(90deg,#0A6BCF,#18C1FF)", borderRadius: 999 },

  approvedNote: { display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "rgba(24,166,106,0.06)", border: "1px solid rgba(24,166,106,0.25)", borderRadius: 10, fontSize: 11.5, color: "#6B7280", marginTop: 4 },

  // ===== Close screen =====
  requiredBadge: { padding: "2px 8px", background: "rgba(220,38,38,0.10)", color: "#DC2626", borderRadius: 999, fontSize: 9.5, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".04em" },
  evidenceGrid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 },
  notesWrap: { padding: "12px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12 },
  closeSummary: { padding: 14, background: "#FFFFFF", border: "1.5px solid #0A6BCF", borderRadius: 14 },
  closeRow: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: "1px solid #F0F4F9" },
  closeLabel: { fontSize: 13, color: "#6B7280", fontWeight: 500 },
  closeAmt: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 22, color: "#0E2C56", letterSpacing: "-0.02em" },
  closeMethodRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #F0F4F9" },
  closeMethodLabel: { fontSize: 11.5, color: "#6B7280" },
  closeMethodVal: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#0E2C56", fontWeight: 600 },
  payCardMark: { background: "linear-gradient(135deg,#1A1F71,#2942AC)", color: "#FFFFFF", padding: "2px 6px", borderRadius: 4, fontFamily: "'Manrope', sans-serif", fontSize: 9, fontWeight: 800, fontStyle: "italic", letterSpacing: ".06em" },
  preauthChip: { display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", background: "rgba(24,166,106,0.12)", color: "#0F8A56", borderRadius: 999, fontSize: 9.5, fontWeight: 700, marginLeft: 4 },
  closeEarn: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12 },
  closeEarnLabel: { fontSize: 11.5, color: "#6B7280" },
  closeEarnVal: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 18, color: "#0F8A56", letterSpacing: "-0.02em" },

  // ===== Success digital =====
  successHero: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", width: "100%" },
  successIconWrap: { position: "relative", width: 130, height: 130, display: "grid", placeItems: "center", marginBottom: 12 },
  successRing1: { position: "absolute", inset: -16, borderRadius: "50%", border: "2px solid rgba(24,166,106,0.20)" },
  successRing2: { position: "absolute", inset: -32, borderRadius: "50%", border: "2px solid rgba(24,166,106,0.10)" },
  successCircle: { width: 110, height: 110, borderRadius: "50%", background: "linear-gradient(135deg,#18A66A,#4ED896)", display: "grid", placeItems: "center", boxShadow: "0 16px 36px rgba(24,166,106,0.40)" },
  successTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 24, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em", marginTop: 8 },
  successSub: { fontSize: 13, color: "#6B7280", marginTop: 8, maxWidth: 300, lineHeight: 1.5 },

  successEarnCard: { width: "100%", marginTop: 22, padding: 18, background: "linear-gradient(135deg, #0A6BCF 0%, #0894EA 70%, #18C1FF 100%)", borderRadius: 18, color: "#FFFFFF", boxShadow: "0 12px 28px rgba(10,107,207,0.30)" },
  successEarnTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  successEarnLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.85)", letterSpacing: ".1em", fontWeight: 700 },
  successPreAuthChip: { display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 8px", background: "rgba(255,255,255,0.18)", borderRadius: 999, fontSize: 9.5, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".04em" },
  successEarnVal: { fontFamily: "'Manrope', sans-serif", fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 },
  successEarnDec: { fontSize: 24, opacity: 0.85 },
  successEarnCurr: { fontSize: 12, opacity: 0.65, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, marginLeft: 6 },

  successEarnRows: { marginTop: 16, padding: 12, background: "rgba(255,255,255,0.10)", borderRadius: 10 },
  successEarnRow: { display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12 },
  successEarnRowLabel: { color: "rgba(255,255,255,0.85)" },
  successEarnRowVal: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 12.5 },
  successEarnRowFinal: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, marginTop: 4, borderTop: "1px solid rgba(255,255,255,0.18)", fontSize: 12 },
  successEarnMethod: { display: "inline-flex", alignItems: "center", gap: 5 },

  successDepRow: { display: "flex", alignItems: "center", gap: 6, marginTop: 12, padding: "8px 11px", background: "rgba(24,166,106,0.30)", borderRadius: 10, fontSize: 11.5 },

  // ===== Cash hero =====
  cashHero: { padding: 20, background: "linear-gradient(160deg, rgba(24,166,106,0.10), rgba(78,216,150,0.04))", border: "1.5px solid rgba(24,166,106,0.35)", borderRadius: 18, textAlign: "center", marginBottom: 14 },
  cashIcon: { width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg,#18A66A,#4ED896)", display: "grid", placeItems: "center", margin: "0 auto 8px", boxShadow: "0 10px 22px rgba(24,166,106,0.35)" },
  cashLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#0F8A56", letterSpacing: ".1em", fontWeight: 700 },
  cashAmount: { fontFamily: "'Manrope', sans-serif", fontSize: 44, fontWeight: 800, color: "#0F8A56", letterSpacing: "-0.02em", lineHeight: 1, marginTop: 4 },
  cashAmountCurr: { fontSize: 14, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
  cashSub: { fontSize: 12, color: "#6B7280", marginTop: 6 },
  cashHelper: { marginTop: 16, padding: 10, background: "rgba(255,255,255,0.65)", border: "1px dashed rgba(24,166,106,0.30)", borderRadius: 10 },
  cashHelperLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#9CA3AF", letterSpacing: ".1em", fontWeight: 700, display: "block", marginBottom: 6 },
  cashHelperRow: { display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 4 },
  cashHelperChip: { padding: "3px 8px", background: "#FFFFFF", border: "1px solid rgba(24,166,106,0.30)", borderRadius: 6, fontSize: 11, color: "#0F8A56", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  cashHelperPlus: { fontSize: 11, color: "#9CA3AF", fontWeight: 700 },

  // ===== Bilateral =====
  bilateralCard: { padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14 },
  bilateralStep: { display: "flex", alignItems: "center", gap: 10 },
  bilateralAvBlue: { width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#0A6BCF,#0894EA)", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 11, flexShrink: 0 },
  bilateralAvClient: { width: 32, height: 32, borderRadius: "50%", background: CLIENT_TONE, color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 11, flexShrink: 0 },
  bilateralStepTitle: { fontSize: 12.5, fontWeight: 700, color: "#0E2C56" },
  bilateralStepSub: { fontSize: 10.5, color: "#9CA3AF", marginTop: 2 },
  bilateralLine: { width: 2, height: 14, background: "#E1E8F0", marginLeft: 15, borderRadius: 1 },
  bilateralPending: { padding: "2px 8px", background: "rgba(245,158,11,0.14)", color: "#B45309", borderRadius: 999, fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".04em", textTransform: "uppercase" },

  warnCard: { display: "flex", gap: 10, padding: 12, background: "rgba(245,158,11,0.08)", border: "1.5px solid rgba(245,158,11,0.35)", borderRadius: 12, marginTop: 14 },
  warnIcon: { width: 28, height: 28, borderRadius: 8, background: "rgba(245,158,11,0.15)", display: "grid", placeItems: "center", flexShrink: 0 },
  warnTitle: { fontSize: 12, fontWeight: 700, color: "#7B3F00" },
  warnText: { fontSize: 11, color: "#7B3F00", marginTop: 4, lineHeight: 1.5 },
  warnLink: { color: "#B45309", textDecoration: "underline", fontWeight: 700 },
};

const kf = document.createElement("style");
kf.textContent = `
  @keyframes ex-pulse { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.08); opacity: 0; } }
  @keyframes ex-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
`;
document.head.appendChild(kf);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
