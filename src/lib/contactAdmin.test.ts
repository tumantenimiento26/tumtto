import { describe, expect, it } from 'vitest';
import {
  NO_CONTACT_FILTERS,
  activeContactFilters,
  excerpt,
  filterContacts,
  newContactCount,
  replyLinks,
} from './contactAdmin';
import { demoContactMessages } from './demo/contact';

const all = demoContactMessages();

describe('contactAdmin', () => {
  it('lista: nuevos primero, luego por fecha', () => {
    const out = filterContacts(all, NO_CONTACT_FILTERS);
    expect(out.map(m => m.status).slice(0, 3)).toEqual(['new', 'new', 'new']);
    expect(out[0].id).toBe('mock-cm-1');
  });
  it('filtra por tipo, estado y búsqueda sin acentos', () => {
    expect(filterContacts(all, { ...NO_CONTACT_FILTERS, type: 'company' })).toHaveLength(1);
    expect(filterContacts(all, { ...NO_CONTACT_FILTERS, status: 'archived' })).toHaveLength(1);
    expect(filterContacts(all, { ...NO_CONTACT_FILTERS, query: 'ramirez' })).toHaveLength(1);
  });
  it('cuenta filtros activos y nuevos', () => {
    expect(activeContactFilters({ query: 'x', type: 'client', status: 'new' })).toBe(2);
    expect(newContactCount(all)).toBe(3);
  });
  it('excerpt recorta con elipsis', () => {
    expect(excerpt('a  b\nc', 10)).toBe('a b c');
    expect(excerpt('x'.repeat(100), 20)).toHaveLength(20);
  });
  it('replyLinks arma WhatsApp, correo y tel', () => {
    const l = replyLinks({ name: 'Ana Pérez', email: 'a@b.mx', phone: '3312345678' });
    expect(l.whatsapp).toContain('https://wa.me/523312345678?text=');
    expect(decodeURIComponent(l.whatsapp!)).toContain('Hola Ana');
    expect(l.mail).toMatch(/^mailto:a@b\.mx\?subject=/);
    expect(l.tel).toBe('tel:+523312345678');
  });
});
