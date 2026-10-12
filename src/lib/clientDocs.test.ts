import { describe, expect, it } from 'vitest';
import {
  CLIENT_DOC_REJECT_REASONS,
  CLIENT_DOC_STATUS,
  clientDocStatus,
  linkedAddressPoint,
  linkedAddressText,
  proofTypeLabel,
  rejectionNotes,
  requiresIssueDate,
} from './clientDocs';

describe('clientDocs', () => {
  it('mapea estados visibles', () => {
    expect(CLIENT_DOC_STATUS[clientDocStatus(null)].label).toBe('Pendiente');
    expect(CLIENT_DOC_STATUS[clientDocStatus({ review_status: 'pending' })].label).toBe('En revisión');
    expect(CLIENT_DOC_STATUS[clientDocStatus({ review_status: 'approved' })].label).toBe('Aprobado');
    expect(CLIENT_DOC_STATUS[clientDocStatus({ review_status: 'rejected' })].tone).toBe('danger');
  });
  it('exige motivo no vacío', () => {
    expect(rejectionNotes('  ')).toBeNull();
    expect(rejectionNotes(undefined)).toBeNull();
    expect(rejectionNotes(' foto borrosa ')).toBe('foto borrosa');
  });
  it('etiqueta el tipo; NULL (legado) cuenta como recibo', () => {
    expect(proofTypeLabel('ine')).toBe('INE');
    expect(proofTypeLabel('electricity')).toBe('Recibo de luz');
    expect(proofTypeLabel('bank_statement')).toBe('Carátula de estado de cuenta');
    expect(proofTypeLabel(null)).toBe('Recibo (sin tipo)');
  });
  it('solo los recibos llevan fecha de emisión', () => {
    expect(requiresIssueDate('ine')).toBe(false);
    expect(requiresIssueDate('phone')).toBe(true);
    expect(requiresIssueDate(null)).toBe(true);
  });
  it('incluye «La dirección no coincide» entre los motivos', () => {
    expect(CLIENT_DOC_REJECT_REASONS).toContain('La dirección no coincide');
  });
  it('arma la dirección vinculada y su punto', () => {
    const d = {
      address_line: 'Av. Pablo Neruda 2825',
      address_neighborhood: 'Providencia',
      address_municipality: 'Zapopan',
      address_state: 'Jalisco',
      address_postal_code: '44630',
      address_lat: 20.7062,
      address_lng: -103.3773,
    };
    expect(linkedAddressText(d)).toBe(
      'Av. Pablo Neruda 2825, Providencia, Zapopan, Jalisco, C.P. 44630',
    );
    expect(linkedAddressPoint(d)).toEqual([-103.3773, 20.7062]);
    expect(linkedAddressText({ address_line: null, address_postal_code: ' ' })).toBeNull();
    expect(linkedAddressPoint({ address_lat: 20.7, address_lng: null })).toBeNull();
  });
});
