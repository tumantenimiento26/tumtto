/* global React, ReactDOM, IOSDevice */
const { useState, useEffect, useRef } = React;

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

// ============================================================
// SHARED · header w/ back + step progress
// ============================================================
function StepHeader({ step, total = 3 }) {
  const pct = (step / total) * 100;
  return (
    <>
      <div style={hh.progressTrack}>
        <div style={{ ...hh.progressFill, width: `${pct}%` }} />
      </div>
      <div style={hh.headerRow}>
        <button style={hh.backBtn}><Ic name="arrow-left" size={18} color="#0E2C56" /></button>
        <span style={hh.stepLabel}>Paso {step} de {total}</span>
        <button style={hh.helpBtn}><Ic name="help-circle" size={16} color="#6B7280" /></button>
      </div>
    </>
  );
}

// ============================================================
// SCREEN 1 — DATOS PERSONALES
// ============================================================
function Personal() {
  return (
    <div style={hh.wrap}>
      <StepHeader step={1} />
      <div style={hh.body}>
        <h1 style={hh.title}>Cuéntanos sobre ti</h1>
        <p style={hh.sub}>Solo lo básico para que tu experiencia funcione bien.</p>

        <div style={p1.avatarWrap}>
          <div style={p1.avatar}>
            <Ic name="camera" size={26} color="#0A6BCF" />
            <div style={p1.avatarBadge}><Ic name="plus" size={12} color="#FFFFFF" /></div>
          </div>
          <span style={p1.avatarLabel}>Agregar foto <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(opcional)</span></span>
        </div>

        <div style={hh.field}>
          <label style={hh.label}>Nombre completo</label>
          <div style={{ ...hh.inputWrap, ...hh.inputFocus }}>
            <Ic name="user-round" size={16} color="#0A6BCF" style={{ marginLeft: 14 }} />
            <input style={hh.input} defaultValue="María Rodríguez Gómez" readOnly />
          </div>
        </div>

        <div style={hh.field}>
          <label style={hh.label}>Correo electrónico</label>
          <div style={hh.inputWrap}>
            <Ic name="mail" size={16} color="#9CA3AF" style={{ marginLeft: 14 }} />
            <input style={hh.input} placeholder="tu@email.com" defaultValue="maria.rg@gmail.com" readOnly />
          </div>
          <div style={hh.hint}>
            <Ic name="info" size={12} color="#6B7280" />
            <span>Usaremos tu correo para enviarte recibos y notificaciones importantes.</span>
          </div>
        </div>

        <div style={hh.field}>
          <label style={hh.label}>Fecha de nacimiento <span style={{ color: "#9CA3AF", fontWeight: 400, fontSize: 11 }}>· opcional</span></label>
          <div style={hh.inputWrap}>
            <Ic name="calendar" size={16} color="#9CA3AF" style={{ marginLeft: 14 }} />
            <input style={hh.input} placeholder="DD / MM / AAAA" />
          </div>
        </div>

        <button style={hh.primaryBtn}>
          Continuar
          <Ic name="arrow-right" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN 2 — DIRECCIÓN
// ============================================================
function Address({ waitlist = false }) {
  return (
    <div style={hh.wrap}>
      <StepHeader step={2} />
      <div style={hh.body}>
        {waitlist && (
          <div style={p2.warnBanner}>
            <div style={p2.warnIcon}><Ic name="alert-triangle" size={18} color="#FFFFFF" /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#7B3E07" }}>Aún no operamos en esta zona</div>
              <div style={{ fontSize: 12, color: "#7B3E07", opacity: 0.85, marginTop: 2, lineHeight: 1.4 }}>
                Puerto Vallarta está fuera de la ZMG. Te avisamos cuando lleguemos.
              </div>
            </div>
          </div>
        )}

        <h1 style={hh.title}>¿Dónde necesitas servicio?</h1>
        <p style={hh.sub}>{waitlist ? "Tu colonia se sumará a la lista de espera." : "Esta será tu dirección principal. Podrás agregar más después."}</p>

        {!waitlist && (
          <button style={p2.geoCta}>
            <div style={p2.geoIcon}><Ic name="locate-fixed" size={18} color="#FFFFFF" /></div>
            <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, color: "#FFFFFF", fontWeight: 600 }}>Usar mi ubicación actual</div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>Detectamos tu colonia automáticamente.</div>
            </div>
            <Ic name="arrow-right" size={16} color="#FFFFFF" />
          </button>
        )}

        {!waitlist && (
          <div style={hh.divider}>
            <span style={hh.dividerLine} />
            <span style={hh.dividerText}>o ingrésala manualmente</span>
            <span style={hh.dividerLine} />
          </div>
        )}

        <div style={hh.field}>
          <label style={hh.label}>Calle y número</label>
          <div style={hh.inputWrap}>
            <Ic name="home" size={16} color="#9CA3AF" style={{ marginLeft: 14 }} />
            <input style={hh.input} defaultValue={waitlist ? "Calle Olas Altas 530" : "Av. Patria 1234"} readOnly />
          </div>
        </div>

        <div style={hh.row2}>
          <div style={hh.field}>
            <label style={hh.label}>Colonia</label>
            <div style={hh.inputWrap}>
              <input style={{ ...hh.input, paddingLeft: 14 }} defaultValue={waitlist ? "Emiliano Zapata" : "Providencia"} readOnly />
            </div>
          </div>
          <div style={hh.field}>
            <label style={hh.label}>CP</label>
            <div style={hh.inputWrap}>
              <input style={{ ...hh.input, paddingLeft: 14, fontFamily: "'JetBrains Mono', monospace" }} defaultValue={waitlist ? "48380" : "45160"} readOnly />
            </div>
          </div>
        </div>

        <div style={hh.row2}>
          <div style={hh.field}>
            <label style={hh.label}>Ciudad</label>
            <div style={hh.inputWrap}>
              <input style={{ ...hh.input, paddingLeft: 14 }} defaultValue={waitlist ? "Puerto Vallarta" : "Zapopan"} readOnly />
            </div>
          </div>
          <div style={hh.field}>
            <label style={hh.label}>Estado</label>
            <div style={{ ...hh.inputWrap, background: "#F8FBFF" }}>
              <input style={{ ...hh.input, paddingLeft: 14, color: "#6B7280" }} defaultValue="Jalisco" readOnly />
              <Ic name="lock" size={12} color="#9CA3AF" style={{ marginRight: 12 }} />
            </div>
          </div>
        </div>

        <div style={hh.field}>
          <label style={hh.label}>Referencias <span style={{ color: "#9CA3AF", fontWeight: 400, fontSize: 11 }}>· opcional</span></label>
          <textarea style={hh.textarea} defaultValue="Frente al parque, casa color blanco. Hay un Sentra azul afuera." />
        </div>

        {!waitlist && (
          <>
            <div style={p2.aliasField}>
              <label style={hh.label}>¿Cómo le llamas a este lugar?</label>
              <div style={p2.aliasChips}>
                <div style={{ ...p2.aliasChip, ...p2.aliasChipSel }}>
                  <Ic name="home" size={13} color="#FFFFFF" style={{ marginRight: 6 }} />Casa
                </div>
                <div style={p2.aliasChip}>
                  <Ic name="briefcase" size={13} color="#0E2C56" style={{ marginRight: 6 }} />Oficina
                </div>
                <div style={p2.aliasChip}>
                  <Ic name="heart" size={13} color="#0E2C56" style={{ marginRight: 6 }} />Otra
                </div>
                <div style={p2.aliasChipAdd}>
                  <Ic name="plus" size={13} color="#0A6BCF" />
                </div>
              </div>
            </div>

            <div style={p2.mapCard}>
              <MiniMap />
              <div style={p2.mapMeta}>
                <Ic name="map-pin" size={13} color="#0A6BCF" />
                <span style={{ fontSize: 12, color: "#0E2C56", fontWeight: 500 }}>Av. Patria 1234</span>
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>·</span>
                <span style={{ fontSize: 11, color: "#6B7280" }}>Providencia, Zap.</span>
              </div>
            </div>
          </>
        )}

        <button style={waitlist ? { ...hh.primaryBtn, background: "#F59E0B", boxShadow: "0 6px 14px rgba(245,158,11,0.28)" } : hh.primaryBtn}>
          {waitlist ? (
            <>
              <Ic name="bell-ring" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              Notifícame cuando lleguen
            </>
          ) : (
            <>
              Continuar
              <Ic name="arrow-right" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </>
          )}
        </button>

        {waitlist && (
          <p style={{ fontSize: 11.5, color: "#9CA3AF", lineHeight: 1.5, textAlign: "center", margin: "16px 0 0" }}>
            <Ic name="users" size={11} color="#9CA3AF" style={{ marginRight: 5 }} />
            <span>148 personas ya están en la lista de espera para Puerto Vallarta.</span>
          </p>
        )}
      </div>
    </div>
  );
}

function MiniMap() {
  return (
    <svg viewBox="0 0 360 140" width="100%" height={120} style={{ borderRadius: "10px 10px 0 0", background: "#EEF3F8", display: "block" }}>
      <defs>
        <pattern id="onbMapGrid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0 L0 0 0 24" fill="none" stroke="#DCE6F1" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="360" height="140" fill="url(#onbMapGrid)" />
      <path d="M0 90 Q 120 70 240 90 Q 320 100 360 85" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.95" />
      <path d="M180 0 Q 165 70 195 140" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.75" />
      <circle cx="180" cy="70" r="32" fill="rgba(10,107,207,0.16)" stroke="rgba(10,107,207,0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
      <g transform="translate(180, 70)">
        <path d="M0,-22 a14,16 0 1 1 0.01,0 Z M0,0 L-4,-12 L4,-12 Z" fill="#0A6BCF" />
        <circle cy="-14" r="5" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

// ============================================================
// SCREEN 3 — PERMISOS
// ============================================================
function Permissions() {
  return (
    <div style={hh.wrap}>
      <StepHeader step={3} />
      <div style={hh.body}>
        <h1 style={hh.title}>Activa estos permisos</h1>
        <p style={hh.sub}>Para que tu experiencia sea fluida y segura. Puedes cambiarlos en cualquier momento.</p>

        <PermissionCard
          icon="map-pin"
          color="#0A6BCF"
          title="Ubicación"
          desc="Para mostrarte técnicos cercanos y darles tu dirección cuando solicites servicio."
          active
          benefit="Tiempos de llegada hasta 32% más rápidos"
        />
        <PermissionCard
          icon="bell"
          color="#0884B0"
          title="Notificaciones"
          desc="Te avisaremos cuando un técnico acepte, esté en camino y al recibir mensajes nuevos."
          active
          benefit="No te pierdes actualizaciones del servicio"
        />
        <PermissionCard
          icon="camera"
          color="#0E2C56"
          title="Cámara y fotos"
          desc="Para mostrarle al técnico el problema antes del servicio. Cotizaciones más precisas."
          active={false}
          benefit="Cotizaciones más precisas desde el primer mensaje"
        />

        <div style={p3.assurance}>
          <Ic name="shield-check" size={14} color="#18A66A" />
          <span>Puedes cambiar esto en cualquier momento desde <b style={{ color: "#0E2C56", fontWeight: 600 }}>Ajustes › Privacidad</b>.</span>
        </div>

        <button style={hh.primaryBtn}>
          <Ic name="sparkles" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
          Continuar y empezar
        </button>

        <a href="#" style={p3.skipLink}>Configurar más tarde</a>
      </div>
    </div>
  );
}

function PermissionCard({ icon, color, title, desc, active, benefit }) {
  return (
    <div style={{ ...p3.card, ...(active ? p3.cardActive : null) }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{ ...p3.permIcon, background: `${color}1A` }}>
          <Ic name={icon} size={22} color={color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={p3.permTitle}>{title}</span>
            {active && (
              <span style={p3.activeBadge}>
                <Ic name="check" size={10} color="#18A66A" />
                Activado
              </span>
            )}
          </div>
          <p style={p3.permDesc}>{desc}</p>
        </div>
        <div style={{ ...p3.toggle, ...(active ? p3.toggleOn : null) }}>
          <span style={{ ...p3.toggleKnob, ...(active ? p3.toggleKnobOn : null) }} />
        </div>
      </div>
      <div style={{ ...p3.benefitRow, ...(active ? null : { opacity: 0.55 }) }}>
        <Ic name="trending-up" size={11} color={active ? "#18A66A" : "#9CA3AF"} />
        <span style={{ fontSize: 11.5, color: active ? "#18A66A" : "#9CA3AF", fontWeight: 500 }}>{benefit}</span>
      </div>
    </div>
  );
}

// ============================================================
// FRAME / CANVAS
// ============================================================
function PhoneFrame({ children }) {
  return (
    <div style={{ padding: 24, background: "transparent" }}>
      <IOSDevice width={390} height={844}>
        <div style={{ width: 390, height: 844, position: "relative" }}>{children}</div>
      </IOSDevice>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="b2" title="Onboarding cliente · Datos + Permisos" subtitle="Después del OTP verificado">
        <DCArtboard id="personal" label="01 · Datos personales" width={438} height={892}>
          <PhoneFrame><Personal /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="address" label="02 · Dirección · Zapopan" width={438} height={892}>
          <PhoneFrame><Address waitlist={false} /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="address-waitlist" label="02b · Dirección · fuera de zona" width={438} height={892}>
          <PhoneFrame><Address waitlist={true} /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="permissions" label="03 · Permisos" width={438} height={892}>
          <PhoneFrame><Permissions /></PhoneFrame>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// ============================================================
// STYLES
// ============================================================
const hh = {
  wrap: { width: "100%", height: "100%", background: "#FFFFFF", display: "flex", flexDirection: "column", paddingTop: 48 },
  progressTrack: { height: 3, background: "#EEF3F8", position: "relative" },
  progressFill: { height: "100%", background: "linear-gradient(90deg, #0A6BCF, #18C1FF)", borderRadius: 999, transition: "width .3s" },
  headerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px" },
  backBtn: { width: 38, height: 38, borderRadius: 12, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer" },
  helpBtn: { width: 38, height: 38, borderRadius: 12, background: "transparent", border: "1px solid transparent", display: "grid", placeItems: "center", cursor: "pointer" },
  stepLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#0E2C56", fontWeight: 500, background: "#F8FBFF", padding: "4px 10px", borderRadius: 999, border: "1px solid #E1E8F0", letterSpacing: ".04em" },

  body: { flex: 1, padding: "8px 22px 32px", overflowY: "auto" },
  title: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 26, lineHeight: 1.15, letterSpacing: "-0.02em", color: "#0E2C56", margin: "8px 0 8px" },
  sub: { fontSize: 14, color: "#6B7280", margin: "0 0 22px", lineHeight: 1.5 },

  field: { marginBottom: 16 },
  row2: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 0 },
  label: { fontSize: 12.5, fontWeight: 500, color: "#0E2C56", marginBottom: 6, display: "block" },
  inputWrap: { display: "flex", alignItems: "center", background: "#FFFFFF", border: "1.5px solid #E1E8F0", borderRadius: 12, height: 52, transition: "border-color .15s" },
  inputFocus: { borderColor: "#0A6BCF", boxShadow: "0 0 0 3px rgba(10,107,207,0.12)" },
  input: { flex: 1, border: "none", outline: "none", background: "transparent", padding: "0 12px", fontSize: 15, color: "#0E2C56", fontWeight: 500 },
  textarea: { width: "100%", minHeight: 64, border: "1.5px solid #E1E8F0", borderRadius: 12, background: "#FFFFFF", outline: "none", padding: "10px 14px", fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#0E2C56", lineHeight: 1.4, resize: "vertical" },
  hint: { display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 11.5, color: "#6B7280", lineHeight: 1.4 },

  divider: { display: "flex", alignItems: "center", gap: 14, margin: "8px 0 16px" },
  dividerLine: { flex: 1, height: 1, background: "#E1E8F0" },
  dividerText: { fontSize: 11.5, color: "#9CA3AF" },

  primaryBtn: { width: "100%", height: 56, background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 14, fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(10,107,207,0.28)", marginTop: 20 },
};

const p1 = {
  avatarWrap: { display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 },
  avatar: { position: "relative", width: 100, height: 100, borderRadius: "50%", background: "rgba(10,107,207,0.08)", border: "2px dashed rgba(10,107,207,0.3)", display: "grid", placeItems: "center" },
  avatarBadge: { position: "absolute", right: 0, bottom: 0, width: 30, height: 30, borderRadius: "50%", background: "#0A6BCF", display: "grid", placeItems: "center", border: "3px solid #FFFFFF" },
  avatarLabel: { marginTop: 12, fontSize: 13, color: "#0E2C56", fontWeight: 500 },
};

const p2 = {
  geoCta: { width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 14, background: "linear-gradient(135deg, #0A6BCF, #0894EA)", border: "none", borderRadius: 14, cursor: "pointer", boxShadow: "0 4px 12px rgba(10,107,207,0.25)", marginBottom: 4 },
  geoIcon: { width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.18)", display: "grid", placeItems: "center", flexShrink: 0 },
  warnBanner: { display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", background: "#FEF3DC", border: "1px solid rgba(245,158,11,0.4)", borderRadius: 12, marginBottom: 18 },
  warnIcon: { width: 36, height: 36, borderRadius: 10, background: "#F59E0B", display: "grid", placeItems: "center", flexShrink: 0 },
  aliasField: { marginTop: 10, marginBottom: 16 },
  aliasChips: { display: "flex", gap: 8, flexWrap: "wrap" },
  aliasChip: { display: "inline-flex", alignItems: "center", padding: "8px 14px", background: "#FFFFFF", border: "1.5px solid #E1E8F0", borderRadius: 999, fontSize: 13, color: "#0E2C56", fontWeight: 500, cursor: "pointer" },
  aliasChipSel: { background: "#0A6BCF", borderColor: "#0A6BCF", color: "#FFFFFF" },
  aliasChipAdd: { display: "inline-grid", placeItems: "center", width: 36, height: 36, borderRadius: "50%", border: "1.5px dashed #0A6BCF", background: "rgba(10,107,207,0.06)", cursor: "pointer" },
  mapCard: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12, overflow: "hidden", marginTop: 6 },
  mapMeta: { display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderTop: "1px solid #F0F4F9" },
};

const p3 = {
  card: { background: "#FFFFFF", border: "1.5px solid #E1E8F0", borderRadius: 16, padding: 18, marginBottom: 12, transition: "all .15s" },
  cardActive: { borderColor: "rgba(24,166,106,0.4)", background: "linear-gradient(135deg, rgba(24,166,106,0.04), rgba(10,107,207,0.04))" },
  permIcon: { width: 46, height: 46, borderRadius: 12, display: "grid", placeItems: "center", flexShrink: 0 },
  permTitle: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 16, color: "#0E2C56", letterSpacing: "-0.01em" },
  activeBadge: { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", background: "#E5F7EE", color: "#18A66A", borderRadius: 999, fontSize: 10.5, fontWeight: 700 },
  permDesc: { fontSize: 12.5, color: "#6B7280", lineHeight: 1.45, margin: "4px 0 0" },
  toggle: { position: "relative", width: 46, height: 28, borderRadius: 999, background: "#E1E8F0", flexShrink: 0, transition: "background .15s" },
  toggleOn: { background: "#18A66A" },
  toggleKnob: { position: "absolute", left: 3, top: 3, width: 22, height: 22, borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 1px 3px rgba(14,44,86,0.2)", transition: "transform .15s" },
  toggleKnobOn: { transform: "translateX(18px)" },
  benefitRow: { display: "flex", alignItems: "center", gap: 6, padding: "8px 0 0", marginLeft: 60, borderTop: "1px solid #F0F4F9", marginTop: 14 },
  assurance: { display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 10, fontSize: 12, color: "#6B7280", marginTop: 4, lineHeight: 1.4 },
  skipLink: { display: "block", textAlign: "center", marginTop: 14, color: "#6B7280", textDecoration: "none", fontSize: 13, fontWeight: 500 },
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
