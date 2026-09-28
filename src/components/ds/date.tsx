'use client';
import { useRef, useState } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

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
import { Popover } from './overlay';

/** Calendario 6×7 L-D. Hoy con borde azul; `minDate` deshabilita lo anterior. */
function MonthCalendar({
  month,
  onMonth,
  isSelected,
  isInside,
  onPick,
  onHover,
  minDate,
}: {
  month: Date;
  onMonth: (d: Date) => void;
  isSelected: (d: Date) => boolean;
  isInside?: (d: Date) => boolean;
  onPick: (d: Date) => void;
  onHover?: (d: Date) => void;
  minDate?: Date;
}) {
  const today = startOfDay(new Date());
  const days = monthGrid(month.getFullYear(), month.getMonth());
  const min = minDate ? startOfDay(minDate) : null;
  return (
    <div className="w-[266px]">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="Mes anterior"
          onClick={() =>
            onMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
          }
          className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-panel hover:text-navy"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="font-display text-[14px] font-bold text-navy first-letter:uppercase">
          {monthLabel(month.getFullYear(), month.getMonth())}
        </span>
        <button
          type="button"
          aria-label="Mes siguiente"
          onClick={() =>
            onMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
          }
          className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-panel hover:text-navy"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {WEEKDAYS_SHORT.map((w, i) => (
          <span key={i} className="pb-1 font-mono text-[10.5px] text-faint">
            {w}
          </span>
        ))}
        {days.map(d => {
          const out = d.getMonth() !== month.getMonth();
          const disabled = !!min && d < min;
          const sel = isSelected(d);
          const inside = !sel && isInside?.(d);
          return (
            <button
              key={d.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onPick(d)}
              onMouseEnter={() => onHover?.(d)}
              aria-pressed={sel}
              aria-label={formatLong(d)}
              className={`h-9 rounded-lg text-[13px] tabular transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                sel
                  ? 'bg-primary font-bold text-white'
                  : inside
                    ? 'bg-info-soft text-navy'
                    : out
                      ? 'text-faint hover:bg-panel'
                      : 'text-navy hover:bg-panel'
              } ${sameDay(d, today) && !sel ? 'ring-1 ring-inset ring-primary' : ''}`}
            >
              {d.getDate()}
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
        <Calendar size={16} className="text-faint" />
        <span
          className={`flex-1 truncate ${value ? 'text-navy' : 'text-faint'}`}
        >
          {value ? formatLong(value) : placeholder}
        </span>
        <ChevronDown size={16} className="text-muted" />
      </button>
      <Popover anchor={anchor} open={open} onClose={() => setOpen(false)}>
        <div className="flex gap-4 p-4">
          <div className="flex w-[120px] flex-col gap-1">
            {PRESETS.map(p => {
              const d = p.get();
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => pick(d)}
                  className={`rounded-lg px-3 py-2 text-left text-[13px] font-semibold ${
                    sameDay(d, value)
                      ? 'bg-info-soft text-primary'
                      : 'text-body hover:bg-panel'
                  }`}
                >
                  {p.label}
                </button>
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

const RANGE_PRESETS = [
  { label: 'Hoy', kind: 'today' },
  { label: 'Últimos 7 días', kind: '7d' },
  { label: 'Últimos 30 días', kind: '30d' },
  { label: 'Este mes', kind: 'month' },
  { label: 'Mes pasado', kind: 'lastMonth' },
  { label: 'Todas las fechas', kind: 'all' },
] as const;

export const rangeLabel = (r: DateRange) =>
  !r
    ? 'Todas las fechas'
    : sameDay(r.from, r.to)
      ? formatShort(r.from)
      : `${formatShort(r.from)} – ${formatShort(r.to)}`;

/**
 * Rango de fechas (listas de consola): presets + calendario; primer clic fija
 * el inicio, segundo el fin. `null` = todas las fechas. Filtra con
 * `inRange(fecha, rango)` de `@/lib/calendar`.
 */
export function DateRangePicker({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (r: DateRange) => void;
}) {
  const anchor = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => value?.to ?? new Date());
  const [pending, setPending] = useState<Date | null>(null);
  const [hover, setHover] = useState<Date | null>(null);
  const close = () => {
    setOpen(false);
    setPending(null);
  };
  const preview: DateRange = pending
    ? orderRange(pending, hover ?? pending)
    : value;
  return (
    <>
      <button
        ref={anchor}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className={`inline-flex h-10 items-center gap-2 rounded-btn border px-3.5 text-[13.5px] font-semibold text-navy transition-colors ${
          open
            ? 'border-primary shadow-focus'
            : 'border-line bg-card hover:border-line-strong'
        }`}
      >
        <Calendar size={15} className="text-muted" />
        {rangeLabel(value)}
        <ChevronDown size={15} className="text-muted" />
      </button>
      <Popover anchor={anchor} open={open} onClose={close}>
        <div className="flex gap-4 p-4" onMouseLeave={() => setHover(null)}>
          <div className="flex w-[140px] flex-col gap-1">
            {RANGE_PRESETS.map(p => {
              const r = rangePreset(p.kind);
              const on =
                (!r && !value) ||
                (!!r &&
                  !!value &&
                  sameDay(r.from, value.from) &&
                  sameDay(r.to, value.to));
              return (
                <button
                  key={p.kind}
                  type="button"
                  onClick={() => {
                    onChange(r);
                    close();
                  }}
                  className={`rounded-lg px-3 py-2 text-left text-[13px] font-semibold ${
                    on
                      ? 'bg-info-soft text-primary'
                      : 'text-body hover:bg-panel'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <div>
            <MonthCalendar
              month={month}
              onMonth={setMonth}
              isSelected={d =>
                !!preview &&
                (sameDay(d, preview.from) || sameDay(d, preview.to))
              }
              isInside={d => !!preview && inRange(d, preview)}
              onHover={setHover}
              onPick={d => {
                if (!pending) setPending(d);
                else {
                  onChange(orderRange(pending, d));
                  close();
                }
              }}
            />
            <p className="mt-2 text-center text-[12px] text-muted">
              {pending ? 'Elige la fecha final' : 'Elige la fecha inicial'}
            </p>
          </div>
        </div>
      </Popover>
    </>
  );
}
