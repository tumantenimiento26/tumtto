/* global React, ReactDOM, IOSDevice */
const { useState, useEffect, useRef } = React;

// ============================================================
// ICON helper (lucide)
// ============================================================
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
// SCREEN 1 — SPLASH
// ============================================================
function Splash() {
  return (
    <div style={s.splashWrap}>
      <div style={s.splashHalo} />
      <div style={s.splashHalo2} />

      <div style={s.splashCenter}>
        <img src="assets/logo.png" alt="Tumantenimiento" style={s.splashLogo} />
        <div style={s.splashWord}>Tumantenimiento</div>
        <div style={s.splashTagline}>Servicios de mantenimiento, sin sorpresas.</div>
      </div>

      <div style={s.splashFoot}>
        <div style={s.spinner}>
          <span style={{ ...s.spinnerDot, animationDelay: "0s" }} />
          <span style={{ ...s.spinnerDot, animationDelay: "0.15s" }} />
          <span style={{ ...s.spinnerDot, animationDelay: "0.30s" }} />
        </div>
        <div style={s.splashVersion}>v1.0 · Guadalajara, Jal.</div>
      </div>
    </div>
  );
}

// ============================================================
// SCREENS 2-4 — CAROUSEL
// ============================================================
function Carousel({ slideIdx }) {
  const slides = [
    {
      title: "Técnicos verificados cerca de ti",
      desc: "Cada plomero, electricista o pintor pasa por verificación de identidad, dirección y referencias antes de aceptar tu solicitud.",
      illu: "verified",
    },
    {
      title: "Precio claro antes de aceptar",
      desc: "Recibes la cotización con base, extras y total antes de que empiece el trabajo. Sin sorpresas al final del día.",
      illu: "quote",
    },
    {
      title: "Paga como prefieras",
      desc: "Tarjeta, OXXO Pay, Mercado Pago o efectivo. Tu dinero solo se libera al técnico cuando tú confirmas que terminó bien.",
      illu: "payments",
    },
  ];
  const slide = slides[slideIdx];

  return (
    <div style={s.cWrap}>
      {/* Top: skip */}
      <div style={s.cTop}>
        <span style={s.cBrandWord}><b style={{ color: "#0A6BCF", fontWeight: 700 }}>Tu</b>mantenimiento</span>
        <button style={s.cSkip}>Saltar</button>
      </div>

      {/* Illustration */}
      <div style={s.cIlluWrap}>
        {slide.illu === "verified" && <IlluVerified />}
        {slide.illu === "quote"    && <IlluQuote />}
        {slide.illu === "payments" && <IlluPayments />}
      </div>

      {/* Text */}
      <div style={s.cTextBlock}>
        <h1 style={s.cTitle}>{slide.title}</h1>
        <p style={s.cDesc}>{slide.desc}</p>
      </div>

      {/* Footer: dots + button */}
      <div style={s.cFoot}>
        <div style={s.cDots}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ ...s.cDot, ...(i === slideIdx ? s.cDotActive : null) }} />
          ))}
        </div>
        <button style={s.cBtn}>
          {slideIdx === 2 ? "Empezar" : "Siguiente"}
          <Ic name={slideIdx === 2 ? "check" : "arrow-right"} size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </button>
      </div>
    </div>
  );
}

// Flat-style illustrations using SVG primitives + lucide composition
function IlluVerified() {
  return (
    <svg viewBox="0 0 320 240" width="100%" height="100%" style={{ maxWidth: 320, maxHeight: 240 }}>
      {/* Background blob */}
      <ellipse cx="160" cy="120" rx="140" ry="100" fill="#E0F6FF" />
      <ellipse cx="160" cy="200" rx="100" ry="14" fill="rgba(10,107,207,0.08)" />

      {/* Map ring */}
      <circle cx="160" cy="120" r="84" fill="none" stroke="#0A6BCF" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />

      {/* Pin */}
      <g transform="translate(160, 84)">
        <path d="M0,-36 a18,22 0 1 1 0.01,0 Z M0,0 L-6,-18 L6,-18 Z" fill="#0A6BCF" />
        <circle cx="0" cy="-22" r="8" fill="#FFFFFF" />
      </g>

      {/* Technician avatar 1 */}
      <g transform="translate(100, 140)">
        <circle r="28" fill="#FFFFFF" stroke="#0A6BCF" strokeWidth="2" />
        <circle r="22" fill="#0A6BCF" />
        <circle cy="-6" r="7" fill="#FFFFFF" />
        <path d="M -10,12 a 10,8 0 0 1 20,0 Z" fill="#FFFFFF" />
        <g transform="translate(18, 18)">
          <circle r="11" fill="#18A66A" stroke="#FFFFFF" strokeWidth="2.5" />
          <path d="M -5,0 L -1,4 L 5,-3" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>

      {/* Technician avatar 2 */}
      <g transform="translate(220, 150)">
        <circle r="24" fill="#FFFFFF" stroke="#18C1FF" strokeWidth="2" />
        <circle r="19" fill="#18C1FF" />
        <circle cy="-5" r="6" fill="#FFFFFF" />
        <path d="M -8,10 a 8,7 0 0 1 16,0 Z" fill="#FFFFFF" />
      </g>

      {/* Technician avatar 3 */}
      <g transform="translate(70, 80)">
        <circle r="20" fill="#FFFFFF" stroke="#0E2C56" strokeWidth="2" />
        <circle r="16" fill="#0E2C56" />
        <circle cy="-4" r="5" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

function IlluQuote() {
  return (
    <svg viewBox="0 0 320 240" width="100%" height="100%" style={{ maxWidth: 320, maxHeight: 240 }}>
      <ellipse cx="160" cy="210" rx="120" ry="12" fill="rgba(10,107,207,0.08)" />
      <rect x="60" y="40" width="200" height="160" rx="14" fill="#F8FBFF" stroke="#0A6BCF" strokeWidth="2" />

      {/* Receipt content */}
      <text x="80" y="68" fontFamily="Manrope" fontSize="14" fontWeight="700" fill="#0E2C56">Cotización</text>
      <rect x="80" y="78" width="60" height="3" rx="1.5" fill="#0A6BCF" />

      <line x1="80" y1="100" x2="220" y2="100" stroke="#E1E8F0" strokeWidth="1" />

      <text x="80" y="120" fontFamily="Inter" fontSize="11" fill="#6B7280">Tarifa base</text>
      <text x="240" y="120" textAnchor="end" fontFamily="JetBrains Mono" fontSize="12" fontWeight="600" fill="#0E2C56">$850</text>

      <text x="80" y="140" fontFamily="Inter" fontSize="11" fill="#6B7280">+ Sellado</text>
      <text x="240" y="140" textAnchor="end" fontFamily="JetBrains Mono" fontSize="11" fill="#6B7280">$150</text>

      <text x="80" y="158" fontFamily="Inter" fontSize="11" fill="#6B7280">+ Llave de paso</text>
      <text x="240" y="158" textAnchor="end" fontFamily="JetBrains Mono" fontSize="11" fill="#6B7280">$250</text>

      <line x1="80" y1="170" x2="240" y2="170" stroke="#E1E8F0" strokeWidth="1" />

      <text x="80" y="188" fontFamily="Inter" fontSize="11" fontWeight="600" fill="#0E2C56">Total MXN</text>
      <text x="240" y="188" textAnchor="end" fontFamily="Manrope" fontSize="16" fontWeight="700" fill="#0A6BCF">$1,250</text>

      {/* Floating check badge */}
      <g transform="translate(244, 60)">
        <circle r="22" fill="#18A66A" stroke="#FFFFFF" strokeWidth="3" />
        <path d="M -8,0 L -2,6 L 9,-6" stroke="#FFFFFF" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Floating $ */}
      <g transform="translate(58, 80)">
        <circle r="20" fill="#18C1FF" stroke="#FFFFFF" strokeWidth="3" />
        <text y="6" textAnchor="middle" fontFamily="Manrope" fontWeight="700" fontSize="22" fill="#FFFFFF">$</text>
      </g>
    </svg>
  );
}

function IlluPayments() {
  return (
    <svg viewBox="0 0 320 240" width="100%" height="100%" style={{ maxWidth: 320, maxHeight: 240 }}>
      <ellipse cx="160" cy="210" rx="120" ry="12" fill="rgba(10,107,207,0.08)" />

      {/* Card 1 (back) */}
      <g transform="translate(70, 90) rotate(-8)">
        <rect width="140" height="84" rx="10" fill="#0A6BCF" />
        <rect x="14" y="20" width="32" height="22" rx="3" fill="#FFD580" />
        <rect x="14" y="56" width="80" height="6" rx="1" fill="rgba(255,255,255,0.7)" />
        <rect x="14" y="68" width="50" height="4" rx="1" fill="rgba(255,255,255,0.5)" />
        <circle cx="120" cy="62" r="10" fill="rgba(255,255,255,0.85)" />
        <circle cx="112" cy="62" r="10" fill="rgba(255,255,255,0.55)" />
      </g>

      {/* Card 2 (front) */}
      <g transform="translate(120, 100) rotate(4)">
        <rect width="140" height="84" rx="10" fill="#0E2C56" />
        <rect x="14" y="20" width="32" height="22" rx="3" fill="#18C1FF" />
        <rect x="14" y="56" width="80" height="6" rx="1" fill="rgba(255,255,255,0.7)" />
        <rect x="14" y="68" width="50" height="4" rx="1" fill="rgba(255,255,255,0.5)" />
        <circle cx="120" cy="62" r="10" fill="rgba(255,255,255,0.85)" />
        <circle cx="112" cy="62" r="10" fill="rgba(255,255,255,0.55)" />
      </g>

      {/* OXXO badge */}
      <g transform="translate(54, 50)">
        <circle r="22" fill="#FFFFFF" stroke="#E1E8F0" strokeWidth="1.5" />
        <rect x="-12" y="-8" width="24" height="16" rx="2" fill="#B45309" />
        <text y="3" textAnchor="middle" fontFamily="Inter" fontWeight="700" fontSize="8" fill="#FFFFFF">OXXO</text>
      </g>

      {/* Cash bill */}
      <g transform="translate(264, 60)">
        <circle r="22" fill="#FFFFFF" stroke="#E1E8F0" strokeWidth="1.5" />
        <rect x="-14" y="-9" width="28" height="18" rx="2" fill="#18A66A" />
        <text y="3" textAnchor="middle" fontFamily="Manrope" fontWeight="700" fontSize="12" fill="#FFFFFF">$</text>
      </g>

      {/* MP wallet */}
      <g transform="translate(58, 200)">
        <circle r="22" fill="#FFFFFF" stroke="#E1E8F0" strokeWidth="1.5" />
        <circle r="14" fill="#18C1FF" />
        <text y="3" textAnchor="middle" fontFamily="Inter" fontWeight="700" fontSize="9" fill="#FFFFFF">MP</text>
      </g>

      {/* Sparkles */}
      <g fill="#F59E0B">
        <circle cx="220" cy="180" r="2.5" />
        <circle cx="100" cy="55" r="2" />
        <circle cx="270" cy="170" r="2" />
      </g>
    </svg>
  );
}

// ============================================================
// SCREEN 5 — ROLE SELECTOR
// ============================================================
function RoleSelector() {
  return (
    <div style={s.rWrap}>
      <div style={s.rHeader}>
        <img src="assets/logo.png" alt="Tumantenimiento" style={s.rLogo} />
        <span style={s.rWordmark}><b style={{ color: "#0A6BCF", fontWeight: 700 }}>Tu</b>mantenimiento</span>
      </div>

      <div style={s.rBody}>
        <h1 style={s.rTitle}>¿Cómo quieres usar Tumantenimiento?</h1>
        <p style={s.rSub}>Elige para personalizar tu experiencia. Puedes cambiar después.</p>

        <div style={s.rCardClient}>
          <div style={s.rIconClient}><Ic name="home" size={26} color="#0A6BCF" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={s.rCardTitle}>Soy Cliente</div>
            <div style={s.rCardDesc}>Solicito servicios de mantenimiento para mi hogar o negocio.</div>
          </div>
          <div style={s.rArrowClient}>
            <Ic name="arrow-right" size={20} color="#FFFFFF" />
          </div>
        </div>

        <div style={s.rCardTech}>
          <div style={s.rIconTech}><Ic name="hard-hat" size={26} color="#0E2C56" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={s.rCardTitle}>Soy Técnico</div>
            <div style={s.rCardDesc}>Ofrezco mis servicios profesionales y construyo mi cartera.</div>
          </div>
          <div style={s.rArrowTech}>
            <Ic name="arrow-right" size={20} color="#6B7280" />
          </div>
        </div>

        <div style={s.rTrustRow}>
          <Ic name="shield-check" size={14} color="#18A66A" />
          <span>Operando en la ZMG · Guadalajara, Zapopan, Tlaquepaque y más</span>
        </div>
      </div>

      <div style={s.rFooter}>
        <a href="#" style={s.rTeamLink}>
          <Ic name="building-2" size={12} color="#6B7280" style={{ marginRight: 6 }} />
          Soy parte del equipo Tumantenimiento
        </a>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN 6 — PHONE REGISTRATION
// ============================================================
function PhoneRegistration() {
  return (
    <div style={s.pWrap}>
      <div style={s.pHeader}>
        <button style={s.pBackBtn}><Ic name="arrow-left" size={20} color="#0E2C56" /></button>
        <span style={s.pStepIndicator}>Paso 1 de 3</span>
      </div>

      <div style={s.pBody}>
        <h1 style={s.pTitle}>Crea tu cuenta</h1>
        <p style={s.pSub}>Te enviaremos un código SMS para verificar tu número de celular.</p>

        <div style={s.pInputGroup}>
          <label style={s.pLabel}>Número celular</label>
          <div style={s.pPhoneRow}>
            <div style={s.pCountryChip}>
              <span style={{ fontSize: 22 }}>🇲🇽</span>
              <span style={{ fontSize: 15, color: "#0E2C56", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>+52</span>
            </div>
            <div style={s.pPhoneInputWrap}>
              <input
                type="tel"
                style={s.pPhoneInput}
                defaultValue="33 1234 5678"
                readOnly
              />
              <span style={s.pCaret} />
            </div>
          </div>
          <div style={s.pHint}>
            <Ic name="info" size={12} color="#6B7280" />
            <span>Solo lo usamos para enviarte códigos y notificaciones de tus servicios.</span>
          </div>
        </div>

        <button style={s.pPrimaryBtn}>
          Enviar código
          <Ic name="arrow-right" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </button>

        <div style={s.pDivider}>
          <span style={s.pDividerLine} />
          <span style={s.pDividerText}>o continúa con</span>
          <span style={s.pDividerLine} />
        </div>

        <button style={s.pAltBtn}>
          <Ic name="mail" size={18} color="#0A6BCF" style={{ marginRight: 10 }} />
          Correo electrónico
        </button>

        <p style={s.pLegal}>
          Al continuar, aceptas los <a href="#" style={s.pLegalLink}>Términos de Uso</a> y la <a href="#" style={s.pLegalLink}>Política de Privacidad</a> de Tumantenimiento.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN 7 — OTP
// ============================================================
function OtpScreen() {
  const code = ["4", "8", "2", "", "", ""];
  return (
    <div style={s.oWrap}>
      <div style={s.pHeader}>
        <button style={s.pBackBtn}><Ic name="arrow-left" size={20} color="#0E2C56" /></button>
        <span style={s.pStepIndicator}>Paso 2 de 3</span>
      </div>

      <div style={s.oBody}>
        <div style={s.oIconCircle}>
          <Ic name="message-square-text" size={28} color="#0A6BCF" />
        </div>

        <h1 style={s.pTitle}>Ingresa el código de 6 dígitos</h1>
        <p style={s.oSub}>
          Lo enviamos a <b style={{ color: "#0E2C56", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>+52 33 1234 5678</b>
        </p>
        <a href="#" style={s.oChangeLink}>
          <Ic name="pencil" size={11} color="#0A6BCF" style={{ marginRight: 5 }} />
          Cambiar número
        </a>

        <div style={s.oCodeRow}>
          {code.map((d, i) => (
            <div key={i} style={{ ...s.oCodeBox, ...(d ? s.oCodeBoxFilled : null), ...(i === 3 ? s.oCodeBoxActive : null) }}>
              {d}
              {i === 3 && <span style={s.oCaret} />}
            </div>
          ))}
        </div>

        <div style={s.oResendRow}>
          <Ic name="timer" size={13} color="#6B7280" />
          <span style={{ fontSize: 13, color: "#6B7280" }}>Reenviar código en</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#0A6BCF", fontWeight: 600 }}>0:45</span>
        </div>

        <button style={{ ...s.pPrimaryBtn, ...s.pPrimaryBtnDisabled }}>
          Verificar
        </button>

        <div style={s.oAutoFill}>
          <Ic name="sparkles" size={12} color="#0884B0" />
          <span style={{ fontSize: 11.5, color: "#6B7280" }}>
            <b style={{ color: "#0E2C56", fontWeight: 600 }}>Auto-completado disponible.</b> Permite el llenado desde SMS para hacerlo más rápido.
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN COMPOSITION
// ============================================================
function PhoneFrame({ children, dark = false }) {
  return (
    <div style={{ padding: 24, background: "transparent" }}>
      <IOSDevice width={390} height={844} dark={dark}>
        <div style={{ width: 390, height: 844, position: "relative" }}>
          {children}
        </div>
      </IOSDevice>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="onboarding" title="Onboarding · Cliente" subtitle="Splash · Carousel · Rol · Teléfono · OTP">
        <DCArtboard id="splash" label="01 · Splash" width={438} height={892}>
          <PhoneFrame dark><Splash /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="carousel-1" label="02 · Carousel · Técnicos verificados" width={438} height={892}>
          <PhoneFrame><Carousel slideIdx={0} /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="carousel-2" label="03 · Carousel · Precio claro" width={438} height={892}>
          <PhoneFrame><Carousel slideIdx={1} /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="carousel-3" label="04 · Carousel · Paga como prefieras" width={438} height={892}>
          <PhoneFrame><Carousel slideIdx={2} /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="role" label="05 · Selector de rol" width={438} height={892}>
          <PhoneFrame><RoleSelector /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="phone" label="06 · Registro por teléfono" width={438} height={892}>
          <PhoneFrame><PhoneRegistration /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="otp" label="07 · Ingreso de código OTP" width={438} height={892}>
          <PhoneFrame><OtpScreen /></PhoneFrame>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// ============================================================
// STYLES
// ============================================================
const s = {
  // SPLASH
  splashWrap: {
    width: "100%", height: "100%",
    background: "linear-gradient(160deg, #061B3A 0%, #0E2C56 40%, #0A6BCF 100%)",
    color: "#FFFFFF",
    position: "relative", overflow: "hidden",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between",
    padding: "120px 24px 60px",
  },
  splashHalo: {
    position: "absolute", right: -120, top: -80, width: 380, height: 380,
    background: "radial-gradient(circle, rgba(24,193,255,0.35), transparent 65%)", pointerEvents: "none",
  },
  splashHalo2: {
    position: "absolute", left: -100, bottom: 80, width: 320, height: 320,
    background: "radial-gradient(circle, rgba(10,107,207,0.4), transparent 65%)", pointerEvents: "none",
  },
  splashCenter: {
    position: "relative", display: "flex", flexDirection: "column", alignItems: "center",
    paddingTop: 80,
  },
  splashLogo: { width: 120, height: 120, objectFit: "contain", filter: "brightness(1.15)" },
  splashWord: {
    fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: "-0.02em",
    marginTop: 22, color: "#FFFFFF",
  },
  splashTagline: {
    fontFamily: "'Manrope', sans-serif", fontWeight: 500, fontSize: 17,
    color: "rgba(255,255,255,0.78)", marginTop: 14, textAlign: "center", maxWidth: 260, lineHeight: 1.4,
  },
  splashFoot: {
    position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
  },
  spinner: { display: "flex", gap: 6 },
  spinnerDot: {
    width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.85)",
    animation: "onb-bounce 1s infinite",
  },
  splashVersion: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
    color: "rgba(255,255,255,0.45)", letterSpacing: ".06em",
  },

  // CAROUSEL
  cWrap: { width: "100%", height: "100%", background: "#FFFFFF", display: "flex", flexDirection: "column", padding: "70px 24px 40px" },
  cTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  cBrandWord: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 16, color: "#0E2C56", letterSpacing: "-0.01em" },
  cSkip: { background: "transparent", border: "none", color: "#6B7280", fontSize: 15, fontWeight: 500, cursor: "pointer" },
  cIlluWrap: { display: "flex", justifyContent: "center", alignItems: "center", padding: "30px 0 20px", flex: "0 0 auto" },
  cTextBlock: { flex: 1, padding: "8px 4px" },
  cTitle: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 26, lineHeight: 1.2, letterSpacing: "-0.02em", color: "#0E2C56", margin: 0 },
  cDesc: { fontSize: 15.5, lineHeight: 1.55, color: "#6B7280", margin: "14px 0 0" },
  cFoot: { display: "flex", flexDirection: "column", gap: 22, paddingBottom: 24 },
  cDots: { display: "flex", justifyContent: "center", gap: 8 },
  cDot: { width: 8, height: 8, borderRadius: "50%", background: "#E1E8F0" },
  cDotActive: { background: "#0A6BCF", width: 28, borderRadius: 999, transition: "width .2s" },
  cBtn: {
    height: 56, background: "#0A6BCF", color: "#FFFFFF",
    border: "none", borderRadius: 14,
    fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 16,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 6px 14px rgba(10,107,207,0.28)",
  },

  // ROLE
  rWrap: { width: "100%", height: "100%", background: "#F8FBFF", display: "flex", flexDirection: "column", padding: "60px 22px 40px" },
  rHeader: { display: "flex", alignItems: "center", gap: 10 },
  rLogo: { width: 32, height: 32, objectFit: "contain" },
  rWordmark: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 18, color: "#0E2C56" },
  rBody: { flex: 1, paddingTop: 36 },
  rTitle: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 26, lineHeight: 1.2, letterSpacing: "-0.02em", color: "#0E2C56", margin: "0 0 8px" },
  rSub: { fontSize: 14, color: "#6B7280", margin: "0 0 28px", lineHeight: 1.5 },
  rCardClient: {
    background: "linear-gradient(160deg, rgba(10,107,207,0.08), rgba(24,193,255,0.10))",
    border: "1.5px solid #0A6BCF",
    borderRadius: 18, padding: 20,
    display: "flex", alignItems: "center", gap: 16, marginBottom: 14,
    boxShadow: "0 4px 14px rgba(10,107,207,0.10)",
  },
  rCardTech: {
    background: "#FFFFFF",
    border: "1px solid #E1E8F0",
    borderRadius: 18, padding: 20,
    display: "flex", alignItems: "center", gap: 16,
  },
  rIconClient: { width: 56, height: 56, borderRadius: 14, background: "#FFFFFF", display: "grid", placeItems: "center", boxShadow: "0 1px 3px rgba(10,107,207,0.12)", flexShrink: 0 },
  rIconTech:   { width: 56, height: 56, borderRadius: 14, background: "#EEF3F8", display: "grid", placeItems: "center", flexShrink: 0 },
  rCardTitle: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 18, color: "#0E2C56", letterSpacing: "-0.01em", marginBottom: 4 },
  rCardDesc: { fontSize: 12.5, color: "#6B7280", lineHeight: 1.45 },
  rArrowClient: { width: 36, height: 36, borderRadius: "50%", background: "#0A6BCF", display: "grid", placeItems: "center", flexShrink: 0 },
  rArrowTech:   { width: 36, height: 36, borderRadius: "50%", background: "#EEF3F8", display: "grid", placeItems: "center", flexShrink: 0 },
  rTrustRow: {
    display: "flex", alignItems: "center", gap: 8, marginTop: 36,
    padding: "12px 14px", background: "#FFFFFF", border: "1px solid #E5F7EE", borderRadius: 12,
    fontSize: 12, color: "#6B7280",
  },
  rFooter: { padding: "12px 0 0", textAlign: "center" },
  rTeamLink: {
    display: "inline-flex", alignItems: "center", color: "#6B7280", textDecoration: "none",
    fontSize: 13, fontWeight: 500, padding: "10px 16px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 999,
  },

  // PHONE REG
  pWrap: { width: "100%", height: "100%", background: "#FFFFFF", display: "flex", flexDirection: "column", padding: "60px 24px 30px" },
  pHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  pBackBtn: { width: 40, height: 40, borderRadius: 12, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer" },
  pStepIndicator: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#6B7280",
    background: "#F8FBFF", padding: "4px 10px", borderRadius: 999, border: "1px solid #E1E8F0", letterSpacing: ".04em",
  },
  pBody: { flex: 1, paddingTop: 28 },
  pTitle: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 28, lineHeight: 1.15, letterSpacing: "-0.02em", color: "#0E2C56", margin: "0 0 10px" },
  pSub: { fontSize: 15, color: "#6B7280", margin: "0 0 28px", lineHeight: 1.5 },
  pInputGroup: { marginBottom: 22 },
  pLabel: { fontSize: 13, fontWeight: 500, color: "#0E2C56", marginBottom: 8, display: "block" },
  pPhoneRow: { display: "flex", gap: 10, alignItems: "stretch" },
  pCountryChip: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "0 14px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 12,
    height: 56, flexShrink: 0,
  },
  pPhoneInputWrap: {
    flex: 1, position: "relative", display: "flex", alignItems: "center",
    background: "#FFFFFF", border: "1.5px solid #0A6BCF", borderRadius: 12, height: 56,
    boxShadow: "0 0 0 3px rgba(10,107,207,0.12)",
  },
  pPhoneInput: {
    flex: 1, border: "none", outline: "none", background: "transparent",
    padding: "0 14px", fontFamily: "'JetBrains Mono', monospace",
    fontSize: 18, color: "#0E2C56", fontWeight: 600, letterSpacing: ".05em",
  },
  pCaret: {
    position: "absolute", right: 16, width: 2, height: 22, background: "#0A6BCF",
    animation: "onb-caret 1s infinite",
  },
  pHint: { display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 11.5, color: "#6B7280", lineHeight: 1.4 },
  pPrimaryBtn: {
    width: "100%", height: 56, background: "#0A6BCF", color: "#FFFFFF",
    border: "none", borderRadius: 14,
    fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 16,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 6px 14px rgba(10,107,207,0.28)",
    marginBottom: 18,
  },
  pPrimaryBtnDisabled: { background: "#DCE6F1", color: "#9CA3AF", boxShadow: "none", cursor: "not-allowed" },
  pDivider: { display: "flex", alignItems: "center", gap: 14, margin: "8px 0 18px" },
  pDividerLine: { flex: 1, height: 1, background: "#E1E8F0" },
  pDividerText: { fontSize: 12, color: "#9CA3AF" },
  pAltBtn: {
    width: "100%", height: 52, background: "#FFFFFF", color: "#0A6BCF",
    border: "1.5px solid #E1E8F0", borderRadius: 14,
    fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 15,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  },
  pLegal: { fontSize: 11.5, color: "#9CA3AF", lineHeight: 1.5, textAlign: "center", margin: "32px 0 0" },
  pLegalLink: { color: "#0A6BCF", textDecoration: "none", fontWeight: 500 },

  // OTP
  oWrap: { width: "100%", height: "100%", background: "#FFFFFF", display: "flex", flexDirection: "column", padding: "60px 24px 30px" },
  oBody: { flex: 1, paddingTop: 28, display: "flex", flexDirection: "column" },
  oIconCircle: {
    width: 64, height: 64, borderRadius: 18, background: "rgba(10,107,207,0.10)",
    display: "grid", placeItems: "center", marginBottom: 22,
  },
  oSub: { fontSize: 15, color: "#6B7280", margin: "0 0 6px", lineHeight: 1.5 },
  oChangeLink: { display: "inline-flex", alignItems: "center", color: "#0A6BCF", textDecoration: "none", fontSize: 13, fontWeight: 500, alignSelf: "flex-start" },
  oCodeRow: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginTop: 28, marginBottom: 22 },
  oCodeBox: {
    height: 60, borderRadius: 12,
    border: "1.5px solid #E1E8F0", background: "#FFFFFF",
    display: "grid", placeItems: "center", position: "relative",
    fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 28,
    color: "#0E2C56",
  },
  oCodeBoxFilled: {
    background: "#F4F8FE", borderColor: "#0A6BCF",
    boxShadow: "0 0 0 3px rgba(10,107,207,0.12)",
  },
  oCodeBoxActive: {
    borderColor: "#0A6BCF",
    boxShadow: "0 0 0 3px rgba(10,107,207,0.20)",
  },
  oCaret: {
    width: 2, height: 28, background: "#0A6BCF", borderRadius: 1,
    animation: "onb-caret 1s infinite",
  },
  oResendRow: { display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginBottom: 22 },
  oAutoFill: {
    display: "flex", alignItems: "center", gap: 8, padding: "12px 14px",
    background: "#E0F6FF", border: "1px solid rgba(24,193,255,0.4)", borderRadius: 12,
    marginTop: "auto",
  },
};

// Inject keyframes
const kf = document.createElement("style");
kf.textContent = `
  @keyframes onb-bounce { 0%, 100% { opacity: 0.4; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-4px); } }
  @keyframes onb-caret  { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
`;
document.head.appendChild(kf);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
