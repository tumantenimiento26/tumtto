// Preferencias de notificaciones de la consola en platform_settings (puro).
// Keys `notif_<tipo>_<canal>` (booleanas: el trigger del backend exige bool
// en notif_*) y horario silencioso con `quiet_*_hours` (enteros ≥ 0).

import type { NotifType } from '@/lib/data/notifications';

export const NOTIF_CHANNELS = [
  { key: 'push', label: 'Push' },
  { key: 'email', label: 'Correo' },
  { key: 'sms', label: 'SMS' },
  { key: 'sound', label: 'Sonido' },
] as const;
export type NotifChannel = (typeof NOTIF_CHANNELS)[number]['key'];

export const notifKey = (type: NotifType, channel: NotifChannel) =>
  `notif_${type}_${channel}`;

/** Por defecto: todo encendido salvo SMS (solo KYC y disputas). */
export function defaultPref(type: NotifType, channel: NotifChannel): boolean {
  if (channel === 'sms') return type === 'kyc' || type === 'disputas';
  return true;
}

export type PrefMatrix = Record<string, boolean>; // key → valor

export function readMatrix(
  types: readonly NotifType[],
  get: (key: string, fallback: boolean) => boolean,
): PrefMatrix {
  const m: PrefMatrix = {};
  for (const t of types)
    for (const c of NOTIF_CHANNELS)
      m[notifKey(t, c.key)] = get(notifKey(t, c.key), defaultPref(t, c.key));
  return m;
}

/** Tipos silenciados en la campana: los que no tienen ningún canal activo. */
export function mutedTypes(
  types: readonly NotifType[],
  m: PrefMatrix,
): NotifType[] {
  return types.filter(t =>
    NOTIF_CHANNELS.every(c => m[notifKey(t, c.key)] === false),
  );
}

/** ¿La hora `h` (0–23) cae en el horario silencioso? Soporta cruzar medianoche. */
export function inQuietHours(h: number, start: number, end: number): boolean {
  if (start === end) return false;
  return start < end ? h >= start && h < end : h >= start || h < end;
}
