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
  /** Oculta la columna en la vista de tarjetas (celular); la primera columna siempre es el título. */
  hideOnMobile?: boolean;
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
  /** Filas fijadas arriba (menor = primero; null/undefined = no se fija), sin importar el orden. */
  pinRank?: (row: T) => number | null | undefined,
): T[] {
  const col = sort ? columns.find(c => c.key === sort.key) : undefined;
  let out = rows;
  if (sort && col?.sortValue) {
    const dir = sort.dir === 'asc' ? 1 : -1;
    out = [...rows].sort(
      (a, b) => dir * compare(col.sortValue!(a), col.sortValue!(b)),
    );
  }
  if (!pinRank) return out;
  // Partición estable: fijadas (por rango) y después el resto en el orden elegido.
  const rank = (r: T) => pinRank(r) ?? 1e9;
  return out
    .map((r, i) => [r, i] as const)
    .sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1])
    .map(x => x[0]);
}

/** Rango de páginas visible (máx. 5) alrededor de la actual. */
export function pageWindow(page: number, pages: number, size = 5): number[] {
  const start = Math.max(
    0,
    Math.min(page - Math.floor(size / 2), pages - size),
  );
  return Array.from({ length: Math.min(size, pages) }, (_, i) => start + i);
}
