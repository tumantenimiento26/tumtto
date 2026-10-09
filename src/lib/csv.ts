// CSV de la consola: exportar (con BOM para que Excel en español lea UTF-8)
// e importar (lo que guarda Excel: ',' o ';', comillas, CRLF, BOM).

export type CsvCell = string | number | null | undefined;

/**
 * Celda de texto que empieza con = + - @ (o tab/CR) se prefija con ' para que
 * Excel no la ejecute como fórmula (inyección CSV con nombres de usuarios).
 */
function cell(v: CsvCell): string {
  let s = v == null ? '' : String(v);
  if (typeof v === 'string' && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: Record<string, CsvCell>[], headers?: string[]): string {
  const cols = headers ?? (rows[0] ? Object.keys(rows[0]) : []);
  if (!cols.length) return '﻿';
  return '﻿' + [cols.map(cell).join(','), ...rows.map(r => cols.map(c => cell(r[c])).join(','))].join('\n');
}

/** Parte el texto en filas de celdas; detecta ',' o ';' por la primera línea. */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, '');
  const firstLine = src.split(/\r?\n/, 1)[0] ?? '';
  const delim = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"' && cur === '') quoted = true;
    else if (ch === delim) {
      row.push(cur);
      cur = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(cur);
      rows.push(row);
      row = [];
      cur = '';
    } else cur += ch;
  }
  if (cur !== '' || row.length) {
    row.push(cur);
    rows.push(row);
  }
  // Filas vacías (Excel deja ";;;" al final) fuera.
  return rows.filter(r => r.some(c => c.trim() !== ''));
}

/** Filas como objetos por encabezado (encabezados normalizados: minúsculas, sin acentos). */
export function parseCsvObjects(text: string): Record<string, string>[] {
  const [head, ...body] = parseCsv(text);
  if (!head) return [];
  const keys = head.map(normalizeHeader);
  // Quita el ' que toCsv antepone a + = - @ (round-trip de exportaciones/plantillas).
  const clean = (c = '') => c.trim().replace(/^'(?=[=+\-@])/, '');
  return body.map(r => Object.fromEntries(keys.map((k, i) => [k, clean(r[i])])));
}

export const normalizeHeader = (h: string) =>
  h
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

/** Descarga un CSV generado en el navegador. */
export function downloadCsv(filename: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
