/* global React, ReactDOM, AdminIc, AdminSidebar, AdminHeader */
const { useState } = React;
const Ic = AdminIc;

// ============================================================
// DATA
// ============================================================
const CATEGORIES = [
  { id: "plomeria",      name: "Plomería",            icon: "wrench",         subs: 6, featured: true,  active: true },
  { id: "electricidad",  name: "Electricidad",        icon: "zap",            subs: 5, featured: true,  active: true },
  { id: "cristales",     name: "Cristales",           icon: "square",         subs: 4, featured: false, active: true },
  { id: "gas",           name: "Gas",                 icon: "flame",          subs: 3, featured: false, active: true },
  { id: "herreria",      name: "Herrería",            icon: "hammer",         subs: 5, featured: false, active: true },
  { id: "drenaje",       name: "Drenaje",             icon: "droplets",       subs: 4, featured: false, active: true },
  { id: "pintura",       name: "Pintura",             icon: "paint-roller",   subs: 4, featured: true,  active: true },
  { id: "pisos",         name: "Pisos",               icon: "square-stack",   subs: 3, featured: false, active: false },
  { id: "imper",         name: "Impermeabilización",  icon: "umbrella",       subs: 3, featured: false, active: true },
  { id: "plagas",        name: "Control de plagas",   icon: "bug",            subs: 4, featured: false, active: true },
];

const PLOMERIA_SUBS = [
  { name: "Fugas residenciales",       desc: "Detección y reparación de fugas visibles en tuberías", min: 350,  max: 1800, sug: 850,  active: true,  jobs: 312 },
  { name: "Calentadores de paso/depósito", desc: "Instalación, reparación y mantenimiento",          min: 600,  max: 3500, sug: 1400, active: true,  jobs: 184 },
  { name: "Drenaje de cocina",         desc: "Destapes y limpieza de sifones y trampas de grasa",   min: 400,  max: 1500, sug: 720,  active: true,  jobs: 96 },
  { name: "Instalación de WC",         desc: "Cambio o instalación nueva con conexiones",           min: 800,  max: 2200, sug: 1250, active: true,  jobs: 58 },
  { name: "Cambio de llaves de paso",  desc: "Sustitución de llaves bajo lavabo, lavadora, etc.",   min: 250,  max: 900,  sug: 480,  active: true,  jobs: 42 },
  { name: "Cisternas y tinacos",       desc: "Limpieza, sellado y mantenimiento integral",          min: 900,  max: 4500, sug: 1900, active: false, jobs: 18 },
];

const REGIONS_OVERRIDE = [
  { region: "Guadalajara · Centro",   min: 380, max: 1900, sug: 880, override: true  },
  { region: "Zapopan · Andares",      min: 450, max: 2400, sug: 1100, override: true },
  { region: "Tlaquepaque · Centro",   min: 320, max: 1500, sug: 720, override: false },
  { region: "Tlajomulco · Cabecera",  min: 300, max: 1400, sug: 650, override: false },
];

const EXTRAS_PREDEF = [
  { label: "Cambio de llave de paso 1/2\"", price: 250 },
  { label: "Sellado epóxico en codo",       price: 150 },
  { label: "Limpieza profunda de drenaje",  price: 320 },
  { label: "Sustitución de empaques",       price: 90  },
  { label: "Cambio de manguera flexible",   price: 180 },
];

const ACCENT_COLORS = [
  { value: "#0A6BCF", name: "Primary" },
  { value: "#0E2C56", name: "Navy" },
  { value: "#18C1FF", name: "Cyan" },
  { value: "#0894EA", name: "Sky" },
];

const ICON_GALLERY = [
  "wrench", "zap", "square", "flame", "hammer", "droplets", "paint-roller",
  "square-stack", "umbrella", "bug", "key", "settings", "shovel", "thermometer",
];

// ============================================================
// LEFT — Category list
// ============================================================
function CategoryList({ activeId, onSelect }) {
  return (
    <aside style={ct.leftCard}>
      <div style={ct.leftHead}>
        <div style={{ ...ct.inputWrap }}>
          <Ic name="search" size={14} color="#9CA3AF" style={{ marginLeft: 12 }} />
          <input placeholder="Buscar categoría…" style={ct.input} />
        </div>
        <div style={ct.countLabel}><b style={{ color: "#0E2C56", fontWeight: 600 }}>10</b> categorías · <b style={{ color: "#18A66A", fontWeight: 600 }}>9</b> activas</div>
      </div>
      <div style={ct.list}>
        {CATEGORIES.map((c) => {
          const isActive = c.id === activeId;
          return (
            <div key={c.id} style={{ ...ct.row, ...(isActive ? ct.rowActive : null) }} onClick={() => onSelect(c.id)}>
              {isActive && <span style={ct.rowIndicator} />}
              <div style={{ ...ct.iconBox, ...(isActive ? { background: "rgba(10,107,207,0.16)" } : null) }}>
                <Ic name={c.icon} size={16} color="#0A6BCF" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13.5, fontWeight: isActive ? 600 : 500, color: "#0E2C56" }}>{c.name}</span>
                  {c.featured && <Ic name="star" size={12} color="#F59E0B" />}
                </div>
                <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 2 }}>{c.subs} subcategorías</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ ...ct.toggleMini, ...(c.active ? ct.toggleMiniOn : null) }}>
                  <span style={{ ...ct.toggleMiniKnob, ...(c.active ? ct.toggleMiniKnobOn : null) }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

// ============================================================
// RIGHT — Empty state
// ============================================================
function EmptyState() {
  return (
    <div style={ct.empty}>
      <div style={ct.emptyIllu}>
        <Ic name="folder-tree" size={56} color="#0A6BCF" />
      </div>
      <h3 style={ct.emptyH3}>Selecciona una categoría para editarla</h3>
      <p style={ct.emptyP}>
        Elige una categoría del panel izquierdo para configurar su ícono, descripción, subcategorías y precios.
        Los cambios se publican al instante en la app de los clientes.
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button style={ct.btnPrimary}><Ic name="plus" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />Crear primera categoría</button>
        <button style={ct.btnSecondary}><Ic name="upload" size={14} color="#0A6BCF" style={{ marginRight: 8 }} />Importar desde CSV</button>
      </div>
    </div>
  );
}

// ============================================================
// RIGHT — Plomería detail
// ============================================================
function CategoryDetail() {
  return (
    <div style={ct.right}>
      {/* Detail header */}
      <div style={ct.detailHead}>
        <div style={ct.bigIcon}>
          <Ic name="wrench" size={28} color="#0A6BCF" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={ct.editableName}>
            Plomería
            <Ic name="pencil" size={13} color="#9CA3AF" style={{ marginLeft: 8 }} />
          </div>
          <div style={{ fontSize: 12.5, color: "#6B7280", marginTop: 4, display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Ic name="hash" size={12} color="#9CA3AF" />
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>plomeria</span>
            </span>
            <span>·</span>
            <span>6 subcategorías</span>
            <span>·</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#18A66A", fontWeight: 600 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#18A66A" }} />
              710 servicios este mes
            </span>
          </div>
        </div>
        <div style={ct.toggleField}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 12, color: "#6B7280" }}>Estado</span>
            <span style={{ fontSize: 13, color: "#0E2C56", fontWeight: 600 }}>Activa</span>
          </div>
          <div style={{ ...ct.toggle, ...ct.toggleOn }}>
            <span style={{ ...ct.toggleKnob, ...ct.toggleKnobOn }} />
          </div>
        </div>
        <button style={ct.btnGhostDanger}>
          <Ic name="trash-2" size={14} color="#DC2626" style={{ marginRight: 8 }} />Eliminar
        </button>
      </div>

      {/* SECTION: Config general */}
      <Section num="01" title="Configuración general" icon="settings">
        <div style={ct.kvGrid}>
          <Field label="Nombre">
            <input style={ct.fieldInput} defaultValue="Plomería" />
          </Field>
          <Field label="Slug" hint="Autogenerado al cambiar el nombre">
            <input style={{ ...ct.fieldInput, fontFamily: "'JetBrains Mono', monospace" }} defaultValue="plomeria" />
          </Field>
          <Field label="Descripción corta" hint="Aparece en la tarjeta del catálogo. Máx 140 caracteres." span={2}>
            <textarea style={{ ...ct.fieldInput, minHeight: 64, resize: "vertical" }} defaultValue="Fugas, instalaciones, calentadores y drenaje doméstico. Técnicos certificados y refacciones de origen." />
            <div style={{ fontSize: 11, color: "#9CA3AF", textAlign: "right", marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
              108 / 140
            </div>
          </Field>
          <Field label="Ícono" span={1}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {ICON_GALLERY.slice(0, 9).map((i) => (
                <div key={i} style={{ ...ct.iconChoice, ...(i === "wrench" ? ct.iconChoiceSel : null) }}>
                  <Ic name={i} size={16} color={i === "wrench" ? "#FFFFFF" : "#0A6BCF"} />
                </div>
              ))}
              <div style={ct.iconChoice}><Ic name="ellipsis" size={16} color="#6B7280" /></div>
            </div>
          </Field>
          <Field label="Color de acento" span={1}>
            <div style={{ display: "flex", gap: 8 }}>
              {ACCENT_COLORS.map((c, i) => (
                <div key={c.value} style={{ ...ct.colorSwatch, background: c.value, ...(i === 0 ? ct.colorSwatchSel : null) }}>
                  {i === 0 && <Ic name="check" size={12} color="#FFFFFF" />}
                </div>
              ))}
            </div>
          </Field>
          <Field label="Orden en home">
            <input type="number" style={{ ...ct.fieldInput, width: 100 }} defaultValue="01" />
          </Field>
          <Field label="Destacar en home" hint="Aparece en el carrusel principal del cliente">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ ...ct.toggle, ...ct.toggleOn }}>
                <span style={{ ...ct.toggleKnob, ...ct.toggleKnobOn }} />
              </div>
              <Ic name="star" size={14} color="#F59E0B" />
              <span style={{ fontSize: 12.5, color: "#0E2C56", fontWeight: 500 }}>Sí, destacada</span>
            </div>
          </Field>
        </div>
      </Section>

      {/* SECTION: Subcategorías */}
      <Section num="02" title="Subcategorías" icon="list-checks" badge="6 subcategorías">
        <div style={ct.tableCard}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FBFF" }}>
                <th style={ct.th}>Nombre / descripción</th>
                <th style={{ ...ct.th, textAlign: "right" }}>Precio mín</th>
                <th style={{ ...ct.th, textAlign: "right" }}>Precio máx</th>
                <th style={{ ...ct.th, textAlign: "right" }}>Sugerido</th>
                <th style={{ ...ct.th, textAlign: "center", width: 80 }}>Servicios</th>
                <th style={{ ...ct.th, textAlign: "center", width: 80 }}>Activa</th>
                <th style={{ ...ct.th, width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {PLOMERIA_SUBS.map((s, i) => (
                <tr key={i} style={ct.tr}>
                  <td style={ct.td}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0E2C56" }}>{s.name}</div>
                    <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 2 }}>{s.desc}</div>
                  </td>
                  <td style={{ ...ct.td, textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: "#6B7280" }}>${s.min}</td>
                  <td style={{ ...ct.td, textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: "#6B7280" }}>${s.max.toLocaleString("es-MX")}</td>
                  <td style={{ ...ct.td, textAlign: "right", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 13, color: "#0E2C56" }}>
                    ${s.sug.toLocaleString("es-MX")}
                  </td>
                  <td style={{ ...ct.td, textAlign: "center", fontSize: 12, color: "#0E2C56", fontWeight: 500 }}>{s.jobs}</td>
                  <td style={{ ...ct.td, textAlign: "center" }}>
                    <div style={{ ...ct.toggleMini, ...(s.active ? ct.toggleMiniOn : null), margin: "0 auto" }}>
                      <span style={{ ...ct.toggleMiniKnob, ...(s.active ? ct.toggleMiniKnobOn : null) }} />
                    </div>
                  </td>
                  <td style={ct.td}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button style={ct.iconBtnSm}><Ic name="pencil" size={13} color="#0A6BCF" /></button>
                      <button style={ct.iconBtnSm}><Ic name="trash-2" size={13} color="#DC2626" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: "12px 16px", borderTop: "1px solid #E1E8F0", background: "#FBFDFF" }}>
            <button style={ct.dashedBtn}>
              <Ic name="plus" size={14} color="#0A6BCF" style={{ marginRight: 8 }} />Agregar subcategoría
            </button>
          </div>
        </div>
      </Section>

      {/* SECTION: Configuración por región */}
      <Section num="03" title="Configuración por región" icon="map" badge="Override en 2 regiones" collapsed={false}>
        <div style={{ fontSize: 12.5, color: "#6B7280", marginBottom: 12 }}>
          Define precios diferentes según la región operativa. Si una región no tiene override, hereda los precios base.
        </div>
        <div style={ct.tableCard}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FBFF" }}>
                <th style={ct.th}>Región</th>
                <th style={{ ...ct.th, textAlign: "right" }}>Precio mín</th>
                <th style={{ ...ct.th, textAlign: "right" }}>Precio máx</th>
                <th style={{ ...ct.th, textAlign: "right" }}>Sugerido</th>
                <th style={{ ...ct.th, textAlign: "center", width: 90 }}>Override</th>
                <th style={{ ...ct.th, width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {REGIONS_OVERRIDE.map((r, i) => (
                <tr key={i} style={ct.tr}>
                  <td style={{ ...ct.td, fontSize: 13, color: "#0E2C56", fontWeight: 500 }}>{r.region}</td>
                  <td style={{ ...ct.td, textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: "#6B7280" }}>${r.min}</td>
                  <td style={{ ...ct.td, textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: "#6B7280" }}>${r.max.toLocaleString("es-MX")}</td>
                  <td style={{ ...ct.td, textAlign: "right", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 13, color: "#0E2C56" }}>${r.sug.toLocaleString("es-MX")}</td>
                  <td style={{ ...ct.td, textAlign: "center" }}>
                    {r.override ? (
                      <span style={{ ...ct.badge, background: "#E0F6FF", color: "#0884B0" }}>activo</span>
                    ) : (
                      <span style={{ ...ct.badge, background: "#EEF3F8", color: "#6B7280" }}>hereda</span>
                    )}
                  </td>
                  <td style={ct.td}>
                    <button style={ct.iconBtnSm}><Ic name="pencil" size={13} color="#0A6BCF" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* SECTION: Comisión */}
      <Section num="04" title="Comisión específica" icon="percent">
        <div style={ct.commRow}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, color: "#0E2C56", fontWeight: 600 }}>¿Plomería usa comisión personalizada?</div>
            <div style={{ fontSize: 12.5, color: "#6B7280", marginTop: 4 }}>
              Comisión global actual: <b style={{ color: "#0E2C56", fontWeight: 600 }}>15%</b> · 
              Personalizada para Plomería: <b style={{ color: "#0A6BCF", fontWeight: 600 }}>12%</b> · 
              Ahorro estimado al técnico: <b style={{ color: "#18A66A", fontWeight: 600 }}>~$95 MXN por servicio</b>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={ct.percentBox}>
              <input type="number" defaultValue="12" style={ct.percentInput} />
              <span style={ct.percentSign}>%</span>
            </div>
            <div style={{ ...ct.toggle, ...ct.toggleOn }}>
              <span style={{ ...ct.toggleKnob, ...ct.toggleKnobOn }} />
            </div>
          </div>
        </div>
      </Section>

      {/* SECTION: Extras */}
      <Section num="05" title="Extras predefinidos" icon="plus-circle" badge={`${EXTRAS_PREDEF.length} extras`}>
        <div style={{ fontSize: 12.5, color: "#6B7280", marginBottom: 14 }}>
          Sugerencias rápidas que el técnico puede agregar durante el diagnóstico. El cliente las aprueba antes de la ejecución.
        </div>
        <div style={ct.extrasList}>
          {EXTRAS_PREDEF.map((e, i) => (
            <div key={i} style={ct.extraRow}>
              <Ic name="plus" size={14} color="#0A6BCF" />
              <span style={{ flex: 1, fontSize: 13, color: "#0E2C56", fontWeight: 500 }}>{e.label}</span>
              <span style={{ fontSize: 13, color: "#0E2C56", fontWeight: 600, fontFamily: "'Manrope', sans-serif" }}>
                +${e.price.toLocaleString("es-MX")}
                <span style={{ fontSize: 10.5, color: "#9CA3AF", marginLeft: 3, fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>MXN</span>
              </span>
              <button style={ct.iconBtnSm}><Ic name="pencil" size={13} color="#0A6BCF" /></button>
              <button style={ct.iconBtnSm}><Ic name="trash-2" size={13} color="#DC2626" /></button>
            </div>
          ))}
          <button style={ct.dashedBtn}>
            <Ic name="plus" size={14} color="#0A6BCF" style={{ marginRight: 8 }} />Agregar extra predefinido
          </button>
        </div>
      </Section>

      <div style={{ height: 70 }} />
    </div>
  );
}

function Section({ num, title, icon, badge, children }) {
  return (
    <div style={ct.section}>
      <div style={ct.sectionHead}>
        <span style={ct.sectionNum}>{num}</span>
        <div style={ct.sectionIcon}><Ic name={icon} size={16} color="#0A6BCF" /></div>
        <span style={ct.sectionTitle}>{title}</span>
        {badge && <span style={ct.sectionBadge}>{badge}</span>}
        <button style={{ ...ct.iconBtnSm, marginLeft: "auto" }}><Ic name="chevron-up" size={14} color="#6B7280" /></button>
      </div>
      <div style={ct.sectionBody}>{children}</div>
    </div>
  );
}

function Field({ label, hint, children, span = 1 }) {
  return (
    <div style={{ gridColumn: `span ${span}` }}>
      <label style={ct.fieldLabel}>{label}{hint && <span style={ct.fieldHint}>{hint}</span>}</label>
      <div style={{ marginTop: 6 }}>{children}</div>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================
function CatalogPage({ empty = false }) {
  return (
    <main style={ct.main}>
      <div style={ct.pageHead}>
        <div>
          <h1 style={ct.h1}>Catálogo de servicios</h1>
          <p style={ct.sub}>Administra categorías, subcategorías, iconos y rangos de precio.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={ct.btnGhost}><Ic name="upload" size={14} color="#0E2C56" style={{ marginRight: 8 }} />Importar</button>
          <button style={ct.btnPrimary}><Ic name="plus" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />Nueva categoría</button>
        </div>
      </div>

      <div style={ct.split}>
        <CategoryList activeId={empty ? null : "plomeria"} onSelect={() => {}} />
        <div style={{ minWidth: 0 }}>
          {empty ? <EmptyState /> : <CategoryDetail />}
        </div>
      </div>

      {!empty && (
        <div style={ct.stickyFoot}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={ct.changeDot} />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0E2C56" }}>Tienes 3 cambios sin guardar</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                Comisión personalizada · Precio sugerido en "Cisternas y tinacos" · Nuevo extra "Sustitución de empaques"
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={ct.btnGhost}>Descartar</button>
            <button style={ct.btnPrimary}><Ic name="check" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />Guardar cambios</button>
          </div>
        </div>
      )}
    </main>
  );
}

function Screen({ empty = false }) {
  return (
    <div style={{ display: "flex", width: 1440, height: empty ? 1100 : 2300, background: "#F8FBFF", fontFamily: "'Inter', sans-serif", position: "relative" }}>
      <AdminSidebar active="catalog" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AdminHeader crumbs={["Inicio", "Catálogo"]} />
        <CatalogPage empty={empty} />
      </div>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="catalog" title="Catálogo de servicios" subtitle="Edición · estado vacío">
        <DCArtboard id="detail" label="Plomería · edición completa" width={1440} height={2300}>
          <Screen empty={false} />
        </DCArtboard>
        <DCArtboard id="empty" label="Estado vacío · sin selección" width={1440} height={1100}>
          <Screen empty={true} />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// ============================================================
// STYLES
// ============================================================
const ct = {
  main: { flex: 1, padding: "28px 32px 100px", display: "flex", flexDirection: "column", gap: 24, color: "#0E2C56", position: "relative" },
  pageHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  h1: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 28, margin: 0, letterSpacing: "-0.01em" },
  sub: { fontSize: 13.5, color: "#6B7280", margin: "4px 0 0" },
  btnPrimary: { background: "#0A6BCF", color: "#FFFFFF", border: "1px solid #0A6BCF", borderRadius: 10, padding: "10px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", boxShadow: "0 1px 2px rgba(10,107,207,0.25)" },
  btnSecondary: { background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #0A6BCF", borderRadius: 10, padding: "10px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  btnGhost: { background: "#FFFFFF", color: "#0E2C56", border: "1px solid #E1E8F0", borderRadius: 10, padding: "10px 14px", fontWeight: 500, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  btnGhostDanger: { background: "#FFFFFF", color: "#DC2626", border: "1px solid #E1E8F0", borderRadius: 10, padding: "10px 14px", fontWeight: 500, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center" },

  split: { display: "grid", gridTemplateColumns: "320px 1fr", gap: 24, alignItems: "flex-start" },

  /* Left */
  leftCard: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, overflow: "hidden", position: "sticky", top: 24 },
  leftHead: { padding: "16px 16px 12px", borderBottom: "1px solid #F0F4F9", display: "flex", flexDirection: "column", gap: 10 },
  inputWrap: { display: "flex", alignItems: "center", height: 36, background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 8 },
  input: { flex: 1, border: "none", outline: "none", background: "transparent", padding: "0 12px", fontSize: 13, color: "#0E2C56", height: "100%" },
  countLabel: { fontSize: 11.5, color: "#6B7280" },
  list: { display: "flex", flexDirection: "column", padding: "8px 8px" },
  row: { position: "relative", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, cursor: "pointer", marginBottom: 2 },
  rowActive: { background: "#F8FBFF", border: "1px solid rgba(10,107,207,0.18)" },
  rowIndicator: { position: "absolute", left: -4, top: 8, bottom: 8, width: 3, background: "#0A6BCF", borderRadius: 3 },
  iconBox: { width: 36, height: 36, borderRadius: 8, background: "#EEF3F8", display: "grid", placeItems: "center", flexShrink: 0 },

  /* Right */
  right: { display: "flex", flexDirection: "column", gap: 18 },
  detailHead: { display: "flex", alignItems: "center", gap: 16, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, padding: 22 },
  bigIcon: { width: 64, height: 64, borderRadius: 14, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  editableName: { display: "inline-flex", alignItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 24, color: "#0E2C56", letterSpacing: "-0.01em" },
  toggleField: { display: "flex", alignItems: "center", gap: 12, padding: "8px 14px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 10 },

  /* Sections */
  section: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, padding: 22 },
  sectionHead: { display: "flex", alignItems: "center", gap: 12, marginBottom: 18 },
  sectionNum: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#9CA3AF", letterSpacing: ".08em", fontWeight: 500 },
  sectionIcon: { width: 30, height: 30, borderRadius: 8, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center" },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: "#0E2C56" },
  sectionBadge: { fontSize: 11, padding: "2px 9px", borderRadius: 999, background: "#EEF3F8", color: "#6B7280", fontWeight: 600 },
  sectionBody: {},

  /* Fields */
  kvGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 },
  fieldLabel: { fontSize: 12.5, fontWeight: 500, color: "#0E2C56", display: "block" },
  fieldHint: { fontSize: 11.5, fontWeight: 400, color: "#9CA3AF", marginLeft: 8 },
  fieldInput: { width: "100%", padding: "10px 12px", fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: "#0E2C56", border: "1px solid #E1E8F0", borderRadius: 8, outline: "none", background: "#FFFFFF" },
  iconChoice: { width: 38, height: 38, borderRadius: 8, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer" },
  iconChoiceSel: { background: "#0A6BCF", borderColor: "#0A6BCF" },
  colorSwatch: { width: 36, height: 36, borderRadius: 8, display: "grid", placeItems: "center", cursor: "pointer" },
  colorSwatchSel: { boxShadow: "0 0 0 3px rgba(10,107,207,0.25)" },

  /* Table */
  tableCard: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12, overflow: "hidden" },
  th: { textAlign: "left", padding: "10px 14px", fontSize: 11, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", borderBottom: "1px solid #E1E8F0" },
  tr: { borderBottom: "1px solid #F0F4F9" },
  td: { padding: "12px 14px", fontSize: 13, color: "#0E2C56", verticalAlign: "middle" },
  badge: { display: "inline-flex", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600 },
  iconBtnSm: { background: "transparent", border: "1px solid #E1E8F0", padding: 6, borderRadius: 7, cursor: "pointer", display: "inline-grid", placeItems: "center" },
  dashedBtn: { background: "transparent", border: "1.5px dashed rgba(10,107,207,0.4)", borderRadius: 10, padding: "10px 16px", color: "#0A6BCF", fontSize: 13, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", width: "100%", justifyContent: "center" },

  /* Comisión */
  commRow: { display: "flex", alignItems: "center", gap: 24, padding: 18, background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 12 },
  percentBox: { display: "flex", alignItems: "center", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 8, padding: "0 12px", height: 44, width: 110 },
  percentInput: { width: "100%", border: "none", outline: "none", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 20, color: "#0E2C56", background: "transparent" },
  percentSign: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 18, color: "#6B7280" },

  /* Extras */
  extrasList: { display: "flex", flexDirection: "column", gap: 8 },
  extraRow: { display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#FBFDFF", border: "1px solid #E1E8F0", borderRadius: 10 },

  /* Toggle */
  toggle: { position: "relative", width: 42, height: 24, borderRadius: 999, background: "#E1E8F0", cursor: "pointer", flexShrink: 0, transition: "background .15s" },
  toggleOn: { background: "#0A6BCF" },
  toggleKnob: { position: "absolute", left: 3, top: 3, width: 18, height: 18, borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 1px 2px rgba(14,44,86,0.18)", transition: "transform .15s" },
  toggleKnobOn: { transform: "translateX(18px)" },
  toggleMini: { position: "relative", width: 30, height: 18, borderRadius: 999, background: "#E1E8F0", flexShrink: 0 },
  toggleMiniOn: { background: "#0A6BCF" },
  toggleMiniKnob: { position: "absolute", left: 2, top: 2, width: 14, height: 14, borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 1px 2px rgba(14,44,86,0.18)" },
  toggleMiniKnobOn: { transform: "translateX(12px)" },

  /* Sticky footer */
  stickyFoot: { position: "absolute", left: 0, right: 0, bottom: 0, background: "#FFFFFF", borderTop: "1px solid #E1E8F0", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 -8px 24px rgba(14,44,86,0.08)", zIndex: 5 },
  changeDot: { width: 10, height: 10, borderRadius: "50%", background: "#F59E0B", boxShadow: "0 0 0 4px rgba(245,158,11,0.18)" },

  /* Empty */
  empty: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, padding: 80, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  emptyIllu: { width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, rgba(24,193,255,0.18), rgba(10,107,207,0.08) 70%)", display: "grid", placeItems: "center", marginBottom: 24 },
  emptyH3: { fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 20, color: "#0E2C56", margin: "0 0 10px" },
  emptyP: { fontSize: 14, color: "#6B7280", lineHeight: 1.55, maxWidth: 480, margin: "0 0 24px" },
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
