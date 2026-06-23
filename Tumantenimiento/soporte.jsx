/* global React, ReactDOM, AdminIc, AdminSidebar, AdminHeader, SUP_TABS, TYPE_BADGE, TICKETS, ACTIVE */
const Ic = AdminIc;

// ============================================================
// LEFT — Ticket list
// ============================================================
function TicketList({ tickets, activeId }) {
  return (
    <aside style={sp.left}>
      <div style={sp.leftHead}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h1 style={sp.h1}>Bandeja</h1>
          <button style={sp.iconBtn}><Ic name="refresh-cw" size={14} color="#0E2C56" /></button>
        </div>
        <div style={sp.inputWrap}>
          <Ic name="search" size={14} color="#9CA3AF" style={{ marginLeft: 12 }} />
          <input placeholder="Buscar tickets…" style={sp.input} />
        </div>
      </div>

      {/* Tabs */}
      <div style={sp.tabsCol}>
        {SUP_TABS.map((t) => {
          const isActive = t.id === "mine";
          return (
            <div key={t.id} style={{ ...sp.tabRow, ...(isActive ? sp.tabRowActive : null) }}>
              <span style={{ fontSize: 13, color: isActive ? "#0A6BCF" : "#0E2C56", fontWeight: isActive ? 600 : 500 }}>{t.label}</span>
              <span style={{ ...sp.tabCount, ...tabTone(t.tone, isActive) }}>{t.count}</span>
            </div>
          );
        })}
      </div>

      {/* Filter chips */}
      <div style={sp.filterChips}>
        <FilterChip icon="flag" label="Alta" tone="err" />
        <FilterChip icon="circle" label="Abierto" />
        <FilterChip icon="clock" label="SLA cerca" tone="warn" />
      </div>

      {/* Ticket list */}
      <div style={sp.ticketList}>
        {tickets.map((t) => {
          const isActive = t.id === activeId;
          const type = TYPE_BADGE[t.type];
          return (
            <div key={t.id} style={{ ...sp.ticket, ...(isActive ? sp.ticketActive : null) }}>
              {t.unread && <span style={sp.unreadDot} />}
              <div style={{ ...sp.tav, background: avTone(t.id) }}>
                {t.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "#0E2C56", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.user}</span>
                  <span style={{ fontSize: 10.5, color: "#9CA3AF", flexShrink: 0 }}>{t.time}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "3px 0 4px" }}>
                  <span style={{ ...sp.typeBadge, background: type.bg, color: type.fg }}>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: type.dot }} />
                    {type.label}
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF" }}>#{t.id}</span>
                </div>
                <div style={sp.preview}>{t.preview}</div>
                {t.sla && (
                  <div style={{ ...sp.slaPill, ...slaPillTone(t.slaTone) }}>
                    <Ic name={t.slaTone === "err" ? "alert-triangle" : "timer"} size={10} color={t.slaTone === "err" ? "#DC2626" : (t.slaTone === "warn" ? "#B45309" : "#0E2C56")} />
                    {t.sla === "vencido" ? "SLA vencido" : `SLA ${t.sla}`}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function FilterChip({ icon, label, tone }) {
  let style = sp.chip;
  if (tone === "err")  style = { ...style, background: "#FCE9E9", color: "#DC2626", borderColor: "rgba(220,38,38,0.3)" };
  if (tone === "warn") style = { ...style, background: "#FEF3DC", color: "#B45309", borderColor: "rgba(245,158,11,0.3)" };
  return (
    <div style={style}>
      <Ic name={icon} size={11} color={tone === "err" ? "#DC2626" : tone === "warn" ? "#B45309" : "#6B7280"} />
      <span>{label}</span>
    </div>
  );
}

function tabTone(tone, active) {
  if (active) return { background: "rgba(10,107,207,0.12)", color: "#0A6BCF" };
  if (tone === "err")  return { background: "#FCE9E9", color: "#DC2626" };
  if (tone === "warn") return { background: "#FEF3DC", color: "#B45309" };
  if (tone === "info") return { background: "#E0F6FF", color: "#0884B0" };
  if (tone === "blue") return { background: "rgba(10,107,207,0.10)", color: "#0A6BCF" };
  return {};
}
function slaPillTone(tone) {
  if (tone === "err")  return { background: "#FCE9E9", color: "#DC2626", borderColor: "rgba(220,38,38,0.3)" };
  if (tone === "warn") return { background: "#FEF3DC", color: "#B45309", borderColor: "rgba(245,158,11,0.3)" };
  return { background: "#F8FBFF", color: "#0E2C56", borderColor: "#E1E8F0" };
}
function avTone(id) {
  const palette = ["rgba(10,107,207,0.14)", "rgba(24,193,255,0.18)", "rgba(14,44,86,0.10)", "rgba(24,166,106,0.16)"];
  const i = id.charCodeAt(id.length - 1) % palette.length;
  return palette[i];
}

// ============================================================
// CENTER — Conversation
// ============================================================
function Conversation({ dispute = false }) {
  return (
    <div style={sp.center}>
      {/* Dispute banner */}
      {dispute && (
        <div style={sp.disputeBanner}>
          <div style={sp.disputeIcon}><Ic name="shield-alert" size={18} color="#FFFFFF" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#FFFFFF" }}>Disputa activa · hay dos partes involucradas</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>
              María Rodríguez (cliente) vs. Ramón Hernández (técnico) · Servicio #SVC-2812
            </div>
          </div>
          <button style={sp.disputeBtn}>
            <Ic name="arrow-left-right" size={13} color="#DC2626" style={{ marginRight: 6 }} />
            Ver ambas versiones
          </button>
        </div>
      )}

      {/* Header */}
      <div style={sp.convHead}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
          <div style={{ ...sp.lgAv, background: "rgba(10,107,207,0.14)", color: "#0A6BCF" }}>{ACTIVE.client.initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#0E2C56" }}>{ACTIVE.client.name}</span>
              <span style={{ ...sp.typeBadge, background: TYPE_BADGE.disputa.bg, color: TYPE_BADGE.disputa.fg, fontSize: 11, padding: "3px 9px" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#DC2626" }} />Disputa
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 3, display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>#{ACTIVE.id}</span>
              <span>·</span>
              <span>Abierto {ACTIVE.createdAt}</span>
              <span>·</span>
              <span>Servicio <a href="#" style={{ color: "#0A6BCF", textDecoration: "none", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>#{ACTIVE.service.id}</a></span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={sp.statusSelect}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0A6BCF" }} />
            <span style={{ fontSize: 12.5, color: "#0E2C56", fontWeight: 500 }}>{ACTIVE.status}</span>
            <Ic name="chevron-down" size={12} color="#9CA3AF" />
          </div>
          <div style={sp.assignPill}>
            <div style={{ ...sp.smAv, background: "rgba(24,166,106,0.18)", color: "#18A66A" }}>SM</div>
            <span style={{ fontSize: 12, color: "#0E2C56", fontWeight: 500 }}>Sofía M.</span>
            <button style={sp.reassignBtn}>Reasignar</button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={sp.messages}>
        <DateDivider label="Hoy · 19 de mayo" />
        {ACTIVE.messages.map((m, i) => <Message key={i} m={m} />)}
        <TypingIndicator />
      </div>

      {/* Composer */}
      <Composer />
    </div>
  );
}

function DateDivider({ label }) {
  return (
    <div style={sp.dateDivider}>
      <span style={sp.dateLine} />
      <span style={sp.dateLabel}>{label}</span>
      <span style={sp.dateLine} />
    </div>
  );
}

function Message({ m }) {
  if (m.from === "internal") {
    return (
      <div style={sp.internalBox}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Ic name="lock" size={12} color="#B45309" />
          <span style={{ fontSize: 11.5, color: "#B45309", fontWeight: 700, letterSpacing: ".04em" }}>NOTA INTERNA · NO VISIBLE PARA EL USUARIO</span>
          <span style={{ marginLeft: "auto", fontSize: 10.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>{m.actor} · {m.time}</span>
        </div>
        <p style={{ fontSize: 13, color: "#0E2C56", lineHeight: 1.5, margin: 0 }}>{m.text}</p>
      </div>
    );
  }
  const isAdmin = m.from === "admin";
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: isAdmin ? "flex-end" : "flex-start", marginBottom: 14 }}>
      {!isAdmin && <div style={{ ...sp.smAv, background: "rgba(10,107,207,0.14)", color: "#0A6BCF", flexShrink: 0 }}>{m.initials}</div>}
      <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", alignItems: isAdmin ? "flex-end" : "flex-start" }}>
        <div style={{ ...sp.bubble, ...(isAdmin ? sp.bubbleAdmin : sp.bubbleUser) }}>
          <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>{m.text}</p>
          {m.attachments && (
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              {Array.from({ length: m.attachments }).map((_, i) => (
                <div key={i} style={sp.attachThumb}><Ic name="image" size={14} color="#FFFFFF" /></div>
              ))}
            </div>
          )}
        </div>
        <span style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>{m.actor} · {m.time}</span>
      </div>
      {isAdmin && <div style={{ ...sp.smAv, background: "rgba(24,166,106,0.18)", color: "#18A66A", flexShrink: 0 }}>SM</div>}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 0 42px" }}>
      <div style={{ display: "flex", gap: 3, padding: "8px 12px", background: "#EEF3F8", borderRadius: 12 }}>
        <span style={{ ...sp.typingDot, animationDelay: "0s" }} />
        <span style={{ ...sp.typingDot, animationDelay: "0.15s" }} />
        <span style={{ ...sp.typingDot, animationDelay: "0.30s" }} />
      </div>
      <span style={{ fontSize: 11, color: "#9CA3AF" }}>María está escribiendo…</span>
    </div>
  );
}

function Composer() {
  return (
    <div style={sp.composer}>
      <div style={sp.composerToolbar}>
        <div style={{ display: "flex", gap: 2 }}>
          <ToolbarBtn icon="bold" />
          <ToolbarBtn icon="italic" />
          <ToolbarBtn icon="link" />
          <ToolbarBtn icon="list" />
          <span style={sp.toolbarSep} />
          <ToolbarBtn icon="paperclip" />
          <ToolbarBtn icon="image" />
          <ToolbarBtn icon="smile" />
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={sp.modeSeg}>
            <button style={{ ...sp.modeBtn, ...sp.modeBtnActive }}><Ic name="message-square" size={11} color="#FFFFFF" style={{ marginRight: 4 }} />Respuesta pública</button>
            <button style={sp.modeBtn}><Ic name="lock" size={11} color="#B45309" style={{ marginRight: 4 }} />Nota interna</button>
          </div>
        </div>
      </div>

      <textarea
        style={sp.textarea}
        defaultValue="María, ya tengo a Adriana García (★4.8, también de Zapopan) lista para visitarte hoy entre 16:30 y 17:30 sin costo adicional. ¿Te funciona? Y sobre el cobro, estoy autorizada para emitir un reembolso del 60% del servicio original ($1,134 MXN) que regresa a tu tarjeta hoy mismo."
      />

      <div style={sp.composerFoot}>
        <div style={sp.templateSel}>
          <Ic name="file-text" size={13} color="#0A6BCF" />
          <span style={{ fontSize: 12, color: "#6B7280" }}>Plantilla:</span>
          <span style={{ fontSize: 12.5, color: "#0E2C56", fontWeight: 500 }}>Disputa — Reembolso parcial 60%</span>
          <Ic name="chevron-down" size={12} color="#9CA3AF" />
        </div>
        <span style={{ marginLeft: 10, fontSize: 11, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>
          304 / 1000
        </span>
        <span style={{ flex: 1 }} />
        <button style={sp.btnGhost}>Cancelar</button>
        <div style={sp.sendGroup}>
          <button style={sp.sendBtn}><Ic name="send" size={13} color="#FFFFFF" style={{ marginRight: 6 }} />Enviar respuesta</button>
          <button style={sp.sendDropdown}><Ic name="chevron-down" size={12} color="#FFFFFF" /></button>
        </div>
      </div>
    </div>
  );
}

function ToolbarBtn({ icon }) {
  return <button style={sp.toolbarBtn}><Ic name={icon} size={13} color="#6B7280" /></button>;
}

// ============================================================
// RIGHT — Context panel
// ============================================================
function ContextPanel({ dispute }) {
  return (
    <aside style={sp.right}>
      <div style={sp.rightScroll}>
        {dispute ? <DualPartyCards /> : <UserCard u={ACTIVE.client} primary />}

        {/* Related service */}
        <Card title="Servicio relacionado" icon="wrench">
          <div style={sp.svcRow}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: "#0A6BCF", fontWeight: 500 }}>#{ACTIVE.service.id}</span>
            <span style={{ ...sp.statusBadge, background: "rgba(10,107,207,0.12)", color: "#0A6BCF" }}>En ejecución</span>
          </div>
          <div style={sp.svcMeta}>
            <KV label="Técnico" value={ACTIVE.service.tech} />
            <KV label="Fecha" value={ACTIVE.service.date} />
            <KV label="Monto" value={ACTIVE.service.amount} mono />
          </div>
          <a href="#" style={sp.cardLink}>Ver servicio completo <Ic name="arrow-right" size={11} color="#0A6BCF" /></a>
        </Card>

        {/* Quick actions */}
        <Card title="Acciones rápidas" icon="zap">
          <button style={sp.actBtnPrimary}><Ic name="rotate-ccw" size={13} color="#FFFFFF" style={{ marginRight: 8 }} />Iniciar reembolso parcial</button>
          <button style={sp.actBtnGhost}><Ic name="user-cog" size={13} color="#0A6BCF" style={{ marginRight: 8 }} />Reasignar técnico</button>
          <button style={sp.actBtnGhost}><Ic name="ban" size={13} color="#DC2626" style={{ marginRight: 8 }} /><span style={{ color: "#DC2626" }}>Cancelar servicio</span></button>
          {dispute && (
            <button style={sp.actBtnGhost}><Ic name="user-x" size={13} color="#DC2626" style={{ marginRight: 8 }} /><span style={{ color: "#DC2626" }}>Suspender al técnico</span></button>
          )}
          <div style={sp.actHint}><Ic name="info" size={10} color="#9CA3AF" /><span>Las acciones destructivas requieren confirmación.</span></div>
        </Card>

        {/* Evidence */}
        <Card title="Evidencia del servicio" icon="camera"
          sub={`${ACTIVE.evidence} fotos · 1 video · ambas partes`}>
          <div style={sp.evidenceGrid}>
            {Array.from({ length: ACTIVE.evidence }).map((_, i) => (
              <div key={i} style={{ ...sp.evidenceTile, background: evidenceBg(i) }}>
                <Ic name="image" size={14} color="#FFFFFF" />
                {i === 0 && <span style={sp.evidenceTag}>Antes</span>}
                {i === 3 && <span style={sp.evidenceTag}>Después</span>}
              </div>
            ))}
          </div>
          <a href="#" style={sp.cardLink}>
            <Ic name="messages-square" size={12} color="#0A6BCF" style={{ marginRight: 4 }} />
            Ver chat cliente-técnico completo
          </a>
        </Card>

        {/* History */}
        <Card title="Historial del usuario" icon="history"
          sub={`${ACTIVE.history.length} tickets previos · todos cerrados`}>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {ACTIVE.history.map((h, i) => {
              const t = TYPE_BADGE[h.type];
              return (
                <div key={i} style={sp.historyRow}>
                  <span style={{ ...sp.typeBadge, background: t.bg, color: t.fg, fontSize: 10, padding: "2px 6px" }}>{t.label}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, color: "#0E2C56", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.subject}</div>
                    <div style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>#{h.id} · {h.time}</div>
                  </div>
                  <span style={{ fontSize: 10, color: "#18A66A", fontWeight: 600 }}>cerrado</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </aside>
  );
}

function evidenceBg(i) {
  const palette = [
    "linear-gradient(135deg,#0E2C56,#0A6BCF)",
    "linear-gradient(135deg,#0A6BCF,#18C1FF)",
    "linear-gradient(135deg,#18C1FF,#5CB7F0)",
    "linear-gradient(135deg,#B45309,#F59E0B)",
    "linear-gradient(135deg,#9CA3AF,#6B7280)",
    "linear-gradient(135deg,#0E2C56,#0894EA)",
  ];
  return palette[i % palette.length];
}

function UserCard({ u, primary, role }) {
  return (
    <Card title="Información del usuario" icon="user-round">
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ ...sp.medAv, background: "rgba(10,107,207,0.14)", color: "#0A6BCF" }}>{u.initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#0E2C56" }}>{u.name}</span>
            {primary && <Ic name="badge-check" size={12} color="#18A66A" />}
          </div>
          <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 3 }}>{role || u.role} · {u.region}</div>
        </div>
      </div>
      <div style={sp.userStats}>
        <Stat label="Servicios" value={u.services || u.jobs} />
        <Stat label="Rating" value={u.rating?.toFixed(1)} icon="star" />
        <Stat label="Cliente desde" value={u.since} small />
      </div>
      <a href="#" style={sp.cardLink}>Ver perfil completo <Ic name="arrow-right" size={11} color="#0A6BCF" /></a>
    </Card>
  );
}

function DualPartyCards() {
  return (
    <div style={sp.dualCard}>
      <div style={sp.dualHead}>
        <Ic name="users" size={14} color="#DC2626" />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#0E2C56" }}>Partes involucradas</span>
        <span style={{ marginLeft: "auto", fontSize: 10.5, color: "#DC2626", background: "#FCE9E9", padding: "1px 7px", borderRadius: 999, fontWeight: 600 }}>2 partes</span>
      </div>
      <PartyMini u={ACTIVE.client} role="Cliente" tone="blue" />
      <div style={sp.vsLine}><span style={sp.vsDot}>vs</span></div>
      <PartyMini u={ACTIVE.tech} role="Técnico" tone="cyan" verified />
      <button style={sp.compareBtn}>
        <Ic name="arrow-left-right" size={13} color="#FFFFFF" style={{ marginRight: 6 }} />
        Ver ambas versiones del caso
      </button>
    </div>
  );
}

function PartyMini({ u, role, tone, verified }) {
  const bg = tone === "cyan" ? "rgba(24,193,255,0.18)" : "rgba(10,107,207,0.14)";
  const fg = tone === "cyan" ? "#0884B0" : "#0A6BCF";
  return (
    <div style={sp.partyRow}>
      <div style={{ ...sp.medAv, background: bg, color: fg }}>{u.initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#0E2C56" }}>{u.name}</span>
          {verified && <Ic name="badge-check" size={12} color="#18A66A" />}
        </div>
        <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 2 }}>
          {role} · {u.region}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5, fontSize: 11, color: "#9CA3AF" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
            <Ic name="star" size={10} color="#F59E0B" />
            <b style={{ color: "#0E2C56", fontWeight: 600 }}>{u.rating?.toFixed(1)}</b>
          </span>
          <span>·</span>
          <span>{u.services || u.jobs} servicios</span>
        </div>
      </div>
    </div>
  );
}

function Card({ title, icon, sub, children }) {
  return (
    <div style={sp.card}>
      <div style={sp.cardHead}>
        <div style={sp.cardIcon}><Ic name={icon} size={14} color="#0A6BCF" /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={sp.cardTitle}>{title}</div>
          {sub && <div style={sp.cardSub}>{sub}</div>}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function KV({ label, value, mono }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", fontFamily: "'JetBrains Mono', monospace", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 12.5, color: "#0E2C56", fontWeight: 500, fontFamily: mono ? "'JetBrains Mono', monospace" : "'Inter', sans-serif" }}>{value}</div>
    </div>
  );
}

function Stat({ label, value, icon, small }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {icon && <Ic name={icon} size={11} color="#F59E0B" />}
        <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: small ? 13 : 16, color: "#0E2C56", letterSpacing: "-0.01em" }}>{value}</span>
      </div>
      <div style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================
function EmptyState() {
  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", padding: "32px 32px 40px" }}>
      <div style={{ ...sp.h1Wrap }}>
        <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 28, margin: 0, letterSpacing: "-0.01em", color: "#0E2C56" }}>Bandeja de soporte</h1>
        <p style={{ fontSize: 13.5, color: "#6B7280", margin: "4px 0 0" }}>Tickets, disputas y reportes.</p>
      </div>
      <div style={sp.emptyCard}>
        <div style={sp.confetti}>
          {[...Array(20)].map((_, i) => (
            <span key={i} style={{
              position: "absolute",
              left: `${(i * 53) % 100}%`,
              top: `${(i * 37) % 100}%`,
              width: 8 + (i % 3) * 2,
              height: 8 + (i % 3) * 2,
              background: ["#0A6BCF", "#18C1FF", "#18A66A", "#F59E0B", "#0884B0"][i % 5],
              borderRadius: i % 2 ? "50%" : 2,
              opacity: 0.6,
              transform: `rotate(${(i * 23) % 360}deg)`,
            }} />
          ))}
        </div>
        <div style={sp.emptyIcon}>
          <Ic name="inbox" size={56} color="#0A6BCF" />
        </div>
        <h3 style={sp.emptyH3}>Sin tickets abiertos. ¡Buen trabajo, Sofía!</h3>
        <p style={sp.emptyP}>
          La bandeja está al día. Cuando lleguen nuevos tickets aparecerán aquí ordenados por prioridad y SLA.
        </p>
        <div style={sp.emptyStats}>
          <div><b style={{ color: "#18A66A", fontWeight: 700, fontFamily: "'Manrope', sans-serif", fontSize: 22 }}>18</b> resueltos hoy</div>
          <div><b style={{ color: "#0E2C56", fontWeight: 700, fontFamily: "'Manrope', sans-serif", fontSize: 22 }}>4h 12m</b> tiempo promedio de respuesta</div>
          <div><b style={{ color: "#0A6BCF", fontWeight: 700, fontFamily: "'Manrope', sans-serif", fontSize: 22 }}>98%</b> SLA cumplido (mes)</div>
        </div>
      </div>
    </main>
  );
}

// ============================================================
// SCREEN COMPOSITIONS
// ============================================================
function ScreenInbox({ dispute = false }) {
  return (
    <div style={{ display: "flex", width: 1440, height: 1100, background: "#F8FBFF", fontFamily: "'Inter', sans-serif" }}>
      <AdminSidebar active="support" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AdminHeader crumbs={["Inicio", "Soporte y disputas"]} />
        <div style={sp.tri}>
          <TicketList tickets={TICKETS} activeId={ACTIVE.id} />
          <Conversation dispute={dispute} />
          <ContextPanel dispute={dispute} />
        </div>
      </div>
    </div>
  );
}

function ScreenEmpty() {
  return (
    <div style={{ display: "flex", width: 1440, height: 900, background: "#F8FBFF", fontFamily: "'Inter', sans-serif" }}>
      <AdminSidebar active="support" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AdminHeader crumbs={["Inicio", "Soporte y disputas"]} />
        <EmptyState />
      </div>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="support" title="Soporte y disputas" subtitle="Bandeja · disputa activa · estado vacío">
        <DCArtboard id="dispute" label="Disputa activa · María vs Ramón" width={1440} height={1100}>
          <ScreenInbox dispute={true} />
        </DCArtboard>
        <DCArtboard id="empty" label="Estado vacío · al día" width={1440} height={900}>
          <ScreenEmpty />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// ============================================================
// STYLES
// ============================================================
const sp = {
  tri: { flex: 1, display: "grid", gridTemplateColumns: "340px 1fr 320px", minHeight: 0, overflow: "hidden" },

  /* Left */
  left: { background: "#FFFFFF", borderRight: "1px solid #E1E8F0", display: "flex", flexDirection: "column", overflow: "hidden" },
  leftHead: { padding: "20px 18px 14px", borderBottom: "1px solid #F0F4F9" },
  h1: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 20, margin: 0, color: "#0E2C56", letterSpacing: "-0.01em" },
  iconBtn: { background: "#FFFFFF", border: "1px solid #E1E8F0", padding: 6, borderRadius: 7, cursor: "pointer", display: "grid", placeItems: "center" },
  inputWrap: { display: "flex", alignItems: "center", height: 34, background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 8 },
  input: { flex: 1, border: "none", outline: "none", background: "transparent", padding: "0 12px", fontSize: 12.5, color: "#0E2C56", height: "100%" },
  tabsCol: { display: "flex", flexDirection: "column", padding: "10px 12px", borderBottom: "1px solid #F0F4F9", gap: 2 },
  tabRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", borderRadius: 7, cursor: "pointer" },
  tabRowActive: { background: "rgba(10,107,207,0.06)" },
  tabCount: { fontSize: 10.5, padding: "1px 7px", borderRadius: 999, background: "#EEF3F8", color: "#6B7280", fontWeight: 600 },

  filterChips: { display: "flex", gap: 6, padding: "10px 14px", borderBottom: "1px solid #F0F4F9" },
  chip: { display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, background: "#F8FBFF", border: "1px solid #E1E8F0", color: "#6B7280", fontSize: 11, fontWeight: 500 },

  ticketList: { flex: 1, overflow: "auto" },
  ticket: { position: "relative", display: "flex", alignItems: "flex-start", gap: 10, padding: "14px 16px", borderBottom: "1px solid #F0F4F9", cursor: "pointer" },
  ticketActive: { background: "rgba(10,107,207,0.06)", borderLeft: "3px solid #0A6BCF", paddingLeft: 13 },
  unreadDot: { position: "absolute", left: 6, top: 22, width: 6, height: 6, borderRadius: "50%", background: "#0A6BCF" },
  tav: { width: 34, height: 34, borderRadius: "50%", display: "grid", placeItems: "center", color: "#0A6BCF", fontWeight: 600, fontSize: 12, flexShrink: 0 },
  typeBadge: { display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 999, fontSize: 10, fontWeight: 600 },
  preview: { fontSize: 11.5, color: "#6B7280", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  slaPill: { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 7px", borderRadius: 4, fontSize: 10, fontWeight: 600, marginTop: 6, border: "1px solid" },

  /* Center */
  center: { display: "flex", flexDirection: "column", minWidth: 0, background: "#FBFDFF", overflow: "hidden" },

  disputeBanner: { display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", background: "linear-gradient(135deg, #DC2626, #991B1B)", color: "#FFFFFF" },
  disputeIcon: { width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.15)", display: "grid", placeItems: "center" },
  disputeBtn: { background: "#FFFFFF", color: "#DC2626", border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center" },

  convHead: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, padding: "16px 22px", background: "#FFFFFF", borderBottom: "1px solid #E1E8F0" },
  lgAv: { width: 44, height: 44, borderRadius: "50%", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 },
  medAv: { width: 38, height: 38, borderRadius: "50%", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 13, flexShrink: 0 },
  smAv: { width: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 11 },

  statusSelect: { display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: "rgba(10,107,207,0.06)", border: "1px solid rgba(10,107,207,0.18)", borderRadius: 7, cursor: "pointer" },
  assignPill: { display: "flex", alignItems: "center", gap: 8, padding: "4px 4px 4px 8px", border: "1px solid #E1E8F0", borderRadius: 999, background: "#FFFFFF" },
  reassignBtn: { background: "#F8FBFF", color: "#0A6BCF", border: "1px solid #E1E8F0", borderRadius: 6, padding: "3px 9px", fontSize: 11, fontWeight: 600, cursor: "pointer" },

  messages: { flex: 1, overflow: "auto", padding: "18px 24px" },

  dateDivider: { display: "flex", alignItems: "center", gap: 14, margin: "8px 0 18px" },
  dateLine: { flex: 1, height: 1, background: "#E1E8F0" },
  dateLabel: { fontSize: 11, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".04em" },

  bubble: { padding: "10px 14px", borderRadius: 14, fontSize: 13, lineHeight: 1.5 },
  bubbleUser: { background: "#FFFFFF", border: "1px solid #E1E8F0", color: "#0E2C56", borderTopLeftRadius: 4 },
  bubbleAdmin: { background: "rgba(10,107,207,0.10)", border: "1px solid rgba(10,107,207,0.22)", color: "#0E2C56", borderTopRightRadius: 4 },
  attachThumb: { width: 56, height: 56, borderRadius: 8, background: "linear-gradient(135deg, #0A6BCF, #18C1FF)", display: "grid", placeItems: "center", cursor: "pointer" },

  internalBox: { padding: "12px 14px", background: "#FFFBED", border: "1px dashed rgba(245,158,11,0.5)", borderRadius: 10, marginBottom: 14 },
  typingDot: { display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#9CA3AF", animation: "soporte-typing 1s infinite" },

  composer: { background: "#FFFFFF", borderTop: "1px solid #E1E8F0", padding: 14 },
  composerToolbar: { display: "flex", alignItems: "center", padding: "0 4px 8px" },
  toolbarBtn: { background: "transparent", border: "none", padding: 6, borderRadius: 6, cursor: "pointer", display: "grid", placeItems: "center" },
  toolbarSep: { width: 1, height: 18, background: "#E1E8F0", margin: "0 4px" },
  modeSeg: { display: "flex", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 7, padding: 2, gap: 2 },
  modeBtn: { background: "transparent", border: "none", padding: "5px 10px", borderRadius: 5, fontSize: 11.5, fontWeight: 500, color: "#6B7280", cursor: "pointer", display: "inline-flex", alignItems: "center" },
  modeBtnActive: { background: "#0A6BCF", color: "#FFFFFF" },
  textarea: { width: "100%", minHeight: 90, fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: "#0E2C56", padding: "10px 12px", border: "1px solid #E1E8F0", borderRadius: 8, outline: "none", resize: "vertical", lineHeight: 1.5 },
  composerFoot: { display: "flex", alignItems: "center", gap: 10, paddingTop: 10 },
  templateSel: { display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 7, cursor: "pointer" },
  btnGhost: { background: "#FFFFFF", color: "#6B7280", border: "1px solid #E1E8F0", borderRadius: 8, padding: "7px 12px", fontSize: 12.5, fontWeight: 500, cursor: "pointer" },
  sendGroup: { display: "flex", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 2px rgba(10,107,207,0.25)" },
  sendBtn: { background: "#0A6BCF", color: "#FFFFFF", border: "none", padding: "8px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  sendDropdown: { background: "#0894EA", color: "#FFFFFF", border: "none", padding: "8px 10px", cursor: "pointer", display: "grid", placeItems: "center", borderLeft: "1px solid rgba(255,255,255,0.18)" },

  /* Right */
  right: { background: "#FFFFFF", borderLeft: "1px solid #E1E8F0", overflow: "hidden", display: "flex", flexDirection: "column" },
  rightScroll: { flex: 1, overflow: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 },

  card: { background: "#FBFDFF", border: "1px solid #E1E8F0", borderRadius: 12, padding: 16 },
  cardHead: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
  cardIcon: { width: 26, height: 26, borderRadius: 6, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  cardTitle: { fontSize: 13, fontWeight: 600, color: "#0E2C56" },
  cardSub: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  cardLink: { marginTop: 12, display: "inline-flex", alignItems: "center", gap: 4, color: "#0A6BCF", textDecoration: "none", fontSize: 12, fontWeight: 500 },

  userStats: { display: "flex", gap: 16, padding: "12px 14px", marginTop: 12, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10 },

  svcRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  statusBadge: { display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600 },
  svcMeta: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },

  actBtnPrimary: { width: "100%", marginBottom: 8, background: "#0A6BCF", color: "#FFFFFF", border: "1px solid #0A6BCF", borderRadius: 9, padding: "9px 12px", fontWeight: 600, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  actBtnGhost: { width: "100%", marginBottom: 8, background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #E1E8F0", borderRadius: 9, padding: "9px 12px", fontWeight: 500, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  actHint: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#9CA3AF", marginTop: 4 },

  evidenceGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 },
  evidenceTile: { position: "relative", aspectRatio: "1.2", borderRadius: 7, display: "grid", placeItems: "center", cursor: "pointer", overflow: "hidden" },
  evidenceTag: { position: "absolute", bottom: 4, left: 4, fontSize: 9, color: "#FFFFFF", background: "rgba(14,44,86,0.7)", padding: "1px 5px", borderRadius: 3, fontWeight: 600 },

  historyRow: { display: "flex", alignItems: "center", gap: 8, padding: "10px 0", borderTop: "1px solid #F0F4F9" },

  /* Dual party */
  dualCard: { background: "#FFFBED", border: "1.5px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: 14 },
  dualHead: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 },
  partyRow: { display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10 },
  vsLine: { position: "relative", height: 12, margin: "4px 0" },
  vsDot: { position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", background: "#DC2626", color: "#FFFFFF", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, letterSpacing: ".06em", textTransform: "uppercase" },
  compareBtn: { width: "100%", marginTop: 12, background: "#0E2C56", color: "#FFFFFF", border: "none", borderRadius: 9, padding: "10px 12px", fontWeight: 600, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },

  /* Empty */
  h1Wrap: { marginBottom: 24 },
  emptyCard: { flex: 1, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, padding: 48, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", position: "relative", overflow: "hidden" },
  confetti: { position: "absolute", inset: 0, pointerEvents: "none" },
  emptyIcon: { width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, rgba(24,193,255,0.18), rgba(10,107,207,0.08) 70%)", display: "grid", placeItems: "center", marginBottom: 24, zIndex: 1 },
  emptyH3: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 24, color: "#0E2C56", margin: "0 0 10px", letterSpacing: "-0.01em", zIndex: 1 },
  emptyP: { fontSize: 14, color: "#6B7280", lineHeight: 1.5, maxWidth: 480, margin: "0 0 32px", zIndex: 1 },
  emptyStats: { display: "flex", gap: 48, zIndex: 1, fontSize: 12.5, color: "#6B7280" },
};

// keyframes for typing dots
const styleEl = document.createElement("style");
styleEl.textContent = `@keyframes soporte-typing { 0%, 100% { opacity: 0.3; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-2px); } }`;
document.head.appendChild(styleEl);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
