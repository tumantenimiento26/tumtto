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
// HEADER
// ============================================================
function ChatHeader() {
  return (
    <div style={c.header}>
      <button style={c.backBtn}><Ic name="arrow-left" size={18} color="#0E2C56" /></button>
      <div style={c.headerTechAv}>
        <span>RH</span>
        <div style={c.headerVerifyDot} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={c.headerName}>Ramón Hernández</div>
        <div style={c.headerStatus}>
          <span style={c.onlineDot} />
          En línea
        </div>
      </div>
      <button style={c.iconBtn}><Ic name="phone" size={16} color="#0A6BCF" /></button>
      <button style={c.iconBtn}><Ic name="more-vertical" size={16} color="#0E2C56" /></button>
    </div>
  );
}

// ============================================================
// CONTEXT BANNER
// ============================================================
function ContextBanner() {
  return (
    <div style={c.ctxBanner}>
      <div style={c.ctxIcon}><Ic name="wrench" size={13} color="#0A6BCF" /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={c.ctxLabel}><span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>#SVC-2851</span> · Plomería · Fugas</div>
        <div style={c.ctxSub}>Hoy <b style={{ color: "#0E2C56", fontWeight: 700 }}>3:00 PM</b> · Av. Patria 1234, Providencia</div>
      </div>
      <span style={c.ctxStatus}>
        <span style={c.onlineDot} />
        En curso
      </span>
      <Ic name="chevron-right" size={14} color="#0A6BCF" />
    </div>
  );
}

// ============================================================
// MESSAGE BUBBLES
// ============================================================
function UserMsg({ text, time, status = "read", attachments }) {
  return (
    <div style={c.rightWrap}>
      <div style={c.userBubble}>
        {text && <p style={c.bubbleText}>{text}</p>}
        {attachments && (
          <div style={{ display: "flex", gap: 4, marginTop: text ? 8 : 0 }}>
            {attachments.map((a, i) => (
              <div key={i} style={{ ...c.attachThumb, background: a }}>
                <Ic name="image" size={14} color="#FFFFFF" />
              </div>
            ))}
          </div>
        )}
        <div style={c.userMeta}>
          <span>{time}</span>
          {status === "read" && (
            <span style={c.readMark}>
              <Ic name="check-check" size={12} color="#18C1FF" />
            </span>
          )}
          {status === "sent" && (
            <Ic name="check" size={12} color="rgba(255,255,255,0.65)" />
          )}
        </div>
      </div>
    </div>
  );
}

function TechMsg({ text, time, attachments, moderated }) {
  return (
    <div style={c.leftWrap}>
      <div style={{ ...c.miniAv, background: TECH_TONE }}>RH</div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", maxWidth: "78%" }}>
        <div style={moderated ? c.techBubbleModerated : c.techBubble}>
          {moderated && (
            <div style={c.moderatedRow}>
              <Ic name="shield-alert" size={12} color="#B45309" />
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "#B45309", letterSpacing: ".04em", textTransform: "uppercase" }}>Mensaje moderado</span>
            </div>
          )}
          <p style={c.bubbleTextDark}>
            {moderated ? (
              <>
                Llámame al <span style={c.redactedChip}>
                  <Ic name="lock" size={10} color="#B45309" style={{ marginRight: 4 }} />
                  número oculto
                </span> para coordinar.
              </>
            ) : text}
          </p>
          {attachments && (
            <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
              {attachments.map((a, i) => (
                <div key={i} style={{ ...c.attachThumb, background: a }}>
                  <Ic name="image" size={14} color="#FFFFFF" />
                </div>
              ))}
            </div>
          )}
        </div>
        {moderated && (
          <div style={c.moderatedHint}>
            <Ic name="info" size={10} color="#9CA3AF" />
            <span>Por tu seguridad, no compartas datos de contacto fuera de la app.</span>
          </div>
        )}
        <span style={c.techMeta}>{time}</span>
      </div>
    </div>
  );
}

function SystemMsg({ icon, text, color = "#0A6BCF", time }) {
  return (
    <div style={c.systemRow}>
      <div style={c.systemBubble}>
        <div style={{ ...c.systemIcon, background: `${color}1A` }}>
          <Ic name={icon} size={11} color={color} />
        </div>
        <span style={c.systemText}>{text}</span>
      </div>
      {time && <span style={c.systemTime}>{time}</span>}
    </div>
  );
}

function DateDivider({ label }) {
  return (
    <div style={c.dateDivider}>
      <span style={c.dateLine} />
      <span style={c.dateLabel}>{label}</span>
      <span style={c.dateLine} />
    </div>
  );
}

// ============================================================
// COMPOSER
// ============================================================
function Composer({ withText = true, attachOpen = false }) {
  return (
    <div style={c.composerWrap}>
      {attachOpen && (
        <div style={c.attachSheet}>
          <div style={c.attachOption}>
            <div style={{ ...c.attachOptIcon, background: "rgba(10,107,207,0.10)" }}><Ic name="camera" size={20} color="#0A6BCF" /></div>
            <span style={c.attachOptLabel}>Cámara</span>
          </div>
          <div style={c.attachOption}>
            <div style={{ ...c.attachOptIcon, background: "rgba(24,193,255,0.18)" }}><Ic name="image" size={20} color="#0884B0" /></div>
            <span style={c.attachOptLabel}>Foto</span>
          </div>
          <div style={c.attachOption}>
            <div style={{ ...c.attachOptIcon, background: "rgba(24,166,106,0.16)" }}><Ic name="file" size={20} color="#18A66A" /></div>
            <span style={c.attachOptLabel}>Documento</span>
          </div>
          <div style={c.attachOption}>
            <div style={{ ...c.attachOptIcon, background: "rgba(180,83,9,0.12)" }}><Ic name="map-pin" size={20} color="#B45309" /></div>
            <span style={c.attachOptLabel}>Ubicación</span>
          </div>
        </div>
      )}
      <div style={c.composer}>
        <button style={{ ...c.composerIconBtn, ...(attachOpen ? c.composerIconBtnActive : null) }}>
          <Ic name={attachOpen ? "x" : "plus"} size={18} color={attachOpen ? "#FFFFFF" : "#0A6BCF"} />
        </button>
        <div style={c.composerInput}>
          {withText ? (
            <span style={c.composerText}>Sí, está bien. Te abro cuando llegues.</span>
          ) : (
            <span style={c.composerPlaceholder}>Mensaje a Ramón…</span>
          )}
          <button style={c.composerEmoji}><Ic name="smile" size={16} color="#9CA3AF" /></button>
        </div>
        {withText ? (
          <button style={c.composerSend}>
            <Ic name="send" size={16} color="#FFFFFF" />
          </button>
        ) : (
          <button style={c.composerMicDisabled} title="Audio próximamente">
            <Ic name="mic" size={16} color="#9CA3AF" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SCREEN 1 — ACTIVE CHAT (full conversation)
// ============================================================
function ActiveChat() {
  return (
    <div style={c.wrap}>
      <ChatHeader />
      <ContextBanner />
      <div style={c.messages}>
        <DateDivider label="Hoy · 19 de mayo" />

        <SystemMsg icon="check" color="#18A66A" text="Ramón aceptó tu solicitud." time="14:05" />

        <TechMsg time="14:32" text="Hola María, ya estoy en camino. Llego en unos 15-20 min, hay tráfico." />
        <TechMsg time="14:33" text="¿Necesitas que lleve algún material específico?" />

        <UserMsg time="14:35" status="read" text="Hola Ramón, perfecto. Creo que es solo la llave del lavabo pero por si acaso trae lo necesario para sellado." />
        <UserMsg time="14:36" status="read" text="El portón eléctrico está descompuesto, te tengo que abrir manualmente. Toca el timbre cuando llegues." />

        <TechMsg time="14:37" text="Ok perfecto, gracias por avisar. ¡Nos vemos en un rato!" />

        <SystemMsg icon="flag" color="#0A6BCF" text="Ramón llegó a tu dirección." time="14:58" />

        <TechMsg time="15:10" text="Listo, ya hice el diagnóstico. Encontré la fuga y necesito 2 extras: cambio de llave + sellado." attachments={["linear-gradient(135deg,#0A6BCF,#0E2C56)", "linear-gradient(135deg,#B45309,#F59E0B)"]} />

        <TechMsg time="15:11" text="Te mandé la cotización actualizada en la app, revísala." />

        <SystemMsg icon="receipt-text" color="#0A6BCF" text="Cotización actualizada · $850 MXN" time="15:11" />
        <SystemMsg icon="check-check" color="#18A66A" text="María aprobó la cotización por $850 MXN." time="15:12" />

        <TechMsg time="15:13" text="Perfecto, empiezo a trabajar 🔧" />

        <UserMsg time="15:14" status="read" text="Sí, está bien. Te abro cuando llegues a la puerta." />
      </div>
      <Composer withText={true} />
    </div>
  );
}

// ============================================================
// SCREEN 2 — EMPTY STATE
// ============================================================
function EmptyChat() {
  return (
    <div style={c.wrap}>
      <ChatHeader />
      <ContextBanner />
      <div style={{ ...c.messages, display: "flex", flexDirection: "column", padding: "16px 14px 60px" }}>
        <DateDivider label="Hoy · 19 de mayo" />
        <SystemMsg icon="check" color="#18A66A" text="Ramón aceptó tu solicitud. ¡Ya pueden chatear!" time="14:05" />

        <div style={c.emptyMid}>
          <div style={c.emptyIcon}>
            <Ic name="message-circle" size={32} color="#0A6BCF" />
          </div>
          <h3 style={c.emptyTitle}>Chat iniciado con Ramón</h3>
          <p style={c.emptySub}>Coordina los detalles del servicio antes de la visita. Tu conversación queda registrada por seguridad.</p>

          <div style={c.suggestRow}>
            <span style={c.suggestLabel}>SUGERENCIAS RÁPIDAS</span>
          </div>
          <div style={c.suggestChips}>
            <button style={c.suggestChip}>
              <Ic name="map-pin" size={11} color="#0A6BCF" style={{ marginRight: 5 }} />
              ¿Conoces la zona?
            </button>
            <button style={c.suggestChip}>
              <Ic name="clock" size={11} color="#0A6BCF" style={{ marginRight: 5 }} />
              ¿A qué hora llegas?
            </button>
            <button style={c.suggestChip}>
              <Ic name="info" size={11} color="#0A6BCF" style={{ marginRight: 5 }} />
              Te mando referencias
            </button>
            <button style={c.suggestChip}>
              <Ic name="image" size={11} color="#0A6BCF" style={{ marginRight: 5 }} />
              Compartir foto del problema
            </button>
          </div>

          <div style={c.trustNote}>
            <Ic name="shield-check" size={12} color="#18A66A" />
            <span>
              <b style={{ color: "#0E2C56", fontWeight: 700 }}>Conversación protegida.</b> No compartas teléfonos, emails o datos de pago fuera de la app.
            </span>
          </div>
        </div>
      </div>
      <Composer withText={false} />
    </div>
  );
}

// ============================================================
// SCREEN 3 — MODERATED + ATTACH MENU
// ============================================================
function ModeratedChat() {
  return (
    <div style={c.wrap}>
      <ChatHeader />
      <ContextBanner />
      <div style={c.messages}>
        <DateDivider label="Hoy · 19 de mayo" />

        <SystemMsg icon="check" color="#18A66A" text="Ramón aceptó tu solicitud." time="14:05" />

        <TechMsg time="14:30" text="Hola María, ya estoy en camino, llego en 20 min." />

        <UserMsg time="14:32" status="read" text="Perfecto Ramón, gracias. El portón está descompuesto, toca el timbre." />

        <TechMsg time="14:33" moderated />

        <UserMsg time="14:34" status="read" text="Ah ok, está bien. Mejor te aviso por aquí cuando estés afuera." />

        <SystemMsg icon="shield-alert" color="#B45309" text="Mensaje moderado por compartir datos de contacto." time="14:33" />

        <TechMsg time="14:35" text="Perdón, tienes razón. Te aviso por chat cuando esté afuera." />
      </div>
      <Composer withText={false} attachOpen={true} />
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
      <DCSection id="chat" title="Chat cliente ↔ técnico" subtitle="Activo · vacío · moderado">
        <DCArtboard id="active" label="01 · Conversación activa" width={438} height={892}>
          <PhoneFrame><ActiveChat /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="empty" label="02 · Chat recién iniciado · empty state" width={438} height={892}>
          <PhoneFrame><EmptyChat /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="moderated" label="03 · Moderación + menú de adjuntos" width={438} height={892}>
          <PhoneFrame><ModeratedChat /></PhoneFrame>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// ============================================================
// STYLES
// ============================================================
const c = {
  wrap: { width: "100%", height: "100%", background: "#F8FBFF", display: "flex", flexDirection: "column", position: "relative" },

  // Header
  header: { display: "flex", alignItems: "center", gap: 10, padding: "50px 14px 10px", background: "#FFFFFF", borderBottom: "1px solid #F0F4F9", flexShrink: 0 },
  backBtn: { width: 34, height: 34, borderRadius: 10, background: "transparent", border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  headerTechAv: { position: "relative", width: 38, height: 38, borderRadius: "50%", display: "grid", placeItems: "center", color: "#FFFFFF", fontWeight: 600, fontSize: 12, background: TECH_TONE, fontFamily: "'Manrope', sans-serif", flexShrink: 0 },
  headerVerifyDot: { position: "absolute", right: -2, bottom: -2, width: 12, height: 12, borderRadius: "50%", background: "#18A66A", border: "2px solid #FFFFFF" },
  headerName: { fontSize: 14.5, fontWeight: 700, color: "#0E2C56" },
  headerStatus: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#18A66A", marginTop: 2, fontWeight: 500 },
  onlineDot: { width: 6, height: 6, borderRadius: "50%", background: "#18A66A", boxShadow: "0 0 0 3px rgba(24,166,106,0.18)" },
  iconBtn: { width: 36, height: 36, borderRadius: 10, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },

  // Context banner
  ctxBanner: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "linear-gradient(135deg, rgba(10,107,207,0.06), rgba(24,193,255,0.06))", borderBottom: "1px solid rgba(10,107,207,0.18)", cursor: "pointer", flexShrink: 0 },
  ctxIcon: { width: 30, height: 30, borderRadius: 8, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  ctxLabel: { fontSize: 12.5, color: "#0E2C56", fontWeight: 600 },
  ctxSub: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  ctxStatus: { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", background: "#E5F7EE", color: "#18A66A", borderRadius: 999, fontSize: 10.5, fontWeight: 700, flexShrink: 0 },

  // Messages area
  messages: { flex: 1, overflowY: "auto", padding: "10px 14px 60px", background: "#F8FBFF", display: "flex", flexDirection: "column" },

  // Date divider
  dateDivider: { display: "flex", alignItems: "center", gap: 12, margin: "6px 0 14px", padding: "0 20px" },
  dateLine: { flex: 1, height: 1, background: "#E1E8F0" },
  dateLabel: { fontSize: 10.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".04em", fontWeight: 500 },

  // Right (user) bubbles
  rightWrap: { display: "flex", justifyContent: "flex-end", marginBottom: 8 },
  userBubble: { maxWidth: "78%", padding: "8px 12px", background: "#0A6BCF", borderRadius: "16px 16px 4px 16px", color: "#FFFFFF", boxShadow: "0 1px 2px rgba(10,107,207,0.18)" },
  bubbleText: { margin: 0, fontSize: 14, lineHeight: 1.4, color: "#FFFFFF" },
  bubbleTextDark: { margin: 0, fontSize: 14, lineHeight: 1.4, color: "#0E2C56" },
  userMeta: { display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, marginTop: 4, fontSize: 10, color: "rgba(255,255,255,0.7)", fontFamily: "'JetBrains Mono', monospace" },
  readMark: { display: "inline-flex" },

  // Left (tech) bubbles
  leftWrap: { display: "flex", gap: 6, marginBottom: 8 },
  miniAv: { width: 30, height: 30, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", color: "#FFFFFF", fontWeight: 600, fontSize: 10, fontFamily: "'Manrope', sans-serif", alignSelf: "flex-end" },
  techBubble: { padding: "8px 12px", background: "#FFFFFF", borderRadius: "16px 16px 16px 4px", border: "1px solid #E1E8F0", color: "#0E2C56" },
  techBubbleModerated: { padding: "10px 12px", background: "#FEF3DC", borderRadius: "16px 16px 16px 4px", border: "1px solid rgba(245,158,11,0.45)" },
  techMeta: { fontSize: 10, color: "#9CA3AF", marginTop: 3, marginLeft: 4, fontFamily: "'JetBrains Mono', monospace" },
  attachThumb: { width: 54, height: 54, borderRadius: 8, display: "grid", placeItems: "center", cursor: "pointer" },

  moderatedRow: { display: "flex", alignItems: "center", gap: 5, marginBottom: 5 },
  redactedChip: { display: "inline-flex", alignItems: "center", padding: "1px 7px", background: "rgba(180,83,9,0.15)", color: "#B45309", borderRadius: 6, fontSize: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" },
  moderatedHint: { display: "flex", alignItems: "center", gap: 5, marginTop: 5, padding: "4px 8px", fontSize: 10.5, color: "#9CA3AF", lineHeight: 1.3 },

  // System messages
  systemRow: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3, margin: "12px 0" },
  systemBubble: { display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 999, boxShadow: "0 1px 2px rgba(14,44,86,0.04)" },
  systemIcon: { width: 18, height: 18, borderRadius: "50%", display: "grid", placeItems: "center", flexShrink: 0 },
  systemText: { fontSize: 11.5, color: "#6B7280", fontWeight: 500 },
  systemTime: { fontSize: 9.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" },

  // Composer
  composerWrap: { position: "absolute", left: 0, right: 0, bottom: 0, background: "#FFFFFF", borderTop: "1px solid #E1E8F0", flexShrink: 0, paddingBottom: 24 },
  composer: { display: "flex", alignItems: "center", gap: 8, padding: "10px 12px" },
  composerIconBtn: { width: 38, height: 38, borderRadius: "50%", background: "rgba(10,107,207,0.08)", border: "1px solid rgba(10,107,207,0.18)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  composerIconBtnActive: { background: "#0A6BCF", borderColor: "#0A6BCF" },
  composerInput: { flex: 1, display: "flex", alignItems: "center", gap: 8, background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 22, padding: "10px 14px", minHeight: 42 },
  composerText: { flex: 1, fontSize: 14, color: "#0E2C56", lineHeight: 1.4 },
  composerPlaceholder: { flex: 1, fontSize: 14, color: "#9CA3AF" },
  composerEmoji: { width: 22, height: 22, background: "transparent", border: "none", padding: 0, cursor: "pointer", display: "grid", placeItems: "center" },
  composerSend: { width: 42, height: 42, borderRadius: "50%", background: "#0A6BCF", border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0, boxShadow: "0 4px 10px rgba(10,107,207,0.25)" },
  composerMicDisabled: { width: 38, height: 38, borderRadius: "50%", background: "#EEF3F8", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", flexShrink: 0, cursor: "not-allowed" },

  // Attach sheet
  attachSheet: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, padding: "14px 16px 6px", borderTop: "1px solid #F0F4F9" },
  attachOption: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" },
  attachOptIcon: { width: 52, height: 52, borderRadius: 14, display: "grid", placeItems: "center" },
  attachOptLabel: { fontSize: 10.5, color: "#0E2C56", fontWeight: 500 },

  // EMPTY
  emptyMid: { padding: "32px 18px 0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  emptyIcon: { width: 64, height: 64, borderRadius: 18, background: "radial-gradient(circle at 30% 30%, rgba(24,193,255,0.18), rgba(10,107,207,0.10) 70%)", display: "grid", placeItems: "center", marginBottom: 18 },
  emptyTitle: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 18, color: "#0E2C56", margin: "0 0 8px", letterSpacing: "-0.01em" },
  emptySub: { fontSize: 13, color: "#6B7280", lineHeight: 1.5, margin: "0 0 24px", maxWidth: 280 },
  suggestRow: { display: "flex", justifyContent: "center", marginBottom: 10 },
  suggestLabel: { fontSize: 9.5, color: "#9CA3AF", letterSpacing: ".08em", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" },
  suggestChips: { display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: 24 },
  suggestChip: { display: "inline-flex", alignItems: "center", padding: "8px 12px", background: "#FFFFFF", border: "1px solid rgba(10,107,207,0.25)", borderRadius: 999, fontSize: 12, color: "#0A6BCF", fontWeight: 600, cursor: "pointer" },
  trustNote: { display: "flex", gap: 8, alignItems: "flex-start", padding: "10px 14px", background: "#E5F7EE", border: "1px solid rgba(24,166,106,0.25)", borderRadius: 12, fontSize: 11.5, color: "#6B7280", lineHeight: 1.4, textAlign: "left" },
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
