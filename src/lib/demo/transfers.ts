// ponytail: comprobantes de transferencia SOLO para el modo maqueta, uno por
// cada estado que «Revisión de pagos» debe pintar (en revisión, aceptada,
// rechazada, cancelada por pago con tarjeta y reembolso pendiente). Cuelgan de
// las órdenes 4029–4035 de demo/payments.ts. Determinista.
import type { Database } from '@/types/supabase';

type Order = Database['public']['Tables']['service_orders']['Row'];
type Transfer = Database['public']['Tables']['payment_transfers']['Row'];

const MIN = 60_000;
const iso = (ms: number) => new Date(ms).toISOString();

interface Spec {
  id: string;
  folio: number;
  /** minutos después de creada la orden */
  at: number;
  file: string;
  reference: string;
  status: Transfer['status'];
  reason?: string;
  /** minutos después de subido */
  reviewedAfter?: number;
}

const SPECS: Spec[] = [
  { id: 'ptr-4029-a', folio: 4029, at: 6, file: 'comprobante.jpg', reference: 'SPEI 0848123', status: 'submitted' },
  { id: 'ptr-4030-a', folio: 4030, at: 8, file: 'captura.png', reference: 'BBVA 55120', status: 'rejected', reason: 'Monto no coincide', reviewedAfter: 35 },
  { id: 'ptr-4031-a', folio: 4031, at: 5, file: 'foto.jpg', reference: '12345', status: 'rejected', reason: 'Comprobante ilegible', reviewedAfter: 20 },
  { id: 'ptr-4031-b', folio: 4031, at: 40, file: 'comprobante-spei.pdf', reference: 'SPEI 7781200', status: 'accepted', reviewedAfter: 25 },
  { id: 'ptr-4032-a', folio: 4032, at: 4, file: 'spei.pdf', reference: 'Santander 99812', status: 'submitted' },
  { id: 'ptr-4033-a', folio: 4033, at: 7, file: 'deposito.jpg', reference: 'OXXO-DEP 4410', status: 'accepted', reviewedAfter: 180 },
  { id: 'ptr-4036-a', folio: 4036, at: 30, file: 'pago.jpg', reference: 'HSBC 77100', status: 'rejected', reason: 'No se encontró el depósito', reviewedAfter: 300 },
  { id: 'ptr-4037-a', folio: 4037, at: 200, file: 'comprobante-banorte.pdf', reference: 'Banorte 88120', status: 'submitted' },
  { id: 'ptr-4034-a', folio: 4034, at: 3, file: 'transfer.png', reference: 'Banorte 30021', status: 'cancelled', reviewedAfter: 6 },
];

export function demoTransfers(orders: Order[], now: number): Transfer[] {
  return SPECS.flatMap(s => {
    const o = orders.find(x => x.folio === s.folio);
    if (!o) return [];
    const created = Math.min(now - MIN, new Date(o.created_at).getTime() + s.at * MIN);
    const reviewed = s.reviewedAfter != null ? iso(Math.min(now - MIN, created + s.reviewedAfter * MIN)) : null;
    const t: Transfer = {
      id: s.id,
      service_order_id: o.id,
      client_id: o.client_id,
      payment_id: s.status === 'accepted' ? `pay-b-${s.folio}` : null,
      amount_cents: o.base_total_cents ?? o.base_fee_cents,
      reference: s.reference,
      proof_path: `${o.client_id}/${o.id}/${s.file}`,
      status: s.status,
      reject_reason: s.reason ?? null,
      reviewed_by: s.status === 'accepted' || s.status === 'rejected' ? 'u-admin' : null,
      reviewed_at: reviewed,
      created_at: iso(created),
      updated_at: reviewed ?? iso(created),
    };
    return [t];
  });
}

/** Vista previa de maqueta: un recibo SVG (data URI, permitido por la CSP en img-src). */
export function mockProofImage(t: Pick<Transfer, 'reference' | 'amount_cents' | 'created_at'>): string {
  const amount = (t.amount_cents / 100).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  const date = new Date(t.created_at).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
  const esc = (x: string) => x.replace(/[<>&"]/g, c => `&#${c.charCodeAt(0)};`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="520" viewBox="0 0 360 520">
<rect width="360" height="520" rx="18" fill="#f4f6fb"/><rect x="20" y="20" width="320" height="480" rx="14" fill="#fff" stroke="#d8deea"/>
<text x="180" y="70" font-family="sans-serif" font-size="15" text-anchor="middle" fill="#5b6478">Comprobante de transferencia</text>
<text x="180" y="96" font-family="sans-serif" font-size="12" text-anchor="middle" fill="#8a93a6">SPEI · maqueta</text>
<text x="180" y="170" font-family="sans-serif" font-size="34" font-weight="700" text-anchor="middle" fill="#14213d">${esc(amount)}</text>
<line x1="44" y1="210" x2="316" y2="210" stroke="#e6eaf2"/>
<text x="44" y="250" font-family="sans-serif" font-size="12" fill="#8a93a6">Referencia</text>
<text x="44" y="272" font-family="monospace" font-size="15" fill="#14213d">${esc(t.reference)}</text>
<text x="44" y="315" font-family="sans-serif" font-size="12" fill="#8a93a6">Fecha</text>
<text x="44" y="337" font-family="sans-serif" font-size="15" fill="#14213d">${esc(date)}</text>
<text x="44" y="380" font-family="sans-serif" font-size="12" fill="#8a93a6">Beneficiario</text>
<text x="44" y="402" font-family="sans-serif" font-size="15" fill="#14213d">Tu Mantenimiento</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** PDF mínimo de maqueta (para probar el enlace «Abrir PDF»). */
export function mockProofPdf(): string | null {
  if (typeof Blob === 'undefined' || typeof URL === 'undefined' || !URL.createObjectURL) return null;
  const body = 'BT /F1 18 Tf 72 720 Td (Comprobante de transferencia - maqueta) Tj ET';
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${body.length} >>\nstream\n${body}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objs.forEach((o, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map(n => `${String(n).padStart(10, '0')} 00000 n \n`).join('')}`;
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
}
