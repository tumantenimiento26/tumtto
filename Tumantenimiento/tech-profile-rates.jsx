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

// =====================================================================
// STEP HEADER
// =====================================================================
function StepHeader({ stepLabel, step, total = 5 }) {
  const pct = (step / total) * 100;
  return (
    <div style={c.stepHeader}>
      <button style={c.backBtn}>
        <Ic name="arrow-left" size={17} color="#0E2C56" />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={c.stepLabelRow}>
          <span style={c.stepLabel}>{stepLabel}</span>
          <span style={c.stepCount}>Paso {step} de {total}</span>
        </div>
        <div style={c.stepTrack}>
          <div style={{ ...c.stepFill, width: `${pct}%` }} />
        </div>
      </div>
      <button style={c.helpBtn}>
        <Ic name="help-circle" size={15} color="#6B7280" />
      </button>
    </div>
  );
}

// =====================================================================
// SCREEN 01 — PERFIL PROFESIONAL
// =====================================================================
function ProfileScreen() {
  const BIO = "Plomero con 20 años de experiencia atendiendo casas y comercios en la ZMG. Especialista en fugas, calentadores y drenajes. Trabajo limpio, garantía de 6 meses en mano de obra.";
  const photos = [
    { tone: "linear-gradient(135deg,#0A6BCF,#18C1FF)", tag: "Antes" },
    { tone: "linear-gradient(135deg,#18A66A,#4ED896)", tag: "Después" },
    { tone: "linear-gradient(135deg,#0E2C56,#0894EA)", tag: "Calentador" },
    { tone: "linear-gradient(135deg,#B45309,#F59E0B)", tag: "Fuga" },
  ];

  return (
    <div style={c.wrap}>
      <StepHeader stepLabel="Perfil profesional" step={5} total={6} />

      <div style={c.body}>
        <div style={c.titleBlock}>
          <div style={c.bigTitle}>Tu perfil profesional</div>
          <div style={c.bigSub}>
            Así te verán los clientes. Mientras más completo, más confianza generas.
          </div>
        </div>

        {/* Completeness meter */}
        <div style={c.meterCard}>
          <div style={c.meterRow}>
            <span style={c.meterLabel}>COMPLETITUD DE TU PERFIL</span>
            <span style={c.meterVal}>72%</span>
          </div>
          <div style={c.meterTrack}>
            <div style={{ ...c.meterFill, width: "72%" }} />
          </div>
          <div style={c.meterSub}>
            <Ic name="info" size={10} color="#0A6BCF" />
            <span>Sube <b style={{ color: "#0E2C56", fontWeight: 700 }}>3 fotos más</b> para llegar al 85%</span>
          </div>
        </div>

        {/* BIO */}
        <SectionLabel n="A" label="BIO PROFESIONAL" sub="Cómo te presentas a clientes" />
        <div style={c.bioBox}>
          <div style={c.bioText}>{BIO}</div>
          <div style={c.bioFoot}>
            <div style={c.bioMicChip}>
              <Ic name="mic" size={11} color="#0A6BCF" />
              <span>Dictar</span>
            </div>
            <div style={c.bioMicChip}>
              <Ic name="sparkles" size={11} color="#0A6BCF" />
              <span>Mejorar con IA</span>
            </div>
            <span style={c.bioCount}>{BIO.length}/500</span>
          </div>
        </div>

        {/* PHOTOS */}
        <SectionLabel n="B" label="GALERÍA DE TRABAJOS" sub="Sube hasta 20 fotos" right={<span style={c.photoBadge}>4/20</span>} />

        <div style={c.tipAmber}>
          <Ic name="lightbulb" size={12} color="#B45309" />
          <span>Las fotos de <b style={{ color: "#0E2C56", fontWeight: 700 }}>antes / después</b> son las más efectivas para ganar la confianza del cliente.</span>
        </div>

        <div style={c.photoGrid}>
          {/* Add slot */}
          <div style={c.photoAdd}>
            <Ic name="camera" size={22} color="#0A6BCF" />
            <span style={c.photoAddText}>Agregar</span>
          </div>
          {photos.map((p, idx) => (
            <div key={idx} style={{ ...c.photoTile, background: p.tone }}>
              <Ic name="image" size={18} color="rgba(255,255,255,0.85)" />
              <span style={c.photoTag}>{p.tag}</span>
              <button style={c.photoRemove}>
                <Ic name="x" size={10} color="#FFFFFF" stroke={3} />
              </button>
            </div>
          ))}
          {[...Array(4)].map((_, idx) => (
            <div key={`empty${idx}`} style={c.photoEmpty} />
          ))}
        </div>

        {/* CATEGORIES */}
        <SectionLabel n="C" label="CATEGORÍAS QUE OFRECES" sub="Selecciona todas las áreas en las que trabajas" />

        <div style={c.catList}>
          <CategoryAccordion icon="wrench" color="blue" name="Plomería" expanded selected={4} total={8}
            subs={[
              { label: "Fugas", checked: true },
              { label: "Calentadores", checked: true },
              { label: "Drenaje de cocina", checked: true },
              { label: "Instalación de WC", checked: true },
              { label: "Instalación de regaderas" },
              { label: "Cambio de tuberías" },
              { label: "Desazolve" },
              { label: "Cisternas y tinacos" },
            ]}
          />
          <CategoryAccordion icon="zap" color="cyan" name="Electricidad" expanded selected={2} total={6}
            subs={[
              { label: "Instalación de lámparas", checked: true },
              { label: "Reparación de cortos", checked: true },
              { label: "Cambio de tableros" },
              { label: "Contactos y apagadores" },
              { label: "Bombas y motores" },
              { label: "Centros de carga" },
            ]}
          />
          <CategoryAccordion icon="flame" color="amber" name="Gas" expanded selected={3} total={5}
            subs={[
              { label: "Calentador de gas", checked: true },
              { label: "Cambio de regulador", checked: true },
              { label: "Revisión de fugas", checked: true },
              { label: "Reubicación de tanques" },
              { label: "Instalación nueva" },
            ]}
          />
          <CategoryAccordion icon="paint-roller" color="gray" name="Pintura" selected={0} total={4} />
          <CategoryAccordion icon="hammer" color="gray" name="Herrería" selected={0} total={5} />
          <CategoryAccordion icon="square" color="gray" name="Cristales" selected={0} total={3} />
        </div>
      </div>

      <div style={c.footer}>
        <button style={c.primaryBtn}>
          <span>Continuar · 9 servicios</span>
          <Ic name="arrow-right" size={15} color="#FFFFFF" stroke={2.6} style={{ marginLeft: 8 }} />
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ n, label, sub, right }) {
  return (
    <div style={c.sectionLabelRow}>
      <div style={c.sectionLabelNum}>{n}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={c.sectionLabelLabel}>{label}</div>
        {sub && <div style={c.sectionLabelSub}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function CategoryAccordion({ icon, color = "blue", name, subs = [], selected = 0, total, expanded }) {
  const map = {
    blue:  { bg: "rgba(10,107,207,0.10)",  color: "#0A6BCF" },
    cyan:  { bg: "rgba(24,193,255,0.18)",  color: "#0884B0" },
    amber: { bg: "rgba(245,158,11,0.14)",  color: "#B45309" },
    gray:  { bg: "rgba(14,44,86,0.05)",    color: "#9CA3AF" },
  };
  const v = map[color];
  const isOff = selected === 0;
  return (
    <div style={{
      ...c.catAccordion,
      ...(expanded ? c.catAccordionOpen : null),
      ...(isOff ? c.catAccordionOff : null),
    }}>
      <div style={c.catHead}>
        <div style={{ ...c.catIcon, background: v.bg }}>
          <Ic name={icon} size={15} color={v.color} stroke={2.2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...c.catName, color: isOff ? "#9CA3AF" : "#0E2C56" }}>{name}</div>
          <div style={c.catCount}>
            {isOff ? "Sin selección" : (
              <>
                <b style={{ color: v.color, fontWeight: 700 }}>{selected}</b>
                <span> de {total} seleccionadas</span>
              </>
            )}
          </div>
        </div>
        {!isOff && (
          <span style={{ ...c.catBadge, background: v.bg, color: v.color }}>{selected}</span>
        )}
        <Ic name={expanded ? "chevron-up" : "chevron-down"} size={15} color={isOff ? "#9CA3AF" : "#6B7280"} />
      </div>
      {expanded && subs.length > 0 && (
        <div style={c.catBody}>
          {subs.map((s, i) => (
            <div key={i} style={c.catCheckRow}>
              <div style={{ ...c.checkbox, ...(s.checked ? { ...c.checkboxOn, background: v.color, borderColor: v.color } : null) }}>
                {s.checked && <Ic name="check" size={10} color="#FFFFFF" stroke={3.5} />}
              </div>
              <span style={{ ...c.catCheckLabel, color: s.checked ? "#0E2C56" : "#6B7280", fontWeight: s.checked ? 600 : 500 }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================================================
// SCREEN 02 — TARIFAS
// =====================================================================
function RatesScreen() {
  const rates = [
    { cat: "Plomería", catIcon: "wrench", catColor: "blue", items: [
      { name: "Fugas",             price: 450, min: 350, max: 650, ok: true,  popular: true },
      { name: "Calentadores",      price: 550, min: 400, max: 800, ok: true },
      { name: "Drenaje de cocina", price: 400, min: 300, max: 550, ok: true },
      { name: "Instalación de WC", price: 950, min: 500, max: 900, warn: "high" },
    ]},
    { cat: "Electricidad", catIcon: "zap", catColor: "cyan", items: [
      { name: "Instalación de lámparas",  price: 200, min: 250, max: 500, warn: "low" },
      { name: "Reparación de cortos",     price: 500, min: 400, max: 700, ok: true },
    ]},
    { cat: "Gas", catIcon: "flame", catColor: "amber", items: [
      { name: "Servicio de calentador a gas", price: 600, min: 450, max: 800, ok: true,  popular: true },
      { name: "Cambio de regulador",          price: 400, min: 300, max: 550, ok: true },
      { name: "Revisión de fugas",            price: 500, min: 400, max: 700, ok: true },
    ]},
  ];

  return (
    <div style={c.wrap}>
      <StepHeader stepLabel="Tarifas base" step={6} total={6} />

      <div style={c.body}>
        <div style={c.titleBlock}>
          <div style={c.bigTitle}>Tus tarifas base</div>
          <div style={c.bigSub}>
            Define cuánto cobras por cada servicio. Podrás agregar <b style={{ color: "#0E2C56", fontWeight: 700 }}>extras</b> después del diagnóstico.
          </div>
        </div>

        {/* Estimated earnings card */}
        <div style={c.earnCard}>
          <div style={c.earnIcon}>
            <Ic name="trending-up" size={18} color="#FFFFFF" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={c.earnLabel}>POTENCIAL ESTIMADO · MES</div>
            <div style={c.earnVal}>
              $52,500 <span style={c.earnCurr}>MXN</span>
            </div>
            <div style={c.earnSub}>Basado en demanda de tus 9 servicios en Providencia</div>
          </div>
        </div>

        {/* Explainer */}
        <div style={c.infoCard}>
          <Ic name="info" size={14} color="#0A6BCF" />
          <div style={{ flex: 1 }}>
            Las tarifas base son <b style={{ color: "#0E2C56", fontWeight: 700 }}>orientativas</b>. Cada subcategoría tiene un rango sugerido por Tumantenimiento. Puedes ajustar dentro del rango para mantenerte competitivo.
          </div>
        </div>

        {/* Validation legend */}
        <div style={c.legendRow}>
          <div style={c.legendItem}>
            <div style={{ ...c.legendDot, background: "#18A66A" }} />
            <span>Dentro del rango</span>
          </div>
          <div style={c.legendItem}>
            <div style={{ ...c.legendDot, background: "#B45309" }} />
            <span>Fuera del rango</span>
          </div>
        </div>

        {/* Rates list */}
        {rates.map((r) => (
          <div key={r.cat} style={c.rateGroup}>
            <div style={c.rateGroupHead}>
              <div style={c.rateGroupIcon}>
                <Ic name={r.catIcon} size={14} color="#0A6BCF" />
              </div>
              <span style={c.rateGroupName}>{r.cat}</span>
              <span style={c.rateGroupBullet} />
              <span style={c.rateGroupCount}>{r.items.length} servicios</span>
            </div>

            <div style={c.rateList}>
              {r.items.map((it, idx) => (
                <RateRow key={idx} item={it} />
              ))}
            </div>
          </div>
        ))}

        <div style={c.tipAmber}>
          <Ic name="info" size={12} color="#B45309" />
          <span>Podrás <b style={{ color: "#0E2C56", fontWeight: 700 }}>ajustar tus tarifas en cualquier momento</b> desde Perfil → Tarifas.</span>
        </div>
      </div>

      <div style={c.footer}>
        <button style={c.primaryBtn}>
          <Ic name="check" size={15} color="#FFFFFF" stroke={2.6} style={{ marginRight: 8 }} />
          <span>Finalizar configuración</span>
        </button>
      </div>
    </div>
  );
}

function RateRow({ item }) {
  const { name, price, min, max, ok, warn, popular } = item;
  const range = max - min;
  // Calculate where the price sits on a 0-1 scale, capped
  const visualMin = Math.min(price, min - range * 0.2);
  const visualMax = Math.max(price, max + range * 0.2);
  const visualRange = visualMax - visualMin;
  const minPct  = ((min  - visualMin) / visualRange) * 100;
  const maxPct  = ((max  - visualMin) / visualRange) * 100;
  const pricePct = ((price - visualMin) / visualRange) * 100;

  return (
    <div style={{ ...c.rateRow, ...(warn ? c.rateRowWarn : null) }}>
      <div style={c.rateTopRow}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={c.rateNameRow}>
            <span style={c.rateName}>{name}</span>
            {popular && <span style={c.popularChip}>POPULAR</span>}
          </div>
          <div style={c.rateRangeSugg}>
            Sugerido <b style={{ color: "#0E2C56", fontWeight: 700 }}>${min} – ${max}</b>
          </div>
        </div>
        <div style={{
          ...c.priceInputWrap,
          ...(warn ? c.priceInputWarn : ok ? c.priceInputOk : null),
        }}>
          <span style={c.priceCurr}>$</span>
          <span style={c.priceVal}>{price.toLocaleString()}</span>
        </div>
      </div>

      {/* Range visualizer */}
      <div style={c.rangeBar}>
        <div style={c.rangeTrack}>
          <div style={{
            ...c.rangeSuggested,
            left: `${minPct}%`,
            width: `${maxPct - minPct}%`,
          }} />
          <div style={{
            ...c.rangeThumb,
            left: `${pricePct}%`,
            background: warn ? "#B45309" : "#0A6BCF",
            borderColor: warn ? "#B45309" : "#0A6BCF",
          }} />
        </div>
        <div style={c.rangeLabels}>
          <span style={{ position: "absolute", left: `${minPct}%`, transform: "translateX(-50%)" }}>${min}</span>
          <span style={{ position: "absolute", left: `${maxPct}%`, transform: "translateX(-50%)" }}>${max}</span>
        </div>
      </div>

      {warn && (
        <div style={c.warnNote}>
          <Ic name="alert-triangle" size={11} color="#B45309" />
          <span>
            {warn === "high" ? (
              <>Está <b style={{ color: "#7B3F00", fontWeight: 700 }}>${price - max}</b> arriba del rango. Los clientes podrían encontrarlo alto.</>
            ) : (
              <>Está <b style={{ color: "#7B3F00", fontWeight: 700 }}>${min - price}</b> abajo del rango. Podría parecer poco profesional.</>
            )}
          </span>
        </div>
      )}
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
      <DCSection id="profile" title="C3 · Perfil profesional + Categorías + Tarifas" subtitle="2 pantallas finales del onboarding técnico">
        <DCArtboard id="prof" label="04 · Perfil profesional y categorías" width={438} height={892}>
          <PhoneFrame><ProfileScreen /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="rates" label="05 · Tarifas base por servicio" width={438} height={892}>
          <PhoneFrame><RatesScreen /></PhoneFrame>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// =====================================================================
// STYLES
// =====================================================================
const c = {
  wrap: { width: "100%", height: "100%", background: "#F8FBFF", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" },
  body: { flex: 1, overflowY: "auto", padding: "16px 18px 110px" },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, background: "#FFFFFF", borderTop: "1px solid #E1E8F0", padding: "14px 18px 30px", display: "flex", gap: 10, alignItems: "center", boxShadow: "0 -4px 12px rgba(14,44,86,0.06)", zIndex: 5 },
  primaryBtn: { width: "100%", height: 54, background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(10,107,207,0.30)" },

  // Step header
  stepHeader: { display: "flex", alignItems: "center", gap: 10, padding: "52px 16px 14px", background: "#FFFFFF", borderBottom: "1px solid #F0F4F9", flexShrink: 0 },
  backBtn: { width: 38, height: 38, borderRadius: 11, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  helpBtn: { width: 38, height: 38, borderRadius: 11, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  stepLabelRow: { display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 },
  stepLabel: { fontSize: 13, fontWeight: 700, color: "#0E2C56" },
  stepCount: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#6B7280", fontWeight: 600 },
  stepTrack: { height: 4, background: "#EEF3F8", borderRadius: 999, overflow: "hidden" },
  stepFill: { height: "100%", background: "linear-gradient(90deg,#0A6BCF,#18C1FF)", borderRadius: 999 },

  // Title block
  titleBlock: { marginBottom: 16 },
  bigTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em" },
  bigSub: { fontSize: 13.5, color: "#6B7280", marginTop: 6, lineHeight: 1.5 },

  // Meter
  meterCard: { padding: 14, background: "linear-gradient(135deg, rgba(10,107,207,0.06), rgba(24,193,255,0.04))", border: "1px solid rgba(10,107,207,0.25)", borderRadius: 14, marginBottom: 18 },
  meterRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 },
  meterLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#0A6BCF", letterSpacing: ".1em", fontWeight: 700 },
  meterVal: { fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: "#0A6BCF", letterSpacing: "-0.02em", lineHeight: 1 },
  meterTrack: { height: 6, background: "rgba(10,107,207,0.10)", borderRadius: 999, overflow: "hidden" },
  meterFill: { height: "100%", background: "linear-gradient(90deg,#18A66A,#4ED896 60%, #18C1FF)", borderRadius: 999 },
  meterSub: { display: "flex", alignItems: "center", gap: 5, marginTop: 8, fontSize: 11, color: "#6B7280" },

  // Section label
  sectionLabelRow: { display: "flex", alignItems: "center", gap: 10, margin: "20px 0 10px" },
  sectionLabelNum: { width: 22, height: 22, borderRadius: "50%", background: "#0A6BCF", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 11, flexShrink: 0 },
  sectionLabelLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#0A6BCF", letterSpacing: ".1em", fontWeight: 700 },
  sectionLabelSub: { fontSize: 10.5, color: "#9CA3AF", marginTop: 1 },

  // Bio
  bioBox: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, padding: "14px" },
  bioText: { fontSize: 13, color: "#0E2C56", lineHeight: 1.55, minHeight: 90 },
  bioFoot: { display: "flex", alignItems: "center", gap: 6, marginTop: 10, paddingTop: 10, borderTop: "1px solid #F0F4F9" },
  bioMicChip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 9px", background: "rgba(10,107,207,0.08)", color: "#0A6BCF", borderRadius: 999, fontSize: 10.5, fontWeight: 600, cursor: "pointer" },
  bioCount: { marginLeft: "auto", fontSize: 10.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },

  // Photos
  photoBadge: { padding: "2px 8px", background: "rgba(10,107,207,0.10)", color: "#0A6BCF", borderRadius: 999, fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  photoGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 10 },
  photoAdd: { aspectRatio: "1", borderRadius: 10, background: "rgba(10,107,207,0.06)", border: "1.5px dashed rgba(10,107,207,0.40)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer" },
  photoAddText: { fontSize: 10, color: "#0A6BCF", fontWeight: 700 },
  photoTile: { position: "relative", aspectRatio: "1", borderRadius: 10, display: "grid", placeItems: "center" },
  photoEmpty: { aspectRatio: "1", borderRadius: 10, background: "#F4F7FB", border: "1px dashed #E1E8F0" },
  photoTag: { position: "absolute", left: 4, bottom: 4, padding: "1px 6px", background: "rgba(14,44,86,0.65)", color: "#FFFFFF", fontSize: 9, fontWeight: 700, borderRadius: 4, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".02em" },
  photoRemove: { position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: "50%", background: "rgba(14,44,86,0.65)", border: "none", display: "grid", placeItems: "center", cursor: "pointer" },

  // Tip
  tipAmber: { display: "flex", alignItems: "flex-start", gap: 6, padding: "8px 10px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 10, fontSize: 11, color: "#6B7280", lineHeight: 1.5, marginTop: 8, marginBottom: 4 },

  // Category accordion
  catList: { display: "flex", flexDirection: "column", gap: 8 },
  catAccordion: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, overflow: "hidden" },
  catAccordionOpen: { borderColor: "rgba(10,107,207,0.25)", boxShadow: "0 4px 12px rgba(10,107,207,0.08)" },
  catAccordionOff: { opacity: 0.85, background: "#FBFCFE" },
  catHead: { display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", cursor: "pointer" },
  catIcon: { width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0 },
  catName: { fontSize: 13.5, fontWeight: 700, color: "#0E2C56" },
  catCount: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  catBadge: { padding: "3px 9px", borderRadius: 999, fontSize: 10.5, fontWeight: 800, fontFamily: "'Manrope', sans-serif" },
  catBody: { padding: "4px 14px 12px 56px", display: "flex", flexDirection: "column", gap: 4, borderTop: "1px solid #F0F4F9" },
  catCheckRow: { display: "flex", alignItems: "center", gap: 10, padding: "8px 0" },
  checkbox: { width: 20, height: 20, borderRadius: 6, border: "1.5px solid #C8D4E0", background: "#FFFFFF", display: "grid", placeItems: "center", flexShrink: 0, cursor: "pointer" },
  checkboxOn: {},
  catCheckLabel: { fontSize: 13, flex: 1 },

  // ===== Rates screen =====
  earnCard: { display: "flex", gap: 12, alignItems: "center", padding: "14px 16px", background: "linear-gradient(135deg, #18A66A 0%, #4ED896 100%)", borderRadius: 16, color: "#FFFFFF", marginBottom: 14, boxShadow: "0 8px 20px rgba(24,166,106,0.30)" },
  earnIcon: { width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.18)", display: "grid", placeItems: "center", flexShrink: 0 },
  earnLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.85)", letterSpacing: ".1em", fontWeight: 700 },
  earnVal: { fontFamily: "'Manrope', sans-serif", fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1, marginTop: 4 },
  earnCurr: { fontSize: 11, opacity: 0.75, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
  earnSub: { fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 6 },

  infoCard: { display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", background: "rgba(10,107,207,0.05)", border: "1px solid rgba(10,107,207,0.20)", borderRadius: 10, fontSize: 12, color: "#6B7280", lineHeight: 1.5, marginBottom: 12 },

  legendRow: { display: "flex", gap: 16, padding: "6px 0 14px" },
  legendItem: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6B7280" },
  legendDot: { width: 8, height: 8, borderRadius: "50%" },

  rateGroup: { marginBottom: 16 },
  rateGroupHead: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
  rateGroupIcon: { width: 28, height: 28, borderRadius: 8, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  rateGroupName: { fontFamily: "'Manrope', sans-serif", fontSize: 15, fontWeight: 700, color: "#0E2C56", letterSpacing: "-0.01em" },
  rateGroupBullet: { width: 3, height: 3, borderRadius: "50%", background: "#9CA3AF" },
  rateGroupCount: { fontSize: 11, color: "#6B7280", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },

  rateList: { display: "flex", flexDirection: "column", gap: 8 },

  rateRow: { padding: "12px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12 },
  rateRowWarn: { background: "rgba(245,158,11,0.04)", borderColor: "rgba(245,158,11,0.40)" },
  rateTopRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
  rateNameRow: { display: "flex", alignItems: "center", gap: 6 },
  rateName: { fontSize: 13.5, fontWeight: 700, color: "#0E2C56" },
  popularChip: { padding: "1px 6px", background: "rgba(245,158,11,0.14)", color: "#B45309", borderRadius: 4, fontSize: 9, fontWeight: 800, letterSpacing: ".06em", fontFamily: "'JetBrains Mono', monospace" },
  rateRangeSugg: { fontSize: 11, color: "#6B7280", marginTop: 2 },

  priceInputWrap: { display: "flex", alignItems: "baseline", gap: 2, padding: "8px 12px", background: "#F8FBFF", border: "1.5px solid #E1E8F0", borderRadius: 10, minWidth: 100, justifyContent: "flex-end" },
  priceInputOk: { borderColor: "#18A66A", background: "rgba(24,166,106,0.04)" },
  priceInputWarn: { borderColor: "#B45309", background: "rgba(245,158,11,0.06)" },
  priceCurr: { fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#9CA3AF", fontWeight: 600 },
  priceVal: { fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.01em" },

  rangeBar: { position: "relative", marginTop: 4 },
  rangeTrack: { position: "relative", height: 6, background: "#EEF3F8", borderRadius: 999 },
  rangeSuggested: { position: "absolute", top: 0, height: 6, background: "linear-gradient(90deg,#A7E5C7,#4ED896)", borderRadius: 999 },
  rangeThumb: { position: "absolute", top: "50%", transform: "translate(-50%,-50%)", width: 14, height: 14, borderRadius: "50%", background: "#0A6BCF", border: "3px solid #FFFFFF", boxShadow: "0 2px 6px rgba(14,44,86,0.30)" },
  rangeLabels: { position: "relative", height: 14, marginTop: 4, fontSize: 9.5, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },

  warnNote: { display: "flex", alignItems: "center", gap: 5, marginTop: 10, padding: "6px 10px", background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.30)", borderRadius: 8, fontSize: 11, color: "#6B7280", lineHeight: 1.4 },
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
