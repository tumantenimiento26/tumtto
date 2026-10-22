// Tickets de cierre guardados por servicio (RPC list_service_tickets + bucket privado service-tickets).
import { supabase } from '@/lib/supabase';
import { MOCK } from '@/lib/mock';
import { getAllRequests, getProfile, getRequest, getTechByUser } from '@/lib/data/store';
import {
  parseSnapshot,
  parseTickets,
  ticketLines,
  type ServiceTicket,
  type TicketSnapshot,
} from '@/lib/ticket';

const DONE = new Set(['closing', 'completed', 'paid', 'closed']);

// --- Maqueta -----------------------------------------------------------------
const H = 3_600_000;
const hashN = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

function mockSnapshot(orderId: string, version: number): TicketSnapshot | null {
  const o = getRequest(orderId);
  if (!o) return null;
  const labor = 45000 + (hashN(orderId) % 5) * 5000;
  const parts = 18000;
  const adv = o.payment_model === 'base_cash' ? 15000 : 0;
  const total = labor + parts + (version > 1 ? 4000 : 0);
  const items = [
    { description: 'Mano de obra', quantity: 1, totalCents: labor },
    { description: 'Llave angular de 1/2 pulgada', quantity: 2, totalCents: parts },
    ...(version > 1 ? [{ description: 'Ajuste', quantity: 1, totalCents: 4000 }] : []),
  ];
  return {
    folio: o.folio != null ? `SVC-${o.folio}` : orderId.slice(0, 8),
    date: '12/10/2026 16:30',
    clientName: getProfile(o.client_id)?.full_name ?? 'Cliente',
    address: [o.address_line, o.neighborhood, o.municipality].filter(Boolean).join(', ') || 'Sin dirección',
    technicianName: (o.technician_id && (getProfile(o.technician_id)?.full_name ?? getTechByUser(o.technician_id)?.display_name)) || 'Técnico',
    description: o.description?.trim() || o.title || null,
    items,
    totalCents: total,
    advanceCents: adv,
    balanceCents: total - adv,
    paymentState: 'Pagado',
  };
}

function mockTickets(orderId: string): ServiceTicket[] {
  const o = getRequest(orderId);
  if (!o || !DONE.has(o.status)) return [];
  const techId = o.technician_id;
  const by = techId ? { id: techId, name: getProfile(techId)?.full_name ?? getTechByUser(techId)?.display_name ?? 'Técnico' } : null;
  const n = 1 + (hashN(orderId) % 3);
  const channels = ['print', 'pdf', 'both'];
  return Array.from({ length: n }, (_, i) => n - i).map(v => ({
    id: `${orderId}-t${v}`,
    service_order_id: orderId,
    bucket: 'service-tickets',
    storage_path: `${orderId}/t${v}.pdf`,
    version: v,
    generated_at: new Date(Date.now() - (n - v + 1) * 2 * H).toISOString(),
    channel: channels[(v + hashN(orderId)) % 3],
    copies: ['cliente', 'tecnico', 'admin'],
    generated_by: by,
    snapshot: mockSnapshot(orderId, v),
  }));
}

const pdfEsc = (s: string) => s.replace(/[\\()]/g, '\\$&').replace(/[^\x20-\x7e]/g, '?');

/** PDF mínimo (Courier) con el texto de la primera copia, para la maqueta. */
function mockTicketPdf(t: ServiceTicket): string | null {
  if (typeof Blob === 'undefined' || !URL.createObjectURL) return null;
  const snap = parseSnapshot(t.snapshot);
  const lines = snap ? ticketLines(snap, 'cliente').map(l => l.text) : ['Ticket'];
  const body = `BT /F1 10 Tf 12 12 Td 12 TL 0 ${lines.length * 12} Td ${lines.map(l => `(${pdfEsc(l)}) Tj T*`).join(' ')} ET`;
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 190 ${lines.length * 12 + 36}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>`,
    `<< /Length ${body.length} >>\nstream\n${body}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offs: number[] = [];
  objs.forEach((o, i) => {
    offs.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offs.map(n => `${String(n).padStart(10, '0')} 00000 n \n`).join('')}`;
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
}

// --- API ---------------------------------------------------------------------
/** Versiones del ticket de cierre de una orden, la más nueva primero. Lanza si el RPC falla. */
export async function listServiceTickets(orderId: string): Promise<ServiceTicket[]> {
  if (MOCK) return mockTickets(orderId);
  const { data, error } = await supabase.rpc('list_service_tickets', { p_order_id: orderId });
  if (error) throw error;
  return parseTickets(data);
}

/** Ids de las órdenes con al menos un ticket de cierre (una sola consulta para la lista). */
export async function listTicketedOrderIds(): Promise<Set<string>> {
  if (MOCK) return new Set(getAllRequests().filter(o => DONE.has(o.status)).map(o => o.id));
  const { data, error } = await supabase.from('service_tickets').select('service_order_id');
  if (error) throw error;
  return new Set((data ?? []).map(r => r.service_order_id));
}

/** URL firmada (5 min) del PDF; `download` fuerza la descarga con ese nombre. null = no disponible. */
export async function serviceTicketUrl(t: ServiceTicket, download?: string): Promise<string | null> {
  if (MOCK) return mockTicketPdf(t);
  const { data, error } = await supabase.storage
    .from(t.bucket)
    .createSignedUrl(t.storage_path, 300, download ? { download } : undefined);
  if (error) {
    console.warn('[data] service-tickets signed url', error);
    return null;
  }
  return data.signedUrl;
}
