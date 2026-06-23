/* global React, ReactDOM */
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

const TONES = [
  "linear-gradient(135deg,#0A6BCF,#18C1FF)",
  "linear-gradient(135deg,#F59E0B,#FBBF24)",
  "linear-gradient(135deg,#18A66A,#4ED896)",
  "linear-gradient(135deg,#7C3AED,#A78BFA)",
  "linear-gradient(135deg,#B45309,#F59E0B)",
];

function Avatar({ size = 40, initials = "RH", tone = 0, verified, online }) {
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: TONES[tone % TONES.length], color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: size * 0.32 }}>{initials}</div>
      {verified && <div style={{ position: "absolute", right: -2, bottom: -2, width: size * 0.30, height: size * 0.30, borderRadius: "50%", background: "#18A66A", border: `${Math.max(1.5, size * 0.04)}px solid #FFFFFF`, display: "grid", placeItems: "center" }}><Ic name="check" size={size * 0.18} color="#FFFFFF" stroke={3.5} /></div>}
      {online && <div style={{ position: "absolute", right: 0, bottom: 0, width: size * 0.22, height: size * 0.22, borderRadius: "50%", background: "#18A66A", border: `${Math.max(1.5, size * 0.035)}px solid #FFFFFF` }} />}
    </div>
  );
}

function Stars({ value = 5, size = 11 }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[...Array(5)].map((_, n) => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24">
          <path d="M12 2.5l2.95 6.42 7.05.78-5.28 4.78 1.52 6.92L12 18.27l-6.24 3.13 1.52-6.92L2 9.7l7.05-.78L12 2.5z" fill={n < value ? "#F59E0B" : "#E1E8F0"} />
        </svg>
      ))}
    </span>
  );
}

// =====================================================================
// LAYOUT
// =====================================================================
function PageHero() {
  return (
    <div style={l.hero}>
      <div style={l.heroBg}>
        <div style={l.heroGlow1} />
        <div style={l.heroGlow2} />
      </div>
      <div style={l.heroInner}>
        <div style={l.heroTopRow}>
          <div style={l.heroLogo}>
            <span style={{ color: "#18C1FF" }}>Tu</span>
            <span>mantenimiento</span>
            <span style={l.heroLogoPro}>UI</span>
          </div>
          <a href="UILibraryDataDisplay.html" style={l.heroVer}>← Sección 5 · Data Display</a>
        </div>
        <div style={l.heroEyebrow}>SECCIÓN 06 · FINAL</div>
        <div style={l.heroTitle}>Domain-Specific</div>
        <div style={l.heroSub}>
          Componentes de negocio que componen primitives + containers. Solo viven en Tumantenimiento — la capa donde diseño y producto se encuentran.
        </div>
        <div style={l.heroMetaRow}>
          <span style={l.heroChip}><Ic name="check" size={11} color="#4ED896" /><span>5 secciones previas</span></span>
          <span style={l.heroChip}><Ic name="circle-dot" size={11} color="#FBBF24" /><span>Domain · esta</span></span>
          <span style={l.heroChip}><Ic name="package" size={11} color="#FFFFFF" /><span>8 componentes</span></span>
          <span style={l.heroChip}><Ic name="hand" size={11} color="#FFFFFF" /><span>Listo para Claude Code</span></span>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ num, title, sub }) {
  return (
    <div style={l.sectionHeader}>
      <div style={l.sectionHeaderLeft}>
        <span style={l.sectionNum}>{num}</span>
        <div>
          <div style={l.sectionTitle}>{title}</div>
          <div style={l.sectionSub}>{sub}</div>
        </div>
      </div>
      <div style={l.sectionLine} />
    </div>
  );
}

function ComponentBlock({ id, name, codeName, desc, mobileGrid, desktopGrid, props, tokens, notes, useCases }) {
  return (
    <div style={l.componentBlock} id={id}>
      <div style={l.componentTopRow}>
        <div>
          <div style={l.componentTitle}>
            <span>{name}</span>
            <span style={l.componentCodeName}>{codeName}</span>
          </div>
          <div style={l.componentDesc}>{desc}</div>
        </div>
        <div style={l.componentLinks}>
          <span style={l.componentLink}><Ic name="link" size={11} color="#0A6BCF" /><span>copiar</span></span>
        </div>
      </div>
      <div style={l.componentGrid}>
        <div style={l.componentMain}>
          {mobileGrid && (
            <>
              <div style={l.platformRow}><div style={l.platformLabel}><Ic name="smartphone" size={12} color="#0A6BCF" /><span>MOBILE · 390 px</span></div></div>
              <div style={l.platformPanel}>{mobileGrid}</div>
            </>
          )}
          {desktopGrid && (
            <>
              <div style={l.platformRow}><div style={l.platformLabel}><Ic name="monitor" size={12} color="#0A6BCF" /><span>DESKTOP · 1440 px</span></div></div>
              <div style={l.platformPanel}>{desktopGrid}</div>
            </>
          )}
        </div>
        <div style={l.specCard}>
          <div style={l.specHead}><span style={l.specHeadLabel}>SPEC</span><span style={l.specHeadName}>{codeName}</span></div>
          {props && (
            <div>
              <div style={l.specSectionLabel}>PROPS</div>
              <div style={l.propsHead}>
                <span style={{ flex: 1.4 }}>name</span>
                <span style={{ flex: 1.2 }}>type</span>
                <span style={{ flex: 1 }}>default</span>
              </div>
              {props.map((p, idx) => (
                <div key={idx} style={l.propsRow}>
                  <span style={l.propName}>{p.name}{p.required && <span style={l.propReq}>*</span>}</span>
                  <span style={l.propType}>{p.type}</span>
                  <span style={l.propDefault}>{p.default || "—"}</span>
                </div>
              ))}
            </div>
          )}
          {tokens && (
            <div>
              <div style={l.specSectionLabel}>TOKENS</div>
              <div style={l.tokenList}>{tokens.map((t, idx) => <div key={idx} style={l.tokenRow}><span style={l.tokenCat}>{t.cat}</span><span style={l.tokenVal}>{t.val}</span></div>)}</div>
            </div>
          )}
          {notes && (
            <div>
              <div style={l.specSectionLabel}>NOTAS</div>
              <ul style={l.notesList}>{notes.map((n, idx) => <li key={idx} style={l.notesItem}>{n}</li>)}</ul>
            </div>
          )}
          {useCases && (
            <div>
              <div style={l.specSectionLabel}>CASOS DE USO</div>
              <div style={l.useCases}>{useCases.map((u, idx) => <div key={idx} style={l.useCaseRow}><div style={l.useCaseDot} /><span>{u}</span></div>)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 6.1 TECHNICIAN CARD
// =====================================================================
function TechCard({ variant = "featured" }) {
  if (variant === "compact") {
    return (
      <div style={d.techCardCompact}>
        <Avatar size={44} initials="RH" tone={0} verified />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={d.techName}>Ramón Hernández</div>
          <div style={d.techMeta}>
            <Ic name="wrench" size={10} color="#0A6BCF" />
            <span style={d.techCat}>Plomería</span>
            <span style={d.bullet} />
            <Stars value={5} size={9} />
            <b style={{ color: "#0E2C56", fontWeight: 700, fontSize: 11 }}>4.8</b>
            <span style={{ color: "#9CA3AF", fontSize: 10.5 }}>(214)</span>
          </div>
          <div style={d.techBottomRow}>
            <span style={d.techDistChip}><Ic name="map-pin" size={9} color="#6B7280" /><span>2.3 km</span></span>
            <span style={d.bullet} />
            <span style={d.techPrice}>desde <b style={{ color: "#0E2C56", fontWeight: 800 }}>$450</b></span>
          </div>
        </div>
        <button style={d.techCompactBtn}>Ver</button>
      </div>
    );
  }
  if (variant === "mini") {
    return (
      <div style={d.techCardMini}>
        <Avatar size={36} initials="RH" tone={0} verified />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={d.techNameMini}>Ramón H.</div>
          <div style={d.techMetaMini}>
            <Stars value={5} size={9} />
            <b style={{ fontSize: 10.5, color: "#0E2C56" }}>4.8</b>
          </div>
        </div>
      </div>
    );
  }
  // featured
  return (
    <div style={d.techCardFeatured}>
      <div style={d.techFeaturedRibbon}>
        <Ic name="award" size={9} color="#FFFFFF" />
        <span>TOP EN ZONA</span>
      </div>
      <div style={d.techFeaturedTop}>
        <Avatar size={56} initials="RH" tone={0} verified online />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={d.techNameLg}>Ramón Hernández García</div>
          <div style={d.techTrade}>Plomería · 12 años de oficio</div>
          <div style={d.techMeta}>
            <Stars value={5} size={11} />
            <b style={{ color: "#0E2C56", fontWeight: 800, fontSize: 12 }}>4.8</b>
            <span style={{ color: "#9CA3AF", fontSize: 11 }}>(214 trabajos)</span>
            <span style={d.bullet} />
            <span style={d.techDistChip}><Ic name="map-pin" size={9} color="#6B7280" /><span>2.3 km</span></span>
          </div>
        </div>
      </div>
      <div style={d.techChipsRow}>
        <span style={d.techCatChip}>Calentadores</span>
        <span style={d.techCatChip}>Drenaje</span>
        <span style={d.techCatChip}>Emergencias 24h</span>
        <span style={d.techCatChipMore}>+2</span>
      </div>
      <div style={d.techFooterRow}>
        <div>
          <div style={d.techPriceLabel}>DESDE</div>
          <div style={d.techPriceLg}>$450 <span style={d.techPriceCurr}>MXN</span></div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button style={d.techBtnGhost}><Ic name="heart" size={13} color="#0A6BCF" /></button>
          <button style={d.techBtnPrimary}><Ic name="calendar" size={13} color="#FFFFFF" /><span>Agendar</span></button>
        </div>
      </div>
    </div>
  );
}

function TechCardGrid({ desktop }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={d.subLabel}>FEATURED · home carousel</div>
        <TechCard variant="featured" />
      </div>
      <div>
        <div style={d.subLabel}>COMPACT · resultados de búsqueda</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <TechCard variant="compact" />
          <TechCard variant="compact" />
        </div>
      </div>
      <div>
        <div style={d.subLabel}>MINI · favoritos / sugerencia rápida</div>
        <div style={{ display: "flex", gap: 6 }}>
          <TechCard variant="mini" />
          <TechCard variant="mini" />
          <TechCard variant="mini" />
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 6.2 SERVICE STATUS CARD
// =====================================================================
function ServiceStatusCard({ status }) {
  const map = {
    requested: { icon: "clock-3",        title: "Esperando respuesta",         sub: "El técnico tiene 30 min para aceptar.", grad: "linear-gradient(135deg, rgba(245,158,11,0.10), rgba(251,191,36,0.05))", border: "rgba(245,158,11,0.35)", iconBg: "linear-gradient(135deg,#F59E0B,#FBBF24)", color: "#B45309", timer: "27:42", timerColor: "#B45309" },
    accepted:  { icon: "check",          title: "Ramón aceptó tu solicitud",   sub: "Agendado para hoy a las 3:00 PM.",      grad: "linear-gradient(135deg, rgba(24,166,106,0.10), rgba(78,216,150,0.05))", border: "rgba(24,166,106,0.35)", iconBg: "linear-gradient(135deg,#18A66A,#4ED896)", color: "#0F8A56" },
    enroute:   { icon: "truck",          title: "Ramón viene en camino",        sub: "Llegará en ~18 min.",                   grad: "linear-gradient(135deg, rgba(10,107,207,0.10), rgba(24,193,255,0.04))", border: "rgba(10,107,207,0.30)", iconBg: "linear-gradient(135deg,#0A6BCF,#18C1FF)", color: "#0A6BCF", eta: "18 min" },
    onsite:    { icon: "map-pin",        title: "Ramón llegó al sitio",         sub: "Check-in 14:58 · diagnóstico en curso", grad: "linear-gradient(135deg, rgba(10,107,207,0.08), rgba(24,193,255,0.04))", border: "rgba(10,107,207,0.30)", iconBg: "linear-gradient(135deg,#0A6BCF,#0894EA)", color: "#0A6BCF" },
    quote:     { icon: "receipt-text",   title: "Cotización para aprobar",      sub: "Ramón actualizó el monto a $850 MXN.",  grad: "linear-gradient(135deg, rgba(245,158,11,0.10), rgba(251,191,36,0.05))", border: "rgba(245,158,11,0.40)", iconBg: "linear-gradient(135deg,#F59E0B,#FBBF24)", color: "#B45309", urgent: true },
    working:   { icon: "wrench",         title: "Trabajo en ejecución",         sub: "Llevas 1h 12m trabajando.",              grad: "linear-gradient(135deg, rgba(10,107,207,0.08), rgba(24,193,255,0.04))", border: "rgba(10,107,207,0.30)", iconBg: "linear-gradient(135deg,#0A6BCF,#0894EA)", color: "#0A6BCF", live: true },
    completed: { icon: "check-check",    title: "¡Trabajo completado!",         sub: "Revisa la evidencia y procede al pago.", grad: "linear-gradient(135deg, rgba(24,166,106,0.12), rgba(78,216,150,0.06))", border: "rgba(24,166,106,0.40)", iconBg: "linear-gradient(135deg,#18A66A,#4ED896)", color: "#0F8A56" },
    cancelled: { icon: "x",              title: "Servicio cancelado",            sub: "Reembolso procesado · revisa tu correo.", grad: "linear-gradient(135deg, rgba(220,38,38,0.06), rgba(220,38,38,0.02))", border: "rgba(220,38,38,0.30)", iconBg: "linear-gradient(135deg,#DC2626,#EA580C)", color: "#DC2626" },
  };
  const s = map[status];
  return (
    <div style={{ padding: 16, background: s.grad, border: `1.5px solid ${s.border}`, borderRadius: 16, textAlign: "center", position: "relative" }}>
      {s.urgent && <span style={d.urgentRibbon}>ACCIÓN REQUERIDA</span>}
      <div style={{ position: "relative", width: 64, height: 64, borderRadius: "50%", background: s.iconBg, display: "grid", placeItems: "center", margin: "0 auto 10px", boxShadow: `0 8px 18px ${s.color}40` }}>
        <Ic name={s.icon} size={26} color="#FFFFFF" />
        {s.live && <div style={d.iconPulse} />}
      </div>
      <div style={d.statusTitle}>{s.title}</div>
      <div style={d.statusSub}>{s.sub}</div>
      {s.timer && (
        <div style={{ ...d.statusTimerBox, color: s.timerColor }}>
          <Ic name="timer" size={11} color={s.timerColor} />
          <span style={d.statusTimerLabel}>RESPUESTA EN</span>
          <span style={{ ...d.statusTimerVal, color: s.timerColor }}>{s.timer}</span>
        </div>
      )}
      {s.eta && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, padding: "3px 9px", background: "rgba(255,255,255,0.65)", borderRadius: 999, fontSize: 11, color: s.color, fontWeight: 700 }}>
          <Ic name="clock" size={9} color={s.color} />
          <span>ETA · {s.eta}</span>
        </div>
      )}
      {status === "quote" && (
        <div style={{ display: "flex", gap: 6, marginTop: 12, justifyContent: "center" }}>
          <button style={{ ...d.techBtnGhost, padding: "8px 14px", border: "1px solid #E1E8F0" }}><span>Ver detalle</span></button>
          <button style={{ ...d.techBtnPrimary, background: s.iconBg, boxShadow: `0 4px 10px ${s.color}40` }}><Ic name="check" size={12} color="#FFFFFF" stroke={3} /><span>Aprobar $850</span></button>
        </div>
      )}
    </div>
  );
}

function ServiceStatusGrid({ desktop }) {
  const all = [
    { status: "requested", label: "REQUESTED · esperando" },
    { status: "accepted",  label: "ACCEPTED · agendado" },
    { status: "enroute",   label: "EN ROUTE · ETA" },
    { status: "onsite",    label: "ON SITE · diagnóstico" },
    { status: "quote",     label: "QUOTE · acción requerida" },
    { status: "working",   label: "WORKING · live" },
    { status: "completed", label: "COMPLETED · pago" },
    { status: "cancelled", label: "CANCELLED" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: 14 }}>
      {all.map(s => (
        <div key={s.status}>
          <div style={d.subLabel}>{s.label}</div>
          <ServiceStatusCard status={s.status} />
        </div>
      ))}
    </div>
  );
}

// =====================================================================
// 6.3 PRICE BREAKDOWN
// =====================================================================
function PriceBreakdown({ role = "cliente" }) {
  const isTech = role === "tecnico";
  return (
    <div style={d.priceCard}>
      <div style={d.priceHead}>
        <div style={d.priceIconWrap}><Ic name="receipt-text" size={14} color="#0A6BCF" /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={d.priceLabel}>{isTech ? "TU GANANCIA" : "DESGLOSE"}</div>
          <div style={d.priceSubLabel}>{isTech ? "Tras comisión plataforma 15%" : "Servicio #SVC-2851 · Plomería"}</div>
        </div>
      </div>
      <div style={d.priceRowsWrap}>
        <PriceRow label="Tarifa base · Plomería" val="$450" />
        <PriceRow indent label="Cambio de llave" val="+$250" extra />
        <PriceRow indent label="Sellado de tubería" val="+$150" extra />
        <PriceRow label="Subtotal" val="$850" semi divider />
        {isTech && <PriceRow label="Comisión plataforma" pill="15%" val="−$127.50" muted />}
      </div>

      <div style={{ ...d.priceTotal, ...(isTech ? d.priceTotalTech : null) }}>
        <div>
          <div style={d.priceTotalLabel}>{isTech ? "GANANCIA NETA" : "TOTAL A PAGAR"}</div>
          <div style={d.priceTotalSub}>{isTech ? "Se libera al completar" : "Tarjeta Visa •••• 1234"}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ ...d.priceTotalVal, color: isTech ? "#FFFFFF" : "#0A6BCF" }}>{isTech ? "$722" : "$850"}<span style={d.priceTotalDec}>{isTech ? ".50" : ".00"}</span></div>
          <div style={{ ...d.priceTotalCurr, color: isTech ? "rgba(255,255,255,0.75)" : "#9CA3AF" }}>MXN</div>
        </div>
      </div>
    </div>
  );
}

function PriceRow({ label, val, indent, extra, semi, muted, divider, pill }) {
  return (
    <>
      {divider && <div style={d.priceDivider} />}
      <div style={{ ...d.priceRow, paddingLeft: indent ? 16 : 0 }}>
        {indent && <Ic name="corner-down-right" size={10} color="#9CA3AF" />}
        <span style={{ ...d.priceRowLabel, color: muted ? "#9CA3AF" : "#0E2C56", fontWeight: semi ? 700 : 500 }}>{label}</span>
        {pill && <span style={d.pricePill}>{pill}</span>}
        <span style={{ ...d.priceRowVal, color: extra ? "#0A6BCF" : muted ? "#9CA3AF" : "#0E2C56", fontWeight: semi ? 800 : 700 }}>{val}</span>
      </div>
    </>
  );
}

function PriceBreakdownGrid({ desktop }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: 14 }}>
      <div>
        <div style={d.subLabel}>CLIENTE · ve total a pagar</div>
        <PriceBreakdown role="cliente" />
      </div>
      <div>
        <div style={d.subLabel}>TÉCNICO · ve ganancia neta</div>
        <PriceBreakdown role="tecnico" />
      </div>
    </div>
  );
}

// =====================================================================
// 6.4 CHAT MESSAGE BUBBLE
// =====================================================================
function ChatBubble({ variant, text, time, attach, status, name, avInitials, avTone }) {
  if (variant === "system") {
    return (
      <div style={d.bubbleSys}>
        <Ic name="info" size={10} color="#9CA3AF" />
        <span>{text}</span>
        {time && <span style={d.bubbleSysTime}>{time}</span>}
      </div>
    );
  }
  const isOwn = variant === "own";
  return (
    <div style={{ display: "flex", justifyContent: isOwn ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}>
      {!isOwn && <Avatar size={28} initials={avInitials} tone={avTone} />}
      <div style={{ maxWidth: "75%" }}>
        {name && <div style={{ ...d.bubbleName, textAlign: isOwn ? "right" : "left" }}>{name}</div>}
        <div style={{
          padding: "10px 12px",
          background: isOwn ? "linear-gradient(135deg, #0A6BCF, #0894EA)" : "#FFFFFF",
          color: isOwn ? "#FFFFFF" : "#0E2C56",
          border: isOwn ? "none" : "1px solid #E1E8F0",
          borderRadius: isOwn ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
          boxShadow: isOwn ? "0 4px 10px rgba(10,107,207,0.20)" : "0 2px 6px rgba(14,44,86,0.05)",
        }}>
          {text && <div style={{ fontSize: 13, lineHeight: 1.5 }}>{text}</div>}
          {attach && (
            <div style={{ display: "flex", gap: 5, marginTop: text ? 8 : 0 }}>
              {attach.map((a, i) => (
                <div key={i} style={{ width: 70, height: 70, borderRadius: 8, background: a, display: "grid", placeItems: "center" }}>
                  <Ic name="image" size={14} color="rgba(255,255,255,0.85)" />
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, justifyContent: isOwn ? "flex-end" : "flex-start" }}>
            <span style={{ fontSize: 10, color: isOwn ? "rgba(255,255,255,0.70)" : "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{time}</span>
            {isOwn && status === "read" && <Ic name="check-check" size={11} color="#18C1FF" />}
            {isOwn && status === "sent" && <Ic name="check" size={11} color="rgba(255,255,255,0.65)" />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatBubbleGrid({ desktop }) {
  return (
    <div>
      <div style={d.subLabel}>CONVERSACIÓN COMPLETA · cliente → técnico</div>
      <div style={d.chatThread}>
        <ChatBubble variant="system" text="María Rodríguez (Cliente) inició el chat" time="14:00" />
        <ChatBubble variant="other" avInitials="MR" avTone={1} name="María R." time="14:01"
          text="Hola Ramón, ¿cómo estás? Tengo una fuga debajo del lavabo del baño desde ayer." />
        <ChatBubble variant="other" avInitials="MR" avTone={1} time="14:01"
          attach={["linear-gradient(135deg,#B45309,#F59E0B)", "linear-gradient(135deg,#0A6BCF,#0894EA)"]} />
        <ChatBubble variant="own" name="Tú" time="14:05" status="read"
          text="Hola María. Veo en la foto que es la llave del lavabo. Puedo ir hoy a las 3 PM, ¿te queda bien?" />
        <ChatBubble variant="own" name="Tú" time="14:06" status="read"
          text="Llevaré una llave nueva por si necesitamos reemplazar. Cotizo $450 base + $250 si hay que cambiar la llave." />
        <ChatBubble variant="system" text="María aprobó la cotización · $700 MXN" time="14:08" />
        <ChatBubble variant="other" avInitials="MR" avTone={1} time="14:09"
          text="Perfecto, ahí estaré 👍🏼" />
      </div>
    </div>
  );
}

// =====================================================================
// 6.5 RATING STARS INPUT
// =====================================================================
function RatingInput({ value }) {
  const labels = [
    { stars: 1, label: "Muy mal",   color: "#DC2626", bg: "rgba(220,38,38,0.10)", emoji: "frown" },
    { stars: 2, label: "Mal",       color: "#EA580C", bg: "rgba(234,88,12,0.10)", emoji: "annoyed" },
    { stars: 3, label: "Regular",   color: "#B45309", bg: "rgba(245,158,11,0.14)", emoji: "meh" },
    { stars: 4, label: "Bien",      color: "#0F8A56", bg: "rgba(24,166,106,0.10)", emoji: "smile" },
    { stars: 5, label: "Excelente", color: "#0F8A56", bg: "rgba(24,166,106,0.14)", emoji: "smile-plus" },
  ];
  const lbl = labels[value - 1];
  const showPos = value >= 4;
  const showNeg = value > 0 && value <= 2;
  return (
    <div style={d.ratingCard}>
      <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
        {[1,2,3,4,5].map(n => (
          <button key={n} style={{ ...d.starBtn, ...(n <= value ? d.starBtnActive : null) }}>
            <svg width="36" height="36" viewBox="0 0 24 24" style={{ filter: n <= value ? "drop-shadow(0 2px 6px rgba(245,158,11,0.45))" : "none" }}>
              <path d="M12 2.5l2.95 6.42 7.05.78-5.28 4.78 1.52 6.92L12 18.27l-6.24 3.13 1.52-6.92L2 9.7l7.05-.78L12 2.5z" fill={n <= value ? "#F59E0B" : "#FFFFFF"} stroke={n <= value ? "#F59E0B" : "#D1D9E2"} strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>
      {value === 0 && <div style={d.ratingPlaceholder}>Toca una estrella para calificar</div>}
      {value > 0 && (
        <div style={{ ...d.ratingLabel, background: lbl.bg, color: lbl.color }}>
          <Ic name={lbl.emoji} size={14} color={lbl.color} />
          <span><b style={{ fontWeight: 800 }}>{value}★</b> · {lbl.label}</span>
        </div>
      )}
      {showPos && (
        <div style={d.ratingChipsBox}>
          <div style={d.ratingChipsLabel}>¿QUÉ TE GUSTÓ?</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {[
              { label: "Puntual", sel: true, icon: "clock" },
              { label: "Limpio", icon: "sparkles" },
              { label: "Conocedor", sel: true, icon: "graduation-cap" },
              { label: "Amable", icon: "smile" },
              { label: "Precio justo", sel: true, icon: "tag" },
            ].map(c => (
              <span key={c.label} style={{ ...d.ratingChip, ...(c.sel ? d.ratingChipSel : null) }}>
                <Ic name={c.icon} size={10} color={c.sel ? "#FFFFFF" : "#0A6BCF"} stroke={2.2} />
                <span>{c.label}</span>
                {c.sel && <Ic name="check" size={9} color="#FFFFFF" stroke={3} />}
              </span>
            ))}
          </div>
        </div>
      )}
      {showNeg && (
        <div style={d.ratingChipsBox}>
          <div style={{ ...d.ratingChipsLabel, color: "#DC2626" }}>¿QUÉ SALIÓ MAL?</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {["Llegó tarde", "Trabajo incompleto", "Cobró de más"].map(c => (
              <span key={c} style={{ ...d.ratingChip, borderColor: "#DC2626", color: "#DC2626" }}>{c}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RatingInputGrid({ desktop }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr 1fr" : "1fr 1fr", gap: 14 }}>
      {[0, 1, 3, 5].map(v => (
        <div key={v}>
          <div style={d.subLabel}>{v === 0 ? "VACÍO" : `${v}★`}</div>
          <RatingInput value={v} />
        </div>
      ))}
    </div>
  );
}

// =====================================================================
// 6.6 KYC DOCUMENT CARD
// =====================================================================
function KycDocCard({ status }) {
  const map = {
    pending:  { color: "#B45309", bg: "rgba(245,158,11,0.14)", label: "PENDIENTE", icon: "clock" },
    approved: { color: "#0F8A56", bg: "rgba(24,166,106,0.12)", label: "APROBADO",  icon: "badge-check" },
    rejected: { color: "#DC2626", bg: "rgba(220,38,38,0.10)",  label: "RECHAZADO", icon: "x-circle" },
    illegible:{ color: "#6B7280", bg: "rgba(14,44,86,0.05)",   label: "ILEGIBLE",  icon: "eye-off" },
  };
  const s = map[status];
  const isFlagged = status === "rejected" || status === "illegible";
  return (
    <div style={d.kycCard}>
      <div style={{ ...d.kycThumb, opacity: isFlagged ? 0.5 : 1 }}>
        <KycSvg />
        {isFlagged && (
          <div style={d.kycThumbOverlay}>
            <Ic name={s.icon} size={20} color={s.color} />
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={d.kycTopRow}>
          <div>
            <div style={d.kycTitle}>INE · Anverso</div>
            <div style={d.kycSub}>Subido hace 28h · 1.2 MB</div>
          </div>
          <span style={{ ...d.kycStatusChip, background: s.bg, color: s.color }}>
            <Ic name={s.icon} size={9} color={s.color} stroke={2.4} />
            <span>{s.label}</span>
          </span>
        </div>
        <div style={d.kycActions}>
          {status === "pending" && (
            <>
              <button style={d.kycBtnApprove}><Ic name="check" size={11} color="#FFFFFF" stroke={3} /><span>Aprobar</span></button>
              <button style={d.kycBtnReject}><Ic name="x" size={11} color="#DC2626" /><span>Rechazar</span></button>
              <button style={d.kycBtnGhost}><Ic name="zoom-in" size={11} color="#0A6BCF" /></button>
            </>
          )}
          {status === "approved" && (
            <>
              <span style={d.kycApprovedNote}>Aprobado por Sofía A. · 19/05 12:08</span>
              <button style={d.kycBtnGhost}><Ic name="zoom-in" size={11} color="#0A6BCF" /></button>
            </>
          )}
          {(status === "rejected" || status === "illegible") && (
            <>
              <span style={{ ...d.kycApprovedNote, color: "#DC2626" }}>{status === "rejected" ? "Datos inconsistentes con CURP" : "Foto borrosa · reflejos"}</span>
              <button style={d.kycBtnGhost}><Ic name="rotate-cw" size={11} color="#0A6BCF" /><span>Re-subir</span></button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function KycSvg() {
  return (
    <svg viewBox="0 0 320 200" width="100%" height="100%" style={{ display: "block", borderRadius: 8 }}>
      <defs>
        <linearGradient id="kycBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F4E4BC" />
          <stop offset="1" stopColor="#E5D2A0" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="url(#kycBg)" />
      <rect width="320" height="26" fill="#15803D" />
      <text x="12" y="18" fontFamily="Inter" fontWeight="700" fontSize="9" fill="#FFFFFF">IDENTIFICACIÓN OFICIAL</text>
      <rect x="14" y="38" width="70" height="96" rx="3" fill="#E5D2A0" stroke="#94A3B8" strokeWidth="0.5" />
      <circle cx="49" cy="70" r="14" fill="#C8A874" />
      <text x="100" y="48" fontFamily="Inter" fontWeight="600" fontSize="6" fill="#6B7280">NOMBRE</text>
      <text x="100" y="62" fontFamily="Inter" fontWeight="700" fontSize="9" fill="#0E2C56">RAMÓN HERNÁNDEZ G.</text>
      <rect x="0" y="172" width="320" height="28" fill="#0F2A56" />
      <text x="14" y="190" fontFamily="'JetBrains Mono'" fontWeight="700" fontSize="8" fill="#FFFFFF">HEGR810521HJCRNM05</text>
    </svg>
  );
}

function KycDocCardGrid({ desktop }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: 12 }}>
      {[
        { status: "pending",   label: "PENDING · ámbar" },
        { status: "approved",  label: "APPROVED · verde" },
        { status: "rejected",  label: "REJECTED · rojo · datos inconsistentes" },
        { status: "illegible", label: "ILLEGIBLE · gris · foto borrosa" },
      ].map(s => (
        <div key={s.status}>
          <div style={d.subLabel}>{s.label}</div>
          <KycDocCard status={s.status} />
        </div>
      ))}
    </div>
  );
}

// =====================================================================
// 6.7 MAP CARD
// =====================================================================
function MapCard({ variant }) {
  return (
    <div style={d.mapCard}>
      <div style={d.mapCardMap}>
        <svg viewBox="0 0 360 180" width="100%" height="100%" style={{ display: "block", background: "#DDE7F1" }}>
          <defs>
            <pattern id="mc1" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M20 0 L0 0 0 20" fill="none" stroke="#CCD7E5" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="360" height="180" fill="url(#mc1)" />
          <path d="M 20 50 Q 140 30 240 60 Q 280 100 220 140 Q 100 150 30 120 Q 0 80 20 50" fill="rgba(180,210,180,0.30)" />
          <path d="M0 90 Q 180 80 360 100" stroke="#FFFFFF" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M180 0 Q 175 90 200 180" stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round" />
          {variant === "interactive" && (
            <>
              <path d="M 70 130 Q 140 90 200 60 Q 240 50 280 40" stroke="rgba(10,107,207,0.25)" strokeWidth="14" fill="none" strokeLinecap="round" />
              <path d="M 70 130 Q 140 90 200 60 Q 240 50 280 40" stroke="#0A6BCF" strokeWidth="4" fill="none" strokeLinecap="round" />
              <g transform="translate(70, 130)">
                <circle r="18" fill="rgba(10,107,207,0.20)" />
                <circle r="12" fill="#FFFFFF" stroke="#0A6BCF" strokeWidth="2.5" />
                <text y="3" textAnchor="middle" fontFamily="Manrope" fontWeight="700" fontSize="9" fill="#0A6BCF">RH</text>
              </g>
            </>
          )}
          <g transform={`translate(${variant === "interactive" ? 280 : 200}, 40)`}>
            <circle r="20" fill="rgba(220,38,38,0.20)" />
            <path d="M0,-12 a8,9 0 1 1 0.01,0 Z M0,0 L-3,-6 L3,-6 Z" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />
            <circle cy="-6" r="3" fill="#FFFFFF" />
          </g>
        </svg>
        {variant === "interactive" && (
          <div style={d.mapTopBubble}>
            <Ic name="route" size={11} color="#0A6BCF" />
            <span><b style={{ color: "#0E2C56", fontWeight: 800 }}>3.2 km</b></span>
            <span style={d.bullet} />
            <span><b style={{ color: "#0E2C56", fontWeight: 800 }}>12 min</b></span>
          </div>
        )}
        {variant === "static" && (
          <div style={d.mapTopBadge}>
            <Ic name="map-pin" size={10} color="#FFFFFF" />
            <span>UBICACIÓN</span>
          </div>
        )}
      </div>
      <div style={d.mapInfo}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={d.mapAddr}>Av. Patria 1234, Int. 5B</div>
          <div style={d.mapAddrSub}>Providencia, Zapopan · 45160</div>
        </div>
        <button style={d.mapBtn}>
          <Ic name="navigation" size={11} color="#FFFFFF" />
          <span>Ver en Google Maps</span>
        </button>
      </div>
    </div>
  );
}

function MapCardGrid({ desktop }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: 14 }}>
      <div>
        <div style={d.subLabel}>STATIC · display de dirección</div>
        <MapCard variant="static" />
      </div>
      <div>
        <div style={d.subLabel}>INTERACTIVE · ruta en vivo</div>
        <MapCard variant="interactive" />
      </div>
    </div>
  );
}

// =====================================================================
// 6.8 CATEGORY ICON
// =====================================================================
function CatIcon({ icon, label, variant = "default", size = 64 }) {
  const map = {
    default:  { bg: "rgba(10,107,207,0.10)", color: "#0A6BCF", labelColor: "#0E2C56" },
    selected: { bg: "linear-gradient(135deg,#0A6BCF,#0894EA)", color: "#FFFFFF", labelColor: "#0A6BCF", shadow: "0 6px 14px rgba(10,107,207,0.30)" },
    disabled: { bg: "rgba(14,44,86,0.04)", color: "#C8D4E0", labelColor: "#C8D4E0" },
  };
  const v = map[variant];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: v.bg, display: "grid", placeItems: "center",
        boxShadow: v.shadow || "none",
        transition: "all 0.15s",
      }}>
        <Ic name={icon} size={size * 0.35} color={v.color} stroke={2.2} />
      </div>
      {label && <span style={{ fontSize: 11.5, fontWeight: variant === "selected" ? 700 : 600, color: v.labelColor, textAlign: "center" }}>{label}</span>}
    </div>
  );
}

function CatIconGrid({ desktop }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={d.subLabel}>VARIANTS · SIZE 64</div>
        <div style={{ display: "flex", gap: 22 }}>
          <CatIcon icon="wrench" label="Plomería" variant="default" />
          <CatIcon icon="zap" label="Electricidad" variant="selected" />
          <CatIcon icon="snowflake" label="Climatiz." variant="disabled" />
        </div>
      </div>
      <div>
        <div style={d.subLabel}>SIZES</div>
        <div style={{ display: "flex", gap: 22, alignItems: "flex-end" }}>
          <CatIcon icon="wrench" label="60" size={60} />
          <CatIcon icon="wrench" label="68" size={68} />
          <CatIcon icon="wrench" label="76" size={76} />
        </div>
      </div>
      <div>
        <div style={d.subLabel}>GRID DE CATEGORÍAS · home cliente</div>
        <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(8, 1fr)" : "repeat(4, 1fr)", gap: 12, padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14 }}>
          <CatIcon icon="wrench" label="Plomería" />
          <CatIcon icon="zap" label="Electric." variant="selected" />
          <CatIcon icon="flame" label="Gas" />
          <CatIcon icon="paint-roller" label="Pintura" />
          <CatIcon icon="hammer" label="Herrería" />
          <CatIcon icon="droplets" label="Drenaje" />
          <CatIcon icon="square" label="Cristales" />
          <CatIcon icon="bug" label="Plagas" />
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// FINAL HANDOFF
// =====================================================================
function FinalHandoff() {
  return (
    <div style={l.finalHandoff}>
      <div style={l.finalHead}>
        <div style={l.finalIcon}><Ic name="party-popper" size={22} color="#FFFFFF" /></div>
        <div style={{ flex: 1 }}>
          <div style={l.finalEyebrow}>HANDOFF FINAL · COMPONENT LIBRARY v1.0</div>
          <div style={l.finalTitle}>Listo para implementación</div>
          <div style={l.finalSub}>6 secciones · 35 componentes · cliente · técnico · admin mobile + web</div>
        </div>
      </div>

      <div style={l.finalGrid}>
        <div style={l.finalCard}>
          <div style={l.finalCardLabel}>ÍNDICE COMPLETO · 35 COMPONENTES</div>
          <div style={l.finalCols}>
            <div>
              <b style={l.finalSubLabel}>01 PRIMITIVES (7)</b>
              <ul style={l.finalList}>
                <li>Button · Input · Badge</li>
                <li>Avatar · Chip · IconButton</li>
                <li>StarRating</li>
              </ul>
              <b style={l.finalSubLabel}>02 CONTAINERS (5)</b>
              <ul style={l.finalList}>
                <li>Card · ListItem · EmptyState</li>
                <li>Loading · Alert</li>
              </ul>
              <b style={l.finalSubLabel}>03 NAVIGATION (5)</b>
              <ul style={l.finalList}>
                <li>BottomTabBar · TopAppBar</li>
                <li>Sidebar · Breadcrumb · Tabs</li>
              </ul>
            </div>
            <div>
              <b style={l.finalSubLabel}>04 FORMS (6)</b>
              <ul style={l.finalList}>
                <li>Select · DatePicker · TimePicker</li>
                <li>Toggle · Checkbox/Radio · PhotoUpload</li>
              </ul>
              <b style={l.finalSubLabel}>05 DATA DISPLAY (4)</b>
              <ul style={l.finalList}>
                <li>Table · KPICard</li>
                <li>Timeline · StatsRow</li>
              </ul>
              <b style={l.finalSubLabel}>06 DOMAIN (8)</b>
              <ul style={l.finalList}>
                <li>TechnicianCard · ServiceStatusCard</li>
                <li>PriceBreakdown · ChatMessageBubble</li>
                <li>RatingInput · KycDocumentCard</li>
                <li>MapCard · CategoryIcon</li>
              </ul>
            </div>
          </div>
        </div>

        <div style={l.finalCard}>
          <div style={l.finalCardLabel}>ESTRUCTURA DE CARPETAS</div>
          <div style={l.finalCode}>
            <div><b>/src/components/</b></div>
            <div>{"  ui/"}</div>
            <div style={l.codeMuted}>{"    // primitives + forms + containers"}</div>
            <div>{"    button.tsx · input.tsx · badge.tsx"}</div>
            <div>{"    card.tsx · list-item.tsx · alert.tsx"}</div>
            <div>{"    select.tsx · date-picker.tsx · toggle.tsx"}</div>
            <div>{"    table.tsx · kpi-card.tsx · timeline.tsx"}</div>
            <div>{"  layout/"}</div>
            <div style={l.codeMuted}>{"    // navigation chrome"}</div>
            <div>{"    bottom-tab-bar.tsx · top-app-bar.tsx"}</div>
            <div>{"    sidebar.tsx · breadcrumb.tsx · tabs.tsx"}</div>
            <div>{"  domain/"}</div>
            <div style={l.codeMuted}>{"    // negocio Tumantenimiento"}</div>
            <div>{"    technician-card.tsx · service-status-card.tsx"}</div>
            <div>{"    price-breakdown.tsx · chat-bubble.tsx"}</div>
            <div>{"    rating-input.tsx · kyc-doc-card.tsx"}</div>
            <div>{"    map-card.tsx · category-icon.tsx"}</div>
            <div>{"  illustrations/"}</div>
            <div><b>/src/lib/tokens.ts</b></div>
          </div>
        </div>

        <div style={l.finalCard}>
          <div style={l.finalCardLabel}>STACK · WEB ADMIN</div>
          <ul style={l.finalList}>
            <li>Next.js 14 (App Router) + TypeScript</li>
            <li>Tailwind CSS · tokens en theme.extend</li>
            <li>shadcn/ui · base de primitives</li>
            <li>lucide-react · iconografía</li>
            <li>@tanstack/react-table · tables</li>
            <li>recharts · sparklines + gráficas</li>
            <li>cmdk · command palette sidebar</li>
            <li>react-hook-form + zod · forms</li>
            <li>date-fns · locale es-MX</li>
          </ul>
          <div style={{ ...l.finalCardLabel, marginTop: 14 }}>STACK · MOBILE (RN)</div>
          <ul style={l.finalList}>
            <li>Expo SDK 50+ · TypeScript</li>
            <li>React Navigation · stack + tabs</li>
            <li>lucide-react-native · iconografía</li>
            <li>react-native-svg · ilustraciones</li>
            <li>react-native-reanimated · animations</li>
            <li>@gorhom/bottom-sheet · sheets</li>
            <li>expo-image-picker · uploads</li>
            <li>expo-haptics · feedback</li>
            <li>react-native-maps · map cards</li>
          </ul>
        </div>

        <div style={l.finalCard}>
          <div style={l.finalCardLabel}>DESIGN TOKENS · referencia rápida</div>
          <div style={l.tokensGrid}>
            <TokenSwatch color="#0A6BCF" name="primary-blue" desc="CTA · enlaces · activos" />
            <TokenSwatch color="#0E2C56" name="deep-navy" desc="títulos · sidebar" />
            <TokenSwatch color="#18C1FF" name="accent-cyan" desc="highlights · info" />
            <TokenSwatch color="#18A66A" name="success-green" desc="solo verificación · pago" />
            <TokenSwatch color="#F59E0B" name="warning-amber" desc="solo urgencia · estrellas" />
            <TokenSwatch color="#DC2626" name="error-red" desc="errores · destructive" />
          </div>
          <div style={l.tokenTypeRow}>
            <div>
              <div style={l.tokenTypeLabel}>FUENTES</div>
              <div style={l.tokenTypeVal}><b>Manrope</b> · marca + números grandes</div>
              <div style={l.tokenTypeVal}><b>Inter</b> · UI body</div>
              <div style={l.tokenTypeVal}><b>JetBrains Mono</b> · IDs · stats · captions</div>
            </div>
            <div>
              <div style={l.tokenTypeLabel}>RADIOS</div>
              <div style={l.tokenTypeVal}>sm 6 · md 8/10 · lg 12 · xl 14/16 · 2xl 18</div>
              <div style={l.tokenTypeLabel} style={{ marginTop: 8 }}>SPACING</div>
              <div style={l.tokenTypeVal}>4 · 8 · 12 · 16 · 20 · 24 · 32</div>
            </div>
          </div>
        </div>

        <div style={l.finalCard}>
          <div style={l.finalCardLabel}>PRINCIPIOS ESTRICTOS · checklist Claude Code</div>
          <ol style={l.finalOl}>
            <li><b>Color del sistema</b> · azul = identidad / verde = verificación / ámbar = urgencia / rojo = errores. Sin excepciones por estética.</li>
            <li><b>Touch targets mobile</b> · mínimo 44 px (hit-slop si visual menor).</li>
            <li><b>Espaciado base 4 px</b> · usa múltiplos siempre.</li>
            <li><b>Tipografía pareja</b> · Manrope SOLO para H1/branding/números clave. Inter para UI body.</li>
            <li><b>Iconografía Lucide</b> · stroke 2 default · 2.4 cuando es importante (CTA · status).</li>
            <li><b>Sombras suaves</b> · nunca pesadas. shadow-sm o shadow-md como máximo.</li>
            <li><b>Estados completos</b> · default · hover · pressed · disabled · loading · empty para CADA componente.</li>
            <li><b>Accesibilidad</b> · aria-label / accessibilityLabel · focus visible · contraste WCAG AA.</li>
            <li><b>Locale es-MX</b> · fechas en español · moneda $ MXN · prefix +52.</li>
            <li><b>Responsive</b> · sidebar collapsa &lt;1280px · table → cards en mobile.</li>
          </ol>
        </div>

        <div style={l.finalCard}>
          <div style={l.finalCardLabel}>ARCHIVOS DE LA UI LIBRARY</div>
          <ul style={l.finalLinkList}>
            <li><a href="UILibraryPrimitives.html" style={l.finalLink}>01 · Primitives</a> <span style={l.finalLinkCount}>7 componentes</span></li>
            <li><a href="UILibraryContainers.html" style={l.finalLink}>02 · Containers</a> <span style={l.finalLinkCount}>5 componentes</span></li>
            <li><a href="UILibraryNavigation.html" style={l.finalLink}>03 · Navigation</a> <span style={l.finalLinkCount}>5 componentes</span></li>
            <li><a href="UILibraryForms.html" style={l.finalLink}>04 · Forms</a> <span style={l.finalLinkCount}>6 componentes</span></li>
            <li><a href="UILibraryDataDisplay.html" style={l.finalLink}>05 · Data Display</a> <span style={l.finalLinkCount}>4 componentes</span></li>
            <li><b style={{ color: "#0A6BCF" }}>06 · Domain-Specific (esta)</b> <span style={l.finalLinkCount}>8 componentes</span></li>
          </ul>
          <div style={l.finalFooterMsg}>
            <Ic name="rocket" size={14} color="#0A6BCF" />
            <span>Library completa · pásale a Claude Code para implementación en `apps/mobile` y `apps/admin-web`.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TokenSwatch({ color, name, desc }) {
  return (
    <div style={l.tokenSwatch}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={l.tokenName}>{name}</div>
        <div style={l.tokenDesc}>{desc}</div>
      </div>
    </div>
  );
}

// =====================================================================
// APP
// =====================================================================
function App() {
  return (
    <div style={l.canvas}>
      <PageHero />
      <SectionHeader num="06" title="Domain-Specific" sub="Componentes de negocio que combinan primitives + containers · solo viven en Tumantenimiento." />

      <ComponentBlock
        id="technician-card"
        name="TechnicianCard"
        codeName="<TechnicianCard />"
        desc="Tarjeta de técnico con 3 variants según contexto. Slots fijos: avatar verificado, nombre, rating, categorías, distancia, precio, CTA."
        mobileGrid={<TechCardGrid />}
        desktopGrid={<TechCardGrid desktop />}
        props={[
          { name: "variant",  type: "compact | featured | mini",       default: "compact" },
          { name: "tech",     type: "TechProfile",                     default: "—", required: true },
          { name: "verified", type: "boolean",                          default: "false" },
          { name: "topRibbon",type: "string",                           default: "—" },
          { name: "onPress",  type: "() => void",                       default: "—", required: true },
          { name: "onFavorite",type: "() => void",                      default: "—" },
        ]}
        tokens={[
          { cat: "featured",  val: "padding 14 · radius 16 · shadow-md · ribbon top-right" },
          { cat: "compact",   val: "padding 12 · radius 14 · 1 row · CTA mini" },
          { cat: "mini",      val: "44 px high · pill style · avatar + name + rating" },
          { cat: "ribbon",    val: "ámbar pill · 'TOP EN ZONA'" },
          { cat: "price",     val: "Manrope 800 · 'desde' label + monto" },
        ]}
        notes={[
          "Avatar verified obligatorio si el técnico pasó KYC.",
          "Featured: ribbon SOLO si técnico está en top 10% de su zona/categoría.",
          "Categorías: mostrar 3 chips + '+N' si hay más.",
          "Distance chip muestra hasta 1 decimal (2.3 km), redondea > 10.",
          "onFavorite: toggle ❤️ (filled si en favoritos).",
        ]}
        useCases={[
          "Featured · home cliente · carrusel 'Recomendados'",
          "Compact · resultados de búsqueda + lista de favoritos",
          "Mini · sugerencias laterales · cards relacionadas",
        ]}
      />

      <ComponentBlock
        id="service-status-card"
        name="ServiceStatusCard"
        codeName="<ServiceStatusCard />"
        desc="Card grande de estado actual del servicio. 8 variantes según ciclo de vida. Incluye timer, ETA o acciones contextuales."
        mobileGrid={<ServiceStatusGrid />}
        desktopGrid={<ServiceStatusGrid desktop />}
        props={[
          { name: "status",  type: "requested | accepted | enroute | onsite | quote | working | completed | cancelled", default: "—", required: true },
          { name: "title",   type: "string · override default",   default: "—" },
          { name: "sub",     type: "string · override default",   default: "—" },
          { name: "timer",   type: "string (mm:ss)",              default: "—" },
          { name: "eta",     type: "string ('18 min')",           default: "—" },
          { name: "urgent",  type: "boolean · adds ribbon",       default: "false" },
          { name: "actions", type: "ReactNode",                   default: "—" },
        ]}
        tokens={[
          { cat: "icon ring", val: "64 px circle · gradient by status · shadow-md tinted" },
          { cat: "title",     val: "Manrope 800 · 16-18 · #0E2C56" },
          { cat: "live pulse",val: "anillo expandiendo 1.6s loop (working state)" },
          { cat: "urgent",    val: "ribbon ámbar top · 'ACCIÓN REQUERIDA'" },
          { cat: "timer",     val: "Manrope 800 · 20-24 · color del status" },
        ]}
        notes={[
          "Estado 'requested' es el ÚNICO con timer countdown (response SLA).",
          "Estado 'quote' es el ÚNICO con acciones inline (Aprobar/Ver detalle).",
          "Live pulse animation SOLO en 'working' · acentúa actividad en curso.",
          "ribbon 'ACCIÓN REQUERIDA' obliga a aprobar cotización.",
          "Cancelled tone es rojo suavizado para no ser hostil post-error.",
        ]}
        useCases={[
          "Pantalla de tracking del servicio (cliente)",
          "Header del detalle de servicio (técnico)",
          "Card en mis servicios (cualquier rol)",
          "Inbox card · resumen rápido",
        ]}
      />

      <ComponentBlock
        id="price-breakdown"
        name="PriceBreakdown"
        codeName="<PriceBreakdown role={...} />"
        desc="Desglose financiero del servicio. Variant cliente muestra total a pagar; variant técnico muestra ganancia neta tras comisión."
        mobileGrid={<PriceBreakdownGrid />}
        desktopGrid={<PriceBreakdownGrid desktop />}
        props={[
          { name: "role",     type: "cliente | tecnico",            default: "cliente", required: true },
          { name: "base",     type: "number",                       default: "—", required: true },
          { name: "extras",   type: "Array<{ label, amount }>",     default: "[]" },
          { name: "commission",type: "number (%)",                  default: "15" },
          { name: "method",   type: "PaymentMethod",                default: "—" },
        ]}
        tokens={[
          { cat: "header",     val: "icon box 28 + label mono 9.5 + sub 11" },
          { cat: "row",        val: "Inter 500 · 13 · padding 4 vertical" },
          { cat: "extras",     val: "indent 16 + corner-down-right icon · color #0A6BCF" },
          { cat: "divider",    val: "1px #F0F4F9" },
          { cat: "total cli",  val: "card light · valor Manrope 800 · 32px Primary Blue" },
          { cat: "total tec",  val: "card dark navy gradient · valor Manrope 800 · 32px white" },
        ]}
        notes={[
          "Comisión 15% mostrada SOLO al técnico (cliente ve total final · transparencia).",
          "Extras con icon corner-down-right para sentir jerarquía.",
          "Subtotal cuando hay extras · sino skip al total directo.",
          "Total final destacado con card tonificado (azul cliente / navy técnico).",
          "Method al final del total (Visa, OXXO, MP, efectivo).",
        ]}
        useCases={[
          "Detalle del servicio · cliente ve cuanto paga",
          "Cotización en aceptar solicitud · técnico ve qué gana",
          "Resumen pre-pago · checkout",
          "Recibo post-servicio · ambos roles",
        ]}
      />

      <ComponentBlock
        id="chat-bubble"
        name="ChatMessageBubble"
        codeName="<ChatMessageBubble />"
        desc="Burbuja de mensaje en chat. Soporta own/other/system con attachments y read receipts. Diferenciada por dirección y color."
        mobileGrid={<ChatBubbleGrid />}
        desktopGrid={<ChatBubbleGrid />}
        props={[
          { name: "variant",    type: "own | other | system",         default: "—", required: true },
          { name: "text",       type: "string",                       default: "—" },
          { name: "attachments",type: "string[] (urls)",              default: "—" },
          { name: "time",       type: "string",                       default: "—" },
          { name: "status",     type: "sent | delivered | read",      default: "—" },
          { name: "author",     type: "{ initials, tone, name }",     default: "—" },
        ]}
        tokens={[
          { cat: "own",        val: "bg gradient blue · white text · radius 14/14/4/14 · shadow blue" },
          { cat: "other",      val: "bg white · #0E2C56 text · border hairline · radius 14/14/14/4" },
          { cat: "system",     val: "centered pill · bg light · color gray · italic-ish" },
          { cat: "attach",     val: "70 px square · radius 8 · tappable for zoom" },
          { cat: "read recpt", val: "double check #18C1FF" },
        ]}
        notes={[
          "Avatar solo en 'other' (own no necesita avatar propio).",
          "Author name solo en chats grupales (admin con cliente+técnico).",
          "System messages: cambios de estado de servicio, aprobaciones, sistema.",
          "Attachments: tap abre lightbox · grid 2-3 thumbnails.",
          "Time formato relativo (hace 2m · ayer · 14:32) según antigüedad.",
        ]}
        useCases={[
          "Chat cliente ↔ técnico (caso principal)",
          "Soporte admin ↔ usuario (ticket conversación)",
          "Mensajes de sistema (cotización aprobada, pago recibido)",
          "Historial de disputa con multiple actors",
        ]}
      />

      <ComponentBlock
        id="rating-input"
        name="RatingInput"
        codeName="<RatingInput />"
        desc="Calificación post-servicio con 5 estrellas grandes. Label dinámico según puntaje + chips contextuales positivos o negativos."
        mobileGrid={<RatingInputGrid />}
        desktopGrid={<RatingInputGrid desktop />}
        props={[
          { name: "value",      type: "0-5",                                 default: "0", required: true },
          { name: "positiveChips",type: "Tag[] · solo si value >= 4",        default: "—" },
          { name: "negativeChips",type: "Tag[] · solo si value <= 2",        default: "—" },
          { name: "onChange",   type: "(v) => void",                          default: "—", required: true },
          { name: "showLabel",  type: "boolean",                              default: "true" },
        ]}
        tokens={[
          { cat: "star size",    val: "36 px (interactive) · 22 lg display" },
          { cat: "active glow",  val: "drop-shadow 0 2px 6px amber-45%" },
          { cat: "label pill",   val: "bg tone-soft · color tone-strong · radius 999" },
          { cat: "tone 1★",      val: "Error Red" },
          { cat: "tone 2★",      val: "#EA580C orange" },
          { cat: "tone 3★",      val: "Warning Amber" },
          { cat: "tone 4-5★",    val: "Success Green" },
        ]}
        notes={[
          "Estrellas son SVG inline (no Lucide) para controlar drop-shadow glow.",
          "Label aparece debajo: '1★ Muy mal' hasta '5★ Excelente'.",
          "Positive chips (4-5★) y negative chips (1-2★) son multi-select.",
          "3★ no muestra chips (estado neutral).",
          "Mobile: tap haptic medium al seleccionar estrella final.",
        ]}
        useCases={[
          "Calificar al técnico post-servicio (cliente)",
          "Calificar al cliente post-servicio (técnico)",
          "Evaluar experiencia con soporte (encuesta)",
        ]}
      />

      <ComponentBlock
        id="kyc-doc-card"
        name="KycDocumentCard"
        codeName="<KycDocumentCard />"
        desc="Tarjeta de documento KYC con thumbnail, estado y acciones contextuales. 4 estados visuales claramente diferenciados."
        mobileGrid={<KycDocCardGrid />}
        desktopGrid={<KycDocCardGrid desktop />}
        props={[
          { name: "doc",         type: "{ id, type, url, uploadedAt }",       default: "—", required: true },
          { name: "status",      type: "pending | approved | rejected | illegible", default: "pending", required: true },
          { name: "reason",      type: "string · cuando rejected/illegible",  default: "—" },
          { name: "approver",    type: "{ name, date } · cuando approved",    default: "—" },
          { name: "onApprove",   type: "() => void",                          default: "—" },
          { name: "onReject",    type: "() => void",                          default: "—" },
          { name: "onZoom",      type: "() => void",                          default: "—", required: true },
        ]}
        tokens={[
          { cat: "thumb",       val: "aspect 1.586 · radius 8 · tap zoom · 60% opacity si flagged" },
          { cat: "status pend", val: "Warning Amber" },
          { cat: "status appr", val: "Success Green" },
          { cat: "status rej",  val: "Error Red" },
          { cat: "status ill",  val: "Text Gray" },
          { cat: "approve btn", val: "Success Green pill" },
          { cat: "reject btn",  val: "Error Red outline" },
        ]}
        notes={[
          "Thumbnail con overlay icon si está rejected/illegible (ojo cerrado, X).",
          "Estados rejected/illegible muestran motivo en lugar de acciones.",
          "Zoom action siempre disponible (lightbox).",
          "Solo admin ve los botones aprobar/rechazar.",
          "Técnico ve estado + razón + opción 'Re-subir'.",
        ]}
        useCases={[
          "Cola de KYC pendientes (admin)",
          "Detalle de KYC del técnico (admin)",
          "Vista del técnico de sus documentos (status)",
          "Documentos en perfil del técnico (settings)",
        ]}
      />

      <ComponentBlock
        id="map-card"
        name="MapCard"
        codeName="<MapCard />"
        desc="Card con mini-mapa + dirección formateada + CTA. Variant static (display) o interactive (ruta en vivo)."
        mobileGrid={<MapCardGrid />}
        desktopGrid={<MapCardGrid desktop />}
        props={[
          { name: "variant",   type: "static | interactive",         default: "static" },
          { name: "address",   type: "{ line1, line2, cp }",         default: "—", required: true },
          { name: "marker",    type: "{ lat, lng, label }",          default: "—", required: true },
          { name: "route",     type: "{ from, to, distance, eta }",  default: "—" },
          { name: "onOpenMaps",type: "() => void",                   default: "deeplink a Google Maps", required: true },
        ]}
        tokens={[
          { cat: "map height", val: "180 · 220 (interactive)" },
          { cat: "radius",     val: "14 (whole card) · 8 top (map only)" },
          { cat: "info row",   val: "padding 12 · bg white · border-top hairline" },
          { cat: "tech pin",   val: "circle 12 white + border Primary Blue 2.5 + initials" },
          { cat: "dest pin",   val: "drop-pin red + halo rgba" },
          { cat: "route line", val: "Primary Blue 4 + halo 14 · 25%" },
        ]}
        notes={[
          "Static usa marker simple en ubicación · solo display.",
          "Interactive muestra ruta animada técnico → destino con bubble flotante de distancia/ETA.",
          "Tap en el mapa abre lightbox fullscreen o deep-link a Google Maps.",
          "Mobile: react-native-maps + custom markers React Native components.",
          "Web: Mapbox GL · más control sobre styling.",
        ]}
        useCases={[
          "Dirección del servicio · detalle de orden (static)",
          "Tracking del técnico en camino (interactive)",
          "Direcciones guardadas en perfil (static · pequeñas)",
          "Cobertura de técnico · onboarding (static)",
        ]}
      />

      <ComponentBlock
        id="category-icon"
        name="CategoryIcon"
        codeName="<CategoryIcon />"
        desc="Círculo de categoría de servicio. 3 variants (default/selected/disabled) y 3 sizes para distintos contextos."
        mobileGrid={<CatIconGrid />}
        desktopGrid={<CatIconGrid desktop />}
        props={[
          { name: "icon",     type: "LucideIcon",                  default: "—", required: true },
          { name: "label",    type: "string",                      default: "—" },
          { name: "variant",  type: "default | selected | disabled", default: "default" },
          { name: "size",     type: "number (px)",                 default: "64" },
          { name: "onPress",  type: "() => void",                  default: "—" },
        ]}
        tokens={[
          { cat: "default",  val: "bg rgba(10,107,207,0.10) · icon Primary Blue" },
          { cat: "selected", val: "bg gradient blue + shadow 0 6px 14px primary-30%" },
          { cat: "disabled", val: "bg rgba(navy,0.04) · icon #C8D4E0" },
          { cat: "icon",     val: "size = box × 0.35 · stroke 2.2" },
          { cat: "label",    val: "Inter 600 11.5 · selected → 700 Primary Blue" },
        ]}
        notes={[
          "Sizes recomendados: 60 (compact) · 68 (default) · 76 (hero/featured).",
          "Disabled = categoría no disponible aún en la zona del usuario.",
          "Selected mantiene gradient + shadow incluso sin hover (estado persistente).",
          "Label opcional (a veces solo el icon en filtros estrechos).",
          "Touch target mínimo 44 px (size 60+ cumple solo).",
        ]}
        useCases={[
          "Grid de categorías en home cliente (8 categorías)",
          "Selector de servicio en solicitud (selección única)",
          "Multi-select de servicios que ofreces (onboarding técnico)",
          "Filtros en búsqueda · admin tabla",
        ]}
      />

      <FinalHandoff />
    </div>
  );
}

// =====================================================================
// STYLES
// =====================================================================
const l = {
  canvas: { maxWidth: 1440, margin: "0 auto", padding: "0 0 80px", background: "#F4F6FA" },
  hero: { position: "relative", padding: "60px 48px 56px", color: "#FFFFFF", overflow: "hidden" },
  heroBg: { position: "absolute", inset: 0, background: "linear-gradient(165deg, #0A1B36 0%, #0E2C56 50%, #0A6BCF 100%)" },
  heroGlow1: { position: "absolute", right: -100, top: -80, width: 380, height: 380, background: "radial-gradient(circle, rgba(24,193,255,0.40), transparent 65%)" },
  heroGlow2: { position: "absolute", left: -100, bottom: 0, width: 320, height: 320, background: "radial-gradient(circle, rgba(245,158,11,0.20), transparent 65%)" },
  heroInner: { position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto" },
  heroTopRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 },
  heroLogo: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em" },
  heroLogoPro: { padding: "2px 8px", background: "#F59E0B", color: "#FFFFFF", borderRadius: 4, fontSize: 11, fontWeight: 800, letterSpacing: ".06em", marginLeft: 6, verticalAlign: "middle" },
  heroVer: { padding: "4px 11px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.20)", borderRadius: 999, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: ".06em", color: "#FFFFFF", textDecoration: "none" },
  heroEyebrow: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#FBBF24", letterSpacing: ".18em", fontWeight: 700, marginBottom: 6 },
  heroTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 52, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05 },
  heroSub: { fontSize: 16, color: "rgba(255,255,255,0.82)", marginTop: 14, maxWidth: 700, lineHeight: 1.55 },
  heroMetaRow: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 22 },
  heroChip: { display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.20)", borderRadius: 999, fontSize: 11.5, fontWeight: 600 },

  sectionHeader: { display: "flex", alignItems: "center", gap: 18, padding: "48px 48px 22px" },
  sectionHeaderLeft: { display: "flex", alignItems: "center", gap: 14 },
  sectionNum: { width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#0A6BCF,#0894EA)", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em", boxShadow: "0 8px 20px rgba(10,107,207,0.30)" },
  sectionTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 32, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.03em", lineHeight: 1.1 },
  sectionSub: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  sectionLine: { flex: 1, height: 1, background: "linear-gradient(90deg, rgba(10,107,207,0.30), transparent)" },

  componentBlock: { margin: "32px 48px" },
  componentTopRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16, padding: "0 4px" },
  componentTitle: { display: "flex", alignItems: "baseline", gap: 12, fontFamily: "'Manrope', sans-serif", fontSize: 26, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em" },
  componentCodeName: { fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#0A6BCF", fontWeight: 600, padding: "3px 9px", background: "rgba(10,107,207,0.08)", borderRadius: 6 },
  componentDesc: { fontSize: 13.5, color: "#6B7280", marginTop: 6, maxWidth: 700 },
  componentLinks: { display: "flex", gap: 8 },
  componentLink: { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 8, fontSize: 11, color: "#0A6BCF", fontWeight: 600 },
  componentGrid: { display: "grid", gridTemplateColumns: "1fr 380px", gap: 18, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 18px rgba(14,44,86,0.06)" },
  componentMain: { padding: "22px 24px" },
  platformRow: { display: "flex", alignItems: "center", gap: 10, padding: "8px 0 14px", marginTop: 8 },
  platformLabel: { display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", background: "rgba(10,107,207,0.08)", border: "1px solid rgba(10,107,207,0.18)", borderRadius: 8, fontSize: 10.5, color: "#0A6BCF", fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".08em", fontWeight: 700 },
  platformPanel: { padding: 20, background: "#F8FBFF", border: "1px dashed #C8D4E0", borderRadius: 12 },

  specCard: { background: "#FBFCFE", borderLeft: "1px solid #E1E8F0", padding: 22, display: "flex", flexDirection: "column", gap: 18 },
  specHead: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: "1px solid #E1E8F0" },
  specHeadLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF", letterSpacing: ".12em", fontWeight: 700 },
  specHeadName: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#0A6BCF", fontWeight: 700, padding: "2px 8px", background: "rgba(10,107,207,0.08)", borderRadius: 6 },
  specSectionLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#0A6BCF", letterSpacing: ".12em", fontWeight: 700, marginBottom: 8 },
  propsHead: { display: "flex", gap: 6, padding: "6px 0", borderBottom: "1px solid #F0F4F9", fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#9CA3AF", letterSpacing: ".06em", fontWeight: 700 },
  propsRow: { display: "flex", gap: 6, padding: "6px 0", borderBottom: "1px solid #F4F7FB" },
  propName: { flex: 1.4, fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#0E2C56", fontWeight: 700 },
  propReq: { color: "#DC2626", marginLeft: 2 },
  propType: { flex: 1.2, fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#0A6BCF", lineHeight: 1.4, wordBreak: "break-word" },
  propDefault: { flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#6B7280" },
  tokenList: { display: "flex", flexDirection: "column", gap: 5 },
  tokenRow: { display: "flex", gap: 8, padding: "4px 0" },
  tokenCat: { width: 80, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: 10 },
  tokenVal: { flex: 1, color: "#0E2C56", fontWeight: 500, fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5 },
  notesList: { margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 },
  notesItem: { position: "relative", paddingLeft: 14, fontSize: 11.5, color: "#6B7280", lineHeight: 1.5 },
  useCases: { display: "flex", flexDirection: "column", gap: 5 },
  useCaseRow: { display: "flex", alignItems: "flex-start", gap: 8, fontSize: 11.5, color: "#0E2C56", lineHeight: 1.45 },
  useCaseDot: { width: 4, height: 4, borderRadius: "50%", background: "#0A6BCF", marginTop: 7, flexShrink: 0 },

  // Final handoff
  finalHandoff: { margin: "60px 48px 0", padding: 36, background: "linear-gradient(160deg, #0A1B36 0%, #0E2C56 60%, #0A6BCF 130%)", borderRadius: 24, color: "#FFFFFF", boxShadow: "0 20px 50px rgba(14,44,86,0.30)", position: "relative", overflow: "hidden" },
  finalHead: { display: "flex", alignItems: "center", gap: 16, marginBottom: 28 },
  finalIcon: { width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg,#F59E0B,#FBBF24)", display: "grid", placeItems: "center", boxShadow: "0 8px 22px rgba(245,158,11,0.40)", flexShrink: 0 },
  finalEyebrow: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#FBBF24", letterSpacing: ".15em", fontWeight: 700 },
  finalTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 2 },
  finalSub: { fontSize: 13, color: "rgba(255,255,255,0.78)", marginTop: 4 },
  finalGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 },
  finalCard: { padding: 20, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, backdropFilter: "blur(8px)" },
  finalCardLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#FBBF24", letterSpacing: ".12em", fontWeight: 700, marginBottom: 12 },
  finalCols: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  finalSubLabel: { display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#18C1FF", letterSpacing: ".1em", fontWeight: 700, marginBottom: 4, marginTop: 8 },
  finalList: { margin: 0, paddingLeft: 16, fontSize: 11.5, color: "rgba(255,255,255,0.85)", lineHeight: 1.7 },
  finalOl: { margin: 0, paddingLeft: 18, fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 },
  finalCode: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "rgba(255,255,255,0.85)", lineHeight: 1.7 },
  codeMuted: { color: "rgba(255,255,255,0.45)" },
  finalLinkList: { margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 },
  finalLink: { color: "#18C1FF", fontSize: 12.5, fontWeight: 700, textDecoration: "none" },
  finalLinkCount: { marginLeft: 8, fontSize: 10.5, color: "rgba(255,255,255,0.55)", fontFamily: "'JetBrains Mono', monospace" },
  finalFooterMsg: { display: "flex", alignItems: "center", gap: 8, marginTop: 16, padding: "10px 12px", background: "rgba(10,107,207,0.18)", border: "1px solid rgba(24,193,255,0.30)", borderRadius: 10, fontSize: 12, color: "rgba(255,255,255,0.90)" },

  tokensGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  tokenSwatch: { display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", background: "rgba(255,255,255,0.04)", borderRadius: 8 },
  tokenName: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: "#FFFFFF" },
  tokenDesc: { fontSize: 10, color: "rgba(255,255,255,0.65)", marginTop: 1 },
  tokenTypeRow: { display: "flex", gap: 14, marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.10)" },
  tokenTypeLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#FBBF24", letterSpacing: ".1em", fontWeight: 700, marginBottom: 4 },
  tokenTypeVal: { fontSize: 11, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 },
};

const d = {
  subLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#0A6BCF", letterSpacing: ".12em", fontWeight: 700, marginBottom: 8 },
  bullet: { width: 2, height: 2, borderRadius: "50%", background: "#9CA3AF", margin: "0 4px" },

  // Tech cards
  techCardFeatured: { position: "relative", padding: 16, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, boxShadow: "0 4px 14px rgba(14,44,86,0.08)" },
  techFeaturedRibbon: { position: "absolute", top: 12, right: 12, display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", background: "linear-gradient(135deg,#F59E0B,#FBBF24)", color: "#FFFFFF", borderRadius: 999, fontSize: 9, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".08em", boxShadow: "0 4px 10px rgba(245,158,11,0.30)" },
  techFeaturedTop: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
  techNameLg: { fontFamily: "'Manrope', sans-serif", fontSize: 15, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.01em" },
  techTrade: { fontSize: 11.5, color: "#6B7280", marginTop: 2 },
  techMeta: { display: "flex", alignItems: "center", gap: 5, marginTop: 4, flexWrap: "wrap" },
  techChipsRow: { display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 },
  techCatChip: { padding: "3px 9px", background: "rgba(10,107,207,0.08)", color: "#0A6BCF", borderRadius: 999, fontSize: 11, fontWeight: 600 },
  techCatChipMore: { padding: "3px 9px", background: "#F8FBFF", color: "#6B7280", border: "1px dashed #E1E8F0", borderRadius: 999, fontSize: 11, fontWeight: 600 },
  techFooterRow: { display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid #F0F4F9" },
  techPriceLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#9CA3AF", letterSpacing: ".08em", fontWeight: 700 },
  techPriceLg: { fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em", lineHeight: 1, marginTop: 2 },
  techPriceCurr: { fontSize: 10, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
  techBtnGhost: { width: 36, height: 36, borderRadius: 10, background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer" },
  techBtnPrimary: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(10,107,207,0.25)" },

  techCardCompact: { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, cursor: "pointer" },
  techName: { fontSize: 13.5, fontWeight: 700, color: "#0E2C56" },
  techCat: { color: "#0A6BCF", fontWeight: 600, fontSize: 11 },
  techDistChip: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10.5, color: "#6B7280" },
  techPrice: { fontSize: 11, color: "#6B7280" },
  techBottomRow: { display: "flex", alignItems: "center", gap: 5, marginTop: 4 },
  techCompactBtn: { padding: "7px 13px", background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #0A6BCF", borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: "pointer", flexShrink: 0 },

  techCardMini: { display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 999, cursor: "pointer", flex: 1 },
  techNameMini: { fontSize: 11.5, fontWeight: 700, color: "#0E2C56", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  techMetaMini: { display: "flex", alignItems: "center", gap: 4, marginTop: 2 },

  // Status card
  urgentRibbon: { position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", padding: "3px 11px", background: "linear-gradient(135deg,#F59E0B,#B45309)", color: "#FFFFFF", borderRadius: 999, fontSize: 9, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".08em", boxShadow: "0 4px 10px rgba(245,158,11,0.30)" },
  iconPulse: { position: "absolute", inset: -8, borderRadius: "50%", border: "2px solid rgba(10,107,207,0.40)", animation: "domain-pulse 1.6s infinite" },
  statusTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.01em" },
  statusSub: { fontSize: 12, color: "#6B7280", marginTop: 4, lineHeight: 1.45 },
  statusTimerBox: { display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, padding: "6px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 999 },
  statusTimerLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, fontWeight: 700, letterSpacing: ".08em" },
  statusTimerVal: { fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800, letterSpacing: "-0.01em" },

  // Price
  priceCard: { padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, overflow: "hidden" },
  priceHead: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  priceIconWrap: { width: 28, height: 28, borderRadius: 8, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  priceLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#0A6BCF", letterSpacing: ".1em", fontWeight: 700 },
  priceSubLabel: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  priceRowsWrap: {},
  priceRow: { display: "flex", alignItems: "center", padding: "5px 0", fontSize: 12.5, gap: 6 },
  priceRowLabel: { flex: 1 },
  priceRowVal: { fontFamily: "'Manrope', sans-serif" },
  pricePill: { padding: "1px 6px", background: "rgba(14,44,86,0.06)", color: "#6B7280", borderRadius: 4, fontSize: 9, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" },
  priceDivider: { height: 1, background: "#F0F4F9", margin: "6px 0" },
  priceTotal: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, padding: "12px 14px", background: "linear-gradient(135deg, rgba(10,107,207,0.06), rgba(24,193,255,0.04))", border: "1px solid rgba(10,107,207,0.20)", borderRadius: 12 },
  priceTotalTech: { background: "linear-gradient(135deg, #0E2C56, #0A6BCF)", border: "none", boxShadow: "0 6px 14px rgba(10,107,207,0.30)" },
  priceTotalLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#9CA3AF", letterSpacing: ".1em", fontWeight: 700 },
  priceTotalSub: { fontSize: 10.5, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  priceTotalVal: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: "-0.02em", lineHeight: 1 },
  priceTotalDec: { fontSize: 18, opacity: 0.7 },
  priceTotalCurr: { fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, marginTop: 2 },

  // Chat
  chatThread: { display: "flex", flexDirection: "column", gap: 12, padding: 16, background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 14 },
  bubbleName: { fontSize: 10, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: ".04em", marginBottom: 3 },
  bubbleSys: { display: "inline-flex", alignSelf: "center", alignItems: "center", gap: 5, padding: "5px 11px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 999, fontSize: 10.5, color: "#6B7280", fontStyle: "italic" },
  bubbleSysTime: { color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", marginLeft: 4 },

  // Rating
  ratingCard: { padding: 16, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  starBtn: { width: 40, height: 40, padding: 0, background: "transparent", border: "none", cursor: "pointer", display: "grid", placeItems: "center", transition: "transform 0.12s" },
  starBtnActive: { transform: "scale(1.08)" },
  ratingLabel: { display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700 },
  ratingPlaceholder: { fontSize: 11.5, color: "#9CA3AF", fontWeight: 500 },
  ratingChipsBox: { width: "100%", padding: "10px 12px", background: "#F8FBFF", borderRadius: 10, marginTop: 4 },
  ratingChipsLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#0A6BCF", letterSpacing: ".1em", fontWeight: 700, marginBottom: 6 },
  ratingChip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 9px", background: "#FFFFFF", border: "1.5px solid #E1E8F0", color: "#0A6BCF", borderRadius: 999, fontSize: 11, fontWeight: 600 },
  ratingChipSel: { background: "#0A6BCF", borderColor: "#0A6BCF", color: "#FFFFFF" },

  // KYC
  kycCard: { display: "flex", gap: 12, padding: 12, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14 },
  kycThumb: { position: "relative", width: 100, aspectRatio: "1.586", borderRadius: 8, overflow: "hidden", flexShrink: 0, border: "1px solid #E1E8F0" },
  kycThumbOverlay: { position: "absolute", inset: 0, background: "rgba(14,44,86,0.55)", display: "grid", placeItems: "center", backdropFilter: "blur(2px)" },
  kycTopRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  kycTitle: { fontSize: 13, fontWeight: 700, color: "#0E2C56" },
  kycSub: { fontSize: 10.5, color: "#9CA3AF", marginTop: 2 },
  kycStatusChip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, fontSize: 9, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".06em" },
  kycActions: { display: "flex", alignItems: "center", gap: 5, marginTop: 10, flexWrap: "wrap" },
  kycBtnApprove: { display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 11px", background: "#18A66A", color: "#FFFFFF", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer" },
  kycBtnReject: { display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 11px", background: "#FFFFFF", color: "#DC2626", border: "1px solid #DC2626", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer" },
  kycBtnGhost: { display: "inline-flex", alignItems: "center", gap: 3, padding: "5px 9px", background: "transparent", color: "#0A6BCF", border: "1px solid #E1E8F0", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer" },
  kycApprovedNote: { fontSize: 10.5, color: "#0F8A56", fontStyle: "italic", flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },

  // Map
  mapCard: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, overflow: "hidden", boxShadow: "0 4px 12px rgba(14,44,86,0.06)" },
  mapCardMap: { position: "relative", height: 180 },
  mapTopBubble: { position: "absolute", top: 10, left: 10, display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", background: "rgba(255,255,255,0.96)", border: "1px solid #E1E8F0", borderRadius: 999, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#0E2C56", boxShadow: "0 4px 10px rgba(14,44,86,0.10)" },
  mapTopBadge: { position: "absolute", top: 10, left: 10, display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", background: "rgba(14,44,86,0.85)", color: "#FFFFFF", borderRadius: 999, fontSize: 9.5, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".06em" },
  mapInfo: { display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderTop: "1px solid #F0F4F9" },
  mapAddr: { fontSize: 12.5, fontWeight: 700, color: "#0E2C56" },
  mapAddrSub: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  mapBtn: { display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px", background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(10,107,207,0.25)" },
};

const kf = document.createElement("style");
kf.textContent = `@keyframes domain-pulse { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.10); opacity: 0; } }`;
document.head.appendChild(kf);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
