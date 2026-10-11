'use client';
import { useState } from 'react';
import { ExternalLink, FileText, Paperclip } from 'lucide-react';
import { Card, EmptyState, Modal, toast } from '@/components/ds';
import { UserIcon } from '@/components/profile-icon';
import { getOrderQuotes, getProfile, getQuoteAttachmentUrl } from '@/lib/data/store';
import { fmtDateTime } from '@/lib/dates';
import {
  attachmentsTitle,
  formatBytes,
  isPreviewable,
  mimeLabel,
  splitByQuote,
  type QuoteAttachment,
} from '@/lib/quoteAttachments';

/** Anexos de la cotización (solo lectura). `items === null` = cargando. */
export function QuoteAttachments({
  orderId,
  items,
  error,
}: {
  orderId: string;
  items: QuoteAttachment[] | null;
  error: boolean;
}) {
  const [lightbox, setLightbox] = useState<QuoteAttachment | null>(null);
  const [opening, setOpening] = useState<string | null>(null);

  const quotes = getOrderQuotes(orderId);
  const { current, older } = splitByQuote(items ?? [], quotes[0]?.id ?? null);

  const renderList = (files: QuoteAttachment[]) => (
        <ul className="flex flex-col gap-2.5">
          {files.map(a => {
            const img = isPreviewable(a.mime_type) && a.url;
            const uploader = a.uploaded_by ? getProfile(a.uploaded_by) : null;
            return (
              <li
                key={a.id}
                className="flex flex-wrap items-center gap-3 rounded-box border border-line bg-panel p-3"
              >
                {img ? (
                  <button
                    type="button"
                    onClick={() => setLightbox(a)}
                    aria-label={`Ver ${a.file_name}`}
                    className="relative block h-16 w-20 shrink-0 overflow-hidden rounded-btn border border-line bg-surface"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.url ?? ''} alt={a.file_name} className="h-full w-full object-cover" />
                  </button>
                ) : (
                  <span className="grid h-16 w-20 shrink-0 place-items-center rounded-btn border border-line bg-surface text-muted">
                    <FileText size={24} />
                  </span>
                )}
                <div className="min-w-0 flex-1 basis-48">
                  <div className="truncate font-display text-[13.5px] font-bold text-navy" title={a.file_name}>
                    {a.file_name}
                  </div>
                  <div className="font-mono text-[11.5px] text-muted">
                    {mimeLabel(a.mime_type)} · {formatBytes(a.size_bytes)} ·{' '}
                    {fmtDateTime(a.created_at, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-muted">
                    {a.uploaded_by && uploader && <UserIcon userId={a.uploaded_by} size={16} />}
                    <span className="truncate">Subido por {uploader?.full_name ?? 'usuario desconocido'}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => (img ? setLightbox(a) : void openFile(a))}
                  disabled={opening === a.id}
                  className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline disabled:opacity-60"
                >
                  {img ? 'Ver' : opening === a.id ? 'Abriendo…' : 'Abrir'} <ExternalLink size={13} />
                </button>
              </li>
            );
          })}
        </ul>
  );

  async function openFile(a: QuoteAttachment) {
    setOpening(a.id);
    try {
      const url = await getQuoteAttachmentUrl(a);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
      else toast.error('No se pudo abrir el anexo');
    } finally {
      setOpening(null);
    }
  }

  return (
    <Card padded>
      <div className="mb-3 flex items-center gap-2">
        <Paperclip size={15} className="text-muted" />
        <h2 className="font-display text-[16px] font-bold text-navy">
          {attachmentsTitle(current.length)}
        </h2>
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
          Cotización · solo lectura
        </span>
      </div>
      {error ? (
        <p className="text-[12.5px] text-error">No pudimos cargar los anexos de la cotización.</p>
      ) : items === null ? (
        <p className="text-[13px] text-muted">Cargando anexos…</p>
      ) : items.length === 0 ? (
        <EmptyState compact kind="first-use" title="El técnico no adjuntó anexos a la cotización" />
      ) : (
        <>
          {current.length === 0 ? (
            <EmptyState compact kind="first-use" title="La cotización vigente no tiene anexos" />
          ) : (
            renderList(current)
          )}
          {older.length > 0 && (
            <details className="mt-4 rounded-box border border-line">
              <summary className="cursor-pointer select-none px-3 py-2 font-display text-[13px] font-bold text-navy">
                Cotizaciones anteriores ({older.length})
              </summary>
              <div className="flex flex-col gap-4 px-3 pb-3">
                {older.map(o => {
                  const q = quotes.find(x => x.id === o.quoteId);
                  return (
                    <div key={o.quoteId}>
                      <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
                        {q
                          ? `Enviada ${fmtDateTime(q.created_at, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
                          : 'Cotización anterior'}{' '}
                        · {o.files.length} {o.files.length === 1 ? 'anexo' : 'anexos'}
                      </div>
                      {renderList(o.files)}
                    </div>
                  );
                })}
              </div>
            </details>
          )}
        </>
      )}
      <Modal
        open={!!lightbox}
        onClose={() => setLightbox(null)}
        title={lightbox?.file_name ?? 'Anexo'}
        width={760}
        footer={
          lightbox && (
            <button
              type="button"
              onClick={() => void openFile(lightbox)}
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline"
            >
              Abrir / descargar <ExternalLink size={13} />
            </button>
          )
        }
      >
        {lightbox?.url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={lightbox.url} alt={lightbox.file_name} className="max-h-[70vh] w-full rounded-box object-contain" />
        )}
      </Modal>
    </Card>
  );
}
