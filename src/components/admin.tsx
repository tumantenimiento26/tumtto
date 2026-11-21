'use client';
import { toast } from './toast';
import { downloadCsv, toCsv } from '@/lib/csv';

// ── CSV export (client-side blob download) ───────────────────────────────────
export function exportCsv(
  filename: string,
  rows: Record<string, string | number | null | undefined>[],
) {
  if (rows.length === 0) {
    toast.error('Nada que exportar con los filtros actuales');
    return;
  }
  downloadCsv(filename, toCsv(rows));
}
