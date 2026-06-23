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

const TONES = [
  "linear-gradient(135deg,#0A6BCF,#18C1FF)",
  "linear-gradient(135deg,#F59E0B,#FBBF24)",
  "linear-gradient(135deg,#18A66A,#4ED896)",
  "linear-gradient(135deg,#7C3AED,#A78BFA)",
  "linear-gradient(135deg,#B45309,#F59E0B)",
];

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
          <a href="UILibraryForms.html" style={l.heroVer}>← Sección 4 · Forms</a>
        </div>
        <div style={l.heroEyebrow}>SECCIÓN 05</div>
        <div style={l.heroTitle}>Data Display</div>
        <div style={l.heroSub}>
          Componentes para visualizar datos cuantitativos y secuenciales. Table (admin web), KPICard con sparkline, Timeline vertical, StatsRow compacto.
        </div>
        <div style={l.heroMetaRow}>
          <span style={l.heroChip}><Ic name="check" size={11} color="#4ED896" /><span>Primitives</span></span>
          <span style={l.heroChip}><Ic name="check" size={11} color="#4ED896" /><span>Containers</span></span>
          <span style={l.heroChip}><Ic name="check" size={11} color="#4ED896" /><span>Navigation</span></span>
          <span style={l.heroChip}><Ic name="check" size={11} color="#4ED896" /><span>Forms</span></span>
          <span style={l.heroChip}><Ic name="circle-dot" size={11} color="#FBBF24" /><span>Data Display · esta</span></span>
          <span style={l.heroChip}><Ic name="circle" size={11} color="rgba(255,255,255,0.45)" /><span>Domain · final</span></span>
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

function ComponentBlock({ id, name, codeName, badge, desc, mobileGrid, desktopGrid, props, tokens, notes, useCases }) {
  return (
    <div style={l.componentBlock} id={id}>
      <div style={l.componentTopRow}>
        <div>
          <div style={l.componentTitle}>
            <span>{name}</span>
            <span style={l.componentCodeName}>{codeName}</span>
            {badge && <span style={{ ...l.platformBadge, ...(badge.tone === "mobile" ? l.platformBadgeMobile : l.platformBadgeWeb) }}>{badge.label}</span>}
          </div>
          <div style={l.componentDesc}>{desc}</div>
        </div>
        <div style={l.componentLinks}>
          <span style={l.componentLink}><Ic name="link" size={11} color="#0A6BCF" /><span>copiar</span></span>
        </div>
      </div>
      <div style={l.componentGrid}>
        <div style={l.componentMain}>
          {mobileGrid && (
            <>
              <div style={l.platformRow}><div style={l.platformLabel}><Ic name="smartphone" size={12} color="#0A6BCF" /><span>MOBILE · 390 px</span><span style={l.platformImpl}>React Native</span></div></div>
              <div style={l.platformPanel}>{mobileGrid}</div>
            </>
          )}
          {desktopGrid && (
            <>
              <div style={l.platformRow}><div style={l.platformLabel}><Ic name="monitor" size={12} color="#0A6BCF" /><span>DESKTOP · 1440 px</span><span style={l.platformImpl}>Next.js + shadcn</span></div></div>
              <div style={l.platformPanel}>{desktopGrid}</div>
            </>
          )}
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
                  <div key={idx} style={l.tokenRow}><span style={l.tokenCat}>{t.cat}</span><span style={l.tokenVal}>{t.val}</span></div>
                ))}
              </div>
            </div>
          )}
          {notes && (
            <div>
              <div style={l.specSectionLabel}>NOTAS</div>
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
                  <div key={idx} style={l.useCaseRow}><div style={l.useCaseDot} /><span>{u}</span></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 5.1 TABLE
// =====================================================================
function Table() {
  const rows = [
    { id: "T-2841", initials: "MR", tone: 1, name: "María Rodríguez", role: "Cliente",   svc: "#SVC-2812", cat: "Plomería",     amount: 850,  status: "active",    date: "Hoy 14:48",   selected: true },
    { id: "T-2840", initials: "RH", tone: 0, name: "Ramón Hernández", role: "Técnico",   svc: "#SVC-2799", cat: "Drenaje",      amount: 600,  status: "review",    date: "Hoy 12:32" },
    { id: "T-2839", initials: "CM", tone: 4, name: "Carlos Mendoza",  role: "Cliente",   svc: "#SVC-2802", cat: "Plomería",     amount: 1200, status: "active",    date: "Hoy 09:12", selected: true },
    { id: "T-2837", initials: "LP", tone: 2, name: "Lupita Pérez",    role: "Cliente",   svc: "#KYC-1148", cat: "Verificación", amount: null, status: "rejected",  date: "Ayer 18:04" },
    { id: "T-2835", initials: "AG", tone: 3, name: "Adriana García",  role: "Técnico",   svc: "#SVC-2790", cat: "Electricidad", amount: 850,  status: "active",    date: "Ayer 16:48" },
    { id: "T-2832", initials: "JC", tone: 4, name: "José Carlos J.",  role: "Cliente",   svc: "#SVC-2785", cat: "Soporte",      amount: null, status: "resolved",  date: "Ayer 11:20" },
  ];
  return (
    <div style={t.tableWrap}>
      {/* Toolbar */}
      <div style={t.tableToolbar}>
        <div style={t.tableTitleRow}>
          <span style={t.tableTitle}>Disputas y tickets</span>
          <span style={t.tableCount}>1,148</span>
        </div>
        <div style={t.tableActions}>
          <div style={t.tableSearch}>
            <Ic name="search" size={12} color="#9CA3AF" />
            <span style={{ flex: 1, fontSize: 12, color: "#9CA3AF" }}>Buscar ID, usuario, servicio…</span>
            <span style={t.tableSearchK}>⌘ K</span>
          </div>
          <button style={t.tableBtnGhost}><Ic name="filter" size={12} color="#0A6BCF" /><span>Filtros</span><span style={t.tableBtnBadge}>3</span></button>
          <button style={t.tableBtnGhost}><Ic name="download" size={12} color="#0A6BCF" /><span>Exportar</span></button>
          <button style={t.tableBtnPrimary}><Ic name="plus" size={12} color="#FFFFFF" stroke={2.5} /><span>Crear ticket</span></button>
        </div>
      </div>

      {/* Bulk action bar (when selection > 0) */}
      <div style={t.bulkBar}>
        <Ic name="check-square" size={12} color="#0A6BCF" />
        <span style={{ flex: 1, fontSize: 11.5, color: "#0E2C56" }}><b style={{ fontWeight: 700 }}>2 seleccionados</b> · de 6 visibles</span>
        <button style={t.bulkBtn}><Ic name="user-cog" size={11} color="#0E2C56" /><span>Reasignar</span></button>
        <button style={t.bulkBtn}><Ic name="archive" size={11} color="#0E2C56" /><span>Archivar</span></button>
        <button style={{ ...t.bulkBtn, color: "#DC2626", borderColor: "rgba(220,38,38,0.30)" }}><Ic name="trash-2" size={11} color="#DC2626" /><span>Eliminar</span></button>
        <button style={t.bulkClose}><Ic name="x" size={11} color="#6B7280" /></button>
      </div>

      {/* Header */}
      <div style={t.row}>
        <div style={t.headerCellCheck}>
          <div style={{ ...t.cb, ...t.cbIndet }}>
            <div style={t.cbIndetDash} />
          </div>
        </div>
        <SortableHeader label="ID"        width={88} />
        <SortableHeader label="Usuario"   flex={2} active dir="desc" />
        <SortableHeader label="Servicio"  flex={1.4} />
        <SortableHeader label="Categoría" flex={1.2} />
        <SortableHeader label="Estado"    width={108} />
        <SortableHeader label="Monto"     width={84} align="right" />
        <SortableHeader label="Fecha"     width={110} />
        <div style={t.headerCellAction} />
      </div>

      {rows.map((r, idx) => <TableRow key={r.id} r={r} last={idx === rows.length - 1} />)}

      {/* Pagination */}
      <div style={t.pagination}>
        <span style={t.paginationCount}>Mostrando <b style={{ color: "#0E2C56", fontWeight: 700 }}>6</b> de 1,148</span>
        <div style={t.paginationCenter}>
          <button style={t.pageBtn}><Ic name="chevrons-left" size={11} color="#6B7280" /></button>
          <button style={t.pageBtn}><Ic name="chevron-left" size={11} color="#6B7280" /></button>
          {[1, 2, 3, 4, "...", 192].map((p, idx) => (
            <button key={idx} style={{ ...t.pageNum, ...(p === 1 ? t.pageNumActive : null) }}>{p}</button>
          ))}
          <button style={t.pageBtn}><Ic name="chevron-right" size={11} color="#6B7280" /></button>
          <button style={t.pageBtn}><Ic name="chevrons-right" size={11} color="#6B7280" /></button>
        </div>
        <div style={t.paginationRight}>
          <span style={t.paginationLabel}>Por página:</span>
          <div style={t.paginationSelect}>
            <span>10</span>
            <Ic name="chevron-down" size={10} color="#6B7280" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SortableHeader({ label, width, flex, align, active, dir }) {
  return (
    <div style={{ ...t.headerCell, width, flex, justifyContent: align === "right" ? "flex-end" : "flex-start", color: active ? "#0A6BCF" : "#6B7280" }}>
      <span>{label}</span>
      {active ? (
        <Ic name={dir === "desc" ? "chevron-down" : "chevron-up"} size={10} color="#0A6BCF" stroke={2.5} />
      ) : (
        <Ic name="chevrons-up-down" size={10} color="#9CA3AF" />
      )}
    </div>
  );
}

function TableRow({ r, last }) {
  const statusMap = {
    active:   { bg: "rgba(245,158,11,0.14)", color: "#B45309", label: "ACTIVO", dot: "#F59E0B" },
    review:   { bg: "rgba(10,107,207,0.10)", color: "#0A6BCF", label: "REVISIÓN", dot: "#0A6BCF" },
    resolved: { bg: "rgba(24,166,106,0.12)", color: "#0F8A56", label: "RESUELTO", dot: "#18A66A" },
    rejected: { bg: "rgba(220,38,38,0.10)",  color: "#DC2626", label: "RECHAZADO", dot: "#DC2626" },
  };
  const s = statusMap[r.status];
  return (
    <div style={{ ...t.row, ...t.rowBody, ...(r.selected ? t.rowSelected : null), ...(last ? null : t.rowBorder) }}>
      <div style={t.headerCellCheck}>
        <div style={{ ...t.cb, ...(r.selected ? t.cbOn : null) }}>
          {r.selected && <Ic name="check" size={9} color="#FFFFFF" stroke={3.5} />}
        </div>
      </div>
      <div style={{ ...t.cell, width: 88 }}>
        <span style={t.idMono}>{r.id}</span>
      </div>
      <div style={{ ...t.cell, flex: 2, gap: 10 }}>
        <div style={{ ...t.avMini, background: TONES[r.tone] }}>{r.initials}</div>
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <span style={t.cellTitle}>{r.name}</span>
          <span style={t.cellSub}>{r.role}</span>
        </div>
      </div>
      <div style={{ ...t.cell, flex: 1.4 }}>
        <span style={t.idMono}>{r.svc}</span>
      </div>
      <div style={{ ...t.cell, flex: 1.2 }}>
        <span style={t.cellChip}>{r.cat}</span>
      </div>
      <div style={{ ...t.cell, width: 108 }}>
        <span style={{ ...t.statusChip, background: s.bg, color: s.color }}>
          <span style={{ ...t.statusDot, background: s.dot }} />
          <span>{s.label}</span>
        </span>
      </div>
      <div style={{ ...t.cell, width: 84, justifyContent: "flex-end" }}>
        <span style={r.amount ? t.cellAmount : t.cellNull}>{r.amount ? `$${r.amount.toLocaleString()}` : "—"}</span>
      </div>
      <div style={{ ...t.cell, width: 110 }}>
        <span style={t.cellDate}>{r.date}</span>
      </div>
      <div style={t.headerCellAction}>
        <button style={t.actionBtn}><Ic name="external-link" size={12} color="#0A6BCF" /></button>
        <button style={t.actionBtn}><Ic name="more-vertical" size={12} color="#6B7280" /></button>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div style={{ ...t.tableWrap, marginTop: 18 }}>
      <div style={t.tableToolbar}>
        <div style={t.tableTitleRow}>
          <Skel w={120} h={14} />
        </div>
      </div>
      <div style={t.row}>
        {[88, 200, 120, 100, 90, 70, 100].map((w, i) => <div key={i} style={{ ...t.headerCell, width: w }}><Skel w={w * 0.5} h={9} /></div>)}
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ ...t.row, ...t.rowBody, ...t.rowBorder }}>
          <div style={t.headerCellCheck}><Skel w={16} h={16} r={4} /></div>
          <div style={{ ...t.cell, width: 88 }}><Skel w={64} h={10} /></div>
          <div style={{ ...t.cell, flex: 2, gap: 10 }}>
            <Skel w={28} h={28} r="50%" />
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <Skel w={120} h={10} />
              <Skel w={70} h={8} />
            </div>
          </div>
          <div style={{ ...t.cell, flex: 1.4 }}><Skel w={80} h={10} /></div>
          <div style={{ ...t.cell, flex: 1.2 }}><Skel w={70} h={10} /></div>
          <div style={{ ...t.cell, width: 108 }}><Skel w={70} h={16} r={999} /></div>
          <div style={{ ...t.cell, width: 84, justifyContent: "flex-end" }}><Skel w={48} h={10} /></div>
          <div style={{ ...t.cell, width: 110 }}><Skel w={70} h={10} /></div>
        </div>
      ))}
    </div>
  );
}

function Skel({ w = "100%", h = 12, r = 6 }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "linear-gradient(90deg, #EEF3F8, #F8FBFF 40%, #EEF3F8 80%)", backgroundSize: "200% 100%", animation: "ui-shimmer 1.6s linear infinite" }} />;
}

// =====================================================================
// 5.2 KPI CARD
// =====================================================================
function Sparkline({ values, color = "#0A6BCF", w = 80, h = 28, fill = true }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((y, i) => {
    const x = (i / (values.length - 1)) * w;
    const yp = h - 4 - ((y - min) / range) * (h - 8);
    return `${x},${yp}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      {fill && <polyline points={`0,${h} ${pts} ${w},${h}`} fill={color} opacity="0.10" />}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* End dot */}
      <circle cx={w} cy={parseFloat(pts.split(" ").slice(-1)[0].split(",")[1])} r="2.5" fill={color} />
    </svg>
  );
}

function KpiCard({ size = "md", icon, tone, label, val, delta, deltaDir, spark, sub }) {
  const map = {
    blue:  { bg: "rgba(10,107,207,0.10)", color: "#0A6BCF" },
    green: { bg: "rgba(24,166,106,0.12)", color: "#0F8A56" },
    amber: { bg: "rgba(245,158,11,0.14)", color: "#B45309" },
    cyan:  { bg: "rgba(24,193,255,0.18)", color: "#0884B0" },
    purple:{ bg: "rgba(124,58,237,0.12)", color: "#7C3AED" },
  };
  const v = map[tone];
  const sizes = {
    sm: { padding: "10px 12px", iconBox: 24, iconSz: 11, valSz: 18, labelSz: 9 },
    md: { padding: "14px 16px", iconBox: 30, iconSz: 13, valSz: 22, labelSz: 10 },
    lg: { padding: "18px 20px", iconBox: 36, iconSz: 15, valSz: 30, labelSz: 10.5 },
  };
  const s = sizes[size];
  const deltaColor = deltaDir === "up" ? "#0F8A56" : deltaDir === "down" ? "#DC2626" : "#6B7280";
  return (
    <div style={{ padding: s.padding, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ width: s.iconBox, height: s.iconBox, borderRadius: 8, background: v.bg, display: "grid", placeItems: "center" }}>
          <Ic name={icon} size={s.iconSz} color={v.color} stroke={2.4} />
        </div>
        {spark && <Sparkline values={spark} color={v.color} w={size === "sm" ? 60 : size === "md" ? 80 : 100} h={size === "sm" ? 22 : 28} />}
      </div>
      <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: s.valSz, color: "#0E2C56", letterSpacing: "-0.02em", lineHeight: 1 }}>{val}</div>
      <div style={{ fontSize: s.labelSz, color: "#9CA3AF", marginTop: 4, textTransform: "uppercase", letterSpacing: ".06em", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{label}</div>
      {delta && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 11, color: deltaColor, fontWeight: 700 }}>
          {deltaDir === "up" && <Ic name="trending-up" size={11} color={deltaColor} />}
          {deltaDir === "down" && <Ic name="trending-down" size={11} color={deltaColor} />}
          <span>{delta}</span>
          {sub && <span style={{ color: "#9CA3AF", fontWeight: 500, marginLeft: 2 }}>{sub}</span>}
        </div>
      )}
    </div>
  );
}

function KpiGrid({ desktop }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={dd.subLabel}>SIZE MD · DEFAULT</div>
        <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)", gap: 8 }}>
          <KpiCard icon="briefcase" tone="blue"   label="servicios activos" val="47"      delta="+8 esta hora" deltaDir="up"   spark={[40,42,38,44,46,47]} />
          <KpiCard icon="check"     tone="green"  label="completados hoy"   val="128"     delta="meta 150"     spark={[80,90,95,110,118,128]} />
          <KpiCard icon="wallet"    tone="amber"  label="GMV día · MXN"     val="$94K"    delta="+18% vs ayer" deltaDir="up"   spark={[60,70,68,80,85,94]} />
          <KpiCard icon="users"     tone="cyan"   label="técnicos activos"  val="142"     delta="78% disp."    spark={[120,128,132,138,140,142]} />
        </div>
      </div>

      <div>
        <div style={dd.subLabel}>SIZE SM · DASHBOARD SECUNDARIO</div>
        <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)", gap: 8 }}>
          <KpiCard size="sm" icon="zap"   tone="blue"   label="aceptación" val="98%"  delta="alto" />
          <KpiCard size="sm" icon="clock" tone="cyan"   label="respuesta"  val="95%"  delta="<5 min" />
          <KpiCard size="sm" icon="award" tone="amber"  label="rating"     val="4.8"  delta="214 res." />
          <KpiCard size="sm" icon="repeat" tone="green"  label="retención" val="62%"  delta="+4 pts" deltaDir="up" />
        </div>
      </div>

      <div>
        <div style={dd.subLabel}>SIZE LG · HERO (cartera / home técnico)</div>
        <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: 10 }}>
          <KpiCard size="lg" icon="wallet" tone="blue"   label="GANADO HOY"     val="$5,840" delta="+12%" deltaDir="up"   sub="vs ayer" spark={[2400,3100,3800,4200,5100,5840]} />
          <KpiCard size="lg" icon="trending-up" tone="green" label="ESTE MES"   val="$87,450" delta="proyec $110K" sub="al 19/05" spark={[15,28,42,58,71,87]} />
        </div>
      </div>

      <div>
        <div style={dd.subLabel}>VARIANT · COMPARATIVO NEGATIVO</div>
        <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3, 1fr)" : "1fr", gap: 8 }}>
          <KpiCard icon="user-x"  tone="amber" label="cancelaciones cliente" val="6"   delta="+2 vs ayer" deltaDir="up" spark={[2,3,4,3,5,6]} />
          <KpiCard icon="trending-down" tone="amber" label="aceptación zona"  val="68%" delta="-12 pts"   deltaDir="down" spark={[80,78,75,72,70,68]} />
          <KpiCard icon="alert-triangle" tone="amber" label="SLA vencido"     val="3"   delta="atención" />
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 5.3 TIMELINE
// =====================================================================
function TimelineGrid() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={dd.subLabel}>TIMELINE DE SERVICIO · ESTADOS</div>
        <div style={dd.timelineCard}>
          <TimelineRow icon="check" state="done"
            time="14:32" actor={{ initials: "MR", tone: 1, name: "María Rodríguez" }}
            text={(<><b>Solicitud aceptada</b> · servicio agendado para hoy 3 PM</>)} />
          <TimelineRow icon="truck" state="done"
            time="14:45" actor={{ initials: "RH", tone: 0, name: "Ramón Hernández" }}
            text={(<>Marcó <b>En camino</b> · llegando en ~12 min</>)} />
          <TimelineRow icon="map-pin" state="current"
            time="ahora" actor={{ initials: "RH", tone: 0, name: "Ramón Hernández" }}
            text={(<><b>Llegó al sitio</b> · diagnóstico en curso</>)}
            photo />
          <TimelineRow icon="receipt-text" state="future"
            time="—" text="Cotización pendiente · esperando diagnóstico" />
          <TimelineRow icon="wrench" state="future"
            time="—" text="Trabajo en ejecución" />
          <TimelineRow icon="check-check" state="future"
            time="—" text="Servicio completado · pago liberado" last />
        </div>
      </div>

      <div>
        <div style={dd.subLabel}>HISTORIAL DE TRANSACCIONES (admin)</div>
        <div style={dd.timelineCard}>
          <TimelineRow icon="user-check" state="done"
            time="14:48" actor={{ initials: "SA", tone: 3, name: "Sofía Álvarez" }}
            text={(<>Aprobó <b>KYC</b> de Luis Méndez · doc #KYC-1148</>)} />
          <TimelineRow icon="message-square-warning" state="done" warn
            time="14:32" actor={{ initials: "DR", tone: 0, name: "Diego Rodríguez" }}
            text={(<>Escaló <b>disputa #SVC-2812</b> a soporte L2</>)} />
          <TimelineRow icon="rotate-ccw" state="done"
            time="13:15" actor={{ initials: "Sis", tone: 2, name: "Sistema" }}
            text={(<>Procesó <b>reembolso</b> de $850 MXN · ticket #T-2802</>)} />
          <TimelineRow icon="ban" state="done" danger
            time="12:08" actor={{ initials: "SA", tone: 3, name: "Sofía Álvarez" }}
            text={(<>Suspendió cuenta de <b>Roberto Sánchez</b> · motivo: 3 cancelaciones</>)} last />
        </div>
      </div>
    </div>
  );
}

function TimelineRow({ icon, state, time, actor, text, last, photo, warn, danger }) {
  const stateMap = {
    done:    { bg: "#18A66A", color: "#FFFFFF", line: "#18A66A" },
    current: { bg: "#0A6BCF", color: "#FFFFFF", line: "#E1E8F0", halo: true },
    future:  { bg: "#EEF3F8", color: "#9CA3AF", line: "#E1E8F0" },
  };
  const s = stateMap[state];
  if (warn) { s.bg = "#F59E0B"; s.color = "#FFFFFF"; }
  if (danger) { s.bg = "#DC2626"; s.color = "#FFFFFF"; }
  return (
    <div style={dd.tlRow}>
      <div style={dd.tlTimeCol}>
        <span style={dd.tlTime}>{time}</span>
      </div>
      <div style={dd.tlIconCol}>
        <div style={{
          ...dd.tlDot,
          background: s.bg,
          color: s.color,
          ...(s.halo ? { boxShadow: "0 0 0 4px rgba(10,107,207,0.18)" } : null),
        }}>
          <Ic name={icon} size={11} color={s.color} stroke={2.5} />
        </div>
        {!last && <div style={{ ...dd.tlLine, background: s.line }} />}
      </div>
      <div style={dd.tlContent}>
        {actor && (
          <div style={dd.tlActor}>
            <div style={{ ...dd.tlActorAv, background: TONES[actor.tone % TONES.length] }}>{actor.initials}</div>
            <span style={dd.tlActorName}>{actor.name}</span>
          </div>
        )}
        <div style={dd.tlText}>{text}</div>
        {photo && (
          <div style={dd.tlPhotos}>
            <div style={{ ...dd.tlPhoto, background: "linear-gradient(135deg,#0A6BCF,#0894EA)" }}><Ic name="image" size={12} color="rgba(255,255,255,0.85)" /></div>
            <div style={{ ...dd.tlPhoto, background: "linear-gradient(135deg,#B45309,#F59E0B)" }}><Ic name="image" size={12} color="rgba(255,255,255,0.85)" /></div>
            <span style={dd.tlPhotosLabel}>2 fotos del estado inicial</span>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================================
// 5.4 STATS ROW
// =====================================================================
function StatsRow({ items, dark, divider = "line" }) {
  return (
    <div style={{
      display: "flex", alignItems: "stretch",
      padding: "12px 16px",
      background: dark ? "rgba(255,255,255,0.10)" : "#FFFFFF",
      border: dark ? "1px solid rgba(255,255,255,0.15)" : "1px solid #E1E8F0",
      borderRadius: 12,
      color: dark ? "#FFFFFF" : "#0E2C56",
      backdropFilter: dark ? "blur(8px)" : "none",
    }}>
      {items.map((it, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && (
            divider === "line"
              ? <div style={{ width: 1, background: dark ? "rgba(255,255,255,0.18)" : "#E1E8F0", margin: "0 12px" }} />
              : <div style={{ width: 8 }} />
          )}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: it.align || "flex-start" }}>
            {it.icon && (
              <div style={{ width: 22, height: 22, borderRadius: 6, background: dark ? "rgba(255,255,255,0.18)" : "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", marginBottom: 6 }}>
                <Ic name={it.icon} size={11} color={dark ? "#FFFFFF" : "#0A6BCF"} />
              </div>
            )}
            <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1, color: dark ? "#FFFFFF" : (it.color || "#0E2C56") }}>{it.val}</div>
            <div style={{ fontSize: 10, color: dark ? "rgba(255,255,255,0.70)" : "#9CA3AF", marginTop: 4, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>{it.label}</div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

function StatsRowGrid({ desktop }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={dd.subLabel}>HEADER TÉCNICO · 3 COLUMNAS · CON ÍCONO</div>
        <StatsRow items={[
          { icon: "briefcase", val: "12",    label: "servicios hoy" },
          { icon: "wallet",    val: "$5,840",label: "ganado · MXN" },
          { icon: "star",      val: "4.8",   label: "rating · 214" },
        ]} />
      </div>

      <div>
        <div style={dd.subLabel}>SOBRE GRADIENT NAVY (translúcido · home técnico)</div>
        <div style={{ padding: 16, background: "linear-gradient(135deg,#0E2C56,#0A6BCF)", borderRadius: 14 }}>
          <StatsRow dark items={[
            { val: "12",    label: "servicios hoy" },
            { val: "$5,840",label: "ganado · MXN" },
            { val: "4.8",   label: "rating · 214" },
          ]} />
        </div>
      </div>

      <div>
        <div style={dd.subLabel}>4 COLUMNAS · KPI MINI (admin operación)</div>
        <StatsRow items={[
          { val: "47",   label: "servicios activos" },
          { val: "128",  label: "completados hoy" },
          { val: "$94K", label: "GMV día", color: "#0A6BCF" },
          { val: "142",  label: "técnicos activos" },
        ]} />
      </div>

      <div>
        <div style={dd.subLabel}>SUMMARY BANNER · MIS SERVICIOS (cliente)</div>
        <div style={{ padding: 14, background: "linear-gradient(135deg, rgba(10,107,207,0.06), rgba(24,193,255,0.04))", border: "1.5px solid rgba(10,107,207,0.20)", borderRadius: 14 }}>
          <StatsRow items={[
            { val: "$7,180", label: "gastado en 2026" },
            { val: "5",      label: "servicios" },
            { val: "1",      label: "sin calificar", color: "#B45309" },
          ]} />
        </div>
      </div>

      <div>
        <div style={dd.subLabel}>CONTEXT STRIP · DETALLE TICKET ADMIN (compacto)</div>
        <div style={{ padding: "10px 14px", background: "#0E2C56", borderRadius: 12, color: "#FFFFFF" }}>
          <StatsRow dark divider="line" items={[
            { val: "$850",  label: "monto disputado" },
            { val: "1h 22m",label: "SLA restante", color: "#FBBF24" },
            { val: "Ramón H.", label: "técnico" },
          ]} />
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
          <div style={l.handoffTitle}>Handoff · Sección 5 lista</div>
          <div style={l.handoffSub}>4 componentes de data display · table admin + KPIs cross-app</div>
        </div>
        <span style={l.handoffChip}>SECCIÓN 5 / 6</span>
      </div>

      <div style={l.handoffGrid}>
        <div style={l.handoffCard}>
          <div style={l.handoffCardLabel}>COMPONENTES ENVIADOS</div>
          <ul style={l.handoffList}>
            <li><b>Table</b> · toolbar + bulk bar + sort headers + row states + pagination + skeleton</li>
            <li><b>KPICard</b> · 3 sizes + sparkline + delta dir + 5 tones + variant negativo</li>
            <li><b>Timeline</b> · vertical con dots done/current/future + actor avatar + photo attachments</li>
            <li><b>StatsRow</b> · 3-4 cols + light/dark variants + dividers</li>
          </ul>
        </div>

        <div style={l.handoffCard}>
          <div style={l.handoffCardLabel}>CARPETAS</div>
          <div style={l.handoffCode}>
            <div><b>/components/ui/</b></div>
            <div>{"  table.tsx"}</div>
            <div>{"  kpi-card.tsx"}</div>
            <div>{"  timeline.tsx"}</div>
            <div>{"  stats-row.tsx"}</div>
            <div>{"  sparkline.tsx"}</div>
            <div style={{ marginTop: 8 }}><b>/components/data/</b></div>
            <div>{"  data-table.tsx · sortable headers"}</div>
            <div>{"  pagination.tsx"}</div>
          </div>
        </div>

        <div style={l.handoffCard}>
          <div style={l.handoffCardLabel}>DEPENDENCIAS</div>
          <ul style={l.handoffList}>
            <li><code>@tanstack/react-table</code> sort · filter · pagination web</li>
            <li><code>shadcn/ui</code> Table primitives</li>
            <li><code>recharts</code> sparklines responsivos (web)</li>
            <li><code>react-native-svg</code> sparklines mobile</li>
            <li><code>date-fns</code> formato fechas relativas</li>
          </ul>
        </div>

        <div style={l.handoffCard}>
          <div style={l.handoffCardLabel}>SIGUIENTES SECCIONES</div>
          <ol style={l.handoffOl}>
            <li>✓ Primitives · Containers · Navigation · Forms · Data Display (esta)</li>
            <li style={{ color: "#0A6BCF", fontWeight: 700 }}>→ Domain-specific (final) — TechnicianCard · ServiceStatusCard · PriceBreakdown · ChatMessageBubble · CategoryIcon · MapCard · KycDocumentCard + RatingInput</li>
          </ol>
          <div style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 10, lineHeight: 1.5 }}>
            La última sección compone primitives + containers en componentes de negocio reutilizables.
          </div>
        </div>
      </div>

      <div style={l.handoffNextStep}>
        <Ic name="hand" size={13} color="#0A6BCF" />
        <span>Avísame y avanzamos con <b style={{ color: "#0E2C56", fontWeight: 800 }}>Sección 6 · Domain-specific</b> (componentes de negocio: técnico, servicio, precio, chat, KYC, mapa, categoría).</span>
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
      <SectionHeader num="05" title="Data Display" sub="Componentes para visualizar datos cuantitativos, listas y secuencias." />

      <ComponentBlock
        id="table"
        name="Table"
        codeName="<Table />"
        badge={{ label: "Web admin only", tone: "web" }}
        desc="Tabla con sort, filter, bulk selection y paginación. Construida sobre @tanstack/react-table + shadcn primitives."
        desktopGrid={
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Table />
            <div>
              <div style={dd.subLabel}>LOADING SKELETON</div>
              <TableSkeleton />
            </div>
          </div>
        }
        props={[
          { name: "columns",      type: "ColumnDef<T>[]",                       default: "—", required: true },
          { name: "data",         type: "T[]",                                  default: "—", required: true },
          { name: "selectable",   type: "boolean",                              default: "true" },
          { name: "sortBy",       type: "{ column, dir }",                      default: "—" },
          { name: "onSortChange", type: "(s) => void",                          default: "—" },
          { name: "pagination",   type: "{ page, perPage, total }",             default: "—", required: true },
          { name: "onPageChange", type: "(p) => void",                          default: "—", required: true },
          { name: "loading",      type: "boolean",                              default: "false" },
          { name: "bulkActions",  type: "Action[]",                             default: "[]" },
        ]}
        tokens={[
          { cat: "row height",    val: "56 px · 12+12 padding" },
          { cat: "header",        val: "Mono 10.5 · uppercase ·.06em · #6B7280" },
          { cat: "cell title",    val: "Inter 600 · 12.5 #0E2C56" },
          { cat: "row hover",     val: "bg #F8FBFF" },
          { cat: "row selected",  val: "bg rgba(10,107,207,0.06) + left bar 3px" },
          { cat: "id mono",       val: "JetBrains Mono 11 #0A6BCF" },
          { cat: "bulk bar",      val: "sticky top · bg rgba(10,107,207,0.06) · color primary" },
        ]}
        notes={[
          "Sort: tap header toggles asc → desc → none. Solo 1 columna sortable a la vez.",
          "Bulk bar aparece como overlay sticky cuando hay 1+ filas seleccionadas.",
          "Checkbox header con state indeterminate cuando hay selección parcial.",
          "Row actions (external link, kebab) visibles on hover en desktop · siempre visibles en touch.",
          "Pagination: numbers 1-4 + ellipsis + último · ⌘+arrows en desktop.",
          "Skeleton replica EXACTAMENTE las anchuras de columnas reales.",
        ]}
        useCases={[
          "Bandeja de disputas admin",
          "Cola de KYC pendientes",
          "Lista de técnicos · clientes · servicios",
          "Reportes financieros con totales footer",
        ]}
      />

      <ComponentBlock
        id="kpi-card"
        name="KPICard"
        codeName="<KPICard />"
        desc="Tarjeta de métrica clave con label, valor grande, delta vs período anterior y sparkline opcional."
        mobileGrid={<KpiGrid />}
        desktopGrid={<KpiGrid desktop />}
        props={[
          { name: "size",     type: "sm | md | lg",                    default: "md" },
          { name: "icon",     type: "LucideIcon",                       default: "—", required: true },
          { name: "tone",     type: "blue | green | amber | cyan | purple", default: "blue" },
          { name: "label",    type: "string",                           default: "—", required: true },
          { name: "val",      type: "string | number",                  default: "—", required: true },
          { name: "delta",    type: "string",                           default: "—" },
          { name: "deltaDir", type: "up | down | flat",                 default: "flat" },
          { name: "sub",      type: "string",                           default: "—" },
          { name: "spark",    type: "number[]",                         default: "—" },
        ]}
        tokens={[
          { cat: "valor",   val: "Manrope 800 · 18/22/30 · letter-spacing -0.02em" },
          { cat: "label",   val: "JetBrains Mono 9-10.5 uppercase ·.06em #9CA3AF" },
          { cat: "delta up",val: "#0F8A56 · ícono trending-up" },
          { cat: "delta dn",val: "#DC2626 · ícono trending-down" },
          { cat: "spark",   val: "stroke 1.8 · area fill 10% · end dot 2.5" },
        ]}
        notes={[
          "Sparkline solo si hay >= 4 datapoints; menos abruma visualmente.",
          "Delta direction NUNCA arbitrario: usar el dato real (más servicios = up; más cancelaciones = up pero color amber/red según contexto).",
          "size sm: dashboards densos · md: default · lg: hero único (cartera, home).",
          "tone purple reservado para roles internos (admin · sistema), no operación.",
        ]}
        useCases={[
          "Home técnico: 3 KPIs (servicios hoy · ganado · rating)",
          "Dashboard admin: 4 KPIs operación con sparklines",
          "Cartera técnico: hero lg ganado hoy + lg mensual",
          "Reportes: matriz 4×n de KPIs por categoría",
        ]}
      />

      <ComponentBlock
        id="timeline"
        name="Timeline"
        codeName="<Timeline />"
        desc="Línea de tiempo vertical con dots de estado, actor opcional y fotos adjuntas. Usado para flujos de servicio y logs de admin."
        mobileGrid={<TimelineGrid />}
        desktopGrid={<TimelineGrid />}
        props={[
          { name: "items",   type: "TimelineItem[]",          default: "—", required: true },
          { name: "compact", type: "boolean",                 default: "false" },
        ]}
        tokens={[
          { cat: "dot done",     val: "22 px · Success Green · check icon" },
          { cat: "dot current",  val: "22 px · Primary Blue · halo 4px @ 18%" },
          { cat: "dot future",   val: "22 px · #EEF3F8 + icon faded" },
          { cat: "dot warn/err", val: "ámbar/rojo para acciones críticas en logs" },
          { cat: "line",         val: "2 px · green (past) / gray (future)" },
          { cat: "time col",     val: "JetBrains Mono 10.5 · width 60" },
        ]}
        notes={[
          "Estado 'current' SOLO uno por timeline · indica el punto activo.",
          "Actor opcional: mostrar avatar mini + nombre cuando es relevante (admin actions).",
          "Photo attachments en thumbnails 24×24 con label corto + count.",
          "warn/danger props anulan el state mapping (rojo/ámbar para suspender, escalar, etc).",
          "Mobile: scroll vertical natural; desktop puede limitar a maxHeight con scroll interno.",
        ]}
        useCases={[
          "Estados del servicio (6 pasos del ciclo de vida)",
          "Historial de transacciones en admin",
          "Log de auditoría de un ticket",
          "Confirmación bilateral de pago en efectivo",
        ]}
      />

      <ComponentBlock
        id="stats-row"
        name="StatsRow"
        codeName="<StatsRow />"
        desc="Fila horizontal de 3-4 KPIs compactos. Para headers, banners y context strips. Soporta light y dark."
        mobileGrid={<StatsRowGrid />}
        desktopGrid={<StatsRowGrid desktop />}
        props={[
          { name: "items",    type: "Array<{ val, label, icon?, color?, align? }>", default: "—", required: true },
          { name: "dark",     type: "boolean",                                       default: "false" },
          { name: "divider",  type: "line | space",                                  default: "line" },
          { name: "compact",  type: "boolean",                                       default: "false" },
        ]}
        tokens={[
          { cat: "val",     val: "Manrope 800 · 16-18 · #0E2C56 / #FFFFFF" },
          { cat: "label",   val: "Mono 9-10 · uppercase ·.04em · #9CA3AF / .70 white" },
          { cat: "divider", val: "1px hairline · margin 12px · light/dark variants" },
          { cat: "icon",    val: "22×22 · radius 6 · bg tinted 10% · stroke 2" },
        ]}
        notes={[
          "Diferencia con KPICard: StatsRow es para resumen denso (no delta, no spark).",
          "dark=true para headers gradient navy (home técnico/admin).",
          "color en items para destacar valores semánticos (gasto, SLA, alerta).",
          "Usar 3 items en headers de detalle · 4 en dashboards · 5+ es demasiado denso.",
        ]}
        useCases={[
          "Header home técnico (servicios · ganado · rating)",
          "Summary banner mis servicios cliente",
          "Context strip detalle ticket admin (monto · SLA · técnico)",
          "Card de quick stats en dashboard",
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
  platformBadge: { padding: "3px 9px", borderRadius: 4, fontSize: 9.5, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".06em", textTransform: "uppercase" },
  platformBadgeMobile: { background: "rgba(245,158,11,0.14)", color: "#B45309" },
  platformBadgeWeb: { background: "rgba(124,58,237,0.12)", color: "#7C3AED" },
  componentDesc: { fontSize: 13.5, color: "#6B7280", marginTop: 6, maxWidth: 660 },
  componentLinks: { display: "flex", gap: 8 },
  componentLink: { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 8, fontSize: 11, color: "#0A6BCF", fontWeight: 600 },
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

const t = {
  tableWrap: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, overflow: "hidden", boxShadow: "0 4px 14px rgba(14,44,86,0.04)" },
  tableToolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid #F0F4F9", background: "#FFFFFF" },
  tableTitleRow: { display: "flex", alignItems: "baseline", gap: 8 },
  tableTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.01em" },
  tableCount: { padding: "2px 8px", background: "rgba(10,107,207,0.08)", color: "#0A6BCF", borderRadius: 999, fontSize: 11, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" },
  tableActions: { display: "flex", alignItems: "center", gap: 8 },
  tableSearch: { display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 8, width: 260 },
  tableSearchK: { padding: "1px 6px", background: "rgba(14,44,86,0.05)", borderRadius: 4, fontSize: 9.5, color: "#6B7280", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
  tableBtnGhost: { display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 11px", background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #E1E8F0", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" },
  tableBtnBadge: { padding: "1px 6px", background: "rgba(245,158,11,0.14)", color: "#B45309", borderRadius: 999, fontSize: 9.5, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" },
  tableBtnPrimary: { display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px", background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(10,107,207,0.25)" },

  bulkBar: { display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "rgba(10,107,207,0.06)", borderBottom: "1px solid rgba(10,107,207,0.18)" },
  bulkBtn: { display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", background: "#FFFFFF", color: "#0E2C56", border: "1px solid #E1E8F0", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer" },
  bulkClose: { width: 24, height: 24, borderRadius: 6, background: "transparent", border: "none", display: "grid", placeItems: "center", cursor: "pointer" },

  row: { display: "flex", alignItems: "center", padding: "0 14px", minHeight: 44 },
  rowBody: { minHeight: 56, cursor: "pointer", background: "#FFFFFF" },
  rowBorder: { borderBottom: "1px solid #F4F7FB" },
  rowSelected: { background: "rgba(10,107,207,0.04)", borderLeft: "3px solid #0A6BCF", paddingLeft: 11 },

  headerCellCheck: { width: 32, display: "grid", placeItems: "center", flexShrink: 0 },
  headerCell: { display: "flex", alignItems: "center", gap: 4, padding: "10px 8px", fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", cursor: "pointer", flexShrink: 0 },
  headerCellAction: { width: 64, display: "flex", justifyContent: "flex-end", gap: 4, flexShrink: 0 },
  cell: { display: "flex", alignItems: "center", padding: "0 8px", flexShrink: 0, minWidth: 0 },
  cellTitle: { fontSize: 12.5, color: "#0E2C56", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cellSub: { fontSize: 10.5, color: "#9CA3AF" },
  cellChip: { padding: "2px 8px", background: "rgba(10,107,207,0.08)", color: "#0A6BCF", borderRadius: 999, fontSize: 11, fontWeight: 600 },
  cellAmount: { fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 800, color: "#0E2C56" },
  cellNull: { fontSize: 12, color: "#9CA3AF" },
  cellDate: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#6B7280", fontWeight: 600 },
  idMono: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#0A6BCF", fontWeight: 700 },

  avMini: { width: 28, height: 28, borderRadius: "50%", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 10, flexShrink: 0 },
  statusChip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, fontSize: 9, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".06em" },
  statusDot: { width: 6, height: 6, borderRadius: "50%" },
  actionBtn: { width: 28, height: 28, borderRadius: 7, background: "transparent", border: "none", display: "grid", placeItems: "center", cursor: "pointer" },

  cb: { width: 16, height: 16, borderRadius: 4, border: "1.5px solid #C8D4E0", background: "#FFFFFF", display: "grid", placeItems: "center" },
  cbOn: { background: "#0A6BCF", borderColor: "#0A6BCF" },
  cbIndet: { background: "#0A6BCF", borderColor: "#0A6BCF" },
  cbIndetDash: { width: 8, height: 2, background: "#FFFFFF", borderRadius: 1 },

  pagination: { display: "flex", alignItems: "center", padding: "12px 16px", borderTop: "1px solid #F0F4F9", background: "#F8FBFF" },
  paginationCount: { fontSize: 11.5, color: "#6B7280", flex: 1 },
  paginationCenter: { display: "flex", alignItems: "center", gap: 2 },
  pageBtn: { width: 28, height: 28, borderRadius: 6, background: "#FFFFFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer" },
  pageNum: { minWidth: 28, height: 28, padding: "0 8px", borderRadius: 6, background: "#FFFFFF", border: "1px solid #E1E8F0", color: "#6B7280", fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" },
  pageNumActive: { background: "#0A6BCF", borderColor: "#0A6BCF", color: "#FFFFFF", boxShadow: "0 4px 10px rgba(10,107,207,0.25)" },
  paginationRight: { display: "flex", alignItems: "center", gap: 8, flex: 1, justifyContent: "flex-end" },
  paginationLabel: { fontSize: 11.5, color: "#6B7280" },
  paginationSelect: { display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 9px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 6, fontSize: 11.5, color: "#0E2C56", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", cursor: "pointer" },
};

const dd = {
  subLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#0A6BCF", letterSpacing: ".12em", fontWeight: 700, marginBottom: 8 },

  // Timeline
  timelineCard: { padding: "14px 14px 6px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14 },
  tlRow: { display: "flex", gap: 10, alignItems: "flex-start" },
  tlTimeCol: { width: 50, paddingTop: 2 },
  tlTime: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#6B7280", fontWeight: 700 },
  tlIconCol: { display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 },
  tlDot: { width: 22, height: 22, borderRadius: "50%", display: "grid", placeItems: "center", flexShrink: 0 },
  tlLine: { width: 2, flex: 1, minHeight: 28, marginTop: 4 },
  tlContent: { flex: 1, minWidth: 0, paddingBottom: 16 },
  tlActor: { display: "inline-flex", alignItems: "center", gap: 5, marginBottom: 4 },
  tlActorAv: { width: 18, height: 18, borderRadius: "50%", background: "#0A6BCF", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 8.5 },
  tlActorName: { fontSize: 11, color: "#0E2C56", fontWeight: 700 },
  tlText: { fontSize: 12.5, color: "#0E2C56", lineHeight: 1.5 },
  tlPhotos: { display: "flex", alignItems: "center", gap: 5, marginTop: 8 },
  tlPhoto: { width: 28, height: 28, borderRadius: 6, display: "grid", placeItems: "center" },
  tlPhotosLabel: { fontSize: 10.5, color: "#9CA3AF", marginLeft: 4 },
};

const kf = document.createElement("style");
kf.textContent = `@keyframes ui-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`;
document.head.appendChild(kf);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
