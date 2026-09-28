'use client';

import type { ReactNode } from 'react';
import {
  CreditCard,
  Droplet,
  Flame,
  KeyRound,
  MapPin,
  MessageSquare,
  Phone as PhoneIcon,
  Search,
  ShieldCheck,
  Snowflake,
  Star,
  WashingMachine,
  Zap,
} from 'lucide-react';

// Mockups de la app (tema claro de la app, como en el handoff). Todo es
// ilustrativo: datos de ejemplo, sin llamadas.

/** Marco iPhone 402×874 escalado (0.74 → 298×646 por defecto). */
export function Phone({
  children,
  scale = 0.74,
}: {
  children: ReactNode;
  scale?: number;
}) {
  return (
    <div
      className="relative"
      style={{ width: 402 * scale, height: 874 * scale }}
    >
      <div
        className="origin-top-left"
        style={{ transform: `scale(${scale})`, width: 402, height: 874 }}
      >
        <div className="relative h-[874px] w-[402px] overflow-hidden rounded-[52px] border-[10px] border-[#0b0f17] bg-black shadow-[0_40px_90px_-30px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.08)]">
          <div className="absolute left-1/2 top-[11px] z-50 h-[34px] w-[118px] -translate-x-1/2 rounded-[22px] bg-black" />
          <div className="absolute inset-x-0 top-0 z-40 flex justify-between px-8 pt-[18px] font-sans text-[15px] font-semibold text-navy">
            <span>9:41</span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-4 rounded-sm border border-navy/60" />
            </span>
          </div>
          <div className="absolute inset-0 overflow-hidden rounded-[42px] bg-surface text-navy">
            {children}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-2 z-50 flex justify-center">
            <div className="h-[5px] w-[134px] rounded-full bg-navy/80" />
          </div>
        </div>
      </div>
    </div>
  );
}

const CTA =
  'absolute inset-x-4 bottom-[34px] flex h-[54px] items-center justify-center rounded-btn font-display text-[15.5px] font-bold text-white';

function Header({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="px-[18px] pb-3 pt-[66px]">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">
        {kicker}
      </p>
      <p className="mt-[3px] font-display text-[25px] font-extrabold tracking-[-0.5px]">
        {title}
      </p>
    </div>
  );
}

const APP_CATS = [
  [Droplet, 'Plomería'],
  [Zap, 'Electricidad'],
  [Flame, 'Gas'],
  [Snowflake, 'Aire'],
  [WashingMachine, 'Línea blanca'],
  [KeyRound, 'Cerrajería'],
] as const;

function Progress({ done, total }: { done: number; total: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-1 flex-1 rounded-sm ${i < done ? 'bg-primary' : 'bg-line'}`}
        />
      ))}
    </div>
  );
}

export function HomeScreen() {
  return (
    <div className="relative h-full font-sans">
      <Header kicker="Casa · Providencia" title="Hola, María" />
      <div className="flex flex-col gap-3.5 px-4">
        <div className="flex h-[50px] items-center gap-2.5 rounded-box border border-line bg-white px-3.5 text-faint">
          <Search size={19} />
          <span className="text-[14.5px]">¿Qué necesitas reparar?</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {APP_CATS.map(([Icon, name]) => (
            <div
              key={name}
              className="flex flex-col items-center gap-2 rounded-box border border-line bg-white px-1.5 py-3.5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-info-soft text-primary">
                <Icon size={21} />
              </span>
              <span className="text-[12.5px] font-semibold">{name}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 rounded-box border border-line bg-white p-3.5">
          <div className="flex justify-between">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">
              Servicio en curso
            </span>
            <span className="rounded-full bg-info-soft px-2.5 py-[3px] text-[12px] font-semibold text-primary">
              En camino
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy font-display text-[15px] font-extrabold text-white">
              RH
            </span>
            <div>
              <p className="font-display text-[15.5px] font-bold">
                Ramón Hernández
              </p>
              <p className="mt-0.5 text-[12.5px] text-muted">
                Fuga en el baño · llega en 15 min
              </p>
            </div>
          </div>
          <Progress done={3} total={5} />
        </div>
      </div>
      <div className={`${CTA} bg-navy`}>Solicitar servicio</div>
    </div>
  );
}

function DescribeScreen() {
  return (
    <div className="relative h-full font-sans">
      <Header kicker="Paso 1 de 3" title="Describe el problema" />
      <div className="flex flex-col gap-3.5 px-4">
        <div className="flex flex-wrap gap-1.5">
          {['Fuga', 'Calentador', 'Drenaje', 'WC'].map((t, i) => (
            <span
              key={t}
              className={`rounded-full px-3 py-2 text-[13px] font-semibold ${
                i === 0
                  ? 'bg-navy text-white'
                  : 'border border-line bg-white text-body'
              }`}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="min-h-[110px] rounded-box border-[1.5px] border-primary bg-white p-3.5 text-[14.5px] leading-normal shadow-[0_0_0_4px_rgba(10,107,207,0.12)]">
          Fuga debajo del lavabo del baño, gotea constante.
          <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-[3px] animate-[lp-caret_1s_step-end_infinite] bg-primary" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {['foto 1', 'foto 2'].map(f => (
            <div
              key={f}
              className="flex aspect-square items-center justify-center rounded-box border border-line bg-[repeating-linear-gradient(135deg,#E1E8F0_0_8px,#F5F8FC_8px_16px)] font-mono text-[10.5px] text-muted"
            >
              {f}
            </div>
          ))}
          <div className="flex aspect-square items-center justify-center rounded-box border-[1.5px] border-dashed border-line-strong font-mono text-[10.5px] text-muted">
            + foto
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-box border border-line bg-white px-3.5 py-3">
          <MapPin size={18} className="text-primary" />
          <span className="text-[13.5px]">Av. Patria 1200, Providencia</span>
        </div>
      </div>
      <div className={`${CTA} bg-navy`}>Continuar</div>
    </div>
  );
}

const TECHS = [
  ['RH', 'Ramón Hernández', '4.9', '214', '1.2', '$350'],
  ['LP', 'Lupita Pérez', '4.6', '45', '2.8', '$300'],
  ['JJ', 'José Carlos Juárez', '4.9', '87', '3.4', '$400'],
] as const;

function ChooseScreen() {
  return (
    <div className="relative h-full font-sans">
      <Header kicker="3 técnicos cerca" title="Elige a tu técnico" />
      <div className="flex flex-col gap-2.5 px-4">
        {TECHS.map(([ini, name, r, jobs, km, price], i) => (
          <div
            key={ini}
            className={`flex items-center gap-3 rounded-box bg-white p-3.5 ${
              i === 0
                ? 'border-[1.5px] border-primary shadow-[0_0_0_4px_rgba(10,107,207,0.12)]'
                : 'border border-line'
            }`}
          >
            <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-navy font-display text-[15px] font-extrabold text-white">
              {ini}
            </span>
            <div className="flex-1">
              <p className="font-display text-[15px] font-bold">{name}</p>
              <p className="mt-[3px] text-[12.5px] text-muted">
                ★ {r} · {jobs} trabajos · {km} km
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] text-muted">VISITA</p>
              <p className="font-display text-[16px] font-extrabold">{price}</p>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2.5 rounded-box bg-success-soft px-3.5 py-3 text-[13px] font-semibold text-success">
          <ShieldCheck size={17} />
          Todos pasaron verificación de identidad
        </div>
      </div>
      <div className={`${CTA} bg-navy`}>Solicitar a Ramón</div>
    </div>
  );
}

function TrackScreen() {
  return (
    <div className="relative h-full font-sans">
      {/* Mapa ilustrativo (estilo claro de la app), sin tiles reales */}
      <div className="absolute inset-x-0 top-0 h-[470px] bg-[#EEF3F9]">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 402 470">
          <path
            d="M-10 120 L420 90 M-10 260 L420 300 M120 -10 L150 480 M290 -10 L260 480 M-10 400 L420 380"
            stroke="#fff"
            strokeWidth="14"
          />
          <path
            d="M40 380 C120 360 140 280 200 250 S300 170 320 110"
            stroke="#fff"
            strokeWidth="11"
            fill="none"
          />
          <path
            d="M40 380 C120 360 140 280 200 250"
            stroke="#9FB3C8"
            strokeWidth="5"
            strokeDasharray="4 6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M200 250 S300 170 320 110"
            stroke="#0A6BCF"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="200" cy="250" r="16" fill="#0E2C56" stroke="#fff" strokeWidth="3" />
          <text x="200" y="254" textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff">
            RH
          </text>
          <circle cx="320" cy="110" r="13" fill="#0A6BCF" stroke="#fff" strokeWidth="3" />
        </svg>
      </div>
      <div className="absolute inset-x-0 bottom-0 top-[440px] flex flex-col gap-3.5 rounded-t-[16px] bg-white px-4 pb-[30px] pt-3 shadow-[0_-10px_24px_-12px_rgba(6,27,58,0.3)]">
        <span className="h-1 w-10 self-center rounded bg-line-strong" />
        <div className="flex items-center gap-3">
          <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-primary font-display text-[15px] font-extrabold text-white">
            RH
          </span>
          <div className="flex-1">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
              SVC-2851 · En camino
            </p>
            <p className="mt-0.5 font-display text-[18px] font-extrabold">
              Llega en 15 min
            </p>
          </div>
        </div>
        <Progress done={3} total={4} />
        <div className="mt-auto flex gap-2.5">
          <div className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-btn border border-line-strong font-display text-[15px] font-bold">
            <MessageSquare size={18} />
            Mensaje
          </div>
          <div className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-btn bg-primary font-display text-[15px] font-bold text-white">
            <PhoneIcon size={18} />
            Llamar
          </div>
        </div>
      </div>
    </div>
  );
}

function PayScreen() {
  const row = (l: string, v: string) => (
    <div className="flex justify-between text-[14px]">
      <span className="text-muted">{l}</span>
      <span className="font-mono">{v}</span>
    </div>
  );
  return (
    <div className="relative h-full font-sans">
      <Header kicker="SVC-2851 · Completado" title="Paga y califica" />
      <div className="flex flex-col gap-3 px-4">
        <div className="flex flex-col gap-2.5 rounded-box border border-line bg-white p-4">
          {row('Mano de obra', '$900')}
          {row('Materiales', '$350')}
          {row('Recargo urgente', '$250')}
          <div className="flex justify-between border-t border-divider pt-2.5">
            <span className="font-display text-[16px] font-extrabold">Total</span>
            <span className="font-display text-[20px] font-extrabold">$1,500</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-box border border-line bg-white p-3.5">
          <CreditCard size={20} className="text-primary" />
          <span className="flex-1 text-[14px]">Visa •• 4242</span>
          <span className="text-[12px] font-semibold text-success">Protegido</span>
        </div>
        <div className="rounded-box border border-line bg-white p-4 text-center">
          <p className="mb-2 text-[14px] font-semibold">¿Cómo te fue con Ramón?</p>
          <span className="inline-flex gap-1.5 text-[#F59E0B]">
            {[0, 1, 2, 3, 4].map(i => (
              <Star key={i} size={28} fill="currentColor" strokeWidth={0} />
            ))}
          </span>
        </div>
      </div>
      <div className={`${CTA} bg-approve`}>Pagar $1,500</div>
    </div>
  );
}

export const STEP_SCREENS = [DescribeScreen, ChooseScreen, TrackScreen, PayScreen];
