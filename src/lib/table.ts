// Lógica pura de DataTable (orden y paginación), probada en table.test.ts.

export interface DataColumn<T> {
  key: string;
  /** Encabezado (se muestra en mono mayúsculas). */
  header: string;
  render: (row: T) => import('react').ReactNode;
  /** Valor para ordenar; si existe la columna es ordenable. */
  sortValue?: (row: T) => string | number | null | undefined;
  align?: 'left' | 'right' | 'center';
  /** Ancho CSS (p. ej. '120px', '20%'). */
  width?: string;
  className?: string;
}

export type SortState = { key: string; dir: 'asc' | 'desc' } | null;

function compare(a: unknown, b: unknown) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'es', { numeric: true });
}

/** Ordena filas según la columna (puro; exportado para pruebas). */
export function sortRows<T>(
  rows: T[],
  columns: DataColumn<T>[],
  sort: SortState,
): T[] {
  if (!sort) return rows;
  const col = columns.find(c => c.key === sort.key);
  if (!col?.sortValue) return rows;
  const dir = sort.dir === 'asc' ? 1 : -1;
  return [...rows].sort(
    (a, b) => dir * compare(col.sortValue!(a), col.sortValue!(b)),
  );
}

/** Rango de páginas visible (máx. 5) alrededor de la actual. */
export function pageWindow(page: number, pages: number, size = 5): number[] {
  const start = Math.max(
    0,
    Math.min(page - Math.floor(size / 2), pages - size),
  );
  return Array.from({ length: Math.min(size, pages) }, (_, i) => start + i);
}
