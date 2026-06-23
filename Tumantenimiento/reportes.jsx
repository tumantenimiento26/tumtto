/* global React, ReactDOM, AdminIc, AdminSidebar, AdminHeader,
   REPORT_TABS, NORTH_STAR, GMV_MONTHLY, SVC_MONTHLY, FUNNEL,
   TOP_TECHS_FULL, AT_RISK, RATING_DIST, TOP_COLONIAS, COLD_ZONES */
const Ic = AdminIc;

// ============================================================
// COMMON
// ============================================================
function PageHead({ active }) {
  return (
    <>
      <div style={r.pageHead}>
        <div>
          <h1 style={r.h1}>Reportes y Analytics</h1>
          <p style={r.sub}>Insights de negocio, adquisición, retención y desempeño.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={r.dateChip}>
            <Ic name="calendar-range" size={14} color="#0A6BCF" />
            <span style={{ fontSize: 12.5, color: "#0E2C56", fontWeight: 500 }}>01/12/2025 – 19/05/2026</span>
            <Ic name="chevron-down" size={13} color="#9CA3AF" />
          </div>
          <button style={r.btnGhost}><Ic name="link-2" size={14} color="#0E2C56" style={{ marginRight: 8 }} />Compartir link</button>
          <button style={r.btnSecondary}><Ic name="download" size={14} color="#0A6BCF" style={{ marginRight: 8 }} />Exportar PDF</button>
        </div>
      </div>

      <div style={r.tabsRow}>
        {REPORT_TABS.map((t) => {
          const isActive = t.id === active;
          return (
            <div key={t.id} style={{ ...r.tab, ...(isActive ? r.tabActive : null) }}>
              <span>{t.label}</span>
              {isActive && <span style={r.tabUnderline} />}
            </div>
          );
        })}
      </div>
    </>
  );
}

function Card({ title, sub, head, children }) {
  return (
    <div style={r.card}>
      {(title || head) && (
        <div style={r.cardHead}>
          <div>
            {title && <div style={r.cardTitle}>{title}</div>}
            {sub && <div style={r.cardSub}>{sub}</div>}
          </div>
          {head}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}

// ============================================================
// TAB 1 — OVERVIEW
// ============================================================
function Overview() {
  return (
    <div style={r.body}>
      {/* North Star grid */}
      <div>
        <div style={r.sectionLabel}>NORTH STAR · 6 KPIs DEL MVP · DICIEMBRE 2025 – MAYO 2026</div>
        <div style={r.northGrid}>
          {NORTH_STAR.map((k, i) => <NorthCard key={i} k={k} />)}
        </div>
      </div>

      {/* Two charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card
          title="GMV mensual · últimos 6 meses"
          sub="Crecimiento sostenido del 59% (Dic → May)"
          head={<span style={r.deltaPill}><Ic name="trending-up" size={11} color="#18A66A" />+18% MoM</span>}
        >
          <GmvAreaChart />
        </Card>

        <Card
          title="Servicios completados vs cancelados"
          sub="Tasa de cancelación estable en 9-10%"
          head={
            <div style={{ display: "flex", gap: 10, fontSize: 11.5 }}>
              <Legend dot="#0A6BCF" label="Completados" />
              <Legend dot="#FCE9E9" label="Cancelados" muted />
            </div>
          }
        >
          <StackBars />
        </Card>
      </div>

      {/* Funnel */}
      <Card
        title="Funnel de conversión"
        sub="Desde visita hasta cliente recurrente · últimos 90 días"
        head={
          <div style={{ display: "flex", gap: 8 }}>
            <span style={r.chipSel}>Cohorte completa</span>
            <span style={r.chipBtn}>Por región</span>
            <span style={r.chipBtn}>Por canal</span>
          </div>
        }
      >
        <Funnel />
      </Card>
    </div>
  );
}

function NorthCard({ k }) {
  const toneStyle = k.tone === "ok"   ? { color: "#18A66A", bg: "#E5F7EE", border: "rgba(24,166,106,0.25)" }
                  : k.tone === "warn" ? { color: "#B45309", bg: "#FEF3DC", border: "rgba(245,158,11,0.25)" }
                  : { color: "#DC2626", bg: "#FCE9E9", border: "rgba(220,38,38,0.25)" };
  const fillColor = k.tone === "ok" ? "#18A66A" : k.tone === "warn" ? "#F59E0B" : "#DC2626";

  return (
    <div style={r.nCard}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ ...r.nIcon, background: `${toneStyle.color}1A` }}>
          <Ic name={k.icon} size={14} color={toneStyle.color} />
        </div>
        {k.binary ? (
          <span style={{ ...r.nMeta, background: toneStyle.bg, color: toneStyle.color, border: `1px solid ${toneStyle.border}` }}>
            <Ic name={k.tone === "ok" ? "check" : "alert-triangle"} size={11} color={toneStyle.color} />
            Cumple
          </span>
        ) : (
          <span style={{ ...r.nMeta, background: toneStyle.bg, color: toneStyle.color, border: `1px solid ${toneStyle.border}` }}>
            {k.pct.toFixed(1)}%
          </span>
        )}
      </div>
      <div style={{ marginTop: 14 }}>
        <div style={r.nLabel}>{k.label}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
          <span style={r.nVal}>{k.value}</span>
          {k.suffix && <span style={r.nSuffix}>{k.suffix}</span>}
        </div>
        <div style={r.nGoal}>
          <span>Meta:</span>
          <b style={{ color: "#0E2C56", fontWeight: 600 }}>{k.goal}</b>
        </div>
      </div>
      {!k.binary && (
        <div style={r.nTrack}>
          <div style={{ ...r.nFill, width: `${Math.min(k.pct, 100)}%`, background: fillColor }} />
        </div>
      )}
    </div>
  );
}

// GMV area chart
function GmvAreaChart() {
  const max = Math.max(...GMV_MONTHLY.map((g) => g.v));
  const w = 460, h = 200;
  const pts = GMV_MONTHLY.map((g, i) => {
    const x = (i / (GMV_MONTHLY.length - 1)) * w;
    const y = h - (g.v / max) * (h - 30);
    return [x, y];
  });
  const pathD = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const areaD = `${pathD} L ${w} ${h} L 0 ${h} Z`;
  return (
    <div style={{ marginTop: 6 }}>
      <svg viewBox={`0 0 ${w} ${h + 30}`} width="100%" height={h + 30} style={{ display: "block" }}>
        <defs>
          <linearGradient id="gmvGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"  stopColor="#0A6BCF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0A6BCF" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
          <line key={i} x1="0" x2={w} y1={h - p * (h - 30)} y2={h - p * (h - 30)} stroke="#EEF3F8" strokeWidth="1" />
        ))}
        <path d={areaD} fill="url(#gmvGrad)" />
        <path d={pathD} fill="none" stroke="#0A6BCF" strokeWidth="2.5" />
        {pts.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="5" fill="#FFFFFF" stroke="#0A6BCF" strokeWidth="2.5" />
            {i === pts.length - 1 && (
              <g>
                <rect x={x - 32} y={y - 28} width="64" height="20" rx="4" fill="#0E2C56" />
                <text x={x} y={y - 13} textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono" fontWeight="600" fill="#FFFFFF">$498K</text>
              </g>
            )}
          </g>
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, color: "#6B7280", fontFamily: "'JetBrains Mono', monospace" }}>
        {GMV_MONTHLY.map((g) => <span key={g.m}>{g.m}</span>)}
      </div>
    </div>
  );
}

// Stacked bars
function StackBars() {
  const max = Math.max(...SVC_MONTHLY.map((s) => s.done + s.cancel));
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 24, height: 200 }}>
        {SVC_MONTHLY.map((s, i) => {
          const total = s.done + s.cancel;
          const ph = (total / max) * 100;
          const doneH = (s.done / total) * 100;
          const cancelH = (s.cancel / total) * 100;
          return (
            <div key={i} style={{ flex: 1, height: `${ph}%`, display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative" }}>
              <div style={{ height: `${cancelH}%`, background: "#FCE9E9", borderRadius: "0 0 4px 4px" }} />
              <div style={{ height: `${doneH}%`, background: "linear-gradient(180deg, #0A6BCF, #0894EA)", borderRadius: "6px 6px 0 0" }} />
              <div style={{ position: "absolute", top: -22, left: 0, right: 0, textAlign: "center", fontSize: 11, color: "#0E2C56", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                {total}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-around", marginTop: 6, fontSize: 11, color: "#6B7280", fontFamily: "'JetBrains Mono', monospace" }}>
        {SVC_MONTHLY.map((s) => <span key={s.m}>{s.m}</span>)}
      </div>
    </div>
  );
}

function Funnel() {
  const max = FUNNEL[0].value;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
      {FUNNEL.map((f, i) => {
        const widthPct = (f.value / max) * 100;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 200, fontSize: 13, color: "#0E2C56", fontWeight: 500 }}>{f.label}</div>
            <div style={{ flex: 1, position: "relative", height: 38, background: "#F8FBFF", borderRadius: 8, overflow: "hidden", border: "1px solid #E1E8F0" }}>
              <div style={{
                width: `${widthPct}%`,
                height: "100%",
                background: i === FUNNEL.length - 1
                  ? "linear-gradient(90deg, #0E2C56, #0A6BCF)"
                  : "linear-gradient(90deg, #0A6BCF, #18C1FF)",
                display: "flex", alignItems: "center", justifyContent: "flex-end",
                paddingRight: 14,
              }}>
                <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 14, color: "#FFFFFF" }}>
                  {f.value.toLocaleString("es-MX")}
                </span>
              </div>
            </div>
            <div style={{ width: 140, display: "flex", justifyContent: "flex-end", gap: 8 }}>
              {f.drop != null && (
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  padding: "3px 9px", borderRadius: 999,
                  background: i === 1 ? "#FCE9E9" : i === 2 ? "#FEF3DC" : i === 3 ? "#E5F7EE" : "#FEF3DC",
                  color: i === 1 ? "#DC2626" : i === 2 ? "#B45309" : i === 3 ? "#18A66A" : "#B45309",
                  display: "inline-flex", alignItems: "center", gap: 4,
                }}>
                  <Ic name={i === 3 ? "arrow-down" : "arrow-down"} size={10} color={i === 1 ? "#DC2626" : i === 2 ? "#B45309" : i === 3 ? "#18A66A" : "#B45309"} />
                  {f.drop}%
                </span>
              )}
            </div>
          </div>
        );
      })}
      <div style={{ marginTop: 10, padding: 14, background: "#FBFDFF", border: "1px dashed #E1E8F0", borderRadius: 10, display: "flex", alignItems: "center", gap: 12, fontSize: 12.5, color: "#6B7280" }}>
        <Ic name="lightbulb" size={16} color="#F59E0B" />
        <span>
          <b style={{ color: "#0E2C56", fontWeight: 600 }}>Mayor caída en "Registros → Primera solicitud" (35% retención).</b>
          {" "}Oportunidad: campaña de onboarding con $100 MXN de descuento para servicios iniciales.
        </span>
      </div>
    </div>
  );
}

// ============================================================
// TAB 3 — TÉCNICOS
// ============================================================
function TechsPerf() {
  return (
    <div style={r.body}>
      {/* Top 20 */}
      <Card
        title="Top 10 técnicos por GMV · este mes"
        sub="Ordenados por ingresos brutos generados · ZMG"
        head={
          <div style={{ display: "flex", gap: 8 }}>
            <span style={r.chipSel}>Mes actual</span>
            <span style={r.chipBtn}>Trimestre</span>
            <button style={r.btnGhost}><Ic name="download" size={12} color="#0E2C56" style={{ marginRight: 6 }} />CSV</button>
          </div>
        }
      >
        <div style={r.tableWrap}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FBFF" }}>
                <th style={{ ...r.th, width: 36, paddingLeft: 14 }}>#</th>
                <th style={r.th}>Técnico</th>
                <th style={r.th}>Región</th>
                <th style={r.th}>Categoría</th>
                <th style={{ ...r.th, textAlign: "right" }}>Servicios</th>
                <th style={{ ...r.th, textAlign: "right" }}>Rating</th>
                <th style={{ ...r.th, textAlign: "right" }}>GMV</th>
                <th style={{ ...r.th, textAlign: "right" }}>Comisión</th>
                <th style={{ ...r.th, textAlign: "right" }}>Aceptación</th>
                <th style={{ ...r.th, textAlign: "right" }}>Cancelación</th>
              </tr>
            </thead>
            <tbody>
              {TOP_TECHS_FULL.map((t, i) => (
                <tr key={i} style={r.tr}>
                  <td style={{ ...r.td, paddingLeft: 14 }}>
                    <span style={{ ...r.rank, ...(i < 3 ? r.rankTop : null) }}>{i + 1}</span>
                  </td>
                  <td style={r.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={r.av}>{t.initials}</div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#0E2C56" }}>{t.name}</span>
                    </div>
                  </td>
                  <td style={{ ...r.td, fontSize: 12.5, color: "#6B7280" }}>{t.region}</td>
                  <td style={{ ...r.td, fontSize: 12.5, color: "#0E2C56" }}>{t.cat}</td>
                  <td style={{ ...r.td, textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: "#0E2C56", fontWeight: 500 }}>{t.jobs}</td>
                  <td style={{ ...r.td, textAlign: "right" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                      <Ic name="star" size={11} color="#F59E0B" />
                      <b style={{ color: "#0E2C56", fontWeight: 600, fontSize: 12.5 }}>{t.rating.toFixed(2)}</b>
                    </span>
                  </td>
                  <td style={{ ...r.td, textAlign: "right", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 13, color: "#0E2C56" }}>{t.gmv}</td>
                  <td style={{ ...r.td, textAlign: "right", fontSize: 12, color: "#6B7280", fontFamily: "'JetBrains Mono', monospace" }}>{t.commission}</td>
                  <td style={{ ...r.td, textAlign: "right" }}>
                    <span style={{ fontSize: 12, color: t.accept >= 90 ? "#18A66A" : "#B45309", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{t.accept}%</span>
                  </td>
                  <td style={{ ...r.td, textAlign: "right" }}>
                    <span style={{ fontSize: 12, color: t.cancel < 5 ? "#18A66A" : "#B45309", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{t.cancel}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bottom row: risk + distribution */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        <Card
          title="Técnicos en riesgo"
          sub="Requieren intervención de operaciones · 3 detectados"
          head={
            <span style={{ ...r.deltaPill, color: "#DC2626", background: "#FCE9E9" }}>
              <Ic name="alert-triangle" size={11} color="#DC2626" />Acción requerida
            </span>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {AT_RISK.map((t, i) => (
              <div key={i} style={r.riskRow}>
                <div style={{ ...r.av, background: "rgba(220,38,38,0.10)", color: "#DC2626" }}>{t.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#0E2C56" }}>{t.name}</span>
                    <span style={{ fontSize: 11, color: "#9CA3AF" }}>· {t.region}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                    {t.reasons.map((reason, j) => (
                      <span key={j} style={r.reasonChip}>{reason}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 14, fontSize: 11, color: "#6B7280" }}>
                    <span><Ic name="star" size={10} color="#F59E0B" style={{ marginRight: 3 }} />Rating <b style={{ color: "#DC2626", fontWeight: 600 }}>{t.rating}</b></span>
                    <span>Aceptación <b style={{ color: "#DC2626", fontWeight: 600 }}>{t.accept}%</b></span>
                    <span>Cancelación <b style={{ color: "#DC2626", fontWeight: 600 }}>{t.cancel}%</b></span>
                  </div>
                </div>
                <button style={r.smBtn}>Revisar</button>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Distribución de ratings" sub="Reseñas históricas · 2,005 calificaciones">
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
            {RATING_DIST.map((d) => (
              <div key={d.stars} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 3, width: 38 }}>
                  <Ic name="star" size={12} color="#F59E0B" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0E2C56" }}>{d.stars}</span>
                </div>
                <div style={{ flex: 1, height: 14, background: "#EEF3F8", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${d.pct}%`, height: "100%", background: d.stars >= 4 ? "#F59E0B" : d.stars === 3 ? "#9CA3AF" : "#DC2626", borderRadius: 4 }} />
                </div>
                <div style={{ width: 90, textAlign: "right", fontSize: 12, color: "#0E2C56", fontFamily: "'JetBrains Mono', monospace" }}>
                  <b style={{ color: "#0E2C56", fontWeight: 600 }}>{d.n.toLocaleString("es-MX")}</b>
                  <span style={{ color: "#9CA3AF", marginLeft: 5 }}>{d.pct}%</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: "12px 14px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <Ic name="trending-up" size={14} color="#18A66A" />
            <span style={{ fontSize: 12, color: "#6B7280" }}>
              <b style={{ color: "#0E2C56", fontWeight: 600 }}>89% de reseñas con 4★ o más.</b> Tendencia positiva sostenida vs. mes anterior.
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// TAB 5 — GEO
// ============================================================
function Geo() {
  return (
    <div style={r.body}>
      {/* Top stats strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <GeoStat icon="map-pin" label="Colonias activas" value="758" delta="+24 este mes" tone="ok" />
        <GeoStat icon="hard-hat" label="Cobertura técnica" value="86%" delta="al menos 1 técnico" />
        <GeoStat icon="trending-up" label="Demanda total · mes" value="2,847" delta="+18% vs ayer" tone="ok" />
        <GeoStat icon="alert-triangle" label="Zonas frías detectadas" value="3" delta="alta demanda · poca oferta" tone="warn" />
      </div>

      {/* Map + top colonias */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
        <Card title="Mapa de calor · demanda por colonia"
          sub="ZMG · últimos 30 días · 758 colonias activas"
          head={
            <div style={{ display: "flex", gap: 6 }}>
              <span style={r.chipSel}>Demanda</span>
              <span style={r.chipBtn}>Oferta</span>
              <span style={r.chipBtn}>Ratio</span>
            </div>
          }
        >
          <HeatMap />
          <div style={r.heatLegend}>
            <span style={{ fontSize: 11.5, color: "#6B7280" }}>Demanda baja</span>
            <div style={{ flex: 1, height: 10, borderRadius: 4, background: "linear-gradient(90deg, #DDE7F1, #5CB7F0, #0A6BCF, #DC2626)" }} />
            <span style={{ fontSize: 11.5, color: "#6B7280" }}>Demanda alta</span>
          </div>
        </Card>

        <Card title="Top 10 colonias · GMV del mes" sub="$1,636,420 MXN concentrados aquí · 60% del total"
          head={<a href="#" style={r.linkSm}>Ver tabla completa <Ic name="arrow-right" size={11} color="#0A6BCF" /></a>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {TOP_COLONIAS.map((c, i) => (
              <div key={i} style={r.colRow}>
                <span style={{ ...r.rank, ...(i < 3 ? r.rankTop : null), width: 22, height: 22, fontSize: 11 }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0E2C56" }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>{c.city} · {c.techs} técnicos · {c.demand} servicios</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0E2C56", fontFamily: "'Manrope', sans-serif" }}>{c.gmv}</div>
                  <div style={{ fontSize: 10, color: c.coverage === 100 ? "#18A66A" : "#B45309", marginTop: 1, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>cob. {c.coverage}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Cold zones */}
      <Card title="Zonas frías · alta demanda con baja oferta"
        sub="Oportunidades de expansión · 3 zonas requieren más técnicos"
        head={
          <span style={{ ...r.deltaPill, color: "#B45309", background: "#FEF3DC" }}>
            <Ic name="snowflake" size={11} color="#B45309" />Expandir red
          </span>
        }>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {COLD_ZONES.map((z, i) => (
            <div key={i} style={r.coldZone}>
              <div style={r.coldHeader}>
                <Ic name="alert-triangle" size={16} color="#B45309" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0E2C56" }}>{z.name}</div>
                  <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{z.city}</div>
                </div>
                <span style={r.ratioBadge}>{z.ratio}</span>
              </div>
              <p style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.45, margin: "10px 0" }}>{z.note}</p>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", borderTop: "1px solid rgba(245,158,11,0.18)" }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#0E2C56", fontFamily: "'Manrope', sans-serif", lineHeight: 1 }}>{z.demand}</div>
                  <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 4 }}>servicios solicitados</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#DC2626", fontFamily: "'Manrope', sans-serif", lineHeight: 1 }}>{z.techs}</div>
                  <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 4 }}>técnicos activos</div>
                </div>
              </div>
              <button style={{ ...r.smBtn, width: "100%", marginTop: 14, justifyContent: "center" }}>
                <Ic name="user-plus" size={12} color="#0A6BCF" style={{ marginRight: 6 }} />
                Lanzar reclutamiento
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function GeoStat({ icon, label, value, delta, tone }) {
  const toneStyle = tone === "ok" ? { color: "#18A66A", bg: "#E5F7EE" }
                  : tone === "warn" ? { color: "#B45309", bg: "#FEF3DC" }
                  : null;
  return (
    <div style={r.geoStat}>
      <div style={{ ...r.nIcon, background: "rgba(10,107,207,0.10)" }}>
        <Ic name={icon} size={14} color="#0A6BCF" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={r.nLabel}>{label}</div>
        <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 26, color: "#0E2C56", letterSpacing: "-0.01em", marginTop: 4 }}>{value}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
          {toneStyle && (
            <span style={{ ...r.deltaPill, color: toneStyle.color, background: toneStyle.bg }}>
              <Ic name={tone === "ok" ? "trending-up" : "alert-triangle"} size={10} color={toneStyle.color} />
            </span>
          )}
          <span style={{ fontSize: 11.5, color: "#6B7280" }}>{delta}</span>
        </div>
      </div>
    </div>
  );
}

// Hex grid heatmap of ZMG colonias
function HeatMap() {
  // Generate a hex grid; assign demand value based on rough city zone
  const rows = 10, cols = 16;
  const hexW = 32, hexH = 36;
  const horiz = hexW * 0.86;
  const vert = hexH * 0.78;

  // Random-but-stable density distribution
  function densityFor(row, col) {
    const cx = cols / 2, cy = rows / 2;
    const dx = (col - cx) / cols;
    const dy = (row - cy) / rows;
    const dist = Math.sqrt(dx * dx + dy * dy);
    // peaks: Providencia center, Andares NW, cold spots SE
    const peakA = 1 - Math.sqrt((col - 7) ** 2 + (row - 4) ** 2) / 8;  // gdl center
    const peakB = 1 - Math.sqrt((col - 3) ** 2 + (row - 3) ** 2) / 7;  // zapopan
    const cold  = Math.sqrt((col - 13) ** 2 + (row - 8) ** 2) / 14;     // SE cold zone
    const v = Math.max(0, Math.max(peakA, peakB) * 0.85 + (1 - dist) * 0.15 - cold * 0.4);
    return Math.min(1, Math.max(0, v));
  }

  function colorFor(v) {
    if (v < 0.15) return "#DDE7F1";
    if (v < 0.35) return "#B2CCE3";
    if (v < 0.55) return "#5CB7F0";
    if (v < 0.75) return "#0A6BCF";
    return "#0E2C56";
  }

  const cells = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * horiz + (row % 2) * (horiz / 2);
      const y = row * vert;
      cells.push({ x, y, v: densityFor(row, col) });
    }
  }

  // Some labelled neighborhoods
  const labels = [
    { x: 100, y: 110, name: "Andares",       v: 0.85 },
    { x: 240, y: 145, name: "Providencia",   v: 0.95 },
    { x: 180, y: 175, name: "Country Club",  v: 0.80 },
    { x: 380, y: 210, name: "Las Águilas",   v: 0.55 },
    { x: 430, y: 280, name: "Tlajomulco",    v: 0.15 },
  ];

  return (
    <div style={{ position: "relative", marginTop: 8 }}>
      <svg viewBox="0 0 560 360" width="100%" height={360} style={{ display: "block", background: "#F8FBFF", borderRadius: 12, border: "1px solid #E1E8F0" }}>
        <defs>
          <pattern id="heatGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0 L0 0 0 40" fill="none" stroke="#EEF3F8" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="560" height="360" fill="url(#heatGrid)" />

        {cells.map((c, i) => (
          <Hex key={i} cx={c.x + 20} cy={c.y + 20} size={14} fill={colorFor(c.v)} stroke="#FFFFFF" />
        ))}

        {labels.map((l, i) => (
          <g key={i} transform={`translate(${l.x},${l.y})`}>
            <circle r="3" fill="#FFFFFF" stroke="#0E2C56" strokeWidth="1.5" />
            <rect x="6" y="-9" width={l.name.length * 5.6 + 12} height="16" rx="3" fill="rgba(255,255,255,0.95)" stroke="#E1E8F0" strokeWidth="0.5" />
            <text x={6 + 6} y="2" fontSize="9.5" fontFamily="Inter" fontWeight="600" fill="#0E2C56">{l.name}</text>
          </g>
        ))}

        {/* Cold zone callout */}
        <g>
          <circle cx="470" cy="290" r="32" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 4" />
          <text x="470" y="332" textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono" fontWeight="600" fill="#B45309">zona fría</text>
        </g>
      </svg>
    </div>
  );
}

function Hex({ cx, cy, size, fill, stroke }) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    pts.push([cx + size * Math.cos(angle), cy + size * Math.sin(angle)]);
  }
  return <polygon points={pts.map(p => p.join(",")).join(" ")} fill={fill} stroke={stroke} strokeWidth="1" />;
}

function Legend({ dot, label, muted }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#6B7280" }}>
      <span style={{ width: 10, height: 10, borderRadius: 2, background: dot, ...(muted ? { opacity: 0.6 } : null) }} />
      <span>{label}</span>
    </div>
  );
}

// ============================================================
// COMPOSITION
// ============================================================
function Screen({ active }) {
  const heights = { overview: 1500, techs: 1500, geo: 1700 };
  return (
    <div style={{ display: "flex", width: 1440, height: heights[active] || 1400, background: "#F8FBFF", fontFamily: "'Inter', sans-serif" }}>
      <AdminSidebar active="reports" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AdminHeader crumbs={["Inicio", "Reportes"]} />
        <main style={r.main}>
          <PageHead active={active} />
          {active === "overview" && <Overview />}
          {active === "techs" && <TechsPerf />}
          {active === "geo" && <Geo />}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="reports" title="Reportes y Analytics" subtitle="Overview · Técnicos · Geográfico">
        <DCArtboard id="overview" label="Tab 1 · Overview" width={1440} height={1500}>
          <Screen active="overview" />
        </DCArtboard>
        <DCArtboard id="techs" label="Tab 3 · Desempeño de técnicos" width={1440} height={1500}>
          <Screen active="techs" />
        </DCArtboard>
        <DCArtboard id="geo" label="Tab 5 · Análisis geográfico" width={1440} height={1700}>
          <Screen active="geo" />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// ============================================================
// STYLES
// ============================================================
const r = {
  main: { flex: 1, padding: "28px 32px 40px", display: "flex", flexDirection: "column", gap: 24, color: "#0E2C56" },
  pageHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  h1: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 28, margin: 0, letterSpacing: "-0.01em" },
  sub: { fontSize: 13.5, color: "#6B7280", margin: "4px 0 0" },
  btnSecondary: { background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #0A6BCF", borderRadius: 10, padding: "9px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  btnGhost: { background: "#FFFFFF", color: "#0E2C56", border: "1px solid #E1E8F0", borderRadius: 10, padding: "9px 14px", fontWeight: 500, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  dateChip: { display: "flex", alignItems: "center", gap: 8, height: 38, padding: "0 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10, cursor: "pointer" },

  tabsRow: { display: "flex", gap: 26, borderBottom: "1px solid #E1E8F0" },
  tab: { position: "relative", display: "flex", alignItems: "center", padding: "10px 2px 14px", fontSize: 13.5, fontWeight: 500, color: "#6B7280", cursor: "pointer" },
  tabActive: { color: "#0A6BCF", fontWeight: 600 },
  tabUnderline: { position: "absolute", left: 0, right: 0, bottom: -1, height: 2, background: "#0A6BCF", borderRadius: 2 },

  body: { display: "flex", flexDirection: "column", gap: 20 },
  sectionLabel: { fontSize: 10.5, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".1em", fontFamily: "'JetBrains Mono', monospace", marginBottom: 14 },

  /* North star */
  northGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 },
  nCard: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, padding: 20 },
  nIcon: { width: 32, height: 32, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0 },
  nMeta: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 999, fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  nLabel: { fontSize: 12, color: "#6B7280", fontWeight: 500 },
  nVal: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 32, color: "#0E2C56", letterSpacing: "-0.02em", lineHeight: 1 },
  nSuffix: { fontSize: 13, color: "#9CA3AF", fontWeight: 600 },
  nGoal: { display: "flex", gap: 4, fontSize: 11.5, color: "#6B7280", marginTop: 8 },
  nTrack: { height: 5, background: "#EEF3F8", borderRadius: 999, marginTop: 14, overflow: "hidden" },
  nFill: { height: "100%", borderRadius: 999 },

  /* Card */
  card: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, padding: 22 },
  cardHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: 600, color: "#0E2C56" },
  cardSub: { fontSize: 12.5, color: "#6B7280", marginTop: 3 },
  chipBtn: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 8, padding: "5px 10px", fontSize: 11.5, color: "#6B7280", fontWeight: 500, cursor: "pointer" },
  chipSel: { background: "rgba(10,107,207,0.08)", border: "1px solid rgba(10,107,207,0.3)", borderRadius: 8, padding: "5px 10px", fontSize: 11.5, color: "#0A6BCF", fontWeight: 600, cursor: "pointer" },
  linkSm: { display: "inline-flex", alignItems: "center", gap: 5, color: "#0A6BCF", textDecoration: "none", fontSize: 12.5, fontWeight: 500 },
  deltaPill: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, color: "#18A66A", background: "#E5F7EE" },

  /* Tables */
  tableWrap: { overflow: "hidden", border: "1px solid #E1E8F0", borderRadius: 10 },
  th: { textAlign: "left", padding: "10px 12px", fontSize: 10.5, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", borderBottom: "1px solid #E1E8F0", background: "#F8FBFF" },
  tr: { borderBottom: "1px solid #F0F4F9", height: 54 },
  td: { padding: "10px 12px", fontSize: 13, color: "#0E2C56", verticalAlign: "middle" },
  rank: { display: "inline-grid", placeItems: "center", width: 26, height: 26, borderRadius: 7, background: "#F8FBFF", color: "#6B7280", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 11.5 },
  rankTop: { background: "linear-gradient(135deg, #F59E0B, #B45309)", color: "#FFFFFF" },
  av: { width: 32, height: 32, borderRadius: "50%", background: "rgba(10,107,207,0.14)", color: "#0A6BCF", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 11.5, flexShrink: 0 },

  /* Risk */
  riskRow: { display: "flex", alignItems: "center", gap: 12, padding: "14px 14px", background: "#FBFDFF", border: "1px solid #E1E8F0", borderRadius: 10 },
  reasonChip: { display: "inline-flex", padding: "2px 8px", borderRadius: 999, background: "#FCE9E9", color: "#DC2626", fontSize: 10.5, fontWeight: 600 },
  smBtn: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#0A6BCF", cursor: "pointer", display: "inline-flex", alignItems: "center" },

  /* Geo */
  geoStat: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, padding: 18, display: "flex", gap: 14, alignItems: "flex-start" },
  heatLegend: { display: "flex", alignItems: "center", gap: 12, marginTop: 12 },
  colRow: { display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: "1px solid #F0F4F9" },
  coldZone: { background: "#FFFBED", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: 16 },
  coldHeader: { display: "flex", alignItems: "center", gap: 10 },
  ratioBadge: { display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 999, background: "#FCE9E9", color: "#DC2626", fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".02em" },
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
