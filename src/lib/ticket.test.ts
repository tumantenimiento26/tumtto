import { describe, expect, it } from 'vitest';
import {
  COLS,
  center,
  formatMXN,
  parseSnapshot,
  parseTickets,
  ticketFileName,
  ticketLines,
  twoCols,
  versionLabel,
  wrap,
} from './ticket';

const snap = parseSnapshot({
  folio: 'SVC-1042',
  date: '12/10/2026 16:30',
  clientName: 'María Fernanda López Hernández',
  address: 'Av. Patria 1234, Zapopan',
  technicianName: 'Ramón Díaz',
  description: 'Reparación de fuga en lavabo',
  items: [
    { description: 'Mano de obra', quantity: 1, totalCents: 45000 },
    { description: 'Llave angular', quantity: 2, totalCents: 18000 },
  ],
  totalCents: 63000,
  advanceCents: 15000,
  balanceCents: 48000,
  paymentState: 'Pagado',
})!;

describe('texto 32 columnas', () => {
  it('wrap respeta el ancho y corta palabras largas', () => {
    expect(wrap('a'.repeat(40))).toEqual(['a'.repeat(32), 'a'.repeat(8)]);
    expect(wrap('uno dos tres cuatro cinco seis siete ocho').every(l => l.length <= COLS)).toBe(true);
  });
  it('twoCols alinea el monto a la derecha', () => {
    const [l] = twoCols('TOTAL', '$10.00');
    expect(l).toHaveLength(COLS);
    expect(l.endsWith('$10.00')).toBe(true);
  });
  it('center', () => expect(center('ab', 6)).toBe('  ab'));
  it('formatMXN', () => {
    expect(formatMXN(123456)).toBe('$1,234.56');
    expect(formatMXN(5)).toBe('$0.05');
  });
});

describe('ticketLines', () => {
  it('ninguna línea excede 32 columnas (16 en grande)', () => {
    for (const copy of ['cliente', 'tecnico', 'admin'] as const)
      for (const l of ticketLines(snap, copy)) expect(l.text.length).toBeLessThanOrEqual(l.big ? COLS / 2 : COLS);
  });
  it('solo técnico y admin llevan firma', () => {
    const has = (c: 'cliente' | 'tecnico' | 'admin') =>
      ticketLines(snap, c).some(l => l.text.includes('Firma del cliente'));
    expect(has('cliente')).toBe(false);
    expect(has('tecnico')).toBe(true);
    expect(has('admin')).toBe(true);
  });
  it('cantidad > 1 se antepone y los montos salen', () => {
    const t = ticketLines(snap, 'cliente').map(l => l.text).join('\n');
    expect(t).toContain('2 x Llave angular');
    expect(t).toContain('$630.00');
    expect(t).toContain('COPIA CLIENTE');
  });
});

describe('parseSnapshot', () => {
  it('rechaza lo que no es objeto', () => {
    expect(parseSnapshot(null)).toBeNull();
    expect(parseSnapshot([])).toBeNull();
    expect(parseSnapshot('x')).toBeNull();
  });
  it('rellena huecos', () => {
    const s = parseSnapshot({})!;
    expect(s.items).toEqual([]);
    expect(s.clientName).toBe('Cliente');
    expect(s.totalCents).toBe(0);
  });
});

describe('versiones', () => {
  it('versionLabel', () => {
    expect(
      versionLabel(
        { version: 3, channel: 'both', generated_at: 'x', generated_by: { id: '1', name: 'Ramón Díaz' } },
        () => 'hace 2 h',
      ),
    ).toBe('v3 · Impreso y PDF · hace 2 h · por Ramón');
    expect(versionLabel({ version: 1, channel: 'pdf', generated_at: 'x', generated_by: null }, () => 'hace 1 d')).toBe(
      'v1 · PDF · hace 1 d',
    );
  });
  it('parseTickets ordena desc y tolera basura', () => {
    const r = parseTickets([
      { id: 'a', storage_path: 'o/a.pdf', version: 1 },
      { id: 'b', storage_path: 'o/b.pdf', version: 2 },
      null,
    ]);
    expect(r.map(t => t.version)).toEqual([2, 1]);
    expect(r[0].bucket).toBe('service-tickets');
    expect(parseTickets(null)).toEqual([]);
  });
  it('ticketFileName', () => expect(ticketFileName('SVC-1042', 2)).toBe('ticket-SVC-1042-v2.pdf'));
});
