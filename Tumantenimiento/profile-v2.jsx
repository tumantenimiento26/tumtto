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

const TONES = [
  "linear-gradient(135deg,#0A6BCF,#18C1FF)",
  "linear-gradient(135deg,#F59E0B,#FBBF24)",
  "linear-gradient(135deg,#18A66A,#4ED896)",
  "linear-gradient(135deg,#0E2C56,#0894EA)",
];

// =====================================================================
// SHARED — Profile Hero
// =====================================================================
function ProfileHero({ compact = false }) {
  return (
    <div style={{ ...p.hero, ...(compact ? p.heroCompact : null) }}>
      {/* Decorative gradient overlay */}
      <div style={p.heroOverlay} />
      <div style={p.heroBlob} />

      <div style={p.heroTop}>
        <button style={p.heroIconBtn}>
          <Ic name="qr-code" size={16} color="#FFFFFF" />
        </button>
        <span style={p.heroLabel}>MI CUENTA</span>
        <button style={p.heroIconBtn}>
          <Ic name="bell" size={16} color="#FFFFFF" />
        </button>
      </div>

      <div style={p.heroAvWrap}>
        <div style={p.heroAv}>
          <span>MR</span>
        </div>
        <div style={p.heroAvBadge}>
          <Ic name="check" size={11} color="#FFFFFF" stroke={3.5} />
        </div>
      </div>

      <div style={p.heroName}>María Rodríguez Gómez</div>
      <div style={p.heroEmail}>maria.rg@gmail.com</div>

      <div style={p.heroMeta}>
        <div style={p.heroMetaItem}>
          <div style={p.heroMetaVal}>26</div>
          <div style={p.heroMetaLabel}>servicios</div>
        </div>
        <div style={p.heroMetaDiv} />
        <div style={p.heroMetaItem}>
          <div style={p.heroMetaVal}>12</div>
          <div style={p.heroMetaLabel}>reseñas</div>
        </div>
        <div style={p.heroMetaDiv} />
        <div style={p.heroMetaItem}>
          <div style={p.heroMetaVal}>2 años</div>
          <div style={p.heroMetaLabel}>miembro</div>
        </div>
      </div>

      <button style={p.heroEditBtn}>
        <Ic name="pencil" size={13} color="#FFFFFF" style={{ marginRight: 6 }} />
        Editar perfil
      </button>
    </div>
  );
}

// =====================================================================
// LIST ROW
// =====================================================================
function Row({ icon, iconTone = "blue", label, sub, count, badge, badgeTone, danger, disabled, accent, rightHint, last }) {
  const toneMap = {
    blue:   { bg: "rgba(10,107,207,0.10)",  color: "#0A6BCF" },
    cyan:   { bg: "rgba(24,193,255,0.18)",  color: "#0884B0" },
    green:  { bg: "rgba(24,166,106,0.12)",  color: "#0F8A56" },
    amber:  { bg: "rgba(245,158,11,0.14)",  color: "#B45309" },
    navy:   { bg: "rgba(14,44,86,0.08)",    color: "#0E2C56" },
    red:    { bg: "rgba(220,38,38,0.10)",   color: "#DC2626" },
    gray:   { bg: "rgba(14,44,86,0.05)",    color: "#6B7280" },
  };
  const ic = toneMap[iconTone];
  return (
    <div style={{
      ...p.row,
      ...(last ? null : p.rowBorder),
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.55 : 1,
    }}>
      <div style={{ ...p.rowIcon, background: ic.bg }}>
        <Ic name={icon} size={15} color={ic.color} stroke={2.2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...p.rowLabel, color: danger ? "#DC2626" : "#0E2C56" }}>
          {label}
        </div>
        {sub && <div style={p.rowSub}>{sub}</div>}
      </div>
      {rightHint && <span style={p.rightHint}>{rightHint}</span>}
      {count !== undefined && (
        <span style={p.countChip}>{count}</span>
      )}
      {badge && (
        <span style={{
          ...p.badgePill,
          background: badgeTone === "amber" ? "rgba(245,158,11,0.14)" : "rgba(10,107,207,0.10)",
          color: badgeTone === "amber" ? "#B45309" : "#0A6BCF",
        }}>
          {badge}
        </span>
      )}
      {!danger && !accent && (
        <Ic name="chevron-right" size={16} color="#9CA3AF" />
      )}
      {accent && (
        <Ic name="chevron-right" size={16} color="#0A6BCF" />
      )}
    </div>
  );
}

function SectionHead({ label, icon }) {
  return (
    <div style={p.sectionHead}>
      {icon && <Ic name={icon} size={11} color="#9CA3AF" />}
      <span>{label}</span>
    </div>
  );
}

// =====================================================================
// BOTTOM TABBAR
// =====================================================================
function BottomTabs() {
  const tabs = [
    { id: "home",     icon: "home",          label: "Inicio" },
    { id: "services", icon: "clipboard-list",label: "Servicios" },
    { id: "messages", icon: "message-circle",label: "Mensajes" },
    { id: "favs",     icon: "heart",         label: "Favoritos" },
    { id: "profile",  icon: "user",          label: "Perfil", active: true },
  ];
  return (
    <div style={p.tabbar}>
      {tabs.map(t => (
        <div key={t.id} style={p.tabItem}>
          <Ic name={t.icon} size={22} color={t.active ? "#0A6BCF" : "#9CA3AF"} stroke={t.active ? 2.2 : 1.8} />
          <span style={{ ...p.tabLabel, color: t.active ? "#0A6BCF" : "#9CA3AF", fontWeight: t.active ? 700 : 500 }}>
            {t.label}
          </span>
          {t.active && <div style={p.tabActiveDot} />}
        </div>
      ))}
    </div>
  );
}

// =====================================================================
// SCREEN 01 — Main Profile
// =====================================================================
function ProfileScreen() {
  return (
    <div style={p.wrap}>
      <div style={p.body}>
        <ProfileHero />

        <div style={p.content}>
          {/* Mi cuenta */}
          <SectionHead label="MI CUENTA" />
          <div style={p.card}>
            <Row icon="map-pin"    iconTone="blue"  label="Direcciones guardadas" sub="Casa · Oficina · Mamá" count={3} />
            <Row icon="credit-card" iconTone="navy" label="Métodos de pago"        sub="Visa •••• 1234 + Mercado Pago" count={2} />
            <Row icon="user-round" iconTone="cyan"  label="Información de contacto" sub="Tel · Email · WhatsApp" />
            <Row icon="bell"       iconTone="amber" label="Notificaciones"          sub="Push, email y WhatsApp" />
            <Row icon="globe"      iconTone="gray"  label="Idioma" rightHint="Español MX" last />
          </div>

          {/* Mi actividad */}
          <SectionHead label="MI ACTIVIDAD" />
          <div style={p.card}>
            <Row icon="star"  iconTone="amber" label="Reseñas que he dejado" sub="Última: Ramón H. · 12/05" count={12} />
            <Row icon="heart" iconTone="red"   label="Técnicos favoritos"     sub="Ramón, Lupita y 2 más" count={4} />
            <Row icon="gift"  iconTone="cyan"  label="Programa de referidos"  sub="Gana $100 por cada amigo"
                 badge="PRÓXIMAMENTE" badgeTone="amber" disabled last />
          </div>

          {/* Pagos y facturación */}
          <SectionHead label="PAGOS Y FACTURACIÓN" />
          <div style={p.card}>
            <Row icon="file-text" iconTone="blue" label="Mis recibos" sub="26 recibos · descarga en PDF" />
            <Row icon="file-spreadsheet" iconTone="gray" label="Solicitudes de factura"
                 sub="CFDI 4.0 · próximamente" badge="MVP" badgeTone="amber" disabled last />
          </div>

          {/* Ayuda y soporte */}
          <SectionHead label="AYUDA Y SOPORTE" />
          <div style={p.card}>
            <Row icon="life-buoy"      iconTone="cyan" label="Centro de ayuda"      sub="Preguntas frecuentes" />
            <Row icon="message-square" iconTone="blue" label="Contactar soporte"    sub="Chat en vivo · 9-21 hrs" rightHint="Lun–Sáb" />
            <Row icon="file-text"      iconTone="gray" label="Términos y condiciones" />
            <Row icon="lock"           iconTone="gray" label="Política de privacidad" sub="LFPDPPP México" />
            <Row icon="scale"          iconTone="gray" label="Política de reembolsos" last />
          </div>

          {/* Cuenta */}
          <SectionHead label="CUENTA" />
          <div style={p.card}>
            <Row icon="log-out" iconTone="blue" label="Cerrar sesión" accent />
            <Row icon="trash-2" iconTone="red"  label="Eliminar mi cuenta"
                 sub="Conforme LFPDPPP · puede tardar hasta 30 días" danger last />
          </div>

          {/* Footer */}
          <div style={p.footer}>
            <div style={p.brandFoot}>
              <div style={p.brandFootLogo}>Tu<span style={{ color: "#0A6BCF" }}>mantenimiento</span></div>
              <div style={p.brandFootMeta}>Mantenimiento confiable, a un toque.</div>
            </div>
            <div style={p.versionRow}>
              <span style={p.versionChip}>v1.0 · MVP</span>
              <span style={p.versionBuild}>build 2026.05.19</span>
            </div>
            <div style={p.versionDesc}>Guadalajara · Zapopan · Tlaquepaque · Tonalá</div>
          </div>
        </div>
      </div>

      <BottomTabs />
    </div>
  );
}

// =====================================================================
// SCREEN 02 — Editar perfil
// =====================================================================
function EditScreen() {
  return (
    <div style={p.wrap}>
      <div style={p.subHeader}>
        <button style={p.subHeaderBack}><Ic name="arrow-left" size={18} color="#0E2C56" /></button>
        <div style={p.subHeaderTitle}>Editar perfil</div>
        <button style={p.subHeaderSave}>Guardar</button>
      </div>

      <div style={p.bodyPlain}>
        {/* Avatar edit */}
        <div style={p.avEditWrap}>
          <div style={p.avEditBig}>
            <span>MR</span>
            <div style={p.avEditCamBtn}>
              <Ic name="camera" size={14} color="#FFFFFF" />
            </div>
          </div>
          <button style={p.avEditChange}>Cambiar foto</button>
        </div>

        {/* Form */}
        <div style={p.formStack}>
          <Field label="Nombre completo" value="María Rodríguez Gómez" required />
          <Field label="Correo electrónico" value="maria.rg@gmail.com" icon="mail" verified />
          <Field label="Teléfono" value="33 1234 5678" icon="phone" verified hint="Usado para notificaciones del servicio" />

          <div style={p.fieldRow}>
            <Field label="Fecha de nacimiento" value="14/03/1992" icon="calendar" optional small />
            <Field label="Género" value="Femenino" optional small select />
          </div>

          <Field label="RFC" placeholder="Opcional · para facturas" optional icon="hash" />
        </div>

        {/* Privacy block */}
        <div style={p.privacyBlock}>
          <div style={p.privacyHead}>
            <Ic name="shield-check" size={14} color="#0F8A56" />
            <div style={p.privacyTitle}>Tus datos son tuyos</div>
          </div>
          <div style={p.privacyText}>
            Los técnicos solo ven tu <b style={{ color: "#0E2C56", fontWeight: 700 }}>nombre, foto y dirección del servicio activo</b>. Nunca compartimos tu teléfono ni correo.
          </div>
        </div>

        <button style={p.bigPrimary}>
          <Ic name="check" size={16} color="#FFFFFF" stroke={3} style={{ marginRight: 8 }} />
          Guardar cambios
        </button>
        <button style={p.bigGhost}>Descartar</button>
      </div>
    </div>
  );
}

function Field({ label, value, placeholder, icon, verified, required, optional, hint, small, select }) {
  return (
    <div style={{ ...p.field, ...(small ? { flex: 1 } : null) }}>
      <label style={p.fieldLabel}>
        {label}
        {required && <span style={p.fieldRequired}>*</span>}
        {optional && <span style={p.fieldOptional}>opcional</span>}
      </label>
      <div style={p.inputWrap}>
        {icon && <Ic name={icon} size={14} color="#9CA3AF" style={{ marginRight: 8 }} />}
        <span style={{ flex: 1, color: value ? "#0E2C56" : "#9CA3AF", fontWeight: 500, fontSize: 13.5 }}>
          {value || placeholder}
        </span>
        {verified && (
          <span style={p.verifiedChip}>
            <Ic name="check" size={9} color="#0F8A56" stroke={3} />
            Verificado
          </span>
        )}
        {select && <Ic name="chevron-down" size={14} color="#9CA3AF" />}
      </div>
      {hint && <div style={p.fieldHint}>{hint}</div>}
    </div>
  );
}

// =====================================================================
// SCREEN 03 — Direcciones
// =====================================================================
function AddressesScreen() {
  const addresses = [
    {
      id: "casa", alias: "Casa", icon: "home", isMain: true,
      line1: "Av. Patria 1234, Int. 5B",
      line2: "Col. Providencia, Guadalajara, Jal.",
      cp: "44630",
      ref: "Portón blanco con bugambilias",
    },
    {
      id: "oficina", alias: "Oficina", icon: "building-2",
      line1: "Av. Vallarta 5500, Piso 8",
      line2: "Col. Vallarta Universidad, Zapopan, Jal.",
      cp: "45110",
      ref: "Torre cristalina, recepción al fondo",
    },
    {
      id: "mama", alias: "Casa de Mamá", icon: "heart",
      line1: "Calle Pino Suárez 89",
      line2: "Col. Centro, Guadalajara, Jal.",
      cp: "44100",
    },
  ];
  return (
    <div style={p.wrap}>
      <div style={p.subHeader}>
        <button style={p.subHeaderBack}><Ic name="arrow-left" size={18} color="#0E2C56" /></button>
        <div style={p.subHeaderTitle}>Direcciones guardadas</div>
        <button style={p.subHeaderIcon}>
          <Ic name="info" size={16} color="#0A6BCF" />
        </button>
      </div>

      <div style={p.bodyPlain}>
        <div style={p.addrIntro}>
          Tus direcciones se sugieren cuando solicitas un servicio. La <b style={{ color: "#0E2C56", fontWeight: 700 }}>principal</b> se usa por default.
        </div>

        <div style={p.addrList}>
          {addresses.map((a, idx) => (
            <div key={a.id} style={p.addrCard}>
              <div style={p.addrMapWrap}>
                <MiniMap />
                <div style={p.addrPin}>
                  <Ic name="map-pin" size={14} color="#FFFFFF" />
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={p.addrTopRow}>
                  <div style={p.addrAliasWrap}>
                    <Ic name={a.icon} size={13} color="#0A6BCF" />
                    <span style={p.addrAlias}>{a.alias}</span>
                  </div>
                  {a.isMain && <span style={p.addrMain}>Principal</span>}
                </div>
                <div style={p.addrLine1}>{a.line1}</div>
                <div style={p.addrLine2}>{a.line2} · CP {a.cp}</div>
                {a.ref && (
                  <div style={p.addrRef}>
                    <Ic name="navigation" size={10} color="#6B7280" />
                    <span>{a.ref}</span>
                  </div>
                )}
                <div style={p.addrActions}>
                  <button style={p.addrActBtn}>
                    <Ic name="pencil" size={11} color="#0A6BCF" />
                    <span>Editar</span>
                  </button>
                  {!a.isMain && (
                    <button style={p.addrActBtn}>
                      <Ic name="check" size={11} color="#0A6BCF" />
                      <span>Marcar principal</span>
                    </button>
                  )}
                  <button style={{ ...p.addrActBtn, color: "#DC2626" }}>
                    <Ic name="trash-2" size={11} color="#DC2626" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add new */}
          <button style={p.addrAdd}>
            <div style={p.addrAddIcon}>
              <Ic name="plus" size={20} color="#0A6BCF" stroke={2.4} />
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={p.addrAddTitle}>Agregar nueva dirección</div>
              <div style={p.addrAddSub}>Buscamos por CP o calle, o detectamos tu ubicación</div>
            </div>
            <Ic name="chevron-right" size={16} color="#0A6BCF" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniMap() {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ display: "block", background: "#DDE7F1", borderRadius: 10 }}>
      <defs>
        <pattern id="miniGrid" width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M14 0 L0 0 0 14" fill="none" stroke="#CCD7E5" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100" height="100" fill="url(#miniGrid)" />
      <path d="M-5 50 Q 50 40 105 60" stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M30 -5 Q 40 50 60 105" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M0 30 Q 70 30 105 25" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="48" cy="52" r="12" fill="rgba(10,107,207,0.18)" />
    </svg>
  );
}

// =====================================================================
// SCREEN 03b/c — Agregar / Editar dirección
// =====================================================================
function AddressFormScreen({ mode = "add" }) {
  const isEdit = mode === "edit";
  const data = isEdit ? {
    alias: "Casa", aliasIcon: "home", main: true,
    street: "Av. Patria", number: "1234", interior: "5B",
    colonia: "Providencia", city: "Guadalajara", state: "Jalisco", cp: "44630",
    ref: "Portón blanco con bugambilias",
    contact: "María Rodríguez · 33 1234 5678",
  } : {
    alias: "", aliasIcon: null, main: false,
    street: "Av. de las Américas", number: "", interior: "",
    colonia: "Country Club", city: "Guadalajara", state: "Jalisco", cp: "44610",
    ref: "", contact: "",
  };

  return (
    <div style={p.wrap}>
      <div style={p.subHeader}>
        <button style={p.subHeaderBack}><Ic name="arrow-left" size={18} color="#0E2C56" /></button>
        <div style={p.subHeaderTitle}>{isEdit ? "Editar dirección" : "Nueva dirección"}</div>
        <button style={p.subHeaderSave}>{isEdit ? "Actualizar" : "Guardar"}</button>
      </div>

      <div style={p.bodyPlain}>
        {/* Big map with draggable pin */}
        <div style={p.bigMapWrap}>
          <BigMap />
          {/* Search overlay */}
          <div style={p.mapSearchBar}>
            <Ic name="search" size={14} color="#9CA3AF" />
            <span style={{ flex: 1, color: "#0E2C56", fontSize: 13 }}>
              {data.street}{data.number ? `, ${data.number}` : ""}
            </span>
            <button style={p.mapLocateBtn}>
              <Ic name="locate-fixed" size={13} color="#0A6BCF" />
            </button>
          </div>
          {/* Center pin */}
          <div style={p.bigPinWrap}>
            <div style={p.bigPinShadow} />
            <div style={p.bigPin}>
              <Ic name="map-pin" size={18} color="#FFFFFF" />
            </div>
            <div style={p.dragHint}>Arrastra para ajustar</div>
          </div>
          {/* Zoom controls */}
          <div style={p.mapZoom}>
            <button style={p.mapZoomBtn}><Ic name="plus" size={14} color="#0E2C56" /></button>
            <div style={p.mapZoomDiv} />
            <button style={p.mapZoomBtn}><Ic name="minus" size={14} color="#0E2C56" /></button>
          </div>
        </div>

        {/* Detected accuracy */}
        <div style={p.accuracyRow}>
          <Ic name="crosshair" size={11} color="#0F8A56" />
          <span><b style={{ color: "#0E2C56", fontWeight: 700 }}>Ubicación precisa</b> · ±5 m · GPS</span>
          <span style={p.accuracyChip}>±5 m</span>
        </div>

        {/* Alias picker */}
        <SectionHead label={isEdit ? "ETIQUETA" : "NOMBRA ESTA DIRECCIÓN"} />
        <div style={p.aliasRow}>
          {[
            { id: "home",       label: "Casa",     icon: "home" },
            { id: "building-2", label: "Oficina", icon: "building-2" },
            { id: "heart",      label: "Familia", icon: "heart" },
            { id: "tag",        label: "Otro",    icon: "tag" },
          ].map(opt => {
            const sel = data.aliasIcon === opt.id;
            return (
              <div key={opt.id} style={{ ...p.aliasOpt, ...(sel ? p.aliasOptSel : null) }}>
                <Ic name={opt.icon} size={15} color={sel ? "#FFFFFF" : "#0A6BCF"} />
                <span>{opt.label}</span>
              </div>
            );
          })}
        </div>

        {/* Custom alias */}
        <div style={{ ...p.field, marginTop: 12 }}>
          <label style={p.fieldLabel}>
            Nombre personalizado
            <span style={p.fieldOptional}>opcional</span>
          </label>
          <div style={p.inputWrap}>
            <Ic name="pencil" size={13} color="#9CA3AF" style={{ marginRight: 8 }} />
            <span style={{ flex: 1, color: data.alias ? "#0E2C56" : "#9CA3AF", fontSize: 13.5, fontWeight: 500 }}>
              {data.alias || "Ej. Casa de Mamá, Bodega…"}
            </span>
          </div>
        </div>

        {/* Address details */}
        <SectionHead label="DETALLES DE LA DIRECCIÓN" />
        <div style={p.formStack}>
          <div style={p.fieldRow}>
            <Field label="Calle" value={data.street} required icon="map" small />
            <Field label="Número" value={data.number} placeholder="123" required small />
          </div>
          <div style={p.fieldRow}>
            <Field label="Interior" value={data.interior} placeholder="Depto / Casa" optional small />
            <Field label="CP" value={data.cp} required small />
          </div>
          <Field label="Colonia" value={data.colonia} required />
          <div style={p.fieldRow}>
            <Field label="Ciudad" value={data.city} required small />
            <Field label="Estado" value={data.state} required small select />
          </div>

          <div style={p.field}>
            <label style={p.fieldLabel}>
              Referencia para el técnico
              <span style={p.fieldOptional}>opcional</span>
            </label>
            <div style={p.textareaWrap}>
              <Ic name="navigation" size={13} color="#9CA3AF" />
              <span style={{ flex: 1, color: data.ref ? "#0E2C56" : "#9CA3AF", fontSize: 13, lineHeight: 1.5 }}>
                {data.ref || "Ej. portón blanco, junto al Oxxo, segundo piso…"}
              </span>
            </div>
            <div style={p.fieldHint}>Ayuda al técnico a encontrarte más rápido.</div>
          </div>

          {/* Contact at this address */}
          <div style={p.field}>
            <label style={p.fieldLabel}>
              ¿Quién recibe al técnico?
              <span style={p.fieldOptional}>opcional</span>
            </label>
            <div style={p.inputWrap}>
              <Ic name="user-round" size={13} color="#9CA3AF" style={{ marginRight: 8 }} />
              <span style={{ flex: 1, color: data.contact ? "#0E2C56" : "#9CA3AF", fontSize: 13.5, fontWeight: 500 }}>
                {data.contact || "Tú u otra persona en sitio"}
              </span>
              <Ic name="chevron-down" size={13} color="#9CA3AF" />
            </div>
          </div>
        </div>

        {/* Main toggle */}
        <div style={p.mainToggleCard}>
          <div style={p.mainToggleIcon}>
            <Ic name="star" size={14} color="#0A6BCF" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={p.mainToggleTitle}>Usar como dirección principal</div>
            <div style={p.mainToggleSub}>Se sugiere por default al solicitar un servicio</div>
          </div>
          <div style={{ ...p.toggle, ...(data.main ? p.toggleOn : null) }}>
            <div style={{ ...p.toggleKnob, ...(data.main ? p.toggleKnobOn : null) }} />
          </div>
        </div>

        {/* Edit-only: delete row */}
        {isEdit && (
          <button style={p.deleteAddrBtn}>
            <Ic name="trash-2" size={14} color="#DC2626" style={{ marginRight: 8 }} />
            Eliminar esta dirección
          </button>
        )}

        {/* CTA */}
        <button style={p.bigPrimary}>
          <Ic name={isEdit ? "check" : "plus"} size={16} color="#FFFFFF" stroke={3} style={{ marginRight: 8 }} />
          {isEdit ? "Guardar cambios" : "Guardar dirección"}
        </button>
        <button style={p.bigGhost}>Cancelar</button>
      </div>
    </div>
  );
}

function BigMap() {
  return (
    <svg viewBox="0 0 390 320" width="100%" height="100%" style={{ display: "block", background: "#DDE7F1" }}>
      <defs>
        <pattern id="bigMapGrid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0 L0 0 0 24" fill="none" stroke="#CCD7E5" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="390" height="320" fill="url(#bigMapGrid)" />

      {/* Parks / zones */}
      <path d="M30 60 Q 110 40 200 70 Q 250 110 220 180 Q 140 200 60 180 Q 20 130 30 60 Z" fill="rgba(180,210,180,0.35)" />
      <path d="M260 200 Q 350 200 380 230 Q 380 290 320 305 Q 250 295 240 250 Z" fill="rgba(180,210,180,0.30)" />

      {/* Buildings cluster */}
      <g fill="rgba(255,255,255,0.5)">
        <rect x="60"  y="220" width="16" height="22" rx="1.5" />
        <rect x="82"  y="215" width="20" height="28" rx="1.5" />
        <rect x="108" y="222" width="14" height="20" rx="1.5" />
        <rect x="128" y="218" width="18" height="26" rx="1.5" />
        <rect x="310" y="100" width="16" height="22" rx="1.5" />
        <rect x="332" y="94"  width="20" height="30" rx="1.5" />
      </g>

      {/* Roads — main arterials */}
      <path d="M0 160 Q 200 150 390 175" stroke="#FFFFFF" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M195 0 Q 192 160 200 320" stroke="#FFFFFF" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M0 80  Q 200 70  390 100" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M0 250 Q 200 245 390 265" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M90 0 Q 100 160 110 320" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.75" />
      <path d="M290 0 Q 285 160 295 320" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.75" />

      {/* Labels */}
      <text x="60"  y="40"  fontFamily="Inter" fontWeight="600" fontSize="10" fill="#0E2C56" opacity="0.55">Providencia</text>
      <text x="260" y="60"  fontFamily="Inter" fontWeight="600" fontSize="10" fill="#0E2C56" opacity="0.55">Vallarta</text>
      <text x="260" y="280" fontFamily="Inter" fontWeight="600" fontSize="10" fill="#0E2C56" opacity="0.55">Centro</text>
      <text x="20"  y="300" fontFamily="Inter" fontWeight="600" fontSize="10" fill="#0E2C56" opacity="0.55">Chapalita</text>

      {/* Soft accuracy circle around the (visual) center */}
      <circle cx="195" cy="160" r="36" fill="rgba(10,107,207,0.10)" stroke="rgba(10,107,207,0.35)" strokeWidth="1" strokeDasharray="3 3" />
    </svg>
  );
}

// =====================================================================
// SCREEN 04 — Métodos de pago
// =====================================================================
function PaymentsScreen() {
  return (
    <div style={p.wrap}>
      <div style={p.subHeader}>
        <button style={p.subHeaderBack}><Ic name="arrow-left" size={18} color="#0E2C56" /></button>
        <div style={p.subHeaderTitle}>Métodos de pago</div>
        <button style={p.subHeaderIcon}>
          <Ic name="shield-check" size={16} color="#0F8A56" />
        </button>
      </div>

      <div style={p.bodyPlain}>
        {/* Security info */}
        <div style={p.payBanner}>
          <div style={p.payBannerIcon}>
            <Ic name="lock" size={14} color="#0F8A56" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={p.payBannerTitle}>Procesamos vía Mercado Pago</div>
            <div style={p.payBannerSub}>No almacenamos información de tarjetas · TLS 1.3</div>
          </div>
        </div>

        <SectionHead label="TUS TARJETAS · 2" />

        {/* Card 1 — default */}
        <div style={p.cardItemPrimary}>
          <div style={p.cardItemTop}>
            <div style={p.cardChip} />
            <div style={p.cardItemBrandRow}>
              <span style={p.cardItemBrandText}>VISA</span>
            </div>
          </div>
          <div style={p.cardItemNum}>
            <span style={{ opacity: 0.55 }}>••••</span>
            <span style={{ opacity: 0.55 }}>••••</span>
            <span style={{ opacity: 0.55 }}>••••</span>
            <span>1234</span>
          </div>
          <div style={p.cardItemBottom}>
            <div>
              <div style={p.cardItemLabel}>TITULAR</div>
              <div style={p.cardItemVal}>María R. Gómez</div>
            </div>
            <div>
              <div style={p.cardItemLabel}>VENCE</div>
              <div style={p.cardItemVal}>08/27</div>
            </div>
            <span style={p.cardDefault}>
              <Ic name="check" size={9} color="#FFFFFF" stroke={3} />
              Predeterminada
            </span>
          </div>
        </div>

        {/* Card 2 — secondary */}
        <div style={p.cardItem2}>
          <div style={p.cardItem2Left}>
            <div style={p.cardItem2Mark}>MC</div>
            <div>
              <div style={p.cardItem2Title}>Mastercard •••• 8821</div>
              <div style={p.cardItem2Sub}>Vence 03/26 · titular MR Gómez</div>
            </div>
          </div>
          <button style={p.cardItem2Menu}>
            <Ic name="more-vertical" size={15} color="#6B7280" />
          </button>
        </div>

        {/* Add card */}
        <button style={p.payAdd}>
          <div style={p.payAddIcon}>
            <Ic name="plus" size={18} color="#0A6BCF" stroke={2.4} />
          </div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={p.payAddTitle}>Agregar nueva tarjeta</div>
            <div style={p.payAddSub}>Crédito o débito · cualquier banco</div>
          </div>
          <Ic name="chevron-right" size={16} color="#0A6BCF" />
        </button>

        <SectionHead label="MÉTODOS ALTERNOS" />

        <div style={p.altCard}>
          <div style={p.oxxoMark}>OXXO</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={p.altTitle}>OXXO Pay</div>
            <div style={p.altSub}>Disponible siempre · genera referencia al pagar</div>
          </div>
          <span style={p.altAvailable}>
            <span style={p.liveDot} />
            activo
          </span>
        </div>

        <div style={p.altCard}>
          <div style={p.mpMark}>
            <Ic name="wallet" size={16} color="#FFFFFF" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={p.altTitle}>Mercado Pago</div>
            <div style={p.altSub}>Vincula tu cuenta para pagar con saldo</div>
          </div>
          <button style={p.linkBtn}>Vincular</button>
        </div>

        <div style={p.altCard}>
          <div style={p.cashMark}>
            <Ic name="banknote" size={16} color="#0F8A56" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={p.altTitle}>Efectivo al técnico</div>
            <div style={p.altSub}>Sin configurar · activar al pagar</div>
          </div>
          <Ic name="info" size={14} color="#9CA3AF" />
        </div>

        {/* Footer disclaimer */}
        <div style={p.payDisclaimer}>
          <Ic name="info" size={11} color="#9CA3AF" />
          <span>
            Tus datos de tarjeta están tokenizados — ni Tumantenimiento ni los técnicos los pueden ver.
          </span>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// SCREEN 05 — Eliminar cuenta (confirmación robusta)
// =====================================================================
function DeleteAccountScreen() {
  return (
    <div style={p.wrap}>
      <div style={p.subHeader}>
        <button style={p.subHeaderBack}><Ic name="arrow-left" size={18} color="#0E2C56" /></button>
        <div style={p.subHeaderTitle}>Eliminar cuenta</div>
        <span />
      </div>

      <div style={p.bodyPlain}>
        <div style={p.dangerHero}>
          <div style={p.dangerIconBig}>
            <Ic name="trash-2" size={32} color="#FFFFFF" />
          </div>
          <div style={p.dangerTitle}>¿Eliminar tu cuenta?</div>
          <div style={p.dangerSub}>
            Esto es <b style={{ color: "#7A1A1A", fontWeight: 700 }}>permanente</b>. Tu historial, reseñas y favoritos se borrarán.
          </div>
        </div>

        {/* What gets deleted */}
        <div style={p.dangerCard}>
          <div style={p.dangerCardLabel}>QUÉ SE ELIMINA</div>
          <div style={p.dangerList}>
            {[
              { icon: "user-x",       text: "Tu perfil, foto, contacto y direcciones" },
              { icon: "star",         text: "Las 12 reseñas que dejaste sobre técnicos" },
              { icon: "heart",        text: "Tus 4 técnicos favoritos y notificaciones" },
              { icon: "credit-card",  text: "Tus métodos de pago guardados" },
            ].map((d, idx) => (
              <div key={idx} style={p.dangerListRow}>
                <Ic name={d.icon} size={13} color="#DC2626" />
                <span>{d.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What is kept */}
        <div style={p.keepCard}>
          <div style={p.keepCardLabel}>QUÉ SE CONSERVA · OBLIGACIONES LEGALES</div>
          <div style={p.dangerList}>
            <div style={p.keepListRow}>
              <Ic name="file-text" size={13} color="#0884B0" />
              <span><b style={{ color: "#0E2C56", fontWeight: 700 }}>Facturas y CFDI</b> de servicios pagados — 5 años por requerimiento del SAT.</span>
            </div>
            <div style={p.keepListRow}>
              <Ic name="scale" size={13} color="#0884B0" />
              <span><b style={{ color: "#0E2C56", fontWeight: 700 }}>Registros de disputas</b> abiertas o cerradas en últimos 12 meses.</span>
            </div>
          </div>
          <div style={p.keepFootnote}>
            Conforme a la <b style={{ color: "#0E2C56", fontWeight: 700 }}>LFPDPPP</b> y el Art. 30 del CFF. Se anonimizan los datos personales restantes.
          </div>
        </div>

        {/* Timeline */}
        <div style={p.timelineCard}>
          <div style={p.timelineRow}>
            <div style={p.timelineDotNow}>1</div>
            <div style={{ flex: 1 }}>
              <div style={p.timelineTitle}>Confirmas y firmas</div>
              <div style={p.timelineSub}>Te enviamos un código por SMS al 33 1234 5678</div>
            </div>
          </div>
          <div style={p.timelineLine} />
          <div style={p.timelineRow}>
            <div style={p.timelineDot}>2</div>
            <div style={{ flex: 1 }}>
              <div style={p.timelineTitle}>Periodo de gracia · 7 días</div>
              <div style={p.timelineSub}>Puedes cancelar la eliminación iniciando sesión</div>
            </div>
          </div>
          <div style={p.timelineLine} />
          <div style={p.timelineRow}>
            <div style={p.timelineDot}>3</div>
            <div style={{ flex: 1 }}>
              <div style={p.timelineTitle}>Eliminación definitiva</div>
              <div style={p.timelineSub}>Hasta 30 días hábiles · te avisamos al completar</div>
            </div>
          </div>
        </div>

        {/* Confirm input */}
        <div style={p.field}>
          <label style={p.fieldLabel}>
            Escribe <b style={{ color: "#DC2626", fontWeight: 700 }}>ELIMINAR</b> para confirmar
          </label>
          <div style={p.inputWrap}>
            <span style={{ flex: 1, color: "#9CA3AF", fontSize: 13.5, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".1em" }}>
              ELIMINAR
            </span>
          </div>
        </div>

        <button style={p.dangerBtn}>
          <Ic name="trash-2" size={15} color="#FFFFFF" style={{ marginRight: 8 }} />
          Eliminar mi cuenta permanentemente
        </button>
        <button style={p.bigGhost}>Cancelar y mantener cuenta</button>
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
      <DCSection id="main" title="Perfil del cliente" subtitle="Settings · cliente · Tumantenimiento">
        <DCArtboard id="profile" label="01 · Perfil principal" width={438} height={892}>
          <PhoneFrame><ProfileScreen /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="edit" label="02 · Editar perfil" width={438} height={892}>
          <PhoneFrame><EditScreen /></PhoneFrame>
        </DCArtboard>
      </DCSection>

      <DCSection id="data" title="Direcciones y métodos de pago" subtitle="Sub-pantallas">
        <DCArtboard id="addr" label="03 · Direcciones guardadas" width={438} height={892}>
          <PhoneFrame><AddressesScreen /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="addrnew" label="03a · Agregar nueva dirección" width={438} height={892}>
          <PhoneFrame><AddressFormScreen mode="add" /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="addredit" label="03b · Editar dirección" width={438} height={892}>
          <PhoneFrame><AddressFormScreen mode="edit" /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="pay" label="04 · Métodos de pago" width={438} height={892}>
          <PhoneFrame><PaymentsScreen /></PhoneFrame>
        </DCArtboard>
      </DCSection>

      <DCSection id="legal" title="Eliminar cuenta" subtitle="Cumplimiento LFPDPPP — flujo robusto">
        <DCArtboard id="delete" label="05 · Eliminar mi cuenta" width={438} height={892}>
          <PhoneFrame><DeleteAccountScreen /></PhoneFrame>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// =====================================================================
// STYLES
// =====================================================================
const p = {
  wrap: { width: "100%", height: "100%", background: "#F8FBFF", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" },

  body: { flex: 1, overflowY: "auto", paddingBottom: 100 },
  bodyPlain: { flex: 1, overflowY: "auto", padding: "16px 16px 110px" },

  // ===== Hero =====
  hero: { position: "relative", padding: "52px 20px 26px", background: "linear-gradient(160deg, #0E2C56 0%, #0A6BCF 50%, #0894EA 110%)", color: "#FFFFFF", borderRadius: "0 0 28px 28px", overflow: "hidden" },
  heroOverlay: { position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 0%, rgba(24,193,255,0.40), transparent 55%)", pointerEvents: "none" },
  heroBlob: { position: "absolute", left: -40, bottom: -40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(24,193,255,0.20), transparent 70%)", pointerEvents: "none" },

  heroTop: { position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  heroIconBtn: { width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.18)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0, backdropFilter: "blur(6px)" },
  heroLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.75)", letterSpacing: ".12em", fontWeight: 700 },

  heroAvWrap: { position: "relative", width: 96, height: 96, margin: "0 auto 14px" },
  heroAv: { width: 96, height: 96, borderRadius: "50%", background: "linear-gradient(135deg, #F59E0B, #FBBF24)", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: "-0.02em", boxShadow: "0 12px 28px rgba(14,44,86,0.40)", border: "3px solid rgba(255,255,255,0.20)" },
  heroAvBadge: { position: "absolute", right: -2, bottom: 0, width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#18A66A,#4ED896)", border: "3px solid #0A6BCF", display: "grid", placeItems: "center" },

  heroName: { position: "relative", fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", textAlign: "center" },
  heroEmail: { position: "relative", fontSize: 13, color: "rgba(255,255,255,0.78)", textAlign: "center", marginTop: 2 },

  heroMeta: { position: "relative", display: "flex", justifyContent: "center", alignItems: "center", gap: 0, marginTop: 16, padding: "10px 16px", background: "rgba(255,255,255,0.10)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.15)" },
  heroMetaItem: { flex: 1, textAlign: "center" },
  heroMetaVal: { fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800, letterSpacing: "-0.01em" },
  heroMetaLabel: { fontSize: 10, color: "rgba(255,255,255,0.7)", letterSpacing: ".06em", textTransform: "uppercase", marginTop: 2, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
  heroMetaDiv: { width: 1, height: 22, background: "rgba(255,255,255,0.18)" },

  heroEditBtn: { position: "relative", display: "inline-flex", alignItems: "center", padding: "9px 18px", background: "rgba(255,255,255,0.12)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.30)", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", margin: "16px auto 0", display: "flex", backdropFilter: "blur(6px)" },

  // ===== Sub header (other screens) =====
  subHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "52px 16px 14px", background: "#FFFFFF", borderBottom: "1px solid #F0F4F9", flexShrink: 0, gap: 10 },
  subHeaderBack: { width: 38, height: 38, borderRadius: 11, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  subHeaderIcon: { width: 38, height: 38, borderRadius: 11, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  subHeaderTitle: { flex: 1, fontFamily: "'Manrope', sans-serif", fontSize: 17, fontWeight: 700, color: "#0E2C56", textAlign: "center", letterSpacing: "-0.01em" },
  subHeaderSave: { padding: "8px 14px", background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(10,107,207,0.30)" },

  // ===== Section content =====
  content: { padding: "20px 16px 30px" },
  sectionHead: { display: "flex", alignItems: "center", gap: 5, padding: "16px 6px 8px", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF", letterSpacing: ".12em", fontWeight: 700 },

  card: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, overflow: "hidden" },

  row: { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" },
  rowBorder: { borderBottom: "1px solid #F0F4F9" },
  rowIcon: { width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0 },
  rowLabel: { fontSize: 13.5, fontWeight: 600 },
  rowSub: { fontSize: 11.5, color: "#6B7280", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  countChip: { background: "rgba(10,107,207,0.08)", color: "#0A6BCF", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  badgePill: { padding: "2px 8px", borderRadius: 999, fontSize: 9, fontWeight: 700, letterSpacing: ".06em", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" },
  rightHint: { color: "#6B7280", fontSize: 12, fontWeight: 500 },

  // ===== Footer brand =====
  footer: { textAlign: "center", marginTop: 24, padding: "20px 16px" },
  brandFoot: { marginBottom: 14 },
  brandFootLogo: { fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.01em" },
  brandFootMeta: { fontSize: 11, color: "#9CA3AF", marginTop: 4 },
  versionRow: { display: "flex", justifyContent: "center", alignItems: "center", gap: 8 },
  versionChip: { padding: "3px 10px", background: "rgba(10,107,207,0.08)", color: "#0A6BCF", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: ".06em", fontFamily: "'JetBrains Mono', monospace" },
  versionBuild: { fontSize: 10.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" },
  versionDesc: { fontSize: 10.5, color: "#9CA3AF", marginTop: 8, letterSpacing: ".04em" },

  // ===== Tabbar =====
  tabbar: { position: "absolute", left: 0, right: 0, bottom: 0, height: 82, background: "rgba(255,255,255,0.96)", borderTop: "1px solid #E1E8F0", display: "flex", justifyContent: "space-around", alignItems: "flex-start", padding: "10px 4px 24px", backdropFilter: "blur(8px)", zIndex: 5 },
  tabItem: { position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1, padding: "4px 0" },
  tabLabel: { fontSize: 10, marginTop: 1 },
  tabActiveDot: { position: "absolute", bottom: 2, width: 4, height: 4, borderRadius: "50%", background: "#0A6BCF" },

  // ===== Edit profile =====
  avEditWrap: { display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0 22px" },
  avEditBig: { position: "relative", width: 110, height: 110, borderRadius: "50%", background: "linear-gradient(135deg, #F59E0B, #FBBF24)", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: "-0.02em", boxShadow: "0 12px 28px rgba(245,158,11,0.40)" },
  avEditCamBtn: { position: "absolute", right: 0, bottom: 0, width: 36, height: 36, borderRadius: "50%", background: "#0A6BCF", display: "grid", placeItems: "center", border: "3px solid #F8FBFF", boxShadow: "0 4px 10px rgba(10,107,207,0.40)" },
  avEditChange: { marginTop: 10, padding: "6px 12px", background: "transparent", color: "#0A6BCF", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" },

  formStack: { display: "flex", flexDirection: "column", gap: 12 },
  fieldRow: { display: "flex", gap: 10 },
  field: { display: "flex", flexDirection: "column" },
  fieldLabel: { fontSize: 12, color: "#0E2C56", fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 },
  fieldRequired: { color: "#DC2626" },
  fieldOptional: { fontSize: 9.5, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", fontFamily: "'JetBrains Mono', monospace", padding: "1px 7px", background: "rgba(14,44,86,0.05)", borderRadius: 999 },
  fieldHint: { fontSize: 11, color: "#6B7280", marginTop: 4 },
  inputWrap: { display: "flex", alignItems: "center", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10, padding: "11px 12px" },
  verifiedChip: { display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 7px", background: "rgba(24,166,106,0.12)", color: "#0F8A56", borderRadius: 999, fontSize: 10, fontWeight: 700 },

  privacyBlock: { display: "flex", gap: 10, padding: "12px 14px", background: "rgba(24,166,106,0.06)", border: "1px solid rgba(24,166,106,0.20)", borderRadius: 12, marginTop: 18, flexDirection: "column" },
  privacyHead: { display: "flex", alignItems: "center", gap: 8 },
  privacyTitle: { fontSize: 12.5, fontWeight: 700, color: "#0E2C56" },
  privacyText: { fontSize: 11.5, color: "#6B7280", lineHeight: 1.5 },

  bigPrimary: { width: "100%", marginTop: 22, padding: "14px", background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(10,107,207,0.30)" },
  bigGhost: { width: "100%", marginTop: 8, padding: "12px", background: "transparent", color: "#6B7280", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer" },

  // ===== Addresses =====
  addrIntro: { fontSize: 12, color: "#6B7280", padding: "0 4px 16px", lineHeight: 1.5 },
  addrList: { display: "flex", flexDirection: "column", gap: 10 },
  addrCard: { display: "flex", gap: 12, padding: "12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14 },
  addrMapWrap: { position: "relative", width: 70, height: 70, flexShrink: 0, borderRadius: 10, overflow: "hidden", border: "1px solid #E1E8F0" },
  addrPin: { position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 26, height: 26, borderRadius: "50%", background: "#DC2626", border: "2.5px solid #FFFFFF", display: "grid", placeItems: "center", boxShadow: "0 2px 6px rgba(220,38,38,0.40)" },
  addrTopRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  addrAliasWrap: { display: "inline-flex", alignItems: "center", gap: 5 },
  addrAlias: { fontSize: 13.5, fontWeight: 700, color: "#0E2C56" },
  addrMain: { padding: "2px 8px", background: "rgba(10,107,207,0.10)", color: "#0A6BCF", borderRadius: 999, fontSize: 9.5, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".04em", textTransform: "uppercase" },
  addrLine1: { fontSize: 12.5, color: "#0E2C56", fontWeight: 500 },
  addrLine2: { fontSize: 11, color: "#6B7280", marginTop: 1 },
  addrRef: { display: "flex", alignItems: "center", gap: 4, marginTop: 6, padding: "4px 8px", background: "#F8FBFF", borderRadius: 6, fontSize: 10.5, color: "#6B7280" },
  addrActions: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 },
  addrActBtn: { display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", background: "transparent", color: "#0A6BCF", border: "1px solid #E1E8F0", borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: "pointer" },

  addrAdd: { display: "flex", alignItems: "center", gap: 12, padding: "14px", background: "rgba(10,107,207,0.04)", border: "1.5px dashed rgba(10,107,207,0.30)", borderRadius: 14, cursor: "pointer" },
  addrAddIcon: { width: 40, height: 40, borderRadius: 10, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  addrAddTitle: { fontSize: 13.5, fontWeight: 700, color: "#0A6BCF" },
  addrAddSub: { fontSize: 11, color: "#6B7280", marginTop: 2 },

  // ===== Address form (add / edit) =====
  bigMapWrap: { position: "relative", height: 240, borderRadius: 16, overflow: "hidden", border: "1px solid #E1E8F0", marginBottom: 12, boxShadow: "0 4px 14px rgba(14,44,86,0.06)" },
  mapSearchBar: { position: "absolute", top: 10, left: 10, right: 10, display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "rgba(255,255,255,0.96)", border: "1px solid #E1E8F0", borderRadius: 12, boxShadow: "0 4px 12px rgba(14,44,86,0.12)", backdropFilter: "blur(6px)" },
  mapLocateBtn: { width: 28, height: 28, borderRadius: 8, background: "rgba(10,107,207,0.10)", border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  bigPinWrap: { position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -100%)", display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none" },
  bigPinShadow: { width: 14, height: 4, background: "rgba(14,44,86,0.30)", borderRadius: "50%", marginTop: 28, filter: "blur(2px)", order: 2 },
  bigPin: { width: 38, height: 38, borderRadius: "50% 50% 50% 0", background: "linear-gradient(135deg,#DC2626,#B91C1C)", display: "grid", placeItems: "center", transform: "rotate(-45deg)", boxShadow: "0 8px 18px rgba(220,38,38,0.40)", order: 1, border: "2.5px solid #FFFFFF" },
  dragHint: { marginTop: 6, padding: "3px 9px", background: "rgba(14,44,86,0.85)", color: "#FFFFFF", borderRadius: 999, fontSize: 9.5, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".04em", order: 3 },
  mapZoom: { position: "absolute", right: 10, bottom: 10, display: "flex", flexDirection: "column", background: "#FFFFFF", borderRadius: 10, overflow: "hidden", boxShadow: "0 4px 12px rgba(14,44,86,0.15)" },
  mapZoomBtn: { width: 34, height: 34, background: "#FFFFFF", border: "none", display: "grid", placeItems: "center", cursor: "pointer" },
  mapZoomDiv: { height: 1, background: "#E1E8F0" },

  accuracyRow: { display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "rgba(24,166,106,0.06)", border: "1px solid rgba(24,166,106,0.25)", borderRadius: 10, fontSize: 11.5, color: "#6B7280", marginBottom: 4 },
  accuracyChip: { marginLeft: "auto", padding: "2px 8px", background: "rgba(24,166,106,0.14)", color: "#0F8A56", borderRadius: 999, fontSize: 9.5, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },

  aliasRow: { display: "flex", gap: 6 },
  aliasOpt: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "12px 6px", background: "#FFFFFF", border: "1.5px solid #E1E8F0", borderRadius: 12, cursor: "pointer", color: "#0E2C56", fontSize: 11.5, fontWeight: 600 },
  aliasOptSel: { background: "#0A6BCF", borderColor: "#0A6BCF", color: "#FFFFFF", boxShadow: "0 4px 10px rgba(10,107,207,0.30)" },

  textareaWrap: { display: "flex", alignItems: "flex-start", gap: 8, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10, padding: "11px 12px", minHeight: 60 },

  mainToggleCard: { display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12, marginTop: 14 },
  mainToggleIcon: { width: 32, height: 32, borderRadius: 9, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  mainToggleTitle: { fontSize: 12.5, fontWeight: 700, color: "#0E2C56" },
  mainToggleSub: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  toggle: { width: 38, height: 22, borderRadius: 999, background: "#E1E8F0", position: "relative", flexShrink: 0, cursor: "pointer" },
  toggleOn: { background: "#0A6BCF" },
  toggleKnob: { position: "absolute", left: 2, top: 2, width: 18, height: 18, borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 1px 3px rgba(14,44,86,0.20)" },
  toggleKnobOn: { left: 18 },

  deleteAddrBtn: { width: "100%", padding: "12px", background: "rgba(220,38,38,0.06)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.30)", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", marginTop: 14 },

  // ===== Payments =====
  payBanner: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "rgba(24,166,106,0.06)", border: "1px solid rgba(24,166,106,0.25)", borderRadius: 12, marginBottom: 6 },
  payBannerIcon: { width: 32, height: 32, borderRadius: 9, background: "rgba(24,166,106,0.12)", display: "grid", placeItems: "center", flexShrink: 0 },
  payBannerTitle: { fontSize: 12.5, fontWeight: 700, color: "#0E2C56" },
  payBannerSub: { fontSize: 11, color: "#6B7280", marginTop: 2 },

  cardItemPrimary: { padding: "16px 18px", borderRadius: 16, background: "linear-gradient(135deg, #0E2C56 0%, #0A6BCF 60%, #0894EA 100%)", color: "#FFFFFF", position: "relative", overflow: "hidden", boxShadow: "0 8px 22px rgba(10,107,207,0.30)", marginBottom: 10 },
  cardItemTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  cardChip: { width: 32, height: 24, borderRadius: 4, background: "linear-gradient(135deg,#F5D77B,#C9A036)" },
  cardItemBrandRow: { display: "inline-flex", alignItems: "center" },
  cardItemBrandText: { fontFamily: "'Manrope', sans-serif", fontSize: 14, fontWeight: 800, letterSpacing: ".06em", fontStyle: "italic" },
  cardItemNum: { display: "flex", gap: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 600, letterSpacing: "0.04em", marginBottom: 16 },
  cardItemBottom: { display: "flex", alignItems: "flex-end", gap: 20 },
  cardItemLabel: { fontSize: 8.5, opacity: 0.65, letterSpacing: ".08em", fontWeight: 600 },
  cardItemVal: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, marginTop: 2 },
  cardDefault: { marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", background: "rgba(255,255,255,0.18)", color: "#FFFFFF", borderRadius: 999, fontSize: 10, fontWeight: 700 },

  cardItem2: { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, marginBottom: 10 },
  cardItem2Left: { flex: 1, display: "flex", alignItems: "center", gap: 12, minWidth: 0 },
  cardItem2Mark: { width: 40, height: 28, borderRadius: 5, background: "linear-gradient(135deg, #EB001B, #F79E1B)", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 11, letterSpacing: ".02em", flexShrink: 0 },
  cardItem2Title: { fontSize: 13, fontWeight: 700, color: "#0E2C56" },
  cardItem2Sub: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  cardItem2Menu: { width: 30, height: 30, borderRadius: 8, background: "transparent", border: "none", cursor: "pointer", display: "grid", placeItems: "center" },

  payAdd: { width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px", background: "rgba(10,107,207,0.04)", border: "1.5px dashed rgba(10,107,207,0.30)", borderRadius: 14, cursor: "pointer" },
  payAddIcon: { width: 36, height: 36, borderRadius: 10, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  payAddTitle: { fontSize: 13.5, fontWeight: 700, color: "#0A6BCF" },
  payAddSub: { fontSize: 11, color: "#6B7280", marginTop: 2 },

  altCard: { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, marginBottom: 8 },
  oxxoMark: { width: 40, height: 28, borderRadius: 5, background: "#D40511", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 11, flexShrink: 0 },
  mpMark: { width: 40, height: 28, borderRadius: 5, background: "linear-gradient(135deg,#00B1EA,#009EE3)", display: "grid", placeItems: "center", flexShrink: 0 },
  cashMark: { width: 40, height: 28, borderRadius: 5, background: "rgba(24,166,106,0.12)", border: "1px solid rgba(24,166,106,0.30)", display: "grid", placeItems: "center", flexShrink: 0 },
  altTitle: { fontSize: 13, fontWeight: 700, color: "#0E2C56" },
  altSub: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  altAvailable: { display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", background: "rgba(24,166,106,0.12)", color: "#0F8A56", borderRadius: 999, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" },
  liveDot: { display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#18A66A", boxShadow: "0 0 0 3px rgba(24,166,106,0.20)" },
  linkBtn: { padding: "7px 14px", background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #0A6BCF", borderRadius: 10, fontSize: 11.5, fontWeight: 700, cursor: "pointer" },

  payDisclaimer: { display: "flex", alignItems: "flex-start", gap: 6, marginTop: 12, padding: "10px 12px", background: "#F8FBFF", border: "1px dashed #E1E8F0", borderRadius: 10, fontSize: 11, color: "#6B7280", lineHeight: 1.5 },

  // ===== Delete account =====
  dangerHero: { textAlign: "center", padding: "8px 16px 22px" },
  dangerIconBig: { width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg, #DC2626, #B91C1C)", display: "grid", placeItems: "center", margin: "0 auto 14px", boxShadow: "0 12px 26px rgba(220,38,38,0.35)" },
  dangerTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em" },
  dangerSub: { fontSize: 13, color: "#6B7280", marginTop: 8, lineHeight: 1.5, maxWidth: 300, marginLeft: "auto", marginRight: "auto" },

  dangerCard: { padding: 14, background: "rgba(220,38,38,0.04)", border: "1px solid rgba(220,38,38,0.20)", borderRadius: 14, marginBottom: 10 },
  dangerCardLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#DC2626", letterSpacing: ".1em", fontWeight: 700, marginBottom: 10 },
  dangerList: { display: "flex", flexDirection: "column", gap: 8 },
  dangerListRow: { display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: "#0E2C56", lineHeight: 1.45 },

  keepCard: { padding: 14, background: "rgba(24,193,255,0.06)", border: "1px solid rgba(24,193,255,0.30)", borderRadius: 14, marginBottom: 14 },
  keepCardLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#0884B0", letterSpacing: ".1em", fontWeight: 700, marginBottom: 10 },
  keepListRow: { display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "#6B7280", lineHeight: 1.45 },
  keepFootnote: { marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(24,193,255,0.20)", fontSize: 11, color: "#6B7280", lineHeight: 1.5 },

  timelineCard: { padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, marginBottom: 14 },
  timelineRow: { display: "flex", alignItems: "flex-start", gap: 10 },
  timelineDotNow: { width: 22, height: 22, borderRadius: "50%", background: "#DC2626", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 11, flexShrink: 0 },
  timelineDot: { width: 22, height: 22, borderRadius: "50%", background: "#EEF3F8", color: "#9CA3AF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 11, flexShrink: 0 },
  timelineLine: { width: 2, height: 14, background: "#E1E8F0", marginLeft: 10, borderRadius: 1 },
  timelineTitle: { fontSize: 12.5, fontWeight: 700, color: "#0E2C56" },
  timelineSub: { fontSize: 11, color: "#6B7280", marginTop: 2, lineHeight: 1.4 },

  dangerBtn: { width: "100%", marginTop: 22, padding: "14px", background: "#DC2626", color: "#FFFFFF", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(220,38,38,0.30)" },
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
