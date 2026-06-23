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
// LAYOUT (same shell)
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
          <a href="UILibraryNavigation.html" style={l.heroVer}>← Sección 3 · Navigation</a>
        </div>
        <div style={l.heroEyebrow}>SECCIÓN 04</div>
        <div style={l.heroTitle}>Forms</div>
        <div style={l.heroSub}>
          Controles de entrada para flujos de captura. Select, DatePicker, TimePicker, Toggle, Checkbox/Radio y PhotoUpload con sus variantes mobile (bottom sheet) y desktop (popover).
        </div>
        <div style={l.heroMetaRow}>
          <span style={l.heroChip}><Ic name="check" size={11} color="#4ED896" /><span>Primitives</span></span>
          <span style={l.heroChip}><Ic name="check" size={11} color="#4ED896" /><span>Containers</span></span>
          <span style={l.heroChip}><Ic name="check" size={11} color="#4ED896" /><span>Navigation</span></span>
          <span style={l.heroChip}><Ic name="circle-dot" size={11} color="#FBBF24" /><span>Forms · esta</span></span>
          <span style={l.heroChip}><Ic name="circle" size={11} color="rgba(255,255,255,0.45)" /><span>2 secciones por venir</span></span>
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

function ComponentBlock({ id, name, codeName, desc, mobileGrid, desktopGrid, props, tokens, notes, useCases }) {
  return (
    <div style={l.componentBlock} id={id}>
      <div style={l.componentTopRow}>
        <div>
          <div style={l.componentTitle}>
            <span>{name}</span>
            <span style={l.componentCodeName}>{codeName}</span>
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
              <div style={l.platformRow}><div style={l.platformLabel}><Ic name="smartphone" size={12} color="#0A6BCF" /><span>MOBILE</span><span style={l.platformImpl}>Bottom sheet</span></div></div>
              <div style={l.platformPanel}>{mobileGrid}</div>
            </>
          )}
          {desktopGrid && (
            <>
              <div style={l.platformRow}><div style={l.platformLabel}><Ic name="monitor" size={12} color="#0A6BCF" /><span>DESKTOP</span><span style={l.platformImpl}>Popover</span></div></div>
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
// 4.1 SELECT / DROPDOWN
// =====================================================================
function SelectMobile() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={f.subLabel}>SINGLE · TRIGGER + BOTTOM SHEET</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "flex-start" }}>
          <div>
            <label style={f.fieldLabel}>Categoría</label>
            <div style={f.selectTrigger}>
              <Ic name="wrench" size={13} color="#0A6BCF" />
              <span style={{ flex: 1, fontSize: 13, color: "#0E2C56", fontWeight: 600 }}>Plomería</span>
              <Ic name="chevron-down" size={13} color="#9CA3AF" />
            </div>
          </div>
          <BottomSheet title="Selecciona categoría" search>
            <SheetOption icon="wrench"        label="Plomería" selected />
            <SheetOption icon="zap"           label="Electricidad" />
            <SheetOption icon="flame"         label="Gas" />
            <SheetOption icon="paint-roller"  label="Pintura" />
            <SheetOption icon="hammer"        label="Herrería" />
          </BottomSheet>
        </div>
      </div>

      <div>
        <div style={f.subLabel}>MULTI · CON BÚSQUEDA</div>
        <BottomSheet title="Colonias de cobertura" search badge="4 seleccionadas" applyCount={4}>
          <SheetOption icon="map-pin" label="Providencia" checkbox checked />
          <SheetOption icon="map-pin" label="Vallarta Norte" checkbox checked />
          <SheetOption icon="map-pin" label="Lafayette" checkbox checked />
          <SheetOption icon="map-pin" label="Chapalita" checkbox checked />
          <SheetOption icon="map-pin" label="Country Club" checkbox />
          <SheetOption icon="map-pin" label="Americana" checkbox />
        </BottomSheet>
      </div>
    </div>
  );
}

function BottomSheet({ title, search, badge, applyCount, children, dim }) {
  return (
    <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", background: dim ? "rgba(14,44,86,0.30)" : "transparent", border: "1px dashed #C8D4E0", padding: dim ? 12 : 0 }}>
      <div style={f.sheet}>
        <div style={f.sheetHandle} />
        <div style={f.sheetHead}>
          <span style={f.sheetTitle}>{title}</span>
          {badge && <span style={f.sheetBadge}>{badge}</span>}
        </div>
        {search && (
          <div style={f.sheetSearch}>
            <Ic name="search" size={12} color="#9CA3AF" />
            <span style={{ flex: 1, fontSize: 12, color: "#9CA3AF" }}>Buscar…</span>
          </div>
        )}
        <div>{children}</div>
        {applyCount !== undefined && (
          <div style={f.sheetFooter}>
            <button style={f.sheetCancel}>Cancelar</button>
            <button style={f.sheetApply}>
              <span>Aplicar</span>
              <span style={f.applyCount}>{applyCount}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SheetOption({ icon, label, selected, checkbox, checked }) {
  return (
    <div style={{ ...f.sheetRow, ...(selected ? f.sheetRowSel : null) }}>
      {checkbox ? (
        <div style={{ ...f.cb, ...(checked ? f.cbOn : null) }}>
          {checked && <Ic name="check" size={9} color="#FFFFFF" stroke={3.5} />}
        </div>
      ) : (
        <Ic name={icon} size={13} color={selected ? "#0A6BCF" : "#6B7280"} stroke={2.2} />
      )}
      <span style={{ flex: 1, fontSize: 12.5, color: "#0E2C56", fontWeight: selected || checked ? 700 : 500 }}>{label}</span>
      {selected && !checkbox && <Ic name="check" size={13} color="#0A6BCF" stroke={3} />}
    </div>
  );
}

function SelectDesktop() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={f.subLabel}>SINGLE · DROPDOWN</div>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <label style={f.fieldLabel}>Estado</label>
            <div style={f.selectTrigger}>
              <Ic name="map" size={13} color="#9CA3AF" />
              <span style={{ flex: 1, fontSize: 13, color: "#0E2C56", fontWeight: 500 }}>Jalisco</span>
              <Ic name="chevron-down" size={13} color="#9CA3AF" />
            </div>
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            <label style={f.fieldLabel}>Categoría</label>
            <div style={{ ...f.selectTrigger, borderColor: "#0A6BCF", boxShadow: "0 0 0 3px rgba(10,107,207,0.12)" }}>
              <Ic name="wrench" size={13} color="#0A6BCF" />
              <span style={{ flex: 1, fontSize: 13, color: "#0E2C56", fontWeight: 600 }}>Plomería</span>
              <Ic name="chevron-up" size={13} color="#0A6BCF" />
            </div>
            <div style={f.dropdownPop}>
              <div style={f.dropdownSearch}>
                <Ic name="search" size={11} color="#9CA3AF" />
                <span style={{ flex: 1, fontSize: 11.5, color: "#9CA3AF" }}>Buscar…</span>
              </div>
              <SheetOption icon="wrench"        label="Plomería" selected />
              <SheetOption icon="zap"           label="Electricidad" />
              <SheetOption icon="flame"         label="Gas" />
              <SheetOption icon="paint-roller"  label="Pintura" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div style={f.subLabel}>MULTI · CON GRUPOS</div>
        <div style={{ position: "relative", maxWidth: 320 }}>
          <label style={f.fieldLabel}>Servicios que ofreces</label>
          <div style={f.selectTrigger}>
            <Ic name="layers" size={13} color="#0A6BCF" />
            <span style={{ flex: 1, fontSize: 13, color: "#0E2C56", fontWeight: 600 }}>9 servicios seleccionados</span>
            <span style={f.multiChips}>+3</span>
            <Ic name="chevron-down" size={13} color="#9CA3AF" />
          </div>
          <div style={{ ...f.dropdownPop, padding: 0 }}>
            <div style={f.dropdownGroupLabel}>PLOMERÍA · 4 / 8</div>
            <SheetOption icon="droplet" label="Fugas" checkbox checked />
            <SheetOption icon="droplets" label="Calentadores" checkbox checked />
            <SheetOption icon="droplet" label="Drenaje" checkbox />
            <div style={f.dropdownGroupLabel}>ELECTRICIDAD · 2 / 6</div>
            <SheetOption icon="zap" label="Instalación lámparas" checkbox checked />
            <SheetOption icon="zap" label="Cortos circuito" checkbox checked />
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 4.2 DATE PICKER
// =====================================================================
function DatePickerMobile() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={f.subLabel}>TRIGGER</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={f.fieldLabel}>Fecha del servicio</label>
            <div style={f.selectTrigger}>
              <Ic name="calendar" size={13} color="#0A6BCF" />
              <span style={{ flex: 1, fontSize: 13, color: "#0E2C56", fontWeight: 600 }}>19 may 2026</span>
              <Ic name="chevron-down" size={13} color="#9CA3AF" />
            </div>
          </div>
          <div>
            <label style={f.fieldLabel}>Rango · periodo</label>
            <div style={f.selectTrigger}>
              <Ic name="calendar-range" size={13} color="#0A6BCF" />
              <span style={{ flex: 1, fontSize: 12, color: "#0E2C56", fontWeight: 600 }}>1 — 19 may</span>
              <Ic name="chevron-down" size={13} color="#9CA3AF" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div style={f.subLabel}>FULL-SCREEN MODAL · MES + DÍAS</div>
        <div style={f.dpModal}>
          <div style={f.dpHeader}>
            <button style={f.dpCloseBtn}><Ic name="x" size={14} color="#FFFFFF" /></button>
            <span style={f.dpHeaderTitle}>Selecciona fecha</span>
            <button style={f.dpResetBtn}>Limpiar</button>
          </div>
          <div style={f.dpSelectedBar}>
            <Ic name="calendar-check" size={13} color="#FFFFFF" />
            <span style={f.dpSelectedText}>Hoy · <b>19 mayo 2026</b></span>
            <span style={f.dpSelectedHint}>· en 4h 23m</span>
          </div>
          <Calendar selected={19} today={19} />
          <div style={f.dpFooter}>
            <button style={f.dpFooterApply}>Confirmar fecha</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Calendar({ selected, today, rangeStart, rangeEnd, compact }) {
  // May 2026 starts on Friday (col 5, 0-indexed)
  const startOffset = 5;
  const days = 31;
  const weeks = ["D", "L", "M", "M", "J", "V", "S"];
  return (
    <div style={{ padding: compact ? "10px 12px" : "14px 16px" }}>
      <div style={f.dpMonthNav}>
        <button style={f.dpMonthBtn}><Ic name="chevron-left" size={13} color="#0E2C56" /></button>
        <span style={f.dpMonthLabel}>MAYO <b>2026</b></span>
        <button style={f.dpMonthBtn}><Ic name="chevron-right" size={13} color="#0E2C56" /></button>
      </div>
      <div style={f.calWeekdays}>
        {weeks.map((w, i) => <div key={i} style={{ ...f.calWeekday, color: i === 0 || i === 6 ? "#DC2626" : "#9CA3AF" }}>{w}</div>)}
      </div>
      <div style={f.calGrid}>
        {Array.from({ length: startOffset }).map((_, i) => <div key={`p${i}`} />)}
        {Array.from({ length: days }).map((_, i) => {
          const d = i + 1;
          const isSel = d === selected;
          const isToday = d === today && !isSel;
          const isRangeStart = d === rangeStart;
          const isRangeEnd = d === rangeEnd;
          const inRange = rangeStart && rangeEnd && d > rangeStart && d < rangeEnd;
          return (
            <div key={d} style={{
              ...f.calDay,
              ...(isSel ? f.calDaySel : null),
              ...(isToday ? f.calDayToday : null),
              ...(inRange ? f.calDayRange : null),
              ...(isRangeStart ? f.calDayRangeStart : null),
              ...(isRangeEnd ? f.calDayRangeEnd : null),
            }}>{d}</div>
          );
        })}
      </div>
    </div>
  );
}

function DatePickerDesktop() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={f.subLabel}>POPOVER · SINGLE</div>
        <div style={{ position: "relative", maxWidth: 240 }}>
          <label style={f.fieldLabel}>Fecha</label>
          <div style={{ ...f.selectTrigger, borderColor: "#0A6BCF", boxShadow: "0 0 0 3px rgba(10,107,207,0.12)" }}>
            <Ic name="calendar" size={13} color="#0A6BCF" />
            <span style={{ flex: 1, fontSize: 13, color: "#0E2C56", fontWeight: 600 }}>19 may 2026</span>
            <Ic name="chevron-up" size={13} color="#0A6BCF" />
          </div>
          <div style={f.dpPopover}>
            <Calendar selected={19} today={19} compact />
          </div>
        </div>
      </div>

      <div>
        <div style={f.subLabel}>POPOVER · RANGE</div>
        <div style={{ position: "relative", maxWidth: 300 }}>
          <label style={f.fieldLabel}>Rango · cancelados</label>
          <div style={f.selectTrigger}>
            <Ic name="calendar-range" size={13} color="#0A6BCF" />
            <span style={{ flex: 1, fontSize: 12.5, color: "#0E2C56", fontWeight: 600 }}>1 may — 19 may</span>
            <Ic name="chevron-down" size={13} color="#9CA3AF" />
          </div>
          <div style={f.dpPopover}>
            <div style={{ padding: "10px 14px 0", display: "flex", gap: 6 }}>
              <span style={f.dpPresetChip}>Hoy</span>
              <span style={f.dpPresetChip}>7 días</span>
              <span style={{ ...f.dpPresetChip, ...f.dpPresetChipSel }}>30 días</span>
              <span style={f.dpPresetChip}>Trim.</span>
            </div>
            <Calendar rangeStart={1} rangeEnd={19} today={19} compact />
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 4.3 TIME PICKER
// =====================================================================
function TimePickerMobile() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={f.subLabel}>FRANJAS · GRID (recomendado)</div>
        <div style={f.tpFranjasCard}>
          <div style={f.tpFranjasLabel}>HORA PREFERIDA</div>
          <div style={f.tpFranjasGrid}>
            <FranjaCard icon="sunrise" label="Mañana" range="8 — 12 AM" />
            <FranjaCard icon="sun" label="Tarde" range="12 — 5 PM" selected />
            <FranjaCard icon="sunset" label="Noche" range="5 — 9 PM" />
          </div>
          <div style={f.tpSlotsLabel}>FRANJAS DISPONIBLES · TARDE</div>
          <div style={f.tpSlotsGrid}>
            {["12:00", "12:30", "1:00", "1:30", "2:00", "2:30", "3:00", "3:30"].map((t, idx) => (
              <div key={t} style={{ ...f.tpSlot, ...(t === "3:00" ? f.tpSlotSel : null), ...(t === "12:00" || t === "2:00" ? f.tpSlotDisabled : null) }}>
                {t}<span style={f.tpSlotMeridian}>PM</span>
                {t === "3:00" && <Ic name="check" size={10} color="#FFFFFF" stroke={3} style={{ marginLeft: 4 }} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div style={f.subLabel}>WHEEL PICKER · iOS-style</div>
        <div style={f.wheelCard}>
          <div style={f.wheelCols}>
            <WheelCol values={["08", "09", "10", "11", "12"]} selectedIdx={2} />
            <span style={f.wheelColon}>:</span>
            <WheelCol values={["00", "15", "30", "45"]} selectedIdx={1} />
            <WheelCol values={["AM", "PM"]} selectedIdx={1} />
          </div>
          <div style={f.wheelHighlight} />
        </div>
      </div>
    </div>
  );
}

function FranjaCard({ icon, label, range, selected }) {
  return (
    <div style={{ ...f.franjaCard, ...(selected ? f.franjaCardSel : null) }}>
      <div style={{ ...f.franjaIcon, background: selected ? "rgba(255,255,255,0.18)" : "rgba(245,158,11,0.14)" }}>
        <Ic name={icon} size={14} color={selected ? "#FFFFFF" : "#B45309"} />
      </div>
      <div style={{ ...f.franjaLabel, color: selected ? "#FFFFFF" : "#0E2C56" }}>{label}</div>
      <div style={{ ...f.franjaRange, color: selected ? "rgba(255,255,255,0.85)" : "#6B7280" }}>{range}</div>
    </div>
  );
}

function WheelCol({ values, selectedIdx }) {
  return (
    <div style={f.wheelCol}>
      {values.map((v, idx) => {
        const offset = idx - selectedIdx;
        return (
          <div key={idx} style={{
            ...f.wheelItem,
            opacity: Math.abs(offset) > 2 ? 0.25 : 1 - Math.abs(offset) * 0.30,
            fontSize: offset === 0 ? 24 : 18,
            fontWeight: offset === 0 ? 800 : 600,
            color: offset === 0 ? "#0E2C56" : "#9CA3AF",
          }}>{v}</div>
        );
      })}
    </div>
  );
}

function TimePickerDesktop() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={f.subLabel}>FRANJAS HORARIAS (admin tables / filtros)</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { label: "8 AM", sel: false }, { label: "10 AM", sel: false }, { label: "12 PM", sel: true },
            { label: "2 PM", sel: false }, { label: "4 PM", sel: false }, { label: "6 PM", sel: true },
            { label: "8 PM", sel: false },
          ].map(s => <span key={s.label} style={{ ...f.tpSlot, ...(s.sel ? f.tpSlotSel : null), padding: "6px 12px", fontSize: 12 }}>{s.label}</span>)}
        </div>
      </div>
      <div>
        <div style={f.subLabel}>INPUT NATIVO · POPOVER + CLOCK</div>
        <div style={{ position: "relative", maxWidth: 220 }}>
          <label style={f.fieldLabel}>Hora</label>
          <div style={f.selectTrigger}>
            <Ic name="clock" size={13} color="#0A6BCF" />
            <span style={{ flex: 1, fontSize: 13, color: "#0E2C56", fontWeight: 600 }}>3:30 PM</span>
            <Ic name="chevron-down" size={13} color="#9CA3AF" />
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 4.4 TOGGLE / SWITCH
// =====================================================================
function Toggle({ on, size = "md", tone = "blue", disabled }) {
  const sizes = { sm: { w: 28, h: 16, k: 12 }, md: { w: 38, h: 22, k: 18 } };
  const s = sizes[size];
  const onColor = tone === "green" ? "#18A66A" : "#0A6BCF";
  return (
    <div style={{
      width: s.w, height: s.h, borderRadius: 999,
      background: disabled ? "#EEF3F8" : on ? onColor : "#E1E8F0",
      position: "relative", flexShrink: 0,
      opacity: disabled ? 0.5 : 1,
      transition: "background 0.15s",
    }}>
      <div style={{
        position: "absolute", top: 2, left: on ? s.w - s.k - 2 : 2,
        width: s.k, height: s.k, borderRadius: "50%",
        background: "#FFFFFF", boxShadow: "0 1px 3px rgba(14,44,86,0.20)",
        transition: "left 0.15s",
      }} />
    </div>
  );
}

function ToggleGrid() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={f.subLabel}>SIZES · TONES · STATES</div>
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr 1fr 1fr 1fr", gap: 10, alignItems: "center" }}>
          <span />
          <span style={f.headerCell}>OFF</span>
          <span style={f.headerCell}>ON · blue</span>
          <span style={f.headerCell}>ON · green</span>
          <span style={f.headerCell}>DISABLED</span>
          <span style={f.headerCell}>DISABLED ON</span>

          <span style={f.tinyLabel}>sm</span>
          <Toggle size="sm" /><Toggle size="sm" on /><Toggle size="sm" on tone="green" />
          <Toggle size="sm" disabled /><Toggle size="sm" on disabled />

          <span style={f.tinyLabel}>md</span>
          <Toggle /><Toggle on /><Toggle on tone="green" />
          <Toggle disabled /><Toggle on disabled />
        </div>
      </div>

      <div>
        <div style={f.subLabel}>CON LABEL · CON DESCRIPCIÓN</div>
        <div style={f.toggleListGroup}>
          <ToggleRow icon="bell" title="Notificaciones push" sub="Te avisamos cuando llega un servicio" on />
          <ToggleRow icon="message-square" title="WhatsApp" sub="Mensajes operativos por WhatsApp" />
          <ToggleRow icon="hard-hat" title="Modo trabajo activo" sub="Disponible para recibir solicitudes" on tone="green" />
          <ToggleRow icon="lock" title="2FA · autenticación 2 pasos" sub="Te enviamos SMS al iniciar sesión" on disabled hint="Permanente" />
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ icon, title, sub, on, tone, disabled, hint }) {
  return (
    <div style={f.toggleRow}>
      <div style={f.toggleRowIcon}><Ic name={icon} size={13} color="#0A6BCF" /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={f.toggleRowTitle}>{title}</div>
        <div style={f.toggleRowSub}>{sub}</div>
      </div>
      {hint && <span style={f.toggleHint}>{hint}</span>}
      <Toggle on={on} tone={tone} disabled={disabled} />
    </div>
  );
}

// =====================================================================
// 4.5 CHECKBOX / RADIO
// =====================================================================
function CheckRadioGrid() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={f.subLabel}>CHECKBOX · STATES</div>
        <div style={{ display: "flex", gap: 22, alignItems: "center" }}>
          <CheckLabel label="Unchecked" />
          <CheckLabel checked label="Checked" />
          <CheckLabel indeterminate label="Indeterminate" />
          <CheckLabel disabled label="Disabled" />
          <CheckLabel checked disabled label="Disabled on" />
        </div>
      </div>

      <div>
        <div style={f.subLabel}>RADIO · STATES</div>
        <div style={{ display: "flex", gap: 22, alignItems: "center" }}>
          <RadioLabel label="Off" />
          <RadioLabel checked label="On" />
          <RadioLabel disabled label="Disabled" />
          <RadioLabel checked disabled label="Disabled on" />
        </div>
      </div>

      <div>
        <div style={f.subLabel}>CON LABEL + DESCRIPCIÓN</div>
        <div style={f.optionList}>
          <OptionRow
            type="radio" checked
            title="Tarjeta guardada"
            sub="Visa •••• 1234 · vence 08/27"
            trailing={<span style={f.optionTrailing}>$850</span>}
          />
          <OptionRow
            type="radio"
            title="OXXO Pay"
            sub="Recibe referencia · válida 48h"
            trailing={<span style={f.optionBadge}>HOLD</span>}
          />
          <OptionRow
            type="checkbox" checked
            title="Recordar este dispositivo"
            sub="No solicitamos MFA en este equipo por 30 días"
          />
          <OptionRow
            type="checkbox" disabled
            title="Emitir factura electrónica"
            sub="Próximamente · solo MX-fiscal"
          />
        </div>
      </div>
    </div>
  );
}

function CheckLabel({ checked, indeterminate, disabled, label }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 7, opacity: disabled ? 0.5 : 1 }}>
      <div style={{ ...f.cb, ...(checked || indeterminate ? f.cbOn : null), ...(disabled ? f.cbDisabled : null) }}>
        {checked && <Ic name="check" size={9} color="#FFFFFF" stroke={3.5} />}
        {indeterminate && <div style={f.cbIndeterminate} />}
      </div>
      <span style={{ fontSize: 12, color: "#0E2C56" }}>{label}</span>
    </div>
  );
}

function RadioLabel({ checked, disabled, label }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 7, opacity: disabled ? 0.5 : 1 }}>
      <div style={{ ...f.radio, ...(checked ? f.radioOn : null), ...(disabled ? f.radioDisabled : null) }}>
        {checked && <div style={f.radioDot} />}
      </div>
      <span style={{ fontSize: 12, color: "#0E2C56" }}>{label}</span>
    </div>
  );
}

function OptionRow({ type, checked, disabled, title, sub, trailing }) {
  return (
    <div style={{ ...f.optionRow, ...(checked ? f.optionRowSel : null), ...(disabled ? { opacity: 0.55, cursor: "not-allowed" } : null) }}>
      {type === "radio" ? (
        <div style={{ ...f.radio, ...(checked ? f.radioOn : null), marginTop: 2 }}>
          {checked && <div style={f.radioDot} />}
        </div>
      ) : (
        <div style={{ ...f.cb, ...(checked ? f.cbOn : null), marginTop: 2 }}>
          {checked && <Ic name="check" size={9} color="#FFFFFF" stroke={3.5} />}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={f.optionTitle}>{title}</div>
        {sub && <div style={f.optionSub}>{sub}</div>}
      </div>
      {trailing}
    </div>
  );
}

// =====================================================================
// 4.6 PHOTO UPLOAD
// =====================================================================
function PhotoUploadGrid() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={f.subLabel}>SINGLE CIRCULAR · AVATAR DE PERFIL</div>
        <div style={{ display: "flex", gap: 22, alignItems: "flex-end" }}>
          <AvatarUpload state="empty" />
          <AvatarUpload state="uploading" />
          <AvatarUpload state="uploaded" />
          <AvatarUpload state="error" />
        </div>
      </div>

      <div>
        <div style={f.subLabel}>GRID 3×3 · GALERÍA DE TRABAJOS</div>
        <div style={f.photoGrid}>
          <PhotoSlot state="add" badge="0/9" />
          <PhotoSlot state="uploaded" tone="linear-gradient(135deg,#0A6BCF,#0894EA)" label="Antes" />
          <PhotoSlot state="uploaded" tone="linear-gradient(135deg,#18A66A,#4ED896)" label="Después" />
          <PhotoSlot state="uploaded" tone="linear-gradient(135deg,#B45309,#F59E0B)" label="Llave" />
          <PhotoSlot state="uploading" progress={62} />
          <PhotoSlot state="error" />
          <PhotoSlot state="empty" />
          <PhotoSlot state="empty" />
          <PhotoSlot state="empty" />
        </div>
        <div style={f.photoFooter}>
          <span><b style={{ color: "#0E2C56", fontWeight: 700 }}>4/9</b> subidas</span>
          <span style={f.bullet} />
          <span>Las fotos antes/después dan más confianza al cliente.</span>
        </div>
      </div>

      <div>
        <div style={f.subLabel}>DOCUMENT SLOT · KYC</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <DocSlot label="INE · Frente" state="uploaded" />
          <DocSlot label="INE · Reverso" state="capture" />
        </div>
      </div>
    </div>
  );
}

function AvatarUpload({ state }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ position: "relative", width: 84, height: 84 }}>
        {state === "empty" && (
          <div style={{ ...f.avUpload, border: "2px dashed #C8D4E0" }}>
            <Ic name="camera" size={18} color="#9CA3AF" />
            <span style={f.avUploadText}>Subir</span>
          </div>
        )}
        {state === "uploading" && (
          <div style={{ ...f.avUpload, background: "linear-gradient(135deg,#0A6BCF,#0894EA)" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.30)", borderTopColor: "#FFFFFF", animation: "ui-spin 0.9s linear infinite" }} />
            <span style={{ ...f.avUploadText, color: "#FFFFFF" }}>62%</span>
          </div>
        )}
        {state === "uploaded" && (
          <>
            <div style={{ ...f.avUpload, background: "linear-gradient(135deg,#F59E0B,#FBBF24)", border: "none" }}>
              <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 28, color: "#FFFFFF" }}>RH</span>
            </div>
            <div style={f.avEditDot}><Ic name="pencil" size={11} color="#FFFFFF" /></div>
          </>
        )}
        {state === "error" && (
          <>
            <div style={{ ...f.avUpload, background: "rgba(220,38,38,0.08)", border: "2px solid #DC2626" }}>
              <Ic name="alert-circle" size={20} color="#DC2626" />
            </div>
          </>
        )}
      </div>
      <span style={{ fontSize: 9.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{state}</span>
    </div>
  );
}

function PhotoSlot({ state, tone, label, progress, badge }) {
  return (
    <div style={f.photoSlot}>
      {state === "add" && (
        <div style={{ ...f.photoSlotInner, ...f.photoSlotAdd }}>
          <Ic name="plus" size={20} color="#0A6BCF" stroke={2.4} />
          <span style={f.photoAddText}>Agregar</span>
          {badge && <span style={f.photoBadgeMini}>{badge}</span>}
        </div>
      )}
      {state === "uploaded" && (
        <div style={{ ...f.photoSlotInner, background: tone }}>
          <Ic name="image" size={16} color="rgba(255,255,255,0.85)" />
          {label && <span style={f.photoTagMini}>{label}</span>}
          <button style={f.photoRemoveBtn}><Ic name="x" size={9} color="#FFFFFF" stroke={3} /></button>
        </div>
      )}
      {state === "uploading" && (
        <div style={{ ...f.photoSlotInner, background: "linear-gradient(135deg,#0E2C56,#0894EA)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.30)", borderTopColor: "#FFFFFF", animation: "ui-spin 0.9s linear infinite", marginBottom: 4 }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#FFFFFF", fontWeight: 700 }}>{progress}%</span>
          <div style={{ position: "absolute", left: 6, right: 6, bottom: 6, height: 3, background: "rgba(255,255,255,0.25)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "#FFFFFF", borderRadius: 999 }} />
          </div>
        </div>
      )}
      {state === "error" && (
        <div style={{ ...f.photoSlotInner, background: "rgba(220,38,38,0.08)", border: "1.5px solid #DC2626", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <Ic name="alert-circle" size={16} color="#DC2626" />
          <span style={{ fontSize: 9, color: "#DC2626", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>ERROR</span>
          <button style={{ ...f.photoRemoveBtn, background: "#DC2626" }}><Ic name="rotate-cw" size={9} color="#FFFFFF" /></button>
        </div>
      )}
      {state === "empty" && <div style={{ ...f.photoSlotInner, background: "#F4F7FB", border: "1px dashed #E1E8F0" }} />}
    </div>
  );
}

function DocSlot({ label, state }) {
  return (
    <div>
      <div style={f.docSlotLabel}>{label}</div>
      <div style={{ ...f.docSlot, ...(state === "uploaded" ? { border: "1.5px solid #18A66A", padding: 0 } : null) }}>
        {state === "capture" && (
          <>
            <div style={{ ...f.docCorner, top: 8, left: 8 }} />
            <div style={{ ...f.docCorner, top: 8, right: 8, transform: "scaleX(-1)" }} />
            <div style={{ ...f.docCorner, bottom: 8, left: 8, transform: "scaleY(-1)" }} />
            <div style={{ ...f.docCorner, bottom: 8, right: 8, transform: "scale(-1,-1)" }} />
            <div style={f.docCaptureInner}>
              <div style={f.docCaptureIcon}><Ic name="camera" size={20} color="#0A6BCF" /></div>
              <span style={f.docCaptureTitle}>Captura el reverso</span>
              <span style={f.docCaptureSub}>Coloca dentro del marco · buena luz</span>
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <span style={f.docCaptureChip}><Ic name="camera" size={10} color="#0A6BCF" /> Cámara</span>
                <span style={f.docCaptureChip}><Ic name="image" size={10} color="#0A6BCF" /> Galería</span>
              </div>
            </div>
          </>
        )}
        {state === "uploaded" && (
          <div style={{ position: "relative", height: 120, borderRadius: 12, overflow: "hidden", background: "linear-gradient(135deg,#F4E4BC,#E5D2A0)" }}>
            <svg viewBox="0 0 320 160" style={{ width: "100%", height: "100%" }}>
              <rect width="320" height="20" fill="#15803D" />
              <text x="14" y="14" fontFamily="Inter" fontWeight="700" fontSize="9" fill="#FFFFFF">IDENTIFICACIÓN OFICIAL</text>
              <rect x="14" y="32" width="60" height="80" rx="3" fill="#E5D2A0" stroke="#94A3B8" strokeWidth="0.5" />
              <circle cx="44" cy="60" r="12" fill="#C8A874" />
              <text x="86" y="44" fontFamily="Inter" fontWeight="600" fontSize="6" fill="#6B7280">NOMBRE</text>
              <text x="86" y="56" fontFamily="Inter" fontWeight="700" fontSize="8" fill="#0E2C56">RAMÓN HERNÁNDEZ</text>
              <rect x="0" y="138" width="320" height="22" fill="#0F2A56" />
              <text x="14" y="153" fontFamily="'JetBrains Mono'" fontWeight="700" fontSize="7" fill="#FFFFFF">HEGR810521HJCRNM05</text>
            </svg>
            <div style={f.docOverlayBadge}>
              <Ic name="check" size={9} color="#FFFFFF" stroke={3} /> Subido
            </div>
            <button style={f.docOverlayBtn}>Reemplazar</button>
          </div>
        )}
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
          <div style={l.handoffTitle}>Handoff · Sección 4 lista</div>
          <div style={l.handoffSub}>6 componentes de formulario · cubre captura cliente, técnico, admin</div>
        </div>
        <span style={l.handoffChip}>SECCIÓN 4 / 6</span>
      </div>

      <div style={l.handoffGrid}>
        <div style={l.handoffCard}>
          <div style={l.handoffCardLabel}>COMPONENTES</div>
          <ul style={l.handoffList}>
            <li><b>Select</b> · single / multi / con grupos · mobile sheet + desktop popover</li>
            <li><b>DatePicker</b> · single + range · presets ('Hoy', '7 días', '30 días')</li>
            <li><b>TimePicker</b> · franjas (Mañana/Tarde/Noche) + slots + wheel iOS</li>
            <li><b>Toggle</b> · sm/md × blue/green × on/off/disabled · con label + descripción</li>
            <li><b>Checkbox / Radio</b> · 4 states + OptionRow rich</li>
            <li><b>PhotoUpload</b> · avatar / grid 3×3 / document KYC con captura</li>
          </ul>
        </div>

        <div style={l.handoffCard}>
          <div style={l.handoffCardLabel}>CARPETAS</div>
          <div style={l.handoffCode}>
            <div><b>/components/ui/</b></div>
            <div>{"  select.tsx"}</div>
            <div>{"  date-picker.tsx"}</div>
            <div>{"  time-picker.tsx"}</div>
            <div>{"  toggle.tsx · checkbox.tsx · radio.tsx"}</div>
            <div>{"  photo-upload.tsx"}</div>
            <div style={{ marginTop: 8 }}><b>/components/forms/</b></div>
            <div>{"  field.tsx · field-label.tsx"}</div>
            <div>{"  form-section.tsx"}</div>
          </div>
        </div>

        <div style={l.handoffCard}>
          <div style={l.handoffCardLabel}>DEPENDENCIAS</div>
          <ul style={l.handoffList}>
            <li><code>react-hook-form</code> + <code>zod</code> para forms tipadas</li>
            <li><code>shadcn/ui</code> Select, Calendar, Popover, Checkbox</li>
            <li><code>@react-native-community/datetimepicker</code> mobile</li>
            <li><code>react-native-bottom-sheet</code> sheets mobile</li>
            <li><code>expo-image-picker</code> + <code>expo-camera</code> uploads</li>
            <li><code>date-fns</code> formato de fechas en español</li>
          </ul>
        </div>

        <div style={l.handoffCard}>
          <div style={l.handoffCardLabel}>SIGUIENTES SECCIONES</div>
          <ol style={l.handoffOl}>
            <li>✓ Primitives · Containers · Navigation · Forms (esta)</li>
            <li style={{ color: "#0A6BCF", fontWeight: 700 }}>→ Data Display (próxima) — Table · KPICard · Timeline · StatsRow</li>
            <li>Domain-specific — TechnicianCard · ServiceStatusCard · PriceBreakdown · ChatMessageBubble · CategoryIcon · MapCard · KycDocumentCard</li>
          </ol>
        </div>
      </div>

      <div style={l.handoffNextStep}>
        <Ic name="hand" size={13} color="#0A6BCF" />
        <span>Avísame y avanzamos con <b style={{ color: "#0E2C56", fontWeight: 800 }}>Sección 5 · Data Display</b> (Table, KPICard, Timeline, StatsRow).</span>
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
      <SectionHeader num="04" title="Forms" sub="Controles de entrada · mobile (bottom sheet) y desktop (popover) cuando aplica." />

      <ComponentBlock
        id="select"
        name="Select"
        codeName="<Select />"
        desc="Selección de una o varias opciones. Mobile abre bottom sheet, desktop abre popover. Soporta búsqueda y grupos."
        mobileGrid={<SelectMobile />}
        desktopGrid={<SelectDesktop />}
        props={[
          { name: "value",     type: "string | string[]",          default: "—", required: true },
          { name: "options",   type: "Array<{ value, label, icon, group? }>", default: "—", required: true },
          { name: "multi",     type: "boolean",                    default: "false" },
          { name: "searchable",type: "boolean",                    default: "auto si > 5 opciones" },
          { name: "placeholder",type: "string",                    default: "Selecciona…" },
          { name: "leftIcon",  type: "LucideIcon",                 default: "—" },
          { name: "disabled",  type: "boolean",                    default: "false" },
          { name: "onChange",  type: "(v) => void",                default: "—", required: true },
        ]}
        tokens={[
          { cat: "trigger",  val: "input style · radius 10 · padding 11/12" },
          { cat: "sheet",    val: "radius 20/20/0/0 · maxH 85% · backdrop rgba(14,44,86,.55)" },
          { cat: "popover",  val: "shadow 0 14px 32px rgba(14,44,86,.18) · radius 12" },
          { cat: "option",   val: "padding 10/12 · sel bg rgba(10,107,207,.06)" },
        ]}
        notes={[
          "Mobile: react-native-bottom-sheet con snapPoints ['50%', '85%']. Backdrop tappable cierra.",
          "Multi-select: aplica/cancela explícito en footer; cambios no se commit hasta apply.",
          "Búsqueda automática si > 5 opciones. Filtra por label o tags.",
          "Grupos colapsables (no expandidos por default si > 15 opciones totales).",
          "Web: shadcn Select + Command (cmdk) como base.",
        ]}
        useCases={[
          "Categoría de servicio · onboarding técnico",
          "Estado · Filtros admin tabla",
          "Colonias de cobertura (multi · con search)",
          "Servicios que ofreces (multi · grupos por categoría)",
        ]}
      />

      <ComponentBlock
        id="date-picker"
        name="DatePicker"
        codeName="<DatePicker />"
        desc="Selección de fecha o rango. Mobile abre full-screen modal con calendar grande, desktop abre popover."
        mobileGrid={<DatePickerMobile />}
        desktopGrid={<DatePickerDesktop />}
        props={[
          { name: "value",      type: "Date | { from, to }",        default: "—", required: true },
          { name: "mode",       type: "single | range",             default: "single" },
          { name: "minDate",    type: "Date",                       default: "today" },
          { name: "maxDate",    type: "Date",                       default: "—" },
          { name: "presets",    type: "Preset[] (only range)",      default: "Hoy / 7d / 30d / Trim" },
          { name: "disabledDates", type: "Date[]",                  default: "[]" },
          { name: "onChange",   type: "(v) => void",                default: "—", required: true },
        ]}
        tokens={[
          { cat: "day",       val: "aspect-ratio 1 · radius 8 · padding 6" },
          { cat: "sel",       val: "bg gradient blue · color white · shadow 0 4px 10px rgba(blue,.30)" },
          { cat: "today",     val: "bg rgba(10,107,207,.08) + border dashed" },
          { cat: "range",     val: "extremos rounded · middle bg rgba(10,107,207,.10)" },
          { cat: "weekend",   val: "header dom/sab #DC2626" },
        ]}
        notes={[
          "Locale es-MX siempre. Semanas empiezan en domingo (México).",
          "Fechas bloqueadas (bloqueos del técnico) muestran pattern striped.",
          "Range: tap inicio + tap fin; auto-swap si se invierte.",
          "Presets como chips arriba del calendario en desktop popover.",
          "Mobile reset/confirm en footer fijo del modal.",
        ]}
        useCases={[
          "Solicitar servicio cliente · cuándo lo quieres",
          "Bloquear día técnico · disponibilidad",
          "Filtros admin tabla · rango de fechas",
          "Reportes financieros · rango",
        ]}
      />

      <ComponentBlock
        id="time-picker"
        name="TimePicker"
        codeName="<TimePicker />"
        desc="Selección de hora. Recomendado: franjas (Mañana/Tarde/Noche) + slots. Wheel disponible para selección exacta."
        mobileGrid={<TimePickerMobile />}
        desktopGrid={<TimePickerDesktop />}
        props={[
          { name: "value",       type: "string (HH:MM AM|PM)",       default: "—", required: true },
          { name: "mode",        type: "franjas | slots | wheel",    default: "franjas" },
          { name: "slotDuration",type: "30 | 60 (minutes)",          default: "30" },
          { name: "available",   type: "string[] · slots disponibles",default: "all" },
          { name: "onChange",    type: "(v) => void",                default: "—", required: true },
        ]}
        tokens={[
          { cat: "franja",   val: "card 1/3 width · sel gradient amber" },
          { cat: "slot",     val: "pill 7/12 padding · radius 999" },
          { cat: "sel slot", val: "bg primary blue · color white" },
          { cat: "wheel",    val: "altura 156 · center highlight bg rgba(blue,.10)" },
        ]}
        notes={[
          "Default = franjas (más usable en mobile que wheel).",
          "Slots: muestra solo los disponibles para el técnico ese día.",
          "Slots disabled (técnico ya tiene servicio): bg gris + tachado opcional.",
          "Wheel: respeta inercial scroll (Reanimated en mobile).",
          "Desktop: usa franjas en filtros, input nativo + popover para selección precisa.",
        ]}
        useCases={[
          "Solicitar servicio · franja preferida",
          "Onboarding técnico · horario de atención",
          "Filtro admin · rango horario",
        ]}
      />

      <ComponentBlock
        id="toggle"
        name="Toggle / Switch"
        codeName="<Toggle />"
        desc="Switch binario on/off. Dos tamaños, dos tonos según contexto (blue settings, green disponibilidad)."
        mobileGrid={<ToggleGrid />}
        desktopGrid={<ToggleGrid />}
        props={[
          { name: "on",       type: "boolean",                default: "false", required: true },
          { name: "size",     type: "sm | md",                default: "md" },
          { name: "tone",     type: "blue | green",           default: "blue" },
          { name: "disabled", type: "boolean",                default: "false" },
          { name: "label",    type: "string",                 default: "—" },
          { name: "description", type: "string",              default: "—" },
          { name: "onChange", type: "(on: boolean) => void",  default: "—", required: true },
        ]}
        tokens={[
          { cat: "size sm",  val: "w 28 / h 16 / knob 12" },
          { cat: "size md",  val: "w 38 / h 22 / knob 18" },
          { cat: "on blue",  val: "Primary Blue #0A6BCF" },
          { cat: "on green", val: "Success Green #18A66A (disponibilidad técnico)" },
          { cat: "knob",     val: "white · shadow 0 1px 3px rgba(navy,.20)" },
        ]}
        notes={[
          "tone='green' SOLO para el toggle de disponibilidad del técnico (semántico).",
          "Resto de settings usan tone='blue'.",
          "Disabled: opacity 0.5 + cursor not-allowed (web) / no haptic (mobile).",
          "Mobile: haptic feedback light al cambiar.",
        ]}
        useCases={[
          "Settings cliente · notificaciones · WhatsApp",
          "Disponibilidad del técnico (tone green prominente en home)",
          "Privacidad · 2FA",
          "Pausa automática · clima extremo (en agenda técnico)",
        ]}
      />

      <ComponentBlock
        id="checkbox-radio"
        name="Checkbox / Radio"
        codeName="<Checkbox /> <Radio />"
        desc="Selección discreta. Checkbox para múltiple, Radio para única. OptionRow combina ambos en filas ricas."
        mobileGrid={<CheckRadioGrid />}
        desktopGrid={<CheckRadioGrid />}
        props={[
          { name: "checked",       type: "boolean",                default: "false" },
          { name: "indeterminate", type: "boolean · checkbox only", default: "false" },
          { name: "disabled",      type: "boolean",                default: "false" },
          { name: "label",         type: "string",                 default: "—" },
          { name: "description",   type: "string",                 default: "—" },
          { name: "onChange",      type: "(v: boolean) => void",   default: "—", required: true },
        ]}
        tokens={[
          { cat: "checkbox",  val: "20×20 · radius 6 · border 1.5px gray" },
          { cat: "cb checked",val: "bg + border Primary Blue · check icon white stroke 3.5" },
          { cat: "cb indet",  val: "bg primary · dash 10px blanco horizontal" },
          { cat: "radio",     val: "20×20 · radius full · border 2px gray" },
          { cat: "ra checked",val: "border primary · dot 9×9 primary" },
        ]}
        notes={[
          "Indeterminate: solo en checkbox (ej. seleccionar todos en tabla admin).",
          "OptionRow: bg sel rgba(10,107,207,0.04) + border colorPrimary 1.5px.",
          "Mobile: touch target mínimo 24×24 pero hit-slop 8 para 40px efectivos.",
          "Radio group siempre con label section arriba (no usar radios sueltos).",
        ]}
        useCases={[
          "Método de pago (radio: tarjeta / OXXO / efectivo)",
          "Etiquetas post-servicio (checkbox: puntual / limpio / conocedor)",
          "Selección bulk en tabla admin (checkbox + indeterminate header)",
          "Categorías que ofreces (checkbox group)",
        ]}
      />

      <ComponentBlock
        id="photo-upload"
        name="PhotoUpload"
        codeName="<PhotoUpload />"
        desc="Tres variants: avatar circular, grid 3×3 de galería, document slot con marco de captura para KYC."
        mobileGrid={<PhotoUploadGrid />}
        desktopGrid={<PhotoUploadGrid />}
        props={[
          { name: "variant",    type: "avatar | grid | document",         default: "grid" },
          { name: "value",      type: "File | File[]",                     default: "—" },
          { name: "max",        type: "number · solo grid",                default: "9" },
          { name: "shape",      type: "circle | rect · solo avatar/doc",   default: "—" },
          { name: "aspectRatio",type: "1 | 1.586 · solo document",          default: "1.586" },
          { name: "onUpload",   type: "(f: File) => Promise<URL>",         default: "—", required: true },
          { name: "onRemove",   type: "(idx: number) => void",             default: "—" },
        ]}
        tokens={[
          { cat: "slot",       val: "aspect 1 · radius 10 · dashed border #E1E8F0" },
          { cat: "add slot",   val: "bg rgba(10,107,207,.06) · dashed Primary 1.5px" },
          { cat: "uploading",  val: "spinner 30 + progress 3px bottom" },
          { cat: "uploaded",   val: "preview · X corner 18×18 dark · tag corner" },
          { cat: "doc marker", val: "esquinas corchete 16×16 stroke 2.5 Primary" },
          { cat: "error",      val: "bg rgba(red,.08) · border 1.5 red · icon alert" },
        ]}
        notes={[
          "Avatar: tap abre cámara/galería sheet en mobile.",
          "Grid: drag-and-drop en web; reorderable mantiene state.",
          "Document: aspect 1.586 (proporción tarjeta) + brackets en esquinas.",
          "Compresión client-side a max 2MB antes de subir.",
          "Validación: solo image/* · max 10MB · min 480px de lado.",
          "Estados: empty / uploading (con %) / uploaded (preview) / error (retry).",
        ]}
        useCases={[
          "Avatar de perfil cliente / técnico",
          "Galería de trabajos previos (técnico)",
          "Evidencia inicial / final de servicio (técnico)",
          "Documentos KYC: INE frente · reverso · selfie · comprobante",
          "Fotos justificativas de extras",
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

const f = {
  subLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#0A6BCF", letterSpacing: ".12em", fontWeight: 700, marginBottom: 8 },
  fieldLabel: { fontSize: 11.5, color: "#0E2C56", fontWeight: 700, marginBottom: 6, display: "block" },
  bullet: { width: 2, height: 2, borderRadius: "50%", background: "#9CA3AF", margin: "0 6px", display: "inline-block" },
  tinyLabel: { fontSize: 10, color: "#6B7280", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
  headerCell: { fontSize: 9.5, color: "#9CA3AF", textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, letterSpacing: ".04em" },

  // Select
  selectTrigger: { display: "flex", alignItems: "center", gap: 8, padding: "11px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10, cursor: "pointer" },
  multiChips: { padding: "1px 7px", background: "rgba(10,107,207,0.10)", color: "#0A6BCF", borderRadius: 999, fontSize: 10, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" },

  // Sheet
  sheet: { padding: "10px 14px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: "16px 16px 8px 8px", boxShadow: "0 -8px 20px rgba(14,44,86,0.10)" },
  sheetHandle: { width: 40, height: 4, background: "#E1E8F0", borderRadius: 999, margin: "0 auto 10px" },
  sheetHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  sheetTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 14, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.01em" },
  sheetBadge: { padding: "2px 8px", background: "rgba(10,107,207,0.10)", color: "#0A6BCF", borderRadius: 999, fontSize: 10, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" },
  sheetSearch: { display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 8, marginBottom: 8 },
  sheetRow: { display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, cursor: "pointer", borderBottom: "1px solid transparent" },
  sheetRowSel: { background: "rgba(10,107,207,0.06)" },
  sheetFooter: { display: "flex", gap: 8, marginTop: 10, paddingTop: 10, borderTop: "1px solid #F0F4F9" },
  sheetCancel: { flex: 1, padding: "10px", background: "transparent", color: "#6B7280", border: "1px solid #E1E8F0", borderRadius: 10, fontWeight: 700, fontSize: 12.5, cursor: "pointer" },
  sheetApply: { flex: 2, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px", background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 10px rgba(10,107,207,0.25)" },
  applyCount: { padding: "1px 7px", background: "rgba(255,255,255,0.22)", borderRadius: 999, fontSize: 10.5, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" },

  cb: { width: 18, height: 18, borderRadius: 5, border: "1.5px solid #C8D4E0", background: "#FFFFFF", display: "grid", placeItems: "center", flexShrink: 0 },
  cbOn: { background: "#0A6BCF", borderColor: "#0A6BCF" },
  cbDisabled: { background: "#F4F7FB", borderColor: "#E1E8F0" },
  cbIndeterminate: { width: 10, height: 2, background: "#FFFFFF", borderRadius: 1 },

  radio: { width: 18, height: 18, borderRadius: "50%", border: "2px solid #C8D4E0", background: "#FFFFFF", display: "grid", placeItems: "center", flexShrink: 0 },
  radioOn: { borderColor: "#0A6BCF" },
  radioDot: { width: 9, height: 9, borderRadius: "50%", background: "#0A6BCF" },
  radioDisabled: { borderColor: "#E1E8F0" },

  // Dropdown
  dropdownPop: { position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, padding: 6, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12, boxShadow: "0 14px 32px rgba(14,44,86,0.18)", zIndex: 5 },
  dropdownSearch: { display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 8, marginBottom: 4 },
  dropdownGroupLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#9CA3AF", letterSpacing: ".1em", fontWeight: 700, padding: "8px 10px 4px" },

  // DatePicker mobile modal
  dpModal: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, overflow: "hidden" },
  dpHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "linear-gradient(135deg,#0A6BCF,#0894EA)", color: "#FFFFFF" },
  dpHeaderTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 14, fontWeight: 800 },
  dpCloseBtn: { width: 28, height: 28, borderRadius: 9, background: "rgba(255,255,255,0.18)", border: "none", display: "grid", placeItems: "center", cursor: "pointer" },
  dpResetBtn: { padding: "4px 10px", background: "rgba(255,255,255,0.14)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.20)", borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: "pointer" },
  dpSelectedBar: { display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#0E2C56", color: "#FFFFFF", fontSize: 12 },
  dpSelectedText: { fontWeight: 500 },
  dpSelectedHint: { color: "rgba(255,255,255,0.65)", marginLeft: 4 },

  dpMonthNav: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  dpMonthBtn: { width: 28, height: 28, borderRadius: 8, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer" },
  dpMonthLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#0E2C56", letterSpacing: ".06em", fontWeight: 700 },

  calWeekdays: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 },
  calWeekday: { textAlign: "center", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: ".04em" },
  calGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 },
  calDay: { aspectRatio: "1", display: "grid", placeItems: "center", borderRadius: 8, fontFamily: "'Manrope', sans-serif", fontSize: 12, fontWeight: 600, color: "#0E2C56", cursor: "pointer" },
  calDaySel: { background: "linear-gradient(135deg,#0A6BCF,#0894EA)", color: "#FFFFFF", boxShadow: "0 4px 10px rgba(10,107,207,0.30)", fontWeight: 800 },
  calDayToday: { background: "rgba(10,107,207,0.08)", border: "1px dashed rgba(10,107,207,0.40)" },
  calDayRange: { background: "rgba(10,107,207,0.10)", borderRadius: 0 },
  calDayRangeStart: { background: "linear-gradient(135deg,#0A6BCF,#0894EA)", color: "#FFFFFF", borderRadius: "8px 0 0 8px" },
  calDayRangeEnd: { background: "linear-gradient(135deg,#0A6BCF,#0894EA)", color: "#FFFFFF", borderRadius: "0 8px 8px 0" },

  dpFooter: { display: "flex", padding: "12px 14px", background: "#F8FBFF", borderTop: "1px solid #F0F4F9" },
  dpFooterApply: { width: "100%", padding: "11px", background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 10px rgba(10,107,207,0.25)" },

  // Date desktop
  dpPopover: { position: "absolute", top: "calc(100% + 6px)", left: 0, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12, boxShadow: "0 14px 32px rgba(14,44,86,0.18)", zIndex: 5, width: 260 },
  dpPresetChip: { padding: "4px 9px", background: "#F8FBFF", border: "1px solid #E1E8F0", color: "#6B7280", borderRadius: 999, fontSize: 10.5, fontWeight: 600, cursor: "pointer" },
  dpPresetChipSel: { background: "#0A6BCF", borderColor: "#0A6BCF", color: "#FFFFFF" },

  // TimePicker
  tpFranjasCard: { padding: 12, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12 },
  tpFranjasLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#9CA3AF", letterSpacing: ".1em", fontWeight: 700, marginBottom: 8 },
  tpFranjasGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 },
  franjaCard: { padding: "10px 8px", background: "#F8FBFF", border: "1.5px solid #E1E8F0", borderRadius: 10, textAlign: "center", cursor: "pointer" },
  franjaCardSel: { background: "linear-gradient(135deg,#F59E0B,#FBBF24)", borderColor: "#F59E0B", boxShadow: "0 4px 10px rgba(245,158,11,0.30)" },
  franjaIcon: { width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center", margin: "0 auto 6px" },
  franjaLabel: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: "-0.01em" },
  franjaRange: { fontSize: 10, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" },

  tpSlotsLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#9CA3AF", letterSpacing: ".1em", fontWeight: 700, marginTop: 14, marginBottom: 8 },
  tpSlotsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 },
  tpSlot: { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "8px", background: "#FFFFFF", border: "1px solid #E1E8F0", color: "#0E2C56", borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" },
  tpSlotSel: { background: "#0A6BCF", borderColor: "#0A6BCF", color: "#FFFFFF", boxShadow: "0 4px 10px rgba(10,107,207,0.25)" },
  tpSlotDisabled: { background: "#F4F7FB", color: "#C8D4E0", borderColor: "#E1E8F0", cursor: "not-allowed", textDecoration: "line-through" },
  tpSlotMeridian: { fontSize: 9, marginLeft: 2, opacity: 0.7 },

  wheelCard: { position: "relative", padding: "12px 16px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12, height: 160, overflow: "hidden" },
  wheelCols: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, height: "100%" },
  wheelCol: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 },
  wheelItem: { fontFamily: "'Manrope', sans-serif", transition: "all 0.2s" },
  wheelColon: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 24, color: "#0E2C56" },
  wheelHighlight: { position: "absolute", left: 0, right: 0, top: "50%", transform: "translateY(-50%)", height: 36, background: "rgba(10,107,207,0.06)", borderTop: "1px solid rgba(10,107,207,0.18)", borderBottom: "1px solid rgba(10,107,207,0.18)", pointerEvents: "none" },

  // Toggle rows
  toggleListGroup: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12, overflow: "hidden" },
  toggleRow: { display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: "1px solid #F4F7FB" },
  toggleRowIcon: { width: 32, height: 32, borderRadius: 9, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  toggleRowTitle: { fontSize: 12.5, color: "#0E2C56", fontWeight: 700 },
  toggleRowSub: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  toggleHint: { fontSize: 10, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },

  // Options
  optionList: { display: "flex", flexDirection: "column", gap: 6 },
  optionRow: { display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 12px", background: "#FFFFFF", border: "1.5px solid #E1E8F0", borderRadius: 12, cursor: "pointer" },
  optionRowSel: { borderColor: "#0A6BCF", background: "rgba(10,107,207,0.04)" },
  optionTitle: { fontSize: 12.5, color: "#0E2C56", fontWeight: 700 },
  optionSub: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  optionTrailing: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 13, color: "#0E2C56" },
  optionBadge: { padding: "2px 7px", background: "rgba(245,158,11,0.14)", color: "#B45309", borderRadius: 999, fontSize: 9, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".06em" },

  // Photo
  avUpload: { width: 84, height: 84, borderRadius: "50%", display: "grid", placeItems: "center", position: "relative", overflow: "hidden", gap: 3 },
  avUploadText: { fontSize: 9.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, position: "absolute", bottom: 16 },
  avEditDot: { position: "absolute", right: 0, bottom: 4, width: 26, height: 26, borderRadius: "50%", background: "#0A6BCF", display: "grid", placeItems: "center", border: "2.5px solid #FFFFFF" },

  photoGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, maxWidth: 360 },
  photoSlot: { aspectRatio: "1", position: "relative" },
  photoSlotInner: { position: "relative", width: "100%", height: "100%", borderRadius: 10, display: "grid", placeItems: "center", overflow: "hidden" },
  photoSlotAdd: { background: "rgba(10,107,207,0.06)", border: "1.5px dashed rgba(10,107,207,0.40)", display: "flex", flexDirection: "column", gap: 4 },
  photoAddText: { fontSize: 10, color: "#0A6BCF", fontWeight: 700 },
  photoTagMini: { position: "absolute", left: 4, bottom: 4, padding: "1px 6px", background: "rgba(14,44,86,0.65)", color: "#FFFFFF", fontSize: 8.5, fontWeight: 700, borderRadius: 4 },
  photoBadgeMini: { position: "absolute", top: 4, right: 4, padding: "1px 6px", background: "rgba(10,107,207,0.85)", color: "#FFFFFF", fontSize: 8.5, fontWeight: 700, borderRadius: 4 },
  photoRemoveBtn: { position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: "50%", background: "rgba(14,44,86,0.65)", border: "none", display: "grid", placeItems: "center", cursor: "pointer" },
  photoFooter: { display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 11, color: "#6B7280" },

  // Doc
  docSlotLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#0A6BCF", letterSpacing: ".1em", fontWeight: 700, marginBottom: 6 },
  docSlot: { position: "relative", padding: 6, background: "#F8FBFF", border: "1.5px dashed #C8D4E0", borderRadius: 12, aspectRatio: "1.586", overflow: "hidden" },
  docCorner: { position: "absolute", width: 16, height: 16, borderTop: "2.5px solid #0A6BCF", borderLeft: "2.5px solid #0A6BCF" },
  docCaptureInner: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, height: "100%" },
  docCaptureIcon: { width: 38, height: 38, borderRadius: 10, background: "#FFFFFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", marginBottom: 4 },
  docCaptureTitle: { fontSize: 12, color: "#0E2C56", fontWeight: 700 },
  docCaptureSub: { fontSize: 10, color: "#9CA3AF" },
  docCaptureChip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", background: "#FFFFFF", border: "1px solid #E1E8F0", color: "#0A6BCF", borderRadius: 999, fontSize: 10, fontWeight: 700 },
  docOverlayBadge: { position: "absolute", top: 8, left: 8, display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", background: "#18A66A", color: "#FFFFFF", borderRadius: 999, fontSize: 10, fontWeight: 700 },
  docOverlayBtn: { position: "absolute", bottom: 8, right: 8, padding: "5px 10px", background: "rgba(255,255,255,0.95)", color: "#0E2C56", border: "none", borderRadius: 8, fontSize: 10.5, fontWeight: 700, cursor: "pointer" },
};

const kf = document.createElement("style");
kf.textContent = `@keyframes ui-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
document.head.appendChild(kf);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
