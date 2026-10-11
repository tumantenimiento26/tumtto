'use client';
import { useRef, useState } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

import {
  WEEKDAYS_SHORT,
  addDays,
  formatLong,
  formatShort,
  inRange,
  monthGrid,
  monthLabel,
  nextMonday,
  orderRange,
  rangePreset,
  sameDay,
  startOfDay,
  type DateRange,
} from '@/lib/calendar';
import { controlClass } from './field';
import { Chip, Kicker } from './controls';
import { Button } from './button';
import { Sheet } from './overlay';
import { Popover } from './overlay';

/**
 * Calendario 6×7 L-D (Style Guide · «Calendario · selección y rango»):
 * navegación con botones cuadrados, días de 38 px, seleccionado en azul,
 * rango en azul suave y punto bajo el número para hoy.
 */
function MonthCalendar({
  month,
  onMonth,
  isSelected,
  isInside,
  onPick,
  onHover,
  minDate,
  maxDate,
}: {
  month: Date;
  onMonth: (d: Date) => void;
  isSelected: (d: Date) => boolean;
  isInside?: (d: Date) => boolean;
  onPick: (d: Date) => void;
  onHover?: (d: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}) {
  const today = startOfDay(new Date());
  const days = monthGrid(month.getFullYear(), month.getMonth());
  const min = minDate ? startOfDay(minDate) : null;
  const max = maxDate ? startOfDay(maxDate) : null;
  const nav =
    'grid h-9 w-9 place-items-center rounded-[6px] border border-line bg-card text-navy transition-colors hover:bg-tint';
  return (
    <div className="w-full min-w-[266px]">
      <div className="mb-2.5 flex items-center justify-between">
        <button
          type="button"
          aria-label="Mes anterior"
          onClick={() => onMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          className={nav}
        >
          <ChevronLeft size={16} />
        </button>
        <span className="font-display text-[16px] font-extrabold text-navy first-letter:uppercase">
          {monthLabel(month.getFullYear(), month.getMonth())}
        </span>
        <button
          type="button"
          aria-label="Mes siguiente"
          onClick={() => onMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          className={nav}
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {WEEKDAYS_SHORT.map((w, i) => (
          <span key={i} className="pb-1 font-mono text-[10.5px] font-semibold text-faint">
            {w}
          </span>
        ))}
        {days.map(d => {
          const out = d.getMonth() !== month.getMonth();
          const disabled = (!!min && d < min) || (!!max && d > max);
          const sel = isSelected(d);
          const inside = !sel && isInside?.(d);
          const isToday = sameDay(d, today);
          return (
            <button
              key={d.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onPick(d)}
              onMouseEnter={() => onHover?.(d)}
              aria-pressed={sel}
              aria-current={isToday ? 'date' : undefined}
              aria-label={formatLong(d)}
              className={`relative h-[38px] rounded-[7px] text-[13.5px] tabular transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                sel
                  ? 'bg-primary font-bold text-white'
                  : inside
                    ? 'bg-info-soft font-medium text-navy'
                    : out
                      ? 'text-faint hover:bg-tint'
                      : 'font-medium text-navy hover:bg-tint'
              }`}
            >
              {d.getDate()}
              {isToday && (
                <span
                  className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${sel ? 'bg-white' : 'bg-primary'}`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const PRESETS = [
  { label: 'Hoy', get: () => startOfDay(new Date()) },
  { label: 'Mañana', get: () => addDays(startOfDay(new Date()), 1) },
  { label: 'En 2 días', get: () => addDays(startOfDay(new Date()), 2) },
  { label: 'Próximo lunes', get: () => nextMonday() },
];

/** Fecha única con presets (Hoy/Mañana/En 2 días/Próximo lunes). */
export function DatePicker({
  value,
  onChange,
  placeholder = 'Elige una fecha',
  disablePast = true,
  error,
  'aria-label': ariaLabel,
}: {
  value: Date | null;
  onChange: (d: Date) => void;
  placeholder?: string;
  disablePast?: boolean;
  error?: boolean;
  'aria-label'?: string;
}) {
  const anchor = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => value ?? new Date());
  const pick = (d: Date) => {
    onChange(d);
    setOpen(false);
  };
  return (
    <>
      <button
        ref={anchor}
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className={`${controlClass(error)} gap-2.5 px-3 text-left ${open ? 'border-primary shadow-focus' : ''}`}
      >
        <Calendar size={17} className="text-primary" />
        <span
          className={`flex-1 truncate ${value ? 'text-navy' : 'text-faint'}`}
        >
          {value ? formatLong(value) : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-muted transition-transform duration-[250ms] ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <Popover anchor={anchor} open={open} onClose={() => setOpen(false)}>
        {/* Style Guide: presets como chips arriba y el calendario de la consola. */}
        <div className="flex w-[min(320px,calc(100vw-16px))] flex-col gap-3 p-3.5">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => {
              const d = p.get();
              return (
                <Chip key={p.label} active={sameDay(d, value)} onClick={() => pick(d)}>
                  {p.label}
                </Chip>
              );
            })}
          </div>
          <MonthCalendar
            month={month}
            onMonth={setMonth}
            isSelected={d => sameDay(d, value)}
            onPick={pick}
            minDate={disablePast ? new Date() : undefined}
          />
        </div>
      </Popover>
    </>
  );
}

export const rangeLabel = (r: DateRange) =>
  !r
    ? 'Todas las fechas'
    : sameDay(r.from, r.to)
      ? formatShort(r.from)
      : `${formatShort(r.from)} – ${formatShort(r.to)}`;

/**
 * Rango de fechas (Style Guide · «Date picker»): campo con ícono en mosaico
 * azul, etiqueta mono y valor; abre en línea (vive en los drawers de
 * filtros) un calendario de rango y «Aplicar rango». Primer toque = inicio,
 * segundo = fin. `null` = todas las fechas (solo si `allowAll`).
 */
export function DateRangePicker({
  value,
  onChange,
  allowAll = true,
  label = 'Rango de fechas',
  disableFuture = true,
}: {
  value: DateRange;
  onChange: (r: DateRange) => void;
  /** Filtros de historial: los días después de hoy no se pueden elegir. */
  disableFuture?: boolean;
  /** false en reportes: siempre hay un periodo (oculta «Todas las fechas»). */
  allowAll?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => value?.to ?? new Date());
  const [draft, setDraft] = useState<{ from: Date; to: Date | null } | null>(null);
  const [hover, setHover] = useState<Date | null>(null);
  const toggle = () => {
    setOpen(o => !o);
    setDraft(null);
    setMonth(value?.to ?? new Date());
  };
  const preview: DateRange = draft
    ? orderRange(draft.from, draft.to ?? hover ?? draft.from)
    : value;
  const ready = !!draft?.to;
  return (
    <div className="w-full">
      <button
        type="button"
        aria-expanded={open}
        onClick={toggle}
        className={`flex w-full items-center gap-3 rounded-[9px] border-2 bg-card py-[7px] pl-2.5 pr-3.5 text-left transition-[border-color,box-shadow] duration-200 ${
          open ? 'border-primary shadow-focus' : 'border-line hover:border-line-strong'
        }`}
      >
        <span className="grid h-9 w-9 flex-none place-items-center rounded-[6px] bg-info-soft text-primary">
          <Calendar size={19} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            {label}
          </span>
          <span className="block truncate text-[15px] font-semibold text-navy">
            {rangeLabel(value)}
          </span>
        </span>
        <ChevronDown
          size={18}
          className={`text-muted transition-transform duration-[250ms] ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          className="anim-pop mt-2 rounded-[11px] border border-line bg-card p-3.5 shadow-float"
          onMouseLeave={() => setHover(null)}
        >
          <MonthCalendar
            month={month}
            onMonth={setMonth}
            isSelected={d =>
              !!preview && (sameDay(d, preview.from) || sameDay(d, preview.to))
            }
            isInside={d => !!preview && inRange(d, preview)}
            onHover={d => draft && !draft.to && setHover(d)}
            maxDate={disableFuture ? new Date() : undefined}
            onPick={d =>
              setDraft(cur => (!cur || cur.to ? { from: d, to: null } : { from: cur.from, to: d }))
            }
          />
          <p className="mb-3 mt-2.5 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            {!draft ? 'Toca la fecha inicial' : !draft.to ? 'Ahora la fecha final' : rangeLabel(preview)}
          </p>
          <Button
            full
            disabled={!ready}
            onClick={() => {
              onChange(preview);
              setOpen(false);
              setDraft(null);
            }}
          >
            Aplicar rango
          </Button>
          {allowAll && value && (
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
                setDraft(null);
              }}
              className="mt-2 h-10 w-full rounded-btn text-[13.5px] font-semibold text-primary hover:bg-tint"
            >
              Todas las fechas
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const QUICK = [
  { kind: '7d', label: '7 días' },
  { kind: '30d', label: '30 días' },
  { kind: '90d', label: '90 días' },
] as const;

/** ¿El rango es exactamente el preset (desde hoy hacia atrás)? */
export const isPreset = (r: DateRange, kind: '7d' | '30d' | '90d') => {
  const p = rangePreset(kind);
  return !!r && !!p && sameDay(r.from, p.from) && sameDay(r.to, p.to);
};

/**
 * Filtros rápidos de periodo (7/30/90 días). Activo = el rango coincide con el
 * preset; un rango personalizado (desde el date picker) deja ninguno activo.
 */
export function QuickRange({
  value,
  onChange,
  allowAll = true,
}: {
  value: DateRange;
  onChange: (r: DateRange) => void;
  /** true: tocar el filtro activo lo quita (vuelve a «todas las fechas»). */
  allowAll?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Periodo rápido">
      {QUICK.map(q => {
        const on = isPreset(value, q.kind);
        return (
          <Chip
            key={q.kind}
            active={on}
            onClick={() => onChange(on && allowAll ? null : rangePreset(q.kind))}
          >
            {q.label}
          </Chip>
        );
      })}
    </div>
  );
}

/** «30 días» si es un preset rápido; si no, las fechas del rango. */
export const periodLabel = (r: DateRange) =>
  (['7d', '30d', '90d'] as const).find(k => isPreset(r, k))?.replace('d', ' días') ??
  rangeLabel(r);

/** Rango del picker → periodo [inicio del día `from`, fin del día `to`) sin pasar de ahora. */
export function toPeriod(r: NonNullable<DateRange>, now = new Date()) {
  const from = new Date(r.from);
  from.setHours(0, 0, 0, 0);
  const to = new Date(r.to);
  to.setHours(24, 0, 0, 0);
  return { from, to: to > now ? now : to };
}

/**
 * Barra de periodo para reportes: filtros rápidos (7/30/90 días) + botón
 * «Filtros» que abre el drawer con el date picker (rango libre). Siempre hay
 * un periodo: no existe «todas las fechas».
 */
export function PeriodFilters({
  value,
  onChange,
  kicker,
  children,
}: {
  value: NonNullable<DateRange>;
  onChange: (r: NonNullable<DateRange>) => void;
  kicker?: string;
  /** Filtros extra de la pantalla (van en el drawer, debajo de las fechas). */
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const custom = !(['7d', '30d', '90d'] as const).some(k => isPreset(value, k));
  return (
    <>
      <QuickRange value={value} onChange={r => r && onChange(r)} allowAll={false} />
      <Button variant="secondary" icon={SlidersHorizontal} onClick={() => setOpen(true)}>
        {custom ? rangeLabel(value) : 'Filtros'}
      </Button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        width={400}
        kicker={kicker}
        title="Filtros"
        footer={
          <Button full onClick={() => setOpen(false)}>
            Listo
          </Button>
        }
      >
        <div className="flex flex-col gap-6">
          <section className="flex flex-col items-start gap-3">
            <Kicker>Periodo</Kicker>
            <QuickRange value={value} onChange={r => r && onChange(r)} allowAll={false} />
            <DateRangePicker value={value} onChange={r => r && onChange(r)} allowAll={false} />
          </section>
          {children}
        </div>
      </Sheet>
    </>
  );
}
