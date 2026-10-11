import { describe, expect, it } from 'vitest';
import { techTypeLabel, typeChangeText, typeCompanyValid } from './techType';

describe('techType', () => {
  it('etiquetas', () => {
    expect(techTypeLabel('tumtto')).toBe('Tumtto');
    expect(techTypeLabel('independent', 'X')).toBe('Independiente');
    expect(techTypeLabel('third_party', 'Acme')).toBe('Tercero · Acme');
  });
  it('tercero exige empresa', () => {
    expect(typeCompanyValid('third_party', null)).toBe(false);
    expect(typeCompanyValid('third_party', 'c1')).toBe(true);
    expect(typeCompanyValid('tumtto', 'c1')).toBe(false);
    expect(typeCompanyValid('independent', null)).toBe(true);
  });
  it('texto de bitácora', () => {
    const name = (id: string) => (id === 'c1' ? 'Acme' : null);
    expect(
      typeChangeText({ from_type: 'independent', to_type: 'third_party', to_company_id: 'c1' }, name),
    ).toBe('Tipo cambiado: Independiente → Tercero (Acme)');
    expect(typeChangeText({ from_type: 'tumtto', to_type: 'independent', note: 'baja' }, name)).toBe(
      'Tipo cambiado: Tumtto → Independiente — baja',
    );
  });
});
