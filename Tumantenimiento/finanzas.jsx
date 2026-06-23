/* global React, ReactDOM, AdminIc, AdminSidebar, AdminHeader,
   FIN_TABS, KPIS, MONTH_GMV, METHOD_SPLIT, TOP_TECHS,
   MP_KPIS, MP_ROWS, MP_STATUS, BANK_LOGOS, PAYOUT_ROWS */
const Ic = AdminIc;

// ============================================================
// COMMON
// ============================================================
function PageHead({ active }) {
  return (
    <>
      <div style={f.pageHead}>
        <div>
          <h1 style={f.h1}>Finanzas</h1>
          <p style={f.sub}>Conciliación de pagos, comisiones y retiros a técnicos.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={f.btnGhost}><Ic name="download" size={14} color="#0E2C56" style={{ marginRight: 8 }} />Exportar</button>
          <button style={f.btnGhost}><Ic name="settings" size={14} color="#0E2C56" style={{ marginRight: 8 }} />Configurar reglas</button>
        </div>
      </div>
      <div style={f.tabsRow}>
        {FIN_TABS.map((t) => {
          const isActive = t.id === active;
          return (
            <div key={t.id} style={{ ...f.tab, ...(isActive ? f.tabActive : null) }}>
              <span>{t.label}</span>
              {t.count != null && (
                <span style={{
                  ...f.tabCount,
                  ...(t.tone === "warn" ? { background: "#FEF3DC", color: "#B45309" } : null),
                  ...(t.tone === "err"  ? { background: "#FCE9E9", color: "#DC2626" } : null),
                }}>{t.count}</span>
              )}
              {isActive && <span style={f.tabUnderline} />}
            </div>
          );
        })}
      </div>
    </>
  );
}

function Card({ title, sub, head, children, padded = true }) {
  return (
    <div style={f.card}>
      {(title || head) && (
        <div style={{ ...f.cardHead, padding: padded ? "20px 22px 14px" : "20px 22px 0" }}>
          <div>
            {title && <div style={f.cardTitle}>{title}</div>}
            {sub && <div style={f.cardSub}>{sub}</div>}
          </div>
          {head}
        </div>
      )}
      <div style={{ padding: padded ? "0 22px 22px" : 0 }}>{children}</div>
    </div>
  );
}

// ============================================================
// TAB 1 — RESUMEN
// ============================================================
function Resumen() {
  return (
    <div style={f.body}>
      {/* KPIs */}
      <div style={f.kpiGrid}>
        {KPIS.map((k, i) => <KpiCard key={i} k={k} />)}
      </div>

      {/* GMV chart */}
      <Card
        title="GMV diario · últimos 30 días"
        sub={`Total: $2,847,320 MXN · promedio diario $94,910 MXN`}
        head={
          <div style={{ display: "flex", gap: 6 }}>
            <button style={f.chipBtnSel}>Mes actual</button>
            <button style={f.chipBtn}>Mes anterior</button>
            <button style={f.chipBtn}>6 meses</button>
          </div>
        }
      >
        <GmvChart />
        <div style={f.chartLegend}>
          <LegendDot color="#0A6BCF" label="Tarjeta"   amount="$1,420,000" />
          <LegendDot color="#B45309" label="OXXO Pay"  amount="$480,000" />
          <LegendDot color="#18C1FF" label="MP wallet" amount="$620,000" />
          <LegendDot color="#18A66A" label="Efectivo"  amount="$327,320" />
        </div>
      </Card>

      {/* Bottom row: donut + top techs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card title="Desglose por método · este mes" sub="Distribución de los $2.84M MXN">
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <Donut />
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {METHOD_SPLIT.map((m) => (
                <div key={m.method} style={f.splitRow}>
                  <div style={{ ...f.splitIcon, background: `${m.color}1F` }}>
                    <Ic name={m.icon} size={13} color={m.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#0E2C56", fontWeight: 500 }}>
                      <span>{m.method}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: "#6B7280" }}>{m.pct}%</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#0E2C56", fontWeight: 600, fontFamily: "'Manrope', sans-serif", marginTop: 2 }}>
                      ${m.amount}<span style={{ fontSize: 10.5, color: "#9CA3AF", fontWeight: 400, marginLeft: 3, fontFamily: "'Inter', sans-serif" }}> MXN</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Top 5 técnicos · este mes" sub="Por ingresos brutos generados"
          head={<a href="#" style={f.linkSm}>Ver tabla completa <Ic name="arrow-right" size={12} color="#0A6BCF" /></a>}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {TOP_TECHS.map((t, i) => (
                <tr key={i} style={f.topRow}>
                  <td style={{ ...f.topCell, width: 32 }}>
                    <span style={f.rank}>{i + 1}</span>
                  </td>
                  <td style={f.topCell}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ ...f.av, background: "rgba(10,107,207,0.14)", color: "#0A6BCF" }}>{t.initials}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0E2C56" }}>{t.name}</div>
                        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>{t.region} · {t.jobs} servicios</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...f.topCell, textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0E2C56", fontFamily: "'Manrope', sans-serif" }}>{t.gross}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>com. {t.commission}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ k }) {
  return (
    <div style={f.kpiCard}>
      <div style={f.kpiLabel}>{k.label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 12 }}>
        <span style={f.kpiVal}>{k.value}</span>
        {k.suffix && <span style={f.kpiSuffix}>{k.suffix}</span>}
      </div>
      <div style={f.kpiDeltaRow}>
        {k.tone === "ok" && (
          <span style={{ ...f.kpiDelta, color: "#18A66A", background: "#E5F7EE" }}>
            <Ic name="trending-up" size={11} color="#18A66A" />{k.delta}
          </span>
        )}
        {k.tone === "warn" && (
          <span style={{ ...f.kpiDelta, color: "#B45309", background: "#FEF3DC" }}>
            <Ic name="alert-triangle" size={11} color="#B45309" />{k.delta}
          </span>
        )}
        {k.tone === "err" && (
          <a href="#" style={{ ...f.kpiDelta, color: "#DC2626", background: "#FCE9E9", textDecoration: "none" }}>
            <Ic name="alert-circle" size={11} color="#DC2626" />{k.delta}
          </a>
        )}
        <span style={f.kpiNote}>{k.note}</span>
      </div>
    </div>
  );
}

// GMV stacked bars (30 days)
function GmvChart() {
  const max = Math.max(...MONTH_GMV);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 200 }}>
        {MONTH_GMV.map((v, i) => {
          const h = (v / max) * 100;
          // synthetic mix proportions per day
          const a = 0.5, b = 0.17, c = 0.22, d = 0.11;
          return (
            <div key={i} style={{ flex: 1, height: `${h}%`, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative" }}>
              <div style={{ width: "100%", height: `${a * 100}%`, background: "#0A6BCF" }} />
              <div style={{ width: "100%", height: `${b * 100}%`, background: "#B45309" }} />
              <div style={{ width: "100%", height: `${c * 100}%`, background: "#18C1FF" }} />
              <div style={{ width: "100%", height: `${d * 100}%`, background: "#18A66A" }} />
              {i === MONTH_GMV.length - 1 && (
                <div style={{
                  position: "absolute", top: -28, right: -10,
                  background: "#0E2C56", color: "#FFFFFF",
                  fontSize: 10.5, padding: "3px 7px", borderRadius: 5, fontWeight: 600,
                  whiteSpace: "nowrap", fontFamily: "'JetBrains Mono', monospace",
                }}>${v}K</div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>
        <span>20 abr</span><span>27 abr</span><span>4 may</span><span>11 may</span><span>19 may</span>
      </div>
    </div>
  );
}

function Donut() {
  const r = 60, c = 2 * Math.PI * r;
  let off = 0;
  return (
    <svg viewBox="0 0 160 160" width="160" height="160" style={{ flexShrink: 0 }}>
      <circle cx="80" cy="80" r={r} fill="none" stroke="#EEF3F8" strokeWidth="28" />
      {METHOD_SPLIT.map((m, i) => {
        const len = (m.pct / 100) * c;
        const el = (
          <circle key={i} cx="80" cy="80" r={r} fill="none" stroke={m.color} strokeWidth="28"
            strokeDasharray={`${len} ${c}`}
            strokeDashoffset={-off}
            transform="rotate(-90 80 80)" />
        );
        off += len;
        return el;
      })}
      <text x="80" y="76" textAnchor="middle" fontFamily="Manrope" fontWeight="700" fontSize="22" fill="#0E2C56">$2.84M</text>
      <text x="80" y="94" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="#6B7280">MXN · mes</text>
    </svg>
  );
}

function LegendDot({ color, label, amount }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#6B7280" }}>
      <span style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
      <span>{label}</span>
      <b style={{ color: "#0E2C56", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{amount}</b>
    </div>
  );
}

// ============================================================
// TAB 2 — CONCILIACIÓN MP
// ============================================================
function Conciliacion() {
  return (
    <div style={f.body}>
      {/* Header strip */}
      <div style={f.concilHead}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#0E2C56" }}>Conciliación con Mercado Pago</div>
          <div style={{ fontSize: 12.5, color: "#6B7280", marginTop: 3 }}>
            Última sincronización <b style={{ color: "#0E2C56", fontWeight: 600 }}>hace 4 min</b> · Periodo: 01/05/2026 – 19/05/2026
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={f.dateChip}>
            <Ic name="calendar-range" size={14} color="#0A6BCF" />
            <span>01/05/2026 – 19/05/2026</span>
            <Ic name="chevron-down" size={13} color="#9CA3AF" />
          </div>
          <button style={f.btnSecondary}><Ic name="refresh-cw" size={14} color="#0A6BCF" style={{ marginRight: 8 }} />Re-sincronizar con MP</button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {MP_KPIS.map((k, i) => (
          <div key={i} style={f.kpiSm}>
            <div style={f.kpiLabel}>{k.label}</div>
            <div style={{
              ...f.kpiVal,
              fontSize: 26,
              color: k.tone === "err" ? "#DC2626" : k.tone === "ok" ? "#18A66A" : "#0E2C56",
            }}>{k.value}</div>
            {k.tone === "err" && (
              <span style={{ ...f.kpiDelta, color: "#DC2626", background: "#FCE9E9", marginTop: 8 }}>
                <Ic name="alert-triangle" size={11} color="#DC2626" />Requiere revisión
              </span>
            )}
            {k.tone === "ok" && (
              <span style={{ ...f.kpiDelta, color: "#18A66A", background: "#E5F7EE", marginTop: 8 }}>
                <Ic name="check" size={11} color="#18A66A" />99.76% match
              </span>
            )}
            {!k.tone && (
              <div style={{ fontSize: 11.5, color: "#9CA3AF", marginTop: 8 }}>Monto bruto reportado por MP</div>
            )}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={f.filtersRow}>
        <div style={{ ...f.inputWrap, flex: 1, maxWidth: 280 }}>
          <Ic name="search" size={14} color="#9CA3AF" style={{ marginLeft: 12 }} />
          <input placeholder="ID interno o MP, cliente…" style={f.input} />
        </div>
        <FilterChip icon="filter" label="Estado: todos" />
        <FilterChip icon="credit-card" label="Método: todos" />
        <FilterChip icon="alert-triangle" label="Solo discrepancias" tone="warn" />
      </div>

      {/* Table */}
      <div style={f.tableCard}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FBFF" }}>
              <th style={f.th}>ID interno</th>
              <th style={f.th}>ID Mercado Pago</th>
              <th style={f.th}>Cliente</th>
              <th style={f.th}>Método</th>
              <th style={{ ...f.th, textAlign: "right" }}>Monto</th>
              <th style={{ ...f.th, textAlign: "right" }}>Comisión MP</th>
              <th style={f.th}>Conciliación</th>
              <th style={f.th}>Fecha</th>
              <th style={{ ...f.th, width: 100, textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {MP_ROWS.map((r, i) => {
              const s = MP_STATUS[r.status];
              return (
                <tr key={i} style={{ ...f.tr, ...(r.status !== "ok" ? { background: r.status === "err" ? "rgba(220,38,38,0.03)" : "rgba(245,158,11,0.03)" } : null) }}>
                  <td style={{ ...f.td, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>
                    <a href="#" style={{ color: "#0A6BCF", textDecoration: "none" }}>#{r.internal}</a>
                  </td>
                  <td style={{ ...f.td, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#6B7280" }}>{r.mp}</td>
                  <td style={{ ...f.td, fontSize: 13, color: "#0E2C56", fontWeight: 500 }}>{r.client}</td>
                  <td style={f.td}><MethodChip kind={r.method} /></td>
                  <td style={{ ...f.td, textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: "#0E2C56" }}>${r.amount}</td>
                  <td style={{ ...f.td, textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: "#6B7280" }}>${r.fee}</td>
                  <td style={f.td}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <span style={{ ...f.statusBadge, background: s.bg, color: s.fg }}>
                        <Ic name={s.icon} size={11} color={s.fg} />{s.label}
                      </span>
                      {r.note && <span style={{ fontSize: 11, color: r.status === "err" ? "#DC2626" : "#B45309" }}>{r.note}</span>}
                    </div>
                  </td>
                  <td style={{ ...f.td, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "#6B7280" }}>{r.date}</td>
                  <td style={{ ...f.td, textAlign: "right" }}>
                    {r.status === "ok" ? (
                      <button style={f.iconBtnSm}><Ic name="external-link" size={13} color="#6B7280" /></button>
                    ) : (
                      <button style={f.actBtn}><Ic name="refresh-cw" size={11} color="#0A6BCF" style={{ marginRight: 5 }} />Re-conciliar</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MethodChip({ kind }) {
  const meta = {
    card: { label: "Tarjeta", icon: "credit-card", color: "#0A6BCF" },
    oxxo: { label: "OXXO",    icon: "store",       color: "#B45309" },
    mp:   { label: "MP",      icon: "wallet",      color: "#0884B0" },
    cash: { label: "Efec.",   icon: "banknote",    color: "#18A66A" },
  }[kind];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 6, background: `${meta.color}14`, color: meta.color, fontSize: 11.5, fontWeight: 600 }}>
      <Ic name={meta.icon} size={12} color={meta.color} />
      {meta.label}
    </span>
  );
}

function FilterChip({ icon, label, tone }) {
  const toneStyle = tone === "warn" ? { background: "#FEF3DC", borderColor: "rgba(245,158,11,0.3)", color: "#B45309" } : null;
  return (
    <div style={{ ...f.dateChip, ...(toneStyle || {}) }}>
      <Ic name={icon} size={13} color={toneStyle ? "#B45309" : "#0A6BCF"} />
      <span>{label}</span>
      <Ic name="chevron-down" size={12} color="#9CA3AF" />
    </div>
  );
}

// ============================================================
// TAB 3 — PAYOUTS
// ============================================================
function Payouts({ showConfirm = false }) {
  return (
    <div style={{ ...f.body, position: "relative" }}>
      {/* Summary banner */}
      <div style={f.payoutBanner}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
          <div style={f.payoutBannerIcon}>
            <Ic name="hourglass" size={20} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", fontFamily: "'Manrope', sans-serif" }}>
              47 solicitudes de retiro pendientes
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 3 }}>
              Total a pagar: <b style={{ color: "#FFFFFF" }}>$187,420 MXN</b> · 42 con KYC verde · 5 con KYC en revisión
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={f.payoutBtnGhost}><Ic name="download" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />Exportar CSV bancario</button>
          <button style={f.payoutBtnPrimary}>
            <Ic name="zap" size={14} color="#0E2C56" style={{ marginRight: 8 }} />Procesar lote pendiente
          </button>
        </div>
      </div>

      {/* Sub tabs */}
      <div style={f.subTabs}>
        {[
          { id: "pending",   label: "Pendientes",        count: 47, tone: "warn", active: true },
          { id: "processing",label: "En proceso",        count: 12, tone: "blue" },
          { id: "done",      label: "Procesados 30 d",   count: 1247, tone: "ok" },
          { id: "rejected",  label: "Rechazados",        count: 3, tone: "err" },
        ].map((t) => (
          <div key={t.id} style={{ ...f.subTab, ...(t.active ? f.subTabActive : null) }}>
            <span>{t.label}</span>
            <span style={{ ...f.subTabCount, ...subTabTone(t.tone, t.active) }}>{t.count.toLocaleString("es-MX")}</span>
            {t.active && <span style={f.subTabUnderline} />}
          </div>
        ))}
      </div>

      {/* Bulk bar (with selection) */}
      <div style={f.bulkBar}>
        <Ic name="check-square" size={16} color="#0A6BCF" />
        <span style={{ fontSize: 13, color: "#0E2C56", fontWeight: 600 }}>
          3 retiros seleccionados · <b style={{ fontFamily: "'Manrope', sans-serif" }}>$27,820 MXN</b>
        </span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button style={f.bulkBtnGhost}><Ic name="x" size={12} color="#6B7280" style={{ marginRight: 5 }} />Limpiar</button>
          <button style={f.bulkBtnDanger}><Ic name="ban" size={12} color="#DC2626" style={{ marginRight: 5 }} />Rechazar (3)</button>
          <button style={f.bulkBtnPrimary}>
            <Ic name="check" size={12} color="#FFFFFF" style={{ marginRight: 5 }} />Aprobar (3) · $27,820 MXN
          </button>
        </span>
      </div>

      {/* Table */}
      <div style={f.tableCard}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FBFF" }}>
              <th style={{ ...f.th, width: 32, paddingLeft: 18 }}><input type="checkbox" style={f.checkbox} defaultChecked /></th>
              <th style={f.th}>Técnico · CLABE</th>
              <th style={f.th}>Banco</th>
              <th style={{ ...f.th, textAlign: "right" }}>Monto solicitado</th>
              <th style={{ ...f.th, textAlign: "right" }}>Saldo disponible</th>
              <th style={f.th}>Fecha solicitud</th>
              <th style={{ ...f.th, textAlign: "center" }}>KYC</th>
              <th style={{ ...f.th, width: 140 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {PAYOUT_ROWS.map((r, i) => {
              const bank = BANK_LOGOS[r.bank];
              return (
                <tr key={i} style={{ ...f.tr, ...(r.selected ? { background: "rgba(10,107,207,0.03)" } : null) }}>
                  <td style={{ ...f.td, paddingLeft: 18 }}>
                    <input type="checkbox" style={f.checkbox} defaultChecked={r.selected} />
                  </td>
                  <td style={f.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ ...f.av, background: "rgba(10,107,207,0.14)", color: "#0A6BCF" }}>{r.initials}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0E2C56" }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{r.clabe}</div>
                      </div>
                    </div>
                  </td>
                  <td style={f.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ ...f.bankLogo, background: bank.color }}>{bank.short}</div>
                      <span style={{ fontSize: 12.5, color: "#0E2C56" }}>{r.bank}</span>
                    </div>
                  </td>
                  <td style={{ ...f.td, textAlign: "right", fontFamily: "'Manrope', sans-serif", fontWeight: 700, color: "#0E2C56" }}>${r.amount}</td>
                  <td style={{ ...f.td, textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: "#6B7280" }}>${r.balance}</td>
                  <td style={{ ...f.td, fontSize: 12, color: "#6B7280" }}>{r.req}</td>
                  <td style={{ ...f.td, textAlign: "center" }}>
                    {r.kyc === "ok" ? (
                      <span style={{ ...f.statusBadge, background: "#E5F7EE", color: "#18A66A" }}>
                        <Ic name="badge-check" size={11} color="#18A66A" />Verde
                      </span>
                    ) : (
                      <span style={{ ...f.statusBadge, background: "#FEF3DC", color: "#B45309" }}>
                        <Ic name="alert-triangle" size={11} color="#B45309" />Revisión
                      </span>
                    )}
                  </td>
                  <td style={f.td}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={f.actBtnOk}><Ic name="check" size={11} color="#18A66A" style={{ marginRight: 4 }} />Aprobar</button>
                      <button style={f.actBtnGhost}><Ic name="x" size={11} color="#DC2626" /></button>
                      <button style={f.actBtnGhost}><Ic name="external-link" size={11} color="#6B7280" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={f.tableFooter}>
          <span style={{ fontSize: 12.5, color: "#6B7280" }}>
            Mostrando <b style={{ color: "#0E2C56", fontWeight: 600 }}>1 – 8</b> de <b style={{ color: "#0E2C56", fontWeight: 600 }}>47</b> pendientes
          </span>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>Ordenado por monto descendente</span>
        </div>
      </div>

      {showConfirm && <ConfirmLoteModal />}
    </div>
  );
}

function subTabTone(tone, active) {
  if (active) return { background: "rgba(10,107,207,0.12)", color: "#0A6BCF" };
  if (tone === "warn") return { background: "#FEF3DC", color: "#B45309" };
  if (tone === "ok")   return { background: "#E5F7EE", color: "#18A66A" };
  if (tone === "err")  return { background: "#FCE9E9", color: "#DC2626" };
  if (tone === "blue") return { background: "#E0F6FF", color: "#0884B0" };
  return {};
}

function ConfirmLoteModal() {
  return (
    <div style={f.scrim}>
      <div style={f.modal}>
        <div style={f.modalHead}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center" }}>
            <Ic name="zap" size={20} color="#0A6BCF" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#0E2C56" }}>Procesar lote de retiros</div>
            <div style={{ fontSize: 13, color: "#6B7280", marginTop: 3 }}>
              Revisa el resumen antes de confirmar. Esta acción genera SPEI inmediato a cada técnico.
            </div>
          </div>
          <button style={f.iconBtnSm}><Ic name="x" size={15} color="#6B7280" /></button>
        </div>

        <div style={f.modalBody}>
          <div style={f.summaryGrid}>
            <SummaryTile label="Retiros a procesar" value="42" sub="Solo KYC verde" />
            <SummaryTile label="Monto total" value="$184,720" suffix="MXN" sub="Sin contar pendientes" />
            <SummaryTile label="Comisión bancaria" value="$420" suffix="MXN" sub="$10 MXN por SPEI" />
            <SummaryTile label="Cargo a Tumantenimiento" value="$185,140" suffix="MXN" sub="Saldo cuenta operativa: $4.2M" tone="primary" />
          </div>

          <div style={f.warningBlock}>
            <Ic name="alert-triangle" size={16} color="#B45309" />
            <div>
              <b style={{ color: "#7B3E07", fontWeight: 600 }}>5 retiros quedarán fuera</b>
              <span style={{ color: "#6B7280" }}> por KYC en revisión. Apruébalos manualmente cuando el equipo de operaciones complete su verificación.</span>
            </div>
          </div>

          <div style={f.confirmCheck}>
            <input type="checkbox" style={{ ...f.checkbox, marginTop: 2 }} defaultChecked />
            <div>
              <div style={{ fontSize: 13.5, color: "#0E2C56", fontWeight: 500 }}>Entiendo que esto genera 42 transferencias SPEI no reversibles.</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 3 }}>Quedará registro en la bitácora de auditoría a nombre de Sofía Martínez (Admin Soporte).</div>
            </div>
          </div>
        </div>

        <div style={f.modalFoot}>
          <button style={f.btnGhost}>Cancelar</button>
          <button style={f.btnPrimary}><Ic name="check" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />Confirmar y procesar lote</button>
        </div>
      </div>
    </div>
  );
}

function SummaryTile({ label, value, suffix, sub, tone }) {
  return (
    <div style={{ ...f.summaryTile, ...(tone === "primary" ? { background: "linear-gradient(135deg, rgba(10,107,207,0.08), rgba(24,193,255,0.08))", borderColor: "rgba(10,107,207,0.25)" } : null) }}>
      <div style={f.kpiLabel}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
        <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 24, color: tone === "primary" ? "#0A6BCF" : "#0E2C56", letterSpacing: "-0.01em" }}>{value}</span>
        {suffix && <span style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>{suffix}</span>}
      </div>
      <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6 }}>{sub}</div>
    </div>
  );
}

// ============================================================
// COMPOSITION
// ============================================================
function Screen({ active, modal = false }) {
  const heights = {
    summary: 1200,
    concil:  1400,
    payouts: 1500,
  };
  return (
    <div style={{ display: "flex", width: 1440, height: heights[active] || 1200, background: "#F8FBFF", fontFamily: "'Inter', sans-serif", position: "relative" }}>
      <AdminSidebar active="finance" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AdminHeader crumbs={["Inicio", "Finanzas"]} />
        <main style={f.main}>
          <PageHead active={active} />
          {active === "summary" && <Resumen />}
          {active === "concil" && <Conciliacion />}
          {active === "payouts" && <Payouts showConfirm={modal} />}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="finance" title="Finanzas" subtitle="Resumen · Conciliación MP · Retiros · Modal lote">
        <DCArtboard id="summary" label="Tab 1 · Resumen" width={1440} height={1200}>
          <Screen active="summary" />
        </DCArtboard>
        <DCArtboard id="payouts" label="Tab 3 · Retiros a técnicos" width={1440} height={1500}>
          <Screen active="payouts" />
        </DCArtboard>
        <DCArtboard id="payouts-modal" label="Tab 3 · Modal procesar lote" width={1440} height={1500}>
          <Screen active="payouts" modal={true} />
        </DCArtboard>
        <DCArtboard id="concil" label="Tab 2 · Conciliación Mercado Pago" width={1440} height={1400}>
          <Screen active="concil" />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// ============================================================
// STYLES
// ============================================================
const f = {
  main: { flex: 1, padding: "28px 32px 40px", display: "flex", flexDirection: "column", gap: 24, color: "#0E2C56" },
  pageHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  h1: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 28, margin: 0, letterSpacing: "-0.01em" },
  sub: { fontSize: 13.5, color: "#6B7280", margin: "4px 0 0" },
  btnPrimary: { background: "#0A6BCF", color: "#FFFFFF", border: "1px solid #0A6BCF", borderRadius: 10, padding: "10px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", boxShadow: "0 1px 2px rgba(10,107,207,0.25)" },
  btnSecondary: { background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #0A6BCF", borderRadius: 10, padding: "9px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  btnGhost: { background: "#FFFFFF", color: "#0E2C56", border: "1px solid #E1E8F0", borderRadius: 10, padding: "10px 14px", fontWeight: 500, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center" },

  tabsRow: { display: "flex", gap: 26, borderBottom: "1px solid #E1E8F0", overflowX: "auto" },
  tab: { position: "relative", display: "flex", alignItems: "center", gap: 8, padding: "10px 2px 14px", fontSize: 13.5, fontWeight: 500, color: "#6B7280", cursor: "pointer", whiteSpace: "nowrap" },
  tabActive: { color: "#0A6BCF", fontWeight: 600 },
  tabCount: { fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "#EEF3F8", color: "#6B7280", fontWeight: 600 },
  tabUnderline: { position: "absolute", left: 0, right: 0, bottom: -1, height: 2, background: "#0A6BCF", borderRadius: 2 },

  body: { display: "flex", flexDirection: "column", gap: 20 },

  /* KPIs */
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 },
  kpiCard: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, padding: 22 },
  kpiSm: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, padding: 18 },
  kpiLabel: { fontSize: 12.5, color: "#6B7280", fontWeight: 500 },
  kpiVal: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 30, color: "#0E2C56", letterSpacing: "-0.02em", lineHeight: 1 },
  kpiSuffix: { fontSize: 12, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 },
  kpiDeltaRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 12 },
  kpiDelta: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 999, fontWeight: 600 },
  kpiNote: { color: "#9CA3AF", fontSize: 11.5 },

  /* Card */
  card: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16 },
  cardHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 },
  cardTitle: { fontSize: 15, fontWeight: 600, color: "#0E2C56" },
  cardSub: { fontSize: 12.5, color: "#6B7280", marginTop: 3 },
  chipBtn: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 8, padding: "5px 10px", fontSize: 11.5, color: "#6B7280", fontWeight: 500, cursor: "pointer" },
  chipBtnSel: { background: "rgba(10,107,207,0.08)", border: "1px solid rgba(10,107,207,0.3)", borderRadius: 8, padding: "5px 10px", fontSize: 11.5, color: "#0A6BCF", fontWeight: 600, cursor: "pointer" },
  linkSm: { display: "inline-flex", alignItems: "center", gap: 5, color: "#0A6BCF", textDecoration: "none", fontSize: 12.5, fontWeight: 500 },
  chartLegend: { display: "flex", flexWrap: "wrap", gap: 18, paddingTop: 18, borderTop: "1px solid #F0F4F9", marginTop: 14 },

  /* Split */
  splitRow: { display: "flex", alignItems: "center", gap: 10, padding: "6px 0" },
  splitIcon: { width: 28, height: 28, borderRadius: 7, display: "grid", placeItems: "center", flexShrink: 0 },

  /* Top techs */
  topRow: { borderBottom: "1px solid #F0F4F9" },
  topCell: { padding: "10px 0", verticalAlign: "middle" },
  rank: { display: "inline-grid", placeItems: "center", width: 24, height: 24, borderRadius: 6, background: "#F8FBFF", color: "#6B7280", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: 12 },
  av: { width: 32, height: 32, borderRadius: "50%", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 11.5, flexShrink: 0 },

  /* Filters */
  filtersRow: { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12, flexWrap: "wrap" },
  inputWrap: { display: "flex", alignItems: "center", height: 36, background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 8 },
  input: { flex: 1, border: "none", outline: "none", background: "transparent", padding: "0 12px", fontSize: 13, color: "#0E2C56", height: "100%" },
  dateChip: { display: "flex", alignItems: "center", gap: 6, height: 36, padding: "0 12px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 8, cursor: "pointer", fontSize: 12.5, color: "#0E2C56", fontWeight: 500 },

  /* Conciliación header */
  concilHead: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14 },

  /* Table */
  tableCard: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, overflow: "hidden" },
  th: { textAlign: "left", padding: "12px 14px", fontSize: 11, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", borderBottom: "1px solid #E1E8F0" },
  tr: { borderBottom: "1px solid #F0F4F9", height: 56 },
  td: { padding: "10px 14px", fontSize: 13, color: "#0E2C56", verticalAlign: "middle" },
  statusBadge: { display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600 },
  iconBtnSm: { background: "#FFFFFF", border: "1px solid #E1E8F0", padding: 6, borderRadius: 7, cursor: "pointer", display: "inline-grid", placeItems: "center" },
  actBtn: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 7, padding: "5px 10px", fontSize: 11.5, fontWeight: 500, color: "#0A6BCF", cursor: "pointer", display: "inline-flex", alignItems: "center" },
  actBtnOk: { background: "#E5F7EE", border: "1px solid rgba(24,166,106,0.3)", borderRadius: 7, padding: "5px 10px", fontSize: 11.5, fontWeight: 600, color: "#18A66A", cursor: "pointer", display: "inline-flex", alignItems: "center" },
  actBtnGhost: { background: "#FFFFFF", border: "1px solid #E1E8F0", padding: 6, borderRadius: 7, cursor: "pointer", display: "inline-grid", placeItems: "center" },
  tableFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderTop: "1px solid #E1E8F0" },
  checkbox: { width: 16, height: 16, accentColor: "#0A6BCF" },

  /* Payouts banner */
  payoutBanner: { display: "flex", alignItems: "center", gap: 16, padding: "18px 22px", background: "linear-gradient(135deg, #0E2C56, #0A6BCF)", borderRadius: 16, color: "#FFFFFF", boxShadow: "0 6px 16px rgba(10,107,207,0.18)" },
  payoutBannerIcon: { width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "grid", placeItems: "center" },
  payoutBtnPrimary: { background: "#18C1FF", color: "#0E2C56", border: "none", borderRadius: 10, padding: "10px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", boxShadow: "0 2px 8px rgba(24,193,255,0.3)" },
  payoutBtnGhost: { background: "rgba(255,255,255,0.10)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 10, padding: "10px 14px", fontWeight: 500, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center" },

  /* Sub tabs */
  subTabs: { display: "flex", gap: 20, borderBottom: "1px solid #E1E8F0" },
  subTab: { position: "relative", display: "flex", alignItems: "center", gap: 8, padding: "10px 2px 12px", fontSize: 13, fontWeight: 500, color: "#6B7280", cursor: "pointer" },
  subTabActive: { color: "#0A6BCF", fontWeight: 600 },
  subTabCount: { fontSize: 10.5, padding: "2px 7px", borderRadius: 999, background: "#EEF3F8", color: "#6B7280", fontWeight: 600 },
  subTabUnderline: { position: "absolute", left: 0, right: 0, bottom: -1, height: 2, background: "#0A6BCF", borderRadius: 2 },

  /* Bulk */
  bulkBar: { display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", background: "rgba(10,107,207,0.06)", border: "1px solid rgba(10,107,207,0.22)", borderRadius: 12 },
  bulkBtnPrimary: { background: "#0A6BCF", color: "#FFFFFF", border: "1px solid #0A6BCF", borderRadius: 8, padding: "7px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  bulkBtnDanger: { background: "#FFFFFF", color: "#DC2626", border: "1px solid #DC2626", borderRadius: 8, padding: "7px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  bulkBtnGhost: { background: "#FFFFFF", color: "#6B7280", border: "1px solid #E1E8F0", borderRadius: 8, padding: "7px 12px", fontSize: 12.5, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center" },

  /* Bank logo */
  bankLogo: { width: 32, height: 22, borderRadius: 4, display: "grid", placeItems: "center", color: "#FFFFFF", fontSize: 9, fontWeight: 700, letterSpacing: ".04em", fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 },

  /* Modal */
  scrim: { position: "absolute", inset: 0, background: "rgba(14,44,86,0.45)", backdropFilter: "blur(2px)", display: "grid", placeItems: "center", zIndex: 10 },
  modal: { width: 640, background: "#FFFFFF", borderRadius: 16, boxShadow: "0 24px 60px rgba(14,44,86,0.25)", overflow: "hidden" },
  modalHead: { display: "flex", alignItems: "flex-start", gap: 14, padding: "22px 24px 18px", borderBottom: "1px solid #F0F4F9" },
  modalBody: { padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 },
  summaryGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  summaryTile: { background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 12, padding: "16px 18px" },
  warningBlock: { display: "flex", gap: 12, padding: "14px 16px", background: "#FEF3DC", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 10, fontSize: 13, lineHeight: 1.45, alignItems: "flex-start" },
  confirmCheck: { display: "flex", gap: 12, padding: "14px 16px", background: "#FBFDFF", border: "1px solid #E1E8F0", borderRadius: 10, alignItems: "flex-start" },
  modalFoot: { display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px 20px", borderTop: "1px solid #F0F4F9" },
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
