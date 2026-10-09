import { describe, expect, it } from 'vitest';
import {
  formatPlate,
  isValidPlate,
  matchingPlates,
  normalizePlate,
  vehicleEventText,
} from './vehicles';

describe('vehicles', () => {
  it('normaliza placas', () => {
    expect(normalizePlate(' jkl-123 a ')).toBe('JKL123A');
    expect(isValidPlate('JKL123A')).toBe(true);
    expect(isValidPlate('AB1')).toBe(false);
    expect(isValidPlate('ABC-123')).toBe(false);
  });
  it('agrupa para mostrar', () => {
    expect(formatPlate('jkl-123-a')).toBe('JKL 123 A');
    expect(formatPlate('ABCD12')).toBe('ABCD12');
  });
  it('busca por placa con consulta normalizada', () => {
    const vs = [
      { technician_id: 't1', plate: 'JKL123A' },
      { technician_id: 't2', plate: 'XYZ987' },
    ];
    expect(matchingPlates(vs, 't1', 'jkl 123')).toEqual(['JKL123A']);
    expect(matchingPlates(vs, 't1', 'xyz')).toEqual([]);
    expect(matchingPlates(vs, 't1', ' - ')).toEqual([]);
  });
  it('texto de bitácora', () => {
    expect(
      vehicleEventText('vehicle_added', { after: { make: 'Nissan', model: 'NP300', year: 2019, plate: 'JKL123A' } }),
    ).toBe('Vehículo agregado: Nissan NP300 2019 · JKL 123 A');
    expect(vehicleEventText('vehicle_removed', { before: { make: 'VW', plate: 'ABC1234' } })).toBe(
      'Vehículo eliminado: VW · ABC 123 4',
    );
    expect(vehicleEventText('vehicle_updated', null)).toBe('Vehículo actualizado');
  });
});
