/* global React, ReactDOM, IOSDevice, DesignCanvas, DCSection, DCArtboard */
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
  "linear-gradient(135deg,#0E2C56,#0894EA)",
  "linear-gradient(135deg,#B45309,#F59E0B)",
  "linear-gradient(135deg,#7C3AED,#A78BFA)",
];

// =====================================================================
// SHARED — Sub Header
// =====================================================================
function AdminHeader({ title, count, sub, right }) {
  return (
    <div style={ad.header}>
      <button style={ad.backBtn}><Ic name="arrow-left" size={17} color="#0E2C56" /></button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={ad.headerTitleRow}>
          <span style={ad.headerTitle}>{title}</span>
          {count !== undefined && <span style={ad.headerCount}>{count}</span>}
        </div>
        {sub && <div style={ad.headerSub}>{sub}</div>}
      </div>
      {right || <button style={ad.iconBtn}><Ic name="more-vertical" size={17} color="#0E2C56" /></button>}
    </div>
  );
}

// =====================================================================
// SCREEN 01 — KYC LIST
// =====================================================================
const KYC_LIST = [
  { id: 1, initials: "RH", tone: 0, name: "Ramón Hernández García", trade: "Plomería · 4 categorías", region: "Providencia", waiting: "28h", overdue: true,  has: { ine: true, addr: true, selfie: true } },
  { id: 2, initials: "AG", tone: 1, name: "Adriana García Soto",     trade: "Electricidad · 3 cat",  region: "Tlaquepaque", waiting: "12h", overdue: false, has: { ine: true, addr: true, selfie: true } },
  { id: 3, initials: "LM", tone: 2, name: "Luis Méndez Ortiz",       trade: "Gas + Plomería · 5 cat", region: "Zapopan",   waiting: "31h", overdue: true,  has: { ine: true, addr: false, selfie: true }, blocking: 1 },
  { id: 4, initials: "PV", tone: 3, name: "Paola Vargas Núñez",       trade: "Pintura · 2 cat",        region: "Chapalita", waiting: "6h",  overdue: false, has: { ine: true, addr: true, selfie: true } },
  { id: 5, initials: "JR", tone: 4, name: "Joaquín Ramírez T.",       trade: "Herrería · 3 cat",       region: "Tonalá",    waiting: "48h", overdue: true,  has: { ine: true, addr: true, selfie: true }, priority: true },
  { id: 6, initials: "CD", tone: 5, name: "Carla Domínguez R.",       trade: "Impermeabilización · 1",  region: "Providencia", waiting: "3h", overdue: false, has: { ine: true, addr: true, selfie: false }, blocking: 1 },
];

function KycListScreen() {
  return (
    <div style={ad.wrap}>
      <AdminHeader title="KYC pendientes" count={12} sub="3 con espera >24h · 1 prioritario" />

      <div style={ad.filterRow}>
        <div style={{ ...ad.filterChip, ...ad.filterChipSel }}>
          <Ic name="clock" size={11} color="#FFFFFF" />
          <span>Más antiguos</span>
          <Ic name="check" size={10} color="#FFFFFF" stroke={3} />
        </div>
        <div style={ad.filterChip}>
          <Ic name="map-pin" size={11} color="#0A6BCF" />
          <span>Región</span>
          <Ic name="chevron-down" size={10} color="#0A6BCF" />
        </div>
        <div style={ad.filterChip}>
          <Ic name="wrench" size={11} color="#0A6BCF" />
          <span>Categoría</span>
        </div>
        <div style={ad.filterChip}>
          <Ic name="alert-triangle" size={11} color="#B45309" />
          <span>Prioritarios</span>
          <span style={ad.filterCount}>1</span>
        </div>
      </div>

      <div style={ad.body}>
        {/* Stats banner */}
        <div style={ad.statsBanner}>
          <div style={ad.statsBlock}>
            <div style={ad.statsVal}>12</div>
            <div style={ad.statsLabel}>pendientes</div>
          </div>
          <div style={ad.statsDiv} />
          <div style={ad.statsBlock}>
            <div style={{ ...ad.statsVal, color: "#B45309" }}>3</div>
            <div style={ad.statsLabel}>&gt;24h</div>
          </div>
          <div style={ad.statsDiv} />
          <div style={ad.statsBlock}>
            <div style={{ ...ad.statsVal, color: "#0F8A56" }}>89</div>
            <div style={ad.statsLabel}>aprobados hoy</div>
          </div>
        </div>

        <div style={ad.listSectionLabel}>COLA DE REVISIÓN</div>
        <div style={ad.kycList}>
          {KYC_LIST.map(k => <KycRow key={k.id} k={k} />)}
        </div>

        <div style={ad.bulkRow}>
          <Ic name="zap" size={11} color="#0A6BCF" />
          <span>Selecciona varios para acción masiva</span>
          <button style={ad.bulkBtn}>Activar</button>
        </div>
      </div>
    </div>
  );
}

function KycRow({ k }) {
  return (
    <div style={{ ...ad.kycCard, ...(k.priority ? ad.kycCardPriority : null) }}>
      {k.priority && <div style={ad.kycPriorityRibbon}>PRIORITARIO</div>}
      <div style={ad.kycTopRow}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ ...ad.kycAv, background: TONES[k.tone] }}>{k.initials}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={ad.kycName}>{k.name}</div>
          <div style={ad.kycMeta}>
            <Ic name="wrench" size={10} color="#0A6BCF" />
            <span>{k.trade}</span>
            <span style={ad.bullet} />
            <Ic name="map-pin" size={10} color="#6B7280" />
            <span>{k.region}</span>
          </div>
        </div>
        <span style={{ ...ad.kycWaitChip, background: k.overdue ? "rgba(220,38,38,0.10)" : "rgba(245,158,11,0.14)", color: k.overdue ? "#DC2626" : "#B45309" }}>
          <Ic name="timer" size={9} color={k.overdue ? "#DC2626" : "#B45309"} />
          <span>{k.waiting}</span>
        </span>
      </div>

      {/* Doc completion strip */}
      <div style={ad.docStrip}>
        <DocPill ok={k.has.ine}    label="INE" />
        <DocPill ok={k.has.addr}   label="Domicilio" />
        <DocPill ok={k.has.selfie} label="Selfie" />
        {k.blocking && (
          <span style={ad.blockChip}>
            <Ic name="alert-circle" size={9} color="#DC2626" />
            <span>{k.blocking} falta</span>
          </span>
        )}
        <span style={ad.kycSpacer} />
        <button style={ad.reviewBtn}>
          Revisar
          <Ic name="arrow-right" size={12} color="#FFFFFF" stroke={2.5} style={{ marginLeft: 4 }} />
        </button>
      </div>
    </div>
  );
}

function DocPill({ ok, label }) {
  return (
    <span style={{ ...ad.docPill, ...(ok ? ad.docPillOk : ad.docPillMissing) }}>
      <Ic name={ok ? "check" : "x"} size={9} color={ok ? "#0F8A56" : "#9CA3AF"} stroke={3} />
      <span>{label}</span>
    </span>
  );
}

// =====================================================================
// SCREEN 02 — KYC DETAIL
// =====================================================================
function KycDetailScreen() {
  const docs = [
    { id: "ine-f",    label: "INE · Anverso",       tone: "linear-gradient(135deg, #F4E4BC, #E5D2A0)", band: "#15803D",  ok: true,  details: { name: "RAMÓN HERNÁNDEZ GARCÍA", curp: "HEGR810521HJCRNM05", expires: "2030" } },
    { id: "ine-r",    label: "INE · Reverso",       tone: "linear-gradient(135deg, #0E2C56, #1E3A5F)", band: "#0A6BCF", ok: true,  details: { mrz: "IDMEX0123456789...", state: "JALISCO" } },
    { id: "domicilio", label: "Comprobante domicilio", tone: "linear-gradient(135deg, #B45309, #F59E0B)", band: "#DC2626", ok: null, details: { kind: "Recibo CFE · marzo 2026", street: "Calle Pavo 320, Providencia" } },
  ];
  return (
    <div style={ad.wrap}>
      <AdminHeader title="Ramón Hernández" count={undefined} sub="Solicitud KYC · 28h en cola" />

      <div style={ad.body}>
        {/* Identity */}
        <div style={ad.idCard}>
          <div style={ad.idAvWrap}>
            <div style={{ ...ad.idAv, background: TONES[0] }}>RH</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={ad.idName}>Ramón Hernández García</div>
            <div style={ad.idMeta}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#0A6BCF", fontWeight: 700 }}>HEGR810521HJCRNM05</span>
            </div>
            <div style={ad.idChipsRow}>
              <span style={ad.idChip}><Ic name="map-pin" size={9} color="#0A6BCF" /><span>Providencia</span></span>
              <span style={ad.idChip}><Ic name="wrench" size={9} color="#0A6BCF" /><span>4 categorías</span></span>
              <span style={ad.idChip}><Ic name="calendar" size={9} color="#0A6BCF" /><span>45 años</span></span>
            </div>
          </div>
        </div>

        {/* Verification checklist mini */}
        <div style={ad.checklistRow}>
          <ChecklistItem label="Datos básicos" done />
          <ChecklistItem label="INE" done />
          <ChecklistItem label="Domicilio" pending />
          <ChecklistItem label="Selfie" done />
        </div>

        {/* Doc carousel */}
        <div style={ad.carouselHead}>
          <div style={ad.carouselLabel}>DOCUMENTOS · {docs.length}</div>
          <div style={ad.carouselDots}>
            <span style={{ ...ad.carouselDot, ...ad.carouselDotActive }} />
            <span style={ad.carouselDot} />
            <span style={ad.carouselDot} />
          </div>
        </div>

        <div style={ad.carouselWrap}>
          {/* Active card */}
          <DocSlide d={docs[0]} active />
          {/* Hint of next */}
          <div style={ad.carouselNextHint}>
            <Ic name="chevron-right" size={14} color="#9CA3AF" />
          </div>
        </div>

        {/* Per-doc actions */}
        <div style={ad.docActionsRow}>
          <button style={ad.docActOkSel}>
            <Ic name="check" size={11} color="#FFFFFF" stroke={3} />
            <span>OK · legible</span>
          </button>
          <button style={ad.docActReject}>
            <Ic name="eye-off" size={11} color="#DC2626" />
            <span>Ilegible</span>
          </button>
          <button style={ad.docActZoom}>
            <Ic name="zoom-in" size={12} color="#0A6BCF" />
          </button>
        </div>

        {/* OCR match card */}
        <div style={ad.ocrCard}>
          <div style={ad.ocrHead}>
            <Ic name="sparkles" size={12} color="#0A6BCF" />
            <span style={ad.ocrLabel}>OCR · COINCIDENCIAS</span>
            <span style={ad.ocrMatchChip}>92% match</span>
          </div>
          <OcrRow label="Nombre"  match="exact" val="Ramón Hernández García" />
          <OcrRow label="CURP"    match="exact" val="HEGR810521HJCRNM05" />
          <OcrRow label="Domicilio" match="partial" val="Calle Pavo 320, Providencia 45160" />
          <OcrRow label="Selfie"  match="biometric" val="Coincidencia 96% con foto INE" />
        </div>

        {/* Notes */}
        <div style={ad.notesLabel}>NOTAS INTERNAS · NO VISIBLE AL TÉCNICO</div>
        <div style={ad.notesBox}>
          <textarea
            style={ad.notesTextarea}
            rows={3}
            placeholder="Cualquier observación interna (cola, decisión, contexto)…"
            defaultValue="INE en buen estado. Comprobante domicilio se ve borroso en el folio del recibo. Solicitar foto más clara antes de aprobar."
          />
          <div style={ad.notesFoot}>
            <span style={ad.notesAuthor}>
              <span style={ad.notesAuthorAv}>SA</span>
              <span>Sofía A.</span>
            </span>
            <span style={ad.notesCount}>178/500</span>
          </div>
        </div>
      </div>

      <div style={ad.footer}>
        <button style={ad.rejectBtn}>
          <Ic name="x" size={14} color="#DC2626" style={{ marginRight: 5 }} />
          Rechazar
        </button>
        <button style={ad.approveBtn}>
          <Ic name="check" size={16} color="#FFFFFF" stroke={2.8} style={{ marginRight: 8 }} />
          <span>Aprobar KYC</span>
        </button>
      </div>
    </div>
  );
}

function ChecklistItem({ label, done, pending }) {
  return (
    <div style={ad.checklistItem}>
      <div style={{
        ...ad.checklistDot,
        background: done ? "#18A66A" : pending ? "#FFFFFF" : "#EEF3F8",
        border: pending ? "2px solid #F59E0B" : "none",
      }}>
        {done && <Ic name="check" size={8} color="#FFFFFF" stroke={3.5} />}
        {pending && <div style={ad.pendingInner} />}
      </div>
      <span style={{ ...ad.checklistText, color: done ? "#0F8A56" : pending ? "#B45309" : "#9CA3AF", fontWeight: done || pending ? 700 : 500 }}>{label}</span>
    </div>
  );
}

function DocSlide({ d, active }) {
  return (
    <div style={{ ...ad.docSlide, ...(active ? ad.docSlideActive : null) }}>
      <div style={ad.docNumChip}>1 / 3</div>
      <div style={ad.docLabelChip}>{d.label}</div>
      <div style={{ ...ad.docImg, background: d.tone }}>
        <DocVisual band={d.band} details={d.details} />
        <div style={ad.docZoomCorner}>
          <Ic name="maximize-2" size={11} color="#FFFFFF" />
        </div>
      </div>
    </div>
  );
}

function DocVisual({ band, details }) {
  // Stylized INE document
  return (
    <svg viewBox="0 0 320 180" width="100%" height="100%" style={{ display: "block", borderRadius: 10 }}>
      <rect width="320" height="180" fill="transparent" />
      <rect width="320" height="26" fill={band} />
      <text x="14" y="18" fontFamily="Inter" fontWeight="700" fontSize="9" fill="#FFFFFF" letterSpacing="0.08em">IDENTIFICACIÓN OFICIAL</text>
      <text x="306" y="18" fontFamily="Inter" fontWeight="700" fontSize="9" fill="#FFFFFF" textAnchor="end" opacity="0.85">MÉXICO</text>
      {/* Photo */}
      <rect x="14" y="36" width="76" height="96" rx="3" fill="#E5D2A0" stroke="#94A3B8" strokeWidth="0.8" />
      <circle cx="52" cy="68" r="14" fill="#C8A874" />
      <path d="M 24 130 Q 52 96 80 130" fill="#C8A874" />
      {/* Text fields */}
      {details.name && (
        <>
          <text x="100" y="44" fontFamily="Inter" fontWeight="600" fontSize="6" fill="#6B7280">NOMBRE</text>
          <text x="100" y="56" fontFamily="Inter" fontWeight="700" fontSize="9" fill="#0E2C56">{details.name.split(" ").slice(0, 2).join(" ")}</text>
          <text x="100" y="66" fontFamily="Inter" fontWeight="700" fontSize="9" fill="#0E2C56">{details.name.split(" ").slice(2).join(" ")}</text>
          <text x="100" y="86" fontFamily="Inter" fontWeight="600" fontSize="6" fill="#6B7280">CURP</text>
          <text x="100" y="98" fontFamily="'JetBrains Mono'" fontWeight="700" fontSize="8" fill="#0E2C56" letterSpacing="0.06em">{details.curp}</text>
          <text x="100" y="118" fontFamily="Inter" fontWeight="600" fontSize="6" fill="#6B7280">VIGENCIA</text>
          <text x="100" y="128" fontFamily="'JetBrains Mono'" fontWeight="700" fontSize="9" fill="#0E2C56">{details.expires}</text>
        </>
      )}
      {details.mrz && (
        <>
          <rect x="14" y="148" width="292" height="22" rx="2" fill="rgba(255,255,255,0.85)" />
          <text x="20" y="162" fontFamily="'JetBrains Mono'" fontWeight="700" fontSize="9" fill="#0E2C56" letterSpacing="0.04em">{details.mrz}</text>
        </>
      )}
    </svg>
  );
}

function OcrRow({ label, match, val }) {
  const map = {
    exact:     { bg: "rgba(24,166,106,0.12)", color: "#0F8A56", text: "Exacto" },
    partial:   { bg: "rgba(245,158,11,0.14)", color: "#B45309", text: "Parcial" },
    biometric: { bg: "rgba(10,107,207,0.10)", color: "#0A6BCF", text: "Biométrico" },
  };
  const m = map[match];
  return (
    <div style={ad.ocrRow}>
      <span style={ad.ocrRowLabel}>{label}</span>
      <span style={ad.ocrRowVal}>{val}</span>
      <span style={{ ...ad.ocrRowChip, background: m.bg, color: m.color }}>
        <Ic name={match === "partial" ? "alert-triangle" : "check"} size={8} color={m.color} stroke={2.6} />
        <span>{m.text}</span>
      </span>
    </div>
  );
}

// =====================================================================
// SCREEN 03 — KYC REJECT BOTTOM SHEET
// =====================================================================
function KycRejectScreen() {
  return (
    <div style={ad.wrap}>
      {/* Dimmed background */}
      <div style={{ filter: "blur(2px)", opacity: 0.5, pointerEvents: "none", position: "absolute", inset: 0 }}>
        <AdminHeader title="Ramón Hernández" sub="Solicitud KYC · 28h en cola" />
        <div style={ad.body}>
          <div style={ad.idCard}>
            <div style={{ ...ad.idAv, background: TONES[0] }}>RH</div>
            <div>
              <div style={ad.idName}>Ramón Hernández</div>
            </div>
          </div>
        </div>
      </div>
      <div style={ad.scrim} />

      <div style={ad.sheet}>
        <div style={ad.sheetHandle} />
        <div style={ad.sheetHeadCol}>
          <div style={ad.sheetIconBig}>
            <Ic name="x" size={22} color="#DC2626" stroke={2.5} />
          </div>
          <div style={ad.sheetTitle}>Rechazar KYC</div>
          <div style={ad.sheetSub}>
            El técnico recibe <b style={{ color: "#0E2C56", fontWeight: 700 }}>push + email</b> con el motivo y puede volver a subir.
          </div>
        </div>

        <div style={ad.reasonGrid}>
          <ReasonItem icon="eye-off"      label="Documentos ilegibles"      sub="Foto borrosa o reflejos" />
          <ReasonItem icon="alert-circle" label="Información inconsistente" sub="Datos no coinciden entre docs" selected />
          <ReasonItem icon="calendar-x"   label="Documento expirado"        sub="INE o constancia vencida" />
          <ReasonItem icon="user-x"       label="Persona no coincide"       sub="Selfie distinta a INE" />
          <ReasonItem icon="more-horizontal" label="Otro motivo" />
        </div>

        <div style={ad.msgLabel}>MENSAJE AL TÉCNICO · OBLIGATORIO</div>
        <div style={ad.msgBox}>
          <textarea
            style={ad.msgTextarea}
            rows={4}
            defaultValue="Hola Ramón, el nombre en tu comprobante de domicilio difiere ligeramente del de tu INE. Por favor sube un comprobante actual con tu nombre completo igual al de la INE (recibo CFE, Telmex o agua). Te llega notificación al validar."
          />
          <div style={ad.msgFoot}>
            <span style={ad.msgPlantilla}>
              <Ic name="file-text" size={11} color="#0A6BCF" />
              <span>Usar plantilla</span>
            </span>
            <span style={ad.msgCount}>247/600</span>
          </div>
        </div>

        <div style={ad.impactCard}>
          <Ic name="info" size={12} color="#0A6BCF" />
          <div style={{ flex: 1 }}>
            El técnico podrá <b style={{ color: "#0E2C56", fontWeight: 700 }}>reenviar documentos</b> hasta 3 veces. Después se escala a manual review.
          </div>
        </div>

        <div style={ad.sheetFooter}>
          <button style={ad.sheetCancel}>Cancelar</button>
          <button style={ad.sheetConfirm}>
            <Ic name="x" size={13} color="#FFFFFF" stroke={2.8} style={{ marginRight: 6 }} />
            Confirmar rechazo
          </button>
        </div>
      </div>
    </div>
  );
}

function ReasonItem({ icon, label, sub, selected }) {
  return (
    <div style={{ ...ad.reasonItem, ...(selected ? ad.reasonItemSel : null) }}>
      <div style={{ ...ad.reasonIcon, ...(selected ? ad.reasonIconSel : null) }}>
        <Ic name={icon} size={14} color={selected ? "#FFFFFF" : "#6B7280"} stroke={2.2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...ad.reasonLabel, color: selected ? "#0E2C56" : "#6B7280", fontWeight: selected ? 700 : 500 }}>{label}</div>
        {sub && <div style={ad.reasonSub}>{sub}</div>}
      </div>
      <div style={{ ...ad.radio, ...(selected ? ad.radioSel : null) }}>
        {selected && <div style={ad.radioDot} />}
      </div>
    </div>
  );
}

// =====================================================================
// SCREEN 04 — DISPUTES LIST
// =====================================================================
const TICKETS = [
  { id: "T-2841", kind: "dispute", sev: "high",    initials: "MR", tone: 1, name: "María Rodríguez",  type: "Disputa · cobro",      msg: "El técnico cobró $400 extras que yo no aprobé. Tengo el chat…",       sla: "1h 22m", elapsed: 38, mine: true,  unread: 3 },
  { id: "T-2840", kind: "ticket",  sev: "urgent",  initials: "RH", tone: 0, name: "Ramón Hernández",  type: "Soporte · pago",       msg: "No me ha llegado el depósito del servicio #SVC-2799 desde el martes",  sla: "0h 45m", elapsed: 78, mine: true,  unread: 1 },
  { id: "T-2839", kind: "dispute", sev: "medium", initials: "CM", tone: 4, name: "Carlos Mendoza",   type: "Disputa · trabajo",    msg: "El trabajo no quedó bien, la fuga regresó al día siguiente. Adjunto…", sla: "3h 12m", elapsed: 22, mine: true,  unread: 0 },
  { id: "T-2837", kind: "ticket",  sev: "medium", initials: "LP", tone: 2, name: "Lupita Pérez",     type: "Cuenta · KYC rechazado", msg: "¿Por qué rechazaron mi comprobante? El recibo es de hace 2 meses",     sla: "5h 04m", elapsed: 12, mine: false, unread: 0 },
  { id: "T-2835", kind: "dispute", sev: "high",   initials: "AG", tone: 3, name: "Adriana García",   type: "Disputa · cancelación", msg: "El cliente canceló cuando yo ya estaba en el sitio, me cobraron 10%",  sla: "2h 18m", elapsed: 45, mine: true,  unread: 2 },
  { id: "T-2832", kind: "ticket",  sev: "low",    initials: "JC", tone: 5, name: "José Carlos J.",   type: "Soporte · técnico",     msg: "La app no me deja subir fotos en la galería",                          sla: "8h 30m", elapsed: 4,  mine: false, unread: 0 },
];

function DisputesListScreen() {
  return (
    <div style={ad.wrap}>
      <AdminHeader title="Soporte y disputas" sub="12 asignados · 8 disputas · SLA medio 2h 48m" />

      <div style={ad.disputeTabs}>
        <div style={{ ...ad.disputeTab, ...ad.disputeTabActive }}>
          <span>Asignados a mí</span>
          <span style={{ ...ad.disputeTabCount, ...ad.disputeTabCountActive }}>12</span>
        </div>
        <div style={ad.disputeTab}>
          <Ic name="alert-triangle" size={11} color="#DC2626" />
          <span>Disputas</span>
          <span style={ad.disputeTabCount}>8</span>
        </div>
        <div style={ad.disputeTab}>
          <span>Otros</span>
          <span style={ad.disputeTabCount}>24</span>
        </div>
      </div>

      <div style={ad.body}>
        {/* SLA strip */}
        <div style={ad.slaStrip}>
          <SlaPill color="#DC2626" label="Urgente" count="2" />
          <SlaPill color="#B45309" label="Alta"    count="5" />
          <SlaPill color="#0A6BCF" label="Media"   count="3" />
          <SlaPill color="#9CA3AF" label="Baja"    count="2" />
        </div>

        <div style={ad.ticketList}>
          {TICKETS.map(t => <TicketRow key={t.id} t={t} />)}
        </div>
      </div>
    </div>
  );
}

function SlaPill({ color, label, count }) {
  return (
    <div style={ad.slaPill}>
      <span style={{ ...ad.slaDot, background: color }} />
      <span style={ad.slaLabel}>{label}</span>
      <span style={{ ...ad.slaCount, color }}>{count}</span>
    </div>
  );
}

function TicketRow({ t }) {
  const sevMap = {
    urgent: { color: "#DC2626", bg: "rgba(220,38,38,0.10)", label: "URGENTE" },
    high:   { color: "#B45309", bg: "rgba(245,158,11,0.14)", label: "ALTA" },
    medium: { color: "#0A6BCF", bg: "rgba(10,107,207,0.10)", label: "MEDIA" },
    low:    { color: "#6B7280", bg: "rgba(14,44,86,0.05)",   label: "BAJA" },
  };
  const s = sevMap[t.sev];
  const kindMap = {
    dispute: { color: "#DC2626", bg: "rgba(220,38,38,0.10)", icon: "alert-triangle" },
    ticket:  { color: "#0A6BCF", bg: "rgba(10,107,207,0.10)", icon: "headphones" },
  };
  const k = kindMap[t.kind];
  return (
    <div style={ad.ticketRow}>
      {/* SLA gauge */}
      <div style={ad.slaCol}>
        <div style={ad.slaGauge}>
          <svg width="36" height="36" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="14" fill="none" stroke="#EEF3F8" strokeWidth="3.5" />
            <circle cx="18" cy="18" r="14" fill="none" stroke={s.color} strokeWidth="3.5" strokeLinecap="round"
              strokeDasharray={`${(t.elapsed / 100) * 88} 88`} transform="rotate(-90 18 18)" />
          </svg>
          <div style={{ ...ad.slaPct, color: s.color }}>{t.elapsed}%</div>
        </div>
        <div style={ad.slaTimer}>{t.sla}</div>
      </div>

      <div style={{ ...ad.ticketAv, background: TONES[t.tone] }}>{t.initials}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={ad.ticketTopRow}>
          <span style={ad.ticketName}>{t.name}</span>
          <span style={ad.ticketId}>{t.id}</span>
        </div>
        <div style={ad.ticketTypeRow}>
          <span style={{ ...ad.ticketKindBadge, background: k.bg, color: k.color }}>
            <Ic name={k.icon} size={9} color={k.color} stroke={2.4} />
            <span>{t.type}</span>
          </span>
          <span style={{ ...ad.ticketSevChip, background: s.bg, color: s.color }}>{s.label}</span>
        </div>
        <div style={ad.ticketMsg}>{t.msg}</div>
      </div>

      <div style={ad.ticketRight}>
        {t.unread > 0 && <span style={ad.ticketUnread}>{t.unread}</span>}
        <Ic name="chevron-right" size={14} color="#9CA3AF" />
      </div>
    </div>
  );
}

// =====================================================================
// SCREEN 05 — DISPUTE DETAIL
// =====================================================================
function DisputeDetailScreen() {
  return (
    <div style={ad.wrap}>
      {/* Header */}
      <div style={ad.detailHeader}>
        <button style={ad.backBtn}><Ic name="arrow-left" size={17} color="#0E2C56" /></button>
        <div style={ad.detailAvWrap}>
          <div style={{ ...ad.detailAv, background: TONES[1] }}>MR</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={ad.detailName}>María Rodríguez</div>
          <div style={ad.detailMeta}>
            <span style={ad.detailIdMono}>T-2841</span>
            <span style={ad.bullet} />
            <span style={ad.detailType}>Disputa · cobro</span>
          </div>
        </div>
        <button style={ad.iconBtn}><Ic name="more-vertical" size={17} color="#0E2C56" /></button>
      </div>

      {/* Context strip */}
      <div style={ad.contextStrip}>
        <div style={ad.contextItem}>
          <Ic name="link" size={10} color="#0A6BCF" />
          <span style={ad.contextLabel}>SVC</span>
          <span style={ad.contextVal}>#2851</span>
        </div>
        <div style={ad.contextDiv} />
        <div style={ad.contextItem}>
          <Ic name="dollar-sign" size={10} color="#0F8A56" />
          <span style={ad.contextLabel}>MONTO</span>
          <span style={ad.contextVal}>$850</span>
        </div>
        <div style={ad.contextDiv} />
        <div style={ad.contextItem}>
          <Ic name="timer" size={10} color="#DC2626" />
          <span style={ad.contextLabel}>SLA</span>
          <span style={{ ...ad.contextVal, color: "#DC2626" }}>1h 22m</span>
        </div>
      </div>

      {/* Conversation */}
      <div style={ad.convo}>
        {/* System message */}
        <div style={ad.sysMsg}>
          <Ic name="info" size={11} color="#9CA3AF" />
          <span>Disputa abierta · 19/05 · 18:48</span>
        </div>

        {/* User msg */}
        <UserMsg name="María R." time="18:48"
          text="El técnico Ramón me cobró $400 de extras que yo nunca aprobé. En el chat me dijo que era para sellar la tubería pero nunca aprobé esa cotización."
        />

        {/* Attachment */}
        <UserMsg name="María R." time="18:49"
          attach={[
            { tone: "linear-gradient(135deg,#0A6BCF,#0894EA)", label: "Chat screenshot" },
            { tone: "linear-gradient(135deg,#B45309,#F59E0B)", label: "Factura" },
          ]}
        />

        {/* Admin reply */}
        <AdminMsg name="Sofía A." time="18:52"
          text="Hola María, lamento el inconveniente. Estoy revisando el caso. Te confirmo en menos de 30 minutos qué procede."
          status="read"
        />

        {/* Tech reply */}
        <UserMsg name="Ramón H." time="19:02" alt
          text="Yo le mandé la cotización por el chat de servicio y ella respondió con OK 👍🏼. Tengo la captura."
        />

        {/* Internal note */}
        <InternalNote name="Sofía A." time="19:18"
          text="Revisado log de chat: María sí respondió con 👍🏼 a la cotización de $400. Recomiendo cierre a favor del técnico + tip al cliente sobre proceso de aprobación."
        />

        {/* SLA warning */}
        <div style={ad.slaWarning}>
          <Ic name="alert-triangle" size={11} color="#B45309" />
          <span>SLA vence en <b style={{ color: "#7B3F00", fontWeight: 700 }}>1h 22m</b> · Responde a María pronto.</span>
        </div>
      </div>

      {/* Quick actions accordion */}
      <div style={ad.adminActionsBar}>
        <div style={ad.adminActionsHead}>
          <Ic name="zap" size={11} color="#0A6BCF" />
          <span style={ad.adminActionsLabel}>ACCIONES DEL ADMIN</span>
          <Ic name="chevron-up" size={14} color="#0A6BCF" style={{ marginLeft: "auto" }} />
        </div>
        <div style={ad.adminActionsGrid}>
          <AdminAction icon="rotate-ccw" tone="amber" label="Reembolsar" />
          <AdminAction icon="x-circle"   tone="red"   label="Cancelar servicio" />
          <AdminAction icon="ban"        tone="red"   label="Suspender usuario" />
          <AdminAction icon="file-text"  tone="blue"  label="Plantillas" />
          <AdminAction icon="user-cog"   tone="blue"  label="Escalar a legal" />
          <AdminAction icon="badge-check" tone="green" label="Cierre a favor" />
        </div>
      </div>

      {/* Composer */}
      <div style={ad.composer}>
        <div style={ad.composerToggle}>
          <div style={{ ...ad.composerToggleOpt, ...ad.composerToggleOptSel }}>
            <Ic name="message-circle" size={11} color="#FFFFFF" />
            <span>Pública</span>
          </div>
          <div style={ad.composerToggleOpt}>
            <Ic name="lock" size={11} color="#6B7280" />
            <span>Nota interna</span>
          </div>
        </div>
        <div style={ad.composerInputRow}>
          <button style={ad.composerAttachBtn}><Ic name="paperclip" size={14} color="#6B7280" /></button>
          <span style={ad.composerPlaceholder}>Responder a María…</span>
          <button style={ad.composerSendBtn}>
            <Ic name="send" size={14} color="#FFFFFF" />
          </button>
        </div>
      </div>
    </div>
  );
}

function UserMsg({ name, time, text, attach, alt }) {
  return (
    <div style={ad.msgWrap}>
      <div style={ad.msgHead}>
        <div style={{ ...ad.msgAv, background: alt ? TONES[0] : TONES[1] }}>{alt ? "RH" : "MR"}</div>
        <span style={ad.msgName}>{name}</span>
        <span style={ad.msgTime}>{time}</span>
      </div>
      {text && <div style={ad.userBubble}>{text}</div>}
      {attach && (
        <div style={ad.attachRow}>
          {attach.map((a, i) => (
            <div key={i} style={{ ...ad.attachThumb, background: a.tone }}>
              <Ic name="image" size={16} color="rgba(255,255,255,0.85)" />
              <span style={ad.attachLabel}>{a.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminMsg({ name, time, text, status }) {
  return (
    <div style={{ ...ad.msgWrap, alignItems: "flex-end" }}>
      <div style={ad.adminBubble}>
        {text}
        <div style={ad.adminMsgFoot}>
          <span style={ad.adminMsgName}>{name}</span>
          <span style={ad.adminMsgTime}>{time}</span>
          {status === "read" && <Ic name="check-check" size={11} color="#18C1FF" />}
        </div>
      </div>
    </div>
  );
}

function InternalNote({ name, time, text }) {
  return (
    <div style={ad.internalNote}>
      <div style={ad.internalNoteTop}>
        <Ic name="lock" size={10} color="#B45309" />
        <span style={ad.internalNoteLabel}>NOTA INTERNA · solo admin</span>
        <span style={ad.internalNoteTime}>{time}</span>
      </div>
      <div style={ad.internalNoteText}>{text}</div>
      <div style={ad.internalNoteAuthor}>— {name}</div>
    </div>
  );
}

function AdminAction({ icon, tone, label }) {
  const map = {
    blue:  { bg: "rgba(10,107,207,0.10)",  color: "#0A6BCF" },
    amber: { bg: "rgba(245,158,11,0.14)",  color: "#B45309" },
    red:   { bg: "rgba(220,38,38,0.10)",   color: "#DC2626" },
    green: { bg: "rgba(24,166,106,0.12)",  color: "#0F8A56" },
  };
  const v = map[tone];
  return (
    <div style={ad.adminAction}>
      <div style={{ ...ad.adminActionIcon, background: v.bg }}>
        <Ic name={icon} size={13} color={v.color} stroke={2.2} />
      </div>
      <span style={ad.adminActionLabel}>{label}</span>
    </div>
  );
}

// =====================================================================
// CANVAS
// =====================================================================
function PhoneFrame({ children }) {
  return (
    <div style={{ padding: 24 }}>
      <IOSDevice width={390} height={844}>
        <div style={{ width: 390, height: 844, position: "relative", overflow: "hidden", background: "#F8FBFF" }}>{children}</div>
      </IOSDevice>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="kyc" title="Flujo 1 · Aprobación de KYC" subtitle="Listado · detalle · rechazo">
        <DCArtboard id="kyc-list" label="01 · KYC pendientes (cola)" width={438} height={892}>
          <PhoneFrame><KycListScreen /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="kyc-detail" label="02 · Detalle del técnico" width={438} height={892}>
          <PhoneFrame><KycDetailScreen /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="kyc-reject" label="03 · Modal de rechazo" width={438} height={892}>
          <PhoneFrame><KycRejectScreen /></PhoneFrame>
        </DCArtboard>
      </DCSection>

      <DCSection id="disputes" title="Flujo 2 · Soporte y disputas" subtitle="Bandeja + conversación">
        <DCArtboard id="disp-list" label="04 · Bandeja de tickets" width={438} height={892}>
          <PhoneFrame><DisputesListScreen /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="disp-detail" label="05 · Detalle de disputa" width={438} height={892}>
          <PhoneFrame><DisputeDetailScreen /></PhoneFrame>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// =====================================================================
// STYLES
// =====================================================================
const ad = {
  wrap: { width: "100%", height: "100%", background: "#F8FBFF", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" },
  body: { flex: 1, overflowY: "auto", padding: "12px 16px 100px" },

  // Header
  header: { display: "flex", alignItems: "center", gap: 10, padding: "50px 16px 12px", background: "#FFFFFF", borderBottom: "1px solid #F0F4F9", flexShrink: 0 },
  backBtn: { width: 38, height: 38, borderRadius: 11, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  iconBtn: { width: 38, height: 38, borderRadius: 11, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  headerTitleRow: { display: "flex", alignItems: "center", gap: 6 },
  headerTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.01em" },
  headerCount: { padding: "1px 8px", background: "#DC2626", color: "#FFFFFF", borderRadius: 999, fontSize: 11, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", boxShadow: "0 2px 6px rgba(220,38,38,0.30)" },
  headerSub: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  bullet: { width: 2, height: 2, borderRadius: "50%", background: "#9CA3AF", margin: "0 2px" },

  // ===== KYC List =====
  filterRow: { display: "flex", gap: 6, padding: "10px 16px 8px", background: "#FFFFFF", borderBottom: "1px solid #F0F4F9", overflowX: "auto", flexShrink: 0 },
  filterChip: { display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", background: "#FFFFFF", border: "1.5px solid #E1E8F0", borderRadius: 999, fontSize: 11.5, fontWeight: 600, color: "#0A6BCF", flexShrink: 0, cursor: "pointer" },
  filterChipSel: { background: "#0A6BCF", borderColor: "#0A6BCF", color: "#FFFFFF" },
  filterCount: { padding: "1px 6px", background: "rgba(180,83,9,0.15)", color: "#B45309", borderRadius: 999, fontSize: 9.5, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" },

  statsBanner: { display: "flex", padding: "12px 14px", background: "linear-gradient(135deg, rgba(10,107,207,0.06), rgba(24,193,255,0.04))", border: "1px solid rgba(10,107,207,0.20)", borderRadius: 14, marginBottom: 12 },
  statsBlock: { flex: 1, textAlign: "center" },
  statsVal: { fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em", lineHeight: 1 },
  statsLabel: { fontSize: 10, color: "#9CA3AF", marginTop: 4, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, letterSpacing: ".04em" },
  statsDiv: { width: 1, background: "#E1E8F0", margin: "0 8px" },

  listSectionLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF", letterSpacing: ".12em", fontWeight: 700, padding: "4px 4px 8px" },
  kycList: { display: "flex", flexDirection: "column", gap: 8 },
  kycCard: { position: "relative", padding: "12px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14 },
  kycCardPriority: { borderColor: "#F59E0B", boxShadow: "0 4px 12px rgba(245,158,11,0.12)" },
  kycPriorityRibbon: { position: "absolute", top: -6, right: 12, padding: "2px 8px", background: "linear-gradient(135deg,#F59E0B,#FBBF24)", color: "#FFFFFF", borderRadius: 999, fontSize: 9, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".08em", boxShadow: "0 4px 10px rgba(245,158,11,0.30)" },
  kycTopRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  kycAv: { width: 40, height: 40, borderRadius: "50%", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 13, flexShrink: 0 },
  kycName: { fontSize: 13.5, fontWeight: 700, color: "#0E2C56" },
  kycMeta: { display: "flex", alignItems: "center", gap: 4, marginTop: 2, fontSize: 11, color: "#6B7280" },
  kycWaitChip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 },

  docStrip: { display: "flex", alignItems: "center", gap: 5, paddingTop: 10, borderTop: "1px solid #F4F7FB" },
  docPill: { display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  docPillOk: { background: "rgba(24,166,106,0.10)", color: "#0F8A56" },
  docPillMissing: { background: "#F4F7FB", color: "#9CA3AF" },
  blockChip: { display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", background: "rgba(220,38,38,0.10)", color: "#DC2626", borderRadius: 999, fontSize: 9.5, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" },
  kycSpacer: { flex: 1 },
  reviewBtn: { display: "inline-flex", alignItems: "center", padding: "6px 12px", background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(10,107,207,0.25)" },

  bulkRow: { display: "flex", alignItems: "center", gap: 6, marginTop: 12, padding: "10px 12px", background: "rgba(10,107,207,0.04)", border: "1px dashed rgba(10,107,207,0.25)", borderRadius: 10, fontSize: 11, color: "#6B7280" },
  bulkBtn: { marginLeft: "auto", padding: "4px 10px", background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #0A6BCF", borderRadius: 6, fontSize: 10.5, fontWeight: 700, cursor: "pointer" },

  // ===== KYC Detail =====
  idCard: { display: "flex", alignItems: "center", gap: 12, padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, marginBottom: 12 },
  idAvWrap: { position: "relative", flexShrink: 0 },
  idAv: { width: 56, height: 56, borderRadius: "50%", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 17 },
  idName: { fontSize: 15, fontWeight: 800, color: "#0E2C56", fontFamily: "'Manrope', sans-serif", letterSpacing: "-0.01em" },
  idMeta: { marginTop: 4 },
  idChipsRow: { display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 },
  idChip: { display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", background: "#F8FBFF", border: "1px solid #E1E8F0", color: "#6B7280", borderRadius: 999, fontSize: 10, fontWeight: 600 },

  checklistRow: { display: "flex", gap: 6, marginBottom: 12 },
  checklistItem: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "8px 4px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10 },
  checklistDot: { width: 18, height: 18, borderRadius: "50%", display: "grid", placeItems: "center", flexShrink: 0 },
  pendingInner: { width: 7, height: 7, borderRadius: "50%", background: "#F59E0B" },
  checklistText: { fontSize: 10.5, fontWeight: 700 },

  carouselHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  carouselLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF", letterSpacing: ".1em", fontWeight: 700 },
  carouselDots: { display: "flex", gap: 5 },
  carouselDot: { width: 6, height: 6, borderRadius: "50%", background: "#E1E8F0" },
  carouselDotActive: { width: 18, background: "#0A6BCF", borderRadius: 3 },

  carouselWrap: { position: "relative", marginBottom: 8 },
  docSlide: { position: "relative", borderRadius: 14, overflow: "hidden", border: "1.5px solid #E1E8F0", background: "#FFFFFF" },
  docSlideActive: { borderColor: "#0A6BCF", boxShadow: "0 6px 18px rgba(10,107,207,0.18)" },
  docNumChip: { position: "absolute", top: 10, left: 10, padding: "2px 8px", background: "rgba(14,44,86,0.85)", color: "#FFFFFF", borderRadius: 999, fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".04em", zIndex: 2, backdropFilter: "blur(4px)" },
  docLabelChip: { position: "absolute", top: 10, right: 10, padding: "2px 8px", background: "rgba(255,255,255,0.94)", color: "#0E2C56", borderRadius: 999, fontSize: 10.5, fontWeight: 700, zIndex: 2 },
  docImg: { position: "relative", height: 220, padding: 12 },
  docZoomCorner: { position: "absolute", bottom: 10, right: 10, width: 26, height: 26, borderRadius: 8, background: "rgba(14,44,86,0.85)", display: "grid", placeItems: "center", backdropFilter: "blur(4px)" },
  carouselNextHint: { position: "absolute", right: -4, top: "50%", transform: "translateY(-50%)", width: 26, height: 60, background: "rgba(255,255,255,0.85)", borderRadius: "10px 0 0 10px", display: "grid", placeItems: "center", boxShadow: "0 4px 10px rgba(14,44,86,0.10)" },

  docActionsRow: { display: "flex", gap: 6, marginBottom: 12 },
  docActOkSel: { flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "9px", background: "#18A66A", color: "#FFFFFF", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(24,166,106,0.30)" },
  docActReject: { flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "9px", background: "#FFFFFF", color: "#DC2626", border: "1.5px solid #DC2626", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" },
  docActZoom: { width: 38, padding: "9px", background: "#FFFFFF", color: "#0A6BCF", border: "1.5px solid #E1E8F0", borderRadius: 10, cursor: "pointer", display: "grid", placeItems: "center" },

  ocrCard: { padding: 12, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12, marginBottom: 14 },
  ocrHead: { display: "flex", alignItems: "center", gap: 5, marginBottom: 10 },
  ocrLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#0A6BCF", letterSpacing: ".1em", fontWeight: 700, flex: 1 },
  ocrMatchChip: { padding: "2px 8px", background: "rgba(24,166,106,0.12)", color: "#0F8A56", borderRadius: 999, fontSize: 9.5, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" },
  ocrRow: { display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #F4F7FB" },
  ocrRowLabel: { width: 64, fontSize: 10, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, letterSpacing: ".04em" },
  ocrRowVal: { flex: 1, fontSize: 11.5, color: "#0E2C56", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  ocrRowChip: { display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 6px", borderRadius: 4, fontSize: 9, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },

  notesLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#B45309", letterSpacing: ".08em", fontWeight: 700, marginBottom: 6 },
  notesBox: { padding: "10px 12px", background: "rgba(245,158,11,0.05)", border: "1px dashed rgba(245,158,11,0.30)", borderRadius: 10 },
  notesTextarea: { width: "100%", minHeight: 60, border: "none", outline: "none", resize: "none", background: "transparent", fontSize: 12.5, color: "#0E2C56", fontFamily: "'Inter', sans-serif", lineHeight: 1.5 },
  notesFoot: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 6, marginTop: 6, borderTop: "1px dashed rgba(245,158,11,0.25)" },
  notesAuthor: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10.5, color: "#6B7280" },
  notesAuthorAv: { width: 18, height: 18, borderRadius: "50%", background: "#0A6BCF", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 9 },
  notesCount: { fontSize: 10.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },

  footer: { position: "absolute", left: 0, right: 0, bottom: 0, background: "#FFFFFF", borderTop: "1px solid #E1E8F0", padding: "14px 16px 30px", display: "flex", gap: 10, alignItems: "center", boxShadow: "0 -4px 12px rgba(14,44,86,0.06)", zIndex: 5 },
  rejectBtn: { flex: "0 0 38%", padding: "13px", background: "#FFFFFF", color: "#DC2626", border: "1.5px solid #DC2626", borderRadius: 14, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  approveBtn: { flex: 1, padding: "13px", background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(10,107,207,0.30)" },

  // ===== KYC reject sheet =====
  scrim: { position: "absolute", inset: 0, background: "rgba(14,44,86,0.55)", zIndex: 8 },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, background: "#FFFFFF", borderRadius: "20px 20px 0 0", padding: "10px 18px 30px", boxShadow: "0 -12px 30px rgba(14,44,86,0.20)", zIndex: 10, maxHeight: "90%", overflowY: "auto" },
  sheetHandle: { width: 40, height: 4, background: "#E1E8F0", borderRadius: 999, margin: "0 auto 12px" },
  sheetHeadCol: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 16 },
  sheetIconBig: { width: 50, height: 50, borderRadius: "50%", background: "rgba(220,38,38,0.10)", border: "1.5px solid rgba(220,38,38,0.30)", display: "grid", placeItems: "center", marginBottom: 10 },
  sheetTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 19, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em" },
  sheetSub: { fontSize: 12, color: "#6B7280", marginTop: 6, lineHeight: 1.5, maxWidth: 300 },

  reasonGrid: { display: "flex", flexDirection: "column", gap: 5 },
  reasonItem: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#FFFFFF", border: "1.5px solid #E1E8F0", borderRadius: 12, cursor: "pointer" },
  reasonItemSel: { borderColor: "#DC2626", background: "rgba(220,38,38,0.04)" },
  reasonIcon: { width: 30, height: 30, borderRadius: 8, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", flexShrink: 0 },
  reasonIconSel: { background: "#DC2626", borderColor: "#DC2626" },
  reasonLabel: { fontSize: 13 },
  reasonSub: { fontSize: 10.5, color: "#9CA3AF", marginTop: 2 },
  radio: { width: 20, height: 20, borderRadius: "50%", border: "2px solid #E1E8F0", display: "grid", placeItems: "center", flexShrink: 0 },
  radioSel: { borderColor: "#DC2626" },
  radioDot: { width: 9, height: 9, borderRadius: "50%", background: "#DC2626" },

  msgLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#DC2626", letterSpacing: ".08em", fontWeight: 700, marginTop: 14, marginBottom: 6 },
  msgBox: { padding: "10px 12px", background: "#F8FBFF", border: "1.5px solid #0A6BCF", borderRadius: 10, boxShadow: "0 0 0 3px rgba(10,107,207,0.10)" },
  msgTextarea: { width: "100%", minHeight: 70, border: "none", outline: "none", resize: "none", background: "transparent", fontSize: 12.5, color: "#0E2C56", fontFamily: "'Inter', sans-serif", lineHeight: 1.5 },
  msgFoot: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, marginTop: 6, borderTop: "1px solid #E1E8F0" },
  msgPlantilla: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", background: "rgba(10,107,207,0.08)", color: "#0A6BCF", borderRadius: 999, fontSize: 10.5, fontWeight: 700 },
  msgCount: { fontSize: 10.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },

  impactCard: { display: "flex", alignItems: "flex-start", gap: 6, marginTop: 12, padding: "10px 12px", background: "rgba(10,107,207,0.05)", border: "1px dashed rgba(10,107,207,0.25)", borderRadius: 10, fontSize: 11.5, color: "#6B7280", lineHeight: 1.5 },

  sheetFooter: { display: "flex", gap: 8, marginTop: 18 },
  sheetCancel: { flex: 1, padding: "12px", background: "transparent", color: "#6B7280", border: "1px solid #E1E8F0", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer" },
  sheetConfirm: { flex: 2, padding: "12px", background: "#DC2626", color: "#FFFFFF", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 13.5, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(220,38,38,0.30)" },

  // ===== Disputes List =====
  disputeTabs: { display: "flex", padding: "0 16px", background: "#FFFFFF", borderBottom: "1px solid #F0F4F9", gap: 4, flexShrink: 0 },
  disputeTab: { display: "flex", alignItems: "center", gap: 5, padding: "12px 6px", fontSize: 12.5, fontWeight: 600, color: "#6B7280", flex: 1, justifyContent: "center", cursor: "pointer", borderBottom: "2px solid transparent" },
  disputeTabActive: { color: "#0A6BCF", borderBottom: "2px solid #0A6BCF", fontWeight: 800 },
  disputeTabCount: { padding: "1px 7px", borderRadius: 999, fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", background: "rgba(14,44,86,0.06)", color: "#6B7280" },
  disputeTabCountActive: { background: "#0A6BCF", color: "#FFFFFF" },

  slaStrip: { display: "flex", gap: 6, marginBottom: 10 },
  slaPill: { flex: 1, display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 9px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10 },
  slaDot: { width: 6, height: 6, borderRadius: "50%" },
  slaLabel: { fontSize: 10, color: "#6B7280", fontWeight: 600 },
  slaCount: { marginLeft: "auto", fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 800 },

  ticketList: { display: "flex", flexDirection: "column", gap: 6 },
  ticketRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12, cursor: "pointer" },
  slaCol: { width: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0 },
  slaGauge: { position: "relative", width: 36, height: 36 },
  slaPct: { position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, fontWeight: 800 },
  slaTimer: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#6B7280", fontWeight: 700, letterSpacing: ".02em" },

  ticketAv: { width: 36, height: 36, borderRadius: "50%", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 11.5, flexShrink: 0 },
  ticketTopRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 },
  ticketName: { fontSize: 13, fontWeight: 700, color: "#0E2C56" },
  ticketId: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF", fontWeight: 700 },
  ticketTypeRow: { display: "flex", alignItems: "center", gap: 5, marginTop: 4 },
  ticketKindBadge: { display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 6px", borderRadius: 4, fontSize: 9.5, fontWeight: 700 },
  ticketSevChip: { padding: "1px 6px", borderRadius: 4, fontSize: 8.5, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".06em" },
  ticketMsg: { fontSize: 11.5, color: "#6B7280", marginTop: 4, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" },
  ticketRight: { display: "flex", alignItems: "center", gap: 6, flexShrink: 0 },
  ticketUnread: { padding: "0 7px", background: "#DC2626", color: "#FFFFFF", borderRadius: 999, fontSize: 10.5, fontWeight: 800, fontFamily: "'Manrope', sans-serif", minWidth: 18, height: 18, display: "grid", placeItems: "center" },

  // ===== Dispute Detail =====
  detailHeader: { display: "flex", alignItems: "center", gap: 10, padding: "50px 14px 10px", background: "#FFFFFF", borderBottom: "1px solid #F0F4F9", flexShrink: 0 },
  detailAvWrap: { position: "relative", flexShrink: 0 },
  detailAv: { width: 38, height: 38, borderRadius: "50%", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 12 },
  detailName: { fontSize: 14, fontWeight: 800, color: "#0E2C56", fontFamily: "'Manrope', sans-serif", letterSpacing: "-0.01em" },
  detailMeta: { display: "flex", alignItems: "center", gap: 4, marginTop: 2, fontSize: 11, color: "#6B7280" },
  detailIdMono: { fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#0A6BCF" },
  detailType: { color: "#DC2626", fontWeight: 700 },

  contextStrip: { display: "flex", alignItems: "stretch", padding: "8px 16px", background: "#0E2C56", color: "#FFFFFF", flexShrink: 0 },
  contextItem: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 },
  contextLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.65)", letterSpacing: ".08em", fontWeight: 700 },
  contextVal: { fontFamily: "'Manrope', sans-serif", fontSize: 12, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.01em" },
  contextDiv: { width: 1, background: "rgba(255,255,255,0.18)" },

  convo: { flex: 1, overflowY: "auto", padding: "14px 14px 8px", display: "flex", flexDirection: "column", gap: 12, background: "#F8FBFF" },
  sysMsg: { display: "inline-flex", alignSelf: "center", alignItems: "center", gap: 5, padding: "4px 10px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 999, fontSize: 10.5, color: "#6B7280" },

  msgWrap: { display: "flex", flexDirection: "column", gap: 5 },
  msgHead: { display: "flex", alignItems: "center", gap: 6 },
  msgAv: { width: 22, height: 22, borderRadius: "50%", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 9 },
  msgName: { fontSize: 11, fontWeight: 700, color: "#0E2C56" },
  msgTime: { fontSize: 10, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", marginLeft: "auto" },
  userBubble: { padding: "10px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: "12px 12px 12px 4px", fontSize: 12.5, color: "#0E2C56", lineHeight: 1.5, maxWidth: "85%" },
  attachRow: { display: "flex", gap: 5 },
  attachThumb: { position: "relative", width: 80, height: 80, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0 },
  attachLabel: { position: "absolute", left: 4, bottom: 4, padding: "1px 5px", background: "rgba(14,44,86,0.65)", color: "#FFFFFF", borderRadius: 3, fontSize: 8.5, fontWeight: 600 },

  adminBubble: { padding: "10px 12px", background: "linear-gradient(135deg, #0A6BCF, #0894EA)", color: "#FFFFFF", borderRadius: "12px 12px 4px 12px", fontSize: 12.5, lineHeight: 1.5, maxWidth: "85%", boxShadow: "0 4px 10px rgba(10,107,207,0.20)" },
  adminMsgFoot: { display: "flex", alignItems: "center", gap: 5, marginTop: 6, fontSize: 10, color: "rgba(255,255,255,0.75)" },
  adminMsgName: { fontWeight: 700 },
  adminMsgTime: { fontFamily: "'JetBrains Mono', monospace" },

  internalNote: { padding: "10px 12px", background: "rgba(245,158,11,0.06)", border: "1px dashed rgba(245,158,11,0.40)", borderRadius: 10 },
  internalNoteTop: { display: "flex", alignItems: "center", gap: 5, marginBottom: 6 },
  internalNoteLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#B45309", letterSpacing: ".08em", fontWeight: 800, flex: 1 },
  internalNoteTime: { fontSize: 10, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" },
  internalNoteText: { fontSize: 12, color: "#7B3F00", lineHeight: 1.5 },
  internalNoteAuthor: { fontSize: 10, color: "#9CA3AF", marginTop: 4, fontStyle: "italic" },

  slaWarning: { display: "flex", alignSelf: "center", alignItems: "center", gap: 5, padding: "6px 11px", background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.30)", borderRadius: 999, fontSize: 10.5, color: "#7B3F00", marginTop: 4 },

  adminActionsBar: { flexShrink: 0, padding: "10px 14px", background: "#FFFFFF", borderTop: "1px solid #E1E8F0" },
  adminActionsHead: { display: "flex", alignItems: "center", gap: 5, paddingBottom: 8 },
  adminActionsLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#0A6BCF", letterSpacing: ".1em", fontWeight: 800 },
  adminActionsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 },
  adminAction: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 4px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 10, cursor: "pointer" },
  adminActionIcon: { width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center" },
  adminActionLabel: { fontSize: 10, fontWeight: 700, color: "#0E2C56", textAlign: "center", lineHeight: 1.2 },

  composer: { flexShrink: 0, background: "#FFFFFF", borderTop: "1px solid #E1E8F0", padding: "10px 14px 30px" },
  composerToggle: { display: "inline-flex", gap: 2, padding: 2, background: "#EEF3F8", borderRadius: 8, marginBottom: 8 },
  composerToggleOpt: { display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 11px", borderRadius: 6, fontSize: 11, fontWeight: 700, color: "#6B7280", cursor: "pointer" },
  composerToggleOptSel: { background: "#0A6BCF", color: "#FFFFFF", boxShadow: "0 2px 6px rgba(10,107,207,0.30)" },
  composerInputRow: { display: "flex", alignItems: "center", gap: 8 },
  composerAttachBtn: { width: 36, height: 36, borderRadius: 10, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  composerPlaceholder: { flex: 1, padding: "10px 14px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 999, fontSize: 12.5, color: "#9CA3AF" },
  composerSendBtn: { width: 36, height: 36, borderRadius: "50%", background: "#0A6BCF", border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0, boxShadow: "0 4px 10px rgba(10,107,207,0.30)" },
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
