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
// LOGIN
// =====================================================================
function LoginScreen() {
  return (
    <div style={ad.loginWrap}>
      <div style={ad.loginBg}>
        <div style={ad.loginGlow1} />
        <div style={ad.loginGlow2} />
        <div style={ad.loginGrid} />
      </div>

      <div style={ad.loginTopBar}>
        <div style={ad.loginLogo}>
          <span style={ad.loginLogoTu}>Tu</span>
          <span style={ad.loginLogoMant}>mantenimiento</span>
        </div>
        <span style={ad.loginAdminChip}>
          <Ic name="shield-check" size={11} color="#FFFFFF" />
          <span>ADMIN</span>
        </span>
      </div>

      <div style={ad.loginCard}>
        <div style={ad.loginIconRing}>
          <div style={ad.loginIconCircle}>
            <Ic name="lock-keyhole" size={22} color="#FFFFFF" />
          </div>
        </div>
        <div style={ad.loginTitle}>Admin Tumantenimiento</div>
        <div style={ad.loginSub}>Operación · soporte · disputas</div>

        <div style={ad.fieldStack}>
          <div style={ad.field}>
            <label style={ad.fieldLabel}>Correo corporativo</label>
            <div style={ad.inputWrap}>
              <Ic name="mail" size={14} color="#9CA3AF" style={{ marginRight: 8 }} />
              <span style={{ flex: 1, color: "#0E2C56", fontSize: 13.5, fontWeight: 500 }}>sofia.alvarez@tumantenimiento.mx</span>
              <span style={ad.verifiedChip}>
                <Ic name="check" size={9} color="#0F8A56" stroke={3} />
                Corp
              </span>
            </div>
          </div>
          <div style={ad.field}>
            <label style={ad.fieldLabel}>Contraseña</label>
            <div style={ad.inputWrap}>
              <Ic name="lock" size={14} color="#9CA3AF" style={{ marginRight: 8 }} />
              <span style={{ flex: 1, color: "#0E2C56", letterSpacing: "0.3em", fontSize: 16 }}>••••••••</span>
              <button style={ad.eyeBtn}><Ic name="eye-off" size={13} color="#9CA3AF" /></button>
            </div>
            <div style={ad.fieldFootRow}>
              <label style={ad.rememberRow}>
                <span style={ad.checkbox}><Ic name="check" size={9} color="#FFFFFF" stroke={3.5} /></span>
                <span>Recordar este dispositivo</span>
              </label>
              <a href="#" style={ad.forgotLink}>¿Olvidaste tu contraseña?</a>
            </div>
          </div>
        </div>

        <button style={ad.primaryBtn}>
          <Ic name="log-in" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />
          Iniciar sesión
        </button>

        <div style={ad.mfaNotice}>
          <Ic name="shield-alert" size={12} color="#0A6BCF" />
          <span>Después del login solicitamos un <b style={{ color: "#0E2C56", fontWeight: 700 }}>código MFA de 6 dígitos</b>.</span>
        </div>
      </div>

      <div style={ad.loginFooter}>
        <div style={ad.loginFooterRow}>
          <Ic name="lock" size={10} color="rgba(255,255,255,0.65)" />
          <span>Personal autorizado · accesos auditados</span>
        </div>
        <div style={ad.loginFooterMeta}>v1.0 · build 2026.05.19 · MX-GDL</div>
      </div>
    </div>
  );
}

// =====================================================================
// MFA
// =====================================================================
function MfaScreen() {
  const digits = ["4", "8", "2", "1", "", ""];
  return (
    <div style={ad.loginWrap}>
      <div style={ad.loginBg}>
        <div style={ad.loginGlow1} />
        <div style={ad.loginGlow2} />
        <div style={ad.loginGrid} />
      </div>

      <div style={ad.loginTopBar}>
        <button style={ad.loginBackBtn}><Ic name="arrow-left" size={16} color="#FFFFFF" /></button>
        <span style={ad.loginAdminChip}>
          <Ic name="shield-check" size={11} color="#FFFFFF" />
          <span>VERIFICACIÓN</span>
        </span>
        <span />
      </div>

      <div style={ad.loginCard}>
        <div style={ad.loginIconRing}>
          <div style={{ ...ad.loginIconCircle, background: "linear-gradient(135deg,#18A66A,#4ED896)" }}>
            <Ic name="key-round" size={22} color="#FFFFFF" />
          </div>
        </div>
        <div style={ad.loginTitle}>Verificación en 2 pasos</div>
        <div style={ad.loginSub}>
          Ingresa el código de <b style={{ color: "#0E2C56", fontWeight: 700 }}>6 dígitos</b> de tu app autenticadora.
        </div>

        <div style={ad.otpRow}>
          {digits.map((d, i) => {
            const isCursor = i === 4;
            return (
              <div key={i} style={{
                ...ad.otpCell,
                ...(d ? ad.otpCellFilled : null),
                ...(isCursor ? ad.otpCellActive : null),
              }}>
                {d || (isCursor && <span style={ad.otpCursor} />)}
              </div>
            );
          })}
        </div>

        <div style={ad.otpTimerRow}>
          <Ic name="timer" size={12} color="#B45309" />
          <span>Caduca en <b style={{ color: "#7B3F00", fontWeight: 700 }}>0:43</b></span>
          <span style={ad.otpDot} />
          <a href="#" style={ad.otpResend}>Reenviar código</a>
        </div>

        <button style={ad.primaryBtn}>
          <Ic name="check" size={14} color="#FFFFFF" stroke={2.8} style={{ marginRight: 8 }} />
          Verificar acceso
        </button>

        <button style={ad.otpAltBtn}>
          <Ic name="smartphone" size={12} color="#0A6BCF" style={{ marginRight: 6 }} />
          Usar SMS al *4567
        </button>
      </div>

      <div style={ad.loginFooter}>
        <div style={ad.loginFooterRow}>
          <Ic name="info" size={10} color="rgba(255,255,255,0.65)" />
          <span>¿Perdiste el acceso? Contacta a <b style={{ color: "#FFFFFF", fontWeight: 700 }}>it@tumantenimiento.mx</b></span>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// DASHBOARD
// =====================================================================
function DashboardScreen() {
  const alerts = [
    { sev: "critical", icon: "alert-octagon",  label: "Disputa abierta",                       sub: "#SVC-2812 · hace 12 min", time: "12m" },
    { sev: "critical", icon: "alert-triangle", label: "Servicio atorado en \"en camino\"",     sub: "#SVC-2847 · 45 min sin movimiento", time: "45m" },
    { sev: "warning",  icon: "shield-alert",   label: "5 KYC pendientes >24h",                 sub: "Cola de verificación · revisar", time: "1d" },
    { sev: "warning",  icon: "credit-card",    label: "Pago OXXO fallido",                     sub: "#SVC-2799 · Patricia H.",     time: "32m" },
    { sev: "warning",  icon: "user-x",         label: "Técnico Ramón H. · 3 cancelaciones",    sub: "Últimas 48h · revisar reputación", time: "2h" },
  ];

  return (
    <div style={ad.dashWrap}>
      <DashHeader />

      <div style={ad.dashBody}>
        {/* Alertas */}
        <div style={ad.alertSection}>
          <div style={ad.alertHead}>
            <div style={ad.alertHeadLeft}>
              <span style={ad.alertHeadTitle}>Alertas activas</span>
              <span style={ad.alertBadgeRed}>5</span>
            </div>
            <a href="#" style={ad.alertHeadLink}>
              Ver todas
              <Ic name="arrow-right" size={11} color="#0A6BCF" style={{ marginLeft: 3 }} />
            </a>
          </div>

          <div style={ad.alertCard}>
            <div style={ad.alertSplit}>
              <div style={ad.alertSplitItem}>
                <div style={ad.alertSplitDotRed} />
                <span style={ad.alertSplitVal}>2</span>
                <span style={ad.alertSplitLabel}>críticas</span>
              </div>
              <div style={ad.alertSplitDiv} />
              <div style={ad.alertSplitItem}>
                <div style={ad.alertSplitDotAmber} />
                <span style={ad.alertSplitVal}>3</span>
                <span style={ad.alertSplitLabel}>advertencias</span>
              </div>
            </div>

            <div style={ad.alertList}>
              {alerts.map((a, idx) => <AlertRow key={idx} a={a} last={idx === alerts.length - 1} />)}
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div style={ad.sectionLabel}>OPERACIÓN EN VIVO</div>
        <div style={ad.kpiGrid}>
          <KpiCard icon="activity"       tone="blue"  val="47"     label="servicios activos" delta="+6 vs ayer" pulse />
          <KpiCard icon="check-check"    tone="green" val="128"    label="completados hoy"   delta="+12%" />
          <KpiCard icon="trending-up"    tone="amber" val="$94K"   label="GMV día · MXN"     delta="$1.2M mes" />
          <KpiCard icon="hard-hat"       tone="cyan"  val="142"    label="técnicos activos"  delta="89% disp." />
        </div>

        {/* Acciones rápidas */}
        <div style={ad.sectionLabel}>ACCIONES RÁPIDAS</div>
        <div style={ad.quickGrid}>
          <QuickAction icon="shield-check"   tone="amber" title="Aprobar KYC pendientes" count="12" sub="3 con >24h" />
          <QuickAction icon="alert-triangle" tone="red"   title="Disputas abiertas"      count="8"  sub="2 escaladas a legal" />
          <QuickAction icon="search"         tone="blue"  title="Buscar usuario o servicio" sub="ID · email · teléfono" />
          <QuickAction icon="phone-call"     tone="navy"  title="Tickets urgentes"       count="3"  sub="SLA <2h" />
        </div>

        {/* Cobertura mini */}
        <div style={ad.sectionLabel}>COBERTURA · ZMG</div>
        <div style={ad.coverageCard}>
          <CoverageMini />
          <div style={ad.coverageList}>
            <CoverageRow label="Guadalajara" active="58 / 64"  load={92} />
            <CoverageRow label="Zapopan"     active="42 / 48"  load={88} />
            <CoverageRow label="Tlaquepaque" active="28 / 36"  load={78} hot />
            <CoverageRow label="Tonalá"      active="14 / 22"  load={64} cold />
          </div>
        </div>

        {/* Activity feed */}
        <div style={ad.sectionLabel}>ACTIVIDAD RECIENTE</div>
        <div style={ad.feedCard}>
          <FeedRow icon="badge-check" iconTone="green" text={(<><b>Sofía A.</b> aprobó KYC de <b>Luis Méndez</b></>)} time="hace 2m" />
          <FeedRow icon="x-circle"    iconTone="red"   text={(<><b>Sistema</b> escaló disputa <b>#SVC-2812</b></>)} time="hace 12m" />
          <FeedRow icon="check"       iconTone="blue"  text={(<><b>Carlos R.</b> cerró ticket <b>#TKT-204</b></>)} time="hace 18m" last />
        </div>
      </div>

      <AdminTabs />
    </div>
  );
}

function DashHeader() {
  return (
    <div style={ad.dashHeader}>
      <div style={ad.dashHeaderOverlay} />
      <div style={ad.dashHeaderGlow} />

      <div style={ad.dashHeaderTopRow}>
        <div style={ad.dashHeaderAv}>
          <span>SA</span>
        </div>
        <div style={{ flex: 1, minWidth: 0, marginLeft: 10 }}>
          <div style={ad.dashHeaderSmall}>Buenos días</div>
          <div style={ad.dashHeaderName}>Hola, Sofía</div>
        </div>
        <button style={ad.dashHeaderBtn}>
          <Ic name="bell" size={16} color="#FFFFFF" />
          <span style={ad.dashHeaderBtnBadge}>5</span>
        </button>
        <button style={ad.dashHeaderBtn}>
          <Ic name="search" size={16} color="#FFFFFF" />
        </button>
      </div>

      <div style={ad.dashHeaderSub}>
        <span style={ad.dashHeaderLive}>
          <span style={ad.dashHeaderLiveDot} />
          <span>OPERACIÓN EN VIVO</span>
        </span>
        <span style={ad.dashHeaderBullet} />
        <span style={ad.dashHeaderRegion}>ZMG · Jalisco</span>
      </div>

      <div style={ad.shiftCard}>
        <div style={ad.shiftIcon}>
          <Ic name="clock" size={13} color="#FFFFFF" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={ad.shiftLabel}>TU TURNO HOY</div>
          <div style={ad.shiftTime}>
            <b style={{ color: "#FFFFFF", fontWeight: 800 }}>8:00 — 18:00</b>
            <span style={ad.shiftElapsed}>·  llevas 2h 12m</span>
          </div>
        </div>
        <span style={ad.shiftStatusChip}>
          <span style={ad.shiftStatusDot} />
          <span>en turno</span>
        </span>
      </div>
    </div>
  );
}

function AlertRow({ a, last }) {
  const map = {
    critical: { color: "#DC2626", bg: "rgba(220,38,38,0.10)", dot: "#DC2626" },
    warning:  { color: "#B45309", bg: "rgba(245,158,11,0.14)", dot: "#F59E0B" },
  };
  const m = map[a.sev];
  return (
    <div style={{ ...ad.alertRow, ...(last ? null : ad.alertRowBorder) }}>
      <div style={{ ...ad.alertRowIcon, background: m.bg }}>
        <Ic name={a.icon} size={13} color={m.color} stroke={2.4} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={ad.alertRowLabel}>{a.label}</div>
        <div style={ad.alertRowSub}>{a.sub}</div>
      </div>
      <div style={ad.alertTimeCol}>
        <span style={{ ...ad.alertTime, color: m.color }}>{a.time}</span>
        <Ic name="chevron-right" size={13} color="#9CA3AF" />
      </div>
    </div>
  );
}

function KpiCard({ icon, tone, val, label, delta, pulse }) {
  const map = {
    blue:  { bg: "rgba(10,107,207,0.10)", color: "#0A6BCF", deltaColor: "#0A6BCF" },
    green: { bg: "rgba(24,166,106,0.12)", color: "#0F8A56", deltaColor: "#0F8A56" },
    amber: { bg: "rgba(245,158,11,0.14)", color: "#B45309", deltaColor: "#B45309" },
    cyan:  { bg: "rgba(24,193,255,0.18)", color: "#0884B0", deltaColor: "#0884B0" },
  };
  const v = map[tone];
  return (
    <div style={ad.kpiCard}>
      <div style={ad.kpiTopRow}>
        <div style={{ ...ad.kpiIcon, background: v.bg }}>
          <Ic name={icon} size={13} color={v.color} stroke={2.4} />
        </div>
        {pulse && (
          <span style={ad.kpiLiveChip}>
            <span style={ad.kpiLiveDot} />
            <span>live</span>
          </span>
        )}
      </div>
      <div style={ad.kpiVal}>{val}</div>
      <div style={ad.kpiLabel}>{label}</div>
      {delta && (
        <div style={{ ...ad.kpiDelta, color: v.deltaColor }}>
          <span>{delta}</span>
        </div>
      )}
    </div>
  );
}

function QuickAction({ icon, tone, title, count, sub }) {
  const map = {
    blue:  { bg: "linear-gradient(135deg, rgba(10,107,207,0.10), rgba(24,193,255,0.04))", border: "rgba(10,107,207,0.25)", iconBg: "rgba(10,107,207,0.12)", color: "#0A6BCF" },
    amber: { bg: "linear-gradient(135deg, rgba(245,158,11,0.10), rgba(251,191,36,0.04))", border: "rgba(245,158,11,0.30)", iconBg: "rgba(245,158,11,0.16)", color: "#B45309" },
    red:   { bg: "linear-gradient(135deg, rgba(220,38,38,0.08), rgba(220,38,38,0.02))",    border: "rgba(220,38,38,0.30)", iconBg: "rgba(220,38,38,0.12)", color: "#DC2626" },
    navy:  { bg: "linear-gradient(135deg, rgba(14,44,86,0.08), rgba(10,107,207,0.04))",    border: "rgba(14,44,86,0.20)",  iconBg: "rgba(14,44,86,0.10)",  color: "#0E2C56" },
  };
  const v = map[tone];
  return (
    <div style={{ ...ad.quickCard, background: v.bg, borderColor: v.border }}>
      <div style={ad.quickTopRow}>
        <div style={{ ...ad.quickIcon, background: v.iconBg }}>
          <Ic name={icon} size={15} color={v.color} stroke={2.4} />
        </div>
        {count && <span style={{ ...ad.quickCountBadge, background: v.color }}>{count}</span>}
      </div>
      <div style={ad.quickTitle}>{title}</div>
      <div style={ad.quickSub}>{sub}</div>
      <Ic name="arrow-right" size={13} color={v.color} stroke={2.2} style={{ position: "absolute", right: 10, bottom: 10 }} />
    </div>
  );
}

function CoverageMini() {
  return (
    <svg viewBox="0 0 360 100" width="100%" height={100} style={{ display: "block", background: "#DDE7F1", borderRadius: 10 }}>
      <defs>
        <pattern id="adCovGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0 L0 0 0 20" fill="none" stroke="#CCD7E5" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="360" height="100" fill="url(#adCovGrid)" />
      {/* Cities */}
      <circle cx="120" cy="55" r="35" fill="rgba(10,107,207,0.18)" stroke="rgba(10,107,207,0.40)" strokeWidth="1.5" />
      <circle cx="200" cy="40" r="28" fill="rgba(10,107,207,0.18)" stroke="rgba(10,107,207,0.40)" strokeWidth="1.5" />
      <circle cx="240" cy="70" r="20" fill="rgba(245,158,11,0.20)" stroke="rgba(245,158,11,0.45)" strokeWidth="1.5" />
      <circle cx="295" cy="50" r="14" fill="rgba(14,193,255,0.14)" stroke="rgba(14,193,255,0.35)" strokeWidth="1.5" />
      {/* Tech dots */}
      <g fill="#0A6BCF">
        {[[110,50],[125,60],[135,48],[100,55],[130,45],[195,38],[208,30],[185,45],[215,42],[240,65],[245,80],[235,55],[295,45],[300,55]].map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="2.5" />
        ))}
      </g>
      <text x="120" y="22" textAnchor="middle" fontFamily="Inter" fontWeight="700" fontSize="11" fill="#0E2C56">Guadalajara</text>
      <text x="200" y="10" textAnchor="middle" fontFamily="Inter" fontWeight="700" fontSize="10" fill="#0E2C56">Zapopan</text>
      <text x="240" y="98" textAnchor="middle" fontFamily="Inter" fontWeight="600" fontSize="9" fill="#0E2C56">Tlaquepaque</text>
      <text x="295" y="80" textAnchor="middle" fontFamily="Inter" fontWeight="600" fontSize="9" fill="#0E2C56">Tonalá</text>
    </svg>
  );
}

function CoverageRow({ label, active, load, hot, cold }) {
  return (
    <div style={ad.covRow}>
      <span style={ad.covLabel}>{label}</span>
      <div style={ad.covTrack}>
        <div style={{ ...ad.covFill, width: `${load}%`, background: hot ? "#DC2626" : cold ? "#9CA3AF" : "#0A6BCF" }} />
      </div>
      <span style={ad.covActive}>{active}</span>
      <span style={{ ...ad.covLoadBadge, color: hot ? "#DC2626" : cold ? "#6B7280" : "#0A6BCF" }}>{load}%</span>
    </div>
  );
}

function FeedRow({ icon, iconTone, text, time, last }) {
  const map = {
    green: { bg: "rgba(24,166,106,0.12)", color: "#0F8A56" },
    red:   { bg: "rgba(220,38,38,0.10)",  color: "#DC2626" },
    blue:  { bg: "rgba(10,107,207,0.10)", color: "#0A6BCF" },
  };
  const v = map[iconTone];
  return (
    <div style={{ ...ad.feedRow, ...(last ? null : ad.feedRowBorder) }}>
      <div style={{ ...ad.feedIcon, background: v.bg }}>
        <Ic name={icon} size={11} color={v.color} stroke={2.4} />
      </div>
      <span style={ad.feedText}>{text}</span>
      <span style={ad.feedTime}>{time}</span>
    </div>
  );
}

function AdminTabs() {
  const tabs = [
    { id: "home",     icon: "layout-dashboard",label: "Inicio", active: true },
    { id: "support",  icon: "headphones",      label: "Soporte", badge: 8 },
    { id: "users",    icon: "users",           label: "Usuarios" },
    { id: "services", icon: "wrench",          label: "Servicios" },
    { id: "more",     icon: "menu",            label: "Más" },
  ];
  return (
    <div style={ad.tabbar}>
      {tabs.map(t => (
        <div key={t.id} style={ad.tabItem}>
          <div style={{ position: "relative" }}>
            <Ic name={t.icon} size={20} color={t.active ? "#0A6BCF" : "#9CA3AF"} stroke={t.active ? 2.2 : 1.8} />
            {t.badge && <span style={ad.tabBadge}>{t.badge}</span>}
          </div>
          <span style={{ ...ad.tabLabel, color: t.active ? "#0A6BCF" : "#9CA3AF", fontWeight: t.active ? 700 : 500 }}>{t.label}</span>
          {t.active && <div style={ad.tabActiveDot} />}
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
        <div style={{ width: 390, height: 844, position: "relative", overflow: "hidden", background: "#0E2C56" }}>{children}</div>
      </IOSDevice>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="auth" title="Login admin mobile" subtitle="Credenciales + MFA · personal autorizado">
        <DCArtboard id="login" label="01 · Login" width={438} height={892}>
          <PhoneFrame><LoginScreen /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="mfa" label="02 · MFA · OTP 6 dígitos" width={438} height={892}>
          <PhoneFrame><MfaScreen /></PhoneFrame>
        </DCArtboard>
      </DCSection>
      <DCSection id="dash" title="Dashboard admin mobile" subtitle="Sofía · operación en vivo ZMG">
        <DCArtboard id="dashboard" label="03 · Dashboard · home admin" width={438} height={892}>
          <PhoneFrame><DashboardScreen /></PhoneFrame>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// =====================================================================
// STYLES
// =====================================================================
var ad = {
  // ===== Login =====
  loginWrap: { width: "100%", height: "100%", position: "relative", overflow: "hidden", color: "#FFFFFF", display: "flex", flexDirection: "column" },
  loginBg: { position: "absolute", inset: 0, background: "linear-gradient(165deg, #0A1B36 0%, #0E2C56 60%, #1A3D6B 100%)" },
  loginGlow1: { position: "absolute", right: -100, top: -60, width: 320, height: 320, background: "radial-gradient(circle, rgba(24,193,255,0.35), transparent 65%)" },
  loginGlow2: { position: "absolute", left: -80, bottom: 80, width: 280, height: 280, background: "radial-gradient(circle, rgba(245,158,11,0.15), transparent 60%)" },
  loginGrid: { position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "32px 32px" },

  loginTopBar: { position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "52px 20px 0" },
  loginLogo: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: "-0.01em" },
  loginLogoTu: { color: "#18C1FF" },
  loginLogoMant: { color: "#FFFFFF" },
  loginAdminChip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", background: "rgba(220,38,38,0.85)", borderRadius: 999, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 800, color: "#FFFFFF", letterSpacing: ".12em", boxShadow: "0 4px 10px rgba(220,38,38,0.40)" },
  loginBackBtn: { width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)", display: "grid", placeItems: "center", cursor: "pointer", backdropFilter: "blur(6px)" },

  loginCard: { position: "relative", margin: "32px 22px 0", padding: "30px 22px 22px", background: "#FFFFFF", borderRadius: 22, boxShadow: "0 20px 50px rgba(0,0,0,0.30)", color: "#0E2C56" },
  loginIconRing: { width: 70, height: 70, borderRadius: "50%", background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", margin: "0 auto 12px", border: "1.5px solid rgba(10,107,207,0.20)" },
  loginIconCircle: { width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#0A6BCF,#0894EA)", display: "grid", placeItems: "center", boxShadow: "0 8px 18px rgba(10,107,207,0.40)" },
  loginTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em", textAlign: "center" },
  loginSub: { fontSize: 12.5, color: "#6B7280", marginTop: 4, textAlign: "center" },

  fieldStack: { display: "flex", flexDirection: "column", gap: 12, marginTop: 22 },
  field: { display: "flex", flexDirection: "column" },
  fieldLabel: { fontSize: 12, color: "#0E2C56", fontWeight: 700, marginBottom: 6 },
  inputWrap: { display: "flex", alignItems: "center", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 10, padding: "11px 12px" },
  verifiedChip: { display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", background: "rgba(24,166,106,0.12)", color: "#0F8A56", borderRadius: 999, fontSize: 9.5, fontWeight: 700 },
  eyeBtn: { width: 24, height: 24, borderRadius: 6, background: "transparent", border: "none", display: "grid", placeItems: "center", cursor: "pointer" },
  fieldFootRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, fontSize: 11 },
  rememberRow: { display: "inline-flex", alignItems: "center", gap: 6, color: "#6B7280", cursor: "pointer" },
  checkbox: { width: 16, height: 16, borderRadius: 4, background: "#0A6BCF", display: "grid", placeItems: "center" },
  forgotLink: { color: "#0A6BCF", textDecoration: "none", fontWeight: 700 },

  primaryBtn: { width: "100%", marginTop: 18, padding: "13px", background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(10,107,207,0.30)" },

  mfaNotice: { display: "flex", alignItems: "flex-start", gap: 6, marginTop: 16, padding: "10px 12px", background: "#F8FBFF", border: "1px dashed #E1E8F0", borderRadius: 10, fontSize: 11.5, color: "#6B7280", lineHeight: 1.5 },

  loginFooter: { position: "relative", marginTop: "auto", padding: "20px 22px 32px", textAlign: "center", color: "rgba(255,255,255,0.65)" },
  loginFooterRow: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10.5 },
  loginFooterMeta: { fontSize: 10, fontFamily: "'JetBrains Mono', monospace", marginTop: 6, opacity: 0.6 },

  // ===== MFA =====
  otpRow: { display: "flex", justifyContent: "center", gap: 7, margin: "22px 0 14px" },
  otpCell: { width: 42, height: 52, borderRadius: 10, background: "#F8FBFF", border: "1.5px solid #E1E8F0", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: "#0E2C56" },
  otpCellFilled: { background: "#FFFFFF", borderColor: "#0A6BCF", boxShadow: "0 0 0 3px rgba(10,107,207,0.12)" },
  otpCellActive: { background: "#FFFFFF", borderColor: "#0A6BCF", boxShadow: "0 0 0 3px rgba(10,107,207,0.18)" },
  otpCursor: { display: "inline-block", width: 2, height: 24, background: "#0A6BCF", animation: "ad-blink 1s infinite" },
  otpTimerRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16, fontSize: 11.5, color: "#6B7280" },
  otpDot: { width: 2, height: 2, borderRadius: "50%", background: "#9CA3AF" },
  otpResend: { color: "#0A6BCF", textDecoration: "none", fontWeight: 700 },
  otpAltBtn: { width: "100%", marginTop: 10, padding: "11px", background: "transparent", color: "#0A6BCF", border: "1px dashed rgba(10,107,207,0.40)", borderRadius: 12, fontWeight: 600, fontSize: 12.5, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },

  // ===== Dashboard =====
  dashWrap: { width: "100%", height: "100%", background: "#F8FBFF", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" },
  dashBody: { flex: 1, overflowY: "auto", padding: "12px 16px 100px" },

  // Header
  dashHeader: { position: "relative", padding: "50px 18px 18px", background: "linear-gradient(165deg, #0E2C56 0%, #0A6BCF 60%, #0894EA 100%)", color: "#FFFFFF", overflow: "hidden", flexShrink: 0 },
  dashHeaderOverlay: { position: "absolute", inset: 0, background: "radial-gradient(circle at 85% 0%, rgba(24,193,255,0.40), transparent 55%)", pointerEvents: "none" },
  dashHeaderGlow: { position: "absolute", left: -60, bottom: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(220,38,38,0.18), transparent 70%)", pointerEvents: "none" },

  dashHeaderTopRow: { position: "relative", display: "flex", alignItems: "center" },
  dashHeaderAv: { width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#F59E0B,#FBBF24)", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 13, border: "2px solid rgba(255,255,255,0.20)", flexShrink: 0 },
  dashHeaderSmall: { fontSize: 10.5, color: "rgba(255,255,255,0.75)", letterSpacing: ".04em", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
  dashHeaderName: { fontFamily: "'Manrope', sans-serif", fontSize: 20, fontWeight: 800, marginTop: 1, letterSpacing: "-0.02em" },
  dashHeaderBtn: { position: "relative", width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.18)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0, marginLeft: 6, backdropFilter: "blur(6px)" },
  dashHeaderBtnBadge: { position: "absolute", top: -4, right: -4, minWidth: 16, height: 16, padding: "0 4px", background: "#DC2626", color: "#FFFFFF", borderRadius: 999, fontSize: 9.5, fontWeight: 800, fontFamily: "'Manrope', sans-serif", display: "grid", placeItems: "center", border: "1.5px solid #0A6BCF" },

  dashHeaderSub: { position: "relative", display: "flex", alignItems: "center", gap: 6, marginTop: 14, fontSize: 11 },
  dashHeaderLive: { display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", background: "rgba(24,166,106,0.30)", border: "1px solid rgba(78,216,150,0.50)", color: "#FFFFFF", borderRadius: 999, fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, fontWeight: 700, letterSpacing: ".08em" },
  dashHeaderLiveDot: { width: 6, height: 6, borderRadius: "50%", background: "#4ED896", boxShadow: "0 0 0 3px rgba(78,216,150,0.40)" },
  dashHeaderBullet: { width: 2, height: 2, borderRadius: "50%", background: "rgba(255,255,255,0.50)" },
  dashHeaderRegion: { color: "rgba(255,255,255,0.85)", fontWeight: 600 },

  shiftCard: { position: "relative", display: "flex", alignItems: "center", gap: 10, marginTop: 14, padding: "10px 12px", background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, backdropFilter: "blur(6px)" },
  shiftIcon: { width: 30, height: 30, borderRadius: 9, background: "rgba(255,255,255,0.18)", display: "grid", placeItems: "center", flexShrink: 0 },
  shiftLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.70)", letterSpacing: ".1em", fontWeight: 700 },
  shiftTime: { fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  shiftElapsed: { fontSize: 11, color: "rgba(255,255,255,0.65)", marginLeft: 4 },
  shiftStatusChip: { display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", background: "rgba(24,166,106,0.30)", color: "#FFFFFF", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: ".02em" },
  shiftStatusDot: { width: 6, height: 6, borderRadius: "50%", background: "#4ED896" },

  // ===== Alerts =====
  alertSection: { marginBottom: 8 },
  alertHead: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 4px 10px" },
  alertHeadLeft: { display: "inline-flex", alignItems: "center", gap: 8 },
  alertHeadTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 17, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em" },
  alertBadgeRed: { padding: "2px 8px", background: "#DC2626", color: "#FFFFFF", borderRadius: 999, fontSize: 10.5, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", boxShadow: "0 4px 10px rgba(220,38,38,0.30)" },
  alertHeadLink: { color: "#0A6BCF", textDecoration: "none", fontSize: 11.5, fontWeight: 700, display: "inline-flex", alignItems: "center" },

  alertCard: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 14px rgba(14,44,86,0.06)" },
  alertSplit: { display: "flex", alignItems: "stretch", padding: "10px 14px", borderBottom: "1px solid #F0F4F9", background: "linear-gradient(135deg, rgba(220,38,38,0.04), rgba(245,158,11,0.04))" },
  alertSplitItem: { flex: 1, display: "inline-flex", alignItems: "center", gap: 6 },
  alertSplitDotRed: { width: 8, height: 8, borderRadius: "50%", background: "#DC2626", boxShadow: "0 0 0 3px rgba(220,38,38,0.20)" },
  alertSplitDotAmber: { width: 8, height: 8, borderRadius: "50%", background: "#F59E0B", boxShadow: "0 0 0 3px rgba(245,158,11,0.25)" },
  alertSplitVal: { fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.01em" },
  alertSplitLabel: { fontSize: 11, color: "#6B7280" },
  alertSplitDiv: { width: 1, background: "#E1E8F0", margin: "0 8px" },

  alertList: {},
  alertRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer" },
  alertRowBorder: { borderBottom: "1px solid #F4F7FB" },
  alertRowIcon: { width: 32, height: 32, borderRadius: 9, display: "grid", placeItems: "center", flexShrink: 0 },
  alertRowLabel: { fontSize: 12.5, fontWeight: 700, color: "#0E2C56" },
  alertRowSub: { fontSize: 10.5, color: "#6B7280", marginTop: 2 },
  alertTimeCol: { display: "flex", alignItems: "center", gap: 4, flexShrink: 0 },
  alertTime: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, fontWeight: 700 },

  // ===== KPIs =====
  sectionLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF", letterSpacing: ".12em", fontWeight: 700, padding: "16px 4px 8px" },
  kpiGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  kpiCard: { padding: "12px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14 },
  kpiTopRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  kpiIcon: { width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center" },
  kpiLiveChip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 7px", background: "rgba(24,166,106,0.12)", color: "#0F8A56", borderRadius: 999, fontSize: 9.5, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".04em" },
  kpiLiveDot: { width: 5, height: 5, borderRadius: "50%", background: "#18A66A", boxShadow: "0 0 0 2px rgba(24,166,106,0.30)" },
  kpiVal: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 22, color: "#0E2C56", letterSpacing: "-0.02em", lineHeight: 1 },
  kpiLabel: { fontSize: 10.5, color: "#6B7280", marginTop: 4, textTransform: "uppercase", letterSpacing: ".04em", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
  kpiDelta: { fontSize: 10.5, marginTop: 8, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },

  // ===== Quick actions =====
  quickGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  quickCard: { position: "relative", padding: "12px 12px 14px", border: "1.5px solid", borderRadius: 14, cursor: "pointer", minHeight: 110 },
  quickTopRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  quickIcon: { width: 32, height: 32, borderRadius: 9, display: "grid", placeItems: "center" },
  quickCountBadge: { padding: "2px 8px", color: "#FFFFFF", borderRadius: 999, fontFamily: "'Manrope', sans-serif", fontSize: 11.5, fontWeight: 800, lineHeight: 1.1 },
  quickTitle: { fontSize: 12.5, fontWeight: 700, color: "#0E2C56", lineHeight: 1.35 },
  quickSub: { fontSize: 10.5, color: "#6B7280", marginTop: 3 },

  // ===== Coverage =====
  coverageCard: { padding: 12, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14 },
  coverageList: { marginTop: 10, display: "flex", flexDirection: "column", gap: 7 },
  covRow: { display: "flex", alignItems: "center", gap: 10 },
  covLabel: { width: 78, fontSize: 11.5, color: "#0E2C56", fontWeight: 600, flexShrink: 0 },
  covTrack: { flex: 1, height: 5, background: "#EEF3F8", borderRadius: 999, overflow: "hidden" },
  covFill: { height: "100%", borderRadius: 999 },
  covActive: { fontSize: 10.5, color: "#6B7280", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, width: 50, textAlign: "right" },
  covLoadBadge: { fontSize: 11, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", width: 38, textAlign: "right" },

  // ===== Feed =====
  feedCard: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, overflow: "hidden" },
  feedRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px" },
  feedRowBorder: { borderBottom: "1px solid #F4F7FB" },
  feedIcon: { width: 24, height: 24, borderRadius: 7, display: "grid", placeItems: "center", flexShrink: 0 },
  feedText: { flex: 1, fontSize: 11.5, color: "#0E2C56" },
  feedTime: { fontSize: 10, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },

  // ===== Tabbar =====
  tabbar: { position: "absolute", left: 0, right: 0, bottom: 0, height: 82, background: "rgba(255,255,255,0.96)", borderTop: "1px solid #E1E8F0", display: "flex", justifyContent: "space-around", alignItems: "flex-start", padding: "10px 4px 24px", backdropFilter: "blur(8px)", zIndex: 5 },
  tabItem: { position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1, padding: "4px 0" },
  tabLabel: { fontSize: 10, marginTop: 1 },
  tabBadge: { position: "absolute", top: -4, right: -8, minWidth: 14, height: 14, padding: "0 4px", background: "#DC2626", color: "#FFFFFF", borderRadius: 999, fontSize: 9, fontWeight: 800, fontFamily: "'Manrope', sans-serif", display: "grid", placeItems: "center", border: "1.5px solid #FFFFFF" },
  tabActiveDot: { position: "absolute", bottom: 2, width: 4, height: 4, borderRadius: "50%", background: "#0A6BCF" },
};

const kf = document.createElement("style");
kf.textContent = `
  @keyframes ad-blink { 50% { opacity: 0; } }
`;
document.head.appendChild(kf);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
