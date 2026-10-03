// Tipo de técnico (clasificación interna, solo admin): helpers puros.
export type TechType = 'tumtto' | 'third_party' | 'independent';
type Tone = 'info' | 'warning' | 'neutral';

export const TECH_TYPES: TechType[] = ['tumtto', 'third_party', 'independent'];

export const TECH_TYPE_LABEL: Record<TechType, string> = {
  tumtto: 'Tumtto',
  third_party: 'Tercero',
  independent: 'Independiente',
};

export const TECH_TYPE_TONE: Record<TechType, Tone> = {
  tumtto: 'info',
  third_party: 'warning',
  independent: 'neutral',
};

/** «Tumtto» · «Tercero · Empresa X» · «Independiente». */
export function techTypeLabel(type: TechType, companyName?: string | null): string {
  return type === 'third_party' && companyName
    ? `${TECH_TYPE_LABEL[type]} · ${companyName}`
    : TECH_TYPE_LABEL[type];
}

/** ¿Es una combinación válida? Tercero exige empresa; los demás, ninguna. */
export const typeCompanyValid = (type: TechType, companyId: string | null | undefined) =>
  (type === 'third_party') === !!companyId;

interface TypeChangePayload {
  from_type?: string;
  to_type?: string;
  from_company_id?: string | null;
  to_company_id?: string | null;
  note?: string | null;
}

/** Texto de bitácora: «Tipo cambiado: Independiente → Tercero (Empresa X)». */
export function typeChangeText(
  payload: unknown,
  companyName: (id: string) => string | null,
): string {
  const p = (payload ?? {}) as TypeChangePayload;
  const side = (t?: string, c?: string | null) => {
    const label = TECH_TYPE_LABEL[t as TechType] ?? t ?? '—';
    const co = c ? companyName(c) : null;
    return co ? `${label} (${co})` : label;
  };
  const base = `Tipo cambiado: ${side(p.from_type, p.from_company_id)} → ${side(p.to_type, p.to_company_id)}`;
  return p.note ? `${base} — ${p.note}` : base;
}
