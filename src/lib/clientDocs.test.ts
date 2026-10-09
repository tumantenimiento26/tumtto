import { describe, expect, it } from 'vitest';
import { CLIENT_DOC_STATUS, clientDocStatus, rejectionNotes } from './clientDocs';

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
});
