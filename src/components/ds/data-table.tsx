'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';

import { Checkbox } from './field';
import { Menu, Popover, type MenuItem } from './overlay';
import { Skeleton } from './feedback';

import {
  pageWindow,
  sortRows,
  type DataColumn,
  type SortState,
} from '@/lib/table';
export type { DataColumn, SortState } from '@/lib/table';

function RowMenu<T>({
  row,
  items,
}: {
  row: T;
  items: (row: T) => (MenuItem | 'divider')[];
}) {
  const anchor = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        ref={anchor}
        type="button"
        aria-label="Acciones"
        aria-expanded={open}
        onClick={e => {
          e.stopPropagation();
          setOpen(o => !o);
        }}
        className="grid h-11 w-11 place-items-center rounded-lg text-muted hover:bg-segment hover:text-navy sm:h-8 sm:w-8"
      >
        <MoreHorizontal size={17} />
      </button>
      <Popover
        anchor={anchor}
        open={open}
        onClose={() => setOpen(false)}
        align="end"
      >
        <Menu items={items(row)} onClose={() => setOpen(false)} />
      </Popover>
    </>
  );
}

/**
 * Tabla de consola (handoff: encabezados ordenables con flecha que rota,
 * checkbox por fila + seleccionar página, barra de acciones masivas, menú ⋯
 * por fila en popover fixed, paginación 8/página).
 */
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  onRowClick,
  selectable,
  bulkActions,
  rowMenu,
  pageSize = 8,
  loading,
  empty,
  initialSort = null,
  sort: controlledSort,
  onSortChange,
  minWidth = 760,
  mobileSort = true,
  pinRank,
}: {
  rows: T[];
  columns: DataColumn<T>[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  /** Contenido de la barra masiva; recibe las filas elegidas y `clear`. */
  bulkActions?: (selected: T[], clear: () => void) => React.ReactNode;
  rowMenu?: (row: T) => (MenuItem | 'divider')[];
  pageSize?: number;
  loading?: boolean;
  empty?: React.ReactNode;
  initialSort?: SortState;
  sort?: SortState;
  onSortChange?: (s: SortState) => void;
  minWidth?: number;
  /** false si la página ya tiene su propio control de orden. */
  mobileSort?: boolean;
  /** Fija filas arriba sin importar el orden (menor = primero; null = no se fija). */
  pinRank?: (row: T) => number | null | undefined;
}) {
  const [innerSort, setInnerSort] = useState<SortState>(initialSort);
  const sort = controlledSort !== undefined ? controlledSort : innerSort;
  const setSort = (s: SortState) => {
    setInnerSort(s);
    onSortChange?.(s);
  };
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const sorted = useMemo(
    () => sortRows(rows, columns, sort, pinRank),
    [rows, columns, sort, pinRank],
  );
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  // Si cambian los filtros y la página actual ya no existe, vuelve al inicio.
  useEffect(() => {
    if (page > pages - 1) setPage(0);
  }, [page, pages]);
  // Descarta seleccionados que ya no están en las filas.
  useEffect(() => {
    setSelected(prev => {
      const keys = new Set(rows.map(rowKey));
      const next = new Set([...prev].filter(k => keys.has(k)));
      return next.size === prev.size ? prev : next;
    });
  }, [rows, rowKey]);

  const visible = sorted.slice(page * pageSize, page * pageSize + pageSize);
  const visibleKeys = visible.map(rowKey);
  const allOnPage =
    visibleKeys.length > 0 && visibleKeys.every(k => selected.has(k));
  const someOnPage = visibleKeys.some(k => selected.has(k));
  const clear = () => setSelected(new Set());
  const selectedRows = rows.filter(r => selected.has(rowKey(r)));

  const toggleSort = (key: string) =>
    setSort(
      sort?.key !== key
        ? { key, dir: 'asc' }
        : sort.dir === 'asc'
          ? { key, dir: 'desc' }
          : null,
    );

  const align = (a?: 'left' | 'right' | 'center') =>
    a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left';

  return (
    <div>
      {selectable && selected.size > 0 && bulkActions && (
        <div className="anim-pop flex flex-wrap items-center gap-3 border-b border-line bg-info-soft px-5 py-2.5">
          <span className="text-[13.5px] font-semibold text-navy">
            {selected.size} seleccionado{selected.size === 1 ? '' : 's'}
          </span>
          <div className="flex flex-1 flex-wrap gap-2">
            {bulkActions(selectedRows, clear)}
          </div>
          <button
            type="button"
            onClick={clear}
            className="text-[13px] font-semibold text-primary"
          >
            Deseleccionar
          </button>
        </div>
      )}
      {/* Celular (≤640 px): tarjetas — título = primera columna, acciones siempre visibles. */}
      <MobileCards
        rows={loading ? [] : visible}
        columns={columns}
        rowKey={rowKey}
        onRowClick={onRowClick}
        rowMenu={rowMenu}
        selectable={selectable}
        selected={selected}
        setSelected={setSelected}
        sort={sort}
        setSort={setSort}
        loading={loading}
        mobileSort={mobileSort}
      />
      <div className="overflow-x-auto max-[640px]:hidden">
        <table className="w-full border-collapse" style={{ minWidth }}>
          <thead>
            <tr className="bg-panel">
              {selectable && (
                <th className="w-12 px-5 py-3">
                  <Checkbox
                    checked={allOnPage}
                    indeterminate={!allOnPage && someOnPage}
                    onChange={on =>
                      setSelected(prev => {
                        const next = new Set(prev);
                        visibleKeys.forEach(k =>
                          on ? next.add(k) : next.delete(k),
                        );
                        return next;
                      })
                    }
                  />
                </th>
              )}
              {columns.map(c => {
                const active = sort?.key === c.key;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    style={{ width: c.width }}
                    aria-sort={
                      active
                        ? sort!.dir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                    className={`whitespace-nowrap px-4 py-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted ${align(c.align)}`}
                  >
                    {c.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(c.key)}
                        className={`inline-flex items-center gap-1 uppercase hover:text-navy ${active ? 'text-navy' : ''}`}
                      >
                        {c.header}
                        <ArrowUp
                          size={12}
                          className={`transition-transform duration-200 ${active ? 'opacity-100' : 'opacity-30'} ${active && sort!.dir === 'desc' ? 'rotate-180' : ''}`}
                        />
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
              {rowMenu && <th className="w-12" />}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: Math.min(pageSize, 6) }).map((_, i) => (
                <tr key={`sk-${i}`} className="border-t border-divider">
                  {selectable && (
                    <td className="px-5 py-4">
                      <Skeleton className="h-4 w-4" />
                    </td>
                  )}
                  {columns.map(c => (
                    <td key={c.key} className="px-4 py-4">
                      <Skeleton className="h-4 w-3/4" />
                    </td>
                  ))}
                  {rowMenu && <td />}
                </tr>
              ))}
            {!loading &&
              visible.map(r => {
                const k = rowKey(r);
                const on = selected.has(k);
                return (
                  <tr
                    key={k}
                    onClick={onRowClick ? () => onRowClick(r) : undefined}
                    className={`border-t border-divider transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${on ? 'bg-tint' : 'hover:bg-panel'}`}
                  >
                    {selectable && (
                      <td className="px-5 py-3.5">
                        <Checkbox
                          checked={on}
                          onChange={v =>
                            setSelected(prev => {
                              const next = new Set(prev);
                              if (v) next.add(k);
                              else next.delete(k);
                              return next;
                            })
                          }
                        />
                      </td>
                    )}
                    {columns.map(c => (
                      <td
                        key={c.key}
                        className={`px-4 py-3.5 text-[14px] text-body ${align(c.align)} ${c.className ?? ''}`}
                      >
                        {c.render(r)}
                      </td>
                    ))}
                    {rowMenu && (
                      <td
                        className="px-2 py-3.5"
                        onClick={e => e.stopPropagation()}
                      >
                        <RowMenu row={r} items={rowMenu} />
                      </td>
                    )}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      {!loading && rows.length === 0 && empty}
      {!loading && sorted.length > pageSize && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
          <span className="text-[13px] text-muted tabular">
            {page * pageSize + 1}–
            {Math.min(sorted.length, (page + 1) * pageSize)} de {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Página anterior"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="grid h-11 w-11 place-items-center rounded-lg text-muted hover:bg-panel disabled:opacity-30 sm:h-8 sm:w-8"
            >
              <ChevronLeft size={16} />
            </button>
            {pageWindow(page, pages).map(p => (
              <button
                key={p}
                type="button"
                aria-current={p === page ? 'page' : undefined}
                onClick={() => setPage(p)}
                className={`h-11 min-w-11 rounded-lg px-2 text-[13px] font-semibold tabular sm:h-8 sm:min-w-8 ${
                  p === page
                    ? 'bg-action text-white'
                    : 'text-body hover:bg-panel'
                }`}
              >
                {p + 1}
              </button>
            ))}
            <button
              type="button"
              aria-label="Página siguiente"
              disabled={page >= pages - 1}
              onClick={() => setPage(p => p + 1)}
              className="grid h-11 w-11 place-items-center rounded-lg text-muted hover:bg-panel disabled:opacity-30 sm:h-8 sm:w-8"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileCards<T>({
  rows,
  columns,
  rowKey,
  onRowClick,
  rowMenu,
  selectable,
  selected,
  setSelected,
  sort,
  setSort,
  loading,
  mobileSort,
}: {
  rows: T[];
  columns: DataColumn<T>[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  rowMenu?: (row: T) => (MenuItem | 'divider')[];
  selectable?: boolean;
  selected: Set<string>;
  setSelected: React.Dispatch<React.SetStateAction<Set<string>>>;
  sort: SortState;
  setSort: (s: SortState) => void;
  loading?: boolean;
  mobileSort?: boolean;
}) {
  const [title, ...rest] = columns;
  const detail = rest.filter(c => !c.hideOnMobile);
  const sortable = mobileSort ? columns.filter(c => c.sortValue) : [];
  return (
    <div className="min-[641px]:hidden">
      {sortable.length > 0 && (
        <label className="flex items-center gap-2 border-b border-divider px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">
          Ordenar
          <select
            value={sort ? `${sort.key}:${sort.dir}` : ''}
            onChange={e => {
              const [key, dir] = e.target.value.split(':');
              setSort(key ? { key, dir: dir as 'asc' | 'desc' } : null);
            }}
            className="h-11 min-w-0 flex-1 rounded-lg border border-line bg-card px-2 font-sans text-[14px] normal-case tracking-normal text-body"
          >
            <option value="">Sin orden</option>
            {sortable.flatMap(c => [
              <option key={`${c.key}:asc`} value={`${c.key}:asc`}>{c.header} ↑</option>,
              <option key={`${c.key}:desc`} value={`${c.key}:desc`}>{c.header} ↓</option>,
            ])}
          </select>
        </label>
      )}
      {loading &&
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border-t border-divider px-4 py-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-3 h-3 w-full" />
          </div>
        ))}
      <ul>
        {rows.map(r => {
          const k = rowKey(r);
          const on = selected.has(k);
          return (
            <li
              key={k}
              onClick={onRowClick ? () => onRowClick(r) : undefined}
              className={`border-t border-divider px-4 py-3.5 first:border-t-0 ${onRowClick ? 'cursor-pointer active:bg-panel' : ''} ${on ? 'bg-tint' : ''}`}
            >
              <div className="flex items-start gap-3">
                {selectable && (
                  <span className="pt-0.5" onClick={e => e.stopPropagation()}>
                    <Checkbox
                      checked={on}
                      onChange={v =>
                        setSelected(prev => {
                          const next = new Set(prev);
                          if (v) next.add(k);
                          else next.delete(k);
                          return next;
                        })
                      }
                    />
                  </span>
                )}
                <div className="min-w-0 flex-1 text-[14px] text-body">{title?.render(r)}</div>
                {rowMenu && (
                  <span className="-mr-2 -mt-2" onClick={e => e.stopPropagation()}>
                    <RowMenu row={r} items={rowMenu} />
                  </span>
                )}
              </div>
              {detail.length > 0 && (
                <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2">
                  {detail.map(c => (
                    <div key={c.key} className="min-w-0">
                      <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">{c.header}</dt>
                      <dd className="mt-0.5 min-w-0 break-words text-[13.5px] text-body">{c.render(r)}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
