/* global React, AdminIc, DETAIL, SVC_STATUS */
const Ic = AdminIc;

// ============================================================
// SERVICIO — DETALLE
// ============================================================
function ServiceDetail({ dispute = false }) {
  const D = DETAIL;
  const st = SVC_STATUS[D.status];

  return (
    <main style={sd.main}>
      {dispute && (
        <div style={sd.disputeBanner}>
          <div style={sd.disputeIcon}><Ic name="shield-alert" size={20} color="#FFFFFF" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>
              Disputa abierta hace 2 h · Motivo: Servicio incompleto según cliente
            </div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>
              Cliente reporta que la fuga continúa después del servicio. Solicita reembolso parcial. Sin respuesta del técnico aún.
            </div>
          </div>
          <button style={sd.disputeBtn}>
            <Ic name="life-buoy" size={14} color="#DC2626" style={{ marginRight: 8 }} />Abrir caso de soporte
          </button>
        </div>
      )}

      {/* Header */}
      <div style={sd.head}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
          <div>
            <div style={sd.eyebrow}>SERVICIO</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h1 style={sd.h1}>#{D.id}</h1>
              <span style={{ ...sd.statusBadge, background: st.bg, color: st.fg }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.dot }} />
                {st.label}
              </span>
              <span style={sd.metaTag}><Ic name="folder-tree" size={12} color="#6B7280" style={{ marginRight: 4 }} />{D.category}</span>
              <span style={sd.metaTag}><Ic name="calendar" size={12} color="#6B7280" style={{ marginRight: 4 }} />{D.scheduled}</span>
              <span style={sd.metaTag}><Ic name="map-pin" size={12} color="#6B7280" style={{ marginRight: 4 }} />{D.region}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={sd.btnGhost}><Ic name="message-square" size={14} color="#0E2C56" style={{ marginRight: 8 }} />Ver chat</button>
          <button style={sd.btnSecondary}><Ic name="user-cog" size={14} color="#0A6BCF" style={{ marginRight: 8 }} />Intervenir</button>
          <button style={sd.btnDanger}><Ic name="ban" size={14} color="#DC2626" style={{ marginRight: 8 }} />Cancelar</button>
          <button style={sd.btnDanger}><Ic name="rotate-ccw" size={14} color="#DC2626" style={{ marginRight: 8 }} />Reembolsar</button>
        </div>
      </div>

      {/* 3-col body */}
      <div style={sd.body}>
        {/* LEFT — partes involucradas */}
        <div style={sd.colLeft}>
          {/* Cliente */}
          <SCard title="Cliente" icon="user-round">
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
              <div style={{ ...sd.av, background: "rgba(10,107,207,0.14)", color: "#0A6BCF", width: 48, height: 48, fontSize: 15 }}>{D.client.initials}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0E2C56" }}>{D.client.name}</div>
                <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 2 }}>{D.client.phone} · {D.client.email}</div>
              </div>
            </div>
            <div style={sd.kvLabel}>Dirección del servicio</div>
            <div style={{ display: "flex", gap: 12 }}>
              <MicroMap />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: "#0E2C56", lineHeight: 1.5 }}>{D.client.address}</div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{D.client.city}</div>
              </div>
            </div>
            <a href="#" style={sd.cardLink}>
              Ver perfil completo <Ic name="arrow-right" size={12} color="#0A6BCF" />
            </a>
          </SCard>

          {/* Técnico */}
          <SCard title="Técnico asignado" icon="hard-hat">
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ ...sd.av, background: "rgba(24,193,255,0.18)", color: "#0884B0", width: 48, height: 48, fontSize: 15 }}>{D.tech.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#0E2C56" }}>{D.tech.name}</span>
                  <span style={sd.verifiedBadge}><Ic name="badge-check" size={10} color="#18A66A" /></span>
                </div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                    <Ic name="star" size={11} color="#F59E0B" />
                    <b style={{ color: "#0E2C56", fontWeight: 600 }}>{D.tech.rating}</b>
                    <span>({D.tech.reviews})</span>
                  </span>
                  <span>· {D.tech.phone}</span>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 12.5, color: "#6B7280" }}>{D.tech.category}</div>
            <a href="#" style={sd.cardLink}>
              Ver perfil <Ic name="arrow-right" size={12} color="#0A6BCF" />
            </a>
          </SCard>

          {/* Cobro y comisión */}
          <SCard title="Cobro y comisión" icon="receipt-text">
            <div style={sd.priceRow}>
              <span>Tarifa base</span>
              <span>${D.pricing.base.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
            </div>
            {D.pricing.extras.map((e, i) => (
              <div key={i} style={{ ...sd.priceRow, color: "#6B7280" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Ic name="plus" size={11} color="#0884B0" />
                  {e.label}
                </span>
                <span>+${e.amount.toFixed(2)}</span>
              </div>
            ))}
            <div style={{ ...sd.priceRow, borderTop: "1px solid #E1E8F0", marginTop: 4, paddingTop: 10, fontWeight: 600 }}>
              <span>Subtotal</span>
              <span style={{ fontFamily: "'Manrope', sans-serif" }}>${D.pricing.subtotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ ...sd.priceRow, color: "#6B7280", fontSize: 12 }}>
              <span>Comisión plataforma · 15%</span>
              <span>−${Math.abs(D.pricing.commission).toFixed(2)}</span>
            </div>
            <div style={sd.priceFinal}>
              <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>Neto técnico</span>
              <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 18, color: "#0E2C56" }}>
                ${D.pricing.techNet.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500, marginLeft: 4, fontFamily: "'Inter', sans-serif" }}>MXN</span>
              </span>
            </div>

            <div style={sd.payRow}>
              <div style={sd.payIcon}><Ic name="credit-card" size={16} color="#0A6BCF" /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, color: "#0E2C56", fontWeight: 500 }}>{D.pricing.payMethod}</div>
                <div style={{ marginTop: 3 }}>
                  <span style={sd.paidBadge}>
                    <Ic name="badge-check" size={10} color="#18A66A" />Pagado · 16:22
                  </span>
                </div>
              </div>
            </div>
          </SCard>
        </div>

        {/* CENTER — timeline */}
        <div style={sd.colCenter}>
          <div style={{ ...sd.card }}>
            <div style={sd.timelineHead}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ ...sd.cardIcon }}><Ic name="git-commit-vertical" size={16} color="#0A6BCF" /></div>
                <div>
                  <div style={sd.cardTitle}>Línea de tiempo del servicio</div>
                  <div style={sd.cardSub}>11 eventos · 2 h 23 min desde solicitud · 4 evidencias adjuntas</div>
                </div>
              </div>
              <button style={sd.btnGhostSm}>
                <Ic name="filter" size={12} color="#6B7280" style={{ marginRight: 4 }} />Filtrar
              </button>
            </div>

            <div style={sd.timeline}>
              {D.timeline.map((ev, i) => (
                <TimelineEvent key={i} ev={ev} isLast={i === D.timeline.length - 1} />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — actions / notes / metadata */}
        <div style={sd.colRight}>
          {/* Admin actions */}
          <SCard title="Acciones del admin" icon="wand-2">
            <button style={sd.adminBtnPrimary}><Ic name="message-square" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />Ver chat completo</button>
            <button style={{ ...sd.adminBtn, opacity: 1 }}><Ic name="user-cog" size={14} color="#0A6BCF" style={{ marginRight: 8 }} />Reasignar técnico</button>
            <button style={sd.adminBtn}><Ic name="ban" size={14} color="#DC2626" style={{ marginRight: 8 }} /><span style={{ color: "#DC2626" }}>Cancelar servicio</span></button>
            <button style={{ ...sd.adminBtn, background: "#FCE9E9", borderColor: "#DC2626" }}>
              <Ic name="rotate-ccw" size={14} color="#DC2626" style={{ marginRight: 8 }} />
              <span style={{ color: "#DC2626" }}>Iniciar reembolso</span>
            </button>
            <div style={sd.actionsHint}>
              <Ic name="info" size={11} color="#9CA3AF" />
              <span>Acciones destructivas piden confirmación + motivo.</span>
            </div>
          </SCard>

          {/* Internal notes */}
          <SCard title="Notas internas" icon="message-square-text">
            <textarea placeholder="Anota observaciones internas…" style={sd.noteArea} />
            <button style={sd.adminBtn}><Ic name="send" size={13} color="#0A6BCF" style={{ marginRight: 8 }} />Guardar nota</button>
            <div style={sd.notesHistoryLabel}>Historial</div>
            {D.notes.map((n, i) => (
              <div key={i} style={sd.note}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#0E2C56" }}>{n.author}</span>
                  <span style={{ fontSize: 10, color: "#9CA3AF", background: "#EEF3F8", padding: "1px 5px", borderRadius: 4 }}>{n.role}</span>
                  <span style={{ fontSize: 10.5, color: "#9CA3AF", marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace" }}>{n.time}</span>
                </div>
                <p style={{ fontSize: 12.5, color: "#0E2C56", lineHeight: 1.45, margin: "6px 0 0" }}>{n.text}</p>
              </div>
            ))}
          </SCard>

          {/* Metadata */}
          <SCard title="Metadata" icon="info">
            <div style={sd.metaList}>
              <div style={sd.metaRow}>
                <span style={sd.metaLabel}>ID</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: "#0E2C56", fontWeight: 500 }}>{D.id}</span>
              </div>
              <div style={sd.metaRow}>
                <span style={sd.metaLabel}>Región</span>
                <span style={{ fontSize: 12.5, color: "#0E2C56" }}>{D.region}</span>
              </div>
              <div style={sd.metaRow}>
                <span style={sd.metaLabel}>Origen</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "#0E2C56" }}>
                  <Ic name="smartphone" size={12} color="#0A6BCF" />
                  {D.source}
                </span>
              </div>
              <div style={sd.metaRow}>
                <span style={sd.metaLabel}>Audit log</span>
                <a href="#" style={{ color: "#0A6BCF", textDecoration: "none", fontSize: 12.5, fontWeight: 500 }}>
                  Ver {D.auditEvents} eventos →
                </a>
              </div>
            </div>
          </SCard>
        </div>
      </div>
    </main>
  );
}

// ============================================================
// TIMELINE EVENT
// ============================================================
function TimelineEvent({ ev, isLast }) {
  const tone = ev.status === "done" ? "done" : (ev.current ? "current" : "future");
  const dotBg = tone === "done" ? "#18A66A" : tone === "current" ? "#0A6BCF" : "#E1E8F0";
  const dotColor = tone === "future" ? "#9CA3AF" : "#FFFFFF";
  const iconStroke = tone === "future" ? "#9CA3AF" : "#FFFFFF";

  return (
    <div style={sd.tlRow}>
      <div style={sd.tlLeftCol}>
        <div style={{ ...sd.tlDot, background: dotBg, color: dotColor, ...(tone === "current" ? sd.tlDotPulse : null) }}>
          <Ic name={ev.icon} size={13} color={iconStroke} stroke={2} />
        </div>
        {!isLast && <div style={{ ...sd.tlLine, background: tone === "future" ? "#E1E8F0" : "#18A66A" }} />}
      </div>
      <div style={sd.tlContent}>
        <div style={sd.tlMeta}>
          <span style={sd.tlTime}>{ev.time}</span>
          <span style={{ ...sd.actorPill, ...actorTone(ev.actor) }}>{actorLabel(ev.actor)}</span>
          {ev.current && (
            <span style={sd.currentPill}>
              <span style={sd.pulseDot} />
              Ahora
            </span>
          )}
        </div>
        <div style={{ ...sd.tlTitle, color: tone === "future" ? "#9CA3AF" : "#0E2C56" }}>{ev.title}</div>
        <div style={{ ...sd.tlNote, color: tone === "future" ? "#9CA3AF" : "#6B7280" }}>{ev.note}</div>

        {(ev.evidence || ev.geo) && (
          <div style={sd.tlEvidence}>
            {ev.geo && (
              <span style={sd.evChip}>
                <Ic name="map" size={12} color="#0A6BCF" /> Ubicación en vivo
              </span>
            )}
            {ev.evidence ? Array.from({ length: ev.evidence }).map((_, i) => (
              <div key={i} style={sd.evThumb}>
                <Ic name="image" size={14} color="#FFFFFF" />
              </div>
            )) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function actorLabel(a) { return a === "client" ? "Cliente" : a === "tech" ? "Técnico" : "Sistema"; }
function actorTone(a) {
  if (a === "client") return { background: "rgba(10,107,207,0.10)", color: "#0A6BCF" };
  if (a === "tech")   return { background: "rgba(24,193,255,0.18)", color: "#0884B0" };
  return { background: "#EEF3F8", color: "#6B7280" };
}

// ============================================================
// HELPERS
// ============================================================
function SCard({ title, icon, sub, children }) {
  return (
    <div style={sd.card}>
      <div style={sd.cardHead}>
        <div style={sd.cardIcon}><Ic name={icon} size={16} color="#0A6BCF" /></div>
        <div>
          <div style={sd.cardTitle}>{title}</div>
          {sub && <div style={sd.cardSub}>{sub}</div>}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function MicroMap() {
  return (
    <svg viewBox="0 0 96 96" width="96" height="96" style={{ borderRadius: 10, background: "#EEF3F8", flexShrink: 0 }}>
      <path d="M0 50 Q 30 40 96 55" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M50 0 Q 45 50 60 96" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
      <circle cx="50" cy="50" r="22" fill="rgba(10,107,207,0.14)" stroke="rgba(10,107,207,0.4)" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="50" cy="50" r="5" fill="#0A6BCF" stroke="#FFFFFF" strokeWidth="2" />
    </svg>
  );
}

// ============================================================
// STYLES
// ============================================================
const sd = {
  main: { flex: 1, padding: "20px 32px 40px", display: "flex", flexDirection: "column", gap: 20, color: "#0E2C56" },

  disputeBanner: {
    display: "flex", alignItems: "center", gap: 16,
    background: "linear-gradient(135deg, #DC2626, #991B1B)",
    color: "#FFFFFF", padding: "14px 20px",
    borderRadius: 14, boxShadow: "0 6px 16px rgba(220,38,38,0.18)",
  },
  disputeIcon: { width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "grid", placeItems: "center", flexShrink: 0 },
  disputeBtn: { background: "#FFFFFF", color: "#DC2626", border: "none", borderRadius: 10, padding: "9px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", flexShrink: 0 },

  head: { display: "flex", alignItems: "center", gap: 16, paddingBottom: 8, borderBottom: "1px solid #E1E8F0" },
  eyebrow: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#9CA3AF", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4 },
  h1: { fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: 26, margin: 0, color: "#0E2C56", letterSpacing: "-0.005em" },
  statusBadge: { display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, fontSize: 12.5, fontWeight: 600 },
  metaTag: { display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 999, background: "#F8FBFF", border: "1px solid #E1E8F0", color: "#6B7280", fontSize: 11.5, fontWeight: 500 },
  btnSecondary: { background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #0A6BCF", borderRadius: 10, padding: "10px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  btnGhost: { background: "transparent", color: "#0E2C56", border: "1px solid #E1E8F0", borderRadius: 10, padding: "10px 14px", fontWeight: 500, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  btnGhostSm: { background: "transparent", color: "#6B7280", border: "1px solid #E1E8F0", borderRadius: 7, padding: "5px 10px", fontWeight: 500, fontSize: 11.5, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  btnDanger: { background: "#FFFFFF", color: "#DC2626", border: "1px solid #DC2626", borderRadius: 10, padding: "10px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center" },

  body: { display: "grid", gridTemplateColumns: "35% 1fr 25%", gap: 20 },
  colLeft: { display: "flex", flexDirection: "column", gap: 16, minWidth: 0 },
  colCenter: { display: "flex", flexDirection: "column", gap: 16, minWidth: 0 },
  colRight: { display: "flex", flexDirection: "column", gap: 16, minWidth: 0 },

  card: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, padding: 20 },
  cardHead: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 },
  cardIcon: { width: 30, height: 30, borderRadius: 8, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  cardTitle: { fontSize: 13.5, fontWeight: 600, color: "#0E2C56" },
  cardSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  cardLink: { marginTop: 12, display: "inline-flex", alignItems: "center", gap: 5, color: "#0A6BCF", textDecoration: "none", fontSize: 12.5, fontWeight: 500 },
  av: { borderRadius: "50%", display: "grid", placeItems: "center", fontWeight: 600, flexShrink: 0 },

  verifiedBadge: { display: "inline-grid", placeItems: "center", width: 16, height: 16, borderRadius: "50%", background: "#E5F7EE" },
  kvLabel: { fontSize: 10.5, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 },

  priceRow: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#0E2C56", padding: "6px 0" },
  priceFinal: { display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 14px", background: "linear-gradient(135deg, rgba(10,107,207,0.06), rgba(24,193,255,0.06))", borderRadius: 10, marginTop: 12 },
  payRow: { marginTop: 14, padding: 12, background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 10, display: "flex", gap: 12, alignItems: "center" },
  payIcon: { width: 32, height: 32, borderRadius: 8, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  paidBadge: { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 7px", background: "#E5F7EE", color: "#18A66A", borderRadius: 999, fontSize: 11, fontWeight: 600 },

  /* timeline */
  timelineHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  timeline: { display: "flex", flexDirection: "column", paddingTop: 6 },
  tlRow: { display: "flex", gap: 14, position: "relative" },
  tlLeftCol: { display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 },
  tlDot: { width: 30, height: 30, borderRadius: "50%", display: "grid", placeItems: "center", flexShrink: 0, position: "relative", zIndex: 1 },
  tlDotPulse: { boxShadow: "0 0 0 6px rgba(10,107,207,0.15)" },
  tlLine: { width: 2, flex: 1, minHeight: 18 },
  tlContent: { flex: 1, minWidth: 0, paddingBottom: 18 },
  tlMeta: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" },
  tlTime: { fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: "#0E2C56" },
  actorPill: { display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 999, fontSize: 10.5, fontWeight: 600 },
  currentPill: { display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", background: "rgba(10,107,207,0.12)", color: "#0A6BCF", borderRadius: 999, fontSize: 10.5, fontWeight: 700 },
  pulseDot: { width: 5, height: 5, borderRadius: "50%", background: "#0A6BCF", boxShadow: "0 0 0 3px rgba(10,107,207,0.25)" },
  tlTitle: { fontSize: 13.5, fontWeight: 600, lineHeight: 1.35 },
  tlNote: { fontSize: 12.5, lineHeight: 1.5, marginTop: 4 },
  tlEvidence: { display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" },
  evChip: { display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", background: "rgba(10,107,207,0.08)", color: "#0A6BCF", borderRadius: 7, fontSize: 11, fontWeight: 500 },
  evThumb: { width: 52, height: 52, borderRadius: 8, background: "linear-gradient(135deg, #0A6BCF, #18C1FF)", display: "grid", placeItems: "center", cursor: "pointer", boxShadow: "0 1px 2px rgba(14,44,86,0.08)" },

  /* admin actions */
  adminBtnPrimary: { display: "flex", alignItems: "center", justifyContent: "center", width: "100%", marginBottom: 8, background: "#0A6BCF", color: "#FFFFFF", border: "1px solid #0A6BCF", borderRadius: 10, padding: "10px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", boxShadow: "0 1px 2px rgba(10,107,207,0.25)" },
  adminBtn: { display: "flex", alignItems: "center", justifyContent: "center", width: "100%", marginBottom: 8, background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #E1E8F0", borderRadius: 10, padding: "10px 14px", fontWeight: 500, fontSize: 13, cursor: "pointer" },
  actionsHint: { marginTop: 6, display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#9CA3AF" },

  /* notes */
  noteArea: { width: "100%", minHeight: 70, fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#0E2C56", padding: "10px 12px", border: "1px solid #E1E8F0", borderRadius: 10, outline: "none", resize: "vertical", marginBottom: 8, background: "#FBFDFF" },
  notesHistoryLabel: { fontSize: 10.5, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".08em", fontFamily: "'JetBrains Mono', monospace", marginTop: 14, marginBottom: 8 },
  note: { padding: 12, background: "#FBFDFF", border: "1px solid #E1E8F0", borderRadius: 10 },

  /* metadata */
  metaList: { display: "flex", flexDirection: "column", gap: 0 },
  metaRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F0F4F9" },
  metaLabel: { fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", fontFamily: "'JetBrains Mono', monospace" },
};

Object.assign(window, { ServiceDetail });
