'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AppWindow,
  Check,
  CreditCard,
  Droplet,
  Droplets,
  FileText,
  Flame,
  Home,
  IdCard,
  MessageSquare,
  Navigation,
  Paintbrush,
  Phone as PhoneIcon,
  User,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { money } from '@/lib/landing';
import { Container, H2, Kicker, Lead } from './bits';
import { Phone, STEP_SCREENS } from './phone';
import { scrollToId, useInViewOnce } from './hooks';

/* ── Categorías: pestañas + panel que rota cada 5 s ── */
type Cat = {
  name: string;
  icon: LucideIcon;
  desc: string;
  from: string;
  subs: [string, number, number][];
  techs: string;
  eta: string;
  rating: string;
  aura: string;
  /** Foto de trabajo en /public/landing/categorias; sin ella queda el rayado. */
  img?: string;
  /** object-position para fotos verticales (por defecto centrado). */
  imgPos?: string;
};
const CATS: Cat[] = [
  {
    name: 'Plomería',
    icon: Droplet,
    desc: 'Fugas, calentadores, drenaje y sanitarios. La especialidad con más técnicos en la red.',
    from: '$300',
    subs: [
      ['Fugas de agua', 300, 1500],
      ['Calentadores', 400, 2500],
      ['Drenaje de cocina', 350, 1200],
      ['Instalación de WC', 500, 1800],
    ],
    techs: '48',
    eta: '24 min',
    rating: '4.8',
    aura: 'rgba(10,107,207,0.35)',
    img: '/landing/categorias/plomeria.jpg',
  },
  {
    name: 'Electricidad',
    icon: Zap,
    desc: 'Contactos, apagadores, lámparas y tableros, con técnicos que revisan la instalación completa.',
    from: '$200',
    subs: [
      ['Contactos y apagadores', 200, 1200],
      ['Instalación de lámparas', 250, 1400],
      ['Tableros eléctricos', 600, 3500],
      ['Cortos circuitos', 300, 1500],
    ],
    techs: '39',
    eta: '27 min',
    rating: '4.7',
    aura: 'rgba(245,185,74,0.25)',
    img: '/landing/categorias/electricidad.jpg',
  },
  {
    name: 'Gas',
    icon: Flame,
    desc: 'Regulador, revisión de instalación y fugas. Solo técnicos con certificación de gas LP vigente.',
    from: '$300',
    subs: [
      ['Cambio de regulador', 300, 1500],
      ['Revisión de instalación', 350, 1200],
      ['Fugas de gas', 400, 2000],
    ],
    techs: '17',
    eta: '22 min',
    rating: '4.9',
    aura: 'rgba(248,113,113,0.25)',
    img: '/landing/categorias/gas.jpg',
  },
  {
    name: 'Herrería',
    icon: Wrench,
    desc: 'Puertas, portones, rejas y soldadura a domicilio.',
    from: '$600',
    subs: [
      ['Puertas y portones', 600, 5000],
      ['Rejas y protecciones', 800, 4500],
      ['Soldadura', 400, 2000],
    ],
    techs: '12',
    eta: '35 min',
    rating: '4.7',
    aura: 'rgba(143,160,184,0.28)',
    img: '/landing/categorias/herreria.jpg',
  },
  {
    name: 'Pintura',
    icon: Paintbrush,
    desc: 'Pintura interior por habitación o casa completa, con materiales cotizados antes de empezar.',
    from: '$500',
    subs: [
      ['Una habitación', 500, 2500],
      ['Casa completa', 3500, 15000],
      ['Impermeabilización', 1200, 6000],
    ],
    techs: '21',
    eta: '1 día',
    rating: '4.6',
    aura: 'rgba(95,211,155,0.22)',
    img: '/landing/categorias/pintura.jpg',
    imgPos: '50% 70%',
  },
  {
    name: 'Cristales',
    icon: AppWindow,
    desc: 'Ventanas residenciales, reposición de vidrios y canceles de baño.',
    from: '$350',
    subs: [
      ['Ventanas residenciales', 350, 2200],
      ['Reposición de vidrio', 300, 1500],
      ['Canceles de baño', 900, 4500],
    ],
    techs: '9',
    eta: '40 min',
    rating: '4.7',
    aura: 'rgba(24,193,255,0.3)',
  },
  {
    name: 'Drenaje',
    icon: Droplets,
    desc: 'Destape de drenaje en cocina, baños y registros.',
    from: '$350',
    subs: [
      ['Destape de cocina', 350, 1200],
      ['Destape de baño', 350, 1500],
      ['Registro y coladera', 600, 2500],
    ],
    techs: '14',
    eta: '30 min',
    rating: '4.8',
    aura: 'rgba(10,107,207,0.35)',
  },
];

export function Categories({ reduced }: { reduced: boolean }) {
  const [cat, setCat] = useState(0);
  const [auto, setAuto] = useState(true);
  const hover = useRef(false);
  const box = useRef<HTMLDivElement>(null);
  const tabs = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auto || reduced) return;
    const t = setInterval(() => {
      const r = box.current?.getBoundingClientRect();
      if (hover.current || !r || r.bottom < 0 || r.top > window.innerHeight)
        return;
      setCat(c => (c + 1) % CATS.length);
    }, 5000);
    return () => clearInterval(t);
  }, [auto, reduced]);

  // En móvil las pestañas son una fila con scroll: mantener visible la activa.
  useEffect(() => {
    const list = tabs.current;
    const tab = list?.children[cat] as HTMLElement | undefined;
    if (list && tab && list.scrollWidth > list.clientWidth + 2)
      list.scrollTo({ left: Math.max(0, tab.offsetLeft - 14), behavior: 'smooth' });
  }, [cat]);

  const c = CATS[cat];
  const allMax = Math.max(...c.subs.map(s => s[2]));

  return (
    <section id="servicios" className="relative scroll-mt-16">
      <Container className="py-28 max-sm:py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[640px]">
            <Kicker>Categorías de servicio</Kicker>
            <H2>Un técnico para cada problema</H2>
            <Lead>
              Siete especialidades con rangos de precio publicados. La
              cotización final siempre la confirma tu técnico antes de empezar.
            </Lead>
          </div>
          <div data-reveal="0.15" className="flex gap-[22px]">
            {[
              ['7', 'ESPECIALIDADES'],
              ['23', 'SERVICIOS'],
              ['160', 'TÉCNICOS'],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="font-display text-[28px] font-extrabold text-white">
                  {v}
                </div>
                <div className="font-mono text-[10.5px] tracking-[0.12em] text-lp-muted">
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          ref={box}
          data-reveal="0"
          onMouseEnter={() => (hover.current = true)}
          onMouseLeave={() => (hover.current = false)}
          className="relative flex flex-wrap overflow-hidden rounded-[20px] border border-[rgba(90,176,255,0.16)] bg-[rgba(8,24,50,0.6)] backdrop-blur-[12px]"
        >
          <span className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 border-l-2 border-t-2 border-[rgba(24,193,255,0.6)]" />
          <span className="pointer-events-none absolute bottom-3.5 right-3.5 h-4 w-4 border-b-2 border-r-2 border-[rgba(24,193,255,0.6)]" />

          <div
            ref={tabs}
            role="tablist"
            aria-label="Categorías"
            className="flex min-w-0 flex-[1_1_300px] gap-1 overflow-x-auto border-b border-[rgba(90,176,255,0.12)] p-3.5 [scrollbar-width:none] max-[979px]:max-w-full min-[980px]:max-w-[320px] min-[980px]:flex-col min-[980px]:border-b-0 min-[980px]:border-r"
          >
            {CATS.map((k, i) => {
              const on = i === cat;
              return (
                <button
                  key={k.name}
                  role="tab"
                  aria-selected={on}
                  onClick={() => {
                    setCat(i);
                    setAuto(false);
                  }}
                  className={`relative flex flex-shrink-0 items-center gap-3.5 overflow-hidden rounded-box border px-3.5 py-3 text-left text-lp-text transition-[background,border-color] duration-[250ms] hover:bg-white/[0.05] max-[979px]:min-w-[220px] ${
                    on
                      ? 'border-[rgba(24,193,255,0.35)] bg-[rgba(10,107,207,0.16)]'
                      : 'border-transparent'
                  }`}
                >
                  <span
                    className={`flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[11px] transition-colors duration-[250ms] ${
                      on
                        ? 'bg-[var(--lp-blue)] text-white'
                        : 'bg-white/[0.05] text-lp-muted'
                    }`}
                  >
                    <k.icon size={21} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[15px] font-bold">
                      {k.name}
                    </span>
                    <span
                      className={`mt-0.5 block font-mono text-[11px] ${
                        on ? 'text-[var(--lp-cyan)]' : 'text-[var(--lp-dim)]'
                      }`}
                    >
                      DESDE {k.from}
                    </span>
                  </span>
                  <span
                    className={`font-mono text-[11px] ${
                      on ? 'text-[var(--lp-cyan)]' : 'text-[var(--lp-coord)]'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {on && auto && !reduced && (
                    <span className="absolute bottom-0 left-0 h-0.5 w-full origin-left animate-[lp-catbar_5s_linear_both] bg-[var(--lp-cyan)]" />
                  )}
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            aria-label={c.name}
            className="relative min-w-0 flex-[3_1_520px] p-[clamp(22px,3vw,36px)]"
          >
            <div
              className="pointer-events-none absolute -right-20 -top-[120px] h-[420px] w-[420px] rounded-full transition-[background] duration-500"
              style={{
                background: `radial-gradient(circle, ${c.aura}, transparent 65%)`,
              }}
            />
            <div
              key={cat}
              className="relative flex animate-[lp-catin_.5s_var(--lp-ease)_both] flex-wrap gap-7"
            >
              <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-[18px]">
                <div className="flex items-center gap-3.5">
                  <span className="relative flex h-16 w-16 items-center justify-center rounded-[16px] border border-[rgba(24,193,255,0.3)] bg-[rgba(24,193,255,0.12)] text-[var(--lp-cyan)]">
                    <c.icon size={30} />
                    <span className="absolute -inset-1.5 animate-[lp-spin_24s_linear_infinite] rounded-[20px] border border-dashed border-[rgba(24,193,255,0.3)]" />
                  </span>
                  <div>
                    <div className="font-mono text-[11px] tracking-[0.14em] text-[var(--lp-cyan)]">
                      CATEGORÍA {String(cat + 1).padStart(2, '0')} / 07
                    </div>
                    <div className="font-display text-[32px] font-extrabold leading-[1.1] tracking-[-0.8px] text-white">
                      {c.name}
                    </div>
                  </div>
                </div>
                <p className="text-[16px] leading-[1.6] text-[var(--lp-soft)]">
                  {c.desc}
                </p>
                <div className="flex flex-col overflow-hidden rounded-box border border-lp-line">
                  <div className="flex justify-between bg-white/[0.03] px-3.5 py-2.5 font-mono text-[10.5px] tracking-[0.12em] text-[var(--lp-dim)]">
                    <span>SERVICIO</span>
                    <span>RANGO MXN</span>
                  </div>
                  {c.subs.map(([t, a, b], i) => (
                    <div
                      key={t}
                      className="flex animate-[lp-catrow_.45s_ease_both] items-center gap-3 border-t border-[rgba(90,176,255,0.1)] px-3.5 py-3 transition-colors hover:bg-[rgba(24,193,255,0.06)]"
                      style={{ animationDelay: `${i * 0.06}s` }}
                    >
                      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--lp-cyan)]" />
                      <span className="flex-1 text-[14.5px] font-medium text-lp-text">
                        {t}
                      </span>
                      <span className="h-1 w-[90px] flex-shrink-0 overflow-hidden rounded-full bg-white/[0.08] max-sm:hidden">
                        <span
                          className="block h-full rounded-full bg-[var(--lp-blue)]"
                          style={{
                            marginLeft: `${(a / allMax) * 100}%`,
                            width: `${Math.max(((b - a) / allMax) * 100, 6)}%`,
                          }}
                        />
                      </span>
                      <span className="whitespace-nowrap font-mono text-[13px] font-semibold text-[var(--lp-link)]">
                        {money(a)} – {money(b)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="inline-flex h-[50px] items-center gap-2.5 rounded-btn bg-[var(--lp-blue)] px-[22px] font-display text-[15px] font-bold text-white transition-[background,transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:bg-[var(--lp-blue-hover)] hover:shadow-[0_16px_30px_-12px_rgba(10,107,207,0.7)]"
                  >
                    Solicitar {c.name.toLowerCase()}
                  </button>
                  <button
                    onClick={() => scrollToId('precios')}
                    className="h-[50px] rounded-btn border border-white/[0.18] px-[18px] font-display text-[15px] font-bold text-white hover:bg-white/[0.06]"
                  >
                    Estimar precio
                  </button>
                </div>
              </div>
              <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-3">
                {/* ponytail: fotos estáticas por categoría; las que faltan quedan con el rayado. */}
                <div className="lp-stripes relative min-h-[240px] flex-1 overflow-hidden rounded-[14px] border border-[rgba(90,176,255,0.16)]">
                  {c.img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.img}
                      alt={`Técnico de ${c.name.toLowerCase()} trabajando`}
                      className="absolute inset-0 h-full w-full object-cover"
                      style={{ objectPosition: c.imgPos }}
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] text-lp-muted">
                      Foto de trabajo · {c.name.toLowerCase()}
                    </span>
                  )}
                  <span className="pointer-events-none absolute left-3 top-3 rounded-md bg-[rgba(5,15,34,0.75)] px-2 py-[3px] font-mono text-[10px] tracking-[0.12em] text-[var(--lp-ok)]">
                    TRABAJO REAL · {c.name.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    [c.techs, 'TÉCNICOS'],
                    [c.eta, 'LLEGADA MEDIA'],
                    [`${c.rating} ★`, 'CALIFICACIÓN'],
                  ].map(([v, l]) => (
                    <div
                      key={l}
                      className="rounded-box border border-[rgba(90,176,255,0.12)] bg-white/[0.04] p-3"
                    >
                      <div className="font-display text-[20px] font-extrabold text-white">
                        {v}
                      </div>
                      <div className="mt-0.5 font-mono text-[9.5px] tracking-[0.1em] text-lp-muted">
                        {l}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <p data-reveal="0.1" className="mt-4 text-[13px] text-[var(--lp-dim)]">
          ¿No ves tu servicio? Descríbelo en la app y lo canalizamos con el
          técnico adecuado.
        </p>
      </Container>
    </section>
  );
}

/* ── Cómo funciona: teléfono sticky + pasos ── */
const STEPS: [string, string, string, LucideIcon, string[]][] = [
  [
    '01',
    'Describe tu problema',
    'Cuéntanos qué pasa y agrega fotos. “Fuga debajo del lavabo del baño” es suficiente.',
    MessageSquare,
    ['Fotos opcionales', 'Tu dirección guardada'],
  ],
  [
    '02',
    'Elige a tu técnico',
    'Compara perfiles verificados, calificaciones reales y precios base por servicio.',
    User,
    ['Calificación real', 'Precio base visible'],
  ],
  [
    '03',
    'Sigue todo en vivo',
    'Ve cuándo acepta, cuándo sale y cuándo llega, con chat directo en la app.',
    Navigation,
    ['Mapa en tiempo real', 'Chat y llamada'],
  ],
  [
    '04',
    'Paga al terminar',
    'Pago protegido con tarjeta cuando el trabajo está completo. Después, califica.',
    CreditCard,
    ['Pago protegido', 'Garantía de 30 días'],
  ],
];

export function HowItWorks() {
  const [step, setStep] = useState(0);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = list.current?.querySelectorAll<HTMLElement>('[data-step]');
    if (!els) return;
    const io = new IntersectionObserver(
      es => {
        for (const en of es)
          if (en.isIntersecting) setStep(Number(en.target.getAttribute('data-step')));
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="como" className="lp-band relative scroll-mt-16">
      <Container className="pb-[60px] pt-28 max-sm:pt-20">
        <div className="mb-5 max-w-[640px]">
          <Kicker>Cómo funciona</Kicker>
          <H2>Del problema a la solución, en cuatro pasos</H2>
          <Lead className="!text-lp-muted">
            Cada servicio pasa por los mismos estados — solicitado, aceptado,
            en camino, en servicio y completado — y tú los ves todos en vivo.
          </Lead>
        </div>
        <div className="flex flex-wrap items-start gap-14">
          <div className="relative flex min-w-0 flex-[1_1_360px] justify-center py-[30px] min-[980px]:sticky min-[980px]:top-24">
            <div className="relative">
              <div className="absolute left-1/2 top-1/2 -ml-[230px] -mt-[230px] h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(10,107,207,0.14),transparent_65%)]" />
              <div className="relative h-[646px] w-[298px]">
                {STEP_SCREENS.map((Screen, i) => (
                  <div
                    key={i}
                    aria-hidden={step !== i}
                    className="absolute inset-0 transition-[opacity,transform] duration-500 [transition-timing-function:var(--lp-ease)]"
                    style={{
                      opacity: step === i ? 1 : 0,
                      transform: `scale(${step === i ? 1 : 0.96})`,
                    }}
                  >
                    <Phone>
                      <Screen />
                    </Phone>
                  </div>
                ))}
              </div>
              <div className="mt-[18px] flex justify-center gap-1.5">
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className="h-1.5 rounded-full transition-[width,background] duration-[350ms]"
                    style={{
                      width: step === i ? 28 : 8,
                      background: step === i ? 'var(--lp-blue)' : '#26406A',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div ref={list} className="min-w-0 flex-[1_1_420px]">
            {STEPS.map(([n, t, b, Icon, tags], i) => {
              const on = step === i;
              return (
                <div
                  key={n}
                  data-step={i}
                  className="flex items-center py-5 min-[980px]:min-h-[62vh]"
                >
                  <div
                    className="flex gap-5 transition-opacity duration-[400ms]"
                    style={{ opacity: on ? 1 : 0.32 }}
                  >
                    <div className="flex flex-col items-center gap-2.5">
                      <span
                        className={`flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-[14px] transition-colors duration-[350ms] ${
                          on
                            ? 'bg-[var(--lp-blue)] text-white'
                            : 'bg-white/[0.08] text-lp-muted'
                        }`}
                      >
                        <Icon size={24} />
                      </span>
                      <span
                        className={`font-mono text-[12px] font-semibold ${
                          on ? 'text-[var(--lp-link)]' : 'text-[var(--lp-dim)]'
                        }`}
                      >
                        {n}
                      </span>
                    </div>
                    <div>
                      <p className="mb-2.5 mt-1.5 font-display text-[26px] font-extrabold tracking-[-0.6px]">
                        {t}
                      </p>
                      <p className="mb-3.5 max-w-[440px] text-[16px] leading-[1.65] text-lp-muted">
                        {b}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map(g => (
                          <span
                            key={g}
                            className="rounded-full border border-[var(--lp-tile)] bg-[#10284A] px-2.5 py-[5px] text-[12.5px] font-semibold text-[var(--lp-link)]"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ── Técnicos verificados: checklist en secuencia + tarjeta KYC ── */
const CHECKS: [string, string, LucideIcon][] = [
  ['Identidad oficial validada', 'INE por ambos lados, revisada por nuestro equipo.', IdCard],
  ['Comprobante de domicilio', 'Domicilio confirmado, incluso por llamada cuando hace falta.', Home],
  ['Certificaciones de oficio', 'Especialidades como gas LP requieren certificación vigente.', FileText],
  ['Entrevista de bienvenida', 'Llamada con el equipo de operaciones antes de activar el perfil.', PhoneIcon],
];

export function Verified({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInViewOnce(ref, 0.4);
  const [v, setV] = useState(-1);

  // Secuencia: pendiente → revisando → aprobado, 850 ms por paso.
  useEffect(() => {
    if (reduced) {
      setV(CHECKS.length);
      return;
    }
    if (!seen || v >= CHECKS.length) return;
    const t = setTimeout(() => setV(s => s + 1), v < 0 ? 0 : 850);
    return () => clearTimeout(t);
  }, [seen, reduced, v]);

  const approved = v >= CHECKS.length;

  return (
    <section id="tecnicos" className="scroll-mt-16">
      <Container className="flex flex-wrap items-center gap-14 py-28 max-sm:py-20">
        <div className="min-w-0 flex-[1_1_420px]">
          <Kicker>Técnicos verificados</Kicker>
          <H2>Verificados uno por uno, sin excepciones</H2>
          <Lead className="mb-[30px] !text-lp-muted">
            Nadie aparece en la app sin pasar el proceso completo de
            verificación. Solo el técnico aprobado puede recibir solicitudes.
          </Lead>
          <div ref={ref} className="flex flex-col gap-2.5">
            {CHECKS.map(([t, b, Icon], i) => {
              const done = i < v;
              const cur = i === v;
              return (
                <div
                  key={t}
                  className={`flex items-center gap-3.5 rounded-box border bg-[rgba(13,33,63,0.7)] px-4 py-3.5 transition-[border-color,box-shadow] duration-300 ${
                    cur
                      ? 'border-[var(--lp-blue)] shadow-[0_0_0_4px_rgba(10,107,207,0.18)]'
                      : done
                        ? 'border-[rgba(95,211,155,0.35)]'
                        : 'border-lp-line'
                  }`}
                >
                  <span
                    className={`relative flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-btn transition-colors duration-300 ${
                      done
                        ? 'bg-[var(--lp-ok-bg)] text-[var(--lp-ok)]'
                        : cur
                          ? 'bg-[var(--lp-tile)] text-[var(--lp-link)]'
                          : 'bg-white/[0.06] text-lp-muted'
                    }`}
                  >
                    {done ? (
                      <Check
                        size={16}
                        strokeWidth={2.6}
                        className="animate-[lp-pop_.35s_cubic-bezier(.2,1.4,.4,1)_both]"
                      />
                    ) : cur ? (
                      <span className="h-4 w-4 animate-[lp-spin_.8s_linear_infinite] rounded-full border-2 border-[#1E3A5F] border-t-[var(--lp-link)]" />
                    ) : (
                      <Icon size={16} />
                    )}
                  </span>
                  <div className="flex-1">
                    <p className="font-display text-[15px] font-bold">{t}</p>
                    <p className="mt-0.5 text-[13.5px] leading-normal text-lp-muted">
                      {b}
                    </p>
                  </div>
                  <span
                    className={`font-mono text-[11px] font-semibold ${
                      done
                        ? 'text-[var(--lp-ok)]'
                        : cur
                          ? 'text-[var(--lp-link)]'
                          : 'text-[var(--lp-dim)]'
                    }`}
                  >
                    {done ? 'APROBADO' : cur ? 'REVISANDO' : 'PENDIENTE'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex min-w-0 flex-[1_1_420px] justify-center">
          <div data-reveal="0.1" className="relative w-full max-w-[440px]">
            <div className="lp-glass rounded-[14px] p-[22px] shadow-[0_40px_80px_-40px_rgba(6,27,58,0.45)]">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[var(--lp-blue)] font-display text-[17px] font-extrabold text-white">
                  AG
                </span>
                <div className="flex-1">
                  <p className="font-display text-[17px] font-extrabold">
                    Adriana García Soto
                  </p>
                  <p className="mt-0.5 text-[13px] text-lp-muted">
                    Electricidad · Guadalajara
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[12px] font-bold transition-all duration-300 ${
                    approved
                      ? 'bg-[var(--lp-ok-bg)] text-[var(--lp-ok)]'
                      : 'bg-[#3A2C0E] text-[var(--lp-warn)]'
                  }`}
                >
                  {approved ? 'Aprobada' : 'En revisión'}
                </span>
              </div>
              <div className="lp-stripes relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-box border border-[var(--lp-track)]">
                <span className="font-mono text-[11px] text-lp-muted">
                  INE · anverso
                </span>
                <span className="absolute inset-x-[6%] h-0.5 animate-[lp-scan_2.6s_ease-in-out_infinite] bg-[var(--lp-cyan)] shadow-[0_0_16px_4px_rgba(24,193,255,0.45)]" />
                <span className="absolute left-2.5 top-2.5 h-[18px] w-[18px] rounded-tl border-l-2 border-t-2 border-[var(--lp-blue)]" />
                <span className="absolute right-2.5 top-2.5 h-[18px] w-[18px] rounded-tr border-r-2 border-t-2 border-[var(--lp-blue)]" />
                <span className="absolute bottom-2.5 left-2.5 h-[18px] w-[18px] rounded-bl border-b-2 border-l-2 border-[var(--lp-blue)]" />
                <span className="absolute bottom-2.5 right-2.5 h-[18px] w-[18px] rounded-br border-b-2 border-r-2 border-[var(--lp-blue)]" />
              </div>
              <div className="mt-3.5 grid grid-cols-2 gap-2">
                {[
                  ['Rostro vs. INE', '98%'],
                  ['CURP', 'Válida'],
                  ['Trabajos', '167'],
                  ['Calificación', '4.8 ★'],
                ].map(([l, val]) => (
                  <div key={l} className="rounded-btn bg-[var(--lp-panel)] px-3 py-2.5">
                    <div className="text-[11.5px] text-lp-muted">{l}</div>
                    <div className="font-display text-[16px] font-extrabold">
                      {val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -right-3.5 -top-4 animate-[lp-float_5s_ease-in-out_infinite] rounded-full bg-approve px-3.5 py-2 font-display text-[13px] font-bold text-white shadow-[0_16px_30px_-12px_rgba(30,107,75,0.7)] max-sm:right-0">
              Aprobada en 9 h
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
