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

// =====================================================================
// LAYOUT PRIMITIVES
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
          <div style={l.heroVer}>v1.0 · MVP</div>
        </div>
        <div style={l.heroTitle}>Component Library</div>
        <div style={l.heroSub}>
          Sistema de componentes reutilizables · cliente · técnico · admin. Para implementación en React Native (mobile) + Next.js + shadcn/ui (web).
        </div>
        <div style={l.heroMetaRow}>
          <span style={l.heroChip}><Ic name="layers" size={11} color="#FFFFFF" /><span>6 secciones</span></span>
          <span style={l.heroChip}><Ic name="component" size={11} color="#FFFFFF" /><span>Sección 1 · Primitives</span></span>
          <span style={l.heroChip}><Ic name="smartphone" size={11} color="#FFFFFF" /><span>Mobile 390px</span></span>
          <span style={l.heroChip}><Ic name="monitor" size={11} color="#FFFFFF" /><span>Desktop 1440px</span></span>
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
        <div style={l.componentTitleCol}>
          <div style={l.componentTitle}>
            <span>{name}</span>
            <span style={l.componentCodeName}>{codeName}</span>
          </div>
          <div style={l.componentDesc}>{desc}</div>
        </div>
        <div style={l.componentLinks}>
          <span style={l.componentLink}>
            <Ic name="link" size={11} color="#0A6BCF" />
            <span>copiar</span>
          </span>
          <span style={l.componentLink}>
            <Ic name="figma" size={11} color="#0A6BCF" />
            <span>figma</span>
          </span>
        </div>
      </div>

      <div style={l.componentGrid}>
        <div style={l.componentMain}>
          {/* Mobile */}
          <div style={l.platformRow}>
            <div style={l.platformLabel}>
              <Ic name="smartphone" size={12} color="#0A6BCF" />
              <span>MOBILE · 390 px</span>
              <span style={l.platformImpl}>React Native</span>
            </div>
          </div>
          <div style={l.platformPanel}>{mobileGrid}</div>

          {/* Desktop */}
          <div style={l.platformRow}>
            <div style={l.platformLabel}>
              <Ic name="monitor" size={12} color="#0A6BCF" />
              <span>DESKTOP · 1440 px</span>
              <span style={l.platformImpl}>Next.js + shadcn/ui</span>
            </div>
          </div>
          <div style={l.platformPanel}>{desktopGrid}</div>
        </div>

        <div style={l.specCard}>
          <div style={l.specHead}>
            <span style={l.specHeadLabel}>SPEC</span>
            <span style={l.specHeadName}>{codeName}</span>
          </div>

          {/* Props */}
          {props && (
            <div style={l.specSection}>
              <div style={l.specSectionLabel}>PROPS</div>
              <div style={l.propsTable}>
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
            </div>
          )}

          {/* Tokens */}
          {tokens && (
            <div style={l.specSection}>
              <div style={l.specSectionLabel}>TOKENS</div>
              <div style={l.tokenList}>
                {tokens.map((t, idx) => (
                  <div key={idx} style={l.tokenRow}>
                    <span style={l.tokenCat}>{t.cat}</span>
                    <span style={l.tokenVal}>{t.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Implementation notes */}
          {notes && (
            <div style={l.specSection}>
              <div style={l.specSectionLabel}>NOTAS DE IMPLEMENTACIÓN</div>
              <ul style={l.notesList}>
                {notes.map((n, idx) => (
                  <li key={idx} style={l.notesItem}>{n}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Use cases */}
          {useCases && (
            <div style={l.specSection}>
              <div style={l.specSectionLabel}>CASOS DE USO</div>
              <div style={l.useCases}>
                {useCases.map((u, idx) => (
                  <div key={idx} style={l.useCaseRow}>
                    <div style={l.useCaseDot} />
                    <span>{u}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VariantLabel({ children, mono = false }) {
  return <div style={{ ...l.variantLabel, fontFamily: mono ? "'JetBrains Mono', monospace" : undefined }}>{children}</div>;
}

// =====================================================================
// 1.1 BUTTON
// =====================================================================
function Btn({ variant = "primary", size = "md", icon, iconRight, loading, disabled, fullWidth, children }) {
  const v = {
    primary:     { bg: "#0A6BCF", color: "#FFFFFF", border: "transparent", shadow: "0 4px 10px rgba(10,107,207,0.25)" },
    secondary:   { bg: "#FFFFFF", color: "#0A6BCF", border: "#0A6BCF",     shadow: "none" },
    ghost:       { bg: "transparent", color: "#0A6BCF", border: "transparent", shadow: "none" },
    destructive: { bg: "#DC2626", color: "#FFFFFF", border: "transparent", shadow: "0 4px 10px rgba(220,38,38,0.25)" },
    success:     { bg: "#18A66A", color: "#FFFFFF", border: "transparent", shadow: "0 4px 10px rgba(24,166,106,0.25)" },
  }[variant];
  const s = {
    sm: { padding: "6px 12px", fontSize: 12.5, iconSize: 12, height: 32 },
    md: { padding: "9px 16px", fontSize: 13.5, iconSize: 14, height: 40 },
    lg: { padding: "12px 22px", fontSize: 14, iconSize: 16, height: 48 },
  }[size];
  return (
    <button style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      gap: 6, padding: s.padding, fontSize: s.fontSize, fontWeight: 700, height: s.height,
      background: disabled ? "#EEF3F8" : v.bg,
      color: disabled ? "#9CA3AF" : v.color,
      border: `1.5px solid ${disabled ? "transparent" : v.border}`,
      borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer",
      boxShadow: disabled ? "none" : v.shadow,
      width: fullWidth ? "100%" : "auto",
      opacity: loading ? 0.85 : 1,
    }}>
      {loading && <span style={{ width: s.iconSize, height: s.iconSize, borderRadius: "50%", border: `2px solid ${disabled ? "#9CA3AF" : v.color}33`, borderTopColor: disabled ? "#9CA3AF" : v.color, animation: "ui-spin 0.9s linear infinite" }} />}
      {!loading && icon && <Ic name={icon} size={s.iconSize} color={disabled ? "#9CA3AF" : v.color} stroke={2.2} />}
      <span>{children}</span>
      {!loading && iconRight && <Ic name={iconRight} size={s.iconSize} color={disabled ? "#9CA3AF" : v.color} stroke={2.2} />}
    </button>
  );
}

function ButtonGrid({ width = 360 }) {
  return (
    <div style={{ ...l.gridWrap, width }}>
      {/* Variant × size matrix */}
      <div style={l.gridSubLabel}>VARIANT × SIZE</div>
      <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr", gap: 10, alignItems: "center" }}>
        <span />
        <VariantLabel mono>sm</VariantLabel>
        <VariantLabel mono>md</VariantLabel>
        <VariantLabel mono>lg</VariantLabel>

        {[
          ["primary",     "primary"],
          ["secondary",   "secondary"],
          ["ghost",       "ghost"],
          ["destructive", "destructive"],
          ["success",     "success"],
        ].map(([variant, label]) => (
          <React.Fragment key={variant}>
            <VariantLabel mono>{label}</VariantLabel>
            <Btn variant={variant} size="sm">Agendar</Btn>
            <Btn variant={variant} size="md">Agendar</Btn>
            <Btn variant={variant} size="lg">Agendar</Btn>
          </React.Fragment>
        ))}
      </div>

      {/* States */}
      <div style={{ ...l.gridSubLabel, marginTop: 22 }}>STATES · md primary</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Btn>Default</Btn>
        <Btn style={{ background: "#0894EA" }}>Hover</Btn>
        <div style={{ position: "relative" }}>
          <Btn>Pressed</Btn>
          <div style={l.pressedHalo} />
        </div>
        <Btn disabled>Disabled</Btn>
        <Btn loading>Procesando</Btn>
      </div>

      {/* Icons */}
      <div style={{ ...l.gridSubLabel, marginTop: 22 }}>ÍCONOS · md</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Btn icon="plus">Nueva orden</Btn>
        <Btn iconRight="arrow-right" variant="secondary">Detalles</Btn>
        <Btn icon="search" variant="ghost">Buscar</Btn>
        <button style={l.iconOnlyBtn}><Ic name="more-vertical" size={16} color="#FFFFFF" /></button>
      </div>

      {/* Full-width */}
      <div style={{ ...l.gridSubLabel, marginTop: 22 }}>FULL-WIDTH · lg · usado en footers sticky</div>
      <Btn size="lg" icon="check" fullWidth>Aprobar cotización</Btn>
    </div>
  );
}

// =====================================================================
// 1.2 INPUT
// =====================================================================
function Input({ icon, label, placeholder, value, hint, error, success, disabled, iconRight, type = "text" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label style={l.inputLabel}>{label}</label>}
      <div style={{
        ...l.inputWrap,
        ...(error ? l.inputWrapError : null),
        ...(success ? l.inputWrapSuccess : null),
        ...(disabled ? l.inputWrapDisabled : null),
      }}>
        {icon && <Ic name={icon} size={14} color={error ? "#DC2626" : "#9CA3AF"} style={{ marginRight: 8 }} />}
        <span style={{ flex: 1, color: value ? "#0E2C56" : "#9CA3AF", fontSize: 13.5, fontWeight: value ? 500 : 400 }}>
          {value || placeholder}
        </span>
        {iconRight && <Ic name={iconRight} size={14} color="#9CA3AF" />}
        {success && <Ic name="check" size={13} color="#0F8A56" stroke={3} />}
        {error && <Ic name="alert-circle" size={13} color="#DC2626" />}
      </div>
      {hint && <div style={{ ...l.inputHint, color: error ? "#DC2626" : success ? "#0F8A56" : "#9CA3AF" }}>{hint}</div>}
    </div>
  );
}

function InputGrid({ width = 360 }) {
  return (
    <div style={{ ...l.gridWrap, width }}>
      <div style={l.gridSubLabel}>STATES</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Default" placeholder="Tu nombre completo" />
        <Input label="Filled" value="Ramón Hernández García" success />
        <Input label="Focused" value="Mariana V|" />
        <Input label="Error" value="33 1234 567" error hint="Faltan dígitos · usa 10" />
        <Input label="Disabled" value="Bloqueado" disabled />
        <Input label="Success" value="HEGR810521..." success hint="Formato válido" />
      </div>

      <div style={{ ...l.gridSubLabel, marginTop: 22 }}>TYPES</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Email" placeholder="tu@correo.mx" icon="mail" />
        <Input label="Password" value="••••••••" icon="lock" iconRight="eye-off" type="password" />
        <Input label="Phone +52" value="33 1234 5678" icon="phone" />
        <Input label="Search" placeholder="Buscar técnico…" icon="search" />
        <Input label="Number" value="$450" icon="dollar-sign" />
        <Input label="Address" placeholder="Calle, colonia, CP" icon="map-pin" hint="Incluye número exterior" />
      </div>
    </div>
  );
}

// =====================================================================
// 1.3 BADGE
// =====================================================================
function Badge({ variant = "default", size = "md", icon, dot, count, children }) {
  const v = {
    default: { bg: "rgba(14,44,86,0.06)",   color: "#0E2C56", dot: "#9CA3AF" },
    info:    { bg: "rgba(24,193,255,0.18)", color: "#0884B0", dot: "#18C1FF" },
    success: { bg: "rgba(24,166,106,0.12)", color: "#0F8A56", dot: "#18A66A" },
    warning: { bg: "rgba(245,158,11,0.14)", color: "#B45309", dot: "#F59E0B" },
    error:   { bg: "rgba(220,38,38,0.10)",  color: "#DC2626", dot: "#DC2626" },
    neutral: { bg: "rgba(14,44,86,0.05)",   color: "#6B7280", dot: "#9CA3AF" },
  }[variant];
  const s = size === "sm"
    ? { padding: "2px 7px", fontSize: 9.5, iconSize: 9 }
    : { padding: "3px 10px", fontSize: 11, iconSize: 11 };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: s.padding, background: v.bg, color: v.color,
      borderRadius: 999, fontSize: s.fontSize, fontWeight: 700,
      fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".04em", textTransform: "uppercase",
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: v.dot }} />}
      {icon && <Ic name={icon} size={s.iconSize} color={v.color} stroke={2.4} />}
      <span>{children}</span>
      {count !== undefined && <span style={{ marginLeft: 2, padding: "0 5px", background: "rgba(255,255,255,0.5)", borderRadius: 999, fontFamily: "'Manrope', sans-serif" }}>{count}</span>}
    </span>
  );
}

function BadgeGrid({ width = 360 }) {
  return (
    <div style={{ ...l.gridWrap, width }}>
      <div style={l.gridSubLabel}>VARIANTS · md</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <Badge variant="default">Categoría</Badge>
        <Badge variant="info" icon="info">Nuevo</Badge>
        <Badge variant="success" icon="badge-check">Verificado</Badge>
        <Badge variant="warning" icon="clock">22 min</Badge>
        <Badge variant="error" icon="x">Cancelado</Badge>
        <Badge variant="neutral">Inactivo</Badge>
      </div>

      <div style={{ ...l.gridSubLabel, marginTop: 18 }}>SIZES</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <Badge variant="success" size="sm" icon="check">SM</Badge>
        <Badge variant="success" size="md" icon="check">MD</Badge>
      </div>

      <div style={{ ...l.gridSubLabel, marginTop: 18 }}>CON DOT (live status)</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <Badge variant="success" dot>En línea</Badge>
        <Badge variant="warning" dot>En camino</Badge>
        <Badge variant="info" dot>En sitio</Badge>
        <Badge variant="error" dot>Disputa</Badge>
      </div>

      <div style={{ ...l.gridSubLabel, marginTop: 18 }}>NOTIFICATION COUNTERS</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <CountBadge n={3} />
        <CountBadge n={12} />
        <CountBadge n="99+" />
        <CountBadge n={3} variant="warning" />
      </div>

      <div style={{ ...l.gridSubLabel, marginTop: 18 }}>CASOS DE USO</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 10, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#0E2C56", fontWeight: 600, flex: 1 }}>Ramón Hernández</span>
          <Badge variant="success" icon="badge-check" size="sm">Verificado</Badge>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#0E2C56", fontWeight: 600, flex: 1 }}>Servicio #SVC-2851</span>
          <Badge variant="warning" icon="truck" dot size="sm">En camino</Badge>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#0E2C56", fontWeight: 600, flex: 1 }}>Mensajes</span>
          <CountBadge n={3} />
        </div>
      </div>
    </div>
  );
}

function CountBadge({ n, variant = "error" }) {
  const map = {
    error: "#DC2626",
    warning: "#F59E0B",
    info: "#0A6BCF",
  };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      minWidth: 20, height: 20, padding: "0 6px",
      background: map[variant], color: "#FFFFFF", borderRadius: 999,
      fontSize: 11, fontWeight: 800, fontFamily: "'Manrope', sans-serif",
      boxShadow: `0 4px 10px ${map[variant]}40`,
    }}>{n}</span>
  );
}

// =====================================================================
// 1.4 AVATAR
// =====================================================================
function Avatar({ size = "md", initials = "RH", tone = 0, verified, online, shape = "circle" }) {
  const sizes = {
    xs:  { box: 24,  font: 10 },
    sm:  { box: 32,  font: 11 },
    md:  { box: 40,  font: 13 },
    lg:  { box: 56,  font: 17 },
    xl:  { box: 96,  font: 30 },
    "2xl":{ box: 120, font: 38 },
  };
  const tones = [
    "linear-gradient(135deg,#0A6BCF,#18C1FF)",
    "linear-gradient(135deg,#F59E0B,#FBBF24)",
    "linear-gradient(135deg,#18A66A,#4ED896)",
    "linear-gradient(135deg,#7C3AED,#A78BFA)",
  ];
  const s = sizes[size];
  return (
    <div style={{ position: "relative", width: s.box, height: s.box, flexShrink: 0 }}>
      <div style={{
        width: s.box, height: s.box,
        borderRadius: shape === "circle" ? "50%" : Math.max(8, s.box * 0.18),
        background: tones[tone % tones.length], color: "#FFFFFF",
        display: "grid", placeItems: "center",
        fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: s.font, letterSpacing: "-0.01em",
      }}>
        {initials}
      </div>
      {verified && (
        <div style={{
          position: "absolute", right: -2, bottom: -2,
          width: Math.max(12, s.box * 0.30), height: Math.max(12, s.box * 0.30),
          borderRadius: "50%", background: "#18A66A",
          border: `${Math.max(1.5, s.box * 0.035)}px solid #FFFFFF`,
          display: "grid", placeItems: "center",
        }}>
          <Ic name="check" size={Math.max(7, s.box * 0.18)} color="#FFFFFF" stroke={3.5} />
        </div>
      )}
      {online && (
        <div style={{
          position: "absolute", right: 0, bottom: 0,
          width: Math.max(8, s.box * 0.22), height: Math.max(8, s.box * 0.22),
          borderRadius: "50%", background: "#18A66A",
          border: `${Math.max(1.5, s.box * 0.035)}px solid #FFFFFF`,
        }} />
      )}
    </div>
  );
}

function AvatarGrid({ width = 360 }) {
  return (
    <div style={{ ...l.gridWrap, width }}>
      <div style={l.gridSubLabel}>SIZES</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
        {[
          { size: "xs", label: "xs · 24" },
          { size: "sm", label: "sm · 32" },
          { size: "md", label: "md · 40" },
          { size: "lg", label: "lg · 56" },
          { size: "xl", label: "xl · 96" },
        ].map(s => (
          <div key={s.size} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <Avatar size={s.size} initials="RH" tone={0} />
            <span style={{ fontSize: 9.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div style={{ ...l.gridSubLabel, marginTop: 22 }}>VARIANTS · lg</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "flex-end" }}>
        <AvatarStat label="Initials" ><Avatar size="lg" initials="RH" /></AvatarStat>
        <AvatarStat label="Tones"><Avatar size="lg" initials="MR" tone={1} /></AvatarStat>
        <AvatarStat label="Verified"><Avatar size="lg" initials="RH" verified /></AvatarStat>
        <AvatarStat label="Online"><Avatar size="lg" initials="LP" tone={2} online /></AvatarStat>
        <AvatarStat label="V+Online"><Avatar size="lg" initials="JC" tone={3} verified online /></AvatarStat>
        <AvatarStat label="Square"><Avatar size="lg" initials="AG" tone={1} shape="square" /></AvatarStat>
      </div>

      <div style={{ ...l.gridSubLabel, marginTop: 22 }}>STACK · GRUPO DE TÉCNICOS</div>
      <div style={{ display: "inline-flex" }}>
        <Avatar size="md" initials="RH" tone={0} />
        <div style={{ marginLeft: -10 }}><Avatar size="md" initials="LP" tone={2} /></div>
        <div style={{ marginLeft: -10 }}><Avatar size="md" initials="JC" tone={3} /></div>
        <div style={{ marginLeft: -10 }}><Avatar size="md" initials="MR" tone={1} /></div>
        <div style={{ marginLeft: -10, width: 40, height: 40, borderRadius: "50%", background: "#EEF3F8", border: "2px solid #FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 11, color: "#0A6BCF" }}>+8</div>
      </div>
    </div>
  );
}

function AvatarStat({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
      {children}
      <span style={{ fontSize: 9.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{label}</span>
    </div>
  );
}

// =====================================================================
// 1.5 CHIP / TAG
// =====================================================================
function Chip({ variant = "default", selected, removable, disabled, icon, children }) {
  const map = {
    default: { bg: selected ? "#0A6BCF" : "#FFFFFF", color: selected ? "#FFFFFF" : "#0E2C56", border: selected ? "#0A6BCF" : "#E1E8F0" },
    filter:  { bg: selected ? "#0A6BCF" : "#FFFFFF", color: selected ? "#FFFFFF" : "#0A6BCF", border: selected ? "#0A6BCF" : "#E1E8F0" },
    static:  { bg: "rgba(14,44,86,0.05)", color: "#6B7280", border: "transparent" },
  };
  const v = map[variant];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "5px 11px", borderRadius: 999,
      background: disabled ? "#F4F7FB" : v.bg,
      color: disabled ? "#9CA3AF" : v.color,
      border: `1.5px solid ${disabled ? "#E1E8F0" : v.border}`,
      fontSize: 11.5, fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.65 : 1,
      boxShadow: selected && variant !== "static" ? "0 4px 10px rgba(10,107,207,0.25)" : "none",
    }}>
      {icon && <Ic name={icon} size={11} color={disabled ? "#9CA3AF" : v.color} stroke={2.2} />}
      <span>{children}</span>
      {selected && variant !== "static" && <Ic name="check" size={11} color="#FFFFFF" stroke={3} />}
      {removable && <Ic name="x" size={11} color={v.color} stroke={2.5} />}
    </span>
  );
}

function ChipGrid({ width = 360 }) {
  return (
    <div style={{ ...l.gridWrap, width }}>
      <div style={l.gridSubLabel}>FILTER · TOGGLE</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <Chip variant="filter" selected icon="wrench">Plomería</Chip>
        <Chip variant="filter" icon="zap">Electricidad</Chip>
        <Chip variant="filter" icon="flame">Gas</Chip>
        <Chip variant="filter" icon="paint-roller">Pintura</Chip>
      </div>

      <div style={{ ...l.gridSubLabel, marginTop: 18 }}>SELECTABLE (positivos)</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <Chip variant="default" selected icon="thumbs-up">Recomendaría</Chip>
        <Chip variant="default" icon="clock">Puntual</Chip>
        <Chip variant="default" selected icon="sparkles">Limpio</Chip>
        <Chip variant="default" icon="message-circle">Buena comunicación</Chip>
      </div>

      <div style={{ ...l.gridSubLabel, marginTop: 18 }}>REMOVABLE</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <Chip variant="default" removable icon="map-pin">Providencia</Chip>
        <Chip variant="default" removable icon="map-pin">Vallarta</Chip>
        <Chip variant="default" removable icon="map-pin">Chapalita</Chip>
      </div>

      <div style={{ ...l.gridSubLabel, marginTop: 18 }}>STATIC · INFO</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <Chip variant="static" icon="hash">SVC-2851</Chip>
        <Chip variant="static" icon="calendar">Hoy 3 PM</Chip>
        <Chip variant="static" icon="user">214 reseñas</Chip>
      </div>

      <div style={{ ...l.gridSubLabel, marginTop: 18 }}>DISABLED</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <Chip variant="filter" disabled icon="award">Certificado Gas</Chip>
        <Chip variant="default" disabled icon="snowflake">Climatización</Chip>
      </div>
    </div>
  );
}

// =====================================================================
// 1.6 ICON BUTTON
// =====================================================================
function IconBtn({ variant = "ghost", size = "md", icon, disabled }) {
  const sizes = {
    sm: 32, md: 40, lg: 48,
  };
  const iconSizes = { sm: 15, md: 17, lg: 20 };
  const map = {
    ghost:    { bg: "transparent", color: "#0E2C56", border: "transparent", hover: "#F8FBFF" },
    filled:   { bg: "#0A6BCF",     color: "#FFFFFF", border: "transparent", hover: "#0894EA" },
    outlined: { bg: "#FFFFFF",     color: "#0E2C56", border: "#E1E8F0",     hover: "#F8FBFF" },
  };
  const v = map[variant];
  const px = sizes[size];
  return (
    <button style={{
      width: px, height: px, borderRadius: 11,
      background: disabled ? "#F4F7FB" : v.bg,
      color: disabled ? "#9CA3AF" : v.color,
      border: `1px solid ${disabled ? "#E1E8F0" : v.border}`,
      display: "grid", placeItems: "center",
      cursor: disabled ? "not-allowed" : "pointer",
      boxShadow: variant === "filled" && !disabled ? "0 4px 10px rgba(10,107,207,0.25)" : "none",
    }}>
      <Ic name={icon} size={iconSizes[size]} color={disabled ? "#9CA3AF" : v.color} />
    </button>
  );
}

function IconButtonGrid({ width = 360 }) {
  return (
    <div style={{ ...l.gridWrap, width }}>
      <div style={l.gridSubLabel}>VARIANT × SIZE</div>
      <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr 1fr", gap: 12, alignItems: "center" }}>
        <span />
        <VariantLabel mono>sm · 32</VariantLabel>
        <VariantLabel mono>md · 40</VariantLabel>
        <VariantLabel mono>lg · 48</VariantLabel>

        {[["ghost", "ghost"], ["outlined", "outlined"], ["filled", "filled"]].map(([v]) => (
          <React.Fragment key={v}>
            <VariantLabel mono>{v}</VariantLabel>
            <IconBtn variant={v} size="sm" icon="more-vertical" />
            <IconBtn variant={v} size="md" icon="more-vertical" />
            <IconBtn variant={v} size="lg" icon="more-vertical" />
          </React.Fragment>
        ))}
      </div>

      <div style={{ ...l.gridSubLabel, marginTop: 22 }}>STATES · md outlined</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <IconBtn variant="outlined" icon="bell" />
        <IconBtn variant="outlined" disabled icon="bell" />
        <span style={{ fontSize: 11, color: "#9CA3AF" }}>default · disabled</span>
      </div>

      <div style={{ ...l.gridSubLabel, marginTop: 22 }}>USOS COMUNES</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", padding: 10, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12 }}>
        <IconBtn variant="outlined" size="md" icon="arrow-left" />
        <span style={{ flex: 1, fontFamily: "'Manrope', sans-serif", fontWeight: 800, color: "#0E2C56", fontSize: 14 }}>Detalle del servicio</span>
        <IconBtn variant="outlined" size="md" icon="share-2" />
        <IconBtn variant="outlined" size="md" icon="more-vertical" />
      </div>
    </div>
  );
}

// =====================================================================
// 1.7 STAR RATING
// =====================================================================
function StarRating({ value = 0, total = 5, size = 14, color = "#F59E0B", interactive }) {
  return (
    <span style={{ display: "inline-flex", gap: interactive ? 4 : 1 }}>
      {[...Array(total)].map((_, n) => (
        <span key={n} style={{ filter: interactive && n < value ? "drop-shadow(0 2px 4px rgba(245,158,11,0.40))" : "none" }}>
          <svg width={size} height={size} viewBox="0 0 24 24">
            <path d="M12 2.5l2.95 6.42 7.05.78-5.28 4.78 1.52 6.92L12 18.27l-6.24 3.13 1.52-6.92L2 9.7l7.05-.78L12 2.5z" fill={n < value ? color : "#E1E8F0"} stroke={n < value ? color : "#D1D9E2"} strokeWidth="1" />
          </svg>
        </span>
      ))}
    </span>
  );
}

function StarRatingGrid({ width = 360 }) {
  const ratingLabels = [
    { stars: 1, label: "Muy mal",   color: "#DC2626" },
    { stars: 2, label: "Mal",       color: "#EA580C" },
    { stars: 3, label: "Regular",   color: "#B45309" },
    { stars: 4, label: "Bien",      color: "#0F8A56" },
    { stars: 5, label: "Excelente", color: "#0F8A56" },
  ];
  return (
    <div style={{ ...l.gridWrap, width }}>
      <div style={l.gridSubLabel}>DISPLAY MODE · READ-ONLY</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10 }}>
          <StarRating value={5} size={12} />
          <b style={{ fontSize: 12, color: "#0E2C56", fontWeight: 700 }}>4.9</b>
          <span style={{ fontSize: 11, color: "#9CA3AF" }}>(214)</span>
          <span style={{ marginLeft: "auto", fontSize: 9.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>SM</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10 }}>
          <StarRating value={4} size={16} />
          <b style={{ fontSize: 14, color: "#0E2C56", fontWeight: 700 }}>4.2</b>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>(87)</span>
          <span style={{ marginLeft: "auto", fontSize: 9.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>MD</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10, gridColumn: "1 / -1" }}>
          <StarRating value={5} size={22} />
          <b style={{ fontSize: 20, color: "#0E2C56", fontWeight: 800, fontFamily: "'Manrope', sans-serif", letterSpacing: "-0.01em" }}>4.8</b>
          <span style={{ fontSize: 13, color: "#9CA3AF" }}>· 124 reseñas</span>
          <span style={{ marginLeft: "auto", fontSize: 9.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>LG</span>
        </div>
      </div>

      <div style={{ ...l.gridSubLabel, marginTop: 22 }}>INTERACTIVE · INPUT</div>
      <div style={{ padding: "18px 16px", background: "#FFFFFF", border: "1.5px solid #0A6BCF", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, boxShadow: "0 4px 14px rgba(10,107,207,0.10)" }}>
        <StarRating value={5} size={40} interactive />
        <span style={{ padding: "5px 12px", background: "rgba(24,166,106,0.14)", color: "#0F8A56", borderRadius: 999, fontSize: 12, fontWeight: 800 }}>
          ★ Excelente
        </span>
      </div>

      <div style={{ ...l.gridSubLabel, marginTop: 22 }}>LABELS DINÁMICOS · POR PUNTAJE</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {ratingLabels.map(r => (
          <div key={r.stars} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StarRating value={r.stars} size={14} />
            <span style={{ fontSize: 11.5, color: r.color, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{r.stars}★</span>
            <span style={{ fontSize: 12, color: "#0E2C56", fontWeight: 600 }}>{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================================
// HANDOFF NOTES
// =====================================================================
function HandoffNotes() {
  return (
    <div style={l.handoffSection}>
      <div style={l.handoffHead}>
        <div style={l.handoffIcon}><Ic name="package" size={18} color="#FFFFFF" /></div>
        <div>
          <div style={l.handoffTitle}>Handoff · Sección 1 lista</div>
          <div style={l.handoffSub}>7 primitives documentados · listos para Claude Code</div>
        </div>
        <span style={l.handoffChip}>SECCIÓN 1 / 6</span>
      </div>

      <div style={l.handoffGrid}>
        <div style={l.handoffCard}>
          <div style={l.handoffCardLabel}>COMPONENTES ENVIADOS</div>
          <ul style={l.handoffList}>
            <li><b>Button</b> · 5 variants × 3 sizes × 5 states</li>
            <li><b>Input</b> · 6 types × 6 states</li>
            <li><b>Badge</b> · 6 variants + counter</li>
            <li><b>Avatar</b> · 6 sizes + verified/online/square</li>
            <li><b>Chip</b> · filter / selectable / removable / static</li>
            <li><b>IconButton</b> · 3 variants × 3 sizes</li>
            <li><b>StarRating</b> · display + interactive</li>
          </ul>
        </div>

        <div style={l.handoffCard}>
          <div style={l.handoffCardLabel}>CARPETAS SUGERIDAS</div>
          <div style={l.handoffCode}>
            <div><span style={l.codeMuted}>{/* shadcn primitives */}</span></div>
            <div><b>/components/ui/</b></div>
            <div>{"  button.tsx"}</div>
            <div>{"  input.tsx"}</div>
            <div>{"  badge.tsx"}</div>
            <div>{"  avatar.tsx"}</div>
            <div>{"  chip.tsx"}</div>
            <div>{"  icon-button.tsx"}</div>
            <div>{"  star-rating.tsx"}</div>
            <div style={{ marginTop: 8 }}><span style={l.codeMuted}>{/* design tokens */}</span></div>
            <div><b>/lib/tokens.ts</b></div>
          </div>
        </div>

        <div style={l.handoffCard}>
          <div style={l.handoffCardLabel}>DEPENDENCIAS CLAVE</div>
          <ul style={l.handoffList}>
            <li><code>lucide-react</code> · iconografía web</li>
            <li><code>lucide-react-native</code> · iconografía mobile</li>
            <li><code>shadcn/ui</code> · button, input, badge primitives</li>
            <li><code>tailwindcss</code> · tokens en theme.extend</li>
            <li><code>class-variance-authority</code> · variants tipadas</li>
            <li><code>react-native-svg</code> · estrellas e ilustraciones</li>
          </ul>
        </div>

        <div style={l.handoffCard}>
          <div style={l.handoffCardLabel}>SIGUIENTES SECCIONES</div>
          <ol style={l.handoffOl}>
            <li>✓ <b>Primitives</b> — átomos (esta sección)</li>
            <li style={{ color: "#0A6BCF", fontWeight: 700 }}>→ Containers · moléculas (próxima)</li>
            <li>Navigation — bottom tabs · top bar · sidebar</li>
            <li>Forms — selects · pickers · uploads</li>
            <li>Data Display — tables · KPIs · timeline</li>
            <li>Domain-specific — Tech card · Status · Price · Chat</li>
          </ol>
        </div>
      </div>

      <div style={l.handoffNextStep}>
        <Ic name="hand" size={13} color="#0A6BCF" />
        <span>Avísame cuando estés listo y avanzamos con <b style={{ color: "#0E2C56", fontWeight: 800 }}>Sección 2 · Containers</b> (Card, ListItem, EmptyState, Loading, Alert).</span>
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

      <SectionHeader num="01" title="Primitives" sub="Átomos · los building blocks más pequeños del sistema. Todo lo demás se construye encima." />

      <ComponentBlock
        id="button"
        name="Button"
        codeName="<Button />"
        desc="CTA principal del sistema. 5 variantes semánticas, 3 tamaños y soporte para íconos."
        mobileGrid={<ButtonGrid width={360} />}
        desktopGrid={<ButtonGrid width={720} />}
        props={[
          { name: "variant", type: "primary | secondary | ghost | destructive | success", default: "primary" },
          { name: "size",    type: "sm | md | lg",                                          default: "md" },
          { name: "leftIcon", type: "LucideIcon",                                            default: "—" },
          { name: "rightIcon", type: "LucideIcon",                                           default: "—" },
          { name: "loading", type: "boolean",                                                default: "false" },
          { name: "disabled", type: "boolean",                                               default: "false" },
          { name: "fullWidth", type: "boolean",                                              default: "false" },
          { name: "onClick", type: "() => void",                                             default: "—", required: true },
        ]}
        tokens={[
          { cat: "color",   val: "primary-blue · #0A6BCF" },
          { cat: "radius",  val: "10px (lg-md), 8px (sm)" },
          { cat: "spacing", val: "py 6/9/12 · px 12/16/22" },
          { cat: "shadow",  val: "0 4px 10px / 25% (primary only)" },
          { cat: "type",    val: "Inter 700 · 12.5/13.5/14" },
        ]}
        notes={[
          "Mobile: usa Pressable de React Native con haptic feedback medium en variant primary/destructive.",
          "Web: extiende Button de shadcn/ui vía cva. Mantén className composable.",
          "Touch target mínimo 44px (size lg cumple; sm requiere padding hit-slop).",
          "Estado loading reemplaza ícono izquierdo con spinner, mantiene el ancho del botón."
        ]}
        useCases={[
          "Primary · CTA dominante por pantalla ('Agendar', 'Aprobar cotización')",
          "Secondary · acción alterna importante ('Ver detalles')",
          "Ghost · navegación o acciones suaves ('Cancelar', 'Más tarde')",
          "Destructive · cancelar servicio, eliminar cuenta",
          "Success · confirmar pago efectivo bilateral",
        ]}
      />

      <ComponentBlock
        id="input"
        name="Input"
        codeName="<Input />"
        desc="Campo de texto base. Label arriba (no flotante), 6 tipos, validación inline con hint y estado."
        mobileGrid={<InputGrid width={360} />}
        desktopGrid={<InputGrid width={720} />}
        props={[
          { name: "type",        type: "text | email | password | number | phone | search", default: "text" },
          { name: "label",       type: "string",                                              default: "—" },
          { name: "placeholder", type: "string",                                              default: "—" },
          { name: "value",       type: "string",                                              default: "—", required: true },
          { name: "helperText",  type: "string",                                              default: "—" },
          { name: "error",       type: "boolean | string",                                    default: "false" },
          { name: "success",     type: "boolean",                                             default: "false" },
          { name: "leftIcon",    type: "LucideIcon",                                          default: "—" },
          { name: "rightIcon",   type: "LucideIcon",                                          default: "—" },
          { name: "disabled",    type: "boolean",                                             default: "false" },
        ]}
        tokens={[
          { cat: "color border",  val: "#E1E8F0 default · #0A6BCF focus · #DC2626 error" },
          { cat: "focus ring",    val: "0 0 0 3px rgba(10,107,207,.15)" },
          { cat: "radius",        val: "10px" },
          { cat: "spacing",       val: "py 11 · px 12-14" },
          { cat: "type",          val: "Inter 500 · 13.5" },
        ]}
        notes={[
          "Decisión: label ARRIBA (no flotante). Más accesible, sin glitches con autofill.",
          "Mobile: usa TextInput con autoCapitalize/autoComplete según type.",
          "Phone: prefijo +52 fijo en MX (no editable). Validación de 10 dígitos.",
          "Password: toggle eye-off / eye con IconBtn ghost al final.",
        ]}
        useCases={[
          "Onboarding: nombre, email, teléfono, CURP, RFC",
          "Búsqueda: técnico, servicio, ID en admin",
          "Forms de servicio: dirección, descripción del problema",
          "Edición de perfil con prefilled values",
        ]}
      />

      <ComponentBlock
        id="badge"
        name="Badge"
        codeName="<Badge />"
        desc="Etiqueta semántica corta. 6 variants vinculados a la jerarquía cromática del sistema."
        mobileGrid={<BadgeGrid width={360} />}
        desktopGrid={<BadgeGrid width={720} />}
        props={[
          { name: "variant", type: "default | info | success | warning | error | neutral", default: "default" },
          { name: "size",    type: "sm | md",                                                default: "md" },
          { name: "icon",    type: "LucideIcon",                                              default: "—" },
          { name: "dot",     type: "boolean",                                                 default: "false" },
          { name: "count",   type: "number | string",                                         default: "—" },
        ]}
        tokens={[
          { cat: "radius",    val: "999 (pill)" },
          { cat: "type",      val: "JetBrains Mono 700 · 9.5/11 · uppercase ·.04em" },
          { cat: "color rule", val: "verde solo verificación · ámbar solo urgencia" },
        ]}
        notes={[
          "REGLA ESTRICTA del sistema: success/warning están reservados. No usar success por estética.",
          "CountBadge para notificaciones (rojo, white text, sin uppercase, fuente Manrope).",
          "Dot version para estados live (en línea, en camino). Acompaña con pulse animation opcional.",
          "Web: shadcn Badge component es buena base, extiende con cva.",
        ]}
        useCases={[
          "Verificación de identidad (success: ✓ Verificado)",
          "Urgencia de servicio (warning: En camino, ⏱ 22 min)",
          "Errores/cancelaciones (error: Cancelado, Disputa)",
          "Counters: chats no leídos, alertas admin",
          "Categorías neutras: tipo de servicio, tag estático",
        ]}
      />

      <ComponentBlock
        id="avatar"
        name="Avatar"
        codeName="<Avatar />"
        desc="Avatar circular o cuadrado con initials fallback. Indicadores de verificación y online opcionales."
        mobileGrid={<AvatarGrid width={360} />}
        desktopGrid={<AvatarGrid width={720} />}
        props={[
          { name: "src",       type: "string",                                          default: "—" },
          { name: "initials",  type: "string",                                          default: "—", required: true },
          { name: "size",      type: "xs | sm | md | lg | xl | 2xl",                    default: "md" },
          { name: "shape",     type: "circle | square",                                 default: "circle" },
          { name: "tone",      type: "number (0-3)",                                    default: "0" },
          { name: "verified",  type: "boolean",                                         default: "false" },
          { name: "online",    type: "boolean",                                         default: "false" },
        ]}
        tokens={[
          { cat: "sizes px",  val: "24 / 32 / 40 / 56 / 96 / 120" },
          { cat: "type",      val: "Manrope 700 · 10/11/13/17/30/38" },
          { cat: "verified",  val: "Success Green 18A66A · 30% del box" },
          { cat: "online",    val: "Success Green 22% del box · 2px white border" },
        ]}
        notes={[
          "Initials = primer letra de nombre y apellido (RH, MR). Max 2 chars.",
          "Tones gradient evitan el típico color-from-hash; rotamos sobre 4 paletas brand.",
          "Verified badge solo si el técnico/cliente está KYC-aprobado.",
          "Stack: overlap -10px, white 2px border entre avatars, +N circle al final.",
        ]}
        useCases={[
          "Lista de técnicos verificados (md + verified)",
          "Inbox de chats (md + online)",
          "Hero de perfil (xl o 2xl + verified)",
          "Equipo asignado: stack de 3-4 + counter",
          "Mensajes en chat (xs o sm sin badge)",
        ]}
      />

      <ComponentBlock
        id="chip"
        name="Chip"
        codeName="<Chip />"
        desc="Etiqueta interactiva tipo pill. Filtros, multi-select, removable o estática."
        mobileGrid={<ChipGrid width={360} />}
        desktopGrid={<ChipGrid width={720} />}
        props={[
          { name: "variant",   type: "default | filter | static",        default: "default" },
          { name: "selected",  type: "boolean",                          default: "false" },
          { name: "removable", type: "boolean",                          default: "false" },
          { name: "icon",      type: "LucideIcon",                       default: "—" },
          { name: "disabled",  type: "boolean",                          default: "false" },
          { name: "onPress",   type: "() => void",                       default: "—" },
        ]}
        tokens={[
          { cat: "padding",   val: "5px 11px" },
          { cat: "radius",    val: "999 (pill)" },
          { cat: "type",      val: "Inter 600 · 11.5" },
          { cat: "selected",  val: "bg primary-blue · shadow 0 4px 10px / 25%" },
        ]}
        notes={[
          "filter chips → bottom sheet de filtros (admin / inbox cliente)",
          "default chips → multi-select de etiquetas (calificación, categorías servicio)",
          "removable → addresses, colonias, tags personalizadas",
          "Touch target: 32px height + hit-slop 8px en mobile.",
        ]}
        useCases={[
          "Filtros en bandeja de mensajes (Todos, Activos, No leídos)",
          "Categorías de servicio en onboarding técnico",
          "Etiquetas positivas/negativas post-servicio",
          "Colonias de cobertura (removable)",
          "Tipos de extra al cotizar (Cambio de llave, Sellado)",
        ]}
      />

      <ComponentBlock
        id="icon-button"
        name="IconButton"
        codeName="<IconButton />"
        desc="Botón cuadrado con solo ícono. Usado en headers, toolbars, kebabs, map controls."
        mobileGrid={<IconButtonGrid width={360} />}
        desktopGrid={<IconButtonGrid width={720} />}
        props={[
          { name: "icon",     type: "LucideIcon",                  default: "—", required: true },
          { name: "variant",  type: "ghost | filled | outlined",   default: "ghost" },
          { name: "size",     type: "sm | md | lg",                default: "md" },
          { name: "disabled", type: "boolean",                     default: "false" },
          { name: "label",    type: "string (a11y)",               default: "—", required: true },
          { name: "onPress",  type: "() => void",                  default: "—", required: true },
        ]}
        tokens={[
          { cat: "sizes",  val: "32 · 40 · 48 (square)" },
          { cat: "radius", val: "11px" },
          { cat: "border", val: "1px hairline · outlined only" },
        ]}
        notes={[
          "Requiere aria-label / accessibilityLabel SIEMPRE — no hay texto visible.",
          "filled: solo para acciones únicas dominantes (FAB, mic en chat).",
          "outlined: default para headers (back, share, more, search).",
          "ghost: barras donde el icono debe sentirse 'flotante' (modal close, dismiss).",
        ]}
        useCases={[
          "Header de detalle: back / share / more-vertical",
          "Kebab menu en list items",
          "Toolbar map: zoom-in, locate, layers",
          "Composer chat: attachment, send (filled)",
          "Empty state actions: skip, close",
        ]}
      />

      <ComponentBlock
        id="star-rating"
        name="StarRating"
        codeName="<StarRating />"
        desc="Calificación con estrellas. Modo display (lectura) e interactive (input post-servicio)."
        mobileGrid={<StarRatingGrid width={360} />}
        desktopGrid={<StarRatingGrid width={720} />}
        props={[
          { name: "value",       type: "number (0-5)",                  default: "0", required: true },
          { name: "total",       type: "number",                        default: "5" },
          { name: "size",        type: "sm (12) | md (16) | lg (22) | xl (40)", default: "md" },
          { name: "interactive", type: "boolean",                       default: "false" },
          { name: "onChange",    type: "(n: number) => void",           default: "—" },
          { name: "showCount",   type: "boolean",                       default: "false" },
        ]}
        tokens={[
          { cat: "color filled", val: "Warning Amber #F59E0B" },
          { cat: "color empty",  val: "Hairline #E1E8F0 stroke / fill #FFFFFF" },
          { cat: "shadow active", val: "drop-shadow 0 2px 6px amber-40%" },
        ]}
        notes={[
          "Warning Amber es la ÚNICA excepción cromática permitida fuera de urgencia.",
          "Interactive: tap fills hasta esa estrella (1-5). Hover preview en desktop.",
          "Labels dinámicos: 1-2 rojo/naranja, 3 ámbar, 4-5 verde.",
          "SVG inline (no Lucide star) para controlar shadow + stroke con precisión.",
        ]}
        useCases={[
          "Display: lista de técnicos · perfil · reseñas",
          "Display lg + count: hero de perfil ('4.8 · 124 reseñas')",
          "Input xl: pantalla de calificar técnico post-servicio",
          "Input md: filtros (rating mínimo en búsqueda)",
        ]}
      />

      <HandoffNotes />
    </div>
  );
}

const l = {
  canvas: { maxWidth: 1440, margin: "0 auto", padding: "0 0 80px", background: "#F4F6FA" },

  // Hero
  hero: { position: "relative", padding: "60px 48px 56px", color: "#FFFFFF", overflow: "hidden" },
  heroBg: { position: "absolute", inset: 0, background: "linear-gradient(165deg, #0A1B36 0%, #0E2C56 50%, #0A6BCF 100%)", zIndex: 0 },
  heroGlow1: { position: "absolute", right: -100, top: -80, width: 380, height: 380, background: "radial-gradient(circle, rgba(24,193,255,0.40), transparent 65%)" },
  heroGlow2: { position: "absolute", left: -100, bottom: 0, width: 320, height: 320, background: "radial-gradient(circle, rgba(245,158,11,0.20), transparent 65%)" },
  heroInner: { position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto" },
  heroTopRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  heroLogo: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em" },
  heroLogoPro: { padding: "2px 8px", background: "#F59E0B", color: "#FFFFFF", borderRadius: 4, fontSize: 11, fontWeight: 800, letterSpacing: ".06em", marginLeft: 6, verticalAlign: "middle" },
  heroVer: { padding: "4px 11px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.20)", borderRadius: 999, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: ".06em" },
  heroTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 52, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05 },
  heroSub: { fontSize: 16, color: "rgba(255,255,255,0.82)", marginTop: 14, maxWidth: 700, lineHeight: 1.55 },
  heroMetaRow: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 22 },
  heroChip: { display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.20)", borderRadius: 999, fontSize: 11.5, fontWeight: 600 },

  // Section header
  sectionHeader: { display: "flex", alignItems: "center", gap: 18, padding: "48px 48px 22px" },
  sectionHeaderLeft: { display: "flex", alignItems: "center", gap: 14 },
  sectionNum: { width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#0A6BCF,#0894EA)", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em", boxShadow: "0 8px 20px rgba(10,107,207,0.30)" },
  sectionTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 32, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.03em", lineHeight: 1.1 },
  sectionSub: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  sectionLine: { flex: 1, height: 1, background: "linear-gradient(90deg, rgba(10,107,207,0.30), transparent)" },

  // Component block
  componentBlock: { margin: "32px 48px", padding: 0, background: "transparent" },
  componentTopRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16, padding: "0 4px" },
  componentTitleCol: {},
  componentTitle: { display: "flex", alignItems: "baseline", gap: 12, fontFamily: "'Manrope', sans-serif", fontSize: 26, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em" },
  componentCodeName: { fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#0A6BCF", fontWeight: 600, padding: "3px 9px", background: "rgba(10,107,207,0.08)", borderRadius: 6 },
  componentDesc: { fontSize: 13.5, color: "#6B7280", marginTop: 6, maxWidth: 560 },
  componentLinks: { display: "flex", gap: 8 },
  componentLink: { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 8, fontSize: 11, color: "#0A6BCF", fontWeight: 600, cursor: "pointer" },

  componentGrid: { display: "grid", gridTemplateColumns: "1fr 380px", gap: 18, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 18px rgba(14,44,86,0.06)" },
  componentMain: { padding: "22px 24px" },

  platformRow: { display: "flex", alignItems: "center", gap: 10, padding: "8px 0 14px", marginTop: 8 },
  platformLabel: { display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", background: "rgba(10,107,207,0.08)", border: "1px solid rgba(10,107,207,0.18)", borderRadius: 8, fontSize: 10.5, color: "#0A6BCF", fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".08em", fontWeight: 700 },
  platformImpl: { fontSize: 10, color: "#6B7280", padding: "1px 7px", background: "#FFFFFF", borderRadius: 4, fontWeight: 600 },
  platformPanel: { padding: "20px", background: "#F8FBFF", border: "1px dashed #C8D4E0", borderRadius: 12 },

  // Grid wrap
  gridWrap: { display: "flex", flexDirection: "column" },
  gridSubLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#0A6BCF", letterSpacing: ".12em", fontWeight: 700, marginBottom: 10 },
  variantLabel: { fontSize: 10.5, color: "#9CA3AF", fontWeight: 600 },
  pressedHalo: { position: "absolute", inset: -3, borderRadius: 14, border: "2px solid rgba(10,107,207,0.30)", pointerEvents: "none" },
  iconOnlyBtn: { width: 40, height: 40, borderRadius: 10, background: "#0A6BCF", border: "none", display: "grid", placeItems: "center", cursor: "pointer", boxShadow: "0 4px 10px rgba(10,107,207,0.25)" },

  // Inputs
  inputLabel: { fontSize: 11.5, color: "#0E2C56", fontWeight: 700 },
  inputWrap: { display: "flex", alignItems: "center", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10, padding: "10px 12px" },
  inputWrapError: { borderColor: "#DC2626", boxShadow: "0 0 0 3px rgba(220,38,38,0.10)" },
  inputWrapSuccess: { borderColor: "#18A66A", boxShadow: "0 0 0 3px rgba(24,166,106,0.10)" },
  inputWrapDisabled: { background: "#F4F7FB", borderColor: "#E1E8F0" },
  inputHint: { fontSize: 10.5, marginTop: 2 },

  // Spec card
  specCard: { background: "#FBFCFE", borderLeft: "1px solid #E1E8F0", padding: "22px 22px", display: "flex", flexDirection: "column", gap: 18 },
  specHead: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: "1px solid #E1E8F0" },
  specHeadLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF", letterSpacing: ".12em", fontWeight: 700 },
  specHeadName: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#0A6BCF", fontWeight: 700, padding: "2px 8px", background: "rgba(10,107,207,0.08)", borderRadius: 6 },
  specSection: {},
  specSectionLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#0A6BCF", letterSpacing: ".12em", fontWeight: 700, marginBottom: 8 },

  propsTable: {},
  propsHead: { display: "flex", gap: 6, padding: "6px 0", borderBottom: "1px solid #F0F4F9", fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#9CA3AF", letterSpacing: ".06em", fontWeight: 700 },
  propsRow: { display: "flex", gap: 6, padding: "6px 0", borderBottom: "1px solid #F4F7FB" },
  propName: { flex: 1.4, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#0E2C56", fontWeight: 700 },
  propReq: { color: "#DC2626", marginLeft: 2 },
  propType: { flex: 1.2, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#0A6BCF", lineHeight: 1.4, wordBreak: "break-word" },
  propDefault: { flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#6B7280" },

  tokenList: { display: "flex", flexDirection: "column", gap: 5 },
  tokenRow: { display: "flex", gap: 8, padding: "4px 0", fontSize: 11 },
  tokenCat: { width: 80, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: 10 },
  tokenVal: { flex: 1, color: "#0E2C56", fontWeight: 500, fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5 },

  notesList: { margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 },
  notesItem: { position: "relative", paddingLeft: 14, fontSize: 11.5, color: "#6B7280", lineHeight: 1.5 },

  useCases: { display: "flex", flexDirection: "column", gap: 5 },
  useCaseRow: { display: "flex", alignItems: "flex-start", gap: 8, fontSize: 11.5, color: "#0E2C56", lineHeight: 1.45 },
  useCaseDot: { width: 4, height: 4, borderRadius: "50%", background: "#0A6BCF", marginTop: 7, flexShrink: 0 },

  // Handoff
  handoffSection: { margin: "48px 48px 0", padding: 32, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 20, boxShadow: "0 6px 20px rgba(14,44,86,0.06)" },
  handoffHead: { display: "flex", alignItems: "center", gap: 14, marginBottom: 24 },
  handoffIcon: { width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#0A6BCF,#0894EA)", display: "grid", placeItems: "center", boxShadow: "0 6px 14px rgba(10,107,207,0.30)" },
  handoffTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 20, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em" },
  handoffSub: { fontSize: 12.5, color: "#6B7280", marginTop: 3 },
  handoffChip: { marginLeft: "auto", padding: "4px 11px", background: "rgba(10,107,207,0.10)", color: "#0A6BCF", borderRadius: 999, fontSize: 10.5, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".06em" },

  handoffGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  handoffCard: { padding: 16, background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 12 },
  handoffCardLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#0A6BCF", letterSpacing: ".12em", fontWeight: 700, marginBottom: 10 },
  handoffList: { margin: 0, paddingLeft: 16, fontSize: 12, color: "#0E2C56", lineHeight: 1.7 },
  handoffOl: { margin: 0, paddingLeft: 18, fontSize: 12, color: "#6B7280", lineHeight: 1.7 },
  handoffCode: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#0E2C56", lineHeight: 1.6 },
  codeMuted: { color: "#9CA3AF" },

  handoffNextStep: { display: "flex", alignItems: "center", gap: 8, marginTop: 16, padding: "12px 14px", background: "rgba(10,107,207,0.05)", border: "1px dashed rgba(10,107,207,0.25)", borderRadius: 10, fontSize: 12.5, color: "#6B7280", lineHeight: 1.5 },
};

const kf = document.createElement("style");
kf.textContent = `@keyframes ui-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
document.head.appendChild(kf);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
