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
// SCREEN 01 — WELCOME (Tech)
// =====================================================================
function Welcome() {
  return (
    <div style={o.welcomeWrap}>
      {/* Gradient + texture */}
      <div style={o.welcomeBg}>
        <div style={o.welcomeGlow1} />
        <div style={o.welcomeGlow2} />
        <div style={o.welcomeGrain} />
      </div>

      {/* Status row */}
      <div style={o.welcomeTopRow}>
        <div style={o.welcomeLogo}>
          <span style={o.welcomeLogoTu}>Tu</span>
          <span style={o.welcomeLogoMant}>mantenimiento</span>
        </div>
        <div style={o.welcomeRoleChip}>
          <Ic name="hard-hat" size={11} color="#FFFFFF" />
          <span>Pro</span>
        </div>
      </div>

      <div style={o.welcomeIlluWrap}>
        <TechIllu />
      </div>

      <div style={o.welcomeContent}>
        <div style={o.welcomeEyebrow}>VERSIÓN TÉCNICO</div>
        <div style={o.welcomeTitle}>Bienvenido, profesional</div>
        <div style={o.welcomeSub}>
          Construye tu cartera de clientes en línea y haz crecer tu negocio.
        </div>

        <div style={o.benefitList}>
          {[
            { icon: "map-pin",     text: "Recibe clientes cerca de tu zona",      sub: "Sin perseguir trabajos" },
            { icon: "calendar",    text: "Tu agenda, bajo tu control",            sub: "Tú decides cuándo trabajar" },
            { icon: "wallet",      text: "Cobra digital o en efectivo",           sub: "Depósito directo en 24-48 h" },
            { icon: "badge-check", text: "Construye tu reputación verificada",    sub: "Reseñas reales de clientes" },
          ].map((b, i) => (
            <div key={i} style={o.benefitRow}>
              <div style={o.benefitCheck}>
                <Ic name="check" size={11} color="#18A66A" stroke={3.5} />
              </div>
              <div style={o.benefitIcon}>
                <Ic name={b.icon} size={14} color="#18C1FF" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={o.benefitText}>{b.text}</div>
                <div style={o.benefitSub}>{b.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={o.welcomeFooter}>
        <button style={o.welcomeCta}>
          <span>Empezar registro</span>
          <Ic name="arrow-right" size={16} color="#0A6BCF" stroke={2.6} style={{ marginLeft: 8 }} />
        </button>
        <div style={o.welcomeLogin}>
          ¿Ya tienes cuenta?{" "}
          <a href="#" style={o.welcomeLoginLink}>Iniciar sesión</a>
        </div>
      </div>
    </div>
  );
}

function TechIllu() {
  return (
    <svg viewBox="0 0 320 220" width="280" height="195" style={{ display: "block", margin: "0 auto" }}>
      <defs>
        <linearGradient id="techBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0894EA" />
          <stop offset="1" stopColor="#0A6BCF" />
        </linearGradient>
        <linearGradient id="techHelmet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FBBF24" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="techSkin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D4A574" />
          <stop offset="1" stopColor="#A87850" />
        </linearGradient>
      </defs>

      {/* Floor shadow */}
      <ellipse cx="160" cy="206" rx="100" ry="6" fill="rgba(0,0,0,0.18)" />

      {/* Tools floating around */}
      <g opacity="0.85">
        <rect x="28" y="40" width="6" height="40" rx="2" fill="#FBBF24" transform="rotate(-22 31 60)" />
        <circle cx="36" cy="42" r="9" fill="none" stroke="#FBBF24" strokeWidth="3" />
        <rect x="270" y="60" width="6" height="34" rx="2" fill="#18C1FF" transform="rotate(20 273 77)" />
        <rect x="262" y="56" width="22" height="14" rx="3" fill="#18C1FF" transform="rotate(20 273 63)" />
        <circle cx="50" cy="170" r="4" fill="#18C1FF" />
        <circle cx="276" cy="160" r="4" fill="#FBBF24" />
        <circle cx="14" cy="120" r="3" fill="#18C1FF" />
      </g>

      {/* Body torso */}
      <path d="M 100 130 Q 100 110 130 110 L 190 110 Q 220 110 220 130 L 220 200 L 100 200 Z" fill="url(#techBody)" />
      {/* Belt */}
      <rect x="100" y="170" width="120" height="10" fill="#0E2C56" />
      <rect x="155" y="168" width="10" height="14" rx="1.5" fill="#FBBF24" />
      {/* Tool belt pockets */}
      <rect x="108" y="180" width="22" height="18" rx="3" fill="#0E2C56" stroke="rgba(255,255,255,0.20)" strokeWidth="0.8" />
      <rect x="190" y="180" width="22" height="18" rx="3" fill="#0E2C56" stroke="rgba(255,255,255,0.20)" strokeWidth="0.8" />
      {/* Wrench in pocket */}
      <path d="M 195 178 L 198 196 L 201 196 L 202 178 Z" fill="#94A3B8" />
      <circle cx="198" cy="176" r="3" fill="#94A3B8" />

      {/* Shirt highlight */}
      <path d="M 130 115 Q 160 110 190 115 L 188 130 Q 160 126 132 130 Z" fill="rgba(255,255,255,0.20)" />
      {/* Pocket */}
      <rect x="142" y="138" width="36" height="22" rx="2" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
      {/* Logo on chest */}
      <text x="160" y="153" textAnchor="middle" fontFamily="Manrope, sans-serif" fontWeight="800" fontSize="9" fill="rgba(255,255,255,0.85)">PRO</text>

      {/* Arms */}
      <path d="M 100 130 Q 80 138 78 162 L 88 168 Q 96 152 105 145 Z" fill="url(#techBody)" />
      <path d="M 220 130 Q 240 138 242 162 L 232 168 Q 224 152 215 145 Z" fill="url(#techBody)" />

      {/* Right hand holding clipboard */}
      <g>
        <rect x="222" y="146" width="36" height="48" rx="4" fill="#FFFFFF" stroke="#E1E8F0" strokeWidth="1" />
        <rect x="232" y="142" width="16" height="6" rx="1.5" fill="#0E2C56" />
        <rect x="226" y="154" width="28" height="2" rx="1" fill="#0A6BCF" />
        <rect x="226" y="160" width="22" height="2" rx="1" fill="#9CA3AF" opacity="0.5" />
        <rect x="226" y="166" width="26" height="2" rx="1" fill="#9CA3AF" opacity="0.5" />
        <circle cx="232" cy="180" r="3.5" fill="#18A66A" />
        <path d="M 230.5 180 L 232 181.5 L 234 178" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
      {/* Hand */}
      <circle cx="238" cy="158" r="7" fill="url(#techSkin)" />

      {/* Left hand holding wrench */}
      <circle cx="82" cy="160" r="7" fill="url(#techSkin)" />
      <rect x="62" y="158" width="26" height="5" rx="2" fill="#94A3B8" transform="rotate(20 75 160)" />
      <rect x="50" y="148" width="10" height="14" rx="2" fill="#94A3B8" transform="rotate(20 55 155)" />

      {/* Neck */}
      <rect x="148" y="98" width="24" height="16" fill="url(#techSkin)" />

      {/* Head */}
      <ellipse cx="160" cy="86" rx="30" ry="32" fill="url(#techSkin)" />
      {/* Ear */}
      <ellipse cx="132" cy="86" rx="4" ry="6" fill="url(#techSkin)" />
      <ellipse cx="188" cy="86" rx="4" ry="6" fill="url(#techSkin)" />
      {/* Smile */}
      <path d="M 152 96 Q 160 102 168 96" stroke="#5B3A1F" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Eyes */}
      <circle cx="150" cy="83" r="2.4" fill="#0E2C56" />
      <circle cx="170" cy="83" r="2.4" fill="#0E2C56" />
      {/* Brow */}
      <path d="M 144 76 L 154 74" stroke="#5B3A1F" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M 166 74 L 176 76" stroke="#5B3A1F" strokeWidth="1.6" strokeLinecap="round" />
      {/* Moustache */}
      <path d="M 150 92 Q 160 94 170 92" stroke="#5B3A1F" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Helmet */}
      <path d="M 124 70 Q 124 46 160 46 Q 196 46 196 70 L 200 76 L 120 76 Z" fill="url(#techHelmet)" />
      <rect x="120" y="74" width="80" height="6" rx="2" fill="#D97706" />
      {/* Helmet ridges */}
      <path d="M 160 50 L 160 70" stroke="#D97706" strokeWidth="1.5" />
      <path d="M 142 54 Q 144 60 146 70" stroke="#D97706" strokeWidth="1.2" fill="none" />
      <path d="M 178 54 Q 176 60 174 70" stroke="#D97706" strokeWidth="1.2" fill="none" />

      {/* Verified badge */}
      <g transform="translate(206, 110)">
        <circle r="13" fill="#18A66A" stroke="#FFFFFF" strokeWidth="2.5" />
        <path d="M -5 0 L -1 4 L 5 -3" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

// =====================================================================
// SCREEN 02 — PHONE (Tech context)
// =====================================================================
function PhoneScreen() {
  return (
    <div style={o.wrap}>
      <StepHeader stepLabel="Crea tu cuenta" />

      <div style={o.body}>
        <div style={o.titleBlock}>
          <div style={o.bigTitle}>¿Cuál es tu celular?</div>
          <div style={o.bigSub}>
            Te enviaremos un código para verificar que eres tú. Esta cuenta es para ti como <b style={{ color: "#0E2C56", fontWeight: 700 }}>técnico independiente</b>.
          </div>
        </div>

        <div style={o.field}>
          <label style={o.fieldLabel}>Número de celular</label>
          <div style={o.phoneInputRow}>
            <div style={o.phoneFlag}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>🇲🇽</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: "#0E2C56" }}>+52</span>
              <Ic name="chevron-down" size={13} color="#9CA3AF" />
            </div>
            <div style={o.phoneNum}>
              <span style={{ flex: 1, color: "#0E2C56", fontSize: 17, fontWeight: 600, letterSpacing: "0.04em" }}>
                33 1234 5678
              </span>
              <span style={o.cursor} />
            </div>
          </div>
          <div style={o.fieldHint}>
            <Ic name="info" size={11} color="#9CA3AF" />
            <span>Será visible para los clientes una vez que acepten tu servicio.</span>
          </div>
        </div>

        {/* Pro context card */}
        <div style={o.proContextCard}>
          <div style={o.proContextIcon}>
            <Ic name="hard-hat" size={15} color="#0A6BCF" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={o.proContextTitle}>Estás creando una cuenta PRO</div>
            <div style={o.proContextSub}>
              Cuenta para recibir y atender solicitudes. Si quieres pedir servicios, usa la app del cliente.
            </div>
          </div>
        </div>

        {/* Trust */}
        <div style={o.trustList}>
          <div style={o.trustRow}>
            <div style={o.trustCheck}><Ic name="shield-check" size={11} color="#0F8A56" stroke={2.4} /></div>
            <span>Tu número se verifica con un SMS antes de continuar.</span>
          </div>
          <div style={o.trustRow}>
            <div style={o.trustCheck}><Ic name="lock" size={11} color="#0F8A56" stroke={2.4} /></div>
            <span>No compartimos tu celular con clientes hasta que aceptes el servicio.</span>
          </div>
        </div>

        {/* T&C */}
        <div style={o.terms}>
          Al continuar aceptas los <a href="#" style={o.termsLink}>Términos PRO</a> y la <a href="#" style={o.termsLink}>Política de privacidad</a>, incluyendo la <b style={{ color: "#0E2C56", fontWeight: 700 }}>comisión del 12%</b> sobre cada servicio cobrado.
        </div>
      </div>

      <div style={o.footer}>
        <button style={o.primaryBtn}>
          <Ic name="message-square-text" size={15} color="#FFFFFF" style={{ marginRight: 8 }} />
          Enviar código
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// SCREEN 03 — DATOS PERSONALES
// =====================================================================
function PersonalScreen() {
  return (
    <div style={o.wrap}>
      <StepHeader stepLabel="Datos personales" step={1} total={5} />

      <div style={o.body}>
        <div style={o.titleBlock}>
          <div style={o.bigTitle}>Cuéntanos sobre ti</div>
          <div style={o.bigSub}>Estos datos los usaremos para verificar tu identidad.</div>
        </div>

        {/* Photo */}
        <div style={o.photoBlock}>
          <div style={o.photoWrap}>
            <div style={o.photoBig}>
              <span>RH</span>
              <div style={o.photoCamBtn}>
                <Ic name="camera" size={14} color="#FFFFFF" />
              </div>
            </div>
            <div style={o.photoStatusChip}>
              <Ic name="upload" size={10} color="#0A6BCF" />
              <span>Sube tu foto</span>
            </div>
          </div>
          <div style={o.photoCaption}>Foto profesional</div>
          <div style={o.photoRules}>
            <Rule ok text="Tu rostro claro y centrado" />
            <Rule warn text="Sin lentes oscuros" />
            <Rule warn text="Sin gorra ni casco" />
          </div>
        </div>

        {/* Form */}
        <div style={o.formStack}>
          <Field label="Nombre completo" value="Ramón Hernández García" required icon="user-round" />
          <Field label="Fecha de nacimiento" value="21/05/1981" required icon="calendar" select />

          {/* CURP with auto-detection */}
          <div style={o.field}>
            <label style={o.fieldLabel}>
              CURP
              <span style={o.requiredStar}>*</span>
              <span style={o.curpDetected}>
                <Ic name="check" size={9} color="#0F8A56" stroke={3} />
                Formato válido
              </span>
            </label>
            <div style={o.curpInputRow}>
              <Ic name="hash" size={13} color="#9CA3AF" style={{ marginRight: 8 }} />
              <span style={{ flex: 1, color: "#0E2C56", fontFamily: "'JetBrains Mono', monospace", fontSize: 13.5, letterSpacing: "0.06em", fontWeight: 600 }}>
                HEGR810521HJCRNM05
              </span>
            </div>
            <div style={o.curpBreakdown}>
              <Segment label="Apellido" val="HE" />
              <Segment label="Materno" val="GR" />
              <Segment label="Nac." val="810521" />
              <Segment label="Sexo" val="H" />
              <Segment label="Entidad" val="JC" />
              <Segment label="Cons." val="RNM05" />
            </div>
          </div>

          <Field label="RFC con homoclave" value="HEGR810521LM4" optional icon="badge"
            hint="Lo usaremos solo si decides emitir factura a tus clientes." />

          <Field label="Correo electrónico" value="ramon.hg@gmail.com" required icon="mail" verified={false} />
        </div>

        {/* Privacy notice */}
        <div style={o.legalCard}>
          <div style={o.legalIcon}>
            <Ic name="shield-check" size={14} color="#0F8A56" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={o.legalTitle}>Datos protegidos · LFPDPPP</div>
            <div style={o.legalText}>
              Solo personal autorizado de Tumantenimiento puede verlos. Los clientes nunca ven tu CURP, RFC ni correo.
            </div>
          </div>
        </div>
      </div>

      <div style={o.footer}>
        <button style={o.primaryBtn}>
          <span>Continuar</span>
          <Ic name="arrow-right" size={15} color="#FFFFFF" stroke={2.6} style={{ marginLeft: 8 }} />
        </button>
      </div>
    </div>
  );
}

function Segment({ label, val }) {
  return (
    <div style={o.segment}>
      <div style={o.segmentVal}>{val}</div>
      <div style={o.segmentLabel}>{label}</div>
    </div>
  );
}

function Rule({ text, ok, warn }) {
  return (
    <div style={o.ruleRow}>
      <Ic name={ok ? "check" : "minus"} size={10} color={ok ? "#0F8A56" : "#B45309"} stroke={3} />
      <span style={{ color: ok ? "#0F8A56" : "#B45309" }}>{text}</span>
    </div>
  );
}

// =====================================================================
// SCREEN 04 — DIRECCIÓN Y ZONA DE COBERTURA
// =====================================================================
function AddressScreen() {
  const COLONIAS = [
    { name: "Providencia",      sel: true },
    { name: "Lafayette",        sel: true },
    { name: "Chapalita",        sel: true },
    { name: "Vallarta Norte",   sel: true },
    { name: "Country Club" },
    { name: "Americana" },
    { name: "Italia Providencia" },
  ];
  return (
    <div style={o.wrap}>
      <StepHeader stepLabel="Dirección y zona" step={2} total={5} />

      <div style={o.body}>
        <div style={o.titleBlock}>
          <div style={o.bigTitle}>¿Dónde vives y trabajas?</div>
          <div style={o.bigSub}>Definimos tu zona personal y el área donde atiendes clientes.</div>
        </div>

        {/* Personal address */}
        <SectionLabel n="A" label="DIRECCIÓN PERSONAL" sub="Solo nosotros la vemos" />

        <button style={o.locateBtn}>
          <div style={o.locateIcon}>
            <Ic name="locate-fixed" size={15} color="#FFFFFF" />
          </div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={o.locateTitle}>Usar mi ubicación</div>
            <div style={o.locateSub}>Detectamos calle, colonia y CP automáticamente</div>
          </div>
          <Ic name="chevron-right" size={15} color="#FFFFFF" />
        </button>

        <div style={o.formStack}>
          <div style={o.fieldRow}>
            <Field label="Calle" value="Calle Pavo 320" required small />
            <Field label="Int." value="3B" optional small />
          </div>
          <Field label="Colonia" value="Providencia" required />
          <div style={o.fieldRow}>
            <Field label="Ciudad" value="Guadalajara" required small />
            <Field label="CP" value="44630" required small />
          </div>
        </div>

        {/* Coverage */}
        <SectionLabel n="B" label="ZONA DE COBERTURA" sub="Hasta dónde te desplazas para dar servicio" />

        {/* Mode toggle */}
        <div style={o.modeRow}>
          <div style={{ ...o.modeOpt, ...o.modeOptSel }}>
            <Ic name="circle-dot" size={13} color="#FFFFFF" />
            <span>Radio desde casa</span>
          </div>
          <div style={o.modeOpt}>
            <Ic name="layers" size={13} color="#6B7280" />
            <span>Colonias específicas</span>
          </div>
        </div>

        {/* Coverage map */}
        <div style={o.coverMap}>
          <CoverageMap />
          {/* Floating distance pill */}
          <div style={o.coverDistPill}>
            <Ic name="navigation" size={12} color="#FFFFFF" />
            <span>10 km</span>
            <span style={o.coverDistDot} />
            <span style={{ fontSize: 10.5, fontWeight: 600, opacity: 0.85 }}>~3 colonias</span>
          </div>
          {/* Floating tag near home */}
          <div style={o.coverHomeTag}>
            <Ic name="home" size={10} color="#0A6BCF" />
            <span>Tu casa</span>
          </div>
        </div>

        {/* Radius slider */}
        <div style={o.sliderCard}>
          <div style={o.sliderTopRow}>
            <span style={o.sliderLabel}>Distancia máxima</span>
            <span style={o.sliderVal}>10 km</span>
          </div>
          <div style={o.sliderTrack}>
            <div style={o.sliderFill} />
            <div style={o.sliderThumb}>
              <div style={o.sliderThumbInner} />
            </div>
          </div>
          <div style={o.sliderRangeRow}>
            <span>1 km</span>
            <span>25 km</span>
          </div>
        </div>

        {/* Colonias chips */}
        <div style={o.coloniasBox}>
          <div style={o.coloniasHead}>
            <span style={o.coloniasLabel}>COLONIAS INCLUIDAS · 4</span>
            <a href="#" style={o.coloniasEdit}>Personalizar</a>
          </div>
          <div style={o.coloniasChips}>
            {COLONIAS.slice(0, 4).map(c => (
              <div key={c.name} style={o.coloniaChip}>
                <Ic name="check" size={10} color="#FFFFFF" stroke={3} />
                <span>{c.name}</span>
              </div>
            ))}
            <div style={o.coloniaChipMore}>+ {COLONIAS.length - 4} más cercanas</div>
          </div>
        </div>

        <div style={o.tipRow}>
          <Ic name="lightbulb" size={12} color="#B45309" />
          <span>
            Mientras más amplia tu zona, <b style={{ color: "#0E2C56", fontWeight: 700 }}>más solicitudes recibes</b>. Puedes ajustarla después.
          </span>
        </div>
      </div>

      <div style={o.footer}>
        <button style={o.primaryBtn}>
          <span>Continuar</span>
          <Ic name="arrow-right" size={15} color="#FFFFFF" stroke={2.6} style={{ marginLeft: 8 }} />
        </button>
      </div>
    </div>
  );
}

function CoverageMap() {
  return (
    <svg viewBox="0 0 390 220" width="100%" height="100%" style={{ display: "block", background: "#DDE7F1" }}>
      <defs>
        <pattern id="covGrid" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M22 0 L0 0 0 22" fill="none" stroke="#CCD7E5" strokeWidth="0.5" />
        </pattern>
        <radialGradient id="covRange" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="rgba(10,107,207,0.22)" />
          <stop offset="1" stopColor="rgba(10,107,207,0.05)" />
        </radialGradient>
      </defs>
      <rect width="390" height="220" fill="url(#covGrid)" />

      {/* Zone blobs */}
      <path d="M 30 50 Q 130 30 230 60 Q 280 110 240 170 Q 130 190 50 170 Q 10 110 30 50 Z" fill="rgba(180,210,180,0.30)" />
      <path d="M 270 80 Q 360 80 380 130 Q 380 180 320 195 Q 240 180 250 130 Z" fill="rgba(180,210,180,0.25)" />

      {/* Buildings */}
      <g fill="rgba(255,255,255,0.5)">
        <rect x="80"  y="150" width="14" height="20" rx="1.5" />
        <rect x="100" y="146" width="18" height="24" rx="1.5" />
        <rect x="122" y="152" width="12" height="18" rx="1.5" />
        <rect x="310" y="60"  width="14" height="20" rx="1.5" />
        <rect x="330" y="54"  width="18" height="26" rx="1.5" />
      </g>

      {/* Roads */}
      <path d="M0 110 Q 200 100 390 120" stroke="#FFFFFF" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M195 0 Q 200 110 198 220" stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M0 50 Q 200 50 390 70" stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity="0.7" strokeLinecap="round" />
      <path d="M0 170 Q 200 165 390 180" stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity="0.7" strokeLinecap="round" />

      {/* Coverage range (10 km ~ visual) */}
      <circle cx="195" cy="115" r="100" fill="url(#covRange)" stroke="#0A6BCF" strokeWidth="1.5" strokeDasharray="5 4" />

      {/* Tech home pin (center) */}
      <g transform="translate(195, 115)">
        <circle r="14" fill="#FFFFFF" stroke="#0A6BCF" strokeWidth="3" />
        <path d="M -5 1 L -5 -3 L 0 -7 L 5 -3 L 5 1 Z" fill="#0A6BCF" />
      </g>

      {/* Colonia labels */}
      <text x="100" y="70"  fontFamily="Inter" fontWeight="700" fontSize="10" fill="#0E2C56" opacity="0.75">Providencia</text>
      <text x="270" y="70"  fontFamily="Inter" fontWeight="600" fontSize="9"  fill="#0E2C56" opacity="0.55">Vallarta N.</text>
      <text x="240" y="200" fontFamily="Inter" fontWeight="600" fontSize="9"  fill="#0E2C56" opacity="0.55">Lafayette</text>
      <text x="70"  y="200" fontFamily="Inter" fontWeight="600" fontSize="9"  fill="#0E2C56" opacity="0.55">Chapalita</text>
      <text x="20"  y="40"  fontFamily="Inter" fontWeight="600" fontSize="9"  fill="#0E2C56" opacity="0.35">Country Club</text>
    </svg>
  );
}

// =====================================================================
// SHARED PIECES
// =====================================================================
function StepHeader({ step, total, stepLabel = "Crea tu cuenta" }) {
  const pct = step ? (step / total) * 100 : 0;
  return (
    <div style={o.stepHeader}>
      <button style={o.backBtn}>
        <Ic name="arrow-left" size={17} color="#0E2C56" />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        {step ? (
          <>
            <div style={o.stepLabelRow}>
              <span style={o.stepLabel}>{stepLabel}</span>
              <span style={o.stepCount}>Paso {step} de {total}</span>
            </div>
            <div style={o.stepTrack}>
              <div style={{ ...o.stepFill, width: `${pct}%` }} />
            </div>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={o.stepLabel}>{stepLabel}</span>
            <span style={o.stepCountSmall}>Verificación</span>
          </div>
        )}
      </div>
      <button style={o.helpBtn}>
        <Ic name="help-circle" size={15} color="#6B7280" />
      </button>
    </div>
  );
}

function SectionLabel({ n, label, sub }) {
  return (
    <div style={o.sectionLabelRow}>
      <div style={o.sectionLabelNum}>{n}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={o.sectionLabelLabel}>{label}</div>
        {sub && <div style={o.sectionLabelSub}>{sub}</div>}
      </div>
    </div>
  );
}

function Field({ label, value, placeholder, icon, verified, required, optional, hint, small, select }) {
  return (
    <div style={{ ...o.field, ...(small ? { flex: 1 } : null) }}>
      <label style={o.fieldLabel}>
        {label}
        {required && <span style={o.requiredStar}>*</span>}
        {optional && <span style={o.optionalChip}>opcional</span>}
      </label>
      <div style={o.inputWrap}>
        {icon && <Ic name={icon} size={13} color="#9CA3AF" style={{ marginRight: 8 }} />}
        <span style={{ flex: 1, color: value ? "#0E2C56" : "#9CA3AF", fontWeight: 500, fontSize: 13.5 }}>
          {value || placeholder}
        </span>
        {verified && (
          <span style={o.verifiedChip}>
            <Ic name="check" size={9} color="#0F8A56" stroke={3} />
            Verificado
          </span>
        )}
        {select && <Ic name="chevron-down" size={13} color="#9CA3AF" />}
      </div>
      {hint && <div style={o.fieldHintSmall}>{hint}</div>}
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

// =====================================================================
// SCREEN 05 — IDENTIFICACIÓN (frente + reverso)
// =====================================================================
function IdScreen() {
  return (
    <div style={o.wrap}>
      <StepHeader stepLabel="Identificación oficial" step={3} total={5} />

      <div style={o.body}>
        <div style={o.titleBlock}>
          <div style={o.bigTitle}>Sube tu identificación</div>
          <div style={o.bigSub}>
            Necesitamos las dos caras de tu <b style={{ color: "#0E2C56", fontWeight: 700 }}>INE / IFE</b>, pasaporte o cédula profesional para verificar que eres tú.
          </div>
        </div>

        {/* Doc type selector */}
        <div style={o.docTypeRow}>
          <div style={{ ...o.docTypeOpt, ...o.docTypeOptSel }}>
            <div style={o.docTypeIcon}><Ic name="id-card" size={14} color="#FFFFFF" /></div>
            <span>INE / IFE</span>
          </div>
          <div style={o.docTypeOpt}>
            <div style={{ ...o.docTypeIcon, background: "rgba(14,44,86,0.08)" }}>
              <Ic name="book" size={14} color="#6B7280" />
            </div>
            <span>Pasaporte</span>
          </div>
          <div style={o.docTypeOpt}>
            <div style={{ ...o.docTypeIcon, background: "rgba(14,44,86,0.08)" }}>
              <Ic name="graduation-cap" size={14} color="#6B7280" />
            </div>
            <span>Cédula</span>
          </div>
        </div>

        {/* Front side — uploaded with extracted data */}
        <div style={o.idCardWrap}>
          <div style={o.idLabelRow}>
            <span style={o.idLabelNum}>1</span>
            <span style={o.idLabelText}>FRENTE · INE</span>
            <span style={o.idLabelStatusOk}>
              <Ic name="check" size={9} color="#0F8A56" stroke={3} />
              Verificada
            </span>
          </div>
          <div style={o.idCardFilled}>
            <IneFront />
            <div style={o.idCardOverlay}>
              <div style={o.idCardOverlayChip}>
                <Ic name="check" size={10} color="#FFFFFF" stroke={3.5} />
                <span>Imagen nítida</span>
              </div>
              <button style={o.idCardOverlayBtn}>
                <Ic name="refresh-cw" size={11} color="#FFFFFF" />
                <span>Reemplazar</span>
              </button>
            </div>
          </div>
          {/* OCR extracted fields */}
          <div style={o.ocrBlock}>
            <div style={o.ocrLabelRow}>
              <Ic name="sparkles" size={11} color="#0A6BCF" />
              <span>DATOS DETECTADOS — confirma o corrige</span>
            </div>
            <div style={o.ocrGrid}>
              <OcrRow label="Nombre"  val="Ramón Hernández García" match />
              <OcrRow label="CURP"    val="HEGR810521HJCRNM05"  match />
              <OcrRow label="Vigencia" val="2030" />
            </div>
          </div>
        </div>

        {/* Back side — empty upload state */}
        <div style={o.idCardWrap}>
          <div style={o.idLabelRow}>
            <span style={o.idLabelNum}>2</span>
            <span style={o.idLabelText}>REVERSO · INE</span>
            <span style={o.idLabelStatusPending}>Pendiente</span>
          </div>
          <button style={o.idCardEmpty}>
            <div style={o.idCardEmptyInner}>
              <div style={o.idCardEmptyIcon}>
                <Ic name="camera" size={22} color="#0A6BCF" />
              </div>
              <div style={o.idCardEmptyTitle}>Toca para capturar el reverso</div>
              <div style={o.idCardEmptySub}>O sube una foto desde galería</div>
              <div style={o.idCardEmptyActions}>
                <span style={o.idCardEmptyChip}>
                  <Ic name="camera" size={11} color="#0A6BCF" />
                  Cámara
                </span>
                <span style={o.idCardEmptyChip}>
                  <Ic name="image" size={11} color="#0A6BCF" />
                  Galería
                </span>
              </div>
              {/* corner brackets */}
              <div style={{ ...o.idCorner, top: 8, left: 8 }} />
              <div style={{ ...o.idCorner, top: 8, right: 8, transform: "scaleX(-1)" }} />
              <div style={{ ...o.idCorner, bottom: 8, left: 8, transform: "scaleY(-1)" }} />
              <div style={{ ...o.idCorner, bottom: 8, right: 8, transform: "scale(-1,-1)" }} />
            </div>
          </button>
        </div>

        {/* Tips */}
        <div style={o.idTipsBox}>
          <div style={o.idTipsHead}>
            <Ic name="info" size={12} color="#0A6BCF" />
            <span>CONSEJOS PARA UNA BUENA FOTO</span>
          </div>
          <div style={o.idTipsGrid}>
            <Rule ok text="Luz natural, sin reflejos" />
            <Rule ok text="Toda la credencial visible" />
            <Rule warn text="Evita el flash directo" />
            <Rule warn text="No tapes con tus dedos" />
          </div>
        </div>

        {/* Privacy */}
        <div style={o.legalCard}>
          <div style={o.legalIcon}>
            <Ic name="shield-check" size={14} color="#0F8A56" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={o.legalTitle}>Tu identificación está cifrada</div>
            <div style={o.legalText}>
              Se usa solo para verificar tu identidad. Nunca la compartimos con clientes ni con terceros.
            </div>
          </div>
        </div>
      </div>

      <div style={o.footer}>
        <button style={{ ...o.primaryBtn, ...o.primaryBtnDisabled }}>
          <Ic name="camera" size={15} color="#9CA3AF" style={{ marginRight: 8 }} />
          <span>Falta el reverso</span>
        </button>
      </div>
    </div>
  );
}

function OcrRow({ label, val, match }) {
  return (
    <div style={o.ocrRow}>
      <span style={o.ocrLabel}>{label}</span>
      <span style={o.ocrVal}>{val}</span>
      {match && (
        <span style={o.ocrMatch}>
          <Ic name="check" size={8} color="#0F8A56" stroke={3.5} />
          <span>coincide</span>
        </span>
      )}
    </div>
  );
}

function IneFront() {
  // Stylized generic ID document — not a real INE
  return (
    <svg viewBox="0 0 320 200" width="100%" height="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id="idBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F4E4BC" />
          <stop offset="1" stopColor="#E5D2A0" />
        </linearGradient>
        <linearGradient id="idBand" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#15803D" />
          <stop offset="1" stopColor="#16A34A" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="url(#idBg)" />
      {/* Top band */}
      <rect width="320" height="30" fill="url(#idBand)" />
      <text x="14" y="20" fontFamily="Inter" fontWeight="700" fontSize="10" fill="#FFFFFF" letterSpacing="0.08em">IDENTIFICACIÓN OFICIAL</text>
      <text x="306" y="20" fontFamily="Inter" fontWeight="700" fontSize="9" fill="#FFFFFF" textAnchor="end" opacity="0.85">MÉXICO</text>
      {/* Photo */}
      <rect x="14" y="44" width="86" height="110" rx="4" fill="#E5D2A0" stroke="#94A3B8" strokeWidth="1" />
      <circle cx="57" cy="82" r="18" fill="#C8A874" />
      <path d="M 27 152 Q 57 110 87 152" fill="#C8A874" />
      {/* Watermark */}
      <g opacity="0.18">
        <circle cx="57" cy="100" r="30" fill="none" stroke="#0E2C56" strokeWidth="2" />
        <path d="M 47 100 L 55 108 L 67 92" stroke="#0E2C56" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* Right side — text fields */}
      <text x="114" y="54"  fontFamily="Inter" fontWeight="600" fontSize="7" fill="#6B7280">NOMBRE</text>
      <text x="114" y="68"  fontFamily="Inter" fontWeight="700" fontSize="10" fill="#0E2C56">RAMÓN</text>
      <text x="114" y="82"  fontFamily="Inter" fontWeight="700" fontSize="10" fill="#0E2C56">HERNÁNDEZ GARCÍA</text>

      <text x="114" y="100" fontFamily="Inter" fontWeight="600" fontSize="7" fill="#6B7280">DOMICILIO</text>
      <text x="114" y="112" fontFamily="Inter" fontWeight="500" fontSize="7" fill="#0E2C56">CALLE PAVO 320 INT 3B</text>
      <text x="114" y="122" fontFamily="Inter" fontWeight="500" fontSize="7" fill="#0E2C56">PROVIDENCIA 44630</text>
      <text x="114" y="132" fontFamily="Inter" fontWeight="500" fontSize="7" fill="#0E2C56">GUADALAJARA, JAL.</text>

      <text x="114" y="150" fontFamily="Inter" fontWeight="600" fontSize="7" fill="#6B7280">CLAVE DE ELECTOR</text>
      <text x="114" y="162" fontFamily="'JetBrains Mono', monospace" fontWeight="700" fontSize="9" fill="#0E2C56" letterSpacing="0.04em">HRNGRM81052114H100</text>

      {/* Bottom bar */}
      <rect x="0" y="172" width="320" height="28" fill="#0F2A56" />
      <text x="14" y="182" fontFamily="Inter" fontWeight="600" fontSize="6.5" fill="#FFFFFF" opacity="0.65" letterSpacing="0.08em">CURP</text>
      <text x="14" y="194" fontFamily="'JetBrains Mono', monospace" fontWeight="700" fontSize="9" fill="#FFFFFF" letterSpacing="0.04em">HEGR810521HJCRNM05</text>
      <text x="306" y="194" fontFamily="Inter" fontWeight="600" fontSize="7" fill="#FFFFFF" textAnchor="end" opacity="0.7">VIG. 2030</text>
    </svg>
  );
}

// =====================================================================
// SCREEN 06 — CERTIFICACIONES (opcional)
// =====================================================================
function CertScreen() {
  return (
    <div style={o.wrap}>
      <StepHeader stepLabel="Certificaciones" step={4} total={5} />

      <div style={o.body}>
        <div style={o.titleBlock}>
          <div style={o.bigTitleRow}>
            <div style={o.bigTitle}>Sube tus certificaciones</div>
            <span style={o.titleOptional}>opcional</span>
          </div>
          <div style={o.bigSub}>
            Las certificaciones se muestran como <b style={{ color: "#0E2C56", fontWeight: 700 }}>insignias</b> en tu perfil y aumentan tu probabilidad de ser elegido.
          </div>
        </div>

        {/* Impact stats */}
        <div style={o.impactRow}>
          <div style={o.impactCard}>
            <div style={o.impactIcon}><Ic name="trending-up" size={14} color="#0F8A56" /></div>
            <div>
              <div style={o.impactVal}>+38%</div>
              <div style={o.impactLabel}>más elegido</div>
            </div>
          </div>
          <div style={o.impactCard}>
            <div style={{ ...o.impactIcon, background: "rgba(245,158,11,0.14)" }}>
              <Ic name="award" size={14} color="#B45309" />
            </div>
            <div>
              <div style={o.impactVal}>+$120</div>
              <div style={o.impactLabel}>tarifa promedio</div>
            </div>
          </div>
        </div>

        {/* Uploaded — verified */}
        <SectionLabel n="✓" label="CERTIFICACIONES SUBIDAS · 2" sub="En revisión por el equipo" />
        <div style={o.certList}>
          <CertCard
            icon="zap"
            tone="amber"
            title="Instalador Eléctrico Residencial"
            issuer="CFE Capacitación · Guadalajara"
            id="CFE-2023-0482-MX"
            year="2023"
            status="verified"
          />
          <CertCard
            icon="droplets"
            tone="blue"
            title="Plomero Certificado Nivel 2"
            issuer="CONALEP · Jalisco"
            id="CON-2021-7714"
            year="2021"
            status="review"
          />
        </div>

        {/* Add new */}
        <SectionLabel n="+" label="AGREGAR CERTIFICACIÓN" sub="PDF o foto · máximo 5 MB" />
        <button style={o.certAdd}>
          <div style={o.certAddIcon}>
            <Ic name="file-up" size={20} color="#0A6BCF" />
          </div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={o.certAddTitle}>Subir certificado</div>
            <div style={o.certAddSub}>Diploma, cédula, constancia o curso</div>
          </div>
          <div style={o.certAddPill}>
            <Ic name="plus" size={13} color="#FFFFFF" stroke={2.6} />
          </div>
        </button>

        {/* Suggested */}
        <SectionLabel n="✨" label="SUGERIDAS PARA TI" sub="Aliadas oficiales de Tumantenimiento" />
        <div style={o.suggestedList}>
          <SuggestedCert title="Manejo Seguro de Gas LP" issuer="ONNCCE" duration="4 hrs" cost="Gratis" tone="red" icon="flame" />
          <SuggestedCert title="Soldadura Básica" issuer="CONALEP" duration="8 hrs" cost="$450" tone="navy" icon="hammer" />
          <SuggestedCert title="Climatización y Refrigeración" issuer="IMSS Capacita" duration="12 hrs" cost="Gratis" tone="cyan" icon="snowflake" />
        </div>

        <div style={o.tipRow}>
          <Ic name="info" size={12} color="#0A6BCF" />
          <span>
            Puedes <b style={{ color: "#0E2C56", fontWeight: 700 }}>continuar sin certificaciones</b> y agregarlas después desde tu perfil.
          </span>
        </div>
      </div>

      <div style={o.footerStack}>
        <button style={o.primaryBtn}>
          <span>Continuar con 2 certificaciones</span>
          <Ic name="arrow-right" size={15} color="#FFFFFF" stroke={2.6} style={{ marginLeft: 8 }} />
        </button>
        <button style={o.skipBtn}>Omitir por ahora</button>
      </div>
    </div>
  );
}

function CertCard({ icon, tone = "blue", title, issuer, id, year, status }) {
  const toneMap = {
    amber: { bg: "linear-gradient(135deg,#F59E0B,#FBBF24)", color: "#FFFFFF" },
    blue:  { bg: "linear-gradient(135deg,#0A6BCF,#18C1FF)", color: "#FFFFFF" },
    navy:  { bg: "linear-gradient(135deg,#0E2C56,#0894EA)", color: "#FFFFFF" },
    red:   { bg: "linear-gradient(135deg,#DC2626,#F59E0B)", color: "#FFFFFF" },
    cyan:  { bg: "linear-gradient(135deg,#0884B0,#18C1FF)", color: "#FFFFFF" },
  };
  const v = toneMap[tone];
  return (
    <div style={o.certCard}>
      <div style={{ ...o.certBadge, background: v.bg }}>
        <Ic name={icon} size={20} color={v.color} />
        <div style={o.certBadgeRibbon} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={o.certTitle}>{title}</div>
        <div style={o.certIssuer}>
          <Ic name="building" size={10} color="#6B7280" />
          <span>{issuer}</span>
        </div>
        <div style={o.certIdRow}>
          <span style={o.certIdText}>{id}</span>
          <span style={o.bullet} />
          <span style={o.certYear}>{year}</span>
        </div>
      </div>
      {status === "verified" && (
        <div style={o.certStatusVerified}>
          <Ic name="badge-check" size={11} color="#FFFFFF" stroke={2.4} />
          <span>Verif.</span>
        </div>
      )}
      {status === "review" && (
        <div style={o.certStatusReview}>
          <div style={o.spinnerSmall} />
          <span>Revisión</span>
        </div>
      )}
    </div>
  );
}

function SuggestedCert({ title, issuer, duration, cost, tone, icon }) {
  const toneMap = {
    amber: "linear-gradient(135deg,#F59E0B,#FBBF24)",
    blue:  "linear-gradient(135deg,#0A6BCF,#18C1FF)",
    navy:  "linear-gradient(135deg,#0E2C56,#0894EA)",
    red:   "linear-gradient(135deg,#DC2626,#F59E0B)",
    cyan:  "linear-gradient(135deg,#0884B0,#18C1FF)",
  };
  return (
    <div style={o.suggCard}>
      <div style={{ ...o.suggIcon, background: toneMap[tone] }}>
        <Ic name={icon} size={16} color="#FFFFFF" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={o.suggTitle}>{title}</div>
        <div style={o.suggMeta}>
          <span>{issuer}</span>
          <span style={o.bullet} />
          <Ic name="clock" size={9} color="#9CA3AF" />
          <span>{duration}</span>
          <span style={o.bullet} />
          <span style={{ color: cost === "Gratis" ? "#0F8A56" : "#0E2C56", fontWeight: 700 }}>{cost}</span>
        </div>
      </div>
      <Ic name="chevron-right" size={14} color="#9CA3AF" />
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="onb" title="Onboarding · Técnico" subtitle="6 pantallas · cuenta PRO · Tumantenimiento">
        <DCArtboard id="welcome" label="01 · Bienvenida" width={438} height={892}>
          <PhoneFrame><Welcome /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="phone" label="02 · Registro de celular" width={438} height={892}>
          <PhoneFrame><PhoneScreen /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="personal" label="03 · Datos personales" width={438} height={892}>
          <PhoneFrame><PersonalScreen /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="address" label="04 · Dirección y zona de cobertura" width={438} height={892}>
          <PhoneFrame><AddressScreen /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="id" label="05 · Identificación (INE)" width={438} height={892}>
          <PhoneFrame><IdScreen /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="cert" label="06 · Certificaciones (opcional)" width={438} height={892}>
          <PhoneFrame><CertScreen /></PhoneFrame>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// =====================================================================
// STYLES
// =====================================================================
const o = {
  // ===== Welcome =====
  welcomeWrap: { width: "100%", height: "100%", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", color: "#FFFFFF" },
  welcomeBg: { position: "absolute", inset: 0, background: "linear-gradient(165deg, #0E2C56 0%, #0A6BCF 60%, #0894EA 110%)" },
  welcomeGlow1: { position: "absolute", right: -90, top: -90, width: 320, height: 320, background: "radial-gradient(circle, rgba(24,193,255,0.45), transparent 65%)" },
  welcomeGlow2: { position: "absolute", left: -120, bottom: 100, width: 360, height: 360, background: "radial-gradient(circle, rgba(245,158,11,0.18), transparent 60%)" },
  welcomeGrain: { position: "absolute", inset: 0, opacity: 0.4, background: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.06'/></svg>\")" },

  welcomeTopRow: { position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "52px 24px 0" },
  welcomeLogo: { display: "inline-flex", alignItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: "-0.01em" },
  welcomeLogoTu: { color: "#18C1FF" },
  welcomeLogoMant: { color: "#FFFFFF" },
  welcomeRoleChip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", background: "rgba(245,158,11,0.85)", borderRadius: 999, fontSize: 10.5, fontWeight: 800, color: "#FFFFFF", letterSpacing: ".06em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", boxShadow: "0 4px 10px rgba(245,158,11,0.40)" },

  welcomeIlluWrap: { position: "relative", padding: "20px 16px 0", display: "grid", placeItems: "center" },

  welcomeContent: { position: "relative", padding: "0 24px 4px" },
  welcomeEyebrow: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "rgba(255,255,255,0.65)", letterSpacing: ".14em", fontWeight: 700 },
  welcomeTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 4 },
  welcomeSub: { fontSize: 14, color: "rgba(255,255,255,0.82)", marginTop: 6, lineHeight: 1.5 },

  benefitList: { marginTop: 18, display: "flex", flexDirection: "column", gap: 8, padding: 12, background: "rgba(255,255,255,0.08)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(8px)" },
  benefitRow: { display: "flex", alignItems: "center", gap: 10 },
  benefitCheck: { width: 20, height: 20, borderRadius: "50%", background: "rgba(24,166,106,0.20)", border: "1px solid rgba(78,216,150,0.45)", display: "grid", placeItems: "center", flexShrink: 0 },
  benefitIcon: { width: 28, height: 28, borderRadius: 8, background: "rgba(24,193,255,0.18)", display: "grid", placeItems: "center", flexShrink: 0 },
  benefitText: { fontSize: 13, color: "#FFFFFF", fontWeight: 600 },
  benefitSub: { fontSize: 10.5, color: "rgba(255,255,255,0.65)", marginTop: 1 },

  welcomeFooter: { position: "relative", marginTop: "auto", padding: "20px 24px 36px" },
  welcomeCta: { width: "100%", padding: "14px", background: "#FFFFFF", color: "#0A6BCF", border: "none", borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(14,44,86,0.30)" },
  welcomeLogin: { textAlign: "center", marginTop: 12, color: "rgba(255,255,255,0.85)", fontSize: 13 },
  welcomeLoginLink: { color: "#FFFFFF", textDecoration: "underline", fontWeight: 700 },

  // ===== Generic wrap =====
  wrap: { width: "100%", height: "100%", background: "#F8FBFF", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" },
  body: { flex: 1, overflowY: "auto", padding: "16px 18px 100px" },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, background: "#FFFFFF", borderTop: "1px solid #E1E8F0", padding: "14px 18px 30px", display: "flex", gap: 10, alignItems: "center", boxShadow: "0 -4px 12px rgba(14,44,86,0.06)", zIndex: 5 },
  primaryBtn: { width: "100%", height: 54, background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(10,107,207,0.30)" },

  // ===== Step header =====
  stepHeader: { display: "flex", alignItems: "center", gap: 10, padding: "52px 16px 14px", background: "#FFFFFF", borderBottom: "1px solid #F0F4F9", flexShrink: 0 },
  backBtn: { width: 38, height: 38, borderRadius: 11, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  helpBtn: { width: 38, height: 38, borderRadius: 11, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  stepLabelRow: { display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 },
  stepLabel: { fontSize: 13, fontWeight: 700, color: "#0E2C56" },
  stepCount: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#6B7280", fontWeight: 600, letterSpacing: ".04em" },
  stepCountSmall: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF", fontWeight: 600 },
  stepTrack: { height: 4, background: "#EEF3F8", borderRadius: 999, overflow: "hidden" },
  stepFill: { height: "100%", background: "linear-gradient(90deg,#0A6BCF,#18C1FF)", borderRadius: 999, transition: "width 0.3s" },

  // ===== Big title block =====
  titleBlock: { marginBottom: 18 },
  bigTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em" },
  bigSub: { fontSize: 13.5, color: "#6B7280", marginTop: 6, lineHeight: 1.5 },

  // ===== Phone input =====
  field: { display: "flex", flexDirection: "column" },
  fieldLabel: { fontSize: 12.5, color: "#0E2C56", fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 },
  requiredStar: { color: "#DC2626" },
  optionalChip: { fontSize: 9.5, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", fontFamily: "'JetBrains Mono', monospace", padding: "1px 7px", background: "rgba(14,44,86,0.05)", borderRadius: 999 },
  inputWrap: { display: "flex", alignItems: "center", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10, padding: "11px 12px" },
  verifiedChip: { display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 7px", background: "rgba(24,166,106,0.12)", color: "#0F8A56", borderRadius: 999, fontSize: 10, fontWeight: 700 },
  fieldHint: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#9CA3AF", marginTop: 8, lineHeight: 1.4 },
  fieldHintSmall: { fontSize: 11, color: "#9CA3AF", marginTop: 4, lineHeight: 1.4 },

  phoneInputRow: { display: "flex", gap: 8, alignItems: "center" },
  phoneFlag: { display: "flex", alignItems: "center", gap: 5, padding: "10px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10, flexShrink: 0 },
  phoneNum: { flex: 1, display: "flex", alignItems: "center", background: "#FFFFFF", border: "1.5px solid #0A6BCF", borderRadius: 10, padding: "10px 14px", boxShadow: "0 0 0 3px rgba(10,107,207,0.10)" },
  cursor: { display: "inline-block", width: 2, height: 18, background: "#0A6BCF", animation: "ob-blink 1s infinite" },

  // Pro context
  proContextCard: { display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", background: "linear-gradient(135deg, rgba(10,107,207,0.06), rgba(24,193,255,0.04))", border: "1.5px solid rgba(10,107,207,0.25)", borderRadius: 12, marginTop: 18 },
  proContextIcon: { width: 32, height: 32, borderRadius: 9, background: "rgba(10,107,207,0.12)", display: "grid", placeItems: "center", flexShrink: 0 },
  proContextTitle: { fontSize: 13, fontWeight: 700, color: "#0E2C56" },
  proContextSub: { fontSize: 11.5, color: "#6B7280", marginTop: 3, lineHeight: 1.45 },

  trustList: { marginTop: 14, display: "flex", flexDirection: "column", gap: 8 },
  trustRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: "#6B7280" },
  trustCheck: { width: 18, height: 18, borderRadius: "50%", background: "rgba(24,166,106,0.12)", display: "grid", placeItems: "center", flexShrink: 0 },

  terms: { fontSize: 11, color: "#6B7280", lineHeight: 1.55, marginTop: 18, padding: "10px 12px", background: "#F8FBFF", border: "1px dashed #E1E8F0", borderRadius: 10 },
  termsLink: { color: "#0A6BCF", textDecoration: "none", fontWeight: 600 },

  // ===== Photo =====
  photoBlock: { display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0 22px" },
  photoWrap: { position: "relative", width: 120, height: 120 },
  photoBig: { position: "relative", width: 120, height: 120, borderRadius: "50%", background: "linear-gradient(135deg, #0A6BCF, #18C1FF)", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 38, letterSpacing: "-0.02em", boxShadow: "0 12px 28px rgba(10,107,207,0.40)", border: "3px dashed rgba(255,255,255,0.40)" },
  photoCamBtn: { position: "absolute", right: -2, bottom: 4, width: 38, height: 38, borderRadius: "50%", background: "#F59E0B", display: "grid", placeItems: "center", border: "3px solid #F8FBFF", boxShadow: "0 4px 10px rgba(245,158,11,0.40)" },
  photoStatusChip: { position: "absolute", left: "50%", bottom: -6, transform: "translateX(-50%)", display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 999, fontSize: 10, color: "#0A6BCF", fontWeight: 700, boxShadow: "0 4px 10px rgba(14,44,86,0.10)" },
  photoCaption: { marginTop: 22, fontSize: 13, fontWeight: 700, color: "#0E2C56" },
  photoRules: { marginTop: 8, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  ruleRow: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 600 },

  // ===== Form =====
  formStack: { display: "flex", flexDirection: "column", gap: 12 },
  fieldRow: { display: "flex", gap: 10 },

  // CURP
  curpInputRow: { display: "flex", alignItems: "center", background: "#FFFFFF", border: "1.5px solid #0F8A56", borderRadius: 10, padding: "11px 12px", boxShadow: "0 0 0 3px rgba(24,166,106,0.10)" },
  curpDetected: { marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", background: "rgba(24,166,106,0.12)", color: "#0F8A56", borderRadius: 999, fontSize: 9.5, fontWeight: 700 },
  curpBreakdown: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4, marginTop: 8 },
  segment: { padding: "5px 4px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 6, textAlign: "center" },
  segmentVal: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, fontWeight: 700, color: "#0A6BCF", letterSpacing: ".02em" },
  segmentLabel: { fontSize: 8, color: "#9CA3AF", marginTop: 1, letterSpacing: ".04em", fontWeight: 600, textTransform: "uppercase" },

  legalCard: { marginTop: 18, display: "flex", gap: 10, padding: "12px 14px", background: "rgba(24,166,106,0.06)", border: "1px solid rgba(24,166,106,0.25)", borderRadius: 12 },
  legalIcon: { width: 32, height: 32, borderRadius: 9, background: "rgba(24,166,106,0.12)", display: "grid", placeItems: "center", flexShrink: 0 },
  legalTitle: { fontSize: 12.5, fontWeight: 700, color: "#0E2C56" },
  legalText: { fontSize: 11.5, color: "#6B7280", marginTop: 3, lineHeight: 1.5 },

  // ===== Section labels =====
  sectionLabelRow: { display: "flex", alignItems: "center", gap: 10, margin: "16px 0 10px" },
  sectionLabelNum: { width: 22, height: 22, borderRadius: "50%", background: "#0A6BCF", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 11, flexShrink: 0 },
  sectionLabelLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#0A6BCF", letterSpacing: ".1em", fontWeight: 700 },
  sectionLabelSub: { fontSize: 10.5, color: "#9CA3AF", marginTop: 1 },

  // Locate
  locateBtn: { width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "linear-gradient(135deg,#0A6BCF,#0894EA)", color: "#FFFFFF", border: "none", borderRadius: 14, cursor: "pointer", marginBottom: 10, boxShadow: "0 6px 14px rgba(10,107,207,0.30)" },
  locateIcon: { width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.18)", display: "grid", placeItems: "center", flexShrink: 0 },
  locateTitle: { fontSize: 13, fontWeight: 700, color: "#FFFFFF" },
  locateSub: { fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 2 },

  // Mode toggle
  modeRow: { display: "flex", gap: 6, padding: 4, background: "#EEF3F8", borderRadius: 12, marginBottom: 12 },
  modeOpt: { flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "9px 8px", borderRadius: 10, fontSize: 11.5, fontWeight: 600, color: "#6B7280", cursor: "pointer" },
  modeOptSel: { background: "#0A6BCF", color: "#FFFFFF", boxShadow: "0 4px 10px rgba(10,107,207,0.30)" },

  // Coverage map
  coverMap: { position: "relative", height: 220, borderRadius: 16, overflow: "hidden", border: "1px solid #E1E8F0", marginBottom: 12, boxShadow: "0 4px 14px rgba(14,44,86,0.06)" },
  coverDistPill: { position: "absolute", top: 10, left: 10, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "rgba(14,44,86,0.85)", color: "#FFFFFF", borderRadius: 999, fontSize: 12, fontWeight: 700, fontFamily: "'Manrope', sans-serif", backdropFilter: "blur(6px)" },
  coverDistDot: { width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.5)" },
  coverHomeTag: { position: "absolute", left: "50%", top: "calc(50% + 22px)", transform: "translateX(-50%)", display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 999, fontSize: 10, color: "#0A6BCF", fontWeight: 700, boxShadow: "0 4px 10px rgba(14,44,86,0.15)" },

  // Slider
  sliderCard: { padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, marginBottom: 12 },
  sliderTopRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 },
  sliderLabel: { fontSize: 12.5, color: "#0E2C56", fontWeight: 600 },
  sliderVal: { fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: "#0A6BCF", letterSpacing: "-0.02em" },
  sliderTrack: { position: "relative", height: 6, background: "#EEF3F8", borderRadius: 999 },
  sliderFill: { height: "100%", width: "38%", background: "linear-gradient(90deg,#0A6BCF,#18C1FF)", borderRadius: 999 },
  sliderThumb: { position: "absolute", left: "38%", top: "50%", transform: "translate(-50%,-50%)", width: 22, height: 22, borderRadius: "50%", background: "#FFFFFF", border: "3px solid #0A6BCF", boxShadow: "0 4px 10px rgba(10,107,207,0.30)", display: "grid", placeItems: "center" },
  sliderThumbInner: { width: 6, height: 6, borderRadius: "50%", background: "#0A6BCF" },
  sliderRangeRow: { display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },

  // Colonias
  coloniasBox: { padding: 12, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, marginBottom: 12 },
  coloniasHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  coloniasLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF", letterSpacing: ".08em", fontWeight: 700 },
  coloniasEdit: { color: "#0A6BCF", textDecoration: "none", fontSize: 11.5, fontWeight: 700 },
  coloniasChips: { display: "flex", flexWrap: "wrap", gap: 6 },
  coloniaChip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", background: "#0A6BCF", color: "#FFFFFF", borderRadius: 999, fontSize: 11.5, fontWeight: 600 },
  coloniaChipMore: { display: "inline-flex", alignItems: "center", padding: "5px 10px", background: "#F8FBFF", color: "#6B7280", border: "1px dashed #E1E8F0", borderRadius: 999, fontSize: 11.5, fontWeight: 500 },

  tipRow: { display: "flex", alignItems: "flex-start", gap: 6, padding: "10px 12px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 10, fontSize: 11.5, color: "#6B7280", lineHeight: 1.5 },

  // ===== ID Screen =====
  primaryBtnDisabled: { background: "#EEF3F8", color: "#9CA3AF", boxShadow: "none", cursor: "not-allowed" },
  bigTitleRow: { display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" },
  titleOptional: { padding: "2px 8px", background: "rgba(245,158,11,0.14)", color: "#B45309", borderRadius: 999, fontSize: 9.5, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".06em", textTransform: "uppercase" },

  docTypeRow: { display: "flex", gap: 8, marginBottom: 18 },
  docTypeOpt: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "10px 6px", background: "#FFFFFF", border: "1.5px solid #E1E8F0", borderRadius: 12, fontSize: 11, fontWeight: 600, color: "#6B7280", cursor: "pointer" },
  docTypeOptSel: { borderColor: "#0A6BCF", color: "#0E2C56", boxShadow: "0 4px 12px rgba(10,107,207,0.15)" },
  docTypeIcon: { width: 32, height: 32, borderRadius: 9, background: "#0A6BCF", display: "grid", placeItems: "center" },

  idCardWrap: { marginBottom: 14 },
  idLabelRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
  idLabelNum: { width: 20, height: 20, borderRadius: "50%", background: "#0A6BCF", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 10, flexShrink: 0 },
  idLabelText: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#0E2C56", letterSpacing: ".08em", fontWeight: 700, flex: 1 },
  idLabelStatusOk: { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", background: "rgba(24,166,106,0.12)", color: "#0F8A56", borderRadius: 999, fontSize: 10, fontWeight: 700 },
  idLabelStatusPending: { padding: "2px 8px", background: "rgba(245,158,11,0.14)", color: "#B45309", borderRadius: 999, fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".04em", textTransform: "uppercase" },

  idCardFilled: { position: "relative", borderRadius: 14, overflow: "hidden", border: "1.5px solid #18A66A", boxShadow: "0 6px 16px rgba(24,166,106,0.18)" },
  idCardOverlay: { position: "absolute", inset: 0, padding: 10, display: "flex", flexDirection: "column", justifyContent: "space-between", background: "linear-gradient(180deg, rgba(14,44,86,0.0) 60%, rgba(14,44,86,0.45) 100%)", pointerEvents: "none" },
  idCardOverlayChip: { alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 9px", background: "#18A66A", color: "#FFFFFF", borderRadius: 999, fontSize: 10, fontWeight: 700, boxShadow: "0 2px 6px rgba(24,166,106,0.40)" },
  idCardOverlayBtn: { alignSelf: "flex-end", display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 11px", background: "rgba(255,255,255,0.94)", border: "none", borderRadius: 999, fontSize: 11, color: "#0E2C56", fontWeight: 700, cursor: "pointer", backdropFilter: "blur(4px)", pointerEvents: "auto" },

  ocrBlock: { marginTop: 8, padding: "10px 12px", background: "linear-gradient(135deg, rgba(10,107,207,0.05), rgba(24,193,255,0.04))", border: "1px solid rgba(10,107,207,0.20)", borderRadius: 12 },
  ocrLabelRow: { display: "flex", alignItems: "center", gap: 5, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#0A6BCF", letterSpacing: ".08em", fontWeight: 700 },
  ocrGrid: { display: "flex", flexDirection: "column", gap: 6 },
  ocrRow: { display: "flex", alignItems: "center", gap: 8 },
  ocrLabel: { width: 70, fontSize: 10.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" },
  ocrVal: { flex: 1, fontSize: 12, color: "#0E2C56", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".02em" },
  ocrMatch: { display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 6px", background: "rgba(24,166,106,0.12)", color: "#0F8A56", borderRadius: 999, fontSize: 9, fontWeight: 700 },

  idCardEmpty: { position: "relative", width: "100%", padding: 0, background: "#FFFFFF", border: "2px dashed #C8D4E0", borderRadius: 14, cursor: "pointer", overflow: "hidden" },
  idCardEmptyInner: { position: "relative", aspectRatio: "1.586/1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 18, background: "linear-gradient(135deg, #F8FBFF 0%, #EEF3F8 100%)" },
  idCardEmptyIcon: { width: 48, height: 48, borderRadius: 12, background: "#FFFFFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", marginBottom: 4, boxShadow: "0 4px 12px rgba(10,107,207,0.10)" },
  idCardEmptyTitle: { fontSize: 13.5, color: "#0E2C56", fontWeight: 700 },
  idCardEmptySub: { fontSize: 11, color: "#9CA3AF", marginBottom: 6 },
  idCardEmptyActions: { display: "flex", gap: 6 },
  idCardEmptyChip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 11px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 999, fontSize: 11, color: "#0A6BCF", fontWeight: 600 },
  idCorner: { position: "absolute", width: 16, height: 16, borderTop: "2.5px solid #0A6BCF", borderLeft: "2.5px solid #0A6BCF", borderRadius: "3px 0 0 0" },

  idTipsBox: { padding: 12, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12, marginTop: 14 },
  idTipsHead: { display: "flex", alignItems: "center", gap: 5, marginBottom: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#9CA3AF", letterSpacing: ".08em", fontWeight: 700 },
  idTipsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 },

  // ===== Cert Screen =====
  footerStack: { position: "absolute", left: 0, right: 0, bottom: 0, background: "#FFFFFF", borderTop: "1px solid #E1E8F0", padding: "14px 18px 30px", display: "flex", flexDirection: "column", gap: 6, boxShadow: "0 -4px 12px rgba(14,44,86,0.06)", zIndex: 5 },
  skipBtn: { width: "100%", padding: "10px", background: "transparent", color: "#6B7280", border: "none", fontWeight: 600, fontSize: 12.5, cursor: "pointer" },

  impactRow: { display: "flex", gap: 8, marginBottom: 8 },
  impactCard: { flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12 },
  impactIcon: { width: 30, height: 30, borderRadius: 8, background: "rgba(24,166,106,0.12)", display: "grid", placeItems: "center", flexShrink: 0 },
  impactVal: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 15, color: "#0E2C56", letterSpacing: "-0.01em", lineHeight: 1 },
  impactLabel: { fontSize: 10, color: "#6B7280", marginTop: 2 },

  certList: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 },
  certCard: { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14 },
  certBadge: { position: "relative", width: 46, height: 56, borderRadius: "6px 6px 14px 14px", display: "grid", placeItems: "center", flexShrink: 0, boxShadow: "0 4px 10px rgba(14,44,86,0.12)" },
  certBadgeRibbon: { position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "23px solid transparent", borderRight: "23px solid transparent", borderTop: "10px solid currentColor", color: "#0A6BCF", opacity: 0 },
  certTitle: { fontSize: 13, color: "#0E2C56", fontWeight: 700, lineHeight: 1.3 },
  certIssuer: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6B7280", marginTop: 3 },
  certIdRow: { display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4 },
  certIdText: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF", fontWeight: 600 },
  certYear: { fontSize: 10.5, color: "#0A6BCF", fontWeight: 700 },
  bullet: { width: 2, height: 2, borderRadius: "50%", background: "#9CA3AF", margin: "0 2px" },
  certStatusVerified: { display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 9px", background: "linear-gradient(135deg,#18A66A,#4ED896)", color: "#FFFFFF", borderRadius: 999, fontSize: 10, fontWeight: 700, flexShrink: 0, boxShadow: "0 2px 6px rgba(24,166,106,0.30)" },
  certStatusReview: { display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", background: "rgba(245,158,11,0.14)", color: "#B45309", borderRadius: 999, fontSize: 10, fontWeight: 700, flexShrink: 0 },
  spinnerSmall: { width: 10, height: 10, borderRadius: "50%", border: "2px solid rgba(245,158,11,0.30)", borderTopColor: "#B45309", animation: "ob-spin 0.9s linear infinite" },

  certAdd: { width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px", background: "rgba(10,107,207,0.04)", border: "1.5px dashed rgba(10,107,207,0.30)", borderRadius: 14, cursor: "pointer" },
  certAddIcon: { width: 40, height: 40, borderRadius: 10, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  certAddTitle: { fontSize: 13.5, fontWeight: 700, color: "#0A6BCF" },
  certAddSub: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  certAddPill: { width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#0A6BCF,#0894EA)", display: "grid", placeItems: "center", boxShadow: "0 4px 10px rgba(10,107,207,0.30)", flexShrink: 0 },

  suggestedList: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 },
  suggCard: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12, cursor: "pointer" },
  suggIcon: { width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0 },
  suggTitle: { fontSize: 12.5, fontWeight: 700, color: "#0E2C56" },
  suggMeta: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, color: "#6B7280", marginTop: 2 },
};

const kf = document.createElement("style");
kf.textContent = `
  @keyframes ob-blink { 50% { opacity: 0; } }
  @keyframes ob-spin  { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`;
document.head.appendChild(kf);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
