/* global React, AdminIc, CLIENT_TABS, CLIENT_STATUS, CLIENTS, AV_TONES */
const Ic = AdminIc;

// ============================================================
// LISTADO DE CLIENTES
// ============================================================
function ClientsList() {
  return (
    <main style={cl.main}>
      <div style={cl.headRow}>
        <div>
          <h1 style={cl.h1}>Clientes</h1>
          <p style={cl.sub}>Base de usuarios finales de la plataforma · ZMG</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={cl.btnGhost}><Ic name="filter" size={14} color="#0E2C56" style={{ marginRight: 8 }} />Vistas guardadas</button>
          <button style={cl.btnSecondary}><Ic name="download" size={14} color="#0A6BCF" style={{ marginRight: 8 }} />Exportar CSV</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={cl.tabsRow}>
        {CLIENT_TABS.map((t, i) => (
          <div key={t.id} style={{ ...cl.tab, ...(i === 0 ? cl.tabActive : null) }}>
            <span>{t.label}</span>
            <span style={{ ...cl.tabCount, ...(t.tone ? cl.tabCountTone(t.tone) : null) }}>{t.count.toLocaleString("es-MX")}</span>
            {i === 0 && <span style={cl.tabUnderline} />}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={cl.filters}>
        <div style={{ ...cl.inputWrap, flex: 1, maxWidth: 320 }}>
          <Ic name="search" size={14} color="#9CA3AF" style={{ marginLeft: 12 }} />
          <input placeholder="Nombre, teléfono o email" style={cl.input} />
        </div>

        <div style={cl.selectWrap}>
          <Ic name="map-pin" size={14} color="#0A6BCF" />
          <span style={cl.selectLabel}>Región:</span>
          <span style={cl.selectValue}>Todas</span>
          <Ic name="chevron-down" size={14} color="#9CA3AF" />
        </div>

        <div style={cl.selectWrap}>
          <Ic name="calendar-range" size={14} color="#0A6BCF" />
          <span style={cl.selectLabel}>Registro:</span>
          <span style={cl.selectValue}>01/01/2026 – 19/05/2026</span>
          <Ic name="chevron-down" size={14} color="#9CA3AF" />
        </div>

        <div style={cl.toggleField}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 12.5, color: "#0E2C56", fontWeight: 500 }}>Con disputas abiertas</span>
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>3 clientes coinciden</span>
          </div>
          <div style={cl.toggle}><span style={cl.toggleKnob} /></div>
        </div>

        <button style={cl.btnGhost}><Ic name="x" size={13} color="#6B7280" style={{ marginRight: 6 }} />Limpiar</button>
      </div>

      {/* Table */}
      <div style={cl.tableCard}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FBFF" }}>
              <th style={{ ...cl.th, width: 36, paddingLeft: 20 }}><input type="checkbox" style={cl.checkbox} /></th>
              <th style={cl.th}>Cliente</th>
              <th style={cl.th}>Teléfono</th>
              <th style={cl.th}>Región</th>
              <th style={cl.th}>Servicios</th>
              <th style={cl.th}>GMV total</th>
              <th style={cl.th}>Rating</th>
              <th style={cl.th}>Último servicio</th>
              <th style={cl.th}>Estado</th>
              <th style={{ ...cl.th, width: 56 }}></th>
            </tr>
          </thead>
          <tbody>
            {CLIENTS.map((c, i) => {
              const st = CLIENT_STATUS[c.status];
              const tone = AV_TONES[c.avTone];
              return (
                <tr key={i} style={cl.tr}>
                  <td style={{ ...cl.td, paddingLeft: 20 }}><input type="checkbox" style={cl.checkbox} /></td>
                  <td style={cl.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ ...cl.cav, background: tone.bg, color: tone.fg }}>{initials(c.name)}</div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 600, color: "#0E2C56" }}>{c.name}</span>
                          {c.disputes > 0 && (
                            <span style={cl.disputesPill}>
                              <Ic name="shield-alert" size={10} color="#DC2626" /> {c.disputes}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 2 }}>{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...cl.td, fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: "#6B7280" }}>{c.phone}</td>
                  <td style={{ ...cl.td, fontSize: 13, color: "#0E2C56" }}>{c.region}</td>
                  <td style={{ ...cl.td, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#0E2C56" }}>{c.services}</td>
                  <td style={{ ...cl.td, fontSize: 13, color: "#0E2C56", fontWeight: 600, fontFamily: "'Manrope', sans-serif" }}>
                    {c.gmv}
                    <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 400, marginLeft: 3, fontFamily: "'Inter', sans-serif" }}>MXN</span>
                  </td>
                  <td style={cl.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Ic name="star" size={13} color="#F59E0B" />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#0E2C56" }}>{c.rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td style={{ ...cl.td, fontSize: 12.5, color: "#6B7280" }}>{c.last}</td>
                  <td style={cl.td}>
                    <span style={{ ...cl.badge, background: st.bg, color: st.fg }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: st.dot }} />
                      {st.label}
                    </span>
                  </td>
                  <td style={{ ...cl.td, paddingRight: 20 }}>
                    <button style={cl.kebab} aria-label="Acciones"><Ic name="more-vertical" size={16} color="#6B7280" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={cl.tableFooter}>
          <span style={{ fontSize: 12.5, color: "#6B7280" }}>
            Mostrando <b style={{ color: "#0E2C56", fontWeight: 600 }}>1 – 12</b> de <b style={{ color: "#0E2C56", fontWeight: 600 }}>4,832</b> clientes
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button style={cl.pageBtn} disabled><Ic name="chevron-left" size={14} color="#9CA3AF" /></button>
            <button style={{ ...cl.pageBtn, ...cl.pageBtnActive }}>1</button>
            <button style={cl.pageBtn}>2</button>
            <button style={cl.pageBtn}>3</button>
            <span style={{ padding: "0 4px", color: "#9CA3AF", fontSize: 13 }}>…</span>
            <button style={cl.pageBtn}>403</button>
            <button style={cl.pageBtn}><Ic name="chevron-right" size={14} color="#0E2C56" /></button>
          </div>
        </div>
      </div>
    </main>
  );
}

function initials(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase();
}

// Styles (scoped to clients list)
const cl = {
  main: { flex: 1, padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20, color: "#0E2C56", overflow: "hidden" },
  headRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  h1: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 28, margin: 0, letterSpacing: "-0.01em" },
  sub: { fontSize: 13.5, color: "#6B7280", margin: "4px 0 0" },
  btnSecondary: { background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #0A6BCF", borderRadius: 10, padding: "9px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  btnGhost: { background: "transparent", color: "#0E2C56", border: "1px solid #E1E8F0", borderRadius: 10, padding: "9px 14px", fontWeight: 500, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center" },

  tabsRow: { display: "flex", gap: 24, borderBottom: "1px solid #E1E8F0" },
  tab: { position: "relative", display: "flex", alignItems: "center", gap: 8, padding: "12px 2px 14px", fontSize: 13.5, fontWeight: 500, color: "#6B7280", cursor: "pointer" },
  tabActive: { color: "#0A6BCF", fontWeight: 600 },
  tabCount: { fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "#EEF3F8", color: "#6B7280", fontWeight: 600 },
  tabCountTone: (t) => {
    if (t === "ok")   return { background: "#E5F7EE", color: "#18A66A" };
    if (t === "info") return { background: "#E0F6FF", color: "#0884B0" };
    if (t === "err")  return { background: "#FCE9E9", color: "#DC2626" };
    return { background: "#EEF3F8", color: "#6B7280" };
  },
  tabUnderline: { position: "absolute", left: 0, right: 0, bottom: -1, height: 2, background: "#0A6BCF", borderRadius: 2 },

  filters: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "14px 18px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12 },
  inputWrap: { display: "flex", alignItems: "center", height: 38, background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 8 },
  input: { flex: 1, border: "none", outline: "none", background: "transparent", padding: "0 12px", fontSize: 13, color: "#0E2C56", height: "100%" },
  selectWrap: { display: "flex", alignItems: "center", gap: 6, height: 38, padding: "0 12px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 8, cursor: "pointer" },
  selectLabel: { fontSize: 12, color: "#6B7280" },
  selectValue: { fontSize: 13, color: "#0E2C56", fontWeight: 500 },
  toggleField: { display: "flex", alignItems: "center", gap: 12, padding: "5px 14px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 8, height: 38 },
  toggle: { position: "relative", width: 36, height: 22, borderRadius: 999, background: "#E1E8F0", cursor: "pointer", flexShrink: 0 },
  toggleKnob: { position: "absolute", left: 3, top: 3, width: 16, height: 16, borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 1px 2px rgba(14,44,86,0.18)" },

  tableCard: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, overflow: "hidden" },
  th: { textAlign: "left", padding: "12px 16px", fontSize: 11, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", borderBottom: "1px solid #E1E8F0" },
  tr: { borderBottom: "1px solid #F0F4F9", height: 60 },
  td: { padding: "10px 16px", fontSize: 13, color: "#0E2C56", verticalAlign: "middle" },
  checkbox: { width: 16, height: 16, accentColor: "#0A6BCF" },
  cav: { width: 36, height: 36, borderRadius: "50%", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 12, flexShrink: 0 },
  badge: { display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 9px", borderRadius: 999, fontSize: 11.5, fontWeight: 600 },
  disputesPill: { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 6px", borderRadius: 999, background: "#FCE9E9", color: "#DC2626", fontSize: 10, fontWeight: 700 },
  kebab: { background: "transparent", border: "1px solid transparent", borderRadius: 8, padding: 6, cursor: "pointer", display: "grid", placeItems: "center" },

  tableFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderTop: "1px solid #E1E8F0" },
  pageBtn: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 8, padding: "6px 11px", fontSize: 13, fontWeight: 500, color: "#0E2C56", cursor: "pointer", minWidth: 32, height: 30, display: "inline-grid", placeItems: "center" },
  pageBtnActive: { background: "#0A6BCF", color: "#FFFFFF", borderColor: "#0A6BCF" },
};

Object.assign(window, { ClientsList, clListStyles: cl });
