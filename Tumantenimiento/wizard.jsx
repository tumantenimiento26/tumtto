/* global React, ReactDOM, IOSDevice */
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

const TECH_TONE = "linear-gradient(135deg, #0A6BCF, #18C1FF)";

// ============================================================
// SHARED HEADER + FOOTER
// ============================================================
function StepHeader({ step, title }) {
  const pct = (step / 5) * 100;
  return (
    <div style={w.header}>
      <div style={w.headerTop}>
        <button style={w.backBtn}><Ic name="arrow-left" size={18} color="#0E2C56" /></button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={w.stepLabel}>Paso {step} de 5</div>
          <div style={w.stepTitle}>{title}</div>
        </div>
        <button style={w.helpBtn}><Ic name="help-circle" size={16} color="#6B7280" /></button>
      </div>
      <div style={w.progressTrack}>
        <div style={{ ...w.progressFill, width: `${pct}%` }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ ...w.progressTick, left: `${(i / 5) * 100}%`, background: i <= step ? "#FFFFFF" : "#E1E8F0" }} />
        ))}
      </div>
    </div>
  );
}

function StepFooter({ next = "Siguiente", primary = true, disabled = false, full = false, label = null }) {
  if (full) {
    return (
      <div style={w.footer}>
        <button style={{ ...w.btnPrimary, width: "100%" }} disabled={disabled}>
          <Ic name="send" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
          {label || next}
        </button>
      </div>
    );
  }
  return (
    <div style={w.footer}>
      <button style={w.btnGhost}>Atrás</button>
      <button style={{ ...w.btnPrimary, ...(disabled ? w.btnPrimaryDisabled : null) }} disabled={disabled}>
        {next}
        <Ic name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />
      </button>
    </div>
  );
}

// ============================================================
// STEP 1 — DESCRIBE
// ============================================================
function Step1() {
  return (
    <div style={w.wrap}>
      <StepHeader step={1} title="Cuéntanos qué necesitas" />
      <div style={w.body}>
        {/* Tech mini card */}
        <div style={w.techCard}>
          <div style={{ ...w.techAv, background: TECH_TONE }}>
            <span>RH</span>
            <div style={w.techVerify}><Ic name="check" size={9} color="#FFFFFF" stroke={3.5} /></div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0E2C56" }}>Ramón Hernández</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <Ic name="star" size={11} color="#F59E0B" />
              <b style={{ fontSize: 11.5, color: "#0E2C56", fontWeight: 700 }}>4.8</b>
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>· Plomería · Drenaje</span>
            </div>
          </div>
          <a href="#" style={w.changeLink}>Cambiar</a>
        </div>

        {/* Subcategoría */}
        <SectionLabel num="01">Tipo de servicio</SectionLabel>
        <div style={w.chipsScroll}>
          {[
            { label: "Fugas",            sel: true },
            { label: "Calentadores" },
            { label: "Drenaje" },
            { label: "Instalación WC" },
            { label: "Otros" },
          ].map((c, i) => (
            <div key={i} style={{ ...w.catChip, ...(c.sel ? w.catChipSel : null) }}>
              {c.label}
            </div>
          ))}
        </div>

        {/* Description */}
        <SectionLabel num="02">Describe el problema</SectionLabel>
        <textarea
          style={w.textarea}
          defaultValue="Tengo una fuga debajo del lavabo del baño desde ayer. El agua gotea constantemente y mojó el piso del baño. La llave de paso ya la cerré pero el goteo sigue."
        />
        <div style={w.charCount}>
          <Ic name="check-circle-2" size={11} color="#18A66A" />
          <span><b style={{ color: "#0E2C56", fontWeight: 600 }}>Buena descripción</b> — ayuda al técnico a llegar preparado</span>
          <span style={{ marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace", color: "#9CA3AF" }}>187 / 500</span>
        </div>

        {/* Photos */}
        <SectionLabel num="03">Agrega fotos del problema <span style={w.optionalTag}>opcional</span></SectionLabel>
        <div style={w.photoGrid}>
          <div style={w.photoAdd}>
            <Ic name="camera" size={22} color="#0A6BCF" />
            <span style={{ fontSize: 10, color: "#0A6BCF", fontWeight: 600, marginTop: 4 }}>Agregar</span>
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ ...w.photoTile, background: ["linear-gradient(135deg,#0A6BCF,#18C1FF)","linear-gradient(135deg,#0E2C56,#0894EA)","linear-gradient(135deg,#B45309,#F59E0B)"][i] }}>
              <button style={w.photoClose}><Ic name="x" size={10} color="#FFFFFF" stroke={3} /></button>
              <span style={w.photoBadge}>{i + 1} / 5</span>
            </div>
          ))}
        </div>
        <div style={w.hintLine}>
          <Ic name="info" size={11} color="#0A6BCF" />
          <span>Las fotos ayudan al técnico a llevar las herramientas correctas desde el primer viaje.</span>
        </div>
      </div>
      <StepFooter />
    </div>
  );
}

// ============================================================
// STEP 2 — ADDRESS
// ============================================================
function Step2() {
  return (
    <div style={w.wrap}>
      <StepHeader step={2} title="¿Dónde será el servicio?" />
      <div style={w.body}>
        <p style={w.subBody}>Puede ser diferente a tu dirección principal. El técnico verá esta dirección al aceptar.</p>

        <div style={w.addrList}>
          <AddressOption icon="home" label="Casa" sel
            line1="Av. Patria 1234"
            line2="Providencia, Zapopan, Jal. 45160"
            badge="Principal" />
          <AddressOption icon="briefcase" label="Oficina"
            line1="Av. Vallarta 2000"
            line2="Lafayette, Guadalajara, Jal. 44150" />
          <AddressOption icon="map-pin" label="Otra dirección"
            line1="Capturar nueva dirección"
            line2="Calle, número, colonia, referencias…" muted />
        </div>

        <button style={w.addAddrBtn}>
          <Ic name="plus" size={14} color="#0A6BCF" style={{ marginRight: 8 }} />
          Agregar nueva dirección
        </button>

        {/* Selected summary */}
        <div style={w.addrSummary}>
          <SelectedMap />
          <div style={w.addrSummaryBody}>
            <div style={w.addrSummaryHead}>
              <div style={w.summaryIcon}><Ic name="home" size={13} color="#0A6BCF" /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0E2C56" }}>Casa · Av. Patria 1234</div>
                <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>Providencia, Zapopan</div>
              </div>
              <span style={{ ...w.tinyBadge, background: "#E5F7EE", color: "#18A66A" }}>
                <Ic name="check" size={9} color="#18A66A" />En zona
              </span>
            </div>
            <div style={w.referenciasLabel}>Referencias adicionales para este servicio</div>
            <textarea
              style={w.referenciasInput}
              defaultValue="Frente al parque, casa color blanco. Hay un Sentra azul afuera. Toca el timbre 2 veces."
            />
          </div>
        </div>
      </div>
      <StepFooter />
    </div>
  );
}

function AddressOption({ icon, label, line1, line2, sel, badge, muted }) {
  return (
    <div style={{ ...w.addrRow, ...(sel ? w.addrRowSel : null), ...(muted ? { borderStyle: "dashed" } : null) }}>
      <div style={{ ...w.addrIcon, ...(sel ? w.addrIconSel : (muted ? w.addrIconMuted : null)) }}>
        <Ic name={icon} size={16} color={sel ? "#FFFFFF" : (muted ? "#9CA3AF" : "#0A6BCF")} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: muted ? "#6B7280" : "#0E2C56" }}>{label}</span>
          {badge && <span style={w.principalBadge}>{badge}</span>}
        </div>
        <div style={{ fontSize: 12, color: muted ? "#9CA3AF" : "#0E2C56", marginTop: 3 }}>{line1}</div>
        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{line2}</div>
      </div>
      <div style={{ ...w.radio, ...(sel ? w.radioSel : null) }}>
        {sel && <div style={w.radioDot} />}
      </div>
    </div>
  );
}

function SelectedMap() {
  return (
    <svg viewBox="0 0 350 110" width="100%" height={100} style={{ display: "block", background: "#DDE7F1", borderRadius: "12px 12px 0 0" }}>
      <defs>
        <pattern id="addrG" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M22 0 L0 0 0 22" fill="none" stroke="#CCD7E5" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="350" height="110" fill="url(#addrG)" />
      <path d="M0 60 Q 100 50 350 70" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.95" />
      <path d="M175 0 Q 170 55 195 110" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
      <g transform="translate(175, 60)">
        <circle r="18" fill="rgba(10,107,207,0.18)" />
        <circle r="6" fill="#0A6BCF" stroke="#FFFFFF" strokeWidth="2" />
      </g>
    </svg>
  );
}

// ============================================================
// STEP 3 — DATE & TIME
// ============================================================
function Step3() {
  const days = [
    { d: "Lun", n: 19, avail: "full",    today: true,  sel: true },
    { d: "Mar", n: 20, avail: "full" },
    { d: "Mié", n: 21, avail: "lleno" },
    { d: "Jue", n: 22, avail: "limited" },
    { d: "Vie", n: 23, avail: "limited" },
    { d: "Sáb", n: 24, avail: "full" },
    { d: "Dom", n: 25, avail: "off" },
  ];

  return (
    <div style={w.wrap}>
      <StepHeader step={3} title="¿Cuándo?" />
      <div style={w.body}>
        {/* Mode tabs */}
        <div style={w.modeTabs}>
          <div style={w.modeTab}>
            <span>Hoy</span>
            <span style={w.modeTabBadge}>Ahora ✓</span>
          </div>
          <div style={{ ...w.modeTab, ...w.modeTabSel }}>Esta semana</div>
          <div style={w.modeTab}>Más adelante</div>
        </div>

        <SectionLabel num="01">Selecciona el día · semana del 19 may</SectionLabel>
        <div style={w.weekGrid}>
          {days.map((d, i) => {
            const tone =
              d.avail === "off"    ? { bg: "#FBFDFF", border: "#E1E8F0", color: "#9CA3AF" } :
              d.avail === "lleno"  ? { bg: "#FCE9E9", border: "rgba(220,38,38,0.3)", color: "#DC2626" } :
              d.avail === "limited"? { bg: "#FEF3DC", border: "rgba(245,158,11,0.3)", color: "#B45309" } :
              d.sel               ? { bg: "#0A6BCF", border: "#0A6BCF", color: "#FFFFFF" } :
              { bg: "#FFFFFF", border: "#E1E8F0", color: "#0E2C56" };

            return (
              <div key={i} style={{ ...w.dayCell, background: tone.bg, borderColor: tone.border, color: tone.color }}>
                <div style={{ fontSize: 10, fontWeight: 600, opacity: d.sel ? 0.85 : 0.6, textTransform: "uppercase", letterSpacing: ".04em" }}>{d.d}</div>
                <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 18, marginTop: 4 }}>{d.n}</div>
                <div style={{ fontSize: 9, opacity: 0.85, marginTop: 4 }}>
                  {d.avail === "off" ? "—" :
                   d.avail === "lleno" ? "Lleno" :
                   d.avail === "limited" ? "Limit." :
                   d.today ? "Hoy" : "Libre"}
                </div>
                {d.today && !d.sel && <div style={w.todayDot} />}
              </div>
            );
          })}
        </div>

        <SectionLabel num="02">Franja horaria · Lunes 19 de mayo</SectionLabel>
        <SlotRow label="Mañana"  range="8:00 AM – 12:00 PM" status="avail" />
        <SlotRow label="Mediodía" range="12:00 PM – 3:00 PM" status="avail" />
        <SlotRow label="Tarde"   range="3:00 PM – 7:00 PM" status="sel" />
        <SlotRow label="Noche"   range="7:00 PM – 9:00 PM" status="off" />

        <div style={w.urgentRow}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0E2C56", display: "flex", alignItems: "center", gap: 6 }}>
              <Ic name="zap" size={13} color="#F59E0B" />
              Necesito atención urgente
            </div>
            <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 2 }}>En las próximas 2 horas · aplica recargo del 20%</div>
          </div>
          <div style={w.toggle}><span style={w.toggleKnob} /></div>
        </div>
      </div>
      <StepFooter />
    </div>
  );
}

function SlotRow({ label, range, status }) {
  const isSel = status === "sel";
  const isOff = status === "off";
  return (
    <div style={{ ...w.slotRow, ...(isSel ? w.slotRowSel : null), ...(isOff ? w.slotRowOff : null) }}>
      <div style={w.slotIconWrap}>
        <Ic name={label === "Mañana" ? "sunrise" : label === "Mediodía" ? "sun" : label === "Tarde" ? "sunset" : "moon"}
          size={18} color={isSel ? "#FFFFFF" : isOff ? "#9CA3AF" : "#0A6BCF"} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: isSel ? "#FFFFFF" : isOff ? "#9CA3AF" : "#0E2C56" }}>{label}</div>
        <div style={{ fontSize: 11.5, color: isSel ? "rgba(255,255,255,0.85)" : isOff ? "#9CA3AF" : "#6B7280", marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
          {range}
        </div>
      </div>
      {isOff ? (
        <span style={{ ...w.tinyBadge, background: "#EEF3F8", color: "#9CA3AF" }}>No disponible</span>
      ) : (
        <div style={{ ...w.radio, ...(isSel ? { background: "#FFFFFF", borderColor: "#FFFFFF" } : null) }}>
          {isSel && <div style={{ ...w.radioDot, background: "#0A6BCF" }} />}
        </div>
      )}
    </div>
  );
}

// ============================================================
// STEP 4 — SUMMARY
// ============================================================
function Step4() {
  return (
    <div style={w.wrap}>
      <StepHeader step={4} title="Revisa tu solicitud" />
      <div style={w.body}>
        <p style={w.subBody}>Toca <b style={{ color: "#0A6BCF", fontWeight: 600 }}>Editar</b> en cualquier sección para ajustar antes de enviar.</p>

        <SummaryCard icon="hard-hat" label="Técnico">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ ...w.techAv, background: TECH_TONE, width: 40, height: 40, fontSize: 13 }}>
              <span>RH</span>
              <div style={w.techVerify}><Ic name="check" size={8} color="#FFFFFF" stroke={3.5} /></div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0E2C56" }}>Ramón Hernández García</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2, fontSize: 11.5, color: "#6B7280" }}>
                <Ic name="star" size={10} color="#F59E0B" />
                <b style={{ color: "#0E2C56", fontWeight: 700 }}>4.8</b>
                <span>· Plomería</span>
              </div>
            </div>
          </div>
        </SummaryCard>

        <SummaryCard icon="wrench" label="Servicio">
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0E2C56", marginBottom: 6 }}>Plomería · Fugas</div>
          <p style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
            "Tengo una fuga debajo del lavabo del baño desde ayer. El agua gotea constantemente y mojó el piso…
            <a href="#" style={{ color: "#0A6BCF", textDecoration: "none", fontWeight: 500, marginLeft: 4 }}>Ver más</a>
          </p>
          <div style={{ display: "flex", gap: 5, marginTop: 10 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: 40, height: 40, borderRadius: 6, background: ["linear-gradient(135deg,#0A6BCF,#18C1FF)","linear-gradient(135deg,#0E2C56,#0894EA)","linear-gradient(135deg,#B45309,#F59E0B)"][i] }} />
            ))}
            <div style={{ width: 40, height: 40, borderRadius: 6, background: "#F8FBFF", border: "1px dashed #E1E8F0", display: "grid", placeItems: "center", fontSize: 10, color: "#9CA3AF", fontWeight: 600 }}>+0</div>
          </div>
        </SummaryCard>

        <SummaryCard icon="map-pin" label="Dirección">
          <div style={{ display: "flex", gap: 10 }}>
            <SelectedMapMini />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0E2C56" }}>Casa</div>
              <div style={{ fontSize: 11.5, color: "#0E2C56", marginTop: 3, lineHeight: 1.4 }}>Av. Patria 1234, Providencia</div>
              <div style={{ fontSize: 11, color: "#6B7280", marginTop: 1 }}>Zapopan, Jal. 45160</div>
            </div>
          </div>
        </SummaryCard>

        <SummaryCard icon="calendar-clock" label="Fecha y hora">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={w.dateBlock}>
              <div style={{ fontSize: 9.5, color: "#0A6BCF", textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>Hoy</div>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 22, color: "#0E2C56", lineHeight: 1 }}>19</div>
              <div style={{ fontSize: 10, color: "#6B7280", marginTop: 2 }}>may</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0E2C56" }}>Tarde</div>
              <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 3, fontFamily: "'JetBrains Mono', monospace" }}>3:00 PM – 7:00 PM</div>
            </div>
          </div>
        </SummaryCard>

        {/* Tarifa */}
        <div style={w.tarifaCard}>
          <div style={w.tarifaTopRow}>
            <div style={w.tarifaIcon}><Ic name="receipt-text" size={16} color="#0A6BCF" /></div>
            <span style={w.tarifaLabel}>Tarifa estimada</span>
            <span style={w.tarifaInfo}>
              <Ic name="info" size={11} color="#6B7280" />
            </span>
          </div>
          <div style={w.tarifaPriceRow}>
            <span style={w.tarifaPrice}>$450</span>
            <span style={w.tarifaCurr}>MXN</span>
            <span style={{ marginLeft: "auto", ...w.tinyBadge, background: "rgba(10,107,207,0.10)", color: "#0A6BCF" }}>
              <Ic name="shield" size={9} color="#0A6BCF" />Precio inicial
            </span>
          </div>
          <div style={w.tarifaBreak}>
            <div style={w.tarifaBreakRow}>
              <span>Tarifa base visita</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>$280</span>
            </div>
            <div style={w.tarifaBreakRow}>
              <span>Diagnóstico · primera hora</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>$170</span>
            </div>
            <div style={{ ...w.tarifaBreakRow, color: "#9CA3AF" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Ic name="plus" size={10} color="#9CA3AF" />
                Refacciones según diagnóstico
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#9CA3AF" }}>variable</span>
            </div>
          </div>
          <div style={w.tarifaNote}>
            <Ic name="info" size={11} color="#0884B0" />
            <span>El precio final puede variar según diagnóstico. <b style={{ color: "#0E2C56", fontWeight: 600 }}>Verás la cotización actualizada</b> y debes aprobarla antes de que el técnico ejecute el trabajo.</span>
          </div>
        </div>

        <div style={w.terms}>
          <div style={{ ...w.checkbox, ...w.checkboxSel }}><Ic name="check" size={10} color="#FFFFFF" stroke={3.5} /></div>
          <span>Acepto los <a href="#" style={w.link}>Términos de Servicio</a> y la <a href="#" style={w.link}>Política de Cancelación</a>.</span>
        </div>
      </div>
      <StepFooter full label="Enviar solicitud a Ramón" />
    </div>
  );
}

function SummaryCard({ icon, label, children }) {
  return (
    <div style={w.sumCard}>
      <div style={w.sumHead}>
        <div style={w.sumIcon}><Ic name={icon} size={13} color="#0A6BCF" /></div>
        <span style={w.sumLabel}>{label}</span>
        <a href="#" style={w.editLink}>Editar</a>
      </div>
      <div style={w.sumBody}>{children}</div>
    </div>
  );
}

function SelectedMapMini() {
  return (
    <svg viewBox="0 0 110 80" width="80" height="60" style={{ display: "block", background: "#DDE7F1", borderRadius: 8, flexShrink: 0 }}>
      <rect width="110" height="80" fill="#DDE7F1" />
      <path d="M0 45 Q 50 38 110 50" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.95" />
      <g transform="translate(55, 40)">
        <circle r="12" fill="rgba(10,107,207,0.18)" />
        <circle r="5" fill="#0A6BCF" stroke="#FFFFFF" strokeWidth="2" />
      </g>
    </svg>
  );
}

// ============================================================
// STEP 5 — CONFIRMATION
// ============================================================
function Step5() {
  return (
    <div style={w.wrap}>
      <div style={w.successHeader}>
        <button style={w.backBtn}><Ic name="x" size={18} color="#0E2C56" /></button>
      </div>

      <div style={w.successBody}>
        {/* Success animation */}
        <div style={w.successHero}>
          <div style={w.successHaloOuter}>
            <div style={w.successHalo}>
              <div style={w.successCheck}>
                <Ic name="check" size={56} color="#FFFFFF" stroke={3.5} />
              </div>
            </div>
          </div>
          <div style={w.confettiWrap}>
            {[...Array(14)].map((_, i) => (
              <span key={i} style={{
                position: "absolute",
                left: `${15 + ((i * 27) % 70)}%`,
                top: `${5 + ((i * 17) % 80)}%`,
                width: 7 + (i % 3),
                height: 7 + (i % 3),
                background: ["#0A6BCF", "#18C1FF", "#18A66A", "#F59E0B", "#0884B0"][i % 5],
                borderRadius: i % 2 ? "50%" : 2,
                opacity: 0.7,
                transform: `rotate(${(i * 25) % 360}deg)`,
              }} />
            ))}
          </div>
        </div>

        <h1 style={w.successTitle}>¡Solicitud enviada!</h1>
        <p style={w.successSub}>
          <b style={{ color: "#0E2C56", fontWeight: 700 }}>Ramón</b> tiene <b style={{ color: "#0E2C56", fontWeight: 700 }}>30 minutos</b> para aceptar.
          Te avisamos en cuanto responda.
        </p>

        {/* Countdown */}
        <div style={w.countdownCard}>
          <div style={w.countdownLabel}>
            <Ic name="timer" size={13} color="#B45309" />
            <span>RESPUESTA EN</span>
          </div>
          <div style={w.countdownTime}>29:47</div>
          <div style={w.countdownTrack}>
            <div style={{ ...w.countdownFill, width: "95%" }} />
          </div>
          <div style={w.countdownFoot}>
            <span>Sesión activa</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={w.liveDot} />
              Esperando aceptación
            </span>
          </div>
        </div>

        {/* Summary */}
        <div style={w.miniSummary}>
          <div style={w.miniSummaryRow}>
            <Ic name="hash" size={11} color="#9CA3AF" />
            <span style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>ID</span>
            <span style={{ marginLeft: "auto", fontSize: 12, color: "#0E2C56", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>SVC-2851</span>
          </div>
          <div style={w.miniSummaryRow}>
            <Ic name="hard-hat" size={11} color="#0A6BCF" />
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>Técnico</span>
            <span style={{ marginLeft: "auto", fontSize: 12, color: "#0E2C56", fontWeight: 600 }}>Ramón Hernández</span>
          </div>
          <div style={w.miniSummaryRow}>
            <Ic name="calendar" size={11} color="#0A6BCF" />
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>Cuándo</span>
            <span style={{ marginLeft: "auto", fontSize: 12, color: "#0E2C56", fontWeight: 600 }}>Hoy · 3:00 PM</span>
          </div>
          <div style={{ ...w.miniSummaryRow, paddingTop: 12, marginTop: 4, borderTop: "1px solid #F0F4F9" }}>
            <Ic name="wallet" size={11} color="#0A6BCF" />
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>Estimado</span>
            <span style={{ marginLeft: "auto", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 16, color: "#0E2C56" }}>
              $450 <span style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>MXN</span>
            </span>
          </div>
        </div>
      </div>

      <div style={w.successFooter}>
        <button style={w.btnPrimaryBig}>
          <Ic name="activity" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
          Ver estado de la solicitud
        </button>
        <a href="#" style={w.successLink}>Volver al inicio</a>
      </div>
    </div>
  );
}

// ============================================================
// SHARED MINI
// ============================================================
function SectionLabel({ num, children }) {
  return (
    <div style={w.sectionLabel}>
      <span style={w.sectionNum}>{num}</span>
      <span>{children}</span>
    </div>
  );
}

// ============================================================
// CANVAS
// ============================================================
function PhoneFrame({ children }) {
  return (
    <div style={{ padding: 24 }}>
      <IOSDevice width={390} height={844}>
        <div style={{ width: 390, height: 844, position: "relative", overflow: "hidden", background: "#FFFFFF" }}>{children}</div>
      </IOSDevice>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="wizard" title="Wizard de solicitud" subtitle="5 pasos · cliente">
        <DCArtboard id="step1" label="01 · Describe el problema" width={438} height={892}>
          <PhoneFrame><Step1 /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="step2" label="02 · Dirección" width={438} height={892}>
          <PhoneFrame><Step2 /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="step3" label="03 · Fecha y hora" width={438} height={892}>
          <PhoneFrame><Step3 /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="step4" label="04 · Resumen y tarifa" width={438} height={892}>
          <PhoneFrame><Step4 /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="step5" label="05 · Solicitud enviada" width={438} height={892}>
          <PhoneFrame><Step5 /></PhoneFrame>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// ============================================================
// STYLES
// ============================================================
const w = {
  wrap: { width: "100%", height: "100%", background: "#FFFFFF", position: "relative", display: "flex", flexDirection: "column" },

  // Header
  header: { paddingTop: 48, background: "#FFFFFF", borderBottom: "1px solid #F0F4F9", flexShrink: 0, position: "relative" },
  headerTop: { display: "flex", alignItems: "center", gap: 8, padding: "8px 16px 12px" },
  backBtn: { width: 38, height: 38, borderRadius: 12, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  helpBtn: { width: 38, height: 38, borderRadius: 12, background: "transparent", border: "1px solid transparent", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  stepLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF", letterSpacing: ".08em", fontWeight: 600, textTransform: "uppercase" },
  stepTitle: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 15, color: "#0E2C56", marginTop: 2, letterSpacing: "-0.01em" },
  progressTrack: { height: 3, background: "#EEF3F8", position: "relative" },
  progressFill: { height: "100%", background: "linear-gradient(90deg, #0A6BCF, #18C1FF)", borderRadius: 999, transition: "width .3s" },
  progressTick: { position: "absolute", top: "50%", transform: "translate(-50%, -50%)", width: 6, height: 6, borderRadius: "50%", border: "1px solid #FFFFFF" },

  // Body
  body: { flex: 1, overflowY: "auto", padding: "16px 18px 100px" },
  subBody: { fontSize: 13, color: "#6B7280", margin: "0 0 18px", lineHeight: 1.5 },

  // Footer
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, background: "#FFFFFF", borderTop: "1px solid #E1E8F0", padding: "14px 16px 30px", display: "flex", gap: 10, boxShadow: "0 -4px 12px rgba(14,44,86,0.06)", zIndex: 5 },
  btnPrimary: { flex: 1.6, height: 52, background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 14, fontWeight: 600, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(10,107,207,0.28)" },
  btnPrimaryDisabled: { background: "#DCE6F1", color: "#9CA3AF", boxShadow: "none" },
  btnGhost: { flex: 1, height: 52, background: "#FFFFFF", color: "#0E2C56", border: "1px solid #E1E8F0", borderRadius: 14, fontWeight: 600, fontSize: 15, cursor: "pointer" },

  // SECTION LABEL
  sectionLabel: { display: "flex", alignItems: "center", gap: 8, margin: "18px 0 10px", fontSize: 11.5, color: "#0E2C56", fontWeight: 600 },
  sectionNum: { display: "inline-grid", placeItems: "center", width: 22, height: 22, borderRadius: 6, background: "rgba(10,107,207,0.08)", color: "#0A6BCF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 10 },
  optionalTag: { marginLeft: 6, fontSize: 10, color: "#9CA3AF", fontWeight: 500, padding: "1px 6px", background: "#F8FBFF", borderRadius: 4 },

  // STEP 1
  techCard: { display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 12 },
  techAv: { position: "relative", width: 36, height: 36, borderRadius: "50%", display: "grid", placeItems: "center", color: "#FFFFFF", fontWeight: 600, fontFamily: "'Manrope', sans-serif", fontSize: 11, flexShrink: 0 },
  techVerify: { position: "absolute", right: -2, bottom: -2, width: 14, height: 14, borderRadius: "50%", background: "#18A66A", display: "grid", placeItems: "center", border: "2px solid #FFFFFF" },
  changeLink: { color: "#0A6BCF", textDecoration: "none", fontSize: 12, fontWeight: 600 },
  chipsScroll: { display: "flex", gap: 6, overflowX: "auto", marginRight: -18, paddingRight: 18, paddingBottom: 4 },
  catChip: { display: "inline-flex", flexShrink: 0, padding: "8px 14px", background: "#FFFFFF", border: "1.5px solid #E1E8F0", borderRadius: 999, fontSize: 13, fontWeight: 500, color: "#0E2C56" },
  catChipSel: { background: "#0A6BCF", color: "#FFFFFF", borderColor: "#0A6BCF" },
  textarea: { width: "100%", minHeight: 130, border: "1.5px solid #0A6BCF", borderRadius: 12, padding: "12px 14px", fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#0E2C56", lineHeight: 1.5, outline: "none", resize: "vertical", boxShadow: "0 0 0 3px rgba(10,107,207,0.10)", background: "#FFFFFF" },
  charCount: { display: "flex", alignItems: "center", gap: 5, marginTop: 6, padding: "8px 12px", background: "#E5F7EE", borderRadius: 8, fontSize: 11, color: "#6B7280" },
  photoGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 },
  photoAdd: { aspectRatio: "1", border: "1.5px dashed rgba(10,107,207,0.4)", borderRadius: 12, background: "rgba(10,107,207,0.04)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  photoTile: { position: "relative", aspectRatio: "1", borderRadius: 12, overflow: "hidden" },
  photoClose: { position: "absolute", right: 6, top: 6, width: 20, height: 20, borderRadius: "50%", background: "rgba(14,44,86,0.65)", border: "none", display: "grid", placeItems: "center", cursor: "pointer", backdropFilter: "blur(4px)" },
  photoBadge: { position: "absolute", left: 6, bottom: 6, padding: "1px 6px", borderRadius: 4, background: "rgba(14,44,86,0.65)", color: "#FFFFFF", fontSize: 9.5, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" },
  hintLine: { display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 11.5, color: "#6B7280", lineHeight: 1.4 },

  // STEP 2
  addrList: { display: "flex", flexDirection: "column", gap: 8 },
  addrRow: { display: "flex", alignItems: "center", gap: 12, padding: "14px 14px", background: "#FFFFFF", border: "1.5px solid #E1E8F0", borderRadius: 14, cursor: "pointer" },
  addrRowSel: { borderColor: "#0A6BCF", background: "rgba(10,107,207,0.04)", boxShadow: "0 0 0 3px rgba(10,107,207,0.10)" },
  addrIcon: { width: 38, height: 38, borderRadius: 10, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  addrIconSel: { background: "#0A6BCF" },
  addrIconMuted: { background: "#F8FBFF" },
  principalBadge: { display: "inline-flex", padding: "1px 6px", background: "#E0F6FF", color: "#0884B0", borderRadius: 999, fontSize: 9.5, fontWeight: 700 },
  radio: { width: 22, height: 22, borderRadius: "50%", border: "2px solid #E1E8F0", display: "grid", placeItems: "center", flexShrink: 0 },
  radioSel: { borderColor: "#0A6BCF" },
  radioDot: { width: 10, height: 10, borderRadius: "50%", background: "#0A6BCF" },
  addAddrBtn: { width: "100%", marginTop: 10, padding: "12px", background: "transparent", border: "1.5px dashed rgba(10,107,207,0.4)", borderRadius: 12, color: "#0A6BCF", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  addrSummary: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, overflow: "hidden", marginTop: 18 },
  addrSummaryBody: { padding: 14 },
  addrSummaryHead: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
  summaryIcon: { width: 30, height: 30, borderRadius: 8, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  referenciasLabel: { fontSize: 11, color: "#0E2C56", fontWeight: 500, marginBottom: 6 },
  referenciasInput: { width: "100%", minHeight: 56, border: "1px solid #E1E8F0", borderRadius: 10, padding: "8px 12px", fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#0E2C56", lineHeight: 1.4, outline: "none", resize: "vertical", background: "#FBFDFF" },
  tinyBadge: { display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 7px", borderRadius: 999, fontSize: 10, fontWeight: 700 },

  // STEP 3
  modeTabs: { display: "flex", gap: 6, padding: 3, background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 12, marginBottom: 8 },
  modeTab: { flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "9px 8px", borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: "#6B7280", cursor: "pointer" },
  modeTabSel: { background: "#FFFFFF", color: "#0A6BCF", fontWeight: 700, boxShadow: "0 1px 3px rgba(14,44,86,0.08)" },
  modeTabBadge: { fontSize: 9, padding: "1px 6px", background: "#E5F7EE", color: "#18A66A", borderRadius: 999, fontWeight: 700 },

  weekGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 },
  dayCell: { position: "relative", textAlign: "center", padding: "8px 4px", border: "1.5px solid", borderRadius: 10 },
  todayDot: { position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)", width: 3, height: 3, borderRadius: "50%", background: "#0A6BCF" },

  slotRow: { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#FFFFFF", border: "1.5px solid #E1E8F0", borderRadius: 12, marginBottom: 8, cursor: "pointer" },
  slotRowSel: { background: "#0A6BCF", borderColor: "#0A6BCF" },
  slotRowOff: { background: "#FBFDFF", opacity: 0.7, cursor: "not-allowed" },
  slotIconWrap: { width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.18)", display: "grid", placeItems: "center", flexShrink: 0 },

  urgentRow: { display: "flex", alignItems: "center", gap: 12, padding: "14px 14px", background: "#FEF3DC", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, marginTop: 14 },
  toggle: { position: "relative", width: 42, height: 24, borderRadius: 999, background: "#E1E8F0", flexShrink: 0 },
  toggleKnob: { position: "absolute", left: 3, top: 3, width: 18, height: 18, borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 1px 2px rgba(14,44,86,0.18)" },

  // STEP 4
  sumCard: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12, overflow: "hidden", marginBottom: 10 },
  sumHead: { display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#F8FBFF", borderBottom: "1px solid #F0F4F9" },
  sumIcon: { width: 22, height: 22, borderRadius: 6, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  sumLabel: { fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, flex: 1 },
  editLink: { color: "#0A6BCF", textDecoration: "none", fontSize: 11.5, fontWeight: 600 },
  sumBody: { padding: 14 },
  dateBlock: { padding: "10px 12px", background: "rgba(10,107,207,0.08)", borderRadius: 10, textAlign: "center", flexShrink: 0 },

  tarifaCard: { background: "linear-gradient(160deg, rgba(10,107,207,0.06), rgba(24,193,255,0.05))", border: "1.5px solid #0A6BCF", borderRadius: 14, padding: 16, marginTop: 12 },
  tarifaTopRow: { display: "flex", alignItems: "center", gap: 8 },
  tarifaIcon: { width: 28, height: 28, borderRadius: 8, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  tarifaLabel: { fontSize: 12, color: "#0E2C56", fontWeight: 600, flex: 1 },
  tarifaInfo: { width: 22, height: 22, borderRadius: "50%", background: "rgba(10,107,207,0.10)", display: "inline-grid", placeItems: "center" },
  tarifaPriceRow: { display: "flex", alignItems: "baseline", gap: 4, marginTop: 10 },
  tarifaPrice: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 32, color: "#0E2C56", letterSpacing: "-0.02em", lineHeight: 1 },
  tarifaCurr: { fontSize: 13, color: "#6B7280", fontWeight: 500, fontFamily: "'JetBrains Mono', monospace" },
  tarifaBreak: { marginTop: 14, padding: "10px 12px", background: "#FFFFFF", borderRadius: 10 },
  tarifaBreakRow: { display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12, color: "#6B7280" },
  tarifaNote: { display: "flex", gap: 6, marginTop: 12, padding: "10px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10, fontSize: 11.5, color: "#6B7280", lineHeight: 1.5 },

  terms: { display: "flex", alignItems: "flex-start", gap: 10, marginTop: 16, padding: 12, background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 10, fontSize: 12, color: "#6B7280", lineHeight: 1.5 },
  checkbox: { width: 18, height: 18, borderRadius: 5, border: "1.5px solid #E1E8F0", flexShrink: 0, marginTop: 1, display: "grid", placeItems: "center" },
  checkboxSel: { background: "#0A6BCF", borderColor: "#0A6BCF" },
  link: { color: "#0A6BCF", textDecoration: "none", fontWeight: 500 },

  // STEP 5
  successHeader: { display: "flex", alignItems: "center", padding: "50px 16px 10px", flexShrink: 0 },
  successBody: { flex: 1, padding: "10px 24px 0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  successHero: { position: "relative", width: 200, height: 200, marginBottom: 8 },
  successHaloOuter: { width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(24,166,106,0.18), transparent 70%)", display: "grid", placeItems: "center" },
  successHalo: { width: 140, height: 140, borderRadius: "50%", background: "rgba(24,166,106,0.18)", display: "grid", placeItems: "center" },
  successCheck: { width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg, #18A66A, #4ED896)", display: "grid", placeItems: "center", boxShadow: "0 8px 20px rgba(24,166,106,0.35)" },
  confettiWrap: { position: "absolute", inset: 0, pointerEvents: "none" },

  successTitle: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 28, color: "#0E2C56", letterSpacing: "-0.02em", margin: 0 },
  successSub: { fontSize: 14, color: "#6B7280", margin: "10px 0 22px", lineHeight: 1.5, maxWidth: 300 },

  countdownCard: { width: "100%", padding: 16, background: "linear-gradient(160deg, rgba(245,158,11,0.06), rgba(245,158,11,0.10))", border: "1.5px solid rgba(245,158,11,0.35)", borderRadius: 16, marginBottom: 16 },
  countdownLabel: { display: "flex", alignItems: "center", gap: 5, justifyContent: "center", fontSize: 10, color: "#B45309", letterSpacing: ".08em", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  countdownTime: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 48, color: "#B45309", letterSpacing: "-0.02em", lineHeight: 1, textAlign: "center", marginTop: 6 },
  countdownTrack: { height: 5, background: "rgba(245,158,11,0.18)", borderRadius: 999, overflow: "hidden", marginTop: 14 },
  countdownFill: { height: "100%", background: "linear-gradient(90deg, #F59E0B, #FBBF24)", borderRadius: 999 },
  countdownFoot: { display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "#6B7280" },
  liveDot: { display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#18A66A", boxShadow: "0 0 0 3px rgba(24,166,106,0.18)" },

  miniSummary: { width: "100%", padding: "14px 16px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, display: "flex", flexDirection: "column", gap: 8 },
  miniSummaryRow: { display: "flex", alignItems: "center", gap: 8 },

  successFooter: { padding: "16px 18px 28px", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 },
  btnPrimaryBig: { width: "100%", height: 56, background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 14, fontWeight: 600, fontSize: 16, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(10,107,207,0.3)" },
  successLink: { color: "#6B7280", textDecoration: "none", fontSize: 14, fontWeight: 500 },
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
