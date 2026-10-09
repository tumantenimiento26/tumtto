// Vehículos del técnico: helpers puros (placas, validación, bitácora).

/** Placa normalizada como la guarda el backend: mayúsculas, sin espacios ni guiones. */
export const normalizePlate = (s: string) => s.toUpperCase().replace(/[\s-]+/g, '');

/** Formato de la tabla: 5–8 caracteres alfanuméricos (ya normalizada). */
export const isValidPlate = (normalized: string) => /^[A-Z0-9]{5,8}$/.test(normalized);

/** Agrupa para mostrar: «JKL123A» → «JKL 123 A»; el resto, tal cual. */
export function formatPlate(plate: string): string {
  const p = normalizePlate(plate);
  const m = /^([A-Z]{3})(\d{3})([A-Z0-9]{1,2})$/.exec(p);
  return m ? `${m[1]} ${m[2]} ${m[3]}` : p;
}

export interface VehicleLike {
  technician_id: string;
  plate: string;
}

/** Placas del técnico que contienen la consulta (normalizada; vacía → ninguna). */
export function matchingPlates(vehicles: VehicleLike[], techId: string, query: string): string[] {
  const q = normalizePlate(query);
  if (!q) return [];
  return vehicles
    .filter(v => v.technician_id === techId && normalizePlate(v.plate).includes(q))
    .map(v => v.plate);
}

export const VEHICLE_EVENT_LABEL: Record<string, string> = {
  vehicle_added: 'Vehículo agregado',
  vehicle_updated: 'Vehículo actualizado',
  vehicle_removed: 'Vehículo eliminado',
};

interface VehiclePayload {
  before?: Partial<Record<'make' | 'model' | 'year' | 'color' | 'plate', unknown>> | null;
  after?: Partial<Record<'make' | 'model' | 'year' | 'color' | 'plate', unknown>> | null;
}

const desc = (v?: VehiclePayload['after']) =>
  v
    ? `${[v.make, v.model, v.year].filter(Boolean).join(' ')}${v.plate ? ` · ${formatPlate(String(v.plate))}` : ''}`
    : '';

/** Texto de bitácora: «Vehículo agregado: Nissan NP300 2019 · JKL 123 A». */
export function vehicleEventText(eventType: string, payload: unknown): string {
  const label = VEHICLE_EVENT_LABEL[eventType] ?? eventType;
  const p = (payload ?? {}) as VehiclePayload;
  const d = desc(eventType === 'vehicle_removed' ? (p.before ?? p.after) : (p.after ?? p.before));
  return d ? `${label}: ${d}` : label;
}
