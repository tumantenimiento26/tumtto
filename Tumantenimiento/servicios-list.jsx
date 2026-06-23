/* global React, AdminIc, SVC_TABS, SVC_STATUS, SVC_PAYMENT, SERVICES_LIST, AV_TONES */
const Ic = AdminIc;
const _avTones = (typeof AV_TONES !== "undefined" && AV_TONES) || [
  { bg: "rgba(10,107,207,0.14)", fg: "#0A6BCF" },
  { bg: "rgba(24,193,255,0.18)", fg: "#0884B0" },
  { bg: "rgba(14,44,86,0.10)",   fg: "#0E2C56" },
  { bg: "rgba(24,166,106,0.16)", fg: "#18A66A" },
];

// ============================================================
// SERVICIOS — LISTADO
// ============================================================
function ServicesList() {
  return (
    <main style={svl.main}>
      <div style={svl.headRow}>
        <div>
          <h1 style={svl.h1}>Servicios</h1>
          <p style={svl.sub}>Operación en tiempo real y histórico completo · ZMG</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={svl.btnGhost}><Ic name="bookmark" size={14} color="#0E2C56" style={{ marginRight: 8 }} />Vistas guardadas</button>
          <button style={svl.btnSecondary}><Ic name="download" size={14} color="#0A6BCF" style={{ marginRight: 8 }} />Exportar</button>
          <button style={svl.btnPrimary}><Ic name="plus" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />Crear servicio</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={svl.tabsScroll}>
        <div style={svl.tabsRow}>
          {SVC_TABS.map((t, i) => (
            <div key={t.id} style={{ ...svl.tab, ...(i === 0 ? svl.tabActive : null) }}>
              <span>{t.label}</span>
              <span style={{ ...svl.tabCount, ...(t.tone ? svl.tabCountTone(t.tone) : null) }}>{t.count.toLocaleString("es-MX")}</span>
              {i === 0 && <span style={svl.tabUnderline} />}
            </div>
          ))}
        </div>
      </div>

      {/* Filters (collapsed bar) */}
      <div style={svl.filters}>
        <div style={{ ...svl.inputWrap, flex: 1, maxWidth: 280 }}>
          <Ic name="search" size={14} color="#9CA3AF" style={{ marginLeft: 12 }} />
          <input placeholder="ID servicio, cliente o técnico" style={svl.input} />
        </div>
        <Chip icon="calendar-range" label="Hoy · 19/05" />
        <Chip icon="folder-tree" label="Categoría: todas" />
        <Chip icon="map-pin" label="Región: ZMG" />
        <Chip icon="credit-card" label="Pago: todos" />
        <Chip icon="banknote" label="Monto: $0 – $10K" />
        <button style={svl.btnGhost}><Ic name="sliders-horizontal" size={13} color="#0E2C56" style={{ marginRight: 6 }} />Más filtros</button>
      </div>

      {/* Live counter strip */}
      <div style={svl.liveStrip}>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={svl.liveDot} />
          <span style={{ fontSize: 13, color: "#0E2C56", fontWeight: 500 }}>
            <b style={{ fontWeight: 700 }}>47</b> servicios en curso ahora mismo
          </span>
        </span>
        <span style={{ fontSize: 12.5, color: "#6B7280" }}>
          <Ic name="trending-up" size={12} color="#18A66A" style={{ marginRight: 4 }} />
          +18% vs ayer a esta hora
        </span>
        <span style={{ marginLeft: "auto", fontSize: 11.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>
          Actualizado hace 12 s
        </span>
      </div>

      {/* Table */}
      <div style={svl.tableCard}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FBFF" }}>
              <th style={svl.th}>ID</th>
              <th style={svl.th}>Cliente</th>
              <th style={svl.th}>Técnico</th>
              <th style={svl.th}>Categoría</th>
              <th style={svl.th}>Estado</th>
              <th style={svl.th}>Programado</th>
              <th style={svl.th}>En estado</th>
              <th style={svl.th}>Total</th>
              <th style={svl.th}>Pago</th>
              <th style={svl.th}>Región</th>
              <th style={{ ...svl.th, width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {SERVICES_LIST.map((r, i) => {
              const st = SVC_STATUS[r.status];
              const pm = SVC_PAYMENT[r.pay];
              return (
                <tr key={i} style={{ ...svl.tr, ...(r.status === "disputa" ? { background: "rgba(220,38,38,0.03)" } : null) }}>
                  <td style={{ ...svl.td, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>
                    <a href="#" style={{ color: "#0A6BCF", textDecoration: "none" }}>#{r.id}</a>
                  </td>
                  <td style={svl.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ ...svl.av, background: _avTones[i % 4].bg, color: _avTones[i % 4].fg }}>{initials2(r.client)}</div>
                      <span style={{ fontSize: 13, color: "#0E2C56", fontWeight: 500 }}>{r.client}</span>
                    </div>
                  </td>
                  <td style={svl.td}>
                    {r.tech === "—" ? (
                      <span style={{ fontSize: 12, color: "#9CA3AF", fontStyle: "italic" }}>— sin asignar</span>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ ...svl.av, background: _avTones[(i + 1) % 4].bg, color: _avTones[(i + 1) % 4].fg }}>{initials2(r.tech)}</div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, color: "#0E2C56", fontWeight: 500, lineHeight: 1.2, whiteSpace: "nowrap" }}>{r.tech}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                            <Ic name="star" size={10} color="#F59E0B" />
                            <span style={{ fontSize: 10.5, color: "#6B7280", fontWeight: 600 }}>{r.techRating?.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td style={{ ...svl.td, fontSize: 12.5, color: "#0E2C56" }}>{r.cat}</td>
                  <td style={svl.td}>
                    <span style={{ ...svl.badge, background: st.bg, color: st.fg }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: st.dot }} />
                      {st.label}
                    </span>
                  </td>
                  <td style={{ ...svl.td, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#0E2C56" }}>{r.scheduled}</td>
                  <td style={svl.td}>
                    <span style={{ fontSize: 12, color: r.status === "disputa" ? "#DC2626" : "#6B7280", fontWeight: r.status === "disputa" ? 600 : 400 }}>{r.elapsed}</span>
                  </td>
                  <td style={{ ...svl.td, fontSize: 13, fontWeight: 600, color: "#0E2C56", fontFamily: "'Manrope', sans-serif" }}>
                    {r.total}
                    {r.extras > 0 && (
                      <span style={svl.extrasPill} title={`Base $${r.base} + Extras +$${r.extras}`}>+{r.extras}</span>
                    )}
                  </td>
                  <td style={svl.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: pm.color }}>
                      <Ic name={pm.icon} size={14} color={pm.color} />
                      <span style={{ fontSize: 11.5, color: "#6B7280" }}>{pm.label}</span>
                    </div>
                  </td>
                  <td style={{ ...svl.td, fontSize: 12, color: "#6B7280", maxWidth: 160 }}>{r.region}</td>
                  <td style={{ ...svl.td }}>
                    <button style={svl.kebab} aria-label="Acciones"><Ic name="more-vertical" size={15} color="#6B7280" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={svl.tableFooter}>
          <span style={{ fontSize: 12.5, color: "#6B7280" }}>
            Mostrando <b style={{ color: "#0E2C56", fontWeight: 600 }}>1 – 15</b> de <b style={{ color: "#0E2C56", fontWeight: 600 }}>12,847</b> servicios
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button style={svl.pageBtn} disabled><Ic name="chevron-left" size={14} color="#9CA3AF" /></button>
            <button style={{ ...svl.pageBtn, ...svl.pageBtnActive }}>1</button>
            <button style={svl.pageBtn}>2</button>
            <button style={svl.pageBtn}>3</button>
            <span style={{ padding: "0 4px", color: "#9CA3AF", fontSize: 13 }}>…</span>
            <button style={svl.pageBtn}>857</button>
            <button style={svl.pageBtn}><Ic name="chevron-right" size={14} color="#0E2C56" /></button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Chip({ icon, label }) {
  return (
    <div style={svl.selectWrap}>
      <Ic name={icon} size={14} color="#0A6BCF" />
      <span style={{ fontSize: 12.5, color: "#0E2C56", fontWeight: 500 }}>{label}</span>
      <Ic name="chevron-down" size={13} color="#9CA3AF" />
    </div>
  );
}

function initials2(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase();
}

const svl = {
  main: { flex: 1, padding: "28px 32px", display: "flex", flexDirection: "column", gap: 18, color: "#0E2C56", overflow: "hidden" },
  headRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  h1: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 28, margin: 0, letterSpacing: "-0.01em" },
  sub: { fontSize: 13.5, color: "#6B7280", margin: "4px 0 0" },
  btnPrimary: { background: "#0A6BCF", color: "#FFFFFF", border: "1px solid #0A6BCF", borderRadius: 10, padding: "9px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", boxShadow: "0 1px 2px rgba(10,107,207,0.25)" },
  btnSecondary: { background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #0A6BCF", borderRadius: 10, padding: "9px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  btnGhost: { background: "transparent", color: "#0E2C56", border: "1px solid #E1E8F0", borderRadius: 10, padding: "9px 14px", fontWeight: 500, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center" },

  tabsScroll: { overflowX: "auto", borderBottom: "1px solid #E1E8F0" },
  tabsRow: { display: "flex", gap: 24, minWidth: "max-content" },
  tab: { position: "relative", display: "flex", alignItems: "center", gap: 8, padding: "12px 2px 14px", fontSize: 13.5, fontWeight: 500, color: "#6B7280", cursor: "pointer", whiteSpace: "nowrap" },
  tabActive: { color: "#0A6BCF", fontWeight: 600 },
  tabCount: { fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "#EEF3F8", color: "#6B7280", fontWeight: 600 },
  tabCountTone: (t) => {
    if (t === "warn") return { background: "#FEF3DC", color: "#B45309" };
    if (t === "ok")   return { background: "#E5F7EE", color: "#18A66A" };
    if (t === "err")  return { background: "#FCE9E9", color: "#DC2626" };
    if (t === "info") return { background: "#E0F6FF", color: "#0884B0" };
    if (t === "blue") return { background: "rgba(10,107,207,0.12)", color: "#0A6BCF" };
    return { background: "#EEF3F8", color: "#6B7280" };
  },
  tabUnderline: { position: "absolute", left: 0, right: 0, bottom: -1, height: 2, background: "#0A6BCF", borderRadius: 2 },

  filters: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "12px 16px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12 },
  inputWrap: { display: "flex", alignItems: "center", height: 36, background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 8 },
  input: { flex: 1, border: "none", outline: "none", background: "transparent", padding: "0 12px", fontSize: 13, color: "#0E2C56", height: "100%" },
  selectWrap: { display: "flex", alignItems: "center", gap: 6, height: 36, padding: "0 12px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 8, cursor: "pointer" },

  liveStrip: { display: "flex", alignItems: "center", gap: 14, padding: "10px 16px", background: "linear-gradient(135deg, rgba(10,107,207,0.06), rgba(24,193,255,0.06))", border: "1px solid rgba(10,107,207,0.18)", borderRadius: 12 },
  liveDot: { width: 8, height: 8, borderRadius: "50%", background: "#18A66A", boxShadow: "0 0 0 4px rgba(24,166,106,0.18)" },

  tableCard: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, overflow: "hidden" },
  th: { textAlign: "left", padding: "12px 14px", fontSize: 11, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", borderBottom: "1px solid #E1E8F0" },
  tr: { borderBottom: "1px solid #F0F4F9", height: 60 },
  td: { padding: "8px 14px", fontSize: 13, color: "#0E2C56", verticalAlign: "middle" },
  av: { width: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 10.5, flexShrink: 0 },
  badge: { display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 9px", borderRadius: 999, fontSize: 11.5, fontWeight: 600 },
  extrasPill: { marginLeft: 6, fontSize: 10, color: "#0884B0", background: "#E0F6FF", padding: "1px 5px", borderRadius: 4, fontFamily: "'Inter', sans-serif", fontWeight: 600 },
  kebab: { background: "transparent", border: "1px solid transparent", borderRadius: 8, padding: 5, cursor: "pointer", display: "grid", placeItems: "center" },

  tableFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderTop: "1px solid #E1E8F0" },
  pageBtn: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 8, padding: "6px 11px", fontSize: 13, fontWeight: 500, color: "#0E2C56", cursor: "pointer", minWidth: 32, height: 30, display: "inline-grid", placeItems: "center" },
  pageBtnActive: { background: "#0A6BCF", color: "#FFFFFF", borderColor: "#0A6BCF" },
};

Object.assign(window, { ServicesList });
