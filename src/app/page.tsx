'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { MotionConfig, motion, useInView, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import {
  Apple, BadgeCheck, Brush, Calendar, Check, ChevronDown, ChevronLeft, CreditCard, Droplets,
  Flame, Hammer, LifeBuoy, Mail, MapPin, MessageCircle, Navigation, Phone, Play, Plus, Search,
  ShieldCheck, Square, Star, TrendingUp, Wallet, Wrench, Zap, type LucideIcon,
} from 'lucide-react';
import { BrandMark } from '@/components/ui';
import { LandingMap } from '@/components/landing-map';

/**
 * Landing pública de marketing (handoff «Landing Tumantenimiento v2», tema
 * oscuro). Réplica hifi del prototipo: mismos colores, tipografía, espaciados
 * y animaciones. Es la raíz del sitio; la consola admin vive en /dashboard
 * (acceso vía /login desde el CTA del nav).
 */

const EASE = [0.2, 0.7, 0.3, 1] as const;

/* ── Reveal al entrar en viewport (opacity 0 / y26 → 0.8s, once) ── */
function R({ delay = 0, className = '', children }: { delay?: number; className?: string; children: React.ReactNode }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1, margin: '0px 0px -6% 0px' }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ── Contador (0 → final, 1.5s cubic-out, al 35% visible, una vez) ── */
function Counter({ to, decimals = 0, className = '' }: { to: number; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduced) { setN(to); return; }
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1500);
      setN(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, reduced]);
  return (
    <span ref={ref} className={className}>
      {decimals ? n.toFixed(decimals) : Math.round(n).toLocaleString('en-US')}
    </span>
  );
}

/* ── Marco iPhone (bezel + isla + status bar + home indicator, 402×874) ── */
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-[874px] w-[402px] overflow-hidden rounded-[48px] bg-black shadow-[0_40px_80px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.12)]">
      <div className="absolute left-1/2 top-[11px] z-50 h-[37px] w-[126px] -translate-x-1/2 rounded-[24px] bg-black" />
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-center gap-[154px] px-6 pb-[19px] pt-[21px]">
        <div className="flex h-[22px] flex-1 items-center justify-center pt-[1.5px]">
          <span className="text-[17px] leading-[22px] text-white [font-family:-apple-system,'SF_Pro',system-ui] [font-weight:590]">9:41</span>
        </div>
        <div className="flex h-[22px] flex-1 items-center justify-center gap-[7px] pr-px pt-px">
          <svg width="19" height="12" viewBox="0 0 19 12">
            <rect x="0" y="7.5" width="3.2" height="4.5" rx="0.7" fill="#fff" />
            <rect x="4.8" y="5" width="3.2" height="7" rx="0.7" fill="#fff" />
            <rect x="9.6" y="2.5" width="3.2" height="9.5" rx="0.7" fill="#fff" />
            <rect x="14.4" y="0" width="3.2" height="12" rx="0.7" fill="#fff" />
          </svg>
          <svg width="17" height="12" viewBox="0 0 17 12">
            <path d="M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z" fill="#fff" />
            <path d="M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z" fill="#fff" />
            <circle cx="8.5" cy="10.5" r="1.5" fill="#fff" />
          </svg>
          <svg width="27" height="13" viewBox="0 0 27 13">
            <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke="#fff" strokeOpacity="0.35" fill="none" />
            <rect x="2" y="2" width="20" height="9" rx="2" fill="#fff" />
            <path d="M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z" fill="#fff" fillOpacity="0.4" />
          </svg>
        </div>
      </div>
      {children}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[60] flex h-[34px] items-end justify-center pb-2">
        <div className="h-[5px] w-[139px] rounded-full bg-white/70" />
      </div>
    </div>
  );
}

const PULSE = 'animate-[pulse-dot_1.6s_ease-in-out_infinite] motion-reduce:animate-none';

/* ── Pantalla 1: home del cliente ── */
const HOME_CATS: [LucideIcon, string][] = [
  [Wrench, 'Plomería'], [Zap, 'Electricidad'], [Flame, 'Gas'], [Brush, 'Pintura'],
  [Hammer, 'Herrería'], [Square, 'Cristales'], [Droplets, 'Drenaje'],
];

function ClientHomeScreen() {
  return (
    <div className="flex h-[874px] flex-col gap-[15px] overflow-hidden bg-canvas px-[18px] pb-[34px] pt-[72px] font-sans">
      <div className="flex items-center gap-3">
        <div className="bg-grad-brand flex h-11 w-11 items-center justify-center rounded-full text-[15px] font-bold text-white">MC</div>
        <div>
          <p className="font-display text-[19px] font-extrabold leading-[1.2] text-navy">Hola, María</p>
          <p className="mt-0.5 flex items-center gap-1 text-[12px] text-muted"><MapPin size={12} />Casa · Providencia, Zapopan</p>
        </div>
      </div>
      <div className="flex min-h-12 items-center gap-[9px] rounded-xl border border-line bg-white px-3.5">
        <Search size={17} className="text-faint" />
        <span className="text-[14px] text-faint">¿Qué necesitas reparar?</span>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-[15px] font-bold text-navy">Categorías</span>
        <span className="text-[12.5px] font-semibold text-primary">Ver todo</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {HOME_CATS.map(([Icon, name]) => (
          <div key={name} className="flex flex-col items-center gap-[7px] rounded-[14px] border border-line bg-white px-1 py-[11px]">
            <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-info-soft"><Icon size={17} className="text-primary" /></span>
            <span className="text-[10px] font-medium text-navy">{name}</span>
          </div>
        ))}
        <div className="flex flex-col items-center gap-[7px] rounded-[14px] border border-line bg-white px-1 py-[11px]">
          <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-surface-2"><Plus size={17} className="text-muted" /></span>
          <span className="text-[10px] font-medium text-muted">Ver más</span>
        </div>
      </div>
      <div className="flex flex-col gap-2.5 rounded-2xl border border-line bg-white p-[13px] shadow-card">
        <div className="flex items-center gap-2.5">
          <span className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full bg-info-soft"><Navigation size={16} className="text-primary" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-navy">Ramón va en camino</p>
            <p className="mt-px text-[10.5px] text-muted">Fuga en el baño · llega en 15 min</p>
          </div>
          <span className="whitespace-nowrap rounded-full bg-info-soft px-[9px] py-[3px] text-[9.5px] font-bold text-primary">En camino</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-2"><div className="bg-grad-progress h-full w-[62%] rounded-full" /></div>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-[15px] font-bold text-navy">Técnicos destacados</span>
        <span className="text-[12.5px] font-semibold text-primary">Ver todos</span>
      </div>
      <div className="flex items-center gap-[11px] rounded-2xl border border-line bg-white p-[13px] shadow-card">
        <div className="bg-grad-brand flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white">RH</div>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-bold text-navy">Ramón Hernández</p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
            <Star size={11} fill="#f59e0b" strokeWidth={0} />
            <b className="font-bold text-navy">4.9</b> · 214 trabajos · Plomería
          </p>
        </div>
        <span className="whitespace-nowrap rounded-full bg-success-soft px-[9px] py-[3px] text-[9.5px] font-bold text-success">Disponible</span>
      </div>
      <div className="mt-auto">
        <div className="flex min-h-[50px] items-center justify-center rounded-xl bg-primary text-[15px] font-semibold text-white">Solicitar servicio</div>
      </div>
    </div>
  );
}

/* ── Pantalla 2: seguimiento SVC-2851 ── */
function TrackingScreen() {
  const done = (label: string, time: string) => (
    <div className="flex gap-[11px]">
      <div className="flex flex-col items-center">
        <span className="flex h-[21px] w-[21px] items-center justify-center rounded-full bg-primary"><Check size={11} strokeWidth={3} className="text-white" /></span>
        <span className="w-[2px] flex-1 bg-primary" />
      </div>
      <div className="pb-3.5">
        <p className="text-[12.5px] font-semibold text-navy">{label}</p>
        <p className="mt-px font-mono text-[9.5px] text-faint">{time}</p>
      </div>
    </div>
  );
  return (
    <div className="flex h-[874px] flex-col gap-3.5 overflow-hidden bg-canvas px-[18px] pb-[34px] pt-[66px] font-sans">
      <div className="flex items-center gap-2.5 border-b border-line pb-3">
        <ChevronLeft size={20} className="text-navy" />
        <div>
          <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-faint">SVC-2851</p>
          <p className="mt-px text-[16px] font-bold text-navy">Seguimiento del servicio</p>
        </div>
      </div>
      <div className="flex items-center gap-[11px] rounded-[14px] bg-info-soft p-[13px]">
        <span className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full bg-white"><Navigation size={16} className="text-primary" /></span>
        <div className="flex-1">
          <p className="text-[13.5px] font-bold text-navy">Ramón va en camino</p>
          <p className="mt-px text-[11px] text-muted">Llega aprox. en 15 min</p>
        </div>
        <span className={`h-[9px] w-[9px] rounded-full bg-cyan ${PULSE}`} />
      </div>
      <div className="rounded-2xl border border-line bg-white p-[15px] shadow-card">
        {done('Solicitado', '10:02')}
        {done('Aceptado', '10:05')}
        <div className="flex gap-[11px]">
          <div className="flex flex-col items-center">
            <span className="box-border flex h-[21px] w-[21px] items-center justify-center rounded-full border-2 border-primary bg-info-soft">
              <span className={`h-[7px] w-[7px] rounded-full bg-primary ${PULSE}`} />
            </span>
            <span className="w-[2px] flex-1 bg-line" />
          </div>
          <div className="pb-3.5">
            <p className="text-[12.5px] font-bold text-primary">En camino</p>
            <p className="mt-px font-mono text-[9.5px] text-faint">10:18</p>
          </div>
        </div>
        <div className="flex gap-[11px]">
          <div className="flex flex-col items-center">
            <span className="box-border h-[21px] w-[21px] rounded-full border-2 border-line bg-white" />
            <span className="w-[2px] flex-1 bg-line" />
          </div>
          <div className="pb-3.5"><p className="text-[12.5px] font-medium text-faint">En servicio</p></div>
        </div>
        <div className="flex gap-[11px]">
          <span className="box-border h-[21px] w-[21px] rounded-full border-2 border-line bg-white" />
          <p className="self-center text-[12.5px] font-medium text-faint">Completado</p>
        </div>
      </div>
      <div className="flex flex-col gap-[9px] rounded-2xl border border-line bg-white p-[13px] shadow-card">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-faint">Chat con Ramón</span>
          <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" />En línea</span>
        </div>
        <div className="max-w-[88%] rounded-[12px_12px_12px_4px] bg-surface-2 px-[11px] py-2 text-[11.5px] leading-[1.45] text-navy">Entendido, llevo refacciones. Llego en 15 min.</div>
        <div className="max-w-[88%] self-end rounded-[12px_12px_4px_12px] bg-primary px-[11px] py-2 text-[11.5px] leading-[1.45] text-white">Perfecto, te espero.</div>
      </div>
      <div className="mt-auto flex gap-2.5">
        <div className="flex min-h-12 flex-1 items-center justify-center gap-[7px] rounded-xl border border-line bg-white text-[13.5px] font-semibold text-primary"><MessageCircle size={15} />Mensaje</div>
        <div className="flex min-h-12 flex-1 items-center justify-center gap-[7px] rounded-xl bg-primary text-[13.5px] font-semibold text-white"><Phone size={15} />Llamar</div>
      </div>
    </div>
  );
}

/* ── Datos de la página ── */
const NAV_LINKS: [string, string][] = [
  ['Servicios', '#servicios'], ['Cómo funciona', '#como'], ['Técnicos', '#tecnicos'],
  ['Cobertura', '#cobertura'], ['Precios', '#precios'], ['FAQ', '#faq'],
];

const MARQUEE = [
  'Fugas', 'Calentadores', 'Drenaje de cocina', 'Instalación de WC', 'Contactos y apagadores',
  'Instalación de lámparas', 'Cambio de regulador', 'Ventanas residenciales', 'Pintura interior', 'Puertas y portones',
];

const CATS: { icon: LucideIcon; name: string; desc: string; price: string }[] = [
  { icon: Wrench, name: 'Plomería', desc: 'Fugas, calentadores, drenaje de cocina, WC', price: 'DESDE $300 MXN' },
  { icon: Zap, name: 'Electricidad', desc: 'Contactos, apagadores e instalación de lámparas', price: 'DESDE $200 MXN' },
  { icon: Flame, name: 'Gas', desc: 'Cambio de regulador y revisión de instalación', price: 'DESDE $300 MXN' },
  { icon: Hammer, name: 'Herrería', desc: 'Puertas, portones y estructuras', price: 'DESDE $600 MXN' },
  { icon: Brush, name: 'Pintura', desc: 'Pintura interior por habitación o casa completa', price: 'DESDE $500 MXN' },
  { icon: Square, name: 'Cristales', desc: 'Ventanas residenciales y reposición de vidrios', price: 'DESDE $350 MXN' },
  { icon: Droplets, name: 'Drenaje', desc: 'Destape de drenaje en cocina y baños', price: 'DESDE $350 MXN' },
];

const STEPS: { icon: LucideIcon; n: string; t: string; b: string }[] = [
  { icon: MessageCircle, n: '01', t: 'Describe tu problema', b: 'Cuéntanos qué pasa y agrega fotos. “Fuga debajo del lavabo del baño” es suficiente.' },
  { icon: BadgeCheck, n: '02', t: 'Elige a tu técnico', b: 'Compara perfiles verificados, calificaciones reales y precios base por servicio.' },
  { icon: Navigation, n: '03', t: 'Sigue todo en vivo', b: 'Ve cuándo acepta, cuándo sale y cuándo llega, con chat directo en la app.' },
  { icon: CreditCard, n: '04', t: 'Paga al terminar', b: 'Pago protegido con tarjeta cuando el trabajo está completo. Después, califica.' },
];

const CHECKS: [string, string][] = [
  ['Identidad oficial validada', 'INE por ambos lados, revisada por nuestro equipo.'],
  ['Comprobante de domicilio', 'Domicilio confirmado, incluso por llamada cuando hace falta.'],
  ['Certificaciones de oficio', 'Especialidades como gas LP requieren certificación vigente.'],
  ['Entrevista de bienvenida', 'Llamada con el equipo de operaciones antes de activar el perfil.'],
];

const TECHS = [
  { i: 'RH', name: 'Ramón Hernández', oficio: 'Plomería', rating: '4.9', jobs: 214 },
  { i: 'AG', name: 'Adriana García Soto', oficio: 'Electricidad', rating: '4.8', jobs: 167 },
  { i: 'JJ', name: 'José Carlos Juárez', oficio: 'Electricidad', rating: '4.9', jobs: 87 },
  { i: 'LP', name: 'Lupita Pérez Vázquez', oficio: 'Pintura', rating: '4.6', jobs: 45 },
];

const ZONE_STATS = [
  { name: 'Guadalajara', warn: false, sub: '240 de 245 colonias · 412 técnicos', pct: 98 },
  { name: 'Zapopan', warn: false, sub: '194 de 198 colonias · 318 técnicos', pct: 98 },
  { name: 'Tlaquepaque', warn: false, sub: '118 de 124 colonias · 142 técnicos', pct: 95 },
  { name: 'Tlajomulco de Zúñiga', warn: true, sub: '41 de 64 colonias · 48 técnicos', pct: 64 },
];

const PRICE_CHECKS = [
  'Rangos publicados por servicio, sin letra chica',
  'Cotización confirmada antes de empezar el trabajo',
  'Pago con tarjeta, protegido de inicio a fin',
  'Garantía de 30 días en cada servicio completado',
];

const PRICES: [string, string][] = [
  ['Fugas de agua', '$300 – $1,500'],
  ['Contactos y apagadores', '$200 – $1,200'],
  ['Calentadores', '$400 – $2,500'],
  ['Cambio de regulador de gas', '$300 – $1,500'],
  ['Pintura interior', '$500 – $4,000'],
  ['Puertas y portones', '$600 – $5,000'],
];

const BENEFITS: { icon: LucideIcon; t: string; b: string }[] = [
  { icon: Wallet, t: 'Cobra directo a tu CLABE', b: 'Retiros a tu cuenta, sin intermediarios.' },
  { icon: Calendar, t: 'Tú pones tu horario', b: 'Disponibilidad por día y hora, a tu medida.' },
  { icon: MapPin, t: 'Trabaja en tu zona', b: 'Define tu radio de cobertura en el mapa.' },
  { icon: LifeBuoy, t: 'Soporte que responde', b: 'Equipo de operaciones local, en la ZMG.' },
];

const FAQS: [string, string][] = [
  ['¿Cómo verifican a los técnicos?', 'Cada técnico pasa por verificación de identidad (INE por ambos lados), comprobante de domicilio, certificaciones de oficio cuando aplican — como gas LP — y una entrevista con nuestro equipo de operaciones. Solo los perfiles aprobados pueden recibir solicitudes.'],
  ['¿Cuánto cuesta un servicio?', 'Cada servicio publica su rango — por ejemplo, una fuga va de $300 a $1,500 MXN. Al elegir técnico ves su precio base, y antes de empezar te confirma la cotización final. Cualquier extra requiere tu aprobación en la app.'],
  ['¿Qué incluye la garantía de 30 días?', 'Si el problema reaparece dentro de los 30 días siguientes al servicio, tu técnico regresa a revisarlo sin costo adicional. Nuestro equipo de soporte coordina la visita.'],
  ['¿Cómo y cuándo pago?', 'Pagas con tarjeta desde la app cuando el servicio está completado. El pago está protegido: el técnico lo recibe solo al terminar el trabajo, y tienes soporte directo si algo no salió bien.'],
  ['¿En qué zonas están disponibles?', 'Operamos en la Zona Metropolitana de Guadalajara: Guadalajara, Zapopan, Tlaquepaque y Tlajomulco de Zúñiga. Si tu colonia aún no aparece, propónla desde la app y la priorizamos.'],
  ['¿Qué necesito para registrarme como técnico?', 'INE vigente, comprobante de domicilio, CLABE para tus cobros y — según tu especialidad — certificación de oficio. Descargas la app, subes tus documentos y nuestro equipo revisa tu perfil para activarlo.'],
];

/* ── Piezas compartidas ── */
const KICKER = 'mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-cyan';
const H2 = 'mb-3 font-display text-[38px] font-extrabold leading-[1.3] tracking-[-1px] text-white [text-wrap:pretty]';
const GRAD_TEXT = 'bg-[linear-gradient(92deg,#7CD8FF,#18C1FF_45%,#0894EA)] bg-clip-text text-transparent';
const GRAD_NUM = 'bg-[linear-gradient(92deg,#7CD8FF,#18C1FF_50%,#0894EA)] bg-clip-text text-transparent';
const GLASS_CHIP = 'rounded-full border border-white/[0.12] bg-white/[0.05] px-3.5 py-[7px] text-[12.5px] text-white/85';
const ICON_TILE = 'bg-grad-brand flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center shadow-[0_8px_22px_rgba(10,107,207,0.4)]';
const STORE_BADGE = 'flex items-center gap-2.5 rounded-[13px] border border-white/[0.18] bg-white/[0.08] py-[9px] pl-3.5 pr-[18px] text-left text-white backdrop-blur-[10px] transition-all duration-200 hover:border-cyan/50 hover:bg-white/[0.16] hover:shadow-[0_8px_30px_rgba(24,193,255,0.2)] min-h-[54px] cursor-pointer';

function StarRow({ size = 13, className = '' }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex gap-0.5 ${className}`}>
      {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={size} fill="#F59E0B" strokeWidth={0} />)}
    </span>
  );
}

export default function LandingPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#081A33] font-sans leading-[normal] text-white antialiased">

        {/* ── Nav ── */}
        <header className="sticky top-0 z-[60] border-b border-white/[0.08] bg-[rgba(8,26,51,0.72)] backdrop-blur-[16px]">
          <div className="mx-auto flex h-[66px] max-w-[1160px] items-center gap-7 px-6">
            <a href="#top" className="flex items-center gap-2.5">
              <BrandMark size={33} className="rounded-[9px] shadow-[0_4px_16px_rgba(24,193,255,0.25)]" />
              <span className="font-display text-[17px] font-extrabold tracking-[-0.2px] text-white">Tumantenimiento</span>
            </a>
            <nav className="ml-auto flex items-center gap-[22px] max-md:hidden">
              {NAV_LINKS.map(([label, href]) => (
                <a key={href} href={href} className="text-[13.5px] font-medium text-white/65 transition-colors hover:text-white">{label}</a>
              ))}
            </nav>
            <div className="flex items-center gap-2.5">
              <a href="#unete" className="mr-1 text-[13.5px] font-medium text-white/65 transition-colors hover:text-white">Soy técnico</a>
              <Link href="/login" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-white/[0.16] bg-white/[0.06] px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-white/[0.12]">Iniciar sesión</Link>
              <a href="#top" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[linear-gradient(90deg,#0A6BCF,#18C1FF)] px-[18px] text-[13.5px] font-bold text-white shadow-[0_6px_20px_rgba(10,107,207,0.45)] transition-[filter] hover:brightness-[1.12]">Descargar app</a>
            </div>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -left-[140px] -top-[200px] h-[620px] w-[620px] animate-[aur-a_22s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(10,107,207,0.55),transparent_65%)] blur-[70px] motion-reduce:animate-none" />
          <div className="pointer-events-none absolute -right-[180px] top-10 h-[540px] w-[540px] animate-[aur-b_26s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(24,193,255,0.32),transparent_65%)] blur-[80px] motion-reduce:animate-none" />
          <div className="pointer-events-none absolute -bottom-[280px] left-[30%] h-[580px] w-[580px] animate-[aur-c_30s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(8,148,234,0.28),transparent_65%)] blur-[90px] motion-reduce:animate-none" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.75)_1px,transparent_1px)] opacity-[0.07] [background-size:26px_26px]" />
          <div className="relative mx-auto grid max-w-[1160px] grid-cols-[1.05fr_0.95fr] items-center gap-10 px-6 pb-10 pt-[72px] max-lg:grid-cols-1">
            <div>
              <R className="mb-[18px]">
                <p className="inline-flex items-center gap-[9px] rounded-full border border-white/[0.14] bg-white/[0.05] px-3.5 py-[7px] font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-cyan">
                  <span className={`h-[7px] w-[7px] rounded-full bg-cyan ${PULSE}`} />
                  Servicios a domicilio · ZMG
                </p>
              </R>
              <R delay={0.05}>
                <h1 className="mb-5 font-display text-[60px] font-extrabold leading-[1.04] tracking-[-1.8px] text-white [text-wrap:pretty]">
                  El técnico correcto, <span className={GRAD_TEXT}>verificado y en camino.</span>
                </h1>
              </R>
              <R delay={0.1}>
                <p className="mb-[30px] max-w-[470px] text-[17px] leading-[1.65] text-white/[0.68] [text-wrap:pretty]">
                  Plomería, electricidad, gas y más. Pide desde la app, sigue cada paso en tiempo real y paga protegido al terminar — con garantía de 30 días por escrito.
                </p>
              </R>
              <R delay={0.15} className="mb-7 flex flex-wrap items-center gap-3">
                <button type="button" className={STORE_BADGE}>
                  <Apple size={22} />
                  <span>
                    <span className="block font-mono text-[8.5px] uppercase tracking-[0.14em] text-white/55">Descárgala en el</span>
                    <span className="block text-[15px] font-bold leading-[1.25]">App Store</span>
                  </span>
                </button>
                <button type="button" className={STORE_BADGE}>
                  <Play size={19} fill="currentColor" strokeWidth={0} />
                  <span>
                    <span className="block font-mono text-[8.5px] uppercase tracking-[0.14em] text-white/55">Disponible en</span>
                    <span className="block text-[15px] font-bold leading-[1.25]">Google Play</span>
                  </span>
                </button>
              </R>
              <R delay={0.2} className="flex flex-wrap items-center gap-2.5">
                <span className={`inline-flex items-center gap-1.5 ${GLASS_CHIP}`}>
                  <Star size={13} fill="#F59E0B" strokeWidth={0} />
                  <b className="font-bold text-white">4.9</b>&nbsp;promedio
                </span>
                <span className={GLASS_CHIP}><b className="font-bold text-white">3,346</b> servicios completados</span>
                <span className={`inline-flex items-center gap-1.5 ${GLASS_CHIP}`}>
                  <ShieldCheck size={13} className="text-cyan" />Garantía 30 días
                </span>
              </R>
            </div>
            <div className="relative flex h-[700px] items-center justify-center max-lg:hidden">
              <div className="absolute top-[130px] h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(24,193,255,0.28),transparent_68%)] blur-[50px]" />
              <div className="relative z-[2] h-[630px] w-[290px] transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)] [transform:perspective(1400px)_rotateY(-9deg)_rotateX(3deg)] hover:[transform:perspective(1400px)_rotateY(0deg)_rotateX(0deg)] motion-reduce:transition-none">
                <div className="h-[874px] w-[402px] origin-top-left scale-[0.72]">
                  <PhoneFrame><ClientHomeScreen /></PhoneFrame>
                </div>
              </div>
              <div className="absolute -right-2.5 top-[104px] z-[3] w-[218px] animate-[float-a_6s_ease-in-out_infinite] rounded-2xl border border-white/[0.14] bg-[rgba(13,36,69,0.78)] p-3.5 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-[14px] motion-reduce:animate-none">
                <StarRow className="mb-[7px]" />
                <p className="mb-1.5 text-[12.5px] font-semibold leading-[1.45] text-white">“Excelente trabajo, muy puntual.”</p>
                <p className="text-[10.5px] text-white/50">María · Calentador · Zapopan</p>
              </div>
              <div className="absolute -left-2 bottom-[120px] z-[3] flex animate-[float-b_7.5s_ease-in-out_0.9s_infinite] items-center gap-2 rounded-full border border-white/[0.14] bg-[rgba(13,36,69,0.78)] px-[17px] py-[11px] shadow-[0_18px_48px_rgba(0,0,0,0.4)] backdrop-blur-[14px] motion-reduce:animate-none">
                <span className={`h-2 w-2 rounded-full bg-cyan ${PULSE}`} />
                <span className="text-[12.5px] font-semibold text-white">89 técnicos en línea</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Marquee ── */}
        <div className="overflow-hidden border-y border-white/[0.07] bg-white/[0.025] [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
          <div className="flex w-max animate-[marquee_32s_linear_infinite] items-center py-[15px] motion-reduce:animate-none">
            {[...MARQUEE, ...MARQUEE].map((t, i) => (
              <Fragment key={i}>
                <span className="mr-[34px] whitespace-nowrap font-mono text-[11.5px] uppercase tracking-[0.14em] text-white/45">{t}</span>
                <span className="mr-[34px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-cyan opacity-60" />
              </Fragment>
            ))}
          </div>
        </div>

        {/* ── Categorías ── */}
        <section id="servicios" className="scroll-mt-[72px]">
          <div className="mx-auto max-w-[1160px] px-6 py-24">
            <R><p className={KICKER}>Categorías de servicio</p></R>
            <R delay={0.05}><h2 className={H2}>Un técnico para cada problema</h2></R>
            <R delay={0.1}>
              <p className="mb-10 max-w-[560px] text-[15.5px] leading-[1.6] text-white/60 [text-wrap:pretty]">
                Siete especialidades con rangos de precio publicados. La cotización final siempre la confirma tu técnico antes de empezar.
              </p>
            </R>
            <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {CATS.map((c, i) => (
                <R key={c.name} delay={(i % 4) * 0.06}>
                  <div className="h-full rounded-[18px] border border-white/[0.09] bg-white/[0.045] p-[22px] backdrop-blur-[8px] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-cyan/45 hover:shadow-[0_14px_44px_rgba(24,193,255,0.14)]">
                    <span className={`${ICON_TILE} mb-[15px] rounded-[13px]`}><c.icon size={21} className="text-white" /></span>
                    <p className="mb-[5px] text-[16px] font-bold text-white">{c.name}</p>
                    <p className="mb-3.5 text-[12.5px] leading-[1.55] text-white/55">{c.desc}</p>
                    <p className="font-mono text-[11px] font-semibold text-cyan">{c.price}</p>
                  </div>
                </R>
              ))}
              <R delay={0.18}>
                <div className="flex h-full flex-col justify-center rounded-[18px] border border-dashed border-white/[0.16] bg-white/[0.02] p-[22px]">
                  <p className="mb-1.5 text-[16px] font-bold text-white">¿No ves tu servicio?</p>
                  <p className="mb-3 text-[12.5px] leading-[1.55] text-white/55">Descríbelo en la app y lo canalizamos con el técnico adecuado.</p>
                  <a href="#faq" className="self-start text-[13px] font-semibold text-cyan transition-colors hover:text-[#7CD8FF]">Más información →</a>
                </div>
              </R>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section id="stats" className="relative overflow-hidden border-y border-white/[0.07] bg-white/[0.025]">
          <div className="pointer-events-none absolute -top-[180px] left-1/2 h-[360px] w-[700px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(10,107,207,0.3),transparent_70%)] blur-[60px]" />
          <div className="relative mx-auto grid max-w-[1160px] grid-cols-4 gap-6 px-6 py-14 max-lg:grid-cols-2">
            {([
              [<Counter key="c" to={4.9} decimals={1} className={GRAD_NUM} />, 'Calificación promedio'],
              [<Counter key="c" to={3346} className={GRAD_NUM} />, 'Servicios completados'],
              [<Counter key="c" to={920} className={GRAD_NUM} />, 'Técnicos en la red'],
              [<span key="c" className={GRAD_NUM}>30 días</span>, 'Garantía por escrito'],
            ] as [React.ReactNode, string][]).map(([num, label]) => (
              <div key={label} className="text-center">
                <p className="font-display text-[46px] font-extrabold tracking-[-1px]">{num}</p>
                <p className="mt-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/50">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Cómo funciona ── */}
        <section id="como" className="scroll-mt-[72px]">
          <div className="mx-auto grid max-w-[1160px] grid-cols-[1.1fr_0.9fr] items-center gap-14 px-6 py-24 max-lg:grid-cols-1">
            <div>
              <R><p className={KICKER}>Cómo funciona</p></R>
              <R delay={0.05}><h2 className={H2}>Del problema a la solución, en cuatro pasos</h2></R>
              <R delay={0.1}>
                <p className="mb-9 max-w-[520px] text-[15.5px] leading-[1.6] text-white/60 [text-wrap:pretty]">
                  Cada servicio pasa por los mismos estados — solicitado, aceptado, en camino, en servicio y completado — y tú los ves todos en vivo.
                </p>
              </R>
              <div className="flex flex-col">
                {STEPS.map((s, i) => (
                  <R key={s.n} delay={i * 0.06}>
                    <div className="flex gap-[18px]">
                      <div className="flex flex-col items-center">
                        <span className={`${ICON_TILE} rounded-[14px]`}><s.icon size={20} className="text-white" /></span>
                        {i < STEPS.length - 1 && <span className="my-2 w-[2px] flex-1 bg-[linear-gradient(180deg,rgba(24,193,255,0.5),rgba(24,193,255,0.08))]" />}
                      </div>
                      <div className={i < STEPS.length - 1 ? 'pb-[26px]' : ''}>
                        <p className="mb-[5px] mt-0.5 text-[16px] font-bold text-white">
                          <span className="mr-[9px] font-mono text-[11.5px] font-semibold text-cyan">{s.n}</span>{s.t}
                        </p>
                        <p className="max-w-[400px] text-[13.5px] leading-[1.6] text-white/60">{s.b}</p>
                      </div>
                    </div>
                  </R>
                ))}
              </div>
            </div>
            <div className="flex justify-center max-lg:hidden">
              <div className="relative">
                <div className="absolute left-1/2 top-[120px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(10,107,207,0.3),transparent_68%)] blur-[50px]" />
                <div className="relative h-[675px] w-[310px] transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)] [transform:perspective(1400px)_rotateY(8deg)_rotateX(2deg)] hover:[transform:perspective(1400px)_rotateY(0deg)_rotateX(0deg)] motion-reduce:transition-none">
                  <div className="h-[874px] w-[402px] origin-top-left scale-[0.77]">
                    <PhoneFrame><TrackingScreen /></PhoneFrame>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Técnicos verificados ── */}
        <section id="tecnicos" className="scroll-mt-[72px] border-t border-white/[0.07] bg-white/[0.02]">
          <div className="mx-auto grid max-w-[1160px] grid-cols-[0.9fr_1.1fr] items-center gap-14 px-6 py-24 max-lg:grid-cols-1">
            <div>
              <R><p className={KICKER}>Técnicos verificados</p></R>
              <R delay={0.05}><h2 className={H2}>Verificados uno por uno, sin excepciones</h2></R>
              <R delay={0.1}>
                <p className="mb-7 text-[15.5px] leading-[1.6] text-white/60 [text-wrap:pretty]">
                  Nadie aparece en la app sin pasar el proceso completo de verificación. Solo el técnico aprobado puede recibir solicitudes.
                </p>
              </R>
              <div className="flex flex-col gap-[15px]">
                {CHECKS.map(([t, b], i) => (
                  <R key={t} delay={i * 0.05}>
                    <div className="flex items-start gap-3">
                      <ShieldCheck size={19} className="mt-px flex-shrink-0 text-cyan" />
                      <div>
                        <p className="text-[14.5px] font-bold text-white">{t}</p>
                        <p className="mt-0.5 text-[13px] leading-[1.55] text-white/55">{b}</p>
                      </div>
                    </div>
                  </R>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-[15px] grid grid-cols-2 gap-[15px] max-sm:grid-cols-1">
                {TECHS.map((t, i) => (
                  <R key={t.i} delay={i * 0.05}>
                    <div className="flex items-center gap-3 rounded-[18px] border border-white/[0.09] bg-white/[0.045] p-[17px] backdrop-blur-[8px] transition-[border-color] duration-200 hover:border-cyan/40">
                      <div className="bg-grad-brand flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white shadow-[0_6px_18px_rgba(10,107,207,0.45)]">{t.i}</div>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-bold text-white">{t.name}</p>
                        <p className="mb-[3px] mt-0.5 text-[11.5px] text-white/55">{t.oficio}</p>
                        <p className="flex items-center gap-1 text-[11px] text-white/55">
                          <Star size={11} fill="#F59E0B" strokeWidth={0} /><b className="text-white">{t.rating}</b> · {t.jobs} trabajos
                        </p>
                      </div>
                    </div>
                  </R>
                ))}
              </div>
              <R delay={0.2}>
                <div className="flex items-start gap-3.5 rounded-[18px] border border-cyan/25 bg-[linear-gradient(135deg,rgba(10,107,207,0.14),rgba(24,193,255,0.07))] px-[21px] py-[19px] backdrop-blur-[8px]">
                  <StarRow className="mt-[3px]" />
                  <div>
                    <p className="mb-[5px] text-[14px] font-semibold leading-[1.5] text-white">“Excelente trabajo, muy puntual.”</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[12px] text-white/50">María · Reparación de calentador · Zapopan</span>
                      <span className="rounded-full bg-cyan/15 px-[9px] py-0.5 text-[10.5px] font-bold text-cyan">Puntual</span>
                      <span className="rounded-full bg-cyan/15 px-[9px] py-0.5 text-[10.5px] font-bold text-cyan">Profesional</span>
                    </div>
                  </div>
                </div>
              </R>
            </div>
          </div>
        </section>

        {/* ── Cobertura / mapa ── */}
        <section id="cobertura" className="scroll-mt-[72px] border-t border-white/[0.07]">
          <div className="mx-auto max-w-[1160px] px-6 py-24">
            <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
              <div>
                <R><p className={KICKER}>Cobertura en vivo</p></R>
                <R delay={0.05}><h2 className={H2}>Operando en la ZMG</h2></R>
                <R delay={0.1}>
                  <p className="max-w-[540px] text-[15.5px] leading-[1.6] text-white/60 [text-wrap:pretty]">
                    Zona Metropolitana de Guadalajara: cuatro municipios activos, radios de cobertura de técnicos reales y demanda en tiempo real. Explora el mapa.
                  </p>
                </R>
              </div>
              <R delay={0.15}>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.06] px-[15px] py-2 font-mono text-[11px] font-medium tracking-[0.1em] text-white">
                  <span className={`h-[7px] w-[7px] rounded-full bg-cyan ${PULSE}`} />
                  593/631 COLONIAS CUBIERTAS
                </span>
              </R>
            </div>
            <R>
              <div className="relative h-[560px] overflow-hidden rounded-[20px] border border-white/[0.12] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
                <div className="absolute inset-0"><LandingMap /></div>
                <div className="pointer-events-none absolute right-4 top-4 z-[500] flex flex-col gap-[9px] rounded-[14px] border border-white/[0.14] bg-[rgba(13,36,69,0.85)] px-[15px] py-[13px] backdrop-blur-[14px]">
                  <span className="flex items-center gap-[9px] text-[11.5px] text-white/80"><span className="h-3 w-3 rounded-[4px] border-[1.5px] border-cyan bg-cyan/25" />Zona con cobertura</span>
                  <span className="flex items-center gap-[9px] text-[11.5px] text-white/80"><span className="h-3 w-3 rounded-[4px] border-[1.5px] border-warning bg-warning/25" />Cobertura parcial</span>
                  <span className="flex items-center gap-[9px] text-[11.5px] text-white/80"><span className="h-3 w-3 rounded-full border-[1.5px] border-dashed border-cyan" />Radio de técnico</span>
                  <span className="flex items-center gap-[9px] text-[11.5px] text-white/80"><span className="mx-[3px] h-1.5 w-1.5 rounded-full bg-cyan" />Demanda activa</span>
                </div>
              </div>
            </R>
            <div className="mt-4 grid grid-cols-4 gap-[15px] max-lg:grid-cols-2 max-sm:grid-cols-1">
              {ZONE_STATS.map((z, i) => (
                <R key={z.name} delay={i * 0.06}>
                  <div className="h-full rounded-2xl border border-white/[0.09] bg-white/[0.045] px-[18px] py-4">
                    <div className="mb-1.5 flex items-center justify-between">
                      <p className="text-[14.5px] font-bold text-white">{z.name}</p>
                      <span className={`rounded-full px-[9px] py-[3px] text-[10px] font-bold ${z.warn ? 'bg-warning/[0.16] text-warning' : 'bg-cyan/15 text-cyan'}`}>{z.warn ? 'Parcial' : 'Total'}</span>
                    </div>
                    <p className="mb-[9px] text-[11.5px] text-white/55">{z.sub}</p>
                    <div className="h-[5px] overflow-hidden rounded-full bg-white/[0.09]">
                      <div
                        className="h-full"
                        style={{ width: `${z.pct}%`, backgroundImage: z.warn ? 'linear-gradient(90deg, #F59E0B, #18C1FF)' : 'linear-gradient(90deg, #0A6BCF, #18C1FF)' }}
                      />
                    </div>
                  </div>
                </R>
              ))}
            </div>
          </div>
        </section>

        {/* ── Precios ── */}
        <section id="precios" className="scroll-mt-[72px] border-t border-white/[0.07] bg-white/[0.02]">
          <div className="mx-auto grid max-w-[1160px] grid-cols-2 items-center gap-14 px-6 py-24 max-lg:grid-cols-1">
            <div>
              <R><p className={KICKER}>Precios y cotización</p></R>
              <R delay={0.05}><h2 className={H2}>Precios claros desde el inicio</h2></R>
              <R delay={0.1}>
                <p className="mb-7 text-[15.5px] leading-[1.6] text-white/60 [text-wrap:pretty]">
                  Cada servicio publica su rango. Antes de empezar, tu técnico confirma la cotización — y no pagas hasta que el trabajo termina.
                </p>
              </R>
              <div className="flex flex-col gap-[13px]">
                {PRICE_CHECKS.map((t, i) => (
                  <R key={t} delay={i * 0.05}>
                    <div className="flex items-center gap-[11px]">
                      <Check size={17} strokeWidth={2.5} className="flex-shrink-0 text-cyan" />
                      <span className="text-[14.5px] text-white/85">{t}</span>
                    </div>
                  </R>
                ))}
              </div>
            </div>
            <R delay={0.1}>
              <div className="overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.045] shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-[10px]">
                <div className="flex justify-between border-b border-white/[0.09] bg-white/[0.04] px-[22px] py-[15px]">
                  <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/45">Servicio</span>
                  <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/45">Rango MXN</span>
                </div>
                {PRICES.map(([name, range]) => (
                  <div key={name} className="flex items-center justify-between border-b border-white/[0.07] px-[22px] py-3.5 transition-colors hover:bg-white/[0.05]">
                    <span className="text-[14px] font-medium text-white">{name}</span>
                    <span className="font-mono text-[13px] text-cyan">{range}</span>
                  </div>
                ))}
                <p className="bg-white/[0.03] px-[22px] py-3.5 text-[11.5px] leading-[1.55] text-white/45">
                  La cotización final siempre la confirma tu técnico antes de empezar. Extras solo con tu aprobación en la app.
                </p>
              </div>
            </R>
          </div>
        </section>

        {/* ── Únete como técnico ── */}
        <section id="unete" className="scroll-mt-[72px]">
          <div className="mx-auto max-w-[1160px] px-6 py-24">
            <R>
              <div className="relative overflow-hidden rounded-[26px] bg-[linear-gradient(135deg,#0E2C56,#0A6BCF_55%,#18C1FF)] shadow-[0_30px_90px_rgba(10,107,207,0.35)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.9)_1px,transparent_1px)] opacity-[0.12] [background-size:22px_22px]" />
                <div className="pointer-events-none absolute -right-20 -top-[120px] h-[340px] w-[340px] rounded-full bg-cyan/35 blur-[80px]" />
                <div className="relative grid grid-cols-[1.1fr_0.9fr] items-center gap-14 px-14 py-16 max-lg:grid-cols-1 max-sm:px-7">
                  <div>
                    <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-white/85">Para técnicos</p>
                    <h2 className={H2}>Tu oficio. Tu agenda. Tus ingresos.</h2>
                    <p className="mb-[30px] max-w-[480px] text-[15.5px] leading-[1.6] text-white/[0.78] [text-wrap:pretty]">
                      Únete a la red de técnicos verificados de la ZMG. Tú decides dónde, cuándo y qué servicios ofreces — nosotros te llevamos los clientes.
                    </p>
                    <div className="mb-8 grid grid-cols-2 gap-5 max-sm:grid-cols-1">
                      {BENEFITS.map(b => (
                        <div key={b.t} className="flex items-start gap-[11px]">
                          <span className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.18] bg-white/[0.14]"><b.icon size={17} className="text-white" /></span>
                          <div>
                            <p className="text-[14px] font-bold text-white">{b.t}</p>
                            <p className="mt-0.5 text-[12.5px] leading-[1.5] text-white/[0.68]">{b.b}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button type="button" className="inline-flex min-h-[50px] cursor-pointer items-center justify-center rounded-[13px] bg-white px-[26px] text-[14.5px] font-bold text-navy shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-colors hover:bg-info-soft">Regístrate como técnico</button>
                      <a href="#faq" className="inline-flex min-h-[50px] items-center justify-center rounded-[13px] border border-white/40 bg-white/[0.08] px-[22px] text-[14.5px] font-semibold text-white transition-colors hover:bg-white/[0.18]">Conoce los requisitos</a>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="relative w-[340px] animate-[float-b_8s_ease-in-out_infinite] motion-reduce:animate-none">
                      <div className="rounded-[18px] bg-white p-[22px] shadow-[0_30px_70px_rgba(0,0,0,0.4)]">
                        <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">Tu billetera</p>
                        <p className="font-display text-[32px] font-extrabold text-navy">$4,820 <span className="text-[15px] font-bold text-faint">MXN</span></p>
                        <p className="mb-4 mt-0.5 text-[12px] text-muted">Saldo disponible</p>
                        <div className="mb-3.5 h-px bg-line" />
                        <div className="mb-3 flex items-center gap-2.5">
                          <span className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] bg-success-soft"><TrendingUp size={15} className="text-success" /></span>
                          <div className="flex-1">
                            <p className="text-[13px] font-semibold text-navy">Reparación de calentador</p>
                            <p className="mt-px font-mono text-[10px] text-faint">SVC-2835 · pagado</p>
                          </div>
                          <span className="font-mono text-[13px] font-semibold text-success">+$1,394</span>
                        </div>
                        <div className="mb-4 flex items-center gap-2.5">
                          <span className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] bg-surface-2"><Wallet size={15} className="text-muted" /></span>
                          <div className="flex-1">
                            <p className="text-[13px] font-semibold text-navy">Retiro procesado</p>
                            <p className="mt-px font-mono text-[10px] text-faint">CLABE ····4567</p>
                          </div>
                          <span className="font-mono text-[13px] font-semibold text-navy">−$3,000</span>
                        </div>
                        <div className="flex min-h-[46px] items-center justify-center rounded-xl bg-primary text-[14px] font-semibold text-white">Retirar a mi cuenta</div>
                      </div>
                      <span className="absolute -right-2.5 -top-[13px] inline-flex items-center gap-1.5 rounded-full bg-success-soft px-[13px] py-[7px] text-[11px] font-bold text-success shadow-[0_10px_26px_rgba(0,0,0,0.35)]">
                        <BadgeCheck size={13} />Verificación aprobada
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </R>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="scroll-mt-[72px]">
          <div className="mx-auto max-w-[780px] px-6 pb-24 pt-10">
            <R><p className={`${KICKER} text-center`}>Preguntas frecuentes</p></R>
            <R delay={0.05}><h2 className={`${H2} mb-9 text-center`}>Resolvemos tus dudas</h2></R>
            <div className="flex flex-col gap-3">
              {FAQS.map(([q, a], i) => (
                <R key={q} delay={i * 0.04}>
                  <details open={i === 0} className="group rounded-[14px] border border-white/10 bg-white/[0.045] backdrop-blur-[8px]">
                    <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-[18px] group-open:border-b group-open:border-white/[0.09] [&::-webkit-details-marker]:hidden">
                      <span className="flex-1 text-[15px] font-semibold text-white">{q}</span>
                      <ChevronDown size={17} className="flex-shrink-0 text-cyan transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <p className="px-5 pb-[19px] pt-[15px] text-[14px] leading-[1.65] text-white/60">{a}</p>
                  </details>
                </R>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-white/[0.08] bg-[#061428]">
          <div className="mx-auto max-w-[1160px] px-6 pt-16">
            <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 pb-12 max-lg:grid-cols-2 max-sm:grid-cols-1">
              <div>
                <div className="mb-3.5 flex items-center gap-2.5">
                  <BrandMark size={34} className="rounded-[10px]" />
                  <span className="font-display text-[17px] font-extrabold tracking-[-0.2px] text-white">Tumantenimiento</span>
                </div>
                <p className="mb-5 max-w-[280px] text-[13.5px] leading-[1.6] text-white/55">
                  Servicios de mantenimiento a domicilio con técnicos verificados en la Zona Metropolitana de Guadalajara.
                </p>
                <div className="flex gap-2.5">
                  <button type="button" className="flex cursor-pointer items-center gap-2 rounded-[10px] border border-white/[0.14] bg-white/[0.07] px-3.5 py-2 text-white transition-colors hover:bg-white/[0.14]">
                    <Apple size={16} /><span className="text-[12.5px] font-semibold">App Store</span>
                  </button>
                  <button type="button" className="flex cursor-pointer items-center gap-2 rounded-[10px] border border-white/[0.14] bg-white/[0.07] px-3.5 py-2 text-white transition-colors hover:bg-white/[0.14]">
                    <Play size={13} fill="currentColor" strokeWidth={0} /><span className="text-[12.5px] font-semibold">Google Play</span>
                  </button>
                </div>
              </div>
              <div>
                <p className="mb-3.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/40">Servicios</p>
                <div className="flex flex-col gap-2.5">
                  {['Plomería', 'Electricidad', 'Gas', 'Pintura', 'Ver todas'].map(l => (
                    <a key={l} href="#servicios" className="text-[13.5px] text-white/70 transition-colors hover:text-cyan">{l}</a>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/40">Plataforma</p>
                <div className="flex flex-col gap-2.5">
                  {([['Cómo funciona', '#como'], ['Técnicos verificados', '#tecnicos'], ['Cobertura', '#cobertura'], ['Precios', '#precios'], ['Únete como técnico', '#unete']] as const).map(([l, href]) => (
                    <a key={l} href={href} className="text-[13.5px] text-white/70 transition-colors hover:text-cyan">{l}</a>
                  ))}
                  <Link href="/login" className="text-[13.5px] text-white/70 transition-colors hover:text-cyan">Iniciar sesión</Link>
                </div>
              </div>
              <div>
                <p className="mb-3.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/40">Contacto</p>
                <div className="flex flex-col gap-2.5">
                  <a href="mailto:soporte@tumantenimiento.mx" className="inline-flex items-center gap-2 text-[13.5px] text-white/70 transition-colors hover:text-cyan">
                    <Mail size={14} />soporte@tumantenimiento.mx
                  </a>
                  <span className="inline-flex items-center gap-2 text-[13.5px] text-white/70"><Phone size={14} />+52 33 0000 0000</span>
                  <span className="inline-flex items-start gap-2 text-[13.5px] text-white/70"><MapPin size={14} className="mt-0.5" />Guadalajara, Jalisco, México</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-5 border-t border-white/[0.08] pb-[26px] pt-[22px]">
              <span className="text-[12px] text-white/45">© 2026 Tumantenimiento. Todos los derechos reservados.</span>
              <div className="ml-auto flex items-center gap-[18px]">
                <a href="#faq" className="text-[12px] text-white/45 transition-colors hover:text-cyan">Términos y condiciones</a>
                <a href="#faq" className="text-[12px] text-white/45 transition-colors hover:text-cyan">Aviso de privacidad</a>
                <span className="font-mono text-[10.5px] tracking-[0.1em] text-white/30">HECHO EN LA ZMG</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
