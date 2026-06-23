/* global React, ReactDOM, AdminIc, AdminSidebar, AdminHeader */
const Ic = AdminIc;

// ============================================================
// MENU
// ============================================================
const SECTIONS = [
  { id: "general",       label: "General",                        icon: "building-2" },
  { id: "commission",    label: "Comisiones y precios",           icon: "percent" },
  { id: "sla",           label: "Tiempos y SLA",                  icon: "timer" },
  { id: "cancel",        label: "Cancelaciones y penalizaciones", icon: "ban" },
  { id: "payments",      label: "Pagos y retiros",                icon: "wallet" },
  { id: "notifications", label: "Notificaciones",                 icon: "bell" },
  { id: "security",      label: "Seguridad y auditoría",          icon: "shield-check" },
  { id: "integrations",  label: "Integraciones",                  icon: "plug-zap", count: 4 },
  { id: "legal",         label: "Términos y políticas legales",   icon: "file-text" },
  { id: "team",          label: "Equipo y permisos",              icon: "users-round" },
];

const AUDIT = [
  { author: "Sofía Martínez",     field: "Comisión Plomería",   from: "15%",     to: "12%",     time: "Hoy · 14:18", role: "Admin Soporte" },
  { author: "Javier Olvera",      field: "SLA disputas",         from: "8 h",    to: "4 h",     time: "18/05 · 09:42", role: "Super Admin" },
  { author: "Sofía Martínez",     field: "Comisión OXXO",        from: "3.5%",   to: "3.8%",   time: "17/05 · 16:14", role: "Admin Soporte" },
  { author: "Javier Olvera",      field: "Ventana sin costo",   from: "2 h",    to: "4 h",     time: "15/05 · 11:08", role: "Super Admin" },
];

// ============================================================
// SECTION MENU
// ============================================================
function SectionMenu({ active }) {
  return (
    <aside style={cf.menuCard}>
      <div style={cf.menuHead}>
        <Ic name="settings" size={14} color="#0E2C56" />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#0E2C56" }}>Configuración</span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#9CA3AF", background: "#FCE9E9", color: "#DC2626", padding: "1px 7px", borderRadius: 999, fontWeight: 700 }}>SUPER ADMIN</span>
      </div>
      <div style={cf.menuList}>
        {SECTIONS.map((s) => {
          const isActive = s.id === active;
          return (
            <div key={s.id} style={{ ...cf.menuItem, ...(isActive ? cf.menuItemActive : null) }}>
              {isActive && <span style={cf.menuIndicator} />}
              <Ic name={s.icon} size={15} color={isActive ? "#0A6BCF" : "#6B7280"} />
              <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 500, color: isActive ? "#0A6BCF" : "#0E2C56" }}>{s.label}</span>
              {s.count && <span style={cf.countPill}>{s.count}</span>}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

// ============================================================
// SECTION HEADER
// ============================================================
function SectionHead({ icon, title, sub }) {
  return (
    <div style={cf.sectionHead}>
      <div style={cf.sectionIcon}><Ic name={icon} size={20} color="#0A6BCF" /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2 style={cf.sectionTitle}>{title}</h2>
        <p style={cf.sectionSub}>{sub}</p>
      </div>
      <span style={cf.dotChange}><span style={cf.changePulse} /> 3 cambios sin guardar</span>
    </div>
  );
}

// ============================================================
// COMMISSION SECTION
// ============================================================
function CommissionSection() {
  return (
    <div style={cf.body}>
      <SectionHead icon="percent" title="Comisiones y precios"
        sub="Comisión global, overrides por método de pago y programa de bienvenida para nuevos técnicos." />

      <div style={cf.grid2}>
        {/* Comisión global */}
        <ConfigCard title="Comisión global" icon="hash"
          sub="Se aplica a todas las categorías que no tengan comisión específica.">
          <div style={cf.fieldRow}>
            <label style={cf.label}>Porcentaje de comisión default</label>
            <div style={cf.percentBig}>
              <input type="number" defaultValue="15" style={cf.percentInputBig} />
              <span style={cf.percentSignBig}>%</span>
            </div>
          </div>
          <div style={cf.fieldHint}>
            <Ic name="info" size={12} color="#0A6BCF" />
            <span>2 categorías tienen overrides: <b style={{ color: "#0E2C56", fontWeight: 600 }}>Plomería 12%</b> · <b style={{ color: "#0E2C56", fontWeight: 600 }}>Electricidad 14%</b></span>
          </div>
          <div style={cf.applyAll}>
            <div>
              <div style={{ fontSize: 12.5, color: "#0E2C56", fontWeight: 600 }}>Aplicar a todas las categorías</div>
              <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>Sobrescribe los overrides existentes. Requiere confirmación.</div>
            </div>
            <button style={cf.btnGhost}><Ic name="arrow-down-to-line" size={12} color="#0A6BCF" style={{ marginRight: 6 }} />Aplicar a todas</button>
          </div>
        </ConfigCard>

        {/* Comisión por método */}
        <ConfigCard title="Comisión por método de pago" icon="credit-card"
          sub="Se suma a la comisión global. Cubre comisiones bancarias.">
          {[
            { method: "Tarjeta",    icon: "credit-card", color: "#0A6BCF", pct: "3.5", note: "Visa / Mastercard" },
            { method: "OXXO Pay",   icon: "store",       color: "#B45309", pct: "3.8", note: "Comisión OXXO + IVA", changed: true },
            { method: "MP wallet",  icon: "wallet",      color: "#0884B0", pct: "1.5", note: "Saldo en cuenta MP" },
            { method: "Efectivo",   icon: "banknote",    color: "#18A66A", pct: "0.0", note: "Sin comisión adicional" },
          ].map((m) => (
            <div key={m.method} style={cf.methodRow}>
              <div style={{ ...cf.methodIcon, background: `${m.color}1A` }}>
                <Ic name={m.icon} size={14} color={m.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0E2C56" }}>{m.method}</span>
                  {m.changed && <span style={cf.changedPill}>modificado</span>}
                </div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{m.note}</div>
              </div>
              <div style={cf.percentSm}>
                <input type="number" defaultValue={m.pct} step="0.1" style={cf.percentInputSm} />
                <span style={cf.percentSignSm}>%</span>
              </div>
            </div>
          ))}
        </ConfigCard>
      </div>

      <div style={cf.grid2}>
        {/* Tarifa base */}
        <ConfigCard title="Tarifa base por defecto" icon="tag"
          sub="Precios mínimos, máximos y sugeridos por subcategoría.">
          <div style={cf.referLink}>
            <Ic name="folder-tree" size={16} color="#0A6BCF" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: "#0E2C56", fontWeight: 500 }}>Configurado en el módulo Catálogo</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 3 }}>10 categorías · 47 subcategorías · última edición 12/05/2026</div>
            </div>
            <a href="#" style={cf.linkBtn}>Ir a Catálogo <Ic name="arrow-right" size={12} color="#0A6BCF" /></a>
          </div>
        </ConfigCard>

        {/* Programa de comisión reducida */}
        <ConfigCard title="Programa de comisión reducida"
          icon="rocket"
          sub="Comisión preferente durante los primeros días de actividad de cada técnico nuevo."
          headRight={
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: "#0E2C56", fontWeight: 600 }}>Activo</span>
              <div style={{ ...cf.toggle, ...cf.toggleOn }}><span style={{ ...cf.toggleKnob, ...cf.toggleKnobOn }} /></div>
            </div>
          }
        >
          <div style={cf.dualField}>
            <div style={cf.miniField}>
              <label style={cf.labelSm}>Comisión durante el programa</label>
              <div style={cf.percentBig}>
                <input type="number" defaultValue="10" style={cf.percentInputBig} />
                <span style={cf.percentSignBig}>%</span>
              </div>
            </div>
            <div style={cf.miniField}>
              <label style={cf.labelSm}>Duración del programa</label>
              <div style={cf.daysBox}>
                <input type="number" defaultValue="90" style={cf.daysInput} />
                <span style={cf.daysSign}>días</span>
              </div>
            </div>
          </div>
          <div style={cf.fieldHint}>
            <Ic name="users" size={12} color="#18A66A" />
            <span><b style={{ color: "#0E2C56", fontWeight: 600 }}>32 técnicos</b> actualmente bajo el programa · ahorro acumulado <b style={{ color: "#18A66A", fontWeight: 600 }}>$24,180 MXN</b></span>
          </div>
        </ConfigCard>
      </div>

      <AuditTrail />
    </div>
  );
}

// ============================================================
// CANCEL SECTION
// ============================================================
function CancelSection() {
  return (
    <div style={cf.body}>
      <SectionHead icon="ban" title="Cancelaciones y penalizaciones"
        sub="Políticas para clientes y técnicos · gestión de no-shows y tiempos de aceptación." />

      <div style={cf.grid2}>
        {/* Cliente */}
        <ConfigCard title="Política de cancelación del cliente" icon="user-x">
          <div style={cf.dualField}>
            <div style={cf.miniField}>
              <label style={cf.labelSm}>Ventana sin costo</label>
              <div style={cf.daysBox}>
                <input type="number" defaultValue="4" style={cf.daysInput} />
                <span style={cf.daysSign}>horas antes</span>
              </div>
            </div>
            <div style={cf.miniField}>
              <label style={cf.labelSm}>Penalización tardía</label>
              <div style={cf.percentBig}>
                <input type="number" defaultValue="15" style={cf.percentInputBig} />
                <span style={cf.percentSignBig}>%</span>
              </div>
              <div style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 4 }}>de la tarifa base</div>
            </div>
          </div>
          <div style={cf.toggleField}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: "#0E2C56", fontWeight: 600 }}>Cobrar penalización automáticamente</div>
              <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 2 }}>Se carga a la tarjeta o saldo del cliente al confirmar la cancelación.</div>
            </div>
            <div style={{ ...cf.toggle, ...cf.toggleOn }}><span style={{ ...cf.toggleKnob, ...cf.toggleKnobOn }} /></div>
          </div>
          <div style={cf.fieldHint}>
            <Ic name="info" size={12} color="#0A6BCF" />
            <span>El cliente verá esta política al confirmar el servicio.</span>
          </div>
        </ConfigCard>

        {/* Técnico */}
        <ConfigCard title="Política de cancelación del técnico" icon="hard-hat">
          <div style={cf.miniField}>
            <label style={cf.labelSm}>Máximo de cancelaciones permitidas en 30 días</label>
            <div style={cf.daysBox}>
              <input type="number" defaultValue="3" style={cf.daysInput} />
              <span style={cf.daysSign}>cancelaciones</span>
            </div>
          </div>
          <div style={cf.warnBox}>
            <Ic name="alert-triangle" size={14} color="#B45309" />
            <div>
              <b style={{ color: "#7B3E07", fontWeight: 600 }}>Al exceder el límite</b>
              <span style={{ color: "#6B7280" }}> la cuenta del técnico entra en revisión automática por el equipo de operaciones. Durante la revisión, el técnico no recibe nuevas solicitudes.</span>
            </div>
          </div>
          <div style={cf.statRow}>
            <div>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 20, color: "#0E2C56" }}>4</div>
              <div style={{ fontSize: 11, color: "#9CA3AF" }}>técnicos en revisión hoy</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 20, color: "#0E2C56" }}>1.8%</div>
              <div style={{ fontSize: 11, color: "#9CA3AF" }}>tasa promedio de cancelación</div>
            </div>
          </div>
        </ConfigCard>
      </div>

      <div style={cf.grid2}>
        {/* No-show */}
        <ConfigCard title="No-show del cliente" icon="user-minus"
          sub="Cuando el cliente no está disponible al momento de la visita.">
          <div style={cf.miniField}>
            <label style={cf.labelSm}>Tiempo de espera del técnico</label>
            <div style={cf.daysBox}>
              <input type="number" defaultValue="20" style={cf.daysInput} />
              <span style={cf.daysSign}>minutos</span>
            </div>
          </div>
          <div style={cf.flow}>
            <div style={cf.sectionLabel}>Flujo de no-show</div>
            <ol style={cf.flowSteps}>
              <li><b style={{ color: "#0E2C56", fontWeight: 600 }}>1.</b> Técnico toca timbre y espera al cliente.</li>
              <li><b style={{ color: "#0E2C56", fontWeight: 600 }}>2.</b> Pasados 20 min, marca "No-show" en la app + sube foto del exterior con geolocalización.</li>
              <li><b style={{ color: "#0E2C56", fontWeight: 600 }}>3.</b> Cliente recibe push + email; tarifa de visita ($280 MXN) se cobra automáticamente.</li>
              <li><b style={{ color: "#0E2C56", fontWeight: 600 }}>4.</b> Soporte revisa la evidencia y cierra el caso en menos de 2 horas.</li>
            </ol>
          </div>
        </ConfigCard>

        {/* Aceptación */}
        <ConfigCard title="Tiempo de aceptación de solicitud" icon="alarm-clock">
          <div style={cf.miniField}>
            <label style={cf.labelSm}>Minutos para aceptar o rechazar una solicitud</label>
            <div style={cf.daysBox}>
              <input type="number" defaultValue="30" style={cf.daysInput} />
              <span style={cf.daysSign}>minutos</span>
            </div>
          </div>
          <div style={cf.toggleField}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: "#0E2C56", fontWeight: 600 }}>Reasignar automáticamente si expira</div>
              <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 2 }}>Si el técnico no responde, el sistema busca al siguiente mejor candidato en la zona.</div>
            </div>
            <div style={{ ...cf.toggle, ...cf.toggleOn }}><span style={{ ...cf.toggleKnob, ...cf.toggleKnobOn }} /></div>
          </div>
          <div style={cf.statBlock}>
            <Ic name="trending-up" size={14} color="#18A66A" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, color: "#0E2C56", fontWeight: 600 }}>97% de solicitudes se aceptan en menos de 8 min</div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>Solo 1.2% expira sin respuesta · vs. 4.8% hace 3 meses</div>
            </div>
          </div>
        </ConfigCard>
      </div>

      <AuditTrail />
    </div>
  );
}

// ============================================================
// AUDIT TRAIL
// ============================================================
function AuditTrail() {
  return (
    <div style={cf.auditCard}>
      <div style={cf.auditHead}>
        <Ic name="history" size={15} color="#0A6BCF" />
        <span style={{ fontSize: 13.5, fontWeight: 600, color: "#0E2C56" }}>Últimos cambios en este módulo</span>
        <span style={{ marginLeft: 8, fontSize: 11, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>4 eventos</span>
        <a href="#" style={{ marginLeft: "auto", color: "#0A6BCF", textDecoration: "none", fontSize: 12, fontWeight: 500 }}>Ver bitácora completa <Ic name="arrow-right" size={11} color="#0A6BCF" /></a>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={cf.auditTh}>Autor</th>
            <th style={cf.auditTh}>Campo</th>
            <th style={{ ...cf.auditTh, textAlign: "right" }}>De</th>
            <th style={{ ...cf.auditTh, textAlign: "right" }}>A</th>
            <th style={{ ...cf.auditTh, textAlign: "right" }}>Cuándo</th>
          </tr>
        </thead>
        <tbody>
          {AUDIT.map((a, i) => (
            <tr key={i} style={cf.auditTr}>
              <td style={cf.auditTd}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ ...cf.miniAv, background: a.role === "Super Admin" ? "rgba(220,38,38,0.10)" : "rgba(10,107,207,0.14)", color: a.role === "Super Admin" ? "#DC2626" : "#0A6BCF" }}>{initials(a.author)}</div>
                  <div>
                    <div style={{ fontSize: 12.5, color: "#0E2C56", fontWeight: 500 }}>{a.author}</div>
                    <div style={{ fontSize: 10.5, color: "#9CA3AF" }}>{a.role}</div>
                  </div>
                </div>
              </td>
              <td style={{ ...cf.auditTd, fontSize: 12.5, color: "#0E2C56" }}>{a.field}</td>
              <td style={{ ...cf.auditTd, textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#9CA3AF", textDecoration: "line-through" }}>{a.from}</td>
              <td style={{ ...cf.auditTd, textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#0A6BCF", fontWeight: 600 }}>{a.to}</td>
              <td style={{ ...cf.auditTd, textAlign: "right", fontSize: 11.5, color: "#6B7280", fontFamily: "'JetBrains Mono', monospace" }}>{a.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// CONFIG CARD
// ============================================================
function ConfigCard({ title, sub, icon, headRight, children }) {
  return (
    <div style={cf.card}>
      <div style={cf.cardHead}>
        <div style={cf.cardIcon}><Ic name={icon} size={14} color="#0A6BCF" /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={cf.cardTitle}>{title}</div>
          {sub && <div style={cf.cardSub}>{sub}</div>}
        </div>
        {headRight}
      </div>
      <div style={cf.cardBody}>{children}</div>
    </div>
  );
}

// ============================================================
// RE-AUTH MODAL
// ============================================================
function ReauthModal() {
  return (
    <div style={cf.scrim}>
      <div style={cf.modal}>
        <div style={cf.modalHead}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(220,38,38,0.10)", display: "grid", placeItems: "center" }}>
            <Ic name="shield-check" size={22} color="#DC2626" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#0E2C56" }}>Confirma tu identidad</div>
            <div style={{ fontSize: 13, color: "#6B7280", marginTop: 3 }}>
              Los cambios afectan la comisión y el flujo de pagos. Necesitamos validar que eres tú antes de guardar.
            </div>
          </div>
          <button style={cf.closeBtn}><Ic name="x" size={15} color="#6B7280" /></button>
        </div>

        <div style={cf.modalBody}>
          <div style={cf.changesSummary}>
            <div style={cf.summaryLabel}>3 CAMBIOS A APLICAR</div>
            <SummaryRow field="Comisión global" from="15%" to="12%" />
            <SummaryRow field="Comisión OXXO Pay" from="3.5%" to="3.8%" />
            <SummaryRow field="Programa de bienvenida · días" from="60 días" to="90 días" />
          </div>

          <div style={cf.field}>
            <label style={cf.modalLabel}>Contraseña</label>
            <div style={cf.modalInput}>
              <Ic name="lock" size={14} color="#9CA3AF" style={{ marginLeft: 12 }} />
              <input type="password" defaultValue="••••••••••••" style={cf.modalInputField} />
              <Ic name="eye" size={14} color="#9CA3AF" style={{ marginRight: 12 }} />
            </div>
          </div>

          <div style={cf.field}>
            <label style={cf.modalLabel}>Código MFA · App autenticadora</label>
            <div style={cf.mfaRow}>
              {["4", "8", "2", "7", "1", "9"].map((d, i) => (
                <div key={i} style={cf.mfaBox}>{d}</div>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: "#9CA3AF", marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <Ic name="timer" size={11} color="#9CA3AF" />
              <span>El código expira en <b style={{ color: "#0A6BCF", fontWeight: 600 }}>00:18</b></span>
            </div>
          </div>

          <div style={cf.confirmCheck}>
            <input type="checkbox" style={{ ...cf.checkbox, marginTop: 3 }} defaultChecked />
            <div>
              <div style={{ fontSize: 12.5, color: "#0E2C56", fontWeight: 500 }}>
                Entiendo que estos cambios afectan a 4,832 clientes y 142 técnicos activos.
              </div>
              <div style={{ fontSize: 11, color: "#6B7280", marginTop: 3 }}>
                Quedará registro en la bitácora a nombre de Sofía Martínez (Admin Soporte) con timestamp 19/05/2026 14:42.
              </div>
            </div>
          </div>
        </div>

        <div style={cf.modalFoot}>
          <button style={cf.btnGhost}>Cancelar</button>
          <button style={cf.btnPrimaryLg}>
            <Ic name="check" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />
            Confirmar y guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ field, from, to }) {
  return (
    <div style={cf.summaryRow}>
      <span style={{ fontSize: 12.5, color: "#0E2C56", fontWeight: 500 }}>{field}</span>
      <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#9CA3AF", textDecoration: "line-through" }}>{from}</span>
        <Ic name="arrow-right" size={11} color="#9CA3AF" />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: "#0A6BCF", fontWeight: 700 }}>{to}</span>
      </span>
    </div>
  );
}

function initials(n) { return n.split(" ").slice(0, 2).map(s => s[0]).join("").toUpperCase(); }

// ============================================================
// COMPOSITION
// ============================================================
function Screen({ active, modal = false }) {
  const heights = { commission: 1500, cancel: 1400 };
  return (
    <div style={{ display: "flex", width: 1440, height: heights[active] || 1400, background: "#F8FBFF", fontFamily: "'Inter', sans-serif", position: "relative" }}>
      <AdminSidebar active="settings" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AdminHeader crumbs={["Inicio", "Configuración"]} />
        <main style={cf.main}>
          <div style={cf.pageHead}>
            <div>
              <h1 style={cf.h1}>Configuración del sistema</h1>
              <p style={cf.sub}>Parámetros globales de la plataforma · solo Super Admin.</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={cf.btnGhost}><Ic name="history" size={14} color="#0E2C56" style={{ marginRight: 8 }} />Bitácora completa</button>
              <button style={cf.btnGhost}><Ic name="download" size={14} color="#0E2C56" style={{ marginRight: 8 }} />Exportar config</button>
            </div>
          </div>

          <div style={cf.split}>
            <SectionMenu active={active} />
            <div style={{ minWidth: 0 }}>
              {active === "commission" && <CommissionSection />}
              {active === "cancel" && <CancelSection />}
            </div>
          </div>

          {/* Sticky save bar */}
          <div style={cf.stickyFoot}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={cf.changeDot} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0E2C56" }}>Tienes 3 cambios sin guardar</div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                  Comisión global · Comisión OXXO Pay · Programa de bienvenida
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={cf.btnGhost}>Descartar</button>
              <button style={cf.btnPrimary}>
                <Ic name="shield-check" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />
                Guardar · requiere MFA
              </button>
            </div>
          </div>

          {modal && <ReauthModal />}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="settings" title="Configuración del sistema" subtitle="Comisiones · Cancelaciones · Re-auth modal">
        <DCArtboard id="commission" label="Comisiones y precios" width={1440} height={1500}>
          <Screen active="commission" />
        </DCArtboard>
        <DCArtboard id="cancel" label="Cancelaciones y penalizaciones" width={1440} height={1400}>
          <Screen active="cancel" />
        </DCArtboard>
        <DCArtboard id="reauth" label="Re-auth modal · MFA antes de guardar" width={1440} height={1500}>
          <Screen active="commission" modal={true} />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// ============================================================
// STYLES
// ============================================================
const cf = {
  main: { flex: 1, padding: "28px 32px 100px", display: "flex", flexDirection: "column", gap: 24, color: "#0E2C56", position: "relative" },
  pageHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  h1: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 28, margin: 0, letterSpacing: "-0.01em" },
  sub: { fontSize: 13.5, color: "#6B7280", margin: "4px 0 0" },
  btnPrimary: { background: "#0A6BCF", color: "#FFFFFF", border: "1px solid #0A6BCF", borderRadius: 10, padding: "10px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", boxShadow: "0 1px 2px rgba(10,107,207,0.25)" },
  btnPrimaryLg: { background: "#0A6BCF", color: "#FFFFFF", border: "1px solid #0A6BCF", borderRadius: 10, padding: "12px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", boxShadow: "0 1px 3px rgba(10,107,207,0.3)" },
  btnGhost: { background: "#FFFFFF", color: "#0E2C56", border: "1px solid #E1E8F0", borderRadius: 10, padding: "9px 14px", fontWeight: 500, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center" },

  split: { display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "flex-start" },

  /* Menu */
  menuCard: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, overflow: "hidden", position: "sticky", top: 24 },
  menuHead: { display: "flex", alignItems: "center", gap: 8, padding: "14px 16px", borderBottom: "1px solid #F0F4F9" },
  menuList: { padding: "8px 8px" },
  menuItem: { position: "relative", display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 2 },
  menuItemActive: { background: "rgba(10,107,207,0.06)" },
  menuIndicator: { position: "absolute", left: -4, top: 8, bottom: 8, width: 3, background: "#0A6BCF", borderRadius: 3 },
  countPill: { marginLeft: "auto", fontSize: 10, color: "#0884B0", background: "#E0F6FF", padding: "1px 7px", borderRadius: 999, fontWeight: 700 },

  /* Section head */
  body: { display: "flex", flexDirection: "column", gap: 20 },
  sectionHead: { display: "flex", alignItems: "center", gap: 14, padding: "20px 22px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16 },
  sectionIcon: { width: 44, height: 44, borderRadius: 12, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  sectionTitle: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 22, color: "#0E2C56", margin: 0, letterSpacing: "-0.01em" },
  sectionSub: { fontSize: 13, color: "#6B7280", margin: "3px 0 0" },
  dotChange: { display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px", background: "#FEF3DC", color: "#B45309", borderRadius: 999, fontSize: 12, fontWeight: 600 },
  changePulse: { width: 8, height: 8, borderRadius: "50%", background: "#F59E0B", boxShadow: "0 0 0 4px rgba(245,158,11,0.18)" },

  /* Grid */
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 },

  /* Card */
  card: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, padding: 0, overflow: "hidden" },
  cardHead: { display: "flex", alignItems: "center", gap: 10, padding: "18px 20px 14px", borderBottom: "1px solid #F0F4F9" },
  cardIcon: { width: 28, height: 28, borderRadius: 7, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  cardTitle: { fontSize: 14, fontWeight: 600, color: "#0E2C56" },
  cardSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  cardBody: { padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: 14 },

  /* Fields */
  fieldRow: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12.5, color: "#0E2C56", fontWeight: 500 },
  labelSm: { fontSize: 11.5, color: "#6B7280", fontWeight: 500, marginBottom: 5, display: "block" },
  fieldHint: { display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 8, fontSize: 12, color: "#6B7280" },

  percentBig: { display: "inline-flex", alignItems: "baseline", gap: 4, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10, padding: "8px 14px", width: 140 },
  percentInputBig: { width: 70, border: "none", outline: "none", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 28, color: "#0E2C56", background: "transparent", letterSpacing: "-0.01em" },
  percentSignBig: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 22, color: "#6B7280" },
  percentSm: { display: "inline-flex", alignItems: "baseline", gap: 3, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 8, padding: "6px 12px", width: 90 },
  percentInputSm: { width: 40, border: "none", outline: "none", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 16, color: "#0E2C56", background: "transparent" },
  percentSignSm: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 14, color: "#6B7280" },
  daysBox: { display: "inline-flex", alignItems: "center", gap: 8, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10, padding: "8px 14px", width: "100%" },
  daysInput: { width: 60, border: "none", outline: "none", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 22, color: "#0E2C56", background: "transparent" },
  daysSign: { fontSize: 13, color: "#6B7280", fontWeight: 500 },

  /* Apply all */
  applyAll: { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#F8FBFF", border: "1px dashed #E1E8F0", borderRadius: 10 },

  /* Method row */
  methodRow: { display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#FBFDFF", border: "1px solid #E1E8F0", borderRadius: 10 },
  methodIcon: { width: 30, height: 30, borderRadius: 7, display: "grid", placeItems: "center", flexShrink: 0 },
  changedPill: { fontSize: 9.5, padding: "1px 6px", borderRadius: 999, background: "#FEF3DC", color: "#B45309", fontWeight: 700, letterSpacing: ".04em" },

  /* Refer link */
  referLink: { display: "flex", alignItems: "center", gap: 12, padding: 14, background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 10 },
  linkBtn: { display: "inline-flex", alignItems: "center", gap: 5, color: "#0A6BCF", textDecoration: "none", fontSize: 12.5, fontWeight: 600 },

  /* Dual / mini field */
  dualField: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  miniField: {},

  /* Toggle */
  toggleField: { display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 10 },
  toggle: { position: "relative", width: 42, height: 24, borderRadius: 999, background: "#E1E8F0", flexShrink: 0, cursor: "pointer" },
  toggleOn: { background: "#0A6BCF" },
  toggleKnob: { position: "absolute", left: 3, top: 3, width: 18, height: 18, borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 1px 2px rgba(14,44,86,0.18)" },
  toggleKnobOn: { transform: "translateX(18px)" },

  /* Warn / stat */
  warnBox: { display: "flex", gap: 10, padding: "12px 14px", background: "#FEF3DC", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 10, fontSize: 12.5, lineHeight: 1.45, alignItems: "flex-start" },
  statRow: { display: "flex", gap: 24, padding: "12px 14px", background: "#FBFDFF", border: "1px solid #E1E8F0", borderRadius: 10 },
  statBlock: { display: "flex", gap: 10, alignItems: "center", padding: "12px 14px", background: "#E5F7EE", border: "1px solid rgba(24,166,106,0.25)", borderRadius: 10 },

  /* Flow */
  flow: { padding: "14px 16px", background: "#FBFDFF", border: "1px solid #E1E8F0", borderRadius: 10 },
  sectionLabel: { fontSize: 10.5, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".08em", fontFamily: "'JetBrains Mono', monospace", marginBottom: 10 },
  flowSteps: { margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5, color: "#6B7280", lineHeight: 1.45 },

  /* Audit */
  auditCard: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, overflow: "hidden" },
  auditHead: { display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: "1px solid #F0F4F9" },
  auditTh: { textAlign: "left", padding: "10px 16px", fontSize: 10.5, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", background: "#F8FBFF", borderBottom: "1px solid #E1E8F0" },
  auditTr: { borderBottom: "1px solid #F0F4F9" },
  auditTd: { padding: "10px 16px", fontSize: 13, color: "#0E2C56", verticalAlign: "middle" },
  miniAv: { width: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 10.5, fontWeight: 600 },

  /* Sticky save bar */
  stickyFoot: { position: "absolute", left: 0, right: 0, bottom: 0, background: "#FFFFFF", borderTop: "1px solid #E1E8F0", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 -8px 24px rgba(14,44,86,0.08)", zIndex: 5 },
  changeDot: { width: 10, height: 10, borderRadius: "50%", background: "#F59E0B", boxShadow: "0 0 0 4px rgba(245,158,11,0.18)" },

  /* Modal */
  scrim: { position: "absolute", inset: 0, background: "rgba(14,44,86,0.5)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", zIndex: 20 },
  modal: { width: 580, background: "#FFFFFF", borderRadius: 16, boxShadow: "0 24px 60px rgba(14,44,86,0.3)", overflow: "hidden" },
  modalHead: { display: "flex", alignItems: "flex-start", gap: 14, padding: "22px 24px 18px", borderBottom: "1px solid #F0F4F9" },
  closeBtn: { background: "transparent", border: "1px solid #E1E8F0", padding: 6, borderRadius: 8, cursor: "pointer", display: "grid", placeItems: "center" },
  modalBody: { padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 },

  changesSummary: { background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6 },
  summaryLabel: { fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".08em", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 },
  summaryRow: { display: "flex", alignItems: "center", padding: "5px 0" },

  field: { display: "flex", flexDirection: "column" },
  modalLabel: { fontSize: 12.5, color: "#0E2C56", fontWeight: 500, marginBottom: 6 },
  modalInput: { display: "flex", alignItems: "center", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10, height: 44 },
  modalInputField: { flex: 1, border: "none", outline: "none", background: "transparent", padding: "0 12px", fontSize: 14, color: "#0E2C56", fontFamily: "'JetBrains Mono', monospace" },
  mfaRow: { display: "grid", gridTemplateColumns: "repeat(6, 48px)", gap: 8 },
  mfaBox: { width: 48, height: 48, borderRadius: 10, border: "1px solid #0A6BCF", background: "#F4F8FE", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 22, color: "#0E2C56", boxShadow: "0 0 0 3px rgba(10,107,207,0.10)" },

  confirmCheck: { display: "flex", gap: 12, padding: "12px 14px", background: "#FBFDFF", border: "1px solid #E1E8F0", borderRadius: 10, alignItems: "flex-start" },
  checkbox: { width: 16, height: 16, accentColor: "#0A6BCF" },

  modalFoot: { display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px 20px", borderTop: "1px solid #F0F4F9" },
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
