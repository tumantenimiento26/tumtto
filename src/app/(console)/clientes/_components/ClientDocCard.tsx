'use client';

import { useState } from 'react';
import { Check, ExternalLink, FileText, X } from 'lucide-react';
import { Badge, Button, Card, Kicker, Modal, Textarea } from '@/components/ds';
import { useAction } from '@/components/use-action';
import { useAuth } from '@/lib/auth';
import { fmtDate } from '@/lib/dates';
import {
  CLIENT_DOC_LABEL,
  CLIENT_DOC_STATUS,
  clientDocStatus,
  rejectionNotes,
} from '@/lib/clientDocs';
import {
  getClientDocument,
  getClientDocumentUrl,
  reviewClientDocument,
  useExtras,
  type ClientDocument,
} from '@/lib/data/store';

export const issuedOn = (d: string) =>
  fmtDate(`${d}T12:00:00`, { day: '2-digit', month: 'short', year: 'numeric' });

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
        <Textarea
          rows={3}
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Motivo (obligatorio): ilegible, más de 3 meses, no coincide la dirección…"
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
          <div className="flex items-center gap-2 text-[13px] text-navy">
            <FileText size={14} className="text-primary" />
            Emitido el {issuedOn(doc.issued_on)}
          </div>
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
