'use client';

import { useState } from 'react';
import { Check, ExternalLink, FileText, MapPin, X } from 'lucide-react';
import { Badge, Button, Card, Chip, Kicker, Modal, Textarea } from '@/components/ds';
import { RequestMap } from '@/components/request-map';
import { useAction } from '@/components/use-action';
import { useAuth } from '@/lib/auth';
import { fmtDate } from '@/lib/dates';
import {
  CLIENT_DOC_LABEL,
  CLIENT_DOC_REJECT_REASONS,
  CLIENT_DOC_STATUS,
  clientDocStatus,
  linkedAddressPoint,
  linkedAddressText,
  proofTypeLabel,
  rejectionNotes,
  requiresIssueDate,
} from '@/lib/clientDocs';
import {
  getClientDocument,
  getClientDocumentUrl,
  reviewClientDocument,
  useExtras,
  type ClientDocument,
} from '@/lib/data/store';
import { OcrSummary } from '../../tecnicos/_components/detail-parts';

export const issuedOn = (d: string) =>
  fmtDate(`${d}T12:00:00`, { day: '2-digit', month: 'short', year: 'numeric' });

/**
 * Tipo + fecha de emisión + dirección registrada (con mapa) para comparar
 * contra el documento antes de aprobar.
 */
export function ClientDocDetails({ doc, map = true }: { doc: ClientDocument; map?: boolean }) {
  const address = linkedAddressText(doc);
  const point = linkedAddressPoint(doc);
  const needsDate = requiresIssueDate(doc.proof_type);
  return (
    <div className="flex flex-col gap-2.5">
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px]">
        <dt className="text-muted">Tipo</dt>
        <dd className="flex items-center gap-1.5 font-semibold text-navy">
          <FileText size={14} className="shrink-0 text-primary" />
          {proofTypeLabel(doc.proof_type)}
        </dd>
        <dt className="text-muted">Emitido</dt>
        <dd className="text-navy">
          {!needsDate
            ? 'No aplica (INE)'
            : doc.issued_on
              ? issuedOn(doc.issued_on)
              : 'Sin fecha'}
        </dd>
      </dl>
      <div className="rounded-btn border border-line bg-panel px-3 py-2">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="font-mono text-[10.5px] uppercase tracking-wide text-muted">
            Dirección registrada
          </span>
          {doc.address_label && <Badge tone="neutral">{doc.address_label}</Badge>}
        </div>
        {address ? (
          <p className="flex items-start gap-1.5 text-[12.5px] text-navy">
            <MapPin size={13} className="mt-0.5 shrink-0 text-primary" />
            <span className="min-w-0 break-words">{address}</span>
          </p>
        ) : (
          <p className="text-[12.5px] text-muted">
            Sin dirección vinculada: compara con las direcciones del perfil.
          </p>
        )}
        {address && (
          <p className="mt-1 text-[11.5px] text-faint">
            Debe coincidir con el domicilio que muestra el documento.
          </p>
        )}
      </div>
      {map && point && <RequestMap center={point} label={address ?? undefined} height={150} />}
    </div>
  );
}

/** Ver archivo + Aprobar / Rechazar (motivo obligatorio). Requiere permiso kyc. */
export function ClientDocActions({
  doc,
  who,
  showReview = true,
}: {
  doc: ClientDocument;
  who: string;
  showReview?: boolean;
}) {
  const { busy, run } = useAction();
  const canKyc = useAuth().can('kyc');
  const [opening, setOpening] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  async function open() {
    setOpening(true);
    const url = await getClientDocumentUrl(doc);
    setOpening(false);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }
  async function reject() {
    if (!rejectionNotes(reason)) return;
    const ok = await run(
      'reject',
      () => reviewClientDocument(doc.id, false, reason),
      `Comprobante rechazado · ${who}`,
    );
    if (ok) {
      setRejecting(false);
      setReason('');
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" icon={ExternalLink} loading={opening} onClick={() => void open()}>
          Ver archivo
        </Button>
        {showReview && doc.review_status !== 'approved' && (
          <Button
            variant="approve"
            icon={Check}
            loading={busy === 'approve'}
            disabled={!!busy || !canKyc}
            title={canKyc ? undefined : 'Tu rol no revisa KYC'}
            onClick={() =>
              void run(
                'approve',
                () => reviewClientDocument(doc.id, true),
                `Comprobante aprobado · ${who}`,
              )
            }
          >
            Aprobar
          </Button>
        )}
        {showReview && doc.review_status !== 'rejected' && (
          <Button
            variant="destructive"
            icon={X}
            disabled={!!busy || !canKyc}
            title={canKyc ? undefined : 'Tu rol no revisa KYC'}
            onClick={() => setRejecting(true)}
          >
            Rechazar
          </Button>
        )}
      </div>
      <Modal
        open={rejecting}
        onClose={() => setRejecting(false)}
        dismissible={busy !== 'reject'}
        title={`Rechazar comprobante de ${who}`}
        description="El cliente verá el motivo y podrá volver a subir su comprobante."
        icon={X}
        tone="danger"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setRejecting(false)}
              disabled={busy === 'reject'}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              loading={busy === 'reject'}
              disabled={!rejectionNotes(reason)}
              onClick={() => void reject()}
            >
              Rechazar
            </Button>
          </>
        }
      >
        <div className="mb-3 flex flex-wrap gap-2">
          {CLIENT_DOC_REJECT_REASONS.map(r => (
            <Chip key={r} active={reason.trim() === r} onClick={() => setReason(r)}>
              {r}
            </Chip>
          ))}
        </div>
        <Textarea
          rows={3}
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Motivo (obligatorio): elige uno arriba o escríbelo"
        />
      </Modal>
    </>
  );
}

/** Tarjeta del comprobante de domicilio en el perfil del cliente. */
export function ClientDocCard({ clientId, name }: { clientId: string; name: string }) {
  useExtras(s => s.clientDocs); // re-render al revisar
  const unavailable = useExtras(s => s.unavailable.clientDocs);
  const doc = getClientDocument(clientId);
  const st = CLIENT_DOC_STATUS[clientDocStatus(doc)];
  return (
    <Card padded className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <Kicker>{CLIENT_DOC_LABEL}</Kicker>
        {unavailable ? (
          <Badge tone="neutral">No disponible</Badge>
        ) : (
          <Badge tone={st.tone} dot>
            {st.label}
          </Badge>
        )}
      </div>
      {!doc ? (
        <p className="text-[13px] text-muted">
          {unavailable
            ? 'No se pudo leer la tabla de comprobantes.'
            : 'El cliente aún no sube su comprobante de domicilio.'}
        </p>
      ) : (
        <>
          <ClientDocDetails doc={doc} />
          <OcrSummary data={doc.ocr_data} />
          {doc.review_status === 'rejected' && doc.review_notes && (
            <p className="rounded-btn bg-error-soft px-3 py-2 text-[12.5px] text-error">
              Motivo: {doc.review_notes}
            </p>
          )}
          <ClientDocActions doc={doc} who={name} />
        </>
      )}
    </Card>
  );
}
