// Reglas de platform_settings (solo las keys que el backend lee de verdad).
// El trigger app.validate_platform_setting exige enteros en *_bps/*_minutes/
// *_cents/*_days/*_m y booleanos en *_enabled / admin_require_aal2; estos son
// los mismos rangos para avisar antes de llamar a upsert_platform_setting.

export type SettingValue = number | string | boolean | string[];
export type Settings = Record<string, SettingValue>;

type Rule = { min: number; max: number; label: string };

const INT_RULES: Record<string, Rule> = {
  request_ttl_minutes: { min: 1, max: 1440, label: 'La ventana de aceptación' },
  default_match_radius_m: { min: 500, max: 100_000, label: 'El radio de búsqueda' },
  stripe_fee_estimate_fixed_cents: { min: 0, max: 100_000, label: 'La comisión fija de Stripe' },
  account_deletion_grace_days: { min: 1, max: 365, label: 'El periodo de gracia de baja' },
  emergency_initial_radius_m: { min: 500, max: 100_000, label: 'El radio inicial de emergencia' },
  emergency_radius_step_m: { min: 100, max: 100_000, label: 'El incremento de radio' },
  emergency_max_radius_m: { min: 500, max: 100_000, label: 'El radio máximo de emergencia' },
  emergency_round_seconds: { min: 1, max: 3600, label: 'Los segundos por ronda' },
  emergency_timeout_minutes: { min: 1, max: 1440, label: 'El tiempo límite de emergencia' },
  unassigned_alert_minutes: { min: 1, max: 1440, label: 'El umbral de alerta de solicitudes sin técnico' },
  schedule_surcharge_start_hour: { min: 0, max: 23, label: 'La hora de inicio del recargo por horario' },
  schedule_surcharge_end_hour: { min: 0, max: 23, label: 'La hora de fin del recargo por horario' },
  emergency_surcharge_fixed_cents: { min: 0, max: 10_000_000, label: 'El recargo fijo de emergencia' },
};

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
    } else if (key === 'emergency_surcharge_mode') {
      if (v !== 'percent' && v !== 'fixed')
        errs[key] = 'El modo de recargo debe ser porcentaje o monto fijo.';
    } else if (key === 'schedule_surcharge_weekends') {
      if (typeof v !== 'boolean') errs[key] = 'Indica si el recargo aplica en fin de semana.';
    } else if (key === 'enabled_payment_methods') {
      if (!Array.isArray(v) || v.length === 0)
        errs[key] = 'Deja al menos un método de pago activo.';
    }
  }
  const ini = s.emergency_initial_radius_m;
  const max = s.emergency_max_radius_m;
  if (
    !errs.emergency_max_radius_m &&
    typeof ini === 'number' &&
    typeof max === 'number' &&
    max < ini
  )
    errs.emergency_max_radius_m =
      'El radio máximo no puede ser menor que el radio inicial.';
  const sh = s.schedule_surcharge_start_hour;
  const eh = s.schedule_surcharge_end_hour;
  if (
    !errs.schedule_surcharge_end_hour &&
    typeof sh === 'number' &&
    typeof eh === 'number' &&
    sh === eh
  )
    errs.schedule_surcharge_end_hour =
      'La hora de fin debe ser distinta de la de inicio (la franja cruza la medianoche si es menor).';
  return errs;
}

const same = (a: SettingValue | undefined, b: SettingValue | undefined) =>
  Array.isArray(a) || Array.isArray(b)
    ? JSON.stringify(a) === JSON.stringify(b)
    : a === b;

/** Solo las keys que cambiaron respecto a lo cargado de la base. */
export function changedSettings(next: Settings, base: Settings): Settings {
  return Object.fromEntries(
    Object.entries(next).filter(([k, v]) => !same(v, base[k])),
  );
}

/** "15.5" (%) → 1550 bps; NaN se conserva para que la validación lo marque. */
export const pctToBps = (pct: number) =>
  Number.isFinite(pct) ? Math.round(pct * 100) : NaN;
