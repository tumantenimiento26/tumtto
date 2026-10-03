'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import {
  Check,
  Menu,
  Navigation,
  ShieldCheck,
  Star,
  Users,
  X,
} from 'lucide-react';
import { BrandMark } from '@/components/ui';
import { easeOutCubic } from '@/lib/landing';
import { Container, Initials, StoreButtons, Stars } from './bits';
import { HomeScreen, Phone } from './phone';
import { scrollToId, useInViewOnce } from './hooks';

/* ── Fondo fijo: 3 auras + rejilla doble + viñeta ── */
export function Background() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-lp-page"
    >
      <div className="absolute -left-[10vw] -top-[20vh] h-[70vw] max-h-[1000px] w-[70vw] max-w-[1000px] animate-[lp-drift1_26s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(10,107,207,0.42),transparent_62%)] blur-[40px]" />
      <div className="absolute -right-[20vw] top-[30vh] h-[60vw] max-h-[900px] w-[60vw] max-w-[900px] animate-[lp-drift2_32s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(24,193,255,0.22),transparent_62%)] blur-[50px]" />
      <div className="absolute -bottom-[30vh] left-[20vw] h-[60vw] max-h-[900px] w-[60vw] max-w-[900px] animate-[lp-drift3_38s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(46,90,190,0.30),transparent_62%)] blur-[60px]" />
      <div className="lp-grid-bg absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,transparent_40%,rgba(5,15,34,0.85)_100%)]" />
    </div>
  );
}

/* ── Nav fija ── */
const LINKS: [string, string][] = [
  ['servicios', 'Servicios'],
  ['como', 'Cómo funciona'],
  ['tecnicos', 'Técnicos'],
  ['cobertura', 'Cobertura'],
  ['precios', 'Precios'],
  ['faq', 'FAQ'],
  ['contacto', 'Contacto'],
];
const SECTION_ORDER = [
  'servicios',
  'como',
  'tecnicos',
  'cobertura',
  'precios',
  'faq',
  'contacto',
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [section, setSection] = useState('');
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let queued = false;
    const run = () => {
      queued = false;
      const y = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current)
        bar.current.style.width = `${h > 0 ? (y / h) * 100 : 0}%`;
      setScrolled(y > 40);
      let cur = '';
      for (const id of SECTION_ORDER) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 140) cur = id;
      }
      setSection(cur);
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(run);
    };
    run();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <>
      <div
        ref={bar}
        className="fixed left-0 top-0 z-[80] h-[3px] w-0 bg-[var(--lp-cyan)] shadow-[0_0_12px_rgba(24,193,255,0.6)]"
      />
      <header
        className={`fixed inset-x-0 top-0 z-[70] border-b backdrop-blur-[16px] transition-[background,border-color,box-shadow] duration-300 ${
          scrolled || open
            ? 'border-lp-line bg-[rgba(6,20,44,0.78)] shadow-[0_10px_30px_-20px_rgba(0,0,0,0.6)]'
            : 'border-white/[0.06] bg-transparent'
        }`}
      >
        <Container
          className={`flex items-center gap-6 transition-[height] duration-300 ${
            scrolled ? 'h-[62px]' : 'h-[76px]'
          }`}
        >
          <a
            href="#top"
            onClick={e => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5"
          >
            <BrandMark size={32} />
            <span className="font-display text-[17px] font-extrabold tracking-[-0.2px] text-white">
              Tumantenimiento
            </span>
          </a>
          <nav
            aria-label="Secciones"
            className="ml-auto hidden items-center gap-1 min-[1360px]:flex"
          >
            {LINKS.map(([id, t]) => {
              const on = section === id;
              return (
                <button
                  key={id}
                  onClick={() => go(id)}
                  aria-current={on ? 'true' : undefined}
                  className={`relative h-9 whitespace-nowrap rounded-lg px-3 text-[14px] font-medium transition-colors hover:bg-white/[0.08] ${
                    on ? 'text-white' : 'text-[var(--lp-soft)]'
                  }`}
                >
                  {t}
                  <span
                    className="absolute inset-x-3 bottom-1 h-0.5 origin-left rounded bg-[var(--lp-cyan)] transition-transform duration-[350ms] [transition-timing-function:var(--lp-ease)]"
                    style={{ transform: `scaleX(${on ? 1 : 0})` }}
                  />
                </button>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2.5 min-[1360px]:ml-0">
            <Link
              href="/login"
              className="hidden h-10 items-center whitespace-nowrap px-2.5 font-display text-[14px] font-bold text-white hover:text-[var(--lp-cyan)] sm:inline-flex"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro-tecnico"
              className="hidden h-10 items-center whitespace-nowrap rounded-btn border border-white/[0.22] px-4 font-display text-[14px] font-bold text-white transition-colors hover:bg-white/[0.08] sm:inline-flex"
            >
              Soy técnico
            </Link>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="relative hidden h-10 overflow-hidden whitespace-nowrap rounded-btn sm:block bg-[var(--lp-blue)] px-4 font-display text-[14px] font-bold text-white transition-colors hover:bg-[var(--lp-blue-hover)]"
            >
              Descargar app
              <span className="absolute inset-y-0 left-0 w-[40%] animate-[lp-shine_3.5s_ease-in-out_1.5s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)]" />
            </button>
            <button
              onClick={() => setOpen(o => !o)}
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={open}
              className="flex h-10 w-10 items-center justify-center rounded-btn text-white hover:bg-white/[0.08] min-[1360px]:hidden"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </Container>
        {open && (
          <nav
            aria-label="Menú"
            className="border-t border-lp-line px-6 pb-5 pt-3 min-[1360px]:hidden"
          >
            <div className="mx-auto flex max-w-[1200px] flex-col">
              {LINKS.map(([id, t]) => (
                <button
                  key={id}
                  onClick={() => go(id)}
                  className="min-h-11 text-left text-[15px] font-medium text-[var(--lp-soft)] hover:text-white"
                >
                  {t}
                </button>
              ))}
              <div className="mt-2 flex gap-2.5 sm:hidden">
                <Link
                  href="/login"
                  className="flex h-11 flex-1 items-center justify-center rounded-btn border border-white/[0.22] font-display text-[14px] font-bold text-white"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro-tecnico"
                  className="flex h-11 flex-1 items-center justify-center rounded-btn border border-white/[0.22] font-display text-[14px] font-bold text-white"
                >
                  Soy técnico
                </Link>
              </div>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}

/* ── Hero ── */
const MARQUEE = [
  'Fugas',
  'Calentadores',
  'Drenaje de cocina',
  'Instalación de WC',
  'Contactos y apagadores',
  'Instalación de lámparas',
  'Cambio de regulador',
  'Ventanas residenciales',
  'Pintura interior',
  'Puertas y portones',
];
const WORDS: [string, boolean][] = [
  ['El', false],
  ['técnico', false],
  ['correcto,', false],
  ['verificado', true],
  ['y', true],
  ['en camino.', true],
];
const WORD_DELAYS = [0.05, 0.12, 0.19, 0.3, 0.37, 0.44];
const AVATARS: [string, string][] = [
  ['MC', '#0A6BCF'],
  ['RV', '#1E6B4B'],
  ['LM', '#F5B94A'],
  ['JS', '#18C1FF'],
];

export function Hero({ reduced }: { reduced: boolean }) {
  const [live, setLive] = useState(89);
  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setLive(86 + Math.round(Math.random() * 7)), 4000);
    return () => clearInterval(t);
  }, [reduced]);

  const onMove = (e: MouseEvent<HTMLElement>) => {
    if (reduced) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty('--mx', `${x}px`);
    el.style.setProperty('--my', `${y}px`);
    el.style.setProperty('--px', String((x / r.width - 0.5) * 2));
    el.style.setProperty('--py', String((y / r.height - 0.5) * 2));
  };
  const par = (kx: number, ky: number) => ({
    transform: `translate3d(calc(var(--px) * ${kx}px), calc(var(--py) * ${ky}px), 0)`,
  });

  return (
    <section
      id="top"
      onMouseMove={onMove}
      className="relative overflow-hidden text-white [--mx:70%] [--my:30%] [--px:0] [--py:0]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_var(--mx)_var(--my),rgba(24,193,255,0.16),transparent_45%)]" />
      <div className="pointer-events-none absolute -left-[220px] -top-[280px] h-[820px] w-[820px] rounded-full bg-[radial-gradient(circle,rgba(10,107,207,0.42),transparent_64%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_60%_40%,#000_20%,transparent_70%)]" />

      <Container className="relative flex flex-wrap items-center gap-12 pb-[72px] pt-[132px]">
        <div className="min-w-0 flex-[1_1_460px]">
          <p className="mb-[22px] inline-flex animate-[lp-wordin_.7s_ease_both] items-center gap-2.5 rounded-full border border-white/[0.14] bg-white/[0.04] py-[7px] pl-2.5 pr-3.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--lp-soft)]">
            <span className="relative h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-[var(--lp-ok)]" />
              <span className="absolute inset-0 animate-[lp-ping_1.8s_ease-out_infinite] rounded-full bg-[var(--lp-ok)]" />
            </span>
            <span className="font-semibold text-white tabular" aria-live="off">
              {live}
            </span>{' '}
            técnicos en línea · ZMG
          </p>
          <h1 className="mb-[22px] font-display text-[clamp(42px,6vw,72px)] font-extrabold leading-none tracking-[-2.2px] [text-wrap:balance]">
            {WORDS.map(([w, accent], i) => (
              <span key={w}>
                <span
                  className={`lp-word ${accent ? 'text-[var(--lp-cyan)]' : ''}`}
                  style={{ animationDelay: `${WORD_DELAYS[i]}s` }}
                >
                  {w}
                </span>{' '}
              </span>
            ))}
          </h1>
          <p className="mb-[34px] max-w-[500px] animate-[lp-wordin_.8s_ease_.55s_both] text-[18px] leading-[1.65] text-[var(--lp-soft)] [text-wrap:pretty]">
            Plomería, electricidad, gas y más. Pide desde la app, sigue cada
            paso en tiempo real y paga protegido al terminar — con garantía de
            30 días por escrito.
          </p>
          <StoreButtons className="mb-9 animate-[lp-wordin_.8s_ease_.65s_both]" />
          <div className="flex animate-[lp-wordin_.8s_ease_.75s_both] flex-wrap items-center gap-[22px]">
            <div className="flex items-center">
              {AVATARS.map(([ini, c], i) => (
                <span key={ini} className={i ? '-ml-2.5' : ''}>
                  <Initials text={ini} color={c} ring />
                </span>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Stars />
                <b className="font-display text-[15px]">4.9</b>
              </div>
              <div className="text-[13px] text-lp-muted">
                3,346 servicios completados en la ZMG
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex h-[660px] min-w-0 flex-[1_1_400px] items-center justify-center max-sm:h-[560px]">
          <div className="absolute h-[420px] w-[420px] animate-[lp-spin_60s_linear_infinite] rounded-full border border-dashed border-[rgba(24,193,255,0.25)]" />
          <div className="absolute h-[560px] w-[560px] rounded-full border border-white/[0.05]" />
          <div
            className="relative z-[2] transition-transform duration-[250ms] ease-out"
            style={par(8, 8)}
          >
            <div className="animate-[lp-wordin_1s_ease_.3s_both] max-sm:scale-[0.85]">
              <Phone>
                <HomeScreen />
              </Phone>
            </div>
          </div>
          <div
            className="absolute -right-1.5 top-[70px] z-[3] transition-transform duration-[250ms] ease-out max-sm:right-0"
            style={par(-22, -16)}
          >
            <div className="lp-glass w-[230px] animate-[lp-float_6s_ease-in-out_infinite] rounded-box bg-[rgba(13,33,63,0.9)] p-3.5 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.55)]">
              <Stars />
              <p className="mb-1.5 mt-2 font-display text-[14px] font-bold leading-[1.4]">
                “Excelente trabajo, muy puntual.”
              </p>
              <p className="text-[12px] text-lp-muted">
                María · Calentador · Zapopan
              </p>
            </div>
          </div>
          <div
            className="absolute -left-2.5 bottom-[150px] z-[3] transition-transform duration-[250ms] ease-out max-sm:left-0"
            style={par(-28, -20)}
          >
            <div className="lp-glass flex animate-[lp-float_7s_ease-in-out_.8s_infinite] items-center gap-3 rounded-box bg-[rgba(13,33,63,0.9)] px-3.5 py-3 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.55)]">
              <span className="flex h-9 w-9 items-center justify-center rounded-btn bg-[var(--lp-ok-bg)] text-[var(--lp-ok)]">
                <ShieldCheck size={18} />
              </span>
              <div>
                <div className="font-display text-[13.5px] font-bold">
                  Identidad verificada
                </div>
                <div className="text-[12px] text-lp-muted">
                  INE · domicilio · entrevista
                </div>
              </div>
            </div>
          </div>
          <div
            className="absolute bottom-[60px] right-5 z-[3] transition-transform duration-[250ms] ease-out"
            style={par(-16, -24)}
          >
            <div className="flex animate-[lp-float_5.5s_ease-in-out_.4s_infinite] items-center gap-2.5 rounded-full bg-[var(--lp-blue)] px-4 py-2.5 font-display text-[13.5px] font-bold shadow-[0_18px_40px_-16px_rgba(10,107,207,0.8)]">
              <Navigation size={16} fill="currentColor" />
              Llega en 15 min
            </div>
          </div>
        </div>
      </Container>

      <Container className="relative flex justify-between gap-3 pb-3.5 font-mono text-[10.5px] tracking-[0.14em] text-[var(--lp-coord)] max-sm:hidden">
        <span>20.6597° N · 103.3496° W</span>
        <span>ZMG · RED ACTIVA</span>
        <span>SISTEMA v2.6</span>
      </Container>
      <div className="relative h-px overflow-hidden bg-lp-line">
        <span className="absolute left-0 top-0 h-px w-[30%] animate-[lp-beam_5s_ease-in-out_infinite] bg-[linear-gradient(90deg,transparent,#18C1FF,transparent)]" />
      </div>
      <div className="lp-fade-x relative overflow-hidden">
        <div className="flex w-max animate-[lp-marq_40s_linear_infinite] gap-9 py-[18px]">
          {[...MARQUEE, ...MARQUEE].map((t, i) => (
            <span
              key={i}
              className="flex items-center gap-9 whitespace-nowrap font-mono text-[12px] uppercase tracking-[0.14em] text-lp-muted"
              aria-hidden={i >= MARQUEE.length}
            >
              {t}
              <span className="h-[5px] w-[5px] rounded-full bg-[var(--lp-cyan)]" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Stats con count-up ── */
const STATS = [
  { to: 4.9, fmt: (v: number) => v.toFixed(1), l: 'Calificación promedio', icon: Star },
  {
    to: 3346,
    fmt: (v: number) => Math.round(v).toLocaleString('en-US'),
    l: 'Servicios completados',
    icon: Check,
  },
  { to: 920, fmt: (v: number) => String(Math.round(v)), l: 'Técnicos en la red', icon: Users },
  { to: 30, fmt: (v: number) => String(Math.round(v)), l: 'Días de garantía', icon: ShieldCheck },
];

export function Stats({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const seen = useInViewOnce(ref, 0.4);
  const [p, setP] = useState(1);

  useEffect(() => {
    if (!seen || reduced) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 1600);
      setP(easeOutCubic(k));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    setP(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, reduced]);

  return (
    <section
      ref={ref}
      id="stats"
      className="lp-band relative backdrop-blur-[6px]"
    >
      <Container className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 py-11">
        {STATS.map((s, i) => (
          <div
            key={s.l}
            data-reveal={String((i % 4) * 0.07)}
            className="flex items-center gap-4"
          >
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-box bg-[var(--lp-tile)] text-[var(--lp-link)]">
              <s.icon size={22} />
            </span>
            <div>
              <div className="font-display text-[36px] font-extrabold leading-none tracking-[-1px] tabular">
                {s.fmt(s.to * p)}
              </div>
              <div className="mt-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-lp-muted">
                {s.l}
              </div>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}
