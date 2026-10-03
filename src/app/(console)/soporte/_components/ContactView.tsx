'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  ArrowLeft,
  Check,
  Mail,
  MessageCircle,
  Phone,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  Input,
  Kicker,
  Sheet,
  Textarea,
  toast,
  type Tone,
} from '@/components/ds';
import { useAction } from '@/components/use-action';
import { useAuth } from '@/lib/auth';
import { timeAgo } from '@/lib/data/notifications';
import {
  loadContactMessages,
  updateContactMessage,
  useContact,
} from '@/lib/data/contactStore';
import { formatPhone } from '@/lib/phone';
import { CONTACT_TYPES } from '@/lib/contactForm';
import {
  CONTACT_STATUS_LABEL,
  CONTACT_TYPE_LABEL,
  NO_CONTACT_FILTERS,
  activeContactFilters,
  emailStatusLabel,
  excerpt,
  filterContacts,
  replyLinks,
  type ContactFilters,
  type ContactMessage,
  type ContactStatus,
} from '@/lib/contactAdmin';

const STATUS_TONE: Record<ContactStatus, Tone> = {
  new: 'danger',
  handled: 'success',
  archived: 'neutral',
};
const EMAIL_TONE: Record<string, Tone> = {
  sent: 'success',
  failed: 'danger',
  skipped: 'neutral',
};

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/** Soporte › Contacto: mensajes del formulario público del landing. */
export function ContactView({ initialId }: { initialId?: string | null }) {
  const messages = useContact(s => s.messages);
  const loaded = useContact(s => s.loaded);
  const failed = useContact(s => s.failed);
  const [filters, setFilters] = useState<ContactFilters>(NO_CONTACT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(initialId ?? null);

  useEffect(() => {
    void loadContactMessages();
  }, []);

  const list = useMemo(() => filterContacts(messages, filters), [messages, filters]);
  const current = messages.find(m => m.id === selected) ?? null;
  const nActive = activeContactFilters(filters);

  return (
    <div className="grid grid-cols-1 items-start gap-3.5 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
      <div className={`flex flex-col gap-3 ${current ? 'hidden lg:flex' : ''}`}>
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <Input
              icon={Search}
              value={filters.query}
              onChange={e => setFilters(f => ({ ...f, query: e.target.value }))}
              placeholder="Buscar por nombre, correo o mensaje…"
              aria-label="Buscar mensajes de contacto"
            />
          </div>
          <Button
            variant="secondary"
            icon={SlidersHorizontal}
            onClick={() => setFiltersOpen(true)}
            aria-label="Filtros"
          >
            Filtros{nActive ? ` · ${nActive}` : ''}
          </Button>
        </div>

        {failed ? (
          <Card padded>
            <EmptyState
              kind="no-results"
              title="No se pudieron cargar los mensajes"
              description="Revisa tu permiso de Soporte o reintenta en un momento."
            />
          </Card>
        ) : !loaded ? (
          <Card padded>
            <p className="font-sans text-[13px] text-muted">Cargando mensajes…</p>
          </Card>
        ) : list.length === 0 ? (
          <Card padded>
            <EmptyState
              kind={messages.length ? 'no-results' : 'all-clear'}
              title={messages.length ? 'Sin coincidencias' : 'Sin mensajes de contacto'}
              description={
                messages.length
                  ? 'Ajusta la búsqueda o los filtros.'
                  : 'Lo que escriban desde el formulario del sitio aparecerá aquí.'
              }
            />
          </Card>
        ) : (
          list.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelected(m.id)}
              className={`rounded-box border bg-card p-4 text-left transition-[border-color,box-shadow] hover:shadow-kpi ${
                m.id === selected ? 'border-primary shadow-focus' : 'border-line'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-primary">
                  {CONTACT_TYPE_LABEL[m.contact_type]}
                </span>
                <Badge tone={STATUS_TONE[m.status]}>{CONTACT_STATUS_LABEL[m.status]}</Badge>
              </div>
              <div className="mt-1.5 font-display text-[15px] font-bold text-navy">
                {m.name}
              </div>
              <div className="mt-0.5 break-words font-sans text-[12.5px] text-muted">
                {m.email} · {formatPhone(`+52${m.phone}`)}
              </div>
              <p className="mt-2 line-clamp-2 font-sans text-[13px] text-body">
                {excerpt(m.message, 140)}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 font-sans text-[11.5px] text-faint">
                <span>{timeAgo(m.created_at)}</span>
                <Badge tone={EMAIL_TONE[m.email_status ?? ''] ?? 'neutral'}>
                  {emailStatusLabel(m.email_status)}
                </Badge>
              </div>
            </button>
          ))
        )}
      </div>

      {current ? (
        <ContactDetail key={current.id} message={current} onBack={() => setSelected(null)} />
      ) : (
        <Card padded className="hidden lg:block">
          <EmptyState
            kind="action"
            title="Selecciona un mensaje"
            description="Lee el mensaje completo, responde y márcalo como atendido."
          />
        </Card>
      )}

      <FiltersSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={filters}
        onApply={f => setFilters(f)}
        count={d => filterContacts(messages, d).length}
      />
    </div>
  );
}

function FiltersSheet({
  open,
  onClose,
  value,
  onApply,
  count,
}: {
  open: boolean;
  onClose: () => void;
  value: ContactFilters;
  onApply: (f: ContactFilters) => void;
  count: (f: ContactFilters) => number;
}) {
  const [d, setD] = useState(value);
  useEffect(() => {
    if (open) setD(value);
  }, [open, value]);
  return (
    <Sheet
      open={open}
      onClose={onClose}
      width={400}
      kicker="Contacto"
      title="Filtros"
      footer={
        <div className="flex w-full gap-2.5">
          <Button
            variant="secondary"
            onClick={() => {
              onApply({ ...NO_CONTACT_FILTERS, query: value.query });
              onClose();
            }}
          >
            Limpiar
          </Button>
          <Button
            full
            onClick={() => {
              onApply(d);
              onClose();
            }}
          >
            Mostrar {count(d)} mensajes
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <section>
          <Kicker className="mb-2.5">Tipo</Kicker>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Tipo de contacto">
            <Chip active={d.type === 'todos'} onClick={() => setD(s => ({ ...s, type: 'todos' }))}>
              Todos
            </Chip>
            {CONTACT_TYPES.map(t => (
              <Chip
                key={t.value}
                active={d.type === t.value}
                onClick={() => setD(s => ({ ...s, type: t.value }))}
              >
                {t.label}
              </Chip>
            ))}
          </div>
        </section>
        <section>
          <Kicker className="mb-2.5">Estado</Kicker>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Estado">
            <Chip active={d.status === 'todos'} onClick={() => setD(s => ({ ...s, status: 'todos' }))}>
              Todos
            </Chip>
            {(Object.keys(CONTACT_STATUS_LABEL) as ContactStatus[]).map(st => (
              <Chip
                key={st}
                active={d.status === st}
                onClick={() => setD(s => ({ ...s, status: st }))}
              >
                {CONTACT_STATUS_LABEL[st]}
              </Chip>
            ))}
          </div>
        </section>
      </div>
    </Sheet>
  );
}

function ContactDetail({
  message: m,
  onBack,
}: {
  message: ContactMessage;
  onBack: () => void;
}) {
  const [note, setNote] = useState(m.admin_note ?? '');
  const { busy, run } = useAction();
  const { can } = useAuth();
  const canSupport = can('soporte');
  const links = replyLinks(m);

  const change = (status: ContactStatus, done: string) =>
    void run(
      status,
      async () => {
        try {
          return await updateContactMessage(m.id, status, note);
        } catch {
          toast.error('No se pudo actualizar el mensaje', 'Inténtalo de nuevo.');
          return null;
        }
      },
      done,
    );

  const linkCls =
    'inline-flex h-9 items-center gap-1.5 rounded-btn border border-line bg-card px-3 font-sans text-[13px] font-semibold text-navy transition-colors hover:bg-panel';

  return (
    <Card padded className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver a la lista"
          className="-ml-1 grid h-8 w-8 place-items-center rounded-btn text-muted hover:bg-panel lg:hidden"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <Kicker tone="primary">{CONTACT_TYPE_LABEL[m.contact_type]}</Kicker>
          <h2 className="mt-1 break-words font-display text-[19px] font-extrabold text-navy">
            {m.name}
          </h2>
          <p className="mt-0.5 font-sans text-[12.5px] text-muted">
            Recibido {dateTime(m.created_at)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge tone={STATUS_TONE[m.status]}>{CONTACT_STATUS_LABEL[m.status]}</Badge>
          <Badge tone={EMAIL_TONE[m.email_status ?? ''] ?? 'neutral'}>
            {emailStatusLabel(m.email_status)}
          </Badge>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-3 rounded-box border border-line bg-panel px-4 py-3 sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">Correo</dt>
          <dd className="break-words font-sans text-[13.5px] text-navy">{m.email}</dd>
        </div>
        <div className="min-w-0">
          <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">Teléfono</dt>
          <dd className="font-sans text-[13.5px] text-navy">{formatPhone(`+52${m.phone}`)}</dd>
        </div>
      </dl>

      <div>
        <Kicker className="mb-2">Mensaje</Kicker>
        <p className="whitespace-pre-wrap break-words font-sans text-[14px] leading-[1.6] text-body">
          {m.message}
        </p>
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Responder">
        {links.whatsapp && (
          <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className={linkCls}>
            <MessageCircle size={15} /> WhatsApp
          </a>
        )}
        {links.mail && (
          <a href={links.mail} className={linkCls}>
            <Mail size={15} /> Correo
          </a>
        )}
        {links.tel && (
          <a href={links.tel} className={linkCls}>
            <Phone size={15} /> Llamar
          </a>
        )}
      </div>

      {m.status !== 'new' && m.handled_at && (
        <p className="font-sans text-[12.5px] text-muted">
          {CONTACT_STATUS_LABEL[m.status]} {dateTime(m.handled_at)}
        </p>
      )}

      <div className="flex flex-col gap-3 border-t border-divider pt-5">
        <Kicker>Nota interna</Kicker>
        <Textarea
          rows={3}
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Qué se respondió o por qué se archiva (opcional)"
          aria-label="Nota interna"
        />
        <div className="flex flex-wrap justify-end gap-2">
          {m.status !== 'new' && (
            <Button
              variant="secondary"
              icon={RotateCcw}
              disabled={!!busy || !canSupport}
              loading={busy === 'new'}
              onClick={() => change('new', 'Mensaje reabierto')}
            >
              Reabrir
            </Button>
          )}
          {m.status !== 'archived' && (
            <Button
              variant="secondary"
              icon={Archive}
              disabled={!!busy || !canSupport}
              loading={busy === 'archived'}
              onClick={() => change('archived', 'Mensaje archivado')}
            >
              Archivar
            </Button>
          )}
          {m.status !== 'handled' && (
            <Button
              variant="approve"
              icon={Check}
              disabled={!!busy || !canSupport}
              title={canSupport ? undefined : 'Tu rol no atiende contactos'}
              loading={busy === 'handled'}
              onClick={() => change('handled', 'Marcado como atendido')}
            >
              Marcar atendido
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
