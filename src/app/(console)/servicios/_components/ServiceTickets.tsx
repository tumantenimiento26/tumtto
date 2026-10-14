'use client';
import { useMemo, useState } from 'react';
import { Download, ExternalLink, Eye, Receipt } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Kicker, Modal, Segmented, Skeleton, toast } from '@/components/ds';
import { serviceTicketUrl } from '@/lib/data/serviceTickets';
import { agoLabel } from '@/lib/assignments';
import {
  TICKET_COPIES,
  parseSnapshot,
  ticketFileName,
  ticketLines,
  versionLabel,
  type ServiceTicket,
  type TicketCopy,
} from '@/lib/ticket';

/** Papel térmico 58 mm: 32 columnas en monoespaciado, igual que el ticket impreso. */
function Paper({ ticket, copy }: { ticket: ServiceTicket; copy: TicketCopy }) {
  const snap = useMemo(() => parseSnapshot(ticket.snapshot), [ticket.snapshot]);
  if (!snap) return <p className="text-[12.5px] text-muted">Este ticket no trae datos para la vista previa; abre el PDF.</p>;
  return (
    <div
      className="mx-auto w-[calc(32ch+2.5rem)] max-w-full overflow-x-auto bg-white px-5 py-4 font-mono text-[12.5px] leading-[1.45] text-zinc-800 shadow-card-soft"
      style={{ clipPath: 'polygon(0 0,100% 0,100% calc(100% - 6px),97% 100%,94% calc(100% - 6px),91% 100%,88% calc(100% - 6px),85% 100%,82% calc(100% - 6px),79% 100%,76% calc(100% - 6px),73% 100%,70% calc(100% - 6px),67% 100%,64% calc(100% - 6px),61% 100%,58% calc(100% - 6px),55% 100%,52% calc(100% - 6px),49% 100%,46% calc(100% - 6px),43% 100%,40% calc(100% - 6px),37% 100%,34% calc(100% - 6px),31% 100%,28% calc(100% - 6px),25% 100%,22% calc(100% - 6px),19% 100%,16% calc(100% - 6px),13% 100%,10% calc(100% - 6px),7% 100%,4% calc(100% - 6px),1% 100%,0 calc(100% - 6px))', paddingBottom: '1.5rem' }}
      role="img"
      aria-label={`Vista previa del ticket, ${TICKET_COPIES.find(c => c.key === copy)?.label}`}
    >
      {ticketLines(snap, copy).map((l, i) => (
        <div
          key={i}
          className={`whitespace-pre ${l.bold ? 'font-bold' : ''} ${l.big ? 'text-[1.6em] leading-tight' : ''}`}
        >
          {l.text || ' '}
        </div>
      ))}
    </div>
  );
}

/** «Tickets»: versiones del ticket de cierre guardadas en la orden (solo lectura). `items === null` = cargando. */
export function ServiceTickets({
  items,
  error,
  onRetry,
}: {
  items: ServiceTicket[] | null;
  error: boolean;
  onRetry: () => void;
}) {
  const [sel, setSel] = useState<string | null>(null);
  const [copy, setCopy] = useState<TicketCopy>('cliente');
  const [busy, setBusy] = useState<string | null>(null);
  const [viewer, setViewer] = useState<{ url: string; title: string } | null>(null);

  const current = items?.find(t => t.id === sel) ?? items?.[0] ?? null;
  const folio = (t: ServiceTicket) => parseSnapshot(t.snapshot)?.folio ?? 'servicio';

  async function view(t: ServiceTicket) {
    setBusy(`v${t.id}`);
    const url = await serviceTicketUrl(t);
    setBusy(null);
    if (!url) return toast.error('No se pudo abrir el PDF', 'Reintenta en un momento.');
    setViewer({ url, title: `Ticket ${folio(t)} · v${t.version}` });
  }
  async function download(t: ServiceTicket) {
    const name = ticketFileName(folio(t), t.version);
    setBusy(`d${t.id}`);
    const url = await serviceTicketUrl(t, name);
    setBusy(null);
    if (!url) return toast.error('No se pudo descargar el PDF', 'Reintenta en un momento.');
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <Card padded>
      <div className="mb-3 flex items-center justify-between">
        <Kicker>Tickets</Kicker>
        {items && items.length > 0 && <Badge tone="success">{items.length === 1 ? '1 versión' : `${items.length} versiones`}</Badge>}
      </div>

      {error ? (
        <div className="flex items-center justify-between gap-3 text-[13px]">
          <span className="text-error">No pudimos cargar los tickets.</span>
          <Button size="sm" variant="ghost" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      ) : items === null ? (
        <Skeleton className="h-24 w-full" />
      ) : items.length === 0 ? (
        <EmptyState
          compact
          icon={Receipt}
          title="Sin tickets"
          description="El técnico genera el ticket de cierre al terminar el servicio; aparecerá aquí."
        />
      ) : (
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col gap-2">
            {items.map(t => {
              const on = t.id === current?.id;
              return (
                <li
                  key={t.id}
                  className={`flex flex-wrap items-center gap-2 rounded-btn border px-3 py-2 ${on ? 'border-primary bg-panel' : 'border-line'}`}
                >
                  <button
                    type="button"
                    onClick={() => setSel(t.id)}
                    aria-pressed={on}
                    className="min-w-0 flex-1 text-left text-[13px] font-semibold text-navy"
                  >
                    {versionLabel(t, agoLabel)}
                  </button>
                  <Button size="sm" variant="ghost" icon={Eye} loading={busy === `v${t.id}`} onClick={() => void view(t)}>
                    Ver PDF
                  </Button>
                  <Button size="sm" variant="ghost" icon={Download} loading={busy === `d${t.id}`} onClick={() => void download(t)}>
                    Descargar
                  </Button>
                </li>
              );
            })}
          </ul>

          {current && (
            <div className="flex flex-col items-center gap-3 rounded-btn bg-panel p-3">
              <Segmented
                size="sm"
                aria-label="Copia del ticket"
                value={copy}
                onChange={setCopy}
                options={TICKET_COPIES.map(c => ({ value: c.key, label: c.tab }))}
              />
              <Paper ticket={current} copy={copy} />
              <p className="text-[11.5px] text-muted">Vista previa de v{current.version} desde los datos guardados.</p>
            </div>
          )}
        </div>
      )}

      <Modal
        open={viewer !== null}
        onClose={() => setViewer(null)}
        title={viewer?.title ?? 'Ticket'}
        icon={Receipt}
        width={640}
        footer={
          viewer && (
            <a href={viewer.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary">
              <ExternalLink size={14} aria-hidden /> Abrir en pestaña nueva
            </a>
          )
        }
      >
        {viewer && <iframe src={viewer.url} title={viewer.title} className="h-[480px] w-full rounded-xl border border-line bg-panel" />}
      </Modal>
    </Card>
  );
}
