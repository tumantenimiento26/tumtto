import { describe, expect, it } from 'vitest';
import { zoneAssignOptions, type ZoneAssignCandidate } from './regions';

const t = (p: Partial<ZoneAssignCandidate>): ZoneAssignCandidate => ({
  id: p.name ?? 'x', name: 'x', type: 'independent', kycApproved: true, zoneId: null, municipality: null, ...p,
});

describe('zoneAssignOptions', () => {
  it('lists Tumtto technicians first, then third parties and independents', () => {
    const opts = zoneAssignOptions(
      [t({ name: 'Zoe', type: 'independent' }), t({ name: 'Ana', type: 'third_party' }), t({ name: 'Beto', type: 'tumtto' })],
      'z1',
    );
    expect(opts.map(o => o.label)).toEqual(['Beto', 'Ana', 'Zoe']);
    expect(opts[0].hint).toContain('Tumtto');
  });

  it('keeps Tumtto technicians with KYC pending but drops other unapproved ones', () => {
    const opts = zoneAssignOptions(
      [t({ name: 'Propio', type: 'tumtto', kycApproved: false }), t({ name: 'Indep', kycApproved: false })],
      'z1',
    );
    expect(opts.map(o => o.label)).toEqual(['Propio']);
    expect(opts[0].hint).toContain('KYC en revisión');
  });

  it('hides technicians already assigned to the zone', () => {
    expect(zoneAssignOptions([t({ name: 'Ya', zoneId: 'z1' })], 'z1')).toEqual([]);
  });
});
