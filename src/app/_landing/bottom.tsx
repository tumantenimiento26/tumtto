'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Check,
  CircleHelp,
  Info,
  Landmark,
  MapPin,
  Plus,
} from 'lucide-react';
import { BrandMark } from '@/components/ui';
import { LandingMap } from '@/components/landing-map';
import {
  PRICE_RANGES,
  TICKETS,
  estimate,
  money,
  monthlyIncome,
} from '@/lib/landing';
import { Container, H2, Initials, Kicker, Lead, Stars, StoreButtons } from './bits';
import { scrollToId } from './hooks';
import { CONTACT, displayPhone, mailLink, telLink, waLink } from '@/lib/contact';
import { SocialLinks } from './socials';

/* ── Reseñas: dos marquesinas en sentidos opuestos ── */
const REVIEWS: [string, string, string][] = [
  ['María Castillo', 'Calentador · Zapopan', 'Excelente trabajo, muy puntual.'],
  ['Ricardo Vega', 'Plomería · Zapopan', 'Explicó todo antes de empezar y dejó limpio.'],
  ['Laura Méndez', 'Electricidad · Tlaquepaque', 'Llegó en 20 minutos y el precio fue el que vi en la app.'],
  ['Jorge Salas', 'Contactos · Guadalajara', 'Me gustó poder seguirlo en el mapa.'],
  ['Patricia Ortiz', 'Cerrajería · Guadalajara', 'Súper rápido, me abrieron en menos de una hora.'],
  ['Andrés Navarro', 'Drenaje · Zapopan', 'Cotización clara y sin sorpresas.'],
  ['Fernando Ruiz', 'Gas · Zapopan', 'Revisó toda la instalación y me dejó tranquilo.'],
  ['Sofía Aguilar', 'Aire acondicionado · Tlajomulco', 'Mantenimiento completo y muy amable.'],
];
const AV_COLORS = ['#0A6BCF', '#1E6B4B', '#B45309', '#18C1FF', '#0E2C56', '#6B7280'];

function ReviewCard({ r, i }: { r: [string, string, string]; i: number }) {
  const [n, s, t] = r;
  const ini = n
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2);
  return (
    <div className="flex w-[340px] flex-shrink-0 flex-col gap-3 rounded-[14px] border border-white/[0.09] bg-white/[0.05] p-5 transition-colors hover:border-[rgba(24,193,255,0.4)] hover:bg-white/[0.09] max-sm:w-[280px]">
      <Stars />
      <p className="text-[15px] leading-[1.55] text-lp-text">“{t}”</p>
      <div className="mt-auto flex items-center gap-2.5">
        <Initials text={ini} color={AV_COLORS[i % AV_COLORS.length]} />
        <div>
          <div className="text-[13.5px] font-semibold">{n}</div>
          <div className="text-[12px] text-lp-muted">{s}</div>
        </div>
      </div>
    </div>
  );
}

export function Reviews() {
  const rowA = [...REVIEWS, ...REVIEWS];
  const shifted = [...REVIEWS.slice(4), ...REVIEWS.slice(0, 4)];
  const rowB = [...shifted, ...shifted];
  return (
    <section className="relative overflow-hidden border-t border-[rgba(90,176,255,0.1)] bg-lp-band text-white">
      <Container className="pb-9 pt-24 text-center">
        <Kicker>Lo que dicen los clientes</Kicker>
        <H2 className="!text-white">4.9 de calificación en 3,346 servicios</H2>
      </Container>
      <div className="lp-fade-x flex flex-col gap-3.5 pb-24">
        {[
          { items: rowA, anim: 'animate-[lp-marq_60s_linear_infinite]' },
          { items: rowB, anim: 'animate-[lp-marq-r_70s_linear_infinite]' },
        ].map((row, k) => (
          <div key={k} className={`lp-marquee flex w-max gap-3.5 ${row.anim}`}>
            {row.items.map((r, i) => (
              <div key={i} aria-hidden={i >= REVIEWS.length}>
                <ReviewCard r={r} i={i % REVIEWS.length} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Cobertura ── */
const MUNIS: [string, string, string, boolean][] = [
  ['Guadalajara', '240 de 245 colonias · 412 técnicos', '98%', true],
  ['Zapopan', '194 de 198 colonias · 318 técnicos', '98%', true],
  ['Tlaquepaque', '118 de 124 colonias · 142 técnicos', '95%', true],
  ['Tlajomulco de Zúñiga', '41 de 64 colonias · 48 técnicos', '64%', false],
];

export function Coverage() {
  return (
    <section id="cobertura" className="scroll-mt-16">
      <Container className="py-28 max-sm:py-20">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[620px]">
            <Kicker>Cobertura en vivo</Kicker>
            <H2>Operando en la ZMG</H2>
            <Lead className="!text-lp-muted">
              Zona Metropolitana de Guadalajara: cuatro municipios activos,
              radios de cobertura de técnicos reales y demanda en tiempo real.
              Explora el mapa.
            </Lead>
          </div>
          <span
            data-reveal="0.15"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--lp-ok-bg)] px-[15px] py-[9px] font-mono text-[11.5px] font-semibold tracking-[0.1em] text-[var(--lp-ok)]"
          >
            <span className="h-[7px] w-[7px] animate-[lp-pulse_1.6s_ease-in-out_infinite] rounded-full bg-approve" />
            593/631 COLONIAS CUBIERTAS
          </span>
        </div>
        <div className="flex flex-wrap gap-3.5">
          <div
            data-reveal="0"
            className="relative h-[520px] min-w-0 flex-[2_1_560px] overflow-hidden rounded-[16px] border border-[rgba(90,176,255,0.16)] bg-[#07111F] max-sm:h-[380px]"
          >
            <LandingMap />
            <div className="pointer-events-none absolute bottom-3.5 left-3.5 z-[500] flex flex-wrap gap-3.5 rounded-box border border-lp-line bg-lp-card px-3.5 py-2.5 text-[12px] text-[var(--lp-soft)] shadow-[0_18px_40px_-16px_rgba(6,27,58,0.45)]">
              <span className="flex items-center gap-1.5">
                <span className="h-[11px] w-[11px] rounded-[3px] border-[1.5px] border-[var(--lp-blue)] bg-[rgba(10,107,207,0.18)]" />
                Cobertura total
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-[11px] w-[11px] rounded-[3px] border-[1.5px] border-[var(--lp-gold)] bg-[rgba(245,158,11,0.2)]" />
                Parcial
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-[7px] w-[7px] rounded-full bg-[var(--lp-cyan)]" />
                Demanda activa
              </span>
            </div>
          </div>
          <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-2.5">
            {MUNIS.map(([n, sub, w, full], i) => (
              <div
                key={n}
                data-reveal={String((i % 4) * 0.07)}
                className="lp-glass rounded-[14px] p-[18px] transition-colors hover:border-[var(--lp-link)]"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="font-display text-[16px] font-extrabold">{n}</p>
                  <span
                    className={`rounded-full px-2.5 py-[3px] text-[12px] font-semibold ${
                      full
                        ? 'bg-[var(--lp-tile)] text-[var(--lp-link)]'
                        : 'bg-[#3A2C0E] text-[var(--lp-warn)]'
                    }`}
                  >
                    {full ? 'Total' : 'Parcial'}
                  </span>
                </div>
                <p className="mb-3 text-[13px] text-lp-muted">{sub}</p>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#16294A]">
                  <div
                    className="h-full origin-left animate-[lp-grow_1.2s_var(--lp-ease)_both] rounded-full"
                    style={{
                      width: w,
                      background: full ? 'var(--lp-blue)' : 'var(--lp-gold)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ── Precios: promesas + estimador ── */
const PROMISES = [
  'Rangos publicados por servicio, sin letra chica',
  'Cotización confirmada antes de empezar el trabajo',
  'Pago con tarjeta, protegido de inicio a fin',
  'Garantía de 30 días en cada servicio completado',
];

export function Pricing() {
  const [idx, setIdx] = useState(0);
  const [urgent, setUrgent] = useState(false);
  const e = estimate(idx, urgent);

  return (
    <section id="precios" className="lp-band relative scroll-mt-16">
      <Container className="flex flex-wrap items-center gap-14 py-28 max-sm:py-20">
        <div className="min-w-0 flex-[1_1_400px]">
          <Kicker>Precios y cotización</Kicker>
          <H2>Precios claros desde el inicio</H2>
          <Lead className="mb-[26px] !text-lp-muted">
            Cada servicio publica su rango. Antes de empezar, tu técnico
            confirma la cotización — y no pagas hasta que el trabajo termina.
          </Lead>
          <div className="flex flex-col gap-3">
            {PROMISES.map((t, i) => (
              <div
                key={t}
                data-reveal={String((i % 4) * 0.07)}
                className="flex items-center gap-3"
              >
                <span className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-lg bg-[var(--lp-ok-bg)] text-[var(--lp-ok)]">
                  <Check size={13} strokeWidth={2.6} />
                </span>
                <span className="text-[15.5px] text-[var(--lp-soft)]">{t}</span>
              </div>
            ))}
          </div>
        </div>
        <div
          data-reveal="0.1"
          className="lp-glass min-w-0 flex-[1_1_460px] rounded-[14px] p-6 shadow-[0_40px_80px_-40px_rgba(6,27,58,0.35)]"
        >
          <div className="mb-4 flex items-center justify-between gap-2.5">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-lp-muted">
              Estimador de precio
            </span>
            <span className="flex items-center gap-1.5 text-[12px] text-lp-muted">
              <Info size={14} />
              Rango publicado
            </span>
          </div>
          <div
            role="radiogroup"
            aria-label="Servicio"
            className="mb-[22px] flex flex-wrap gap-1.5"
          >
            {PRICE_RANGES.map(([name], i) => {
              const on = i === idx;
              return (
                <button
                  key={name}
                  role="radio"
                  aria-checked={on}
                  onClick={() => setIdx(i)}
                  className={`h-9 rounded-full border px-3 text-[13px] font-semibold transition-all ${
                    on
                      ? 'border-white bg-white text-navy'
                      : 'border-[var(--lp-track)] bg-transparent text-[var(--lp-soft)] hover:border-[var(--lp-link)]'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
          <div className="rounded-box bg-[var(--lp-panel)] p-5">
            <div className="text-[13px] text-lp-muted">
              Precio típico · {e.name}
            </div>
            <div
              className="mb-[18px] mt-1 font-display text-[44px] font-extrabold leading-[1.1] tracking-[-1.2px] tabular"
              aria-live="polite"
            >
              {money(e.typical)}{' '}
              <span className="text-[16px] text-[var(--lp-dim)]">MXN</span>
            </div>
            <div className="relative h-2.5 rounded-full bg-[var(--lp-track)]">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[var(--lp-blue)] transition-[width] duration-500 [transition-timing-function:var(--lp-ease)]"
                style={{ width: `${e.pos}%` }}
              />
              <div
                className="absolute top-1/2 -ml-[11px] -mt-[11px] h-[22px] w-[22px] rounded-full border-[3px] border-[var(--lp-blue)] bg-white shadow-[0_4px_12px_rgba(10,107,207,0.35)] transition-[left] duration-500 [transition-timing-function:var(--lp-ease)]"
                style={{ left: `${e.pos}%` }}
              />
            </div>
            <div className="mt-2.5 flex justify-between font-mono text-[12.5px] text-[var(--lp-soft)]">
              <span>{money(e.min)}</span>
              <span>{money(e.max)}</span>
            </div>
          </div>
          <button
            role="switch"
            aria-checked={urgent}
            onClick={() => setUrgent(u => !u)}
            className="mt-3 flex w-full items-center gap-3 rounded-box border border-[var(--lp-track)] bg-white/[0.03] px-4 py-3.5 text-left hover:bg-white/[0.06]"
          >
            <span className="flex-1">
              <span className="block text-[14px] font-semibold text-lp-text">
                Servicio urgente
              </span>
              <span className="block text-[12.5px] text-lp-muted">
                Recargo de 20% sobre mano de obra y materiales
              </span>
            </span>
            <span
              className="relative h-7 w-[46px] flex-shrink-0 rounded-full transition-[background] duration-[250ms]"
              style={{ background: urgent ? 'var(--lp-blue)' : 'var(--lp-track)' }}
            >
              <span
                className="absolute left-[3px] top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow-[0_1px_3px_rgba(6,27,58,0.3)] transition-transform duration-[250ms] [transition-timing-function:cubic-bezier(.3,1.4,.5,1)]"
                style={{ transform: `translateX(${urgent ? 18 : 0}px)` }}
              />
            </span>
          </button>
          <p className="mt-3.5 text-[12.5px] leading-[1.55] text-lp-muted">
            La cotización final siempre la confirma tu técnico antes de
            empezar. Extras solo con tu aprobación en la app.
          </p>
        </div>
      </Container>
    </section>
  );
}

/* ── Para técnicos: beneficios + calculadora ── */
const PERKS = [
  { t: 'Cobra directo a tu CLABE', b: 'Retiros a tu cuenta, sin intermediarios.', icon: Landmark },
  { t: 'Tú pones tu horario', b: 'Disponibilidad por día y hora, a tu medida.', icon: Calendar },
  { t: 'Trabaja en tu zona', b: 'Define tu radio de cobertura en el mapa.', icon: MapPin },
  { t: 'Soporte que responde', b: 'Equipo de operaciones local, en la ZMG.', icon: CircleHelp },
];

export function ForTechs() {
  const [tk, setTk] = useState(0);
  const [jobs, setJobs] = useState(12);
  const ticket = TICKETS[tk][1];

  return (
    <section id="unete" className="scroll-mt-16">
      <Container className="py-28 max-sm:py-20">
        <div
          data-reveal="0"
          className="relative overflow-hidden rounded-[20px] border border-[rgba(24,193,255,0.22)] bg-[linear-gradient(150deg,#0B2F63,#081C3A_55%,#061429)] text-white"
        >
          <div className="pointer-events-none absolute -right-40 -top-[220px] h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle,rgba(10,107,207,0.4),transparent_64%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(90deg,transparent,#000_60%)]" />
          <div className="relative flex flex-wrap items-center gap-12 p-[clamp(20px,5vw,64px)]">
            <div className="min-w-0 flex-[1_1_400px]">
              <Kicker reveal={null}>Para técnicos</Kicker>
              <H2 reveal={null} className="!text-white">
                Tu oficio. Tu agenda. Tus ingresos.
              </H2>
              <p className="mb-7 max-w-[480px] text-[16.5px] leading-[1.65] text-[var(--lp-soft)]">
                Únete a la red de técnicos verificados de la ZMG. Tú decides
                dónde, cuándo y qué servicios ofreces — nosotros te llevamos
                los clientes.
              </p>
              <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-[18px]">
                {PERKS.map(p => (
                  <div key={p.t} className="flex items-start gap-3">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-btn bg-white/[0.07] text-[var(--lp-cyan)]">
                      <p.icon size={19} />
                    </span>
                    <div>
                      <p className="font-display text-[15px] font-bold">{p.t}</p>
                      <p className="mt-0.5 text-[13px] leading-normal text-[var(--lp-soft)]">
                        {p.b}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2.5">
                <Link
                  href="/registro-tecnico"
                  className="inline-flex h-[54px] items-center justify-center gap-2.5 rounded-btn bg-[var(--lp-blue)] px-[26px] font-display text-[15.5px] font-bold text-white transition-[background,transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:bg-[var(--lp-blue-hover)] hover:shadow-[0_16px_30px_-12px_rgba(10,107,207,0.7)]"
                >
                  Regístrate como técnico
                </Link>
                <button
                  onClick={() => scrollToId('faq')}
                  className="h-[54px] rounded-btn border border-white/[0.22] px-[22px] font-display text-[15.5px] font-bold text-white hover:bg-white/[0.08]"
                >
                  Conoce los requisitos
                </button>
              </div>
            </div>
            <div className="min-w-0 flex-[1_1_360px]">
              <div className="rounded-[16px] border border-[rgba(90,176,255,0.16)] bg-[rgba(13,33,63,0.85)] p-6 max-sm:p-4 text-lp-text shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] backdrop-blur-[10px]">
                <div className="mb-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-lp-muted">
                  Calcula tus ingresos
                </div>
                <div
                  role="radiogroup"
                  aria-label="Categoría"
                  className="mb-[18px] flex gap-1 rounded-btn bg-[#0A1830] p-1"
                >
                  {TICKETS.map(([label], i) => {
                    const on = i === tk;
                    return (
                      <button
                        key={label}
                        role="radio"
                        aria-checked={on}
                        onClick={() => setTk(i)}
                        className={`min-h-[34px] min-w-0 flex-1 hyphens-auto rounded-lg px-1.5 py-1 text-[13px] font-semibold leading-tight transition-all duration-150 ${
                          on
                            ? 'bg-white text-navy shadow-[0_1px_2px_rgba(14,44,86,0.1)]'
                            : 'text-lp-muted hover:text-white'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <div className="mb-2 flex items-baseline justify-between">
                  <label htmlFor="lp-jobs" className="text-[14px] font-semibold">
                    Servicios por semana
                  </label>
                  <span className="font-display text-[20px] font-extrabold tabular">
                    {jobs}
                  </span>
                </div>
                <input
                  id="lp-jobs"
                  type="range"
                  min={3}
                  max={30}
                  value={jobs}
                  onChange={ev => setJobs(Number(ev.target.value))}
                  className="mb-5 w-full cursor-pointer accent-[var(--lp-link)]"
                />
                <div className="rounded-box bg-[var(--lp-panel)] p-[18px]">
                  <div className="text-[13px] text-lp-muted">
                    Ingreso mensual estimado
                  </div>
                  <div
                    className="my-0.5 font-display text-[40px] font-extrabold tracking-[-1px] tabular"
                    aria-live="polite"
                  >
                    {money(monthlyIncome(jobs, ticket))}
                  </div>
                  <div className="text-[12.5px] text-lp-muted">
                    Ticket medio {money(ticket)} · después de la comisión de 15%
                  </div>
                </div>
                <div className="mt-3.5 flex items-center gap-2 text-[12.5px] font-semibold text-[var(--lp-ok)]">
                  <Landmark size={15} />
                  Retiros diarios a tu CLABE, sin mínimo mayor a $100
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ── FAQ ── */
const FAQS: [string, string][] = [
  [
    '¿Cómo verifican a los técnicos?',
    'Cada técnico pasa por verificación de identidad (INE por ambos lados), comprobante de domicilio, certificaciones de oficio cuando aplican — como gas LP — y una entrevista con nuestro equipo de operaciones. Solo los perfiles aprobados pueden recibir solicitudes.',
  ],
  [
    '¿Cuánto cuesta un servicio?',
    'Cada servicio publica su rango — por ejemplo, una fuga va de $300 a $1,500 MXN. Al elegir técnico ves su precio base, y antes de empezar te confirma la cotización final. Cualquier extra requiere tu aprobación en la app.',
  ],
  [
    '¿Qué incluye la garantía de 30 días?',
    'Si el problema reaparece dentro de los 30 días siguientes al servicio, tu técnico regresa a revisarlo sin costo adicional. Nuestro equipo de soporte coordina la visita.',
  ],
  [
    '¿Cómo y cuándo pago?',
    'Pagas con tarjeta desde la app cuando el servicio está completado. El pago está protegido: el técnico lo recibe solo al terminar el trabajo, y tienes soporte directo si algo no salió bien.',
  ],
  [
    '¿En qué zonas están disponibles?',
    'Operamos en la Zona Metropolitana de Guadalajara: Guadalajara, Zapopan, Tlaquepaque y Tlajomulco de Zúñiga. Si tu colonia aún no aparece, propónla desde la app y la priorizamos.',
  ],
  [
    '¿Qué necesito para registrarme como técnico?',
    'INE vigente, carta de antecedentes no penales (con vigencia no mayor a 3 meses), CLABE para tus cobros y — según tu especialidad — certificación de oficio. El comprobante de domicilio es opcional. Creas tu cuenta aquí, subes tus documentos desde la app y nuestro equipo revisa tu perfil para activarlo.',
  ],
];

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="scroll-mt-16">
      <Container className="flex flex-wrap gap-12 pb-28 pt-6">
        <div className="min-w-0 flex-[1_1_320px]">
          <Kicker>Preguntas frecuentes</Kicker>
          <H2>Resolvemos tus dudas</H2>
          <Lead className="!text-lp-muted">
            ¿No encuentras tu respuesta?{' '}
            <button
              type="button"
              onClick={() => scrollToId('contacto')}
              className="font-semibold text-[var(--lp-link)] hover:text-white"
            >
              Escríbenos desde el formulario
            </button>
            {CONTACT.email && (
              <>
                {' '}
                o a{' '}
                <a
                  href={mailLink() ?? undefined}
                  className="font-semibold text-[var(--lp-link)] hover:text-white"
                >
                  {CONTACT.email}
                </a>
              </>
            )}
            .
          </Lead>
        </div>
        <div className="flex min-w-0 flex-[2_1_520px] flex-col gap-2.5">
          {FAQS.map(([q, a], i) => {
            const on = open === i;
            return (
              <div
                key={q}
                className={`lp-glass overflow-hidden rounded-[14px] transition-[border-color,box-shadow] duration-200 ${
                  on
                    ? '!border-[var(--lp-blue)] shadow-[0_20px_40px_-28px_rgba(6,27,58,0.45)]'
                    : ''
                }`}
              >
                <button
                  onClick={() => setOpen(on ? -1 : i)}
                  aria-expanded={on}
                  aria-controls={`lp-faq-${i}`}
                  className="flex min-h-16 w-full items-center gap-3.5 px-5 text-left"
                >
                  <span className="flex-1 py-3 font-display text-[16px] font-bold text-lp-text">
                    {q}
                  </span>
                  <span
                    className={`flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full transition-[transform,background,color] duration-300 [transition-timing-function:var(--lp-ease)] ${
                      on
                        ? 'rotate-45 bg-[var(--lp-blue)] text-white'
                        : 'bg-white/[0.08] text-lp-text'
                    }`}
                  >
                    <Plus size={14} strokeWidth={2.4} />
                  </span>
                </button>
                <div
                  id={`lp-faq-${i}`}
                  className="grid transition-[grid-template-rows] duration-[350ms] [transition-timing-function:var(--lp-ease)]"
                  style={{ gridTemplateRows: on ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-[15px] leading-[1.65] text-[var(--lp-soft)]">
                      {a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* ── CTA final ── */
export function FinalCta() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 pb-28">
      <div
        data-reveal="0"
        className="relative overflow-hidden rounded-[20px] border border-[rgba(24,193,255,0.3)] bg-[linear-gradient(135deg,#0A6BCF,#0B4FA0_60%,#0A2E63)] p-[clamp(36px,6vw,72px)] text-center text-white shadow-[0_40px_100px_-40px_rgba(24,193,255,0.5)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]" />
        <div className="relative">
          <h2 className="mb-3 font-display text-[clamp(32px,4.4vw,52px)] font-extrabold leading-[1.05] tracking-[-1.4px]">
            Tu próximo técnico está a un toque.
          </h2>
          <p className="mx-auto mb-[30px] max-w-[520px] text-[17px] leading-[1.6] text-white/80">
            Descarga la app, describe el problema y sigue a tu técnico en vivo
            hasta tu puerta.
          </p>
          <StoreButtons className="justify-center" />
        </div>
      </div>
    </section>
  );
}

/* ── Footer ── */
export function Footer() {
  const col = (title: string, items: React.ReactNode) => (
    <div>
      <p className="mb-3.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--lp-dim)]">
        {title}
      </p>
      <div className="flex flex-col gap-2.5">{items}</div>
    </div>
  );
  const btn = (label: string, id: string) => (
    <button
      onClick={() => scrollToId(id)}
      className="text-left text-[14px] text-[var(--lp-soft)] hover:text-white"
    >
      {label}
    </button>
  );
  const lnk = 'text-[14px] text-[var(--lp-soft)] hover:text-white';
  return (
    <footer id="site-footer" className="relative border-t border-[rgba(90,176,255,0.12)] bg-lp-footer text-white">
      <div className="mx-auto max-w-[1200px] px-6 pt-16">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-10 gap-y-8 pb-12">
          <div>
            <div className="mb-3.5 flex items-center gap-2.5">
              <BrandMark size={32} />
              <span className="font-display text-[17px] font-extrabold">
                Tumantenimiento
              </span>
            </div>
            <p className="max-w-[280px] text-[13.5px] leading-[1.6] text-lp-muted">
              Servicios de mantenimiento a domicilio con técnicos verificados
              en la Zona Metropolitana de Guadalajara.
            </p>
          </div>
          {col(
            'Servicios',
            <>
              {btn('Plomería', 'servicios')}
              {btn('Electricidad', 'servicios')}
              {btn('Gas', 'servicios')}
              {btn('Precios', 'precios')}
            </>,
          )}
          {col(
            'Plataforma',
            <>
              {btn('Cómo funciona', 'como')}
              {btn('Técnicos verificados', 'tecnicos')}
              <Link href="/registro-tecnico" className={lnk}>
                Únete como técnico
              </Link>
              <Link href="/login" className={lnk}>
                Acceso admin
              </Link>
            </>,
          )}
          {col(
            'Contacto',
            <>
              {CONTACT.email && (
                <a href={mailLink() ?? undefined} className={lnk}>
                  {CONTACT.email}
                </a>
              )}
              {CONTACT.phone && (
                <a href={telLink() ?? undefined} className={lnk}>
                  {displayPhone(CONTACT.phone)}
                </a>
              )}
              {CONTACT.whatsapp && (
                <a
                  href={waLink() ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={lnk}
                >
                  WhatsApp {displayPhone(CONTACT.whatsapp)}
                </a>
              )}
              <span className="text-[14px] text-[var(--lp-soft)]">
                Guadalajara, Jalisco, México
              </span>
              <SocialLinks className="mt-1" size={17} />
            </>,
          )}
        </div>
        <div className="flex flex-wrap items-center gap-5 border-t border-white/[0.08] pb-[26px] pt-[22px]">
          <span className="text-[12.5px] text-[var(--lp-dim)]">
            © {new Date().getFullYear()} Tumantenimiento. Todos los derechos
            reservados.
          </span>
          <div className="ml-auto flex flex-wrap gap-[18px]">
            {/* ponytail: /terminos aún no existe; el aviso de privacidad sí. */}
            <span className="text-[12.5px] text-lp-muted">
              Términos y condiciones
            </span>
            <Link
              href="/aviso-de-privacidad"
              className="text-[12.5px] text-lp-muted hover:text-white"
            >
              Aviso de privacidad
            </Link>
            <span className="font-mono text-[10.5px] tracking-[0.1em] text-[var(--lp-dim)]">
              HECHO EN LA ZMG
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
