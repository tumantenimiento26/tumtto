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
          <a href="UILibraryContainers.html" style={l.heroVer}>← Sección 2 · Containers</a>
        </div>
        <div style={l.heroEyebrow}>SECCIÓN 03</div>
        <div style={l.heroTitle}>Navigation</div>
        <div style={l.heroSub}>
          Andamios estructurales que conectan pantallas. Bottom tab bar, top app bar, sidebar admin web, breadcrumb y tabs. Adaptados por rol (cliente · técnico · admin).
        </div>
        <div style={l.heroMetaRow}>
          <span style={l.heroChip}><Ic name="check" size={11} color="#4ED896" /><span>Primitives</span></span>
          <span style={l.heroChip}><Ic name="check" size={11} color="#4ED896" /><span>Containers</span></span>
          <span style={l.heroChip}><Ic name="circle-dot" size={11} color="#FBBF24" /><span>Navigation · esta</span></span>
          <span style={l.heroChip}><Ic name="circle" size={11} color="rgba(255,255,255,0.45)" /><span>3 secciones por venir</span></span>
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

function ComponentBlock({ id, name, codeName, desc, badge, mobileGrid, desktopGrid, props, tokens, notes, useCases }) {
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
              <div style={l.platformRow}>
                <div style={l.platformLabel}><Ic name="smartphone" size={12} color="#0A6BCF" /><span>MOBILE · 390 px</span><span style={l.platformImpl}>React Native</span></div>
              </div>
              <div style={l.platformPanel}>{mobileGrid}</div>
            </>
          )}
          {desktopGrid && (
            <>
              <div style={l.platformRow}>
                <div style={l.platformLabel}><Ic name="monitor" size={12} color="#0A6BCF" /><span>DESKTOP · 1440 px</span><span style={l.platformImpl}>Next.js + shadcn/ui</span></div>
              </div>
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
                  <div key={idx} style={l.tokenRow}>
                    <span style={l.tokenCat}>{t.cat}</span>
                    <span style={l.tokenVal}>{t.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {notes && (
            <div>
              <div style={l.specSectionLabel}>NOTAS DE IMPLEMENTACIÓN</div>
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
// 3.1 BOTTOM TAB BAR (mobile only)
// =====================================================================
function MockPhoneFrame({ children, height = 200 }) {
  return (
    <div style={{ width: 280, margin: "0 auto", border: "8px solid #0E2C56", borderRadius: 32, padding: 0, background: "#0E2C56", overflow: "hidden" }}>
      <div style={{ height: 12, background: "#0E2C56" }} />
      <div style={{ background: "#F8FBFF", height, position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        {children}
      </div>
    </div>
  );
}

function BottomTabBar({ role = "cliente" }) {
  const roles = {
    cliente: [
      { icon: "home",           label: "Inicio",    active: true },
      { icon: "clipboard-list", label: "Servicios" },
      { icon: "message-circle", label: "Mensajes",  badge: 3 },
      { icon: "heart",          label: "Favoritos" },
      { icon: "user",           label: "Perfil" },
    ],
    tecnico: [
      { icon: "inbox",          label: "Inbox",      active: true, badge: 3 },
      { icon: "calendar-days",  label: "Agenda" },
      { icon: "wallet",         label: "Cartera" },
      { icon: "message-circle", label: "Mensajes" },
      { icon: "user",           label: "Perfil" },
    ],
    admin: [
      { icon: "layout-dashboard", label: "Inicio",   active: true },
      { icon: "headphones",       label: "Soporte",  badge: 8 },
      { icon: "users",            label: "Usuarios" },
      { icon: "wrench",           label: "Servicios" },
      { icon: "menu",             label: "Más" },
    ],
  };
  const tabs = roles[role];
  return (
    <div style={n.tabbar}>
      {tabs.map(t => (
        <div key={t.label} style={n.tabItem}>
          <div style={{ position: "relative" }}>
            <Ic name={t.icon} size={22} color={t.active ? "#0A6BCF" : "#9CA3AF"} stroke={t.active ? 2.2 : 1.8} />
            {t.badge && <span style={n.tabBadge}>{t.badge}</span>}
          </div>
          <span style={{ ...n.tabLabel, color: t.active ? "#0A6BCF" : "#9CA3AF", fontWeight: t.active ? 700 : 500 }}>{t.label}</span>
          {t.active && <div style={n.tabActiveDot} />}
        </div>
      ))}
    </div>
  );
}

function BottomTabGrid() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {[
        { role: "cliente", label: "CLIENTE · 5 tabs", color: "#0A6BCF" },
        { role: "tecnico", label: "TÉCNICO · 5 tabs · inbox priorizado", color: "#F59E0B" },
        { role: "admin",   label: "ADMIN · 5 tabs · operación", color: "#DC2626" },
      ].map(r => (
        <div key={r.role}>
          <div style={{ ...n.subLabel, color: r.color }}>{r.label}</div>
          <MockPhoneFrame height={150}>
            <div style={{ flex: 1, padding: 16, color: "#9CA3AF", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>
              Contenido de la pantalla activa
            </div>
            <BottomTabBar role={r.role} />
          </MockPhoneFrame>
        </div>
      ))}
    </div>
  );
}

// =====================================================================
// 3.2 TOP APP BAR (mobile)
// =====================================================================
function TopAppBar({ variant = "basic", scrolled }) {
  if (variant === "colored") {
    return (
      <div style={{ ...n.topbar, background: "linear-gradient(135deg,#0E2C56,#0A6BCF)", color: "#FFFFFF", borderBottom: "none" }}>
        <button style={n.topbarBtnGhostWhite}><Ic name="menu" size={16} color="#FFFFFF" /></button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={n.topbarSmallWhite}>BIENVENIDA</div>
          <div style={n.topbarTitleWhite}>Hola, María 👋</div>
        </div>
        <button style={n.topbarBtnGhostWhite}><Ic name="bell" size={16} color="#FFFFFF" /><span style={n.bellDot} /></button>
      </div>
    );
  }
  if (variant === "search") {
    return (
      <div style={n.topbar}>
        <button style={n.topbarBtn}><Ic name="arrow-left" size={16} color="#0E2C56" /></button>
        <div style={n.searchInput}>
          <Ic name="search" size={13} color="#9CA3AF" />
          <span style={{ flex: 1, fontSize: 13, color: "#0E2C56", fontWeight: 500 }}>plomería urgente</span>
          <button style={n.searchClear}><Ic name="x" size={11} color="#6B7280" /></button>
        </div>
      </div>
    );
  }
  if (variant === "scrollable") {
    return (
      <div style={{ ...n.topbar, padding: scrolled ? "12px 16px" : "20px 16px 12px", boxShadow: scrolled ? "0 2px 6px rgba(14,44,86,0.06)" : "none", transition: "all 0.2s" }}>
        <button style={n.topbarBtn}><Ic name="arrow-left" size={16} color="#0E2C56" /></button>
        <div style={{ flex: 1, minWidth: 0 }}>
          {!scrolled && <div style={n.topbarSmall}>PERFIL DEL TÉCNICO</div>}
          <div style={{ ...n.topbarTitle, fontSize: scrolled ? 14 : 18 }}>Ramón Hernández</div>
        </div>
        <button style={n.topbarBtn}><Ic name="share-2" size={15} color="#0E2C56" /></button>
        <button style={n.topbarBtn}><Ic name="more-vertical" size={15} color="#0E2C56" /></button>
      </div>
    );
  }
  return (
    <div style={n.topbar}>
      <button style={n.topbarBtn}><Ic name="arrow-left" size={16} color="#0E2C56" /></button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={n.topbarSmall}>SERVICIO ACTIVO</div>
        <div style={n.topbarTitle}>Detalle del servicio</div>
      </div>
      <button style={n.topbarBtn}><Ic name="more-vertical" size={15} color="#0E2C56" /></button>
    </div>
  );
}

function TopAppBarGrid() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {[
        { variant: "basic", label: "BASIC · back + título + meta + acción" },
        { variant: "colored", label: "COLORED · home greeting (gradient)" },
        { variant: "search", label: "SEARCH · input expandido + clear" },
        { variant: "scrollable", label: "SCROLLABLE · expanded (top)", scrolled: false },
        { variant: "scrollable", label: "SCROLLABLE · collapsed (on scroll)", scrolled: true },
      ].map((v, idx) => (
        <div key={idx}>
          <div style={n.subLabel}>{v.label}</div>
          <MockPhoneFrame height={100}>
            <TopAppBar variant={v.variant} scrolled={v.scrolled} />
            <div style={{ flex: 1, background: "#F8FBFF" }} />
          </MockPhoneFrame>
        </div>
      ))}
    </div>
  );
}

// =====================================================================
// 3.3 SIDEBAR (web only)
// =====================================================================
function Sidebar({ collapsed }) {
  const groups = [
    { label: "OPERACIÓN", items: [
      { icon: "layout-dashboard", label: "Dashboard", active: true },
      { icon: "headphones", label: "Soporte", badge: 8 },
      { icon: "alert-triangle", label: "Disputas", badge: 3, urgent: true },
      { icon: "shield-check", label: "KYC", badge: 12 },
    ]},
    { label: "GESTIÓN", items: [
      { icon: "users", label: "Clientes" },
      { icon: "hard-hat", label: "Técnicos" },
      { icon: "wrench", label: "Servicios", expand: true },
      { icon: "map-pin", label: "Regiones" },
    ]},
    { label: "FINANZAS", items: [
      { icon: "wallet", label: "Cartera" },
      { icon: "trending-up", label: "Reportes" },
    ]},
  ];
  return (
    <div style={{ ...n.sidebar, width: collapsed ? 72 : 240 }}>
      {/* Brand */}
      <div style={n.sidebarBrand}>
        <div style={n.sidebarLogo}><Ic name="zap" size={18} color="#FFFFFF" /></div>
        {!collapsed && (
          <div>
            <div style={n.sidebarBrandTitle}><span style={{ color: "#18C1FF" }}>Tu</span>mantenimiento</div>
            <div style={n.sidebarBrandChip}>ADMIN · v1.0</div>
          </div>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div style={n.sidebarSearch}>
          <Ic name="search" size={12} color="rgba(255,255,255,0.45)" />
          <span style={{ flex: 1, fontSize: 11.5, color: "rgba(255,255,255,0.55)" }}>Buscar…</span>
          <span style={n.sidebarSearchK}>⌘ K</span>
        </div>
      )}

      {/* Groups */}
      {groups.map(g => (
        <div key={g.label} style={n.sidebarGroup}>
          {!collapsed && <div style={n.sidebarGroupLabel}>{g.label}</div>}
          {g.items.map(it => (
            <div key={it.label} style={{
              ...n.sidebarItem,
              ...(it.active ? n.sidebarItemActive : null),
              padding: collapsed ? "10px 0" : "9px 12px",
              justifyContent: collapsed ? "center" : "flex-start",
            }}>
              {it.active && !collapsed && <div style={n.sidebarItemIndicator} />}
              <Ic name={it.icon} size={16} color={it.active ? "#FFFFFF" : "rgba(255,255,255,0.75)"} />
              {!collapsed && <>
                <span style={{ flex: 1, fontSize: 13, fontWeight: it.active ? 700 : 500, color: it.active ? "#FFFFFF" : "rgba(255,255,255,0.75)" }}>{it.label}</span>
                {it.badge && (
                  <span style={{ ...n.sidebarBadge, background: it.urgent ? "#DC2626" : "rgba(255,255,255,0.18)", color: "#FFFFFF" }}>{it.badge}</span>
                )}
                {it.expand && <Ic name="chevron-right" size={11} color="rgba(255,255,255,0.55)" />}
              </>}
              {collapsed && it.badge && (
                <span style={{ ...n.sidebarBadgeCollapsed, background: it.urgent ? "#DC2626" : "#F59E0B" }}>{it.badge}</span>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Footer user */}
      <div style={{ marginTop: "auto" }}>
        <div style={n.sidebarFooter}>
          <div style={n.sidebarFooterAv}>SA</div>
          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={n.sidebarFooterName}>Sofía Álvarez</div>
                <div style={n.sidebarFooterRole}>Admin · L1 ops</div>
              </div>
              <Ic name="log-out" size={13} color="rgba(255,255,255,0.55)" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SidebarGrid() {
  return (
    <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
      <div style={{ flex: 1 }}>
        <div style={n.subLabel}>EXPANDED · 240 px (default)</div>
        <div style={{ border: "1px solid #E1E8F0", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 14px rgba(14,44,86,0.06)" }}>
          <div style={{ display: "flex", height: 520 }}>
            <Sidebar />
            <div style={{ flex: 1, background: "#F8FBFF", padding: 18 }}>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: "#0E2C56" }}>Dashboard</div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>contenido de la página seleccionada</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div style={n.subLabel}>COLLAPSED · 72 px (responsive)</div>
        <div style={{ border: "1px solid #E1E8F0", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 14px rgba(14,44,86,0.06)" }}>
          <div style={{ display: "flex", height: 520 }}>
            <Sidebar collapsed />
            <div style={{ width: 200, background: "#F8FBFF", padding: 18 }}>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 15, fontWeight: 800, color: "#0E2C56" }}>Dashboard</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 3.4 BREADCRUMB (web)
// =====================================================================
function Breadcrumb({ items }) {
  return (
    <div style={n.breadcrumb}>
      <Ic name="home" size={11} color="#9CA3AF" />
      {items.map((it, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            <Ic name="chevron-right" size={11} color="#9CA3AF" />
            <span style={{ ...n.breadcrumbItem, color: isLast ? "#0E2C56" : "#0A6BCF", fontWeight: isLast ? 700 : 500, cursor: isLast ? "default" : "pointer" }}>{it}</span>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function BreadcrumbGrid() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <div style={n.subLabel}>SIMPLE · 2 NIVELES</div>
        <Breadcrumb items={["Clientes", "María Rodríguez"]} />
      </div>
      <div>
        <div style={n.subLabel}>3 NIVELES</div>
        <Breadcrumb items={["Servicios", "Activos", "#SVC-2851 · Plomería"]} />
      </div>
      <div>
        <div style={n.subLabel}>TRUNCADO · MUCHOS NIVELES</div>
        <div style={n.breadcrumb}>
          <Ic name="home" size={11} color="#9CA3AF" />
          <Ic name="chevron-right" size={11} color="#9CA3AF" />
          <span style={{ ...n.breadcrumbItem, color: "#0A6BCF" }}>Operación</span>
          <Ic name="chevron-right" size={11} color="#9CA3AF" />
          <span style={n.breadcrumbEllipsis}>···</span>
          <Ic name="chevron-right" size={11} color="#9CA3AF" />
          <span style={{ ...n.breadcrumbItem, color: "#0A6BCF" }}>Disputas</span>
          <Ic name="chevron-right" size={11} color="#9CA3AF" />
          <span style={{ ...n.breadcrumbItem, color: "#0E2C56", fontWeight: 700 }}>#TKT-2841</span>
        </div>
      </div>
      <div>
        <div style={n.subLabel}>CON BADGE STATUS</div>
        <div style={n.breadcrumb}>
          <Ic name="home" size={11} color="#9CA3AF" />
          <Ic name="chevron-right" size={11} color="#9CA3AF" />
          <span style={{ ...n.breadcrumbItem, color: "#0A6BCF" }}>KYC</span>
          <Ic name="chevron-right" size={11} color="#9CA3AF" />
          <span style={{ ...n.breadcrumbItem, color: "#0E2C56", fontWeight: 700 }}>Ramón Hernández</span>
          <span style={n.bcBadge}>EN REVISIÓN</span>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 3.5 TABS
// =====================================================================
function Tabs({ variant = "underlined", items, activeIdx = 0 }) {
  if (variant === "underlined") {
    return (
      <div style={n.tabsUnderlined}>
        {items.map((it, idx) => {
          const active = idx === activeIdx;
          return (
            <div key={idx} style={{ ...n.tabUnderlined, ...(active ? n.tabUnderlinedActive : null) }}>
              {it.icon && <Ic name={it.icon} size={12} color={active ? "#0A6BCF" : "#6B7280"} stroke={2.2} />}
              <span>{it.label}</span>
              {it.count !== undefined && <span style={{ ...n.tabsCount, background: active ? "#0A6BCF" : "rgba(14,44,86,0.06)", color: active ? "#FFFFFF" : "#6B7280" }}>{it.count}</span>}
              {active && <div style={n.tabUnderlinedBar} />}
            </div>
          );
        })}
      </div>
    );
  }
  if (variant === "pills") {
    return (
      <div style={n.tabsPills}>
        {items.map((it, idx) => {
          const active = idx === activeIdx;
          return (
            <div key={idx} style={{ ...n.tabPill, ...(active ? n.tabPillActive : null) }}>
              {it.icon && <Ic name={it.icon} size={11} color={active ? "#FFFFFF" : "#6B7280"} stroke={2.2} />}
              <span>{it.label}</span>
              {it.count !== undefined && <span style={{ ...n.tabsCount, background: active ? "rgba(255,255,255,0.22)" : "rgba(14,44,86,0.06)", color: active ? "#FFFFFF" : "#6B7280" }}>{it.count}</span>}
            </div>
          );
        })}
      </div>
    );
  }
  if (variant === "boxed") {
    return (
      <div style={n.tabsBoxed}>
        {items.map((it, idx) => {
          const active = idx === activeIdx;
          return (
            <div key={idx} style={{ ...n.tabBoxed, ...(active ? n.tabBoxedActive : null) }}>
              {it.icon && <Ic name={it.icon} size={11} color={active ? "#0E2C56" : "#6B7280"} stroke={2.2} />}
              <span style={{ color: active ? "#0E2C56" : "#6B7280", fontWeight: active ? 700 : 600 }}>{it.label}</span>
              {it.count !== undefined && <span style={{ ...n.tabsCount, background: active ? "#0A6BCF" : "rgba(14,44,86,0.06)", color: active ? "#FFFFFF" : "#6B7280" }}>{it.count}</span>}
            </div>
          );
        })}
      </div>
    );
  }
}

function TabsGrid() {
  const items = [
    { label: "Pendientes", icon: "clock", count: 12 },
    { label: "Aprobados",  icon: "check", count: "1.2k" },
    { label: "Rechazados", icon: "x" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <div style={n.subLabel}>UNDERLINED · default</div>
        <div style={{ background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10 }}>
          <Tabs variant="underlined" items={items} activeIdx={0} />
        </div>
      </div>
      <div>
        <div style={n.subLabel}>PILLS · floating</div>
        <Tabs variant="pills" items={items} activeIdx={1} />
      </div>
      <div>
        <div style={n.subLabel}>BOXED · segmented</div>
        <Tabs variant="boxed" items={items} activeIdx={2} />
      </div>
      <div>
        <div style={n.subLabel}>SIZES · sm vs md (underlined)</div>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <div style={{ background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10, padding: "0 4px" }}>
            <div style={n.tabsUnderlinedSm}>
              {items.map((it, idx) => (
                <div key={idx} style={{ ...n.tabUnderlined, ...(idx === 0 ? n.tabUnderlinedActive : null), fontSize: 11, padding: "8px 10px" }}>
                  <span>{it.label}</span>
                  {it.count !== undefined && <span style={{ ...n.tabsCount, background: idx === 0 ? "#0A6BCF" : "rgba(14,44,86,0.06)", color: idx === 0 ? "#FFFFFF" : "#6B7280", fontSize: 9 }}>{it.count}</span>}
                  {idx === 0 && <div style={n.tabUnderlinedBar} />}
                </div>
              ))}
            </div>
          </div>
          <span style={{ fontSize: 9.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>SM · admin tables</span>
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
          <div style={l.handoffTitle}>Handoff · Sección 3 lista</div>
          <div style={l.handoffSub}>5 componentes de navegación · 3 roles cubiertos</div>
        </div>
        <span style={l.handoffChip}>SECCIÓN 3 / 6</span>
      </div>

      <div style={l.handoffGrid}>
        <div style={l.handoffCard}>
          <div style={l.handoffCardLabel}>COMPONENTES ENVIADOS</div>
          <ul style={l.handoffList}>
            <li><b>BottomTabBar</b> · 3 roles (cliente/técnico/admin) × 5 tabs + badges</li>
            <li><b>TopAppBar</b> · basic / colored / search / scrollable (collapse on scroll)</li>
            <li><b>Sidebar</b> · expanded 240 + collapsed 72 + grupos + badges urgentes</li>
            <li><b>Breadcrumb</b> · simple / 3 niveles / truncado / con badge status</li>
            <li><b>Tabs</b> · underlined / pills / boxed + counts + sizes</li>
          </ul>
        </div>

        <div style={l.handoffCard}>
          <div style={l.handoffCardLabel}>CARPETAS</div>
          <div style={l.handoffCode}>
            <div><b>/components/layout/</b></div>
            <div>{"  bottom-tab-bar.tsx"}</div>
            <div>{"  top-app-bar.tsx"}</div>
            <div>{"  sidebar.tsx"}</div>
            <div>{"  breadcrumb.tsx"}</div>
            <div>{"  tabs.tsx"}</div>
            <div style={{ marginTop: 8 }}><b>/components/layout/nav-config.ts</b></div>
            <div style={{ color: "#9CA3AF" }}>{"// role → tabs"}</div>
          </div>
        </div>

        <div style={l.handoffCard}>
          <div style={l.handoffCardLabel}>DEPENDENCIAS</div>
          <ul style={l.handoffList}>
            <li><code>@react-navigation/bottom-tabs</code> mobile</li>
            <li><code>react-native-safe-area-context</code> insets</li>
            <li><code>shadcn/ui</code> Tabs, NavigationMenu, Breadcrumb</li>
            <li><code>next/link</code> navigation web</li>
            <li><code>cmdk</code> command palette en sidebar search</li>
          </ul>
        </div>

        <div style={l.handoffCard}>
          <div style={l.handoffCardLabel}>SIGUIENTES SECCIONES</div>
          <ol style={l.handoffOl}>
            <li>✓ Primitives</li>
            <li>✓ Containers</li>
            <li>✓ Navigation (esta)</li>
            <li style={{ color: "#0A6BCF", fontWeight: 700 }}>→ Forms (próxima) — select · pickers · upload · toggle · radio</li>
            <li>Data Display — table · KPI · timeline</li>
            <li>Domain-specific — Tech card · Status · Price · Chat</li>
          </ol>
        </div>
      </div>

      <div style={l.handoffNextStep}>
        <Ic name="hand" size={13} color="#0A6BCF" />
        <span>Avísame y avanzamos con <b style={{ color: "#0E2C56", fontWeight: 800 }}>Sección 4 · Forms</b> (Select, DatePicker, TimePicker, Toggle, Checkbox/Radio, PhotoUpload).</span>
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
      <SectionHeader num="03" title="Navigation" sub="Conectores entre pantallas · adaptados por rol y plataforma." />

      <ComponentBlock
        id="bottom-tab-bar"
        name="BottomTabBar"
        codeName="<BottomTabBar role={...} />"
        badge={{ label: "Mobile only", tone: "mobile" }}
        desc="Barra inferior de navegación principal. Configurable por rol: cliente, técnico, admin. Soporta badges de notificación."
        mobileGrid={<BottomTabGrid />}
        desktopGrid={<div style={{ padding: "24px", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>En desktop usar <code>Sidebar</code> en su lugar →</div>}
        props={[
          { name: "role",      type: "cliente | tecnico | admin",  default: "cliente", required: true },
          { name: "activeTab", type: "string (tab id)",            default: "—", required: true },
          { name: "onTabPress",type: "(tabId: string) => void",    default: "—", required: true },
          { name: "tabs",      type: "TabConfig[] · custom",       default: "from role config" },
        ]}
        tokens={[
          { cat: "height",   val: "82 px (incluye safe-area)" },
          { cat: "bg",       val: "rgba(255,255,255,0.96) + backdrop-filter blur(8px)" },
          { cat: "border",   val: "top 1px #E1E8F0" },
          { cat: "active",   val: "Primary Blue + dot 4px abajo" },
          { cat: "inactive", val: "Text Soft #9CA3AF · stroke 1.8" },
          { cat: "badge",    val: "Error Red #DC2626 · border 1.5px white" },
        ]}
        notes={[
          "5 tabs max — más es ilegible en mobile.",
          "Tab activo: stroke 2.2, peso 700, Primary Blue; inactivo: stroke 1.8, peso 500, Gray.",
          "Badges en tab inbox (técnico) tienen tono ámbar (urgencia operativa), no rojo.",
          "Mobile: usa createBottomTabNavigator + customTabBar para mantener spec.",
          "Safe-area-inset-bottom respetada con paddingBottom 24px.",
        ]}
        useCases={[
          "Cliente: Inicio · Servicios · Mensajes · Favoritos · Perfil",
          "Técnico: Inbox · Agenda · Cartera · Mensajes · Perfil",
          "Admin: Inicio · Soporte · Usuarios · Servicios · Más",
        ]}
      />

      <ComponentBlock
        id="top-app-bar"
        name="TopAppBar"
        codeName="<TopAppBar variant={...} />"
        badge={{ label: "Mobile only", tone: "mobile" }}
        desc="Header superior con 4 variants. Maneja navegación, contexto, búsqueda y collapse on scroll."
        mobileGrid={<TopAppBarGrid />}
        props={[
          { name: "variant",   type: "basic | colored | search | scrollable", default: "basic" },
          { name: "title",     type: "string",                                 default: "—", required: true },
          { name: "subtitle",  type: "string",                                 default: "—" },
          { name: "back",      type: "boolean | onPress",                      default: "true" },
          { name: "actions",   type: "Action[] (max 2)",                       default: "[]" },
          { name: "searchValue", type: "string · solo variant=search",         default: "—" },
          { name: "onScroll",  type: "scroll handler · solo scrollable",       default: "—" },
        ]}
        tokens={[
          { cat: "height",  val: "basic/colored 64-72 · scrollable 88→56 expanded→collapsed" },
          { cat: "padding", val: "py 12 · px 16" },
          { cat: "bg",      val: "white default · gradient navy→blue para colored" },
          { cat: "shadow",  val: "scrollable agrega shadow-sm on scroll" },
        ]}
        notes={[
          "Botones del header son IconButtons outlined sm (32-38px).",
          "Colored variant usado solo en home y primer screen de cada tab.",
          "Search variant abre teclado automáticamente al montarse.",
          "Scrollable: usa Animated.Value + interpolate en RN; sticky+blur en web.",
          "Bell dot en colored es Error Red 8px con white border 1.5px.",
        ]}
        useCases={[
          "Detalle de servicio (basic)",
          "Home cliente / técnico (colored)",
          "Búsqueda de técnicos (search)",
          "Perfil profesional con cover (scrollable)",
        ]}
      />

      <ComponentBlock
        id="sidebar"
        name="Sidebar"
        codeName="<Sidebar />"
        badge={{ label: "Web admin only", tone: "web" }}
        desc="Navegación lateral del panel admin. Grupos colapsables, badges urgentes y modo colapsado responsive."
        desktopGrid={<SidebarGrid />}
        props={[
          { name: "collapsed",   type: "boolean",                          default: "false (auto <1280px)" },
          { name: "activeRoute", type: "string",                           default: "—", required: true },
          { name: "groups",      type: "NavGroup[]",                       default: "from config" },
          { name: "user",        type: "{ name, role, avatar }",           default: "—", required: true },
          { name: "onLogout",    type: "() => void",                       default: "—", required: true },
        ]}
        tokens={[
          { cat: "width",     val: "240 expanded · 72 collapsed" },
          { cat: "bg",        val: "Deep Navy #0E2C56" },
          { cat: "active",    val: "indicator left 3px white + bg rgba(255,255,255,.10)" },
          { cat: "hover",     val: "bg rgba(255,255,255,.06)" },
          { cat: "group lbl", val: "Mono 10 .12em rgba white .45" },
          { cat: "badge",     val: "urgent #DC2626 · default rgba white .18" },
        ]}
        notes={[
          "Auto-collapse <1280px width (responsive). Toggle manual con ⌘ B.",
          "Search arriba abre Command Palette (cmdk) global.",
          "Badge urgent (rojo) reservado a disputas con SLA <2h.",
          "Footer pegado abajo con user info y logout · siempre visible.",
          "Collapsed mode muestra solo iconos + badge dot pequeño en esquina.",
        ]}
        useCases={[
          "Admin web · todas las rutas de operación",
          "Versión collapsed para pantallas <1280px",
          "Grupos: Operación / Gestión / Finanzas / Configuración",
        ]}
      />

      <ComponentBlock
        id="breadcrumb"
        name="Breadcrumb"
        codeName="<Breadcrumb items={...} />"
        badge={{ label: "Web only", tone: "web" }}
        desc="Camino de navegación contextual. Truncación automática y status badge opcional."
        desktopGrid={<BreadcrumbGrid />}
        props={[
          { name: "items",        type: "Array<{ label, href }>",  default: "—", required: true },
          { name: "maxVisible",   type: "number",                   default: "4 (truncar después)" },
          { name: "statusBadge",  type: "{ label, tone }",          default: "—" },
          { name: "homeIcon",     type: "boolean",                  default: "true" },
        ]}
        tokens={[
          { cat: "type",      val: "Inter 500 · 12 default · Inter 700 último item" },
          { cat: "color",     val: "#0A6BCF links · #0E2C56 actual · #9CA3AF separators" },
          { cat: "separator", val: "lucide chevron-right 11px" },
        ]}
        notes={[
          "Último item NO es link (current page).",
          "Si items > maxVisible, mantén primer + ellipsis + 2 últimos.",
          "Ellipsis '···' es clicable: abre dropdown con niveles ocultos.",
          "shadcn/ui Breadcrumb como base; nuestro spacing y colores.",
        ]}
        useCases={[
          "Detalle de cliente: Clientes → María Rodríguez",
          "Disputa anidada con ellipsis",
          "Detalle KYC con badge 'EN REVISIÓN'",
        ]}
      />

      <ComponentBlock
        id="tabs"
        name="Tabs"
        codeName="<Tabs variant={...} />"
        desc="Cambio de vista local con 3 variants visuales. Counts opcionales y dos tamaños."
        mobileGrid={<TabsGrid />}
        desktopGrid={<TabsGrid />}
        props={[
          { name: "variant",    type: "underlined | pills | boxed", default: "underlined" },
          { name: "items",      type: "Array<{ label, icon, count }>", default: "—", required: true },
          { name: "activeIdx",  type: "number",                     default: "0", required: true },
          { name: "size",       type: "sm | md",                    default: "md" },
          { name: "onChange",   type: "(idx: number) => void",      default: "—", required: true },
          { name: "fullWidth",  type: "boolean",                    default: "false" },
        ]}
        tokens={[
          { cat: "underlined", val: "bar 2px Primary Blue · padding 12 16" },
          { cat: "pills",      val: "bg primary selected · radius 999" },
          { cat: "boxed",      val: "bg #EEF3F8 · selected white + shadow" },
          { cat: "count",      val: "active bg primary white · inactive bg .06 gray" },
        ]}
        notes={[
          "Underlined: default para layouts narrativos (mis servicios cliente).",
          "Pills: floating sobre superficie (filtros, secciones laterales).",
          "Boxed: segmented control denso (admin tables, view toggles).",
          "SM size solo para admin desktop con mucha densidad informativa.",
          "Counts: formato compacto (1.2k, 99+) si rebasa 3 dígitos.",
        ]}
        useCases={[
          "Mis Servicios cliente: Activos / Completados / Cancelados (underlined)",
          "Bandeja admin: Asignados / Disputas / Otros (pills)",
          "View toggle calendar/list (boxed)",
          "Admin tables: Pendientes / Aprobados / Rechazados (sm)",
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

const n = {
  subLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#0A6BCF", letterSpacing: ".12em", fontWeight: 700, marginBottom: 8 },

  // Tab bar
  tabbar: { display: "flex", justifyContent: "space-around", alignItems: "flex-start", padding: "10px 4px 24px", background: "rgba(255,255,255,0.96)", borderTop: "1px solid #E1E8F0", backdropFilter: "blur(8px)" },
  tabItem: { position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1, padding: "4px 0" },
  tabLabel: { fontSize: 10, marginTop: 1 },
  tabBadge: { position: "absolute", top: -4, right: -10, minWidth: 16, height: 16, padding: "0 4px", background: "#DC2626", color: "#FFFFFF", borderRadius: 999, fontSize: 9.5, fontWeight: 800, fontFamily: "'Manrope', sans-serif", display: "grid", placeItems: "center", border: "1.5px solid #FFFFFF" },
  tabActiveDot: { position: "absolute", bottom: 2, width: 4, height: 4, borderRadius: "50%", background: "#0A6BCF" },

  // Topbar
  topbar: { display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "#FFFFFF", borderBottom: "1px solid #F0F4F9" },
  topbarBtn: { width: 32, height: 32, borderRadius: 9, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  topbarBtnGhostWhite: { position: "relative", width: 32, height: 32, borderRadius: 9, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.18)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  bellDot: { position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: "#DC2626", border: "1.5px solid #0A6BCF" },
  topbarSmall: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#9CA3AF", letterSpacing: ".08em", fontWeight: 700 },
  topbarTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 14, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.01em", marginTop: 1 },
  topbarSmallWhite: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.65)", letterSpacing: ".08em", fontWeight: 700 },
  topbarTitleWhite: { fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800, marginTop: 1, letterSpacing: "-0.01em" },
  searchInput: { flex: 1, display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", background: "#F8FBFF", border: "1px solid #0A6BCF", borderRadius: 10, boxShadow: "0 0 0 3px rgba(10,107,207,0.10)" },
  searchClear: { width: 18, height: 18, borderRadius: "50%", background: "rgba(14,44,86,0.06)", border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },

  // Sidebar
  sidebar: { background: "#0E2C56", padding: "16px 12px", display: "flex", flexDirection: "column", color: "#FFFFFF", flexShrink: 0, height: "100%" },
  sidebarBrand: { display: "flex", alignItems: "center", gap: 10, padding: "4px 6px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 16 },
  sidebarLogo: { width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#0A6BCF,#18C1FF)", display: "grid", placeItems: "center", flexShrink: 0, boxShadow: "0 4px 10px rgba(10,107,207,0.40)" },
  sidebarBrandTitle: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: "-0.01em" },
  sidebarBrandChip: { fontFamily: "'JetBrains Mono', monospace", fontSize: 8.5, color: "#FBBF24", letterSpacing: ".1em", fontWeight: 700, marginTop: 2 },

  sidebarSearch: { display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 8, marginBottom: 16 },
  sidebarSearchK: { padding: "1px 6px", background: "rgba(255,255,255,0.10)", borderRadius: 4, fontSize: 9.5, color: "rgba(255,255,255,0.55)", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },

  sidebarGroup: { marginBottom: 12 },
  sidebarGroupLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "rgba(255,255,255,0.45)", letterSpacing: ".12em", fontWeight: 700, padding: "0 8px 6px" },
  sidebarItem: { position: "relative", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 2 },
  sidebarItemActive: { background: "rgba(255,255,255,0.10)" },
  sidebarItemIndicator: { position: "absolute", left: -12, top: 6, bottom: 6, width: 3, background: "#0A6BCF", borderRadius: "0 3px 3px 0" },
  sidebarBadge: { padding: "1px 7px", borderRadius: 999, fontSize: 10, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" },
  sidebarBadgeCollapsed: { position: "absolute", top: 4, right: 4, width: 7, height: 7, borderRadius: "50%", border: "1.5px solid #0E2C56" },

  sidebarFooter: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, marginTop: 16 },
  sidebarFooterAv: { width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#F59E0B,#FBBF24)", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 10.5, flexShrink: 0 },
  sidebarFooterName: { fontSize: 11.5, fontWeight: 700, color: "#FFFFFF" },
  sidebarFooterRole: { fontSize: 9.5, color: "rgba(255,255,255,0.55)", marginTop: 1, fontFamily: "'JetBrains Mono', monospace" },

  // Breadcrumb
  breadcrumb: { display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 8, fontSize: 12 },
  breadcrumbItem: { padding: "0 2px" },
  breadcrumbEllipsis: { padding: "0 6px", background: "#F4F7FB", borderRadius: 4, color: "#6B7280", fontSize: 11, fontWeight: 700, cursor: "pointer" },
  bcBadge: { marginLeft: 6, padding: "1px 7px", background: "rgba(245,158,11,0.14)", color: "#B45309", borderRadius: 999, fontSize: 9.5, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".06em" },

  // Tabs
  tabsUnderlined: { display: "flex", gap: 4, padding: "0 6px", borderBottom: "1px solid #E1E8F0", position: "relative" },
  tabsUnderlinedSm: { display: "flex", gap: 4, borderBottom: "1px solid #E1E8F0" },
  tabUnderlined: { position: "relative", display: "flex", alignItems: "center", gap: 5, padding: "10px 12px", fontSize: 12.5, fontWeight: 600, color: "#6B7280", cursor: "pointer" },
  tabUnderlinedActive: { color: "#0A6BCF", fontWeight: 700 },
  tabUnderlinedBar: { position: "absolute", left: 6, right: 6, bottom: -1, height: 2, background: "#0A6BCF", borderRadius: "2px 2px 0 0" },
  tabsCount: { padding: "1px 7px", borderRadius: 999, fontSize: 10, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" },

  tabsPills: { display: "inline-flex", gap: 5, padding: 4, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 999 },
  tabPill: { display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, color: "#6B7280", cursor: "pointer" },
  tabPillActive: { background: "#0A6BCF", color: "#FFFFFF", boxShadow: "0 4px 10px rgba(10,107,207,0.25)" },

  tabsBoxed: { display: "inline-flex", gap: 3, padding: 3, background: "#EEF3F8", borderRadius: 10 },
  tabBoxed: { display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" },
  tabBoxedActive: { background: "#FFFFFF", boxShadow: "0 2px 6px rgba(14,44,86,0.10)" },
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
