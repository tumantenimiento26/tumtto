/* global React, AdminIc, MARIA */
const Ic = AdminIc;

// ============================================================
// CLIENT DETAIL
// ============================================================
function ClientDetail() {
  return (
    <main style={cd.main}>
      {/* Profile header */}
      <div style={cd.profile}>
        <div style={cd.bigAv}>{MARIA.initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 style={cd.name}>{MARIA.name}</h1>
            <span style={cd.statusBadge}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#18A66A" }} />
              Cliente activo
            </span>
            <span style={cd.tierBadge}>
              <Ic name="award" size={11} color="#0884B0" /> Recurrente · top 10%
            </span>
          </div>
          <div style={cd.profileMeta}>
            <span><Ic name="phone" size={13} color="#9CA3AF" style={{ marginRight: 4 }} />{MARIA.phone}</span>
            <span><Ic name="mail" size={13} color="#9CA3AF" style={{ marginRight: 4 }} />{MARIA.email}</span>
            <span><Ic name="calendar" size={13} color="#9CA3AF" style={{ marginRight: 4 }} />Registrada {MARIA.registered}</span>
            <span><Ic name="activity" size={13} color="#9CA3AF" style={{ marginRight: 4 }} />Actividad {MARIA.lastSeen}</span>
            <span><Ic name="map-pin" size={13} color="#9CA3AF" style={{ marginRight: 4 }} />{MARIA.region}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={cd.btnSecondary}><Ic name="message-square" size={14} color="#0A6BCF" style={{ marginRight: 8 }} />Enviar mensaje</button>
          <button style={cd.btnDanger}><Ic name="ban" size={14} color="#DC2626" style={{ marginRight: 8 }} />Suspender</button>
          <button style={cd.kebabLg} aria-label="Más acciones"><Ic name="more-vertical" size={16} color="#0E2C56" /></button>
        </div>
      </div>

      {/* Internal tabs */}
      <div style={cd.tabs}>
        {[
          { id: "resumen", label: "Resumen", icon: "layout-dashboard" },
          { id: "services", label: "Servicios", icon: "wrench", count: 14 },
          { id: "payments", label: "Pagos", icon: "credit-card" },
          { id: "addresses", label: "Direcciones", icon: "map-pin", count: 3 },
          { id: "disputes", label: "Disputas y soporte", icon: "shield-alert", count: 2, tone: "warn" },
          { id: "notes", label: "Notas internas", icon: "message-square-text" },
        ].map((t, i) => {
          const active = i === 0;
          return (
            <div key={t.id} style={{ ...cd.tab, ...(active ? cd.tabActive : null) }}>
              <Ic name={t.icon} size={14} color={active ? "#0A6BCF" : "#6B7280"} />
              <span>{t.label}</span>
              {t.count != null && (
                <span style={{
                  ...cd.tabCount,
                  ...(t.tone === "warn" ? { background: "#FEF3DC", color: "#B45309" } : null),
                  ...(active ? { background: "rgba(10,107,207,0.12)", color: "#0A6BCF" } : null),
                }}>{t.count}</span>
              )}
              {active && <span style={cd.tabUnderline} />}
            </div>
          );
        })}
      </div>

      {/* Two-column resumen body */}
      <div style={cd.body}>
        <div style={cd.colLeft}>
          {/* Info personal */}
          <DetailCard title="Información personal" icon="contact-round">
            <div style={cd.kvGrid}>
              <KV label="Nombre completo" value={MARIA.name} />
              <KV label="Email" value={MARIA.email} />
              <KV label="Teléfono" value={MARIA.phone} mono />
              <KV label="Región principal" value={MARIA.region} />
              <KV label="Fecha de registro" value={MARIA.registered} />
              <KV label="Método preferido de pago" value={MARIA.preferredPay} />
            </div>
          </DetailCard>

          {/* Estadísticas */}
          <DetailCard title="Estadísticas como cliente" icon="bar-chart-3"
            sub="Últimos 8 meses · desde su registro">
            <div style={cd.statGrid}>
              {MARIA.stats.map((s, i) => (
                <div key={i} style={cd.stat}>
                  <div style={cd.statLabel}>{s.label}</div>
                  <div style={cd.statVal}>{s.value}</div>
                  <div style={cd.statSub}>{s.sub}</div>
                </div>
              ))}
            </div>
          </DetailCard>

          {/* Direcciones */}
          <DetailCard title="Direcciones guardadas" icon="map-pin"
            sub={`${MARIA.addresses.length} direcciones · Casa marcada como principal`}>
            <div style={cd.addrRow}>
              <AddressMap />
              <div style={cd.addrList}>
                {MARIA.addresses.map((a, i) => (
                  <div key={i} style={{ ...cd.addrItem, ...(a.primary ? cd.addrItemPrimary : null) }}>
                    <div style={{ ...cd.addrPin, background: a.primary ? "#0A6BCF" : "#9CA3AF" }}>
                      <Ic name={a.label === "Casa" ? "home" : (a.label === "Oficina" ? "briefcase" : "heart")} size={13} color="#FFFFFF" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: "#0E2C56" }}>{a.label}</span>
                        {a.primary && <span style={cd.primaryPill}>Principal</span>}
                      </div>
                      <div style={{ fontSize: 12.5, color: "#0E2C56", marginTop: 3, lineHeight: 1.4 }}>{a.street}</div>
                      <div style={{ fontSize: 12, color: "#6B7280", marginTop: 1 }}>{a.city}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DetailCard>
        </div>

        <div style={cd.colRight}>
          {/* Últimos 5 servicios */}
          <DetailCard title="Últimos 5 servicios" icon="history">
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {MARIA.recent.map((s, i) => (
                <div key={i} style={cd.svcRow}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "#6B7280", fontWeight: 500 }}>#{s.id}</span>
                      <StatusBadge status={s.status} />
                    </div>
                    <div style={{ fontSize: 13.5, color: "#0E2C56", fontWeight: 600 }}>{s.cat}</div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{s.tech} · {s.date}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0E2C56", fontFamily: "'Manrope', sans-serif" }}>{s.total}</div>
                    <div style={{ fontSize: 10.5, color: "#9CA3AF" }}>MXN</div>
                  </div>
                </div>
              ))}
            </div>
            <a href="#" style={cd.viewAll}>
              Ver los 14 servicios <Ic name="arrow-right" size={13} color="#0A6BCF" />
            </a>
          </DetailCard>

          {/* Métodos de pago */}
          <DetailCard title="Métodos de pago guardados" icon="credit-card">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {MARIA.payment.map((p, i) => <PaymentMethod key={i} pm={p} />)}
            </div>
          </DetailCard>

          {/* Reputación */}
          <DetailCard title="Reputación del cliente" icon="thumbs-up"
            sub="Cómo la califican los técnicos al terminar el servicio">
            <div style={cd.repHead}>
              <div>
                <div style={cd.repNum}>{MARIA.reputation.rating.toFixed(1)}</div>
                <div style={cd.stars}>
                  {[1, 2, 3, 4, 5].map((s) => <Ic key={s} name="star" size={14} color="#F59E0B" />)}
                </div>
                <div style={{ fontSize: 11.5, color: "#9CA3AF", marginTop: 4 }}>{MARIA.reputation.reviews} reseñas</div>
              </div>
              <div style={{ flex: 1 }}>
                {MARIA.reputation.breakdown.map((b) => (
                  <div key={b.stars} style={cd.repRow}>
                    <span style={{ fontSize: 11, color: "#6B7280", width: 18 }}>{b.stars}★</span>
                    <div style={cd.repTrack}>
                      <div style={{ ...cd.repFill, width: `${(b.n / MARIA.reputation.reviews) * 100}%` }} />
                    </div>
                    <span style={{ fontSize: 11, color: "#6B7280", width: 18, textAlign: "right" }}>{b.n}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...cd.sectionLabel, marginTop: 18 }}>Etiquetas frecuentes</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {MARIA.reputation.tags.map((t) => (
                <span key={t.label} style={cd.tagChip}>
                  {t.label}
                  <span style={{ marginLeft: 6, color: "#0884B0", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>×{t.n}</span>
                </span>
              ))}
            </div>
          </DetailCard>
        </div>
      </div>
    </main>
  );
}

// Helpers
function DetailCard({ title, icon, sub, children }) {
  return (
    <div style={cd.card}>
      <div style={cd.cardHead}>
        <div style={cd.cardIcon}><Ic name={icon} size={16} color="#0A6BCF" /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={cd.cardTitle}>{title}</div>
          {sub && <div style={cd.cardSub}>{sub}</div>}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function KV({ label, value, mono }) {
  return (
    <div>
      <div style={cd.kvLabel}>{label}</div>
      <div style={{
        fontSize: 14, color: "#0E2C56", fontWeight: 500,
        fontFamily: mono ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
      }}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const meta = {
    "completado": { label: "Completado", bg: "#E5F7EE", fg: "#18A66A", dot: "#18A66A" },
    "cancelado":  { label: "Cancelado",  bg: "#FCE9E9", fg: "#DC2626", dot: "#DC2626" },
  }[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 7px", borderRadius: 999, fontSize: 10.5, fontWeight: 600, background: meta.bg, color: meta.fg }}>
      <span style={{ width: 4, height: 4, borderRadius: "50%", background: meta.dot }} />
      {meta.label}
    </span>
  );
}

function PaymentMethod({ pm }) {
  const iconName = pm.kind === "card" ? "credit-card" : (pm.kind === "oxxo" ? "store" : "wallet");
  const iconBg = pm.kind === "card" ? "rgba(10,107,207,0.10)" : (pm.kind === "oxxo" ? "#FEF3DC" : "rgba(24,193,255,0.18)");
  const iconColor = pm.kind === "card" ? "#0A6BCF" : (pm.kind === "oxxo" ? "#B45309" : "#0884B0");
  return (
    <div style={cd.pmRow}>
      <div style={{ ...cd.pmIcon, background: iconBg }}><Ic name={iconName} size={16} color={iconColor} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "#0E2C56" }}>{pm.brand}</span>
          {pm.primary && <span style={cd.primaryPill}>Principal</span>}
          {pm.verified && (
            <span style={{ ...cd.primaryPill, background: "#E5F7EE", color: "#18A66A" }}>
              <Ic name="badge-check" size={10} color="#18A66A" style={{ marginRight: 3 }} />Verificado
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 3 }}>{pm.detail}{pm.exp ? ` · ${pm.exp}` : ""}</div>
      </div>
    </div>
  );
}

function AddressMap() {
  // mini-map with 3 pins
  return (
    <svg viewBox="0 0 220 220" width="220" height="220" style={{ borderRadius: 12, background: "#EEF3F8", display: "block", flexShrink: 0 }}>
      <defs>
        <pattern id="addrGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0 L0 0 0 20" fill="none" stroke="#DCE6F1" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="220" height="220" fill="url(#addrGrid)" />
      <path d="M180 30 Q 120 90 60 80 Q 30 100 50 160 Q 110 200 180 170 Q 220 120 180 30 Z" fill="rgba(10,107,207,0.10)" stroke="rgba(10,107,207,0.3)" strokeWidth="1" strokeDasharray="3 3" />
      <path d="M0 110 Q 90 95 220 130" stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9" />
      <path d="M110 0 Q 100 100 130 220" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
      {/* Pins */}
      <MapPin x={90} y={95} color="#0A6BCF" primary />
      <MapPin x={155} y={140} color="#9CA3AF" />
      <MapPin x={60} y={155} color="#9CA3AF" />
    </svg>
  );
}
function MapPin({ x, y, color, primary }) {
  return (
    <g transform={`translate(${x},${y})`}>
      {primary && <circle r="14" fill={color} opacity="0.18" />}
      <circle r="7" fill={color} stroke="#FFFFFF" strokeWidth="2" />
    </g>
  );
}

// ============================================================
// STYLES
// ============================================================
const cd = {
  main: { flex: 1, padding: "24px 32px 40px", display: "flex", flexDirection: "column", gap: 0, color: "#0E2C56" },

  profile: { display: "flex", alignItems: "center", gap: 20, padding: "8px 0 22px" },
  bigAv: { width: 88, height: 88, borderRadius: "50%", background: "rgba(10,107,207,0.14)", color: "#0A6BCF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 28, flexShrink: 0 },
  name: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 26, margin: 0, color: "#0E2C56", letterSpacing: "-0.01em" },
  statusBadge: { display: "inline-flex", alignItems: "center", gap: 6, background: "#E5F7EE", color: "#18A66A", fontSize: 12, fontWeight: 600, padding: "3px 9px", borderRadius: 999 },
  tierBadge: { display: "inline-flex", alignItems: "center", gap: 4, background: "#E0F6FF", color: "#0884B0", fontSize: 12, fontWeight: 600, padding: "3px 9px", borderRadius: 999 },
  profileMeta: { display: "flex", flexWrap: "wrap", gap: 18, fontSize: 13, color: "#6B7280", marginTop: 8 },
  btnSecondary: { background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #0A6BCF", borderRadius: 10, padding: "10px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  btnDanger: { background: "#FFFFFF", color: "#DC2626", border: "1px solid #DC2626", borderRadius: 10, padding: "10px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  kebabLg: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10, padding: "10px 12px", cursor: "pointer", display: "grid", placeItems: "center" },

  tabs: { display: "flex", gap: 22, borderBottom: "1px solid #E1E8F0", marginBottom: 24 },
  tab: { position: "relative", display: "flex", alignItems: "center", gap: 8, padding: "12px 2px 14px", fontSize: 13.5, fontWeight: 500, color: "#6B7280", cursor: "pointer" },
  tabActive: { color: "#0A6BCF", fontWeight: 600 },
  tabCount: { fontSize: 11, padding: "1px 7px", borderRadius: 999, background: "#EEF3F8", color: "#6B7280", fontWeight: 600 },
  tabUnderline: { position: "absolute", left: 0, right: 0, bottom: -1, height: 2, background: "#0A6BCF", borderRadius: 2 },

  body: { display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 },
  colLeft: { display: "flex", flexDirection: "column", gap: 16 },
  colRight: { display: "flex", flexDirection: "column", gap: 16 },

  card: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, padding: 22 },
  cardHead: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 },
  cardIcon: { width: 32, height: 32, borderRadius: 8, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  cardTitle: { fontSize: 14.5, fontWeight: 600, color: "#0E2C56", letterSpacing: "-0.005em" },
  cardSub: { fontSize: 12.5, color: "#6B7280", marginTop: 2 },

  kvGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  kvLabel: { fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", fontFamily: "'JetBrains Mono', monospace", marginBottom: 5 },

  statGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 },
  stat: { background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 12, padding: "14px 16px" },
  statLabel: { fontSize: 12, color: "#6B7280", fontWeight: 500 },
  statVal: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 22, color: "#0E2C56", letterSpacing: "-0.01em", marginTop: 6, lineHeight: 1 },
  statSub: { fontSize: 11, color: "#9CA3AF", marginTop: 6 },

  addrRow: { display: "flex", gap: 16, alignItems: "stretch" },
  addrList: { flex: 1, display: "flex", flexDirection: "column", gap: 8 },
  addrItem: { display: "flex", gap: 12, padding: "10px 12px", border: "1px solid #E1E8F0", borderRadius: 10, background: "#FBFDFF" },
  addrItemPrimary: { borderColor: "rgba(10,107,207,0.3)", background: "rgba(10,107,207,0.04)" },
  addrPin: { width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0 },
  primaryPill: { display: "inline-flex", alignItems: "center", padding: "1px 7px", borderRadius: 999, background: "rgba(10,107,207,0.10)", color: "#0A6BCF", fontSize: 10.5, fontWeight: 600 },

  svcRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, padding: "12px 0", borderTop: "1px solid #F0F4F9" },
  viewAll: { marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, color: "#0A6BCF", textDecoration: "none", fontSize: 13, fontWeight: 500 },

  pmRow: { display: "flex", gap: 12, padding: "12px 14px", border: "1px solid #E1E8F0", borderRadius: 10, background: "#FBFDFF" },
  pmIcon: { width: 36, height: 36, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0 },

  repHead: { display: "flex", gap: 20, alignItems: "center" },
  repNum: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 36, color: "#0E2C56", lineHeight: 1, letterSpacing: "-0.02em" },
  stars: { display: "flex", gap: 2, marginTop: 6 },
  repRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 },
  repTrack: { flex: 1, height: 6, background: "#EEF3F8", borderRadius: 999, overflow: "hidden" },
  repFill: { height: "100%", background: "#F59E0B", borderRadius: 999 },
  sectionLabel: { fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".08em", fontFamily: "'JetBrains Mono', monospace", margin: "0 0 10px" },
  tagChip: { display: "inline-flex", alignItems: "center", padding: "5px 10px", borderRadius: 999, background: "#E0F6FF", color: "#0884B0", fontSize: 12, fontWeight: 500 },
};

Object.assign(window, { ClientDetail, clDetailStyles: cd });
