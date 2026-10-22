// Ticket de cierre de servicio (58 mm · 32 columnas). Port de
// tumtto-mobile src/lib/ticket/{text,ticketLayout}.ts: mismas reglas para que la
// vista previa de la consola sea idéntica al ticket impreso / PDF. Puro.

export const COLS = 32;
export const BRAND = 'Tu Mantenimiento';

export type TicketCopy = 'cliente' | 'tecnico' | 'admin';
export const TICKET_COPIES: readonly { key: TicketCopy; label: string; tab: string }[] = [
  { key: 'cliente', label: 'COPIA CLIENTE', tab: 'Cliente' },
  { key: 'tecnico', label: 'COPIA TÉCNICO', tab: 'Técnico' },
  { key: 'admin', label: 'COPIA ADMIN', tab: 'Admin' },
];

export interface TicketItem {
  description: string;
  quantity: number;
  totalCents: number;
}

/** Datos del ticket tal como los envía la app (service_tickets.snapshot). */
export interface TicketSnapshot {
  folio: string;
  date: string;
  clientName: string;
  address: string;
  technicianName: string;
  description: string | null;
  items: TicketItem[];
  totalCents: number;
  advanceCents: number;
  balanceCents: number;
  paymentState: string;
}

/** Renglón ya acomodado; `big` = doble ancho (mide la mitad de columnas). */
export interface TicketLine {
  text: string;
  bold?: boolean;
  big?: boolean;
}

/** Fila de list_service_tickets. */
export interface ServiceTicket {
  id: string;
  service_order_id: string;
  bucket: string;
  storage_path: string;
  version: number;
  generated_at: string;
  channel: string;
  copies: string[];
  generated_by: { id: string; name: string } | null;
  snapshot: unknown;
}

// ── Texto monoespaciado ─────────────────────────────────────────────────────
export function plain(s: string): string {
  return s
    .normalize('NFC')
    .replace(/[−–—‐‑]/g, '-')
    .replace(/[‘’‚]/g, "'")
    .replace(/[“”„]/g, '"')
    .replace(/…/g, '...')
    .replace(/[     ]/g, ' ')
    .replace(/[\r\t]/g, ' ');
}

/** Ajusta a `width` columnas por palabra; corta palabras más largas. */
export function wrap(text: string, width: number = COLS): string[] {
  const out: string[] = [];
  for (const para of plain(text).split('\n')) {
    let line = '';
    for (let word of para.split(' ').filter(Boolean)) {
      while (word.length > width) {
        if (line) out.push(line);
        line = '';
        out.push(word.slice(0, width));
        word = word.slice(width);
      }
      if (!word) continue;
      if (!line) line = word;
      else if (line.length + 1 + word.length <= width) line += ` ${word}`;
      else {
        out.push(line);
        line = word;
      }
    }
    out.push(line);
  }
  return out;
}

export const center = (s: string, width: number = COLS): string => {
  const t = plain(s).slice(0, width);
  return ' '.repeat(Math.floor((width - t.length) / 2)) + t;
};

/** Etiqueta a la izquierda y monto a la derecha; la etiqueta larga se ajusta. */
export function twoCols(left: string, right: string, width: number = COLS): string[] {
  const r = plain(right);
  const lines = wrap(left, width);
  const last = lines[lines.length - 1];
  if (last.length + 1 + r.length <= width) {
    lines[lines.length - 1] = last + ' '.repeat(width - last.length - r.length) + r;
  } else {
    lines.push(' '.repeat(Math.max(0, width - r.length)) + r);
  }
  return lines;
}

export const rule = (ch = '-', width: number = COLS) => ch.repeat(width);

/** $1,234.50 (centavos → MXN). */
export function formatMXN(cents: number): string {
  const abs = Math.abs(Math.round(cents));
  const whole = String(Math.floor(abs / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${cents < 0 ? '-' : ''}$${whole}.${String(abs % 100).padStart(2, '0')}`;
}

// ── Layout ──────────────────────────────────────────────────────────────────
const field = (label: string, value: string): TicketLine[] =>
  wrap(`${label}: ${value}`).map(text => ({ text }));

const amount = (label: string, cents: number, bold = false): TicketLine[] =>
  twoCols(label, formatMXN(cents)).map(text => ({ text, bold }));

/** Renglones de una copia del ticket (32 columnas). */
export function ticketLines(t: TicketSnapshot, copy: TicketCopy): TicketLine[] {
  const label = TICKET_COPIES.find(c => c.key === copy)?.label ?? '';
  const L: TicketLine[] = [
    { text: center(BRAND, COLS / 2), bold: true, big: true },
    { text: center('Servicio de mantenimiento') },
    { text: rule() },
    { text: center(label), bold: true },
    { text: rule() },
    ...field('Folio', t.folio),
    ...field('Fecha', t.date),
    ...field('Cliente', t.clientName),
    ...field('Dirección', t.address),
    ...field('Técnico', t.technicianName),
    { text: rule() },
    { text: 'TRABAJOS REALIZADOS', bold: true },
  ];
  if (t.description) for (const text of wrap(t.description)) L.push({ text });
  if (t.items.length) {
    if (t.description) L.push({ text: '' });
    for (const it of t.items)
      L.push(
        ...amount(it.quantity > 1 ? `${it.quantity} x ${it.description}` : it.description, it.totalCents),
      );
  }
  L.push(
    { text: rule() },
    ...amount('TOTAL MXN', t.totalCents, true),
    ...amount('Adelanto pagado', t.advanceCents),
    ...amount('Saldo', t.balanceCents, true),
    ...field('Estado de pago', t.paymentState),
    { text: rule() },
  );
  if (copy !== 'cliente')
    L.push(
      { text: '' },
      { text: '' },
      { text: center('______________________') },
      { text: center('Firma del cliente') },
      { text: '' },
    );
  L.push({ text: center('Gracias por tu preferencia') });
  return L;
}

// ── Snapshot (jsonb sin garantías de forma) ─────────────────────────────────
const str = (v: unknown, d = ''): string => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : d);
const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

/** Normaliza el jsonb; null si no es un objeto (no hay nada que dibujar). */
export function parseSnapshot(raw: unknown): TicketSnapshot | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const items = (Array.isArray(o.items) ? o.items : [])
    .filter((i): i is Record<string, unknown> => !!i && typeof i === 'object')
    .map(i => ({
      description: str(i.description, 'Concepto'),
      quantity: Math.max(1, num(i.quantity) || 1),
      totalCents: num(i.totalCents),
    }));
  const description = str(o.description).trim();
  return {
    folio: str(o.folio, '—'),
    date: str(o.date, '—'),
    clientName: str(o.clientName, 'Cliente'),
    address: str(o.address, 'Sin dirección'),
    technicianName: str(o.technicianName, 'Técnico'),
    description: description || null,
    items,
    totalCents: num(o.totalCents),
    advanceCents: num(o.advanceCents),
    balanceCents: num(o.balanceCents),
    paymentState: str(o.paymentState, '—'),
  };
}

/** Texto plano de una copia (para pruebas / copiar). */
export const ticketText = (t: TicketSnapshot, copy: TicketCopy) =>
  ticketLines(t, copy).map(l => l.text).join('\n');

// ── Lista de versiones ──────────────────────────────────────────────────────
export const CHANNEL_LABEL: Record<string, string> = {
  pdf: 'PDF',
  print: 'Impreso',
  both: 'Impreso y PDF',
};
export const channelLabel = (c: string) => CHANNEL_LABEL[c] ?? c;

/** «v3 · Impreso y PDF · hace 2 h · por Ramón». */
export function versionLabel(
  t: Pick<ServiceTicket, 'version' | 'channel' | 'generated_at' | 'generated_by'>,
  ago: (iso: string) => string,
): string {
  return [
    `v${t.version}`,
    channelLabel(t.channel),
    ago(t.generated_at),
    t.generated_by?.name ? `por ${t.generated_by.name.split(' ')[0]}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

/** Normaliza la respuesta de list_service_tickets, más nueva primero. */
export function parseTickets(raw: unknown): ServiceTicket[] {
  if (!Array.isArray(raw)) return [];
  return (raw as ServiceTicket[])
    .filter(t => t && typeof t.id === 'string' && typeof t.storage_path === 'string')
    .map(t => ({ ...t, bucket: t.bucket || 'service-tickets', copies: t.copies ?? [] }))
    .sort((a, b) => b.version - a.version);
}

export const ticketFileName = (folio: string, version: number) =>
  `ticket-${folio.replace(/[^\w-]+/g, '') || 'servicio'}-v${version}.pdf`;
