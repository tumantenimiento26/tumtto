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
          <a href="UILibraryPrimitives.html" style={l.heroVer}>← Sección 1 · Primitives</a>
        </div>
        <div style={l.heroEyebrow}>SECCIÓN 02</div>
        <div style={l.heroTitle}>Containers</div>
        <div style={l.heroSub}>
          Moléculas estructurales que envuelven y agrupan contenido. Card, ListItem, EmptyState, Loading y Alert — la chasis de la mayoría de pantallas.
        </div>
        <div style={l.heroMetaRow}>
          <span style={l.heroChip}><Ic name="package" size={11} color="#FFFFFF" /><span>5 componentes</span></span>
          <span style={l.heroChip}><Ic name="check" size={11} color="#18A66A" /><span>Sección 1 lista</span></span>
          <span style={l.heroChip}><Ic name="circle-dot" size={11} color="#FBBF24" /><span>Sección 2 · esta</span></span>
          <span style={l.heroChip}><Ic name="circle" size={11} color="rgba(255,255,255,0.45)" /><span>4 secciones por venir</span></span>
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
          <span style={l.componentLink}><Ic name="figma" size={11} color="#0A6BCF" /><span>figma</span></span>
        </div>
      </div>

      <div style={l.componentGrid}>
        <div style={l.componentMain}>
          <div style={l.platformRow}>
            <div style={l.platformLabel}><Ic name="smartphone" size={12} color="#0A6BCF" /><span>MOBILE · 390 px</span><span style={l.platformImpl}>React Native</span></div>
          </div>
          <div style={l.platformPanel}>{mobileGrid}</div>

          <div style={l.platformRow}>
            <div style={l.platformLabel}><Ic name="monitor" size={12} color="#0A6BCF" /><span>DESKTOP · 1440 px</span><span style={l.platformImpl}>Next.js + shadcn/ui</span></div>
          </div>
          <div style={l.platformPanel}>{desktopGrid}</div>
        </div>

        <div style={l.specCard}>
          <div style={l.specHead}>
            <span style={l.specHeadLabel}>SPEC</span>
            <span style={l.specHeadName}>{codeName}</span>
          </div>
          {props && (
            <div>
              <div style={l.specSectionLabel}>PROPS</div>
              <div>
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
          {tokens && (
            <div>
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
          {notes && (
            <div>
              <div style={l.specSectionLabel}>NOTAS DE IMPLEMENTACIÓN</div>
              <ul style={l.notesList}>
                {notes.map((n, idx) => <li key={idx} style={l.notesItem}>{n}</li>)}
              </ul>
            </div>
          )}
          {useCases && (
            <div>
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

const TONES = [
  "linear-gradient(135deg,#0A6BCF,#18C1FF)",
  "linear-gradient(135deg,#F59E0B,#FBBF24)",
  "linear-gradient(135deg,#18A66A,#4ED896)",
  "linear-gradient(135deg,#7C3AED,#A78BFA)",
];

function Avatar({ size = 40, initials = "RH", tone = 0, verified, online }) {
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: TONES[tone % TONES.length], color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: size * 0.32 }}>
        {initials}
      </div>
      {verified && <div style={{ position: "absolute", right: -2, bottom: -2, width: size * 0.30, height: size * 0.30, borderRadius: "50%", background: "#18A66A", border: `${Math.max(1.5, size * 0.04)}px solid #FFFFFF`, display: "grid", placeItems: "center" }}><Ic name="check" size={size * 0.18} color="#FFFFFF" stroke={3.5} /></div>}
      {online && <div style={{ position: "absolute", right: 0, bottom: 0, width: size * 0.22, height: size * 0.22, borderRadius: "50%", background: "#18A66A", border: `${Math.max(1.5, size * 0.035)}px solid #FFFFFF` }} />}
    </div>
  );
}

// =====================================================================
// 2.1 CARD
// =====================================================================
function CardBasic() {
  return (
    <div style={c.card}>
      <div style={c.cardLabel}>BASIC</div>
      <div style={c.cardTitle}>Detalle del servicio</div>
      <div style={c.cardText}>Fondo Surface Gray (#EEF3F8), sin sombra, padding 16, radius 14.</div>
    </div>
  );
}

function CardElevated() {
  return (
    <div style={{ ...c.card, background: "#FFFFFF", boxShadow: "0 4px 14px rgba(14,44,86,0.08)" }}>
      <div style={c.cardLabel}>ELEVATED</div>
      <div style={c.cardTitle}>Cotización aprobada</div>
      <div style={c.cardText}>Fondo blanco + shadow-md. Para contenido que debe destacar del flujo.</div>
    </div>
  );
}

function CardBordered() {
  return (
    <div style={{ ...c.card, background: "#FFFFFF", border: "1px solid #E1E8F0" }}>
      <div style={c.cardLabel}>BORDERED</div>
      <div style={c.cardTitle}>Información personal</div>
      <div style={c.cardText}>Border 1px hairline. Para listas densas donde la sombra abruma.</div>
    </div>
  );
}

function CardInteractive() {
  return (
    <div style={{ ...c.card, background: "#FFFFFF", border: "1px solid #E1E8F0", boxShadow: "0 1px 2px rgba(14,44,86,0.04)", cursor: "pointer", transform: "translateY(-1px)", position: "relative" }}>
      <div style={c.cardInteractiveChip}>tap →</div>
      <div style={c.cardLabel}>INTERACTIVE</div>
      <div style={c.cardTitle}>Ramón Hernández</div>
      <div style={c.cardText}>Hover en desktop (lift -2px + shadow-md). Pressed en mobile (scale 0.98 + haptic light).</div>
    </div>
  );
}

function CardHighlighted() {
  return (
    <div style={{ ...c.card, background: "linear-gradient(90deg, rgba(10,107,207,0.06), rgba(10,107,207,0.02))", borderColor: "rgba(10,107,207,0.30)", position: "relative", paddingLeft: 20 }}>
      <div style={{ position: "absolute", left: 0, top: 12, bottom: 12, width: 3, background: "#0A6BCF", borderRadius: "0 3px 3px 0" }} />
      <div style={c.cardLabel}>HIGHLIGHTED</div>
      <div style={c.cardTitle}>Servicio activo · #SVC-2851</div>
      <div style={c.cardText}>Border lateral 3px Primary Blue. Indicador de prioridad/activo.</div>
    </div>
  );
}

function CardWithSlots() {
  return (
    <div style={c.cardSlots}>
      <div style={c.cardHeader}>
        <Avatar size={32} initials="MR" tone={1} verified />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={c.cardHeaderTitle}>María Rodríguez</div>
          <div style={c.cardHeaderSub}>Plomería · #SVC-2851</div>
        </div>
        <button style={c.cardHeaderBtn}><Ic name="more-vertical" size={13} color="#6B7280" /></button>
      </div>
      <div style={c.cardBody}>
        <div style={{ fontSize: 13, color: "#0E2C56", lineHeight: 1.5 }}>
          "Tengo una fuga debajo del lavabo del baño. El agua gotea constantemente."
        </div>
      </div>
      <div style={c.cardFooter}>
        <button style={c.cardFooterGhost}>Ver detalle</button>
        <button style={c.cardFooterPrimary}>
          Aceptar
          <Ic name="arrow-right" size={11} color="#FFFFFF" style={{ marginLeft: 4 }} />
        </button>
      </div>
    </div>
  );
}

function CardGrid({ desktop }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr 1fr" : "1fr 1fr", gap: 12 }}>
      <CardBasic />
      <CardElevated />
      <CardBordered />
      <CardInteractive />
      <CardHighlighted />
      <CardWithSlots />
    </div>
  );
}

// =====================================================================
// 2.2 LIST ITEM
// =====================================================================
function ListItem({ leading, title, subtitle, description, trailing, lines = 2, selected, last }) {
  return (
    <div style={{
      ...c.listItem,
      ...(last ? null : c.listItemBorder),
      ...(selected ? c.listItemSelected : null),
    }}>
      {leading && <div style={c.liLeading}>{leading}</div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={c.liTitle}>{title}</div>
        {lines >= 2 && subtitle && <div style={c.liSubtitle}>{subtitle}</div>}
        {lines >= 3 && description && <div style={c.liDescription}>{description}</div>}
      </div>
      {trailing && <div style={c.liTrailing}>{trailing}</div>}
    </div>
  );
}

function ListItemGrid() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={c.subLabel}>SINGLE-LINE</div>
        <div style={c.listGroup}>
          <ListItem leading={<div style={c.liIconBlue}><Ic name="bell" size={14} color="#0A6BCF" /></div>}
            title="Notificaciones"
            lines={1}
            trailing={<Ic name="chevron-right" size={14} color="#9CA3AF" />}
          />
          <ListItem leading={<div style={c.liIconBlue}><Ic name="globe" size={14} color="#0A6BCF" /></div>}
            title="Idioma"
            lines={1}
            trailing={<span style={c.liHint}>Español MX</span>}
          />
          <ListItem leading={<div style={c.liIconRed}><Ic name="trash-2" size={14} color="#DC2626" /></div>}
            title="Eliminar cuenta"
            lines={1}
            trailing={<Ic name="chevron-right" size={14} color="#DC2626" />}
            last
          />
        </div>
      </div>

      <div>
        <div style={c.subLabel}>TWO-LINE (default)</div>
        <div style={c.listGroup}>
          <ListItem leading={<Avatar size={40} initials="RH" tone={0} verified online />}
            title="Ramón Hernández"
            subtitle="Plomería · #SVC-2851 · En camino"
            trailing={<><span style={c.liTime}>14:32</span><span style={c.liBadge}>2</span></>}
          />
          <ListItem leading={<Avatar size={40} initials="MR" tone={1} verified />}
            title="María Rodríguez"
            subtitle="Tú: Perfecto, mañana entonces ✓✓"
            trailing={<span style={c.liTime}>12:08</span>}
          />
          <ListItem leading={<Avatar size={40} initials="JC" tone={3} />}
            title="José Carlos"
            subtitle="Gracias, cualquier cosa avísame."
            trailing={<span style={c.liTime}>Ayer</span>}
            last
          />
        </div>
      </div>

      <div>
        <div style={c.subLabel}>THREE-LINE</div>
        <div style={c.listGroup}>
          <ListItem leading={<Avatar size={44} initials="LP" tone={2} verified />}
            title="Lupita Pérez Vázquez"
            subtitle="Pintura · #SVC-2840 · Completado"
            description="Pintura completa de recámara principal · entregado con garantía 6 meses"
            lines={3}
            trailing={<div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <span style={c.liAmount}>$2,800</span>
              <Ic name="chevron-right" size={13} color="#9CA3AF" />
            </div>}
            last
          />
        </div>
      </div>

      <div>
        <div style={c.subLabel}>STATES</div>
        <div style={c.listGroup}>
          <ListItem leading={<Avatar size={40} initials="AG" tone={3} />}
            title="Default"
            subtitle="Estado base · no interactuado"
          />
          <ListItem leading={<Avatar size={40} initials="AG" tone={3} />}
            title="Pressed / Hover"
            subtitle="Background F8FBFF · ripple en mobile"
            selected
          />
          <ListItem leading={<div style={c.liCheckbox}><Ic name="check" size={9} color="#FFFFFF" stroke={3.5} /></div>}
            title="Selected (multi-select)"
            subtitle="Checkbox visible + bg primary tinted"
            selected
            last
          />
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 2.3 EMPTY STATE
// =====================================================================
function EmptyState({ variant = "no-data", title, sub, cta, ctaSecondary, kpis }) {
  const illu = {
    "no-data":   <IlluFolder />,
    "no-results":<IlluSearch />,
    "error":     <IlluError />,
    "success":   <IlluCheck />,
    "coming":    <IlluRocket />,
  }[variant];
  return (
    <div style={c.emptyWrap}>
      <div style={c.emptyIllu}>{illu}</div>
      <div style={c.emptyTitle}>{title}</div>
      <div style={c.emptySub}>{sub}</div>
      {kpis && (
        <div style={c.emptyKpiRow}>
          {kpis.map((k, idx) => (
            <div key={idx} style={c.emptyKpiChip}>
              <Ic name={k.icon} size={11} color="#0A6BCF" />
              <span><b style={{ color: "#0E2C56", fontWeight: 700 }}>{k.val}</b> {k.label}</span>
            </div>
          ))}
        </div>
      )}
      {cta && (
        <button style={c.emptyCta}>
          <Ic name={cta.icon} size={13} color="#FFFFFF" style={{ marginRight: 6 }} />
          {cta.label}
        </button>
      )}
      {ctaSecondary && <button style={c.emptyGhost}>{ctaSecondary}</button>}
    </div>
  );
}

function IlluFolder() {
  return (
    <svg viewBox="0 0 160 110" width="140" height="96">
      <defs>
        <linearGradient id="esF" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0A6BCF" />
          <stop offset="1" stopColor="#0894EA" />
        </linearGradient>
      </defs>
      <path d="M28 30 L62 30 L70 40 L132 40 L132 92 L28 92 Z" fill="url(#esF)" opacity="0.85" />
      <rect x="44" y="50" width="72" height="36" rx="3" fill="#FFFFFF" stroke="#E1E8F0" />
      <rect x="52" y="58" width="32" height="2" rx="1" fill="#0A6BCF" opacity="0.5" />
      <rect x="52" y="64" width="48" height="2" rx="1" fill="#9CA3AF" opacity="0.5" />
      <rect x="52" y="70" width="40" height="2" rx="1" fill="#9CA3AF" opacity="0.5" />
      <rect x="52" y="76" width="30" height="2" rx="1" fill="#18A66A" opacity="0.6" />
      <path d="M28 60 L132 60 L132 92 L28 92 Z" fill="url(#esF)" />
      <g fill="#F59E0B">
        <path d="M134 26 L137 32 L143 34 L137 36 L134 42 L131 36 L125 34 L131 32 Z" />
        <circle cx="26" cy="52" r="2.5" />
      </g>
    </svg>
  );
}

function IlluSearch() {
  return (
    <svg viewBox="0 0 160 110" width="140" height="96">
      <circle cx="60" cy="55" r="34" fill="rgba(10,107,207,0.10)" stroke="#0A6BCF" strokeWidth="2" strokeDasharray="3 3" />
      <circle cx="60" cy="55" r="22" fill="rgba(255,255,255,0.85)" stroke="#0A6BCF" strokeWidth="2.5" />
      <path d="M 76 71 L 105 96" stroke="#0A6BCF" strokeWidth="6" strokeLinecap="round" />
      <path d="M 50 55 L 70 55 M 50 50 L 65 50 M 50 60 L 60 60" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
      <g fill="#F59E0B">
        <path d="M30 24 L33 30 L39 32 L33 34 L30 40 L27 34 L21 32 L27 30 Z" />
      </g>
    </svg>
  );
}

function IlluError() {
  return (
    <svg viewBox="0 0 160 110" width="140" height="96">
      <circle cx="80" cy="55" r="38" fill="rgba(220,38,38,0.08)" stroke="#DC2626" strokeWidth="2" strokeDasharray="3 3" />
      <circle cx="80" cy="55" r="28" fill="linear-gradient(135deg,#DC2626,#EA580C)" />
      <circle cx="80" cy="55" r="28" fill="#DC2626" />
      <path d="M 68 43 L 92 67 M 92 43 L 68 67" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function IlluCheck() {
  return (
    <svg viewBox="0 0 160 110" width="140" height="96">
      <circle cx="80" cy="55" r="40" fill="rgba(24,166,106,0.10)" />
      <circle cx="80" cy="55" r="30" fill="#18A66A" />
      <path d="M 66 56 L 76 66 L 94 46" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <g fill="#F59E0B">
        <circle cx="30" cy="30" r="3" />
        <circle cx="130" cy="35" r="2.5" />
        <circle cx="125" cy="88" r="2.5" />
      </g>
    </svg>
  );
}

function IlluRocket() {
  return (
    <svg viewBox="0 0 160 110" width="140" height="96">
      <ellipse cx="80" cy="98" rx="40" ry="4" fill="rgba(0,0,0,0.10)" />
      <path d="M 80 16 Q 100 30 100 60 L 100 78 L 60 78 L 60 60 Q 60 30 80 16 Z" fill="#0A6BCF" />
      <circle cx="80" cy="48" r="8" fill="#18C1FF" stroke="#FFFFFF" strokeWidth="2" />
      <path d="M 60 64 L 50 80 L 60 78 Z" fill="#F59E0B" />
      <path d="M 100 64 L 110 80 L 100 78 Z" fill="#F59E0B" />
      <path d="M 74 82 Q 80 96 86 82" fill="#FBBF24" />
      <g fill="#F59E0B"><circle cx="30" cy="30" r="2" /><circle cx="130" cy="40" r="2" /><circle cx="135" cy="70" r="2" /></g>
    </svg>
  );
}

function EmptyStateGrid({ desktop }) {
  const cols = desktop ? "1fr 1fr" : "1fr";
  return (
    <div style={{ display: "grid", gridTemplateColumns: cols, gap: 14 }}>
      <EmptyState variant="no-data"
        title="Sin mensajes todavía"
        sub="Cuando solicites un servicio, podrás chatear con tu técnico desde aquí."
        cta={{ label: "Explorar técnicos", icon: "compass" }}
        ctaSecondary="Ver categorías"
      />
      <EmptyState variant="no-results"
        title="Sin resultados"
        sub={(<>No encontramos nada para <b>"plomería urgente"</b>. Intenta con otros términos.</>)}
        cta={{ label: "Limpiar búsqueda", icon: "x" }}
      />
      <EmptyState variant="error"
        title="Algo salió mal"
        sub="No pudimos cargar tu agenda. Verifica tu conexión y vuelve a intentar."
        cta={{ label: "Reintentar", icon: "rotate-cw" }}
        ctaSecondary="Contactar soporte"
      />
      <EmptyState variant="success"
        title="¡Todo listo!"
        sub="Tu servicio fue completado y pagado. Califica a Ramón cuando quieras."
        cta={{ label: "Calificar técnico", icon: "star" }}
        kpis={[
          { icon: "wallet", val: "$850", label: "pagados" },
          { icon: "clock",  val: "1h 12m", label: "duración" },
        ]}
      />
      <EmptyState variant="coming"
        title="Aún no operamos en tu zona"
        sub="Estamos por llegar a Tlajomulco. Déjanos tu correo y te avisamos al lanzar."
        cta={{ label: "Notifícame", icon: "bell" }}
      />
    </div>
  );
}

// =====================================================================
// 2.4 LOADING STATES
// =====================================================================
function Skeleton({ w = "100%", h = 12, r = 6, style }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "linear-gradient(90deg, #EEF3F8, #F8FBFF 40%, #EEF3F8 80%)", backgroundSize: "200% 100%", animation: "ui-shimmer 1.6s linear infinite", ...style }} />;
}

function Spinner({ size = 24, color = "#0A6BCF" }) {
  return <div style={{ width: size, height: size, borderRadius: "50%", border: `${size / 8}px solid ${color}22`, borderTopColor: color, animation: "ui-spin 0.9s linear infinite" }} />;
}

function ProgressBar({ value, indeterminate, label, tone = "blue" }) {
  const colorMap = { blue: "#0A6BCF", green: "#18A66A", amber: "#F59E0B", red: "#DC2626" };
  const c = colorMap[tone];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#6B7280" }}>
        <span>{label}</span>
        {!indeterminate && <span style={{ color: "#0E2C56", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{value}%</span>}
      </div>}
      <div style={{ height: 6, background: "#EEF3F8", borderRadius: 999, overflow: "hidden", position: "relative" }}>
        {indeterminate ? (
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, transparent, ${c}, transparent)`, width: "40%", animation: "ui-shimmer 1.6s ease-in-out infinite" }} />
        ) : (
          <div style={{ height: "100%", width: `${value}%`, background: `linear-gradient(90deg, ${c}, ${c}AA)`, borderRadius: 999, transition: "width 0.3s" }} />
        )}
      </div>
    </div>
  );
}

function LoadingGrid({ desktop }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <div style={c.subLabel}>SKELETON · LIST ITEM</div>
        <div style={c.listGroup}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderBottom: i < 3 ? "1px solid #F4F7FB" : "none" }}>
              <Skeleton w={40} h={40} r="50%" />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <Skeleton w="60%" h={11} />
                <Skeleton w="85%" h={9} />
              </div>
              <Skeleton w={32} h={20} r={10} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={c.subLabel}>SKELETON · CARD</div>
        <div style={{ padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Skeleton w={36} h={36} r="50%" />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
              <Skeleton w="50%" h={11} />
              <Skeleton w="35%" h={9} />
            </div>
          </div>
          <Skeleton w="100%" h={9} style={{ marginBottom: 6 }} />
          <Skeleton w="90%" h={9} style={{ marginBottom: 6 }} />
          <Skeleton w="60%" h={9} />
          <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
            <Skeleton w={60} h={50} r={6} />
            <Skeleton w={60} h={50} r={6} />
            <Skeleton w={60} h={50} r={6} />
          </div>
        </div>
      </div>

      <div>
        <div style={c.subLabel}>SPINNERS · SIZES</div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <Spinner size={16} />
            <span style={c.tinyLabel}>sm · 16</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <Spinner size={24} />
            <span style={c.tinyLabel}>md · 24</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <Spinner size={36} />
            <span style={c.tinyLabel}>lg · 36</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", padding: "6px 12px", background: "rgba(10,107,207,0.10)", borderRadius: 999 }}>
            <Spinner size={12} />
            <span style={{ fontSize: 12, color: "#0A6BCF", fontWeight: 600 }}>Procesando…</span>
          </div>
        </div>
      </div>

      <div>
        <div style={c.subLabel}>PROGRESS BARS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12 }}>
          <ProgressBar value={32} label="Subiendo documento" tone="blue" />
          <ProgressBar value={78} label="Verificación KYC" tone="amber" />
          <ProgressBar value={100} label="Pago confirmado" tone="green" />
          <ProgressBar indeterminate label="Esperando respuesta del cliente" tone="blue" />
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 2.5 ALERT / BANNER
// =====================================================================
function Alert({ variant = "info", icon, title, text, action, dismissable, inline, sticky }) {
  const map = {
    info:    { bg: "rgba(10,107,207,0.06)",  border: "rgba(10,107,207,0.30)",  iconBg: "rgba(10,107,207,0.12)",  color: "#0A6BCF", text: "#0E2C56" },
    success: { bg: "rgba(24,166,106,0.08)",  border: "rgba(24,166,106,0.30)",  iconBg: "rgba(24,166,106,0.14)",  color: "#0F8A56", text: "#0E2C56" },
    warning: { bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.30)",  iconBg: "rgba(245,158,11,0.14)",  color: "#B45309", text: "#7B3F00" },
    error:   { bg: "rgba(220,38,38,0.06)",   border: "rgba(220,38,38,0.30)",   iconBg: "rgba(220,38,38,0.12)",   color: "#DC2626", text: "#7A1A1A" },
  };
  const v = map[variant];
  const Wrap = sticky ? "div" : "div";
  return (
    <Wrap style={{
      display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px",
      background: v.bg, border: `1.5px solid ${v.border}`, borderRadius: sticky ? 0 : 12,
      borderLeft: sticky ? "none" : `1.5px solid ${v.border}`,
      ...(sticky ? { boxShadow: `0 4px 12px ${v.color}25` } : null),
    }}>
      {icon && (
        <div style={{ width: 28, height: 28, borderRadius: 8, background: v.iconBg, display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Ic name={icon} size={13} color={v.color} stroke={2.4} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontSize: 12.5, color: v.text, fontWeight: 700 }}>{title}</div>}
        <div style={{ fontSize: 11.5, color: v.text, marginTop: title ? 3 : 0, lineHeight: 1.45 }}>{text}</div>
      </div>
      {action && (
        <button style={{ padding: "5px 11px", background: "#FFFFFF", color: v.color, border: `1px solid ${v.color}`, borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
          {action}
        </button>
      )}
      {dismissable && (
        <button style={{ width: 20, height: 20, borderRadius: 6, background: "transparent", border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
          <Ic name="x" size={12} color={v.color} stroke={2.4} />
        </button>
      )}
    </Wrap>
  );
}

function AlertGrid() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={c.subLabel}>VARIANTS · INLINE · DISMISSABLE</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Alert variant="info" icon="info"
            title="El técnico tiene 30 min para responder"
            text="Te notificaremos cuando Ramón acepte tu solicitud."
            dismissable
          />
          <Alert variant="success" icon="check"
            title="Pago confirmado"
            text="$850 MXN procesados. Recibo enviado por email."
          />
          <Alert variant="warning" icon="triangle-alert"
            title="Acción requerida"
            text="Aprueba la cotización actualizada para que Ramón continúe."
            action="Revisar"
          />
          <Alert variant="error" icon="x-circle"
            title="Disputa abierta en este servicio"
            text="Soporte está revisando · respondemos en menos de 2h."
            action="Ver"
            dismissable
          />
        </div>
      </div>

      <div>
        <div style={c.subLabel}>STICKY · TOP-OF-SCREEN</div>
        <div style={{ background: "#F8FBFF", border: "1px dashed #C8D4E0", borderRadius: 12, overflow: "hidden" }}>
          <Alert variant="warning" sticky icon="triangle-alert"
            title="Cotización pendiente"
            text="Ramón actualizó la cotización a $850."
            action="Aprobar"
          />
          <div style={{ padding: "14px 14px 18px", fontSize: 11.5, color: "#9CA3AF", textAlign: "center" }}>
            ← contenido normal de la pantalla debajo
          </div>
        </div>
      </div>

      <div>
        <div style={c.subLabel}>SIN ÍCONO · COMPACTOS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Alert variant="info" text="Tu pago de $850 MXN está protegido — se libera al confirmar el servicio." />
          <Alert variant="warning" text="Rechazar muchas solicitudes seguidas afecta tu tasa de aceptación." />
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// HANDOFF
// =====================================================================
function HandoffNotes() {
  return (
    <div style={l.handoffSection}>
      <div style={l.handoffHead}>
        <div style={l.handoffIcon}><Ic name="package" size={18} color="#FFFFFF" /></div>
        <div>
          <div style={l.handoffTitle}>Handoff · Sección 2 lista</div>
          <div style={l.handoffSub}>5 containers documentados · listos para Claude Code</div>
        </div>
        <span style={l.handoffChip}>SECCIÓN 2 / 6</span>
      </div>

      <div style={l.handoffGrid}>
        <div style={l.handoffCard}>
          <div style={l.handoffCardLabel}>COMPONENTES ENVIADOS</div>
          <ul style={l.handoffList}>
            <li><b>Card</b> · basic / elevated / bordered / interactive / highlighted / slots</li>
            <li><b>ListItem</b> · 1-2-3 líneas + leading/trailing slots + states</li>
            <li><b>EmptyState</b> · 5 variants ilustradas + CTA primary/ghost + KPI chips</li>
            <li><b>Loading</b> · Skeleton + Spinner (3 sizes) + ProgressBar (det/indet)</li>
            <li><b>Alert</b> · 4 variants inline + sticky + dismissable + action</li>
          </ul>
        </div>

        <div style={l.handoffCard}>
          <div style={l.handoffCardLabel}>CARPETAS</div>
          <div style={l.handoffCode}>
            <div><b>/components/ui/</b></div>
            <div>{"  card.tsx"}</div>
            <div>{"  list-item.tsx"}</div>
            <div>{"  empty-state.tsx"}</div>
            <div>{"  skeleton.tsx"}</div>
            <div>{"  spinner.tsx"}</div>
            <div>{"  progress.tsx"}</div>
            <div>{"  alert.tsx"}</div>
            <div style={{ marginTop: 8 }}><b>/components/illustrations/</b></div>
            <div>{"  empty/*.svg"}</div>
          </div>
        </div>

        <div style={l.handoffCard}>
          <div style={l.handoffCardLabel}>DEPENDENCIAS</div>
          <ul style={l.handoffList}>
            <li><code>shadcn/ui</code> Card, Alert, Skeleton, Progress como base web</li>
            <li><code>react-native-reanimated</code> shimmer en mobile</li>
            <li><code>framer-motion</code> hover en cards interactivas (web)</li>
            <li><code>expo-haptics</code> feedback en cards pressed</li>
            <li>Ilustraciones inline SVG (no librería externa)</li>
          </ul>
        </div>

        <div style={l.handoffCard}>
          <div style={l.handoffCardLabel}>SIGUIENTES SECCIONES</div>
          <ol style={l.handoffOl}>
            <li>✓ Primitives — átomos</li>
            <li>✓ Containers — moléculas (esta)</li>
            <li style={{ color: "#0A6BCF", fontWeight: 700 }}>→ Navigation (próxima) — tab bar · top bar · sidebar · breadcrumb · tabs</li>
            <li>Forms — select · pickers · upload</li>
            <li>Data Display — table · KPI · timeline</li>
            <li>Domain-specific — Tech card · Status · Price · Chat</li>
          </ol>
        </div>
      </div>

      <div style={l.handoffNextStep}>
        <Ic name="hand" size={13} color="#0A6BCF" />
        <span>Avísame y avanzamos con <b style={{ color: "#0E2C56", fontWeight: 800 }}>Sección 3 · Navigation</b> (bottom tabs, top bar, sidebar admin web, breadcrumb, tabs).</span>
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
      <SectionHeader num="02" title="Containers" sub="Moléculas estructurales · agrupan y dan contexto al contenido de cualquier pantalla." />

      <ComponentBlock
        id="card"
        name="Card"
        codeName="<Card />"
        desc="Contenedor base con 5 variants visuales. Slots opcionales: header, body, footer con acciones."
        mobileGrid={<CardGrid />}
        desktopGrid={<CardGrid desktop />}
        props={[
          { name: "variant",     type: "basic | elevated | bordered | interactive | highlighted", default: "bordered" },
          { name: "padding",     type: "sm (12) | md (14) | lg (18)",                              default: "md" },
          { name: "header",      type: "ReactNode",                                                 default: "—" },
          { name: "body",        type: "ReactNode",                                                 default: "—", required: true },
          { name: "footer",      type: "ReactNode",                                                 default: "—" },
          { name: "onPress",     type: "() => void · activa interactive",                          default: "—" },
        ]}
        tokens={[
          { cat: "radius",   val: "14px (default) · 16-18 (lg containers)" },
          { cat: "shadow",   val: "elevated: 0 4px 14px rgba(14,44,86,.08)" },
          { cat: "border",   val: "1px #E1E8F0 (bordered)" },
          { cat: "left-bar", val: "highlighted: 3px Primary Blue" },
          { cat: "padding",  val: "12/14/18 px" },
        ]}
        notes={[
          "Mobile interactive: Pressable + scale 0.98 + haptic light en press.",
          "Web interactive: hover lift -2px + shadow-md, transition 150ms.",
          "highlighted reservado a contexto 'activo/prioritario'.",
          "shadcn Card como base web; extiende variants con cva.",
        ]}
        useCases={[
          "Service detail cards en agenda del técnico",
          "Tech profile cards en home del cliente",
          "Settings sections (rows agrupadas)",
          "Empty / Quote / Earnings highlights",
        ]}
      />

      <ComponentBlock
        id="list-item"
        name="ListItem"
        codeName="<ListItem />"
        desc="Fila de lista con leading + content + trailing. Soporta 1, 2 o 3 líneas y estados de selección."
        mobileGrid={<ListItemGrid />}
        desktopGrid={<ListItemGrid />}
        props={[
          { name: "leading",     type: "ReactNode (avatar/icon)",       default: "—" },
          { name: "title",       type: "string",                        default: "—", required: true },
          { name: "subtitle",    type: "string | ReactNode",            default: "—" },
          { name: "description", type: "string",                        default: "—" },
          { name: "trailing",    type: "ReactNode",                     default: "—" },
          { name: "lines",       type: "1 | 2 | 3",                     default: "2" },
          { name: "selected",    type: "boolean",                       default: "false" },
          { name: "onPress",     type: "() => void",                    default: "—" },
        ]}
        tokens={[
          { cat: "padding",  val: "12-14 px" },
          { cat: "gap",      val: "12 px entre slots" },
          { cat: "border",   val: "1px #F4F7FB entre items" },
          { cat: "selected", val: "bg F8FBFF · borderLeft 3px primary opcional" },
        ]}
        notes={[
          "Title: Inter 600 13.5 · Subtitle: Inter 400 11.5 #6B7280 · Description: 11 #9CA3AF",
          "Touch target mínimo 56px en mobile (12+padding × 2 + content).",
          "Trailing acepta cualquier slot: badge, chevron, switch, avatar, action.",
          "Multi-select: leading se reemplaza por checkbox sin perder layout.",
        ]}
        useCases={[
          "Inbox de mensajes (avatar + nombre + preview + time/badge)",
          "Settings rows (icon + label + hint + chevron)",
          "Mis servicios histórico (avatar + svc + monto)",
          "Direcciones guardadas (icon + alias + dirección)",
        ]}
      />

      <ComponentBlock
        id="empty-state"
        name="EmptyState"
        codeName="<EmptyState />"
        desc="Estado vacío con ilustración + título + descripción + CTA. 5 variants para todos los casos."
        mobileGrid={<EmptyStateGrid />}
        desktopGrid={<EmptyStateGrid desktop />}
        props={[
          { name: "variant",       type: "no-data | no-results | error | success | coming-soon", default: "no-data" },
          { name: "title",         type: "string",                                                default: "—", required: true },
          { name: "sub",           type: "string | ReactNode",                                    default: "—" },
          { name: "cta",           type: "{ label, icon, onPress }",                              default: "—" },
          { name: "ctaSecondary",  type: "string + onPress",                                       default: "—" },
          { name: "kpis",          type: "Array<{ icon, val, label }>",                            default: "—" },
        ]}
        tokens={[
          { cat: "illu",     val: "120-160 px width" },
          { cat: "title",    val: "Manrope 800 · 18-22" },
          { cat: "sub",      val: "Inter 400 · 12.5-13.5 #6B7280" },
          { cat: "max-w",    val: "300px (sub center)" },
        ]}
        notes={[
          "Ilustraciones inline SVG con paleta brand (no usar librería externa).",
          "CTA primario obligatorio salvo en 'success' donde el usuario ya completó algo.",
          "KPI chips opcionales (success post-pago muestra monto + duración).",
          "no-results acepta query string en el sub para personalizar.",
        ]}
        useCases={[
          "Inbox vacío de mensajes",
          "Búsqueda sin resultados (con sugerencias)",
          "Error de red al cargar agenda",
          "Confirmación post-servicio",
          "Coming soon · zona aún no operativa",
        ]}
      />

      <ComponentBlock
        id="loading"
        name="Loading"
        codeName="<Skeleton /> <Spinner /> <Progress />"
        desc="Tres primitivos de carga: skeleton para layouts conocidos, spinner para acciones puntuales, progress para tareas largas."
        mobileGrid={<LoadingGrid />}
        desktopGrid={<LoadingGrid desktop />}
        props={[
          { name: "<Skeleton> w/h/r", type: "string | number",       default: "100% / 12 / 6" },
          { name: "<Spinner> size",   type: "sm (16) | md (24) | lg (36)", default: "md" },
          { name: "<Spinner> color",  type: "string",                default: "#0A6BCF" },
          { name: "<Progress> value", type: "0-100",                 default: "0" },
          { name: "<Progress> indeterminate", type: "boolean",       default: "false" },
          { name: "<Progress> tone",  type: "blue | green | amber | red", default: "blue" },
        ]}
        tokens={[
          { cat: "shimmer",  val: "linear-gradient EEF3F8 → F8FBFF 40% → EEF3F8 80%" },
          { cat: "anim",     val: "1.6s linear infinite" },
          { cat: "progress", val: "height 6px · radius 999" },
        ]}
        notes={[
          "Skeletons replican EXACTAMENTE la estructura del contenido real (mismas alturas/avatars).",
          "Spinner inline para botones loading; nunca pantalla completa en cargas <2s.",
          "Progress determinate cuando se conoce el % (upload, KYC pipeline).",
          "Progress indeterminate para esperas remotas (aprobación cliente, llamado a API lenta).",
          "Mobile: skeleton con Reanimated worklet (mejor performance que CSS).",
        ]}
        useCases={[
          "Listas de servicios al refrescar (skeleton)",
          "Botón 'Procesando…' al enviar pago (spinner inline)",
          "Subida de foto KYC (progress determinate)",
          "Esperando aprobación del cliente (progress indeterminate)",
        ]}
      />

      <ComponentBlock
        id="alert"
        name="Alert"
        codeName="<Alert />"
        desc="Mensaje contextual con 4 variants semánticos. Inline (en flujo) o sticky (top de pantalla)."
        mobileGrid={<AlertGrid />}
        desktopGrid={<AlertGrid />}
        props={[
          { name: "variant",     type: "info | success | warning | error",  default: "info" },
          { name: "icon",        type: "LucideIcon",                        default: "—" },
          { name: "title",       type: "string",                            default: "—" },
          { name: "text",        type: "string | ReactNode",                default: "—", required: true },
          { name: "action",      type: "{ label, onPress }",                default: "—" },
          { name: "dismissable", type: "boolean",                           default: "false" },
          { name: "sticky",      type: "boolean",                           default: "false" },
        ]}
        tokens={[
          { cat: "bg",         val: "color a 6-8% · border a 30% · iconBg 12-14%" },
          { cat: "radius",     val: "12 (inline) · 0 (sticky)" },
          { cat: "padding",    val: "10-12px" },
          { cat: "type title", val: "Inter 700 · 12.5" },
          { cat: "type text",  val: "Inter 400 · 11.5 line-height 1.45" },
        ]}
        notes={[
          "Sticky alerts SOLO arriba (debajo del header). No bloquean scroll.",
          "Dismiss SOLO si el mensaje no requiere acción (un dismiss accidental no debe esconder algo crítico).",
          "Action button outline blanco con border del color de la variant.",
          "Warning/Error con bordes left 1.5px más gruesos para destacar.",
        ]}
        useCases={[
          "Timer banner sticky en detalle de solicitud técnico",
          "Confirmación inline post-pago",
          "Warning de acción requerida en cotización",
          "Error de pago fallido en checkout",
        ]}
      />

      <HandoffNotes />
    </div>
  );
}

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
  heroEyebrow: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.65)", letterSpacing: ".18em", fontWeight: 700, marginBottom: 6 },
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
  componentDesc: { fontSize: 13.5, color: "#6B7280", marginTop: 6, maxWidth: 600 },
  componentLinks: { display: "flex", gap: 8 },
  componentLink: { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 8, fontSize: 11, color: "#0A6BCF", fontWeight: 600, cursor: "pointer" },
  componentGrid: { display: "grid", gridTemplateColumns: "1fr 380px", gap: 18, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 18px rgba(14,44,86,0.06)" },
  componentMain: { padding: "22px 24px" },
  platformRow: { display: "flex", alignItems: "center", gap: 10, padding: "8px 0 14px", marginTop: 8 },
  platformLabel: { display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", background: "rgba(10,107,207,0.08)", border: "1px solid rgba(10,107,207,0.18)", borderRadius: 8, fontSize: 10.5, color: "#0A6BCF", fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".08em", fontWeight: 700 },
  platformImpl: { fontSize: 10, color: "#6B7280", padding: "1px 7px", background: "#FFFFFF", borderRadius: 4, fontWeight: 600 },
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
  handoffNextStep: { display: "flex", alignItems: "center", gap: 8, marginTop: 16, padding: "12px 14px", background: "rgba(10,107,207,0.05)", border: "1px dashed rgba(10,107,207,0.25)", borderRadius: 10, fontSize: 12.5, color: "#6B7280", lineHeight: 1.5 },
};

const c = {
  // Card
  card: { padding: 14, background: "#EEF3F8", borderRadius: 14, position: "relative" },
  cardLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#0A6BCF", letterSpacing: ".12em", fontWeight: 700, marginBottom: 6 },
  cardTitle: { fontSize: 14, color: "#0E2C56", fontWeight: 700, marginBottom: 4 },
  cardText: { fontSize: 11, color: "#6B7280", lineHeight: 1.5 },
  cardInteractiveChip: { position: "absolute", top: 8, right: 8, padding: "2px 7px", background: "rgba(10,107,207,0.10)", color: "#0A6BCF", borderRadius: 4, fontSize: 9, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },

  cardSlots: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, overflow: "hidden", boxShadow: "0 4px 14px rgba(14,44,86,0.06)" },
  cardHeader: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderBottom: "1px solid #F4F7FB" },
  cardHeaderTitle: { fontSize: 12.5, fontWeight: 700, color: "#0E2C56" },
  cardHeaderSub: { fontSize: 10.5, color: "#6B7280", marginTop: 1 },
  cardHeaderBtn: { width: 26, height: 26, borderRadius: 7, background: "transparent", border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  cardBody: { padding: "10px 12px" },
  cardFooter: { display: "flex", gap: 6, padding: "10px 12px", background: "#F8FBFF", borderTop: "1px solid #F4F7FB" },
  cardFooterGhost: { flex: 1, padding: "8px", background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #E1E8F0", borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: "pointer" },
  cardFooterPrimary: { flex: 1, padding: "8px", background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },

  // List items
  subLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#0A6BCF", letterSpacing: ".12em", fontWeight: 700, marginBottom: 8 },
  listGroup: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12, overflow: "hidden" },
  listItem: { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: "pointer" },
  listItemBorder: { borderBottom: "1px solid #F4F7FB" },
  listItemSelected: { background: "#F8FBFF" },
  liLeading: { flexShrink: 0 },
  liIconBlue: { width: 32, height: 32, borderRadius: 9, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center" },
  liIconRed:  { width: 32, height: 32, borderRadius: 9, background: "rgba(220,38,38,0.10)",  display: "grid", placeItems: "center" },
  liCheckbox: { width: 22, height: 22, borderRadius: 6, background: "#0A6BCF", display: "grid", placeItems: "center" },
  liTitle: { fontSize: 13, color: "#0E2C56", fontWeight: 600 },
  liSubtitle: { fontSize: 11.5, color: "#6B7280", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  liDescription: { fontSize: 11, color: "#9CA3AF", marginTop: 2, lineHeight: 1.4 },
  liTrailing: { display: "flex", alignItems: "center", gap: 6, flexShrink: 0 },
  liTime: { fontSize: 11, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" },
  liBadge: { padding: "0 7px", background: "#0A6BCF", color: "#FFFFFF", borderRadius: 999, fontSize: 10.5, fontWeight: 800, fontFamily: "'Manrope', sans-serif", minWidth: 18, height: 18, display: "grid", placeItems: "center" },
  liHint: { fontSize: 11.5, color: "#6B7280" },
  liAmount: { fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 800, color: "#0E2C56" },

  // Empty
  emptyWrap: { padding: "22px 18px", background: "#FFFFFF", border: "1px dashed #C8D4E0", borderRadius: 14, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" },
  emptyIllu: { marginBottom: 8 },
  emptyTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em", marginTop: 6 },
  emptySub: { fontSize: 12.5, color: "#6B7280", marginTop: 6, lineHeight: 1.5, maxWidth: 280 },
  emptyKpiRow: { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, marginTop: 14 },
  emptyKpiChip: { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 999, fontSize: 11, color: "#6B7280" },
  emptyCta: { marginTop: 16, padding: "10px 18px", background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(10,107,207,0.25)" },
  emptyGhost: { marginTop: 6, padding: "6px 12px", background: "transparent", color: "#0A6BCF", border: "none", fontWeight: 600, fontSize: 11.5, cursor: "pointer" },

  // Loading
  tinyLabel: { fontSize: 9, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
};

const kf = document.createElement("style");
kf.textContent = `
  @keyframes ui-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  @keyframes ui-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
`;
document.head.appendChild(kf);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
