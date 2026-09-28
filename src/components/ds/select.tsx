'use client';
import { useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

import { controlClass } from './field';
import { Popover } from './overlay';

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
  /** Texto secundario (p. ej. zona, conteo). */
  hint?: string;
};

const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Dropdown con búsqueda (handoff: >5 opciones muestra buscador, check en la
 * seleccionada, "Sin coincidencias"). Teclado: ↑↓ para moverse, ↵ elige.
 */
export function Select<T extends string>({
  options,
  value,
  onChange,
  placeholder = 'Selecciona…',
  error,
  disabled,
  searchable,
  'aria-label': ariaLabel,
}: {
  options: SelectOption<T>[];
  value: T | null;
  onChange: (v: T) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  /** Por defecto: más de 5 opciones. */
  searchable?: boolean;
  'aria-label'?: string;
}) {
  const anchor = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const withSearch = searchable ?? options.length > 5;
  const list = useMemo(
    () =>
      q
        ? options.filter(o =>
            norm(`${o.label} ${o.hint ?? ''}`).includes(norm(q)),
          )
        : options,
    [options, q],
  );
  const current = options.find(o => o.value === value);

  const pick = (v: T) => {
    onChange(v);
    setOpen(false);
    setQ('');
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIdx(i => Math.min(i + 1, list.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && list[idx]) {
      e.preventDefault();
      pick(list[idx].value);
    }
  };

  return (
    <>
      <button
        ref={anchor}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => {
          setOpen(o => !o);
          setIdx(
            Math.max(
              0,
              options.findIndex(o => o.value === value),
            ),
          );
        }}
        onKeyDown={e => {
          if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
            e.preventDefault();
            setOpen(true);
          } else if (open) onKey(e);
        }}
        className={`${controlClass(error)} justify-between px-3 text-left disabled:opacity-50 ${open ? 'border-primary shadow-focus' : ''}`}
      >
        <span className={`truncate ${current ? 'text-navy' : 'text-faint'}`}>
          {current?.label ?? placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <Popover
        anchor={anchor}
        open={open}
        onClose={() => {
          setOpen(false);
          setQ('');
        }}
        width="anchor"
      >
        {withSearch && (
          <div className="flex items-center gap-2 border-b border-divider px-3">
            <Search size={14} className="text-faint" />
            <input
              autoFocus
              value={q}
              onChange={e => {
                setQ(e.target.value);
                setIdx(0);
              }}
              onKeyDown={onKey}
              placeholder="Buscar…"
              aria-label="Buscar opción"
              className="h-10 min-w-0 flex-1 bg-transparent text-[13.5px] text-navy outline-none placeholder:text-faint"
            />
          </div>
        )}
        <ul role="listbox" className="max-h-64 overflow-y-auto p-1.5">
          {list.length === 0 && (
            <li className="px-3 py-3 text-center text-[13px] text-muted">
              Sin coincidencias
            </li>
          )}
          {list.map((o, i) => {
            const on = o.value === value;
            return (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  onMouseEnter={() => setIdx(i)}
                  onClick={() => pick(o.value)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13.5px] ${
                    i === idx ? 'bg-panel' : ''
                  } ${on ? 'font-semibold text-navy' : 'text-body'}`}
                >
                  <span className="min-w-0 flex-1 truncate">{o.label}</span>
                  {o.hint && (
                    <span className="text-[12px] text-muted">{o.hint}</span>
                  )}
                  {on && <Check size={15} className="text-primary" />}
                </button>
              </li>
            );
          })}
        </ul>
      </Popover>
    </>
  );
}
