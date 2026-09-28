// Lógica pura de la consola de técnicos (lista + detalle/KYC), probada en
// techConsole.test.ts.

export type KycGroup = 'approved' | 'in_review' | 'declined' | 'suspended';

/** Agrupa el kyc_status del backend (7 valores) en las pestañas de la lista. */
export function kycGroup(
  kycStatus: string,
  profileStatus?: string | null,
): KycGroup {
  if (profileStatus === 'suspended') return 'suspended';
  if (kycStatus === 'approved') return 'approved';
  if (kycStatus === 'declined' || kycStatus === 'abandoned') return 'declined';
  return 'in_review'; // not_started, pending, in_review, resubmitted
}

export const KYC_GROUP_META: Record<
  KycGroup,
  { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' }
> = {
  approved: { label: 'KYC aprobado', tone: 'success' },
  in_review: { label: 'Pendiente KYC', tone: 'warning' },
  declined: { label: 'Rechazado', tone: 'danger' },
  suspended: { label: 'Suspendido', tone: 'neutral' },
};

/** Meta del PRD: resolver cada KYC en menos de 24 h. */
export const KYC_SLA_HOURS = 24;

/** Horas restantes del SLA (negativo = vencido) desde que se envió. */
export function slaRemainingHours(
  submittedAt: string | null | undefined,
  now: Date = new Date(),
  slaHours = KYC_SLA_HOURS,
): number | null {
  if (!submittedAt) return null;
  const elapsed = (now.getTime() - new Date(submittedAt).getTime()) / 36e5;
  return Math.round((slaHours - elapsed) * 10) / 10;
}

export function slaLabel(h: number | null): {
  text: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
} {
  if (h == null) return { text: 'SLA sin iniciar', tone: 'neutral' };
  if (h < 0) return { text: `SLA vencido hace ${Math.ceil(-h)} h`, tone: 'danger' };
  const r = Math.floor(h);
  return {
    text: `SLA ${r} h restantes`,
    tone: h <= 4 ? 'warning' : 'success',
  };
}

/** Rango permitido por tarifa (pesos) — mismo del handoff. */
export const RATE_MIN = 150;
export const RATE_MAX = 5000;

/** Valida una tarifa capturada en pesos; null = válida. */
export function rateError(raw: string): string | null {
  const s = raw.trim();
  if (!s) return 'Requerido';
  const n = Number(s);
  if (!Number.isFinite(n)) return 'Número inválido';
  if (n < RATE_MIN || n > RATE_MAX)
    return `Entre $${RATE_MIN} y $${RATE_MAX.toLocaleString('es-MX')}`;
  return null;
}

export const DOC_LABEL: Record<string, string> = {
  criminal_record: 'Antecedentes no penales',
  proof_of_address: 'Comprobante de domicilio',
  bank_statement: 'Carátula bancaria',
};

export const initials = (name?: string | null) =>
  (name ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

/** "hace 3 h" / "hace 2 d" (para "Documentos · enviado …"). */
export function ago(iso: string | null | undefined, now = new Date()): string {
  if (!iso) return '—';
  const m = Math.max(0, (now.getTime() - new Date(iso).getTime()) / 6e4);
  if (m < 60) return `hace ${Math.max(1, Math.round(m))} min`;
  const h = m / 60;
  if (h < 24) return `hace ${Math.round(h)} h`;
  return `hace ${Math.round(h / 24)} d`;
}

export interface TechListFilters {
  tab: 'all' | KycGroup;
  q: string;
  category: string | null;
  zones: string[];
  minRating: number;
  availability: 'all' | 'available' | 'unavailable';
}

export interface TechListRow {
  name: string;
  phone: string;
  cats: string[];
  zone: string;
  rating: number;
  available: boolean;
  kyc: KycGroup;
}

const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export function filterTechs<T extends TechListRow>(
  rows: T[],
  f: TechListFilters,
): T[] {
  const q = fold(f.q.trim());
  return rows.filter(r => {
    if (f.tab !== 'all' && r.kyc !== f.tab) return false;
    if (f.category && !r.cats.includes(f.category)) return false;
    if (f.zones.length && !f.zones.includes(r.zone)) return false;
    if (f.minRating > 0 && r.rating < f.minRating) return false;
    if (f.availability === 'available' && !r.available) return false;
    if (f.availability === 'unavailable' && r.available) return false;
    if (q && !fold(`${r.name} ${r.phone} ${r.zone}`).includes(q)) return false;
    return true;
  });
}

/** Número de filtros activos del sheet (para el contador del botón). */
export const activeFilterCount = (f: TechListFilters) =>
  (f.zones.length ? 1 : 0) +
  (f.minRating > 0 ? 1 : 0) +
  (f.availability !== 'all' ? 1 : 0);

/** Estado de una orden → etiqueta y tono de Badge. */
export const ORDER_STATUS: Record<
  string,
  { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' | 'info' }
> = {
  requested: { label: 'Solicitado', tone: 'warning' },
  accepted: { label: 'Aceptado', tone: 'info' },
  enroute: { label: 'En camino', tone: 'info' },
  onsite: { label: 'En sitio', tone: 'info' },
  quote: { label: 'Cotizando', tone: 'info' },
  working: { label: 'En trabajo', tone: 'info' },
  closing: { label: 'Por cobrar', tone: 'warning' },
  completed: { label: 'Completado', tone: 'success' },
  paid: { label: 'Pagado', tone: 'success' },
  closed: { label: 'Cerrado', tone: 'neutral' },
  expired: { label: 'Expirado', tone: 'danger' },
  cancelled: { label: 'Cancelado', tone: 'danger' },
};

/** Revisiones automáticas de Didit a partir de raw_decision (tolerante). */
export function diditChecks(
  raw: unknown,
): { label: string; ok: boolean | null }[] {
  if (!raw || typeof raw !== 'object') return [];
  const r = raw as Record<string, unknown>;
  const pick = (key: string) => {
    const v = r[key];
    const s =
      v && typeof v === 'object'
        ? String((v as Record<string, unknown>).status ?? '')
        : String(v ?? '');
    if (!s) return null;
    return /approved|verified|success|passed|true/i.test(s)
      ? true
      : /declined|fail|rejected|false/i.test(s)
        ? false
        : null;
  };
  const MAP: [string, string][] = [
    ['id_verification', 'Identificación (INE)'],
    ['liveness', 'Prueba de vida'],
    ['face_match', 'Coincidencia facial'],
    ['aml', 'Listas de riesgo'],
    ['ip_analysis', 'Análisis de IP'],
  ];
  return MAP.filter(([k]) => k in r).map(([k, label]) => ({ label, ok: pick(k) }));
}
