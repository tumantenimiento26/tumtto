// CSV del tab activo de Soporte (disputas, tickets, KYC pendiente, contacto).
import { exportCsv } from '@/components/admin';
import {
  getAllDisputes,
  getPendingKyc,
  getProfile,
  getTickets,
  ticketRequester,
} from '@/lib/data/store';
import { getContactMessages } from '@/lib/data/contactStore';
import { CONTACT_STATUS_LABEL, CONTACT_TYPE_LABEL } from '@/lib/contactAdmin';
import { orderCode } from '@/lib/orderCode';
import { disputeCode } from '@/lib/supportFormat';
import { fmtDateTime } from '@/lib/dates';

const name = (id: string | null | undefined) => (id ? (getProfile(id)?.full_name ?? '') : '');
const when = (iso: string | null | undefined) =>
  iso ? fmtDateTime(iso, { dateStyle: 'short', timeStyle: 'short' }) : '';
const STATUS: Record<string, string> = {
  open: 'Abierto',
  pending: 'En espera',
  in_review: 'En revisión',
  in_progress: 'En proceso',
  resolved: 'Resuelto',
  closed: 'Cerrado',
};

export function exportSupportTab(tab: 'disputas' | 'tickets' | 'kyc' | 'contacto') {
  const day = new Date().toISOString().slice(0, 10);
  if (tab === 'disputas')
    return exportCsv(
      `disputas-${day}.csv`,
      getAllDisputes().map(d => ({
        Folio: disputeCode(d.id),
        Servicio: orderCode(d.service_order_id),
        'Abierta por': name(d.opened_by),
        Motivo: d.reason,
        Estado: STATUS[d.status] ?? d.status,
        Resultado: d.outcome ?? '',
        Notas: d.resolution_notes ?? '',
        Creada: when(d.created_at),
        Resuelta: when(d.resolved_at),
      })),
    );
  if (tab === 'tickets')
    return exportCsv(
      `tickets-${day}.csv`,
      getTickets().map(t => ({
        Asunto: t.subject,
        Usuario: name(ticketRequester(t)),
        Servicio: t.service_order_id ? orderCode(t.service_order_id) : '',
        Estado: STATUS[t.status] ?? t.status,
        Asignado: name(t.assigned_admin_id),
        Creado: when(t.created_at),
        Actualizado: when(t.updated_at),
      })),
    );
  if (tab === 'kyc')
    return exportCsv(
      `kyc-pendiente-${day}.csv`,
      getPendingKyc().map(t => ({
        Técnico: t.display_name ?? name(t.id),
        Teléfono: getProfile(t.id)?.phone ?? '',
        'Estado KYC': t.kyc_status,
        Registro: when(t.created_at),
      })),
    );
  return exportCsv(
    `contacto-${day}.csv`,
    getContactMessages().map(m => ({
      Nombre: m.name,
      Email: m.email,
      Teléfono: m.phone ?? '',
      Tipo: CONTACT_TYPE_LABEL[m.contact_type] ?? m.contact_type,
      Mensaje: m.message,
      Estado: CONTACT_STATUS_LABEL[m.status] ?? m.status,
      'Nota admin': m.admin_note ?? '',
      Recibido: when(m.created_at),
    })),
  );
}
