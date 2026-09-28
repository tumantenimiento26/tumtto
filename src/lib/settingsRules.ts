// Reglas de platform_settings. El backend las lee como enteros
// (`(value #>> '{}')::integer`): un "2.5" o un vacío rompía la creación de
// servicios. Mismos rangos que el CHECK del backend.

export type SettingValue = number | string | boolean;
export type Settings = Record<string, SettingValue>;

type Rule = { min: number; max: number; label: string };

const INT_RULES: Record<string, Rule> = {
  request_ttl_minutes: { min: 1, max: 1440, label: 'La ventana de aceptación' },
  sla_first_response_minutes: {
    min: 1,
    max: 1440,
    label: 'La primera respuesta',
  },
  sla_dispute_hours: { min: 1, max: 720, label: 'La resolución de disputas' },
  intro_program_days: { min: 1, max: 3650, label: 'La duración del programa' },
  cancel_free_window_hours: { min: 0, max: 720, label: 'La ventana sin costo' },
  tech_max_cancellations_30d: {
    min: 0,
    max: 100,
    label: 'El máximo de cancelaciones',
  },
  noshow_wait_minutes: { min: 1, max: 240, label: 'El tiempo de espera' },
  quiet_start_hours: {
    min: 0,
    max: 23,
    label: 'El inicio del horario silencioso',
  },
  quiet_end_hours: { min: 0, max: 23, label: 'El fin del horario silencioso' },
};

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/** Mensaje por key inválida; objeto vacío = todo bien. */
export function validateSettings(s: Settings): Record<string, string> {
  const errs: Record<string, string> = {};
  for (const [key, v] of Object.entries(s)) {
    if (key.endsWith('_bps')) {
      if (typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v > 10000)
        errs[key] = 'Debe ser un porcentaje entre 0 y 100 (máx. 2 decimales).';
    } else if (INT_RULES[key]) {
      const r = INT_RULES[key];
      if (
        typeof v !== 'number' ||
        !Number.isInteger(v) ||
        v < r.min ||
        v > r.max
      )
        errs[key] =
          `${r.label} debe ser un número entero entre ${r.min} y ${r.max}.`;
    }
  }
  if ('platform_name' in s && !String(s.platform_name).trim())
    errs.platform_name = 'Escribe el nombre comercial.';
  if ('support_email' in s && !EMAIL_RE.test(String(s.support_email).trim()))
    errs.support_email = 'Correo de soporte no válido.';
  if ('support_phone' in s && !String(s.support_phone).trim())
    errs.support_phone = 'Escribe el teléfono de soporte.';
  return errs;
}

/** Solo las keys que cambiaron respecto a lo cargado de la base. */
export function changedSettings(next: Settings, base: Settings): Settings {
  return Object.fromEntries(
    Object.entries(next).filter(([k, v]) => base[k] !== v),
  );
}

/** "15.5" (%) → 1550 bps; NaN se conserva para que la validación lo marque. */
export const pctToBps = (pct: number) =>
  Number.isFinite(pct) ? Math.round(pct * 100) : NaN;
