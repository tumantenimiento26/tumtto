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

const TECH_TONE = "linear-gradient(135deg, #0A6BCF, #18C1FF)";

// =====================================================================
// RATING META
// =====================================================================
const RATING_LABELS = [
  { stars: 1, label: "Muy mal",   color: "#DC2626", bg: "rgba(220,38,38,0.10)",  emoji: "frown",     desc: "Reportaremos esto al equipo" },
  { stars: 2, label: "Mal",       color: "#EA580C", bg: "rgba(234,88,12,0.10)",  emoji: "annoyed",   desc: "Lamentamos la experiencia" },
  { stars: 3, label: "Regular",   color: "#B45309", bg: "rgba(245,158,11,0.14)", emoji: "meh",       desc: "Cuéntanos cómo mejorar" },
  { stars: 4, label: "Bien",      color: "#0F8A56", bg: "rgba(24,166,106,0.10)", emoji: "smile",     desc: "Comparte qué te gustó" },
  { stars: 5, label: "Excelente", color: "#0F8A56", bg: "rgba(24,166,106,0.14)", emoji: "smile-plus",desc: "Ramón estará feliz" },
];

const POSITIVE_TAGS = [
  { id: "punctual",       label: "Puntual",            icon: "clock"        },
  { id: "clean",          label: "Limpio",             icon: "sparkles"     },
  { id: "knowledgeable",  label: "Conocedor",          icon: "graduation-cap" },
  { id: "friendly",       label: "Amable",             icon: "smile"        },
  { id: "fair-price",     label: "Precio justo",       icon: "tag"          },
  { id: "communicative",  label: "Buena comunicación", icon: "message-circle" },
  { id: "recommend",      label: "Recomendaría",       icon: "thumbs-up"    },
];

const NEGATIVE_TAGS = [
  { id: "late",      label: "Llegó tarde",          icon: "alarm-clock" },
  { id: "rude",      label: "Trato no profesional", icon: "frown" },
  { id: "incomplete",label: "Trabajo incompleto",   icon: "circle-slash" },
  { id: "overcharge",label: "Cobró de más",         icon: "trending-up" },
  { id: "messy",     label: "Dejó sucio",           icon: "trash-2" },
  { id: "other",     label: "Otro problema",        icon: "alert-circle" },
];

// =====================================================================
// STAR ROW
// =====================================================================
function StarRow({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <div style={r.starRow}>
      {[1, 2, 3, 4, 5].map(n => {
        const filled = n <= display;
        const isActive = n === display;
        return (
          <button
            key={n}
            style={{ ...r.starBtn, ...(isActive ? r.starBtnActive : null) }}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(n)}
            aria-label={`${n} estrella${n === 1 ? "" : "s"}`}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" style={{ filter: filled ? "drop-shadow(0 2px 6px rgba(245,158,11,0.45))" : "none" }}>
              <path
                d="M12 2.5l2.95 6.42 7.05.78-5.28 4.78 1.52 6.92L12 18.27l-6.24 3.13 1.52-6.92L2 9.7l7.05-.78L12 2.5z"
                fill={filled ? "#F59E0B" : "#FFFFFF"}
                stroke={filled ? "#F59E0B" : "#D1D9E2"}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

// =====================================================================
// SHARED PIECES
// =====================================================================
function RatingHeader({ onSkip = "Saltar" }) {
  return (
    <div style={r.header}>
      <div style={r.stepDots}>
        <span style={{ ...r.stepDot, background: "#18A66A" }} />
        <span style={{ ...r.stepDot, background: "#18A66A" }} />
        <span style={{ ...r.stepDot, background: "#0A6BCF", width: 18 }} />
      </div>
      <button style={r.skipBtn}>
        <span>{onSkip}</span>
        <Ic name="x" size={14} color="#6B7280" style={{ marginLeft: 4 }} />
      </button>
    </div>
  );
}

function TechHero({ rating }) {
  return (
    <div style={r.hero}>
      <div style={r.avWrap}>
        <div style={r.av}>
          <span>RH</span>
          <div style={r.avVerify}>
            <Ic name="check" size={13} color="#FFFFFF" stroke={3.5} />
          </div>
        </div>
        {rating > 0 && (
          <div style={{
            ...r.avStarBadge,
            background: rating >= 4 ? "linear-gradient(135deg,#18A66A,#4ED896)"
                      : rating >= 3 ? "linear-gradient(135deg,#F59E0B,#FBBF24)"
                      : "linear-gradient(135deg,#DC2626,#EA580C)",
          }}>
            <Ic name="star" size={14} color="#FFFFFF" stroke={2.4} />
            <span style={{ marginLeft: 3 }}>{rating}</span>
          </div>
        )}
      </div>
      <div style={r.heroTitle}>Califica a Ramón Hernández</div>
      <div style={r.heroSub}>Tu opinión ayuda a otros clientes a elegir mejor.</div>

      <div style={r.svcMini}>
        <div style={r.svcMiniIcon}><Ic name="wrench" size={13} color="#0A6BCF" /></div>
        <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
          <div style={r.svcMiniTitle}>Plomería · Fugas</div>
          <div style={r.svcMiniMeta}>
            <span>19/05/2026</span>
            <span style={r.bullet} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#9CA3AF" }}>#SVC-2851</span>
          </div>
        </div>
        <div style={r.svcMiniAmount}>$850</div>
      </div>
    </div>
  );
}

function RatingLabel({ rating }) {
  if (rating === 0) {
    return (
      <div style={r.ratingLabelPlaceholder}>
        Toca una estrella para calificar
      </div>
    );
  }
  const meta = RATING_LABELS[rating - 1];
  return (
    <div style={{ ...r.ratingLabel, background: meta.bg, color: meta.color }}>
      <Ic name={meta.emoji} size={16} color={meta.color} stroke={2.2} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.2 }}>
        <span style={{ fontWeight: 700 }}>{meta.label}</span>
        <span style={{ fontSize: 10.5, fontWeight: 500, opacity: 0.85 }}>{meta.desc}</span>
      </div>
    </div>
  );
}

function TagChip({ tag, selected, tone = "blue", onClick }) {
  const map = {
    blue: { sel: { bg: "#0A6BCF", color: "#FFFFFF", border: "#0A6BCF" }, unsel: { bg: "#FFFFFF", color: "#0E2C56", border: "#E1E8F0" } },
    red:  { sel: { bg: "#DC2626", color: "#FFFFFF", border: "#DC2626" }, unsel: { bg: "#FFFFFF", color: "#0E2C56", border: "#E1E8F0" } },
  };
  const v = selected ? map[tone].sel : map[tone].unsel;
  return (
    <div
      style={{
        ...r.tagChip,
        background: v.bg,
        color: v.color,
        borderColor: v.border,
        boxShadow: selected ? (tone === "red" ? "0 4px 10px rgba(220,38,38,0.25)" : "0 4px 10px rgba(10,107,207,0.25)") : "none",
      }}
      onClick={onClick}
    >
      <Ic name={tag.icon} size={13} color={v.color} stroke={2.2} />
      <span>{tag.label}</span>
      {selected && <Ic name="check" size={12} color={v.color} stroke={3} />}
    </div>
  );
}

// =====================================================================
// MAIN SCREEN (interactive)
// =====================================================================
function RatingScreen({ initialRating = 0, initialPositive = [], initialNegative = [], hideKeyboard = true, comment = "" }) {
  const [rating, setRating] = useState(initialRating);
  const [pos, setPos] = useState(new Set(initialPositive));
  const [neg, setNeg] = useState(new Set(initialNegative));
  const [text, setText] = useState(comment);
  const [favOn, setFavOn] = useState(false);

  const togglePos = (id) => {
    const next = new Set(pos);
    if (next.has(id)) next.delete(id); else next.add(id);
    setPos(next);
  };
  const toggleNeg = (id) => {
    const next = new Set(neg);
    if (next.has(id)) next.delete(id); else next.add(id);
    setNeg(next);
  };

  const showPositive = rating >= 4;
  const showNegative = rating > 0 && rating <= 2;
  const showMidPositive = rating === 3;

  return (
    <div style={r.wrap}>
      <RatingHeader />

      <div style={r.body}>
        <TechHero rating={rating} />

        {/* Stars */}
        <div style={r.starsSection}>
          <StarRow value={rating} onChange={setRating} />
          <RatingLabel rating={rating} />
        </div>

        {/* Positive tags */}
        {showPositive && (
          <div style={r.tagsSection}>
            <div style={r.tagsHead}>
              <div>
                <div style={r.tagsTitle}>¿Qué te gustó?</div>
                <div style={r.tagsSub}>Selecciona las que apliquen · {pos.size} elegidas</div>
              </div>
              <div style={r.tagsBadge}>+ visibilidad</div>
            </div>
            <div style={r.chipsWrap}>
              {POSITIVE_TAGS.map(t => (
                <TagChip key={t.id} tag={t} tone="blue" selected={pos.has(t.id)} onClick={() => togglePos(t.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Mid (3 stars) — show both */}
        {showMidPositive && (
          <div style={r.tagsSection}>
            <div style={r.tagsHead}>
              <div>
                <div style={r.tagsTitle}>¿Qué podría mejorar?</div>
                <div style={r.tagsSub}>Tu feedback es anónimo</div>
              </div>
            </div>
            <div style={r.chipsWrap}>
              {NEGATIVE_TAGS.slice(0, 4).map(t => (
                <TagChip key={t.id} tag={t} tone="blue" selected={neg.has(t.id)} onClick={() => toggleNeg(t.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Negative tags */}
        {showNegative && (
          <div style={r.tagsSection}>
            <div style={r.tagsHead}>
              <div>
                <div style={{ ...r.tagsTitle, color: "#DC2626" }}>¿Qué salió mal?</div>
                <div style={r.tagsSub}>Tu reporte nos ayuda a actuar</div>
              </div>
              <div style={{ ...r.tagsBadge, background: "rgba(220,38,38,0.10)", color: "#DC2626" }}>
                <Ic name="shield" size={9} color="#DC2626" />
                <span>privado</span>
              </div>
            </div>
            <div style={r.chipsWrap}>
              {NEGATIVE_TAGS.map(t => (
                <TagChip key={t.id} tag={t} tone="red" selected={neg.has(t.id)} onClick={() => toggleNeg(t.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Comment */}
        {rating > 0 && (
          <div style={r.commentSection}>
            <div style={r.commentHead}>
              <div style={r.commentTitle}>Comparte tu experiencia</div>
              <span style={r.optional}>opcional</span>
            </div>
            <div style={r.commentBox}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 500))}
                style={r.commentTextarea}
                placeholder="Cuenta cómo fue tu experiencia con Ramón. Tu reseña será pública pero solo se verá tu nombre y foto."
                rows={5}
              />
              <div style={r.commentFoot}>
                <span style={r.commentPrivacyRow}>
                  <Ic name="eye" size={10} color="#9CA3AF" />
                  <span>Visible públicamente · solo tu nombre y foto</span>
                </span>
                <span style={{ ...r.commentCount, color: text.length > 450 ? "#B45309" : "#9CA3AF" }}>
                  {text.length}/500
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Extras */}
        {rating > 0 && (
          <div style={r.extrasSection}>
            <div style={r.extraRow} onClick={() => setFavOn(v => !v)}>
              <div style={{ ...r.extraIcon, background: favOn ? "rgba(220,38,38,0.10)" : "rgba(14,44,86,0.05)" }}>
                <Ic name="heart" size={15} color={favOn ? "#DC2626" : "#9CA3AF"} stroke={2.2} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={r.extraTitle}>Agregar a favoritos</div>
                <div style={r.extraSub}>Llama a Ramón con un toque para futuros servicios</div>
              </div>
              <div style={{ ...r.toggle, ...(favOn ? r.toggleOn : null) }}>
                <div style={{ ...r.toggleKnob, ...(favOn ? r.toggleKnobOn : null) }} />
              </div>
            </div>

            <div style={{ ...r.extraRow, opacity: 0.6 }}>
              <div style={{ ...r.extraIcon, background: "rgba(14,44,86,0.05)" }}>
                <Ic name="file-text" size={15} color="#9CA3AF" stroke={2.2} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={r.extraTitle}>
                  Solicitar factura electrónica
                  <span style={r.soonChip}>PRÓXIMAMENTE</span>
                </div>
                <div style={r.extraSub}>Te avisaremos cuando esté disponible</div>
              </div>
              <div style={{ ...r.toggle, opacity: 0.5 }}>
                <div style={r.toggleKnob} />
              </div>
            </div>
          </div>
        )}

        {/* Report option */}
        {rating > 0 && (
          <button style={r.reportLink}>
            <Ic name="flag" size={12} color="#6B7280" style={{ marginRight: 6 }} />
            Reportar problema en lugar de calificar
            <Ic name="chevron-right" size={12} color="#9CA3AF" style={{ marginLeft: 4 }} />
          </button>
        )}
      </div>

      <div style={r.footer}>
        <button style={{
          ...r.submitBtn,
          ...(rating === 0 ? r.submitBtnDisabled : null),
        }}>
          {rating === 0 ? (
            <>
              <Ic name="star" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
              <span>Elige una calificación</span>
            </>
          ) : (
            <>
              <Ic name="send" size={15} color="#FFFFFF" style={{ marginRight: 8 }} />
              <span>Enviar calificación</span>
              <span style={r.submitStars}>
                {[...Array(rating)].map((_, n) => (
                  <Ic key={n} name="star" size={11} color="#F59E0B" />
                ))}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// THANK YOU SCREEN
// =====================================================================
function ThankYouScreen() {
  return (
    <div style={r.wrap}>
      <div style={r.thanksBg}>
        {/* Confetti */}
        {[
          { top: 60, left: 30,  c: "#F59E0B" },
          { top: 100, left: 320, c: "#0A6BCF" },
          { top: 160, left: 60,  c: "#18C1FF" },
          { top: 130, left: 280, c: "#18A66A" },
          { top: 210, left: 340, c: "#FBBF24" },
          { top: 200, left: 20,  c: "#0894EA" },
          { top: 260, left: 360, c: "#4ED896" },
          { top: 290, left: 10,  c: "#F59E0B" },
        ].map((c, idx) => (
          <div key={idx} style={{ position: "absolute", width: 7, height: 7, borderRadius: 1.5, background: c.c, top: c.top, left: c.left, transform: `rotate(${idx * 23}deg)`, opacity: 0.85 }} />
        ))}
      </div>

      <div style={r.thanksBody}>
        {/* Big success */}
        <div style={r.thanksIconWrap}>
          <div style={r.thanksRing1} />
          <div style={r.thanksRing2} />
          <div style={r.thanksCircle}>
            <Ic name="check" size={56} color="#FFFFFF" stroke={3.2} />
          </div>
        </div>

        <div style={r.thanksTitle}>¡Gracias por tu calificación!</div>
        <div style={r.thanksSub}>Tu opinión ayuda a Ramón y a otros clientes en la zona.</div>

        {/* Rating receipt */}
        <div style={r.thanksReview}>
          <div style={r.thanksReviewLeft}>
            <div style={r.thanksReviewAv}>
              <span>RH</span>
            </div>
            <div>
              <div style={r.thanksReviewName}>Ramón Hernández</div>
              <div style={r.thanksReviewSvc}>Plomería · #SVC-2851</div>
            </div>
          </div>
          <div style={r.thanksReviewStars}>
            {[1,2,3,4,5].map(n => (
              <svg key={n} width="14" height="14" viewBox="0 0 24 24">
                <path d="M12 2.5l2.95 6.42 7.05.78-5.28 4.78 1.52 6.92L12 18.27l-6.24 3.13 1.52-6.92L2 9.7l7.05-.78L12 2.5z" fill="#F59E0B" />
              </svg>
            ))}
          </div>
        </div>

        {/* Next step card */}
        <div style={r.nextCard}>
          <div style={r.nextHead}>
            <div style={r.nextIcon}><Ic name="compass" size={15} color="#0A6BCF" /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={r.nextLabel}>SIGUIENTE PASO</div>
              <div style={r.nextTitle}>¿Necesitas otro servicio?</div>
            </div>
          </div>
          <div style={r.nextSub}>Explora más técnicos verificados en Zapopan y Guadalajara.</div>
          <div style={r.nextCategoriesRow}>
            <div style={r.nextCatChip}><Ic name="zap" size={11} color="#0A6BCF" /><span>Electricidad</span></div>
            <div style={r.nextCatChip}><Ic name="flame" size={11} color="#B45309" /><span>Gas</span></div>
            <div style={r.nextCatChip}><Ic name="paint-roller" size={11} color="#0F8A56" /><span>Pintura</span></div>
            <div style={r.nextCatChip}><Ic name="shield" size={11} color="#0884B0" /><span>Imperm.</span></div>
          </div>
        </div>

        {/* Referral */}
        <div style={r.referCard}>
          <div style={r.referIcon}>
            <Ic name="gift" size={18} color="#FFFFFF" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={r.referTitle}>Comparte y gana <b style={{ color: "#0A6BCF", fontWeight: 800 }}>$100 MXN</b></div>
            <div style={r.referSub}>Cada amigo recibe $100 al agendar su primer servicio.</div>
          </div>
        </div>
      </div>

      <div style={r.footerStack}>
        <button style={r.submitBtn}>
          <Ic name="home" size={15} color="#FFFFFF" style={{ marginRight: 8 }} />
          Volver al inicio
        </button>
        <button style={r.ghostBtn}>
          <Ic name="share-2" size={14} color="#0A6BCF" style={{ marginRight: 8 }} />
          Compartir Tumantenimiento con un amigo
        </button>
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
      <DCSection id="entry" title="Calificación · estados iniciales" subtitle="Sin selección y con 5★ — caso feliz">
        <DCArtboard id="empty" label="01 · Sin calificar (entrada)" width={438} height={892}>
          <PhoneFrame><RatingScreen /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="five" label="02 · 5★ Excelente + tags positivos" width={438} height={892}>
          <PhoneFrame>
            <RatingScreen
              initialRating={5}
              initialPositive={["punctual", "knowledgeable", "fair-price", "communicative"]}
              comment="Ramón fue puntual, súper profesional y me explicó todo lo que iba a hacer antes de empezar. La fuga quedó perfecta y el precio fue justo. 100% recomendado."
            />
          </PhoneFrame>
        </DCArtboard>
      </DCSection>

      <DCSection id="other" title="Otros ratings + flujo negativo" subtitle="3★ regular y 1★ muy mal">
        <DCArtboard id="three" label="03 · 3★ Regular (mid)" width={438} height={892}>
          <PhoneFrame>
            <RatingScreen
              initialRating={3}
              initialNegative={["late"]}
              comment="Llegó un poco tarde pero el trabajo quedó bien."
            />
          </PhoneFrame>
        </DCArtboard>
        <DCArtboard id="one" label="04 · 1★ Muy mal + reporte" width={438} height={892}>
          <PhoneFrame>
            <RatingScreen
              initialRating={1}
              initialNegative={["late", "incomplete", "overcharge"]}
            />
          </PhoneFrame>
        </DCArtboard>
      </DCSection>

      <DCSection id="thanks" title="Pantalla de agradecimiento" subtitle="Cierre del flujo">
        <DCArtboard id="thanks1" label="05 · ¡Gracias por tu calificación!" width={438} height={892}>
          <PhoneFrame><ThankYouScreen /></PhoneFrame>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// =====================================================================
// STYLES
// =====================================================================
const r = {
  wrap: { width: "100%", height: "100%", background: "#F8FBFF", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" },

  // ===== Header =====
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "52px 16px 12px", background: "#FFFFFF", borderBottom: "1px solid #F0F4F9", flexShrink: 0 },
  stepDots: { display: "flex", gap: 4, alignItems: "center" },
  stepDot: { width: 6, height: 6, borderRadius: 999, background: "#E1E8F0", transition: "width 0.2s" },
  skipBtn: { display: "inline-flex", alignItems: "center", padding: "8px 12px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 999, color: "#6B7280", fontSize: 12.5, fontWeight: 600, cursor: "pointer" },

  // ===== Body / Footer =====
  body: { flex: 1, overflowY: "auto", padding: "18px 16px 110px" },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, background: "#FFFFFF", borderTop: "1px solid #E1E8F0", padding: "14px 16px 30px", display: "flex", gap: 10, alignItems: "center", boxShadow: "0 -4px 12px rgba(14,44,86,0.06)", zIndex: 5 },
  footerStack: { position: "absolute", left: 0, right: 0, bottom: 0, background: "#FFFFFF", borderTop: "1px solid #E1E8F0", padding: "14px 16px 30px", display: "flex", flexDirection: "column", gap: 8, boxShadow: "0 -4px 12px rgba(14,44,86,0.06)", zIndex: 5 },
  submitBtn: { width: "100%", height: 54, background: "#0A6BCF", color: "#FFFFFF", border: "none", borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(10,107,207,0.30)" },
  submitBtnDisabled: { background: "#EEF3F8", color: "#9CA3AF", boxShadow: "none", cursor: "not-allowed" },
  submitStars: { display: "inline-flex", gap: 1, marginLeft: 10, padding: "3px 8px", background: "rgba(255,255,255,0.18)", borderRadius: 999 },
  ghostBtn: { padding: "12px", background: "#FFFFFF", color: "#0A6BCF", border: "1px solid #E1E8F0", borderRadius: 12, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },

  // ===== Hero =====
  hero: { textAlign: "center", marginBottom: 22 },
  avWrap: { position: "relative", width: 110, height: 110, margin: "0 auto 14px" },
  av: { position: "relative", width: 110, height: 110, borderRadius: "50%", background: TECH_TONE, color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 36, letterSpacing: "-0.02em", boxShadow: "0 12px 28px rgba(10,107,207,0.30)" },
  avVerify: { position: "absolute", right: 4, bottom: 4, width: 24, height: 24, borderRadius: "50%", background: "#18A66A", border: "3px solid #FFFFFF", display: "grid", placeItems: "center" },
  avStarBadge: { position: "absolute", left: "50%", bottom: -10, transform: "translateX(-50%)", display: "inline-flex", alignItems: "center", padding: "5px 11px", borderRadius: 999, color: "#FFFFFF", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 13, boxShadow: "0 6px 14px rgba(14,44,86,0.20)", border: "2.5px solid #FFFFFF" },

  heroTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 23, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em", marginTop: 8 },
  heroSub: { fontSize: 13.5, color: "#6B7280", marginTop: 6, lineHeight: 1.5, maxWidth: 300, marginLeft: "auto", marginRight: "auto" },

  svcMini: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 12, marginTop: 16, textAlign: "left" },
  svcMiniIcon: { width: 30, height: 30, borderRadius: 8, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  svcMiniTitle: { fontSize: 13, fontWeight: 700, color: "#0E2C56" },
  svcMiniMeta: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6B7280", marginTop: 2 },
  svcMiniAmount: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 16, color: "#0E2C56", letterSpacing: "-0.01em" },
  bullet: { width: 2, height: 2, borderRadius: "50%", background: "#9CA3AF", margin: "0 2px" },

  // ===== Stars section =====
  starsSection: { padding: "20px 16px", background: "#FFFFFF", border: "1.5px solid #E1E8F0", borderRadius: 18, marginBottom: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, boxShadow: "0 4px 14px rgba(14,44,86,0.04)" },
  starRow: { display: "flex", gap: 4, alignItems: "center", justifyContent: "center" },
  starBtn: { width: 56, height: 56, padding: 0, background: "transparent", border: "none", cursor: "pointer", display: "grid", placeItems: "center", transition: "transform 0.12s ease" },
  starBtnActive: { transform: "scale(1.12)" },
  ratingLabel: { display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700 },
  ratingLabelPlaceholder: { fontSize: 12, color: "#9CA3AF", fontWeight: 500, padding: "8px 14px" },

  // ===== Tags section =====
  tagsSection: { padding: 16, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 16, marginBottom: 12 },
  tagsHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  tagsTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 15, fontWeight: 700, color: "#0E2C56", letterSpacing: "-0.01em" },
  tagsSub: { fontSize: 11.5, color: "#6B7280", marginTop: 2 },
  tagsBadge: { display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 8px", borderRadius: 999, background: "rgba(24,166,106,0.12)", color: "#0F8A56", fontSize: 9.5, fontWeight: 700, letterSpacing: ".02em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 },
  chipsWrap: { display: "flex", flexWrap: "wrap", gap: 6 },
  tagChip: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 999, border: "1.5px solid", fontSize: 12.5, fontWeight: 600, cursor: "pointer", transition: "all 0.12s ease" },

  // ===== Comment =====
  commentSection: { marginBottom: 12 },
  commentHead: { display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8, padding: "0 2px" },
  commentTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 15, fontWeight: 700, color: "#0E2C56", letterSpacing: "-0.01em" },
  optional: { fontSize: 10.5, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", fontFamily: "'JetBrains Mono', monospace" },
  commentBox: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, padding: "12px 14px" },
  commentTextarea: { width: "100%", minHeight: 100, border: "none", outline: "none", resize: "none", background: "transparent", fontSize: 13, color: "#0E2C56", fontFamily: "'Inter', sans-serif", lineHeight: 1.5 },
  commentFoot: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, marginTop: 8, borderTop: "1px solid #F0F4F9" },
  commentPrivacyRow: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, color: "#9CA3AF" },
  commentCount: { fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },

  // ===== Extras =====
  extrasSection: { background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, marginBottom: 12, overflow: "hidden" },
  extraRow: { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderBottom: "1px solid #F0F4F9", cursor: "pointer" },
  extraIcon: { width: 32, height: 32, borderRadius: 9, display: "grid", placeItems: "center", flexShrink: 0 },
  extraTitle: { fontSize: 13, fontWeight: 600, color: "#0E2C56", display: "flex", alignItems: "center", gap: 6 },
  extraSub: { fontSize: 11, color: "#6B7280", marginTop: 2, lineHeight: 1.4 },
  soonChip: { padding: "1px 6px", background: "rgba(245,158,11,0.14)", color: "#B45309", borderRadius: 4, fontSize: 8.5, fontWeight: 700, letterSpacing: ".06em", fontFamily: "'JetBrains Mono', monospace" },

  toggle: { width: 38, height: 22, borderRadius: 999, background: "#E1E8F0", position: "relative", flexShrink: 0, transition: "background 0.15s" },
  toggleOn: { background: "#0A6BCF" },
  toggleKnob: { position: "absolute", left: 2, top: 2, width: 18, height: 18, borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 1px 3px rgba(14,44,86,0.20)", transition: "left 0.15s" },
  toggleKnobOn: { left: 18 },

  reportLink: { width: "100%", padding: "12px", background: "transparent", color: "#6B7280", border: "none", fontSize: 12, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "underline", textUnderlineOffset: 3, textDecorationColor: "#E1E8F0" },

  // =====================================================================
  // THANK YOU
  // =====================================================================
  thanksBg: { position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 12%, #E8F2FC 0%, #F8FBFF 60%)", pointerEvents: "none" },
  thanksBody: { position: "relative", flex: 1, padding: "70px 24px 130px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", overflowY: "auto" },

  thanksIconWrap: { position: "relative", width: 140, height: 140, display: "grid", placeItems: "center", marginBottom: 8 },
  thanksRing1: { position: "absolute", inset: -16, borderRadius: "50%", border: "2px solid rgba(24,166,106,0.20)" },
  thanksRing2: { position: "absolute", inset: -32, borderRadius: "50%", border: "2px solid rgba(24,166,106,0.10)" },
  thanksCircle: { width: 116, height: 116, borderRadius: "50%", background: "linear-gradient(135deg,#18A66A,#4ED896)", display: "grid", placeItems: "center", boxShadow: "0 16px 36px rgba(24,166,106,0.40)" },

  thanksTitle: { fontFamily: "'Manrope', sans-serif", fontSize: 26, fontWeight: 800, color: "#0E2C56", letterSpacing: "-0.02em", marginTop: 22, maxWidth: 280 },
  thanksSub: { fontSize: 13.5, color: "#6B7280", marginTop: 8, lineHeight: 1.5, maxWidth: 300 },

  thanksReview: { width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, marginTop: 22, boxShadow: "0 4px 14px rgba(14,44,86,0.06)" },
  thanksReviewLeft: { display: "flex", alignItems: "center", gap: 10, textAlign: "left" },
  thanksReviewAv: { width: 38, height: 38, borderRadius: "50%", background: TECH_TONE, color: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 13 },
  thanksReviewName: { fontSize: 13, fontWeight: 700, color: "#0E2C56" },
  thanksReviewSvc: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  thanksReviewStars: { display: "inline-flex", gap: 1 },

  nextCard: { width: "100%", padding: 14, background: "#FFFFFF", border: "1px solid #E1E8F0", borderRadius: 14, marginTop: 12, textAlign: "left" },
  nextHead: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 },
  nextIcon: { width: 32, height: 32, borderRadius: 9, background: "rgba(10,107,207,0.10)", display: "grid", placeItems: "center", flexShrink: 0 },
  nextLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#0A6BCF", letterSpacing: ".08em", fontWeight: 700 },
  nextTitle: { fontSize: 14, fontWeight: 700, color: "#0E2C56", marginTop: 2 },
  nextSub: { fontSize: 11.5, color: "#6B7280", lineHeight: 1.4, marginBottom: 10 },
  nextCategoriesRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  nextCatChip: { display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px", background: "#F8FBFF", border: "1px solid #E1E8F0", borderRadius: 999, fontSize: 11.5, color: "#0E2C56", fontWeight: 600 },

  referCard: { width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "linear-gradient(135deg, rgba(10,107,207,0.08), rgba(24,193,255,0.05))", border: "1.5px dashed rgba(10,107,207,0.30)", borderRadius: 14, marginTop: 12, textAlign: "left" },
  referIcon: { width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#0A6BCF,#0894EA)", display: "grid", placeItems: "center", flexShrink: 0 },
  referTitle: { fontSize: 13, color: "#0E2C56", fontWeight: 600 },
  referSub: { fontSize: 11, color: "#6B7280", marginTop: 2, lineHeight: 1.4 },
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
