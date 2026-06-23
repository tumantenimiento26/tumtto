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
// HEADER (TECH HERO)
// =====================================================================
function TechHero() {
  return (
    <div style={p.hero}>
      <div style={p.heroOverlay} />
      <div style={p.heroGlow} />

      <div style={p.heroTop}>
        <button style={p.heroIconBtn}>
          <Ic name="qr-code" size={16} color="#FFFFFF" />
        </button>
        <span style={p.heroEyebrow}>
          <Ic name="hard-hat" size={10} color="#FBBF24" />
          <span>CUENTA PRO</span>
        </span>
        <button style={p.heroIconBtn}>
          <Ic name="share-2" size={16} color="#FFFFFF" />
        </button>
      </div>

      <div style={p.heroAvWrap}>
        <div style={p.heroAv}>
          <span>RH</span>
        </div>
        <div style={p.heroAvBadge}>
          <Ic name="check" size={14} color="#FFFFFF" stroke={3.5} />
        </div>
      </div>

      <div style={p.heroName}>Ramón Hernández García</div>
      <div style={p.heroVerifiedRow}>
        <span style={p.heroVerifiedChip}>
          <Ic name="badge-check" size={11} color="#FFFFFF" />
          <span>VERIFICADO</span>
        </span>
        <span style={p.heroDot} />
        <span style={p.heroRating}>
          <svg width="13" height="13" viewBox="0 0 24 24"><path d="M12 2.5l2.95 6.42 7.05.78-5.28 4.78 1.52 6.92L12 18.27l-6.24 3.13 1.52-6.92L2 9.7l7.05-.78L12 2.5z" fill="#FBBF24"/></svg>
          <b style={{ fontWeight: 800 }}>4.8</b>
          <span style={p.heroRatingCount}>(124)</span>
        </span>
      </div>

      <button style={p.heroPreviewBtn}>
        <Ic name="eye" size={13} color="#FFFFFF" style={{ marginRight: 6 }} />
        Vista previa pública
        <span style={p.heroPreviewArrow}>
          <Ic name="arrow-up-right" size={12} color="#0A6BCF" stroke={2.4} />
        </span>
      </button>
    </div>
  );
}

// =====================================================================
// ROW
// =====================================================================
function Row({ icon, iconTone = "blue", label, sub, badge, badgeTone, rightHint, danger, accent, disabled, last, hasArrow = true }) {
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
      opacity: disabled ? 0.55 : 1,
      cursor: disabled ? "not-allowed" : "pointer",
    }}>
      <div style={{ ...p.rowIcon, background: ic.bg }}>
        <Ic name={icon} size={15} color={ic.color} stroke={2.2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...p.rowLabel, color: danger ? "#DC2626" : accent ? "#0A6BCF" : "#0E2C56" }}>{label}</div>
        {sub && <div style={p.rowSub}>{sub}</div>}
      </div>
      {rightHint && <span style={p.rowHint}>{rightHint}</span>}
      {badge && (
        <span style={{
          ...p.badgePill,
          background: badgeTone === "amber" ? "rgba(245,158,11,0.14)" : badgeTone === "green" ? "rgba(24,166,106,0.12)" : "rgba(10,107,207,0.10)",
          color: badgeTone === "amber" ? "#B45309" : badgeTone === "green" ? "#0F8A56" : "#0A6BCF",
        }}>{badge}</span>
      )}
      {hasArrow && !danger && <Ic name="chevron-right" size={16} color="#9CA3AF" />}
      {hasArrow && danger && <Ic name="chevron-right" size={16} color="#DC2626" />}
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
// BOTTOM TABS
// =====================================================================
function BottomTabs() {
  const tabs = [
    { id: "inbox",    icon: "inbox",         label: "Inbox" },
    { id: "agenda",   icon: "calendar-days", label: "Agenda" },
    { id: "wallet",   icon: "wallet",        label: "Cartera" },
    { id: "messages", icon: "message-circle",label: "Mensajes" },
    { id: "profile",  icon: "user",          label: "Perfil", active: true },
  ];
  return (
    <div style={p.tabbar}>
      {tabs.map(t => (
        <div key={t.id} style={p.tabItem}>
          <Ic name={t.icon} size={22} color={t.active ? "#0A6BCF" : "#9CA3AF"} stroke={t.active ? 2.2 : 1.8} />
          <span style={{ ...p.tabLabel, color: t.active ? "#0A6BCF" : "#9CA3AF", fontWeight: t.active ? 700 : 500 }}>{t.label}</span>
          {t.active && <div style={p.tabActiveDot} />}
        </div>
      ))}
    </div>
  );
}

// =====================================================================
// SCREEN 01 — PROFILE MAIN
// =====================================================================
function ProfileScreen() {
  return (
    <div style={p.wrap}>
      <div style={p.body}>
        <TechHero />

        <div style={p.content}>
          {/* Quick metrics */}
          <SectionHead label="MÉTRICAS RÁPIDAS" />
          <div style={p.kpiGrid}>
            <KpiCard icon="check-check"     tone="green"  val="124"  label="completados"   delta="+8 este mes" />
            <KpiCard icon="thumbs-up"       tone="blue"   val="98%"  label="aceptación"    delta="alto" />
            <KpiCard icon="message-circle"  tone="cyan"   val="95%"  label="respuesta"     delta="<5 min" />
            <KpiCard icon="award"           tone="amber"  val="5 años" label="en la plataforma" delta="desde 2021" />
          </div>

          {/* Mi perfil profesional */}
          <SectionHead label="MI PERFIL PROFESIONAL" />
          <div style={p.card}>
            <Row icon="file-text"    iconTone="blue"  label="Bio profesional"    sub="20 años en plomería · ZMG" badge="EDITAR" badgeTone="blue" />
            <Row icon="image"        iconTone="cyan"  label="Galería de trabajos" sub="8 fotos · antes y después" rightHint="8/20" />
            <Row icon="wrench"       iconTone="blue"  label="Servicios y subcategorías" sub="Plomería · Electricidad · Gas · Pintura" rightHint="9 servicios" />
            <Row icon="tag"          iconTone="green" label="Tarifas base"        sub="Desde $350 hasta $1,200" rightHint="9 activos" />
            <Row icon="map-pin"      iconTone="amber" label="Zona de cobertura"   sub="Providencia, Lafayette y 3 más" rightHint="10 km" />
            <Row icon="calendar-days" iconTone="navy" label="Disponibilidad y agenda" sub="L–S · 54 hrs/sem · 4/día" last />
          </div>

          {/* Verificación */}
          <SectionHead label="VERIFICACIÓN" />
          <div style={p.verifyHero}>
            <div style={p.verifyIcon}>
              <Ic name="shield-check" size={20} color="#FFFFFF" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={p.verifyTitle}>Estás 100% verificado</div>
              <div style={p.verifySub}>KYC aprobado · 1 certificación activa · INE vigente hasta 2030</div>
            </div>
          </div>
          <div style={p.card}>
            <Row icon="contact"   iconTone="green" label="Documentos KYC"  sub="INE aprobado · vence 12/2030" badge="✓ AL DÍA" badgeTone="green" />
            <Row icon="graduation-cap" iconTone="amber" label="Certificaciones" sub="Gas LP · vence 2027" rightHint="1 activa" />
            <Row icon="plus" iconTone="blue" label="Sube más certificaciones" sub="Aumenta tu credibilidad y tarifa" accent last />
          </div>

          {/* Pagos */}
          <SectionHead label="PAGOS" />
          <div style={p.card}>
            <Row icon="landmark" iconTone="blue" label="Cuenta bancaria"
              sub={(<span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={p.bbvaMark}>BBVA</span>
                <span>•••• 1234 · CLABE verificada</span>
              </span>)}
              badge="✓ VERIFICADA" badgeTone="green" />
            <Row icon="file-spreadsheet" iconTone="gray" label="Historial fiscal" sub="CFDI · constancia · próximamente" badge="MVP" badgeTone="amber" disabled last />
          </div>

          {/* Configuración */}
          <SectionHead label="CONFIGURACIÓN" />
          <div style={p.card}>
            <Row icon="bell"     iconTone="amber" label="Notificaciones"    sub="Push · email · WhatsApp" />
            <Row icon="globe"    iconTone="gray"  label="Idioma" rightHint="Español MX" />
            <Row icon="lock"     iconTone="gray"  label="Privacidad y seguridad" sub="2FA · sesiones · datos" />
            <Row icon="calendar-clock" iconTone="gray" label="Sincronización con calendario externo"
                 sub="Google · Outlook · iCal" badge="PRÓXIMAMENTE" badgeTone="amber" disabled last />
          </div>

          {/* Ayuda y soporte */}
          <SectionHead label="AYUDA Y SOPORTE" />
          <div style={p.card}>
            <Row icon="life-buoy"      iconTone="cyan" label="Centro de ayuda"      sub="Preguntas frecuentes" />
            <Row icon="message-square" iconTone="blue" label="Soporte técnico"      sub="Chat dedicado para PROs" rightHint="9–21 hrs" />
            <Row icon="file-text"      iconTone="gray" label="Términos del técnico" />
            <Row icon="scale"          iconTone="gray" label="Política de comisiones" sub="15% por servicio cobrado" last />
          </div>

          {/* Cuenta */}
          <SectionHead label="CUENTA" />
          <div style={p.card}>
            <Row icon="log-out" iconTone="blue"  label="Cerrar sesión" accent />
            <Row icon="pause"   iconTone="amber" label="Pausar mi cuenta"
              sub="Tu cuenta queda oculta para clientes pero conservas tu historial" />
            <Row icon="trash-2" iconTone="red"   label="Eliminar mi cuenta"
              sub="Conforme LFPDPPP · puede tardar hasta 30 días" danger last />
          </div>

          {/* Footer */}
          <div style={p.footer}>
            <div style={p.brandFoot}>
              <div style={p.brandFootLogo}>Tu<span style={{ color: "#0A6BCF" }}>mantenimiento</span> <span style={p.brandFootPro}>PRO</span></div>
              <div style={p.brandFootMeta}>Para profesionales del oficio · ZMG</div>
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

function KpiCard({ icon, tone, val, label, delta }) {
  const toneMap = {
    green: { bg: "rgba(24,166,106,0.12)", color: "#0F8A56" },
    blue:  { bg: "rgba(10,107,207,0.10)", color: "#0A6BCF" },
    cyan:  { bg: "rgba(24,193,255,0.18)", color: "#0884B0" },
    amber: { bg: "rgba(245,158,11,0.14)", color: "#B45309" },
  };
  const v = toneMap[tone];
  return (
    <div style={p.kpiCard}>
      <div style={{ ...p.kpiIcon, background: v.bg }}>
        <Ic name={icon} size={14} color={v.color} stroke={2.4} />
      </div>
      <div style={p.kpiVal}>{val}</div>
      <div style={p.kpiLabel}>{label}</div>
      {delta && (
        <div style={p.kpiDelta}>
          <span style={{ ...p.kpiDeltaDot, background: v.color }} />
          <span>{delta}</span>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// SCREEN 02 — VISTA PREVIA PÚBLICA (lo que ve el cliente)
// =====================================================================
function PublicPreview() {
  return (
    <div style={p.wrap}>
      {/* Faux client header */}
      <div style={p.previewClientHeader}>
        <button style={p.iconBtnGhost}><Ic name="arrow-left" size={17} color="#FFFFFF" /></button>
        <span style={p.previewBadge}>
          <Ic name="eye" size={11} color="#0A6BCF" />
          <span>VISTA PREVIA · CLIENTE</span>
        </span>
        <button style={p.iconBtnGhost}><Ic name="heart" size={17} color="#FFFFFF" /></button>
      </div>

      <div style={p.bodyPublic}>
        {/* Cover */}
        <div style={p.publicCover}>
          <div style={p.publicCoverBg}>
            <div style={p.publicCoverGlow} />
          </div>
          <div style={p.publicAvWrap}>
            <div style={p.publicAv}>RH</div>
            <div style={p.publicAvBadge}>
              <Ic name="check" size={12} color="#FFFFFF" stroke={3.5} />
            </div>
          </div>
        </div>

        {/* Identity */}
        <div style={p.publicIdentity}>
          <div style={p.publicName}>Ramón Hernández García</div>
          <div style={p.publicTrade}>Plomería · 20 años de oficio</div>
          <div style={p.publicTagsRow}>
            <span style={p.publicTagGreen}>
              <Ic name="badge-check" size={10} color="#0F8A56" />
              <span>Verificado</span>
            </span>
            <span style={p.publicTagBlue}>
              <Ic name="award" size={10} color="#0A6BCF" />
              <span>Top en Providencia</span>
            </span>
            <span style={p.publicTagAmber}>
              <Ic name="clock" size={10} color="#B45309" />
              <span>Responde &lt;5 min</span>
            </span>
          </div>

          {/* Rating + KPIs row */}
          <div style={p.publicStatsRow}>
            <div style={p.publicStat}>
              <div style={p.publicStatVal}>
                <svg width="14" height="14" viewBox="0 0 24 24"><path d="M12 2.5l2.95 6.42 7.05.78-5.28 4.78 1.52 6.92L12 18.27l-6.24 3.13 1.52-6.92L2 9.7l7.05-.78L12 2.5z" fill="#F59E0B"/></svg>
                4.8
              </div>
              <div style={p.publicStatLabel}>124 reseñas</div>
            </div>
            <div style={p.publicStatDiv} />
            <div style={p.publicStat}>
              <div style={p.publicStatVal}>124</div>
              <div style={p.publicStatLabel}>servicios</div>
            </div>
            <div style={p.publicStatDiv} />
            <div style={p.publicStat}>
              <div style={p.publicStatVal}>5 años</div>
              <div style={p.publicStatLabel}>en la app</div>
            </div>
          </div>

          {/* Bio */}
          <p style={p.publicBio}>
            Plomero con 20 años atendiendo casas y comercios en la ZMG. Especialista en fugas, calentadores y drenajes. Trabajo limpio y con garantía de 6 meses en mano de obra.
          </p>

          {/* Services chips */}
          <div style={p.publicChipsRow}>
            <div style={p.publicChip}>
              <Ic name="wrench" size={11} color="#0A6BCF" />
              <span>Plomería</span>
              <span style={p.publicChipFrom}>desde $350</span>
            </div>
            <div style={p.publicChip}>
              <Ic name="zap" size={11} color="#0884B0" />
              <span>Electricidad</span>
              <span style={p.publicChipFrom}>desde $420</span>
            </div>
            <div style={p.publicChip}>
              <Ic name="flame" size={11} color="#B45309" />
              <span>Gas</span>
              <span style={p.publicChipFrom}>desde $480</span>
            </div>
          </div>
        </div>

        {/* Gallery preview */}
        <div style={p.publicGallery}>
          <div style={p.publicGalleryHead}>
            <span style={p.publicGalleryLabel}>TRABAJOS RECIENTES · 8</span>
            <span style={p.publicGalleryAll}>Ver todos</span>
          </div>
          <div style={p.publicGalleryRow}>
            {[
              "linear-gradient(135deg,#0A6BCF,#0894EA)",
              "linear-gradient(135deg,#18A66A,#4ED896)",
              "linear-gradient(135deg,#B45309,#F59E0B)",
              "linear-gradient(135deg,#0884B0,#18C1FF)",
            ].map((t, i) => (
              <div key={i} style={{ ...p.publicGalleryTile, background: t }}>
                <Ic name="image" size={14} color="rgba(255,255,255,0.85)" />
                <span style={p.publicGalleryTag}>{["Antes", "Después", "Llave", "Sellado"][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini review */}
        <div style={p.publicReview}>
          <div style={p.publicReviewHead}>
            <div style={p.publicReviewAv}>AA</div>
            <div style={{ flex: 1 }}>
              <div style={p.publicReviewName}>Ana Aguirre</div>
              <div style={p.publicReviewMeta}>
                <span style={{ display: "inline-flex", gap: 1 }}>
                  {[1,2,3,4,5].map(n => (
                    <svg key={n} width="9" height="9" viewBox="0 0 24 24"><path d="M12 2.5l2.95 6.42 7.05.78-5.28 4.78 1.52 6.92L12 18.27l-6.24 3.13 1.52-6.92L2 9.7l7.05-.78L12 2.5z" fill="#F59E0B"/></svg>
                  ))}
                </span>
                <span style={p.bullet} />
                <span>hace 1 día</span>
              </div>
            </div>
          </div>
          <p style={p.publicReviewText}>
            "Llegó puntual, dejó todo limpio y arregló la fuga rápido. Muy recomendado."
          </p>
        </div>
      </div>

      {/* Floating control bar */}
      <div style={p.previewControlBar}>
        <button style={p.previewEditBtn}>
          <Ic name="pencil" size={13} color="#0A6BCF" style={{ marginRight: 6 }} />
          Volver a editar
        </button>
        <button style={p.previewShareBtn}>
          <Ic name="share-2" size={13} color="#FFFFFF" style={{ marginRight: 6 }} />
          Compartir mi perfil
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// SCREEN 03 — EDITAR BIO + GALERÍA
// =====================================================================
function EditBioGallery() {
  const BIO = "Plomero con 20 años atendiendo casas y comercios en la ZMG. Especialista en fugas, calentadores y drenajes. Trabajo limpio, garantía de 6 meses en mano de obra.";
  return (
    <div style={p.wrap}>
      <div style={p.subHeader}>
        <button style={p.iconBtn}><Ic name="arrow-left" size={17} color="#0E2C56" /></button>
        <div style={p.subHeaderCenter}>
          <div style={p.subHeaderLabel}>EDITAR</div>
          <div style={p.subHeaderTitle}>Bio y galería</div>
        </div>
        <button style={p.subHeaderSave}>Guardar</button>
      </div>

      <div style={p.bodyPlain}>
        {/* Completeness */}
        <div style={p.meterCard}>
          <div style={p.meterRow}>
            <span style={p.meterLabel}>COMPLETITUD</span>
            <span style={p.meterVal}>82%</span>
          </div>
          <div style={p.meterTrack}>
            <div style={{ ...p.meterFill, width: "82%" }} />
          </div>
          <div style={p.meterSub}>
            <Ic name="info" size={10} color="#0A6BCF" />
            <span>Sube <b style={{ color: "#0E2C56", fontWeight: 700 }}>2 fotos antes/después</b> para llegar al 92%</span>
          </div>
        </div>

        {/* Bio */}
        <SectionLabel n="A" label="BIO PROFESIONAL" sub="Cómo te presentas a clientes" />
        <div style={p.bioBox}>
          <div style={p.bioText}>{BIO}</div>
          <div style={p.bioFoot}>
            <div style={p.bioMicChip}>
              <Ic name="mic" size={11} color="#0A6BCF" />
              <span>Dictar</span>
            </div>
            <div style={p.bioMicChip}>
              <Ic name="sparkles" size={11} color="#0A6BCF" />
              <span>Mejorar con IA</span>
            </div>
            <span style={p.bioCount}>{BIO.length}/500</span>
          </div>
        </div>

        {/* Gallery */}
        <SectionLabel n="B" label="GALERÍA DE TRABAJOS" sub="Antes / después · refacciones · acabados" right={<span style={p.photoBadge}>8/20</span>} />
        <div style={p.tipAmber}>
          <Ic name="lightbulb" size={12} color="#B45309" />
          <span>Las fotos <b style={{ color: "#0E2C56", fontWeight: 700 }}>antes / después</b> son las más efectivas para ganar la confianza del cliente.</span>
        </div>
        <div style={p.photoGrid}>
          <div style={p.photoAdd}>
            <Ic name="camera" size={22} color="#0A6BCF" />
            <span style={p.photoAddText}>Subir</span>
          </div>
          {[
            { tone: "linear-gradient(135deg,#0A6BCF,#18C1FF)", tag: "Antes",     pair: true },
            { tone: "linear-gradient(135deg,#18A66A,#4ED896)", tag: "Después",   pair: true },
            { tone: "linear-gradient(135deg,#0E2C56,#0894EA)", tag: "Calentador" },
            { tone: "linear-gradient(135deg,#B45309,#F59E0B)", tag: "Llave" },
            { tone: "linear-gradient(135deg,#0884B0,#18C1FF)", tag: "Sellado" },
            { tone: "linear-gradient(135deg,#7C3AED,#A78BFA)", tag: "WC" },
            { tone: "linear-gradient(135deg,#18A66A,#4ED896)", tag: "Drenaje" },
            { tone: "linear-gradient(135deg,#0A6BCF,#0894EA)", tag: "Cisterna" },
          ].map((ph, idx) => (
            <div key={idx} style={{ ...p.photoTile, background: ph.tone }}>
              <Ic name="image" size={16} color="rgba(255,255,255,0.85)" />
              <span style={p.photoTag}>{ph.tag}</span>
              {ph.pair && (
                <span style={p.photoPairChip}>
                  <Ic name="link-2" size={8} color="#FFFFFF" />
                </span>
              )}
              <button style={p.photoRemove}>
                <Ic name="x" size={10} color="#FFFFFF" stroke={3} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={p.singleFooter}>
        <button style={p.primaryBtn}>
          <Ic name="check" size={15} color="#FFFFFF" stroke={2.6} style={{ marginRight: 8 }} />
          <span>Guardar cambios</span>
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// SCREEN 04 — DOCUMENTOS KYC
// =====================================================================
function KycDocsScreen() {
  return (
    <div style={p.wrap}>
      <div style={p.subHeader}>
        <button style={p.iconBtn}><Ic name="arrow-left" size={17} color="#0E2C56" /></button>
        <div style={p.subHeaderCenter}>
          <div style={p.subHeaderLabel}>VERIFICACIÓN</div>
          <div style={p.subHeaderTitle}>Documentos KYC</div>
        </div>
        <button style={p.iconBtnSm}>
          <Ic name="info" size={15} color="#0A6BCF" />
        </button>
      </div>

      <div style={p.bodyPlain}>
        {/* Status banner */}
        <div style={p.kycBanner}>
          <div style={p.kycBannerIcon}>
            <Ic name="shield-check" size={22} color="#FFFFFF" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={p.kycBannerTitle}>Tu identidad está verificada</div>
            <div style={p.kycBannerSub}>Aprobada el 14/02/2024 · próxima revisión en 12/2030</div>
          </div>
          <span style={p.kycBannerChip}>100%</span>
        </div>

        {/* Renewal reminder */}
        <SectionLabel n="A" label="ESTADO POR DOCUMENTO" />
        <div style={p.docsList}>
          <DocCard kind="ine"      status="approved" />
          <DocCard kind="curp"     status="approved" />
          <DocCard kind="address"  status="renew" />
          <DocCard kind="selfie"   status="approved" />
        </div>

        {/* Certifications */}
        <SectionLabel n="B" label="CERTIFICACIONES · 1 ACTIVA" />
        <div style={p.docsList}>
          <CertCard kind="gas" status="approved" />
          <CertCard kind="electric" status="expired" />
        </div>

        <button style={p.uploadCta}>
          <div style={p.uploadCtaIcon}>
            <Ic name="file-up" size={18} color="#FFFFFF" />
          </div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={p.uploadCtaTitle}>Subir nuevo documento</div>
            <div style={p.uploadCtaSub}>PDF o foto · máx 5 MB por archivo</div>
          </div>
          <Ic name="chevron-right" size={14} color="#FFFFFF" />
        </button>

        {/* Privacy footer */}
        <div style={p.privacyFooter}>
          <Ic name="lock" size={12} color="#0F8A56" />
          <span>Cifrado · solo el equipo autorizado de Tumantenimiento puede ver tus documentos. <a href="#" style={p.privLink}>LFPDPPP</a></span>
        </div>
      </div>
    </div>
  );
}

function DocCard({ kind, status }) {
  const meta = {
    ine: {
      title: "INE / IFE",
      sub: "Identificación oficial",
      issued: "14/02/2024",
      expires: "12/2030",
      previewTone: "linear-gradient(135deg, #15803D, #16A34A)",
    },
    curp: {
      title: "CURP",
      sub: "Clave única de registro",
      issued: "14/02/2024",
      expires: "permanente",
      previewTone: "linear-gradient(135deg, #0E2C56, #0894EA)",
    },
    address: {
      title: "Comprobante de domicilio",
      sub: "Recibo CFE · luz",
      issued: "12/2023",
      expires: "12/2024",
      previewTone: "linear-gradient(135deg, #B45309, #F59E0B)",
    },
    selfie: {
      title: "Selfie de verificación",
      sub: "Validación biométrica",
      issued: "14/02/2024",
      expires: "—",
      previewTone: "linear-gradient(135deg, #7C3AED, #A78BFA)",
    },
  };
  const m = meta[kind];
  const statusMap = {
    approved: { color: "#0F8A56", bg: "rgba(24,166,106,0.12)", icon: "badge-check", label: "Aprobado" },
    renew:    { color: "#B45309", bg: "rgba(245,158,11,0.14)", icon: "alarm-clock", label: "Por renovar" },
    expired:  { color: "#DC2626", bg: "rgba(220,38,38,0.10)",  icon: "x-circle",    label: "Vencido" },
  };
  const s = statusMap[status];
  return (
    <div style={p.docCard}>
      <div style={{ ...p.docThumb, background: m.previewTone }}>
        <Ic name="file-text" size={22} color="rgba(255,255,255,0.90)" />
        <span style={p.docThumbCorner}>
          <Ic name="check" size={9} color="#FFFFFF" stroke={3.5} />
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={p.docTopRow}>
          <div style={p.docTitle}>{m.title}</div>
          <span style={{ ...p.docStatus, background: s.bg, color: s.color }}>
            <Ic name={s.icon} size={10} color={s.color} />
            <span>{s.label}</span>
          </span>
        </div>
        <div style={p.docSub}>{m.sub}</div>
        <div style={p.docDates}>
          <div style={p.docDate}>
            <span style={p.docDateLabel}>Aprobado</span>
            <span style={p.docDateVal}>{m.issued}</span>
          </div>
          <span style={p.docDateBullet} />
          <div style={p.docDate}>
            <span style={p.docDateLabel}>Vence</span>
            <span style={{ ...p.docDateVal, color: status === "renew" ? "#B45309" : "#0E2C56" }}>{m.expires}</span>
          </div>
        </div>
        {status === "renew" && (
          <button style={p.renewBtn}>
            <Ic name="rotate-cw" size={11} color="#FFFFFF" />
            <span>Renovar ahora</span>
          </button>
        )}
      </div>
    </div>
  );
}

function CertCard({ kind, status }) {
  const meta = {
    gas: {
      title: "Manejo Seguro de Gas LP",
      issuer: "ONNCCE · 2024",
      tone: "linear-gradient(135deg,#DC2626,#F59E0B)",
      icon: "flame",
      id: "ONN-2024-1148",
    },
    electric: {
      title: "Instalador Eléctrico Residencial",
      issuer: "CFE Capacitación · 2022",
      tone: "linear-gradient(135deg,#9CA3AF,#6B7280)",
      icon: "zap",
      id: "CFE-2022-0392",
    },
  };
  const m = meta[kind];
  const statusMap = {
    approved: { color: "#0F8A56", bg: "rgba(24,166,106,0.12)", label: "Vigente 2027" },
    expired:  { color: "#DC2626", bg: "rgba(220,38,38,0.10)",  label: "Vencido · 2024" },
  };
  const s = statusMap[status];
  return (
    <div style={p.certCard}>
      <div style={{ ...p.certBadge, background: m.tone, opacity: status === "expired" ? 0.6 : 1 }}>
        <Ic name={m.icon} size={18} color="#FFFFFF" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={p.certTitle}>{m.title}</div>
        <div style={p.certIssuer}>{m.issuer}</div>
        <div style={p.certId}>{m.id}</div>
      </div>
      <span style={{ ...p.docStatus, background: s.bg, color: s.color }}>
        <span>{s.label}</span>
      </span>
    </div>
  );
}

function SectionLabel({ n, label, sub, right }) {
  return (
    <div style={p.sectionLabelRow}>
      <div style={p.sectionLabelNum}>{n}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={p.sectionLabelLabel}>{label}</div>
        {sub && <div style={p.sectionLabelSub}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

// =====================================================================
// SCREEN 05 — PAUSE ACCOUNT
// =====================================================================
function PauseAccountScreen() {
  return (
    <div style={p.wrap}>
      <div style={p.subHeader}>
        <button style={p.iconBtn}><Ic name="arrow-left" size={17} color="#0E2C56" /></button>
        <div style={p.subHeaderCenter}>
          <div style={p.subHeaderLabel}>CUENTA</div>
          <div style={p.subHeaderTitle}>Pausar mi cuenta</div>
        </div>
        <span />
      </div>

      <div style={p.bodyPlain}>
        <div style={p.pauseHero}>
          <div style={p.pauseIconBig}>
            <Ic name="pause" size={32} color="#FFFFFF" />
          </div>
          <div style={p.pauseTitle}>¿Tomar un descanso?</div>
          <div style={p.pauseSub}>
            Tu cuenta queda <b style={{ color: "#0E2C56", fontWeight: 700 }}>oculta para clientes</b> pero conservas tu historial, reseñas y rating.
          </div>
        </div>

        <SectionLabel n="A" label="QUÉ PASA AL PAUSAR" />
        <div style={p.checklistCard}>
          <CheckRow icon="eye-off" label="Tu perfil deja de aparecer en búsquedas" sub="No recibirás nuevas solicitudes" />
          <CheckRow icon="archive" label="Tus 124 reseñas se conservan"           sub="Listas para cuando regreses" />
          <CheckRow icon="award"   label="Tu rating y badges se mantienen"        sub="No pierdes nada de credibilidad" />
          <CheckRow icon="calendar-check" label="Servicios ya aceptados continúan" sub="Debes atender los compromisos vigentes" />
        </div>

        <SectionLabel n="B" label="POR CUÁNTO TIEMPO" />
        <div style={p.pauseDurationRow}>
          {[
            { label: "1 semana" },
            { label: "1 mes", sel: true },
            { label: "3 meses" },
            { label: "Indefinido" },
          ].map((d, idx) => (
            <div key={idx} style={{ ...p.pauseDuration, ...(d.sel ? p.pauseDurationSel : null) }}>
              <span>{d.label}</span>
              {d.sel && <Ic name="check" size={11} color="#FFFFFF" stroke={3} />}
            </div>
          ))}
        </div>

        <SectionLabel n="C" label="MOTIVO" sub="Opcional · nos ayuda a mejorar" />
        <div style={p.reasonGrid}>
          {[
            { id: "vacation", label: "Vacaciones",       icon: "plane" },
            { id: "personal", label: "Asuntos personales", icon: "heart" },
            { id: "health",   label: "Salud",            icon: "stethoscope" },
            { id: "low-work", label: "Poca demanda",     icon: "trending-down" },
            { id: "other",    label: "Otro",             icon: "more-horizontal" },
          ].map(r => (
            <div key={r.id} style={p.reasonChip}>
              <Ic name={r.icon} size={12} color="#0A6BCF" />
              <span>{r.label}</span>
            </div>
          ))}
        </div>

        <div style={p.pauseInfoCard}>
          <Ic name="info" size={13} color="#0A6BCF" />
          <span>
            Te avisamos por notificación <b style={{ color: "#0E2C56", fontWeight: 700 }}>3 días antes</b> de reactivar. Puedes reactivar antes desde aquí.
          </span>
        </div>
      </div>

      <div style={p.singleFooterStack}>
        <button style={p.pauseBtn}>
          <Ic name="pause" size={15} color="#FFFFFF" style={{ marginRight: 8 }} />
          <span>Pausar 1 mes · hasta 19/06/2026</span>
        </button>
        <button style={p.ghostBtn}>Cancelar</button>
      </div>
    </div>
  );
}

function CheckRow({ icon, label, sub }) {
  return (
    <div style={p.checklistRow}>
      <div style={p.checklistIcon}>
        <Ic name={icon} size={13} color="#0A6BCF" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={p.checklistLabel}>{label}</div>
        <div style={p.checklistSub}>{sub}</div>
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
      <DCSection id="main" title="Perfil del técnico" subtitle="Settings · cuenta PRO · Tumantenimiento">
        <DCArtboard id="profile" label="01 · Perfil principal" width={438} height={892}>
          <PhoneFrame><ProfileScreen /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="preview" label="02 · Vista previa pública" width={438} height={892}>
          <PhoneFrame><PublicPreview /></PhoneFrame>
        </DCArtboard>
      </DCSection>

      <DCSection id="edit" title="Editar y verificar" subtitle="Bio · galería · KYC">
        <DCArtboard id="bio" label="03 · Editar bio y galería" width={438} height={892}>
          <PhoneFrame><EditBioGallery /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="kyc" label="04 · Documentos KYC" width={438} height={892}>
          <PhoneFrame><KycDocsScreen /></PhoneFrame>
        </DCArtboard>
      </DCSection>

      <DCSection id="account" title="Acciones de cuenta" subtitle="Pausar — descanso amigable">
        <DCArtboard id="pause" label="05 · Pausar mi cuenta" width={438} height={892}>
          <PhoneFrame><PauseAccountScreen /></PhoneFrame>
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
  body: { flex: 1, overflowY: "auto", paddingBottom: 96 },
  bodyPlain: { flex: 1, overflowY: "auto", padding: "16px 16px 110px" },
  bodyPublic: { flex: 1, overflowY: "auto", paddingBottom: 100 },

  // ===== Hero =====
  hero: { position: "relative", padding: "52px 20px 22px", background: "linear-gradient(160deg, #0E2C56 0%, #0A6BCF 50%, #0894EA 110%)", color: "#FFFFFF", borderRadius: "0 0 28px 28px", overflow: "hidden" },
  heroOverlay: { position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 0%, rgba(24,193,255,0.40), transparent 55%)", pointerEvents: "none" },
  heroGlow: { position: "absolute", left: -40, bottom: -40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,158,11,0.22), transparent 70%)", pointerEvents: "none" },

  heroTop: { position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  heroIconBtn: { width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.18)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0, backdropFilter: "blur(6px)" },
  heroEyebrow: { display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", background: "rgba(245,158,11,0.85)", borderRadius: 999, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#FFFFFF", letterSpacing: ".10em", fontWeight: 800, boxShadow: "0 4px 10px rgba(245,158,11,0.30)" },

  heroAvWrap: { position: "relative", width: 100, height: 100, margin: "0 auto 12px" },
  heroAv: { position: "relative", width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg, #F59E0B, #FBBF24)", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 34, letterSpacing: "-0.02em", boxShadow: "0 12px 28px rgba(14,44,86,0.40)", border: "3px solid rgba(255,255,255,0.25)" },
  heroAvBadge: { position: "absolute", right: -2, bottom: 0, width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#18A66A,#4ED896)", border: "3px solid #0A6BCF", display: "grid", placeItems: "center" },

  heroName: { position: "relative", fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", textAlign: "center" },
  heroVerifiedRow: { position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 6 },
  heroVerifiedChip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", background: "linear-gradient(135deg,#18A66A,#4ED896)", color: "#FFFFFF", borderRadius: 999, fontSize: 9.5, fontWeight: 800, letterSpacing: ".06em", fontFamily: "'JetBrains Mono', monospace", boxShadow: "0 4px 10px rgba(24,166,106,0.30)" },
  heroDot: { width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.5)" },
  heroRating: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "#FFFFFF" },
  heroRatingCount: { fontSize: 11, opacity: 0.75 },

  heroPreviewBtn: { position: "relative", display: "inline-flex", alignItems: "center", padding: "10px 14px 10px 16px", background: "rgba(255,255,255,0.14)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.28)", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer", margin: "16px auto 0", display: "flex", backdropFilter: "blur(6px)" },
  heroPreviewArrow: { marginLeft: 8, width: 22, height: 22, borderRadius: "50%", background: "#FFFFFF", display: "grid", placeItems: "center" },

  // ===== Section content =====
  content: { padding: "12px 16px 30px" },
  sectionHead: { display: "flex", alignItems: "center", gap: 5, padding: "16px 6px 8px", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF", letterSpacing: ".12em", fontWeight: 700 },

  // KPIs
  kpiGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  kpiCard: { padding: "12px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14 },
  kpiIcon: { width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center", marginBottom: 6 },
  kpiVal: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 19, color: "#0E2C56", letterSpacing: "-0.02em", lineHeight: 1 },
  kpiLabel: { fontSize: 11, color: "#6B7280", marginTop: 3, textTransform: "uppercase", letterSpacing: ".04em", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
  kpiDelta: { display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 10, color: "#6B7280", fontWeight: 600 },
  kpiDeltaDot: { width: 5, height: 5, borderRadius: "50%" },

  // Card / Row
  card: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, overflow: "hidden" },
  row: { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" },
  rowBorder: { borderBottom: "1px solid #F0F4F9" },
  rowIcon: { width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0 },
  rowLabel: { fontSize: 13.5, fontWeight: 600 },
  rowSub: { fontSize: 11.5, color: "#6B7280", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  rowHint: { color: "#6B7280", fontSize: 12, fontWeight: 600 },
  badgePill: { padding: "2px 8px", borderRadius: 999, fontSize: 9, fontWeight: 800, letterSpacing: ".06em", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" },
  bbvaMark: { padding: "1px 5px", background: "#004481", color: "#FFFFFF", borderRadius: 3, fontFamily: "'Manrope', sans-serif", fontSize: 8.5, fontWeight: 800, letterSpacing: ".02em" },

  // Verify hero
  verifyHero: { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "linear-gradient(135deg, #18A66A, #4ED896)", color: "#FFFFFF", borderRadius: 16, marginBottom: 8, boxShadow: "0 8px 18px rgba(24,166,106,0.30)" },
  verifyIcon: { width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.18)", display: "grid", placeItems: "center", flexShrink: 0 },
  verifyTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em" },
  verifySub: { fontSize: 11.5, color: "rgba(255,255,255,0.85)", marginTop: 3 },

  // Footer brand
  footer: { textAlign: "center", marginTop: 24, padding: "20px 16px" },
  brandFoot: { marginBottom: 14 },
  brandFootLogo: { fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.01em" },
  brandFootPro: { padding: "1px 5px", background: "#F59E0B", color: "#FFFFFF", borderRadius: 3, fontSize: 9, fontWeight: 800, letterSpacing: ".08em", marginLeft: 4, verticalAlign: "middle" },
  brandFootMeta: { fontSize: 11, color: "#9CA3AF", marginTop: 4 },
  versionRow: { display: "flex", justifyContent: "center", alignItems: "center", gap: 8 },
  versionChip: { padding: "3px 10px", background: "rgba(10,107,207,0.08)", color: "#0A6BCF", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: ".06em", fontFamily: "'JetBrains Mono', monospace" },
  versionBuild: { fontSize: 10.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" },
  versionDesc: { fontSize: 10.5, color: "#9CA3AF", marginTop: 8 },

  // Tabbar
  tabbar: { position: "absolute", left: 0, right: 0, bottom: 0, height: 82, background: "rgba(255,255,255,0.96)", borderTop: "1px solid #E1E8F0", display: "flex", justifyContent: "space-around", alignItems: "flex-start", padding: "10px 4px 24px", backdropFilter: "blur(8px)", zIndex: 5 },
  tabItem: { position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1, padding: "4px 0" },
  tabLabel: { fontSize: 10, marginTop: 1 },
  tabActiveDot: { position: "absolute", bottom: 2, width: 4, height: 4, borderRadius: "50%", background: "#0A6BCF" },

  // ===== Sub header =====
  subHeader: { display: "flex", alignItems: "center", gap: 10, padding: "50px 16px 12px", background: "#FFFFFF", borderBottom: "1px solid #F0F4F9", flexShrink: 0 },
  subHeaderCenter: { flex: 1, textAlign: "center", minWidth: 0 },
  subHeaderLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#9CA3AF", letterSpacing: ".1em", fontWeight: 700 },
  subHeaderTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 17, fontWeight: 700, color: "#0E2C56", marginTop: 2, letterSpacing: "-0.01em" },
  subHeaderSave: { padding: "8px 14px", background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(10,107,207,0.30)", flexShrink: 0 },
  iconBtn: { width: 38, height: 38, borderRadius: 11, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  iconBtnGhost: { width: 38, height: 38, borderRadius: 11, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0, backdropFilter: "blur(6px)" },
  iconBtnSm: { width: 34, height: 34, borderRadius: 9, background: "rgba(10,107,207,0.08)", border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },

  // ===== Public preview =====
  previewClientHeader: { position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "50px 16px 14px", background: "linear-gradient(135deg, #0A6BCF, #0894EA)", flexShrink: 0, zIndex: 3 },
  previewBadge: { display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", background: "#FFFFFF", color: "#0A6BCF", borderRadius: 999, fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, fontWeight: 800, letterSpacing: ".08em", boxShadow: "0 4px 10px rgba(14,44,86,0.20)" },

  publicCover: { position: "relative", height: 80 },
  publicCoverBg: { position: "absolute", inset: 0, background: "linear-gradient(135deg, #0A6BCF, #0894EA)", overflow: "hidden" },
  publicCoverGlow: { position: "absolute", inset: 0, background: "radial-gradient(circle at 70% 0%, rgba(24,193,255,0.45), transparent 60%)" },
  publicAvWrap: { position: "absolute", left: "50%", bottom: -42, transform: "translateX(-50%)", width: 96, height: 96 },
  publicAv: { width: 96, height: 96, borderRadius: "50%", background: "linear-gradient(135deg,#F59E0B,#FBBF24)", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 28, border: "4px solid #F8FBFF", boxShadow: "0 12px 28px rgba(14,44,86,0.30)" },
  publicAvBadge: { position: "absolute", right: -2, bottom: 4, width: 26, height: 26, borderRadius: "50%", background: "#18A66A", border: "3px solid #F8FBFF", display: "grid", placeItems: "center" },

  publicIdentity: { padding: "54px 18px 0", textAlign: "center" },
  publicName: { fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em" },
  publicTrade: { fontSize: 12.5, color: "#6B7280", marginTop: 4 },
  publicTagsRow: { display: "inline-flex", flexWrap: "wrap", justifyContent: "center", gap: 6, marginTop: 12 },
  publicTagGreen: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", background: "rgba(24,166,106,0.12)", color: "#0F8A56", borderRadius: 999, fontSize: 10.5, fontWeight: 700 },
  publicTagBlue: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", background: "rgba(10,107,207,0.10)", color: "#0A6BCF", borderRadius: 999, fontSize: 10.5, fontWeight: 700 },
  publicTagAmber: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", background: "rgba(245,158,11,0.14)", color: "#B45309", borderRadius: 999, fontSize: 10.5, fontWeight: 700 },

  publicStatsRow: { display: "flex", alignItems: "stretch", padding: "12px 0", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, marginTop: 14 },
  publicStat: { flex: 1, textAlign: "center" },
  publicStatVal: { display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 16, color: "#0E2C56", letterSpacing: "-0.01em", lineHeight: 1 },
  publicStatLabel: { fontSize: 10, color: "#6B7280", marginTop: 4, textTransform: "uppercase", letterSpacing: ".04em", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
  publicStatDiv: { width: 1, background: "#E1E8F0" },

  publicBio: { fontSize: 12.5, color: "#0E2C56", lineHeight: 1.6, padding: "16px 4px 0", textAlign: "left" },

  publicChipsRow: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14, paddingBottom: 8, justifyContent: "center" },
  publicChip: { display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 11px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 999, fontSize: 11.5, color: "#0E2C56", fontWeight: 600 },
  publicChipFrom: { color: "#0F8A56", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, marginLeft: 4 },

  publicGallery: { padding: "14px 18px 4px" },
  publicGalleryHead: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 },
  publicGalleryLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF", letterSpacing: ".1em", fontWeight: 700 },
  publicGalleryAll: { color: "#0A6BCF", fontSize: 11.5, fontWeight: 700 },
  publicGalleryRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 },
  publicGalleryTile: { position: "relative", aspectRatio: "1", borderRadius: 10, display: "grid", placeItems: "center" },
  publicGalleryTag: { position: "absolute", left: 4, bottom: 4, padding: "1px 6px", background: "rgba(14,44,86,0.65)", color: "#FFFFFF", borderRadius: 4, fontSize: 9, fontWeight: 600 },

  publicReview: { margin: "14px 18px 100px", padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14 },
  publicReviewHead: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  publicReviewAv: { width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#7C3AED,#A78BFA)", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 12 },
  publicReviewName: { fontSize: 12.5, fontWeight: 700, color: "#0E2C56" },
  publicReviewMeta: { display: "inline-flex", alignItems: "center", gap: 4, marginTop: 2, fontSize: 10.5, color: "#6B7280" },
  publicReviewText: { fontSize: 12, color: "#0E2C56", lineHeight: 1.55, margin: 0, fontStyle: "italic" },
  bullet: { width: 2, height: 2, borderRadius: "50%", background: "#9CA3AF", margin: "0 2px" },

  previewControlBar: { position: "absolute", left: 0, right: 0, bottom: 0, background: "linear-gradient(180deg, rgba(248,251,255,0) 0%, #F8FBFF 30%)", padding: "20px 16px 28px", display: "flex", gap: 8, zIndex: 5 },
  previewEditBtn: { flex: 1, padding: "12px", background: "#FFFFFF", color: "#0A6BCF", border: "1.5px solid #0A6BCF", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(14,44,86,0.10)" },
  previewShareBtn: { flex: 1, padding: "12px", background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(10,107,207,0.30)" },

  // ===== Section labels =====
  sectionLabelRow: { display: "flex", alignItems: "center", gap: 10, margin: "18px 0 10px" },
  sectionLabelNum: { width: 22, height: 22, borderRadius: "50%", background: "#0A6BCF", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 11, flexShrink: 0 },
  sectionLabelLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#0A6BCF", letterSpacing: ".1em", fontWeight: 700 },
  sectionLabelSub: { fontSize: 10.5, color: "#9CA3AF", marginTop: 1 },

  // ===== Bio screen =====
  meterCard: { padding: 14, background: "linear-gradient(135deg, rgba(10,107,207,0.06), rgba(24,193,255,0.04))", border: "1px solid rgba(10,107,207,0.25)", borderRadius: 14, marginBottom: 4 },
  meterRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 },
  meterLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#0A6BCF", letterSpacing: ".1em", fontWeight: 700 },
  meterVal: { fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: "#0A6BCF", letterSpacing: "-0.02em", lineHeight: 1 },
  meterTrack: { height: 6, background: "rgba(10,107,207,0.10)", borderRadius: 999, overflow: "hidden" },
  meterFill: { height: "100%", background: "linear-gradient(90deg,#18A66A,#4ED896 60%, #18C1FF)", borderRadius: 999 },
  meterSub: { display: "flex", alignItems: "center", gap: 5, marginTop: 8, fontSize: 11, color: "#6B7280" },

  bioBox: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, padding: 14 },
  bioText: { fontSize: 13, color: "#0E2C56", lineHeight: 1.55, minHeight: 90 },
  bioFoot: { display: "flex", alignItems: "center", gap: 6, marginTop: 10, paddingTop: 10, borderTop: "1px solid #F0F4F9" },
  bioMicChip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 9px", background: "rgba(10,107,207,0.08)", color: "#0A6BCF", borderRadius: 999, fontSize: 10.5, fontWeight: 600, cursor: "pointer" },
  bioCount: { marginLeft: "auto", fontSize: 10.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },

  photoBadge: { padding: "2px 8px", background: "rgba(10,107,207,0.10)", color: "#0A6BCF", borderRadius: 999, fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  tipAmber: { display: "flex", alignItems: "flex-start", gap: 6, padding: "8px 10px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 10, fontSize: 11, color: "#6B7280", lineHeight: 1.5, marginTop: 8, marginBottom: 4 },

  photoGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 10 },
  photoAdd: { aspectRatio: "1", borderRadius: 10, background: "rgba(10,107,207,0.06)", border: "1.5px dashed rgba(10,107,207,0.40)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer" },
  photoAddText: { fontSize: 10, color: "#0A6BCF", fontWeight: 700 },
  photoTile: { position: "relative", aspectRatio: "1", borderRadius: 10, display: "grid", placeItems: "center" },
  photoTag: { position: "absolute", left: 4, bottom: 4, padding: "1px 6px", background: "rgba(14,44,86,0.65)", color: "#FFFFFF", fontSize: 9, fontWeight: 700, borderRadius: 4 },
  photoPairChip: { position: "absolute", left: 4, top: 4, width: 16, height: 16, borderRadius: "50%", background: "rgba(10,107,207,0.85)", display: "grid", placeItems: "center" },
  photoRemove: { position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: "50%", background: "rgba(14,44,86,0.65)", border: "none", display: "grid", placeItems: "center", cursor: "pointer" },

  singleFooter: { position: "absolute", left: 0, right: 0, bottom: 0, background: "#FFFFFF", borderTop: "1px solid #E1E8F0", padding: "14px 16px 30px", boxShadow: "0 -4px 12px rgba(14,44,86,0.06)", zIndex: 5 },
  singleFooterStack: { position: "absolute", left: 0, right: 0, bottom: 0, background: "#FFFFFF", borderTop: "1px solid #E1E8F0", padding: "14px 16px 30px", display: "flex", flexDirection: "column", gap: 8, boxShadow: "0 -4px 12px rgba(14,44,86,0.06)", zIndex: 5 },
  primaryBtn: { width: "100%", height: 54, background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 14, fontWeight: 700, fontSize: 14.5, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(10,107,207,0.30)" },
  ghostBtn: { padding: "12px", background: "transparent", color: "#6B7280", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer" },

  // ===== KYC =====
  kycBanner: { display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "linear-gradient(135deg, #18A66A, #4ED896)", borderRadius: 16, color: "#FFFFFF", marginBottom: 6, boxShadow: "0 8px 18px rgba(24,166,106,0.30)" },
  kycBannerIcon: { width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.18)", display: "grid", placeItems: "center", flexShrink: 0 },
  kycBannerTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800, letterSpacing: "-0.01em" },
  kycBannerSub: { fontSize: 11.5, color: "rgba(255,255,255,0.85)", marginTop: 3 },
  kycBannerChip: { fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" },

  docsList: { display: "flex", flexDirection: "column", gap: 8 },
  docCard: { display: "flex", gap: 12, padding: 12, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14 },
  docThumb: { position: "relative", width: 60, height: 76, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0, boxShadow: "0 2px 6px rgba(14,44,86,0.10)" },
  docThumbCorner: { position: "absolute", right: -3, top: -3, width: 18, height: 18, borderRadius: "50%", background: "#18A66A", border: "2px solid #FFFFFF", display: "grid", placeItems: "center" },
  docTopRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 },
  docTitle: { fontSize: 13, fontWeight: 700, color: "#0E2C56" },
  docStatus: { display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: 999, fontSize: 9.5, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".04em", textTransform: "uppercase" },
  docSub: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  docDates: { display: "flex", alignItems: "center", gap: 8, marginTop: 8 },
  docDate: { display: "flex", flexDirection: "column" },
  docDateLabel: { fontSize: 9, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
  docDateVal: { fontSize: 11.5, color: "#0E2C56", fontWeight: 700, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" },
  docDateBullet: { width: 1, height: 18, background: "#E1E8F0" },
  renewBtn: { marginTop: 10, display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", background: "linear-gradient(135deg,#F59E0B,#FBBF24)", color: "#FFFFFF", border: "none", borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(245,158,11,0.30)" },

  certCard: { display: "flex", alignItems: "center", gap: 12, padding: 12, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14 },
  certBadge: { width: 44, height: 50, borderRadius: "6px 6px 14px 14px", display: "grid", placeItems: "center", flexShrink: 0 },
  certTitle: { fontSize: 13, fontWeight: 700, color: "#0E2C56" },
  certIssuer: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  certId: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF", marginTop: 4, fontWeight: 600 },

  uploadCta: { width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 14, background: "linear-gradient(135deg, #0A6BCF, #0894EA)", color: "#FFFFFF", border: "none", borderRadius: 14, cursor: "pointer", marginTop: 14, boxShadow: "0 6px 14px rgba(10,107,207,0.30)" },
  uploadCtaIcon: { width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.18)", display: "grid", placeItems: "center", flexShrink: 0 },
  uploadCtaTitle: { fontSize: 13, fontWeight: 700 },
  uploadCtaSub: { fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 2 },

  privacyFooter: { display: "flex", alignItems: "flex-start", gap: 6, marginTop: 12, padding: "10px 12px", background: "rgba(24,166,106,0.06)", border: "1px dashed rgba(24,166,106,0.30)", borderRadius: 10, fontSize: 11, color: "#6B7280", lineHeight: 1.5 },
  privLink: { color: "#0A6BCF", textDecoration: "underline", fontWeight: 700 },

  // ===== Pause account =====
  pauseHero: { textAlign: "center", padding: "8px 16px 22px" },
  pauseIconBig: { width: 70, height: 70, borderRadius: "50%", background: "linear-gradient(135deg, #F59E0B, #B45309)", display: "grid", placeItems: "center", margin: "0 auto 14px", boxShadow: "0 12px 26px rgba(245,158,11,0.35)" },
  pauseTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em" },
  pauseSub: { fontSize: 13, color: "#6B7280", marginTop: 8, lineHeight: 1.5, maxWidth: 300, marginLeft: "auto", marginRight: "auto" },

  checklistCard: { padding: "8px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14 },
  checklistRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #F4F7FB" },
  checklistIcon: { width: 30, height: 30, borderRadius: 9, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  checklistLabel: { fontSize: 12.5, fontWeight: 700, color: "#0E2C56" },
  checklistSub: { fontSize: 11, color: "#6B7280", marginTop: 2, lineHeight: 1.4 },

  pauseDurationRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 },
  pauseDuration: { display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px", background: "#FFFFFF", border: "1.5px solid #E1E8F0", color: "#6B7280", borderRadius: 12, fontSize: 12.5, fontWeight: 600, cursor: "pointer" },
  pauseDurationSel: { background: "#0A6BCF", borderColor: "#0A6BCF", color: "#FFFFFF", boxShadow: "0 4px 10px rgba(10,107,207,0.30)" },

  reasonGrid: { display: "flex", flexWrap: "wrap", gap: 6 },
  reasonChip: { display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", color: "#0E2C56", borderRadius: 999, fontSize: 11.5, fontWeight: 600, cursor: "pointer" },

  pauseInfoCard: { display: "flex", alignItems: "flex-start", gap: 6, marginTop: 14, padding: "10px 12px", background: "rgba(10,107,207,0.05)", border: "1px solid rgba(10,107,207,0.20)", borderRadius: 10, fontSize: 11.5, color: "#6B7280", lineHeight: 1.5 },

  pauseBtn: { width: "100%", height: 54, background: "linear-gradient(135deg, #F59E0B, #B45309)", color: "#FFFFFF", border: "none", borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(245,158,11,0.30)" },
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
