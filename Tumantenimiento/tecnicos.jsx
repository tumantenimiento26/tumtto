/* global React, ReactDOM, AdminIc, AdminSidebar, AdminHeader, ADMIN_USER */
const { useState, useEffect, useRef } = React;
const Ic = AdminIc;

// ============================================================
// MOCK DATA — Técnicos
// ============================================================
const TECH_TABS = [
  { id: "all", label: "Todos", count: 1247 },
  { id: "pending", label: "Pendientes de KYC", count: 12, tone: "warn" },
  { id: "approved", label: "Aprobados", count: 1180, tone: "ok" },
  { id: "rejected", label: "Rechazados", count: 43, tone: "err" },
  { id: "suspended", label: "Suspendidos", count: 12, tone: "muted" },
];

const TECHNICIANS = [
  { name: "Miguel Ángel López Rentería",  phone: "33 1842 5790", cats: ["Cristales"],                       extra: 0, region: "Tlaquepaque", rating: null, jobs: 0,   last: "hace 3 d",  status: "pending",  pri: true },
  { name: "Ramón Hernández García",       phone: "33 2014 8765", cats: ["Plomería", "Drenaje"],             extra: 0, region: "Zapopan",     rating: 4.8,   reviews: 124, jobs: 124, last: "hace 2 h",  status: "approved" },
  { name: "José Carlos Juárez Mendoza",   phone: "33 1567 2034", cats: ["Electricidad"],                    extra: 0, region: "Guadalajara", rating: 4.9,   reviews: 87,  jobs: 87,  last: "hace 4 h",  status: "approved" },
  { name: "Lupita Pérez Vázquez",         phone: "33 3120 9846", cats: ["Pintura", "Impermeabilización"],   extra: 0, region: "Zapopan",     rating: 4.6,   reviews: 45,  jobs: 45,  last: "ayer",      status: "approved" },
  { name: "Adriana García Soto",          phone: "33 1788 0245", cats: ["Electricidad", "Tableros"],        extra: 1, region: "Tlaquepaque", rating: 4.8,   reviews: 167, jobs: 167, last: "hace 12 m", status: "approved" },
  { name: "Sergio Camarena Ruvalcaba",    phone: "33 2356 1198", cats: ["Impermeabilización"],              extra: 0, region: "Zapopan",     rating: 4.7,   reviews: 92,  jobs: 92,  last: "hace 1 h",  status: "approved" },
  { name: "Fernanda Olivares Ramírez",    phone: "33 1029 7733", cats: ["Plomería", "Gas"],                 extra: 1, region: "Tonalá",      rating: null,  jobs: 0,   last: "hace 1 d",  status: "pending"  },
  { name: "Ricardo Mendoza Aguilar",      phone: "33 4502 8810", cats: ["Plomería"],                        extra: 0, region: "Zapopan",     rating: 4.9,   reviews: 214, jobs: 214, last: "hace 6 m",  status: "approved" },
  { name: "Daniela Ortega Camacho",       phone: "33 1745 2298", cats: ["Drenaje", "Plomería"],             extra: 0, region: "Tlajomulco",  rating: 4.5,   reviews: 38,  jobs: 38,  last: "ayer",      status: "approved" },
  { name: "Luis Esteban Gómez Salinas",   phone: "33 2811 4467", cats: ["Plomería"],                        extra: 0, region: "Guadalajara", rating: 3.9,   reviews: 27,  jobs: 27,  last: "hace 3 d",  status: "suspended" },
  { name: "Carlos Iván Velázquez Robles", phone: "33 1992 0354", cats: ["Cristales", "Herrería"],           extra: 0, region: "El Salto",    rating: null,  jobs: 0,   last: "hace 5 h",  status: "pending"  },
  { name: "Roberto Villanueva Aceves",    phone: "33 3678 1102", cats: ["Pintura"],                         extra: 0, region: "Guadalajara", rating: 4.4,   reviews: 56,  jobs: 56,  last: "hace 18 h", status: "rejected" },
];

const STATUS_BADGE = {
  pending:   { label: "Pendiente",  bg: "#FEF3DC", fg: "#B45309", dot: "#F59E0B" },
  approved:  { label: "Aprobado",   bg: "#E5F7EE", fg: "#18A66A", dot: "#18A66A" },
  rejected:  { label: "Rechazado",  bg: "#FCE9E9", fg: "#DC2626", dot: "#DC2626" },
  suspended: { label: "Suspendido", bg: "#EEF3F8", fg: "#6B7280", dot: "#9CA3AF" },
};

const CATEGORIES = ["Plomería","Electricidad","Herrería","Cristales","Gas","Drenaje","Pintura","Pisos","Impermeabilización","Control de plagas"];
const REGIONS = ["Todas","Guadalajara","Zapopan","Tlaquepaque","Tonalá","Tlajomulco","El Salto"];

// ============================================================
// LIST VIEW
// ============================================================
function TechniciansList() {
  return (
    <main style={l.main}>
      <div style={l.headRow}>
        <div>
          <h1 style={l.h1}>Técnicos</h1>
          <p style={l.sub}>Gestión y verificación de prestadores de servicio · ZMG</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={l.btnGhost}><Ic name="upload" size={14} color="#0E2C56" style={{ marginRight: 8 }} />Importar</button>
          <button style={l.btnSecondary}><Ic name="download" size={14} color="#0A6BCF" style={{ marginRight: 8 }} />Exportar CSV</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={l.tabsRow}>
        {TECH_TABS.map((t, i) => (
          <div key={t.id} style={{ ...l.tab, ...(i === 1 ? l.tabActive : null) }}>
            <span>{t.label}</span>
            <span style={{ ...l.tabCount, ...(t.tone ? l.tabCountTone(t.tone) : null) }}>{t.count.toLocaleString("es-MX")}</span>
            {i === 1 && <span style={l.tabUnderline} />}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={l.filters}>
        <div style={{ ...l.inputWrap, flex: 1, maxWidth: 320 }}>
          <Ic name="search" size={14} color="#9CA3AF" style={{ marginLeft: 12 }} />
          <input placeholder="Buscar por nombre, teléfono o RFC" style={l.input} />
        </div>

        <div style={l.selectWrap}>
          <Ic name="map-pin" size={14} color="#0A6BCF" />
          <span style={l.selectLabel}>Región:</span>
          <span style={l.selectValue}>Todas</span>
          <Ic name="chevron-down" size={14} color="#9CA3AF" />
        </div>

        <div style={l.selectWrap}>
          <Ic name="folder-tree" size={14} color="#0A6BCF" />
          <span style={l.selectLabel}>Categoría:</span>
          <span style={l.selectValue}>2 seleccionadas</span>
          <Ic name="chevron-down" size={14} color="#9CA3AF" />
        </div>

        <div style={{ ...l.selectWrap, gap: 10 }}>
          <Ic name="star" size={14} color="#F59E0B" />
          <span style={l.selectLabel}>Rating ≥</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={l.sliderTrack}>
              <div style={{ ...l.sliderFill, width: "76%" }} />
              <div style={{ ...l.sliderHandle, left: "calc(76% - 7px)" }} />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#0E2C56", fontWeight: 600, minWidth: 24 }}>3.8</span>
          </div>
        </div>

        <button style={l.btnGhost}><Ic name="x" size={13} color="#6B7280" style={{ marginRight: 6 }} />Limpiar filtros</button>
      </div>

      {/* Table */}
      <div style={l.tableCard}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FBFF" }}>
              <th style={{ ...l.th, width: 36, paddingLeft: 20 }}>
                <input type="checkbox" style={l.checkbox} />
              </th>
              <th style={l.th}>Técnico</th>
              <th style={l.th}>Estado KYC</th>
              <th style={l.th}>Categorías</th>
              <th style={l.th}>Región</th>
              <th style={l.th}>Rating</th>
              <th style={l.th}>Trabajos</th>
              <th style={l.th}>Última actividad</th>
              <th style={{ ...l.th, width: 56 }}></th>
            </tr>
          </thead>
          <tbody>
            {TECHNICIANS.map((t, i) => {
              const st = STATUS_BADGE[t.status];
              const isPriority = t.pri;
              return (
                <tr key={i} style={{ ...l.tr, ...(isPriority ? { background: "rgba(245,158,11,0.03)" } : null) }}>
                  <td style={{ ...l.td, paddingLeft: 20 }}><input type="checkbox" style={l.checkbox} /></td>
                  <td style={l.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ ...l.tav, background: avTone(i) }}>{initials(t.name)}</div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0E2C56" }}>{t.name}</div>
                        <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{t.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td style={l.td}>
                    <span style={{ ...l.badge, background: st.bg, color: st.fg, ...(isPriority ? { boxShadow: "0 0 0 3px rgba(245,158,11,0.18)" } : null) }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: st.dot }} />
                      {st.label}
                    </span>
                  </td>
                  <td style={l.td}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {t.cats.slice(0, 2).map((c) => (
                        <span key={c} style={l.chip}>{c}</span>
                      ))}
                      {t.extra > 0 && <span style={l.chipMuted}>+{t.extra}</span>}
                    </div>
                  </td>
                  <td style={{ ...l.td, fontSize: 13, color: "#0E2C56" }}>{t.region}</td>
                  <td style={l.td}>
                    {t.rating ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Ic name="star" size={14} color="#F59E0B" />
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#0E2C56" }}>{t.rating.toFixed(1)}</span>
                        <span style={{ fontSize: 12, color: "#9CA3AF" }}>({t.reviews})</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: "#9CA3AF", fontStyle: "italic" }}>sin reseñas</span>
                    )}
                  </td>
                  <td style={{ ...l.td, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#0E2C56" }}>{t.jobs}</td>
                  <td style={{ ...l.td, fontSize: 12.5, color: "#6B7280" }}>{t.last}</td>
                  <td style={{ ...l.td, paddingRight: 20 }}>
                    <button style={l.kebab} aria-label="Acciones"><Ic name="more-vertical" size={16} color="#6B7280" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={l.tableFooter}>
          <span style={{ fontSize: 12.5, color: "#6B7280" }}>
            Mostrando <b style={{ color: "#0E2C56", fontWeight: 600 }}>1 – 12</b> de <b style={{ color: "#0E2C56", fontWeight: 600 }}>1,247</b> técnicos
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button style={l.pageBtn} disabled><Ic name="chevron-left" size={14} color="#9CA3AF" /></button>
            <button style={{ ...l.pageBtn, ...l.pageBtnActive }}>1</button>
            <button style={l.pageBtn}>2</button>
            <button style={l.pageBtn}>3</button>
            <span style={{ padding: "0 4px", color: "#9CA3AF", fontSize: 13 }}>…</span>
            <button style={l.pageBtn}>104</button>
            <button style={l.pageBtn}><Ic name="chevron-right" size={14} color="#0E2C56" /></button>
          </div>
        </div>
      </div>
    </main>
  );
}

// ============================================================
// DETAIL VIEW (Miguel Ángel López — KYC approval)
// ============================================================
const MIGUEL = {
  name: "Miguel Ángel López Rentería",
  phone: "33 1842 5790",
  email: "miguel.lopez.r@gmail.com",
  registered: "16/05/2026 · hace 3 días",
  curp: "LORM880324HJCPNG07",
  rfc: "LORM880324A12",
  birth: "24/03/1988 (38 años)",
  address: "Calle Río Mezquital 1284, Col. Las Juntas, Tlaquepaque, Jal., C.P. 45693",
  categories: [
    { name: "Cristales", sub: ["Ventanas residenciales", "Templados", "Sustitución de cristal en cocheras"] },
  ],
  coverage: ["Tlaquepaque", "Tonalá", "Sur de Guadalajara"],
  rates: [
    { label: "Visita y diagnóstico", value: "$280 MXN" },
    { label: "Hora de trabajo", value: "$320 MXN" },
    { label: "Mínimo de servicio", value: "$450 MXN" },
  ],
  bank: { clabe: "012 320 •••• •••• 1234", bank: "BBVA México", verified: true },
  bio: "Tengo 14 años trabajando con vidrio y aluminio en talleres familiares de Tlaquepaque. Especialidad en cristales templados para puertas de regadera y ventanales residenciales. Manejo mis propias herramientas y traigo seguro de responsabilidad civil.",
  docs: [
    { id: "ine-front",   label: "INE · Anverso",         req: true,  status: "pending" },
    { id: "ine-back",    label: "INE · Reverso",         req: true,  status: "pending" },
    { id: "domicilio",   label: "Comprobante de domicilio (CFE, mayo 2026)", req: true,  status: "pending" },
    { id: "rec-1",       label: "Carta de recomendación · Cristalería del Sur", req: false, status: "optional" },
    { id: "cert-gas",    label: "Certificación gas LP (no aplica)", req: false, status: "optional" },
  ],
  notes: [
    { author: "Sofía Martínez", role: "Admin", time: "Hoy · 12:14", text: "Verifiqué dirección por WhatsApp. Vive en Las Juntas, confirmado. Doc CFE coincide." },
    { author: "Daniel Olvera",  role: "Onboarding", time: "Ayer · 17:42", text: "Llamada de bienvenida realizada. Habla claro, entiende el flujo. Le envié liga de tutorial." },
  ],
};

function TechnicianDetail({ showRejectModal = false }) {
  return (
    <main style={{ ...l.main, paddingBottom: 100, position: "relative" }}>
      {/* Header */}
      <div style={d.profile}>
        <div style={{ ...d.bigAv }}>{initials(MIGUEL.name)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h1 style={d.name}>{MIGUEL.name}</h1>
            <span style={{ ...l.badge, background: "#FEF3DC", color: "#B45309", boxShadow: "0 0 0 3px rgba(245,158,11,0.18)", fontSize: 12, padding: "4px 10px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B" }} />
              Pendiente de KYC
            </span>
          </div>
          <div style={d.profileMeta}>
            <span><Ic name="phone" size={13} color="#9CA3AF" style={{ marginRight: 4 }} />{MIGUEL.phone}</span>
            <span><Ic name="mail" size={13} color="#9CA3AF" style={{ marginRight: 4 }} />{MIGUEL.email}</span>
            <span><Ic name="calendar" size={13} color="#9CA3AF" style={{ marginRight: 4 }} />Registrado {MIGUEL.registered}</span>
            <span><Ic name="map-pin" size={13} color="#9CA3AF" style={{ marginRight: 4 }} />Tlaquepaque, Jal.</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={l.btnGhost}><Ic name="message-square" size={14} color="#0E2C56" style={{ marginRight: 8 }} />Solicitar más info</button>
          <button style={d.rejectBtn}><Ic name="x" size={14} color="#DC2626" style={{ marginRight: 8 }} />Rechazar</button>
          <button style={d.approveBtn}><Ic name="check" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />Aprobar KYC</button>
        </div>
      </div>

      {/* Two-column body */}
      <div style={d.body}>
        <div style={d.colLeft}>
          {/* Datos personales */}
          <DCard title="Datos personales" icon="contact-round">
            <div style={d.kvGrid}>
              <KV label="Nombre completo" value={MIGUEL.name} />
              <KV label="Fecha de nacimiento" value={MIGUEL.birth} />
              <KV label="CURP" value={MIGUEL.curp} mono />
              <KV label="RFC" value={MIGUEL.rfc} mono optional />
              <KV label="Dirección" value={MIGUEL.address} span={2} />
            </div>
          </DCard>

          {/* Servicios y cobertura */}
          <DCard title="Servicios y cobertura" icon="map">
            <div style={d.sectionLabel}>Categorías y subcategorías</div>
            {MIGUEL.categories.map((c) => (
              <div key={c.name} style={d.catGroup}>
                <div style={d.catName}>{c.name}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {c.sub.map((s) => <span key={s} style={l.chip}>{s}</span>)}
                </div>
              </div>
            ))}

            <div style={{ ...d.sectionLabel, marginTop: 18 }}>Área de cobertura</div>
            <div style={d.miniMapRow}>
              <MiniMap />
              <div style={{ flex: 1, paddingLeft: 16 }}>
                <div style={{ fontSize: 13, color: "#0E2C56", marginBottom: 10 }}>
                  Atiende {MIGUEL.coverage.length} zonas con radio aprox. <b style={{ fontWeight: 600 }}>12 km</b>.
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {MIGUEL.coverage.map((z) => (
                    <span key={z} style={l.chip}><Ic name="map-pin" size={11} color="#0A6BCF" style={{ marginRight: 4 }} />{z}</span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ ...d.sectionLabel, marginTop: 18 }}>Tarifas base capturadas</div>
            <div style={d.rates}>
              {MIGUEL.rates.map((r) => (
                <div key={r.label} style={d.rateRow}>
                  <span style={{ fontSize: 13, color: "#6B7280" }}>{r.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#0E2C56", fontFamily: "'Manrope', sans-serif" }}>{r.value}</span>
                </div>
              ))}
            </div>
          </DCard>

          {/* Datos bancarios */}
          <DCard title="Datos bancarios" icon="landmark">
            <div style={d.kvGrid}>
              <KV label="CLABE interbancaria" value={MIGUEL.bank.clabe} mono span={2} />
              <KV label="Banco detectado" value={MIGUEL.bank.bank} />
              <KV label="Estado" value={
                <span style={{ ...l.badge, background: "#E5F7EE", color: "#18A66A", fontSize: 11.5, padding: "3px 8px" }}>
                  <Ic name="badge-check" size={11} color="#18A66A" />Validada con SPEI prueba
                </span>
              } />
            </div>
          </DCard>

          {/* Bio */}
          <DCard title="Biografía profesional" icon="quote">
            <p style={d.bio}>"{MIGUEL.bio}"</p>
            <div style={{ fontSize: 11.5, color: "#9CA3AF", marginTop: 12, fontFamily: "'JetBrains Mono', monospace" }}>
              231 caracteres · capturado por el técnico al registrarse
            </div>
          </DCard>
        </div>

        <div style={d.colRight}>
          {/* KYC docs */}
          <DCard title="Documentos KYC" icon="file-check-2"
            sub={<span><b style={{ color: "#B45309", fontWeight: 600 }}>3 obligatorios</b> · 2 opcionales · todos pendientes</span>}
          >
            <div style={d.docs}>
              {MIGUEL.docs.map((doc) => <DocCard key={doc.id} doc={doc} />)}
            </div>
            <button style={d.approveAllDocs}><Ic name="check-check" size={13} color="#0A6BCF" style={{ marginRight: 6 }} />Aprobar los 3 documentos obligatorios</button>
          </DCard>

          {/* Notas internas */}
          <DCard title="Notas internas del admin" icon="message-square-text"
            sub="Solo visibles para el equipo Tumantenimiento. El técnico no las ve.">
            <textarea
              placeholder="Anota lo que verifiques, dudas, observaciones…"
              style={d.noteArea}
              defaultValue=""
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <button style={l.btnSecondary}><Ic name="send" size={13} color="#0A6BCF" style={{ marginRight: 6 }} />Guardar nota</button>
            </div>

            <div style={d.sectionLabel}>Historial</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {MIGUEL.notes.map((n, i) => (
                <div key={i} style={d.noteRow}>
                  <div style={d.noteAv}>{initials(n.author)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#0E2C56" }}>{n.author}</span>
                      <span style={{ fontSize: 11, color: "#9CA3AF", background: "#EEF3F8", padding: "1px 6px", borderRadius: 4 }}>{n.role}</span>
                      <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace" }}>{n.time}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "#0E2C56", lineHeight: 1.5, margin: "6px 0 0" }}>{n.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </DCard>
        </div>
      </div>

      {/* Sticky footer panel */}
      <div style={d.stickyFoot}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Ic name="alert-circle" size={18} color="#F59E0B" />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0E2C56" }}>Listo para revisar — 3 documentos obligatorios, 0 aprobados aún</div>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>El técnico recibirá una notificación push y correo al confirmar la decisión.</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={l.btnGhost}><Ic name="message-square" size={14} color="#0E2C56" style={{ marginRight: 8 }} />Solicitar más info</button>
          <button style={d.rejectBtn}><Ic name="x" size={14} color="#DC2626" style={{ marginRight: 8 }} />Rechazar</button>
          <button style={d.approveBtn}><Ic name="check" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />Aprobar KYC</button>
        </div>
      </div>

      {showRejectModal && <RejectModal />}
    </main>
  );
}

function DCard({ title, icon, sub, children }) {
  return (
    <div style={d.card}>
      <div style={d.cardHead}>
        <div style={d.cardIcon}><Ic name={icon} size={16} color="#0A6BCF" /></div>
        <div>
          <div style={d.cardTitle}>{title}</div>
          {sub && <div style={d.cardSub}>{sub}</div>}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function KV({ label, value, mono, optional, span = 1 }) {
  return (
    <div style={{ gridColumn: `span ${span}` }}>
      <div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", fontFamily: "'JetBrains Mono', monospace", marginBottom: 5 }}>
        {label}{optional && <span style={{ color: "#9CA3AF", textTransform: "none", marginLeft: 6, fontWeight: 400, letterSpacing: 0 }}>(opcional)</span>}
      </div>
      <div style={{
        fontSize: 14,
        color: "#0E2C56",
        fontWeight: 500,
        fontFamily: mono ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
      }}>{value}</div>
    </div>
  );
}

function DocCard({ doc }) {
  const isReq = doc.req;
  return (
    <div style={d.doc}>
      <div style={d.docThumb}>
        <DocPreview kind={doc.id} />
        <div style={d.docOverlay}>
          <Ic name="zoom-in" size={14} color="#FFFFFF" />
        </div>
      </div>
      <div style={d.docInfo}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0E2C56", lineHeight: 1.3 }}>{doc.label}</div>
          {isReq ? (
            <span style={{ ...l.badge, background: "#FEF3DC", color: "#B45309", fontSize: 10, padding: "2px 7px" }}>Pendiente revisión</span>
          ) : (
            <span style={{ ...l.badge, background: "#EEF3F8", color: "#6B7280", fontSize: 10, padding: "2px 7px" }}>Opcional</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: "#9CA3AF", margin: "4px 0 8px", fontFamily: "'JetBrains Mono', monospace" }}>
          PDF · 2.1 MB · subido 16/05/2026
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button style={d.docBtn}><Ic name="check" size={12} color="#18A66A" style={{ marginRight: 4 }} />Aprobar este doc</button>
          <button style={d.docBtnGhost}><Ic name="alert-triangle" size={12} color="#B45309" style={{ marginRight: 4 }} />Marcar ilegible</button>
        </div>
      </div>
    </div>
  );
}

function DocPreview({ kind }) {
  // Stylised placeholder for an INE / utility bill / cert
  const bgs = {
    "ine-front": "linear-gradient(135deg,#0E2C56,#0A6BCF)",
    "ine-back":  "linear-gradient(135deg,#0A6BCF,#18C1FF)",
    "domicilio": "linear-gradient(135deg,#F8FBFF,#DCE6F1)",
    "rec-1":     "linear-gradient(135deg,#FFFFFF,#EEF3F8)",
    "cert-gas":  "linear-gradient(135deg,#FFFFFF,#EEF3F8)",
  };
  const isCard = kind === "ine-front" || kind === "ine-back";
  return (
    <div style={{ width: "100%", height: "100%", background: bgs[kind] || "#EEF3F8", display: "grid", placeItems: "center", position: "relative", overflow: "hidden" }}>
      {isCard ? (
        <div style={{ width: "75%", height: "60%", background: "rgba(255,255,255,0.94)", borderRadius: 6, padding: 8, display: "flex", gap: 6 }}>
          <div style={{ width: "32%", height: "100%", background: "#EEF3F8", borderRadius: 4 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ height: 5, background: "#0E2C56", width: "40%", borderRadius: 2 }} />
            <div style={{ height: 4, background: "#9CA3AF", width: "80%", borderRadius: 2 }} />
            <div style={{ height: 4, background: "#9CA3AF", width: "65%", borderRadius: 2 }} />
            <div style={{ height: 4, background: "#9CA3AF", width: "75%", borderRadius: 2 }} />
            <div style={{ marginTop: "auto", height: 3, background: "#0A6BCF", width: "50%", borderRadius: 2 }} />
          </div>
        </div>
      ) : (
        <div style={{ width: "70%", height: "78%", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 4, padding: 8, display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ height: 4, background: "#0E2C56", width: "55%", borderRadius: 2 }} />
          <div style={{ height: 3, background: "#9CA3AF", width: "85%", borderRadius: 2 }} />
          <div style={{ height: 3, background: "#9CA3AF", width: "70%", borderRadius: 2 }} />
          <div style={{ height: 3, background: "#9CA3AF", width: "78%", borderRadius: 2 }} />
          <div style={{ height: 3, background: "#9CA3AF", width: "60%", borderRadius: 2 }} />
          <div style={{ height: 3, background: "#9CA3AF", width: "72%", borderRadius: 2 }} />
        </div>
      )}
    </div>
  );
}

function MiniMap() {
  return (
    <svg viewBox="0 0 280 160" width="280" height="160" style={{ borderRadius: 10, background: "#EEF3F8", display: "block", flexShrink: 0 }}>
      <defs>
        <pattern id="miniGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0 L0 0 0 20" fill="none" stroke="#DCE6F1" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="280" height="160" fill="url(#miniGrid)" />
      <path d="M0 90 Q 90 70 180 95 Q 240 110 280 90" stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9" />
      <path d="M150 0 Q 130 80 160 160" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
      <circle cx="150" cy="80" r="44" fill="rgba(10,107,207,0.18)" stroke="#0A6BCF" strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx="150" cy="80" r="6" fill="#0A6BCF" stroke="#FFFFFF" strokeWidth="2" />
      <text x="150" y="80" textAnchor="middle" dy="-12" fontSize="10" fontFamily="Inter" fontWeight="600" fill="#0E2C56">Casa</text>
      <text x="150" y="80" textAnchor="middle" dy="38" fontSize="9" fontFamily="JetBrains Mono" fill="#0E2C56" opacity="0.6">radio 12 km</text>
    </svg>
  );
}

// ============================================================
// REJECT MODAL
// ============================================================
function RejectModal() {
  return (
    <div style={m.scrim}>
      <div style={m.modal}>
        <div style={m.head}>
          <div style={{ ...d.cardIcon, background: "#FCE9E9" }}><Ic name="x" size={18} color="#DC2626" /></div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#0E2C56", letterSpacing: "-0.005em" }}>Rechazar verificación KYC</div>
            <div style={{ fontSize: 13, color: "#6B7280", marginTop: 3 }}>Esta acción notifica al técnico por email y push. No es reversible automáticamente.</div>
          </div>
          <button style={m.close}><Ic name="x" size={16} color="#6B7280" /></button>
        </div>

        <div style={{ ...d.cardIcon, display: "none" }} />

        <div style={m.body}>
          <div style={m.field}>
            <label style={m.label}>Motivo del rechazo</label>
            <div style={m.selectWrap}>
              <Ic name="alert-octagon" size={14} color="#DC2626" style={{ marginLeft: 12 }} />
              <span style={{ flex: 1, paddingLeft: 10, fontSize: 14, color: "#0E2C56", fontWeight: 500 }}>Documentos ilegibles</span>
              <Ic name="chevron-down" size={14} color="#9CA3AF" style={{ marginRight: 12 }} />
            </div>
            <div style={m.helpRow}>
              {["Documentos ilegibles", "Información inconsistente", "Documento expirado", "Otro"].map((r, i) => (
                <span key={i} style={{ ...m.optChip, ...(i === 0 ? m.optChipSel : null) }}>{r}</span>
              ))}
            </div>
          </div>

          <div style={m.field}>
            <label style={m.label}>Mensaje al técnico</label>
            <textarea
              style={m.textarea}
              defaultValue="Hola Miguel Ángel, no podemos validar tu INE porque la foto está borrosa y no se distingue el holograma. Por favor, sube una foto nueva con buena luz y sin reflejos. En cuanto la recibamos retomamos tu solicitud. Gracias."
            />
            <div style={m.helpRow}>
              <span style={{ fontSize: 11.5, color: "#6B7280" }}>Se enviará por email a {MIGUEL.email} y push en la app del técnico.</span>
              <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace" }}>237 / 500</span>
            </div>
          </div>

          <div style={m.toggleRow}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0E2C56" }}>Permitir nueva postulación</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>El técnico podrá volver a aplicar con documentos corregidos.</div>
            </div>
            <div style={{ ...m.toggle, ...m.toggleOn }}><span style={m.toggleKnobOn} /></div>
          </div>
        </div>

        <div style={m.foot}>
          <button style={l.btnGhost}>Cancelar</button>
          <button style={{ ...d.rejectBtn, background: "#DC2626", color: "#FFFFFF", borderColor: "#DC2626" }}>
            <Ic name="x" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />Confirmar rechazo
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================
function initials(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase();
}
function avTone(i) {
  const palette = ["rgba(10,107,207,0.14)", "rgba(24,193,255,0.18)", "rgba(14,44,86,0.10)", "rgba(24,166,106,0.16)"];
  return palette[i % palette.length];
}

// ============================================================
// SCREENS
// ============================================================
function ScreenList() {
  return (
    <div style={{ display: "flex", width: 1440, height: 1300, background: "#F8FBFF", fontFamily: "'Inter', sans-serif" }}>
      <AdminSidebar active="technicians" expanded="users" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AdminHeader crumbs={["Inicio", "Usuarios", "Técnicos"]} />
        <TechniciansList />
      </div>
    </div>
  );
}
function ScreenDetail({ modal = false }) {
  return (
    <div style={{ display: "flex", width: 1440, height: 1900, background: "#F8FBFF", fontFamily: "'Inter', sans-serif" }}>
      <AdminSidebar active="technicians" expanded="users" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AdminHeader crumbs={["Inicio", "Usuarios", "Técnicos", MIGUEL.name]} />
        <TechnicianDetail showRejectModal={modal} />
      </div>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="technicians" title="Gestión de técnicos" subtitle="Listado · detalle KYC · modal de rechazo">
        <DCArtboard id="list" label="Listado de técnicos" width={1440} height={1300}>
          <ScreenList />
        </DCArtboard>
        <DCArtboard id="detail" label="Detalle · aprobación KYC" width={1440} height={1900}>
          <ScreenDetail modal={false} />
        </DCArtboard>
        <DCArtboard id="detail-reject" label="Detalle · modal de rechazo" width={1440} height={1900}>
          <ScreenDetail modal={true} />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// ============================================================
// STYLES
// ============================================================
const l = {
  main: { flex: 1, padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20, color: "#0E2C56", overflow: "hidden" },
  headRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  h1: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 28, margin: 0, letterSpacing: "-0.01em" },
  sub: { fontSize: 13.5, color: "#6B7280", margin: "4px 0 0" },
  btnSecondary: { background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #0A6BCF", borderRadius: 10, padding: "9px 14px", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  btnGhost: { background: "transparent", color: "#0E2C56", border: "1px solid #E1E8F0", borderRadius: 10, padding: "9px 14px", fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center" },

  tabsRow: { display: "flex", gap: 24, borderBottom: "1px solid #E1E8F0" },
  tab: { position: "relative", display: "flex", alignItems: "center", gap: 8, padding: "12px 2px 14px", fontSize: 13.5, fontWeight: 500, color: "#6B7280", cursor: "pointer" },
  tabActive: { color: "#0A6BCF", fontWeight: 600 },
  tabCount: { fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "#EEF3F8", color: "#6B7280", fontWeight: 600 },
  tabCountTone: (t) => {
    if (t === "warn") return { background: "#FEF3DC", color: "#B45309" };
    if (t === "ok")   return { background: "#E5F7EE", color: "#18A66A" };
    if (t === "err")  return { background: "#FCE9E9", color: "#DC2626" };
    return { background: "#EEF3F8", color: "#6B7280" };
  },
  tabUnderline: { position: "absolute", left: 0, right: 0, bottom: -1, height: 2, background: "#0A6BCF", borderRadius: 2 },

  filters: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "16px 20px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12 },
  inputWrap: { display: "flex", alignItems: "center", height: 38, background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 8 },
  input: { flex: 1, border: "none", outline: "none", background: "transparent", padding: "0 12px", fontSize: 13, color: "#0E2C56", height: "100%" },
  selectWrap: { display: "flex", alignItems: "center", gap: 6, height: 38, padding: "0 12px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 8, cursor: "pointer" },
  selectLabel: { fontSize: 12, color: "#6B7280" },
  selectValue: { fontSize: 13, color: "#0E2C56", fontWeight: 500 },
  sliderTrack: { position: "relative", width: 110, height: 4, background: "#E1E8F0", borderRadius: 999 },
  sliderFill: { position: "absolute", left: 0, top: 0, height: "100%", background: "#0A6BCF", borderRadius: 999 },
  sliderHandle: { position: "absolute", top: -5, width: 14, height: 14, borderRadius: "50%", background: "#FFFFFF", border: "2px solid #0A6BCF", boxShadow: "0 1px 3px rgba(14,44,86,0.15)" },

  tableCard: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, overflow: "hidden" },
  th: { textAlign: "left", padding: "12px 16px", fontSize: 11, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", borderBottom: "1px solid #E1E8F0" },
  tr: { borderBottom: "1px solid #F0F4F9", height: 60 },
  td: { padding: "10px 16px", fontSize: 13, color: "#0E2C56", verticalAlign: "middle" },
  checkbox: { width: 16, height: 16, accentColor: "#0A6BCF" },
  tav: { width: 36, height: 36, borderRadius: "50%", display: "grid", placeItems: "center", color: "#0A6BCF", fontWeight: 600, fontSize: 12, flexShrink: 0 },
  badge: { display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 9px", borderRadius: 999, fontSize: 11.5, fontWeight: 600 },
  chip: { display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 999, fontSize: 11.5, color: "#0E2C56", background: "#EEF3F8", fontWeight: 500, whiteSpace: "nowrap" },
  chipMuted: { display: "inline-flex", padding: "3px 9px", borderRadius: 999, fontSize: 11.5, color: "#6B7280", background: "#F8FBFF", fontWeight: 500, border: "1px solid #E1E8F0" },
  kebab: { background: "transparent", border: "1px solid transparent", borderRadius: 8, padding: 6, cursor: "pointer", display: "grid", placeItems: "center" },

  tableFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderTop: "1px solid #E1E8F0" },
  pageBtn: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 8, padding: "6px 11px", fontSize: 13, fontWeight: 500, color: "#0E2C56", cursor: "pointer", minWidth: 32, height: 30, display: "inline-grid", placeItems: "center" },
  pageBtnActive: { background: "#0A6BCF", color: "#FFFFFF", borderColor: "#0A6BCF" },
};

const d = {
  profile: { display: "flex", alignItems: "center", gap: 20, padding: "8px 0 20px", borderBottom: "1px solid #E1E8F0" },
  bigAv: { width: 96, height: 96, borderRadius: "50%", background: "rgba(245,158,11,0.16)", color: "#B45309", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 30, flexShrink: 0 },
  name: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 28, margin: 0, color: "#0E2C56", letterSpacing: "-0.01em" },
  profileMeta: { display: "flex", flexWrap: "wrap", gap: 18, fontSize: 13, color: "#6B7280", marginTop: 8 },
  rejectBtn: { background: "#FFFFFF", color: "#DC2626", border: "1px solid #DC2626", borderRadius: 10, padding: "10px 16px", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13.5, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  approveBtn: { background: "#0A6BCF", color: "#FFFFFF", border: "1px solid #0A6BCF", borderRadius: 10, padding: "10px 18px", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", boxShadow: "0 1px 2px rgba(10,107,207,0.25)" },

  body: { display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20, marginTop: 20 },
  colLeft: { display: "flex", flexDirection: "column", gap: 16 },
  colRight: { display: "flex", flexDirection: "column", gap: 16 },

  card: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, padding: 22 },
  cardHead: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 },
  cardIcon: { width: 32, height: 32, borderRadius: 8, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  cardTitle: { fontSize: 14.5, fontWeight: 600, color: "#0E2C56", letterSpacing: "-0.005em" },
  cardSub: { fontSize: 12.5, color: "#6B7280", marginTop: 2 },

  kvGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  sectionLabel: { fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".08em", fontFamily: "'JetBrains Mono', monospace", margin: "0 0 10px" },
  catGroup: { marginBottom: 10 },
  catName: { fontSize: 13.5, fontWeight: 600, color: "#0E2C56", marginBottom: 8 },
  miniMapRow: { display: "flex", alignItems: "flex-start", gap: 4 },
  rates: { display: "flex", flexDirection: "column", gap: 0 },
  rateRow: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "1px solid #F0F4F9" },
  bio: { fontSize: 14, color: "#0E2C56", lineHeight: 1.6, margin: 0, fontStyle: "italic" },

  docs: { display: "flex", flexDirection: "column", gap: 10 },
  doc: { display: "flex", gap: 14, padding: 12, border: "1px solid #E1E8F0", borderRadius: 12, background: "#FBFDFF" },
  docThumb: { position: "relative", width: 84, height: 60, borderRadius: 8, overflow: "hidden", flexShrink: 0, border: "1px solid #E1E8F0" },
  docOverlay: { position: "absolute", inset: 0, background: "rgba(14,44,86,0.5)", display: "grid", placeItems: "center", opacity: 0.7 },
  docInfo: { flex: 1, minWidth: 0 },
  docBtn: { background: "#E5F7EE", color: "#18A66A", border: "1px solid rgba(24,166,106,0.3)", borderRadius: 7, padding: "5px 9px", fontSize: 11.5, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  docBtnGhost: { background: "#FFFFFF", color: "#B45309", border: "1px solid #E1E8F0", borderRadius: 7, padding: "5px 9px", fontSize: 11.5, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  approveAllDocs: { width: "100%", marginTop: 12, background: "rgba(10,107,207,0.06)", border: "1px dashed rgba(10,107,207,0.3)", color: "#0A6BCF", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", justifyContent: "center", alignItems: "center" },

  noteArea: { width: "100%", minHeight: 80, fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#0E2C56", padding: "10px 12px", border: "1px solid #E1E8F0", borderRadius: 10, outline: "none", resize: "vertical", background: "#FBFDFF" },
  noteRow: { display: "flex", gap: 12, padding: 14, border: "1px solid #E1E8F0", borderRadius: 10, background: "#FBFDFF" },
  noteAv: { width: 32, height: 32, borderRadius: "50%", background: "rgba(10,107,207,0.14)", color: "#0A6BCF", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600, flexShrink: 0 },

  stickyFoot: { position: "absolute", left: 0, right: 0, bottom: 0, background: "#FFFFFF", borderTop: "1px solid #E1E8F0", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 -6px 16px rgba(14,44,86,0.06)", zIndex: 2 },
};

const m = {
  scrim: { position: "absolute", inset: 0, background: "rgba(14,44,86,0.45)", backdropFilter: "blur(2px)", display: "grid", placeItems: "center", zIndex: 10 },
  modal: { width: 580, background: "#FFFFFF", borderRadius: 16, boxShadow: "0 24px 60px rgba(14,44,86,0.25)", overflow: "hidden" },
  head: { display: "flex", alignItems: "flex-start", gap: 14, padding: "22px 24px 18px", borderBottom: "1px solid #F0F4F9" },
  close: { marginLeft: "auto", background: "transparent", border: "1px solid #E1E8F0", padding: 6, borderRadius: 8, cursor: "pointer", display: "grid", placeItems: "center" },
  body: { padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 },
  field: { display: "flex", flexDirection: "column" },
  label: { fontSize: 13, fontWeight: 500, color: "#0E2C56", marginBottom: 6 },
  selectWrap: { display: "flex", alignItems: "center", height: 44, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10, cursor: "pointer" },
  helpRow: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 8 },
  optChip: { fontSize: 11.5, padding: "3px 9px", borderRadius: 999, background: "#F8FBFF", color: "#6B7280", border: "1px solid #E1E8F0" },
  optChipSel: { background: "#FCE9E9", color: "#DC2626", borderColor: "rgba(220,38,38,0.3)", fontWeight: 600 },
  textarea: { minHeight: 110, fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: "#0E2C56", padding: "12px 14px", border: "1px solid #E1E8F0", borderRadius: 10, outline: "none", resize: "vertical", lineHeight: 1.5 },
  toggleRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 12 },
  toggle: { position: "relative", width: 40, height: 24, borderRadius: 999, background: "#E1E8F0", cursor: "pointer", flexShrink: 0 },
  toggleOn: { background: "#0A6BCF" },
  toggleKnobOn: { position: "absolute", left: 19, top: 3, width: 18, height: 18, borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 1px 3px rgba(14,44,86,0.18)" },
  foot: { display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px 20px", borderTop: "1px solid #F0F4F9" },
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
