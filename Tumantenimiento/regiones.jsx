/* global React, ReactDOM, AdminIc, AdminSidebar, AdminHeader */
const Ic = AdminIc;

// ============================================================
// TREE DATA
// ============================================================
const TREE = {
  root: { id: "mx", icon: "flag", flag: "🇲🇽", label: "México", badge: { label: "1 país", tone: "muted" } },
  zmg: { id: "zmg", label: "Zona Metropolitana de Guadalajara", badge: { label: "Activa", tone: "ok" } },
  cities: [
    { id: "gdl",    name: "Guadalajara",         status: "ok",   colonias: 245, expanded: true,  techs: 412, sample: ["Centro Histórico", "Providencia", "Chapalita", "Lafayette", "Country Club", "Americana"] },
    { id: "zap",    name: "Zapopan",             status: "ok",   colonias: 198, expanded: true,  techs: 318, selected: true, sample: ["Andares", "Las Águilas", "Valle Real", "Providencia", "Country Club", "Vallarta Universidad"] },
    { id: "tlaq",   name: "Tlaquepaque",         status: "ok",   colonias: 124, expanded: false, techs: 142 },
    { id: "ton",    name: "Tonalá",              status: "ok",   colonias: 89,  expanded: false, techs: 86 },
    { id: "tlaj",   name: "Tlajomulco de Zúñiga",status: "warn", colonias: 64,  expanded: false, techs: 48 },
    { id: "salto",  name: "El Salto",            status: "warn", colonias: 38,  expanded: false, techs: 24 },
  ],
  futureCities: [
    { id: "cdmx", name: "Ciudad de México", status: "muted", note: "Próximamente · Q3 2026" },
    { id: "mty",  name: "Monterrey",        status: "muted", note: "Próximamente · Q4 2026" },
  ],
};

const STATUS_BADGE = {
  ok:    { label: "Activa",   bg: "#E5F7EE", fg: "#18A66A", dot: "#18A66A" },
  warn:  { label: "Parcial",  bg: "#FEF3DC", fg: "#B45309", dot: "#F59E0B" },
  muted: { label: "Inactiva", bg: "#EEF3F8", fg: "#6B7280", dot: "#9CA3AF" },
};

const ZAPOPAN_NEIGHBORHOODS = [
  { name: "Andares",                    cp: "45116", techs: 28, jobs: 142, active: true },
  { name: "Valle Real",                 cp: "45019", techs: 22, jobs: 118, active: true },
  { name: "Providencia",                cp: "44639", techs: 31, jobs: 168, active: true },
  { name: "Country Club",               cp: "45010", techs: 18, jobs: 96,  active: true },
  { name: "Las Águilas",                cp: "45080", techs: 14, jobs: 72,  active: true },
  { name: "Vallarta Universidad",       cp: "45110", techs: 19, jobs: 102, active: true },
  { name: "Vallarta Norte",             cp: "44690", techs: 12, jobs: 58,  active: true },
  { name: "Ciudad Granja",              cp: "45010", techs: 10, jobs: 48,  active: true },
  { name: "Plaza del Sol",              cp: "45050", techs: 16, jobs: 84,  active: true },
  { name: "Tepeyac",                    cp: "45150", techs: 8,  jobs: 32,  active: true },
  { name: "Real de la Loma",            cp: "45070", techs: 6,  jobs: 24,  active: false },
  { name: "Bugambilias",                cp: "45238", techs: 11, jobs: 54,  active: true },
  { name: "Loma Bonita Ejidal",         cp: "45086", techs: 4,  jobs: 16,  active: false },
  { name: "Santa Margarita",            cp: "45140", techs: 9,  jobs: 38,  active: true },
];

// ============================================================
// TREE COMPONENT
// ============================================================
function Tree({ selectedId = "zap" }) {
  return (
    <aside style={rg.treeCard}>
      <div style={rg.treeHead}>
        <div style={rg.inputWrap}>
          <Ic name="search" size={14} color="#9CA3AF" style={{ marginLeft: 12 }} />
          <input placeholder="Buscar ciudad o colonia…" style={rg.input} />
        </div>
        <div style={rg.treeFilters}>
          <Chip selected>Todas</Chip>
          <Chip>Activas</Chip>
          <Chip>Parciales</Chip>
          <Chip>Próximas</Chip>
        </div>
      </div>

      <div style={rg.treeBody}>
        {/* Root */}
        <TreeNode level={0} expanded icon="globe-2" label="México" flag="🇲🇽" badge={STATUS_BADGE.muted} badgeLabel="1 país" />

        {/* ZMG */}
        <TreeNode level={1} expanded icon="layers" label="Zona Metropolitana de Guadalajara" badge={STATUS_BADGE.ok} badgeLabel="Activa" sub="6 ciudades · 758 colonias · 1,030 técnicos" />

        {/* Cities */}
        {TREE.cities.map((c) => (
          <CityNode key={c.id} city={c} isSelected={c.id === selectedId} />
        ))}

        {/* Spacing */}
        <div style={{ height: 8 }} />

        {/* Future cities collapsed */}
        <TreeNode level={1} expanded={false} icon="hourglass" label="Otras zonas" badge={STATUS_BADGE.muted} badgeLabel="próximamente" sub="2 ciudades en planeación" />

        {TREE.futureCities.map((c) => (
          <TreeNode key={c.id} level={2} icon="map-pin" label={c.name} badge={STATUS_BADGE.muted} badgeLabel={c.note} muted />
        ))}
      </div>
    </aside>
  );
}

function TreeNode({ level, expanded = false, icon, flag, label, badge, badgeLabel, sub, muted = false, selected = false, hasChildren = false, leaf = false, count = null }) {
  const indent = 8 + level * 16;
  return (
    <div style={{
      ...rg.treeRow,
      paddingLeft: indent,
      ...(selected ? rg.treeRowSelected : null),
      ...(muted ? { opacity: 0.7 } : null),
    }}>
      {!leaf && (
        <button style={rg.treeChevron} aria-label={expanded ? "Colapsar" : "Expandir"}>
          <Ic name={expanded ? "chevron-down" : "chevron-right"} size={12} color="#6B7280" />
        </button>
      )}
      {leaf && <span style={rg.treeChevron} />}
      {flag ? (
        <span style={{ fontSize: 16, width: 22, textAlign: "center" }}>{flag}</span>
      ) : (
        <div style={{ ...rg.treeIcon, ...(selected ? { background: "rgba(10,107,207,0.16)" } : null) }}>
          <Ic name={icon} size={13} color={selected ? "#0A6BCF" : "#0E2C56"} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#0E2C56", fontWeight: selected ? 600 : 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
          {badge && (
            <span style={{ ...rg.treeBadge, background: badge.bg, color: badge.fg }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: badge.dot }} />
              {badgeLabel || badge.label}
            </span>
          )}
        </div>
        {sub && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{sub}</div>}
      </div>
      {count != null && <span style={{ fontSize: 11, color: "#6B7280", fontFamily: "'JetBrains Mono', monospace" }}>{count}</span>}
    </div>
  );
}

function CityNode({ city, isSelected }) {
  const badge = STATUS_BADGE[city.status];
  return (
    <>
      <TreeNode
        level={2}
        expanded={city.expanded}
        icon="map-pin"
        label={city.name}
        badge={badge}
        sub={`${city.colonias} colonias · ${city.techs} técnicos`}
        selected={isSelected}
      />
      {city.expanded && city.sample && (
        <>
          {city.sample.slice(0, 6).map((s, i) => (
            <TreeNode key={i} level={3} icon="dot" label={s} leaf />
          ))}
          <div style={{ paddingLeft: 8 + 3 * 16 + 28, paddingTop: 4, paddingBottom: 4 }}>
            <button style={rg.treeMore}>
              <Ic name="plus" size={11} color="#0A6BCF" style={{ marginRight: 4 }} />
              Ver {city.colonias - 6} colonias más
            </button>
          </div>
        </>
      )}
    </>
  );
}

function Chip({ children, selected }) {
  return <span style={{ ...rg.chip, ...(selected ? rg.chipSelected : null) }}>{children}</span>;
}

// ============================================================
// RIGHT — Node header + tabs
// ============================================================
function NodeHeader({ name = "Zapopan", isActive = true }) {
  return (
    <div style={rg.nodeHead}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={rg.nodeBreadcrumb}>
          <span>México</span>
          <Ic name="chevron-right" size={11} color="#9CA3AF" />
          <span>ZMG</span>
          <Ic name="chevron-right" size={11} color="#9CA3AF" />
          <span style={{ color: "#0E2C56", fontWeight: 500 }}>{name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
          <h2 style={rg.nodeName}>{name}</h2>
          <span style={{ ...rg.nodeBadge, background: "#E5F7EE", color: "#18A66A" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#18A66A" }} />
            {isActive ? "Activa" : "Inactiva"}
          </span>
        </div>
      </div>
      <div style={rg.toggleField}>
        <span style={{ fontSize: 12.5, color: "#6B7280" }}>Región activa</span>
        <div style={{ ...rg.toggle, ...rg.toggleOn }}>
          <span style={{ ...rg.toggleKnob, ...rg.toggleKnobOn }} />
        </div>
      </div>
      <button style={rg.btnGhost}><Ic name="copy" size={14} color="#0E2C56" style={{ marginRight: 8 }} />Duplicar</button>
      <button style={rg.btnDanger}><Ic name="trash-2" size={14} color="#DC2626" style={{ marginRight: 8 }} />Eliminar</button>
      <button style={rg.btnPrimary}><Ic name="check" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />Guardar</button>
    </div>
  );
}

function NodeTabs({ active = "map" }) {
  const tabs = [
    { id: "map",      label: "Mapa",          icon: "map" },
    { id: "list",     label: "Colonias",      icon: "list", count: 198 },
    { id: "config",   label: "Configuración", icon: "settings" },
    { id: "stats",    label: "Estadísticas",  icon: "bar-chart-3" },
  ];
  return (
    <div style={rg.tabsRow}>
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <div key={t.id} style={{ ...rg.tab, ...(isActive ? rg.tabActive : null) }}>
            <Ic name={t.icon} size={14} color={isActive ? "#0A6BCF" : "#6B7280"} />
            <span>{t.label}</span>
            {t.count != null && (
              <span style={{ ...rg.tabCount, ...(isActive ? { background: "rgba(10,107,207,0.12)", color: "#0A6BCF" } : null) }}>
                {t.count}
              </span>
            )}
            {isActive && <span style={rg.tabUnderline} />}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// MAP — Zapopan polygon view
// ============================================================
function ZapopanMap() {
  return (
    <div style={rg.mapCard}>
      {/* Toolbar */}
      <div style={rg.mapToolbar}>
        <div style={rg.toolGroup}>
          <ToolBtn icon="hand" tip="Mover" />
          <ToolBtn icon="pen-tool" tip="Polígono nuevo" selected />
          <ToolBtn icon="circle" tip="Círculo" />
          <ToolBtn icon="map-pin" tip="Pin" />
          <div style={rg.toolSep} />
          <ToolBtn icon="undo-2" tip="Deshacer" />
          <ToolBtn icon="trash-2" tip="Limpiar" danger />
        </div>
        <button style={rg.mapEditBtn}>
          <Ic name="pencil" size={13} color="#FFFFFF" style={{ marginRight: 6 }} />
          Editar polígono
        </button>
      </div>

      {/* Map */}
      <div style={{ position: "relative", width: "100%", height: 560 }}>
        <svg viewBox="0 0 1000 560" width="100%" height={560} style={{ background: "#DDE7F1", display: "block" }}>
          <defs>
            <pattern id="rgGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0 L0 0 0 40" fill="none" stroke="#CCD7E5" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="1000" height="560" fill="url(#rgGrid)" />

          {/* Neighbor cities (subtle) */}
          <path d="M520 180 Q 640 130 800 160 Q 880 210 850 320 Q 760 400 660 380 Q 540 350 520 280 Z"
                fill="rgba(255,255,255,0.5)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
          <text x="700" y="270" textAnchor="middle" fontSize="13" fontFamily="Inter" fontWeight="600" fill="#9CA3AF">Guadalajara</text>

          <path d="M620 410 Q 720 400 820 440 Q 850 500 760 530 Q 660 540 620 510 Q 590 460 620 410 Z"
                fill="rgba(255,255,255,0.5)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
          <text x="710" y="475" textAnchor="middle" fontSize="11" fontFamily="Inter" fontWeight="600" fill="#9CA3AF">Tlaquepaque</text>

          {/* ZAPOPAN main polygon */}
          <path
            d="M60 130 Q 140 80 280 90 Q 380 105 460 140 Q 520 175 510 240 Q 540 320 480 380 Q 380 410 280 395 Q 160 380 90 320 Q 30 260 50 200 Z"
            fill="rgba(10,107,207,0.18)"
            stroke="#0A6BCF"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Polygon vertices (handles) */}
          {[[60,130],[280,90],[460,140],[510,240],[480,380],[280,395],[90,320],[50,200]].map(([x,y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="6" fill="#FFFFFF" stroke="#0A6BCF" strokeWidth="2" />
              <circle cx={x} cy={y} r="2" fill="#0A6BCF" />
            </g>
          ))}

          {/* Roads */}
          <path d="M0 250 Q 250 240 600 270 Q 850 290 1000 280" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.9" />
          <path d="M250 0 Q 270 250 290 560" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />
          <path d="M420 0 Q 410 220 460 560" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.75" />

          {/* City label */}
          <text x="270" y="220" textAnchor="middle" fontSize="24" fontFamily="Manrope" fontWeight="700" fill="#0A6BCF" opacity="0.85" letterSpacing="0.5">ZAPOPAN</text>

          {/* Neighborhood labels with dots */}
          <NeighborhoodMarker x={140} y={185} name="Andares" jobs={142} />
          <NeighborhoodMarker x={230} y={155} name="Valle Real" jobs={118} />
          <NeighborhoodMarker x={340} y={195} name="Providencia" jobs={168} hot />
          <NeighborhoodMarker x={400} y={260} name="Country Club" jobs={96} />
          <NeighborhoodMarker x={210} y={295} name="Las Águilas" jobs={72} />
          <NeighborhoodMarker x={130} y={250} name="Vallarta Univ." jobs={102} />
          <NeighborhoodMarker x={310} y={320} name="Bugambilias" jobs={54} dim />
          <NeighborhoodMarker x={380} y={350} name="Plaza del Sol" jobs={84} />

          {/* Technician pins clustered */}
          {SAMPLE_PINS.map((p, i) => <Pin key={i} {...p} />)}
        </svg>

        {/* Floating layers panel */}
        <div style={rg.layersPanel}>
          <div style={rg.layersHead}>
            <Ic name="layers" size={14} color="#0E2C56" />
            <span>Capas</span>
          </div>
          <LayerToggle icon="hard-hat" color="#0A6BCF" label="Técnicos activos" sub="318 técnicos" on />
          <LayerToggle icon="flame" color="#F59E0B" label="Demanda última semana" sub="1,084 servicios" on />
          <LayerToggle icon="hexagon" color="#18A66A" label="Polígonos de colonias" sub="14 visibles" on />
          <LayerToggle icon="route" color="#0884B0" label="Rutas frecuentes" sub="oculto" />
          <div style={rg.layersFoot}>
            <span style={{ fontSize: 10.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>
              <span style={rg.liveDot} /> Actualizado hace 28 s
            </span>
          </div>
        </div>

        {/* Zoom controls */}
        <div style={rg.zoomCtl}>
          <button style={rg.zoomBtn}><Ic name="plus" size={14} color="#0E2C56" /></button>
          <button style={rg.zoomBtn}><Ic name="minus" size={14} color="#0E2C56" /></button>
          <button style={rg.zoomBtn}><Ic name="locate-fixed" size={14} color="#0A6BCF" /></button>
        </div>

        {/* Scale + coords */}
        <div style={rg.mapMeta}>
          <span>20.7° N · 103.4° W</span>
          <span style={rg.scaleBar} />
          <span>2 km</span>
        </div>
      </div>

      {/* Legend */}
      <div style={rg.legend}>
        <LegendItem dot="#0A6BCF" label="Polígono Zapopan" n="151 km²" />
        <LegendItem dot="#F59E0B" label="Alta demanda" n="3 colonias" />
        <LegendItem dot="#18A66A" label="Cobertura completa" n="12 de 14" />
        <LegendItem dot="#9CA3AF" label="Cobertura parcial" n="2 colonias" />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14, fontSize: 12, color: "#6B7280" }}>
          <span><b style={{ color: "#0E2C56", fontWeight: 600 }}>318</b> técnicos · <b style={{ color: "#0E2C56", fontWeight: 600 }}>198</b> colonias</span>
        </div>
      </div>
    </div>
  );
}

const SAMPLE_PINS = [
  { x: 130, y: 165, tone: "ok" },{ x: 145, y: 195, tone: "ok" },{ x: 155, y: 175, tone: "ok" },
  { x: 220, y: 145, tone: "ok" },{ x: 240, y: 165, tone: "ok" },
  { x: 330, y: 175, tone: "warn" },{ x: 350, y: 205, tone: "ok" },{ x: 360, y: 185, tone: "ok" },
  { x: 390, y: 245, tone: "ok" },{ x: 410, y: 265, tone: "ok" },
  { x: 195, y: 285, tone: "ok" },{ x: 220, y: 305, tone: "ok" },
  { x: 105, y: 235, tone: "ok" },{ x: 130, y: 260, tone: "ok" },
  { x: 295, y: 310, tone: "warn" },{ x: 380, y: 340, tone: "ok" },{ x: 360, y: 360, tone: "ok" },
  { x: 250, y: 220, tone: "ok" },{ x: 280, y: 240, tone: "ok" },{ x: 200, y: 220, tone: "ok" },
];

function Pin({ x, y, tone }) {
  const c = tone === "warn" ? "#F59E0B" : "#0A6BCF";
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r="5" fill={c} stroke="#FFFFFF" strokeWidth="1.5" />
    </g>
  );
}

function NeighborhoodMarker({ x, y, name, jobs, hot = false, dim = false }) {
  const ringColor = hot ? "#F59E0B" : "#0A6BCF";
  return (
    <g transform={`translate(${x},${y})`} opacity={dim ? 0.55 : 1}>
      <circle r={hot ? 18 : 14} fill={ringColor} opacity="0.15" />
      <circle r={hot ? 8 : 6} fill={ringColor} stroke="#FFFFFF" strokeWidth="2" />
      <text x="0" y="-22" textAnchor="middle" fontSize="11" fontFamily="Inter" fontWeight="600" fill="#0E2C56">{name}</text>
      <text x="0" y="-9" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="#6B7280">{jobs} svc</text>
    </g>
  );
}

function ToolBtn({ icon, tip, selected, danger }) {
  return (
    <button title={tip} style={{
      ...rg.toolBtn,
      ...(selected ? rg.toolBtnSel : null),
      ...(danger ? { color: "#DC2626" } : null),
    }}>
      <Ic name={icon} size={14} color={selected ? "#FFFFFF" : (danger ? "#DC2626" : "#0E2C56")} />
    </button>
  );
}

function LayerToggle({ icon, color, label, sub, on }) {
  return (
    <div style={rg.layerRow}>
      <div style={{ ...rg.layerIcon, background: `${color}1F` }}>
        <Ic name={icon} size={13} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#0E2C56" }}>{label}</div>
        <div style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 1 }}>{sub}</div>
      </div>
      <div style={{ ...rg.toggleMini, ...(on ? rg.toggleMiniOn : null) }}>
        <span style={{ ...rg.toggleMiniKnob, ...(on ? rg.toggleMiniKnobOn : null) }} />
      </div>
    </div>
  );
}

function LegendItem({ dot, label, n }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#6B7280" }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot }} />
      <span>{label}</span>
      <b style={{ color: "#0E2C56", fontWeight: 600 }}>{n}</b>
    </div>
  );
}

// ============================================================
// COLONIAS — table
// ============================================================
function ColoniasTable() {
  return (
    <div style={rg.colCard}>
      <div style={rg.colHead}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#0E2C56" }}>198 colonias en Zapopan</div>
          <div style={{ fontSize: 12.5, color: "#6B7280", marginTop: 3 }}>
            <b style={{ color: "#18A66A", fontWeight: 600 }}>194 activas</b> · <b style={{ color: "#6B7280", fontWeight: 600 }}>4 inactivas</b> · CP principales
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ ...rg.inputWrap, width: 240 }}>
            <Ic name="search" size={14} color="#9CA3AF" style={{ marginLeft: 12 }} />
            <input placeholder="Buscar colonia o CP" style={rg.input} />
          </div>
          <button style={rg.btnGhost}><Ic name="filter" size={13} color="#0E2C56" style={{ marginRight: 6 }} />Filtros</button>
          <button style={rg.btnSecondary}><Ic name="plus" size={13} color="#0A6BCF" style={{ marginRight: 6 }} />Agregar colonia</button>
        </div>
      </div>

      <div style={rg.bulkBar}>
        <input type="checkbox" style={rg.checkbox} defaultChecked />
        <span style={{ fontSize: 12.5, color: "#0E2C56", fontWeight: 500 }}>3 seleccionadas</span>
        <button style={rg.bulkBtn}><Ic name="check-circle-2" size={12} color="#18A66A" style={{ marginRight: 5 }} />Activar</button>
        <button style={rg.bulkBtn}><Ic name="ban" size={12} color="#6B7280" style={{ marginRight: 5 }} />Desactivar</button>
        <button style={rg.bulkBtn}><Ic name="user-cog" size={12} color="#0A6BCF" style={{ marginRight: 5 }} />Asignar técnicos</button>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#9CA3AF" }}>Acciones bulk disponibles</span>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#F8FBFF" }}>
            <th style={{ ...rg.th, width: 32, paddingLeft: 18 }}><input type="checkbox" style={rg.checkbox} /></th>
            <th style={rg.th}>Colonia</th>
            <th style={rg.th}>CP principal</th>
            <th style={{ ...rg.th, textAlign: "right" }}>Técnicos</th>
            <th style={{ ...rg.th, textAlign: "right" }}>Servicios último mes</th>
            <th style={{ ...rg.th, textAlign: "center", width: 90 }}>Activa</th>
            <th style={{ ...rg.th, width: 60 }}></th>
          </tr>
        </thead>
        <tbody>
          {ZAPOPAN_NEIGHBORHOODS.map((n, i) => (
            <tr key={i} style={{ ...rg.tr, ...(!n.active ? { background: "rgba(245,158,11,0.03)" } : null) }}>
              <td style={{ ...rg.td, paddingLeft: 18 }}><input type="checkbox" style={rg.checkbox} defaultChecked={i < 3} /></td>
              <td style={{ ...rg.td, fontSize: 13, color: "#0E2C56", fontWeight: 500 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Ic name="map-pin" size={13} color={n.active ? "#0A6BCF" : "#9CA3AF"} />
                  {n.name}
                </div>
              </td>
              <td style={{ ...rg.td, fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: "#6B7280" }}>{n.cp}</td>
              <td style={{ ...rg.td, textAlign: "right", fontSize: 13, color: "#0E2C56", fontWeight: 500 }}>{n.techs}</td>
              <td style={{ ...rg.td, textAlign: "right", fontSize: 13, color: "#0E2C56", fontWeight: 500, fontFamily: "'Manrope', sans-serif" }}>{n.jobs}</td>
              <td style={{ ...rg.td, textAlign: "center" }}>
                <div style={{ ...rg.toggleMini, ...(n.active ? rg.toggleMiniOn : null), margin: "0 auto" }}>
                  <span style={{ ...rg.toggleMiniKnob, ...(n.active ? rg.toggleMiniKnobOn : null) }} />
                </div>
              </td>
              <td style={rg.td}>
                <button style={rg.iconBtnSm}><Ic name="more-vertical" size={14} color="#6B7280" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={rg.tableFooter}>
        <span style={{ fontSize: 12.5, color: "#6B7280" }}>
          Mostrando <b style={{ color: "#0E2C56", fontWeight: 600 }}>1 – 14</b> de <b style={{ color: "#0E2C56", fontWeight: 600 }}>198</b> colonias
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button style={rg.pageBtn} disabled><Ic name="chevron-left" size={14} color="#9CA3AF" /></button>
          <button style={{ ...rg.pageBtn, ...rg.pageBtnActive }}>1</button>
          <button style={rg.pageBtn}>2</button>
          <button style={rg.pageBtn}>3</button>
          <span style={{ padding: "0 4px", color: "#9CA3AF", fontSize: 13 }}>…</span>
          <button style={rg.pageBtn}>15</button>
          <button style={rg.pageBtn}><Ic name="chevron-right" size={14} color="#0E2C56" /></button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// EMPTY — Mexico-wide map
// ============================================================
function MexicoEmptyState() {
  return (
    <div style={rg.emptyCard}>
      <div style={{ position: "relative", width: "100%", height: 520 }}>
        <svg viewBox="0 0 1000 520" width="100%" height={520} style={{ background: "#DDE7F1", display: "block" }}>
          <defs>
            <pattern id="rgGridMx" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0 L0 0 0 40" fill="none" stroke="#CCD7E5" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="1000" height="520" fill="url(#rgGridMx)" />

          {/* Stylized Mexico */}
          <path d="M150 110 Q 200 80 290 95 Q 380 110 450 140 Q 530 165 580 220 Q 640 250 700 290 Q 760 320 820 380 Q 870 430 830 470 Q 760 480 710 460 Q 640 430 590 410 Q 530 395 480 380 Q 410 360 360 340 Q 290 320 240 300 Q 190 280 160 240 Q 130 200 145 160 Z"
                fill="rgba(255,255,255,0.55)" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" strokeLinejoin="round" />

          {/* ZMG highlighted */}
          <circle cx="430" cy="290" r="32" fill="rgba(10,107,207,0.25)" stroke="#0A6BCF" strokeWidth="2.5" />
          <circle cx="430" cy="290" r="10" fill="#0A6BCF" stroke="#FFFFFF" strokeWidth="2.5" />
          <text x="430" y="252" textAnchor="middle" fontSize="14" fontFamily="Inter" fontWeight="700" fill="#0A6BCF">ZMG</text>
          <text x="430" y="338" textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono" fill="#0A6BCF">activa</text>

          {/* CDMX */}
          <circle cx="560" cy="320" r="14" fill="rgba(156,163,175,0.25)" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="560" cy="320" r="5" fill="#9CA3AF" stroke="#FFFFFF" strokeWidth="2" />
          <text x="560" y="350" textAnchor="middle" fontSize="11" fontFamily="Inter" fontWeight="600" fill="#6B7280">CDMX</text>
          <text x="560" y="365" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="#9CA3AF">Q3 2026</text>

          {/* Monterrey */}
          <circle cx="475" cy="170" r="14" fill="rgba(156,163,175,0.25)" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="475" cy="170" r="5" fill="#9CA3AF" stroke="#FFFFFF" strokeWidth="2" />
          <text x="475" y="200" textAnchor="middle" fontSize="11" fontFamily="Inter" fontWeight="600" fill="#6B7280">Monterrey</text>
          <text x="475" y="215" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="#9CA3AF">Q4 2026</text>

          {/* Title overlay */}
          <text x="120" y="455" fontFamily="Manrope" fontSize="28" fontWeight="700" fill="#0E2C56" opacity="0.95">México</text>
          <text x="120" y="480" fontFamily="Inter" fontSize="13" fontWeight="500" fill="#6B7280">1 región activa · 2 próximamente</text>
        </svg>

        {/* Centered card */}
        <div style={rg.emptyCard2}>
          <div style={rg.emptyIllu}><Ic name="map-pin" size={28} color="#0A6BCF" /></div>
          <h3 style={rg.emptyH3}>Selecciona una región para configurarla</h3>
          <p style={rg.emptyP}>
            Elige una ciudad o colonia del árbol izquierdo para editar su polígono, colonias incluidas, configuración y comisiones.
          </p>
          <button style={rg.btnPrimary}><Ic name="plus" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />Nueva región operativa</button>
        </div>
      </div>

      {/* Foot stats */}
      <div style={rg.emptyStats}>
        <Stat val="1" label="País activo" tone="ok" />
        <Stat val="6" label="Ciudades operativas" tone="ok" />
        <Stat val="758" label="Colonias cubiertas" />
        <Stat val="1,030" label="Técnicos en operación" />
        <Stat val="+2" label="Regiones en planeación" tone="muted" />
      </div>
    </div>
  );
}

function Stat({ val, label, tone }) {
  const c = tone === "ok" ? "#18A66A" : tone === "muted" ? "#9CA3AF" : "#0E2C56";
  return (
    <div style={rg.statTile}>
      <div style={{ ...rg.statVal, color: c }}>{val}</div>
      <div style={rg.statLabel}>{label}</div>
    </div>
  );
}

// ============================================================
// PAGE COMPOSITIONS
// ============================================================
function PageHeader({ extra = null }) {
  return (
    <div style={rg.pageHead}>
      <div>
        <h1 style={rg.h1}>Regiones operativas</h1>
        <p style={rg.sub}>Define dónde opera la plataforma. Jerarquía: País → Región → Ciudad → Colonia.</p>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {extra}
        <button style={rg.btnGhost}><Ic name="upload" size={14} color="#0E2C56" style={{ marginRight: 8 }} />Importar GeoJSON</button>
        <button style={rg.btnPrimary}><Ic name="plus" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />Nueva región</button>
      </div>
    </div>
  );
}

function ScreenZapopan({ tab = "map" }) {
  return (
    <div style={{ display: "flex", width: 1440, height: 1400, background: "#F8FBFF", fontFamily: "'Inter', sans-serif" }}>
      <AdminSidebar active="regions" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AdminHeader crumbs={["Inicio", "Regiones y cobertura"]} />
        <main style={rg.main}>
          <PageHeader />
          <div style={rg.split}>
            <Tree selectedId="zap" />
            <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 18 }}>
              <NodeHeader name="Zapopan" />
              <NodeTabs active={tab} />
              {tab === "map" && <ZapopanMap />}
              {tab === "list" && <ColoniasTable />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function ScreenEmpty() {
  return (
    <div style={{ display: "flex", width: 1440, height: 1100, background: "#F8FBFF", fontFamily: "'Inter', sans-serif" }}>
      <AdminSidebar active="regions" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AdminHeader crumbs={["Inicio", "Regiones y cobertura"]} />
        <main style={rg.main}>
          <PageHeader />
          <div style={rg.split}>
            <Tree selectedId={null} />
            <MexicoEmptyState />
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="regions" title="Regiones y cobertura" subtitle="Mapa · colonias · estado vacío">
        <DCArtboard id="map" label="Zapopan · Mapa con polígono" width={1440} height={1400}>
          <ScreenZapopan tab="map" />
        </DCArtboard>
        <DCArtboard id="colonias" label="Zapopan · Tabla de colonias" width={1440} height={1400}>
          <ScreenZapopan tab="list" />
        </DCArtboard>
        <DCArtboard id="empty" label="Estado vacío · México" width={1440} height={1100}>
          <ScreenEmpty />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// ============================================================
// STYLES
// ============================================================
const rg = {
  main: { flex: 1, padding: "28px 32px 40px", display: "flex", flexDirection: "column", gap: 24, color: "#0E2C56" },
  pageHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  h1: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 28, margin: 0, letterSpacing: "-0.01em" },
  sub: { fontSize: 13.5, color: "#6B7280", margin: "4px 0 0" },
  btnPrimary: { background: "#0A6BCF", color: "#FFFFFF", border: "1px solid #0A6BCF", borderRadius: 10, padding: "10px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", boxShadow: "0 1px 2px rgba(10,107,207,0.25)" },
  btnSecondary: { background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #0A6BCF", borderRadius: 10, padding: "9px 13px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  btnGhost: { background: "#FFFFFF", color: "#0E2C56", border: "1px solid #E1E8F0", borderRadius: 10, padding: "10px 14px", fontWeight: 500, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  btnDanger: { background: "#FFFFFF", color: "#DC2626", border: "1px solid #DC2626", borderRadius: 10, padding: "10px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center" },

  split: { display: "grid", gridTemplateColumns: "340px 1fr", gap: 24, alignItems: "flex-start" },

  /* Tree */
  treeCard: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, overflow: "hidden" },
  treeHead: { padding: "16px 16px 12px", borderBottom: "1px solid #F0F4F9", display: "flex", flexDirection: "column", gap: 10 },
  treeFilters: { display: "flex", gap: 6, flexWrap: "wrap" },
  inputWrap: { display: "flex", alignItems: "center", height: 36, background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 8 },
  input: { flex: 1, border: "none", outline: "none", background: "transparent", padding: "0 12px", fontSize: 13, color: "#0E2C56", height: "100%" },
  chip: { fontSize: 11.5, padding: "3px 9px", borderRadius: 999, background: "#F8FBFF", color: "#6B7280", border: "1px solid #E1E8F0", cursor: "pointer", fontWeight: 500 },
  chipSelected: { background: "rgba(10,107,207,0.10)", color: "#0A6BCF", border: "1px solid rgba(10,107,207,0.3)", fontWeight: 600 },
  treeBody: { padding: "8px 0 14px" },
  treeRow: { display: "flex", alignItems: "center", gap: 8, padding: "6px 12px 6px 0", borderLeft: "3px solid transparent" },
  treeRowSelected: { background: "rgba(10,107,207,0.06)", borderLeftColor: "#0A6BCF" },
  treeChevron: { width: 20, height: 20, background: "transparent", border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  treeIcon: { width: 24, height: 24, borderRadius: 6, background: "#F8FBFF", display: "grid", placeItems: "center", flexShrink: 0 },
  treeBadge: { display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 999, fontSize: 10.5, fontWeight: 600 },
  treeMore: { background: "transparent", border: "none", color: "#0A6BCF", fontSize: 11.5, fontWeight: 500, cursor: "pointer", padding: 0, display: "inline-flex", alignItems: "center" },

  /* Node header */
  nodeHead: { display: "flex", alignItems: "center", gap: 12, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, padding: 20 },
  nodeBreadcrumb: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9CA3AF" },
  nodeName: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 28, margin: 0, color: "#0E2C56", letterSpacing: "-0.01em" },
  nodeBadge: { display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600 },
  toggleField: { display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 10 },

  /* Tabs */
  tabsRow: { display: "flex", gap: 22, borderBottom: "1px solid #E1E8F0" },
  tab: { position: "relative", display: "flex", alignItems: "center", gap: 8, padding: "10px 2px 13px", fontSize: 13.5, fontWeight: 500, color: "#6B7280", cursor: "pointer" },
  tabActive: { color: "#0A6BCF", fontWeight: 600 },
  tabCount: { fontSize: 11, padding: "1px 7px", borderRadius: 999, background: "#EEF3F8", color: "#6B7280", fontWeight: 600 },
  tabUnderline: { position: "absolute", left: 0, right: 0, bottom: -1, height: 2, background: "#0A6BCF", borderRadius: 2 },

  /* Map */
  mapCard: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, overflow: "hidden" },
  mapToolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#FBFDFF", borderBottom: "1px solid #E1E8F0" },
  toolGroup: { display: "flex", alignItems: "center", gap: 4, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10, padding: 4 },
  toolBtn: { background: "transparent", border: "none", padding: 7, borderRadius: 7, cursor: "pointer", display: "grid", placeItems: "center" },
  toolBtnSel: { background: "#0A6BCF", color: "#FFFFFF" },
  toolSep: { width: 1, height: 18, background: "#E1E8F0", margin: "0 4px" },
  mapEditBtn: { background: "#0A6BCF", color: "#FFFFFF", border: "1px solid #0A6BCF", borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 12.5, cursor: "pointer", display: "inline-flex", alignItems: "center", boxShadow: "0 1px 2px rgba(10,107,207,0.25)" },

  layersPanel: { position: "absolute", top: 16, right: 16, width: 240, background: "rgba(255,255,255,0.96)", backdropFilter: "blur(4px)", border: "1px solid #E1E8F0", borderRadius: 12, boxShadow: "0 8px 20px rgba(14,44,86,0.10)", padding: 12 },
  layersHead: { display: "flex", alignItems: "center", gap: 8, padding: "0 4px 10px", fontSize: 12, color: "#0E2C56", fontWeight: 600, borderBottom: "1px solid #F0F4F9" },
  layerRow: { display: "flex", alignItems: "center", gap: 10, padding: "8px 4px" },
  layerIcon: { width: 26, height: 26, borderRadius: 6, display: "grid", placeItems: "center", flexShrink: 0 },
  layersFoot: { borderTop: "1px solid #F0F4F9", paddingTop: 8, marginTop: 6, fontSize: 11, color: "#9CA3AF" },
  liveDot: { display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#18A66A", boxShadow: "0 0 0 3px rgba(24,166,106,0.18)", marginRight: 5 },

  zoomCtl: { position: "absolute", left: 16, bottom: 60, display: "flex", flexDirection: "column", gap: 0, background: "#FFFFFF", borderRadius: 10, overflow: "hidden", border: "1px solid #E1E8F0", boxShadow: "0 4px 12px rgba(14,44,86,0.08)" },
  zoomBtn: { background: "#FFFFFF", border: "none", borderBottom: "1px solid #E1E8F0", padding: 8, cursor: "pointer", display: "grid", placeItems: "center" },
  mapMeta: { position: "absolute", left: 16, bottom: 14, display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "#0E2C56", background: "rgba(255,255,255,0.85)", padding: "4px 10px", borderRadius: 6, fontFamily: "'JetBrains Mono', monospace" },
  scaleBar: { display: "inline-block", width: 30, height: 2, background: "#0E2C56" },

  legend: { display: "flex", alignItems: "center", gap: 18, padding: "12px 18px", background: "#FBFDFF", borderTop: "1px solid #E1E8F0", flexWrap: "wrap" },

  /* Colonias table */
  colCard: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, overflow: "hidden" },
  colHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px 22px", borderBottom: "1px solid #F0F4F9" },
  bulkBar: { display: "flex", alignItems: "center", gap: 10, padding: "10px 22px", background: "rgba(10,107,207,0.04)", borderBottom: "1px solid rgba(10,107,207,0.18)" },
  bulkBtn: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 7, padding: "5px 10px", fontSize: 12, fontWeight: 500, color: "#0E2C56", cursor: "pointer", display: "inline-flex", alignItems: "center" },
  checkbox: { width: 16, height: 16, accentColor: "#0A6BCF" },
  th: { textAlign: "left", padding: "10px 14px", fontSize: 11, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", borderBottom: "1px solid #E1E8F0" },
  tr: { borderBottom: "1px solid #F0F4F9", height: 50 },
  td: { padding: "10px 14px", fontSize: 13, color: "#0E2C56", verticalAlign: "middle" },
  iconBtnSm: { background: "transparent", border: "1px solid transparent", padding: 6, borderRadius: 7, cursor: "pointer", display: "inline-grid", placeItems: "center" },
  tableFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 22px", borderTop: "1px solid #E1E8F0" },
  pageBtn: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 8, padding: "6px 11px", fontSize: 13, fontWeight: 500, color: "#0E2C56", cursor: "pointer", minWidth: 32, height: 30, display: "inline-grid", placeItems: "center" },
  pageBtnActive: { background: "#0A6BCF", color: "#FFFFFF", borderColor: "#0A6BCF" },

  /* Toggles */
  toggle: { position: "relative", width: 42, height: 24, borderRadius: 999, background: "#E1E8F0", flexShrink: 0 },
  toggleOn: { background: "#0A6BCF" },
  toggleKnob: { position: "absolute", left: 3, top: 3, width: 18, height: 18, borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 1px 2px rgba(14,44,86,0.18)" },
  toggleKnobOn: { transform: "translateX(18px)" },
  toggleMini: { position: "relative", width: 30, height: 18, borderRadius: 999, background: "#E1E8F0" },
  toggleMiniOn: { background: "#0A6BCF" },
  toggleMiniKnob: { position: "absolute", left: 2, top: 2, width: 14, height: 14, borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 1px 2px rgba(14,44,86,0.18)" },
  toggleMiniKnobOn: { transform: "translateX(12px)" },

  /* Empty */
  emptyCard: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, overflow: "hidden" },
  emptyCard2: { position: "absolute", right: 30, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.96)", backdropFilter: "blur(4px)", border: "1px solid #E1E8F0", borderRadius: 14, padding: 28, width: 340, boxShadow: "0 16px 40px rgba(14,44,86,0.12)" },
  emptyIllu: { width: 56, height: 56, borderRadius: 14, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", marginBottom: 16 },
  emptyH3: { fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 18, color: "#0E2C56", margin: "0 0 8px" },
  emptyP: { fontSize: 13.5, color: "#6B7280", lineHeight: 1.5, margin: "0 0 18px" },
  emptyStats: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, padding: "20px 24px", borderTop: "1px solid #E1E8F0", background: "#FBFDFF" },
  statTile: {},
  statVal: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 26, color: "#0E2C56", letterSpacing: "-0.01em", lineHeight: 1 },
  statLabel: { fontSize: 11.5, color: "#6B7280", marginTop: 6 },
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
