/* global React, ReactDOM, lucide */
const { useState, useEffect, useRef } = React;

// ---------- Shared building blocks ----------
function Icon({ name, size = 16, stroke = 1.75, color = "currentColor", style }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && window.lucide) {
      ref.current.innerHTML = "";
      const node = document.createElement("i");
      node.setAttribute("data-lucide", name);
      ref.current.appendChild(node);
      window.lucide.createIcons({
        attrs: { "stroke-width": stroke, width: size, height: size, color },
        nameAttr: "data-lucide",
      });
    }
  }, [name, size, stroke, color]);
  return <span ref={ref} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", ...style }} />;
}

function GoogleG({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2c-2 1.5-4.6 2.4-7.3 2.4-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.7 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.2 5.2C40.7 36 44 30.6 44 24c0-1.2-.1-2.4-.4-3.5z" />
    </svg>
  );
}

// ---------- MFA form ----------
function MfaForm() {
  const [digits, setDigits] = useState(["4", "8", "2", "", "", ""]);
  const refs = useRef([]);
  const [seconds, setSeconds] = useState(22);

  useEffect(() => {
    const t = setInterval(() => {
      setSeconds((s) => (s <= 1 ? 30 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  function setDigit(idx, val) {
    const v = val.replace(/[^0-9]/g, "").slice(0, 1);
    setDigits((d) => {
      const nd = [...d];
      nd[idx] = v;
      return nd;
    });
    if (v && idx < 5 && refs.current[idx + 1]) refs.current[idx + 1].focus();
  }
  function handleKey(idx, e) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0 && refs.current[idx - 1]) {
      refs.current[idx - 1].focus();
    }
  }

  const pct = (seconds / 30) * 100;
  const timerColor = seconds <= 10 ? "#F59E0B" : "#0A6BCF";

  return (
    <div style={lf.form}>
      <div style={mfa.iconBlock}>
        <Icon name="shield-check" size={22} color="#0A6BCF" />
      </div>
      <h1 style={lf.title}>Verificación en dos pasos</h1>
      <p style={{ ...lf.subtitle, marginBottom: 24 }}>
        Ingresa el código de 6 dígitos de tu app autenticadora (Google Authenticator, Authy, etc.).
      </p>

      <div style={mfa.userPill}>
        <Icon name="user-round" size={14} color="#0E2C56" />
        <span>operaciones@tumantenimiento.mx</span>
      </div>

      <div style={mfa.codeRow}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => handleKey(i, e)}
            inputMode="numeric"
            maxLength={1}
            style={{
              ...mfa.codeBox,
              ...(d ? mfa.codeBoxFilled : null),
            }}
          />
        ))}
      </div>

      <button style={lf.btnPrimary}>Verificar</button>

      <div style={mfa.timerBlock}>
        <div style={mfa.timerHead}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="timer" size={13} color={timerColor} />
            <span>El código expira en</span>
          </span>
          <b style={{ color: timerColor, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>
            00:{String(seconds).padStart(2, "0")}
          </b>
        </div>
        <div style={mfa.timerTrack}>
          <div style={{ ...mfa.timerFill, width: `${pct}%`, background: timerColor }} />
        </div>
      </div>

      <div style={mfa.divider} />

      <div style={mfa.helpRow}>
        <a href="#" style={mfa.helpLink}>
          <Icon name="refresh-cw" size={13} color="#0A6BCF" />
          <span>Reenviar código por SMS</span>
        </a>
        <a href="#" style={mfa.helpLink}>
          <Icon name="life-buoy" size={13} color="#0A6BCF" />
          <span>¿Problemas? Contactar soporte interno</span>
        </a>
      </div>
    </div>
  );
}

// ---------- Forgot password form ----------
function ForgotForm({ state = "default" }) {
  const isSent = state === "sent";
  return (
    <div style={lf.form}>
      <a href="#" style={fp.backLink}>
        <Icon name="arrow-left" size={14} color="#0A6BCF" />
        <span>Volver al inicio de sesión</span>
      </a>

      {isSent ? (
        <>
          <div style={fp.successIcon}>
            <Icon name="mail-check" size={28} color="#18A66A" />
          </div>
          <h1 style={lf.title}>Revisa tu correo</h1>
          <p style={{ ...lf.subtitle, marginBottom: 24 }}>
            Si <b style={{ color: "#0E2C56", fontWeight: 600 }}>operaciones@tumantenimiento.mx</b> está registrado como cuenta admin, recibirás un enlace en los próximos minutos.
          </p>

          <div style={fp.checklist}>
            <div style={fp.checkRow}>
              <Icon name="check" size={14} color="#18A66A" />
              <span>Revisa también tu carpeta de <b style={{ color: "#0E2C56", fontWeight: 600 }}>spam</b> o correo no deseado.</span>
            </div>
            <div style={fp.checkRow}>
              <Icon name="check" size={14} color="#18A66A" />
              <span>El enlace caduca a los <b style={{ color: "#0E2C56", fontWeight: 600 }}>30 minutos</b>.</span>
            </div>
            <div style={fp.checkRow}>
              <Icon name="check" size={14} color="#18A66A" />
              <span>Toda la actividad queda registrada en la bitácora de seguridad.</span>
            </div>
          </div>

          <button style={lf.btnPrimary}>Abrir cliente de correo</button>

          <p style={{ ...lf.note, marginTop: 20 }}>
            ¿No te llegó nada en 5 minutos?{" "}
            <a href="#" style={{ color: "#0A6BCF", textDecoration: "none", fontWeight: 500 }}>Reenviar enlace</a>
            {" "}o{" "}
            <a href="#" style={{ color: "#0A6BCF", textDecoration: "none", fontWeight: 500 }}>contactar soporte interno</a>.
          </p>
        </>
      ) : (
        <>
          <h1 style={lf.title}>Recuperar contraseña</h1>
          <p style={{ ...lf.subtitle, marginBottom: 24 }}>
            Ingresa tu correo corporativo y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          <div style={lf.field}>
            <label style={lf.label}>Correo electrónico</label>
            <div style={lf.inputWrap}>
              <Icon name="mail" size={16} color="#9CA3AF" style={{ marginLeft: 12 }} />
              <input
                type="email"
                defaultValue="operaciones@tumantenimiento.mx"
                placeholder="tu.cuenta@tumantenimiento.mx"
                style={lf.input}
              />
            </div>
            <div style={fp.hint}>
              Solo cuentas con dominio <b style={{ color: "#0E2C56", fontWeight: 600 }}>@tumantenimiento.mx</b> pueden recuperar acceso aquí.
            </div>
          </div>

          <button style={lf.btnPrimary}>Enviar enlace de recuperación</button>

          <div style={fp.aside}>
            <Icon name="shield-alert" size={14} color="#0E2C56" />
            <div>
              <b style={{ color: "#0E2C56", fontWeight: 600 }}>Sin acceso a tu correo corporativo.</b>
              <span style={{ color: "#6B7280" }}> Contacta a tu Super Admin para una recuperación asistida con verificación de identidad.</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ---------- Login form (right-side panel) ----------
function LoginForm({ state = "default" }) {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState(state === "error" ? "operaciones@tumantenimiento.mx" : "");
  const [pass, setPass] = useState(state === "error" ? "••••••••••" : "");

  const isError = state === "error";

  return (
    <div style={lf.form}>
      <h1 style={lf.title}>Iniciar sesión</h1>
      <p style={lf.subtitle}>Accede con tu cuenta corporativa.</p>

      {isError && (
        <div style={lf.errBanner}>
          <Icon name="alert-circle" size={16} color="#DC2626" />
          <div>
            <b style={{ color: "#7F1D1D", fontWeight: 600 }}>Credenciales incorrectas.</b>{" "}
            <span>Revisa tu correo y contraseña. Después de 5 intentos fallidos bloquearemos la cuenta.</span>
          </div>
        </div>
      )}

      <div style={lf.field}>
        <label style={lf.label}>Correo electrónico</label>
        <div style={{ ...lf.inputWrap, ...(isError ? lf.inputErr : null) }}>
          <Icon name="mail" size={16} color="#9CA3AF" style={{ marginLeft: 12 }} />
          <input
            type="email"
            placeholder="admin@tumantenimiento.mx"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={lf.input}
          />
        </div>
      </div>

      <div style={lf.field}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <label style={lf.label}>Contraseña</label>
          <a href="#" style={lf.linkSmall}>¿Olvidaste tu contraseña?</a>
        </div>
        <div style={{ ...lf.inputWrap, ...(isError ? lf.inputErr : null) }}>
          <Icon name="lock" size={16} color="#9CA3AF" style={{ marginLeft: 12 }} />
          <input
            type={showPass ? "text" : "password"}
            placeholder="Mínimo 10 caracteres"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            style={lf.input}
          />
          <button
            type="button"
            onClick={() => setShowPass((s) => !s)}
            style={lf.eyeBtn}
            aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            <Icon name={showPass ? "eye-off" : "eye"} size={16} color="#6B7280" />
          </button>
        </div>
        {isError && (
          <div style={lf.errText}>
            <Icon name="info" size={12} color="#DC2626" /> Las credenciales no coinciden con ningún Admin activo.
          </div>
        )}
      </div>

      <button style={lf.btnPrimary}>Iniciar sesión</button>

      <div style={lf.mfaHint}>
        <Icon name="shield-check" size={14} color="#0A6BCF" />
        <span>Después de iniciar sesión, se te solicitará tu <b style={{ color: "#0E2C56", fontWeight: 600 }}>código MFA</b>.</span>
      </div>

      <div style={lf.divider}>
        <span style={lf.dividerLine} />
        <span style={lf.dividerText}>o continúa con</span>
        <span style={lf.dividerLine} />
      </div>

      <button style={lf.btnSecondary}>
        <GoogleG size={18} />
        <span>Continuar con Google Workspace</span>
      </button>

      <p style={lf.note}>
        Acceso restringido a personal autorizado. Todas las sesiones son auditadas y registradas conforme a la política de seguridad de Tumantenimiento.
      </p>
    </div>
  );
}

// ---------- Brand panel (Variation A: 50/50) ----------
function BrandPanelA() {
  return (
    <div style={brandA.wrap}>
      <div style={brandA.dotgrid} />
      <div style={brandA.halo} />
      <div style={brandA.topRow}>
        <div style={brandA.brandLockup}>
          <img src="assets/logo.png" alt="Tumantenimiento" style={brandA.logo} />
          <div style={brandA.wordmark}>Tumantenimiento</div>
        </div>
        <div style={brandA.envBadge}>
          <span style={brandA.envDot} />
          PROD · MX
        </div>
      </div>

      <div style={brandA.center}>
        <div style={brandA.eyebrow}>PLATAFORMA INTERNA</div>
        <h2 style={brandA.headline}>
          Panel de administración
        </h2>
        <p style={brandA.tagline}>
          Operación, soporte y configuración de la plataforma. Mantén la red de técnicos verificados moviéndose.
        </p>
      </div>

      <div style={brandA.footer}>
        <div style={brandA.footerRow}>
          <Icon name="shield-check" size={14} color="#18C1FF" />
          <span>Sesión cifrada · TLS 1.3</span>
        </div>
        <div style={brandA.footerRow}>
          <Icon name="map-pin" size={14} color="#18C1FF" />
          <span>Operando en la ZMG · Guadalajara, Jal.</span>
        </div>
      </div>
    </div>
  );
}

// ---------- Brand panel (Variation B: 55/45 with live ops preview) ----------
function BrandPanelB() {
  const tickerItems = [
    { tone: "warn", icon: "alert-triangle", title: "Orden #4821 · Fuga en Providencia", meta: "Sin asignar · 11 min" },
    { tone: "ok", icon: "badge-check", title: "Ricardo Mendoza · KYC aprobado", meta: "Hace 2 min" },
    { tone: "info", icon: "user-plus", title: "Nuevo técnico postulado · Tlajomulco", meta: "Hace 6 min" },
  ];

  return (
    <div style={brandB.wrap}>
      <div style={brandB.dotgrid} />
      <div style={brandB.halo} />

      <div style={brandB.topRow}>
        <div style={brandB.brandLockup}>
          <img src="assets/logo.png" alt="Tumantenimiento" style={brandB.logo} />
          <div style={brandB.wordmark}>Tumantenimiento</div>
        </div>
        <div style={brandB.envBadge}>
          <span style={brandB.envDot} />
          PROD · MX
        </div>
      </div>

      <div style={brandB.center}>
        <div style={brandB.eyebrow}>PLATAFORMA INTERNA · 19 MAY 2026</div>
        <h2 style={brandB.headline}>Panel de administración</h2>
        <p style={brandB.tagline}>Una vista rápida de cómo va la operación antes de que inicies sesión.</p>

        <div style={brandB.statRow}>
          <div style={brandB.stat}>
            <div style={brandB.statNum}>147</div>
            <div style={brandB.statLabel}>Órdenes en curso</div>
            <div style={brandB.statDelta}>
              <Icon name="trending-up" size={12} color="#18C1FF" />
              <span>+18% vs ayer</span>
            </div>
          </div>
          <div style={brandB.stat}>
            <div style={brandB.statNum}>89</div>
            <div style={brandB.statLabel}>Técnicos en línea</div>
            <div style={brandB.statDelta}>
              <span style={brandB.liveDot} />
              <span>en vivo</span>
            </div>
          </div>
          <div style={brandB.stat}>
            <div style={{ ...brandB.statNum, color: "#FCD9A1" }}>4</div>
            <div style={brandB.statLabel}>Verificaciones por revisar</div>
            <div style={brandB.statDelta}>
              <Icon name="clock" size={12} color="#F59E0B" />
              <span style={{ color: "#FCD9A1" }}>pendiente</span>
            </div>
          </div>
        </div>

        <div style={brandB.feedTitle}>
          <span>Actividad reciente</span>
          <span style={brandB.feedTime}>actualizado hace 12 s</span>
        </div>
        <div style={brandB.feed}>
          {tickerItems.map((it, i) => (
            <div key={i} style={brandB.feedItem}>
              <div style={{ ...brandB.feedIcon, ...feedIconTone(it.tone) }}>
                <Icon name={it.icon} size={14} color={feedIconColor(it.tone)} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={brandB.feedItemTitle}>{it.title}</div>
                <div style={brandB.feedItemMeta}>{it.meta}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={brandB.footer}>
        <div style={brandB.footerRow}>
          <Icon name="shield-check" size={14} color="#18C1FF" />
          <span>Sesión cifrada · TLS 1.3 · Auditoría continua</span>
        </div>
      </div>
    </div>
  );
}

function feedIconTone(tone) {
  if (tone === "warn") return { background: "rgba(245,158,11,.16)" };
  if (tone === "ok") return { background: "rgba(24,166,106,.18)" };
  return { background: "rgba(24,193,255,.18)" };
}
function feedIconColor(tone) {
  if (tone === "warn") return "#F59E0B";
  if (tone === "ok") return "#18A66A";
  return "#18C1FF";
}

// ---------- Right-side container (form + footer status) ----------
function RightSide({ state }) {
  return (
    <div style={rs.wrap}>
      <div style={rs.content}>
        <LoginForm state={state} />
      </div>
      <div style={rs.footer}>
        <span>v1.0 MVP · Última actualización 19/05/2026</span>
        <span style={rs.dot} />
        <span>Estado del sistema:</span>
        <Icon name="check-circle-2" size={13} color="#18A66A" />
        <b style={{ color: "#18A66A", fontWeight: 600 }}>Operativo</b>
      </div>
    </div>
  );
}

// ---------- Three artboard compositions ----------
function VariationA({ state = "default" }) {
  return (
    <div style={{ width: 1440, height: 900, display: "flex", background: "#F8FBFF", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: 720, height: 900 }}><BrandPanelA /></div>
      <div style={{ width: 720, height: 900 }}><RightSide state={state} /></div>
    </div>
  );
}

function MfaScreen() {
  return (
    <div style={{ width: 1440, height: 900, display: "flex", background: "#F8FBFF", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: 720, height: 900 }}><BrandPanelA /></div>
      <div style={{ width: 720, height: 900 }}>
        <div style={rs.wrap}>
          <div style={rs.content}><MfaForm /></div>
          <div style={rs.footer}>
            <span>v1.0 MVP · Última actualización 19/05/2026</span>
            <span style={rs.dot} />
            <span>Estado del sistema:</span>
            <Icon name="check-circle-2" size={13} color="#18A66A" />
            <b style={{ color: "#18A66A", fontWeight: 600 }}>Operativo</b>
          </div>
        </div>
      </div>
    </div>
  );
}

function ForgotScreen({ state = "default" }) {
  return (
    <div style={{ width: 1440, height: 900, display: "flex", background: "#F8FBFF", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: 720, height: 900 }}><BrandPanelA /></div>
      <div style={{ width: 720, height: 900 }}>
        <div style={rs.wrap}>
          <div style={rs.content}><ForgotForm state={state} /></div>
          <div style={rs.footer}>
            <span>v1.0 MVP · Última actualización 19/05/2026</span>
            <span style={rs.dot} />
            <span>Estado del sistema:</span>
            <Icon name="check-circle-2" size={13} color="#18A66A" />
            <b style={{ color: "#18A66A", fontWeight: 600 }}>Operativo</b>
          </div>
        </div>
      </div>
    </div>
  );
}

function VariationB() {
  return (
    <div style={{ width: 1440, height: 900, display: "flex", background: "#F8FBFF", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: 792, height: 900 }}><BrandPanelB /></div>
      <div style={{ width: 648, height: 900 }}><RightSide state="default" /></div>
    </div>
  );
}

// ---------- Mount onto canvas ----------
function App() {
  return (
    <DesignCanvas title="Login · Admin Web" subtitle="Tumantenimiento · 1440×900">
      <DCSection id="logins" title="Pantalla de Login" subtitle="Split 50/50 · default + error">
        <DCArtboard id="A-default" label="Login · Default" width={1440} height={900}>
          <VariationA state="default" />
        </DCArtboard>
        <DCArtboard id="A-error" label="Login · Estado de error" width={1440} height={900}>
          <VariationA state="error" />
        </DCArtboard>
      </DCSection>
      <DCSection id="mfa-and-recovery" title="MFA y recuperación de contraseña" subtitle="Continúan el split 50/50">
        <DCArtboard id="mfa" label="Verificación MFA" width={1440} height={900}>
          <MfaScreen />
        </DCArtboard>
        <DCArtboard id="forgot" label="Recuperar contraseña · Default" width={1440} height={900}>
          <ForgotScreen state="default" />
        </DCArtboard>
        <DCArtboard id="forgot-sent" label="Recuperar contraseña · Enlace enviado" width={1440} height={900}>
          <ForgotScreen state="sent" />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// ---------- Styles ----------
const lf = {
  form: { width: 400, display: "flex", flexDirection: "column" },
  title: {
    fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 28, lineHeight: 1.15,
    letterSpacing: "-0.01em", color: "#0E2C56", margin: 0,
  },
  subtitle: { fontSize: 15, color: "#6B7280", margin: "8px 0 28px" },
  field: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: 500, color: "#0E2C56", marginBottom: 6, display: "block" },
  linkSmall: { fontSize: 13, color: "#0A6BCF", textDecoration: "none", fontWeight: 500 },
  inputWrap: {
    display: "flex", alignItems: "center", background: "#FFFFFF",
    border: "1px solid #E1E8F0", borderRadius: 10, height: 46, transition: "border-color .15s, box-shadow .15s",
  },
  inputErr: { borderColor: "#DC2626", boxShadow: "0 0 0 3px rgba(220,38,38,0.12)" },
  input: {
    flex: 1, border: "none", outline: "none", background: "transparent",
    fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#0E2C56",
    padding: "0 12px", height: "100%",
  },
  eyeBtn: {
    background: "transparent", border: "none", padding: "0 14px", cursor: "pointer",
    height: "100%", display: "grid", placeItems: "center",
  },
  errText: {
    display: "flex", gap: 6, alignItems: "center", marginTop: 8,
    fontSize: 12, color: "#DC2626", fontWeight: 500,
  },
  errBanner: {
    display: "flex", gap: 10, alignItems: "flex-start",
    background: "#FCE9E9", border: "1px solid rgba(220,38,38,.2)",
    borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#7F1D1D",
    marginBottom: 20,
  },
  btnPrimary: {
    height: 48, background: "#0A6BCF", color: "#FFFFFF",
    border: "none", borderRadius: 10, fontFamily: "'Inter', sans-serif",
    fontWeight: 600, fontSize: 15, cursor: "pointer", marginTop: 4,
    boxShadow: "0 1px 2px rgba(10,107,207,0.25)",
  },
  mfaHint: {
    display: "flex", gap: 8, alignItems: "center",
    fontSize: 12, color: "#6B7280", marginTop: 12, lineHeight: 1.4,
  },
  divider: {
    display: "flex", alignItems: "center", gap: 12,
    margin: "24px 0 16px",
  },
  dividerLine: { flex: 1, height: 1, background: "#E1E8F0" },
  dividerText: { fontSize: 12, color: "#6B7280", letterSpacing: ".02em" },
  btnSecondary: {
    height: 48, background: "#FFFFFF", color: "#0E2C56",
    border: "1px solid #E1E8F0", borderRadius: 10, fontFamily: "'Inter', sans-serif",
    fontWeight: 600, fontSize: 14, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
  },
  note: {
    fontSize: 11.5, color: "#9CA3AF", lineHeight: 1.5,
    margin: "28px 0 0", textAlign: "center",
  },
};

const mfa = {
  iconBlock: {
    width: 48, height: 48, borderRadius: 12,
    background: "rgba(10,107,207,0.10)",
    display: "grid", placeItems: "center",
    marginBottom: 18,
  },
  userPill: {
    display: "inline-flex", alignItems: "center", gap: 8,
    background: "#EEF3F8", border: "1px solid #E1E8F0",
    borderRadius: 999, padding: "6px 12px",
    fontSize: 12.5, color: "#0E2C56", fontWeight: 500,
    alignSelf: "flex-start", marginBottom: 22,
  },
  codeRow: {
    display: "grid", gridTemplateColumns: "repeat(6, 56px)",
    gap: 10, marginBottom: 24,
  },
  codeBox: {
    width: 56, height: 56, borderRadius: 12,
    border: "1px solid #E1E8F0", background: "#FFFFFF",
    fontFamily: "'Manrope', sans-serif", fontWeight: 700,
    fontSize: 26, color: "#0E2C56", textAlign: "center",
    outline: "none", transition: "border-color .15s, box-shadow .15s",
    caretColor: "#0A6BCF",
  },
  codeBoxFilled: {
    borderColor: "#0A6BCF",
    boxShadow: "0 0 0 3px rgba(10,107,207,0.12)",
    background: "#F4F8FE",
  },
  timerBlock: { marginTop: 18 },
  timerHead: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    fontSize: 12.5, color: "#6B7280", marginBottom: 8,
  },
  timerTrack: {
    height: 4, borderRadius: 999, background: "#EEF3F8", overflow: "hidden",
  },
  timerFill: { height: "100%", borderRadius: 999, transition: "width 1s linear" },
  divider: { height: 1, background: "#E1E8F0", margin: "28px 0 18px" },
  helpRow: { display: "flex", flexDirection: "column", gap: 10 },
  helpLink: {
    display: "inline-flex", alignItems: "center", gap: 8,
    color: "#0A6BCF", textDecoration: "none", fontSize: 13, fontWeight: 500,
  },
};

const fp = {
  backLink: {
    display: "inline-flex", alignItems: "center", gap: 6,
    color: "#0A6BCF", textDecoration: "none", fontSize: 13, fontWeight: 500,
    alignSelf: "flex-start", marginBottom: 28,
  },
  hint: {
    fontSize: 12, color: "#6B7280", marginTop: 8, lineHeight: 1.4,
  },
  aside: {
    display: "flex", gap: 10, alignItems: "flex-start",
    background: "#F8FBFF", border: "1px solid #E1E8F0",
    borderRadius: 10, padding: "14px 14px",
    fontSize: 12.5, lineHeight: 1.5, marginTop: 20,
  },
  successIcon: {
    width: 56, height: 56, borderRadius: "50%",
    background: "rgba(24,166,106,0.14)",
    display: "grid", placeItems: "center",
    marginBottom: 20,
  },
  checklist: {
    display: "flex", flexDirection: "column", gap: 10,
    background: "#F8FBFF", border: "1px solid #E1E8F0",
    borderRadius: 12, padding: "16px 18px",
    fontSize: 13, color: "#6B7280", lineHeight: 1.5,
    marginBottom: 24,
  },
  checkRow: { display: "flex", gap: 10, alignItems: "flex-start" },
};

const sharedBrand = {
  position: "relative",
  height: "100%",
  width: "100%",
  overflow: "hidden",
  color: "#FFFFFF",
  background: "linear-gradient(160deg, #061B3A 0%, #0E2C56 45%, #0A6BCF 100%)",
  display: "flex",
  flexDirection: "column",
};

const brandA = {
  wrap: { ...sharedBrand, padding: "48px 56px" },
  dotgrid: {
    position: "absolute", inset: 0,
    backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
    backgroundSize: "22px 22px",
    maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
    WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
  },
  halo: {
    position: "absolute", right: -180, top: -120, width: 540, height: 540,
    background: "radial-gradient(circle, rgba(24,193,255,0.32), transparent 65%)",
    pointerEvents: "none",
  },
  topRow: { position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 1 },
  brandLockup: { display: "flex", alignItems: "center", gap: 12 },
  logo: { width: 36, height: 36, objectFit: "contain", filter: "brightness(1.2)" },
  wordmark: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 19, letterSpacing: "-0.01em", color: "#FFFFFF" },
  envBadge: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".12em",
    color: "rgba(255,255,255,0.7)",
    padding: "6px 10px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999,
    display: "flex", alignItems: "center", gap: 8,
  },
  envDot: { width: 6, height: 6, borderRadius: "50%", background: "#18A66A", boxShadow: "0 0 0 3px rgba(24,166,106,0.25)" },
  center: { position: "relative", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 480, zIndex: 1 },
  eyebrow: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: ".16em", color: "rgba(255,255,255,0.55)", marginBottom: 16 },
  headline: {
    fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 56, lineHeight: 1.05,
    letterSpacing: "-0.02em", margin: 0, color: "#FFFFFF",
  },
  tagline: {
    fontSize: 17, lineHeight: 1.55, color: "rgba(255,255,255,0.78)", margin: "20px 0 0", maxWidth: "38ch",
  },
  footer: { position: "relative", display: "flex", flexDirection: "column", gap: 8, zIndex: 1 },
  footerRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "rgba(255,255,255,0.65)" },
};

const brandB = {
  wrap: { ...sharedBrand, padding: "44px 52px" },
  dotgrid: {
    position: "absolute", inset: 0,
    backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
    backgroundSize: "20px 20px",
    maskImage: "radial-gradient(ellipse at top right, black 20%, transparent 70%)",
    WebkitMaskImage: "radial-gradient(ellipse at top right, black 20%, transparent 70%)",
  },
  halo: {
    position: "absolute", right: -140, top: -100, width: 460, height: 460,
    background: "radial-gradient(circle, rgba(24,193,255,0.28), transparent 65%)",
    pointerEvents: "none",
  },
  topRow: { position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 1 },
  brandLockup: { display: "flex", alignItems: "center", gap: 12 },
  logo: { width: 34, height: 34, objectFit: "contain", filter: "brightness(1.2)" },
  wordmark: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: "-0.01em", color: "#FFFFFF" },
  envBadge: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".12em",
    color: "rgba(255,255,255,0.7)",
    padding: "6px 10px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999,
    display: "flex", alignItems: "center", gap: 8,
  },
  envDot: { width: 6, height: 6, borderRadius: "50%", background: "#18A66A", boxShadow: "0 0 0 3px rgba(24,166,106,0.25)" },
  center: { position: "relative", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 1, paddingTop: 24 },
  eyebrow: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: ".16em", color: "rgba(255,255,255,0.55)", marginBottom: 14 },
  headline: {
    fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 44, lineHeight: 1.05,
    letterSpacing: "-0.02em", margin: 0, color: "#FFFFFF",
  },
  tagline: { fontSize: 15, lineHeight: 1.55, color: "rgba(255,255,255,0.72)", margin: "12px 0 32px", maxWidth: "44ch" },

  statRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 32 },
  stat: {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14, padding: "18px 18px 16px",
  },
  statNum: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 36, lineHeight: 1, color: "#FFFFFF", letterSpacing: "-0.02em" },
  statLabel: { fontSize: 12.5, color: "rgba(255,255,255,0.65)", marginTop: 8 },
  statDelta: { display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 10 },
  liveDot: { width: 6, height: 6, borderRadius: "50%", background: "#18A66A", boxShadow: "0 0 0 3px rgba(24,166,106,0.2)" },

  feedTitle: {
    display: "flex", justifyContent: "space-between", alignItems: "baseline",
    fontSize: 12, color: "rgba(255,255,255,0.55)",
    fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".06em", textTransform: "uppercase",
    marginBottom: 10,
  },
  feedTime: { fontSize: 10.5, color: "rgba(255,255,255,0.4)", textTransform: "none", letterSpacing: 0 },
  feed: { display: "flex", flexDirection: "column", gap: 8 },
  feedItem: {
    display: "flex", alignItems: "center", gap: 12,
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
    padding: "12px 14px", borderRadius: 12,
  },
  feedIcon: { width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0 },
  feedItemTitle: { fontSize: 13, color: "#FFFFFF", fontWeight: 500 },
  feedItemMeta: { fontSize: 11.5, color: "rgba(255,255,255,0.5)", marginTop: 2 },

  footer: { position: "relative", display: "flex", flexDirection: "column", gap: 8, zIndex: 1, marginTop: 24 },
  footerRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "rgba(255,255,255,0.65)" },
};

const rs = {
  wrap: {
    background: "#F8FBFF", height: "100%", display: "flex",
    flexDirection: "column", padding: "48px 56px", position: "relative",
  },
  content: { flex: 1, display: "grid", placeItems: "center" },
  footer: {
    display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
    fontSize: 11.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: ".02em",
  },
  dot: { width: 3, height: 3, borderRadius: "50%", background: "#D6DEE8", display: "inline-block" },
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
