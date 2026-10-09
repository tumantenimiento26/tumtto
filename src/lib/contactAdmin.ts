// Lógica pura de la pestaña «Contacto» de Soporte (lista, filtros, respuesta).
import type { Database } from '@/types/supabase';
import { mailLink, normalizeMxPhone, telLink, waLink } from './contact';
import { CONTACT_TYPES } from './contactForm';
import { matches } from './supportFormat';

export type ContactStatus = Database['public']['Enums']['contact_status'];
export type ContactMessage = Database['public']['Tables']['contact_messages']['Row'];

export const CONTACT_STATUS_LABEL: Record<ContactStatus, string> = {
  new: 'Nuevo',
  handled: 'Atendido',
  archived: 'Archivado',
};

export const CONTACT_TYPE_LABEL: Record<ContactMessage['contact_type'], string> =
  Object.fromEntries(CONTACT_TYPES.map(t => [t.value, t.label])) as Record<
    ContactMessage['contact_type'],
    string
  >;

export function emailStatusLabel(s: string | null): string {
  if (s === 'sent') return 'Correo enviado';
  if (s === 'failed') return 'Correo fallido';
  if (s === 'skipped') return 'Correo omitido';
  return 'Sin correo';
}

export type ContactFilters = {
  query: string;
  type: ContactMessage['contact_type'] | 'todos';
  status: ContactStatus | 'todos';
};

export const NO_CONTACT_FILTERS: ContactFilters = {
  query: '',
  type: 'todos',
  status: 'todos',
};

/** Cantidad de filtros activos (sin contar la búsqueda). */
export const activeContactFilters = (f: ContactFilters) =>
  Number(f.type !== 'todos') + Number(f.status !== 'todos');

/** Nuevos primero; dentro de cada grupo, los más recientes arriba. */
export function filterContacts(
  list: ContactMessage[],
  f: ContactFilters,
): ContactMessage[] {
  return list
    .filter(
      m =>
        (f.type === 'todos' || m.contact_type === f.type) &&
        (f.status === 'todos' || m.status === f.status) &&
        matches(f.query, m.name, m.email, m.phone, m.message),
    )
    .sort(
      (a, b) =>
        Number(b.status === 'new') - Number(a.status === 'new') ||
        b.created_at.localeCompare(a.created_at),
    );
}

export function excerpt(text: string, max = 90): string {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

/** Enlaces para responder a quien escribió (WhatsApp, correo, llamada). */
export function replyLinks(m: Pick<ContactMessage, 'name' | 'email' | 'phone'>) {
  const first = m.name.trim().split(/\s+/)[0] ?? '';
  const phone = normalizeMxPhone(m.phone);
  return {
    whatsapp: waLink(
      phone,
      `Hola ${first}, te escribimos de Tumantenimiento sobre tu mensaje.`,
    ),
    mail: mailLink(m.email, 'Re: tu mensaje a Tumantenimiento'),
    tel: telLink(phone),
  };
}

export const newContactCount = (list: ContactMessage[]) =>
  list.filter(m => m.status === 'new').length;
