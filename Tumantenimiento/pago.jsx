/* global React, ReactDOM, IOSDevice, DesignCanvas, DCSection, DCArtboard */
const { useEffect, useRef, useState } = React;

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
// SHARED — Header used by most pago screens
// =====================================================================
function PayHeader({ title = "Método de pago", amount = "$850 MXN", back = true, close = false }) {
  return (
    <div style={p.header}>
      {back && (
        <button style={p.iconBtn}><Ic name="arrow-left" size={18} color="#0E2C56" /></button>
      )}
      {close && (
        <button style={p.iconBtn}><Ic name="x" size={18} color="#0E2C56" /></button>
      )}
      <div style={{ flex: 1, minWidth: 0, paddingLeft: 4 }}>
        <div style={p.headerLabel}>PAGO</div>
        <div style={p.headerTitle}>{title}</div>
      </div>
      <div style={p.headerAmount}>
        <div style={p.headerAmountLabel}>TOTAL</div>
        <div style={p.headerAmountVal}>{amount}</div>
      </div>
    </div>
  );
}

function ServiceSummaryCard() {
  return (
    <div style={p.svcCard}>
      <div style={p.svcLeft}>
        <div style={p.svcIcon}><Ic name="wrench" size={15} color="#0A6BCF" /></div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={p.svcRowTop}>
          <span style={p.svcId}>#SVC-2851</span>
          <span style={p.bullet} />
          <span style={p.svcCat}>Plomería</span>
        </div>
        <div style={p.svcRowMid}>Ramón H. · Fuga + sellado de tubería</div>
        <a href="#" style={p.svcBreakdown}>
          Ver desglose
          <Ic name="chevron-down" size={11} color="#0A6BCF" style={{ marginLeft: 2 }} />
        </a>
      </div>
      <div style={p.svcAmount}>
        <div style={p.svcAmountVal}>$850</div>
        <div style={p.svcAmountCurr}>MXN</div>
      </div>
    </div>
  );
}

// =====================================================================
// PANTALLA 1 — Selección de método de pago
// =====================================================================
const METHODS = [
  {
    id: "card",
    selected: true,
    title: "Visa terminada en 1234",
    sub: "Vence 08/27 · Tarjeta guardada",
    brand: "card",
    badge: "INSTANTÁNEO",
    badgeTone: "blue",
    amount: "$850",
  },
  {
    id: "newcard",
    title: "Agregar nueva tarjeta",
    sub: "Crédito o débito · Procesamos vía pasarela segura",
    brand: "plus",
    chevron: true,
  },
  {
    id: "oxxo",
    title: "Pagar en OXXO",
    sub: "Recibe una referencia válida 48 horas",
    brand: "oxxo",
    badge: "HOLD HASTA PAGAR",
    badgeTone: "amber",
    amount: "$850",
  },
  {
    id: "mp",
    title: "Pagar con tu cuenta MP",
    sub: "Saldo o tarjeta en Mercado Pago",
    brand: "mp",
    badge: "INSTANTÁNEO",
    badgeTone: "blue",
    amount: "$850",
  },
  {
    id: "cash",
    title: "Pagar en efectivo al técnico",
    sub: "Ramón confirma la recepción en la app",
    brand: "cash",
    badge: "CONFIRMACIÓN BILATERAL",
    badgeTone: "green",
    amount: "$850",
  },
];

function BrandMark({ kind }) {
  if (kind === "card") {
    // Generic Visa-style mark — no real Visa logo, just a card glyph + text
    return (
      <div style={p.brandCard}>
        <div style={p.brandCardChip} />
        <div style={p.brandCardLabel}>VISA</div>
      </div>
    );
  }
  if (kind === "plus") {
    return <div style={p.brandPlus}><Ic name="plus" size={20} color="#0A6BCF" stroke={2.5} /></div>;
  }
  if (kind === "oxxo") {
    return (
      <div style={p.brandOxxo}>
        <div style={p.brandOxxoText}>OXXO</div>
        <div style={p.brandOxxoSub}>Pay</div>
      </div>
    );
  }
  if (kind === "mp") {
    return (
      <div style={p.brandMp}>
        <Ic name="wallet" size={18} color="#FFFFFF" />
      </div>
    );
  }
  if (kind === "cash") {
    return (
      <div style={p.brandCash}>
        <Ic name="banknote" size={20} color="#18A66A" />
      </div>
    );
  }
  return null;
}

function MethodBadge({ tone, label }) {
  const map = {
    blue:  { bg: "rgba(10,107,207,0.10)",  color: "#0A6BCF", icon: "zap" },
    amber: { bg: "rgba(245,158,11,0.14)",  color: "#B45309", icon: "clock" },
    green: { bg: "rgba(24,166,106,0.14)",  color: "#0F8A56", icon: "handshake" },
  };
  const v = map[tone] || map.blue;
  return (
    <span style={{ ...p.methodBadge, background: v.bg, color: v.color }}>
      <Ic name={v.icon} size={9} color={v.color} />
      <span>{label}</span>
    </span>
  );
}

function MethodCard({ m, selected, onClick }) {
  return (
    <div
      style={{
        ...p.methodCard,
        ...(selected ? p.methodCardSel : null),
      }}
      onClick={onClick}
    >
      <BrandMark kind={m.brand} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={p.methodTitle}>{m.title}</div>
        <div style={p.methodSub}>{m.sub}</div>
        {m.badge && (
          <div style={{ marginTop: 7 }}>
            <MethodBadge tone={m.badgeTone} label={m.badge} />
          </div>
        )}
      </div>
      {m.chevron ? (
        <Ic name="chevron-right" size={18} color="#9CA3AF" />
      ) : (
        <div style={{ ...p.radio, ...(selected ? p.radioSel : null) }}>
          {selected && <div style={p.radioDot} />}
        </div>
      )}
    </div>
  );
}

function Screen1Method() {
  const [sel, setSel] = useState("card");
  return (
    <div style={p.wrap}>
      <PayHeader />
      <div style={p.body}>
        <ServiceSummaryCard />

        <div style={p.sectionLabel}>MÉTODOS DE PAGO</div>
        <div style={p.methodList}>
          {METHODS.map(m => (
            <MethodCard
              key={m.id}
              m={m}
              selected={sel === m.id}
              onClick={() => setSel(m.id)}
            />
          ))}
        </div>

        <div style={p.secureRow}>
          <Ic name="shield-check" size={12} color="#0F8A56" />
          <span><b style={{ color: "#0E2C56", fontWeight: 700 }}>Pago protegido.</b> Solo se cobra al confirmar el servicio.</span>
        </div>
      </div>

      <div style={p.footer}>
        <button style={p.payBtn}>
          <Ic name="lock" size={15} color="#FFFFFF" style={{ marginRight: 8 }} />
          Pagar $850 MXN
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// PANTALLA 1b — Form nueva tarjeta (variación)
// =====================================================================
function Screen1NewCard() {
  return (
    <div style={p.wrap}>
      <PayHeader title="Agregar tarjeta" />
      <div style={p.body}>
        <ServiceSummaryCard />

        {/* Live card preview */}
        <div style={p.cardPreview}>
          <div style={p.cardPreviewTopRow}>
            <div style={p.cardPreviewChip} />
            <div style={p.cardPreviewBrand}>
              <span>VISA</span>
              <div style={p.cardPreviewBrandDot} />
            </div>
          </div>
          <div style={p.cardPreviewNum}>
            <span>4242</span>
            <span>5678</span>
            <span style={{ opacity: 0.55 }}>••••</span>
            <span style={{ opacity: 0.55 }}>••••</span>
          </div>
          <div style={p.cardPreviewBottomRow}>
            <div>
              <div style={p.cardPreviewLabel}>TITULAR</div>
              <div style={p.cardPreviewVal}>MARIANA V. RÍOS</div>
            </div>
            <div>
              <div style={p.cardPreviewLabel}>VENCE</div>
              <div style={p.cardPreviewVal}>08/27</div>
            </div>
          </div>
          <div style={p.cardPreviewShine} />
        </div>

        {/* Form */}
        <div style={p.formStack}>
          <div style={p.field}>
            <label style={p.fieldLabel}>Número de tarjeta</label>
            <div style={p.inputWrap}>
              <Ic name="credit-card" size={15} color="#9CA3AF" style={{ marginRight: 8 }} />
              <span style={{ flex: 1, color: "#0E2C56", fontWeight: 500, letterSpacing: "0.04em" }}>4242 5678 ▍</span>
              <span style={p.detectedBrand}>VISA</span>
            </div>
          </div>

          <div style={p.field}>
            <label style={p.fieldLabel}>Nombre en la tarjeta</label>
            <div style={p.inputWrap}>
              <span style={{ flex: 1, color: "#0E2C56" }}>Mariana Velázquez Ríos</span>
            </div>
          </div>

          <div style={p.fieldRow}>
            <div style={p.field}>
              <label style={p.fieldLabel}>MM/AA</label>
              <div style={p.inputWrap}>
                <span style={{ flex: 1, color: "#0E2C56" }}>08/27</span>
              </div>
            </div>
            <div style={p.field}>
              <label style={p.fieldLabel}>
                CVV
                <span style={p.tooltip}>
                  <Ic name="info" size={11} color="#9CA3AF" />
                </span>
              </label>
              <div style={p.inputWrap}>
                <span style={{ flex: 1, color: "#0E2C56", letterSpacing: "0.2em" }}>•••</span>
                <Ic name="help-circle" size={14} color="#9CA3AF" />
              </div>
            </div>
          </div>

          <div style={p.toggleRow}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0E2C56" }}>Guardar para próximas compras</div>
              <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>Solo guardamos los últimos 4 dígitos</div>
            </div>
            <div style={p.toggleOn}>
              <div style={p.toggleKnobOn} />
            </div>
          </div>
        </div>

        <div style={p.secureRowBlock}>
          <div style={p.secureIconBig}><Ic name="shield-check" size={16} color="#0F8A56" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0E2C56" }}>Tus datos están protegidos</div>
            <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2, lineHeight: 1.5 }}>
              No almacenamos información de tarjetas. Procesamos vía pasarela <b style={{ color: "#0E2C56", fontWeight: 700 }}>Mercado Pago</b> con cifrado TLS.
            </div>
          </div>
        </div>
      </div>

      <div style={p.footer}>
        <button style={p.payBtn}>
          <Ic name="lock" size={15} color="#FFFFFF" style={{ marginRight: 8 }} />
          Pagar $850 MXN
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// PANTALLA 2A — Procesando pago
// =====================================================================
function Screen2Processing() {
  return (
    <div style={{ ...p.wrap, background: "linear-gradient(180deg, #E8F2FC 0%, #F8FBFF 80%)" }}>
      <div style={{ ...p.header, background: "transparent", borderBottom: "none" }}>
        <div style={{ flex: 1 }} />
        <button style={{ ...p.iconBtn, background: "rgba(255,255,255,0.6)", border: "1px solid rgba(10,107,207,0.15)", opacity: 0.5 }}>
          <Ic name="x" size={18} color="#0E2C56" />
        </button>
      </div>
      <div style={p.procBody}>
        {/* Animated card icon */}
        <div style={p.procIconWrap}>
          <div style={p.procRing} />
          <div style={p.procRing2} />
          <div style={p.procCard}>
            <div style={p.procCardChip} />
            <div style={p.procCardLines}>
              <div style={p.procCardLine} />
              <div style={{ ...p.procCardLine, width: "60%" }} />
            </div>
            <Ic name="lock" size={14} color="#FFFFFF" style={{ position: "absolute", right: 14, top: 14, opacity: 0.85 }} />
          </div>
        </div>

        <div style={p.procTitle}>Procesando tu pago…</div>
        <div style={p.procSub}>No cierres la app. Esto suele tomar unos segundos.</div>

        <div style={p.procSpinnerRow}>
          <div style={p.procSpinner} />
          <span style={p.procStep}>Validando con tu banco</span>
        </div>

        <div style={p.procSteps}>
          <div style={p.procStepRow}>
            <div style={{ ...p.procStepDot, background: "#18A66A" }}>
              <Ic name="check" size={9} color="#FFFFFF" stroke={3.5} />
            </div>
            <span style={{ ...p.procStepLabel, color: "#6B7280" }}>Tarjeta verificada</span>
            <span style={p.procStepTime}>0.4s</span>
          </div>
          <div style={p.procStepRow}>
            <div style={{ ...p.procStepDot, background: "#0A6BCF", boxShadow: "0 0 0 4px rgba(10,107,207,0.20)" }} />
            <span style={{ ...p.procStepLabel, color: "#0E2C56", fontWeight: 600 }}>Autorizando cargo · $850 MXN</span>
            <span style={{ ...p.procStepTime, color: "#0A6BCF" }}>ahora</span>
          </div>
          <div style={p.procStepRow}>
            <div style={{ ...p.procStepDot, background: "#E1E8F0" }} />
            <span style={{ ...p.procStepLabel, color: "#9CA3AF" }}>Confirmando con Tumantenimiento</span>
          </div>
        </div>
      </div>

      <div style={{ ...p.footer, background: "transparent", borderTop: "none", boxShadow: "none" }}>
        <div style={p.procFootRow}>
          <Ic name="shield-check" size={12} color="#0F8A56" />
          <span>Conexión segura · Mercado Pago · TLS 1.3</span>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// PANTALLA 2B — Referencia OXXO
// =====================================================================
function Screen2Oxxo() {
  return (
    <div style={p.wrap}>
      <PayHeader title="Referencia OXXO" amount="$850 MXN" />
      <div style={p.body}>
        <div style={p.oxxoHero}>
          <div style={p.oxxoTopRow}>
            <div style={p.oxxoLogoMini}>OXXO</div>
            <span style={p.oxxoHoldChip}>
              <Ic name="clock" size={10} color="#B45309" />
              <span>Tu servicio está en hold</span>
            </span>
          </div>
          <div style={p.oxxoTitle}>Paga en cualquier OXXO</div>
          <div style={p.oxxoAmount}>$850<span style={p.oxxoAmountCurr}> MXN</span></div>

          {/* Barcode */}
          <div style={p.barcodeBox}>
            <Barcode />
            <div style={p.barcodeRef}>
              <span>9320</span>
              <span>1234</span>
              <span>5678</span>
              <span>9012</span>
            </div>
            <div style={p.barcodeLabel}>REFERENCIA · CONSERVA TU COMPROBANTE</div>
          </div>

          <div style={p.oxxoActions}>
            <button style={p.oxxoActionPrimary}>
              <Ic name="copy" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              Copiar
            </button>
            <button style={p.oxxoActionSecondary}>
              <Ic name="share-2" size={14} color="#0A6BCF" style={{ marginRight: 6 }} />
              Compartir
            </button>
            <button style={p.oxxoActionSecondary}>
              <Ic name="file-down" size={14} color="#0A6BCF" style={{ marginRight: 6 }} />
              PDF
            </button>
          </div>
        </div>

        <div style={p.oxxoExpire}>
          <Ic name="alarm-clock" size={13} color="#B45309" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: "#0E2C56", fontWeight: 600 }}>Válido hasta el 21/05/2026 · 23:59 hrs</div>
            <div style={{ fontSize: 10.5, color: "#6B7280", marginTop: 2 }}>Tu servicio se confirma al recibir el pago en OXXO.</div>
          </div>
        </div>

        <div style={p.oxxoSteps}>
          <div style={p.oxxoStepsLabel}>CÓMO PAGAR · 4 PASOS</div>
          {[
            { n: 1, t: "Ve a cualquier OXXO", s: "Más de 21,000 tiendas en México" },
            { n: 2, t: "Indica que es un pago Mercado Pago / OXXO Pay", s: "El cajero sabrá qué hacer" },
            { n: 3, t: "Da la referencia o muestra el código de barras", s: "Desde esta pantalla" },
            { n: 4, t: "Conserva tu comprobante", s: "Recibirás confirmación en la app" },
          ].map(s => (
            <div key={s.n} style={p.oxxoStepRow}>
              <div style={p.oxxoStepNum}>{s.n}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={p.oxxoStepTitle}>{s.t}</div>
                <div style={p.oxxoStepSub}>{s.s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={p.footer}>
        <button style={p.btnGhostFull}>
          <Ic name="home" size={14} color="#0A6BCF" style={{ marginRight: 8 }} />
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

function Barcode() {
  // Procedural barcode bars
  const bars = [];
  const widths = [3,1,2,1,3,2,1,3,1,1,2,3,1,2,1,1,3,2,1,3,1,2,3,1,2,1,1,3,2,1,1,3,2,1,3,2,1,2,3,1,2,1,3,2,1,1,3,2,1,3,1,2,3,1,2,1,3,1,2,3];
  let x = 0;
  widths.forEach((w, i) => {
    if (i % 2 === 0) {
      bars.push(<rect key={i} x={x} y={0} width={w} height={56} fill="#0E2C56" />);
    }
    x += w + 0.5;
  });
  return (
    <svg viewBox={`0 0 ${x} 56`} width="100%" height="68" preserveAspectRatio="none" style={{ display: "block" }}>
      {bars}
    </svg>
  );
}

// =====================================================================
// PANTALLA 3 — Pago exitoso
// =====================================================================
function Screen3Success() {
  return (
    <div style={p.wrap}>
      <div style={{ ...p.header, background: "transparent", borderBottom: "none" }}>
        <div style={{ flex: 1 }} />
        <button style={{ ...p.iconBtn, opacity: 0.5 }}>
          <Ic name="x" size={18} color="#0E2C56" />
        </button>
      </div>
      <div style={p.successBody}>
        {/* Success illustration */}
        <div style={p.successIconWrap}>
          <div style={p.successRing} />
          <div style={p.successRing2} />
          <div style={p.successCircle}>
            <Ic name="check" size={48} color="#FFFFFF" stroke={3.5} />
          </div>
          {/* Confetti dots */}
          <div style={{ ...p.confetti, top: 6,  left: 14, background: "#F59E0B" }} />
          <div style={{ ...p.confetti, top: 30, left: -4,  background: "#0A6BCF" }} />
          <div style={{ ...p.confetti, top: 70, left: -10, background: "#18C1FF" }} />
          <div style={{ ...p.confetti, top: 10, right: 20, background: "#18A66A" }} />
          <div style={{ ...p.confetti, top: 50, right: -8, background: "#0894EA" }} />
          <div style={{ ...p.confetti, bottom: 0,right: 8,  background: "#FBBF24" }} />
        </div>

        <div style={p.successTitle}>¡Pago confirmado!</div>
        <div style={p.successSub}>Tu servicio ha sido pagado exitosamente. Ya puedes calificar a Ramón.</div>

        {/* Receipt card */}
        <div style={p.receiptCard}>
          <div style={p.receiptHead}>
            <div>
              <div style={p.receiptLabel}>MONTO PAGADO</div>
              <div style={p.receiptAmount}>$850<span style={p.totalCurr}> MXN</span></div>
            </div>
            <span style={p.receiptStatus}>
              <Ic name="badge-check" size={11} color="#0F8A56" />
              <span>Confirmado</span>
            </span>
          </div>
          <div style={p.receiptDivider} />
          <div style={p.receiptRow}>
            <span style={p.receiptKey}>Método</span>
            <span style={p.receiptVal}>
              <div style={p.receiptCardMark}>VISA</div>
              <span>•••• 1234</span>
            </span>
          </div>
          <div style={p.receiptRow}>
            <span style={p.receiptKey}>Fecha y hora</span>
            <span style={p.receiptVal}>19/05/2026 · 18:42</span>
          </div>
          <div style={p.receiptRow}>
            <span style={p.receiptKey}>Servicio</span>
            <span style={p.receiptVal}>#SVC-2851 · Plomería</span>
          </div>
          <div style={p.receiptRow}>
            <span style={p.receiptKey}>Técnico</span>
            <span style={p.receiptVal}>
              <div style={p.techMini}>RH</div>
              <span>Ramón Hernández</span>
            </span>
          </div>
          <div style={p.receiptDivider} />
          <div style={p.receiptRow}>
            <span style={p.receiptKey}>ID transacción</span>
            <span style={{ ...p.receiptVal, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }}>#PAY-9821</span>
          </div>
        </div>
      </div>

      <div style={p.footerStack}>
        <button style={p.payBtn}>
          <Ic name="star" size={15} color="#FFFFFF" style={{ marginRight: 8 }} />
          Calificar a Ramón
        </button>
        <div style={p.successSecondaryRow}>
          <button style={p.btnGhostHalf2}>
            <Ic name="file-down" size={13} color="#0A6BCF" style={{ marginRight: 6 }} />
            Descargar recibo
          </button>
          <button style={p.btnGhostHalf3}>
            <Ic name="home" size={13} color="#6B7280" style={{ marginRight: 6 }} />
            Inicio
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// PANTALLA 4 — Pago en efectivo
// =====================================================================
function Screen4Cash() {
  return (
    <div style={p.wrap}>
      <PayHeader title="Pago en efectivo" amount="$850 MXN" />
      <div style={p.body}>
        {/* Hero illustration */}
        <div style={p.cashHero}>
          <CashIllu />
          <div style={p.cashHeroTitle}>Paga en efectivo a Ramón</div>
          <div style={p.cashHeroSub}>Entrega el efectivo al finalizar el servicio y confirma aquí.</div>
        </div>

        {/* Total card */}
        <div style={p.cashTotalCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={p.receiptLabel}>TOTAL A ENTREGAR</div>
              <div style={p.cashAmount}>$850<span style={p.totalCurr}> MXN</span></div>
            </div>
            <div style={p.cashAmountIcon}>
              <Ic name="banknote" size={26} color="#0F8A56" />
            </div>
          </div>
          <div style={p.cashBreakdown}>
            <span>Tarifa base $450</span>
            <span style={p.bullet} />
            <span>Llave $250</span>
            <span style={p.bullet} />
            <span>Sellado $150</span>
          </div>
        </div>

        {/* Bilateral confirmation explainer */}
        <div style={p.bilateralCard}>
          <div style={p.bilateralHead}>
            <div style={p.bilateralIconWrap}>
              <Ic name="handshake" size={15} color="#0A6BCF" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={p.bilateralTitle}>Confirmación bilateral</div>
              <div style={p.bilateralSub}>Ambos deben confirmar para cerrar el servicio</div>
            </div>
          </div>
          <div style={p.bilateralSteps}>
            <div style={p.bilateralStep}>
              <div style={p.bilateralAvBlue}>TU</div>
              <div style={{ flex: 1 }}>
                <div style={p.bilateralStepTitle}>Tú confirmas que pagaste</div>
                <div style={p.bilateralStepSub}>Aquí, en la app</div>
              </div>
              <Ic name="circle" size={16} color="#E1E8F0" />
            </div>
            <div style={p.bilateralLine} />
            <div style={p.bilateralStep}>
              <div style={p.bilateralAvTech}>RH</div>
              <div style={{ flex: 1 }}>
                <div style={p.bilateralStepTitle}>Ramón confirma que recibió</div>
                <div style={p.bilateralStepSub}>En su versión técnico</div>
              </div>
              <Ic name="circle" size={16} color="#E1E8F0" />
            </div>
          </div>
        </div>

        {/* Warning */}
        <div style={p.warnCard}>
          <div style={p.warnIcon}>
            <Ic name="triangle-alert" size={15} color="#B45309" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={p.warnTitle}>Importante</div>
            <div style={p.warnText}>
              Solo confirma el pago <b style={{ color: "#7B3F00", fontWeight: 700 }}>después</b> de entregar el dinero. Ramón también debe confirmar la recepción para liberar el servicio.
            </div>
          </div>
        </div>
      </div>

      <div style={p.footer}>
        <button style={p.payBtn}>
          <Ic name="check" size={15} color="#FFFFFF" stroke={3} style={{ marginRight: 8 }} />
          Ya pagué los $850 MXN a Ramón
        </button>
      </div>
    </div>
  );
}

function CashIllu() {
  return (
    <svg viewBox="0 0 220 110" width="180" height="90" style={{ display: "block", margin: "0 auto" }}>
      {/* Stacked bills */}
      <g transform="translate(28, 28)">
        <rect x="0" y="20" width="120" height="58" rx="6" fill="#A7D9BD" stroke="#18A66A" strokeWidth="1.5" transform="rotate(-6 60 49)" />
        <rect x="20" y="14" width="120" height="58" rx="6" fill="#C6EAD7" stroke="#0F8A56" strokeWidth="1.5" transform="rotate(2 80 43)" />
        <rect x="30" y="8" width="120" height="58" rx="6" fill="#E5F7EE" stroke="#0F8A56" strokeWidth="1.5" />
        {/* Top bill detail */}
        <g transform="translate(30, 8)">
          <circle cx="60" cy="29" r="14" fill="#FFFFFF" stroke="#0F8A56" strokeWidth="1.5" />
          <text x="60" y="33" textAnchor="middle" fontFamily="Manrope, sans-serif" fontWeight="800" fontSize="13" fill="#0F8A56">$</text>
          <rect x="10" y="10" width="14" height="6" rx="1" fill="#0F8A56" opacity="0.5" />
          <rect x="96" y="42" width="14" height="6" rx="1" fill="#0F8A56" opacity="0.5" />
        </g>
      </g>
      {/* Sparkle */}
      <g fill="#F59E0B">
        <circle cx="185" cy="28" r="2.5" />
        <circle cx="200" cy="48" r="2" />
        <circle cx="20" cy="20" r="2" />
      </g>
    </svg>
  );
}

// =====================================================================
// PANTALLA 4b — Esperando confirmación de Ramón
// =====================================================================
function Screen4Waiting() {
  return (
    <div style={p.wrap}>
      <PayHeader title="Pago en efectivo" amount="$850 MXN" />
      <div style={p.body}>
        <div style={p.waitHero}>
          <div style={p.waitIconWrap}>
            <div style={p.waitRing} />
            <div style={p.waitCircle}>
              <Ic name="check" size={28} color="#FFFFFF" stroke={3.5} />
            </div>
          </div>
          <div style={p.waitTitle}>Confirmaste el pago</div>
          <div style={p.waitSub}>Falta que Ramón confirme que recibió los <b style={{ color: "#0E2C56", fontWeight: 700 }}>$850 MXN</b> en efectivo.</div>
        </div>

        {/* Bilateral state — now in progress */}
        <div style={p.bilateralCard}>
          <div style={p.bilateralHead}>
            <div style={p.bilateralIconWrap}>
              <Ic name="handshake" size={15} color="#0A6BCF" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={p.bilateralTitle}>Confirmación bilateral</div>
              <div style={p.bilateralSub}>1 de 2 confirmaciones</div>
            </div>
            <span style={p.progressChip}>
              <span style={p.liveDot} />
              en espera
            </span>
          </div>
          <div style={p.bilateralSteps}>
            <div style={p.bilateralStep}>
              <div style={{ ...p.bilateralAvBlue, background: "linear-gradient(135deg,#18A66A,#4ED896)" }}>TU</div>
              <div style={{ flex: 1 }}>
                <div style={{ ...p.bilateralStepTitle, color: "#0F8A56" }}>Confirmaste el pago</div>
                <div style={p.bilateralStepSub}>Hoy, 18:39</div>
              </div>
              <div style={p.checkGreen}><Ic name="check" size={10} color="#FFFFFF" stroke={3.5} /></div>
            </div>
            <div style={p.bilateralLine} />
            <div style={p.bilateralStep}>
              <div style={p.bilateralAvTech}>RH</div>
              <div style={{ flex: 1 }}>
                <div style={p.bilateralStepTitle}>Esperando confirmación de Ramón</div>
                <div style={p.bilateralStepSub}>Le enviamos una notificación</div>
              </div>
              <div style={p.spinnerSmall} />
            </div>
          </div>
        </div>

        {/* Quick nudge action */}
        <div style={p.nudgeRow}>
          <Ic name="bell" size={13} color="#0A6BCF" />
          <span>Si Ramón no responde, puedes <a href="#" style={p.nudgeLink}>recordárselo</a> o <a href="#" style={p.nudgeLink}>reportar un problema</a>.</span>
        </div>
      </div>

      <div style={p.footer}>
        <button style={p.btnGhostFull}>
          <Ic name="message-circle" size={14} color="#0A6BCF" style={{ marginRight: 8 }} />
          Mensajear a Ramón
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// PANTALLA 4c — Pago confirmado por ambas partes
// =====================================================================
function Screen4Confirmed() {
  return (
    <div style={p.wrap}>
      <PayHeader title="Pago en efectivo" amount="$850 MXN" />
      <div style={p.body}>
        <div style={p.confirmedHero}>
          <div style={p.confirmedIconWrap}>
            <div style={p.confirmedRing} />
            <div style={p.confirmedRing2} />
            <div style={p.successCircle}>
              <Ic name="handshake" size={36} color="#FFFFFF" />
            </div>
          </div>
          <div style={p.successTitle}>Pago confirmado por ambas partes</div>
          <div style={p.successSub}>Tú entregaste y Ramón recibió los <b style={{ color: "#0E2C56", fontWeight: 700 }}>$850 MXN</b>. Servicio cerrado.</div>
        </div>

        {/* Both confirmations card */}
        <div style={p.bilateralCard}>
          <div style={p.bilateralHead}>
            <div style={{ ...p.bilateralIconWrap, background: "rgba(24,166,106,0.10)" }}>
              <Ic name="check-check" size={15} color="#0F8A56" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={p.bilateralTitle}>Confirmación bilateral</div>
              <div style={p.bilateralSub}>2 de 2 confirmaciones</div>
            </div>
            <span style={p.confirmedChip}>
              <Ic name="badge-check" size={11} color="#0F8A56" />
              <span>completo</span>
            </span>
          </div>
          <div style={p.bilateralSteps}>
            <div style={p.bilateralStep}>
              <div style={{ ...p.bilateralAvBlue, background: "linear-gradient(135deg,#18A66A,#4ED896)" }}>TU</div>
              <div style={{ flex: 1 }}>
                <div style={{ ...p.bilateralStepTitle, color: "#0F8A56" }}>Confirmaste el pago</div>
                <div style={p.bilateralStepSub}>Hoy, 18:39</div>
              </div>
              <div style={p.checkGreen}><Ic name="check" size={10} color="#FFFFFF" stroke={3.5} /></div>
            </div>
            <div style={{ ...p.bilateralLine, background: "#18A66A" }} />
            <div style={p.bilateralStep}>
              <div style={{ ...p.bilateralAvTech, background: "linear-gradient(135deg,#18A66A,#4ED896)" }}>RH</div>
              <div style={{ flex: 1 }}>
                <div style={{ ...p.bilateralStepTitle, color: "#0F8A56" }}>Ramón confirmó la recepción</div>
                <div style={p.bilateralStepSub}>Hoy, 18:41</div>
              </div>
              <div style={p.checkGreen}><Ic name="check" size={10} color="#FFFFFF" stroke={3.5} /></div>
            </div>
          </div>
        </div>

        <div style={p.receiptCardCompact}>
          <div style={p.receiptRow}>
            <span style={p.receiptKey}>Servicio</span>
            <span style={p.receiptVal}>#SVC-2851 · Plomería</span>
          </div>
          <div style={p.receiptRow}>
            <span style={p.receiptKey}>Método</span>
            <span style={p.receiptVal}>Efectivo · entregado a Ramón</span>
          </div>
          <div style={p.receiptRow}>
            <span style={p.receiptKey}>ID transacción</span>
            <span style={{ ...p.receiptVal, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }}>#PAY-9822</span>
          </div>
        </div>
      </div>

      <div style={p.footerStack}>
        <button style={p.payBtn}>
          <Ic name="star" size={15} color="#FFFFFF" style={{ marginRight: 8 }} />
          Calificar a Ramón
        </button>
        <div style={p.successSecondaryRow}>
          <button style={p.btnGhostHalf2}>
            <Ic name="file-down" size={13} color="#0A6BCF" style={{ marginRight: 6 }} />
            Descargar recibo
          </button>
          <button style={p.btnGhostHalf3}>
            <Ic name="home" size={13} color="#6B7280" style={{ marginRight: 6 }} />
            Inicio
          </button>
        </div>
      </div>
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
      <DCSection id="flow" title="Flujo de pago" subtitle="Cliente · 4 pantallas + variaciones · Tumantenimiento">
        <DCArtboard id="p1" label="01 · Selección de método" width={438} height={892}>
          <PhoneFrame><Screen1Method /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="p1b" label="01b · Nueva tarjeta (form)" width={438} height={892}>
          <PhoneFrame><Screen1NewCard /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="p2a" label="02a · Procesando pago" width={438} height={892}>
          <PhoneFrame><Screen2Processing /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="p2b" label="02b · Referencia OXXO" width={438} height={892}>
          <PhoneFrame><Screen2Oxxo /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="p3" label="03 · Pago exitoso" width={438} height={892}>
          <PhoneFrame><Screen3Success /></PhoneFrame>
        </DCArtboard>
      </DCSection>

      <DCSection id="cash" title="Pago en efectivo · confirmación bilateral" subtitle="Feature crítica anti-fraude · 3 estados">
        <DCArtboard id="p4a" label="04a · Antes de pagar" width={438} height={892}>
          <PhoneFrame><Screen4Cash /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="p4b" label="04b · Esperando a Ramón" width={438} height={892}>
          <PhoneFrame><Screen4Waiting /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="p4c" label="04c · Confirmado por ambos" width={438} height={892}>
          <PhoneFrame><Screen4Confirmed /></PhoneFrame>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// =====================================================================
// STYLES
// =====================================================================
const p = {
  wrap: { width: "100%", height: "100%", background: "#F8FBFF", display: "flex", flexDirection: "column", position: "relative" },

  // ===== Header =====
  header: { display: "flex", alignItems: "center", gap: 10, padding: "50px 16px 12px", background: "#FFFFFF", borderBottom: "1px solid #F0F4F9", flexShrink: 0 },
  iconBtn: { width: 38, height: 38, borderRadius: 12, background: "#F8FBFF", border: "1px solid #E1E8F0", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  headerLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#9CA3AF", letterSpacing: ".1em", fontWeight: 700, textTransform: "uppercase" },
  headerTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 17, color: "#0E2C56", fontWeight: 700, marginTop: 1, letterSpacing: "-0.01em" },
  headerAmount: { textAlign: "right" },
  headerAmountLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#9CA3AF", letterSpacing: ".1em", fontWeight: 700 },
  headerAmountVal: { fontFamily: "'Manrope', sans-serif", fontSize: 14, color: "#0A6BCF", fontWeight: 700, marginTop: 2 },

  // ===== Body / Footer =====
  body: { flex: 1, overflowY: "auto", padding: "14px 16px 110px" },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, background: "#FFFFFF", borderTop: "1px solid #E1E8F0", padding: "14px 16px 30px", display: "flex", gap: 10, alignItems: "center", boxShadow: "0 -4px 12px rgba(14,44,86,0.06)", zIndex: 5 },
  footerStack: { position: "absolute", left: 0, right: 0, bottom: 0, background: "#FFFFFF", borderTop: "1px solid #E1E8F0", padding: "14px 16px 30px", display: "flex", flexDirection: "column", gap: 8, boxShadow: "0 -4px 12px rgba(14,44,86,0.06)", zIndex: 5 },
  payBtn: { width: "100%", height: 54, background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(10,107,207,0.30)" },
  btnGhostFull: { width: "100%", padding: "13px", background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #E1E8F0", borderRadius: 12, fontWeight: 600, fontSize: 13.5, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  btnGhostHalf2: { flex: 1, padding: "11px", background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #E1E8F0", borderRadius: 11, fontWeight: 600, fontSize: 12.5, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  btnGhostHalf3: { flex: 1, padding: "11px", background: "transparent", color: "#6B7280", border: "1px solid transparent", borderRadius: 11, fontWeight: 600, fontSize: 12.5, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  successSecondaryRow: { display: "flex", gap: 8 },

  // ===== Service summary card =====
  svcCard: { display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, marginBottom: 18, boxShadow: "0 1px 2px rgba(14,44,86,0.03)" },
  svcLeft: { flexShrink: 0 },
  svcIcon: { width: 36, height: 36, borderRadius: 10, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center" },
  svcRowTop: { display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6B7280" },
  svcId: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#9CA3AF", fontWeight: 600, letterSpacing: ".04em" },
  svcCat: { color: "#0A6BCF", fontWeight: 600, fontSize: 11 },
  svcRowMid: { fontSize: 13, color: "#0E2C56", fontWeight: 600, marginTop: 2 },
  svcBreakdown: { fontSize: 11.5, color: "#0A6BCF", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", marginTop: 4 },
  svcAmount: { textAlign: "right" },
  svcAmountVal: { fontFamily: "'Manrope', sans-serif", fontSize: 20, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em", lineHeight: 1 },
  svcAmountCurr: { fontSize: 10, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", marginTop: 2, fontWeight: 600 },
  bullet: { width: 2, height: 2, borderRadius: "50%", background: "#9CA3AF", margin: "0 2px" },

  // ===== Method list =====
  sectionLabel: { fontSize: 10, color: "#9CA3AF", letterSpacing: ".1em", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 8, paddingLeft: 2 },
  methodList: { display: "flex", flexDirection: "column", gap: 8 },
  methodCard: { display: "flex", alignItems: "center", gap: 12, padding: "14px 14px", background: "#FFFFFF", border: "1.5px solid #E1E8F0", borderRadius: 14, cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s" },
  methodCardSel: { borderColor: "#0A6BCF", boxShadow: "0 0 0 3px rgba(10,107,207,0.10), 0 1px 2px rgba(14,44,86,0.04)" },
  methodTitle: { fontSize: 13.5, color: "#0E2C56", fontWeight: 600 },
  methodSub: { fontSize: 11.5, color: "#6B7280", marginTop: 2, lineHeight: 1.35 },
  methodBadge: { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 7px", borderRadius: 999, fontSize: 9, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" },

  radio: { width: 22, height: 22, borderRadius: "50%", border: "2px solid #E1E8F0", flexShrink: 0, display: "grid", placeItems: "center" },
  radioSel: { borderColor: "#0A6BCF" },
  radioDot: { width: 10, height: 10, borderRadius: "50%", background: "#0A6BCF" },

  // ===== Brand marks =====
  brandCard: { width: 46, height: 32, borderRadius: 6, background: "linear-gradient(135deg, #1A1F71 0%, #2942AC 100%)", color: "#FFFFFF", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "4px 6px", flexShrink: 0, position: "relative" },
  brandCardChip: { width: 10, height: 7, borderRadius: 1.5, background: "linear-gradient(135deg,#F5D77B,#C9A036)" },
  brandCardLabel: { fontFamily: "'Manrope', sans-serif", fontSize: 9, fontWeight: 800, letterSpacing: ".08em", textAlign: "right", fontStyle: "italic" },

  brandPlus: { width: 46, height: 32, borderRadius: 6, background: "rgba(10,107,207,0.08)", border: "1.5px dashed rgba(10,107,207,0.30)", display: "grid", placeItems: "center", flexShrink: 0 },

  brandOxxo: { width: 46, height: 32, borderRadius: 6, background: "#D40511", color: "#FFFFFF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 2, flexShrink: 0 },
  brandOxxoText: { fontFamily: "'Manrope', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: ".02em", lineHeight: 1 },
  brandOxxoSub: { fontSize: 7.5, fontWeight: 700, opacity: 0.85, marginTop: 1, fontStyle: "italic" },

  brandMp: { width: 46, height: 32, borderRadius: 6, background: "linear-gradient(135deg,#00B1EA,#009EE3)", display: "grid", placeItems: "center", flexShrink: 0 },

  brandCash: { width: 46, height: 32, borderRadius: 6, background: "rgba(24,166,106,0.12)", border: "1px solid rgba(24,166,106,0.30)", display: "grid", placeItems: "center", flexShrink: 0 },

  // ===== Secure row =====
  secureRow: { display: "flex", alignItems: "center", gap: 6, padding: "10px 12px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 10, fontSize: 11.5, color: "#6B7280", lineHeight: 1.4, marginTop: 14 },
  secureRowBlock: { display: "flex", gap: 10, padding: "12px 14px", background: "rgba(24,166,106,0.06)", border: "1px solid rgba(24,166,106,0.25)", borderRadius: 12, marginTop: 14 },
  secureIconBig: { width: 32, height: 32, borderRadius: 9, background: "rgba(24,166,106,0.12)", display: "grid", placeItems: "center", flexShrink: 0 },

  // ===== New card form =====
  cardPreview: { position: "relative", height: 168, borderRadius: 16, background: "linear-gradient(135deg, #0E2C56 0%, #0A6BCF 60%, #0894EA 100%)", color: "#FFFFFF", padding: 18, marginBottom: 18, overflow: "hidden", boxShadow: "0 8px 22px rgba(10,107,207,0.30)" },
  cardPreviewTopRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  cardPreviewChip: { width: 36, height: 26, borderRadius: 5, background: "linear-gradient(135deg,#F5D77B,#C9A036)", border: "1px solid rgba(255,255,255,0.25)" },
  cardPreviewBrand: { display: "flex", alignItems: "center", gap: 4 },
  cardPreviewBrandDot: { width: 14, height: 14, borderRadius: "50%", background: "rgba(255,255,255,0.3)", marginLeft: -10 },
  cardPreviewNum: { display: "flex", gap: 14, fontFamily: "'JetBrains Mono', monospace", fontSize: 19, fontWeight: 600, letterSpacing: "0.04em", marginTop: 22 },
  cardPreviewBottomRow: { display: "flex", justifyContent: "space-between", marginTop: 16 },
  cardPreviewLabel: { fontSize: 8.5, opacity: 0.65, letterSpacing: ".08em", fontWeight: 600 },
  cardPreviewVal: { fontFamily: "'JetBrains Mono', monospace", fontSize: 12, marginTop: 2 },
  cardPreviewShine: { position: "absolute", inset: 0, background: "radial-gradient(circle at 85% 15%, rgba(24,193,255,0.45), transparent 50%)", pointerEvents: "none" },

  formStack: { display: "flex", flexDirection: "column", gap: 12 },
  field: { display: "flex", flexDirection: "column", flex: 1, minWidth: 0 },
  fieldLabel: { fontSize: 12, color: "#0E2C56", fontWeight: 600, marginBottom: 5, display: "flex", alignItems: "center", gap: 4 },
  tooltip: { display: "inline-flex" },
  fieldRow: { display: "flex", gap: 10 },
  inputWrap: { display: "flex", alignItems: "center", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 10, padding: "11px 12px", fontSize: 13.5 },
  detectedBrand: { fontFamily: "'Manrope', sans-serif", fontSize: 10, fontWeight: 800, color: "#1A1F71", letterSpacing: ".08em", fontStyle: "italic", background: "rgba(26,31,113,0.08)", padding: "3px 7px", borderRadius: 4 },

  toggleRow: { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12 },
  toggleOn: { width: 38, height: 22, borderRadius: 999, background: "#0A6BCF", position: "relative", flexShrink: 0 },
  toggleKnobOn: { position: "absolute", left: 18, top: 2, width: 18, height: 18, borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 1px 3px rgba(14,44,86,0.20)" },

  // ===== Processing =====
  procBody: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px", textAlign: "center", gap: 0 },
  procIconWrap: { position: "relative", width: 160, height: 160, display: "grid", placeItems: "center", marginBottom: 8 },
  procRing: { position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid rgba(10,107,207,0.18)", animation: "pg-pulse 2.4s infinite" },
  procRing2: { position: "absolute", inset: 18, borderRadius: "50%", border: "2px solid rgba(10,107,207,0.30)", animation: "pg-pulse 2.4s infinite 0.6s" },
  procCard: { position: "relative", width: 110, height: 70, borderRadius: 10, background: "linear-gradient(135deg,#0E2C56,#0A6BCF 70%,#0894EA)", padding: 12, boxShadow: "0 10px 24px rgba(10,107,207,0.40)" },
  procCardChip: { width: 22, height: 16, borderRadius: 3, background: "linear-gradient(135deg,#F5D77B,#C9A036)" },
  procCardLines: { display: "flex", flexDirection: "column", gap: 4, marginTop: 8 },
  procCardLine: { height: 4, borderRadius: 2, background: "rgba(255,255,255,0.55)", width: "85%" },

  procTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 700, color: "#0E2C56", letterSpacing: "-0.01em", marginTop: 16 },
  procSub: { fontSize: 13, color: "#6B7280", marginTop: 6, lineHeight: 1.5, maxWidth: 260 },
  procSpinnerRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 24, padding: "8px 14px", background: "rgba(10,107,207,0.10)", borderRadius: 999 },
  procSpinner: { width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(10,107,207,0.25)", borderTopColor: "#0A6BCF", animation: "pg-spin 0.9s linear infinite" },
  procStep: { fontSize: 12, color: "#0A6BCF", fontWeight: 600 },

  procSteps: { width: "100%", marginTop: 24, padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, display: "flex", flexDirection: "column", gap: 10 },
  procStepRow: { display: "flex", alignItems: "center", gap: 10, textAlign: "left" },
  procStepDot: { width: 18, height: 18, borderRadius: "50%", display: "grid", placeItems: "center", flexShrink: 0 },
  procStepLabel: { fontSize: 12.5, flex: 1 },
  procStepTime: { fontSize: 10, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
  procFootRow: { display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, color: "#6B7280", margin: "0 auto" },

  // ===== OXXO =====
  oxxoHero: { padding: 18, background: "#FFFFFF", border: "1.5px solid #E1E8F0", borderRadius: 16, marginBottom: 12, boxShadow: "0 2px 8px rgba(14,44,86,0.04)" },
  oxxoTopRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  oxxoLogoMini: { background: "#D40511", color: "#FFFFFF", padding: "4px 10px", borderRadius: 5, fontFamily: "'Manrope', sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: ".02em" },
  oxxoHoldChip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", background: "rgba(245,158,11,0.14)", color: "#B45309", borderRadius: 999, fontSize: 10, fontWeight: 700 },
  oxxoTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 700, color: "#0E2C56", letterSpacing: "-0.01em", marginTop: 14 },
  oxxoAmount: { fontFamily: "'Manrope', sans-serif", fontSize: 36, fontWeight: 800, color: "#0A6BCF", letterSpacing: "-0.02em", marginTop: 6, lineHeight: 1 },
  oxxoAmountCurr: { fontSize: 13, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, marginLeft: 2 },

  barcodeBox: { marginTop: 16, padding: "14px 16px", background: "#F8FBFF", border: "1px dashed #C9D6E4", borderRadius: 12 },
  barcodeRef: { display: "flex", gap: 10, justifyContent: "space-between", marginTop: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: "#0E2C56", letterSpacing: "0.02em" },
  barcodeLabel: { fontSize: 9, color: "#9CA3AF", letterSpacing: ".1em", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginTop: 8, textAlign: "center" },

  oxxoActions: { display: "flex", gap: 6, marginTop: 12 },
  oxxoActionPrimary: { flex: 1, padding: "10px", background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  oxxoActionSecondary: { flex: 1, padding: "10px", background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #E1E8F0", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },

  oxxoExpire: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.30)", borderRadius: 10, marginBottom: 14 },
  oxxoSteps: { padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14 },
  oxxoStepsLabel: { fontSize: 9.5, color: "#9CA3AF", letterSpacing: ".08em", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 10 },
  oxxoStepRow: { display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderTop: "1px solid #F0F4F9" },
  oxxoStepNum: { width: 24, height: 24, borderRadius: "50%", background: "rgba(10,107,207,0.10)", color: "#0A6BCF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 12, flexShrink: 0, marginTop: 1 },
  oxxoStepTitle: { fontSize: 12.5, color: "#0E2C56", fontWeight: 600 },
  oxxoStepSub: { fontSize: 10.5, color: "#9CA3AF", marginTop: 2 },

  // ===== Success =====
  successBody: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 18px 30px", textAlign: "center" },
  successIconWrap: { position: "relative", width: 130, height: 130, display: "grid", placeItems: "center", marginTop: 12 },
  successRing: { position: "absolute", inset: -20, borderRadius: "50%", border: "2px solid rgba(24,166,106,0.20)", animation: "pg-pulse 2.4s infinite" },
  successRing2: { position: "absolute", inset: -8, borderRadius: "50%", border: "2px solid rgba(24,166,106,0.40)", animation: "pg-pulse 2.4s infinite 0.5s" },
  successCircle: { width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg,#18A66A,#4ED896)", display: "grid", placeItems: "center", boxShadow: "0 14px 30px rgba(24,166,106,0.35)" },
  confetti: { position: "absolute", width: 6, height: 6, borderRadius: 1.5 },

  successTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 26, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em", marginTop: 22 },
  successSub: { fontSize: 13, color: "#6B7280", marginTop: 8, maxWidth: 280, lineHeight: 1.5 },

  receiptCard: { width: "100%", marginTop: 22, padding: 16, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, textAlign: "left", boxShadow: "0 4px 14px rgba(14,44,86,0.06)" },
  receiptCardCompact: { marginTop: 14, padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, textAlign: "left", display: "flex", flexDirection: "column", gap: 4 },
  receiptHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  receiptLabel: { fontSize: 10, color: "#9CA3AF", letterSpacing: ".08em", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  receiptAmount: { fontFamily: "'Manrope', sans-serif", fontSize: 32, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em", lineHeight: 1, marginTop: 4 },
  receiptStatus: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", background: "rgba(24,166,106,0.12)", color: "#0F8A56", borderRadius: 999, fontSize: 10, fontWeight: 700 },
  receiptDivider: { height: 1, background: "#F0F4F9", margin: "14px 0" },
  receiptRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", fontSize: 12.5 },
  receiptKey: { color: "#6B7280" },
  receiptVal: { color: "#0E2C56", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 7 },
  receiptCardMark: { background: "linear-gradient(135deg,#1A1F71,#2942AC)", color: "#FFFFFF", padding: "2px 6px", borderRadius: 4, fontFamily: "'Manrope', sans-serif", fontSize: 9, fontWeight: 800, fontStyle: "italic", letterSpacing: ".06em" },
  techMini: { width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#0A6BCF,#18C1FF)", color: "#FFFFFF", display: "grid", placeItems: "center", fontSize: 9, fontWeight: 700, fontFamily: "'Manrope', sans-serif" },
  totalCurr: { fontSize: 12, color: "#9CA3AF", fontWeight: 500, fontFamily: "'JetBrains Mono', monospace", marginLeft: 4 },

  // ===== Cash =====
  cashHero: { padding: 18, background: "linear-gradient(160deg, rgba(24,166,106,0.08), rgba(78,216,150,0.04))", border: "1px solid rgba(24,166,106,0.25)", borderRadius: 16, marginBottom: 14, textAlign: "center" },
  cashHeroTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 20, fontWeight: 700, color: "#0E2C56", letterSpacing: "-0.01em", marginTop: 6 },
  cashHeroSub: { fontSize: 12.5, color: "#6B7280", marginTop: 6, lineHeight: 1.5 },

  cashTotalCard: { padding: 16, background: "#FFFFFF", border: "1.5px solid #18A66A", borderRadius: 14, marginBottom: 12, boxShadow: "0 4px 12px rgba(24,166,106,0.10)" },
  cashAmount: { fontFamily: "'Manrope', sans-serif", fontSize: 30, fontWeight: 800, color: "#0F8A56", letterSpacing: "-0.02em", lineHeight: 1, marginTop: 4 },
  cashAmountIcon: { width: 50, height: 50, borderRadius: 12, background: "rgba(24,166,106,0.10)", display: "grid", placeItems: "center" },
  cashBreakdown: { display: "flex", alignItems: "center", gap: 4, marginTop: 12, padding: "8px 10px", background: "#F8FBFF", borderRadius: 8, fontSize: 11, color: "#6B7280" },

  bilateralCard: { padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, marginBottom: 12 },
  bilateralHead: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
  bilateralIconWrap: { width: 30, height: 30, borderRadius: 9, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  bilateralTitle: { fontSize: 13.5, color: "#0E2C56", fontWeight: 700 },
  bilateralSub: { fontSize: 11, color: "#6B7280", marginTop: 1 },

  bilateralSteps: { position: "relative" },
  bilateralStep: { display: "flex", alignItems: "center", gap: 10 },
  bilateralAvBlue: { width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#0A6BCF,#0894EA)", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 11, flexShrink: 0 },
  bilateralAvTech: { width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#0A6BCF,#18C1FF)", color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 11, flexShrink: 0 },
  bilateralStepTitle: { fontSize: 12.5, color: "#0E2C56", fontWeight: 600 },
  bilateralStepSub: { fontSize: 10.5, color: "#9CA3AF", marginTop: 2 },
  bilateralLine: { width: 2, height: 16, background: "#E1E8F0", marginLeft: 15, borderRadius: 1 },
  checkGreen: { width: 18, height: 18, borderRadius: "50%", background: "#18A66A", display: "grid", placeItems: "center", flexShrink: 0 },
  spinnerSmall: { width: 14, height: 14, borderRadius: "50%", border: "2px solid #E1E8F0", borderTopColor: "#0A6BCF", animation: "pg-spin 0.9s linear infinite", flexShrink: 0 },

  warnCard: { display: "flex", gap: 10, padding: 14, background: "rgba(245,158,11,0.08)", border: "1.5px solid rgba(245,158,11,0.40)", borderRadius: 12, marginBottom: 12 },
  warnIcon: { width: 30, height: 30, borderRadius: 9, background: "rgba(245,158,11,0.15)", display: "grid", placeItems: "center", flexShrink: 0 },
  warnTitle: { fontSize: 12.5, color: "#7B3F00", fontWeight: 700 },
  warnText: { fontSize: 11.5, color: "#7B3F00", marginTop: 4, lineHeight: 1.45 },

  // ===== Waiting + Confirmed =====
  waitHero: { padding: 18, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, marginBottom: 14, textAlign: "center" },
  waitIconWrap: { position: "relative", width: 80, height: 80, display: "grid", placeItems: "center", margin: "0 auto 12px" },
  waitRing: { position: "absolute", inset: -8, borderRadius: "50%", border: "2px solid rgba(10,107,207,0.30)", animation: "pg-pulse 2.4s infinite" },
  waitCircle: { width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#0A6BCF,#0894EA)", display: "grid", placeItems: "center", boxShadow: "0 8px 20px rgba(10,107,207,0.35)" },
  waitTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 20, fontWeight: 700, color: "#0E2C56", letterSpacing: "-0.01em" },
  waitSub: { fontSize: 13, color: "#6B7280", marginTop: 6, lineHeight: 1.5 },
  progressChip: { display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", background: "rgba(10,107,207,0.10)", color: "#0A6BCF", borderRadius: 999, fontSize: 10, fontWeight: 700 },
  liveDot: { display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#0A6BCF", boxShadow: "0 0 0 3px rgba(10,107,207,0.18)" },

  nudgeRow: { display: "flex", alignItems: "center", gap: 6, padding: "10px 12px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 10, fontSize: 11.5, color: "#6B7280", lineHeight: 1.4 },
  nudgeLink: { color: "#0A6BCF", textDecoration: "none", fontWeight: 600 },

  confirmedHero: { padding: 18, background: "linear-gradient(160deg, rgba(24,166,106,0.10), rgba(78,216,150,0.05))", border: "1.5px solid rgba(24,166,106,0.35)", borderRadius: 16, marginBottom: 14, textAlign: "center" },
  confirmedIconWrap: { position: "relative", width: 130, height: 130, display: "grid", placeItems: "center", margin: "0 auto 8px" },
  confirmedRing: { position: "absolute", inset: -16, borderRadius: "50%", border: "2px solid rgba(24,166,106,0.18)", animation: "pg-pulse 2.4s infinite" },
  confirmedRing2: { position: "absolute", inset: -2, borderRadius: "50%", border: "2px solid rgba(24,166,106,0.32)", animation: "pg-pulse 2.4s infinite 0.5s" },
  confirmedChip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", background: "rgba(24,166,106,0.12)", color: "#0F8A56", borderRadius: 999, fontSize: 10, fontWeight: 700, textTransform: "uppercase" },
};

const kf = document.createElement("style");
kf.textContent = `
  @keyframes pg-pulse { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.08); opacity: 0; } }
  @keyframes pg-spin  { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`;
document.head.appendChild(kf);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
