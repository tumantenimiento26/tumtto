/* global React */
/* Shared admin shell: Sidebar, Header, Icon helper, user mock.
 * Exposes globals: AdminIc, AdminSidebar, AdminHeader, ADMIN_USER, adminStyles.
 * Load BEFORE any page-specific JSX that consumes these.
 */
const { useEffect: aUE, useRef: aUR, useState: aUS } = React;

const ADMIN_USER = { name: "Sofía Martínez", role: "Admin Soporte", initials: "SM" };

function AdminIc({ name, size = 16, stroke = 1.75, color = "currentColor", style }) {
  const ref = aUR(null);
  aUE(() => {
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

function AdminSidebar({ active = "dashboard", expanded = null }) {
  const items = [
    { id: "dashboard", icon: "layout-dashboard", label: "Dashboard" },
    { id: "users", icon: "users", label: "Usuarios", sub: [
      { id: "clients", label: "Clientes" },
      { id: "technicians", label: "Técnicos" },
    ]},
    { id: "services", icon: "wrench", label: "Servicios" },
    { id: "catalog", icon: "folder-tree", label: "Catálogo" },
    { id: "regions", icon: "map", label: "Regiones y cobertura" },
    { id: "finance", icon: "wallet", label: "Finanzas" },
    { id: "support", icon: "life-buoy", label: "Soporte y disputas", count: 3 },
    { id: "reports", icon: "bar-chart-3", label: "Reportes" },
    { id: "settings", icon: "settings", label: "Configuración" },
  ];
  const isExpanded = (it) => expanded === it.id || (it.sub && it.sub.some((s) => s.id === active));

  return (
    <aside style={adminStyles.sb.wrap}>
      <div style={adminStyles.sb.brand}>
        <img src="assets/brand/isotipo-blanco.svg" alt="" style={{ width: 28, height: 28 }} />
        <div>
          <div style={adminStyles.sb.brandWord}>Tumantenimiento</div>
          <div style={adminStyles.sb.brandSub}>Admin Panel</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "8px 12px", overflow: "hidden" }}>
        {items.map((it) => {
          const isActive = active === it.id;
          const showSub = it.sub && isExpanded(it);
          return (
            <div key={it.id}>
              <div style={{ ...adminStyles.sb.item, ...(isActive ? adminStyles.sb.itemActive : null) }}>
                {isActive && <span style={adminStyles.sb.indicator} />}
                <AdminIc name={it.icon} size={18} color={isActive ? "#FFFFFF" : "rgba(255,255,255,0.75)"} />
                <span style={{ ...adminStyles.sb.itemLabel, color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.78)" }}>{it.label}</span>
                {it.count != null && <span style={adminStyles.sb.count}>{it.count}</span>}
                {it.sub && (
                  <AdminIc
                    name={showSub ? "chevron-down" : "chevron-right"}
                    size={14}
                    color="rgba(255,255,255,0.5)"
                    style={{ marginLeft: it.count != null ? 6 : "auto" }}
                  />
                )}
              </div>
              {showSub && (
                <div style={{ paddingLeft: 38, marginTop: 2, marginBottom: 6 }}>
                  {it.sub.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        ...adminStyles.sb.subItem,
                        ...(active === s.id ? adminStyles.sb.subItemActive : null),
                      }}
                    >{s.label}</div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div style={adminStyles.sb.footer}>
        <div style={adminStyles.sb.avSm}>{ADMIN_USER.initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={adminStyles.sb.userName}>{ADMIN_USER.name}</div>
          <div style={adminStyles.sb.userRole}>{ADMIN_USER.role}</div>
        </div>
        <button style={adminStyles.sb.logout} aria-label="Cerrar sesión">
          <AdminIc name="log-out" size={16} color="rgba(255,255,255,0.7)" />
        </button>
      </div>
    </aside>
  );
}

function AdminHeader({ crumbs = ["Inicio", "Dashboard"] }) {
  return (
    <header style={adminStyles.hd.wrap}>
      <div style={adminStyles.hd.crumbs}>
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <AdminIc name="chevron-right" size={12} color="#9CA3AF" />}
            <span style={i === crumbs.length - 1 ? { color: "#0E2C56", fontWeight: 500 } : { color: "#9CA3AF" }}>{c}</span>
          </React.Fragment>
        ))}
      </div>

      <div style={adminStyles.hd.searchWrap}>
        <AdminIc name="search" size={16} color="#9CA3AF" style={{ marginLeft: 14 }} />
        <input
          placeholder="Buscar por nombre, ID de servicio, email o teléfono…"
          style={adminStyles.hd.search}
        />
        <span style={adminStyles.hd.kbd}>⌘ K</span>
      </div>

      <div style={adminStyles.hd.actions}>
        <button style={adminStyles.hd.iconBtn} aria-label="Ayuda">
          <AdminIc name="help-circle" size={18} color="#6B7280" />
        </button>
        <button style={adminStyles.hd.iconBtn} aria-label="Notificaciones">
          <AdminIc name="bell" size={18} color="#6B7280" />
          <span style={adminStyles.hd.notif}>3</span>
        </button>
        <div style={adminStyles.hd.userPill}>
          <div style={adminStyles.hd.av}>{ADMIN_USER.initials}</div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0E2C56" }}>{ADMIN_USER.name}</div>
            <div style={{ fontSize: 11, color: "#6B7280" }}>{ADMIN_USER.role}</div>
          </div>
          <AdminIc name="chevron-down" size={14} color="#9CA3AF" style={{ marginLeft: 6 }} />
        </div>
      </div>
    </header>
  );
}

const adminStyles = {
  sb: {
    wrap: { width: 240, background: "#0E2C56", color: "#FFFFFF", display: "flex", flexDirection: "column", flexShrink: 0, height: "100%", borderRight: "1px solid rgba(255,255,255,0.04)" },
    brand: { display: "flex", alignItems: "center", gap: 10, padding: "20px 18px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" },
    brandWord: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: "-0.01em", lineHeight: 1.1 },
    brandSub: { fontSize: 10.5, color: "rgba(255,255,255,0.5)", marginTop: 3, letterSpacing: ".08em", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" },
    item: { position: "relative", display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 2, transition: "background .15s" },
    itemActive: { background: "rgba(10,107,207,0.20)" },
    indicator: { position: "absolute", left: -12, top: 6, bottom: 6, width: 3, background: "#18C1FF", borderRadius: 3 },
    itemLabel: { fontSize: 13.5, fontWeight: 500, flex: 1 },
    count: { background: "rgba(220,38,38,0.18)", color: "#FCA5A5", borderRadius: 999, fontSize: 11, padding: "1px 7px", fontWeight: 600 },
    subItem: { fontSize: 12.5, color: "rgba(255,255,255,0.6)", borderRadius: 6, cursor: "pointer", padding: "6px 12px", marginBottom: 1 },
    subItemActive: { color: "#18C1FF", fontWeight: 600, background: "rgba(24,193,255,0.10)" },
    footer: { padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 },
    avSm: { width: 32, height: 32, borderRadius: "50%", background: "rgba(10,107,207,0.3)", display: "grid", placeItems: "center", color: "#FFFFFF", fontSize: 12, fontWeight: 600 },
    userName: { fontSize: 13, fontWeight: 600, color: "#FFFFFF", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    userRole: { fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 2 },
    logout: { background: "transparent", border: "1px solid rgba(255,255,255,0.08)", padding: 6, borderRadius: 8, cursor: "pointer", display: "grid", placeItems: "center" },
  },
  hd: {
    wrap: { height: 64, display: "flex", alignItems: "center", gap: 24, padding: "0 28px", background: "#FFFFFF", borderBottom: "1px solid #E1E8F0", flexShrink: 0 },
    crumbs: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#0E2C56", minWidth: 0, flexShrink: 0 },
    searchWrap: { flex: 1, maxWidth: 540, display: "flex", alignItems: "center", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 10, height: 40 },
    search: { flex: 1, border: "none", outline: "none", background: "transparent", padding: "0 12px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#0E2C56" },
    kbd: { marginRight: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#9CA3AF", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 6, padding: "2px 6px" },
    actions: { display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" },
    iconBtn: { position: "relative", background: "transparent", border: "1px solid #E1E8F0", padding: 8, borderRadius: 10, cursor: "pointer", display: "grid", placeItems: "center" },
    notif: { position: "absolute", top: -4, right: -4, background: "#DC2626", color: "#FFFFFF", fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 999, border: "2px solid #FFFFFF" },
    userPill: { display: "flex", alignItems: "center", gap: 10, padding: "4px 12px 4px 4px", border: "1px solid #E1E8F0", borderRadius: 999, cursor: "pointer", background: "#FFFFFF" },
    av: { width: 32, height: 32, borderRadius: "50%", background: "rgba(10,107,207,0.12)", color: "#0A6BCF", fontSize: 12, fontWeight: 600, display: "grid", placeItems: "center" },
  },
};

Object.assign(window, { AdminIc, AdminSidebar, AdminHeader, ADMIN_USER, adminStyles });
