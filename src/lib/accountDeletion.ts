// Baja de cuenta desde la web (/eliminar-cuenta). Usa las mismas RPC que la
// app (`request_account_deletion` / `cancel_account_deletion`): el backend fija
// el periodo de gracia y account-deletion-worker la ejecuta al vencer.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

type Client = SupabaseClient<Database>;

export type PendingDeletion = Pick<
  Database['public']['Tables']['account_deletion_requests']['Row'],
  'id' | 'status' | 'requested_at' | 'execute_after'
>;

/** Palabra exacta que confirma la baja (igual que en la app). */
export const DELETE_WORD = 'ELIMINAR';

/** Mayúsculas exactas; solo se ignoran espacios alrededor. */
export const isDeleteConfirmed = (text: string) => text.trim() === DELETE_WORD;

/**
 * `request_account_deletion` bloquea la baja con un mensaje ya en español
 * («Tienes servicios en curso…», «Tienes saldo pendiente…»): se muestra tal
 * cual. Cualquier otro error → null (copy genérico).
 */
export function deletionBlockedReason(cause: unknown): string | null {
  const msg =
    typeof cause === 'object' && cause && 'message' in cause
      ? String((cause as { message: unknown }).message).trim()
      : '';
  return /^tienes\s/i.test(msg) ? msg : null;
}

/** "3 de diciembre de 2026" en hora de la ZMG. */
export function formatDeletionDate(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Mexico_City',
  }).format(new Date(iso));
}

/** Baja pendiente del usuario con sesión (null si no hay). */
export async function getPendingDeletion(
  client: Client,
): Promise<PendingDeletion | null> {
  const { data, error } = await client
    .from('account_deletion_requests')
    .select('id, status, requested_at, execute_after')
    .eq('status', 'pending')
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Solicita la baja; si ya había una pendiente, el backend devuelve esa. */
export async function requestDeletion(client: Client): Promise<PendingDeletion> {
  const { data, error } = await client.rpc('request_account_deletion');
  if (error) throw error;
  return data;
}

export async function cancelDeletion(client: Client): Promise<void> {
  const { error } = await client.rpc('cancel_account_deletion');
  if (error) throw error;
}
