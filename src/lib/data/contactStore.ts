'use client';
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';
import { MOCK } from '@/lib/mock';
import { demoContactMessages } from '@/lib/demo/contact';
import type { ContactMessage, ContactStatus } from '@/lib/contactAdmin';

// Mensajes del formulario público del landing (contact_messages). Tienen su
// propio store pequeño: la campana de notificaciones también los lee y no debe
// cargar todos los `extras` de la consola.
interface ContactState {
  messages: ContactMessage[];
  loaded: boolean;
  failed: boolean;
}

export const useContact = create<ContactState>(() => ({
  messages: [],
  loaded: false,
  failed: false,
}));

export const getContactMessages = () => useContact.getState().messages;

let inflight: Promise<void> | null = null;

export function loadContactMessages(force = false): Promise<void> {
  if (MOCK) {
    if (!useContact.getState().loaded)
      useContact.setState({ messages: demoContactMessages(), loaded: true });
    return Promise.resolve();
  }
  if (inflight) return inflight;
  if (!force && useContact.getState().loaded) return Promise.resolve();
  inflight = (async () => {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) {
      console.warn('[data] contact_messages no disponible', error);
      useContact.setState({ failed: true, loaded: true });
      return;
    }
    useContact.setState({ messages: data ?? [], loaded: true, failed: false });
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

/** RPC admin_update_contact_message (permiso soporte; deja bitácora). */
export async function updateContactMessage(
  id: string,
  status: ContactStatus,
  note?: string,
): Promise<ContactMessage | null> {
  const p_note = note?.trim() || undefined;
  if (MOCK) {
    const now = new Date().toISOString();
    let out: ContactMessage | null = null;
    useContact.setState(s => ({
      messages: s.messages.map(m => {
        if (m.id !== id) return m;
        out = {
          ...m,
          status,
          admin_note: p_note ?? m.admin_note,
          handled_by: status === 'new' ? null : 'mock-admin',
          handled_at: status === 'new' ? null : now,
          updated_at: now,
        };
        return out;
      }),
    }));
    return out;
  }
  const { data, error } = await supabase.rpc('admin_update_contact_message', {
    p_id: id,
    p_status: status,
    p_note,
  });
  if (error) throw error;
  useContact.setState(s => ({
    messages: s.messages.map(m => (m.id === id ? data : m)),
  }));
  return data;
}
